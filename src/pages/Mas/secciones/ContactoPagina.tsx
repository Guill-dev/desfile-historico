import { useSearchParams } from 'react-router'
import { siFacebook, siGmail, siInstagram, siWhatsapp } from 'simple-icons'
import { contacto } from '@/data/contacto'
import { pasos } from '@/data/pasos'
import { sitio } from '@/data/sitio'
import { cx } from '@/utils/cx'
import { tituloPagina } from '@/utils/titulo'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import CabeceraPagina from '@/components/ui/CabeceraPagina'
import type { PaginaMasProps } from '../paginas'
import styles from './ContactoPagina.module.css'

interface Red {
  id: 'gmail' | 'whatsapp' | 'instagram' | 'facebook'
  /** Para lectores de pantalla (en pantalla solo se ve el logo) */
  accion: string
  href: string
  /** Dibujo del logo (de simple-icons, libre de uso) */
  logo: string
  /** Se abre en otra pestaña */
  externo: boolean
}

/**
 * /mas/contacto — cuatro botones grandes con los logos: Gmail, WhatsApp, Instagram y Facebook.
 * Los datos salen de data/contacto.ts; cada botón aparece solo si su dato está puesto.
 * Si se llega desde un paso sin foto (/mas/contacto?paso=12), el correo y el WhatsApp ya llevan
 * escrito de qué paso es la foto.
 */
export default function ContactoPagina({ seccion }: PaginaMasProps) {
  const [params] = useSearchParams()
  // En el celular, el correo abre la aplicación; en el computador, Gmail en el navegador
  const celular = useMediaQuery('(pointer: coarse)')

  const paso = pasos.find((p) => String(p.numero) === params.get('paso'))
  const nn = paso ? String(paso.numero).padStart(2, '0') : ''
  const asunto = paso ? `Foto para el paso ${nn}: ${paso.titulo}` : sitio.nombre
  const mensaje = paso
    ? `Hola, tengo una foto del paso ${nn} (${paso.titulo}) del ${sitio.nombre}.`
    : `Hola, les escribo desde la página del ${sitio.nombre}.`

  const redes: Red[] = []
  if (contacto.correo) {
    const para = encodeURIComponent(contacto.correo)
    const texto = { su: encodeURIComponent(asunto), body: encodeURIComponent(mensaje) }
    redes.push({
      id: 'gmail',
      accion: 'Escribir un correo',
      logo: siGmail.path,
      href: celular
        ? `mailto:${contacto.correo}?subject=${texto.su}&body=${texto.body}`
        : `https://mail.google.com/mail/?view=cm&fs=1&to=${para}&su=${texto.su}&body=${texto.body}`,
      externo: !celular,
    })
  }
  if (contacto.whatsapp) {
    redes.push({
      id: 'whatsapp',
      accion: 'Escribir por WhatsApp',
      logo: siWhatsapp.path,
      href: `https://wa.me/${contacto.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`,
      externo: true,
    })
  }
  if (contacto.instagram) {
    redes.push({ id: 'instagram', accion: 'Ir a Instagram', logo: siInstagram.path, href: contacto.instagram, externo: true })
  }
  if (contacto.facebook) {
    redes.push({ id: 'facebook', accion: 'Ir a Facebook', logo: siFacebook.path, href: contacto.facebook, externo: true })
  }

  return (
    <div className="tema-papel">
      <title>{tituloPagina(seccion.titulo)}</title>
      <CabeceraPagina volver={{ to: { pathname: '/', hash: '#mas' }, texto: 'Más' }} kicker="Más del archivo" titulo={seccion.titulo}>
        <p className={styles.intro}>¿Tienes fotos, recuerdos o datos del desfile? Escríbenos por donde prefieras.</p>
      </CabeceraPagina>

      <div className={cx('contenedor', styles.cuerpo)}>
        <section className={cx('tema-noche', styles.panel)} aria-label="Escríbenos">
          {paso && (
            <p className={styles.paso}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 8h3l2-2.5h6L17 8h3v11H4z" />
                <circle cx="12" cy="13" r="3.5" />
              </svg>
              <span>
                Sobre la foto del <strong>paso {nn}</strong> · {paso.titulo}. Tu mensaje ya dice de qué paso es.
              </span>
            </p>
          )}

          {redes.length > 0 ? (
            <ul role="list" className={styles.redes}>
              {redes.map((r, i) => (
                <li key={r.id}>
                  <a
                    href={r.href}
                    className={cx(styles.red, styles[r.id])}
                    style={{ '--i': i }}
                    aria-label={r.accion}
                    {...(r.externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d={r.logo} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mono">[Datos de contacto pendientes]</p>
          )}
        </section>
      </div>
    </div>
  )
}
