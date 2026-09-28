# Borrador · Encuesta de práctica y pedido a la referente (ADR-040)

Estado: borrador del ingeniero, 25/09/2026. Lo revisa y ajusta el autor antes de difundirlo. ADR-040 aceptado el 25/09/2026. El pedido de la sección 2 ya fue enviado por el autor.

## 1. Encuesta de práctica

**Objetivo:** estimar cómo resuelven hoy los desarrolladores la consulta sobre la configuración efectiva de su herramienta agéntica: a mano, con la documentación, con comandos nativos o delegándola en un modelo o agente. **No mide la línea de base**: respalda la representatividad del procedimiento delegado (ADR-040, E-3) y amplía la base del componente 4 del problema.

**Ficha para la regla de las tres preguntas (se completa al cerrar):**

| Pregunta | Respuesta |
|---|---|
| ¿Quién la produjo? | El autor, en el marco del PIF; interés declarado: sustentar el diseño de la línea de base de RIGE |
| ¿Con qué método y sobre qué universo? | Encuesta autoadministrada, no probabilística, difundida en `[DATO PENDIENTE: comunidades]`; universo: usuarios de herramientas de programación basadas en agentes que respondieron; sesgo de autoselección declarado |
| ¿Para qué período de referencia? | Del `[fecha]` al `[fecha]`; las preguntas refieren al último episodio de cada persona |

**Regla fijada antes de abrir la encuesta (ADR-040, E-3):** si la mayoría responde que resuelve la consulta a mano (opciones a–c de la pregunta 5, sin d–f), el contraste cualitativo con dos o tres personas pasa a ser obligatorio y el procedimiento manual se declara sin medir en II.6.3.

**Idioma:** las comunidades de OpenCode son mayormente angloparlantes. Conviene difundir una versión en inglés equivalente, traducida del texto final en español.

---

### Texto de la encuesta

**Introducción (se muestra antes de la primera pregunta)**

> Esta encuesta forma parte de un Proyecto Integrador Final de Ingeniería en Sistemas de Información (Universidad de la Cuenca del Plata, Argentina). Pregunta cómo averiguás qué configuración rige efectivamente en tu herramienta de programación con agentes. Lleva unos 3 minutos, es anónima y no recoge datos personales. Los resultados se publican solo de forma agregada. Responder implica aceptar ese uso.

**1. ¿Qué herramientas de programación basadas en agentes usaste en los últimos tres meses?** *(selección múltiple)*
- OpenCode
- Claude Code
- Cursor
- GitHub Copilot (modo agente)
- Codex CLI
- Otra: ____
- Ninguna → *fin de la encuesta*

**2. ¿Con qué frecuencia usás esas herramientas?** *(una opción)*
- A diario · Varias veces por semana · Semanalmente · Con menor frecuencia

**3. Tu configuración (modelos, permisos, agentes, reglas), ¿está distribuida en más de un archivo o nivel (global, proyecto, variables de entorno)?** *(una opción)*
- Sí · No · No sé

**4. Pensá en la última vez que necesitaste saber qué configuración regía realmente (por ejemplo, qué modelo usaba un agente, si tenía permiso para un comando o por qué un cambio no tuvo efecto). ¿Cuándo fue, aproximadamente?** *(una opción)*
- En la última semana · En el último mes · Hace más de un mes · Nunca me pasó → *pasa a la pregunta 8*

**5. En esa última vez, ¿cómo lo averiguaste?** *(selección múltiple)*
- a. Abrí y leí los archivos de configuración
- b. Consulté la documentación oficial
- c. Usé un comando de la propia herramienta (por ejemplo, uno de depuración o de listado)
- d. Le pregunté a un modelo de lenguaje en un chat, pegándole los archivos
- e. Le pedí al propio agente de la herramienta que inspeccionara la configuración
- f. Usé un agente, comando o guion que armé yo o mi equipo para eso
- g. Otra: ____

**6. ¿Verificaste de alguna forma que la respuesta obtenida fuera correcta?** *(una opción)*
- Sí, probando el comportamiento · Sí, de otra forma: ____ · No · No sé

**7. ¿La respuesta resultó correcta?** *(una opción)*
- Sí · No, y lo descubrí después · No lo sé

**8. En los últimos tres meses, ¿algún agente se comportó de forma distinta de la que esperabas según tu configuración (por ejemplo, ejecutó algo que creías restringido o usó otro modelo)?** *(una opción)*
- Sí, una vez · Sí, más de una vez · No · No sé

*(Opcional)* **9. Si querés, contanos brevemente ese episodio.** *(texto libre)*

---

**Notas de diseño (no se muestran):**
- Las preguntas 4 a 7 remiten a un **episodio concreto** para reducir la racionalización posterior (`catedra/AE1-guia.md`, 4.1).
- La pregunta 5 separa las vías d–f (delegadas) de a–c (manuales). Su proporción es el dato que usa ADR-040.
- La pregunta 7 no mide IB-1 (el error silencioso no es declarable). Su opción «No lo sé» ilustra por qué la línea de base no puede ser una encuesta.
- La pregunta 8 conecta con el relevamiento de incidencias (A.I.6) sin repetirlo.
- La lista de herramientas de la pregunta 1 es orientativa; el autor la ajusta.

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
