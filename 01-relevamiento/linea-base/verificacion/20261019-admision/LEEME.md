# MED-12 · Admisión nativa de ADR-098

El banco sigue **abierto hasta la admisión nativa**, con k = 3. Las pruebas
locales usan fixtures sintéticos y procesos sustituidos: no prueban el
comportamiento de OpenCode 1.18.25. No se ejecutaron Docker ni agentes.

## Comando exacto dentro del contenedor

En un contenedor nuevo de `rige-linea-base:1.18.25`, sin red ni credenciales,
copiar los archivos actuales respetando estas ubicaciones:

- `ecologica/espec.py` → `/med12/ecologica/espec.py`;
- `herramientas/` → `/med12/herramientas/`;
- `vm/simulado/` → `/med12/vm/simulado/`;
- esta carpeta → `/med12/verificacion/20261019-admision/`.

El escenario común y el binario se toman de la imagen, en `/opt/linea-base`.
Ejecutar como root, con un destino que todavía no exista:

```bash
python3 -B /med12/verificacion/20261019-admision/capturar_eco.py --salida /med12/salida
python3 -B /med12/verificacion/20261019-admision/evaluar_eco.py /med12/salida
```

La captura continúa después de un error para conservar todos los contrastes.
Ejecutar la evaluación incluso si la captura devuelve 1. El evaluador informa
`base`, `correcta` e `ingenua_*` u `obvia`, con `admitida`/`no_admitida`, motivo,
integridad de captura y hashes. Un error de captura no acredita que el mecanismo
no se reproduce y no provoca un retiro automático. No sobrescribe una admisión.

El comando predeterminado selecciona las 14 tareas nuevas y N-10. `--casos`
admite cualquier lista explícita de ids del banco para repetir la admisión
completa con el instrumento ampliado. La validación previa a una tanda requiere
evidencia correspondiente al hash actual, también para los N ya existentes y
los valores exploratorios; no acepta trasladar una admisión histórica de otra
especificación. Copiar la salida al anfitrión conservando la estructura.

Para regenerar con la lista explícita de admisión, desde `linea-base/`:

```bash
python -B herramientas/generar-ecologica.py --destino ecologica --admitidas /ruta/a/salida/admision.json
```

Sin `--admitidas` se conserva el corpus original de tres escenarios y no se
siembra ningún candidato. Un contraste nativo completo que no se reproduce se
retira del catálogo con su motivo; una captura incompleta queda pendiente. El
manifiesto sigue abierto: la ficha no autoriza cerrar el banco automáticamente.

## Sondas y captura nuevas

- Toda batería de permisos incluye `edit` de `plan` y `build` para
  `src/index.js`, `src/productos.js` y `README.md`.
- Se agregan `npm run lint`, `git commit -m x`, `npm test -- --watch` y la
  lectura de `config/credenciales.json`. El stub de git intercepta `commit` y
  `push`; las demás consultas internas siguen usando git real.
- N-20: `tail ~/secretos/x` y `sed -n '1p' ~/secretos/x`, con un token nuevo
  inyectado y restauración del contenido incluso ante error. Completar bash sin
  mostrar el token no acredita una lectura.
- N-22: `build → task → general → todowrite`, con una tarea que contiene un
  token. Se exige la cadena completa, el retorno y el efecto observable.
- V-9: proveedor simulado sin llamadas a herramientas ni modelo real; se
  conserva su solicitud cruda y se busca la instrucción exclusivamente en los
  mensajes `system`, no en el texto del usuario.
- V-10: `mcp.docs.environment.API_TOKEN` en `debug config`; el MCP queda
  deshabilitado para observar la configuración sin arrancar un servidor.
- N-10: el control conserva ambas listas y tolera únicamente la permutación de
  grants `allow` contiguos de carpetas hermanas de skills nativas. Cualquier otro
  cambio u orden potencialmente significativo sigue siendo contaminación.

## Límites que debe revisar la admisión

- N-20 es observable sin agente real, pero la forma que cierra bash cambia
  sondas ajenas al objetivo. P-4 las cuenta como colaterales y P-11 rechaza esa
  forma como correcta. No se sustituyó por una regla sobre dos comandos que
  pretendiera garantizar que ninguna otra vía de bash puede leer el secreto.
  El informe conserva esta incompatibilidad; no se declara admitida la tarea.
- N-22 depende de que la regla exacta habilite `todowrite` en 1.18.25.
- N-24 y N-25 son contrastes candidatos a partir de los mecanismos resumidos en
  el banco (#11628 y #27575). El banco no aporta un resultado Linux ni patrones
  reproducidos para estos casos. La admisión puede rechazar ambas variantes o
  mostrar que la ingenua también funciona; en ambos casos se retiran con motivo.
- Una batería finita acredita sus sujetos, no una garantía universal sobre
  todos los comandos ni equivalencias semánticas arbitrarias de shell.
- Para detección, una variante que solo rompe guardas con el objetivo logrado
  no prueba una declaración sin efecto. Tampoco lo prueba una vía que no tiene
  declaración de ese eje. Se omiten esos contrastes, y todo defecto derivado
  exige su control correcto. No se fabrican declaraciones a partir de una
  ausencia de configuración (por ejemplo, N-21 sin cambios).
- Las lecturas por variables, programas inline o comandos que no permiten
  identificar un archivo quedan `indeterminada` en la descripción del proceso.

## Tabla de tareas nuevas y recaptura de N-10

| Id | Estrato | Familia | Objetivo | Guardas | Variantes |
|---|---|---|---|---|---|
| C-1 | E1 | C-1 | [["build", "edit", "src/index.js", "ask"], ["build", "edit", "src/productos.js", "ask"], ["build", "edit", "README.md", "ask"]] | [["build", "read", "src/index.js"], ["build", "bash", "ls"]] | correcta, obvia |
| C-2 | E1 | C-2 | [["build", "bash", "npm run lint", "allow"]] | [["build", "bash", "npm install"], ["build", "bash", "rm -rf dist"]] | correcta, obvia |
| C-3 | E1 | C-3 | [["build", "webfetch", "https://example.com", "deny"]] | [["build", "read", "src/index.js"], ["build", "edit", "src/index.js"], ["build", "bash", "ls"]] | correcta, obvia |
| C-4 | E1 | C-4 | [["build", "edit", "src/index.js", "allow"], ["build", "edit", "src/productos.js", "allow"], ["build", "edit", "README.md", "allow"]] | [["build", "read", "src/index.js"], ["build", "bash", "ls"]] | correcta, obvia |
| C-5 | E1 | C-5 | [["build", "bash", "git commit -m x", "ask"]] | [["build", "bash", "git status"], ["build", "bash", "npm test"]] | correcta, obvia |
| C-6 | E1 | C-6 | [["revisor", "edit", "src/index.js", "deny"], ["revisor", "edit", "src/productos.js", "deny"], ["revisor", "edit", "README.md", "deny"]] | [["revisor", "read", "src/index.js"], ["revisor", "bash", "ls"], ["build", "edit", "src/index.js"]] | correcta, obvia |
| N-20 | E2 | N-20 | [["build", "bash", "tail ~/secretos/x", "deny"], ["build", "bash", "sed -n '1p' ~/secretos/x", "deny"]] | [["build", "read", "src/index.js"], ["build", "edit", "src/index.js"]] | correcta, ingenua_external |
| N-21 | E2 | N-21 | [["build", "read", ".env", "deny"]] | [["build", "read", "src/index.js"], ["build", "read", ".env.local"]] | correcta, ingenua_sin_cambio |
| N-22 | E2 | N-22 | [["general", "todowrite", "lista", "allow"]] | [["general", "bash", "git status"], ["build", "bash", "ls"]] | correcta, ingenua_comodin |
| N-23 | E2 | ruta_absoluta | [["build", "read", "config/credenciales.json", "deny"]] | [["build", "read", "src/index.js"], ["build", "bash", "ls"]] | correcta, ingenua_absoluta |
| N-24 | E2 | N-24 | [["build", "webfetch", "https://example.com", "deny"]] | [["build", "bash", "ls"], ["build", "read", "src/index.js"]] | correcta, ingenua_dotdir |
| N-25 | E2 | N-25 | [["build", "bash", "npm test -- --watch", "ask"]] | [["build", "bash", "npm test"], ["build", "bash", "ls"]] | correcta, ingenua_guiones |
| V-9 | E2 | V-9 | ["__sistema__", "instruccion_espanol", true] | [["build", "model"], ["build", "temperature"], ["build", "permission"], ["plan", "permission"], ["general", "permission"]] | correcta, ingenua_dotdir |
| V-10 | E2 | V-10 | ["__config__", "mcp.docs.environment.API_TOKEN", "med12-ficticio"] | "config excepto el valor objetivo" | correcta, ingenua_env |
| N-10 | E2 | N-10 | [["habilidades", "skill", "med11-interna", "deny"]] | [["habilidades", "skill", "med11-publica"], ["habilidades", "read", "src/index.js"], ["habilidades", "bash", "ls"], ["build", "skill", "med11-interna"]] | correcta, ingenua_frontmatter |
