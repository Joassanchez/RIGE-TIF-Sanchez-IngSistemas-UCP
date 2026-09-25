# ADR-031 — Reorganización del repositorio: fuente única por artefacto y destinos fijados por la consigna, no por los scripts

- Estado: aceptado (24/09/2026)
- Fecha: 24/09/2026
- Capítulos afectados: ninguno del informe; sistema de trabajo (`diseno-sistema-agentes.md`, sección de estructura), `CLAUDE.md`, `.claude/`, `tools/`
- Origen: sesión del 24/09/2026, pedido del autor de simplificar la estructura

### Contexto
Después de la migración, el repositorio mantenía varias versiones de un mismo material y carpetas sin función:
- las plantillas de la cátedra estaban en `.md` en `catedra/consignas/` y en `.docx` en `catedra/plantillas/`;
- la planilla de recursos estaba duplicada: `03-requisitos/instrumento-34-recursos.md` y `03-requisitos/libro/recursos.md`;
- los scripts de una migración única estaban en `tools/migracion/` y `tools/migrar.py`. Uno de ellos, `libro_desde_informe.py`, sobrescribía el libro si se volvía a ejecutar;
- `prototipo/` contenía solo un README con un dato pendiente, y `catedra/devoluciones/` estaba vacía;
- `armar.py` fijaba el destino de cada instrumento en el código, de modo que cada artefacto nuevo exigía modificar el script.

Restricción (dato, `catedra/AE2-guia.md`, 10.2): la cátedra mantiene siete carpetas normalizadas (`00-gestion` a `05-entregas` y `src`). Los instrumentos 32 y 33 van en `02-analisis`, el 34 en `03-requisitos` y el 35 en `src` (`catedra/AE2-plantilla-instrumentos.md`, recuadro inicial).

Dato de uso: los agentes y comandos solo leen `.md`. Los scripts usan el `.xlsx` del libro, `reference.docx`, `apa.csl` e `informe.lua`. Nada lee los PDF ni las plantillas `.docx`.

### Alternativas evaluadas
- **A:** Carpeta `entrega/` con el informe y las consignas, en reemplazo de `05-entregas/` (propuesta inicial del autor).
- **B:** Conservar las siete carpetas normalizadas. Simplificar el resto: una fuente única por artefacto, `catedra/` sin subcarpetas salvo `originales/`, `instrumentos/` como fuente, y scripts sin destinos fijados.
- **C:** No reorganizar hasta después de la AE2.

### Análisis (trade-offs)
- **A** duplica la noción de entrega o abandona la estructura normalizada que exige la consigna. Además mezcla material de referencia (consignas) con material entregable, y deja el informe bajo una ruta con escritura denegada (`05-entregas/**`), lo que bloquea al redactor.
- **B** respeta la consigna y elimina las duplicaciones. Agrega una carpeta (`instrumentos/`) por preferencia expresa del autor, a cambio de generar los formatos exigidos en las carpetas normalizadas.
- **C** no tiene costo ahora, pero deja activo un script que sobrescribe el libro y mantiene la duplicación durante la redacción del Capítulo X.

### Recomendación y fundamento
Adoptar **B**. Los destinos de los artefactos pasan a una tabla de `reglas-catedra.md` (sección 8), derivada de la consigna. `armar.py` y `exportar_libro.py` reciben `--destino`, y el agente elige la carpeta. Así, un artefacto nuevo solo requiere una fila en la tabla y no un cambio de código.

### Decisión del autor
Aceptado por el autor el 24/09/2026, con la alternativa B. El autor pidió además que `armar.py` no fije destinos, y ese pedido quedó incorporado. Los movimientos en `catedra/` los ejecutó el autor (R-01, cerrado).

### Consecuencias
- Eliminados: `prototipo/`, `tools/migracion/`, `tools/migrar.py`, `03-requisitos/libro/recursos.md` y `tools/filtros/` (su filtro pasa a `tools/`).
- Movidos: los instrumentos 32 a 35 a `instrumentos/`.
- Pendiente de ejecución manual por el autor, porque la escritura en `catedra/` está denegada al agente: fusionar `catedra/consignas/` y `catedra/plantillas/` en `catedra/` y `catedra/originales/`, mover `reference.docx` y `apa.csl` a `tools/`, borrar `locales-es-ES.xml` y `catedra/devoluciones/`. Hasta que se ejecute, `armar.py` y `exportar_libro.py` no encuentran sus estilos ni la plantilla del libro.
- Se corrigieron dos defectos de `armar.py` en Windows: el control de secciones aprobadas no se aplicaba (rutas con `\`), y el separador de `--resource-path` era `:` en lugar de `;`.
- `.claude/` y `CLAUDE.md` pasan a versionarse. El repositorio es privado por exigencia de la cátedra (`catedra/AE2-guia.md`, «Repositorio privado con acceso concedido»).
- **Condición que invalidaría la decisión:** que la cátedra exija que la fuente de los instrumentos, y no solo el documento generado, esté en las carpetas normalizadas. En ese caso, `instrumentos/` se disuelve y cada fuente vuelve a su carpeta.

### Evidencia
`catedra/AE2-guia.md` (10.2); `catedra/AE2-plantilla-instrumentos.md` (recuadro inicial); `.claude/settings.json` (reglas `deny`); `tools/armar.py`; `tools/exportar_libro.py`.
