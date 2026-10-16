import { Link } from 'react-router'
import { capitulo, rotulo, textos } from '@/data/sitio'
import { pasos } from '@/data/pasos'
import { cx } from '@/utils/cx'
import CabeceraPagina from '@/components/ui/CabeceraPagina'
import LineaPasos from '@/components/pasos/LineaPasos'
import styles from './PasosPagina.module.css'

const cap = capitulo('pasos')

/** Página propia de los Pasos: índice para saltar entre ellos + lista completa. */
export default function PasosPagina() {
  return (
    <div className="tema-verde">
      <CabeceraPagina kicker={rotulo(cap)} titulo={cap.encabezado} volver={{ to: '/', texto: 'Inicio' }}>
        <p className={styles.intro}>{textos.pasos}</p>
      </CabeceraPagina>

      <div className={cx('contenedor', 'capitulo', styles.cuerpo)}>
        <nav className={styles.indice} aria-label="Índice de pasos">
          <p className="mono">Índice</p>
          <ol role="list">
            {pasos.map((p) => (
              <li key={p.id}>
                <Link to={{ hash: `#${p.id}` }}>
                  <span className="mono">{String(p.numero).padStart(2, '0')}</span>
                  {p.titulo}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <LineaPasos pasos={pasos} />
      </div>
    </div>
  )
}
