import { useEffect, useRef, type RefObject } from 'react'
import { Link } from 'react-router'
import { capitulos, destino, sitio } from '@/data/sitio'
import { seccionesMas } from '@/data/mas'
import { cx } from '@/utils/cx'
import Marca from '@/components/marca/Marca'
import styles from './MenuPantalla.module.css'

interface Props {
  abierto: boolean
  onCerrar: () => void
  /** Botón "Menú" de la barra: recibe el foco de vuelta al cerrar */
  botonMenu: RefObject<HTMLButtonElement | null>
}

/** Menú a pantalla completa: capítulos en grande y accesos directos a "Más". */
export default function MenuPantalla({ abierto, onCerrar, botonMenu }: Props) {
  const panel = useRef<HTMLDivElement>(null)
  const botonCerrar = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!abierto) return
    const overflowPrevio = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    botonCerrar.current?.focus()

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
      if (e.key !== 'Tab' || !panel.current) return
      // Mantener el foco dentro del menú mientras está abierto
      const enfocables = panel.current.querySelectorAll<HTMLElement>('a[href], button')
      const primero = enfocables[0]
      const ultimo = enfocables[enfocables.length - 1]
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primero.focus()
      }
    }
    document.addEventListener('keydown', alTeclear)

    const boton = botonMenu.current
    return () => {
      document.body.style.overflow = overflowPrevio
      document.removeEventListener('keydown', alTeclear)
      boton?.focus()
    }
  }, [abierto, onCerrar, botonMenu])

  return (
    <div
      ref={panel}
      id="menu-pantalla"
      className={cx('tema-noche', styles.menu, abierto && styles.abierto)}
      role="dialog"
      aria-modal="true"
      aria-label="Menú"
      inert={!abierto}
    >
      <div className={cx('contenedor', styles.barra)}>
        <Link to="/" onClick={onCerrar} className={styles.marca} aria-label="Inicio">
          <Marca />
        </Link>
        <button ref={botonCerrar} type="button" onClick={onCerrar} className={styles.cerrar} aria-label="Cerrar menú">
          ✕
        </button>
      </div>

      <div className={cx('contenedor', styles.cuerpo)}>
        <nav aria-label="Capítulos">
          <ol role="list" className={styles.principal}>
            {capitulos.map((c, i) => (
              <li key={c.id} style={{ '--i': i }}>
                <Link to={destino(c)} onClick={onCerrar}>
                  <span className="mono suave">{c.numero}</span>
                  {c.titulo}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className={styles.directo}>
          <p className="mono suave">Más</p>
          <ul role="list">
            {seccionesMas.map((s) => (
              <li key={s.slug}>
                <Link to={`/mas/${s.slug}`} onClick={onCerrar}>{s.titulo}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={cx('contenedor', styles.pie)}>
        <p className="mono suave">{sitio.lugar}</p>
      </div>
    </div>
  )
}
