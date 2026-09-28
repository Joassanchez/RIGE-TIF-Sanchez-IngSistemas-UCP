# Pasada posterior a la validación · Fase 2 · Libro de trabajo

- Fecha del informe: 28/09/2026
- Objeto: `03-requisitos/libro/` (catálogo, trazabilidad, reglas, glosario y entidades). Escritura autorizada por el autor el 28/09/2026 para esta pasada.
- Acta: `01-relevamiento/validacion/20260925_GuiaValidacion_Sanchez_v2.md`, sesión del 26/09/2026, 82 puntos confirmados sin observaciones.
- Estado: **aplicado el 28/09/2026** (sección 10).
- Fuera de esta fase: `iteraciones.md` (Tablas 14, 18 y 19). Depende de AD-23 y se alinea en la fase 5.

Convenciones: **[R]** dato del repositorio · **[A]** dato del autor · **[I]** conocimiento general · **[S]** suposición. En las fichas del catálogo, las líneas son: 6 enunciado · 9 prioridad · 10 motivo · 11 criterio · 12 trazabilidad · 13 estado · 14 iteración · 15 MVP.

---

## 1. Tres criterios previos que conviene fijar

**C-1 · El enunciado validado manda.** La referente confirmó los enunciados **tal como figuran en la guía v2** (sección 3). Donde la guía y la ficha difieren, propongo copiar el texto de la guía, sin retocarlo. Si se reescribe después de la sesión, el «Validado» deja de ser cierto para ese texto.
- Consecuencia 1: en **RF-02** la explicación a pedido y las dos interfaces van **solo en el criterio**, no en el enunciado. La guía no marcó RF-02 con †, y ADR-036 ubica el cambio en el criterio [R].
- Consecuencia 2: en **RNF-07** hay un conflicto con ADR-045 (ver F2-19).

**C-2 · OE-1 y OE-2, no solo OE-1, en RF-03.** Hay una contradicción entre ADR:
- ADR-036 manda cambiar «OE-2» por «OE-1» en RF-03, porque la línea de comandos de valores es OE-1 (T-09) [R].
- ADR-041, posterior, agrega los permisos a RF-03 y cita el indicador de OE-2, que exige «por ambas interfaces» [R].
- Las dos cosas son ciertas: RF-03 cubre ahora valores (OE-1, I.2.4 línea 21: «La salida de la interfaz de línea de comandos se verifica contra la misma referencia») y permisos (OE-2, línea 22: «por ambas interfaces») [R].
- **Recomiendo citar los dos.** Si se cita solo OE-1, la mitad de permisos del criterio queda sin objetivo que la respalde.

**C-3 · «Validada» en las reglas y «En disputa» en el glosario.**
- Reglas: «Validada» es el valor de la lista de la cátedra [R] y ahora es cierto para las 13. Se pierde el dato «verificada en ejecución» de las RD y RE; propongo conservarlo en la columna Fuente, junto con el acta.
- Glosario: después de la sesión, ningún término está en disputa. Propongo **«No»** en los 16 términos. El conflicto terminológico ya consta en la columna de sinónimos, y el acta en la Fuente. La alternativa es «Sí» en los cuatro que estuvieron en disputa, pero leído hoy diría que siguen abiertos.

---

## 2. Catálogo (`catalogo/`)

| # | Ficha · línea | Texto actual | Corrección | Sostén |
|---|---|---|---|---|
| F2-01 | Las 23 fichas · 13 | «[DATO PENDIENTE]» | «Validado» | Acta, secciones 3.1 a 3.3; cierra M-05 |
| F2-02 | RF-02 · 11 | Criterio actual (sin interfaces ni `--explicar`) | Agregar al final: «Sobre los mismos casos, la decisión, la cadena y la regla determinante coinciden por la línea de comandos y por la interfaz web local. Con la opción `--explicar`, la línea de comandos entrega la misma explicación que la interfaz web para la misma decisión.» | ADR-036 (E3), ADR-042; C-1 |
| F2-03 | RF-02 · 12 | «H-05, H-07, H-11, H-12, HA-5» | «H-05, H-07, H-11, H-12, HA-5; acta del 26/09/2026, decisiones L-10 y L-13» | Vincular L-10 y L-13 |
| F2-04 | RF-03 · 6 | «RIGE expone por línea de comandos, dado un proyecto y un agente, los valores efectivos con su procedencia, archivo y posición, en formato estructurado y determinista» | Texto validado (guía v2, RF-03): «RIGE expone por línea de comandos, dado un proyecto y un agente, los valores efectivos con su procedencia, archivo y posición y, dada una acción, la decisión de permiso con su regla determinante. La salida es estructurada, determinista y se ajusta a un esquema publicado que declara su versión; a pedido, incluye la explicación» | ADR-036, ADR-041; C-1 |
| F2-05 | RF-03 · 10 | «…el equipo relevado ya interroga su configuración por vía programática, con consumo de tokens y sin garantía de exactitud» | «…el equipo relevado relata que interroga su configuración por vía programática, con consumo de tokens y sin garantía de exactitud. Es, además, la vía por la que un agente consulta RIGE.» | P-11 (el hecho es un relato, no una práctica verificada, igual que P-07); ADR-041 |
| F2-06 | RF-03 · 11 | «Ejecutado el comando dos veces… interfaz de escritorio, conforme exige el indicador del objetivo OE-2… canal de salida» | «Ejecutada dos veces consecutivas, con la opción `--explicar` y sin ella, sobre el mismo proyecto sin cambios en las entradas, cada consulta —de valores para un agente y de decisión de permiso para un agente y una acción— produce una salida idéntica, que valida contra el esquema publicado en el repositorio y declara la versión del esquema. Cada valor incluye ruta absoluta y línea, y cada decisión, la regla determinante con su procedencia. Sobre los mismos escenarios, los valores y las decisiones que informa coinciden en su totalidad con los que presenta la interfaz web local, conforme exigen los indicadores de los objetivos OE-1 y OE-2 del informe de la AE1. El código de salida es 0; ante un proyecto inexistente es distinto de 0, y el error se emite por el canal de error y no por el de salida.» | ADR-036 (C, E3), ADR-041, ADR-042, AD-07; C-2 |
| F2-07 | RF-03 · 12 | «HA-3; acta del \[fecha\], decisión L-06» | «HA-3; acta del 26/09/2026, decisiones L-06 y L-10» | Acta |
| F2-08 | RF-03 · 14 | «3» | «2» | ADR-042 |
| F2-09 | RF-07 · 6 | Enunciado sin interfaces | Texto validado: agregar al final «, por ambas interfaces» | Guía v2, RF-07 †; C-1 |
| F2-10 | RF-07 · 11 | Criterio actual | Agregar al final: «La línea de comandos y la interfaz web local informan los mismos hallazgos sobre el mismo entorno. Con la opción `--explicar`, la línea de comandos entrega la misma explicación que la interfaz web para el mismo hallazgo.» | ADR-036 (E3), ADR-042 (hallazgos por línea de comandos) |
| F2-11 | RF-07 · 12 | «H-03, H-05, H-13, H-14» | «H-03, H-05, H-13, H-14; acta del 26/09/2026, decisiones L-10 y L-13» | Vincular L-10 y L-13 |
| F2-12 | RF-08, RNF-01, RNF-04, RNF-05 · 12 | «acta del \[fecha\]» / «Acta del \[fecha\]» | «acta del 26/09/2026» / «Acta del 26/09/2026» | A-05 |
| F2-13 | RF-10 · 9, 10, 14, 15 | «Must» · motivo actual · «2» · «Sí» | «Should» · «La decisión por sí sola no describe el efecto: una denegación general retira la herramienta y una excepción posterior vuelve a exponerla íntegra. Se prioriza como Should porque extiende la consulta de permiso sin intervenir en la medición final ni en la mitigación del riesgo principal» · «Sin asignar» · «No» | ADR-035, ADR-042 |
| F2-14 | RF-13 · 12 | Trazabilidad actual | Agregar «; acta del 26/09/2026, decisión L-12» | Vincular L-12 |
| F2-15 | RNF-06 · 6 | «RIGE resuelve las rutas de configuración según el sistema operativo y opera sobre las plataformas declaradas» | Texto validado sin la remisión: «RIGE resuelve las rutas de configuración según el sistema operativo, opera sobre Ubuntu 26.04 y Windows 11 y se instala sin privilegios administrativos» | ADR-037; guía v2, RNF-06 † |
| F2-16 | RNF-06 · 10 | «Condiciona el descubrimiento, aunque la acreditación del proyecto puede efectuarse sobre una plataforma» | «Condiciona el descubrimiento de las entradas en cada plataforma. El equipo relevado programa en Windows, y las mediciones del proyecto se realizan en Ubuntu. Se prioriza como Should porque la verificación en ambas plataformas corre en cada integración sin horas propias, y la acreditación manual se realiza una sola vez, en la estabilización» | ADR-037 (P3); acta, L-11. El motivo actual contradice la acreditación en dos plataformas |
| F2-17 | RNF-06 · 11 | «Sobre el mismo escenario replicado en cada plataforma declarada \[plataformas\]…» | «Sobre el mismo escenario ejecutado en Ubuntu 26.04 y en Windows 11, el conjunto de entradas descubiertas y los valores efectivos coinciden, con las rutas comparadas en forma relativa a la raíz del escenario y con «/» como separador. En los escenarios que ejercitan rutas, los valores coinciden además con los de OpenCode 1.18.25 ejecutado en Windows 11. Las decisiones de permiso quedan fuera de esta comparación. La instalación, siguiendo el `README.md`, se completa con una cuenta sin privilegios administrativos en ambas plataformas» | ADR-037 (consecuencias y P1) |
| F2-18 | RNF-06 · 12 | «H-04, H-19» | «H-04, H-19; acta del 26/09/2026, decisión L-11» | Vincular L-11 |
| F2-19 | RNF-07 · 6 | «RIGE completa la resolución de un proyecto dentro de un tiempo acotado sobre un equipo de referencia» | **Depende de ADR-045.** Sin ADR-045: el texto validado, «Una consulta por línea de comandos finaliza en menos de 2 segundos sobre un proyecto del doble de tamaño que el del equipo de la referente, en el equipo de referencia del proyecto». Con ADR-045 aceptado: «Una consulta por línea de comandos finaliza en menos de 2 segundos sobre un proyecto del doble de tamaño que un proyecto real de referencia, en el equipo de referencia del proyecto». | ADR-044 / ADR-045; C-1. Ver nota 1 |
| F2-20 | RNF-07 · 11 | «Sobre un proyecto de \[N\] entradas…» | Con ADR-045 aceptado: el criterio propuesto en el ADR, con dos `[DATO PENDIENTE]` (repositorio público y especificaciones de la VM). Sin ADR-045: `[DECISIÓN PENDIENTE: proyecto de referencia de RNF-07]` | ADR-044, ADR-045 |
| F2-21 | RNF-07 · 12 | «HA-3» | «HA-3; acta del 26/09/2026, sección 3.2» | Acta (umbral aceptado) |
| F2-22 | RNF-08 · 6 | «La salida por línea de comandos se ajusta a un esquema versionado, y todo cambio incompatible…» | Texto validado: «Todo cambio incompatible del esquema de salida de la línea de comandos incrementa su versión mayor, de modo que un consumidor sabe cuándo debe adaptarse» | ADR-036; C-1 |
| F2-23 | RNF-08 · 8 | «Compatibilidad» | «Mantenibilidad» | ADR-036, M-01 |
| F2-24 | RNF-08 · 10 | «Constituye la contrapartida de exponer una interfaz destinada a otro software» | Agregar: «. El compromiso solo se ejercita cuando existe una segunda versión del esquema, que el período no prevé» | ADR-036 |
| F2-25 | RNF-08 · 11 | «La salida valida contra el esquema publicado y declara su versión; un conjunto…» | «Publicada una nueva versión del esquema sin cambio de versión mayor, las salidas de referencia de la versión anterior continúan validando contra ella. Ante un cambio incompatible, la versión mayor declarada en la salida se incrementa» (la validación y la versión declarada pasan a RF-03) | ADR-036 |
| F2-26 | RNF-08 · 12 | «HA-3; acta del \[fecha\], decisión L-06» | «HA-3; acta del 26/09/2026, decisión L-06» | A-05 |

**Nota 1 · RNF-07.** Con ADR-045, el enunciado deja de decir «el del equipo de la referente», que es lo que ella confirmó. El cambio no altera lo que validó (el umbral de 2 s y la consulta por línea de comandos), y la regla del mayor incluye su proyecto si llega. Aun así, es un texto distinto del validado. Recomiendo informárselo junto con el procedimiento de conteo, sin una nueva sesión.

**Nota 2 · Marcadores nuevos.** F2-20 deja dos `[DATO PENDIENTE]` en la ficha, que pasan al Anexo I (G-01).
- El del repositorio lo puedo resolver antes del 01/10, con la búsqueda de ADR-045 y `/fuente`, una vez aceptado el ADR.
- El de la VM necesita que me pases procesador, núcleos y memoria asignados.

**Nota 3 · M-01 (norma).** ADR-036 pide dejar constancia de que ISO/IEC 25010 ubica RNF-08 en Compatibilidad. La ficha no tiene campo para eso. Va en III.5 (fase 3).

---

## 3. Trazabilidad (`trazabilidad.md`)

| # | Línea | Texto actual | Corrección | Sostén |
|---|---|---|---|---|
| F2-27 | 5 | «…y las decisiones del acta de validación, de modo que…» | «…y las decisiones del acta de validación del 26/09/2026, de modo que…» | A-05 |
| F2-28 | 32 (HA-3) | «Un equipo identificado experimenta la dificultad y construyó tres soluciones propias, entre ellas la consulta programática de su propia configuración» | «Un equipo identificado experimenta la dificultad y relata prácticas propias, entre ellas la consulta programática de su propia configuración» | P-11 |
| F2-29 | 42 (L-06) | «Acuerdo del acta: la salida por línea de comandos se acota al comando de consulta de valores efectivos» · «RF-03, RNF-08» | «Acuerdo del acta: la línea de comandos es la interfaz completa y expone valores, decisiones de permiso y hallazgos, con una salida ajustada a un esquema versionado y la explicación a pedido» · «RF-02, RF-03, RF-07, RNF-08» | ADR-041, ADR-042, ADR-036; L-06 revisada |
| F2-30 | 43 | «L-07 a L-09 \| Acuerdos del acta sobre la no intervención en los cambios del agente, la comparación entre estados y la validación contra el esquema» | «L-07 y L-09 \| Acuerdos del acta sobre la no intervención en los cambios del agente, la comparación entre estados y la validación contra el esquema de configuración de la herramienta». Fila nueva: «L-08 \| Acuerdo del acta: vocabulario del proyecto \| — \| Fija la terminología del informe y de la interfaz; su efecto consta en el glosario del dominio» | L-08 es el vocabulario (acta, sección 6), no un límite de alcance; AD-11 («esquema publicado» ambiguo) |
| F2-31 | después de 43 | — | Cuatro filas nuevas: **L-10** «Acuerdo del acta: dos interfaces sobre el mismo núcleo; la línea de comandos es completa y la interfaz web local se limita a formularios y vistas de consulta» → RF-02, RF-03, RF-07 · **L-11** «Acuerdo del acta: el sistema opera sobre Ubuntu 26.04 y Windows 11 y se instala sin privilegios administrativos» → RNF-06 · **L-12** «Acuerdo del acta: las relaciones entre elementos se difieren como capacidad posterior» → RF-13 · **L-13** «Acuerdo del acta: la explicación se genera con plantillas deterministas, sin modelo de lenguaje» → RF-02, RF-07 | Acta, L-10 a L-13 |
| F2-32 | 54 (Tabla A.I.2) | «Interfaz de escritorio y núcleo» | «Interfaz web local y núcleo» | AD-07 |

---

## 4. Reglas (`reglas.md`)

| # | Línea | Texto actual | Corrección | Sostén |
|---|---|---|---|---|
| F2-33 | 7 a 13, 17 a 19 (RD-01 a RD-07, RE-01 a RE-03) | Estado «Verificada en ejecución» | Estado «Validada». Fuente: se agrega «; acta del 26/09/2026» (p. ej., «H-01; acta del 26/09/2026») | M-13; acta, sección 5; C-3 |
| F2-34 | 14 a 16 (RR-01 a RR-03) | Fuente «Acta del \[fecha\], decisión L-0n» | «Acta del 26/09/2026, decisión L-0n». El estado ya es «Validada» | A-05, V-01 |

**Observación.** RE-02 y RE-03 (y RE-01 en su segunda mitad) describen cuándo **RIGE** marca un hallazgo. No se pueden haber «verificado en ejecución» antes de que RIGE exista [S]. La guía v2 lo afirma (sección 5, línea 382) y el acta ya está firmada en ese punto. Con F2-33 el problema desaparece del libro, porque el estado pasa a «Validada» (lo confirmó la referente) y la Fuente conserva el origen. Si el tribunal pregunta, la respuesta es: las RD se verificaron en OpenCode; las RE son reglas de diseño que la referente validó.

---

## 5. Glosario (`glosario.md`)

| # | Línea | Texto actual | Corrección | Sostén |
|---|---|---|---|---|
| F2-35 | 9, 16, 17, 23 | «Sí, resuelto en la sesión del \[fecha\]» | «No» | M-13; C-3 |
| F2-36 | 10 a 25 (las demás) | «No» | Sin cambio | — |
| F2-37 | Fuente de los 7 términos validados (líneas 9, 10, 11, 13, 16, 17, 23) | P. ej., «A.I.3, resultado 1» | Agregar «; acta del 26/09/2026» | Acta, sección 6 |
| F2-38 | 27 | «…validado con el referente en la sesión del \[fecha\].» | «Fuente: elaboración propia. Los siete términos con fuente en el acta se validaron con la referente en la sesión del 26/09/2026.» | **El texto actual afirma que se validó todo el glosario; se validaron 7 de 16 términos** (acta, sección 6). Mismo tipo de defecto que V-01 |
| F2-39 | Columna «Falsos amigos y sinónimos» | — | Sin cambio: la referente no informó términos distintos | Acta, sección 6 («Sin diferencia») |

---

## 6. Entidades (`entidades.md`, Tabla 3)

Reclasificación con un valor de la lista; el texto adicional pasa al criterio (M-13).

| # | Línea · candidata | Reclasificación actual | Reclasificación | Criterio |
|---|---|---|---|---|
| F2-40 | 28 · Procedencia | Atributo del valor efectivo | Atributo de otra entidad | «Atributo del elemento, junto con su valor efectivo: es la cadena que conduce a la declaración determinante, no una cosa del dominio» |
| F2-41 | 29 · Archivo | Atributo de Entrada, y elemento del entorno | Atributo de otra entidad | «Atributo de la entrada (su ruta). Como objeto del disco pertenece al entorno: el sistema lo recibe ya formado y no lo modifica» |
| F2-42 | 31 · Desarrollador | Actor externo | Elemento del entorno | «Actor externo, conforme al apartado III.1» |
| F2-43 | 32 · Agente que consume la salida | Sistema vecino | Elemento del entorno | «Sistema vecino, conforme al apartado III.1 (E-01)» |
| F2-44 | 33 · Versión de OpenCode | Atributo de Resolución, y restricción del entorno | Atributo de otra entidad | «Atributo de la resolución y del proyecto analizado; opera además como restricción del entorno. No posee datos ni reglas propios dentro del sistema» |
| F2-45 | 34 · Credencial de autenticación | Fuera del recorte | Elemento del entorno | «Excluida del alcance, conforme al apartado III.4 (L-03)» |
| F2-46 | 7 | «…que el referente utiliza» | «…que la referente utiliza» | Coherencia con el acta |

Valor efectivo y Consulta de permiso ya tienen un valor permitido y no cambian.

**Observación.** «Procedencia» se reclasifica como atributo del elemento, pero la tabla A.V.3 (líneas 42 a 52) no la lista en ninguna entidad. No lo corrijo en esta fase porque la referente validó entidades y relaciones, no atributos. Queda anotado para III.2 y el Anexo V (fase 3).

---

## 7. Fuera de la lista del autor, pero dentro del libro

| # | Qué | Recomendación |
|---|---|---|
| F2-47 | RF-05 · 12: «amenaza A2 de la Tabla 19 del informe de la AE1» es la Tabla 17 (T-09) | Corregir ahora: es un error que el tribunal encuentra en segundos |
| F2-48 | H-22 y H-23 (AD-08, tarea 3) sin fila en la trazabilidad | No en esta pasada: la fila 23 del Anexo I está pendiente de verificación en ejecución |
| F2-49 | `trazabilidad.md` · 54: «no comprometidos en este período salvo RF-12». RF-12 es Could y ningún Could tiene horas (Tabla 18) | Confirmar la intención. Si no hay motivo, quitar «salvo RF-12» |

---

## 8. Estado y pendientes al aplicar

- `estado.md`: el libro no tiene fila en la tabla de estados, así que ninguna sección vuelve a borrador en esta fase. El Anexo I y el Anexo V se alinean en la fase 3.
- `pendientes.md`: se cierran **M-05** (F2-01) y **M-13** (F2-33, F2-35, F2-40 a F2-45). **AD-10** y **AD-11** avanzan (libro hecho; faltan III.5 y el Anexo I). **AD-12** avanza (RNF-06). **AD-21** avanza (RF-03). **A-05** avanza (libro). **A-04** sigue abierto según ADR-045.

---

## 9. Elección del autor

Respuesta del autor (28/09/2026): acepta ADR-045; delega la elección en el ingeniero; las especificaciones de la VM quedan como `[DATO PENDIENTE]` (PV-01).

## 10. Aplicación (28/09/2026)

- Aplicadas: C-1, C-2, C-3 («No»), F2-01 a F2-47 y F2-49.
- F2-19 y F2-20 en su versión con ADR-045. El criterio de RNF-07 conserva dos `[DATO PENDIENTE]` (PV-01, PV-02).
- F2-49: se quita «salvo RF-12», porque RF-12 tiene iteración «Sin asignar» y es Could.
- No aplicada: F2-48 (H-22 y H-23, pendientes de verificación en ejecución; AD-08).
- Control: 27 archivos modificados; no quedan «\[fecha\]», «Verificada en ejecución», «Sí, resuelto» ni «escritorio» en el libro, salvo `iteraciones.md` (fase 5).
- Respaldo previo del libro en el directorio temporal de la sesión.
