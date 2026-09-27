/** Bandera de Gualmatán (proporción 3:2): verde arriba, franja blanca diagonal, rojo abajo. */
export default function Bandera(props) {
  return (
    <svg viewBox="0 0 30 20" aria-hidden="true" focusable="false" {...props}>
      <rect width="30" height="20" fill="#ffffff" />
      <polygon points="5,0 30,0 30,15" fill="#078930" />
      <polygon points="0,5 25,20 0,20" fill="#da121a" />
    </svg>
  )
}
