# ADR-020 — Adoptar «entrada de configuración» como denominación única de las vías por las que llega la configuración

- Estado: aceptado (retroactivo)
- Fecha: AE2 (septiembre de 2026)
- Capítulos afectados: Cap. III (III.2.4); glosario del Anexo V; propaga al informe de la AE1 (I.6.3 y siguientes)
- Origen: Cap. III, III.2.4
- Revisión: 24/09/2026, contenido ampliado a partir del informe y del glosario; la decisión no cambia

### Contexto
La vía por la cual OpenCode incorpora configuración al resolver el estado efectivo —sea o no un archivo— carecía de un nombre estable. La documentación de la herramienta emplea *source*; el uso corriente alterna capa, alcance y nivel; y el informe de la AE1 alternaba entre «fuente» y «entrada» (`informe/cap-03/III.2-dominio-sistema-informacion.md`, III.2.4). El término designa además una entidad del dominio (Tabla 2), de modo que la ambigüedad se trasladaría al modelo de datos.

### Alternativas evaluadas
- **Adoptada:** «Entrada de configuración», con source, capa, alcance, nivel y fuente registrados como sinónimos no usados.
- **Descartada A:** Conservar «fuente», término del informe de la AE1.
- **Descartada B:** Adoptar el término de la documentación de la herramienta (*source*).

### Análisis (trade-offs)
- **A** evita retocar el informe de la AE1, pero «fuente» colisiona con «fuentes de datos» del Capítulo II y con el registro de fuentes bibliográficas; en la defensa, «la fuente de la configuración» y «la fuente del dato» resultarían indistinguibles.
- **B** es fiel a la herramienta, pero es un anglicismo y ata el vocabulario del dominio a una herramienta concreta, en contra de la independencia del núcleo (ADR-019, RNF-03).
- **La adoptada** es neutral respecto de la herramienta y no colisiona con otro término del informe. Su costo es la propagación al informe de la AE1, incluida la sustitución de «fuente ilegible» por «entrada ilegible» (`03-requisitos/libro/glosario.md`).

### Recomendación y fundamento
Adoptar «entrada de configuración»: elimina la colisión con el Capítulo II y da a la entidad del dominio un nombre independiente de la herramienta.

### Decisión del autor
Emplear «entrada de configuración» y registrar como sinónimos no usados los términos source, capa, alcance, nivel y fuente.

### Consecuencias
- Toda sección nueva y todo identificador del código usan «entrada»; el revisor de consistencia controla el término.
- Pendiente A-01 (`00-gestion/pendientes.md`): propagar al informe de la AE1.
- El glosario registra el término como «en disputa, resuelto en la sesión del `[fecha]`»; la fecha depende del acta de validación (pendiente A-05).
- Criterio análogo aplicado en III.2.4 al par «permiso» (la decisión) y «regla de permiso» (la declaración que la origina); no requiere ADR propio.
- **Condición que invalidaría la decisión** (observación del ingeniero): que la cátedra o el referente objeten el término; es de bajo riesgo.

### Evidencia
`informe/cap-03/III.2-dominio-sistema-informacion.md` (III.2.4); `03-requisitos/libro/glosario.md` (entradas «Entrada de configuración» y «Entrada ilegible»).
