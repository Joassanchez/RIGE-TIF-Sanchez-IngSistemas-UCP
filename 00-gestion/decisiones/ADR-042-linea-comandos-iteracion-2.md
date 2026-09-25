# ADR-042 — La línea de comandos es la interfaz completa y se adelanta a la iteración 2; la interfaz web queda limitada a formularios y vistas mínimas, y el v1 se construye sobre ella

- Estado: aceptado (25/09/2026), alternativa B'
- Fecha: 25/09/2026 (ampliado el mismo día con las alternativas B' y D y la verificación contra V.4; corregida la mención a la validación del v0, que no se realizó)
- Capítulos afectados: Cap. V (V.1, Tabla 14; V.2; V.4, Tablas 18 y 19 y párrafo de la línea 67; V.5); Cap. III (III.3); libro (RF-03, RF-10: iteración prevista); Instrumento 35; `src/README.md`
- Origen: sesión del 25/09/2026. El autor propone priorizar la línea de comandos sobre la interfaz gráfica; evalúa y descarta dejar solo la línea de comandos; elige una interfaz web limitada y una línea de comandos más amplia
- Relacionado: ADR-021 (explicación por plantillas), ADR-032 (stack e interfaz web local), ADR-035 (RF-10 → Should), ADR-040 (medición con agentes), ADR-041 (línea de comandos con permisos)

### Contexto

**Por qué se reabre el orden de las interfaces.**

- En la medición final (ADR-040), el agente usa RIGE solo por la línea de comandos. La interfaz web no interviene (`01-relevamiento/linea-base/DISENO-medicion-agentes.md`, línea 195).
- ADR-041 (aceptado) amplía la línea de comandos a las decisiones de permiso, porque ocho de los dieciséis casos de la medición son de permisos.
- ADR-032 descartó la línea de comandos como interfaz humana por dos razones. La primera fue que la guía describe la interfaz del v1 como «un formulario mínimo y una vista de consulta». La segunda fue que la medición final suponía participantes humanos que leen la explicación en prosa. La segunda razón dejó de valer con ADR-040. La primera sigue vigente.

**Datos del repositorio que condicionan la decisión.**

- **Tabla 14 (V.1):** RF-03 está en la iteración 3 (26/10 al 07/11), que cierra una semana antes de la congelación (14/11).
- **Tabla 18 (V.4, líneas 20 a 45):**
  - la iteración 2 está planificada en 51 h, igual a su capacidad;
  - la iteración 3, en 34 h;
  - RF-03 ocupa 6 h en la iteración 3;
  - la «Interfaz de consulta de permiso» web ocupa 4 h en la iteración 2;
  - RF-10 comparte una tarea de 12 h en la iteración 2 y la Tabla 19 le asigna 4 h.
- **ADR-035 (aceptado):** RF-10 pasa a Should. Según V.4 (línea 49), los Should no reciben horas.
- **ADR-041:** estima de 3 a 5 h adicionales para la consulta de permisos por línea de comandos. Esas horas todavía no figuran en la Tabla 18.
- **Tabla 19 (V.4, línea 59) y línea 67:**
  - la cláusula de contingencia posterga RF-03 en tercer lugar;
  - la justificación es que «sin RF-03, el OE-1 pierde únicamente su verificación por esa interfaz»;
  - la línea 69 declara que no se sacrifican los casos de uso sobre los que se ejecuta la medición final;
  - desde ADR-040 y ADR-041, RF-03 es uno de ellos, así que las dos afirmaciones se contradicen.
- **Guía de comprobación del v1** (`catedra/AE2-guia-comprobacion-v1.md`, pasos 7 y 8):
  - exige que la aplicación «levanta y responde en la dirección declarada»;
  - exige que el dato «se recupera y se muestra»;
  - aclara que la cátedra «no interpreta ni suple pasos».
- **OE-1 y OE-2** exigen la coincidencia de resultados «por ambas interfaces» (I.2.4).
- **Actor humano:** I.6 declara al desarrollador como único actor humano de RIGE. La maqueta del v0 representa un recorrido por pantallas (I.6.6, ADR-009). Su validación con la referente está pendiente: el autor informa el 25/09/2026 que no se realizó, y se incorpora a la sesión del Instrumento 31 (guía v2, sección 7).

### Alternativas evaluadas

- **A:** El v1 se hace solo por línea de comandos, y la interfaz web se agrega después.
- **B:** El v1 conserva la interfaz web mínima. RF-03 completo (valores y permisos, ADR-041) pasa de la iteración 3 a la 2. No se ajusta ninguna otra tarea.
- **B':** Igual que B, más tres ajustes:
  1. la interfaz web queda limitada (ver la definición en «Recomendación»);
  2. se rebalancean las horas, sacando RF-10 de la capacidad y pasando la pantalla web de permisos a la iteración 3;
  3. RF-03 sale de la cláusula de contingencia.
- **C:** Sin cambios en el orden. RF-03 queda en la iteración 3.
- **D:** Solo línea de comandos durante todo el TIF. La interfaz web se declara como límite del sistema y como trabajo futuro.

### Análisis (trade-offs)

- **A:**
  - Es la más barata y la más alineada con la medición.
  - Arriesga la comprobación del v1, porque el paso 7 supone un proceso que escucha en una dirección.
  - Además deja para después una interfaz que igual hay que construir.
- **B:**
  - Cumple la guía del v1 y deja la línea de comandos estable antes de la medición final.
  - La iteración 2 queda en 60 a 62 h (51 + 6 + 3 a 5) sobre una capacidad de 51 h: el plan no cierra.
  - La Tabla 19 sigue sacrificando RF-03, en contradicción con ADR-041 y con la propia V.4 (línea 69).
- **B':**
  - Cumple la guía del v1 y protege la herramienta que usa la medición final.
  - Deja las iteraciones cerca de su capacidad: la iteración 2 queda en unas 53 h y la 3 en unas 32 h (ver «Consecuencias»).
  - El Cap. V queda coherente con ADR-035, ADR-040 y ADR-041.
  - Costo: hay que corregir más texto en V.4 (Tablas 18 y 19 y el párrafo de la línea 67).
  - Costo: la contingencia pierde las 6 h de RF-03 y las 4 h de RF-10, así que hay que cubrir 10 h con otras postergaciones.
  - Costo: la iteración 2 queda unas 2 h por encima de su capacidad.
- **C:** Si la iteración 3 se atrasa, la medición final se queda sin la herramienta que mide.
- **D:**
  - Es la más coherente con la medición y libera de 10 a 14 h. Es una estimación: suma las 10 h de interfaz de la Tabla 18 y las pruebas de coincidencia entre interfaces.
  - También reduce la superficie de prueba y deja RIGE sin ningún proceso en escucha (RNF-05).
  - En contra: depende de que la cátedra acepte un v1 sin dirección de escucha (paso 7).
  - En contra: modifica contenido aprobado del AE1, en particular OE-1 y OE-2 «por ambas interfaces», la función F6 y el v0 como recorrido de pantallas.
  - En contra: deja al actor humano con una interfaz pensada para agentes.

### Recomendación y fundamento

Recomendación del ingeniero: **B'.**

- **Cada interfaz tiene su consumidor.**
  - La línea de comandos es la interfaz completa, porque es la que usa el agente, y el agente es el que mide el efecto de RIGE (ADR-040).
  - La interfaz web atiende al desarrollador y es la que la cátedra comprueba en el v1.
- **Qué significa «interfaz web limitada».** Se reduce a formularios y vistas de consulta mínimas sobre las mismas resoluciones del núcleo: valores con su procedencia, decisiones de permiso y hallazgos. No agrega ninguna función que la línea de comandos no tenga, ni navegación elaborada.
- **La coincidencia entre ambas interfaces de OE-1 y OE-2 se verifica sobre lo que la web muestra.**
- **B' en lugar de B:** B mueve la tarea pero deja el plan desbordado y la contingencia en contradicción con un ADR aceptado.
- **B' en lugar de D:** D obliga a reescribir objetivos aprobados en el AE1 y deja al desarrollador sin la interfaz que representa el v0.

**Condición que invalidaría la decisión:** que RF-02 no cierre en la iteración 2. En ese caso, la línea de comandos de permisos no tiene qué exponer, esa parte de RF-03 sigue a RF-02 a la iteración 3, y la protección de la medición final se replantea en la cláusula de contingencia.

### Decisión del autor

- El autor evalúa D (solo línea de comandos) y la descarta.
- **Elige B'** (25/09/2026): una interfaz web limitada y una línea de comandos más amplia.
- **Aceptado por el autor el 25/09/2026: alternativa B'.**

### Consecuencias

**V.4, Tabla 18.** Esta es la propuesta de horas; los números exactos se fijan en `/corregir`.

| Movimiento | Iteración 2 | Iteración 3 |
|---|---|---|
| Hoy | 51 | 34 |
| RF-10 sale de la capacidad (Should, ADR-035) | −4 | |
| La interfaz web de consulta de permiso pasa a la iteración 3 | −4 | +4 |
| RF-03, salida por línea de comandos, pasa a la iteración 2 | +6 | −6 |
| Consulta de permisos por línea de comandos (ADR-041; punto medio de 3 a 5 h, suposición) | +4 | |
| **Resultado** | **~53** | **~32** |

El total sigue en 136 h: RF-10 libera 4 h y ADR-041 suma 4 h.

**Hallazgos por línea de comandos (agregado al aceptar, 25/09/2026).** Como la interfaz web no puede tener funciones que falten en la línea de comandos, esta también expone los hallazgos de RF-07. La Tabla 18 no lo preveía.
- Se suma a la iteración 3, junto con RF-07, con una estimación de ~2 h (suposición).
- Se incorpora al criterio de RF-07 («por ambas interfaces»), no al de RF-03. Así RF-03 cierra completo en la iteración 2.
- Con esto la iteración 3 queda en **~34 h**, igual a su capacidad, y el total en ~138 h. Las 2 h de diferencia con las 136 h se absorben en `/corregir` de V.4, al reducir la estabilización o una tarea de la iteración 3.

**V.4, Tabla 19 y párrafos de las líneas 67 y 69.**
- RF-03 sale de la cláusula de contingencia y pasa a lo que no se sacrifica, junto con los casos de uso de la medición final.
- RF-10 sale de la tabla, porque ya no tiene horas.
- Hay que cubrir 10 h con otras postergaciones. El candidato es la interfaz web de consulta de permiso (4 h), coherente con la interfaz limitada, porque la decisión de permiso sigue disponible por línea de comandos. El resto sale de una reducción mayor de la estabilización. Se resuelve en `/corregir`.
- El párrafo de la línea 67 se reescribe, porque su fundamento dejó de ser cierto.

**Resto del informe y del repositorio.**
- **V.1, Tabla 14:**
  - el objetivo verificable de la iteración 2 incluye la línea de comandos de valores y de permisos;
  - el de la iteración 3 incorpora las vistas web de permisos y de hallazgos y conserva la verificación de coincidencia entre interfaces;
  - «interfaz de escritorio» pasa a «interfaz web local» (ADR-032, AD-07).
- **V.2 y V.5:** los entregables y los casos de uso por iteración siguen el nuevo orden.
- **III.3:** se declara el alcance de cada interfaz. La web queda limitada a formularios y vistas mínimas; la línea de comandos es completa.
- **Libro:** RF-03 pasa a iteración prevista 2 y RF-10 a «Sin asignar» (Should). Esto resuelve la duda de AD-10.
- **Instrumento 35 y `src/README.md`:** el caso de uso vertical del v1 se declara sobre la interfaz web.
- **Se hace junto con ADR-041** (AD-21), en la misma pasada por los Caps. III y V.

**Punto abierto, fuera de este ADR.** ADR-021 limita la explicación en prosa a la interfaz de escritorio y deja a la línea de comandos solo con datos estructurados. Con la línea de comandos como interfaz completa, conviene decidir si su salida incluye la explicación. La decisión afecta el esquema de ADR-036.

### Síntesis para el cuerpo del capítulo

Destino: V.1 y III.3, en dos o tres oraciones (diseño del sistema, 6.2). Contenido que deben transmitir:

- RIGE ofrece dos interfaces sobre el mismo núcleo, cada una con su consumidor.
- La línea de comandos es la interfaz completa, porque es la vía por la que un agente consulta la configuración, y así lo hace en la medición del resultado. Por eso se construye en la segunda iteración, con margen antes de la versión congelada.
- La interfaz web se limita a formularios y vistas de consulta para el desarrollador, y sobre ella se acredita la arquitectura en el v1.
- Se descarta ofrecer solo la línea de comandos, porque el desarrollador es el actor humano del sistema y el recorrido por pantallas del prototipo v0 lo representa.

### Evidencia

- `informe/cap-05/V.1-definicion-iteraciones-sprints.md` (Tabla 14)
- `informe/cap-05/V.4-cronograma.md` (Tabla 18, líneas 20 a 45; línea 49; Tabla 19, línea 59; líneas 67 y 69)
- `catedra/AE2-guia-comprobacion-v1.md` (pasos 7 y 8, regla de la comprobación)
- `catedra/AE2-guia.md` (8.1, estaciones del recorrido vertical)
- `informe/cap-01/I.2-mision-vision-objetivos-proyecto.md` (OE-1, OE-2 y línea 30)
- `informe/cap-01/I.6-descripcion-detallada-sistema-informacion.md` (actor humano; I.6.6)
- `01-relevamiento/linea-base/DISENO-medicion-agentes.md` (línea 195)
- ADR-009, ADR-021, ADR-032, ADR-035, ADR-040 y ADR-041
