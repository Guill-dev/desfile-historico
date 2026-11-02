import { Link } from 'react-router'
import type { Version } from '@/types/contenido'
import { cx } from '@/utils/cx'
import Media from '@/components/media/Media'
import styles from './TarjetaEdicion.module.css'

/** Una edición del desfile: el año en grande, su foto y su título; abre la ficha del año. */
export default function TarjetaEdicion({ version }: { version: Version }) {
  return (
    <Link to={`/versiones/${version.anio}`} className={styles.enlace}>
      <span className={cx('display', styles.anio)}>{version.anio}</span>
      <Media media={version.portada} ratio="16 / 10" className={styles.foto} />
      <span className="mono suave">{version.titulo}</span>
    </Link>
  )
}
