## II.5 · Análisis de la información

### II.5.1 · Encuadre del sector donde vive el problema

El problema se manifiesta en el sector de Software y Servicios Informáticos, en la adopción de herramientas de programación basadas en agentes dentro del desarrollo de software. Este sector comprende desarrollo, implementación, mantenimiento y soporte de software, junto con los servicios informáticos asociados. El sujeto afectado y el productor de la solución pertenecen a esa industria. Se la examina con dos propósitos: acreditar el problema en este apartado y caracterizar los recursos para construir la solución en el apartado II.5.5.

#### Crecimiento de la actividad asistida por agentes

El conjunto de datos de Galster, Mohsenimofidi, Böhme et al. (2026) procede de investigadores de Bamberg, Heidelberg, Bayreuth y Singapore Management University, con el propósito de publicar datos reutilizables para investigación. Mediante minería de GitHub, clasificación de proyectos con apoyo de GPT-5.2 y detección heurística de configuraciones y commits atribuidos a agentes, identifica 4 738 repositorios con artefactos de configuración entre 36 710 proyectos de ingeniería de software. La extracción corresponde al 28 al 30/03/2026. En los repositorios observados, los commits mensuales coautorados por agentes pasan de valores próximos a cero a comienzos de 2025 a más de 40 000 en marzo de 2026 (apartado I.1.1). La serie sostiene examinar la verificabilidad de la configuración que acompaña esa actividad; la inferencia se limita a los repositorios con atribución identificable.

#### Heterogeneidad de los mecanismos de configuración

Galster, Mohsenimofidi, Lulla et al. (2026), investigadores de Bamberg, Heidelberg y Singapore Management University, revisan la documentación de cinco herramientas para caracterizar sus mecanismos de configuración. El estudio combina esa revisión con minería de repositorios de GitHub. La selección comienza en noviembre de 2025 y la captura de configuraciones corresponde al 02/02/2026. La heterogeneidad documentada sostiene el núcleo común con un adaptador por herramienta y el alcance inicial acotado a OpenCode (apartado I.6.5).

#### Cambios entre versiones

La cadencia de publicación y los cambios declarados de configuración, permisos y agentes introducen un riesgo de obsolescencia, documentado en el apartado I.1.4. Ese riesgo sostiene mantener fija la versión 1.18.25 y declarar la versión sobre la que se resuelve el estado efectivo.

#### Exigencia normativa sin acreditar

La exigencia normativa de documentar, auditar o conservar esta configuración queda sin acreditar (apartado I.1.4). Se excluye la exigencia normativa de los desencadenantes acreditados y se funda la verificación en el comportamiento observado y la práctica relevada.

El caso regional, su equipo y los motivos de adopción constan en el apartado II.3.3. El encuadre carece de datos sectoriales propios sobre la adopción de herramientas agénticas en el Nordeste argentino; el caso individual se conserva con ese límite. La Tabla 12 reúne la caracterización de las fuentes citadas.

### II.5.2 · Análisis del entorno (PESTEL)

El análisis incorpora únicamente los factores cuya evidencia modifica una decisión del proyecto.

| **Dimensión** | **Factor y evidencia** | **Implicancia decisoria** |
|---------------|------------------------|---------------------------|
| Tecnológica | Los mecanismos de configuración difieren entre herramientas, según el estudio caracterizado en el apartado II.5.1 (Galster, Mohsenimofidi, Lulla et al., 2026) | Sostiene la arquitectura de núcleo común con adaptador por herramienta y el alcance inicial circunscripto a OpenCode. Los adaptadores restantes quedan diferidos como trabajo futuro (apartado I.6.5) |
| Tecnológica | El autor cuenta las versiones estables y clasifica las notas publicadas por el equipo de OpenCode entre el 01/01 y el 30/09/2026. De 227 versiones, 43 declaran cambios de configuración, permisos o agentes (anomalyco, s. f.-c; anomalyco, s. f.-d; apartado I.1.4) | Sostiene fijar la versión 1.18.25 durante todo el desarrollo y que RIGE declare la versión sobre la cual resuelve el estado efectivo |
| Tecnológica | La documentación oficial de la versión describe un conjunto de entradas menor que el que el código aplica, y omite la última coincidencia y la precedencia de los directorios de la herramienta (Anexo VI, A.VI.3) | RIGE resuelve según el comportamiento verificado y explica por qué prevalece una entrada. La verificación automática contra la propia herramienta constituye una condición de corrección (OE-1 y OE-2) |
| Tecnológica | Amp evalúa acciones y Codex evalúa comandos; `config/read` informa orígenes por clave y capa. La procedencia por posición queda fuera de esas funciones (Anexo VI, A.VI.4). Winning (2026) propone procedencia por capa y archivo desde la línea de comandos | El diferencial combina la decisión, su regla determinante y la procedencia por declaración (entrada, archivo y posición), con valores implícitos y declaraciones sin efecto (Anexo III, D-59). La oportunidad se delimita en el apartado I.1.3 |
| Tecnológica | La práctica declarada de delegación y el pedido de consulta programática constan en el apartado II.3.3 | Sostiene la interfaz de línea de comandos con salida estructurada para el agente consumidor (apartado I.6.2). Sus límites se declaran en el apartado I.6.5 |
| Tecnológica | OpenCode 1.18.25 carga por defecto `customize-opencode`, que orienta al agente para crear y corregir la configuración, incluidas las reglas de permiso (OpenCode, 2026; apartado I.1.3 b) | La verificación del efecto se contrasta con el procedimiento delegado que promueve la propia herramienta (apartado I.3.2) |
| Económica | Los motivos de adopción declarados por la referente constan en el apartado II.3.3 | El costo de la delegación se compara por ejecución y problema, como salvaguarda del apartado I.3.4 |
| Económica | La referente declara consumo de tokens por consultas de configuración y por acciones repetidas ante resultados distintos de los esperados (apartado II.3.3) | La línea de comandos obtiene el estado por lectura directa (apartado I.6.2). El costo de su uso dentro del procedimiento delegado se controla con la salvaguarda (apartado I.3.4). El costo relatado queda sin medir (apartado I.3.1) |
| Legal | La aplicación de la Ley N.º 25.326 a los datos personales del relevamiento se delimita en el apartado I.1.4 | Se cuenta con el consentimiento otorgado por la referente (apartado II.2.3). La autorización para publicar nombre y rol queda para la próxima constancia conjunta, registro R-09 |

*Tabla 15. Factores del entorno con implicancia decisoria. Fuente: elaboración propia.*

### II.5.3 · Cadena de valor

Se aplica la cadena de valor al desarrollo de software asistido por agentes, dentro del entorno individual del desarrollador definido en el apartado I.6.4. La modificación sin efecto que se da por exitosa sitúa la pérdida en la revisión del resultado (apartado I.3.2). Se descarta analizar la cadena de valor de EMSA porque la organización queda fuera del ámbito de implantación y su proceso productivo es ajeno al problema (Anexo III, D-15).

| **Tipo** | **Actividad** | **Relación con el problema** | **Implicancia decisoria** |
|----------|---------------|-----------------------------|---------------------------|
| Primaria | Análisis de la tarea y preparación del contexto | Requiere conocer qué instrucciones rigen sobre el agente que ejecuta la tarea | Se incorporan las instrucciones como entradas dentro del alcance del apartado I.6.1 |
| Primaria | Instrucción al agente y selección del modelo | El modelo efectivo puede diferir del declarado | Se conserva la consulta del modelo efectivo y su procedencia como capacidad de RF-01 |
| Primaria | Ejecución supervisada y aprobación de acciones | El desarrollador aprueba o restringe acciones sin conocer qué permisos rigen, riesgo acreditado en el apartado I.1.3 | La consulta evalúa una acción concreta con su regla determinante (RF-02) |
| Primaria | Revisión y verificación del resultado | Una modificación sin efecto se da por exitosa (éxito declarado falso, apartado I.3.2) | RIGE interviene en esta actividad: verifica la decisión resultante y detecta declaraciones sin efecto. RF-02 y RF-07 encabezan la prioridad |
| Primaria | Integración y entrega | Hereda los defectos que las actividades anteriores dejan sin detectar | Se sitúa la verificación antes de esta actividad; la integración y entrega de software permanecen fuera de la frontera del apartado I.6.4 |
| De apoyo | Configuración y mantenimiento del entorno del agente | Concentra los cambios cuyo efecto mide la línea de base (apartado I.3.2) | El agente que modifica la configuración consulta el resultado por la línea de comandos, conforme al apartado I.6.2 |
| De apoyo | Gestión de permisos y de seguridad del entorno | Requiere conocer la decisión efectiva y las protecciones nativas | Se distinguen reglas nativas y declaradas y se advierte la desactivación de una protección nativa (RF-02 y RF-09) |
| De apoyo | Documentación y convenciones del proyecto | Provee los archivos de contexto que integran la configuración efectiva | Se incluyen las instrucciones como entradas y se excluye evaluar la calidad de su contenido (apartado I.6.5) |

*Tabla 16. Cadena de valor del desarrollo asistido por agentes y localización de la pérdida. Fuente: elaboración propia. Puntos de pérdida: ejecución supervisada y aprobación de acciones; revisión y verificación del resultado; configuración y mantenimiento del entorno del agente.*

La intervención principal de RIGE se ubica en la revisión y verificación del resultado, una actividad primaria. La configuración constituye la actividad de apoyo donde se origina el cambio que se verifica. El tiempo humano consumido y el retrabajo permanecen sin medir; el consumo de tokens relatado y sus límites constan en el apartado II.3.3.

### II.5.4 · Matriz FODA

| **Elemento** | **Implicancia decisoria** |
|--------------|---------------------------|
| F1. Relevamiento técnico propio sobre el código fuente de OpenCode 1.18.25, con procedimiento reproducible (Anexo VI, A.VI.3) | Los casos y las reglas de resolución derivan de mecanismos acreditados. La admisión nativa de los problemas atenúa el sesgo del diseñador (Anexo III, D-41) |
| F2. Referente accesible que aporta episodios y prácticas de su equipo (apartado II.3.3) | La accesibilidad sostiene la validación del prototipo v0; la confirmación del problema reformulado queda pendiente para la próxima constancia conjunta (Anexo II) |
| F3. Alcance acotado a una única herramienta en versión congelada | Vuelve verificable la corrección del resultado mediante los objetivos OE-1 a OE-3 y hace factible el cronograma |
| D1. Una única referente para la frecuencia, cuya declaración es retrospectiva y carece de registro de respaldo | Se descarta la valoración monetaria del problema. Su magnitud se ancla en la medición propia de la línea de base y la frecuencia se conserva como contexto (apartado I.3.1) |
| D2. Banco de escenarios controlados construido por el autor, sin muestreo de la práctica | El criterio de éxito se ancla en la propia línea de base, problema por problema (apartado I.3.4). El límite se declara en el apartado II.2.4 |
| D3. Desarrollo a cargo de una sola persona, con plazo acotado, que además diseña y administra la medición | Sostiene las exclusiones declaradas del apartado I.6.5 y el diferimiento de los adaptadores. El doble rol se declara como límite en el apartado II.2.4 |
| O1. Ninguna de las soluciones relevadas sobre OpenCode reúne la combinación descripta en la Tabla 15 (Anexo VI, A.VI.4) | La combinación diferencial sostiene la prioridad de la explicación de permisos y la detección de declaraciones sin efecto |
| O2. La dificultad trasciende a OpenCode y está registrada públicamente en herramientas de otros proveedores (Winning, 2026) | Justifica que el núcleo sea independiente de la herramienta desde el diseño, aun cuando el adaptador implementado sea uno solo |
| O3. La resolución con procedencia cuenta con precedentes en dominios maduros (apartado I.1.3) | Se funda el diseño de la salida en esos precedentes y se encuadra el proyecto como aplicación de una práctica reconocida |
| O4. La consulta programática y la delegación integran la práctica declarada que recoge el apartado II.3.3 | Sostiene la línea de comandos del apartado I.6.5. En la modificación, la verificación declarativa resulta insuficiente ante los éxitos declarados falsos (apartado I.3.2). La atribución acierta con el ejecutor principal (Anexo VI, A.VI.2) |
| A1. Los proveedores pueden ampliar las funciones existentes de procedencia y evaluación de acciones, descriptas en la Tabla 15 | Sostiene el diferencial combinado de la Tabla 15 y su criterio de aceptación por declaración (Anexo III, D-59) |
| A2. Los cambios de versión introducen un riesgo de obsolescencia (apartado I.1.4) | Impone la versión congelada, la declaración de la versión resuelta y la verificación de cada caso antes de medir |
| A4. La delegación de la configuración puede reducir la consulta manual, según la práctica declarada del apartado II.3.3 | La verificabilidad sostiene la justificación del proyecto ante esa reducción, conforme al apartado II.6.3 |

*Tabla 17. Matriz FODA con implicancia decisoria por elemento. Fuente: elaboración propia.*

### II.5.5 · Encuadre del sector del cual provienen los recursos

El encuadre de los recursos retoma el sector y el propósito definidos en el apartado II.5.1. El Informe Grupal de Encuadre Común corresponde a los dos proyectos del grupo, RIGE y CODI, con la coautoría declarada en el Anexo III, A.III.5.

| **Parámetro** | **Valor** | **Método, universo y período de referencia** |
|---------------|-----------|----------------------------------------------|
| Facturación del sector | [DATO PENDIENTE: parámetros del sector de los recursos, del Informe Grupal de Encuadre Común] | Fuente, método, universo y período pendientes |
| Empleo del sector | [DATO PENDIENTE: parámetros del sector de los recursos, del Informe Grupal de Encuadre Común] | Fuente, método, universo y período pendientes |
| Exportaciones del sector | [DATO PENDIENTE: parámetros del sector de los recursos, del Informe Grupal de Encuadre Común] | Fuente, método, universo y período pendientes |
| Costo de la hora de desarrollo de referencia | [DATO PENDIENTE: parámetros del sector de los recursos, del Informe Grupal de Encuadre Común] | Fuente, método, universo y período pendientes |
| Disponibilidad de perfiles en Posadas y en el Nordeste | [DATO PENDIENTE: parámetros del sector de los recursos, del Informe Grupal de Encuadre Común] | Fuente, método, universo y período pendientes |

*Tabla 18. Parámetros del sector de los recursos. Fuente prevista: Informe Grupal de Encuadre Común; coautoría declarada en el Anexo III.*

El marco promocional de la actividad corresponde a la Ley N.º 27.506 de Promoción de la Economía del Conocimiento, y la articulación institucional regional se canaliza a través de CESSI y de los polos tecnológicos del Nordeste. La fundamentación sectorial de la factibilidad queda pendiente hasta disponer de los parámetros y sus fuentes. Su incorporación alimenta el capítulo de recursos.

### II.5.6 · Lectura preliminar de la rivalidad del sector

Las cinco fuerzas competitivas (Porter, 1980) orientan la lectura preliminar; su consolidación como análisis de rivalidad amplificada corresponde al apartado IV.3. La rivalidad entre las soluciones relevadas sobre OpenCode es baja, conforme al Instrumento 33, porque su cobertura deja vacante la combinación diferencial de la Tabla 15. La amenaza de nuevos competidores es alta por las funciones existentes que los proveedores pueden ampliar; sostiene conservar ese diferencial combinado (Anexo III, D-59).

El procedimiento manual con comandos nativos constituye un sustituto. Su delegación en un agente acierta en la atribución con el ejecutor principal (Anexo VI, A.VI.2). Al modificar la configuración, la verificación declarativa resulta insuficiente en los éxitos declarados falsos observados (apartado I.3.2). La práctica de consulta y delegación del equipo relevado consta en el apartado II.3.3. El costo se controla mediante la salvaguarda del apartado I.3.4.

Otro sustituto de bajo costo de adopción consiste en instruir al agente para que pruebe el efecto ejecutando OpenCode. El contraste y su interpretación se establecen en el apartado I.3.4. Si alcanza la meta sin RIGE, el aporte frente a esa alternativa se acredita en el diagnóstico de RF-07 y en el costo comparado entre los procedimientos (Anexo III, D-41).
