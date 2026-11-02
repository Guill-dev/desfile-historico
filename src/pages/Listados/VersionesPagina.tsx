import { capitulo, rotulo } from '@/data/sitio'
import { versiones } from '@/data/versiones'
import { cx } from '@/utils/cx'
import { tituloPagina } from '@/utils/titulo'
import CabeceraPagina from '@/components/ui/CabeceraPagina'
import Reveal from '@/components/ui/Reveal'
import TarjetaEdicion from '@/components/tarjetas/TarjetaEdicion'
import styles from './listado.module.css'

const cap = capitulo('versiones')

/** /versiones — todas las ediciones, de la más reciente a la más antigua (el "Ver todas" del inicio en el celular). */
export default function VersionesPagina() {
  return (
    <div className="tema-papel">
      <title>{tituloPagina(cap.titulo)}</title>
      <CabeceraPagina volver={{ to: { pathname: '/', hash: '#versiones' }, texto: 'Inicio' }} kicker={rotulo(cap)} titulo={cap.encabezado}>
        <p className={styles.cantidad}>
          {versiones.length} {versiones.length === 1 ? 'edición' : 'ediciones'}
        </p>
      </CabeceraPagina>

      <div className={cx('contenedor', styles.cuerpo)}>
        <ol role="list" className={styles.grilla}>
          {versiones.map((v, i) => (
            <Reveal as="li" key={v.anio} retraso={(i % 4) * 80} className={styles.edicion}>
              <TarjetaEdicion version={v} />
            </Reveal>
          ))}
        </ol>
      </div>
    </div>
  )
}
