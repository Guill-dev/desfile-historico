import { lazy } from 'react'

// Páginas que se cargan solo cuando se visitan (carga inicial más liviana).
export const PasosPagina = lazy(() => import('@/pages/Pasos/PasosPagina'))
export const CreadorDetalle = lazy(() => import('@/pages/CreadorDetalle/CreadorDetalle'))
export const ObjetoDetalle = lazy(() => import('@/pages/ObjetoDetalle/ObjetoDetalle'))
export const VersionDetalle = lazy(() => import('@/pages/VersionDetalle/VersionDetalle'))
export const MasSeccion = lazy(() => import('@/pages/Mas/MasSeccion'))
