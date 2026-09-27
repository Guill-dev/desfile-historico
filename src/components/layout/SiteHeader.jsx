import { useCallback, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router'
import { capitulos, destino } from '@/data/sitio'
import { useEstadoScroll } from '@/hooks/useEstadoScroll'
import { cx } from '@/utils/cx'
import Marca from '@/components/marca/Marca'
import MenuPantalla from './MenuPantalla'
import styles from './SiteHeader.module.css'

/**
 * Barra superior fija y oscura: se oculta al bajar y reaparece al subir.
 * "Menú" abre el menú a pantalla completa.
 */
export default function SiteHeader() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { oculta } = useEstadoScroll()
  const botonMenu = useRef(null)
  const cerrarMenu = useCallback(() => setMenuAbierto(false), [])

  return (
    <>
      <header className={cx(styles.header, oculta && styles.oculta)}>
        <div className={cx('contenedor', styles.barra)}>
          <Link to="/" className={styles.marca} aria-label="Inicio — Desfile Histórico de Gualmatán">
            <Marca />
          </Link>

          <nav className={styles.nav} aria-label="Principal">
            <ul role="list">
              {capitulos.map((c) => (
                <li key={c.id}>
                  {c.ruta ? (
                    <NavLink to={c.ruta} className={styles.enlace}>{c.titulo}</NavLink>
                  ) : (
                    <Link to={destino(c)} className={styles.enlace}>{c.titulo}</Link>
                  )}
                </li>
              ))}
              <li>
                <Link to={{ hash: '#mas' }} className={styles.enlace}>Más</Link>
              </li>
            </ul>
          </nav>

          <button
            ref={botonMenu}
            type="button"
            className={styles.botonMenu}
            aria-expanded={menuAbierto}
            aria-controls="menu-pantalla"
            onClick={() => setMenuAbierto(true)}
          >
            <span className={styles.lineas} aria-hidden="true"><i /><i /></span>
            Menú
          </button>
        </div>
      </header>

      <MenuPantalla abierto={menuAbierto} onCerrar={cerrarMenu} botonMenu={botonMenu} />
    </>
  )
}
