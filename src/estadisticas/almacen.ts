import type { Evento } from './tipos'
import { CLAVES, modo, supabase } from './config'

/** Máximo de eventos guardados en el navegador en modo local (los más viejos se descartan) */
const MAXIMO_LOCAL = 20000
/** Eventos por pedido al leer de Supabase */
const POR_PAGINA = 1000

const COLUMNAS = 'tipo,creado,ruta,sesion,visitante,vista,dispositivo,datos'

/* ───────────── Enviar ───────────── */

/**
 * Guarda un grupo de eventos. Nunca falla hacia afuera: medir no puede romper el sitio.
 * `alSalir`: la página se está cerrando; el envío sigue aunque la pestaña ya no exista (keepalive).
 */
export async function guardarEventos(eventos: Evento[], alSalir = false): Promise<void> {
  if (eventos.length === 0) return

  if (modo === 'supabase' && supabase) {
    try {
      await fetch(`${supabase.url}/rest/v1/eventos`, {
        method: 'POST',
        keepalive: alSalir,
        headers: { apikey: supabase.clave, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify(eventos),
      })
    } catch {
      // Sin conexión o bloqueado: se pierde este grupo, el sitio sigue normal
    }
    return
  }

  if (modo === 'local') {
    try {
      const todos = [...leerLocales(), ...eventos].slice(-MAXIMO_LOCAL)
      localStorage.setItem(CLAVES.eventosLocales, JSON.stringify(todos))
    } catch {
      // Navegador sin espacio o en modo privado
    }
  }
}

/* ───────────── Leer (solo el panel) ───────────── */

function leerLocales(): Evento[] {
  try {
    const texto = localStorage.getItem(CLAVES.eventosLocales)
    return texto ? (JSON.parse(texto) as Evento[]) : []
  } catch {
    return []
  }
}

/** Borra los eventos guardados en este navegador (modo local) */
export function borrarLocales(): void {
  try {
    localStorage.removeItem(CLAVES.eventosLocales)
  } catch {
    // nada que borrar
  }
}

/**
 * Trae los eventos desde una fecha. En Supabase pide de a mil y avisa el avance con `alAvanzar`.
 * `token`: la sesión del administrador (solo él puede leer).
 */
export async function leerEventos(desde: Date, token: string | null, alAvanzar?: (leidos: number, total: number) => void): Promise<Evento[]> {
  if (modo !== 'supabase' || !supabase) {
    const limite = desde.toISOString()
    return leerLocales().filter((e) => e.creado >= limite)
  }
  if (!token) throw new Error('Inicia sesión para ver las estadísticas.')

  const filtro = `select=${COLUMNAS}&creado=gte.${encodeURIComponent(desde.toISOString())}&order=creado.asc,id.asc`
  const eventos: Evento[] = []
  let total = Infinity

  while (eventos.length < total) {
    const desdeFila = eventos.length
    const respuesta = await fetch(`${supabase.url}/rest/v1/eventos?${filtro}`, {
      headers: {
        apikey: supabase.clave,
        Authorization: `Bearer ${token}`,
        Range: `${desdeFila}-${desdeFila + POR_PAGINA - 1}`,
        Prefer: 'count=exact',
      },
    })
    if (respuesta.status === 401 || respuesta.status === 403) throw new Error('Tu sesión venció o no tienes permiso. Vuelve a entrar.')
    if (!respuesta.ok) throw new Error(`No se pudieron leer las estadísticas (error ${respuesta.status}).`)

    const pagina = (await respuesta.json()) as Evento[]
    // "Content-Range: 0-999/12345" → el total va después de la barra
    const rango = respuesta.headers.get('Content-Range')
    const totalInformado = Number(rango?.split('/')[1])
    // Sin total informado: seguir mientras lleguen páginas llenas
    if (Number.isFinite(totalInformado)) total = totalInformado
    else if (pagina.length < POR_PAGINA) total = eventos.length + pagina.length

    eventos.push(...pagina)
    alAvanzar?.(eventos.length, total)
    if (pagina.length === 0) break
  }
  return eventos
}
