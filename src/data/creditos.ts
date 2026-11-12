/**
 * CRÉDITOS — quiénes hicieron la exposición y de dónde salen los datos (página /mas/creditos).
 *
 * Dos partes:
 *  1. Lo que escribe el administrador (presentación, personas, agradecimientos, libros): está en
 *     src/data/creditos.textos.ts, un archivo que vive solo en su computador y no se sube a GitHub
 *     hasta que él lo decida (ver GUIA, sección 6). Si no está, la página muestra [espacios pendientes].
 *  2. Mapas, datos y herramientas (abajo, en `fuentes`): los créditos que piden sus licencias.
 *     ⚠️ El del DANE es OBLIGATORIO (licencia CC BY 4.0): no lo borres mientras se use el mapa animado.
 */

/** Una persona (o entidad) en los créditos */
export interface PersonaCredito {
  nombre: string
  /** Opcional, en pequeño debajo del nombre: 'Fotos de los pasos 1 a 18', 'Gualmatán'… */
  detalle?: string
}

/** Un grupo de créditos: 'Fotografía', 'Investigación y textos'… */
export interface GrupoCredito {
  titulo: string
  personas: PersonaCredito[]
}

/** Un libro, documento o archivo consultado */
export interface ReferenciaCredito {
  titulo: string
  autor?: string
  /** Año, editorial, lugar… como se quiera mostrar: '2015 · Gualmatán' */
  datos?: string
  /** Para qué se usó: 'Textos de la historia y de los pasos' */
  nota?: string
}

/** Lo que escribe el administrador (en creditos.textos.ts). Todo es opcional. */
export interface TextosCreditos {
  /** Párrafo de presentación, arriba de todo */
  presentacion?: string
  /** Las personas, por grupos, en el orden en que se quieren mostrar */
  grupos?: GrupoCredito[]
  /** Libros y documentos consultados */
  referencias?: ReferenciaCredito[]
  /** Uno o más párrafos de agradecimiento */
  agradecimientos?: string[]
  /** Frase corta destacada (una dedicatoria, una cita…). Si no se pone, no aparece. */
  dedicatoria?: string
}

// import.meta.glob no falla si el archivo no existe: en ese caso devuelve un objeto vacío
const locales = import.meta.glob<{ textos: TextosCreditos }>('./creditos.textos.ts', { eager: true })
const propios: TextosCreditos = Object.values(locales)[0]?.textos ?? {}

/** Lo que se ve mientras no estén los textos: espacios marcados para llenar */
const pendientes: Required<Omit<TextosCreditos, 'dedicatoria'>> = {
  presentacion: '[Texto de presentación de los créditos pendiente]',
  grupos: [
    { titulo: 'Idea y dirección', personas: [{ nombre: '[Nombre]' }] },
    { titulo: 'Investigación y textos', personas: [{ nombre: '[Nombre]' }] },
    { titulo: 'Fotografía', personas: [{ nombre: '[Nombre]' }] },
    { titulo: 'Video', personas: [{ nombre: '[Nombre]' }] },
    { titulo: 'Modelos 3D de la colección', personas: [{ nombre: '[Nombre]' }] },
    { titulo: 'Diseño y desarrollo del sitio', personas: [{ nombre: '[Nombre]' }] },
  ],
  referencias: [{ titulo: '[Título del libro o documento]', autor: '[Autor]', datos: '[Año · editorial]' }],
  agradecimientos: ['[Agradecimientos pendientes]'],
}

export const textosCreditos: TextosCreditos = {
  presentacion: propios.presentacion ?? pendientes.presentacion,
  grupos: propios.grupos ?? pendientes.grupos,
  referencias: propios.referencias ?? pendientes.referencias,
  agradecimientos: propios.agradecimientos ?? pendientes.agradecimientos,
  dedicatoria: propios.dedicatoria,
}

/* ───────────── Mapas, datos y herramientas ───────────── */

export interface Licencia {
  nombre: string
  url: string
}

export interface FuenteCredito {
  /** Quién hizo los datos o la herramienta */
  nombre: string
  /** Qué es o para qué se usa en el sitio */
  uso: string
  /** Página de la fuente */
  url: string
  licencia: Licencia
  /** Va destacado (la licencia obliga a dar el crédito) */
  obligatorio?: boolean
  /** Aclaración en pequeño */
  nota?: string
}

export interface GrupoFuentes {
  titulo: string
  fuentes: FuenteCredito[]
}

const CC_BY_4 = { nombre: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/deed.es' }
const CC0 = { nombre: 'CC0 1.0', url: 'https://creativecommons.org/publicdomain/zero/1.0/deed.es' }
const DOMINIO_PUBLICO = { nombre: 'Dominio público', url: 'https://www.naturalearthdata.com/about/terms-of-use/' }
const MIT = { nombre: 'MIT', url: 'https://opensource.org/license/mit' }
const ISC = { nombre: 'ISC', url: 'https://opensource.org/license/isc-license-txt' }
const APACHE_2 = { nombre: 'Apache 2.0', url: 'https://www.apache.org/licenses/LICENSE-2.0' }
const OFL = { nombre: 'SIL OFL 1.1', url: 'https://openfontlicense.org' }

export const fuentes: GrupoFuentes[] = [
  {
    titulo: 'Mapas',
    fuentes: [
      {
        nombre: 'DANE — Marco Geoestadístico Nacional, vía geoBoundaries',
        uso: 'Límites de Colombia, de Nariño y de sus municipios, en el mapa animado de la historia. Se simplificaron para el mapa.',
        url: 'https://www.geoboundaries.org',
        licencia: CC_BY_4,
        obligatorio: true,
        nota: 'Runfola, D. et al. (2020). geoBoundaries: A global database of political administrative boundaries. PLoS ONE 15(4): e0231866.',
      },
      {
        nombre: 'geoBoundaries',
        uso: 'Frontera de Ecuador, en el mapa animado.',
        url: 'https://www.geoboundaries.org',
        licencia: CC0,
      },
      {
        nombre: 'Natural Earth',
        uso: 'Continentes y países vecinos, en el mapa animado (paquete world-atlas, licencia ISC).',
        url: 'https://www.naturalearthdata.com',
        licencia: DOMINIO_PUBLICO,
      },
    ],
  },
  {
    titulo: 'Herramientas y tipografías',
    fuentes: [
      {
        nombre: 'model-viewer, de Google',
        uso: 'El visor 3D de las piezas de la colección.',
        url: 'https://modelviewer.dev',
        licencia: APACHE_2,
      },
      {
        nombre: 'three.js',
        uso: 'El motor 3D que usa el visor.',
        url: 'https://threejs.org',
        licencia: MIT,
      },
      {
        nombre: 'Draco, de Google',
        uso: 'La compresión que hace livianos los modelos 3D.',
        url: 'https://google.github.io/draco/',
        licencia: APACHE_2,
      },
      {
        nombre: 'd3-geo y topojson',
        uso: 'El dibujo del globo y de los límites en el mapa animado.',
        url: 'https://d3js.org/d3-geo',
        licencia: ISC,
      },
      {
        nombre: 'Simple Icons',
        uso: 'Los logos de Gmail, WhatsApp, Instagram y Facebook en Contacto.',
        url: 'https://simpleicons.org',
        licencia: CC0,
        nota: 'Cada logo es marca registrada de su dueño.',
      },
      {
        nombre: 'Rubik, de Hubert & Fischer',
        uso: 'La letra de los títulos y los textos.',
        url: 'https://fonts.google.com/specimen/Rubik',
        licencia: OFL,
      },
      {
        nombre: 'IBM Plex Mono, de IBM',
        uso: 'La letra de los rótulos y los números.',
        url: 'https://fonts.google.com/specimen/IBM+Plex+Mono',
        licencia: OFL,
      },
      {
        nombre: 'React y Vite',
        uso: 'Con lo que está construido el sitio.',
        url: 'https://react.dev',
        licencia: MIT,
      },
    ],
  },
]
