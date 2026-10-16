/** Une nombres de clase ignorando valores falsos: cx('a', cond && 'b') */
export function cx(...clases: Array<string | false | null | undefined>): string {
  return clases.filter(Boolean).join(' ')
}
