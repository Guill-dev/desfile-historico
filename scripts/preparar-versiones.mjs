/**
 * ORGANIZAR LAS FOTOS DE CADA AÑO DEL DESFILE, a mano (ver GUIA, sección 6)
 *
 * Con `npm run dev` abierto no hace falta: el sitio organiza solo las fotos que se sueltan en
 * public/media/versiones/<año>/. Este comando sirve para hacerlo sin el sitio abierto:
 *
 *   npm run versiones
 *
 * Lo que hace está en scripts/organizar-versiones.mjs.
 */
import path from 'node:path'
import { organizarVersiones } from './organizar-versiones.mjs'

const { organizadas, pendientes } = await organizarVersiones({ raiz: path.join(import.meta.dirname, '..') })
if (organizadas === 0 && pendientes === 0) console.log('Nada nuevo: todas las fotos ya estaban organizadas.')
if (pendientes > 0) console.log(`${pendientes} fotos se estaban copiando todavía: vuelve a correrlo en un momento.`)
