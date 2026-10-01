# ADR-071 — RNF-07: búsqueda del proyecto público de referencia, criterio de selección y resultado (openchamber)

- Estado: aceptado (01/10/2026)
- Fecha: 01/10/2026
- Capítulos afectados: Cap. III (III.5, Anexo I, ficha de RNF-07); libro (`03-requisitos/libro/catalogo/RNF-07.md`); `01-relevamiento/fuentes.md`. Precisa ADR-055 sin cambiar su decisión
- Origen: sesión del 01/10/2026 (discusión del documento de correcciones del autor, `00-gestion/revisiones/documento_de_correcciones.md`, Cap. III, III.5)

### Contexto

ADR-055 fija el tamaño del proyecto de RNF-07 como el doble del mayor entre un proyecto público (P-D) y el de la referente (P-E). Mientras el dato de la referente no llegue, rige el proyecto público (P-F). La búsqueda del proyecto público estaba pendiente (PV-02), y por eso el criterio de aceptación de RNF-07 contiene un `[DATO PENDIENTE]` que bloquea el armado (G-01).

En la sesión del 01/10/2026 se discutieron tres alternativas al proyecto público: dejar el tamaño pendiente hasta consultar a la referente, el escenario más grande del entorno controlado y un tamaño absoluto propio. El autor eligió mantener ADR-055 con el proyecto público y consultar a la referente como complemento.

ADR-055 define el criterio de selección («el repositorio con más agentes; en caso de empate, el de más elementos»), pero no dice qué cuenta como proyecto. La búsqueda del 01/10/2026 mostró que, aplicado al pie de la letra, gana un paquete de distribución de agentes que nadie usa como configuración de un proyecto.

### Alternativas evaluadas

**Eje B · Método de búsqueda**
- **B-1:** Búsqueda de código de GitHub (`opencode.json`, `opencode.jsonc` o `.opencode/`), como prevé ADR-055. Requiere una cuenta autenticada.
- **B-2:** Búsqueda de repositorios de la API pública de GitHub con varias consultas, seguida de la lectura del árbol de archivos de cada resultado.

**Eje N · Qué cuenta como proyecto**
- **N-1:** Todo repositorio, al pie de la letra de ADR-055.
- **N-2:** Solo configuración de proyecto en uso: `.opencode/` u `opencode.json(c)` en la raíz. Se excluyen los paquetes de distribución, los catálogos y la configuración global (dotfiles).
- **N-3:** Composición del proyecto más grande con la configuración global más grande.

### Análisis (trade-offs)

**Eje B**
- **B-1:** encuentra más repositorios, pero depende de un token personal y no lo puede repetir un tercero sin cuenta.
- **B-2:** lo repite cualquiera y no requiere credenciales. Su cobertura es menor: solo encuentra repositorios cuyo nombre, descripción o README mencionan OpenCode. Es un límite declarable.

**Eje N**
- **N-1:** elige Spielewoy/autoprompt-skill (34 agentes en `agents/opencode/agents/`), que es un paquete para instalar y no la configuración de un proyecto en uso. El requisito habla de «proyecto».
- **N-2:** es coherente con el enunciado validado por la referente («el doble del tamaño que el del equipo de la referente», acta del 26/09/2026, 3.2), que se refiere a un proyecto. Deja fuera la configuración global, que ADR-055 ya declara como límite inferior.
- **N-3:** representa mejor todo lo que OpenCode lee, pero combina dos repositorios de autores distintos. Es una construcción propia que habría que justificar.

### Recomendación y fundamento

**B-2 + N-2.** Es reproducible sin credenciales, el criterio de proyecto sigue al enunciado validado y el resultado es un proyecto real con uso verificable.

**Resultado de la búsqueda (01/10/2026, 17:36 UTC):**
- Consultas: `opencode agents`, `opencode config`, `opencode subagents` y `opencode dotfiles`, ordenadas por estrellas, con 30 resultados por consulta.
- Resultado: 117 repositorios distintos. Se leyó el árbol de archivos de 100, con un clon parcial sin contenido; los otros 17 no respondieron.
- Recuento: rutas bajo `.opencode/`, `opencode/` u `opencode.json(c)`, con agentes (`agent(s)/*.md`), comandos, skills y plugins.

| Repositorio | Naturaleza | Agentes | Comandos | Otros | Con N-2 |
|---|---|---|---|---|---|
| Spielewoy/autoprompt-skill | Paquete de distribución | 34 | 0 | — | Excluido |
| hamr0/liteagents | Paquete de distribución | 10 | 13 | — | Excluido |
| timmo001/dotfiles | Configuración global | 8 | 6 | 14 plugins, 1 skill | Excluido |
| **openchamber/openchamber** | **Proyecto en uso** (`.opencode/` en la raíz) | **6** | **9** | **7 servidores LSP** | **Elegido** |
| stickyburn/hyprland-config | Configuración global | 4 | 1 | 7 skills | Excluido |
| anomalyco/opencode | Repositorio de la propia herramienta | 2 | 8 | 2 plugins, 2 skills, 2 tools | Excluido: no es un usuario |

**Proyecto elegido:** openchamber/openchamber, commit `fc012ae0029fa2ac8d1d52b4af37040fc536258e` (01/10/2026). Contiene `.opencode/opencode.json` con 7 servidores LSP, 6 agentes en `.opencode/agent/` y 9 comandos en `.opencode/commands/`: 16 archivos de configuración. El tamaño del proyecto sintético es el doble: 12 agentes, 18 comandos y 14 servidores LSP.

**Condiciones que invalidarían la decisión:**
1. **openchamber no resuelve con OpenCode 1.18.25 sin entradas ilegibles** (condición de ADR-055; su configuración es del 01/10/2026 y puede usar campos posteriores). Rige el siguiente repositorio que cumpla N-2.
2. **La referente informa un proyecto mayor.** Rige el doble del suyo (ADR-055, condición 2).
3. **Una búsqueda B-1 encuentra un proyecto en uso con más agentes.** Se reemplaza el elegido y se registra la nueva consulta.

### Decisión del autor

**Aceptado por el autor el 01/10/2026** (`/aceptar ADR-071`): B-2 + N-2, con openchamber (`fc012ae`) como proyecto público de referencia. Se mantiene ADR-055 y la consulta a la referente queda como complemento.

### Consecuencias

**Criterio de aceptación de RNF-07** (ficha del libro y Anexo I). Se reemplaza el `[DATO PENDIENTE]` del proyecto público por:

> Sobre un proyecto sintético con el doble de agentes, entradas y elementos que el mayor entre el proyecto público de referencia (openchamber, commit `fc012ae`: 6 agentes, 9 comandos y 7 servidores LSP en 16 archivos de configuración) y el proyecto del equipo de la referente, si lo informa, […]

El resto del criterio queda como lo fija ADR-055. El `[DATO PENDIENTE]` del equipo de referencia sigue en PV-01, que además cambia «máquina virtual» por «contenedor».

**Al aceptarse:**
- alta de openchamber en `01-relevamiento/fuentes.md` con `/fuente`, con la consulta, la fecha y el commit;
- en `pendientes.md`, PV-02 pasa a «verificación con OpenCode 1.18.25», que se hace junto con el contenedor (PV-01, AD-26);
- en III.5 se conserva la mención al proyecto público. Esto revierte la corrección del documento del autor sobre III.5 («eliminar cualquier referencia a un proyecto público»), por decisión del autor del 01/10/2026;
- se prepara para la referente el procedimiento de conteo (PV-03), que pide solo recuentos.

### Evidencia

- ADR-055, eje P y condiciones 1 y 2.
- Acta del 26/09/2026, 3.2: `01-relevamiento/validacion/20260925_GuiaValidacion_Sanchez_v2.md`, líneas 317 y 454.
- Repositorio: <https://github.com/openchamber/openchamber/tree/fc012ae0029fa2ac8d1d52b4af37040fc536258e/.opencode>.
- Casos de la línea de base: el más grande, C-2b, tiene 6 archivos y ningún agente en archivo (`01-relevamiento/linea-base/vm/casos/`). Por eso se descarta el escenario más grande del entorno controlado como referencia de volumen.
