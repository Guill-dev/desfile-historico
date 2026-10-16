import { sitio } from '@/data/sitio'

/**
 * Título de la pestaña del navegador: "Galería · Desfile Histórico de Gualmatán".
 * Se usa con la etiqueta <title> dentro de cualquier página (React 19 la lleva sola al <head>).
 */
export function tituloPagina(titulo?: string): string {
  return titulo ? `${titulo} · ${sitio.nombre}` : sitio.nombre
}
