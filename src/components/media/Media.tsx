import type { CSSProperties } from 'react'
import type { Media as Recurso } from '@/types/contenido'
import { juegoDeFoto } from '@/utils/media'
import MediaPlaceholder from './MediaPlaceholder'
import ModelViewer from './ModelViewer'

interface Props {
  media: Recurso | undefined
  /** Proporción, p. ej. '4 / 3' */
  ratio?: string
  className?: string
  /**
   * Qué tan ancha se ve la foto (atributo sizes, p. ej. '(max-width: 899px) 46vw, 400px'). Con esto, si la foto
   * tiene miniatura, el navegador usa la miniatura donde alcanza (mucho más liviana) y la completa donde hace falta.
   */
  sizes?: string
}

/**
 * Punto único para mostrar cualquier recurso multimedia (ver `Media` en types/contenido.ts).
 * Si el recurso está pendiente (src null) muestra un placeholder con su etiqueta.
 */
export default function Media({ media, ratio, className, sizes }: Props) {
  if (!media) return null
  const { tipo, src, alt, poster } = media

  if (tipo === 'modelo3d') return <ModelViewer src={src} poster={poster} alt={alt} ratio={ratio} className={className} />
  if (!src) return <MediaPlaceholder etiqueta={alt} ratio={ratio} className={className} />

  const estilo: CSSProperties | undefined = ratio ? { aspectRatio: ratio, objectFit: 'cover', width: '100%' } : undefined

  switch (tipo) {
    case 'video':
      return <video src={src} poster={poster} controls preload="metadata" className={className} style={estilo} />
    case 'audio':
      return <audio src={src} controls preload="none" className={className} />
    default:
      return (
        <img
          src={src}
          srcSet={sizes ? juegoDeFoto(media) : undefined}
          sizes={sizes}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={className}
          style={estilo}
        />
      )
  }
}
