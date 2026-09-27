import { Link } from 'react-router'
import { cx } from '@/utils/cx'
import styles from './Boton.module.css'

/**
 * Botón del sitio. Variantes:
 *  - 'contorno' (por defecto): borde del color del texto; al pasar el mouse se invierte según el tema.
 *  - 'primario': rojo de la bandera. Uno por bloque, para la acción principal.
 * Con `to` es un enlace interno; con `href`, externo; sin ninguno, un <button>.
 */
export default function Boton({ to, href, variante = 'contorno', className, children, ...resto }) {
  const clases = cx(styles.boton, styles[variante], className)
  if (to) return <Link to={to} className={clases} {...resto}>{children}</Link>
  if (href) return <a href={href} className={clases} {...resto}>{children}</a>
  return <button type="button" className={clases} {...resto}>{children}</button>
}
