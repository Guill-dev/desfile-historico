import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { fotosLocales } from './vite-fotos.ts'

/**
 * Al publicar: pide las letras principales apenas se abre la página (la pantalla de entrada ya las usa),
 * en vez de esperar a que llegue la hoja de estilos. Solo Rubik 400 y 700 e IBM Plex Mono 500.
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
        return Object.keys(ctx.bundle ?? {})
          .filter((f) => /(rubik-latin-(400|700)|ibm-plex-mono-latin-500)-normal-[\w-]+\.woff2$/.test(f))
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
  plugins: [react(), fotosLocales(), precargarLetras()],
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
