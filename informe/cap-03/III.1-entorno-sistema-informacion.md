## III.1 · Entorno del Sistema de Información

El entorno comprende los elementos que quedan fuera del control del sistema y condicionan sus decisiones de diseño. La selección aplica un criterio de pertinencia: un elemento integra el entorno solo si su supresión modifica alguna decisión del proyecto. La tabla presenta la fuente que acredita cada elemento[^1] y su implicancia de diseño.

| **Categoría** | **Elemento** | **Fuente (Cap. II / acta)** | **Implicancia de diseño declarada** |
|---|---|---|---|
| Actores externos | Desarrollador que configura su propio entorno de trabajo | apartado I.6.4 (Tabla 9 del informe de la AE1); acta del 26/09/2026, L-13 | El agente es el eje de navegación y las decisiones de permiso y los hallazgos incluyen una explicación de sus motivos. |
| Normas | Licencia MIT de OpenCode | Anexo VII, A.VII.3 | La licencia permite incorporar las funciones de evaluación de permisos con atribución y condiciona el licenciamiento de RIGE. |
| Sistemas vecinos | OpenCode 1.18.25, con su esquema de configuración publicado, su cadencia de versiones y sus modos de ejecución | Anexo VI, A.VI.3 y A.VI.6 | OpenCode es la referencia para verificar la corrección sin que RIGE lo ejecute ni lo modifique, y sus cambios entre versiones obligan a fijar la 1.18.25 y a advertir cuando la instalada difiere. El adaptador resuelve según el comportamiento verificado del código, porque la documentación es incompleta. |
| Sistemas vecinos | Agente de programación que crea o modifica configuración por encargo del desarrollador | Acta de validación del 26/09/2026, E-01; apartado II.6.1, hallazgo HA-3 | Exige una salida estructurada, determinista y legible por máquina, con ruta y posición exactas, esquema versionado y códigos de salida definidos. |
| Sistemas vecinos | Editor de texto del desarrollador | Acta del 26/09/2026, L-01 | RIGE informa la localización en formato ruta:línea:columna (RF-12), y la apertura y la edición corresponden al editor. |
| Infraestructura | Sistema de archivos local y permisos de lectura del usuario | Acta del 26/09/2026, sección 2 | RIGE audita el entorno individual y excluye las rutas que requieren privilegios administrativos y las políticas de administración centralizada. |
| Infraestructura | Rutas de configuración dependientes del sistema operativo | Acta del 26/09/2026, L-11 | El descubrimiento resuelve las rutas según el sistema operativo, con portabilidad sobre Ubuntu 26.04 y Windows 11 (RNF-06). |
| Infraestructura | Variables de entorno del proceso de RIGE, que pueden diferir de las de la terminal desde la cual se ejecuta OpenCode | Acta del 26/09/2026, sección 2 | RIGE resuelve sobre las variables de su propio proceso y declara esta condición. |
| Infraestructura | Escritura concurrente sobre las entradas mientras RIGE opera | Acta de validación del 26/09/2026, E-02 | El resultado identifica el estado de las entradas mediante el resumen del conjunto leído. |

*Tabla 1. Elementos del entorno del sistema, con su fuente y su implicancia de diseño. Fuente: elaboración propia.*

El agente de programación que consume la salida es el elemento más determinante para la arquitectura: introduce una interfaz que el diseño original no contempla y obliga al núcleo a producir un resultado estructurado antes de cualquier presentación (E-01 y E-02, criterios de RF-03 y RF-17). La versión congelada de la herramienta constituye la restricción más fuerte del proyecto.

[^1]: Las tablas y figuras del informe de la AE1 se identifican como tales porque este documento numera las suyas desde la unidad.
