/** Copia de la lista en orden al azar (mezcla de Fisher–Yates: todas las combinaciones igual de probables). */
export function barajar<T>(lista: readonly T[]): T[] {
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

/**
 * `cantidad` posiciones distintas al azar entre 0 y total − 1.
 * Si alcanza, evita las de `evitar` (las que se están mostrando), para que siempre cambien todas.
 */
export function posicionesAlAzar(total: number, cantidad: number, evitar: readonly number[] = []): number[] {
  const todas = Array.from({ length: total }, (_, i) => i)
  const nuevas = todas.filter((i) => !evitar.includes(i))
  const fuente = nuevas.length >= cantidad ? nuevas : todas
  return barajar(fuente).slice(0, Math.min(cantidad, total))
}
