# Registro de reglas de negocio

> Hoja del Libro de trabajo · Instrumento 29. Migrado de Cap. III, Anexo V, A.V.2. Fuente para `/exportar libro`.

| **Cód.** | **Tipo**    | **Enunciado verificable**                                                                                                                                                                         | **Fuente**                        | **Estado**              | **Requisito derivado** |
|----------|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------|-------------------------|------------------------|
| RD-01 | Derivación | El valor efectivo de una clave resulta de aplicar las entradas en su orden de precedencia; prevalece la declaración de la última entrada que la declara | H-01; acta del 26/09/2026 | Validada | RF-01 |
| RD-02 | Derivación | En la fusión profunda, la posición de una clave la determina la primera entrada que la declara y su valor, la última | H-06; acta del 26/09/2026 | Validada | RF-01 |
| RD-03 | Derivación | La decisión de permiso resulta de evaluar la cadena ordenada de reglas (nativas generales, nativas del agente, declaradas globales y declaradas del agente) y la determina la última coincidencia | H-05; acta del 26/09/2026 | Validada | RF-02 |
| RD-04 | Derivación | Si ninguna declaración del usuario alcanza una clave, rige el valor implícito de la herramienta | AE1, I.6.3; acta del 26/09/2026 | Validada | RF-06 |
| RD-05 | Derivación | El subagente lanzado mediante `task` en una sesión nueva se rige por su propio conjunto de reglas, más una denegación de `task` y otra de `todowrite` cuando ese conjunto no contiene una regla con ese identificador exacto (una regla general `*` no lo evita); las reglas del agente que lo lanza no se le aplican | H-12; acta del 26/09/2026; segunda extensión del acta del 15/10/2026 | Validada | RF-02 |
| RD-06 | Derivación | Si la última regla coincidente para una herramienta declara patrón general y efecto de denegación, la herramienta no se ofrece al modelo; una excepción posterior vuelve a exponerla por completo | H-08; acta del 26/09/2026 | Validada | RF-10 |
| RD-07 | Derivación | Una declaración del usuario que alcanza una acción denegada por una regla nativa del agente prevalece sobre ella, dado que las declaradas se concatenan después de las nativas | H-07; acta del 26/09/2026 | Validada | RF-09 |
| RR-01 | Restricción | RIGE no modifica ninguna entrada de configuración; escribe únicamente en su propio almacén | Acta del 26/09/2026, decisión L-01 | Validada | RNF-01 |
| RR-02 | Restricción | RIGE no expone el contenido que una sustitución incorpora; informa su origen y su condición de definido o no definido | Acta del 26/09/2026, decisión L-03; extensión del acta del 01/10/2026; segunda extensión del acta del 15/10/2026 | Validada | RNF-04 |
| RR-03 | Restricción | RIGE resuelve únicamente sobre OpenCode 1.18.25; ante otra versión instalada advierte y no presenta sus resultados como válidos | Acta del 26/09/2026, decisión L-05 | Validada | RF-05 |
| RE-01 | Existencia | Un elemento ingresa a la resolución si proviene de una entrada legible o si la herramienta lo incorpora sin declaración (nativo); si una entrada es ilegible, su carga se detiene con error y se registra el hallazgo correspondiente | AE1, I.6.3; acta del 26/09/2026; extensión del acta del 01/10/2026; segunda extensión del acta del 15/10/2026 | Validada | RF-04, RF-07 |
| RE-02 | Existencia | Una regla se marca sin efecto solo si existe una regla posterior del mismo tipo que abarca todos los casos que ella cubre | H-05; adaptado de Al-Shaer y Hamed (2004); acta del 26/09/2026 | Validada | RF-07 |
| RE-03 | Existencia | Un elemento declarado se marca sin uso solo si ninguna declaración de un agente ni de un comando lo nombra | AE1, I.6.3; acta del 26/09/2026; extensión del acta del 01/10/2026; segunda extensión del acta del 15/10/2026 | Validada | RF-07 |

*Tabla A.V.2. Registro de reglas de negocio. Fuente: elaboración propia.*
