/**
 * Dónde se guardan las estadísticas:
 *  - 'supabase': si están VITE_SUPABASE_URL y VITE_SUPABASE_CLAVE (ver GUIA.md, sección 13).
 *  - 'local':    sin Supabase, mientras trabajas con `npm run dev`: se guardan en tu propio navegador,
 *                para probar el panel con tus visitas.
 *  - 'apagado':  sin Supabase en el sitio publicado: no se mide nada.
 */
export type Modo = 'supabase' | 'local' | 'apagado'

const url = import.meta.env.VITE_SUPABASE_URL?.trim().replace(/\/+$/, '')
const clave = import.meta.env.VITE_SUPABASE_CLAVE?.trim()

export const supabase = url && clave ? { url, clave } : null

export const modo: Modo = supabase ? 'supabase' : import.meta.env.DEV ? 'local' : 'apagado'

/** Claves de lo que se guarda en el navegador (localStorage) */
export const CLAVES = {
  visitante: 'desfile:visitante',
  sesion: 'desfile:sesion',
  noMedir: 'desfile:no-medir',
  eventosLocales: 'desfile:eventos',
  sesionAdmin: 'desfile:admin',
} as const
