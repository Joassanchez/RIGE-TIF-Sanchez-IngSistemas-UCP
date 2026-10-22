# Adjudicación vigente de la línea base, P3 y la sonda R (14/10/2026)

**Reemplaza** las adjudicaciones del ingeniero de `../20261014-analisis-LB/` (que se conservan como registro) conforme a ADR-087 (alternativa J-D y enmienda del eje E).

## Procedimiento

1. **Criterio** (ADR-087, enmienda del 14/10/2026, decidida después de conocer los datos y en contra de la hipótesis del proyecto): la fuente se exige en el nivel que pide la pregunta. En las preguntas de «qué regla» (C-3b, C-3d, C-3f, C-4a a C-4d) basta la regla determinante correcta, salvo que se la ubique en un lugar rechazado por la hoja. Una decisión de permiso escrita con otras palabras se acepta si su significado es inequívoco.
2. **Preclasificación ciega:** tres subagentes de Claude, uno por planilla, sin acceso a la clave, a las adjudicaciones previas, a `verificacion/` ni a la identidad del ejecutor (planillas en `.trabajo/linea-base/adjudicacion-v3/`, `adjudicacion-sonda-R/` y `adjudicacion-p3/`).
3. **Aceptación:** el autor aceptó las tres preclasificaciones el 14/10/2026, sin cambios. Rige esta adjudicación. Se declara la asistencia de un modelo de lenguaje y que el autor no es independiente del resultado (ADR-087, amenaza).
4. **Primera preclasificación:** una ronda anterior, con indicaciones distintas sobre C-3b y C-3d, se descartó antes de la firma. Se conserva en `.trabajo/linea-base/*-clave/preclasificacion-v1.csv`.

*Errata del 22/10/2026 (ingeniero, Claude Code, Opus 5.5):* la carpeta de trabajo `.trabajo/linea-base/`, fuera de git, se eliminó el 22/10/2026 durante la limpieza del repositorio. Con ella se perdieron las planillas de la preclasificación ciega (paso 2) y la ronda descartada (paso 4). No hay copia. La adjudicación firmada se conserva en los `.csv` de esta carpeta, y sus análisis en `analisis-LB/`, `analisis-p3/` y `analisis-R/`. Los kappa de la sección «Concordancia» se calcularon con esas planillas y ya no se pueden recomputar; el informe no los publica desde el 22/10/2026.

## Archivos

- `adjudicaciones-LB-principal-sol.csv`, `adjudicaciones-LB-charles-sol.csv` (61 revisiones manuales de la línea base).
- `adjudicaciones-LB-p3-luna.csv` (45 de P3).
- `adjudicaciones-sonda-R-principal.csv`, `adjudicaciones-sonda-R-charles.csv` (6 de la sonda R).
- `analisis-LB/`, `analisis-p3/`, `analisis-R/`: salida de `analizar.py`.

## Resultado (atribución)

| Tanda | Correctas | Errores C-2 a C-4 | Casos con problema | Rama (ADR-079) | IV.3 |
|---|---|---|---|---|---|
| `build` + `gpt-6.1-sol` | 72/72 | 0/54 | 0 | **N** | Refuta |
| Charles + `gpt-6.1-sol` | 70/72 | 2/54 (C-4e) | 0 | **P** | Confirma |
| P3 · `build` + `gpt-5.6-luna` | 70/72 | 2/54 (C-2b incorrecta, C-4e) | 0 | **N** | Confirma |

*Errata del 22/10/2026 (ingeniero, Claude Code, Opus 5.5):* en la fila de Charles, «Casos con problema» es **1** (C-4e, dos errores de tres), no 0. Así lo cuenta `analisis-LB/informe.md` (conjunto C-4, «Casos con problema» = 1), y es coherente con la rama P. Se conserva el valor original de la tabla. El Anexo VI (Tabla A.VI.4) y el apartado IV.3 ya informan el valor correcto.

- **Sonda R:** 12 de 12 correctas; lectura fijada de ADR-089: la falla original de C-3b y C-3d (con el criterio estricto) es **dependiente de la redacción**.
- **Sensibilidad con el criterio estricto (E-A, anterior):** `build` P (C-3b), Charles P (C-3b, C-3d, C-4e), P3 E (6 casos: C-3b, C-3d, C-4a a C-4d).
- **ADR-079, rama N:** no se activan la condición 4 de ADR-078 ni la 1 de ADR-053, porque el segundo ejecutor no cae en N (ADR-079, §3; ADR-087, N-A). El cumplimiento se rige por ADR-084.

## Concordancia (kappa de Cohen sobre las 61 de la línea base; 45 de P3)

| Comparación | Acuerdo | Kappa |
|---|---|---|
| Ingeniero (criterio estricto) frente a la adjudicación vigente | 0,80 | 0,20 |
| Primera preclasificación frente a la vigente | 0,97 | 0,65 |
| P3: primera preclasificación (estricto) frente a la vigente | 0,67 | 0,08 |

Los acuerdos bajos comparan **criterios distintos** (estricto frente a enmendado), no ruido del juicio: miden cuánto pesa el criterio. No hay dos adjudicaciones independientes con el mismo criterio; se declara.
