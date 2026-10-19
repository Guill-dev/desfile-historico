import { Link, type To } from 'react-router'
import { historia } from '@/data/historia'
import { versiones } from '@/data/versiones'
import { capitulo, destino, rotulo } from '@/data/sitio'
import { cx } from '@/utils/cx'
import { tituloPagina } from '@/utils/titulo'
import { useSeccionActiva } from '@/hooks/useSeccionActiva'
import CabeceraPagina from '@/components/ui/CabeceraPagina'
import Indice, { type EntradaIndice } from '@/components/ui/Indice'
import Reveal from '@/components/ui/Reveal'
import Galeria from '@/components/media/Galeria'
import type { PaginaMasProps } from '../paginas'
import f from '@/pages/ficha.module.css'
import styles from './HistoriaPagina.module.css'

const { entradilla, datos, capitulos, hitos, fuentes } = historia

const numero = (n: number) => String(n + 1).padStart(2, '0')

/** Años con edición publicada: un hito con esa fecha enlaza a /versiones/<año> */
const aniosPublicados = new Set(versiones.map((v) => String(v.anio)))

/** El índice: un capítulo por entrada, más la línea de tiempo y las fuentes si tienen algo */
const entradas: EntradaIndice[] = [
  ...capitulos.map((c, n) => ({ id: c.id, etiqueta: c.titulo, numero: numero(n) })),
  ...(hitos.length > 0 ? [{ id: 'linea-de-tiempo', etiqueta: 'Línea de tiempo' }] : []),
  ...(fuentes.length > 0 ? [{ id: 'fuentes', etiqueta: 'Fuentes' }] : []),
]

/** A dónde seguir al terminar de leer */
const siguientes: { to: To; rotulo: string; titulo: string }[] = [
  ...(['pasos', 'versiones'] as const).map((id) => {
    const cap = capitulo(id)
    return { to: destino(cap), rotulo: rotulo(cap), titulo: cap.encabezado }
  }),
  { to: '/mas/testimonios', rotulo: 'Más del archivo', titulo: 'Testimonios' },
]

/**
 * /mas/historia — el relato completo: entrada y datos clave, capítulos con fotos y citas,
 * línea de tiempo y fuentes. Todo sale de data/historia.ts.
 */
export default function HistoriaPagina({ seccion }: PaginaMasProps) {
  const activa = useSeccionActiva(entradas.map((e) => e.id))

  return (
    <div className="tema-papel">
      <title>{tituloPagina(seccion.titulo)}</title>
      <CabeceraPagina volver={{ to: { pathname: '/', hash: '#historia' }, texto: 'Inicio' }} kicker="Capítulo 00" titulo={seccion.titulo}>
        <p className={styles.descripcion}>{seccion.descripcion}</p>
      </CabeceraPagina>

      <div className={cx('contenedor', 'capitulo', styles.cuerpo)}>
        <Indice entradas={entradas} nombre="Índice de la historia" activa={activa} />

        <article className={styles.relato}>
          <header className={styles.apertura}>
            <p className={styles.entradilla}>{entradilla}</p>
            {datos.length > 0 && (
              <dl className={styles.datos}>
                {datos.map((d) => (
                  <div key={d.etiqueta}>
                    <dt className="mono suave">{d.etiqueta}</dt>
                    <dd className={cx('display', styles.valor)}>{d.valor}</dd>
                  </div>
                ))}
              </dl>
            )}
          </header>

          {capitulos.map((c, n) => (
            <section key={c.id} id={c.id} className={styles.capitulo} aria-labelledby={`${c.id}-titulo`}>
              <p className="mono suave">
                {numero(n)} · {c.epoca}
              </p>
              <h2 id={`${c.id}-titulo`} className={cx('display', styles.titulo)}>{c.titulo}</h2>
              <div className={styles.texto}>
                {c.parrafos.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {c.imagen && (
                <figure className={styles.figura}>
                  <Galeria medios={[c.imagen]} variante="escenario" ratio="3 / 2" />
                  {c.imagen.credito && <figcaption className="mono suave">{c.imagen.credito}</figcaption>}
                </figure>
              )}
              {c.cita && (
                <blockquote className={cx(f.cita, styles.cita)}>
                  <p>{c.cita.texto}</p>
                  {c.cita.fuente && <footer>— {c.cita.fuente}</footer>}
                </blockquote>
              )}
            </section>
          ))}

          {hitos.length > 0 && (
            <section id="linea-de-tiempo" className={cx('tema-verde', styles.linea)} aria-labelledby="linea-titulo">
              <h2 id="linea-titulo" className={cx('display', styles.titulo)}>Línea de tiempo</h2>
              <ol role="list" className={styles.hitos}>
                {hitos.map((h, n) => {
                  const anio = h.fecha.trim()
                  return (
                    <Reveal as="li" key={n} className={styles.hito}>
                      <span className={cx('display', styles.fecha)}>{h.fecha}</span>
                      <div className={styles.hitoTexto}>
                        <h3>{h.titulo}</h3>
                        {h.texto && <p>{h.texto}</p>}
                        {aniosPublicados.has(anio) && (
                          <Link to={`/versiones/${anio}`} className={styles.enlace}>
                            Ver la edición {anio} →
                          </Link>
                        )}
                      </div>
                    </Reveal>
                  )
                })}
              </ol>
            </section>
          )}

          {fuentes.length > 0 && (
            <section id="fuentes" className={styles.fuentes} aria-labelledby="fuentes-titulo">
              <h2 id="fuentes-titulo" className={cx('display', styles.titulo)}>Fuentes</h2>
              <ol className={styles.listaFuentes}>
                {fuentes.map((fuente, n) => {
                  const detalle = [fuente.autor, fuente.tipo, fuente.anio].filter(Boolean).join(' · ')
                  return (
                    <li key={n}>
                      <cite>{fuente.titulo}</cite>
                      {detalle && <span className="suave">{detalle}</span>}
                      {fuente.enlace && (
                        <a href={fuente.enlace} target="_blank" rel="noreferrer" className={styles.enlace}>
                          Ver la fuente ↗
                        </a>
                      )}
                    </li>
                  )
                })}
              </ol>
              <p className={styles.aporte}>
                ¿Tienes documentos, fotos o recuerdos que completen esta historia? <Link to="/mas/contacto">Escríbenos</Link>.
              </p>
            </section>
          )}
        </article>
      </div>

      <nav className={cx('contenedor', styles.sigue)} aria-label="Sigue el recorrido">
        <p className="mono suave">Sigue el recorrido</p>
        <ul role="list">
          {siguientes.map((s) => (
            <li key={s.titulo}>
              <Link to={s.to} className={styles.tarjeta}>
                <span className={cx('mono', styles.rotulo)}>{s.rotulo}</span>
                <b className={styles.tarjetaTitulo}>{s.titulo}</b>
                <span aria-hidden="true" className={styles.flecha}>→</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
