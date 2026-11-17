import fs from 'node:fs'
import path from 'node:path'
import type { Logger, Plugin, ViteDevServer } from 'vite'
import { organizarVersiones } from './scripts/organizar-versiones.mjs'

/**
 * FOTOS (Y MODELOS 3D) DE LOS PASOS, LOS CREADORES Y LOS OBJETOS — el sitio los encuentra solo.
 *
 * Lee las carpetas numeradas de cada colección y le entrega al sitio, por cada número:
 *   - principal: la foto que se llama "principal" (principal.jpg, Principal.PNG…) → va en la tarjeta (la portada)
 *   - otras: el resto de fotos de la carpeta, en orden por nombre → para verlo a fondo
 *   - modelo: el modelo 3D (modelo.glb, o el .glb que haya) → en los objetos, reemplaza a la foto
 *   - modeloTarjeta: tarjeta.glb, la versión liviana del modelo para las tarjetas (ver scripts/preparar-modelo.mjs)
 *   - miniatura: una copia pequeña (640 px, ~50 KB) de la foto principal, para mosaicos como el vitral de los
 *     pasos. Se crea SOLA en public/media/miniaturas/ (con sharp), y se vuelve a crear si se cambia la foto.
 *
 *   public/media/pasos/paso-01 … paso-79           → import fotos from 'virtual:fotos-pasos'      (src/data/pasos.ts)
 *   public/media/creadores/creador-01 … creador-06 → import fotos from 'virtual:fotos-creadores'  (src/data/creadores.ts)
 *   public/media/objetos/objeto-01 … objeto-50     → import fotos from 'virtual:fotos-objetos'    (src/data/objetos.ts)
 *   public/media/versiones/2025, 2024…             → import fotos from 'virtual:fotos-versiones'  (src/data/versiones.ts)
 *
 * Con `npm run dev` abierto, al agregar, cambiar o borrar un archivo la página se recarga sola.
 */

/** Cada colección: su carpeta dentro de public/media y el nombre de sus subcarpetas (paso-01, creador-03…) */
const COLECCIONES = {
  pasos: /^paso-(\d+)$/i,
  creadores: /^creador-(\d+)$/i,
  objetos: /^objeto-(\d+)$/i,
  // Las fotos de cada año del desfile: versiones/2025, versiones/2024… (las organiza `npm run versiones`)
  versiones: /^(\d{4})$/,
} as const

/** Colecciones que se muestran como una sucesión de fotos: llevan miniatura de TODAS sus fotos, no solo de la principal */
const MINIATURAS_DE_TODAS: readonly Coleccion[] = ['versiones']

type Coleccion = keyof typeof COLECCIONES

const IMAGEN = /\.(jpe?g|png|webp|avif|gif)$/i
const MODELO = /\.glb$/i
const TARJETA = /^tarjeta\.glb$/i
const PREFIJO = 'virtual:fotos-'

interface Fotos {
  principal: string | null
  otras: string[]
  modelo: string | null
  modeloTarjeta: string | null
  miniatura: string | null
  /** Todas las fotos, en orden (la principal primero), con su miniatura si la tiene */
  todas: { src: string; miniatura: string | null }[]
}

/** Lado mayor de las miniaturas, en píxeles */
const LADO_MINIATURA = 640

/**
 * Crea (o actualiza, si la foto es más nueva) la miniatura de una foto. Devuelve false si no se pudo
 * (p. ej. si sharp no está instalado): en ese caso el sitio usa la foto grande.
 */
async function crearMiniatura(origen: string, destino: string): Promise<boolean> {
  try {
    // La miniatura lleva la misma fecha que su foto: si no coinciden (la foto cambió, o se renombraron fotos
    // para cambiarles el orden), se vuelve a hacer
    const fecha = fs.statSync(origen).mtime
    if (fs.existsSync(destino) && Math.round(fs.statSync(destino).mtimeMs) === Math.round(fecha.getTime())) return true
    const { default: sharp } = await import('sharp')
    fs.mkdirSync(path.dirname(destino), { recursive: true })
    await sharp(origen)
      .rotate() // respeta la orientación con que se tomó la foto
      .resize({ width: LADO_MINIATURA, height: LADO_MINIATURA, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 72, mozjpeg: true })
      .toFile(destino)
    fs.utimesSync(destino, new Date(), fecha)
    return true
  } catch (e) {
    console.warn(`[fotos] No se pudo crear la miniatura de ${path.basename(path.dirname(origen))}:`, (e as Error).message)
    return false
  }
}

async function leerFotos(media: string, coleccion: Coleccion): Promise<Record<number, Fotos>> {
  const carpeta = path.join(media, coleccion)
  const fotos: Record<number, Fotos> = {}
  if (!fs.existsSync(carpeta)) return fotos
  const pendientes: Promise<void>[] = []

  for (const sub of fs.readdirSync(carpeta, { withFileTypes: true })) {
    const coincide = sub.isDirectory() ? COLECCIONES[coleccion].exec(sub.name) : null
    if (!coincide) continue

    const dir = path.join(carpeta, sub.name)
    const todos = fs.readdirSync(dir).sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))
    const archivos = todos.filter((a) => IMAGEN.test(a))
    const modelos = todos.filter((a) => MODELO.test(a))
    const tarjeta = modelos.find((a) => TARJETA.test(a))
    const modelo = modelos.find((a) => /^modelo\.glb$/i.test(a)) ?? modelos.find((a) => a !== tarjeta)
    if (archivos.length === 0 && !modelo) continue

    // ?v= cambia si se reemplaza la foto por otra con el mismo nombre (así nadie ve la vieja guardada)
    const url = (archivo: string) => {
      const version = Math.round(fs.statSync(path.join(dir, archivo)).mtimeMs).toString(36)
      return `/media/${coleccion}/${sub.name}/${encodeURIComponent(archivo)}?v=${version}`
    }
    const principal = archivos.find((a) => /^principal\./i.test(a))
    const enOrden = principal ? [principal, ...archivos.filter((a) => a !== principal)] : archivos
    const item: Fotos = {
      principal: principal ? url(principal) : null,
      otras: archivos.filter((a) => a !== principal).map(url),
      modelo: modelo ? url(modelo) : null,
      modeloTarjeta: tarjeta ? url(tarjeta) : null,
      miniatura: null,
      todas: enOrden.map((a) => ({ src: url(a), miniatura: null })),
    }
    fotos[Number(coincide[1])] = item

    // Las miniaturas: de la principal (public/media/miniaturas/pasos/paso-03.jpg) o, en las colecciones que
    // muestran una sucesión de fotos, de todas (public/media/miniaturas/versiones/2025/2025-07.jpg)
    const conMiniatura = MINIATURAS_DE_TODAS.includes(coleccion) ? enOrden : principal ? [principal] : []
    // Si se borraron o renombraron fotos, sus miniaturas viejas sobran: se quitan
    if (MINIATURAS_DE_TODAS.includes(coleccion)) {
      const carpetaMini = path.join(media, 'miniaturas', coleccion, sub.name)
      const validas = new Set(enOrden.map((a) => `${path.parse(a).name}.jpg`))
      if (fs.existsSync(carpetaMini)) {
        for (const m of fs.readdirSync(carpetaMini)) if (!validas.has(m)) fs.rmSync(path.join(carpetaMini, m))
      }
    }
    for (const archivo of conMiniatura) {
      const n = enOrden.indexOf(archivo)
      const relativa = MINIATURAS_DE_TODAS.includes(coleccion)
        ? `${coleccion}/${sub.name}/${path.parse(archivo).name}.jpg`
        : `${coleccion}/${sub.name}.jpg`
      const destino = path.join(media, 'miniaturas', ...relativa.split('/'))
      pendientes.push(
        crearMiniatura(path.join(dir, archivo), destino).then((ok) => {
          if (!ok) return
          const version = Math.round(fs.statSync(destino).mtimeMs).toString(36)
          const miniatura = `/media/miniaturas/${relativa}?v=${version}`
          item.todas[n].miniatura = miniatura
          if (archivo === principal) item.miniatura = miniatura
        }),
      )
    }
  }
  await Promise.all(pendientes)
  return fotos
}

/** 'virtual:fotos-pasos' → 'pasos' (o null si no es uno de estos módulos) */
function coleccionDe(id: string): Coleccion | null {
  const nombre = id.startsWith('\0' + PREFIJO) ? id.slice(PREFIJO.length + 1) : id.startsWith(PREFIJO) ? id.slice(PREFIJO.length) : ''
  return nombre in COLECCIONES ? (nombre as Coleccion) : null
}

export function fotosLocales(): Plugin {
  let media = ''
  let raiz = ''
  let logger: Logger | null = null
  let servidor: ViteDevServer | null = null
  /** Colecciones cambiadas que esperan su recarga (se juntan: soltar 40 fotos recarga la página una sola vez) */
  const cambiadas = new Set<string>()
  let reloj: ReturnType<typeof setTimeout> | undefined

  const recargarPronto = (coleccion: string, ms = 700) => {
    cambiadas.add(coleccion)
    clearTimeout(reloj)
    reloj = setTimeout(() => {
      if (!servidor) return
      for (const c of cambiadas) {
        const modulo = servidor.moduleGraph.getModuleById('\0' + PREFIJO + c)
        if (modulo) servidor.moduleGraph.invalidateModule(modulo)
      }
      cambiadas.clear()
      servidor.ws.send({ type: 'full-reload' })
    }, ms)
  }

  return {
    name: 'fotos-locales',
    configResolved(config) {
      media = path.join(config.publicDir, 'media')
      raiz = config.root
      logger = config.logger
    },
    resolveId(id) {
      return coleccionDe(id) && !id.startsWith('\0') ? '\0' + id : undefined
    },
    async load(id) {
      const coleccion = id.startsWith('\0') ? coleccionDe(id) : null
      if (!coleccion) return undefined
      // Las fotos nuevas de cada año se organizan solas (nombre AAAA-NN, copia liviana, original al respaldo)
      if (coleccion === 'versiones') {
        const { pendientes } = await organizarVersiones({ raiz, avisar: (m) => logger?.info(m, { timestamp: true }) })
        // Si alguna se estaba copiando todavía, se vuelve a mirar en un momento
        if (pendientes > 0 && servidor) recargarPronto('versiones', 2500)
      }
      return `export default ${JSON.stringify(await leerFotos(media, coleccion))}`
    },
    configureServer(server) {
      servidor = server
      for (const coleccion of Object.keys(COLECCIONES)) server.watcher.add(path.join(media, coleccion))

      const alCambiar = (archivo: string) => {
        const relativa = path.relative(media, archivo)
        if (relativa.startsWith('..') || path.isAbsolute(relativa)) return
        const coleccion = relativa.split(path.sep)[0]
        // El candado del organizador no cuenta como cambio
        if (!(coleccion in COLECCIONES) || path.basename(archivo) === '.organizando') return
        recargarPronto(coleccion)
      }
      for (const evento of ['add', 'change', 'unlink', 'addDir', 'unlinkDir'] as const) server.watcher.on(evento, alCambiar)
    },
  }
}
