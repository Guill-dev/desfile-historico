import { useParams } from 'react-router'
import { objetos } from '@/data/objetos'
import { esPendiente } from '@/utils/media'
import { cx } from '@/utils/cx'
import Media from '@/components/media/Media'
import CabeceraPagina from '@/components/ui/CabeceraPagina'
import PrevNext from '@/components/ui/PrevNext'
import NoEncontrado from '@/pages/NoEncontrado/NoEncontrado'
import f from '@/pages/ficha.module.css'

/** Ficha museográfica de un objeto. Si tiene modelo 3D, este ocupa el escenario principal. */
export default function ObjetoDetalle() {
  const { id } = useParams()
  const i = objetos.findIndex((o) => o.id === id)
  if (i === -1) return <NoEncontrado />

  const objeto = objetos[i]
  const anterior = objetos[i - 1]
  const siguiente = objetos[i + 1]
  const tieneModelo = !esPendiente(objeto.modelo3d)

  return (
    <div className="tema-papel">
      <CabeceraPagina
        volver={{ to: { pathname: '/', hash: '#objetos' }, texto: 'Objetos' }}
        kicker={`Nº ${String(i + 1).padStart(2, '0')} · ${objeto.epoca}`}
        titulo={objeto.nombre}
      />

      <article className={cx('contenedor', f.ficha)}>
        <div className={f.cuerpo}>
          <div className={f.escenario}>
            <Media media={tieneModelo ? objeto.modelo3d : objeto.imagenes[0]} ratio="1 / 1" className={f.media} />
            {/* Mientras no haya modelo, su placeholder deja claro qué falta */}
            {!tieneModelo && <Media media={objeto.modelo3d} ratio="16 / 9" className={f.media} />}
          </div>

          <div className={f.columna}>
            <dl className={f.datos}>
              <dt>Época</dt><dd>{objeto.epoca}</dd>
              <dt>Procedencia</dt><dd>{objeto.procedencia}</dd>
              <dt>Materiales</dt><dd>{objeto.materiales.join(', ')}</dd>
            </dl>
            <section className={f.bloque}>
              <h2>Descripción</h2>
              <p>{objeto.descripcion}</p>
            </section>
            <section className={f.bloque}>
              <h2>Historia</h2>
              <p>{objeto.historia}</p>
            </section>
            <section className={f.bloque}>
              <h2>Significado cultural</h2>
              <p>{objeto.significado}</p>
            </section>
          </div>
        </div>

        <PrevNext
          anterior={anterior && { to: `/objetos/${anterior.id}`, titulo: anterior.nombre }}
          siguiente={siguiente && { to: `/objetos/${siguiente.id}`, titulo: siguiente.nombre }}
        />
      </article>
    </div>
  )
}
