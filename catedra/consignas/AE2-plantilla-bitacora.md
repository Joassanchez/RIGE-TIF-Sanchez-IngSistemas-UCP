**UNIVERSIDAD DE LA CUENCA DEL PLATA**

Facultad de Ingeniería, Tecnología y Arquitectura · Ingeniería en Sistemas de Información

**BITÁCORA INDIVIDUAL DE PROCESO Y DECISIONES**

Actividad de Evaluación N.º 2 · Unidad Dos — Formulación de Proyectos de Sistemas de Información

| **Identificación**              |                                                                                              |
|---------------------------------|----------------------------------------------------------------------------------------------|
| Apellido y nombre               |                                                                                              |
| DNI                             |                                                                                              |
| Proyecto (denominación)         |                                                                                              |
| Equipo e integrantes            |                                                                                              |
| Repositorio (dirección)         |                                                                                              |
| Período que cubre esta bitácora | Semanas 5 a 8 del Sprint 2 · del 7 de septiembre al 1.º de octubre de 2026, fecha de entrega |

+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **CÓMO SE USA ESTA PLANTILLA**                                                                                                                                                                                                                                                                                                                                    |
|                                                                                                                                                                                                                                                                                                                                                                   |
| La bitácora es individual y no compartida. Constituye la evidencia primaria del desempeño personal dentro del equipo y es componente de cierre: si la de un integrante falta o resulta insuficiente, la AE2 no se cierra como completa respecto de ese estudiante, cualquiera sea la calidad del trabajo colectivo.                                               |
|                                                                                                                                                                                                                                                                                                                                                                   |
| Vive como archivo bitacora.md dentro de /00-gestion del repositorio, con la entrada más reciente arriba, y se entrega copiada en la tarea «AE2 · Bitácora Individual de Proceso y Decisiones» del aula virtual. Esta plantilla sirve para quien prefiera redactarla en procesador de texto; en ese caso se exporta a PDF y se aloja igualmente en el repositorio. |
|                                                                                                                                                                                                                                                                                                                                                                   |
| Se escribe el día en que ocurre lo que se registra. Diez minutos, y sólo cuando pasa algo que vale registrar: una decisión, una alternativa descartada, un dato nuevo que cambió algo, una validación con el referente, una corrección a algo ya escrito. Reconstruida tres meses después no sirve como evidencia ni para la defensa.                             |
+===================================================================================================================================================================================================================================================================================================================================================================+
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **QUÉ SE AGUDIZA EN ESTA UNIDAD**                                                                                                                                                                                                                                                                                                                                                                                                                                           |
|                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| El elemento 2 cambia de peso. En la AE1 la bitácora registraba hallazgos; en la AE2 registra recortes. Toda delimitación excluye algo, y lo excluido debe quedar consignado con su criterio: qué entidad no entró al dominio y por qué, qué requisito quedó fuera del producto mínimo viable, qué alternativa de arquitectura se descartó y con qué argumento. Son las decisiones que el tribunal interroga en noviembre, y las únicas que no pueden reconstruirse después. |
+=============================================================================================================================================================================================================================================================================================================================================================================================================================================================================+
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**Los seis elementos de cada entrada**

| **\#** | **Elemento**                        | **Qué consigna en esta actividad**                                                                                     |
|--------|-------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| 1      | Qué se decidió                      | Delimitación adoptada, requisito especificado, elección de iteración o asignación de recurso.                          |
| 2      | Alternativas y criterio de descarte | Qué quedó excluido por esa decisión y con qué criterio.                                                                |
| 3      | Evidencia que la sostiene           | Hallazgo del relevamiento, validación del referente, fuente citada o principio de ingeniería invocado.                 |
| 4      | Aporte personal                     | Con remisión al registro del repositorio, a la tarjeta del tablero o al apartado del documento que lo acredita.        |
| 5      | Desacuerdo y resolución             | Conforme a la regla acordada en el acta de constitución del equipo.                                                    |
| 6      | Herramienta auxiliar                | Con el alcance empleado. Si es inteligencia artificial, rige el Protocolo de Uso Autorizado y sólo sobre el artefacto. |

**Entrada de ejemplo, con los seis elementos**

+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **FECHA: 22/09/2026 · CASO «SANTA ANA»**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 1 · Decisión. La entidad «Presentación» queda dentro del modelo del dominio, pero la presentación automática ante el organismo regulador sale del alcance del proyecto: el sistema genera el archivo y la presentación sigue siendo manual.                                                                                                                                                                                                                                                                                          |
|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2 · Alternativas y criterio de descarte. Se evaluó (a) automatizar el envío, descartada porque el organismo no publica interfaz de recepción y la alternativa sería automatizar un formulario web de terceros, fuera de nuestro control; (b) excluir la entidad por completo, descartada porque el sistema necesita registrar qué se presentó y cuándo para reconstruir el origen de las multas; (c) conservar la entidad y excluir el envío, adoptada. Criterio: control efectivo sobre la interfaz de la que depende el requisito. |
|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 3 · Evidencia. Hallazgo H-05 del Capítulo II: dos multas del regulador por presentación tardía en el último ejercicio. Consulta al referente el 19/09: confirma que la presentación se realiza cargando un formulario en el sitio del organismo, sin canal automatizado disponible.                                                                                                                                                                                                                                                  |
|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 4 · Aporte personal. Redacción de la fila de exclusión en el Instrumento 27.3 y de la justificación de H-05 en la matriz de trazabilidad. Artefacto: 03-requisitos/20260922_MatrizTrazabilidad_EquipoDos_v3.xlsx, registro 4a7f2c1.                                                                                                                                                                                                                                                                                                  |
|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 5 · Desacuerdo. Un integrante sostenía automatizar el envío mediante emulación del formulario. Se resolvió por el criterio del acta de constitución (decisión por mayoría con fundamento escrito), y el argumento decisivo fue la dependencia de una interfaz no documentada que puede cambiar sin aviso.                                                                                                                                                                                                                            |
|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 6 · Herramienta auxiliar. Ninguna en esta jornada. La redacción del apartado y de la justificación es propia.                                                                                                                                                                                                                                                                                                                                                                                                                        |
+======================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================+
+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**Entradas**

*Reproduzca el bloque siguiente por cada jornada de trabajo que registre. La entrada más reciente arriba.*

| Fecha                                                                  |     |
|------------------------------------------------------------------------|-----|
| 1 · Qué se decidió                                                     |     |
| 2 · Alternativas evaluadas y criterio de descarte (qué quedó excluido) |     |
| 3 · Evidencia que sostiene la decisión                                 |     |
| 4 · Aporte personal, con remisión al artefacto                         |     |
| 5 · Desacuerdo, si lo hubo, y cómo se resolvió                         |     |
| 6 · Herramienta auxiliar y alcance de su uso                           |     |

| Fecha                                                                  |     |
|------------------------------------------------------------------------|-----|
| 1 · Qué se decidió                                                     |     |
| 2 · Alternativas evaluadas y criterio de descarte (qué quedó excluido) |     |
| 3 · Evidencia que sostiene la decisión                                 |     |
| 4 · Aporte personal, con remisión al artefacto                         |     |
| 5 · Desacuerdo, si lo hubo, y cómo se resolvió                         |     |
| 6 · Herramienta auxiliar y alcance de su uso                           |     |

| Fecha                                                                  |     |
|------------------------------------------------------------------------|-----|
| 1 · Qué se decidió                                                     |     |
| 2 · Alternativas evaluadas y criterio de descarte (qué quedó excluido) |     |
| 3 · Evidencia que sostiene la decisión                                 |     |
| 4 · Aporte personal, con remisión al artefacto                         |     |
| 5 · Desacuerdo, si lo hubo, y cómo se resolvió                         |     |
| 6 · Herramienta auxiliar y alcance de su uso                           |     |

**Declaración de uso de herramientas de inteligencia artificial**

Se completa una fila por cada uso. El Protocolo de Uso Autorizado admite estas herramientas exclusivamente sobre el prototipo v1 y sus componentes técnicos: configuración del proyecto, andamiaje de capas, generación de datos de prueba y guiones de integración continua. Queda prohibido su empleo para producir texto del informe, redactar requisitos o criterios de aceptación, elaborar esta bitácora o justificar decisiones técnicas. La cátedra sanciona el uso no declarado, no el uso declarado dentro de sus límites.

| **Fecha** | **Herramienta** | **Función utilizada** | **Artefacto o registro afectado** | **Verificación posterior realizada** |
|-----------|-----------------|-----------------------|-----------------------------------|--------------------------------------|
|           |                 |                       |                                   |                                      |
|           |                 |                       |                                   |                                      |
|           |                 |                       |                                   |                                      |
|           |                 |                       |                                   |                                      |

+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **SI NO HUBO USO DE ESTAS HERRAMIENTAS**                                                                                                                                                                                                                            |
|                                                                                                                                                                                                                                                                     |
| Conviene consignarlo de manera expresa, con una fórmula del tipo: «No se emplearon herramientas de inteligencia artificial generativa en ninguna parte de esta actividad». La declaración negativa también es una declaración, y su ausencia deja el punto abierto. |
+=====================================================================================================================================================================================================================================================================+
+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**Cierre de la bitácora**

| **Verificación final antes de entregar**                                                           | **Marque** |
|----------------------------------------------------------------------------------------------------|------------|
| Todas las entradas están fechadas y los seis elementos completos                                   | ☐          |
| Cada aporte personal remite a un artefacto verificable del repositorio o del tablero               | ☐          |
| Las exclusiones decididas en esta unidad están registradas con su criterio                         | ☐          |
| La declaración de uso de herramientas está completa; si no hubo uso, se consignó de manera expresa | ☐          |
| El archivo está en /00-gestion del repositorio y copiado en la tarea del aula virtual              | ☐          |

Firma o constancia del autor: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fecha: \_\_\_\_ / \_\_\_\_ / 2026
