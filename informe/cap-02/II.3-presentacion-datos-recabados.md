## II.3 · Presentación de los datos recabados

Los registros extensos constan en el Anexo VI. La interpretación de los resultados corresponde a los apartados II.5 y II.6.

### II.3.1 · Datos del relevamiento documental de incidencias

El autor releva el historial público de incidencias de OpenCode mediante búsqueda y clasificación por título, con un único codificador. La consulta del 17/09/2026 arroja 46 candidatas que abarcan del 28/11/2025 al 16/09/2026, según el criterio del Anexo VI, A.VI.6.

Se excluyen 12 pedidos de funcionalidad que no relatan un comportamiento experimentado. Otra exclusión corresponde a la expresividad de la interfaz de programación de permisos. Una más trata una discrepancia de nomenclatura en el esquema publicado. La revisión del 09/10/2026 excluye la n.º 32581 porque corresponde a OpenClaw. Quedan incluidas 31 incidencias, de las cuales 8 permanecen abiertas y 23 se encuentran cerradas a la fecha de consulta.

| **Categoría**                                         | **Casos** | **Observación**                                        |
|-------------------------------------------------------|-----------|--------------------------------------------------------|
| Candidatas según el criterio de búsqueda              | 46        | Período 28/11/2025 a 16/09/2026                        |
| Excluidas por corresponder a pedidos de funcionalidad | 12        | No relatan un comportamiento experimentado             |
| Excluidas por no versar sobre el fenómeno             | 3         | Expresividad de la interfaz, nomenclatura del esquema y otro proyecto (n.º 32581, excluida el 09/10/2026) |
| Incluidas                                             | 31        | 8 abiertas y 23 cerradas                               |

*Tabla 13. Resultado del relevamiento de incidencias del repositorio de OpenCode. Fuente: elaboración propia sobre el relevamiento del 17/09/2026, revisado el 09/10/2026; nómina completa de las 46 incidencias en el Anexo VI, A.VI.6.*

La clasificación por título de ese codificador distribuye las 31 incidencias en 10 de precedencia y fusión, 10 de decisión de permiso y 1 de valor implícito. Otras 2 quedan fuera del compromiso del período y 8 fuera de alcance. El corpus corresponde al período indicado y carece de casos clasificados como ruta absoluta (Anexo VI, A.VI.6).

La búsqueda complementaria del autor del 19/10/2026 identifica tres antecedentes de reglas con ruta absoluta ignoradas sin aviso: las incidencias n.º 40945, 46133 y 48049. Un codificador busca por título y lee los reportes completos del mismo repositorio, publicados entre el 06/08/2026 y el 09/09/2026 (ns-calvinwu, 2026; ouyangjian28, 2026; nlscott, 2026). Se informan por separado de las 31 incidencias; la admisión nativa del banco acredita su vigencia en OpenCode 1.18.25 (Anexo VI, A.VI.6).

### II.3.2 · Datos de la medición de la línea de base

Los valores agregados por estrato y ejecutor corresponden a la Tabla 4 del apartado I.3.2. La Tabla 14 reúne los problemas de E2 y E4 con éxito declarado falso en al menos una repetición de la lectura principal y conserva N-21 como problema solo en la preregistrada. Las fracciones proceden de la medición que el autor coordina con el arnés los días 20 y 21/10/2026, con tres repeticiones por problema y ejecutor sobre el banco del apartado II.2.1.

La lectura preregistrada es la definición fijada antes de medir, que cuenta todo colateral como éxito declarado falso. La principal registra el colateral de batería como exceso de alcance: cambios adicionales respecto de la forma correcta, sin alteración de una guarda declarada (Anexo VI, A.VI.7).

| **Problema** | **`build`** | **Charles** | **Familia del banco** | **Mecanismo observado** | **Consecuencia** | **Cuenta en la lectura principal (al menos 2/3)** |
|---|---|---|---|---|---|---|
| M-1 (E2) | 2/3 | 3/3 | Regla `read` por archivo con ruta absoluta | Ruta absoluta en regla `read` | Bloqueo | Sí |
| M-2 (E2) | 2/3 | 2/3 | Regla `edit` por archivo con ruta absoluta | Ruta absoluta en regla `edit` | Bloqueo | Sí |
| M-10 (E2) | 3/3 | 3/3 | Protección nativa de `.env` con ruta absoluta | Ruta absoluta en regla de lectura de `.env` | Bloqueo | Sí |
| N-13 (E2) | 0/3 | 1/3 | `write` consulta la regla de `edit` | Ruta absoluta en regla `edit` | Exposición | No, solo una repetición |
| N-14 (E2) | 3/3 | 3/3 | `list: deny` no impide `read` del directorio | Ruta absoluta en regla `read` del directorio (presente en 2/3 de las ejecuciones de Charles) | Exposición | Sí |
| N-21 (E2, solo preregistrada como problema) | 1/3 | 0/3 | La documentación indica denegación de `.env`, pero OpenCode pregunta | Guarda `.env.local` alterada en una ejecución de `build`; exceso de alcance en la preregistrada | Bloqueo | No; preregistrada: 3/3 en ambos |
| N-23 (E2) | 3/3 | 3/3 | `deny` con ruta absoluta que nunca coincide | Ruta absoluta en regla `read` con `deny` | Exposición | Sí |
| S-1 (E4) | 2/3 | 3/3 | Regla `read` con ruta absoluta, como M-1 | Ruta absoluta en regla `read` | Bloqueo | Sí, en E4 |

*Tabla 14. Éxito declarado falso por problema y ejecutor. Fuente: elaboración propia sobre el banco y los informes ecológicos, correspondientes a la modificación dentro del proyecto. Los archivos finales constan en el registro de casos con error de la medición del 20 y el 21/10/2026 (registro de la evidencia, Anexo VI, A.VI.11). Las fracciones corresponden a la lectura principal; la última columna identifica la preregistrada de N-21. En N-14, 2/3 indica la presencia de ruta absoluta en Charles; el éxito declarado falso ocurre en 3/3. Su repetición 1 contiene solo `list: deny`, sin ruta absoluta.*

En detección, el autor aplica el mismo arnés el 21/10/2026 sobre once defectos, con tres repeticiones por ejecutor. Ambos detectan ocho de once según el umbral de dos repeticiones; los defectos con ruta absoluta y la sustitución sin valor quedan por debajo de ese umbral. El detalle por defecto consta en el Anexo VI, A.VI.8.

El exceso de alcance se registra en el Anexo VI, A.VI.8.

### II.3.3 · Datos de la entrevista al referente

La constancia de entrevistas, versión 2, respalda las declaraciones de la referente. El registro completo consta en el Anexo VI, A.VI.5. Los contactos, con su canal y sus fechas, se describen en el apartado I.1.2.

#### Composición del equipo y adopción

La referente declara que el equipo de desarrollo tiene cinco integrantes e incorpora herramientas de programación basadas en agentes a comienzos de 2026 (constancia, respuestas 1.1 y 1.2). Atribuye la incorporación a la actualización tecnológica frente a la adopción creciente en el sector. El factor determinante es sostener el volumen de trabajo comprometido sin ampliar la dotación de personal.

#### Frecuencia y procedimiento

Valeria Areco estima alrededor de cinco consultas semanales a los archivos de configuración en su propia práctica (constancia, respuesta 1.3). Es una estimación retrospectiva de consultas, en general menores, sin registro de respaldo: [DATO PENDIENTE: período de referencia de las cinco consultas semanales]. La frecuencia de cambios de configuración queda sin cuantificar.

El equipo realiza las correcciones y los cambios de configuración siempre mediante un pedido a un agente, según la respuesta 2.2. La respuesta 2.9 identifica a Charles como el agente propio del equipo para configurar OpenCode. La referente declara que consulta menos a mano a medida que aumenta su confianza en Charles (respuesta 2.1). Se registra además el relato de una consulta de la configuración de su entorno mediante un agente con permisos elevados (respuesta 2.3).

#### Definición observada de Charles

La definición de Charles, entregada por la referente el 13/10/2026, constituye el único artefacto observado del equipo. Corresponde a un agente primario para configurar OpenCode, con skills denegadas salvo las propias del equipo y `bash` restringido. Sus adaptaciones para la medición constan en el Anexo III, D-41.

#### Cambios sin efecto y episodios de comportamiento distinto del esperado

La respuesta 1.4 registra cambios de configuración cuyo efecto ausente se advierte más tarde, ante un comportamiento distinto del esperado. La referente relata dos episodios: la invocación reiterada de un agente a sí mismo y la operación a través de otro agente que, según el testimonio, incorpora la herramienta (respuestas 2.5 y 2.6). En el segundo relato, la referente desconoce la existencia y las funciones de ese agente.

Las causas de ambos episodios quedan sin establecer por falta de configuraciones y trazas. La existencia del agente interno del segundo relato permanece pendiente de verificación propia (Anexo VI, A.VI.3, resultado 18).

#### Respuesta al enfoque presentado

La referente señala como aporte principal la identificación del archivo que determina cada valor efectivo (constancia, respuesta 1.6). Expresa la utilidad de una consulta programática para que un agente conozca la configuración efectiva de su entorno o la de otro agente antes de operar (respuesta 2.7).

#### Datos no obtenidos

- Duración de los episodios relatados.

- Consumo de tokens por la consulta mediante el agente con permisos elevados y por acciones repetidas ante comportamientos inesperados, sin cuantificar (constancia, respuesta 2.4).

- Proporción de las consultas semanales cuya respuesta requiere una resolución no inmediata.

- Fecha de creación de Charles: [DATO PENDIENTE: fecha de creación de Charles].

### II.3.4 · Resultados técnicos y contraste de soluciones

La lectura del cargador de OpenCode 1.18.25 identifica hasta doce entradas de configuración, cuatro ajenas a archivos. Los escenarios controlados verifican la fusión profunda y la resolución de permisos por la última regla coincidente (Anexo VI, A.VI.3).

La verificación nativa de ruta del 14/10/2026 comprueba que una regla con ruta absoluta del árbol de trabajo se evalúa contra la ruta relativa y queda sin coincidencia (registro de la evidencia, Anexo VI, A.VI.11). El comando `opencode debug` presenta la regla agregada sin evaluar su efecto para una acción concreta (Anexo VI, A.VI.3).

El contraste documental del autor al 01/10/2026 reúne 33 soluciones publicadas y utilizables sobre configuración de herramientas agénticas: cinco sobre OpenCode y 28 sobre otras herramientas. Las posiciones de cada solución constan en la Tabla A.VI.6 del Anexo VI, A.VI.4.

El eje horizontal distingue declaraciones o validación (0), resultado efectivo (1), reglas en orden de evaluación (2) y decisión con regla determinante (3). El vertical distingue ausencia de procedencia (0), alcance o capa (1) y declaración con entrada, archivo y posición (2).

Sobre OpenCode, `debug config` ocupa (1, 0) y `debug agent`, (2, 0); OCCM, CC Switch y agnix ocupan (0, 0). Entre las otras herramientas, Amp `permissions test` ocupa (3, 1) y Codex `execpolicy check`, (3, 0). El servidor de aplicación de Codex (`config/read`) ocupa (1, 1), junto con otras soluciones que informan valores por alcance. La combinación de decisión, regla determinante y procedencia por declaración queda sin cubrir en el conjunto relevado (Anexo VI, A.VI.4).
