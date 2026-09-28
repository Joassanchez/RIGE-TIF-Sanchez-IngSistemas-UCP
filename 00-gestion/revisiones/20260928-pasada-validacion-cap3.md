# Pasada posterior a la validación · Fase 3 · Cap. III y Anexos I y V

- Fecha del informe: 28/09/2026
- Objeto: `informe/cap-03/III.1` a `III.5`; `informe/anexos/anexo-I-cap3-catalogo-requisitos-matriz-trazabilidad.md`; `informe/anexos/anexo-V-cap3-glosario-dominio-reglas-negocio.md`
- Base: acta del 26/09/2026 (82 puntos confirmados sin observaciones; constancia de conformidad pendiente de firma, U-04); libro corregido en la fase 2 (`00-gestion/revisiones/20260928-pasada-validacion-libro.md`); ADR-032, 033 (sin renumerar), 035, 036, 037, 040, 041, 042, 044 y 045.
- Aplicación: con `/corregir` (redactor), **una sección por vez**. Cada sección vuelve a «borrador» en `estado.md`.
- Estado: **aplicado el 28/09/2026** (sección 11).

Convenciones: **[R]** dato del repositorio · **[A]** dato del autor · **[I]** conocimiento general · **[S]** suposición.

---

## 0. Tres hallazgos que merecen atención antes que el resto

1. **III.4 afirma una conformidad que no existe todavía** (línea 29: «constan en el acta de validación del Anexo II con su conformidad»). La constancia está pendiente de firma (U-04). Hay que decir «confirmadas sin observaciones» y nada sobre la conformidad hasta que llegue el archivo.
2. **III.5 da cifras de trazabilidad falsas** (línea 5: «Dieciséis se trazan a resultados del relevamiento técnico, cuatro a hallazgos del análisis y seis incorporan acuerdos»). El recuento sobre el libro da **once, siete y once**, más **ocho** que remiten a funciones o apartados del informe de la AE1 [R, conteo de la columna Trazabilidad de las 23 fichas]. El error de «dieciséis» es anterior a esta pasada.
3. **III.2 atribuye «verificación en ejecución» a reglas que describen a RIGE** (línea 86: «Diez se encuentran verificadas sobre la versión 1.18.25 mediante ejecución»). RE-02 y RE-03 fijan cuándo RIGE marca un hallazgo: no se pueden haber ejecutado sobre OpenCode [S]. Es una pregunta fácil para el tribunal.

---

## 1. III.1 · Entorno

| # | Línea | Texto actual | Corrección | Sostén |
|---|---|---|---|---|
| F3-01 | 12 | «Acta de validación del \[fecha\]; AE1, II.6.1, hallazgo HA-3» | «Acta de validación del 26/09/2026, E-01; AE1, II.6.1, hallazgo HA-3» | V-01, A-05 |
| F3-02 | 17 | «Acta de validación del \[fecha\]» | «Acta de validación del 26/09/2026, E-02» | V-01, A-05 |
| F3-03 | 14 | «AE1, Tabla 11» | «AE1, Tabla 10» | T-09 (remisión rota) |
| F3-04 | 15 | «…lo que origina un requisito de portabilidad con plataformas declaradas» | «…lo que origina un requisito de portabilidad sobre Ubuntu 26.04 y Windows 11 (RNF-06)». Fuente: agregar «; acta del 26/09/2026, L-11» | ADR-037; acta, L-11 (el equipo de la referente programa en Windows) |

Sin otros cambios. La línea 25 atribuye el esquema versionado al agente consumidor, no a RNF-08, como pide ADR-036.

---

## 2. III.2 · Dominio

| # | Línea | Texto actual | Corrección | Sostén |
|---|---|---|---|---|
| F3-05 | 11 | «…los términos que el referente utiliza» | «…los términos que la referente utiliza» | Coherencia con el acta |
| F3-06 | 31 a 38 (Tabla 3) | Reclasificaciones con texto adicional | Las mismas del libro (F2-40 a F2-45): Procedencia, Archivo y Versión de OpenCode → «Atributo de otra entidad»; Desarrollador, Agente consumidor y Credencial → «Elemento del entorno», con el detalle en la columna Criterio | M-13 |
| F3-07 | 53 y 59 (Tabla 4) | «1 a N» en «Una declaración contiene ninguna o muchas sustituciones» y «Una resolución produce ninguno o muchos hallazgos» | «1 a N, opcional», igual que la notación de la línea 54 | La frase validada dice «ninguna o muchas»; la columna no la reflejaba. No cambia lo validado |
| F3-08 | 62 | «…validadas con el referente en la sesión del \[fecha\].» | «…validadas con la referente en la sesión del 26/09/2026.» | V-01 |
| F3-09 | 64 a 67 (Figura 1) | Espacio reservado; «acta de validación del \[fecha\]» | Ver la sección 3 (propuesta de elaboración). Fecha del epígrafe: 26/09/2026 | V-02 |
| F3-10 | 69 | «La relación reflexiva entre elementos representa los vínculos…» | Agregar al final: «La relación forma parte del modelo, aunque su representación en el sistema queda diferida como capacidad posterior (RF-13), conforme a la decisión L-12 validada en la sesión del 26/09/2026.» | Acta, L-12 y sección 4 (línea 372 de la guía); ADR-034 |
| F3-11 | 86 | «Diez se encuentran verificadas sobre la versión 1.18.25 mediante ejecución de escenarios controlados y tres derivan de decisiones de alcance validadas con el referente» | «Las trece se validaron con la referente en la sesión del 26/09/2026. Las siete de derivación describen el comportamiento de OpenCode 1.18.25 y se verificaron, además, mediante la ejecución de escenarios controlados; las tres de existencia fijan cuándo el sistema registra un elemento o un hallazgo; y las tres de restricción derivan de decisiones de alcance.» | Hallazgo 0.3; M-13 |
| F3-12 | 90 a 92 (Tabla 6) | Estado «Verificada en ejecución» (RD-03, RE-02); Fuente «Acta del \[fecha\]» (RR-01) | Igual que el libro: estado «Validada» en las tres; Fuente con «; acta del 26/09/2026» (RD-03, RE-02) y «Acta del 26/09/2026, decisión L-01» (RR-01) | M-13, A-05 |
| F3-13 | 96 | «Dos entradas se registran como términos en disputa. La primera…» | «Dos términos presentaban un uso ambiguo, y ambos se resolvieron con la referente en la sesión del 26/09/2026. El primero…» (el resto sin cambios, con «La segunda» → «El segundo») | Glosario: «En disputa» → «No» (C-3 de la fase 2) |
| F3-14 | — | Asterisco escapado «\*source\*» (línea 96) | Cursiva real: «*source*» | M-15 |

---

## 3. Figura 1 · Propuesta de elaboración (V-02)

No la dibujo ni la invento: esta es la propuesta para que decidas cómo se construye.

**Qué representa (solo lo validado).**
- Las **9 entidades** de la Tabla 2.
- Las **11 relaciones** de la Tabla 4, con la cardinalidad de cada frase.
- La **especialización** Agente → Elemento (III.2.2, línea 42).
- La relación reflexiva de Elemento, marcada como diferida (L-12).
- **Nada más.** Ninguna relación, atributo o entidad que la referente no haya visto. Los atributos de A.V.3 no se validaron, así que no van en la figura.

**Notación.** Diagrama de clases UML en su uso conceptual (modelo del dominio de Larman, 2004, ya citado en III.2.2): clases sin métodos, asociaciones con nombre y multiplicidad, generalización para Agente. Cada asociación lleva el verbo de la frase validada, para que se pueda leer en voz alta, que es lo que pide la plantilla (`catedra/AE2-plantilla-informe.md`, línea 108).

**Correspondencia entre frase y multiplicidad** (para revisar antes de dibujar):

| Frase validada (Tabla 4) | Multiplicidad UML |
|---|---|
| Un proyecto analizado se resuelve en muchas resoluciones sucesivas | Proyecto 1 — 1..* Resolución |
| Una resolución lee muchas entradas de configuración | Resolución 1 — 1..* Entrada |
| Una entrada contiene muchas declaraciones | Entrada 1 — 1..* Declaración |
| Una declaración contiene ninguna o muchas sustituciones | Declaración 1 — 0..* Sustitución |
| Una declaración puede quedar desplazada por otra de mayor precedencia | Declaración 0..1 — 0..1 Declaración (reflexiva, «desplaza a») |
| Un elemento se compone de muchas declaraciones, una determinante | Elemento 1 — 1..* Declaración |
| Un elemento se relaciona con muchos otros elementos | Elemento * — * Elemento (reflexiva, diferida) |
| Un agente evalúa una cadena ordenada de muchas reglas de permiso | Agente 1 — 1..* Regla de permiso {ordered} |
| Un agente puede invocar muchos subagentes | Agente 1 — 0..* Agente (reflexiva, «invoca») |
| Una resolución produce ninguno o muchos hallazgos | Resolución 1 — 0..* Hallazgo |
| Un hallazgo recae sobre un elemento o sobre una declaración | Hallazgo * — 1 Elemento / Declaración, con restricción {xor} |

**Dos puntos para decidir:**
- **«Una entrada contiene muchas declaraciones» (1..*):** una entrada vacía o ilegible no tiene declaraciones. La frase validada dice «muchas», así que el dibujo debe decir 1..*; si preferís 0..*, se cambia la frase, y eso ya no es lo que validó la referente [S]. Recomiendo respetar la frase.
- **«Invoca subagentes» con «hereda sus reglas de denegación»:** la herencia es una regla (RD-05), no una asociación. Va como nota en el diagrama, no como segunda línea.

**Cómo se produce.**
- **Fuente versionada:** texto Mermaid (`classDiagram`) o PlantUML en `03-requisitos/modelo-dominio.mmd`, junto al resto del modelo del dominio. La guía ubica el modelo del dominio en `/03-requisitos` (`catedra/AE2-guia.md`, línea 917) [R].
- **Imagen:** exportada a PNG en `informe/figuras/cap-03/figura-modelo-dominio.png`, como las figuras de los Caps. IV y V [R]. Con Mermaid, la exportación se hace con `npx @mermaid-js/mermaid-cli` (Node está instalado) [R]. PlantUML requiere Java, que no está disponible en este equipo [R].
- **Recomiendo Mermaid**: sin instalación nueva y con la fuente legible en el repositorio.
- **Quién hace qué:** el ingeniero escribe la fuente, porque `03-requisitos/` está autorizada en esta pasada. La imagen va en `informe/figuras/`, carpeta del redactor, y el redactor reemplaza el espacio reservado. **Si el texto Mermaid lo escribo yo, corresponde declararlo como herramienta auxiliar** (herramienta, función y artefacto).

**Un riesgo para la defensa, sin corrección ahora.** La Tabla 2 define la Regla de permiso como «Declaración que produce una decisión de permiso, de carácter nativo o declarado». Una regla **nativa** no está escrita en ninguna entrada, así que no es una declaración en el sentido del glosario («asignación concreta escrita dentro de una entrada»). La definición está validada y no la toco. Si el tribunal pregunta, la respuesta es que «declaración» se usa ahí en sentido amplio, y conviene tenerla preparada.

---

## 4. III.3 · Alcance

| # | Línea | Texto actual | Corrección | Sostén |
|---|---|---|---|---|
| F3-15 | 3 | «…por dos interfaces: una aplicación de escritorio destinada al desarrollador y una salida por línea de comandos destinada a los agentes…» | «…por dos interfaces sobre el mismo núcleo: una línea de comandos completa, destinada a los agentes que crean o modifican configuración por encargo del desarrollador y al desarrollador que trabaja en la terminal, y una interfaz web local, que se abre en el navegador del propio equipo y se limita a formularios y vistas de consulta de valores, permisos y hallazgos…» | ADR-042, AD-07; acta, L-10 |
| F3-16 | 5 | «…lo que este equipo compromete…» | «…lo que el proyecto compromete…» | Autoría individual (V.3) |
| F3-17 | 5 | «…a los quince requisitos que el catálogo identifica con prioridad Must; a la salida por línea de comandos en su versión mínima, esto es, un comando único de consulta de valores efectivos con procedencia; a las dos mediciones con participantes previstas…» | «…a los catorce requisitos que el catálogo identifica con prioridad Must; a la línea de comandos completa, que informa valores efectivos, decisiones de permiso y hallazgos, desde la segunda iteración; a la interfaz web limitada, sobre la cual se acredita el prototipo v1; a las dos mediciones previstas en los apartados I.3.2 y I.3.4 del informe de la AE1, con agentes de programación como ejecutores del procedimiento…» | ADR-035, ADR-041, ADR-042, ADR-040 |
| F3-18 | 13 (Tabla 7) | «Salida por línea de comandos, comando único de consulta de valores efectivos \| Comprometida» | «Línea de comandos: valores, decisiones de permiso y hallazgos, con esquema versionado \| Comprometida» | ADR-041, ADR-042 |
| F3-19 | 20 | «…veinte horas semanales reales sobre un período de nueve semanas, lo que arroja un presupuesto total de ciento ochenta horas; …el presupuesto efectivo asciende a ciento cincuenta y tres horas. Los quince requisitos Must…» | «…veintiocho horas semanales reales —veinte técnicas y ocho de reserva documental— sobre un período de ocho semanas, lo que arroja un presupuesto total de doscientas veinticuatro horas; descontada una reducción prevista del quince por ciento por exámenes y feriados, el presupuesto efectivo asciende a ciento noventa horas, de las cuales ciento treinta y seis son técnicas. Los catorce requisitos Must…» | AD-01; V.4, Tabla 17; ADR-030 |
| F3-20 | 20 | «Los cuatro requisitos Should quedan comprometidos de manera condicionada y son los primeros en abandonarse si el presupuesto se reduce» | «Los cinco requisitos Should carecen de horas asignadas y se incorporan si las horas lo permiten» | ADR-035 (RF-10 pasa a Should); V.4, línea 49; guía v2, definición de Should validada |

**Dependencia de la fase 5.** Si en AD-23 se decide que el total técnico supera las 136 h, la cifra de F3-19 no cambia (es la capacidad), pero conviene revisar la frase «se planifican dentro de esa cifra» después de decidir.

---

## 5. III.4 · Límites

| # | Línea | Texto actual | Corrección | Sostén |
|---|---|---|---|---|
| F3-21 | 3 | «…validada con el referente…» | «…validada con la referente…» | Coherencia |
| F3-22 | 5 | «…agrega cuatro que este capítulo incorpora, señaladas como tales: el alcance acotado de la salida por línea de comandos, la no intervención…» y «…nueve de ellas se sometieron al referente en la sesión del \[fecha\]. Las exclusiones que responden a una expectativa posible de la organización se sometieron al referente en la sesión del \[fecha\]…» | Reescribir: el capítulo incorpora como nuevas la no intervención sobre los cambios del agente (L-07), las dos interfaces (L-10), los sistemas operativos (L-11), las relaciones entre elementos (L-12), la explicación sin modelo de lenguaje (L-13), las instrucciones en subdirectorios y el motivo corregido de las aprobaciones permanentes; y revisa el alcance de la línea de comandos (L-06). Las decisiones L-01 a L-07 y L-09 a L-13 se sometieron a la referente en la sesión del 26/09/2026 (una sola mención de la fecha, no dos) | ADR-037, 041, 042, 034, 021/036; acta |
| F3-23 | 9 a 17 | «Validado · acta del \[fecha\], decisión L-0n, Anexo II» | «Validado · acta del 26/09/2026, decisión L-0n, Anexo II» | A-05, V-01 |
| F3-24 | 14 (L-06) | «Consulta de valores efectivos por línea de comandos \| Consulta de permisos, listados, exportación y consulta inversa por esa vía \| El comando mínimo cubre la necesidad relevada sin comprometer horas que exceden el presupuesto…» \| «…· nuevo en esta entrega» | «Consulta por línea de comandos de valores efectivos, decisiones de permiso y hallazgos, con salida conforme a un esquema versionado y explicación a pedido \| Listados de elementos, exportación del ecosistema completo y consulta inversa por esa vía \| Un agente solo puede usar RIGE por esta vía y las consultas de permisos son tan relevantes como las de valores; la explicación se entrega a pedido para no aumentar el texto que el agente procesa en cada consulta» \| «…· revisada en esta entrega» | ADR-041, ADR-042, ADR-036; acta, L-06 |
| F3-25 | 17 | «Validación completa contra el esquema publicado» | «Validación completa contra el esquema de configuración publicado de la herramienta» | AD-11 (ambigüedad con el esquema de salida de RIGE) |
| F3-26 | después de 17 | — | Cuatro filas nuevas, validadas: **L-10** «Interfaz web local limitada a formularios y vistas de consulta de valores, permisos y hallazgos» \| «Exploración libre del ecosistema, filtros y navegación entre elementos en la interfaz web» \| «El agente consulta por la línea de comandos; limitar la interfaz web concentra el esfuerzo en la exactitud de los resultados» · **L-11** «Ubuntu 26.04, plataforma de referencia, y Windows 11, con instalación nativa sin privilegios administrativos» \| «Acreditación en macOS» \| «El proyecto dispone de ambos sistemas para verificar y no de un equipo con macOS» · **L-12** «Cada elemento con su procedencia» \| «Representación de los vínculos entre elementos» \| «Las relaciones requieren un desarrollo propio que excede las horas del período; el proyecto prioriza qué valor rige, de dónde viene y qué decide cada permiso» · **L-13** «Explicación de las decisiones de permiso y de los hallazgos mediante plantillas deterministas» \| «Explicación generada por un modelo de lenguaje» \| «Un modelo exigiría conexión externa, podría responder distinto ante la misma pregunta y tendría costo por uso; con plantillas, la explicación se verifica igual que la decisión». En las cuatro: «Referente» y «Validado · acta del 26/09/2026, decisión L-1n, Anexo II · nuevo en esta entrega» | Acta, L-10 a L-13 |
| F3-27 | 18 a 25 | «Fundamentada · Anexo III» | «Fundamentada · Anexo III · presentada a la referente sin observaciones (acta del 26/09/2026)» | Acta, sección 2 (se presentaron para conocimiento) |
| F3-28 | 29 | «Las nueve sometidas al referente constan en el acta de validación del Anexo II con su conformidad; las ocho restantes…» | «Las trece filas sometidas a la referente, correspondientes a doce decisiones, constan en el acta de validación del Anexo II, confirmadas sin observaciones en la sesión del 26/09/2026; las ocho restantes…» | **Hallazgo 0.1.** No afirma conformidad (U-04). Trece filas: L-01 a L-07, L-09 dos veces y L-10 a L-13 |

---

## 6. III.5 · Catálogo

| # | Línea | Texto actual | Corrección | Sostén |
|---|---|---|---|---|
| F3-29 | 3 | «…seguridad, fiabilidad, mantenibilidad, portabilidad, rendimiento y compatibilidad. Quince llevan prioridad Must, cuatro Should…» | «…seguridad, fiabilidad, mantenibilidad, portabilidad y rendimiento. Catorce llevan prioridad Must, cinco Should, tres Could y uno Won't…». Agregar: «Los veintitrés requisitos se validaron con la referente en la sesión del 26/09/2026.» | ADR-035, ADR-036 (M-01); la plantilla pide «qué proporción quedó validada con el referente» (`catedra/AE2-plantilla-informe.md`, línea 145) |
| F3-30 | 5 | «Dieciséis se trazan a resultados del relevamiento técnico, cuatro a hallazgos del análisis y seis incorporan acuerdos validados con el referente» | «Once se trazan a resultados del relevamiento técnico, siete a hallazgos del análisis, once a acuerdos del acta de validación y ocho a funciones o apartados del informe de la AE1» | **Hallazgo 0.2**; recuento sobre el libro |
| F3-31 | 18 (RF-10) | «Must» | «Should» | ADR-035 |
| F3-32 | 11 (RF-03) | «Salida estructurada y determinista por línea de comandos» | «Consulta de valores y de permisos por línea de comandos, con salida estructurada, determinista y versionada» | ADR-036, ADR-041 |
| F3-33 | 29 a 31 (RNF-06 a RNF-08) | «Resolución de rutas por sistema operativo» · «Tiempo máximo de resolución sobre un equipo de referencia» · «Estabilidad del esquema de salida por línea de comandos \| Compatibilidad» | «Resolución de rutas en Ubuntu 26.04 y Windows 11, con instalación sin privilegios» · «Tiempo máximo de una consulta por línea de comandos» · «Compatibilidad del esquema de salida entre versiones \| Mantenibilidad» | ADR-037, ADR-044/045, ADR-036 |
| F3-34 | 35, primera precisión | «…la explicación en lenguaje natural que acompaña las decisiones de permiso y los hallazgos: se genera…» | «…que acompaña las decisiones de permiso y los hallazgos en ambas interfaces, y por línea de comandos a pedido: se genera…» | ADR-036 (E3) |
| F3-35 | 35, segunda precisión | «…los dos requisitos no funcionales que conservan un valor por declarar: …Ambos valores se establecen antes del cierre de la primera iteración…» | Reescribir con los valores fijados: RNF-06 se acredita en Ubuntu 26.04, plataforma de referencia, y en Windows 11, con macOS sin acreditar; RNF-07 fija 2 s por consulta, umbral que la referente acepta, sobre un proyecto del doble del mayor entre un proyecto público de referencia y el del equipo de la referente, en la máquina virtual Ubuntu 26.04. Conservar la última oración («un requisito no funcional sin magnitud…»), que ahora se cumple | ADR-037, ADR-044, ADR-045; acta, 3.2 |
| F3-36 | 35, tercera precisión (nueva) | — | «RNF-08 se clasifica en mantenibilidad: expresa una política de evolución que permite modificar el esquema sin romper a su consumidor. La norma ISO/IEC 25010 lo ubica en compatibilidad, categoría ausente de la lista de la cátedra.» | ADR-036 (M-01). **Condición:** ISO/IEC 25010 no está en `01-relevamiento/fuentes.md` ni en la bibliografía [R]. Hay que darla de alta con `/fuente` antes de citarla, o quitar la mención a la norma |

---

## 7. Anexo I · Catálogo y trazabilidad

Se alinea con el libro corregido en la fase 2. El Anexo I conserva los seis campos de la plantilla (identificador, enunciado, tipo, prioridad y criterio, criterio de aceptación, trazabilidad), sin el estado de validación ni la iteración.

| # | Línea | Corrección | Sostén |
|---|---|---|---|
| F3-37 | 5 | Agregar al final: «Los veintitrés requisitos se validaron con la referente en la sesión del 26/09/2026.» | M-05 |
| F3-38 | 20 (RF-02) | Criterio como el libro (F2-02) | ADR-036, 042 |
| F3-39 | 21, 29, 61, 69, 109, 133, 157, 165, 173, 181, 189 | Trazabilidad como el libro (F2-03, 07, 11, 12, 14, 18, 21, 26) | A-05; L-10 a L-13 |
| F3-40 | 25, 27, 28 (RF-03) | Enunciado, motivo y criterio como el libro (F2-04 a F2-06) | ADR-036, 041, 042; P-11 |
| F3-41 | 45 (RF-05) | «Tabla 19» → «Tabla 17» | T-09 |
| F3-42 | 57, 60 (RF-07) | Enunciado y criterio como el libro (F2-09, F2-10) | ADR-036, 042 |
| F3-43 | 83 (RF-10) | «Must. …» → «Should. …» con el motivo del libro (F2-13) | ADR-035 |
| F3-44 | 169, 171, 172 (RNF-06) | Enunciado, prioridad y criterio como el libro (F2-15 a F2-17) | ADR-037 |
| F3-45 | 177, 180 (RNF-07) | Enunciado y criterio como el libro (F2-19, F2-20), con sus dos `[DATO PENDIENTE]` | ADR-044, 045 |
| F3-46 | 185 a 188 (RNF-08) | Enunciado, «No funcional — mantenibilidad», motivo y criterio como el libro (F2-22 a F2-25) | ADR-036 |
| F3-47 | 193 | «…las decisiones del acta de validación, de modo…» → «…del acta de validación del 26/09/2026, de modo…» | A-05 |
| F3-48 | 220, 230, 231 y nuevas filas | HA-3 (P-11), L-06, «L-07 y L-09», L-08 y L-10 a L-13, como el libro (F2-28 a F2-31) | P-11, acta |
| F3-49 | 242 | «Interfaz de escritorio y núcleo; no comprometidos en este período salvo RF-12» → «Interfaz web local y núcleo; no comprometidos en este período» | AD-07; F2-49 |

---

## 8. Anexo V · Glosario, reglas y atributos

| # | Línea | Corrección | Sostén |
|---|---|---|---|
| F3-50 | 9, 16, 17, 23 | «Sí, resuelto en la sesión del \[fecha\]» → «No» | M-13 |
| F3-51 | 9 a 11, 13, 16, 17, 23 (Fuente) | Agregar «; acta del 26/09/2026» | Acta, sección 6 |
| F3-52 | 27 | Epígrafe como el libro (F2-38): «Los siete términos con fuente en el acta se validaron con la referente en la sesión del 26/09/2026.» | Solo 7 de 16 se validaron |
| F3-53 | 33 a 45 | Estado «Validada» en las 13; Fuente con el acta, como el libro (F2-33, F2-34) | M-13, A-05 |
| F3-54 | 58 (A.V.3, Elemento) | «Tipo, nombre, valor efectivo, estado de uso» → «Tipo, nombre, valor efectivo con su procedencia, estado de uso». Mismo cambio en `03-requisitos/libro/entidades.md`, línea 49 | PV-04; coherencia con la Tabla 3 («Procedencia» → atributo del elemento) |
| F3-55 | 9 | «\*source\*» → «*source*» | M-15 |

---

## 9. Orden de aplicación propuesto (una sección por vez)

1. **III.4:** tiene el hallazgo 0.1 y la mayor cantidad de filas nuevas.
2. **III.5:** hallazgo 0.2; cambia cifras que citan otras secciones.
3. **Anexo I:** es copia del libro y se valida contra él con el verificador de consistencia.
4. **III.2**, sin la Figura 1, que queda para después de que decidas cómo se hace.
5. **Anexo V** y el cambio de F3-54 en el libro.
6. **III.3** (depende en parte de AD-23; la cifra de F3-19 no).
7. **III.1** (cuatro cambios menores).

**Después de cada sección:** estado → «borrador» en `estado.md`, y avance en `pendientes.md`.

**Qué cierra esta fase:**
- **Se cierran:** V-01 (sin afirmaciones de validación sin constancia de sesión), A-05 en el Cap. III, AD-01 en III.3 (IV.1 queda para la fase 4) y AD-10 en III.5 y el Anexo I.
- **Avanzan:** AD-11, AD-12 y AD-21.
- **Queda abierto:** V-02, hasta que la Figura 1 exista.

**Marcadores que quedan en el Cap. III y sus anexos:** los dos `[DATO PENDIENTE]` de RNF-07 en el Anexo I (PV-01, PV-02). `armar.py` bloquea la entrega mientras existan (G-01).

---

## 10. Elección del autor

Respuesta del autor (28/09/2026): aplicar todas; Figura 1 con Mermaid y fuente escrita por el ingeniero; alta de ISO/IEC 25010.

## 11. Aplicación (28/09/2026)

Cada sección la aplicó el redactor por separado, y cada una quedó en «borrador».
- **III.4:** F3-21 a F3-28, más T-09 («Tabla 11» → «Tabla 10», verificado en I.6: la Tabla 10 del AE1 es la de inclusiones y exclusiones). El redactor agregó «en buena parte» («la nómina… que en buena parte ya constaba»); se acepta.
- **III.5:** F3-29 a F3-36. F3-36 con la cita «(International Organization for Standardization [ISO], 2023)». Solo atribuye a la norma que la compatibilidad es una característica del modelo.
- **Anexo I:** F3-37 a F3-49, copiado del libro. El redactor comparó las fichas sin cambios y no encontró otras diferencias.
- **III.2:** F3-05 a F3-14. F3-07 se extiende a la fila «Un agente puede invocar muchos subagentes» («1 a N, opcional»), por coherencia con la figura. El espacio reservado de la Figura 1 sigue sin reemplazar.
- **Anexo V:** F3-50 a F3-55. El libro se iguala en «*source*» (`glosario.md`, línea 9).
- **III.3:** F3-15 a F3-20. La repetición «el alcance del proyecto comprende lo que el proyecto compromete» se corrige a «lo que se compromete».
- **III.1:** F3-01 a F3-04.
- **Libro:** F3-54 (A.V.3, Elemento).
- **Fuente:** `iso250102023` dada de alta en `01-relevamiento/fuentes.md` (verificada contra el texto primario de la edición 2023: compatibilidad como característica, con coexistencia e interoperabilidad) y agregada a `informe/bibliografia.md` (G-02).
- **Figura 1:** `03-requisitos/modelo-dominio.mmd` y `modelo-dominio.config.json`. El PNG está generado en el directorio temporal de la sesión, con disposición vertical. Falta copiarlo a `informe/figuras/cap-03/`, con autorización del autor.

Marcadores que quedan en el Cap. III y sus anexos: los dos `[DATO PENDIENTE]` de RNF-07 en el Anexo I (PV-01, PV-02).
