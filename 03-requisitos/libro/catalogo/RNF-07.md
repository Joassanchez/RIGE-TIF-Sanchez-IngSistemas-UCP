# RNF-07

| Campo | Valor |
|---|---|
| ID | RNF-07 |
| Enunciado | Una consulta por línea de comandos finaliza en menos de 2 segundos sobre un proyecto del doble de tamaño que un proyecto real de referencia, en el equipo de referencia del proyecto |
| Tipo | No funcional |
| Categoría (si es no funcional) | Rendimiento |
| Prioridad | Should |
| Motivo de la prioridad | El agente externo invoca RIGE de manera repetida. Se prioriza como Should porque una consulta correcta conserva su utilidad aun si tarda más del umbral; la fidelidad y la seguridad tienen precedencia. Los 2 s son un valor aceptado por la referente y contrastado después con el comando nativo, con margen como decisión (Anexo III, D-28; ADR-055). El autor mide diez invocaciones completas del comando nativo en el contenedor, sobre tres archivos, el 15/10/2026: mediana de 1,18 s y peor caso de 1,27 segundos. El ingeniero repite la medición sobre `openchamber-doble`, sin red, el 04/11/2026: una de 80 corridas supera 2 s, con 2071 ms. En esa fecha mide RIGE sobre el mismo proyecto: diez corridas por consulta, con peor caso de 147,82 ms. Ambas mediciones carecen de control de la carga del anfitrión y describen esas sesiones (Anexo I, A.I.11). La propuesta de conservar los 2 s queda pendiente de revisión con la referente (R-15). |
| Criterio de aceptación | CA-1: Se usa un proyecto sintético con el doble de agentes, entradas y elementos que el proyecto público de referencia. La referente no informa el tamaño de su proyecto. La referencia queda limitada al proyecto público (Anexo III, D-29). El proyecto público es openchamber, commit `fc012ae`: 6 agentes, 9 comandos y 7 servidores LSP en 16 archivos de configuración (Anexo III, D-57). Se usa el contenedor Ubuntu 26.04 de referencia sobre Docker Desktop y WSL 2. La imagen base `ubuntu:26.04` se fija por su resumen `sha256:da6fc2be547864451aa253836dd926da33623312df4a9a243e35dc877c378a78` y corresponde a Ubuntu 26.04.1 LTS. La máquina virtual de Docker tiene asignados 12 procesadores lógicos y 8 GB de memoria. Se miden las consultas de valores de un agente y de decisión de permiso para un agente y una acción. Para cada consulta se ejecutan diez corridas de la invocación completa por línea de comandos y se toma el peor caso, que finaliza en menos de 2 segundos. Se cronometra desde el lanzamiento del subproceso hasta su finalización, incluidos el lanzador de Bun y la emisión de la salida. El almacén empieza vacío en cada serie; las corridas siguientes conservan el estado que genera esa serie. La red permanece deshabilitada y la carga del anfitrión queda sin controlar. Cada corrida exige código 0 y salida válida. Las consultas `hallazgos` y la opción `--explicar` quedan fuera de la medición. Las diez corridas por consulta delimitan lo observado en esa sesión. |
| Trazabilidad | HA-5; acta del 26/09/2026, sección 3.2; medición del comando nativo del 15/10/2026; segunda extensión del acta del 15/10/2026. Redacción validada el 26/09/2026 y precisiones confirmadas el 15/10/2026; precisión del 16/10/2026 pendiente de revalidación (R-04); precisión del 24/10/2026 pendiente de revalidación (R-11); mediciones del 04/11/2026 pendientes de revisión del umbral con la referente (R-15) |
| Estado de validación | Pendiente |
| Iteración prevista | 4 (acreditación en la estabilización) |
| ¿Integra el MVP? | No |

<!-- Migrado de Cap. III, Anexo III, A.III.6. «Categoría» de la Tabla 6; «Iteración prevista» de la Tabla 16 (Cap. V);
«¿Integra el MVP?» por la regla del III.5 (los requisitos Must constituyen el MVP del V.5). -->
