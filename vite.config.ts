import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fotosLocales } from './vite-fotos.ts'

// https://vite.dev/config/
export default defineConfig({
  // fotosLocales: lee las fotos de public/media/pasos/paso-NN/ y public/media/creadores/creador-NN/ (ver vite-fotos.ts)
  plugins: [react(), fotosLocales()],
  build: {
    // El visor 3D (model-viewer + three.js, ~1 MB) va en su propio archivo y solo se descarga en páginas con modelos
    chunkSizeWarningLimit: 1100,
  },
  resolve: {
    // "@/..." apunta a src/ para evitar rutas relativas largas (../../..)
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
