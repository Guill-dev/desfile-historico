import { Suspense, useEffect } from 'react'
import { Outlet } from 'react-router'
import { tituloPagina } from '@/utils/titulo'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import ScrollManager from './ScrollManager'
import Medicion from './Medicion'
import { precargarPaginas } from '@/app/paginasDiferidas'

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
  // Cuando la página termina de cargar, se descargan sin apuro las demás para que abran al instante
  useEffect(() => precargarPaginas(), [])

  return (
    <>
      <a href="#contenido" className="skip-link">Saltar al contenido</a>
      <ScrollManager />
      <Medicion />
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
