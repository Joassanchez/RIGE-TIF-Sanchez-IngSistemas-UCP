# ADR-077 — Cap. X como análisis de costos completo: costo económico separado del desembolso, imputación por quién paga, CAPEX/OPEX, amortización del equipo, energía, doble moneda y punto de equilibrio del sostenimiento

- Estado: aceptado (01/10/2026); consolidado el 22/10/2026 con ADR-076 (absorbidos al final, con su texto completo); aceptado por el autor el 22/10/2026
- Fecha: 01/10/2026
- Capítulos afectados: Cap. X (X.1 a X.5); Cap. IV (IV.1, fila «Estructura de costos» del lienzo); Instrumento 34 (34.1, 34.2 y 34.3); Anexo III (D-48, D-49 y una D nueva); bibliografía
- Origen: correcciones del docente al Cap. X, transmitidas por el autor en la sesión del 01/10/2026 (degradación y costo del equipo del desarrollador; agua, luz y alquiler, subsidiados por el espacio; CAPEX/OPEX; punto de equilibrio; recursos tecnológicos con alternativas), y elecciones del autor en la misma sesión
- Modifica: ADR-076, eje X (estructura de X.3) y su consecuencia «Claude Pro sin costo atribuible»; Anexo III, D-49 (asistente sin costo atribuible). Los ejes F y V de ADR-076, las tarifas congeladas y el costo de hora siguen vigentes
- Relacionado: ADR-052 (190 h; fase de cierre de 48 h aparte), ADR-057 (ejes L y S), ADR-054 (equipo y entorno de referencia), Anexo III, D-18 (sin valoración monetaria del problema)

### Contexto

- El Cap. X vigente es un inventario de recursos con precio, no un análisis de costos. Declara la «inversión inicial» nula (`informe/cap-10/X.3-recursos-financieros.md`), lo que confunde **desembolso** con **costo**: hay un equipo que se desgasta, energía y un espacio que alguien paga.
- No existe un costo total del proyecto: las cifras en pesos y en dólares se mantienen separadas a propósito (Instrumento 34, nota al pie de 34.1).
- El punto de equilibrio figura como «No corresponde», y el docente lo pidió.
- Claude Pro figura «sin costo atribuible» (D-49), aunque lo paga el autor y lo usa el proyecto.
- La consigna admite el punto de equilibrio «si el proyecto contempla explotación» (`catedra/AE2-plantilla-informe.md`, X.3), y la guía juzga el capítulo «por la coherencia con la planificación, no por la precisión de los precios» (`catedra/AE2-guia.md`, §7). Las horas (190) no cambian, así que la coherencia con el Cap. V se conserva.
- **El período del proyecto es del 21/09 al 14/11/2026** (Tabla 17, `03-requisitos/libro/iteraciones.md`), ocho semanas, más la fase de cierre de las semanas 15 y 16. Toda partida que se mida por meses tiene que justificar su relación con ese período.
- **El equipo trabaja más horas que el autor.** La línea de base se ejecuta con agentes durante uno o dos días (ADR-053), y la medición final también. Son horas de máquina sin horas del autor.
- Para los recursos humanos, la consigna pide justificar «la relación entre horas asignadas y requisitos comprometidos» (`catedra/AE2-guia.md`, §7). La Tabla 18 da las horas por iteración y por requisito.
- En X.4, las filas de Trello, el oráculo, los dos asistentes y matplotlib tienen «—» o «No corresponde» en la alternativa y el criterio de descarte, aunque la consigna los exige para cada elección.

**Datos reunidos el 01/10/2026** (dato del repositorio, con ruta):

| Dato | Valor | Fuente o evidencia |
|---|---|---|
| Tipo de cambio | Billete vendedor BNA $1.545 por USD (01/10/2026, 17:00) | `bna-cotizaciones`; `01-relevamiento/evidencia/bna-cotizaciones_20261001.html` |
| Valor de reposición del equipo | $2.200.000 («Mejor precio» publicado; caja abierta, última unidad), USD 1.423,95. Mismo modelo y configuración del equipo del autor | `mudi-notebook-book3` (no verificable en línea: HTTP 403); `01-relevamiento/evidencia/mudi-notebook-book3_20261001.png` |
| Compra del equipo | Enero de 2025 (declaración del autor) | Sesión del 01/10/2026 |
| Batería | 48.371 / 54.362 mWh (88,98 %), 409 ciclos; semana 30/08–06/09: 48.892 mWh | `01-relevamiento/evidencia/reporte-bateria_20261001.html` |
| Uso activo del equipo | 138,5 h entre el 30/08 y el 30/09 (49,8 h a batería, 88,6 h con cargador) | Mismo reporte, sección *Usage history* |
| SSD (SMART) | Samsung MZVLQ512HBLU; Percentage Used 5 %; Data Units Written 42.956.846 (21,9 TB); Power On Hours 1.355; salud PASSED | `01-relevamiento/evidencia/PRIV/20261001-smart-ssd.png` (excluida del repositorio) |
| Energía | Factura de abril–mayo de 2026 (cuadro tarifario 633), 116 kWh, $45.436,68. Energía $253,573/kWh; Ley provincial 2620/89 1,5 % sobre energía + cuota de servicio; FNEE $264,13; IVA 21 % no computable | Factura del suministro del lugar de trabajo, en `01-relevamiento/evidencia/PRIV/` (la copia el autor) |
| Potencia instantánea | 7,7 W a batería con carga liviana (una muestra, `BatteryStatus.DischargeRate`) | Medición del ingeniero, 01/10/2026 |
| ChatGPT Plus | USD 20 mensuales (lista); cobro real del 30/09: $33.135,34 a $1.656,77 por USD | `openai-chatgpt-precios`; `01-relevamiento/evidencia/PRIV/20260930-comprobante-chatgpt-plus.jpg` |
| Claude Pro | USD 20 mensuales con facturación mensual, impuestos aparte | `anthropic2026precios` (actualizada el 01/10/2026) |
| Costo de hora | $8.876 (Sysarmy 2026.01, mediana bruta junior ÷ 173,33 h) | `sysarmy2026`; ADR-076 |
| Cadencia de OpenCode | 227 releases estables del 01/01 al 30/09/2026 (1.0.222 a 1.18.34); mediana de 15,5 h entre releases; 9 series menores nuevas. Cambios de configuración, permisos o agentes declarados en las notas: 43 confirmados y 23 posibles (3 y 4 entre julio y septiembre). Cuántos obligan a readaptar RIGE: sin determinar | `opencode-releases-api`, `opencode-releases-semantica`; investigación de Codex del 01/10/2026 |

### Alternativas evaluadas

**Eje B · Base del análisis**
- **B-A:** inventario de recursos por partida de la plantilla, sin consolidar (vigente, ADR-076 eje X).
- **B-B:** análisis de costos con **costo económico** y **desembolso** separados, un costo total consolidado y, para cada partida, quién la soporta.

**Eje I · Criterio de imputación**
- **I-A:** imputar solo lo que el autor desembolsa.
- **I-B:** imputar todo recurso consumido que **alguien paga** (el autor, el grupo familiar), con lo gratuito en $0 y los aportes de terceros como aporte en especie. Se valoriza solo lo que tiene fuente; lo demás se declara sin valorizar.
- **I-C:** imputar todo, incluso lo gratuito, a precio de mercado del plan pago equivalente.

**Eje C · Clasificación CAPEX/OPEX**
- **C-A, por finalidad:** todo lo del período es CAPEX de construcción; el OPEX es solo el sostenimiento posterior.
- **C-B, por naturaleza:** solo las **136 h técnicas** son CAPEX, porque producen el activo RIGE. Las **54 h de reserva** (informe, línea de base, Caps. VI y IX), las suscripciones, la energía y la amortización del equipo preexistente son OPEX del período: son costo del proyecto, pero no construyen el software. La readaptación ante versiones nuevas es OPEX posterior.

**Eje E · Equipo del desarrollador**
- **E-A:** sin costo (vigente: «bien propio y preexistente»).
- **E-B:** amortización lineal sobre el **valor de compra**.
- **E-C:** amortización lineal sobre el **valor de reposición**, expresada como **costo por hora de uso medida** y aplicada a las horas del proyecto en el equipo (las del autor más las de ejecución desatendida de las mediciones); degradación de batería y disco medida como evidencia, sin monetizarla aparte.

**Eje S · Espacio y servicios**
- **S-A:** proxy de mercado (puesto de coworking en Posadas) para espacio, energía, agua e internet.
- **S-B:** energía calculada con la factura; espacio, agua e internet como aporte en especie del grupo familiar, sin valorizar.

**Eje M · Moneda**
- **M-A:** pesos y dólares separados, sin conversión (vigente).
- **M-B:** cada cifra en pesos y en dólares con un único tipo de cambio fechado.

**Eje U · Suscripciones**
- **U-A:** cobro real según el comprobante.
- **U-B:** precio de lista × tipo de cambio único.

**Eje P · Punto de equilibrio**
- **P-A:** «No corresponde», por falta de explotación (vigente).
- **P-B:** sobre el valor: consultas o usuarios necesarios para recuperar el costo con el tiempo ahorrado.
- **P-C:** sobre el sostenimiento: el patrocinio anual que cubre el OPEX posterior de readaptación.

**Eje Q · Política de mantenimiento (base del punto de equilibrio)**
- **Q-A:** seguir cada versión con cambio declarado de configuración, permisos o agentes.
- **Q-B:** una intervención por serie menor nueva.
- **Q-C:** una intervención trimestral que agrupa los cambios acumulados.

**Eje T · Alternativas tecnológicas en X.4**
- **T-A:** tabla de la plantilla en el cuerpo, con alternativa y criterio de descarte por fila (vigente).
- **T-B:** elecciones en el cuerpo y alternativas en un anexo.

**Eje R · Reserva de contingencia**
- **R-A:** reserva monetaria de contingencia, como porcentaje del costo total.
- **R-B:** contingencia por alcance: capacidad fija y alcance variable (Tabla 19), sin reserva monetaria.

### Análisis (trade-offs)

**Eje B.** B-A sigue la plantilla al pie de la letra, pero el docente objetó la base: un capítulo que llama «nula» a una inversión que consume equipo, energía y espacio no resiste la pregunta «¿cuánto cuesta el proyecto?». B-B responde esa pregunta y conserva las partidas de la plantilla como estructura (conocimiento general: separar costo económico y flujo de fondos es la práctica habitual de un análisis de costos).

**Eje I.** I-A deja fuera lo que el docente pidió incluir (lo que paga la familia). I-C infla el costo con precios que nadie paga y obliga a elegir un plan pago arbitrario para cada servicio gratuito. I-B es un criterio único y verificable que resuelve cada partida sin discusión caso por caso: GitHub, Trello y Docker van en $0; la energía se imputa al grupo familiar; Claude Pro se imputa al autor.

**Eje C.** C-A es coherente con la contabilidad de un intangible en desarrollo, pero deja el OPEX del período vacío, y el docente pidió ver la distinción. C-B coincide con la lectura habitual de CAPEX (inversión en activos) y OPEX (gastos recurrentes), y separa lo que se invierte una vez de lo que se repite.
- Tratar las 190 h como CAPEX sería impreciso: las 54 h de reserva producen el informe y la validación del TIF, no el software. Separarlas responde la pregunta «¿cuánto costó construir RIGE?» ($1.207.136) por separado de «¿cuánto costó el proyecto?».
- Su costo es que la amortización del equipo, consumo de un activo preexistente, se presenta como gasto del período, lo cual se declara.

**Eje E.**
- E-A contradice la corrección del docente.
- E-B usaría un valor de enero de 2025 en pesos, sin comprobante en el repositorio y deteriorado por la inflación.
- E-C mide lo que el proyecto consume de una capacidad que habría que reponer. Usa un precio fechado del mismo modelo y un uso medido, no supuesto.
  - **Costo por hora de uso:** $2.200.000 ÷ 36 meses = $61.111,11 por mes; ÷ 138,465 h activas por mes (medidas entre el 30/08 y el 30/09) = **$441,35 por hora** (USD 0,29). Expresada así, la amortización no depende de cuántos meses se cuenten: con 190 h da $83.856, igual que el prorrateo mensual, pero no exige alinear meses calendario con un período que va del 21/09 al 14/11.
  - **Horas del proyecto en el equipo:** las 190 h del autor más las horas de ejecución desatendida de la línea de base y de la medición final, registradas en la bitácora. Prorratear solo por las horas del autor subestimaría el uso del equipo, que ejecuta agentes uno o dos días seguidos sin intervención.
  - El equipo tiene entre 20 y 22 meses en el período, dentro de la vida útil de 3 años, así que no surge la objeción del equipo totalmente amortizado.
  - La degradación medida en un mes es indistinguible del ruido: la capacidad semanal de la batería oscila ±500 mWh, frente a 521 mWh perdidos en septiembre. Monetizarla además de la amortización contaría dos veces el mismo desgaste. Se informa como evidencia: inicio y fin del período para la batería (capacidad, ciclos) y el disco (Percentage Used, Data Units Written).
  - Límite de la fuente: es una oferta de caja abierta de un único vendedor, que tiende a subestimar el valor de reposición. Para amortizar es el error conservador, y se declara.

**Eje S.** S-A cubre todo con una sola fuente, pero era un dato aún no relevado. S-B, elegido por el autor, calcula la energía con un comprobante real. Usa el **costo marginal** por kWh ($314,18 = [$253,573 × 1,015 + $2,277 de FNEE] × 1,21) y no el promedio de la factura ($391,70/kWh), porque la cuota de servicio y el alumbrado público se pagan con o sin el proyecto. El alumbrado se trata como cargo fijo, lo que es una suposición. El orden de magnitud es de $600 a $1.200 (190 h a 10–20 W): una partida menor que se informa igual. El agua y el espacio no tienen fuente de valorización y se declaran como aporte en especie sin valorizar, en lugar de inventarles un monto.

**Eje M.** M-A impide sumar y es lo que hoy deja al capítulo sin total. M-B exige un tipo de cambio con fuente y fecha, que ahora existe. Se toma el billete vendedor porque es el que paga una persona, y se usa uno solo en ambas direcciones para que el diferencial entre compra y venta no distorsione.

**Eje U.** U-A refleja el costo real (el comprobante de ChatGPT muestra un tipo un 7,2 % mayor que el BNA), pero introduce un segundo tipo de cambio y no existe comprobante de Claude Pro. U-B, elegido por el autor, mantiene una sola conversión. El comprobante queda como evidencia del pago y la diferencia se declara en una nota.

**Eje P.** P-A no responde al pedido del docente. P-B contradice D-18: el Anexo III renuncia a valorizar el problema en dinero porque los parámetros (frecuencia, tiempo por consulta) no lo sostienen. Un punto de equilibrio sobre el valor reintroduciría esa cifra por otra vía. P-C es coherente con IV.1 (sostenimiento por licencia abierta y patrocinio por hito) y responde una pregunta real: cuánto patrocinio anual hace falta para que RIGE se mantenga. Usa la cota de readaptación de X.5 (4 a 22 h por versión; $35.504 a $195.272).

**Eje Q.** La investigación del 01/10/2026 muestra que el punto de equilibrio depende de una política de mantenimiento y no de la cadencia del proveedor:

| Política | Intervenciones por año | Patrocinio anual (4 a 22 h por intervención) | USD |
|---|---|---|---|
| Q-A · cada versión con cambio declarado (ventana enero–septiembre) | 58 a 89 | $2.059.232 a $17.379.208 | 1.332,84 a 11.248,68 |
| Q-B · una por serie menor | ≈ 12 | $426.048 a $2.343.264 | 275,76 a 1.516,68 |
| Q-C · trimestral, agrupando cambios | 4 | $142.016 a $781.088 | 91,92 a 505,56 |

- **Q-A es inviable:** sostener RIGE un año costaría entre una y nueve veces el costo del proyecto ($1.925.691). Con la ventana julio–septiembre (12 a 28 por año) el rango baja a $426.048–$5.467.616, y sigue siendo desproporcionado. Además, «cambio declarado en las notas» no equivale a «obliga a readaptar»: el número real es menor y está sin determinar. Q-A se presenta como sensibilidad, porque cuantifica por qué la versión congelada (L-05) es la única opción viable y da sustento numérico al poder de negociación del proveedor (IV.3).
- **Q-B** ata el mantenimiento a la numeración del proveedor, que no indica por sí misma un cambio de semántica (la serie 1.18 lleva 34 parches y 3 cambios confirmados en tres meses).
- **Q-C** es la práctica habitual de un proyecto abierto ante un proveedor que publica cada 15,5 horas: agrupar los cambios en intervenciones (conocimiento general). Se valoriza con la cota alta de 22 h, porque una intervención que agrupa tres meses de cambios va a estar cerca del máximo. Da un punto de equilibrio comunicable: **$781.088 por año, unos $65.091 por mes (USD 42,13)**.

**Eje T.** La plantilla de X.4 trae las columnas «Alternativa evaluada» y «Criterio de descarte», y la consigna dice que X.4 es lo que la dimensión 5 lee con más atención. El autor decidió seguir la consigna: todo en el cuerpo (T-A). Hay dos faltas:
- Falta el **motivo**, que la consigna exige y la tabla vigente no muestra. Va dentro de la celda «Elección», sin agregar columnas a la plantilla.
- Ninguna fila debe quedar con «—» o «No corresponde»:
  - **Trello:** alternativa «otro tablero (GitHub Projects)»; criterio «impuesto por la consigna». Una restricción externa es un criterio de descarte válido, y es mejor escribirla que dejar un guion.
  - **Oráculo:** alternativa «resultados de referencia escritos a mano desde la documentación»; criterio «la documentación describe un modelo incompleto (III.1) y no se puede ejecutar».
  - **Asistentes:** alternativa «trabajar sin asistente u otro asistente». El criterio de cada uno sale de D-49 y ADR-067.
  - **matplotlib:** alternativas «gráficos de la planilla de cálculo o Mermaid»; criterio «reproducibilidad de las figuras por guion versionado».

**Eje R.** R-A es lo habitual en un presupuesto con alcance fijo, donde un imprevisto se paga con más horas o más dinero. En este proyecto la capacidad es fija (190 h de un solo autor, sin financiamiento) y el alcance es variable: la cláusula de la Tabla 19 posterga funciones hasta 45 h, en un orden decidido de antemano. Una reserva monetaria no tendría quién la pagara ni en qué gastarse. R-B dice lo que el proyecto efectivamente hace, y responde de antemano la pregunta «¿dónde está la contingencia?».

### Recomendación y fundamento

**B-B + I-B + C-B + E-C + S-B + M-B + U-B + P-C + Q-C + T-A + R-B.** El capítulo pasa de inventario a análisis de costos con un criterio de imputación único. Cada cifra tiene fuente fechada o medición propia, y lo que no tiene fuente se declara sin valorizar.

**Costo del proyecto (período del 21/09 al 14/11/2026), a $1.545 por USD:**

| Concepto | Clase | Monto | USD | Quién lo soporta | Desembolso | Estado |
|---|---|---|---|---|---|---|
| Horas técnicas del autor, 136 h × $8.876 | CAPEX | $1.207.136 | 781,32 | Autor (costo de oportunidad) | No | Firme |
| Horas de reserva documental y de validación, 54 h × $8.876 | OPEX | $479.304 | 310,23 | Autor (costo de oportunidad) | No | Firme |
| Amortización del equipo: $441,35 por hora de uso × horas del proyecto en el equipo | OPEX | ≈ $83.856 (190 h) | ≈ 54,28 | Autor | No | Provisorio: faltan las horas de ejecución desatendida |
| Energía: horas del proyecto en el equipo × potencia media × $314,18/kWh | OPEX | ≈ $895 (190 h, 15 W) | ≈ 0,58 | Grupo familiar (en especie) | No (para el autor) | Provisorio: potencia y horas desatendidas por medir |
| ChatGPT Plus, octubre y noviembre: 2 × USD 20 | OPEX | $61.800 | 40,00 | Autor | Sí | Firme |
| Claude Pro, septiembre a noviembre: 3 × USD 20 | OPEX | $92.700 | 60,00 | Autor | Sí | Firme |
| Espacio, agua e internet | OPEX | Sin valorizar | — | Grupo familiar (en especie) | No (para el autor) | Declarado; internet se valoriza como la energía si el autor aporta la factura |
| Tiempo de la referente (sesión del 26/09/2026, 35 min) | — | Sin valorizar | — | Su organización, si fue en horario laboral (aporte de terceros) | No | Declarado |
| GitHub, Trello, Docker Desktop, herramientas MIT | — | $0 | 0 | Gratuito | No | Firme |
| **Total** | | **≈ $1.925.691** | **≈ 1.246,40** | | **$154.500 (USD 100)** | |
| *de lo cual, CAPEX (construcción de RIGE)* | | *$1.207.136* | *781,32* | | | |

- **Suscripciones:** el precio de lista excluye impuestos. El cobro real de ChatGPT del 30/09 fue un 7,2 % mayor ($33.135,34 contra $30.900), por el tipo de cambio que aplicó el medio de pago. Se declara en una nota de la tabla.
- **Meses completos contra un período de ocho semanas:** se pagan meses enteros. Noviembre se justifica porque cubre también la fase de cierre y la medición final (ADR-052, ADR-053); septiembre, por el inicio del período el 21/09. Se declara en el texto.
- **Aparte, como en ADR-052:** fase de cierre, 48 h × $8.876 = $426.048 (USD 275,76).
- **OPEX posterior:** readaptación de $35.504 a $195.272 por versión (USD 22,98 a 126,39).
- **Punto de equilibrio del sostenimiento (Q-C):** patrocinio anual ≥ 4 intervenciones × 22 h × $8.876 = **$781.088 (USD 505,56), unos $65.091 (USD 42,13) por mes**. Q-A y Q-B se presentan como sensibilidad.
- **Contingencia (R-B):** sin reserva monetaria. La cláusula de la Tabla 19 posterga funciones hasta 45 h; se dice explícitamente en X.3.

**Costo por iteración** (X.1; responde la relación entre horas y requisitos comprometidos, con las horas de la Tabla 18):

| Iteración | Requisitos (Tabla 14) | Horas | Costo | USD |
|---|---|---|---|---|
| 1 · v1 | RF-01, RF-17, RNF-01, RNF-03, RNF-09 | 35 | $310.660 | 201,07 |
| 2 | RF-02, RF-03, RF-06, RF-08, RF-09, RF-16, RNF-10 | 60 | $532.560 | 344,70 |
| 3 | RF-04, RF-05, RF-07, RNF-02, RNF-04, RNF-05 | 30 | $266.280 | 172,35 |
| 4 · estabilización | Ninguno nuevo; acreditación de RNF-06 y RNF-07 | 11 | $97.636 | 63,19 |
| Reserva documental y de validación | No se asigna a requisitos | 54 | $479.304 | 310,23 |
| **Total** | | **190** | **$1.686.440** | **1.091,55** |

**Flujo de desembolso mensual** (X.3):

| Mes | Concepto | Monto | USD |
|---|---|---|---|
| Septiembre | Claude Pro | $30.900 | 20 |
| Octubre | Claude Pro y ChatGPT Plus | $61.800 | 40 |
| Noviembre | Claude Pro y ChatGPT Plus | $61.800 | 40 |
| **Total** | | **$154.500** | **100** |

El desembolso es el 8 % del costo del proyecto; el resto es costo de oportunidad y aportes en especie. Es una conclusión del capítulo, no solo un dato.

**Procedimiento de medición pendiente:**
1. **Potencia media.** Muestreo de `DischargeRate` (WMI `root/wmi:BatteryStatus`) cada 30 s durante una sesión de trabajo real a batería, con Docker y un agente en ejecución. Se suma un margen por pérdidas del cargador, declarado como suposición.
2. **Horas de ejecución desatendida.** Inicio y fin de cada corrida de la línea de base (02/10 al 16/10) y de la medición final, registrados en la bitácora.
3. **Cierre del período (fines de noviembre).** Reporte de batería nuevo y `smartctl -a /dev/nvme0`:
   - horas activas reales de octubre y noviembre, que recalculan el costo por hora de uso;
   - variación de capacidad y ciclos de la batería;
   - variación de Percentage Used y Data Units Written del disco.

**Lo que no cambia:**
- el costo de hora (sin actualizar, por decisión del autor; el texto declara su período, diciembre de 2025 a febrero de 2026, y que es salario bruto sin contribuciones patronales);
- las 190 h y la coherencia con el Cap. V;
- los ejes F y V de ADR-076 y las tarifas congeladas.

**Condiciones que invalidarían la decisión:**
1. **La medición de cierre muestra degradación significativa** del disco o la batería atribuible al proyecto (por ejemplo, un aumento de Percentage Used mayor que el que la amortización lineal implica para el período). En ese caso se revisa E-C y se evalúa monetizar la degradación por separado.
2. **Una intervención trimestral supera las 22 h**, por ejemplo si en tres meses se acumula una reestructura de permisos como la de 1.1.1 a 1.1.3. Se revisa la cota de X.5 y se recalcula el punto de equilibrio.
3. **El docente objeta el costo marginal de la energía** o pide valorizar el espacio. Se pasa a S-A con una fuente de coworking.
4. **La publicación del equipo resulta inválida** (otro modelo u otra configuración). Se reemplaza por el modelo sucesor en la tienda oficial de Samsung, declarado como equivalente.

### Decisión del autor

**Aceptado por el autor el 01/10/2026**, con delegación expresa al ingeniero de las decisiones de redacción necesarias para el capítulo. Elecciones expresadas por el autor en la sesión del 01/10/2026, que el ADR recoge:
- costo de hora sin actualizar;
- energía calculada con la factura (S-B);
- X.4 según la consigna, todo en el cuerpo (T-A);
- período de imputación de septiembre a noviembre;
- valor del equipo con la publicación `mudi-notebook-book3`;
- compra en enero de 2025;
- vida útil de 3 años como supuesto declarado;
- doble moneda con el billete vendedor BNA del 01/10/2026 (M-B);
- suscripciones a precio de lista × BNA para ambas (U-B);
- comprobantes con datos personales en `01-relevamiento/evidencia/PRIV/`, excluida por `.gitignore`.

El autor eligió Q-C el 01/10/2026. Los ejes B, I, C, E, P y R los propuso el ingeniero; el autor pidió incorporar al ADR, el 01/10/2026, la separación de las horas técnicas (CAPEX) y de reserva (OPEX), el costo por hora de uso con las horas desatendidas, el costo por iteración, el flujo mensual, la contingencia por alcance, las alternativas de X.4 sin guiones y las partidas menores.

### Precisión del 02/10/2026 · revisión del capítulo (decisión del ingeniero con delegación del autor)

La revisión del capítulo redactado (consigna, consistencia, fuentes y crítico) precisó, sin cambiar los ejes:
- **Punto de equilibrio formal:** ingreso anual por patrocinio igual al costo anual de sostenimiento, que suma las horas (4 × 22 h × $8.876 = $781.088), la amortización del equipo de esas 88 h ($38.839) y su energía ($276 a $553): **$820.203 a $820.480 por año (USD 530,88 a 531,05), unos $68.360 por mes (USD 44,25)**. Ningún patrocinio está asegurado.
- **Coherencia entre Q-A y Q-C:** la cota baja (4 h, regenerar y verificar el oráculo) es un trabajo fijo por intervención; seguir cada versión lo paga por cambio y agrupar lo paga una vez por trimestre. Q-A se muestra con dos ventanas: enero a septiembre (58 a 89 por año) y julio a septiembre (12 a 28 por año, $426.048 a $5.467.616). Las cotas salen de la Tabla 18: 4 h = oráculo; 22 h = oráculo + adaptador (8 h) + evaluador (10 h).
- **Perímetro único:** el costo del período incluye las suscripciones de los meses calendario que el período toca; la fase de cierre (48 h, la medición final y su ejecución desatendida) va aparte. Costo con la fase de cierre: $2.351.739 (USD 1.522,16).
- **CAPEX/OPEX** es una clasificación económica y de gestión, no un tratamiento contable de activación.
- **Correcciones numéricas:** costo de hora USD 5,74; horas activas 138,465 h; sensibilidad de la vida útil (24 meses: $125.784; 48 meses: $62.892; ±2,2 %); cota de inmaterialidad de la energía (60 W al costo promedio: $4.465, el 0,23 %).
- **X.4:** Trello se conserva por estar publicado en los datos de identificación (la consigna exige un tablero, no Trello); Claude Code se justifica por la revisión cruzada entre modelos.

### Precisión del 02/10/2026 · canal de financiamiento (pedido del autor)

El punto de equilibrio se expresa también en cantidad de patrocinadores, con el canal identificado:
- **Canal adoptado: GitHub Sponsors.** Admite mantenedores individuales residentes en Argentina, no cobra comisión sobre los patrocinios de cuentas personales (las organizaciones pagan hasta un 6 % adicional, a su cargo) y el mantenedor fija niveles mensuales desde USD 1 (`github-sponsors-regiones`, `github-sponsors-alta`).
- **Descartado: Open Source Collective.** Cobra el 10 % como host, exige un repositorio bajo una organización y orienta a otras alternativas a los proyectos de una sola persona o con menos de USD 600 anuales (`osc-comisiones`, `osc-adecuacion`).
- **Cantidad:** con la meta de USD 44,25 por mes, 45 patrocinadores de USD 1, 9 de USD 5 o 5 de USD 10. El nivel es decisión del autor.
- **Excluido y declarado:** costos de cobro, conversión y retiro al banco argentino e impuestos, que dependen de la cuenta del autor y no se verificaron.

### Consecuencias

**Al aceptarse:**
- **X.1:** igual tabla, con los montos en USD; se declara el costo de hora como salario bruto de dic-2025/feb-2026 sin actualizar; se agrega la tabla de costo por iteración, con las horas técnicas como CAPEX y la reserva como OPEX.
- **X.2:** amortización del equipo sobre el valor de reposición, como costo por hora de uso medida aplicado a las horas del proyecto en el equipo (incluidas las de ejecución desatendida); degradación medida al inicio y al cierre como evidencia; energía con costo marginal; espacio, agua e internet como aporte del grupo familiar; suministro identificado solo como «del lugar de trabajo», sin titular ni dirección.
- **X.3:** se reescribe con la tabla de costo del proyecto (CAPEX/OPEX, quién soporta, desembolso), el flujo de desembolso mensual, la contingencia por alcance (sin reserva monetaria), el OPEX posterior y el punto de equilibrio del sostenimiento. La inversión inicial deja de ser «nula»: es el CAPEX de la construcción, $1.207.136. Se justifican los meses completos de suscripción frente al período de ocho semanas.
- **X.4:** el motivo entra en la celda «Elección»; ninguna fila queda con «—» o «No corresponde» (Trello, oráculo, asistentes, matplotlib, según el eje T); Claude Pro deja de figurar «sin costo atribuible» y remite a X.3.
- **X.5:** sin cambio de fondo; la readaptación remite al punto de equilibrio de X.3.
- **IV.1:** la fila «Estructura de costos» del lienzo se alinea con el total, la distinción CAPEX/OPEX y el costo de sostenimiento de Q-C.
- **IV.3 (corrección de un dato):** la fila «Poder de negociación de proveedores» dice que la incidencia 46873 «documenta un cambio en 1.18.26». Los archivos de resolución y permisos son idénticos entre 1.18.25 y 1.18.26 (comparación de tags del 01/10/2026). Se reformula como «regresión reportada en 1.18.26, sin confirmar la versión de introducción», y puede incorporar la cadencia (227 releases en nueve meses) como sustento cuantitativo.
- **Instrumento 34:** filas nuevas (amortización, energía, aporte en especie, Claude Pro con costo); 34.2 con las tres preguntas de cada cifra nueva (BNA, equipo, factura, Claude Pro); se elimina la nota «las cifras en dólares no se suman»; 34.3 sin cambios (190 h).
- **ADR-076:** el eje X pasa a «modificado por ADR-077»; la consecuencia «Claude Pro sin costo atribuible» queda sin efecto.
- **Anexo III:** D-49 se precisa (Claude Pro imputado al autor); D nueva con la deliberación de este ADR.
- **Bitácora:** registro de las horas de ejecución desatendida de cada medición.
- **Bibliografía:** `mudi-notebook-book3`, `bna-cotizaciones`, `anthropic2026precios` (actualizada), `opencode-releases-api` y `opencode-releases-semantica`.

### Evidencia

- `informe/cap-10/` (X.1 a X.5 vigentes), `instrumentos/instrumento-34-recursos.md`, `informe/cap-04/IV.1-definicion-negocios.md`.
- `catedra/AE2-plantilla-informe.md` (X.1 a X.5) y `catedra/AE2-guia.md` (§7).
- `01-relevamiento/evidencia/` (reporte de batería, captura del precio del equipo, copia de la página del BNA) y `01-relevamiento/evidencia/PRIV/` (SMART, comprobante de ChatGPT, factura de energía; excluida del repositorio).
- `01-relevamiento/fuentes.md`: `mudi-notebook-book3`, `bna-cotizaciones`, `anthropic2026precios`, `openai-chatgpt-precios`, `sysarmy2026`.
- Anexo III, D-18 y D-49; ADR-052, ADR-057 y ADR-076.

### Absorbido el 22/10/2026: ADR-076 — Medición con agentes sobre la suscripción ChatGPT Plus y modelos de OpenAI, consumo medido en tokens y valorizado a precio de lista como equivalente informativo; recursos financieros reestructurados sin tope de API

Texto completo del ADR absorbido, sin cambios salvo el nivel de los títulos. Su archivo se eliminó (queda en el historial de git).

- Estado: aceptado (01/10/2026)
- Fecha: 01/10/2026
- Capítulos afectados: Cap. X (X.3 completo; X.4, X.1); Cap. I (valorización del consumo por tokens, Ventana del AE1); diseño de la medición (`01-relevamiento/linea-base/DISENO-medicion-agentes.md`); Instrumento 34; Anexo III (D-41, D-48, D-49)
- Origen: corrección del Cap. X del autor (01/10/2026: «descartar el planteo actual», «la métrica debe ser el consumo de tokens», «suscripción mensual de aprox. USD 20, orientada a la familia de Codex») y elección del autor en la sesión del 01/10/2026: ChatGPT Plus, con el dato del autor de que OpenCode acepta esa suscripción como proveedor
- Reemplaza: ADR-057, eje T (tope de API de USD 50, carga de USD 20, regla de recorte) y sus consecuencias en X.3. **Modifica** ADR-053 en los modelos (tres modelos de Anthropic por API) y en el control del gasto (clave exclusiva conciliada con la consola)
- Modificado por: ADR-077 (eje X, estructura de X.3, y la consecuencia «Claude Pro sin costo atribuible»), aceptado el 01/10/2026; ADR-082 (modelos: `gpt-6-astra` y `gpt-6-luna` no disponibles con la suscripción en 1.18.25; medición con `gpt-6.1-sol` y P3 como tanda opcional), aceptado el 13/10/2026
- Relacionado: ADR-053 (diseño de la medición, criterio de 8 de 12 sobre el modelo principal), ADR-057 (ejes L y S, vigentes), ADR-067 (Codex sobre ChatGPT Plus como escritor)

#### Contexto

- ADR-053 mide con tres modelos de Anthropic por API (Opus 5.5 como principal, Sonnet 5 y Haiku 4.5), con OpenCode 1.18.25 como ejecutor. ADR-057 fija un tope de USD 50, una estimación de unos USD 75 y una regla de recorte que suprime modelos secundarios.
- El autor observa que X.3 presenta montos que no corresponden al proyecto (USD 50 a 100), con un esquema de desembolso incremental y costo económico que no se adapta a su naturaleza, y pide medir el consumo en tokens y sostener la medición con una suscripción mensual de unos USD 20.
- El autor ya paga ChatGPT Plus para Codex (ADR-067; AR-14) e informa que OpenCode acepta esa suscripción como proveedor. Ese dato se verifica en la documentación antes del piloto (condición 1).
- La medición ya registra tokens por caso como indicador (ADR-053; Ventana del AE1, §1).

#### Alternativas evaluadas

**Eje F · Fuente del consumo de modelos**
- **F-A:** API de Anthropic con clave exclusiva y tope de USD 50 (vigente, ADR-057).
- **F-B:** suscripción ChatGPT Plus, unos USD 20 mensuales, con modelos de OpenAI desde OpenCode.
- **F-C:** OpenCode Go (USD 10 o 40 según el plan), con modelos abiertos.
- **F-D:** Claude Pro (USD 20) desde OpenCode.

**Eje V · Valorización del consumo**
- **V-A:** gasto real por ejecución en dinero (tokens por precio, conciliado con la consola).
- **V-B:** tokens por caso como medida principal; valorización a precio de lista de la API como equivalente informativo, sin representar un desembolso.

**Eje X · Estructura de X.3**
- **X-A:** desembolso incremental y costo económico (vigente).
- **X-B:** las tres partidas de la plantilla: inversión inicial, costos recurrentes del período y punto de equilibrio (no corresponde), más el costo de oportunidad de las horas en una línea.

#### Análisis (trade-offs)

**Eje F**
- **F-A:** mide con los modelos del diseño aprobado, pero su costo variable (estimado por encima del tope) obliga a la regla de recorte y lleva al capítulo montos que el autor considera ajenos al proyecto.
- **F-B:** convierte un costo variable e incierto en uno fijo y conocido, y usa una suscripción que el autor ya emplea en el proyecto (Codex). Costos: cambia la familia de modelos medida, y con ella el modelo principal del criterio de éxito; la suscripción no expone un costo por ejecución, de modo que el gasto deja de conciliarse por consola y el consumo se registra en tokens desde las sesiones de OpenCode; el proveedor coincide con el del escritor del código (Codex), riesgo que ya mitiga ADR-053, porque los casos y la hoja de respuestas se verifican contra OpenCode 1.18.25 y la hoja no entra al entorno de medición.
- **F-C:** el más barato, pero los modelos abiertos del servicio no son los que usa el segmento relevado y obliga a reescribir el diseño con modelos poco documentados.
- **F-D:** conservaría la familia del diseño, pero el uso de la suscripción desde herramientas de terceros no está acreditado (suposición del ingeniero, no verificada).

**Eje V**
- **V-A:** con una suscripción no existe un costo por ejecución que medir.
- **V-B:** el token es la unidad que el consumo realmente tiene y la que ya registra la medición. La valorización a precio de lista da un orden de magnitud comparable y alimenta la valorización del Cap. I, siempre como equivalente y no como gasto.

**Eje X**
- **X-A:** la distinción es correcta pero abstracta para un proyecto sin flujo de fondos, y obliga a explicar por qué casi todo no se suma.
- **X-B:** sigue literalmente la plantilla (inversión inicial, costos recurrentes y punto de equilibrio si hay explotación) y se lee en una tabla.

#### Recomendación y fundamento

**F-B + V-B + X-B.** La suscripción hace el recurso financiero fijo, conocido y coherente con las herramientas que el proyecto ya usa. El consumo se informa en la unidad que la medición registra.

**Modelos** (búsqueda del 01/10/2026, documentación de OpenAI y de OpenCode):
- **Principal: `gpt-6.1-sol`.** Disponible con ChatGPT Plus en OpenCode 1.18.25 y empleado ya por el autor. Precio de lista: USD 2,00 de entrada, 0,10 en caché y 10,00 de salida por millón de tokens.
- **Secundario más capaz: `gpt-6-astra`** (USD 10,00, 1,00 y 50,00). Responde la objeción «¿un modelo más capaz lo resuelve?». El changelog de OpenCode registra en la 1.18.29 la corrección de que GPT-6 Astra no aparecía para usuarios de suscripción, de modo que en la 1.18.25 puede no estar disponible: se verifica en el piloto y, si falta, el análisis de sensibilidad se declara perdido sin tocar el criterio principal.
- **Secundario liviano: `gpt-6-luna`** (USD 0,10, 0,01 y 0,50).

El criterio de éxito de ADR-053 (8 de 12 casos de C-2 a C-4, sin aumento de la mediana de tokens) se reenuncia sobre `gpt-6.1-sol`, sin otro cambio. Los precios de lista son de contexto corto y sirven solo para el equivalente informativo.

**Costo de hora (X.1).** Se reemplaza el salario promedio del sector de OPSSI (todas las seniorities, $21.565 por hora) por la **mediana bruta mensual de seniority junior de la encuesta de sueldos SysArmy 2026.01** ($1.538.500, diciembre de 2025 a febrero de 2026; $8.876 por hora con 173,33 h), más cercana al perfil del autor (junior, confirmado por el autor el 01/10/2026). Se descartan los honorarios de colegios profesionales (Córdoba, $26.000 a $44.200 por hora para «Analista Junior»; Jujuy, $5.294 por hora equivalente), porque miden tarifas de servicios independientes y no salarios, y son de otras provincias; el colegio de Misiones (Ley I n.º 120) no publica tabla. No se promedian. **Condición:** el autor verifica la mediana directamente en el tablero de OpenQube, porque la búsqueda la obtuvo de una reproducción (Teclab).

**Precio verificado:** ChatGPT Plus, USD 20 mensuales (OpenAI, página de precios, consulta del 01/10/2026). OpenCode admite la suscripción desde la versión 1.1.11 (`/connect` → OpenAI → ChatGPT Plus/Pro).

**X.3 propuesto (tabla):**
| Partida | Valor | Origen |
|---|---|---|
| Inversión inicial | Nula | Equipo, conexión y herramientas preexistentes o gratuitas |
| Costo recurrente del período | Suscripción ChatGPT Plus, USD 20 mensuales, durante el período (octubre y noviembre de 2026) | Página de precios de OpenAI |
| Consumo de la medición | Tokens por caso y totales por modelo, registrados en las sesiones; equivalente a precio de lista solo informativo | Diseño de la medición; precios de lista de la API |
| Horas del autor | Costo de oportunidad, en una línea, con el costo de hora de X.1 | Apartado X.1 |
| Punto de equilibrio | No corresponde: sin explotación comercial | Apartado IV.1 |

**Condiciones que invalidarían la decisión:**
1. **OpenCode 1.18.25 no acepta la suscripción** como proveedor, en la documentación o en el piloto. Se vuelve a F-A o se evalúa F-C.
2. **El piloto muestra que el modelo principal no tiene problema** (condición 1 de ADR-053, sin cambios).
3. **Los límites de uso de la suscripción impiden completar la medición** en el plazo previsto. Se reduce k en los modelos secundarios antes que tocar el principal (regla de recorte de ADR-057, reexpresada en uso y no en dinero).

#### Decisión del autor

**Aceptado por el autor el 01/10/2026:** F-B + V-B + X-B, con `gpt-6.1-sol` como principal y `gpt-6-astra` y `gpt-6-luna` como secundarios, y el costo de hora de SysArmy 2026.01 (junior), con la verificación directa de la cifra a cargo del autor.

#### Precisión del 01/10/2026 · tarifas congeladas (decisión del autor)

Las tarifas de valorización se **congelan** al 01/10/2026 y se aplican a toda valorización posterior (línea de base, medición final, Cap. I y cualquier repetición por terceros), aunque el proveedor las cambie o retire un modelo. Verificadas por el ingeniero en la documentación oficial de OpenAI ese día.

| Modelo | Rol | Corto: entrada / caché / salida | Largo: entrada / caché / salida |
|---|---|---|---|
| `gpt-6.1-sol` | Principal | 2,00 / 0,10 / 10,00 | 4,00 / 0,20 / 15,00 |
| `gpt-6-astra` | Secundario, mayor capacidad | 10,00 / 1,00 / 50,00 | 20,00 / 2,00 / 75,00 |
| `gpt-6-luna` | Secundario, menor capacidad | 0,10 / 0,01 / 0,50 | 0,20 / 0,02 / 0,75 |

USD por millón de tokens, nivel Standard. Contexto largo: más de 272 000 tokens de entrada por solicitud. ChatGPT Plus: USD 20 mensuales.

- **Fuente única de datos:** `01-relevamiento/linea-base/tarifas-congeladas-20261001.json` (la usan el arnés de la medición y cualquier recálculo).
- **En el informe:** Anexo I, A.I.10; X.3 remite allí en lugar de repetir los precios.
- Un cambio de tarifas posterior **no** modifica este archivo: si alguna vez se decide revalorizar, se crea un archivo nuevo con su fecha y se informan ambos valores.

#### Consecuencias

**Al aceptarse:**
- **X.3:** se reescribe con la tabla de X-B. Salen el tope de USD 50, la estimación de USD 75, la carga de USD 20, la regla de recorte en dinero y los precios de Anthropic. Claude Pro se declara solo en X.4, como herramienta auxiliar sin costo atribuible.
- **X.1:** costo de hora de SysArmy 2026.01 (junior); se recalculan los valores derivados (costo de oportunidad, monto de un patrocinio por hito).
- **X.4:** Codex sobre ChatGPT Plus como escritor y redactor (ADR-067) y como proveedor de los modelos medidos.
- **ADR-057:** el eje T pasa a «reemplazado por ADR-076»; los ejes L y S siguen vigentes.
- **ADR-053:** se precisan los modelos y el control del gasto.
- **Diseño de la medición:** modelos, autenticación por suscripción en el contenedor (sin exponer credenciales al agente evaluado ni a la hoja de respuestas) y registro de tokens desde las sesiones.
- **Cap. I (Ventana del AE1):** valorización del consumo por tokens como equivalente a precio de lista.
- **Instrumento 34:** fila «Financieros» con la suscripción.
- **Anexo III:** D-48 (tope) se reemplaza; D-41 y D-49 se precisan.

#### Evidencia

- `documento_de_correcciones.md` (retirado; consta en el commit `dfaf300`) (corrección del Cap. X del autor).
- ADR-053 (modelos, criterio y tokens), ADR-057 (eje T), ADR-067 (Codex sobre ChatGPT Plus).
- `informe/cap-10/X.3-recursos-financieros.md` y `X.4-recursos-tecnologicos.md`.
- Búsqueda del 01/10/2026 (precio de ChatGPT Plus, conexión de OpenCode y modelos), pendiente de incorporar.

