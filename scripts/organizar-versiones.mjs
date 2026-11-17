/**
 * ORGANIZA LAS FOTOS DE CADA AÑO DEL DESFILE (public/media/versiones/<año>/)
 *
 * Lo usan `npm run versiones` (scripts/preparar-versiones.mjs) y el sitio mismo (vite-fotos.ts): con
 * `npm run dev` abierto, una foto que se suelta en la carpeta de un año se organiza sola.
 *
 * Por cada foto nueva (cualquier nombre que no sea AAAA-NN.jpg):
 *   - deja una copia liviana para la web (máximo 1600 px, JPG) con el siguiente número: 2025-69.jpg…
 *   - guarda la original, tal cual, en originales/versiones/<año>/ (respaldo, fuera del sitio)
 * Lo que no es una foto (carpetas "…_files" de una página guardada de Facebook, .html, scripts…) se mueve a
 * originales/versiones/<año>/otros/: dentro de public/ se publicaría con el sitio.
 *
 * Cuidados:
 *   - Una foto que se está copiando todavía (su tamaño cambia o se acaba de modificar) se deja para la próxima.
 *   - Un candado (.organizando) evita que dos programas a la vez (p. ej. dos `npm run dev`) organicen la misma foto.
 */
import fs from 'node:fs'
import path from 'node:path'

const FOTO = /\.(jpe?g|png|webp|avif|heic|heif|tiff?)$/i
const LADO_MAXIMO = 1600
/** Una foto modificada hace menos de esto puede estar copiándose todavía */
const RECIENTE_MS = 1500
/** Un candado más viejo que esto quedó de un programa que se cerró a mitad: se ignora */
const CANDADO_VENCE_MS = 2 * 60 * 1000

const espera = (ms) => new Promise((r) => setTimeout(r, ms))

/** ¿La foto ya terminó de copiarse? (su tamaño no cambia y no se acaba de modificar) */
async function estable(archivo) {
  try {
    const a = fs.statSync(archivo)
    if (Date.now() - a.mtimeMs < RECIENTE_MS) return false
    await espera(250)
    const b = fs.statSync(archivo)
    return a.size === b.size && a.size > 0
  } catch {
    return false
  }
}

/** Mueve sin pisar: si ya existe uno con ese nombre, le agrega -2, -3… */
function moverSinPisar(origen, carpetaDestino) {
  fs.mkdirSync(carpetaDestino, { recursive: true })
  const { name, ext } = path.parse(origen)
  let destino = path.join(carpetaDestino, name + ext)
  for (let n = 2; fs.existsSync(destino); n++) destino = path.join(carpetaDestino, `${name}-${n}${ext}`)
  fs.renameSync(origen, destino)
  return destino
}

/**
 * @param {{ raiz: string, avisar?: (mensaje: string) => void }} opciones raiz: carpeta del proyecto
 * @returns {Promise<{ organizadas: number, pendientes: number }>} pendientes: fotos que aún se estaban copiando
 */
export async function organizarVersiones({ raiz, avisar = console.log }) {
  const versiones = path.join(raiz, 'public', 'media', 'versiones')
  const originales = path.join(raiz, 'originales', 'versiones')
  let organizadas = 0
  let pendientes = 0
  if (!fs.existsSync(versiones)) return { organizadas, pendientes }

  const anios = fs
    .readdirSync(versiones, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^\d{4}$/.test(d.name))
    .map((d) => d.name)
    .sort()

  for (const anio of anios) {
    const carpeta = path.join(versiones, anio)
    const ordenada = new RegExp(`^${anio}-(\\d{2,3})\\.jpg$`)
    const entradas = fs.readdirSync(carpeta, { withFileTypes: true })
    const nuevas = entradas.filter((e) => e.isFile() && FOTO.test(e.name) && !ordenada.test(e.name)).map((e) => e.name)
    const ajenas = entradas.filter((e) => e.name !== '.gitkeep' && e.name !== '.organizando' && (e.isDirectory() || !FOTO.test(e.name)))
    if (nuevas.length === 0 && ajenas.length === 0) continue

    // El candado: si otro programa está organizando este año, se lo deja terminar
    const candado = path.join(carpeta, '.organizando')
    try {
      fs.writeFileSync(candado, String(process.pid), { flag: 'wx' })
    } catch {
      try {
        if (Date.now() - fs.statSync(candado).mtimeMs < CANDADO_VENCE_MS) continue
        fs.writeFileSync(candado, String(process.pid))
      } catch {
        continue
      }
    }

    try {
      // Lo que no es foto, fuera de public/
      for (const e of ajenas) {
        moverSinPisar(path.join(carpeta, e.name), path.join(originales, anio, 'otros'))
        avisar(`[versiones] ${anio}: "${e.name}" no es una foto; se movió a originales/versiones/${anio}/otros/`)
      }

      const { default: sharp } = await import('sharp')
      const ordenadas = fs.readdirSync(carpeta).map((a) => Number(ordenada.exec(a)?.[1] ?? 0))
      let siguiente = Math.max(0, ...ordenadas) + 1
      let antes = 0
      let despues = 0
      let hechas = 0

      for (const archivo of nuevas.sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))) {
        const origen = path.join(carpeta, archivo)
        if (!(await estable(origen))) {
          pendientes++
          continue
        }
        const nombre = `${anio}-${String(siguiente).padStart(2, '0')}.jpg`
        try {
          await sharp(origen)
            .rotate() // respeta la orientación con que se tomó la foto
            .resize({ width: LADO_MAXIMO, height: LADO_MAXIMO, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80, mozjpeg: true })
            .toFile(path.join(carpeta, nombre))
        } catch (e) {
          avisar(`[versiones] ${anio}: no se pudo leer "${archivo}" (${e.message}); se deja como está`)
          continue
        }
        antes += fs.statSync(origen).size
        despues += fs.statSync(path.join(carpeta, nombre)).size
        moverSinPisar(origen, path.join(originales, anio))
        siguiente++
        hechas++
      }

      if (hechas > 0) {
        const mb = (b) => (b / 1024 / 1024).toFixed(1)
        avisar(`[versiones] ${anio}: ${hechas} fotos organizadas (${mb(antes)} MB → ${mb(despues)} MB); originales en originales/versiones/${anio}/`)
      }
      organizadas += hechas
    } finally {
      fs.rmSync(candado, { force: true })
    }
  }
  return { organizadas, pendientes }
}
