import type { Dispositivo, Evento, EventoClic, EventoVista, HitoMedia } from './tipos'
import { nombreOrigen } from './nombres'

/**
 * De la lista de eventos a los números del panel. Función "pura": no lee nada de afuera,
 * así que da el mismo resultado con eventos de Supabase, del navegador o de ejemplo.
 */

export interface Periodo {
  desde: Date
  hasta: Date
}

export interface Fila {
  clave: string
  valor: number
}

export interface ResumenPagina {
  ruta: string
  vistas: number
  visitantes: number
  /** Tiempo típico (mediana) a la vista, en ms */
  tiempo: number
  /** Hasta dónde bajan, en promedio (0 a 1) */
  lectura: number
}

export interface ResumenClic {
  etiqueta: string
  ruta: string
  elemento: string
  destino: string
  veces: number
}

export interface ResumenMedio {
  archivo: string
  medio: 'video' | 'audio'
  auto: boolean
  rutas: string[]
  hitos: Record<HitoMedia, number>
}

export interface ResumenSeccion {
  id: string
  /** Páginas vistas que llegaron a esta sección */
  vistas: number
  /** Fracción de las vistas de la página (0 a 1) */
  alcance: number
}

export interface Barra {
  /** Fecha de inicio del día o semana (AAAA-MM-DD) */
  fecha: string
  etiqueta: string
  visitas: number
}

export interface Estadisticas {
  visitantes: number
  visitas: number
  paginasVistas: number
  /** Mediana del tiempo por visita, en ms */
  tiempoVisita: number
  paginasPorVisita: number
  /** Visitas de una sola página y menos de 15 s (0 a 1) */
  salidasRapidas: number
  /** Visitantes con más de una visita en el período (0 a 1) */
  volvieron: number
  /** Visitas con actividad en los últimos 5 minutos */
  activosAhora: number
  barras: Barra[]
  agrupadoPor: 'dia' | 'semana'
  /** Visitas según la hora a la que empezaron (0 a 23) */
  porHora: number[]
  paginas: ResumenPagina[]
  entradas: Fila[]
  salidas: Fila[]
  recorridos: { de: string; a: string; veces: number }[]
  origenes: Fila[]
  dispositivos: Fila[]
  clics: ResumenClic[]
  /** Toques en cosas que no son botones ni enlaces (fotos, textos): quizá esperaban que pasara algo */
  clicsSinAccion: ResumenClic[]
  medios: ResumenMedio[]
  /** Por página: qué secciones vieron, de la más vista a la menos */
  secciones: Record<string, ResumenSeccion[]>
}

const MS_SALIDA_RAPIDA = 15_000
const MS_ACTIVO = 5 * 60 * 1000

const mediana = (valores: number[]) => {
  if (valores.length === 0) return 0
  const orden = [...valores].sort((a, b) => a - b)
  const medio = Math.floor(orden.length / 2)
  return orden.length % 2 ? orden[medio] : (orden[medio - 1] + orden[medio]) / 2
}

const promedio = (valores: number[]) => (valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : 0)

/** Suma uno a la clave de un contador */
function contar<K>(mapa: Map<K, number>, clave: K, cuanto = 1) {
  mapa.set(clave, (mapa.get(clave) ?? 0) + cuanto)
}

const filas = (mapa: Map<string, number>): Fila[] =>
  [...mapa].map(([clave, valor]) => ({ clave, valor })).sort((a, b) => b.valor - a.valor)

/** "2026-10-21" en la hora local (no en UTC) */
export function fechaLocal(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${mes}-${dia}`
}

const etiquetaDia = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' })

export function calcularEstadisticas(todos: Evento[], periodo: Periodo, ahora = Date.now()): Estadisticas {
  const desde = periodo.desde.toISOString()
  const hasta = periodo.hasta.toISOString()
  const eventos = todos.filter((e) => e.creado >= desde && e.creado <= hasta).sort((a, b) => (a.creado < b.creado ? -1 : 1))

  // Activos ahora: cualquier evento reciente, aunque quede fuera del período elegido
  const limiteActivo = new Date(ahora - MS_ACTIVO).toISOString()
  const activosAhora = new Set(todos.filter((e) => e.creado >= limiteActivo).map((e) => e.sesion)).size

  /* ── Agrupar por página vista y por visita ── */
  const vistas = eventos.filter((e): e is EventoVista => e.tipo === 'vista')
  const rutaDeVista = new Map(vistas.map((v) => [v.vista, v.ruta]))
  const tiempoDeVista = new Map<string, number>()
  const lecturaDeVista = new Map<string, number>()
  for (const e of eventos) {
    if (e.tipo !== 'tiempo') continue
    contar(tiempoDeVista, e.vista, e.datos.ms)
    lecturaDeVista.set(e.vista, Math.max(lecturaDeVista.get(e.vista) ?? 0, e.datos.scroll / 100))
  }

  interface Visita {
    inicio: Date
    rutas: string[]
    vistas: string[]
    origen: string
    dispositivo: Dispositivo
    visitante: string
  }
  const visitas = new Map<string, Visita>()
  for (const v of vistas) {
    let visita = visitas.get(v.sesion)
    if (!visita) {
      visita = { inicio: new Date(v.creado), rutas: [], vistas: [], origen: '', dispositivo: v.dispositivo, visitante: v.visitante }
      visitas.set(v.sesion, visita)
    }
    visita.rutas.push(v.ruta)
    visita.vistas.push(v.vista)
    if (!visita.origen && v.datos.origen) visita.origen = v.datos.origen
  }
  const listaVisitas = [...visitas.values()]
  const tiempoDeVisita = (v: Visita) => v.vistas.reduce((suma, id) => suma + (tiempoDeVista.get(id) ?? 0), 0)

  /* ── Resumen ── */
  const visitasPorVisitante = new Map<string, number>()
  for (const v of listaVisitas) contar(visitasPorVisitante, v.visitante)
  const visitantes = visitasPorVisitante.size
  const volvieron = visitantes ? [...visitasPorVisitante.values()].filter((n) => n > 1).length / visitantes : 0
  const salidasRapidas = listaVisitas.length
    ? listaVisitas.filter((v) => v.vistas.length === 1 && tiempoDeVisita(v) < MS_SALIDA_RAPIDA).length / listaVisitas.length
    : 0

  /* ── Visitas por día (o por semana si el período es largo) ── */
  const inicioPeriodo = new Date(periodo.desde)
  inicioPeriodo.setHours(0, 0, 0, 0)
  const dias = Math.ceil((periodo.hasta.getTime() - inicioPeriodo.getTime()) / 86_400_000)
  const agrupadoPor = dias > 92 ? 'semana' : 'dia'
  const inicioDeGrupo = (fecha: Date) => {
    const d = new Date(fecha)
    d.setHours(0, 0, 0, 0)
    if (agrupadoPor === 'semana') d.setDate(d.getDate() - ((d.getDay() + 6) % 7)) // lunes
    return d
  }
  const porGrupo = new Map<string, number>()
  for (const v of listaVisitas) contar(porGrupo, fechaLocal(inicioDeGrupo(v.inicio)))
  const barras: Barra[] = []
  for (let d = inicioDeGrupo(inicioPeriodo); d <= periodo.hasta; d.setDate(d.getDate() + (agrupadoPor === 'semana' ? 7 : 1))) {
    const fecha = fechaLocal(d)
    barras.push({
      fecha,
      etiqueta: (agrupadoPor === 'semana' ? 'Semana del ' : '') + etiquetaDia.format(d),
      visitas: porGrupo.get(fecha) ?? 0,
    })
  }

  const porHora = Array.from({ length: 24 }, () => 0)
  for (const v of listaVisitas) porHora[v.inicio.getHours()]++

  /* ── Páginas ── */
  const porRuta = new Map<string, { vistas: number; visitantes: Set<string>; tiempos: number[]; lecturas: number[] }>()
  for (const v of vistas) {
    let r = porRuta.get(v.ruta)
    if (!r) {
      r = { vistas: 0, visitantes: new Set(), tiempos: [], lecturas: [] }
      porRuta.set(v.ruta, r)
    }
    r.vistas++
    r.visitantes.add(v.visitante)
    const tiempo = tiempoDeVista.get(v.vista)
    if (tiempo !== undefined) r.tiempos.push(tiempo)
    const lectura = lecturaDeVista.get(v.vista)
    if (lectura !== undefined) r.lecturas.push(lectura)
  }
  const paginas: ResumenPagina[] = [...porRuta]
    .map(([ruta, r]) => ({ ruta, vistas: r.vistas, visitantes: r.visitantes.size, tiempo: mediana(r.tiempos), lectura: promedio(r.lecturas) }))
    .sort((a, b) => b.vistas - a.vistas)

  /* ── Entradas, salidas y recorridos ── */
  const entradas = new Map<string, number>()
  const salidas = new Map<string, number>()
  const pasosRecorrido = new Map<string, number>()
  const origenes = new Map<string, number>()
  const dispositivos = new Map<string, number>()
  for (const v of listaVisitas) {
    contar(entradas, v.rutas[0])
    contar(salidas, v.rutas[v.rutas.length - 1])
    contar(origenes, nombreOrigen(v.origen || 'directo'))
    contar(dispositivos, v.dispositivo)
    for (let i = 1; i < v.rutas.length; i++) {
      if (v.rutas[i] !== v.rutas[i - 1]) contar(pasosRecorrido, `${v.rutas[i - 1]}\n${v.rutas[i]}`)
    }
  }
  const recorridos = filas(pasosRecorrido).map(({ clave, valor }) => {
    const [de, a] = clave.split('\n')
    return { de, a, veces: valor }
  })

  /* ── Clics ── */
  const clics = new Map<string, ResumenClic>()
  for (const e of eventos) {
    if (e.tipo !== 'clic') continue
    const clave = [e.ruta, e.datos.etiqueta, e.datos.elemento, e.datos.destino].join('\n')
    const previo = clics.get(clave)
    if (previo) previo.veces++
    else clics.set(clave, { etiqueta: e.datos.etiqueta, ruta: e.ruta, elemento: e.datos.elemento, destino: e.datos.destino, veces: 1 })
  }
  const todosLosClics = [...clics.values()].sort((a, b) => b.veces - a.veces)
  // Un toque en el fondo (un <div> sin texto) no dice nada: solo se listan los que tienen etiqueta propia
  const sinAccion = todosLosClics.filter((c) => c.elemento.startsWith('zona:') && c.etiqueta !== c.elemento.slice(5))

  /* ── Videos y audios ── */
  const medios = new Map<string, ResumenMedio & { porHito: Record<HitoMedia, Set<string>>; conjuntoRutas: Set<string> }>()
  for (const e of eventos) {
    if (e.tipo !== 'media') continue
    let m = medios.get(e.datos.archivo)
    if (!m) {
      m = {
        archivo: e.datos.archivo,
        medio: e.datos.medio,
        auto: e.datos.auto,
        rutas: [],
        hitos: { inicio: 0, '25': 0, '50': 0, '75': 0, fin: 0 },
        porHito: { inicio: new Set(), '25': new Set(), '50': new Set(), '75': new Set(), fin: new Set() },
        conjuntoRutas: new Set(),
      }
      medios.set(e.datos.archivo, m)
    }
    m.porHito[e.datos.hito].add(e.vista)
    m.conjuntoRutas.add(e.ruta)
  }
  const resumenMedios: ResumenMedio[] = [...medios.values()]
    .map(({ porHito, conjuntoRutas, ...m }) => ({
      ...m,
      rutas: [...conjuntoRutas],
      hitos: { inicio: porHito.inicio.size, '25': porHito['25'].size, '50': porHito['50'].size, '75': porHito['75'].size, fin: porHito.fin.size },
    }))
    .sort((a, b) => b.hitos.inicio - a.hitos.inicio)

  /* ── Secciones vistas, por página ── */
  const vistasConSeccion = new Map<string, Set<string>>() // "ruta\nid" → vistas
  for (const e of eventos) {
    if (e.tipo !== 'seccion') continue
    const ruta = rutaDeVista.get(e.vista) ?? e.ruta
    const clave = `${ruta}\n${e.datos.id}`
    let conjunto = vistasConSeccion.get(clave)
    if (!conjunto) {
      conjunto = new Set()
      vistasConSeccion.set(clave, conjunto)
    }
    conjunto.add(e.vista)
  }
  const secciones: Record<string, ResumenSeccion[]> = {}
  for (const [clave, conjunto] of vistasConSeccion) {
    const [ruta, id] = clave.split('\n')
    const total = porRuta.get(ruta)?.vistas ?? conjunto.size
    ;(secciones[ruta] ??= []).push({ id, vistas: conjunto.size, alcance: Math.min(1, conjunto.size / total) })
  }
  for (const lista of Object.values(secciones)) lista.sort((a, b) => b.vistas - a.vistas)

  return {
    visitantes,
    visitas: listaVisitas.length,
    paginasVistas: vistas.length,
    tiempoVisita: mediana(listaVisitas.map(tiempoDeVisita)),
    paginasPorVisita: listaVisitas.length ? vistas.length / listaVisitas.length : 0,
    salidasRapidas,
    volvieron,
    activosAhora,
    barras,
    agrupadoPor,
    porHora,
    paginas,
    entradas: filas(entradas),
    salidas: filas(salidas),
    recorridos,
    origenes: filas(origenes),
    dispositivos: filas(dispositivos),
    clics: todosLosClics.filter((c) => !c.elemento.startsWith('zona:')),
    clicsSinAccion: sinAccion,
    medios: resumenMedios,
    secciones,
  }
}

/** Los clics de una página y un tipo de pantalla, para el mapa de clics */
export function clicsDePagina(eventos: Evento[], periodo: Periodo, ruta: string, dispositivo: Dispositivo): EventoClic[] {
  const desde = periodo.desde.toISOString()
  const hasta = periodo.hasta.toISOString()
  return eventos.filter(
    (e): e is EventoClic => e.tipo === 'clic' && e.ruta === ruta && e.dispositivo === dispositivo && e.creado >= desde && e.creado <= hasta,
  )
}
