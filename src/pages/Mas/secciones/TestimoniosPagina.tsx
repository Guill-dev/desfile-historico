import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { gruposTestimonio, testimonios } from '@/data/testimonios'
import { versiones } from '@/data/versiones'
import type { GrupoTestimonio, Media as Recurso, TestimonioArchivo } from '@/types/contenido'
import { cx } from '@/utils/cx'
import { tieneArchivo } from '@/utils/media'
import { tituloPagina } from '@/utils/titulo'
import CabeceraPagina from '@/components/ui/CabeceraPagina'
import Boton from '@/components/ui/Boton'
import Reveal from '@/components/ui/Reveal'
import Media from '@/components/media/Media'
import type { PaginaMasProps } from '../paginas'
import styles from './TestimoniosPagina.module.css'

/** El que abre la página en grande; los demás van en la cuadrícula */
const destacado = testimonios.find((t) => t.destacado) ?? testimonios[0]
const resto = testimonios.filter((t) => t !== destacado)

/** Grupos del filtro: solo los que tienen testimonios, en el orden de data/testimonios.ts */
const grupos = (Object.keys(gruposTestimonio) as GrupoTestimonio[]).filter((g) => resto.some((t) => t.grupo === g))

/** "Type guard": si devuelve true, TypeScript sabe que el texto es un GrupoTestimonio válido */
function esGrupo(valor: string | null): valor is GrupoTestimonio {
  return grupos.some((g) => g === valor)
}

const aniosPublicados = new Set(versiones.map((v) => v.anio))

/**
 * /mas/testimonios — un testimonio destacado en grande y los demás en tarjetas, con filtro por grupo.
 * El filtro queda en la dirección (/mas/testimonios?grupo=participantes) para poder compartirlo.
 */
export default function TestimoniosPagina({ seccion }: PaginaMasProps) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { hash } = useLocation()

  const valor = params.get('grupo')
  const grupo = esGrupo(valor) ? valor : null
  const visibles = grupo ? resto.filter((t) => t.grupo === grupo) : resto

  // Cambia solo el filtro: conserva el #ancla para no saltar al inicio de la página
  const elegir = (g: GrupoTestimonio | null) => navigate({ search: g ? `?grupo=${g}` : '', hash }, { replace: true })

  return (
    <div className="tema-papel">
      <title>{tituloPagina(seccion.titulo)}</title>
      <CabeceraPagina volver={{ to: { hash: '#mas' }, texto: 'Más' }} kicker="Más del archivo" titulo={seccion.titulo}>
        <p className={styles.descripcion}>{seccion.descripcion}</p>
      </CabeceraPagina>

      <div className={cx('contenedor', styles.cuerpo)}>
        {destacado && <Destacado t={destacado} />}

        {resto.length > 0 && (
          <section className={styles.voces} aria-labelledby="voces-titulo">
            <header className={styles.cabecera}>
              <h2 id="voces-titulo" className={cx('display', styles.titulo)}>Todas las voces</h2>
              {grupos.length > 1 && (
                <div className={styles.filtros} role="group" aria-label="Filtrar testimonios por grupo">
                  <Filtro activo={grupo === null} cantidad={resto.length} onClick={() => elegir(null)}>
                    Todos
                  </Filtro>
                  {grupos.map((g) => (
                    <Filtro key={g} activo={grupo === g} cantidad={resto.filter((t) => t.grupo === g).length} onClick={() => elegir(g)}>
                      {gruposTestimonio[g]}
                    </Filtro>
                  ))}
                </div>
              )}
            </header>

            <p className="sr-only" aria-live="polite">
              {visibles.length === 1 ? '1 testimonio' : `${visibles.length} testimonios`}
            </p>

            <ul role="list" className={styles.grilla}>
              {visibles.map((t) => (
                <Reveal as="li" key={t.id}>
                  <Tarjeta t={t} />
                </Reveal>
              ))}
            </ul>
          </section>
        )}

        <aside className={cx('tema-noche', styles.invitacion)} aria-labelledby="invitacion-titulo">
          <h2 id="invitacion-titulo" className={cx('display', styles.titulo)}>¿Tienes un recuerdo del desfile?</h2>
          <p>Escríbenos: con tu autorización, tu historia puede sumarse a este archivo.</p>
          <div>
            <Boton to="/mas/contacto" variante="primario">Escríbenos</Boton>
          </div>
        </aside>
      </div>
    </div>
  )
}

/** El testimonio grande del inicio, en un bloque verde */
function Destacado({ t }: { t: TestimonioArchivo }) {
  return (
    <section
      id={t.id}
      className={cx('tema-verde', styles.destacado, t.retrato && styles.conRetrato)}
      aria-labelledby={`${t.id}-rotulo`}
    >
      {t.retrato && <Media media={t.retrato} ratio="4 / 5" className={styles.retratoGrande} />}
      <figure className={styles.destacadoTexto}>
        <p id={`${t.id}-rotulo`} className="mono">Testimonio destacado</p>
        <blockquote className={cx(styles.cita, styles.citaGrande)}>
          <p>{t.texto}</p>
        </blockquote>
        {t.grabacion && <Grabacion media={t.grabacion} />}
        {/* Con el retrato grande al lado, el pie no repite la foto pequeña */}
        <Pie t={t} avatar={!t.retrato} />
      </figure>
    </section>
  )
}

/** Un testimonio en la cuadrícula */
function Tarjeta({ t }: { t: TestimonioArchivo }) {
  return (
    <figure id={t.id} className={styles.tarjeta}>
      <blockquote className={styles.cita}>
        <p>{t.texto}</p>
      </blockquote>
      {t.grabacion && <Grabacion media={t.grabacion} />}
      <Pie t={t} />
    </figure>
  )
}

/** Quién lo cuenta, cuándo, dónde se registró y de qué años habla */
function Pie({ t, avatar = true }: { t: TestimonioArchivo; avatar?: boolean }) {
  const registro = [t.fecha, t.fuente].filter(Boolean).join(' · ')
  return (
    <figcaption className={styles.pie}>
      <div className={styles.autor}>
        {avatar && <Retrato media={t.retrato} nombre={t.nombre} />}
        <div>
          <b className={styles.nombre}>{t.nombre}</b>
          <span className={styles.relacion}>{t.relacion}</span>
        </div>
      </div>
      {registro && <p className="mono suave">{registro}</p>}
      {t.ediciones && t.ediciones.length > 0 && (
        <p className={styles.ediciones}>
          <span className="mono suave">Habla de</span>
          {t.ediciones.map((anio) =>
            aniosPublicados.has(anio) ? (
              <Link key={anio} to={`/versiones/${anio}`}>{anio}</Link>
            ) : (
              <span key={anio}>{anio}</span>
            ),
          )}
        </p>
      )}
    </figcaption>
  )
}

/** Foto pequeña redonda; sin foto, las iniciales del nombre */
function Retrato({ media, nombre }: { media?: Recurso; nombre: string }) {
  if (tieneArchivo(media)) return <img src={media.src} alt="" loading="lazy" className={styles.avatar} />
  return (
    <span className={styles.avatar} aria-hidden="true">
      {iniciales(nombre)}
    </span>
  )
}

/** Audio o video original del testimonio */
function Grabacion({ media }: { media: Recurso }) {
  return <Media media={media} ratio={media.tipo === 'video' ? '16 / 9' : '6 / 1'} className={styles.grabacion} />
}

function Filtro({ activo, cantidad, onClick, children }: { activo: boolean; cantidad: number; onClick: () => void; children: string }) {
  return (
    <button type="button" className={styles.filtro} aria-pressed={activo} onClick={onClick}>
      {children}
      <span className={styles.cantidad}>{cantidad}</span>
    </button>
  )
}

/**
 * "Guillermo Alejandro Hernández Quirós" → "GH" (primer nombre y primer apellido).
 * Con menos de cuatro palabras usa la primera y la última. Los nombres pendientes "[…]" no llevan iniciales.
 */
function iniciales(nombre: string): string {
  const [primera, ...otras] = nombre.split(/\s+/).filter(Boolean)
  if (!primera || primera.startsWith('[')) return ''
  // Con dos nombres y dos apellidos, el primer apellido es la tercera palabra
  const apellido = otras.length >= 3 ? otras[1] : otras.at(-1)
  return (primera[0] + (apellido?.[0] ?? '')).toUpperCase()
}
