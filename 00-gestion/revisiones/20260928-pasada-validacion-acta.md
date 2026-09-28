# Pasada posterior a la validación · Fase 1 · Acta (guía v2)

- Fecha del informe: 28/09/2026
- Archivo objeto: `01-relevamiento/validacion/20260925_GuiaValidacion_Sanchez_v2.md` (Instrumento 31, guía y acta v2)
- Fuente de los datos: bloque «Datos de la sesión» entregado por el autor el 28/09/2026 (sin otra constancia en el repositorio)
- Estado: **aplicado el 28/09/2026** (sección 6).

Convenciones: **[R]** dato del repositorio · **[A]** dato informado por el autor en esta sesión · **[I]** conocimiento general de ingeniería · **[S]** suposición.

---

## 1. Datos que faltan o son ambiguos (bloquean la aplicación)

| # | Dato | Qué llegó [A] | Problema | Qué se necesita |
|---|---|---|---|---|
| B-1 | Fecha de la sesión | «17:00» | Solo la hora. La fecha es el dato del que depende todo el resto de la pasada: «acta del <fecha>» en III.1, III.2, III.4, Anexos I y V, trazabilidad, I.6.6 y el cierre de A-05 y V-01. La bitácora no tiene entradas del 26 al 28/09 [R]. | La fecha (dd/mm/aaaa). Sin ella no se aplica ninguna fase. |
| B-2 | Tamaño del proyecto real (RNF-07) | «agentes ___ · entradas ___ · elementos ___» | Las tres cifras en blanco. ADR-044 prevé que, si la referente no las informa, **se aplica P-A** (escenario más grande del entorno controlado) y se declara la limitación [R]. | Indicar cuál de los dos casos: (a) la referente las informó y hay que cargarlas; (b) no las informó en la sesión. |
| B-3 | Respuesta sobre el v0 | «no» | Las tres preguntas de la sección 7 no admiten un «no» único: «¿El recorrido responde las preguntas?» → «no» sería un rechazo, y contradice «aprobó todo sin observaciones». | Confirmar que significa «sin observaciones: el recorrido responde, no faltan pantallas y el orden es correcto». |
| B-4 | Sinónimos del vocabulario (sección 6) | No informado | «Nociones faltantes: no» responde la consulta de la sección 4, no la columna «Término que usa el equipo» de la sección 6. | Confirmar que la referente no informó términos distintos de los adoptados. |
| B-5 | Pedido del agente del equipo (sección 8, última fila) | No informado | Es un pedido (AD-17), no una consulta de la sesión. | Si se entregó o se reiteró en la sesión. Si no, queda `[DATO PENDIENTE]`. |
| B-6 | Enlace de la maqueta | «Pendiente» | Queda `[DATO PENDIENTE]` en la sección 7 y en I.6.6 (fase 6). R-03 no cierra del todo. | Nada por ahora; se registra como pendiente. |
| B-7 | Herramienta de la maqueta | «Html» | Se registra «HTML». Si la maqueta se generó con un asistente, corresponde declararlo como herramienta auxiliar (misma lógica que AD-24) [S]. | Confirmar si hubo asistente en su construcción. |

---

## 2. Correcciones propuestas en el acta

Todas en `01-relevamiento/validacion/20260925_GuiaValidacion_Sanchez_v2.md`. `<fecha>` = dato B-1.

| # | Línea | Texto actual | Corrección | Sostén |
|---|---|---|---|---|
| F1-01 | 7 | «**Versión:** v2 · 25 de septiembre de 2026. Reemplaza…» | Agregar al final: «Acta completada con los resultados de la sesión del <fecha>.» | Trazabilidad del documento |
| F1-02 | 17 | «Fecha y hora \| » | «<fecha>, 17:00» | [A] |
| F1-03 | 18 | «Canal \| » | «Presencial» | [A] |
| F1-04 | 19 | «Duración \| » | «35 minutos» | [A] |
| F1-05 | 45, 57, 75, 93, 107, 121, 135, 160, 174, 188, 208, 226, 240, 258 | «☐ Confirma ☐ Rechaza» (14 ocurrencias: E-01, E-02, L-01 a L-07, L-09 a L-13) | «☒ Confirma ☐ Rechaza» | [A] «aprobó todo» |
| F1-06 | 47, 59, 77, 95, 109, 123, 137, 162, 176, 190, 210, 228, 242, 260 | «Observaciones:» vacío | «Observaciones: sin observaciones.» | [A] |
| F1-07 | 91 (L-02) | «Respuesta:» vacío | «Respuesta: depende del caso; la referente no informa una proporción.» | [A] «Depende». Ver sección 3, O-2 |
| F1-08 | 206 (L-10) | «Respuesta:» vacío | «Respuesta: desde la línea de comandos.» | [A] «CLI» |
| F1-09 | 224 (L-11) | «Respuesta:» vacío | «Respuesta: Windows.» | [A]. Ver sección 3, O-1 |
| F1-10 | 270 a 277 (sección 2) | Columna «Observaciones» vacía | «Sin observaciones» en las ocho filas | [A]. La sección 2 no se somete a confirmación (línea 31): no se marca «Confirma» |
| F1-11 | 295 a 308, 314 a 318, 333 a 336 (sección 3) | «☐ \| ☐ \|  \|» | «☒ \| ☐ \| Sin observaciones \|» en los 23 requisitos | [A] |
| F1-12 | 324 a 326 (consulta RNF-07) | Respuesta vacía | Según B-2: las cifras, o «No informada en la sesión» en las tres filas | [A] / ADR-044 |
| F1-13 | 327 | «¿2 segundos…?» sin respuesta | «Sí» | [A] |
| F1-14 | 346 a 354, 360 a 370 (sección 4) | «☐ \| ☐ \|  \|» | «☒ \| ☐ \| Sin observaciones \|» en 9 entidades y 11 relaciones | [A] |
| F1-15 | 376 | «Respuesta:» vacío | «Respuesta: ninguna.» | [A] «nociones faltantes: no» |
| F1-16 | 386 a 398 (sección 5) | «☐ \| ☐ \|  \|» | «☒ \| ☐ \| Sin observaciones \|» en las 13 reglas | [A] |
| F1-17 | 408 a 414 (sección 6) | «☐ \| ☐ \|  \|» | «☒ \| ☐ \| Sin diferencia \|» en los 7 términos | [A], condicionado a B-4 |
| F1-18 | 424 | «[DATO PENDIENTE: herramienta…]» | «HTML» | [A], ver B-7 |
| F1-19 | 425 | «[DATO PENDIENTE: enlace…]» | Se conserva el marcador | [A] «Pendiente» (B-6) |
| F1-20 | 432 a 436 (sección 7) | «☐ \| ☐ \|  \|» | «☒ \| ☐ \| Sin observaciones \|» en las 5 pantallas | [A] |
| F1-21 | 443 | «Respuestas:» vacío | «Respuestas: sin observaciones. El recorrido responde las preguntas del equipo, no faltan pantallas y el orden es el que el equipo seguiría.» | [A], condicionado a B-3 |
| F1-22 | 451 a 456 (sección 8) | Columna «Respuesta» vacía | Comandos compuestos: «Depende del caso; sin proporción informada» · Interfaz: «Línea de comandos» · Sistemas: «Windows» · Tamaño: según B-2, más «2 s: aceptable» · Nociones: «Ninguna» · v0: «Sin observaciones» | [A] |
| F1-23 | 457 | Respuesta vacía | Según B-5; por defecto «[DATO PENDIENTE: respuesta al pedido (AD-17)]» | B-5 |
| F1-24 | 465 | «Puntos confirmados:» | «Todos: E-01 y E-02; L-01 a L-07 y L-09 a L-13; los 23 requisitos; las 9 entidades y las 11 relaciones; las 13 reglas; los 7 términos del vocabulario; las 5 pantallas del prototipo v0 (82 puntos).» | [A] |
| F1-25 | 467 | «Puntos rechazados o con observación:» | «Ninguno.» | [A] |
| F1-26 | 469 | «Observaciones generales:» | «Sin observaciones.» | [A] |
| F1-27 | 471 | «Constancia de conformidad…:» | «Pendiente de firma.» | Instrucción del autor. No se escribe «firmado» ni «conforme». |

Recuento de F1-24: 2 + 12 + 23 + 9 + 11 + 13 + 7 + 5 = 82 [R, conteo sobre la guía].

---

## 3. Observaciones de ingeniería (no se aplican en el acta; afectan fases posteriores)

**O-1 · Evidencia nueva sobre plataformas: el equipo de la referente usa Windows.**
- ADR-037 mantiene RNF-06 en Should con el argumento de que «el relevamiento no registra el sistema operativo de la población» [R]. Ahora hay un dato: el único equipo identificado programa en Windows [A]. No alcanza para hablar de la población (un equipo), pero debilita ese argumento.
- ADR-044 mide RNF-07 en la VM Ubuntu 26.04 (Q-A) [R]. El tiempo que el agente de la referente paga es el de Windows, que no se mide. En Windows, el arranque de procesos y el acceso a archivos suelen ser más lentos que en Linux [I]: acreditar 2 s en Ubuntu no garantiza 2 s en el equipo del único usuario real [S].
- Ninguna de las dos condiciones de invalidación de ADR-037 ni de ADR-044 se cumple literalmente. Por eso no reabro los ADR, pero **recomiendo** decidir antes de la fase 2 (RNF-06 y RNF-07) entre:
  - (a) no cambiar nada y registrar el dato en la ficha de RNF-06 como fundamento de la plataforma declarada;
  - (b) agregar a RNF-07 una medición informativa en Windows 11, sin umbral, dentro de la misma estabilización (ADR-044, sin horas nuevas);
  - (c) ADR de reemplazo parcial de ADR-044: equipo de referencia Windows 11 (Q-C).
  - Mi recomendación es **(b)**: no mueve horas ni la plataforma de referencia y deja el dato a la vista del tribunal. La invalida que la medición en Windows supere los 2 s: en ese caso corresponde (c).

**O-2 · «Depende» en comandos compuestos (L-02).** La referente confirmó el límite, pero no dimensionó la cantidad de consultas sin decisión. No bloquea nada. Es la pregunta probable de la defensa: «¿qué parte del uso real queda sin respuesta?». El dato no se inventa; queda como limitación declarada en III.4.

**O-3 · «Interfaz preferida: CLI».** Confirma ADR-042 (línea de comandos completa, interfaz web limitada) [R]. Es un argumento que conviene citar en V.1 y III.3 (fases 3 y 5): la priorización de la línea de comandos queda validada por la referente, además de fundada en la medición con agentes (ADR-041).

**O-4 · A-04 no cierra** si se confirma el caso (b) de B-2. En ese caso, RNF-07 pasa a P-A por la cláusula de ADR-044 y el criterio queda con el tamaño del escenario más grande del entorno controlado, que todavía no existe (U-01). La fase 2 dejaría `[DATO PENDIENTE]` en ese punto.

---

## 4. Estado y pendientes al aplicar esta fase

- `estado.md`, tabla del Instrumento 31: «Sesión: realizada el <fecha>, presencial, 35 min; aprobada sin observaciones; constancia de conformidad pendiente de firma».
- `pendientes.md`:
  - U-04: sigue abierto, con avance («sesión realizada; falta la constancia firmada o el correo en `01-relevamiento/validacion/`»).
  - R-03: avance (herramienta y validación registradas; falta el enlace).
  - A-04: según B-2.
  - Las demás claves (M-05, M-13, V-01, AD-01, AD-10 a AD-12, AD-21, AD-23, A-05) se cierran en las fases que las aplican, no en esta.
- No hay secciones de `informe/` en esta fase: ninguna vuelve a borrador.

---

## 5. Elección del autor

Respuestas del autor (28/09/2026):
- B-1: 26/09/2026. B-3: sin observaciones. B-4: sin observaciones. B-5: entrega confirmada, archivo no recibido. B-7: construida con asistentes.
- B-2: la referente no dispone de las cifras. El autor abre la alternativa de usar un proyecto público; queda en discusión (reemplazo parcial de ADR-044).
- O-1: opción (b), a desarrollar en el ADR que reemplace parcialmente a ADR-044.
- Autoriza escribir en `03-requisitos/libro/` para esta pasada.

## 6. Aplicación (28/09/2026)

Se aplican F1-01 a F1-27 con estos ajustes:
- F1-12: «No informada: la referente no dispone del dato en la sesión».
- F1-18: «HTML, construida con asistentes generativos ([DATO PENDIENTE: asistentes utilizados, función y artefacto afectado])».
- F1-23: «Entrega confirmada por la referente; archivo pendiente de recepción».

Control: 129 líneas modificadas; no quedan casillas «☐ | ☐» ni «☐ Confirma» sin marcar.
