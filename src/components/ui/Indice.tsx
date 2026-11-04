import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { cx } from '@/utils/cx'
import { useIrAlAncla } from '@/hooks/useIrAlAncla'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import IndiceFlotante from './IndiceFlotante'
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
  /**
   * Para índices largos (los 79 pasos): en el celular, en vez de la fila deslizable,
   * un botón flotante que despliega los números (ver IndiceFlotante).
   */
  flotanteEnMovil?: boolean
}

/** Desplaza `contenedor` lo justo para que `elemento` quede a la vista, sin mover la página. */
function mostrarDentro(contenedor: HTMLElement, elemento: HTMLElement, behavior: ScrollBehavior) {
  const c = contenedor.getBoundingClientRect()
  const e = elemento.getBoundingClientRect()
  if (contenedor.scrollHeight > contenedor.clientHeight && (e.top < c.top || e.bottom > c.bottom)) {
    contenedor.scrollBy({ top: e.top - c.top - (c.height - e.height) / 2, behavior })
  }
  if (contenedor.scrollWidth > contenedor.clientWidth && (e.left < c.left || e.right > c.right)) {
    contenedor.scrollBy({ left: e.left - c.left - (c.width - e.width) / 2, behavior })
  }
}

/** Índice de una página larga: en móvil, una fila deslizable (o un botón flotante); en escritorio, columna lateral fija. */
export default function Indice({ entradas, nombre, activa, flotanteEnMovil = false }: Props) {
  const nav = useRef<HTMLElement>(null)
  const lista = useRef<HTMLOListElement>(null)
  const irAlAncla = useIrAlAncla()
  const reducirMovimiento = usePrefersReducedMotion()

  // Con muchas entradas, el índice se va moviendo solo para que la sección que se lee siempre se vea
  useEffect(() => {
    const enlace = activa ? nav.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(activa)}"]`) : null
    if (!enlace || !nav.current || !lista.current) return
    const behavior = reducirMovimiento ? 'auto' : 'smooth'
    mostrarDentro(nav.current, enlace, behavior) // columna del escritorio
    mostrarDentro(lista.current, enlace, behavior) // fila deslizable del celular
  }, [activa, reducirMovimiento])

  return (
    <>
      <nav ref={nav} className={cx(styles.indice, flotanteEnMovil && styles.soloEscritorio)} aria-label={nombre}>
        <p className="mono">Índice</p>
        <ol ref={lista} role="list">
          {entradas.map((e) => (
            <li key={e.id}>
              <Link
                to={{ hash: `#${e.id}` }}
                data-id={e.id}
                onClick={() => irAlAncla(e.id)}
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

      {flotanteEnMovil && <IndiceFlotante entradas={entradas} nombre={nombre} activa={activa} />}
    </>
  )
}
