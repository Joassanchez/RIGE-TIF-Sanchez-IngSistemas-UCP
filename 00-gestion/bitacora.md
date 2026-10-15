# Bitácora individual de proceso y decisiones

| Identificación | |
|---|---|
| Apellido y nombre | Sánchez, Joaquín Sebastián |
| DNI | 45.452.416 |
| Proyecto | RIGE: plataforma local para la resolución y explicación de la configuración efectiva y su procedencia en herramientas de programación basadas en agentes |
| Equipo e integrantes | Proyecto individual |
| Repositorio | <https://github.com/Joassanchez/RIGE-TIF-Sanchez-IngSistemas-UCP> |
| Período que cubre | AE2 · semanas 5 a 8 del Sprint 2 · del 7 de septiembre al 1.º de octubre de 2026 |

> Entrada más reciente arriba. Se escribe el día en que ocurre lo que se registra. `/cerrar` agrega aquí el borrador de la entrada del día; el autor lo revisa y lo aprueba.

## Alcance y criterio de registro

Registro el proceso y las decisiones correspondientes a las Actividades de Evaluación del Proyecto Final de Grado. Se trata de una bitácora individual y no compartida, conforme al apartado 8.2 de la guía de consignas.

Cada entrada se fecha y consigna los seis elementos que el apartado 8.2 establece: la decisión adoptada, las alternativas evaluadas con su criterio de descarte, la evidencia que la sostiene, el aporte personal con remisión al artefacto del repositorio, el desacuerdo producido y su resolución, y la herramienta auxiliar empleada con su alcance.

Sobre el quinto elemento. Conforme al apartado 2.3 de la guía, el Resumen y los Capítulos I y II se elaboran de manera individual y la deliberación colectiva del equipo se circunscribe al Informe Grupal de Encuadre Común. Por ese motivo las entradas registran ese elemento en una línea. Las objeciones que planteé a la herramienta y que modificaron una propuesta se consignan como aporte personal (elemento 4).

Declaración general sobre herramientas auxiliares, conforme al Protocolo de Uso Autorizado. Durante la elaboración empleé herramientas auxiliares como apoyo y ayuda con el siguiente alcance: contraste de razonamientos, detección de omisiones y propuesta de alternativas, siempre sobre contenido y decisiones propias; verificación de cálculos, de fuentes y del código de OpenCode; comprobación de coherencia interna, referencias cruzadas y formato; y, en el prototipo, apoyo en la codificación a partir de fichas de tarea, con revisión posterior.

Quedan fuera de ese alcance, y los realizo de manera propia, la delimitación del problema, la conducción de la entrevista y de la sesión de validación con la referente, la elección entre alternativas y la aceptación de cada decisión, la aprobación de los esquemas y del texto, y la verificación de todo resultado antes de incorporarlo al informe o a la rama principal. Cada entrada remite a esta declaración y consigna solo lo particular de la jornada.

**Herramientas por período**

| Período | Herramienta | Función | Artefactos afectados |
|---|---|---|---|
| AE1 | Asistente conversacional | Contraste de la formulación del alcance, procesamiento de la planilla de registro y verificación de cálculos | Informe del AE1 |
| 25/09 al 01/10 | Claude Code | Análisis y contraste de alternativas; apoyo en la estructuración de ADR, fichas y borradores de esta bitácora; verificación de fuentes y del código de OpenCode; orquestación de otras herramientas; creación del tablero con el conector de Trello | `00-gestion/`, `04-diseno/`, `README.md`, `tools/README.md`, `.github/workflows/ci.yml`, `src/AGENTS.md`, tablero |
| 25/09 al 30/09 | Subagentes de Claude Code | Apoyo y revisión de secciones del informe sobre esquemas y listas de cambios aprobadas; revisión de consigna, consistencia y fuentes | `informe/`, `03-requisitos/libro/`, `instrumentos/` |
| Hasta el 30/09 (T0-01 a T0-09) | OpenCode con gentle-ai | Propuesta del documento ODD; revisión e implementación; exploración | `src/` |
| Desde el 30/09 (T0-10) | Codex CLI (plan ChatGPT Plus), orquestado por Claude Code | Apoyo en la implementación con TDD y commits en la rama del incremento; revisión y crítica del código | `src/` |
| 01/10 | Codex como apoyo | Búsquedas web de solo lectura y apoyo en las correcciones de los Caps. IV, V y X sobre fichas | `informe/` |
| 28/09 | Claude Design | Elaboración del HTML de la maqueta del prototipo v0 | Maqueta del v0 |
| 09/10 al 13/10 | Claude Code | Búsquedas y verificación de fuentes, reclasificación de incidencias, verificación de OpenCode en contenedor; redacción de protocolo, encuesta, ADR-078, fichas y borradores de esta bitácora | `00-gestion/`, `01-relevamiento/linea-base/`, `.trabajo/fichas/v1/` |
| 09/10 | Codex CLI (`gpt-6.1-sol`), orquestado por Claude Code | Implementación de V1-12 | `src/`, `.github/workflows/ci.yml` |
| 13/10 | Codex CLI (`gpt-6.1-sol`), orquestado por Claude Code | Verificación de fuentes; apoyo en la corrección de I.1 e I.2 sobre fichas; crítica; construcción de los casos, el contenedor y el arnés de la medición | `informe/cap-01/`, `01-relevamiento/linea-base/` |
| 13/10 al 14/10 | Claude Code | Fase 0, ejecución y control de las tandas de la línea de base, revisión del arnés, ADR-082 y 083; adjudicación de las revisiones manuales por delegación del autor | `00-gestion/`, `01-relevamiento/linea-base/verificacion/` |
| 13/10 al 14/10 | Codex CLI (`gpt-6.1-sol`), orquestado por Claude Code | Arreglos del arnés (MED-5) y regla de corrección de ADR-083 | `01-relevamiento/linea-base/vm/`, `herramientas/` |
| 14/10 | Claude Code | Discusión del resultado de la línea de base; ADR-084 a ADR-086; verificación de las tareas de modificación contra el binario; armonización del diseño de la medición; ejecución y análisis de la línea de base de modificación | `00-gestion/`, `01-relevamiento/linea-base/` |
| 14/10 | Codex CLI (`gpt-6.1-sol`), orquestado por Claude Code | Arnés de la dimensión de modificación (MED-6) y corrección del detector de acceso web (MED-7) | `01-relevamiento/linea-base/vm/`, `herramientas/`, `modificacion/` |

Las menciones a registros de decisión consolidados el 28/09/2026 se acompañan del número vigente; la tabla de equivalencias está en `00-gestion/decisiones/INDICE.md`.

## Decisiones clave de la AE2

Síntesis de las decisiones registradas en las entradas, para su consulta rápida; el detalle está en la entrada de cada fecha.

| Fecha | Decisión | Registro | Recorte principal | Estado |
|---|---|---|---|---|
| 14/10 | Línea de base de modificación no válida por la validez previa; causa no instrumental verificada; informe descriptivo | ADR-086 | reinterpretar la validez; repetir con otra instrucción | vigente |
| 14/10 | Dimensión de modificación: una tarea por caso, corrección por el estado efectivo | ADR-085 | sin medición; medición solo exploratoria | vigente; sin criterio por ADR-086 |
| 14/10 | Objetivo general tras la rama P: OE-1 a OE-3 y no regresión en atribución | ADR-084 | objetivo descriptivo; criterio sobre la procedencia | vigente |
| 14/10 | Recorrección de la decisión de permiso escrita en texto libre; criterio estricto de fuente en C-3b y C-3d | ADR-083 (el criterio estricto, en ADR-087) | repetir la línea de base; criterio laxo | vigente |
| 13/10 | Línea de base con `gpt-6.1-sol` como único modelo, k = 3, sin piloto, dos tandas | ADR-082 | piloto 24 × 10; sustituir `gpt-6-luna` | vigente; P3 opcional |
| 09/10 | Línea de base sobre el procedimiento delegado: datos del AE1 como prueba informal; error principal y tokens secundario; skill nativa disponible; consulta al docente antes de medir | ADR-078 | medición con personas; medición mixta; datos del AE1 como piloto | vigente; fundamento corregido el 13/10; consulta al docente no realizada (14/10) |
| 01/10 | Medición con agentes sobre ChatGPT Plus, consumo en tokens, tarifas congeladas; costo de hora basado en la mediana junior de SysArmy | ADR-076 | tope de API; OpenCode Go y Claude Pro; salario promedio OPSSI | vigente; eje X modificado por ADR-077 |
| 01/10 | Diferencial: decisión de permiso con regla determinante y procedencia por declaración; RF-02 CA-8 | ADR-075 | diferencial en la explicación sola; inversión y otros modelos de sostenimiento | vigente |
| 01/10 | Guardas de arquitectura con analizador propio | ADR-070 | herramientas externas | vigente |
| 01/10 | Error del entorno detectado antes de operar con código 1 | ADR-069 | — | vigente |
| 01/10 | Cierre del incremento 0 y unión con `main` | fichas `inc0/` | subcomando `estado` en la CLI | cerrado |
| 30/09 | Codex como apoyo; el sistema de orquesta, revisa y critica; sin gentle-ai | ADR-067 | mantener gentle-ai; Claude Code como único apoyo; Copilot Student | vigente |
| 30/09 | Códigos de error estables; datos de ejecución fuera del repositorio | ADR-066 | — | vigente |
| 30/09 | Tablero kanban por iteraciones | tablero de Trello | columna «Hecho · Especificación»; simular fechas | vigente |
| 29/09 | Programación con OpenCode y gentle-ai en modo ODD | ADR-065 | SDD completo; herramientas propias; solo Claude Code | modificado por ADR-067 |
| 29/09 | Distribución con `bun run`, Bun 1.3.14 y TypeScript 7.0.2 | ADR-062 | Bun 1.4.2; Docker para desarrollar; ejecutable único | vigente |
| 29/09 | Modelo de datos de la Resolución | ADR-061 | caché por resumen E-02 | vigente |
| 29/09 | Contrato del adaptador y modelo del rastro | ADR-060 | descriptor declarativo; adaptador que resuelve | vigente |
| 29/09 | Horas de los requisitos nuevos financiadas con la estabilización | ADR-064 | elevar el total; usar la reserva documental | vigente |
| 29/09 | Revisión del catálogo y de los casos de uso | ADR-059 | conservar el CU-05 anterior | vigente |
| 29/09 | Arquitectura de puertos y adaptadores en tres paquetes | ADR-058 | paquete único; excepciones con manejador global | vigente |
| 28/09 | Entorno de referencia en contenedor | ADR-049 y 050 (hoy ADR-054); D-47 | WSL dedicada; máquina virtual; arranque dual | vigente |
| 28/09 | Recursos financieros: tope de API y costo de hora del OPSSI | ADR-048 (hoy ADR-057) | cifras del encuadre grupal | tope y costo reemplazados por ADR-076 |
| 28/09 | Planificación: 136 h técnicas y 54 de reserva, capacidad por días | ADR-046 y 047 (hoy ADR-052) | reparto por semanas nominales | vigente; ajustado por ADR-064 |
| 28/09 | Proyecto de referencia de RNF-07 | ADR-045 (hoy ADR-055) | esperar el dato de la referente | vigente; precisado por ADR-071 |
| 28/09 | Acta de la validación con la referente | acta del 26/09 | — | constancia pendiente (U-04) |
| 25/09 | RNF-07: consulta por CLI en menos de 2 s | ADR-044 (hoy ADR-055) | umbral relativo al comando nativo; medir en la CI | vigente |
| 25/09 | Plataformas Ubuntu 26.04 y Windows 11 sin privilegios | ADR-037 (hoy ADR-054) | macOS sin acreditar | vigente |
| 25/09 | CLI completa y web limitada; salida versionada con `--explicar` | ADR-036, 041 y 042 (hoy ADR-051) | solo CLI; exploración libre en la web | vigente |
| 25/09 | Línea de base con herramientas como ejecutores, dieciséis casos | ADR-040 (hoy ADR-053); D-41 | medición con personas; encuesta como línea de base | vigente; herramientas modificadas por ADR-076 |

## Entradas de la AE2

### Entrada · Miércoles 14 de octubre de 2026 (cuarta sesión) — Consecuencias de la rama P y línea de base de modificación

1. **Decisión adoptada.**
   - **Objetivo general (ADR-084, aceptado).** Con la rama P, ADR-079 dejaba la medición final sin criterio de cumplimiento. Decidí, después de conocer el resultado y declarándolo así, que el objetivo general se cumple con los indicadores de OE-1 a OE-3, fijados antes de medir, y con la no regresión del procedimiento delegado en el brazo indicado de `build`.
   - **Dimensión de modificación (ADR-085, aceptado).** La consecuencia 2 de I.3 (modificar un archivo sin efecto) figuraba desde el 24/09 pero nunca se había observado. Decidí medirla con una tarea por cada uno de los 24 casos, corregida por el estado efectivo que informa OpenCode. Aprobé el criterio de colaterales acotado al agente objetivo (G2') y los enunciados, y cerré la hoja.
   - **Línea de base de modificación** (14/10, de 14:59 a 18:02). `build` y Charles con `gpt-6.1-sol`, k = 3. Fueron 72 + 72 ejecuciones; la de Charles se completó en dos tandas por un corte de cuota. Cada uno tuvo 64 correctas y 8 sin efecto. Las 16 fallas tienen la misma causa: una regla de permiso escrita con ruta absoluta, que OpenCode evalúa contra la ruta relativa. En las 16 el agente declaró éxito. No se observaron errores por precedencia.
   - **ADR-086 (aceptado).** C-1f, un control, falló 3 de 3 en los dos ejecutores, así que las dos mediciones no son válidas. Verifiqué con OpenCode que la causa no está en el instrumento. Decidí no repetir e informar el resultado en forma descriptiva. Corregí además, declarándolo, un falso positivo del detector de acceso web.
   - **Consulta al docente.** Decidí no hacerla.
   - **P3.** La aprobé, después de la modificación, sin cambiar el ejecutor principal sea cual fuere su resultado.
   - **Crítica de la línea de base.** Pedí una crítica de todo lo hecho (subagente `critico`). Pedí corregir la coherencia y preparar las decisiones que la crítica deja abiertas: ADR-087 (quién adjudica, criterio de C-3b y C-3d, prevalencia sobre ADR-084), ADR-088 (RIGE con la ruta relativa y detección de la regla con ruta absoluta) y ADR-089 (sondas de redacción y de ruta), los tres propuestos.
2. **Alternativas y criterio de descarte (recortes).**
   - **Objetivo descriptivo.** Lo descarté porque deja el proyecto sin criterio de éxito (reglas de la cátedra, §2).
   - **Criterio sobre la procedencia.** Lo descarté porque elige la métrica donde ya se había visto la falla.
   - **Reinterpretar la validez previa.** La descarté porque es cambiar una regla con los datos a la vista. Con cualquier lectura, `build` cae en rama P.
   - **Repetir con otra instrucción.** La descarté porque elimina el error encontrado.
   - **Fuera de esta sesión:** la propagación al informe (pendiente de mi readjudicación ciega, ADR-084, punto 4), P3 (la tarifa se registra después del 20/10) y la medición final.
3. **Evidencia.**
   - Verificación de las tareas: `01-relevamiento/linea-base/verificacion/20261014-tareas-modificacion/`.
   - Tandas: `verificacion/20261014-LB-mod-principal-sol/`, `-charles-sol/` y `-charles-b-sol/`.
   - Análisis y verificación con OpenCode de la causa: `verificacion/20261014-analisis-LB-mod/`.
   - Tareas y hoja: `01-relevamiento/linea-base/modificacion/`.
4. **Aporte personal.** Planteé la pregunta que originó la dimensión de modificación (si el agente no conoce la procedencia, ¿falla al modificar?). Elegí la alternativa en cada ADR, aprobé los enunciados, decidí no consultar al docente y acepté ADR-084 a ADR-086. Artefactos: ADR-084 a ADR-086, `01-relevamiento/linea-base/modificacion/` y `verificacion/`.
5. **Desacuerdo y resolución.** Proyecto individual; sin desacuerdos dentro del equipo. El ingeniero recomendó consultar al docente; decidí no hacerlo y asumí el riesgo.
6. **Herramienta auxiliar.** Conforme a la declaración por período. Particularidades:
   - **Claude Code (Opus 5.5):** orquestó la sesión y discutió las alternativas. Redactó ADR-084 a ADR-086, el diseño y las hojas de tareas, las fichas MED-6 y MED-7 y el borrador de esta entrada. Verificó las tareas y la causa de la invalidez contra el binario. Armonizó el diseño de la medición (versión 2.1). Ejecutó las tandas con mi credencial, a mi pedido, y las corrigió. Regeneró dos JSON de hojas (solo cambia el hash) y ajustó una aserción de prueba al cierre de la hoja.
   - **Codex CLI (`gpt-6.1-sol`), como escritor:** MED-6, el arnés de modificación, en cuatro ejecuciones: dos detenciones por omisiones de la ficha y una corrección de patrones de `edit` tras el ensayo. Consumo: 5,04 M tokens de entrada (4,68 M en caché) y 54 mil de salida. MED-7, el detector, en una ejecución: 0,36 M de entrada (0,29 M en caché) y 4 mil de salida.
   - **OpenCode 1.18.25 (ChatGPT Plus), como ejecutor medido:** 144 ejecuciones, con un equivalente de USD 9,41. La cuota se agotó a las 17:14 y se renovó antes de las 17:54.
   - **Subagente `critico` (Claude):** crítica de la línea de base, en solo lectura; la corrección de coherencia, el diseño 2.2, la planilla ciega versión 2 y ADR-087 a ADR-089 los redactó el ingeniero.
   - **Decisiones posteriores a la crítica.** Acepté ADR-087 con la alternativa J-D: un subagente de Claude, sin acceso a adjudicaciones previas, preclasificó a ciegas las 61 revisiones manuales, y yo reviso y firmo cada veredicto. También acepté ADR-088 y ADR-089.
   - **Redactor (subagente de Claude):** CA-9 de RF-02 y defecto sembrado de RF-07 en el libro y el Anexo I (ADR-088).
   - **Sondas y P3 (14/10, de 19:37 a 21:56).** Decidí correrlas hoy, con las sondas antes de P3. Pedí que la tarifa la registrara un verificador con Claude Sonnet. La sonda E perdió 19 pares por un corte de red, que se repitieron. El resultado de la sonda E: los agentes siguen escribiendo la ruta absoluta sin que la instrucción se la dé (7/12 y 6/12 sin efecto). La sonda R y P3 esperan mi adjudicación.
   - **Enmienda de ADR-087, eje E** (después de ver los datos y antes de firmar). Objeté el criterio estricto porque la pregunta de C-3b pide «qué regla», no si es nativa. Decidí que la fuente se exija en el nivel que pide la pregunta y que se aplique por igual a las tres planillas. El cambio perjudica la hipótesis del proyecto, y lo declaro.
   - **Adjudicación** (14/10). Pedí que la adjudicaran IAs a ciegas con el criterio enmendado, y acepté sus tres preclasificaciones sin cambios. Resultado: `build` en N (0 errores de 54), Charles en P (2 de 54, en C-4e) y P3 en N. Con preguntas bien leídas, los agentes resuelven la procedencia en estos casos, también con el modelo liviano. Lo que queda es el error al modificar. Abrí la discusión sobre cómo reformular el problema.
   - **Reformulación (ADR-090 a ADR-093, aceptados el 14/10).** Pedí una segunda crítica para salir del problema. Apliqué «Refuta» de IV.3 y reformulé el problema hacia la verificabilidad del efecto: declaraciones sin efecto y certificación falsa. Decidí medir de nuevo, con el agente dentro del proyecto y todo verificado con OpenCode (modificación y detección). Fijé el criterio de éxito antes de medir, con tokens −50 % como secundario provisorio y la rama de respaldo escrita de antemano. Si sumo una medición con personas lo decido después de medir. ADR-084 queda reemplazado.
   - **Codex CLI (`gpt-6.1-sol`), como escritor:** MED-8, el soporte de las sondas, en una ejecución: 3,51 M tokens de entrada (3,36 M en caché) y 25 mil de salida.

### Entrada · Martes 13 y miércoles 14 de octubre de 2026 (tercera sesión) — Medición de la línea de base

1. **Decisión adoptada.**
   - **Fase 0 con el proveedor real** (13/10, de 20:47 a 21:31; caso auxiliar `practica`). Verifiqué la autenticación de ChatGPT Plus dentro del contenedor y la extracción de la respuesta. En tokens, `input` excluye la caché; no se puede verificar si `output` incluye el razonamiento, porque la suscripción informa cero. Encontré que la versión 1.18.25 no ofrece `gpt-6-astra` ni `gpt-6-luna` con la suscripción. Aparecieron además tres fallas del arnés: el catálogo de modelos sin `gpt-6`, la alteración del escenario y el nombre del agente de Charles.
   - **ADR-082** (aceptado el 13/10). Fijé k = 3 antes de medir y suprimí el piloto. La línea de base queda en dos tandas, `build` y Charles, las dos con `gpt-6.1-sol`. Declaré perdido `gpt-6-astra` y dejé P3 (`build` con `gpt-5.6-luna`) como tanda opcional sujeta a mi aprobación. Congelé el catálogo de modelos del 13/10.
   - **Medición** (13/10). La primera tanda de `build` (21:32:20 a 21:36:32) se descartó por una falla del instrumento: OpenCode instalaba dependencias en la carpeta del ejecutor y alteraba su hash. Sus 7 ejecuciones no se conservaron. Decidí excluir de los hashes los archivos que genera OpenCode. Después corrieron completas las dos tandas: `build` + `gpt-6.1-sol` de 22:07:11 a 22:51:36 y Charles + `gpt-6.1-sol` de 22:52:07 a 23:49:15. Fueron 72 + 72 ejecuciones, sin incompletas, alteraciones, censuras ni reintentos.
   - **ADR-083** (aceptado el 14/10). La corrección automática marcaba incorrectas 54 ejecuciones de permiso porque la decisión venía dentro de una frase. Elegí recorregir la evidencia con una regla mecánica fijada antes de recorregir y aplicada por igual a las dos tandas. No cambian los valores esperados, las fuentes, los umbrales ni k.
   - **Adjudicación.** La delegué en el ingeniero: 61 adjudicaciones, cada una con su motivo. Confirmé el criterio estricto en C-3b y C-3d: la fuente tiene que identificar la regla como nativa.
   - **Resultado.** Las dos mediciones son válidas y caen en la rama P. `build` tiene 1 caso con problema (C-3b) y Charles, 3 (C-3b, C-3d, C-4e). IV.3 da «Reordena». No hubo ningún valor equivocado: todos los errores son de fuente. El equivalente es de USD 3,84 y 4,01.
2. **Alternativas y criterio de descarte (recortes).**
   - **Regla de k sobre el piloto (24 × 10).** La descarté porque costaba 240 ejecuciones de una cuota sin límite publicado.
   - **Sustituir `gpt-6-luna` por `gpt-5.6-luna` en Charles.** Lo descarté porque mezcla generaciones y exige una tarifa no congelada. Charles corre con el modelo principal, como cambio declarado de la variante.
   - **Repetir la línea de base por la falla de la corrección.** La descarté porque el defecto estaba en la corrección y no en las ejecuciones; quedó como condición de ADR-083.
   - **Criterio laxo en C-3b y C-3d.** Lo descarté porque la hoja, cerrada antes de medir, exige identificar la regla nativa. Declaro la sensibilidad: con ese criterio, `build` pasaría a la rama N.
   - **Fuera de esta sesión:** P3, la propagación al informe y la medición final.
3. **Evidencia.**
   - Fase 0: `01-relevamiento/linea-base/verificacion/20261013-fase0/`.
   - Tandas: `verificacion/20261013-LB-principal-sol/` y `verificacion/20261013-LB-charles-sol/`.
   - Corrección, adjudicaciones y análisis: `verificacion/20261014-analisis-LB/`.
   - Catálogo congelado: `catalogo-modelos-20261013.json`.
4. **Aporte personal.** Inicié la sesión de ChatGPT Plus y decidí:
   - k, la supresión del piloto, los modelos y el orden de las tandas;
   - la exclusión de los archivos generados del hash;
   - la recorrección (ADR-083) y el criterio estricto en C-3b y C-3d.

   Acepté ADR-082 y ADR-083. Artefactos: ADR-082, ADR-083 y `01-relevamiento/linea-base/`.
5. **Desacuerdo y resolución.** Proyecto individual; sin desacuerdos dentro del equipo.
6. **Herramienta auxiliar.** Conforme a la declaración por período. Particularidades:
   - **Claude Code (Opus 5.5):** orquestó la sesión, ejecutó la fase 0 y las tandas, revisó los cambios del arnés, redactó ADR-082 y ADR-083 y el borrador de esta entrada, y **adjudicó las 61 revisiones manuales por delegación expresa**; el criterio de C-3b y C-3d lo confirmé yo.
   - **Codex CLI (`gpt-6.1-sol`, esfuerzo alto), como escritor:** ficha MED-5 (catálogo congelado, preparación del participante, Charles y detención por cuota) y tres correcciones en la misma sesión (detección de la cuota, archivos generados en el hash y regla de ADR-083). Consumo acumulado: 3,90 M tokens de entrada (3,56 M en caché) y 46 mil de salida.
   - **OpenCode 1.18.25 (ChatGPT Plus), como ejecutor medido:** 144 ejecuciones válidas, más 7 descartadas y 6 de fase 0.
   - **Cuota compartida:** la ventana de 5 horas pasó del 7 % al 92 % y la semanal, del 13 % al 26 %.

### Entrada · Martes 13 de octubre de 2026 (segunda sesión) — Corrección de I.1 e I.2, criterio de la línea de base y preparación de la medición

1. **Decisión adoptada.**
   - **Caps. I y II.** Armé con el ingeniero el inventario de correcciones contra los ADR (`.trabajo/revisiones/20261013-cap01-02-inventario.md`) y aprobé las de I.1 e I.2. I.1 actualiza el estado del arte al 01/10/2026, separa lo verificado de lo pendiente, acota los episodios de la entrevista a demanda declarada y suma la cadencia de versiones de OpenCode. I.2 reenuncia el objetivo general por casos, sin cifras de línea de base, y alinea OE-1 a OE-4 con el catálogo y con la medición con agentes.
   - **Línea de base.** Revisé el diseño desde cero y acepté ADR-079: regla de ramas fijada antes de medir (error, costo, problema bajo el mínimo o sin problema), veinticuatro casos, dos brazos en la medición final con RIGE indicado como principal, clasificación de la fuente de la respuesta y el agente de la referente («Charles») como segundo ejecutor. Acepté ADR-080 (conjunto de aceptación de RIGE con manifiesto y causas de retiro) y ADR-081 (RF-02 CA-3: el subagente no hereda las restricciones del agente padre).
   - **Docente.** Decidí medir sin esperar la respuesta del docente.
2. **Alternativas y criterio de descarte (recortes).**
   - **Criterio de 8 de 12 con regla de techo.** Lo descarté porque se cumple sin reducir ningún error y deja sin lectura el resultado en que el agente acierta con un costo alto.
   - **Agente de la referente como ejecutor principal.** Lo descarté porque ata el resultado a un equipo que no es el ámbito de implantación y a skills que no recibí; queda como variante declarada.
   - **Conservar el CA-3 de RF-02.** Lo descarté porque la ejecución y el código de la versión 1.18.25 lo refutan.
   - **Fuera de esta sesión:** I.3 a I.6 y el Cap. II, el Resumen y el uso de IA (DV2-04).
3. **Evidencia.**
   - Verificación de los veinticuatro casos en el contenedor `rige-linea-base:1.18.25` (`01-relevamiento/linea-base/verificacion/`): doce casos de valor confirmados y doce de permiso ejecutados con un proveedor simulado local; C-3f contradijo el resultado 12 de A.VI.3.
   - Código del tag v1.18.25 (`01-relevamiento/evidencia/opencode-subagent-permissions_20261013.ts`).
   - Fuentes de Galster et al. verificadas (`01-relevamiento/fuentes.md`).
4. **Aporte personal.** Fijé el alcance de cada sección, acepté o rechacé cada propuesta, aporté el agente de la referente con su consentimiento y decidí los umbrales (X = 2, Y = 30 %), la indicación del brazo con RIGE, el empate en IV.3 y la valorización de `cache.write`. Artefactos: ADR-079 a ADR-081, `informe/cap-01/I.1` e `I.2`, `01-relevamiento/linea-base/`.
5. **Desacuerdo y resolución.** Proyecto individual; sin desacuerdos dentro del equipo. El ingeniero recomendó enviar la consulta al docente en paralelo; lo dejé registrado como pendiente opcional (LB-01).
6. **Herramienta auxiliar.** Conforme a la declaración por período. Particularidades: Claude Code orquestó la sesión, verificó resultados y redactó los ADR y el borrador de esta entrada; Codex CLI (`gpt-6.1-sol`) actuó como verificador de fuentes, redactor de I.1 e I.2 sobre fichas, crítico (I.1, I.2 y ADR-079 a ADR-081) y escritor de los casos, el contenedor y el arnés de la medición (fichas `.trabajo/fichas/medicion/MED-1` a `MED-4b`). Consumo de Codex en la sesión: alrededor del 75 % de la ventana de 5 horas.

### Entrada · Martes 13 de octubre de 2026 — Dictamen de la AE2 en pendientes y corrección del fundamento de ADR-078

1. **Decisión adoptada.**
   - **Dictamen DEV-AE2 N.º 14/2026.** Cargué en `00-gestion/pendientes.md` las observaciones del dictamen como DV2-01 a DV2-14, con dimensión y severidad, y guardé el PDF en `catedra/originales/`.
   - **ADR-078.** Corregí su análisis: retiré el motivo de reclutar personas en O-A y O-C y dejé O-A fundado en la falta de registros, la entrevista con la referente y la reorientación del proyecto. La decisión no cambia.
   - **Bitácora.** Decidí que el cierre de cada sesión siga dejando la entrada del día en la bitácora.
2. **Alternativas y criterio de descarte (recortes).**
   - **ADR-078.** Descarté reabrir la decisión: el cambio afecta solo el fundamento, no la alternativa elegida.
   - **Bitácora.** Descarté suspender la entrada al cierre; registro el riesgo frente al apartado 11 del dictamen y reviso cada entrada antes de entregarla.
   - **Pendientes.** Eliminé AD-25 (tope de API), sin objeto desde ADR-076.
3. **Evidencia.**
   - Dictamen DEV-AE2 N.º 14/2026 (apartados 2, 7, 8, 11, 13 y 14).
   - CI en verde sobre `main` en `c9322e7` (10/10/2026), con el trabajo `referencia-nativa` de V1-12.
4. **Aporte personal.** Decidí el criterio sobre la bitácora y la corrección del fundamento. Registré el aporte en `00-gestion/pendientes.md`, `00-gestion/estado.md` y ADR-078.
5. **Desacuerdo y resolución.** Proyecto individual; sin desacuerdos dentro del equipo.
6. **Herramienta auxiliar.** Conforme a la declaración por período. Particularidad: Claude Code procesó el dictamen en pendientes, actualizó estado y pendientes y redactó el borrador de esta entrada, que reviso.

### Entrada · Viernes 9 de octubre de 2026 — Respuesta al dictamen: línea de base sobre el procedimiento delegado, relevamiento de la práctica y encuesta

1. **Decisión adoptada.**
   - **Línea de base (ADR-078, modifica ADR-053).** Mantuve la medición del procedimiento delegado: un agente que resuelve la consulta de configuración. El sujeto afectado sigue siendo el desarrollador. Declaré las 64 observaciones del AE1 como prueba informal, sin protocolo uniforme ni registros, y no uso sus valores. Fijé el error como criterio principal y los tokens como secundario, con su equivalente a precio de lista. Decidí medir con la skill nativa `customize-opencode` disponible y consultar al docente antes de medir.
   - **Problemática.** La conservé: cambian la manifestación (el desarrollador delega en un agente) y la magnitud (error, aciertos parciales y tokens).
   - **Relevamiento de la práctica.** Fijé dos afirmaciones: P1, la práctica de delegar, y P2, el error de los agentes con la configuración. Fijé también ocho fuentes, seis reglas y la fecha de corte del 09/10/2026 antes de buscar.
   - **Encuesta.** La adopté como complemento, sin que bloquee la consulta. Agregué el consentimiento informado, la separación de los cambios de apariencia, el método principal, la pregunta del tiempo, el criterio de cierre (14 días y mínimo de 30 respuestas) y el plan de análisis.
   - **Prototipo.** Pedí que el CI ejecute OpenCode 1.18.25 real y falle si difiere de la referencia (ficha V1-12).
2. **Alternativas y criterio de descarte (recortes).**
   - **Medición con personas (O-A).** La descarté: los datos del AE1 no tienen registros y el procedimiento actual, según la entrevista y la reorientación del proyecto, es la delegación.
   - **Medición mixta (O-C).** La descarté porque duplica el instrumento; el costo humano lo releva la encuesta.
   - **Datos del AE1 como piloto con valores (D-B).** Los descarté porque no hay registros que los respalden.
   - **Tokens en el criterio principal (I-A).** Los descarté: una respuesta barata y equivocada no resuelve la consulta.
   - **Skill desactivada (S-B).** La descarté porque mediría un agente más débil que el de cualquier usuario.
   - **Encuesta.** Excluí la pregunta sobre la intención de usar RIGE, por sesgo hipotético y para no romper la neutralidad.
   - **Codificación de incidencias.** Excluí la doble codificación; declaro el codificador único como límite.
3. **Evidencia.**
   - `opencode debug skill` en OpenCode 1.18.25, ejecutado en un contenedor limpio, lista `customize-opencode` como skill incorporada.
   - Incidencias #14216 y #22247 (agente que modificó `opencode.json` con resultado erróneo). Reclasificación de las 32 de A.VI.6: ninguna de delegación, y #32581 corresponde a OpenClaw, no a OpenCode.
   - Estudios verificados en arXiv: el modelo solo se equivoca y con un validador determinista mejora (89,06 % frente a 98,50 % en Ghorab et al., 2026). No hay estudios sobre precedencia entre varias fuentes.
   - Stack Overflow 2025 y 2026, verificados en las páginas oficiales.
   - Todo consta en `01-relevamiento/linea-base/relevamiento-delegacion.md`.
4. **Aporte personal.**
   - Aporté la causa de invalidez de los datos del AE1 y la observación de la referente sobre las correcciones con agentes.
   - Decidí las alternativas de ADR-078, el enfoque de la encuesta y el consentimiento.
   - Envié el correo de confirmación a la referente.
   - Registré el aporte en ADR-078, el Anexo III (D-41), `PROTOCOLO-relevamiento-delegacion.md`, `borrador-encuesta-practica.md` y la ficha V1-12.
5. **Desacuerdo y resolución.** Proyecto individual; sin desacuerdos dentro del equipo. Revisé con criterio propio las sugerencias de una segunda herramienta sobre la encuesta y acepté las que mejoraban la calidad de los datos.
6. **Herramienta auxiliar.** Conforme a la declaración por período. Particularidad: Claude Code ejecutó las búsquedas, la reclasificación de incidencias y la verificación en contenedor, y redactó el protocolo, la encuesta, ADR-078 y el borrador de esta entrada. Codex (`gpt-6.1-sol`) implementó V1-12 en `src/`.

### Entrada · Jueves 1 de octubre de 2026 (incluye la noche del 30 de septiembre) — Cierre del incremento 0 y corrección de los Capítulos IV, V y X

1. **Decisión adoptada.**
   - **Diferencial (ADR-075).** Adopté la combinación de la decisión de permiso con su regla determinante y la procedencia por declaración (RF-02 CA-8). Definí el aporte a OpenCode como salida estratégica y conservé el repositorio privado (D-31).
   - **Planificación (D-36).** Declaré una metodología iterativa e incremental, con elementos de Scrum y Crystal Clear. Sinteticé V.1 y organicé V.4 en cinco bloques; organicé la línea de base en una preparación y una ejecución de uno o dos días, con el resultado al 16/10.
   - **Recursos (ADR-076).** Elegí la suscripción a ChatGPT Plus (USD 20/mes). Adopté la medición en tokens, su equivalente monetario informativo y las tarifas congeladas al 01/10. Tomé la mediana junior de SysArmy ($8.876/h), organicé X.3 por partidas e incorporé Codex, Trello y matplotlib a X.4 (D-48, D-49 y D-60).
   - **Incremento 0 (fichas `inc0/`).** Fijé el contrato de errores de la CLI y probé ADR-067 sin supervisión constante. Cerré T0-11a a T0-13 y las mejoras inc0-c1 a inc0-c4 tras una revisión conforme; luego uní la rama con `main`.
   - **Errores y guardas (ADR-069 y ADR-070).** Acepté el código 1 para los errores del entorno detectados antes de operar y el analizador propio para las guardas.
   - **Integración continua.** Cambié el ejecutor del CI a `ubuntu-26.04`.
2. **Alternativas y criterio de descarte (recortes).**
   - **Diferencial.** Descarté la explicación sola porque Amp y Codex ya evalúan decisiones.
   - **Verificación.** Descarté la combinación sin criterio de aceptación porque dejaba el diferencial sin comprobar.
   - **Sostenimiento.** Excluí la inversión, el núcleo abierto, el servicio alojado, la licencia dual y el soporte pago por las fuerzas de IV.3 (D-31).
   - **Competidores.** Excluí la propuesta de Codex (incidencia n.º 26255) porque no está implementada; la conservé como señal de demanda.
   - **Relevamiento.** Excluí del A.I.4 las categorías genéricas sin una herramienta con nombre.
   - **Presupuesto.** Reemplacé el tope de API de USD 50 y la estimación de USD 75 por la suscripción.
   - **Proveedor.** Descarté OpenCode Go y Claude Pro como proveedores de la medición (D-48).
   - **Costo horario.** Descarté el promedio del OPSSI porque mezcla seniorities.
   - **Honorarios.** Descarté los honorarios de los colegios profesionales porque son tarifas de otras provincias y no salarios (D-60).
   - **Texto del informe.** Retiré gentle-ai porque no aportó y genera confusión.
   - **Texto del informe.** Retiré pandoc por decisión propia.
   - **Texto del informe.** Retiré el detalle de internet y del lugar de trabajo por decisión propia.
   - **Texto del informe.** Retiré la explicación técnica de la virtualización por decisión propia.
   - **Jornada.** Dejé fuera las correcciones de los Caps. I y II, anotadas en la Ventana del AE1 (§8 a §10).
   - **CLI.** Descarté el subcomando `estado` porque ADR-062 C1 cierra la lista de subcomandos; reservé la consulta de estado para `servir`.
   - **Modelo de datos.** Descarté C6, la propuesta de precisar ADR-061 para admitir `existsSync`, porque una clase de ocho líneas no justifica reabrirlo.
   - **Diagnóstico web.** Diferí el diagnóstico con `--depurar` a RNF-04.
   - **ADR-069.** Diferí su programación al incremento 1 porque se aceptó después del cierre.
   - **Sesión.** Descarté cerrar solo T0-11a porque las fichas siguientes entraron sin superar la cuota.
3. **Evidencia.**
   - La nómina de 33 competidores surge de una búsqueda con Codex (`00-gestion/fichas-redaccion/20261001-cap4-nomina-competidores.md`, 01/10, A.I.4). Verifiqué en la documentación oficial `amp permissions test`, que informa la acción, la regla coincidente y el alcance, y `codex execpolicy check`.
   - Me basé en los precios registrados en `01-relevamiento/linea-base/tarifas-congeladas-20261001.json` y en la documentación de proveedores: la conexión de OpenCode con ChatGPT Plus está disponible desde la versión 1.1.11.
   - Me basé en los anuncios de `actions/runner-images`: el ejecutor `ubuntu-26.04` está disponible desde el 17/09/2026 y `ubuntu-latest` todavía corresponde a 24.04.
   - Tomé como referencia SysArmy 2026.01, con 4939 respuestas analizadas. La mediana junior queda pendiente de mi verificación directa.
   - Me basé en las fichas `20261001-cap4.md`, `20261001-cap5.md` y `20261001-cap10.md`. Comprobé el CI en verde en Ubuntu y Windows desde el 30/09/2026, las 324 pruebas y el resultado PASS de `bun run verificar` en `main`.
   - Registré mi medición de T0-11a a inc0-c4 (30/09 y 01/10): ≈ 82 min de uso de herramientas y ≈ 13,5 M de tokens de entrada, casi todos en caché, contra ≈ 1 h y ≈ 8 M por tarea con ADR-065 (`00-gestion/fichas/inc0/INDICE.md`). Comprobé que cumplen la meta de reloj de 15 min; la reanudación de inc0-c4 y los 20 archivos de inc0-c3 explican los dos excesos en tokens.
4. **Aporte personal.**
   - Definí las correcciones, las suscripciones, el perfil junior y las tarifas. Registré el aporte en ADR-075, ADR-076, el Anexo III (D-31, D-36, D-41, D-48, D-49, D-59 y D-60), los Caps. IV, V y X, las Tablas 11, 15, 16 y 18 y las Figuras 2 y 3.
   - Fijé el contrato de errores. Utilicé la herramienta de apoyo para resolver con sus recomendaciones las consultas de implementación, para probar el método de ADR-067. Subí la rama, elegí las mejoras y la uní con `main`; registré el aporte en las fichas `inc0/`, ADR-069, ADR-070, `src/README.md` y `04-diseno/README.md` §1.
   - Conservé la declaración de gentle-ai en `src/README.md` §8 por una recomendación válida de la herramienta sobre cómo declarar el código ya generado.
5. **Desacuerdo y resolución.** Proyecto individual; sin desacuerdos dentro del equipo. Rechacé nombrar otra causa para la reformulación de la línea de base que no fueran la entrevista con la referente y la reorientación del proyecto.
6. **Herramienta auxiliar.** Conforme a la declaración por período. Particularidad: las búsquedas y la asistencia en las correcciones del informe se hicieron con Codex, con un consumo del 14 % al 49 % de la ventana de cinco horas. Las Figuras 2 y 3 se generan con matplotlib mediante scripts del repositorio.

### Entrada · Miércoles 30 de septiembre de 2026 — Tablero de gestión, cambio del método de programación e incremento 0 hasta T0-10

1. **Decisión adoptada.**
   - **Tablero.** Definí un kanban por estados, con un máximo de dos tareas en curso, una columna «Hecho» por iteración y 47 tarjetas basadas en V.4, Tabla 18 y los entregables. Incorporé el prefijo, el color, las fechas reales y la reconstrucción declarada; las tareas inconclusas cambian de iteración en la misma tarjeta, con un comentario.
   - **Errores (ADR-066).** Fijé los códigos estables y la ubicación de los datos de ejecución en temporales, separados del repositorio.
   - **Incremento 0 (fichas T0-01 a T0-09).** Cerré las tareas con ADR-065 tras dos revisiones del documento ODD. Recuperé los casos de uso de ADR-058 y la validación de las vías contra el adaptador en la aplicación.
   - **Programación (ADR-067).** Desinstalé gentle-ai y elegí a Codex como apoyo para codificar por ficha y hacer el commit en la rama. Asigné al sistema del TIF un esquema de revisión; cerré T0-10 con ese método.
2. **Alternativas y criterio de descarte (recortes).**
   - **Método.** Descarté mantener gentle-ai porque reproducía el costo medido.
   - **Ajuste.** Descarté afinarlo sin SDD porque la delegación obligatoria y el espejo en Engram siguen en ODD, según su código.
   - **Arnés.** Descarté OpenCode sin gentle-ai porque no aporta frente al arnés propio.
   - **Orquestación.** Rechacé Codex en VS Code conmigo como intermediario porque exige una integración manual continua.
   - **Independencia.** Descarté Claude Code como única herramienta de apoyo porque se pierde la independencia en la validación del código.
   - **Proveedor.** Descarté Copilot Student porque, desde el 24/06/2026, solo permite la selección automática y ofrece 200 créditos.
   - **Implementación.** Diferí la implementación de `puerto-ocupado` a T0-11b.
   - **Plataformas.** Mantuve diferida la acreditación de macOS (ADR-054).
   - **Registro.** Congelé el documento ODD del incremento 0 como antecedente.
   - **Revisiones.** Dejé de guardar las revisiones como archivos con ADR-067.
   - **Tablero.** Descarté «Hecho · Especificación» para el período del 07/09 al 20/09 porque falta un historial fechado y obligaría a inventar fechas; el trabajo pertenece a la iteración 1.
   - **Estados.** Descarté las columnas organizadas solo por iteración porque perderían el estado exigido.
   - **Fechas.** Excluí la simulación de fechas de creación anteriores porque Trello guarda la fecha real; declaré la reconstrucción.
   - **Calendario.** Dejé pendientes las fechas de cierre, de la Ventana y de la AE3 porque la cátedra no las fijó.
   - **Metadatos.** No cargué las etiquetas de tipo, el responsable ni la fecha de inicio por los límites del conector. Incluí el tipo en la descripción y dejé a mi cargo la carga manual del responsable y de los nombres de las etiquetas.
   - **Formalización.** Diferí registrar en un ADR el criterio del tablero.
3. **Evidencia.**
   - Me basé en la guía AE2, el objeto 3, la dimensión 6 y la autoverificación; en V.1, Tabla 14 y V.4, Tablas 18 y 19; y en el historial del 24/09 al 30/09.
   - Analicé `opencode.db` para T0-01 a T0-09, el 30/09: ≈ 590 min de uso de herramientas frente a menos de 5 min manuales, 459 pasos y 196 llamadas a Engram; ≈ 69,5 M de tokens de caché y ≈ 3 M de entrada.
   - Sustenté el cambio en gentle-shell #1494, las notas de gentle-ai 3.1 a 3.5 y mi prueba de `codex exec`.
   - Registré mi medición de T0-10, el 30/09: ≈ 6 min y ≈ 0,73 M de tokens de entrada (≈ 0,67 M en caché), contra ≈ 1 h y ≈ 8 M por tarea con ADR-065 (`00-gestion/fichas/inc0/INDICE.md`). Comprobé 225 pruebas en T0-09 y 233 en T0-10.
4. **Aporte personal.**
   - Objeté el documento ODD a la herramienta de apoyo; la objeción resultó fundada y se incorporaron los casos de uso. Objeté la propuesta inicial y ADR-067 incorporó un proceso de revisión adicional. Marqué como inaceptable el consumo de más de 4 h y más del 25 % de mi cuota semanal; decidí cambiar las herramientas y retirar gentle-ai.
   - Aprobé el tablero y la distinción visual, lo pasé a privado y completé `informe/datos-autor.yaml`. Registré el aporte en <https://trello.com/b/BhNydwGK>, ADR-066, ADR-067, las fichas, `00-gestion/diseno-sistema-agentes.md` y la rama `inc0-esqueleto`.
5. **Desacuerdo y resolución.** Proyecto individual; sin desacuerdos dentro del equipo.
6. **Herramienta auxiliar.** Conforme a la declaración por período. Particularidad: el tablero se creó con el conector de Trello, y desde T0-10 el código cuenta con el apoyo de Codex.

### Entrada · Martes 29 de septiembre de 2026 — Arquitectura, revisión del catálogo y diseño para programar el v1

1. **Decisión adoptada.**
   - **Arquitectura (ADR-058).** Acepté la arquitectura de puertos y adaptadores, con tres paquetes aislados, un núcleo sin dependencias y la política de OpenCode en el adaptador. Adopté los errores categorizados y la falla visible.
   - **Catálogo (ADR-059).** Revisé los casos, los criterios, RF-12 y RF-14; incorporé RF-16, RNF-09 y RNF-10. Dejé 17 Must de 26 requisitos, CU-01 como subfunción y CU-05 para explorar el comportamiento.
   - **Horas (ADR-064).** Financié RNF-09 (+1 h) y RF-16 (+3 h) con la estabilización, que pasó de 15 a 11 h. Incluí RNF-10 en la tarea del evaluador y conservé las 136 h técnicas y la contingencia.
   - **Adaptador (ADR-060).** Adopté las aplicaciones ejecutadas por el núcleo, el evaluador del adaptador, los rastros de valor y de decisión, los tres orígenes y las posiciones originales. Definí la medición por el canal de error y el resumen E-02.
   - **Persistencia (ADR-061).** Identifiqué el Proyecto por su ruta canónica y adopté la Resolución como JSON inmutable y versionado. Definí la retención de 20 resoluciones, el resumen E-02 informativo sin caché y el esquema explícito.
   - **Distribución (ADR-062).** Elegí `bun run`, Bun 1.3.14, TypeScript 7.0.2, el escape HTML, las dependencias exactas, la configuración explícita, las versiones independientes y las pruebas aisladas. Definí la observación de las vías locales y la falla visible ante el contenido en variables.
   - **Vertical (ADR-061 y ADR-062).** Fijé el caso con RF-01 CA-1 y RD-01, la ejecución del build, una clave escalar y tres archivos. Definí la persistencia y la recuperación web tras reiniciar, con una referencia de OpenCode 1.18.25 en WSL.
   - **Programación (ADR-065).** Adopté OpenCode con gentle-ai en ODD, un documento revisado por incremento, TDD y commits en la rama. Esta decisión se modificó el 30/09 por ADR-067, sin gentle-ai.
   - **Propagación (ADR-058 y ADR-060).** Acoté RNF-04 y RR-02 a las sustituciones y precisé RF-07 y RF-16. Dejé RNF-04, RR-02 y RF-07 pendientes de informar a la referente.
2. **Alternativas y criterio de descarte (recortes).**
   - **Casos de uso.** Retiré el CU-05 anterior porque duplicaba objetivos y modelaba un canal.
   - **Numeración.** Descarté CU-06 porque preferí la continuidad; el CU-05 anterior no llegó a lectores externos.
   - **Listados.** Revisé L-06 solo porque toda consulta parte de un estado determinado.
   - **Exportación y editor.** Los reformulé como capacidades de la CLI, sin integración con un editor.
   - **Matriz e inversa.** Mantuve RF-15 como Won't, conforme a la delimitación.
   - **Relaciones.** Mantuve RF-13 diferido, conforme a la delimitación.
   - **Otros listados.** Mantuve excluidos los listados de otros elementos.
   - **Paquetes.** Descarté un paquete único porque la instalación aislada detecta las dependencias no declaradas y hace de RNF-03 una propiedad estructural.
   - **Errores.** Descarté las excepciones con un manejador global porque convierten los errores en valores plausibles.
   - **Permisos.** Descarté ubicar la política en el núcleo porque contradice RNF-03.
   - **Estimación.** Descarté incorporar los requisitos nuevos sin horas porque ajusta artificialmente la cuenta (D-38).
   - **Reserva.** Descarté usar la reserva documental porque está comprometida.
   - **Capacidad.** Descarté elevar el total porque declararía horas que no tengo.
   - **Orden.** Diferí el contrato, los datos, la distribución y las pruebas metamórficas a ADR-060 a ADR-063; resolví los tres primeros durante la jornada.
   - **Contrato.** Descarté el descriptor declarativo porque no expresa las derivaciones posteriores a la fusión.
   - **Responsabilidades.** Descarté que el adaptador resuelva y devuelva el rastro porque vacía el núcleo y trivializa la prueba ficticia.
   - **Rastro.** Descarté un rastro genérico porque oculta la posición efectiva de las reglas de permiso (RD-02 y RD-03).
   - **Medición.** Descarté incluir la medición en la respuesta porque rompe el determinismo de RF-03. Definí que la medición sale a pedido por el canal de error.
   - **Secretos.** Excluí el contenido de las variables del resumen para proteger los secretos de baja entropía; acepté que sus cambios no alteren E-02.
   - **Remotas.** Excluí las entradas remotas por RNF-05 y las declaré no observadas.
   - **Gentle Shell.** Descarté incorporar un tercer runtime sin una ventaja demostrada.
   - **Flujo propio.** Descarté reinventar una disciplina genérica ya curada.
   - **Diferimientos.** Dejé los datos, la distribución y las pruebas metamórficas para ADR-061 a ADR-063; resolví los datos y la distribución ese día. Dejé la invocación de `summary` para la iteración 2.
   - **Bun.** Descarté la versión 1.4.2 porque cambia el runtime y las expresiones regulares; OpenCode compila con 1.3.14.
   - **TypeScript.** Reemplacé la versión anterior por 7.0.2 porque solo verifica tipos y comprobé su compatibilidad.
   - **Docker.** Lo descarté para el desarrollo y la comprobación por los privilegios, el conflicto con RNF-09 y el ocultamiento del disco; lo reservé para el oráculo y la medición.
   - **SDD.** Descarté el ciclo completo porque sus artefactos duplican el catálogo y los ADR.
   - **Solo Claude Code.** Lo descarté por la falta de independencia y la falta de continuidad al agotar el plan.
   - **Herramientas propias.** Las descarté porque exigen mantener scripts extras y contaminan los escenarios en `.opencode/`.
   - **gentle-ai en Claude Code.** Lo retiré por las instrucciones en conflicto y la eliminación de las confirmaciones de permisos.
   - **Herramientas gratuitas.** Las excluí por el riesgo de uso de los datos.
   - **Caché y ejecutable.** Los excluí por ADR-023 y SmartScreen, respectivamente.
   - **Posteriores.** Diferí ADR-063, la versión real de `.gitattributes` y los documentos de los incrementos 1 a 5.
3. **Evidencia.**
   - Me basé en el tag `v1.18.25` de OpenCode, `01-relevamiento/linea-base/laboratorio-verificacion.md`, E-12 y E-18, RD-01 a RD-07, RNF-03, E-01, E-02, H-18 y los criterios del catálogo.
   - Me basé en I.6.1, I.6.4 y la Tabla 9 del AE1, V.5 y la Tabla 20, ADR-052, D-38 y la guía de comprobación del v1. Utilicé la documentación oficial y mis pruebas de compatibilidad del 29/09.
   - Sustenté la propagación en las revisiones `00-gestion/revisiones/20260929_propagacion-ADR-058-060.md`, `20260929_propagacion-ADR-059*.md` y `20260929_inc0-base-contexto.md`.
4. **Aporte personal.**
   - Pedí revisar los requisitos y verificar el tag; elegí CU-05 y el financiamiento, y acepté ADR-058 a ADR-062, ADR-064 y ADR-065.
   - Objeté el README mezclado, SDD y el uso exclusivo de Claude Code; el análisis se rehízo y se adoptó mi posición o una alternativa mejor fundamentada. Aporté el aislamiento de los estudios, introduje ODD, instalé gentle-ai y pedí retirarlo de Claude Code; elegí OpenCode y después Codex.
   - Registré el aporte en el libro, los Caps. III, V y X, los Anexos I y V, el Instrumento 34, la Figura 3, el Anexo III (D-50 a D-56), `04-diseno/README.md`, `README.md`, `tools/README.md`, `.github/workflows/ci.yml`, `src/AGENTS.md` e `INDICE.md`.
5. **Desacuerdo y resolución.** Proyecto individual; sin desacuerdos dentro del equipo.
6. **Herramienta auxiliar.** Conforme a la declaración por período. Particularidad: la herramienta procesó el código del tag sin ejecutarlo y corrió las pruebas de compatibilidad; OpenCode con gentle-ai todavía no produjo artefactos en esta jornada.

### Entrada · Lunes 28 de septiembre de 2026 — Validación con la referente, planificación y Capítulo X

1. **Decisión adoptada.**
   - **Validación (acta del 26/09).** Registré la sesión presencial de las 17:00, de 35 minutos, con 82 puntos confirmados; la constancia queda pendiente (U-04). Propagué sus consecuencias al libro y al informe.
   - **Rendimiento (ADR-045, hoy ADR-055).** Adopté el doble del mayor entre un proyecto público y el de la referente, con un umbral en Ubuntu y una medición informativa en Windows.
   - **Planificación (ADR-046 y ADR-047, hoy ADR-052).** Cerré 136 h técnicas, 54 h de reserva y 45 h de contingencia. Fijé la capacidad por días en 28/59/33/16, declaré un exceso de 6 h en la iteración 1 y situé los permisos web en la iteración 2; dejé aparte las 48 h de cierre.
   - **Recursos (ADR-048, hoy ADR-057).** Adopté el costo de hora de $21.565 del OPSSI y el tope de USD 50, reemplazados el 01/10 por ADR-076. Fijé un piloto de USD 20, una estimación de USD 75 y la versión Pro sin costo atribuible.
   - **Entorno (ADR-049 y ADR-050, hoy ADR-054).** Elegí un contenedor común con Docker Desktop sobre WSL 2 y el CI en Ubuntu y Windows (ADR-037, hoy ADR-054).
   - **Documentación (ADR-057; D-19 a D-49).** Revisé el Cap. X, completé el Instrumento 34 y el Anexo III, y declaré que el lienzo no cambió decisiones. Mantuve el repositorio privado, la publicación bajo MIT tras la aprobación y la prueba de clonado por un compañero.
2. **Alternativas y criterio de descarte (recortes).**
   - **Costo grupal.** Descarté las cifras de $2.290.000 y $3.790.000 porque no figuran en el OPSSI y se ponderaron universos distintos.
   - **Costo de entrevista.** Lo excluí porque el Cap. I exige una fuente sectorial externa.
   - **Valoración del problema.** La excluí del capítulo de recursos.
   - **Retorno de inversión.** Lo excluí del capítulo de recursos.
   - **Referente.** No sumé sus horas porque es un recurso externo sin costo.
   - **Equilibrio.** Excluí el punto de equilibrio porque no hay explotación comercial.
   - **Migración.** La excluí porque RIGE es de solo lectura.
   - **Suscripción.** No atribuí su costo porque es un gasto preexistente y adopté el criterio incremental.
   - **Distribución de desarrollo.** La descarté porque el disco de Windows montado deja accesible la hoja de respuestas.
   - **WSL dedicada.** La reemplacé porque aísla por configuración y solo se reproduce en Windows.
   - **Máquina virtual.** La descarté porque la capa adicional del hipervisor sesga RNF-07.
   - **Arranque dual.** Lo descarté porque Ubuntu nativo se acredita en el CI.
   - **Sin límite.** Descarté el presupuesto sin límite porque no dimensiona el recurso.
   - **Libro en `instrumentos/`.** Descarté esa ubicación porque la consigna fija `03-requisitos/` y una única generación completa.
   - **Referencia RNF-07.** Descarté esperar el dato de la referente porque deja el requisito sin condición hasta la iteración 1; elegí un proyecto público y el conteo PV-03.
   - **Permisos web.** Descarté cerrar RF-02 y RF-03 en la iteración 3 o separar la paridad porque cambia criterios e iteraciones confirmados.
   - **Semanas nominales.** Descarté ese reparto porque no coincide con las fechas de las iteraciones.
3. **Evidencia.**
   - Me basé en el acta `01-relevamiento/validacion/20260925_GuiaValidacion_Sanchez_v2.md`, el Anexo I del AE1, el Anexo VI y las revisiones del 28/09 conservadas en el historial.
   - Me basé en el OPSSI a marzo de 2026, pp. 17 y 25 de `01-relevamiento/documentos/opssi2026-reporte-industria-software-1T2026.pdf`, y en mi cálculo con el divisor de 173,33 h. Utilicé la medición del equipo del 28/09 (PV-01).
   - Me basé en la guía AE2, §2.3 y §7, y las fuentes registradas en `01-relevamiento/fuentes.md`.
4. **Aporte personal.**
   - Conduje la sesión y elegí las alternativas P-01, P-15, P-16 y P-21. Aporté el reporte del OPSSI y los recursos, y aprobé el esquema y las correcciones.
   - Registré el aporte en el libro, los Caps. III, IV, V y X, I.6.6, los Anexos I y V, el Instrumento 34, el Anexo III, IV.1, V.2, `tools/exportar_libro.py`, `03-requisitos/modelo-dominio.mmd` y `tools/figura_cronograma.py`.
5. **Desacuerdo y resolución.** Proyecto individual; sin desacuerdos dentro del equipo. Llevo al Informe Grupal de Encuadre Común la corrección de la descripción de RIGE y de las cifras del costo de hora (AD-27). La revisión crítica objetó la brevedad de la validación (82 puntos en 35 minutos, sin observaciones); la registro como pregunta probable de la defensa.
6. **Herramienta auxiliar.** Conforme a la declaración por período. Particularidad: la Figura 1 se exporta con `@mermaid-js/mermaid-cli` y la Figura 3 con matplotlib, mediante scripts del repositorio. La maqueta del v0 se elaboró con Claude Design.

### Entrada · Viernes 25 de septiembre de 2026 — Línea de base, papel de cada interfaz y guía de validación

1. **Decisión adoptada.**
   - **Línea de base (ADR-040, hoy ADR-053; D-41).** Adopté las herramientas como ejecutores, dieciséis casos, cuatro por condición y el caso como unidad de análisis. Fijé el éxito en ocho de los doce casos de C-2 a C-4; las herramientas empleadas inicialmente quedaron reemplazadas el 01/10 por ADR-076.
   - **Interfaces (ADR-036, ADR-041 y ADR-042, hoy ADR-051).** Elegí la CLI completa en la iteración 2, la salida versionada y `--explicar`, con una web mínima para el v1.
   - **Plataformas (ADR-037, hoy ADR-054; ADR-044, hoy ADR-055).** Acepté Ubuntu 26.04 y Windows 11 sin privilegios y la consulta por CLI en menos de 2 s.
   - **Registros (ADR-043, hoy `diseno-sistema-agentes.md`, D-23).** Conservé la fuente única y la remisión desde `04-diseno/`.
   - **Validación (Instrumento 31).** Cerré las decisiones antes de corregir y programar; preparé la guía v2 de entorno, límites, catálogo, dominio, reglas, vocabulario y v0.
2. **Alternativas y criterio de descarte (recortes).**
   - **Línea de base.** Excluí la medición con personas: mide solo el procedimiento manual, y la entrevista mostró que la consulta se delega frecuentemente (D-41).
   - **Encuesta.** La descarté como línea de base porque no mide errores silenciosos; la conservé como complemento de la práctica delegada.
   - **Casos automáticos.** Los excluí porque aportan cantidad sin variedad de mecanismos.
   - **Diseño humano.** Excluí la equivalencia a/b y la no repetición porque controlan el aprendizaje humano, ausente en los entornos de prueba.
   - **v1 solo CLI.** Lo descarté porque la guía exige responder en una dirección y mostrar el dato.
   - **Calendario CLI.** Descarté mantener RF-03 en la iteración 3 por su cercanía a la congelación y la medición.
   - **Proyecto solo CLI.** Lo excluí porque reescribe los objetivos del AE1 y deja al desarrollador sin la interfaz del v0.
   - **Web.** Excluí la exploración libre, los filtros y la navegación para no sumar funciones ausentes en la CLI.
   - **Capacidad.** Pasé los permisos web a la iteración 3 y saqué RF-10, Should, de las horas para no exceder la iteración 2; revisé los permisos el 28/09.
   - **Explicación.** Descarté entregar prosa siempre porque aumenta los tiempos y descarté no entregarla nunca por CLI porque deja sin explicación al desarrollador.
   - **Plataformas.** Dejé macOS sin acreditar y concentré Windows en una corrida de la iteración 4 para no ocultar horas de un requisito Should. Descarté los contenedores Windows y macOS porque son inviables en Windows 11 Home.
   - **ADR.** Descarté mover los registros a `04-diseno/` porque mezcla método y arquitectura y rompe la fuente única.
   - **RNF-07.** Descarté el umbral relativo al comando nativo.
   - **Medición.** Descarté medir en el CI por su rendimiento variable, ajeno a RIGE.
   - **Validación.** Dejé las ocho exclusiones de III.4 solo para conocimiento porque responden a una imposibilidad técnica o a la frontera individual.
3. **Evidencia.**
   - Me basé en la entrevista de la referente, RF-03, la guía AE1 §3.3, la comprobación del v1, pasos 7 y 8, la guía AE2 §10.2 y §14, V.4, Tablas 18 y 19 y AD-22.
   - Me basé en `01-relevamiento/opencode-como-funciona.md`, el laboratorio del 19/09 (E-00, E-03, E-14 y E-18), A.I.3, resultados 12, 13 y 15, las incidencias #36663, #36416 y #39715 y la revisión «material-linea-base» conservada en el historial.
4. **Aporte personal.**
   - Planteé el cambio de método a partir de la entrevista con la referente y de la reorientación del proyecto. Elegí las herramientas y el presupuesto, cuestioné los casos y prioricé la CLI; aporté el diseño v0.3, los escenarios y el laboratorio.
   - Elegí las interfaces y el orden de trabajo; aporté el borrador del 22/09 y la modalidad de confirmación, e informé que el v0 estaba sin validar.
   - Registré el aporte en `01-relevamiento/linea-base/`, `borrador-encuesta-practica.md`, ADR-036, ADR-037 y ADR-040 a ADR-044, `04-diseno/README.md` y `01-relevamiento/validacion/`.
5. **Desacuerdo y resolución.** Proyecto individual; sin desacuerdos dentro del equipo.
6. **Herramienta auxiliar.** Conforme a la declaración por período. Particularidad: apoyo en el diseño de la medición, de los ocho escenarios nuevos y de la hoja de respuestas; corrección de `caso.sh` y `verificar.sh`; y apoyo en la preparación de la guía v2 del Instrumento 31 sobre mi borrador y el contenido del Libro de trabajo.

<!-- [PENDIENTE A-07: pegar las entradas de la AE2, la más reciente arriba] -->

## Entradas de la AE1

<!-- [PENDIENTE A-07: pegar las entradas 2 en adelante de la bitácora del AE1 entregada] -->

### Entrada 1 · Jueves 20 de agosto de 2026 — Delimitación del problema y del alcance

1. **Decisión adoptada.** Definí el problema en torno a la configuración efectiva y su procedencia. Decidí que el alcance comprendiera el ecosistema completo.
2. **Alternativas evaluadas y criterio de descarte.** Consideré limitar el alcance a un solo componente, por ser el de uso más frecuente. Lo descarté porque la cadena de precedencia se aplica a las cinco clases y esa reducción habría excluido casos que posteriormente confirmó el relevamiento, como una skill que queda desplazada por otra del mismo nombre. También consideré incorporar el historial de ejecuciones, pero lo postergué porque depende de un almacén interno sin interfaz publicada.
3. **Evidencia que sostiene la decisión.** La documentación oficial del producto y el propio entorno de trabajo, en el que el problema se presenta de manera recurrente.
4. **Aporte personal.** Redacté el enunciado del problema y la primera versión de la tabla de inclusiones y exclusiones del apartado I.6.4. Artefacto: `03-requisitos/` y `00-gestion/anexo-III.md` del repositorio.
5. **Desacuerdos y resolución.** Sin desacuerdos que registrar, conforme al criterio declarado en el preámbulo.
6. **Herramienta auxiliar y alcance.** Asistencia conforme al criterio general declarado, para contrastar la formulación del alcance.
