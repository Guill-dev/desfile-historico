import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

/**
 * FOTOS DE LOS PASOS Y DE LOS CREADORES — el sitio las encuentra solo.
 *
 * Lee las carpetas numeradas de cada colección y le entrega al sitio, por cada número:
 *   - principal: la foto que se llama "principal" (principal.jpg, Principal.PNG…) → va en la tarjeta (la portada)
 *   - otras: el resto de fotos de la carpeta, en orden por nombre → para verlo a fondo
 *
 *   public/media/pasos/paso-01 … paso-79           → import fotos from 'virtual:fotos-pasos'      (src/data/pasos.ts)
 *   public/media/creadores/creador-01 … creador-06 → import fotos from 'virtual:fotos-creadores'  (src/data/creadores.ts)
 *
 * Con `npm run dev` abierto, al agregar, cambiar o borrar una foto la página se recarga sola.
 */

/** Cada colección: su carpeta dentro de public/media y el nombre de sus subcarpetas (paso-01, creador-03…) */
const COLECCIONES = {
  pasos: /^paso-(\d+)$/i,
  creadores: /^creador-(\d+)$/i,
} as const

type Coleccion = keyof typeof COLECCIONES

const IMAGEN = /\.(jpe?g|png|webp|avif|gif)$/i
const PREFIJO = 'virtual:fotos-'

interface Fotos {
  principal: string | null
  otras: string[]
}

function leerFotos(carpeta: string, coleccion: Coleccion): Record<number, Fotos> {
  const fotos: Record<number, Fotos> = {}
  if (!fs.existsSync(carpeta)) return fotos

  for (const sub of fs.readdirSync(carpeta, { withFileTypes: true })) {
    const coincide = sub.isDirectory() ? COLECCIONES[coleccion].exec(sub.name) : null
    if (!coincide) continue

    const dir = path.join(carpeta, sub.name)
    const archivos = fs
      .readdirSync(dir)
      .filter((a) => IMAGEN.test(a))
      .sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))
    if (archivos.length === 0) continue

    // ?v= cambia si se reemplaza la foto por otra con el mismo nombre (así nadie ve la vieja guardada)
    const url = (archivo: string) => {
      const version = Math.round(fs.statSync(path.join(dir, archivo)).mtimeMs).toString(36)
      return `/media/${coleccion}/${sub.name}/${encodeURIComponent(archivo)}?v=${version}`
    }
    const principal = archivos.find((a) => /^principal\./i.test(a))
    fotos[Number(coincide[1])] = {
      principal: principal ? url(principal) : null,
      otras: archivos.filter((a) => a !== principal).map(url),
    }
  }
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
    load(id) {
      const coleccion = id.startsWith('\0') ? coleccionDe(id) : null
      return coleccion ? `export default ${JSON.stringify(leerFotos(path.join(media, coleccion), coleccion))}` : undefined
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
