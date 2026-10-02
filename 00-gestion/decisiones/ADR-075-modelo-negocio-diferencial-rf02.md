# ADR-075 — Modelo de negocio revisado tras el relevamiento de competidores del 01/10/2026: diferencial en la combinación de decisión y procedencia por declaración, RF-02 con la procedencia de la regla determinante verificable (CA-8), alternativas de sostenimiento ampliadas con el descarte de la inversión derivado de las fuerzas, y canales con el repositorio privado

- Estado: aceptado (01/10/2026)
- Fecha: 01/10/2026
- Capítulos afectados: Cap. IV (IV.1, Tabla 10 y párrafo obligatorio; IV.3, Tabla 11; IV.4, Figura 2 y lectura); Cap. III (Anexo I, RF-02); libro (`catalogo/RF-02.md`); Anexo III (D-31); Ventana del AE1 (A.I.4, hallazgo 5, FODA A1)
- Origen: corrección del Cap. IV (`documento_de_correcciones.md` (retirado; consta en el commit `dfaf300`), IV.1, IV.3 e IV.4) y relevamiento de competidores del 01/10/2026 (búsqueda con Codex, verificada por el ingeniero en la documentación oficial de Amp y de Codex)
- Precisa: ADR-057, eje L (no cambia la decisión L-A; cambia su fundamento y amplía las alternativas)
- Relacionado: ADR-057 (sostenimiento), ADR-059 (localización ruta:línea:columna, RF-12), ADR-062 (distribución con `bun run` sobre el código fuente, sin artefacto distribuido)

### Contexto

**1. La guía exige que el lienzo cambie algo.** La guía de la AE2, §5.1, dice: «el lienzo debe cambiar algo del proyecto. Si […] el alcance del Capítulo III sigue exactamente igual, el lienzo no se usó, se ilustró» (criterio v de la grilla). IV.1 dice hoy lo contrario: «El contraste del lienzo con el alcance no modifica decisiones: confirma dos que ya estaban tomadas».

**2. El relevamiento del 01/10/2026 refuta una premisa del capítulo.** Dos funciones publicadas evalúan una acción y devuelven la regla que decide:
- **Amp, `amp permissions test`.** Devuelve `action`, `matched-rule` (índice de la regla) y `source` (alcance: `user`). Las reglas se evalúan en orden y gana la primera que coincide. No informa archivo ni posición. Ubicación en el mapa: eje horizontal 3, eje vertical 1. Fuente: ampcode.com/notes/permissions.
- **Codex, `codex execpolicy check`.** Emite un JSON con «the strictest decision and any matching rules». Cubre solo los comandos de shell fuera del sandbox y no informa archivo ni línea. Ubicación: eje horizontal 3, eje vertical 0. Fuente: documentación de reglas de Codex.

Quedan refutadas las afirmaciones «ninguna evalúa la decisión correspondiente a una acción ni informa su regla determinante» (IV.3), «el diferencial defendible reside en el eje horizontal» (IV.4) y el motivo de prioridad de RF-02, «ninguna solución relevada explica una decisión de permiso concreta». **Ninguna** herramienta relevada (33 incluidas) ocupa el cuadrante de RIGE: eje horizontal 3 y eje vertical 2. La amenaza A1 del FODA del AE1 deja de ser hipotética: dos proveedores ya construyeron parte de la función en sus propias herramientas.

**3. El diferencial no tiene criterio de aceptación.** El enunciado de RF-02 dice que la regla determinante se informa «con su procedencia», pero ninguno de sus siete criterios lo verifica. CA-4 habla de la posición *en la cadena*, no en el archivo. RF-01, CA-1, sí exige «archivo y línea» para los valores. RF-12 (ruta:línea:columna) está condicionado en la iteración 2 (V.1), así que no sostiene el diferencial.

**4. Los argumentos de descarte son circulares.** IV.1 dice que «la inversión no se busca porque el proyecto no persigue retorno económico», y D-31 que «exige un retorno que un modelo sin ingresos no ofrece». Ninguno dice por qué un tercero no invertiría.

**5. Canales.** La Tabla 10 dice «Repositorio público con versiones publicadas» y contradice ADR-057: el repositorio es privado hasta la aprobación (IV-05).

### Alternativas evaluadas

**Eje D · Diferencial declarado y su verificación**
- **D-A:** conservar el diferencial en la explicación de la decisión (eje horizontal), con la salvedad de que Amp y Codex operan sobre otras herramientas.
- **D-B:** declarar como diferencial la combinación, es decir, la decisión con su regla determinante **y** la procedencia por declaración (entrada, archivo y posición) sobre la semántica de OpenCode, sin agregar un criterio.
- **D-C:** D-B más un **CA-8 en RF-02** que haga verificable la procedencia de la regla determinante, y el motivo de prioridad reescrito.

**Eje L · Modelo de sostenimiento (amplía ADR-057)**
- **L-A:** MIT, sin explotación comercial (vigente).
- **L-B:** núcleo abierto con funciones pagas.
- **L-C:** servicio alojado.
- **L-D:** inversión de una empresa.
- **L-E:** licencia dual (abierta y comercial).
- **L-F:** soporte o adaptación pagos.
- **L-G:** aportar la función al propio OpenCode (*upstream*).

### Análisis (trade-offs)

**Eje D**
- **D-A:** es falsa frente a la evidencia. El tribunal puede mostrar `amp permissions test` en un minuto. La salvedad de ecosistema no salva el argumento, porque prueba justamente que el proveedor puede construir la función (amenaza A1).
- **D-B:** es correcta pero no verificable: deja el diferencial en el enunciado y sin criterio. Un requisito que se sostiene en una frase sin criterio es lo que la cátedra no computa (`reglas-catedra.md`, §6).
- **D-C:** cuesta poco, porque el núcleo ya localiza las declaraciones para RF-01 (archivo y línea) y la regla determinante declarada es una declaración más. Cierra la brecha entre el enunciado y la verificación. Es además la decisión de alcance que el lienzo cambia: el bloque «Propuesta de valor», contrastado con las fuerzas, agrega un criterio y reescribe un motivo de prioridad. Costo: un criterio más en la iteración 2 y la necesidad de informarlo a la referente (precisión, no requisito nuevo; PV-03).

**Eje L.** Los descartes se derivan de las fuerzas de IV.3, que es la derivación que pide la guía (criterio v):
- **L-D (inversión):** un inversor necesita capturar valor, y la rivalidad muestra que no hay nada exclusivo que capturar:
  1. **Sin barrera de entrada.** Los proveedores pueden construir la función a bajo costo y dos ya construyeron parte (competidores potenciales). Además, el adaptador y los escenarios se publican bajo MIT (recursos clave).
  2. **Disposición a pagar nula.** Todas las alternativas son gratuitas y el costo de cambio es nulo (poder de los clientes).
  3. **Proveedor dominante.** OpenCode cambia la semántica entre versiones (incidencia 46873), lo que impone un costo recurrente de readaptación sobre un mercado de una sola herramienta (poder de los proveedores).
- **L-B:** contradice la frontera de uso individual (L-04), y un usuario individual no paga por algo que tiene gratis (2).
- **L-C:** contradice RNF-05 (sin conexiones salientes).
- **L-E:** la licencia dual requiere un comprador que necesite una licencia no abierta. Con MIT ya no existe esa restricción que vender, y con (1) y (2) no hay comprador.
- **L-F:** el soporte pago necesita una base de usuarios que no existe en el período y una dedicación que el autor individual no sostiene.
- **L-G (*upstream*):** es la alternativa más seria. Aportar la función a OpenCode llegaría a todos sus usuarios sin instalación. Se descarta en el período por tres motivos:
  - deja la función sujeta a la hoja de ruta y a la aceptación del proveedor;
  - pierde la verificación independiente contra el oráculo (RNF-02), porque el verificado y el verificador serían el mismo código;
  - no acredita la autoría individual que exige el TIF.

  Queda como **salida estratégica**: si OpenCode incorpora la función de forma nativa (realización de A1 en el propio ecosistema), el aporte del conocimiento y de los escenarios al proyecto es la continuidad natural. La independencia del núcleo (RNF-03) conserva además la opción de reorientar RIGE hacia otra herramienta.
- **L-A:** se mantiene. Es la única alternativa coherente con las cinco fuerzas.

**Canales.** El repositorio privado hasta la aprobación (ADR-057, Guía AE2 §2.3) implica que en el período el canal de uso por terceros es la cátedra, como colaboradora, y la referente. La difusión en comunidades y los ingresos voluntarios empiezan con la publicación. Coincide con ADR-062: distribución con `bun run` sobre el código fuente y sin publicar en un registro de paquetes.

### Recomendación y fundamento

**D-C + L-A con los descartes derivados de las fuerzas + canales corregidos.**

- **D-C:** es la única opción que sostiene el diferencial con evidencia verificable y, a la vez, satisface el criterio (v): el lienzo cambia un requisito. IV.1 cumple el párrafo obligatorio con una decisión real («Propuesta de valor» → CA-8 de RF-02 y nuevo motivo de prioridad) y conserva las dos confirmaciones (L-05 y RNF-06) como fundamento agregado.
- **L-A:** el cambio está en el fundamento, no en la decisión: los descartes dejan de ser circulares y salen de IV.3.

**Texto propuesto para RF-02:**
- **CA-8:** Dado un escenario en el que la regla determinante es una declaración, el sistema informa la entrada, el archivo y la línea de esa declaración, que coinciden con su ubicación en el escenario; si la regla determinante es nativa, la identifica como nativa, sin archivo.
- **Motivo de la prioridad:** Constituye la función diferencial del proyecto: ninguna solución relevada informa una decisión de permiso junto con la procedencia por declaración de la regla que la determina.

**Condiciones que invalidarían la decisión:**
1. **Una herramienta relevada informa archivo y posición de la regla determinante** (cuadrante 3 y 2). Se reabre el eje D: el diferencial se reduce a la semántica de OpenCode 1.18.25 y a los valores implícitos y declaraciones sin efecto, y se revisa la prioridad de RF-02.
2. **OpenCode incorpora la función de forma nativa.** Se activa la salida L-G.
3. **La referente objeta el CA-8.** Se conserva D-B y el diferencial se declara sin criterio propio, como limitación.
4. Las de ADR-057, eje L, siguen vigentes.

### Decisión del autor

**Aceptado por el autor el 01/10/2026**, sin cambios: D-C (CA-8 de RF-02 y nuevo motivo de prioridad), L-A con los descartes derivados de las fuerzas, L-G como salida estratégica y canales con el repositorio privado. El autor aprobó además la clasificación de Porter de la nómina (sección 0), el criterio de la Figura 2 y la nómina completa en el A.I.4.

### Consecuencias

**Al aceptarse:**
- **Libro y Anexo I:** RF-02 recibe CA-8 y el nuevo motivo de prioridad en `03-requisitos/libro/catalogo/RF-02.md` y en el Anexo I del Cap. III. Se informa a la referente junto con lo encolado (PV-03).
- **IV.1:**
  - el párrafo obligatorio declara la decisión cambiada (CA-8 de RF-02) y las dos confirmaciones;
  - el descarte de la inversión y de L-B, L-C, L-E y L-F se deriva de las fuerzas, y L-G queda como salida estratégica;
  - Tabla 10: «Canales» con el repositorio privado hasta la aprobación (cierra IV-05); «Propuesta de valor» con el diferencial en la combinación.
- **IV.3:** competidores actuales (sobre OpenCode), competidores potenciales con evidencia real (Amp, Codex), sustitutos con los sincronizadores de fuente única; la incidencia de Codex (Winning, 2026) queda solo como señal de demanda.
- **IV.4:** «RIGE ocupa el cuadrante que ninguna solución relevada alcanza» se conserva. «El diferencial defendible reside en el eje horizontal» se reemplaza por la combinación de ambos ejes.
- **Anexo III, D-31:** se amplían las alternativas y se reescribe el criterio de descarte.
- **Ventana del AE1:** A.I.4 con la nómina del 01/10/2026; el hallazgo 5 y la amenaza A1 del FODA precisados con la evidencia de Amp y Codex.
- **Fuentes:** alta en `01-relevamiento/fuentes.md` de las herramientas citadas.

### Evidencia

- `catedra/AE2-guia.md`, §5.1 a §5.3 y criterios v y vi.
- `informe/cap-04/IV.1-definicion-negocios.md`, `IV.3-analisis-rivalidad-amplificada.md` e `IV.4-mapeo-competencia.md`.
- `03-requisitos/libro/catalogo/RF-01.md` (CA-1, archivo y línea), `RF-02.md` (CA-1 a CA-7) y `RF-12.md`.
- Amp, *How we think about permissions*, ejemplo de `amp permissions test` (consulta del 01/10/2026).
- Documentación de reglas de Codex, `codex execpolicy check` (consulta del 01/10/2026).
- Nómina del 01/10/2026: `01-relevamiento/nomina-competidores-20261001.md`.
- ADR-057, eje L; Anexo III, D-31.
