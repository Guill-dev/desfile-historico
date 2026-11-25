import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import type { Media as Recurso, Version } from '@/types/contenido'
import { capitulo, interludios, rotulo } from '@/data/sitio'
import { primerAnio, versiones } from '@/data/versiones'
import { cx } from '@/utils/cx'
import { barajar } from '@/utils/azar'
import { tieneArchivo } from '@/utils/media'
import { useInView } from '@/hooks/useInView'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import SectionHeader from '@/components/ui/SectionHeader'
import Interludio from '@/components/ui/Interludio'
import Boton from '@/components/ui/Boton'
import PausaMuestra from '@/components/ui/PausaMuestra'
import Media from '@/components/media/Media'
import styles from './Versiones.module.css'

const cap = capitulo('versiones')

/** Cuánto se queda cada año (con su foto) mientras la barra se llena hasta el siguiente */
const PASO_MS = 3500
/** Si alguien toca la regla, el recorrido solo se detiene; sigue cuando pasa este tiempo sin tocarla */
const ESPERA_TRAS_TOCAR_MS = 8000
/** Una foto que tarda más que esto en descargarse no se espera más */
const ESPERA_FOTO_MS = 1500

/** El año tiene fotos de verdad (no solo el recuadro de "pendiente") */
const conFotos = (v: Version) => v.galeria.length > 0 && tieneArchivo(v.galeria[0])

/** Los años de la regla, del más antiguo al más reciente */
const enOrden = [...versiones].sort((a, b) => a.anio - b.anio)

/**
 * Las marcas de la regla, repartidas a la misma distancia: el primer desfile (si no tiene fotos, solo se marca)
 * y cada año que tiene su edición. Así los años no se amontonan aunque falten muchos en el medio; esos tramos
 * (años que todavía no tienen fotos) se dibujan punteados.
 */
const marcas: { anio: number; version?: Version }[] = [
  ...(primerAnio < enOrden[0].anio ? [{ anio: primerAnio }] : []),
  ...enOrden.map((v) => ({ anio: v.anio, version: v })),
]
const ultima = Math.max(1, marcas.length - 1)
const lugar = (i: number) => i / ultima
/** Las marcas que se pueden elegir (las que tienen edición) */
const elegibles = marcas.flatMap((m, i) => (m.version ? [i] : []))
/** El recorrido automático: solo los años que tienen fotos, en orden */
const ciclo = marcas.flatMap((m, i) => (m.version && conFotos(m.version) ? [i] : []))

/** Al entrar: el primer año del recorrido (el más antiguo con fotos) */
const inicial = marcas[ciclo[0] ?? elegibles[elegibles.length - 1]].anio

/** Qué tan ancho se ve el recuadro de las fotos (el mismo máximo que .escenario en Versiones.module.css) */
const TAMANO = '(max-width: 767px) calc(100vw - 32px), 860px'

/**
 * LA BOLSA DE CADA AÑO: sus fotos barajadas. Cada vez que el año sale, se saca una; ninguna se repite hasta que
 * salieron todas las de ese año, y entonces se vuelve a barajar (sin empezar por la última que se vio).
 * Vive mientras dure la visita.
 */
const bolsas = new Map<number, number[]>()
const ultimas = new Map<number, number>()
function sacarFoto(v: Version): Recurso {
  if (!conFotos(v)) return v.portada
  let bolsa = bolsas.get(v.anio) ?? []
  if (bolsa.length === 0) {
    const ultimaVista = ultimas.get(v.anio)
    const todas = v.galeria.map((_, i) => i)
    bolsa = barajar(todas.length > 1 ? todas.filter((i) => i !== ultimaVista) : todas)
    // La que se acaba de ver también entra, pero al fondo: no sale enseguida otra vez
    if (todas.length > 1 && ultimaVista !== undefined) bolsa.unshift(ultimaVista)
  }
  const n = bolsa.pop() ?? 0
  bolsas.set(v.anio, bolsa)
  ultimas.set(v.anio, n)
  return v.galeria[n]
}

/** La miniatura (640 px) y la completa (hasta 1600 px): el navegador escoge según el tamaño y la pantalla */
const juego = (m: Recurso) => (m.miniatura && m.src ? `${m.miniatura} 640w, ${m.src} 1600w` : undefined)

/** Deja la foto descargada y lista antes de mostrarla (la misma versión que va a escoger la página) */
function precargar(m: Recurso): Promise<void> {
  if (!tieneArchivo(m)) return Promise.resolve()
  const img = new Image()
  const srcset = juego(m)
  if (srcset) {
    img.sizes = TAMANO
    img.srcset = srcset
  }
  img.src = m.miniatura ?? m.src
  return img.decode().catch(() => {})
}

/**
 * VIAJE EN EL TIEMPO: una regla de años, desde el primer desfile hasta hoy.
 * Sola, funciona como una barra de carga: va mostrando una foto de cada año (2022, 2023…) mientras la barra se
 * llena hasta el siguiente, y al llegar al final vuelve a empezar. Las fotos de cada año salen al azar y sin
 * repetirse hasta que salieron todas (ver sacarFoto).
 * También se maneja a mano: arrastrando el botón, tocando un año, con ← → o con las flechas. Al tocarla, el
 * recorrido se detiene y sigue solo 8 s después; con el botón de pausa se detiene del todo. Fuera de la pantalla
 * o con "reducir movimiento", no avanza solo.
 */
export default function Versiones() {
  const reducirMovimiento = usePrefersReducedMotion()
  const celular = useMediaQuery('(max-width: 767px)')
  const [vista, aLaVista] = useInView<HTMLDivElement>({ once: false, threshold: 0.25, rootMargin: '0px' })

  const [anio, setAnio] = useState(inicial)
  const [foto, setFoto] = useState<Recurso>(() => sacarFoto(marcas.find((m) => m.anio === inicial)?.version ?? versiones[0]))
  /** Cuántos pasos lleva el recorrido: cada paso vuelve a dibujar la barra que se llena */
  const [pasos, setPasos] = useState(0)
  const [pausado, setPausado] = useState(false)
  const [tocando, setTocando] = useState(false)
  /** Mientras se arrastra: dónde va el botón (0 a 1), siguiendo el dedo; al soltar se acomoda en el año */
  const [arrastre, setArrastre] = useState<number | null>(null)
  const riel = useRef<HTMLDivElement>(null)
  const reloj = useRef(0)

  const indice = marcas.findIndex((m) => m.anio === anio)
  const version = marcas[indice]?.version ?? versiones[0]
  const automatico = aLaVista && !pausado && !tocando && !reducirMovimiento && ciclo.length > 1 && arrastre === null

  // Hasta dónde se llena la barra en este paso: hasta el siguiente año del recorrido (o hasta el final de la regla)
  const k = ciclo.indexOf(indice)
  const meta = k >= 0 && k + 1 < ciclo.length ? lugar(ciclo[k + 1]) : 1

  // EL RECORRIDO: cada PASO_MS pasa al siguiente año (al terminar, vuelve al primero) con una foto nueva de su bolsa
  useEffect(() => {
    if (!automatico) return
    let vigente = true
    const siguiente = ciclo[(ciclo.indexOf(indice) + 1) % ciclo.length] ?? ciclo[0]
    const nueva = sacarFoto(marcas[siguiente].version ?? versiones[0])
    const lista = precargar(nueva)
    const t = window.setTimeout(async () => {
      await Promise.race([lista, new Promise((r) => setTimeout(r, ESPERA_FOTO_MS))])
      if (!vigente) return
      setAnio(marcas[siguiente].anio)
      setFoto(nueva)
      setPasos((p) => p + 1)
    }, PASO_MS)
    return () => {
      vigente = false
      clearTimeout(t)
    }
  }, [automatico, indice])

  useEffect(() => () => clearTimeout(reloj.current), [])

  /** Alguien tocó la regla: el recorrido se detiene y sigue solo después de un rato sin tocarla */
  const avisarToque = () => {
    setTocando(true)
    clearTimeout(reloj.current)
    reloj.current = window.setTimeout(() => setTocando(false), ESPERA_TRAS_TOCAR_MS)
  }

  /** Ir a un año (a mano) con una foto nueva de su bolsa */
  const elegir = (i: number) => {
    const m = marcas[i]
    if (!m?.version || m.anio === anio) return
    setAnio(m.anio)
    setFoto(sacarFoto(m.version))
  }

  /** La marca con edición más cercana a una posición de la regla (0 a 1) */
  const masCercana = (f: number) =>
    elegibles.reduce((mejor, i) => (Math.abs(lugar(i) - f) < Math.abs(lugar(mejor) - f) ? i : mejor), elegibles[0])

  const posicion = (e: PointerEvent) => {
    const caja = riel.current?.getBoundingClientRect()
    if (!caja || caja.width === 0) return 0
    return Math.min(1, Math.max(0, (e.clientX - caja.left) / caja.width))
  }
  const seguir = (e: PointerEvent) => {
    const f = posicion(e)
    setArrastre(f)
    elegir(masCercana(f))
  }
  const alBajar = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    avisarToque()
    seguir(e)
  }
  const alMover = (e: PointerEvent) => {
    if (arrastre !== null) seguir(e)
  }
  const alSoltar = () => {
    if (arrastre !== null) avisarToque()
    setArrastre(null)
  }

  /** Al año con edición anterior (-1) o siguiente (1) */
  const mover = (hacia: 1 | -1) => {
    avisarToque()
    const j = elegibles.indexOf(indice) + hacia
    if (j >= 0 && j < elegibles.length) elegir(elegibles[j])
  }
  const irA = (i: number) => {
    avisarToque()
    elegir(i)
  }
  const alTeclear = (e: KeyboardEvent) => {
    const teclas: Record<string, () => void> = {
      ArrowRight: () => mover(1),
      ArrowUp: () => mover(1),
      ArrowLeft: () => mover(-1),
      ArrowDown: () => mover(-1),
      Home: () => irA(elegibles[0]),
      End: () => irA(elegibles[elegibles.length - 1]),
    }
    if (!teclas[e.key]) return
    e.preventDefault()
    teclas[e.key]()
  }

  const fotos = conFotos(version)
  const mano = arrastre ?? lugar(indice)
  const ratio = celular ? '1 / 1' : '16 / 9'

  return (
    <section id="versiones" className="tema-papel capitulo" aria-labelledby="versiones-titulo">
      <div className="contenedor">
        <Interludio frase={interludios.antesDeVersiones} />

        <SectionHeader
          id="versiones-titulo"
          kicker={rotulo(cap)}
          titulo={cap.encabezado}
          accion={
            <>
              {ciclo.length > 1 && !reducirMovimiento && (
                <PausaMuestra pausada={pausado} onClick={() => setPausado((p) => !p)} que="años" />
              )}
              <Boton to="/versiones">Ver las {versiones.length} ediciones →</Boton>
            </>
          }
        />

        <div ref={vista}>
          {/* El año elegido, en grande: su foto (con fundido al cambiar) y el recuadro de vidrio */}
          <div className={styles.escenario}>
            {tieneArchivo(foto) ? (
              <FotoCambiante foto={foto} ratio={ratio} />
            ) : (
              <Media media={foto} ratio={ratio} className={styles.foto} />
            )}
            <div className={styles.info} aria-live="polite">
              <span className={cx('display', styles.anio)}>{version.anio}</span>
              <span className={styles.cuantas}>
                {fotos ? `${version.galeria.length} fotos` : 'Todavía no hay fotos de este año'}
              </span>
              <Boton to={`/versiones/${version.anio}`} variante="primario" className={styles.ver}>
                {fotos ? 'Ver la galería →' : 'Ver el año →'}
              </Boton>
            </div>
          </div>

          {/* La regla del tiempo */}
          <div className={styles.controles}>
            <button type="button" className={styles.flecha} onClick={() => mover(-1)} aria-label="Año anterior">
              ←
            </button>
            <div
              className={cx(styles.regla, arrastre !== null && styles.arrastrando)}
              role="slider"
              tabIndex={0}
              aria-label="Año del desfile"
              aria-valuemin={marcas[elegibles[0]].anio}
              aria-valuemax={marcas[elegibles[elegibles.length - 1]].anio}
              aria-valuenow={anio}
              onKeyDown={alTeclear}
              onPointerDown={alBajar}
              onPointerMove={alMover}
              onPointerUp={alSoltar}
              onPointerCancel={alSoltar}
            >
              <div ref={riel} className={styles.riel}>
                {/* Los tramos entre marca y marca: seguidos si son años juntos, punteados si faltan años; verdes
                    desde el primer año con fotos hasta el que se está viendo */}
                {marcas.slice(1).map((m, i) => (
                  <span
                    key={m.anio}
                    className={cx(
                      styles.tramo,
                      m.anio - marcas[i].anio > 1 && styles.faltan,
                      i + 1 <= indice && i >= (ciclo[0] ?? 0) && styles.recorrido,
                    )}
                    style={{ '--desde': lugar(i), '--hasta': lugar(i + 1) } as CSSProperties}
                    title={m.anio - marcas[i].anio > 1 ? `${marcas[i].anio + 1}–${m.anio - 1}: todavía sin fotos` : undefined}
                  />
                ))}
                {/* La barra que se llena hasta el siguiente año, como una barra de carga */}
                {automatico && meta > lugar(indice) && (
                  <span
                    key={pasos}
                    className={styles.cargando}
                    style={{ '--desde': lugar(indice), '--hasta': meta, '--paso': `${PASO_MS}ms` } as CSSProperties}
                    aria-hidden="true"
                  />
                )}
                {marcas.map((m, i) => (
                  <span
                    key={m.anio}
                    className={cx(
                      styles.marca,
                      !m.version && styles.sinEdicion,
                      i === indice && styles.elegida,
                      i === 0 && styles.primera,
                    )}
                    style={{ '--en': lugar(i) } as CSSProperties}
                  >
                    <span className={styles.etiqueta}>
                      {m.anio}
                      {!m.version && <small>primer desfile</small>}
                    </span>
                  </span>
                ))}
                <span className={styles.mano} style={{ '--en': mano } as CSSProperties} aria-hidden="true">
                  <span className={styles.burbuja}>{anio}</span>
                </span>
              </div>
            </div>
            <button type="button" className={styles.flecha} onClick={() => mover(1)} aria-label="Año siguiente">
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * La foto del año: cuando cambia, la nueva aparece con un fundido sobre la anterior (que se queda debajo hasta
 * que la nueva la tapa), así nunca se ve un hueco.
 */
function FotoCambiante({ foto, ratio }: { foto: Recurso; ratio: string }) {
  const [capas, setCapas] = useState<{ foto: Recurso; n: number }[]>([{ foto, n: 0 }])
  // Cuando llega otra foto: la de antes queda debajo y la nueva encima
  const arriba = capas[capas.length - 1]
  if (arriba.foto !== foto) setCapas([arriba, { foto, n: arriba.n + 1 }])

  return (
    <span className={styles.marco} style={{ aspectRatio: ratio }}>
      {capas.map((c, i) => (
        <img
          key={c.n}
          src={c.foto.miniatura ?? c.foto.src ?? undefined}
          srcSet={juego(c.foto)}
          sizes={TAMANO}
          alt={i === capas.length - 1 ? c.foto.alt : ''}
          decoding="async"
          className={cx(styles.capa, c.n > 0 && i === capas.length - 1 && styles.entra)}
        />
      ))}
    </span>
  )
}
