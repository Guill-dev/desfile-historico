/**
 * CONTACTO — a dónde escribe la gente (página /mas/contacto).
 *
 * Los datos reales están, por ahora, en src/data/contacto.textos.ts: un archivo que vive solo en el
 * computador del administrador y no se sube a GitHub hasta que él lo decida (ver GUIA, sección 6).
 * Cada botón aparece solo si su dato está puesto.
 */
export interface Contacto {
  /** Correo: el botón de Gmail abre un mensaje nuevo para esta dirección */
  correo?: string
  /** WhatsApp: solo números, con el código del país (57 en Colombia): '573001234567' */
  whatsapp?: string
  /** Enlace completo del perfil: 'https://www.instagram.com/usuario/' */
  instagram?: string
  /** Enlace completo del perfil: 'https://www.facebook.com/usuario' */
  facebook?: string
}

// import.meta.glob no falla si el archivo no existe: en ese caso devuelve un objeto vacío
const locales = import.meta.glob<{ contacto: Contacto }>('./contacto.textos.ts', { eager: true })

export const contacto: Contacto = Object.values(locales)[0]?.contacto ?? {}
