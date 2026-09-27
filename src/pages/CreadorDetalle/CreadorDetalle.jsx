import { useParams } from 'react-router'
import { creadores } from '@/data/creadores'
import { cx } from '@/utils/cx'
import Media from '@/components/media/Media'
import CabeceraPagina from '@/components/ui/CabeceraPagina'
import PrevNext from '@/components/ui/PrevNext'
import NoEncontrado from '@/pages/NoEncontrado/NoEncontrado'
import f from '@/pages/ficha.module.css'

/** Ficha de una persona: retrato, aporte, testimonios e información adicional. */
export default function CreadorDetalle() {
  const { id } = useParams()
  const i = creadores.findIndex((c) => c.id === id)
  if (i === -1) return <NoEncontrado />

  const creador = creadores[i]
  const anterior = creadores[i - 1]
  const siguiente = creadores[i + 1]

  return (
    <div className="tema-papel">
      <CabeceraPagina
        volver={{ to: { pathname: '/', hash: '#creadores' }, texto: 'Creadores' }}
        kicker={`${creador.rol} · ${creador.periodo}`}
        titulo={creador.nombre}
      />

      <article className={cx('contenedor', f.ficha)}>
        <div className={f.cuerpo}>
          <div className={f.escenario}>
            <Media media={creador.retrato} ratio="3 / 4" className={f.media} />
          </div>

          <div className={f.columna}>
            <section className={f.bloque}>
              <h2>Quién es</h2>
              <p>{creador.descripcion}</p>
            </section>
            <section className={f.bloque}>
              <h2>Aporte al desfile</h2>
              <p>{creador.aporte}</p>
            </section>
            {creador.testimonios.length > 0 && (
              <section className={f.bloque}>
                <h2>Testimonios</h2>
                {creador.testimonios.map((t, n) => (
                  <blockquote key={n} className={f.cita}>
                    <p>{t.texto}</p>
                    {t.fuente && <footer>— {t.fuente}</footer>}
                  </blockquote>
                ))}
              </section>
            )}
            {creador.extra && (
              <section className={f.bloque}>
                <h2>Más información</h2>
                <p>{creador.extra}</p>
              </section>
            )}
          </div>
        </div>

        <PrevNext
          anterior={anterior && { to: `/creadores/${anterior.id}`, titulo: anterior.nombre }}
          siguiente={siguiente && { to: `/creadores/${siguiente.id}`, titulo: siguiente.nombre }}
        />
      </article>
    </div>
  )
}
