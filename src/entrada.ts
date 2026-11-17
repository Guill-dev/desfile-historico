/**
 * La pantalla de entrada ("telón", está en index.html).
 *  - Al abrir el sitio: se cierra cuando pasó su tiempo desde que se abrió la página (~4 s, o ~6.4 s con el
 *    poema): el centro se apaga, el telón se abre hacia los lados y se quita. Queda anotado en la visita
 *    (sessionStorage) para no repetirla al recargar.
 *  - Al tocar el logo de arriba desde otra página: vuelve a salir completa (ver alTocarLogo).
 *  - Cuando el telón empieza a abrirse, avisa con el evento EVENTO_TELON: el video de la portada espera ese
 *    momento para arrancar desde el principio (ver VideoPortada).
 */

/** Cuánto dura la pantalla de entrada sin poema (milisegundos). Con poema, la dice index.html (data-duracion) */
const DURACION = 4000
/** Lo que tarda en abrirse el telón (ver los estilos de #entrada en index.html) */
const SALIDA = 1200

/** Se dispara en window cuando el telón empieza a abrirse */
export const EVENTO_TELON = 'desfile:telon'

/** Copia limpia de la pantalla, guardada antes de quitarla, para poder mostrarla otra vez */
let plantilla: HTMLElement | null = null

const quieta = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Cuánto se ve la pantalla. Con "reducir movimiento", la mitad: se ve quieta y se desvanece sin moverse */
function duracionDe(entrada: HTMLElement) {
  const ms = Number(entrada.dataset.duracion) || DURACION
  return quieta() ? ms / 2 : ms
}

/** true mientras la pantalla de entrada tapa la página (antes de que empiece a abrirse el telón) */
export function telonCerrado() {
  const entrada = document.getElementById('entrada')
  return document.documentElement.classList.contains('entrada') && !!entrada && !entrada.classList.contains('sale')
}

/** Espera, abre el telón y quita la pantalla */
function cerrarDespues(entrada: HTMLElement, espera: number) {
  window.setTimeout(() => {
    entrada.classList.add('sale')
    window.dispatchEvent(new Event(EVENTO_TELON))
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

/** Al abrir el sitio (main.tsx): cierra la pantalla de entrada a su tiempo, o la quita si esta vez no sale */
export function cerrarEntrada() {
  const entrada = document.getElementById('entrada')
  if (!entrada) return
  plantilla = entrada.cloneNode(true) as HTMLElement
  if (!document.documentElement.classList.contains('entrada')) {
    entrada.remove()
    return
  }
  // performance.now() cuenta desde que se empezó a abrir la página
  cerrarDespues(entrada, Math.max(0, duracionDe(entrada) - performance.now()))
}

/** Vuelve a mostrar la pantalla de entrada completa, desde ahora (si ya se está viendo, no hace nada) */
export function mostrarEntrada() {
  const raiz = document.documentElement
  if (!plantilla || raiz.classList.contains('entrada')) return
  // Una copia nueva: así sus animaciones arrancan otra vez desde el principio
  const entrada = plantilla.cloneNode(true) as HTMLElement
  document.body.prepend(entrada)
  raiz.classList.add('entrada')
  cerrarDespues(entrada, duracionDe(entrada))
}

/**
 * El logo de arriba (en la barra y en el menú) lleva al inicio de la página principal, arriba de todo:
 *  - si ya se está en la página principal, solo sube (suave), sin pantalla de entrada;
 *  - desde otra página, vuelve a salir la pantalla de entrada mientras se llega al inicio.
 * Si se abre en otra pestaña (Ctrl, Cmd, rueda del mouse), solo se abre la pestaña.
 */
export function alTocarLogo(e: { button: number; ctrlKey: boolean; metaKey: boolean; shiftKey: boolean; altKey: boolean }) {
  if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return
  if (window.location.pathname === import.meta.env.BASE_URL) {
    window.scrollTo({ top: 0, left: 0, behavior: quieta() ? 'auto' : 'smooth' })
    return
  }
  mostrarEntrada()
  // Detrás del telón: sube de golpe, sin desplazarse
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
}
