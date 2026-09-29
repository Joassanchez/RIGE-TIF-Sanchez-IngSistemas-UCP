# RNF-08

| Campo | Valor |
|---|---|
| ID | RNF-08 |
| Enunciado | Todo cambio incompatible del esquema de salida de la línea de comandos incrementa su versión mayor, de modo que un consumidor sabe cuándo debe adaptarse |
| Tipo | No funcional |
| Categoría (si es no funcional) | Mantenibilidad |
| Prioridad | Should |
| Motivo de la prioridad | Constituye la contrapartida de exponer una interfaz destinada a otro software. El compromiso solo se ejercita cuando existe una segunda versión del esquema, que el período no prevé |
| Criterio de aceptación | CA-1: Publicada una nueva versión del esquema sin cambio de versión mayor, las salidas de referencia de la versión anterior continúan validando contra ella. CA-2: Ante un cambio incompatible, la versión mayor declarada en la salida se incrementa |
| Trazabilidad | HA-3; acta del 26/09/2026, decisión L-06 |
| Estado de validación | Validado |
| Iteración prevista | Sin asignar |
| ¿Integra el MVP? | No |

<!-- Migrado de Cap. III, Anexo I, A.I.1. «Categoría» de la Tabla 9; «Iteración prevista» de la Tabla 18 (Cap. V);
«¿Integra el MVP?» por la regla del III.5 (los requisitos Must constituyen el MVP del V.5). -->
