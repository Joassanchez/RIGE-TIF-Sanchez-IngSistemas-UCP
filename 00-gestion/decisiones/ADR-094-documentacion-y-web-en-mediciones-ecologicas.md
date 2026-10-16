# ADR-094 — Mediciones de ADR-091 y ADR-092: el agente accede a la documentación local y a `webfetch`; el acceso web se registra sin invalidar; se repiten las líneas de base dentro del árbol

- Estado: aceptado (15/10/2026)
- Fecha: 15/10/2026
- **Se decide después de conocer los resultados** de las tandas del 15/10/2026 (MED-9c). La dirección del efecto sobre el resultado no se conoce de antemano y se declara en A.VI.8.
- Capítulos afectados: Anexo VI (A.VI.7, A.VI.8); diseño de la medición (`DISENO-medicion-agentes.md`)
- Origen: sesión del 15/10/2026 (objeción del autor: «no tiene sentido prohibirle al agente el acceso a internet y documentación»)
- Relacionado: ADR-086 (punto 5, detector de acceso web), ADR-091, ADR-092, ADR-093

### Contexto

1. **[D] Defecto del instrumento.** La instrucción de las dos dimensiones indica al agente que tiene la hoja de referencia y la documentación oficial de OpenCode 1.18.25 sin conexión en `/home/evaluador/tarea/`. Con el agente dentro del árbol (ADR-091), esa carpeta queda fuera del proyecto y las variantes del ejecutor (`vm/ejecutores/*-ecologica`, `*-deteccion`) tienen `external_directory: {"*": "deny"}` sin excepción para ella. En las tandas del 15/10/2026, las 102 ejecuciones de línea de base intentan leerla y las 102 reciben el rechazo; ninguna la lee. Ni los ensayos ni las pruebas lo detectan: el proveedor simulado no lee la hoja.
2. **[D] Prohibición de la web.** Las variantes del ejecutor fijan `webfetch: deny` y `websearch: deny`, y el análisis invalida toda ejecución con `acceso_web` (`analizar_ecologica.py`). El `build` por defecto de OpenCode permite `webfetch`; el Charles original de la referente tiene `webfetch: ask` y `websearch: ask` (`evidencia/PRIV/agente-referente-charles_20261013.md`), convertidos a `deny` porque en `opencode run` nadie aprueba.
3. **[D] `websearch`** requiere `OPENCODE_ENABLE_EXA` u `OPENCODE_EXPERIMENTAL_EXA` en 1.18.25 (cadena presente en el binario); con la suscripción de ChatGPT no está disponible por defecto.
4. **[D] Resultados del 15/10/2026** (`C:/Users/Joa/rige-med9c-20261015/`): `build` válido en las dos dimensiones (3 tareas con éxito declarado falso: M-1, M-2, M-10; ID-1 = 5/7 con falso positivo C2); Charles no válido por acceso web en 35 de 51 ejecuciones (`curl` por `como-dev`, también a `raw.githubusercontent.com`). En el contraste fuera del árbol (24 ejecuciones de `build`, documentación legible), `build` lee `permissions.html` en las 24 y M-1, M-2 y M-10 siguen sin efecto con éxito declarado.

### Alternativas evaluadas

- **A:** corregir solo la documentación y mantener la prohibición de la web.
- **B:** corregir la documentación, permitir `webfetch` y registrar el acceso web como dato descriptivo, sin invalidar; repetir las líneas de base dentro del árbol.
- **C:** conservar las tandas del 15/10 como línea de base, con la limitación declarada, y sondear la sensibilidad en las tareas con problema.

### Análisis (trade-offs)

- **A** conserva la comparabilidad con ADR-086 y la reproducibilidad, pero mide un agente con menos recursos que los de un desarrollador real y deja abierta la objeción ecológica que motiva ADR-091.
- **B** mide al agente con lo que tiene por defecto. Costos: la documentación en línea corresponde a la versión vigente y no a la 1.18.25, el contenido puede variar entre tandas y el agente puede leer el código fuente. Se mitigan registrando cada acceso y aplicando la misma condición en la línea de base y en la medición final (ADR-079), con RIGE o sin él. Si el agente se equivoca por documentación de otra versión, eso forma parte del problema real.
- **C** es la más barata, pero sostiene una línea de base con un defecto conocido del instrumento y la deja sin la condición ecológica de B.

### Recomendación y fundamento

**B.**

1. **Documentación local:** `external_directory` permite `/home/evaluador/tarea/*` en las variantes ecológica y de detección de los dos ejecutores; la edición sigue denegada en esa carpeta. Los controles de aislamiento comprueban, al inicio y al final de cada tanda, que la lectura de la hoja está permitida; si no, la tanda se detiene. El proveedor simulado del ensayo lee la hoja.
2. **Web:** `webfetch: allow` en las mismas variantes; `websearch` queda como en la instalación por defecto (sin `OPENCODE_ENABLE_EXA`). La política `bash` propia de Charles no se modifica.
3. **Regla de análisis:** en estas dos dimensiones, `acceso_web` se registra y se informa por ejecución, sin invalidar. Se mantiene para las demás dimensiones la regla de ADR-086, punto 5.
4. **Repetición:** las cuatro líneas de base dentro del árbol (`build` y Charles, ecológica y detección; 102 ejecuciones), con la misma semilla (20261015), k = 3, `gpt-6.1-sol` y 600 s. Después, si la cuota lo permite, el contraste fuera del árbol con la misma condición, que sigue siendo descriptivo.
5. **Tandas del 15/10/2026:** quedan como antecedente declarado, sin computar.
6. **Sin cambios:** tareas, corpus, hojas cerradas, oráculo, indicadores y criterio de ADR-093.

**Condición que invalidaría la decisión:** que el ensayo no pueda comprobar la lectura de la hoja o la disponibilidad de `webfetch` con el arnés corregido. En ese caso se informa y se mide con A.

### Decisión del autor

**Aceptado por el autor el 15/10/2026**, tal como está redactado; delega en el ingeniero las decisiones de ejecución.

### Consecuencias

Ficha del escritor (MED-9d) para las variantes del ejecutor, los controles, el proveedor simulado y la regla de análisis; reconstrucción, ensayo y repetición de las tandas. A.VI.8 suma la bifurcación (defecto de la documentación, regla de acceso web y tandas del 15/10).

### Evidencia

- Tandas del 15/10/2026, fuera del repositorio por no computarse: `C:/Users/Joa/rige-med9c-20261015/` (`LB-ecologica-*`, `LB-deteccion-*`, `analisis/` y el contraste parcial fuera del árbol, 24 ejecuciones de `build`, en `contraste-principal/`)
- `01-relevamiento/linea-base/vm/ejecutores/`; `01-relevamiento/evidencia/PRIV/agente-referente-charles_20261013.md`
