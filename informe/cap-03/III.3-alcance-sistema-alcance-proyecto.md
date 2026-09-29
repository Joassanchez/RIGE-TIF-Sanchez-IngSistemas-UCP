## III.3 · Alcance del sistema y alcance del proyecto

El alcance del sistema comprende a RIGE concebido como producto. Resuelve y explica el estado efectivo del ecosistema de configuración de las herramientas de programación basadas en agentes, con una arquitectura que separa un núcleo independiente de la herramienta de adaptadores específicos, y expone esa información por dos interfaces sobre el mismo núcleo: una línea de comandos completa, destinada a los agentes que crean o modifican configuración por encargo del desarrollador y al desarrollador que trabaja en la terminal, y una interfaz web local, que se abre en el navegador del propio equipo y se limita a formularios y vistas de consulta de valores, permisos y hallazgos. Comprende las seis funciones declaradas en el apartado I.6.2 del informe de la AE1, la incorporación de otras herramientas mediante nuevos adaptadores y las capacidades que el apartado III.4 declara diferidas.

El alcance del proyecto comprende lo que se compromete entre septiembre y noviembre de 2026. Se circunscribe al adaptador de OpenCode 1.18.25 con la versión congelada; a los diecisiete requisitos que el catálogo identifica con prioridad Must; a la línea de comandos completa, que informa valores efectivos, decisiones de permiso y el listado de los agentes desde la segunda iteración, y hallazgos desde la tercera; a la interfaz web limitada, sobre la cual se acredita el prototipo v1; a las dos mediciones previstas en los apartados I.3.2 y I.3.4 del informe de la AE1, con agentes de programación como ejecutores del procedimiento; y a los artefactos de software de la cadencia comprometida en el Capítulo V.

| **Función declarada en el informe de la AE1**                                          | **Estado en el alcance del proyecto** |
|----------------------------------------------------------------------------------------|---------------------------------------|
| F1 · Descubrimiento del ecosistema                                                     | Comprometida                          |
| F2 · Resolución con procedencia                                                        | Comprometida                          |
| F4 · Explicación de permisos, limitada a comandos simples                              | Comprometida                          |
| F5 · Verificación de los seis tipos de hallazgo (RF-07)                                | Comprometida                          |
| F5 · Resumen del ecosistema (RF-11, Should)                                            | Condicionada a las horas              |
| Línea de comandos: valores, decisiones de permiso y hallazgos, con esquema versionado  | Comprometida                          |
| F3 · Relaciones del ecosistema                                                         | Diferida                              |
| F6 · Listado de los agentes del proyecto (RF-16)                                       | Comprometida                          |
| F6 · Localización en formato ruta:línea:columna (RF-12, Should)                        | Condicionada a las horas              |
| F6 · Estado resuelto completo por línea de comandos (RF-14)                            | Diferida                              |
| Matriz de agentes por tipo de permiso y consulta inversa                               | Diferida                              |

*Tabla 7. Correspondencia entre las funciones declaradas en el informe de la AE1 y el alcance comprometido. Fuente: elaboración propia.*

La coherencia entre ese alcance y los recursos se verifica sobre el presupuesto de horas del Capítulo V. El proyecto es de autoría individual y declara veintiocho horas semanales reales —veinte técnicas y ocho de reserva documental— sobre un período de ocho semanas, lo que arroja un presupuesto total de doscientas veinticuatro horas; descontada una reducción prevista del quince por ciento por exámenes y feriados, el presupuesto efectivo asciende a ciento noventa horas, de las cuales ciento treinta y seis son técnicas. Los diecisiete requisitos Must y los cuatro artefactos de la cadencia —v1, v2, v3 y versión congelada— se planifican dentro de esa cifra, cuya distribución por iteración consta en el apartado V.4; la medición de la línea de base se financia con la reserva documental y la medición final, con la fase de cierre, cuyas horas el apartado V.4 declara por separado. Los seis requisitos Should carecen de horas asignadas y se incorporan si las horas lo permiten; los dos Could y el único Won't quedan fuera del período por su prioridad, conforme al apartado III.5.
