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
  /** Con `interactivo`: la manito de model-viewer que invita a girarlo (false si la página ya lo explica) */
  aviso?: boolean
  /**
   * Con `interactivo`: empieza a dar vueltas apenas aparece (como en las tarjetas), en vez de esperar 2.5 s.
   * Después de que la persona lo gira con la mano, sí espera 2.5 s antes de seguir solo.
   */
  girarYa?: boolean
}

let visor: Promise<unknown> | null = null

/** El visor (model-viewer + three.js, ~1 MB) se descarga solo la primera vez que una página muestra un modelo */
function cargarVisor() {
  if (!visor) {
    // Los modelos van comprimidos con Draco: su decodificador se sirve desde el propio sitio (public/draco/)
    const global = self as typeof self & { ModelViewerElement?: Record<string, unknown> }
    global.ModelViewerElement = { ...global.ModelViewerElement, dracoDecoderLocation: `${import.meta.env.BASE_URL}draco/` }
    visor = import('@google/model-viewer').then((m) => {
      // Guarda en memoria los últimos 24 modelos (y no 5): volver a una pieza ya vista es instantáneo
      m.ModelViewerElement.modelCacheSize = 24
      return m
    })
  }
  return visor
}

/** Visor de modelos 3D (.glb). Sin archivo, muestra el recuadro de pendiente. */
export default function ModelViewer({
  src,
  poster,
  alt,
  ratio = '1 / 1',
  className,
  interactivo = true,
  aviso = interactivo,
  girarYa = false,
}: Props) {
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

  // Cuando el modelo terminó de cargar se marca (data-listo): así puede aparecer suave, sin saltos
  useEffect(() => {
    const el = elemento.current
    if (!el || !src) return
    const alCargar = () => el.setAttribute('data-listo', '')
    el.addEventListener('load', alCargar)
    return () => el.removeEventListener('load', alCargar)
  }, [src])

  // girarYa: la primera vez que la persona lo mueve, desde ahí espera 2.5 s antes de volver a girar solo
  useEffect(() => {
    const el = elemento.current
    if (!el || !src || !interactivo || !girarYa) return
    const alMover = (e: Event) => {
      if ((e as CustomEvent<{ source?: string }>).detail?.source !== 'user-interaction') return
      el.setAttribute('auto-rotate-delay', '2500')
      el.removeEventListener('camera-change', alMover)
    }
    el.addEventListener('camera-change', alMover)
    return () => el.removeEventListener('camera-change', alMover)
  }, [src, interactivo, girarYa])

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
      auto-rotate-delay={interactivo && !girarYa ? '2500' : '0'}
      rotation-per-second={interactivo && !girarYa ? '18deg' : '24deg'}
      interaction-prompt={interactivo && aviso ? 'auto' : 'none'}
      touch-action="pan-y"
      shadow-intensity="1"
      exposure="1.05"
    />
  )
}
