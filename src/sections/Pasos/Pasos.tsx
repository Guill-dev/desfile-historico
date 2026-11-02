import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import type { Paso } from '@/types/contenido'
import { capitulo, rotulo } from '@/data/sitio'
import { pasos } from '@/data/pasos'
import { cx } from '@/utils/cx'
import { useMuestraRotativa } from '@/hooks/useMuestraRotativa'
import SectionHeader from '@/components/ui/SectionHeader'
import Reveal from '@/components/ui/Reveal'
import Boton from '@/components/ui/Boton'
import PausaMuestra from '@/components/ui/PausaMuestra'
import Media from '@/components/media/Media'
import muestra from '@/components/ui/Muestra.module.css'
import styles from './Pasos.module.css'

const cap = capitulo('pasos')
/** Cuántos pasos se muestran: 4 en 2 × 2 en el celular (en el computador, los 3 primeros de ellos en fila) */
const MUESTRA = 4
/** Cada cuánto cambian por otros al azar */
const CADA_MS = 3000

/**
 * Entrada a los Pasos dentro del recorrido: unos pocos pasos al azar que cambian solos
 * y el acceso a la página completa (/pasos), donde salen todos en orden.
 */
export default function Pasos() {
  const { visibles, anteriores, ronda, puedeGirar, pausada, alternarPausa } = useMuestraRotativa(pasos, {
    cantidad: MUESTRA,
    cadaMs: CADA_MS,
  })

  return (
    <section id="pasos" className="tema-verde capitulo" aria-labelledby="pasos-titulo">
      <div className="contenedor">
        <SectionHeader
          id="pasos-titulo"
          kicker={rotulo(cap)}
          titulo={cap.encabezado}
          accion={
            <>
              {puedeGirar && <PausaMuestra pausada={pausada} onClick={alternarPausa} que="pasos" />}
              <Boton to={cap.ruta} llamativo>
                Ver los {pasos.length} pasos →
              </Boton>
            </>
          }
        />

        <ol role="list" className={styles.pasos}>
          {visibles.map((paso, i) => {
            const retraso: CSSProperties = { '--retraso-cambio': `${i * 90}ms` }
            const anterior = anteriores[i]
            return (
              // La casilla (li) se queda; en cada cambio el paso anterior se va girando y el nuevo entra girando
              <Reveal as="li" key={i} retraso={i * 100} className={muestra.casilla}>
                {ronda > 0 && anterior && (
                  <TarjetaPaso key={`sale-${ronda}`} paso={anterior} className={muestra.sale} style={retraso} fantasma />
                )}
                <TarjetaPaso key={paso.id} paso={paso} className={cx(ronda > 0 && muestra.cambio)} style={retraso} />
              </Reveal>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

interface TarjetaPasoProps {
  paso: Paso
  className?: string
  style?: CSSProperties
  /** La copia que se está yendo: no se puede tocar ni la leen los lectores de pantalla */
  fantasma?: boolean
}

function TarjetaPaso({ paso, className, style, fantasma }: TarjetaPasoProps) {
  return (
    <Link
      to={`${cap.ruta}#${paso.id}`}
      className={cx(styles.paso, className)}
      style={style}
      inert={fantasma}
      aria-hidden={fantasma || undefined}
    >
      <span className={cx('display', styles.numero)}>{String(paso.numero).padStart(2, '0')}</span>
      <h3 className={styles.titulo}>{paso.titulo}</h3>
      <Media media={paso.media[0]} ratio="4 / 3" className={styles.foto} />
    </Link>
  )
}
