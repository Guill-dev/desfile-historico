import type { Paso } from '@/types/contenido'
import { pendiente } from '@/utils/media'

/**
 * PASOS — las 79 estampas del desfile, en su orden.
 * Campos disponibles: ver `interface Paso` en src/types/contenido.ts
 *
 * Los títulos y descripciones están, por ahora, en src/data/pasos.textos.ts: un archivo que vive solo
 * en el computador del administrador y no se sube a GitHub hasta que él lo decida (ver GUIA, sección 6).
 * Si ese archivo no está, cada paso sale como "[pendiente]".
 */

const TOTAL_PASOS = 79

interface TextoPaso {
  titulo: string
  resumen: string
}

// import.meta.glob no falla si el archivo no existe: en ese caso devuelve un objeto vacío
const locales = import.meta.glob<{ textosPasos: Record<number, TextoPaso> }>('./pasos.textos.ts', { eager: true })
const textos: Record<number, TextoPaso> = Object.values(locales)[0]?.textosPasos ?? {}

export const pasos: Paso[] = Array.from({ length: TOTAL_PASOS }, (_, i) => i + 1).map((numero) => ({
  id: `paso-${numero}`,
  numero,
  titulo: textos[numero]?.titulo ?? `[Título del paso ${numero}]`,
  resumen: textos[numero]?.resumen ?? '[Descripción pendiente]',
  media: [pendiente(`Fotografía del paso ${numero}`)],
}))
