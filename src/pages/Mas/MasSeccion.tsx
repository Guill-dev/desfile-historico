import { useParams } from 'react-router'
import { seccionesMas } from '@/data/mas'
import { paginasMas } from './paginas'
import { cx } from '@/utils/cx'
import { tituloPagina } from '@/utils/titulo'
import CabeceraPagina from '@/components/ui/CabeceraPagina'
import NoEncontrado from '@/pages/NoEncontrado/NoEncontrado'
import f from '@/pages/ficha.module.css'

/** Muestra la sección /mas/:slug — su página propia si existe, o la plantilla genérica. */
export default function MasSeccion() {
  const { slug } = useParams()
  const seccion = seccionesMas.find((s) => s.slug === slug)
  if (!seccion) return <NoEncontrado />

  const Pagina = paginasMas[seccion.slug]
  if (Pagina) return <Pagina seccion={seccion} />

  return (
    <div className="tema-papel">
      <title>{tituloPagina(seccion.titulo)}</title>
      <CabeceraPagina volver={{ to: { hash: '#mas' }, texto: 'Más' }} kicker="Más del archivo" titulo={seccion.titulo}>
        <p>{seccion.descripcion}</p>
      </CabeceraPagina>
      <article className={cx('contenedor', f.ficha)}>
        <p className={f.bloque}>[Contenido de «{seccion.titulo}» pendiente]</p>
      </article>
    </div>
  )
}
