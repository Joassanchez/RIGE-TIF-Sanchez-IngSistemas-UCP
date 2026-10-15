# ADR-091 — Medición ecológica de modificación: el agente trabaja dentro del proyecto y OpenCode ejecutado decide si el cambio surtió efecto

- Estado: aceptado (14/10/2026)
- Fecha: 14/10/2026
- **Se decide después de conocer los resultados previos y antes de medir esta dimensión.** Las tareas se derivan de mecanismos de configuración, no de los casos que fallaron.
- Capítulos afectados: Cap. I (I.3.2); Cap. II (II.2, II.3); Cap. V (V.2); Anexo VI (A.VI.7, A.VI.8); diseño de la medición
- Relacionado: ADR-090, ADR-092, ADR-093; reemplaza a ADR-085 y ADR-086 como base de criterio (quedan como antecedente)

### Contexto

1. **[D]** La medición de modificación previa es inválida (ADR-086) y no ecológica: el ejecutor trabajaba desde `~evaluador/tarea` y entraba al proyecto con `como-dev` (`DISENO-medicion-agentes.md`, §3.1).
2. **[D]** El oráculo por ejecución ya existe: `vm/permisos.sh` ejecuta OpenCode con un proveedor simulado que emite una llamada fija a una herramienta y registra si se permitió.
3. Decisión del autor (14/10/2026): todo se mide con OpenCode.

### Alternativas evaluadas

- **A:** repetir el arnés anterior.
- **B:** agente dentro del árbol del proyecto, tareas por mecanismo, oráculo por ejecución de OpenCode.

### Recomendación y fundamento

**B.**

1. **Entorno:** el mismo contenedor y la misma versión (1.18.25). El agente medido (`build` y Charles, `gpt-6.1-sol`) corre como `participante`, con el directorio de trabajo en `~/proyecto`; su configuración de ejecutor se agrega por `OPENCODE_CONFIG_DIR` u otro medio que no altere la configuración del caso **[VERIFICAR en el contenedor que no interfiere con la precedencia del caso]**. Instrucción neutra, sin rutas absolutas.
2. **Tareas** (propuesta; se verifican contra el binario y se cierran antes de medir):

   | Id | Mecanismo | Tarea (resumen) | Comprobación por ejecución |
   |---|---|---|---|
   | M-1 | permiso `read` por archivo | permitir leer un único archivo bajo `read: deny` | `read` de ese archivo permitido; otro archivo sigue denegado |
   | M-2 | permiso `edit` por archivo | permitir editar un único archivo bajo `edit: ask` | `edit` de ese archivo permitido; otro sigue en `ask` |
   | M-3 | patrón de `bash` | permitir `npm test` bajo `bash: deny` | `npm test` permitido; `npm install` sigue denegado |
   | M-4 | excepción de denegación | denegar `git push` bajo `bash: allow` | `git push` denegado; `git status` sigue permitido |
   | M-5 | `external_directory` | permitir leer una carpeta fuera del proyecto | `read` de un archivo de esa carpeta permitido |
   | M-6 | agente markdown frente a JSON | permitir editar al agente `revisor`, definido en los dos | `edit` permitido para `revisor` |
   | M-7 | orden de reglas con `*` | pedir aprobación antes de `rm` con `bash: {"*": "allow"}` | `rm` en `ask`; `ls` sigue permitido |
   | M-8 | subagente | impedir que el subagente `general` ejecute `git push` | `git push` denegado al subagente; `build` sin cambio |
   | M-9 | variable de entorno `OPENCODE_PERMISSION` | pedir aprobación antes de `webfetch` cuando la variable lo permite | `webfetch` en `ask` |
   | M-10 | regla nativa | permitir leer `.env` sin aprobación | `read .env` permitido |
   | V-1 a V-4 | controles de valor | modelo, temperatura, descripción y modelo de un agente markdown | `debug agent` muestra el valor objetivo |

3. **Resultado por ejecución:** correcta (efecto logrado y nada más cambia en el agente objetivo), sin efecto, colateral, incorrecta o sin respuesta. **Indicador principal: éxito declarado falso** (el agente dice «hecho» y el efecto no se logró). Se registran tokens, tiempo y archivos tocados.
4. **Validez previa:** ningún control de valor con problema; si falla, la causa es del instrumento y se repite. Los controles no comparten mecanismo con las tareas de permiso (lección de C-1f).
5. **Repeticiones:** k = 3, `build` y Charles: unas 84 ejecuciones.
6. **Sonda de contraste** (descriptiva): las tareas de permiso con el arnés anterior (ejecutor fuera del árbol), para estimar cuánto pesaba.
7. **Medición final:** las mismas tareas con RIGE disponible e indicado (ADR-079, brazos).

**Condiciones que invalidarían la decisión:**
1. El agente no puede trabajar dentro del árbol sin que su configuración altere la del caso: se declara y se usa el arnés anterior como mejor aproximación.
2. Alguna tarea no se puede comprobar por ejecución: se retira antes de medir, con su motivo.

### Decisión del autor

**Aceptado por el autor el 14/10/2026**, tal como está redactado.

### Consecuencias

Ficha del escritor (MED-9) para el arnés dentro del árbol y la comprobación por ejecución; verificación de las tareas en el contenedor sin cuota; ensayo con proveedor simulado; tanda real.

### Evidencia

- `01-relevamiento/linea-base/vm/permisos.sh`, `DISENO-medicion-agentes.md` §3.1
- ADR-086, ADR-089; Anexo VI, A.VI.6
