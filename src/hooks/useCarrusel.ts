import { useRef, type RefObject } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

interface Carrusel<T extends HTMLElement> {
  /** Va en la pista: la lista con scroll horizontal */
  ref: RefObject<T | null>
  anterior: () => void
  siguiente: () => void
}

/**
 * Controla un carrusel horizontal: `anterior` / `siguiente` desplazan una tarjeta.
 * El tipo indica la etiqueta de la pista: useCarrusel<HTMLOListElement>() para un <ol>.
 */
export function useCarrusel<T extends HTMLElement = HTMLUListElement>(): Carrusel<T> {
  const ref = useRef<T>(null)
  const reducirMovimiento = usePrefersReducedMotion()

  const mover = (direccion: 1 | -1) => {
    const pista = ref.current
    if (!pista) return
    const tarjeta = pista.firstElementChild
    const hueco = parseFloat(getComputedStyle(pista).columnGap) || 0
    const paso = tarjeta ? tarjeta.getBoundingClientRect().width + hueco : pista.clientWidth * 0.8
    pista.scrollBy({ left: direccion * paso, behavior: reducirMovimiento ? 'auto' : 'smooth' })
  }

  return { ref, anterior: () => mover(-1), siguiente: () => mover(1) }
}
