import { useCallback, useEffect, useState } from 'react'
import { posicionesAlAzar } from '@/utils/azar'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

interface Opciones {
  /** Cuántos se muestran a la vez */
  cantidad: number
  /** Cada cuánto cambian, en milisegundos */
  cadaMs?: number
  /** false: no gira (p. ej. en el computador, donde el bloque es un carrusel) */
  activa?: boolean
}

/**
 * Una muestra al azar de una lista que se renueva sola cada cierto tiempo (p. ej. 4 de los 79 pasos).
 * Cada vez que alguien entra ve otros, y cada `cadaMs` cambian por otros que no estaban.
 *
 * Cambia siempre, aunque el mouse o el dedo estén encima o se esté desplazando la página: así invita
 * a entrar a las secciones. Solo se detiene si la persona pulsa el botón de pausa o si pidió
 * "reducir movimiento" en su teléfono o computador.
 */
export function useMuestraRotativa<T>(todos: readonly T[], { cantidad, cadaMs = 3000, activa = true }: Opciones) {
  // actual: lo que se ve; previa: lo que se veía (se va con una animación mientras entra lo nuevo)
  const [{ actual, previa, ronda }, setMuestra] = useState(() => ({
    actual: posicionesAlAzar(todos.length, cantidad),
    previa: [] as number[],
    /** Cuántas veces cambió: 0 = la primera muestra (sin animación de cambio) */
    ronda: 0,
  }))
  const [pausada, setPausada] = useState(false)
  const reducirMovimiento = usePrefersReducedMotion()

  const puedeGirar = activa && !reducirMovimiento && todos.length > cantidad
  const girando = puedeGirar && !pausada

  useEffect(() => {
    if (!girando) return
    const intervalo = window.setInterval(() => {
      setMuestra((m) => ({ actual: posicionesAlAzar(todos.length, cantidad, m.actual), previa: m.actual, ronda: m.ronda + 1 }))
    }, cadaMs)
    return () => clearInterval(intervalo)
  }, [girando, todos.length, cantidad, cadaMs])

  const alternarPausa = useCallback(() => setPausada((p) => !p), [])

  return {
    /** Lo que se muestra ahora */
    visibles: actual.map((i) => todos[i]).filter((x): x is T => x !== undefined),
    /** Lo que se mostraba antes del último cambio, en las mismas casillas (para animar la salida) */
    anteriores: previa.map((i) => todos[i]),
    ronda,
    /** Hay botón de pausa solo si de verdad puede girar */
    puedeGirar,
    pausada,
    alternarPausa,
  }
}
