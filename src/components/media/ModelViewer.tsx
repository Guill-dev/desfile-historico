import { useEffect, useRef } from 'react'
import { cx } from '@/utils/cx'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import MediaPlaceholder from './MediaPlaceholder'
import styles from './ModelViewer.module.css'

interface Props {
  /** Ruta del .glb; null = pendiente */
  src: string | null
  poster?: string
  alt?: string
  ratio?: string
  className?: string
  /**
   * true (ficha): se gira arrastrando con el mouse o el dedo, y se acerca pellizcando o con Ctrl + rueda.
   * false (tarjeta, que ya es un enlace): solo da vueltas despacio.
   */
  interactivo?: boolean
}

let visor: Promise<unknown> | null = null

/** El visor (model-viewer + three.js, ~1 MB) se descarga solo la primera vez que una página muestra un modelo */
function cargarVisor() {
  if (!visor) {
    // Los modelos van comprimidos con Draco: su decodificador se sirve desde el propio sitio (public/draco/)
    const global = self as typeof self & { ModelViewerElement?: Record<string, unknown> }
    global.ModelViewerElement = { ...global.ModelViewerElement, dracoDecoderLocation: `${import.meta.env.BASE_URL}draco/` }
    visor = import('@google/model-viewer')
  }
  return visor
}

/** Visor de modelos 3D (.glb). Sin archivo, muestra el recuadro de pendiente. */
export default function ModelViewer({ src, poster, alt, ratio = '1 / 1', className, interactivo = true }: Props) {
  const elemento = useRef<HTMLElement>(null)
  const reducirMovimiento = usePrefersReducedMotion()

  // El visor (~1 MB) se descarga cuando el modelo está por aparecer en pantalla, no al abrir la página:
  // así la portada carga primero lo que se ve arriba (video, textos, fotos)
  useEffect(() => {
    const el = elemento.current
    if (!src || !el) return
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada?.isIntersecting) return
        void cargarVisor()
        observador.disconnect()
      },
      { rootMargin: '600px 0px' },
    )
    observador.observe(el)
    return () => observador.disconnect()
  }, [src])

  // La rueda del mouse sigue bajando la página; para acercar: Ctrl + rueda (o pellizcar en el celular y el trackpad)
  useEffect(() => {
    const el = elemento.current
    if (!el || !interactivo) return
    const alGirarRueda = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) e.stopPropagation()
    }
    el.addEventListener('wheel', alGirarRueda, { capture: true })
    return () => el.removeEventListener('wheel', alGirarRueda, { capture: true })
  }, [interactivo, src])

  if (!src) return <MediaPlaceholder etiqueta={alt || '[Modelo 3D pendiente]'} ratio={ratio} className={className} />

  return (
    <model-viewer
      ref={elemento}
      src={src}
      poster={poster}
      alt={alt}
      loading="lazy"
      className={cx(styles.visor, className)}
      style={{ aspectRatio: ratio }}
      camera-controls={interactivo ? '' : undefined}
      auto-rotate={reducirMovimiento ? undefined : ''}
      auto-rotate-delay={interactivo ? '2500' : '0'}
      rotation-per-second={interactivo ? '18deg' : '24deg'}
      interaction-prompt={interactivo ? 'auto' : 'none'}
      touch-action="pan-y"
      shadow-intensity="1"
      exposure="1.05"
    />
  )
}
