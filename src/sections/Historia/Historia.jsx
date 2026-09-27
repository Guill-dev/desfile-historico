import { interludios, textos } from '@/data/sitio'
import { cx } from '@/utils/cx'
import Reveal from '@/components/ui/Reveal'
import Boton from '@/components/ui/Boton'
import GualmatanAereo from '@/components/ilustraciones/GualmatanAereo'
import styles from './Historia.module.css'

/** Primer bloque tras la portada: el pueblo desde el aire y la invitación a conocer la historia. */
export default function Historia() {
  return (
    <section id="historia" className={cx('tema-verde', styles.historia)} aria-labelledby="historia-titulo">
      <div className={cx('contenedor', styles.grilla)}>
        <Reveal className={styles.imagen}>
          <GualmatanAereo />
        </Reveal>

        <Reveal retraso={150} className={cx('tema-noche', styles.tarjeta)}>
          <p className="mono suave">Capítulo 00</p>
          <h2 id="historia-titulo" className={cx('display', styles.titulo)}>{interludios.antesDePasos}</h2>
          <p>{textos.historia}</p>
          <div>
            <Boton to="/mas/historia" variante="primario">Leer la historia</Boton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
