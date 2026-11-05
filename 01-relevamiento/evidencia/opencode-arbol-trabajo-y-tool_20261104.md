# OpenCode 1.18.25 · Árbol de trabajo y `debug agent --tool` · 04/11/2026

Ejecución del ingeniero en el contenedor `rige-linea-base:1.18.25` (imagen `sha256:a691196f0e3e…`), sin red. Sale del dato pendiente de III.4 y de la revisión de IV.3.

Configuración en ambos casos, en `opencode.json` del directorio de trabajo: `read` con `*` → `deny` y `sub/dir/a.txt` → `allow`.

| Caso | Comando | Resultado | Lectura |
|---|---|---|---|
| Subdirectorio de un repositorio: `/tmp/repo/sub/dir`, con `git init` en `/tmp/repo` | `opencode debug agent build --tool read --params {"filePath":"/tmp/repo/sub/dir/a.txt"}` | La herramienta se ejecuta | La regla relativa a la **raíz del repositorio** coincide: el árbol de trabajo es el repositorio, no el directorio del proyecto |
| Proyecto sin Git: `/tmp/sin-git/proyecto` | `opencode debug agent build --tool read --params {"filePath":"/tmp/sin-git/proyecto/sub/dir/a.txt"}` | Error por una regla que impide la llamada | La misma regla relativa al directorio de trabajo no coincide, y decide `*` → `deny` |

**Resultado:** el supuesto de III.4 («el árbol de trabajo coincide con la raíz del proyecto analizado») no se cumple en esos dos casos. El código lo explica: sin Git el `worktree` es `/` (`project.ts`:217; `core/src/project.ts`:112) y en un subdirectorio es la raíz del repositorio (`core/src/project.ts`:119). Una forma relativa propuesta debe ser relativa al árbol de trabajo.

**`--tool`:** `opencode debug agent <nombre> --tool <id> --params <json>` ejecuta la herramienta y evalúa el permiso; sin esa opción no evalúa. No es de solo lectura y no informa regla ni procedencia. En las 276 ejecuciones ecológicas de la línea de base no aparece.

**Límites:** un caso de cada condición, con una herramienta (`read`). No se comprobó la forma sin Git con otra regla ni otras herramientas.

## RIGE frente a OpenCode en esos casos

Corrida del ingeniero sobre la etiqueta `congelada` (`0df6cb7`), imagen `rige-medicion:congelada`, Bun 1.3.14, OpenCode 1.18.25, sin red. Salida cruda: `opencode-arbol-trabajo-rige_20261104.txt`. Regla: `read`, `*` → `deny`, y después la ruta absoluta del archivo → `allow`.

| Caso | Forma que propone RIGE | Decisión de RIGE con la regla absoluta | OpenCode con la regla absoluta | OpenCode con la forma propuesta | RIGE con la forma propuesta |
|---|---|---|---|---|---|
| Subdirectorio de un repositorio | `sub/dir/a.txt` | `deny` | Denegada | Se ejecuta | `allow`, sin hallazgos |
| Raíz de un repositorio | `sub/a.txt` | `deny` | Denegada | Se ejecuta | `allow`, sin hallazgos |
| Sin Git | `tmp/sin-git/proyecto/sub/dir/a.txt` | `deny` | Denegada | Se ejecuta | `allow`, sin hallazgos |

**Resultado:** en los tres casos, RIGE informa la misma decisión que OpenCode y su forma propuesta produce el efecto declarado.

**Límites:** tres casos, en Linux, con `read` y una sola regla. RIGE detecta el árbol por lectura, sin ejecutar `git` (`worktree.ts`): la detección es aproximada ante `core.worktree` o `core.bare`, lo que declara, y rechaza `GIT_DIR` y variables afines. No se probó Windows, ni otras herramientas, ni esas configuraciones. La corrida es sobre `congelada`: si `src/` cambia, hay que repetirla.
