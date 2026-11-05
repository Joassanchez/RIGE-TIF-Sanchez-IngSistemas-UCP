## I.3 · Necesidad o problema al que responde el proyecto

### I.3.1 · Enunciado del problema

El desarrollador que delega la configuración de OpenCode constituye el sujeto afectado (1); el agente es el ejecutor delegado. La manifestación observable (2) consiste en que el agente declara terminado un cambio de permisos sin efecto. En las trazas se observa la comprobación con `opencode debug`, que muestra la regla agregada sin evaluar si coincide con la acción.

La clasificación por traza de la medición del autor del 20 y el 21/10/2026 abarca 276 ejecuciones sobre el banco de I.3.2. Todas verifican mediante lectura declarativa o terminan sin verificación; ninguna ejecuta OpenCode para probar el efecto (apartado I.3.2).

La reclasificación del 04/11/2026 corrige dos lecturas de `debug` desde Python que figuran antes como pruebas de comportamiento. Es una corrección posterior al dato, favorable a la tesis; la medición final usa el clasificador corregido (ADR-098, punto 26). El documento de reclasificación de la verificación respalda la corrección (Anexo VI, A.VI.11).

La magnitud y el indicador (3) se miden sobre el procedimiento delegado. Proceden de la medición del autor del 20 y el 21/10/2026, con el arnés sobre el banco de problemas descrito en I.3.2. Cinco de los 33 problemas de E2 terminan con éxito declarado falso con ambos ejecutores, por un único mecanismo observado: la regla de permiso escrita con ruta absoluta. Los restantes problemas de E2 y los de valores terminan sin éxito declarado falso en la lectura principal (Anexo VI, A.VI.8).

El contexto de verificación (4) comprende los cambios de configuración y las ejecuciones que se apartan de lo previsto. En la entrevista del 29/08/2026, Valeria Areco estima cinco consultas semanales sobre cómo está configurado un agente, una skill o un permiso, en general menores. Ese valor corrige el de diez consignado antes por error de registro. Es una estimación retrospectiva de su propia práctica, sin registro de respaldo ni período de referencia precisado (Anexo VI, A.VI.5). La frecuencia del mecanismo de ruta absoluta en la práctica es desconocida. Su estimación requiere leer la configuración real del equipo; la solicitud se detalla en II.6.2.

La consecuencia acreditada (5) es un riesgo observado en escenarios controlados: el permiso efectivo difiere del supuesto cuando el cambio se da por hecho. En la medición citada, dos de los cinco problemas dejan habilitado lo que se pide cerrar y tres mantienen un bloqueo (Tabla 4). Ningún daño real queda acreditado. La constancia de entrevistas registra consumo de tokens por acciones repetidas ante comportamientos inesperados, sin cuantificarlo ni atribuirlo por separado a cada episodio (Anexo VI, A.VI.5).

La evidencia de ocurrencia comprende 31 incidencias públicas de OpenCode, identificadas en el relevamiento propio por un codificador mediante búsqueda y clasificación por título. Abarcan noviembre de 2025 a septiembre de 2026; la consulta es del 17/09/2026 y la revisión, del 09/10/2026 (Anexo VI, A.VI.6). Ninguna corresponde a ruta absoluta. Se agregan los dos episodios que la referente relata en la entrevista del 24/09/2026 (Anexo VI, A.VI.5).

Los antecedentes específicos de ruta absoluta y el alcance de su búsqueda se desarrollan en I.1.3 a). La reorientación desde la atribución de la configuración hacia la verificabilidad de su efecto consta en el apartado IV.3.

La explicación propuesta es una hipótesis: la presencia de la regla en la introspección se toma como comprobación de su efecto. El silencio de la herramienta resulta insuficiente para explicar la falla: en la medición citada, 28 de los otros 29 problemas silenciosos se resuelven con ambos ejecutores. Se desconoce por qué el agente escribe la ruta absoluta. Se espera que consultar una decisión evaluada y el diagnóstico de la declaración sin efecto reduzca el éxito declarado falso; la medición final contrasta esa expectativa (apartado I.3.4).

En E2 de la medición citada, los éxitos declarados falsos no cuestan más: el costo no delata el error. Con `build`, su mediana es USD 0,0608 (n = 14), frente a USD 0,0678 (n = 82) en los cambios correctos. Para Charles, las medianas son USD 0,0706 (n = 15) y USD 0,0785 (n = 78), respectivamente. La comparación mezcla problemas distintos; la equivalencia informada por el análisis corresponde a tokens. La falla tiende a repetirse en sesiones nuevas con el mismo pedido, en los problemas seleccionados (Anexo VI, A.VI.8). Se omite la valoración monetaria del problema porque faltan parámetros medidos de frecuencia y retrabajo; su magnitud se establece con los indicadores de I.3.2. Se descarta expresarla como rango de sensibilidad basado en una informante y un valor horario sectorial ajeno a la organización (Anexo III, D-18).

Se adopta una plataforma que evalúa decisiones de permiso y detecta declaraciones sin efecto. El verificador léxico es casi equivalente para el mecanismo medido; RIGE añade la forma correcta verificada, los demás tipos de hallazgo y la decisión por acción, con superioridad frente a ese sustituto pendiente de demostrar (apartado IV.3). RF-07 abarca además las sustituciones sin valor; RF-01 se conserva por demanda declarada (Anexo III, D-41). El problema medido se acredita sobre OpenCode 1.18.25, la versión congelada que delimita la validez de los resultados de RIGE conforme a RF-05.

### I.3.2 · Línea de base

El banco es el conjunto definido de problemas que se utiliza para medir el procedimiento delegado. Una ejecución ecológica es una sesión en la que el agente recibe un pedido de cambio dentro del proyecto y dispone de sus archivos. El arnés es el conjunto de programas que prepara los escenarios, ejecuta las sesiones y registra sus resultados. El oráculo es la referencia que comprueba el resultado mediante ejecución de OpenCode 1.18.25.

El ejecutor es la variante de agente que recibe los pedidos del banco. Un brazo es una condición de medición que fija las instrucciones y la disponibilidad de RIGE. El exceso de alcance comprende cambios adicionales respecto de la forma correcta, sin alterar una guarda declarada en el pedido. La definición de colateral que delimita ese exceso consta en el Anexo VI, A.VI.7. La lectura principal aplica el criterio vigente, que separa el exceso de alcance del éxito declarado falso. La lectura preregistrada aplica el criterio fijado antes de medir, que cuenta ese exceso como éxito declarado falso.

En la medición del autor del 20 y el 21/10/2026 se admiten 46 problemas por reproducción nativa y se corrige cada resultado con el oráculo. Cinco de los 33 problemas con mecanismo silencioso documentado terminan con éxito declarado falso en al menos dos de tres repeticiones con ambos ejecutores. Se emplean `build` y una variante declarada de Charles, ambos con `gpt-6.1-sol`. El único mecanismo observado por problema es la regla de permiso escrita con ruta absoluta, que OpenCode evalúa contra la ruta relativa al árbol de trabajo. En dos problemas queda habilitado lo que se pide cerrar, `config/credenciales.json` y el directorio `privado`; ninguno deja un valor distinto del pedido. Los diez pedidos comunes registran cero problemas con éxito declarado falso.

Charles es el agente con el que el equipo de la referente configura la herramienta. La delegación de los cambios en un agente desarrollado internamente consta en el apartado II.3.3. Las adaptaciones de Charles para la medición se declaran en el Anexo III, D-41.

El alcance del banco se delimita en II.2.4. Los criterios de inclusión constan en el apartado II.2.1. Su composición detallada se presenta en el Anexo VI, A.VI.1. Los cinco problemas corresponden a un mecanismo y ambos ejecutores comparten el modelo; sus resultados se consideran dependientes como réplicas.

La familia de ruta absoluta se incorpora con conocimiento de su falla; el banco tiene ese límite de cegamiento. El resultado de cinco de 33 corresponde a cuatro de cuatro problemas de esa familia y a uno de 29 del resto, con ambos ejecutores.

El cálculo de la tasa de ruta absoluta del 04/11/2026 examina mecánicamente las reglas por archivo o directorio agregadas o modificadas en las copias finales de esas tandas. Se realiza con apoyo de Codex para el análisis y revisión del ingeniero sobre los resultados. En E2 usan ruta absoluta 13 de 30 ejecuciones elegibles con `build` (43,33 %) y 16 de 31 con Charles (51,61 %). E1 tiene cero ejecuciones elegibles. La tasa describe esta medición; se desconoce la frecuencia en la práctica (Anexo VI, A.VI.11).

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

*Tabla 3. Indicadores de la línea de base. Fuente: elaboración propia sobre ADR-098, puntos 5, 7 y 9 a 12. El criterio de corrección y la definición de colateral constan en el Anexo VI, A.VI.7.*

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

Las consecuencias de la Tabla 4 corresponden a escenarios controlados; el detalle por problema consta en II.3.2. En las tandas del autor del 20 y el 21/10/2026, la reclasificación de la verificación registra verificación declarativa antes de 16 de 16 éxitos declarados falsos con `build` y 18 de 18 con Charles. Sobre todas las ejecuciones con esa verificación, las proporciones son 16 de 130 (12,3 %) y 18 de 134 (13,4 %), respectivamente. `build` registra 130 verificaciones declarativas, ocho ejecuciones sin verificación y cero pruebas de comportamiento; Charles registra 134, cuatro y cero. Entre las ejecuciones sin verificación se registran cero éxitos declarados falsos de ocho y de cuatro, respectivamente (Anexo VI, A.VI.11). La insuficiencia de `debug` para comprobar el efecto se funda en el mecanismo: muestra la regla sin evaluarla (Anexo VI, A.VI.3).

El 22/10/2026, después del dato, se decide separar el exceso de alcance del indicador principal y contar el mecanismo observado en los archivos finales (Anexo III, D-41). En las tandas citadas, el conteo de problemas con éxito declarado falso de E2 pasa de seis a cinco y el de mecanismos, de tres a uno. La meta sigue en cuatro. La denegación de otros `.env` se clasifica como exceso de alcance y cambia la cobertura informada (Anexo VI, A.VI.8).

La misma decisión lleva el conteo de E1 de uno de diez problemas a cero de diez, y el de E4 de dos de tres a uno de tres. Los cinco problemas de E2 se sostienen en la lectura principal, la preregistrada y la sensibilidad que excluye el exceso de alcance (Anexo VI, A.VI.8). El control de modificación invalida la medición del 14/10/2026 porque se registra un cambio sin efecto; el otro control registra exceso de alcance. Los códigos de ambos controles se conservan en el Anexo VI, A.VI.2.

La lectura con una de tres repeticiones y el desglose de proceso y detección se conservan en el Anexo VI, A.VI.8. En la medición del autor del 21/10/2026, sobre once defectos sembrados con tres repeticiones por ejecutor, tres se detectan de forma inconsistente. Dos son de ruta absoluta y uno de sustitución sin valor; ese resultado sostiene la prioridad de RF-07 para esos defectos. Los demás tipos de hallazgo se justifican por el relevamiento técnico (Anexo VI, A.VI.3).

### I.3.3 · Diagnóstico del sistema de información actual

El sistema de información disponible comprende las entradas de configuración, los directorios de agentes, comandos y skills, el motor de OpenCode y sus comandos de introspección. Las variables de entorno alimentan las sustituciones dentro de esas entradas. La tipología de Kendall y Kendall (2005) se aplica por función: las entradas registran y el motor procesa; falta la función de control. Se organiza el diagnóstico por decisión, información disponible y consecuencia; se descarta conservarlo por niveles porque ese orden deja en segundo plano la verificación del cambio (Anexo III, D-71). EMSA queda fuera del ámbito de implantación definido en I.1.2.

| **Decisión** | **Quién decide** | **Información disponible** | **Consecuencia** |
|---|---|---|---|
| Dar por terminado un cambio de permisos | El agente delegado y el desarrollador que lo acepta | `opencode debug` muestra la regla sin evaluarla | Éxito declarado falso con exposición o bloqueo en escenarios controlados (Tabla 4). |
| Qué declaración corregir ante un comportamiento inesperado | El desarrollador | Archivos y salida sin procedencia | Acciones repetidas y consumo de tokens declarado, sin cuantificar (Anexo VI, A.VI.5). |
| Qué valor rige y qué archivo lo determina | El desarrollador | `debug` sin procedencia | Reconstrucción por archivos. Medición: el autor registra cero errores de `build` en 54 consultas de atribución, tres repeticiones por caso, el 13/10/2026 (Anexo VI, A.VI.2). Opinión: la referente declara esa consulta como aporte (Anexo VI, A.VI.5). |
| Criterios comunes entre proyectos | Fuera del alcance | Fuera del alcance | Horizonte de ampliación de la visión (apartado I.2.2). |

*Tabla 5. Diagnóstico del sistema de información actual según Kendall y Kendall (2005). Fuente: elaboración propia.*

RIGE cumple funciones de control y apoyo a la decisión del desarrollador, conforme a la misión del apartado I.2.1. El proyecto no declara una ventaja competitiva sostenible: la licencia MIT y las alternativas del relevamiento reducen las barreras de entrada (apartado IV.3).

### I.3.4 · Criterio de éxito derivado de la línea de base

«RIGE indicado» combina la herramienta y la instrucción al agente de consultarla para verificar el cambio. La meta es la reducción exigida de problemas con éxito declarado falso. La no regresión exige conservar o mejorar los resultados de los demás problemas y de la detección. La salvaguarda fija el aumento máximo de costo admitido. La cobertura es la cantidad de problemas con éxito declarado falso que atiende el producto mínimo viable. La rama de respaldo establece qué se informa cuando esa cobertura comprende menos de tres problemas.

La regla de veredicto de la medición final es la siguiente:

* Si se cumplen la meta, la no regresión y la salvaguarda: Criterio cumplido.
* Si se cumplen la meta y la no regresión y se excede la salvaguarda: Meta alcanzada con costo excedido; no se declara una mejora neta del procedimiento.
* Si la cobertura comprende tres o más problemas y la meta no se alcanza: Criterio no cumplido, con hallazgo negativo.
* Si se alcanza la meta y se rompe la no regresión: Criterio no cumplido; el procedimiento empeora en otros problemas.
* Si la cobertura comprende menos de tres problemas: Meta sin evaluar; rige la rama de respaldo.

Se adopta esta regla y se descarta exigir solo la ejecución completa porque esa condición se cumple incluso si falla la meta (Anexo III, D-70).

Nota: en cualquier veredicto, si el brazo descriptivo con instrucción de probar también alcanza la meta, la reducción no se atribuye a RIGE. Sin ese brazo, se informa lo observado con RIGE indicado, sin afirmar que RIGE produzca la reducción. OE-4 requiere «Criterio cumplido» y constancia de conformidad de la referente; OE-1 a OE-3 se evalúan por separado.

La medición final sigue el protocolo de validación del OE-4 sobre el mismo banco, ejecutores, modelo y versión de OpenCode de la línea de base, con la versión final publicada de RIGE. La revisión efectiva es `congelada`, `0df6cb7`, del 03/11/2026; todo cambio posterior lleva una etiqueta nueva. El criterio principal corresponde a `build` con `gpt-6.1-sol`, en el brazo que indica al agente que consulte RIGE para verificar el cambio (Anexo III, D-41).

El procedimiento con RIGE indicado se compara con una base histórica, sin control simultáneo. Las formas de referencia defectuosas se corrigen antes de medir y se conserva la línea de base; los casos se identifican en el Anexo VI, A.VI.8.

#### Criterio principal

Al menos dos tercios, redondeados hacia arriba, de los problemas de E2 con éxito declarado falso que cubre el MVP congelado en el corte del 07/11/2026 dejan de tenerlo. Con los cinco problemas de la línea de base, la meta es cuatro. Los problemas inicialmente libres de éxito declarado falso conservan esa condición; ID-1 mantiene o mejora su valor e ID-2 se mantiene o disminuye. La condición comprueba que el procedimiento no empeora en los demás problemas de E1 y E2.

Antes del corte del 07/11/2026 se estima, para cada condición de no regresión y ejecutor, la probabilidad de incumplimiento sin cambio real. El remuestreo distingue la variación por azar de un empeoramiento real. Se remuestrean las tres repeticiones de cada problema de la línea de base en 5.000 iteraciones. Hasta el 5 %, se conserva la condición y se declara la probabilidad; por encima, se fija una tolerancia en el percentil 95. El remuestreo conserva un resultado fijo en los problemas con cero de tres o tres de tres repeticiones con éxito declarado falso. La reutilización de las mismas repeticiones puede subestimar la variación (Anexo III, D-41).

En el conjunto reservado, con RIGE indicado, la cantidad de variantes con éxito declarado falso en al menos dos de tres repeticiones no supera la del brazo sin RIGE. Si se admiten menos de tres variantes, la condición se informa como no puesta a prueba y el conjunto queda descriptivo (Anexo VI, A.VI.8).

#### Cobertura

La cobertura de los cinco problemas está prevista por la normalización de rutas de RF-02, CA-9, precisada para archivos y directorios después del dato, el 22/10/2026. Queda sujeta a la revisión del alcance del MVP en el corte; su acreditación requiere la verificación del producto. Todo problema observado que quede fuera del MVP congelado se informa junto a la meta, con su motivo; la lectura preregistrada agrega uno sin cobertura por exceso de alcance (Anexo VI, A.VI.8).

#### Salvaguarda de costo

El costo cumple la función de salvaguarda, por separado de la meta de reducción del éxito declarado falso. Por problema se divide la mediana en USD de tres repeticiones con RIGE indicado por la mediana de tres repeticiones en la línea de base. La mediana de esos cocientes admite como máximo un aumento del 15 % en E2 y del 10 % en E1. Esta decisión posterior al dato reemplaza la reducción del costo como criterio; su fundamento y la alternativa descartada constan en el Anexo III, D-41.

#### Rama de respaldo

Si la revisión del MVP antes del corte del 07/11/2026 activa la rama de respaldo, se informa el producto verificado mediante OE-1 a OE-3, junto con la cobertura y la detección. Se declara hallazgo negativo solo con detección del agente de al menos el 90 % sin falsos positivos; en la otra combinación, se conserva el problema observado (Anexo III, D-41).

Las lecturas y los brazos descriptivos se informan por separado del criterio principal para conservar los contrastes y mostrar el efecto de las decisiones posteriores al dato (Anexo VI, A.VI.8). La coincidencia de RIGE con OpenCode se verifica como propiedad del producto mediante OE-1 y OE-2, por separado de la mejora del procedimiento delegado.

Se informan como lecturas descriptivas la tasa de reglas por ruta escritas con ruta absoluta, la productividad del procedimiento delegado y la fuente leída antes de escribir la ruta absoluta (Anexo VI, A.VI.8).

El conjunto reservado de variantes de ruta absoluta describe el ajuste a los casos con los que se precisa el requisito y se informa como lectura obligatoria junto a la meta. La condición compara cantidades entre brazos: un empate cumple la no regresión aunque persista el éxito declarado falso en las mismas variantes (ADR-098, punto 29).

Si alcanza la cuota, se incorpora además el brazo sin RIGE con instrucción de probar el efecto ejecutando OpenCode. Cuando alcanza la meta sin RIGE, el aporte frente a esa alternativa se acredita en el diagnóstico de RF-07, causa y forma correcta, y en el costo comparado entre los brazos mediante la salvaguarda. Si el brazo no alcanza la meta, se informa la diferencia por problema. Su omisión por cuota se declara como la principal amenaza a la validez del criterio (Anexo III, D-41).

El corte del 07/11/2026 fija el MVP cuya cobertura delimita la meta. El 14/11/2026 se conserva como línea de base planificada del congelamiento. La medición final usa la versión final publicada y el texto de la instrucción se fija antes de medir (Anexo VI, A.VI.8).

### I.3.5 · Primer requisito y riesgo principal

#### Capacidades requeridas

Se conservan dos capacidades con condiciones de verificación distintas. Para un agente y una clave de configuración, RF-01 informa el valor efectivo y la declaración determinante. La respuesta incluye su entrada, archivo y posición. Esa capacidad se conserva por demanda declarada, sin derivarla del problema medido: la referente identifica como aporte principal saber qué archivo determina cada valor efectivo (Anexo VI, A.VI.5). RF-02 informa, para un agente y una acción, la decisión de permiso y la regla determinante, con su procedencia y su carácter nativo o declarado. La medición final pone a prueba RF-02, con su CA-9, y RF-07, que detecta reglas de permiso sin efecto. El mecanismo medido no se observa en EMSA y la referente aún no confirma el problema reformulado. El estado y el alcance de esa confirmación constan en II.6.2, con remisión al Anexo II. El catálogo del Capítulo III contiene la especificación completa, con criterios de aceptación y prioridades.

#### Riesgo de divergencia

El riesgo principal consiste en que RIGE informe una resolución distinta del comportamiento efectivo de OpenCode 1.18.25. Las reglas de combinación pueden modelarse de forma incorrecta incluso con una versión congelada. Un resultado erróneo con precisión aparente reproduciría el éxito declarado falso medido. La interfaz de línea de comandos agrava ese riesgo porque otro agente puede consumir su salida sin revisión humana intermedia (apartado I.6.5).

Las mitigaciones comprenden:

- Incorporar las funciones de evaluación de permisos de OpenCode bajo su licencia MIT, con atribución. La coincidencia por reutilización se acota a esas funciones; la normalización de rutas se verifica contra el binario conforme a RF-02, CA-9.

- Comparar de forma automática la resolución por agente y la decisión de permiso con las de OpenCode, según OE-1 y OE-2, por ambas interfaces.

- Verificar los casos de prueba mediante ejecución real.

Se descarta reimplementar las reglas desde la documentación porque describe un modelo incompleto, según el apartado I.1.1. La deliberación sobre la incorporación del evaluador consta en el Anexo III, D-44. El Capítulo VI contiene el registro de riesgos, incluida la evolución de la herramienta.
