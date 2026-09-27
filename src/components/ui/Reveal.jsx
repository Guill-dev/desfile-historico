import { useInView } from '@/hooks/useInView'
import { cx } from '@/utils/cx'
import styles from './Reveal.module.css'

/** Hace aparecer su contenido suavemente cuando entra en pantalla. */
export default function Reveal({ as: Etiqueta = 'div', retraso = 0, className, style, children, ...resto }) {
  const [ref, visible] = useInView()

  return (
    <Etiqueta
      ref={ref}
      className={cx(styles.reveal, visible && styles.visible, className)}
      style={{ '--reveal-retraso': `${retraso}ms`, ...style }}
      {...resto}
    >
      {children}
    </Etiqueta>
  )
}
