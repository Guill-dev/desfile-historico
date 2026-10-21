import type { ReactNode } from 'react'
import { numero } from '@/estadisticas/nombres'
import styles from './BarrasLista.module.css'

export interface FilaBarra {
  etiqueta: ReactNode
  valor: number
  /** Texto del valor; por defecto el número */
  texto?: string
}

interface Props {
  filas: FilaBarra[]
  /** Valor de la barra completa; por defecto el mayor de la lista */
  maximo?: number
  /** Cuántas filas mostrar como mucho */
  limite?: number
  vacio?: string
}

/** Lista de barras horizontales: nombre, barra y valor al final. Una sola serie, un solo color. */
export default function BarrasLista({ filas, maximo, limite = 10, vacio = 'Sin datos en este período.' }: Props) {
  if (filas.length === 0) return <p className={styles.vacio}>{vacio}</p>
  const tope = maximo ?? Math.max(1, ...filas.map((f) => f.valor))

  return (
    <ol role="list" className={styles.lista}>
      {filas.slice(0, limite).map((f, i) => (
        <li key={i} className={styles.fila}>
          <span className={styles.etiqueta}>{f.etiqueta}</span>
          <span className={styles.pista} aria-hidden="true">
            <span className={styles.barra} style={{ width: `${Math.max(0.5, (f.valor / tope) * 100)}%` }} />
          </span>
          <span className={styles.valor}>{f.texto ?? numero(f.valor)}</span>
        </li>
      ))}
    </ol>
  )
}
