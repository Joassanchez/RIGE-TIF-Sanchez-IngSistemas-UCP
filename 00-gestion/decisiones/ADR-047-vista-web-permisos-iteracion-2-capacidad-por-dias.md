# ADR-047 — La vista web de permisos vuelve a la iteración 2 y la capacidad por iteración se calcula por días

- Estado: aceptado (28/09/2026). Elección del autor en la revisión consolidada: P-01 opción A y P-04 según la recomendación.
- Fecha: 28/09/2026
- Capítulos afectados:
  - Cap. V: V.1 (Tabla 14 y párrafo del orden); V.2; V.4 (línea 16, Tablas 18 y 19, párrafos de las líneas 49, 51 y 67); Figura 3.
  - Libro: `iteraciones.md`.
  - `tools/figura_cronograma.py`.
- Origen: revisión «pasada-validacion-revision» del 28/09/2026 (eliminada el 28/09/2026; en el historial de git), P-01 (A-1 del crítico y C-1 del verificador) y P-04 (M-1 del crítico).
- Relacionado:
  - Reemplaza parcialmente a ADR-042 (B', punto 2: la pantalla web de permisos pasaba a la iteración 3).
  - Reemplaza parcialmente a ADR-046 (A1: la capacidad 34/51/34/17 «en proporción a sus semanas»).
  - Sin cambios en los demás puntos de ADR-042 ni en B1 de ADR-046.

### Contexto

**Contradicción A-1 [R].**
- El criterio de aceptación de RF-02 exige que la decisión, la cadena y la regla determinante coincidan por línea de comandos y por interfaz web (Anexo I, línea 20).
- El criterio de RF-03 exige coincidencia con la web en los valores y en las decisiones (Anexo I, línea 28).
- Ambas fichas figuran en la iteración 2, validadas en el acta del 26/09/2026.
- Sin embargo, ADR-042 pasó la vista web de consulta de permiso a la iteración 3 (V.4, Tabla 18, línea 40). Por eso V.1 y V.2, que dan esos criterios por cumplidos al 24/10, afirman algo imposible.

**Contradicción M-1 [R].**
- V.4, línea 16, reparte las 136 h «en proporción a sus dos, tres, dos y una semanas».
- Las fechas de V.1, Tabla 14, dan otra duración:

| Iteración | Fechas | Días | Proporción de 136 h |
|---|---|---|---|
| 1 | 21/09 al 01/10 | 11 | 28,2 |
| 2 | 02/10 al 24/10 | 23 | 59,0 |
| 3 | 26/10 al 07/11 | 13 | 33,4 |
| 4 | 09/11 al 14/11 | 6 | 15,4 |
| **Total** | | **53** | **136** |

Redondeado, la capacidad queda en 28, 59, 33 y 16 h (136). La proporción es un cálculo sobre datos del repositorio [R]; el reparto uniforme de la reducción del 15 % es el supuesto que ya declara V.4, línea 3.

### Alternativas evaluadas

- **A:** la vista web de consulta de permiso (4 h) vuelve a la iteración 2. No se toca ninguna ficha validada.
- **B:** RF-02 y RF-03 cierran su criterio en la iteración 3. Cambia la iteración que validó la referente.
- **C:** separar la paridad con la web del criterio de RF-02 y RF-03. Modifica criterios validados.

### Análisis

- **A:**
  - Con la capacidad por semanas (51 h), la iteración 2 pasaría a 57 h: 6 h de exceso, y el plan no cerraría.
  - Con la capacidad por días (59 h), 57 h entran con 2 h de holgura.
  - El costo aparece en la iteración 1: 34 h planificadas sobre 28 de capacidad.
- **B y C:** tocan contenido que la referente confirmó en la sesión y obligan a un nuevo aviso. Además, dejan la paridad entre interfaces para el final, que es lo contrario de lo que ADR-042 buscaba asegurar.

### Recomendación y decisión

**Opción A, con la capacidad calculada por días.** Queda así:

| Iteración | Capacidad por días | Plan | Diferencia |
|---|---|---|---|
| 1 | 28 | 34 | +6 |
| 2 | 59 | 57 | −2 |
| 3 | 33 | 30 | −3 |
| 4 | 16 | 15 | −1 |
| **Total** | **136** | **136** | **0** |

- **El exceso de la iteración 1 se declara.** Se compensa con la holgura de las iteraciones 2 a 4.
  - Lo que al 01/10 no satisfaga la definición de terminado, sin afectar el criterio del v1, pasa a la iteración 2 por el criterio de corte (V.1, línea 18).
  - La holgura de la iteración 2 (2 h) y la de la iteración 3 (3 h) lo absorben.
- **Tabla 18:** la tarea «Vista web de consulta de permiso» (RF-02, 4 h) pasa de la iteración 3 a la 2. Subtotales: 34, 57, 30 y 15.
- **Tabla 19:** sin cambios en horas. La fila 3 declara que postergar la vista web deja sin cumplir la parte de paridad con la web de los criterios de RF-02 y RF-03.
- **Figura 3:** la barra de la vista web de permisos pasa a la iteración 2 y depende de la cadena de reglas y de la línea de comandos. Se genera con `tools/figura_cronograma.py`.

**Condición que invalida la decisión:**
- que la iteración 1 cierre el 01/10 con más de 6 h de trabajo trasladado a la iteración 2: la holgura ya no alcanza y hay que aplicar la Tabla 19;
- que la reducción del 15 % se concentre en la iteración 2, por ejemplo por la fecha de los exámenes, que no consta en el repositorio: la capacidad por días de esa iteración baja y el exceso se traslada a ella.

### Consecuencias

- ADR-042, alternativa B', punto 2: queda reemplazado en lo que respecta a la vista web de permisos. La pantalla web de hallazgos sigue en la iteración 3.
- ADR-046, A1: la estabilización sigue en 15 h. La frase «la iteración 2 toma 2 h del margen de la cuarta» se reemplaza por la cuenta por días.
- Se aplica en V.1, V.2, V.4 y V.5, en `iteraciones.md`, en `tools/figura_cronograma.py` y en la Figura 3.

### Evidencia

- `informe/cap-05/V.1-definicion-iteraciones-sprints.md`: Tabla 14 y líneas 16 y 18.
- `informe/cap-05/V.4-cronograma.md`: líneas 3, 16, 20 a 45 y 55 a 67.
- `informe/anexos/anexo-I-cap3-catalogo-requisitos-matriz-trazabilidad.md`: líneas 20 y 28.
- ADR-042, ADR-046.
- revisión «revision-critico» del 28/09/2026 (eliminada el 28/09/2026; en el historial de git) (A-1, M-1) y `20260928-revision-consistencia.md` (C-1).
