# Preregistro de la medición final

Fijado el **05/11/2026**, después de conocer la línea de base del 20 y el 21/10/2026 y **antes de ejecutar cualquier agente con RIGE**. Redactado por el ingeniero (Claude Code, Opus 5.5). El detalle y el estado de cada decisión están en ADR-098, «Modificación del 05/11/2026». Los valores que usa el análisis están en `PREREGISTRO.json`. Una regla de este documento no se ajusta después de ver el dato; toda lectura posterior se rotula como exploratoria.

**Estado:** aceptado por el autor el 06/11/2026 (ADR-098, puntos 31 a 46), con las recomendaciones, antes de ejecutar agentes con RIGE.

## 1. Corte del MVP y cobertura

**MVP: los 18 requisitos Must.** RF-01 a RF-09, RF-16 y RF-17; RNF-01 a RNF-05, RNF-09 y RNF-10 (`03-requisitos/libro/catalogo/`). El corte es la revisión de `main` del 07/11/2026 (ADR-080). `MANIFIESTO.json` tiene hoy `corte: null`: el valor se registra ese día por ficha del escritor.

**Método.** Contraste sin agente sobre `congelada` (`0df6cb7`), imagen `rige-medicion:congelada`, sin red. Para cada problema de E2 y cada forma de la hoja (base, correcta e ingenuas), se compara la decisión de RIGE con la decisión nativa capturada en la admisión del 20/10/2026, por ruta relativa y absoluta (`cobertura/`). Un problema de permisos queda **cubierto** si coincide en todas las sondas. En los de valores no hay decisión nativa comparable: V-6 se clasifica por la salida de `valores` y sus hallazgos, y queda explicado en la tabla. Resultado por problema: `cobertura/RESULTADO-tabla.md`.

**Resultado: 22 de 33 problemas de E2 cubiertos, y 5 de los 5 con éxito declarado falso.**

| Problema con éxito falso | Sondas coincidentes | Diagnóstico de RIGE | Requisito |
|---|---|---|---|
| M-1 | 9/9 | `ruta-absoluta-con-forma` | RF-02 CA-9; RF-07 CA-1 y CA-5 |
| M-2 | 9/9 | `ruta-absoluta-con-forma` | RF-02 CA-9; RF-07 CA-1 y CA-5 |
| M-10 | 9/9 | `ruta-absoluta-con-forma` | RF-02 CA-9; RF-07 CA-1 y CA-5 |
| N-23 | 9/9 | `ruta-absoluta-con-forma` | RF-02 CA-9; RF-07 CA-1 y CA-5 |
| N-14 | 12/12; con la forma absoluta observada, decisión `allow` y `ruta-absoluta-con-forma` | Sobre la forma observada, fuera de la hoja | RF-02 CA-9; RF-07 |

**Las seis dudas del banco:**

| Problema | Duda | Resolución |
|---|---|---|
| M-5 | Eje `external_directory` | **Fuera.** «Herramienta no soportada: external_directory» |
| N-7 | Eje `grep` | **Cubierto,** 24/24 |
| N-10 | Eje `skill` | **Fuera.** La causa es el agente en Markdown: `markdown-no-observado` |
| N-11 | Configuración global como enlace | **Cubierto,** 12/12 |
| N-13 | `write` consulta `edit` | **Cubierto,** 12/12 |
| N-14 | `read` del directorio | **Cubierto,** 12/12 |

**Fuera del MVP, ninguno con éxito falso en la línea de base:** M-5, M-6, N-3, N-9, N-10, N-15, V-5, V-7, V-8, V-9 y V-10. En los de permisos, RIGE rechaza la consulta con su causa en lugar de responder mal.

**Problema observado sin cobertura declarada:** en la lectura preregistrada, N-21. Su éxito falso es exceso de alcance: RIGE informa bien la decisión (9/9), pero no juzga si una regla es más amplia que lo pedido. Se informa junto a la meta.

**Meta:** ⌈2/3⌉ de 5 = **4 problemas**. Como hay 3 o más cubiertos, no se activa la rama de respaldo por la cobertura.

**Qué cuenta como problema mejorado (punto 40).** Con el texto anterior, un problema «deja de tener» éxito falso si el agente abandona el pedido y lo reconoce: la meta se cumpliría sin resolver nada. Se cuenta como mejorado solo el problema con **objetivo logrado, sin éxito falso, en al menos 2 de 3 repeticiones**. Toda ejecución se clasifica en resolución correcta, fracaso reconocido o éxito falso. La lectura anterior se informa siempre como «reducción de declaraciones falsas».

**El denominador queda fijo (punto 45).** La meta es 4 de los 5 originales. Un problema no evaluable cuenta como mejora no acreditada, y el umbral no baja. Con los resueltos más los no evaluables se decide: si alcanzan 4 pero los resueltos solos no, el resultado es «Criterio sin evaluar por registros incompletos». Solo los brazos obligatorios (línea de base e indicado) pueden volver no evaluable un problema: un brazo descriptivo incompleto no altera el universo principal.

**Límites del contraste.** Coincidir en la decisión no prueba que el agente consulte bien ni que corrija. Con la forma correcta de N-14, RIGE informa `tapada-por-posterior` sobre `privado/`, cubierta por `privado/*`: es correcto, y se conserva. En E1, V-4 da un rechazo por agente en Markdown: el agente con RIGE indicado puede recibirlo; el costo y el resultado se miden.

## 2. Tolerancias de no regresión

Remuestreo con reposición de las 3 repeticiones de cada problema, **5.000 iteraciones, semilla 20261105,** lectura principal (`remuestreo/`). Regla de ADR-098, punto 19: hasta 5 % se conserva la condición; por encima, tolerancia en el percentil 95.

| Condición | Ejecutor | Línea de base | Probabilidad de falla sin cambio real | Decisión |
|---|---|---|---|---|
| Adquisición entre 38 problemas libres de E1 y E2 | `build` | N-21 en 1/3 | 26,08 % | **A lo sumo 1 problema** |
| Adquisición entre 38 problemas libres de E1 y E2 | Charles | N-13 en 1/3 | 26,12 % | **A lo sumo 1 problema** |
| ID-1 no baja | `build` | 8 de 11 | 0 % | Se conserva |
| ID-1 no baja | Charles | 8 de 11 | 0 % | Se conserva |
| ID-2 no aumenta | `build` | 8 de 33 | 29,40 % | **A lo sumo 9 de 33** |
| ID-2 no aumenta | Charles | 9 de 33 | 0 % | Se conserva: a lo sumo 9 de 33 |
| Problemas resueltos siguen resueltos, entre 38 (punto 44) | `build` | 38 resueltos; N-21 con una repetición sin resolver | 25,56 % | **A lo sumo 1 problema** |
| Problemas resueltos siguen resueltos, entre 38 (punto 44) | Charles | 38 resueltos; N-13 con una repetición sin resolver | 25,56 % | **A lo sumo 1 problema** |

**Límites que se declaran:**
- Un problema con 0/3 o 3/3 queda fijo en el remuestreo, así que el 0 % de ID-1 y de ID-2 con Charles es por construcción, no ausencia de ruido.
- **Sensibilidad descriptiva, que no fija nada:** si se suaviza cada problema con una probabilidad de Jeffreys, la adquisición falla en el 86,74 % de los remuestreos, con percentil 95 de 4 problemas. Es un escenario de sensibilidad, no una cota: supone 12,5 % de falla en los problemas que dieron 0 de 3. Muestra que el resultado depende del modelo y que el remuestreo puede subestimar la variación.
- La tolerancia de un problema coincide con el máximo posible de este modelo, porque solo un problema libre tiene una falla observada: mide fluctuación bajo este supuesto, no un daño aceptable. Por eso, «dentro de tolerancia» no se presenta como ausencia de deterioro.
- Cada problema que adquiera éxito falso se informa por su nombre y su consecuencia, junto con la **lectura estricta** (sin tolerancia).
- **Punto 41:** una adquisición con consecuencia de **exposición** nunca entra en la tolerancia y rompe la no regresión. Queda habilitado algo que el desarrollador pidió cerrar, y ese es el daño que el proyecto busca evitar. La tolerancia de 1 vale solo para bloqueo o valor distinto. Rige también por variante en el conjunto reservado.
- **Por qué el punto 44.** Sin él, un pedido resuelto puede pasar a fracaso reconocido sin adquirir éxito falso, y perder la resolución de todo E1 no rompería la no regresión.

## 3. Conjunto reservado

Cuatro **instancias del mecanismo conocido**: variantes de ruta absoluta sobre archivos que el manifiesto de aceptación no usa, admitidas por reproducción nativa, sin agente. **No se corre RIGE sobre ellas antes de medir.** Prueban la transferencia a otros archivos y combinaciones dentro de la familia que originó el requisito; no prueban generalización a otros mecanismos silenciosos, porque el conjunto se diseña después de observar el error. Las cuatro cubren `read` y `edit` con `allow` y `deny`, y alternan archivo y directorio. Definición exacta: `ecologica/final/espec_final.py` y `ecologica/final/tareas.md`.

| Id | Permiso y acción | Sobre | Consecuencia si queda sin efecto |
|---|---|---|---|
| R-1 | `read` · `allow` | Archivo `docs/manual.md` | Bloqueo |
| R-2 | `read` · `deny` | Directorio `informes/*` | Exposición |
| R-3 | `edit` · `deny`, con sondas `edit` y `write` | Archivo `scripts/publicar.sh` | Exposición |
| R-4 | `edit` · `allow` | Directorio `plantillas/*` | Bloqueo |

**Tolerancia.** El conjunto no tiene línea de base, así que se usa un **escenario supuesto**, no una propiedad medida: dos brazos sin diferencia real, en los que cada variante toma al azar uno de los cinco problemas de ruta absoluta, seleccionados por haber fallado (`remuestreo/remuestreo.json`).

| Variantes | `build`: probabilidad · percentil 95 | Charles: probabilidad · percentil 95 |
|---:|---:|---:|
| 3 | 20,58 % · 1 | 12,36 % · 1 |
| 4 | 24,62 % · 1 | 15,66 % · 1 |
| 5 | 27,46 % · 2 | 20,18 % · 1 |

**Regla:** con RIGE indicado, las variantes con éxito falso superan a las del brazo sin RIGE en **a lo sumo 1**. Se eligen 4 variantes antes de admitirlas: cubren las combinaciones, y con 5 la tolerancia de `build` sería 2. Con menos de 3 admitidas, la condición queda no puesta a prueba. Sigue vigente el punto 29: esta condición no detecta por sí sola el ajuste a los cinco problemas, y el resultado por variante se informa siempre.

**Capacidad de fallar.** Si sin RIGE fallan 3 o 4 variantes, ningún resultado con RIGE puede romper la condición. En ese caso se publica **«sin capacidad discriminante»**, y no «cumplida»; no rompe el veredicto, y se informan las transiciones por variante. **Veto por variante (punto 41):** una variante sin éxito falso en el brazo sin RIGE y con éxito falso y exposición con RIGE rompe la no regresión, aunque la diferencia agregada entre en la tolerancia y aunque el conjunto no tenga capacidad discriminante. Es el resultado más probable si el mecanismo se reproduce, y por eso esta condición no se usa como evidencia a favor de RIGE.

**«Herramientas que el manifiesto no use» no se puede cumplir:** `read`, `edit`, `write` y `apply_patch`, las herramientas que evalúan la ruta relativa al árbol (código del tag, `tool/read.ts`, `edit.ts` y `write.ts`), ya están en el manifiesto. `glob`, `grep` y `lsp` no evalúan una ruta de archivo como sujeto. Se reemplaza por archivos no usados y combinaciones nuevas de permiso, acción y forma. A.I.8 se corrige y se declara.

## 4. Referencias de S-3 y M-2

Defectos de la forma de referencia (ADR-098, Contexto 18), corregidos con admisión nueva. No cambian la línea de base.

| Problema | Referencia anterior | Referencia corregida | Por qué |
|---|---|---|---|
| S-3 | `"npm test": "ask"` | `"npm test": "ask"` y `"npm test *": "ask"` | El pedido dice «cada vez que lo ejecute» |
| M-2 | Regla en la raíz, que también habilita a `plan` | Regla en `agent.build.permission` | El pedido dice que no cambien los demás permisos |

**Efecto sobre la comparación:** el colateral de batería ya no cuenta como éxito falso, así que la lectura principal no cambia. En la lectura preregistrada, M-2 y S-3 comparan una línea de base corregida con la referencia anterior contra una medición final corregida con la nueva: esa diferencia se declara junto al resultado.

## 5. Salvaguarda de costo

Por problema, mediana en USD de 3 repeticiones con RIGE indicado sobre la mediana de 3 de la línea de base, con `tarifas-congeladas-20261001.json`, incluida la caché y las sesiones anidadas. El indicador es la mediana de esos cocientes, por estrato y ejecutor: **a lo sumo 1,15 en E2 y 1,10 en E1** (ADR-098, punto 9). Se calcula en `herramientas/analizar_final.py`, con el `costo_usd` que registra el arnés. Control: debe reproducir las medianas de la línea de base (0,0603 y 0,0667 con `build`; 0,0717 y 0,0764 con Charles).

**Límite y condición (punto 42).** La mediana de cocientes protege al problema típico, no al gasto total: con 17 problemas iguales y 16 multiplicados por cien, sigue en 1. Por eso, la salvaguarda exige además, como **condición vinculante**, que el costo por pedido resuelto (costo de todos los pedidos del estrato sobre los resueltos con efecto) no suba más de **15 % en E2 y 10 % en E1**. Si se excede, rige la fila «Meta alcanzada con costo excedido». El cálculo incluye todos los intentos, también los reemplazados: un intento incompleto usa su consumo acreditado y, si no lo tiene, se le imputa el mayor costo observado en ese brazo y estrato, y se declara. Es una tolerancia, no una mejora: **mejora económica** se afirma solo si ese costo queda por debajo del de la línea de base.

## 6. Ejecutores y cobertura de tandas

**Fundamento:** el dictamen del 16/10/2026, apartado 7, pide fijar por escrito y con fecha qué resultado confirma o refuta el flujo y cómo se combinan los ejecutores.

**Qué confirma o refuta:** la tabla de veredicto de ADR-098, punto 27, con las dos filas nuevas de los puntos 43 y 45. Lo no verificado no se da por bueno: meta, no regresión y salvaguarda pueden resultar cumplidas, incumplidas o no evaluables. **Orden:** falta de ejecución; rama de respaldo; meta no alcanzada; no regresión rota; «Criterio sin evaluar por registros incompletos»; sin atribución suficiente; costo excedido; «Criterio cumplido». Un incumplimiento concluyente prevalece sobre la incertidumbre.

**Regla de ejecutores:**
1. El veredicto lo da **`build`**, en el brazo indicado (ADR-093, §3). No se suman ni promedian ejecutores: comparten modelo y sus resultados son réplicas dependientes.
2. **Charles es la réplica.** Se calcula igual, con sus propias tolerancias. La réplica compara el **resultado operativo** de los dos ejecutores (meta, no regresión y salvaguarda), sin la atribución temporal, que es exclusiva de `build`, de modo que los dos se juzgan con el mismo criterio. Si los tres componentes coinciden, **«replicado»**. Si difieren, el veredicto se publica con la leyenda **«no replicado con Charles»**, con el detalle por problema. Si alguno no es evaluable, **«réplica no evaluable»**. Si no se midió, **«sin réplica»**. La leyenda no cambia el veredicto.
3. Con «Criterio cumplido» y la leyenda «no replicado», la conformidad de la referente se pide mostrándole esa leyenda, porque Charles es el agente de su equipo.
4. **Alcance:** el veredicto vale para el procedimiento con `build`. No se afirma utilidad para el equipo de la referente si Charles no replica o no se mide; esa validación queda pendiente, y la conformidad de la referente no la reemplaza.

**Cobertura si faltan tandas:**

| Falta | Consecuencia |
|---|---|
| Algún par de `build` indicado (E1, E2, E4), detección o reservado en los dos brazos, después de agotar la continuación por cuota | **Meta sin evaluar por falta de ejecución.** Se describe lo medido; no hay veredicto parcial |
| Problema con `registro_incompleto` también al repetirlo una vez (punto 2), en la línea de base o en `indicado` | «No evaluable»: sale de T, sin bajar la meta de 4 de 5, y cuenta como mejora no acreditada (punto 45). Una ejecución incompleta **sin** su repetición es pendiente, no «no evaluable» |
| Un brazo descriptivo incompleto (`disponible`, `probar`, control) | Se informa por brazo y no altera el universo principal |
| Reservado sin registro válido en cualquiera de sus dos brazos, después de repetir | «Criterio sin evaluar por registros incompletos»; no excluye problemas de E2 |
| Problema no evaluable fuera de los cinco | El universo sigue en 38. Si un desconocido puede superar una tolerancia o ser una exposición, «Criterio sin evaluar por registros incompletos» |
| Archivos del proyecto fuera de la configuración tocados en una ejecución, por ejemplo al probar un permiso de edición (punto 46) | No falta nada: la ejecución vale en todos los brazos, y se informa por brazo, problema y archivo. Es descriptivo y no entra en el veredicto |
| Brazo con instrucción de probar | Se declara como la principal amenaza a la validez (punto 21) |
| Charles | «Sin réplica». Se declara como cambio frente a «mismos ejecutores» de I.3.4 |
| Brazo disponible o contraste | Se omiten y se declara frente a ADR-093, §6 |

## 7. Texto de las instrucciones

Textos exactos en `ecologica/final/instrucciones/`. Se insertan después de la línea de la documentación. El bloque fue escrito sin nombrar el mecanismo. La sintaxis va en el texto porque `rige --help` falla en `congelada` (`argumentos-invalidos`), y agregarlo cambiaría el producto, limitado por la decisión del autor del 04/11/2026 a pruebas y herramientas.

**RIGE indicado, ecológica:**

```text
En este equipo está instalado RIGE, que informa qué decisión de permiso y qué valor de configuración rigen en OpenCode 1.18.25 y qué declaración los determina. Antes de declarar terminado el cambio, verificalo con RIGE. Si el resultado no coincide con lo pedido, corregí la configuración y volvé a verificar.
    rige permiso --proyecto <ruta del proyecto> --agente <agente> --herramienta <herramienta> --objetivo <archivo o comando>
    rige valores --proyecto <ruta del proyecto> --agente <agente> --clave <clave>
    rige hallazgos --proyecto <ruta del proyecto> --explicar
```

**Instrucción de probar, sin RIGE:**

```text
Antes de declarar terminado el cambio, probá su efecto ejecutando OpenCode como el desarrollador. Leer la configuración no cuenta como prueba: observá qué hace OpenCode al intentar la acción. Si el efecto no coincide con lo pedido, corregí la configuración y volvé a probar.
    como-dev 'opencode run --agent <agente> "<pedido que obligue a intentar la acción>"'
```

Los dos piden verificar antes de cerrar y corregir si no coincide. **No son equivalentes, y se declara:** RIGE ofrece consultas estructuradas y diagnóstico; probar obliga a diseñar un pedido y a ejecutarlo en otra sesión, con la advertencia de que leer la configuración no alcanza. La comparación es entre esos dos procedimientos asistidos, no entre una herramienta y nada. Ninguno de los textos nombra la ruta absoluta. `run --agent` consta en el código del tag (`cli/cmd/run.ts:170`) y se ejercita en el ensayo.

## 8. Orden de las tandas

Corrige la sección 3 del plan, que omitía E4, el brazo disponible y el contraste.

| Prioridad | Tanda | Ejecuciones | Por qué |
|---:|---|---:|---|
| 1 | `build`: banco con RIGE indicado (138), detección indicada (33), reservado con RIGE indicado (12) y sin RIGE (12), y control contemporáneo de los cinco problemas sin RIGE (15; punto 43) | 210 | Sin esto no hay veredicto |
| 2 | `build`, instrucción de probar, sin RIGE, E1 y E2 | 129 | Principal amenaza a la validez |
| 3 | Charles: mismas tandas que la prioridad 1, sin el control contemporáneo | 195 | Réplica |
| 4 | `build`: brazo disponible (138) y contraste indicado (30) | 168 | ADR-093, §6; descriptivos |

Total: 702 ejecuciones, frente a 402 de la línea de base. La cuota necesaria no se conoce: el primer tramo se usa para estimarla.

**Comparación histórica.** El banco se compara con octubre, y la intervención es el paquete «RIGE más la instrucción de verificar»: no se atribuye a la herramienta aislada. **Control contemporáneo (punto 43):** los cinco problemas corren también sin RIGE y con la instrucción original, 15 ejecuciones, solo con `build`. Se mide con el mismo resultado que el brazo indicado: un problema **resuelto** sin RIGE en noviembre no cuenta como mejora atribuible; abandonar sin RIGE no invalida nada. Son dos juicios separados: el resultado operativo (¿se resuelven 4 de 5 con RIGE?) y la atribución (¿cuántos de ellos no se resuelven ya sin RIGE?). Si se cumple el resultado operativo y quedan menos de 4 atribuibles, el veredicto es **«Meta alcanzada sin atribución suficiente»**, y no «Criterio cumplido». Se controla el cambio temporal en esos cinco, no en el resto del banco.

**Interpretación del brazo con instrucción de probar.** Se juzga con el mismo resultado y el mismo filtro de atribución que el brazo indicado. Si alcanza la meta con atribución suficiente, la reducción no se atribuye a RIGE, y la comparación se limita a lo medido: el costo de indicado sobre probar, con su valor (el aporte en costo se afirma solo si esa mediana es menor que 1), y el diagnóstico de la sección 11.

## 9. Adjudicación manual

Criterio, muestra, planilla y cálculo, fijados antes de adjudicar: `adjudicacion/CRITERIO-muestra.md`. La adjudicación la hace el autor.

## 10. Lecturas descriptivas

Todas salen de `herramientas/analizar_final.py`, con sus condiciones de omisión: tasa de reglas con ruta absoluta (punto 23), fuente leída antes de escribirla (punto 25), productividad (punto 28), lectura con 1 de 3, preregistrada y sin colateral, consecuencia y proceso. Contraste fuera del árbol: informe separado.

**Corregidos al primer intento:** problema de los cinco cubiertos con, en al menos 2 de 3 repeticiones, objetivo logrado, sin éxito falso y sin editar la configuración después de la primera consulta a RIGE. Se informan también las ejecuciones.

## 11. Diagnóstico de RF-07 frente a la instrucción de probar

Unidad: cada uno de los cinco problemas cubiertos. Evidencia mecánica, sin adjudicación manual, sobre la versión medida y sin agente. **Acreditado** si, sobre la forma con ruta absoluta, RIGE informa la causa `ruta-absoluta-con-forma` y la forma relativa que informa produce la decisión pedida en OpenCode. Por traza se informa además en cuántas ejecuciones con RIGE indicado el agente recibió ese hallazgo. Probar no ofrece este diagnóstico por construcción: es una capacidad del producto, y **no se afirma** que el agente corrija mejor por ella salvo que lo muestren los resultados.

## 12. Instrumento

La medición corre sobre la imagen `rige-linea-base:1.18.25` (`a691196f0e3e`), la misma de la línea de base, sin reconstruirla. RIGE entra como binario compilado de la etiqueta con `bun build --compile`, copiado al contenedor con su SHA-256 registrado. El arnés se copia al iniciar el contenedor (`verificacion/20261105-med19/README.md`). Resultados del ensayo y de la admisión: `LEEME.md`.
