import type { DetailedHTMLProps, HTMLAttributes } from 'react'

/**
 * <model-viewer> (de @google/model-viewer) para TypeScript: los atributos que usa ModelViewer.tsx.
 * Los atributos de sí/no ("camera-controls", "auto-rotate") se activan con '' y se quitan con undefined.
 */
type Interruptor = '' | undefined

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string
        alt?: string
        poster?: string
        loading?: 'auto' | 'lazy' | 'eager'
        reveal?: 'auto' | 'manual'
        exposure?: string
        'camera-controls'?: Interruptor
        'auto-rotate'?: Interruptor
        'auto-rotate-delay'?: string
        'rotation-per-second'?: string
        'interaction-prompt'?: 'auto' | 'none'
        'shadow-intensity'?: string
        'touch-action'?: 'pan-y' | 'pan-x' | 'none'
      }
    }
  }
}
