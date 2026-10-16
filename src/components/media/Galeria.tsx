import { useState } from 'react'
import type { Media as Recurso } from '@/types/contenido'
import { cx } from '@/utils/cx'
import Media from './Media'
import Visor from './Visor'
import styles from './Galeria.module.css'

interface Props {
  medios: Recurso[]
  /**
   * 'grilla' (por defecto): todas las fotos en cuadrícula.
   * 'escenario': la primera en grande y el resto en una tira de miniaturas (fichas de objetos y personas).
   */
  variante?: 'grilla' | 'escenario'
  /** Proporción de las miniaturas (o de la foto grande en 'escenario') */
  ratio?: string
  className?: string
}

/** Fotos que se abren en grande en el visor al tocarlas. */
export default function Galeria({ medios, variante = 'grilla', ratio = '4 / 3', className }: Props) {
  const [abierta, setAbierta] = useState<number | null>(null)
  if (medios.length === 0) return null

  const visor = <Visor medios={medios} indice={abierta} onCambiar={setAbierta} onCerrar={() => setAbierta(null)} />

  if (variante === 'escenario') {
    const [principal, ...resto] = medios
    return (
      <div className={cx(styles.escenario, className)}>
        <Miniatura media={principal} ratio={ratio} onAbrir={() => setAbierta(0)} />
        {resto.length > 0 && (
          <ul role="list" className={styles.tira}>
            {resto.map((m, n) => (
              <li key={n}>
                <Miniatura media={m} ratio="1 / 1" onAbrir={() => setAbierta(n + 1)} />
              </li>
            ))}
          </ul>
        )}
        {visor}
      </div>
    )
  }

  return (
    <>
      <ul role="list" className={cx(styles.grilla, className)}>
        {medios.map((m, n) => (
          <li key={n}>
            <Miniatura media={m} ratio={ratio} onAbrir={() => setAbierta(n)} />
          </li>
        ))}
      </ul>
      {visor}
    </>
  )
}

interface MiniaturaProps {
  media: Recurso
  ratio: string
  onAbrir: () => void
}

function Miniatura({ media, ratio, onAbrir }: MiniaturaProps) {
  return (
    <button type="button" className={styles.miniatura} onClick={onAbrir} aria-label={`Ver en grande: ${media.alt}`}>
      <Media media={media} ratio={ratio} className={styles.media} />
      <span className={styles.ampliar} aria-hidden="true">⤢</span>
    </button>
  )
}
