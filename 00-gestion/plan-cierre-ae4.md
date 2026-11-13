# Plan de cierre de la AE4

Fuente única de la secuencia de trabajo hasta la entrega: solo el orden, sin fechas. Cualquier sesión, con cualquier herramienta, lo lee al abrir y lo actualiza al cerrar. El detalle de cada tarea está en `pendientes.md`, sección 00 (AE4-n); las decisiones, en los ADR; los vencimientos, en la consigna.

**Para retomar en una sesión nueva:** «Leé `00-gestion/plan-cierre-ae4.md`, decime en qué bloque estamos y seguí con la próxima tarea sin marcar».

## 1. Orden general

```text
B1 Preregistro → B3 Cerrar src y manual → B4 Etiqueta → B5 Medición → B6 Propagar y consolidar → B7 Armar y cargar → B8 Coloquio
                                              ↑
              B2 Capítulos que no dependen del resultado (en paralelo)
```

- La medición va después de los capítulos que no dependen de ella (decisión del autor).
- La medición exige la versión final publicada, y de su resultado dependen I.3, V.2, V.5, A.I.8, parte del XI, Conclusiones y Resumen.
- La medición arranca con la cuota semanal de Codex recién renovada, porque comparte cuota con el redactor y el escritor.

## 2. Bloques

Estado: `[ ]` pendiente · `[~]` en curso · `[x]` hecho.

### B0 · Base

- [x] ADR-107 y migración a tres anexos.
- [x] Instrumentos 36, 37 y 39 con E-01 medido.
- [x] Autor: leer el diff, commit y unir `cierre-ae4` (AE4-17, AE4-21), unión `b9ecd2f`.

### B1 · Preregistro de la medición

Va sin agentes reales: no gasta cuota de medición. Da validez al resultado: la cátedra ya observó un criterio aplicado después del dato (dictamen del 16/10, ap. 7).

- [x] Corte del MVP: fijar los 18 Must y la cobertura de los cinco problemas (ADR-080, ADR-098).
- [x] Remuestreo de 5.000 iteraciones y tolerancias de no regresión (I.3.4).
- [x] Conjunto reservado: 3 a 5 variantes de ruta absoluta, admitidas por reproducción nativa (LB-07).
- [x] Corregir las referencias de S-3 y M-2, con readmisión (LB-06).
- [x] Salvaguarda de costo por problema en USD en el análisis (LB-06, punto 4).
- [x] Criterio y regla de ejecutores, por escrito y fechados (dictamen, ap. 7).
- [ ] **Autor:** adjudicar a mano unas 20 de las 61 revisiones; se calcula la concordancia (AE4-09).
- [x] Texto exacto de la instrucción del brazo indicado y del brazo con instrucción de probar.
- [x] Ensayo final con proveedor simulado (VER-08), sobre `congelada`. Se repite sobre la etiqueta en B5.
- [x] Planilla de adjudicación lista.
- [x] **Autor:** aceptar la modificación de ADR-098, puntos 31 a 46.
- [x] Propagar a I.3.4, A.I.8, III.4 y D-41 (redactor; D-41, ingeniero).

**Si una fecha prometida en el informe no se cumple,** se corrige el texto y se declara; nunca se antedata.

### B2 · Capítulos sin resultado

- [x] VII Marketing (AE4-01): revisada el 06/11/2026, con ADR-108. Queda el marcador de uso propio del autor (AE4-26).
- [ ] XI Oportunidades, desde los Instrumentos 36, 37 y 39, con el veredicto como condición.
- [ ] VIII Propiedad Intelectual, con Instrumento 38. Espera el INPI.
- [ ] IX Diseño, con matriz ponderada y tabla de terceros (AE4-06). **Próximo capítulo** (autor, 06/11/2026): empezar por llevarle los criterios y pesos de la matriz.
- [ ] VI Metodologías, con plan de pruebas y resultados por requisito (AE4-06).
- [ ] Actas, plan de implantación (AE4-07). Espera la consulta del autor sobre los sprints.
- [ ] Horas reales por iteración: propuesta desde los commits, corregida por el autor (AE4-08).
- [ ] V y X conciliados con lo ejecutado.
- [ ] Observaciones abiertas del dictamen (AE4-10).

### B3 · Cerrar `src/` (en paralelo con B2)

- [x] Fichas del escritor: PIL-B, VER-04, VER-06 y VER-07; `package.json` alineado con la etiqueta (09/11/2026, rama `cierre-src`, T5-02 a T5-07; `.trabajo/fichas/cierre/INDICE.md`). Versión `1.0.0`.
- [x] Manual de despliegue con las 11 secciones de la guía 07 (AE4-03): `src/MANUAL.md`, con la declaración de que RIGE no usa usuario de demostración. Prueba de humo seguida por el ingeniero sobre una copia limpia.
- [~] `src/README.md` §8 coincidente con la bitácora (guía 07, paso 14): sincronizado hasta T5-07; quedan los `[AUTOR: …]` de las filas del 25/10 y del 03/11.
- [x] **Autor:** commit de los cambios de gestión y del catálogo del 09/11, y unión de `cierre-src` a `main` y push, para la corrida del CI.
- [ ] **Autor:** aceptar o rechazar la precisión propuesta del 09/11 en ADR-101 (`core.worktree` como límite caracterizado).
- [ ] Partición del catálogo de PIL-B (RF-02, RF-03 y RF-07), III.5 con R-12, R-13 y R-17 a R-19, I.6 Tabla 10 (credencial literal, D-76) y III.4 con `core.worktree` (redactor).
- [ ] **Autor:** RNF-06 real, Windows 11 con cuenta común (VER-05).
- [ ] **Autor:** prueba del manual en otra máquina, por otra persona (AE4-05). Va **antes** de la etiqueta: cada falla es un cambio del manual.

- [x] Refactor de cierre de `src/` (T5-28 a T5-37, 12/11/2026, rama `refactor-src`; AE4-35). **Autor:** commits, unión a `main` y CI.

### B4 · Etiqueta

- [ ] CI en verde sobre el commit final.
- [ ] **Autor:** etiqueta anotada, propuesta `v1.0.0`, sobre ese commit.
- [ ] Repetir RNF-05, RNF-07 y `--escala` sobre la etiqueta (VER-02, VER-04).
- [ ] Capítulo XIII con el inventario real (AE4-06).
- [ ] Instrumento 40 y grabación de la corrida completa, sobre esa etiqueta (AE4-13).

### B5 · Medición final

- [ ] Misma imagen de la línea de base, binario de la etiqueta y arnés con el preregistro de B1.
- [x] Arnés corregido antes del ensayo (AE4-33, MED-20, 12/11/2026): envoltorio `rige` invocable desde `como-dev`, consulta anidada en el ensayo y comprobación del certificado del proveedor (escudo de Avast en pausa) antes de cada tanda.
- [ ] Sobre la etiqueta: repetir el ensayo y el contraste de cobertura, registrar el corte en `MANIFIESTO.json` y acreditar el diagnóstico de la sección 11 del preregistro.
- [ ] Tandas en el orden de la sección 3.
- [ ] Análisis y veredicto con la regla de I.3.4.

### B6 · Propagar y consolidar

- [ ] **Autor:** constancia de la referente, con el resultado y los cambios acumulados (VER-03, VER-13). OE-4 exige «Criterio cumplido» y su conformidad.
- [ ] Propagar: I.3, II.6, IV.3, V.2, V.5, A.I.8, XI (decisión de perseverar o pivotar).
- [ ] Conclusiones y Resumen de hasta 600 palabras, al final (AE4-11).
- [ ] Pase único de consolidación: cifras, terminología y voz en todo el informe (lista 09, punto 25).
- [ ] Crítico sobre el informe completo.

### B7 · Armar y cargar

- [ ] `armar.py`: paginación, índices de tablas y figuras, carátulas (AE4-12).
- [ ] Regenerar `.docx` y `.xlsx` (VER-14).
- [ ] **Autor:** marcar las secciones como aprobadas (`/aprobar`), porque `armar.py` rechaza las demás.
- [ ] Revisar el PDF contra los 30 puntos de la lista 09, sobre el PDF y no sobre el Word.
- [ ] **Autor:** Cap. XII firmado, bitácora en PDF y Portafolio, puntos (a) a (g) (AE4-11, AE4-13, AE4-14).
- [ ] **Autor:** repositorio privado con la cuenta del docente como colaboradora, y enlaces probados en sesión ajena.
- [ ] **Autor:** cargar los cuatro PDF y el cuadro de texto.

### B8 · Coloquio

- [ ] Commits propios elegidos y explicados en voz alta (AE4-16).
- [ ] Los seis ejes de la grilla 08, sin leer. `00-gestion/preguntas-defensa.md` como base.
- [ ] Ensayo de la demostración sobre la etiqueta, en el equipo que se lleva al aula.

## 3. Medición final

**Orden de las tandas.** Si la cuota no alcanza, se corta desde abajo y se declara.

| Prioridad | Tanda | Por qué |
|---|---|---|
| 1 | `build`: banco con RIGE indicado (E1, E2 y E4), detección indicada, reservado con y sin RIGE, y control contemporáneo de los cinco problemas sin RIGE: 210 ejecuciones | La regla de veredicto exige meta, no regresión y atribución: sin esto no hay veredicto |
| 2 | `build`, brazo con instrucción de probar, sin RIGE, E1 y E2: 129 | Su omisión es la principal amenaza a la validez (I.3.4) |
| 3 | Charles, las tandas de la prioridad 1 sin el control: 195 | Réplica; si se corta, «sin réplica», y se declara como cambio frente a «mismos ejecutores» de I.3.4 |
| 4 | `build`: brazo disponible (138) y contraste indicado (30): 168 | ADR-093, §6; descriptivos. Si se corta, se declara |

Orden contrastado con ADR-098 al cerrar B1 (puntos 38 y 43), aceptado por el autor. Comandos: `01-relevamiento/linea-base/verificacion/20261105-med19/README.md`. Cuánta cuota consume la medición no se sabe: la línea de base no registró el porcentaje semanal, y se cortó dos veces por la ventana de 5 h. El primer tramo de la tanda se usa para estimarlo.

**Corte.** Si no se puede completar la prioridad 1 antes de propagar y armar, se entrega sin veredicto: el informe describe lo medido, declara «Meta sin evaluar» por falta de ejecución, y la medición queda como experimento para la defensa. No se presenta un resultado parcial como cumplimiento.

**Defecto de RIGE durante la medición.** Se corrige con etiqueta `v1.0.1` sin mover la anterior. Se repite lo afectado si hay cuota; si no, se declara qué tandas corresponden a cada etiqueta.

**Resultado adverso.** Es un resultado válido: «Criterio no cumplido, con hallazgo negativo». No se cambia la regla después de ver el dato; toda lectura posterior se rotula como exploratoria.

## 4. Capítulos

| Cap. | Insumos | Lo que la corrección verifica | Trampa conocida |
|---|---|---|---|
| VI | `metodo-programacion.md`, CI, manifiesto, `src/pruebas/` | Resultados por requisito Must; ramas y etiquetas; revisión y retrospectiva con evidencia | V.1 descarta las ceremonias de Scrum: contar lo aplicado. Actas reconstruidas, rotuladas |
| VII | IV.1, IV.3, Tabla 7 | Tabla por perfil: quién, valor, experiencia, canal, intercambio | Sin usuario identificado fuera del autor (IV.1): declararlo, sin inventar adopción |
| VIII | Instrumento 38, INPI, ADR-057 | Fecha, criterio, resultado y captura; clases justificadas | Marca y patente no son lo mismo; el software se protege por derecho de autor |
| IX | ADR-058, 060, 061, 062, 054, `04-diseno/`, `package.json` | Matriz con pesos y puntajes; modelo de datos; terceros con versión y licencia | La matriz se arma después de decidir: declararlo. Procedencia disciplinar (dimensión B) |
| XI | Instrumentos 36, 37, 39; ODS; IV.1 | Experimento verificable; escalabilidad con números; emergentes con necesidad | No confundir E-01, hecho, con los pendientes; revisar el lienzo a la luz del sistema |
| XII | Bitácora, Cap. V, horas | Honestidad: aciertos, errores y su causa; primera persona en el aporte | Lo escribe y firma el autor |
| XIII | Etiqueta, Anexos, `05-entregas/` | Cada elemento con ubicación y etiqueta | Se cierra después de la etiqueta |

## 5. Forma de trabajo

| Rol | Quién | Hace |
|---|---|---|
| Decide y firma | Autor | Decisiones de juicio, Cap. XII, bitácora final, etiqueta, commits, push, INPI, referente |
| Ingeniero | Claude Code | Orquesta, propone, instrumentos, fichas, medición, armado, gestión |
| Redactor | Codex, `gpt-6.1-sol`, medio | Capítulos, con ficha y ADR aceptados. Opus de respaldo |
| Escritor | Codex, `gpt-6.1-sol`, medio | Todo `src/`, en la rama `cierre-ae4` |
| Cotejo | Codex | Consigna (`gpt-6-luna`), consistencia y fuentes (`gpt-6.1-sol`) |
| Juicio | Subagentes de Claude | `critico`, `critico-codigo`, `estilo`, sobre lo que escribe Codex |
| Excepción | Codex como crítico | Solo cuando el texto lo escribió Claude, como los instrumentos |

**Flujo de un capítulo:** instrumento o insumos → esquema, con las decisiones del autor → ficha → redactor → consigna, consistencia, fuentes, estilo y crítico, una tanda por capítulo → el autor elige → `/corregir` → «revisada».

**Reglas de la sesión.**

- **Modo por defecto, no auto:** el clasificador bloqueó Bash varias veces.
- **Decisiones:** el ingeniero decide lo técnico. Trae al autor solo lo que él va a tener que defender, con recomendación. Si el autor delega, se registra como delegación.
- **Datos:** nada sin fuente. Lo que falta va como `[DATO PENDIENTE: …]` o `[AUTOR: …]`. Las reconstrucciones se rotulan con su fecha real.
- **Fuera del alcance:** ni commits del ingeniero ni estados cambiados sin delegación expresa; el escritor commitea solo en su rama.
- **IA:** cada uso, una fila en la tabla de la bitácora, en la misma sesión.
- **Al cerrar:** marcar este plan, `estado.md`, `pendientes.md`, entrada de bitácora y commit propuesto.

## 6. Lo que solo puede hacer el autor

En el orden en que se necesita:

| Qué | Destraba |
|---|---|
| Commit y unión de la rama | Todo lo demás |
| Adjudicación manual de unas 20 revisiones | Validez de la medición |
| Búsqueda en INPI | Cap. VIII, Instrumento 38, A.III.10 |
| Consulta sobre los «tres sprints»; sin respuesta, rige la lectura de las iteraciones 1 a 3 | Actas, Cap. VI |
| Corregir las horas propuestas | Caps. V, X, XII |
| RNF-06 en Windows | Etiqueta |
| Definir quién prueba el manual, y la prueba | Etiqueta |
| Etiqueta | Medición |
| Turno con la referente, pedido antes de medir | OE-4 |
| Cap. XII | Carga |

**INPI, criterio propuesto.** Denominativa «RIGE». Búsqueda en la base de marcas del INPI: forma exacta y variantes fonéticas o gráficas (RIJE, RIGUE, RIGGE, R.I.G.E.), en las clases 9 y 42; se suma la 35 solo si el modelo de negocio lo justifica. Registrar fecha y hora, criterio, resultado por cada coincidencia (acta, clase, titular, estado) y captura. Además, disponibilidad de `rige.ar` y `rige.com.ar` en NIC Argentina. «Rige» es también una forma verbal común, así que hay que esperar coincidencias.

## 7. Riesgos y qué los dispara

| Riesgo | Señal | Respuesta |
|---|---|---|
| La cuota no alcanza en la medición | Falta la prioridad 1 al llegar a B6 | Corte de la sección 3 |
| El manual falla en otra máquina | Una pregunta del que prueba | Se corrige y se repite antes de etiquetar |
| La etiqueta se atrasa | Sin CI verde al llegar a B4 | Se etiqueta lo que está en verde; lo demás, `v1.0.1`, y la medición no espera |
| La referente no llega | Sin turno confirmado al empezar B5 | Constancia por correo; sin ella, OE-4 se declara sin alcanzar y OE-1 a OE-3 se informan aparte |
| Capítulos atrasados | Falta alguno al llegar a B6 | La prioridad es tener los trece completos antes que pulidos; el crítico se limita a VI, IX y XI |
| El autor no puede defender algo | No lo explica sin leer | Se cambia en el documento antes de cargar |
| Cuota de Codex agotada antes de medir | Semanal por encima del 90 % | Redactor de respaldo (Opus); se preserva lo de la medición |
