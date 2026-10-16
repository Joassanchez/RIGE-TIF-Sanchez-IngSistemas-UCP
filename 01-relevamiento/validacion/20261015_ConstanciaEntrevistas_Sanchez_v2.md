# Constancia de entrevistas y de la extensión del acta de validación

> **Transcripción.** Este archivo transcribe la versión 2 que la referente firmó el 15/10/2026 en forma presencial: `20261015_ConstanciaEntrevistas_Sanchez_v2_firmada.pdf` (SHA-256 `4bbda18c…5dc713`). Si difieren, prevalece el PDF firmado. La referente confirmó los 11 renglones de la sección 4 y no corrigió ninguno.

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


## 4. Cambios posteriores a la sesión del 26/09/2026 y a la extensión

| Campo | Contenido |
|---|---|
| Fecha | 15/10/2026 |
| Modalidad | Presencial |
| Motivo | Presentar los cambios hechos al catálogo, al modelo del dominio y a las reglas después de la sesión del 26/09 y de la extensión del 01/10, y obtener la conformidad de la referente |

El autor explicó cada cambio respecto de lo presentado antes. La referente marca si lo confirma o lo corrige.

| N.º | Elemento | Redacción vigente | Confirmo | Corrijo |
|---|---|---|---|---|
| 4.1 | L-06 · Línea de comandos | Además de valores, permisos y hallazgos, la línea de comandos lista los agentes del proyecto como punto de partida. Quedan diferidos los listados de los demás elementos y la consulta inversa | ☒ | |
| 4.2 | RF-02 · Decisión de permiso (CA-8) | Si la regla determinante es una declaración, RIGE informa la entrada, el archivo y la línea de esa declaración; si es nativa, la identifica como nativa, sin archivo | ☒ | |
| 4.3 | RF-02 · Subagentes (CA-3) y RD-05 | El subagente lanzado mediante `task` se rige por su propio conjunto de reglas, más una denegación de `task` y otra de `todowrite`; las reglas del agente que lo lanza no se le aplican. Se corrige lo validado el 26/09, que decía que el subagente heredaba las denegaciones del agente padre | ☒ | |
| 4.4 | RF-02 · Ruta del archivo (CA-9) | Ante una acción sobre un archivo del proyecto expresada con ruta absoluta o relativa, RIGE informa la misma decisión que OpenCode, que evalúa la ruta relativa al proyecto | ☒ | |
| 4.5 | RF-07 · Defectos | La detección de referencias no resueltas y de elementos sin uso opera por nombre, sin la representación de vínculos de RF-13. Una regla de permiso escrita con ruta absoluta, que no tiene efecto, se detecta como «regla sin efecto» | ☒ | |
| 4.6 | RNF-07 · Rendimiento | Una consulta por línea de comandos finaliza en menos de 2 segundos sobre un proyecto del doble de tamaño que un proyecto real de referencia (el mayor entre el público openchamber y el del equipo), en el equipo de referencia. El umbral se funda en el tiempo del comando nativo de OpenCode (mediana de 1,18 s) | ☒ | |
| 4.7 | Relación Resolución–Elemento | Una resolución comprende uno o muchos elementos, declarados o incorporados por la herramienta | ☒ | |
| 4.8 | Regla de permiso (entidad y vocabulario) | Regla que produce una decisión de permiso, nativa de la herramienta o escrita por el usuario en una declaración | ☒ | |
| 4.9 | RE-01 | Un elemento ingresa a la resolución si proviene de una entrada legible o si la herramienta lo incorpora sin declaración (nativo); si una entrada es ilegible, su carga se detiene con error y se registra el hallazgo | ☒ | |
| 4.10 | RE-03 | Un elemento declarado se marca sin uso solo si ninguna declaración de un agente ni de un comando lo nombra | ☒ | |
| 4.11 | RR-02 | RIGE no expone el contenido que una sustitución incorpora (variable de entorno o archivo); informa su origen y su condición de definido o no definido | ☒ | |

---

La referente confirma las secciones 1 a 3 (firmadas en la versión 1 de este documento, el 15/10/2026) y los renglones de la sección 4 marcados en «Confirmo». Los corregidos quedan como los dejó.

Firma: Ing. Valeria Areco (firmado)

Aclaración: Valeria Areco

Fecha: 15/10/2026
