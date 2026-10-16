import type { ComponentType } from 'react'
import type { SeccionMas } from '@/types/contenido'

/** Lo que recibe la página propia de una sección de "Más" */
export interface PaginaMasProps {
  seccion: SeccionMas
}

/**
 * Páginas propias de las secciones de "Más", por slug (ver data/mas.ts).
 * Si un slug no aparece aquí se muestra la plantilla genérica "en construcción".
 *
 * Para registrar una (se carga solo cuando se visita):
 *   import { lazy } from 'react'
 *   ...
 *   galeria: lazy(() => import('./secciones/Galeria')),
 */
export const paginasMas: Partial<Record<string, ComponentType<PaginaMasProps>>> = {}
