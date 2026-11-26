import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import type { Paso } from '@/types/contenido'
import { capitulo, rotulo } from '@/data/sitio'
import { pasos } from '@/data/pasos'
import { cx } from '@/utils/cx'
import { precargarFoto, tieneArchivo } from '@/utils/media'
import { useMuestraRotativa } from '@/hooks/useMuestraRotativa'
import { useInView } from '@/hooks/useInView'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import SectionHeader from '@/components/ui/SectionHeader'
import Reveal from '@/components/ui/Reveal'
import Boton from '@/components/ui/Boton'
import PausaMuestra from '@/components/ui/PausaMuestra'
import Media from '@/components/media/Media'
import muestra from '@/components/ui/Muestra.module.css'
import styles from './Pasos.module.css'

const cap = capitulo('pasos')
/** Cuántos pasos se muestran: 6 en 2 filas de 3 en el computador; en el celular, 4 en 2 × 2 */
const MUESTRA = 6
const MUESTRA_CELULAR = 4
/** Cada cuánto cambian por otros al azar */
const CADA_MS = 3000

/**
 * Aquí solo salen los pasos que ya tienen foto (los demás se ven en /pasos).
 * Si todavía ninguno tiene (p. ej. en la copia de GitHub, sin las fotos), salen todos.
 */
const conFoto = pasos.filter((p) => tieneArchivo(p.media[0]))
const candidatos = conFoto.length > 0 ? conFoto : pasos
/** Qué tan ancha se ve cada tarjeta: con esto se usa la miniatura de la foto (mucho más liviana) donde alcanza */
const TAMANO_TARJETA = '(max-width: 899px) 46vw, 400px'

/** Antes de voltear las tarjetas se deja lista la foto de cada paso que entra (la misma versión que se mostrará) */
const precargarPaso = (p: Paso) => precargarFoto(p.media[0], TAMANO_TARJETA)

/**
 * Entrada a los Pasos dentro del recorrido: unos pocos pasos al azar (de los que tienen foto) que
 * cambian solos y el acceso a la página completa (/pasos), donde salen todos en orden.
 */
export default function Pasos() {
  // Cerca de la pantalla (o en ella): los pasos cambian. Lejos: se quedan quietos hasta que se vuelva
  const [ref, aLaVista] = useInView<HTMLElement>({ once: false, threshold: 0, rootMargin: '200px 0px' })
  // En el celular se eligen solo los 4 que se ven: así no se descargan fotos de tarjetas escondidas
  const celular = useMediaQuery('(max-width: 899px)')
  const { visibles, anteriores, ronda, puedeGirar, pausada, alternarPausa } = useMuestraRotativa(candidatos, {
    cantidad: celular ? MUESTRA_CELULAR : MUESTRA,
    cadaMs: CADA_MS,
    aLaVista,
    precargar: precargarPaso,
  })

  return (
    <section ref={ref} id="pasos" className="tema-verde capitulo" aria-labelledby="pasos-titulo">
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
      <Media media={paso.media[0]} ratio="4 / 5" sizes={TAMANO_TARJETA} className={styles.foto} />
      {/* Recuadro de vidrio sobre la foto: el título, el número y "Ver" */}
      <div className={styles.info}>
        <h3 className={styles.titulo}>{paso.titulo}</h3>
        <div className={styles.pie}>
          <span className={styles.numero}>Paso {paso.numero}</span>
          <span className={styles.ver} aria-hidden="true">Ver</span>
        </div>
      </div>
    </Link>
  )
}
