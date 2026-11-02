import { useState, type CSSProperties } from 'react'
import { capitulo, rotulo } from '@/data/sitio'
import { objetos } from '@/data/objetos'
import { cx } from '@/utils/cx'
import { barajar } from '@/utils/azar'
import { useCarrusel } from '@/hooks/useCarrusel'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useMuestraRotativa } from '@/hooks/useMuestraRotativa'
import SectionHeader from '@/components/ui/SectionHeader'
import Flechas from '@/components/ui/Flechas'
import Boton from '@/components/ui/Boton'
import PausaMuestra from '@/components/ui/PausaMuestra'
import TarjetaObjeto from '@/components/tarjetas/TarjetaObjeto'
import carrusel from '@/components/ui/Carrusel.module.css'
import muestra from '@/components/ui/Muestra.module.css'
import styles from './Objetos.module.css'

const cap = capitulo('objetos')
const MUESTRA = 4
const CADA_MS = 3000

/** Número de la pieza en la colección (su lugar en data/objetos.ts), aunque se muestre en otro orden */
const numeroDe = (id: string) => objetos.findIndex((o) => o.id === id) + 1

/**
 * La vitrina: fondo oscuro para que las piezas resalten. Cada una abre su ficha (lista para 3D).
 * Las piezas salen al azar:
 *  - en el computador, el carrusel completo en un orden distinto cada vez que se entra;
 *  - en el celular, cuatro en 2 × 2 que cambian solas cada 3 s (siempre), y "Ver todas" (/objetos).
 */
export default function Objetos() {
  const { ref, anterior, siguiente } = useCarrusel()
  const esMovil = useMediaQuery('(max-width: 899px)')
  const [orden] = useState(() => barajar(objetos))
  const { visibles, anteriores, ronda, puedeGirar, pausada, alternarPausa } = useMuestraRotativa(objetos, {
    cantidad: MUESTRA,
    cadaMs: CADA_MS,
    activa: esMovil,
  })
  const lista = esMovil ? visibles : orden

  return (
    <section id="objetos" className="tema-noche capitulo" aria-labelledby="objetos-titulo">
      <div className="contenedor">
        <SectionHeader
          id="objetos-titulo"
          kicker={rotulo(cap)}
          titulo={cap.encabezado}
          accion={
            <>
              <Flechas anterior={anterior} siguiente={siguiente} etiqueta="objetos" />
              {puedeGirar && <PausaMuestra pausada={pausada} onClick={alternarPausa} que="piezas" className={carrusel.soloMovil} />}
              <Boton to="/objetos" llamativo className={carrusel.soloMovil}>
                Ver las {objetos.length} piezas →
              </Boton>
            </>
          }
        />

        <ul ref={ref} role="list" className={cx(carrusel.pista, carrusel.muestra, styles.vitrina)}>
          {lista.map((o, i) => {
            if (!esMovil) {
              return (
                <li key={o.id}>
                  <TarjetaObjeto objeto={o} numero={numeroDe(o.id)} />
                </li>
              )
            }
            // En el celular la casilla se queda: la pieza anterior se va girando y la nueva entra girando
            const retraso: CSSProperties = { '--retraso-cambio': `${i * 90}ms` }
            const anterior = anteriores[i]
            return (
              <li key={i} className={muestra.casilla}>
                {ronda > 0 && anterior && (
                  <div key={`sale-${ronda}`} className={muestra.sale} style={retraso} inert aria-hidden>
                    <TarjetaObjeto objeto={anterior} numero={numeroDe(anterior.id)} />
                  </div>
                )}
                <div key={o.id} className={cx(ronda > 0 && muestra.cambio)} style={retraso}>
                  <TarjetaObjeto objeto={o} numero={numeroDe(o.id)} />
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
