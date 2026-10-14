# ADR-079 — Línea de base: regla de ramas fijada antes de medir, veinticuatro casos, dos brazos en la medición final con el brazo indicado como principal, clasificación de la fuente de la respuesta y una variante del agente de la referente como segundo ejecutor

- Estado: aceptado (13/10/2026)
- Modificado por: ADR-082 (§4: k = 3 fijado antes de medir, sin piloto; §7: `build` y Charles con `gpt-6.1-sol`), aceptado el 13/10/2026
- Fecha: 13/10/2026 (reescrito dos veces el mismo día: discusión del diseño con el autor y crítica de Codex)
- Capítulos afectados: Cap. I (I.2.3, I.3.1 a I.3.4); Cap. II (II.1, II.2, II.3, II.6.3); Anexo VI (A.VI.1, A.VI.2, A.VI.7, A.VI.8); Anexo III (D-41); Cap. V (V.2, fase de cierre); diseño de la medición (`01-relevamiento/linea-base/DISENO-medicion-agentes.md`, `respuestas.md`); consulta al docente (LB-01)
- Origen: crítica (Codex) de I.2; discusión del diseño con el autor; entrega del agente de la referente; crítica (Codex) de la primera versión de este ADR. Todo el 13/10/2026
- Modifica: ADR-053 (criterio principal de 8 de 12 con regla de techo; dieciséis casos; modelo atribuido al agente de la referente). Precisa ADR-078, eje I (los tokens pasan a criterio principal solo en la rama C) y condición 4 (se activa solo en la rama N). No cambia el objeto de la medición (O-B), los datos del AE1 (D-C), el ejecutor principal (S-A) ni la consulta previa al docente
- Relacionado: ADR-076 (modelos y condición 3), ADR-054 (contenedor), ADR-080 (conjunto de aceptación de RIGE), IV.3 (regla de confirmación, reordenamiento y refutación), D-03 (criterio de censura)

### Contexto

1. **El criterio vigente presupone el resultado** (crítica de I.2):
   - admite cumplir sin reducir el error;
   - con k = 3, una sola ejecución decide un éxito;
   - tolera hasta cuatro retrocesos.

   Además, hay un resultado que ninguna regla lee: que el agente acierte, pero consuma en C-2 a C-4 mucho más que en C-1.
2. **El agente puede experimentar.** Esto es una suposición. El diseño niega la edición nativa pero admite `bash` (`DISENO-medicion-agentes.md`, §4). Si el agente aísla la entrada determinante por ensayo, la respuesta sale correcta pero cara. La literatura no anticipa el resultado (`relevamiento-delegacion.md`, F-4).
3. **Dieciséis casos dan poco margen** a un criterio sobre casos con problema. El autor informa que ampliar los casos no le consume tiempo propio.
4. **La medición final no separa adopción de eficacia:** el agente decide si usa RIGE (`uso_rige`).
5. **El agente de la referente** (dato: `01-relevamiento/evidencia/PRIV/agente-referente-charles_20261013.md`; recibido el 13/10/2026; consentimiento declarado por el autor; existencia anterior a la línea de base declarada por el autor; anterioridad a la entrevista pendiente del acta de la entrevista):
   - agente primario «[AUX] Charles» para configurar la herramienta;
   - **modelo `openai/gpt-6-luna`**, temperatura 0,2, y no Opus 5.5 como suponía ADR-053;
   - deniega todas las skills salvo `opencode`, `skillshare` y `rtk`, que son propias del equipo y **no se recibieron**; `customize-opencode` queda denegada;
   - `bash` con «*» denegado, salvo lectura y git; `opencode *` en `ask`; `webfetch` y `websearch` en `ask`; `edit` permitido.

### Alternativas evaluadas

- **Eje R · Regla de lectura:** R-A (criterio de ADR-053); R-B (casos con problema, primera versión); R-C (ramas fijadas antes del piloto, con salvaguardas).
- **Eje N · Casos:** N-A (dieciséis); N-B (veinticuatro).
- **Eje F · Medición final:** F-A (RIGE disponible); F-B (dos brazos con el disponible como principal); F-C (dos brazos con el **indicado** como principal).
- **Eje X · Ejecutores:**
  - X-A: solo `build`;
  - X-B: el agente de la referente como principal;
  - X-C: `build` como principal y una variante del agente de la referente como segundo ejecutor.

### Análisis (trade-offs)

**Eje R**
- **R-A** no corrige los defectos.
- **R-B** deja sin lectura el resultado «acierto con costo alto», y admite cumplir mientras crece el error agregado. Contraejemplo de la crítica: cuatro casos se recuperan y doce pasan de 0 a 1 error sobre 3.
- **R-C** cubre todos los resultados con reglas y fórmulas fijadas antes de medir, con salvaguardas sobre el error agregado.
- **Los umbrales** (un tercio, dos tercios, la mitad de las ejecuciones, X = 2, Y = 30 %) son convenciones del ingeniero aceptadas por el autor, sin fuente empírica (suposición). Su defensa es que se fijan antes de conocer los datos y que la mitad coincide con el criterio de censura de D-03. No se les atribuye significado estadístico.

**Eje N**
- **N-B** duplica la base del criterio sin horas del autor.
- El umbral se expresa en proporción (condición 4 de ADR-053).

**Eje F**
- RIGE es una herramienta para que el desarrollador la ponga a disposición de su agente (E-01 del acta). En el uso previsto, el desarrollador **indica** al agente que la consulte.
- **F-C** toma ese uso como brazo principal. El brazo disponible mide si el agente la adopta sin indicación, y se informa siempre.
- **F-B** haría depender el resultado de que el agente descubra la herramienta, que no es lo que el producto promete.

**Eje X**
- **X-B** ata el resultado a un equipo que no es el ámbito de implantación (I.1.2) y a skills no recibidas.
- **X-C** mide la condición por defecto como principal y suma una variante derivada de la práctica relevada.
  - **La variante no es la práctica:** no tiene las skills propias, y sus `ask` pasan a denegados porque no hay operador.
  - **Comparar con `build` al mismo modelo** (`gpt-6-luna`) mide el efecto conjunto de la instrucción, los permisos y las ayudas, sin atribuirlo a uno solo.

### Recomendación y fundamento

**R-C + N-B + F-C + X-C**, con la clasificación de la fuente de la respuesta.

#### 1. Definiciones (fijas antes del piloto)

| Término | Definición |
|---|---|
| Ejecución | Una corrida de un caso por un ejecutor y un modelo. Resultado: correcta, parcial, incorrecta o sin respuesta (`respuestas.md`). Parcial y sin respuesta cuentan como error |
| Tasa de error del caso | Ejecuciones erróneas sobre k |
| Caso con problema | Tasa de error del caso mayor o igual que 1/2 (con k = 3: al menos 2 de 3; con k = 5: al menos 3 de 5) |
| IB-1 agregado | Ejecuciones erróneas sobre el total de ejecuciones de los 18 casos de C-2 a C-4 |
| Tokens de una ejecución | Entrada más caché más salida, según el registro de la sesión. Las ejecuciones censuradas o erróneas cuentan con los tokens consumidos |
| Tokens del caso | Mediana de los tokens de sus k ejecuciones |
| Nivel de tokens de un conjunto | Mediana de los tokens de sus casos |
| Reducción de tokens del caso | 1 − (tokens del caso con RIGE ÷ tokens del caso sin RIGE) |

#### 2. Validez previa (por ejecutor, antes de leer las ramas)

La medición de un ejecutor es **válida** si se cumplen las tres condiciones:
- ningún caso de C-1 es caso con problema;
- ninguna ejecución de C-1 está censurada;
- todas las ejecuciones tienen registro completo de resultado y tokens. Una ejecución perdida se repite. Si no se recupera, el caso se excluye de las dos mediciones y de los dos brazos de ese ejecutor y se declara; los umbrales se recalculan en proporción sobre el conjunto común (un tercio y ⌈2/3⌉). Más de dos exclusiones invalidan la medición.

**Si no es válida,** se corrige la causa en el instrumento y se repite la línea de base completa de ese ejecutor. Las ramas no se leen y no se ajusta ningún umbral.

#### 3. Ramas (sobre la línea de base de cada ejecutor)

| Rama | Condición | Criterio de cumplimiento en la medición final (brazo indicado) |
|---|---|---|
| **E · error** | Al menos 6 de 18 casos con problema, **y** el IB-1 de C-2 a C-4 supera al de C-1 (coincide con «Confirma» o «Reordena» de IV.3) | Al menos ⌈2/3⌉ de los casos con problema dejan de serlo; ningún caso sin problema pasa a tenerlo; **y** el IB-1 agregado disminuye. Los tokens son el criterio secundario (ADR-078): la mediana de las reducciones de tokens de los 18 casos no es negativa |
| **C · costo** | Menos de 6 casos con problema, **y** el nivel de tokens de C-2 a C-4 es al menos el doble (X = 2) que el de C-1 | La mediana de las reducciones de tokens de los 18 casos es al menos 30 % (Y = 30 %); ningún caso sin problema pasa a tenerlo; y el IB-1 agregado no aumenta |
| **P · problema bajo el mínimo** | De 1 a 5 casos con problema, sin la condición de C | Sin criterio de cumplimiento. La medición final se ejecuta y se informa caso por caso, en forma descriptiva |
| **N · sin problema** | Ningún caso con problema, sin la condición de C | Sin criterio de mejora. Se aplican la condición 1 de ADR-053 y la condición 4 de ADR-078 (se reevalúa el objeto) solo si el segundo ejecutor también cae en N |

- **Orden de evaluación:** E, C, P, N; rige la primera rama cuya condición se cumple.
- **Relación con IV.3.** La regla de confirmación, reordenamiento y refutación de IV.3 se evalúa siempre, en forma independiente de las ramas, y conserva sus propias consecuencias sobre la selección y el orden del flujo. La única vinculación es esta: con 6 o más casos con problema y «Refuta», la medición se informa como rama P. En la rama C, la meta del objetivo general pasa a ser la de tokens por decisión de este registro, no por IV.3.
- **El cumplimiento del proyecto se declara sobre el ejecutor principal** (`build`, `gpt-6.1-sol`) y el brazo indicado.
- **Cada ejecutor y modelo determina su propia rama** con su propia línea de base, y la medición final se ejecuta para todos los que no caen en N. Los resultados de los demás ejecutores y modelos, y del brazo disponible, se informan siempre con la misma regla, sin decidir el cumplimiento.
- **Lectura de los brazos:**
  - indicado y disponible cumplen: RIGE resuelve y el agente lo adopta;
  - cumple solo el indicado: RIGE resuelve si el desarrollador lo indica;
  - el indicado no cumple: el objetivo no se alcanza.
- **Se informan siempre,** además de las ramas, las tasas por caso sin binarizar, los retrocesos con su causa y todas las ejecuciones censuradas.

#### 4. Estabilidad y k

- **Piloto:** los veinticuatro casos, diez ejecuciones cada uno, con el ejecutor y el modelo principales. Reemplaza el piloto acotado del diseño (§8), que se armoniza.
- **Regla de k:** la concordancia de un caso es la proporción de sus diez ejecuciones que coinciden con el resultado más frecuente (correcta o errónea). Si al menos el 90 % de los casos tiene concordancia de 9/10 o más, k = 3; si no, k = 5. Rige el mismo k para todos los ejecutores y modelos.
- El umbral de la mitad **no** se revisa con los datos.
- Los casos cuya tasa en el piloto queda entre 30 % y 70 % se marcan como inestables y se informan, sin excluirlos.
- Los datos del piloto no integran la línea de base.

#### 5. Casos

- **Veinticuatro, seis por condición.** Los ocho nuevos se derivan de los resultados verificados de A.VI.3 que no tienen caso, dos por condición, mezclando valor más fuente y decisión más regla.
- Todos se verifican contra el binario 1.18.25 en el contenedor antes del piloto, incluidos los seis marcados [VERIFICAR].
- Ningún comando nativo informa a la vez la respuesta y su procedencia.

#### 6. Clasificación de la fuente de la respuesta (dos capas)

- **Cobertura disponible.** Por caso, antes del piloto y con evidencia: etiquetas múltiples entre documentación, comando nativo, skill del fabricante y solo ejecución. Cada etiqueta indica si cubre la respuesta completa, solo el valor, o la cubre en forma incorrecta (C-3b).
- **Fuente observada.** Por ejecución, a partir de la traza: qué usó el agente.

#### 7. Ejecutores y brazos

| Elemento | Ejecutor principal | Segundo ejecutor |
|---|---|---|
| Agente | `build` nativo con la skill `customize-opencode` disponible (ADR-078) | Variante experimental derivada del agente de la referente («Charles»): conserva su instrucción, su modelo (`gpt-6-luna`), su temperatura (0,2) y su estructura de permisos |
| Modelos | `gpt-6.1-sol` (principal), `gpt-6-astra`, `gpt-6-luna` (ADR-076) | `gpt-6-luna` |
| Cambios declarados | Ninguno | `edit` denegado; todo `ask` denegado; sin las skills `opencode`, `skillshare` y `rtk` (no recibidas); la documentación en línea es reemplazada por la documentación sin conexión del contenedor, igual para los dos ejecutores |
| Acceso a RIGE | En los dos brazos, el comando de RIGE y el envoltorio de la medición quedan permitidos; nada más se habilita | Ídem, agregado a su configuración, porque su `bash` deniega por defecto |

- Antes del piloto se congela y verifica en el contenedor la configuración efectiva de cada ejecutor: que lee el caso y que invoca RIGE en los dos brazos.
- Las negativas atribuibles a recursos retirados se registran aparte.

#### 8. Condiciones que invalidarían la decisión

1. **El docente pide otro criterio en LB-01.**
2. **No se acredita que el agente de la referente existiera antes de la entrevista** (acta de la entrevista pendiente). Se usa igual como segundo ejecutor, pero no se cita como demanda revelada anterior a la entrevista.
3. **Los límites de la suscripción no alcanzan.** Se reduce k primero en el segundo ejecutor, después en los modelos secundarios, y nunca en el principal (ADR-076, condición 3).
4. **La verificación previa muestra que un ejecutor no puede invocar RIGE** sin habilitar permisos que su configuración deniega deliberadamente. Ese ejecutor se mide solo en la línea de base y se declara.

### Decisión del autor

**Aceptado por el autor el 13/10/2026**, con la condición «si está verificado y controlado y es la mejor solución disponible». La condición se cumplió con tres pasadas de crítica (Codex, 13/10/2026): la primera encontró seis bloqueantes y cinco importantes en ADR-079, y tres bloqueantes y dos importantes en ADR-080; todos se incorporaron; la tercera pasada da por resueltos los puntos abiertos, salvo la armonización del diseño de la medición, que es consecuencia de la aceptación (AD-19). Datos del autor: el agente de la referente existía antes de la línea base; su anterioridad a la entrevista se acredita con el acta de la entrevista, pendiente de subir; las skills propias del equipo no se recibieron, de modo que la variante corre sin ellas.

### Consecuencias

**Si se acepta:**
- **ADR-053:** modificado por ADR-079 en el criterio, la cantidad de casos y el modelo atribuido al agente de la referente.
- **ADR-078:** la tabla «Sobre ADR-053», fila del criterio, remite a ADR-079.
- **Diseño de la medición (AD-19):** veinticuatro casos; validez previa; ramas y fórmulas; brazos; segundo ejecutor; clasificación en dos capas. `respuestas.md` incorpora los ocho casos nuevos. Construcción y verificación por ficha del escritor.
- **Informe:**
  - I.2.3 se reenuncia con las ramas y el brazo indicado;
  - I.3 se redacta con este diseño;
  - II.1 incorpora el agente de la referente como fuente primaria;
  - II.2 y II.3, los dos ejecutores;
  - V.2, la fase de cierre con dos brazos.
- **Anexo III, D-41:** se actualiza.
- **LB-01:** la consulta al docente se envía con este diseño.
- **Pendientes:** AD-17 se cierra con la recepción del agente. Queda pendiente el acta de la entrevista (anterioridad).

### Evidencia

- `00-gestion/decisiones/ADR-053-linea-base-agentes-consolidado.md`, `ADR-078-linea-base-procedimiento-delegado-dictamen-ae2.md`, `ADR-076-medicion-suscripcion-chatgpt-tokens.md`
- `01-relevamiento/linea-base/DISENO-medicion-agentes.md` (§4, §7, §8) y `respuestas.md`
- `01-relevamiento/linea-base/relevamiento-delegacion.md` (F-4)
- `01-relevamiento/evidencia/PRIV/agente-referente-charles_20261013.md`
- `informe/anexos/anexo-VI-datos-relevados.md`, A.VI.3; `informe/cap-04/IV.3-analisis-rivalidad-amplificada.md`
- Críticas de Codex del 13/10/2026 (I.2 y primera versión de este ADR)
