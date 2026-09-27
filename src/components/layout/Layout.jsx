import { Suspense } from 'react'
import { Outlet } from 'react-router'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import ScrollManager from './ScrollManager'

/** Marco común de todas las páginas. */
export default function Layout() {
  return (
    <>
      <a href="#contenido" className="skip-link">Saltar al contenido</a>
      <ScrollManager />
      <SiteHeader />
      <main id="contenido">
        <Suspense fallback={<p className="contenedor cargando mono">Cargando…</p>}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  )
}
