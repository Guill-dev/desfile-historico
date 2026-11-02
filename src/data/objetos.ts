import type { Objeto } from '@/types/contenido'
import { pendiente } from '@/utils/media'

/**
 * OBJETOS — piezas ancestrales, históricas o representativas del desfile.
 * Archivos sugeridos: /public/media/objetos/<id>/  (fotos + modelo.glb)
 * Campos disponibles: ver `interface Objeto` en src/types/contenido.ts
 */

/** Piezas de ejemplo mientras llega el inventario real de la colección */
const TOTAL_PIEZAS = 50

/** PLACEHOLDERS. El orden de esta lista es el número de cada pieza (Nº 01, Nº 02…), aunque se muestren al azar. */
export const objetos: Objeto[] = Array.from({ length: TOTAL_PIEZAS }, (_, i) => i + 1).map((n) => ({
  id: `objeto-${n}`,
  nombre: `[Nombre del objeto ${n}]`,
  epoca: '[Año o época]',
  procedencia: '[Procedencia]',
  materiales: ['[Material]'],
  descripcion: '[Descripción pendiente]',
  historia: '[Historia del objeto pendiente]',
  significado: '[Significado cultural pendiente]',
  // La primera es la principal (vitrina y ficha); las demás, otras vistas de la pieza
  imagenes: [1, 2, 3].map((v) => pendiente(`Fotografía del objeto ${n} — vista ${v}`)),
  modelo3d: pendiente('Modelo 3D pendiente', 'modelo3d'),
}))
