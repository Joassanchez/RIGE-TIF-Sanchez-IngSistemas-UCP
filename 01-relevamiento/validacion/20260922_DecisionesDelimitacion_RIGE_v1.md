# Decisiones de delimitación del sistema — RIGE

**Proyecto:** RIGE · Plataforma local para la resolución y explicación de la configuración efectiva y su procedencia en herramientas de programación basadas en agentes
**Autor:** Sánchez, Joaquín Sebastián
**Capítulo del informe:** III · Entorno y Dominio del Sistema de Información (apartados III.3 y III.4)
**Versión:** v1 · 22 de septiembre de 2026

---

## Datos de la sesión de validación

| Campo | Contenido |
| --- | --- |
| Referente | Valeria Areco — Desarrolladora, equipo de Sistemas de EMSA |
| Fecha y hora | |
| Canal | |
| Duración | |
| Modalidad acordada | El equipo de proyecto presenta las decisiones adoptadas por escrito; el referente las confirma o las rechaza |

---

## Cómo leer este documento

Cada decisión se presenta con su enunciado, el motivo que la sostiene y la consecuencia que tiene sobre lo que el sistema hará o no hará. El referente marca **Confirma** o **Rechaza** y, si corresponde, deja su observación.

Una exclusión confirmada constituye una frontera del sistema. Una exclusión rechazada vuelve al análisis y se reformula.

---

## Sección 1 · Decisiones sujetas a confirmación del referente

### L-01 · Edición de archivos de configuración

**Decisión.** RIGE no edita ni modifica ningún archivo de configuración. Opera en modo de solo lectura.

**Motivo.** Las soluciones de terceros relevadas ya editan y navegan la configuración; el aporte diferencial de RIGE consiste en explicar el estado efectivo y su procedencia. Además, un sistema que modificara el mismo estado que informa dejaría de ser auditable, porque sería juez y parte.

**Consecuencia.** El desarrollador localiza la declaración que determina un valor y la abre en su editor, donde efectúa el cambio. La edición ocurre fuera de RIGE.

☐ Confirma ☐ Rechaza

Observaciones:

---

### L-02 · Comandos de terminal compuestos

**Decisión.** RIGE informa la decisión de permiso únicamente para comandos de terminal simples. Ante un comando compuesto —tuberías, encadenamientos, redirecciones, subshells y sustituciones de comandos— emite una advertencia en lugar de informar una decisión.

**Motivo.** Evaluar un comando compuesto exige reproducir el análisis sintáctico de la propia herramienta. Un error en esa reproducción produciría el peor resultado posible: una decisión incorrecta informada con precisión aparente. Ante la duda, el sistema advierte en lugar de arriesgar una respuesta errónea.

**Consecuencia.** Una parte de los comandos de uso habitual quedará sin decisión informada.

**Consulta asociada al referente.** ¿Qué proporción de los comandos que el equipo utiliza habitualmente son compuestos? El dato permite dimensionar cuánto deja afuera esta exclusión.

☐ Confirma ☐ Rechaza

Observaciones:

---

### L-03 · Credenciales de autenticación

**Decisión.** RIGE no lee, no resuelve y no muestra credenciales de autenticación. Respecto de las variables de entorno, informa el nombre de la variable y su condición de definida o no definida, nunca su contenido.

**Motivo.** Las credenciales determinan el acceso a los modelos, no el comportamiento de los agentes, que es el objeto del sistema. Exponerlas convertiría a RIGE en un riesgo de seguridad en lugar de una herramienta de auditoría.

**Consecuencia.** El sistema no permite diagnosticar problemas de autenticación.

☐ Confirma ☐ Rechaza

Observaciones:

---

### L-04 · Uso compartido, en servidor o por equipos

**Decisión.** RIGE es de uso individual y ejecución local. No contempla uso compartido, instalación en servidor ni estado común entre varios usuarios.

**Motivo.** La frontera del sistema se sitúa en el entorno de trabajo individual del desarrollador. La ejecución local y sin conexión es coherente con esa frontera y con el carácter auditable de la herramienta.

**Consecuencia.** Cada integrante de un equipo puede usar RIGE en su propio entorno. Lo que no existe es un estado compartido entre ellos ni una vista conjunta del equipo.

☐ Confirma ☐ Rechaza

Observaciones:

---

### L-05 · Herramientas y versiones cubiertas

**Decisión.** El proyecto cubre exclusivamente OpenCode en su versión 1.18.25, que permanece congelada durante todo el desarrollo. Ante otra versión instalada, RIGE advierte y no presenta sus resultados como válidos.

**Motivo.** Las reglas de precedencia y de fusión se modifican entre versiones de la herramienta. La versión fija es lo que permite verificar que el resultado de RIGE coincide con el comportamiento real de OpenCode. La arquitectura separa un núcleo independiente de la herramienta de un adaptador específico, de modo que incorporar otras herramientas es trabajo posterior y no exige rehacer el sistema.

**Consecuencia.** Otras herramientas de programación agéntica y otras versiones de OpenCode quedan fuera del alcance comprometido.

☐ Confirma ☐ Rechaza

Observaciones:

---

### L-06 · Alcance de la salida por línea de comandos (CLI)

**Decisión.** Se incorpora al alcance comprometido un comando único que, dado un proyecto y un agente, devuelve sus valores efectivos con la procedencia de cada uno, incluidos el archivo y la posición donde se encuentra la declaración determinante, en formato estructurado, determinista y legible por máquina.

Quedan diferidos como trabajo posterior: la consulta de decisiones de permiso por CLI, los listados de elementos, la exportación del ecosistema completo y la consulta inversa.

**Motivo.** Esta necesidad surge de la sesión de trabajo con el referente: un agente que crea o modifica configuración necesita saber sobre qué archivo corresponde intervenir. El comando mínimo cubre esa necesidad y atiende de manera directa una de las consecuencias acreditadas del problema, que es modificar archivos que no prevalecen sobre el estado efectivo. El alcance acotado evita comprometer un desarrollo que excedería las horas disponibles del cuatrimestre.

**Consecuencia.** El agente externo obtiene valores efectivos y ubicación de la declaración determinante. No obtiene, en esta etapa, decisiones de permiso por esta vía.

☐ Confirma ☐ Rechaza

Observaciones:

---

### L-07 · RIGE no aplica ni valida los cambios del agente

**Decisión.** RIGE informa el estado efectivo de la configuración. No aplica cambios, no los valida y no verifica el resultado de las ediciones que un agente externo realice a partir de la información entregada. La responsabilidad sobre esas ediciones corresponde al desarrollador que opera el agente.

**Motivo.** Se desprende del modo de operación de solo lectura declarado en L-01. Se declara de manera expresa para evitar que se interprete que RIGE participa de la escritura o que avala su resultado.

**Consecuencia.** Si el agente aplica un cambio incorrecto, RIGE no lo impide ni lo advierte en el momento. Un nuevo análisis posterior sí mostrará el estado efectivo resultante.

☐ Confirma ☐ Rechaza

Observaciones:

---

### L-08 · Terminología normativa del proyecto

**Decisión.** Se adoptan los siguientes términos, que rigen en todo el informe y en la interfaz del sistema:

| Término | Definición operativa |
| --- | --- |
| Entrada de configuración | Cada una de las vías por las que OpenCode incorpora configuración al resolver el estado efectivo, sea o no un archivo. |
| Archivo de configuración | La entrada que se materializa en un archivo del disco, con ruta y posición. |
| Declaración | Cada asignación concreta escrita dentro de una entrada. |
| Procedencia | Cadena que va del valor efectivo hasta la declaración que lo determina, con su entrada, archivo y posición. |
| Permiso | La decisión resultante para un agente y una acción: permitida, sujeta a confirmación o denegada. |
| Regla de permiso | La declaración que produce esa decisión, de carácter nativo o declarado por el usuario. |

**Motivo.** La documentación de la herramienta y el uso corriente emplean términos distintos para lo mismo —fuente, capa, alcance, nivel— y usan «permiso» tanto para la decisión como para la regla. Fijar el vocabulario evita que la ambigüedad se traslade a los requisitos y a las tablas del sistema.

**Consulta asociada al referente.** ¿Qué palabra usa el equipo para referirse a las distintas vías por las que llega la configuración? Si difiere de la adoptada, se registra como sinónimo en el glosario del dominio.

☐ Confirma ☐ Rechaza

Observaciones:

---

### L-09 · Comparación entre estados y validación contra el esquema

**Decisión.** Quedan fuera del alcance la comparación entre dos estados resueltos en momentos distintos y la validación completa de los archivos contra el esquema publicado de la herramienta.

**Motivo.** Ambas son funciones distintas de resolver y explicar el estado efectivo, y cada una requiere diseño de interfaz y de pruebas propio. RIGE sí detecta entradas ilegibles, que es la condición que impide resolver.

**Consecuencia.** El sistema no responde qué cambió entre dos momentos ni actúa como validador de sintaxis de la configuración.

☐ Confirma ☐ Rechaza

Observaciones:

---

## Conformidad del referente

Las decisiones L-01 a L-09 fueron presentadas, leídas y tratadas en la fecha consignada al inicio de este documento.

Decisiones confirmadas:

Decisiones rechazadas o con observación:

Observaciones generales:

Firma o constancia de conformidad del referente:

---
---

## Sección 2 · Puntos que no corresponden al referente

Los puntos de esta sección no se someten a confirmación del referente, por no constituir decisiones de expectativa sobre lo que el sistema hará, sino verificaciones técnicas o cuestiones de la cátedra. Se consignan aquí para dejar registro de que están identificados y pendientes.

### 2.1 · Verificaciones técnicas pendientes

| Cód. | Qué verificar | Contra qué | Estado |
| --- | --- | --- | --- |
| RD-05 | Que el permiso de un subagente derive de la herencia declarativa desde el agente que puede invocarlo | Código fuente del tag 1.18.25 | Pendiente |
| H-09 | Que una sustitución de variable de entorno no definida sea reemplazada por texto vacío sin advertencia | Código fuente del tag 1.18.25 y ejecución de escenario controlado | Pendiente de acreditación en el relevamiento técnico |
| RR-04 | Que la advertencia ante comando compuesto sea el comportamiento técnicamente posible y no haya un subconjunto de compuestos resolubles con seguridad | Evaluador de permisos de la herramienta | Pendiente |

Los resultados de estas verificaciones se incorporan al relevamiento técnico del Anexo I y al registro de reglas de negocio con su estado actualizado.

### 2.2 · Consulta pendiente con el docente

**Capa de persistencia del prototipo v1.** RIGE es un sistema de solo lectura por decisión de diseño declarada, de modo que no requiere persistencia por necesidad funcional. Se adopta un caché de resolución indexado por hash de los archivos de entrada, con finalidad exclusiva de optimización, justificado porque el CLI puede ser invocado repetidamente por un agente externo y porque las entradas pueden ser modificadas mientras RIGE opera. El sistema escribe únicamente en su propio almacén y nunca en las entradas de configuración.

Queda por consultar con el docente si esta solución satisface la estación de persistencia que exige el recorrido vertical del prototipo v1, o si corresponde acordar una excepción fundada en que la decisión arquitectónica de mayor riesgo del proyecto es la fidelidad de la resolución respecto del comportamiento de la herramienta, y no el almacenamiento.

### 2.3 · Alcance sujeto al presupuesto de horas

El conjunto de requisitos comprometidos como *Must* debe coincidir exactamente con el producto mínimo viable del Capítulo V, y ambos dependen del presupuesto efectivo de horas-persona del cuatrimestre, que todavía no está cerrado. La distribución tentativa es la siguiente y queda sujeta a ese cálculo.

| Función | Propuesta tentativa |
| --- | --- |
| F1 · Descubrimiento del ecosistema | Must |
| F2 · Resolución con procedencia | Must |
| F4 · Explicación de permisos, limitada a comandos simples | Must |
| F5 · Verificación y resumen, en sus hallazgos principales | Must |
| CLI mínimo (L-06) | Must |
| F3 · Relaciones del ecosistema | Should |
| F6 · Exploración y exportación | Should |
| Matriz de agentes por tipo de permiso | Could |
| Consulta inversa de agentes por acción | Could |

Una vez determinado el presupuesto de horas, esta tabla se cierra y se traslada al catálogo de requisitos con la prioridad MoSCoW y su motivo en cada fila.
