# Ficha inc0-c3 · CLI por tabla, versión única, mensajes del almacén y comillas en `rige.env`

- **Incremento / rama:** 0 · `inc0-esqueleto` (mejoras de la revisión del incremento: C5, C7 y C8). Va **después** de inc0-c4 e inc0-c2.
- **Escritor:** `gpt-6.1-sol`, esfuerzo `high`
- **Riesgo:** medio
- **Fuentes (leé solo estas secciones):**
  - ADR-058, «Contrato de salida de la CLI» y tabla de reglas de dependencia (`../00-gestion/decisiones/ADR-058-arquitectura-puertos-adaptadores-estructura-src.md`);
  - ADR-061, contrato de `almacen-sin-esquema` (el mensaje nombra `bun run esquema`);
  - ADR-062, «C4 · Configuración propia» y «C5 · Versionado»;
  - ADR-066, punto 1 (`configuracion-invalida`: «valor inválido»);
  - `AGENTS.md` §3, §5 y §7.

## 1. Qué hay que hacer

El contrato de la CLI no cambia: canales, códigos 0, 1, 2 y 70, y formas JSON. Los cambios son estos:
- **C5 · CLI.** `ejecutar.ts` pasa de una cadena de `if` a una **tabla de subcomandos**. Una sola función arma y escribe el JSON de error. La CLI deja de importar tipos de `interfaces/web`: los tipos de `Resultado` y `ConsultarEstado` salen de `aplicacion`. La versión de RIGE pasa a ser **una constante**, que las pruebas leen y que se verifica contra `package.json`.
- **C8 · Almacén.**
  - `preparar` sobre una base incompatible conserva el código `almacen-sin-esquema`, pero con un mensaje propio que no le pide al usuario repetir lo que acaba de hacer.
  - La versión esperada del esquema se lee de la base de referencia en memoria, en lugar de estar fija en tres lugares.
  - Se corrige el comentario de `puertos/almacen.ts` («consultar nunca crea archivos»: crea los `-wal` y `-shm` de SQLite dentro del almacén) y una prueba fija qué archivos deja `consultar`.
- **C7 · Configuración.** En `rige.env`, un valor entre comillas (`"…"` o `'…'`) es `configuracion-invalida`, con un mensaje que nombra la clave.

**No** se hace en esta ficha: cambiar el código de salida 70 de A-4. Eso depende del ADR-069, que está propuesto y no aceptado.

## 2. Archivos

| Archivo | Acción |
|---|---|
| `paquetes/rige/aplicacion/respuestas/resultado.ts` | Crear: `export type { Resultado } from "@rige/nucleo/resultado"` |
| `paquetes/rige/aplicacion/respuestas/estado.ts` | Ampliar: `export const versionRige = "0.1.0" as const` |
| `paquetes/rige/aplicacion/casos-uso/consultar-estado.ts` | Ampliar: `export type ConsultarEstado` |
| `paquetes/rige/aplicacion/errores.ts` | Ampliar: `errorAlmacenIncompatible` |
| `paquetes/rige/aplicacion/puertos/almacen.ts` | Ampliar: reexportar `errorAlmacenIncompatible`; corregir el comentario |
| `paquetes/rige/adaptadores/almacen-sqlite/esquema.ts` | Ampliar |
| `paquetes/rige/adaptadores/almacen-sqlite/esquema.test.ts` | Ampliar |
| `paquetes/rige/adaptadores/sistema/configuracion.ts` | Ampliar |
| `paquetes/rige/adaptadores/sistema/configuracion.test.ts` | Ampliar |
| `paquetes/rige/interfaces/cli/ejecutar.ts` | Ampliar |
| `paquetes/rige/interfaces/cli/ejecutar.test.ts` | Ampliar |
| `paquetes/rige/interfaces/web/servidor.ts` | Ampliar: tipos desde `aplicacion` |
| `pruebas/aceptacion/arranque.test.ts` | Ampliar solo si cambia un mensaje esperado |
| pruebas que escriben `"0.1.0"` a mano | Ampliar: leer `versionRige` |

No toques ningún otro archivo.

## 3. Interfaces

```ts
// aplicacion/errores.ts
export const errorAlmacenIncompatible: ErrorUso; // codigo "almacen-sin-esquema";
// mensaje: "El almacen tiene un esquema incompatible. Muevalo o borrelo y ejecute bun run esquema."

// aplicacion/casos-uso/consultar-estado.ts
export type ConsultarEstado = () => Resultado<RespuestaEstado, ErrorUso>;

// interfaces/cli/ejecutar.ts
export interface CasosUsoCli {
  readonly prepararAlmacen: () => Resultado<RespuestaEstado, ErrorUso>;
  readonly consultarEstado: ConsultarEstado;
  readonly iniciarServidor: () => Resultado<{ readonly direccion: string }, ErrorUso>;
}
export type Ensamblado = Resultado<CasosUsoCli, ErrorUso>;
// Tabla interna: const subcomandos = { esquema: (c) => …, servir: (c) => … } satisfies Record<string, (c: CasosUsoCli) => Resultado<object, ErrorUso>>;
// servir: consultarEstado → iniciarServidor → { esquema: 1, direccion }. El mensaje de «falta subcomando» lista Object.keys(subcomandos).
// Una función escribirError(canales, error) arma {esquema:1, error}; se usa para 1, 2 y 70.
```

`interfaces/web/servidor.ts` sigue exportando `iniciarServidor`, ahora tipado con el `Resultado` de `aplicacion/respuestas/resultado`. La CLI no importa nada de `interfaces/web`.

## 4. Patrones existentes a imitar

- **Reexportación de errores por el puerto:** `puertos/almacen.ts` ya reexporta `errorAlmacenSinEsquema`. `errorAlmacenIncompatible` sigue el mismo camino (lección de T0-10).
- **Pruebas de la CLI:** imitá `ejecutar.test.ts`, con dobles de `ensamblar` y canales que acumulan texto. Las pruebas CLI-1 a CLI-6 existentes tienen que pasar **sin cambiar su expectativa**. Solo cambia el texto de «falta subcomando» si hoy está escrito literal en una prueba.
- **Prueba del adaptador:** imitá `esquema.test.ts`: temporales con `mkdtempSync` y borrado al terminar; SQLite real.
- **Prueba de configuración:** imitá los casos C4-3 de `configuracion.test.ts`: `rige.env` en un temporal y entorno literal.

## 5. Reglas de comportamiento (una prueba por regla, con el ID en el `describe`)

| ID | Regla |
|---|---|
| V-1 | `versionRige` es igual al `version` de `src/package.json`; ninguna prueba ni módulo de producto, salvo `estado.ts`, contiene el literal `"0.1.0"` |
| CLI-7 | `ejecutar.ts` no importa nada de `interfaces/web` (lo verifica el análisis de imports del archivo) y CLI-1 a CLI-6 siguen pasando sin cambios |
| AL-1 | `preparar` sobre una base de `user_version = 2` devuelve `errorAlmacenIncompatible` (código `almacen-sin-esquema`, mensaje que nombra `bun run esquema` y «incompatible»); `consultar` sobre esa misma base devuelve `errorAlmacenSinEsquema`; la base no cambia |
| AL-2 | La versión esperada sale de la base de referencia en memoria: con un guion de prueba que fije `user_version = 7`, el estado informa 7. Si no se puede inyectar el guion sin cambiar la firma pública, cubrilo con una prueba de que `estado().versionEsquema` coincide con el `PRAGMA user_version` del guion real |
| AL-3 | Después de `consultar` sobre una base preparada, el directorio contiene solo archivos de nombre `rige.db`, `rige.db-wal` o `rige.db-shm`, y el inventario del esquema no cambió |
| C4-9 | En `rige.env`, `RIGE_ALMACEN="C:\x"`, `RIGE_ALMACEN='x'` y `RIGE_PUERTO="4747"` → `configuracion-invalida` con mensaje que nombra la clave y «comillas»; sin comillas, el comportamiento de C4-1 a C4-8 no cambia |

## 6. Pruebas

Unitarias junto al código. Toda la suite y la aceptación actuales se ejecutan como regresión.

## 7. Comandos

Desde `src/`, con `RIGE_ALMACEN` en un temporal en todo comando:

```bash
bun test paquetes/rige pruebas/aceptacion/arranque.test.ts   # durante el trabajo
bun test                                                    # una vez, al final
bun run verificar                                           # una vez, al final
```

## 8. Resultado esperado y detención

- **Pruebas:** `bun test` completo en verde. **`verificar`:** PASS.
- **Commit:** `refactor: CLI por tabla, version unica, mensajes del almacen y comillas en rige.env (inc0-c3)`, con rojo → verde por regla (V-1 a C4-9) y los resultados finales. Agregá solo los archivos de §2.
- **Respuesta final:** el JSON del esquema `../00-gestion/fichas/esquema-salida-escritor.json`.
- **Temporales:** si el sandbox no te deja borrar un temporal tuyo, nombralo en `notas` y commiteá igual.
- **Detenete sin commitear** si:
  - cambia algún canal, código de salida o forma JSON del contrato;
  - la guarda de dependencias rechaza `aplicacion/respuestas/resultado.ts` y la solución exige relajarla;
  - hace falta tocar otro archivo.
