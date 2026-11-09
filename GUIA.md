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
| La página de **Historia** (relato, datos clave, línea de tiempo, fuentes) | `src/data/historia.ts` |
| Los **Testimonios** (citas, retratos, grabaciones, grupos del filtro) | `src/data/testimonios.ts` |
| Las **estadísticas** (qué se mide, el panel `/admin`) | `src/estadisticas/` y `src/pages/Admin/` (ver sección 13) |
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
│   │   ├── historia.ts      la página de Historia
│   │   ├── testimonios.ts   la página de Testimonios
│   │   └── mas.ts
│   │
│   ├── estadisticas/        ← 📊 medición anónima y cálculos del panel (sección 13)
│   │
│   ├── types/               ← 🧩 LA FORMA DE CADA DATO (TypeScript, ver sección 11)
│   │   └── contenido.ts     qué campos tiene un Paso, un Objeto, una Versión…
│   │
│   ├── sections/            los BLOQUES de la página de inicio (uno por carpeta)
│   ├── pages/               las PÁGINAS completas (inicio, fichas, pasos…)
│   ├── components/          piezas reutilizables (botones, menú, video, tarjetas, ilustración…)
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
| 2 | **Conoce la historia**: animación del mundo a Gualmatán, que termina en la foto del pueblo + tarjeta oscura | `sections/Historia/` | `data/sitio.ts` → `textos.historia` |
| 3 | **Los pasos del desfile**: pasos **al azar**, solo de los que ya tienen foto, que cambian solos (6 en 2 filas de 3 en el computador, 4 en 2 × 2 en el celular) + botón "Ver los N pasos" | `sections/Pasos/` | `data/pasos.ts` |
| 4 | **Quienes lo hicieron posible**: carrusel de retratos | `sections/Creadores/` | `data/creadores.ts` |
| 5 | **La colección**: vitrina oscura de objetos **al azar** que cambian solos (6 en 2 filas de 3 en el computador, 4 en 2 × 2 en el celular) + botón "Ver las N piezas" | `sections/Objetos/` | `data/objetos.ts` |
| 6 | **Cada año, el pueblo vuelve a contarla** + línea de años | `sections/Versiones/` | `data/versiones.ts` |
| — | **Más del archivo** + pie (aparece en todas las páginas) | `components/layout/SiteFooter.tsx` | `data/mas.ts` |

Para **cambiar el orden** o **quitar un bloque**, edita `src/pages/Recorrido/Recorrido.tsx`: es una lista con los bloques en orden.

📱 **En el celular**, los bloques 3 a 6 muestran solo **cuatro tarjetas en 2 × 2** y un botón arriba para ver todas
("Ver los 4 creadores", "Ver las 6 piezas"…), que lleva a `/pasos`, `/creadores`, `/objetos` o `/versiones`.
En el computador siguen siendo carruseles con flechas. Las tarjetas son las mismas en el inicio y en esas páginas:
están en `src/components/tarjetas/` (cambiar una cambia las dos).

🎲 **Pasos y piezas al azar.** Cada vez que alguien entra ve otros, y cambian solos por otros (**los pasos cada 3 segundos, las piezas cada 6**)
(las tarjetas se voltean como cartas). Cambian **siempre**, aunque el mouse o el dedo estén encima o se esté
desplazando la página: así invitan a entrar. Solo se detienen si la persona pulsa el botón de pausa (❚❚) o si su
teléfono o computador tiene activado "reducir movimiento".
- Para cambiar el tiempo: `CADA_MS` (en milisegundos: 3000 = 3 s) en `src/sections/Pasos/Pasos.tsx` y `src/sections/Objetos/Objetos.tsx`.
- 📷 En el inicio solo salen **los pasos que ya tienen foto** (su `principal`). Los demás están en `/pasos`.
  Si ninguno tiene foto todavía, salen todos.
- En la página `/pasos` salen todos **en orden**; en `/objetos`, en un orden al azar distinto cada vez.
  Cada pieza conserva su número (Nº 07…), que es el de su carpeta (`objeto-07`).
- 🏺 **Las piezas con modelo 3D van primero** (en el inicio y en `/objetos`), luego las que solo tienen foto y al final
  las que solo tienen datos; dentro de cada grupo, al azar. En el inicio, si las piezas 3D caben en las casillas
  (6 en el computador, 4 en el celular), se quedan **fijas** y solo cambian las demás; si son más, se turnan entre ellas. Se decide en `prioridadObjeto`, en `objetos.ts`.
- La pieza que hace esto se puede usar en otros bloques: `src/hooks/useMuestraRotativa.ts`.

---

## 5. Las demás páginas

| Dirección en el navegador | Qué muestra | Archivo |
|---|---|---|
| `/` | La página de inicio (el recorrido) | `pages/Recorrido/` |
| `/pasos` | Todos los pasos, con índice (columna a la izquierda en el computador; botón flotante que se puede arrastrar en el celular) y **buscador** por nombre o número, que perdona tildes y errores (`utils/buscar.ts`) | `pages/Pasos/` |
| `/creadores`, `/objetos`, `/versiones` | Todas las personas, piezas o ediciones, en cuadrícula ("Ver todos") | `pages/Listados/` |
| `/creadores/creador-1` | Ficha de una persona | `pages/CreadorDetalle/` |
| `/objetos/objeto-1` | Ficha de un objeto (foto o 3D) | `pages/ObjetoDetalle/` |
| `/versiones/2025` | Ficha de un año | `pages/VersionDetalle/` |
| `/mas/historia` | La historia completa: índice, capítulos, línea de tiempo y fuentes | `pages/Mas/secciones/HistoriaPagina.tsx` |
| `/mas/galeria` | Galería: todas las fotos de los años y los objetos, juntas | `pages/Mas/secciones/GaleriaPagina.tsx` |
| `/mas/testimonios` | Testimonios: uno destacado y los demás en tarjetas, con filtro | `pages/Mas/secciones/TestimoniosPagina.tsx` |
| `/mas/archivo`, `/mas/contacto`… | Demás secciones de "Más" (por ahora "pendiente") | `pages/Mas/` |
| `/admin` | Panel de estadísticas (privado, ver sección 13) | `pages/Admin/` |
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

### Los textos de los pasos (por ahora, solo en tu computador)
Los títulos y descripciones de los pasos están en **`src/data/pasos.textos.ts`**, un archivo que **no se sube a GitHub**:
está excluido en `.git/info/exclude` (una lista de archivos ignorados que solo existe en tu computador).
- En tu computador el sitio los muestra; en GitHub los 79 pasos salen como `[pendiente]`.
- Para escribir o corregir un paso: `4: { titulo: 'Título del paso', resumen: 'Qué es el paso, en pocas líneas.' },` (el número es el del paso).
- **Cuando quieras publicarlos**, borra la línea `src/data/pasos.textos.ts` de `.git/info/exclude` y haz el commit.
- ⚠️ Si publicas el sitio **desde tu computador** (por ejemplo, subiendo la carpeta `dist`), los textos irán incluidos,
  porque el archivo está ahí. Si el hosting construye el sitio desde GitHub, no.
- Lo mismo pasa con **`src/data/sitio.textos.ts`**: ahí están, por ahora, el texto de "Conoce la historia" y la
  introducción de `/pasos`. Cada texto de ese archivo reemplaza al del mismo nombre en `textos` (`src/data/sitio.ts`);
  si el archivo no está, salen los provisionales `[ ]`.

### Las fotos de los pasos 📸 (sin tocar código)
Cada paso tiene su carpeta en **`public/media/pasos/`**: `paso-01`, `paso-02` … `paso-79`.
- Pon en la carpeta del paso una foto llamada **`principal`** (`principal.jpg`, `principal.png`…): es la que sale **en la tarjeta**.
- Las demás fotos del paso, con cualquier nombre, van en la misma carpeta: quedan guardadas para ver el paso a fondo.
- Con `npm run dev` abierto, la página se recarga sola al agregar, cambiar o borrar una foto.
- Sirven `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif` y `.gif`. Las `.heic` del iPhone **no** se ven en el navegador: pásalas a JPG.
- Si la carpeta no tiene `principal`: en la página `/pasos`, en lugar de la foto sale una invitación
  ("¿Tienes una foto de este paso?") con un botón rojo que lleva a Contacto (`/mas/contacto?paso=12`: el número
  del paso va en la dirección, para que el formulario sepa de cuál es). En el inicio, esos pasos no salen.
  La invitación está en `src/components/pasos/LineaPasos.tsx` (`PideFoto`).
- Conviene que pesen poco (menos de 500 KB, unos 1600 px de ancho): así el sitio carga rápido en el celular.
- Quien hace esto es `vite-fotos.ts`, en la raíz del proyecto.
- 🔒 **Por ahora las fotos no se suben a GitHub** (están en `.git/info/exclude`; las carpetas vacías sí).
  Para publicarlas, borra de ese archivo las líneas de `public/media/pasos/` y haz el commit.

### Las fotos y los datos de los creadores 📸
Igual que los pasos: cada creador tiene su carpeta en **`public/media/creadores/`**: `creador-01` … `creador-06`
(el número es su lugar en la lista: el 3 es el tercero).
- La foto llamada **`principal`** es el retrato de su tarjeta (la portada).
- Las demás fotos de la carpeta, con cualquier nombre, salen en su ficha (`/creadores/creador-3`), junto al retrato.
- El nombre y los demás datos (período, rol, descripción…) van en **`src/data/creadores.textos.ts`**,
  con el mismo número. Lo que no se ponga ahí sale como `[pendiente]`.
- 🔒 Las fotos y `creadores.textos.ts` **no se suben a GitHub** por ahora (están en `.git/info/exclude`).

### Los objetos: modelos 3D, fotos y datos 🏺
Cada pieza tiene su carpeta en **`public/media/objetos/`**: `objeto-01` … `objeto-20` (el número es el de la pieza: Nº 01).
- **Solo se muestran las piezas que existen:** las que tienen algo en su carpeta (modelo o fotos) o sus datos en
  `objetos.textos.ts`. Las carpetas vacías no cuentan: al poner el primer archivo, la pieza aparece sola y
  "Ver las N piezas" cuenta una más. ¿Más de 20? Crea la carpeta `objeto-21` y sigue igual.
- Si no hay ninguna pieza real (por ejemplo, en la copia de GitHub, que no lleva los modelos), se ven 8 de ejemplo.
- El **modelo 3D** (`modelo.glb`, o cualquier archivo `.glb`) hace que la tarjeta muestre la pieza **dando vueltas**
  en vez de la foto, con la marca "3D". En su ficha (`/objetos/objeto-1`) se puede girar arrastrando con el mouse
  o el dedo; para acercar, se pellizca (celular o trackpad) o se usa **Ctrl + rueda** (la rueda sola baja la página).
- La foto llamada **`principal`** es la de la tarjeta cuando no hay modelo, y la imagen que se ve mientras el modelo carga.
  Las demás fotos de la carpeta son otras vistas de la pieza.
- El nombre y los demás datos (época, procedencia, materiales…) van en **`src/data/objetos.textos.ts`**,
  con el mismo número. Lo que no se ponga ahí sale como `[pendiente]`.
- 🔒 Los modelos, las fotos y `objetos.textos.ts` **no se suben a GitHub** por ahora (están en `.git/info/exclude`).

**Cómo exportar el modelo:** formato **GLB**, texturas de **2k** (4k pesa mucho y no se nota en pantalla).
Los programas que crean modelos (Tripo, Meshy…) los sacan con muchísimos triángulos: el primer modelo salió con
1.9 millones y 62 MB. Antes de ponerlo en su carpeta hay que aligerarlo. Un solo comando lo hace todo
(con el número de la pieza al final):

```bash
npm run modelo -- "C:\Users\...\Downloads\Mi pieza.glb" 15
```

Crea la carpeta `objeto-15` con **dos versiones** del modelo:
- `modelo.glb` (~1.3 MB, ~200 mil triángulos, texturas de 2048 px) → la de la **ficha**, donde se gira y se acerca.
- `tarjeta.glb` (~0.35 MB, ~40 mil triángulos, 1024 px) → la de las **tarjetas**. Son pequeñas y giran varias a la
  vez: con la versión completa, el celular se trababa.

Después solo falta el nombre en `objetos.textos.ts`. El original (el pesado) no se toca: guárdalo fuera del proyecto
como respaldo. Si alguna pieza tiene `modelo.glb` pero no `tarjeta.glb`, `npm run modelo -- --tarjetas` se la hace.
El comando está en `scripts/preparar-modelo.mjs` (usa [glTF-Transform](https://gltf-transform.dev)).

- El visor es `src/components/media/ModelViewer.tsx` (usa [model-viewer](https://modelviewer.dev), de Google).
  Se descarga solo cuando un modelo está por aparecer en pantalla, no al abrir la página. Los modelos comprimidos
  con Draco necesitan su decodificador, que el sitio trae en `public/draco/` (no depende de servidores externos).
- En la vitrina del inicio, las tarjetas que salen se quitan de la página al terminar su animación: así nunca
  giran más modelos de los que se ven.

### La foto del pueblo y la animación "del mundo a Gualmatán" 🌎
En el recuadro de "Conoce la historia", cuando la persona llega ahí, empieza sola una animación (unos 9 segundos):
el globo gira hasta **América**, se acerca a **Colombia** (en blanco), a **Nariño** (en rojo y luego con sus municipios)
y, *¡tin!*, cae un punto rojo sobre **Gualmatán**. Al final, la **foto del pueblo** se abre en círculo desde el punto,
se queda **3.5 segundos** y la animación **vuelve a empezar, siempre** (la foto se desvanece sobre el globo).
- Si la sección sale de la pantalla, la animación se detiene (no gasta batería) y sigue donde iba al volver.
- Un botón pequeño y redondo (❚❚) abajo a la izquierda la pausa: las animaciones que se repiten solas deben poder
  detenerse (accesibilidad). Los tiempos se cambian en `MapaAnimado.tsx` (`FOTO_QUIETA`, `TERMINA`…).
- La foto es **`src/assets/fotos/gualmatan-principal.jpg`**. Para cambiarla, reemplaza ese archivo por otro con el
  mismo nombre (sirve `.jpg`, `.png` o `.webp`). Si no está, al final sale la ilustración "Gualmatán desde el aire".
- La animación está en `src/sections/Historia/MapaAnimado.tsx`. Los tiempos y los lugares por donde pasa la cámara
  están arriba del archivo (`CAMARA`, `ROTULOS`…).
- Lo que dibuja está en **`public/media/mapa/mapa.json`**, que se arma con **`npm run mapa`** a partir de:
  - el mundo y los países lejanos: **Natural Earth** (dominio público), del paquete `world-atlas`;
  - **Colombia** (sus 33 departamentos), **Nariño**, sus 64 municipios y Gualmatán: los **límites oficiales del DANE**
    (Marco Geoestadístico Nacional), publicados por [geoBoundaries](https://www.geoboundaries.org);
  - **Ecuador**: geoBoundaries (CC0), que encaja con la frontera del DANE.
  - Colombia y Nariño salen de los mismos datos: la costa del Pacífico y la frontera con Ecuador coinciden y no
    quedan franjas sin pintar. Nariño se pinta entero con su contorno y encima van las líneas de los municipios.
  - La primera vez el comando descarga los límites (~13 MB) en `node_modules/.cache/preparar-mapa/` (fuera del sitio
    y de GitHub); las siguientes usa esa copia.
- ⚖️ Los límites del DANE vía geoBoundaries tienen licencia **CC BY 4.0**: hay que dar el crédito en Créditos
  (por ejemplo: "Límites de Nariño: DANE, Marco Geoestadístico Nacional, vía geoBoundaries, CC BY 4.0").
  (Antes se usó un mapa SVG de Wikimedia: tenía un pedazo de más y le faltaban dos municipios, y se quitó.)
- Si la persona pidió "reducir movimiento", se ve la foto directo y el botón dice "Ver dónde queda".
- Si falta `mapa.json` (por ejemplo, en la copia de GitHub), se ve la foto y ya.
- 🔒 Por ahora la foto (`src/assets/fotos/`) y la carpeta `public/media/mapa/` no se suben a GitHub (`.git/info/exclude`).
  El mapa de Nariño en 3D (sin el recuadro de Colombia) está guardado en `originales/mapa/narino.glb`, por si se quiere usar.

### Fotos (paso a paso)
Para los **pasos, los creadores y los objetos** no hace falta esto: basta con poner la foto en su carpeta (ver arriba).
Para las demás secciones (por ejemplo, la galería de un año en `versiones.ts`):

1. Copia la foto a la carpeta de su sección, por ejemplo `public/media/versiones/2024/desfile.jpg`
2. En el archivo de datos, cambia la foto pendiente por la real:

```js
// ANTES (6 fotos pendientes de ejemplo)
galeria: [1, 2, 3, 4, 5, 6].map((n) => pendiente(`Foto ${n} de la edición ${anio}`)),

// DESPUÉS (las fotos reales)
galeria: [
  { tipo: 'imagen', src: '/media/versiones/2024/desfile.jpg', alt: 'Comparsa cruzando la plaza principal', credito: 'Foto: Juan Gómez' },
  { tipo: 'imagen', src: '/media/versiones/2024/carroza.jpg', alt: 'Carroza de la Virgen al final del recorrido' },
],
```

> Los nombres y créditos de este ejemplo son inventados, solo para mostrar el formato.

- `src` → la ruta del archivo **empezando por `/media/`** (sin escribir `public`).
- `alt` → una descripción corta de la foto (la leen los lectores de pantalla y aparece si la foto no carga).
- `credito` → autor o archivo de procedencia (opcional). Aparece debajo de la foto cuando se ve en grande.

### Galerías y visor de fotos 🖼️
**Toda foto se puede tocar para verla en grande** en el visor: pantalla completa, flechas ← → (o deslizar con el dedo
en el celular), contador "3 / 6" y cierre con ✕, con la tecla Escape o tocando fuera de la foto.

No hay que configurar nada: las fotos que pongas en los datos aparecen solas en su galería.
| Dónde se ve | De dónde salen las fotos |
|---|---|
| Ficha de un año → "Galería 2025" | `galeria` de ese año en `versiones.ts` |
| Ficha de un objeto → foto grande + miniaturas | `imagenes` del objeto en `objetos.ts` (la primera es la principal) |
| Ficha de una persona → retrato + miniaturas | `retrato` y `galeria` (opcional) en `creadores.ts` |
| **Más → Galería** (`/mas/galeria`) | Todas las de los años y los objetos, juntas |

El visor es `src/components/media/Visor.tsx` y la cuadrícula de fotos `src/components/media/Galeria.tsx`.

### La página de Historia 📜
Todo está en `src/data/historia.ts`, en este orden (el mismo de la página).
🔒 Por ahora, el contenido real está en **`src/data/historia.textos.ts`** (mismos campos), que vive solo en tu
computador y reemplaza entero al de `historia.ts`. Para publicarlo, quita su línea de `.git/info/exclude`.
- `entradilla` → el párrafo de entrada, en letra grande.
- `datos` → las tarjetas de datos breves ("Primera edición", "Pasos"…). Puedes cambiar, quitar o agregar.
- `capitulos` → el relato. Cada capítulo tiene `epoca`, `titulo`, `parrafos` (uno por párrafo) y, si quieres,
  una `imagen` (se abre en grande) y una `cita`. El `id` es su ancla: `/mas/historia#origenes`
  (sin espacios ni tildes). Cada capítulo aparece solo en el **índice** de la izquierda,
  que marca en qué parte de la lectura vas.
- `hitos` → la **línea de tiempo**. Si la `fecha` es un año con edición publicada (por ejemplo `'2024'`),
  aparece sola el enlace "Ver la edición 2024".
- `fuentes` → de dónde sale la información (libro, entrevista, acta…). En un archivo histórico es lo que
  le da confianza al visitante: anota la fuente de cada dato.

### La página de Contacto ✉️
`/mas/contacto` tiene cuatro botones grandes, solo con los logos: **Gmail, WhatsApp, Instagram y Facebook**.
- Los datos (correo, número de WhatsApp, enlaces de Instagram y Facebook) van en **`src/data/contacto.textos.ts`**.
  Cada botón sale solo si su dato está puesto: para quitar uno, borra su línea.
- El WhatsApp va solo con números y el código del país: `573001234567`.
- Gmail: en el celular abre la aplicación de correo; en el computador, Gmail en el navegador, con el mensaje listo.
- Si se llega desde un paso sin foto (botón "Enviar la foto"), el correo y el WhatsApp ya dicen de qué paso es.
- Los logos son de [Simple Icons](https://simpleicons.org) (libres de uso). La página está en `src/pages/Mas/secciones/ContactoPagina.tsx`.
- 🔒 `contacto.textos.ts` **no se sube a GitHub** por ahora (está en `.git/info/exclude`).

### La página de Testimonios 🎙️
Todo está en `src/data/testimonios.ts`. Cada testimonio tiene `nombre`, `relacion` (por ejemplo
"Participante desde 1998"), `texto`, `fecha`, `fuente` (quién lo registró y dónde) y `grupo`.
Opcionales: `retrato` (sin foto se ven las iniciales del nombre), `grabacion` (audio o video original)
y `ediciones` (años de los que habla: enlazan a su ficha).
- El que tenga `destacado: true` abre la página en grande (si ninguno lo tiene, el primero).
- Los **grupos del filtro** (Participantes, Organizadores…) se nombran en `gruposTestimonio`.
  Solo aparecen los botones de los grupos que tienen testimonios.
- El filtro queda en la dirección: `/mas/testimonios?grupo=participantes` se puede compartir.

⚠️ Publica solo testimonios con autorización de la persona (o de su acudiente, si es menor de edad).

### Agregar un año, un objeto o un creador nuevo
Copia uno de los bloques `{ ... }` existentes en su archivo de datos, pégalo y cambia sus valores.
Cada uno necesita un `id` distinto (para años, el `anio` hace de id). El sitio lo muestra solo.

---

### Los originales pesados (respaldo) 🗄️
La carpeta **`originales/`** (en la raíz del proyecto) guarda las versiones originales de lo que se aligeró para la web:
el video de la portada (260 MB), las fotos de pasos que pesaban más de 400 KB y el mapa 3D de Nariño.
- **No se publica** (está fuera de `public/`) **ni se sube a GitHub** (`.git/info/exclude`).
- Si algún día quieres volver a preparar un archivo con otra calidad, sale de ahí.
- Para fotos nuevas: que pesen menos de ~400 KB y midan hasta ~1600 px de ancho (JPG, calidad 80).

## 7. El video principal de la portada 🎬

**Como está ahora:** el video original (1 min 50 s, 260 MB) se pasó a `desfile.mp4` en **alta calidad** (1080p,
79 MB, sin sonido): a simple vista es igual al original, pero pesa menos de un tercio y empieza a verse mientras se
descarga (el original tenía su índice al final del archivo y había que llegar hasta ahí para reproducirlo). Se usa
igual en el computador y en el celular (`videoMovil: null`). `desfile-poster.jpg` (228 KB) es la imagen que se ve
mientras carga. El original está en `originales/inicio/`.
⚠️ Al contratar el hosting, revisa la **transferencia mensual** que incluye: cada visita que vea el video completo
descarga hasta ~79 MB.

### La pantalla de entrada ("telón") 🎭
Al abrir el sitio aparece, unos **4 segundos**, una pantalla oscura con confeti en los colores de la bandera: la
bandera de Gualmatán se arma, sube "DESFILE HISTÓRICO" letra por letra, aparece "GUALMATÁN · NARIÑO" y una barra
tricolor se llena. Después **el telón se abre hacia los lados** y queda la página.
- Sale **una vez por visita**: si la persona recarga o vuelve al inicio, no se repite (se recuerda en la pestaña).
  Nunca en `/admin`.
- Está en **`index.html`** (así aparece al instante, antes de que cargue lo demás): ahí se cambian textos, colores y
  animaciones. La cierra `src/entrada.ts`, donde está la duración (`DURACION = 4000`, en milisegundos).
- Con "reducir movimiento", se ve quieta un momento (1.5 s) y se desvanece.
- Si algo fallara y nadie la cerrara, se va sola a los 9 segundos.

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

- Letras: **Rubik** (títulos y texto) e **IBM Plex Mono** (rótulos tipo archivo). Vienen de los paquetes
  `@fontsource/rubik` y `@fontsource/ibm-plex-mono` y se sirven desde el propio sitio (no se le piden a Google:
  carga más rápido y es más privado). Se cargan en `src/main.tsx`; para otro grosor, agrega su línea ahí.
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

### Un truco que ya usa el proyecto: el "type guard"
En `src/utils/media.ts`, la función `tieneArchivo(media)` no solo responde sí o no: también le **asegura a TypeScript**
que, si la respuesta es sí, `media.src` es un texto (y no `null`). Por eso, dentro de un `if (tieneArchivo(media)) { … }`
se puede usar `media.src` sin que el editor se queje.

### Si quieres agregar un campo nuevo
Ejemplo: que cada objeto tenga un `donante` opcional.
1. En `src/types/contenido.ts`, dentro de `interface Objeto`, agrega: `donante?: string`
2. En `src/data/objetos.ts`, ya puedes escribir `donante: 'Familia …'` en los objetos que lo tengan.
3. Para mostrarlo, úsalo en `src/pages/ObjetoDetalle/ObjetoDetalle.tsx` (por ejemplo `{objeto.donante && <p>{objeto.donante}</p>}`).

---

## 12. Vista previa al compartir (WhatsApp, Facebook…) 📲

Cuando alguien pega el enlace del sitio en WhatsApp, aparece una tarjeta con **imagen, título y descripción**.
Eso lo controlan unas etiquetas especiales (Open Graph) en **`index.html`** y la imagen **`public/og-imagen.jpg`**.

### Cambiar la imagen
Reemplaza `public/og-imagen.jpg` por otra con el **mismo nombre**:
- Tamaño **1200 × 630** (horizontal).
- **Menos de 300 KB** (si pesa más, WhatsApp no la muestra). En squoosh.app puedes bajarle el peso.
- Una buena foto del desfile suele funcionar mejor que un diseño: rostros, color, movimiento.
- Deja lo importante en el centro: algunas apps recortan los bordes.

### Cambiar el título o la descripción
En `index.html`, las líneas `og:title` y `og:description`.

### Al publicar el sitio (importante)
WhatsApp necesita la **dirección completa** de la imagen. Esa dirección sale del archivo **`.env`** (`VITE_SITIO_URL`),
que mientras trabajas en tu computador dice `http://localhost:5173`. Cuando el sitio tenga su dirección real:
1. Crea un archivo **`.env.production`** en la carpeta del proyecto con una línea, por ejemplo:
   `VITE_SITIO_URL=https://desfile-gualmatan.netlify.app` (tu dirección real, **sin** `/` al final).
2. Vuelve a publicar. Para revisar cómo se ve la tarjeta, pega el enlace en https://www.opengraph.xyz.

ℹ️ Por ahora **todos** los enlaces del sitio comparten la misma tarjeta (la del inicio). Más adelante se puede
lograr una tarjeta distinta por página (por ejemplo, la foto de cada objeto) con un paso extra al publicar.

### El título de la pestaña
Cada página pone su propio título en la pestaña del navegador ("Edición 2025 · Desfile Histórico de Gualmatán")
con la etiqueta `<title>` dentro de la página. La función que arma ese texto está en `src/utils/titulo.ts`.

---

## 13. Estadísticas: quién entra y qué mira 📊

El sitio mide **de forma anónima** cómo lo usa la gente, y tú lo ves en un panel privado: **`/admin`**
(por ejemplo `http://localhost:5173/admin`). No aparece en ningún menú y los buscadores no lo muestran.

### Qué muestra el panel
| Parte | Qué responde |
|---|---|
| **Resumen** | Visitantes, visitas, páginas vistas, tiempo típico por visita, salidas rápidas, cuántos volvieron, quién está ahora |
| **Visitas por día** | Cómo va el tráfico (pasa el mouse o usa las flechas para ver cada día; también como tabla) |
| **Páginas más vistas** | Vistas, visitantes, tiempo típico y hasta dónde bajan en cada página |
| **Cómo llegan / Desde qué aparato** | WhatsApp, Facebook, Google… · celular, tablet o computador |
| **Por dónde entran / Dónde se despiden / Recorridos** | La primera y la última página, y los saltos más comunes ("Inicio → Pasos") |
| **¿A qué hora entran?** | Para saber cuándo publicar |
| **Lo más tocado** | Botones y enlaces que más se usan |
| **Tocan, pero no pasa nada** | Fotos o textos que la gente toca esperando que se abran |
| **Videos y audios** | Cuántos empiezan, llegan a la mitad y terminan |
| **Detalle de una página** | Qué secciones alcanzan a ver y el **mapa de toques**: la página real con un punto rojo en cada toque |

### Qué se mide y qué no
- **Sí:** páginas abiertas, tiempo a la vista (no cuenta si la pestaña está oculta ni tras 5 minutos sin actividad),
  hasta dónde bajan, secciones vistas al menos un segundo, toques, avance de videos y audios, tipo de aparato y de dónde llegan.
- **No:** nombres, correos, dirección IP ni cookies. Cada navegador se reconoce solo por un número al azar.
- **No se mide** a quien activó "no rastrear" en su navegador, a los robots, el propio panel, ni un navegador marcado con
  **"No contar mis visitas en este navegador"** (márcalo en el tuyo para que tus pruebas no se mezclen; al entrar al panel
  con tu cuenta se marca solo).

💡 **Para saber cuánta gente llega por WhatsApp**, comparte el enlace con `?origen=whatsapp` al final, por ejemplo
`https://tu-sitio.com/?origen=whatsapp`. WhatsApp no avisa de dónde viene la visita y, sin esto, aparece como "Directo".
Sirve con cualquier nombre: `?origen=afiche`, `?origen=alcaldia`…

### Mientras no esté conectado (modo local)
Con `npm run dev` y sin Supabase, el panel funciona con **tus propias visitas en este navegador**: abre el sitio en otra pestaña,
recórrelo, vuelve a `/admin` y pulsa **Actualizar**. El botón **"Datos de ejemplo"** llena el panel con visitas inventadas
para ver cómo luce (lo avisa en grande, solo existe en desarrollo y no llega al sitio publicado).
En el sitio publicado sin Supabase no se mide nada.

### Conectarlo para ver las visitas de todo el mundo (Supabase, gratis)
1. Crea una cuenta en **supabase.com** y un proyecto nuevo.
2. En **SQL Editor**, pega todo el archivo **`docs/sql/estadisticas.sql`** y pulsa **Run**.
3. En **Authentication → Users → Add user**, crea tu usuario con tu correo y una contraseña
   (marca "Auto Confirm User"). En **Authentication → Sign In / Providers**, **desactiva** "Allow new users to sign up"
   para que nadie más pueda registrarse.
4. Vuelve al **SQL Editor** y ejecuta la última instrucción del archivo (la de `insert into public.administradores`)
   con tu correo en lugar de `[tu correo]`.
5. En **Project Settings → API** copia la **Project URL** y la clave pública (**publishable** o **anon**) y crea en la carpeta
   del proyecto un archivo **`.env.local`** (no se sube a GitHub) con:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_CLAVE=tu_clave_publica
   ```
   Al publicar, pon esas mismas dos variables en la configuración del hosting (Netlify, Vercel…).
6. Reinicia `npm run dev` y entra a `/admin` con tu correo y contraseña.

ℹ️ La clave pública puede estar en el sitio sin problema: con ella **solo se pueden enviar** eventos. Leerlos exige tu sesión,
y la base de datos misma (no el sitio) revisa que estés en la lista de administradores. **Nunca** pongas en el sitio la clave
"secret" o "service_role".

### Dónde está cada cosa
| Qué | Archivo |
|---|---|
| La medición (qué se registra y cuándo) | `src/estadisticas/rastreador.ts` |
| Los cálculos del panel | `src/estadisticas/calcular.ts` |
| Nombres legibles de páginas y secciones | `src/estadisticas/nombres.ts` |
| Envío y lectura (Supabase o navegador) | `src/estadisticas/almacen.ts` |
| El panel y sus gráficos | `src/pages/Admin/` |
| Tablas y reglas de la base de datos | `docs/sql/estadisticas.sql` |
