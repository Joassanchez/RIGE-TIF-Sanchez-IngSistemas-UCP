# Medición de modificación · MED-6 / ADR-085

El arnés usa los mismos 24 escenarios y mide el cambio del estado efectivo del
agente objetivo. G2': los cambios en otros agentes son descriptivos. El corrector
externo compara modelo, temperatura, descripción y S1–S10; reutiliza `wc` y
`decidir` del evaluador validado el 14/10/2026, sin RIGE ni juez de lenguaje.

La hoja Markdown y su JSON nunca ingresan a la imagen ni se copian al contenedor.
Sólo se copia `tareas.md`, por `docker cp`; su SHA-256 debe coincidir con
`--hash-tareas` y queda en `tanda.json`. La instrucción conserva el texto del
bloque de código; se sustituyen exclusivamente `{DIRECTORIO}` y `{TAREA}`.

## Construcción y pruebas externas

Desde `01-relevamiento/linea-base/`, en Git Bash o WSL:

```bash
python -B herramientas/generar-respuestas-json.py --dimension modificacion
python -B -m unittest discover -s herramientas -p 'test_*.py'
python -B -m unittest discover -s vm/simulado -p 'test_*.py'
bash -n vm/medir.sh vm/contenedor.sh
bash vm/contenedor.sh construir
```

La construcción, Docker y la verificación nativa los ejecuta el ingeniero.
Las pruebas nuevas contienen una copia portátil de las capturas originales
(`herramientas/fixtures/med6-capturas.json`): 79 capturas, las 51 variantes de
`esperados-G2prima.txt` y las 13 decisiones ejecutadas en la fase 2. No necesitan
la carpeta temporal `.trabajo/`. Las pruebas existentes de atribución no se editan.

## Ensayo sin credenciales

Las rutas de evidencia deben estar fuera del repositorio y las carpetas destino
deben existir y estar vacías. Ejemplo con dos tandas, en este orden:

```bash
unset OPENCODE_AUTH_JSON
RAIZ_EVIDENCIA="$HOME/evidencia-rige-med6"
mkdir -p "$RAIZ_EVIDENCIA/ensayo-principal" "$RAIZ_EVIDENCIA/ensayo-charles"
HASH_TAREAS=$(sha256sum modificacion/tareas.md)
HASH_TAREAS=${HASH_TAREAS%% *}

bash vm/contenedor.sh medir --ensayo --dimension modificacion \
  --hash-tareas "$HASH_TAREAS" --destino "$RAIZ_EVIDENCIA/ensayo-principal" \
  --tanda ensayo-mod-principal --condicion LB --brazo LB --ejecutor principal \
  --modelo openai/gpt-6.1-sol --k 3 --limite 600 --semilla 20261014
bash vm/contenedor.sh medir --ensayo --dimension modificacion \
  --hash-tareas "$HASH_TAREAS" --destino "$RAIZ_EVIDENCIA/ensayo-charles" \
  --tanda ensayo-mod-charles --condicion LB --brazo LB --ejecutor charles \
  --modelo openai/gpt-6.1-sol --k 3 --limite 600 --semilla 20261014

for EJECUTOR in principal charles; do
  TANDA="$RAIZ_EVIDENCIA/ensayo-$EJECUTOR/ensayo-mod-$EJECUTOR"
  python -B herramientas/corregir_modificacion.py "$TANDA/registro.jsonl" \
    --respuestas modificacion/respuestas-modificacion.json --salida "$TANDA/corregido.jsonl"
  python -B herramientas/analizar.py "$TANDA/corregido.jsonl" \
    --dimension modificacion --destino "$TANDA/analisis"
done
```

La red queda en `none`. El proveedor sólo escucha en bucle local y ofrece tokens
inventados; las recetas piden `read` y `edit` a OpenCode, sin escribir el escenario
desde root. Entre los 24 casos hay `correcta`, `colateral` (C-3d), `sin_efecto`
(C-2a), `incorrecta` (C-2d) y `sin_respuesta` (C-2f). Las variantes mínimas de
la segunda captura se usan en C-1d, C-4c, C-4e y C-4f; C-2e informa el impedimento.
Estos resultados verifican el circuito y no son evidencia de la hipótesis ni
deciden cumplimiento. Confirmar los cinco resultados en `corregido.jsonl`.

## Edición como evaluador

Se instalan `principal-modificacion/` o `charles-modificacion/`; las variantes
de atribución conservan sus contenidos y hashes. `edit` deniega por defecto y
permite los sujetos relativos de las rutas de configuración mediante patrones
con prefijo `*participante/`: `*participante/.config/opencode/*`,
`*participante/proyecto/opencode.json` / `opencode.jsonc`, sus equivalentes en
subdirectorios y los árboles `.opencode/`. La primera regla sigue siendo
`"*": "deny"`; no se habilitan fuentes, `src/`, `README.md` ni `.bashrc`.
Charles conserva su instrucción, temperatura y demás permisos.

Después de activar y preparar cada caso, se da escritura al grupo `participante`
en esos archivos y directorios, con setgid en los directorios. El evaluador ya
pertenece a ese grupo (`instalar.sh`). No se habilita escritura en `proyecto/`,
`sub/`, fuentes, `.git` ni `.bashrc`. Para crear un archivo de configuración cuyo
padre no sea escribible por evaluador, sigue disponible `como-dev` con el entorno
del participante; no se amplían los modos de ese padre.

Antes de medir, cada tanda captura como evaluador `opencode debug agent build`
o `opencode debug agent '[AUX] Charles'`. `verificacion-edit.json` comprueba la
última regla sobre `path.relative(worktree, archivo)`, como solicitan `edit`,
`write` y `apply_patch` en el binario 1.18.25. Para el evaluador fuera de git se
prueban ambos worktrees candidatos: `/` y `/home/evaluador/tarea`. Por ejemplo,
el archivo `/home/participante/proyecto/opencode.json` genera los sujetos
`home/participante/proyecto/opencode.json` y
`../../participante/proyecto/opencode.json`. Se verifican seis rutas permitidas
y cuatro denegadas por candidato (12 y 8 sujetos); sólo se marca `valido` si
todos coinciden con la decisión esperada. El JSON registra los worktrees, los
sujetos y sus decisiones. Un resultado distinto detiene la tanda.
Cada intento guarda también
`crudo/<caso>-<repetición>-<intento>.ejecutor.json`.

**Ensayo nativo del ingeniero, 14/10/2026:** todas las llamadas a `edit` fueron
rechazadas en ambos ejecutores; no se tocó ningún archivo y hubo 64–66 resultados
`sin_efecto` de 72. La comprobación anterior evaluaba rutas absolutas y daba
`valido` en falso. El ingeniero identificó en el binario que el sujeto del permiso
es relativo al worktree. Estos resultados documentan el fallo del arnés; no
deben interpretarse como evidencia sobre las tareas de modificación.

**Resultado verificado sin Docker:** hashes de ambas variantes de atribución
intactos; los patrones corregidos permiten las rutas de configuración y deniegan
las ajenas para ambos sujetos relativos. La prueba de regresión reproduce las
reglas absolutas anteriores y exige `valido: false`. Los tres archivos de las
variantes de modificación tienen hashes nuevos en `congeladas.json`.
**[VERIFICAR: repetir el ensayo nativo con las variantes corregidas en ambos
ejecutores]**. El escritor no ejecutó Docker por la regla 2 de MED-6. El ingeniero
debe reconstruir la imagen y repetir los pasos de ensayo anteriores en carpetas
externas nuevas y vacías, revisando `verificacion-edit.json`, los retornos de
`edit` y los archivos cambiados. No se amplía la escritura del sistema de archivos.
Si la escritura de grupo no alcanza para
`edit`, detenerse: la alternativa exclusiva por `como-dev` la decide el autor.

## Tanda real

**[DECISIÓN PENDIENTE: cierre formal de tareas, hoja y ADR-085 por el autor]**.
Al implementar MED-6 ambos Markdown declaran borrador y el JSON conserva
`hoja_cerrada=null`, con la misma regla del generador de atribución. No medir
datos reales hasta el cierre; después regenerar el JSON y registrar el hash de
las tareas que se aprobó. No interpretar una medición con hoja abierta.

Tras construir, ensayar y verificar ambos ejecutores, cargar la credencial sólo
en `OPENCODE_AUTH_JSON` (no escribirla en comandos, archivos ni evidencia):

```bash
mkdir -p "$RAIZ_EVIDENCIA/LB-principal" "$RAIZ_EVIDENCIA/LB-charles"
HASH_TAREAS=$(sha256sum modificacion/tareas.md)
HASH_TAREAS=${HASH_TAREAS%% *}
bash vm/contenedor.sh medir --dimension modificacion --hash-tareas "$HASH_TAREAS" \
  --destino "$RAIZ_EVIDENCIA/LB-principal" --tanda LB-mod-principal \
  --condicion LB --brazo LB --ejecutor principal --modelo openai/gpt-6.1-sol \
  --k 3 --limite 600 --semilla 20261014
bash vm/contenedor.sh medir --dimension modificacion --hash-tareas "$HASH_TAREAS" \
  --destino "$RAIZ_EVIDENCIA/LB-charles" --tanda LB-mod-charles \
  --condicion LB --brazo LB --ejecutor charles --modelo openai/gpt-6.1-sol \
  --k 3 --limite 600 --semilla 20261014
unset OPENCODE_AUTH_JSON

for EJECUTOR in principal charles; do
  TANDA="$RAIZ_EVIDENCIA/LB-$EJECUTOR/LB-mod-$EJECUTOR"
  python -B herramientas/corregir_modificacion.py "$TANDA/registro.jsonl" \
    --respuestas modificacion/respuestas-modificacion.json --salida "$TANDA/corregido.jsonl"
done
python -B herramientas/analizar.py \
  "$RAIZ_EVIDENCIA/LB-principal/LB-mod-principal/corregido.jsonl" \
  "$RAIZ_EVIDENCIA/LB-charles/LB-mod-charles/corregido.jsonl" \
  --dimension modificacion --destino "$RAIZ_EVIDENCIA/analisis-LB"
```

Los parámetros son k = 3, `openai/gpt-6.1-sol`, 600 s y semilla 20261014; la semilla
ordena los pares y no asegura determinismo del proveedor. Se conservan cuota,
reintentos, recuperación de sesiones, censura y consumo de todos los intentos.
Para reanudar tras cuota, usar nueva tanda/carpeta vacía y `--pares C-2a:2,...`
con los pares pendientes, sin cambiar k ni la semilla. Mantener las capturas junto
al registro: el corrector resuelve sus rutas relativas al directorio del crudo.

En C-2e un impedimento no cubierto genera `revision_manual.csv`. Guardar la
adjudicación en otro CSV (`id,hash_respuesta,resultado,motivo`) y repetir el comando
del corrector agregando `--adjudicaciones <archivo.csv>`. No adjudicar fallos de
preparación ni registros incompletos como si fueran respuestas.

La alteración del escenario se mide y no excluye el registro. Se registran
`archivos_tocados`, `entorno_alterado` y `fuera_configuracion` por intento y ejecución;
se restaura el bloque original antes de la captura posterior. Cambiar el ejecutor
o perder tokens/capturas sí impide una lectura válida. El análisis usa la validez
previa y los umbrales de ADR-079, con ramas E, P y N; C no aplica. En P y N informa
la no regresión y cada caso. Incluye las proporciones de sin efecto, colateral y
éxito declarado falso. FIN conserva los brazos indicado/disponible y las barreras
existentes de instalación e indicación de RIGE.

## Regresión de atribución resuelta

La primera corrida de MED-6 detectó que `respuestas.md` y `respuestas.json` difieren
sólo en `sha256_hoja`: actual `1be0d2a0ef32d73e0e391a6d0d557617383d43479f49255d1078e27ded06f61e`,
registrado `68ca1bfdaa0fb0fc3da7c2dd1584dbaa001b1b264556849627ff688ee9bbc0f3`.
El generador original de atribución reproducía esa diferencia. En la corrida
posterior a la corrección de permisos relativos pasan las 131 pruebas de
`herramientas/` y las 10 de `vm/simulado/`, incluida la reproducibilidad de la hoja
de atribución; también pasa `bash -n vm/medir.sh vm/contenedor.sh`. El escritor no
modificó los archivos de respuestas de atribución, excluidos de la ficha.
