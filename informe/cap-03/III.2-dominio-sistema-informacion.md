## III.2 · Dominio del Sistema de Información

### III.2.1 · Frontera entre el entorno y el dominio

El dominio es el recorte del mundo que el sistema representa y sobre cuyo estado responde. La frontera aplica una prueba: si RIGE controla el estado de un objeto o lo padece. El archivo de configuración pertenece al entorno, porque RIGE recibe el contenido escrito por otros, mientras que su representación resuelta pertenece al dominio. Esta distinción sostiene el modo de operación de solo lectura del apartado III.4.

### III.2.2 · Entidades del dominio

El modelado identifica sustantivos del dominio (Larman, 2004) a partir del vocabulario del esquema, el código y la documentación de OpenCode 1.18.25 (Anexo VI, A.VI.3), contrastado con la referente para compartir un vocabulario único (Evans, 2003). Cada candidata ingresa como entidad si satisface las tres pruebas de identidad propia, datos y reglas propios y pertenencia al recorte delimitado; sus atributos constan en el Anexo V.

| **Entidad**              | **Definición operativa**                                                                             | **Fuente que la acredita**       | **Relaciones principales**                                                      |
|--------------------------|------------------------------------------------------------------------------------------------------|----------------------------------|---------------------------------------------------------------------------------|
| Proyecto analizado       | Contexto de la configuración analizada                                                               | apartado I.6.4               | Se resuelve en estados efectivos sucesivos                                              |
| Resolución               | Estado efectivo del ecosistema obtenido en un momento determinado                                    | A.VI.3, resultados 1 y 3          | Lee una o más entradas; comprende uno o más elementos; produce cero o más hallazgos                                   |
| Entrada de configuración | Vía por la cual OpenCode incorpora configuración al resolver el estado efectivo, sea o no un archivo | A.VI.3, resultado 1               | Contiene cero o más declaraciones                                                   |
| Declaración              | Asignación concreta escrita dentro de una entrada                                                    | A.VI.3, resultados 3 y 6          | Compone uno o más elementos; desplaza a cero o una declaración; contiene cero o más sustituciones |
| Sustitución              | Reemplazo de una variable de entorno o de un archivo dentro de una declaración                       | A.VI.3, resultado 13              | Pertenece a una declaración; recibe cero o más hallazgos              |
| Elemento                 | Unidad de configuración que RIGE resuelve y relaciona, cuyo tipo declara el adaptador                | A.VI.3, resultado 1; I.6.1, Tabla 6 | Pertenece a una resolución; lo componen cero o más declaraciones; se relaciona con cero o más elementos  |
| Agente                   | Especialización de Elemento sobre la cual se manifiesta el efecto de toda la configuración           | A.VI.3, resultados 5 y 12         | Evalúa una cadena de reglas; lanza cero o más subagentes mediante `task`; cero o más agentes lo lanzan mediante `task` |
| Regla de permiso         | Regla que produce una decisión de permiso, nativa de la herramienta o que el usuario escribe en una declaración | A.VI.3, resultados 5, 7 y 8 | Rige sobre uno o más agentes; ocupa una posición en la cadena; si es declarada, proviene de una declaración |
| Hallazgo                 | Defecto detectado en el ecosistema, con su localización                                              | A.VI.3, resultados 3, 5, 13 y 14      | Recae sobre un elemento, una declaración, una entrada, una sustitución o una regla de permiso, pendiente de revalidación (R-11) |

*Tabla 2. Entidades del dominio, con su fuente y sus relaciones principales. Fuente: elaboración propia sobre el relevamiento técnico del Anexo VI, A.VI.3.*

Agente es la única especialización de Elemento porque concentra la cadena de reglas de permiso, las denegaciones que se agregan a los subagentes y las instrucciones aplicables. Se descartan entidades separadas para los restantes tipos porque comparten el tratamiento de resolución y relación (Anexo III, D-19). El criterio del agente como eje de la representación se fundamenta en I.6.1.

Las candidatas descartadas se conservan con su reclasificación para fundamentar la delimitación adoptada.

| **Candidata**                                      | **Reclasificación**                               | **Criterio**                                                                    |
|----------------------------------------------------|---------------------------------------------------|---------------------------------------------------------------------------------|
| Valor efectivo                                     | Atributo de otra entidad                              | Atributo derivado del elemento, que resulta de cada resolución, igual que la procedencia                    |
| Procedencia | Atributo de otra entidad | Atributo del elemento: cadena que conduce a la declaración determinante |
| Archivo | Atributo de otra entidad | Atributo de la entrada (su ruta); su pertenencia al entorno se fundamenta en III.2.1 |
| Consulta de permiso                                | Producto del sistema                              | Tiene referencias a otras entidades y un atributo propio: la acción (tipo de permiso, sujeto y forma de la ruta), pendiente de revalidación (R-11) |
| Desarrollador | Elemento del entorno | Actor externo, conforme al apartado III.1 |
| Agente que consume la salida por línea de comandos | Elemento del entorno | Sistema vecino, conforme al apartado III.1 (E-01) |
| Versión de OpenCode | Atributo de otra entidad | Atributo de la resolución y del proyecto analizado; opera además como restricción del entorno. No posee datos ni reglas propios dentro del sistema |
| Credencial de autenticación | Elemento del entorno | Excluida del alcance, conforme al apartado III.4 (L-03) |

*Tabla 3. Candidatas descartadas con su reclasificación. Fuente: elaboración propia.*

### III.2.3 · Modelo del dominio

Las relaciones se enuncian como frases del negocio y constan con su multiplicidad en el Anexo V, A.V.4. Once se validan con la referente en la sesión del 26/09/2026, y la relación por la que una declaración origina reglas de permiso, junto con las multiplicidades corregidas, en la extensión del acta del 01/10/2026. La relación entre resolución y elemento se valida en la segunda extensión del acta, del 15/10/2026.

![Modelo del dominio de RIGE](../figuras/cap-03/figura-modelo-dominio.png){width="6in"}

*Figura 1. Modelo del dominio de RIGE. Entidades, relaciones y multiplicidades. Fuente: elaboración propia sobre el relevamiento del Anexo VI, A.VI.3 y el acta de validación.*

La relación reflexiva integra el modelo y representa los vínculos entre elementos (apartado I.6.1, Tabla 6). Sus multiplicidades constan en el Anexo V, A.V.4. La representación de esos vínculos se difiere (RF-13, L-12).

### III.2.4 · Reglas de negocio y glosario

El dominio se gobierna por catorce reglas de negocio: ocho de derivación, tres de restricción y tres de existencia. La referente valida su pertinencia y su expresión en el vocabulario del equipo, con las salvedades de revalidación de la Tabla 4 (Anexo II, A.II.1). La corrección de las reglas de derivación se verifica contra OpenCode 1.18.25 mediante escenarios controlados y lectura del código, según el relevamiento técnico del Anexo VI. La ejecución del 13/10/2026 corrige el error de RD-05 en su redacción validada el 26/09/2026 (Anexo III, D-65). La referente confirma la corrección en la segunda extensión del acta del 15/10/2026, que también valida RE-01, RE-03 y RR-02 en su redacción vigente. El registro completo consta en el Anexo V, A.V.2. La Tabla 4 muestra reglas de los tres tipos e incluye RD-08, pendiente de revalidación (R-11).

| **Cód.** | **Tipo**    | **Enunciado verificable**                                                                                                                                                                         | **Fuente**                        | **Estado**              | **Requisito derivado** |
|----------|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------|-------------------------|------------------------|
| RD-03    | Derivación  | La decisión de permiso resulta de evaluar la cadena ordenada de reglas (nativas generales, nativas del agente, declaradas globales y declaradas del agente) y la determina la última coincidencia | H-05; acta de validación | Validada | RF-02                  |
| RD-08 | Derivación | El sujeto de una acción sobre archivos se evalúa con la ruta relativa al árbol de trabajo | H-24; pendiente de revalidación (R-11) | Pendiente | RF-02 |
| RR-01    | Restricción | RIGE no modifica ninguna entrada de configuración; escribe únicamente en su propio almacén                                                                                                        | Acta de validación, decisión L-01 | Validada                | RNF-01                 |
| RE-02 | Existencia | Una regla se marca sin efecto solo si una regla posterior del mismo tipo abarca todos sus casos o si su patrón declara la ruta absoluta de un archivo o directorio del árbol de trabajo (RF-07). | H-05; Al-Shaer y Hamed (2004); acta de validación; A.VI.8; H-24 | Validada (redacción del 26/09); precisión del 22/10 pendiente de revalidación (R-07) | RF-07 |

*Tabla 4. Reglas de negocio representativas y nueva derivación pendiente de revalidación. Registro completo en el Anexo V. Fuente: elaboración propia.*

El glosario del Anexo V fija el vocabulario del informe. Con la referente se adopta «entrada de configuración» frente a las denominaciones *source*, capa, alcance, nivel y fuente que aparecen en la documentación. Se distingue «permiso», la decisión, de «regla de permiso», la regla nativa o que el usuario escribe en una declaración.
