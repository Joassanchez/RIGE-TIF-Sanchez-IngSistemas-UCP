# Bitácora individual de proceso y decisiones

| Identificación | |
|---|---|
| Apellido y nombre | Sánchez, Joaquín Sebastián |
| DNI | 45.452.416 |
| Proyecto | RIGE: plataforma local para la resolución y explicación de la configuración efectiva y su procedencia en herramientas de programación basadas en agentes |
| Equipo e integrantes | Proyecto individual |
| Repositorio | [DATO PENDIENTE: URL del repositorio] |
| Período que cubre | AE2 · semanas 5 a 8 del Sprint 2 · del 7 de septiembre al 1.º de octubre de 2026 |

> Entrada más reciente arriba. Se escribe el día en que ocurre lo que se registra. `/cerrar` agrega aquí el borrador de la entrada del día; el autor lo revisa y lo aprueba.

## Alcance y criterio de registro

Registro el proceso y las decisiones correspondientes a las Actividades de Evaluación del Proyecto Final de Grado. Se trata de una bitácora individual y no compartida, conforme al apartado 8.2 de la guía de consignas.

Cada entrada se fecha y consigna los seis elementos que el apartado 8.2 establece: la decisión adoptada, las alternativas evaluadas con su criterio de descarte, la evidencia que la sostiene, el aporte personal con remisión al artefacto del repositorio, el desacuerdo producido y su resolución, y la herramienta auxiliar empleada con su alcance.

Sobre el quinto elemento. Conforme al apartado 2.3 de la guía, el Resumen y los Capítulos I y II se elaboran de manera individual y la deliberación colectiva del equipo se circunscribe al Informe Grupal de Encuadre Común. Por ese motivo las entradas registran ese elemento en una línea, salvo la jornada de la entrevista, donde se identificó una diferencia entre dos fuentes de datos y se deja constancia de su resolución.

Declaración general sobre herramientas auxiliares, conforme al Protocolo de Uso Autorizado. Durante la elaboración se empleó un asistente conversacional de inteligencia artificial con el siguiente alcance: contraste de razonamientos y detección de omisiones; procesamiento de la planilla de registro y verificación de cálculos; redacción y reorganización de texto sobre contenido propio; y comprobación de coherencia interna, referencias cruzadas y formato del documento.

Quedan fuera de ese alcance, y se realizan de manera propia, la delimitación del problema, el diseño de los instrumentos, la conducción de las sesiones de medición y de la entrevista, la ejecución de los experimentos, las decisiones metodológicas y de diseño, y la verificación de todo resultado antes de incorporarlo al informe. Cada entrada consigna si la jornada se ajusta a este criterio o si no se empleó herramienta auxiliar.

## Entradas de la AE2

### Entrada · Martes 29 de septiembre de 2026 (continuación) — Verificación del código de OpenCode, contrato del adaptador y método de programación

<!-- BORRADOR generado con /cerrar. Lo revisa y aprueba el autor. -->

1. **Decisión adoptada.**
   - **Verificación sobre el tag 1.18.25.** Hice verificar el código fuente de OpenCode sin ejecutarlo (pendiente AR-05). Resultados:
     - usa `jsonc-parser` y cuenta las columnas en unidades UTF-16;
     - identifica las variables de entorno que aportan configuración y su lugar en el orden de precedencia;
     - existe el comando nativo `opencode agent list`;
     - quedaron identificadas las estrategias de combinación y los agentes nativos que la herramienta invoca sin declaración.
   - **Contrato del adaptador y modelo del rastro (ADR-060, aceptado):**
     - el adaptador declara una secuencia ordenada de aplicaciones y aporta el evaluador de permisos, y el núcleo las ejecuta con estrategias intercambiables;
     - hay dos rastros, uno de valor y uno de decisión;
     - un valor tiene tres orígenes: declarado, implícito y nativo;
     - las posiciones se calculan sobre el texto original;
     - la medición es a pedido y sale por el canal de error;
     - cada resultado incluye un resumen de las entradas leídas (acuerdo E-02).
   - **Método de programación (ADR-065, aceptado):** un esquema mixto.
     - Las reglas de RIGE quedan en el repositorio (`src/AGENTS.md` y las pruebas).
     - Programo en OpenCode con gentle-ai, abierto en `src/`.
     - El diseño y la revisión se hacen en el sistema de agentes del TIF.
   - **Aceptación de ADR-058** y propagación al libro y al informe:
     - RNF-04 y RR-02 quedan acotados al contenido que incorpora una sustitución;
     - se precisaron RF-07 (CA-1) y RF-16 (CA-2).
     - RNF-04, RR-02 y RF-07 vuelven a «Pendiente» hasta informarlos a la referente.
   - **`src/AGENTS.md`:** lo reemplacé por el borrador que reúne ADR-058, ADR-060 y ADR-065.
2. **Alternativas evaluadas y criterio de descarte (recortes).**
   - **Contrato:**
     - se descartó un descriptor puramente declarativo, porque no expresa las derivaciones posteriores a la fusión que muestra el código;
     - se descartó que el adaptador resuelva y devuelva el rastro, porque vacía el núcleo y vuelve trivial la prueba del adaptador ficticio;
     - se descartó un rastro genérico único, porque oculta la posición efectiva de las reglas de permiso (RD-02 y RD-03).
   - **Medición y resumen:**
     - se descartó incluir la medición en la respuesta, porque rompe el determinismo de RF-03;
     - se excluyó del resumen de entradas el contenido de las variables de entorno, para no exponer secretos de baja entropía. El costo aceptado es que un cambio solo en el contenido de una variable no altera el resumen.
   - **Entradas remotas:** quedan fuera del análisis por RNF-05 y se declaran como no observadas.
   - **Método de programación:**
     - se descartó Gentle Shell, porque sumaba un tercer runtime sin ventaja demostrada sobre OpenCode con gentle-ai;
     - se descartó construir un flujo de programación propio en el sistema del TIF, porque reinventaba una disciplina genérica que ya existe curada.
   - **Diferido:** el modelo de datos (ADR-061), la distribución y las dependencias (ADR-062) y las pruebas metamórficas (ADR-063). La invocación del agente nativo `summary` se verifica en la iteración 2.
3. **Evidencia.**
   - Código fuente de OpenCode, tag `v1.18.25`, descargado de `codeload.github.com` con su resumen SHA-256 registrado en ADR-060.
   - `01-relevamiento/linea-base/laboratorio-verificacion.md`: aislamiento, E-12 y E-18.
   - Reglas RD-01 a RD-07 del libro; RNF-03; acuerdo E-02.
   - Documentación de gentle-ai y de Gentle Shell, consultada el 29/09/2026.
   - `00-gestion/revisiones/20260929_propagacion-ADR-058-060.md`.
4. **Aporte personal.**
   - Pedí la verificación sobre el tag antes de diseñar el contrato.
   - Acepté las recomendaciones D1 a D6 del ADR-060.
   - Planteé programar con gentle-ai y aporté que los estudios sobre OpenCode se habían hecho aislados de mi configuración, lo que corrigió una objeción del asistente.
   - Elegí el esquema mixto, acepté ADR-058, ADR-060 y ADR-065 y reemplacé `src/AGENTS.md`.
   - Artefactos:
     - ADR-058, ADR-060 y ADR-065;
     - `03-requisitos/libro/` (RNF-04, RR-02, RF-07, RF-16);
     - `informe/anexos/` (Anexos I y V), `informe/cap-03/III.5` y `informe/cap-05/V.5`;
     - `src/AGENTS.md`;
     - `04-diseno/README.md`.
5. **Desacuerdo y resolución.** Proyecto individual. Sin desacuerdo en la jornada.
6. **Herramientas auxiliares.** Asistencia conforme al criterio general declarado.
   - **Asistente de programación Claude Code (Anthropic).**
     - *Función:*
       - lectura y resumen del código fuente de OpenCode con remisión a archivo y línea;
       - propuesta y contraste de alternativas, y redacción de ADR-060 y ADR-065;
       - borrador de `src/AGENTS.md`;
       - actualización del Libro de trabajo;
       - propagación al informe mediante un subagente redactor, sobre una lista de cambios que aprobé.
     - *Artefactos:* los listados en el punto 4, más `00-gestion/`.
   - **OpenCode con gentle-ai:** en esta jornada no se usó para producir artefactos. Su uso para programar se declara a partir del primer incremento (ADR-065).

### Entrada · Martes 29 de septiembre de 2026 — Arquitectura de RIGE, revisión del catálogo y de los casos de uso, y horas de los requisitos nuevos

<!-- BORRADOR generado con /cerrar. Lo revisa y aprueba el autor. -->

1. **Decisión adoptada.**
   - **Arquitectura (ADR-058, propuesto).** Diseñé la arquitectura más allá del prototipo v1:
     - puertos y adaptadores, con un núcleo sin dependencias;
     - tres paquetes con instalación aislada: `nucleo`, `opencode` y `rige`;
     - la política propia de OpenCode (precedencia, fusión, permisos y plantillas de sus reglas) en el adaptador;
     - RNF-01, RNF-04 y RNF-05 garantizados por la forma de los puertos y por pruebas de arquitectura;
     - errores por categorías, con el principio de falla visible;
     - contrato de canales y códigos de salida de la línea de comandos.
     El ADR queda propuesto hasta que lo acepte.
   - **Revisión del catálogo y de los casos de uso (ADR-059, aceptado).** Antes de seguir diseñando revisé si los requisitos y los casos de uso eran correctos, para que las prioridades del período no condicionaran el diseño.
     - CU-01 pasa a ser una subfunción.
     - El CU-05 anterior se retira: era un canal, no un objetivo. Su número pasa al caso nuevo «Explorar los agentes del proyecto».
     - Se agregan RF-16 (listado de agentes, Must), RNF-09 (seguridad de la web local) y RNF-10 (conservación de la licencia).
     - RF-12 y RF-14 se reformulan.
     - Numeré los criterios de aceptación de todo el catálogo.
     - El catálogo pasa a 17 Must sobre 26 requisitos.
   - **Horas (ADR-064, aceptado).**
     - RNF-10 queda dentro de la tarea del evaluador; RNF-09 suma 1 h y RF-16 suma 3 h.
     - Las financio con la estabilización, que pasa de 15 h a 11 h.
     - Se conservan las 136 h técnicas y la contingencia de un tercio.
   - **Propagación.** Llevé los cambios al Libro de trabajo, a las secciones afectadas de los Caps. III, V y X, al Anexo I, al Instrumento 34 y al script de la Figura 3.
2. **Alternativas evaluadas y criterio de descarte (recortes).**
   - **Casos de uso: se descartó conservar el CU-05 anterior** como caso del agente externo. Duplicaba objetivos y metía una decisión de interfaz en el modelo de casos de uso.
   - **Casos de uso: se descartó numerar el caso nuevo como CU-06.** Preferí la serie continua para el lector. Verifiqué que el CU-05 anterior no había llegado a ningún lector externo.
   - **Recortes que se revierten:**
     - la exclusión de listados por línea de comandos (L-06) se revisa en parte, solo para los agentes, porque toda consulta parte de un agente determinado;
     - la exportación a un archivo y la apertura en el editor se reformulan como capacidades de la línea de comandos, sin integrarse con un editor.
   - **Recortes que se mantienen:**
     - la matriz y la consulta inversa (RF-15, Won't);
     - las relaciones (RF-13);
     - los listados de otros elementos.
   - **Arquitectura:**
     - se descartó un paquete único: la instalación aislada de Bun 1.3.14 hace fallar las dependencias no declaradas, lo que convierte RNF-03 en una propiedad de la estructura;
     - se descartaron las excepciones con un manejador global, porque convierten errores en valores plausibles, el riesgo principal del proyecto;
     - se descartó poner la política de permisos en el núcleo, porque contradice el texto de RNF-03.
   - **Horas:**
     - se descartó absorber los requisitos nuevos sin horas, porque ajusta la estimación para que la cuenta cierre (D-38);
     - se descartó usar la reserva documental, que está comprometida;
     - se descartó elevar el total, porque declara horas que no tengo.
   - **Diferido:** el contrato del adaptador, el modelo de datos, la distribución y las pruebas metamórficas quedan para ADR-060 a ADR-063.
3. **Evidencia.**
   - Criterios de aceptación del catálogo: RF-03, RF-04, RF-05, RF-07 y RNF-01 a RNF-04.
   - I.6.1, I.6.4 y Tabla 9 del informe de la AE1.
   - Tabla 20 de V.5.
   - Acuerdos E-01 y E-02 y fila de H-18 de la matriz de trazabilidad.
   - ADR-052 y D-38.
   - Documentación de Bun sobre instalación aislada, consultada el 29/09/2026.
   - Informes de propagación en `00-gestion/revisiones/20260929_propagacion-ADR-059*.md`.
4. **Aporte personal.**
   - Pedí revisar los requisitos y los casos de uso antes de diseñar, para que la formulación heredada no condicionara el diseño.
   - Decidí la numeración del caso nuevo como CU-05 y acepté la revisión completa.
   - Acepté la estimación de horas y su financiamiento.
   - Artefactos:
     - ADR-058, ADR-059 y ADR-064;
     - `03-requisitos/libro/`;
     - `informe/cap-03/`, `informe/cap-05/`, `informe/cap-10/X.1` y el Anexo I;
     - `instrumentos/instrumento-34-recursos.md`;
     - `tools/figura_cronograma.py`;
     - `00-gestion/anexo-III.md` (D-50 a D-55).
5. **Desacuerdo y resolución.** Proyecto individual. Sin desacuerdo en la jornada: la numeración del caso nuevo la resolví por preferencia del autor sobre la propuesta del asistente.
6. **Herramientas auxiliares.** Asistencia conforme al criterio general declarado.
   - **Asistente de programación Claude Code (Anthropic).**
     - *Función:*
       - propuesta y contraste de alternativas de arquitectura y redacción de ADR-058, ADR-059 y ADR-064;
       - revisión crítica del catálogo y de los casos de uso;
       - verificación de documentación externa (Bun);
       - actualización del Libro de trabajo por script, con recuentos verificados;
       - propagación al informe mediante subagentes redactores, sobre listas de cambios que aprobé;
       - actualización del script de la Figura 3.
     - *Artefactos:* los listados en el punto 4, más `00-gestion/`.

### Entrada · Lunes 28 de septiembre de 2026 (continuación) — Capítulo X, Instrumento 34 y entorno de medición

<!-- BORRADOR generado con /cerrar. Lo revisa y aprueba el autor. -->

1. **Decisión adoptada.**
   - **Capítulo X.** Diseñé el capítulo, lo hice redactar sobre el esquema que aprobé, pasó por cuatro revisores y apliqué las correcciones.
   - **Horas.** 190 h (136 técnicas y 54 de reserva), las mismas del Cap. V. Las 48 h de cierre se declaran aparte y se valorizan en X.3 como estimación.
   - **Costo de hora.** $21.565, derivado del salario promedio bruto del sector software a marzo de 2026 ($3.738.000; OPSSI, 2026) con un divisor de 173,33 h.
   - **Recursos financieros (ADR-048):**
     - el consumo de API de las dos mediciones con agentes tiene un tope de USD 50, con una carga de USD 20 para el piloto;
     - la estimación de orden de magnitud (unos USD 75) se presenta por separado y prevé aplicar la regla de recorte;
     - Claude Pro, que pago desde julio de 2026, se declara sin costo atribuible.
   - **Entorno Linux de referencia (ADR-049 y ADR-050).** Una imagen de contenedor común para el oráculo, la medición con agentes y RNF-07, con Docker Desktop sobre WSL 2.
   - **Repositorio.** Pasa a privado, con el docente como colaborador. Se publica bajo MIT tras la aprobación.
   - **Prueba de clonado.** La hace un compañero, en su equipo.
   - **Instrumento 34.** Completado como fuente única de la hoja «Recursos».
   - **Anexo III.** Completado con D-19 a D-49.
2. **Alternativas evaluadas y criterio de descarte (recortes).**
   - **Cifras del encuadre grupal, descartadas.** Los $2.290.000 y los $3.790.000 no figuran en el reporte del OPSSI que las respaldaría. Además, el encuadre ponderaba cifras de universos distintos, lo que la consigna prohíbe. Adopté una sola fuente, verificable.
   - **Parámetro de costo horario de la entrevista, excluido.** El Cap. I ya estableció que el costo de hora debe provenir de una fuente sectorial ajena a la organización consultada.
   - **Excluido del capítulo:**
     - la valoración monetaria del problema;
     - el retorno de la inversión;
     - las horas de la referente sumadas al presupuesto: figura como recurso externo, sin costo;
     - el punto de equilibrio: no hay explotación comercial;
     - la migración de datos: RIGE es de solo lectura.
   - **Costo de la suscripción del asistente, no atribuido.** Es un gasto personal preexistente; el criterio es el costo incremental.
   - **Entorno de medición:**
     - la distribución de desarrollo tal como estaba quedó descartada: el disco de Windows montado deja alcanzable la hoja de respuestas;
     - la distribución WSL dedicada, reemplazada: aísla por configuración y solo se reproduce en Windows;
     - la máquina virtual completa, descartada: corre sobre una capa adicional del hipervisor que sesga RNF-07;
     - el arranque dual, descartado: la instalación nativa en Ubuntu se acredita en la CI.
   - **Tope sin límite, descartado.** No dimensiona el recurso.
   - **Libro de trabajo en `instrumentos/`, descartado.** La consigna fija `03-requisitos/`. El libro se genera una sola vez, completo.
3. **Evidencia.**
   - `01-relevamiento/documentos/opssi2026-reporte-industria-software-1T2026.pdf`, pp. 17 y 25.
   - Especificaciones del equipo medidas el 28/09/2026 (PV-01).
   - Guía AE2, §2.3 (repositorio privado) y §7.
   - Revisión consolidada: revisión «cap-X» del 28/09/2026 (eliminada el 28/09/2026; en el historial de git).
   - Fuentes verificadas en `01-relevamiento/fuentes.md`: precios de Anthropic, términos de Docker Desktop y facturación de GitHub Actions.
4. **Aporte personal.**
   - Aporté el reporte del OPSSI y los datos de recursos: plan y fecha de Claude Pro, tope y carga de la API, y que la estimación de horas no supone el uso del asistente.
   - Decidí sobre cada alternativa y aprobé el esquema del capítulo.
   - Artefactos:
     - `informe/cap-10/`;
     - `instrumentos/instrumento-34-recursos.md`;
     - `00-gestion/anexo-III.md`;
     - ADR-048 a ADR-050;
     - `tools/exportar_libro.py`;
     - IV.1 y V.2.
5. **Desacuerdo y resolución.** Proyecto individual; en el Informe Grupal de Encuadre Común llevo al grupo la corrección de la descripción de RIGE y de las cifras del costo de hora (AD-27).
6. **Herramientas auxiliares.** Asistencia conforme al criterio general declarado.
   - **Asistente de programación Claude Code (Anthropic).**
     - *Función:*
       - contraste de alternativas y redacción de los ADR 048 a 050;
       - redacción del capítulo y de sus correcciones mediante un subagente redactor, sobre el esquema y las decisiones del autor;
       - revisión con cuatro subagentes revisores;
       - completado del Instrumento 34 y del Anexo III;
       - verificación de fuentes en la web;
       - medición de las especificaciones del equipo;
       - corrección y prueba del exportador del libro.
     - *Artefactos:* los listados en el punto 4, más `01-relevamiento/fuentes.md`, `informe/bibliografia.md` y `00-gestion/`.
   - [REVISAR POR EL AUTOR: el preámbulo excluye de la asistencia «el diseño de los instrumentos». En esta jornada el Instrumento 34 lo completó el asistente sobre las decisiones del autor. Declararlo aquí o ajustar el preámbulo (AD-24).]
   - Todo resultado lo verifiqué antes de incorporarlo al informe.

### Entrada · Lunes 28 de septiembre de 2026 — Pasada posterior a la validación con la referente y revisión crítica

<!-- BORRADOR generado con /cerrar. Lo revisa y aprueba el autor. -->

1. **Decisión adoptada.**
   - **Acta.** Registré el acta de la sesión del 26/09/2026 (presencial, 17:00, 35 minutos): 82 puntos confirmados sin observaciones. La constancia de conformidad sigue pendiente (U-04).
   - **Correcciones.** Apliqué las consecuencias de la sesión en seis fases: acta, Libro de trabajo, Cap. III con los Anexos I y V, Cap. IV, Cap. V e I.6.6.
   - **RNF-07.** Como la referente no dispuso del tamaño de su proyecto, adopté ADR-045: el proyecto de referencia tiene el doble del mayor entre un proyecto público y el del equipo de la referente, con medición por etapas en Ubuntu (con umbral) y en Windows 11 (informativa).
   - **Presupuesto.** Cerré el presupuesto en 136 h y la cláusula de contingencia en 45 h (ADR-046).
   - **Revisión crítica.** Después pasé una revisión crítica y una de consistencia. Adopté ADR-047: la vista web de permisos vuelve a la iteración 2 y la capacidad por iteración se calcula por días (28/59/33/16), con un exceso declarado de 6 h en la iteración 1.
   - **Otras decisiones:**
     - el lienzo no modificó decisiones y lo declaro así;
     - el costo de los tokens de las mediciones con agentes lo afronto yo, sin tope; el monto se registra al ejecutar la línea de base;
     - la CI corre en Ubuntu y en Windows (ADR-037).
2. **Alternativas evaluadas y criterio de descarte.**
   - **RNF-07.** Volver a preguntar a la referente y esperar su dato: descartado porque deja el requisito sin condición de medición hasta la iteración 1. En su lugar, un proyecto público verificable y el procedimiento de conteo para la referente (PV-03).
   - **Vista web de permisos.** Cerrar RF-02 y RF-03 en la iteración 3, o separar la paridad con la web de sus criterios: descartado porque modifica iteraciones y criterios que confirmó la referente.
   - **Reparto de horas por semanas nominales:** descartado porque no coincide con las fechas de las iteraciones.
3. **Evidencia.**
   - Acta: `01-relevamiento/validacion/20260925_GuiaValidacion_Sanchez_v2.md`.
   - Informes de la pasada: revisiones del 28/09/2026 (eliminadas en la limpieza del mismo día; en el historial de git).
   - ADR-045, ADR-046 y ADR-047.
   - Métodos de verificación del Anexo I del AE1: sostienen que cinco de las siete reglas de derivación se verificaron por ejecución.
   - Anexo VI: ocho incidencias en siete exclusiones.
4. **Aporte personal.**
   - Conduje la sesión con la referente, respondí los datos de la sesión y elegí entre las alternativas de cada ADR y de la revisión consolidada (P-01, P-15, P-16 y P-21).
   - Artefactos:
     - el Libro (`03-requisitos/libro/`);
     - la Figura 1 (`03-requisitos/modelo-dominio.mmd`);
     - la Figura 3 (`tools/figura_cronograma.py`);
     - los Caps. III, IV y V, I.6.6 y los Anexos I y V.
5. **Desacuerdo y resolución.** Proyecto individual; sin desacuerdo dentro del equipo. La revisión crítica objetó que la validación fue breve (82 puntos en 35 minutos, sin observaciones). Se registra como pregunta probable de la defensa.
6. **Herramientas auxiliares (AD-24).**
   - **Asistente de programación Claude Code (Anthropic):**
     - *Función:* contraste de razonamientos, redacción asistida de ADR, informes de revisión y secciones del informe sobre contenido y decisiones propias, verificación de cálculos y de fuentes.
     - *Artefactos:* los listados en el punto 4 y `00-gestion/`.
   - **Figura 1:** fuente Mermaid redactada con asistencia y exportada con `@mermaid-js/mermaid-cli`.
   - **Figura 3:** generada con matplotlib mediante un script propio del repositorio.
   - **Maqueta del prototipo v0:** HTML construido con asistentes generativos [DATO PENDIENTE: nombre de los asistentes usados en la maqueta (R-03)].
   - Todo resultado lo verifiqué antes de incorporarlo al informe.

### Entrada · Viernes 25 de septiembre de 2026 (continuación) — Papel de cada interfaz, decisiones pendientes y guía de la sesión de validación

<!-- BORRADOR generado con /cerrar. Lo revisa y aprueba el autor. -->

1. **Decisión adoptada.**
   - Decidí cerrar todas las decisiones y preparar la validación con la referente antes de corregir el informe y de construir el prototipo v1.
   - Fijé el papel de cada interfaz (ADR-042, alternativa B'):
     - la línea de comandos es la interfaz completa (valores, permisos y hallazgos) y se construye en la iteración 2;
     - la interfaz web queda limitada a formularios y vistas mínimas, y sobre ella se acredita el v1.
   - Acepté cuatro decisiones más:
     - el esquema publicado y versionado de la salida, con la explicación a pedido mediante `--explicar` (ADR-036);
     - las plataformas Ubuntu 26.04 y Windows 11, con instalación sin privilegios administrativos (ADR-037);
     - la remisión desde `04-diseno/` a las decisiones de arquitectura (ADR-043);
     - los valores de RNF-07: consulta por línea de comandos en menos de 2 s (ADR-044).
   - Preparé la guía v2 de la sesión de validación (Instrumento 31). Cubre entorno, límites, catálogo, modelo del dominio, reglas, vocabulario y el prototipo v0, cuya validación seguía pendiente.
2. **Alternativas evaluadas y criterio de descarte.**
   - Excluí ofrecer solo la línea de comandos durante todo el proyecto, aunque es la vía que usa el agente en la medición. Obligaba a reescribir objetivos aprobados en la AE1 («por ambas interfaces») y dejaba al desarrollador, único actor humano, sin la interfaz que representa el v0.
   - Excluí de la interfaz web la exploración libre, los filtros y la navegación entre elementos. El criterio fue no agregar funciones que la línea de comandos no tenga.
   - Pasé la pantalla web de permisos a la iteración 3 y saqué RF-10 de las horas por ser Should. El criterio fue no superar la capacidad de la iteración 2.
   - Descarté entregar la explicación en prosa siempre, porque suma tokens y el criterio de éxito exige que la mediana no aumente. También descarté no entregarla nunca por línea de comandos, porque dejaba sin explicación al desarrollador que trabaja en la terminal.
   - Dejé macOS sin acreditar y concentré la acreditación en Windows en una sola corrida de la iteración 4, para no esconder horas en un requisito Should. Descarté los contenedores Windows y macOS porque no son viables sobre Windows 11 Home.
   - Descarté mover los registros de decisión a `04-diseno/`, porque mezclaba decisiones de método con las de arquitectura y rompía la fuente única.
   - En RNF-07 descarté:
     - un umbral relativo al comando nativo, porque resuelve un solo agente y no es comparable;
     - la medición en el ejecutor de la CI, porque su rendimiento variable daría fallos que no provienen de RIGE.
   - Dejé fuera de la confirmación de la referente las ocho exclusiones técnicas de III.4, porque derivan de una imposibilidad técnica o de la frontera individual. Se le presentan solo para conocimiento.
3. **Evidencia que sostiene la decisión.**
   - Guía AE2: 10.2 (contenido de `/04-diseno`) y sección 14 (sesión de validación del modelo del dominio y del catálogo, y validar antes de redactar).
   - Guía de comprobación del v1, pasos 7 y 8.
   - Tablas 18 y 19 de V.4 (capacidad por iteración y contingencia).
   - Diseño de la medición con agentes (el agente solo dispone del comando de RIGE).
   - Criterio de tokens del resultado (AD-22).
   - `01-relevamiento/opencode-como-funciona.md` (escrituras de OpenCode al arrancar; directorio `state` en Windows).
   - Anexo I, A.I.3, resultados 12, 13 y 15 (verificaciones que el borrador del 22/09 daba por pendientes).
4. **Aporte personal.**
   - Definí el orden de trabajo.
   - Planteé y después descarté la opción de solo línea de comandos, y elegí la combinación de interfaz web limitada y línea de comandos amplia.
   - Decidí cada alternativa.
   - Aporté el borrador de decisiones de delimitación del 22/09 y la modalidad acordada con la referente: el autor decide y ella confirma o discute.
   - Informé que la maqueta del v0 no se había validado.

   Artefactos: ADR-036, 037 y 042 a 044; `04-diseno/README.md`; `01-relevamiento/validacion/` (v1 del 22/09 y v2 del 25/09).
5. **Desacuerdos y resolución.** Sin desacuerdos que registrar, conforme al criterio declarado en el preámbulo.
6. **Herramienta auxiliar y alcance.** Asistencia conforme al criterio general declarado, para el contraste de alternativas y la comprobación de coherencia entre ADR, informe y libro. [REVISAR POR EL AUTOR: en esta jornada el asistente también redactó el análisis de los ADR 036, 037 y 042 a 044, y la guía v2 del Instrumento 31 sobre el borrador propio y el contenido del libro de trabajo. El preámbulo declara que el diseño de los instrumentos y las decisiones de diseño se realizan de manera propia. Declarar aquí ese alcance concreto (herramienta, función y artefacto afectado) o ajustar el preámbulo; ver AD-24.]

### Entrada · Viernes 25 de septiembre de 2026 — Línea de base con agentes y prioridad de la línea de comandos

<!-- BORRADOR generado con /cerrar. Lo revisa y aprueba el autor. -->

1. **Decisión adoptada.** Reemplacé la medición de la línea de base con participantes por una medición con agentes de programación que ejecutan el procedimiento delegado de consulta de la configuración (ADR-040). Fijé como modelos Opus 5.5, que es el que usa el agente de la referente, Sonnet 5 y Haiku 4.5. Amplié el instrumento a dieciséis casos, cuatro por condición, con el caso como unidad de análisis, y fijé el criterio principal en ocho de los doce casos de C-2 a C-4. Incorporé a la línea de comandos la consulta de decisiones de permiso (ADR-041), y propuse adelantarla a la iteración 2 manteniendo la interfaz web mínima en el v1 (ADR-042, propuesto).
2. **Alternativas evaluadas y criterio de descarte.**
   - Excluí la medición con personas: el diseño pareado exige conseguir dos veces a los mismos participantes y la muestra no estaba asegurada.
   - Descarté la encuesta como línea de base porque el indicador principal mide errores silenciosos, que quien responde no puede declarar. La conservé como complemento, para estimar cuánto se practica la consulta delegada.
   - Excluí los modelos de otra familia (Qwen), para aislar el efecto de la capacidad del modelo; la validez fuera de Anthropic queda declarada como limitación.
   - Excluí la generación automática de variantes de casos: aportan cantidad pero no variedad de mecanismos.
   - Excluí dos criterios de construcción del diseño con personas, la equivalencia entre casos a y b y la no repetición entre casos, porque controlaban el aprendizaje humano, que un agente no tiene.
   - Descarté un v1 solo de línea de comandos, porque la guía de comprobación exige que la aplicación responda en una dirección y muestre el dato.
   - Descarté mantener RF-03 en la iteración 3, por su cercanía con la congelación y la medición final.
3. **Evidencia que sostiene la decisión.** Agente de permisos elevados declarado por la referente (Anexo I, A.I.5); motivo de prioridad de RF-03; guía del AE1, 3.3 (funciones de la línea de base); guía de comprobación del v1, pasos 7 y 8; laboratorio de verificación del 19/09/2026 (E-00, E-03, E-14, E-18); incidencias #36663, #36416 y #39715. Revisión del material: revisión «material-linea-base» del 25/09/2026 (eliminada el 28/09/2026; en el historial de git).
4. **Aporte personal.** Planteé el cambio de método por la dificultad de reunir participantes, solicité a la referente su agente, elegí la familia de modelos y el presupuesto, cuestioné la cantidad de casos y propuse priorizar la línea de comandos. Aporté el diseño v0.3, los escenarios y el laboratorio, que se reutilizan. Artefactos: `01-relevamiento/linea-base/`, ADR-040 a ADR-042, `01-relevamiento/linea-base/borrador-encuesta-practica.md`.
5. **Desacuerdos y resolución.** Sin desacuerdos que registrar, conforme al criterio declarado en el preámbulo.
6. **Herramienta auxiliar y alcance.** Asistencia conforme al criterio general declarado, para el contraste de alternativas y la revisión del material existente. [REVISAR POR EL AUTOR: en esta jornada el asistente también redactó el diseño de la medición, los ocho escenarios nuevos y la hoja de respuestas, y corrigió `caso.sh` y `verificar.sh`. El preámbulo declara que el diseño de los instrumentos se realiza de manera propia; declarar aquí ese alcance concreto (herramienta, función y artefacto afectado) o ajustar el preámbulo.]

<!-- [PENDIENTE A-07: pegar las entradas de la AE2, la más reciente arriba] -->

## Entradas de la AE1

<!-- [PENDIENTE A-07: pegar las entradas 2 en adelante de la bitácora del AE1 entregada] -->

### Entrada 1 · Jueves 20 de agosto de 2026 — Delimitación del problema y del alcance

1. **Decisión adoptada.** Definí el problema en torno a la configuración efectiva y su procedencia. Decidí que el alcance comprendiera el ecosistema completo.
2. **Alternativas evaluadas y criterio de descarte.** Consideré limitar el alcance a los agentes, por ser el componente de uso más frecuente. Lo descarté porque la cadena de precedencia se aplica a las cinco clases y esa reducción habría excluido casos que posteriormente confirmó el relevamiento, como una skill que queda desplazada por otra del mismo nombre. También consideré incorporar el historial de ejecuciones, pero lo postergué porque depende de un almacén interno sin interfaz publicada.
3. **Evidencia que sostiene la decisión.** La documentación oficial del producto y el propio entorno de trabajo, en el que el problema se presenta de manera recurrente.
4. **Aporte personal.** Redacté el enunciado del problema y la primera versión de la tabla de inclusiones y exclusiones del apartado I.6.4. Artefacto: `03-requisitos/` y `00-gestion/anexo-III.md` del repositorio.
5. **Desacuerdos y resolución.** Sin desacuerdos que registrar, conforme al criterio declarado en el preámbulo.
6. **Herramienta auxiliar y alcance.** Asistencia conforme al criterio general declarado, para contrastar la formulación del alcance.
