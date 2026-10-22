# ADR-019 — Modelo del dominio mixto: Agente como entidad de primera clase y Elemento genérico con subtipos

- Estado: aceptado (retroactivo); consolidado el 22/10/2026 con ADR-020, 074 (absorbidos al final, con su texto completo); aceptado por el autor el 22/10/2026
- Fecha: AE2 (septiembre de 2026)
- Capítulos afectados: Cap. III (III.2.2 y III.2.3); Anexo V (atributos); RNF-03
- Origen: Cap. III, III.2.2 (tabla de entidades); chat «Capitulo III - AE1» (23/09/2026)
- Revisión: 24/09/2026, contenido ampliado a partir del informe; la decisión no cambia
- Relacionado: desarrolla ADR-008 (agente como eje de la representación)

### Contexto
El modelado del dominio sigue la identificación de sustantivos (Larman, 2004; Evans, 2003) y admite como entidad solo a la candidata que tiene identidad propia, datos y reglas propios y pertenencia al recorte (`informe/cap-03/III.2-dominio-sistema-informacion.md`, III.2.2). El ecosistema de OpenCode 1.18.25 presenta ocho tipos de elemento —agente y subagente, modelo, instrucción, comando, skill, servidor MCP, servidor LSP y plugin— (Tabla 5), y el conjunto de tipos varía de una herramienta a otra. La arquitectura separa un núcleo independiente de adaptadores específicos (III.3; RNF-03).

### Alternativas evaluadas
- **Adoptada:** Una entidad genérica Elemento, cuyo tipo declara el adaptador, con Agente como única especialización.
- **Descartada A:** Una entidad por cada tipo de elemento del ecosistema.
- **Descartada B:** Un modelo exclusivamente genérico, sin especialización de Agente.

### Análisis (trade-offs)
- **A (una entidad por tipo)** refleja con exactitud el ecosistema de OpenCode, pero fija en el núcleo los ocho tipos de una herramienta concreta: incorporar otra herramienta obligaría a modificar el núcleo, en contra de RNF-03. Además, siete de los ocho tipos comparten el mismo tratamiento —resolución, procedencia y relación—, de modo que las entidades separadas no aportan reglas propias (III.2.2, último párrafo).
- **B (solo genérico)** maximiza la independencia, pero diluye el comportamiento que únicamente posee el agente: la cadena ordenada de reglas de permiso, la herencia de denegaciones hacia los subagentes que invoca y el conjunto de instrucciones aplicables (III.2.2). Ese comportamiento tendría que expresarse como excepciones por tipo dentro del núcleo, y el agente es además el eje de la representación (ADR-008).
- **La adoptada** conserva la independencia del núcleo porque los tipos de elemento y de relación se declaran en el descriptor de capacidades del adaptador, que constituye el contrato entre adaptador y núcleo y no integra el dominio del negocio (III.2.3). El costo es una relación reflexiva N a N entre elementos con tipo declarado (Tabla 4), menos expresiva que relaciones nominadas.

### Recomendación y fundamento
Adoptar el modelo mixto: es el único que satisface a la vez RNF-03 (el núcleo no conoce los tipos de la herramienta) y el comportamiento diferencial del agente, sobre el cual recaen RF-02, RF-06, RF-09 y RF-10.

### Decisión del autor
Modelar el dominio con una entidad genérica Elemento, cuyo tipo declara el adaptador, y con Agente como especialización de Elemento sobre la que se manifiesta el efecto de toda la configuración.

### Consecuencias
- El adaptador debe publicar un descriptor de capacidades con los tipos de elemento y de relación válidos; su diseño corresponde al capítulo de diseño.
- La prueba de RNF-03 (cero dependencias del núcleo hacia el adaptador) se ejecuta desde la iteración 1 (V.1, Tabla 14).
- Pendientes asociados: Figura 1 del modelo del dominio sin incorporar y fecha del acta de validación de la Tabla 4 (`[fecha]`).
- **Condición que invalidaría la decisión** (observación del ingeniero): que un segundo tipo de elemento adquiera comportamiento propio que el núcleo deba evaluar —por ejemplo, reglas de permiso declaradas sobre comandos o sobre servidores MCP en una versión posterior o en otra herramienta—. En ese caso corresponde una segunda especialización o mover ese comportamiento al descriptor del adaptador, mediante un ADR de reemplazo.

### Evidencia
`informe/cap-03/III.2-dominio-sistema-informacion.md` (III.2.2, Tablas 2 y 3; III.2.3, Tablas 4 y 5); chat «Capitulo III - AE1» (23/09/2026).

### Absorbido el 22/10/2026: ADR-020 — Adoptar «entrada de configuración» como denominación única de las vías por las que llega la configuración

Texto completo del ADR absorbido, sin cambios salvo el nivel de los títulos. Su archivo se eliminó (queda en el historial de git).

- Estado: aceptado (retroactivo)
- Fecha: AE2 (septiembre de 2026)
- Capítulos afectados: Cap. III (III.2.4); glosario del Anexo V; propaga al informe de la AE1 (I.6.3 y siguientes)
- Origen: Cap. III, III.2.4
- Revisión: 24/09/2026, contenido ampliado a partir del informe y del glosario; la decisión no cambia

#### Contexto
La vía por la cual OpenCode incorpora configuración al resolver el estado efectivo —sea o no un archivo— carecía de un nombre estable. La documentación de la herramienta emplea *source*; el uso corriente alterna capa, alcance y nivel; y el informe de la AE1 alternaba entre «fuente» y «entrada» (`informe/cap-03/III.2-dominio-sistema-informacion.md`, III.2.4). El término designa además una entidad del dominio (Tabla 2), de modo que la ambigüedad se trasladaría al modelo de datos.

#### Alternativas evaluadas
- **Adoptada:** «Entrada de configuración», con source, capa, alcance, nivel y fuente registrados como sinónimos no usados.
- **Descartada A:** Conservar «fuente», término del informe de la AE1.
- **Descartada B:** Adoptar el término de la documentación de la herramienta (*source*).

#### Análisis (trade-offs)
- **A** evita retocar el informe de la AE1, pero «fuente» colisiona con «fuentes de datos» del Capítulo II y con el registro de fuentes bibliográficas; en la defensa, «la fuente de la configuración» y «la fuente del dato» resultarían indistinguibles.
- **B** es fiel a la herramienta, pero es un anglicismo y ata el vocabulario del dominio a una herramienta concreta, en contra de la independencia del núcleo (ADR-019, RNF-03).
- **La adoptada** es neutral respecto de la herramienta y no colisiona con otro término del informe. Su costo es la propagación al informe de la AE1, incluida la sustitución de «fuente ilegible» por «entrada ilegible» (`03-requisitos/libro/glosario.md`).

#### Recomendación y fundamento
Adoptar «entrada de configuración»: elimina la colisión con el Capítulo II y da a la entidad del dominio un nombre independiente de la herramienta.

#### Decisión del autor
Emplear «entrada de configuración» y registrar como sinónimos no usados los términos source, capa, alcance, nivel y fuente.

#### Consecuencias
- Toda sección nueva y todo identificador del código usan «entrada»; el revisor de consistencia controla el término.
- Pendiente A-01 (`00-gestion/pendientes.md`): propagar al informe de la AE1.
- El glosario registra el término como «en disputa, resuelto en la sesión del `[fecha]`»; la fecha depende del acta de validación (pendiente A-05).
- Criterio análogo aplicado en III.2.4 al par «permiso» (la decisión) y «regla de permiso» (la declaración que la origina); no requiere ADR propio.
- **Condición que invalidaría la decisión** (observación del ingeniero): que la cátedra o el referente objeten el término; es de bajo riesgo.

#### Evidencia
`informe/cap-03/III.2-dominio-sistema-informacion.md` (III.2.4); `03-requisitos/libro/glosario.md` (entradas «Entrada de configuración» y «Entrada ilegible»).


### Absorbido el 22/10/2026: ADR-074 — Precisiones del modelo del dominio, alcance operativo de RF-07 y tratamiento de las instrucciones (revisión del Cap. III)

Texto completo del ADR absorbido, sin cambios salvo el nivel de los títulos. Su archivo se eliminó (queda en el historial de git).

- Estado: aceptado (01/10/2026)
- Fecha: 01/10/2026
- Capítulos afectados: Cap. III (III.2: Tablas 2 a 5 y Figura 1; III.4: Tabla 8); Anexo I (RF-07); Anexo V (reglas y glosario); libro (`entidades.md`, `reglas.md`, `glosario.md`, `catalogo/RF-07.md`); acta (extensión)
- Origen: revisión del Cap. III del 01/10/2026 (`20261001-cap-III.md` (retirada; consta en el commit `dfaf300`), hallazgos I-1, I-2 e I-3)

#### Contexto

La revisión del Cap. III detectó tres problemas que cambian contenido validado con la referente:

1. **El modelo del dominio contradice sus propias reglas (I-1):**
   - Agente `1` — Regla de permiso obliga a que cada regla pertenezca a un solo agente, aunque las reglas nativas generales y las declaradas globales rigen sobre muchos (RD-03).
   - Elemento `1` — Declaración obliga a que una declaración global componga un solo elemento.
   - Entrada `1..*` Declaración no admite una entrada vacía o ilegible, que es la que produce un hallazgo.
   - La Tabla 2 dice que la sustitución puede originar un hallazgo, pero el `{xor}` no la incluye.
   - Elemento no se vincula con la Resolución, y RE-01 («solo si proviene de una entrada legible») excluye los agentes nativos y los valores implícitos (RF-06, RF-16).
   - «Valor efectivo» figura como producto del sistema en la Tabla 3 y como atributo del elemento en el Anexo V.
2. **RF-07 (Must) depende de relaciones diferidas (I-2).** RE-03 define «elemento sin uso» como el que «ningún agente puede utilizar», lo que exige los vínculos que RF-13 (Could, L-12) difiere.
3. **Las instrucciones están dentro y fuera del alcance (I-3).** III.4 las incluye y el Anexo V las lista como atributo del Agente, pero ningún requisito las compromete en el período (Tabla 5). Además, la Tabla 5 atribuye a RF-01 tipos de elemento que RF-01 no verifica (servidores MCP y LSP, plugins).

#### Alternativas evaluadas

- **I-1:** (A) corregir las multiplicidades y las reglas en el modelo; (B) mantener el modelo y declarar las excepciones en el texto.
- **I-2:** (A) definir «sin uso» y «referencia no resuelta» por nombre, sin la representación de vínculos; (B) llevar al Must el mínimo de relaciones de RF-13.
- **I-3:** (A) presentar las instrucciones como parte del producto, fuera del compromiso del período, y acotar la Tabla 5 a lo que verifica cada requisito; (B) agregar un requisito para las instrucciones.

#### Análisis (trade-offs)

- **I-1 (B)** deja una figura que el tribunal puede refutar con el propio capítulo. **(A)** corrige el modelo sin cambiar su estructura: las mismas nueve entidades y una relación más.
- **I-2 (B)** traslada horas al Must sin presupuesto (ADR-052, ADR-064). **(A)** es implementable con la resolución que el Must ya produce: los nombres de los elementos resueltos y las declaraciones que los nombran.
- **I-3 (B)** agrega un requisito sin horas. **(A)** hace coherentes III.2, III.4 y el Anexo V sin cambiar el alcance.

#### Recomendación y fundamento

**A en los tres ejes.** Valores concretos:

**Modelo del dominio (Tabla 4 y Figura 1; pasa de 12 a 13 relaciones):**

| Relación | Antes | Después |
|---|---|---|
| Un agente evalúa una cadena ordenada de reglas de permiso; una regla rige sobre uno o muchos agentes | `1 a 1..*` | `1..* a 1..*` {ordenada} |
| Una entrada contiene ninguna o muchas declaraciones (una entrada vacía o ilegible no aporta declaraciones) | `1 a 1..*` | `1 a 0..*` |
| Un elemento se compone de ninguna o muchas declaraciones, y una declaración global compone uno o muchos elementos | `1 a 0..*` | `1..* a 0..*` |
| Un hallazgo recae sobre un elemento, una declaración, una entrada o una sustitución | `0..* a 1` {xor: 3} | `0..* a 1` {xor: elemento, declaración, entrada o sustitución} |
| **Nueva:** una resolución comprende uno o muchos elementos, declarados o incorporados por la herramienta | — | `1 a 1..*` |

**Reglas y glosario:**
- **RE-01:** «Un elemento ingresa a la resolución si proviene de una entrada legible o si la herramienta lo incorpora sin declaración (nativo); si una entrada es ilegible, su carga se detiene con error y se registra el hallazgo correspondiente».
- **RE-03:** «Un elemento declarado se marca sin uso solo si ninguna declaración de un agente ni de un comando lo nombra».
- **Glosario, «Elemento sin uso»:** «Elemento declarado al que ninguna declaración de un agente ni de un comando nombra».
- **Glosario, «Referencia no resuelta»:** «Declaración que nombra por su nombre un elemento que no figura en la resolución, o un archivo inexistente».
- **«Valor efectivo»:** en la Tabla 3 pasa a «Atributo de otra entidad», como atributo derivado del elemento que resulta de cada resolución, igual que la procedencia.
- **Glosario:** se agregan «Instrucción» (archivo de instrucciones que se incorpora al contexto de un agente; entrada de configuración cuyo contenido RIGE no evalúa) y «Elemento nativo» (elemento que la herramienta incorpora sin declaración del usuario).

**RF-07, CA-1:** se agrega la precisión: «la detección de referencias no resueltas y de elementos sin uso opera por nombre sobre los elementos de la resolución, sin la representación de vínculos de RF-13».

**Instrucciones y Tabla 5:**
- III.4: la inclusión pasa a «Instrucciones de alcance global y de proyecto como entradas de configuración (su orden de incorporación no se compromete en el período)».
- Tabla 5: Modelo queda en RF-01, porque es clave del agente. Servidor MCP, servidor LSP y plugin pasan a «Descubiertos como declaraciones de las entradas; su resolución completa corresponde a RF-14 (Could)», con «—» en la columna de requisito comprometido.
- La justificación de H-16 en la matriz deja de prometer una advertencia.

**Validación:** las precisiones del modelo, RE-01, RE-03 y RF-07 se suman a la extensión del acta.

**Condiciones que invalidarían la decisión:**
1. **La detección por nombre produce falsos positivos** en elementos que la herramienta referencia de forma implícita. Se acota RE-03 a los tipos donde la referencia es explícita.
2. **La referente objeta las nuevas multiplicidades.** Se vuelve a las validadas y se declaran las excepciones en el texto.

#### Decisión del autor

**Aceptado por el autor el 01/10/2026**, en la sesión, junto con el resto de los hallazgos de la revisión del Cap. III («acepto todo»).

#### Consecuencias

- **III.2:** Tablas 2, 3, 4 y 5; Figura 1 (`tools/figura_modelo_dominio.py`). Las leyendas dejan de contar las precisiones y remiten a la extensión del acta.
- **III.4:** fila de las instrucciones.
- **Anexo V:** RE-01, RE-03 y el glosario.
- **Anexo I:** RF-07, CA-1, y la justificación de H-16.
- **Libro:** `entidades.md`, `reglas.md`, `glosario.md` y `catalogo/RF-07.md`.
- **Acta:** filas nuevas en la extensión.

#### Evidencia

- `20261001-cap-III.md` (retirada; consta en el commit `dfaf300`) (I-1, I-2 e I-3).
- `03-requisitos/libro/reglas.md`, líneas 17 y 19.
- Acta, líneas 368 y 395 a 397.
- ADR-052, ADR-064 (horas) y RF-13 (L-12).

