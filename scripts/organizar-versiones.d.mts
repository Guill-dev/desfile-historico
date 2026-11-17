/** Tipos de organizar-versiones.mjs (para usarlo desde vite-fotos.ts) */
export function organizarVersiones(opciones: {
  /** Carpeta del proyecto */
  raiz: string
  avisar?: (mensaje: string) => void
}): Promise<{ organizadas: number; pendientes: number }>
