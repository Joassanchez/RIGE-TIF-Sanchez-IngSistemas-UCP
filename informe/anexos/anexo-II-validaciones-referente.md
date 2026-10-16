# ANEXO II · VALIDACIONES CON LA REFERENTE

## A.II.1 · Guía y acta de la sesión de validación de requisitos

La sesión de validación se realiza el 26/09/2026, en modalidad presencial y con una duración de 35 minutos, conforme al apartado X.1. Participan Valeria Areco, referente técnica de Electricidad de Misiones S. A. (EMSA), identificada en el apartado V.3, y Joaquín Sebastián Sánchez, autor del proyecto. Se aplica la «Guía y acta de la sesión de validación con la referente, RIGE», versión 2 del 25/09/2026 (Instrumento 31).

La tabla reúne las decisiones registradas en el acta, sintetizadas a partir del apartado III.4 y de la matriz de trazabilidad del Anexo I, A.I.2. Las precisiones posteriores de L-06 constan en esa matriz y se validan en la segunda extensión del acta, del 15/10/2026.

| **Decisión** | **Enunciado breve** |
|---|---|
| L-01 | RIGE opera en modo de solo lectura y escribe únicamente en su propio almacén |
| L-02 | Los comandos de terminal compuestos quedan fuera del alcance |
| L-03 | Las credenciales de autenticación quedan fuera del alcance |
| L-04 | El uso es individual y local |
| L-05 | El alcance se circunscribe a OpenCode 1.18.25 |
| L-06 | La línea de comandos expone valores efectivos, decisiones de permiso y hallazgos, con salida conforme a un esquema versionado y explicación a pedido |
| L-07 | RIGE informa el estado efectivo; la aplicación y validación de los cambios del agente quedan fuera del alcance |
| L-08 | Se adopta el vocabulario del proyecto para el informe y la interfaz |
| L-09 | La comparación entre estados resueltos y la validación completa contra el esquema de configuración quedan fuera del alcance |
| L-10 | Dos interfaces sobre el mismo núcleo; la línea de comandos es completa y la interfaz web local se limita a formularios y vistas de consulta |
| L-11 | El sistema opera sobre Ubuntu 26.04 y Windows 11 y se instala sin privilegios administrativos |
| L-12 | Las relaciones entre elementos se difieren como capacidad posterior |
| L-13 | La explicación se genera mediante plantillas deterministas |
| E-01 | El agente de programación es un sistema vecino que consume una salida estructurada, determinista y legible por máquina, con ruta y posición exactas, esquema versionado y códigos de salida que distinguen el error de la ausencia de resultado |
| E-02 | Cada resultado declara sobre qué estado de las entradas se obtiene, identificado por un resumen del conjunto leído |

*Tabla A.II.1. Decisiones registradas en el acta de la sesión de validación del 26/09/2026. Fuente: elaboración propia sobre el apartado III.4 y la matriz del Anexo I, A.I.2.*

El acta de la sesión presencial del 26/09/2026 registra 82 puntos confirmados por la referente mediante la lectura y el tratamiento de los puntos de la guía con el autor, incluidos veinte de los veintisiete requisitos actuales y once relaciones del dominio; carece de firma propia. La extensión del acta del 01/10/2026 corresponde a una conversación presencial sin registro escrito en la fecha, sobre el catálogo de ese día, y cubre RF-12, RF-14 y RNF-04 reformulados, RF-16, RF-17, RNF-09 y RNF-10 nuevos, la relación por la que una declaración origina reglas de permiso y las multiplicidades corregidas. La constancia firmada por la referente en forma presencial el 15/10/2026 respalda esta extensión y reúne las entrevistas del 29/08 y del 24/09/2026. La segunda extensión del acta, del 15/10/2026 y de modalidad presencial, cubre once cambios posteriores: L-06; RF-02 CA-8; RF-02 CA-3 y RD-05; RF-02 CA-9; RF-07; RNF-07; la relación entre resolución y elemento; Regla de permiso como entidad y término del vocabulario; RE-01; RE-03; y RR-02. La referente confirma los once cambios sin correcciones, y la constancia v2 firmada ese día ratifica además la primera extensión. El acta, las extensiones y las constancias constan en el repositorio y en el Portafolio Digital de la AE2.

## A.II.2 · Validación del prototipo v0

El prototipo v0 es una maqueta navegable de baja fidelidad de nueve pantallas, presentada a la referente el 29/08/2026 con su conformidad, conforme al apartado I.6.6 y al punto 1.6 de la constancia de entrevistas. A partir del pedido de la referente en la entrevista del 24/09/2026, la maqueta reformulada simplifica la interfaz gráfica a cinco pantallas e incorpora la línea de comandos pensada para que la use un agente (constancia, punto 2.8). Esta maqueta se valida en la sesión del 26/09/2026 y representa el flujo relevado para la consulta del estado efectivo de la configuración.

| **N.º** | **Pantalla**                              | **Función que ilustra** |
|---------|-------------------------------------------|-------------------------|
| 1       | Selección del proyecto                    | F1                      |
| 2       | Resumen del ecosistema y de sus hallazgos | F5                      |
| 3       | Detalle de un agente                      | F2 y F3                 |
| 4       | Consulta de permiso                       | F4                      |
| 5       | Detalle de un hallazgo                    | F5 y F6                 |

*Tabla A.II.2. Pantallas de la maqueta reformulada validada el 26/09/2026. Fuente: elaboración propia.*

La maqueta reformulada, con su versión en PDF, se encuentra en <https://drive.google.com/file/d/1kz3OvG5lBim2Yb0Wyem856Li3syry-Px/view?usp=sharing>. Su validación consta en el acta de la sesión del 26/09/2026, sección 7, y en la constancia firmada por la referente el 15/10/2026, punto 2.8 (A.II.1).
