import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

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
 *
 * Con `npm run dev` abierto, al agregar, cambiar o borrar un archivo la página se recarga sola.
 */

/** Cada colección: su carpeta dentro de public/media y el nombre de sus subcarpetas (paso-01, creador-03…) */
const COLECCIONES = {
  pasos: /^paso-(\d+)$/i,
  creadores: /^creador-(\d+)$/i,
  objetos: /^objeto-(\d+)$/i,
} as const

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
}

/** Lado mayor de las miniaturas, en píxeles */
const LADO_MINIATURA = 640

/**
 * Crea (o actualiza, si la foto es más nueva) la miniatura de una foto. Devuelve false si no se pudo
 * (p. ej. si sharp no está instalado): en ese caso el sitio usa la foto grande.
 */
async function crearMiniatura(origen: string, destino: string): Promise<boolean> {
  try {
    if (fs.existsSync(destino) && fs.statSync(destino).mtimeMs >= fs.statSync(origen).mtimeMs) return true
    const { default: sharp } = await import('sharp')
    fs.mkdirSync(path.dirname(destino), { recursive: true })
    await sharp(origen)
      .rotate() // respeta la orientación con que se tomó la foto
      .resize({ width: LADO_MINIATURA, height: LADO_MINIATURA, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 72, mozjpeg: true })
      .toFile(destino)
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
    const item: Fotos = {
      principal: principal ? url(principal) : null,
      otras: archivos.filter((a) => a !== principal).map(url),
      modelo: modelo ? url(modelo) : null,
      modeloTarjeta: tarjeta ? url(tarjeta) : null,
      miniatura: null,
    }
    fotos[Number(coincide[1])] = item

    // La miniatura: public/media/miniaturas/pasos/paso-03.jpg
    if (principal) {
      const origen = path.join(dir, principal)
      const destino = path.join(media, 'miniaturas', coleccion, `${sub.name}.jpg`)
      pendientes.push(
        crearMiniatura(origen, destino).then((ok) => {
          if (!ok) return
          const version = Math.round(fs.statSync(destino).mtimeMs).toString(36)
          item.miniatura = `/media/miniaturas/${coleccion}/${sub.name}.jpg?v=${version}`
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
  return {
    name: 'fotos-locales',
    configResolved(config) {
      media = path.join(config.publicDir, 'media')
    },
    resolveId(id) {
      return coleccionDe(id) && !id.startsWith('\0') ? '\0' + id : undefined
    },
    async load(id) {
      const coleccion = id.startsWith('\0') ? coleccionDe(id) : null
      return coleccion ? `export default ${JSON.stringify(await leerFotos(media, coleccion))}` : undefined
    },
    configureServer(server) {
      for (const coleccion of Object.keys(COLECCIONES)) server.watcher.add(path.join(media, coleccion))

      const alCambiar = (archivo: string) => {
        const relativa = path.relative(media, archivo)
        if (relativa.startsWith('..') || path.isAbsolute(relativa)) return
        const coleccion = relativa.split(path.sep)[0]
        if (!(coleccion in COLECCIONES)) return
        const modulo = server.moduleGraph.getModuleById('\0' + PREFIJO + coleccion)
        if (!modulo) return
        server.moduleGraph.invalidateModule(modulo)
        server.ws.send({ type: 'full-reload' })
      }
      for (const evento of ['add', 'change', 'unlink', 'addDir', 'unlinkDir'] as const) server.watcher.on(evento, alCambiar)
    },
  }
}
