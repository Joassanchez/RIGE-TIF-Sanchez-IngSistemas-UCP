# RNF-07

| Campo | Valor |
|---|---|
| ID | RNF-07 |
| Enunciado | Una consulta por línea de comandos finaliza en menos de 2 segundos sobre un proyecto del doble de tamaño que un proyecto real de referencia, en el equipo de referencia del proyecto |
| Tipo | No funcional |
| Categoría (si es no funcional) | Rendimiento |
| Prioridad | Should |
| Motivo de la prioridad | El uso por un agente externo, que invoca de manera repetida, vuelve relevante el tiempo de respuesta. Los 2 s se toman del tiempo de la alternativa que hoy usa el agente, el comando nativo `opencode debug agent build`. La medición del autor del 15/10/2026 comprende diez corridas de la invocación completa en el contenedor de referencia sobre un proyecto de tres archivos. Arroja una mediana de 1,18 s y un peor caso de 1,27 s (Anexo III, D-28; ADR-055). El comando nativo se vuelve a medir sobre el proyecto de referencia del CA-1; si supera los 2 s, el umbral se revisa con la referente. |
| Criterio de aceptación | CA-1: Se usa un proyecto sintético con el doble de agentes, entradas y elementos que el mayor entre el proyecto público de referencia y el del equipo de la referente, si lo informa (Anexo III, D-29). El proyecto público es openchamber, commit `fc012ae`: 6 agentes, 9 comandos y 7 servidores LSP en 16 archivos de configuración (Anexo III, D-57). Se usa el contenedor Ubuntu 26.04 de referencia sobre Docker Desktop y WSL 2. La imagen base `ubuntu:26.04` se fija por su resumen `sha256:da6fc2be547864451aa253836dd926da33623312df4a9a243e35dc877c378a78` y corresponde a Ubuntu 26.04.1 LTS. La máquina virtual de Docker tiene asignados 12 procesadores lógicos y 8 GB de memoria. Se miden las consultas de valores de un agente y de decisión de permiso para un agente y una acción. Para cada consulta se ejecutan diez corridas de la invocación completa por línea de comandos y se toma el peor caso, que finaliza en menos de 2 s. |
| Trazabilidad | HA-5; acta del 26/09/2026, sección 3.2; medición del comando nativo del 15/10/2026; segunda extensión del acta del 15/10/2026. Validado (redacción del 26/09 y segunda extensión del 15/10); precisión del 16/10 pendiente de revalidación (R-04); precisión del 24/10 pendiente de revalidación (R-11) |
| Estado de validación | Validado |
| Iteración prevista | 4 (acreditación en la estabilización) |
| ¿Integra el MVP? | No |

<!-- Migrado de Cap. III, Anexo I, A.I.1. «Categoría» de la Tabla 6; «Iteración prevista» de la Tabla 16 (Cap. V);
«¿Integra el MVP?» por la regla del III.5 (los requisitos Must constituyen el MVP del V.5). -->
