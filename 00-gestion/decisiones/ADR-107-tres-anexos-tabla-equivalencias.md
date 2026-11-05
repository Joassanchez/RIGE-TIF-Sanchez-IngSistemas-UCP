# ADR-107 — Tres anexos con numeración independiente (I datos relevados, II documentos del entorno o dominio, III otros anexos), con tabla de equivalencias sección por sección

- Estado: aceptado (05/11/2026), por delegación expresa del autor
- Fecha: 05/11/2026
- Capítulos afectados: todos los que remiten a anexos (I a V y X, y los capítulos por redactar); `informe/anexos/`; `00-gestion/anexo-III.md`; `03-requisitos/libro/`; `instrumentos/`; `01-relevamiento/fuentes.md`; `tools/`; `informe/AGENTS.md`
- Origen: sesión del 05/11/2026; decisión del autor del 05/11/2026 registrada en `00-gestion/pendientes.md`, sección 00; lista de verificación formal de la AE4, punto 19
- Reemplaza: ADR-033 (si se acepta)

### Contexto

**Dato del repositorio.** La lista de verificación formal de la AE4 exige, en su punto 19: «Anexo I (datos relevados), Anexo II (documentos del entorno o dominio), Anexo III (otros anexos), referidos desde el cuerpo»; en su punto 8: numeración «independiente del cuerpo, con la indicación "página X de Y" en cada anexo» (`catedra/AE4/09_Lista_Verificacion_Formal_AE4.pdf`). La consigna de la AE4 repite la numeración independiente y «página X de Y» (`catedra/AE4/00_Consigna_Oficial_AE4_v02.pdf`, punto i del Producto Final). El Instrumento 38 envía la captura de la búsqueda marcaria al Anexo III (`catedra/AE4/03_Plantillas_Instrumentos_AE4.pdf`).

**Dato del repositorio.** ADR-033 fija siete anexos, siguiendo la tabla de la plantilla de la AE2, y su condición de invalidación es «que la guía de la AE4 fije otro esquema». Esa condición se cumple:

| Anexo vigente | Título | Secciones | Archivo |
|---|---|---|---|
| I | Catálogo de requisitos y matriz de trazabilidad | A.I.1 a A.I.3 | `informe/anexos/anexo-I-catalogo-requisitos-matriz-trazabilidad.md` |
| II | Validaciones con la referente | A.II.1 y A.II.2 | `informe/anexos/anexo-II-validaciones-referente.md` |
| III | Bitácora de decisiones e historial del repositorio | A.III.1 a A.III.5 | `00-gestion/anexo-III.md` |
| IV | Evidencia de integración continua | Sin secciones | `informe/anexos/anexo-IV-integracion-continua.md` |
| V | Glosario del dominio y reglas de negocio | A.V.1 a A.V.4 | `informe/anexos/anexo-V-glosario-dominio-reglas-negocio.md` |
| VI | Datos relevados | A.VI.1 a A.VI.11 | `informe/anexos/anexo-VI-datos-relevados.md` |
| VII | Documentos del entorno | A.VII.1 a A.VII.3 | `informe/anexos/anexo-VII-documentos-entorno.md` |

**Dato del repositorio.** `tools/armar.py` compone el informe por entrega en `ENTREGAS` con patrones de archivo (`anexos/anexo-VI-*.md#A.VI.3,…`), no tiene composición para la AE4 y no genera «página X de Y» (pendiente M-11). `tools/figura_incidencias.py` lee `informe/anexos/anexo-VI-datos-relevados.md` y busca el rótulo `*Tabla A.VI.11.`. `tools/informe.lua` da hoja nueva a los títulos de nivel 1.

### Alternativas evaluadas

Cada alternativa conserva tres anexos, salvo la D.

- **A:** VI → I; II, VII y V → II, con el acta sin cambiar de número; III, I y IV → III, con la deliberación sin cambiar de número.
- **B:** como A, pero las validaciones van al Anexo I, y el Anexo II queda solo con documentos del entorno y del dominio.
- **C:** como A, pero el catálogo y la trazabilidad van al Anexo II, por ser documentos del dominio.
- **D:** conservar los siete anexos y declarar la correspondencia con los tres de la lista.
- **E:** tres anexos con sub-anexos que conserven su rótulo anterior (por ejemplo, «Anexo III-B, A.VI.3»).

### Análisis (trade-offs)

Las cifras salen del conteo de la sección «Evidencia».

- **A.** Ubicación: el acta valida el entorno, los límites y el dominio (Instrumento 31), de modo que entra como documento del entorno o dominio. La validación del prototipo v0 es el caso más forzado. Costo: 345 menciones «Anexo X», 464 citas de sección y 55 rótulos de tabla cambian en la zona que se reescribe; quedan intactas 240 menciones y 52 citas de los Anexos II y III. A.VI.n → A.I.n conserva el número de sección.
- **B.** Ubicación más pura del Anexo II. Costo adicional: 16 menciones «Anexo II», 13 citas y 2 rótulos. Pierde la estabilidad de A.II.1 y A.II.2, y A.II.n cambia de significado además de A.I.n.
- **C.** El catálogo es un producto del proyecto, no un documento del dominio relevado: mezcla lo que el sistema debe hacer con el entorno que lo condiciona. Tampoco ahorra renumeración. Se descarta por criterio de contenido.
- **D.** Costo nulo, pero incumple el punto 19, y su reiteración se pondera en la dimensión F. Se descarta.
- **E.** Conserva los rótulos internos, pero A.VI.3 dentro del Anexo I sigue siendo una remisión a un anexo inexistente. Quiebra el criterio uniforme de formato. Se descarta.

**Riesgo común a A, B y C (conocimiento general de ingeniería).** Con A, «Anexo I» y A.I.1 a A.I.3 cambian de significado. Una remisión olvidada no produce un error visible: apunta a otro contenido. Por eso la migración es una sola pasada simultánea, con inventario previo (Consecuencias).

### Recomendación y fundamento

**A.** Cumple el punto 19 con la menor renumeración, conserva el número de sección de los datos relevados y deja intacta la deliberación, la zona más citada después de los datos relevados.

**Condición que la invalidaría:** una aclaración del docente que fije otro contenido para cada anexo o que exija separar las validaciones de los documentos del entorno. En ese caso se pasa a B.

### Decisión del autor

Aceptado el 05/11/2026 con la alternativa A. Preguntado si aceptaba este registro, el autor respondió «hazlo todo vos»: el ingeniero registra la aceptación y ejecuta la migración por esa delegación. El autor conserva la decisión y puede revertirla antes de hacer el commit.

Precisión de la ejecución: la migración se hizo con un guion determinista de reemplazo simultáneo, en lugar de `/corregir`, porque un modelo no garantiza la exactitud de más de mil reemplazos. La paginación del punto 6 queda en `pendientes.md`, AE4-12, porque se verifica sobre el PDF del informe completo.

### Consecuencias

**Esquema adoptado.**

| Anexo | Título | Secciones |
|---|---|---|
| I | Datos relevados | A.I.1 a A.I.11 |
| II | Documentos del entorno o dominio | A.II.1 a A.II.9 |
| III | Otros anexos | A.III.1 a A.III.10 |

**Tabla de equivalencias de secciones.** «Citas R» cuenta las menciones en la zona que se reescribe; «Citas H», en los registros fechados, que no se reescriben.

| Sección vigente | Contenido | Sección nueva | Citas R | Citas H |
|---|---|---|---:|---:|
| A.VI.1 | Instrumento de medición: composición del banco | A.I.1 | 5 | 8 |
| A.VI.2 | Ejecución de la medición | A.I.2 | 13 | 6 |
| A.VI.3 | Relevamiento técnico de OpenCode 1.18.25 | A.I.3 | 159 | 15 |
| A.VI.4 | Nómina del estado del arte | A.I.4 | 54 | 3 |
| A.VI.5 | Entrevista semiestructurada al referente técnico | A.I.5 | 33 | 12 |
| A.VI.6 | Relevamiento documental de incidencias | A.I.6 | 31 | 20 |
| A.VI.7 | Criterio de corrección | A.I.7 | 8 | 7 |
| A.VI.8 | Registro de la medición | A.I.8 | 40 | 15 |
| A.VI.9 | Composición de los gráficos previstos | A.I.9 | 1 | 2 |
| A.VI.10 | Tarifas de referencia congeladas | A.I.10 | 13 | 1 |
| A.VI.11 | Registro de la evidencia | A.I.11 | 58 | 3 |
| A.II.1 | Guía y acta de la sesión de validación | A.II.1, sin cambio | 9 | 9 |
| A.II.2 | Validación del prototipo v0 | A.II.2, sin cambio | 4 | 7 |
| A.VII.1 | Material de la organización consultada | A.II.3 | 1 | 2 |
| A.VII.2 | Normativa pertinente | A.II.4 | 3 | 4 |
| A.VII.3 | Licencia de la herramienta base | A.II.5 | 1 | 8 |
| A.V.1 | Glosario del dominio | A.II.6 | 2 | 2 |
| A.V.2 | Registro de reglas de negocio | A.II.7 | 3 | 4 |
| A.V.3 | Atributos de las entidades del dominio | A.II.8 | 3 | 2 |
| A.V.4 | Relaciones del dominio | A.II.9 | 3 | 2 |
| A.III.1 | Registro de decisiones | A.III.1, sin cambio | 1 | 6 |
| A.III.2 | Deliberación ampliada | A.III.2, sin cambio | 1 | 0 |
| A.III.3 | Fundamentos y cálculos remitidos | A.III.3, sin cambio | 34 | 5 |
| A.III.4 | Historial del repositorio | A.III.4, sin cambio | 1 | 3 |
| A.III.5 | Declaración de coautoría | A.III.5, sin cambio | 2 | 0 |
| A.I.1 | Fichas de los requisitos | A.III.6 | 27 | 20 |
| A.I.2 | Matriz de trazabilidad | A.III.7 | 4 | 13 |
| A.I.3 | Correspondencia entre funciones y requisitos | A.III.8 | 2 | 12 |
| Anexo IV, sin sección | Evidencia de integración continua | A.III.9 | 0 | 0 |
| No existe | Captura y constancia de la búsqueda marcaria (Instrumento 38) | A.III.10 | 0 | 0 |

Las subsecciones siguen a su sección (A.VI.3.4 → A.I.3.4). Las citas de A.III.9 se cuentan en «Anexo IV».

**Menciones «Anexo X».**

| Mención vigente | Mención nueva | Menciones R | Menciones H |
|---|---|---:|---:|
| Anexo VI | Anexo I | 287 | 42 |
| Anexo I | Anexo III (35 de las 36; la restante es ajena, ver excepciones) | 36 | 72 |
| Anexo V | Anexo II | 15 | 14 |
| Anexo VII | Anexo II | 4 | 8 |
| Anexo IV | Anexo III | 4 | 4 |
| Anexo II | Anexo II, sin cambio | 16 | 9 |
| Anexo III | Anexo III, sin cambio | 224 | 72 |

**Rótulos de tabla.** Se numeran de manera correlativa dentro de cada anexo y su número no coincide necesariamente con el de la sección.

| Rótulo vigente | Rótulo nuevo | Menciones R |
|---|---|---:|
| Tabla A.VI.1 a A.VI.16 | Tabla A.I.1 a A.I.16, mismo número | 40 |
| Tabla A.II.1 y A.II.2 | Sin cambio | 2 |
| Tabla A.VII.1 | Tabla A.II.3 | 1 |
| Tabla A.V.1 a A.V.4 | Tabla A.II.4 a A.II.7 | 9 |
| Tabla A.III.1 a A.III.5 | Sin cambio | 6 |
| Tabla A.I.2 del anexo y Tabla A.I.1 de `03-requisitos/libro/trazabilidad.md` (la misma matriz) | Tabla A.III.6 | 2 |
| Tabla A.I.3 del anexo (funciones y requisitos) | Tabla A.III.7 | 1 |
| Tabla A.I.3 de `03-requisitos/libro/trazabilidad.md` (requisitos y componentes) | Tabla A.III.8 | 1 |
| Tabla A.IV.1 | Tabla A.III.9 | 1 |

Las menciones R de esta tabla suman 63, de las cuales cambian 55. El Libro y el anexo rotulan hoy la misma matriz con números distintos, y usan «Tabla A.I.3» para dos tablas distintas; la migración corrige ambas diferencias y trata estos rótulos por archivo, no por expresión general.

**Totales de la zona R.** Menciones «Anexo X»: 586, cambian 345; 240 quedan sin cambio y 1 es ajena a los anexos del informe (excepciones). Citas de sección: 519, cambian 464; 52 quedan sin cambio y 3 se excluyen (excepciones). Rótulos: 63, cambian 55. Son menciones y no remisiones: «Anexo VI, A.VI.3» cuenta una en cada columna.

**Archivos.**

| Archivo vigente | Archivo nuevo |
|---|---|
| `anexo-VI-datos-relevados.md` | `anexo-I-datos-relevados.md` |
| `anexo-II-validaciones-referente.md`, `anexo-VII-documentos-entorno.md`, `anexo-V-glosario-dominio-reglas-negocio.md` | `anexo-II-documentos-entorno-dominio.md`, en ese orden |
| `00-gestion/anexo-III.md` | Sin cambio de ruta; título «ANEXO III · OTROS ANEXOS» |
| `anexo-I-catalogo-requisitos-matriz-trazabilidad.md`, `anexo-IV-integracion-continua.md` | `anexo-III-catalogo-integracion-marcaria.md`, sin título de nivel 1 propio, con A.III.6 a A.III.10 |

**Migración, después de aceptado.** Se ejecuta con `/corregir`; ninguna de estas tareas se hace en esta decisión.

1. **Inventario previo:** registrar con ruta y línea las 33 citas A.I.1 a A.I.3, las 36 menciones «Anexo I» y las 5 menciones de rótulos afectados de los Anexos I y IV de la zona R.
2. **Una sola pasada simultánea** (una expresión con todas las alternativas, sin reemplazos encadenados), con los rótulos antes que las citas de sección, porque tienen otra tabla de destino. Encadenar reemplazos convierte «Anexo VI» en «Anexo I» y luego en «Anexo III».
3. **Excepciones de la pasada:** las tres citas de `01-relevamiento/fuentes.md`, líneas 28, 62 y 63 (A.I.4 y A.I.10, numeración del AE1, que vuelve a ser correcta); la línea 59 del mismo archivo («E/CN.3/2026/12, anexo I», de una publicación de Naciones Unidas); a mano, los plurales de `fuentes.md`, líneas 137 a 139, y `tools/armar.py`, línea 29.
4. **Control posterior:** cero menciones de Anexos IV a VII y de A.IV a A.VII en la zona R; revisión contra el inventario de cada A.I.n resultante; `git diff` por archivo.
5. **`tools/armar.py`:** agregar la composición `AE4`. Retirar las de AE1 y AE2, que dejan de ser reproducibles (quedan en git), junto con `filtrar_secciones`, si no se usa.
6. **Paginación (M-11, AE4-12):** sección de Word propia por cada título `# ANEXO …`, con pie «página X de Y» reiniciado en cada anexo. El archivo del Anexo III que continúa no lleva título de nivel 1 para no abrir otra sección. Lo resuelve `tools/informe.lua`, y se verifica en el PDF.
7. **Otros:** rutas y rótulo en `tools/figura_incidencias.py` y `tools/README.md`; A.VI.11 en `informe/AGENTS.md`; `informe/anexos/00-anexos.md`; regenerar el Libro y los instrumentos (VER-14).
8. **Registros fechados (zona H):** no se reescriben. Se agrega a `INDICE.md`, «Equivalencias», la fila de ADR-033 y una remisión a esta tabla para leer una mención anterior al cambio.

Al aceptarse, ADR-033 pasa a «reemplazado por ADR-107» en su archivo y en `INDICE.md`.

**Destino de los instrumentos nuevos.** Los Instrumentos 36, 37 y 39 citan la numeración vigente hasta que se ejecute la migración, y la pasada los incluye.

### Evidencia

- `catedra/AE4/09_Lista_Verificacion_Formal_AE4.pdf`, puntos 8 y 19; `catedra/AE4/00_Consigna_Oficial_AE4_v02.pdf`; `catedra/AE4/03_Plantillas_Instrumentos_AE4.pdf`, Instrumento 38
- ADR-033; `tools/armar.py`; `tools/informe.lua`; `tools/figura_incidencias.py`

**Método del conteo (05/11/2026, antes de escribir este registro y sin contar los instrumentos nuevos).** Recorrido del árbol en disco, incluido lo ignorado por git, sobre archivos `.md`, `.py`, `.lua`, `.yaml`, `.yml`, `.txt`, `.json` y `.ts` en UTF-8. Se excluyen `node_modules`, `.git`, `build`, `05-entregas`, `catedra`, `.trabajo` y `src/pruebas/escenarios`.

- Rótulos: `(?<=Tabla\s)A\.(VII|VI|V|IV|III|II|I)\.(\d+)` y su equivalente con «Tablas». Se retiran del texto antes de contar secciones.
- Citas de sección: `(?<![\w.])A\.(VII|VI|V|IV|III|II|I)\.(\d+)`.
- Menciones: `\b[Aa][Nn][Ee][Xx][Oo]\s+(VII|VI|IV|V|III|II|I)\b(?![\w-])`.
- **Zona R (se reescribe):** `informe/`, `03-requisitos/libro/`, `instrumentos/`, `tools/`, `.agents/`, `.claude/`, `00-gestion/anexo-III.md`, `00-gestion/reglas-catedra.md`, `01-relevamiento/fuentes.md`, `AGENTS.md` y `CLAUDE.md`.
- **Zona H (registros fechados):** el resto, entre ellos `00-gestion/decisiones/`, la bitácora, y `01-relevamiento/` salvo `fuentes.md`. En H hay además citas de la numeración del AE1 (A.I.4, A.I.6, A.I.7, A.I.9, A.I.10, A.II.3, A.II.4, y parte de A.I.1 a A.I.3) y dos menciones A.VI.12 y A.VI.13 que no son secciones.
- `src/`: cero menciones.
