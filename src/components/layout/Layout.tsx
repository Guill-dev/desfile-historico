import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { tituloPagina } from '@/utils/titulo'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import ScrollManager from './ScrollManager'

/** Mientras carga una página: un aviso y el título general en la pestaña */
const cargando = (
  <p className="contenedor cargando mono">
    <title>{tituloPagina()}</title>
    Cargando…
  </p>
)

/**
 * Marco común de todas las páginas.
 * Cada página pone su propio <title> (React 19 lo lleva solo al <head> del documento).
 */
export default function Layout() {
  return (
    <>
      <a href="#contenido" className="skip-link">Saltar al contenido</a>
      <ScrollManager />
      <SiteHeader />
      <main id="contenido">
        <Suspense fallback={cargando}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  )
}
