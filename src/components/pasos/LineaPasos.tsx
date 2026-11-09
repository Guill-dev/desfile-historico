import type { Paso } from '@/types/contenido'
import { cx } from '@/utils/cx'
import { tieneArchivo } from '@/utils/media'
import Reveal from '@/components/ui/Reveal'
import Boton from '@/components/ui/Boton'
import Media from '@/components/media/Media'
import styles from './LineaPasos.module.css'

/**
 * Lista completa de pasos. Cada paso tiene ancla propia (/pasos#paso-3).
 * En el celular: número, texto y foto uno debajo del otro. En pantallas anchas: número y texto
 * a la izquierda y la foto, más grande, a la derecha.
 * Si un paso todavía no tiene foto, en su lugar se invita a quien la tenga a enviarla (ver PideFoto).
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
          {tieneArchivo(paso.media[0]) ? (
            <Media media={paso.media[0]} ratio="3 / 2" className={styles.foto} />
          ) : (
            <PideFoto numero={paso.numero} />
          )}
        </Reveal>
      ))}
    </ol>
  )
}

/**
 * En el lugar de la foto que falta: una invitación a enviarla. El botón lleva a Contacto con el número
 * del paso en la dirección (/mas/contacto?paso=12), para que el formulario pueda decir de qué paso es.
 */
function PideFoto({ numero }: { numero: number }) {
  const nn = String(numero).padStart(2, '0')
  return (
    <div className={styles.pideFoto}>
      <svg className={styles.camara} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 8h3l2-2.5h6L17 8h3v11H4z" />
        <circle cx="12" cy="13" r="3.5" />
      </svg>
      <p className={styles.pregunta}>¿Tienes una foto de este paso?</p>
      <p className={styles.invitacion}>
        Todavía nos falta la del paso {nn}. Si la tienes, envíanosla y ayúdanos a completar el recorrido del desfile.
      </p>
      <Boton to={{ pathname: '/mas/contacto', search: `?paso=${numero}` }} variante="primario">
        Enviar la foto →
      </Boton>
    </div>
  )
}
