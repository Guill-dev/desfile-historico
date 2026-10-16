import { Link } from 'react-router'
import { capitulo, rotulo } from '@/data/sitio'
import { creadores } from '@/data/creadores'
import { useCarrusel } from '@/hooks/useCarrusel'
import SectionHeader from '@/components/ui/SectionHeader'
import Flechas from '@/components/ui/Flechas'
import Media from '@/components/media/Media'
import carrusel from '@/components/ui/Carrusel.module.css'
import styles from './Creadores.module.css'

const cap = capitulo('creadores')

/** Las personas detrás del desfile, en carrusel. Cada retrato abre su ficha. */
export default function Creadores() {
  const { ref, anterior, siguiente } = useCarrusel()

  return (
    <section id="creadores" className="tema-verde capitulo" aria-labelledby="creadores-titulo">
      <div className="contenedor">
        <SectionHeader
          id="creadores-titulo"
          kicker={rotulo(cap)}
          titulo={cap.encabezado}
          accion={<Flechas anterior={anterior} siguiente={siguiente} etiqueta="creadores" />}
        />

        <ul ref={ref} role="list" className={carrusel.pista}>
          {creadores.map((c) => (
            <li key={c.id}>
              <Link to={`/creadores/${c.id}`} className={styles.persona}>
                <Media media={c.retrato} ratio="3 / 4" className={styles.retrato} />
                <b className={styles.nombre}>{c.nombre}</b>
                <span className="mono suave">{c.periodo} · {c.rol}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
