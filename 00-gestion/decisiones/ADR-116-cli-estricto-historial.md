# ADR-116 — `hallazgos --estricto` con código 3 e historial de análisis desde la CLI

- Estado: propuesto
- Fecha: 13/11/2026
- Capítulos afectados: IX; XIII; manual §6; `src/AGENTS.md` §5 (lo edita el autor)
- Origen: crítica externa de `src/` del 12-13/11/2026, hallazgos CLI-16 y CLI-08; ficha T6-19. Precisa ADR-058 (códigos de salida) y ADR-114 (CLI legible).

### Contexto

1. `rige hallazgos` termina siempre en 0 («respuesta válida, con o sin hallazgos»). Eso impide usarlo como control en CI o en un *pre-commit*, que es el uso natural de un verificador de configuración.
2. `rige comparar` pide `--desde <id> --hasta <id>`, pero la CLI no lista los análisis de un proyecto: `recientes` muestra solo el último por proyecto. Desde la consola, `comparar` solo se puede usar con ids que da la web.

### Alternativas evaluadas

- **Para 1:**
  - A1. Opción `--estricto`: con al menos un hallazgo, código 3 (nuevo).
  - A2. Reutilizar el código 1.
  - A3. No cambiar.
- **Para 2:**
  - B1. `recientes --proyecto <carpeta>` lista todos los análisis de ese proyecto, y `comparar` sin ids compara los dos últimos de la carpeta actual.
  - B2. Solo documentar que los ids salen de la web.

### Análisis (trade-offs)

- **A2** confunde «hay hallazgos» con «error de uso»: un script no podría distinguirlos. **A1** agrega un código sin cambiar el comportamiento por defecto.
- **B1** amplía el contrato: `recientes` con `--proyecto` devuelve una lista por proyecto. **B2** deja una función casi inaccesible desde la CLI.
- **Ambas** cambian un caso de la prueba byte a byte contra el ejecutable congelado `cli-f085d3d`: `recientes --proyecto x` hoy es error 2. Ese caso se retira de la comparación porque pasa a ser funcionalidad nueva. Los agentes de la medición no lo usan: la medición corre sobre `congelada`.

### Recomendación y fundamento

**A1 y B1.** Son ampliaciones compatibles: sin las opciones nuevas, todas las salidas quedan byte a byte iguales. El esquema de `recientes` se amplía según convenga para que la lista por proyecto valide (`proyectos-recientes.json` o uno nuevo), y se regenera `contrato-generado.ts`.

**Condición que la invalidaría:** que un consumidor existente del JSON dependa de que `recientes --proyecto` sea un error.

### Decisión del autor

[Pendiente]

### Consecuencias

- Código de salida 3, documentado en `--help`, en README §6 y en `src/AGENTS.md` §5 (lo edita el autor).
- Esquema ampliado de `recientes`.
- `comparar` con ids opcionales.
- Un caso retirado de `T5-23-json.test.ts`.

### Evidencia

- Crítica de la CLI con Claude Fable 5.2, 12/11/2026: CLI-08 y CLI-16.
- Pre-crítica de la ficha T6-19, 13/11/2026: `T5-23-json.test.ts:107`, `arranque/rige.ts:96-97`.
