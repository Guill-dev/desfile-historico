import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { fotosLocales } from './vite-fotos.ts'

/** El poema de la pantalla de entrada: solo en este computador (no se sube a GitHub) */
const ARCHIVO_POEMA = fileURLToPath(new URL('./src/data/poema.textos.json', import.meta.url))

interface Poema {
  versos: string[]
  titulo: string
  autor: string
}

function leerPoema(): Poema | null {
  try {
    const p = JSON.parse(fs.readFileSync(ARCHIVO_POEMA, 'utf8')) as Poema
    return Array.isArray(p.versos) && p.versos.length > 0 ? p : null
  } catch {
    return null
  }
}

const escapar = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Cuánto dura la pantalla de entrada con el poema (milisegundos, hasta que se abre el telón) */
const DURACION_CON_POEMA = 6400

/**
 * PANTALLA DE ENTRADA CON EL POEMA: si está src/data/poema.textos.json, en index.html el título de la pantalla
 * de entrada se cambia por la tarjeta del poema (se escribe verso a verso y se gira para mostrar el autor), y
 * la pantalla dura un poco más. Si no está (p. ej. en la copia de GitHub), queda la de la bandera y el título.
 */
function poemaEnEntrada(): Plugin {
  return {
    name: 'poema-en-entrada',
    configureServer(server) {
      server.watcher.add(ARCHIVO_POEMA)
      server.watcher.on('change', (archivo) => {
        if (archivo === ARCHIVO_POEMA) server.ws.send({ type: 'full-reload' })
      })
    },
    transformIndexHtml(html) {
      const poema = leerPoema()
      if (!poema) return html
      const ultimo = poema.versos.length - 1
      const versos = poema.versos
        .map((v, i) => `<span class="e-verso" style="--v: ${i}">${i === 0 ? '“' : ''}${escapar(v)}${i === ultimo ? '”' : ''}</span>`)
        .join('')
      const tarjeta = `<div class="e-escena"><div class="e-tarjeta">
          <div class="e-cara e-frente"><span class="e-adorno"></span><p class="e-poema">${versos}</p></div>
          <div class="e-cara e-reverso"><span class="e-rotulo">Fragmento del poema</span><span class="e-nombre-poema">${escapar(poema.titulo)}</span><span class="e-adorno"></span><span class="e-autor">${escapar(poema.autor)}</span></div>
        </div></div>`
      return html
        .replace(/<!--poema:inicio-->[\s\S]*?<!--poema:fin-->/, tarjeta)
        .replace(
          '<div id="entrada" aria-hidden="true">',
          `<div id="entrada" class="con-poema" aria-hidden="true" data-duracion="${DURACION_CON_POEMA}" style="--duracion: ${DURACION_CON_POEMA / 1000}s">`,
        )
    },
  }
}

/**
 * Al publicar: pide las letras principales apenas se abre la página (la pantalla de entrada ya las usa),
 * en vez de esperar a que llegue la hoja de estilos. Rubik 400 y 700, IBM Plex Mono 500 y, si hay poema,
 * la letra manuscrita (Dancing Script 500 y 700).
 */
function precargarLetras(): Plugin {
  let base = '/'
  return {
    name: 'precargar-letras',
    apply: 'build',
    configResolved(c) {
      base = c.base
    },
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const letras = leerPoema()
          ? /(plus-jakarta-sans-latin-800|lato-latin-(400|700)|dancing-script-latin-(500|700))-normal-[\w-]+\.woff2$/
          : /(plus-jakarta-sans-latin-800|lato-latin-(400|700))-normal-[\w-]+\.woff2$/
        return Object.keys(ctx.bundle ?? {})
          .filter((f) => letras.test(f))
          .map((f) => ({
            tag: 'link',
            attrs: { rel: 'preload', href: base + f, as: 'font', type: 'font/woff2', crossorigin: '' },
            injectTo: 'head-prepend' as const,
          }))
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // fotosLocales: lee las fotos de public/media/pasos/paso-NN/ y public/media/creadores/creador-NN/ (ver vite-fotos.ts)
  plugins: [react(), fotosLocales(), poemaEnEntrada(), precargarLetras()],
  build: {
    // El visor 3D (model-viewer + three.js, ~1 MB) va en su propio archivo y solo se descarga en páginas con modelos
    chunkSizeWarningLimit: 1100,
  },
  server: {
    // originales/ (respaldos pesados) no cambia mientras se trabaja: vigilarla no sirve y en Windows puede tumbar
    // el servidor si un archivo está ocupado (EBUSY)
    watch: { ignored: ['**/originales/**'] },
  },
  resolve: {
    // "@/..." apunta a src/ para evitar rutas relativas largas (../../..)
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
