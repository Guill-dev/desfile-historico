import { capitulo, rotulo, textos } from '@/data/sitio'
import { pasos } from '@/data/pasos'
import { cx } from '@/utils/cx'
import { tituloPagina } from '@/utils/titulo'
import { useSeccionActiva } from '@/hooks/useSeccionActiva'
import CabeceraPagina from '@/components/ui/CabeceraPagina'
import Indice, { type EntradaIndice } from '@/components/ui/Indice'
import LineaPasos from '@/components/pasos/LineaPasos'
import styles from './PasosPagina.module.css'

const cap = capitulo('pasos')

const entradas: EntradaIndice[] = pasos.map((p) => ({
  id: p.id,
  etiqueta: p.titulo,
  numero: String(p.numero).padStart(2, '0'),
}))

/** Página propia de los Pasos: índice para saltar entre ellos + lista completa. */
export default function PasosPagina() {
  const activa = useSeccionActiva(entradas.map((e) => e.id))

  return (
    <div className="tema-verde">
      <title>{tituloPagina(cap.titulo)}</title>
      <CabeceraPagina kicker={rotulo(cap)} titulo={cap.encabezado} volver={{ to: '/', texto: 'Inicio' }}>
        <p className={styles.intro}>{textos.pasos}</p>
      </CabeceraPagina>

      <div className={cx('contenedor', 'capitulo', styles.cuerpo)}>
        <Indice entradas={entradas} nombre="Índice de pasos" activa={activa} />

        <LineaPasos pasos={pasos} />
      </div>
    </div>
  )
}
