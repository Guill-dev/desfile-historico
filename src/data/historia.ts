import type { Historia } from '@/types/contenido'
import { pendiente } from '@/utils/media'

/**
 * HISTORIA — la página /mas/historia: el relato completo del desfile.
 * ⚠️ Solo información confirmada. Anota en `fuentes` de dónde sale cada dato.
 * Campos disponibles: ver `interface Historia` en src/types/contenido.ts
 */

/** PLACEHOLDERS */
export const historia: Historia = {
  // Letra grande al empezar la página: en pocas líneas, qué es el desfile
  entradilla: '[Párrafo de entrada pendiente: en pocas líneas, qué es el Desfile Histórico y qué cuenta.]',

  // Datos breves. Puedes cambiar, quitar o agregar los que quieras.
  datos: [
    { etiqueta: 'Primera edición', valor: '[Año]' },
    { etiqueta: 'Se celebra', valor: '[Fecha o temporada]' },
    { etiqueta: 'Pasos', valor: '79' },
    { etiqueta: 'Lugar', valor: 'Gualmatán, Nariño' },
  ],

  // El relato, por capítulos. Cada uno sale en el índice de la página.
  // Ejemplo de orden: los orígenes → cómo creció → el desfile hoy.
  capitulos: [
    {
      id: 'capitulo-1',
      epoca: '[Años o época]',
      titulo: '[Título del capítulo 1]',
      parrafos: ['[Texto del capítulo pendiente]', '[Otro párrafo, si hace falta]'],
      imagen: pendiente('Fotografía histórica del capítulo 1'),
      cita: { texto: '[Cita de alguien que lo vivió]', fuente: '[Quién lo dice]' },
    },
    {
      id: 'capitulo-2',
      epoca: '[Años o época]',
      titulo: '[Título del capítulo 2]',
      parrafos: ['[Texto del capítulo pendiente]'],
      imagen: pendiente('Fotografía histórica del capítulo 2'),
    },
    {
      id: 'capitulo-3',
      epoca: '[Años o época]',
      titulo: '[Título del capítulo 3]',
      parrafos: ['[Texto del capítulo pendiente]'],
    },
  ],

  // Línea de tiempo. Si `fecha` es un año con edición publicada (ej. '2024'), enlaza a ella sola.
  hitos: [
    { fecha: '[Año]', titulo: '[Momento clave]', texto: '[Qué pasó]' },
    { fecha: '[Año]', titulo: '[Momento clave]', texto: '[Qué pasó]' },
    { fecha: '[Año]', titulo: '[Momento clave]', texto: '[Qué pasó]' },
    { fecha: '[Año]', titulo: '[Momento clave]' },
  ],

  // Libros, entrevistas, actas, periódicos… de donde sale la información
  fuentes: [
    { titulo: '[Título de la fuente]', autor: '[Autor, archivo o persona entrevistada]', tipo: '[Libro, entrevista, acta…]', anio: '[Año]' },
    { titulo: '[Título de la fuente]', autor: '[Autor, archivo o persona entrevistada]', tipo: '[Libro, entrevista, acta…]', anio: '[Año]' },
  ],
}
