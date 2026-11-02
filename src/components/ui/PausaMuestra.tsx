import { cx } from '@/utils/cx'
import styles from './Muestra.module.css'

interface Props {
  pausada: boolean
  onClick: () => void
  /** Qué está cambiando, para lectores de pantalla: "pasos", "piezas" */
  que: string
  className?: string
}

/** Pausa o reanuda una muestra que cambia sola (ver useMuestraRotativa). */
export default function PausaMuestra({ pausada, onClick, que, className }: Props) {
  return (
    <button
      type="button"
      className={cx(styles.pausa, className)}
      onClick={onClick}
      aria-pressed={pausada}
      aria-label={`Pausar el cambio automático de ${que}`}
      title={pausada ? `Seguir mostrando ${que} al azar` : `Dejar quietos los ${que}`}
    >
      <span aria-hidden="true">{pausada ? '▶' : '❚❚'}</span>
    </button>
  )
}
