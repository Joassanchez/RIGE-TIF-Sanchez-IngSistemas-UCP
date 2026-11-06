# Preregistro de la medición final: registro de verificación

Cierre del bloque B1. **Ninguna de estas corridas mide a RIGE con agentes:** la admisión es nativa y sin agente, y el ensayo usa un proveedor simulado sin credencial. Las reglas están en `PREREGISTRO.md` y `PREREGISTRO.json`; su estado, en ADR-098, «Modificación del 05/11/2026», puntos 31 a 46, aceptados por el autor el 06/11/2026.

## Contenido

| Elemento | Ubicación |
|---|---|
| Reglas | `PREREGISTRO.md`; valores que lee el análisis en `PREREGISTRO.json` (SHA-256 `3ec1a834d1069b6a5eb3717fb83527a7b572a020a03ee6204a9504f531730f50`) |
| Cobertura por problema | `cobertura/` (salida sobre `congelada`: `5884feac3269657092e5ce68b90274ac07cff798e19ea74e706aeac536f4ca54`) |
| Tolerancias | `remuestreo/` |
| Adjudicación manual | `adjudicacion/`: la hace el autor |
| Hoja final superpuesta | `ecologica/final/` (`manifiesto.json`: `efd8197f53d0f6a74d884d153659b13739ffbbfa00d162b8e1b6c23441c457fe`), cerrada el 05/11/2026 |
| Arnés, comandos y límites | `verificacion/20261105-med19/README.md` |

## Admisión nativa

Evidencia fuera del repositorio: `C:/Users/Joa/evidencia-admision-med19-20261105` (`admision.json` `8f9015de7bd5496dec1a2b8f64dc9e4eaee21010aefaf72be111672d95047bf6`; `evidencia.tar` `187a82676b749fe71856e6eec2d74ac2e6a470362fc3cc829562d9817c22dd87`). Las otras 44 tareas se heredan de `C:/Users/Joa/evidencia-admision-completa-20261020c`.

**6 de 6 admitidas:** S-3, M-2 y R-1 a R-4. Solo la forma correcta da `correcta`. Las ingenuas dan `sin_efecto`, salvo la `ingenua_amplia` de S-3, que da colateral.

## Ensayo final (VER-08)

Del 05/11/2026, 22:59, al 06/11/2026, cerca de las 02:28, hora local, con de a dos tandas en paralelo. Imagen `rige-linea-base:1.18.25` (`a691196f0e3e`), sin reconstruir. RIGE: binario de `congelada`, SHA-256 `03bc78fea38449b89479df2fcfc5fe6ff9508241bd794ee16c4aadd115c95e2e`. Arnés `34fe89cd01c6…`; entradas `98e6838bd618…` con RIGE y `884df8ebbdbf…` sin RIGE, iguales en todas las tandas de cada grupo. Evidencia fuera del repositorio: `C:/Users/Joa/ensayo-med19-final-20261105`.

| Tanda | Filas | Uso de RIGE | Verificación final | Resultado | SHA-256 de `corregido.jsonl` (inicio) |
|---|---:|---|---|---|---|
| `eco-LB` | 24 | no | ninguna 21, comportamiento 3 | correcta 18, colateral 6 | `fbe01583226a6c94` |
| `eco-sin_rige` | 24 | no | ninguna | correcta 24 | `b8fba40949310ca3` |
| `eco-indicado` | 24 | sí | `rige` | correcta 24 | `ad1e7e05d12e858b` |
| `eco-disponible` | 24 | sí | `rige` | correcta 24 | `0ec6dc89eafaa00d` |
| `eco-probar` | 24 | no | comportamiento, 24 con sesión anidada | correcta 24 | `6df9d074fab75fdb` |
| `control-sin_rige` | 15 | no | ninguna | correcta 15 | `c04e29018c662ea6` |
| `det-indicado` | 33 | sí | no aplica | respondida 30, sin respuesta 3 | `b1b432c8a7cf85b1` |
| `det-disponible` | 33 | sí | no aplica | respondida 30, sin respuesta 3 | `f748db379a24d832` |
| `eco-charles-indicado` | 2 | sí | `rige` | correcta 2 | `e7fd2e62f3026403` |
| `contraste-indicado` | 2 | sí | `rige` | correcta 2 | `b79daefd358896af` |

**Control:** ningún registro incompleto, par faltante, discrepancia de oráculo, alteración de ejecutor o de ejecución, acceso web ni censura. Aislamiento verificado en cada tanda.

**Lo que parece anomalía y no lo es:**
- Los 6 `colateral` de `eco-LB` son M-2 y S-3: su guion repite la referencia anterior, y la hoja final corrige esa referencia (`PREREGISTRO.md`, sección 4).
- Los 3 `sin_respuesta` de detección son D-B: el guion del ensayo responde sin JSON a propósito.

**Qué prueba:** el recorrido del arnés por brazo. Las respuestas son guiones, así que estas cifras no anticipan ningún resultado.

**Cambios durante la corrida:** `herramientas/analizar_final.py` y sus pruebas (MED-19-c4). No entran al contenedor, y los hashes del arnés y de las entradas no cambiaron.

## Humo del análisis

El analizador rechaza las filas simuladas, así que el ensayo no lo recorre. `verificacion/20261105-med19/humo_analisis.py` lo hace con copias temporales reetiquetadas. **Encontró un defecto que el ensayo y las revisiones no habían visto:** en `probar`, M-2 y R-4, la prueba del agente edita un archivo del proyecto, y el analizador abortaba toda la medición. Se corrigió con MED-19-c5, sin cambiar el arnés, y con la regla de ADR-098, punto 46. Con el arreglo termina con código 0 y `Meta sin evaluar por falta de ejecución`, que es lo correcto para un banco incompleto. La base de octubre tiene 0 de 342 filas con esa marca.

## Pruebas

`python -B -m unittest`: 204 en `herramientas/`; 103 en `vm/simulado/`, con 4 omitidas. Comprobadas por el ingeniero después de MED-19-c5, el 06/11/2026.

## Qué queda para la etiqueta (bloque B5)

El ensayo y la cobertura corrieron sobre `congelada`. Sobre la etiqueta final se repiten el ensayo y el contraste de cobertura, se registra el corte en `MANIFIESTO.json` y se acredita el diagnóstico de la sección 11 del preregistro.

## Revisión

Crítico y verificador de consistencia en Codex (`gpt-6.1-sol`), cuatro pasadas, hasta que los hallazgos de la tercera quedaron cerrados sin defectos nuevos. El punto 46 y MED-19-c5 son posteriores a esa última pasada: los comprobó el ingeniero con las pruebas y el humo.
