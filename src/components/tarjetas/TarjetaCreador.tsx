import { Link } from 'react-router'
import type { Creador } from '@/types/contenido'
import Media from '@/components/media/Media'
import styles from './TarjetaCreador.module.css'

/** Retrato, nombre y período de una persona; abre su ficha. Se usa en el inicio y en /creadores. */
export default function TarjetaCreador({ creador }: { creador: Creador }) {
  return (
    <Link to={`/creadores/${creador.id}`} className={styles.persona}>
      <Media media={creador.retrato} ratio="3 / 4" className={styles.retrato} />
      <b className={styles.nombre}>{creador.nombre}</b>
      <span className="mono suave">
        {creador.periodo} · {creador.rol}
      </span>
    </Link>
  )
}
