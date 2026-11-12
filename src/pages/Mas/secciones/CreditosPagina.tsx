import { fuentes, textosCreditos, type FuenteCredito } from '@/data/creditos'
import { cx } from '@/utils/cx'
import { tituloPagina } from '@/utils/titulo'
import CabeceraPagina from '@/components/ui/CabeceraPagina'
import Boton from '@/components/ui/Boton'
import Reveal from '@/components/ui/Reveal'
import type { PaginaMasProps } from '../paginas'
import styles from './CreditosPagina.module.css'

const { presentacion, grupos = [], referencias = [], agradecimientos = [], dedicatoria } = textosCreditos

/** Abre en otra pestaña sin darle acceso a esta página */
const externo = { target: '_blank', rel: 'noopener noreferrer' } as const

/**
 * /mas/creditos — como la pared de créditos al final de una exposición: quiénes la hicieron, los
 * agradecimientos, los libros consultados y, al final, los mapas, datos y herramientas con sus licencias.
 * Los textos salen de data/creditos.ts.
 */
export default function CreditosPagina({ seccion }: PaginaMasProps) {
  return (
    <div className="tema-papel">
      <title>{tituloPagina(seccion.titulo)}</title>
      <CabeceraPagina volver={{ to: { pathname: '/', hash: '#mas' }, texto: 'Más' }} kicker="Más del archivo" titulo={seccion.titulo}>
        <p className={styles.intro}>{seccion.descripcion}</p>
      </CabeceraPagina>

      <div className={cx('contenedor', styles.cuerpo)}>
        {presentacion && (
          <Reveal as="p" className={styles.presentacion}>
            {presentacion}
          </Reveal>
        )}

        {grupos.length > 0 && (
          <section className={styles.bloque} aria-labelledby="creditos-equipo">
            <h2 id="creditos-equipo" className={cx('display', styles.titulo)}>
              Quiénes la hicieron
            </h2>
            <ul role="list" className={styles.equipo}>
              {grupos.map((g, i) => (
                <Reveal as="li" key={g.titulo} retraso={(i % 3) * 80} className={styles.grupo}>
                  <h3 className={cx('mono', styles.rol)}>{g.titulo}</h3>
                  <ul role="list" className={styles.personas}>
                    {g.personas.map((p) => (
                      <li key={p.nombre + (p.detalle ?? '')}>
                        <span className={styles.nombre}>{p.nombre}</span>
                        {p.detalle && <span className={styles.detalle}>{p.detalle}</span>}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </ul>
          </section>
        )}

        {dedicatoria && (
          <Reveal as="section" className={cx('tema-verde', styles.dedicatoria)} aria-label="Dedicatoria">
            <p>{dedicatoria}</p>
          </Reveal>
        )}

        {agradecimientos.length > 0 && (
          <Reveal as="section" className={cx('tema-noche', styles.gracias)} aria-labelledby="creditos-gracias">
            <h2 id="creditos-gracias" className={cx('display', styles.titulo)}>
              Agradecimientos
            </h2>
            {agradecimientos.map((parrafo) => (
              <p key={parrafo}>{parrafo}</p>
            ))}
          </Reveal>
        )}

        {referencias.length > 0 && (
          <section className={styles.bloque} aria-labelledby="creditos-libros">
            <h2 id="creditos-libros" className={cx('display', styles.titulo)}>
              Libros y documentos
            </h2>
            <ul role="list" className={styles.referencias}>
              {referencias.map((r) => (
                <li key={r.titulo} className={styles.referencia}>
                  <cite className={styles.obra}>{r.titulo}</cite>
                  {(r.autor || r.datos) && <p>{[r.autor, r.datos].filter(Boolean).join(' · ')}</p>}
                  {r.nota && <p className={cx('mono', styles.nota)}>{r.nota}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className={styles.bloque} aria-labelledby="creditos-fuentes">
          <h2 id="creditos-fuentes" className={cx('display', styles.titulo)}>
            Mapas, datos y herramientas
          </h2>
          {fuentes.map((grupo) => (
            <div key={grupo.titulo} className={styles.grupoFuentes}>
              <h3 className={cx('mono', styles.rol)}>{grupo.titulo}</h3>
              <ul role="list" className={styles.fuentes}>
                {grupo.fuentes.map((f) => (
                  <Fuente key={f.nombre} f={f} />
                ))}
              </ul>
            </div>
          ))}
        </section>

        <aside className={styles.cierre}>
          <p>¿Falta alguien o ves un error? Escríbenos y lo corregimos.</p>
          <Boton to="/mas/contacto" variante="primario">
            Escribirnos →
          </Boton>
        </aside>
      </div>
    </div>
  )
}

function Fuente({ f }: { f: FuenteCredito }) {
  return (
    <li className={cx(styles.fuente, f.obligatorio && styles.destacada)}>
      <div className={styles.fuenteTexto}>
        <a href={f.url} className={styles.fuenteNombre} {...externo}>
          {f.nombre}
          <span aria-hidden="true"> ↗</span>
        </a>
        <p>{f.uso}</p>
        {f.nota && <p className={cx('mono', styles.nota)}>{f.nota}</p>}
      </div>
      <a href={f.licencia.url} className={cx('mono', styles.licencia)} aria-label={`Licencia ${f.licencia.nombre}`} {...externo}>
        {f.licencia.nombre}
      </a>
    </li>
  )
}
