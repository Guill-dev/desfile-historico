import { useCallback, useSyncExternalStore } from 'react'

/** true mientras se cumpla la consulta CSS, p. ej. useMediaQuery('(max-width: 767px)'). */
export function useMediaQuery(consulta) {
  const suscribir = useCallback(
    (avisar) => {
      const mql = window.matchMedia(consulta)
      mql.addEventListener('change', avisar)
      return () => mql.removeEventListener('change', avisar)
    },
    [consulta],
  )
  return useSyncExternalStore(suscribir, () => window.matchMedia(consulta).matches, () => false)
}
