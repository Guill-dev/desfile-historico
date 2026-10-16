import type { ReactNode } from 'react'
import { cx } from '@/utils/cx'
import Reveal from './Reveal'
import styles from './SectionHeader.module.css'

interface Props {
  /** id del título, para enlazarlo con aria-labelledby */
  id?: string
  /** Rótulo pequeño: "02 · Creadores" */
  kicker?: string
  titulo: string
  /** Lo que va a la derecha: un botón, flechas… */
  accion?: ReactNode
  /** Texto de introducción opcional */
  children?: ReactNode
}

/** Encabezado de bloque: rótulo (p. ej. "02 · Creadores"), título grande y, a la derecha, una acción. */
export default function SectionHeader({ id, kicker, titulo, accion, children }: Props) {
  return (
    <Reveal as="header" className={styles.header}>
      <div className={styles.textos}>
        {kicker && <p className="mono suave">{kicker}</p>}
        <h2 id={id} className={cx('display', styles.titulo)}>{titulo}</h2>
        {children && <div className={styles.intro}>{children}</div>}
      </div>
      {accion && <div className={styles.accion}>{accion}</div>}
    </Reveal>
  )
}
