# MED-13-c3 · Planes de ensayo del banco cerrado

`../ecologica.json` cubre las 46 tareas de `ecologica/escenarios.json`.
Los once planes agregados aplican exactamente los archivos de la variante
`correcta` de `ecologica/respuestas-ecologica.json`. Son guiones deterministas
de herramientas para OpenCode; el proveedor no escribe el escenario.
La hoja y sus hashes permanecen intactos. Los desenlaces son los esperados
del ensayo, no resultados de una ejecución nativa de esta corrección.

| Tarea | Edición de la variante correcta | Desenlace esperado |
|---|---|---|
| C-1 | `agent.build.permission.edit = ask` en `P/opencode.json` | `correcta`; verificación anidada de `write src/productos.js` después de editar |
| C-2 | Permitir solo `npm run lint` dentro de bash con base `ask` | `correcta` |
| C-3 | `agent.build.permission.webfetch = deny` | `correcta` |
| C-4 | `agent.build.permission.edit = allow` | `correcta` |
| C-5 | `git commit * = ask` en la configuración global | `correcta` |
| C-6 | `agent.revisor.permission.edit = deny` | `correcta` |
| N-21 | `permission.read[".env"] = deny` en `P/opencode.json` | `correcta` |
| N-23 | `permission.read["config/credenciales.json"] = deny`, ruta relativa | `correcta` |
| N-24 | `agent.build.permission.webfetch = deny` en `P/.opencode/opencode.json` | `correcta` |
| V-9 | Instrucción de idioma en `P/AGENTS.md` | `correcta` |
| V-10 | `mcp.docs.environment.API_TOKEN = med12-ficticio`, MCP deshabilitado | `correcta` |

Para un archivo existente no vacío, OpenCode recibe `read` seguido de `edit`
con el contenido inicial completo en `oldString`. Para N-21, N-23 y V-9, si falta
el archivo de destino, recibe primero `bash` con
`como-dev 'touch -- … && chmod g+rw -- …'`: el dueño crea el archivo vacío
y habilita su edición por el grupo. Son las variantes históricas: desde
MED-13-c6 la raíz permite también creación directa con sticky y setgid, y N-21
selecciona `MED-13-c6-directa.json`. Desde MED-13-c5, el contenido correcto se aplica después mediante `write`, nunca
desde el proveedor ni desde un comando de escritura del contenido.

La selección de herramienta se aplica a todos los planes: un destino ausente
o vacío recibe `write`; uno existente no vacío conserva `read` y `edit`.
También alcanza a los destinos globales inicialmente ausentes de M-9 y M-10
(E1), y `G/opencode.jsonc` de N-11. MED-13-c5 conservó la preparación y la política
de permisos; MED-13-c6 las cambia por decisión del autor, con readmisión completa.
Los comandos de creación de las variantes históricas quedan iguales.

Los planes C-1 y M-1 incluyen, tras la edición, `bash` con
`como-dev 'opencode run …'`. Sus copias en `MED-13-anidada.json` son idénticas
a las del archivo principal; el ensayo funciona también sin ese override.
M-1 espera `correcta` y comprueba `read src/productos.js`. Los demás planes
históricos se conservan, incluidos los cinco desenlaces de M-1 a M-5:
`correcta`, `colateral`, `sin_efecto`, `incorrecta` y `sin_respuesta`.

`../deteccion.json` cubre los 11 escenarios cerrados. Los planes derivados
se compilan en el anfitrión mediante
`herramientas/generar-ecologica.py --solo-planes-deteccion --destino …`;
declaran los defectos de las respuestas cerradas sin cargar la hoja en el
contenedor. Se conservan sin cambios D-A, D-B y D-C, incluidos sus contrastes
y la respuesta sin JSON de D-B.

Para cubrir todos los planes ecológicos en el próximo ensayo, omitir
`--casos`; para comprobar únicamente la verificación anidada usar
`--casos C-1,M-1`.
