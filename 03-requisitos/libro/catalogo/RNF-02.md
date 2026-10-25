# RNF-02

| Campo | Valor |
|---|---|
| ID | RNF-02 |
| Enunciado | El valor efectivo y la decisión de permiso que informa RIGE coinciden con los de OpenCode 1.18.25 |
| Tipo | No funcional |
| Categoría (si es no funcional) | Fiabilidad |
| Prioridad | Must |
| Motivo de la prioridad | Mitiga el riesgo principal del proyecto: informar con precisión aparente un resultado erróneo agrava el problema. |
| Criterio de aceptación | CA-1: Sobre el conjunto de escenarios del entorno controlado, el valor efectivo por agente coincide con el comando nativo de resolución por agente en el 100 % de los casos. Los valores incorporados por sustitución se verifican por igualdad interna o por resumen, sin emitir su contenido. Su representación pública informa el origen y la condición de definido conforme a RNF-04. CA-2: Sobre el mismo conjunto, la decisión de permiso coincide con la de OpenCode 1.18.25 en el 100 % de los casos, con identificación correcta de la regla determinante. La normalización de rutas se contrasta con el binario ejecutado sobre cada escenario de RF-02, CA-9, o con su referencia regenerada al cierre de la iteración (Anexo III, D-34). |
| Trazabilidad | H-01, H-05, H-09, H-10, H-24 y HA-3. Validado (redacción del 26/09); precisión del 24/10 pendiente de revalidación (R-11) |
| Estado de validación | Validado |
| Iteración prevista | 3 |
| ¿Integra el MVP? | Sí |

<!-- Migrado de Cap. III, Anexo I, A.I.1. «Categoría» de la Tabla 6; «Iteración prevista» de la Tabla 16 (Cap. V);
«¿Integra el MVP?» por la regla del III.5 (los requisitos Must constituyen el MVP del V.5). -->
