import { Link } from 'react-router'
import { capitulo, rotulo } from '@/data/sitio'
import { pasos } from '@/data/pasos'
import { cx } from '@/utils/cx'
import SectionHeader from '@/components/ui/SectionHeader'
import Reveal from '@/components/ui/Reveal'
import Boton from '@/components/ui/Boton'
import Media from '@/components/media/Media'
import styles from './Pasos.module.css'

const cap = capitulo('pasos')
const MUESTRA = 3

/** Entrada a los Pasos dentro del recorrido: una muestra y el acceso a la página completa. */
export default function Pasos() {
  return (
    <section id="pasos" className="tema-verde capitulo" aria-labelledby="pasos-titulo">
      <div className="contenedor">
        <SectionHeader
          id="pasos-titulo"
          kicker={rotulo(cap)}
          titulo={cap.encabezado}
          accion={<Boton to={cap.ruta}>Ver los {pasos.length} pasos →</Boton>}
        />

        <ol role="list" className={styles.pasos}>
          {pasos.slice(0, MUESTRA).map((paso, i) => (
            <Reveal as="li" key={paso.id} retraso={i * 100}>
              <Link to={`${cap.ruta}#${paso.id}`} className={styles.paso}>
                <span className={cx('display', styles.numero)}>{String(paso.numero).padStart(2, '0')}</span>
                <h3 className={styles.titulo}>{paso.titulo}</h3>
                <Media media={paso.media[0]} ratio="4 / 3" className={styles.foto} />
              </Link>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
