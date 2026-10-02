# ADR-073 — RF-17 (conservación y recuperación de la resolución) y ajustes de criterio en RF-03, RF-04 y RF-10

- Estado: aceptado (01/10/2026)
- Fecha: 01/10/2026
- Capítulos afectados: Cap. III (III.3 Tabla 7, III.5, Anexo I); Cap. V (V.1, V.5); libro (catálogo, trazabilidad, `iteraciones.md`); cierra en parte PV-05, PV-08 y AR-08 (V-1)
- Origen: análisis ingenieril de los RF pedido por el autor en el documento de correcciones (`documento_de_correcciones.md` (retirado; consta en el commit `dfaf300`), III.5), sesión del 01/10/2026

### Contexto

El autor pidió revisar los RF desde la ingeniería: validez, completitud y la necesidad de requisitos nuevos. Se aplicaron las características de IEEE 29148 (necesario, singular, verificable, factible y trazable) sobre los 16 RF del catálogo (`03-requisitos/libro/catalogo/`). Surgieron cuatro hallazgos:

1. **Ningún RF exige conservar ni recuperar la resolución.** El caso vertical del v1 escribe la resolución en el almacén y la recupera (V.5, párrafo del v1), y la guía exige que el v1 vaya de la interfaz a la persistencia y de vuelta (`reglas-catedra.md`, §7). Sin embargo, la persistencia solo se traza a una restricción (RNF-01) y a una regla (RR-01). El almacén está diseñado (ADR-023 y ADR-061), pero ningún requisito lo justifica. Además, E-02 del acta (identificar sobre qué estado de las entradas se resolvió) no tiene criterio de aceptación (PV-05).
2. **RF-03:** E-01 del acta, que pide códigos de salida que distingan el error de la ausencia de resultado, no tiene criterio (PV-05). El CA-5 solo cubre el proyecto inexistente. El contrato ya está decidido en ADR-058, ADR-066 y ADR-069, e implementado en el incremento 0.
3. **RF-04:** el CA-1 menciona «los siete tipos declarados», pero el repositorio no los enumera (PV-08). El criterio no se puede verificar.
4. **RF-10:** el CA-3 compara con «el conjunto de herramientas que la herramienta ofrece en ejecución», lo que exige una sesión con un modelo. Eso no se puede reproducir y choca con RNF-05 (AR-08, V-1).

### Alternativas evaluadas

**Eje P · Persistencia**
- **P-A:** Requisito funcional nuevo (RF-17), Must, iteración 1.
- **P-B:** Ampliar RNF-01 con la recuperación.
- **P-C:** Sin cambio; la persistencia se sostiene en ADR-061.

**Eje E · Pedidos E-01 y E-02 del acta**
- **E-A:** E-01 como CA-6 de RF-03 y E-02 como CA-2 de RF-17.
- **E-B:** Condiciones de diseño en el Cap. VI, como dice hoy III.1.

**Eje T · Tipos de entrada de RF-04**
- **T-A:** Enumerarlos en el criterio a partir del orden de aplicación verificado en ADR-060, punto 3.
- **T-B:** Remitir a una lista del glosario.

**Eje V · RF-10, CA-3**
- **V-A:** Verificar contra la lista de herramientas que el código del tag filtra por permisos, sin ejecutar un modelo.
- **V-B:** Eliminar el CA-3.

### Análisis (trade-offs)

- **P-B** mezcla en un no funcional una capacidad y una restricción, y RNF-01 ya es una restricción validada. **P-C** deja sin trazar la estación de persistencia del v1, que es una pregunta probable del tribunal. **P-A** no suma horas, porque el almacén ya está planificado en la iteración 1 y diseñado en ADR-061 (retención de las últimas 20 resoluciones y tabla `entrada_leida`).
- **E-A** vuelve verificables dos pedidos de la referente con trabajo ya decidido. **E-B** los deja sin criterio comprobable en el catálogo de esta entrega.
- **T-A** deja el criterio autocontenido. **T-B** obliga a mantener la lista en dos lugares.
- **V-A** conserva la intención del criterio, que es comprobar el efecto real de la configuración sobre las herramientas ofrecidas, con un oráculo local. **V-B** pierde esa verificación.

### Recomendación y fundamento

**P-A + E-A + T-A + V-A.**

**RF-17** (nuevo):
- **Enunciado:** «RIGE conserva cada resolución de un proyecto con su fecha y el resumen de las entradas leídas, y permite recuperarla».
- **Tipo y prioridad:** Funcional · Must.
- **Motivo de la prioridad:** sostiene la estación de persistencia del caso vertical del v1 y permite identificar sobre qué estado de las entradas se resolvió (E-02).
- **CA-1:** resuelto un proyecto del entorno controlado, la resolución queda guardada en el almacén propio con su fecha, y su recuperación devuelve los mismos valores, procedencias y declaraciones desplazadas que la consulta que la produjo.
- **CA-2:** cada resolución declara el resumen del conjunto de entradas leídas. Si cambia el contenido de una entrada, una nueva resolución del mismo proyecto declara un resumen distinto (E-02).
- **CA-3:** el almacén conserva las últimas 20 resoluciones de cada proyecto (ADR-061).
- **Trazabilidad:** acta del 26/09/2026, E-02; ADR-023; ADR-061; V.5 (caso vertical del v1).
- **Estado de validación:** Pendiente.
- **Iteración prevista:** 1.
- **¿Integra el MVP?:** Sí.

**RF-03, CA-6** (nuevo): «El código de salida distingue el resultado del error: 0 cuando la consulta se resuelve, aun sin resultado (agente sin la clave consultada, acción compuesta), con el motivo en la salida; 1 ante un error de uso o de configuración (`configuracion-invalida`, `puerto-ocupado`); 70 ante un error interno. Los errores se emiten por el canal de error» (E-01; ADR-058, ADR-066, ADR-069).

**RF-04, CA-1** (precisado): «Dado un escenario con entradas de los siete tipos (archivos globales, archivo indicado por `OPENCODE_CONFIG`, archivos del proyecto, archivos JSON de los directorios `.opencode` y de `OPENCODE_CONFIG_DIR`, Markdown de agentes, comandos y modos de esos directorios, `OPENCODE_CONFIG_CONTENT` y `OPENCODE_PERMISSION`), el sistema las lista todas, informa su orden de precedencia y distingue las que no son archivos». Las vías remotas y la administrada quedan fuera (III.4) y se declaran como no observadas (ADR-060). **Inferencia a confirmar por el autor:** la lista sale de ADR-060, punto 3, sin las tres vías que excluye III.4. No consta en el repositorio que los «siete tipos» originales sean exactamente estos.

**RF-10, CA-3** (reescrito): «Ambos resultados coinciden con la lista de herramientas que el código de OpenCode 1.18.25 ofrece al modelo para ese agente tras aplicar sus permisos, obtenida sin ejecutar un modelo».

**RF-05:** sin cambios. Se mantiene el rechazo de los resultados ante otra versión (L-05) y se prepara su argumento para la defensa. Su factibilidad depende de AR-06.

**Condiciones que invalidarían la decisión:**
1. **El tag no permite obtener sin un modelo la lista de herramientas ofrecidas.** Se aplica V-B.
2. **Los «siete tipos» originales eran otros.** Se corrige la enumeración de RF-04.

### Decisión del autor

**Aceptado por el autor el 01/10/2026** (`/aceptar ADR-073`): P-A + E-A + T-A + V-A, con RF-05 sin cambios.

**Comentario del autor sobre los estados de validación:** precisar un criterio de aceptación no invalida un enunciado validado. RF-03, RF-04 y RF-10 conservan «Validado» y RF-07 vuelve a «Validado», porque la precisión de su CA-1 por ADR-060 no cambia su enunciado. Quedaban 20 de 27 validados.

**Actualización del autor (01/10/2026):** según informa el autor, la referente validó verbalmente los siete requisitos posteriores a la sesión (RF-12, RF-14, RF-16, RF-17, RNF-04, RNF-09 y RNF-10). Se registran en una extensión del acta (`01-relevamiento/validacion/20260925_GuiaValidacion_Sanchez_v2.md`), cuya fecha y firma completa el autor (U-04). Las 27 fichas quedan en «Validado».

### Consecuencias

- **Recuentos:** 27 requisitos (17 funcionales y 10 no funcionales), con 18 Must, 6 Should, 2 Could y 1 Won't. El conjunto Must sigue coincidiendo con el MVP.
- **Libro:** ficha nueva `RF-17.md`; RF-03, RF-04 y RF-10 actualizados; `trazabilidad.md`; `iteraciones.md` (RF-17 en la iteración 1).
- **Informe:**
  - III.5: recuentos y párrafo de trazabilidad;
  - Anexo I: ficha de RF-17, criterios de RF-03, RF-04 y RF-10, y matriz;
  - III.3, Tabla 7: RF-17 junto a F2 o a la persistencia;
  - III.1: el cierre deja de remitir E-01 y E-02 al Cap. VI;
  - V.1 y V.5: RF-17 en el v1.
- **Pendientes:** PV-05 queda cerrado; PV-08 queda cerrado en lo que respecta a RF-04; AR-08 cierra V-1.
- **Estados de validación:** los 27 requisitos quedan «Validado» (acta del 26/09/2026 y su extensión; ver la actualización del autor).

### Evidencia

- `03-requisitos/libro/catalogo/RF-03.md`, `RF-04.md`, `RF-10.md`; `informe/cap-05/V.5-descripcion-producto-minimo-viable.md`, línea 34.
- ADR-060, punto 3 (orden de aplicación en `opencode/src/config/config.ts:370-591`, tag v1.18.25).
- ADR-058, ADR-061, ADR-066, ADR-069; acta del 26/09/2026, E-01 y E-02.
