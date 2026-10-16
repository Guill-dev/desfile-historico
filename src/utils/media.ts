import type { Media } from '@/types/contenido'

/** Crea un recurso pendiente: pendiente('Fotografía del desfile 1985') → alt "[Fotografía del desfile 1985]". */
export function pendiente(etiqueta: string, tipo: Media['tipo'] = 'imagen'): Media {
  return { tipo, src: null, alt: `[${etiqueta}]` }
}

export function esPendiente(media: Media | undefined): boolean {
  return !media || !media.src
}
