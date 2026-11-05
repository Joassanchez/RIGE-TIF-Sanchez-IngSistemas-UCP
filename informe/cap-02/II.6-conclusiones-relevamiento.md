## II.6 · Conclusiones del relevamiento

La evidencia acredita una falla de verificación del procedimiento delegado y acota su alcance al mecanismo observado. La demanda de verificabilidad permanece declarada, con confirmación pendiente de la referente.

### II.6.1 · Resultados y decisiones que habilitan

#### Resultado 1. La verificación declarativa precede al éxito declarado falso

La medición del autor registra cinco de 33 problemas de E2 con éxito declarado falso en al menos dos de tres repeticiones de cada ejecutor. El desglose por familia es cuatro de cuatro de ruta absoluta y uno de 29 en el resto. Los cinco presentan reglas con ruta absoluta en los archivos finales (apartado I.3.2).[^1]

La verificación declarativa precede a todos los éxitos declarados falsos; los conteos y la corrección posterior al dato, favorable a la tesis, constan en I.3.2. La reclasificación de la verificación y su evidencia se registran en el Anexo VI, A.VI.8.

La insuficiencia de leer la regla se funda en el mecanismo técnico: la introspección la muestra sin evaluar su coincidencia con una acción (Anexo VI, A.VI.3). La detección alcanza ocho de once defectos por ejecutor y deja sin identificar de forma consistente los de ruta absoluta (apartado I.3.2).[^1]

Decisión que habilita: se prioriza evaluar la decisión para la acción consultada, incluida la normalización de rutas de RF-02, CA-9, y detectar reglas sin efecto mediante RF-07. Se descarta comprobar el cambio solo mediante la presencia de la regla en la salida declarativa (Anexo III, D-41). La comparación con el pedido de probar el efecto se incorpora a la medición final según I.3.4.

El costo no delata el error; las medianas y el límite de comparar problemas distintos se presentan en I.3.1.

#### Resultado 2. La falla observada acota la meta a un mecanismo

De los 29 problemas de E2 cuya familia en el banco es ajena a la ruta absoluta, el agente resuelve 28 con ambos ejecutores, según el umbral de dos de tres repeticiones de I.3.2.[^1] La atribución medida por el autor el 13/10/2026, sobre 24 casos con tres repeticiones por ejecutor, tampoco acredita el problema para `build` (Anexo VI, A.VI.2). Charles registra dos errores de 54 consultas y un caso con problema, C-4e. Se conserva ese resultado y se reorienta el problema porque la regla de ramas exige los dos ejecutores (Anexo III, D-66).

Los ejecutores comparten `gpt-6.1-sol`; sus resultados constituyen dos condiciones del mismo laboratorio, sin carácter de réplicas independientes. El modelo real del equipo, `gpt-6-luna`, queda fuera de esta línea de base.

Decisión que habilita: la meta de mejora se fija sobre el mecanismo observado, con la cobertura y la no regresión del apartado I.3.4. Se conserva la consulta del valor efectivo y su procedencia como capacidad del producto, RF-01, y se descarta sostener la meta sobre la atribución (Anexo III, D-41).

#### Resultado 3. La introspección muestra la regla sin evaluar su efecto

OpenCode evalúa la regla con ruta absoluta contra la ruta relativa al árbol; `opencode debug` la muestra sin evaluar su coincidencia con la acción (Anexo VI, A.VI.3). La resolución conjunta de las entradas se describe en I.1.1.

La documentación explicita la última coincidencia en `permissions.mdx`. Enumera ocho fuentes frente a doce entradas del código y omite el orden interno de los directorios `.opencode`. Declara `deny` para `.env`, donde el código aplica `ask`.

Decisión que habilita: se prevé resolver según el comportamiento verificado por ejecución. Se descarta reconstruirlo solo desde la documentación por esas discrepancias verificadas (Anexo III, D-06).

#### Resultado 4. Los reportes públicos aportan antecedentes con distinto alcance

Los antecedentes externos del mecanismo y el alcance de la búsqueda posterior al hallazgo se detallan en I.1.3 a). La clasificación del corpus inicial de incidencias se conserva por separado en el Anexo VI, A.VI.6.[^2]

Decisión que habilita: el problema conserva antecedentes externos al laboratorio, cuya vigencia en la versión fija se comprueba mediante reproducción nativa. La familia de ruta absoluta se incorpora conociendo la falla del 14/10/2026; sus antecedentes públicos se buscan el 19/10. La inclusión exige reproducción nativa antes de ejecutar el banco, con ese antecedente de selección declarado (Anexo III, D-41).

El cálculo de la tasa de ruta absoluta considera la proporción entre ejecuciones de E2 que agregan o modifican reglas de permiso por archivo o directorio. Usan ruta absoluta 13 de 30 con `build` (43,33 %) y 16 de 31 con Charles (51,61 %). E1 carece de ejecuciones elegibles. La tasa describe los problemas seleccionados, sin estimar la frecuencia de la práctica (Anexo VI, A.VI.8).[^1]

#### Resultado 5. El equipo declara la necesidad y aporta un artefacto de configuración

Los episodios y las prácticas relatados por la referente constituyen demanda declarada; se desconocen sus causas. La verificación de agentes internos y sus límites constan en el Anexo VI, A.VI.3, resultado 18. Los relatos se presentan en II.3.3. La definición de Charles entregada el 13/10/2026 constituye el artefacto observado; su valor probatorio se distingue del testimonio en II.6.2.

Decisión que habilita: se conservan los elementos nativos en el alcance de I.6.1 e I.6.3 por las reglas y los valores incorporados que verifica el relevamiento técnico (Anexo VI, A.VI.3). La interfaz de línea de comandos responde a la práctica declarada y al pedido de consulta programática de la referente, según I.6.2 e I.6.5.

#### Resultado 6. La demanda de procedencia también aparece en otra herramienta

Winning (2026) solicita públicamente exponer la procedencia de la configuración de Codex y enlaza siete incidencias; la propuesta permanece abierta sin respuesta del equipo de mantenimiento al 01/10/2026. Su alcance es el de una solicitud individual, conforme a II.1.2. Los mecanismos de configuración difieren entre herramientas (Galster, Mohsenimofidi, Lulla et al., 2026).

Decisión que habilita: se prevé un núcleo independiente de la herramienta y un único adaptador inicial, conforme a la visión del producto y RNF-03. Es una decisión de diseño declarada; la heterogeneidad documenta las reglas particulares que debe tratar cada adaptador (apartado I.6.5).

#### Resultado 7. El diferencial combina decisión y procedencia por declaración

Amp y Codex evalúan acciones e informan reglas coincidentes; Codex también informa el origen de valores por clave y capa. El contraste de soluciones se presenta en el apartado II.3.4. Ninguna de las soluciones relevadas sobre OpenCode explica una decisión concreta junto con la procedencia por declaración (Anexo VI, A.VI.4).

Decisión que habilita: se fija como diferencial la decisión con su regla determinante y su procedencia por entrada, archivo y posición, incluidos los valores implícitos y las declaraciones sin efecto. Se descarta situarlo solo en explicar la decisión, función ya cubierta por Amp y Codex (Anexo III, D-59).

### II.6.2 · Estado de la demanda acreditada

La propuesta inicial corresponde a demanda imaginada. La medición con agentes aporta evidencia de la falla del procedimiento delegado y el relevamiento técnico acredita su mecanismo. Ambas evidencias sostienen el problema; la demanda se acredita con el testimonio y la conducta observada.

La demanda de verificabilidad es declarada y procede de una informante. El punto 1.4 de la constancia registra que el cambio sin efecto se advierte tarde; el 2.2 consigna que el equipo delega las correcciones y los cambios en un agente (Anexo VI, A.VI.5). La respuesta al enfoque presentado respalda la identificación del archivo que determina cada valor efectivo, capacidad de RF-01.

Los episodios, el agente de permisos elevados y el consumo de tokens conservan el valor de relatos declarados. La pizarra carece de registro firmado. La definición de Charles, recibida el 13/10/2026, constituye demanda revelada por un artefacto observado que respalda la práctica de delegar la configuración (apartado II.3.3).

La próxima constancia conjunta reúne la confirmación del problema reformulado, la anterioridad de Charles y el pedido de lectura de la configuración real del equipo. Incluye los criterios agregados el 22/10/2026, la reformulación de L-07 y las precisiones de límites del registro de cambios ante la referente (Anexo II). La autorización para publicar nombre y rol se solicita en esa instancia. La confirmación continúa pendiente y se desconoce la fecha de la sesión.

Las incidencias públicas y los antecedentes de ruta absoluta aportan demanda revelada débil: son reportes no solicitados, con las diferencias de alcance de A.VI.6. Las soluciones de terceros también muestran conducta observada, aunque cubren funciones parciales y otras herramientas (Anexo VI, A.VI.4). La propuesta de Winning (2026) aporta una declaración independiente sobre la procedencia, con el alcance individual del resultado 6.

### II.6.3 · Limitaciones reconocidas y su efecto sobre la confianza

La estimación de consultas y la corrección del error de registro se detallan en I.3.1; se conservan como contexto, fuera de los cálculos de magnitud y costo (Anexo III, D-18). El vínculo entre la baja declarada y Charles es una inferencia de las respuestas 2.1 y 2.9 (apartado II.3.3). Los datos de consumo de tokens y retrabajo que faltan se enumeran en II.3.3.

Delegar la configuración en un agente no equivale a comprobar su efecto. El éxito declarado falso de I.3.2 acredita esa diferencia para el procedimiento medido. La reducción declarada de consultas manuales describe la práctica del equipo; la verificación insuficiente se observa en las trazas del laboratorio.

La confianza queda acotada por las siguientes amenazas:

- El banco es un conjunto definido de problemas y el resultado depende de su composición. La medición describe ese banco y OpenCode 1.18.25, con el alcance del apartado II.2.4.

- Ambos ejecutores usan un solo modelo, `gpt-6.1-sol`; la sensibilidad con otro queda para una instancia posterior. La variante de Charles difiere de la definición original y conserva la denegación de `customize-opencode`; las adaptaciones constan en el Anexo III, D-41.

- El contraste con el ejecutor fuera del árbol repite el patrón y acota la explicación por su ubicación, pero conserva contenedor, arnés y modelo (Anexo VI, A.VI.8). Persiste la posibilidad de un efecto del laboratorio.

- Las decisiones posteriores al dato debilitan la fijación previa del diseño. Se informa la lectura fijada antes de medir junto con la principal y se registra cuándo cambia cada criterio (Anexo III, D-41).

- El banco contiene familias de ruta absoluta conocidas desde el 14/10/2026 y el manifiesto de aceptación reutiliza escenarios. El conjunto reservado de la medición final describe el ajuste a esos casos y se informa como lectura descriptiva obligatoria junto a la meta (apartado I.3.4).

- La instrucción de probar el efecto ejecutando OpenCode es una alternativa pendiente de comparación. Si alcanza la meta sin RIGE, el aporte se evalúa por el diagnóstico y el costo comparado; omitirla por cuota constituye la principal amenaza a la validez del criterio (apartado I.3.4).

- La búsqueda de incidencias por título produce subcobertura. La clasificación de incidencias y el conteo de mecanismos observados tienen un solo codificador. Los reportes constituyen un piso de ocurrencia de las dificultades clasificadas, con el desglose de A.VI.6; la prevalencia queda sin estimar.

- La respuesta humana al trabajo del agente queda fuera de la medición. El relevamiento organizacional depende de una informante y la confirmación del problema reformulado continúa pendiente, según II.6.2.

El estado del arte corresponde al 01/10/2026 y actualiza el relevamiento del 17/09/2026. El cambio de las herramientas puede alterar el encuadre; su revisión antes de la defensa se registra como condición de vigencia (Anexo VI, A.VI.4).

### II.6.4 · Trazabilidad de las afirmaciones del Capítulo I

| **Afirmación del Capítulo I** | **Dato que la sostiene** | **Instrumento que lo produjo** |
|---|---|---|
| El estado efectivo solo se conoce resolviendo en conjunto todas las entradas (I.1.1) | Entradas de configuración, reglas de combinación y reglas nativas verificadas sobre la versión 1.18.25 | Análisis del código fuente y ejecución de escenarios controlados (Anexo VI, A.VI.3) |
| La documentación describe un modelo incompleto del mecanismo (I.1.1) | Ocho fuentes documentadas frente a doce entradas del código; orden interno de `.opencode` omitido; `deny` documentado para `.env` frente a `ask` aplicado. `permissions.mdx` explicita la última coincidencia | Análisis del código fuente y lectura de la documentación del tag (Anexo VI, A.VI.3) |
| El comportamiento efectivo incorpora elementos ajenos a los archivos del usuario (I.1.1, I.6.1) | Valores implícitos y reglas nativas incorporados por OpenCode | Análisis del código fuente y ejecución de escenarios controlados (Anexo VI, A.VI.3) |
| El agente puede operar con permisos distintos de los que el desarrollador supone (I.1.3, I.3.1) | Exposición o bloqueo en los problemas de la Tabla 14; tres antecedentes públicos de ruta absoluta[^2] | Medición de la línea de base[^1] y búsqueda documental complementaria (Anexo VI, A.VI.6) |
| La dificultad se presenta en la práctica de un equipo identificado (I.1.2) | Cambio sin efecto advertido tarde, según el punto 1.4 de la constancia; episodios y prácticas relatados, con el alcance de II.3.3 | Entrevista semiestructurada a la referente (Anexo VI, A.VI.5) |
| El equipo relevado adopta estas herramientas para sostener su capacidad de entrega sin ampliar la dotación (I.1.3 c) | Motivo declarado y jerarquizado por la referente sobre su equipo de cinco integrantes, con incorporación a comienzos de 2026 | Entrevista semiestructurada del 29/08/2026 (Anexo VI, A.VI.5) |
| El consumidor de la información de configuración incluye agentes (I.6.2, I.6.5) | Uso declarado de un agente de permisos elevados para consultar el propio entorno, con consumo de tokens | Entrevista semiestructurada del 24/09/2026 (Anexo VI, A.VI.5) |
| El diferencial combina decisión y procedencia por declaración (I.1.3 b) | Las soluciones sobre OpenCode omiten esa combinación; Amp y Codex evalúan acciones sin archivo ni posición de la regla | Contraste de soluciones del apartado II.3.4 (Anexo VI, A.VI.4) |
| La dificultad trasciende a OpenCode (I.1.3) | Propuesta individual que describe la carencia de procedencia y enlaza siete incidencias, abierta y sin respuesta del equipo de mantenimiento al 01/10/2026 | Fuente secundaria: Winning (2026), incidencia n.º 26255 |
| Crece la actividad atribuida a agentes en los repositorios observados (I.1.1) | Serie mensual de commits coautorados, desde valores próximos a cero a comienzos de 2025 hasta más de 40 000 en marzo de 2026[^3] | Minería de repositorios públicos: Galster, Mohsenimofidi, Böhme et al. (2026) |
| El procedimiento delegado termina con éxito declarado falso en parte de los problemas con mecanismo silencioso (I.3.1, I.3.2) | Cinco de 33 problemas de E2, con los dos ejecutores[^1] | Medición con agentes de la línea de base (apartado II.2.1; Anexo VI, A.VI.8) |
| La introspección muestra la regla sin comprobar su efecto (I.3.1) | `opencode debug` presenta la regla agregada sin evaluar si coincide con la acción | Relevamiento técnico (Anexo VI, A.VI.3) |
| La verificación declarativa resulta insuficiente (I.3.2) | Precede a todos los éxitos declarados falsos; conteos y denominadores completos en I.3.2[^1] | Clasificación por traza (Anexo VI, A.VI.8) |
| Los éxitos declarados falsos no cuestan más que los cambios correctos (I.3.1) | El costo no delata el error; medianas en USD y límite de la comparación en I.3.1[^1] | Análisis de costo (Anexo VI, A.VI.8) |
| Repetir el pedido en sesiones nuevas tiende a reproducir la falla en los problemas seleccionados (I.3.1) | Persistencia en sesiones nuevas con el mismo pedido, en los problemas seleccionados y con tres repeticiones por problema[^1] | Corrección mecánica y revisión de archivos finales (Anexo VI, A.VI.8) |
| El equipo delega las correcciones y los cambios de configuración (I.1.2, I.3.2) | Declaración del punto 2.2 de la constancia de entrevistas, versión 2, firmada el 15/10/2026 | Entrevista del 24/09/2026 (Anexo VI, A.VI.5) |
| Charles es el agente de configuración del equipo (I.3.2) | Definición entregada por la referente el 13/10/2026, que respalda lo declarado en el punto 2.9 de la constancia | Lectura del artefacto recibido y entrevista, sintetizadas en II.3.3; adaptaciones de la variante medida en el Anexo III, D-41 |

*Tabla 19. Correspondencia entre las afirmaciones del Capítulo I, el dato que las sostiene y el instrumento que lo produjo. Fuente: elaboración propia.*

[^1]: El autor produce los datos con el arnés el 20 y el 21/10/2026 sobre 46 problemas admitidos por reproducción nativa, con `build` y una variante de Charles, ambos con `gpt-6.1-sol`, y tres repeticiones por problema. El proceso se clasifica por traza sobre 138 ejecuciones por ejecutor; la detección comprende once defectos con tres repeticiones por ejecutor. La línea de base consta en I.3.2; los informes y el documento de lectura figuran en el registro de evidencia del Anexo VI, A.VI.11.

[^2]: El autor realiza la búsqueda y clasificación por título con un codificador sobre el historial público de OpenCode. Las 31 incidencias abarcan del 28/11/2025 al 16/09/2026; se consultan el 17/09/2026 y se revisan el 09/10/2026. La búsqueda complementaria del 19/10/2026 agrega lectura de los reportes e identifica tres antecedentes publicados entre el 06/08/2026 y el 09/09/2026 (Anexo VI, A.VI.6).

[^3]: El equipo académico de Galster, Mohsenimofidi, Böhme et al. (2026) obtiene la serie mediante minería de repositorios públicos de GitHub y atribución heurística de commits. El universo contiene 4 738 repositorios con artefactos de configuración en la captura de marzo de 2026; la serie abarca comienzos de 2025 a marzo de 2026. El conteo comprende los commits con atribución identificable, con el alcance de I.1.1.
