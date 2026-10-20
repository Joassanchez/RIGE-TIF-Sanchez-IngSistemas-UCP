# MED-13-c6 · Creación directa (20/10/2026)

Implementa ADR-098, punto 3 y Contexto 12. En ecológica, `preparar()` conserva
el dueño participante y aplica modo `3770` únicamente a la raíz del proyecto
y al directorio de trabajo de la tarea, si es distinto. No aplica escritura
recursiva a fuentes ni abre directorios externos. Los demás permisos siguen
con su política anterior.

- Escritura y ejecución de grupo permiten crear archivos y carpetas.
- Setgid hace que hereden el grupo participante. Con el umask habitual 022,
  los archivos nuevos del evaluador son legibles por OpenCode como participante.
- Sticky impide al evaluador borrar, renombrar o reemplazar entradas que
  pertenecen al desarrollador; puede administrar sus propias entradas.
- `como-dev` se conserva. La protección corresponde a las operaciones directas
  como evaluador, no impide una operación que este pida como desarrollador.

Detección mantiene su raíz sin escritura de grupo: es una consulta del corpus,
con `edit: deny`. Los controles de aislamiento y alteración siguen vigentes.
Las políticas congeladas de los ejecutores y `vm/medir.sh` no se modifican.
La escritura del directorio no sustituye los permisos de herramientas: archivos
fuente y rutas externas siguen denegados y se registran como fuera de configuración.

`AGENTS.md` del proyecto se conserva en la copia final y cuenta como
configuración ecológica, acorde con V-9 y el permiso ya instalado para ese
archivo. Fuera del proyecto no recibe esa excepción. La omisión del oráculo
sigue comparando contenido, modo, UID y GID; archivos nuevos del evaluador
exigen ejecutar el oráculo posterior. La siguiente preparación, como root,
elimina también los archivos del evaluador y reconstruye el escenario.

## Ensayo

`MED-13-c6-directa.json` conserva el contenido correcto de N-21, pero omite
`crear_como_dev`. Tiene prioridad sobre el plan histórico: `--casos N-21`
prueba una llamada directa `write` para crear `opencode.json`. Se espera
`correcta`; `tanda.json` registra `hash_plan_directo`. Los planes anidados de
C-1 y M-1 conservan su selección y sus verificaciones.

## Pruebas y readmisión obligatoria

Las pruebas portables cubren ambas dimensiones, la selección del plan directo,
omisión/oráculo, limpieza y aislamiento. La prueba del kernel POSIX usa dos
UID temporales, sin crear cuentas ni iniciar agentes; verifica propietario,
grupo heredado, lectura y rechazo de unlink, rename y replace.

La integración nativa es opt-in con usuarios participante/evaluador existentes:

```bash
RIGE_MED13C6_OPENCODE=/usr/local/bin/opencode python3 -B -m unittest discover \
  -s vm/simulado -p test_med13_c6_preparacion.py -v
```

Usa `debug config` para los JSON y el hook de sistema de MED-13-c4 para AGENTS.md;
no hay inferencia ni herramientas de un agente. No se ejecutó en este anfitrión
Windows: WSL devolvió acceso denegado. Las pruebas POSIX quedan omitidas aquí.

**Hace falta readmisión completa de las 46 tareas**, con nuevas raíces de
evidencia y esta preparación, antes de cualquier tanda. No reutilizar como
admisión vigente los resultados anteriores a MED-13-c6 aunque coincida el hash
de `espec.py`. Conservar la evidencia histórica. Las hojas cerradas y sus hashes
permanecen intactos; no se regeneran para realizar esta corrección.
