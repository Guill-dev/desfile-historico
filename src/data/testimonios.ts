import type { GrupoTestimonio, TestimonioArchivo } from '@/types/contenido'
import { pendiente } from '@/utils/media'

/**
 * TESTIMONIOS — la página /mas/testimonios: lo que cuenta la gente del pueblo.
 * ⚠️ Solo testimonios con autorización de la persona (o de su acudiente, si es menor de edad).
 * Campos disponibles: ver `interface TestimonioArchivo` en src/types/contenido.ts
 */

/**
 * Nombre visible de cada grupo del filtro. `Record` obliga a escribir uno por cada grupo:
 * si se agrega un grupo en contenido.ts y falta aquí, TypeScript lo marca.
 * En la página solo aparecen los grupos que tienen testimonios.
 */
export const gruposTestimonio: Record<GrupoTestimonio, string> = {
  participantes: 'Participantes',
  organizadores: 'Organizadores',
  oficios: 'Oficios del desfile', // vestuario, carrozas, música…
  publico: 'Público',
}

/** PLACEHOLDERS, en el orden en que se muestran */
export const testimonios: TestimonioArchivo[] = [
  {
    id: 'testimonio-1',
    destacado: true, // el que abre la página en grande
    grupo: 'participantes',
    nombre: '[Nombre de la persona]',
    relacion: '[Relación con el desfile, p. ej. participante desde [año]]',
    texto: '[Testimonio pendiente: un recuerdo del desfile contado con sus propias palabras.]',
    fuente: '[Entrevista: quién la hizo y dónde]',
    fecha: '[Fecha]',
    retrato: pendiente('Retrato de la persona'),
    grabacion: pendiente('Grabación del testimonio', 'audio'),
  },
  {
    id: 'testimonio-2',
    grupo: 'participantes',
    nombre: '[Nombre de la persona]',
    relacion: '[Relación con el desfile]',
    texto: '[Testimonio pendiente]',
    fecha: '[Fecha]',
  },
  {
    id: 'testimonio-3',
    grupo: 'organizadores',
    nombre: '[Nombre de la persona]',
    relacion: '[Relación con el desfile]',
    texto: '[Testimonio pendiente]',
    fuente: '[Entrevista: quién la hizo y dónde]',
    fecha: '[Fecha]',
    grabacion: pendiente('Video del testimonio', 'video'),
  },
  {
    id: 'testimonio-4',
    grupo: 'oficios',
    nombre: '[Nombre de la persona]',
    relacion: '[Oficio: vestuario, carrozas, música…]',
    texto: '[Testimonio pendiente]',
    fecha: '[Fecha]',
  },
  {
    id: 'testimonio-5',
    grupo: 'publico',
    nombre: '[Nombre de la persona]',
    relacion: '[Relación con el desfile]',
    texto: '[Testimonio pendiente]',
    fecha: '[Fecha]',
  },
  {
    id: 'testimonio-6',
    grupo: 'participantes',
    nombre: '[Nombre de la persona]',
    relacion: '[Relación con el desfile]',
    texto: '[Testimonio pendiente]',
    fecha: '[Fecha]',
    ediciones: [2024], // ejemplo: muestra un enlace a /versiones/2024
  },
]
