# ADR-112 — Comparación de resoluciones y proyectos recientes

- Estado: propuesto
- Fecha: 10/11/2026
- Capítulos afectados: III.5 (posible requisito Could), IX (casos de uso e interfaz), XIII (inventario), manual §8
- Origen: sesión del 10/11/2026. El autor pidió mejoras que hagan el sistema más útil y autorizó implementarlas («avanza con todo»)

### Contexto

El diagnóstico del problema (I.3.3, Anexo III, D-71) identifica la **verificación del cambio** como una decisión del desarrollador que hoy no tiene apoyo. Después de editar la configuración, no hay forma de saber qué cambió en lo que efectivamente rige. RIGE guarda las últimas 20 resoluciones por proyecto (RF-17) pero no las compara. Además, el inicio de la web obliga a escribir la ruta del proyecto cada vez, aunque el almacén ya conoce los proyectos analizados.

### Alternativas evaluadas

- **K-A:** caso de uso `compararResoluciones(idA, idB)`, que compara por agente los valores efectivos (clave, valor y declaración determinante) y la presencia de agentes. Vista web `/comparar?desde=<id>&hasta=<id>`, con enlace «comparar con la anterior» en la historia.
- **K-B:** comparación textual de los JSON guardados.
- **K-C:** no comparar.
- **R-A:** caso de uso `consultarProyectosRecientes()` sobre el almacén (proyecto, última resolución, instante y cantidad), en el inicio.
- **R-B:** no listar.

### Análisis (trade-offs)

- **K-A** compara sobre el modelo de la resolución: clave por clave y con su procedencia. Responde «qué cambió y por qué» en el mismo lenguaje que el resto de la interfaz. Es de solo lectura y usa resoluciones ya guardadas, sin releer entradas.
- **K-B** produce diferencias ruidosas (orden, instantes, rutas) que el usuario tiene que interpretar.
- **K-C** deja sin apoyo la decisión identificada en el diagnóstico.
- **R-A** es una consulta de solo lectura al almacén propio, sin datos nuevos.

Las dos opciones elegidas exponen en la web solo lo que ya está en el almacén local, y no cambian `valores`, `permiso` ni el esquema del almacén. La comparación de permisos por regla queda fuera: la cadena completa llega con ADR-111 (C-A) y se compararía en una iteración posterior.

### Recomendación y fundamento

**K-A y R-A**: aportan la verificación del cambio y reducen la fricción del inicio, sin tocar la medición final.

**Condición que la invalidaría:** que la comparación requiera releer las entradas (rompería la inmutabilidad de RF-17) o que cambie el esquema del almacén. En ese caso se limita a la vista web sobre los documentos guardados.

### Decisión del autor

[Pendiente: aceptación formal. El autor autorizó implementar el 10/11/2026 («avanza con todo»).]

### Consecuencias

- **`src/`:** dos casos de uso en `aplicacion/casos-uso/` y sus respuestas tipadas. `PuertoResoluciones` se amplía solo con lecturas. Se agregan las páginas `/comparar` y la lista del inicio, todo con pruebas.
- **CLI:** para respetar ADR-058 (la web no ofrece capacidades ausentes de la CLI), se agregan los subcomandos `comparar --desde --hasta [--agente]` y `recientes`. Son de solo lectura sobre el almacén y no lo crean. Los esquemas `comparacion.json` y `proyectos-recientes.json` llevan `esquema: 2`. Paridad CLI y web (pre-crítica del 10/11/2026).
- **Catálogo:** si el autor lo decide, un requisito Could «comparar dos resoluciones guardadas del mismo proyecto», con su criterio y el registro ante la referente.
