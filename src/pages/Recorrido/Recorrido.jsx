import Inicio from '@/sections/Inicio/Inicio'
import Historia from '@/sections/Historia/Historia'
import Pasos from '@/sections/Pasos/Pasos'
import Creadores from '@/sections/Creadores/Creadores'
import Objetos from '@/sections/Objetos/Objetos'
import Versiones from '@/sections/Versiones/Versiones'

/**
 * Página principal = la exposición completa. El scroll ES el recorrido.
 * Para reordenar la narrativa basta con mover los bloques aquí
 * (y el orden de `capitulos` en data/sitio.js para el menú).
 * "Más" vive en el pie de página (SiteFooter), presente en todas las páginas.
 */
export default function Recorrido() {
  return (
    <>
      <Inicio />
      <Historia />
      <Pasos />
      <Creadores />
      <Objetos />
      <Versiones />
    </>
  )
}
