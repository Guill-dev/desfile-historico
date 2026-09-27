import { pendiente } from '@/utils/media'

/**
 * PASOS — el recorrido o proceso del desfile.
 * Estructura flexible: el contenido real se definirá después.
 *
 * @typedef {Object} Paso
 * @property {string} id       Identificador único (sin espacios).
 * @property {number} numero   Orden en el recorrido.
 * @property {string} titulo
 * @property {string} resumen  Una o dos líneas.
 * @property {string} [texto]  Desarrollo más largo (opcional).
 * @property {import('@/utils/media').Media[]} media
 */

/** @type {Paso[]} — PLACEHOLDERS (son muchos: tienen página propia en /pasos) */
export const pasos = Array.from({ length: 12 }, (_, i) => i + 1).map((n) => ({
  id: `paso-${n}`,
  numero: n,
  titulo: `[Título del paso ${n}]`,
  resumen: '[Descripción pendiente]',
  media: [pendiente(`Fotografía del paso ${n}`)],
}))
