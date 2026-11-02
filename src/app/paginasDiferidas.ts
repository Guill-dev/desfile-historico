import { lazy } from 'react'

// Páginas que se cargan solo cuando se visitan (carga inicial más liviana).
export const PasosPagina = lazy(() => import('@/pages/Pasos/PasosPagina'))
export const CreadoresPagina = lazy(() => import('@/pages/Listados/CreadoresPagina'))
export const ObjetosPagina = lazy(() => import('@/pages/Listados/ObjetosPagina'))
export const VersionesPagina = lazy(() => import('@/pages/Listados/VersionesPagina'))
export const CreadorDetalle = lazy(() => import('@/pages/CreadorDetalle/CreadorDetalle'))
export const ObjetoDetalle = lazy(() => import('@/pages/ObjetoDetalle/ObjetoDetalle'))
export const VersionDetalle = lazy(() => import('@/pages/VersionDetalle/VersionDetalle'))
export const MasSeccion = lazy(() => import('@/pages/Mas/MasSeccion'))
export const AdminPagina = lazy(() => import('@/pages/Admin/AdminPagina'))
