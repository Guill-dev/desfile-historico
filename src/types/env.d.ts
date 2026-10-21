/// <reference types="vite/client" />

/**
 * Variables de entorno que lee el sitio (archivos .env, .env.local, .env.production).
 * Solo las que empiezan por VITE_ llegan al navegador. Ver GUIA.md, secciones 12 y 13.
 */
interface ImportMetaEnv {
  /** Dirección pública del sitio, sin "/" al final */
  readonly VITE_SITIO_URL: string
  /** Supabase: dirección del proyecto (https://xxxx.supabase.co). Sin ella, las estadísticas no se envían. */
  readonly VITE_SUPABASE_URL?: string
  /** Supabase: clave pública ("publishable" o "anon"). Es pública por diseño: la seguridad la ponen las reglas de la base. */
  readonly VITE_SUPABASE_CLAVE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
