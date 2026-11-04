import { useLocation } from 'react-router'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/**
 * Para los enlaces de un índice (to={{ hash: '#paso-3' }}): si la dirección ya tiene ese #ancla,
 * el enlace no cambia nada y ScrollManager no se mueve. Esta función hace el desplazamiento en ese caso,
 * p. ej. al volver a tocar el paso 3 después de haber bajado hasta el 30.
 */
export function useIrAlAncla() {
  const { hash } = useLocation()
  const reducirMovimiento = usePrefersReducedMotion()

  return (id: string) => {
    if (hash !== `#${id}`) return // el ancla cambia: de eso se encarga ScrollManager
    document.getElementById(id)?.scrollIntoView({ behavior: reducirMovimiento ? 'auto' : 'smooth' })
  }
}
