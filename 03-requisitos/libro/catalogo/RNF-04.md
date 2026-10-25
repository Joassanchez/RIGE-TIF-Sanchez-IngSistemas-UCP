# RNF-04

| Campo | Valor |
|---|---|
| ID | RNF-04 |
| Enunciado | RIGE excluye de sus salidas y de su almacén el contenido incorporado a una declaración mediante sustitución. Su representación pública informa el origen (nombre de la variable de entorno o ruta del archivo) y la condición de definido o no definido. |
| Tipo | No funcional |
| Categoría (si es no funcional) | Seguridad |
| Prioridad | Must |
| Motivo de la prioridad | Las variables de entorno suelen contener credenciales |
| Criterio de aceptación | CA-1: Definida una variable con un valor conocido y referenciada por una sustitución en una declaración, la búsqueda textual registra cero apariciones de ese valor en las salidas del sistema (interfaz, línea de comandos, diagnóstico y almacén propio). CA-2: La misma condición se cumple para el contenido de un archivo incorporado por sustitución y para una sustitución contenida en una variable de entorno que constituye una entrada de configuración. CA-3: Para el 100 % de las sustituciones, la representación pública del valor sustituido informa exclusivamente su origen y su condición de definido o no definido. La coincidencia con OpenCode se verifica por igualdad interna o por resumen, con el contenido excluido de las salidas de la verificación. |
| Trazabilidad | Acta del 26/09/2026, decisión L-03; extensión del acta del 01/10/2026 (constancia firmada el 15/10/2026). Validado (redacción del 01/10); precisión del 24/10 pendiente de revalidación (R-11) |
| Estado de validación | Validado |
| Iteración prevista | 3 |
| ¿Integra el MVP? | Sí |

<!-- Migrado de Cap. III, Anexo I, A.I.1. «Categoría» de la Tabla 6; «Iteración prevista» de la Tabla 16 (Cap. V);
«¿Integra el MVP?» por la regla del III.5 (los requisitos Must constituyen el MVP del V.5). -->
