import { useEffect, useRef, useState, type RefObject } from 'react'

interface Opciones {
  threshold?: number
  rootMargin?: string
  /** true (por defecto): se dispara una sola vez */
  once?: boolean
}

/**
 * Indica si un elemento entró en pantalla. Base de las animaciones de aparición.
 * Devuelve [ref, visible]: la ref se pone en el elemento a observar.
 */
export function useInView<T extends Element = HTMLElement>({
  threshold = 0.15,
  rootMargin = '0px 0px -10% 0px',
  once = true,
}: Opciones = {}): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setVisible(false)
        }
      },
      { threshold, rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return [ref, visible]
}
