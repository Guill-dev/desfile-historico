import type { ReactNode } from 'react'
import { Link, type To } from 'react-router'
import { cx } from '@/utils/cx'
import styles from './Boton.module.css'

type Variante = 'contorno' | 'primario'

interface Props {
  /** Enlace interno: '/pasos' o { hash: '#historia' } */
  to?: To
  /** Enlace externo: 'https://…' */
  href?: string
  variante?: Variante
  className?: string
  onClick?: () => void
  children: ReactNode
}

/**
 * Botón del sitio. Variantes:
 *  - 'contorno' (por defecto): borde del color del texto; al pasar el mouse se invierte según el tema.
 *  - 'primario': rojo de la bandera. Uno por bloque, para la acción principal.
 * Con `to` es un enlace interno; con `href`, externo; sin ninguno, un <button>.
 */
export default function Boton({ to, href, variante = 'contorno', className, onClick, children }: Props) {
  const clases = cx(styles.boton, styles[variante], className)
  if (to) return <Link to={to} className={clases} onClick={onClick}>{children}</Link>
  if (href) return <a href={href} className={clases} onClick={onClick}>{children}</a>
  return <button type="button" className={clases} onClick={onClick}>{children}</button>
}
