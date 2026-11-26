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

/**
 * Las dos versiones de una foto para el navegador (atributo srcset): la miniatura (640 px) y la completa (hasta
 * 1600 px). Con `sizes` (qué tan ancha se ve), el navegador escoge sola la que alcanza: en una tarjeta pequeña o
 * en el celular, la miniatura (mucho más liviana); en un recuadro grande o una pantalla muy nítida, la completa.
 * Sin miniatura, undefined (se usa la foto tal cual).
 */
export function juegoDeFoto(media: Media | undefined): string | undefined {
  return media?.miniatura && media.src ? `${media.miniatura} 640w, ${media.src} 1600w` : undefined
}

/**
 * Descarga y decodifica una foto antes de mostrarla: cuando la etiqueta <img> la pida, ya está lista y aparece
 * de una (sin verse en blanco ni a pedazos). Con `sizes`, escoge la misma versión que va a escoger la página
 * (ver juegoDeFoto). Devuelve una promesa que se cumple cuando está lista (o si falla).
 */
export function precargarFoto(media: Media | undefined, sizes?: string): Promise<void> | undefined {
  if (!tieneArchivo(media) || media.tipo !== 'imagen') return undefined
  const img = new Image()
  img.decoding = 'async'
  const juego = sizes ? juegoDeFoto(media) : undefined
  if (sizes && juego) {
    img.sizes = sizes
    img.srcset = juego
  }
  img.src = media.src
  return img.decode().catch(() => {})
}
