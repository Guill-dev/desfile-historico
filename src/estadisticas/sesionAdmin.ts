import { CLAVES, supabase } from './config'

/**
 * Inicio de sesión del administrador en Supabase (correo y contraseña).
 * La cuenta se crea en el panel de Supabase; desde el sitio nadie puede registrarse.
 * Aunque alguien entrara con otra cuenta, la base de datos solo deja leer a quien esté en "administradores".
 */

export interface SesionAdmin {
  token: string
  renovar: string
  /** Vence (Date.now() en ms) */
  vence: number
  correo: string
}

interface RespuestaToken {
  access_token: string
  refresh_token: string
  expires_in: number
  user?: { email?: string }
}

function guardar(sesion: SesionAdmin | null): void {
  try {
    if (sesion) localStorage.setItem(CLAVES.sesionAdmin, JSON.stringify(sesion))
    else localStorage.removeItem(CLAVES.sesionAdmin)
  } catch {
    // sin almacenamiento: la sesión dura lo que la pestaña
  }
}

export function sesionGuardada(): SesionAdmin | null {
  try {
    const texto = localStorage.getItem(CLAVES.sesionAdmin)
    return texto ? (JSON.parse(texto) as SesionAdmin) : null
  } catch {
    return null
  }
}

async function pedirToken(tipo: 'password' | 'refresh_token', cuerpo: object): Promise<SesionAdmin> {
  if (!supabase) throw new Error('Supabase no está configurado.')
  const respuesta = await fetch(`${supabase.url}/auth/v1/token?grant_type=${tipo}`, {
    method: 'POST',
    headers: { apikey: supabase.clave, 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  })
  if (!respuesta.ok) {
    if (respuesta.status === 400 || respuesta.status === 401) throw new Error('Correo o contraseña incorrectos.')
    if (respuesta.status === 429) throw new Error('Demasiados intentos. Espera unos minutos.')
    throw new Error(`No se pudo iniciar sesión (error ${respuesta.status}).`)
  }
  const datos = (await respuesta.json()) as RespuestaToken
  const sesion: SesionAdmin = {
    token: datos.access_token,
    renovar: datos.refresh_token,
    vence: Date.now() + datos.expires_in * 1000,
    correo: datos.user?.email ?? sesionGuardada()?.correo ?? '',
  }
  guardar(sesion)
  return sesion
}

export function entrar(correo: string, clave: string): Promise<SesionAdmin> {
  return pedirToken('password', { email: correo, password: clave })
}

/** Un token vigente: si está por vencer, lo renueva. null si no hay sesión o ya no se puede renovar. */
export async function tokenVigente(): Promise<string | null> {
  const sesion = sesionGuardada()
  if (!sesion) return null
  if (sesion.vence - Date.now() > 60_000) return sesion.token
  try {
    return (await pedirToken('refresh_token', { refresh_token: sesion.renovar })).token
  } catch {
    guardar(null)
    return null
  }
}

/** ¿La cuenta con la que se entró está en la tabla "administradores"? */
export async function esAdministrador(token: string): Promise<boolean> {
  if (!supabase) return false
  const respuesta = await fetch(`${supabase.url}/rest/v1/rpc/es_admin`, {
    method: 'POST',
    headers: { apikey: supabase.clave, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: '{}',
  })
  return respuesta.ok && (await respuesta.json()) === true
}

export async function salir(): Promise<void> {
  const sesion = sesionGuardada()
  guardar(null)
  if (!supabase || !sesion) return
  try {
    await fetch(`${supabase.url}/auth/v1/logout`, {
      method: 'POST',
      headers: { apikey: supabase.clave, Authorization: `Bearer ${sesion.token}` },
    })
  } catch {
    // la sesión ya se borró de este navegador
  }
}
