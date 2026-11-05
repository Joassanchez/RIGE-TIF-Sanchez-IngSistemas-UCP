# Instrumento 33 · Matriz de rivalidad amplificada y mapeo de competencia


*Momento de aplicación: semana 7, en continuidad con el Instrumento 32. Destino: Capítulo IV, apartados IV.3 y IV.4, y Portafolio de la Unidad Dos. Plazo: jueves 24 de septiembre.*

La pregunta que ordena el análisis no es cuán intensa resulta cada fuerza, sino qué decisión del proyecto cambia por causa de ella. Se cuentan implicancias, no filas. El sustituto más frecuente y más subestimado es la solución artesanal que hoy funciona en la organización: la planilla de cálculo mantenida a mano, gratuita, conocida y capaz de resolver buena parte del problema.

| **Fuerza** | **Situación relevada** | **Evidencia (Cap. II, acta o fuente secundaria)** | **Intensidad** | **Implicancia decisoria** |
|---|---|---|---|---|
| Rivalidad entre competidores actuales | Sobre OpenCode operan `debug config`, `debug agent` (OpenCode, 2026), OCCM (icysaintdx, 2026), CC Switch (JasonYoung, 2026) y agnix (agent-sh, 2026). Las alternativas de terceros tienen licencias libres y requieren reconstrucción manual del estado efectivo y su procedencia. Su cobertura deja vacante la evaluación de decisiones con procedencia por declaración. Sin `--tool`, `debug agent` lista las reglas y no evalúa. Con `--tool`, ejecuta la herramienta y evalúa el permiso: deja de ser de solo lectura y no informa regla ni procedencia (Anexo I, A.I.3) | OpenCode (2026); icysaintdx (2026); JasonYoung (2026); agent-sh (2026); A.I.3 y A.I.4 | Baja | La rivalidad confirma RF-02, RF-06 y RF-09 como Must; por sí sola no cambia su prioridad ni el orden de construcción. Los valores se contrastan contra `debug agent` conforme a RNF-02. Las decisiones se verifican contra el binario OpenCode 1.18.25 o su referencia regenerada, según RF-02, CA-9 |
| Competidores potenciales | Amp evalúa acciones e informa regla y alcance (Amp, s. f.). Codex evalúa comandos de shell y expone configuración efectiva con su origen por capa o archivo (OpenAI, 2026). Ambos omiten la posición de la declaración dentro del archivo. Winning (2026) señala demanda; el conocimiento y los escenarios bajo MIT reducen las barreras de entrada | Amp (s. f.); OpenAI (2026); Winning (2026); Anexo III, D-59 | Alta | El diferencial combina ambos ejes del apartado IV.4; RF-02 incorpora el CA-8 (Anexo III, D-59). Si Amp o Codex incorporan OpenCode, la independencia del núcleo (RNF-03) sostiene el traslado a otra herramienta mediante un adaptador nuevo. Si OpenCode incorpora la función, el aporte de RIGE a OpenCode pasa a ser la salida estratégica (IV.1) |
| Sustitutos | Procedimiento manual vigente, agente con la skill, instrucción de probar, instrucción de usar rutas relativas y regla léxica. La delegación consta en el punto 2.2 de la constancia v2 del 15/10/2026 (apartado II.3.3). Los sincronizadores generan configuración sin verificar el estado cargado, los valores implícitos ni las reglas nativas (dyoshikawa, 2026; JasonYoung, 2026) | Apartado I.3.2, Tabla 4; I.3.4; constancia v2, punto 2.2; OpenCode (2026) | Alta | La línea de base origina el adelanto de RF-02 y RF-07. La reducción del éxito declarado falso y el diagnóstico se contrastan con los sustitutos (apartado I.3.4). La forma propuesta se evalúa estáticamente en uso; en pruebas se contrasta con el binario |
| Poder de negociación de proveedores | OpenCode define el esquema. El conteo propio de los metadatos del registro del productor identifica 227 versiones estables entre el 01/01 y el 30/09/2026 (anomalyco, s. f.-c). La clasificación propia identifica 43 con cambios de configuración, permisos o agentes confirmados en las notas del mismo período (anomalyco, s. f.-d). La incidencia n.º 46873 reporta un comportamiento de permisos en 1.18.26 (ZhukovLabs, 2026), cuya versión de introducción queda sin confirmar (Anexo I, A.I.6). El proveedor también aporta el evaluador de permisos reutilizado bajo MIT | Anexo I, A.I.6; anomalyco (s. f.-c; s. f.-d); ZhukovLabs (2026) | Alta | Sostiene la versión congelada y la advertencia de RF-05: ante otra versión, RIGE advierte y no presenta sus resultados como válidos. El valor del período se acredita sobre 1.18.25. El sostenimiento académico llega hasta la defensa; los ingresos inciertos no cubren la readaptación de X.3 (unos $820.000 por año). RF-05 limita el uso a quien fija 1.18.25. El código reutilizado conserva la licencia de 1.18.25; las de construcción constan en el Capítulo X |
| Poder de negociación de clientes | El desarrollador elige y configura su herramienta (Anexo I, A.I.5). Dispone de alternativas de licencia libre, con un costo de cambio no medido que se presume bajo. El agente consumidor utiliza la salida sin juzgarla | Anexo I, A.I.5; apartado IV.1 | Alta | La adopción exige instalación sin privilegios ni cuenta y sin configuración propia de RIGE; la coincidencia de decisor y usuario confirma L-04. El agente consumidor exige salida determinista con esquema estable (RF-03 y RNF-08) |

El procedimiento manual vigente consiste en revisar archivos y consultar `opencode debug`. No se releva una planilla mantenida a mano. El costo total de ese procedimiento queda sin medir; los tokens de la Tabla 4 de I.3 son el único dato de consumo del procedimiento delegado.

La delegación en un agente constituye otro sustituto. `build` dispone de la skill `customize-opencode` del fabricante (OpenCode, 2026); Charles tiene las skills denegadas en la medición (Anexo III, D-41). Su disponibilidad no evita los éxitos declarados falsos observados en el banco.

La instrucción de probar el efecto ejecutando OpenCode exige una acción de comprobación. Su contraste con RIGE indicado sigue los brazos y la interpretación de I.3.4. La prueba por comportamiento se analiza como esa instrucción, sin constituir otra solución del mapa.

La instrucción de usar rutas relativas es el sustituto de menor costo de incorporación para este mecanismo: agrega una indicación al pedido. Su eficacia y su costo comparado quedan sin medir. Una corrección o un aviso nativo de OpenCode también elimina la necesidad medida.

La regla léxica es casi equivalente: RE-02 combina reconocimiento léxico de la ruta absoluta y pertenencia al árbol de trabajo. La medición final carece de un brazo que la compare con RIGE. La superioridad queda sin demostrar, incluso con la forma propuesta de RF-07, CA-5, los demás hallazgos, como D5, y la decisión de RF-02.

Se abandonaría RIGE para este mecanismo si una instrucción de rutas relativas o un verificador léxico igualara el diagnóstico con costo igual o menor. Si la instrucción de probar alcanza la meta, la reducción del éxito declarado falso deja de acreditar el aporte frente a ella. Rigen entonces el diagnóstico y la salvaguarda de costo (apartado I.3.4).

Si OpenCode corrige la ruta absoluta, el valor medido desaparece. Los demás tipos de RF-07 y la decisión de RF-02 quedan sin línea de base propia. La medición del autor del 20 y el 21/10/2026, con el arnés sobre el banco y corrección por ejecución de OpenCode, resuelve sin RIGE 28 de los 29 problemas ajenos a esa familia (apartado I.3.2). Además, RF-05 deja a RIGE sin resultados válidos en otra versión. La persistencia en versiones posteriores queda sin comprobar en este relevamiento, salvo el reporte sobre 1.18.29 registrado en A.I.6.

El sostenimiento es académico hasta la defensa y la continuidad queda sin asegurar. No se identifica un usuario fuera del autor; EMSA queda fuera de la implantación (apartado IV.1). La instrucción del brazo medido es una condición de la medición; el mecanismo de adopción real queda sin definir.

**33.2 · Mapeo de competencia**

Los ejes se eligen después del relevamiento (Anexo III, D-59). «Competidor» designa alternativas relevadas, sin presión competitiva verificada. El diferencial y la posición de RIGE son provisorios y previstos, respectivamente.

| **Definición de los ejes** | |
|---|---|
| Eje horizontal | Profundidad de la explicación: declaraciones o validación sin estado efectivo (0); resultado efectivo o fusionado (1); valores o reglas en orden de evaluación (2); decisión por acción con regla determinante (3) |
| Justificación del eje horizontal (evidencia del relevamiento que lo sostiene) | Se asigna por la salida documentada. El resultado 3 de II.6.1 distingue listar reglas de evaluar la decisión. Para el problema vigente interesa la evaluación con la semántica real sin ejecutar OpenCode (apartado IV.4) |
| Eje vertical | Procedencia: sin origen (0); alcance o capa (1); entrada, archivo y posición de la declaración (2) |
| Justificación del eje vertical | Se exige acreditar el origen al nivel asignado. El eje mide procedencia; el agente principal la resuelve sin error en la atribución del autor del 13/10/2026, con 54 consultas de C-2 a C-4 y tres repeticiones por caso (A.I.2). Los ejes se seleccionan después del contraste documental, sin acreditar por sí solos el problema vigente |

| **Alternativa relevada** | **Qué resuelve hoy** | **Costo total para la organización** | **Posición en el eje horizontal** | **Posición en el eje vertical** |
|---|---|---|---|---|
| Solución artesanal vigente | Revisión manual de archivos y consulta de `opencode debug`; no se releva planilla mantenida a mano | Total sin medir; los tokens de la Tabla 4 de I.3 son el único dato del procedimiento delegado | Sin posición fija | Sin posición fija |
| Agente con skill | `build` dispone de `customize-opencode`; Charles tiene las skills denegadas en la medición | Tokens registrados en I.3, Tabla 4; total sin medir | Sustituto fuera del mapa | Sustituto fuera del mapa |
| Instrucción de probar | Ejecutar OpenCode para comprobar el efecto | Comparación prevista en I.3.4; sin resultado final | Sustituto fuera del mapa | Sustituto fuera del mapa |
| Instrucción de usar rutas relativas | Evitar el mecanismo mediante una indicación en el pedido | Menor costo de incorporación; costo comparado y eficacia sin medir | Sustituto fuera del mapa | Sustituto fuera del mapa |
| Regla léxica | Reconocer rutas absolutas; RE-02 añade pertenencia al árbol | Casi equivalente para el mecanismo; falta un brazo comparativo | Sustituto fuera del mapa | Sustituto fuera del mapa |
| OpenCode `debug agent <nombre>` | Agente resuelto y reglas en orden. Con `--tool` ejecuta la herramienta, evalúa el permiso y omite regla y procedencia | Incluido en OpenCode; costo total de interpretación sin medir | 2 | 0 |
| OpenCode `debug config` | Configuración fusionada | Incluido en OpenCode; costo total de interpretación sin medir | 1 | 0 |
| OCCM, CC Switch y agnix | Edición, gestión o validación sobre OpenCode | Licencias libres; costo total sin medir | 0 | 0 |
| Amp `permissions test` | Decisión, regla coincidente y alcance | Exige cambiar de herramienta; costo total sin medir | 3 | 1 |
| Codex `execpolicy check` | Decisión para shell y reglas coincidentes | Exige cambiar de herramienta; costo total sin medir | 3 | 0 |
| Claude Code Config Manager | Valores por alcance, efectivos y sobrescritos; navegación a línea JSON | Exige usar Claude Code; costo total sin medir | 1 | 1, lectura conservadora |
| Solución propuesta por el proyecto | RIGE: evaluación estática, diagnóstico y procedencia por declaración sobre OpenCode 1.18.25 | MIT; instalación local sin privilegios ni cuenta. Sostenimiento académico hasta la defensa | 3, previsto | 2, previsto |

*Posiciones del relevamiento documental del autor del 01/10/2026, con Codex como apoyo para buscar y clasificar la nómina (Anexo I, A.I.4). La Figura 2 conserva sus posiciones; RIGE tiene posición prevista.*

La lectura sobre OpenCode comprende cinco soluciones; las otras 28 exigen cambiar de herramienta y no son elegibles para ese usuario sin hacerlo. Las 33 soluciones constituyen un universo distinto de los 33 problemas de E2. La nómina completa consta en A.I.4.

La navegación de Onufriichuk (2026) a la línea JSON aproxima V=1 a V=2 para valores. La lectura conservadora conserva la vacancia en H=3. «Celda sin alternativa relevada» precisa «Cuadrante sin ocupación», porque se representan niveles discretos (apartado IV.4).

Una solución sobre OpenCode que informe decisión y declaración determinante, o un sustituto que iguale el diagnóstico, invalida la vacancia. La prueba por comportamiento corresponde a la instrucción de probar y se analiza entre los sustitutos.

+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **✦ LA PREGUNTA QUE LA CÁTEDRA FORMULARÁ**                                                                                                                                                                                                                                                   |
|                                                                                                                                                                                                                                                                                              |
| «Tomo el sustituto que ya funciona en la organización. Es gratuito, la gente lo sabe usar y resuelve buena parte del problema. ¿Por qué su sistema es mejor que eso, medido con qué indicador y en qué plazo?» Si el instrumento no tiene esa respuesta, el apartado IV.3 no está terminado. |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

| **Respuesta a la pregunta de la cátedra** | |
|---|---|
| Por qué el sistema es mejor que el sustituto | Es una hipótesis de mejora por verificar. RIGE predice la decisión sin ejecutar OpenCode y diagnostica la causa y la forma propuesta. La skill no evita el error medido; la superioridad sobre instrucciones o regla léxica queda sin demostrar |
| Indicador | Éxito declarado falso: el agente declara terminado el cambio y el oráculo comprueba que no logra el efecto pedido. Un problema lo presenta en al menos dos de tres repeticiones. La meta es que cuatro de los cinco problemas cubiertos dejen de tenerlo, con no regresión y salvaguarda de costo (apartado I.3.4) |
| Respuesta correcta | En la modificación, logra el objetivo y conserva las guardas declaradas; el colateral de batería se informa aparte como exceso de alcance. En una consulta de RIGE, coinciden la decisión, la regla determinante y su procedencia con la referencia de OpenCode; son comprobaciones distintas (A.I.7) |
| Brazos y plazo | Al cierre se compara RIGE indicado con la base histórica, sin control simultáneo. Se informa el conjunto reservado. Si alcanza la cuota, se añade el brazo sin RIGE con instrucción de probar; su omisión limita la atribución de la mejora. La Tabla 10 de IV.3 es histórica (apartado I.3.4) |

La rivalidad confirma prioridades sin cambiarlas. La reorientación posterior al dato adelanta RF-02 con rutas y RF-07 sobre el trabajo restante. El orden 6 de la contingencia posterga RF-07 y deja incompleto ese flujo (apartado IV.3).
