# ADR-070 — Guardas de arquitectura con un analizador léxico propio sobre el escáner de TypeScript

- Estado: propuesto
- Fecha: 30/09/2026
- Capítulos afectados: ninguno del cuerpo del AE2. Alimenta el capítulo de diseño de una entrega posterior (verificación de RNF-03). Afecta `src/pruebas/utilidades/analisis-arquitectura.ts` y `src/pruebas/arquitectura/`
- Origen: revisión del incremento 0 (`/revisar-codigo incremento inc0-esqueleto`, 30/09/2026), punto 10 de `critico-codigo` (pregunta probable del tribunal)

### Contexto

ADR-058 exige que las reglas de dependencia se verifiquen como prueba («donde se pueda, como prueba de arquitectura»), y RNF-03 CA-1 y CA-2 se acreditan con esas guardas. En el incremento 0 se implementó un analizador propio. Datos del repositorio:
- `Bun.Transpiler.scanImports`, complementado con el escáner oficial `typescript/unstable/ast` de TypeScript 7.0.2, en proceso;
- unas 300 líneas, más unas 230 de pruebas;
- falla en forma visible ante la ambigüedad entre expresión regular y división, y ante los imports calculados.

La elección no está registrada en ningún ADR, y la pregunta «¿por qué no una herramienta existente?» es previsible.

### Alternativas evaluadas

- **A-A:** analizador propio, como el actual.
- **A-B:** herramienta externa (`dependency-cruiser`, `eslint-plugin-boundaries`).
- **A-C:** grafo de dependencias del compilador (`tsc --explainFiles` o la API del programa).

### Análisis (trade-offs)

- **A-B** agrega dependencias de desarrollo con su propio árbol transitivo. ADR-062 C3 limita las dependencias a las exactas y justificadas, y cada una exige un ADR. Además, estas herramientas no cubren reglas propias de RIGE: `node:fs` de solo lectura por nombre importado, el SQL solo desde el adaptador de almacén, las identificaciones en el núcleo y los globales `Bun` y `process`.
- **A-C** da el grafo resuelto sin escáner propio. Es suposición, sin verificar: que TypeScript 7.0.2 exponga en proceso la API del programa o que `--explainFiles` alcance para todas las reglas. Tampoco ve los usos de globales.
- **A-A** cubre todas las reglas con una sola herramienta ya fijada (TypeScript 7.0.2), sin dependencias nuevas, y falla en forma visible cuando no puede decidir. Su costo es el tamaño del código y la dependencia de una API marcada como inestable, que el lock fija.

### Recomendación y fundamento

**A-A**, con dos límites que reducen su costo (ficha inc0-c4):
- un único tokenizador compartido por todas las guardas;
- nada de reglas para casos que no existen: la resolución de aliases se reemplaza por una prueba que falla si aparecen.

**Condición que invalidaría la recomendación:** que una actualización de TypeScript rompa `typescript/unstable/ast`, o que A-C resulte viable y cubra las reglas de imports con menos código. En ese caso, se reemplazan las guardas de imports y se conserva la de globales.

### Decisión del autor

[DECISIÓN PENDIENTE: el autor acepta, modifica o rechaza.]

### Consecuencias

- `04-diseno/README.md`, sección 1: fila nueva cuando se acepte.
- Riesgo de mantenimiento: toda actualización de TypeScript reevalúa este registro.

### Evidencia

- `src/pruebas/utilidades/analisis-arquitectura.ts`; `src/odd/tasks/inc0-esqueleto.md` §11.6 y §11.7 (T0-05 y su reapertura).
- ADR-058 (reglas y convención 3); ADR-062 C3; RNF-03 CA-1 y CA-2.
