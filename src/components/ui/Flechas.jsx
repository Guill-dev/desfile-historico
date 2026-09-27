import styles from './Flechas.module.css'

/** Flechas anterior / siguiente de un carrusel (en móvil se oculta: se desliza con el dedo). */
export default function Flechas({ anterior, siguiente, etiqueta }) {
  return (
    <div className={styles.flechas} role="group" aria-label={`Desplazar ${etiqueta}`}>
      <button type="button" onClick={anterior} aria-label="Anterior">←</button>
      <button type="button" onClick={siguiente} aria-label="Siguiente">→</button>
    </div>
  )
}
