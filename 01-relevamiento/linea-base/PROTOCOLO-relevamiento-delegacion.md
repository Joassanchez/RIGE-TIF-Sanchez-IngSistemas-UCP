# Protocolo · Relevamiento de la práctica de delegación y del error de los agentes

Estado: propuesta del ingeniero, 09/10/2026. Lo revisa y fija el autor **antes de la primera búsqueda**; una vez fijado, los criterios y las reglas de la sección 4 no se modifican al conocer los resultados. Origen: dictamen DEV-AE2 N.º 14/2026, apartado 7 y pregunta 1 del Bloque A; reformulación de la línea de base (modifica ADR-053, ADR pendiente).

## 1. Afirmaciones que el relevamiento pone a prueba

| Cód. | Afirmación | Componente del problema (I.3.1) | Qué decide |
|---|---|---|---|
| **P1 · Práctica** | Los desarrolladores que usan herramientas de programación basadas en agentes delegan en un agente o modelo la consulta y la corrección de su configuración | 4 · contexto y frecuencia; manifestación (2) | Que la línea de base mida el procedimiento delegado y no el manual |
| **P2 · Error** | Los agentes y modelos de lenguaje se equivocan al determinar la configuración efectiva o al modificarla, de forma que el usuario no advierte | 3 · magnitud; 5 · consecuencia | Que la hipótesis de la línea de base tenga antecedente externo y contra qué contrastar su resultado |

Fuera del relevamiento: la demanda del producto (Cap. IV) y el costo humano de verificar la respuesta del agente, que se declara fuera de la medición salvo que la regla R-4 lo invalide.

## 2. Fuentes

Las fuentes F-1 a F-3 son primarias; F-4 a F-8, secundarias. Ninguna fuente aislada sostiene una afirmación: la sección 4 fija qué combinación alcanza.

| Cód. | Fuente | Afirmación | Límite que se declara |
|---|---|---|---|
| F-1 | Referente (Valeria Areco), confirmación escrita y agente del equipo (AD-17) | P1 | Informante único; organización ajena al ámbito de implantación |
| F-2 | Encuesta de práctica (`borrador-encuesta-practica.md`) | P1 (preguntas 8, 13 y 14); P2 en forma declarada (preguntas 9 y 10) | No probabilística; autoselección; error silencioso no declarable |
| F-3 | Incidencias del repositorio de OpenCode: reclasificación de las 32 de A.VI.6 y búsqueda complementaria | P1 y P2 | Piso de ocurrencia, no prevalencia |
| F-4 | Literatura académica | P2; P1 en lo que estudie prácticas | Dominios de configuración distintos de OpenCode |
| F-5 | Encuestas sectoriales de desarrolladores | P1, como contexto | Miden uso de agentes en general, no delegación de la configuración |
| F-6 | Oferta de agentes, skills o servicios que configuran herramientas agénticas | P1, indirecta | La oferta no mide el uso; se cruza con la nómina del IV.4 |
| F-7 | OpenCode 1.18.25 (código del tag) | P1 | Acredita que el fabricante ofrece la vía, no que se use |
| F-8 | Foros y discusiones públicas | P1 y P2, ilustración | Selección sesgada; no se cuentan frecuencias |

## 3. Criterios por fuente

Fecha de corte común: **09/10/2026** (fijada por el ingeniero a pedido del autor, el mismo día). Se incluye solo lo publicado hasta esa fecha; lo posterior se descarta aunque aparezca en una búsqueda hecha después. Toda consulta registra fecha, cadena, base y cantidad de resultados, aunque no se incluya nada.

### F-1 · Referente

Reenvío del pedido de AD-17 con una pregunta de confirmación (texto en `borrador-encuesta-practica.md`, sección 2.2). Se registra la respuesta escrita con su fecha en `01-relevamiento/evidencia/`. Lo que la referente dijo en la segunda entrevista no se cita sin esa confirmación.

### F-2 · Encuesta

Según `borrador-encuesta-practica.md`; versión en español en Google Forms, generada con `encuesta-practica-form.gs`. Canales: `[DATO PENDIENTE: canales]`. Período de recolección: `[DATO PENDIENTE]`.

### F-3 · Incidencias

**F-3a · Reclasificación.** Sobre las 32 incluidas de A.VI.6, leyendo el **cuerpo completo** y los comentarios (no solo el título), cada incidencia recibe una categoría:

| Cat. | Criterio |
|---|---|
| D-1 | Un agente o modelo creó o modificó la configuración, y el resultado no fue el esperado |
| D-2 | El usuario consultó a un agente o modelo sobre su configuración y la respuesta fue incorrecta o incompleta |
| D-3 | Se menciona un agente o modelo en el diagnóstico, sin que intervenga en el error |
| D-0 | Sin intervención de un agente o modelo en la configuración |

El comportamiento de la propia herramienta frente a la configuración (por ejemplo, un permiso no aplicado) es D-0: corresponde al fenómeno ya clasificado por mecanismo, no a la delegación.

**Codificación.** Codificador único: el ingeniero (Claude Code), con revisión del autor caso por caso; los cambios del autor se registran. El autor decidió el 09/10/2026 no codificar en forma independiente, de modo que no se informa concordancia: el límite de codificador único que observó el dictamen se mantiene y se declara, junto con la herramienta que codificó.

**F-3b · Búsqueda complementaria.** En el mismo repositorio, sobre el cuerpo de incidencias y discusiones: `agent` o `AI` o `LLM` junto con `opencode.json`, `config` o `permission`, y verbos de modificación (`edited`, `changed`, `wrote`, `modified`, `broke`). Mismos criterios de exclusión que A.VI.6 (pedidos de funcionalidad; ajenas al fenómeno), más la categoría D-0.

### F-4 · Literatura académica

- **Bases:** Google Scholar, arXiv, ACM Digital Library, IEEE Xplore.
- **Cadenas:**
  - (`large language model` OR `LLM` OR `agent`) AND (`misconfiguration` OR `configuration error` OR `configuration validation` OR `configuration troubleshooting`)
  - (`coding agent` OR `agentic coding` OR `AI coding assistant`) AND (`configuration` OR `context file` OR `permission`)
- **Período:** 2022 a la fecha de corte.
- **Inclusión:** estudio empírico o herramienta evaluada con datos, sobre (a) el desempeño de modelos o agentes al razonar sobre configuración de software o (b) la práctica de desarrolladores con agentes de programación.
- **Exclusión:** opinión sin datos; configuración del propio modelo (hiperparámetros, instrucciones del sistema como objeto de optimización); preimpresiones sin método descripto.
- **Ya registrada y candidata:** `chatlatanagu2025` (*Agent READMEs*), hoy «sin verificar» en `fuentes.md`.

### F-5 · Encuestas sectoriales

Ediciones de la fecha de corte o la anterior de las encuestas anuales de desarrolladores de Stack Overflow y de JetBrains (candidatas, a verificar). Se toma solo la sección sobre uso de agentes y para qué tareas; cada cifra entra con las tres preguntas.

### F-6 · Oferta

- **Dónde:** GitHub (repositorios), npm, Visual Studio Marketplace, catálogos comunitarios de agentes y skills de OpenCode y Claude Code.
- **Cadenas:** `opencode config agent`, `opencode.json generator`, `claude code setup agent`, `configure agent permissions` y equivalentes.
- **Inclusión:** oferta cuya función declarada es crear, modificar o diagnosticar la configuración de una herramienta agéntica **por medio de un modelo**, en nombre del usuario.
- **Exclusión:** herramientas sin modelo (linters, editores, inventarios): son competidores y ya constan en el IV.4.
- **Cruce:** cada inclusión se marca si figura en `01-relevamiento/nomina-competidores-20261001.md`.

### F-7 · OpenCode 1.18.25

Verificar en el código del tag si existe una vía nativa para generar agentes o configuración con un modelo (subcomando, agente nativo o instrucción). Evidencia: ruta y línea en el tag, y ejecución en el laboratorio si corresponde (criterio del resultado n.º 11 del Anexo VI: leer el código no acredita el comportamiento sin ejecutarlo).

### F-8 · Foros

GitHub Discussions de OpenCode y Reddit, con las cadenas de F-3b. Solo fuentes con URL pública y estable (se excluye Discord). Máximo 5 casos ilustrativos, elegidos por pertinencia y declarados como tales.

## 4. Reglas fijadas antes de conocer los resultados

| Cód. | Si… | …entonces |
|---|---|---|
| R-1 | F-1 confirma por escrito **y** al menos una fuente independiente de la referente (F-2 por las preguntas 8 o 13, F-3a con D-1 o D-2, F-6 o F-7) muestra la práctica | P1 se sostiene y la línea de base mide el procedimiento delegado |
| R-2 | F-1 confirma pero ninguna fuente independiente muestra la práctica | P1 se declara con informante único; la medición con agentes se mantiene y la limitación se declara en II.6.3 |
| R-3 | La mayoría de quienes responden la pregunta 8 de F-2 elige como método principal una vía no delegada (a–f) | Regla ya fijada en el borrador de la encuesta: contraste cualitativo obligatorio y procedimiento manual declarado sin medir |
| R-4 | La mayoría de quienes delegaron (pregunta 8, g–i) responde en la pregunta 9 de F-2 que verificó la respuesta probando el comportamiento | El costo humano de verificar es parte central del problema y no puede quedar fuera de la medición: se revisa el diseño antes de medir |
| R-5 | F-4 no encuentra estudios incluidos | P2 descansa solo en la línea de base propia; se declara la ausencia de antecedentes |
| R-6 | F-4 encuentra estudios con desempeño alto de los modelos en tareas comparables | Se declara como evidencia contraria a la hipótesis y se informa junto a la línea de base; no se descarta |

## 5. Registro

- Resultados de búsqueda, incluidos los descartados con su motivo: `01-relevamiento/linea-base/relevamiento-delegacion.md` (se crea al empezar).
- Alta en `01-relevamiento/fuentes.md` solo de lo que el autor lee y aprueba, con copia en `01-relevamiento/evidencia/`.
- Destino en el informe: Cap. II (II.1, II.2, II.3) y Anexo VI. El Cap. I toma solo la síntesis.
