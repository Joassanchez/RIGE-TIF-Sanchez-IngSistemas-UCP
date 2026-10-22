# ADR-059 — Revisión del catálogo de requisitos y del modelo de casos de uso antes del diseño detallado

- Estado: aceptado (29/09/2026); consolidado el 22/10/2026 con ADR-064, 073 (absorbidos al final, con su texto completo). **Pendiente:** aceptación del autor de la consolidación
- Fecha: 29/09/2026
- Capítulos afectados: Cap. III (III.2 Tabla 5; III.3; III.4, fila de L-06; III.5 y Anexo I); Cap. V (V.1 Tabla 14; V.2; V.4 Tablas 18 y 19; V.5 Tablas 20 y 21); Cap. I del AE1 (I.2, OE-3; I.6.3, Tabla 8), por la Ventana; libro (catálogo, `trazabilidad.md`, `iteraciones.md`)
- Origen: sesión de diseño del 29/09/2026. Revisión crítica de los 23 requisitos y los 5 casos de uso, pedida por el autor para que las prioridades del período y la formulación heredada no condicionen el diseño más de lo necesario
- Relacionado: **modifica** el recuento de Must de ADR-056 (el resto de ADR-056 sigue vigente); **revisa en parte** la decisión L-06, validada con la referente el 26/09/2026; completa ADR-051 (CU-05 deja de ser un caso de uso, la interfaz no cambia); es condición previa de ADR-060 (contrato del adaptador y rastro)

### Contexto

Antes de diseñar el contrato entre núcleo y adaptador, el autor planteó la necesidad de revisar si los requisitos y los casos de uso son correctos, en lugar de tomarlos como dados. Algunos provienen de la formulación del AE1, y el proyecto se rehízo después.

La revisión separa dos problemas:

1. **Que el diseño quede atado a las prioridades del período.** Se resuelve sin tocar los requisitos: el diseño atiende el alcance del sistema (F1 a F6, otras herramientas mediante adaptadores) y el período compromete un subconjunto. Los límites se dividen así:
   - **Frontera del producto, que condiciona el diseño siempre:** L-01, L-03, L-04 y L-13.
   - **Alcance del período o de la verificación, que no lo condiciona:** L-02, L-05, L-06, L-10, L-11 y L-12.
   - ADR-058 ya aplica este criterio.
2. **Requisitos o casos de uso mal formulados, ambiguos, incompletos o faltantes.** Se corrigen en el catálogo, porque perjudican el diseño, la verificación y la defensa. Es el objeto de este registro.

Las características de calidad de un requisito se toman de IEEE 29148 (necesario, no ambiguo, verificable, singular, factible, consistente), el marco del proyecto.

Datos del repositorio que motivan la revisión:

- **CU-01, V.5 (Tabla 20):** CU-01 «Analizar un proyecto» se describe como paso que «precede» a CU-02.
- **CU-05, V.5:** el propio texto dice que CU-05 «expone la lógica de CU-01 a CU-03». Su contenido es un canal, no un objetivo.
- **CU-03 y RF-02:** CU-03 dice «ejecutar un comando»; RF-02 y OE-2 hablan de «una acción».
- **RF-01 y Tabla 5 (III.2):** el enunciado de RF-01 es «dado un agente y una clave», mientras que la Tabla 5 le asigna la resolución de modelos, comandos y servidores MCP, LSP y plugins. ADR-056 fija el OE-1 por agente y clave.
- **Tipos de hallazgo:** OE-3 (I.2) y la Tabla 8 (I.6.3) enumeran cinco; RF-07 y su criterio, seis, porque agregan las entradas descartadas sin error visible.
- **RF-05 y RF-08:** ADR-058 tuvo que interpretar sus criterios (resultados después de la advertencia; código de salida del comando compuesto).
- **RNF-03:** su criterio (análisis estático de dependencias y ausencia de identificación de la herramienta en el núcleo) prueba la independencia, no la generalidad.
- **I.6.1** presenta como eje del problema los agentes «que el usuario puede desconocer y que, sin embargo, ejecutan acciones en su entorno». Sin embargo, todos los requisitos de consulta parten de «dado un agente», y **L-06** excluye por línea de comandos los «listados de elementos, exportación del ecosistema completo y consulta inversa» (III.4).
- **I.6.4** declara que la web se sirve «sin aceptar conexiones de otros equipos», pero ningún requisito de Seguridad cubre la interfaz web. RNF-05 cubre solo las conexiones salientes.
- **ADR-032 y D-06 (Anexo III):** incorporan código de OpenCode bajo licencia MIT, cuyo aviso debe conservarse. Ningún requisito usa la categoría «Cumplimiento normativo» de la cátedra (`reglas-catedra.md`, §6).
- **RF-12 y RF-14 (Could):** abrir en el editor y exportar a un archivo.

### Alternativas evaluadas

Para cada punto se consideran dos alternativas: **mantener** la formulación vigente o **aplicar** el cambio propuesto. Donde hay una tercera, se indica.

**Casos de uso**
- **CU-A:** CU-01 pasa a ser un caso de nivel de subfunción, incluido por CU-02, CU-03, CU-04 y CU-05. RF-05 sigue siendo su extensión.
- **CU-B:** CU-02 se reformula como «Consultar el estado efectivo de un agente: todos sus valores o el de una clave, con procedencia, declaraciones desplazadas o condición de implícito».
- **CU-C:** CU-03 se reformula como «Consultar si un agente puede realizar una acción, …».
- **CU-D:** el CU-05 vigente («Obtener por línea de comandos…») se retira como caso de uso, y su número pasa al caso nuevo de CU-E. El agente externo se asocia a CU-02, CU-03, CU-04 y CU-05, y RF-03 pasa a ser un requisito transversal de interfaz, que se consigna junto a los RNF en la Tabla 20.
  - *Tercera alternativa:* conservar CU-05 y agregar al agente externo en los demás, lo que duplica objetivos.
- **CU-E:** se agrega **CU-05 · Explorar los agentes del proyecto**, declarados y nativos (desarrollador y agente externo). Reutiliza el número del caso retirado por decisión del autor (ver el análisis).

**Formulación de requisitos existentes**
- **R-1:** los criterios de aceptación de todo el catálogo se numeran (CA-1, CA-2, …) dentro del campo existente. Ningún requisito se divide.
- **R-2:** RF-01 pasa a decir: «Dado un agente, RIGE informa el valor efectivo de cada una de sus claves o de la clave solicitada, la declaración que lo determina con su entrada, archivo y posición, y las declaraciones desplazadas».
  - El criterio vigente se conserva como CA-1, y se agrega un CA-2 para la consulta de todas las claves.
  - La Tabla 5 se aclara: RF-01 compromete la resolución de los demás elementos en la medida en que integran el estado efectivo de un agente; su consulta independiente corresponde a RF-14 reformulado.
- **R-3:** OE-3 y la Tabla 8 se alinean con los seis tipos de RF-07, y la Tabla 8 incorpora la definición de «entrada descartada sin error visible».
- **R-4:** se precisan dos criterios:
  - RF-05: «… el sistema no presenta resultado alguno; por línea de comandos la salida estándar queda vacía, la advertencia se emite por el canal de error y el código de salida es distinto de 0»;
  - RF-08: «… el código de salida es 0 y la respuesta declara la ausencia de decisión con su motivo».
- **R-5:** al criterio de RNF-03 se agrega: «un adaptador de una herramienta ficticia, escrito únicamente contra el contrato del núcleo, se resuelve sin modificar el núcleo».

**Requisitos de valor cuestionable**
- **R-6:** RF-12 se reformula como «RIGE informa la localización de cada declaración en el formato ruta:línea:columna, con ruta absoluta, por ambas interfaces».
  - Prioridad **Should**, iteración 2, sin horas propias: se implementa en la serialización.
  - *Tercera alternativa:* retirar RF-12 y llevar el formato al criterio de RF-03.
- **R-7:** RF-14 se reformula como «RIGE informa por línea de comandos el estado resuelto completo de un proyecto: sus elementos, los valores efectivos con su procedencia y los hallazgos». Prioridad **Could**, sin cambios.

**Requisitos faltantes**
- **R-8 · RF-16 (nuevo), Must:**
  - Enunciado: «RIGE lista los agentes del proyecto, declarados por el usuario e incorporados por la herramienta, e identifica cada uno como tal, por ambas interfaces».
  - Criterio: «Dado un escenario con agentes declarados y agentes nativos, el sistema lista todos, identifica como nativo cada agente que la herramienta incorpora sin declaración, y el conjunto coincide con los agentes que reconoce OpenCode 1.18.25 [DATO PENDIENTE: comando nativo que lista los agentes en la versión 1.18.25, o escenario verificado si no existe]. La línea de comandos y la interfaz web informan el mismo conjunto».
  - Iteración 2.
  - Trazabilidad: I.6.1 e I.1.3 del informe de la AE1 [DATO PENDIENTE: hallazgo H-xx del relevamiento técnico que acredita los agentes nativos].
- **R-9 · RNF-09 (nuevo), Seguridad, Must:**
  - Enunciado: «La interfaz web local atiende únicamente solicitudes dirigidas a la dirección local del equipo y no permite que otro origen lea sus respuestas».
  - Criterio: «Una solicitud con cabecera Host distinta de 127.0.0.1:<puerto> o localhost:<puerto> se rechaza sin devolver datos; una solicitud con método distinto de GET se rechaza; ninguna respuesta incluye cabeceras que habiliten el acceso desde otro origen».
  - Iteración 1 (recomendada, porque la web existe desde el v1) o 2.
  - Trazabilidad: I.6.4; L-04.
- **R-10 · RNF-10 (nuevo), Cumplimiento normativo, Must:**
  - Enunciado: «RIGE conserva el aviso de copyright y la licencia MIT de OpenCode en el código que incorpora, y lo declara en su distribución».
  - Criterio: «Cada archivo incorporado conserva su aviso; la licencia y el archivo de avisos están presentes en la distribución; el resumen de cada archivo incorporado coincide con el registrado en su procedencia».
  - Iteración 2.
  - Trazabilidad: D-06 (Anexo III); ADR-032.
  - *Alternativa:* no crear el requisito y dejar la obligación como restricción en ADR-032.

**Puntos que quedan para verificar** (no se deciden aquí):
- **V-1:** si el criterio de RF-10 («el conjunto de herramientas que la herramienta ofrece en ejecución») exige una sesión con un modelo, es decir, red y costo, o si existe un oráculo local.
- **V-2:** si RF-07 («sustitución sin valor») cubre la advertencia que compromete I.6.4 cuando una variable relevante no está definida en el proceso de RIGE, o si queda un hueco.

### Análisis (trade-offs)

**CU-A y CU-D.**
- En Cockburn (2001), que V.5 cita, un caso de uso de nivel de objetivo del usuario es el que el actor persigue por sí mismo. «Analizar» no lo es: el actor analiza para consultar.
- CU-05 organiza por canal. Deja una decisión de interfaz (ADR-051) dentro del modelo de casos de uso y hace que el agente externo aparezca con un objetivo distinto del que tiene.
- Aplicar ambos cambios deja tres objetivos del usuario (CU-02, CU-03, CU-04), uno nuevo (CU-05) y una subfunción. Coinciden uno a uno con `aplicacion/casos-uso` de ADR-058.
- Costo: reescribir las Tablas 20 y 21 de V.5, y la afirmación de que «cinco casos satisfacen los catorce Must», que pasa a enunciarse con casos de uso más requisitos transversales.

**CU-B y R-2.**
- CU-05 y el criterio de RF-03 ya hablan de «los valores efectivos de un agente» en plural. RF-01 y CU-02, en cambio, hablan de una sola clave. La reformulación elimina esa inconsistencia sin cambiar el oráculo ni el criterio vigente.
- El diseño resuelve cualquier elemento en forma genérica (ADR-019), y el agente es la vista comprometida, que es donde existe oráculo (`opencode debug agent`, OE-1).

**CU-C.** Alinea el caso de uso con RF-02 y OE-2. Sin costo.

**Numeración del caso nuevo.**
- El ingeniero había propuesto no reutilizar el número retirado (CU-06 para el caso nuevo). El autor prefiere CU-05, para que la serie resulte continua para el lector (29/09/2026).
- La reutilización no confunde a ningún lector externo: el CU-05 vigente solo consta en secciones del AE2 en borrador (V.4 y V.5) y en ADR-052. No figura en la guía de validación que conoció la referente (`01-relevamiento/validacion/20260925_GuiaValidacion_Sanchez_v2.md`) ni en ninguna entrega generada en `05-entregas/`.
- **Riesgo a controlar:** V.4 (párrafo de lo que la contingencia no sacrifica) y ADR-052 mencionan «CU-05» con el sentido anterior. Al propagar, esas menciones se reescriben como RF-03; de lo contrario pasarían a designar el caso nuevo sin aviso.

**R-1.**
- Los criterios de RF-02, RF-03 y RF-07 verifican entre cinco y siete condiciones en un párrafo, lo que viola la singularidad. Si una prueba falla, no se sabe qué condición falló.
- Numerar dentro del campo conserva el formato de `reglas-catedra.md` §6 y el recuento de requisitos, y permite nombrar cada prueba por su criterio (`RF-02-CA3`).

**R-3.** Es una inconsistencia entre documentos. El criterio de RF-07 es el más reciente y el más específico (seis tipos, con la variable de entorno descartada como caso sembrado).

**R-4.** El criterio tiene que ser la fuente, no un ADR de diseño. La interpretación de ADR-058 protege el riesgo principal: un agente que ignora el canal de error no consume resultados inválidos.

**R-5.**
- El análisis estático prueba que el núcleo no depende del adaptador, pero no que su contrato sirva para otra herramienta. Esa es la pregunta que el tribunal puede hacer sobre la decisión arquitectónica central.
- Un adaptador ficticio en las pruebas es un escenario de modificabilidad ejecutable (ISO/IEC 25010, Mantenibilidad), de bajo costo, y reemplaza el ejercicio en papel que había considerado ADR-058.

**R-6.**
- La procedencia en el formato `ruta:línea:columna` la reconocen como enlace los editores y terminales de uso habitual (conocimiento general). Se obtiene el beneficio de RF-12 sin integrarse con ningún editor, que era la razón de su prioridad Could.
- Retirarlo (la tercera alternativa) pierde la trazabilidad a H-06.

**R-7.** La salida de la CLI redirigida a un archivo ya es una exportación. La reformulación convierte RF-14 en una consulta sobre la misma Resolución, que además provee los datos de RF-11 y, en el futuro, de RF-15. Revisa en parte L-06 («exportación del ecosistema completo»).

**R-8.**
- **Es el hallazgo de mayor peso.** Sin un listado, el agente externo tiene que conocer de antemano el nombre del agente a consultar, y los nativos son precisamente los que el usuario puede desconocer (I.6.1). La exclusión de L-06 contradice el problema declarado.
- El costo es marginal, porque la Resolución ya contiene todos los agentes.
- Se limita a agentes, no a todos los elementos, para acotar la revisión de L-06.
- Obliga a informar a la referente, porque revisa en parte una decisión validada.

**R-9.**
- Una página abierta en el navegador puede dirigir solicitudes al puerto local mediante DNS rebinding y leer las respuestas (conocimiento general). Eso incluye rutas, permisos y nombres de variables.
- Burla la frontera que I.6.4 declara, y la mitigación es de muy bajo costo (ADR-058, convención 6).
- Sin requisito, el control queda sin trazabilidad ni criterio.

**R-10.**
- Es una obligación legal ya asumida en ADR-032. Como requisito queda verificada y trazada, y usa una categoría de la cátedra que hoy está vacía.
- La alternativa (restricción sin requisito) es igual de válida en el fondo, pero no deja criterio de aceptación.

**Efecto en el recuento.**
- Si se aplican R-8, R-9 y R-10, el catálogo pasa de 14 Must sobre 23 requisitos a **17 Must sobre 26**.
- Cambia una cifra que citan ADR-051, ADR-052, ADR-056, III.3, III.5, V.1, V.2, V.5, X.1 y el Instrumento 34.
- El costo de propagación es real, pero es de redacción, no de fondo.
- Si el autor prefiere no mover el recuento de Must, R-9 y R-10 pueden entrar como **Should**. Se pierde la señal de que son obligatorios.

### Recomendación y fundamento

Aplicar **CU-A a CU-E y R-1 a R-10**, con RF-12 reformulado (R-6, no retirado), RNF-09 en la iteración 1 y RNF-10 como requisito.

Fundamento:
- corrige tres defectos de modelado (CU-01, CU-03, CU-05);
- corrige cuatro de formulación (R-1 a R-4) y uno de verificación (R-5);
- convierte dos Could de bajo valor en capacidades casi gratuitas y coherentes con la CLI (R-6, R-7);
- cubre tres faltantes, uno de ellos contradictorio con el problema declarado (R-8).

Ninguno de los cambios altera el oráculo, las reglas de negocio ni el modelo del dominio. Todos quedan comprobables en el período.

**Condición que invalidaría la recomendación:**
- Que la referente no convalide la revisión parcial de L-06. En ese caso, RF-16 y RF-14 reformulado se limitan a la interfaz web, y el agente externo sigue sin listado; eso queda consignado como limitación de la medición final.
- Que no exista en OpenCode 1.18.25 un medio local de obtener el conjunto de agentes. En ese caso, el criterio de RF-16 se verifica contra escenarios de composición conocida.
- Que la cátedra objete la eliminación de un caso de uso ya presentado en una entrega.

### Decisión del autor

**Aceptado por el autor el 29/09/2026, en su totalidad**, conforme a la recomendación:
- casos de uso CU-A a CU-E;
- R-1 a R-10, con RF-12 reformulado y no retirado, RNF-09 en la iteración 1 y RNF-10 como requisito Must.

Modificación del autor respecto de la propuesta: el caso nuevo toma el número **CU-05** y no CU-06, para que la serie resulte continua para el lector (ver «Numeración del caso nuevo» en el análisis).

### Consecuencias

**Si se acepta:**

- **Menciones al CU-05 anterior:** en V.4 (párrafo de lo que la contingencia no sacrifica) y en ADR-052 se reescriben como RF-03 antes de introducir el caso nuevo. En los demás ADR quedan como texto histórico, con esta aclaración.
- **Libro de trabajo** (lo propaga el ingeniero después de la aceptación):
  - fichas RF-01, RF-05, RF-08, RF-12, RF-14 y RNF-03 modificadas;
  - fichas nuevas RF-16, RNF-09 y RNF-10, con estado de validación «Pendiente»;
  - criterios numerados en las 26 fichas;
  - `trazabilidad.md`;
  - `iteraciones.md`: RF-16 y RF-12 en la iteración 2, RNF-09 en la 1, RNF-10 en la 2. **Las horas de la Tabla 18 las fija el autor.**
- **Informe** (con `/corregir`; cada sección vuelve a «borrador»):
  - III.2, Tabla 5, y III.3;
  - III.4, fila de L-06;
  - III.5 y Anexo I;
  - V.1, Tabla 14, y V.2;
  - V.4, Tablas 18 y 19;
  - V.5, Tablas 20 y 21, y el párrafo sobre la coincidencia entre casos de uso y Must.
  - I.2 (OE-3) e I.6.3 (Tabla 8), por la Ventana del AE1 (`00-gestion/ventana-ae1.md`).
- **Referente:** informar por la vía de PV-03 la revisión parcial de L-06 (listado de agentes y estado completo por línea de comandos) y los tres requisitos nuevos. RF-16, RNF-09 y RNF-10 quedan «Pendiente» hasta su convalidación.
- **ADR-056:** el recuento pasa a 17 Must sobre 26. Su decisión sobre el OE-1 y RF-10 sigue vigente.
- **ADR-058:** la convención 6 queda trazada a RNF-09, y la condición sobre la generalidad del contrato se verifica con el adaptador ficticio de R-5.
- **ADR-060** (contrato del adaptador y rastro) parte del modelo revisado:
  - resolución genérica de elementos y proyección por agente;
  - consultas de estado completo, de clave, de acción, de hallazgos y de agentes (CU-02 a CU-05).
- **Pendientes nuevos:** V-1 y V-2; datos pendientes de RF-16 (comando nativo y hallazgo de trazabilidad).

### Evidencia

- `03-requisitos/libro/catalogo/` (las 23 fichas; en particular RF-01, RF-02, RF-03, RF-05, RF-07, RF-08, RF-10, RF-12, RF-14 y RNF-03)
- `informe/cap-05/V.5-descripcion-producto-minimo-viable.md` (Tablas 20 y 21)
- `informe/cap-01/I.2-mision-vision-objetivos-proyecto.md` (Tabla 1, OE-1 a OE-3)
- `informe/cap-01/I.6-descripcion-detallada-sistema-informacion.md` (I.6.1, I.6.2, Tabla 8, Tabla 9, I.6.4)
- `informe/cap-03/III.2-dominio-sistema-informacion.md` (Tabla 5; III.2.4)
- `informe/cap-03/III.4-limites-sistema.md` (fila de L-06)
- `01-relevamiento/validacion/20260925_GuiaValidacion_Sanchez_v2.md` (L-06)
- `00-gestion/reglas-catedra.md` §6
- ADR-019, ADR-032, ADR-051, ADR-056, ADR-058
- Sesión de diseño del 29/09/2026

### Absorbido el 22/10/2026: ADR-064 — Horas de los requisitos incorporados por ADR-059: RNF-10 dentro de la incorporación del evaluador, RNF-09 con una hora en la iteración 1, RF-16 con tres horas en la iteración 2, financiadas con la estabilización

Texto completo del ADR absorbido, sin cambios salvo el nivel de los títulos. Su archivo se eliminó (queda en el historial de git).

- Estado: aceptado (29/09/2026)
- Fecha: 29/09/2026
- Capítulos afectados: Cap. V (V.1, orden de construcción; V.4, párrafo de capacidad, Tablas 18 y 19 y Figura 3); Cap. III (III.3, último párrafo); Cap. X (X.1); Instrumento 34; libro (`iteraciones.md`); `tools/figura_cronograma.py`
- Origen: sesión de diseño del 29/09/2026. ADR-059 incorporó tres requisitos Must (RF-16, RNF-09, RNF-10) y dejó sus horas a decisión del autor (AR-07)
- Relacionado: **modifica** ADR-052 en la distribución de horas por tarea y en la fila 7 de la Tabla 19. Se mantienen el presupuesto (190 h: 136 técnicas y 54 de reserva), la capacidad por días y la contingencia de un tercio. Sigue el precedente de D-38 (Anexo III)

#### Contexto

El plan de ADR-052 cierra con dos restricciones exactas:
- **Las 136 h técnicas se asignan completas** en la Tabla 18 (34, 57, 30 y 15 h). La reserva de 54 h no es margen de contingencia: está comprometida con entregables de fecha fija y con la línea de base (ADR-052, P-B y C-D).
- **La cláusula de contingencia absorbe 45 h** (un tercio), en siete órdenes de postergación. El último reduce la estabilización de 15 h a 5 h y libera 10 h.

ADR-059 agregó tres requisitos Must sin horas. La Tabla 18 ya contiene, en la iteración 2, la tarea «Incorporación del evaluador de permisos de OpenCode, con atribución» (10 h).

#### Alternativas evaluadas

**Estimación** (juicio del ingeniero, que el autor acepta):
- **RNF-10:** 0 h adicionales. Se incorpora a la tarea del evaluador, que ya incluye la atribución.
- **RNF-09:** +1 h sobre la tarea «Interfaz mínima de selección del proyecto y consulta» de la iteración 1 (4 h → 5 h).
- **RF-16:** +3 h, en una tarea nueva de la iteración 2.
- *Alternativa descartada:* absorber las tres sin horas.

**Financiamiento de las 4 h**
- **F-A:** tomarlas de la estabilización de la iteración 4 (15 h → 11 h) y reescribir la fila 7 de la Tabla 19 como «Estabilización, reducida de 11 h a 1 h», que libera las mismas 10 h.
- **F-B:** tomarlas de la estabilización y agregar a la Tabla 19 la postergación de la vista web del listado de agentes.
- **F-C:** tomarlas de la reserva documental.
- **F-D:** elevar el total técnico a 140 h.

#### Análisis (trade-offs)

**Estimación.**
- Absorber RNF-09 y RF-16 sin horas ajusta la estimación para que la cuenta cierre. Es el criterio que el proyecto ya descartó en D-38.
- RNF-10 sí está contenido en una tarea existente, cuyo enunciado nombra la atribución.
- RNF-09 son dos funciones que envuelven al servidor y tres pruebas (ADR-058, convención 6).
- RF-16 se apoya en la Resolución, que ya contiene los agentes. El trabajo es el subcomando, la vista web, la identificación de los nativos (condicionada a H-18) y las pruebas.

**Financiamiento.**
- **F-A** conserva el tope de 136 h y el tercio exacto de la contingencia. Sigue el precedente de D-38 (la iteración 2 tomó 2 h del margen de estabilización).
  - Costo: la estabilización baja a 11 h en el plan y, en el peor escenario de contingencia, a 1 h en lugar de 5 h.
  - Se sostiene porque la cuarta iteración no incorpora funcionalidad, y las acreditaciones de RNF-06 y RNF-07, que son Should, ya son lo primero que cae (Tabla 19, orden 1).
- **F-B** reduce menos la estabilización en el peor caso, pero agrega una postergación que deja un Must sin parte de su criterio (CA-3 de RF-16, coincidencia entre interfaces) y complica la cláusula.
- **F-C** contradice ADR-052, que separa la reserva de la contingencia.
- **F-D** declara horas que no existen.

**Capacidad por días** (V.4): con 35, 60, 30 y 11 h sobre capacidades de 28, 59, 33 y 16 h:
- la iteración 1 excede en 7 h (antes 6) y la 2 en 1 h;
- la holgura de la 3 y la 4 (3 y 5 h) compensa esas 8 h;
- el total sigue en 136 h, y el argumento de V.4 (el exceso de la primera pasa a la segunda por el criterio de corte) se mantiene.

#### Recomendación y fundamento

Estimación 0 + 1 + 3 y financiamiento **F-A**. Es la única combinación que no infla ni recorta estimaciones, conserva el presupuesto y la contingencia de un tercio sin tocar la reserva, y sigue un precedente ya aceptado.

**Condición que invalidaría la decisión:**
- Que la iteración 1 cierre con un desvío mayor que el declarado, de modo que la holgura de las iteraciones 3 y 4 no alcance.
- Que la verificación de H-18 resulte negativa y RF-16 se reduzca a los agentes declarados. En ese caso sobran horas y vuelven a la estabilización.

#### Decisión del autor

Aceptado por el autor el 29/09/2026, en la sesión de diseño, al confirmar la estimación (0 + 1 + 3 h) y la opción F-A.

#### Consecuencias

- **Tabla 18** (libro e informe):
  - iteración 1: «Interfaz mínima…» pasa a RF-01 y RNF-09, con 5 h; subtotal 35;
  - iteración 2: la tarea del evaluador cita RF-02 y RNF-10; se agrega «Listado de los agentes declarados y nativos, por ambas interfaces» con RF-16 y 3 h; subtotal 60;
  - iteración 4: 11 h;
  - total: 136.
- **Tabla 19:**
  - orden 1 agrega RF-12 a los Should sin horas;
  - orden 7: «Estabilización, reducida de 11 h a 1 h», 10 h, acumulado 45.
- **V.4:** el párrafo de capacidad pasa a 35, 60, 30 y 11 h, con exceso de 7 y 1 h y holgura de 3 y 5 h. El párrafo de Should dice seis e incluye RF-12. La Figura 3 se regenera.
- **V.1, orden de construcción:**
  - RNF-09 se construye con la interfaz del v1;
  - RNF-10, con la incorporación del evaluador;
  - RF-16, después de la verificación de H-18.
- **III.3:** se retira el marcador de horas pendientes.
- **X.1 e Instrumento 34:** «catorce» pasa a «diecisiete» requisitos Must. Las 136 h y el costo no cambian.
- **ADR-052:** nota de modificación.
- **Anexo III:** fila D-55.
- **`tools/figura_cronograma.py`:** datos de las tareas actualizados.

#### Evidencia

- ADR-052 (presupuesto, P-B, C-D, Tabla 19)
- ADR-059 (requisitos nuevos)
- ADR-058, convención 6
- Anexo III, D-38
- `03-requisitos/libro/iteraciones.md` (Tablas 18 y 19)
- `informe/cap-05/V.4-cronograma.md` (párrafo de capacidad por días)
- Sesión de diseño del 29/09/2026


### Absorbido el 22/10/2026: ADR-073 — RF-17 (conservación y recuperación de la resolución) y ajustes de criterio en RF-03, RF-04 y RF-10

Texto completo del ADR absorbido, sin cambios salvo el nivel de los títulos. Su archivo se eliminó (queda en el historial de git).

- Estado: aceptado (01/10/2026)
- Fecha: 01/10/2026
- Capítulos afectados: Cap. III (III.3 Tabla 7, III.5, Anexo I); Cap. V (V.1, V.5); libro (catálogo, trazabilidad, `iteraciones.md`); cierra en parte PV-05, PV-08 y AR-08 (V-1)
- Origen: análisis ingenieril de los RF pedido por el autor en el documento de correcciones (`documento_de_correcciones.md` (retirado; consta en el commit `dfaf300`), III.5), sesión del 01/10/2026

#### Contexto

El autor pidió revisar los RF desde la ingeniería: validez, completitud y la necesidad de requisitos nuevos. Se aplicaron las características de IEEE 29148 (necesario, singular, verificable, factible y trazable) sobre los 16 RF del catálogo (`03-requisitos/libro/catalogo/`). Surgieron cuatro hallazgos:

1. **Ningún RF exige conservar ni recuperar la resolución.** El caso vertical del v1 escribe la resolución en el almacén y la recupera (V.5, párrafo del v1), y la guía exige que el v1 vaya de la interfaz a la persistencia y de vuelta (`reglas-catedra.md`, §7). Sin embargo, la persistencia solo se traza a una restricción (RNF-01) y a una regla (RR-01). El almacén está diseñado (ADR-023 y ADR-061), pero ningún requisito lo justifica. Además, E-02 del acta (identificar sobre qué estado de las entradas se resolvió) no tiene criterio de aceptación (PV-05).
2. **RF-03:** E-01 del acta, que pide códigos de salida que distingan el error de la ausencia de resultado, no tiene criterio (PV-05). El CA-5 solo cubre el proyecto inexistente. El contrato ya está decidido en ADR-058 y ADR-069, e implementado en el incremento 0.
3. **RF-04:** el CA-1 menciona «los siete tipos declarados», pero el repositorio no los enumera (PV-08). El criterio no se puede verificar.
4. **RF-10:** el CA-3 compara con «el conjunto de herramientas que la herramienta ofrece en ejecución», lo que exige una sesión con un modelo. Eso no se puede reproducir y choca con RNF-05 (AR-08, V-1).

#### Alternativas evaluadas

**Eje P · Persistencia**
- **P-A:** Requisito funcional nuevo (RF-17), Must, iteración 1.
- **P-B:** Ampliar RNF-01 con la recuperación.
- **P-C:** Sin cambio; la persistencia se sostiene en ADR-061.

**Eje E · Pedidos E-01 y E-02 del acta**
- **E-A:** E-01 como CA-6 de RF-03 y E-02 como CA-2 de RF-17.
- **E-B:** Condiciones de diseño en el Cap. VI, como dice hoy III.1.

**Eje T · Tipos de entrada de RF-04**
- **T-A:** Enumerarlos en el criterio a partir del orden de aplicación verificado en ADR-060, punto 3.
- **T-B:** Remitir a una lista del glosario.

**Eje V · RF-10, CA-3**
- **V-A:** Verificar contra la lista de herramientas que el código del tag filtra por permisos, sin ejecutar un modelo.
- **V-B:** Eliminar el CA-3.

#### Análisis (trade-offs)

- **P-B** mezcla en un no funcional una capacidad y una restricción, y RNF-01 ya es una restricción validada. **P-C** deja sin trazar la estación de persistencia del v1, que es una pregunta probable del tribunal. **P-A** no suma horas, porque el almacén ya está planificado en la iteración 1 y diseñado en ADR-061 (retención de las últimas 20 resoluciones y tabla `entrada_leida`).
- **E-A** vuelve verificables dos pedidos de la referente con trabajo ya decidido. **E-B** los deja sin criterio comprobable en el catálogo de esta entrega.
- **T-A** deja el criterio autocontenido. **T-B** obliga a mantener la lista en dos lugares.
- **V-A** conserva la intención del criterio, que es comprobar el efecto real de la configuración sobre las herramientas ofrecidas, con un oráculo local. **V-B** pierde esa verificación.

#### Recomendación y fundamento

**P-A + E-A + T-A + V-A.**

**RF-17** (nuevo):
- **Enunciado:** «RIGE conserva cada resolución de un proyecto con su fecha y el resumen de las entradas leídas, y permite recuperarla».
- **Tipo y prioridad:** Funcional · Must.
- **Motivo de la prioridad:** sostiene la estación de persistencia del caso vertical del v1 y permite identificar sobre qué estado de las entradas se resolvió (E-02).
- **CA-1:** resuelto un proyecto del entorno controlado, la resolución queda guardada en el almacén propio con su fecha, y su recuperación devuelve los mismos valores, procedencias y declaraciones desplazadas que la consulta que la produjo.
- **CA-2:** cada resolución declara el resumen del conjunto de entradas leídas. Si cambia el contenido de una entrada, una nueva resolución del mismo proyecto declara un resumen distinto (E-02).
- **CA-3:** el almacén conserva las últimas 20 resoluciones de cada proyecto (ADR-061).
- **Trazabilidad:** acta del 26/09/2026, E-02; ADR-023; ADR-061; V.5 (caso vertical del v1).
- **Estado de validación:** Pendiente.
- **Iteración prevista:** 1.
- **¿Integra el MVP?:** Sí.

**RF-03, CA-6** (nuevo): «El código de salida distingue el resultado del error: 0 cuando la consulta se resuelve, aun sin resultado (agente sin la clave consultada, acción compuesta), con el motivo en la salida; 1 ante un error de uso o de configuración (`configuracion-invalida`, `puerto-ocupado`); 70 ante un error interno. Los errores se emiten por el canal de error» (E-01; ADR-058, ADR-069).

**RF-04, CA-1** (precisado): «Dado un escenario con entradas de los siete tipos (archivos globales, archivo indicado por `OPENCODE_CONFIG`, archivos del proyecto, archivos JSON de los directorios `.opencode` y de `OPENCODE_CONFIG_DIR`, Markdown de agentes, comandos y modos de esos directorios, `OPENCODE_CONFIG_CONTENT` y `OPENCODE_PERMISSION`), el sistema las lista todas, informa su orden de precedencia y distingue las que no son archivos». Las vías remotas y la administrada quedan fuera (III.4) y se declaran como no observadas (ADR-060). **Inferencia a confirmar por el autor:** la lista sale de ADR-060, punto 3, sin las tres vías que excluye III.4. No consta en el repositorio que los «siete tipos» originales sean exactamente estos.

**RF-10, CA-3** (reescrito): «Ambos resultados coinciden con la lista de herramientas que el código de OpenCode 1.18.25 ofrece al modelo para ese agente tras aplicar sus permisos, obtenida sin ejecutar un modelo».

**RF-05:** sin cambios. Se mantiene el rechazo de los resultados ante otra versión (L-05) y se prepara su argumento para la defensa. Su factibilidad depende de AR-06.

**Condiciones que invalidarían la decisión:**
1. **El tag no permite obtener sin un modelo la lista de herramientas ofrecidas.** Se aplica V-B.
2. **Los «siete tipos» originales eran otros.** Se corrige la enumeración de RF-04.

#### Decisión del autor

**Aceptado por el autor el 01/10/2026** (`/aceptar ADR-073`): P-A + E-A + T-A + V-A, con RF-05 sin cambios.

**Comentario del autor sobre los estados de validación:** precisar un criterio de aceptación no invalida un enunciado validado. RF-03, RF-04 y RF-10 conservan «Validado» y RF-07 vuelve a «Validado», porque la precisión de su CA-1 por ADR-060 no cambia su enunciado. Quedaban 20 de 27 validados.

**Actualización del autor (01/10/2026):** según informa el autor, la referente validó verbalmente los siete requisitos posteriores a la sesión (RF-12, RF-14, RF-16, RF-17, RNF-04, RNF-09 y RNF-10). Se registran en una extensión del acta (`01-relevamiento/validacion/20260925_GuiaValidacion_Sanchez_v2.md`), cuya fecha y firma completa el autor (U-04). Las 27 fichas quedan en «Validado».

**Registro de la validación (15/10/2026, ingeniero):** la extensión se hizo el 01/10/2026, en una conversación presencial sin registro escrito en la fecha, sobre el catálogo del commit `8343508`. La referente la firmó el 15/10/2026 en la constancia `01-relevamiento/validacion/20261015_ConstanciaEntrevistas_Sanchez_v1_firmada.pdf`, sección 3, que cubre además la relación «una declaración origina reglas de permiso» y las multiplicidades corregidas. El acta se restituyó a lo tratado el 26/09 y la extensión consta aparte. Esto responde a la pregunta 2 del Bloque A del dictamen DEV-AE2 14/2026.

#### Consecuencias

- **Recuentos:** 27 requisitos (17 funcionales y 10 no funcionales), con 18 Must, 6 Should, 2 Could y 1 Won't. El conjunto Must sigue coincidiendo con el MVP.
- **Libro:** ficha nueva `RF-17.md`; RF-03, RF-04 y RF-10 actualizados; `trazabilidad.md`; `iteraciones.md` (RF-17 en la iteración 1).
- **Informe:**
  - III.5: recuentos y párrafo de trazabilidad;
  - Anexo I: ficha de RF-17, criterios de RF-03, RF-04 y RF-10, y matriz;
  - III.3, Tabla 7: RF-17 junto a F2 o a la persistencia;
  - III.1: el cierre deja de remitir E-01 y E-02 al Cap. VI;
  - V.1 y V.5: RF-17 en el v1.
- **Pendientes:** PV-05 queda cerrado; PV-08 queda cerrado en lo que respecta a RF-04; AR-08 cierra V-1.
- **Estados de validación:** los 27 requisitos quedan «Validado» (acta del 26/09/2026 y su extensión; ver la actualización del autor).

#### Evidencia

- `03-requisitos/libro/catalogo/RF-03.md`, `RF-04.md`, `RF-10.md`; `informe/cap-05/V.5-descripcion-producto-minimo-viable.md`, línea 34.
- ADR-060, punto 3 (orden de aplicación en `opencode/src/config/config.ts:370-591`, tag v1.18.25).
- ADR-058, ADR-061, ADR-069; acta del 26/09/2026, E-01 y E-02.

