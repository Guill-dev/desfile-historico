import { creadores } from '@/data/creadores'
import { objetos } from '@/data/objetos'
import { versiones } from '@/data/versiones'
import type { Dispositivo, Evento, HitoMedia } from './tipos'

/**
 * DATOS DE EJEMPLO — solo en desarrollo (npm run dev), para ver el panel lleno antes de tener visitas reales.
 * Son inventados a propósito y el panel lo avisa en grande. No se guardan ni llegan al sitio publicado.
 */

/** Números al azar pero repetibles (siempre los mismos con la misma semilla) */
function generador(semilla: number) {
  let s = semilla >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generarEjemplo(dias = 30, ahora = Date.now()): Evento[] {
  const azar = generador(2026)
  const elegir = <T>(opciones: [T, number][]): T => {
    const total = opciones.reduce((s, [, peso]) => s + peso, 0)
    let r = azar() * total
    for (const [valor, peso] of opciones) if ((r -= peso) <= 0) return valor
    return opciones[0][0]
  }
  const id = () => Math.floor(azar() * 2 ** 48).toString(36)

  const fichas: [string, number][] = [
    ['/pasos', 5],
    ['/mas/historia', 4],
    ['/mas/galeria', 3],
    ['/mas/testimonios', 2],
    ...creadores.map((c): [string, number] => [`/creadores/${c.id}`, 1.5]),
    ...objetos.map((o): [string, number] => [`/objetos/${o.id}`, 1]),
    ...versiones.map((v): [string, number] => [`/versiones/${v.anio}`, 2]),
  ]
  const seccionesInicio = ['inicio', 'historia', 'pasos', 'creadores', 'objetos', 'versiones', 'mas']
  const clicsPorRuta: Record<string, [string, string, string][]> = {
    '/': [
      ['Comenzar el recorrido', 'a', '#historia'],
      ['Leer la historia', 'a', '/mas/historia'],
      ['Pasos', 'a', '/pasos'],
      ['Pausar video', 'button', ''],
      ['Menú', 'button', ''],
      ['Siguiente', 'button', ''],
    ],
    '/pasos': [['01[Título del paso 1]', 'a', '#paso-1']],
    '/mas/testimonios': [['Participantes2', 'button', '']],
  }
  const visitantes = Array.from({ length: 1500 }, id)

  const eventos: Evento[] = []
  const hoy = new Date(ahora)
  hoy.setHours(0, 0, 0, 0)

  for (let d = dias - 1; d >= 0; d--) {
    const dia = new Date(hoy)
    dia.setDate(dia.getDate() - d)
    const finDeSemana = dia.getDay() === 0 || dia.getDay() === 6
    const cantidad = Math.round((18 + azar() * 22) * (finDeSemana ? 1.5 : 1))

    for (let n = 0; n < cantidad; n++) {
      const hora = elegir([[7, 1], [9, 2], [12, 3], [13, 3], [17, 3], [19, 5], [20, 6], [21, 4], [22, 2]])
      let t = dia.getTime() + hora * 3_600_000 + Math.floor(azar() * 3_600_000)
      if (t > ahora) continue

      const sesion = id()
      // Uno de cada cinco es de los que vuelven seguido
      const visitante = azar() < 0.2 ? visitantes[Math.floor(azar() * 60)] : visitantes[Math.floor(azar() * visitantes.length)]
      const dispositivo = elegir<Dispositivo>([['movil', 68], ['escritorio', 25], ['tablet', 7]])
      const ancho = dispositivo === 'movil' ? 390 : dispositivo === 'tablet' ? 820 : 1440
      const origen = elegir([['whatsapp', 35], ['l.facebook.com', 25], ['directo', 25], ['www.google.com', 10], ['instagram.com', 5]])

      let ruta = elegir<string>([['/', 70], ...fichas])
      let paginas = 0
      do {
        const vista = id()
        const base = { ruta, sesion, visitante, vista, dispositivo }
        const marca = () => new Date(t).toISOString()
        eventos.push({ ...base, tipo: 'vista', creado: marca(), datos: { origen: paginas === 0 ? origen : '', ancho, idioma: 'es-CO', nueva: paginas === 0 } })

        const ms = Math.min(900_000, Math.round(Math.exp(Math.log(35_000) + (azar() - 0.5) * 2.6)))
        let scroll = Math.round(Math.min(100, 20 + azar() * 90))

        if (ruta === '/') {
          let alcance = 0
          for (const seccion of seccionesInicio) {
            if (azar() > 0.86 - alcance * 0.04) break
            eventos.push({ ...base, tipo: 'seccion', creado: marca(), datos: { id: seccion } })
            alcance++
          }
          scroll = Math.max(scroll, Math.round((alcance / seccionesInicio.length) * 100))
          const avance = ms / 110_000
          const hitos: [number, HitoMedia][] = [[0, 'inicio'], [0.25, '25'], [0.5, '50'], [0.75, '75'], [0.95, 'fin']]
          for (const [limite, hito] of hitos) {
            if (avance >= limite) eventos.push({ ...base, tipo: 'media', creado: marca(), datos: { archivo: 'desfile.mp4', medio: 'video', hito, auto: true } })
          }
        }

        for (const [etiqueta, elemento, destino] of clicsPorRuta[ruta] ?? []) {
          if (azar() < 0.18) eventos.push({ ...base, tipo: 'clic', creado: marca(), datos: { etiqueta, elemento, destino, camino: '', ox: 0.5, oy: 0.5, ancho } })
        }
        if (azar() < 0.08) {
          eventos.push({ ...base, tipo: 'clic', creado: marca(), datos: { etiqueta: '[Fotografía del desfile 2025]', elemento: 'zona:div', destino: '', camino: '', ox: 0.5, oy: 0.5, ancho } })
        }

        t += ms
        eventos.push({ ...base, tipo: 'tiempo', creado: new Date(Math.min(t, ahora)).toISOString(), datos: { ms, scroll } })
        t += 2000
        paginas++
        ruta = elegir(fichas.filter(([r]) => r !== ruta))
      } while (paginas < 6 && azar() < 0.5 && t < ahora)
    }
  }
  return eventos.sort((a, b) => (a.creado < b.creado ? -1 : 1))
}
