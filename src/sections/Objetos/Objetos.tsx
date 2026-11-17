import { capitulo, rotulo } from '@/data/sitio'
import { objetos, prioridadObjeto } from '@/data/objetos'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import SectionHeader from '@/components/ui/SectionHeader'
import Boton from '@/components/ui/Boton'
import LibroColeccion from './LibroColeccion'

const cap = capitulo('objetos')

/** En el libro: primero las piezas con modelo 3D, luego las que tienen foto y al final las demás; cada grupo, por número */
const enOrden = [...objetos].sort((a, b) => prioridadObjeto(b) - prioridadObjeto(a) || a.numero - b.numero)

/**
 * La colección, como un libro (un catálogo de museo): 2 piezas por página, con sus modelos 3D girando.
 * En el computador se ven dos páginas a la vez; en el celular, una. Cada pieza abre su ficha, y
 * "Ver las N piezas" lleva a /objetos.
 */
export default function Objetos() {
  const doble = useMediaQuery('(min-width: 900px)')

  return (
    <section id="objetos" className="tema-noche capitulo" aria-labelledby="objetos-titulo">
      <div className="contenedor">
        <SectionHeader
          id="objetos-titulo"
          kicker={rotulo(cap)}
          titulo={cap.encabezado}
          accion={
            <Boton to="/objetos" llamativo>
              Ver las {objetos.length} piezas →
            </Boton>
          }
        />

        {/* Al pasar de celular a computador (o al revés) el libro se arma de nuevo, desde el principio */}
        <LibroColeccion key={doble ? 'doble' : 'sencillo'} objetos={enOrden} doble={doble} titulo={cap.encabezado} />
      </div>
    </section>
  )
}
