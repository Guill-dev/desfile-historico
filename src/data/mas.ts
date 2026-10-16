import type { SeccionMas } from '@/types/contenido'

/**
 * MÁS — zona extensible. Cada entrada genera un enlace en el menú y una ruta /mas/<slug>.
 * Para agregar una sección: añadir una entrada aquí. Si necesita una página propia,
 * crearla en src/pages/Mas/secciones/ y registrarla en src/pages/Mas/paginas.ts.
 */
export const seccionesMas: SeccionMas[] = [
  { slug: 'historia', titulo: 'Historia', descripcion: '[Descripción pendiente]' },
  { slug: 'galeria', titulo: 'Galería', descripcion: '[Descripción pendiente]' },
  { slug: 'testimonios', titulo: 'Testimonios', descripcion: '[Descripción pendiente]' },
  { slug: 'archivo', titulo: 'Archivo', descripcion: '[Descripción pendiente]' },
  { slug: 'creditos', titulo: 'Créditos', descripcion: '[Descripción pendiente]' },
  { slug: 'contacto', titulo: 'Contacto', descripcion: '[Descripción pendiente]' },
]
