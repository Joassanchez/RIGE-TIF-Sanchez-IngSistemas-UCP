# ADR-045 — RNF-07: proyecto de referencia dimensionado con el mayor entre un proyecto público y el de la referente, y medición por etapas en Windows 11 sin umbral

- Estado: aceptado (28/09/2026), P-F + W-C
- Fecha: 28/09/2026
- Capítulos afectados: Cap. III (III.5); Anexo I (ficha RNF-07); libro (RNF-07); Cap. V (V.4, tarea de estabilización de la iteración 4); Cap. X (X.2, equipo de referencia); `01-relevamiento/fuentes.md`; diseño del v1 (opción de tiempos por etapa)
- Origen: sesión de validación del 26/09/2026 (`01-relevamiento/validacion/20260925_GuiaValidacion_Sanchez_v2.md`, sección 3.2 y L-11); pasada posterior a la validación, fase 1, observación O-1 (`00-gestion/revisiones/20260928-pasada-validacion-acta.md`); pendiente A-04
- Relacionado: reemplaza parcialmente a ADR-044 (eje P y la cláusula «si la referente no informa el tamaño»); ADR-023 (condición de la caché); ADR-037 (plataformas, P3); ADR-042 (la línea de comandos es la interfaz del agente); ADR-036 (salida determinista)

### Contexto

ADR-044 fijó RNF-07 con P-B + Q-A + T-A: un proyecto sintético con el doble de agentes, entradas y elementos que el proyecto real de la referente, medido en la máquina virtual Ubuntu 26.04, con la invocación completa por línea de comandos en menos de 2 s. Previó que, si la referente no informaba el tamaño, se aplicaba P-A (el escenario más grande del entorno controlado) y se declaraba la limitación.

Datos nuevos:
- En la sesión del 26/09/2026, la referente **no dispone** de las tres cifras de su proyecto y **acepta** el umbral de 2 s (acta, sección 3.2) [R].
- El equipo de la referente programa en **Windows** (acta, L-11 y sección 8) [R].
- La máquina virtual Ubuntu 26.04 corre en el mismo equipo Windows 11 del autor (dato del autor, 28/09/2026) [A].

Problemas que abren:
1. **P-A no sirve como sustituto.** El entorno controlado se diseña para verificar la corrección, no para representar volumen (ADR-044, análisis de P-A), y todavía no existe (U-01). Aplicarlo dejaría el criterio sin un tamaño comprobable hasta la iteración 4.
2. **Volver a preguntar lo mismo** probablemente da la misma respuesta: la referente no tiene el dato a mano. No se trata de disposición [S].
3. **La plataforma medida no es la del único usuario real.** RNF-07 se acredita en Ubuntu. En Windows, el arranque de procesos y el acceso a archivos suelen ser más costosos, con el análisis en tiempo real del antivirus entre las causas habituales [I]. Acreditar 2 s en Ubuntu no informa el tiempo que paga el agente de la referente [S].

### Alternativas evaluadas

**Eje P · Proyecto de referencia** (reemplaza el eje P de ADR-044)
- **P-A:** El escenario más grande del entorno controlado (la cláusula actual de ADR-044).
- **P-D:** Un proyecto público con configuración de OpenCode, elegido con un criterio reproducible.
- **P-E:** Volver a consultar a la referente y esperar su respuesta.
- **P-F:** Combinar P-D y P-E: el proyecto sintético tiene el doble del **mayor** de los dos; mientras la referente no responda, rige solo el público.

**Eje W · Medición en Windows 11** (agregado; no existía en ADR-044)
- **W-A:** No medir en Windows (ADR-044 sin cambios).
- **W-B:** Medir en Windows el tiempo total de la invocación, como dato informativo.
- **W-C:** Medir en ambas plataformas el tiempo **por etapa**: arranque del proceso, descubrimiento y lectura de entradas, resolución y armado de la salida. En Ubuntu con umbral (el criterio de RNF-07); en Windows, informativo.
- **W-D:** Mover el equipo de referencia a Windows 11 (Q-C de ADR-044) con umbral.

### Análisis (trade-offs)

**Eje P.**
- **P-A:** ver el problema 1.
- **P-D** es verificable por terceros y está disponible ya. Pierde el ancla del único usuario real, que era el fundamento de P-B, y un repositorio público solo muestra la configuración del proyecto: las entradas globales y las variables de quien lo mantiene no se ven, así que el recuento de entradas queda por debajo del real. Si se elige un repositorio sin criterio, el tribunal pregunta «¿por qué ese?».
- **P-E** conserva el ancla, pero depende de un dato que la referente no tiene y deja el criterio con `[N]`. Un requisito sin criterio comprobable no se computa (`00-gestion/reglas-catedra.md`, sección 6).
- **P-F** da un criterio comprobable desde ya (P-D) y conserva el ancla si llega el dato (P-E). Tomar el mayor mantiene el criterio del lado exigente. Para que P-E no repita la sesión, la consulta no pide «cifras» sino un **procedimiento de conteo** breve que la referente ejecuta sobre su equipo. Costo: una búsqueda, un alta en `/fuente` y un texto de consulta, fuera de las horas técnicas.
- **Licencia del proyecto público.** Del repositorio se toman solo **recuentos**. El proyecto sintético se genera y no copia archivos del repositorio, así que no se redistribuye su contenido [I].

**Eje W.**
- **W-A** deja sin medir la plataforma del único usuario real.
- **W-B** agrega un número, pero no dice qué hacer si supera los 2 s.
- **W-C** convierte la medición en una herramienta de diagnóstico:
  - **Elige la optimización correcta.** La caché por hash de ADR-023 acelera la lectura y la resolución, no el arranque. Si en Windows domina el arranque o el análisis del antivirus, la caché no resuelve el problema y el remedio es otro, por ejemplo un ejecutable compilado [I]. El desglose evita implementar una optimización que no actúa sobre la causa.
  - **Controla RNF-06 a escala sin costo adicional.** El mismo proyecto sintético corre en ambas plataformas, y la comparación de salidas con rutas normalizadas (ADR-037, P1) prueba la equivalencia sobre un volumen grande, no solo sobre los escenarios de rutas.
  - **Comparabilidad.** Como la máquina virtual corre en el mismo equipo físico, la diferencia entre plataformas no se explica por el hardware, salvo la sobrecarga de la virtualización, que se declara [I].
  - **Sin horas nuevas.** Se ejecuta en la corrida manual de la iteración 4 que ya prevé ADR-037 (P3), con cargo a la estabilización.
- **W-D** mide lo que importa al usuario real, pero pierde la coherencia con las mediciones y el oráculo en Ubuntu (ADR-037), y el umbral quedaría expuesto a la variabilidad del equipo de desarrollo, que también ejecuta el entorno de trabajo del autor [S].

**Dónde va la medición en Windows.** Una medición sin umbral no aprueba ni rechaza nada, así que no integra el criterio de aceptación. Va en la tarea de estabilización de V.4.

**Determinismo de la salida.** Los tiempos cambian en cada corrida. Si figuraran en la salida estructurada, esta dejaría de ser idéntica ante entradas idénticas (RF-03, ADR-036). Van por el canal de error y solo a pedido. El nombre y la forma de la opción se definen en el diseño del v1.

### Recomendación y fundamento

Recomendación del ingeniero: **P-F + W-C**, con Q-A y T-A de ADR-044 sin cambios.

**1. Proyecto público (P-D).**
- **Búsqueda:** búsqueda de código de GitHub de repositorios públicos con `opencode.json` u `opencode.jsonc` o con un directorio `.opencode/`, en una fecha registrada.
- **Elección:** el repositorio con más agentes y subagentes declarados; en caso de empate, el de más elementos. Si el más grande no resuelve con OpenCode 1.18.25 sin entradas ilegibles, se pasa al siguiente.
- **Recuento:** agentes, entradas de proyecto y elementos. A las entradas se suman las globales del entorno controlado, y se declara que el recuento de entradas es un límite inferior.
- **Registro:** alta en `01-relevamiento/fuentes.md` con `/fuente`, con las tres preguntas, la consulta de búsqueda, la fecha y la versión del repositorio (commit).

**2. Consulta a la referente (P-E).**
- **Qué se le pide:** un procedimiento de conteo en `01-relevamiento/validacion/`: qué directorios revisar (configuración global y del proyecto), qué contar (agentes, archivos y variables de configuración, comandos, skills, servidores MCP) y cómo informarlo. Solo recuentos, sin contenido.
- **Alcance:** la respuesta, si llega, **no requiere una nueva sesión de validación**. Es un dato de dimensionamiento, no un punto a validar.

**3. Regla del tamaño.** El proyecto sintético tiene el doble del mayor recuento de cada magnitud entre P-D y P-E. Mientras P-E no llegue, rige P-D y la ficha lo declara.

**4. Medición por etapas (W-C).**
- **Plataformas:** las mismas diez corridas en la máquina virtual Ubuntu 26.04 y en Windows 11, con el mismo proyecto sintético y el antivirus en su configuración habitual.
- **Qué se registra:** tiempo total y tiempo por etapa (arranque, descubrimiento y lectura, resolución, salida).
- **Umbral:** solo en Ubuntu (criterio de RNF-07). En Windows la medición es informativa.

**5. Regla de decisión sobre el resultado en Windows.**
- Si supera los 2 s y domina la lectura o la resolución: se aplica la condición de ADR-023 (caché por hash).
- Si domina el arranque: se registra como limitación de la plataforma y se propone el remedio que corresponda en un ADR, sin comprometer horas del período.

Criterio de aceptación propuesto para RNF-07:

> Sobre un proyecto sintético con el doble de agentes, entradas y elementos que el mayor entre el proyecto público de referencia —[DATO PENDIENTE: repositorio, commit y recuentos, tras la búsqueda]— y el proyecto del equipo de la referente, si lo informa, en la máquina virtual Ubuntu 26.04 de referencia —[DATO PENDIENTE: procesador, núcleos y memoria asignados]—, la invocación completa por línea de comandos de la consulta de valores de un agente finaliza en menos de 2 s, medida sobre diez corridas y tomando el peor caso.

**Condición que invalidaría la decisión:**
- Que la búsqueda no encuentre un repositorio público que resuelva con OpenCode 1.18.25. En ese caso se aplica P-A con su limitación declarada.
- Que la referente informe un proyecto mucho mayor que el público: rige el suyo, como prevé la regla.
- Que la medición en Windows supere los 2 s por una causa que el remedio no absorba dentro del período: se evalúa W-D en un ADR de reemplazo.

### Decisión del autor

**Aceptado por el autor el 28/09/2026: P-F + W-C**, con Q-A y T-A de ADR-044. Las especificaciones de la máquina virtual y del equipo anfitrión quedan como `[DATO PENDIENTE]` hasta la pasada de especificaciones (PV-01).

### Consecuencias

- **RNF-07** (ficha y Anexo I):
  - enunciado: «consulta por línea de comandos», conforme a ADR-044;
  - criterio: el propuesto;
  - la medición por etapas en Windows 11 no figura en la ficha: los campos del catálogo los fija la cátedra (`00-gestion/reglas-catedra.md`, sección 6) y ninguno admite una verificación sin umbral. Consta en V.4.
- **ADR-044:** estado «aceptado; reemplazado parcialmente por ADR-045 (eje P)». Q-A y T-A siguen vigentes.
- **`01-relevamiento/fuentes.md`:** alta del proyecto público (`/fuente`).
- **`01-relevamiento/validacion/`:** procedimiento de conteo para la referente. Su envío lo hace el autor.
- **V.4:** la tarea de estabilización de la iteración 4 incorpora la medición por etapas en ambas plataformas, sin horas nuevas (ADR-037, P3).
- **X.2:** el equipo físico Windows 11 del autor aloja la máquina virtual Ubuntu 26.04. Se declaran las especificaciones de ambos y la sobrecarga de la virtualización.
- **Diseño del v1:** opción para emitir los tiempos por etapa por el canal de error, fuera de la salida estructurada. Se discute con el diseño.
- **A-04:** se cierra en su parte de RNF-07 cuando se registre el proyecto público y la VM tenga sus especificaciones.
- **ADR-023:** la condición de la caché se evalúa con el desglose, no con el tiempo total.

### Evidencia

`01-relevamiento/validacion/20260925_GuiaValidacion_Sanchez_v2.md` (sección 3.2, L-11, sección 8); `00-gestion/revisiones/20260928-pasada-validacion-acta.md` (B-2, O-1); `03-requisitos/libro/catalogo/RNF-07.md`; ADR-023, ADR-036, ADR-037 y ADR-044; `00-gestion/reglas-catedra.md` (sección 6).
