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
  /**
   * Qué tan ancho se ve el recuadro (como el atributo `sizes` de <img>, p. ej. '(max-width: 767px) 92vw, 880px').
   * Con esto, el navegador escoge solo entre la miniatura (640 px) y la foto completa: en un recuadro grande o
   * en una pantalla nítida usa la completa, así la foto no se ve pixelada. Sin esto, siempre la miniatura.
   */
  sizes?: string
}

/** La versión liviana si existe (las tarjetas son pequeñas) */
const fuente = (m: Media) => m.miniatura ?? m.src ?? undefined

/** Las dos versiones de la foto para el navegador: la miniatura (640 px) y la completa (hasta 1600 px) */
const juego = (m: Media) => (m.miniatura && m.src ? `${m.miniatura} 640w, ${m.src} 1600w` : undefined)

/**
 * Una foto que cambia sola cada `cadaMs`, AL AZAR Y SIN REPETIR: las fotos salen de una "bolsa" barajada y no
 * vuelve a salir ninguna hasta que pasaron todas; entonces se baraja otra vez. La nueva aparece sobre la anterior
 * con un fundido, y solo cuando ya cargó (así nunca se ve un hueco).
 * Cada una empieza con un desfase al azar, para que si hay varias en pantalla no cambien todas a la vez.
 * Se detiene fuera de pantalla y con "reducir movimiento".
 */
export default function FotosRotativas({ fotos, cadaMs = 2500, ratio = '16 / 10', className, sizes }: Props) {
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
      // Se cambia cuando la nueva ya está lista para verse (la misma versión que va a mostrar la página)
      const img = new Image()
      if (sizes && juego(fotos[n])) {
        img.sizes = sizes
        img.srcset = juego(fotos[n]) ?? ''
      }
      img.src = fuente(fotos[n]) ?? ''
      img.decode().then(mostrar, mostrar)
    }

    reloj = window.setTimeout(siguiente, cadaMs * (0.4 + Math.random() * 0.8))
    return () => {
      vivo = false
      clearTimeout(reloj)
    }
  }, [enPantalla, reducirMovimiento, fotos, cadaMs, sizes])

  const foto = fotos[actual]

  return (
    <span ref={marco} className={cx(styles.marco, className)} style={{ aspectRatio: ratio }}>
      {/* La anterior se queda debajo (con la misma clave que tenía: no se vuelve a cargar) */}
      {anterior !== null && (
        <img
          key={`${anterior}-${ronda - 1}`}
          src={fuente(fotos[anterior])}
          srcSet={sizes ? juego(fotos[anterior]) : undefined}
          sizes={sizes}
          alt=""
          className={styles.foto}
        />
      )}
      <img
        key={`${actual}-${ronda}`}
        src={fuente(foto)}
        srcSet={sizes ? juego(foto) : undefined}
        sizes={sizes}
        alt={foto.alt}
        loading={ronda === 0 ? 'lazy' : undefined}
        decoding="async"
        className={cx(styles.foto, ronda > 0 && styles.entra)}
      />
    </span>
  )
}
