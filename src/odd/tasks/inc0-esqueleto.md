# Incremento 0 · Esqueleto que camina — Documento ODD

| Campo | Valor |
|---|---|
| Estado | Propuesto. Aguarda revisión del autor (ADR-065, regla 3). Sin implementación hasta su conformidad. |
| Fecha | 29/09/2026 |
| Rama | `inc0-esqueleto`, a crear desde `main` cuando el autor autorice la implementación |
| TDD | Estricto. Fuente: `src/AGENTS.md` §7 y ADR-065 (regla 4). Ejecutor: `bun test` |
| Entrega | Una sola rama, sin solicitudes de integración. El agente nunca sube, une con `main` ni crea etiquetas (ADR-065, regla 5) |
| Fuentes | Plan `../00-gestion/revisiones/20260929_inc0-base-contexto.md` (propuesta, no orden); ADR-032, ADR-054, ADR-058, ADR-061, ADR-062, ADR-065 (`../00-gestion/decisiones/`); fichas `../03-requisitos/libro/catalogo/RNF-03.md`, `RNF-05.md`, `RNF-09.md`; guía `../catedra/AE2-guia-comprobacion-v1.md` (pasos 4 a 7 y §5); `../.github/workflows/ci.yml` (existente, no se modifica) |

## 1. Objetivo

Que un tercero, en una máquina limpia con Ubuntu o Windows, pueda instalar RIGE, crear el esquema del almacén y arrancar el servidor siguiendo solo los comandos del README, y que el CI lo acredite en las dos plataformas. No hay lógica de resolución: la web responde una página fija.

**Terminado cuando** el CI termina en verde en `ubuntu-latest` y `windows-latest` y los comandos de §9 funcionan en el equipo del autor siguiendo únicamente `src/README.md` (guía, pasos 4 a 7).

## 2. Problema

`src/` solo contiene `README.md`, `AGENTS.md` y `CLAUDE.md`. Un prototipo que no se instala, no crea su esquema o no arranca en otra máquina no se computa, con independencia de lo que haga (guía: la cátedra no interpreta ni suple pasos faltantes). Los pasos 4 a 7 son el riesgo principal de la comprobación, sobre todo en Windows (ADR-054 declara Windows 11 y, como los ejecutores de GitHub son Windows Server, la matriz del CI es la acreditación automática).

## 3. Por qué primero

Un esqueleto que camina (Cockburn, 2004) prueba de punta a punta instalación, esquema, arranque y CI con lógica vacía. Los incrementos siguientes llenan cada capa sobre una base ya verificada en las dos plataformas. Corresponde a la tarea de la iteración 1 «Repositorio, canal de integración continua y entorno de ejecución» (`../03-requisitos/libro/iteraciones.md`, Tabla 18).

## 4. Alcance

### 4.1 Archivos que crea (todos dentro de `src/`)

```
src/
├── package.json · bunfig.toml · tsconfig.base.json · tsconfig.json
├── rige.env.example · .gitignore · .gitattributes
├── esquemas/almacen/001_inicial.sql
├── paquetes/
│   ├── nucleo/    package.json (@rige/nucleo) · tsconfig ("types": [], lib sin DOM) · resultado.ts
│   ├── opencode/  package.json (@rige/opencode) · descriptor.ts (versión soportada 1.18.25)
│   └── rige/      package.json (@rige/rige)
│       ├── aplicacion/puertos/configuracion.ts · almacen.ts
│       ├── aplicacion/errores.ts
│       ├── adaptadores/sistema/configuracion.ts
│       ├── adaptadores/almacen-sqlite/esquema.ts
│       ├── interfaces/web/servidor.ts · intermedios/origen.ts · intermedios/errores.ts · paginas/inicio.ts
│       ├── interfaces/cli/ejecutar.ts
│       └── arranque/rige.ts
└── pruebas/
    ├── preparar-entorno.ts · utilidades/entorno-aislado.ts
    └── escenarios/.gitkeep · arquitectura/ · aceptacion/
```

`bun.lock` se genera con `bun install` y se versiona (ADR-062, C3). `package.json` raíz: `name "rige"`, `version "0.1.0"`, `private`, `workspaces ["paquetes/*"]` y los scripts de ADR-062 C1.

### 4.2 Precisiones

- **`nucleo` con `"types": []`** y sin `DOM` en `lib`: una referencia a `Bun`, `fetch` o `process` en el núcleo falla en la verificación de tipos (ADR-062, C3).
- **El guion SQL se importa como texto** (`import guion from "…/001_inicial.sql" with { type: "text" }`), compatibilidad medida en el equipo del autor con Bun 1.3.14 (ADR-062, verificación sobre el tag).
- **`001_inicial.sql`:** las tres tablas (`proyecto`, `resolucion`, `entrada_leida`), restricciones, índices y disparadores de inmutabilidad de ADR-061. Termina en `PRAGMA user_version = 1` y se aplica en una transacción. Los nombres de columna son ajustables sin ADR nuevo, conservando las restricciones (ADR-061).
- **Directorio del almacén:** `esquema.ts` lo crea con `mkdirSync(…, { recursive: true })`. Es el único uso de `node:fs` admitido en ese módulo, y solo para crear su propio directorio (ADR-061).
- **Conexión:** `foreign_keys = ON` en cada conexión, `journal_mode = WAL`, `busy_timeout` y `secure_delete = ON` (ADR-061).
- **`bun run servir`:** verifica `user_version` antes de escuchar; si falta o no coincide, termina con el error de uso `almacen-sin-esquema` (código 1) y el mensaje nombra `bun run esquema` (ADR-061). Escucha solo en `127.0.0.1` y en `RIGE_PUERTO` (ADR-062 C4; ADR-058, convención 6); si el puerto está ocupado, termina con un error que nombra la variable (código de salida bajo D-1).
- **`GET /`:** página HTML fija con «RIGE 0.1.0» y la ruta del almacén en uso. HTML generado en el servidor, sin JavaScript en el cliente, todo valor escapado por defecto (ADR-062 C2).
- **`bun run rige -- <otro subcomando>`:** error de argumentos, código 2 (ADR-058, contrato de salida).
- **Dependencias:** solo `typescript` 7.0.2 y `@types/bun` 1.3.14, exactas, de desarrollo (`bun add -d -E`). Ninguna de ejecución en este incremento (`jsonc-parser` 3.3.1 llega con el adaptador) (ADR-062 C3).
- **Ya existe, no se toca:** `../.github/workflows/ci.yml` corre `bun install --frozen-lockfile`, `bun run verificar` y `bun test` en `src/`, con matriz `ubuntu-latest` y `windows-latest`. Coincide con ADR-054 y con el §5 de la guía.

### 4.3 Fuera de alcance

Lógica del núcleo; adaptador (lectura, vías, secuencia); `jsonc-parser`; copia atribuida en `vendor/`, `LICENSE` y `NOTICE`; subcomandos `valor`, `permiso` y `hallazgos`; formulario web; escenario `rf-01-tres-entradas`; resultado de referencia; chequeo de versión de OpenCode (RF-05, código 3): `descriptor.ts` solo declara la constante. Las pruebas 1, 2 y 4 de ADR-061 (ida y vuelta, retención y RNF-04 sobre el almacén) requieren el camino de escritura de la Resolución y quedan para el incremento que lo implemente.

## 5. Restricciones

- Rige `src/AGENTS.md` completo. Identificadores, carpetas y casos de uso en español, sin tildes ni ñ en los identificadores (ADR-058, I-1).
- Las cinco restricciones no negociables de `src/AGENTS.md` §2 (RNF-01, RNF-02, RNF-03, RNF-04, RNF-05).
- Solo se escribe dentro de `src/`.
- Commits solo en la rama `inc0-esqueleto`, uno por tarea, con Conventional Commits. Nunca subir, unir con `main` ni crear etiquetas.
- No crear `opencode.json`, `opencode.jsonc` ni `.opencode/` en ninguna carpeta del repositorio (ADR-062 C6).
- No agregar dependencias fuera de las declaradas en §4.1. Toda dependencia nueva requiere autorización del autor y registro en un ADR (ADR-062 C3).
- No se modifica `../.github/workflows/ci.yml`.
- **Método TDD:** por cada tarea de código, la prueba se escribe primero, se la ve fallar, se escribe el mínimo código que la hace pasar y se refactoriza (ADR-065, regla 4; `src/AGENTS.md` §7). La evidencia (rojo, verde, refactorización, commit) se registra en §11.
  - *Precisión:* cuando el código existente ya satisface la prueba (típico en pruebas de arquitectura), el rojo se observa con una mutación temporal revertida y así se registra.
- **Pronóstico de líneas autoradas** (altas + bajas, sin `bun.lock`): T0-04 ≈ 430 · T0-05 ≈ 260 · T0-06 ≈ 70 · T0-07 ≈ 80 · T0-08 ≈ 60 · T0-09 ≈ 380 · T0-10 ≈ 240 · T0-11 ≈ 630 · T0-12 ≈ 240 · T0-13 ≈ 120 · **Total ≈ 2.500**.
  El total supera ampliamente las ~400 líneas: queda anotado aquí y **no se propone estrategia de cadena**; la entrega es una sola rama, sin solicitudes de integración. T0-09 y T0-11 exceden el heurístico de ~400 por tarea; se justifican como unidades de comportamiento completas («el almacén tiene esquema» y «el esqueleto arranca y responde») y no se dividen para no separar la prueba de su implementación.

**Detenerse y preguntar si:**

- una verificación de T0-01 a T0-03 contradice un ADR;
- una prueba de arquitectura exige relajar una regla de ADR-058;
- hace falta escribir fuera de `src/` o agregar una dependencia;
- el CI en Windows falla por una causa que no se resuelve dentro de `src/`.

## 6. Tareas

Cada tarea de código se hace en TDD estricto (§5) y se marca `[x]` solo con la evidencia observada de §11.

### Verificaciones previas (sin código, sin commit)

- [ ] **T0-01 · Bun no carga `rige.env`.** Crear un `rige.env` con `RIGE_PRUEBA=1` en un directorio temporal del sistema y ejecutar `bun -e "console.log(process.env.RIGE_PRUEBA)"` con ese directorio como cwd. *Criterio:* imprime `undefined`. Si imprime `1`, detenerse: ADR-062 C4 prevé cambiar el nombre del archivo y el asunto pasa al autor.
- [ ] **T0-02 · Clave de instalación aislada en `bunfig.toml` de Bun 1.3.14.** ADR-058 cita `install.hoist = false`; la documentación de Bun («Isolated installs», consultada el 29/09/2026) documenta `[install] linker = "isolated"` con `hoist = false`, y el modo aislado por defecto en proyectos nuevos con workspaces. *Criterio:* clave vigente identificada en la documentación de Bun 1.3.14 y efectiva (un import no declarado falla). Si no existe instalación aislada, detenerse (ADR-058).
- [ ] **T0-03 · Desactivar la carga automática de `.env`.** *Criterio:* se sabe si `bunfig.toml` de Bun 1.3.14 lo admite. Si lo admite, se configura como defensa adicional; si no, se anota y se sigue (ADR-062 C4).

### Pruebas y código (en este orden)

- [ ] **T0-04 · Andamiaje del workspace y aislamiento del entorno de pruebas** — archivos base de §4.1 (package.json, bunfig.toml, tsconfigs, rige.env.example, .gitignore, .gitattributes), `pruebas/preparar-entorno.ts`, `pruebas/utilidades/entorno-aislado.ts`, `pruebas/arquitectura/entorno.test.ts`. *Criterio:* `HOME`, `USERPROFILE`, `XDG_*`, `LOCALAPPDATA`, `APPDATA` y `RIGE_ALMACEN` apuntan a un temporal; las `OPENCODE_*` quedan vacías; `fetch` global falla; herencia solo `PATH` y `SystemRoot` en los subprocesos (ADR-062 C6; ADR-058 G-2; RNF-05).
- [ ] **T0-05 · Reglas de dependencia** — `pruebas/arquitectura/dependencias.test.ts` con `Bun.Transpiler().scanImports`. *Criterio:* cero dependencias del núcleo hacia el adaptador (**RNF-03 CA-1**); además, reglas de ADR-058: `nucleo` sin imports externos ni de otros paquetes; `interfaces` no importa `adaptadores`; solo `adaptadores/sistema` importa `node:fs`, salvo `mkdirSync` en `adaptadores/almacen-sqlite`; solo `adaptadores/almacen-sqlite` importa `bun:sqlite`. Código mínimo asociado: `resultado.ts`, puertos y `descriptor.ts`.
- [ ] **T0-06 · Sin identificaciones de la herramienta en el núcleo** — `pruebas/arquitectura/identificaciones.test.ts`. *Criterio:* ningún archivo de `paquetes/nucleo` contiene `opencode` ni `OPENCODE_`, sin distinguir mayúsculas (**RNF-03 CA-2**).
- [ ] **T0-07 · Sin clientes de red** — `pruebas/arquitectura/red.test.ts`. *Criterio:* ningún archivo de `paquetes/` importa `node:http`, `node:https`, `node:net`, `node:tls`, `node:dgram` ni `undici`, ni usa `fetch(` o `WebSocket` (ADR-058, G-2 y tabla de reglas). Las CA-1 y CA-2 de RNF-05 exigen un análisis completo y quedan en la iteración 3 (ficha RNF-05).
- [ ] **T0-08 · Guarda del repositorio** — `pruebas/arquitectura/repositorio.test.ts`. *Criterio:* entre `pruebas/escenarios/` y la raíz del repositorio no hay `opencode.json`, `opencode.jsonc` ni `.opencode/` (ADR-062 C6).
- [ ] **T0-09 · Esquema del almacén** — `esquemas/almacen/001_inicial.sql`, `paquetes/rige/adaptadores/almacen-sqlite/esquema.ts` y `esquema.test.ts`. *Criterio:* con `RIGE_ALMACEN` en una carpeta inexistente, la carpeta se crea; base vacía → `user_version = 1` y las tres tablas; segunda aplicación sin cambios; `foreign_keys` activo; `UPDATE` sobre `resolucion` rechazado (ADR-061, pruebas 3 y 5).
- [ ] **T0-10 · Configuración propia** — `paquetes/rige/adaptadores/sistema/configuracion.ts` y `configuracion.test.ts`. *Criterio:* prelación entorno → `rige.env` → valores por defecto; `OPENCODE_X` en `rige.env` da error de uso visible (nombre del código bajo D-1); puerto no numérico ídem (ADR-062 C4).
- [ ] **T0-11 · Arranque** — `interfaces/cli/ejecutar.ts`, `arranque/rige.ts`, `interfaces/web/servidor.ts`, `intermedios/errores.ts`, `paginas/inicio.ts`, `aplicacion/errores.ts`, `pruebas/aceptacion/arranque.test.ts` por subproceso. *Criterio:* `bun run esquema` crea el esquema de manera reproducible (guía, paso 6); `servir` sin esquema termina con código 1 y mensaje que nombra `bun run esquema` (ADR-061); con el puerto ocupado nombra `RIGE_PUERTO` (ADR-062 C4); con el esquema creado responde 200 en `/` (guía, paso 7).
- [ ] **T0-12 · Seguridad de la web** — `interfaces/web/intermedios/origen.ts` y `pruebas/aceptacion/RNF-09.test.ts` por subproceso, puerto libre. *Criterio:* `Host: evil.example` → rechazo sin datos (**RNF-09 CA-1**); `POST /` → rechazo (**CA-2**); ninguna cabecera `Access-Control-*` (**CA-3**); `Sec-Fetch-Site: cross-site` **y `same-site`** → rechazo; `same-origin`, `none` y ausente → 200 (ADR-062 C7).
- [ ] **T0-13 · README** — `src/README.md` §3 a §6 con los comandos de §9 y las versiones exactas (Bun 1.3.14, TypeScript 7.0.2, SQLite 3.53.0 integrado en Bun) (ADR-062, consecuencias). *Criterio:* cada comando que usan las pruebas y el CI figura en el README (guía, paso 4 y regla de la comprobación).

Cada subproceso recibe un entorno construido con `pruebas/utilidades/entorno-aislado.ts` y nunca hereda `process.env`, salvo `PATH` y `SystemRoot`. El puerto de las pruebas se obtiene libre en cada corrida; nunca se usa el 4747 (ADR-062 C6).

## 7. Alcance autorizado

Cuando el autor autorice la implementación, quedan autorizadas solo estas operaciones: crear la rama `inc0-esqueleto` desde `main`; escribir exactamente los archivos de §4.1 dentro de `src/` (más `bun.lock` generado); ejecutar los comandos de §9; cerrar cada tarea con un commit en esa rama. Todo lo demás (escribir fuera de `src/`, tocar `ci.yml`, agregar dependencias, subir, unir, etiquetar, cambiar objetivo, alcance o restricciones de este documento) requiere acuerdo nuevo del autor (`src/AGENTS.md` §1).

## 8. Criterios de aceptación del incremento

1. **Paso 4 de la guía:** `bun install --frozen-lockfile` termina sin errores a partir de `bun.lock` versionado.
2. **Paso 5:** `rige.env.example` existe, nombra todas las variables necesarias y ninguna contiene credenciales reales.
3. **Paso 6:** `bun run esquema` crea el esquema de manera reproducible; una base creada a mano no satisface el paso (ADR-061, C-A).
4. **Paso 7:** `bun run servir` levanta y responde en la dirección declarada (`http://127.0.0.1:4747`).
5. **§5 de la guía:** el canal instala dependencias, construye (`bun run verificar`: `tsc --noEmit` y `bun build` de comprobación) y ejecuta pruebas ligadas a criterios de aceptación del catálogo, en verde en `ubuntu-latest` y `windows-latest` con registro accesible.
6. **Catálogo cubierto aquí:** RNF-03 CA-1 y CA-2; RNF-09 CA-1, CA-2 y CA-3. **RNF-05:** garantía estructural (sin clientes de red; `fetch` que falla en pruebas); sus CA-1 y CA-2 exigen un análisis completo y quedan en la iteración 3 (ficha RNF-05).

## 9. Verificaciones aplicables

```bash
cd src
bun install --frozen-lockfile
bun run verificar
bun test
bun run esquema
bun run servir        # http://127.0.0.1:4747
```

El CI existente (`../.github/workflows/ci.yml`) ejecuta los tres primeros comandos en `ubuntu-latest` y `windows-latest`. La autocomprobación previa a la entrega (guía §7) la realiza un tercero con el README solo, sin pasos de memoria.

## 10. Progreso

Sin iniciar. Las marcas `[x]` de §6 se activan solo con la evidencia observada de §11.

## 11. Evidencia

**Declaración de herramientas** (rutas y modelos según `~/.config/opencode/opencode.json`):

| Tarea | Ruta | Agente | Modelo | Rojo (prueba y salida) | Verde | Refactor | Commit |
|---|---|---|---|---|---|---|---|
| T0-01 | inline | gentle-orchestrator | opencode-go/mimo-v2.6-pro | | | — | — |
| T0-02 | inline | gentle-orchestrator | opencode-go/mimo-v2.6-pro | | | — | — |
| T0-03 | inline | gentle-orchestrator | opencode-go/mimo-v2.6-pro | | | — | — |
| T0-04 | delegada | general | opencode-go/mimo-v2.6-pro | | | | |
| T0-05 | delegada | general | opencode-go/mimo-v2.6-pro | | | | |
| T0-06 | delegada | general | opencode-go/mimo-v2.6-pro | | | | |
| T0-07 | delegada | general | opencode-go/mimo-v2.6-pro | | | | |
| T0-08 | delegada | general | opencode-go/mimo-v2.6-pro | | | | |
| T0-09 | delegada | general | opencode-go/mimo-v2.6-pro | | | | |
| T0-10 | delegada | general | opencode-go/mimo-v2.6-pro | | | | |
| T0-11 | delegada | general | opencode-go/mimo-v2.6-pro | | | | |
| T0-12 | delegada | general | opencode-go/mimo-v2.6-pro | | | | |
| T0-13 | inline | gentle-orchestrator | opencode-go/mimo-v2.6-pro | | — | — | |

Las columnas de ejecución se completan al implementar; los valores de ruta, agente y modelo son la declaración prevista y se corrigen si la ejecución real difiere. Las tareas de código delegadas usan un solo escritor por tarea; las verificaciones y los comandos de §9 se ejecutan como acciones acotadas.

**Verificaciones del entorno ya medidas** (ADR-062, compatibilidad sobre el equipo del autor, 29/09/2026): Bun 1.3.14 (ZIP y binario cotejados con `SHASUMS256.txt`); TypeScript 7.0.2 con `@types/bun` 1.3.14 y `"types": ["bun"]` verifica sin `skipLibCheck`; SQLite 3.53.0 integrado, con `json_valid` disponible.

**Cierre:** salida de `bun run verificar` y `bun test` en el equipo del autor, y enlace a la corrida del CI una vez que el autor suba la rama (el agente nunca sube).

## 12. Siguiente paso

1. El autor revisa este documento y resuelve §14; se itera hasta la conformidad de ambos (ADR-065, regla 3).
2. Recién entonces, con la autorización expresa del autor, se crea `inc0-esqueleto` desde `main` y se empieza por T0-01.
3. Al cerrar, el sistema de agentes del TIF revisa el diff de la rama y entrega el prompt de correcciones (ADR-065, regla 3).

## 13. Diferencias con el plan de referencia

Solo se listan los puntos en que este documento se aparta del plan (`../00-gestion/revisiones/20260929_inc0-base-contexto.md`).

1. **Nombres de código de error no respaldados.** El plan exige los códigos estables `configuracion-invalida` (T0-10) y `puerto-ocupado` (§5, T0-11). Ningún ADR los define: los únicos códigos estables de error de uso son `almacen-sin-esquema` (ADR-061, contrato de salida) y `via-no-soportada` (ADR-062, consecuencias). Este documento no los adopta: las tareas afirman el comportamiento que sí respaldan las fuentes (error de uso visible, código 1, mensaje que nombra la variable o el comando — ADR-058, contrato de salida; ADR-062 C4) y el nombre del código queda bajo D-1. *Fundamento:* ADR-058 (contrato de salida); ADR-061; ADR-062 C4.
2. **T0-02, clave de `bunfig.toml`.** El plan presenta `install.hoist = false` (citado por ADR-058) y `linker = "isolated"` como alternativas. La documentación de Bun («Isolated installs», https://bun.com/docs/pm/isolated-installs, consultada el 29/09/2026) las describe como claves complementarias bajo `[install]` (`linker = "isolated"` selecciona el linker estricto; `hoist = false` elimina el `node_modules` de reserva) y declara el modo aislado por defecto en proyectos nuevos con workspaces desde la 1.3.2. Se mantiene la verificación con condición de parada. *Fundamento:* ADR-058 (menciones a instalación aislada y `install.hoist = false`); documentación de Bun consultada.
3. **T0-04 absorbe el andamiaje del workspace.** El plan lista `package.json`, `bunfig.toml`, tsconfigs, `rige.env.example`, `.gitignore` y `.gitattributes` en su árbol (§5) pero no los asigna a ninguna tarea. Este documento los crea dentro de T0-04, porque ninguna prueba puede ejecutarse sin ellos. *Fundamento:* ADR-062 C1, C3 y C4; ADR-058 (tsconfig por paquete).
4. **T0-07, atribución del criterio.** El plan atribuye «sin clientes de red» a RNF-05. Las CA de RNF-05 son de comportamiento (monitor de red, interfaz deshabilitada) y su ficha lo prevé para la iteración 3. Lo que se verifica en T0-07 es la garantía estructural de ADR-058 (G-2 y tabla de reglas) y de `src/AGENTS.md` §2. *Fundamento:* `RNF-05.md` (CA-1, CA-2, iteración prevista 3); ADR-058 G-2.
5. **T0-05, alcance de RNF-03 CA-1.** CA-1 solo exige «cero dependencias del núcleo hacia el adaptador». Las demás reglas que el plan pone en ese criterio (interfaces/adaptadores, `node:fs`, `bun:sqlite`) provienen de la tabla de reglas de ADR-058, no de la ficha. *Fundamento:* `RNF-03.md` (CA-1); ADR-058 (tabla de reglas de dependencia).
6. **T0-12, `Sec-Fetch-Site`.** El plan solo prueba el rechazo de `cross-site`. ADR-062 C7 rechaza `cross-site` **o `same-site`** en todas las rutas y admite `same-origin`, `none` y la ausencia del encabezado. Se agrega el caso `same-site`. *Fundamento:* ADR-062 C7.
7. **T0-11, `bun run esquema` y código de salida.** El plan solo menciona el comando dentro del mensaje de error de `servir`. La guía (paso 6) exige que la creación del esquema sea un comando reproducible y ADR-062 C1 lo declara como script; se agrega su comprobación. Además, el plan pide «código distinto de 0» para `servir` sin esquema; ADR-061 fija **código 1**. *Fundamento:* guía, paso 6; ADR-062 C1; ADR-061 (contrato de salida).
8. **Atribución del `fetch` que falla.** El plan atribuye a ADR-062 C6 el reemplazo de `fetch` por una función que falla. C6 solo manda redirigir variables en la precarga; el reemplazo de `fetch` lo exigen ADR-058 (G-2) y `src/AGENTS.md` §2. La consecuencia para las pruebas de aceptación es D-2. *Fundamento:* ADR-062 C6; ADR-058 G-2.
9. **T0-13, §7 y §8 del README.** El plan limita el README a §3–§6. ADR-065 (regla 9) exige declarar las herramientas auxiliares en §8 y la guía pide las ocho secciones antes de la etiqueta `v1`. Se deja como D-3 en lugar de ampliar el alcance en silencio. *Fundamento:* ADR-065, regla 9; guía §3.

## 14. Dudas para el autor

**D-1 · Códigos estables de error para configuración inválida y puerto ocupado.** El plan los exige (`configuracion-invalida`, `puerto-ocupado`) pero ningún ADR los define; solo existen `almacen-sin-esquema` y `via-no-soportada`, ambos de error de uso con código 1 (ADR-058, contrato de salida). ADR-062 C4 respalda los comportamientos («error de uso visible» y «error que nombra la variable»), no los nombres. *Opciones:* (a) aprobar esos dos nombres y registrarlos (precisión de ADR-062 o ADR nuevo), que es lo que propone el plan; (b) usar solo el comportamiento, sin código nuevo. **Propuesta:** (a), con código de salida 1 en ambos casos. Hasta que decidas, T0-10 y T0-11 afirman solo el comportamiento observable.

**D-2 · Cliente HTTP de las pruebas de aceptación.** ADR-058 (G-2) manda que `fetch` falle en las pruebas, pero T0-11 y T0-12 necesitan pedir `GET /` al servidor en `127.0.0.1`. *Propuesta:* un cliente mínimo en `pruebas/utilidades/` sobre `node:http` (o `Bun.connect`), permitido solo en pruebas — la prohibición de clientes de red rige para `paquetes/` — y el `fetch` global sigue fallando para el código de producto. Confirmar o proponer otra forma.

**D-3 · README §7 y §8 en este incremento.** El plan limita T0-13 a §3–§6, pero ADR-065 (regla 9) exige declarar en §8 el uso de OpenCode con gentle-ai y del sistema de agentes del TIF, y la guía (§3) pide las ocho secciones antes de la etiqueta `v1`. *Propuesta:* completar también §7 (el canal existe) y §8 en T0-13; dejar §2 (caso de uso vertical) para el incremento que lo implemente, y cerrar la declaración de herramientas de §11 en §8 del README.

