import { useState } from 'react'
import { portada, sitio } from '@/data/sitio'
import { cx } from '@/utils/cx'
import VideoPortada from '@/components/media/VideoPortada'
import MediaPlaceholder from '@/components/media/MediaPlaceholder'
import Boton from '@/components/ui/Boton'
import styles from './Inicio.module.css'

/**
 * Portada: la entrada a la exposición.
 * El video / foto de fondo se configura en data/sitio.js → `portada`.
 * Se muestra completo (sin recorte); su proporción se lee del propio archivo.
 */
export default function Inicio() {
  const tieneFondo = Boolean(portada.video || portada.poster)
  const [proporcion, setProporcion] = useState(16 / 9)

  return (
    <section
      id="inicio"
      className={cx('tema-noche', styles.inicio, tieneFondo && styles.conFondo)}
      aria-labelledby="inicio-titulo"
      style={{ '--proporcion': proporcion, '--oscuridad': portada.oscuridad }}
    >
      <div className={styles.fondo}>
        {portada.video ? (
          <VideoPortada src={portada.video} srcMovil={portada.videoMovil} poster={portada.poster} onProporcion={setProporcion} />
        ) : portada.poster ? (
          <img
            src={portada.poster}
            alt=""
            className={styles.imagen}
            onLoad={(e) => setProporcion(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
          />
        ) : (
          <MediaPlaceholder etiqueta="[Video o fotografía del desfile — pantalla completa]" ratio="auto" className={styles.pendiente} />
        )}
        {tieneFondo && <div className={styles.velo} aria-hidden="true" />}
      </div>

      <div className={cx('contenedor', styles.contenido)}>
        <div className={styles.panel}>
          <p className="mono suave">{sitio.lugar.replaceAll(', ', ' · ')}</p>
          <h1 id="inicio-titulo" className={cx('display', styles.titulo)}>{sitio.nombre}</h1>
          <p className={styles.lema}>{sitio.lema}</p>
          <div>
            <Boton to={{ hash: '#historia' }} variante="primario">
              {sitio.invitacion} ↓
            </Boton>
          </div>
        </div>
      </div>
    </section>
  )
}
