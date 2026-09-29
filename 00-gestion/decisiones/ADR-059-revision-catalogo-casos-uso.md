# ADR-059 — Revisión del catálogo de requisitos y del modelo de casos de uso antes del diseño detallado

- Estado: aceptado (29/09/2026)
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
