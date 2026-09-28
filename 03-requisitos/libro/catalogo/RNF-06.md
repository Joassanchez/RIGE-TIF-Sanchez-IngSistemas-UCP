# RNF-06

| Campo | Valor |
|---|---|
| ID | RNF-06 |
| Enunciado | RIGE resuelve las rutas de configuración según el sistema operativo, opera sobre Ubuntu 26.04 y Windows 11 y se instala sin privilegios administrativos |
| Tipo | No funcional |
| Categoría (si es no funcional) | Portabilidad |
| Prioridad | Should |
| Motivo de la prioridad | Condiciona el descubrimiento de las entradas en cada plataforma. El equipo relevado programa en Windows, y las mediciones del proyecto se realizan en Ubuntu. Se prioriza como Should porque la verificación en ambas plataformas corre en cada integración sin horas propias, y la acreditación manual se realiza una sola vez, en la estabilización |
| Criterio de aceptación | Sobre el mismo escenario ejecutado en Ubuntu 26.04 y en Windows 11, el conjunto de entradas descubiertas y los valores efectivos coinciden, con las rutas comparadas en forma relativa a la raíz del escenario y con «/» como separador. En los escenarios que ejercitan rutas, los valores coinciden además con los de OpenCode 1.18.25 ejecutado en Windows 11. Las decisiones de permiso quedan fuera de esta comparación. La instalación, siguiendo el README.md, se completa con una cuenta sin privilegios administrativos en ambas plataformas |
| Trazabilidad | H-04, H-19; acta del 26/09/2026, decisión L-11 |
| Estado de validación | Validado |
| Iteración prevista | Sin asignar |
| ¿Integra el MVP? | No |

<!-- Migrado de Cap. III, Anexo I, A.I.1. «Categoría» de la Tabla 9; «Iteración prevista» de la Tabla 18 (Cap. V);
«¿Integra el MVP?» por la regla del III.5 (los requisitos Must constituyen el MVP del V.5). -->
