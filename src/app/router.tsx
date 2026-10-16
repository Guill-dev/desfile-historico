import { Navigate, createBrowserRouter } from 'react-router'
import Layout from '@/components/layout/Layout'
import Recorrido from '@/pages/Recorrido/Recorrido'
import NoEncontrado from '@/pages/NoEncontrado/NoEncontrado'
import { CreadorDetalle, MasSeccion, ObjetoDetalle, PasosPagina, VersionDetalle } from './paginasDiferidas'

/**
 * Mapa del sitio:
 *   /                   Recorrido (Inicio → muestra de Pasos → Creadores → Objetos → Versiones → Más)
 *   /pasos              Todos los pasos, con índice (/pasos#paso-3)
 *   /creadores/:id      Ficha de una persona
 *   /objetos/:id        Ficha museográfica de un objeto (foto / 3D)
 *   /versiones/:anio    Una edición del desfile
 *   /mas                Lleva al bloque "Más" del recorrido
 *   /mas/:slug          Historia, Galería, Testimonios, Archivo, Créditos, Contacto…
 */
export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Recorrido /> },
      { path: 'pasos', element: <PasosPagina /> },
      { path: 'creadores/:id', element: <CreadorDetalle /> },
      { path: 'objetos/:id', element: <ObjetoDetalle /> },
      { path: 'versiones/:anio', element: <VersionDetalle /> },
      { path: 'mas', element: <Navigate to={{ pathname: '/', hash: '#mas' }} replace /> },
      { path: 'mas/:slug', element: <MasSeccion /> },
      { path: '*', element: <NoEncontrado /> },
    ],
  },
])
