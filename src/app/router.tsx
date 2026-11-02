import { Suspense } from 'react'
import { Navigate, createBrowserRouter } from 'react-router'
import Layout from '@/components/layout/Layout'
import Recorrido from '@/pages/Recorrido/Recorrido'
import NoEncontrado from '@/pages/NoEncontrado/NoEncontrado'
import {
  AdminPagina,
  CreadorDetalle,
  CreadoresPagina,
  MasSeccion,
  ObjetoDetalle,
  ObjetosPagina,
  PasosPagina,
  VersionDetalle,
  VersionesPagina,
} from './paginasDiferidas'

/**
 * Mapa del sitio:
 *   /                   Recorrido (Inicio → muestra de Pasos → Creadores → Objetos → Versiones → Más)
 *   /pasos              Todos los pasos, con índice (/pasos#paso-3)
 *   /creadores          Todas las personas ("Ver todos" del inicio en el celular)
 *   /creadores/:id      Ficha de una persona
 *   /objetos            Toda la colección
 *   /objetos/:id        Ficha museográfica de un objeto (foto / 3D)
 *   /versiones          Todas las ediciones
 *   /versiones/:anio    Una edición del desfile
 *   /mas                Lleva al bloque "Más" del recorrido
 *   /mas/:slug          Historia, Galería, Testimonios, Archivo, Créditos, Contacto…
 *   /admin              Panel de estadísticas (fuera del marco del sitio, sin menú ni pie)
 */
export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Recorrido /> },
      { path: 'pasos', element: <PasosPagina /> },
      { path: 'creadores', element: <CreadoresPagina /> },
      { path: 'creadores/:id', element: <CreadorDetalle /> },
      { path: 'objetos', element: <ObjetosPagina /> },
      { path: 'objetos/:id', element: <ObjetoDetalle /> },
      { path: 'versiones', element: <VersionesPagina /> },
      { path: 'versiones/:anio', element: <VersionDetalle /> },
      { path: 'mas', element: <Navigate to={{ pathname: '/', hash: '#mas' }} replace /> },
      { path: 'mas/:slug', element: <MasSeccion /> },
      { path: '*', element: <NoEncontrado /> },
    ],
  },
  {
    path: 'admin',
    element: (
      <Suspense fallback={null}>
        <AdminPagina />
      </Suspense>
    ),
  },
])
