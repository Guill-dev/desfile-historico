import { Link } from 'react-router'
import type { Version } from '@/types/contenido'
import { cx } from '@/utils/cx'
import { tieneArchivo } from '@/utils/media'
import Media from '@/components/media/Media'
import FotosRotativas from '@/components/media/FotosRotativas'
import styles from './TarjetaEdicion.module.css'

/**
 * Una edición del desfile: el año en grande y su foto, con el título en un recuadro de vidrio encima;
 * abre la ficha del año.
 * Si el año tiene varias fotos, van cambiando solas cada 2.5 s, al azar y sin repetir (FotosRotativas).
 */
export default function TarjetaEdicion({ version }: { version: Version }) {
  const conFotos = version.galeria.length > 1 && tieneArchivo(version.galeria[0])

  return (
    <Link to={`/versiones/${version.anio}`} className={styles.enlace}>
      <span className={cx('display', styles.anio)}>{version.anio}</span>
      <span className={styles.marco}>
        {conFotos ? (
          <FotosRotativas fotos={version.galeria} cadaMs={2500} ratio="16 / 10" className={styles.foto} />
        ) : (
          <Media media={version.portada} ratio="16 / 10" className={styles.foto} />
        )}
        {/* Recuadro de vidrio sobre la foto: el título y cuántas fotos tiene */}
        <span className={styles.info}>
          <span className={styles.titulo}>{version.titulo}</span>
          {conFotos && <span className={styles.cuantas}>{version.galeria.length} fotos</span>}
        </span>
      </span>
    </Link>
  )
}
