import { Link } from 'react-router'
import type { Objeto } from '@/types/contenido'
import { cx } from '@/utils/cx'
import { tieneArchivo } from '@/utils/media'
import Media from '@/components/media/Media'
import ModelViewer from '@/components/media/ModelViewer'
import styles from './TarjetaObjeto.module.css'

interface Props {
  objeto: Objeto
}

/**
 * Una pieza de la colección con su número y nombre encima; abre su ficha.
 * Si la pieza tiene modelo 3D, la tarjeta lo muestra dando vueltas en vez de la foto
 * (para girarlo a mano está la ficha: la tarjeta entera es un enlace).
 */
export default function TarjetaObjeto({ objeto }: Props) {
  const modelo = objeto.modelo3d
  const conModelo = tieneArchivo(modelo)

  return (
    <Link to={`/objetos/${objeto.id}`} className={cx(styles.pieza, conModelo && styles.vitrina)}>
      {conModelo ? (
        // En la tarjeta va la versión liviana (tarjeta.glb): varias giran a la vez, y en el celular pesa mucho la completa
        <ModelViewer
          src={objeto.modeloTarjeta ?? modelo.src}
          poster={modelo.poster}
          alt={modelo.alt}
          ratio="auto"
          interactivo={false}
          className={styles.modelo}
        />
      ) : (
        <Media media={objeto.imagenes[0]} ratio="auto" className={styles.foto} />
      )}
      {conModelo && <span className={styles.chip}>3D</span>}
      <span className={styles.ficha}>
        <span className="mono suave">
          Nº {String(objeto.numero).padStart(2, '0')} · {objeto.epoca}
        </span>
        <b>{objeto.nombre}</b>
      </span>
    </Link>
  )
}
