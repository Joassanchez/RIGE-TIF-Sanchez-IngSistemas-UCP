# Lista filtrada de entidades del dominio

> Hoja del Libro de trabajo · Instrumento 28. Migrado de Cap. III, III.2.2 y Anexo V, A.V.3. Fuente para `/exportar libro`.

## Entidades y candidatas descartadas (III.2.2)

El modelado sigue el procedimiento de identificación de sustantivos del dominio (Larman, 2004). Los sustantivos se recolectan del vocabulario que la herramienta efectivamente emplea, tomado del esquema de configuración publicado, del código fuente analizado en el Anexo VI, A.VI.3 y de la documentación de la versión 1.18.25, y se contrastan con los términos que la referente utiliza (Evans, 2003). Cada candidata se somete a tres pruebas (identidad propia, datos y reglas propios, y pertenencia al recorte delimitado) e ingresa como entidad solo si las satisface todas. Los atributos de cada entidad constan en el Anexo V. El vocabulario procede de la herramienta, porque RIGE carece de implantación organizacional. Entrada, Declaración, Sustitución y Regla de permiso son representaciones registradas en una resolución; el archivo original pertenece al entorno.

Resolución y Hallazgo son registros con identidad que el sistema recuerda. La Consulta de permiso es un producto transitorio. El agente configurado pertenece al dominio; el agente externo que escribe y consulta pertenece al entorno.

| **Entidad**              | **Definición operativa**                                                                             | **¿Identidad propia?** | **¿Datos y reglas propios?** | **¿Dentro del recorte?** | **Fuente que la acredita**       | **Relaciones principales**                                                      |
|--------------------------|------------------------------------------------------------------------------------------------------|---|---|---|----------------------------------|---------------------------------------------------------------------------------|
| Proyecto analizado       | Contexto de resolución de la configuración, con su árbol de trabajo                            | Sí | Sí | Sí | A.VI.3, resultado 1               | Se resuelve en muchas resoluciones                                              |
| Resolución               | Estado efectivo del ecosistema obtenido en un momento determinado                                    | Sí | Sí | Sí | A.VI.3, resultados 1 y 3          | Lee muchas entradas; comprende muchos elementos; produce muchos hallazgos                                   |
| Entrada de configuración | Representación de una vía de incorporación de configuración, registrada por resolución, sea o no un archivo | Sí | Sí | Sí | A.VI.3, resultado 1               | Contiene ninguna o muchas declaraciones                                                   |
| Declaración              | Representación de una asignación escrita dentro de una entrada, registrada en una resolución                                                    | Sí | Sí | Sí | A.VI.3, resultados 3 y 6          | Compone uno o muchos elementos; puede desplazar a otra declaración; contiene sustituciones |
| Sustitución              | Representación del reemplazo de una variable de entorno o de un archivo dentro de una declaración, registrada en una resolución                       | Sí | Sí | Sí | A.VI.3, resultado 13              | Pertenece a una declaración; puede originar un hallazgo sobre ella              |
| Elemento                 | Unidad identificable de configuración, como un agente, un comando o una skill, que RIGE resuelve y relaciona                | Sí | Sí | Sí | A.VI.3, resultado 1; apartado I.6.1, Tabla 6 | Se compone de ninguna o muchas declaraciones; se relaciona con otros elementos  |
| Agente                   | Especialización de Elemento sobre la cual se manifiesta el efecto de toda la configuración           | Sí | Sí | Sí | A.VI.3, resultados 5 y 12         | Evalúa una cadena de reglas; lanza muchos subagentes y puede ser lanzado por muchos agentes                                  |
| Regla de permiso         | Representación registrada en una resolución de una regla nativa o declarada que produce una decisión de permiso | Sí | Sí | Sí | A.VI.3, resultados 5, 7 y 8; segunda extensión del acta del 15/10/2026 | Rige sobre uno o muchos agentes; su pertenencia a la cadena tiene posición y carácter efectivo; si es declarada, proviene de una declaración |
| Hallazgo                 | Defecto detectado en el ecosistema, con su localización                                              | Sí | Sí | Sí | A.VI.3, resultados 3, 5, 13 y 14      | Recae sobre un elemento, una declaración, una entrada, una sustitución o una regla de permiso, pendiente de revalidación (R-11) |

*Tabla 2. Entidades del dominio, con su fuente y sus relaciones principales. Fuente: elaboración propia sobre el relevamiento técnico del Anexo VI, A.VI.3.*

Las candidatas descartadas se conservan con su reclasificación, dado que el descarte documentado es lo que permite defender la delimitación adoptada.

| **Candidata**                                      | **¿Identidad propia?** | **¿Datos y reglas propios?** | **¿Dentro del recorte?** | **Reclasificación**                               | **Criterio**                                                                    |
|----------------------------------------------------|---|---|---|---------------------------------------------------|---------------------------------------------------------------------------------|
| Valor efectivo | No | No se evalúa | No se evalúa | Atributo de otra entidad | Atributo derivado por agente y clave en cada resolución |
| Procedencia | No | No se evalúa | No se evalúa | Atributo de otra entidad | Atributo del elemento, junto con su valor efectivo: es la cadena que conduce a la declaración determinante, no una cosa del dominio |
| Archivo | No | No se evalúa | No | Atributo de otra entidad | Atributo de la entrada (su ruta). Como objeto del disco pertenece al entorno: el sistema lo recibe ya formado y no lo modifica |
| Consulta de permiso | No | No se evalúa | No se evalúa | Producto del sistema | Producto transitorio con acción y decisión de permiso; pendiente de revalidación (R-11) |
| Acción | No | Sí: tipo, sujeto y forma de ruta; RD-08 | Sí | Atributo de otra entidad | Atributo de la Consulta de permiso, sin identidad conservada |
| Decisión de permiso | No | Sí: resultado y regla determinante derivados | Sí | Atributo de otra entidad | Atributo de la Consulta de permiso, sin identidad conservada |
| Desarrollador | No se evalúa | No se evalúa | No | Elemento del entorno | Actor externo, conforme al apartado III.1 |
| Agente que consume la salida por línea de comandos | No se evalúa | No se evalúa | No | Elemento del entorno | Sistema vecino, conforme al apartado III.1 (E-01) |
| Versión de OpenCode | No | No | No se evalúa | Atributo de otra entidad | Atributo de la resolución y del proyecto analizado; opera además como restricción del entorno. No posee datos ni reglas propios dentro del sistema |
| Credencial de autenticación | No se evalúa | No se evalúa | No | Elemento del entorno | Excluida del alcance, conforme al apartado III.4 (L-03) |

*Tabla 3. Candidatas descartadas con su reclasificación. Fuente: elaboración propia.*

Una candidata se descarta en cuanto no satisface una de las tres pruebas. Para Acción y Decisión de permiso se registran los tres filtros para explicitar su reclasificación como atributos del producto Consulta de permiso. Las pruebas se marcan según el criterio de reclasificación de cada candidata.

Una sola especialización se declara en el modelo. El Agente se modela como entidad diferenciada porque concentra comportamiento que los demás elementos no poseen (la cadena ordenada de reglas de permiso, las denegaciones que se agregan a los subagentes que lanza y el conjunto de instrucciones aplicables) y porque constituye el eje de la representación. Los restantes tipos comparten el mismo tratamiento de resolución y relación, de modo que no justifican entidades separadas.

## Atributos de las entidades (A.V.3)

| **Entidad**              | **Atributos**                                                                                                                                     |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| Proyecto analizado       | Ruta raíz, árbol de trabajo, versión de OpenCode detectada                                                                                                          |
| Resolución               | Fecha y hora, versión de la herramienta, resumen del conjunto de entradas leídas                                                                  |
| Entrada de configuración | Resolución a la que pertenece, tipo, orden de precedencia, ruta si corresponde, estado de legibilidad                                                                            |
| Declaración              | Clave, valor declarado, línea y columna, estado determinante o desplazada                                                                         |
| Sustitución              | Origen, condición de definida o no definida                                                                                                       |
| Elemento | Tipo, nombre, valor efectivo derivado por agente y clave en cada resolución, procedencia, estado de uso |
| Agente                   | Modelo efectivo, instrucciones aplicables de alcance global y de proyecto en orden, cadena de reglas de permiso, condición de subagente invocable |
| Regla de permiso         | Patrón de coincidencia, decisión, carácter nativo o declarado. Posición y estado efectiva o sin efecto: atributos de su pertenencia a la cadena de cada agente                                |
| Hallazgo                 | Tipo, elemento, declaración, entrada, sustitución o regla de permiso sobre la que recae, localización, severidad; ampliación pendiente de revalidación (R-11) |

*Tabla A.V.3. Atributos de las entidades del dominio. Fuente: elaboración propia.*

La Consulta de permiso es un producto transitorio, con acción (tipo de permiso, sujeto y forma de la ruta) y decisión de permiso como atributos. RD-08 regula la evaluación del sujeto de la acción; la precisión queda pendiente de revalidación (R-11).

## Relaciones del dominio (III.2.3)

| **Relación**                                                                                         | **Multiplicidad** |
|------------------------------------------------------------------------------------------------------|-------------------|
| Un proyecto analizado se resuelve en muchas resoluciones sucesivas                                   | 1 a 1..*          |
| Una resolución lee muchas entradas de configuración                                                  | 1 a 1..*          |
| Una resolución comprende uno o muchos elementos, declarados o incorporados por la herramienta | 1 a 1..* |
| Una entrada contiene ninguna o muchas declaraciones (una entrada vacía o ilegible no aporta declaraciones) | 1 a 0..* |
| Una declaración contiene ninguna o muchas sustituciones                                              | 1 a 0..*          |
| Una declaración puede quedar desplazada por la siguiente declaración de mayor precedencia en la cadena                    | 0..1 a 0..1       |
| Un elemento se compone de cero o más declaraciones, con a lo sumo una determinante por clave del elemento, pendiente de revalidación (R-11). Una declaración global compone uno o muchos elementos; sin declaración rige el valor implícito | 1..* a 0..* |
| Un elemento se relaciona con muchos otros elementos, con un tipo de relación declarado               | 0..* a 0..*       |
| Un agente evalúa una cadena ordenada de reglas de permiso; una regla rige sobre uno o muchos agentes | 1..* a 1..* {ordenada} |
| Una declaración origina ninguna o muchas reglas de permiso; una regla nativa no proviene de ninguna declaración | 0..1 a 0..* |
| Un agente puede lanzar muchos subagentes y un subagente puede ser lanzado por muchos agentes; el subagente se rige por su propio conjunto de reglas (RD-05)                             | 0..* a 0..* |
| Una resolución produce ninguno o muchos hallazgos                                                    | 1 a 0..*          |
| Un hallazgo recae sobre un elemento, una declaración, una entrada, una sustitución o una regla de permiso, pendiente de revalidación (R-11) | 0..* a 1 {xor: elemento, declaración, entrada, sustitución o regla de permiso} |

*Tabla A.V.4. Relaciones del dominio y sus multiplicidades. Fuente: elaboración propia; precisiones aceptadas (Anexo III, D-61).*

Entrada se registra por resolución. El valor efectivo y la declaración determinante corresponden a cada agente y clave. La relación «desplaza» enlaza declaraciones consecutivas y se recorre en cadena. La posición y el carácter efectivo de una regla pertenecen a su pertenencia a la cadena de cada agente.
