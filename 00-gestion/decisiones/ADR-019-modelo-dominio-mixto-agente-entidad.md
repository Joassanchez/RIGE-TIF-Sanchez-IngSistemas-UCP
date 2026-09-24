# ADR-019 — Modelo del dominio mixto: Agente como entidad de primera clase y Elemento genérico con subtipos

- Estado: aceptado (retroactivo)
- Fecha: AE2 (septiembre de 2026)
- Capítulos afectados: Cap. III (III.2.2 y III.2.3); Anexo V (atributos); RNF-03
- Origen: Cap. III, III.2.2 (tabla de entidades); chat «Capitulo III - AE1» (23/09/2026)
- Revisión: 24/09/2026, contenido ampliado a partir del informe; la decisión no cambia
- Relacionado: desarrolla ADR-008 (agente como eje de la representación)

### Contexto
El modelado del dominio sigue la identificación de sustantivos (Larman, 2004; Evans, 2003) y admite como entidad solo a la candidata que tiene identidad propia, datos y reglas propios y pertenencia al recorte (`informe/cap-03/III.2-dominio-sistema-informacion.md`, III.2.2). El ecosistema de OpenCode 1.18.25 presenta ocho tipos de elemento —agente y subagente, modelo, instrucción, comando, skill, servidor MCP, servidor LSP y plugin— (Tabla 5), y el conjunto de tipos varía de una herramienta a otra. La arquitectura separa un núcleo independiente de adaptadores específicos (III.3; RNF-03).

### Alternativas evaluadas
- **Adoptada:** Una entidad genérica Elemento, cuyo tipo declara el adaptador, con Agente como única especialización.
- **Descartada A:** Una entidad por cada tipo de elemento del ecosistema.
- **Descartada B:** Un modelo exclusivamente genérico, sin especialización de Agente.

### Análisis (trade-offs)
- **A (una entidad por tipo)** refleja con exactitud el ecosistema de OpenCode, pero fija en el núcleo los ocho tipos de una herramienta concreta: incorporar otra herramienta obligaría a modificar el núcleo, en contra de RNF-03. Además, siete de los ocho tipos comparten el mismo tratamiento —resolución, procedencia y relación—, de modo que las entidades separadas no aportan reglas propias (III.2.2, último párrafo).
- **B (solo genérico)** maximiza la independencia, pero diluye el comportamiento que únicamente posee el agente: la cadena ordenada de reglas de permiso, la herencia de denegaciones hacia los subagentes que invoca y el conjunto de instrucciones aplicables (III.2.2). Ese comportamiento tendría que expresarse como excepciones por tipo dentro del núcleo, y el agente es además el eje de la representación (ADR-008).
- **La adoptada** conserva la independencia del núcleo porque los tipos de elemento y de relación se declaran en el descriptor de capacidades del adaptador, que constituye el contrato entre adaptador y núcleo y no integra el dominio del negocio (III.2.3). El costo es una relación reflexiva N a N entre elementos con tipo declarado (Tabla 4), menos expresiva que relaciones nominadas.

### Recomendación y fundamento
Adoptar el modelo mixto: es el único que satisface a la vez RNF-03 (el núcleo no conoce los tipos de la herramienta) y el comportamiento diferencial del agente, sobre el cual recaen RF-02, RF-06, RF-09 y RF-10.

### Decisión del autor
Modelar el dominio con una entidad genérica Elemento, cuyo tipo declara el adaptador, y con Agente como especialización de Elemento sobre la que se manifiesta el efecto de toda la configuración.

### Consecuencias
- El adaptador debe publicar un descriptor de capacidades con los tipos de elemento y de relación válidos; su diseño corresponde al capítulo de diseño.
- La prueba de RNF-03 (cero dependencias del núcleo hacia el adaptador) se ejecuta desde la iteración 1 (V.1, Tabla 14).
- Pendientes asociados: Figura 1 del modelo del dominio sin incorporar y fecha del acta de validación de la Tabla 4 (`[fecha]`).
- **Condición que invalidaría la decisión** (observación del ingeniero): que un segundo tipo de elemento adquiera comportamiento propio que el núcleo deba evaluar —por ejemplo, reglas de permiso declaradas sobre comandos o sobre servidores MCP en una versión posterior o en otra herramienta—. En ese caso corresponde una segunda especialización o mover ese comportamiento al descriptor del adaptador, mediante un ADR de reemplazo.

### Evidencia
`informe/cap-03/III.2-dominio-sistema-informacion.md` (III.2.2, Tablas 2 y 3; III.2.3, Tablas 4 y 5); chat «Capitulo III - AE1» (23/09/2026).
