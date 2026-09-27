# Desfile Histórico de Gualmatán — exposición digital

Experiencia web tipo museo / archivo interactivo sobre el Desfile Histórico de Gualmatán (Nariño, Colombia).
**El scroll es el recorrido**: la página principal es la exposición completa y cada pieza, persona o edición abre su propia ficha.

> 📘 **¿Vas a cambiar textos, fotos o el video?** Lee [GUIA.md](GUIA.md): explica paso a paso dónde está cada cosa.

## Ejecutar

```bash
npm install
npm run dev       # desarrollo en http://localhost:5173
npm run build     # versión de producción en dist/
npm run lint
```

Stack: Vite 8 · React 19 · React Router 8 · CSS Modules (sin librerías de UI).

## Identidad visual

Inspirada en el sitio del Frans Hals Museum (tipografía, bloques de color, formas redondeadas), con los colores de la **bandera de Gualmatán**:

| Color | Hex | Uso |
|---|---|---|
| Verde bandera | `#078930` | Color principal: fondo de los bloques del recorrido |
| Rojo bandera | `#da121a` | Acción principal (botones), puntos de la línea de tiempo, acentos |
| Blanco | `#ffffff` | Texto sobre verde y noche |
| Noche | `#0c1f14` | Portada, vitrina de objetos, menú y pie (verde casi negro) |
| Papel | `#f7f5f0` | Fichas y bloques de lectura larga |

- Tipografía: **Rubik** (títulos en mayúsculas y texto) + **IBM Plex Mono** (rótulos de archivo: años, números de pieza, capítulos). Ambas de Google Fonts.
- Cada bloque usa un tema (`tema-verde`, `tema-noche`, `tema-papel` en `styles/base.css`); botones, líneas y rótulos se adaptan solos.
- Todos los valores viven en `src/styles/tokens.css`.

## Estructura

```
public/
  media/                  Fotos, video, audio y modelos 3D, organizados por sección
    inicio/ pasos/ creadores/ objetos/ versiones/ galeria/ archivo/ general/
src/
  main.jsx                Punto de entrada
  app/
    router.jsx            Mapa de rutas del sitio
    paginasDiferidas.js   Páginas que se cargan bajo demanda
  data/                   ★ TODO EL CONTENIDO vive aquí (sin tocar componentes)
    sitio.js              Nombre, lema, orden de capítulos, frases puente
    pasos.js  creadores.js  objetos.js  versiones.js  mas.js
  sections/               Bloques del recorrido de inicio
    Inicio/ Historia/ Pasos/ Creadores/ Objetos/ Versiones/
  pages/                  Páginas completas
    Recorrido/            La exposición (compone las secciones en orden)
    Pasos/                Página propia de los Pasos (son muchos)
    CreadorDetalle/ ObjetoDetalle/ VersionDetalle/   Fichas
    Mas/                  /mas/:slug + registro de páginas propias
    NoEncontrado/
  components/
    layout/               Layout, SiteHeader, MenuPantalla, SiteFooter (incluye "Más"), ScrollManager
    media/                Media (imagen/video/audio/3D), MediaPlaceholder, ModelViewer
    ui/                   Boton, SectionHeader, CabeceraPagina, Flechas, Carrusel, Reveal, Interludio, PrevNext
    marca/                Bandera de Gualmatán + Marca (logo provisional)
    ilustraciones/        GualmatanAereo: el pueblo desde el aire, animado (SVG)
    pasos/                LineaPasos (lista completa en /pasos)
  hooks/                  useInView, usePrefersReducedMotion, useCarrusel, useEstadoScroll
  styles/                 tokens.css (diseño), reset.css, base.css
  utils/                  media.js (formato multimedia + pendiente()), cx.js
  assets/                 Recursos de diseño importados desde código (texturas, íconos)
```

## Rutas

| Ruta | Contenido |
|---|---|
| `/` | Recorrido: Portada → Conoce la historia → muestra de Pasos → Creadores → Objetos → Versiones (+ "Más" en el pie) |
| `/pasos` | Todos los pasos, con índice (`/pasos#paso-3`) |
| `/creadores/:id` | Ficha de una persona |
| `/objetos/:id` | Ficha museográfica (foto o modelo 3D) |
| `/versiones/:anio` | Una edición del desfile |
| `/mas/:slug` | Historia, Galería, Testimonios, Archivo, Créditos, Contacto… |

## Contenido y placeholders

- **No se inventan datos históricos.** Todo lo pendiente va entre corchetes: `[Nombre del creador]`, `[Descripción histórica pendiente]`.
- Multimedia pendiente: `pendiente('Fotografía del desfile 1985')` → se ve en pantalla como un marco con la etiqueta `[Fotografía del desfile 1985]`.
- Cuando llegue el archivo real, se reemplaza por su ruta:
  ```js
  { tipo: 'imagen', src: '/media/versiones/1985/portada.jpg', alt: 'Descripción de la foto', credito: 'Archivo de …' }
  ```
- Cada archivo en `src/data/` documenta al inicio los campos disponibles.

### Agregar contenido

- **Un año nuevo:** añadir un objeto al arreglo en `src/data/versiones.js`.
- **Un objeto:** añadirlo en `src/data/objetos.js`; fotos y modelo en `public/media/objetos/<id>/`.
- **Modelo 3D:** poner `modelo3d: { tipo: 'modelo3d', src: '/media/objetos/<id>/modelo.glb', alt: '…' }`. El visor se implementa en un solo archivo: `src/components/media/ModelViewer.jsx`.
- **Sección en "Más":** añadir una entrada en `src/data/mas.js` (aparece sola en menú y pie). Si necesita página propia, registrarla en `src/pages/Mas/paginas.js`.

## Publicación

El sitio usa rutas reales (`/objetos/...`). El hosting debe redirigir toda ruta a `index.html` (Netlify, Vercel y similares lo permiten con una línea de configuración).

## Fases

1. ✅ Análisis del proyecto
2. ✅ Arquitectura y estructura
3. ✅ Identidad visual (bandera de Gualmatán + estilo Frans Hals Museum)
4. ✅ Inicio (portada + ilustración animada de Gualmatán)
5. ✅ Navegación y sistema de páginas (barra que se oculta, menú a pantalla completa)
6. ✅ Pasos, Creadores, Objetos, Versiones (estructura y diseño; contenido pendiente)
7. ◐ Interacciones y animaciones (apariciones, carruseles, paralaje; faltan galería/lightbox y visor 3D)
8. ☐ Responsive
9. ☐ Optimización y limpieza
