import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { iniciarMedicion, registrarVista } from '@/estadisticas/rastreador'

/**
 * Conecta la medición anónima del sitio (ver src/estadisticas/rastreador.ts).
 * Cuenta una vista por cada página nueva; los cambios de #ancla o de filtro no cuentan como otra página.
 */
export default function Medicion() {
  const { pathname } = useLocation()

  useEffect(() => iniciarMedicion(), [])
  useEffect(() => registrarVista(pathname), [pathname])

  return null
}
