# Lista filtrada de entidades del dominio

> Hoja del Libro de trabajo · Instrumento 28. Migrado de Cap. III, III.2.2 y Anexo V, A.V.3. Fuente para `/exportar libro`.

## Entidades y candidatas descartadas (III.2.2)

El modelado sigue el procedimiento de identificación de sustantivos del dominio (Larman, 2004; Evans, 2003). Los sustantivos se recolectan del vocabulario que la herramienta efectivamente emplea, tomado del esquema de configuración publicado, del código fuente analizado en el Anexo I, A.I.3 del informe de la AE1 y de la documentación de la versión 1.18.25, y se contrastan con los términos que la referente utiliza. Cada candidata se somete a tres pruebas —identidad propia, datos y reglas propios, y pertenencia al recorte delimitado— e ingresa como entidad solo si las satisface todas. Los atributos de cada entidad constan en el Anexo V.

| **Entidad**              | **Definición operativa**                                                                             | **Fuente que la acredita**       | **Relaciones principales**                                                      |
|--------------------------|------------------------------------------------------------------------------------------------------|----------------------------------|---------------------------------------------------------------------------------|
| Proyecto analizado       | Contexto sobre el cual se resuelve el estado efectivo de la configuración                            | A.I.3, resultado 1               | Se resuelve en muchas resoluciones                                              |
| Resolución               | Estado efectivo del ecosistema obtenido en un momento determinado                                    | A.I.3, resultados 1 y 3          | Lee muchas entradas; comprende muchos elementos; produce muchos hallazgos                                   |
| Entrada de configuración | Vía por la cual OpenCode incorpora configuración al resolver el estado efectivo, sea o no un archivo | A.I.3, resultado 1               | Contiene ninguna o muchas declaraciones                                                   |
| Declaración              | Asignación concreta escrita dentro de una entrada                                                    | A.I.3, resultados 3 y 6          | Compone un elemento; puede desplazar a otra declaración; contiene sustituciones |
| Sustitución              | Reemplazo de una variable de entorno o de un archivo dentro de una declaración                       | A.I.3, resultado 13              | Pertenece a una declaración; puede originar un hallazgo sobre ella              |
| Elemento                 | Unidad de configuración que RIGE resuelve y relaciona, cuyo tipo declara el adaptador                | A.I.3, resultado 1; AE1, Tabla 6 | Se compone de ninguna o muchas declaraciones; se relaciona con otros elementos  |
| Agente                   | Especialización de Elemento sobre la cual se manifiesta el efecto de toda la configuración           | A.I.3, resultados 5 y 12         | Evalúa una cadena de reglas; invoca muchos subagentes y puede ser invocado por muchos agentes                                  |
| Regla de permiso         | Regla que produce una decisión de permiso, nativa de la herramienta o escrita por el usuario en una declaración | A.I.3, resultados 5, 7 y 8 | Rige sobre uno o muchos agentes; ocupa una posición en la cadena; si es declarada, proviene de una declaración |
| Hallazgo                 | Defecto detectado en el ecosistema, con su localización                                              | A.I.3, resultados 3, 5, 13 y 14      | Recae sobre un elemento, una declaración, una entrada o una sustitución        |

*Tabla 2. Entidades del dominio, con su fuente y sus relaciones principales. Fuente: elaboración propia sobre el relevamiento técnico del Anexo I, A.I.3 del informe de la AE1.*

Las candidatas descartadas se conservan con su reclasificación, dado que el descarte documentado es lo que permite defender la delimitación adoptada.

| **Candidata**                                      | **Reclasificación**                               | **Criterio**                                                                    |
|----------------------------------------------------|---------------------------------------------------|---------------------------------------------------------------------------------|
| Valor efectivo | Atributo de otra entidad | Atributo derivado del elemento que resulta de cada resolución |
| Procedencia | Atributo de otra entidad | Atributo del elemento, junto con su valor efectivo: es la cadena que conduce a la declaración determinante, no una cosa del dominio |
| Archivo | Atributo de otra entidad | Atributo de la entrada (su ruta). Como objeto del disco pertenece al entorno: el sistema lo recibe ya formado y no lo modifica |
| Consulta de permiso                                | Producto del sistema                              | Sus datos son referencias a otras entidades; no posee datos propios             |
| Desarrollador | Elemento del entorno | Actor externo, conforme al apartado III.1 |
| Agente que consume la salida por línea de comandos | Elemento del entorno | Sistema vecino, conforme al apartado III.1 (E-01) |
| Versión de OpenCode | Atributo de otra entidad | Atributo de la resolución y del proyecto analizado; opera además como restricción del entorno. No posee datos ni reglas propios dentro del sistema |
| Credencial de autenticación | Elemento del entorno | Excluida del alcance, conforme al apartado III.4 (L-03) |

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
| Elemento | Tipo, nombre, valor efectivo como atributo derivado del elemento que resulta de cada resolución, procedencia, estado de uso |
| Agente                   | Modelo efectivo, instrucciones aplicables de alcance global y de proyecto en orden, cadena de reglas de permiso, condición de subagente invocable |
| Regla de permiso         | Patrón de coincidencia, decisión, posición en la cadena, carácter nativo o declarado, estado efectiva o sin efecto                                |
| Hallazgo                 | Tipo, elemento, declaración, entrada o sustitución sobre la que recae, localización, severidad                                                                |

*Tabla A.V.3. Atributos de las entidades del dominio. Fuente: elaboración propia.*

## Relaciones del dominio (III.2.3)

| **Relación**                                                                                         | **Multiplicidad** |
|------------------------------------------------------------------------------------------------------|-------------------|
| Un proyecto analizado se resuelve en muchas resoluciones sucesivas                                   | 1 a 1..*          |
| Una resolución lee muchas entradas de configuración                                                  | 1 a 1..*          |
| Una resolución comprende uno o muchos elementos, declarados o incorporados por la herramienta | 1 a 1..* |
| Una entrada contiene ninguna o muchas declaraciones (una entrada vacía o ilegible no aporta declaraciones) | 1 a 0..* |
| Una declaración contiene ninguna o muchas sustituciones                                              | 1 a 0..*          |
| Una declaración puede quedar desplazada por otra declaración de mayor precedencia                    | 0..1 a 0..1       |
| Un elemento se compone de ninguna o muchas declaraciones, de las cuales a lo sumo una resulta determinante; sin declaración rige el valor implícito, y una declaración global compone uno o muchos elementos | 1..* a 0..* |
| Un elemento se relaciona con muchos otros elementos, con un tipo de relación declarado               | 0..* a 0..*       |
| Un agente evalúa una cadena ordenada de reglas de permiso; una regla rige sobre uno o muchos agentes | 1..* a 1..* {ordenada} |
| Una declaración origina ninguna o muchas reglas de permiso; una regla nativa no proviene de ninguna declaración | 0..1 a 0..* |
| Un agente puede invocar muchos subagentes y un subagente puede ser invocado por muchos agentes; en cada invocación, el subagente hereda las reglas de denegación del agente que lo invoca | 0..* a 0..* |
| Una resolución produce ninguno o muchos hallazgos                                                    | 1 a 0..*          |
| Un hallazgo recae sobre un elemento, una declaración, una entrada o una sustitución | 0..* a 1 {xor: elemento, declaración, entrada o sustitución} |

*Tabla 4. Relaciones del dominio y sus multiplicidades. Fuente: elaboración propia; precisiones aceptadas en ADR-074.*
