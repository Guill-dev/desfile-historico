/**
 * EL ESCUDO DE GUALMATÁN, GRABADO EN ORO (para la tapa del libro de la colección, ver GUIA)
 *
 * Toma el escudo del municipio de Wikimedia Commons, «Escudo de Gualmatán.svg», de Milenioscuro, con licencia
 * CC BY-SA 3.0 (hay que dar el crédito: está en la página de Créditos), y lo convierte en una imagen dorada
 * con fondo transparente, como grabada en el cuero: lo claro del escudo queda en oro y lo oscuro (las líneas)
 * deja ver el cuero. El oro brilla más arriba que abajo y está un poquito gastado.
 * Esta imagen es una versión modificada del escudo: también queda con licencia CC BY-SA 3.0.
 *
 * La primera vez descarga el escudo en node_modules/.cache/preparar-escudo/.
 * Uso:  npm run escudo   → crea src/assets/escudo-gualmatan-oro.webp
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const RAIZ = path.join(import.meta.dirname, '..')
const CACHE = path.join(RAIZ, 'node_modules', '.cache', 'preparar-escudo')
const ORIGEN = 'https://upload.wikimedia.org/wikipedia/commons/5/57/Escudo_de_Gualmat%C3%A1n.svg'
const SALIDA = path.join(RAIZ, 'src', 'assets', 'escudo-gualmatan-oro.webp')
/** Ancho de la imagen (la tapa la muestra a ~260 px; el doble para pantallas nítidas) */
const ANCHO = 640

/** Oro de arriba y de abajo (brillo de metal) */
const ORO_ARRIBA = [236, 208, 140]
const ORO_ABAJO = [166, 124, 58]

const svg = path.join(CACHE, 'escudo.svg')
if (!fs.existsSync(svg)) {
  console.log('Descargando el escudo de Wikimedia Commons…')
  const r = await fetch(ORIGEN, { headers: { 'User-Agent': 'desfile-historico-sitio/1.0' } })
  if (!r.ok) throw new Error(`No se pudo descargar el escudo (${r.status})`)
  fs.mkdirSync(CACHE, { recursive: true })
  fs.writeFileSync(svg, Buffer.from(await r.arrayBuffer()))
}

const { data, info } = await sharp(svg, { density: 240 }).resize({ width: ANCHO }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width, height } = info
const salida = Buffer.alloc(width * height * 4)

// Ruido fijo (siempre el mismo) para que el oro se vea un poco gastado
let semilla = 1969
const azar = () => ((semilla = (semilla * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff)

for (let y = 0; y < height; y++) {
  const t = y / (height - 1)
  const oro = ORO_ARRIBA.map((c, i) => Math.round(c + (ORO_ABAJO[i] - c) * t))
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]]
    const luz = 0.299 * r + 0.587 * g + 0.114 * b
    // Lo claro = oro; lo oscuro (las líneas del dibujo) = cuero
    const cuanto = Math.max(0, Math.min(1, (luz - 30) / 170)) ** 0.85
    const gastado = 0.86 + 0.14 * azar()
    salida[i] = oro[0]
    salida[i + 1] = oro[1]
    salida[i + 2] = oro[2]
    salida[i + 3] = Math.round(cuanto * gastado * a)
  }
}

await sharp(salida, { raw: { width, height, channels: 4 } }).webp({ quality: 86, alphaQuality: 90 }).toFile(SALIDA)
console.log(`Listo: ${path.relative(RAIZ, SALIDA)} (${width} × ${height}, ${(fs.statSync(SALIDA).size / 1024).toFixed(0)} KB)`)
