import type { Dispositivo, Evento, HitoMedia, NuevoEvento } from './tipos'
import { CLAVES, modo } from './config'
import { guardarEventos } from './almacen'
import { INTERACTIVO, caminoDe, etiquetaDe } from './selector'

/**
 * MEDICIÓN DEL SITIO — anónima: sin cookies, sin nombres, sin dirección IP.
 *
 * Qué se mide en cada página vista:
 *  - la vista misma (y de dónde llegó la visita, en su primera página),
 *  - el tiempo que estuvo a la vista (no cuenta si la pestaña está oculta o tras 5 min sin actividad),
 *  - hasta dónde bajó, qué secciones vio al menos un segundo,
 *  - qué tocó (botones, enlaces, fotos) y cuánto vio de cada video o audio.
 *
 * No se mide: en el panel /admin, dentro de un iframe (el mapa de clics), a robots,
 * a quien pidió "no rastrear" en su navegador, ni en un navegador marcado con "No contar mis visitas".
 */

const MINUTOS_SESION = 30
const MS_INACTIVO = 5 * 60 * 1000
const MS_SECCION = 1000
const MS_ENVIO = 10_000
const SECCIONES = 'main section[id], main li[id], main figure[id], footer[id]'
const HITOS: [number, HitoMedia][] = [
  [0.25, '25'],
  [0.5, '50'],
  [0.75, '75'],
  [0.95, 'fin'],
]

/* ───────────── ¿Se mide? ───────────── */

function permitido(): boolean {
  if (modo === 'apagado' || typeof window === 'undefined') return false
  if (window.self !== window.top) return false
  if (/bot|crawl|spider|slurp|headless|lighthouse/i.test(navigator.userAgent)) return false
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean }
  if (nav.doNotTrack === '1' || nav.globalPrivacyControl) return false
  return !noMedirEsteNavegador()
}

/** El administrador marcó "No contar mis visitas" en este navegador */
export function noMedirEsteNavegador(): boolean {
  try {
    return localStorage.getItem(CLAVES.noMedir) === '1'
  } catch {
    return false
  }
}

export function cambiarNoMedir(noMedir: boolean): void {
  try {
    if (noMedir) localStorage.setItem(CLAVES.noMedir, '1')
    else localStorage.removeItem(CLAVES.noMedir)
  } catch {
    // navegador sin almacenamiento: no hay nada que recordar
  }
}

/* ───────────── Identificadores al azar ───────────── */

const memoria = new Map<string, string>()

function leer(clave: string): string | null {
  try {
    return localStorage.getItem(clave)
  } catch {
    return memoria.get(clave) ?? null
  }
}

function escribir(clave: string, valor: string): void {
  try {
    localStorage.setItem(clave, valor)
  } catch {
    memoria.set(clave, valor)
  }
}

const nuevoId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`

function visitante(): string {
  let id = leer(CLAVES.visitante)
  if (!id) {
    id = nuevoId()
    escribir(CLAVES.visitante, id)
  }
  return id
}

interface SesionGuardada {
  id: string
  /** Última actividad (Date.now()) */
  ultimo: number
}

/** La visita sigue si hubo actividad en los últimos 30 minutos; si no, empieza otra */
function sesion(): { id: string; nueva: boolean } {
  const ahora = Date.now()
  let guardada: SesionGuardada | null
  try {
    guardada = JSON.parse(leer(CLAVES.sesion) ?? 'null') as SesionGuardada | null
  } catch {
    guardada = null
  }
  const vigente = guardada && ahora - guardada.ultimo < MINUTOS_SESION * 60 * 1000
  const id = vigente && guardada ? guardada.id : nuevoId()
  escribir(CLAVES.sesion, JSON.stringify({ id, ultimo: ahora }))
  return { id, nueva: !vigente }
}

function dispositivo(): Dispositivo {
  const ancho = window.innerWidth
  return ancho < 768 ? 'movil' : ancho < 1024 ? 'tablet' : 'escritorio'
}

/** De dónde llegó: ?origen=whatsapp en el enlace compartido, ?utm_source=…, o la página anterior */
function origen(): string {
  const params = new URLSearchParams(location.search)
  const etiqueta = params.get('origen') ?? params.get('utm_source')
  if (etiqueta) return etiqueta.toLowerCase().slice(0, 40)
  try {
    const anterior = new URL(document.referrer)
    if (anterior.host !== location.host) return anterior.hostname
  } catch {
    // sin página anterior
  }
  return 'directo'
}

/* ───────────── Estado de la página que se está viendo ───────────── */

interface PaginaActual {
  vista: string
  ruta: string
  sesion: string
  /** performance.now() al abrirla */
  inicio: number
  /** Desde cuándo está a la vista (null = pestaña oculta) */
  visibleDesde: number | null
  /** Tiempo a la vista aún no enviado */
  acumulado: number
  scroll: number
  secciones: Set<string>
  medios: Map<string, Set<HitoMedia>>
}

let actual: PaginaActual | null = null
let cola: Evento[] = []
let primeraVista = true
let ultimaActividad = performance.now()
let observadorSecciones: IntersectionObserver | null = null
const temporizadores = new Map<Element, number>()
let observados = new WeakSet<Element>()

function encolar(evento: NuevoEvento): void {
  if (!actual || !permitido()) return
  // Cada evento mantiene viva la visita (se renueva tras 30 minutos sin actividad)
  escribir(CLAVES.sesion, JSON.stringify({ id: actual.sesion, ultimo: Date.now() }))
  cola.push({
    ...evento,
    creado: new Date().toISOString(),
    ruta: actual.ruta,
    sesion: actual.sesion,
    visitante: visitante(),
    vista: actual.vista,
    dispositivo: dispositivo(),
  } as Evento)
  if (cola.length >= 30) enviar()
}

function enviar(alSalir = false): void {
  if (cola.length === 0) return
  const lote = cola
  cola = []
  void guardarEventos(lote, alSalir)
}

/* ───────────── Tiempo a la vista ───────────── */

/** Suma al acumulado lo que lleva a la vista, sin contar más de 5 minutos después de la última actividad */
function acumular(): void {
  if (!actual || actual.visibleDesde === null) return
  const ahora = performance.now()
  const fin = Math.min(ahora, ultimaActividad + MS_INACTIVO)
  if (fin > actual.visibleDesde) actual.acumulado += fin - actual.visibleDesde
  actual.visibleDesde = ahora
}

function medirScroll(): void {
  if (!actual) return
  const alto = document.documentElement.scrollHeight
  const visto = alto > 0 ? Math.min(1, (window.scrollY + window.innerHeight) / alto) : 1
  actual.scroll = Math.max(actual.scroll, Math.round(visto * 100))
}

function enviarTiempo(): void {
  if (!actual) return
  acumular()
  medirScroll()
  const ms = Math.round(actual.acumulado)
  actual.acumulado = 0
  if (ms >= 500) encolar({ tipo: 'tiempo', datos: { ms, scroll: actual.scroll } })
}

function marcarActividad(): void {
  const ahora = performance.now()
  // Volvió tras estar inactivo: el tiempo vuelve a contar desde ahora
  if (actual && actual.visibleDesde !== null && ahora - ultimaActividad > MS_INACTIVO) {
    acumular()
    actual.visibleDesde = ahora
  }
  ultimaActividad = ahora
}

/* ───────────── Secciones vistas ───────────── */

function observarSecciones(): void {
  observadorSecciones?.disconnect()
  temporizadores.forEach((t) => clearTimeout(t))
  temporizadores.clear()
  observados = new WeakSet()
  observadorSecciones = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        const el = entrada.target
        // "A la vista": la mitad de la sección, o una sección alta que ocupa media pantalla
        const aLaVista =
          entrada.isIntersecting && (entrada.intersectionRatio >= 0.5 || entrada.intersectionRect.height >= window.innerHeight * 0.5)
        if (aLaVista && !temporizadores.has(el)) {
          temporizadores.set(
            el,
            window.setTimeout(() => {
              temporizadores.delete(el)
              if (actual && !actual.secciones.has(el.id)) {
                actual.secciones.add(el.id)
                encolar({ tipo: 'seccion', datos: { id: el.id } })
              }
            }, MS_SECCION),
          )
        } else if (!aLaVista && temporizadores.has(el)) {
          clearTimeout(temporizadores.get(el))
          temporizadores.delete(el)
        }
      }
    },
    { threshold: [0, 0.25, 0.5, 0.75, 1] },
  )
  buscarSecciones()
}

/** Observa las secciones nuevas (las páginas se cargan por partes) */
function buscarSecciones(): void {
  if (!observadorSecciones) return
  for (const el of document.querySelectorAll(SECCIONES)) {
    if (!observados.has(el)) {
      observados.add(el)
      observadorSecciones.observe(el)
    }
  }
}

/* ───────────── Clics ───────────── */

function alTocar(e: MouseEvent): void {
  if (!(e.target instanceof Element)) return
  marcarActividad()
  const interactivo = e.target.closest(INTERACTIVO)
  const el = interactivo ?? e.target
  const caja = el.getBoundingClientRect()
  const enlace = interactivo?.closest('a')
  const etiqueta = interactivo || /^(img|svg|video|picture|figure)$/i.test(el.tagName) ? etiquetaDe(el) : textoCorto(el)

  encolar({
    tipo: 'clic',
    datos: {
      etiqueta,
      elemento: interactivo ? interactivo.tagName.toLowerCase() : `zona:${el.tagName.toLowerCase()}`,
      destino: enlace?.getAttribute('href') ?? '',
      camino: caminoDe(el),
      ox: caja.width ? redondear((e.clientX - caja.left) / caja.width) : 0.5,
      oy: caja.height ? redondear((e.clientY - caja.top) / caja.height) : 0.5,
      ancho: window.innerWidth,
    },
  })
}

/** Para zonas que no son botones: su texto si es corto; si no, solo la etiqueta HTML */
function textoCorto(el: Element): string {
  const texto = (el.textContent ?? '').replace(/\s+/g, ' ').trim()
  return texto && texto.length <= 80 ? texto : el.tagName.toLowerCase()
}

const redondear = (n: number) => Math.round(Math.min(1, Math.max(0, n)) * 100) / 100

/* ───────────── Videos y audios ───────────── */

function alAvanzarMedio(e: Event): void {
  const el = e.target
  if (!(el instanceof HTMLMediaElement) || !actual) return
  const fuente = el.currentSrc || el.src
  if (!fuente) return
  const archivo = decodeURIComponent(fuente.split('?')[0].split('/').pop() ?? fuente)
  const auto = el.muted && el.loop
  if (!auto && !el.paused) marcarActividad()

  let vistos = actual.medios.get(archivo)
  if (!vistos) {
    vistos = new Set()
    actual.medios.set(archivo, vistos)
  }
  const registrar = (hito: HitoMedia) => {
    if (vistos.has(hito)) return
    vistos.add(hito)
    encolar({ tipo: 'media', datos: { archivo, medio: el instanceof HTMLVideoElement ? 'video' : 'audio', hito, auto } })
  }

  if (e.type === 'play') registrar('inicio')
  else if (e.type === 'ended') registrar('fin')
  else if (el.duration > 0 && Number.isFinite(el.duration)) {
    const avance = el.currentTime / el.duration
    for (const [limite, hito] of HITOS) if (avance >= limite) registrar(hito)
  }
}

/* ───────────── Cambios de pestaña y salida ───────────── */

function alCambiarVisibilidad(): void {
  if (!actual) return
  if (document.visibilityState === 'hidden') {
    enviarTiempo()
    actual.visibleDesde = null
    enviar(true)
  } else if (actual.visibleDesde === null) {
    actual.visibleDesde = performance.now()
    marcarActividad()
  }
}

function alSalir(): void {
  enviarTiempo()
  enviar(true)
}

let alDesplazarPendiente = false
function alDesplazar(): void {
  marcarActividad()
  if (alDesplazarPendiente) return
  alDesplazarPendiente = true
  requestAnimationFrame(() => {
    alDesplazarPendiente = false
    medirScroll()
  })
}

/* ───────────── Lo que usa el sitio ───────────── */

/**
 * Pone a escuchar la medición. Devuelve la función que la detiene.
 * Se llama una vez, desde el marco del sitio (components/layout/Medicion.tsx).
 */
export function iniciarMedicion(): () => void {
  if (!permitido()) return () => {}

  const opcionesPasivas = { passive: true, capture: true } as const
  const cambios = new MutationObserver(() => buscarSecciones())
  cambios.observe(document.body, { childList: true, subtree: true })
  const intervalo = window.setInterval(() => enviar(), MS_ENVIO)

  document.addEventListener('click', alTocar, true)
  document.addEventListener('play', alAvanzarMedio, true)
  document.addEventListener('timeupdate', alAvanzarMedio, true)
  document.addEventListener('ended', alAvanzarMedio, true)
  document.addEventListener('visibilitychange', alCambiarVisibilidad)
  window.addEventListener('pagehide', alSalir)
  window.addEventListener('scroll', alDesplazar, { passive: true })
  window.addEventListener('pointerdown', marcarActividad, opcionesPasivas)
  window.addEventListener('keydown', marcarActividad, opcionesPasivas)

  return () => {
    cambios.disconnect()
    clearInterval(intervalo)
    document.removeEventListener('click', alTocar, true)
    document.removeEventListener('play', alAvanzarMedio, true)
    document.removeEventListener('timeupdate', alAvanzarMedio, true)
    document.removeEventListener('ended', alAvanzarMedio, true)
    document.removeEventListener('visibilitychange', alCambiarVisibilidad)
    window.removeEventListener('pagehide', alSalir)
    window.removeEventListener('scroll', alDesplazar)
    window.removeEventListener('pointerdown', marcarActividad, opcionesPasivas)
    window.removeEventListener('keydown', marcarActividad, opcionesPasivas)
    enviar()
  }
}

/** Se abrió una página: cierra la anterior (envía su tiempo) y registra la nueva */
export function registrarVista(ruta: string): void {
  if (!permitido()) return
  // En desarrollo React monta dos veces seguidas: no contar la misma vista dos veces
  if (actual && actual.ruta === ruta && performance.now() - actual.inicio < 1000) return

  enviarTiempo()
  const { id: idSesion, nueva } = sesion()
  const ahora = performance.now()
  actual = {
    vista: nuevoId(),
    ruta,
    sesion: idSesion,
    inicio: ahora,
    visibleDesde: document.visibilityState === 'visible' ? ahora : null,
    acumulado: 0,
    scroll: 0,
    secciones: new Set(),
    medios: new Map(),
  }
  ultimaActividad = ahora
  encolar({
    tipo: 'vista',
    datos: {
      origen: primeraVista && nueva ? origen() : nueva ? 'directo' : '',
      ancho: window.innerWidth,
      idioma: navigator.language,
      nueva,
    },
  })
  primeraVista = false
  observarSecciones()
}
