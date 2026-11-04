import { useEffect, useId, useRef, useState, type PointerEvent } from 'react'
import { Link } from 'react-router'
import { cx } from '@/utils/cx'
import { useIrAlAncla } from '@/hooks/useIrAlAncla'
import type { EntradaIndice } from './Indice'
import styles from './IndiceFlotante.module.css'

interface Props {
  entradas: EntradaIndice[]
  nombre: string
  activa?: string | null
}

/** Dónde está el botón: pegado a un lado y a qué altura (0 = arriba, 1 = abajo; es su centro). */
interface Posicion {
  lado: 'izq' | 'der'
  y: number
}

const CLAVE = 'desfile:indice-flotante'
const POR_DEFECTO: Posicion = { lado: 'der', y: 0.85 }
/** Separación mínima del botón con los bordes de la pantalla */
const MARGEN = 12
/** Con el mouse, moverlo más de esto (px) ya es arrastrarlo */
const UMBRAL = 8
/** Con el dedo, hay que dejarlo presionado esto (ms) para poder arrastrarlo; antes, el dedo desplaza la página */
const PULSACION = 350

// La posición se recuerda en este navegador. Si no se puede (modo privado…), se usa la de siempre.
function leerPosicion(): Posicion {
  try {
    const p = JSON.parse(localStorage.getItem(CLAVE) ?? 'null') as Partial<Posicion> | null
    if (p && (p.lado === 'izq' || p.lado === 'der') && typeof p.y === 'number' && Number.isFinite(p.y)) {
      return { lado: p.lado, y: Math.min(1, Math.max(0, p.y)) }
    }
  } catch {
    /* sin almacenamiento: posición por defecto */
  }
  return POR_DEFECTO
}

function guardarPosicion(p: Posicion) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(p))
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
}

/** Alto de la barra superior fija (--alto-header): el botón no se esconde debajo de ella. */
function altoBarra(): number {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--alto-header')) || 84
}

interface Gesto {
  id: number
  tipo: string
  /** Dónde empezó el toque */
  x0: number
  y0: number
  /** Dónde se tomó el botón, respecto a su esquina */
  dx: number
  dy: number
  temporizador: number
  arrastrando: boolean
}

/**
 * Índice para el celular cuando hay muchas entradas (los 79 pasos): un botón redondo que siempre
 * está a la vista. Al tocarlo se despliegan los números; al tocar uno, la página va a ese paso.
 * Para que no estorbe, se puede mover: se deja presionado un momento y se arrastra (con el mouse,
 * basta con arrastrarlo). Al soltarlo se pega al lado más cercano y el navegador recuerda dónde quedó.
 * En el computador no se muestra: allí está la columna del índice.
 */
export default function IndiceFlotante({ entradas, nombre, activa }: Props) {
  const [posicion, setPosicion] = useState(leerPosicion)
  const [arrastrando, setArrastrando] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const boton = useRef<HTMLButtonElement>(null)
  const dialogo = useRef<HTMLDialogElement>(null)
  const numeros = useRef<HTMLOListElement>(null)
  const gesto = useRef<Gesto | null>(null)
  const ignorarClic = useRef(false)
  const idPanel = useId()
  const irAlAncla = useIrAlAncla()

  const actual = entradas.find((e) => e.id === activa)

  // Mientras se arrastra con el dedo, la página no debe desplazarse. React escucha `touchmove` como
  // pasivo (no se puede cancelar), por eso este escuchador va directo sobre el botón.
  useEffect(() => {
    const b = boton.current
    if (!b) return
    const alMover = (ev: TouchEvent) => {
      if (gesto.current?.arrastrando) ev.preventDefault()
    }
    b.addEventListener('touchmove', alMover, { passive: false })
    return () => b.removeEventListener('touchmove', alMover)
  }, [])

  // Al abrir: el número del paso en el que se está queda a la vista y con el foco
  useEffect(() => {
    if (!abierto) return
    const lista = numeros.current
    const enlace = lista?.querySelector<HTMLElement>('[aria-current]')
    if (!lista || !enlace) return
    lista.scrollTop = enlace.offsetTop - (lista.clientHeight - enlace.offsetHeight) / 2
    enlace.focus({ preventScroll: true })
  }, [abierto])

  // Si se desmonta con el gesto a medias (cambio de página), no dejar el temporizador vivo
  useEffect(() => () => clearTimeout(gesto.current?.temporizador), [])

  const empezarArrastre = () => {
    const g = gesto.current
    if (!g || g.arrastrando) return
    g.arrastrando = true
    setArrastrando(true)
    try {
      navigator.vibrate?.(12) // un toquecito en los celulares que lo permiten: "ya lo puedes mover"
    } catch {
      /* sin vibración */
    }
  }

  /** Lleva el botón a (izquierda, arriba) en px, sin salirse de la pantalla ni meterse bajo la barra */
  const mover = (izquierda: number, arriba: number) => {
    const b = boton.current
    if (!b) return
    const ancho = document.documentElement.clientWidth
    const x = Math.min(Math.max(izquierda, MARGEN), ancho - b.offsetWidth - MARGEN)
    const y = Math.min(Math.max(arriba, altoBarra() + MARGEN), window.innerHeight - b.offsetHeight - MARGEN)
    b.style.left = `${x}px`
    b.style.top = `${y}px`
  }

  /** Al soltar: se pega al lado más cercano y se recuerda la altura */
  const soltar = () => {
    const b = boton.current
    if (!b) return
    const r = b.getBoundingClientRect()
    const nueva: Posicion = {
      lado: r.left + r.width / 2 < document.documentElement.clientWidth / 2 ? 'izq' : 'der',
      y: Math.min(1, Math.max(0, (r.top + r.height / 2) / window.innerHeight)),
    }
    // Sin la posición escrita a mano, el CSS lo lleva (con una transición) al lado elegido
    b.style.left = ''
    b.style.top = ''
    setPosicion(nueva)
    setArrastrando(false)
    guardarPosicion(nueva)
  }

  const alPresionar = (e: PointerEvent<HTMLButtonElement>) => {
    ignorarClic.current = false
    if (e.button !== 0) return
    const r = e.currentTarget.getBoundingClientRect()
    clearTimeout(gesto.current?.temporizador)
    gesto.current = {
      id: e.pointerId,
      tipo: e.pointerType,
      x0: e.clientX,
      y0: e.clientY,
      dx: e.clientX - r.left,
      dy: e.clientY - r.top,
      temporizador: window.setTimeout(empezarArrastre, PULSACION),
      arrastrando: false,
    }
    if (e.pointerType === 'mouse') e.currentTarget.setPointerCapture(e.pointerId)
  }

  const alMoverPuntero = (e: PointerEvent<HTMLButtonElement>) => {
    const g = gesto.current
    if (!g || g.id !== e.pointerId) return
    if (!g.arrastrando) {
      if (Math.hypot(e.clientX - g.x0, e.clientY - g.y0) < UMBRAL) return
      if (g.tipo !== 'mouse') {
        // El dedo se movió antes de la pulsación larga: la persona está desplazando la página
        clearTimeout(g.temporizador)
        gesto.current = null
        return
      }
      empezarArrastre()
    }
    mover(e.clientX - g.dx, e.clientY - g.dy)
  }

  const alSoltar = (e: PointerEvent<HTMLButtonElement>) => {
    const g = gesto.current
    if (!g || g.id !== e.pointerId) return
    clearTimeout(g.temporizador)
    gesto.current = null
    if (g.arrastrando) {
      soltar()
      ignorarClic.current = true // fue un arrastre, no un toque: no abrir el índice
    }
  }

  const alCancelar = (e: PointerEvent<HTMLButtonElement>) => {
    const g = gesto.current
    if (!g || g.id !== e.pointerId) return
    clearTimeout(g.temporizador)
    gesto.current = null
    if (g.arrastrando) soltar()
  }

  const abrir = () => {
    if (ignorarClic.current) {
      ignorarClic.current = false
      return
    }
    dialogo.current?.showModal()
    setAbierto(true)
  }

  const cerrar = () => dialogo.current?.close()

  return (
    <>
      <button
        ref={boton}
        type="button"
        className={cx(styles.boton, posicion.lado === 'izq' && styles.izq, arrastrando && styles.arrastrando)}
        style={{ '--y': posicion.y }}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-controls={idPanel}
        aria-label={actual ? `${nombre}. Estás en: ${actual.numero ? `${actual.numero}, ` : ''}${actual.etiqueta}` : nombre}
        onClick={abrir}
        onPointerDown={alPresionar}
        onPointerMove={alMoverPuntero}
        onPointerUp={alSoltar}
        onPointerCancel={alCancelar}
        onContextMenu={(e) => e.preventDefault()}
      >
        <span className={cx('mono', styles.rotulo)}>Índice</span>
        {actual?.numero ? (
          <span className={styles.numero}>{actual.numero}</span>
        ) : (
          // Cuadrícula de puntos: "aquí están todos"
          <svg className={styles.icono} viewBox="0 0 18 18" aria-hidden="true">
            {[3, 9, 15].flatMap((y) => [3, 9, 15].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.8" />))}
          </svg>
        )}
      </button>

      <dialog
        ref={dialogo}
        id={idPanel}
        className={styles.panel}
        aria-label={nombre}
        onClose={() => setAbierto(false)}
        // Tocar fuera del panel (el fondo oscuro) lo cierra
        onClick={(e) => e.target === e.currentTarget && cerrar()}
      >
        <div className={styles.contenido}>
          <div className={styles.cabecera}>
            <p className="mono">{nombre}</p>
            <button type="button" className={styles.cerrar} onClick={cerrar} aria-label="Cerrar el índice">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
          </div>

          {actual && (
            <p className={styles.actual}>
              <span className="mono">Estás aquí{actual.numero && ` · ${actual.numero}`}</span> {actual.etiqueta}
            </p>
          )}

          <ol ref={numeros} role="list" className={styles.numeros}>
            {entradas.map((e) => (
              <li key={e.id}>
                <Link
                  to={{ hash: `#${e.id}` }}
                  title={e.etiqueta}
                  aria-label={e.numero ? `${e.numero}: ${e.etiqueta}` : e.etiqueta}
                  aria-current={e.id === activa ? 'location' : undefined}
                  className={cx(e.id === activa && styles.activo)}
                  onClick={() => {
                    cerrar()
                    irAlAncla(e.id)
                  }}
                >
                  {e.numero ?? e.etiqueta}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </dialog>
    </>
  )
}
