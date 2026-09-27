import { Link } from 'react-router'
import { cx } from '@/utils/cx'
import styles from './PrevNext.module.css'

/** Navegación "anterior / siguiente" entre fichas (objetos, versiones, creadores). */
export default function PrevNext({ anterior, siguiente }) {
  return (
    <nav className={styles.nav} aria-label="Navegación entre fichas">
      {anterior ? (
        <Link to={anterior.to} className={styles.enlace}>
          <span className={styles.rotulo}>Anterior</span>
          {anterior.titulo}
        </Link>
      ) : <span />}
      {siguiente && (
        <Link to={siguiente.to} className={cx(styles.enlace, styles.derecha)}>
          <span className={styles.rotulo}>Siguiente</span>
          {siguiente.titulo}
        </Link>
      )}
    </nav>
  )
}
