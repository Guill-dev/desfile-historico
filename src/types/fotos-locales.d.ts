/** Fotos de una colección (las arma vite-fotos.ts). La clave es el número: paso-03 → 3, creador-03 → 3. */
interface FotosLocales {
  /** La foto llamada "principal": va en la tarjeta */
  principal: string | null
  /** Las demás fotos de la carpeta, en orden por nombre */
  otras: string[]
  /** El modelo 3D (.glb) de la carpeta, si hay uno */
  modelo: string | null
  /** tarjeta.glb: la versión liviana del modelo, para las tarjetas */
  modeloTarjeta: string | null
  /** Copia pequeña de la foto principal (640 px), para mosaicos; la crea vite-fotos.ts */
  miniatura: string | null
  /** Todas las fotos en orden (la principal primero), con su miniatura si la tiene (en versiones, todas) */
  todas: { src: string; miniatura: string | null }[]
}

/** Fotos encontradas en public/media/pasos/paso-NN/ */
declare module 'virtual:fotos-pasos' {
  const fotos: Record<number, FotosLocales>
  export default fotos
}

/** Fotos encontradas en public/media/creadores/creador-NN/ */
declare module 'virtual:fotos-creadores' {
  const fotos: Record<number, FotosLocales>
  export default fotos
}

/** Fotos y modelo 3D encontrados en public/media/objetos/objeto-NN/ */
declare module 'virtual:fotos-objetos' {
  const fotos: Record<number, FotosLocales>
  export default fotos
}

/** Fotos de cada año del desfile, en public/media/versiones/2025, 2024… (las organiza `npm run versiones`) */
declare module 'virtual:fotos-versiones' {
  const fotos: Record<number, FotosLocales>
  export default fotos
}
