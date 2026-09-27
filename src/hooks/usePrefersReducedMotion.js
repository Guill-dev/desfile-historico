import { useMediaQuery } from './useMediaQuery'

/** true si la persona pidió reducir el movimiento en su sistema. Todas las animaciones deben respetarlo. */
export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
