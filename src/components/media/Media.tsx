import type { CSSProperties } from 'react'
import type { Media as Recurso } from '@/types/contenido'
import MediaPlaceholder from './MediaPlaceholder'
import ModelViewer from './ModelViewer'

interface Props {
  media: Recurso | undefined
  /** Proporción, p. ej. '4 / 3' */
  ratio?: string
  className?: string
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
      return <img src={src} alt={alt} loading="lazy" decoding="async" sizes={sizes} className={className} style={estilo} />
  }
}
