/** Fotos de una colección (las arma vite-fotos.ts). La clave es el número: paso-03 → 3, creador-03 → 3. */
interface FotosLocales {
  /** La foto llamada "principal": va en la tarjeta */
  principal: string | null
  /** Las demás fotos de la carpeta, en orden por nombre */
  otras: string[]
  /** El modelo 3D (.glb) de la carpeta, si hay uno */
  modelo: string | null
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
