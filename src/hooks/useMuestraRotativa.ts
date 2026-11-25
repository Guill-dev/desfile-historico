import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { barajar } from '@/utils/azar'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

interface Opciones<T> {
  /** Cuántos se muestran a la vez */
  cantidad: number
  /** Cada cuánto cambian, en milisegundos */
  cadaMs?: number
  /** false: no gira (p. ej. en el computador, donde el bloque es un carrusel) */
  activa?: boolean
  /** false mientras el bloque está fuera de la pantalla: se detiene un rato (no gasta) y sigue al volver */
  aLaVista?: boolean
  /**
   * Para que algunos salgan siempre (p. ej. las piezas con modelo 3D): mayor número = más importante.
   * Debe ser una función fija (definida fuera del componente).
   */
  prioridad?: (x: T) => number
  /**
   * Deja lista (descargada y decodificada) la foto de uno que va a entrar. El cambio espera a que estén
   * listas (máximo ESPERA_MAX_MS): así la tarjeta nueva nunca entra girando en blanco. Función fija.
   */
  precargar?: (x: T) => Promise<unknown> | undefined
}

/**
 * Cuánto dura un cambio completo: la salida (0.32 s) y la entrada (0.48 s, que empieza al terminar la salida),
 * más el retraso escalonado entre casillas (hasta ~0.45 s con 6), con margen. Ver Muestra.module.css.
 */
const SALIDA_MS = 1500
/** Si una foto tarda más que esto en descargarse, el cambio no la espera más */
const ESPERA_MAX_MS = 2500

/** Qué casillas se quedan fijas y entre cuáles se turnan las demás (posiciones dentro de la lista) */
interface Reparto {
  fijos: number[]
  rotan: number[]
}

/**
 * Los grupos más importantes que caben enteros en la muestra se quedan fijos; el primero que ya no cabe
 * se turna en las casillas que sobran. Sin prioridades, todos se turnan (si son más que las casillas).
 */
function repartir(prioridades: number[], cantidad: number): Reparto {
  const niveles = [...new Set(prioridades)].sort((a, b) => b - a)
  const fijos: number[] = []
  for (const nivel of niveles) {
    const grupo = prioridades.flatMap((p, i) => (p === nivel ? [i] : []))
    if (fijos.length + grupo.length > cantidad) return { fijos, rotan: grupo }
    fijos.push(...grupo)
  }
  return { fijos, rotan: [] }
}

/**
 * LA BOLSA: los que todavía no han salido en esta vuelta, barajados. Se sacan de ahí y no vuelve a salir ninguno
 * hasta que salieron todos; entonces se baraja otra vez (sin los que se están viendo, para que siempre cambien).
 * Devuelve los sacados y lo que queda en la bolsa.
 */
function sacar(bolsa: readonly number[], rotan: readonly number[], cuantos: number, evitar: readonly number[]) {
  const tomados: number[] = []
  let resto = [...bolsa]
  while (tomados.length < cuantos) {
    if (resto.length === 0) {
      // Salieron todos: nueva vuelta, al azar. Los que se están viendo (y los recién sacados) también entran, pero
      // al fondo de la bolsa: salen de últimos, así ninguno se repite pronto y en cada vuelta salen todos
      const recientes = rotan.filter((i) => evitar.includes(i) || tomados.includes(i))
      resto = [...barajar(recientes), ...barajar(rotan.filter((i) => !recientes.includes(i)))]
      if (resto.every((i) => evitar.includes(i) || tomados.includes(i))) break
    }
    const n = resto.pop() as number
    if (!evitar.includes(n) && !tomados.includes(n)) tomados.push(n)
  }
  return { tomados, resto }
}

/**
 * Nueva muestra, sacada de la bolsa (ver sacar). Los fijos conservan su casilla, para que no se muevan cuando
 * cambian los demás. Si quedan menos para entrar que casillas que giran (p. ej. 5 piezas para 4 casillas), solo
 * cambian esas casillas y las demás se quedan como están.
 */
function elegir({ fijos, rotan }: Reparto, cantidad: number, bolsa: readonly number[], anterior?: number[]) {
  if (!anterior) {
    const { tomados, resto } = sacar(bolsa, rotan, Math.max(0, cantidad - fijos.length), [])
    return { muestra: [...barajar(fijos), ...tomados], bolsa: resto }
  }
  const casillas = anterior.flatMap((i, c) => (fijos.includes(i) ? [] : [c]))
  const { tomados, resto } = sacar(bolsa, rotan, casillas.length, anterior)
  const nueva = [...anterior]
  barajar(casillas)
    .slice(0, tomados.length)
    .forEach((c, k) => {
      nueva[c] = tomados[k]
    })
  return { muestra: nueva, bolsa: resto }
}

/**
 * Una muestra al azar de una lista que se renueva sola cada cierto tiempo (p. ej. 6 de los 79 pasos).
 * Cada vez que alguien entra ve otros, y cada `cadaMs` cambian por otros. NO SE REPITEN: uno que ya salió no
 * vuelve a salir hasta que salieron todos; entonces empieza otra vuelta, al azar (ver sacar).
 * Con `prioridad`, los más importantes se quedan siempre a la vista y solo cambian las demás casillas.
 *
 * Cambia siempre, aunque el mouse o el dedo estén encima o se esté desplazando la página: así invita
 * a entrar a las secciones. Solo se detiene si la persona pulsa el botón de pausa, si pidió
 * "reducir movimiento" en su teléfono o computador, o mientras el bloque está fuera de la pantalla.
 */
export function useMuestraRotativa<T>(
  todos: readonly T[],
  { cantidad, cadaMs = 3000, activa = true, aLaVista = true, prioridad, precargar }: Opciones<T>,
) {
  const reparto = useMemo(() => repartir(todos.map((x) => prioridad?.(x) ?? 0), cantidad), [todos, prioridad, cantidad])

  // actual: lo que se ve; previa: lo que se veía (se va con una animación mientras entra lo nuevo)
  const [{ actual, previa, ronda, bolsa }, setMuestra] = useState(() => {
    const primera = elegir(reparto, cantidad, [])
    return {
      actual: primera.muestra,
      previa: [] as number[],
      /** Cuántas veces cambió: 0 = la primera muestra (sin animación de cambio) */
      ronda: 0,
      /** Los que todavía no han salido en esta vuelta */
      bolsa: primera.bolsa,
    }
  })
  const [pausada, setPausada] = useState(false)
  const reducirMovimiento = usePrefersReducedMotion()

  // Solo gira si hay más candidatos que casillas libres
  const puedeGirar = activa && !reducirMovimiento && reparto.rotan.length > cantidad - reparto.fijos.length
  // Fuera de la pantalla no cambia (nadie lo ve): así no se descargan fotos ni se animan tarjetas por nada
  const girando = puedeGirar && !pausada && aLaVista

  // Lo que se ve ahora y lo que queda en la bolsa, para elegir lo siguiente sin esperar a un nuevo render
  const actualRef = useRef(actual)
  const bolsaRef = useRef(bolsa)
  useEffect(() => {
    actualRef.current = actual
    bolsaRef.current = bolsa
  }, [actual, bolsa])

  useEffect(() => {
    if (!girando) return
    let vigente = true
    let espera = 0
    // Cada `cadaMs`: se eligen los nuevos, se dejan listas sus fotos y recién ahí se voltean las tarjetas
    const cambiar = async () => {
      const antes = actualRef.current
      const { muestra: nueva, bolsa: queda } = elegir(reparto, cantidad, bolsaRef.current, antes)
      if (precargar) {
        const llegan = nueva.filter((i) => !antes.includes(i)).map((i) => precargar(todos[i]))
        await Promise.race([Promise.allSettled(llegan), new Promise((r) => setTimeout(r, ESPERA_MAX_MS))])
      }
      if (!vigente) return
      setMuestra((m) => ({ actual: nueva, previa: m.actual, ronda: m.ronda + 1, bolsa: queda }))
      espera = window.setTimeout(cambiar, cadaMs)
    }
    espera = window.setTimeout(cambiar, cadaMs)
    return () => {
      vigente = false
      clearTimeout(espera)
    }
  }, [girando, reparto, cantidad, cadaMs, precargar, todos])

  // Cuando terminan de irse, las tarjetas que salieron se quitan de la página. Si no, se quedarían
  // invisibles hasta el próximo cambio (y si son modelos 3D, girando y gastando batería por nada).
  useEffect(() => {
    if (ronda === 0) return
    const t = window.setTimeout(() => setMuestra((m) => (m.ronda === ronda ? { ...m, previa: [] } : m)), SALIDA_MS)
    return () => clearTimeout(t)
  }, [ronda])

  const alternarPausa = useCallback(() => setPausada((p) => !p), [])

  return {
    /** Lo que se muestra ahora */
    visibles: actual.map((i) => todos[i]).filter((x): x is T => x !== undefined),
    /** Lo que se mostraba antes del último cambio, en las mismas casillas, mientras se va (luego queda vacío) */
    anteriores: previa.map((i) => todos[i]),
    ronda,
    /** Hay botón de pausa solo si de verdad puede girar */
    puedeGirar,
    pausada,
    alternarPausa,
  }
}
