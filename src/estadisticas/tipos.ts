/**
 * TIPOS DE LAS ESTADÍSTICAS
 *
 * Cada cosa que pasa en el sitio se guarda como un "evento". Todos comparten los datos base
 * (cuándo, en qué página, de qué visita) y cada tipo agrega los suyos en `datos`.
 * `Evento` es una "unión discriminada": según el `tipo`, TypeScript sabe qué trae `datos`.
 *
 * Nada aquí identifica a una persona: los códigos de visita y de visitante son números al azar.
 */

export type Dispositivo = 'movil' | 'tablet' | 'escritorio'

/** Hasta dónde llegó un video o audio */
export type HitoMedia = 'inicio' | '25' | '50' | '75' | 'fin'

interface Base {
  /** Momento del evento (fecha ISO) */
  creado: string
  /** Página: '/', '/pasos', '/objetos/objeto-2'… */
  ruta: string
  /** La visita: se renueva tras 30 minutos sin actividad */
  sesion: string
  /** El navegador: un código al azar que se guarda en él para reconocer cuando vuelve */
  visitante: string
  /** La página vista a la que pertenece: une la vista con su tiempo, sus clics y sus secciones */
  vista: string
  dispositivo: Dispositivo
}

/** Se abrió una página */
export interface EventoVista extends Base {
  tipo: 'vista'
  datos: {
    /** De dónde llegó (solo en la primera página de la visita): 'directo', 'l.facebook.com', 'whatsapp'… */
    origen: string
    /** Ancho de la pantalla en píxeles */
    ancho: number
    idioma: string
    /** Primera página de la visita */
    nueva: boolean
  }
}

/** Tiempo que la página estuvo a la vista (se envía en partes: al salir o al cambiar de pestaña) */
export interface EventoTiempo extends Base {
  tipo: 'tiempo'
  datos: {
    ms: number
    /** Hasta dónde bajó, en % del largo de la página */
    scroll: number
  }
}

/** Un toque o clic */
export interface EventoClic extends Base {
  tipo: 'clic'
  datos: {
    /** El texto o la descripción de lo que se tocó */
    etiqueta: string
    /** 'a', 'button'… o 'zona:img' si se tocó algo que no es un botón ni un enlace */
    elemento: string
    /** A dónde lleva, si es un enlace */
    destino: string
    /** Camino del elemento dentro de la página (para ubicarlo en el mapa de clics) */
    camino: string
    /** Punto exacto dentro del elemento, de 0 a 1 */
    ox: number
    oy: number
    /** Ancho de la pantalla en píxeles */
    ancho: number
  }
}

/** Una sección (capítulo, paso, testimonio…) estuvo a la vista al menos un segundo */
export interface EventoSeccion extends Base {
  tipo: 'seccion'
  datos: { id: string }
}

/** Avance de un video o audio */
export interface EventoMedia extends Base {
  tipo: 'media'
  datos: {
    archivo: string
    medio: 'video' | 'audio'
    hito: HitoMedia
    /** Video que arranca solo, sin sonido y en bucle (como el de la portada) */
    auto: boolean
  }
}

export type Evento = EventoVista | EventoTiempo | EventoClic | EventoSeccion | EventoMedia
export type TipoEvento = Evento['tipo']

/** Un evento sin los datos base: lo que arma cada medición antes de completarlo */
export type NuevoEvento =
  | Pick<EventoVista, 'tipo' | 'datos'>
  | Pick<EventoTiempo, 'tipo' | 'datos'>
  | Pick<EventoClic, 'tipo' | 'datos'>
  | Pick<EventoSeccion, 'tipo' | 'datos'>
  | Pick<EventoMedia, 'tipo' | 'datos'>
