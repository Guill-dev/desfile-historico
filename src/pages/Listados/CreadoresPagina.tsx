import { capitulo, rotulo } from '@/data/sitio'
import { creadores } from '@/data/creadores'
import { cx } from '@/utils/cx'
import { tituloPagina } from '@/utils/titulo'
import CabeceraPagina from '@/components/ui/CabeceraPagina'
import Reveal from '@/components/ui/Reveal'
import TarjetaCreador from '@/components/tarjetas/TarjetaCreador'
import styles from './listado.module.css'

const cap = capitulo('creadores')

/** /creadores — todas las personas del desfile (el "Ver todos" del inicio en el celular). */
export default function CreadoresPagina() {
  return (
    <div className="tema-verde">
      <title>{tituloPagina(cap.titulo)}</title>
      <CabeceraPagina volver={{ to: { pathname: '/', hash: '#creadores' }, texto: 'Inicio' }} kicker={rotulo(cap)} titulo={cap.encabezado}>
        <p className={styles.cantidad}>
          {creadores.length} {creadores.length === 1 ? 'persona' : 'personas'}
        </p>
      </CabeceraPagina>

      <div className={cx('contenedor', styles.cuerpo)}>
        <ul role="list" className={styles.grilla}>
          {creadores.map((c, i) => (
            <Reveal as="li" key={c.id} retraso={(i % 4) * 80}>
              <TarjetaCreador creador={c} />
            </Reveal>
          ))}
        </ul>
      </div>
    </div>
  )
}
