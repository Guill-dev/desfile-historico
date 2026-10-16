import { useEffect, useRef, type PointerEvent, type ReactNode } from 'react'
import Bandera from '@/components/marca/Bandera'
import { cx } from '@/utils/cx'
import styles from './GualmatanAereo.module.css'

/*
 * Gualmatán desde el aire — ilustración animada (SVG, sin imágenes externas).
 * Inspirada en la vista aérea de la plaza: montañas con parcelas, casas,
 * la iglesia de dos torres con cúpulas rojas y el desfile recorriendo la plaza.
 *
 * Movimiento: nubes y aves que cruzan, público que se mueve, bandera que ondea,
 * el desfile dando la vuelta a la plaza y un leve paralaje con el mouse.
 * Todo se pausa fuera de pantalla y se detiene con "reducir movimiento".
 */

/** Una casa del pueblo (posición, tamaño y colores) */
interface DatosCasa {
  x: number
  y: number
  ancho: number
  alto: number
  fachada: string
  techo: string
}

/** Una persona del público (un punto de color) */
interface Persona {
  x: number
  y: number
  radio: number
  color: string
  retraso: string
}

/** Un participante del desfile: persona o carroza */
interface DatosParticipante {
  i: number
  carroza: boolean
  color: string
  inicio: string
}

// Generador con semilla: el pueblo se dibuja igual en cada carga.
function azar(semilla: number): () => number {
  let t = semilla
  return () => {
    t = (t + 0x6d2b79f5) | 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

/** Elige un elemento al azar de una lista (<T> = sirve para listas de cualquier tipo) */
const elegir = <T,>(r: () => number, lista: readonly T[]): T => lista[Math.floor(r() * lista.length)]

const C = {
  cielo: '#cfe6ee',
  horizonte: '#e4f1f2',
  lejana: '#a9d3b4',
  media: '#6db585',
  cercana: '#2f9a52',
  suelo: '#ede6d8',
  plaza: '#e4daca',
  ruta: '#cbbca3',
  jardin: '#9ed4ae',
  arbol: '#2e8b4b',
  arbolClaro: '#3fa35e',
  fachada: '#f1d58c',
  moldura: '#ffffff',
  cupula: '#da121a',
  cupulaSombra: '#b00e15',
  madera: '#7a4a35',
  vidrio: '#7fb3c9',
  oscuro: '#34423c',
}
const FACHADAS = ['#ffffff', '#f4d580', '#86c9cf', '#efa8b0', '#f2efe8', '#9fd1a9', '#f7c59f']
const TECHOS = ['#c65a3e', '#b34a33', '#d9785a', '#a9432f']
const GENTE = ['#da121a', '#ffffff', '#078930', '#f4d580', '#2f6fb5', '#efa8b0', '#34423c']
const COMPARSAS = ['#da121a', '#ffffff', '#078930', '#f4d580', '#2f6fb5']

const r = azar(7)

function fila(desde: number, hasta: number, base: number, altoMin: number, altoMax: number): DatosCasa[] {
  const casas: DatosCasa[] = []
  for (let x = desde; x < hasta; ) {
    const ancho = Math.min(34 + r() * 46, hasta - x)
    const alto = altoMin + r() * (altoMax - altoMin)
    casas.push({ x, y: base - alto, ancho, alto, fachada: elegir(r, FACHADAS), techo: elegir(r, TECHOS) })
    x += ancho + 2
  }
  return casas
}

function grupo(n: number, x0: number, x1: number, y0: number, y1: number): Persona[] {
  return Array.from({ length: n }, () => ({
    x: x0 + r() * (x1 - x0),
    y: y0 + r() * (y1 - y0),
    radio: 3.6 + r() * 1.8,
    color: elegir(r, GENTE),
    retraso: `${(-r() * 3).toFixed(2)}s`,
  }))
}

const CASAS = [
  ...fila(-40, 470, 478, 30, 56),
  ...fila(730, 1240, 478, 30, 56),
  ...fila(-40, 452, 530, 42, 72),
  ...fila(748, 1240, 530, 42, 72),
]

const PUBLICO = [
  ...grupo(44, 430, 770, 540, 562),
  ...grupo(50, 20, 1180, 778, 796),
  ...grupo(14, 20, 70, 600, 760),
  ...grupo(14, 1130, 1180, 600, 760),
]

// El recorrido del desfile alrededor de la plaza
const RUTA = 'M160 574 H1040 Q1100 574 1100 630 V708 Q1100 764 1040 764 H160 Q100 764 100 708 V630 Q100 574 160 574 Z'
const VUELTA = 80 // segundos por vuelta
const DESFILE: DatosParticipante[] = Array.from({ length: 50 }, (_, i) => ({
  i,
  carroza: i % 12 === 0,
  color: i === 0 ? '#ffffff' : COMPARSAS[Math.floor(i / 6) % COMPARSAS.length],
  inicio: `${-(i * 1.05).toFixed(2)}s`,
}))

const NUBES = [
  { y: 70, escala: 1, duracion: '95s', retraso: '-20s' },
  { y: 140, escala: 0.65, duracion: '130s', retraso: '-85s' },
  { y: 40, escala: 0.8, duracion: '115s', retraso: '-55s' },
]

// [x, y, color] — una tupla: lista de largo fijo con un tipo por posición
const TOLDOS: Array<[number, number, string]> = [
  [70, 566, '#2f6fb5'],
  [1130, 566, '#ffffff'],
  [60, 690, '#da121a'],
  [1140, 700, '#2f6fb5'],
  [330, 788, '#ffffff'],
  [870, 788, '#da121a'],
]

// [x, y, radio]
const ARBOLES: Array<[number, number, number]> = [
  [175, 612, 24], [240, 652, 28], [330, 618, 22], [388, 662, 25],
  [1025, 612, 24], [960, 652, 28], [870, 618, 22], [812, 662, 25],
]

function Nube({ escala }: { escala: number }) {
  return (
    <g transform={`scale(${escala})`} fill="#ffffff">
      <rect x="0" y="22" width="170" height="34" rx="17" />
      <circle cx="55" cy="26" r="26" />
      <circle cx="100" cy="18" r="32" />
      <circle cx="136" cy="32" r="20" />
    </g>
  )
}

function Torre({ x }: { x: number }) {
  const c = x + 27
  return (
    <g>
      <rect x={x} y="250" width="54" height="270" fill={C.fachada} />
      <rect x={x} y="330" width="54" height="5" fill={C.moldura} />
      <rect x={x} y="402" width="54" height="5" fill={C.moldura} />
      <path d={`M${c - 12} 304 V283 A12 12 0 0 1 ${c + 12} 283 V304 Z`} fill={C.madera} />
      <path d={`M${c - 8} 382 V367 A8 8 0 0 1 ${c + 8} 367 V382 Z`} fill={C.vidrio} />
      <rect x={x - 4} y="244" width="62" height="8" fill={C.moldura} />
      <path d={`M${x + 2} 244 A25 30 0 0 1 ${x + 52} 244 Z`} fill={C.cupula} />
      <path d={`M${c} 214 A25 30 0 0 1 ${x + 52} 244 H${c} Z`} fill={C.cupulaSombra} />
      <rect x={c - 5} y="200" width="10" height="15" fill={C.moldura} />
      <path d={`M${c - 6} 200 A6 5 0 0 1 ${c + 6} 200 Z`} fill={C.cupula} />
      <path d={`M${c} 180 V195 M${c - 5} 186 H${c + 5}`} stroke={C.oscuro} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  )
}

function Iglesia() {
  return (
    <g>
      <rect x="452" y="530" width="296" height="8" fill="#efe8da" />
      <rect x="462" y="520" width="276" height="10" fill="#f7f3ea" />
      <Torre x={478} />
      <Torre x={668} />
      <rect x="530" y="352" width="140" height="168" fill={C.fachada} />
      <polygon points="522,356 600,312 678,356" fill={C.fachada} stroke={C.moldura} strokeWidth="5" strokeLinejoin="round" />
      <rect x="526" y="352" width="148" height="6" fill={C.moldura} />
      <rect x="530" y="430" width="140" height="4" fill={C.moldura} />
      <circle cx="600" cy="394" r="15" fill={C.vidrio} stroke={C.moldura} strokeWidth="4" />
      <path d="M548 460 V442 A8 8 0 0 1 564 442 V460 Z" fill={C.vidrio} />
      <path d="M636 460 V442 A8 8 0 0 1 652 442 V460 Z" fill={C.vidrio} />
      <path d="M580 520 V476 A20 20 0 0 1 620 476 V520 Z" fill={C.madera} />
      {/* Figura blanca sobre el frontón */}
      <g fill={C.moldura}>
        <circle cx="600" cy="286" r="6" />
        <path d="M594 312 L596 293 H604 L606 312 Z" />
        <path d="M586 295 L600 300 L614 295 L614 299 L600 304 L586 299 Z" />
      </g>
    </g>
  )
}

function Casa({ x, y, ancho, alto, fachada, techo }: DatosCasa) {
  const ventanas = Math.max(1, Math.floor(ancho / 24))
  const paso = ancho / (ventanas + 1)
  return (
    <g>
      <rect x={x} y={y} width={ancho} height={alto} fill={fachada} />
      <polygon points={`${x - 3},${y + 2} ${x + ancho + 3},${y + 2} ${x + ancho - 4},${y - 10} ${x + 4},${y - 10}`} fill={techo} />
      {Array.from({ length: ventanas }, (_, v) => (
        <rect key={v} x={x + paso * (v + 1) - 3} y={y + alto * 0.42} width="6" height="9" fill={C.oscuro} opacity="0.45" />
      ))}
    </g>
  )
}

function Participante({ carroza, color, inicio, primero }: DatosParticipante & { primero: boolean }) {
  return (
    <g>
      {carroza ? (
        <g>
          <rect x="-18" y="-9" width="36" height="18" rx="6" fill={color} stroke={C.ruta} strokeWidth="1.5" />
          {primero && <circle cx="21" cy="-5" r="6" fill={color} stroke={C.ruta} strokeWidth="1.5" />}
        </g>
      ) : (
        <circle r="5.5" fill={color} stroke={color === '#ffffff' ? C.ruta : 'none'} strokeWidth="1" />
      )}
      <animateMotion dur={`${VUELTA}s`} begin={inicio} repeatCount="indefinite" rotate="auto">
        <mpath href="#gualmatan-ruta" />
      </animateMotion>
    </g>
  )
}

/** Capa con paralaje (se mueve con el mouse) y entrada escalonada al aparecer. */
function Capa({ k, orden, children }: { k: number; orden: number; children: ReactNode }) {
  return (
    <g className={styles.paralaje} style={{ '--k': k }}>
      <g className={styles.capa} style={{ '--i': orden }}>{children}</g>
    </g>
  )
}

export default function GualmatanAereo({ className }: { className?: string }) {
  const contenedor = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const el = contenedor.current
    const dibujo = svg.current
    if (!el || !dibujo) return
    dibujo.pauseAnimations?.()

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.dataset.visto = ''
      return
    }

    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          el.dataset.visto = ''
          el.dataset.enVista = ''
          dibujo.unpauseAnimations?.()
        } else {
          delete el.dataset.enVista
          dibujo.pauseAnimations?.()
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const alMover = (e: PointerEvent<HTMLDivElement>) => {
    const el = contenedor.current
    if (e.pointerType !== 'mouse' || !el) return
    const caja = el.getBoundingClientRect()
    el.style.setProperty('--px', (((e.clientX - caja.left) / caja.width - 0.5) * 2).toFixed(3))
    el.style.setProperty('--py', (((e.clientY - caja.top) / caja.height - 0.5) * 2).toFixed(3))
  }
  const alSalir = () => {
    contenedor.current?.style.setProperty('--px', '0')
    contenedor.current?.style.setProperty('--py', '0')
  }

  return (
    <div ref={contenedor} className={cx(styles.aereo, className)} onPointerMove={alMover} onPointerLeave={alSalir}>
      <svg
        ref={svg}
        className={styles.svg}
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-labelledby="aereo-titulo aereo-desc"
      >
        <title id="aereo-titulo">Gualmatán desde el aire</title>
        <desc id="aereo-desc">
          Ilustración animada: las montañas, el pueblo, la iglesia de dos torres con cúpulas rojas y el desfile dando la vuelta a la plaza.
        </desc>
        <defs>
          <path id="gualmatan-ruta" d={RUTA} />
        </defs>

        <rect x="-40" y="-40" width="1280" height="880" fill={C.cielo} />
        <rect x="-40" y="200" width="1280" height="160" fill={C.horizonte} />

        <g className={styles.paralaje} style={{ '--k': 3 }}>
          {NUBES.map((n, i) => (
            <g key={i} transform={`translate(0 ${n.y})`}>
              <g className={styles.nube} style={{ animationDuration: n.duracion, animationDelay: n.retraso }}>
                <Nube escala={n.escala} />
              </g>
            </g>
          ))}
        </g>

        <g className={styles.bandada}>
          {[0, 1, 2].map((a) => (
            <path
              key={a}
              className={styles.ave}
              style={{ animationDelay: `${a * -0.17}s` }}
              d={`M${a * 26} ${a % 2 ? 10 : 0} q6 -6 12 0 q6 -6 12 0`}
              fill="none"
              stroke={C.oscuro}
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
        </g>

        <Capa k={5} orden={1}>
          <path d="M-40 300 Q 110 205 260 262 T 560 236 T 860 214 T 1240 246 V 470 H -40 Z" fill={C.lejana} />
        </Capa>

        <Capa k={9} orden={2}>
          <path d="M-40 350 Q 170 262 360 322 T 760 300 T 1240 318 V 500 H -40 Z" fill={C.media} />
          <polygon points="140,318 230,302 250,334 160,348" fill="#5aa874" />
          <polygon points="900,312 990,302 1010,336 915,346" fill="#86c79a" />
          <polygon points="620,330 700,322 712,350 630,358" fill="#86c79a" />
        </Capa>

        <Capa k={13} orden={3}>
          <path d="M-40 410 Q 230 336 500 392 T 1000 380 T 1240 392 V 560 H -40 Z" fill={C.cercana} />
          <polygon points="60,402 170,382 185,414 70,432" fill={C.arbolClaro} />
          <polygon points="1000,394 1120,386 1130,416 1010,426" fill="#25813f" />
        </Capa>

        <Capa k={16} orden={4}>
          <rect x="-40" y="470" width="1280" height="380" fill={C.suelo} />
          {CASAS.map((casa, i) => (
            <Casa key={i} {...casa} />
          ))}
        </Capa>

        <Capa k={16} orden={5}>
          <Iglesia />
        </Capa>

        <Capa k={18} orden={6}>
          <polygon points="80,540 1120,540 1240,820 -40,820" fill={C.plaza} />
          <rect x="150" y="598" width="260" height="92" rx="46" fill={C.jardin} />
          <rect x="790" y="598" width="260" height="92" rx="46" fill={C.jardin} />
          {ARBOLES.map(([x, y, radio], i) => (
            <g key={i}>
              <ellipse cx={x + 6} cy={y + 8} rx={radio} ry={radio * 0.7} fill="#000" opacity="0.08" />
              <circle cx={x} cy={y} r={radio} fill={i % 2 ? C.arbolClaro : C.arbol} />
            </g>
          ))}
          <use href="#gualmatan-ruta" fill="none" stroke={C.ruta} strokeWidth="2" strokeDasharray="2 9" strokeLinecap="round" />

          {/* Asta con la bandera de Gualmatán en el centro de la plaza */}
          <rect x="590" y="696" width="20" height="6" rx="2" fill="#cbbca3" />
          <line x1="600" y1="698" x2="600" y2="606" stroke="#6b6b66" strokeWidth="3" strokeLinecap="round" />
          <g transform="translate(601 608)">
            <g className={styles.bandera}>
              <Bandera x="0" y="0" width="48" height="32" />
            </g>
          </g>

          {TOLDOS.map(([x, y, color], i) => (
            <circle key={i} cx={x} cy={y} r="13" fill={color} stroke={C.ruta} strokeWidth="1.5" />
          ))}

          {PUBLICO.map((p, i) => (
            <circle
              key={i}
              className={styles.persona}
              style={{ animationDelay: p.retraso }}
              cx={p.x}
              cy={p.y}
              r={p.radio}
              fill={p.color}
            />
          ))}

          {DESFILE.map((p) => (
            <Participante key={p.i} {...p} primero={p.i === 0} />
          ))}
        </Capa>
      </svg>

      <p className={cx('mono', styles.leyenda)}>Gualmatán desde el aire · ilustración</p>
    </div>
  )
}
