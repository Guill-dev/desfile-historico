import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { Link } from 'react-router'
import type { Creador } from '@/types/contenido'
import { capitulo, rotulo } from '@/data/sitio'
import { creadores } from '@/data/creadores'
import { cx } from '@/utils/cx'
import { tieneArchivo } from '@/utils/media'
import { useInView } from '@/hooks/useInView'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import SectionHeader from '@/components/ui/SectionHeader'
import Boton from '@/components/ui/Boton'
import styles from './Creadores.module.css'

const cap = capitulo('creadores')

/** Cuántas personas salen en el carrusel del inicio (las demás, en /creadores) */
const EN_EL_CARRUSEL = 9
/** Cada cuánto pasa sola a la siguiente persona (si nadie está tocando el carrusel) */
const CADA_MS = 5000

/** Aún sin nombre: "[Nombre del creador]" */
const pendiente = (c: Creador) => c.nombre.startsWith('[')

/** "Juan Pérez López" → "JL" (para las fotos que aún no están) */
function iniciales(nombre: string) {
  if (nombre.startsWith('[')) return '?'
  const palabras = nombre.split(/\s+/).filter((p) => /^[A-ZÁÉÍÓÚÑ]/.test(p) && p.length > 2)
  return (palabras[0]?.[0] ?? '') + (palabras.at(-1)?.[0] ?? '')
}

/**
 * QUIENES LO HICIERON POSIBLE, como la vitrina de "Artifacts" de PocketMuse (Figma Community), con el estilo
 * del resto del sitio: las fotos en un carrusel 3D — la persona del centro grande y de frente, las de los lados
 * inclinadas y más atrás — y, al lado, un panel de vidrio con quién es (rol, año, lo que hizo) y su ficha.
 * Pasa sola cada pocos segundos (se detiene mientras el mouse o el dedo están encima, fuera de la pantalla o con
 * "reducir movimiento"). Se mueve con las flechas, tocando una foto de los lados, deslizando o con ← →.
 */
export default function Creadores() {
  const personas = creadores.slice(0, EN_EL_CARRUSEL)
  const [activo, setActivo] = useState(0)
  const [quieto, setQuieto] = useState(false)
  const reducirMovimiento = usePrefersReducedMotion()
  const [ref, aLaVista] = useInView<HTMLDivElement>({ once: false, threshold: 0.3, rootMargin: '0px' })
  const toque = useRef<{ x: number; y: number } | null>(null)

  const total = personas.length
  const ir = (n: number) => setActivo(((n % total) + total) % total)
  const persona = personas[activo]

  // Pasa sola a la siguiente, mientras se ve y nadie la está tocando
  useEffect(() => {
    if (!aLaVista || quieto || reducirMovimiento || total < 2) return
    const t = window.setTimeout(() => setActivo((a) => (a + 1) % total), CADA_MS)
    return () => clearTimeout(t)
  }, [activo, aLaVista, quieto, reducirMovimiento, total])

  // Deslizar el dedo (o arrastrar el mouse) hacia un lado pasa a la persona siguiente o anterior
  const alBajar = (e: PointerEvent) => {
    toque.current = { x: e.clientX, y: e.clientY }
  }
  const alSubir = (e: PointerEvent) => {
    const t = toque.current
    toque.current = null
    if (!t) return
    const dx = e.clientX - t.x
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - t.y)) ir(activo + (dx < 0 ? 1 : -1))
  }
  const alTeclear = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') ir(activo + 1)
    if (e.key === 'ArrowLeft') ir(activo - 1)
  }

  return (
    <section id="creadores" className="tema-verde capitulo" aria-labelledby="creadores-titulo">
      <div className="contenedor">
        <SectionHeader
          id="creadores-titulo"
          kicker={rotulo(cap)}
          titulo={cap.encabezado}
          accion={
            creadores.length > EN_EL_CARRUSEL && <Boton to="/creadores">Ver los {creadores.length} creadores →</Boton>
          }
        />

        <div
          ref={ref}
          className={styles.vitrina}
          onMouseEnter={() => setQuieto(true)}
          onMouseLeave={() => setQuieto(false)}
          onFocus={() => setQuieto(true)}
          onBlur={() => setQuieto(false)}
        >
          {/* El carrusel 3D */}
          <div
            className={styles.carrusel}
            role="region"
            aria-roledescription="carrusel"
            aria-label="Fotos de quienes lo hicieron posible"
            tabIndex={0}
            onKeyDown={alTeclear}
            onPointerDown={alBajar}
            onPointerUp={alSubir}
            onPointerCancel={() => (toque.current = null)}
          >
            <div className={styles.escenario}>
              {personas.map((c, i) => {
                // Cuánto está del centro, por el camino más corto (el carrusel da la vuelta)
                let d = i - activo
                if (d > total / 2) d -= total
                if (d < -total / 2) d += total
                const lejos = Math.abs(d)
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={cx(styles.tarjeta, d === 0 && styles.centro, lejos > 2 && styles.escondida)}
                    style={{ '--d': d, '--lejos': lejos } as CSSProperties}
                    onClick={() => ir(i)}
                    tabIndex={-1}
                    aria-hidden={d !== 0}
                    aria-label={d === 0 ? undefined : `Ver a ${c.nombre}`}
                  >
                    <Retrato creador={c} />
                  </button>
                )
              })}
            </div>
            <p className={styles.nombreCentro} aria-hidden="true">
              {pendiente(persona) ? 'Por confirmar' : persona.nombre}
            </p>
          </div>

          {/* El panel de vidrio con quién es */}
          <article className={styles.panel} aria-live="polite">
            <span className={styles.chip}>
              {persona.rol} · {persona.periodo}
            </span>
            <h3 className={styles.panelNombre}>{pendiente(persona) ? 'Por confirmar' : persona.nombre}</h3>
            <p className={styles.texto}>{persona.descripcion}</p>
            <dl className={styles.datos}>
              <dt>Rol</dt>
              <dd>{persona.rol}</dd>
              <dt>Año</dt>
              <dd>{persona.periodo}</dd>
              <dt>Aporte</dt>
              <dd>{persona.aporte}</dd>
            </dl>
            <div className={styles.pie}>
              <Link to={`/creadores/${persona.id}`} className={styles.verFicha}>
                Ver su ficha →
              </Link>
              <span className={styles.cuenta}>
                {activo + 1} de {total}
              </span>
            </div>
          </article>

          {/* Flechas y puntitos (el de la persona del centro, alargado) */}
          <div className={styles.controles}>
            <button type="button" className={styles.flecha} onClick={() => ir(activo - 1)} aria-label="Persona anterior">
              ←
            </button>
            <div className={styles.puntos}>
              {personas.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  className={cx(styles.punto, i === activo && styles.puntoActivo)}
                  onClick={() => ir(i)}
                  aria-label={`Ver a ${pendiente(c) ? `la persona ${i + 1}` : c.nombre}`}
                  aria-current={i === activo || undefined}
                />
              ))}
            </div>
            <button type="button" className={styles.flecha} onClick={() => ir(activo + 1)} aria-label="Persona siguiente">
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

/** La foto de una persona en su tarjeta; si aún no hay foto, sus iniciales (o "?") */
function Retrato({ creador }: { creador: Creador }) {
  const { retrato } = creador
  if (tieneArchivo(retrato)) {
    return (
      <img
        src={retrato.miniatura ?? retrato.src}
        alt={retrato.alt}
        className={styles.foto}
        draggable={false}
        loading="lazy"
        decoding="async"
      />
    )
  }
  return (
    <span className={styles.sinFoto} aria-hidden="true">
      {iniciales(creador.nombre)}
    </span>
  )
}
