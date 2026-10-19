import { useEffect, useState } from 'react'

/**
 * Indica cuál de las secciones (por su id, en el orden de la página) se está leyendo:
 * la última cuyo borde superior ya pasó la línea a un tercio de la pantalla.
 * Sirve para resaltar la entrada del índice correspondiente.
 */
export function useSeccionActiva(ids: readonly string[]): string | null {
  const [activa, setActiva] = useState<string | null>(null)
  // Una lista nueva con los mismos ids no debe reiniciar la medición
  const clave = ids.join(' ')

  useEffect(() => {
    const lista = clave.split(' ')
    let cuadro = 0

    const medir = () => {
      cuadro = 0
      const linea = window.innerHeight * 0.35
      let actual: string | null = null
      for (const id of lista) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= linea) actual = id
      }
      setActiva(actual)
    }
    // Como mucho una medición por cuadro de animación, aunque el scroll dispare muchos eventos
    const programar = () => {
      if (!cuadro) cuadro = requestAnimationFrame(medir)
    }

    programar()
    window.addEventListener('scroll', programar, { passive: true })
    window.addEventListener('resize', programar)
    return () => {
      cancelAnimationFrame(cuadro)
      window.removeEventListener('scroll', programar)
      window.removeEventListener('resize', programar)
    }
  }, [clave])

  return activa
}
