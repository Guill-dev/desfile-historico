import MediaPlaceholder from './MediaPlaceholder'
import ModelViewer from './ModelViewer'

/**
 * Punto único para mostrar cualquier recurso multimedia (ver formato en utils/media.js).
 * Si el recurso está pendiente (src null) muestra un placeholder con su etiqueta.
 */
export default function Media({ media, ratio, className, sizes }) {
  if (!media) return null
  const { tipo, src, alt, poster } = media

  if (tipo === 'modelo3d') return <ModelViewer src={src} poster={poster} alt={alt} ratio={ratio} className={className} />
  if (!src) return <MediaPlaceholder etiqueta={alt} ratio={ratio} className={className} />

  const estilo = ratio ? { aspectRatio: ratio, objectFit: 'cover', width: '100%' } : undefined

  switch (tipo) {
    case 'video':
      return <video src={src} poster={poster} controls preload="metadata" className={className} style={estilo} />
    case 'audio':
      return <audio src={src} controls preload="none" className={className} />
    default:
      return <img src={src} alt={alt} loading="lazy" decoding="async" sizes={sizes} className={className} style={estilo} />
  }
}
