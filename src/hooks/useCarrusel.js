import { useRef } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/**
 * Controla un carrusel horizontal: `ref` va en la pista (lista con scroll),
 * `anterior` / `siguiente` desplazan una tarjeta.
 */
export function useCarrusel() {
  const ref = useRef(null)
  const reducirMovimiento = usePrefersReducedMotion()

  const mover = (direccion) => {
    const pista = ref.current
    if (!pista) return
    const tarjeta = pista.firstElementChild
    const hueco = parseFloat(getComputedStyle(pista).columnGap) || 0
    const paso = tarjeta ? tarjeta.getBoundingClientRect().width + hueco : pista.clientWidth * 0.8
    pista.scrollBy({ left: direccion * paso, behavior: reducirMovimiento ? 'auto' : 'smooth' })
  }

  return { ref, anterior: () => mover(-1), siguiente: () => mover(1) }
}
