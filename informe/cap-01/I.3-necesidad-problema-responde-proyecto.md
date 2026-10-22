## I.3 · Necesidad o problema al que responde el proyecto

### I.3.1 · Enunciado del problema

El desarrollador que configura OpenCode y el agente en el que delega esa tarea (1 · sujeto afectado) carecen de un medio que evalúe si una declaración de configuración, en particular de permisos, produce el efecto pretendido, porque una declaración sin efecto no genera aviso. El agente que modifica la configuración comprueba su trabajo leyendo la configuración declarada con `opencode debug`, que muestra la regla agregada sin evaluar si coincide con la acción, y da por terminado el cambio sin probar su efecto (2 · manifestación observable). El agente puede probarlo ejecutando OpenCode y casi nunca lo hace (apartado I.3.2). En la medición del autor del 20 y el 21/10/2026, realizada con el arnés del repositorio sobre el banco descrito en I.3.2, cinco de 33 problemas con mecanismo silencioso documentado terminan con éxito declarado falso en ambos ejecutores (3 · magnitud e indicador). La necesidad de verificación surge ante cada cambio de configuración y ante cada ejecución del agente que se aparta de lo previsto (4 · contexto y frecuencia). El permiso efectivo difiere del supuesto y el cambio se da por hecho; en dos de esos cinco problemas queda habilitado lo que se pide cerrar (5 · consecuencia acreditada).

La evidencia de ocurrencia comprende las 31 incidencias que el autor identifica mediante búsqueda y clasificación de reportes públicos de OpenCode sobre configuración o permisos, correspondientes a noviembre de 2025 a septiembre de 2026 (Anexo VI, A.VI.6), y los dos episodios propios que la referente relata en la entrevista (Anexo VI, A.VI.5). El mecanismo de la ruta absoluta consta además en tres incidencias públicas de OpenCode anteriores a la medición (ns-calvinwu, 2026; ouyangjian28, 2026; nlscott, 2026). La reorientación desde la atribución de la configuración hacia la verificabilidad de su efecto se presenta en el apartado IV.3.

El costo no delata el error: según la medición de I.3.2, una ejecución con éxito declarado falso cuesta lo mismo que una correcta, de modo que ni el desarrollador ni el agente disponen de una señal barata de la falla. Las fallas son casi deterministas por problema, y repetir el pedido en una sesión nueva reproduce la falla (ADR-098, punto 9).

El proyecto no produce una valoración monetaria de esa consecuencia, y la omisión es deliberada. Los parámetros disponibles provienen de un único informante, la frecuencia declarada es una estimación retrospectiva sin registro de respaldo, la fracción de accesos que exigen una resolución comparable a la que mide la línea de base no fue informada, y el costo de la hora debería tomarse de una fuente sectorial ajena a la organización consultada. Una cifra construida sobre esos parámetros tendría la forma de una medición sin serlo. La magnitud del problema se establece, en cambio, con el éxito declarado falso y la detección del apartado I.3.2, obtenidos mediante medición propia y corrección por ejecución de OpenCode. La alternativa descartada, expresar la valoración como rango de sensibilidad con sus salvedades, consta en el Anexo III.

### I.3.2 · Línea de base

El autor produce la línea de base con el arnés de medición del repositorio los días 20 y 21/10/2026, sobre OpenCode 1.18.25. Se mide el procedimiento delegado de modificación de la configuración en dos ejecutores, `build` y Charles, ambos con `gpt-6.1-sol` y tres repeticiones por problema, sobre un banco de 46 problemas admitidos por reproducción nativa y corregidos ejecutando OpenCode. El banco constituye un conjunto definido de problemas (límite declarado en el apartado II.2.4). Su composición y sus criterios de inclusión se desarrollan en el apartado II.2.1 y en el Anexo VI, A.VI.1.

| **Estrato** | **Problemas** | **Función en la medición** |
|---|---|---|
| E1 · Comunes | 10 | No regresión y costo de referencia |
| E2 · Mecanismo silencioso | 33 | Línea de base y mejora |
| E4 · Síntoma | 3 | Respuesta al pedido por síntoma |

*Tabla 2. Composición del banco por estrato. Fuente: elaboración propia sobre ADR-098 y el Anexo VI, A.VI.1; admisión nativa del 20/10/2026.*

| **Indicador** | **Unidad y definición operativa** | **Función** |
|---|---|---|
| Éxito declarado falso por problema | Problemas en los que, en al menos dos de tres repeticiones, el agente declara terminado el cambio y OpenCode no registra el efecto pedido, registra otro o rompe una guarda que el pedido declara | Criterio principal de éxito |
| Consecuencia | Ejecuciones con exposición, bloqueo o valor distinto del pedido | Caracterización de la consecuencia |
| ID-1 · Detección | Proporción de defectos detectados en al menos dos de tres repeticiones | Condición de no regresión de la detección |
| ID-2 · Falsos positivos | Falsos positivos por ejecución | Condición de no regresión de la detección |
| Costo por ejecución | USD, como equivalente informativo con las tarifas congeladas del Anexo VI, A.VI.10, incluida la caché | Salvaguarda |
| Proceso por traza | Archivos y entradas explorados y editados, tipo de verificación posterior a la última edición, solicitudes y sesiones anidadas | Caracterización del procedimiento |

*Tabla 3. Indicadores de la línea de base. Fuente: elaboración propia sobre ADR-098, puntos 5, 7 y 9 a 12. El criterio de corrección y la regla del colateral constan en el Anexo VI, A.VI.7.*

Con OpenCode 1.18.25 y el procedimiento delegado descrito, cinco de los 33 problemas con mecanismo silencioso documentado terminan con éxito declarado falso en al menos dos de tres repeticiones con ambos ejecutores, por un único mecanismo observado: la regla de permiso escrita con ruta absoluta. Los cinco problemas corresponden a un solo mecanismo y los dos ejecutores comparten el modelo, por lo que no constituyen réplicas independientes. OpenCode evalúa el permiso de una acción sobre un archivo con la ruta relativa al árbol de trabajo, de modo que una regla escrita con la ruta absoluta nunca coincide. En dos de esos problemas queda habilitado algo que el desarrollador pide cerrar, `config/credenciales.json` en N-23 y el directorio `privado` en N-14, y ninguno deja un valor distinto del pedido. En los diez pedidos comunes, ninguno termina con éxito declarado falso.

| **Resultado de la lectura principal** | **`build`** | **Charles** |
|---|---|---|
| E1, problemas con éxito declarado falso | 0 de 10 | 0 de 10 |
| E2, problemas con éxito declarado falso | 5 de 33 | 5 de 33 |
| E2, de ellos con exposición | 2 | 2 |
| E2, de ellos con valor distinto | 0 | 0 |
| E4, problemas con éxito declarado falso | 1 de 3 (S-1, 2/3 repeticiones) | 1 de 3 (S-1, 3/3 repeticiones) |
| ID-1, defectos detectados | 8 de 11 (0,73) | 8 de 11 (0,73) |
| ID-2, falsos positivos en 33 ejecuciones | 8 (8/33 por ejecución) | 9 (9/33 por ejecución) |
| E1, mediana de costo por ejecución (USD) | 0,0603 | 0,0717 |
| E2, mediana de costo por ejecución (USD) | 0,0667 | 0,0764 |
| Éxitos declarados falsos precedidos de verificación declarativa, E1, E2 y E4 | 16 de 16 ejecuciones | 18 de 18 ejecuciones |

*Tabla 4. Línea de base por estrato y ejecutor, tandas del 20 y el 21/10/2026. Fuente: elaboración propia sobre los informes ecológicos y de detección del reanálisis con MED-17 en `01-relevamiento/linea-base/verificacion/20261021-LB-ADR098/`; costos de ADR-098, punto 9.*

La lectura con una de tres repeticiones suma N-21 en `build` y N-13 en Charles. La lectura preregistrada registra seis problemas en tres mecanismos en E2 y C-6 en E1 con ambos ejecutores; el motivo del cambio de lectura y las demás decisiones posteriores al dato constan en la tabla de bifurcaciones del Anexo VI, A.VI.8, y en el Anexo III, D-41.

Todos los éxitos declarados falsos de la lectura principal siguen a una verificación declarativa. En las 138 ejecuciones ecológicas de cada ejecutor, la clasificación por traza registra una sola verificación de comportamiento y ninguna sesión anidada, aunque el agente dispone de la credencial para probar el efecto.

La detección comprende once defectos con tres repeticiones, corregidos por archivo y clave en las tandas del 21/10/2026. Ambos ejecutores detectan ocho de los once; quedan sin detectar la regla con ruta absoluta sobre `.env`, el `deny` con ruta absoluta de N-23 y D5, la sustitución `{env:VAR}` sin la variable.

### I.3.3 · Diagnóstico del sistema de información actual

El sistema de información con que el desarrollador cuenta hoy sobre su configuración se compone de los archivos de las distintas fuentes, los directorios de agentes, comandos y skills, las variables de entorno que alimentan las sustituciones, el motor de OpenCode que aplica todo ello y los comandos de introspección de la herramienta. Dado que RIGE opera sobre el entorno individual del desarrollador, el diagnóstico asocia cada nivel de la tipología de Kendall y Kendall (2005) con un tipo de decisión sobre la configuración y no con una jerarquía de personas. Se evalúa como alternativa aplicar la tipología a la estructura de EMSA y se la descarta porque la organización no es el ámbito de implantación, conforme al apartado I.1.2; el razonamiento completo consta en el Anexo III.

| **Nivel de la pirámide** | **Estado**                                                                                                                                                                                                                                                                                  | **Decisión sin soporte informacional**                                                                                                                                                                                                                                                          |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Operativo                | Cubierto. Los archivos registran todo lo declarado y el motor de la herramienta lo aplica en cada ejecución.                                                                                                                                                                                | —                                                                                                                                                                                                                                                                                               |
| Conocimiento             | Vacante. El registro existe, pero no admite consulta como sistema: los comandos de introspección presentan el resultado de la fusión o el conjunto de reglas aplicables, sin su procedencia ni la decisión correspondiente a una acción, y la respuesta se reconstruye archivo por archivo. | Qué valor rige sobre un agente y qué archivo lo determina; qué declaración queda sin efecto y por qué; sobre qué archivo corresponde intervenir.                                                                                                                                                |
| Gerencial                | Vacante.                                                                                                                                                                                                                                                                                    | Si un permiso efectivo procede de una decisión deliberada; si la configuración otorga al agente permisos más amplios que los previstos; qué elementos declarados carecen de uso; qué elementos operan sin haber sido declarados; a qué se atribuye una ejecución con comportamiento inesperado. |
| Estratégico              | Vacante y fuera del alcance declarado.                                                                                                                                                                                                                                                      | Criterios de configuración comunes entre proyectos y herramientas.                                                                                                                                                                                                                              |

*Tabla 5. Diagnóstico del sistema de información actual según Kendall y Kendall (2005). Fuente: elaboración propia.*

El diagnóstico ubica la intervención en el nivel del conocimiento y, de manera derivada, en el gerencial: RIGE no produce el registro, sino la representación que lo vuelve consultable, conforme al apartado I.2.1. El nivel estratégico se vincula con la visión del apartado I.2.2.

### I.3.4 · Criterio de éxito derivado de la línea de base

La medición final, mediante el protocolo de validación del OE-4, se realiza con RIGE indicado sobre el mismo banco, ejecutores, modelo y versión de OpenCode de la línea de base, y sobre la versión funcional congelada. El criterio principal se enuncia para `build` con `gpt-6.1-sol` (ADR-093; ADR-098).

**Criterio principal.** Al menos dos tercios, redondeados hacia arriba, de los problemas de E2 con éxito declarado falso que cubre el MVP congelado en el corte del 07/11/2026 dejan de tenerlo. Con los cinco problemas de la línea de base, la meta es cuatro. Además, ningún problema que carece de éxito declarado falso lo adquiere, ID-1 mantiene o mejora su valor e ID-2 se mantiene o disminuye. La no regresión sobre los demás problemas de E1 y E2 pone a prueba a RIGE más allá del mecanismo de la ruta absoluta.

**Cobertura.** Los cinco problemas quedan cubiertos por RF-02, CA-9, precisado para archivos y directorios por ADR-088. Todo problema observado y no cubierto por el MVP congelado se informa junto a la meta y con su motivo (ADR-098, punto 8). La ausencia de problemas observados y no cubiertos depende de la decisión sobre el colateral: en la lectura preregistrada, N-21 constituye un problema observado y no cubierto. La precisión del requisito se decide después del dato y se registra en el Anexo VI, A.VI.8.

**Salvaguarda de costo.** El costo cumple la función de salvaguarda y queda fuera del criterio de éxito. Para cada problema se divide la mediana del costo en USD de sus tres repeticiones con RIGE indicado por la mediana de sus tres repeticiones en la línea de base; la mediana de esos cocientes admite como máximo un aumento del 15 % en E2 y del 10 % en E1. Esta salvaguarda se adopta después del dato en reemplazo de la reducción del costo como criterio; su derivación y la alternativa descartada constan en el Anexo III, D-41.

**Rama de respaldo.** Si los problemas de E2 con éxito declarado falso cubiertos por el MVP congelado son menos de tres, la meta queda sin evaluar (condición de ADR-098). El proyecto se informa como producto verificado (OE-1 a OE-3) con hallazgo negativo solo si, además, la detección del agente alcanza al menos el 90 % sin falsos positivos (ADR-093, §5).

Se informan siempre el brazo con RIGE disponible, la proporción descriptiva de problemas de E2 corregidos al primer intento con RIGE indicado (ADR-088, modificación del 22/10), los resultados de Charles, la lectura con una de tres repeticiones y la preregistrada, la consecuencia, el proceso y el contraste fuera del árbol. La coincidencia del resultado de RIGE con el comportamiento de OpenCode constituye una verificación del producto, establecida en OE-1 y OE-2, y se evalúa por separado de este criterio.

La medición final agrega, en forma descriptiva y aparte del criterio, un conjunto reservado de variantes de ruta absoluta con archivos y herramientas que el manifiesto de RIGE no usa, medido con y sin RIGE. Si la cuota lo permite, incorpora además un brazo sin RIGE con la instrucción de probar el efecto ejecutando OpenCode; la deliberación consta en el Anexo III, D-41.

### I.3.5 · Primer requisito y riesgo principal

**Primeros requisitos.** El enunciado del problema origina dos capacidades distintas, que se especifican por separado porque su condición de verificación difiere. RF-01: dado un agente y una clave de configuración, RIGE informa el valor efectivo y la declaración que lo determina, con su entrada, archivo y posición. RF-02: dado un agente y una acción, RIGE informa la decisión de permiso y la regla determinante, con su procedencia y su carácter nativo o declarado. Ambos se derivan de la manifestación del problema y la medición final pone a prueba RF-02, con su CA-9, y RF-07, que detecta las reglas de permiso sin efecto. La referente identifica como aporte principal del enfoque saber qué archivo determina cada valor vigente, información que hoy obtiene revisando los archivos uno por uno (Anexo VI, A.VI.5). Su especificación completa, con criterio de aceptación y prioridad, consta en el catálogo de requisitos del Capítulo III.

**Riesgo principal.** Que la resolución que informa RIGE difiera del comportamiento efectivo de OpenCode 1.18.25. El riesgo se deriva del propio problema: las reglas de combinación que al desarrollador le resultan difíciles de aplicar también pueden modelarse de forma incorrecta, y el congelamiento de versión no lo mitiga, dado que el error de modelado es independiente de la versión. Una plataforma que informa con precisión aparente un resultado erróneo reproduciría el éxito declarado falso que la línea de base mide, y el riesgo se agrava con la interfaz de línea de comandos del apartado I.6.5, cuya salida puede ser consumida por otro agente sin revisión humana intermedia. Se mitiga por tres vías: la incorporación de las funciones de evaluación de permisos de la propia herramienta, cuya licencia MIT lo admite con atribución, lo que asegura la coincidencia de las decisiones por construcción; la comparación automática con la resolución por agente de la herramienta y con su evaluador, establecida en OE-1 y OE-2 y extendida a ambas interfaces; y los casos de prueba verificados por ejecución real. Se evalúa como alternativa reimplementar las reglas desde la documentación y se la descarta porque la documentación describe un modelo incompleto, según acredita el apartado I.1.1. El registro completo de riesgos, incluida la evolución de la herramienta, consta en el Capítulo VI.
