import type { Paso } from '@/types/contenido'
import { foto, pendiente } from '@/utils/media'
import fotos from 'virtual:fotos-pasos'

/**
 * PASOS — las 79 estampas del desfile, en su orden.
 * Campos disponibles: ver `interface Paso` en src/types/contenido.ts
 *
 * Los títulos y descripciones están, por ahora, en src/data/pasos.textos.ts: un archivo que vive solo
 * en el computador del administrador y no se sube a GitHub hasta que él lo decida (ver GUIA, sección 6).
 * Si ese archivo no está, cada paso sale como "[pendiente]".
 *
 * Las fotos se ponen en public/media/pasos/paso-01 … paso-79 (ver GUIA, sección 6):
 * la que se llama "principal" va en la tarjeta; las demás quedan detrás, para ver el paso a fondo.
 */

const TOTAL_PASOS = 79

interface TextoPaso {
  titulo: string
  resumen: string
}

// import.meta.glob no falla si el archivo no existe: en ese caso devuelve un objeto vacío
const locales = import.meta.glob<{ textosPasos: Record<number, TextoPaso> }>('./pasos.textos.ts', { eager: true })
const textos: Record<number, TextoPaso> = Object.values(locales)[0]?.textosPasos ?? {}

export const pasos: Paso[] = Array.from({ length: TOTAL_PASOS }, (_, i) => i + 1).map((numero) => {
  const titulo = textos[numero]?.titulo ?? `[Título del paso ${numero}]`
  const suyas = fotos[numero]
  const nombre = `Paso ${numero}, ${titulo}`
  return {
    id: `paso-${numero}`,
    numero,
    titulo,
    resumen: textos[numero]?.resumen ?? '[Descripción pendiente]',
    media: [
      // La primera es la de la tarjeta: la "principal" o, si aún no está, el recuadro de pendiente
      suyas?.principal ? foto(suyas.principal, nombre) : pendiente(`Fotografía del paso ${numero}`),
      ...(suyas?.otras ?? []).map((src, n) => foto(src, `${nombre}: foto ${n + 2}`)),
    ],
  }
})
