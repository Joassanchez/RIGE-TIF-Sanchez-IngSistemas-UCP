# ADR-111 — Mapa completo de vías y cadena completa de permisos por agente

- Estado: propuesto
- Fecha: 09/11/2026
- Capítulos afectados: III.5 (RF-04 y RF-02, si el autor decide reflejarlo como precisión), IX (interfaz y contratos), XIII (inventario), manual §8
- Origen: sesión del 09/11/2026. El autor preguntó por qué la página de Entradas muestra «solo 5» y si la interfaz muestra todo lo que ofrece RIGE

### Contexto

Hay dos datos que RIGE calcula pero no entrega:

1. **Vías revisadas sin resultado.** El ubicador del adaptador (`paquetes/opencode/ubicador.ts`) recorre todos los lugares candidatos de cada vía: tres nombres de archivo global, `OPENCODE_CONFIG`, archivos del proyecto, `.opencode/` en cada nivel, Markdown, `OPENCODE_CONFIG_CONTENT` y `OPENCODE_PERMISSION`. La respuesta de `entradas` solo informa lo encontrado y las tres vías no observadas. Lo que se revisó y no existe no aparece, de modo que quien mira no distingue «revisado y ausente» de «no revisado». Con `v1-precedencia` se ven cinco filas, y con `v1-vias`, nueve.
2. **Cadena completa de permisos.** La cadena completa de un agente existe (`opencode/cadena.ts`), pero solo se consulta a través de una acción concreta (`permiso`). No hay forma de ver todas las reglas de un agente en orden, con su procedencia, sin adivinar qué consultar.

Las dos carencias afectan la explicación del producto en el coloquio y la confianza del usuario en que el análisis es completo.

### Alternativas evaluadas

- **V-A:** agregar a la respuesta de `entradas` un campo `vias` con cada vía soportada, su estado (`presente`, `ausente`, `no_observada`, `no_soportada`) y los lugares revisados.
- **V-B:** lista fija de vías en la interfaz web, sin dato del adaptador.
- **V-C:** no cambiar nada y explicarlo en el manual.
- **C-A:** consulta nueva `reglas --proyecto --agente [--lanzado-por]` (CLI) y página `/reglas?id&agente` (web), con esquema propio `reglas.json` y la cadena completa: índice, sujeto, patrón, efecto, procedencia, localización y determinante por sujeto.
- **C-B:** agregar la cadena completa a la respuesta de `agentes`.
- **C-C:** no cambiar nada.

### Análisis (trade-offs)

- **V-A** es el único que dice la verdad sobre lo revisado, porque el dato sale del mismo ubicador que lee. Agrega un campo y es compatible con el esquema 2 según RNF-08: los campos nuevos son aditivos y los consumidores existentes los ignoran.
- **V-B** duplica en la web conocimiento del adaptador, rompe la separación de ADR-058 y puede divergir del ubicador real.
- **V-C** deja el problema.
- **C-A** separa un contrato nuevo, que no altera los existentes, y mantiene la paridad CLI y web desde el inicio.
- **C-B** infla una respuesta que hoy es liviana y que la medición final usa.
- **C-C** deja sin respuesta la pregunta «qué reglas tiene este agente».

**Costo de A:** se agregan casos de uso, el esquema `reglas.json`, pruebas de paridad y su lugar en la cobertura. La medición final (ADR-098) solo usa `valores` y `permiso`, así que su preregistro no cambia.

### Recomendación y fundamento

**V-A y C-A**, en ese orden. V-A es la más barata y la de mayor valor explicativo. C-A completa la vista de permisos.

**Condición que la invalidaría:** que el cambio altere las salidas de `valores` o `permiso` que usa la medición final, o que un consumidor del esquema 2 falle con el campo agregado. En ese caso, V-A pasa a una consulta propia, como C-A.

### Decisión del autor

[Pendiente: aceptar o rechazar. Si se acepta, el ingeniero escribe las fichas del escritor y, si corresponde, la precisión de RF-04 y RF-02 para el registro ante la referente.]

### Consecuencias

- **`src/`:**
  - V-A: el adaptador expone los lugares revisados por vía y el caso de uso de entradas los proyecta. Se actualiza `esquemas/salida/entradas.json` en forma aditiva. La página de Entradas muestra el mapa completo de vías.
  - C-A: casos de uso, subcomando CLI y página nuevos, y el esquema `reglas.json`.
- **Pruebas:** paridad CLI y web, RNF-08 (aditividad) y cobertura de los CA afectados.
- **Informe y catálogo:** precisión de RF-04 («informa también las vías revisadas sin resultado») y, si se acepta C-A, de RF-02 o un requisito nuevo Could; registro de cambios ante la referente.

### Evidencia

`src/paquetes/opencode/ubicador.ts:39-104`; consulta de `entradas` en `v1-vias` (9 entradas) y en `v1-precedencia` (5 entradas), 09/11/2026; `src/paquetes/opencode/cadena.ts:10`.
