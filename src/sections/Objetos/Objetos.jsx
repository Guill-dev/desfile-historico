import { Link } from 'react-router'
import { capitulo, rotulo } from '@/data/sitio'
import { objetos } from '@/data/objetos'
import { esPendiente } from '@/utils/media'
import { cx } from '@/utils/cx'
import { useCarrusel } from '@/hooks/useCarrusel'
import SectionHeader from '@/components/ui/SectionHeader'
import Flechas from '@/components/ui/Flechas'
import Media from '@/components/media/Media'
import carrusel from '@/components/ui/Carrusel.module.css'
import styles from './Objetos.module.css'

const cap = capitulo('objetos')

/** La vitrina: fondo oscuro para que las piezas resalten. Cada una abre su ficha (lista para 3D). */
export default function Objetos() {
  const { ref, anterior, siguiente } = useCarrusel()

  return (
    <section id="objetos" className="tema-noche capitulo" aria-labelledby="objetos-titulo">
      <div className="contenedor">
        <SectionHeader
          id="objetos-titulo"
          kicker={rotulo(cap)}
          titulo={cap.encabezado}
          accion={<Flechas anterior={anterior} siguiente={siguiente} etiqueta="objetos" />}
        />

        <ul ref={ref} role="list" className={cx(carrusel.pista, styles.vitrina)}>
          {objetos.map((o, i) => (
            <li key={o.id}>
              <Link to={`/objetos/${o.id}`} className={styles.pieza}>
                <Media media={o.imagenes[0]} ratio="auto" className={styles.foto} />
                {!esPendiente(o.modelo3d) && <span className={styles.chip}>3D</span>}
                <span className={styles.ficha}>
                  <span className="mono suave">Nº {String(i + 1).padStart(2, '0')} · {o.epoca}</span>
                  <b>{o.nombre}</b>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
