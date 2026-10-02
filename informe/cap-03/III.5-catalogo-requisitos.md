## III.5 · Catálogo de requisitos

El catálogo comprende veintisiete requisitos: diecisiete funcionales y diez no funcionales, estos últimos distribuidos en las categorías de seguridad, fiabilidad, mantenibilidad, portabilidad, rendimiento y cumplimiento normativo. Dieciocho llevan prioridad Must, seis Should, dos Could y uno Won't; el conjunto de los Must coincide de manera exacta con el producto mínimo viable descrito en el apartado V.5. La escala de prioridad es MoSCoW (Clegg y Barker, 1994), y las capacidades que el apartado III.3 declara diferidas se incorporan con prioridad Could o Won't en lugar de omitirse, de modo que el catálogo cubra la totalidad de las funciones declaradas en el informe de la AE1 y haga explícito qué queda fuera del período. Los veintisiete requisitos constan validados con la referente en el acta de validación, que se conserva en el Portafolio Digital.

Cada requisito enuncia una capacidad o una restricción delimitada y se construyó a partir de un resultado verificado del relevamiento técnico, de un hallazgo del análisis o de un acuerdo del acta de validación. Doce se trazan a resultados del relevamiento técnico, siete a hallazgos del análisis, dieciocho a acuerdos del acta de validación y de su extensión, diez a funciones o apartados del informe de la AE1 y uno a una decisión del Anexo III; varios concurren a más de un origen. Las fronteras que delimitan el catálogo constan en el apartado III.4, cada una con su validador y su constancia. Las fichas, que sintetizan seis campos por requisito de los once que fija la cátedra y que el Libro de trabajo contiene completos, con los criterios de aceptación presentados numerados, y la matriz de trazabilidad en doble vía constan en el Anexo I.

RF-15, de prioridad Won't, no lleva criterio de aceptación en el período y no se computa en los controles del catálogo.

| **Cód.** | **Enunciado sintético**                                                                        | **Tipo**       | **Prioridad** |
|----------|------------------------------------------------------------------------------------------------|----------------|---------------|
| RF-01    | Valor efectivo de cada clave de un agente, o de la solicitada, con su procedencia y las declaraciones desplazadas | Funcional      | Must          |
| RF-02    | Decisión de permiso para una acción, con la cadena de reglas, la determinante y su explicación | Funcional      | Must          |
| RF-03    | Consulta de valores y de permisos por línea de comandos, con salida estructurada, determinista y versionada | Funcional      | Must          |
| RF-04    | Descubrimiento de las entradas aplicables, con precedencia y legibilidad                       | Funcional      | Must          |
| RF-05    | Rechazo de los resultados ante una versión de OpenCode distinta de la 1.18.25                                | Funcional      | Must          |
| RF-06    | Distinción de valores implícitos y de reglas nativas                                           | Funcional      | Must          |
| RF-07    | Detección de los seis tipos de hallazgo, con su localización y su explicación                  | Funcional      | Must          |
| RF-08    | Advertencia ante un comando de terminal compuesto                                              | Funcional      | Must          |
| RF-09    | Advertencia cuando una declaración del usuario desactiva una protección nativa                 | Funcional      | Must          |
| RF-10    | Efecto de la decisión sobre la disponibilidad de la herramienta                                | Funcional      | Should        |
| RF-11    | Resumen del ecosistema por tipo de elemento y por tipo de hallazgo                             | Funcional      | Should        |
| RF-12    | Localización de cada declaración en el formato ruta:línea:columna                              | Funcional      | Should        |
| RF-13    | Relaciones entre los elementos del ecosistema                                                  | Funcional      | Could         |
| RF-14    | Estado resuelto completo por línea de comandos                                                 | Funcional      | Could         |
| RF-15    | Matriz de agentes por tipo de permiso y consulta inversa por acción                            | Funcional      | Won't         |
| RF-16    | Listado de los agentes del proyecto, declarados e incorporados por la herramienta              | Funcional      | Must          |
| RF-17    | Conservación y recuperación de cada resolución con su fecha y el resumen de las entradas leídas | Funcional      | Must          |
| RNF-01   | Solo lectura sobre las entradas de configuración                                               | Seguridad      | Must          |
| RNF-02   | Fidelidad de la resolución respecto de OpenCode 1.18.25                                        | Fiabilidad     | Must          |
| RNF-03   | Independencia del núcleo respecto del adaptador                                                | Mantenibilidad | Must          |
| RNF-04   | No exposición del contenido incorporado por sustitución de variables de entorno o de archivos | Seguridad      | Must          |
| RNF-05   | Ausencia de conexiones salientes durante el análisis                                           | Seguridad      | Must          |
| RNF-06   | Resolución de rutas en Ubuntu 26.04 y Windows 11, con instalación sin privilegios              | Portabilidad   | Should        |
| RNF-07   | Tiempo máximo de una consulta por línea de comandos                                            | Rendimiento    | Should        |
| RNF-08   | Compatibilidad del esquema de salida entre versiones                                           | Mantenibilidad | Should        |
| RNF-09   | Atención exclusiva de solicitudes dirigidas a la dirección local por la interfaz web           | Seguridad      | Must          |
| RNF-10   | Conservación del aviso y la licencia del código incorporado                                    | Cumplimiento normativo | Must          |

*Tabla 9. Síntesis del catálogo de requisitos. Fichas completas en el Anexo I. Fuente: elaboración propia.*

Cuatro precisiones completan el contenido del catálogo.

La primera se refiere a los tipos de hallazgo. Un hallazgo es un defecto detectado en el ecosistema, con su localización (apartado III.2, Tabla 2), y su tipo es la categoría que le corresponde según su causa. El RF-07 reconoce seis tipos: referencias no resueltas, reglas de permiso sin efecto, elementos sin uso, sustituciones sin valor, entradas ilegibles y entradas descartadas sin error visible.

La segunda se refiere a la explicación en lenguaje natural que acompaña las decisiones de permiso y los hallazgos en ambas interfaces, y por línea de comandos a pedido. La explicación se genera mediante plantillas deterministas sobre el rastro de la resolución, sin intervención de un modelo de lenguaje, dado que un modelo exigiría conexión saliente, produciría salidas variables ante entradas idénticas e impediría verificar el resultado.

La tercera se refiere a los valores de los dos requisitos no funcionales que dependen del entorno de medición. El RNF-06 se acredita sobre Ubuntu 26.04, plataforma de referencia, y sobre Windows 11; macOS queda sin acreditar en el período. Su ficha en el Anexo I declara magnitud, unidad y condición de medición, sin las cuales un requisito no funcional no constituye un requisito no funcional. El RNF-07 fija un tiempo máximo de 2 s por consulta por línea de comandos, umbral y unidad validados en el acta del 26/09/2026. La referente no informa el tamaño de su proyecto en la sesión del 26/09/2026 (acta, sección 3.2), por lo que rige el proyecto público de referencia. Se selecciona openchamber (openchamber, 2026), el repositorio público de configuración de proyecto en uso con más agentes entre los que arroja la búsqueda de repositorios de GitHub, conforme al criterio adoptado (Anexo III, D-57). El proyecto de referencia tiene el doble de tamaño que el mayor entre ese proyecto público y el del equipo de la referente, si esta lo informa. La medición se realiza en el contenedor Ubuntu 26.04 de referencia (Anexo III, D-47, D-28 y D-29), cuyos recursos se registran al construir la imagen.

La cuarta se refiere a la categoría del RNF-08, que se clasifica en mantenibilidad porque expresa una política de evolución que permite modificar el esquema de salida sin romper a su consumidor. La norma ISO/IEC 25010 ubica la compatibilidad como una característica propia del modelo de calidad de producto (International Organization for Standardization [ISO] e International Electrotechnical Commission [IEC], 2023), pero esa categoría no integra la lista de la cátedra.
