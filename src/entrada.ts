/**
 * Cierra la pantalla de entrada ("telón", está en index.html) cuando ya pasaron ~4 segundos desde que se abrió
 * la página: el centro se apaga, el telón se abre hacia los lados y se quita. Queda anotado en la visita
 * (sessionStorage) para no repetirla al recargar o al volver al inicio.
 */

/** Cuánto dura la pantalla de entrada, contando desde que se abrió la página (milisegundos) */
const DURACION = 4000
/** Con "reducir movimiento": solo un momento, y se desvanece sin moverse */
const DURACION_QUIETA = 1500
/** Lo que tarda en abrirse el telón (ver los estilos de #entrada en index.html) */
const SALIDA = 1200

export function cerrarEntrada() {
  const raiz = document.documentElement
  const entrada = document.getElementById('entrada')
  if (!entrada || !raiz.classList.contains('entrada')) {
    entrada?.remove()
    return
  }
  const quieta = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // performance.now() cuenta desde que se empezó a abrir la página
  const falta = Math.max(0, (quieta ? DURACION_QUIETA : DURACION) - performance.now())

  window.setTimeout(() => {
    entrada.classList.add('sale')
    try {
      sessionStorage.setItem('desfile:entrada', '1')
    } catch {
      /* sin almacenamiento: no pasa nada */
    }
    window.setTimeout(() => {
      raiz.classList.remove('entrada')
      entrada.remove()
    }, quieta ? 450 : SALIDA)
  }, falta)
}
