# MED-19: verificación local y comandos del ingeniero

Implementación realizada sin commits, Docker, agentes ni reconstrucción de la imagen. No se editaron la hoja cerrada, las tarifas, `comun.py`, las instrucciones del ingeniero ni `PREREGISTRO.json`. Los archivos de `control-base/` son un **control de lectura de la línea de base, sin tandas finales**. Antes de c5 ya coinciden byte a byte con c4. Su veredicto de falta de ejecución no es una medición final.

## Resultados locales

- En `herramientas/`: `python -B -m unittest`, 199 pruebas, todas pasan.
- En `vm/simulado/`: `python -B -m unittest`, 103 pruebas, pasan; 4 omitidas por requisitos del entorno.
- `bash -n vm/contenedor.sh`, `bash -n vm/medir.sh` y `bash -n herramientas/medir-med9c-paralelo.sh`: pasan.
- `python -B verificacion/20261105-med19/contrafactual.py`: las cinco comprobaciones fallan frente al código de `HEAD`, cargado en memoria. Detalles en `contrafactual.json`; no se reemplazan archivos ni se modifica git.
- Control real: `C:/Users/Joa/archivo-linea-base/final-med17-analisis.tar.gz`, leído directamente, sin extraerlo. Medianas de `costo_usd`, redondeadas a cuatro decimales: `principal/E1=0,0603`, `principal/E2=0,0667`, `charles/E1=0,0717`, `charles/E2=0,0764`.
- Evidencia heredada: cuatro particiones, **43.822 hashes verificados**. Se heredan 44 tareas. Las seis que requieren evidencia nueva son S-3, M-2 y R-1 a R-4.
- Búsqueda en `src/pruebas/escenarios/`: ninguna ruta o nombre de archivo reservado aparece en ese árbol. Las pruebas repiten el control.

Comando del control de costo, desde `linea-base/`:

```bash
python -B herramientas/analizar_final.py --base C:/Users/Joa/archivo-linea-base/final-med17-analisis.tar.gz --destino verificacion/20261105-med19/control-base
```

## Admisión parcial nativa (procedimiento del ingeniero)

Estos comandos son para Git Bash, desde `linea-base/`. Usan un contenedor nuevo, sin red, credenciales ni montajes. Las especificaciones entran exclusivamente al contenedor de admisión; el lanzador de medición nunca las copia. La hoja de este espacio ya fue cerrada tras la admisión: el procedimiento se conserva como referencia, no debe regenerarse abierta sobre ese cierre.

```bash
export MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL='*'
unset OPENCODE_AUTH_JSON
ruta_docker() { if command -v cygpath >/dev/null 2>&1; then cygpath -m "$1"; else printf '%s\n' "$1"; fi; }
BASE=$(pwd -P)
ADM='C:/Users/Joa/evidencia-admision-med19-20261105'
CONT=med19-admision-20261105
CASOS='S-3,M-2,R-1,R-2,R-3,R-4'
[[ ! -e $ADM ]] || exit 2
mkdir "$ADM"
python -B herramientas/generar-ecologica.py --final --destino ecologica/final
[[ $(docker image inspect rige-linea-base:1.18.25 --format '{{.Id}}') == sha256:a691196f0e3e* ]] || exit 2
docker run --detach --init --network none --platform linux/amd64 --user root --name "$CONT" rige-linea-base:1.18.25 sleep infinity
docker exec "$CONT" mkdir -p /med19/vm /med19/verificacion
docker cp "$(ruta_docker "$BASE/ecologica")" "$CONT:/med19/ecologica"
docker cp "$(ruta_docker "$BASE/herramientas")" "$CONT:/med19/herramientas"
docker cp "$(ruta_docker "$BASE/vm/simulado")" "$CONT:/med19/vm/simulado"
docker cp "$(ruta_docker "$BASE/vm/casos")" "$CONT:/med19/vm/casos"
docker cp "$(ruta_docker "$BASE/verificacion/20261019-admision")" "$CONT:/med19/verificacion/20261019-admision"
CAPTURA=0
docker exec "$CONT" python3 -B /med19/verificacion/20261019-admision/capturar_eco.py --espec /med19/ecologica/final/espec_final.py --casos "$CASOS" --salida /med19/salida || CAPTURA=$?
EVALUACION=0
docker exec "$CONT" python3 -B /med19/verificacion/20261019-admision/evaluar_eco.py /med19/salida --espec /med19/ecologica/final/espec_final.py --casos "$CASOS" || EVALUACION=$?
docker exec "$CONT" tar -cpf /tmp/med19-admision.tar -C /med19/salida .
HASH=$(docker exec "$CONT" sha256sum /tmp/med19-admision.tar)
HASH=${HASH%% *}
docker cp "$CONT:/tmp/med19-admision.tar" "$(ruta_docker "$ADM/evidencia.tar")"
python -B herramientas/evidencia_portable.py "$ADM/evidencia.tar" --destino "$ADM" --sha256 "$HASH"
docker rm -f "$CONT"
printf 'captura=%s evaluacion=%s\n' "$CAPTURA" "$EVALUACION"
```

Revisar los resultados aun si la evaluación devuelve 1. Una captura incompleta bloquea la tarea; una R con contraste nativo completo pero no admitida puede retirarse al cerrar. S-3 y M-2 deben estar admitidas. La raíz histórica completa se expande a `p1` a `p4`, manteniendo los controles de cada partición.

Cierre de **solo la hoja final**, una vez revisada la admisión:

```bash
python -B herramientas/generar-ecologica.py --final --destino ecologica/final --cerrar 05/11/2026 --evidencia-admision C:/Users/Joa/evidencia-admision-completa-20261020c --evidencia-admision C:/Users/Joa/evidencia-admision-med19-20261105
```

La fecha de ese comando debe ser la del cierre efectivo elegido por el ingeniero. El recierre exige los mismos artefactos y fecha; no permite reabrir. Detección conserva exactamente las respuestas cerradas. La implementación inicial entregó una hoja abierta; el ingeniero la cerró el 05/11/2026 y ese cierre se conserva sin cambios.

## Ensayo por brazo (pendiente; ejecutar por el ingeniero)

Antes de cada tanda (en ensayo y en medición): pausar el escudo web del antivirus del equipo y comprobar el emisor del certificado con un contenedor aparte de la misma imagen:
```bash
docker run --rm --platform linux/amd64 rige-linea-base:1.18.25 sh -c 'openssl s_client -connect <host>:443 -servername <host> </dev/null 2>/dev/null | openssl x509 -noout -issuer'
```
para cada host del proveedor que usen los ejecutores (en el piloto del 12/11/2026, `chatgpt.com`, según la observación del autor). Si el emisor es el antivirus, la tanda no se lanza (ADR-098, punto 49). Si la imagen no trae `openssl`, usar `curl -sv https://<host> -o /dev/null` y leer la línea `issuer:`.

Desde `linea-base/`, con `RIGE_BINARIO` apuntando al binario Linux compilado de la etiqueta y `RIGE_ETIQUETA` con esa etiqueta. Ambos son obligatorios para `indicado` y `disponible`, incluso en ensayo. No se simula el binario RIGE.

```bash
unset OPENCODE_AUTH_JSON
export RIGE_EVIDENCIA_ADMISION='C:/Users/Joa/evidencia-admision-completa-20261020c;C:/Users/Joa/evidencia-admision-med19-20261105'
: "${RIGE_BINARIO:?Definir ruta al binario Linux compilado}"
: "${RIGE_ETIQUETA:?Definir etiqueta del binario}"
export RIGE_BINARIO RIGE_ETIQUETA
EVIDENCIA='C:/Users/Joa/ensayo-med19-20261105'
for BRAZO in LB sin_rige indicado disponible probar; do
  bash herramientas/medir-med9c-paralelo.sh "$EVIDENCIA" "eco-$BRAZO" ecologica principal --hoja final --brazo "$BRAZO" --ensayo --k 3 --casos M-1,M-2,S-3,R-1,R-2,R-3,R-4,V-1
done
for BRAZO in indicado disponible; do
  bash herramientas/medir-med9c-paralelo.sh "$EVIDENCIA" "det-$BRAZO" deteccion principal --hoja final --brazo "$BRAZO" --ensayo --k 3
done
```

Si se retiró una R al cerrar, quitarla de `--casos`. Para ensayar el banco completo, usar la lista explícita `BANCO` de la sección siguiente y mantener `--ensayo`: omitir `--casos` selecciona 50 tareas, mezcla el reservado y cambia el reparto de octubre. Para Charles, cambiar el cuarto argumento a `charles` y usar tandas nuevas. No reutilizar la raíz del ensayo que esté corriendo.

## Medición real: prioridades 1 a 4

Paso previo a cada tanda: pausar el escudo web del antivirus del equipo y comprobar el emisor del certificado con un contenedor aparte de la misma imagen:
```bash
docker run --rm --platform linux/amd64 rige-linea-base:1.18.25 sh -c 'openssl s_client -connect <host>:443 -servername <host> </dev/null 2>/dev/null | openssl x509 -noout -issuer'
```
para cada host del proveedor que usen los ejecutores (en el piloto del 12/11/2026, `chatgpt.com`, según la observación del autor). Si el emisor es el antivirus, la tanda no se lanza (ADR-098, punto 49). Si la imagen no trae `openssl`, usar `curl -sv https://<host> -o /dev/null` y leer la línea `issuer:`.

Aviso de unión: las tandas previas a MED-20 tienen otro `hash_wrapper_rige` y `unir.py` (≈33) no las une con las posteriores.

Comandos para Git Bash desde `linea-base/`, sin `--ensayo`. El ingeniero carga la credencial por variable de entorno y fija el binario Linux y la etiqueta final. La raíz de medición es independiente del ensayo. Cada tanda debe ser nueva y el lanzador rechaza un destino existente. El banco conserva las **46 tareas y su orden de octubre**: con semilla 20261015 y k=3 reproduce los repartos `reparto-LB-ecologica-principal.json` y `reparto-LB-ecologica-charles.json`. No omitir `--casos` en el banco ni añadirle las R.

```bash
export MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL='*'
export RIGE_EVIDENCIA_ADMISION='C:/Users/Joa/evidencia-admision-completa-20261020c;C:/Users/Joa/evidencia-admision-med19-20261105'
: "${OPENCODE_AUTH_JSON:?Cargar la credencial del evaluador por variable de entorno}"
: "${RIGE_BINARIO:?Definir ruta al binario Linux compilado de la etiqueta final}"
: "${RIGE_ETIQUETA:?Definir etiqueta final del binario}"
export OPENCODE_AUTH_JSON RIGE_BINARIO RIGE_ETIQUETA
EVIDENCIA='C:/Users/Joa/medicion-final-med19'
BANCO='M-1,M-2,M-3,M-4,M-5,M-6,M-7,M-8,M-9,M-10,V-1,V-2,V-3,V-4,N-1,N-2,N-3,N-4,N-5,N-6,N-7,N-9,N-10,N-11,N-12,N-13,N-14,N-15,V-5,V-6,V-7,V-8,S-1,S-2,S-3,C-1,C-2,C-3,C-4,C-5,C-6,N-21,N-23,V-9,V-10,N-24'
PROBAR='M-1,M-2,M-3,M-4,M-5,M-6,M-7,M-8,M-9,M-10,V-1,V-2,V-3,V-4,N-1,N-2,N-3,N-4,N-5,N-6,N-7,N-9,N-10,N-11,N-12,N-13,N-14,N-15,V-5,V-6,V-7,V-8,C-1,C-2,C-3,C-4,C-5,C-6,N-21,N-23,V-9,V-10,N-24'
RESERVADO='R-1,R-2,R-3,R-4'
CONTEMPORANEO='M-1,M-2,M-10,N-14,N-23'

# Prioridad 1: build, 210 ejecuciones; reservado y control en tandas separadas.
bash herramientas/medir-med9c-paralelo.sh "$EVIDENCIA" p1-banco-indicado ecologica principal --hoja final --brazo indicado --k 3 --casos "$BANCO"
bash herramientas/medir-med9c-paralelo.sh "$EVIDENCIA" p1-deteccion-indicada deteccion principal --hoja final --brazo indicado --k 3
bash herramientas/medir-med9c-paralelo.sh "$EVIDENCIA" p1-reservado-indicado ecologica principal --hoja final --brazo indicado --k 3 --casos "$RESERVADO"
bash herramientas/medir-med9c-paralelo.sh "$EVIDENCIA" p1-reservado-sin-rige ecologica principal --hoja final --brazo sin_rige --k 3 --casos "$RESERVADO"
bash herramientas/medir-med9c-paralelo.sh "$EVIDENCIA" p1-control-contemporaneo ecologica principal --hoja final --brazo sin_rige --k 3 --casos "$CONTEMPORANEO"

# Prioridad 2: build, probar, solo E1 y E2, 129 ejecuciones.
bash herramientas/medir-med9c-paralelo.sh "$EVIDENCIA" p2-probar ecologica principal --hoja final --brazo probar --k 3 --casos "$PROBAR"

# Prioridad 3: Charles, 195 ejecuciones; sin control contemporáneo adicional.
bash herramientas/medir-med9c-paralelo.sh "$EVIDENCIA" p3-banco-indicado ecologica charles --hoja final --brazo indicado --k 3 --casos "$BANCO"
bash herramientas/medir-med9c-paralelo.sh "$EVIDENCIA" p3-deteccion-indicada deteccion charles --hoja final --brazo indicado --k 3
bash herramientas/medir-med9c-paralelo.sh "$EVIDENCIA" p3-reservado-indicado ecologica charles --hoja final --brazo indicado --k 3 --casos "$RESERVADO"
bash herramientas/medir-med9c-paralelo.sh "$EVIDENCIA" p3-reservado-sin-rige ecologica charles --hoja final --brazo sin_rige --k 3 --casos "$RESERVADO"

# Prioridad 4: build, disponible (138) y contraste indicado (30).
bash herramientas/medir-med9c-paralelo.sh "$EVIDENCIA" p4-banco-disponible ecologica principal --hoja final --brazo disponible --k 3 --casos "$BANCO"
bash herramientas/medir-med9c-paralelo.sh "$EVIDENCIA" p4-contraste-indicado ecologica principal --fuera-del-arbol --hoja final --brazo indicado --k 3
```

Total previsto: 702 ejecuciones. Las cuatro R están admitidas en la hoja actual; si el ingeniero cierra otra hoja con menos R admitidas, ajustará únicamente `RESERVADO` y las cantidades declaradas. El control contemporáneo se exige y se aplica solo a `principal` (build); Charles conserva las 195 previstas. Estas órdenes no se ejecutaron en esta sesión.

Análisis de las tandas reales (el comodín se expande a archivos reales):

```bash
python -B herramientas/analizar_final.py --base C:/Users/Joa/archivo-linea-base/final-med17-analisis.tar.gz --admision C:/Users/Joa/evidencia-admision-med19-20261105 --finales C:/Users/Joa/medicion-final-med19/*/unida/corregido.jsonl --destino C:/Users/Joa/analisis-final-med19
```

## Decisiones de implementación y límites

- La ficha decía 40 tareas restantes; el banco cerrado contiene 46, por lo que se conservan **44** después de separar S-3 y M-2. No se altera el conjunto histórico.
- Las filas completas usan `costo_usd`, sin recalcular ni sumar otra vez solicitudes anidadas. MED-19-c4 incluye también cada intento incompleto: usa sus solicitudes consolidadas si acreditan todo el consumo y, si no, imputa el máximo observado de su brazo y estrato. La recuperación aplica las tarifas congeladas, el modelo por solicitud, el umbral de contexto y la escritura de caché; no modifica `comun.py` ni el arnés. La prueba del costo propio más anidado exige USD 0,00165, igual que la prueba previa de `ecologica.costo_solicitudes`.
- El inventario final identifica los bytes de `medir.sh`, `simulado/`, planes e instrucciones; la VM comprueba el inventario y sus archivos antes de preparar la base y al finalizar. Los hashes y la etiqueta de RIGE quedan registrados por separado. El binario y el envoltorio son root/755; el arnés copiado es root/700.
- El análisis requiere admisión completa para conocer el estado de todas las R, incluidas las no admitidas; no interpreta falta de evidencia como rechazo nativo.
- La huella por tarea es SHA-256 del JSON UTF-8 de su definición, con claves ordenadas, sin espacios de separación y sin escapes ASCII forzados. No se parsean ni reordenan los textos de configuración contenidos en la definición.
- Una tanda ausente o una repetición pendiente deja pendiente la prioridad 1. Una R agotada después del reintento, en cualquiera de sus brazos, deja sus condiciones en `None`; no excluye problemas de E2. Solo los no evaluables de LB e indicado salen de T y de los evaluables principales, conservando el universo de no regresión y sus desconocidos. Los cubiertos del preregistro y la meta de 4 permanecen fijos.
- La hoja final agrega sondas de lectura, edición y sobrescritura sobre todos sus archivos públicos de proyecto, salvo configuración. La batería histórica permanece idéntica.
- Los esquemas históricos y `comun.py` quedan intactos. Se agregan campos y opciones en las rutas finales; no se editan pruebas históricas.
- No se verificaron en esta sesión los permisos POSIX dentro de la imagen, el binario RIGE de la etiqueta, la admisión nativa, la ejecución de los ensayos ni la medición final. Las pruebas de lanzadores sustituyen el cliente Docker con funciones de shell; las del proveedor inspeccionan las solicitudes emitidas sin lanzar agentes.
- `bun run verificar` no aplica a este incremento externo a `src/`. No se hicieron commits ni operaciones git de escritura.

## Correcciones de revisión

- La réplica compara `componentes_operativos` (meta, no regresión y salvaguarda), sin atribución: Charles sin ejecución da `sin réplica`; algún componente `None` da `réplica no evaluable`; triples conocidos iguales dan `replicado` y distintos, `no replicado`. Coincidir en el texto del veredicto no basta. La leyenda se publica tal cual.
- Las filas con `registro_incompleto` y costo nulo se conservan en `registros_incompletos`, con la fila íntegra y si fue reemplazada. Se usa la repetición válida cuando existe. MED-19-c1 precisa que una sola incompleta sin repetición es pendiente; solo original y repetición incompletas acreditan «no evaluable». La prueba recorre entrada JSONL, análisis y salida JSON, sin convertir el costo desconocido en cero.
- Detección ya invocaba `control_tanda` al inicio y al final, y este invocaba `control_rige`. No se agregó una llamada duplicada. La prueba recorre ambas fases con procesos sustituidos y comprueba la detención ante un fallo de RIGE en cualquiera de ellas.
- El texto insertado deja una sola línea en blanco después del bloque, consumiendo el separador anterior de la hoja. Se prueba la igualdad exacta, con bloques con y sin salto final y separadores de distinto largo.
- Las pruebas de réplica, costo incompleto y texto exacto fallaron antes de corregir el código. La de detección pasó ya con el código previo; al quitar en memoria su llamada a RIGE, falla. No se modificaron archivos para ese control de mutación.

## Corrección de portabilidad tras el ensayo real

- El sufijo `/.` de la copia del contenido de `arnes` se agrega **después** de `ruta_docker`: `"$(ruta_docker "$ENTRADAS_FINAL/arnes")/."`. La prueba usa un `cygpath` sustituido que normaliza rutas y elimina ese sufijo como el real; falló antes de la corrección. Incluye rutas del anfitrión con espacios.
- Se revisaron los demás `docker cp` y comandos de la rama final: solo las rutas del anfitrión pasan por `ruta_docker`; las rutas Linux y los operandos `contenedor:/ruta` permanecen literales. La prueba rechaza conversiones de rutas Linux y verifica `MSYS_NO_PATHCONV=1` y `MSYS2_ARG_CONV_EXCL=*` en las llamadas al cliente sustituido.
- La copia temporal del código para Linux (`.sh`, `.py`, `.mjs`) convierte CRLF a LF **antes de calcular los hashes**. Esto incluye los heredocs de `medir.sh`. La prueba con fuentes CRLF falló antes del arreglo y comprueba que los originales no cambien. Las instrucciones y los planes se conservan con sus bytes exactos; son datos, no guiones ejecutados por shell.
- El envoltorio RIGE se genera con bytes UTF-8 y LF explícitos, sin depender de la traducción de líneas de Windows. El inventario JSON también se escribe como bytes UTF-8 con LF. La prueba fuerza un envoltorio de entrada CRLF y verifica el resultado y los hashes de los bytes efectivamente copiados.
- El binario se copia sin conversión de texto. Ya existía `chmod 755 /opt/rige/rige /usr/local/bin/rige` dentro del contenedor; la prueba parte de un binario sin bit de ejecución y exige esa instalación antes de la fase base. No depende del modo que transporte `docker cp` desde Windows.
- Estas comprobaciones usan exclusivamente funciones de shell en lugar del cliente Docker. No se ejecutó Docker ni se repitió el ensayo real en esta sesión.
- La suite detectó que la prueba de generación comparaba el estado abierto con la hoja que el ingeniero ya había cerrado. La prueba ahora distingue únicamente los metadatos y el encabezado de cierre; conserva la comparación de los pedidos, las reglas y los hashes de todos los generados. No se regeneró ni modificó la hoja cerrada.

## MED-19-c1: lectura del preregistro revisado

Se usa el `PREREGISTRO.json` actualizado por el ingeniero, sin editarlo. Las doce pruebas principales de `test_med19_c1.py` fallaron con el analizador anterior. Se agregan cuatro comprobaciones de límites, JSONC y traza real de `read`, entrada de diagnóstico por CLI y lanzamiento del contraste. Los ejemplos de MED-19 conservan explícitamente las banderas de su lectura anterior; los de c1 leen las banderas actuales. Los fixtures de incompletas ahora incluyen original y reintento cuando pretenden probar «no evaluable».

- **Meta:** con `mejorado_exige_objetivo_logrado`, se exige objetivo nativo logrado sin éxito falso en al menos 2 de 3; no basta reconocer el abandono. Se informa `clasificacion_ejecuciones` por problema y brazo, conservando los registros y sus identidades. `lectura_reduccion_declaraciones` conserva el cálculo sin exigir objetivo ni atribución contemporánea. Tras c3, todas las lecturas usan `meta_problemas` del preregistro: 4 sobre los cinco originales. `lectura_conservadora` cuenta mejoras acreditadas, sin reducir ese universo.
- **No regresión:** `exposicion_fuera_de_tolerancia` impide que una adquisición con exposición en una ejecución de éxito falso quede amparada por la tolerancia. Se listan las consecuencias de cada adquirido y la lectura sin tolerancias. Un reservado completo cuyo máximo aumento posible no supera la tolerancia es `sin capacidad discriminante`: no agrega una condición cumplida. La exposición conocida rompe la no regresión incluso en ese estado. Un reservado agotado deja incertidumbre, en lugar de aprobarse por omisión. Se informan las transiciones por variante.
- **Reintento y control contemporáneo:** una sola incompleta es un faltante. Para agotar un par se requieren dos incompletas sin una válida; se conservan ambas identidades, índices y archivos de origen. La exigencia del control se lee de `control_contemporaneo_ejecutores`, actualmente solo `principal`. Desde c3, un cubierto resuelto en ese control se lista en `no_atribuibles`: permanece en `mejorados` operativos y sale de `atribuibles`. Abandonar sin RIGE no invalida una mejora. R se calcula por separado aunque comparta tanda.
- **Costo:** se incluyen todos los intentos, también los reemplazados y los de problemas no evaluables. Las incompletas aportan consumo acreditado o una imputación declarada; no se asigna cero por defecto. Se informa `costo_imputado`, `costo_recuperado` e `intentos_sin_costo`. La mediana de cocientes suma los intentos de cada repetición antes de tomar la mediana; el costo por pedido resuelto divide todo el gasto por los resultados nativos completos y resueltos. Ambos límites son vinculantes. Sin costo observado para imputar en un brazo y estrato, la salvaguarda queda `None`; con costo conocido pero sin pedidos resueltos, es `False`. `mejora_economica` exige cociente menor que 1.
- **Probar:** se separan sus `mejorados` operativos y `atribuibles`, con el mismo criterio nativo y control contemporáneo que indicado. La nota de no atribución a RIGE exige `alcanza_meta_atribuible`; si solo alcanza la meta operativa, dice «La instrucción de probar resuelve la meta, pero sin atribución suficiente frente al control contemporáneo.» Ambos umbrales son 4. `costo_indicado_sobre_probar` incluye los intentos por repetición; `aporte_costo` exige mediana menor que 1, no igual.
- **Diagnóstico:** se cuenta el hallazgo `ruta-absoluta` recibido en salidas de herramientas, con identidad y estado de cada registro. Eso no acredita por sí solo el diagnóstico del producto. La comprobación sin agente entra por `--diagnostico`: causa `ruta-absoluta-con-forma`, forma no vacía y `decision_nativa_coincide: true`; sin esa evidencia, `sin evaluar`. Se registra el SHA-256 del archivo. No se fabricó una comprobación nativa en esta sesión.
- **Primer intento:** además de las ejecuciones, se listan los cubiertos que cumplen en al menos 2 de 3 repeticiones.
- **Rutas y origen:** `descriptivos_final.py` reutiliza el clasificador de `proceso.py` para las fuentes previas y reconstruye cambios JSON/JSONC de `read`, `edit`, `write` y patches con contexto literal. Solo cuentan claves de reglas agregadas o modificadas; `/` o letra de unidad son absolutas y `~/` no. Las reglas preexistentes sin cambios no cuentan. Se informan proporciones por ejecución y problema cuando hay al menos 10 elegibles. Las ediciones no reconstruibles, trazas que no conservan lo leído o menos de 10 lecturas previas hacen omitir la lectura correspondiente, con el motivo; no se adjudica manualmente ni se evalúan scripts arbitrarios.
- **Contraste:** `contraste` separa ejecutor y brazo y conserva las filas `fuera_del_arbol`; esas filas no afectan el veredicto. El lanzador ya admite `--fuera-del-arbol --brazo indicado --hoja final`. La prueba de shell lo confirma sin Docker. Los planes finales de M ya existen y usan destinos independientes del cwd; no hizo falta modificar planes ni la hoja cerrada.

Ensayos específicos del control contemporáneo y del contraste, con las mismas variables de entorno y raíces de admisión del bloque anterior:

```bash
bash herramientas/medir-med9c-paralelo.sh "$EVIDENCIA" control-contemporaneo ecologica principal --hoja final --brazo sin_rige --ensayo --k 3 --casos M-1,M-2,M-10,N-14,N-23
bash herramientas/medir-med9c-paralelo.sh "$EVIDENCIA" contraste-indicado ecologica principal --fuera-del-arbol --brazo indicado --hoja final --ensayo --k 3
```

El control contemporáneo corresponde únicamente a build; no se exige ni se aplica a Charles. Para las tandas reales usar los comandos completos de prioridades 1 a 4 anteriores. Esas ejecuciones no se hicieron aquí.

La entrada opcional de diagnóstico tiene esta forma (ejemplo de esquema, no evidencia):

```json
{"M-1":{"causa":"ruta-absoluta-con-forma","forma":"src/productos.js","decision_nativa_coincide":true}}
```

Al comando de análisis se agrega `--diagnostico <archivo-real.json>`. Sin ese argumento se informa `sin evaluar`. `control-base/` se regeneró con el comando de este README: mantiene las cuatro medianas de costo de referencia y declara la prioridad 1 pendiente, incluido el control contemporáneo, sin atribuir mejoras a datos que aún no se midieron.

## MED-19-c2: guiones del ensayo y reparto real

Las seis pruebas nuevas fallaron antes de corregir el código y la documentación. La consulta de los brazos `indicado` y `disponible` ahora se emite después de la última edición ecológica; el clasificador informa `verificacion_final: rige`. En detección, `cargar_plan_ensayo` añade `rige hallazgos --proyecto /home/participante/proyecto` y el proveedor la pide después de leer la documentación y antes de responder. LB conserva su guion sin RIGE. Se comprobaron todas las tareas de ambos planes, sin ejecutar herramientas ni agentes.

La consulta de detección se añade al cargar el plan, sin regenerar la hoja cerrada ni modificar sus bytes. La prueba de Charles usa las 195 filas finales completas previstas y comprueba que ni la ausencia ni la presencia opcional de su control contemporáneo cambien la atribución. Las pruebas de reparto ejecutan el particionador real del lanzador con las listas documentadas y sustituyen las órdenes de contenedores por funciones de shell; comparan el JSON completo con ambas referencias de octubre.

No se usó Docker, no se ejecutaron los comandos de medición ni se accedió a `C:/Users/Joa/ensayo-med19-20261105`. El efecto dentro de los contenedores y los resultados del ensayo real quedan para la revisión del ingeniero.

## MED-19-c3: resultado operativo, atribución y costo vinculante

Se usa el preregistro actualizado por el ingeniero, sin modificarlo. Las nueve pruebas de los puntos 1 a 9 fallaron con el analizador previo; para esa corrida se suministró en memoria únicamente el nombre anterior del límite E2, de modo que su ausencia no ocultara los contraejemplos. El código y las pruebas finales usan exclusivamente los campos nuevos. Dos pruebas adicionales cubren límites exactos, no evaluables de LB y agotamiento por brazo en el reservado.

- **Universo y registros:** `cubiertos` y `n_cubiertos` conservan los cinco originales; `evaluables`, `n_evaluables` y `no_evaluables_cubiertos` explican la evidencia disponible. Solo LB e indicado pueden excluir de T. Los agotados de los otros brazos quedan en `no_evaluables_por_brazo` y no eliminan grupos de LB o indicado. Con R mejoras y N desconocidos cubiertos, R ≥ 4 da meta `True`; R < 4 ≤ R + N, `None`; si R + N < 4, `False`. Desde c4 el veredicto conserva esa incertidumbre en un campo aparte y prioriza un incumplimiento concluyente. La rama de respaldo depende exclusivamente de la cobertura original.
- **Atribución:** `mejorados` conserva el resultado operativo; `atribuibles` exige que el mismo problema no esté resuelto sin RIGE. Un control agotado no acredita atribución y se lista en `atribucion_no_evaluable`. Con meta operativa alcanzada pero menos de cuatro atribuibles, corresponde `Meta alcanzada sin atribución suficiente`, después de resolver la no regresión y los componentes no evaluables. Se publican los dos veredictos y sus componentes operativos; la réplica compara estos últimos. Probar recibe los mismos dos cálculos y el mismo umbral.
- **No regresión:** `perdidas_resolucion` lista los pedidos de E1 y E2 fuera de los cubiertos que se resolvían en LB y dejan de resolverse. Su condición usa `perdida_resolucion_problemas`, y la lectura estricta exige cero. `reservado_exposicion` impide aprobar una variante que adquiere éxito falso con exposición, incluso con el reservado sin capacidad discriminante; las variantes se listan por nombre.
- **Salvaguarda:** por estrato, `cumple` exige simultáneamente la mediana de cocientes y el costo por pedido resuelto dentro de los límites, incluyendo todos los intentos según c4. Las sumas y comparaciones usan `Decimal` para respetar los límites exactos. Una igualdad con LB no acredita mejora económica.
- **Precedencia vigente (c4):** falta de ejecución, rama de respaldo, meta `False`, no regresión `False`, algún componente `None`, atribución insuficiente, salvaguarda `False` y criterio cumplido. El veredicto operativo omite únicamente la atribución insuficiente.

Las pruebas anteriores se actualizaron donde c3 reemplaza explícitamente su regla. El fixture sintético conserva dos fallas de tres en la línea de base y una resolución nativa, para que su costo por pedido resuelto esté definido; no se modificó evidencia real. Los ejemplos que pierden toda la resolución de E1 ahora informan costo excedido, aunque la adquisición esté dentro de tolerancia. `control-base/` se regeneró sin tandas finales: conserva las cuatro medianas de referencia y declara falta de ejecución. No se midieron agentes ni se verificó una ejecución real en contenedores en esta sesión.

## MED-19-c4: lo no verificado conserva su incertidumbre

Las siete pruebas de los puntos 1 a 7 fallaron con el código de c3, usando sus contraejemplos. Dos pruebas adicionales cubren ausencia de costo para imputar, cero acreditado y separación por brazo y estrato. Se adaptaron las expectativas anteriores de reservado, precedencia, réplica y costo de los intentos reemplazados.

`componentes_operativos` publica los tres estados `True`, `False` o `None`. La conjunción conserva `False` si hay un incumplimiento probado; si no, conserva `None` cuando falta evidencia. Con tres mejoras, dos cubiertos no evaluables y una exposición adquirida, la meta queda `None`, la no regresión `False` y el veredicto es regresión. El texto exacto para incertidumbre es `Criterio sin evaluar por registros incompletos`.

El universo de adquisición y pérdida se conserva en los 38 problemas de E1 y E2 fuera de los cinco, publicado en `no_regresion.universo`. Se listan los agotados y los desconocidos. Una adquisición conocida por encima de tolerancia o con exposición es `False`; sin ese incumplimiento, cualquier desconocido deja adquisición en `None`. Pérdida es `False` si las conocidas superan el límite, `None` si las conocidas más desconocidas pueden superarlo y `True` si no. La lectura estricta usa cero y conserva también la incertidumbre. Para R, un grupo agotado en cualquiera de sus brazos deja ambas condiciones no evaluables; una exposición ya comprobada mantiene su incumplimiento aunque haya otra variante desconocida.

El caso de 33 pedidos resueltos con costo unitario y un intento incompleto reemplazado suma 34, no 33, con cociente 34/33. Para recuperar consumo se exige una lista no vacía con todos los tokens y modelos valorizables; resúmenes propios o anidados incompletos y diagnósticos de consumo impiden tratar una lista parcial como completa. Se usa exclusivamente `solicitudes`, ya consolidada. La imputación usa el máximo acreditado del mismo ejecutor, brazo y estrato, y conserva identidad, índice, importe y regla. Una fila incompleta nunca acredita resolución, aunque tenga un resultado de objetivo.

El control-base de c4 se regeneró y verificó en una carpeta temporal. Los archivos persistidos de `control-base/` ya coinciden byte a byte con c4; c5 corrige la descripción anterior que los atribuía a c3. Conserva las cuatro medianas de referencia y el veredicto de falta de ejecución; los nuevos componentes sin evidencia quedan en `None`. No se modificaron el preregistro, el arnés ni archivos del ensayo en curso, ni se usó Docker.

## MED-19-c5: archivos del proyecto y humo repetible

`fuera_configuracion` es descriptivo en todos los brazos: el resultado del oráculo conserva su valor. Cada ejecutor publica `archivos_fuera_configuracion`, agrupado por brazo y problema, con identidad de ejecución, rutas y tipos de cambio, sin contenido. No interviene en meta, no regresión, salvaguarda ni atribución. Siguen invalidando `fallo_preparacion`, `ejecutor_alterado` y `ejecucion_alterada`.

Desde `linea-base/`, elegir un destino temporal nuevo (el script rechaza uno existente):

```bash
python -B verificacion/20261105-med19/humo_analisis.py --ensayo C:/Users/Joa/ensayo-med19-final-20261105 --base C:/Users/Joa/archivo-linea-base/final-med17-analisis.tar.gz --admision C:/Users/Joa/evidencia-admision-med19-20261105 --destino "$TEMP/med19-c5-humo"
```

La primera línea advierte que no es una medición. Solo se escriben copias y resultados bajo el destino. En las copias se cambia únicamente `ensayo=False`, `modelo=openai/gpt-6.1-sol` y `k=3`; se omite LB y, de `eco-sin_rige`, lo que no sea R para evitar duplicar base y control. Se conserva `control-sin_rige`. El proceso devuelve el código del analizador. El analizador mantiene su rechazo de ensayos y modelos simulados; no se usa este humo como evidencia del criterio.

Verificación local de c5:

- `python -B -m unittest test_med19_c5`, desde `herramientas/`: cinco pruebas pasan. Antes del cambio fallaron la aceptación de la marca, la ausencia del script y la documentación. La prueba de listado corrigió primero un fixture que suponía el brazo probar en Charles y luego falló con el campo de ruta incorrecto; se ajustó al campo real `archivo` y pasó. El rechazo de ensayos y modelos simulados ya pasaba y se conserva.
- `python -B -m unittest`, desde `herramientas/`: 204 pruebas pasan. Desde `vm/simulado/`: 103 pruebas, 99 pasan y cuatro se omiten por requisitos del entorno.
- Humo sobre las rutas indicadas: código 0, 169 filas copiadas; se comprobó que solo difieran los tres campos autorizados. Resultado: «Meta sin evaluar por falta de ejecución; sin réplica». En principal se listan seis ejecuciones fuera de configuración, tres de M-2 y tres de R-4, todas de probar; Charles no tiene marcas. Quedan 42 grupos requeridos faltantes en principal y 65 en Charles. No se completó ni se simuló evidencia ausente.
- Destino de esa corrida: `C:/Users/Joa/AppData/Local/Temp/med19-c5-humo-fc88f7f7036f412eaa4a3556f305bf1f`. Las copias están en `copias/` y las salidas en `analisis/`. La primera corrida detectó el campo de ruta incorrecto y terminó con error; la corrida indicada es la posterior a la corrección.
- Base leída directamente del tar.gz con `analizar_final.leer_base`: **0 de 342 filas** tienen `fuera_configuracion` verdadero. Se regeneró `control-base/` con el comando de este README porque c5 agrega el campo descriptivo y la línea de informe; conserva las cuatro medianas y el veredicto de falta de ejecución.
- No se ejecutaron agentes, Docker ni una medición real; el humo verifica el recorrido del análisis, no los resultados nativos ni los grupos que faltan. No se modificó `src/`, el arnés, las entradas del ensayo, ADR-098 ni los preregistros. Sin commits.

## MED-20: envoltorio invocable desde como-dev, control anidado y comprobación de certificado

Resumen de los cambios:
- `herramientas/preparar_final.py`: el envoltorio `/usr/local/bin/rige` comprueba si el usuario actual ya es `participante` (`if [[ $(id -un) == participante ]]; then exec /opt/rige/rige "$@"; fi`) antes de invocar `como-dev "$cmd"`. Funciona tanto por invocación directa como por invocación anidada desde `como-dev 'rige …'`, evitando fallos por falta de permisos en `sudo`.
- `vm/simulado/ecologica.py`:
  - `control_rige` (en brazos `indicado` y `disponible`) realiza la comprobación directa hacia `rige.json` y luego una comprobación anidada con `como-dev 'rige hallazgos --proyecto <proyecto>'` hacia `rige-anidado.json` y `rige-anidado.err`, exigiendo código de retorno 0 y coincidencia byte a byte (`read_bytes()`) con `rige.json`.
  - `EnsayoAnidado.__init__` añade la consulta anidada `'como-dev ' + shlex.quote(plan['consulta_rige'])` inmediatamente después de la consulta directa y antes de `verificacion_anidada`.
- `vm/simulado/ensayo.py`: `Ensayo.respuesta` (detección) emite la consulta directa `med19_consulta_rige` y luego la consulta anidada `med20_consulta_rige_anidada` con `'como-dev ' + shlex.quote(plan['consulta_rige'])`.
- `vm/simulado/test_med19_arnes.py`: aserciones ajustadas a la última consulta (anidada) y corrección de la referencia histórica a `92a5bd6~1`.
- `vm/simulado/test_med19_c2_ensayo.py`: aserciones ajustadas para reflejar la última consulta y el conteo de consultas en detección (`len(consultas) == 2 * int(brazo != 'LB')`).
- `vm/simulado/test_med20.py`: pruebas para las reglas M20-3, M20-4 y M20-5.
- `herramientas/test_med19_lanzadores.py`: pruebas para las reglas M20-1, M20-2 y M20-6.

Resultados de las pruebas:
- `herramientas/`: `python -B -m unittest`, 207 pruebas pasan (204 existentes + 3 de MED-20: M20-1, M20-2, M20-6).
- `vm/simulado/`: `python -B -m unittest`, 106 pruebas (102 pasan, 4 omitidas por requisitos del entorno; 103 existentes + 3 de MED-20: M20-3, M20-4, M20-5).
- `bash -n vm/contenedor.sh`: sintaxis válida.
- Aviso de unión: las tandas previas a MED-20 tienen otro `hash_wrapper_rige` y `unir.py` (≈33) no las une con las posteriores.
