# ADR-095 — Exploración de mecanismos de OpenCode con k = 1 antes de fijar la línea de base de verificabilidad

- Estado: reemplazado por ADR-098 (19/10/2026), sin ejecutarse
- Fecha: 15/10/2026
- **Se decide después de conocer los resultados** de las tandas del 15/10/2026 (ADR-094) y su objetivo declarado es encontrar mecanismos en los que un agente declara un cambio sin efecto. Es una búsqueda deliberada, no una medición de prevalencia.
- Capítulos afectados: Anexo VI (A.VI.7, A.VI.8); diseño de la medición
- Origen: sesión del 15/10/2026; crítica metodológica de Codex (`gpt-6.1-sol`) sobre `.trabajo/linea-base/PROPUESTA-rediseno-mediciones-20261015.md`, informada en el chat
- Relacionado: ADR-090 a ADR-094

### Contexto

1. **[D]** En las tandas del 15/10/2026 (antecedente, ADR-094), los problemas de `build` se reducen a un solo mecanismo: reglas `read`/`edit` con ruta absoluta (M-1, M-2, M-10 y D2). Las otras 7 tareas de permiso no muestran problema.
2. **[D]** El relevamiento (`01-relevamiento/opencode/como-funciona.md`, `laboratorio-verificacion.md`, `incidencias.md`) y los issues #15507 y #35503 describen otros mecanismos de 1.18.25 en los que una declaración puede no surtir efecto o romper otra restricción sin aviso. La crítica descartó 6 de 16 candidatos iniciales por contradecir esas fuentes.
3. Decisión del autor (15/10/2026): plan chico, de un día, con k = 1, para encontrar los problemas; las repeticiones quedan para la medición de noviembre.

### Alternativas evaluadas

- **A:** repetir solo M-1 a M-10 con ADR-094 (k = 3).
- **B:** rediseño amplio (cuatro bloques, tres escenarios, ~300 ejecuciones).
- **C:** exploración chica: tareas actuales más hasta 23 mecanismos candidatos y 3 pedidos por síntoma, cada tarea una vez por ejecutor.

### Recomendación y fundamento

**C.**

1. **Tareas:** M-1 a M-10, V-1 a V-4 y D-A a D-C, sin cambios, más N-1 a N-8 (orden de claves al fusionar; `.opencode/` anidados; conflicto de clave entre agente JSON y markdown; `OPENCODE_PERMISSION` inválido; `allow` global que debilita a `plan`; claves PascalCase; protección de un secreto frente a `grep` y bash; aprobación persistida), N-9 a N-13 (`tools` frente a `permission`; `skill` en el frontmatter de un agente markdown; configuración global como enlace simbólico; `OPENCODE_CONFIG` frente a un agente markdown global; `{env:VAR}` sin la variable; los dos últimos son de valores y se informan aparte), hasta 10 candidatos más de una búsqueda acotada de issues de OpenCode 1.18.x, y S-1 a S-3 (pedido por síntoma sobre tres tareas existentes). **Tope:** hasta 23 candidatos a comprobar y unas 100 ejecuciones; lo que no entre en el día queda anotado para la medición de noviembre.
2. **Admisión:** cada tarea nueva entra solo si se reproduce en el contenedor sin cuota: la base no cumple el objetivo, la variante correcta lo cumple sin romper guardas y la ingenua queda sin efecto o rompe una guarda. Las que no, se retiran con su motivo.
3. **Ejecución:** `build` y Charles, `gpt-6.1-sol`, k = 1, semilla 20261015, 600 s, con documentación y `webfetch` (ADR-094).
4. **Resultado principal:** lista de **mecanismos distintos** con éxito declarado falso, por ejecutor. Secundarios: objetivo no logrado frente a restricción rota, tokens. Sin criterio de cumplimiento: es exploratoria.
5. **Después:** con los mecanismos encontrados se fija, en un ADR aparte, la línea de base con repeticiones y el criterio de ADR-093, que además se corrige hacia brazos simultáneos (agente solo y agente con RIGE en la misma medición final), por el sesgo de regresión a la media señalado en la crítica.

**Condición que invalidaría la decisión:** que ninguna tarea nueva se reproduzca en el contenedor; se informa y se mide A.

### Decisión del autor

*(pendiente)*

### Consecuencias

Ficha MED-11 (Codex); verificación en el contenedor; ensayo; tanda con k = 1; informe al autor. ADR-093 queda pendiente de corrección.

### Evidencia

- `.trabajo/linea-base/PROPUESTA-rediseno-mediciones-20261015.md` y la crítica (chat del 15/10/2026)
- `01-relevamiento/opencode/`; issues #15507 y #35503 de anomalyco/opencode
