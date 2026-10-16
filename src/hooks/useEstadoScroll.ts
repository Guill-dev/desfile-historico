import { useEffect, useState } from 'react'

interface EstadoScroll {
  /** La página está en su inicio */
  arriba: boolean
  /** Se está bajando: la barra se esconde para dejar ver el contenido */
  oculta: boolean
}

interface Opciones {
  umbral?: number
  ocultarDesde?: number
}

/** Estado de la barra superior según el scroll. */
export function useEstadoScroll({ umbral = 40, ocultarDesde = 320 }: Opciones = {}): EstadoScroll {
  const [estado, setEstado] = useState<EstadoScroll>(() => ({ arriba: window.scrollY < umbral, oculta: false }))

  useEffect(() => {
    let ultimo = window.scrollY
    let pendiente = false

    const actualizar = () => {
      pendiente = false
      const y = window.scrollY
      const delta = y - ultimo
      ultimo = y
      setEstado((previo) => {
        const arriba = y < umbral
        let oculta = previo.oculta
        if (delta > 4 && y > ocultarDesde) oculta = true
        else if (delta < -4 || y <= ocultarDesde) oculta = false
        return previo.arriba === arriba && previo.oculta === oculta ? previo : { arriba, oculta }
      })
    }

    const alDesplazar = () => {
      if (pendiente) return
      pendiente = true
      requestAnimationFrame(actualizar)
    }

    window.addEventListener('scroll', alDesplazar, { passive: true })
    return () => window.removeEventListener('scroll', alDesplazar)
  }, [umbral, ocultarDesde])

  return estado
}
