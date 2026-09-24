# RNF-03

| Campo | Valor |
|---|---|
| ID | RNF-03 |
| Enunciado | El núcleo no depende del adaptador de OpenCode: los tipos de elemento, el orden de precedencia, la estrategia de fusión y la forma de evaluar permisos los declara el adaptador |
| Tipo | No funcional |
| Categoría (si es no funcional) | Mantenibilidad |
| Prioridad | Must |
| Motivo de la prioridad | Constituye la decisión arquitectónica que hace posible incorporar otras herramientas sin rehacer el sistema |
| Criterio de aceptación | El análisis estático de dependencias registra cero dependencias del núcleo hacia el adaptador, y ninguna identificación de la herramienta aparece en el código del núcleo |
| Trazabilidad | HA-4 |
| Estado de validación | [DATO PENDIENTE] |
| Iteración prevista | 1 |
| ¿Integra el MVP? | Sí |

<!-- Migrado de Cap. III, Anexo I, A.I.1. «Categoría» de la Tabla 9; «Iteración prevista» de la Tabla 18 (Cap. V);
«¿Integra el MVP?» por la regla del III.5 (los requisitos Must constituyen el MVP del V.5). -->
