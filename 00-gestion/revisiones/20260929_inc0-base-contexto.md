# Base del prompt de contexto · v1 · Incremento 0 · Esqueleto que camina

> **No es el documento ODD del incremento.** Es el plan que redactó el sistema de agentes del TIF el 29/09/2026. Con la precisión de ADR-065 (regla 3), sirve de base para el prompt de contexto: el documento ODD lo propone el agente de OpenCode y se revisa contra este material, los ADR y el catálogo. Las rutas relativas (`../`) están escritas desde `src/`.

- **Estado:** reemplazado por el flujo de ADR-065, regla 3 (29/09/2026)
- **Fecha:** 29/09/2026
- **Iteración:** 1 · tarea «Repositorio, canal de integración continua y entorno de ejecución» (8 h, `../03-requisitos/libro/iteraciones.md`)
- **Rama:** `inc0-esqueleto` (el agente la crea desde `main`; el autor une con `main` y sube)
- **Modo TDD:** estricto, ejecutor `bun test`
- **Revisa:** el sistema de agentes del TIF, sobre el diff de la rama, contra este documento y los ADR

## 1. Objetivo

Que un tercero pueda, en una máquina limpia con Ubuntu o Windows, **instalar, crear el esquema y arrancar** RIGE siguiendo los comandos del README, y que el CI lo acredite en ambas plataformas. No se implementa lógica de resolución: la web responde una página fija.

**Terminado cuando** el CI termina en verde en `ubuntu-latest` y en `windows-latest`, y los comandos de la sección 8 funcionan en el equipo del autor.

## 2. Problema

`src/` solo tiene `README.md`, `AGENTS.md` y `CLAUDE.md`. Según la guía de comprobación, un prototipo que no se instala, no crea su esquema o no arranca en otra máquina **no se computa**, con independencia de lo que haga. Esos pasos (4 a 7 de la guía) son el riesgo principal de la comprobación, sobre todo en Windows.

## 3. Por qué primero

Un esqueleto que camina (Cockburn, 2004) prueba de punta a punta la instalación, el esquema, el arranque y el CI con lógica vacía. Los incrementos siguientes llenan cada capa sobre una base ya verificada en las dos plataformas.

## 4. Fuentes que rigen

| Fuente | Qué se toma |
|---|---|
| `../catedra/AE2-guia-comprobacion-v1.md` | Pasos 4 a 7; §5, contenido mínimo del CI |
| ADR-032 | Bun 1.3.14, GitHub Actions, SQLite embebido |
| ADR-054 | Matriz `ubuntu-latest` + `windows-latest`; fines de línea |
| ADR-058 | Árbol de `src/`, reglas de dependencia, convenciones 3, 5, 6 y 8 |
| ADR-061 | Guion `001_inicial.sql`, `user_version`, pragmas, comando explícito, error `almacen-sin-esquema`, directorio del almacén |
| ADR-062 | Scripts (C1), dependencias exactas y versiones (C3), `rige.env` (C4), versionado (C5), arnés (C6), `Sec-Fetch-Site` (C7) |
| ADR-065 | ODD, TDD estricto, commits solo en la rama del incremento |
| `../03-requisitos/libro/catalogo/RNF-03.md`, `RNF-05.md`, `RNF-09.md` | Criterios que este incremento ya verifica |

Los ADR están en `../00-gestion/decisiones/`.

## 5. Alcance

**Archivos que crea (todos dentro de `src/`):**

```
src/
├── package.json              name "rige", version "0.1.0", private, workspaces ["paquetes/*"], scripts de ADR-062 C1
├── bunfig.toml               instalación aislada (T0-02); [test] preload = ["./pruebas/preparar-entorno.ts"]
├── tsconfig.base.json        strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes, moduleResolution "bundler", module "Preserve", "types": ["bun"]
├── tsconfig.json             referencia a los tres paquetes
├── rige.env.example          RIGE_PUERTO=4747 · RIGE_ALMACEN= (vacío = directorio por defecto), cada una con su comentario
├── .gitignore                node_modules/ · rige.env
├── .gitattributes            * text=auto eol=lf
├── esquemas/almacen/001_inicial.sql
├── paquetes/
│   ├── nucleo/               package.json (@rige/nucleo); tsconfig con "types": [] y lib sin DOM; resultado.ts
│   ├── opencode/             package.json (@rige/opencode, depende de @rige/nucleo); descriptor.ts con la versión soportada
│   └── rige/
│       ├── aplicacion/puertos/configuracion.ts · almacen.ts
│       ├── aplicacion/errores.ts            códigos estables: almacen-sin-esquema, configuracion-invalida, puerto-ocupado
│       ├── adaptadores/sistema/configuracion.ts        lee rige.env y el entorno (solo lectura)
│       ├── adaptadores/almacen-sqlite/esquema.ts       crea el directorio, aplica los guiones, fija y verifica user_version
│       ├── interfaces/web/servidor.ts · intermedios/origen.ts · intermedios/errores.ts · paginas/inicio.ts
│       ├── interfaces/cli/ejecutar.ts                  subcomandos esquema y servir con util.parseArgs
│       └── arranque/rige.ts                            único punto de ensamblado
└── pruebas/
    ├── preparar-entorno.ts   precarga (ADR-062 C6)
    ├── utilidades/entorno-aislado.ts                   construye el entorno del subproceso
    ├── escenarios/.gitkeep
    ├── arquitectura/
    └── aceptacion/
```

**Precisiones:**

- **`nucleo` con `"types": []`** y sin `DOM` en `lib`: una referencia a `Bun`, `fetch` o `process` en el núcleo falla en la verificación de tipos.
- **El guion SQL se importa como texto** (`import guion from "…/001_inicial.sql" with { type: "text" }`; verificado en el equipo del autor con Bun 1.3.14).
- **`001_inicial.sql`**: las tres tablas, restricciones, índices y disparadores de inmutabilidad de ADR-061. Termina en `PRAGMA user_version = 1` y se aplica en una transacción.
- **Directorio del almacén:** `esquema.ts` lo crea con `mkdirSync(…, { recursive: true })`. Es el único uso de `node:fs` admitido en ese módulo (ADR-061).
- **Conexión:** `foreign_keys = ON`, `journal_mode = WAL`, `busy_timeout` y `secure_delete = ON`.
- **`bun run servir`:** verifica `user_version` antes de escuchar; si falta o no coincide, termina con `almacen-sin-esquema` y nombra `bun run esquema`. Escucha en `127.0.0.1` y en `RIGE_PUERTO`; si está ocupado, termina con `puerto-ocupado` y nombra la variable.
- **`GET /`:** página HTML fija con «RIGE 0.1.0» y la ruta del almacén en uso.
- **`bun run rige -- <otro subcomando>`:** error de argumentos, código 2.
- **Dependencias:** solo `typescript` 7.0.2 y `@types/bun` 1.3.14, exactas (`bun add -d -E`).
- **Ya existe, no se toca:** `../.github/workflows/ci.yml` (lo creó el autor; corre `bun install --frozen-lockfile`, `bun run verificar` y `bun test` en `src/`, en Ubuntu y Windows).

**Fuera de alcance:** lógica del núcleo; adaptador (lectura, vías, secuencia); `jsonc-parser`; copia atribuida en `vendor/`, `LICENSE` y `NOTICE`; subcomandos `valor`, `permiso` y `hallazgos`; formulario web; escenario `rf-01-tres-entradas`; resultado de referencia.

## 6. Restricciones

- Rige `src/AGENTS.md` completo. Identificadores, carpetas y mensajes en español, sin tildes ni ñ en los identificadores.
- Solo se escribe dentro de `src/`.
- Commits solo en la rama `inc0-esqueleto`, uno por tarea, con Conventional Commits. **Nunca** subir, unir con `main` ni crear etiquetas.
- No crear `opencode.json`, `opencode.jsonc` ni `.opencode/` en ninguna carpeta del repositorio.
- No agregar dependencias fuera de las de la sección 5.

**Detenerse y preguntar si:**
- una verificación de T0-01 a T0-03 contradice un ADR;
- una prueba de arquitectura exige relajar una regla de ADR-058;
- hace falta escribir fuera de `src/` o agregar una dependencia;
- el CI en Windows falla por una causa que no se resuelve dentro de `src/`.

## 7. Tareas

Cada tarea de código se hace en TDD estricto: la prueba se escribe primero, se la ve fallar, se escribe el mínimo código que la hace pasar y se refactoriza. Se marca `[x]` solo con la evidencia observada, registrada en las secciones 9 y 10.

**Verificaciones previas (sin código):**

- [ ] **T0-01 · Bun no carga `rige.env`.** Crear un `rige.env` temporal con `RIGE_PRUEBA=1` y ejecutar `bun -e "console.log(process.env.RIGE_PRUEBA)"`. *Criterio:* imprime `undefined`. Si imprime `1`, detenerse (condición de invalidación de ADR-062, C4).
- [ ] **T0-02 · Clave de instalación aislada en `bunfig.toml` de Bun 1.3.14** (ADR-058 cita `install.hoist = false`; puede ser `linker = "isolated"`). *Criterio:* clave vigente identificada en la documentación de Bun 1.3.14. Si no existe instalación aislada, detenerse.
- [ ] **T0-03 · Desactivar la carga automática de `.env`.** *Criterio:* se sabe si `bunfig.toml` de Bun 1.3.14 lo admite. Si lo admite, se configura; si no, se anota y se sigue.

**Pruebas y código (en este orden):**

- [ ] **T0-04 · Aislamiento del entorno de pruebas** — `pruebas/arquitectura/entorno.test.ts` y `pruebas/preparar-entorno.ts`. *Criterio:* `HOME`, `USERPROFILE`, `XDG_*`, `LOCALAPPDATA`, `APPDATA` y `RIGE_ALMACEN` apuntan a un temporal; las `OPENCODE_*` están vacías; `fetch` global falla (ADR-062 C6; RNF-05).
- [ ] **T0-05 · Reglas de dependencia** — `pruebas/arquitectura/dependencias.test.ts`. *Criterio:* recorriendo los imports con `Bun.Transpiler().scanImports`, el núcleo no importa nada externo ni de otros paquetes; `interfaces` no importa `adaptadores`; solo `adaptadores/sistema` importa `node:fs`, salvo `mkdirSync` en `adaptadores/almacen-sqlite`; solo `adaptadores/almacen-sqlite` importa `bun:sqlite` (**RNF-03 CA-1**).
- [ ] **T0-06 · Sin identificaciones de la herramienta en el núcleo** — `pruebas/arquitectura/identificaciones.test.ts`. *Criterio:* ningún archivo de `paquetes/nucleo` contiene `opencode` ni `OPENCODE_`, sin distinguir mayúsculas (**RNF-03 CA-2**).
- [ ] **T0-07 · Sin clientes de red** — `pruebas/arquitectura/red.test.ts`. *Criterio:* ningún archivo de `paquetes/` importa `node:http`, `node:https`, `node:net`, `node:tls`, `node:dgram` ni `undici`, ni usa `fetch(` o `WebSocket` (**RNF-05**).
- [ ] **T0-08 · Guarda del repositorio** — `pruebas/arquitectura/repositorio.test.ts`. *Criterio:* entre `pruebas/escenarios/` y la raíz del repositorio no hay `opencode.json`, `opencode.jsonc` ni `.opencode/` (ADR-062 C6).
- [ ] **T0-09 · Esquema del almacén** — `paquetes/rige/adaptadores/almacen-sqlite/esquema.test.ts`. *Criterio:* con `RIGE_ALMACEN` en una carpeta inexistente, la carpeta se crea; base vacía → `user_version = 1` y las tres tablas; segunda aplicación sin cambios; `foreign_keys` activo; `UPDATE` sobre `resolucion` rechazado (ADR-061, pruebas 3 y 5).
- [ ] **T0-10 · Configuración propia** — `paquetes/rige/adaptadores/sistema/configuracion.test.ts`. *Criterio:* prelación entorno → `rige.env` → valores por defecto; `OPENCODE_X` en `rige.env` da `configuracion-invalida`; puerto no numérico da `configuracion-invalida` (ADR-062 C4).
- [ ] **T0-11 · Arranque** — `pruebas/aceptacion/arranque.test.ts`, por subproceso. *Criterio:* `servir` sin esquema termina con código distinto de 0 y un mensaje que nombra `bun run esquema`; con el puerto ocupado nombra `RIGE_PUERTO`; con el esquema creado responde 200 en `/` (ADR-061; ADR-062 C4; guía, paso 7).
- [ ] **T0-12 · Seguridad de la web** — `pruebas/aceptacion/RNF-09.test.ts`, por subproceso, puerto libre. *Criterio:* `Host: evil.example` → rechazo sin datos (**RNF-09 CA-1**); `POST /` → rechazo (**CA-2**); ninguna cabecera `Access-Control-*` (**CA-3**); `Sec-Fetch-Site: cross-site` → rechazo; `same-origin`, `none` y ausente → 200 (ADR-062 C7).
- [ ] **T0-13 · README** — `src/README.md` §3 a §6 con los comandos de la sección 8 y las versiones (Bun 1.3.14, TypeScript 7.0.2, SQLite 3.53.0 integrado en Bun). *Criterio:* cada comando que usan las pruebas y el CI figura en el README.

Cada subproceso recibe un entorno construido con `pruebas/utilidades/entorno-aislado.ts` y nunca hereda `process.env`, salvo `PATH` y `SystemRoot`. El puerto de las pruebas se obtiene libre en cada corrida; nunca se usa el 4747.

## 8. Comandos de verificación

```bash
cd src
bun install --frozen-lockfile
bun run verificar
bun test
bun run esquema
bun run servir        # http://127.0.0.1:4747
```

## 9. Evidencia

**Verificaciones hechas antes del incremento** (sistema de agentes del TIF, 29/09/2026):

| # | Resultado |
|---|---|
| Bun | 1.3.14 (`+0d9b296af`) en `%USERPROFILE%\.bun\bin`; ZIP oficial `0a062093…` = `SHASUMS256.txt`; binario `0187f68d…` |
| TypeScript | 7.0.2 con `@types/bun` 1.3.14 y `"types": ["bun"]`: verificación limpia sin `skipLibCheck`; error intencional detectado |
| SQLite | 3.53.0; `json_valid('{}')` = 1; importación de `.sql` como texto funciona |

**Verificaciones T0-01 a T0-03** (las completa el agente):

| Tarea | Resultado | Fecha |
|---|---|---|
| T0-01 | | |
| T0-02 | | |
| T0-03 | | |

**Tabla TDD** (una fila por tarea de código):

| Tarea | Prueba escrita (rojo: salida observada) | Implementación (verde) | Refactorización | Commit |
|---|---|---|---|---|
| T0-04 | | | | |
| T0-05 | | | | |
| T0-06 | | | | |
| T0-07 | | | | |
| T0-08 | | | | |
| T0-09 | | | | |
| T0-10 | | | | |
| T0-11 | | | | |
| T0-12 | | | | |
| T0-13 | — | | | |

**Cierre:** salida de `bun run verificar` y `bun test` en el equipo del autor, y enlace a la corrida del CI una vez subida la rama.

## 10. Progreso

Sin iniciar.

## 11. Siguiente paso

Aprobación del autor. Después, abrir OpenCode en `src/` y retomar este documento desde T0-01.
