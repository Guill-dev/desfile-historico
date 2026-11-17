import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { router } from '@/app/router'
// Letras del sitio, servidas desde el propio sitio (sin pedirlas a Google): Rubik y IBM Plex Mono.
// Solo el juego "latin", que trae todo el español (tildes, ñ, ¿¡, º…)
import '@fontsource/rubik/latin-400.css'
import '@fontsource/rubik/latin-500.css'
import '@fontsource/rubik/latin-600.css'
import '@fontsource/rubik/latin-700.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
// Letra manuscrita del poema de la pantalla de entrada (solo se descarga si hay poema)
import '@fontsource/dancing-script/latin-500.css'
import '@fontsource/dancing-script/latin-700.css'
// Letra de grabado clásico, para la tapa del libro de la colección (solo se descarga al llegar ahí)
import '@fontsource/cinzel/latin-600.css'
import '@/styles/index.css'
import { cerrarEntrada } from '@/entrada'

// El "!" le asegura a TypeScript que el <div id="root"> existe (está en index.html)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

// La pantalla de entrada (index.html) se va cuando el sitio ya está andando y pasaron ~4 s
cerrarEntrada()
