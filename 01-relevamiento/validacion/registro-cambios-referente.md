# Registro de cambios a informar a la referente

Registro único de los cambios al catálogo, al modelo del dominio y a las reglas posteriores a la última conformidad de la referente (constancia v2, firmada el 15/10/2026, `20261015_ConstanciaEntrevistas_Sanchez_v2_firmada.pdf`). Cada cambio se anota cuando se decide. Se presentan todos juntos en una sola constancia, en una sesión periódica, y no uno por uno. Lo mantiene el ingeniero; las columnas «Estado» y «Constancia» las cierra el autor.

## 1. Delegación de la referente

| Campo | Contenido |
|---|---|
| Qué autorizó | Que el autor decida los cambios necesarios y se los informe después, para su confirmación o corrección |
| Fecha | [DATO PENDIENTE: fecha en que la referente lo autorizó] |
| Canal | [DATO PENDIENTE: presencial, correo u otro] |
| Alcance | [DATO PENDIENTE: si alcanza a todo el catálogo o a algunos tipos de cambio] |
| Constancia | [DATO PENDIENTE: dónde consta; si no consta en ningún documento, registrarla en la próxima constancia] |

Mientras un cambio no está confirmado, el requisito conserva su estado de validación y su trazabilidad dice «pendiente de revalidación ante la referente». Si la referente corrige un cambio, se aplica su corrección y se registra aquí.

## 2. Estados

- **Pendiente:** decidido y aplicado; todavía no se informó.
- **Informado:** presentado en una constancia; sin respuesta todavía.
- **Confirmado** o **Corregido:** la referente respondió; se indica la constancia.

## 3. Cambios

| N.º | Fecha | Elemento | Cambio (redacción vigente) | Origen | Estado | Constancia |
|---|---|---|---|---|---|---|
| R-01 | 16/10/2026 | RF-15 · Consulta inversa | Se agregó CA-1: dado un proyecto con tres agentes cuyas reglas permiten, preguntan y deniegan `git push`, la consulta inversa de esa acción lista exactamente el agente cuya decisión es «permitida» | Ventana de Mejora AE2 (commit `63c1c26`) | Pendiente [VERIFICAR: si la referente ya lo conoce] | |
| R-02 | 16/10/2026 | RNF-01 | Se agregó CA-3, sobre el inventario de los archivos de los directorios de configuración alcanzados | Ventana de Mejora AE2 (`63c1c26`) | Pendiente [VERIFICAR: ídem] | |
| R-03 | 16/10/2026 | RF-17 · Motivo de la prioridad | El usuario necesita saber qué respuesta obtuvo para unos archivos y recuperarla para comparar antes y después de un cambio; además, sostiene la persistencia del caso vertical | Ventana de Mejora AE2 (`63c1c26`) | Pendiente [VERIFICAR: ídem] | |
| R-04 | 16/10/2026 | RNF-07 · Motivo de la prioridad | Se agregó que los 2 s se toman del tiempo de la alternativa que hoy usa el agente, el comando nativo | Ventana de Mejora AE2 (`63c1c26`) | Pendiente [VERIFICAR: ídem] | |
| R-05 | 22/10/2026 | RF-02 · Ruta del archivo (CA-9) | Ante una acción sobre un **archivo o un directorio** del proyecto expresada con ruta absoluta o relativa, RIGE informa la misma decisión que OpenCode. Se agrega el escenario de exposición: una regla `deny` escrita con la ruta absoluta de `config/credenciales.json` o del directorio `privado` no tiene efecto, y RIGE lo informa como «permitida», igual que OpenCode | Línea de base: ADR-098, punto 8 y Contexto 16 | Pendiente | |
| R-06 | 22/10/2026 | RF-07 · Forma que coincide (CA-5 nuevo) | Cuando una regla de permiso no tiene efecto porque está escrita con la ruta absoluta de un archivo del proyecto, RIGE informa además la forma relativa que sí coincide y la decisión que produciría, verificada con su evaluador. Si no puede verificarla, no propone nada | ADR-100 (propuesto); línea base de ADR-098 | Pendiente | |
