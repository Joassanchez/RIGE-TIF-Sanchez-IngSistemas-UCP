# Ventana del AE1 · correcciones pendientes (grupo C)

Lista de trabajo autocontenida para corregir el Resumen, los Caps. I y II y los Anexos I y II del AE1 con `/corregir`, capítulo por capítulo. Reúne lo que quedó abierto de las revisiones del 25/09 y el 28/09/2026 (eliminadas el 28/09/2026; recuperables en el historial de git). Cada sección corregida vuelve a «borrador» en `estado.md`.

## 1. Línea de base con agentes (ADR-053, Anexo III D-41)

| Dónde | Cambio |
|---|---|
| I.3.1 a I.3.4 | Problema, línea de base y criterio de éxito con la medición con agentes. Criterio principal (AD-22): sobre Opus 5.5 y los doce casos de C-2 a C-4, éxito por caso (menos error con RIGE, o error nulo en ambas mediciones), cumplido con al menos 8 de 12; retrocesos informados con su causa; tokens por caso sin aumento en la mediana. Registrar en el Anexo III. |
| I.2.3 y OE-4 (Tabla 1) | Quitar «tiempo de resolución», IB-1 e IB-2 y «protocolo con participantes»; alinear con la medición con agentes. |
| I.1.2, línea 17 | La exclusión de la referente de la muestra pierde objeto respecto de la medición. |
| I.6.5 | Agregar la razón de la medición con agentes (la CLI es la única vía por la que un agente usa RIGE). |
| II.2 (incluida II.2.1, línea 13), II.3, II.6.3 | Instrumento, encuesta de práctica y amenazas. II.2.1:13 describe el mecanismo con personas y una VM con instantánea que no existe. Ventana del 02/10 al 16/10 como deuda del AE1, con cargo a la reserva (16 a 23 h, sin efecto de práctica). |
| A.I.1 (líneas 11 a 16), A.I.7 (líneas 175 y 179) | Los reescribe ADR-053. |
| A.I.5 | Uniformar «la informante» (hoy alterna con «el informante», líneas 124 a 150). |

## 2. Valor probatorio de la entrevista (cambios aprobados por el autor el 25/09/2026)

Las tres prácticas relatadas por la referente (pizarra, consulta mediante un agente con permisos elevados, agente creador de agentes) son **demanda declarada con relato de conducta**, no demanda revelada. La pizarra no sostiene ninguna conclusión. Ya aplicados: P-01, P-02, P-05, P-07, P-11 y P-12. Faltan:

| # | Dónde | Cambio |
|---|---|---|
| P-03 | II.3, «Esfuerzo de comprensión y soluciones propias» | Presentar las tres como prácticas relatadas, con la pizarra en último lugar y sin detalle. Eliminar «Los tres artefactos fueron construidos por el equipo sin intervención del autor». Agregar que no hay constancia más allá del relato de la informante. |
| P-04 | II.2.3, «Valor probatorio y su límite» | Eliminar «Una parte de lo relevado, sin embargo, no es declaración sino conducta…». Reemplazar por: las prácticas relatadas son declaraciones sobre la propia conducta, más específicas que una opinión pero sin constancia independiente, y se emplean con ese valor. |
| P-06 | `informe/00-resumen.md` | «Tres soluciones artesanales que su equipo construyó para suplir la carencia» → «las prácticas que su equipo adoptó para suplir la carencia». En la misma pasada, «plataforma de escritorio» → «interfaz web local» (línea 7, AD-07, ADR-032). |
| P-08 | II.6, Hallazgo 3 | Título: «Un equipo identificado experimenta la dificultad y relata prácticas propias para suplirla». Eliminar la enumeración de «tres artefactos» y «Los artefactos son el hallazgo de mayor peso probatorio…». Declarar que su valor es el de la entrevista. Conservar las dos decisiones que habilita (elementos nativos en el segundo episodio; la consulta programática sostiene la CLI). Sin pizarra. |
| P-09 | II.6.2 | Pasar las prácticas relatadas y el consumo de tokens a demanda declarada. Eliminar «Esta última incorporación merece señalarse… no aporta solamente lo que dice, sino lo que hizo». La demanda revelada comprende el comportamiento verificado del producto, las 32 incidencias, las siete que enlaza la propuesta de Codex y el alcance verificado de las soluciones existentes. |
| P-10 | II.6, Tabla 19 | «Dos episodios vividos y tres soluciones artesanales construidas por el equipo» → «Dos episodios vividos y prácticas propias relatadas por la informante». |

## 3. Terminología y remisiones

- **«Entrada de configuración» (A-01, ADR-020).** Falta en I.3 (líneas 5, 7, 20, 22, 30, 54 y 73), II.6 (línea 44), A.I.1 (líneas 11 a 16) y A.I.7 (líneas 175 y 179). Incluye «fuente ilegible» → «entrada ilegible». Las instrucciones son un «elemento», no una «entrada».
- **Remisiones rotas.** «Apartado II.3.4», que no existe, en II.4.1 y II.6.1 (Hallazgo 6).
- **Remisiones al Anexo III (AD-04).** Las secciones remiten a las decisiones con el código D-xx.
- **Anexos.** Renumeración de ADR-033 (M-02): Anexo I del AE1 → VI, Anexo II → VII.

## 4. Contenido del Cap. I

- **I.3.1 e I.4.3 · restos de la valoración monetaria** que ADR-018 descartó: «insume unas [H] horas anuales por desarrollador» y la contribución «en horas anuales según la valoración…». Expresar la magnitud con los indicadores de la línea de base.
- **I.3.1 · componente 4 (contexto y frecuencia).** «Cinco veces por semana, de las cuales una fracción…» no fija nada; incorporar lo que dice la entrevista: «consultas menores» y frecuencia decreciente (II.3.3).
- **I.1.3 c) · presión competitiva.** Generaliza sin fuente a partir de un único informante («demanda que crece más rápido que su dotación»); lo mismo en la Tabla 19 de II.6.4. Acotar o citar.
- **I.1.1 e I.6.1 · agentes nativos.** Se presentan como verificados; la matriz registra H-18 como pendiente de verificación propia (iteración 2). Alinear el texto con el estado real.
- **I.6.4 · Figura 1 (diagrama de contexto).** Espacio reservado. Debe incluir al sistema externo (agente consumidor de la CLI) y la escucha local.
- **I.6.6 · prototipo v0.** Falta `\[enlace\]` de la maqueta; capturas de las cinco pantallas para A.II.4 (las aporta el autor); nombres de los asistentes usados (R-03).
- **A.I.5 · entrevista.** Transcripción, canal, fecha y duración (A-06). Es el contacto sobre el que se verifica «persona, canal y motivo».

## 5. Contenido del Cap. II

- **II.1, Tabla 12.** Tres `[VERIFICAR…]` en fuentes que se citan con cifra (Galster, Lulla et al.; Chatlatanagulchai et al.; Sayagh et al.). Una sola cifra sin las tres preguntas se pondera negativamente.
- **II.4.1 · Figura 2 (incidencias por mes).** Los datos existen (32 incidencias con fecha en A.I.6).
- **II.5 · PESTEL.** No tiene factores Político ni Ecológico y no dice por qué: una oración («las dimensiones P y E no registran factores con implicancia decisoria»).
- **II.5.5 · Tabla 18 (sector de los recursos).** Completar con el encuadre grupal corregido (AD-27): costo de referencia = promedio bruto del OPSSI, $3.738.000 a marzo de 2026 (`opssi2026`).
- **A.I.3 · resultados 22 y 23 (AD-08).** El 23 (OpenCode escribe al arrancar e instala `@opencode-ai/plugin`) conserva dos `[DATO PENDIENTE]`: verificarlo en ejecución en el entorno aislado y completar la fila. Después, agregar H-22 y H-23 a `03-requisitos/libro/trazabilidad.md` y al Anexo I del Cap. III.

## 6. Numeración del informe consolidado (A-03, sin decidir)

Hoy el AE1 numera Tablas 1 a 19 y Figuras 1 y 2, y la AE2 reinicia desde 1: en el informe consolidado cada número aparece dos veces. Además, «hallazgo» tiene tres sentidos (resultado técnico H-nn, hallazgo del relevamiento HA-n y producto de RIGE).

- Alternativas: correlativa en todo el informe · por capítulo («Tabla III.7») · automática en el armado (filtro de `tools/informe.lua`).
- Recomendación del ingeniero: **por capítulo**, una sola vez, después del grupo C; declarar los códigos H-nn en A.I.3 y HA-n en II.6.1, y reservar «hallazgo» para el producto de RIGE en el glosario.
- Condición que la invalidaría: que la cátedra exija «Tabla N» simple (`[DATO PENDIENTE: confirmar el formato de leyendas del Art. 21.º o la plantilla final]`).
- Decidir con `/decidir A-03`.

## Tipos de hallazgo (ADR-059, 29/09/2026)

| Dónde | Cambio |
|---|---|
| I.2, OE-3 (Tabla 1) | Agregar el sexto tipo de hallazgo, «entradas descartadas sin error visible», alineado con RF-07. |
| I.6.3, Tabla 8 | Agregar la definición de «Entrada descartada sin error visible»: entrada de configuración que la herramienta descarta sin emitir error, como una variable de entorno de configuración con contenido inválido (H-14). |
