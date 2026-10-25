## II.2 · Instrumentos, dinámicas aplicadas y alcance

El relevamiento combina la medición con agentes, el análisis documental de incidencias y la entrevista a la referente técnica. Se suman el relevamiento técnico de OpenCode y el contraste de soluciones existentes. Cada instrumento responde a una pregunta distinta.

El relevamiento técnico analiza el código del tag 1.18.25 y ejecuta escenarios controlados sobre la configuración, los permisos y los comandos de introspección. La guía se actualiza el 21/09/2026 y la comprobación de subagentes se corrige el 13/10/2026. Quedan pendientes las verificaciones identificadas como tales, incluidas las configuraciones remota y administrada y las modificaciones por plugins, fuera del alcance del proyecto (Anexo VI, A.VI.3).

El contraste de soluciones combina pruebas directas del 17/09/2026 con una revisión documental actualizada al 01/10/2026. Cubre productos publicados y utilizables que operan sobre la configuración de herramientas de programación basadas en agentes y cuentan con documentación verificable. Las propuestas y los precedentes de otros dominios se registran por separado; el conjunto carece de pretensión de exhaustividad universal (Anexo VI, A.VI.4).

### II.2.1 · Instrumento 1 · Medición con agentes de la línea de base

El autor ejecuta la medición los días 20 y 21/10/2026 mediante el arnés de la línea de base. El instrumento mide el procedimiento delegado: el agente modifica la configuración de OpenCode 1.18.25 dentro del proyecto a pedido del desarrollador y declara si da por terminado el cambio (ADR-098, punto 1). Incluye la detección de defectos y un contraste descriptivo con el ejecutor fuera del árbol del proyecto (Anexo VI, A.VI.8). Se emplean agentes porque la entrevista acredita que la configuración se delega en la práctica. Se descarta el diseño con personas para esta línea de base porque mide el procedimiento manual y deja fuera esa delegación (Anexo III, D-41).

La unidad es el problema, compuesto por un escenario, un pedido, un objetivo comprobable, guardas que deben preservarse y una forma correcta de referencia. Una forma ingenua comprueba el contraste. Los criterios de inclusión exigen:

- C1: una necesidad real de configuración.

- C2: una fuente independiente del mecanismo.

- C3: reproducción nativa sin agente.

- C4: un oráculo determinista.

- C5: un pedido que omite el nombre del mecanismo.

La admisión se realiza exclusivamente por reproducción nativa con OpenCode, sin agente, antes de ejecutar la medición.

Los estratos del banco, sus cantidades y sus funciones constan en la Tabla 2 del apartado I.3.2.

Los ejecutores son el agente nativo `build` y una variante de Charles, el agente que utiliza el equipo de la referente para configurar OpenCode. Ambos emplean `gpt-6.1-sol`, con k = 3 repeticiones por problema, fijado antes de medir. El modelo original de Charles, `gpt-6-luna`, se sustituye porque carece de disponibilidad en OpenCode 1.18.25 con la suscripción utilizada. Las diferencias respecto de la definición original y sus motivos constan en la tabla de adaptaciones de Charles (Anexo III, D-41).

El brazo base, condición de ejecución sin RIGE, dispone de la documentación local de OpenCode 1.18.25 y de `webfetch`, herramienta de consulta web cuyas invocaciones y resultados se conservan en la traza. La hoja de referencia queda excluida. `build` dispone de la skill `customize-opencode`; Charles conserva la denegación de su definición original, que solo habilita tres skills propias del equipo, ausentes en el laboratorio (Anexo III, D-41). Los dos ejecutores presentan éxito declarado falso en los mismos cinco problemas del banco (apartado I.3.2).

La cuenta del desarrollador recibe la credencial del modelo para que el agente pueda probar el efecto ejecutando OpenCode como el desarrollador. La instrucción omite esa posibilidad (ADR-098, punto 3).

Cada ejecución se corrige mediante un oráculo que ejecuta OpenCode sobre el estado final que deja el agente. La regla del colateral distingue las alteraciones de guardas declaradas de los cambios adicionales que detecta la batería de sondas respecto de la forma correcta de referencia. Las primeras cuentan como éxito declarado falso si el agente declara terminado el cambio; los segundos se informan como exceso de alcance (Anexo VI, A.VI.7). La composición del banco consta en A.VI.1 y el registro de su ejecución, en A.VI.2.

### II.2.2 · Instrumento 2 · Relevamiento documental de incidencias del repositorio

La medición se complementa con un relevamiento documental de las incidencias públicas del repositorio de OpenCode. Aporta evidencia de comportamientos de la configuración distintos de lo esperado, con un alcance que excede el banco construido. El criterio de búsqueda se registra antes de efectuar el conteo (Anexo VI, A.VI.6). Se admiten las incidencias cuyo título combina un término relativo al comportamiento de la configuración con el término que designa la configuración, sobre la totalidad del historial del repositorio.

Se restringe la búsqueda al título por la escala del repositorio y se declara ese criterio junto con el resultado para que se reproduzca o discuta. Se descarta relevar el cuerpo completo mediante la interfaz de programación del repositorio por el volumen de resultados que exige clasificar manualmente (Anexo III, D-13).

### II.2.3 · Instrumento 3 · Entrevista semiestructurada al referente

La entrevista individual se aplica a la referente técnica de una organización de la región para verificar si la dificultad acreditada técnicamente se presenta en la práctica de su equipo. Registra las preguntas que formula sobre el estado efectivo de su configuración, los recursos con que las resuelve y las soluciones propias que relata.

#### Aplicación y alcance efectivo

La persona consultada es Valeria Areco, desarrolladora del equipo de Sistemas de EMSA. El canal, las fechas y la duración de los contactos constan en el apartado I.1.2. El consentimiento para las entrevistas está otorgado, según la declaración del autor del 24/10/2026. La autorización explícita para publicar nombre y rol queda pendiente para la próxima constancia conjunta, en el registro R-09 (Anexo VI, A.VI.5).

La decisión sobre el relevamiento del equipo completo consta en el apartado I.1.2. Sus consecuencias se declaran en el apartado II.2.4. La guía y las condiciones de aplicación se documentan en el Anexo VI, A.VI.5.

#### Estructura del guion y registro

El 29/08/2026 se aplica un guion de siete preguntas, según la constancia de entrevistas; el 24/09/2026 se mantiene una charla de seguimiento sin guion fijo. El registro se reconstruye sin grabación a partir de los informes y de la memoria del autor, y la referente confirma las afirmaciones el 15/10/2026 (Anexo VI, A.VI.5).

La guía ordena los temas de lo general a lo particular y evita sugerir la respuesta esperada. Sus bloques comprenden:

- El contexto del equipo, sus herramientas y el motivo de su adopción.

- La forma en que se define la configuración.

- Los episodios concretos de comportamiento distinto del previsto.

- El procedimiento para averiguar qué configuración rige.

- Los recursos y las soluciones propias que el equipo relata.

- La frecuencia de las consultas y las consecuencias de una respuesta incorrecta.

#### Criterio de registro de los datos numéricos

Toda cifra obtenida se consigna con su método de obtención, su universo y su período de referencia. Se distingue lo que la referente relata de su propia práctica de lo que estima respecto de terceros. Esa distinción determina el valor probatorio con que cada dato se emplea en el informe.

#### Valor probatorio y su límite

La entrevista produce demanda declarada, sujeta a los sesgos descriptos en el apartado II.6.2. Los relatos sobre artefactos del equipo y consumo de tokens conservan esa condición; la pizarra se consigna como relato sin registro firmado. La definición de Charles entregada por la referente constituye el artefacto observado que acredita demanda revelada (apartado II.1.1). La acreditación del mecanismo se apoya en el relevamiento técnico (Anexo VI, A.VI.3). Las incidencias documentan comportamientos reportados por terceros con el alcance del Anexo VI, A.VI.6.

### II.2.4 · Alcance y límites del relevamiento

El relevamiento declara cuatro límites del instrumento: la ausencia de una instancia ciega, el alcance del banco, las fuentes disponibles no relevadas y el sujeto humano fuera de la medición. Su efecto sobre las conclusiones se trata en el apartado II.6.3.

#### Ausencia de una instancia ciega

El autor diseña el banco, construye las formas de referencia y desarrolla RIGE. La corrección es mecánica, por ejecución de OpenCode contra una hoja cerrada, que fija las tareas y sus criterios de corrección el 19/10/2026, antes de ejecutar agentes. Las clasificaciones de las incidencias siguen sin segundo codificador. El análisis incorpora decisiones posteriores al dato, registradas en el Anexo VI, A.VI.8.

#### Alcance acotado a una herramienta y a un banco construido

La medición se circunscribe a OpenCode 1.18.25, un modelo y problemas construidos sobre mecanismos documentados. El banco es un conjunto definido de problemas, sin carácter de muestra de la práctica; por eso se informa sin intervalos de confianza ni estimaciones de prevalencia. La proporción de problemas con éxito declarado falso depende de la composición del banco (ADR-098, punto 12 y Contexto 3). El uso de un único modelo limita la separación entre el efecto de la herramienta y el del modelo. La sensibilidad con otro modelo queda para una instancia posterior (Anexo III, D-41).

#### Fuentes disponibles no relevadas

Tres conjuntos de informantes quedan fuera del relevamiento. El equipo de Sistemas de EMSA se releva a través de una sola de sus cinco integrantes. Los parámetros disponibles para una eventual valoración económica proceden de esa informante, conforme al apartado I.3.1.

El relevamiento documental propio identifica 31 incidencias sobre comportamientos de la configuración distintos de lo esperado, mediante búsqueda y clasificación por título, con un codificador. Abarca del 28/11/2025 al 16/09/2026, con consulta el 17/09/2026 y revisión el 09/10/2026 (Anexo VI, A.VI.6). Se distribuyen en diez de precedencia y fusión, una de valor implícito, diez de permisos y diez fuera de alcance. El corpus carece de incidencias sobre ruta absoluta. El contacto con sus autores queda pendiente y aportaría declaraciones de primera mano independientes de la referente.

El relevamiento de quienes desarrollan OpenCode queda pendiente; constituyen una fuente directa sobre el comportamiento de la herramienta y sus decisiones de diseño. Los tres relevamientos son factibles y su ausencia limita el sustento declarado del problema a una única informante.

#### El sujeto humano fuera de la medición

Se mide al agente en el que se delega la configuración; la persona que recibe su respuesta queda fuera del instrumento. El costo humano de descubrir un cambio sin efecto queda sin medir y la medición con personas se difiere (ADR-098, punto 15).
