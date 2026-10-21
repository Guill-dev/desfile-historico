import { useCallback, useEffect, useRef, useState } from 'react'
import type { Dispositivo, EventoClic } from '@/estadisticas/tipos'
import { buscarCamino } from '@/estadisticas/selector'
import { nombreRuta, numero } from '@/estadisticas/nombres'
import styles from './MapaClics.module.css'

interface Props {
  ruta: string
  clics: EventoClic[]
  dispositivo: Dispositivo
}

/** Tamaño de la "pantalla" en la que se muestra la página, según el aparato */
const PANTALLAS: Record<Dispositivo, { ancho: number; alto: number }> = {
  movil: { ancho: 390, alto: 760 },
  tablet: { ancho: 820, alto: 900 },
  escritorio: { ancho: 1280, alto: 800 },
}

const ID_CAPA = 'mapa-clics-capa'

/**
 * Mapa de clics: la página real dentro de un marco (iframe), con un punto rojo por cada toque.
 * Cada toque se guardó con el "camino" del elemento, así que el punto cae sobre el mismo botón
 * aunque la pantalla de quien tocó fuera de otro tamaño. Dentro del marco los enlaces no responden.
 */
export default function MapaClics({ ruta, clics, dispositivo }: Props) {
  const marco = useRef<HTMLIFrameElement>(null)
  const contenedor = useRef<HTMLDivElement>(null)
  const [escala, setEscala] = useState(1)
  const [listo, setListo] = useState(false)
  const [ubicados, setUbicados] = useState(0)
  const { ancho, alto } = PANTALLAS[dispositivo]

  // La página se achica para caber en el panel
  useEffect(() => {
    const el = contenedor.current
    if (!el) return
    const observador = new ResizeObserver(([entrada]) => setEscala(Math.min(1, entrada.contentRect.width / ancho)))
    observador.observe(el)
    return () => observador.disconnect()
  }, [ancho])

  const dibujar = useCallback(() => {
    const ventana = marco.current?.contentWindow
    const doc = marco.current?.contentDocument
    if (!ventana || !doc?.body) return
    doc.querySelectorAll(`.${ID_CAPA}`).forEach((capa) => capa.remove())

    const capa = (fija: boolean) => {
      const el = doc.createElement('div')
      el.className = ID_CAPA
      Object.assign(el.style, {
        position: fija ? 'fixed' : 'absolute',
        inset: '0 auto auto 0',
        width: fija ? '100%' : `${doc.documentElement.scrollWidth}px`,
        height: fija ? '100%' : `${doc.documentElement.scrollHeight}px`,
        pointerEvents: 'none',
        zIndex: '2147483647',
      })
      doc.body.append(el)
      return el
    }
    const enDocumento = capa(false)
    const enPantalla = capa(true)

    // Los puntos se ven siempre de unos 22 px en el panel, aunque la página esté achicada
    const tam = Math.round(22 / Math.max(escala, 0.25))
    let cuenta = 0
    for (const clic of clics) {
      const el = buscarCamino(doc, clic.datos.camino)
      if (!el) continue
      const caja = el.getBoundingClientRect()
      if (caja.width === 0 && caja.height === 0) continue // oculto (p. ej. dentro del menú cerrado)
      // Lo que está en la barra fija se marca sobre la pantalla, no sobre el documento
      let fijo = false
      for (let a: Element | null = el; a && !fijo; a = a.parentElement) fijo = ventana.getComputedStyle(a).position === 'fixed'
      const x = caja.left + clic.datos.ox * caja.width + (fijo ? 0 : ventana.scrollX)
      const y = caja.top + clic.datos.oy * caja.height + (fijo ? 0 : ventana.scrollY)
      const punto = doc.createElement('span')
      Object.assign(punto.style, {
        position: 'absolute',
        left: `${x - tam / 2}px`,
        top: `${y - tam / 2}px`,
        width: `${tam}px`,
        height: `${tam}px`,
        borderRadius: '50%',
        background: 'rgb(218 18 26 / 0.4)',
        boxShadow: `0 0 0 ${Math.max(2, Math.round(tam / 11))}px rgb(255 255 255 / 0.6)`,
      })
      ;(fijo ? enPantalla : enDocumento).append(punto)
      cuenta++
    }
    setUbicados(cuenta)
  }, [clics, escala])

  // El marco vuelve a dibujar cuando la página cambia de alto: siempre con los clics más recientes
  const dibujarActual = useRef(dibujar)
  useEffect(() => {
    dibujarActual.current = dibujar
  }, [dibujar])

  // Cuando la página del marco termina de armarse: quitar el video pesado, bloquear los enlaces y dibujar
  const alCargar = useCallback(() => {
    const doc = marco.current?.contentDocument
    const ventana = marco.current?.contentWindow
    if (!doc || !ventana) return
    let intentos = 0
    const esperar = () => {
      const armada = doc.querySelector('main')?.children.length && !doc.querySelector('main .cargando')
      if (!armada && intentos++ < 40) {
        ventana.setTimeout(esperar, 200)
        return
      }
      const estilo = doc.createElement('style')
      estilo.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }'
      doc.head.append(estilo)
      doc.querySelectorAll('video').forEach((video) => {
        video.pause()
        video.removeAttribute('src')
        video.load()
      })
      doc.addEventListener('click', (e) => e.preventDefault(), true)
      doc.addEventListener('submit', (e) => e.preventDefault(), true)
      // Si la página cambia de alto (fotos que cargan, apariciones), se vuelven a ubicar los puntos
      let pendiente = 0
      const { ResizeObserver: Observador } = ventana as Window & typeof globalThis
      new Observador(() => {
        ventana.clearTimeout(pendiente)
        pendiente = ventana.setTimeout(() => dibujarActual.current(), 250)
      }).observe(doc.body)
      setListo(true)
    }
    esperar()
  }, [])

  useEffect(() => {
    if (listo) dibujar()
  }, [listo, dibujar])

  const sinUbicar = clics.length - ubicados

  return (
    <div className={styles.mapa}>
      <p className={styles.resumen}>
        {clics.length === 0
          ? 'Aún no hay toques en esta página con este tipo de pantalla.'
          : `${numero(ubicados)} de ${numero(clics.length)} toques ubicados.`}
        {listo && sinUbicar > 0 && ` ${numero(sinUbicar)} fueron en algo que ya no está o no se ve (menús cerrados, el visor de fotos o datos de ejemplo).`}
      </p>

      <div ref={contenedor} className={styles.contenedor}>
        <div className={styles.marco} style={{ width: ancho * escala, height: alto * escala }}>
          <iframe
            key={`${ruta}-${dispositivo}`}
            ref={marco}
            src={ruta}
            title={`Página «${nombreRuta(ruta)}» con los toques marcados`}
            tabIndex={-1}
            onLoad={() => {
              setListo(false)
              alCargar()
            }}
            style={{ width: ancho, height: alto, transform: `scale(${escala})` }}
          />
        </div>
      </div>
      <p className={styles.ayuda}>Desliza dentro del marco para recorrer la página. Donde los puntos se juntan, el rojo es más intenso.</p>
    </div>
  )
}
