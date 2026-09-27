import { pendiente } from '@/utils/media'

/**
 * CREADORES — personas que crearon, organizaron, construyeron o conservan el desfile.
 * No agregar personas ni datos sin fuente confirmada.
 *
 * @typedef {Object} Testimonio
 * @property {string} texto
 * @property {string} [fuente]  Quién lo dice / dónde se registró.
 * @property {string} [fecha]
 *
 * @typedef {Object} Creador
 * @property {string} id
 * @property {string} nombre
 * @property {string} periodo      Año o período de participación.
 * @property {string} rol          Organización, construcción, conservación…
 * @property {import('@/utils/media').Media} retrato
 * @property {string} descripcion
 * @property {string} aporte       Qué aportó al desfile.
 * @property {Testimonio[]} testimonios
 * @property {import('@/utils/media').Media[]} [galeria]
 * @property {string} [extra]      Información adicional.
 */

/** @type {Creador[]} — PLACEHOLDERS */
export const creadores = [1, 2, 3, 4].map((n) => ({
  id: `creador-${n}`,
  nombre: '[Nombre del creador]',
  periodo: '[Año o período]',
  rol: '[Rol en el desfile]',
  retrato: pendiente('Retrato del creador'),
  descripcion: '[Descripción pendiente]',
  aporte: '[Aporte al desfile pendiente]',
  testimonios: [{ texto: '[Testimonio pendiente]', fuente: '[Fuente]' }],
}))
