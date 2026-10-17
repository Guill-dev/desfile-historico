# Base de datos de participantes — diseño

Estado: **propuesta** (aún no está creada). Plan: guardar las participaciones en **Supabase** (base de datos gratuita para empezar)
y que el sitio las lea de ahí: cronología de cada persona, buscador por nombre, quiénes salieron en cada año, etc.

## Decisiones tomadas
- **Solo el administrador carga datos.** El público no sube nada; solo ve lo publicado.
- **De cada persona se guarda únicamente su nombre completo** (en un solo campo) y su foto, con autorización.
- **Todo lo demás sale de listas** que controla el administrador: año, paso (68) y personaje.
- **Una fila = una participación**: persona + año + paso + personaje. Una persona con 20 años de recorrido tiene 20 filas.
- Recolección: **años anteriores** → plantilla de Excel (`docs/plantillas/datos-desfile.xlsx`) ·
  **desde 2027** → un Google Forms por año.

## Las tablas

```
 pasos ──< personajes
   │            │
   └────┐   ┌───┘
        ▼   ▼
 personas ──< participaciones >── ediciones (años)
```

| Tabla | Campos | Notas |
|---|---|---|
| **pasos** | número (1–68), nombre, descripción | Los 68 pasos (estampas) del desfile |
| **personajes** | paso, nombre, tipo (principal / secundario) | Cada personaje pertenece a un paso |
| **ediciones** | año, título, resumen, portada | Un registro por año del desfile (hoy "Versiones" en el sitio) |
| **personas** | nombre completo, nombre normalizado | El normalizado (sin tildes ni mayúsculas) evita duplicados |
| **participaciones** | persona, año, paso, personaje *o* "otro personaje" (texto), foto, autoriza publicar, notas | La pieza central |

### Reglas que la base de datos hace cumplir
- **No se repite una persona**: "Guillermo Alejandro Hernández Quirós" y "guillermo alejandro hernandez quiros" son la misma
  (se comparan sin tildes ni mayúsculas). Si dos personas distintas se llaman exactamente igual, el administrador las distingue
  (por ejemplo, agregando "(hijo)").
- **Solo se publica lo autorizado**: una participación con "autoriza publicar = No" se guarda, pero **la base de datos misma**
  impide mostrarla al público (no depende de que el sitio "se acuerde" de esconderla).
- **Solo el administrador escribe**: el público solo puede leer, y solo lo autorizado.
- El paso de una participación debe existir en la lista de pasos (no se aceptan pasos mal escritos).

## Qué podrá mostrar el sitio con esto
- **Busca tu nombre** → la **cronología** de la persona: cada año, su paso, su personaje y su foto.
- **Cada edición (año)** → quiénes participaron, paso por paso.
- **Cada paso** → sus personajes y quiénes los han representado.
- **Cada personaje** → quién lo hizo cada año (el "mismo personaje a través de los años").

## El formulario de Google (desde 2027)
Título: *Participación — Desfile Histórico de Gualmatán 2027*

1. **Nombre completo** — respuesta corta, obligatoria.
   Ayuda: "Escríbelo completo y con tildes, igual que en tu documento. Ej.: Guillermo Alejandro Hernández Quirós".
2. **¿En qué paso participas?** — lista desplegable con los 68 pasos, obligatoria.
3. **¿Qué personaje representas?** — opción múltiple con los personajes **de ese paso** + **"Otro"** (para escribir uno secundario).
   Para que salgan solo los personajes del paso elegido, el formulario usa una sección por paso
   ("ir a la sección según la respuesta"). Hacer 68 secciones a mano es largo: **se puede generar automáticamente**
   con un script a partir de las hojas «Pasos» y «Personajes» de la plantilla.
4. **Foto** — subir archivo. Ojo: Google exige que quien responde **inicie sesión con una cuenta de Google** para subir archivos.
   Alternativa: pedir la foto por WhatsApp o correo con el nombre completo.
5. **Autorización** — casilla obligatoria (texto abajo).
6. **¿El participante es menor de edad?** — Sí / No. Si es Sí: nombre de la madre, padre o acudiente que autoriza.

### Texto de autorización (borrador, conviene que lo revise alguien de la alcaldía o un abogado)
> Autorizo al proyecto *Desfile Histórico de Gualmatán* a publicar en su sitio web mi nombre completo, mi participación en el
> desfile (año, paso y personaje) y la fotografía que envío, con fines culturales y de memoria histórica, sin ánimo de lucro.
> Sé que puedo pedir en cualquier momento que se corrija o se retire esta información escribiendo a **[correo de contacto]**.
> Si el participante es menor de edad, esta autorización la da su madre, padre o acudiente. *(Ley 1581 de 2012)*

## Cómo se actualiza cada año
1. Se crea el formulario del año nuevo (el mismo, cambiando el año).
2. Se comparte el enlace; las respuestas caen en una hoja de Google Sheets.
3. El administrador revisa los nombres (que coincidan con los de años anteriores) y las fotos.
4. Se importan a la base de datos → el sitio se actualiza solo.

## Pasos siguientes
- [ ] Llenar en la plantilla las hojas **Pasos** (68) y **Personajes**.
- [ ] Crear la cuenta gratuita de Supabase (la crea el administrador con su correo).
- [ ] Crear las tablas y las reglas de seguridad, y conectar el sitio (persona + cronología + buscador).
- [ ] Script que genera el Google Forms a partir de las listas.
- [ ] Importar la hoja «Participaciones» de años anteriores.
