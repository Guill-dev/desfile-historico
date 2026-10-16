import 'react'

// Permite usar variables CSS en el atributo style: style={{ '--k': 3 }}
declare module 'react' {
  interface CSSProperties {
    [variable: `--${string}`]: string | number | undefined
  }
}
