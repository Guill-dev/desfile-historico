import type { Creador } from '@/types/contenido'
import { pendiente } from '@/utils/media'

/**
 * CREADORES — personas que crearon, organizaron, construyeron o conservan el desfile.
 * No agregar personas ni datos sin fuente confirmada.
 * Campos disponibles: ver `interface Creador` en src/types/contenido.ts
 */

/** PLACEHOLDERS */
export const creadores: Creador[] = [1, 2, 3, 4].map((n) => ({
  id: `creador-${n}`,
  nombre: '[Nombre del creador]',
  periodo: '[Año o período]',
  rol: '[Rol en el desfile]',
  retrato: pendiente('Retrato del creador'),
  descripcion: '[Descripción pendiente]',
  aporte: '[Aporte al desfile pendiente]',
  testimonios: [{ texto: '[Testimonio pendiente]', fuente: '[Fuente]' }],
}))
