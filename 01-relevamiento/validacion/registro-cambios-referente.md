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
| R-03 | 16/10/2026 | RF-17 · Motivo de la prioridad | El usuario necesita saber qué respuesta obtuvo para unos archivos y recuperarla; sostiene además la persistencia del caso vertical. *Precisión del 24/10/2026:* se retira la comparación antes y después de un cambio, excluida por L-09 | Ventana de Mejora AE2 (`63c1c26`) | Pendiente [VERIFICAR: ídem] | |
| R-04 | 16/10/2026 | RNF-07 · Motivo de la prioridad | Se agregó que los 2 s se toman del tiempo de la alternativa que hoy usa el agente, el comando nativo | Ventana de Mejora AE2 (`63c1c26`) | Pendiente [VERIFICAR: ídem] | |
| R-05 | 22/10/2026 | RF-02 · Ruta del archivo (CA-9) | Ante una acción sobre un **archivo o un directorio** del proyecto expresada con ruta absoluta o relativa, RIGE informa la misma decisión que OpenCode. Se agrega el escenario de exposición: una regla `deny` escrita con la ruta absoluta de `config/credenciales.json` o del directorio `privado` no tiene efecto, y RIGE lo informa como «permitida», igual que OpenCode | Línea de base: ADR-098, punto 8 y Contexto 16 | Pendiente | |
| R-06 | 22/10/2026 | RF-07 · Forma que coincide (CA-5 nuevo) | Cuando una regla de permiso no tiene efecto porque está escrita con la ruta absoluta de un archivo del proyecto, RIGE informa además la forma relativa que sí coincide y la decisión que produciría, verificada con su evaluador. Si no puede verificarla, no propone nada *Precisión del 24/10/2026 (R-11):* la forma propuesta se verifica contra el comportamiento del binario de OpenCode 1.18.25, con el orden de declaración fijado | ADR-088 (modificación del 22/10/2026); línea base de ADR-098 | Pendiente | |
| R-07 | 22/10/2026 | RE-02 · Regla sin efecto | Además de la regla tapada por otra posterior, una regla queda sin efecto si declara la ruta absoluta de un archivo o directorio del proyecto, porque OpenCode compara con la ruta relativa | ADR-088 (punto 3 de la modificación del 22/10/2026); línea de base de ADR-098 | Pendiente | |
| R-08 | 24/10/2026 | Problema (I.3.1) | El problema se reformuló hacia la verificabilidad del efecto de la configuración: el agente en el que el desarrollador delega la configuración declara terminado un cambio de permisos que no produce el efecto pedido, y casi nunca lo prueba. En la línea de base, el mecanismo observado es la regla de permiso escrita con ruta absoluta. Hay que pedir a la referente que confirme si reconoce el problema reformulado en su práctica y su vínculo con el episodio de la configuración que no producía el efecto esperado (A.VI.5) | ADR-090; ADR-098, punto 13; revisión de I.3 del 24/10/2026 (hallazgo 33): según el autor, no se le presentó | Pendiente | |
| R-09 | 24/10/2026 | Evidencia de la práctica (II.3.3) | Pedidos para la próxima constancia conjunta: (1) fecha de creación de la definición de Charles; (2) con su consentimiento, una lectura estática de la configuración real de OpenCode del equipo, contando las reglas de permiso por ruta y cuántas usan ruta absoluta, sin reproducir contenido privado; (3) si existe, el historial de cambios de esos archivos, para contar los cambios de permisos en un período; (4) autorización explícita para publicar su nombre y rol, si no consta ya en el consentimiento otorgado | Revisión del Cap. II del 24/10/2026 ([MÉTODO] 3 del crítico); decisión del autor del 24/10/2026 | Pendiente | |
| R-10 | 24/10/2026 | L-07 · Agente que modifica la configuración | Se parte el límite: RIGE informa el efecto de la configuración escrita (la decisión resultante, RF-02 CA-9, y las declaraciones sin efecto, RF-07); queda fuera conocer la intención del cambio, editarlo, aplicarlo o certificarlo. Antes excluía «la aplicación o validación de los cambios que ese agente realiza» | Revisión del Cap. III del 24/10/2026; problema reformulado (R-08) | Pendiente | |
| R-11 | 24/10/2026 | Dominio y criterios · RD-08, Consulta de permiso, Hallazgo, Elemento–Declaración, RF-02 CA-9, RF-03, RNF-04, RNF-07 | Regla de derivación nueva RD-08 (el sujeto de una acción sobre archivos se evalúa relativo al árbol de trabajo); la acción como atributo de la Consulta de permiso; Regla de permiso como destino posible de un Hallazgo; a lo sumo una declaración determinante por clave del elemento; CA-9 con orden de declaración fijado y escenarios por tipo de permiso, verificados contra el binario; RF-03 extendido a los hallazgos; representación pública del valor sustituido (RNF-04); consulta de una decisión en RNF-07 | Revisión del Cap. III del 24/10/2026 | Pendiente | |
