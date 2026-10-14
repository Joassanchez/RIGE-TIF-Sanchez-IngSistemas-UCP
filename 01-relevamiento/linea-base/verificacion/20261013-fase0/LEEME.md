# Fase 0 · comprobación con el proveedor real (13/10/2026)

Ejecutada por el ingeniero (Claude Code, Opus 5.5) entre las 20:47 y las 20:51 (hora de Argentina), sobre la imagen `rige-linea-base:1.18.25` (148 archivos idénticos al repositorio). Solo usa el caso auxiliar `practica`, que no integra los veinticuatro casos de la línea de base. La credencial de ChatGPT Plus entró al contenedor únicamente como `OPENCODE_AUTH_JSON`. Se escanearon los 73 archivos de la evidencia y ninguno contiene los tokens de acceso o de renovación ni el identificador de cuenta. La única coincidencia del patrón `Bearer` es un ejemplo `{env:…}` de la documentación de la skill.

`medir.sh` no admite `practica`, así que los guiones de `scripts/` extraen las funciones de `/opt/linea-base/medir.sh` (instrucción, `extraer_eventos`, `hash_escenario`, `congelar_ejecutor`, `como_evaluador`) y las importan sin modificarlas. Pregunta de práctica: «¿Qué modelo pequeño (`small_model`) usa OpenCode en esta máquina, y qué archivo lo determina?».

| Carpeta | Contenido |
|---|---|
| `1-catalogo-de-fabrica/` | Imagen tal como está (`OPENCODE_DISABLE_MODELS_FETCH=1`, catálogo incluido en 1.18.25) |
| `2-catalogo-actual/` | El mismo procedimiento con el `models.json` del anfitrión del 13/10/2026 copiado al caché del evaluador (la descarga sigue desactivada) y Charles invocado como `[AUX] Charles` |
| `3-diagnostico/` | Alteración del escenario sin modelo, y causa del error de `gpt-6-astra` y `gpt-6-luna` con `--print-logs` |
| `4-tras-MED-5/` | 21:30 a 21:31, con la imagen reconstruida tras la ficha MED-5 (ADR-082): catálogo congelado (`515672f6…`), preparación del participante, `build` y `[AUX] Charles` con `gpt-6.1-sol` |

**Resultado de `4-tras-MED-5`.** Las dos ejecuciones terminan con código 0, respuesta correcta (`openai/gpt-4o-mini`, del `opencode.json` global), escenario y ejecutor sin alterar, registro completo y sin cuota ni transitorio. Según el export, `build` corre con `gpt-6.1-sol` y Charles corre como `[AUX] Charles` con `gpt-6.1-sol`. Charles lee el escenario con `como-dev` y `read` sobre `/home/participante/**`, no usa skills ni edita. Tokens (entrada / caché / salida): `build` 15 587 / 38 656 / 433; Charles 15 087 / 41 984 / 375.

## Resultados

1. **Autenticación:** funciona dentro del contenedor (`opencode auth list`: OpenAI, oauth).
2. **Catálogo:** el catálogo incluido en 1.18.25 no contiene ningún modelo `gpt-6`. `opencode run` con `openai/gpt-6.1-sol` termina en 1,3 s con `UnknownError` (`1-catalogo-de-fabrica/practica-build-sol.stdout.txt`). Con el catálogo actual, OpenCode ofrece para la suscripción 17 modelos `openai/*`, y entre ellos `gpt-6.1-sol` (y sus variantes `-fast` y `-ultrafast`) como único `gpt-6`.
3. **Ejecución `build` + `gpt-6.1-sol` (catálogo actual):** código 0, 25,3 s, 5 solicitudes, 8 herramientas (skill `customize-opencode`, `grep`, `read` de la hoja y de `docs/config.html`, `como-dev` con `env`, `ls` y `opencode debug config`, `read` del `opencode.json` global). JSON final extraído: `{"respuesta": "openai/gpt-4o-mini", "fuente": "/home/participante/.config/opencode/opencode.json"}` (correcto). `registro_incompleto = false`.
4. **Tokens (contra la traza y el export):**
   - `total = input + output + cache.read` en las cinco solicitudes (p. ej., 4 422 + 110 + 5 376 = 9 908). `input + cache.read` crece de manera monótona con el contexto (5 550; 9 798; 11 437; 13 673; 13 790). **`input` excluye la caché leída: verificado.**
   - `reasoning = 0` y `cache.write = 0` en todas las solicitudes. **No se puede verificar si `output` incluye el razonamiento**: la suscripción no informa tokens de razonamiento en esta traza. El registro conserva `razonamiento_reportado` por solicitud.
   - `cost = 0` (suscripción). El arnés no lo usa.
   - El stdout y el export coinciden solicitud por solicitud.
   - Consumo de la ejecución: 54 668 tokens (entrada 25 704; caché 28 544; salida 420). Equivalente de lista con las tarifas congeladas: USD 0,0585 (25 704 × 2 + 28 544 × 0,1 + 420 × 10, por millón; contexto corto).
5. **Escenario alterado (`escenario_alterado = true`).** Causa aislada sin modelo (`3-diagnostico`): el primer `opencode debug config` del participante crea `/home/participante/.config/opencode/.gitignore`. Los siguientes no cambian nada (AR-10). Tal como está, `medir.sh` marca incompleta toda ejecución en la que el agente haga introspección como participante.
6. **`gpt-6-astra` y `gpt-6-luna`:** `ProviderModelNotFoundError: Model not found: openai/gpt-6-luna. Did you mean: gpt-5.6-luna, gpt-5.6-luna-fast?` (ídem `gpt-6-astra`). **No están disponibles con la suscripción en 1.18.25.** No se reemplazaron.
7. **Charles:**
   - La clave efectiva del agente es `[AUX] Charles` (el `name` del frontmatter). Con `--agent charles`, OpenCode avisa «agent "charles" not found. Falling back to default agent», y `debug agent charles` falla.
   - Con el nombre correcto (`2-catalogo-actual/charles-debug-agent.stdout.txt`): modelo `openai/gpt-6-luna`, temperatura 0,2, primario, 101 reglas.
   - Por última coincidencia:
     - `edit` queda en `deny`;
     - los cuatro `ask` nativos quedan cubiertos por reglas posteriores: `doom_loop` y `external_directory *` en `deny`, y `read *.env` y `*.env.*` en `allow`, por el `read *` del agente;
     - `question` en `deny`;
     - `skill *` en `deny`;
     - `bash *` en `deny`, con `como-dev *` y `rige *` en `allow`;
     - `external_directory /home/participante/**` en `allow`.
   - La ejecución real no fue posible porque su modelo no existe para la suscripción.
