import { cx } from '@/utils/cx'
import { tituloPagina } from '@/utils/titulo'
import Boton from '@/components/ui/Boton'
import CabeceraPagina from '@/components/ui/CabeceraPagina'
import f from '@/pages/ficha.module.css'

export default function NoEncontrado() {
  return (
    <div className="tema-papel">
      <title>{tituloPagina('Página no encontrada')}</title>
      <CabeceraPagina kicker="404" titulo="Esta pieza no está en el archivo" />
      <div className={cx('contenedor', f.ficha)}>
        <Boton to="/" variante="primario">Volver al inicio del recorrido</Boton>
      </div>
    </div>
  )
}
