import { Fragment, useEffect, useMemo, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { Link } from 'react-router'
import { cx } from '@/utils/cx'
import { crearBuscador } from '@/utils/buscar'
import type { EntradaIndice } from './Indice'
import styles from './BuscadorIndice.module.css'

interface Props {
  entradas: EntradaIndice[]
  consulta: string
  alCambiar: (consulta: string) => void
  /** Al elegir un resultado (el enlace ya cambia el #ancla de la dirección) */
  alElegir: (id: string) => void
  activa?: string | null
  /** Dentro del panel oscuro del celular */
  oscuro?: boolean
  /** Al entrar al campo de búsqueda */
  alEnfocar?: () => void
  /** Lo que se ve mientras no se busca nada: la lista completa */
  children: ReactNode
  className?: string
}

/**
 * Barra para buscar dentro de un índice por nombre o número (ver utils/buscar.ts).
 * Mientras se escribe, la lista cambia por los resultados, del más parecido al menos parecido.
 * Teclado: Enter va al primero, ↓ ↑ recorren los resultados y Esc borra lo escrito.
 */
export default function BuscadorIndice({ entradas, consulta, alCambiar, alElegir, activa, oscuro, alEnfocar, children, className }: Props) {
  const campo = useRef<HTMLInputElement>(null)
  const lista = useRef<HTMLOListElement>(null)

  const buscar = useMemo(() => crearBuscador(entradas), [entradas])
  const busqueda = useMemo(() => buscar(consulta), [buscar, consulta])
  const total = busqueda?.resultados.length ?? 0

  // Con cada letra, los resultados se ven desde el primero
  useEffect(() => {
    if (lista.current) lista.current.scrollTop = 0
  }, [consulta])

  let mensaje = ''
  if (busqueda) {
    if (total === 0) mensaje = `Nada se parece a «${consulta.trim()}»`
    else if (!busqueda.completa) mensaje = `Sin coincidencia exacta · ${total} ${total === 1 ? 'parecido' : 'parecidos'}`
    else mensaje = `${total} ${total === 1 ? 'resultado' : 'resultados'}`
  }

  const enlaces = () => [...(lista.current?.querySelectorAll<HTMLElement>('a') ?? [])]

  const alTeclearCampo = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && consulta) {
      e.preventDefault() // en el celular, la primera Esc borra; la segunda cierra el panel
      alCambiar('')
    } else if (e.key === 'Enter' && total > 0) {
      e.preventDefault()
      enlaces()[0]?.click()
    } else if (e.key === 'ArrowDown' && total > 0) {
      e.preventDefault()
      enlaces()[0]?.focus()
    }
  }

  const alTeclearLista = (e: KeyboardEvent<HTMLOListElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    const todos = enlaces()
    const i = todos.indexOf(document.activeElement as HTMLElement)
    if (i < 0) return
    e.preventDefault()
    if (e.key === 'ArrowUp' && i === 0) campo.current?.focus()
    else todos[Math.min(todos.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)))].focus()
  }

  return (
    <div className={cx(styles.buscador, oscuro && styles.oscuro, className)}>
      <div role="search" className={styles.campo}>
        <svg className={styles.lupa} viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="7" cy="7" r="4.75" />
          <path d="M10.5 10.5L14 14" />
        </svg>
        <input
          ref={campo}
          type="search"
          value={consulta}
          onChange={(e) => alCambiar(e.target.value)}
          onKeyDown={alTeclearCampo}
          onFocus={alEnfocar}
          placeholder="Nombre o número"
          aria-label="Buscar en el índice por nombre o número"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
        />
        {consulta && (
          <button
            type="button"
            className={styles.borrar}
            aria-label="Borrar la búsqueda"
            onClick={() => {
              alCambiar('')
              campo.current?.focus()
            }}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        )}
      </div>

      {/* Para lectores de pantalla: cuántos resultados hay mientras se escribe */}
      <p className="sr-only" aria-live="polite">
        {mensaje}
      </p>

      {busqueda ? (
        <>
          <p className={cx('mono', styles.estado)} aria-hidden="true">
            {mensaje}
          </p>
          {total > 0 && (
            <ol ref={lista} role="list" className={styles.resultados} onKeyDown={alTeclearLista}>
              {busqueda.resultados.map(({ entrada: e, partes, numeroCoincide }, i) => (
                <li key={e.id}>
                  <Link
                    to={{ hash: `#${e.id}` }}
                    data-id={e.id}
                    className={cx(i === 0 && styles.primero)}
                    aria-current={e.id === activa ? 'location' : undefined}
                    onClick={() => alElegir(e.id)}
                  >
                    {e.numero && <span className={cx('mono', styles.numero, numeroCoincide && styles.coincide)}>{e.numero}</span>}
                    <span>
                      {partes.map((p, k) => (p.marca ? <mark key={k}>{p.texto}</mark> : <Fragment key={k}>{p.texto}</Fragment>))}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </>
      ) : (
        children
      )}
    </div>
  )
}
