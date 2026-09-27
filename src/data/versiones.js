import { pendiente } from '@/utils/media'

/**
 * VERSIONES — cada edición del desfile. El pueblo es el protagonista.
 * Para agregar un año basta con añadir un objeto a este arreglo.
 * Archivos sugeridos: /public/media/versiones/<anio>/
 *
 * @typedef {Object} Personaje
 * @property {string} personaje   Personaje representado.
 * @property {string} interprete  Persona que lo representó.
 * @property {import('@/utils/media').Media} [foto]
 *
 * @typedef {Object} Version
 * @property {number} anio
 * @property {string} titulo
 * @property {string} resumen
 * @property {import('@/utils/media').Media} portada
 * @property {Personaje[]} personajes
 * @property {string[]} cambios      Cambios importantes respecto a otras ediciones.
 * @property {string[]} destacados   Elementos destacados de la edición.
 * @property {import('@/utils/media').Media[]} galeria
 */

/** Años de ejemplo tomados del brief — confirmar ediciones reales. */
const anios = [2026, 2025, 2024]

/** @type {Version[]} — PLACEHOLDERS, ordenadas de la más reciente a la más antigua */
export const versiones = anios.map((anio) => ({
  anio,
  titulo: `[Título de la edición ${anio}]`,
  resumen: '[Información de la edición pendiente]',
  portada: pendiente(`Fotografía del desfile ${anio}`),
  personajes: [{ personaje: '[Personaje]', interprete: '[Persona que lo representó]' }],
  cambios: ['[Cambio importante pendiente]'],
  destacados: ['[Elemento destacado pendiente]'],
  galeria: [pendiente(`Galería ${anio}`)],
}))
