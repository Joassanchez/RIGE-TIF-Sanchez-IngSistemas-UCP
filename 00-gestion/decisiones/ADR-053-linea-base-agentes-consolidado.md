# ADR-053 — Línea de base con agentes de programación como ejecutores del procedimiento delegado: tres modelos Anthropic, dieciséis casos, criterio de 8 de 12 y ejecución del 02/10 al 16/10 con cargo a la Ventana

- Estado: aceptado (28/09/2026)
- Fecha: 28/09/2026
- Capítulos afectados: Cap. I (I.1.2, I.2.3 y OE-4, I.3.1 a I.3.4, I.6.5); Cap. II (II.2.1 a II.2.4, II.3, II.6.3); Cap. V (V.1, V.4); Cap. X (X.3); Anexo I del AE1 (A.I.1, A.I.5, A.I.7, A.I.8); Anexo III
- Origen: consolidación del 28/09/2026 (pendiente LI-01). No es una decisión nueva: reúne lo vigente de ADR-038, ADR-039 y ADR-040, todos aceptados el 25/09/2026.
- Reemplaza: ADR-038, ADR-039 y ADR-040. Sus archivos se eliminaron el 28/09/2026 (quedan en el historial de git).
- Relacionado:
  - Decisiones del AE1 que ajusta (Anexo III): D-03 (límite de observación), D-05 (criterio anclado y pareado), D-11 (forma única del instrumento), D-16 (exclusión de la referente) y D-18 (sin valoración monetaria; ahora los tokens se cuantifican).
  - ADR-051 (la CLI responde valores y permisos: sin eso, RIGE no puede mostrar su efecto en C-4).
  - ADR-057 (tope de API y regla de recorte).
  - ADR-054 (imagen de contenedor común para la medición).
  - ADR-052 (reserva de la Ventana).

### Contexto

La cátedra define la línea de base como el valor actual del indicador, medido antes de intervenir. Cumple tres funciones (`catedra/AE1-guia.md`, 3.3):
- **(a)** vuelve falsable el problema;
- **(b)** deriva el criterio de éxito como valor objetivo del mismo indicador;
- **(c)** demuestra ante el tribunal que el sistema produjo algo verificable.

El diseño del AE1 medía con personas: ocho casos en cuatro condiciones, en sesiones supervisadas y pareadas. Tenía un mínimo de 5 participantes y ninguna sesión realizada.

El diseño pareado exige conseguir a las mismas personas dos veces. El autor planteó la dificultad de reunirlas y de sostenerlas en dos mediciones.

Hay evidencia de otro procedimiento real:
- la referente consulta su entorno «mediante un agente de permisos elevados», con consumo de tokens (Anexo I del AE1, A.I.5);
- RF-03 es Must porque el equipo ya interroga su configuración por vía programática.

La decisión se tomó en tres pasos el 25/09/2026:

| Paso | ADR | Qué fijó | Qué quedó vigente |
|---|---|---|---|
| 1 | 038 | Umbral del criterio con personas: nadie pierde más de una respuesta, regla de techo, informe de todo retroceso | La regla de techo y el informe de retrocesos; el umbral pasa del participante al caso |
| 2 | 039 | Ventana del 02/10 al 16/10, con cargo a la reserva de la Ventana, como deuda del AE1; corrección de la premisa de D-11 | La ventana y la imputación; cambian las horas y desaparece la amenaza de práctica |
| 3 | 040 | Agentes como ejecutores; modelo como factor controlado; 16 casos; criterio de 8 de 12 | Todo |

### Alternativas evaluadas

**Eje 1 · Procedimiento de medición**
- **A:** Encuesta a comunidades como línea de base.
- **B:** El instrumento actual como cuestionario web asíncrono.
- **C:** Análisis analítico del esfuerzo por caso (modelo KLM).
- **D:** Incidencias reales de OpenCode como banco de casos.
- **E:** Agentes de programación como ejecutores del procedimiento delegado.
- **F:** Estudio de diario en el equipo de EMSA.
- **G:** Conservar el diseño con personas.

**Eje 2 · Fecha**
- **F-A:** Medir antes del 02/10.
- **F-B:** Medir entre el 02/10 y el 16/10.
- **F-C:** Medir en la iteración 3.

**Eje 3 · Horas**
- **H-A:** Imputarlas a la capacidad técnica.
- **H-B:** Imputarlas a la reserva de la Ventana, como deuda del AE1.
- **H-C:** No computarlas.

**Eje 4 · Umbral del criterio principal**
- **U-A:** Cero retrocesos.
- **U-B:** Umbral acotado por unidad de análisis, con regla de techo.
- **U-C:** Cantidad máxima de unidades que retroceden.
- **U-D:** Sin cláusula de retroceso.

### Análisis (trade-offs)

- **A:** el error que mide IB-1 es silencioso (quien responde no sabe que se equivocó) y produce demanda declarada. No cumple (b) ni (c). Se conserva como **complemento** (encuesta de práctica).
- **B y G:** reproducen el problema de origen: reclutar a las mismas personas y volver a convocarlas.
- **C:** es un modelo, no una observación, y no captura el error.
- **D:** no produce por sí sola un indicador. Se incorpora como **fuente de casos** de E, lo que atenúa el sesgo del diseñador.
- **E:**
  - A favor:
    - mide un procedimiento real y documentado, y cumple (a), (b) y (c);
    - queda pareado por construcción y sin bajas;
    - la corrección es automática, contra una hoja de respuestas cerrada;
    - los agentes no recuerdan entre ejecuciones, así que no hay efecto de práctica;
    - cuantifica los tokens que D-18 no pudo medir;
    - pone a prueba el riesgo de I.3.5 (una salida errónea consumida por un agente).
  - En contra:
    - se mide el procedimiento delegado y no el manual (amenaza de validez de constructo);
    - el resultado depende del modelo;
    - requiere presupuesto de API y RF-03 congelado antes de la medición final.
- **F:** depende de personas y no puede repetirse en noviembre.
- **F-A:** no es realista junto con la entrega del 01/10.
- **F-B:** la Tabla 13 del IV.3 conserva su función, porque el orden de la iteración 2 se decide después del evaluador.
- **F-C:** la Tabla 13 pierde su función.
- **H-A:** trata una deuda del AE1 como trabajo técnico y desplaza requisitos.
- **H-C:** deja contradicciones con la Tabla 13 y V.1.
- **H-B:** respeta la naturaleza de la tarea. El costo es que consume la reserva de la Ventana, y se compensa con la preparación de la medición final, que pasa a ser volver a ejecutar el guion.
- **U-A:** puede fallar por azar.
- **U-C:** depende del tamaño de la muestra.
- **U-D:** pierde la protección ante una respuesta inducida por RIGE.
- **U-B, sobre casos:** es inequívoco y queda fijado antes de medir.

### Recomendación y fundamento

**E (con casos de D) + encuesta de práctica + F-B + H-B + U-B sobre casos.** Es lo que el autor aceptó el 25/09/2026. Es la única alternativa que cumple las tres funciones de la línea de base sin depender de reclutar personas dos veces.

**Amenaza declarada:** el desempeño humano en el procedimiento manual no se mide. La defensa es que se mide uno de los dos procedimientos reales con que el sujeto afectado resuelve hoy la consulta, acreditado por la referente y dimensionado por la encuesta.

**Condiciones que invalidarían la decisión:**
1. **El piloto muestra que M1 no tiene problema.** M1 acierta casi todos los casos de C-2 a C-4 y no consume más tokens que en C-1: delegar no es un problema, E no mide nada y se vuelve a G.
2. **El evaluador de permisos se incorpora antes de que termine la medición.** El orden de la iteración 2 se decide sin la Tabla 13, y se declara en V.1.
3. **Las correcciones del AE1 no caben en lo que queda de la reserva.** Se prioriza la medición y se registra qué corrección se posterga.
4. **Cambia la estructura del instrumento.** El umbral se reexpresa en proporción.

### Decisión del autor

**Aceptado por el autor el 28/09/2026** (consolidación). Las decisiones de fondo ya están aceptadas: ADR-038, ADR-039 y ADR-040, el 25/09/2026. La aceptación de este registro solo autoriza la consolidación.

### Consecuencias

**Diseño de la medición** (detalle en `01-relevamiento/linea-base/DISENO-medicion-agentes.md` v1.1 y `respuestas.md`).

| Elemento | Valor vigente |
|---|---|
| Ejecutor | Agente de programación sobre OpenCode 1.18.25. Corre como otro usuario, con su propia configuración y fuera del proyecto del caso |
| Ejecutor principal | El agente de la referente. Condiciones: ser el que consulta la configuración; acreditar que existía antes de la entrevista (si no, se usa la versión anterior); consentimiento, limpieza y alta en `fuentes.md`. Si no se obtiene, el agente general de OpenCode con su instrucción nativa, y se declara |
| Modelos (una sola familia; Qwen descartado) | M1 Opus 5.5 `anthropic/claude-opus-5-5` (principal: es el modelo del agente de la referente y el más capaz de la familia) · M2 Sonnet 5 `anthropic/claude-sonnet-5` · M3 Haiku 4.5 `anthropic/claude-haiku-4-5-20251001` |
| Fijación | Modelo con versión, OpenCode 1.18.25, instrucción, pregunta, herramientas y temperatura. Entre las dos mediciones solo varía la disponibilidad de RIGE: la comparación es siempre dentro del mismo modelo |
| Casos | Dieciséis, cuatro por condición (C-1 a C-4), cada uno con un mecanismo distinto. Criterio 8.2-10: dentro del alcance del MVP y consultable por la CLI. Ocho son de permisos, incluida toda C-4 |
| Unidad de análisis | El caso. k = 3 a 5 ejecuciones, fijado en el piloto |
| Tiempo límite | Por ejecución, fijado en el piloto con el criterio de censura de D-03 |
| Uso de RIGE | Figura solo en la hoja de referencia; el agente decide si lo usa (campo `uso_rige`) |

**Criterio principal (I.3.4):**
- Sobre M1 y los doce casos de C-2 a C-4, un caso tiene **éxito** si su tasa de error con RIGE es menor que sin RIGE, o si es nula en ambas mediciones (regla de techo).
- El criterio se cumple con **al menos 8 de 12** casos exitosos.
- Todo caso que retrocede se informa con su causa.
- **Tokens:** la mediana, por caso, de la diferencia con y sin RIGE no es positiva.

**Regla de lectura:**
- donde el error de la línea de base es apreciable, prevalece IB-1;
- donde se aproxima a cero, prevalecen los tokens por consulta;
- M2 y M3 se informan siempre, y la sensibilidad se lee hacia abajo;
- en M1–M3 varían a la vez el tamaño y la generación, y se declara;
- la validez externa se limita a una familia de modelos.

**Encuesta de práctica:**
- Pregunta por el último episodio concreto, con opciones cerradas, y declara el sesgo de autoselección. La tabla de las tres preguntas va en el borrador (`01-relevamiento/linea-base/borrador-encuesta-practica.md`).
- **Regla fijada de antemano:** si la mayoría resuelve a mano, se declara en II.6.3 que el procedimiento manual queda sin medir, y el contraste cualitativo con dos o tres personas pasa a ser obligatorio.

**Costo de API:**
- se calcula por ejecución: tokens de entrada, salida y caché × precio oficial por millón, con la fecha de consulta;
- no se toma el costo que informa OpenCode;
- se usa una clave exclusiva de la medición, conciliada con la consola del proveedor;
- piloto, línea de base y medición final se informan por separado;
- tope y regla de recorte: ADR-057.

**Fecha y horas:**
- La ejecución va del 02/10 al 16/10, como deuda del AE1, con cargo a la reserva de la Ventana (ADR-052).
- La estimación es de **16 a 23 h** (13 a 18 de construcción y análisis, más 3 a 5 de verificación de los ocho casos nuevos). Se compensa con las 7 h de preparación de la medición final.
- Las horas reales se registran en la bitácora.

**Correcciones en el informe:** detalladas en `00-gestion/ventana-ae1.md`, §1. Resumen:
- I.3.1 a I.3.4 y la Tabla 4, por modelo y condición, con el nuevo indicador de tokens;
- II.2.1: se reescribe el instrumento; se conserva la forma única (D-11), con la premisa del recuerdo sustituida porque los agentes no recuerdan entre ejecuciones;
- II.2.2: las incidencias pasan a ser también fuente de casos;
- II.2.4 e II.6.3: amenaza de validez de constructo; D-16 pierde objeto respecto de la medición y se conserva solo para el contraste cualitativo;
- I.2.3 y OE-4 se alinean con la medición;
- I.6.5 agrega la razón de la medición;
- en el Anexo I: A.I.1 (casos y guion), A.I.5 (agente de la referente), A.I.7 (entorno) y A.I.8 (registro de ejecuciones);
- Cap. X: el costo de API como recurso financiero.

**Anexo III:** sin cambios. La fila D-41 y su deliberación ampliada siguen siendo la fuente del informe, y D-36 sigue siendo la de la ventana.

**Al aceptarse:**
- eliminar ADR-038, 039 y 040;
- en `INDICE.md`, reemplazar sus tres filas por esta;
- en `ventana-ae1.md`, `pendientes.md` (AD-19) y `01-relevamiento/linea-base/borrador-encuesta-practica.md`, cambiar ADR-040 por ADR-053.

### Evidencia

- `catedra/AE1-guia.md` (3.3 y 4.1)
- `informe/cap-01/I.3-necesidad-problema-responde-proyecto.md`
- `informe/cap-02/II.2-instrumentos-dinamicas-aplicadas-alcance.md`
- `informe/anexos/anexo-I-ae1-datos-relevados.md` (A.I.5)
- `03-requisitos/libro/catalogo/RF-03.md`
- `01-relevamiento/linea-base/DISENO-medicion-agentes.md`
- `01-relevamiento/linea-base/respuestas.md`
- `informe/cap-05/V.4-cronograma.md` (línea 16)
- Anexo III, D-36 y D-41
- Historial de git: ADR-038, 039 y 040, y la revisión «material-linea-base» del 25/09/2026
