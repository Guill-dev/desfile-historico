import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import type { Creador } from '@/types/contenido'
import { capitulo, rotulo } from '@/data/sitio'
import { creadores } from '@/data/creadores'
import { cx } from '@/utils/cx'
import { tieneArchivo } from '@/utils/media'
import { useInView } from '@/hooks/useInView'
import SectionHeader from '@/components/ui/SectionHeader'
import Boton from '@/components/ui/Boton'
import styles from './Creadores.module.css'

const cap = capitulo('creadores')

/** Cuántas fotos caben en la página del álbum */
const EN_EL_ALBUM = 6

/**
 * Cómo quedó pegada cada foto: inclinación (grados) y cuánto más abajo (px). Así la página parece armada a
 * mano y no una cuadrícula. Se repite si hay más fotos que poses.
 */
const POSES = [
  { giro: -3, baja: 0 },
  { giro: 2, baja: 30 },
  { giro: -1.5, baja: 10 },
  { giro: 2.5, baja: 6 },
  { giro: -2, baja: 34 },
  { giro: 1.2, baja: 0 },
]

/** "Segundo Delgado Erira" → "SD" (para las fotos que aún no están) */
function iniciales(nombre: string) {
  if (nombre.startsWith('[')) return '?'
  const palabras = nombre.split(/\s+/).filter((p) => /^[A-ZÁÉÍÓÚÑ]/.test(p) && p.length > 2)
  return (palabras[0]?.[0] ?? '') + (palabras.at(-1)?.[0] ?? '')
}

/**
 * QUIENES LO HICIERON POSIBLE, como la página de un álbum familiar antiguo: fotos en sepia con borde blanco,
 * sujetas con esquineros y un poco torcidas, y debajo el nombre escrito a mano (con la letra del poema).
 * Al llegar, las fotos se van "pegando" una por una. Al pasar el mouse (o al tocar), la foto se endereza,
 * se levanta y recupera el color; lleva a la ficha de la persona.
 */
export default function Creadores() {
  const [ref, visible] = useInView<HTMLOListElement>({ threshold: 0.12 })
  const enAlbum = creadores.slice(0, EN_EL_ALBUM)

  return (
    <section id="creadores" className="tema-verde capitulo" aria-labelledby="creadores-titulo">
      <div className="contenedor">
        <SectionHeader
          id="creadores-titulo"
          kicker={rotulo(cap)}
          titulo={cap.encabezado}
          accion={
            creadores.length > EN_EL_ALBUM && <Boton to="/creadores">Ver los {creadores.length} creadores →</Boton>
          }
        />

        <div className={styles.album}>
          <ol ref={ref} role="list" className={cx(styles.pagina, visible && styles.visible)}>
            {enAlbum.map((creador, i) => {
              const pose = POSES[i % POSES.length]
              const estilo: CSSProperties = { '--giro': `${pose.giro}deg`, '--baja': `${pose.baja}px`, '--i': i }
              return (
                <li key={creador.id} style={estilo}>
                  <FotoAlbum creador={creador} />
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}

function FotoAlbum({ creador }: { creador: Creador }) {
  const { retrato } = creador
  return (
    <Link to={`/creadores/${creador.id}`} className={styles.foto}>
      <span className={styles.copia}>
        {tieneArchivo(retrato) ? (
          <img src={retrato.miniatura ?? retrato.src} alt={retrato.alt} loading="lazy" decoding="async" />
        ) : (
          <span className={styles.iniciales} aria-hidden="true">
            {iniciales(creador.nombre)}
          </span>
        )}
        <span className={styles.esquineros} aria-hidden="true" />
      </span>
      <span className={styles.pie}>
        <span className={styles.nombre}>{creador.nombre}</span>
        <span className={styles.rol}>
          {creador.rol}, {creador.periodo}
        </span>
      </span>
    </Link>
  )
}
