# ADR-114 — CLI: salida legible en la consola y JSON completo para programas

- Estado: propuesto
- Fecha: 11/11/2026
- Complementa: ADR-058 (interfaces CLI y web con paridad), sin cambiar sus contratos JSON
- Capítulos afectados: IX (interfaz de línea de comandos), XIII (inventario), manual §6 y §8
- Origen: sesión del 11/11/2026. El autor probó la CLI y pidió una respuesta más legible y estructurada, con tablas. Preguntó si conviene responder siempre completo o en forma breve

### Contexto

La CLI responde siempre un objeto JSON en una sola línea, de 6 a 20 KB según la consulta. Ese formato es el contrato de RIGE: lo comparan las pruebas de paridad con la web (RF-03), lo validan los esquemas de `esquemas/salida/` y lo usan los agentes en la medición final preregistrada (ADR-098), cuyo costo en tokens es una métrica.

Además, la CLI no ofrece `--help` ni `--version`, exige `--proyecto` aunque se ejecute en la carpeta del proyecto, no se instala como comando y no informa qué almacén usa.

### Alternativas evaluadas

| Tema | Elegida | Descartada |
|---|---|---|
| F · Formato | **F-A:** texto breve con tablas cuando la salida es una consola interactiva; JSON completo, idéntico al actual, cuando se redirige o con `--json`. `--texto` fuerza el texto | F-B: texto solo con `--texto`, más conservador pero incómodo para el uso habitual. F-C: texto por defecto en todos los casos, que rompería scripts, pruebas y la medición |
| D · Detalle | **D-A:** el texto es breve por defecto (respuesta y porqué); `--explicar` y `--todo` lo amplían. Ningún dato se pierde: el JSON sigue completo | D-B: texto completo, que repetiría el problema de legibilidad |
| M · Medición | **M-A:** los agentes de la medición siguen recibiendo exactamente el JSON actual, protegido por una prueba byte a byte de la salida sin consola | M-B: darles la salida breve para reducir tokens. Cambiaría el tratamiento después del preregistro |
| U · Uso | **U-A:** `--help` general y por subcomando, `--version`, subcomando `estado` (almacén en uso y esquema), `--proyecto` optativo con la carpeta actual por defecto, e instalación como comando `rige` | U-B: dejar la CLI como está |

### Análisis (trade-offs)

- **F-A** sigue la convención de herramientas como `gh` o `docker`: el formato depende de quién lee. El riesgo es que un entorno ejecute los comandos con una pseudoterminal y reciba texto donde esperaba JSON. Por eso M-A exige verificar que la herramienta de shell de OpenCode 1.18.25, la que usan los agentes de la medición, no asigna una pseudoterminal. **[D] Verificado en la pre-crítica del 11/11/2026:**
  - La herramienta `bash` crea un proceso hijo con stdout y stderr por tubería, sin pseudoterminal (`packages/opencode/src/tool/shell.ts:293` y `cross-spawn-spawner.ts:130`, tag `opencode-1.18.25`).
  - El arnés de medición redirige a archivos (`preparar_final.py:9`, `medir.sh:224`).
  - Las instrucciones preregistradas usan `--proyecto` explícito y no fuerzan `--json`.

  Por lo tanto, los agentes siguen recibiendo el JSON.
- **D-A** respeta el principio de detalle a pedido: lo breve para leer y lo completo a un parámetro de distancia.
- **M-A** preserva la validez del preregistro. M-B podría reducir el costo medido, pero se objetaría como ajuste del tratamiento a la métrica.
- **U-A** solo agrega: `--proyecto` sigue aceptándose y los mensajes de error conservan sus códigos.

### Recomendación y fundamento

F-A, D-A, M-A y U-A.

**Condición que la invalidaría:** que la herramienta de shell de OpenCode 1.18.25 ejecute los comandos con una pseudoterminal. En ese caso, el JSON es la salida por defecto en todos los casos y el texto se pide con `--texto` (F-B).

### Decisión del autor

[Pendiente: aceptación formal. El autor aceptó F-A, D-A, M-A y U-A y autorizó su implementación en la sesión del 11/11/2026 («si, pero ve lanzándolas de a una»).]

### Consecuencias

- **`src/`:** `paquetes/rige/interfaces/cli/` (formato de texto y opciones), `arranque/rige.ts` (detección de consola, carpeta actual), `package.json` (`bin`), pruebas, `MANUAL.md` y `README.md`.
- **Lo que no cambia:** casos de uso, contratos JSON, web y almacén.
- **Ficha:** T5-23.
- **Informe:** IX describe las dos salidas, a cargo del redactor.
