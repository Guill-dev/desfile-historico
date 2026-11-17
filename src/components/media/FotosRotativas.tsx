import { useEffect, useRef, useState } from 'react'
import type { Media } from '@/types/contenido'
import { cx } from '@/utils/cx'
import { barajar } from '@/utils/azar'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import styles from './FotosRotativas.module.css'

interface Props {
  /** Las fotos (con archivo); debe ser una lista fija, no una nueva en cada render */
  fotos: Media[]
  /** Cada cuánto cambia la foto (milisegundos) */
  cadaMs?: number
  ratio?: string
  className?: string
}

/** La versión liviana si existe (las tarjetas son pequeñas) */
const fuente = (m: Media) => m.miniatura ?? m.src ?? undefined

/**
 * Una foto que cambia sola cada `cadaMs`, AL AZAR Y SIN REPETIR: las fotos salen de una "bolsa" barajada y no
 * vuelve a salir ninguna hasta que pasaron todas; entonces se baraja otra vez. La nueva aparece sobre la anterior
 * con un fundido, y solo cuando ya cargó (así nunca se ve un hueco).
 * Cada una empieza con un desfase al azar, para que si hay varias en pantalla no cambien todas a la vez.
 * Se detiene fuera de pantalla y con "reducir movimiento".
 */
export default function FotosRotativas({ fotos, cadaMs = 2500, ratio = '16 / 10', className }: Props) {
  const reducirMovimiento = usePrefersReducedMotion()
  const marco = useRef<HTMLSpanElement>(null)
  const bolsa = useRef<number[]>([])
  const [enPantalla, setEnPantalla] = useState(false)
  const [{ actual, anterior, ronda }, setEstado] = useState(() => ({
    actual: Math.floor(Math.random() * fotos.length),
    anterior: null as number | null,
    ronda: 0,
  }))
  const actualRef = useRef(actual)

  useEffect(() => {
    const el = marco.current
    if (!el) return
    const observador = new IntersectionObserver(([e]) => setEnPantalla(e.isIntersecting), { rootMargin: '120px' })
    observador.observe(el)
    return () => observador.disconnect()
  }, [])

  useEffect(() => {
    if (!enPantalla || reducirMovimiento || fotos.length < 2) return
    let vivo = true
    let reloj = 0

    const siguiente = () => {
      // La bolsa: todas menos la que se está viendo, barajadas. Se vacía antes de que alguna se repita.
      if (bolsa.current.length === 0) {
        bolsa.current = barajar(fotos.map((_, i) => i).filter((i) => i !== actualRef.current))
      }
      const n = bolsa.current.pop() ?? 0
      const mostrar = () => {
        if (!vivo) return
        setEstado((e) => ({ actual: n, anterior: e.actual, ronda: e.ronda + 1 }))
        actualRef.current = n
        reloj = window.setTimeout(siguiente, cadaMs)
      }
      // Se cambia cuando la nueva ya está lista para verse
      const img = new Image()
      img.src = fuente(fotos[n]) ?? ''
      img.decode().then(mostrar, mostrar)
    }

    reloj = window.setTimeout(siguiente, cadaMs * (0.4 + Math.random() * 0.8))
    return () => {
      vivo = false
      clearTimeout(reloj)
    }
  }, [enPantalla, reducirMovimiento, fotos, cadaMs])

  const foto = fotos[actual]

  return (
    <span ref={marco} className={cx(styles.marco, className)} style={{ aspectRatio: ratio }}>
      {/* La anterior se queda debajo (con la misma clave que tenía: no se vuelve a cargar) */}
      {anterior !== null && (
        <img key={`${anterior}-${ronda - 1}`} src={fuente(fotos[anterior])} alt="" className={styles.foto} />
      )}
      <img
        key={`${actual}-${ronda}`}
        src={fuente(foto)}
        alt={foto.alt}
        loading={ronda === 0 ? 'lazy' : undefined}
        decoding="async"
        className={cx(styles.foto, ronda > 0 && styles.entra)}
      />
    </span>
  )
}
