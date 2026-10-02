# ADR-074 — Precisiones del modelo del dominio, alcance operativo de RF-07 y tratamiento de las instrucciones (revisión del Cap. III)

- Estado: aceptado (01/10/2026)
- Fecha: 01/10/2026
- Capítulos afectados: Cap. III (III.2: Tablas 2 a 5 y Figura 1; III.4: Tabla 8); Anexo I (RF-07); Anexo V (reglas y glosario); libro (`entidades.md`, `reglas.md`, `glosario.md`, `catalogo/RF-07.md`); acta (extensión)
- Origen: revisión del Cap. III del 01/10/2026 (`20261001-cap-III.md` (retirada; consta en el commit `dfaf300`), hallazgos I-1, I-2 e I-3)

### Contexto

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

### Alternativas evaluadas

- **I-1:** (A) corregir las multiplicidades y las reglas en el modelo; (B) mantener el modelo y declarar las excepciones en el texto.
- **I-2:** (A) definir «sin uso» y «referencia no resuelta» por nombre, sin la representación de vínculos; (B) llevar al Must el mínimo de relaciones de RF-13.
- **I-3:** (A) presentar las instrucciones como parte del producto, fuera del compromiso del período, y acotar la Tabla 5 a lo que verifica cada requisito; (B) agregar un requisito para las instrucciones.

### Análisis (trade-offs)

- **I-1 (B)** deja una figura que el tribunal puede refutar con el propio capítulo. **(A)** corrige el modelo sin cambiar su estructura: las mismas nueve entidades y una relación más.
- **I-2 (B)** traslada horas al Must sin presupuesto (ADR-052, ADR-064). **(A)** es implementable con la resolución que el Must ya produce: los nombres de los elementos resueltos y las declaraciones que los nombran.
- **I-3 (B)** agrega un requisito sin horas. **(A)** hace coherentes III.2, III.4 y el Anexo V sin cambiar el alcance.

### Recomendación y fundamento

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

### Decisión del autor

**Aceptado por el autor el 01/10/2026**, en la sesión, junto con el resto de los hallazgos de la revisión del Cap. III («acepto todo»).

### Consecuencias

- **III.2:** Tablas 2, 3, 4 y 5; Figura 1 (`tools/figura_modelo_dominio.py`). Las leyendas dejan de contar las precisiones y remiten a la extensión del acta.
- **III.4:** fila de las instrucciones.
- **Anexo V:** RE-01, RE-03 y el glosario.
- **Anexo I:** RF-07, CA-1, y la justificación de H-16.
- **Libro:** `entidades.md`, `reglas.md`, `glosario.md` y `catalogo/RF-07.md`.
- **Acta:** filas nuevas en la extensión.

### Evidencia

- `20261001-cap-III.md` (retirada; consta en el commit `dfaf300`) (I-1, I-2 e I-3).
- `03-requisitos/libro/reglas.md`, líneas 17 y 19.
- Acta, líneas 368 y 395 a 397.
- ADR-052, ADR-064 (horas) y RF-13 (L-12).
