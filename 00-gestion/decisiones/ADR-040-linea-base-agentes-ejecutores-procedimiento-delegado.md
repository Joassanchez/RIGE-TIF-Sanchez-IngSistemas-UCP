# ADR-040 — Línea de base con agentes de programación como ejecutores del procedimiento delegado, con el modelo como factor controlado, el agente de la referente como ejecutor principal y una encuesta de práctica como complemento

- Estado: aceptado (25/09/2026); reemplaza parcialmente a ADR-038 y ADR-039
- Fecha: 25/09/2026
- Capítulos afectados: Cap. I (I.3.1 a I.3.4); Cap. II (II.2.1, II.2.4, II.3, II.6.3); Cap. V (V.1, V.4); Cap. X (recursos financieros); Anexo I (A.I.1, A.I.5, A.I.7, A.I.8); Anexo III
- Origen: sesión del 25/09/2026 sobre la decisión 7 del traspaso (ADR-039); motivo planteado por el autor: la dificultad de reunir participantes y de sostenerlos en dos mediciones
- Relacionado: de aceptarse, reemplaza parcialmente a ADR-039 (se conserva la ventana F-B; cambian la estimación H-B y la consecuencia R-B) y a ADR-038 (el umbral pasa del participante al modelo); ajusta ADR-003, ADR-005, ADR-011 y ADR-016 (ver «Consecuencias»); retoma ADR-018 en lo relativo a los tokens; se apoya en ADR-017 y RF-03

### Contexto

Diseño vigente (datos del repositorio):
- Medición experimental con personas: ocho casos en cuatro condiciones, sesión supervisada y grabada, diseño pareado con los mismos participantes en la línea de base y en la medición final (`informe/cap-02/II.2-instrumentos-dinamicas-aplicadas-alcance.md`, líneas 7 a 13; ADR-005).
- Mínimo de 5 participantes, sin ninguna sesión realizada y con reclutamiento iniciado (ADR-039, datos aportados por el autor).
- I.3.2 conserva `[N]` y `[fecha]`; la Tabla 4 está vacía (`informe/cap-01/I.3-necesidad-problema-responde-proyecto.md`, líneas 37 a 48).

Exigencia de la cátedra: la línea de base es el valor actual del indicador medido antes de intervenir, y cumple tres funciones: (a) volver falsable el problema; (b) derivar el criterio de éxito como valor objetivo **del mismo indicador**; (c) demostrar ante el tribunal que el sistema produjo algo verificable (`catedra/AE1-guia.md`, 3.3, «Concepto clave — Línea de base»).

Problema: el diseño pareado exige conseguir a las mismas personas dos veces. Cada baja entre mediciones reduce la comparación (consecuencia ya asumida en ADR-005), y la muestra es la limitación declarada del relevamiento.

Evidencia disponible para otro procedimiento de medición (datos del repositorio):
- La referente consulta su propio entorno «mediante un agente de permisos elevados», con consumo de tokens (`informe/anexos/anexo-I-ae1-datos-relevados.md`, línea 139, P-2).
- RF-03 es Must porque «el equipo relevado ya interroga su configuración por vía programática, con consumo de tokens y sin garantía de exactitud» (`03-requisitos/libro/catalogo/RF-03.md`).
- I.3.5 declara que la salida de la línea de comandos «puede ser consumida por otro agente sin revisión humana intermedia».
- ADR-018 dejó el consumo de tokens como gasto incurrido «aunque su magnitud no se cuantificó» (I.3.1, línea 9).

Datos aportados por el autor (25/09/2026): dispone de presupuesto para las ejecuciones sobre modelos de lenguaje; propone solicitar a la referente la configuración de un agente propio de su equipo y relevar mediante una encuesta si la consulta se resuelve a mano o con un modelo o agente.

### Alternativas evaluadas

- **A:** Encuesta a comunidades como línea de base.
- **B:** El instrumento actual como cuestionario web asíncrono, sin supervisión.
- **C:** Análisis analítico del esfuerzo por caso (fuentes, niveles de precedencia y reglas que exige la respuesta; modelo KLM).
- **D:** Incidencias reales del repositorio de OpenCode como banco de casos.
- **E:** Agentes de programación como ejecutores del procedimiento delegado, sobre el instrumento actual.
- **F:** Estudio de diario en el equipo de EMSA.
- **G:** Conservar el diseño con personas (ADR-039).

### Análisis (trade-offs)

- **A:** IB-1 mide errores silenciosos: quien responde no sabe que se equivocó, de modo que una encuesta no puede medirlo. Produce demanda declarada, de valor probatorio medio (`catedra/AE1-guia.md`, 4.1), sobre un universo indefinible. No cumple (b) ni (c). **Se descarta como línea de base y se conserva como complemento** (ver E-3).
- **B:** Cumple (a) y (b), pero reproduce el problema de origen (reclutar y volver a convocar) y pierde el control del entorno y del tiempo.
- **C:** Determinista y reproducible, pero es un modelo y no una observación: mide una estimación del autor y no captura el error.
- **D:** Aporta casos que no construyó el autor y atenúa el sesgo del diseñador declarado en II.2.4 (línea 37). Por sí sola no produce un indicador que RIGE pueda mover. **Se incorpora como fuente de casos de E.**
- **E:**
  - A favor: mide un procedimiento real, documentado en el relevamiento; cumple (a), (b) y (c), y la medición final puede repetirse ante el tribunal; queda pareado por construcción y sin bajas; corrige de forma automática contra la hoja de respuestas cerrada, lo que atenúa la ausencia de instancia ciega; los agentes no recuerdan entre ejecuciones, de modo que desaparece el efecto de práctica de ADR-039 (R-B); cuantifica los tokens por consulta, que ADR-018 no pudo medir; pone a prueba el riesgo de I.3.5 (una salida errónea consumida por un agente).
  - En contra: el sujeto afectado es el desarrollador y lo que se mide es el procedimiento delegado, no el manual (amenaza de validez de constructo); el resultado depende del modelo (ver E-1); requiere presupuesto de API y RF-03 congelado antes de la medición final.
- **F:** Depende de personas (cuatro como máximo, excluida la referente) y no admite la repetición en noviembre. No cumple (b) ni (c).
- **G:** Mide el procedimiento manual directamente, pero su viabilidad depende del reclutamiento y de la permanencia, que es el riesgo que motiva esta decisión.

**E-1 · Control del modelo.** El modelo es un factor del diseño, no ruido. Se controla en tres niveles:

1. **Fijación:** identificador del modelo con versión o fecha, OpenCode 1.18.25, instrucción del agente, redacción de la pregunta, herramientas habilitadas y temperatura cuando el proveedor la exponga. Entre la línea de base y la medición final varía solo la disponibilidad de RIGE, de modo que **la comparación se hace siempre dentro del mismo modelo**.
2. **Sensibilidad:** tres modelos registrados antes del piloto:
   - principal: el que emplea la referente;
   - superior: el más capaz disponible;
   - económico: uno de costo bajo.
   El criterio de éxito se enuncia sobre el principal; los otros dos se informan siempre.
3. **Regla de lectura fijada de antemano:** donde el error de la línea de base es apreciable, prevalece IB-1 (error); donde se aproxima a cero, prevalece el indicador de tokens por consulta. El problema no desaparece con un modelo más capaz: se traslada del error al costo, y RIGE se evalúa por si reduce ese costo sin perder exactitud.

La no determinación del modelo se trata con k ejecuciones por caso y por condición; el valor de k se fija en el piloto (suposición: con el mismo criterio que ADR-003).

**E-2 · Agente de la referente como ejecutor principal.** Es demanda revelada: un artefacto que el equipo construyó antes de RIGE. Responde a la objeción de que la instrucción del agente se redactó para que falle, y determina el modelo principal. Condiciones:
- identificar si el agente solicitado («creador de agentes», según el autor) coincide con el «agente de permisos elevados» del A.I.5; para la línea de base sirve el que consulta la configuración;
- acreditar que el agente existía antes de la entrevista (historial o fecha de modificación), porque la referente conoció el enfoque en ella (ADR-016); si se modificó después, se usa la versión anterior;
- consentimiento escrito para usarlo y citarlo, eliminación de credenciales, rutas internas y datos no publicables, y alta en `01-relevamiento/fuentes.md` con persona, canal y motivo.

Si el agente no se obtiene, se usa como principal el agente general de OpenCode con su instrucción nativa, y se declara.

**E-3 · Encuesta de práctica como complemento.** No mide la línea de base: mide la frecuencia del procedimiento que la línea de base mide, y amplía la base del componente 4 (frecuencia), que hoy procede de una única informante (II.2.4, línea 39). Se diseña así:
- pregunta por el último episodio concreto y no por la conducta habitual;
- opciones cerradas y de selección múltiple;
- ya incluye su respuesta a las tres preguntas: la produce el autor; es una encuesta autoadministrada no probabilística en comunidades declaradas; el período de referencia es el de su aplicación;
- el sesgo de autoselección se declara.

Regla fijada de antemano: si la mayoría responde que resuelve la consulta a mano, la línea de base con agentes se conserva, pero se declara en II.6.3 que el procedimiento manual queda sin medir, y el contraste cualitativo con dos o tres personas, sin pretensión estadística, pasa de opcional a obligatorio.

**Estimación de horas** (estimación del ingeniero; suposiciones a confirmar en la bitácora):

| Concepto | Horas |
|---|---|
| Guion de ejecución y corrección automática (respuesta estructurada: valor, archivo, línea) | 6 a 8 |
| Reconstrucción de casos a partir de incidencias | 2 a 3 |
| Piloto (k, tiempo límite por ejecución, costo) | 1 a 2 |
| Pedido, verificación y limpieza del agente de la referente | ~1 |
| Encuesta: diseño, difusión y análisis | ~3 |
| Análisis y carga de I.3.2 (Tabla 4), II.3 y Anexo I, A.I.8 | ~4 |
| **Total** | **17 a 21** |

Supera las ~9 h de ADR-039 y consume la totalidad de las 20 h de la reserva de la Ventana. Compensación: la medición final se reduce a volver a ejecutar el guion, de modo que buena parte de las 7 h de preparación de la medición final (V.4, línea 16) queda disponible para las correcciones del AE1.

Costo de API: `[DATO PENDIENTE: costo estimado de las ejecuciones: 3 modelos × casos × k × 2 condiciones, a medir en el piloto]`. Método de cálculo en «Registro de modelos y del costo».

### Recomendación y fundamento

Recomendación del ingeniero: **E, con los casos ampliados por D, el control del modelo de E-1, el agente de la referente de E-2 y la encuesta de E-3.** Es la única alternativa que cumple las tres funciones de la línea de base sin depender de reclutar personas y de que vuelvan. Además mide un procedimiento que el relevamiento ya documenta y que RF-03 atiende.

Amenaza declarada (validez de constructo): el desempeño humano en el procedimiento manual no se mide. Defensa: se mide uno de los dos procedimientos reales con que el sujeto afectado resuelve hoy la consulta, acreditado por la referente y cuantificado en su extensión por la encuesta.

**Condición que invalidaría la decisión:** que el piloto muestre que el modelo principal acierta casi todos los casos de C-2 a C-4 y además no consume más tokens que en C-1. En ese caso, delegar en un agente no es un problema, E no mide nada, y se vuelve a G.

### Decisión del autor

**Aceptado por el autor el 25/09/2026**, con las secciones «Ajuste tras revisar el material existente», «Registro de modelos y del costo» y «Rediseño del instrumento», incluido el umbral del criterio principal (dos tercios: 8 de 12 casos). Quedan por fijar antes del piloto: las comunidades de la encuesta; el valor de k lo fija el piloto.

### Consecuencias

- **I.3.1:** manifestación con las dos vías de resolución (manual y delegada); componente 3 con los indicadores de la línea de base con agentes; componente 5 con los tokens por consulta, lo que ajusta la frase «su magnitud no se cuantificó».
- **I.3.2:** medición sobre agentes; Tabla 4 por modelo y condición; nuevo indicador de tokens por consulta; IB-4 extraído de la traza del agente; IB-2 con peso menor, porque depende de la latencia del proveedor.
- **I.3.4:** criterio principal pareado por caso y por modelo, sobre el modelo principal; regla de lectura IB-1/tokens; el umbral de ADR-038 se reexpresa sobre el modelo y no sobre el participante.
- **II.2.1:** reescritura del Instrumento 1 (ejecutor, fijación, sensibilidad, k, corrección automática); se conserva la forma única (ADR-011), con la premisa del recuerdo sustituida: los agentes no recuerdan entre ejecuciones.
- **II.2.2:** las incidencias pasan a ser también fuente de casos.
- **II.2.3 o nuevo instrumento:** encuesta de práctica.
- **II.2.4 e II.6.3:** amenaza de validez de constructo; el sesgo del diseñador queda atenuado por los casos tomados de incidencias; la exclusión de la referente (ADR-016) pierde objeto respecto de la medición y se conserva solo para el contraste cualitativo, si se realiza.
- **ADR-003:** el límite de observación pasa a ser un tiempo límite por ejecución, fijado en el piloto con el mismo criterio de censura.
- **ADR-039:** se conserva la ventana del 02/10 al 16/10 (F-B); la estimación H-B se reemplaza por la de este ADR; R-B pierde el efecto de práctica como amenaza.
- **V.1 y V.4:** horas y compensación con la preparación de la medición final.
- **Cap. X:** costo de API como recurso financiero.
- **RF-03:** debe estar congelado antes de la medición final (iteración 3).
- **Anexo I:** A.I.1 (casos y guion), A.I.5 (agente de la referente), A.I.7 (entorno), A.I.8 (registro de ejecuciones).
- **Anexo III:** deliberación de este ADR.
- Las secciones del AE1 se corrigen en la Ventana; las de la AE2, con `/corregir`.

### Ajuste tras revisar el material existente (25/09/2026)

Revisión: `00-gestion/revisiones/20260925-material-linea-base.md`. Diseño de ejecución resultante: `01-relevamiento/linea-base/DISENO-medicion-agentes.md`.

- **Se reutiliza** el material del diseño con personas (v0.3): los ocho escenarios y los scripts de `01-relevamiento/linea-base/vm/`, la hoja de referencia, la documentación sin conexión y los criterios de construcción y de corrección. La hoja de respuestas se reconstruyó a partir de la v0.3 (`01-relevamiento/linea-base/respuestas.md`).
- **Separación entre escenario y ejecutor:** el agente que responde corre como otro usuario, con su propia configuración y fuera del proyecto. Si corriera dentro del escenario, la configuración del caso lo gobernaría a él mismo (en C-4b ni siquiera podría usar la terminal).
- **Revisión de D-10 del diseño v0.3** («sin IA: se mediría al modelo y no al desarrollador»): la medición con personas prohibía la IA, pero la referente resuelve la consulta con un agente (A.I.5). Lo que D-10 excluía es precisamente el procedimiento delegado que esta decisión mide.
- **Horas:** la estimación baja a 13 a 18 h, porque los casos y los scripts de armado ya existen (suposición; desglose en la revisión, sección 6).
- **Prerrequisitos del piloto:** los defectos L-01 a L-07 de la revisión. L-01 (C-1b) ya está corregido en el escenario.

### Registro de modelos y del costo (25/09/2026, antes del piloto)

Decisión del autor: los modelos son **una sola familia, Anthropic**. Esta sección reemplaza los roles de E-1, punto 2.

| Rol | Modelo | Identificador | Función |
|---|---|---|---|
| M1 · principal | Opus 5.5 | `anthropic/claude-opus-5-5` | Modelo del agente de la referente (según el autor) y el más capaz de la familia a la fecha. Sobre él se enuncia el criterio de éxito |
| M2 · intermedio | Sonnet 5 | `anthropic/claude-sonnet-5` | Punto intermedio de la escalera |
| M3 · económico | Haiku 4.5 | `anthropic/claude-haiku-4-5-20251001` | El de menor costo de la familia |

- **Consecuencia sobre la pregunta del tribunal:** M1 es el más capaz disponible. La pregunta «¿un modelo más caro cambiaría la medición?» queda respondida por construcción, y la sensibilidad se lee hacia abajo: si el resultado empeora con modelos más baratos.
- **Validez externa:** una sola familia no permite afirmar que el resultado se repite en otros proveedores. Se declara como limitación. Qwen queda descartado por decisión del autor.
- **Declaración:** Haiku 4.5 es de una generación anterior a Opus 5.5 y Sonnet 5. En la comparación M1–M3 varían a la vez el tamaño y la generación.
- **Pendientes antes del piloto:**
  - modelo del agente de la referente: el autor confirma que es exactamente Opus 5.5 (25/09/2026). Falta adjuntar como evidencia el archivo del agente o su configuración: `[DATO PENDIENTE: archivo del agente con el campo model]`;
  - `[DATO PENDIENTE: fuente y fecha de consulta de la lista oficial de modelos de Anthropic que acredita que Opus 5.5 es el más capaz]`;
  - comprobar en la fase 0 que OpenCode 1.18.25 reconoce los tres identificadores.
- **Costo real en USD** (el autor carga saldo real en la API):
  - el costo se calcula por ejecución como tokens de entrada, de salida y de caché, multiplicados por el precio oficial por millón de tokens de cada modelo; la tabla de precios se registra con fecha de consulta;
  - no se toma el costo que informa OpenCode: con la descarga del catálogo desactivada, su tabla de precios puede faltar o estar desactualizada para modelos nuevos (a verificar en la fase 0);
  - se usa una clave de API exclusiva de la medición, para que la consola del proveedor aísle el gasto. El total calculado se concilia con el consumo de la consola, y la diferencia se informa;
  - piloto, línea de base y medición final se informan por separado. El total alimenta los recursos financieros del Cap. X;
  - el saldo cargado queda como `[DATO PENDIENTE: monto en USD y fecha de carga]`.

### Rediseño del instrumento (25/09/2026)

Detalle: `01-relevamiento/linea-base/DISENO-medicion-agentes.md` v1.1, sección 4.1, y `respuestas.md`.

- **Dieciséis casos, cuatro por condición** (antes, ocho). Los dos casos por condición provenían del límite de duración de una sesión humana (D-07 de la v0.3). Con agentes, dos casos solo admiten tasas de 0, 50 o 100 % por condición, y un caso peculiar decide la condición entera. Los ocho casos nuevos tienen cada uno un mecanismo distinto (laboratorio E-03, E-14 y E-18c; código del tag; incidencias #36663, #36416 y #39715). No se generan variantes automáticas: aportan cantidad, no variedad de mecanismos.
- **Criterios de construcción:** se eliminan la equivalencia entre a y b (8.2-6) y la no repetición (8.2-9), que controlaban el aprendizaje humano. Se agrega el **8.2-10: cada caso dentro del alcance del MVP y consultable por la línea de comandos**.
- **Unidad de análisis: el caso**, no la ejecución. k baja a 3 o 5, según el piloto. La generalización la aportan los casos, no las repeticiones.
- **Forma propuesta del criterio principal** (reexpresa ADR-038 sobre casos; aceptada por el autor el 25/09/2026): sobre M1 y los doce casos de C-2 a C-4, un caso tiene **éxito** si su tasa de error con RIGE es menor que sin RIGE, **o** si es nula en ambas mediciones (regla de techo). El criterio se cumple si tienen éxito al menos dos tercios de los casos (8 de 12), y todo caso que retrocede se informa con su causa. Tokens: la mediana, por caso, de la diferencia de tokens con y sin RIGE no es positiva.
- **Uso de RIGE en la medición final:** RIGE figura solo en la hoja de referencia, y el agente decide si lo usa (campo `uso_rige`).
- **Dependencia crítica:** la mitad de los casos son de permisos, y la línea de comandos de RIGE no los consulta (ADR-022). Sin ADR-041 (propuesto), RIGE no puede mostrar su efecto en C-4. Se cumple la condición de invalidación de ADR-022.
- **Defecto corregido en `vm/caso.sh`:** las variables de entorno del caso se escribían al final de `~/.bashrc`, que Ubuntu no ejecuta en shells no interactivos. `como-dev` y `verificar.sh` no habrían visto la variable de C-3a. El bloque pasa al principio del archivo, con los valores escapados. `verificar.sh` usa un shell de inicio de sesión y cubre los dieciséis casos.
- **Horas adicionales** (suposición): la verificación de los ocho casos nuevos en la VM y la resolución de sus [VERIFICAR], de 3 a 5 h. Los escenarios ya están escritos.

### Evidencia

`catedra/AE1-guia.md` (3.3 y 4.1); `informe/cap-01/I.3-necesidad-problema-responde-proyecto.md` (líneas 5 a 11, 37 a 48, 71 y 83); `informe/cap-02/II.2-instrumentos-dinamicas-aplicadas-alcance.md` (líneas 7 a 13, 17, 37 y 39); `informe/anexos/anexo-I-ae1-datos-relevados.md` (línea 139); `03-requisitos/libro/catalogo/RF-03.md`; ADR-003, ADR-005, ADR-011, ADR-016, ADR-017, ADR-018, ADR-038, ADR-039. Borrador de la encuesta y del pedido a la referente: `00-gestion/borrador-encuesta-practica.md`.
