# Correcciones del grupo A · Caps. I y II, Anexos I y II · 25/09/2026

**Tipo.** Informe de hallazgos previo a `/corregir` (paso 2 de la sesión). No modifica el informe.

**Alcance.** I.1, I.2, I.5, I.6 (salvo I.6.6), II.5, Anexo I (A.I.3 y A.I.5), Anexo II (A.II.1). Transversales: A-01 y M-03 (II.6.1 y `informe/bibliografia.md`). Diagnóstico de A-03, sin aplicación.

**Leído.**
- `CLAUDE.md`, `00-gestion/reglas-catedra.md`, `00-gestion/estado.md`.
- `00-gestion/pendientes.md`: AD-07 a AD-10, A-01 a A-03, M-03.
- ADR-020, 021, 026, 032, 034, 035, 036, 041 y 042.
- `00-gestion/revisiones/20260925-evidencia-entrevista.md`.
- Para verificar AD-08, A-03 y los conflictos: `01-relevamiento/opencode-como-funciona.md` §3; `01-relevamiento/linea-base/respuestas.md` (línea 127); ADR-037 (P2); ADR-040 (capítulos afectados); `informe/cap-03/III.3-alcance-sistema-alcance-proyecto.md` (Tabla 7); `03-requisitos/libro/catalogo/RF-13.md`; `03-requisitos/libro/trazabilidad.md`; `catedra/AE2-guia.md` y `catedra/AE2-plantilla-informe.md`; `tools/armar.py`.

**Convenciones.**
- Tipo **R**: reemplazo o supresión de texto. Tipo **N**: exige redactar contenido nuevo (listado aparte en la sección 3).
- Recomendación: **Aplicar** · **Elegir** (depende de un conflicto de la sección 4) · **Opcional** · **Sin cambio** · **Diferir** (grupo C u otra pasada).
- Las líneas corresponden al estado de los archivos del 25/09/2026, antes de cualquier corrección.

---

## 1. Resumen

- **55 hallazgos:** 36 para aplicar, 15 que dependen de un conflicto, 2 opcionales, 1 sin cambio y 1 diferido.
- **10 conflictos** (C-1 a C-10). Ninguno exige un ADR nuevo. A-03 sí lo exige, y se propone `/decidir` (sección 5).
- **Pendientes que no se pueden cerrar completos con este alcance:**
  - **A-01** tiene ocurrencias en secciones del grupo C (C-9).
  - **AD-08** exige corregir también `01-relevamiento/opencode-como-funciona.md` §3, que está fuera de la zona de escritura del ingeniero y del alcance de la sesión (C-8).
- **Se pueden cerrar:** A-02 y M-03. AD-07, AD-09 y AD-10 quedan con avance parcial.

| ID | Sección · línea | Cambio | Decisión | Tipo | Recomendación |
|---|---|---|---|---|---|
| GA-01 | I.2.4 · 21 | OE-1, enunciado | ADR-034, ADR-035, ADR-020 | R | Elegir (C-1) |
| GA-02 | I.2.4 · 21 | OE-1, indicador sin relaciones | ADR-034 | R | Aplicar |
| GA-03 | I.2.2 · 9 | Visión: relaciones como capacidad diferida | ADR-034, ADR-026 | R | Aplicar |
| GA-04 | I.2.4 · 30 | CLI verificada también por OE-3 | ADR-042 | R | Elegir (C-3) |
| GA-05 | I.2.4 · 23 | OE-3 «por ambas interfaces» | ADR-042 | R | Elegir (C-3) |
| GA-06 | I.5 · 5 | «aplicación de escritorio» | ADR-032 (AD-07) | R | Aplicar |
| GA-07 | I.5 · 5 | Papel de cada interfaz y actor externo | ADR-032, ADR-042, A-02 | N | Aplicar |
| GA-08 | I.5 · 7 | Destinatarios: el agente consultante | A-02 | N | Aplicar |
| GA-09 | I.5 · 5 | «y de las relaciones entre ellos» | ADR-034 | — | Sin cambio (C-4) |
| GA-10 | I.6.2 · 23 | «interpretación de las fuentes» | ADR-020 (A-01) | R | Aplicar |
| GA-11 | I.6.2 · 23 | Dos interfaces: papel de cada una | ADR-032, ADR-042 (AD-07) | N | Aplicar |
| GA-12 | I.6.2 · 29 | Tabla 7, F3 sin OE-1 | ADR-034 | R | Aplicar |
| GA-13 | I.6.2 · 32 | Tabla 7, F6 | ADR-034 | R | Elegir (C-2) |
| GA-14 | I.6.2 · 36 | Explicación en ambas interfaces | ADR-036 (E3), ADR-021 | R | Aplicar |
| GA-15 | I.6.2 · 40 | «lectura directa de las fuentes» | ADR-020 (A-01) | R | Aplicar |
| GA-16 | I.6.2 · 40 | Práctica del equipo como relato | Evidencia de la entrevista | R | Elegir (C-5) |
| GA-17 | I.6.3 · 52 | Tabla 8, «ninguna fuente» | ADR-020 (A-01) | R | Aplicar |
| GA-18 | I.6.3 · 58 | Tabla 8, «carga de la fuente» | ADR-020 (A-01) | R | Aplicar |
| GA-19 | I.6.4 · 66 | Actores e interfaz web local | ADR-032, ADR-042, A-02 (AD-07) | N | Aplicar |
| GA-20 | I.6.4 · 70 | Tabla 9, Desarrollador | A-02 | R | Aplicar |
| GA-21 | I.6.4 · 71 | Tabla 9, agente (sistema externo) | ADR-036, 041, 042, A-02 | N | Aplicar |
| GA-22 | I.6.5 · 106 | Tabla 10, alcance de la CLI | ADR-041, 042, 036 | R | Aplicar |
| GA-23 | I.6.5 · 107 | Tabla 10, motivo de excluir la biblioteca | ADR-036 | R | Aplicar |
| GA-24 | I.6.5 · 104 | «Instrucciones como fuente de configuración» | ADR-020 (A-01) | R | Aplicar |
| GA-25 | I.6.5 · 103 | «el esquema»: ambigüedad | ADR-036 | R | Opcional |
| GA-26 | I.6.5 · 105 | «se advierte en la interfaz» | ADR-042 | R | Opcional |
| GA-27 | I.6.5 · 113 | Amplitud de la CLI | ADR-041, ADR-042 | N | Elegir (C-7) |
| GA-28 | I.1.2 · 15 | P-05 | Evidencia de la entrevista | R | Aplicar |
| GA-29 | I.1.1 · 7 | «fuentes de configuración» | ADR-020 (A-01) | R | Aplicar |
| GA-30 | I.1.1 · 9 | «dos fuentes», «fuente alguna» | ADR-020 (A-01) | R | Aplicar |
| GA-31 | I.1.3 · 25 | «al fusionar dos fuentes» | ADR-020 (A-01) | R | Aplicar |
| GA-32 | I.1.2 · 19 | «no aporta evidencia de conducta» | Evidencia de la entrevista, ADR-001 | R | Elegir (C-5) |
| GA-33 | II.5.4 · 63 | P-07 | Evidencia de la entrevista | R | Aplicar |
| GA-34 | II.5.2 · 28 | «conjunto de fuentes menor» | ADR-020 (A-01) | R | Aplicar |
| GA-35 | II.5.2 · 32 | «lectura de las fuentes» | ADR-020 (A-01) | R | Aplicar |
| GA-36 | II.5.3 · 48 | «sobre una fuente que no prevalece» | ADR-020 (A-01) | R | Aplicar |
| GA-37 | II.5.6 · 97 | «lectura directa de las fuentes» | ADR-020 (A-01) | R | Aplicar |
| GA-38 | II.5.2 · 30 | «práctica verificada» | Evidencia de la entrevista | R | Elegir (C-5) |
| GA-39 | II.5.2 · 32 | «Acredita un costo ya incurrido» | P-02 | R | Elegir (C-5) |
| GA-40 | II.5.4 · 71; II.5.6 · 97 | Prácticas del equipo como hecho | Evidencia de la entrevista | R | Elegir (C-5) |
| GA-41 | II.5.2 · 29 | Diferencial con «relaciones» | ADR-034 | R | Elegir (C-4) |
| GA-42 | A.I.5 · 122 | P-02, síntesis | Evidencia de la entrevista | R | Aplicar |
| GA-43 | A.I.5 · 143 | P-02, condición probatoria | Evidencia de la entrevista | R | Aplicar |
| GA-44 | A.I.5 · 141 | P-2, «Observación de un gasto» | P-02 | R | Elegir (C-5) |
| GA-45 | A.I.3 · 45 | Ruta del documento completo | ADR-031 | R | Aplicar |
| GA-46 | A.I.3 · 50; A.I.4 · 85 | «fuentes» → «entradas» | ADR-020 (A-01) | R | Aplicar |
| GA-47 | A.I.1 · 11-16; A.I.7 · 175, 179 | «fuentes» en casos y corrección | ADR-020 (A-01), ADR-040 | R | Diferir (grupo C) |
| GA-48 | A.I.3 · tras 69 | Resultado 22: fusión de los tres archivos globales | AD-08 (a) | N | Elegir (C-8) |
| GA-49 | A.I.3 · tras 69 | Resultado 23: escrituras al arrancar | AD-08 (b) | N | Elegir (C-8) |
| GA-50 | A.I.3 · 73-77 | Observación y procedimiento | AD-08 | N | Elegir (C-8) |
| GA-51 | A.II.1 · 12 | P-01, fila de la representación manual | Evidencia de la entrevista | R | Aplicar |
| GA-52 | A.II.1 · 16 | P-01, párrafo de demanda revelada | Evidencia de la entrevista | R | Aplicar |
| GA-53 | II.6.1 · 7, 9, 11, 13, 15, 17 | «\*Decisión que habilita:\*» | M-03 | R | Aplicar |
| GA-54 | Bibliografía · 12 líneas | Títulos con asteriscos literales | M-03 | R | Aplicar |
| GA-55 | Transversal | «--explicar» se convierte en «–explicar» | Formato (C-10) | R | Aplicar |

---

## 2. Hallazgos por sección

Orden de aplicación: I.2 → I.5 → I.6 → I.1 → II.5 → Anexo I → Anexo II. Al final se agregan M-03 (II.6.1 y bibliografía) y el hallazgo formal GA-55.

### 2.1 I.2 · `informe/cap-01/I.2-mision-vision-objetivos-proyecto.md`

**GA-01 · I.2.4, Tabla 1, OE-1, enunciado · línea 21** · R · ADR-034, ADR-035, ADR-020 · **Elegir (C-1)**
- Actual: «**Resolver.** Determinar, para cada elemento del ecosistema declarado en las fuentes ejercitables, su valor efectivo, su procedencia, las declaraciones desplazadas, los valores implícitos y sus relaciones con los demás elementos, con localización de la declaración determinante en su archivo de origen.»
- Propuesta A (texto de ADR-035, con «entradas» por ADR-020): «**Resolver.** Determinar, para cada agente y cada clave de configuración declarada en las entradas ejercitables, su valor efectivo, su procedencia, las declaraciones desplazadas y los valores implícitos, con localización de la declaración determinante en su archivo de origen.»
- Propuesta B (recomendada): «**Resolver.** Determinar, sobre las entradas ejercitables, el valor efectivo de cada clave de configuración de cada agente, declarado por el usuario o incorporado por la herramienta, con su procedencia, las declaraciones desplazadas o la indicación de valor implícito, y la localización de la declaración determinante en su archivo de origen.»

**GA-02 · I.2.4, Tabla 1, OE-1, indicador · línea 21** · R · ADR-034 · **Aplicar**
- Actual: «…cada valor informa las condiciones del apartado I.6.3, y las relaciones coinciden con las definidas en cada escenario.»
- Propuesta: «…cada valor informa las condiciones del apartado I.6.3.»

**GA-03 · I.2.2, visión · línea 9** · R · ADR-034 (evaluar la mención), ADR-026 (sin nombrar herramientas) · **Aplicar** (ver C-6)
- Actual: «…con cobertura de las herramientas de mayor adopción y de las capacidades diferidas que declara el apartado I.6.5.»
- Propuesta: «…con cobertura de las herramientas de mayor adopción y de las capacidades diferidas que declaran los apartados I.6.5 y III.3, entre ellas la representación de las relaciones entre los elementos del ecosistema.»
- Fundamento: la remisión actual a I.6.5 no alcanza a las relaciones, que se difieren en III.3 (Tabla 7) y en RF-13. Mencionarlas en la visión sostiene en la defensa la respuesta a por qué OE-1 las pierde. No se nombra ninguna herramienta.

**GA-04 · I.2.4, párrafo final («ambas interfaces») · línea 30** · R · ADR-042, ADR-041 · **Elegir (C-3)**
- Actual: «…Expone las mismas resoluciones que las funciones F2 y F4 producen, de modo que su corrección queda verificada por los indicadores de OE-1 y OE-2, ampliados para comprobar que ambas interfaces informan el mismo resultado sobre los mismos escenarios.»
- Propuesta: «…Expone las resoluciones que producen las funciones F2, F4 y F5, de modo que su corrección queda verificada por los indicadores de OE-1, OE-2 y OE-3, ampliados para comprobar que ambas interfaces informan el mismo resultado sobre los mismos escenarios en todo lo que presenta la interfaz web.»
- Verificación pedida: el párrafo es coherente con ADR-042 en lo que afirma, pero queda incompleto. ADR-042 agrega los hallazgos a la línea de comandos («Hallazgos por línea de comandos») y fija que la coincidencia «se verifica sobre lo que la web muestra».

**GA-05 · I.2.4, Tabla 1, OE-3, indicador · línea 23** · R · ADR-042 · **Elegir (C-3)**
- Actual: «…se detecta la totalidad de los defectos y se obtienen cero falsos positivos sobre el resto del entorno, cuya corrección se encuentra verificada.»
- Propuesta: agregar al final: «El resultado se verifica por ambas interfaces.»

### 2.2 I.5 · `informe/cap-01/I.5-descripcion-breve-sistema-informacion.md`

**GA-06 · línea 5** · R · ADR-032 (AD-07) · **Aplicar**
- Actual: «RIGE es una aplicación de escritorio que corre en el equipo del desarrollador…»
- Propuesta: «RIGE es una aplicación local que corre en el equipo del desarrollador…»

**GA-07 · línea 5, última oración** · N · ADR-032, ADR-042, A-02 · **Aplicar**
- Actual: «Las mismas respuestas se obtienen desde la terminal mediante un comando de solo lectura con salida estructurada, previsto para que otro programa consulte cómo está configurado un entorno antes de operar sobre él.»
- Propuesta: «Todas estas respuestas se obtienen desde la terminal mediante un comando de solo lectura con salida estructurada, que utiliza el desarrollador y también otro programa, como un agente de programación que necesita conocer la configuración de un entorno antes de operar sobre él. Una interfaz web local, que el propio programa sirve en el equipo y se abre en el navegador, ofrece además al desarrollador formularios y vistas de consulta sobre las mismas respuestas.»

**GA-08 · línea 7** · N · A-02 · **Aplicar**
- Actual: «RIGE está dirigida al desarrollador que utiliza OpenCode y configura su propio entorno.»
- Propuesta: «RIGE está dirigida al desarrollador que utiliza OpenCode y configura su propio entorno, y atiende también a los agentes que consultan esa configuración por encargo de aquel.»
- La fórmula «por encargo de» reproduce la de III.1 (sistemas vecinos).

**GA-09 · línea 5, «y de las relaciones entre ellos»** · — · ADR-034 · **Sin cambio** (ver C-4)
- I.5 describe el sistema, no el período. El motivo de prioridad de RF-13 dice que las relaciones «pertenecen al alcance del sistema» y quedan fuera del período (III.3).

### 2.3 I.6 · `informe/cap-01/I.6-descripcion-detallada-sistema-informacion.md` (salvo I.6.6)

**GA-10 · I.6.2 · línea 23** · R · ADR-020 (A-01) · **Aplicar**
- «La interpretación de las fuentes y las reglas…» → «La interpretación de las entradas de configuración y las reglas…»

**GA-11 · I.6.2 · línea 23, última oración** · N · ADR-032, ADR-042 (AD-07) · **Aplicar**
- Actual: «Las seis funciones se exponen por dos interfaces sobre el mismo núcleo: una aplicación de escritorio, destinada a la inspección humana, y una interfaz de línea de comandos de solo lectura, destinada al consumo programático por otro agente o herramienta.»
- Propuesta: «Las funciones se exponen por dos interfaces sobre el mismo núcleo. La interfaz de línea de comandos, de solo lectura y con salida estructurada, es la interfaz completa: ofrece todas las consultas y la utilizan tanto un agente u otra herramienta, para el consumo programático, como el desarrollador que trabaja en la terminal. La interfaz web local, destinada a la inspección humana, se limita en esta etapa a formularios y vistas de consulta sobre las mismas resoluciones y no ofrece ninguna función ausente de la línea de comandos.»

**GA-12 · I.6.2, Tabla 7, F3 · línea 29** · R · ADR-034 · **Aplicar**
- Columna «Objetivo»: «OE-1» → «— (capacidad diferida, apartado III.3)».

**GA-13 · I.6.2, Tabla 7, F6 · línea 32** · R · ADR-034 · **Elegir (C-2)**
- Actual:
  - Función: «Exploración, exportación y consulta programática».
  - Descripción: incluye «Expone además las consultas de F2 y F4 mediante una interfaz de línea de comandos de solo lectura con salida estructurada…».
  - Objetivo: «OE-1 a OE-4».
- Propuesta recomendada (A, alineada con III.3, Tabla 7):
  - Función: «Exploración y exportación».
  - Descripción: «Permite navegar el ecosistema con el agente como eje, localizar y abrir en el editor la declaración que determina un valor, y exportar el estado resuelto a un archivo.»
  - Objetivo: «— (capacidad diferida, apartado III.3)».
  - La línea de comandos queda descripta en el párrafo previo (GA-11) y en el de la línea 40.

**GA-14 · I.6.2 · línea 36, última oración** · R · ADR-036 (E3), que reemplaza parcialmente a ADR-021 · **Aplicar**
- Actual: «La explicación corresponde a la interfaz de escritorio; la salida por línea de comandos expone los mismos datos en forma estructurada, sin prosa generada.»
- Propuesta: «La explicación se presenta en ambas interfaces: en la interfaz web local, junto a cada decisión y cada hallazgo, y por línea de comandos solo a pedido, mediante la opción \-\-explicar, con el mismo texto; sin esa opción, la salida contiene únicamente los datos estructurados.»
- Se conserva el resto del párrafo: el alcance a F4 y F5 y las plantillas deterministas, que ADR-036 mantiene de ADR-021.
- Escribir `\-\-explicar` en la fuente (GA-55).

**GA-15 · I.6.2 · línea 40** · R · ADR-020 (A-01) · **Aplicar**
- «resuelta por lectura directa de las fuentes» → «resuelta por lectura directa de las entradas de configuración».

**GA-16 · I.6.2 · línea 40** · R · decisión del 25/09 sobre el valor probatorio (criterio general, fuera de la lista P) · **Elegir (C-5)**
- «El equipo consultado ya interroga la configuración de su propio entorno por vía programática…» → «La referente relata que su equipo ya interroga la configuración de su propio entorno por vía programática…».

**GA-17 · I.6.3, Tabla 8, «Elemento nativo» · línea 52** · R · ADR-020 (A-01) · **Aplicar**
- «no consta en ninguna fuente que este pueda leer» → «no consta en ninguna entrada de configuración que este pueda leer».

**GA-18 · I.6.3, Tabla 8, «Entrada ilegible» · línea 58** · R · ADR-020 (A-01) · **Aplicar**
- «que detiene la carga de la fuente con un error» → «que detiene la carga de la entrada con un error».
- El término «Entrada ilegible» ya figura corregido. Queda solo este residuo.

**GA-19 · I.6.4 · línea 66** · N · ADR-032, ADR-042, A-02 (AD-07) · **Aplicar**
- La mención a la «aplicación de escritorio» que AD-07 ubica en la Tabla 9 está en este párrafo; la tabla no la contiene.
- Actual: «RIGE tiene un único actor humano, el desarrollador, y opera sobre su equipo sin conexión con servicios externos. Admite además un consumidor no humano de sus salidas, el agente o la herramienta que invoca la interfaz de línea de comandos, que no amplía la frontera porque obtiene el mismo resultado que la aplicación de escritorio y por la misma vía de lectura. La Tabla 9…»
- Propuesta: «RIGE opera sobre el equipo del desarrollador sin conexión con servicios externos y tiene dos actores. El desarrollador, único actor humano, consulta por la interfaz web local o por la línea de comandos. El segundo actor es un sistema externo: el agente de programación u otra herramienta que invoca la interfaz de línea de comandos para conocer el estado efectivo de un entorno antes de operar sobre él. Ninguno de los dos amplía la frontera, dado que ambos obtienen sus respuestas del mismo núcleo y por la misma vía de lectura. La interfaz web la sirve el propio proceso de RIGE en la dirección local del equipo, sin aceptar conexiones de otros equipos. La Tabla 9…»
- La última oración nueva sale de ADR-032 (escucha solo en `127.0.0.1`). Que la dirección local no acepta conexiones de otros equipos es conocimiento general. Es prescindible si el autor prefiere no agregarla.

**GA-20 · I.6.4, Tabla 9, «Desarrollador» · línea 70** · R · A-02 · **Aplicar**
- «Entrada: proyecto a analizar…» → «Entrada, por la interfaz web local o por la línea de comandos: proyecto a analizar…». El resto no cambia.

**GA-21 · I.6.4, Tabla 9, fila del agente · línea 71** · N · ADR-036, ADR-041, ADR-042, A-02 · **Aplicar**
- Elemento externo: «Agente u otra herramienta que invoca la interfaz de línea de comandos» → «Agente de programación u otra herramienta (sistema externo) que invoca la interfaz de línea de comandos».
- Relación, actual: «Salida: el mismo estado efectivo y las mismas decisiones explicadas, en formato estructurado.»
- Relación, propuesta: «Salida: estado efectivo, decisiones de permiso y hallazgos, en formato estructurado conforme a un esquema publicado que declara su versión, con la explicación solo a pedido.»
- La frase actual queda falsa con ADR-036 E3: la explicación ya no viaja siempre.

**GA-22 · I.6.5, Tabla 10, fila de la línea de comandos · línea 106** · R · ADR-041, ADR-042, ADR-036 · **Aplicar**
- «Se incluye», actual: «Consulta del estado efectivo y de las decisiones de permiso mediante interfaz de línea de comandos, con salida estructurada».
- «Se incluye», propuesta: «Consulta del estado efectivo, de las decisiones de permiso y de los hallazgos mediante interfaz de línea de comandos, con salida estructurada que valida contra un esquema publicado y declara su versión, y explicación a pedido».
- La exclusión y su motivo no cambian.
- Nota: el AE1 ya incluía los permisos. ADR-022 los quitó en la AE2 y ADR-041 los restituye.

**GA-23 · I.6.5, Tabla 10, fila de la biblioteca · línea 107** · R · ADR-036 («Distinción para la defensa») · **Aplicar**
- Actual (motivo): «El comando cubre el caso relevado sin comprometer una superficie de integración estable, que exigiría un compromiso de compatibilidad ajeno al alcance de esta etapa. Queda como capacidad diferida.»
- Propuesta: «El comando, con su esquema de salida publicado, cubre el caso relevado mediante un contrato de datos acotado; una biblioteca comprometería una superficie de funciones mucho mayor. En ambos casos, el compromiso de compatibilidad entre versiones es ajeno al alcance de esta etapa. La biblioteca queda como capacidad diferida.»
- Motivo: un esquema publicado y versionado ya es una superficie de integración, así que la frase actual queda contradicha por ADR-036.

**GA-24 · I.6.5, Tabla 10 · línea 104** · R · ADR-020 (A-01) · **Aplicar**
- «Instrucciones como fuente de configuración» → «Instrucciones como elemento de configuración».
- No se usa «entrada»: en la Tabla 6 las instrucciones son un elemento, no una vía de llegada.

**GA-25 · I.6.5, Tabla 10 · línea 103** · R · ADR-036 · **Opcional**
- «Validación completa contra el esquema» → «Validación completa contra el esquema de configuración de la herramienta».
- Motivo: desde ADR-036 hay dos esquemas en el informe (el de OpenCode y el de la salida de RIGE).

**GA-26 · I.6.5, Tabla 10 · línea 105** · R · ADR-042 · **Opcional**
- «la diferencia se advierte en la interfaz» → «la diferencia se advierte en ambas interfaces».

**GA-27 · I.6.5 · línea 113** · N · ADR-041, ADR-042 · **Elegir (C-7)**
- Actual: «La incorporación de la interfaz de línea de comandos amplía el alcance declarado en la propuesta inicial y responde a una necesidad relevada en la entrevista al referente, no a una extensión decidida por el autor. No altera la frontera…»
- Propuesta B (recomendada): «La incorporación de la interfaz de línea de comandos amplía el alcance declarado en la propuesta inicial y responde a una necesidad relevada en la entrevista al referente. Su amplitud responde a su consumidor: es la vía por la que un agente consulta la configuración, de modo que ofrece todas las consultas del sistema, mientras la interfaz web se limita a formularios y vistas de consulta para el desarrollador. No altera la frontera…» (el resto del párrafo sin cambios).
- Motivo: «no a una extensión decidida por el autor» deja de ser cierto con ADR-041 y ADR-042, que son ampliaciones decididas por el autor.

### 2.4 I.1 · `informe/cap-01/I.1-origen-proyecto.md`

**GA-28 · I.1.2 · línea 15** · R · P-05 · **Aplicar**
- «Y documenta tres soluciones que el equipo construyó por su cuenta para suplir la carencia, que constituyen evidencia de conducta y no de declaración.» → «Y relata las prácticas que el equipo adoptó para suplir la carencia, entre ellas la consulta programática de su configuración mediante un agente.»

**GA-29 · I.1.1 · línea 7** · R · ADR-020 (A-01) · **Aplicar**
- «describe un conjunto de fuentes de configuración ordenadas por precedencia, que se fusionan de modo que una fuente posterior reemplaza a una anterior» → «describe un conjunto de entradas de configuración ordenadas por precedencia, que se fusionan de modo que una entrada posterior reemplaza a una anterior».
- El contraste con las «doce entradas» del código se conserva.

**GA-30 · I.1.1 · línea 9** · R · ADR-020 (A-01) · **Aplicar**
- «dos fuentes que declaran el mismo agente» → «dos entradas que declaran el mismo agente».
- «que no figuran en fuente alguna» → «que no figuran en entrada alguna».

**GA-31 · I.1.3 · línea 25** · R · ADR-020 (A-01) · **Aplicar**
- «al fusionar dos fuentes» → «al fusionar dos entradas» (coincide con A.I.3, resultado 6).

**GA-32 · I.1.2 · línea 19** · R · decisión del 25/09 sobre el valor probatorio; ADR-001 · **Elegir (C-5)**
- Actual: «…se la descarta porque una declaración colectiva sobre un procedimiento no aporta evidencia de conducta y demoraría…»
- Propuesta: «…se la descarta porque una declaración colectiva sobre un procedimiento no aporta el relato de episodios concretos de quien los vivió y demoraría…»

No se tocan las demás ocurrencias de «fuente» en I.1 (líneas 13, 19 y 29): designan fuentes de información, no entradas de configuración.

### 2.5 II.5 · `informe/cap-02/II.5-analisis-informacion.md`

**GA-33 · II.5.4, Tabla 17, F2 · línea 63** · R · P-07 · **Aplicar**
- Elemento: «**F2.** Referente accesible que confirma el problema con episodios propios y cuyo equipo ya construyó tres soluciones artesanales (A.I.5)» → «**F2.** Referente accesible que confirma el problema con episodios propios y que relata prácticas propias de su equipo para suplir la carencia (A.I.5)».
- Implicancia: «Aporta evidencia de conducta y no solo de declaración, y habilita la validación del prototipo v0 antes de construir la versión funcional» → «Habilita la validación del prototipo v0 antes de construir la versión funcional».

**GA-34 · II.5.2, Tabla 15 · línea 28** · R · A-01 · **Aplicar** — «describe un conjunto de fuentes menor» → «describe un conjunto de entradas menor».

**GA-35 · II.5.2, Tabla 15 · línea 32** · R · A-01 · **Aplicar** — «por lectura de las fuentes» → «por lectura de las entradas de configuración».

**GA-36 · II.5.3, Tabla 16 · línea 48** · R · A-01 · **Aplicar** — «sobre una fuente que no prevalece» → «sobre una entrada que no prevalece».

**GA-37 · II.5.6 · línea 97** · R · A-01 · **Aplicar** — «la lectura directa de las fuentes» → «la lectura directa de las entradas de configuración».

**GA-38 · II.5.2, Tabla 15 · línea 30** · R · decisión del 25/09 sobre el valor probatorio · **Elegir (C-5)**, recomendado
- «práctica verificada en el equipo relevado (A.I.5)» → «práctica que la referente relata sobre su propio equipo (A.I.5)».
- «Verificada» contradice de frente la decisión («sin constancia más allá de la entrevista»).

**GA-39 · II.5.2, Tabla 15, implicancia · línea 32** · R · P-02 · **Elegir (C-5)**
- «Acredita un costo ya incurrido, que el apartado I.3.1 consigna…» → «Registra un costo que la referente relata como ya incurrido, que el apartado I.3.1 consigna…».

**GA-40 · II.5.4, Tabla 17, O4 · línea 71; II.5.6 · línea 97** · R · decisión del 25/09 sobre el valor probatorio · **Elegir (C-5)**, opcional
- Línea 71: «**O4.** El equipo relevado ya interroga su propia configuración…» → «**O4.** Según relata la referente, su equipo ya interroga su propia configuración…».
- Línea 97: «…que el equipo relevado ya practica y que presenta…» → «…que el equipo relevado practica, según el relato de la referente, y que presenta…».

**GA-41 · II.5.2, Tabla 15, implicancia · línea 29** · R · ADR-034 (consecuencia no listada) · **Elegir (C-4)**
- «…reside en la explicación de decisiones de permiso, valores implícitos, declaraciones sin efecto y relaciones entre elementos (I.1.3)» → «…reside en la explicación de decisiones de permiso, valores implícitos y declaraciones sin efecto (I.1.3)».
- Coincide con A1 (línea 72) y con el diferencial de IV.1 que cita ADR-021.

### 2.6 Anexo I · `informe/anexos/anexo-I-ae1-datos-relevados.md`

**GA-42 · A.I.5, síntesis · línea 122** · R · P-02 · **Aplicar** — «tres soluciones construidas por el equipo» → «tres prácticas propias relatadas por la informante».

**GA-43 · A.I.5, Tabla A.I.5.2, P-2, «Condición probatoria» · línea 143** · R · P-02 · **Aplicar** — «Demanda revelada» → «Demanda declarada: relato de un gasto incurrido, sin constancia ni cuantificación».

**GA-44 · A.I.5, Tabla A.I.5.2, P-2, «Con qué método y sobre qué universo» · línea 141** · R · consecuencia de P-02 · **Elegir (C-5)**, recomendado
- «Observación de un gasto ya incurrido, sin cuantificación» → «Relato de la informante sobre un gasto ya incurrido, sin registro de respaldo».
- «Observación» contradice la condición «declarada» de la fila 143. La propuesta es paralela a la columna F («Estimación retrospectiva, sin registro documental de respaldo»).

**GA-45 · A.I.3 · línea 45** · R · ADR-031 · **Aplicar**
- «bajo docs/relevamiento/opencode-como-funciona.md» → «bajo 01-relevamiento/opencode-como-funciona.md». La ruta actual no existe desde la reorganización.

**GA-46 · A.I.3, resultado 2 · línea 50; A.I.4 · línea 85** · R · A-01 · **Aplicar**
- Línea 50: «describe un conjunto menor de fuentes» → «describe un conjunto menor de entradas».
- Línea 85: «fusión de las fuentes declaradas» → «fusión de las entradas declaradas».

**GA-47 · A.I.1 · líneas 11, 12, 15 y 16; A.I.7 · líneas 175 y 179** · R · A-01, ADR-040 · **Diferir (grupo C)**
- Ocurrencias: «Combinación de fuentes», «reglas en fuentes distintas», «el valor y su fuente», «fuente distinta de la determinante».
- ADR-040 reescribe A.I.1 y A.I.7. Corregir ahora obliga a tocar dos veces el mismo texto.

**GA-48 · A.I.3, Tabla A.I.3, resultado nuevo n.º 22 (después de la línea 69)** · N · AD-08 (a) · **Elegir (C-8)**
- Propuesta: «| 22 | La configuración global admite tres archivos, config.json, opencode.json y opencode.jsonc, que se fusionan en ese orden; el criterio del primer archivo que exista rige solo para crear el archivo inicial | Lectura del cargador de la configuración global en el código fuente del tag correspondiente | Verificado en el código; verificación en ejecución pendiente |»
- El texto actual de A.I.3 **no contiene** la afirmación errónea, que solo figura en `opencode-como-funciona.md` §3, fila 2. En el anexo la corrección es un agregado, no un reemplazo.

**GA-49 · A.I.3, Tabla A.I.3, resultado nuevo n.º 23** · N · AD-08 (b) · **Elegir (C-8)**
- Propuesta: «| 23 | Al arrancar, la herramienta escribe en los directorios de configuración: crea el archivo global si no existe, agrega un archivo .gitignore e instala el paquete @opencode-ai/plugin | [DATO PENDIENTE: método con que se verificó: lectura del código, con archivo del tag, o ejecución] | [DATO PENDIENTE: estado, según el método] |»

**GA-50 · A.I.3, observaciones y procedimiento · líneas 73 a 77** · N · AD-08 · **Elegir (C-8)**
- Nuevo párrafo después de la línea 75: «Los resultados n.º 22 y 23 se incorporan después de la entrega del AE1, al construir el prototipo v1, y no alteran el recuento del resultado n.º 1: la configuración global constituye una sola entrada, integrada por hasta tres archivos.»
- Agregado al final de la línea 77: «Dado que la herramienta escribe en los directorios de configuración al arrancar (resultado n.º 23), cada reproducción de un escenario parte de una copia que ninguna ejecución anterior modificó.»

### 2.7 Anexo II · `informe/anexos/anexo-II-ae1-documentos-entorno-dominio.md`

**GA-51 · A.II.1, Tabla A.II.1 · línea 12** · R · P-01 · **Aplicar** — eliminar la fila «Representación manual de la arquitectura de agentes elaborada por el referente».

**GA-52 · A.II.1 · línea 16** · R · P-01 · **Aplicar** — eliminar el párrafo «La representación manual de la arquitectura de agentes se incorpora por su valor probatorio… demanda revelada…».

### 2.8 M-03 · `informe/cap-02/II.6-conclusiones-relevamiento.md` e `informe/bibliografia.md`

**GA-53 · II.6.1 · líneas 7, 9, 11, 13, 15 y 17** · R · M-03 · **Aplicar**
- `\*Decisión que habilita:\*` → `*Decisión que habilita:*` (seis ocurrencias). Solo formato: el resto de II.6 no se toca, incluido el Hallazgo 3 (P-08, grupo C).

**GA-54 · Bibliografía · líneas 5, 7, 15, 17, 19, 21, 29, 33, 35, 39, 43 y 49** · R · M-03 · **Aplicar**
- `\*…\*` → `*…*` en los doce títulos. En la línea 43 queda `*IEEE Transactions on Software Engineering, 46*(6)`, con el volumen en cursiva (APA).
- Probado con pandoc: las doce formas y la de II.6.1 se generan en cursiva.

### 2.9 Transversal formal

**GA-55 · toda mención de la opción `--explicar`** · R · formato · **Aplicar** (ver C-10)
- `tools/armar.py` convierte con `pandoc -f markdown`, que tiene activada la tipografía inteligente. Probado: «--explicar» sale como «–explicar» (raya corta).
- En la fuente se escribe `\-\-explicar`, que se genera con los dos guiones y en la tipografía del cuerpo. Ya se aplica así en GA-14.

---

## 3. Hallazgos que exigen redactar contenido nuevo

| ID | Qué se redacta | Extensión |
|---|---|---|
| GA-07 | Papel de cada interfaz y consumidor programático en I.5 | 2 oraciones |
| GA-08 | Los agentes consultantes como destinatarios en I.5 | 1 cláusula |
| GA-11 | Papel de cada interfaz en I.6.2 | 3 oraciones |
| GA-19 | Dos actores (humano y sistema externo) y escucha local en I.6.4 | Párrafo reescrito |
| GA-21 | Salida del sistema externo en la Tabla 9 | 1 celda |
| GA-27 | Amplitud de la línea de comandos en I.6.5 | 1 oración |
| GA-48 | Resultado 22 de la Tabla A.I.3 | 1 fila |
| GA-49 | Resultado 23 de la Tabla A.I.3, con dos datos pendientes | 1 fila |
| GA-50 | Observación sobre los resultados 22 y 23, y condición del procedimiento | 2 oraciones |

Todos se redactan desde ADR aceptados o desde AD-08, sin cifras nuevas.

---

## 4. Conflictos

### C-1 · Redacción de OE-1 (GA-01)

- **(a) «fuentes» frente a «entradas».** ADR-035 propone «declarada en las fuentes ejercitables». ADR-020 fija «entrada» y registra «fuente» como sinónimo no usado. ADR-035 decide el eje (agente y clave), no el término, así que prevalece ADR-020.
- **(b) Tensión lógica en el texto de ADR-035.** «Cada clave de configuración declarada» deja afuera por definición las claves sin declaración, que son justamente las que tienen valor implícito. Sin embargo, el mismo enunciado pide informar «los valores implícitos». Además:
  - «cada agente» debe comprender los agentes nativos (I.6.1; Hallazgo 2 de II.6.1);
  - el indicador compara contra `opencode debug agent`, que resuelve todas las claves, declaradas o no.
- **Alternativas:**
  - A: texto literal de ADR-035 con «entradas».
  - B: reformulación con el mismo eje, alineada con I.6.3 (línea 62: «con sus declaraciones desplazadas o la indicación de valor implícito; estas son las condiciones que verifica el OE-1»).
- **Recomendación: B.** Conserva la decisión de ADR-035 (por agente y clave) y elimina una contradicción que el tribunal puede señalar leyendo solo la Tabla 1.
- **Condición que la invalidaría:** que el autor lea como normativa la redacción literal del ADR. En ese caso, A.
- Si se elige B, propongo dejar constancia en ADR-035 (Consecuencias) de la redacción aplicada, sin cambiar su estado.

### C-2 · F6 contiene la línea de comandos (GA-13)

- **El problema.** ADR-034 pide que F6 deje de citar «OE-1 a OE-4» porque está diferida. Pero la F6 del AE1 incluye la consulta programática, y la línea de comandos es Must y verifica OE-1 y OE-2 (I.2, línea 30). Si F6 pasa a «diferida» sin más, la línea de comandos aparece diferida.
- **Alternativas:**
  - A: separar. F6 pasa a «Exploración y exportación», como ya la nombra III.3 (Tabla 7), y la línea de comandos se describe fuera de la tabla.
  - B: F6 con objetivo mixto («OE-1 y OE-2 por la consulta programática; exploración y exportación diferidas»).
  - C: crear una función F7. Cambia el recuento «seis funciones» y los códigos que usa la AE2.
- **Recomendación: A.** Es la única que deja I.6.2 coherente con III.3 sin tocar la AE2.

### C-3 · Hallazgos por línea de comandos (GA-04 y GA-05)

- **El problema.** ADR-042 agrega los hallazgos (F5) a la línea de comandos y pone «por ambas interfaces» en el criterio de RF-07. Pero no lista I.2 entre sus consecuencias. Así, el párrafo de la línea 30 y el indicador de OE-3 quedan incompletos.
- **Alternativas:**
  - A: ajustar los dos.
  - B: ajustar solo el párrafo.
  - C: no tocar I.2 y dejarlo para la pasada de la AE2.
- **Recomendación: A.** Con B, el párrafo invoca un indicador de OE-3 «ampliado» que no lo está.

### C-4 · Las relaciones fuera de OE-1 (GA-09 y GA-41)

- **El problema.** ADR-034 solo lista I.2.4, I.6.2 e IV.3, pero las relaciones aparecen también en:
  - I.5, línea 5;
  - la Tabla 6 de I.6.1 (columna «Relaciones que representa»);
  - la Tabla 9, fila Desarrollador («relaciones»);
  - II.5, línea 29, como parte del diferencial.
- **Criterio propuesto.** La distinción de III.3 entre alcance del sistema y alcance del proyecto, que también usa el motivo de RF-13:
  - las descripciones del sistema (I.5, I.6.1, Tabla 9) se conservan;
  - el diferencial (II.5, línea 29) es una afirmación sobre el valor que RIGE entrega, así que se corrige.
- **Recomendación:** sin cambio en I.5, I.6.1 y la Tabla 9; aplicar GA-41.

### C-5 · Valor probatorio de las prácticas fuera de la lista P (GA-16, 32, 38, 39, 40 y 44)

- **El problema.** La decisión del 25/09 clasifica las tres prácticas como demanda declarada con relato de conducta. La lista P-01 a P-12 cubre lugares concretos, pero hay otros que afirman las prácticas como hechos verificados u observados.
- **Recomendación, de mayor a menor gravedad:**
  - **Aplicar:**
    - GA-38 («práctica verificada»);
    - GA-44 («Observación de un gasto»);
    - GA-39 («Acredita un costo»).
    Las tres contradicen la decisión de frente.
  - **Aplicar GA-32** y alinear la fila D-01 del Anexo III (`00-gestion/anexo-III.md`) cuando se trabaje AD-04. ADR-001 no se modifica: su decisión no cambia, solo la formulación del argumento en I.1.
  - **Opcionales:** GA-16 y GA-40. «Ya interroga» se lee como relato de la entrevista, pero conviene uniformar.

### C-6 · Estado de ADR-026 (GA-03)

- **El problema.** AD-05 registra que el autor aprobó eliminar ADR-024 y ADR-026. Sin embargo, `INDICE.md` mantiene ADR-026 como aceptado, y ADR-034 y esta sesión lo citan para la visión.
- **Efecto sobre esta pasada:** ninguno. GA-03 no nombra herramientas, de modo que se sostiene en ADR-034 con o sin ADR-026.
- **Pregunta al autor:** ¿se mantiene la eliminación de ADR-026? Si se mantiene, ADR-034 queda citando un ADR retirado, y conviene anotarlo en la nota de números retirados.

### C-7 · Justificación de la amplitud de la línea de comandos en I.6.5 (GA-27)

- **El problema.** El fundamento de ADR-041 es la medición con agentes (ADR-040), que el Cap. I todavía no describe: I.3, I.2.3 y OE-4 pertenecen al grupo C.
- **Alternativas:**
  - A: mencionar ahora la medición con agentes. Crea una incoherencia transitoria con I.3, I.2.3 y OE-4.
  - B: justificar ahora solo por el consumidor, que es la primera razón de ADR-042, y agregar la razón de la medición en el grupo C.
  - C: diferir todo I.6.5 al grupo C.
- **Recomendación: B.**
- **Nota.** «El razonamiento completo… consta en el Anexo III» sigue remitiendo a la decisión de ADR-017. El Anexo III no tiene filas para ADR-041 ni ADR-042 (AD-04).

### C-8 · AD-08 (GA-48 a GA-50)

- **(a) Estado del resultado 22.** La propia A.I.3 (línea 73) sostiene que «leer el código del tag correcto no acredita el comportamiento de la herramienta si no se ejecuta». Además, `01-relevamiento/linea-base/respuestas.md` (línea 127) marca la fusión como «[VERIFICAR en ejecución]».
  - **Recomendación:** «Verificado en el código; verificación en ejecución pendiente».
  - Alternativa: «Verificado», como el resultado 1, que también es solo de código. Deja al anexo en contradicción con su propio criterio.
- **(b) Método del resultado 23.** No consta en el repositorio. AD-08 no cita archivo del tag para (b), y el §3 de `opencode-como-funciona.md` no lo contiene. Van dos `[DATO PENDIENTE]`, salvo que el autor informe el método.
- **(c) Recuento de «doce entradas».** Es una inferencia del ingeniero, a confirmar: si la configuración global es una sola entrada integrada por tres archivos (como las entradas 4 y 5 del §3, que también agrupan varios), el recuento no cambia. Si se contaran tres entradas, la cifra pasaría a catorce y arrastraría I.1.1, II.6.1, A.I.3, el glosario y H-01 del libro.
  - **Recomendación:** una entrada, declarada en GA-50.
- **(d) AD-08 no se cierra con esta pasada.** La corrección del §3 de `01-relevamiento/opencode-como-funciona.md` sigue pendiente:
  - fila 2, «Primer candidato que exista»;
  - (b), que el documento no contiene.
  
  Ese archivo está fuera de la zona de escritura del ingeniero (`CLAUDE.md`, 5). ADR-037 (P2) y la bitácora del 25/09 citan ese §3 como fuente de (b), que hoy no lo contiene.
  - **Opciones:** el autor corrige el §3; el autor autoriza al ingeniero a hacerlo; o AD-08 queda con avance parcial.
- **(e) Consecuencia en el libro.** Los resultados 22 y 23 serían H-22 y H-23 en `03-requisitos/libro/trazabilidad.md` y en el Anexo I del Cap. III. Eso está fuera de alcance; se registra.

### C-9 · Pendientes que la consigna pide cerrar y no cierran completos

- **A-01.** Quedan ocurrencias en secciones del grupo C:
  - I.3, líneas 5, 7, 20, 22, 30, 54 y 73;
  - II.6, línea 44;
  - A.I.1 y A.I.7 (GA-47).
  
  **Recomendación:** avance parcial, con la lista de lo que falta.
- **AD-08.** Ver C-8 (d).
- **M-03.** Se cierra tal como está definido (II.6.1 y bibliografía). Quedan asteriscos escapados fuera de su alcance:
  - II.1, cinco títulos de obras en la Tabla 12;
  - A.I.1, línea 5 (sufijos *a* y *b*);
  - Anexo V, línea 9 (*source*);
  - III.2, una ocurrencia.
  
  El del Anexo VI (título de una incidencia con `"*"`) es un asterisco literal y **debe quedar**.

  **Recomendación:** abrir M-15 para los restantes.

### C-10 · Forma de escribir la opción de la línea de comandos (GA-55)

- **Alternativas:**
  - A: `\-\-explicar`, en la tipografía del cuerpo, como el informe escribe «opencode debug agent».
  - B: código en línea (`` `--explicar` ``), que introduce una tipografía monoespaciada que el informe no usa en ningún lugar.
- **Recomendación: A**, por uniformidad de formato (`00-gestion/reglas-catedra.md`, 1).

---

## 5. A-03 · Diagnóstico y propuesta (sin aplicar)

### 5.1 Tablas y figuras

- **Numeración actual.** El AE1 (Caps. I y II) numera de la Tabla 1 a la 19 y las Figuras 1 y 2. La AE2 (Caps. III a V) vuelve a empezar: Tablas 1 a 21 y Figuras 1 a 3. III.1 (línea 5) declara esa convención: «este documento numera sus propias tablas y figuras desde la unidad».
- **Efecto en el informe unificado.** Cada número del 1 al 19 aparece dos veces. Las Figuras 1 y 2 también: la Figura 1 es el diagrama de contexto en I.6.4 y el modelo del dominio en III.2.
- **Anexos.** Las Tablas A.I.1 y A.I.2 existen en los dos «Anexo I». Esto lo resuelve la renumeración de ADR-033 (M-02).
- **Urgencia: baja para la AE2.** La entrega del 01/10 es un PDF solo con los Caps. III, IV, V y X (`catedra/AE2-guia.md`, línea 158), y la plantilla de la AE2 numera sus figuras desde 1 (`catedra/AE2-plantilla-informe.md`, líneas 110, 216 y 259). La colisión aparece recién en el documento consolidado.

**Alternativas para el informe consolidado:**
- **T-A · Correlativa en todo el informe.** La AE2 continúa desde la Tabla 20 y la Figura 3.
  - A favor: un solo número por tabla.
  - En contra: cada tabla que se agregue en los Caps. I o II desplaza todas las siguientes, y obliga a renumerar a mano las remisiones.
- **T-B · Por capítulo** («Tabla I.1», «Tabla III.7», «Figura III.1»).
  - A favor: estable ante inserciones; coherente con los códigos de apartado; remisiones sin ambigüedad.
  - En contra: una renumeración completa, una sola vez, de leyendas y remisiones.
- **T-C · Numeración automática en el armado** (filtro de `tools/informe.lua` con etiquetas).
  - A favor: no se renumera nunca más.
  - En contra: trabajo de herramienta y conversión de todas las remisiones a etiquetas, análogo a M-07.

**Recomendación del ingeniero:** T-B, aplicada una sola vez en la consolidación, después del grupo C.

**Condición que la invalidaría:** que la cátedra exija numeración simple «Tabla N». No figura en `00-gestion/reglas-catedra.md`, sección 3; `[DATO PENDIENTE: confirmar si el Art. 21.º o la plantilla final fijan el formato de las leyendas]`.

### 5.2 Códigos de hallazgo

**Situación actual:**
- **AE1.** Numera los resultados técnicos como «N.º 1 a 21» en la Tabla A.I.3 («resultado n.º 10») y los hallazgos del relevamiento como «Hallazgo 1 a 6» en II.6.1. No declara códigos.
- **AE2.** Usa dos códigos que el AE1 nunca define:
  - «H-01 a H-21», equivalentes a los resultados de A.I.3, en el libro, el Anexo I del Cap. III, III.2, el Anexo V, V.1, V.2 y V.4;
  - «HA-1 a HA-6», equivalentes a los hallazgos de II.6.1, en el libro, el Anexo I del Cap. III y III.1 («AE1, II.6.1, hallazgo HA-3»).
- **Colisión de términos adicional.** «Hallazgo» designa además un producto de RIGE: los defectos que detecta F5 o RF-07. El informe usa la palabra con tres sentidos.

**Propuesta:**
- declarar los códigos en su origen: la Tabla A.I.3 pasa la columna «N.º» a «Cód.» (H-01 a H-23, si se aceptan GA-48 y GA-49), y II.6.1 pasa a «Hallazgo HA-1» y siguientes;
- en el glosario, reservar «hallazgo» para el producto de RIGE y referirse a los otros como «resultado técnico (H-nn)» y «hallazgo del relevamiento (HA-n)».

Se aplica por partes: A.I.3 en esta pasada, si el autor lo decide; II.6.1 con el grupo C.

**Propuesta:** `/decidir A-03` para registrar la numeración del informe consolidado y la convención de códigos como un ADR propuesto.

---

## 6. Señalados fuera de alcance (no se corrigen)

- **I.2.3 y OE-4 frente a ADR-040.** I.2.3 habla de «tiempo de resolución» e IB-1 e IB-2. OE-4 dice «protocolo con participantes». Ambos quedan incoherentes con la medición con agentes y el criterio de 8 de 12, pero ADR-040 no lista I.2 entre sus capítulos afectados. Propuesta: agregar I.2.3 y OE-4 al grupo C en `estado.md`.
- **I.1.2, línea 17.** La exclusión de la referente de la muestra pierde objeto respecto de la medición (ADR-040, línea 113). Va al grupo C.
- **`informe/00-resumen.md`, línea 7.** Dice «plataforma de escritorio». AD-07 no lista el resumen. Propuesta: agregarlo a AD-07 para la pasada del grupo C, junto con P-06.
- **Incoherencias transitorias que crea esta pasada con la AE2**, ya cubiertas por pendientes abiertos:
  - III.3: «aplicación de escritorio», «comando único», «quince requisitos Must» (AD-01, AD-07, AD-23);
  - III.4, L-06 (AD-21);
  - III.5, párrafo final sobre la explicación (AD-11);
  - RF-03 en el libro (AD-21, AD-23).
- **III.4, fila 17 («Validación completa contra el esquema publicado»).** Hay la misma ambigüedad que en GA-25: desde ADR-036, «esquema publicado» también designa el de la salida de RIGE. Es nuevo; propongo agregarlo a AD-11.
- **Incoherencias transitorias con el grupo C:**
  - II.6.1 (Hallazgo 3), II.6.2 y la Tabla 19 de II.6.4 siguen hablando de «tres artefactos», «demanda revelada» y «soluciones artesanales» hasta P-08 a P-10;
  - el resumen, hasta P-06.
  
  Es el costo aceptado del agrupamiento.
- **Bibliografía.** Tiene los marcadores `[VERIFICAR fecha de publicación]` (líneas 23 y 25) y la Ley N.º 27.506 duplicada (M-04). M-03 no los cubre.
- **A.I.5.** Alterna «el informante» (líneas 124, 134, 144, 148 y 150) con «la informante» (texto nuevo de P-02, línea 122). Conviene uniformarlo en la pasada de ADR-040, que reescribe A.I.5.
- **Tabla 9 y Figura 1 (I.6.4).** El diagrama de contexto sigue pendiente. Cuando se elabore, debe incluir al sistema externo (GA-19 y GA-21).

---

## 7. Efecto previsto en `estado.md` y `pendientes.md` (se aplica después de cada sección)

- **`estado.md`:**
  - pasan a «borrador» I.2, I.5, I.6, I.1 y II.5, más II.6 por M-03 (cualquier cambio posterior a la aprobación la devuelve a borrador);
  - los Anexos I y II y la bibliografía no tienen fila en la tabla.
- **`pendientes.md`:**
  - **Se cierran:**
    - A-02;
    - M-03 (y se abre M-15, según C-9).
  - **Avance parcial:**
    - A-01, con la lista de C-9;
    - AD-08, en su parte del Anexo I (salvo que el autor resuelva C-8 d);
    - AD-07, con el AE1 hecho y el resumen agregado;
    - AD-09, con P-01, P-02, P-05, P-07 y ADR-034 en I.2 e I.6.2 hechos;
    - AD-10, con OE-1 hecho.
  - **Nuevos:**
    - I.2.3 y OE-4 al grupo C;
    - ambigüedad de «esquema publicado» en III.4, dentro de AD-11;
    - H-22 y H-23 en el libro;
    - cita del §3 en ADR-037 (P2) y en la bitácora.
