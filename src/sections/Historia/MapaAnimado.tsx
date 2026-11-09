import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import type { GeoPermissibleObjects } from 'd3-geo'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import styles from './MapaAnimado.module.css'

/** Lo que trae public/media/mapa/mapa.json (lo arma scripts/preparar-mapa.mjs) */
interface DatosMapa {
  cabeceras: { gualmatan: [number, number] }
  tierra: GeoPermissibleObjects
  vecinos: GeoPermissibleObjects
  /** Colombia sin Nariño: los otros 32 departamentos (DANE) */
  colombia: GeoPermissibleObjects
  /** Contorno de Nariño (DANE): se rellena entero, sin rendijas */
  narino: GeoPermissibleObjects
  /** Los 64 municipios: solo sus líneas */
  municipios: GeoPermissibleObjects
  gualmatan: GeoPermissibleObjects
}

type D3 = typeof import('d3-geo')

/** esperando: aún no se ve o no ha cargado · animando (en bucle) · final: la foto quieta · sinMapa: no hay datos */
type Fase = 'esperando' | 'animando' | 'final' | 'sinMapa'

/*
 * EL RECORRIDO, en segundos. La cámara va de un punto a otro: centro [lon, lat] y tamaño
 * (k = radio del globo respecto al alto del recuadro: 0.4 es el globo entero; 40, Gualmatán de cerca).
 */
const CAMARA = [
  { t: 0, centro: [20, 8], k: 0.4 }, // el mundo
  { t: 1.6, centro: [-66, -4], k: 0.47 }, // gira hasta América
  { t: 3.3, centro: [-73.6, 4.3], k: 2.9 }, // Colombia
  { t: 5.0, centro: [-77.9, 1.52], k: 19 }, // Nariño
  { t: 6.4, centro: [-77.57, 0.905], k: 58 }, // Gualmatán
] as const
const CAE_EL_PUNTO = 5.7
const SUENA_TIN = 6.15
const EMPIEZA_LA_FOTO = 7.4
const TERMINA = 8.7
/** La foto se queda quieta y entera este tiempo; después el recorrido vuelve a empezar (para siempre) */
const FOTO_QUIETA = 3.5
const CICLO = TERMINA + FOTO_QUIETA
/** Al volver a empezar, la foto se desvanece sobre el globo en este tiempo (sin cortes bruscos) */
const FUNDIDO = 0.8

const ROTULOS = [
  { id: 'america', texto: 'América', lugar: [-62, -12], desde: 1.1, hasta: 2.7 },
  { id: 'colombia', texto: 'Colombia', lugar: [-73.2, 4.8], desde: 2.8, hasta: 4.5 },
  { id: 'narino', texto: 'Nariño', lugar: [-77.9, 1.75], desde: 4.3, hasta: 5.7 },
] as const

const limitar = (x: number) => Math.min(1, Math.max(0, x))
/** 0 antes de a, 1 después de b, y en medio sube suave */
const rampa = (t: number, a: number, b: number) => {
  const x = limitar((t - a) / (b - a))
  return x * x * (3 - 2 * x)
}
const suave = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2)
/** Rebote al caer (el "tin") */
const rebote = (x: number) => {
  const n = 7.5625
  const d = 2.75
  if (x < 1 / d) return n * x * x
  if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75
  if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375
  return n * (x -= 2.625 / d) * x + 0.984375
}

let cargando: Promise<[D3, DatosMapa]> | null = null
/** d3-geo y los datos del mapa se descargan una sola vez, cuando el recuadro está por aparecer */
function cargar() {
  cargando ??= Promise.all([
    import('d3-geo'),
    fetch(`${import.meta.env.BASE_URL}media/mapa/mapa.json`).then((r) => {
      if (!r.ok) throw new Error('Sin mapa')
      return r.json() as Promise<DatosMapa>
    }),
  ])
  return cargando
}

interface Capas {
  lienzo: HTMLCanvasElement
  escena: HTMLDivElement
  punto: HTMLElement
  final: HTMLElement
  anillo: HTMLElement
}

/** Prepara el dibujo y devuelve la función que pinta el instante t (en segundos) */
function crearDibujo(d3: D3, datos: DatosMapa, capas: Capas) {
  const { lienzo, escena } = capas
  const ctx = lienzo.getContext('2d')!
  // Los rótulos (América, Colombia…) se buscan por su data-rotulo
  const rotulos = new Map([...escena.querySelectorAll<HTMLElement>('[data-rotulo]')].map((el) => [el.dataset.rotulo ?? '', el]))
  const proyeccion = d3.geoOrthographic().clipAngle(90).precision(0.5)
  const camino = d3.geoPath(proyeccion, ctx)
  const esfera: GeoPermissibleObjects = { type: 'Sphere' }
  // Colombia entera = los otros 32 departamentos + Nariño, en un solo relleno (sin costura entre ellos)
  const colombiaEntera = { type: 'GeometryCollection', geometries: [datos.colombia, datos.narino] } as GeoPermissibleObjects
  const reticula = d3.geoGraticule10()
  const gualmatan = datos.cabeceras.gualmatan
  const interpolar = CAMARA.slice(1).map((b, i) => d3.geoInterpolate([...CAMARA[i].centro], [...b.centro]))

  let ancho = 0
  let alto = 0
  const medir = () => {
    const r = escena.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    ancho = r.width
    alto = r.height
    lienzo.width = Math.round(ancho * dpr)
    lienzo.height = Math.round(alto * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  medir()

  /** Dónde está la cámara en el instante t */
  const camara = (t: number) => {
    const ultimo = CAMARA[CAMARA.length - 1]
    if (t >= ultimo.t) return { centro: [...ultimo.centro] as [number, number], k: ultimo.k }
    const i = Math.max(0, CAMARA.findIndex((c, n) => t >= c.t && t < (CAMARA[n + 1]?.t ?? Infinity)))
    const a = CAMARA[i]
    const b = CAMARA[i + 1]
    const e = suave(limitar((t - a.t) / (b.t - a.t)))
    return { centro: interpolar[i](e), k: Math.exp(Math.log(a.k) + (Math.log(b.k) - Math.log(a.k)) * e) }
  }

  const trazar = (forma: GeoPermissibleObjects, relleno: string | null, linea: string | null, grosor = 1) => {
    ctx.beginPath()
    camino(forma)
    if (relleno) {
      ctx.fillStyle = relleno
      ctx.fill()
    }
    if (linea) {
      ctx.strokeStyle = linea
      ctx.lineWidth = grosor
      ctx.stroke()
    }
  }

  /** `repetida`: no es la primera vuelta, así que al empezar la foto anterior se desvanece encima del globo */
  const dibujar = (t: number, repetida = false) => {
    const { centro, k } = camara(t)
    // En el computador, la tarjeta de texto tapa la derecha del recuadro: el mapa se centra un poco a la izquierda
    const cx = ancho * (ancho > 560 && window.innerWidth >= 900 ? 0.4 : 0.5)
    const cy = alto * 0.5
    proyeccion
      .rotate([-centro[0], -centro[1]])
      .scale(k * alto)
      .translate([cx, cy])
      .clipExtent([
        [-2, -2],
        [ancho + 2, alto + 2],
      ])

    ctx.clearRect(0, 0, ancho, alto)
    ctx.lineJoin = 'round'

    // Mar y borde del globo (el borde brilla mientras se ve el globo entero)
    const entrada = rampa(t, 0, 0.7)
    ctx.globalAlpha = entrada
    trazar(esfera, '#0f2b1c', null)
    if (k < 1.2) {
      ctx.save()
      ctx.shadowColor = 'rgba(143, 211, 164, 0.6)'
      ctx.shadowBlur = 24
      trazar(esfera, null, 'rgba(143, 211, 164, 0.55)', 1.5)
      ctx.restore()
    }
    ctx.globalAlpha = entrada * (1 - rampa(t, 2.4, 3.3))
    trazar(reticula, null, 'rgba(255, 255, 255, 0.07)', 0.8)

    // Continentes (detalle bajo) → al acercarse, Colombia y sus vecinos (más detalle)
    ctx.globalAlpha = entrada * (1 - rampa(t, 2.5, 3.3))
    trazar(datos.tierra, 'rgba(143, 211, 164, 0.16)', 'rgba(143, 211, 164, 0.55)', 0.8)
    ctx.globalAlpha = rampa(t, 2.5, 3.3) * (1 - rampa(t, 5.6, 6.4))
    // Los vecinos (Ecuador…) vienen de otro mapa: su borde se ensancha en su mismo color (#244632, el verde suave
    // sobre el mar, sin transparencia) para tapar cualquier rendija con la frontera del DANE
    trazar(datos.vecinos, '#244632', '#244632', 6)
    trazar(datos.vecinos, null, 'rgba(143, 211, 164, 0.5)', 1)

    // Colombia se enciende en blanco; al llegar a Nariño se apaga
    ctx.globalAlpha = rampa(t, 1.9, 2.9) * (1 - 0.8 * rampa(t, 4.7, 5.5))
    trazar(colombiaEntera, 'rgba(255, 255, 255, 0.92)', '#ffffff', 1.2)

    // Nariño: rojo (desde Colombia) → verde con las líneas de sus municipios (ya adentro).
    // Se rellena con su contorno entero, y encima van solo las divisiones: no quedan partes sin pintar
    const rojo = rampa(t, 3.6, 4.3) * (1 - rampa(t, 4.9, 5.6))
    const verde = rampa(t, 4.9, 5.6)
    if (rojo > 0) {
      ctx.globalAlpha = rojo
      trazar(datos.narino, '#da121a', '#da121a', 2)
    }
    if (verde > 0) {
      ctx.globalAlpha = verde
      trazar(datos.narino, '#0a6e2b', 'rgba(255, 255, 255, 0.7)', 1.4)
      trazar(datos.municipios, null, 'rgba(255, 255, 255, 0.42)', 1)
    }

    // Gualmatán, en rojo y brillando
    const pueblo = rampa(t, 5.4, 5.9)
    if (pueblo > 0) {
      ctx.save()
      ctx.globalAlpha = pueblo
      ctx.shadowColor = 'rgba(218, 18, 26, 0.9)'
      ctx.shadowBlur = 22
      trazar(datos.gualmatan, '#da121a', '#ffffff', 1.6)
      ctx.restore()
    }
    ctx.globalAlpha = 1

    // Rótulos: siguen su lugar en el mapa; se esconden si quedan detrás del globo
    const visible = (lugar: readonly [number, number]) => d3.geoDistance([...lugar], centro) < Math.PI / 2 - 0.05
    for (const r of ROTULOS) {
      const el = rotulos.get(r.id)
      const p = proyeccion([...r.lugar])
      if (!el || !p) continue
      const o = visible(r.lugar) ? rampa(t, r.desde, r.desde + 0.4) * (1 - rampa(t, r.hasta - 0.4, r.hasta)) : 0
      el.style.opacity = String(o)
      el.style.transform = `translate(${p[0]}px, ${p[1]}px) translate(-50%, -50%) scale(${0.9 + 0.1 * o})`
    }

    // El punto cae sobre Gualmatán (y rebota: ¡tin!)
    const p = proyeccion(gualmatan) ?? [cx, cy]
    const caida = limitar((t - CAE_EL_PUNTO) / 0.55)
    capas.punto.style.opacity = t >= CAE_EL_PUNTO ? String(rampa(t, CAE_EL_PUNTO, CAE_EL_PUNTO + 0.15)) : '0'
    capas.punto.style.transform = `translate(${p[0]}px, ${p[1] - (1 - rebote(caida)) * 90}px)`
    capas.punto.classList.toggle(styles.tin, t >= SUENA_TIN)
    const rotuloPueblo = rotulos.get('gualmatan')
    if (rotuloPueblo) {
      rotuloPueblo.style.opacity = String(rampa(t, SUENA_TIN, SUENA_TIN + 0.4))
      rotuloPueblo.style.transform = `translate(${p[0]}px, ${p[1] + 18}px) translate(-50%, 0)`
    }

    // La foto se abre desde Gualmatán, en un círculo que crece con un anillo de luz en el borde
    const abrir = suave(limitar((t - EMPIEZA_LA_FOTO) / (TERMINA - EMPIEZA_LA_FOTO)))
    const maximo = Math.hypot(Math.max(p[0], ancho - p[0]), Math.max(p[1], alto - p[1]))
    const radio = abrir * maximo
    capas.final.style.clipPath = `circle(${radio}px at ${p[0]}px ${p[1]}px)`
    capas.final.style.visibility = abrir > 0 ? 'visible' : 'hidden'
    capas.anillo.style.opacity = abrir > 0 && abrir < 1 ? String(1 - abrir * 0.6) : '0'
    capas.anillo.style.transform = `translate(${p[0]}px, ${p[1]}px) translate(-50%, -50%)`
    capas.anillo.style.width = capas.anillo.style.height = `${radio * 2}px`
    capas.final.style.opacity = ''
    if (repetida && t < FUNDIDO) {
      capas.final.style.clipPath = 'none'
      capas.final.style.visibility = 'visible'
      capas.final.style.opacity = String(1 - rampa(t, 0, FUNDIDO))
    }
  }

  return { dibujar, medir }
}

/**
 * En el recuadro de la foto de "Conoce la historia": del mundo a América, Colombia, Nariño y, ¡tin!,
 * Gualmatán. Al final la foto del pueblo (`final`) se abre desde el punto, se queda FOTO_QUIETA segundos
 * y el recorrido vuelve a empezar, una y otra vez.
 * - Empieza sola cuando el recuadro se ve; si sale de la pantalla se detiene (y sigue al volver).
 * - Un botón pequeño la pausa (las animaciones que se repiten solas deben poder detenerse).
 * - Si la persona pidió "reducir movimiento", se ve la foto quieta y el recorrido solo si toca "Ver dónde queda".
 * - Sin los datos del mapa, se muestra la foto y ya.
 */
export default function MapaAnimado({ final }: { final: ReactNode }) {
  const reducirMovimiento = usePrefersReducedMotion()
  const [fase, setFase] = useState<Fase>(reducirMovimiento ? 'final' : 'esperando')
  const escena = useRef<HTMLDivElement>(null)
  const lienzo = useRef<HTMLCanvasElement>(null)
  const punto = useRef<HTMLDivElement>(null)
  const capaFinal = useRef<HTMLDivElement>(null)
  const anillo = useRef<HTMLDivElement>(null)
  const dibujo = useRef<ReturnType<typeof crearDibujo> | null>(null)
  const cuadro = useRef(0)
  /** Segundos de animación ya vistos (solo cuentan mientras se ve y no está en pausa) */
  const tiempo = useRef(0)
  const enPantalla = useRef(false)
  const [pausada, setPausada] = useState(false)
  const pausadaRef = useRef(false)

  const preparar = useCallback(async () => {
    if (dibujo.current) return dibujo.current
    const [d3, datos] = await cargar()
    if (!escena.current || !lienzo.current || !punto.current || !capaFinal.current || !anillo.current) return null
    dibujo.current = crearDibujo(d3, datos, {
      escena: escena.current,
      lienzo: lienzo.current,
      punto: punto.current,
      final: capaFinal.current,
      anillo: anillo.current,
    })
    return dibujo.current
  }, [])

  /** Detiene el dibujo (fuera de pantalla o en pausa): no gasta batería */
  const detener = useCallback(() => {
    cancelAnimationFrame(cuadro.current)
    cuadro.current = 0
  }, [])

  /** Sigue el bucle desde donde iba. `unaVez`: solo un recorrido y se queda en la foto ("reducir movimiento") */
  const seguir = useCallback(
    (d: ReturnType<typeof crearDibujo>, unaVez = false) => {
      detener()
      let antes = performance.now()
      let quieto = false
      const paso = (ahora: number) => {
        // Un salto grande (otra pestaña, celular bloqueado) no adelanta la animación
        tiempo.current += Math.min((ahora - antes) / 1000, 0.1)
        antes = ahora
        if (unaVez && tiempo.current >= TERMINA) {
          d.dibujar(TERMINA)
          cuadro.current = 0
          setFase('final')
          return
        }
        const vuelta = Math.floor(tiempo.current / CICLO)
        const t = tiempo.current - vuelta * CICLO
        // Mientras la foto está quieta y entera, no hace falta volver a dibujar
        if (t <= TERMINA) {
          d.dibujar(t, vuelta > 0)
          quieto = false
        } else if (!quieto) {
          d.dibujar(TERMINA, vuelta > 0)
          quieto = true
        }
        cuadro.current = requestAnimationFrame(paso)
      }
      cuadro.current = requestAnimationFrame(paso)
    },
    [detener],
  )

  const reproducir = useCallback(
    async (unaVez = false) => {
      let d: Awaited<ReturnType<typeof preparar>>
      try {
        d = await preparar()
      } catch {
        setFase('sinMapa')
        return
      }
      if (!d) return
      tiempo.current = 0
      setFase('animando')
      d.medir()
      if (!pausadaRef.current) seguir(d, unaVez)
      else d.dibujar(0)
    },
    [preparar, seguir],
  )

  const alternarPausa = () => {
    const nueva = !pausadaRef.current
    pausadaRef.current = nueva
    setPausada(nueva)
    if (nueva) detener()
    else if (dibujo.current && enPantalla.current) seguir(dibujo.current)
  }

  // Cerca de la pantalla: descargar el mapa. Bien a la vista: empezar.
  useEffect(() => {
    const el = escena.current
    if (!el || fase !== 'esperando') return
    const cerca = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) cargar().catch(() => setFase('sinMapa'))
      },
      { rootMargin: '800px 0px' },
    )
    const aLaVista = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return
        aLaVista.disconnect()
        enPantalla.current = true
        void reproducir()
      },
      { threshold: 0.45 },
    )
    cerca.observe(el)
    aLaVista.observe(el)
    return () => {
      cerca.disconnect()
      aLaVista.disconnect()
    }
  }, [fase, reproducir])

  // Ya andando: si el recuadro sale de la pantalla se detiene, y al volver sigue donde iba
  useEffect(() => {
    const el = escena.current
    if (!el || fase !== 'animando') return
    const io = new IntersectionObserver(([e]) => {
      enPantalla.current = Boolean(e?.isIntersecting)
      if (!e?.isIntersecting) detener()
      else if (dibujo.current && !pausadaRef.current && !cuadro.current) seguir(dibujo.current, reducirMovimiento)
    })
    io.observe(el)
    return () => io.disconnect()
  }, [fase, detener, seguir, reducirMovimiento])

  // Si cambia el tamaño en plena animación (girar el celular), el lienzo se vuelve a medir
  useEffect(() => {
    const el = escena.current
    if (!el) return
    const ro = new ResizeObserver(() => dibujo.current?.medir())
    ro.observe(el)
    return () => {
      ro.disconnect()
      cancelAnimationFrame(cuadro.current)
    }
  }, [])

  // Solo para revisar en desarrollo: window.__mapa.cuadro(5) dibuja el segundo 5
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const w = window as unknown as { __mapa?: unknown }
    w.__mapa = {
      cuadro: async (t: number, repetida = false) => {
        const d = await preparar()
        detener()
        setFase('animando')
        d?.medir()
        d?.dibujar(t, repetida)
      },
      reproducir,
    }
  }, [preparar, reproducir, detener])

  const mostrandoFoto = fase === 'final' || fase === 'sinMapa'

  return (
    <div ref={escena} className={styles.escena} data-fase={fase}>
      <canvas ref={lienzo} className={styles.lienzo} aria-hidden="true" />
      <div className={styles.capaRotulos} aria-hidden="true">
        {ROTULOS.map((r) => (
          <span key={r.id} data-rotulo={r.id} className={styles.rotulo}>
            {r.texto}
          </span>
        ))}
        <div ref={punto} className={styles.punto}>
          <svg viewBox="0 0 24 32">
            <path d="M12 31C12 31 2 18.6 2 11a10 10 0 0 1 20 0c0 7.6-10 20-10 20z" />
            <circle cx="12" cy="11" r="3.6" />
          </svg>
        </div>
        <span data-rotulo="gualmatan" className={styles.pueblo}>
          Gualmatán
        </span>
        <div ref={anillo} className={styles.anillo} />
      </div>
      {/* El recorrido, en palabras, para quien no lo ve */}
      {fase === 'animando' && <p className="sr-only">Del mundo a América, Colombia, Nariño y Gualmatán.</p>}

      <div
        ref={capaFinal}
        className={styles.final}
        style={mostrandoFoto ? { clipPath: 'none', visibility: 'visible' } : undefined}
      >
        {final}
      </div>

      {fase === 'animando' && !reducirMovimiento && (
        <button
          type="button"
          className={styles.pausa}
          onClick={alternarPausa}
          aria-pressed={pausada}
          aria-label="Pausar la animación del mapa"
          title={pausada ? 'Seguir la animación' : 'Pausar la animación'}
        >
          <span aria-hidden="true">{pausada ? '▶' : '❚❚'}</span>
        </button>
      )}

      {reducirMovimiento && fase === 'final' && (
        <button type="button" className={styles.otraVez} onClick={() => void reproducir(true)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" />
          </svg>
          Ver dónde queda
        </button>
      )}
    </div>
  )
}
