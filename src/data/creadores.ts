import type { Creador } from '@/types/contenido'
import { foto, pendiente } from '@/utils/media'
import fotos from 'virtual:fotos-creadores'

/**
 * CREADORES — personas que crearon, organizaron, construyeron o conservan el desfile.
 * No agregar personas ni datos sin fuente confirmada.
 * Campos disponibles: ver `interface Creador` en src/types/contenido.ts
 *
 * Los datos reales (nombre, rol…) están, por ahora, en src/data/creadores.textos.ts: un archivo que vive solo
 * en el computador del administrador y no se sube a GitHub hasta que él lo decida (ver GUIA, sección 6).
 * Lo que ese archivo no diga sale como "[pendiente]".
 *
 * Las fotos se ponen en public/media/creadores/creador-01 … creador-06 (ver GUIA, sección 6):
 * la que se llama "principal" es el retrato de la tarjeta (la portada); las demás salen en su ficha.
 */

const TOTAL_CREADORES = 6

/** Lo que puede decir creadores.textos.ts de cada creador. `retratoAlt`: descripción de su foto principal. */
export type TextoCreador = Partial<Omit<Creador, 'id' | 'retrato' | 'galeria'>> & { retratoAlt?: string }

// import.meta.glob no falla si el archivo no existe: en ese caso devuelve un objeto vacío
const locales = import.meta.glob<{ textosCreadores: Record<number, TextoCreador> }>('./creadores.textos.ts', {
  eager: true,
})
const textos: Record<number, TextoCreador> = Object.values(locales)[0]?.textosCreadores ?? {}

export const creadores: Creador[] = Array.from({ length: TOTAL_CREADORES }, (_, i) => i + 1).map((numero) => {
  const { retratoAlt, ...texto } = textos[numero] ?? {}
  const nombre = texto.nombre ?? '[Nombre del creador]'
  const suyas = fotos[numero]

  return {
    // PLACEHOLDERS: los reemplaza lo que diga creadores.textos.ts
    periodo: '[Año o período]',
    rol: '[Rol en el desfile]',
    descripcion: '[Descripción pendiente]',
    aporte: '[Aporte al desfile pendiente]',
    testimonios: [{ texto: '[Testimonio pendiente]', fuente: '[Fuente]' }],
    ...texto,
    id: `creador-${numero}`,
    nombre,
    retrato: suyas?.principal
      ? foto(suyas.principal, retratoAlt ?? `Retrato de ${nombre}`)
      : pendiente('Retrato del creador'),
    galeria: suyas?.otras.length ? suyas.otras.map((src, n) => foto(src, `${nombre}: foto ${n + 2}`)) : undefined,
  }
})
