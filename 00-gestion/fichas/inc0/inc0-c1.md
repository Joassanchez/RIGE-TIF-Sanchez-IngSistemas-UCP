# Ficha inc0-c1 · README: versión de SQLite y restos de plantilla

- **Incremento / rama:** 0 · `inc0-esqueleto` (corrección de la revisión del incremento)
- **Escritor:** `gpt-6.1-sol`, esfuerzo `medium`
- **Riesgo:** bajo
- **Fuentes (leé solo estas secciones):**
  - `../catedra/AE2-guia-comprobacion-v1.md`, paso 3 (versiones de lenguaje, motor de base de datos y herramientas);
  - `../00-gestion/reglas-catedra.md` §5 (marcadores residuales) y §7;
  - `AGENTS.md` §7.

## 1. Qué hay que hacer

Tres cambios en `README.md`; ningún otro:
1. En §3, declarar la versión del motor: «SQLite **3.53.0**, integrado en Bun 1.3.14». Agregá un comando de comprobación que el lector pueda copiar: `bun -e "import { Database } from 'bun:sqlite'; console.log(new Database(':memory:').query('select sqlite_version() as v').get().v)"`, cuya salida esperada es `3.53.0`.
2. Quitar la instrucción de plantilla de la línea 3: «Completar las ocho secciones antes de crear la etiqueta `v1`.». El resto del recuadro queda.
3. Reemplazar la última línea, «Conforme al Protocolo de Uso Autorizado. Si no hubo uso, se consigna de manera expresa.», por «Uso conforme al Protocolo de Uso Autorizado, en los períodos declarados en la tabla.».

## 2. Archivos

| Archivo | Acción |
|---|---|
| `README.md` | Ampliar (solo los tres cambios de §1) |

No toques ningún otro archivo.

## 3. Interfaces

No aplica.

## 4. Patrones existentes a imitar

- **§3 del README:** misma forma que la línea de Bun: versión en negrita y comando de comprobación en bloque `bash`, que también sirve en PowerShell.

## 5. Reglas de comportamiento

| ID | Regla |
|---|---|
| R-1 | El comando de comprobación de §3, ejecutado desde `src/` en Windows, imprime `3.53.0`. Si imprime otra versión, detenete |
| R-2 | El README no contiene «Completar las ocho secciones» ni «Si no hubo uso». El único `[DATO PENDIENTE` es el de §2 |

## 6. Pruebas

Sin pruebas automáticas nuevas. R-1 y R-2 se comprueban a mano; registrá su resultado en el commit.

## 7. Comandos

Desde `src/`, con `RIGE_ALMACEN` en un temporal:

```bash
bun test                          # una vez, al final (sin cambios esperados)
bun run verificar                 # una vez, al final
```

## 8. Resultado esperado y detención

- **Pruebas:** `bun test` con el mismo total que antes (270) y en verde. **`verificar`:** PASS.
- **Commit:** `docs: version de SQLite y restos de plantilla en el README (inc0-c1)`, con R-1 y R-2 y su resultado. Agregá solo `README.md`.
- **Respuesta final:** el JSON del esquema `../00-gestion/fichas/esquema-salida-escritor.json`.
- **Temporales:** si el sandbox no te deja borrar un temporal tuyo, nombralo en `notas` y commiteá igual.
- **Detenete sin commitear** si R-1 no da `3.53.0`.
