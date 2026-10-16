import { Fragment } from 'react'
import { useParams } from 'react-router'
import { versiones } from '@/data/versiones'
import { cx } from '@/utils/cx'
import Media from '@/components/media/Media'
import CabeceraPagina from '@/components/ui/CabeceraPagina'
import PrevNext from '@/components/ui/PrevNext'
import NoEncontrado from '@/pages/NoEncontrado/NoEncontrado'
import f from '@/pages/ficha.module.css'

/** Una edición del desfile: quiénes la hicieron, qué cambió, qué se destacó. */
export default function VersionDetalle() {
  const { anio } = useParams()
  const i = versiones.findIndex((v) => String(v.anio) === anio)
  if (i === -1) return <NoEncontrado />

  const version = versiones[i]
  // versiones va de la más reciente a la más antigua: "anterior" en el tiempo es el índice siguiente
  const masAntigua = versiones[i + 1]
  const masReciente = versiones[i - 1]

  return (
    <div className="tema-papel">
      <CabeceraPagina
        volver={{ to: { pathname: '/', hash: '#versiones' }, texto: 'Versiones' }}
        kicker={`Edición · ${version.titulo}`}
        titulo={String(version.anio)}
      />

      <article className={cx('contenedor', f.ficha)}>
        <div className={f.cuerpo}>
          <div className={f.escenario}>
            <Media media={version.portada} ratio="4 / 3" className={f.media} />
          </div>

          <div className={f.columna}>
            <section className={f.bloque}>
              <h2>La edición</h2>
              <p>{version.resumen}</p>
            </section>
            <section className={f.bloque}>
              <h2>Personajes y quienes los representaron</h2>
              <dl className={f.datos}>
                {version.personajes.map((p, n) => (
                  <Fragment key={n}>
                    <dt>{p.personaje}</dt>
                    <dd>{p.interprete}</dd>
                  </Fragment>
                ))}
              </dl>
            </section>
            <section className={f.bloque}>
              <h2>Cambios importantes</h2>
              <ul>{version.cambios.map((c, n) => <li key={n}>{c}</li>)}</ul>
            </section>
            <section className={f.bloque}>
              <h2>Destacados</h2>
              <ul>{version.destacados.map((d, n) => <li key={n}>{d}</li>)}</ul>
            </section>
          </div>
        </div>

        <section className={f.bloqueAncho}>
          <h2>Galería {version.anio}</h2>
          <div className={f.galeria}>
            {version.galeria.map((m, n) => <Media key={n} media={m} ratio="4 / 3" className={f.media} />)}
          </div>
        </section>

        <PrevNext
          anterior={masAntigua && { to: `/versiones/${masAntigua.anio}`, titulo: String(masAntigua.anio) }}
          siguiente={masReciente && { to: `/versiones/${masReciente.anio}`, titulo: String(masReciente.anio) }}
        />
      </article>
    </div>
  )
}
