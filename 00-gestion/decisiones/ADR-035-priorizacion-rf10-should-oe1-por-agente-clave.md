# ADR-035 — Priorización: RF-10 pasa a Should y OE-1 se enuncia por agente y clave

- Estado: aceptado (25/09/2026)
- Fecha: 25/09/2026
- Capítulos afectados: Cap. I (I.2.4, Tabla 1); Cap. III (III.5, Tabla 9); Cap. V (V.2, V.4 Tablas 18 y 19, V.5 Tabla 20); Anexo I; `03-requisitos/libro/` (catálogo RF-10, iteraciones)
- Origen: análisis integral del 25/09/2026, hallazgo III-06 (`00-gestion/revisiones/20260925-analisis-integral.md`); cuestión abierta en ADR-034

### Contexto

El catálogo tiene 15 requisitos Must sobre 23 (RF-01 a RF-10 y RNF-01 a RNF-05; `informe/cap-03/III.5-catalogo-requisitos.md`), el 65 %. La Guía AE2 (§4.3) lee la columna de prioridad como indicador de madurez.

La cláusula de contingencia (`informe/cap-05/V.4-cronograma.md`, Tabla 19) ya ordena qué se abandona ante una caída de un tercio de la capacidad: RF-03 (3.º), RF-10 (4.º), RF-04 (5.º) y RF-07 (6.º). Un Must que se posterga entre los primeros se comporta como Should, y el tribunal puede señalarlo con la propia tabla del informe.

Además, OE-1 (`informe/cap-01/I.2-mision-vision-objetivos-proyecto.md`, Tabla 1) dice «para cada elemento del ecosistema», mientras que RF-01 resuelve el valor efectivo por agente y clave, y ningún Must resuelve el valor efectivo de servidores MCP, LSP o skills como elementos propios.

### Alternativas evaluadas

- **A:** Mantener los 15 Must y reforzar el motivo de prioridad de cada uno.
- **B:** Bajar RF-10 a Should (14 de 23, 61 %).
- **C:** Dejar como Must solo lo que la Tabla 19 protege: RF-03, RF-04, RF-07 y RF-10 pasan a Should (11 de 23).

### Análisis (trade-offs)

- **A:**
  - A favor: no toca el MVP ni las Tablas 18 a 20.
  - En contra: la contradicción con la Tabla 19 persiste.
- **B:**
  - A favor: coherencia con la contingencia. RF-10 es una extensión de CU-03 (V.5), no su núcleo.
  - Costo: cambiar catálogo, Tabla 9, V.5 (Tabla 20 y el conteo «quince»), V.2 y la Tabla 19.
- **C:**
  - En contra: OE-3 quedaría apoyado en un Should y la CLI, que III.1 declara determinante para la arquitectura (ADR-022), quedaría opcional. Demasiado disruptivo.

RF-03 se posterga temprano (3.º), pero se mantiene Must: su postergación está argumentada en V.4 y lo sostienen ADR-022 y III.1.

### Recomendación y fundamento

Recomendación del ingeniero: **B**, y reformular OE-1 a «para cada agente y cada clave de configuración». Corrige la incoherencia que el tribunal puede señalar sin desarmar los objetivos, y alinea OE-1 con el eje del agente (ADR-008) y con lo que el MVP efectivamente resuelve.

**Condición que invalidaría la decisión:** que la validación con la referente muestre que saber si la herramienta queda visible para el modelo es una necesidad central.

### Decisión del autor

Alternativa **B** y reformulación de OE-1 (25/09/2026).

### Consecuencias

Se aplican con `/corregir` en la pasada por cada capítulo:

- **RF-10** (`03-requisitos/libro/catalogo/RF-10.md` y Anexo I): Prioridad → Should; motivo de la prioridad reescrito (extensión de CU-03 que no interviene en la medición final ni en la mitigación del riesgo principal; primer requisito con horas asignadas que la contingencia posterga); ¿Integra el MVP? → No.
- **III.5, Tabla 9:** RF-10 → Should; revisar el conteo del párrafo inicial si menciona prioridades.
- **V.5:** «quince requisitos Must» → «catorce»; quitar RF-10 de la enumeración de extensiones de flujo (línea 16) y de lo que satisface CU-03 en la Tabla 20.
- **V.4, Tabla 19:** la fila 4 se rotula como Should.
- **I.2.4, Tabla 1, OE-1:** «para cada elemento del ecosistema declarado en las fuentes ejercitables» → «para cada agente y cada clave de configuración declarada en las fuentes ejercitables». Se combina con los cambios de ADR-034.
  - **Redacción aplicada (25/09/2026, elegida por el autor; `00-gestion/revisiones/20260925-correcciones-grupo-A.md`, C-1, opción B):** «Determinar, sobre las entradas ejercitables, el valor efectivo de cada clave de configuración de cada agente, declarado por el usuario o incorporado por la herramienta, con su procedencia, las declaraciones desplazadas o la indicación de valor implícito, y la localización de la declaración determinante en su archivo de origen.» Conserva el eje de la decisión (agente y clave). Cambia la redacción propuesta por dos motivos: «fuentes» pasa a «entradas» (ADR-020), y «clave declarada» excluía las claves con valor implícito, que el mismo enunciado pide informar.

**Punto a confirmar en la pasada por el Cap. V:** si RF-10 conserva sus 4 h en la iteración 2 (Should planificado, Tabla 18 sin cambios) o las cede a la estabilización. Recomendación: conservarlas, para no mover la Tabla 18 ni V.2.

### Evidencia

`informe/cap-03/III.5-catalogo-requisitos.md` (Tabla 9); `informe/cap-05/V.4-cronograma.md` (Tabla 19); `informe/cap-05/V.5-descripcion-producto-minimo-viable.md`; `03-requisitos/libro/catalogo/RF-10.md`; `informe/cap-01/I.2-mision-vision-objetivos-proyecto.md` (Tabla 1); ADR-008, ADR-022, ADR-034.
