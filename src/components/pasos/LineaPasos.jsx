import { cx } from '@/utils/cx'
import Reveal from '@/components/ui/Reveal'
import Media from '@/components/media/Media'
import styles from './LineaPasos.module.css'

/** Lista completa de pasos. Cada paso tiene ancla propia (/pasos#paso-3). */
export default function LineaPasos({ pasos }) {
  return (
    <ol role="list" className={styles.linea}>
      {pasos.map((paso) => (
        <Reveal as="li" key={paso.id} id={paso.id} className={styles.paso}>
          <span className={cx('display', styles.numero)}>{String(paso.numero).padStart(2, '0')}</span>
          <div className={styles.texto}>
            <h2 className={styles.titulo}>{paso.titulo}</h2>
            <p>{paso.resumen}</p>
            {paso.texto && <p>{paso.texto}</p>}
          </div>
          <Media media={paso.media[0]} ratio="3 / 2" className={styles.foto} />
        </Reveal>
      ))}
    </ol>
  )
}
