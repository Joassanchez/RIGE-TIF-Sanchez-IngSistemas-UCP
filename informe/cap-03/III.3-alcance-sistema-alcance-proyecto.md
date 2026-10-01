## III.3 · Alcance del sistema y alcance del proyecto

El alcance del sistema comprende a RIGE concebido como producto. Resuelve y explica el estado efectivo del ecosistema de configuración de las herramientas de programación basadas en agentes, con una arquitectura que separa un núcleo independiente de la herramienta de adaptadores específicos, y expone esa información por dos interfaces sobre el mismo núcleo: una línea de comandos completa, destinada a los agentes que crean o modifican configuración por encargo del desarrollador y al desarrollador que trabaja en la terminal, y una interfaz web local, que se abre en el navegador del propio equipo y se limita a formularios y vistas de consulta de valores, permisos y hallazgos. Comprende las seis funciones declaradas en el apartado I.6.2 del informe de la AE1, la incorporación de otras herramientas mediante nuevos adaptadores y las capacidades que el apartado III.4 declara diferidas.

El alcance del proyecto comprende lo que se compromete entre septiembre y noviembre de 2026. Se circunscribe al adaptador de OpenCode 1.18.25, con la versión congelada. Abarca los dieciocho requisitos que el catálogo identifica con prioridad Must y las dos interfaces: la línea de comandos completa, que informa con esquema versionado los valores efectivos, las decisiones de permiso y el listado de los agentes desde la segunda iteración, y los hallazgos desde la tercera, y la interfaz web limitada, sobre la cual se acredita el prototipo v1. Incluye, además, las dos mediciones previstas en los apartados I.3.2 y I.3.4 del informe de la AE1, con agentes de programación como ejecutores del procedimiento, y los artefactos de software de la cadencia comprometida en el Capítulo V. La línea de comandos no figura en la Tabla 7 porque constituye un canal de acceso a las funciones y no una función en sí misma.

| **Función** | **Capacidad** | **Requisito** | **Estado en el alcance del proyecto** |
|---|---|---|---|
| F1 · Descubrimiento del ecosistema | Localización de las entradas de configuración aplicables, con su tipo, precedencia y legibilidad | RF-04 | Comprometida |
| F1 · Descubrimiento del ecosistema | Rechazo de los resultados ante una versión instalada distinta de la 1.18.25 | RF-05 | Comprometida |
| F2 · Resolución con procedencia | Valor efectivo de cada clave de un agente, con la declaración determinante y las desplazadas | RF-01 | Comprometida |
| F2 · Resolución con procedencia | Identificación de los valores implícitos y de las reglas nativas | RF-06 | Comprometida |
| F3 · Relaciones del ecosistema | Vínculos entre los elementos del ecosistema | RF-13 (Could) | Diferida |
| F4 · Explicación de permisos | Decisión de permiso con la cadena de reglas, la regla determinante y su explicación, limitada a comandos simples | RF-02 | Comprometida |
| F4 · Explicación de permisos | Advertencia ante un comando de terminal compuesto | RF-08 | Comprometida |
| F4 · Explicación de permisos | Disponibilidad de la herramienta para el modelo junto con la decisión | RF-10 (Should) | Condicionada a las horas |
| F4 · Explicación de permisos | Matriz de agentes por tipo de permiso y consulta inversa | RF-15 (Won't) | Diferida |
| F5 · Verificación y resumen | Verificación de los seis tipos de hallazgo | RF-07 | Comprometida |
| F5 · Verificación y resumen | Advertencia ante la desactivación de una regla nativa de protección | RF-09 | Comprometida |
| F5 · Verificación y resumen | Resumen del ecosistema | RF-11 (Should) | Condicionada a las horas |
| F6 · Exploración y exportación | Listado de los agentes del proyecto | RF-16 | Comprometida |
| F6 · Exploración y exportación | Localización en formato ruta:línea:columna | RF-12 (Should) | Condicionada a las horas |
| F6 · Exploración y exportación | Estado resuelto completo por línea de comandos | RF-14 (Could) | Diferida |
| Persistencia de la resolución | Conservación y recuperación de la resolución con su fecha | RF-17 | Comprometida |

*Tabla 7. Correspondencia entre las funciones declaradas en el informe de la AE1, sus capacidades y el alcance comprometido. Fuente: elaboración propia.*

La coherencia entre ese alcance y los recursos se verifica sobre el presupuesto de horas del Capítulo V. El proyecto es de autoría individual y declara veintiocho horas semanales reales (veinte técnicas y ocho de reserva documental) sobre un período de ocho semanas, lo que arroja un presupuesto total de doscientas veinticuatro horas. Descontada una reducción prevista de disponibilidad del quince por ciento, el presupuesto efectivo asciende a ciento noventa horas, de las cuales ciento treinta y seis son técnicas. Los dieciocho requisitos Must y los cuatro artefactos de la cadencia (v1, v2, v3 y versión congelada) se planifican dentro de esa cifra, cuya distribución por iteración consta en el apartado V.4; la medición de la línea de base se financia con la reserva documental y la medición final, con la fase de cierre, cuyas horas el apartado V.4 declara por separado. Los seis requisitos Should carecen de horas asignadas y se incorporan si las horas lo permiten; los dos Could y el único Won't quedan fuera del período por su prioridad, conforme al apartado III.5.
