import { lazy, type ComponentType } from 'react'
import type { SeccionMas } from '@/types/contenido'

/** Lo que recibe la página propia de una sección de "Más" */
export interface PaginaMasProps {
  seccion: SeccionMas
}

/**
 * Páginas propias de las secciones de "Más", por slug (ver data/mas.ts).
 * Si un slug no aparece aquí se muestra la plantilla genérica "en construcción".
 * Cada una se carga solo cuando se visita (lazy).
 *
 * Para registrar otra: crearla en ./secciones/ y añadir una línea, p. ej.
 *   contacto: lazy(() => import('./secciones/ContactoPagina')),
 */
export const paginasMas: Partial<Record<string, ComponentType<PaginaMasProps>>> = {
  historia: lazy(() => import('./secciones/HistoriaPagina')),
  galeria: lazy(() => import('./secciones/GaleriaPagina')),
  testimonios: lazy(() => import('./secciones/TestimoniosPagina')),
  contacto: lazy(() => import('./secciones/ContactoPagina')),
  creditos: lazy(() => import('./secciones/CreditosPagina')),
}
