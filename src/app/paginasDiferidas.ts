import { lazy } from 'react'

// Páginas que se cargan aparte de la portada (carga inicial más liviana).
const cargas = {
  pasos: () => import('@/pages/Pasos/PasosPagina'),
  creadores: () => import('@/pages/Listados/CreadoresPagina'),
  objetos: () => import('@/pages/Listados/ObjetosPagina'),
  versiones: () => import('@/pages/Listados/VersionesPagina'),
  creador: () => import('@/pages/CreadorDetalle/CreadorDetalle'),
  objeto: () => import('@/pages/ObjetoDetalle/ObjetoDetalle'),
  version: () => import('@/pages/VersionDetalle/VersionDetalle'),
  mas: () => import('@/pages/Mas/MasSeccion'),
}

export const PasosPagina = lazy(cargas.pasos)
export const CreadoresPagina = lazy(cargas.creadores)
export const ObjetosPagina = lazy(cargas.objetos)
export const VersionesPagina = lazy(cargas.versiones)
export const CreadorDetalle = lazy(cargas.creador)
export const ObjetoDetalle = lazy(cargas.objeto)
export const VersionDetalle = lazy(cargas.version)
export const MasSeccion = lazy(cargas.mas)
export const AdminPagina = lazy(() => import('@/pages/Admin/AdminPagina'))

/** Las páginas de "Más" (ver pages/Mas/paginas.ts) */
const cargasMas = [
  () => import('@/pages/Mas/secciones/HistoriaPagina'),
  () => import('@/pages/Mas/secciones/GaleriaPagina'),
  () => import('@/pages/Mas/secciones/TestimoniosPagina'),
  () => import('@/pages/Mas/secciones/ContactoPagina'),
  () => import('@/pages/Mas/secciones/CreditosPagina'),
]

/**
 * Descarga, sin apuro, el código de las demás páginas cuando la portada ya terminó de cargar y el
 * navegador está desocupado: así, al tocar un enlace, la página abre al instante (sin "Cargando…").
 * Es poco (unos 100 kB) y no trae fotos ni el visor 3D. Si la persona activó el ahorro de datos, no se hace.
 */
export function precargarPaginas(): void {
  const conexion = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  if (conexion?.saveData) return

  // Safari no tiene requestIdleCallback: ahí se espera un poco y listo
  const cuandoPueda = (fn: () => void) => {
    if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(fn, { timeout: 4000 })
    else setTimeout(fn, 1500)
  }

  const empezar = () =>
    cuandoPueda(() => {
      // Una por una, para no competir con lo que se está viendo
      const todas = [...Object.values(cargas), ...cargasMas]
      const siguiente = () => {
        const carga = todas.shift()
        if (carga) void carga().catch(() => {}).finally(() => cuandoPueda(siguiente))
      }
      siguiente()
    })

  if (document.readyState === 'complete') window.setTimeout(empezar, 1500)
  else window.addEventListener('load', () => window.setTimeout(empezar, 1500), { once: true })
}
