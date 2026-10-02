# RNF-04

| Campo | Valor |
|---|---|
| ID | RNF-04 |
| Enunciado | RIGE nunca expone el contenido que una sustitución incorpora a una declaración; informa su origen (el nombre de la variable de entorno o la ruta del archivo) y su condición de definido o no definido |
| Tipo | No funcional |
| Categoría (si es no funcional) | Seguridad |
| Prioridad | Must |
| Motivo de la prioridad | Las variables de entorno suelen contener credenciales |
| Criterio de aceptación | CA-1: Definida una variable con un valor conocido y referenciada por una sustitución en una declaración, la búsqueda textual registra cero apariciones de ese valor en las salidas del sistema (interfaz, línea de comandos, diagnóstico y almacén propio). CA-2: La misma condición se cumple para el contenido de un archivo incorporado por sustitución y para una sustitución contenida en una variable de entorno que constituye una entrada de configuración. CA-3: Para el 100 % de las sustituciones, el sistema informa su origen y su condición de definido o no definido |
| Trazabilidad | Acta del 26/09/2026, decisión L-03; acta de validación, extensión |
| Estado de validación | Validado |
| Iteración prevista | 3 |
| ¿Integra el MVP? | Sí |

<!-- Migrado de Cap. III, Anexo I, A.I.1. «Categoría» de la Tabla 6; «Iteración prevista» de la Tabla 15 (Cap. V);
«¿Integra el MVP?» por la regla del III.5 (los requisitos Must constituyen el MVP del V.5). -->
