# ADR-051 — Interfaces de RIGE: línea de comandos completa con esquema versionado y explicación a pedido; interfaz web local limitada a formularios y vistas; explicación por plantillas deterministas

- Estado: aceptado (28/09/2026)
- Fecha: 28/09/2026
- Capítulos afectados: Cap. I (I.6.2, I.6.5); Cap. III (III.1, III.3, III.4 L-06, III.5 Tabla 9 y párrafo final); Cap. V (V.1 Tabla 14, V.2, V.5 Tabla 21); Anexo I; libro (RF-02, RF-03, RF-07, RNF-08); Instrumento 35; `src/README.md`
- Origen: consolidación del 28/09/2026 (pendiente LI-01). No es una decisión nueva: reúne en un solo registro lo vigente de ADR-021, ADR-022, ADR-036, ADR-041 y ADR-042, todos aceptados, con la decisión D-17 del Anexo III (antes ADR-017) como antecedente.
- Reemplaza: ADR-021, ADR-022, ADR-036, ADR-041 y ADR-042. Sus archivos se eliminaron el 28/09/2026 (quedan en el historial de git).
- Relacionado: ADR-032 (stack: interfaz web servida en `127.0.0.1`, sin framework), ADR-056 (14 Must de 23), ADR-053 (medición con agentes). Las horas y la asignación a iteraciones pertenecen a la planificación (ADR-052, ADR-052 y ADR-052, en consolidación).

### Contexto

RIGE tiene dos consumidores:
- el **desarrollador**, único actor humano (I.6);
- un **agente** que consulta la configuración por vía programática. La práctica está relevada (D-17): el equipo de la referente usa un agente con permisos elevados, que consume tokens y no garantiza exactitud.

La decisión se tomó en cinco pasos, cada uno forzado por evidencia nueva.

| Paso | ADR | Qué fijó | Qué lo modificó después |
|---|---|---|---|
| 1 | D-17 (AE1) | Existe una CLI de solo lectura con salida estructurada | — |
| 2 | 022 | La CLI se limita a un comando de valores efectivos con procedencia | 041: la medición final necesita permisos por CLI |
| 3 | 021 | Explicación por plantillas deterministas, solo para permisos y hallazgos, solo en la interfaz gráfica | 036: con la CLI como interfaz completa, el desarrollador también la usa |
| 4 | 041 | La CLI responde decisiones de permiso | — |
| 5 | 042 | La CLI es la interfaz completa; la web queda limitada | 047: la vista web de permisos vuelve a la iteración 2 |
| 6 | 036 | El esquema versionado integra RF-03; RNF-08 conserva la compatibilidad; `--explicar` a pedido | — |

La evidencia que empujó la secuencia:
- En la medición final (ADR-053) el agente solo puede usar RIGE por la CLI.
- Ocho de los dieciséis casos del instrumento son de permisos, incluida toda la condición C-4 (`01-relevamiento/linea-base/respuestas.md`).
- La guía de comprobación del v1 exige un proceso que «levanta y responde en la dirección declarada» y un dato que «se recupera y se muestra» (`catedra/AE2-guia-comprobacion-v1.md`, pasos 7 y 8).
- OE-1 y OE-2 exigen coincidencia «por ambas interfaces» (I.2.4).
- El criterio principal (ADR-053) exige que la mediana de tokens por caso no aumente con RIGE.

### Alternativas evaluadas

**Eje 1 · Reparto entre interfaces**
- **I-A:** Solo línea de comandos durante todo el TIF; la web, como trabajo futuro.
- **I-B:** Paridad completa entre interfaces.
- **I-C:** CLI mínima (un comando de valores) y web como interfaz principal (ADR-022).
- **I-D:** CLI completa (valores, permisos y hallazgos) y web limitada a formularios y vistas mínimas sobre las mismas resoluciones (ADR-042, B').

**Eje 2 · Mecanismo de la explicación**
- **M-A:** Modelo de lenguaje.
- **M-B:** Plantillas deterministas sobre el rastro de la resolución, solo para decisiones de permiso (F4) y hallazgos (F5).

**Eje 3 · Explicación en la CLI**
- **E-1:** Solo datos estructurados.
- **E-2:** Explicación siempre incluida.
- **E-3:** Explicación a pedido, con `--explicar`.

**Eje 4 · Esquema de salida**
- **S-A:** RNF-08 entero a Must.
- **S-B:** Quitar la validación de esquema del criterio de RF-03.
- **S-C:** RF-03 incorpora el esquema publicado y la versión declarada; RNF-08 conserva solo la política de compatibilidad entre versiones.

### Análisis (trade-offs)

- **I-A:** la más coherente con la medición, pero arriesga el paso 7 del v1, reescribe objetivos aprobados del AE1 (OE-1 y OE-2, F6) y deja al desarrollador con una interfaz pensada para agentes. **Descartada por el autor.**
- **I-B:** duplica la superficie de verificación y excede la capacidad (ADR-052).
- **I-C:** deja a RIGE sin poder mejorar la mitad de los casos de la medición final por una exclusión de alcance, no por el producto. El resultado sería falso sobre RIGE.
- **I-D:** cada interfaz sirve a su consumidor. La CLI es la que mide el efecto de RIGE; la web es la que usa el desarrollador y la que la cátedra comprueba. No agrega lógica: expone las mismas resoluciones del núcleo.
- **M-A:** exige conexión saliente (prohibida por RNF-05), no es determinista (impide versionar resultados de referencia, ADR-029) y agrega un costo variable que nada sostiene.
- **M-B:** una explicación errónea implica una resolución errónea y la detecta el mismo oráculo. Su costo es la rigidez: una plantilla por tipo, de ahí el límite a F4 y F5.
- **E-1:** deja al desarrollador en la terminal sin explicación, contra I-D.
- **E-2:** suma tokens a cada respuesta que lee el agente, contra el criterio de tokens.
- **E-3:** sin la opción, la salida es idéntica a E-1. Si el agente pide la explicación, queda registrado en el campo `uso_rige` de la medición.
- **S-A:** rompe el recuento de 14 Must, obliga a asignar horas y su criterio no es comprobable en el período (exige una segunda versión del esquema).
- **S-B:** deja el Must sin comprobación de que la salida sea procesable, y a III.1 sin sostén.
- **S-C:** conserva los 14 Must y deja todos los criterios comprobables en el período. *Distinción para la defensa* (conocimiento general): publicar el esquema de la salida de un comando es un contrato de datos acotado; una biblioteca compromete una API mucho mayor. La compatibilidad queda diferida en ambos casos, de modo que S-C no contradice la exclusión de la biblioteca en I.6.5.

### Recomendación y fundamento

**I-D + M-B + E-3 + S-C**, que es lo que el autor ya aceptó por partes entre el 25/09 y el 28/09/2026. Este registro no cambia ninguna de esas decisiones; solo las reúne.

**Condiciones que invalidarían la decisión:**
1. **RF-02 no cierra en la iteración 2.** La CLI de permisos no tiene qué exponer; esa parte de RF-03 sigue a RF-02 y la protección de la medición final se replantea en la contingencia.
2. **Se integra la salida de RIGE o se publica una segunda versión del esquema antes de la defensa.** La referente o el equipo relevado integran la salida en sus herramientas dentro del período, o hay que publicar una segunda versión. La compatibilidad deja de ser diferible y corresponde S-A, con horas.
3. **En el piloto el agente nunca usa `--explicar`** y falla en casos donde la explicación contenía la respuesta. Se evalúa E-2 frente al criterio de tokens.
4. **La medición final muestra que las explicaciones no se comprenden.** Se rediseñan las plantillas, no se reemplazan por un modelo, mientras rija RNF-05.

### Decisión del autor

**Aceptado por el autor el 28/09/2026** (consolidación). Las decisiones de fondo ya están aceptadas: ADR-021 (retroactivo); ADR-022 (retroactivo); ADR-036, ADR-041 y ADR-042 (25/09/2026). La aceptación de este registro solo autoriza la consolidación.

### Consecuencias

**Qué ofrece cada interfaz (estado vigente):**

| Consulta | Línea de comandos | Interfaz web local |
|---|---|---|
| Valores efectivos con procedencia (RF-01, RF-03) | Sí, salida estructurada | Formulario y vista mínima |
| Decisión de permiso: decisión, cadena, regla determinante, carácter nativo o declarado (RF-02, RF-03) | Sí | Vista de consulta de permiso (iteración 2, ADR-052) |
| Hallazgos (RF-07) | Sí (iteración 3) | Vista de hallazgos (iteración 3) |
| Explicación en prosa (F4, F5) | A pedido, con `--explicar` | Sí |

- La web no tiene ninguna función que falte en la CLI.
- La coincidencia entre interfaces de OE-1 y OE-2 se verifica sobre lo que muestra la web.

**Esquema y requisitos:**
- **RF-03:** la salida valida contra el esquema publicado en el repositorio y declara su versión; el determinismo se exige con `--explicar` y sin la opción.
- **RNF-08:** Should; queda solo con la política de compatibilidad entre versiones. Categoría **Mantenibilidad**, con nota a ISO/IEC 25010, porque «Compatibilidad» no está en la lista de la cátedra.
- **El esquema:** describe tres respuestas (valores, permisos y hallazgos) y declara `explicacion` como campo opcional.
- **RF-02 y RF-07:** con `--explicar`, la CLI entrega la misma explicación que la web.

**Síntesis para el cuerpo (III.3 y V.1, Art. 21.º):** RIGE ofrece dos interfaces sobre el mismo núcleo, cada una con su consumidor. La línea de comandos es la interfaz completa, porque es la vía por la que un agente consulta la configuración y la que usa la medición del resultado. La interfaz web se limita a formularios y vistas de consulta para el desarrollador, y sobre ella se acredita la arquitectura en el v1. Se descarta ofrecer solo la línea de comandos, porque el desarrollador es el actor humano del sistema.

**Anexo III:** sin cambios. Sus filas D-17, D-21, D-22, D-26 y D-37 siguen siendo la deliberación que va al informe; este ADR es su fuente interna.

**Al aceptarse:**
- eliminar ADR-021, 022, 036, 041 y 042;
- en `INDICE.md`, reemplazar sus cinco filas por esta;
- en `04-diseno/README.md`, reemplazar las filas 021, 022, 036, 041 y 042 por esta;
- en `src/AGENTS.md`, cambiar la mención a ADR-021 y ADR-022 por ADR-051 (lo edita el autor);
- las menciones en otros ADR quedan como texto histórico, resuelto por la tabla de equivalencias del índice.

### Evidencia

- `03-requisitos/libro/catalogo/RF-02.md`, `RF-03.md`, `RF-07.md`, `RNF-08.md`
- `informe/cap-01/I.2-mision-vision-objetivos-proyecto.md` (OE-1, OE-2)
- `informe/cap-01/I.6-descripcion-detallada-sistema-informacion.md` (I.6.5)
- `informe/cap-03/III.1-entorno-sistema-informacion.md`
- `informe/cap-03/III.5-catalogo-requisitos.md`
- `informe/cap-05/V.1-definicion-iteraciones-sprints.md` (Tabla 14)
- `informe/cap-05/V.4-cronograma.md` (Tabla 19)
- `catedra/AE2-guia-comprobacion-v1.md` (pasos 7 y 8)
- `01-relevamiento/linea-base/respuestas.md`
- `01-relevamiento/linea-base/DISENO-medicion-agentes.md` (campo `uso_rige`)
- Anexo III, D-17, D-21, D-22, D-26 y D-37
- Historial de git: ADR-021, 022, 036, 041 y 042
