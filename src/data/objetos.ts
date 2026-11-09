import type { Objeto } from '@/types/contenido'
import { foto, pendiente, tieneArchivo } from '@/utils/media'
import fotos from 'virtual:fotos-objetos'

/**
 * OBJETOS — piezas ancestrales, históricas o representativas del desfile.
 * Campos disponibles: ver `interface Objeto` en src/types/contenido.ts
 *
 * Los datos reales (nombre, época…) están, por ahora, en src/data/objetos.textos.ts: un archivo que vive solo
 * en el computador del administrador y no se sube a GitHub hasta que él lo decida (ver GUIA, sección 6).
 * Lo que ese archivo no diga sale como "[pendiente]".
 *
 * Los archivos van en public/media/objetos/objeto-01 … objeto-20 (ver GUIA, sección 6):
 *   - modelo.glb (o cualquier .glb): el modelo 3D; si hay, la tarjeta y la ficha muestran el modelo
 *   - tarjeta.glb: versión liviana del modelo para las tarjetas (la hace `npm run modelo`, ver scripts/preparar-modelo.mjs)
 *   - principal.jpg: la foto principal (si no hay modelo, la de la tarjeta); las demás fotos, otras vistas
 */

/** Mientras no haya ninguna pieza real (p. ej. en la copia de GitHub, sin los archivos privados), se ven estas de ejemplo */
const PIEZAS_DE_EJEMPLO = 8

/** Lo que puede decir objetos.textos.ts de cada pieza. `modeloAlt`: descripción del modelo 3D. */
export type TextoObjeto = Partial<Omit<Objeto, 'id' | 'numero' | 'imagenes' | 'modelo3d' | 'modeloTarjeta'>> & {
  modeloAlt?: string
}

// import.meta.glob no falla si el archivo no existe: en ese caso devuelve un objeto vacío
const locales = import.meta.glob<{ textosObjetos: Record<number, TextoObjeto> }>('./objetos.textos.ts', {
  eager: true,
})
const textos: Record<number, TextoObjeto> = Object.values(locales)[0]?.textosObjetos ?? {}

/**
 * Para ordenar la vitrina (inicio y /objetos): primero las piezas con modelo 3D, después las que solo tienen
 * foto y al final las que solo tienen datos. Dentro de cada grupo, al azar.
 */
export function prioridadObjeto(objeto: Objeto): number {
  if (tieneArchivo(objeto.modelo3d)) return 2
  if (tieneArchivo(objeto.imagenes[0])) return 1
  return 0
}

function crearObjeto(n: number): Objeto {
  const { modeloAlt, ...texto } = textos[n] ?? {}
  const nombre = texto.nombre ?? `[Nombre del objeto ${n}]`
  const suyas = fotos[n]
  const conFoto = [suyas?.principal, ...(suyas?.otras ?? [])].filter((src): src is string => Boolean(src))

  return {
    // PLACEHOLDERS: los reemplaza lo que diga objetos.textos.ts
    epoca: '[Año o época]',
    procedencia: '[Procedencia]',
    materiales: ['[Material]'],
    descripcion: '[Descripción pendiente]',
    historia: '[Historia del objeto pendiente]',
    significado: '[Significado cultural pendiente]',
    ...texto,
    id: `objeto-${n}`,
    numero: n,
    nombre,
    // La primera es la principal (vitrina y ficha); las demás, otras vistas de la pieza
    imagenes: conFoto.length
      ? conFoto.map((src, v) => foto(src, v === 0 ? nombre : `${nombre}: vista ${v + 1}`))
      : [1, 2, 3].map((v) => pendiente(`Fotografía del objeto ${n} — vista ${v}`)),
    modelo3d: suyas?.modelo
      ? { tipo: 'modelo3d', src: suyas.modelo, alt: modeloAlt ?? `Modelo 3D de ${nombre}`, poster: suyas.principal ?? undefined }
      : pendiente('Modelo 3D pendiente', 'modelo3d'),
    modeloTarjeta: suyas?.modeloTarjeta ?? undefined,
  }
}

/**
 * La colección: solo las piezas que existen, es decir, las que tienen algo en su carpeta (modelo o fotos)
 * o sus datos en objetos.textos.ts. Van en orden de número (Nº 01, Nº 02…), aunque se muestren al azar.
 * Una carpeta vacía no cuenta: al poner el primer archivo, la pieza aparece sola.
 */
const reales = [...new Set([...Object.keys(fotos), ...Object.keys(textos)].map(Number))].sort((a, b) => a - b)

export const objetos: Objeto[] = (
  reales.length > 0 ? reales : Array.from({ length: PIEZAS_DE_EJEMPLO }, (_, i) => i + 1)
).map(crearObjeto)
