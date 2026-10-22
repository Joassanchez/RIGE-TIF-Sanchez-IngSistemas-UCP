# Contenedor Ubuntu 26.04 de la línea base

La imagen común del oráculo y de la medición vigente (ADR-098) usa Linux x86_64 y OpenCode 1.18.25 nativo. Ejecuta las dimensiones `ecologica` y `deteccion`. Las respuestas permanecen en el anfitrión: nunca se envían al contexto de construcción, se copian a la imagen ni entran al contenedor. Guía de ejecución: [`../ecologica/LEEME.md`](../ecologica/LEEME.md).

| Archivo | Función |
|---|---|
| `Dockerfile`, `.dockerignore` y `.gitattributes` | Base fijada por resumen, contexto limitado a `vm/` y fines de línea LF para los scripts |
| `instalar.sh` | Paso de construcción: verifica el binario por SHA-256, crea usuarios, permisos y configuración inicial |
| `como-dev` | Ejecuta como `participante` con su entorno de inicio de sesión |
| `contenedor.sh` | Construye, mide, exporta evidencia y abre la consola del ingeniero |
| `caso.sh` | Activa `practica` durante la construcción para calentar las cachés de primer uso |
| `simulado/proveedor.py`, `simulado/evidencia.py` y `simulado/planes/*.json` | API local determinista, clasificador y planes del ensayo vigente; sólo Python estándar |
| `casos/` | Proyecto base `comun/` y auxiliar de construcción `practica/`; sólo root lee las plantillas |
| `docs/` | Documentación oficial sin conexión: 36 páginas, commit `cb7d8b2f5e44` |
| `hoja-referencia.md` | Copia del instrumento existente en `~evaluador/tarea/` |

## Construcción en el anfitrión

Requisitos: Docker con motor de contenedores Linux, Bash (Git Bash o WSL) y Python 3.11 o posterior en el anfitrión. Ejecutar desde `01-relevamiento/linea-base/`. En Git Bash, el script controla la conversión de rutas del cliente Windows; en WSL, usa rutas Linux. Los scripts deben tener fines de línea LF y UTF-8 sin BOM.

El ingeniero completa los dos argumentos pendientes declarados en `Dockerfile`:

- `UBUNTU_DIGEST`: resumen `sha256:…` de la base `ubuntu:26.04` para `linux/amd64`, obtenido y registrado al preparar la construcción.
- `OPENCODE_SHA256`: SHA-256 del **binario extraído** `package/bin/opencode` del paquete `opencode-linux-x64-baseline` 1.18.25. No es el hash del archivo `.tgz`. El paquete se obtiene de `https://registry.npmjs.org/opencode-linux-x64-baseline/-/opencode-linux-x64-baseline-1.18.25.tgz`; el ingeniero contrasta y registra el hash antes de construir.

Se elige siempre la variante `x64-baseline`, para que la selección no dependa de que el anfitrión exponga AVX2. Es un binario nativo; no se instala Node. Python 3 se instala con `apt-get` para el proveedor simulado; no usa `pip` ni dependencias adicionales. No hay valores de hash supuestos ni una base sin fijar: la construcción se rechaza si faltan argumentos válidos.

Sustituir los marcadores por los valores obtenidos:

```bash
export UBUNTU_DIGEST='sha256:88a381d5b5eeb2b35d3ad70925a362c37ce569daf43ede89ff818ec20e4d3794'   # valor por defecto; contrastado el 13/10/2026
export OPENCODE_SHA256='d91e0d33676d0839f7cde87924cd4127ea88c9d6784eea9f009a7d08bdc60eeb'   # valor por defecto; contrastado el 13/10/2026
bash vm/contenedor.sh construir
```

Esto ejecuta `docker build --platform linux/amd64`, con contexto **exclusivamente `vm/`**, ambos argumentos y etiqueta `rige-linea-base:1.18.25`. `.dockerignore` usa una lista de inclusión y excluye además respuestas, `auth.json`, `.env` y repositorios `.git`. No se usa `COPY .` ni se manda la raíz del repositorio al constructor.

Se conserva `instalar.sh` como único paso de preparación llamado por el `Dockerfile`: permite leer juntos la instalación y los permisos. Instala OpenCode sólo después de comprobar SHA-256, comprueba la versión y desactiva actualización automática y descarga de modelos tanto en `ENV` como en los shells de inicio de sesión. El primer uso con red durante la construcción prepara las cachés de ambos usuarios, sin autenticar ni consultar un proveedor. La verificación posterior sin red debe confirmar que esas cachés bastan; un error de descarga queda registrado como fallo, sin habilitar red para corregir la corrida.

## Usuarios y archivos de la imagen

| Usuario / ubicación | Acceso |
|---|---|
| `root`, `/opt/linea-base/` | Plantillas y scripts, `root:root`, modo 700; prepara escenarios y ejecuta el oráculo |
| `participante`, `/home/participante/` | Escenario, sin sudo; directorio personal 750 |
| `evaluador`, `/home/evaluador/tarea/` | Ejecutor, `hoja-referencia.md` y `docs/index.html`, fuera del escenario |
| `/usr/local/bin/como-dev` | `root:root` 755; `evaluador ALL=(participante) NOPASSWD: ALL` |

`evaluador` pertenece al grupo `participante`. `caso.sh` prepara el auxiliar
`practica` al construir la imagen, dando lectura al grupo sin acceso a
`/opt/linea-base`. Durante la medición, `simulado/ecologica.py` materializa
los escenarios públicos sobre `casos/comun/proyecto`. La ecológica habilita
la creación en la raíz del proyecto con modo `3770`; detección conserva la
raíz de solo lectura para el grupo. `como-dev` carga el entorno del participante.
En la tanda real el participante recibe la credencial para probar el efecto
con sesiones anidadas; el ensayo usa el proveedor local sin credenciales.

El usuario predeterminado de la imagen es `evaluador`, en `~/tarea`; ninguno
de los dos usuarios tiene contraseña habilitada ni sudo a root. Los ejecutores
se congelan antes de medir. Se conservan las configuraciones enumeradas en
`ejecutores/congeladas.json`, verificadas por el arnés vigente, incluidas las
variantes que usa el contraste fuera del árbol.

No se usa systemd, rutas del anfitrión, socket de Docker ni `--privileged`. El envoltorio no monta ningún directorio, ni siquiera para evidencia. La imagen no contiene credenciales.

## Ecológica y detección

`medir --dimension ecologica|deteccion` usa escenarios públicos generados y
copiados explícitamente; objetivos, guardas y corpus clasificado permanecen fuera
del contenedor. El ejecutor trabaja dentro del proyecto, aislado de su configuración;
el `opencode` que invoque como herramienta consulta al participante mediante un
envoltorio. MED-9c ejecuta el oráculo inicial una vez por tarea ecológica y
fragmento, valida su base en el anfitrión y repite el oráculo posterior cuando
hay cambios de archivos o entorno. Solo reutiliza la base con diff vacío,
entorno restaurado sin alteraciones, hashes del escenario iguales, archivos de
inicio completos iguales desde la preparación e inventario del home igual
durante `run`. Excluye únicamente `.git`, sin excluir cachés; registra los
motivos de no omisión y las capturas de inicio/home. El aislamiento ecológico
se comprueba al inicio y al final;
un cierre ausente o fallido invalida incluso las filas ya escritas. Las respuestas
siguen fuera del contenedor: entre las dos fases solo vuelve el hash aprobado.

La preparación, los controles nativos obligatorios, el ensayo sin credenciales,
las tandas LB de ambos ejecutores, `--fuera-del-arbol`, corrección externa y análisis
con complemento están en [`../ecologica/LEEME.md`](../ecologica/LEEME.md).
Los ensayos Docker y las mediciones quedan a cargo del ingeniero.
El LEEME ecológico incluye los comandos exactos de las seis tandas con un
máximo de cuatro contenedores concurrentes y unión estricta de pares completos.

MED-9d aplica ADR-094 a ambas dimensiones y ejecutores: permite
`external_directory: /home/evaluador/tarea/*` y `webfetch`, mantiene la edición
denegada de la documentación y `websearch: deny` sin EXA. No cambia `bash` ni el
prompt de Charles. Los hashes actualizados y la nota del ADR se conservan en
`ejecutores/congeladas.json`. El contraste fuera del árbol adapta solo la copia
instalada de la variante de la dimensión; las variantes de otras dimensiones
permanecen intactas.

Se comprueban documentación legible, edición denegada y `webfetch` al inicio y
al final de **ambas** dimensiones. Un fallo inicial detiene antes del agente;
un cierre fallido o ausente impide aceptar la tanda. M-1 y D-A del proveedor
simulado comprueban las lecturas de documentación antes de continuar, y una lectura
rechazada o faltante detiene el ensayo. `tanda.json` declara
`regla_acceso_web: "ADR-094"`: el análisis conserva `acceso_web` y cuenta las
ejecuciones con web por tarea sin invalidarlas. Reconstruir la imagen y repetir los ensayos nativos
antes de las nuevas líneas de base; las tandas previas al cambio no computan.

## Exportación portable de evidencia (MED-13-c4)

En la preparación ecológica, MED-13-c6 aplica modo `3770` a la raíz del
proyecto y al cwd de la tarea; detección conserva la raíz de solo lectura
para el grupo. Este cambio exige readmisión completa de las 46 tareas.
Ver `simulado/planes/MED-13-c6.md` para los controles y el plan directo de N-21.

El subcomando `medir` empaqueta los resultados dentro del contenedor con
`tar`, sin seguir enlaces. `docker cp` copia solo ese archivo regular. El
anfitrión verifica el SHA-256 calculado dentro del contenedor y conserva
`evidencia-<fase>.tar` y su `.tar.sha256`: fases `base` y `final` para la
ecológica, y `final` para detección.

`herramientas/evidencia_portable.py` extrae los archivos normales y sustituye
cada enlace por `<nombre>.enlace.json`, con `tipo` y `destino` originales.
Nunca crea enlaces en Windows ni sigue sus destinos durante la extracción.
El tar conserva los enlaces íntegros, incluso los colgantes. La extracción
rechaza hashes distintos, rutas que salgan del destino y miembros superpuestos.
Los lectores externos resuelven los descriptores dentro de la evidencia;
el análisis reubica los enlaces originales global/proyecto dentro del snapshot.
No hace falta privilegio de creación de enlaces en el anfitrión.

Para repetir una extracción conservando el tar íntegro:

```bash
python -B herramientas/evidencia_portable.py /ruta/evidencia-final.tar \
  --destino /ruta/extraida --sha256 <SHA-256-registrado>
```

Si falla la copia, el checksum o la extracción, el lanzador devuelve un código
distinto de cero. La validación externa de la fase base conserva su ubicación
habitual y la extracción final no la elimina.

## Pruebas sin Docker

```bash
python -B -m unittest discover -s herramientas -p 'test_*.py'
(cd vm/simulado && python -B -m unittest discover -p 'test_*.py')
bash -n vm/medir.sh
bash -n vm/contenedor.sh
```
