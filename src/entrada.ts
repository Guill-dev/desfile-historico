/**
 * La pantalla de entrada ("telón", está en index.html).
 *  - Al abrir el sitio: se cierra cuando ya pasaron ~4 segundos desde que se abrió la página: el centro se
 *    apaga, el telón se abre hacia los lados y se quita. Queda anotado en la visita (sessionStorage) para no
 *    repetirla al recargar.
 *  - Al tocar el logo de arriba: vuelve a salir completa (ver alTocarLogo), mientras la página sube al inicio.
 */

/** Cuánto dura la pantalla de entrada (milisegundos) */
const DURACION = 4000
/** Con "reducir movimiento": solo un momento, y se desvanece sin moverse */
const DURACION_QUIETA = 1500
/** Lo que tarda en abrirse el telón (ver los estilos de #entrada en index.html) */
const SALIDA = 1200

/** Copia limpia de la pantalla, guardada antes de quitarla, para poder mostrarla otra vez */
let plantilla: HTMLElement | null = null

const quieta = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Espera, abre el telón y quita la pantalla */
function cerrarDespues(entrada: HTMLElement, espera: number) {
  window.setTimeout(() => {
    entrada.classList.add('sale')
    try {
      sessionStorage.setItem('desfile:entrada', '1')
    } catch {
      /* sin almacenamiento: no pasa nada */
    }
    window.setTimeout(() => {
      document.documentElement.classList.remove('entrada')
      entrada.remove()
    }, quieta() ? 450 : SALIDA)
  }, espera)
}

/** Al abrir el sitio (main.tsx): cierra la pantalla de entrada a los ~4 s, o la quita si esta vez no sale */
export function cerrarEntrada() {
  const entrada = document.getElementById('entrada')
  if (!entrada) return
  plantilla = entrada.cloneNode(true) as HTMLElement
  if (!document.documentElement.classList.contains('entrada')) {
    entrada.remove()
    return
  }
  // performance.now() cuenta desde que se empezó a abrir la página
  cerrarDespues(entrada, Math.max(0, (quieta() ? DURACION_QUIETA : DURACION) - performance.now()))
}

/** Vuelve a mostrar la pantalla de entrada completa, ~4 s desde ahora (si ya se está viendo, no hace nada) */
export function mostrarEntrada() {
  const raiz = document.documentElement
  if (!plantilla || raiz.classList.contains('entrada')) return
  // Una copia nueva: así sus animaciones arrancan otra vez desde el principio
  const entrada = plantilla.cloneNode(true) as HTMLElement
  document.body.prepend(entrada)
  raiz.classList.add('entrada')
  cerrarDespues(entrada, quieta() ? DURACION_QUIETA : DURACION)
}

/**
 * El logo de arriba (en la barra y en el menú) lleva al inicio de la página principal, arriba de todo,
 * y vuelve a salir la pantalla de entrada. Si se abre en otra pestaña (Ctrl, Cmd, rueda del mouse), solo
 * se abre la pestaña.
 */
export function alTocarLogo(e: { button: number; ctrlKey: boolean; metaKey: boolean; shiftKey: boolean; altKey: boolean }) {
  if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return
  mostrarEntrada()
  // Detrás del telón: sube de golpe, sin desplazarse (si ya se estaba en el inicio, la ruta no cambia y
  // nadie más lo haría)
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
}
