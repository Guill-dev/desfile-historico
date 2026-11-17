import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from 'react'
import { Link } from 'react-router'
import type { Objeto } from '@/types/contenido'
import { cx } from '@/utils/cx'
import { tieneArchivo } from '@/utils/media'
import { useInView } from '@/hooks/useInView'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import ModelViewer from '@/components/media/ModelViewer'
import Media from '@/components/media/Media'
import Boton from '@/components/ui/Boton'
import escudo from '@/assets/escudo-gualmatan-oro.webp'
import styles from './LibroColeccion.module.css'

/** Cuántas piezas van en cada página */
const POR_PAGINA = 2
/** Lo que tarda una hoja en pasar (milisegundos) */
const GIRO_MS = 950
/** Al llegar: lo que tarda el libro cerrado en enderezarse y cuadrarse en el centro… */
const CUADRA_MS = 1300
/** …y lo que tarda la tapa en abrirse */
const ABRE_MS = 1600

type Pagina =
  | { tipo: 'guarda' }
  | { tipo: 'portada' }
  | { tipo: 'piezas'; folio: number; piezas: Objeto[] }
  | { tipo: 'final' }
  | { tipo: 'blanca' }
  | { tipo: 'contraguarda' }

type Lado = 'izq' | 'der' | 'sola'

/**
 * cerrado (ladeado, antes de llegar) → cuadrado (cerrado, de frente y en el centro) → abriendo (la tapa gira) →
 * abierto. Desde la primera hoja, "atrás" lo cierra (cerrando → cuadrado) para volver a ver la tapa.
 */
type Fase = 'cerrado' | 'cuadrado' | 'abriendo' | 'abierto' | 'cerrando'

/**
 * Las páginas del libro.
 * Computador (dos a la vista): guarda (el revés de la tapa) | portada · piezas de 2 en 2 · cierre | contraguarda.
 * Si hace falta, una página en blanco antes del cierre, para que todo quede en pares.
 * Celular (una a la vista): portada · piezas · cierre.
 */
function armarPaginas(objetos: Objeto[], doble: boolean): Pagina[] {
  const piezas: Pagina[] = []
  for (let i = 0; i < objetos.length; i += POR_PAGINA) {
    piezas.push({ tipo: 'piezas', folio: piezas.length + 1, piezas: objetos.slice(i, i + POR_PAGINA) })
  }
  if (!doble) return [{ tipo: 'portada' }, ...piezas, { tipo: 'final' }]
  const paginas: Pagina[] = [{ tipo: 'guarda' }, { tipo: 'portada' }, ...piezas]
  if (paginas.length % 2 === 1) paginas.push({ tipo: 'blanca' })
  paginas.push({ tipo: 'final' }, { tipo: 'contraguarda' })
  return paginas
}

/** Fotos del momento de los modelos 3D que se ven, para la hoja que gira (que no lleva modelos vivos) */
function capturar(raiz: HTMLElement | null): Record<string, string> {
  const fotos: Record<string, string> = {}
  raiz?.querySelectorAll<HTMLElement>('[data-pieza]').forEach((figura) => {
    const visor = figura.querySelector('model-viewer') as
      (HTMLElement & { loaded?: boolean; toDataURL?: () => string }) | null
    try {
      if (visor?.loaded && visor.toDataURL) fotos[figura.dataset.pieza ?? ''] = visor.toDataURL()
    } catch {
      /* sin foto: la hoja muestra el papel */
    }
  })
  return fotos
}

interface Giro {
  /** 1: hacia adelante · -1: hacia atrás */
  hacia: 1 | -1
  desde: number
  fotos: Record<string, string>
}

interface Props {
  objetos: Objeto[]
  /** true: dos páginas a la vista (computador) · false: una (celular) */
  doble: boolean
  titulo: string
}

/**
 * LA COLECCIÓN COMO UN LIBRO ANTIGUO: tapa de cuero gastado con filetes dorados, lomo con nervios y hojas
 * amarillentas, con 2 piezas por página (sus modelos 3D girando).
 * Al llegar a la sección, el libro está cerrado y ladeado; se endereza, se cuadra en el centro y la tapa se abre.
 * Después, la esquina de la hoja se levanta para invitar a seguir. Las hojas pasan de verdad, girando sobre el
 * lomo: con las flechas, tocando la esquina, deslizando el dedo o con ← → del teclado.
 * Mientras una hoja gira, sus piezas son fotos del momento (no modelos vivos): así no se traba.
 */
export default function LibroColeccion({ objetos, doble, titulo }: Props) {
  const reducirMovimiento = usePrefersReducedMotion()
  const paginas = armarPaginas(objetos, doble)
  const total = doble ? Math.ceil(paginas.length / 2) : paginas.length
  const [vista, setVista] = useState(0)
  const [giro, setGiro] = useState<Giro | null>(null)
  const [fase, setFase] = useState<Fase>(reducirMovimiento ? 'abierto' : 'cerrado')
  /** Ya se abrió una vez: desde ahí se ven las flechas y la tapa cuenta como una página más */
  const [listo, setListo] = useState(reducirMovimiento)
  const [escena, enVista] = useInView<HTMLDivElement>({ threshold: 0.35, rootMargin: '0px' })
  const hojas = useRef<HTMLDivElement>(null)
  const toque = useRef<{ x: number; y: number; arrastro: boolean } | null>(null)

  // Al llegar: se cuadra en el centro y se abre la tapa (la primera vez)
  useEffect(() => {
    if (!enVista) return
    const relojes = [
      window.setTimeout(() => setFase((f) => (f === 'cerrado' ? 'cuadrado' : f)), 80),
      window.setTimeout(() => setFase((f) => (f === 'cuadrado' ? 'abriendo' : f)), 80 + CUADRA_MS),
    ]
    return () => relojes.forEach(clearTimeout)
  }, [enVista])

  // Cuando la tapa terminó de abrirse (o de cerrarse)
  useEffect(() => {
    if (fase !== 'abriendo' && fase !== 'cerrando') return
    const t = window.setTimeout(
      () => {
        if (fase === 'abriendo') {
          setFase('abierto')
          setListo(true)
        } else setFase('cuadrado')
      },
      reducirMovimiento ? 0 : ABRE_MS,
    )
    return () => clearTimeout(t)
  }, [fase, reducirMovimiento])

  const abierto = fase === 'abierto'
  const cerradoListo = listo && (fase === 'cuadrado' || fase === 'cerrando')

  const ir = (hacia: 1 | -1) => {
    if (giro) return
    // Cerrado: "adelante" abre la tapa
    if (fase === 'cuadrado') {
      if (hacia === 1) setFase('abriendo')
      return
    }
    if (!abierto) return
    const destino = vista + hacia
    // Desde la primera hoja, "atrás" cierra el libro (para volver a ver la tapa)
    if (destino < 0) {
      setFase('cerrando')
      return
    }
    if (destino >= total) return
    if (reducirMovimiento) {
      setVista(destino)
      return
    }
    setGiro({ hacia, desde: vista, fotos: capturar(hojas.current) })
  }

  // Cuando la hoja terminó de pasar, queda la nueva página (con un reloj y no con el fin de la animación:
  // así nunca se queda trabada, aunque el navegador no esté dibujando, p. ej. con la pestaña escondida)
  useEffect(() => {
    if (!giro) return
    const t = window.setTimeout(() => {
      setVista(giro.desde + giro.hacia)
      setGiro(null)
    }, GIRO_MS)
    return () => clearTimeout(t)
  }, [giro])

  // Deslizar el dedo (o arrastrar el mouse) hacia un lado pasa la página
  const alBajar = (e: PointerEvent) => {
    toque.current = { x: e.clientX, y: e.clientY, arrastro: false }
  }
  const alSubir = (e: PointerEvent) => {
    const t = toque.current
    if (!t) return
    const dx = e.clientX - t.x
    const dy = e.clientY - t.y
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      t.arrastro = true
      ir(dx < 0 ? 1 : -1)
    }
  }
  // Si fue un deslizamiento, no se abre la ficha de la pieza que quedó bajo el dedo
  const alHacerClic = (e: MouseEvent) => {
    if (toque.current?.arrastro) {
      e.preventDefault()
      e.stopPropagation()
    }
    toque.current = null
  }

  const pagina = (i: number): Pagina => paginas[i] ?? { tipo: 'blanca' }
  const izq = (v: number) => pagina(2 * v)
  const der = (v: number) => pagina(2 * v + 1)
  const n = (p: Pagina) => paginas.indexOf(p)

  // Lo que se ve debajo mientras gira una hoja (y lo que se ve cuando no gira)
  let base: { pagina: Pagina; lado: Lado }[]
  let hoja: { frente: Pagina; reverso: Pagina | null; ladoFrente: Lado; ladoReverso: Lado } | null = null

  if (doble) {
    if (!giro)
      base = [
        { pagina: izq(vista), lado: 'izq' },
        { pagina: der(vista), lado: 'der' },
      ]
    else if (giro.hacia === 1) {
      base = [
        { pagina: izq(giro.desde), lado: 'izq' },
        { pagina: der(giro.desde + 1), lado: 'der' },
      ]
      hoja = { frente: der(giro.desde), reverso: izq(giro.desde + 1), ladoFrente: 'der', ladoReverso: 'izq' }
    } else {
      base = [
        { pagina: izq(giro.desde - 1), lado: 'izq' },
        { pagina: der(giro.desde), lado: 'der' },
      ]
      hoja = { frente: izq(giro.desde), reverso: der(giro.desde - 1), ladoFrente: 'izq', ladoReverso: 'der' }
    }
  } else if (!giro) base = [{ pagina: pagina(vista), lado: 'sola' }]
  else if (giro.hacia === 1) {
    base = [{ pagina: pagina(giro.desde + 1), lado: 'sola' }]
    hoja = { frente: pagina(giro.desde), reverso: null, ladoFrente: 'sola', ladoReverso: 'sola' }
  } else {
    base = [{ pagina: pagina(giro.desde), lado: 'sola' }]
    hoja = { frente: pagina(giro.desde - 1), reverso: null, ladoFrente: 'sola', ladoReverso: 'sola' }
  }

  const hayMas = vista < total - 1
  const comun = { titulo, total: objetos.length }

  return (
    <div ref={escena} className={styles.contenedor}>
      <div className={styles.escena}>
        <div
          className={cx(styles.libro, doble ? styles.doble : styles.sencillo, styles[fase])}
          style={
            {
              '--giro': `${GIRO_MS}ms`,
              '--cuadra': `${CUADRA_MS}ms`,
              '--abre': `${ABRE_MS}ms`,
            } as CSSProperties
          }
          onPointerDown={alBajar}
          onPointerUp={alSubir}
          onClickCapture={alHacerClic}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') ir(1)
            if (e.key === 'ArrowLeft') ir(-1)
          }}
        >
          {/* Las hojas */}
          <div ref={hojas} className={styles.hojas} inert={!abierto}>
            {base.map(({ pagina: p, lado }) => (
              <div key={lado} className={cx(styles.ranura, styles[`ranura-${lado}`])}>
                <PaginaLibro key={n(p)} pagina={p} lado={lado} {...comun} vivo={abierto} />
              </div>
            ))}

            {hoja && giro && (
              <div
                className={cx(
                  styles.hoja,
                  doble ? (giro.hacia === 1 ? styles.hojaDerecha : styles.hojaIzquierda) : styles.hojaSola,
                  giro.hacia === 1 ? styles.adelante : styles.atras,
                )}
                aria-hidden="true"
              >
                <div className={styles.cara}>
                  <PaginaLibro pagina={hoja.frente} lado={hoja.ladoFrente} {...comun} fotos={giro.fotos} />
                </div>
                <div className={cx(styles.cara, styles.reverso)}>
                  {hoja.reverso ? (
                    <PaginaLibro pagina={hoja.reverso} lado={hoja.ladoReverso} {...comun} />
                  ) : (
                    <div className={cx(styles.papel, styles.sola)} />
                  )}
                </div>
              </div>
            )}

            {/* La esquina doblada: invita a pasar la página */}
            {abierto && hayMas && !giro && (
              <button type="button" className={styles.esquina} onClick={() => ir(1)} aria-label="Pasar la página" />
            )}
          </div>

          {/* El libro cerrado: el bloque de hojas (lomo y cantos) y la tapa, que se abre (y se cierra). Siempre
              están: con el libro abierto, la tapa queda a la izquierda, escondida debajo de la guarda */}
          <>
            <div className={styles.bloque} aria-hidden="true">
              <span className={styles.lomo} />
              <span className={styles.cantoDerecho} />
              <span className={styles.cantoInferior} />
              <span className={styles.cantoSuperior} />
              <span className={styles.contratapa} />
            </div>
            {/* Cerrado, tocar la tapa la abre (también la flecha → o el teclado) */}
            <div className={styles.tapa} aria-hidden="true" onClick={() => fase === 'cuadrado' && ir(1)}>
              <div className={styles.tapaFrente}>
                <img src={escudo} alt="" className={styles.tapaEscudo} draggable={false} />
                <span className={styles.tapaTitulo}>{titulo}</span>
                <span className={styles.tapaFilete} />
                <span className={styles.tapaSubtitulo}>Desfile Histórico de Gualmatán</span>
                <span className={styles.tapaAdorno} />
              </div>
              <div className={styles.tapaDentro}>
                <Guarda />
              </div>
            </div>
          </>
        </div>
      </div>

      <div className={cx(styles.controles, listo && styles.controlesListos)}>
        <button
          type="button"
          className={styles.flecha}
          onClick={() => ir(-1)}
          disabled={!abierto}
          aria-label={vista === 0 ? 'Cerrar el libro' : 'Página anterior'}
        >
          ←
        </button>
        <span className={cx('mono', styles.cuenta)} aria-live="polite">
          {cerradoListo ? 'Tapa' : `${doble ? 'Hojas' : 'Página'} ${vista + 1} de ${total}`}
        </span>
        <button
          type="button"
          className={styles.flecha}
          onClick={() => ir(1)}
          disabled={abierto ? !hayMas : fase !== 'cuadrado'}
          aria-label={abierto ? 'Página siguiente' : 'Abrir el libro'}
        >
          →
        </button>
      </div>
    </div>
  )
}

/** El revés de la tapa: papel de guarda con la etiqueta del dueño del libro (Ex libris) */
function Guarda() {
  return (
    <div className={styles.guarda}>
      <span className={styles.exLibris}>
        <span className={styles.exLibrisTitulo}>Ex libris</span>
        <span className={styles.exLibrisAdorno} />
        <span className={styles.exLibrisDueno}>Desfile Histórico de Gualmatán</span>
      </span>
    </div>
  )
}

interface PaginaProps {
  pagina: Pagina
  lado: Lado
  titulo: string
  /** Cuántas piezas hay en total */
  total: number
  /** true: con los modelos 3D vivos · false: la hoja que gira (fotos del momento o solo el papel) */
  vivo?: boolean
  fotos?: Record<string, string>
}

function PaginaLibro({ pagina, lado, titulo, total, vivo = false, fotos = {} }: PaginaProps) {
  if (pagina.tipo === 'guarda' || pagina.tipo === 'contraguarda') {
    return (
      <div className={cx(styles.papel, styles[lado], styles.papelGuarda)}>{pagina.tipo === 'guarda' && <Guarda />}</div>
    )
  }

  return (
    <div className={cx(styles.papel, styles[lado])}>
      {pagina.tipo === 'portada' && (
        <div className={styles.portada}>
          <span className={styles.adorno} aria-hidden="true" />
          <span className={cx('mono', styles.antetitulo)}>Catálogo</span>
          <span className={styles.tituloLibro}>{titulo}</span>
          <span className={cx('mono', styles.antetitulo)}>Desfile Histórico de Gualmatán</span>
          <span className={styles.cantidad}>
            {total} {total === 1 ? 'pieza' : 'piezas'}
          </span>
          <span className={styles.adorno} aria-hidden="true" />
          <span className={styles.pista}>
            pasa la página <span className={styles.pistaFlecha}>→</span>
          </span>
        </div>
      )}

      {pagina.tipo === 'piezas' && (
        <div className={styles.contenido}>
          <span className={cx('mono', styles.cabecera)}>
            {lado === 'der' ? 'Desfile Histórico de Gualmatán' : titulo}
          </span>
          <div className={styles.figuras}>
            {pagina.piezas.map((o) => (
              <Figura key={o.id} objeto={o} vivo={vivo} foto={fotos[o.id]} />
            ))}
          </div>
          <span className={cx('mono', styles.folio)}>{pagina.folio}</span>
        </div>
      )}

      {pagina.tipo === 'final' && (
        <div className={styles.portada}>
          <span className={styles.adorno} aria-hidden="true" />
          <span className={styles.pista}>Fin del catálogo</span>
          {vivo && <Boton to="/objetos">Ver las {total} piezas →</Boton>}
        </div>
      )}
    </div>
  )
}

/** Una pieza en su página: el modelo 3D girando sobre una lámina, y debajo su número y nombre */
function Figura({ objeto, vivo, foto }: { objeto: Objeto; vivo: boolean; foto?: string }) {
  const modelo = objeto.modelo3d
  const conModelo = tieneArchivo(modelo)
  const pie = (
    <span className={styles.pie}>
      <span className={cx('mono', styles.numero)}>Nº {String(objeto.numero).padStart(2, '0')}</span>
      <span className={styles.nombre}>{objeto.nombre}</span>
    </span>
  )

  if (!vivo) {
    return (
      <div className={styles.figura} data-pieza={objeto.id}>
        <span className={styles.lamina}>{foto && <img src={foto} alt="" className={styles.modelo} />}</span>
        {pie}
      </div>
    )
  }

  return (
    <Link to={`/objetos/${objeto.id}`} className={styles.figura} data-pieza={objeto.id}>
      <span className={styles.lamina}>
        {conModelo ? (
          <ModelViewer
            src={objeto.modeloTarjeta ?? modelo.src}
            poster={modelo.poster}
            alt={modelo.alt}
            ratio="auto"
            interactivo={false}
            className={styles.modelo}
          />
        ) : (
          <Media media={objeto.imagenes[0]} ratio="auto" className={styles.foto} />
        )}
      </span>
      {pie}
    </Link>
  )
}
