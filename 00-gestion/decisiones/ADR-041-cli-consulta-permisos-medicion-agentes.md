# ADR-041 — La interfaz de línea de comandos incorpora la consulta de decisiones de permiso, porque la medición con agentes solo puede usar RIGE por esa vía

- Estado: aceptado (25/09/2026); reemplaza parcialmente a ADR-022
- Fecha: 25/09/2026
- Capítulos afectados: Cap. I (I.6.5); Cap. III (III.3, III.4, III.5); Cap. V (V.1, Tabla 14; V.4; V.5, Tabla 21); Anexo I; libro (RF-02, RF-03)
- Origen: rediseño del instrumento de la línea de base (ADR-040), sesión del 25/09/2026
- Relacionado: reemplazaría parcialmente a ADR-022; se apoya en ADR-017, ADR-040 y RF-02

### Contexto

ADR-022 (aceptado) limitó la interfaz de línea de comandos a «un comando único de consulta de valores efectivos con procedencia». La consulta de decisiones de permiso por esa vía figura como caso de uso excluido del MVP (V.5, Tabla 21). Su condición de invalidación, redactada por el ingeniero, dice: «que el referente o la medición muestren que el uso programático relevado consiste principalmente en consultar permisos y no valores».

Evidencia nueva:
- ADR-040 (propuesto) mide la línea de base con agentes. En la medición final, **un agente solo puede usar RIGE por la línea de comandos**: la interfaz web local no está a su alcance.
- De los dieciséis casos del instrumento, **ocho son de permisos** (`01-relevamiento/linea-base/respuestas.md`, «Tipo de consulta»), incluida toda la condición C-4, que concentra el problema.
- El agente de la referente es un agente de permisos elevados que consulta el entorno (Anexo I, A.I.5, línea 139).

Consecuencia si no se decide nada: en noviembre, RIGE no puede mejorar el resultado de la mitad de los casos por una exclusión de alcance, no por el producto. La medición final mostraría «sin mejora» en C-4, lo que es un resultado falso sobre RIGE.

### Alternativas evaluadas

- **A:** Agregar a la línea de comandos la consulta de una decisión de permiso: dado un proyecto, un agente y una acción, informar la decisión, la regla determinante con su procedencia y su carácter nativo o declarado, en la misma salida estructurada de RF-03.
- **B:** Mantener ADR-022 y limitar la medición final a los casos de valor.
- **C:** Mantener ADR-022 y permitir que el agente consulte la API HTTP de la interfaz web local.

### Análisis (trade-offs)

- **A:**
  - A favor: no agrega lógica nueva, porque la resolución de permisos es RF-02 (Must, iteración 2) y el comando solo la expone; reutiliza el esquema, el determinismo y las pruebas de RF-03; atiende el uso programático relevado.
  - En contra: amplía el alcance de la iteración 3 y el acta de validación (L-06 fue validada con la referente); requiere volver a validarlo con ella.
  - Esfuerzo (suposición): 3 a 5 h. Una subopción del comando, su esquema, las pruebas de coincidencia con la interfaz web sobre los escenarios de OE-2 y el ajuste del README.
- **B:** No agrega esfuerzo, pero abandona el núcleo del problema (C-4, la consecuencia de seguridad) en la medición que demuestra el resultado. Además deja el criterio de éxito sin sostén en la mitad del instrumento.
- **C:** Evita modificar la línea de comandos, pero hace depender la medición de una API interna, no declarada como interfaz pública, y la aparta del uso real. El tribunal lo leería como un atajo del autor.

### Recomendación y fundamento

Recomendación del ingeniero: **A.** El costo es bajo porque la lógica ya está en el MVP. Sin ella, la medición con agentes queda incapaz de mostrar el efecto de RIGE sobre los permisos.

**Condición que invalidaría la decisión:** que RF-02 no llegue a la versión congelada. En ese caso, la mejora en los casos de permisos tampoco sería medible por la interfaz web, y el problema pasa a ser de alcance del MVP, no de interfaz.

### Decisión del autor

**Aceptado por el autor el 25/09/2026: alternativa A.** Pendiente la nueva validación con la referente (decisión L-06 revisada).

### Consecuencias

- **RF-03:** el enunciado y el criterio de aceptación incorporan la consulta de decisión de permiso, con la misma salida estructurada y la coincidencia con la interfaz web (indicador de OE-2, «por ambas interfaces», que ya lo exige: I.2.4).
- **V.5, Tabla 21:** la consulta de permisos por línea de comandos sale de los casos de uso excluidos.
- **V.1 (Tabla 14) y V.4:** horas de la iteración 3.
- **III.4:** decisión L-06 revisada; nueva validación con la referente.
- **ADR-022:** pasa a «reemplazado parcialmente por ADR-041».
- **ADR-036:** el esquema publicado de la salida incluye la respuesta de permisos.

### Evidencia

`00-gestion/decisiones/ADR-022-salida-linea-comandos-version-minima.md` (consecuencias y condición de invalidación); `03-requisitos/libro/catalogo/RF-02.md` y `RF-03.md`; `informe/cap-01/I.2-mision-vision-objetivos-proyecto.md` (OE-2, línea 22); `01-relevamiento/linea-base/respuestas.md`; ADR-040.
