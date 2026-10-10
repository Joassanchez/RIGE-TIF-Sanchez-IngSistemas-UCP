# Borrador · Encuesta de práctica y pedido a la referente (ADR-040)

Estado: borrador del ingeniero, 25/09/2026. Ajustado el 09/10/2026 según `PROTOCOLO-relevamiento-delegacion.md` (fuente F-2) y revisado dos veces el mismo día a pedido del autor: consentimiento informado, perfil (contexto y experiencia), método principal de opción única con vías manuales ampliadas, tipo de configuración cambiada (apariencia separable), frecuencia de delegación, texto libre condicionado y numeración oculta en el formulario. Versión en español implementada como Google Form con `encuesta-practica-form.gs`. ADR-040 aceptado el 25/09/2026 (consolidado en ADR-053). El pedido de la sección 2 ya fue enviado por el autor.

## 1. Encuesta de práctica

**Objetivo:** estimar cómo averiguan y cómo cambian hoy los desarrolladores la configuración de su herramienta agéntica (a mano, con la documentación, con comandos nativos o delegándolo en un modelo o agente) y si verifican el resultado. **No mide la línea de base**: respalda la representatividad del procedimiento delegado (P1 del protocolo), aporta a R-4 (verificación por el usuario) y amplía la base del componente 4 del problema. Es complementaria: la consulta al docente y el diseño de la medición no esperan sus resultados.

**Ficha para la regla de las tres preguntas (se completa al cerrar):**

| Pregunta | Respuesta |
|---|---|
| ¿Quién la produjo? | El autor, en el marco del PIF; interés declarado: sustentar el diseño de la línea de base de RIGE |
| ¿Con qué método y sobre qué universo? | Encuesta autoadministrada, anónima, no probabilística, difundida en `[DATO PENDIENTE: comunidades]`; universo: personas mayores de 18 años que usaron herramientas de programación basadas en agentes en los últimos tres meses y respondieron; sesgo de autoselección declarado |
| ¿Para qué período de referencia? | Recolección del `[fecha]` al `[fecha]`; las preguntas refieren a los últimos tres meses y al último episodio de cada persona |

**Reglas fijadas antes de abrir la encuesta** (protocolo, sección 4). Las letras remiten al orden de las opciones; los números, a la numeración interna de este borrador (el formulario no la muestra).

- **R-3 · pregunta 8.** Si la mayoría elige como método principal una vía no delegada (opciones a–f), el contraste cualitativo con dos o tres personas pasa a ser obligatorio y el procedimiento manual se declara sin medir en II.6.3. La opción j («No lo pude averiguar») se informa aparte.
- **R-4 · pregunta 9.** Si la mayoría de quienes delegaron (g–i en la pregunta 8) responde que comprobó la respuesta probando el comportamiento, el costo humano de verificar es parte central del problema y se revisa el diseño de la medición antes de ejecutarla.
- **P1 · pregunta 13.** Se consideran solo quienes cambiaron al menos un tipo de configuración distinto de la apariencia (pregunta 12, opciones b–g). Si la mayoría hizo el cambio principalmente a través de un agente o modelo (b–d en la pregunta 13), la encuesta aporta a P1 como fuente independiente de la referente (R-1). Si la mayoría lo hizo a mano (a), se informa como evidencia contraria a P1 en su variante de corrección.
- **Apariencia.** Los cambios solo de apariencia (tema, atajos, interfaz) se informan aparte y no cuentan para P1: no intervienen en la precedencia ni en los permisos que resuelve RIGE.
- **Población de RIGE.** Todos los resultados se informan también para el subconjunto que marcó OpenCode en la pregunta 2.

**Criterio de cierre (fijado antes de abrir):**

- La encuesta se cierra a los **14 días corridos** de su publicación. Al publicarla se registran aquí la fecha de apertura y la de cierre. No se prorroga ni se cierra antes según los resultados.
- **Mínimo de 30 respuestas válidas** (aceptan participar y usaron agentes). Con menos, se informan solo conteos, sin intervalos, y las reglas R-3, R-4 y P1 no se aplican: la encuesta se declara insuficiente para esos fines.
- Un subgrupo con menos de 10 respuestas (por ejemplo, quienes delegaron, para R-4, o quienes usan OpenCode) se informa en forma descriptiva y su regla no se aplica.

**Plan de análisis (fijado antes de abrir):**

- Proporciones con intervalo de confianza del 95 % por el método de Clopper-Pearson, el mismo del informe; sobre el total y, siempre por separado, sobre quienes usan OpenCode.
- Tiempo del último episodio (pregunta 8 ter): distribución por categoría, comparada entre quienes delegaron (g–i en la 8) y quienes no (a–f). Es descriptiva y sin prueba de hipótesis, porque la muestra no es probabilística.
- Respuestas «Otra» y texto libre: se codifican después del cierre (ingeniero, con revisión del autor); las categorías que surjan se declaran.
- Las respuestas del piloto se borran antes de abrir y no entran al análisis. Los duplicados no se pueden detectar sin romper el anonimato; se declara como límite.

**Antes de difundir:**

1. Revisar en la configuración del formulario que «Recopilar direcciones de correo» esté en «No recopilar» y que «Limitar a 1 respuesta» esté desactivado: esta última opción obliga a iniciar sesión con Google y rompe el anonimato.
2. **Piloto** con 3 o 4 personas que recorran todas las ramas: «No acepto», «No» en la pregunta 1, «Nunca me pasó» en la 7, «No lo pude averiguar» en la 8, «No» en la 11 y «No» en la 15. Sus respuestas se borran antes de abrir la encuesta y los ajustes que surjan se registran aquí.

**Idioma:** el texto usa voseo rioplatense. Si se difunde fuera de Argentina, conviene una versión en español neutro; para comunidades de OpenCode, mayormente angloparlantes, una versión en inglés equivalente.

**Compromisos que asume el autor con el consentimiento:** no pedir datos que identifiquen a la persona; publicar solo resultados agregados; eliminar las respuestas individuales al aprobarse el Proyecto Final; responder consultas en el correo indicado.

---

### Texto de la encuesta

**Título:** Cómo configurás tu herramienta de programación con agentes

**Sección 1 · Consentimiento informado** *(se muestra antes de cualquier pregunta)*

> **Quién la hace y para qué.** Soy Joaquín Sebastián Sánchez, estudiante de Ingeniería en Sistemas de Información en la Universidad de la Cuenca del Plata (Posadas, Argentina). Esta encuesta forma parte de mi Proyecto Final de carrera y busca entender cómo descubrís y modificás la configuración de las herramientas de programación con agentes que usás (por ejemplo, OpenCode, Claude Code o Cursor).
>
> **Qué te pido.** Responder hasta 17 preguntas, casi todas cerradas, sobre tu experiencia de los últimos tres meses. Lleva unos 5 minutos. La única pregunta de texto libre es opcional.
>
> **Participación voluntaria.** Podés dejar la encuesta en cualquier momento antes de enviarla, sin ninguna consecuencia. Como las respuestas son anónimas, una vez enviadas no es posible identificarlas para retirarlas.
>
> **Anonimato y datos.** La encuesta no pide tu nombre, tu correo ni datos de tu organización. Te pido que no los incluyas en la respuesta de texto libre. Los datos se tratan conforme a la Ley N.º 25.326 de Protección de los Datos Personales.
>
> **Uso de los resultados.** Las respuestas se analizan y se publican solo en forma agregada, en el informe del Proyecto Final. Las respuestas individuales se eliminan al aprobarse el proyecto.
>
> **Riesgos y beneficios.** Responder no implica riesgos previsibles ni beneficios directos para vos; contribuye a un trabajo académico.
>
> **Consultas.** joassanchez03@gmail.com

**C. ¿Aceptás participar?** *(una opción, obligatoria)*
- Sí: tengo 18 años o más, leí la información anterior y acepto participar
- No acepto → *fin de la encuesta*

**Sección 2 · Uso de herramientas**

**1. ¿Usaste alguna herramienta de programación con agentes en los últimos tres meses?** *(una opción)*
*Ayuda: herramientas que ejecutan tareas de varios pasos por su cuenta, como editar archivos o correr comandos. Por ejemplo: OpenCode, Claude Code, Cursor en modo agente, GitHub Copilot en modo agente o Codex CLI. El autocompletado de código solo no cuenta.*
- Sí
- No → *fin de la encuesta*

**Sección 3 · Tu uso**

**2. ¿Cuáles?** *(selección múltiple)*
- OpenCode
- Claude Code
- Cursor (modo agente)
- GitHub Copilot (modo agente o Copilot CLI)
- Codex CLI
- Gemini CLI
- Windsurf
- Cline o Roo Code
- Aider
- Otra: ____

**3. ¿Con qué frecuencia las usás?** *(una opción)*
- A diario · Varias veces por semana · Una vez por semana · Con menor frecuencia

**4. ¿En qué contexto las usás?** *(selección múltiple)*
- En mi trabajo · En proyectos personales · En el estudio

**5. ¿Cuántos años de experiencia tenés programando?** *(una opción)*
- Menos de 2 · De 2 a 5 · De 6 a 10 · Más de 10

**6. Tu configuración, ¿está repartida en más de un archivo o nivel?** *(una opción)*
*Ayuda: por ejemplo, un archivo global en tu usuario y otro dentro del proyecto, archivos de agentes o una variable de entorno que cambia el modelo.*
- Sí · No · No sé

**7. Pensá en la última vez que necesitaste saber qué configuración regía realmente: por ejemplo, qué modelo usaba un agente, si tenía permiso para ejecutar un comando o por qué un cambio no tuvo efecto. ¿Cuándo fue, aproximadamente?** *(una opción)*
- En la última semana · En el último mes · Hace más de un mes · Nunca me pasó → *pasa a la sección 5*

**Sección 4 · La última consulta**

**8. En esa última vez, ¿cuál fue el método principal con el que lo averiguaste?** *(una opción)*
- a. Abrí y leí los archivos de configuración
- b. Consulté la documentación oficial
- c. Usé un comando de la propia herramienta (por ejemplo, uno de depuración o de listado)
- d. Busqué en foros, issues de GitHub o Stack Overflow
- e. Le pregunté a un colega
- f. Prueba y error hasta que funcionó
- g. Le pregunté a un chat de IA (ChatGPT, Claude, etc.)
- h. Le pedí al propio agente de la herramienta que revisara la configuración
- i. Usé un agente, comando o guion que armé yo o mi equipo para eso
- Otra
- j. No lo pude averiguar → *pasa a la sección 5*

**8 bis. Si elegiste «Otra», ¿cuál?** *(texto corto, opcional)*

**8 ter. ¿Cuánto tiempo te llevó averiguarlo, aproximadamente?** *(una opción)*
- Menos de 5 minutos · De 5 a 15 minutos · De 15 a 60 minutos · Más de una hora

**9. ¿Comprobaste de alguna forma que la respuesta fuera correcta?** *(una opción)*
- Sí, probando el comportamiento · Sí, de otra forma · No · No sé

**10. ¿La respuesta resultó correcta?** *(una opción)*
- Sí · No (me di cuenta al comprobarla o más tarde) · No sé

**Sección 5 · Cambios en la configuración**

**11. En los últimos tres meses, ¿cambiaste la configuración de tu herramienta?** *(una opción)*
- Sí
- No → *pasa a la sección 7*

**Sección 6 · El último cambio**

**12. Pensá en el último cambio. ¿Qué cambiaste?** *(selección múltiple)*
- a. Apariencia: tema, colores, atajos de teclado o interfaz
- b. Modelos o proveedores
- c. Permisos: qué puede ejecutar, leer o editar el agente
- d. Agentes o subagentes
- e. Comandos o skills
- f. Servidores MCP o plugins
- g. Instrucciones o reglas (por ejemplo, AGENTS.md)
- Otra: ____

**13. ¿Cómo hiciste principalmente ese cambio?** *(una opción)*
- a. Edité los archivos a mano
- b. Le pedí al agente de la herramienta que hiciera el cambio
- c. Le pedí el texto a un chat de IA y lo pegué yo
- d. Usé un comando o asistente de la propia herramienta (por ejemplo, para crear un agente)
- Otra: ____

**Sección 7 · Frecuencia y comportamiento**

**14. En el último mes, ¿cuántas veces le pediste a un agente o a un chat de IA que revisara, explicara o cambiara tu configuración?** *(una opción)*
- Ninguna · 1 o 2 · 3 a 5 · 6 a 10 · Más de 10

**15. En los últimos tres meses, ¿algún agente se comportó de forma distinta de la que esperabas según tu configuración? Por ejemplo, ejecutó algo que creías restringido o usó otro modelo.** *(una opción)*
- Sí, una vez
- Sí, más de una vez
- No → *fin de la encuesta*
- No sé → *fin de la encuesta*

**Sección 8 · El episodio**

**16. (Opcional) Si querés, contanos brevemente qué pasó.** *(texto libre)*
*Ayuda: no incluyas nombres, correos ni datos de tu organización.*

**Mensaje final:** ¡Gracias por responder! Los resultados agregados se publican en el informe del Proyecto Final. Si querés conocerlos, escribime a joassanchez03@gmail.com.

---

**Notas de diseño (no se muestran):**

- **Consentimiento:** va primero y es obligatorio; quien no acepta termina sin ver ninguna pregunta. Incluye la mayoría de edad porque una encuesta abierta en foros puede alcanzar a menores.
- **Neutralidad:** el texto no menciona RIGE ni el problema que resuelve, para no sesgar las respuestas hacia la delegación o el error.
- **Numeración:** el formulario no muestra números, porque con los saltos aparecerían discontinuos; este borrador los conserva como identificadores del análisis.
- Las preguntas C, 1, 7, 8, 11 y 15 son de una opción porque en Google Forms solo esas admiten saltos condicionales.
- La pregunta 1 excluye el autocompletado: Stack Overflow 2025 registra un 13,8 % que usa IA solo en ese modo, que no corresponde a la población.
- Las preguntas 7 a 13 remiten a un **episodio concreto** para reducir la racionalización posterior (`catedra/AE1-guia.md`, 4.1).
- La pregunta 8 pide el método **principal** para que las preguntas 9 y 10 se refieran a uno solo. Separa las vías no delegadas (a–f) de las delegadas (g–i); la 13 hace lo mismo para el cambio (a manual; b–d delegadas) y cubre la práctica que relató la referente: corregir la configuración pidiéndoselo a un agente.
- La pregunta 12 separa los cambios de apariencia, que no cuentan para P1, de los que intervienen en la precedencia y los permisos.
- La pregunta 8 ter es la aproximación al costo humano de la consulta (dictamen DEV-AE2, Bloque A, pregunta 1; ADR-078, K-A): estimación retrospectiva, declarada así. Quien no pudo averiguarlo salta esta sección.
- La pregunta 14 aporta una frecuencia de delegación independiente de la referente (componente 4); es estimación retrospectiva y se declara así.
- La pregunta 10 no mide IB-1 (el error silencioso no es declarable). Su opción «No sé» ilustra por qué la línea de base no puede ser una encuesta.
- La pregunta 15 conecta con el relevamiento de incidencias (A.VI.6) sin repetirlo; la 16 solo se muestra a quien relata un episodio.
- La lista de herramientas de la pregunta 2 es orientativa; el autor la ajusta.

## 2. Pedido a la referente

**Canal:** `[DATO PENDIENTE: el mismo canal de la entrevista]`. **Motivo:** obtener el agente con que el equipo consulta su configuración, para usarlo como ejecutor principal de la línea de base.

> Hola, Valeria. Te escribo por el proyecto final. En la entrevista me contaste que consultan la configuración del entorno mediante un agente propio. Quería pedirte, si es posible, la definición de ese agente (el archivo con sus instrucciones, el modelo y los permisos) y, si también lo tienen, la del agente con el que crean otros agentes.
>
> Los usaría para medir cómo responde un agente real ante preguntas sobre configuración, antes y después de disponer de la herramienta que estoy desarrollando. Tres cosas:
> 1. Si alguno se modificó después de nuestra entrevista, ¿me podrías pasar la versión anterior, o indicarme la fecha de la última modificación?
> 2. Antes de usarlo quito credenciales, rutas internas y cualquier dato de EMSA, y te muestro la versión que usaría.
> 3. ¿Me autorizás a citarlo en el informe como aporte del equipo de Sistemas de EMSA?
>
> ¡Gracias!

**Al recibirlo:**
- Registrar la fecha del archivo o la del commit (condición de ADR-016).
- Identificar qué agente consulta la configuración y cuál crea agentes.
- Anotar el modelo que usa: será el modelo principal (ADR-040, E-1).
- Dar de alta la fuente en `01-relevamiento/fuentes.md`.
- Guardar la autorización como evidencia.

### 2.2 · Reenvío con confirmación de la práctica (enviado por el autor el 09/10/2026)

**Canal:** el mismo del pedido original, por escrito, para que la respuesta quede fechada. **Motivo:** fuente F-1 del protocolo; reemplaza el relato oral de la segunda entrevista por una constancia.

> Hola, Valeria. Retomo el pedido que te hice sobre el agente con el que consultan la configuración. Además, necesito confirmar por escrito algo que me comentaste, porque lo voy a usar para diseñar la medición del proyecto:
>
> 1. Cuando necesitan corregir o cambiar la configuración del entorno (permisos, modelos, agentes), ¿lo hacen mayormente pidiéndoselo a un agente, o editando los archivos a mano? Si podés, una proporción aproximada.
> 2. Cuando el agente hace el cambio o responde qué configuración rige, ¿verifican después que sea correcto? ¿Cómo?
> 3. ¿Con qué herramienta y modelo lo hacen hoy?
>
> Si te queda más cómodo, también podés mandarme la definición del agente, como te comenté antes (quito credenciales y datos de EMSA antes de usarla). ¡Gracias!

La pregunta 2 aporta a R-4 desde la práctica del equipo de la referente; su respuesta no reemplaza a la de la encuesta.
