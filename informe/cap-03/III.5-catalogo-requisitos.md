## III.5 · Catálogo de requisitos

El catálogo comprende veintitrés requisitos: quince funcionales y ocho no funcionales, estos últimos distribuidos en las categorías de seguridad, fiabilidad, mantenibilidad, portabilidad, rendimiento y compatibilidad. Quince llevan prioridad Must, cuatro Should, tres Could y uno Won't; el conjunto de los Must coincide de manera exacta con el producto mínimo viable descrito en el apartado V.5. La escala de prioridad es MoSCoW (Clegg y Barker, 1994), y las capacidades que el apartado III.3 declara diferidas se incorporan con prioridad Could o Won't en lugar de omitirse, de modo que el catálogo cubra la totalidad de las funciones declaradas en el informe de la AE1 y haga explícito qué queda fuera del período.

Cada requisito enuncia una sola capacidad o una sola restricción y se construyó a partir de un resultado verificado del relevamiento técnico, de un hallazgo del análisis o de un acuerdo del acta de validación. Dieciséis se trazan a resultados del relevamiento técnico, cuatro a hallazgos del análisis y seis incorporan acuerdos validados con el referente; algunos concurren a más de un origen. La totalidad de las fronteras que delimitan el catálogo, declaradas en el apartado III.4, se validó en esa misma sesión. Las fichas completas, con los seis campos de cada requisito, y la matriz de trazabilidad en doble vía constan en el Anexo I.

| **Cód.** | **Enunciado sintético**                                                                        | **Tipo**       | **Prioridad** |
|----------|------------------------------------------------------------------------------------------------|----------------|---------------|
| RF-01    | Valor efectivo de una clave, con su procedencia y las declaraciones desplazadas                | Funcional      | Must          |
| RF-02    | Decisión de permiso para una acción, con la cadena de reglas, la determinante y su explicación | Funcional      | Must          |
| RF-03    | Salida estructurada y determinista por línea de comandos                                       | Funcional      | Must          |
| RF-04    | Descubrimiento de las entradas aplicables, con precedencia y legibilidad                       | Funcional      | Must          |
| RF-05    | Advertencia ante una versión de OpenCode distinta de la 1.18.25                                | Funcional      | Must          |
| RF-06    | Distinción de valores implícitos y de reglas nativas                                           | Funcional      | Must          |
| RF-07    | Detección de los seis tipos de hallazgo, con su localización y su explicación                  | Funcional      | Must          |
| RF-08    | Advertencia ante un comando de terminal compuesto                                              | Funcional      | Must          |
| RF-09    | Advertencia cuando una declaración del usuario desactiva una protección nativa                 | Funcional      | Must          |
| RF-10    | Efecto de la decisión sobre la disponibilidad de la herramienta                                | Funcional      | Must          |
| RF-11    | Resumen del ecosistema por tipo de elemento y por tipo de hallazgo                             | Funcional      | Should        |
| RF-12    | Apertura de la declaración determinante en el editor                                           | Funcional      | Could         |
| RF-13    | Relaciones entre los elementos del ecosistema                                                  | Funcional      | Could         |
| RF-14    | Exportación del estado resuelto a un archivo                                                   | Funcional      | Could         |
| RF-15    | Matriz de agentes por tipo de permiso y consulta inversa por acción                            | Funcional      | Won't         |
| RNF-01   | Solo lectura sobre las entradas de configuración                                               | Seguridad      | Must          |
| RNF-02   | Fidelidad de la resolución respecto de OpenCode 1.18.25                                        | Fiabilidad     | Must          |
| RNF-03   | Independencia del núcleo respecto del adaptador                                                | Mantenibilidad | Must          |
| RNF-04   | No exposición del contenido de las variables de entorno                                        | Seguridad      | Must          |
| RNF-05   | Ausencia de conexiones salientes durante el análisis                                           | Seguridad      | Must          |
| RNF-06   | Resolución de rutas por sistema operativo                                                      | Portabilidad   | Should        |
| RNF-07   | Tiempo máximo de resolución sobre un equipo de referencia                                      | Rendimiento    | Should        |
| RNF-08   | Estabilidad del esquema de salida por línea de comandos                                        | Compatibilidad | Should        |

*Tabla 9. Síntesis del catálogo de requisitos. Fichas completas en el Anexo I. Fuente: elaboración propia.*

Dos precisiones sobre el contenido del catálogo. La primera se refiere a la explicación en lenguaje natural que acompaña las decisiones de permiso y los hallazgos: se genera mediante plantillas deterministas sobre el rastro de la resolución, sin intervención de un modelo de lenguaje, dado que un modelo exigiría conexión saliente, produciría salidas variables ante entradas idénticas e impediría verificar el resultado. La segunda se refiere a los dos requisitos no funcionales que conservan un valor por declarar: el RNF-06 requiere fijar las plataformas sobre las que se acredita la portabilidad, y el RNF-07 el tamaño del proyecto de prueba, el equipo de referencia y el tiempo máximo admitido. Ambos valores se establecen antes del cierre de la primera iteración y se registran en el catálogo del Anexo I, dado que un requisito no funcional sin magnitud, unidad y condición de medición no constituye un requisito no funcional.
