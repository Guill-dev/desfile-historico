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
      // Las secciones van en orden hacia abajo: en vez de medirlas todas (79 pasos) en cada movimiento,
      // se busca partiendo la lista a la mitad una y otra vez (unas 7 medidas)
      let desde = 0
      let hasta = lista.length - 1
      let actual: string | null = null
      while (desde <= hasta) {
        const medio = (desde + hasta) >> 1
        const el = document.getElementById(lista[medio])
        if (el && el.getBoundingClientRect().top <= linea) {
          actual = lista[medio]
          desde = medio + 1
        } else {
          hasta = medio - 1
        }
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
