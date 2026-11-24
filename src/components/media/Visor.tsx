import { useCallback, useEffect, useRef, type MouseEvent, type PointerEvent } from 'react'
import type { Media } from '@/types/contenido'
import { tieneArchivo } from '@/utils/media'
import { cx } from '@/utils/cx'
import MediaPlaceholder from './MediaPlaceholder'
import styles from './Visor.module.css'

interface Props {
  medios: Media[]
  /** Posición de la foto abierta; null = visor cerrado */
  indice: number | null
  onCambiar: (indice: number) => void
  onCerrar: () => void
}

/** Distancia mínima (px) para que un deslizamiento con el dedo cambie de foto */
const UMBRAL_DESLIZAR = 50

/**
 * Visor a pantalla completa (lightbox) basado en <dialog>, el diálogo nativo del navegador:
 * atrapa el foco, se cierra con Escape y devuelve el foco a la miniatura al cerrar.
 * Además: flechas ← →, deslizar con el dedo, clic fuera de la foto para cerrar y contador.
 */
export default function Visor({ medios, indice, onCambiar, onCerrar }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const inicioDeslizar = useRef<number | null>(null)
  const deslizo = useRef(false)
  const abierto = indice !== null
  const total = medios.length
  const actual = abierto ? medios[indice] : undefined

  // Abrir / cerrar el <dialog> según el estado
  useEffect(() => {
    const d = dialogo.current
    if (!d) return
    if (abierto && !d.open) d.showModal()
    if (!abierto && d.open) d.close()
  }, [abierto])

  // Mientras está abierto, la página de atrás no se desplaza
  useEffect(() => {
    if (!abierto) return
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previo
    }
  }, [abierto])

  const ir = useCallback(
    (paso: 1 | -1) => {
      if (indice === null || total < 2) return
      onCambiar((indice + paso + total) % total)
    },
    [indice, total, onCambiar],
  )

  // Teclado: flechas izquierda / derecha
  useEffect(() => {
    if (!abierto) return
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') ir(1)
      if (e.key === 'ArrowLeft') ir(-1)
    }
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [abierto, ir])

  // Precarga la foto anterior y la siguiente para que el cambio sea instantáneo
  useEffect(() => {
    if (indice === null) return
    for (const paso of [1, -1]) {
      const vecina = medios[(indice + paso + total) % total]
      if (tieneArchivo(vecina) && vecina.tipo === 'imagen') new Image().src = vecina.src
    }
  }, [indice, medios, total])

  const alPresionar = (e: PointerEvent<HTMLDivElement>) => {
    inicioDeslizar.current = e.clientX
    deslizo.current = false
  }
  const alSoltar = (e: PointerEvent<HTMLDivElement>) => {
    if (inicioDeslizar.current === null) return
    const distancia = e.clientX - inicioDeslizar.current
    inicioDeslizar.current = null
    if (Math.abs(distancia) > UMBRAL_DESLIZAR) {
      deslizo.current = true
      ir(distancia < 0 ? 1 : -1)
    }
  }
  // Clic en el espacio vacío alrededor de la foto: cierra (salvo que haya sido un deslizamiento)
  const alClicFondo = (e: MouseEvent<HTMLElement>) => {
    if (e.target === e.currentTarget && !deslizo.current) onCerrar()
  }

  return (
    <dialog
      ref={dialogo}
      className={cx('tema-noche', styles.visor)}
      aria-label="Visor de imágenes"
      onClose={onCerrar}
      onClick={alClicFondo}
    >
      {actual && (
        <>
          <div className={styles.barra}>
            <span className="mono suave" aria-live="polite">
              {(indice ?? 0) + 1} / {total}
            </span>
            <button type="button" className={styles.cerrar} onClick={onCerrar} aria-label="Cerrar visor" autoFocus>
              ✕
            </button>
          </div>

          <div
            className={styles.escenario}
            onPointerDown={alPresionar}
            onPointerUp={alSoltar}
            onClick={alClicFondo}
          >
            <Contenido media={actual} />
            {total > 1 && (
              <>
                <button type="button" className={cx(styles.flecha, styles.anterior)} onClick={() => ir(-1)} aria-label="Foto anterior">
                  ←
                </button>
                <button type="button" className={cx(styles.flecha, styles.siguiente)} onClick={() => ir(1)} aria-label="Foto siguiente">
                  →
                </button>
              </>
            )}
          </div>

          <div className={styles.pie}>
            <p>{actual.alt}</p>
            {actual.credito && <p className="mono suave">{actual.credito}</p>}
            {total > 1 && <p className={cx('mono suave', styles.pista)}>Desliza para ver más</p>}
          </div>
        </>
      )}
    </dialog>
  )
}

/** La foto (o video) en grande. Si aún no hay archivo, el recuadro pendiente. */
function Contenido({ media }: { media: Media }) {
  if (!tieneArchivo(media)) {
    return <MediaPlaceholder etiqueta={media.alt} ratio="4 / 3" className={styles.pendiente} />
  }
  // Gracias a tieneArchivo, aquí TypeScript ya sabe que media.src es un texto
  if (media.tipo === 'video') {
    return <video key={media.src} src={media.src} poster={media.poster} controls autoPlay className={styles.imagen} />
  }
  return <img key={media.src} src={media.src} alt={media.alt} className={styles.imagen} draggable={false} />
}
