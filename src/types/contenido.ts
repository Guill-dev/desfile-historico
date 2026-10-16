/**
 * TIPOS DEL CONTENIDO
 *
 * Aquí se describe la "forma" de cada dato del sitio: qué campos tiene y de qué clase es cada uno
 * (texto = string, número = number, lista = Tipo[], opcional = campo?).
 * Si un dato de src/data/ no cumple esta forma — falta un campo, un año escrito como texto,
 * un nombre de campo mal escrito — el editor lo subraya en rojo antes de que el sitio falle.
 */

/** Un recurso multimedia. `src: null` = pendiente (se muestra un recuadro con la etiqueta `alt`). */
export interface Media {
  tipo: 'imagen' | 'video' | 'audio' | 'modelo3d'
  /** Ruta dentro de /public, p. ej. "/media/objetos/mascara/foto-1.jpg" */
  src: string | null
  /** Descripción de la foto; mientras está pendiente, la etiqueta "[...]" */
  alt: string
  /** Imagen previa (video o modelo 3D) */
  poster?: string
  /** Autor / fuente / archivo de procedencia */
  credito?: string
}

/** Un paso del recorrido del desfile. */
export interface Paso {
  id: string
  numero: number
  titulo: string
  resumen: string
  texto?: string
  media: Media[]
}

export interface Testimonio {
  texto: string
  /** Quién lo dice / dónde se registró */
  fuente?: string
  fecha?: string
}

/** Una persona que creó, organizó, construyó o conserva el desfile. */
export interface Creador {
  id: string
  nombre: string
  /** Año o período de participación */
  periodo: string
  /** Organización, construcción, conservación… */
  rol: string
  retrato: Media
  descripcion: string
  /** Qué aportó al desfile */
  aporte: string
  testimonios: Testimonio[]
  galeria?: Media[]
  /** Información adicional */
  extra?: string
}

/** Una pieza de la colección. */
export interface Objeto {
  id: string
  nombre: string
  /** Año o época */
  epoca: string
  procedencia: string
  materiales: string[]
  /** Descripción breve (vitrina) */
  descripcion: string
  /** Historia de la pieza (ficha completa) */
  historia: string
  significado: string
  imagenes: Media[]
  /** tipo 'modelo3d'; src null = pendiente */
  modelo3d: Media
}

export interface Personaje {
  /** Personaje representado */
  personaje: string
  /** Persona que lo representó */
  interprete: string
  foto?: Media
}

/** Una edición del desfile. */
export interface Version {
  anio: number
  titulo: string
  resumen: string
  portada: Media
  personajes: Personaje[]
  /** Cambios importantes respecto a otras ediciones */
  cambios: string[]
  /** Elementos destacados de la edición */
  destacados: string[]
  galeria: Media[]
}

/** Una sección de "Más" (Historia, Galería, Contacto…). */
export interface SeccionMas {
  slug: string
  titulo: string
  descripcion: string
}

/** Los capítulos del menú. Solo se aceptan estos nombres: un error de escritura se detecta al instante. */
export type IdCapitulo = 'pasos' | 'creadores' | 'objetos' | 'versiones'

export interface Capitulo {
  id: IdCapitulo
  numero: string
  titulo: string
  /** Título grande del bloque */
  encabezado: string
  /** Si el capítulo tiene página propia (p. ej. '/pasos') */
  ruta?: string
}

/** Video o foto principal de la portada. */
export interface Portada {
  video: string | null
  videoMovil: string | null
  poster: string | null
  /** Sombra detrás del título: 0 = nada, 1 = negro */
  oscuridad: number
}
