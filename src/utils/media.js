/**
 * Formato común para TODO recurso multimedia del sitio (fotos, video, audio, 3D).
 *
 * @typedef {Object} Media
 * @property {'imagen'|'video'|'audio'|'modelo3d'} tipo
 * @property {string|null} src  Ruta dentro de /public, p. ej. "/media/objetos/mascara/foto-1.jpg".
 *                              null = recurso pendiente (se muestra un placeholder).
 * @property {string} alt       Texto alternativo; mientras está pendiente, la etiqueta "[...]".
 * @property {string} [poster]  Imagen previa (video o modelo 3D).
 * @property {string} [credito] Autor / fuente / archivo de procedencia.
 */

/** Crea un recurso pendiente: pendiente('Fotografía del desfile 1985') → alt "[Fotografía del desfile 1985]". */
export function pendiente(etiqueta, tipo = 'imagen') {
  return { tipo, src: null, alt: `[${etiqueta}]` }
}

export function esPendiente(media) {
  return !media || !media.src
}
