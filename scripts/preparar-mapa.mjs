/**
 * PREPARAR EL MAPA DE LA ANIMACIÓN "DEL MUNDO A GUALMATÁN" (ver GUIA, sección 6)
 *
 * Junta en un solo archivo, public/media/mapa/mapa.json, todo lo que dibuja la animación de "Conoce la historia":
 *   - el mundo (tierra) y los países vecinos: Natural Earth (dominio público), paquete world-atlas;
 *     Ecuador, que toca a Nariño, de geoBoundaries (CC0): encaja mejor con la frontera del DANE
 *   - Colombia (sus 33 departamentos), Nariño, sus 64 municipios y Gualmatán: límites oficiales del DANE
 *     (Marco Geoestadístico Nacional), publicados por geoBoundaries con licencia CC BY 4.0 (hay que dar el crédito).
 *     Colombia y Nariño salen de los mismos datos: la costa y la frontera coinciden y no quedan franjas sin pintar.
 *
 * La primera vez descarga los límites de geoBoundaries (~12 MB) en node_modules/.cache/preparar-mapa/
 * (fuera del sitio y de GitHub). Las veces siguientes usa esa copia.
 *
 * Uso:  npm run mapa
 */
import fs from 'node:fs'
import path from 'node:path'
import { feature, merge } from 'topojson-client'

const RAIZ = path.join(import.meta.dirname, '..')
const CARPETA = path.join(RAIZ, 'public', 'media', 'mapa')
const CACHE = path.join(RAIZ, 'node_modules', '.cache', 'preparar-mapa')
const SALIDA = path.join(CARPETA, 'mapa.json')

/** geoBoundaries, versión fija (para que el resultado no cambie solo): límites del DANE, versión simplificada */
const GEOBOUNDARIES = 'https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/COL'
const URL_DEPARTAMENTOS = `${GEOBOUNDARIES}/ADM1/geoBoundaries-COL-ADM1_simplified.geojson`
const URL_MUNICIPIOS = `${GEOBOUNDARIES}/ADM2/geoBoundaries-COL-ADM2_simplified.geojson`
const URL_ECUADOR = 'https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/ECU/ADM0/geoBoundaries-ECU-ADM0_simplified.geojson'

/** Cabecera de Gualmatán [lon, lat]: donde cae el punto rojo */
const CABECERA_GUALMATAN = [-77.5683, 0.9197]

/* ───────────── Geometría ───────────── */

const poligonos = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates)

const areaPlana = (anillo) => {
  let a = 0
  for (let n = 0; n < anillo.length - 1; n++) a += anillo[n][0] * anillo[n + 1][1] - anillo[n + 1][0] * anillo[n][1]
  return a / 2
}

/** ¿El punto está dentro del anillo? (cuenta cruces de una línea horizontal) */
const dentroDe = ([x, y], anillo) => {
  let c = false
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i]
    const [xj, yj] = anillo[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}
const dentroDeGeom = (p, g) => poligonos(g).some((pol) => dentroDe(p, pol[0]) && !pol.slice(1).some((h) => dentroDe(p, h)))

/** Douglas–Peucker: quita puntos que casi no cambian la forma */
function simplificar(pts, tol) {
  if (pts.length < 3) return pts
  const d2 = (p, a, b) => {
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const l = dx * dx + dy * dy
    const t = l ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l)) : 0
    const x = a[0] + t * dx - p[0]
    const y = a[1] + t * dy - p[1]
    return x * x + y * y
  }
  const marcar = new Uint8Array(pts.length)
  marcar[0] = marcar[pts.length - 1] = 1
  const pila = [[0, pts.length - 1]]
  while (pila.length) {
    const [i, j] = pila.pop()
    let max = 0
    let k = -1
    for (let n = i + 1; n < j; n++) {
      const v = d2(pts[n], pts[i], pts[j])
      if (v > max) {
        max = v
        k = n
      }
    }
    if (max > tol * tol) {
      marcar[k] = 1
      pila.push([i, k], [k, j])
    }
  }
  return pts.filter((_, n) => marcar[n])
}

const redondear = (pts, dec) => pts.map(([x, y]) => [Number(x.toFixed(dec)), Number(y.toFixed(dec))])

/**
 * Simplifica, redondea y deja los anillos como los quiere d3-geo:
 * el borde de afuera en sentido horario (visto con el norte arriba) y los huecos al revés.
 * Con orientar = false se deja el sentido que traen (world-atlas ya viene listo para d3; además, la Antártida
 * rodea el polo y "horario" en un plano no le sirve).
 */
function preparar(geom, tol, dec, orientar = true) {
  const anillo = (a, exterior) => {
    const s = redondear(simplificar(a, tol), dec)
    if (s.length < 4) return null
    if (!orientar) return s
    const horario = areaPlana(s) < 0
    return horario === exterior ? s : [...s].reverse()
  }
  const pols = poligonos(geom)
    .map((p) => [anillo(p[0], true), ...p.slice(1).map((h) => anillo(h, false))].filter(Boolean))
    .filter((p) => p.length > 0)
  return { type: 'MultiPolygon', coordinates: pols }
}

/* ───────────── Nariño (DANE vía geoBoundaries) ───────────── */

/** Descarga una vez y guarda la copia en la caché */
async function descargar(url) {
  const archivo = path.join(CACHE, url.split('/').pop())
  if (!fs.existsSync(archivo)) {
    console.log(`Descargando ${path.basename(archivo)}…`)
    const r = await fetch(url)
    if (!r.ok) throw new Error(`No se pudo descargar ${url} (${r.status})`)
    fs.mkdirSync(CACHE, { recursive: true })
    fs.writeFileSync(archivo, await r.text())
  }
  return JSON.parse(fs.readFileSync(archivo, 'utf8'))
}

async function limitesDane() {
  const [deps, muns] = [await descargar(URL_DEPARTAMENTOS), await descargar(URL_MUNICIPIOS)]
  const departamento = deps.features.find((f) => /nari/i.test(f.properties.shapeName))
  const otros = deps.features.filter((f) => f !== departamento)
  const caja = poligonos(departamento.geometry)
    .flatMap((p) => p[0])
    .reduce((b, [x, y]) => [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x), Math.max(b[3], y)], [Infinity, Infinity, -Infinity, -Infinity])
  // Un municipio es de Nariño si la mayoría de sus puntos caen dentro del departamento
  const deNarino = (g) => {
    const pts = poligonos(g).flatMap((p) => p[0])
    if (!pts.some(([x, y]) => x >= caja[0] && x <= caja[2] && y >= caja[1] && y <= caja[3])) return false
    const paso = Math.max(1, Math.floor(pts.length / 200))
    const muestra = pts.filter((_, i) => i % paso === 0)
    return muestra.filter((p) => dentroDeGeom(p, departamento.geometry)).length / muestra.length > 0.5
  }
  const municipios = muns.features.filter((f) => deNarino(f.geometry))
  return { departamento, municipios, otros }
}

/* ───────────── Armado ───────────── */

const { departamento, municipios, otros } = await limitesDane()
console.log(`Nariño: ${municipios.length} municipios (deben ser 64)`)
const gualmatan = municipios.find((f) => /gualmat/i.test(f.properties.shapeName))
if (!gualmatan) throw new Error('No se encontró Gualmatán entre los municipios')
if (!dentroDeGeom(CABECERA_GUALMATAN, gualmatan.geometry)) console.warn('Ojo: la cabecera de Gualmatán cae fuera de su municipio')

// Tolerancias en grados (~0.001° = 110 m). Nariño se rellena entero con su contorno (así no quedan rendijas
// sin pintar entre municipios); de los municipios solo se dibujan las líneas que los dividen.
const contorno = preparar(departamento.geometry, 0.0012, 4)
const divisiones = { type: 'GeometryCollection', geometries: municipios.map((f) => preparar(f.geometry, 0.002, 3)) }
const gualmatanGeo = preparar(gualmatan.geometry, 0.0004, 4)

// Mundo (110m) y Colombia con vecinos (50m), de world-atlas
const leer = (archivo) => JSON.parse(fs.readFileSync(path.join(RAIZ, 'node_modules', 'world-atlas', archivo), 'utf8'))
const mundo110 = leer('land-110m.json')
const paises50 = leer('countries-50m.json')
const tierra = preparar(
  feature(mundo110, mundo110.objects.land).features?.[0]?.geometry ?? merge(mundo110, mundo110.objects.land.geometries),
  0.08,
  2,
  false,
)
// Ecuador de geoBoundaries (sin Galápagos); los demás vecinos, de Natural Earth (se ven de lejos)
const ecuador = (await descargar(URL_ECUADOR)).features[0].geometry
const ecuadorContinental = {
  type: 'MultiPolygon',
  coordinates: poligonos(ecuador).filter((p) => p[0].some(([lon]) => lon > -82)),
}
const VECINOS = { '604': 'peru', '076': 'brasil', '862': 'venezuela', '591': 'panama' }
const paises = feature(paises50, paises50.objects.countries).features
// Colombia: los otros 32 departamentos del DANE (Nariño va aparte, con más detalle). Juntos son el país entero.
// Los vecinos de Nariño (Cauca y Putumayo) llevan más detalle: su frontera con Nariño se ve de cerca
const VECINOS_DE_NARINO = /^(cauca|putumayo)$/i
const colombia = {
  type: 'GeometryCollection',
  geometries: otros.map((f) => preparar(f.geometry, VECINOS_DE_NARINO.test(f.properties.shapeName) ? 0.002 : 0.015, 3)),
}
const vecinos = {
  type: 'GeometryCollection',
  geometries: [
    preparar(ecuadorContinental, 0.003, 3),
    ...paises.filter((p) => VECINOS[p.id]).map((p) => preparar(p.geometry, 0.02, 3, false)),
  ],
}

const datos = {
  fuente:
    'Mundo y países: Natural Earth (dominio público), vía world-atlas; Ecuador: geoBoundaries (CC0). Colombia, Nariño y municipios: DANE, Marco Geoestadístico Nacional, vía geoBoundaries (CC BY 4.0).',
  cabeceras: { gualmatan: CABECERA_GUALMATAN },
  tierra,
  colombia,
  vecinos,
  narino: contorno,
  municipios: divisiones,
  gualmatan: gualmatanGeo,
}
fs.writeFileSync(SALIDA, JSON.stringify(datos))
console.log(`Listo: ${path.relative(RAIZ, SALIDA)} (${(fs.statSync(SALIDA).size / 1024).toFixed(0)} KB)`)
