# ADR-080 — Conjunto de aceptación de RIGE: manifiesto versionado cortado el 07/11/2026, causas de retiro enumeradas y cobertura obligatoria por objetivo

- Estado: aceptado (13/10/2026)
- Fecha: 13/10/2026 (reescrito el mismo día tras la crítica de Codex)
- Capítulos afectados: Cap. I (I.2.4, indicadores de OE-1 a OE-3); verificación de RNF-02 y RF-07; Cap. V (V.2) por remisión; `src/pruebas/` (manifiesto); `04-diseno/README.md` §1
- Origen: crítica (Codex) de I.2 (el 100 % podría alcanzarse reduciendo el conjunto) y crítica (Codex) de la primera versión de este ADR, el 13/10/2026
- Precisa: ADR-029 (referencias versionadas y regeneración al cierre de cada iteración), sin modificarlo
- Relacionado: ADR-052 (corte por fecha; iteración 3 del 26/10 al 07/11; versión congelada al 14/11), RNF-02, RF-07

### Contexto

OE-1 y OE-2 exigen coincidencia en el 100 % de los escenarios, y OE-3 exige detectar todos los defectos sembrados de los seis tipos con cero falsos positivos (I.2.4).

Dato del repositorio: hoy hay dos escenarios con `REFERENCIA.json` (`src/pruebas/escenarios/v1-precedencia`, `v1-vias`), comparados con OpenCode real en el CI. No existe un inventario de defectos sembrados para RF-07. Ninguna regla impide retirar un escenario que falla, ni modificarlo hasta quitarle comprobaciones.

ADR-029 obliga a regenerar las referencias al cierre de cada iteración. Una regeneración puede mostrar una referencia desactualizada o un escenario mal construido.

### Alternativas evaluadas

- **B-0:** sin regla; el historial de git es la única garantía.
- **B-1:** congelar en v3 con retiro «por referencia o construcción inválida» (primera versión de este ADR).
- **B-2:** conjunto monótono, sin retiro nunca.
- **B-3:** manifiesto versionado con cobertura obligatoria, corte en la fecha de la iteración 3, causas de retiro enumeradas con evidencia y autorización, y base y adiciones informadas por separado.

### Análisis (trade-offs)

- **B-0** deja abierta la objeción del tribunal.
- **B-2** obliga a conservar como falla de RIGE un escenario mal construido, que mide un defecto del banco de pruebas y no del producto.
- **B-1**, según la crítica:
  - no decide qué es «inválido» ni quién lo autoriza;
  - su condición de corrimiento de la fecha contradice el corte por fecha de ADR-052;
  - no cubre el entorno de RF-07;
  - no impide vaciar un escenario sin retirarlo.
- **B-3** resuelve esos cuatro puntos. Costo: un archivo de manifiesto y una matriz de cobertura en `src/pruebas/`, que construye el escritor con una ficha. No requiere horas del autor.

### Recomendación y fundamento

**B-3:**

1. **Manifiesto versionado** (`src/pruebas/escenarios/MANIFIESTO`, formato a definir en la ficha del escritor). Por escenario registra:
   - identificador;
   - resumen de cada entrada;
   - agentes, claves y acciones consultados;
   - comprobaciones (qué criterio de aceptación verifica cada una);
   - versión de la referencia.

   El entorno de RF-07 registra además cada defecto sembrado (identificador, tipo entre los seis, localización y hallazgo esperado) y cada control correcto con su evidencia.
2. **Cobertura obligatoria.** Una matriz fija, por OE y por criterio de aceptación (RF-01, RF-02 con CA-1 a CA-8, RF-07 con sus seis tipos, RNF-02 y RNF-03), qué tiene que estar cubierto. No se puede declarar cumplimiento con cobertura incompleta.
3. **Corte del conjunto base: la revisión de `main` del 07/11/2026** (cierre de la iteración 3, ADR-052), aunque haya requisitos pendientes, que se declaran como incumplidos. El corte no se mueve sin una modificación explícita de ADR-052 fijada antes de evaluar.
4. **Causas admisibles de retiro o de modificación.** Cualquier cambio de entradas, consultas, comprobaciones o defectos y controles sembrados posterior al corte es una modificación, y debe declarar qué obligación de prueba conserva. La versión del corte se conserva en el manifiesto. Conservar solo el tipo o la cantidad no basta. Las causas admisibles, con su evidencia, son:
   - **(a)** la referencia regenerada con OpenCode 1.18.25 difiere de la registrada: no se retira, se actualiza la referencia, con la salida del trabajo `referencia-nativa` como evidencia;
   - **(b)** el escenario ejercita una entrada o un mecanismo excluido por un límite aprobado antes del corte (III.4): evidencia, el límite y la entrada;
   - **(c)** el escenario no se reproduce de forma aislada por un defecto propio (no carga, depende del entorno): evidencia, el registro de la reproducción aislada.

   Una falla de RIGE nunca es causa de retiro. Un defecto sembrado de RF-07 nunca es causa de retiro de su entorno: si una corrección elimina un defecto o un control, se reemplaza por otro del mismo tipo.
5. **Responsables:** el ingeniero clasifica la causa y el autor autoriza cada retiro o modificación. Cada uno queda en la bitácora y en el manifiesto, con la evidencia y la obligación que conserva. Mientras no esté resuelto, el escenario cuenta como fallido.
6. **Adiciones** posteriores al corte (regresiones ligadas a defectos registrados, escenarios nuevos): se permiten y se informan **por separado**.
7. **Cumplimiento.** Un OE se declara alcanzado solo con cero fallas en la base y en las adiciones vinculadas a ese OE presentes en la versión congelada, y con su cobertura completa.
8. **Informe de aceptación:**
   - resultados sobre la base del corte y sobre las adiciones, cada uno con conteos de fallas y sin redondeo;
   - lista de retiros desde la primera incorporación de cada escenario, incluidos los anteriores al corte;
   - verificación de la matriz de cobertura en el corte y en la versión congelada.

**Condiciones que invalidarían la decisión:**
1. **La cátedra exige otro procedimiento de aceptación** (por ejemplo, un conjunto entregado de antemano).
2. **ADR-052 se modifica** antes del 07/11 de forma que la iteración 3 cierre en otra fecha. El corte sigue a la nueva fecha, fijada antes de evaluar.

### Decisión del autor

**Aceptado por el autor el 13/10/2026**, con la condición «si está verificado y controlado y es la mejor solución disponible». La condición se cumplió con tres pasadas de crítica (Codex, 13/10/2026): la primera encontró seis bloqueantes y cinco importantes en ADR-079, y tres bloqueantes y dos importantes en ADR-080; todos se incorporaron; la tercera pasada da por resueltos los puntos abiertos, salvo la armonización del diseño de la medición, que es consecuencia de la aceptación (AD-19).

### Consecuencias

**Si se acepta:**
- **I.2.4:** los indicadores de OE-1 a OE-3 remiten al conjunto de aceptación con su manifiesto y su cobertura (corrección menor de la Tabla 1).
- **`src/`:** el manifiesto, la matriz de cobertura y la regla en `src/pruebas/README.md`, por ficha del escritor (el ingeniero no edita `src/`).
- **Bitácora:** registro de cada retiro.
- **`04-diseno/README.md` §1:** fila actualizada.
- **Cap. VI** (Sprint 3): la estrategia de pruebas lo incorpora cuando se redacte.

### Evidencia

- `00-gestion/decisiones/ADR-029-estrategia-oraculo-hibrida-resultados-referencia.md`; `ADR-052-planificacion-iteraciones-presupuesto-contingencia-consolidado.md`
- `src/pruebas/README.md`; `src/pruebas/escenarios/` (dos escenarios con `REFERENCIA.json` al 13/10/2026)
- `03-requisitos/libro/catalogo/RNF-02.md`, `RF-07.md`
- `informe/cap-01/I.2-mision-vision-objetivos-proyecto.md`, Tabla 1; `informe/cap-05/V.1-definicion-iteraciones-sprints.md`, `V.2-entregables-cada-etapa.md`
- Críticas de Codex del 13/10/2026
