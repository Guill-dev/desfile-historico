import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import type { Dispositivo, Evento } from '@/estadisticas/tipos'
import { borrarLocales, leerEventos } from '@/estadisticas/almacen'
import { calcularEstadisticas, clicsDePagina, type Periodo, type ResumenClic } from '@/estadisticas/calcular'
import { cambiarNoMedir, noMedirEsteNavegador } from '@/estadisticas/rastreador'
import { tokenVigente } from '@/estadisticas/sesionAdmin'
import { duracion, nombreRuta, nombreSeccion, nombresDispositivo, numero, porcentaje } from '@/estadisticas/nombres'
import { cx } from '@/utils/cx'
import Marca from '@/components/marca/Marca'
import Columnas from './graficos/Columnas'
import BarrasLista from './graficos/BarrasLista'
import MapaClics from './MapaClics'
import styles from './Panel.module.css'

type Rango = 'hoy' | '7' | '30' | '90' | '365'

const RANGOS: { id: Rango; nombre: string }[] = [
  { id: 'hoy', nombre: 'Hoy' },
  { id: '7', nombre: '7 días' },
  { id: '30', nombre: '30 días' },
  { id: '90', nombre: '90 días' },
  { id: '365', nombre: '12 meses' },
]

function periodoDe(rango: Rango, ahora = new Date()): Periodo {
  const desde = new Date(ahora)
  desde.setHours(0, 0, 0, 0)
  if (rango !== 'hoy') desde.setDate(desde.getDate() - (Number(rango) - 1))
  return { desde, hasta: ahora }
}

const TIPOS_ELEMENTO: Record<string, string> = {
  a: 'Enlace',
  button: 'Botón',
  summary: 'Desplegable',
  label: 'Formulario',
  input: 'Formulario',
  select: 'Formulario',
}

const PANTALLAS: Dispositivo[] = ['escritorio', 'tablet', 'movil']

/** "https://www.facebook.com/x" → "↗ www.facebook.com"; "/pasos" → "→ /pasos" */
function destinoLegible(destino: string): string {
  try {
    return /^https?:/.test(destino) ? `↗ ${new URL(destino).hostname}` : `→ ${destino}`
  } catch {
    return destino
  }
}

interface Props {
  modo: 'local' | 'supabase'
  correo?: string
  onSalir?: () => void
}

interface Carga {
  eventos: Evento[]
  periodo: Periodo
  leido: Date
}

/** El panel de estadísticas: filtros arriba, y todo lo de abajo responde al mismo período. */
export default function Panel({ modo, correo, onSalir }: Props) {
  const [rango, setRango] = useState<Rango>('30')
  const [recarga, setRecarga] = useState(0)
  const [carga, setCarga] = useState<Carga | null>(null)
  const [cargando, setCargando] = useState(true)
  const [progreso, setProgreso] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ejemplo, setEjemplo] = useState<Evento[] | null>(null)
  const [noMedir, setNoMedir] = useState(noMedirEsteNavegador)
  const [paginaElegida, setPaginaElegida] = useState<string | null>(null)
  const [pantalla, setPantalla] = useState<Dispositivo | null>(null)
  const detalle = useRef<HTMLElement>(null)
  const salirActual = useRef(onSalir)

  useEffect(() => {
    salirActual.current = onSalir
  }, [onSalir])

  // Leer los eventos cada vez que cambia el período o se pulsa "Actualizar"
  useEffect(() => {
    let vigente = true
    const periodo = periodoDe(rango)
    const cargar = async () => {
      try {
        const token = modo === 'supabase' ? await tokenVigente() : null
        if (modo === 'supabase' && !token) {
          salirActual.current?.()
          return
        }
        const eventos = await leerEventos(periodo.desde, token, (leidos, total) => {
          if (vigente) setProgreso(`Leyendo ${numero(leidos)} de ${numero(total)} eventos…`)
        })
        if (!vigente) return
        setCarga({ eventos, periodo, leido: new Date() })
        setError(null)
      } catch (e) {
        if (vigente) setError(e instanceof Error ? e.message : 'No se pudieron leer las estadísticas.')
      } finally {
        if (vigente) {
          setCargando(false)
          setProgreso('')
        }
      }
    }
    void cargar()
    return () => {
      vigente = false
    }
  }, [rango, recarga, modo])

  const cambiarRango = (nuevo: Rango) => {
    if (nuevo === rango) return
    setCargando(true)
    setRango(nuevo)
  }
  const actualizar = () => {
    setCargando(true)
    setRecarga((n) => n + 1)
  }

  // Datos de ejemplo: solo existen en desarrollo (en el sitio publicado esta función no está)
  const alternarEjemplo = import.meta.env.DEV
    ? async () => {
        if (ejemplo) return setEjemplo(null)
        const { generarEjemplo } = await import('@/estadisticas/ejemplo')
        setEjemplo(generarEjemplo(120))
      }
    : undefined

  const fuente = ejemplo ?? carga?.eventos
  const estadisticas = useMemo(() => (fuente && carga ? calcularEstadisticas(fuente, carga.periodo) : null), [fuente, carga])

  const pagina = paginaElegida ?? estadisticas?.paginas[0]?.ruta ?? '/'
  const pantallasConClics = useMemo(() => {
    if (!fuente || !carga) return new Map<Dispositivo, number>()
    return new Map(PANTALLAS.map((d) => [d, clicsDePagina(fuente, carga.periodo, pagina, d).length]))
  }, [fuente, carga, pagina])
  // Por defecto, la pantalla con más toques en esa página
  const pantallaMapa = pantalla ?? [...pantallasConClics].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'escritorio'
  const clicsMapa = useMemo(
    () => (fuente && carga ? clicsDePagina(fuente, carga.periodo, pagina, pantallaMapa) : []),
    [fuente, carga, pagina, pantallaMapa],
  )

  const verDetalle = (ruta: string) => {
    setPaginaElegida(ruta)
    setPantalla(null)
    detalle.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const e = estadisticas

  return (
    <div className={styles.panel}>
      <header className={cx('tema-noche', styles.barra)}>
        <div className={cx('contenedor', styles.barraContenido)}>
          <Link to="/" className={styles.marca} aria-label="Ir al sitio">
            <Marca />
          </Link>
          <p className={styles.nombrePanel}>Estadísticas</p>
          <div className={styles.cuenta}>
            {correo && <span className="mono suave">{correo}</span>}
            <Link to="/" className={styles.accionBarra}>Ver el sitio</Link>
            {onSalir && (
              <button type="button" className={styles.accionBarra} onClick={onSalir}>
                Salir
              </button>
            )}
          </div>
        </div>
      </header>

      <main className={cx('contenedor', styles.contenido)}>
        {modo === 'local' && (
          <p className={styles.aviso}>
            <b>Modo local.</b> Supabase aún no está conectado: aquí solo ves las visitas que haces tú en este navegador mientras
            pruebas el sitio con <code>npm run dev</code>. Para ver las de todo el mundo, sigue la sección 13 de la GUIA.
          </p>
        )}
        {ejemplo && (
          <p className={cx(styles.aviso, styles.avisoEjemplo)} role="status">
            <b>Estás viendo DATOS DE EJEMPLO, inventados</b> para mostrar cómo se ve el panel. No son visitas reales.
          </p>
        )}

        {/* Filtros: una sola fila, arriba de todo */}
        <div className={styles.filtros}>
          <div className={styles.rangos} role="group" aria-label="Período">
            {RANGOS.map((r) => (
              <button key={r.id} type="button" className={styles.boton} aria-pressed={rango === r.id} onClick={() => cambiarRango(r.id)}>
                {r.nombre}
              </button>
            ))}
          </div>
          <button type="button" className={styles.boton} onClick={actualizar}>
            Actualizar
          </button>
          <span className={cx('mono', 'suave', styles.estado)} role="status">
            {progreso || (carga && `Actualizado ${carga.leido.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })}`)}
          </span>

          <div className={styles.opciones}>
            <label className={styles.casilla}>
              <input
                type="checkbox"
                checked={noMedir}
                onChange={(ev) => {
                  cambiarNoMedir(ev.target.checked)
                  setNoMedir(ev.target.checked)
                }}
              />
              No contar mis visitas en este navegador
            </label>
            {alternarEjemplo && (
              <button type="button" className={styles.boton} aria-pressed={Boolean(ejemplo)} onClick={() => void alternarEjemplo()}>
                Datos de ejemplo
              </button>
            )}
            {modo === 'local' && (
              <button
                type="button"
                className={styles.boton}
                onClick={() => {
                  borrarLocales()
                  actualizar()
                }}
              >
                Borrar mis datos de prueba
              </button>
            )}
          </div>
        </div>

        {error && (
          <p className={cx(styles.aviso, styles.avisoError)} role="alert">
            {error}
          </p>
        )}

        {!e && !error && <p className="mono suave">Cargando estadísticas…</p>}

        {e && e.visitas === 0 && (
          <div className={styles.vacio}>
            <h2>Aún no hay visitas en este período</h2>
            <p>
              {modo === 'local'
                ? 'Abre el sitio en otra pestaña, recorre algunas páginas y vuelve aquí a pulsar «Actualizar». También puedes ver los «Datos de ejemplo».'
                : 'Cuando la gente entre al sitio, sus visitas aparecerán aquí. Prueba con un período más largo.'}
            </p>
          </div>
        )}

        {e && e.visitas > 0 && (
          <div className={cx(styles.tablero, cargando && styles.recargando)} aria-busy={cargando}>
            {/* ── Resumen ── */}
            <section aria-label="Resumen" className={styles.cifras}>
              <Cifra nombre="Visitantes" valor={numero(e.visitantes)} ayuda="Navegadores distintos" />
              <Cifra nombre="Visitas" valor={numero(e.visitas)} ayuda="Termina tras 30 min sin actividad" />
              <Cifra nombre="Páginas vistas" valor={numero(e.paginasVistas)} ayuda={`${e.paginasPorVisita.toFixed(1).replace('.', ',')} por visita`} />
              <Cifra nombre="Tiempo por visita" valor={duracion(e.tiempoVisita)} ayuda="Lo típico (la mediana)" />
              <Cifra nombre="Salidas rápidas" valor={porcentaje(e.salidasRapidas)} ayuda="Una página y menos de 15 s" />
              <Cifra nombre="Volvieron" valor={porcentaje(e.volvieron)} ayuda="Visitantes con más de una visita" />
              <Cifra nombre="Ahora mismo" valor={numero(e.activosAhora)} ayuda="Activos en los últimos 5 min" />
            </section>

            <Tarjeta titulo={e.agrupadoPor === 'semana' ? 'Visitas por semana' : 'Visitas por día'} ancho>
              <Columnas
                columnas={e.barras.map((b) => ({ etiqueta: b.etiqueta, valor: b.visitas }))}
                unidad="visitas"
                nombre={e.agrupadoPor === 'semana' ? 'Visitas por semana' : 'Visitas por día'}
              />
              <details className={styles.tablaOculta}>
                <summary>Ver como tabla</summary>
                <Tabla
                  columnas={['Fecha', 'Visitas']}
                  filas={e.barras.map((b) => [b.etiqueta, numero(b.visitas)])}
                />
              </details>
            </Tarjeta>

            <Tarjeta titulo="Páginas más vistas" ancho>
              <div className={styles.desliza}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th scope="col">Página</th>
                      <th scope="col" className={styles.num}>Vistas</th>
                      <th scope="col" className={styles.num}>Visitantes</th>
                      <th scope="col" className={styles.num}>Tiempo típico</th>
                      <th scope="col" className={styles.num}>Bajan hasta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {e.paginas.slice(0, 20).map((p) => (
                      <tr key={p.ruta}>
                        <th scope="row">
                          <button type="button" className={styles.enlaceTabla} onClick={() => verDetalle(p.ruta)}>
                            {nombreRuta(p.ruta)}
                          </button>
                        </th>
                        <td className={styles.num}>{numero(p.vistas)}</td>
                        <td className={styles.num}>{numero(p.visitantes)}</td>
                        <td className={styles.num}>{duracion(p.tiempo)}</td>
                        <td className={styles.num}>{porcentaje(p.lectura)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={styles.nota}>«Bajan hasta»: en promedio, qué parte del largo de la página alcanzan a ver. Toca una página para ver su detalle.</p>
            </Tarjeta>

            <Tarjeta titulo="Cómo llegan">
              <BarrasLista filas={e.origenes.map((o) => ({ etiqueta: o.clave, valor: o.valor }))} />
              <p className={styles.nota}>
                «Directo»: escribieron la dirección o la abrieron desde una app que no dice de dónde viene (WhatsApp suele llegar así).
                Para saberlo con certeza, comparte el enlace terminado en <code>?origen=whatsapp</code>.
              </p>
            </Tarjeta>

            <Tarjeta titulo="Desde qué aparato">
              <BarrasLista
                filas={e.dispositivos.map((d) => ({
                  etiqueta: nombresDispositivo[d.clave as Dispositivo] ?? d.clave,
                  valor: d.valor,
                  texto: `${numero(d.valor)} · ${porcentaje(d.valor / e.visitas)}`,
                }))}
              />
            </Tarjeta>

            <Tarjeta titulo="Por dónde entran">
              <BarrasLista filas={e.entradas.map((f) => ({ etiqueta: nombreRuta(f.clave), valor: f.valor }))} limite={8} />
            </Tarjeta>

            <Tarjeta titulo="Dónde se despiden">
              <BarrasLista filas={e.salidas.map((f) => ({ etiqueta: nombreRuta(f.clave), valor: f.valor }))} limite={8} />
              <p className={styles.nota}>La última página que vieron antes de irse.</p>
            </Tarjeta>

            <Tarjeta titulo="Recorridos más comunes">
              <BarrasLista
                filas={e.recorridos.map((r) => ({ etiqueta: `${nombreRuta(r.de)} → ${nombreRuta(r.a)}`, valor: r.veces }))}
                limite={8}
                vacio="Todavía nadie pasó de una página a otra."
              />
            </Tarjeta>

            <Tarjeta titulo="¿A qué hora entran?">
              <Columnas
                columnas={e.porHora.map((valor, hora) => ({ etiqueta: `${hora}:00`, valor }))}
                unidad="visitas"
                nombre="Visitas según la hora del día"
              />
              <p className={styles.nota}>Útil para saber cuándo publicar en redes.</p>
            </Tarjeta>

            <Tarjeta titulo="Lo más tocado" ancho>
              <TablaClics clics={e.clics} vacio="Aún no hay toques en botones o enlaces." />
            </Tarjeta>

            <Tarjeta titulo="Tocan, pero no pasa nada" ancho>
              <TablaClics clics={e.clicsSinAccion} vacio="Nadie ha tocado fotos o textos esperando que pasara algo." />
              <p className={styles.nota}>
                Toques en fotos, textos o recuadros que no son botones. Si algo se repite mucho, la gente espera que se abra:
                quizá convenga volverlo un enlace.
              </p>
            </Tarjeta>

            <Tarjeta titulo="Videos y audios" ancho>
              {e.medios.length === 0 ? (
                <p className={styles.nota}>Aún nadie ha reproducido un video o audio.</p>
              ) : (
                <div className={styles.desliza}>
                  <table className={styles.tabla}>
                    <thead>
                      <tr>
                        <th scope="col">Archivo</th>
                        <th scope="col">Dónde</th>
                        <th scope="col" className={styles.num}>Empezaron</th>
                        <th scope="col" className={styles.num}>Llegaron a la mitad</th>
                        <th scope="col" className={styles.num}>Lo terminaron</th>
                      </tr>
                    </thead>
                    <tbody>
                      {e.medios.map((m) => (
                        <tr key={m.archivo}>
                          <th scope="row">
                            {m.archivo}
                            {m.auto && <span className={styles.etiquetaChica}>Arranca solo</span>}
                          </th>
                          <td>{m.rutas.map(nombreRuta).join(', ')}</td>
                          <td className={styles.num}>{numero(m.hitos.inicio)}</td>
                          <td className={styles.num}>
                            {numero(m.hitos['50'])} <span className="suave">· {porcentaje(m.hitos['50'] / (m.hitos.inicio || 1))}</span>
                          </td>
                          <td className={styles.num}>
                            {numero(m.hitos.fin)} <span className="suave">· {porcentaje(m.hitos.fin / (m.hitos.inicio || 1))}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className={styles.nota}>
                Un video que «arranca solo» (como el de la portada) empieza para todos los que abren la página: ahí lo que importa es cuántos
                se quedan a verlo hasta la mitad o el final.
              </p>
            </Tarjeta>

            {/* ── Detalle de una página ── */}
            <section ref={detalle} className={styles.detalle} aria-labelledby="detalle-titulo">
              <div className={styles.detalleCabecera}>
                <h2 id="detalle-titulo">Detalle de una página</h2>
                <label className={styles.selector}>
                  <span className="mono suave">Página</span>
                  <select
                    value={pagina}
                    onChange={(ev) => {
                      setPaginaElegida(ev.target.value)
                      setPantalla(null)
                    }}
                  >
                    {e.paginas.map((p) => (
                      <option key={p.ruta} value={p.ruta}>
                        {nombreRuta(p.ruta)} ({numero(p.vistas)})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className={styles.detalleCuerpo}>
                <Tarjeta titulo="Hasta dónde llegan">
                  <BarrasLista
                    filas={(e.secciones[pagina] ?? []).map((s) => ({
                      etiqueta: nombreSeccion(s.id),
                      valor: s.alcance,
                      texto: porcentaje(s.alcance),
                    }))}
                    maximo={1}
                    limite={30}
                    vacio="Sin secciones registradas en esta página."
                  />
                  <p className={styles.nota}>Qué parte de las visitas a esta página vio cada sección al menos un segundo.</p>
                </Tarjeta>

                <Tarjeta titulo="Mapa de toques">
                  <div className={styles.rangos} role="group" aria-label="Tipo de pantalla">
                    {PANTALLAS.map((d) => (
                      <button key={d} type="button" className={styles.boton} aria-pressed={pantallaMapa === d} onClick={() => setPantalla(d)}>
                        {nombresDispositivo[d]} <span className="suave">{numero(pantallasConClics.get(d) ?? 0)}</span>
                      </button>
                    ))}
                  </div>
                  <MapaClics ruta={pagina} clics={clicsMapa} dispositivo={pantallaMapa} />
                </Tarjeta>
              </div>
            </section>
          </div>
        )}

        <footer className={styles.privacidad}>
          <h2>Qué se mide y qué no</h2>
          <p>
            Se cuentan las páginas que se abren, el tiempo que están a la vista, hasta dónde se baja, qué se toca y cuánto se ve de cada
            video. <b>No</b> se guardan nombres, correos, direcciones IP ni cookies: cada navegador se reconoce solo por un número al azar.
            No se mide a quien activó «no rastrear» en su navegador.
          </p>
        </footer>
      </main>
    </div>
  )
}

function Cifra({ nombre, valor, ayuda }: { nombre: string; valor: string; ayuda: string }) {
  return (
    <div className={styles.cifra}>
      <span className={styles.cifraNombre}>{nombre}</span>
      <b className={styles.cifraValor}>{valor}</b>
      <span className={styles.cifraAyuda}>{ayuda}</span>
    </div>
  )
}

function Tarjeta({ titulo, ancho, children }: { titulo: string; ancho?: boolean; children: ReactNode }) {
  return (
    <section className={cx(styles.tarjeta, ancho && styles.ancha)} aria-label={titulo}>
      <h2>{titulo}</h2>
      {children}
    </section>
  )
}

function Tabla({ columnas, filas }: { columnas: string[]; filas: string[][] }) {
  return (
    <table className={styles.tabla}>
      <thead>
        <tr>
          {columnas.map((c, i) => (
            <th key={c} scope="col" className={cx(i > 0 && styles.num)}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filas.map((fila, i) => (
          <tr key={i}>
            {fila.map((celda, j) => (j === 0 ? <th key={j} scope="row">{celda}</th> : <td key={j} className={styles.num}>{celda}</td>))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function TablaClics({ clics, vacio }: { clics: ResumenClic[]; vacio: string }) {
  const [todos, setTodos] = useState(false)
  if (clics.length === 0) return <p className={styles.nota}>{vacio}</p>
  const visibles = todos ? clics : clics.slice(0, 12)
  return (
    <>
      <div className={styles.desliza}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th scope="col">Qué tocaron</th>
              <th scope="col">Qué es</th>
              <th scope="col">En qué página</th>
              <th scope="col" className={styles.num}>Veces</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((c, i) => (
              <tr key={i}>
                <th scope="row">
                  {c.etiqueta}
                  {c.destino && <span className={styles.destino}>{destinoLegible(c.destino)}</span>}
                </th>
                <td>{c.elemento.startsWith('zona:') ? 'Foto o texto' : (TIPOS_ELEMENTO[c.elemento] ?? c.elemento)}</td>
                <td>{nombreRuta(c.ruta)}</td>
                <td className={styles.num}>{numero(c.veces)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {clics.length > 12 && (
        <button type="button" className={styles.boton} onClick={() => setTodos(!todos)}>
          {todos ? 'Ver menos' : `Ver los ${clics.length}`}
        </button>
      )}
    </>
  )
}
