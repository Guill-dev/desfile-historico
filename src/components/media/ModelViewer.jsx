import MediaPlaceholder from './MediaPlaceholder'

/**
 * Visor de modelos 3D (.glb / .gltf).
 *
 * Por ahora solo muestra el placeholder. Cuando existan los archivos, se implementa
 * aquí el visor real (cargado de forma diferida para no pesar en la carga inicial),
 * sin cambiar la interfaz: <ModelViewer src poster alt />.
 */
export default function ModelViewer({ src, alt, ratio = '1 / 1', className }) {
  if (!src) return <MediaPlaceholder etiqueta={alt || '[Modelo 3D pendiente]'} ratio={ratio} className={className} />

  // TODO(Fase objetos 3D): reemplazar por el visor 3D real.
  return <MediaPlaceholder etiqueta={`[Visor 3D por implementar: ${src}]`} ratio={ratio} className={className} />
}
