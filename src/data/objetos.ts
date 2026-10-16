import type { Objeto } from '@/types/contenido'
import { pendiente } from '@/utils/media'

/**
 * OBJETOS — piezas ancestrales, históricas o representativas del desfile.
 * Archivos sugeridos: /public/media/objetos/<id>/  (fotos + modelo.glb)
 * Campos disponibles: ver `interface Objeto` en src/types/contenido.ts
 */

/** PLACEHOLDERS */
export const objetos: Objeto[] = [1, 2, 3, 4, 5, 6].map((n) => ({
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
