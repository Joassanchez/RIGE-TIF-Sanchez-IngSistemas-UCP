# ADR-036 — Esquema de la salida por línea de comandos: el esquema publicado y su versión integran RF-03; RNF-08 conserva solo la política de compatibilidad

- Estado: propuesto
- Fecha: 25/09/2026
- Capítulos afectados: Cap. III (III.1, III.5 Tabla 9); Anexo I (fichas RF-03 y RNF-08); `03-requisitos/libro/catalogo/` (RF-03, RNF-08)
- Origen: análisis integral del 25/09/2026, hallazgo III-05 (`00-gestion/revisiones/20260925-analisis-integral.md`); traspaso de sesión, grupo B, decisión 4 (`00-gestion/revisiones/20260925-traspaso-sesion.md`)
- Relacionado: complementa ADR-022 (comando único de la CLI); respeta el recuento de ADR-035 (14 Must de 23)

### Contexto

El criterio de aceptación de RF-03 (Must) exige que la salida «valida contra el esquema publicado» (`03-requisitos/libro/catalogo/RF-03.md`). El único requisito que crea ese esquema es RNF-08 (Should, sin horas asignadas, iteración «Sin asignar»; `03-requisitos/libro/catalogo/RNF-08.md`). Resultado: un Must depende de un artefacto que el catálogo declara opcional.

Además, III.1 declara que el agente consumidor de la CLI es el elemento más determinante para la arquitectura y le exige un «esquema versionado con compromiso de compatibilidad» (`informe/cap-03/III.1-entorno-sistema-informacion.md`). I.6.5, por su parte, excluyó la biblioteca de integración porque «exigiría un compromiso de compatibilidad ajeno al alcance de esta etapa» (`informe/cap-01/I.6-descripcion-detallada-sistema-informacion.md`).

El criterio actual de RNF-08 («un conjunto de salidas de referencia de la versión anterior continúa validando») necesita, para ejercitarse, que exista una segunda versión del esquema. En el período habrá una sola.

### Alternativas evaluadas

- **A:** Subir RNF-08 entero a Must.
- **B:** Quitar la validación de esquema del criterio de RF-03 y dejar RNF-08 como está.
- **C:** Dividir: RF-03 absorbe el esquema publicado y la versión declarada en la salida; RNF-08 conserva solo la política de compatibilidad entre versiones.

### Análisis (trade-offs)

- **A:**
  - A favor: cierra la tensión de una vez.
  - En contra: rompe el recuento de ADR-035 (15 Must de 23); obliga a asignar horas en la Tabla 18 (hoy 0); su criterio no es comprobable en el período porque exige una versión anterior del esquema.
- **B:**
  - A favor: cambio mínimo, una frase.
  - En contra: el Must queda sin comprobación estructural de que la salida sea legible por máquina (el determinismo prueba igualdad, no procesabilidad); la contradicción con III.1 persiste, porque todo lo que ese apartado exige al elemento determinante quedaría en Should.
- **C:**
  - A favor: conserva los 14 Must; deja comprobables todos los criterios dentro del período; alinea III.1 («versionado» en Must, «compromiso de compatibilidad» en Should); RNF-08 pasa a ser genuinamente diferible.
  - Costo: reescribir enunciado y criterio de RNF-08 y retocar RF-03, III.5 y el Anexo I. El esfuerzo recae en las 6 h de RF-03 (V.4, Tabla 18). *Suposición:* un esquema JSON para un único comando y su validación en CI entran en esas horas.

**Distinción para la defensa** (conocimiento general de ingeniería): publicar el esquema de la salida de un comando es un contrato de datos acotado; una biblioteca compromete una API de funciones con una superficie mucho mayor. En ambos casos el compromiso de *compatibilidad* queda diferido (RNF-08 Should; biblioteca excluida en I.6.5), de modo que C no contradice I.6.5.

### Recomendación y fundamento

Recomendación del ingeniero: **C**. Es la única alternativa que elimina la dependencia de un Must respecto de un Should sin alterar la priorización de ADR-035 y con criterios verificables en el período.

**Condición que invalidaría la decisión:** que el referente o el equipo relevado integren la salida de RIGE en sus propias herramientas dentro del período, o que deba publicarse una segunda versión del esquema antes de la defensa. En ese caso la compatibilidad deja de ser diferible y corresponde la alternativa A, con horas asignadas.

### Decisión del autor

El autor manifiesta conformidad con la alternativa **C** (25/09/2026). Pendiente el cambio de estado por el autor (`/aceptar`).

### Consecuencias

Se aplican con `/corregir` en la pasada por el Cap. III y el Anexo I (grupo C):

- **RF-03** (`03-requisitos/libro/catalogo/RF-03.md` y Anexo I): el criterio exige que la salida valide contra el esquema publicado en el repositorio **y declare la versión del esquema**. En la misma pasada se aplican cambios ya decididos: «interfaz de escritorio» → «interfaz web local» (ADR-032) y «OE-2» → «OE-1» (T-09).
- **RNF-08** (`03-requisitos/libro/catalogo/RNF-08.md` y Anexo I):
  - Enunciado: todo cambio incompatible del esquema de salida de la línea de comandos incrementa su versión mayor.
  - Criterio: publicada una nueva versión del esquema sin cambio de versión mayor, las salidas de referencia de la versión anterior continúan validando contra ella; ante un cambio incompatible, la versión mayor declarada en la salida se incrementa.
  - Motivo de la prioridad: el compromiso solo se ejercita cuando existe una segunda versión del esquema, que el período no prevé.
  - La prioridad (Should), la iteración y el MVP no cambian.
  - **Categoría** (agregado del 25/09/2026, decisión 5 del grupo B; cierra M-01): «Compatibilidad» → **Mantenibilidad**. Con esta división, RNF-08 expresa una política de evolución que permite modificar el esquema sin romper a su consumidor (modificabilidad, ISO/IEC 25010). Se consigna en nota que la norma lo ubica en Compatibilidad (interoperabilidad), categoría ausente de la lista de la cátedra (`00-gestion/reglas-catedra.md`, sección 6). Alternativas descartadas: Portabilidad (refiere a la adaptación a otra plataforma, no a un contrato de datos) y conservar «Compatibilidad» con fundamento (valor fuera de la lista cerrada). Condición que invalidaría el agregado: que el docente admita categorías de ISO/IEC 25010 fuera de la lista. El autor lo acepta el 25/09/2026.
- **III.5, Tabla 9:** denominación de RNF-08 → «Compatibilidad del esquema de salida entre versiones» (o equivalente que el redactor ajuste).
- **III.1:** sin cambio de texto; queda sostenido por la división. Verificar en la pasada que no atribuya el esquema a RNF-08.
- **Anexo III:** fila de la decisión cuando se complete AD-04.

### Evidencia

`03-requisitos/libro/catalogo/RF-03.md`; `03-requisitos/libro/catalogo/RNF-08.md`; `informe/cap-03/III.1-entorno-sistema-informacion.md`; `informe/cap-03/III.5-catalogo-requisitos.md` (Tabla 9); `informe/cap-01/I.6-descripcion-detallada-sistema-informacion.md` (I.6.5); `informe/cap-05/V.4-cronograma.md` (Tabla 18); ADR-022, ADR-032, ADR-035.
