import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * Al cambiar de ruta: si hay #ancla, desplaza hasta ese capítulo; si no, vuelve arriba.
 * Permite que el menú lleve a /#objetos desde cualquier página.
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation()
  const reducirMovimiento = usePrefersReducedMotion()

  useEffect(() => {
    const id = hash && decodeURIComponent(hash.slice(1))
    if (!id) {
      window.scrollTo(0, 0)
      return
    }

    const destino = document.getElementById(id)
    if (destino) {
      destino.scrollIntoView({ behavior: reducirMovimiento ? 'auto' : 'smooth' })
      return
    }

    // La página puede estar cargándose (carga diferida): esperar a que aparezca el ancla.
    window.scrollTo(0, 0)
    const observer = new MutationObserver(() => {
      const encontrado = document.getElementById(id)
      if (encontrado) {
        observer.disconnect()
        encontrado.scrollIntoView()
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    const limite = setTimeout(() => observer.disconnect(), 5000)
    return () => {
      observer.disconnect()
      clearTimeout(limite)
    }
  }, [pathname, hash, reducirMovimiento])

  return null
}
