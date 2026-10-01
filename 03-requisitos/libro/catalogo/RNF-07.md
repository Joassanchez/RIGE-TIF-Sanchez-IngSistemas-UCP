# RNF-07

| Campo | Valor |
|---|---|
| ID | RNF-07 |
| Enunciado | Una consulta por línea de comandos finaliza en menos de 2 segundos sobre un proyecto del doble de tamaño que un proyecto real de referencia, en el equipo de referencia del proyecto |
| Tipo | No funcional |
| Categoría (si es no funcional) | Rendimiento |
| Prioridad | Should |
| Motivo de la prioridad | El uso por un agente externo, que invoca de manera repetida, vuelve relevante el tiempo de respuesta |
| Criterio de aceptación | CA-1: Sobre un proyecto sintético con el doble de agentes, entradas y elementos que el mayor entre el proyecto público de referencia (openchamber, commit `fc012ae`: 6 agentes, 9 comandos y 7 servidores LSP en 16 archivos de configuración; ADR-071) y el proyecto del equipo de la referente, si lo informa, en el contenedor Ubuntu 26.04 de referencia sobre Docker Desktop y WSL 2 [DATO PENDIENTE: resumen de la imagen y recursos, PV-01], la invocación completa por línea de comandos de la consulta de valores de un agente finaliza en menos de 2 s, medida sobre diez corridas y tomando el peor caso |
| Trazabilidad | HA-3; acta del 26/09/2026, sección 3.2; ADR-055; ADR-071 |
| Estado de validación | Validado |
| Iteración prevista | 4 (acreditación en la estabilización) |
| ¿Integra el MVP? | No |

<!-- Migrado de Cap. III, Anexo I, A.I.1. «Categoría» de la Tabla 9; «Iteración prevista» de la Tabla 18 (Cap. V);
«¿Integra el MVP?» por la regla del III.5 (los requisitos Must constituyen el MVP del V.5). -->
