# Constancia de entrevistas y de la extensión del acta de validación

> **Transcripción.** Este archivo transcribe la constancia firmada por la referente el 15/10/2026, en forma presencial: `20261015_ConstanciaEntrevistas_Sanchez_v1_firmada.pdf` (SHA-256 `016b5d5b…0d2ec2`). Si difieren, prevalece el PDF firmado. El borrador previo incluía una pregunta sobre cómo se resuelve hoy la consulta y una aclaración sobre la validación de la maqueta v0 (fechada el 03/09 en el informe de la AE1). Ninguna de las dos figura en la versión firmada, así que esta constancia no las respalda.

**Proyecto:** RIGE · Proyecto Final de Grado · Ingeniería en Sistemas de Información · UCP, Sede Posadas

**Autor:** Joaquín Sebastián Sánchez

**Referente:** Valeria Areco, desarrolladora del equipo de Sistemas de Electricidad de Misiones S. A. (EMSA)

**Reconstrucción.** Este documento se escribe el 15/10/2026. La entrevista 1 se toma del registro consignado en el informe de la AE1; la entrevista 2 y la extensión del acta, de lo consignado en el informe de la AE2 (apartado II.3.3 y acta de validación) y de la memoria del autor. Ninguna de las tres instancias tiene grabación. La referente confirma todas las afirmaciones.

---

## 1. Entrevista 1

| Campo | Contenido |
|---|---|
| Fecha | 29/08/2026 |
| Modalidad | Entrevista semiestructurada, presencial |
| Duración aproximada | 30 minutos |
| Registro | Respuestas registradas por el autor y consignadas en el informe de la AE1 |
| Motivo | Charla de seguimiento del proyecto. Se aplicó el guion de siete preguntas y se presentó la maqueta v0 |

| N.º | Pregunta | Respuesta registrada |
|---|---|---|
| 1.1 | ¿Cuántas personas integran el equipo de desarrollo del área de Sistemas? | El equipo está integrado por cinco personas. |
| 1.2 | ¿Desde cuándo el equipo utiliza herramientas de agentes de programación y qué motivó su incorporación? | La incorporación se produce a comienzos de 2026. El motivo combina dos razones: la actualización tecnológica del equipo, que sigue la adopción de estas herramientas en el sector, y, como razón determinante, sostener el volumen de entrega comprometido sin ampliar la dotación, porque la carga de trabajo creció y la incorporación de personal no era una alternativa disponible. |
| 1.3 | ¿Con qué frecuencia necesita averiguar cómo está configurado un agente, una skill o un permiso? | Alrededor de cinco consultas por semana, en general menores. Valor estimativo. El informe de la AE1 consignó diez por un error de registro del autor. |
| 1.4 | ¿Le ocurrió modificar un archivo de configuración y que el cambio no produjera efecto? | Sí. En buena parte de los casos el cambio sin efecto no se advierte en el momento y se detecta más tarde, por un comportamiento que no coincide con lo esperado. |
| 1.5 | ¿Cuál es el costo horario de referencia de una hora de trabajo de desarrollo en el área? | La referente informó un valor estimativo y después pidió que no se citara. El proyecto no lo usa y toma un valor de mercado de una fuente propia. |
| 1.6 | Presentada la maqueta: ¿la representación propuesta responde la pregunta que hoy resuelve de manera manual? | Conformidad con la representación propuesta y con el enfoque del recorrido. El aporte más directo es la indicación del archivo que determina cada valor vigente. |

## 2. Entrevista 2

| Campo | Contenido |
|---|---|
| Fecha | 24/09/2026 |
| Modalidad | Entrevista semiestructurada, presencial |
| Duración aproximada | 30 minutos |
| Registro | Sin grabación; lo conversado consta en el informe de la AE2 (apartado II.3.3) |
| Motivo | Charla de seguimiento del proyecto, sin guion fijo |

| N.º | Lo que se conversó |
|---|---|
| 2.1 | La frecuencia de consulta manual tiende a bajar porque el equipo usa cada vez más un agente desarrollado internamente para crear y configurar otros agentes; a medida que gana confianza en él, revisa menos a mano |
| 2.2 | Cuando el equipo necesita corregir o cambiar la configuración (permisos, modelos, agentes), lo hace siempre pidiéndoselo a un agente |
| 2.3 | La referente consultó la configuración de su propio entorno mediante un agente con permisos elevados |
| 2.4 | Hay consumo de tokens atribuible a la configuración por dos vías: esa consulta con el agente de permisos elevados, y acciones repetidas porque la configuración no producía el comportamiento esperado. No lo cuantificó |
| 2.5 | Episodio: un agente se invocó a sí mismo en forma reiterada, por una configuración que no producía el efecto esperado y un modelo de bajo costo que interpretó que esa llamada le estaba permitida |
| 2.6 | Episodio: un agente operó a través de otro agente que la herramienta invoca internamente, cuya existencia y funciones la referente desconocía |
| 2.7 | Señaló la utilidad de que la consulta sea programática, para que un agente conozca la configuración efectiva de su entorno o la de otro agente antes de operar |
| 2.8 | Por lo anterior, la maqueta presentada el 29/08 deja de responder a la práctica del equipo: se pide simplificar la interfaz gráfica y agregar una interfaz de línea de comandos pensada para que la use un agente. La maqueta reformulada (línea de comandos e interfaz gráfica de cinco pantallas) se valida en la sesión del 26/09, que consta en el acta |
| 2.9 | El equipo usa para configurar la herramienta un agente propio de OpenCode, «[AUX] Charles» |

## 3. Extensión del acta de validación del 26/09/2026

| Campo | Contenido |
|---|---|
| Fecha | 01/10/2026 |
| Modalidad | Conversación presencial |
| Registro | Sin registro escrito en la fecha; se deja constancia en este documento |
| Motivo | Presentar los cambios hechos al catálogo y al modelo del dominio después de la sesión del 26/09 y obtener la conformidad de la referente |
| Versión del catálogo | La del repositorio del proyecto el 01/10/2026 (commit `8343508`); los enunciados de esta tabla coinciden con esa versión |

El autor explicó en qué difiere cada elemento de lo presentado el 26/09 y la referente lo aceptó.

| N.º | Elemento | Cambio |
|---|---|---|
| 3.1 | RF-12 | Reformulado: RIGE informa la localización de cada declaración en el formato ruta:línea:columna, con ruta absoluta, por ambas interfaces |
| 3.2 | RF-14 | Reformulado: RIGE informa por línea de comandos el estado resuelto completo de un proyecto: sus elementos, los valores efectivos con su procedencia y los hallazgos |
| 3.3 | RNF-04 | Reformulado: RIGE nunca expone el contenido que una sustitución incorpora a una declaración; informa su origen (el nombre de la variable de entorno o la ruta del archivo) y su condición de definido o no definido |
| 3.4 | RF-16 | Nuevo: RIGE lista los agentes del proyecto, declarados por el usuario e incorporados por la herramienta, e identifica cada uno como tal, por ambas interfaces |
| 3.5 | RF-17 | Nuevo: RIGE conserva cada resolución de un proyecto con su fecha y el resumen de las entradas leídas, y permite recuperarla |
| 3.6 | RNF-09 | Nuevo: la interfaz web local atiende únicamente solicitudes dirigidas a la dirección local del equipo y no permite que otro origen lea sus respuestas |
| 3.7 | RNF-10 | Nuevo: RIGE conserva el aviso de copyright y la licencia MIT de OpenCode en el código que incorpora, y lo declara en su distribución |
| 3.8 | Modelo del dominio | Relación nueva: una declaración origina reglas de permiso; multiplicidades corregidas |

---

Firma: Ing. Valeria Areco (firmado)

Aclaración: Valeria Areco

Fecha: 15/10/2026
