import { cx } from '@/utils/cx'
import styles from './MediaPlaceholder.module.css'

interface Props {
  etiqueta: string
  ratio?: string
  className?: string
}

/** Marco que ocupa el lugar de un recurso aún no disponible, con su etiqueta "[...]" visible. */
export default function MediaPlaceholder({ etiqueta, ratio = '4 / 3', className }: Props) {
  return (
    <div className={cx(styles.placeholder, className)} style={{ aspectRatio: ratio }} role="img" aria-label={etiqueta}>
      <span className={styles.etiqueta}>{etiqueta}</span>
    </div>
  )
}
