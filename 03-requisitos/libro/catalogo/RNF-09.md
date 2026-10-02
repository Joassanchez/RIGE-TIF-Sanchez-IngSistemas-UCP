# RNF-09

| Campo | Valor |
|---|---|
| ID | RNF-09 |
| Enunciado | La interfaz web local atiende únicamente solicitudes dirigidas a la dirección local del equipo y no permite que otro origen lea sus respuestas |
| Tipo | No funcional |
| Categoría (si es no funcional) | Seguridad |
| Prioridad | Must |
| Motivo de la prioridad | La escucha en la dirección local no impide que una página abierta en el navegador dirija solicitudes al puerto y lea sus respuestas, que contienen rutas, permisos y nombres de variables. Sin este control se burla la frontera declarada en el apartado I.6.4 del informe de la AE1 |
| Criterio de aceptación | CA-1: Una solicitud con cabecera Host distinta de 127.0.0.1:<puerto> o localhost:<puerto> se rechaza con cero datos devueltos. CA-2: Una solicitud con método distinto de GET se rechaza, con cero solicitudes aceptadas bajo esa condición. CA-3: El conteo de cabeceras que habilitan el acceso desde otro origen es cero en todas las respuestas |
| Trazabilidad | AE1, I.6.4; acta del 26/09/2026, decisión L-04; acta de validación, extensión |
| Estado de validación | Validado |
| Iteración prevista | 1 |
| ¿Integra el MVP? | Sí |

<!-- Alta (Anexo III, D-52) (29/09/2026). -->
