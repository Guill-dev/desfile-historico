/**
 * Búsqueda tolerante para los índices (p. ej. los 79 pasos): por número o por nombre.
 * - No distingue mayúsculas ni tildes ("cancion" encuentra "Canción").
 * - Sirve mientras se escribe: "carr" ya encuentra "Carroza".
 * - Perdona errores de escritura ("caroza", "carozza").
 * - "7", "07" o "paso 7" llevan al paso 7; "7" también muestra el 70 al 79.
 * Los resultados salen ordenados del que más se parece al que menos.
 */

export interface Buscable {
  id: string
  etiqueta: string
  /** "07" */
  numero?: string
}

/** Trozo de la etiqueta; `marca` = coincide con lo buscado (se resalta) */
export interface Parte {
  texto: string
  marca: boolean
}

export interface Resultado<T> {
  entrada: T
  partes: Parte[]
  /** El número de la entrada coincide con lo buscado */
  numeroCoincide: boolean
}

export interface Busqueda<T> {
  resultados: Resultado<T>[]
  /** false = ninguna entrada tiene todas las palabras buscadas; se muestran las más parecidas */
  completa: boolean
}

/** Palabras que se pueden escribir sin que cuenten: "paso 7", "el desfile de…" */
const IGNORABLES = new Set(['paso', 'pasos', 'numero', 'nro', 'no', 'n', 'el', 'la', 'los', 'las', 'de', 'del', 'y', 'en', 'a', 'al'])

/** Minúsculas y sin tildes */
const normalizar = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

interface Palabra {
  texto: string
  /** Posición en el texto normalizado */
  inicio: number
}

interface Preparada<T> {
  entrada: T
  texto: string
  palabras: Palabra[]
  /** Para cada letra del texto normalizado: dónde empieza y dónde termina en la etiqueta original */
  desde: number[]
  hasta: number[]
  numero: number | null
}

function preparar<T extends Buscable>(entrada: T): Preparada<T> {
  // Se normaliza letra por letra para poder volver a la etiqueta original al resaltar
  let texto = ''
  const desde: number[] = []
  const hasta: number[] = []
  let i = 0
  for (const letra of entrada.etiqueta) {
    for (const n of normalizar(letra)) {
      texto += n
      desde.push(i)
      hasta.push(i + letra.length)
    }
    i += letra.length
  }
  const palabras = [...texto.matchAll(/[\p{L}\p{N}]+/gu)].map((m) => ({ texto: m[0], inicio: m.index }))
  const numero = entrada.numero ? parseInt(entrada.numero, 10) : NaN
  return { entrada, texto, palabras, desde, hasta, numero: Number.isFinite(numero) ? numero : null }
}

/** Cuántas letras hay que cambiar, poner, quitar o voltear para pasar de `a` a `b` */
function distancia(a: string, b: string): number {
  let antes: number[] = []
  let previa = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const fila = [i]
    for (let j = 1; j <= b.length; j++) {
      let v = Math.min(previa[j] + 1, fila[j - 1] + 1, previa[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, antes[j - 2] + 1)
      fila.push(v)
    }
    antes = previa
    previa = fila
  }
  return previa[b.length]
}

interface Coincidencia {
  puntos: number
  /** Qué parte del texto normalizado resaltar */
  rango: [number, number] | null
  numero: boolean
}

const NINGUNA: Coincidencia = { puntos: 0, rango: null, numero: false }

/**
 * Qué tanto se parece una palabra buscada a la entrada.
 * `debil`: palabra de relleno ("paso", "de"…): solo suma un poco y solo si está tal cual.
 */
function comparar(termino: string, p: Preparada<Buscable>, debil = false): Coincidencia {
  let mejor = NINGUNA
  const proponer = (c: Coincidencia) => {
    if (c.puntos > mejor.puntos) mejor = c
  }

  const esNumero = /^\d+$/.test(termino)
  if (esNumero && p.numero !== null) {
    const sinCeros = String(parseInt(termino, 10))
    if (parseInt(termino, 10) === p.numero) proponer({ puntos: 100, rango: null, numero: true })
    else if (String(p.numero).startsWith(sinCeros) || p.entrada.numero?.startsWith(termino)) {
      proponer({ puntos: 60, rango: null, numero: true })
    }
  }

  // Más errores permitidos cuanto más larga la palabra; los números se escriben exactos
  const tolerancia = esNumero || debil ? 0 : termino.length >= 7 ? 2 : termino.length >= 4 ? 1 : 0

  for (const w of p.palabras) {
    const fin = w.inicio + termino.length
    if (debil) {
      if (w.texto.startsWith(termino)) proponer({ puntos: 5, rango: [w.inicio, fin], numero: false })
    } else if (w.texto === termino) {
      // Un número dentro del título ("127") cuenta menos que el número del paso
      proponer({ puntos: esNumero ? 70 : 90, rango: [w.inicio, fin], numero: false })
    } else if (w.texto.startsWith(termino)) {
      // Mientras más completa la palabra, más se parece
      const puntos = esNumero ? 45 : 70 + Math.round((15 * termino.length) / w.texto.length)
      proponer({ puntos, rango: [w.inicio, fin], numero: false })
    } else if (termino.length >= 3 && w.texto.includes(termino)) {
      const k = w.inicio + w.texto.indexOf(termino)
      proponer({ puntos: esNumero ? 35 : 50, rango: [k, k + termino.length], numero: false })
    } else if (tolerancia > 0) {
      // Con errores: contra el comienzo de la palabra (si todavía se está escribiendo) o contra la palabra entera
      let d = Infinity
      let largo = 0
      for (const l of [termino.length - 1, termino.length, termino.length + 1, w.texto.length]) {
        if (l < 2 || l > w.texto.length) continue
        const dl = distancia(termino, w.texto.slice(0, l))
        if (dl < d) {
          d = dl
          largo = l
        }
      }
      if (d <= tolerancia) proponer({ puntos: 40 - 10 * d, rango: [w.inicio, w.inicio + largo], numero: false })
    }
  }
  return mejor
}

/** Une los rangos que se tocan y los convierte en trozos de la etiqueta original */
function partir(p: Preparada<Buscable>, rangos: [number, number][]): Parte[] {
  const etiqueta = p.entrada.etiqueta
  const unidos: [number, number][] = []
  for (const [a, b] of [...rangos].sort((x, y) => x[0] - y[0])) {
    const ultimo = unidos.at(-1)
    if (ultimo && a <= ultimo[1]) ultimo[1] = Math.max(ultimo[1], b)
    else unidos.push([a, b])
  }
  const partes: Parte[] = []
  let cursor = 0
  for (const [a, b] of unidos) {
    const ini = p.desde[a]
    const fin = p.hasta[b - 1]
    if (ini > cursor) partes.push({ texto: etiqueta.slice(cursor, ini), marca: false })
    partes.push({ texto: etiqueta.slice(ini, fin), marca: true })
    cursor = fin
  }
  if (cursor < etiqueta.length) partes.push({ texto: etiqueta.slice(cursor), marca: false })
  return partes
}

/**
 * Prepara las entradas una sola vez y devuelve la función que busca en ellas.
 * Con la consulta vacía devuelve null (no se está buscando).
 */
export function crearBuscador<T extends Buscable>(entradas: T[]) {
  const preparadas = entradas.map(preparar)

  return (consulta: string): Busqueda<T> | null => {
    const terminos = normalizar(consulta).match(/[\p{L}\p{N}]+/gu)
    if (!terminos) return null
    const frase = terminos.join(' ')
    // Si todo lo escrito es de relleno ("la", "de"), se busca tal cual
    const hayPalabrasClave = terminos.some((t) => !IGNORABLES.has(t))

    const encontrados = preparadas.flatMap((p, orden) => {
      let puntos = 0
      let faltan = 0
      let numeroCoincide = false
      const rangos: [number, number][] = []
      for (const t of terminos) {
        const relleno = hayPalabrasClave && IGNORABLES.has(t)
        const c = comparar(t, p, relleno)
        if (c.puntos > 0) {
          puntos += c.puntos
          if (c.rango) rangos.push(c.rango)
          numeroCoincide ||= c.numero
        } else if (!relleno) {
          faltan++
        }
      }
      if (puntos === 0) return []
      // Si la etiqueta empieza (o contiene) lo escrito tal cual, va más arriba
      if (p.texto.startsWith(frase)) puntos += 20
      else if (terminos.length > 1 && p.texto.includes(frase)) puntos += 10
      return [{ p, orden, puntos, faltan, rangos, numeroCoincide }]
    })

    const completos = encontrados.filter((e) => e.faltan === 0)
    const lista = completos.length > 0 ? completos : encontrados
    lista.sort((a, b) => a.faltan - b.faltan || b.puntos - a.puntos || a.orden - b.orden)

    return {
      completa: completos.length > 0 || encontrados.length === 0,
      resultados: lista.map((e) => ({
        entrada: e.p.entrada,
        partes: partir(e.p, e.rangos),
        numeroCoincide: e.numeroCoincide,
      })),
    }
  }
}
