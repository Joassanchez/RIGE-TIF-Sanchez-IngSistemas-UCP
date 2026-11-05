## IV.3 · Análisis de rivalidad amplificada

Las cinco fuerzas competitivas (Porter, 1980; apartado II.5.6) establecen con qué compite la solución. Cada fuerza se corresponde con uno o más bloques del lienzo de la Tabla 7 de IV.1, indicados junto a ella. El lienzo recoge el relevamiento y la línea de base que originan las decisiones; los bloques restantes confirman restricciones existentes. El análisis declara qué decisión del proyecto cambia por su causa.

| **Fuerza (correspondencia con bloque del lienzo)** | **Situación relevada y evidencia** | **Implicancia decisoria** |
|---|---|---|
| Rivalidad entre competidores actuales (propuesta de valor) | Las cinco alternativas sobre OpenCode del contraste de A.VI.4 dejan vacante la decisión con procedencia por declaración. `debug agent --tool` ejecuta la herramienta, sin informar regla ni procedencia (Anexo VI, A.VI.3). Esa cobertura confirma el diferencial | Se conservan RF-02, RF-06 y RF-09 como Must y su orden de construcción. Los valores se contrastan con `debug agent`; las decisiones, con el binario o su referencia regenerada (RF-02, CA-9). La versión se fija en IV.1 |
| Competidores potenciales (recursos clave) | Amp evalúa acciones con regla y alcance (Amp, s. f.). Codex evalúa comandos e informa orígenes por capa o archivo (OpenAI, 2026). Ambos omiten la posición; esa vacancia sostiene combinar los ejes de IV.4. La demanda de Winning (2026) y la licencia MIT favorecen la entrada | Se incorpora la procedencia de la regla determinante (RF-02, CA-8; Anexo III, D-59). La independencia del núcleo sostiene otro adaptador si Amp o Codex incorporan OpenCode. Una incorporación nativa mantiene la salida estratégica de IV.1 |
| Sustitutos (segmentos y propuesta de valor) | El procedimiento manual, el agente con la skill, las instrucciones de probar o usar rutas relativas y la regla léxica cubren partes del flujo. La delegación consta en II.3.3. Los sincronizadores generan configuración; el estado cargado, los valores implícitos y las reglas nativas quedan fuera de su cobertura (dyoshikawa, 2026; JasonYoung, 2026). Esto exige contrastar el procedimiento completo | Se adelantan la decisión de permiso y los hallazgos (RF-02 y RF-07). La reducción del éxito declarado falso y el diagnóstico se contrastan según I.3.4. La forma propuesta se evalúa estáticamente en uso y contra el binario en pruebas |
| Poder de negociación de proveedores (socios clave y estructura de costos) | OpenCode define el esquema y aporta el evaluador MIT. Su cadencia y los cambios de permisos se documentan en I.1.4. La incidencia n.º 46873 informa un comportamiento en 1.18.26, con versión de introducción incierta (ZhukovLabs, 2026; Anexo VI, A.VI.6). Esto exige acotar la versión admitida | Se conserva la advertencia de versión de RF-05 y la validez limitada a la versión de IV.1. El costo de readaptación y su cobertura se tratan en X.3. El código incorporado conserva la licencia de OpenCode; las licencias de construcción constan en el Capítulo X |
| Poder de negociación de clientes (segmentos, canales y relaciones) | El desarrollador elige y configura su herramienta (Anexo VI, A.VI.5). Dispone de alternativas libres; el costo de cambio se presume bajo y requiere medición. El agente consume la salida sin juzgarla. Esto exige autonomía local y un contrato de salida | Se conserva la instalación sin privilegios ni cuenta y sin configuración propia de RIGE. La coincidencia de decisor y usuario confirma L-04. El consumo por agentes exige salida determinista y esquema estable (RF-03 y RNF-08) |

*Tabla 8. Análisis de rivalidad amplificada, con el bloque del lienzo del que deriva cada fuerza y su implicancia decisoria. Fuente: elaboración propia sobre Porter (1980) y el relevamiento.*

El procedimiento manual vigente consiste en revisar archivos y consultar `opencode debug`. No se releva una planilla mantenida a mano. El costo total de ese procedimiento se desconoce; los costos en USD de la Tabla 4 de I.3 corresponden al procedimiento delegado.

La delegación en un agente constituye otro sustituto. `build` dispone de la skill `customize-opencode` del fabricante (OpenCode, 2026); Charles tiene las skills denegadas en la medición (Anexo III, D-41). Su disponibilidad no evita los éxitos declarados falsos observados en el banco.

La instrucción de probar el efecto ejecutando OpenCode exige una acción de comprobación. Su contraste con RIGE indicado sigue los brazos y la interpretación de I.3.4. La prueba por comportamiento se analiza como esa instrucción, sin constituir otra solución del mapa.

La instrucción de usar rutas relativas es el sustituto de menor costo de incorporación para este mecanismo: agrega una indicación al pedido. Se desconocen su eficacia y su costo comparado. Una corrección o un aviso nativo de OpenCode también elimina la necesidad medida.

La regla léxica es casi equivalente: RE-02 combina reconocimiento léxico de la ruta absoluta y pertenencia al árbol de trabajo. El diseño de la medición final excluye el contraste directo con esa regla. La superioridad de RIGE requiere demostración, aun con la forma propuesta de RF-07, CA-5, la sustitución sin valor y la decisión de RF-02.

Se abandonaría RIGE para este mecanismo si una instrucción de rutas relativas o un verificador léxico igualara el diagnóstico con costo igual o menor. Si la instrucción de probar alcanza la meta, la reducción del éxito declarado falso deja de acreditar el aporte frente a ella. Rigen entonces el diagnóstico y la salvaguarda de costo (apartado I.3.4).

Si OpenCode corrige la ruta absoluta, el valor medido desaparece. Los demás tipos de RF-07 y la decisión de RF-02 requieren una línea de base propia. La medición del autor del 20 y el 21/10/2026, con el arnés sobre el banco y corrección por ejecución de OpenCode, resuelve sin RIGE 28 de los 29 problemas ajenos a esa familia (apartado I.3.2). La persistencia del mecanismo en versiones posteriores requiere comprobación; el relevamiento conserva el reporte sobre 1.18.29 registrado en A.VI.6.

El sostenimiento y sus límites se detallan en IV.1. La instrucción del brazo medido es una condición de la medición; el mecanismo de adopción real requiere definición.

### Flujo de valor seleccionado para automatización

El flujo vigente verifica el efecto de una declaración de permiso. Reúne la decisión y su regla determinante, evaluada como lo hace OpenCode mediante RF-02, CA-9, con la detección de declaraciones sin efecto de RF-07. La consulta del estado efectivo, inicialmente seleccionada mediante RF-01 y RF-02, se conserva como capacidad del producto (OE-1) y atraviesa el prototipo v1. La reorientación se decide después de los resultados de atribución, con la deliberación del Anexo III, D-66.

#### Concentración del problema

La concentración se observa dentro de un banco construido, con la familia de ruta absoluta conocida desde el 14/10/2026 y sin cegamiento. El autor mide el 20 y el 21/10/2026 con el arnés y corrige por ejecución de OpenCode. Cuatro de los cuatro problemas de esa familia presentan éxito declarado falso, frente a uno de los 29 restantes (Anexo VI, A.VI.8).

Los 33 problemas de E2 constituyen un universo distinto de las 33 soluciones del relevamiento documental del mapa de IV.4.

La decisión posterior al dato que separa el exceso de alcance y reduce el conteo principal se explica en I.3.2, con su fundamento en el Anexo III, D-41.

La frecuencia en la práctica es desconocida y el mecanismo no se observa en EMSA. Las incidencias iniciales se distinguen de los antecedentes específicos de ruta absoluta desarrollados en I.1.3 a). El costo del éxito declarado falso y el límite de la comparación se presentan en I.3.1.

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

La cobertura de los cinco problemas de la línea de base está prevista por la normalización de rutas de RF-02, CA-9, precisada para archivos y directorios después del dato. Queda sujeta a la revisión del corte. Se plantea como hipótesis que al menos cuatro dejan de tener éxito declarado falso, con las condiciones de no regresión y cobertura del apartado I.3.4. La cobertura especificada requiere comprobarse en la medición final. Se plantea absorber errores del banco; se desconoce la proporción de costo absorbido.

#### Problema que queda sin resolver

La meta admite que uno de los cinco problemas conserve el éxito declarado falso. Quedan fuera el exceso de alcance y el costo humano de descubrir un cambio sin efecto; la medición con la persona se difiere (Anexo III, D-41). La sustitución sin valor conserva un déficit de detección; el detalle y los códigos de los casos constan en el Anexo VI, A.VI.8.

Quedan además fuera los comandos compuestos (L-02), las relaciones entre elementos (RF-13) y toda versión distinta de OpenCode 1.18.25. Las diez incidencias de la Tabla 9 fuera del alcance o del compromiso del período conservan ese carácter: ocho corresponden a exclusiones de III.4 o a la aplicación de escritorio, y dos a capacidades diferidas.

#### Criterio histórico del flujo anterior

La Tabla 10 conserva el criterio de selección de la consulta del estado efectivo, fijado antes de medir (Anexo III, D-32). Las filas se evalúan en el orden indicado y rige la primera condición cumplida. Su aplicación por ejecutor se decide después de conocer los datos. IB-1 es la cantidad de ejecuciones erróneas dividida por el total de ejecuciones de cada condición o conjunto; parciales y sin respuesta cuentan como errores. Se comparan C-2 a C-4 con C-1 (Anexo VI, A.VI.2, Tabla A.VI.4).

| **Resultado** | **Condición observada en la línea de base** | **Consecuencia sobre el proyecto** |
|---|---|---|
| Refuta | IB-1 de C-2 a C-4 no supera al de C-1 | Se revisan la selección del flujo y la meta del objetivo general porque el problema no se concentra en la combinación de entradas. En la decisión del 14/10/2026 se conserva el conjunto comprometido durante la revisión |
| Reordena | C-3 registra el mayor IB-1 entre las condiciones | La consecuencia histórica adelanta RF-06, antes de la explicación y de la vista web de permisos. El conjunto de requisitos Must y el producto mínimo viable se conservan |
| Confirma | IB-1 de C-2 a C-4 supera al de C-1 | Se mantiene la selección y el orden de construcción del apartado V.1 |

*Tabla 10. Criterio histórico de confirmación del flujo anterior, fijado antes de la medición de atribución. Fuente: elaboración propia sobre IB-1 y los resultados del Anexo VI, A.VI.2, Tabla A.VI.4.*

#### Aplicación del criterio histórico

El resultado de la Tabla 10 con la corrección posterior al dato es «Refuta» para `build` y «Confirma» para Charles y la tanda adicional con otro modelo. Charles conserva un caso con problema. El autor decide aplicar la consecuencia al ejecutor principal, `build`, por ser el agente predeterminado. Se descarta sostener la atribución sobre el caso aislado y se adopta la verificación del efecto como flujo, con una medición nueva (Anexo III, D-66).

La secuencia conserva las fechas de fijación del criterio y de sus correcciones:

1. En septiembre de 2026, con revisión del 24/09, se fija el criterio de confirmar, reordenar o refutar la consulta del estado efectivo (Anexo III, D-32).
2. El autor mide atribución el 13/10/2026 sobre 24 casos, con tres repeticiones por ejecutor. El 14/10 confirma el criterio estricto, que exige el origen nativo o declarado, y obtiene «Reordena» para ambos (Anexo III, D-66).
3. La comprobación del 14/10/2026 con pedidos explícitos registra 12 aciertos en 12 ejecuciones sobre dos casos, tres repeticiones y dos ejecutores. El resultado vincula la falla estricta con la redacción (Anexo VI, A.VI.2, Tabla A.VI.4).
4. Después de esos datos, el 14/10/2026 se exige la fuente al nivel solicitado por el pedido. Tras la tanda adicional, el autor aplica la consecuencia sobre `build`, aunque el criterio previo exige coincidencia entre ambos ejecutores (Anexo III, D-66).

Los errores por caso, la sensibilidad del criterio estricto y la tanda adicional se conservan en el Anexo VI, A.VI.2, Tabla A.VI.4; su registro de evidencia consta en A.VI.11.

La revisión modifica la meta del objetivo general (apartado I.2.3). El orden previsto antes de la reorientación ubica evaluador y cadena, valores implícitos, protección nativa, explicación y vista web de permisos; el descubrimiento y los hallazgos corresponden a la iteración siguiente. Después del 14/10/2026 se adelantan la decisión con rutas de RF-02 y los hallazgos de RF-07, con el diagnóstico, sobre las restantes capacidades. El cambio afecta el orden del trabajo restante y conserva las iteraciones comprometidas (apartado V.1).

El registro de estado informa la versión congelada cerrada y publicada el 03/11/2026. Por ello, el adelanto se conserva como decisión histórica, sin inferir aquí nuevas propiedades del código. El orden 6 de la contingencia posterga RF-07 y deja incompleto el flujo vigente, que requiere decisión y diagnóstico (apartado V.4).

#### Condiciones de revisión del flujo vigente

La selección vigente se contrasta con el criterio del apartado I.3.4. Las condiciones siguientes exigen revisar la selección o acotan lo que se acredita frente al sustituto.

| **Condición** | **Consecuencia sobre la selección vigente** |
|---|---|
| Con cobertura suficiente para evaluar la meta, menos de dos tercios, redondeados hacia arriba, de los problemas cubiertos dejan de tener éxito declarado falso, o se incumple la no regresión | Se refuta la hipótesis de mejora en el brazo principal de `build` con RIGE indicado. Se aplican las tolerancias de no regresión fijadas según I.3.4 |
| La cobertura impide evaluar la meta de dos tercios según la rama de respaldo de I.3.4 | Se activa la rama de respaldo y la meta queda sin evaluar. Con detección de al menos el 90 % sin falsos positivos, se informa producto verificado con hallazgo negativo. En la otra combinación, se informan cobertura y detección, sin declarar hallazgo negativo |
| El brazo sin RIGE con instrucción de probar alcanza la meta | La reducción del éxito declarado falso deja de acreditar el aporte frente a esa alternativa. El contraste pasa al diagnóstico de RF-07, causa y forma correcta, y al costo según la salvaguarda entre brazos |

El conjunto reservado describe el ajuste a los casos con que se precisa el requisito y se informa como lectura obligatoria (ADR-098, punto 29). Con al menos tres variantes admitidas, integra la no regresión; con menos, queda descriptivo. Si el brazo con instrucción de probar no alcanza la meta, se informa la diferencia por problema; su omisión por cuota constituye la principal amenaza a la validez del criterio (apartado I.3.4).
