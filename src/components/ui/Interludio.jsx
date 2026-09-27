import { cx } from '@/utils/cx'
import Reveal from './Reveal'
import styles from './Interludio.module.css'

/** Frase puente entre capítulos, a gran tamaño. */
export default function Interludio({ frase }) {
  return <Reveal as="p" className={cx('display', styles.frase)}>{frase}</Reveal>
}
