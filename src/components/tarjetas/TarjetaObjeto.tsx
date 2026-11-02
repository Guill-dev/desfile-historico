import { Link } from 'react-router'
import type { Objeto } from '@/types/contenido'
import { esPendiente } from '@/utils/media'
import Media from '@/components/media/Media'
import styles from './TarjetaObjeto.module.css'

interface Props {
  objeto: Objeto
  /** Número de la pieza en la colección (1, 2, 3…) */
  numero: number
}

/** Una pieza de la colección: foto completa con su número y nombre encima; abre su ficha. */
export default function TarjetaObjeto({ objeto, numero }: Props) {
  return (
    <Link to={`/objetos/${objeto.id}`} className={styles.pieza}>
      <Media media={objeto.imagenes[0]} ratio="auto" className={styles.foto} />
      {!esPendiente(objeto.modelo3d) && <span className={styles.chip}>3D</span>}
      <span className={styles.ficha}>
        <span className="mono suave">
          Nº {String(numero).padStart(2, '0')} · {objeto.epoca}
        </span>
        <b>{objeto.nombre}</b>
      </span>
    </Link>
  )
}
