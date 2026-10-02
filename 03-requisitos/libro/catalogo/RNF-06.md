# RNF-06

| Campo | Valor |
|---|---|
| ID | RNF-06 |
| Enunciado | RIGE resuelve las rutas de configuración según el sistema operativo, opera sobre Ubuntu 26.04 y Windows 11 y se instala sin privilegios administrativos |
| Tipo | No funcional |
| Categoría (si es no funcional) | Portabilidad |
| Prioridad | Should |
| Motivo de la prioridad | Condiciona el descubrimiento de las entradas en cada plataforma. Según declara la referente, el equipo relevado programa en Windows, y las mediciones del proyecto se realizan en Ubuntu. Se prioriza como Should porque la verificación en ambas plataformas corre en cada integración sin horas propias, y la acreditación manual se realiza una sola vez, en la estabilización |
| Criterio de aceptación | CA-1: Sobre el mismo escenario ejecutado en Ubuntu 26.04 y en Windows 11, se verifica coincidencia en el 100 % de las entradas descubiertas y los valores efectivos, con las rutas comparadas en forma relativa a la raíz del escenario y con «/» como separador; las decisiones de permiso quedan fuera de esta comparación. CA-2: En los escenarios que ejercitan rutas, se verifica coincidencia en el 100 % de los valores con los de OpenCode 1.18.25 ejecutado en Windows 11. CA-3: La instalación, siguiendo el README.md, se completa con una cuenta sin privilegios administrativos en las dos plataformas |
| Trazabilidad | H-04, H-19 (pendiente de reproducción en Ubuntu); acta del 26/09/2026, decisión L-11 |
| Estado de validación | Validado |
| Iteración prevista | 4 (acreditación en la estabilización) |
| ¿Integra el MVP? | No |

<!-- Migrado de Cap. III, Anexo I, A.I.1. «Categoría» de la Tabla 6; «Iteración prevista» de la Tabla 15 (Cap. V);
«¿Integra el MVP?» por la regla del III.5 (los requisitos Must constituyen el MVP del V.5). -->
