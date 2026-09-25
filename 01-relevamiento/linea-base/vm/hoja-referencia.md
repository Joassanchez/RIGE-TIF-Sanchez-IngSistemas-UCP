# Hoja de referencia · OpenCode 1.18.25

## Cómo responder

Cada pregunta pide **dos cosas**:

- **el valor** que rige (un modelo, un número) **o la decisión** de permiso (`allow`, `ask` o `deny`), y
- **la fuente**: de qué archivo, variable o regla proviene.

Cuando tengas la respuesta, decí **"listo"**, soltá el teclado y el mouse, y respondé.

## Dónde puede haber configuración

Según la documentación de esta versión, las fuentes se cargan en este orden, y las posteriores reemplazan a las anteriores **sólo en las claves en conflicto** (los archivos se combinan, no se reemplazan enteros):

1. Configuración remota de la organización (`.well-known/opencode`)
2. Configuración global: `~/.config/opencode/opencode.json`
3. Archivo indicado por la variable de entorno `OPENCODE_CONFIG`
4. Configuración del proyecto: `opencode.json`
5. Directorios `.opencode/`
6. Configuración indicada en la variable de entorno `OPENCODE_CONFIG_CONTENT`
7. Archivos de configuración administrada
8. Preferencias administradas de macOS

OpenCode busca el `opencode.json` del proyecto en el directorio actual y sube hasta la raíz del repositorio git.

Un valor puede tomarse de una variable de entorno con `{env:NOMBRE}` o del contenido de un archivo con `{file:ruta}`.

## Dónde se declara cada cosa

| Qué | Dónde |
|---|---|
| Agentes | Clave `agent` de un `opencode.json`, o archivos markdown en `agents/` dentro de `~/.config/opencode/` o de `.opencode/` |
| Permisos | Clave `permission`, en el nivel superior o dentro de un agente |
| Comandos, skills, plugins | Subcarpetas `commands/`, `skills/`, `plugins/` dentro de `~/.config/opencode/` o de `.opencode/` |

Valores posibles de un permiso: `allow` (se ejecuta sin aprobación) · `ask` (se pide aprobación) · `deny` (se bloquea).

## Comandos disponibles

| Comando | Qué hace (según `--help`) |
|---|---|
| `opencode debug config` | Muestra la configuración resuelta |
| `opencode debug agent <nombre>` | Muestra los detalles de configuración de un agente |
| `opencode debug skill` | Lista las skills disponibles. Incluye `customize-opencode`, una skill de la propia herramienta sobre su configuración |
| `opencode debug paths` | Muestra las rutas globales (datos, configuración, caché, estado) |
| `opencode agent list` | Lista los agentes disponibles |
| `opencode --help` · `opencode debug --help` | Lista todos los comandos y subcomandos |

## Documentación

Documentación oficial de OpenCode 1.18.25, en inglés y sin conexión: abrí en el navegador `~/Documentacion-OpenCode/index.html`. Se puede buscar dentro de cada página con Ctrl+F.

## No disponible durante la sesión

Internet y cualquier asistente de inteligencia artificial, incluido el propio agente de OpenCode.
