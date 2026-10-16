import { Link } from 'react-router'
import { capitulo, interludios, rotulo } from '@/data/sitio'
import { versiones } from '@/data/versiones'
import { cx } from '@/utils/cx'
import { useCarrusel } from '@/hooks/useCarrusel'
import SectionHeader from '@/components/ui/SectionHeader'
import Interludio from '@/components/ui/Interludio'
import Flechas from '@/components/ui/Flechas'
import Media from '@/components/media/Media'
import carrusel from '@/components/ui/Carrusel.module.css'
import styles from './Versiones.module.css'

const cap = capitulo('versiones')

/** Viaje en el tiempo: una línea de años. El pueblo es el protagonista. */
export default function Versiones() {
  // La pista es una lista ordenada (<ol>): se lo indicamos al carrusel
  const { ref, anterior, siguiente } = useCarrusel<HTMLOListElement>()

  return (
    <section id="versiones" className="tema-papel capitulo" aria-labelledby="versiones-titulo">
      <div className="contenedor">
        <Interludio frase={interludios.antesDeVersiones} />

        <SectionHeader
          id="versiones-titulo"
          kicker={rotulo(cap)}
          titulo={cap.encabezado}
          accion={<Flechas anterior={anterior} siguiente={siguiente} etiqueta="años" />}
        />

        <ol ref={ref} role="list" className={cx(carrusel.pista, styles.linea)}>
          {versiones.map((v) => (
            <li key={v.anio} className={styles.edicion}>
              <Link to={`/versiones/${v.anio}`} className={styles.enlace}>
                <span className={cx('display', styles.anio)}>{v.anio}</span>
                <Media media={v.portada} ratio="16 / 10" className={styles.foto} />
                <span className="mono suave">{v.titulo}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
