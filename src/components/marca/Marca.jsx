import { cx } from '@/utils/cx'
import Bandera from './Bandera'
import styles from './Marca.module.css'

/** Marca provisional del sitio (hasta tener un logo propio): bandera + nombre. */
export default function Marca({ className }) {
  return (
    <span className={cx(styles.marca, className)}>
      <Bandera className={styles.bandera} />
      <span className={styles.texto}>
        <b>Desfile Histórico</b>
        <span className={cx('mono', styles.lugar)}>Gualmatán · Nariño</span>
      </span>
    </span>
  )
}
