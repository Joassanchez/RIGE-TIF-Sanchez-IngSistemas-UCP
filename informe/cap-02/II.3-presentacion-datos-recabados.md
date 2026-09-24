## II.3 · Presentación de los datos recabados

Este apartado presenta los datos en estado ordenado y sin interpretación; el análisis corresponde al apartado II.5. Los registros extensos constan en el Anexo I, y aquí se incorpora la síntesis con su remisión.

### II.3.1 · Datos del relevamiento documental de incidencias

La aplicación del criterio registrado en el Anexo I, A.I.6 arroja 46 incidencias candidatas. De ellas se excluyen 12 por corresponder a pedidos de funcionalidad que no relatan un comportamiento ya experimentado, y 2 por no versar sobre el fenómeno relevado: una relativa a la expresividad de la interfaz de programación de permisos y otra a una discrepancia de nomenclatura en el esquema publicado. Quedan incluidas 32 incidencias, de las cuales 8 permanecen abiertas y 24 se encuentran cerradas a la fecha de consulta.

| **Categoría**                                         | **Casos** | **Observación**                                        |
|-------------------------------------------------------|-----------|--------------------------------------------------------|
| Candidatas según el criterio de búsqueda              | 46        | Período 28/11/2025 a 16/09/2026                        |
| Excluidas por corresponder a pedidos de funcionalidad | 12        | No relatan un comportamiento experimentado             |
| Excluidas por no versar sobre el fenómeno             | 2         | Expresividad de la interfaz y nomenclatura del esquema |
| **Incluidas**                                         | **32**    | 8 abiertas y 24 cerradas                               |

*Tabla 13. Resultado del relevamiento de incidencias del repositorio de OpenCode. Fuente: elaboración propia sobre el relevamiento del 17/09/2026; nómina completa de las 46 incidencias en el Anexo I, A.I.6.*

### II.3.2 · Datos de la medición de la línea de base

Los valores agregados por condición corresponden a la Tabla 4 del apartado I.3.2. Este apartado presenta el dato en el grado de desagregación que el Capítulo I anuncia y que la síntesis no admite: por perfil de participante.

| **Condición** | **Perfil** | **IB-1 · Error (IC 95 %)** | **IB-2 · Tiempo (RIC)** | **IB-3 · Parciales** | **Respuestas (n)** |
|---------------|------------|----------------------------|-------------------------|----------------------|--------------------|
| C-1           | Habitual   | \[ \]                      | \[ \]                   | \[ \]                | \[ \]              |
| C-1           | Ocasional  | \[ \]                      | \[ \]                   | \[ \]                | \[ \]              |
| C-2 a C-4     | Habitual   | \[ \]                      | \[ \]                   | \[ \]                | \[ \]              |
| C-2 a C-4     | Ocasional  | \[ \]                      | \[ \]                   | \[ \]                | \[ \]              |

*Tabla 14. Indicadores de la línea de base por condición agrupada y perfil. Fuente: elaboración propia; registro completo en el Anexo I, A.I.8.*

La desagregación se presenta con las condiciones C-2 a C-4 agrupadas, dado que el reparto de las respuestas entre cuatro condiciones y dos perfiles produce celdas demasiado pequeñas para admitir lectura. Se evalúa como alternativa informar las cuatro condiciones por separado y se la descarta por esa razón; el detalle por condición individual consta en el Anexo I, A.I.8.

Dado que las respuestas de un mismo participante no son independientes entre sí, IB-1 se informa también por participante como control de la unidad de análisis adoptada: el registro individual consta en el Anexo I, A.I.8, y en el cuerpo se consigna el rango de la proporción de error entre participantes y si algún participante concentra una parte desproporcionada de los errores. El registro incorpora, además, los recursos que el participante emplea durante cada resolución, obtenidos de la grabación: qué comandos de introspección utiliza, si recurre a la documentación o a la hoja de referencia, y la cantidad de archivos que abre. Esos valores caracterizan el procedimiento manual vigente, no integran la meta cuantificada del criterio de éxito y constan en el Anexo I, A.I.8. Se registra asimismo, para cada caso, si su respuesta puede obtenerse mediante la lectura de la documentación o si solo surge del comportamiento de la herramienta.

### II.3.3 · Datos de la entrevista al referente

Los datos se presentan aquí en los términos en que fueron declarados u observados, sin interpretación; su lectura corresponde a los apartados II.5 y II.6. El registro completo consta en el Anexo I, A.I.5.

**Composición del equipo y adopción.** El equipo de desarrollo está integrado por cinco personas y comenzó a utilizar herramientas de programación basadas en agentes a comienzos de 2026. La referente atribuye la incorporación a dos motivos y los jerarquiza: la actualización tecnológica frente a la adopción creciente en el sector y, como factor determinante, la necesidad de sostener el volumen de trabajo comprometido sin ampliar la dotación de personal.

**Frecuencia y procedimiento.** La referente declara acceder a los archivos de configuración alrededor de cinco veces por semana, y precisa que se trata en general de consultas menores. Señala que la frecuencia tiende a disminuir por el uso creciente de un agente que el equipo desarrolló internamente para crear y configurar otros agentes, y que a medida que adquiere confianza en ese agente recurre con menor frecuencia a la revisión manual. El procedimiento habitual consiste en abrir y revisar los archivos correspondientes; cuando la información no resulta evidente, complementa la revisión consultando a un modelo de lenguaje.

**Episodios de comportamiento distinto del esperado.** Se registran dos. En el primero, un agente se invocó a sí mismo de manera reiterada, como resultado de una configuración que no producía el efecto esperado y de un modelo de bajo costo que interpretó que esa llamada le estaba habilitada, pese a que no debía estarlo. En el segundo, un agente operó a través de otro agente que la propia herramienta invoca internamente, cuya existencia y cuyas funciones la referente desconocía.

**Esfuerzo de comprensión y soluciones propias.** La referente relata haber revisado varios archivos y haber recurrido a una pizarra para representar la arquitectura de agentes y sus relaciones. Consultó, además, la configuración de su propio entorno mediante un agente con permisos elevados. A esas dos prácticas se suma el agente interno de creación y configuración ya mencionado. Los tres artefactos fueron construidos por el equipo sin intervención del autor de este informe.

**Consumo de tokens.** Se registran dos vías de consumo atribuibles a la configuración. La primera corresponde a la consulta del propio entorno mediante el agente de permisos elevados. La segunda corresponde a acciones que debieron repetirse porque la configuración no producía el comportamiento esperado. La referente no cuantificó el consumo, de modo que se acredita su existencia y no su magnitud.

**Respuesta al enfoque presentado.** Descripto el enfoque de la plataforma y el recorrido de consulta previsto, la referente señaló como aporte principal la posibilidad de identificar el archivo que determina cada valor vigente, información que hoy obtiene mediante la revisión manual de los distintos archivos de configuración. Manifestó asimismo la utilidad de poder realizar esa consulta de forma programática, de modo que un agente pueda conocer la configuración efectiva de su entorno o la de otro agente antes de operar.

**Datos no obtenidos.** La referente no cuantificó la duración de los episodios relatados ni el consumo de tokens, y no precisó qué proporción de sus cinco accesos semanales corresponde a consultas cuya respuesta no resulta inmediata. Esas ausencias sostienen la decisión de no producir una valoración monetaria del problema, conforme al apartado I.3.1, y las limitaciones del apartado II.6.3.
