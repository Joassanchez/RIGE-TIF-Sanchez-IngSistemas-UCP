## III.5 · Catálogo de requisitos

El catálogo comprende veintisiete requisitos, diecisiete funcionales y diez no funcionales de seguridad, fiabilidad, mantenibilidad, portabilidad, rendimiento y cumplimiento normativo, validados con la referente en el acta (Anexo II, A.II.1). La prioridad sigue MoSCoW (Clegg y Barker, 1994): 18 Must, 6 Should, 2 Could y 1 Won't; los Must coinciden con el producto mínimo viable de V.5 y las capacidades diferidas se incluyen como Could o Won't.

Cada requisito se origina en un resultado del relevamiento técnico, un hallazgo del análisis o un acuerdo del acta. Las fichas y la matriz de trazabilidad en doble vía constan en el Anexo I.

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

*Tabla 6. Síntesis del catálogo de requisitos. Fichas completas en el Anexo I. Fuente: elaboración propia.*
