import { capitulos } from '@/data/sitio'
import { creadores } from '@/data/creadores'
import { objetos } from '@/data/objetos'
import { seccionesMas } from '@/data/mas'
import { pasos } from '@/data/pasos'
import { historia } from '@/data/historia'
import { testimonios } from '@/data/testimonios'
import type { Dispositivo } from './tipos'

/**
 * Nombres legibles para el panel: "/objetos/objeto-2" → "Objeto: Máscara de…".
 * Salen de los mismos datos del sitio, así que se actualizan solos.
 */

/** Mientras el nombre sea un "[pendiente]", se le agrega el id para distinguir unos de otros */
const conId = (nombre: string, id: string) => (nombre.startsWith('[') ? `${nombre} · ${id}` : nombre)

export function nombreRuta(ruta: string): string {
  if (ruta === '/') return 'Inicio'
  if (ruta === '/pasos') return 'Pasos'
  const [, grupo, id = ''] = ruta.split('/')
  switch (grupo) {
    case 'creadores': {
      const c = creadores.find((x) => x.id === id)
      return c ? `Creador: ${conId(c.nombre, id)}` : ruta
    }
    case 'objetos': {
      const o = objetos.find((x) => x.id === id)
      return o ? `Objeto: ${conId(o.nombre, id)}` : ruta
    }
    case 'versiones':
      return `Edición ${id}`
    case 'mas': {
      const s = seccionesMas.find((x) => x.slug === id)
      return s ? s.titulo : ruta
    }
    default:
      return ruta
  }
}

export function nombreSeccion(id: string): string {
  if (id === 'inicio') return 'Portada'
  if (id === 'historia') return 'Conoce la historia'
  if (id === 'mas') return 'Pie: Más del archivo'
  if (id === 'linea-de-tiempo') return 'Línea de tiempo'
  if (id === 'fuentes') return 'Fuentes'
  const cap = capitulos.find((c) => c.id === id)
  if (cap) return cap.encabezado
  const paso = pasos.find((p) => p.id === id)
  if (paso) return `Paso ${paso.numero}: ${conId(paso.titulo, id)}`
  const capHistoria = historia.capitulos.find((c) => c.id === id)
  if (capHistoria) return conId(capHistoria.titulo, id)
  const testimonio = testimonios.find((t) => t.id === id)
  if (testimonio) return `Testimonio: ${conId(testimonio.nombre, id)}`
  return id
}

/** Agrupa los orígenes: "l.facebook.com" y "m.facebook.com" son los dos Facebook */
const ORIGENES: [RegExp, string][] = [
  [/^directo$/, 'Directo'],
  [/whatsapp|^wa\.me$/, 'WhatsApp'],
  [/facebook|^fb(\.|$)/, 'Facebook'],
  [/instagram/, 'Instagram'],
  [/tiktok/, 'TikTok'],
  [/youtube|youtu\.be/, 'YouTube'],
  [/google/, 'Google'],
  [/bing/, 'Bing'],
  [/^t\.co$|twitter|^x\.com$/, 'X (Twitter)'],
  [/localhost|127\.0\.0\.1/, 'Pruebas en tu computador'],
]

export function nombreOrigen(origen: string): string {
  const limpio = origen.toLowerCase().replace(/^www\./, '')
  for (const [patron, nombre] of ORIGENES) if (patron.test(limpio)) return nombre
  // Un nombre propio (?origen=afiche) o un sitio cualquiera: "Afiche", "Eltiempo.com"
  return limpio ? limpio[0].toUpperCase() + limpio.slice(1) : 'Directo'
}

export const nombresDispositivo: Record<Dispositivo, string> = {
  movil: 'Celular',
  tablet: 'Tablet',
  escritorio: 'Computador',
}

/* ───────────── Formatos ───────────── */

const formatoNumero = new Intl.NumberFormat('es-CO')
const formatoPorcentaje = new Intl.NumberFormat('es-CO', { style: 'percent', maximumFractionDigits: 0 })

export const numero = (n: number) => formatoNumero.format(Math.round(n))
export const porcentaje = (fraccion: number) => formatoPorcentaje.format(Number.isFinite(fraccion) ? fraccion : 0)

/** 45000 → "45 s"; 130000 → "2 min 10 s"; 3900000 → "1 h 5 min" */
export function duracion(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '0 s'
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s} s`
  const min = Math.floor(s / 60)
  if (min < 60) return s % 60 ? `${min} min ${s % 60} s` : `${min} min`
  const h = Math.floor(min / 60)
  return min % 60 ? `${h} h ${min % 60} min` : `${h} h`
}
