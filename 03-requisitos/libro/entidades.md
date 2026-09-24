# Lista filtrada de entidades del dominio

> Hoja del Libro de trabajo · Instrumento 28. Migrado de Cap. III, III.2.2 y Anexo V, A.V.3. Fuente para `/exportar libro`.

## Entidades y candidatas descartadas (III.2.2)

El modelado sigue el procedimiento de identificación de sustantivos del dominio (Larman, 2004; Evans, 2003). Los sustantivos se recolectan del vocabulario que la herramienta efectivamente emplea, tomado del esquema de configuración publicado, del código fuente analizado en el Anexo I, A.I.3 del informe de la AE1 y de la documentación de la versión 1.18.25, y se contrastan con los términos que el referente utiliza. Cada candidata se somete a tres pruebas —identidad propia, datos y reglas propios, y pertenencia al recorte delimitado— e ingresa como entidad solo si las satisface todas. Los atributos de cada entidad constan en el Anexo V.

| **Entidad**              | **Definición operativa**                                                                             | **Fuente que la acredita**       | **Relaciones principales**                                                      |
|--------------------------|------------------------------------------------------------------------------------------------------|----------------------------------|---------------------------------------------------------------------------------|
| Proyecto analizado       | Contexto sobre el cual se resuelve el estado efectivo de la configuración                            | A.I.3, resultado 1               | Se resuelve en muchas resoluciones                                              |
| Resolución               | Estado efectivo del ecosistema obtenido en un momento determinado                                    | A.I.3, resultados 1 y 3          | Lee muchas entradas; produce muchos hallazgos                                   |
| Entrada de configuración | Vía por la cual OpenCode incorpora configuración al resolver el estado efectivo, sea o no un archivo | A.I.3, resultado 1               | Contiene muchas declaraciones                                                   |
| Declaración              | Asignación concreta escrita dentro de una entrada                                                    | A.I.3, resultados 3 y 6          | Compone un elemento; puede desplazar a otra declaración; contiene sustituciones |
| Sustitución              | Reemplazo de una variable de entorno o de un archivo dentro de una declaración                       | A.I.3, resultado 13              | Pertenece a una declaración; origina hallazgos                                  |
| Elemento                 | Unidad de configuración que RIGE resuelve y relaciona, cuyo tipo declara el adaptador                | A.I.3, resultado 1; AE1, Tabla 7 | Se compone de declaraciones; se relaciona con otros elementos                   |
| Agente                   | Especialización de Elemento sobre la cual se manifiesta el efecto de toda la configuración           | A.I.3, resultados 5 y 12         | Evalúa una cadena de reglas; invoca subagentes                                  |
| Regla de permiso         | Declaración que produce una decisión de permiso, de carácter nativo o declarado por el usuario       | A.I.3, resultados 5, 7 y 8       | Rige sobre agentes; ocupa una posición en la cadena                             |
| Hallazgo                 | Defecto detectado en el ecosistema, con su localización                                              | A.I.3, resultados 3, 5 y 13      | Recae sobre un elemento o una declaración                                       |

*Tabla 2. Entidades del dominio, con su fuente y sus relaciones principales. Fuente: elaboración propia sobre el relevamiento técnico del Anexo I, A.I.3 del informe de la AE1.*

Las candidatas descartadas se conservan con su reclasificación, dado que el descarte documentado es lo que permite defender la delimitación adoptada.

| **Candidata**                                      | **Reclasificación**                               | **Criterio**                                                                    |
|----------------------------------------------------|---------------------------------------------------|---------------------------------------------------------------------------------|
| Valor efectivo                                     | Producto del sistema                              | Resulta de la resolución y carece de identidad fuera de ella                    |
| Procedencia                                        | Atributo del valor efectivo                       | Es la cadena que conduce a la declaración determinante, no una cosa del dominio |
| Archivo                                            | Atributo de Entrada, y elemento del entorno       | El sistema lo padece: lo recibe ya formado y no lo modifica                     |
| Consulta de permiso                                | Producto del sistema                              | Sus datos son referencias a otras entidades; no posee datos propios             |
| Desarrollador                                      | Actor externo                                     | Pertenece al entorno, conforme al apartado III.1                                |
| Agente que consume la salida por línea de comandos | Sistema vecino                                    | Pertenece al entorno, conforme al apartado III.1                                |
| Versión de OpenCode                                | Atributo de Resolución, y restricción del entorno | No posee datos ni reglas propias dentro del sistema                             |
| Credencial de autenticación                        | Fuera del recorte                                 | Excluida del alcance, conforme al apartado III.4                                |

*Tabla 3. Candidatas descartadas con su reclasificación. Fuente: elaboración propia.*

Una sola especialización se declara en el modelo. El Agente se modela como entidad diferenciada porque concentra comportamiento que los demás elementos no poseen —la cadena ordenada de reglas de permiso, la herencia de denegaciones hacia los subagentes que puede invocar y el conjunto de instrucciones aplicables— y porque constituye el eje de la representación. Los restantes tipos comparten el mismo tratamiento de resolución y relación, de modo que no justifican entidades separadas.

## Atributos de las entidades (A.V.3)

| **Entidad**              | **Atributos**                                                                                                                                     |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| Proyecto analizado       | Ruta raíz, versión de OpenCode detectada                                                                                                          |
| Resolución               | Fecha y hora, versión de la herramienta, resumen del conjunto de entradas leídas                                                                  |
| Entrada de configuración | Tipo, orden de precedencia, ruta si corresponde, estado de legibilidad                                                                            |
| Declaración              | Clave, valor declarado, línea y columna, estado determinante o desplazada                                                                         |
| Sustitución              | Origen, condición de definida o no definida                                                                                                       |
| Elemento                 | Tipo, nombre, valor efectivo, estado de uso                                                                                                       |
| Agente                   | Modelo efectivo, instrucciones aplicables de alcance global y de proyecto en orden, cadena de reglas de permiso, condición de subagente invocable |
| Regla de permiso         | Patrón de coincidencia, decisión, posición en la cadena, carácter nativo o declarado, estado efectiva o sin efecto                                |
| Hallazgo                 | Tipo, elemento o declaración sobre el que recae, localización, severidad                                                                          |

*Tabla A.V.3. Atributos de las entidades del dominio. Fuente: elaboración propia.*
