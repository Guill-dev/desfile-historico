/** Une nombres de clase ignorando valores falsos: cx('a', cond && 'b') */
export function cx(...clases) {
  return clases.filter(Boolean).join(' ')
}
