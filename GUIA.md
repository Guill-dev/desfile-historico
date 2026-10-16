# Guía del proyecto — Desfile Histórico de Gualmatán

Esta guía explica **cómo está armado el sitio y a dónde ir para cambiar cada cosa**.
Si solo vas a cambiar textos, fotos o el video, casi todo se hace en **dos lugares**:

- 📝 **`src/data/`** → todos los textos y la información (nombres, años, descripciones…)
- 🖼️ **`public/media/`** → todos los archivos (fotos, videos, audios, modelos 3D)

---

## 1. Encender el sitio para verlo

Abre una terminal en la carpeta del proyecto y escribe:

```bash
npm run dev
```

Luego abre **http://localhost:5173** en el navegador.
Mientras esté encendido, **cada vez que guardes un archivo la página se actualiza sola**.
Para apagarlo: `Ctrl + C` en la terminal.

---

## 2. "Quiero cambiar…" → "Voy a…"

| Quiero cambiar… | Archivo |
|---|---|
| El **nombre del sitio**, la **frase de portada** o el botón "Comenzar el recorrido" | `src/data/sitio.ts` → `sitio` |
| El **video o foto principal** de la portada | `src/data/sitio.ts` → `portada` (ver sección 7) |
| El texto de la tarjeta **"Conoce la historia"** | `src/data/sitio.ts` → `textos.historia` |
| La frase grande **"Cada año, el pueblo vuelve a contarla"** | `src/data/sitio.ts` → `interludios` |
| Los **títulos del menú** o los títulos grandes de cada bloque | `src/data/sitio.ts` → `capitulos` |
| La frase del **pie de página** | `src/data/sitio.ts` → `textos.pie` |
| Los **Pasos** (títulos, descripciones, fotos) | `src/data/pasos.ts` |
| La introducción de la página de Pasos | `src/data/sitio.ts` → `textos.pasos` |
| Los **Creadores** (nombre, período, rol, retrato, testimonios) | `src/data/creadores.ts` |
| Los **Objetos** (nombre, época, materiales, historia, fotos, 3D) | `src/data/objetos.ts` |
| Las **Versiones / años** del desfile | `src/data/versiones.ts` |
| Las secciones de **"Más"** (Historia, Galería, Contacto…) | `src/data/mas.ts` |
| Los **colores**, tipos de letra, tamaños, redondeos | `src/styles/tokens.css` |
| El **orden de los bloques** de la página de inicio | `src/pages/Recorrido/Recorrido.tsx` |
| La **ilustración animada** del pueblo | `src/components/ilustraciones/GualmatanAereo.tsx` |
| La **bandera** o el logo de la barra superior | `src/components/marca/` |
| La **barra superior** / el **menú** / el **pie** | `src/components/layout/` |

---

## 3. Cómo está armado (mapa de carpetas)

```
desfile historico/
│
├── public/media/            ← 🖼️ TUS ARCHIVOS (fotos, videos, 3D)
│   ├── inicio/              video y foto de la portada
│   ├── pasos/               fotos de cada paso
│   ├── creadores/           retratos
│   ├── objetos/             fotos y modelos 3D de cada objeto
│   ├── versiones/           fotos de cada año (una carpeta por año: 2025/, 2024/…)
│   ├── galeria/  archivo/  general/
│
├── src/
│   ├── data/                ← 📝 TODOS LOS TEXTOS E INFORMACIÓN
│   │   ├── sitio.ts         nombre, frase, portada/video, menú, textos sueltos
│   │   ├── pasos.ts
│   │   ├── creadores.ts
│   │   ├── objetos.ts
│   │   ├── versiones.ts
│   │   └── mas.ts
│   │
│   ├── types/               ← 🧩 LA FORMA DE CADA DATO (TypeScript, ver sección 11)
│   │   └── contenido.ts     qué campos tiene un Paso, un Objeto, una Versión…
│   │
│   ├── sections/            los BLOQUES de la página de inicio (uno por carpeta)
│   ├── pages/               las PÁGINAS completas (inicio, fichas, pasos…)
│   ├── components/          piezas reutilizables (botones, menú, video, ilustración…)
│   ├── styles/              colores, letras y estilos generales
│   ├── hooks/  utils/  app/ funcionamiento interno (normalmente no se tocan)
│
├── tsconfig*.json           configuración de TypeScript (no hace falta tocarla)
├── GUIA.md                  esta guía
└── README.md                resumen técnico
```

Cada bloque o página es una carpeta con **dos archivos**:
- `Nombre.tsx` → **qué** se muestra (estructura). Es React + TypeScript.
- `Nombre.module.css` → **cómo** se ve (tamaños, espacios, colores de ese bloque)

Los archivos de datos y funciones terminan en **`.ts`**; los que dibujan pantalla (tienen etiquetas `< >`) en **`.tsx`**.

---

## 4. Cómo se compone la página de inicio

La página de inicio es un recorrido de arriba hacia abajo. Cada bloque vive en `src/sections/`:

| # | Lo que ves | Carpeta | Su información viene de |
|---|---|---|---|
| 1 | **Portada** oscura con el video, el título y el botón rojo | `sections/Inicio/` | `data/sitio.ts` → `sitio` y `portada` |
| 2 | **Conoce la historia**: la ilustración del pueblo + tarjeta oscura | `sections/Historia/` | `data/sitio.ts` → `textos.historia` |
| 3 | **Los pasos del desfile**: muestra de 3 + botón "Ver los N pasos" | `sections/Pasos/` | `data/pasos.ts` |
| 4 | **Quienes lo hicieron posible**: carrusel de retratos | `sections/Creadores/` | `data/creadores.ts` |
| 5 | **La colección**: vitrina oscura de objetos | `sections/Objetos/` | `data/objetos.ts` |
| 6 | **Cada año, el pueblo vuelve a contarla** + línea de años | `sections/Versiones/` | `data/versiones.ts` |
| — | **Más del archivo** + pie (aparece en todas las páginas) | `components/layout/SiteFooter.tsx` | `data/mas.ts` |

Para **cambiar el orden** o **quitar un bloque**, edita `src/pages/Recorrido/Recorrido.tsx`: es una lista con los bloques en orden.

---

## 5. Las demás páginas

| Dirección en el navegador | Qué muestra | Archivo |
|---|---|---|
| `/` | La página de inicio (el recorrido) | `pages/Recorrido/` |
| `/pasos` | Todos los pasos, con índice | `pages/Pasos/` |
| `/creadores/creador-1` | Ficha de una persona | `pages/CreadorDetalle/` |
| `/objetos/objeto-1` | Ficha de un objeto (foto o 3D) | `pages/ObjetoDetalle/` |
| `/versiones/2025` | Ficha de un año | `pages/VersionDetalle/` |
| `/mas/historia`, `/mas/galeria`… | Secciones de "Más" | `pages/Mas/` |
| cualquier dirección que no existe | "Esta pieza no está en el archivo" | `pages/NoEncontrado/` |

Las fichas se crean **solas** a partir de los datos: si agregas un objeto en `objetos.ts`, su página aparece automáticamente.

---

## 6. Poner contenido real

### Textos
Abre el archivo de `src/data/` que corresponda y cambia lo que está **entre comillas**.
Todo lo que está entre corchetes `[ ]` es un texto pendiente que hay que reemplazar.

```js
// ANTES
nombre: '[Nombre del creador]',
// DESPUÉS
nombre: 'María Pérez',
```

⚠️ No borres las comillas `' '` ni las comas `,` del final de cada línea.
Si el texto lleva un apóstrofo (`'`), usa comillas dobles: `"El 'caballo' blanco"`.

### Fotos (paso a paso)
1. Copia la foto a la carpeta de su sección, por ejemplo `public/media/objetos/objeto-1/mascara.jpg`
2. En el archivo de datos, cambia la foto pendiente por la real:

```js
// ANTES
imagenes: [pendiente('Fotografía del objeto 1')],

// DESPUÉS
imagenes: [
  { tipo: 'imagen', src: '/media/objetos/objeto-1/mascara.jpg', alt: 'Máscara de madera pintada a mano', credito: 'Foto: Juan Gómez' },
],
```

- `src` → la ruta del archivo **empezando por `/media/`** (sin escribir `public`).
- `alt` → una descripción corta de la foto (la leen los lectores de pantalla y aparece si la foto no carga).
- `credito` → autor o archivo de procedencia (opcional).

### Agregar un año, un objeto o un creador nuevo
Copia uno de los bloques `{ ... }` existentes en su archivo de datos, pégalo y cambia sus valores.
Cada uno necesita un `id` distinto (para años, el `anio` hace de id). El sitio lo muestra solo.

### Modelos 3D (a futuro)
Guarda el archivo `.glb` en `public/media/objetos/<id-del-objeto>/modelo.glb` y en `objetos.ts` escribe:
`modelo3d: { tipo: 'modelo3d', src: '/media/objetos/objeto-1/modelo.glb', alt: 'Modelo 3D de la máscara' }`.
El visor 3D se activará en `src/components/media/ModelViewer.tsx` cuando tengamos los archivos.

---

## 7. El video principal de la portada 🎬

### Paso 1 — Preparar el video
| | Recomendado |
|---|---|
| Formato | **MP4** (códec H.264) |
| Tamaño | 1920 × 1080 (horizontal) |
| Duración | 10 a 30 segundos, que se vea bien repitiéndose |
| Peso | **menos de 10 MB** (máximo ~15 MB) |
| Sonido | no hace falta: se reproduce **siempre en silencio** |

Si el video pesa mucho o viene de un iPhone (`.mov` / HEVC), conviértelo con **HandBrake** (gratis):
preset *"Fast 1080p30"*, marca **"Web Optimized"**, en la pestaña *Audio* quita la pista, y guarda como `.mp4`.

**Opcional, pero recomendado:**
- Una **versión para celular**: 1280 × 720 (o vertical 720 × 1280), menos de 4 MB. Ahorra datos a quien entra desde el celular.
- Una **imagen de portada (poster)**: un fotograma del video en JPG, 1920 × 1080, menos de 300 KB. Se ve mientras el video carga.
  ⚠️ El poster tiene que ser una **imagen** (`.jpg` / `.png`), no el `.mp4`.

### Paso 2 — Copiar los archivos
Ponlos en **`public/media/inicio/`** con nombres **sin espacios, tildes ni ñ**:

```
public/media/inicio/desfile.mp4
public/media/inicio/desfile-movil.mp4     (opcional)
public/media/inicio/desfile-poster.jpg    (opcional)
```

### Paso 3 — Decirle al sitio cuál es
Abre **`src/data/sitio.ts`**, busca `portada` y escribe las rutas:

```js
export const portada = {
  video: '/media/inicio/desfile.mp4',
  videoMovil: '/media/inicio/desfile-movil.mp4',   // o null si no tienes
  poster: '/media/inicio/desfile-poster.jpg',      // o null si no tienes
  oscuridad: 0.65,
}
```

Guarda. Si `npm run dev` está encendido, la portada cambia al instante.

### Paso 4 — Ajustarlo
El video **siempre se muestra completo**, sin recortes ni zoom: el sitio lee solo la forma del archivo
(horizontal, vertical, cuadrado…) y acomoda la portada. No hay que configurar tamaños.

| Ajuste (en `portada`) | Qué hace | Ejemplos |
|---|---|---|
| `oscuridad` | Sombra del lado izquierdo del video, detrás del título (en computador) | `0.4` (suave) · `0.65` (normal) · `0.8` (fuerte) |

Otros ajustes (en archivos de estilo):
- **Título, sombra y tamaño de letra sobre el video**: `src/sections/Inicio/Inicio.module.css` → `.conFondo .titulo`.
- **Distancia del título al borde de abajo**: mismo archivo → `--margen-portada`.
- **Botón de pausa** (posición, tamaño, color): `src/components/media/VideoPortada.module.css` → `.boton`.

### Cómo se ve en cada pantalla
- **Arriba, siempre**: la barra oscura con el menú. El video empieza justo debajo.
- **Computador y tableta horizontal**: el video completo a todo el ancho y el título encima, en la parte baja de lo que se ve al entrar. La portada ocupa al menos toda la pantalla (no se asoma el bloque verde). Si el video es más alto que la pantalla, el resto aparece al bajar.
- **Celular y tableta en vertical** (y pantallas muy bajitas): el video completo arriba y el título debajo, sobre fondo oscuro.
- Los estilos están en `src/sections/Inicio/Inicio.module.css` y `src/components/media/VideoPortada.module.css` (el bloque `@media (orientation: portrait)…` es el de celular).

### Lo que el sitio hace solo con el video
- Arranca solo, **en silencio y en bucle** (así lo permiten todos los navegadores).
- Muestra un **botón redondo de pausa** abajo a la derecha.
- **Se pausa cuando bajas** y deja de verse, y se reanuda al volver, para no gastar batería ni datos.
- Si la persona tiene activado **"reducir movimiento"** en su equipo, empieza pausado.
- En celular usa `videoMovil` si existe.

### ¿Prefieres una foto en vez de video?
Deja `video: null` y pon la foto en `poster`. Se verá la foto a pantalla completa con el mismo velo oscuro.

### Si el video no aparece
1. Revisa que el nombre en `sitio.ts` sea **exactamente** igual al del archivo (mayúsculas, extensión `.mp4`).
2. Revisa que la ruta empiece por `/media/` y no por `public/`.
3. Si es `.mov` o de iPhone, conviértelo a MP4 H.264 con HandBrake.
4. Si tarda mucho en cargar, comprímelo más (menos de 10 MB).

---

## 8. Colores, letras y tamaños

Todo está en **`src/styles/tokens.css`**. Cambiar un valor ahí lo cambia en todo el sitio.

| Nombre | Para qué se usa |
|---|---|
| `--c-verde` | Color principal: fondo de los bloques del recorrido |
| `--c-rojo` | Botones principales, puntos de la línea de años |
| `--c-noche` | Portada, vitrina de objetos, menú y pie |
| `--c-papel` | Fondo de las fichas (lectura larga) |
| `--c-verde-claro` | Rótulos pequeños sobre fondo oscuro |

- Letras: **Rubik** (títulos y texto) e **IBM Plex Mono** (rótulos tipo archivo). Se cargan en `index.html`.
- Cada bloque usa un **tema** (`tema-verde`, `tema-noche`, `tema-papel`), definido en `src/styles/base.css`: los botones y textos cambian de color solos según el fondo.
- 💡 Al cambiar un color, revisa que el texto encima **se siga leyendo bien** (buen contraste), sobre todo el texto blanco sobre el verde.

---

## 9. Reglas de oro

- ✅ Nombres de archivos **sin espacios, tildes ni ñ**: `desfile-2025.jpg`, no `Desfile año 2025.JPG`.
- ✅ Fotos livianas: 1600–2000 px de ancho y menos de 500 KB (puedes comprimirlas en squoosh.app).
- ✅ **No inventar datos históricos**: si algo no está confirmado, déjalo entre `[ ]`.
- ⛔ No toques: `node_modules/`, `package-lock.json`, `dist/`. Se generan solos.
- ⛔ En los `.tsx`, no borres las líneas `import ...` de arriba ni las etiquetas `< >` si no estás seguro.

---

## 10. Si algo se rompe

- Si la página se pone en blanco o sale un error rojo, casi siempre es una **coma o una comilla** que falta en el último archivo que editaste. El error de la terminal dice el archivo y la línea.
- Deshaz el último cambio (`Ctrl + Z` en el editor) y guarda de nuevo.
- Para revisar que todo esté bien antes de publicar:

```bash
npm run typecheck
npm run lint
npm run build
```

Si los tres terminan sin errores, el sitio está listo.

---

## 11. TypeScript: qué es y cómo te ayuda

El proyecto está escrito en **TypeScript**: es JavaScript con **tipos**, es decir, con una descripción de qué forma tiene cada dato.
El navegador nunca ve TypeScript: Vite lo convierte a JavaScript. Los tipos sirven **mientras escribes**, para atrapar errores antes de que el sitio falle.

### Dónde están los tipos
Casi todo lo importante está en **`src/types/contenido.ts`**. Por ejemplo:

```ts
export interface Version {
  anio: number          // número
  titulo: string        // texto
  resumen: string
  portada: Media        // otro tipo definido en el mismo archivo
  personajes: Personaje[]   // [] = una lista de Personaje
  cambios: string[]         // lista de textos
  destacados: string[]
  galeria: Media[]
}
```

Y en los datos se usa así: `export const versiones: Version[] = [...]` ("versiones es una lista de Version").

### Cómo se lee
| Escrito | Significa |
|---|---|
| `string` | texto: `'Hola'` |
| `number` | número: `2025` |
| `boolean` | `true` o `false` |
| `string[]` | lista de textos: `['a', 'b']` |
| `campo?: string` | el campo es **opcional** (puede no estar) |
| `string \| null` | texto **o** vacío (`null`) |
| `'imagen' \| 'video'` | solo se aceptan esos valores exactos |
| `interface Props { … }` | lo que recibe un componente |

### Qué errores atrapa
Si en `versiones.ts` escribes `anio: '2025'` (con comillas, texto) en lugar de `2025`, o `titlo` en vez de `titulo`,
el editor lo **subraya en rojo** y al pasar el mouse explica el problema. Ejemplos reales que ya atrapa:
- Escribir `capitulo('creadore')` (con un error): solo acepta `'pasos' | 'creadores' | 'objetos' | 'versiones'`.
- Poner `tipo: 'foto'` en un recurso: solo acepta `'imagen' | 'video' | 'audio' | 'modelo3d'`.
- Olvidar un campo obligatorio de un objeto (por ejemplo `materiales`).

💡 Para ver los errores mientras escribes, usa un editor con TypeScript, como **VS Code**: los muestra sin hacer nada más.

### Ojo: `npm run dev` no se detiene por errores de tipos
Mientras desarrollas, la página puede seguir funcionando aunque haya un error de tipos. Para revisarlos todos:

```bash
npm run typecheck
```

`npm run build` también los revisa y **no deja publicar** si hay alguno.

### Si quieres agregar un campo nuevo
Ejemplo: que cada objeto tenga un `donante` opcional.
1. En `src/types/contenido.ts`, dentro de `interface Objeto`, agrega: `donante?: string`
2. En `src/data/objetos.ts`, ya puedes escribir `donante: 'Familia …'` en los objetos que lo tengan.
3. Para mostrarlo, úsalo en `src/pages/ObjetoDetalle/ObjetoDetalle.tsx` (por ejemplo `{objeto.donante && <p>{objeto.donante}</p>}`).
