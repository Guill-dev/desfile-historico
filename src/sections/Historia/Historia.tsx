import { interludios, textos } from '@/data/sitio'
import { cx } from '@/utils/cx'
import Reveal from '@/components/ui/Reveal'
import Boton from '@/components/ui/Boton'
import GualmatanAereo from '@/components/ilustraciones/GualmatanAereo'
import styles from './Historia.module.css'

/*
 * La foto del pueblo está en src/assets/fotos/gualmatan-principal.jpg, que por ahora vive solo en el
 * computador del administrador (no se sube a GitHub). Si no está, se muestra la ilustración animada.
 * import.meta.glob no falla si el archivo no existe: devuelve un objeto vacío.
 */
const fotoPueblo = Object.values(
  import.meta.glob<string>('@/assets/fotos/gualmatan-principal.*', { eager: true, query: '?url', import: 'default' }),
)[0]

/** Primer bloque tras la portada: el pueblo (foto o ilustración) y la invitación a conocer la historia. */
export default function Historia() {
  return (
    <section id="historia" className={cx('tema-verde', styles.historia)} aria-labelledby="historia-titulo">
      <div className={cx('contenedor', styles.grilla)}>
        <Reveal className={styles.imagen}>
          {fotoPueblo ? (
            <figure className={styles.foto}>
              <img
                src={fotoPueblo}
                alt="La iglesia de Gualmatán, blanca y verde, de dos torres, vista desde la plaza, junto a un monumento con dos leones dorados y un jinete a caballo."
                loading="lazy"
                decoding="async"
              />
              <figcaption className={cx('mono', styles.leyenda)}>Gualmatán · fotografía</figcaption>
            </figure>
          ) : (
            <GualmatanAereo />
          )}
        </Reveal>

        <Reveal retraso={150} className={cx('tema-noche', styles.tarjeta)}>
          <p className="mono suave">Capítulo 00</p>
          <h2 id="historia-titulo" className={cx('display', styles.titulo)}>{interludios.antesDePasos}</h2>
          <p className={styles.entradilla}>{textos.historia}</p>
          <div>
            <Boton to="/mas/historia" variante="primario">Leer la historia</Boton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
