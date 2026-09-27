import { Link } from 'react-router'
import { cx } from '@/utils/cx'
import styles from './CabeceraPagina.module.css'

/** Banda oscura con la que abre cada página interior (fichas, Pasos, Más). */
export default function CabeceraPagina({ kicker, titulo, volver, children }) {
  return (
    <header className={cx('tema-noche', styles.cabecera)}>
      <div className={cx('contenedor', styles.contenido)}>
        {volver && (
          <Link to={volver.to} className={styles.volver}>
            ← {volver.texto}
          </Link>
        )}
        {kicker && <p className="mono suave">{kicker}</p>}
        <h1 className={cx('display', styles.titulo)}>{titulo}</h1>
        {children}
      </div>
    </header>
  )
}
