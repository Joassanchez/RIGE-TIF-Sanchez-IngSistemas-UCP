# Pasada posterior a la validación · Fase 5 · Cap. V

- Fecha del informe: 28/09/2026
- Objeto: `informe/cap-05/V.1`, `V.2`, `V.4` y `V.5`; `03-requisitos/libro/iteraciones.md`; Figura 3
- Base: ADR-046 (aceptado hoy, A1 + B1), ADR-035, ADR-036, ADR-037 (P3), ADR-039, ADR-040, ADR-041, ADR-042, ADR-044, ADR-045; AD-07, AD-14, AD-21, AD-23; G-01
- Aplicación: con `/corregir` (redactor), una sección por vez; cada una vuelve a «borrador». El libro lo corrige el ingeniero.
- Estado: **aplicado el 28/09/2026** (sección 8).

Convenciones: **[R]** repositorio · **[I]** conocimiento general · **[S]** suposición.

---

## 0. Lo que conviene mirar primero

1. **Figura 3 (Gantt).** Muestra el plan viejo: RF-03 en la iteración 3, RF-10, la vista web de permisos en la iteración 2 y ninguna barra para la línea de base del 02/10 al 16/10. No hay fuente en el repositorio: el PNG se generó con matplotlib fuera de él [R, `git ls-files`]. Ver F5-30.
2. **Contradicción sobre H-18.** V.1 (línea 16) y la Tabla 18 ubican la verificación de H-18 en la **segunda** iteración. La matriz de trazabilidad del libro y del Anexo I dice que «se ejecuta en la **primera** iteración» (fila H-18) [R]. Recomiendo corregir la matriz: la Tabla 18 es la que asigna horas. Ver F5-31.
3. **La medición final ya no es «con participantes».** ADR-040 la hace con agentes. V.1, V.2, V.4 y V.5 lo siguen diciendo, o dan «ocho casos» cuando el instrumento tiene dieciséis. Entra en esta fase por AD-14 y ADR-040 («V.1 y V.4: horas y compensación»). En V.2 y V.5 lo aplico por coherencia.

---

## 1. V.1 · Iteraciones

| # | Línea | Texto actual | Corrección | Sostén |
|---|---|---|---|---|
| F5-01 | 3 | «La medición final con participantes y la conclusión del informe…» | «La medición final, con agentes de programación como ejecutores del procedimiento, y la conclusión del informe…» | ADR-040 |
| F5-02 | 5 | «…la segunda incorpora la explicación de permisos; y la tercera completa el descubrimiento y la verificación del ecosistema…» | «…la segunda incorpora la decisión de permisos con su explicación y la línea de comandos completa; y la tercera completa el descubrimiento y la verificación del ecosistema, junto con las vistas web de permisos y de hallazgos…» | ADR-042 |
| F5-03 | 10 (Tabla 14, iteración 2) | Objetivo y requisitos actuales | Objetivo: «Para un agente y un comando de terminal simple, RIGE informa la decisión, la cadena de reglas, la regla determinante con su carácter nativo o declarado y su explicación, y expone por línea de comandos los valores efectivos y la decisión de permiso con una salida estructurada, determinista y ajustada al esquema publicado. La decisión coincide con la del evaluador vigente en el 100 % de los casos de prueba». Requisitos: «RF-02, RF-03, RF-06, RF-08, RF-09; verificación de H-18» | ADR-042, ADR-041, ADR-035 |
| F5-04 | 11 (Tabla 14, iteración 3) | «…y expone por línea de comandos valores idénticos a los de la interfaz de escritorio» · «RF-03, RF-04, RF-05, RF-07, RNF-02, RNF-04, RNF-05. Condicionados: RF-11, RNF-06, RNF-07, RNF-08» | «…detecta los seis tipos de hallazgo con cero falsos positivos, y la interfaz web local presenta las vistas de permisos y de hallazgos con los mismos resultados que la línea de comandos» · «RF-04, RF-05, RF-07, RNF-02, RNF-04, RNF-05. Condicionados: RF-10, RF-11, RNF-08» | ADR-042, AD-07; ADR-037 P3 y ADR-044 (RNF-06 y RNF-07 van a la iteración 4) |
| F5-05 | 12 (Tabla 14, iteración 4) | «…de los quince requisitos Must…» · «Ninguno nuevo» | «…de los catorce requisitos Must…» · «Ninguno nuevo; acreditación de RNF-06 y RNF-07 dentro de la estabilización» | ADR-035, ADR-046 |
| F5-06 | 16 | «Dentro de ella, el resultado de la línea de base, disponible antes de su inicio, fija el orden conforme a la Tabla 13…» | «Dentro de ella, el orden lo fija el resultado de la línea de base conforme a la Tabla 13. La línea de base se ejecuta entre el 02/10 y el 16/10 como corrección del informe de la AE1, con cargo a la reserva de la Ventana, y su resultado está disponible antes de fijar ese orden, una vez incorporado el evaluador de permisos…» (el resto igual) | ADR-039, conservado por ADR-040; AD-14 |

---

## 2. V.2 · Entregables

| # | Línea | Texto actual | Corrección | Sostén |
|---|---|---|---|---|
| F5-07 | 3 | «…Ubuntu 26.04, plataforma de acreditación de RNF-06…» | «…Ubuntu 26.04, plataforma de referencia de RNF-06…» | ADR-037 |
| F5-08 | 12 (iteración 2, condición) | «Pasan los criterios de RF-02, RF-06, RF-08, RF-09 y RF-10; …» | «Pasan los criterios de RF-02, RF-03, RF-06, RF-08 y RF-09; la salida por línea de comandos valida contra el esquema publicado y declara su versión; …» (el resto igual) | ADR-035, ADR-036, ADR-042 |
| F5-09 | 12 (iteración 2, documentales) | «Correcciones de la Ventana de Mejora y Cumplimiento (09/10 al 16/10), si corresponden, y del informe de la AE1» | Agregar: «, incluida la ejecución de la línea de base (02/10 al 16/10)» | ADR-039, ADR-040 |
| F5-10 | 16 (iteración 3, condición) | «Pasan los criterios de RF-03, RF-04, RF-05 y RF-07; … la salida por línea de comandos coincide con la interfaz de escritorio; …» | «Pasan los criterios de RF-04, RF-05 y RF-07; … la interfaz web local presenta los mismos valores, decisiones y hallazgos que la línea de comandos; …» | ADR-042, AD-07 |
| F5-11 | 20 (iteración 4) | «…de los quince requisitos Must…» | «…de los catorce requisitos Must…». Agregar al final: «; consta la acreditación de RNF-06 y RNF-07, o su postergación» | ADR-035, ADR-037 P3, ADR-044 |
| F5-12 | 24 (fase de cierre) | «…con los ocho casos reverificados antes de la primera sesión…» | «…con los dieciséis casos del instrumento reverificados antes de la ejecución…» | ADR-040 |

**Sin corregir.** La fase de cierre dice «consta la constancia de la referente exigida por el OE-4». OE-4 cambia con ADR-040 (I.2.3, grupo C). Queda para esa pasada.

---

## 3. V.4 · Cronograma (ADR-046)

| # | Línea | Corrección | Sostén |
|---|---|---|---|
| F5-13 | 16 | Agregar después de la distribución de la reserva: «La reserva de la Ventana comprende, además, la ejecución de la línea de base con agentes de programación, estimada en [cifra de ADR-040], compensada con la preparación de la medición final, que se reduce a volver a ejecutar el guion». Agregar después de la capacidad por iteración: «El plan asigna 53 h a la segunda iteración, con cargo a 2 h del margen de la cuarta, que queda en 15 h». | ADR-040; ADR-046 (A1). **Cifra:** ADR-040 dice «17 a 21» en su tabla; `pendientes.md` (AD-14, AD-19) y el diseño v1.1 dicen «16 a 23». Recomiendo **16 a 23 h**, que es la estimación del diseño vigente. Confirmar |
| F5-14 | 29 a 36 (Tabla 18, iteración 2) | La fila «Comando compuesto, protección nativa desactivada y disponibilidad de la herramienta \| RF-08, RF-09, RF-10 \| 12» pasa a «Comando compuesto y protección nativa desactivada \| RF-08, RF-09 \| 8». Sale «Interfaz de consulta de permiso \| RF-02 \| 4». Entra «Salida por línea de comandos: valores y decisiones de permiso, con esquema versionado y explicación a pedido \| RF-03 \| 10». Subtotal **53** | ADR-046; ADR-041 (+4), ADR-042 (+6) |
| F5-15 | 37 a 43 (Tabla 18, iteración 3) | Sale «Salida estructurada por línea de comandos \| RF-03 \| 6». Entra «Vista web de consulta de permiso \| RF-02 \| 4». «Seis tipos de hallazgo con su explicación \| RF-07 \| 12» se conserva; «Interfaz de hallazgos \| RF-07 \| 2» pasa a «Vista web y salida por línea de comandos de los hallazgos \| RF-07 \| 4». Subtotal **34** | ADR-042 (hallazgos por línea de comandos, +2) |
| F5-16 | 44 | «…archivo de lectura \| Requisitos Must \| 17» → «…archivo de lectura; acreditación de RNF-06 y RNF-07 \| Requisitos Must; RNF-06 y RNF-07 \| 15». Total **136** | ADR-046; ADR-037 P3; ADR-044/045 |
| F5-17 | 49 | «Los cuatro requisitos Should no reciben horas. Se ejecutan en la tercera iteración solo si… condición de comprometidos de manera condicionada, declarada en el apartado III.3. La cuarta iteración opera como margen…» | «Los cinco requisitos Should no reciben horas. RF-10, RF-11 y RNF-08 se incorporan en la tercera iteración si las anteriores cierran por debajo de lo estimado; la acreditación de RNF-06 y RNF-07, que incluye la corrida en Windows 11 y la medición por etapas en ambas plataformas, se ejecuta dentro de la estabilización de la cuarta iteración, sin horas propias, y es lo primero que cae si esa estabilización se reduce. La cuarta iteración opera como margen para la corrección de defectos y no para incorporar funcionalidad.» | ADR-035, ADR-037 P3, ADR-044, ADR-045, ADR-046; coherencia con III.3 (F3-20: «se incorporan si las horas lo permiten») |
| F5-18 | 51 | «…la salida por línea de comandos depende solo del núcleo, pero su prueba de igualdad con la interfaz de escritorio exige ambas. La medición final depende de la versión congelada y de la reverificación previa de los ocho casos del instrumento.» | En la segunda iteración, la salida por línea de comandos depende del núcleo y del evaluador. En la tercera, las vistas web de permisos y de hallazgos dependen de la línea de comandos, con cuyos resultados deben coincidir. «…de la reverificación previa de los dieciséis casos del instrumento.» | ADR-042, AD-07, ADR-040 |
| F5-19 | 55 a 63 (Tabla 19) | La tabla de ADR-046 (siete filas, acumulado 45) | ADR-046 (B1) |
| F5-20 | 67 | «…Por ese motivo la salida por línea de comandos precede a la detección de hallazgos: sin RF-03, el OE-1 pierde únicamente su verificación por esa interfaz, mientras que sin RF-07 el OE-3 queda sin cumplir. …» | «…Por ese motivo la vista web de permisos y la explicación en lenguaje natural preceden a la detección de hallazgos: sin ellas, la decisión y su regla determinante siguen disponibles por línea de comandos, que es la vía por la que el agente consulta en la medición final, mientras que sin RF-07 el OE-3 queda sin cumplir. La vista web se posterga antes que la explicación, porque la explicación constituye el diferencial del producto. …» (el resto igual) | ADR-046; la frase actual dejó de ser cierta (ADR-042) |
| F5-21 | 69 | «…y los casos de uso sobre los que se ejecuta la medición final —CU-01 en su forma mínima con la advertencia de versión, CU-02 y CU-03 con RF-02, RF-06, RF-08 y RF-09—…» | «…y los casos de uso sobre los que se ejecuta la medición final: CU-01 en su forma mínima con la advertencia de versión; CU-02; CU-03, con la decisión de RF-02 —no su explicación en prosa—, RF-06, RF-08 y RF-09; y CU-05, la consulta de valores y de permisos por línea de comandos, que es la vía del agente en la medición final…» | ADR-041, ADR-042, ADR-046 |

---

## 4. V.5 · Producto mínimo viable

| # | Línea | Texto actual | Corrección | Sostén |
|---|---|---|---|---|
| F5-22 | 3 | «…satisfacen los quince requisitos Must…» · «…el desarrollador, que opera la interfaz de escritorio, y el agente externo, que consume la salida por línea de comandos.» | «catorce» · «…el desarrollador, que opera la interfaz web local o la línea de comandos, y el agente externo, que consume la línea de comandos.» | ADR-035, AD-07, ADR-042 |
| F5-23 | 9 (CU-03) | «RF-02, RF-06, RF-08, RF-09, RF-10» | «RF-02, RF-06, RF-08, RF-09» | ADR-035 |
| F5-24 | 10 (CU-04) | «…con su localización y su causa (desarrollador)» | «…con su localización y su causa (desarrollador y agente externo)» | RF-07, «por ambas interfaces» |
| F5-25 | 11 (CU-05) | «Obtener por línea de comandos los valores efectivos de un agente, con su procedencia (agente externo)» | «Obtener por línea de comandos los valores efectivos de un agente con su procedencia, y la decisión de permiso para una acción con su regla determinante (agente externo)» | ADR-041; RF-03 |
| F5-26 | 16 | «RF-05, RF-08, RF-09 y RF-10 no constituyen casos de uso propios…» | «RF-05, RF-08 y RF-09 no constituyen…» | ADR-035 |
| F5-27 | 18 a 25 (Tabla 21) | Fila «Consultar decisiones de permiso por línea de comandos (decisión L-06) \| Fuera del período» | Eliminarla (ADR-041) y reemplazarla por «Listar los elementos del ecosistema por línea de comandos (decisión L-06) \| Fuera del período». Agregar al principio: «Informar la disponibilidad de la herramienta para el modelo junto con la decisión (RF-10, Should) \| Sin asignar; se incorpora si las horas lo permiten». En la fila de RF-11: «Iteración 3, condicionada a que las anteriores cierren por debajo de lo estimado» (sin cambio) | ADR-041, ADR-035, ADR-042; AD-21 |
| F5-28 | 29 | «Los requisitos no funcionales Should RNF-06, RNF-07 y RNF-08 se comprometen de manera condicionada en la tercera iteración, conforme al apartado V.4.» | «El requisito no funcional Should RNF-08 se incorpora en la tercera iteración si las horas lo permiten; RNF-06 y RNF-07 se acreditan dentro de la estabilización de la cuarta, sin horas propias, conforme al apartado V.4.» | ADR-037 P3, ADR-044, ADR-046 |
| F5-29 | 31 | «La primera sostiene que el desarrollador responde con menos errores sobre el estado efectivo de un agente, y se contrasta en la medición final, que ejercita CU-01 a CU-03 con las mismas consultas del instrumento de la línea de base…» | «La primera sostiene que un agente de programación responde con menos errores sobre el estado efectivo de un agente cuando dispone de RIGE, y se contrasta en la medición final, en la que los agentes responden las mismas consultas del instrumento de la línea de base con RIGE disponible por línea de comandos (CU-05), que expone la lógica de CU-01 a CU-03: valor y fuente, decisión y regla determinante…» | ADR-040, ADR-041 |
| F5-29b | 33 | «…y la salida por línea de comandos, que corresponde a la tercera.» | «…a la segunda.» | ADR-042 |

**Marcadores de V.5 (G-01).** `\[enlace\]`, `\[estado\]` y `\[fecha\]` en la línea 33 se conservan: dependen del prototipo v1 (U-01), que todavía no existe. No se pueden completar sin inventar el dato.

---

## 5. Figura 3, libro y matriz

| # | Qué | Propuesta |
|---|---|---|
| F5-30 | Figura 3 (Gantt) desactualizada, sin fuente versionada | Rehacerla con un guion versionado: `tools/figura_cronograma.py`, con los datos de la Tabla 18 corregida, que la exporte con `--destino`. Cambios de contenido: RF-03 a la iteración 2 con la consulta de permisos; «RF-06, RF-08, RF-09 y RF-10» → «RF-06, RF-08 y RF-09»; «Explicación e interfaz de permisos» → «Explicación de permisos» (iteración 2) y «Vista web de permisos» (iteración 3); barra de reserva «Línea de base con agentes (02/10 al 16/10)»; estabilización de 15 h. El guion lo escribo yo (herramienta auxiliar, AD-24); el PNG lo copio con tu autorización, como la Figura 1. **Alternativa:** si tenés el guion original fuera del repositorio, me lo pasás y lo adapto |
| F5-31 | Fila H-18 de la matriz: «se ejecuta en la primera iteración» (libro y Anexo I) | «se ejecuta en la segunda iteración», como V.1 y la Tabla 18. Libro: ingeniero. Anexo I: redactor |
| F5-32 | `03-requisitos/libro/iteraciones.md` (Tablas 14, 17, 18 y 19) | Copiar las tablas corregidas de V.1 y V.4. Lo hace el ingeniero después de que el redactor corrija V.1 y V.4, para copiar el texto final |

---

## 6. Orden de aplicación

1. **V.4:** es la base numérica.
2. **V.1.**
3. **V.2.**
4. **V.5.**
5. **Libro** (`iteraciones.md` y la fila H-18) y **Anexo I** (fila H-18).
6. **Figura 3.**

**Qué cierra esta fase:**
- **Se cierran:** AD-23 (ADR-046), AD-10 (RF-10 en V), AD-21 (V.1, V.4, V.5), AD-14 (V.1 y V.4) y AD-07 en el Cap. V.
- **Avanza:** AD-12 (V.4; queda X.2 en el Cap. X).
- **Estado:** V.1, V.2, V.4 y V.5 vuelven a «borrador».

## 7. Elección del autor

Respuesta del autor (28/09/2026): aplicar todas; 16 a 23 h; rehacer la Figura 3.

## 8. Aplicación (28/09/2026)

- **Secciones:** V.4, V.1, V.2 y V.5 las aplicó el redactor y quedan en «borrador». En V.4, además, se quitó de la línea 51 la mención a la disponibilidad de la herramienta (RF-10) en la iteración 2.
- **Libro:** `iteraciones.md` sincronizado con V.1 y V.4 (Tablas 14, 18 y 19; la 17 no cambia). Fila H-18 corregida en el libro y en el Anexo I.
- **Figura 3:** regenerada con `tools/figura_cronograma.py` (nuevo, documentado en `tools/README.md`). El PNG anterior quedó guardado en el directorio temporal de la sesión.
- **Sin cambios, con motivo:** CU-03 sigue nombrando «su explicación». En el plan normal el MVP la incluye; solo la cláusula de contingencia la posterga.
- **Marcadores:** quedan `\[enlace\]`, `\[estado\]` y `\[fecha\]` en V.5, que dependen del prototipo v1 (U-01).
- **Riesgo informado por el redactor:** la reserva de la Ventana (20 h) y la línea de base (16 a 23 h) quedan justas, aun con la compensación de ADR-040. Es la carga que declara ADR-040 (aceptado); la verificación de horas reales queda en la bitácora (AD-19).
