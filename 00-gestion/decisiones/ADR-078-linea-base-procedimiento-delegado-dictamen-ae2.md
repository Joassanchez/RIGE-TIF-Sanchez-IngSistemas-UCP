# ADR-078 — Línea de base sobre el procedimiento delegado: fundamento ante el dictamen de la AE2, tratamiento de los datos del AE1, indicadores y condición de la skill nativa

- Estado: aceptado (09/10/2026)
- Fecha: 09/10/2026
- Capítulos afectados: Cap. I (I.3.1, I.3.2, I.3.4, I.6.5 y nota sobre el estado de la entrega); Cap. II (II.1, II.2, II.3, II.6.3); Cap. IV (IV.3, IV.4); Anexo VI (A.VI.1, A.VI.6, A.VI.8); Anexo III (D-41)
- Origen: dictamen DEV-AE2 N.º 14/2026 (apartados 7, 10 y 14; Bloque A, pregunta 1) y sesión del 09/10/2026 con el autor
- Modifica: ADR-053 (objeto de la medición, criterio, encuesta y amenazas). Se apoya en ADR-076 (modelos y suscripción) y ADR-054 (contenedor)
- Relacionado: `01-relevamiento/linea-base/PROTOCOLO-relevamiento-delegacion.md`, `relevamiento-delegacion.md` y `borrador-encuesta-practica.md`

### Contexto

El dictamen observa tres cosas sobre la línea de base (apartado 7):

1. La medición del AE1 con personas (64 observaciones, 45,1 % de respuestas incorrectas) quedó de lado cuando la devolución del AE1 pedía conservarla y ampliar la muestra.
2. D-41 reemplazó el diseño con personas por uno con agentes «sin consulta localizada».
3. Una medición cuyo ejecutor es un modelo «mide otro procedimiento y otro sujeto», y deja sin responder el costo que paga el desarrollador (Bloque A, pregunta 1).

Hechos establecidos en la sesión del 09/10/2026:

- **Datos del AE1** (declaración del autor): las 64 observaciones son pruebas con amigos y compañeros, sin protocolo uniforme (preguntas corregidas durante la sesión; acceso a internet y a la documentación distinto entre personas) y **sin registros conservados**. ADR-053 decía «ninguna sesión realizada»: es inexacto; hubo sesiones informales sin registro.
- **Práctica de delegar** (relevamiento del 09/10/2026, `relevamiento-delegacion.md`):
  - OpenCode 1.18.25 carga por defecto la skill `customize-opencode`, que instruye al agente para crear y corregir la configuración del usuario, incluidas las reglas de permiso (verificado por ejecución con `opencode debug skill`).
  - `opencode agent create` delega en un modelo la redacción de la definición de un agente (código del tag).
  - Incidencias #14216 y #22247: el agente modificó `opencode.json` con un resultado erróneo; en #22247 el usuario no sabe qué cambió.
  - Hay oferta de skills de terceros para que el agente configure OpenCode y una skill incorporada equivalente en Claude Code.
  - La referente relató en la segunda entrevista que las correcciones de configuración las hacen mayormente con un agente; la confirmación escrita se pidió el 09/10/2026 y está pendiente.
- **Error de los modelos con la configuración** (P2): los estudios incluidos informan error apreciable del modelo solo y una reducción fuerte con un validador determinista (89,06 % frente a 98,50 % en Ghorab et al., 2026). No se encontró ningún estudio sobre la resolución de precedencia entre varias fuentes.

### Alternativas evaluadas

**Eje O · Objeto de la medición**
- **O-A:** Volver a la medición con personas del AE1 y ampliarla (lo que sugiere el dictamen).
- **O-B:** Medir el procedimiento delegado con agentes (ADR-053), con el fundamento reformulado.
- **O-C:** Medir ambos: agentes como principal y una muestra chica de personas como contraste.

**Eje D · Datos del AE1**
- **D-A:** Usarlos como línea de base vigente.
- **D-B:** Informarlos como estudio piloto con sus valores.
- **D-C:** Declararlos como prueba exploratoria informal, sin registros, y no usar sus valores.

**Eje I · Indicadores y criterio**
- **I-A:** Error y tokens en el criterio principal (ADR-053).
- **I-B:** Error como criterio principal; tokens como criterio secundario.
- **I-C:** Solo error.

**Eje S · Skill `customize-opencode`**
- **S-A:** Medir con la instalación por defecto (skill disponible).
- **S-B:** Desactivarla en las dos mediciones.
- **S-C:** Medir las dos condiciones.

**Eje K · Costo humano de verificar**
- **K-A:** Declararlo fuera de la medición, con su motivo y una condición de invalidación.
- **K-B:** Sumar un componente con personas que supervisan la respuesta del agente.

### Análisis (trade-offs)

- **O-A:** los datos del AE1 no tienen registros ni protocolo uniforme, así que no hay medición que conservar ni ampliar sobre la misma base; habría que rehacerla desde cero con personas, con el problema de reclutar dos veces que motivó ADR-053. Además mide un procedimiento que la evidencia muestra en retroceso frente a la delegación.
- **O-B:** mide el procedimiento que la herramienta misma propone por defecto (skill incorporada) y que la referente relata. El sujeto afectado sigue siendo el desarrollador: quien recibe la respuesta errónea y paga los tokens es la persona, y el agente es el procedimiento que usa. La objeción «otro sujeto» confunde al ejecutor de la medición con el sujeto del problema. Es coherente con la arquitectura: RIGE ya está diseñado para un agente consumidor (III.1, I.3.5).
- **O-C:** responde la objeción del costo humano, pero reintroduce el reclutamiento y duplica el instrumento. Su aporte lo cubre K-A con la encuesta (pregunta 9) a una fracción del costo.
- **D-A y D-B:** presentar como datos valores sin registros que los respalden es lo que la regla de las tres preguntas prohíbe (no hay método verificable). D-B además da una apariencia de rigor que no tienen.
- **D-C:** corrige expresamente lo dicho en el AE1, con el mismo criterio que el dictamen elogia en el resultado n.º 11 del Anexo VI. Costo: hay que explicar que el informe del AE1 los presentó como medición.
- **I-A:** una respuesta barata y equivocada no le sirve al usuario; mezclar los dos indicadores en el mismo criterio permite «ganar» por tokens con más error.
- **I-B:** el error captura la consecuencia de seguridad (I.3.1) y prevalece; los tokens cuantifican la quinta componente, que hoy figura «sin cuantificar». Se informan como **equivalente a precio de lista**: con ChatGPT Plus el desembolso es una cuota fija y el costo marginal por consulta es nulo dentro del límite (misma distinción entre costo y desembolso del Cap. X).
- **I-C:** desperdicia el dato de tokens, que es gratis de registrar.
- **S-B:** mide un agente debilitado respecto de lo que recibe cualquier usuario de 1.18.25 y infla la mejora atribuible a RIGE.
- **S-A:** validez ecológica: es la condición por defecto. La medición final mantiene la skill y suma RIGE, de modo que la comparación aísla lo que aporta RIGE sobre la mejor ayuda que da el fabricante. La skill transmite un modelo de precedencia simplificado («Project overrides global»); que eso induzca errores es una suposición que la medición pone a prueba.
- **S-C:** duplica las ejecuciones sin responder una pregunta del problema.
- **K-A:** honesto y barato; depende de que la encuesta y la referente muestren que el usuario no verifica en forma sistemática lo que hace el agente.
- **K-B:** ver O-C.

### Recomendación y fundamento

**O-B + D-C + I-B + S-A + K-A**, con consulta al docente **antes** de ejecutar la medición.

Es la única combinación que mide el procedimiento real con evidencia de que existe, no usa datos sin respaldo, ordena los indicadores según la consecuencia más grave y no favorece a RIGE con una condición de control debilitada.

**Respuesta a la pregunta 1 del Bloque A (contenido, no redacción):** la medición del AE1 no se conserva porque no es una medición (sin protocolo uniforme ni registros); el procedimiento que se mide es el que la herramienta propone por defecto y la referente relata; el sujeto afectado sigue siendo el desarrollador; el costo humano de verificar se declara fuera de la medición con la condición que lo invalidaría, y se releva con la encuesta.

**Condiciones que invalidarían la decisión:**
1. **La referente no confirma por escrito** que delegan las correcciones, y la encuesta muestra mayoría de vías no delegadas (R-3 del protocolo): P1 queda sin sostén y se vuelve a evaluar O-A u O-C.
2. **La mayoría de quienes delegan verifica probando el comportamiento** (R-4, pregunta 9 de la encuesta): el costo humano es central y K-A no alcanza.
3. **El docente rechaza el cambio** en la consulta: se vuelve a O-A u O-C según lo que indique.
4. **El piloto muestra que el agente con la skill acierta casi todos los casos de C-2 a C-4** sin más tokens que en C-1: condición 1 de ADR-053; delegar no es un problema y E no mide nada.

### Decisión del autor

**Aceptado por el autor el 09/10/2026** («acepto todo»), con todas las alternativas recomendadas: O-B, D-C, I-B (error principal; tokens secundario), S-A (skill `customize-opencode` disponible), K-A y la encuesta como complemento que no bloquea. En la misma respuesta el autor aceptó la ficha para regenerar en el CI la referencia nativa del v1 (fuera de este ADR).

### Consecuencias

**Sobre ADR-053:**

| Elemento de ADR-053 | Cambio |
|---|---|
| Contexto, línea 22 («ninguna sesión realizada») | Hubo sesiones informales sin protocolo ni registros (D-C) |
| Modelos (M1 a M3 de Anthropic) | Ya reemplazados por ADR-076: `gpt-6.1-sol` (principal), `gpt-6-astra` y `gpt-6-luna` desde OpenCode con ChatGPT Plus |
| Ejecutor principal (sin el agente de la referente) | Agente `build` nativo de OpenCode 1.18.25 **con la skill `customize-opencode` disponible**, y se declara |
| Criterio principal: tokens dentro del criterio | Los tokens pasan a criterio secundario: la mediana por caso de la diferencia con y sin RIGE no es positiva. El criterio principal queda en «8 de 12 casos» sobre el error |
| Encuesta de práctica | Protocolo y reglas R-1 a R-6; el texto vigente es el del borrador revisado el 09/10/2026 |
| Amenaza declarada | Se suma el costo humano de verificar (K-A) con la condición 2 |

**Sobre el informe** (correcciones a cargo del autor):
- **I.3.1:** componentes 2 (manifestación: delega en un agente que reconstruye la configuración) y 3 (magnitud: error de la respuesta delegada, aciertos parciales y tokens); la quinta componente pasa de «no cuantificada» a medida en tokens.
- **I.3.2 e I.3.4:** ejecutor, indicadores (IB-2 pasa de tiempo a tokens; IB-4 sale de la traza del agente), criterio por caso y no por participante; se retira el párrafo de la referente y los participantes.
- **Nota sobre el estado de la entrega:** se reemplaza por la declaración de los datos del AE1 (D-C) y el estado de la medición.
- **Cap. II:** II.1 y II.2 suman el relevamiento de la práctica (protocolo, fuentes F-1 a F-8); II.6.3, las amenazas.
- **IV.3:** la fila de sustitutos suma la skill del fabricante; la frase «con la tasa de error que registre la línea de base» se completa con el resultado cuando exista. **IV.4:** la skill entra en la nómina como oferta del fabricante.
- **A.VI.6:** #32581 es de OpenClaw (error de inclusión): 31 incidencias incluidas; se corrige también en I.3.1 y en la Tabla 9 del IV.3. #37155 relata un riesgo, no un episodio: su inclusión se revisa.
- **Anexo III, D-41:** se actualiza con este ADR.

**Antes de medir:**
1. El autor consulta al docente con el contenido de este ADR.
2. El ingeniero construye la imagen de ADR-054 (AD-26) y verifica que OpenCode registre los tokens cuando se autentica con ChatGPT Plus (**suposición** hasta el piloto).
3. Piloto con `gpt-6.1-sol`; el autor hace el inicio de sesión en el contenedor.

### Evidencia

- Dictamen DEV-AE2 N.º 14/2026, apartados 7, 10, 13 (Bloque A, pregunta 1) y 14
- `01-relevamiento/linea-base/relevamiento-delegacion.md` (F-3a, F-3b, F-4, F-5, F-6, F-7, F-8)
- `01-relevamiento/linea-base/PROTOCOLO-relevamiento-delegacion.md`
- `01-relevamiento/linea-base/borrador-encuesta-practica.md`
- OpenCode `v1.18.25`: `packages/core/src/plugin/skill.ts` y `skill/customize-opencode.md`; `packages/opencode/src/cli/cmd/agent.ts`
- ADR-053, ADR-054, ADR-076
- `informe/cap-01/I.3-necesidad-problema-responde-proyecto.md`
