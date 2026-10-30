# RNF-08

| Campo | Valor |
|---|---|
| ID | RNF-08 |
| Enunciado | Todo cambio incompatible del esquema de salida de la línea de comandos incrementa su versión mayor, de modo que un consumidor sabe cuándo debe adaptarse |
| Tipo | No funcional |
| Categoría (si es no funcional) | Mantenibilidad |
| Prioridad | Should |
| Motivo de la prioridad | Constituye la contrapartida de exponer una interfaz destinada a otro software. El compromiso se ejercita desde la iteración 3: la iteración 2 publicó la segunda versión del esquema (`esquema: 2`, incompatible con la del v1), y las respuestas que agrega la iteración 3 son compatibles con ella |
| Criterio de aceptación | CA-1: Publicada una nueva versión del esquema sin cambio de versión mayor, el 100 % de las salidas de referencia de la versión anterior continúa validando contra ella. CA-2: Ante un cambio incompatible, la versión mayor declarada en la salida presenta un incremento de al menos una unidad |
| Trazabilidad | HA-5; acta del 26/09/2026, decisión L-06; acta del 26/09/2026, E-01. Motivo de la prioridad precisado el 30/10/2026 (ADR-062, precisión de C5), pendiente de revalidación (R-13) |
| Estado de validación | Validado |
| Iteración prevista | 3 (condicionado a las horas) |
| ¿Integra el MVP? | No |

<!-- Migrado de Cap. III, Anexo I, A.I.1. «Categoría» de la Tabla 6; «Iteración prevista» de la Tabla 16 (Cap. V);
«¿Integra el MVP?» por la regla del III.5 (los requisitos Must constituyen el MVP del V.5). -->
