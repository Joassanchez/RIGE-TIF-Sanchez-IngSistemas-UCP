## IV.3 · Análisis de rivalidad amplificada

Las cinco fuerzas competitivas (Porter, 1980; apartado II.5.6) establecen con qué compite la solución. Cada fuerza se deriva de uno o más bloques del lienzo de la Tabla 7, indicados junto a ella, y declara qué decisión del proyecto cambia por su causa.

| **Fuerza (deriva de: bloque del lienzo)** | **Situación relevada y evidencia** | **Implicancia decisoria** |
|---|---|---|
| **Rivalidad entre competidores actuales** (propuesta de valor) | Sobre OpenCode operan `debug config`, `debug agent` (OpenCode, 2026), OCCM (icysaintdx, 2026), CC Switch (JasonYoung, 2026) y agnix (agent-sh, 2026). Son gratuitas y requieren reconstrucción manual; ninguna evalúa decisiones con procedencia por declaración | RF-02, RF-06 y RF-09 conservan prioridad Must por su explicación. El comando nativo por agente es el oráculo de RNF-02 |
| **Competidores potenciales** (recursos clave) | Amp evalúa acciones e informa regla y alcance (Amp, s. f.). Codex evalúa comandos de shell y expone configuración efectiva con origen por capa (OpenAI, 2026). Ninguno informa archivo y posición. Winning (2026) señala demanda; el conocimiento y los escenarios bajo MIT permiten la entrada | El diferencial combina ambos ejes del apartado IV.4; RF-02 incorpora el CA-8 (Anexo III, D-59). RNF-03 permite reorientar la plataforma; el aporte a OpenCode queda como salida (apartado IV.1) |
| **Sustitutos** (segmentos y propuesta de valor) | Procedimiento manual con comandos nativos; consulta a un agente de permisos elevados; agente interno que crea y configura agentes (A.VI.5); y sincronizadores de fuente única (dyoshikawa, 2026; JasonYoung, 2026), equivalentes a la planilla mantenida a mano de la guía de la AE2 (§5.2), que generan configuración sin verificar el estado cargado, implícitos ni reglas nativas | RF-03 conserva prioridad Must por la lectura directa sin tokens: delegar no equivale a verificar (apartado II.6.3). RIGE informa el estado efectivo en modo de solo lectura |
| **Poder de negociación de proveedores** (socios clave y estructura de costos) | OpenCode define el esquema y lo modifica con frecuencia: el conteo propio de los metadatos y la clasificación de las notas publicados por su equipo entre el 01/01 y el 30/09/2026 registran 227 versiones estables, 43 de ellas con cambios declarados de configuración, permisos o agentes (anomalyco, s. f.-c; anomalyco, s. f.-d). La incidencia n.º 46873 reporta un comportamiento de permisos en 1.18.26 (ZhukovLabs, 2026), cuya versión de introducción no está confirmada (Anexo VI, A.VI.6). También aporta el evaluador de permisos reutilizado bajo MIT | Sostiene la versión congelada y la advertencia de RF-05. El código reutilizado conserva la licencia de 1.18.25; las de construcción constan en el Capítulo X |
| **Poder de negociación de clientes** (segmentos, canales y relaciones) | El desarrollador elige y configura su herramienta (A.VI.5), con costo de cambio nulo y alternativas gratuitas. El agente consumidor utiliza la salida sin juzgarla | La adopción exige instalación sin privilegios ni cuenta y sin configuración propia de RIGE; la coincidencia de decisor y usuario confirma L-04. El agente consumidor exige salida determinista con esquema estable (RF-03 y RNF-08) |

*Tabla 8. Análisis de rivalidad amplificada, con el bloque del lienzo del que deriva cada fuerza y su implicancia decisoria. Fuente: elaboración propia sobre Porter (1980) y el relevamiento.*

El sustituto que hoy funciona constituye el competidor más serio: es gratuito, el desarrollador ya lo domina y no requiere instalación. La razón por la cual RIGE resulta preferible no reside en la comodidad sino en la exactitud: el procedimiento manual responde con la tasa de error que registre la línea de base, la consulta al agente responde sin garantía de corrección, y RIGE responde con el origen a la vista y con un resultado verificado contra la propia herramienta.

### Flujo de valor seleccionado para automatización

Se selecciona la consulta del estado efectivo de un agente en sus dos formas: el valor con su procedencia y la decisión de permiso con su regla determinante (RF-01 y RF-02). Es el mismo caso de uso que atraviesa el prototipo v1. La selección se justifica por dónde se concentra el problema, qué proporción de él absorbe la automatización y qué queda sin resolver.

**Concentración del problema.** La línea de base no concluye antes de la entrega; la evidencia es la clasificación propia por título y por un único codificador de las 32 incidencias incluidas del repositorio de OpenCode en el relevamiento del 17/09/2026 (Tabla 9; Anexo VI, A.VI.6). Veinte de las 32 (63 %) son precedencia y fusión o permisos, con igual volumen. Los permisos se distinguen por la gravedad de los casos n.º 37155 y n.º 48751 (apartado I.3.1). El único caso de valor implícito no acredita ausencia del fenómeno, como interpretación del autor.

| **Mecanismo**                   | **Incidencias** | **Proporción** |
|---------------------------------|-----------------|----------------|
| **Precedencia y fusión (C-2)**  | 10              | 31 %           |
| **Valor implícito (C-3)**       | 1               | 3 %            |
| **Decisión de permiso (C-4)**   | 10              | 31 %           |
| **Fuera del alcance declarado o del compromiso del período** | 11              | 34 %           |
| **Total**                       | 32              | 100 %          |

*Tabla 9. Incidencias del repositorio de OpenCode clasificadas por mecanismo. Fuente: elaboración propia sobre el relevamiento del 17/09/2026; detalle en el Anexo VI, A.VI.6.*

**Proporción absorbida.** En la misma clasificación, veintiuna de las 32 incidencias (66 %) corresponden a mecanismos cubiertos por requisitos Must, lo que acredita su ocurrencia y no casos resueltos, porque RIGE informa el estado efectivo sin corregir defectos de OpenCode. La proporción absorbida es la reducción de IB-1 en C-2 a C-4 que registre la medición final (apartado I.3.4).

**Problema que queda sin resolver.** En la misma clasificación, once incidencias (34 %) quedan fuera: nueve por exclusiones del apartado III.4 o una falla de la aplicación de escritorio y dos por capacidades fuera del compromiso del período. Se suman los comandos compuestos (L-02) y las relaciones entre elementos (RF-13).

**Criterio fijado antes de la medición.** La Tabla 10 establece qué resultado de la línea de base confirma la selección y cuál obliga a revisarla. El criterio se fija antes de la primera sesión y no se modifica una vez conocidos los datos. Las filas se evalúan en el orden Refuta, Reordena, Confirma, y rige la primera cuya condición se cumple.

| **Resultado** | **Condición observada en la línea de base**      | **Consecuencia sobre el proyecto**                                                                                                                                                                                                               |
|---------------|--------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Confirma**  | IB-1 de C-2 a C-4 supera al de C-1               | Se mantiene la selección y el orden de construcción del apartado V.1                                                                                                                                                                             |
| **Reordena**  | C-3 registra el mayor IB-1 entre las condiciones | RF-06 pasa al frente de lo que resta de la segunda iteración a partir del resultado de la línea de base, antes de la explicación y de la vista web de permisos; el conjunto de requisitos Must y el producto mínimo viable no cambian |
| **Refuta**    | IB-1 de C-2 a C-4 no supera al de C-1            | El problema no se concentra en la combinación de entradas: se revisan la selección del flujo y la meta del objetivo general; la iteración en curso conserva su conjunto comprometido mientras se revisa la selección                            |

*Tabla 10. Criterio de confirmación del flujo seleccionado, fijado antes de la medición. Fuente: elaboración propia sobre los indicadores del apartado I.3.2.*
