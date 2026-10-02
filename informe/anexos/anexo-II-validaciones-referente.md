# ANEXO II · VALIDACIONES CON LA REFERENTE

## A.II.1 · Guía y acta de la sesión de validación de requisitos

La sesión de validación se realiza el 26/09/2026, en modalidad presencial y con una duración de 35 minutos, conforme al apartado X.1. Participan Valeria Areco, referente técnica de Electricidad de Misiones S. A. (EMSA), identificada en el apartado V.3, y Joaquín Sebastián Sánchez, autor del proyecto. Se aplica la «Guía y acta de la sesión de validación con la referente, RIGE», versión 2 del 25/09/2026 (Instrumento 31).

La tabla reúne las decisiones registradas en el acta, sintetizadas a partir del apartado III.4 y de la matriz de trazabilidad del Anexo I, A.I.2. Las precisiones posteriores de L-06 constan en esa matriz y en el acta.

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

El acta completa, con la constancia de conformidad firmada por la referente, consta en el Portafolio Digital de la AE2.

## A.II.2 · Validación del prototipo v0

La maqueta navegable de baja fidelidad comprende las pantallas del flujo relevado para la consulta del estado efectivo de la configuración, conforme al apartado I.6.6. La interfaz de línea de comandos no integra el prototipo v0.

| **N.º** | **Pantalla**                              | **Función que ilustra** |
|---------|-------------------------------------------|-------------------------|
| 1       | Selección del proyecto                    | F1                      |
| 2       | Resumen del ecosistema y de sus hallazgos | F5                      |
| 3       | Detalle de un agente                      | F2 y F3                 |
| 4       | Consulta de permiso                       | F4                      |
| 5       | Detalle de un hallazgo                    | F5 y F6                 |

*Tabla A.II.2. Pantallas del prototipo v0. Fuente: elaboración propia.*

La maqueta, con su versión en PDF, se encuentra en <https://drive.google.com/file/d/17jelVm2VFUr7spS7OKnvCGs8OIrD4aTI/view?usp=sharing>. Su validación consta en el acta de la sesión del 26/09/2026, sección 7, con conformidad de la referente (A.II.1).
