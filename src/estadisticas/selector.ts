/**
 * Cómo se describe un elemento tocado, para poder contarlo y ubicarlo después en el mapa de clics.
 */

/** Lo que cuenta como "algo que se puede tocar" */
export const INTERACTIVO = 'a, button, summary, label, input, select, textarea, [role="button"], [role="tab"], [role="link"]'

const MAXIMO_ETIQUETA = 80

/**
 * El texto tal como está escrito (sin las mayúsculas que pone el diseño), separando las partes con espacios
 * y saltando lo que es solo decorativo (aria-hidden): "Participantes 2", no "PARTICIPANTES2→".
 */
function textoDe(nodo: Node): string {
  if (nodo.nodeType === Node.TEXT_NODE) return nodo.textContent ?? ''
  if (!(nodo instanceof Element) || nodo.getAttribute('aria-hidden') === 'true' || nodo instanceof HTMLTemplateElement) return ''
  return [...nodo.childNodes].map(textoDe).join(' ')
}

/** El texto que identifica al elemento: su descripción accesible, su texto o el de su imagen */
export function etiquetaDe(el: Element): string {
  const texto = el.getAttribute('aria-label') ?? el.getAttribute('alt') ?? el.getAttribute('title') ?? textoDe(el)
  const limpio = texto.replace(/\s+/g, ' ').trim()
  if (limpio) return limpio.length > MAXIMO_ETIQUETA ? `${limpio.slice(0, MAXIMO_ETIQUETA - 1)}…` : limpio
  // Sin texto (p. ej. una foto sin descripción): el texto alternativo de lo que tiene dentro
  const imagen = el.querySelector('img[alt], [aria-label]')
  return imagen ? etiquetaDe(imagen) : el.tagName.toLowerCase()
}

/**
 * Camino del elemento desde el ancestro más cercano con id, p. ej.
 * "#creadores > div:nth-of-type(1) > ul:nth-of-type(1) > li:nth-of-type(2) > a:nth-of-type(1)".
 * No usa las clases (cambian en cada versión publicada); sí la posición, que es estable.
 */
export function caminoDe(el: Element): string {
  const partes: string[] = []
  let actual: Element | null = el
  while (actual && actual !== document.body && actual !== document.documentElement) {
    if (actual.id && /^[A-Za-z][\w-]*$/.test(actual.id)) {
      partes.unshift(`#${actual.id}`)
      break
    }
    const etiqueta = actual.tagName.toLowerCase()
    let posicion = 1
    for (let hermano = actual.previousElementSibling; hermano; hermano = hermano.previousElementSibling) {
      if (hermano.tagName === actual.tagName) posicion++
    }
    partes.unshift(`${etiqueta}:nth-of-type(${posicion})`)
    actual = actual.parentElement
  }
  return partes.join(' > ')
}

/** Busca el elemento de un camino guardado (en el mapa de clics). Si ya no existe, null. */
export function buscarCamino(documento: Document, camino: string): Element | null {
  if (!camino) return null
  try {
    // Un camino que no llega a un id empieza en el <body>
    return documento.querySelector(camino.startsWith('#') ? camino : `body > ${camino}`)
  } catch {
    return null
  }
}
