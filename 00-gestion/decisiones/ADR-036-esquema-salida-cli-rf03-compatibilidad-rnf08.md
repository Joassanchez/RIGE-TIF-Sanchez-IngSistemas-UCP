# ADR-036 — Esquema de la salida por línea de comandos: el esquema publicado y su versión integran RF-03; RNF-08 conserva solo la política de compatibilidad; la explicación en prosa se ofrece por línea de comandos a pedido (`--explicar`)

- Estado: aceptado (25/09/2026), alternativas C y E3; reemplaza parcialmente a ADR-021 (límite de la explicación a la interfaz gráfica)
- Fecha: 25/09/2026 (ampliado el mismo día con el eje de la explicación, tras ADR-041 y ADR-042)
- Capítulos afectados: Cap. III (III.1, III.5 Tabla 9 y párrafo final); Anexo I (fichas RF-02, RF-03, RF-07 y RNF-08); `03-requisitos/libro/catalogo/` (RF-02, RF-03, RF-07, RNF-08); Cap. V (V.4, Tabla 18)
- Origen: análisis integral del 25/09/2026, hallazgo III-05 (`00-gestion/revisiones/20260925-analisis-integral.md`); traspaso de sesión, grupo B, decisión 4 (`00-gestion/revisiones/20260925-traspaso-sesion.md`)
- Relacionado: complementa ADR-022 (comando único de la CLI); respeta el recuento de ADR-035 (14 Must de 23); se ajusta a ADR-041 (permisos por línea de comandos) y ADR-042 (línea de comandos completa); reemplaza parcialmente a ADR-021

### Contexto

El criterio de aceptación de RF-03 (Must) exige que la salida «valida contra el esquema publicado» (`03-requisitos/libro/catalogo/RF-03.md`). El único requisito que crea ese esquema es RNF-08 (Should, sin horas asignadas, iteración «Sin asignar»; `03-requisitos/libro/catalogo/RNF-08.md`). Resultado: un Must depende de un artefacto que el catálogo declara opcional.

Además, III.1 declara que el agente consumidor de la CLI es el elemento más determinante para la arquitectura y le exige un «esquema versionado con compromiso de compatibilidad» (`informe/cap-03/III.1-entorno-sistema-informacion.md`). I.6.5, por su parte, excluyó la biblioteca de integración porque «exigiría un compromiso de compatibilidad ajeno al alcance de esta etapa» (`informe/cap-01/I.6-descripcion-detallada-sistema-informacion.md`).

El criterio actual de RNF-08 («un conjunto de salidas de referencia de la versión anterior continúa validando») necesita, para ejercitarse, que exista una segunda versión del esquema. En el período habrá una sola.

**Evidencia posterior a la primera redacción (25/09/2026).** Dos decisiones cambian lo que el esquema describe.
- **ADR-041:** la línea de comandos también responde decisiones de permiso.
- **ADR-042:** la línea de comandos es la interfaz completa. Expone valores y permisos en la iteración 2 y hallazgos en la iteración 3, y también la usa el desarrollador, no solo un agente.

Por eso el esquema describe tres respuestas y no un único comando. Además cae la premisa con la que ADR-021 limitó la explicación en prosa a la interfaz gráfica: «el consumidor de esa vía es un agente, no una persona». Otro condicionante: el criterio principal aceptado (ADR-040, AD-22) exige que la mediana de tokens por caso no aumente con RIGE. Toda salida que el agente lee se suma a esos tokens.

### Alternativas evaluadas

- **A:** Subir RNF-08 entero a Must.
- **B:** Quitar la validación de esquema del criterio de RF-03 y dejar RNF-08 como está.
- **C:** Dividir: RF-03 absorbe el esquema publicado y la versión declarada en la salida; RNF-08 conserva solo la política de compatibilidad entre versiones.

**Eje 2 · Explicación en prosa por línea de comandos**

- **E1:** Solo datos estructurados, como establece ADR-021.
- **E2:** La explicación se incluye siempre, como un campo `explicacion` de la salida.
- **E3:** La explicación se incluye solo a pedido, con la opción `--explicar`, declarada en la ayuda del comando y en el esquema.

### Análisis (trade-offs)

- **A:**
  - A favor: cierra la tensión de una vez.
  - En contra: rompe el recuento de ADR-035 (15 Must de 23); obliga a asignar horas en la Tabla 18 (hoy 0); su criterio no es comprobable en el período porque exige una versión anterior del esquema.
- **B:**
  - A favor: cambio mínimo, una frase.
  - En contra: el Must queda sin comprobación estructural de que la salida sea legible por máquina (el determinismo prueba igualdad, no procesabilidad); la contradicción con III.1 persiste, porque todo lo que ese apartado exige al elemento determinante quedaría en Should.
- **C:**
  - A favor: conserva los 14 Must; deja comprobables todos los criterios dentro del período; alinea III.1 («versionado» en Must, «compromiso de compatibilidad» en Should); RNF-08 pasa a ser genuinamente diferible.
  - Costo: reescribir enunciado y criterio de RNF-08 y retocar RF-03, III.5 y el Anexo I.
  - Horas: con ADR-041 y ADR-042 el esquema cubre tres respuestas. Cada parte entra en las horas de la tarea que la produce: valores en las 6 h de RF-03, permisos en las ~4 h de ADR-041 (iteración 2) y hallazgos en las ~2 h de ADR-042 (iteración 3). *Suposición:* un esquema JSON por respuesta y su validación en CI entran en esas horas.

**Eje 2.**
- **E1:**
  - A favor: salida mínima y menor consumo de tokens del agente.
  - En contra: el desarrollador que trabaja en la terminal no recibe explicación. La interfaz web limitada queda como única vía para entender una decisión, en contra de ADR-042, que define la línea de comandos como la interfaz completa.
- **E2:**
  - A favor: reutiliza las plantillas y el oráculo de ADR-021, y el determinismo se conserva porque las plantillas son deterministas. Costo aproximado de 1 h (suposición).
  - En contra: agrega tokens a cada respuesta que lee el agente, lo que juega en contra del criterio de tokens del resultado (AD-22).
- **E3:**
  - A favor: sin la opción, la salida es idéntica a E1 y protege el criterio de tokens. El desarrollador y el agente piden la explicación cuando la necesitan. Si el agente la pide, queda registrado como parte del uso de RIGE en la medición (campo `uso_rige`), así que se obtiene un dato sin costo adicional.
  - En contra: una opción más para probar y para documentar en el esquema, que declara el campo `explicacion` como opcional. Costo aproximado de 1 a 2 h (suposición), dentro de las tareas de RF-03 y de RF-07.

**Distinción para la defensa** (conocimiento general de ingeniería): publicar el esquema de la salida de un comando es un contrato de datos acotado; una biblioteca compromete una API de funciones con una superficie mucho mayor. En ambos casos el compromiso de *compatibilidad* queda diferido (RNF-08 Should; biblioteca excluida en I.6.5), de modo que C no contradice I.6.5.

### Recomendación y fundamento

Recomendación del ingeniero: **C**. Es la única alternativa que elimina la dependencia de un Must respecto de un Should sin alterar la priorización de ADR-035 y con criterios verificables en el período.

Eje 2: **E3**. Es la única que atiende al desarrollador en la terminal sin poner en riesgo el criterio de tokens del resultado.

**Condición que invalidaría la decisión:** que el referente o el equipo relevado integren la salida de RIGE en sus propias herramientas dentro del período, o que deba publicarse una segunda versión del esquema antes de la defensa. En ese caso la compatibilidad deja de ser diferible y corresponde la alternativa A, con horas asignadas.

**Condición que invalidaría E3:** que en el piloto de la medición (ADR-040) el agente no use nunca `--explicar` y falle en casos donde la explicación contenía la respuesta. En ese caso se evalúa E2 frente al criterio de tokens.

### Decisión del autor

**Aceptado por el autor el 25/09/2026: alternativas C y E3.**

### Consecuencias

Se aplican con `/corregir` en la pasada por el Cap. III y el Anexo I (grupo C):

- **RF-03** (`03-requisitos/libro/catalogo/RF-03.md` y Anexo I): el criterio exige que la salida valide contra el esquema publicado en el repositorio **y declare la versión del esquema**. En la misma pasada se aplican cambios ya decididos: «interfaz de escritorio» → «interfaz web local» (ADR-032) y «OE-2» → «OE-1» (T-09).
- **RNF-08** (`03-requisitos/libro/catalogo/RNF-08.md` y Anexo I):
  - Enunciado: todo cambio incompatible del esquema de salida de la línea de comandos incrementa su versión mayor.
  - Criterio: publicada una nueva versión del esquema sin cambio de versión mayor, las salidas de referencia de la versión anterior continúan validando contra ella; ante un cambio incompatible, la versión mayor declarada en la salida se incrementa.
  - Motivo de la prioridad: el compromiso solo se ejercita cuando existe una segunda versión del esquema, que el período no prevé.
  - La prioridad (Should), la iteración y el MVP no cambian.
  - **Categoría** (agregado del 25/09/2026, decisión 5 del grupo B; cierra M-01): «Compatibilidad» → **Mantenibilidad**. Con esta división, RNF-08 expresa una política de evolución que permite modificar el esquema sin romper a su consumidor (modificabilidad, ISO/IEC 25010). Se consigna en nota que la norma lo ubica en Compatibilidad (interoperabilidad), categoría ausente de la lista de la cátedra (`00-gestion/reglas-catedra.md`, sección 6). Alternativas descartadas: Portabilidad (refiere a la adaptación a otra plataforma, no a un contrato de datos) y conservar «Compatibilidad» con fundamento (valor fuera de la lista cerrada). Condición que invalidaría el agregado: que el docente admita categorías de ISO/IEC 25010 fuera de la lista. El autor lo acepta el 25/09/2026.
- **Explicación por línea de comandos (E3):**
  - **RF-02 y RF-07** (fichas y Anexo I): el criterio incorpora que, con la opción `--explicar`, la línea de comandos entrega la misma explicación que la interfaz web para la misma decisión o el mismo hallazgo.
  - **Esquema:** declara `explicacion` como campo opcional.
  - **RF-03:** el determinismo se exige con la opción y sin ella.
  - **III.5, párrafo final:** «en la interfaz de escritorio» pasa a «en ambas interfaces; por línea de comandos, a pedido».
  - **ADR-021:** pasa a «reemplazado parcialmente por ADR-036». Conserva las plantillas deterministas y su alcance (F4 y F5); cambia solo el límite a la interfaz gráfica.
- **V.4, Tabla 18:** sin horas nuevas. El esquema por respuesta y la opción `--explicar` se absorben en RF-03 (iteración 2) y en RF-07 (iteración 3). Se revisa en `/corregir` de V.4, junto con ADR-042.
- **III.5, Tabla 9:** denominación de RNF-08 → «Compatibilidad del esquema de salida entre versiones» (o equivalente que el redactor ajuste).
- **III.1:** sin cambio de texto; queda sostenido por la división. Verificar en la pasada que no atribuya el esquema a RNF-08.
- **Anexo III:** fila de la decisión cuando se complete AD-04.

### Evidencia

`03-requisitos/libro/catalogo/RF-03.md`; `03-requisitos/libro/catalogo/RNF-08.md`; `informe/cap-03/III.1-entorno-sistema-informacion.md`; `informe/cap-03/III.5-catalogo-requisitos.md` (Tabla 9); `informe/cap-01/I.6-descripcion-detallada-sistema-informacion.md` (I.6.5); `informe/cap-05/V.4-cronograma.md` (Tabla 18); `01-relevamiento/linea-base/DISENO-medicion-agentes.md` (campo `uso_rige`, línea 195); ADR-021, ADR-022, ADR-032, ADR-035, ADR-040, ADR-041 y ADR-042.
