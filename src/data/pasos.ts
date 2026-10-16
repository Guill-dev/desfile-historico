import type { Paso } from '@/types/contenido'
import { pendiente } from '@/utils/media'

/**
 * PASOS — el recorrido o proceso del desfile.
 * Estructura flexible: el contenido real se definirá después.
 * Campos disponibles: ver `interface Paso` en src/types/contenido.ts
 */

/** PLACEHOLDERS (son muchos: tienen página propia en /pasos) */
export const pasos: Paso[] = Array.from({ length: 12 }, (_, i) => i + 1).map((n) => ({
  id: `paso-${n}`,
  numero: n,
  titulo: `[Título del paso ${n}]`,
  resumen: '[Descripción pendiente]',
  media: [pendiente(`Fotografía del paso ${n}`)],
}))
