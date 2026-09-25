# Análisis integral del informe · 25/09/2026

Revisión del ingeniero sobre el Resumen, los Capítulos I a V, el catálogo (`03-requisitos/libro/`), los anexos y la bibliografía, contra la Guía AE1, la Guía AE2 y la plantilla AE2. El Capítulo X no existe todavía (U-02); se incluyen los requisitos que ya le imponen los demás capítulos.

**Alcance acordado con el autor:** la ausencia de la línea de base (valores IB-1 a IB-4, Tablas 4 y 14, síntesis del gradiente) no se computa como hallazgo.

**Convenciones.** Cada hallazgo tiene un ID para usar con `/corregir`. Severidad: **B** bloqueante para el 01/10 · **I** importante · **M** menor. Se marca «ya registrado» cuando coincide con `00-gestion/pendientes.md`, para no duplicar. Tipo de afirmación: salvo indicación, cada hallazgo es **dato del repositorio** con su ruta; las valoraciones de ingeniería se señalan como **criterio** y las hipótesis como **suposición**.

---

## 0. Hallazgos transversales (afectan a varios capítulos)

| ID | Sev. | Hallazgo | Evidencia | Propuesta |
|---|---|---|---|---|
| T-01 | **B** | **El acta de validación no existe y el informe la da por realizada.** III.4 declara «Ninguna exclusión permanece en estado pendiente» y nueve filas como «Validado · acta del [fecha]»; III.2.4 declara tres reglas «validadas con el referente»; III.5, seis requisitos con «acuerdos validados»; III.2.3, cardinalidades «validadas». No hay acta en `01-relevamiento/` y la guía fijaba la sesión antes del 25/09. | `informe/cap-03/III.4-limites-sistema.md` (Tabla 8 y cierre); `III.2`, `III.5`; `ls 01-relevamiento` | Hacer la sesión ya (el correo de conformidad se admite como constancia, Guía AE2 §2). Si no llega antes del 01/10, pasar las filas a «Pendiente» con instancia y fecha de resolución, como exige la regla de la cátedra. Afirmar «validado» sin acta es un dato inventado (regla de oro 1). Ya registrado en parte (U-04, A-05); lo nuevo es que el texto **afirma** la validación. |
| T-02 | **I** | **Restos de la valoración económica que el ADR-018 descartó.** I.3.1 sostiene a la vez «insume unas [H] horas anuales por desarrollador» y «el proyecto no produce una valoración monetaria […] la fracción de accesos no fue informada». I.4.3 expresa la contribución «en horas anuales según la valoración del apartado I.3.1»; II.1 (Tabla 11) da como motivo de la entrevista «obtener los parámetros de valoración»; el Hallazgo 6 de II.6.1 menciona la «valoración económica del apartado I.3.1». | `I.3`, `I.4`, `II.1`, `II.6`; ADR-018 | Eliminar [H] del componente 5 y reformular I.4.3, II.1 y II.6.1 en términos de IB-1/IB-2. Tal como está, el tribunal lo lee como contradicción interna, no como dato pendiente. |
| T-03 | **I** | **El AE1 promete una CLI más amplia que la comprometida.** I.5, I.6.2 (F6), I.6.4 (Tabla 9) y el Resumen dicen que la CLI expone F2 **y F4** («las mismas decisiones explicadas»); OE-2 exige la verificación «por ambas interfaces». El ADR-022, L-06 y la Tabla 21 excluyen las decisiones de permiso por CLI. | `I.2` (OE-2), `I.5`, `I.6`, `00-resumen.md`; `III.4`; `V.5` Tabla 21 | Propagar el ADR-022 al AE1 en la Ventana (se suma a A-01 y A-02). |
| T-04 | **I** | **OE-1 incluye relaciones y el alcance las difiere.** El indicador de OE-1 exige que «las relaciones coinciden con las definidas en cada escenario», pero F3/RF-13 son Could y quedan fuera del período (III.3, Tabla 7). Con el alcance actual, OE-1 no puede declararse cumplido. | `I.2` (Tabla 1); `III.3`; `RF-13.md` | Reformular OE-1 (relaciones como capacidad diferida) o subir una parte de RF-13. Recomiendo lo primero. |
| T-05 | **B** | **La «aplicación de escritorio» no tiene decisión, horas ni un requisito propio, y choca con otras decisiones.** Hay 10 h de interfaz en total (Tabla 18: 4 + 4 + 2). IV.1 fija la ejecución por terceros «mediante imagen de contenedor», incluido el v1 de la cátedra; IV.3 exige «instalación sin privilegios administrativos». Ningún RF enuncia la interfaz de escritorio. | `V.4` Tabla 18; `IV.1` (Canales); `IV.3` (Clientes); `03-requisitos/libro/catalogo/` | **Criterio:** una GUI de escritorio dentro de un contenedor, ejecutada en una máquina limpia ajena, es la ruta más probable de fallo de la condición material. Abrir con `/decidir` la tecnología de la interfaz (dentro de AD-06). Alternativa que recomiendo evaluar: una **interfaz web local** servida por el mismo binario en `localhost`. Cumple RNF-05 porque no hace conexiones salientes, corre igual en contenedor y en nativo, y sirve de «formulario y vista» para el v1. Si se adopta, hay que cambiar «aplicación de escritorio» por «interfaz local» en I.5, I.6, III.3 y V.5. |
| T-06 | **I** | **La medición de la línea de base no tiene horas ni fecha coherentes.** V.1 dice que su resultado está «disponible antes» de la iteración 2 (02/10). La reserva de V.4 (54 h) no tiene una línea para ejecutarla (sesiones, corrección, análisis). II.2.1 descarta las formas paralelas por el «recuerdo entre mediciones separadas por varios meses», pero entre ~01/10 y ≥15/11 hay unas seis semanas. | `V.1`, `V.4`, `II.2.1` | Presupuestar la medición, fijar su ventana real y revisar el argumento del recuerdo; el ADR-011 queda con una premisa debilitada. No computa como «falta línea de base»: es un problema de planificación. |
| T-07 | **I** | **Numeración de anexos que colisiona:** hay dos «Anexo I» con A.I.1 y A.I.2 distintos (fichas y matriz frente a instrumento y secuencias). La plantilla AE2 espera Anexo II = acta, III = decisiones, IV = evidencia de CI y V = glosario, pero el Anexo II actual es del AE1. Tampoco hay Anexo IV. | `informe/anexos/` | Ya registrado (M-02). Agrego que falta el **Anexo IV (evidencia de CI)**, que la plantilla pide para esta entrega. |
| T-08 | **I** | **Figuras reservadas sin contenido.** Figura 1 (diagrama de contexto, I.6.4), Figura 2 (incidencias por mes, II.4.1) y Figura 1 (modelo del dominio, III.2.3). Las dos primeras **no dependen de la línea de base**: los datos ya existen (32 incidencias con fecha en A.I.6). El modelo del dominio es la pieza visual central del III.2. | `I.6`, `II.4`, `III.2` | Producirlas antes del 01/10, por lo menos el modelo del dominio. |
| T-09 | **M** | **Remisiones cruzadas rotas:** «apartado II.3.4», que no existe (II.4.1 y II.6.1, H6); «Tabla 11 del informe de la AE1» por la Tabla 10 (III.1, fila de infraestructura, y III.4); «amenaza A2 de la Tabla 19» por la Tabla 17 (RF-05); RF-03 remite a «OE-2» cuando la CLI de valores es OE-1. | rutas citadas | Corregir. Son errores que el tribunal encuentra en segundos. |
| T-10 | **M** | **Bibliografía:** faltan Clegg y Barker (1994), Larman (2004) y Evans (2003), que se citan en III.2 y III.5. | `informe/bibliografia.md` | Agregar. M-03, M-04 y M-07 ya están registrados. |

---

## 1. Resumen

| ID | Sev. | Hallazgo | Propuesta |
|---|---|---|---|
| R-01 | M | Describe una «plataforma de escritorio» cuya CLI expone «las mismas consultas», lo que contradice el ADR-022 (T-03), y no refleja nada de la AE2. La Guía AE1 §5.1 pide actualizarlo en cada entrega. | Actualizarlo en la Ventana, cuando T-03 y T-05 estén resueltos. No es un objeto de la AE2. |

## 2. Capítulo I — Definición del proyecto

Lo más sólido del informe: la jerarquización causal de I.1.5, el diagnóstico de I.3.3 y la honestidad sobre los límites de I.3.1. Los problemas son de coherencia con decisiones posteriores, no de concepción.

| ID | Sev. | Hallazgo | Propuesta |
|---|---|---|---|
| I-01 | I | **Contexto y frecuencia débil (componente 4).** «Cinco veces por semana, de las cuales una fracción…» no fija nada, y omite lo que la propia entrevista dice: se trata de «consultas menores» y la frecuencia es **decreciente** (II.3.3). II.6.3 lo trata bien, pero el enunciado de I.3.1 lo esconde. | Incorporar a I.3.1 la tendencia decreciente y remitir a la lectura de II.6.3: «delegar no es verificar». Así el tribunal no lo descubre por su cuenta. |
| I-02 | I | **I.1.3 c), presión competitiva:** «Los equipos de desarrollo adoptan estas herramientas para sostener su capacidad de entrega frente a una demanda que crece más rápido que su dotación» generaliza sin fuente a partir de un único informante. La misma generalización aparece en la Tabla 19 de II.6.4. | Acotarla al equipo relevado o citar una fuente sectorial con las tres preguntas. |
| I-03 | I | **La existencia de agentes nativos se da por verificada, pero no lo está.** I.1.1 presenta como «verificado» que la herramienta incorpora elementos no declarados, e I.6.1 los incluye en el alcance. La matriz registra H-18 como «pendiente de verificación propia» (se hace en la iteración 2). | Alinear: o se verifica ahora (es barato y cierra un flanco del AE1), o I.1.1 distingue entre reglas nativas (verificadas) y agentes nativos (acreditados por la entrevista, con verificación en curso). |
| I-04 | I | **Parámetros de diseño que no son línea de base y siguen vacíos:** «[umbral]» del criterio principal (I.3.4), «[N]» de OE-1 a OE-3 (cantidad de escenarios, casos y defectos sembrados) y «[fecha]» de los plazos. El umbral debe fijarse **antes** de medir, con el mismo criterio que la Tabla 13 del IV.3. | Fijarlos ahora. La meta del objetivo general puede formularse desde ya como regla («igualar el valor de C-1 de la línea de base», según el criterio secundario), sin esperar los números. |
| I-05 | I | Figura 1 (diagrama de contexto) pendiente: T-08. | — |
| I-06 | I | Prototipo v0 sin validar ([herramienta], [N], [fecha], [enlace]) y entrevista sin canal, fecha ni duración. | Ya registrado (R-03, A-06). Lo subo de prioridad: la exigencia vi (persona, canal y motivo) se verifica sobre este contacto. |
| I-07 | M | T-02, T-03 y T-04 se corrigen en este capítulo. I.1.4 remite al «registro de riesgos del Capítulo VI», que todavía no existe: es aceptable como remisión, siempre que en el Sprint 3 el registro efectivamente lo incluya. | — |

## 3. Capítulo II — Relevamiento e investigación de mercado

| ID | Sev. | Hallazgo | Propuesta |
|---|---|---|---|
| II-01 | **I** | **Tres preguntas incompletas en fuentes que se citan con cifra.** La Tabla 12 conserva cuatro «[VERIFICAR…]»: el período de Galster, Lulla et al. (se cita «2 853 repositorios»), el período de Chatlatanagulchai et al. y la muestra y el período de Sayagh et al. La Guía AE1 §6.iv dice que una sola cifra sin sus tres respuestas basta para observar la dimensión 1. | Resolverlo con `/fuente` o con el verificador de fuentes. Relacionado con M-08, pero esto ya está **en el cuerpo del informe**. |
| II-02 | **B para X** | **Sector de los recursos vacío.** Los cinco parámetros de la Tabla 18 (II.5.5) están en «[ ]», incluido el **costo de hora de referencia**, que X.1 necesita con las tres preguntas. La fuente declarada es el Informe Grupal de Encuadre Común. | Traer los valores del informe grupal (con su coautoría) antes de redactar X.1. Sin ellos, el Capítulo X no puede cumplir la regla de las tres preguntas aplicada a costos (Guía AE2 §7.1). |
| II-03 | I | Figura 2 (incidencias por mes) pendiente, con los datos disponibles: T-08. | — |
| II-04 | M | El PESTEL no tiene factores Político ni Ecológico y no dice por qué. | Agregar una oración: «las dimensiones P y E no registran factores con implicancia decisoria». Está alineado con «se cuentan implicancias, no filas». |
| II-05 | M | La coincidencia entre el sector del problema y el de los recursos (II.5.1) está bien declarada. **Criterio:** es el punto que más sanciona la cátedra; preparar la respuesta oral («la separación es por propósito: II.5.1 acredita el problema, II.5.5 la factibilidad»). | — |
| II-06 | M | «Hallazgo 1…6» en II.6 frente a «HA-1…HA-6» y «H-01…H-21» en la matriz. | Ya registrado (A-03). |

## 4. Capítulo III — Entorno y dominio

Es el capítulo con más riesgo de observación en la dimensión 1 (trazabilidad), por T-01.

| ID | Sev. | Hallazgo | Propuesta |
|---|---|---|---|
| III-01 | **B** | T-01 (acta inexistente, pero afirmada). | — |
| III-02 | **I** | **Modelo del dominio con inconsistencias de modelado.** (a) «Regla de permiso: *Declaración* que produce una decisión, de carácter nativo o declarado», pero una regla nativa no es una declaración: no consta en ninguna entrada (I.6.3). (b) «Una declaración contiene *ninguna* o muchas sustituciones» y «una resolución produce *ninguno* o muchos hallazgos» se anotan «1 a N»; corresponde 0..N. (c) «Una declaración puede quedar desplazada por otra» se anota «1 a 1, opcional», pero la determinante desplaza a varias, así que es N a 1. (d) «Un agente puede invocar muchos subagentes» se anota 1 a N, pero un mismo subagente puede ser invocado por varios agentes: N a N. | Corregir la Tabla 4 y la definición de la Regla de permiso: separar el *origen* (nativa o declarada) de la entidad Declaración, por ejemplo con una Regla de permiso que referencia una Declaración de manera opcional. Hacerlo antes de dibujar la Figura 1 y antes de crear el esquema del v1. |
| III-03 | **I** | **¿Para qué persiste un analizador de solo lectura?** Resolución («resoluciones sucesivas») y RR-01 presuponen un almacén (ADR-023, todavía **propuesto**), pero la comparación entre estados está excluida (L-08). Hoy el único consumidor de lo persistido es el retorno del v1. **Criterio:** el tribunal lo va a preguntar. | Fundar el almacén en un uso del problema: la **constancia fechada de qué configuración regía en un momento dado**, que sirve para investigar una ejecución inesperada (nivel gerencial de la Tabla 5 del AE1: «a qué se atribuye una ejecución con comportamiento inesperado»). Decidir el ADR-023 (AD-03). |
| III-04 | I | Figura 1 (modelo del dominio) pendiente: T-08. | — |
| III-05 | I | **El elemento más determinante del entorno depende de un Should.** III.1 declara que el agente consumidor de la CLI es el elemento más determinante para la arquitectura y le exige un «esquema versionado con compromiso de compatibilidad». Ese esquema es RNF-08 (Should), mientras que el criterio de RF-03 (Must) exige «valida contra el esquema publicado». Además, I.6.5 excluyó la biblioteca de integración justamente porque «exigiría un compromiso de compatibilidad». | Subir a Must la parte mínima de RNF-08 (esquema publicado y versión declarada) o sacar la validación de esquema del criterio de RF-03. Preparar la distinción oral entre el esquema de salida de la CLI y la API de una biblioteca. |
| III-06 | **I** | **Priorización: 15 de 23 requisitos son Must (65 %).** La Guía AE2 §4.3 lee la columna de prioridad como indicador de madurez. **Criterio:** RF-05 (advertencia de versión), RF-08 (comando compuesto) y RF-10 (disponibilidad de la herramienta) son defendibles como Should: la propia cláusula de contingencia posterga RF-10 en el paso 4. | Revisar la prioridad de RF-10 y, si corresponde, la de RF-05. Si RF-10 pasa a Should, cambia el MVP (V.5, CU-03) y la Tabla 18, así que se decide con `/decidir`. |
| III-07 | I | **Criterios de aceptación sin magnitud:** RNF-02 («el conjunto de escenarios», sin tamaño), RF-07 (defectos sembrados «de cada tipo», sin cantidad), RNF-06 («[plataformas]») y RNF-07 («[N]», «[equipo]»). Con una sola plataforma declarada (IV.1: Ubuntu 26.04), el criterio de RNF-06, «equivalentes en cada plataforma declarada», queda vacío. | Poner cantidades. Para RNF-06: declarar dos plataformas o reformularlo (por ejemplo, «resuelve las rutas de Linux y declara no soportadas las demás»). RNF-06 y RNF-07 ya están registrados (A-04, AD-02); lo nuevo es RNF-02, RF-07 y que RNF-06 queda vacío. |
| III-08 | M | Categoría «Compatibilidad» (RNF-08) fuera de la lista de la cátedra. | Ya registrado (M-01). **Criterio:** reclasificar como Mantenibilidad, con nota a ISO/IEC 25010. |
| III-09 | M | **Trazas débiles en la matriz:** H-03 (fusión profunda) → RF-07 (hallazgos), cuando corresponde RF-01; HA-1 (mecanismo más extenso que lo documentado) → RF-05 (versión), cuando la traza natural de RF-05 es el cambio de reglas entre versiones (A.I.6, incidencia n.º 46873). La Tabla A.I.2 dice «no comprometidos salvo RF-12», pero RF-12 es Could y «Sin asignar». | Corregir las trazas y la tabla. |
| III-10 | M | RF-15, en el motivo de su prioridad: queda el texto «en este período.» cortado por la migración. | Corregir la ficha. |
| III-11 | M | III.4: la decisión L-09 aparece dos veces y falta L-08 (comparación entre estados). «Agrega cuatro» exclusiones, pero las nuevas son tres (la de las aprobaciones permanentes solo corrige el motivo). Hay una oración duplicada («se sometieron al referente en la sesión del [fecha]»). III.3 habla de «tres artefactos de la cadencia», cuando son cuatro (v1, v2, v3 y congelada). | Corregir. |
| III-12 | M | III.3 declara 20 h × 9 semanas = 153 h. | Ya registrado (AD-01). |
| III-13 | M | Glosario: RF-07 incorpora un sexto hallazgo («entrada descartada sin error visible») que no figura en la Tabla 8 del AE1 ni en el glosario. | Agregar la entrada al glosario (Anexo V). |

## 5. Capítulo IV — Modelo de negocios

Es el capítulo mejor resuelto de la AE2: el lienzo deriva explícitamente en las fuerzas («Deriva de:»), cambia dos decisiones y el flujo de valor tiene un criterio fijado antes de medir (Tabla 13). Los porcentajes de la Tabla 12 están verificados aritméticamente.

| ID | Sev. | Hallazgo | Propuesta |
|---|---|---|---|
| IV-01 | I | **Tensión entre canales y clientes:** la ejecución por contenedor (IV.1) contra «instalación sin privilegios administrativos» (IV.3). **Conocimiento general:** instalar un motor de contenedores suele requerir privilegios de administrador. | Se resuelve con T-05: declarar el contenedor como vía de *comprobación* y la instalación nativa sin privilegios como vía de *uso*. |
| IV-02 | I | «Validado» por el referente (L-05 y otras) en las exclusiones que se usan para explicar las 9 incidencias fuera de alcance. | Depende de T-01. |
| IV-03 | M | La fijación de Ubuntu 26.04 para RNF-06 no tiene ADR. | Ya registrado (AD-02). Ver además III-07: con una sola plataforma, RNF-06 queda vacío. |
| IV-04 | M | 153 h en la estructura de costos. | Ya registrado (AD-01). |
| IV-05 | M | **Criterio:** la primera «decisión modificada por el lienzo» (excluir otras herramientas) es una *confirmación*, no un cambio. La segunda (plataforma) sí es un cambio. | Aceptable, porque el ejemplo de la guía también confirma una exclusión. Conviene redactarlo como «confirma y además obliga a…». |

## 6. Capítulo V — Planificación

La aritmética es coherente: la Tabla 18 suma 34 + 51 + 34 + 17 = 136, la Tabla 19 suma 45 = 136 − 91, y la cadencia coincide con las semanas 8, 11, 13 y 14. Los problemas son de realismo y de coherencia con el resto.

| ID | Sev. | Hallazgo | Propuesta |
|---|---|---|---|
| V-01 | **B** | **La iteración 1 no es factible tal como está planificada.** Faltan seis días, `src/` está vacío, el stack no tiene ADR (AD-06), el almacén no tiene ADR (AD-03) y la interfaz no está decidida (T-05). Quedan 34 h. | Esta semana: decidir el stack, la interfaz y el almacén con `/decidir`, y **recortar el v1 al mínimo vertical** (una clave, tres entradas de archivo, persistencia y retorno), con una prueba de RF-01 en CI. Ya registrado (U-01); lo nuevo es la dependencia de T-05. |
| V-02 | I | **La interfaz está subestimada** (10 h en total para una GUI de escritorio): T-05. | — |
| V-03 | I | **La línea de base no está presupuestada**: T-06. | — |
| V-04 | I | **28 h semanales** frente a las 6 a 8 h de trabajo autónomo que supone la guía. El respaldo que se cita es el «Instrumento 24», que **no está en el repositorio**. **Criterio:** no se objeta la cifra (ADR-030), pero el tribunal va a pedir la evidencia. | Agregar el Instrumento 24 a `00-gestion/`, donde lo ubica la Guía AE2 §10.2, y registrar las horas reales en la bitácora desde ahora. Así, en noviembre, lo planificado se puede contrastar con lo ejecutado. |
| V-05 | M | V.3 invoca la «Guía rápida N.º 1» como respaldo de la autoría individual. | Ya registrado (R-02). |
| V-06 | M | V.5 conserva [enlace], [estado] y [fecha] del v1. | Ya registrado (G-01). |

## 7. Capítulo X — Recursos (a redactar)

Lo que los capítulos ya aprobados le imponen, y que conviene tener resuelto antes de `/redactar`:

1. **X.1, recursos humanos:** 190 h efectivas (136 técnicas y 54 de reserva), el mismo número que el V.4, como exige el recuadro de la plantilla. El costo de hora sale de II.5.5 (hoy vacío, II-02), con las tres preguntas y sin promediar universos.
2. **X.2, recursos físicos:** el equipo del autor y la máquina virtual Ubuntu 26.04 de comprobación (V.2) y del instrumento de medición (II.2.1). Declarar las especificaciones, porque RNF-07 necesita un «equipo de referencia».
3. **X.3, recursos financieros:** inversión monetaria nula, más el costo de oportunidad de las horas valorizado con X.1. No hay punto de equilibrio, porque no hay explotación (ADR-025); decirlo de manera expresa.
4. **X.4, recursos tecnológicos**, el apartado que la dimensión 5 lee con más atención: **depende de AD-06 y T-05**. Cada fila necesita licencia, versión, alternativa y criterio de descarte. Restricción ya comprometida: incorporar el evaluador de permisos de OpenCode (ADR-006, MIT) condiciona el lenguaje. **Suposición a verificar:** el evaluador está escrito en TypeScript, así que un stack en otro lenguaje obliga a portarlo y pierde la «coincidencia por construcción» que I.3.5 usa como mitigación principal. También van el motor del almacén (ADR-023), el CI y el analizador de dependencias de RNF-03.
5. **X.5, otros recursos:** la atribución MIT, la capacitación en el stack elegido y, de manera expresa, que **no hay migración de datos**, porque RIGE es de solo lectura. La plantilla dice que este rubro suele subestimarse; conviene decir por qué acá no aplica.

---

## 8. Orden recomendado para lo que queda hasta el 01/10

1. **Hoy o mañana:** la sesión de validación o el correo de conformidad (T-01, U-04). Si no se consigue, corregir III.4 a «Pendiente».
2. **`/decidir`:** stack, interfaz, almacén y CI (AD-06, T-05, AD-03). Sin eso no hay v1 (V-01).
3. **v1 mínimo en CI** y etiqueta (U-01).
4. **Capítulo X** con II-02 resuelto.
5. **Correcciones de la AE2** con `/corregir`: T-09, T-10, III-02, III-05, III-07, III-09 a III-13, AD-01 y M-01, y las figuras (T-08, por lo menos el modelo del dominio).
6. **Ventana de la AE1 (09/10 al 16/10):** T-02, T-03, T-04, I-01 a I-04, II-01, II-04 y R-01.

Los estados de `estado.md` no se modifican: las secciones afectadas vuelven a borrador cuando el autor aplique las correcciones.
