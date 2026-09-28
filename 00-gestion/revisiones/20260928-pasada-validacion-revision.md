# Pasada posterior a la validación · Revisión final consolidada

- Fecha: 28/09/2026
- Fuentes:
  - [20260928-revision-critico.md](20260928-revision-critico.md) (A-, M- y B-);
  - [20260928-revision-consistencia.md](20260928-revision-consistencia.md) (C-).
- Verificación del ingeniero: confirmé contra el repositorio A-1, A-3, A-6, A-7, C-1, C-2 y M-4. El resto se toma del informe del revisor y se vuelve a controlar al aplicar.
- Estado: **aprobado por el autor el 28/09/2026; en aplicación**.

Las cifras cierran, y el Anexo I y el Anexo V coinciden con el Libro carácter por carácter. Los problemas que quedan son de tres tipos:
- el plan contradice sus propios criterios de aceptación;
- se afirma más de lo que el acta sostiene;
- hay argumentos débiles en el Cap. IV.

## Bloque 1 · El plan contra sus criterios (alta)

| # | Origen | Qué pasa | Recomendación |
|---|---|---|---|
| P-01 | A-1, C-1 | Los criterios de RF-02 y RF-03 exigen que la línea de comandos y la web coincidan en las decisiones de permiso. La vista web de permisos se construye en la iteración 3, pero V.1 y V.2 dan esos criterios por cumplidos al 24/10. | **Opción A (recomendada):** pasar la vista web de permisos (4 h) a la iteración 2 (57 h, y la iteración 3 queda en 30 h). No se tocan las fichas validadas (RF-03 = iteración 2, según el acta). Requiere un ADR-047 que ajuste ADR-046, las Tablas 17, 18 y 19, `iteraciones.md` y volver a generar la Figura 3. **Condición que la invalida:** que la iteración 2, con 57 h en 23 días (unas 17,3 h por semana contra 17 efectivas), resulte inviable. **Opción B:** cerrar los criterios de RF-02 y RF-03 en la iteración 3. Cambia la iteración que validó la referente y se sumaría al aviso de PV-03. |
| P-02 | A-2, B-7 | La línea de base termina el 16/10, pero las tareas de la iteración 2 que debería ordenar empiezan antes. La fila «Reordena» de la Tabla 13 no tiene consecuencia, y las filas no son excluyentes. | En V.1, decir que el evaluador y la cadena (RF-02) no dependen del resultado porque los impone la dependencia técnica, y que el resultado ordena lo que resta después del 16/10 (RF-06, RF-08, RF-09 y la explicación) y la iteración 3. En la Tabla 13, darle a «Reordena» esa consecuencia y fijar la precedencia entre filas. |
| P-03 | A-7, C-5 | III.3 l.20 mete «las dos mediciones» dentro de las 190 h, pero la final está en el cierre. Habla de «tres artefactos» cuando los hitos son cuatro. Además, atribuye la exclusión de los Could y del Won't a la contingencia. | Línea de base en la reserva; medición final en la fase de cierre; «cuatro artefactos de la cadencia»; y los Could y el Won't quedan fuera por su prioridad MoSCoW (III.5). |
| P-04 | M-1, B-4 | V.4 reparte las horas «en proporción a dos, tres, dos y una semanas», pero las fechas no dan eso. La iteración 1 queda en unas 21 h por semana. | Reemplazar por la duración real en días y declarar la carga de la iteración 1 como riesgo, con su mitigación (orden de la Tabla 19). Aclarar en V.1 que «semana 8 y 14» son semanas del cuatrimestre. |
| P-05 | C-1, M-12 | RNF-02 figura en la iteración 2 en la ficha y en la 3 en la Tabla 14 y la Tabla 15. V.5 pone RF-11 en «Iteración 3» y la ficha dice «Sin asignar». | La ficha de RNF-02 pasa a iteración 3, que es donde se cumple el criterio. En V.5, RF-11 queda «Sin asignar», igual que RF-10. |

## Bloque 2 · Qué sostiene el acta (alta y media)

| # | Origen | Qué pasa | Recomendación |
|---|---|---|---|
| P-06 | A-3 | III.4 titula la columna «Estado y constancia» y remite el acta al Anexo II. I.6.6 la ubica en el Portafolio Digital. El acta no está en ningún anexo, y la constancia no existe (U-04). | Columna: «Estado de validación». Un único lugar para el acta: el Portafolio Digital en III.4 y en I.6.6 (el archivo vive en `01-relevamiento/validacion/`). El Anexo II queda solo para las capturas (R-03). |
| P-07 | A-4, A-5 | III.5 l.35 da a RNF-07 por completo («magnitud, unidad y condición de medición»), cuando tiene dos `[DATO PENDIENTE]`. Además, su condición de tamaño no es la que se validó. | Reformular: el umbral de 2 s y la unidad están validados en el acta del 26/09/2026; la condición de medición se revisa después de la sesión (ADR-045) y se completa en la iteración 1 (PV-01, PV-02); el aviso a la referente va en PV-03. En l.3, exceptuar esa condición de «los veintitrés se validaron». |
| P-08 | M-13 | III.2 l.85 dice que «las siete de derivación se verificaron por ejecución». RD-01 (H-01, lectura del cargador) y RD-04 (H-09) no lo sostienen. | Recontar contra `reglas.md` al aplicar y escribir el número real. |
| P-09 | M-14 | I.6.6 no dice que el resumen (RF-11) y los elementos relacionados (RF-13), que la referente vio en la maqueta, no llegan a la versión comprometida. | Agregar una oración con lo que llega de cada pantalla (el acta ya tiene esa columna). |

## Bloque 3 · Modelo de dominio (media)

| # | Origen | Qué pasa | Recomendación |
|---|---|---|---|
| P-10 | M-4 | El modelo contradice sus propias reglas:<br>• Elemento–Declaración «1..*» no admite el valor implícito (RD-04).<br>• El xor del Hallazgo no admite la entrada ilegible (RE-01).<br>• La Sustitución «origina hallazgos» pero no tiene relación con ellos.<br>• La regla nativa se define como Declaración. | Corregir a 0..* con «a lo sumo una determinante», el xor sobre {elemento, declaración, entrada}, agregar Sustitución–Hallazgo y definir la Regla de permiso como «declarada o nativa». **Atención:** modifica cardinalidades que confirmó la referente (acta, sección 4). Se declara como corrección posterior y se suma al aviso de PV-03. Toca III.2 (Tablas 2 y 4), la Figura 1, `entidades.md`, el glosario y el Anexo V. |
| P-11 | C-4 | El comentario de `modelo-dominio.mmd` dice 11 relaciones y el diagrama tiene 12 aristas. | Aclarar el desdoblamiento del xor. Lo hago yo junto con P-10. |
| P-12 | M-5 | La Tabla 5 promete resolver el LSP por lenguaje, las skills, las instrucciones y los comandos, y ningún requisito los cubre de forma explícita. | Agregar una columna «Requisito». Donde no haya requisito, remitir a L- de III.4 o retitular la columna como «en el alcance del sistema». |
| P-13 | M-3 | Ningún requisito verifica E-02 (el estado de las entradas). E-01 exige distinguir el error de la ausencia de resultado, y ningún criterio lo prueba. | Agregar E-01 y E-02 a la matriz A.I.1 con el requisito que las cubre, si existe. Si no existe, reformularlas como condiciones de diseño que verifica el Cap. VI y no como condiciones del entorno «sin sustitución». No agregar criterios a fichas validadas. |

## Bloque 4 · Cap. IV (media)

| # | Origen | Qué pasa | Recomendación |
|---|---|---|---|
| P-14 | C-2 | IV.3 l.53 anuncia «ocho» exclusiones y enumera siete, y mezcla las validadas con las de ingeniería. | Recontar contra la Tabla 8 de III.4 y corregir el número y la lista. |
| P-15 | M-6 | El lienzo no cambia decisiones: refuerza L-05 y repite L-11. La guía (l.606) dice que si no cambia nada, no se usó. | **Necesito tu dato** (pregunta 2). |
| P-16 | M-7 | Dice «infraestructura sin costo», pero la línea de base y la medición con agentes consumen tokens. | **Necesito tu dato** (pregunta 3). |
| P-17 | M-8, M-9 | Descarta modelos de negocio de forma circular y llama barrera de entrada a un conocimiento publicado bajo MIT. | Presentar las restricciones como una elección deliberada del período. Reconocer que no hay barrera y que la defensa es la independencia del núcleo y la utilidad. |

## Bloque 5 · Cap. V, solidez del plan (media)

| # | Origen | Qué pasa | Recomendación |
|---|---|---|---|
| P-18 | M-10 | La Tabla 19 posterga RF-07 y no dice que, en ese escenario, el OE-3 no se cumple. «Un tercio» no tiene fuente. | Declarar qué objetivos quedan en pie en cada orden y citar el origen de «un tercio» (ADR-046). |
| P-19 | M-11 | Llama al oráculo «condición de cada incremento», pero se regenera por iteración. No trata que OpenCode escribe en la configuración e instala un paquete al arrancar (resultado 23 del AE1, con `[DATO PENDIENTE]`). | Cambiar a «condición de cada iteración». Agregar una oración de aislamiento solo si un ADR la sostiene; si no, registrar un pendiente y no inventarla. |
| P-20 | M-2, B-6 | «Línea de comandos completa desde la segunda iteración», pero los hallazgos por esa vía llegan en la tercera. La F5 dice «resumen», que no está comprometido. | Mantener «completa» (es el término de ADR-042), pero precisar: valores y permisos en la iteración 2, hallazgos en la 3. F5: verificación (RF-07); el resumen queda condicionado. |
| P-21 | M-15 | No se dice si la CI corre en Windows ni en qué sistema operativo promete el `README` la comprobación del v1. | **Necesito tu dato** (pregunta 4). |
| P-22 | B-9 | Si H-18 da negativo, no se dice qué pasa. | Una oración: los agentes nativos salen de RF-06 y se revisa RD-03, sin mover horas. |

## Bloque 6 · Menores (aplicar en bloque)

| # | Origen | Corrección |
|---|---|---|
| P-23 | A-6 | Dar de alta en `fuentes.md` y en `bibliografia.md` a Larman (2004), Evans (2003) y Clegg y Barker (1994). Verificarlas con `verificador-fuentes` antes. |
| P-24 | B-1 | IV.3 l.49: «el referente» pasa a «la referente». |
| P-25 | B-2 | V.4 l.18: aclarar que las 15 h de la iteración 4 incluyen la acreditación de RNF-06 y RNF-07 (Should). |
| P-26 | B-3 | V.4 l.58: las 2 h de regeneración salen de «H-18 y trabajo de oráculo». |
| P-27 | B-5 | III.1 l.15: citar H-19 o I.6.4 en lugar de «A.I.3, resultado 4». |
| P-28 | B-8 | III.5 l.5 y Anexo I l.5: el Anexo sintetiza seis campos y el Libro contiene los once. |

## Fuera de esta pasada (se registran)

- C-3: la `\[fecha\]` de la entrevista en I.6 l.121 es A-06.
- La Ley N.º 27.506 está duplicada en la bibliografía y una entrada tiene `[VERIFICAR]`.
- El resultado 23 del AE1 tiene dos `[DATO PENDIENTE]`.
- Las preguntas orales 8, 9, 12 y 13 del crítico: preparar la defensa y no tocar el texto.

## Preguntas al autor

1. P-01: ¿opción A (la vista web de permisos pasa a la iteración 2, con ADR-047) u opción B?
2. P-15: ¿el lienzo cambió alguna decisión que no estuviera ya decidida? Si la respuesta es no, recomiendo decirlo con honestidad y no forzarlo.
3. P-16: ¿quién paga los tokens de las mediciones con agentes y cuánto estimás? Si no hay cifra, va como `[DATO PENDIENTE]`.
4. P-21: ¿la CI corre en Windows, además de Ubuntu? ¿En qué sistema operativo promete el `README` la comprobación del v1?

## Elección del autor

28/09/2026:
- P-01: opción A. Se registra en ADR-047. Con la capacidad por días (28/59/33/16), la iteración 2 admite las 4 h y la iteración 1 queda con un exceso declarado de 6 h (P-04).
- P-15: el lienzo no cambió ninguna decisión. Se declara con honestidad.
- P-16: los tokens los paga el autor, sin tope. No hay cifra hasta ejecutar la línea de base: se dice en prosa, sin marcador.
- P-21: CI en Ubuntu y en Windows. Ya lo fija ADR-037 (matriz `ubuntu-latest` y `windows-latest`), así que no hace falta un ADR nuevo.
- Resto: aceptado tal como se recomienda.

Aplicación:
- **Ingeniero:**
  - Libro: `entidades.md`, `glosario.md`, `trazabilidad.md` (E-01 y E-02) y RNF-02 (iteración 3).
  - Fuentes de figuras: `modelo-dominio.mmd` y `tools/figura_cronograma.py`.
  - Figuras 1 y 3 regeneradas; las anteriores quedaron respaldadas en el scratchpad.
  - ADR-047 y su fila en `INDICE.md`.
  - `pendientes.md`: PV-03 ampliado; PV-05, PV-06 y PV-07 nuevos.
- **Redactor:** III.1, III.2 y Anexo V; III.3, III.4, III.5 y Anexo I; IV.1, IV.3 e I.6.6; V.1, V.2, V.4 y V.5.
- **P-23:** las entradas se agregan después de la verificación de `verificador-fuentes`.
