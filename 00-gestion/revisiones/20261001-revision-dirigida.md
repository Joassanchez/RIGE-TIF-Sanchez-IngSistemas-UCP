# Revisión dirigida de los Caps. III, IV, V y X · 01/10/2026 (RG-01)

Tres pasadas de Codex (`gpt-6.1-sol`, esfuerzo medio, solo lectura) en paralelo: (1) consistencia mecánica, (2) verificación de fuentes con búsqueda web y (3) contraste con la consigna (`.claude/agents/revisor-consigna.md`). El ingeniero deduplicó los hallazgos y contrastó con el repositorio los B e I; los marcados *(web)* los verificó solo la pasada 2.

**Alcance:** `informe/cap-03/`, `cap-04/`, `cap-05/` y `cap-10/`; Anexo I (Cap. III), Anexo V y Anexo VI; A.I.4 y A.I.10 del Anexo I del AE1; `informe/bibliografia.md`; Instrumento 34; `01-relevamiento/fuentes.md`; `03-requisitos/libro/`. Quedan fuera los Caps. I y II y el resto del Anexo I del AE1 (`00-gestion/ventana-ae1.md`).

## Lista consolidada

| # | Sev. | Hallazgo | Decisión del autor | Resultado |
|---|---|---|---|---|
| 1 | B | X.5:11-13: encabezado «Verificación de coherencia antes de cerrar el capítulo» y «No corresponde ajuste», una nota de proceso en el cuerpo (marcador residual, observación del AE1) | Corregir | Ficha 20261001-rg01, C-1 |
| 2 | I | RF-07 CA-2 exige «entrada, archivo y línea»; el CA-1 siembra `OPENCODE_PERMISSION`, que no tiene archivo | Corregir | C-2 (libro y Anexo I) |
| 3 | I | IV.3:39, 72 %: el Anexo VI cuenta en C-2 la 28658 (instrucciones) y la 30415 (MCP, RF-14 Could), que están fuera del compromiso Must | Corregir | C-3 y D-1: 21/32 (66 %); precedencia y fusión 10; concentración 20/32 (63 %) |
| 4 | I | IV.3:17, «a lo sumo alcance o capa»: Claude Code Config Manager navega hasta la línea JSON *(web)* | Corregir | C-4 |
| 5 | I | IV.1:9 presenta la facturación como requisito general de la Ley 27.506; el art. 4 actualizado admite personas jurídicas sin facturación previa *(web)* | Corregir | C-5 |
| 6 | I | III.5:5 dice trece requisitos trazados al acta; son 18 con la extensión | Corregir | C-6 |
| 7 | I | III.4: las ocho exclusiones técnicas no tienen validador ni constancia (criterio iii) | Corregir | C-7 y D-2: autor como validador, acta §2 (para conocimiento, sin observaciones); introducción con dos clases de exclusión |
| 8 | I | `fuentes.md`: OPSSI y los precios de Anthropic siguen figurando como citados en el Cap. X y el Instrumento 34; «Citada en» desalineada en las filas 74 a 78 | Corregir | Ingeniero, en `fuentes.md` |
| 9 | I | Cinco fuentes de X.4 (OpenCode paquete, TypeScript, Bun, SQLite, WSL) sin cita ni entrada en la bibliografía | Corregir | C-8 y D-4 (Microsoft s. f.-a, -b y -c) |
| 10 | I | Tres preguntas pendientes y fuentes «sin verificar» citadas en el alcance | Corregir | Ingeniero: 43 filas actualizadas (38 verificadas, 2 con discrepancia ya corregida en el texto, 3 no verificables) |
| 11 | M | V.5:20-21, RF-10 y RF-11 «Sin asignar» | Corregir | C-9 |
| 12 | M | `entidades.md`: multiplicidad Declaración–Elemento, rayas y atribución Larman/Evans | Corregir | C-10 |
| 13 | M | «Entrada descartada en silencio» (glosario, Anexo V) frente a «sin error visible» (RF-07, III.5) | Corregir | C-11 |
| 14 | M | Bibliografía: Ley 27.506 duplicada, orden, Anthropic 2026c, título de Microsoft, Winning, Cursor, OpenCode, ISO/IEC | Corregir | C-12 y D-3; filas de `fuentes.md` alineadas y Ley 27.506 unificada |
| 15 | M | Ries (2017): no se confirma la edición Deusto 2017 *(web)* | Pendiente del autor (portada legal del ejemplar) | Sin cambios |
| 16 | M | ADR internos citados en el cuerpo: III.5:47, Anexo I (unas 14 ubicaciones), Anexo V (5), Instrumento 34 (unas 15) | Espera el alta de D-61 a D-65 en el Anexo III (ADR-058, 060, 061, 067, 074) | Sin cambios |

**Dependen de datos que todavía no existen:** marcadores de V.5 (U-01), `[DATO PENDIENTE]` de RNF-07 (PV-01), mediana junior de SysArmy (U-02; tampoco confirmable por la web).

**Descartados o para decidir aparte:**

- Contingencia aplicada sobre 136 h y no sobre 190 h (pasada 3): la decidió ADR-052, eje 4. Riesgo de pregunta del tribunal sobre las 54 h de reserva; si el autor lo pide, se analiza en un ADR.
- Exceso de 7 h en la iteración 1 (pasada 3): V.4 ya lo resuelve con el criterio de corte.

## Arrastres

- `informe/bibliografia.md:81`: la Ley N.º 25.326 conserva `[VERIFICAR fecha de publicación]` (cita del AE1; el repositorio no tiene la fecha).
- `00-gestion/decisiones/ADR-027-*.md` conserva el 72 % como evidencia de su fecha; el valor vigente es el de IV.3.
- Tabla 12: la suma de las proporciones redondeadas da 99 %.

## Consumo

| Corrida | Tiempo | Entrada (cacheada) | Salida (razonamiento) |
|---|---|---|---|
| Pasada 1 · Consistencia | 8 min 07 s | 3.041.454 (2.865.792) | 13.236 (2.526) |
| Pasada 2 · Fuentes con web | 9 min 02 s | 2.672.948 (2.457.984) | 13.949 (1.983) |
| Pasada 3 · Consigna | 4 min 01 s | 1.471.267 (1.305.984) | 6.052 (1.318) |
| Redactor · ficha rg01 | 6 min 15 s | 1.093.369 (965.120) | 10.760 (1.016) |
| Redactor · desvíos (misma sesión) | 1 min 30 s | 1.556.618 (1.305.856) | 13.122 (1.198) |

Cuota del plan Plus: las tres pasadas en paralelo llevaron la ventana de 5 h del 51 % al 70 % y la semanal del 41 % al 44 %. El redactor, del 71 % al 77 % y del 44 % al 45 %.
