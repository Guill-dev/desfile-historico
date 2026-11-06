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
 * Al azar, pero por grupos: primero todos los de mayor prioridad (entre ellos, al azar), luego los siguientes…
 * Ej.: las piezas con modelo 3D primero, después las que tienen foto y al final las de ejemplo.
 */
export function barajarPorPrioridad<T>(lista: readonly T[], prioridad: (x: T) => number): T[] {
  // sort es estable: dentro de cada grupo se conserva el orden al azar de barajar()
  return barajar(lista.map((x) => ({ x, p: prioridad(x) })))
    .sort((a, b) => b.p - a.p)
    .map((e) => e.x)
}

/**
 * `cantidad` elementos distintos de `fuente`, al azar.
 * Si alcanza, evita los de `evitar` (los que se están mostrando), para que siempre cambien todos.
 */
export function alAzarDe<T>(fuente: readonly T[], cantidad: number, evitar: readonly T[] = []): T[] {
  const nuevos = fuente.filter((x) => !evitar.includes(x))
  return barajar(nuevos.length >= cantidad ? nuevos : fuente).slice(0, Math.max(0, Math.min(cantidad, fuente.length)))
}
