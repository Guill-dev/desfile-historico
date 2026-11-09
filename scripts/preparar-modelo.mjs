/**
 * PREPARAR UN MODELO 3D PARA EL SITIO (ver GUIA, sección 6)
 *
 * Los programas que crean modelos (Tripo, Meshy…) los sacan de ~60 MB y 2 millones de triángulos.
 * Este comando hace, en la carpeta de la pieza, dos versiones livianas:
 *   - modelo.glb  → la de la ficha (se gira y se acerca): ~1.3 MB, ~200 mil triángulos, texturas de 2048 px
 *   - tarjeta.glb → la de las tarjetas (pequeñas, varias girando a la vez): ~0.3 MB, ~40 mil triángulos, 1024 px
 *
 * Uso:
 *   npm run modelo -- "C:\Users\...\Descargas\Mi pieza.glb" 15    → crea objeto-15/modelo.glb y tarjeta.glb
 *   npm run modelo -- --tarjetas                                  → hace tarjeta.glb a las piezas que no la tienen
 *
 * Después, el nombre de la pieza va en src/data/objetos.textos.ts. El original (el pesado) no se toca.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const CLI = '@gltf-transform/cli@4.5.1'
const OBJETOS = path.join(import.meta.dirname, '..', 'public', 'media', 'objetos')

const COMPLETO = ['--texture-size', '2048', '--simplify-ratio', '0.1', '--simplify-error', '0.001']
const TARJETA = ['--texture-size', '1024', '--simplify-ratio', '0.2', '--simplify-error', '0.01']

/** Comillas para rutas con espacios ("desfile historico") */
const comillas = (a) => (/[\s"]/.test(a) ? `"${a.replaceAll('"', '\\"')}"` : a)

function optimizar(entrada, salida, opciones) {
  const args = ['-y', CLI, 'optimize', entrada, salida, '--compress', 'draco', '--texture-compress', 'webp', ...opciones]
  // Como una sola línea de comando (shell): en Windows, npx es un .cmd
  const r = spawnSync(['npx', ...args].map(comillas).join(' '), { stdio: ['ignore', 'ignore', 'inherit'], shell: true })
  if (r.status !== 0) throw new Error(`No se pudo procesar ${entrada}`)
}

const mb = (archivo) => `${(fs.statSync(archivo).size / 1024 / 1024).toFixed(2)} MB`

function hacerTarjeta(carpeta, desde) {
  const tarjeta = path.join(carpeta, 'tarjeta.glb')
  optimizar(desde, tarjeta, TARJETA)
  console.log(`  tarjeta.glb  ${mb(tarjeta)}`)
}

const [primero, segundo] = process.argv.slice(2)

if (primero === '--tarjetas') {
  for (const sub of fs.readdirSync(OBJETOS).sort()) {
    const carpeta = path.join(OBJETOS, sub)
    const modelo = path.join(carpeta, 'modelo.glb')
    if (!fs.existsSync(modelo) || fs.existsSync(path.join(carpeta, 'tarjeta.glb'))) continue
    console.log(sub)
    hacerTarjeta(carpeta, modelo)
  }
} else if (primero && segundo && /^\d+$/.test(segundo)) {
  const original = path.resolve(primero)
  if (!fs.existsSync(original)) throw new Error(`No existe el archivo: ${original}`)
  const carpeta = path.join(OBJETOS, `objeto-${segundo.padStart(2, '0')}`)
  fs.mkdirSync(carpeta, { recursive: true })
  console.log(`${path.basename(original)} (${mb(original)}) → ${path.basename(carpeta)}`)
  const modelo = path.join(carpeta, 'modelo.glb')
  optimizar(original, modelo, COMPLETO)
  console.log(`  modelo.glb   ${mb(modelo)}`)
  hacerTarjeta(carpeta, modelo) // desde la versión ya aligerada: "dejar el 20 %" del original sería demasiado
  console.log(`Listo. Falta el nombre de la pieza ${Number(segundo)} en src/data/objetos.textos.ts`)
} else {
  console.log('Uso: npm run modelo -- "ruta del modelo.glb" 15   |   npm run modelo -- --tarjetas')
  process.exitCode = 1
}
