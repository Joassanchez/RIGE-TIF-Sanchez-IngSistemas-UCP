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
3. **Evidencia que sostiene la decisión.** Agente de permisos elevados declarado por la referente (Anexo I, A.I.5); motivo de prioridad de RF-03; guía del AE1, 3.3 (funciones de la línea de base); guía de comprobación del v1, pasos 7 y 8; laboratorio de verificación del 19/09/2026 (E-00, E-03, E-14, E-18); incidencias #36663, #36416 y #39715. Revisión del material: `00-gestion/revisiones/20260925-material-linea-base.md`.
4. **Aporte personal.** Planteé el cambio de método por la dificultad de reunir participantes, solicité a la referente su agente, elegí la familia de modelos y el presupuesto, cuestioné la cantidad de casos y propuse priorizar la línea de comandos. Aporté el diseño v0.3, los escenarios y el laboratorio, que se reutilizan. Artefactos: `01-relevamiento/linea-base/`, ADR-040 a ADR-042, `00-gestion/borrador-encuesta-practica.md`.
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
