import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router'
import { modo } from '@/estadisticas/config'
import { cambiarNoMedir } from '@/estadisticas/rastreador'
import { entrar, esAdministrador, salir, sesionGuardada, tokenVigente } from '@/estadisticas/sesionAdmin'
import { tituloPagina } from '@/utils/titulo'
import { cx } from '@/utils/cx'
import Marca from '@/components/marca/Marca'
import Panel from './Panel'
import styles from './AdminPagina.module.css'

/**
 * /admin — el panel de estadísticas. No aparece en ningún menú y los buscadores no lo indexan.
 *  - Con Supabase: pide correo y contraseña; la base de datos solo deja leer a los administradores.
 *  - Sin Supabase, en desarrollo: abre directo con las visitas guardadas en este navegador.
 */
export default function AdminPagina() {
  return (
    <div className={cx('tema-papel', styles.pagina)}>
      <title>{tituloPagina('Estadísticas')}</title>
      <meta name="robots" content="noindex, nofollow" />
      {modo === 'supabase' && <ConSupabase />}
      {modo === 'local' && <Panel modo="local" />}
      {modo === 'apagado' && <SinConectar />}
    </div>
  )
}

type Estado = 'revisando' | 'fuera' | 'sinPermiso' | 'dentro'

function ConSupabase() {
  const [estado, setEstado] = useState<Estado>('revisando')
  const [correo, setCorreo] = useState(() => sesionGuardada()?.correo ?? '')

  useEffect(() => {
    let vigente = true
    const revisar = async () => {
      const token = await tokenVigente()
      if (!vigente) return
      if (!token) return setEstado('fuera')
      const admin = await esAdministrador(token).catch(() => false)
      if (vigente) setEstado(admin ? 'dentro' : 'sinPermiso')
    }
    void revisar()
    return () => {
      vigente = false
    }
  }, [])

  const cerrar = useCallback(() => {
    void salir()
    setEstado('fuera')
  }, [])

  if (estado === 'revisando') return <p className={cx('mono suave', styles.centro)}>Revisando la sesión…</p>
  if (estado === 'dentro') return <Panel modo="supabase" correo={correo} onSalir={cerrar} />

  return (
    <Caja>
      {estado === 'sinPermiso' ? (
        <>
          <h1>Sin permiso</h1>
          <p>La cuenta <b>{correo}</b> entró bien, pero no está en la lista de administradores de la base de datos.</p>
          <p className={styles.nota}>Para agregarla, sigue el paso 4 de la sección 13 de la GUIA.</p>
          <button type="button" className={styles.boton} onClick={cerrar}>
            Usar otra cuenta
          </button>
        </>
      ) : (
        <Ingreso
          correoInicial={correo}
          alEntrar={(nuevoCorreo, admin) => {
            setCorreo(nuevoCorreo)
            setEstado(admin ? 'dentro' : 'sinPermiso')
          }}
        />
      )}
    </Caja>
  )
}

function Ingreso({ correoInicial, alEntrar }: { correoInicial: string; alEntrar: (correo: string, admin: boolean) => void }) {
  const [correo, setCorreo] = useState(correoInicial)
  const [clave, setClave] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      const sesion = await entrar(correo.trim(), clave)
      const admin = await esAdministrador(sesion.token)
      // El navegador del administrador no se cuenta en las estadísticas
      if (admin) cambiarNoMedir(true)
      alEntrar(sesion.correo || correo.trim(), admin)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.')
      setEnviando(false)
    }
  }

  return (
    <form className={styles.formulario} onSubmit={enviar}>
      <h1>Estadísticas</h1>
      <p className={styles.nota}>Solo para la administración del sitio.</p>
      <label>
        <span>Correo</span>
        <input type="email" autoComplete="username" required value={correo} onChange={(e) => setCorreo(e.target.value)} />
      </label>
      <label>
        <span>Contraseña</span>
        <input type="password" autoComplete="current-password" required value={clave} onChange={(e) => setClave(e.target.value)} />
      </label>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <button type="submit" className={cx(styles.boton, styles.principal)} disabled={enviando}>
        {enviando ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}

function SinConectar() {
  return (
    <Caja>
      <h1>Estadísticas sin conectar</h1>
      <p>
        Para medir las visitas del sitio publicado hay que conectar la base de datos (Supabase). Mientras tanto no se mide nada.
      </p>
      <p className={styles.nota}>Los pasos están en la sección 13 de la GUIA del proyecto.</p>
    </Caja>
  )
}

function Caja({ children }: { children: ReactNode }) {
  return (
    <div className={styles.centro}>
      <Link to="/" className={styles.marca} aria-label="Ir al sitio">
        <Marca />
      </Link>
      <div className={styles.caja}>{children}</div>
    </div>
  )
}
