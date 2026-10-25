## IV.3 · Análisis de rivalidad amplificada

Las cinco fuerzas competitivas (Porter, 1980; apartado II.5.6) establecen con qué compite la solución. Cada fuerza se deriva de uno o más bloques del lienzo de la Tabla 7, indicados junto a ella. El análisis declara qué decisión del proyecto cambia por su causa.

| **Fuerza (deriva de: bloque del lienzo)** | **Situación relevada y evidencia** | **Implicancia decisoria** |
|---|---|---|
| Rivalidad entre competidores actuales (propuesta de valor) | Sobre OpenCode operan `debug config`, `debug agent` (OpenCode, 2026), OCCM (icysaintdx, 2026), CC Switch (JasonYoung, 2026) y agnix (agent-sh, 2026). Las alternativas de terceros tienen licencias libres y requieren reconstrucción manual del estado efectivo y su procedencia. Su cobertura deja vacante la evaluación de decisiones con procedencia por declaración. `debug agent` muestra la regla declarada sin evaluar si coincide con la acción, según la verificación por ejecución (Anexo VI, A.VI.3) | RF-02, RF-06 y RF-09 conservan prioridad Must por su explicación. Los valores se contrastan contra `debug agent` conforme a RNF-02. Las decisiones se verifican contra el binario OpenCode 1.18.25 o su referencia regenerada, según RF-02, CA-9 |
| Competidores potenciales (recursos clave) | Amp evalúa acciones e informa regla y alcance (Amp, s. f.). Codex evalúa comandos de shell y expone configuración efectiva con su origen por capa o archivo (OpenAI, 2026). Ambos omiten la posición de la declaración dentro del archivo. Winning (2026) señala demanda; el conocimiento y los escenarios bajo MIT reducen las barreras de entrada | El diferencial combina ambos ejes del apartado IV.4; RF-02 incorpora el CA-8 (Anexo III, D-59). Si Amp o Codex incorporan OpenCode, la independencia del núcleo (RNF-03) sostiene el traslado a otra herramienta mediante un adaptador nuevo. Si OpenCode incorpora la función, el aporte de RIGE a OpenCode pasa a ser la salida estratégica (IV.1) |
| Sustitutos (segmentos y propuesta de valor) | `build` dispone de la skill `customize-opencode`, que instruye para crear y corregir la configuración, incluidos los permisos (OpenCode, 2026). Charles tiene las skills denegadas en la medición (Anexo III, D-41). También se dispone del procedimiento manual con comandos nativos y de la consulta a un agente con permisos elevados. La referente declara la delegación de los cambios en el punto 2.2 de la constancia de entrevistas, versión 2, firmada el 15/10/2026 (apartado II.3.3). Los sincronizadores de fuente única generan configuración sin verificar el estado cargado, los valores implícitos ni las reglas nativas (dyoshikawa, 2026; JasonYoung, 2026). Equivalen a la planilla mantenida a mano de la guía de la AE2, apartado 5.2. Otras alternativas son instruir al agente para probar el efecto, una corrección o aviso de OpenCode y una regla léxica de rutas absolutas | La medición del autor del 20 y el 21/10/2026, con modificación de configuración y corrección por ejecución de OpenCode, registra cinco problemas con éxito declarado falso entre los 33 de E2, con ambos ejecutores (apartado I.3.2). La skill disponible no evita el error. La instrucción de probar exige el contraste y la interpretación preregistrada del apartado I.3.4. Si OpenCode corrige la evaluación de rutas absolutas o agrega un aviso, el problema medido queda acotado a 1.18.25. El aporte se sostiene en los demás tipos de RF-07 y en la decisión de RF-02. Sobre el mecanismo medido, la regla léxica es casi equivalente. El aporte de RIGE reside en la forma correcta verificada (RF-07, CA-5), los demás tipos de hallazgo y la decisión de RF-02. RF-02 y RF-07 pasan al frente de lo que resta de la construcción para verificar el efecto en modo de solo lectura |
| Poder de negociación de proveedores (socios clave y estructura de costos) | OpenCode define el esquema. El conteo propio de los metadatos del registro del productor identifica 227 versiones estables entre el 01/01 y el 30/09/2026 (anomalyco, s. f.-c). La clasificación propia identifica 43 con cambios de configuración, permisos o agentes confirmados en las notas del mismo período (anomalyco, s. f.-d). La incidencia n.º 46873 reporta un comportamiento de permisos en 1.18.26 (ZhukovLabs, 2026), cuya versión de introducción queda sin confirmar (Anexo VI, A.VI.6). El proveedor también aporta el evaluador de permisos reutilizado bajo MIT | Sostiene la versión congelada y la advertencia de RF-05: ante otra versión, RIGE advierte y no presenta sus resultados como válidos. El valor del período se acredita sobre 1.18.25; su uso en versiones posteriores depende de la readaptación presupuestada en X.3 (unos $820.000 por año). El código reutilizado conserva la licencia de 1.18.25; las de construcción constan en el Capítulo X |
| Poder de negociación de clientes (segmentos, canales y relaciones) | El desarrollador elige y configura su herramienta (Anexo VI, A.VI.5). Dispone de alternativas de licencia libre, con un costo de cambio no medido que se presume bajo. El agente consumidor utiliza la salida sin juzgarla | La adopción exige instalación sin privilegios ni cuenta y sin configuración propia de RIGE; la coincidencia de decisor y usuario confirma L-04. El agente consumidor exige salida determinista con esquema estable (RF-03 y RNF-08) |

*Tabla 8. Análisis de rivalidad amplificada, con el bloque del lienzo del que deriva cada fuerza y su implicancia decisoria. Fuente: elaboración propia sobre Porter (1980) y el relevamiento.*

La delegación en un agente con la skill del fabricante constituye un sustituto disponible desde la instalación para `build`. La preferencia por RIGE se plantea como hipótesis: comprobar el efecto y diagnosticar la causa reduce el éxito declarado falso. La medición final pone a prueba esa hipótesis y el contraste con la instrucción de probar el efecto (apartado I.3.4).

Un verificador léxico es casi equivalente para el mecanismo medido. RIGE añade la forma correcta verificada de RF-07, CA-5, los demás tipos de hallazgo, como la sustitución sin valor de D5, y la decisión de RF-02. La medición final carece de un brazo léxico; la superioridad frente a ese sustituto queda sin demostrar.

### Flujo de valor seleccionado para automatización

El flujo vigente verifica el efecto de una declaración de permiso. Reúne la decisión y su regla determinante, evaluada como lo hace OpenCode mediante RF-02, CA-9, con la detección de declaraciones sin efecto de RF-07. La consulta del estado efectivo, inicialmente seleccionada mediante RF-01 y RF-02, se conserva como capacidad del producto (OE-1) y atraviesa el prototipo v1. La reorientación se decide después de los resultados de atribución, con la deliberación del Anexo III, D-66.

#### Concentración del problema

La medición del autor del 20 y el 21/10/2026, con el arnés sobre el banco y la corrección por ejecución de OpenCode, concentra los cinco problemas con éxito declarado falso de E2 en permisos. Todos corresponden al mecanismo de ruta absoluta; los de valores y los diez pedidos comunes de E1 quedan sin éxito declarado falso (apartado I.3.2). La tasa depende de la composición del banco (apartado II.2.4).

La búsqueda complementaria del autor por título y lectura de reportes, con un codificador, identifica tres antecedentes de ruta absoluta externos al banco. Se publican entre agosto y septiembre de 2026 y se verifican el 19/10/2026 (Anexo VI, A.VI.6). Estos reportes acreditan ocurrencia previa a la medición (ns-calvinwu, 2026; ouyangjian28, 2026; nlscott, 2026).

La Tabla 9 conserva como antecedente la clasificación propia por título de las incidencias públicas de noviembre de 2025 a septiembre de 2026. Un codificador realiza el relevamiento del 17/09/2026 y su revisión del 09/10/2026 (Anexo VI, A.VI.6). Esa clasificación acredita la ocurrencia de los mecanismos generales; la selección vigente se apoya en la línea de base.

| **Mecanismo** | **Incidencias** | **Proporción** |
|---|---|---|
| Precedencia y fusión (C-2) | 10 | 32 % |
| Valor implícito (C-3) | 1 | 3 % |
| Decisión de permiso (C-4) | 10 | 32 % |
| Fuera del alcance declarado o del compromiso del período | 10 | 32 % |
| Total | 31 | 100 % |

*Tabla 9. Antecedente de ocurrencia: incidencias públicas de OpenCode clasificadas por mecanismo. Fuente: elaboración propia sobre el relevamiento del 17/09/2026, revisado el 09/10/2026 (Anexo VI, A.VI.6). Se excluye la n.º 32581 porque corresponde a OpenClaw. Las proporciones se redondean al entero y su suma difiere de 100 por ese redondeo.*

#### Proporción absorbida

Los cinco problemas de la línea de base quedan cubiertos por la normalización de rutas de RF-02, CA-9, precisada para archivos y directorios después del dato. Se plantea como hipótesis que al menos cuatro dejan de tener éxito declarado falso, con las condiciones de no regresión y cobertura del apartado I.3.4. La cobertura especificada requiere comprobarse en la medición final.

#### Problema que queda sin resolver

La meta admite que uno de los cinco problemas conserve el éxito declarado falso. Quedan fuera el exceso de alcance, observado en C-6 y N-21, y el costo que paga la persona para descubrir un cambio sin efecto; la medición con la persona se difiere (Anexo III, D-41). D5, la sustitución sin valor, conserva un déficit de detección en la medición del autor sobre el corpus de defectos sembrados del 21/10/2026 (Anexo VI, A.VI.8).

Quedan además fuera los comandos compuestos (L-02), las relaciones entre elementos (RF-13) y toda versión distinta de OpenCode 1.18.25. Las diez incidencias de la Tabla 9 fuera del alcance o del compromiso del período conservan ese carácter: ocho corresponden a exclusiones de III.4 o a la aplicación de escritorio, y dos a capacidades diferidas.

#### Criterio histórico del flujo anterior

La Tabla 10 conserva el criterio de selección de la consulta del estado efectivo, fijado antes de medir (Anexo III, D-32). Las filas se evalúan en el orden indicado y rige la primera condición cumplida. Su aplicación por ejecutor se decide después de conocer los datos. IB-1 es la proporción de errores de atribución, comparada entre C-2 a C-4 y C-1 (Anexo VI, A.VI.2, Tabla A.VI.4).

| **Resultado** | **Condición observada en la línea de base** | **Consecuencia sobre el proyecto** |
|---|---|---|
| Refuta | IB-1 de C-2 a C-4 no supera al de C-1 | Se revisan la selección del flujo y la meta del objetivo general porque el problema no se concentra en la combinación de entradas. La iteración en curso conserva su conjunto comprometido durante la revisión |
| Reordena | C-3 registra el mayor IB-1 entre las condiciones | RF-06 pasa al frente de lo que resta de la segunda iteración, antes de la explicación y de la vista web de permisos. El conjunto de requisitos Must y el producto mínimo viable se conservan |
| Confirma | IB-1 de C-2 a C-4 supera al de C-1 | Se mantiene la selección y el orden de construcción del apartado V.1 |

*Tabla 10. Criterio histórico de confirmación del flujo anterior, fijado antes de la medición de atribución. Fuente: elaboración propia sobre IB-1 y los resultados del Anexo VI, A.VI.2, Tabla A.VI.4.*

#### Aplicación del criterio histórico

El autor produce la medición de atribución el 13/10/2026 sobre 24 casos, con tres repeticiones por ejecutor. Con el criterio estricto confirmado el 14/10/2026, la Tabla 10 da «Reordena» para `build` y Charles (Anexo III, D-66). La sonda R registra 12 aciertos en 12 ejecuciones del autor del 14/10/2026 y muestra que la falla estricta depende de la redacción (Anexo VI, A.VI.2, Tabla A.VI.4).

Con la enmienda posterior a esa sonda, `build` con `gpt-6.1-sol` registra cero errores en las 54 consultas de C-2 a C-4 y también en C-1; corresponde «Refuta». Charles conserva dos errores en 54 consultas de C-2 a C-4, ambos en C-4e, y corresponde «Confirma». La tanda adicional del 14/10/2026 con `gpt-5.6-luna` registra dos errores en esas 54 consultas, en C-2b y C-4e, con el mismo resultado de selección.

Charles tiene un caso con problema, C-4e, con dos errores en tres repeticiones. La tanda adicional carece de casos con problema (Anexo VI, A.VI.2, Tabla A.VI.4).

La regla compañera exige coincidencia de los dos ejecutores. Después de conocer los datos, el autor decide aplicar la consecuencia sobre el principal, `build`, porque es el agente predeterminado de OpenCode y Charles queda en otra rama por un único caso. Se descarta sostener la atribución sobre ese caso aislado y se adopta la verificación del efecto como flujo, con medición nueva (Anexo III, D-66).

La revisión alcanza la meta del objetivo general (apartado I.2.3). RF-02 y RF-07 pasan al frente de lo que resta de la construcción. La iteración en curso conserva su conjunto comprometido.

#### Condiciones de revisión del flujo vigente

La selección vigente se contrasta con el criterio del apartado I.3.4. Las condiciones siguientes exigen revisar la selección o acotan lo que se acredita frente al sustituto.

| **Condición** | **Consecuencia sobre la selección vigente** |
|---|---|
| Con los cinco problemas cubiertos, menos de cuatro dejan de tener éxito declarado falso, o se incumple la no regresión | Se refuta la hipótesis de mejora en el brazo principal de `build` con RIGE indicado. Se aplican las tolerancias de no regresión fijadas según I.3.4 |
| La revisión del MVP antes del corte deja cubiertos menos de tres problemas | Se activa la rama de respaldo y la meta queda sin evaluar. Con detección de al menos el 90 % sin falsos positivos, se informa producto verificado con hallazgo negativo. En la otra combinación, se informan cobertura y detección, sin declarar hallazgo negativo |
| El brazo sin RIGE con instrucción de probar alcanza la meta | La reducción del éxito declarado falso deja de acreditar el aporte frente a esa alternativa. El contraste pasa al diagnóstico de RF-07, causa y forma correcta, y al costo según la salvaguarda entre brazos |

El conjunto reservado mitiga el ajuste a los casos con que se precisa el requisito. Con al menos tres variantes admitidas, integra la no regresión; con menos, queda descriptivo. Si el brazo con instrucción de probar no alcanza la meta, se informa la diferencia por problema; su omisión por cuota constituye la principal amenaza a la validez del criterio (apartado I.3.4).
