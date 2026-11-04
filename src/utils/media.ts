import type { Media } from '@/types/contenido'

/** Crea un recurso pendiente: pendiente('Fotografía del desfile 1985') → alt "[Fotografía del desfile 1985]". */
export function pendiente(etiqueta: string, tipo: Media['tipo'] = 'imagen'): Media {
  return { tipo, src: null, alt: `[${etiqueta}]` }
}

/** Una foto que ya tiene su archivo: foto('/media/…/principal.jpg', 'Descripción de la foto') */
export function foto(src: string, alt: string): Media {
  return { tipo: 'imagen', src, alt }
}

/**
 * true si el recurso ya tiene su archivo.
 * El tipo de retorno `media is Media & { src: string }` es un "type guard": después de
 * `if (tieneArchivo(m))`, TypeScript sabe que m.src es un texto y no null.
 */
export function tieneArchivo(media: Media | undefined): media is Media & { src: string } {
  return Boolean(media?.src)
}

export function esPendiente(media: Media | undefined): boolean {
  return !tieneArchivo(media)
}
