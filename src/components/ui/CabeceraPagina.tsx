import type { ReactNode } from 'react'
import { Link, type To } from 'react-router'
import { cx } from '@/utils/cx'
import styles from './CabeceraPagina.module.css'

interface Props {
  /** Rótulo pequeño sobre el título */
  kicker?: string
  titulo: string
  /** Enlace "← Volver a …" */
  volver?: { to: To; texto: string }
  children?: ReactNode
}

/** Banda oscura con la que abre cada página interior (fichas, Pasos, Más). */
export default function CabeceraPagina({ kicker, titulo, volver, children }: Props) {
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
