## I.3 · Necesidad o problema al que responde el proyecto

### I.3.1 · Enunciado del problema

El desarrollador que configura OpenCode y el agente en el que delega esa tarea constituyen el sujeto afectado (1). La dificultad consiste en verificar si una declaración de configuración, en particular de permisos, produce el efecto pretendido, porque una declaración sin efecto queda sin aviso. La manifestación observable (2) aparece cuando el agente comprueba el cambio con `opencode debug`, que muestra la regla agregada sin evaluar si coincide con la acción, y declara terminado el trabajo. El agente dispone de medios para probar el efecto ejecutando OpenCode. La clasificación por traza del autor registra una verificación de comportamiento en 138 ejecuciones por ejecutor los días 20 y 21/10/2026 sobre el banco de I.3.2.

La magnitud y el indicador (3) proceden de la medición del autor del 20 y el 21/10/2026, con el arnés sobre el banco de problemas descrito en I.3.2. Cinco de los 33 problemas de E2 terminan con éxito declarado falso con ambos ejecutores, por un único mecanismo observado: la regla de permiso escrita con ruta absoluta. Los restantes problemas de E2 y los de valores quedan sin éxito declarado falso en la lectura principal (Anexo VI, A.VI.8).

El contexto de verificación (4) comprende los cambios de configuración y las ejecuciones que se apartan de lo previsto. Como referencia de frecuencia, Valeria Areco estima cinco accesos semanales a los archivos de configuración en su propia práctica, en la entrevista del 29/08/2026. Es una estimación retrospectiva de una informante, sin registro de respaldo ni período de referencia precisado. Los accesos incluyen consultas menores; la proporción que corresponde a cambios de permisos queda sin cuantificar (Anexo VI, A.VI.5).

La consecuencia acreditada (5) es la diferencia entre el permiso efectivo y el supuesto cuando el cambio se da por hecho. En los escenarios controlados de la medición citada, dos de los cinco problemas dejan habilitado lo que se pide cerrar y tres mantienen un bloqueo (Tabla 4). La constancia de entrevistas registra consumo de tokens por acciones repetidas ante comportamientos inesperados, sin cuantificarlo ni atribuirlo por separado a cada episodio (Anexo VI, A.VI.5).

La evidencia de ocurrencia comprende 31 incidencias públicas de OpenCode, identificadas en el relevamiento propio por un codificador mediante búsqueda y clasificación por título. Abarcan noviembre de 2025 a septiembre de 2026; la consulta es del 17/09/2026 y la revisión, del 09/10/2026 (Anexo VI, A.VI.6). Se agregan los dos episodios que la referente relata en la entrevista del 24/09/2026 (Anexo VI, A.VI.5). La búsqueda complementaria propia en el mismo repositorio, por título y con lectura de los reportes, identifica tres antecedentes de ruta absoluta, publicados entre agosto y septiembre de 2026 y verificados el 19/10/2026 por un codificador (Anexo VI, A.VI.6). Los reportes preceden a la medición del mecanismo (ns-calvinwu, 2026; ouyangjian28, 2026; nlscott, 2026). La reorientación desde la atribución de la configuración hacia la verificabilidad de su efecto consta en el apartado IV.3.

Se adopta una plataforma que evalúa decisiones de permiso y detecta declaraciones sin efecto. El verificador léxico se descarta como respuesta suficiente porque omite la repetición en que se deniega listar un directorio y sigue habilitada su lectura, y señala rutas absolutas legítimas como defectos (apartado IV.3). RF-07 abarca además otras declaraciones sin efecto, como las sustituciones sin valor; RF-01 conserva la consulta del valor efectivo y su procedencia (Anexo III, D-41). El problema medido se acredita sobre OpenCode 1.18.25, la versión congelada que delimita la validez de los resultados de RIGE conforme a RF-05.

Según la medición citada, el costo por ejecución resulta equivalente entre cambios correctos y éxitos declarados falsos, y repetir el pedido tiende a reproducir la falla (Anexo VI, A.VI.8). Se omite la valoración monetaria del problema porque faltan parámetros medidos de frecuencia y retrabajo; su magnitud se establece con los indicadores de I.3.2. Se descarta expresarla como rango de sensibilidad basado en una informante y un valor horario sectorial ajeno a la organización (Anexo III, D-18).

### I.3.2 · Línea de base

Con OpenCode 1.18.25 y el procedimiento delegado, cinco de 33 problemas con mecanismo silencioso documentado terminan con éxito declarado falso en al menos dos de tres repeticiones con ambos ejecutores. El único mecanismo observado por problema es la regla de permiso escrita con ruta absoluta, que OpenCode evalúa contra la ruta relativa al árbol de trabajo. En dos problemas queda habilitado lo que se pide cerrar, `config/credenciales.json` y el directorio `privado`; ninguno deja un valor distinto del pedido. Los diez pedidos comunes quedan sin éxito declarado falso.

El autor produce estos resultados con el arnés de medición los días 20 y 21/10/2026, sobre 46 problemas admitidos por reproducción nativa y corregidos ejecutando OpenCode. Se emplean `build` y una variante declarada de Charles, ambos con `gpt-6.1-sol` y tres repeticiones por problema. Charles es el agente con el que el equipo de la referente configura la herramienta. La delegación de los cambios en un agente desarrollado internamente consta en el apartado II.3.3. Las adaptaciones de Charles para la medición se declaran en el Anexo III, D-41.

El banco constituye un conjunto definido de problemas, con el límite del apartado II.2.4. Los criterios de inclusión constan en el apartado II.2.1. Su composición detallada se presenta en el Anexo VI, A.VI.1. Los cinco problemas corresponden a un mecanismo y ambos ejecutores comparten el modelo; sus resultados carecen de independencia como réplicas.

| **Estrato** | **Problemas** | **Función en la medición** |
|---|---|---|
| E1 · Comunes | 10 | No regresión y costo de referencia |
| E2 · Mecanismo silencioso | 33 | Línea de base y mejora |
| E4 · Síntoma | 3 | Respuesta al pedido por síntoma |

*Tabla 2. Composición del banco por estrato. Fuente: elaboración propia sobre ADR-098 y el Anexo VI, A.VI.1; admisión nativa del 20/10/2026.*

Nota: E3 se integra en E1 y E2 por decisión del 19/10/2026. Los controles de valores pasan a E1 y los problemas de valores con mecanismo silencioso, a E2 (Anexo III, D-41).

| **Indicador** | **Unidad y definición operativa** | **Función** |
|---|---|---|
| Éxito declarado falso por problema | Problemas en los que, en al menos dos de tres repeticiones, el agente declara terminado el cambio y OpenCode no registra el efecto pedido, registra otro o rompe una guarda que el pedido declara | Criterio principal de éxito |
| Consecuencia | Ejecuciones con exposición, bloqueo o valor distinto del pedido | Caracterización de la consecuencia |
| ID-1 · Detección | Proporción de defectos detectados en al menos dos de tres repeticiones | Condición de no regresión de la detección |
| ID-2 · Falsos positivos | Falsos positivos por ejecución | Condición de no regresión de la detección |
| Costo por ejecución | USD, como equivalente informativo con las tarifas congeladas del Anexo VI, A.VI.10, incluida la caché | Salvaguarda |
| Proceso por traza | Archivos y entradas explorados y editados, tipo de verificación posterior a la última edición, solicitudes y sesiones anidadas | Caracterización del procedimiento |

*Tabla 3. Indicadores de la línea de base. Fuente: elaboración propia sobre ADR-098, puntos 5, 7 y 9 a 12. El criterio de corrección y la regla del colateral constan en el Anexo VI, A.VI.7.*

| **Resultado de la lectura principal** | **`build`** | **Charles** |
|---|---|---|
| E1, problemas con éxito declarado falso | 0 de 10 | 0 de 10 |
| E2, problemas con éxito declarado falso | 5 de 33 | 5 de 33 |
| E2, de ellos con exposición | 2 | 2 |
| E2, de ellos con bloqueo | 3 | 3 |
| E2, de ellos con valor distinto | 0 | 0 |
| E4, problemas con éxito declarado falso | 1 de 3 (restablecer la lectura de `src/productos.js`, 2/3 repeticiones) | 1 de 3 (restablecer la lectura de `src/productos.js`, 3/3 repeticiones) |
| ID-1, defectos detectados | 8 de 11 (0,73) | 8 de 11 (0,73) |
| ID-2, falsos positivos por ejecución | 8/33 | 9/33 |
| E1, mediana de costo por ejecución (USD) | 0,0603 | 0,0717 |
| E2, mediana de costo por ejecución (USD) | 0,0667 | 0,0764 |
| Éxitos declarados falsos precedidos de verificación declarativa, E1, E2 y E4 | 16 de 16 ejecuciones | 18 de 18 ejecuciones |

*Tabla 4. Línea de base por estrato y ejecutor, tandas del 20 y el 21/10/2026. Fuente: elaboración propia sobre los informes ecológicos y de detección del reanálisis con MED-17 (registro de la evidencia, Anexo VI, A.VI.11); costos de ADR-098, punto 9.*

Las consecuencias de la Tabla 4 corresponden a escenarios controlados; el detalle por problema consta en II.3.2. La verificación declarativa precede a todos los éxitos declarados falsos de la lectura principal, por lo que leer la regla agregada resulta insuficiente para comprobar su efecto (Anexo VI, A.VI.8).

El 22/10/2026, después del dato, se decide excluir del indicador principal el colateral de batería y contar el mecanismo observado en los archivos finales, con fundamento en la distinción entre efecto y exceso de alcance (Anexo III, D-41). La lectura preregistrada arroja seis problemas y tres mecanismos; la meta sigue en cuatro, pero el caso de denegación de otros `.env` pasa a exceso de alcance y cambia la cobertura informada (Anexo VI, A.VI.8).

La lectura con una de tres repeticiones y el desglose de proceso y detección se conservan en el Anexo VI, A.VI.8. La detección de la Tabla 4 deja sin identificar de forma consistente declaraciones sin efecto. Este resultado sostiene la prioridad de RF-07.

### I.3.3 · Diagnóstico del sistema de información actual

El sistema de información disponible comprende las entradas de configuración, los directorios de agentes, comandos y skills, el motor de OpenCode y sus comandos de introspección. Las variables de entorno alimentan las sustituciones dentro de esas entradas. Cada nivel de la tipología de Kendall y Kendall (2005) se aplica a decisiones sobre el entorno individual del desarrollador. Se descarta aplicarla a la estructura de EMSA porque la organización queda fuera del ámbito de implantación definido en I.1.2. La deliberación consta en el Anexo III.

| **Nivel de la pirámide** | **Estado**                                                                                                                                                                                                                                                                                  | **Decisión sin soporte informacional**                                                                                                                                                                                                                                                          |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Operativo                | Cubierto. Las entradas de configuración contienen las declaraciones y el motor de la herramienta las procesa al resolver el estado efectivo.                                                                                                                                                                                | —                                                                                                                                                                                                                                                                                               |
| Conocimiento             | Vacante. El registro existe, pero no admite consulta como sistema: los comandos de introspección presentan el resultado de la fusión o el conjunto de reglas aplicables, sin su procedencia ni la decisión correspondiente a una acción. La respuesta se reconstruye archivo por archivo. | Qué valor rige sobre un agente y qué archivo lo determina; qué declaración queda sin efecto y por qué; sobre qué archivo corresponde intervenir.                                                                                                                                                |
| Gerencial                | Vacante.                                                                                                                                                                                                                                                                                    | Si un permiso efectivo procede de una decisión deliberada; si la configuración otorga al agente permisos más amplios que los previstos; qué elementos declarados carecen de uso. Qué elementos operan sin haber sido declarados; a qué se atribuye una ejecución con comportamiento inesperado. |
| Estratégico              | Vacante y fuera del alcance declarado.                                                                                                                                                                                                                                                      | Criterios de configuración comunes entre proyectos y herramientas.                                                                                                                                                                                                                              |

*Tabla 5. Diagnóstico del sistema de información actual según Kendall y Kendall (2005). Fuente: elaboración propia.*

La intervención se ubica en el nivel del conocimiento y, de manera derivada, en el gerencial. RIGE representa el registro existente de forma consultable, conforme a la misión del apartado I.2.1. La cobertura de criterios comunes entre proyectos y herramientas corresponde al horizonte de ampliación de la visión del apartado I.2.2.

### I.3.4 · Criterio de éxito derivado de la línea de base

La medición final sigue el protocolo de validación del OE-4 sobre el mismo banco, ejecutores, modelo y versión de OpenCode de la línea de base, con la versión funcional congelada. El criterio principal corresponde a `build` con `gpt-6.1-sol`, en el brazo que indica al agente que consulte RIGE para verificar el cambio (Anexo III, D-41).

#### Criterio principal

Al menos dos tercios, redondeados hacia arriba, de los problemas de E2 con éxito declarado falso que cubre el MVP congelado en el corte del 07/11/2026 dejan de tenerlo. Con los cinco problemas de la línea de base, la meta es cuatro. Ningún problema que carece de éxito declarado falso lo adquiere; ID-1 mantiene o mejora su valor e ID-2 se mantiene o disminuye. La no regresión sobre los demás problemas de E1 y E2 pone a prueba a RIGE más allá del mecanismo de la ruta absoluta.

#### Cobertura

Los cinco problemas quedan cubiertos por la normalización de rutas de RF-02, CA-9, precisada para archivos y directorios después del dato, el 22/10/2026. Todo problema observado que quede fuera del MVP congelado se informa junto a la meta, con su motivo; la lectura preregistrada agrega uno sin cobertura por exceso de alcance (Anexo VI, A.VI.8).

#### Salvaguarda de costo

El costo cumple la función de salvaguarda y queda fuera del criterio de éxito. Por problema se divide la mediana en USD de tres repeticiones con RIGE indicado por la mediana de tres repeticiones en la línea de base. La mediana de esos cocientes admite como máximo un aumento del 15 % en E2 y del 10 % en E1. Esta decisión posterior al dato reemplaza la reducción del costo como criterio; su fundamento y la alternativa descartada constan en el Anexo III, D-41.

#### Rama de respaldo

Si los problemas de E2 con éxito declarado falso cubiertos por el MVP congelado son menos de tres, la meta queda sin evaluar. El proyecto se informa como producto verificado (OE-1 a OE-3) con hallazgo negativo solo si, además, la detección del agente alcanza al menos el 90 % sin falsos positivos (Anexo III, D-41).

Las lecturas y los brazos descriptivos se informan por separado del criterio principal para conservar los contrastes y mostrar el efecto de las decisiones posteriores al dato (Anexo VI, A.VI.8). La coincidencia de RIGE con OpenCode se verifica como propiedad del producto mediante OE-1 y OE-2, por separado de la mejora del procedimiento delegado.

El conjunto reservado de variantes de ruta absoluta mitiga el ajuste a los casos con los que se precisa el requisito. Si alcanza la cuota, se incorpora además el brazo sin RIGE con instrucción de probar el efecto ejecutando OpenCode; su omisión se declara como límite (Anexo III, D-41). El corte del 07/11/2026 fija el MVP cuya cobertura delimita la meta; el congelamiento del 14/11/2026 fija el texto de la instrucción de ese brazo descriptivo.

### I.3.5 · Primer requisito y riesgo principal

#### Capacidades requeridas

El problema origina dos capacidades con condiciones de verificación distintas. Para un agente y una clave de configuración, RF-01 informa el valor efectivo y la declaración determinante. La respuesta incluye su entrada, archivo y posición. RF-02 informa, para un agente y una acción, la decisión de permiso y la regla determinante, con su procedencia y su carácter nativo o declarado. La medición final pone a prueba RF-02, con su CA-9, y RF-07, que detecta reglas de permiso sin efecto. La referente identifica como aporte principal saber qué archivo determina cada valor efectivo (Anexo VI, A.VI.5). La confirmación de la referente sobre el problema reformulado, la verificabilidad del efecto de la configuración, queda pendiente y se presenta en la próxima constancia conjunta (Anexo II). El catálogo del Capítulo III contiene la especificación completa, con criterios de aceptación y prioridades.

#### Riesgo de divergencia

El riesgo principal consiste en que RIGE informe una resolución distinta del comportamiento efectivo de OpenCode 1.18.25. Las reglas de combinación pueden modelarse de forma incorrecta incluso con una versión congelada. Un resultado erróneo con precisión aparente reproduciría el éxito declarado falso medido. La interfaz de línea de comandos agrava ese riesgo porque otro agente puede consumir su salida sin revisión humana intermedia (apartado I.6.5).

Las mitigaciones comprenden:

- Incorporar las funciones de evaluación de permisos de OpenCode bajo su licencia MIT, con atribución. La coincidencia por reutilización se acota a esas funciones; la normalización de rutas se verifica contra el binario conforme a RF-02, CA-9.

- Comparar de forma automática la resolución por agente y la decisión de permiso con las de OpenCode, según OE-1 y OE-2, por ambas interfaces.

- Verificar los casos de prueba mediante ejecución real.

Se descarta reimplementar las reglas desde la documentación porque describe un modelo incompleto, según el apartado I.1.1. La deliberación sobre la incorporación del evaluador consta en el Anexo III, D-44. El Capítulo VI contiene el registro de riesgos, incluida la evolución de la herramienta.
