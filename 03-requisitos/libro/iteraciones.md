# Plan de iteraciones y presupuesto de horas

> Hoja del Libro de trabajo. Migrado de Cap. V, V.1 y V.4. Fuente para `/exportar libro`.

## Iteraciones (V.1)

| **Iteración** | **Fechas**     | **Objetivo verificable**                                                                                                                                                                                                                                                                                                                                        | **Requisitos comprometidos (ID)**                                                                | **Entregable de cierre** |
|---------------|----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|--------------------------|
| 1             | 21/09 al 01/10 | Sobre un escenario con una clave declarada en tres entradas de distinta precedencia, RIGE informa el valor efectivo, su archivo y su línea, y las dos declaraciones desplazadas; persiste la resolución y la devuelve a la interfaz. El valor coincide con el comando nativo de resolución por agente y el núcleo registra cero dependencias hacia el adaptador | RF-01, RF-17, RNF-01, RNF-03, RNF-09; fijación de los valores de RNF-07                                         | Etiqueta v1              |
| 2             | 02/10 al 24/10 | Para un agente y un comando de terminal simple, RIGE informa la decisión, la cadena de reglas, la regla determinante con su carácter nativo o declarado y su explicación, y expone por línea de comandos los valores efectivos y la decisión de permiso con una salida estructurada, determinista y ajustada al esquema publicado; la interfaz web local presenta la consulta de permiso con la misma decisión, cadena y regla determinante que la línea de comandos. La decisión coincide con la del evaluador vigente en el 100 % de los casos de prueba | RF-02, RF-03, RF-06, RF-08, RF-09, RF-16, RNF-10; verificación de H-18. Condicionado: RF-12                                          | Etiqueta v2              |
| 3             | 26/10 al 07/11 | RIGE descubre los siete tipos de entrada, advierte ante una versión distinta de la 1.18.25, detecta los seis tipos de hallazgo con cero falsos positivos, y la interfaz web local presenta la vista de hallazgos con los mismos resultados que la línea de comandos                                                                                | RF-04, RF-05, RF-07, RNF-02, RNF-04, RNF-05. Condicionados: RF-10, RF-11, RNF-08 | Etiqueta v3              |
| 4             | 09/11 al 14/11 | La versión congelada satisface los criterios de aceptación de los dieciocho requisitos Must sin incorporar funcionalidad                                                                                                                                                                                                                                           | Ninguno nuevo; acreditación de RNF-06 y RNF-07 dentro de la estabilización                                                                                    | Etiqueta congelada       |

*Tabla 14. Iteraciones del período técnico, con su objetivo verificable, sus requisitos comprometidos y su entregable de cierre. Fuente: elaboración propia sobre el catálogo del apartado III.5.*

## Presupuesto y tareas por iteración (V.4)

| **Presupuesto de horas-persona**                 | **Valor declarado**                                                                      |
|--------------------------------------------------|------------------------------------------------------------------------------------------|
| Integrantes del equipo                           | 1, de autoría individual                                                                 |
| Horas semanales reales por integrante            | 28 h: 20 técnicas y 8 de reserva documental                                              |
| Presupuesto total del período                    | 224 h en ocho semanas, del 21/09 al 14/11/2026: 160 técnicas y 64 de reserva             |
| Reducción prevista de disponibilidad          | 15 %, equivalente a 34 h: 24 técnicas y 10 de reserva                                    |
| **Presupuesto efectivo resultante**              | **190 h: 136 técnicas y 54 de reserva**                                                  |
| Fase de cierre posterior al período (estimación) | 48 h efectivas en las semanas 15 y 16, sujetas a la confirmación de las fechas de la AE4 |

*Tabla 17. Presupuesto de horas-persona del proyecto. Fuente: elaboración propia sobre el Instrumento 24.*

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

*Tabla 18. Estimación de horas por tarea e iteración. Fuente: elaboración propia.*

| **Orden** | **Qué se posterga**                                                                                                       | **Horas liberadas** | **Acumulado** |
|-----------|---------------------------------------------------------------------------------------------------------------------------|---------------------|---------------|
| 1         | Requisitos Should RF-10, RF-11, RF-12, RNF-06, RNF-07 y RNF-08, que carecen de horas asignadas, incluidas las acreditaciones en Windows 11 y de RNF-07 dentro de la estabilización | 0 | 0 |
| 2         | Regeneración automática de los resultados de referencia, sustituida por una regeneración manual registrada en la bitácora | 2                   | 2             |
| 3         | Vista web de consulta de permiso; la decisión se conserva por línea de comandos; la parte de los criterios de RF-02 y RF-03 que exige coincidencia con la interfaz web queda sin cumplir | 4                   | 6             |
| 4         | Explicación en lenguaje natural de las decisiones de permiso, mediante plantillas de RF-02 y explicación a pedido         | 5                   | 11            |
| 5         | RF-04 · descubrimiento completo; se conservan las entradas de archivo del v1                                              | 8                   | 19            |
| 6         | RF-07 · hallazgos, con su vista web y su salida por línea de comandos (CU-04)                                             | 16                  | 35            |
| 7         | Estabilización, reducida de 11 h a 1 h                                                                                    | 10                  | 45            |

*Tabla 19. Cláusula de contingencia ante una caída de un tercio de la capacidad técnica. Fuente: elaboración propia sobre la Tabla 18.*
