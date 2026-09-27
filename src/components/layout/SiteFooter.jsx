import { Link } from 'react-router'
import { sitio, textos } from '@/data/sitio'
import { seccionesMas } from '@/data/mas'
import { cx } from '@/utils/cx'
import Marca from '@/components/marca/Marca'
import styles from './SiteFooter.module.css'

/** Cierre de todas las páginas: las secciones de "Más" en grande y el pie. Es el ancla #mas. */
export default function SiteFooter() {
  return (
    <footer id="mas" className={cx('tema-noche', styles.footer)}>
      <div className="contenedor">
        <p className="mono suave">Más del archivo</p>
        <ul role="list" className={styles.lista}>
          {seccionesMas.map((s) => (
            <li key={s.slug}>
              <Link to={`/mas/${s.slug}`}>
                {s.titulo}
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.pie}>
          <Marca />
          <p className="mono suave">{sitio.lugar} · {textos.pie}</p>
        </div>
      </div>
    </footer>
  )
}
