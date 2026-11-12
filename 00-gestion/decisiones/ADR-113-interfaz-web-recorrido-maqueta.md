# ADR-113 — Interfaz web: recorrido por proyecto y sistema visual sobrio

- Estado: propuesto
- Fecha: 11/11/2026
- Reemplaza: la parte de diseño visual y de navegación de ADR-110 (se conserva E-A: estilos locales en `/estilos.css` y CSP `style-src 'self'`)
- Capítulos afectados: IX (interfaz), XIII (inventario), manual §6 y §8
- Origen: sesión del 11/11/2026. El autor probó la interfaz con proyectos propios y la juzgó difícil de usar: identificar resoluciones por número no es claro, «Buscar clave» y «Consulta exacta» parecen iguales, hay mucho texto sin orden, la tipografía es mala y los colores molestan. Aportó la maqueta del prototipo v0 (versión 0.2), con la indicación de tomar solo lo que siga siendo pertinente

### Contexto

La interfaz actual se organiza en pestañas por tipo de dato (Valores, Permisos, Agentes, Entradas, Hallazgos), atadas a un identificador numérico de resolución. Creció por agregados sucesivos (T5-08 a T5-15) sin un diseño de recorrido.

La maqueta v0 propone un recorrido de lo general a lo particular, con una pregunta por pantalla:
1. selección del proyecto;
2. resumen del ecosistema y de sus hallazgos;
3. detalle de un agente;
4. consulta de permiso;
5. detalle de un hallazgo.

Parte de su contenido quedó fuera del alcance actual: el recuento de modelos, comandos, skills, MCP, LSP y plugins, y las instrucciones `AGENTS.md`.

### Alternativas evaluadas

| Tema | Elegida | Descartada |
|---|---|---|
| N · Navegación | **N-A:** recorrido Inicio → Resumen del proyecto → Agente → Permiso / Hallazgos, con migas de pan. Entradas, historial y comparación se integran en el resumen | N-B: conservar las pestañas y solo depurar el texto |
| I · Identificación | **I-A:** nombre del proyecto y fecha local («RIGE-TIF · hoy 10:42»); el id queda solo en la dirección | I-B: conservar «Resolución N» |
| B · Búsqueda | **B-A:** un solo buscador (filtro `q`); la consulta exacta por clave queda solo en la CLI | B-B: conservar los dos campos |
| V · Visual | **V-A:** base neutra clara con oscuro automático, un acento y color solo con significado (permitido, pregunta, denegado), siempre acompañado de texto; tipografía del sistema de 16 px; monoespaciada solo para rutas y valores; explicaciones en plegables | V-B: conservar la paleta oscura actual |
| L · Ubicación | **L-A:** `ruta:línea:columna` como enlace `vscode://file/…` | L-B: copiar las líneas del archivo en la página |
| S · Instrucciones | **S-A:** fuera de este rediseño. El resumen avisa cuando el proyecto no declara agentes | S-B: observar los `AGENTS.md` |
| T · Tecnología | **T-A:** HTML del servidor y CSS, sin JavaScript | T-B: aplicación React |

### Análisis (trade-offs)

- **N-A** responde las preguntas en el orden en que se formulan (¿qué hay?, ¿qué rige en este agente?, ¿puede hacer esto?, ¿qué está mal?). N-B deja el problema de orientación.
- **I-A** es solo presentación: no cambia el almacén ni los contratos.
- **B-A**: para quien usa la web, el filtro y la consulta exacta producen la misma vista. La paridad de ADR-058 prohíbe que la web ofrezca capacidades ausentes de la CLI, no lo inverso.
- **V-A** reduce la carga visual. El color sin texto no es accesible.
- **L-A** lleva al archivo sin exponer su contenido. L-B mostraría texto crudo, que puede contener credenciales (RNF-04).
- **S-B** es una capacidad nueva del adaptador que requiere verificación contra el binario. Queda para una decisión propia.
- **T-A** alcanza para pantallas enlazadas con formularios. Conserva la CSP estricta, RNF-09 y las pruebas existentes. T-B agrega construcción, dependencias y una superficie de JavaScript sin una interacción que la justifique.

### Recomendación y fundamento

N-A, I-A, B-A, V-A, L-A, S-A y T-A.

**Condición que la invalidaría:** que el recorrido exija datos que RIGE no calcula, o un cambio de contrato o de esquema. En ese caso, la pantalla afectada se limita a los datos existentes y la capacidad nueva va a su propio ADR.

### Decisión del autor

[Pendiente: aceptación formal. El autor aceptó las recomendaciones N a T y autorizó su implementación en la sesión del 11/11/2026 («dale acepto todo»).]

### Consecuencias

- **`src/`:** solo `paquetes/rige/interfaces/web/`, sus pruebas, las pruebas de aceptación que leen HTML, `MANUAL.md` y `README.md`.
- **Lo que no cambia:** contratos, casos de uso, CLI, almacén y JSON embebido.
- **Rutas:** las existentes siguen respondiendo, directamente o con redirección a su vista equivalente.
- **Fichas:** T5-17 (sistema visual, estructura e inicio), T5-18 (resumen del proyecto y agente) y T5-19 (permiso, hallazgos y vistas secundarias).
- **Informe:** IX y XIII describen la interfaz final, a cargo del redactor.
- **Precisión (revisión de cierre, 11/11/2026):** la web no crea datos. Puede filtrar, contar y agregar lo que traen las respuestas de los casos de uso (resumen del proyecto, conteos, agentes con su foto) y agregar orientación de uso («Qué hacer»), pero no calcula decisiones, valores ni procedencias propias. Las etiquetas de los códigos se toman de un vocabulario de presentación único compartido con la CLI (ADR-114), y el armado de claves vive en `aplicacion`, junto a su analizador. Fichas T5-26 y T5-27.
