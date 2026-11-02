import { capitulo, rotulo } from '@/data/sitio'
import { creadores } from '@/data/creadores'
import { cx } from '@/utils/cx'
import { useCarrusel } from '@/hooks/useCarrusel'
import SectionHeader from '@/components/ui/SectionHeader'
import Flechas from '@/components/ui/Flechas'
import Boton from '@/components/ui/Boton'
import TarjetaCreador from '@/components/tarjetas/TarjetaCreador'
import carrusel from '@/components/ui/Carrusel.module.css'

const cap = capitulo('creadores')

/**
 * Las personas detrás del desfile. Cada retrato abre su ficha.
 * En el computador, carrusel con flechas; en el celular, las cuatro primeras en 2 × 2 y "Ver todos" (/creadores).
 */
export default function Creadores() {
  const { ref, anterior, siguiente } = useCarrusel()

  return (
    <section id="creadores" className="tema-verde capitulo" aria-labelledby="creadores-titulo">
      <div className="contenedor">
        <SectionHeader
          id="creadores-titulo"
          kicker={rotulo(cap)}
          titulo={cap.encabezado}
          accion={
            <>
              <Flechas anterior={anterior} siguiente={siguiente} etiqueta="creadores" />
              <Boton to="/creadores" className={carrusel.soloMovil}>
                Ver los {creadores.length} creadores →
              </Boton>
            </>
          }
        />

        <ul ref={ref} role="list" className={cx(carrusel.pista, carrusel.muestra)}>
          {creadores.map((c) => (
            <li key={c.id}>
              <TarjetaCreador creador={c} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
