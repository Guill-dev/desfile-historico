import { useEffect, useRef, useState, type SyntheticEvent } from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import styles from './VideoPortada.module.css'

interface Props {
  src: string
  srcMovil?: string | null
  poster?: string | null
  /** Avisa la proporción real del video (ancho / alto) */
  onProporcion?: (proporcion: number) => void
}

/**
 * Video de portada: completo (sin recortes), sin sonido, en bucle y con botón de pausa.
 * - Avisa su proporción real con `onProporcion` para que la portada se acomode.
 * - Si la persona pidió "reducir movimiento", empieza pausado (se ve el poster).
 * - Se pausa solo cuando sale de pantalla y se reanuda al volver (salvo que lo hayan pausado a mano).
 * - En celular usa `srcMovil` si existe.
 */
export default function VideoPortada({ src, srcMovil, poster, onProporcion }: Props) {
  const video = useRef<HTMLVideoElement>(null)
  const pausaManual = useRef(false)
  const reducirMovimiento = usePrefersReducedMotion()
  const esMovil = useMediaQuery('(max-width: 767px)')
  const [reproduciendo, setReproduciendo] = useState(false)
  const fuente = esMovil && srcMovil ? srcMovil : src

  useEffect(() => {
    const v = video.current
    if (!v) return
    v.muted = true
    if (reducirMovimiento) {
      v.pause()
      return
    }

    const observer = new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting && !pausaManual.current) v.play().catch(() => {})
      else if (!entrada.isIntersecting) v.pause()
    })
    observer.observe(v)
    return () => observer.disconnect()
  }, [fuente, reducirMovimiento])

  const alternar = () => {
    const v = video.current
    if (!v) return
    if (v.paused) {
      pausaManual.current = false
      v.play().catch(() => {})
    } else {
      pausaManual.current = true
      v.pause()
    }
  }

  const alCargarDatos = (e: SyntheticEvent<HTMLVideoElement>) => {
    const { videoWidth, videoHeight } = e.currentTarget
    if (videoWidth && videoHeight) onProporcion?.(videoWidth / videoHeight)
  }

  return (
    <>
      <video
        ref={video}
        key={fuente}
        className={styles.video}
        src={fuente}
        poster={poster ?? undefined}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        onLoadedMetadata={alCargarDatos}
        onPlay={() => setReproduciendo(true)}
        onPause={() => setReproduciendo(false)}
      />
      <button
        type="button"
        className={styles.boton}
        onClick={alternar}
        aria-label={reproduciendo ? 'Pausar video' : 'Reproducir video'}
      >
        <span aria-hidden="true">{reproduciendo ? '❚❚' : '▶'}</span>
      </button>
    </>
  )
}
