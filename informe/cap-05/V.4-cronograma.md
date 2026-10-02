## V.4 · Cronograma

### Presupuesto de horas-persona

El presupuesto se construye sobre las horas semanales reales declaradas en el Instrumento 24: la capacidad técnica determina los requisitos Must del período y la reserva financia los capítulos, las correcciones y la preparación de las mediciones, con entregables de fecha fija. La reserva se mantiene separada de los requisitos y del margen de contingencia, y la reducción prevista del 15 % se distribuye proporcionalmente entre las iteraciones.

| **Presupuesto de horas-persona**                 | **Valor declarado**                                                                      |
|--------------------------------------------------|------------------------------------------------------------------------------------------|
| Integrantes del equipo                           | 1, de autoría individual                                                                 |
| Horas semanales reales por integrante            | 28 h: 20 técnicas y 8 de reserva documental                                              |
| Presupuesto total del período                    | 224 h en ocho semanas, del 21/09 al 14/11/2026: 160 técnicas y 64 de reserva             |
| Reducción prevista de disponibilidad          | 15 %, equivalente a 34 h: 24 técnicas y 10 de reserva                                    |
| **Presupuesto efectivo resultante**              | **190 h: 136 técnicas y 54 de reserva**                                                  |
| Fase de cierre posterior al período (estimación) | 48 h efectivas en las semanas 15 y 16, sujetas a la confirmación de las fechas de la AE4 |

*Tabla 14. Presupuesto de horas-persona del proyecto. Fuente: elaboración propia sobre el Instrumento 24.*

### Asignación por iteración

| **Iteración** | **Días** | **Capacidad efectiva (h)** | **Horas asignadas (h)** | **Diferencia (h)** |
|---|---|---|---|---|
| 1 | 11 | 28 | 35 | +7 |
| 2 | 23 | 59 | 60 | +1 |
| 3 | 13 | 33 | 30 | −3 |
| 4 | 6 | 16 | 11 | −5 |
| **Total** | **53** | **136** | **136** | **0** |

El exceso de 8 h de las dos primeras iteraciones se cubre con la holgura de 8 h de las dos últimas, disponible porque la cuarta no incorpora funcionalidad.

La reserva efectiva asigna 14 h a la AE2, 20 h a la Ventana de Mejora y Cumplimiento y las correcciones del informe de la AE1, 13 h a los Capítulos VI y IX y 7 h a la preparación de la medición final. La línea de base, de 16 a 23 h, se carga a la Ventana y se compensa con la preparación de la medición final, que consiste en volver a ejecutar el guion (Anexo III, D-41).

La fase de cierre se estima en dos semanas según la correspondencia de clases de la consigna y tiene un presupuesto separado para la medición final, la constancia de la referente y los capítulos restantes, sujeto a la confirmación de las fechas de la cuarta actividad de evaluación, cuya modificación altera esa línea y mantiene el alcance comprometido.

### Estimación por tareas

La estimación descompone cada iteración en tareas y les asigna horas por juicio del autor, sobre la base de su experiencia en desarrollo de software (Cohn, 2005). La Tabla 15 asigna las 136 h técnicas a los requisitos Must y a la estabilización prevista en la Tabla 11 del apartado V.1.

| **Iteración** | **Tarea**                                                                           | **Requisitos**                              | **Horas** |
|---------------|-------------------------------------------------------------------------------------|---------------------------------------------|-----------|
| 1 | Incremento 0 · Esqueleto: repositorio, canal de integración continua y entorno | Condición (a) de la definición de terminado; RNF-03, RNF-09 | 8 |
| 1 | Incremento 1 · Núcleo: resolución con procedencia conforme a RD-01 | RF-01, RNF-03 | 6 |
| 1 | Incremento 2 · Adaptador: lectura de tres entradas de archivo con su posición, y primeros resultados de referencia | RF-01 | 8 |
| 1 | Incremento 3 · Almacén propio: esquema, escritura y lectura de la resolución | RF-17, RNF-01 | 4 |
| 1 | Incremento 4 · Interfaz web y recorrido de punta a punta | RF-01, RF-17 | 5 |
| 1 | Incremento 5 · Archivo de lectura, prueba de clonado y etiqueta v1 | Condición de aceptación del v1 (apartado V.2) | 4 |
|               | **Subtotal de la iteración 1**                                                      |                                             | **35**    |
| 2             | Incorporación del evaluador de permisos de OpenCode, con atribución                 | RF-02, RNF-10                               | 10        |
| 2             | Cadena ordenada de reglas y herencia hacia subagentes conforme a RD-03 y RD-05      | RF-02                                       | 10        |
| 2             | Valores implícitos y reglas nativas                                                 | RF-06                                       | 6         |
| 2             | Comando compuesto y protección nativa desactivada                                   | RF-08, RF-09                                | 8         |
| 2             | Explicación mediante plantillas deterministas                                       | RF-02                                       | 5         |
| 2             | Vista web de consulta de permiso                                                    | RF-02                                       | 4         |
| 2             | Salida por línea de comandos: valores y decisiones de permiso, con esquema versionado y explicación a pedido | RF-03                              | 10        |
| 2             | Verificación de H-18 y trabajo de oráculo, incluida la regeneración automática de los resultados de referencia | RNF-02                   | 4         |
| 2             | Listado de los agentes declarados y nativos, por ambas interfaces                   | RF-16                                       | 3         |
|               | **Subtotal de la iteración 2**                                                      |                                             | **60**    |
| 3             | Descubrimiento de las entradas aplicables y de su legibilidad                       | RF-04                                       | 8         |
| 3             | Advertencia ante una versión distinta                                               | RF-05                                       | 2         |
| 3             | Seis tipos de hallazgo con su explicación                                           | RF-07                                       | 12        |
| 3             | Conjunto completo de escenarios y verificaciones de seguridad                       | RNF-02, RNF-04, RNF-05                      | 4         |
| 3             | Vista web y salida por línea de comandos de los hallazgos                           | RF-07                                       | 4         |
|               | **Subtotal de la iteración 3**                                                      |                                             | **30**    |
| 4             | Corrección de defectos, regresión completa, prueba de clonado y archivo de lectura; acreditación de RNF-06 y RNF-07 | Requisitos Must; RNF-06 y RNF-07 | 11        |
|               | **Total de la capacidad técnica efectiva**                                          |                                             | **136**   |

*Tabla 15. Estimación de horas por tarea e iteración. Fuente: elaboración propia.*

Los seis requisitos Should no reciben horas propias. RF-12 se incorpora en la segunda iteración y RF-10, RF-11 y RNF-08 en la tercera, si las anteriores cierran por debajo de lo estimado. La acreditación de RNF-06 y RNF-07 sigue lo previsto para la estabilización en el apartado V.1 y es lo primero que se posterga si esta se reduce.

### Cronograma y dependencias

![Cronograma del proyecto](../figuras/cap-05/figura-cronograma-gantt.png){width="6.2in"}

*Figura 3. Cronograma del proyecto con dependencias entre tareas consecutivas y los hitos de la cadencia. La iteración 1 se presenta por los incrementos con que se construye el v1. Las barras rayadas corresponden a la fase de cierre, cuya duración se estima. Fuente: elaboración propia sobre la Tabla 15.*

La ruta crítica enlaza los incrementos 0 a 5 en la primera iteración; el evaluador, la cadena de reglas, la línea de comandos, H-18, RF-16 y las capacidades restantes de permisos en la segunda; descubrimiento y versión, hallazgos y escenarios completos en la tercera; y estabilización en la cuarta. La figura omite tres dependencias no consecutivas: núcleo → hallazgos, cadena de reglas → hallazgos y cadena de reglas → RF-06. La línea de base separa preparación y ejecución de uno o dos días, con resultado a más tardar el 16/10, que determina el orden restante de la segunda iteración según la Tabla 10 del apartado IV.3.

### Cláusula de contingencia

La cláusula de contingencia opera sobre la capacidad técnica, que es la que determina los requisitos comprometidos. La magnitud de la caída, un tercio del presupuesto, la fija la consigna de la AE2 en su exigencia (vii). Esa caída reduce las 136 h a 91 h, y la pérdida de 45 h se absorbe mediante las postergaciones de la Tabla 16, aplicadas en el orden indicado hasta cubrirla.

| **Orden** | **Qué se posterga**                                                                                                       | **Horas liberadas** | **Acumulado** |
|-----------|---------------------------------------------------------------------------------------------------------------------------|---------------------|---------------|
| 1         | Requisitos Should RF-10, RF-11, RF-12, RNF-06, RNF-07 y RNF-08, que carecen de horas asignadas, incluidas las acreditaciones en Windows 11 y de RNF-07 dentro de la estabilización | 0 | 0 |
| 2         | Regeneración automática de los resultados de referencia, sustituida por una regeneración manual registrada en la bitácora | 2                   | 2             |
| 3         | Vista web de consulta de permiso; la decisión se conserva por línea de comandos; la parte de los criterios de RF-02 y RF-03 que exige coincidencia con la interfaz web queda sin cumplir | 4                   | 6             |
| 4         | Explicación en lenguaje natural de las decisiones de permiso, mediante plantillas de RF-02 y explicación a pedido         | 5                   | 11            |
| 5         | RF-04 · descubrimiento completo; se conservan las entradas de archivo del v1                                              | 8                   | 19            |
| 6         | RF-07 · hallazgos, con su vista web y su salida por línea de comandos (CU-04)                                             | 16                  | 35            |
| 7         | Estabilización, reducida de 11 h a 1 h                                                                                    | 10                  | 45            |

*Tabla 16. Cláusula de contingencia ante una caída de un tercio de la capacidad técnica. Fuente: elaboración propia sobre la Tabla 15.*

Se posterga primero lo que no interviene en la medición final ni en la mitigación del riesgo principal y, dentro de ello, lo que menos debilita un objetivo específico. Las postergaciones se registran en la bitácora y el tablero y se reflejan en la prioridad del catálogo y, si afectan un Must, en el producto mínimo viable del apartado V.5. El efecto de cada orden sobre los objetivos específicos consta en el Anexo III, A.III.3.

Se conservan la trazabilidad del catálogo y la ejecutabilidad de cada etiqueta, condiciones de cómputo de la cátedra; la fidelidad respecto de OpenCode 1.18.25 (RNF-02), que mitiga el riesgo principal; y la seguridad de RNF-01, RNF-04 y RNF-05. Se protegen los casos y el canal de la medición final: CU-01 mínimo con advertencia de versión; CU-02; CU-03 con la decisión de RF-02 sin explicación en prosa, RF-06, RF-08 y RF-09; y RF-03 para consultar valores y permisos por línea de comandos (apartado V.5), que sostienen el flujo de valor del apartado IV.3.
