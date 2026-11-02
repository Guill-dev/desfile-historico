import { capitulo, interludios, rotulo } from '@/data/sitio'
import { versiones } from '@/data/versiones'
import { cx } from '@/utils/cx'
import { useCarrusel } from '@/hooks/useCarrusel'
import SectionHeader from '@/components/ui/SectionHeader'
import Interludio from '@/components/ui/Interludio'
import Flechas from '@/components/ui/Flechas'
import Boton from '@/components/ui/Boton'
import TarjetaEdicion from '@/components/tarjetas/TarjetaEdicion'
import carrusel from '@/components/ui/Carrusel.module.css'
import styles from './Versiones.module.css'

const cap = capitulo('versiones')

/**
 * Viaje en el tiempo: una línea de años. El pueblo es el protagonista.
 * En el celular, las cuatro más recientes en 2 × 2 y "Ver todas" (/versiones).
 */
export default function Versiones() {
  // La pista es una lista ordenada (<ol>): se lo indicamos al carrusel
  const { ref, anterior, siguiente } = useCarrusel<HTMLOListElement>()

  return (
    <section id="versiones" className="tema-papel capitulo" aria-labelledby="versiones-titulo">
      <div className="contenedor">
        <Interludio frase={interludios.antesDeVersiones} />

        <SectionHeader
          id="versiones-titulo"
          kicker={rotulo(cap)}
          titulo={cap.encabezado}
          accion={
            <>
              <Flechas anterior={anterior} siguiente={siguiente} etiqueta="años" />
              <Boton to="/versiones" className={carrusel.soloMovil}>
                Ver las {versiones.length} ediciones →
              </Boton>
            </>
          }
        />

        <ol ref={ref} role="list" className={cx(carrusel.pista, carrusel.muestra, styles.linea)}>
          {versiones.map((v) => (
            <li key={v.anio} className={styles.edicion}>
              <TarjetaEdicion version={v} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
