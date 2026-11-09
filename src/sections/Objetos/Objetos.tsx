import type { CSSProperties } from 'react'
import { capitulo, rotulo } from '@/data/sitio'
import { objetos, prioridadObjeto } from '@/data/objetos'
import { cx } from '@/utils/cx'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useMuestraRotativa } from '@/hooks/useMuestraRotativa'
import SectionHeader from '@/components/ui/SectionHeader'
import Boton from '@/components/ui/Boton'
import PausaMuestra from '@/components/ui/PausaMuestra'
import TarjetaObjeto from '@/components/tarjetas/TarjetaObjeto'
import muestra from '@/components/ui/Muestra.module.css'
import styles from './Objetos.module.css'

const cap = capitulo('objetos')
/** Cuántas piezas a la vez: 6 en 2 filas de 3 en el computador; 4 en 2 × 2 en el celular */
const EN_COMPUTADOR = 6
const EN_CELULAR = 4
/** Más pausado que los pasos (3 s): las piezas en 3D ya se mueven solas */
const CADA_MS = 8000

/**
 * La vitrina: fondo oscuro para que las piezas resalten. Cada una abre su ficha.
 * Unas pocas piezas al azar (6 en el computador, 4 en el celular) que cambian solas cada CADA_MS,
 * y "Ver las N piezas" (/objetos). Primero salen las que ya tienen modelo 3D (y luego las que tienen foto):
 * si caben todas, se quedan fijas en su casilla y solo cambian las demás.
 */
export default function Objetos() {
  const esCelular = useMediaQuery('(max-width: 899px)')
  // Al pasar de celular a computador (o al revés) cambia cuántas caben: la muestra se arma de nuevo
  return <Vitrina key={esCelular ? 'celular' : 'computador'} cantidad={esCelular ? EN_CELULAR : EN_COMPUTADOR} />
}

function Vitrina({ cantidad }: { cantidad: number }) {
  const { visibles, anteriores, ronda, puedeGirar, pausada, alternarPausa } = useMuestraRotativa(objetos, {
    cantidad,
    cadaMs: CADA_MS,
    prioridad: prioridadObjeto,
  })

  return (
    <section id="objetos" className="tema-noche capitulo" aria-labelledby="objetos-titulo">
      <div className="contenedor">
        <SectionHeader
          id="objetos-titulo"
          kicker={rotulo(cap)}
          titulo={cap.encabezado}
          accion={
            <>
              {puedeGirar && <PausaMuestra pausada={pausada} onClick={alternarPausa} que="piezas" />}
              <Boton to="/objetos" llamativo>
                Ver las {objetos.length} piezas →
              </Boton>
            </>
          }
        />

        <ul role="list" className={styles.vitrina}>
          {visibles.map((o, i) => {
            // La casilla se queda: la pieza anterior se va girando y la nueva entra girando
            const retraso: CSSProperties = { '--retraso-cambio': `${i * 90}ms` }
            // Si la casilla no cambió (una pieza fija), no hay animación de cambio
            const anterior = anteriores[i]
            const cambio = ronda > 0 && anterior !== undefined && anterior.id !== o.id
            return (
              <li key={i} className={muestra.casilla}>
                {/* La que se va lleva la misma clave que tenía: React conserva esa tarjeta (y su modelo 3D ya
                    cargado) y solo le cambia la animación, en vez de crear otra copia del modelo para despedirla */}
                {cambio && (
                  <div key={anterior.id} className={muestra.sale} style={retraso} inert aria-hidden>
                    <TarjetaObjeto objeto={anterior} />
                  </div>
                )}
                <div key={o.id} className={cx(cambio && muestra.cambio)} style={retraso}>
                  <TarjetaObjeto objeto={o} />
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
