import type { To } from 'react-router'
import type { Capitulo, IdCapitulo, Portada } from '@/types/contenido'

/**
 * Configuración general del sitio y orden del recorrido.
 * Los textos marcados con [ ] son provisionales.
 */

export const sitio = {
  nombre: 'Desfile Histórico de Gualmatán',
  lugar: 'Gualmatán, Nariño, Colombia',
  lema: '[Frase de portada sobre memoria, tradición y pueblo]',
  invitacion: 'Comenzar el recorrido',
}

/**
 * PORTADA — el video (o foto) principal del inicio. Se muestra completo, sin recortes.
 * Los archivos van en /public/media/inicio/ y aquí se escribe su ruta empezando por /media/...
 * Mientras `video` y `poster` estén en null se ve el recuadro de "pendiente".
 */
export const portada: Portada = {
  // Video principal (MP4). Ej.: '/media/inicio/desfile.mp4'
  video: '/media/inicio/desfile.mp4',
  // Opcional: versión más liviana para celulares. Si queda en null, el celular usa `video`.
  videoMovil: '/media/inicio/desfile.mp4',
  // Imagen que se ve mientras carga el video (o sola, si no hay video). Ej.: '/media/inicio/desfile-poster.jpg'
  poster: '/media/inicio/desfile.mp4',
  // Sombra del lado izquierdo del video, detrás del título (en computador): 0 = nada, 1 = negro. Recomendado entre 0.4 y 0.75.
  oscuridad: 0.65,
}

/**
 * Capítulos del menú principal, en orden.
 * - Con `ruta`: el capítulo tiene página propia (p. ej. Pasos, por su extensión).
 * - Sin `ruta`: vive dentro del recorrido de inicio; `id` = id de su <section>.
 * `encabezado` es el título grande del bloque.
 */
export const capitulos: Capitulo[] = [
  { id: 'pasos', numero: '01', titulo: 'Pasos', encabezado: 'Los pasos del desfile', ruta: '/pasos' },
  { id: 'creadores', numero: '02', titulo: 'Creadores', encabezado: 'Quienes lo hicieron posible' },
  { id: 'objetos', numero: '03', titulo: 'Objetos', encabezado: 'La colección' },
  { id: 'versiones', numero: '04', titulo: 'Versiones', encabezado: 'Viaje en el tiempo' },
]

/** Busca un capítulo por su id. Si el id no existe, TypeScript lo marca antes de ejecutar. */
export function capitulo(id: IdCapitulo): Capitulo {
  const encontrado = capitulos.find((c) => c.id === id)
  if (!encontrado) throw new Error(`Falta el capítulo "${id}" en data/sitio.ts`)
  return encontrado
}

/** Rótulo de archivo de un capítulo: "02 · Creadores" */
export const rotulo = (c: Capitulo): string => `${c.numero} · ${c.titulo}`

/** A dónde lleva un capítulo desde el menú: su página o su bloque en el recorrido. */
export const destino = (c: Capitulo): To => c.ruta ?? { pathname: '/', hash: `#${c.id}` }

/** Textos sueltos del sitio. */
export const textos = {
  // Tarjeta oscura "Conoce la historia" (junto a la ilustración del pueblo)
  historia: '[Texto introductorio pendiente: qué es el Desfile Histórico, cómo nació y por qué el pueblo lo mantiene vivo.]',
  // Introducción de la página /pasos
  pasos: '[Introducción a los pasos del desfile pendiente]',
  // Frase del pie de página
  pie: 'Una exposición digital sobre la memoria del pueblo',
}

/** Frases puente entre capítulos (narrativa del recorrido). */
export const interludios = {
  antesDePasos: 'Conoce la historia',
  antesDeVersiones: 'Cada año, el pueblo vuelve a contarla',
}
