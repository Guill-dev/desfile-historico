import { useState } from 'react'
import { capitulo, rotulo } from '@/data/sitio'
import { objetos, prioridadObjeto } from '@/data/objetos'
import { cx } from '@/utils/cx'
import { barajarPorPrioridad } from '@/utils/azar'
import { tituloPagina } from '@/utils/titulo'
import CabeceraPagina from '@/components/ui/CabeceraPagina'
import Reveal from '@/components/ui/Reveal'
import TarjetaObjeto from '@/components/tarjetas/TarjetaObjeto'
import styles from './listado.module.css'

const cap = capitulo('objetos')

/**
 * /objetos — la colección completa, en vitrina oscura (el "Ver todas" del inicio en el celular).
 * Las piezas salen en un orden al azar distinto cada vez que se entra, pero primero las que ya tienen modelo 3D
 * (y luego las que tienen foto); cada una conserva su número.
 */
export default function ObjetosPagina() {
  const [orden] = useState(() => barajarPorPrioridad(objetos, prioridadObjeto))

  return (
    <div className="tema-noche">
      <title>{tituloPagina(cap.titulo)}</title>
      <CabeceraPagina volver={{ to: { pathname: '/', hash: '#objetos' }, texto: 'Inicio' }} kicker={rotulo(cap)} titulo={cap.encabezado}>
        <p className={styles.cantidad}>
          {objetos.length} {objetos.length === 1 ? 'pieza' : 'piezas'}
        </p>
      </CabeceraPagina>

      <div className={cx('contenedor', styles.cuerpo)}>
        <ul role="list" className={styles.grilla}>
          {orden.map((o, i) => (
            <Reveal as="li" key={o.id} retraso={(i % 4) * 80}>
              <TarjetaObjeto objeto={o} />
            </Reveal>
          ))}
        </ul>
      </div>
    </div>
  )
}
