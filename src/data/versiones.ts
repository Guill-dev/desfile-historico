import type { Media, Version } from '@/types/contenido'
import { foto, pendiente } from '@/utils/media'
import fotos from 'virtual:fotos-versiones'
import { historia } from './historia'

/**
 * VERSIONES — cada edición (año) del desfile. El pueblo es el protagonista.
 * Campos disponibles: ver `interface Version` en src/types/contenido.ts
 *
 * FOTOS: van en public/media/versiones/<año>/ (p. ej. versiones/2025/). Se ponen como vengan y se corre
 * `npm run versiones`, que guarda las originales en originales/ y deja copias livianas con nombre ordenado
 * (2025-01.jpg, 2025-02.jpg…; la 01 es la portada). Un año con fotos aparece solo, aunque no esté en la lista.
 *
 * TEXTOS (título, resumen, autor de las fotos…): en src/data/versiones.textos.ts, un archivo que vive solo en
 * el computador del administrador y no se sube a GitHub hasta que él lo decida (ver GUIA, sección 6).
 */

/** Años que salen aunque todavía no tengan fotos — confirmar ediciones reales. */
const ANIOS_BASE = [2026, 2025, 2024, 2023]

/**
 * Lo que puede decir versiones.textos.ts de cada año. `autorFotos`: de quién son las fotos de ese año;
 * `autorFotosUrl`: su enlace (Facebook…). Salen en Créditos ("Fotos tomadas de los siguientes autores").
 */
export type TextoVersion = Partial<Pick<Version, 'titulo' | 'resumen' | 'personajes' | 'cambios' | 'destacados'>> & {
  autorFotos?: string
  autorFotosUrl?: string
}

// import.meta.glob no falla si el archivo no existe: en ese caso devuelve un objeto vacío
const locales = import.meta.glob<{ textosVersiones: Record<number, TextoVersion> }>('./versiones.textos.ts', {
  eager: true,
})
const textos: Record<number, TextoVersion> = Object.values(locales)[0]?.textosVersiones ?? {}

const anios = [...new Set([...ANIOS_BASE, ...Object.keys(fotos).map(Number)])].sort((a, b) => b - a)

/** Ordenadas de la más reciente a la más antigua */
export const versiones: Version[] = anios.map((anio) => {
  const { autorFotos, autorFotosUrl, ...texto } = textos[anio] ?? {}
  const suyas: Media[] = (fotos[anio]?.todas ?? []).map((f, n) => ({
    ...foto(f.src, `Desfile Histórico de Gualmatán ${anio}, foto ${n + 1}`),
    miniatura: f.miniatura ?? undefined,
  }))

  return {
    // PLACEHOLDERS: los reemplaza lo que diga versiones.textos.ts
    titulo: `[Título de la edición ${anio}]`,
    resumen: '[Información de la edición pendiente]',
    personajes: [{ personaje: '[Personaje]', interprete: '[Persona que lo representó]' }],
    cambios: ['[Cambio importante pendiente]'],
    destacados: ['[Elemento destacado pendiente]'],
    ...texto,
    anio,
    portada: suyas[0] ?? pendiente(`Fotografía del desfile ${anio}`),
    galeria: suyas.length > 0 ? suyas : [1, 2, 3, 4, 5, 6].map((n) => pendiente(`Foto ${n} de la edición ${anio}`)),
    autorFotos: autorFotos && suyas.length > 0 ? { nombre: autorFotos, url: autorFotosUrl } : undefined,
  }
})

/**
 * El año del primer desfile, para el comienzo de la regla del tiempo del inicio. Sale del dato "Primera edición"
 * de la historia (src/data/historia.textos.ts); si no está, la regla empieza en el año más antiguo que haya.
 */
const primeraEdicion = Number(historia.datos.find((d) => /primera edici/i.test(d.etiqueta))?.valor)
export const primerAnio = Math.min(
  Number.isInteger(primeraEdicion) && primeraEdicion > 1900 ? primeraEdicion : Infinity,
  ...versiones.map((v) => v.anio),
)
