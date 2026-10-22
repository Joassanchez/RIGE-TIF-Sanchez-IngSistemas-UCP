## II.3 · Presentación de los datos recabados

Este apartado presenta los datos en estado ordenado y sin interpretación; el análisis corresponde al apartado II.5. Los registros extensos constan en el Anexo VI, y aquí se incorpora la síntesis con su remisión.

### II.3.1 · Datos del relevamiento documental de incidencias

La aplicación del criterio registrado en el Anexo VI, A.VI.6 arroja 46 incidencias candidatas. De ellas se excluyen 12 por corresponder a pedidos de funcionalidad que no relatan un comportamiento ya experimentado, y 3 por no versar sobre el fenómeno relevado: una relativa a la expresividad de la interfaz de programación de permisos, otra a una discrepancia de nomenclatura en el esquema publicado y la n.º 32581, que corresponde a OpenClaw y se excluye en la revisión del 09/10/2026. Quedan incluidas 31 incidencias, de las cuales 8 permanecen abiertas y 23 se encuentran cerradas a la fecha de consulta.

| **Categoría**                                         | **Casos** | **Observación**                                        |
|-------------------------------------------------------|-----------|--------------------------------------------------------|
| Candidatas según el criterio de búsqueda              | 46        | Período 28/11/2025 a 16/09/2026                        |
| Excluidas por corresponder a pedidos de funcionalidad | 12        | No relatan un comportamiento experimentado             |
| Excluidas por no versar sobre el fenómeno             | 3         | Expresividad de la interfaz, nomenclatura del esquema y otro proyecto (n.º 32581, excluida el 09/10/2026) |
| **Incluidas**                                         | **31**    | 8 abiertas y 23 cerradas                               |

*Tabla 13. Resultado del relevamiento de incidencias del repositorio de OpenCode. Fuente: elaboración propia sobre el relevamiento del 17/09/2026, revisado el 09/10/2026; nómina completa de las 46 incidencias en el Anexo VI, A.VI.6.*

### II.3.2 · Datos de la medición de la línea de base

Los valores agregados por estrato y ejecutor corresponden a la Tabla 4 del apartado I.3.2, y aquí se presenta la desagregación por problema. La Tabla 14 reúne los problemas de E2 y E4 con éxito declarado falso en al menos una repetición de la lectura principal y conserva N-21 como problema solo en la preregistrada. Las fracciones proceden de la medición que el autor coordina con el arnés del repositorio los días 20 y 21/10/2026, con tres repeticiones por problema y ejecutor; la corrección sigue el Anexo VI, A.VI.7.

| **Problema** | **`build`** | **Charles** | **Mecanismo observado** | **Consecuencia** | **Cuenta en la lectura principal (al menos 2/3)** |
|---|---|---|---|---|---|
| M-1 (E2) | 2/3 | 3/3 | Ruta absoluta en regla `read` | Bloqueo | Sí |
| M-2 (E2) | 2/3 | 2/3 | Ruta absoluta en regla `edit` | Bloqueo | Sí |
| M-10 (E2) | 3/3 | 3/3 | Ruta absoluta en regla de lectura de `.env` | Bloqueo | Sí |
| N-13 (E2) | 0/3 | 1/3 | Ruta absoluta en regla `edit` | Exposición | No, solo una repetición |
| N-14 (E2) | 3/3 | 3/3 | Ruta absoluta en regla `read` del directorio (Charles: 2/3; repetición 1: solo `list: deny`, sin ruta absoluta) | Exposición | Sí |
| N-21 (E2, solo preregistrada como problema) | 1/3 | 0/3 | Guarda `.env.local` alterada en una ejecución de `build`; exceso de alcance en la preregistrada | Bloqueo | No; preregistrada: 3/3 en ambos |
| N-23 (E2) | 3/3 | 3/3 | Ruta absoluta en regla `read` con `deny` | Exposición | Sí |
| S-1 (E4) | 2/3 | 3/3 | Ruta absoluta en regla `read` | Bloqueo | Sí, en E4 |

*Tabla 14. Éxito declarado falso por problema y ejecutor. Fuente: elaboración propia sobre los informes ecológicos y los archivos finales documentados en el documento de casos con error de la medición del 20 y el 21/10/2026 (registro de la evidencia, Anexo VI, A.VI.11). Las fracciones corresponden a la lectura principal; la última columna identifica la preregistrada de N-21.*

En la detección, realizada con el mismo arnés el 21/10/2026 sobre once defectos con tres repeticiones por ejecutor, D2 se detecta en 1/3 con `build` y 0/3 con Charles; N-23, en 0/3 y 1/3; y D5, en 0/3 y 1/3, respectivamente (informes de detección, registro de la evidencia, Anexo VI, A.VI.11). La lectura de estos resultados corresponde al apartado I.3.2.

El exceso de alcance se registra en el Anexo VI, A.VI.8.

### II.3.3 · Datos de la entrevista al referente

Los datos se presentan aquí en los términos en que fueron declarados u observados, sin interpretación; su lectura corresponde a los apartados II.5 y II.6. El registro completo consta en el Anexo VI, A.VI.5.

**Composición del equipo y adopción.** El equipo de desarrollo está integrado por cinco personas y comenzó a utilizar herramientas de programación basadas en agentes a comienzos de 2026. La referente atribuye la incorporación a dos motivos y los jerarquiza: la actualización tecnológica frente a la adopción creciente en el sector y, como factor determinante, la necesidad de sostener el volumen de trabajo comprometido sin ampliar la dotación de personal.

**Frecuencia y procedimiento.** La referente declara acceder a los archivos de configuración alrededor de cinco veces por semana, y precisa que se trata en general de consultas menores. Señala que la frecuencia tiende a disminuir por el uso creciente de un agente que el equipo desarrolló internamente para crear y configurar otros agentes, y que a medida que adquiere confianza en ese agente recurre con menor frecuencia a la revisión manual. El procedimiento habitual consiste en abrir y revisar los archivos correspondientes; cuando la información no resulta evidente, complementa la revisión consultando a un modelo de lenguaje.

**Episodios de comportamiento distinto del esperado.** Se registran dos. En el primero, un agente se invocó a sí mismo de manera reiterada, como resultado de una configuración que no producía el efecto esperado y de un modelo de bajo costo que interpretó que esa llamada le estaba habilitada, pese a que no debía estarlo. En el segundo, un agente operó a través de otro agente que la propia herramienta invoca internamente, cuya existencia y cuyas funciones la referente desconocía.

**Esfuerzo de comprensión y soluciones propias.** La referente relata haber revisado varios archivos y haber recurrido a una pizarra para representar la arquitectura de agentes y sus relaciones. Consultó, además, la configuración de su propio entorno mediante un agente con permisos elevados. A esas dos prácticas se suma el agente interno de creación y configuración ya mencionado. Los tres artefactos fueron construidos por el equipo sin intervención del autor de este informe.

**Consumo de tokens.** Se registran dos vías de consumo atribuibles a la configuración. La primera corresponde a la consulta del propio entorno mediante el agente de permisos elevados. La segunda corresponde a acciones que debieron repetirse porque la configuración no producía el comportamiento esperado. La referente no cuantificó el consumo, de modo que se acredita su existencia y no su magnitud.

**Respuesta al enfoque presentado.** Descripto el enfoque de la plataforma y el recorrido de consulta previsto, la referente señaló como aporte principal la posibilidad de identificar el archivo que determina cada valor vigente, información que hoy obtiene mediante la revisión manual de los distintos archivos de configuración. Manifestó asimismo la utilidad de poder realizar esa consulta de forma programática, de modo que un agente pueda conocer la configuración efectiva de su entorno o la de otro agente antes de operar.

**Datos no obtenidos.** La referente no cuantificó la duración de los episodios relatados ni el consumo de tokens, y no precisó qué proporción de sus cinco accesos semanales corresponde a consultas cuya respuesta no resulta inmediata. Esas ausencias sostienen la decisión de no producir una valoración monetaria del problema, conforme al apartado I.3.1, y las limitaciones del apartado II.6.3.
