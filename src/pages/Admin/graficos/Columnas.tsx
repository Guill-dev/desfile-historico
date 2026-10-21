import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { numero } from '@/estadisticas/nombres'
import styles from './Columnas.module.css'

export interface Columna {
  etiqueta: string
  valor: number
}

interface Props {
  columnas: Columna[]
  /** Qué se cuenta, para el aviso flotante y lectores de pantalla: "visitas" */
  unidad: string
  /** Descripción del gráfico para lectores de pantalla */
  nombre: string
}

/** Escala "bonita" del eje: 1, 2 o 5 por una potencia de 10 */
function pasoBonito(maximo: number): number {
  if (maximo <= 0) return 1
  const bruto = maximo / 4
  const potencia = 10 ** Math.floor(Math.log10(bruto))
  const base = bruto / potencia
  return (base <= 1 ? 1 : base <= 2 ? 2 : base <= 5 ? 5 : 10) * Math.max(1, potencia)
}

/**
 * Gráfico de columnas de una sola serie (visitas por día, por hora…).
 * Pasar el mouse o usar las flechas del teclado muestra el valor de cada columna.
 */
export default function Columnas({ columnas, unidad, nombre }: Props) {
  const [activa, setActiva] = useState<number | null>(null)
  const grafico = useRef<HTMLElement>(null)
  const [ancho, setAncho] = useState(800)

  // El gráfico mide su ancho para decidir cuántas fechas caben abajo sin encimarse
  useEffect(() => {
    const el = grafico.current
    if (!el) return
    const observador = new ResizeObserver(([entrada]) => setAncho(entrada.contentRect.width))
    observador.observe(el)
    return () => observador.disconnect()
  }, [])
  const maximo = Math.max(0, ...columnas.map((c) => c.valor))
  const paso = Math.max(1, pasoBonito(maximo))
  const tope = Math.max(paso, Math.ceil(maximo / paso) * paso)
  const marcas = Array.from({ length: Math.round(tope / paso) + 1 }, (_, i) => i * paso)
  // Una fecha cada ~90 px como mínimo, para que no se encimen
  const cadaCuantas = Math.max(1, Math.ceil(columnas.length / Math.max(2, Math.floor(ancho / 90))))

  const alTeclear = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const desde = activa ?? (e.key === 'ArrowRight' ? -1 : columnas.length)
    setActiva(Math.min(columnas.length - 1, Math.max(0, desde + (e.key === 'ArrowRight' ? 1 : -1))))
  }

  const columnaActiva = activa !== null ? columnas[activa] : undefined

  return (
    <figure ref={grafico} className={styles.grafico}>
      <div className={styles.cuerpo}>
        <ol className={styles.eje} aria-hidden="true">
          {marcas.map((m) => (
            <li key={m} style={{ bottom: `${(m / tope) * 100}%` }}>
              {numero(m)}
            </li>
          ))}
        </ol>

        <div
          className={styles.area}
          tabIndex={0}
          role="group"
          aria-label={`${nombre}. Usa las flechas para recorrer los valores.`}
          onKeyDown={alTeclear}
          onPointerLeave={() => setActiva(null)}
          onBlur={() => setActiva(null)}
          style={{ gridTemplateColumns: `repeat(${columnas.length}, minmax(0, 1fr))` }}
        >
          {marcas.map((m) => (
            <span key={m} className={styles.guia} style={{ bottom: `${(m / tope) * 100}%` }} aria-hidden="true" />
          ))}
          {columnas.map((c, i) => (
            <div key={i} className={styles.franja} data-activa={i === activa || undefined} onPointerEnter={() => setActiva(i)}>
              <span className={styles.barra} style={{ height: `${(c.valor / tope) * 100}%` }} />
            </div>
          ))}

          {columnaActiva && activa !== null && (
            <div
              className={styles.aviso}
              style={{
                left: `${((activa + 0.5) / columnas.length) * 100}%`,
                bottom: `${(columnaActiva.valor / tope) * 100}%`,
                // En los bordes, el aviso se corre hacia adentro para no salirse del gráfico
                translate: activa < columnas.length * 0.15 ? '-15% 0' : activa > columnas.length * 0.85 ? '-85% 0' : '-50% 0',
              }}
              role="status"
            >
              <b>{numero(columnaActiva.valor)}</b> {unidad}
              <span>{columnaActiva.etiqueta}</span>
            </div>
          )}
        </div>
      </div>

      <ol className={styles.fechas} aria-hidden="true" style={{ gridTemplateColumns: `repeat(${columnas.length}, minmax(0, 1fr))` }}>
        {columnas.map((c, i) => (
          <li key={i}>{i % cadaCuantas === 0 ? c.etiqueta.replace('Semana del ', '') : ''}</li>
        ))}
      </ol>
    </figure>
  )
}
