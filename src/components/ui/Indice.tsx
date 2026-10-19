import { Link } from 'react-router'
import { cx } from '@/utils/cx'
import styles from './Indice.module.css'

export interface EntradaIndice {
  /** id de la sección a la que salta */
  id: string
  etiqueta: string
  /** Número opcional delante: "01" */
  numero?: string
}

interface Props {
  entradas: EntradaIndice[]
  /** Nombre del índice para lectores de pantalla: "Índice de pasos" */
  nombre: string
  /** id de la sección que se está leyendo (ver useSeccionActiva) */
  activa?: string | null
}

/** Índice de una página larga: en móvil, una fila deslizable; en escritorio, columna lateral fija. */
export default function Indice({ entradas, nombre, activa }: Props) {
  return (
    <nav className={styles.indice} aria-label={nombre}>
      <p className="mono">Índice</p>
      <ol role="list">
        {entradas.map((e) => (
          <li key={e.id}>
            <Link
              to={{ hash: `#${e.id}` }}
              className={cx(e.id === activa && styles.activa)}
              aria-current={e.id === activa ? 'location' : undefined}
            >
              {e.numero && <span className="mono">{e.numero}</span>}
              {e.etiqueta}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}
