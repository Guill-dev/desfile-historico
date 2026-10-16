import { Link } from 'react-router'
import { versiones } from '@/data/versiones'
import { objetos } from '@/data/objetos'
import { tituloPagina } from '@/utils/titulo'
import { cx } from '@/utils/cx'
import CabeceraPagina from '@/components/ui/CabeceraPagina'
import Galeria from '@/components/media/Galeria'
import type { PaginaMasProps } from '../paginas'
import styles from './GaleriaPagina.module.css'

/**
 * /mas/galeria — se arma sola con las fotos de los datos:
 * cada edición (portada + galería) y luego todas las fotos de los objetos.
 */
export default function GaleriaPagina({ seccion }: PaginaMasProps) {
  const fotosObjetos = objetos.flatMap((o) => o.imagenes)

  return (
    <div className="tema-papel">
      <title>{tituloPagina(seccion.titulo)}</title>
      <CabeceraPagina volver={{ to: { hash: '#mas' }, texto: 'Más' }} kicker="Más del archivo" titulo={seccion.titulo}>
        <p>{seccion.descripcion}</p>
      </CabeceraPagina>

      <div className={cx('contenedor', styles.cuerpo)}>
        {versiones.map((v) => (
          <section key={v.anio} className={styles.bloque} aria-labelledby={`galeria-${v.anio}`}>
            <header className={styles.cabecera}>
              <h2 id={`galeria-${v.anio}`} className={cx('display', styles.anio)}>{v.anio}</h2>
              <Link to={`/versiones/${v.anio}`} className={styles.enlace}>Ver la edición →</Link>
            </header>
            <Galeria medios={[v.portada, ...v.galeria]} />
          </section>
        ))}

        {fotosObjetos.length > 0 && (
          <section className={styles.bloque} aria-labelledby="galeria-objetos">
            <header className={styles.cabecera}>
              <h2 id="galeria-objetos" className={cx('display', styles.anio)}>Objetos</h2>
              <Link to={{ pathname: '/', hash: '#objetos' }} className={styles.enlace}>Ver la colección →</Link>
            </header>
            <Galeria medios={fotosObjetos} ratio="1 / 1" />
          </section>
        )}
      </div>
    </div>
  )
}
