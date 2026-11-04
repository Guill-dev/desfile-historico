import type { Paso } from '@/types/contenido'
import { cx } from '@/utils/cx'
import Reveal from '@/components/ui/Reveal'
import Media from '@/components/media/Media'
import styles from './LineaPasos.module.css'

/**
 * Lista completa de pasos. Cada paso tiene ancla propia (/pasos#paso-3).
 * En el celular: número, texto y foto uno debajo del otro. En pantallas anchas: número y texto
 * a la izquierda y la foto, más grande, a la derecha.
 */
export default function LineaPasos({ pasos, className }: { pasos: Paso[]; className?: string }) {
  return (
    <ol role="list" className={cx(styles.linea, className)}>
      {pasos.map((paso) => (
        <Reveal as="li" key={paso.id} id={paso.id} className={styles.paso}>
          <div className={styles.bloque}>
            <span className={cx('display', styles.numero)}>{String(paso.numero).padStart(2, '0')}</span>
            <div className={styles.texto}>
              <h2 className={styles.titulo}>{paso.titulo}</h2>
              <p>{paso.resumen}</p>
              {paso.texto && <p>{paso.texto}</p>}
            </div>
          </div>
          <Media media={paso.media[0]} ratio="3 / 2" className={styles.foto} />
        </Reveal>
      ))}
    </ol>
  )
}
