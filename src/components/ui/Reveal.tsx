import { createElement, type CSSProperties, type HTMLAttributes } from 'react'
import { useInView } from '@/hooks/useInView'
import { cx } from '@/utils/cx'
import styles from './Reveal.module.css'

/** Etiquetas HTML que puede usar Reveal */
type Etiqueta = 'div' | 'li' | 'header' | 'p' | 'section'

interface Props extends HTMLAttributes<HTMLElement> {
  /** Etiqueta a usar (por defecto un <div>) */
  as?: Etiqueta
  /** Espera antes de aparecer, en milisegundos */
  retraso?: number
}

/** Hace aparecer su contenido suavemente cuando entra en pantalla. */
export default function Reveal({ as = 'div', retraso = 0, className, style, children, ...resto }: Props) {
  const [ref, visible] = useInView<HTMLElement>()
  const estilo: CSSProperties = { '--reveal-retraso': `${retraso}ms`, ...style }

  // createElement permite elegir la etiqueta (div, li, p…) sin perder los tipos
  return createElement(
    as,
    { ref, className: cx(styles.reveal, visible && styles.visible, className), style: estilo, ...resto },
    children,
  )
}
