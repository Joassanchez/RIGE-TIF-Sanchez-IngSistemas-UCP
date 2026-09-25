# Revisión del material de la línea base (diseño v0.3, `vm/`, `herramientas/`, laboratorio)

- Fecha: 25/09/2026
- Revisor: ingeniero
- Material: `01-relevamiento/linea-base/` (renombrados el 25/09: `antecedente-diseno-personas-v0.3.md`, `laboratorio-verificacion.md`, `vm/`, `herramientas/`); versión v0.3 del diseño pegada por el autor en la sesión
- Marco: ADR-040 (propuesto); se evalúa qué se reutiliza con agentes como ejecutores, qué se corrige y qué no aplica

## 1. Qué se reutiliza sin cambios

| Pieza | Uso con ADR-040 |
|---|---|
| Los ocho escenarios de `vm/casos/` y `comun/` | Instrumento del ejecutor. Continuidad con el diseño con personas, por si se hace el contraste cualitativo |
| `caso.sh` | Arma cada escenario antes de cada ejecución del agente |
| `instalar.sh` | Instalación fijada de 1.18.25 con hash; sirve tal cual para la VM |
| `hoja-referencia.md` y `vm/docs/` (36 páginas, commit `cb7d8b2f5e44`) | Mismos recursos para el agente que para una persona: se le dan en su contexto o en su directorio de trabajo |
| Criterios de construcción 8.2 (sobre todo 8.2-3: ningún comando nativo da valor **y** fuente) | Siguen siendo la salvaguarda del instrumento |
| Definiciones de corrección (sección 13): correcta, acierto parcial, incorrecta, tiempo agotado | Se automatizan sin cambios: son la base del corrector |
| Variables de la planilla: `comandos_usados`, `archivos_abiertos`, `uso_documentacion` | Salen de la traza del agente, sin revisar grabaciones |
| Laboratorio E-00: `ask` se rechaza solo en `opencode run`; `--auto` lo aprueba | Condiciona la configuración del ejecutor (sección 3) |
| Laboratorio C-9: el free tier no es determinista y devolvió contenido ajeno | Confirma que el ejecutor usa modelos pagos, fijados por identificador, con la transcripción completa guardada |

## 2. Defectos a corregir

| # | Hallazgo | Evidencia | Corrección |
|---|---|---|---|
| L-01 | **(Corregido el 25/09.)** **C-1b quedó desactualizado.** La v0.3 (D-44) fija `webfetch: "ask"` en el global porque, con `allow`, «es el valor por defecto» también es una fuente defendible y el caso de control tiene dos respuestas correctas. El escenario conserva `allow` | `vm/casos/C-1b/global/opencode.json`; diseño v0.3, D-44 | Cambiar a `"ask"`, reverificar en la VM y revisar la hoja de respuestas |
| L-02 | **La copia del diseño en el repositorio es anterior a la v0.3** («En definición», C-1b con `allow`, sin D-44). La que el autor pegó en la sesión es otra | `01-relevamiento/diseno-linea-base.md`, líneas 11 y 392 | Reemplazar por la v0.3 y registrar como antecedente de diseño, no como fuente vigente (ver 5) |
| L-03 | **`verificar.sh` no ejecuta las decisiones de permiso.** Captura `debug config` y `debug agent`, pero D-36 exige verificar en ejecución. C-3b, C-4a y C-4b se ejecutaron solo en Windows | `vm/verificar.sh`; diseño v0.3, 8.3 y sección 25 | Agregar una ejecución con el proveedor mock del laboratorio (tool call fija y archivo centinela) para C-3b, C-4a y C-4b en la VM |
| L-04 | **(Resuelto el 25/09: reconstruida en `linea-base/respuestas.md`.)** **Falta la hoja de respuestas.** `sesion/casos-y-respuestas.md` no se subió; sin ella no hay corrector ni forma de revisar L-01 | — | Subirla a una ubicación que no se publique (ver L-06) |
| L-05 | **El `INFORME.md` no sirve como anexo en su forma actual.** Está en primera persona de un asistente («mi harness», «tu diagnóstico»); expone una ruta personal (`C:\Users\Joa\...`); y cita `oc-lab/evidencia/*.txt`, que no está en el repositorio. Es la observación del AE1 sobre marcadores de asistentes generativos (`00-gestion/reglas-catedra.md`, sección 5) | `01-relevamiento/INFORME.md`, líneas 27, 39, 488, 528 y 357 a 367 | Conservarlo como fuente interna. Para el Anexo I, reescribir una síntesis impersonal, subir las evidencias citadas y declarar la herramienta auxiliar |
| L-06 | **Riesgo de publicar el instrumento.** `vm/casos/` ya está en el repositorio. Si es público, un agente con acceso web o un participante podrían encontrarlo (el diseño v0.3, sección 23, lo prohíbe hasta noviembre) | `git status`: `01-relevamiento/vm/` sin seguimiento | Confirmar si el repositorio es público. Si lo es, excluir `vm/casos/` y `sesion/` (el `.gitignore` lo cambia el autor) |
| L-07 | **El laboratorio se hizo en Windows**, donde la herramienta `bash` ejecuta PowerShell (hallazgo C-1). La línea base corre en Ubuntu | `INFORME.md`, §1 y C-1 | Nada de lo que depende de PowerShell (R-3, C-1) entra a los casos. Reverificar en Ubuntu lo que sí entra |

## 3. Qué hay que construir para el ejecutor (lo que el material no resuelve)

**Problema de diseño principal:** si el agente se ejecuta dentro del escenario, **la configuración del caso lo gobierna a él mismo**. En C-1a intentaría usar `openai/gpt-5-mini` sin credenciales. En C-4b, `bash *: deny` le oculta la terminal y no podría ejecutar `opencode debug`. Además, `caso.sh` borra `~/.local/share/opencode`, donde viven las credenciales. El escenario inspeccionado y el ejecutor tienen que quedar separados.

Propuesta (suposición, se confirma en el piloto):

- **Dos usuarios.** `participante` conserva el escenario, igual que hoy. `evaluador` es el ejecutor, con su propia configuración de OpenCode: el modelo fijado; `read`, `bash` y `external_directory` en `allow` (necesario porque `ask` se rechaza solo, E-00); `webfetch` y `websearch` en `deny`, el equivalente de «sin internet»; y la instrucción del agente, que es la de la referente si se obtiene.
- **El ejecutor arranca en un directorio neutro**, fuera de `~participante/proyecto`, para que la configuración del proyecto no se le aplique. Inspecciona el escenario con comandos ejecutados como `participante` (por ejemplo, `sudo -u participante -i`), de modo que `opencode debug config` resuelva el escenario del caso y no el del ejecutor. Esto requiere una regla de `sudoers` acotada, aceptable en una VM desechable.
- **Red:** la VM necesita salida hacia la API del proveedor, pero no hacia la web. Se declara que el modelo puede conocer la documentación por su entrenamiento: es parte del procedimiento delegado real.
- **Modo:** `opencode run` y una sesión creada por API ofrecen herramientas distintas (C-10). Se fija un solo modo y se registra la lista de herramientas ofrecidas.
- **Guion de ejecución (nuevo):** para cada modelo, cada caso y cada una de las k repeticiones, ejecuta `caso.sh` y luego el agente con la pregunta y el formato de respuesta estructurado (valor o decisión, fuente, archivo), con tiempo límite. Guarda la transcripción, los tokens y las herramientas usadas. El corrector compara el resultado contra la hoja de respuestas.

## 4. Qué no aplica con agentes

Las secuencias contrabalanceadas S1 a S8, el cronometraje manual, la latencia del control remoto, la grabación y el consentimiento, `recuerda_caso` y el caso de práctica. Cada ejecución es una sesión nueva, sin memoria: no hay aprendizaje ni fatiga entre casos ni entre mediciones. Todo eso se conserva solo si se hace el contraste con personas.

**Oportunidad:** sin el límite de duración de una sesión humana, se pueden sumar casos por condición. El laboratorio ya tiene mecanismos verificados que sirven como candidatos:

- E-03: un `edit: allow` global desactiva el modo `plan` (C-4, con consecuencia de seguridad);
- E-14: el agente en markdown reemplaza al del JSON (C-2);
- E-12: `{env:NO_EXISTE}` produce una cadena vacía sin aviso (C-3);
- E-18: `OPENCODE_PERMISSION` es una fuente no documentada (C-3/C-4).

Los ocho casos originales se conservan como núcleo. Los adicionales tienen que pasar los criterios 8.2 y verificarse en Ubuntu.

## 5. Decisiones de la v0.3 que el repositorio contradice

La v0.3 es de fecha anterior a varios ADR y a las correcciones del 25/09. Prevalece el repositorio, salvo que el autor abra un ADR:

| v0.3 | Repositorio |
|---|---|
| D-31: reclutar 13, medir 10, mínimo 8 | ADR-039: mínimo 5 |
| D-20: la referente participa y se informa aparte | ADR-016 (aceptado) e II.2.4: excluida |
| D-26: dos tercios, con regla de techo | ADR-038 (propuesto) |
| 3.3: descarta la pirámide de Kendall | ADR-004 (aceptado); I.3.3 la usa |
| Sección 17, D-32: valoración económica en rango | ADR-018 (aceptado): sin valoración monetaria |
| D-09: dos meses entre mediciones | ADR-039: entre cinco y ocho semanas |
| D-10: sin IA, porque «se mediría al modelo» | ADR-040 la revisa: el procedimiento delegado es real (A.I.5) y es justamente lo que se mide |

## 6. Efecto sobre ADR-040

- **Horas:** la reconstrucción de casos ya está hecha y `caso.sh` e `instalar.sh` se reutilizan. Nueva estimación (suposición): guion y corrector, 4 a 6 h; configuración del ejecutor y piloto, 2 a 3 h; casos adicionales, opcional, ~2 h; encuesta, ~3 h; análisis y carga, ~4 h. **Total: 13 a 18 h**, frente a las 17 a 21 h anteriores.
- Agregar a ADR-040 la separación entre escenario y ejecutor, la revisión explícita de D-10 y los defectos L-01 a L-07 como prerrequisitos del piloto.
