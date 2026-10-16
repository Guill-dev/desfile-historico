import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { router } from '@/app/router'
import '@/styles/index.css'

// El "!" le asegura a TypeScript que el <div id="root"> existe (está en index.html)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
