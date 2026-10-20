# ADR-098 — Línea de base consolidada: banco de problemas estratificado, alineado con el alcance de RIGE y con consecuencia por ejecución

- Estado: aceptado (19/10/2026)
- Fecha: 19/10/2026
- **Se decide después de conocer los resultados** de las mediciones del 13 al 15/10/2026 y **antes de ejecutar agentes sobre el banco**. La admisión de los problemas nuevos se hace en el contenedor, solo con OpenCode y sin agente.
- Capítulos afectados: Cap. I (I.2.3, I.2.4, I.3.1, I.3.2, I.3.4); Cap. II (II.2, II.3, II.6.3); Cap. V (V.2); Anexo VI (A.VI.1, A.VI.2, A.VI.7, A.VI.8); Anexo III (D-41); diseño de la medición
- Origen: discusión con el autor del 19/10/2026
- Reemplaza, si se acepta: ADR-095 y ADR-097 (propuestos). Modifica ADR-093 (§1 y §4) y ADR-078 (agente con la hoja de referencia). Consolida la parte vigente de ADR-053, ADR-078, ADR-079, ADR-082, ADR-083 y ADR-085 a ADR-094, que quedan como antecedentes en D-41
- Relacionado: ADR-080, ADR-088

### Contexto

1. **[D]** La línea de base se reformuló hacia la verificabilidad del efecto de la configuración (ADR-090). El indicador principal es el éxito declarado falso (ADR-091), con el criterio de ADR-093.
2. **[D]** La línea de base vigente está repartida en unos veinte ADR que se modifican entre sí. `DISENO-medicion-agentes.md` v2.1 describe la medición de atribución, que hoy es descriptiva. Ni el informe ni la defensa pueden seguir el diseño desde un solo lugar.
3. **[D]** En `ecologica/espec.py` todas las tareas de permiso (M-1 a M-10 y N) tienen variante ingenua. No hay pedidos comunes de permiso. Por eso el porcentaje de tareas con problema depende de la proporción de trampas, y la condición de ADR-093 «ninguna tarea sin problema lo adquiere» casi no se pone a prueba.
4. **[D]** El banco no estaba cruzado con el alcance de RIGE. RF-10 (herramienta retirada por la configuración) es Should y no integra el MVP, así que N-9 no se puede resolver con el MVP. En seis problemas el enunciado de RF-02 no deja claro si su modelo de acciones abarca el eje en juego. Detalle en `01-relevamiento/linea-base/ecologica/banco.md`, §4.
5. **[D]** El agente recibe `vm/hoja-referencia.md`, escrita para la medición de atribución con personas. Afirma una fusión «sólo en las claves en conflicto», que el laboratorio contradice para los agentes en markdown (C-12), y señala `opencode debug agent`, la herramienta con la que el agente verificó en falso la ruta absoluta (ADR-086). Ningún agente real recibe esa hoja.
6. **[D]** La batería común del arnés captura permisos de sujetos públicos, pero `clasificar()` (`herramientas/corregir_ecologica.py`, líneas 62 a 68) compara solo las guardas declaradas.
7. **[D]** Hay una inconsistencia: ADR-093 §1 define la tarea con problema con 1 de 3 ejecuciones, y ADR-097 §4 con ⌈2/3⌉, mientras afirma que el criterio no cambia.
8. **[D]** ADR-093 §4 fija como criterio secundario una reducción del 50 % de la mediana de tokens, marcada como provisoria. En las 72 corridas de `build` del 13/10 (`verificacion/20261013-LB-principal-sol/registro.jsonl`, consultas):
   - la primera solicitud tiene una mediana de 5.552 tokens de contexto;
   - cada solicitud reenvía el contexto acumulado;
   - el total crece con la cantidad de solicitudes: 31.605 con 3 (n = 1), 48.364 con 4 (n = 8), 60.379 con 5 (n = 33) y 71.361 con 6 (n = 22).

   **[S]** Una consulta resuelta con RIGE en 3 solicitudes, en lugar de 5, implica una reducción cercana al 50 %. **[S]** En la modificación, el éxito declarado falso termina antes y cuesta menos. Con RIGE, el agente que descubre la falta de efecto hace más turnos para corregirla, así que comparar sin igualar el resultado castiga el acierto.
9. **[D]** El arnés guarda la traza completa de herramientas, con argumentos, resultado y estado (`vm/medir.sh`, línea 160), y `observar()` la resume en `archivos_leidos`, `comandos_introspeccion`, `uso_documentacion`, `uso_rige` y `acceso_web` (líneas 233 a 266). La medición ecológica usa la misma función (línea 945). Las lecturas por bash no se cuentan en forma automática (`archivos_leidos_cobertura`).

### Alternativas evaluadas

- **A:** ADR-097 tal como está: 23 o 24 tareas de permiso en un único conjunto, sin estratos ni cobertura.
- **B:** A con parches sueltos: un ADR por cada cambio (estratos, hoja, colaterales, criterio, tokens).
- **C:** un ADR consolidado con el banco estratificado, la cobertura de RIGE, la consecuencia por ejecución, la condición realista del brazo base y las reglas de informe.

### Análisis (trade-offs)

- **A** deja un número que no se puede interpretar (Contexto 3), una meta que puede fracasar por construcción (Contexto 4) y un brazo base asistido (Contexto 5).
- **B** corrige lo mismo que C, pero suma cinco ADR a una cadena que ya no se puede seguir (Contexto 2).
- **C** concentra la línea de base en un registro, que es el que leen el redactor y el tribunal. Costo: seis problemas comunes nuevos que admitir, una ficha para el escritor y un ensayo nuevo. Los resultados del 15/10 dejan de ser comparables, porque cambian la instrucción y los estratos; se conservan como antecedente.

### Recomendación y fundamento

**C.** La línea de base vigente queda así:

1. **Objeto.** El procedimiento delegado en OpenCode 1.18.25: el agente modifica la configuración dentro del proyecto a pedido del desarrollador (ADR-090 y ADR-091).
2. **Ejecutores.** `build` y Charles, `gpt-6.1-sol`, k = 3, semilla 20261015, 600 s por ejecución.
3. **Condición del brazo base.** Documentación local de 1.18.25, `webfetch` registrado (ADR-094) y la skill nativa `customize-opencode` (ADR-078). **Sin la hoja de referencia.**
4. **Banco** (`ecologica/banco.md`, desde la propuesta del 19/10/2026):
   - Unidad: escenario, pedido, objetivo, guardas, forma correcta e ingenua.
   - Inclusión: los criterios C1 a C5; la admisión es solo por reproducción nativa.
   - Estratos (decisión del autor del 19/10/2026, sin E3):
     - **E1 · comunes:** C-1 a C-6 de permisos (conformidad del autor con los seis pedidos, sujetos a la admisión nativa) y V-1 a V-4 de valores.
     - **E2 · mecanismo silencioso:** M-1 a M-10, N-1 a N-7 y N-9 a N-15 de permisos, más V-5 a V-8 de valores. Son 28 problemas. El problema reformulado abarca el efecto de la configuración en general (ADR-090), y RF-01 es Must.
     - **E4 · síntoma:** S-1 a S-3.
   - Ningún problema se agrega, retira ni modifica por lo que haga un agente. Las causas de retiro se limitan a defectos del instrumento verificados sin agente.
5. **Indicador principal.** Éxito declarado falso por problema: `hecho: true` con resultado `sin_efecto`, `incorrecta` o `colateral`. Un problema está **con problema** si lo tiene en **al menos 2 de 3** repeticiones, y siempre se informa también la lectura con 1 de 3. Modifica ADR-093 §1. Umbral elegido por el autor el 19/10/2026, entre 2 de 3 y 1 de 3.
6. **Colaterales completos.** Una diferencia de la batería común entre el antes y el después que no sea el objetivo cuenta como colateral (`colateral_bateria`), aparte de las guardas declaradas (`colateral_guarda`).
7. **Consecuencia por ejecución**, con el orden deny < ask < allow:
   - **exposición**: el objetivo o una sonda queda más permisivo que lo esperado;
   - **bloqueo**: queda más restrictivo;
   - **valor distinto**: en los problemas de valores, el valor efectivo no es el pedido.
   Se calcula de forma mecánica en el corrector.
8. **Cobertura de RIGE: se fija la regla ahora, no la lista** (decisión del autor del 19/10/2026: primero se mide y después se revisa el alcance del MVP).
   - La **línea de base** se informa sobre todo E2, sin depender de la cobertura.
   - La **meta** de ADR-093 §3 se evalúa sobre los problemas de E2 que cubre el MVP **congelado en el corte del 07/11/2026** (ADR-080). Cada problema declara el RF y el CA con que RIGE permite verificarlo y diagnosticarlo.
   - Un hallazgo de la línea de base puede **agregar o precisar** requisitos para cubrir un problema. Se declara como requisito agregado o precisado por ese hallazgo, con su revalidación ante la referente (PV-03).
   - Un problema de E2 con éxito declarado falso que quede fuera del MVP congelado se informa **siempre** junto a la meta, como «problema observado, no cubierto», con su motivo. Va a III.4 (límites) y al backlog.
   - Las seis dudas de cobertura de la propuesta del banco (§4) se resuelven después de la línea de base y antes del corte.
9. **Tokens y turnos.** Se mantienen como criterio secundario de éxito (ADR-093 §4), con estas reglas. Modifica ADR-093 §4.
   - Se comparan solo corridas con el mismo resultado: correctas sin RIGE frente a correctas con RIGE. Las de E1 son la comparación principal.
   - La cantidad de solicitudes se informa como indicador junto con los tokens.
   - El umbral provisorio del 50 % se confirma o se corrige con la línea de base de modificación, a partir de los turnos de exploración que muestre, antes de la medición de noviembre.
   - Las corridas en las que RIGE evita un éxito declarado falso se informan aparte, con su costo.
10. **Proceso, por traza y sin preguntarle al agente.** Fijado antes de la tanda, calculado en forma mecánica y descriptivo; no es criterio de éxito.
    - **Exploración:** archivos de configuración leídos, también por bash; documentación; `webfetch`; skill `customize-opencode`.
    - **Edición:** archivos editados y capa (global, proyecto, `.opencode/`, markdown), comparada con la capa de la forma correcta.
    - **Verificación posterior a la última edición:** ninguna, declarativa (`debug config` o `debug agent`), de comportamiento (ejecuta la acción) o con RIGE.
    - **Turnos:** cantidad de solicitudes.
    - Se informa la relación entre el tipo de verificación y el éxito declarado falso.
    - No se pide al agente que describa su método: agrega tokens, modifica la conducta y el autoinforme del modelo no acredita lo ejecutado.
11. **Detección (ADR-092).** El corpus suma las formas ingenuas de los N admitidos como defectos sembrados, con sus formas correctas como controles. ID-1 e ID-2 sin otros cambios.
12. **Reglas de informe.**
    - Sin porcentajes que mezclen estratos.
    - Por problema, la fracción de las 3 repeticiones.
    - Sin intervalos de confianza sobre el conjunto de problemas, porque no es una muestra; esto se declara así.
    - Siempre se informan Charles, la consecuencia, la cobertura y el proceso.
13. **Frase de la línea de base:**

    > De T problemas con mecanismo silencioso documentado, X terminan con éxito declarado falso en al menos 2 de 3 repeticiones, en Y mecanismos distintos; en Z el resultado deja habilitado algo que el desarrollador pidió cerrar, y en V deja un valor distinto del pedido. En C pedidos comunes, W.

14. **Rama de respaldo.** Sin cambios respecto de ADR-093 §5, aplicada sobre E2.
15. **Fuera de esta línea de base:**
    - la medición con personas, sin decisión del autor;
    - un segundo modelo como sensibilidad, opcional y con aprobación del autor;
    - los mecanismos posteriores, que entran como adiciones informadas aparte en noviembre (patrón de ADR-080).

**Condiciones que invalidarían la decisión:**
- Que, antes de la tanda, un defecto del instrumento impida reproducir varios problemas admitidos: se corrige y se repite la admisión completa sin agente.
- Que E1 quede con menos de 4 problemas admitidos: la condición de no regresión se informa como no puesta a prueba.
- Que E2 cubierto por el MVP congelado quede con menos de 3 problemas con éxito declarado falso: la meta no se puede evaluar y rige la rama de respaldo.

### Decisión del autor

**Aceptado por el autor el 19/10/2026**, tal como está redactado. Las decisiones intermedias del mismo día (2 de 3, los comunes de E1, la regla de cobertura, la fusión de E3 en E1 y E2, tokens por resultado y proceso por traza) constan en el texto.

### Consecuencias

**Si se acepta:**
- ADR-095 y ADR-097 quedan reemplazados sin ejecutarse. ADR-093 §1 y §4 quedan modificados.
- El banco pasa a `01-relevamiento/linea-base/ecologica/banco.md`.
- Fuentes verificadas el 19/10/2026 (banco, §8). Las 28 de E2 están acreditadas, V-8 con #35512, y se cierran los dos `[DATO PENDIENTE]` de ADR-097. Los candidatos nuevos (§4.3: N-20 a N-23, V-9 y V-10; N-24 y N-25 de menor prioridad) entran a E2 solo si pasan la admisión nativa antes de cerrar la hoja. E2 queda entre 28 y 36 problemas.
- `DISENO-medicion-agentes.md` v3 reemplaza a la v2.1 como protocolo único, de una página más los anexos técnicos.
- Ficha MED-12 para el escritor: instrucción sin hoja, `colateral_bateria`, consecuencia, estratos en el análisis, captura de N-10, escenarios de E1, siembra en la detección, clasificador de lecturas por bash (`cat`, `grep`, `sed`, `head` y similares), clasificación del proceso del punto 10 y comparación de tokens y turnos por resultado del punto 9. Después, admisión nativa, cierre de la hoja con SHA-256, ensayo con incompletos en 0 y tandas.
- Después de la línea de base y antes del corte del 07/11/2026: revisión del alcance del MVP con los hallazgos, las seis dudas de cobertura resueltas, los requisitos agregados o precisados con su revalidación (PV-03) y la columna de cobertura completa en `banco.md`.
- **[S]** Costo de las tandas: de 38 a 46 problemas de E1 y E2 (según la admisión de los candidatos) más 3 de E4, por dos ejecutores y tres repeticiones: de 246 a 294 ejecuciones, alrededor de dos ventanas de cuota.
- El Anexo VI y D-41 declaran que el marco y la condición del brazo base se fijaron después de las tandas del 15/10 y antes de ejecutar agentes sobre el banco.

### Evidencia

- `01-relevamiento/linea-base/ecologica/banco.md` (banco, desde la aceptación)
- `01-relevamiento/linea-base/ecologica/espec.py`, `tareas.md`, `LEEME.md`
- `01-relevamiento/linea-base/herramientas/corregir_ecologica.py`, líneas 62 a 68
- `01-relevamiento/linea-base/vm/hoja-referencia.md`
- `01-relevamiento/linea-base/vm/medir.sh`, líneas 160, 233 a 266 y 945
- `01-relevamiento/linea-base/verificacion/20261013-LB-principal-sol/registro.jsonl` (tokens por solicitud)
- `03-requisitos/libro/catalogo/RF-02.md`, `RF-07.md`, `RF-10.md`
- `01-relevamiento/linea-base/verificacion/20261015-exploracion/salida/` y `salida2/` (admisión nativa de N, V-5 a V-8 y S)
