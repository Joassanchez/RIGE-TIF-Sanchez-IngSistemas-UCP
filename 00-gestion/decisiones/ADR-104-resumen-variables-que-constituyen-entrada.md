# ADR-104 — Resumen de las variables que constituyen una entrada (precisa ADR-060 D6)

- Estado: aceptado (02/11/2026)
- Fecha: 30/10/2026
- Capítulos afectados: `src/` (núcleo, `resumenEntradas`); `src/AGENTS.md` §4; Cap. VI (descripción del resumen de entradas, cuando se redacte)
- Origen: ficha T3-03 de la iteración 3 (RF-04) y su pre-crítica (Claude y Codex, 30/10/2026)

### Contexto

- ADR-060, D6, aceptó **M-B**: el resumen del conjunto de entradas (E-02) toma los archivos por su contenido y las variables «por nombre y condición, no con su contenido», para que no se pueda atacar por fuerza bruta el resumen de una variable con un secreto de baja entropía. Declaró el costo: «un cambio que afecta solo el contenido de una variable no modifica el resumen». ADR-061 lo repite (E-C).
- Cuando se decidió, las únicas variables observadas eran las que **ubican** entradas (`OPENCODE_CONFIG`). Su contenido es una ruta, y el contenido del archivo al que apunta ya entra al resumen.
- La iteración 3 (T3-03, RF-04 CA-1) lee `OPENCODE_CONFIG_CONTENT` y `OPENCODE_PERMISSION`, que **son** entradas: su contenido es configuración en JSON, igual que un archivo.
- RF-17 CA-2 (validado): «modificado el contenido de una entrada, una nueva resolución del mismo proyecto declara un resumen distinto». Con M-B literal, cambiar `OPENCODE_CONFIG_CONTENT` no cambia el resumen: el criterio falla para dos de los siete tipos de entrada.
- ADR-058, eje E-B (aceptado), ya dice que «el contenido de una variable que constituye una entrada se trata como el de cualquier otra entrada, con sus propias sustituciones protegidas». Lo protegido por RNF-04 es el contenido que incorpora una sustitución, no el texto de la configuración.

### Alternativas evaluadas

- **V-A:** Mantener M-B para todas las variables y declarar que RF-17 CA-2 no se cumple para `OPENCODE_CONFIG_CONTENT` y `OPENCODE_PERMISSION`.
- **V-B:** Variables que **constituyen** una entrada por su contenido (SHA-256 del texto crudo, como un archivo) dentro del resumen del conjunto; variables que solo **ubican** una entrada, por nombre y condición, como hoy. La fila de `entrada_leida` sigue con `resumen` nulo (el `CHECK` de ADR-061 no cambia); el resumen individual no se emite.
- **V-C:** V-B, emitiendo además el resumen individual de cada variable, lo que exige cambiar el `CHECK` de `entrada_leida` y el esquema del almacén.

### Análisis (trade-offs)

- **V-A** deja sin cumplir un criterio validado por la referente, en dos tipos de entrada que la iteración agrega justamente para RF-04. Una resolución guardada no permitiría saber si `OPENCODE_CONFIG_CONTENT` cambió.
- **V-B** cumple RF-17 CA-2 y es coherente con E-B. El riesgo de M-B (fuerza bruta de un secreto corto) no aplica: el texto es un documento de configuración, y un secreto que llegue por `{env:…}` o `{file:…}` entra al texto como el token, no como su valor. El resumen del conjunto mezcla además todas las entradas, lo que no deja aislar el aporte de la variable. No cambia el almacén.
- **V-C** da más detalle por entrada, pero obliga a una migración del almacén (ADR-061 prohíbe migrar en silencio) sin un requisito que lo pida.

### Recomendación y fundamento

**V-B.** Precisa ADR-060 D6 sin reabrirlo: M-B sigue vigente para las variables que ubican entradas, y las que constituyen una entrada se tratan como archivos, según ADR-058 E-B. Cumple RF-17 CA-2 para los siete tipos de RF-04 sin tocar el esquema del almacén.

**Condición que la invalidaría:** que una de esas variables pueda contener por sí misma un secreto de baja entropía sin pasar por una sustitución (p. ej., si OpenCode admitiera una clave con el valor completo de una credencial dentro de `OPENCODE_PERMISSION`); en ese caso se vuelve a M-B para esa variable y se declara el incumplimiento parcial de RF-17 CA-2.

### Decisión del autor

Aceptado por el autor el 02/11/2026.

### Consecuencias

- `resumenEntradas`: en la lista canónica, para cada entrada con condición `definida` se usa `entorno.resumir(valor)` en el lugar del resumen. Las salidas del v2 no cambian (no tienen variables definidas).
- `src/AGENTS.md` §4: «las variables entran por nombre y condición, nunca por contenido» pasa a «las variables que ubican una entrada entran por nombre y condición; las que constituyen una entrada (`OPENCODE_CONFIG_CONTENT`, `OPENCODE_PERMISSION`), además, por el resumen de su contenido dentro del resumen del conjunto; nunca se emite su contenido ni su resumen individual».
- Prueba: cambiar el valor de `OPENCODE_CONFIG_CONTENT` cambia `resumenEntradas` (T3-03 R-10).
- Variables y archivos **referenciados por una sustitución** (`{env:}`, `{file:}`, T3-04): siguen M-B. Si hay alguna, la lista canónica suma `[tipo, origen, definido]` de todas, ordenadas y sin repetidos; ni el contenido de la variable ni el del archivo entran. Así dos resoluciones con los mismos archivos y una variable definida en una y ausente en otra declaran resúmenes distintos; un cambio solo del contenido sigue sin modificarlo (costo ya declarado en ADR-060 D6).

### Evidencia

- ADR-060, D6 y análisis de M-B; ADR-058, eje E-B; ADR-061, `CHECK (condicion = 'observada' OR resumen IS NULL)`.
- `03-requisitos/libro/catalogo/RF-17.md`, CA-2; `RF-04.md`, CA-1.
- Pre-crítica Codex de T3-03 (30/10/2026): hallazgo bloqueante sobre la atribución a M-A.
