import { cx } from '@/utils/cx'
import Reveal from './Reveal'
import styles from './SectionHeader.module.css'

/** Encabezado de bloque: rótulo (p. ej. "02 · Creadores"), título grande y, a la derecha, una acción. */
export default function SectionHeader({ id, kicker, titulo, accion, children }) {
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
