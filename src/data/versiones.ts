import type { Version } from '@/types/contenido'
import { pendiente } from '@/utils/media'

/**
 * VERSIONES — cada edición del desfile. El pueblo es el protagonista.
 * Para agregar un año basta con añadir un objeto a este arreglo.
 * Archivos sugeridos: /public/media/versiones/<anio>/
 * Campos disponibles: ver `interface Version` en src/types/contenido.ts
 */

/** Años de ejemplo tomados del brief — confirmar ediciones reales. */
const anios = [2026, 2025, 2024]

/** PLACEHOLDERS, ordenadas de la más reciente a la más antigua */
export const versiones: Version[] = anios.map((anio) => ({
  anio,
  titulo: `[Título de la edición ${anio}]`,
  resumen: '[Información de la edición pendiente]',
  portada: pendiente(`Fotografía del desfile ${anio}`),
  personajes: [{ personaje: '[Personaje]', interprete: '[Persona que lo representó]' }],
  cambios: ['[Cambio importante pendiente]'],
  destacados: ['[Elemento destacado pendiente]'],
  galeria: [1, 2, 3, 4, 5, 6].map((n) => pendiente(`Foto ${n} de la edición ${anio}`)),
}))
