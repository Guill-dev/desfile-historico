import { pendiente } from '@/utils/media'

/**
 * OBJETOS — piezas ancestrales, históricas o representativas del desfile.
 * Archivos sugeridos: /public/media/objetos/<id>/  (fotos + modelo.glb)
 *
 * @typedef {Object} Objeto
 * @property {string} id
 * @property {string} nombre
 * @property {string} epoca          Año o época.
 * @property {string} procedencia
 * @property {string[]} materiales
 * @property {string} descripcion    Descripción breve (vitrina).
 * @property {string} historia       Historia de la pieza (ficha completa).
 * @property {string} significado    Significado cultural.
 * @property {import('@/utils/media').Media[]} imagenes
 * @property {import('@/utils/media').Media} modelo3d  tipo 'modelo3d'; src null = pendiente.
 */

/** @type {Objeto[]} — PLACEHOLDERS */
export const objetos = [1, 2, 3, 4, 5, 6].map((n) => ({
  id: `objeto-${n}`,
  nombre: `[Nombre del objeto ${n}]`,
  epoca: '[Año o época]',
  procedencia: '[Procedencia]',
  materiales: ['[Material]'],
  descripcion: '[Descripción pendiente]',
  historia: '[Historia del objeto pendiente]',
  significado: '[Significado cultural pendiente]',
  imagenes: [pendiente(`Fotografía del objeto ${n}`)],
  modelo3d: pendiente('Modelo 3D pendiente', 'modelo3d'),
}))
