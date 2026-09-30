# Incremento 0 · Esqueleto que camina — Documento ODD

| Campo | Valor |
|---|---|
| Estado | Aprobado; T0-01–T0-03 verificadas secuencialmente, dos veces cada una. T0-04 implementada y verificada localmente; construcción completa pendiente de T0-11a. T0-05 y posteriores no iniciadas. |
| Fecha | Propuesta: 29/09/2026; revisión documental y aplicación de correcciones aprobadas: 30/09/2026 |
| Rama | `inc0-esqueleto`, ya creada; commit inicial del documento `d9e7dee` |
| TDD | Estricto. Fuente: `src/AGENTS.md` §7 y ADR-065 (regla 4). Ejecutor: `bun test` |
| Entrega | Una sola rama, sin solicitudes de integración. El agente nunca sube, une con `main` ni crea etiquetas (ADR-065, regla 5) |
| Fuentes | Plan `../00-gestion/revisiones/20260929_inc0-base-contexto.md` (propuesta, no orden); ADR-032, ADR-054, ADR-058, ADR-061, ADR-062, ADR-065, ADR-066 aceptado (`../00-gestion/decisiones/`); fichas `../03-requisitos/libro/catalogo/RNF-03.md`, `RNF-05.md`, `RNF-09.md`; guía `../catedra/AE2-guia-comprobacion-v1.md` (pasos 4 a 7 y §5); `../.github/workflows/ci.yml` (existente, no se modifica) |

## 1. Objetivo

Que un tercero, en una máquina limpia con Ubuntu o Windows, pueda instalar RIGE, crear el esquema del almacén y arrancar el servidor siguiendo solo los comandos del README, y que el CI lo acredite en las dos plataformas. No hay lógica de resolución: la web responde una página fija.

**Terminado cuando** el CI termina en verde en `ubuntu-latest` y `windows-latest` y los comandos de §9 funcionan en el equipo del autor siguiendo únicamente `src/README.md` (guía, pasos 4 a 7).

## 2. Problema

En la revisión documental, `src/` contiene `README.md`, `AGENTS.md`, `CLAUDE.md` y este documento `odd/tasks/inc0-esqueleto.md`; no contiene implementación. Un prototipo que no se instala, no crea su esquema o no arranca en otra máquina no se computa, con independencia de lo que haga (guía: la cátedra no interpreta ni suple pasos faltantes). Los pasos 4 a 7 son el riesgo principal de la comprobación. La matriz de CI acredita automáticamente Ubuntu y Windows; no sustituye la comprobación nativa en Windows 11 declarada por ADR-054 ni constituye evidencia de una corrida en esta sesión.

## 3. Por qué primero

Un esqueleto que camina (Cockburn, 2004) prueba de punta a punta instalación, esquema, arranque y CI con lógica vacía. Los incrementos siguientes llenan cada capa sobre una base ya verificada en las dos plataformas. Corresponde a la tarea de la iteración 1 «Repositorio, canal de integración continua y entorno de ejecución» (`../03-requisitos/libro/iteraciones.md`, Tabla 18).

## 4. Alcance

### 4.1 Archivos previstos para la implementación (todos dentro de `src/`)

```
src/
├── package.json · bunfig.toml · tsconfig.base.json · tsconfig.json
├── rige.env.example · .gitignore · .gitattributes
├── esquemas/almacen/001_inicial.sql
├── paquetes/
│   ├── nucleo/    package.json (@rige/nucleo) · tsconfig.json · resultado.ts
│   ├── opencode/  package.json (@rige/opencode) · tsconfig.json · descriptor.ts
│   └── rige/      package.json (@rige/rige) · tsconfig.json
│       ├── aplicacion/puertos/configuracion.ts · almacen.ts
│       ├── aplicacion/errores.ts
│       ├── aplicacion/casos-uso/preparar-almacen.ts · preparar-almacen.test.ts
│       ├── aplicacion/casos-uso/consultar-estado.ts · consultar-estado.test.ts
│       ├── aplicacion/respuestas/estado.ts
│       ├── adaptadores/sistema/configuracion.ts
│       ├── adaptadores/sistema/configuracion.test.ts
│       ├── adaptadores/almacen-sqlite/esquema.ts
│       ├── adaptadores/almacen-sqlite/esquema.test.ts
│       ├── interfaces/web/servidor.ts · intermedios/origen.ts · intermedios/errores.ts
│       ├── interfaces/web/paginas/inicio.ts · paginas/inicio.test.ts
│       ├── interfaces/web/plantillas.ts · plantillas.test.ts
│       ├── interfaces/cli/ejecutar.ts
│       └── arranque/rige.ts
└── pruebas/
    ├── preparar-entorno.ts · escenarios/.gitkeep
    ├── utilidades/entorno-aislado.ts · cliente-http-local.ts · cliente-http-local.test.ts
    ├── utilidades/analisis-arquitectura.ts
    ├── arquitectura/entorno.test.ts · dependencias.test.ts · identificaciones.test.ts
    ├── arquitectura/red.test.ts · repositorio.test.ts
    └── aceptacion/RNF-03.test.ts · arranque.test.ts · RNF-09.test.ts
```

`bun.lock` se genera con `bun install` y se versiona (ADR-062, C3). `package.json` raíz: `name "rige"`, `version "0.1.0"`, `private`, `workspaces ["paquetes/*"]` y los scripts de ADR-062 C1.

`README.md` ya existe: documenta progresivamente comandos en §3–§8 y se completa en T0-13; `AGENTS.md` y `CLAUDE.md` ya existen y no se modifican. Commit documental inicial: `d9e7dee`. El mapa exhaustivo archivo → tarea está en §6.1.

### 4.2 Precisiones

- **`nucleo` con `"types": []`** y sin `DOM` en `lib`: una referencia a `Bun`, `fetch` o `process` en el núcleo falla en la verificación de tipos (ADR-062, C3).
- **Workspace:** un manifiesto y un `tsconfig.json` por paquete (ADR-058 P-2); `nucleo` sin dependencias, `opencode` declara únicamente `@rige/nucleo` y `rige` declara los paquetes locales que ensambla. No son bibliotecas externas. `tsconfig.base.json` fija `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `moduleResolution: "bundler"` y `module: "Preserve"`; los paquetes con runtime usan `"types": ["bun"]`. T0-04 conecta las referencias raíz con la verificación efectiva de los tres paquetes, sin `skipLibCheck`.
- **`bunfig.toml`:** `[install] linker = "isolated"`; T0-02 verificó esta clave en Bun 1.3.14. No agregar `hoist = false`: esa versión ignora la clave (§11.2). `env = false` en la raíz es compatible y está verificado por T0-03 (§11.3); se escribe antes de las tablas. `[test] preload = ["./pruebas/preparar-entorno.ts"]`. El bunfig del repositorio se crea en T0-04.
- **Casos de uso y paridad:** `preparar-almacen` crea o verifica explícitamente el esquema mediante el puerto; `consultar-estado` consulta la ruta del almacén y la versión de su esquema, y devuelve `Resultado` con el objeto de respuesta de `aplicacion/respuestas/estado.ts` (`esquema: 1`, versión de RIGE, ruta y versión del esquema de base). No confundir esos números (ADR-062 C5). La CLI serializa ese objeto y la página de inicio lo presenta, sin recalcular estado ni acceder a puertos. No se crea una Resolución ni se ejecuta lógica de resolución.
- **Ensamblado y E/S:** `arranque/rige.ts` solo construye adaptadores, inyecta puertos en los casos de uso y conecta las interfaces. No coordina casos de uso ni lee archivos ni abre SQLite. La lectura de `rige.env` y del entorno ocurre en `adaptadores/sistema`, con entorno inyectado en las unitarias; la creación del directorio y toda E/S de SQLite, en `adaptadores/almacen-sqlite`. Los puertos no exponen SQLite ni capacidades de escritura sobre entradas. La E/S propia de las interfaces (argumentos con `node:util.parseArgs`, canales de CLI y servidor local con `Bun.serve`) no es un cliente saliente. Los errores de uso son `Resultado`; las excepciones de infraestructura se capturan una sola vez en el borde de la CLI o en `conErrores`, nunca como estado plausible del dominio (ADR-058 M-2 y convenciones 1, 3, 6 y 8).
- **El guion SQL se importa como texto** (`import guion from "…/001_inicial.sql" with { type: "text" }`), compatibilidad medida en el equipo del autor con Bun 1.3.14 (ADR-062, verificación sobre el tag).
- **`001_inicial.sql`:** las tres tablas (`proyecto`, `resolucion`, `entrada_leida`), restricciones, índices y disparadores de inmutabilidad de ADR-061. Termina en `PRAGMA user_version = 1` y se aplica en una transacción. Los nombres de columna son ajustables sin ADR nuevo, conservando las restricciones (ADR-061).
- **Directorio del almacén:** `esquema.ts` lo crea con `mkdirSync(…, { recursive: true })`. Es el único uso de `node:fs` admitido en ese módulo, y solo para crear su propio directorio (ADR-061).
- **Conexión:** `foreign_keys = ON` en cada conexión, `journal_mode = WAL`, `busy_timeout` y `secure_delete = ON` (ADR-061).
- **`bun run servir`:** invoca `consultar-estado` antes de escuchar; si falta la base o no coincide `user_version`, termina con `almacen-sin-esquema` (código 1), cuyo mensaje nombra `bun run esquema`. Esta consulta no crea ni migra una base ausente o incompatible. Escucha solo en `127.0.0.1` y en `RIGE_PUERTO`; si el puerto está ocupado, termina con `puerto-ocupado` (código 1), cuyo mensaje nombra la variable. ADR-066 aceptado y confirmado por el autor respalda estos códigos; T0-10 y T0-11a/T0-11b están desbloqueadas (§14 D-1).
- **`GET /`:** página de estructura fija con «RIGE 0.1.0», ruta del almacén y versión de su esquema, obtenidas del objeto de respuesta de `consultar-estado`. HTML del servidor, sin JavaScript de cliente. `plantillas.ts` escapa todo valor por defecto; HTML sin escapar solo mediante función explícita usada por plantillas fijas. Se prueba un valor con `<script>` como texto (ADR-062 C2).
- **`bun run rige -- <otro subcomando>`:** error de argumentos, código 2 (ADR-058, contrato de salida).
- **Dependencias:** solo `typescript` 7.0.2 y `@types/bun` 1.3.14, exactas, de desarrollo (`bun add -d -E`). Ninguna de ejecución en este incremento (`jsonc-parser` 3.3.1 llega con el adaptador) (ADR-062 C3).
- **Ya existe, no se toca:** `../.github/workflows/ci.yml` corre `bun install --frozen-lockfile`, `bun run verificar` y `bun test` en `src/`, con matriz `ubuntu-latest` y `windows-latest`. Coincide con ADR-054 y con el §5 de la guía.

### 4.3 Fuera de alcance

Lógica del núcleo; adaptador (lectura, vías, secuencia); `jsonc-parser`; copia atribuida en `vendor/`, `LICENSE` y `NOTICE`; subcomandos `valor`, `permiso` y `hallazgos`; formulario web; escenario `rf-01-tres-entradas`; resultado de referencia; chequeo de versión de OpenCode (RF-05, código 3): `descriptor.ts` solo declara la constante. Las pruebas 1, 2 y 4 de ADR-061 (ida y vuelta, retención y RNF-04 sobre el almacén) requieren el camino de escritura de la Resolución y quedan para el incremento que lo implemente.

## 5. Restricciones

- Rige `src/AGENTS.md` completo. Identificadores, carpetas y casos de uso en español, sin tildes ni ñ en los identificadores (ADR-058, I-1).
- Las cinco restricciones no negociables de `src/AGENTS.md` §2 (RNF-01, RNF-02, RNF-03, RNF-04, RNF-05).
- Solo se escriben archivos del repositorio dentro de `src/`. Los datos de ejecución van a temporales del sistema y se eliminan al terminar. Toda ejecución runtime del agente fija `RIGE_ALMACEN` en un temporal; nunca usa el almacén real del autor (ADR-066; D-4).
- Commits solo en la rama `inc0-esqueleto`, uno por tarea, con Conventional Commits. Nunca subir, unir con `main` ni crear etiquetas.
- No crear `opencode.json`, `opencode.jsonc` ni `.opencode/` en los ancestros entre `pruebas/escenarios/` y la raíz del repositorio (ADR-062 C6); nunca en `src/`. Los escenarios anidados quedan para incrementos posteriores y se copian a un temporal antes de analizarse.
- No agregar bibliotecas externas fuera de las declaradas en §4.2. Toda dependencia nueva requiere autorización del autor y registro en un ADR (ADR-062 C3).
- Commit inicial de la rama ya creado: `d9e7dee`, solo este documento, mensaje `docs: documento ODD del incremento 0`. El autor requiere un commit documental por T0-01–T0-03 y luego uno por tarea de implementación. Staging solo de rutas autorizadas explícitas dentro de `src/`; nunca `git add -A` ni `git add .`. Esta delegación implementa solo T0-04 en la rama existente.
- No se modifica `../.github/workflows/ci.yml`.
- **Método TDD:** por cada tarea de código, la prueba se escribe primero, se la ve fallar, se escribe el mínimo código que la hace pasar y se refactoriza (ADR-065, regla 4; `src/AGENTS.md` §7). La evidencia (rojo, verde, refactorización, commit) se registra en §11.
  - *Precisión:* cuando el código existente ya satisface la prueba (típico en pruebas de arquitectura), el rojo se observa con una mutación temporal revertida y así se registra.
- **Pronóstico anterior, no medición:** la propuesta original estimó unas 2.500 líneas autoradas (altas + bajas, sin `bun.lock`). No se recalculó después de reconciliar casos de uso y pruebas; no es una estimación vigente por tarea ni evidencia de ejecución. La entrega sigue siendo una sola rama, sin solicitudes de integración ni estrategia de cadena. Cada unidad mantiene juntas prueba e implementación y se registra su tamaño real al ejecutarla.

**Detenerse y preguntar si:**

- una verificación de T0-01 a T0-03 contradice un ADR;
- una prueba de arquitectura exige relajar una regla de ADR-058;
- hace falta escribir archivos del repositorio fuera de `src/`, usar datos de ejecución fuera de los temporales autorizados o agregar una dependencia;
- el CI en Windows falla por una causa que no se resuelve dentro de `src/`.

## 6. Tareas

Cada tarea de código se hace en TDD estricto (§5) y se marca `[x]` solo con la evidencia observada de §11.

### Verificaciones previas (sin código; un commit de evidencia documental por tarea)

- [x] **T0-01 · Bun no carga `rige.env`.** Crear un `rige.env` con `RIGE_PRUEBA=1` en un directorio temporal del sistema y ejecutar `bun -e "console.log(process.env.RIGE_PRUEBA)"` con ese directorio como cwd. *Criterio:* imprime `undefined`. Si imprime `1`, detenerse: ADR-062 C4 prevé cambiar el nombre del archivo y el asunto pasa al autor.
- [x] **T0-02 · Instalación aislada en Bun 1.3.14.** Fijar explícitamente `[install] linker = "isolated"` y añadir `hoist = false` si esa versión lo admite. *Criterio:* verificar las claves en Bun 1.3.14 y comprobar que un import no declarado falla; registrar el resultado y la compatibilidad de `hoist`. Verificada dos veces con paquetes locales; `linker` reconocido, `hoist` ignorado (§11.2). Si no se obtiene aislamiento efectivo o surge contradicción con ADR-058, detenerse.
- [x] **T0-03 · Desactivar la carga automática de `.env`.** *Criterio:* se sabe si `bunfig.toml` de Bun 1.3.14 lo admite. Si lo admite, se configura como defensa adicional; si no, se anota y se sigue (ADR-062 C4). `env = false` raíz verificado dos veces en bunfig temporal; su aplicación al repositorio se difirió a T0-04 por el límite de no escribir fuentes de la delegación previa (§11.3).

### Pruebas y código (en este orden)

- [x] **T0-04 · Andamiaje del workspace y aislamiento del entorno de pruebas** — archivos base y pruebas de §6.1, incluido `bun.lock` y `escenarios/.gitkeep`. *Criterio:* manifiestos y tsconfigs por paquete; versiones exactas; scripts de ADR-062 C1; precarga conectada; `HOME`, `USERPROFILE`, `XDG_CONFIG_HOME`, `XDG_DATA_HOME`, `XDG_STATE_HOME`, `XDG_CACHE_HOME`, `LOCALAPPDATA`, `APPDATA` y `RIGE_ALMACEN` apuntan a un temporal; las `OPENCODE_*` quedan vacías; `fetch` global falla; herencia solo `PATH` y `SystemRoot` en los subprocesos. `.gitignore` excluye `node_modules/` y `rige.env`; `.gitattributes` fija `* text=auto eol=lf`. La primera generación del lock usa `bun install`; su comprobación y el CI usan `bun install --frozen-lockfile` (ADR-062 C3/C6; ADR-058 G-2). No modificar `process.env` desde pruebas unitarias: la redirección es responsabilidad exclusiva de la precarga.
- [ ] **T0-05 · Reglas de dependencia** — análisis de imports con `Bun.Transpiler().scanImports` en el módulo común `pruebas/utilidades/analisis-arquitectura.ts`, importado directamente por `pruebas/arquitectura/dependencias.test.ts` y `pruebas/aceptacion/RNF-03.test.ts` (`describe("RNF-03 CA-1", …)`). No se duplican análisis ni se lanzan subprocesos para guardas estáticas. *Criterio:* matriz completa de ADR-058: núcleo sin imports externos, paquetes ajenos ni módulos del runtime con E/S; `opencode` solo depende del núcleo y bibliotecas autorizadas; aplicación solo del núcleo y sus módulos internos; adaptadores solo de puertos de aplicación y dominio del núcleo; interfaces solo de casos de uso, respuestas y traducción de errores de aplicación, nunca de `aplicacion/puertos`, adaptadores ni núcleo directamente; arranque es el único ensamblador. Controlar rutas relativas, aliases y dependencias de manifiestos, no solo nombres literales. Solo sistema importa `node:fs` para leer; en almacén solo `mkdirSync` para su directorio, sin imports amplios que eludan la guarda; solo almacén importa `bun:sqlite`. Código mínimo: `resultado.ts`, ambos puertos, `descriptor.ts` y error `almacen-sin-esquema` ya respaldado por ADR-061; los casos de uso y respuestas se implementan en T0-09/T0-11a y también deben pasar esta guarda. Verificar con infracciones temporales revertidas que las prohibiciones fallan, no solo con carpetas todavía vacías.
- [ ] **T0-06 · Sin identificaciones de la herramienta en el núcleo** — ampliar `pruebas/utilidades/analisis-arquitectura.ts` con el análisis de identificaciones, importado directamente por `pruebas/arquitectura/identificaciones.test.ts` y `pruebas/aceptacion/RNF-03.test.ts` (`describe("RNF-03 CA-2", …)`), sin subprocesos ni duplicación del análisis. *Criterio:* ningún archivo de código de `paquetes/nucleo` contiene `opencode` ni `OPENCODE_`, sin distinguir mayúsculas. CA-3 (adaptador ficticio) queda para el incremento del contrato y motor, sin declararlo cubierto aquí.
- [ ] **T0-07 · Sin clientes de red** — `pruebas/arquitectura/red.test.ts`. *Criterio:* ningún archivo de `paquetes/` importa `node:http`, `node:https`, `node:net`, `node:tls`, `node:dgram` ni `undici`, ni usa `fetch(` o `WebSocket` (ADR-058, G-2 y tabla de reglas). Las CA-1 y CA-2 de RNF-05 exigen un análisis completo y quedan en la iteración 3 (ficha RNF-05).
- [ ] **T0-08 · Guarda del repositorio** — `pruebas/arquitectura/repositorio.test.ts`. *Criterio:* entre `pruebas/escenarios/` y la raíz del repositorio no hay `opencode.json`, `opencode.jsonc` ni `.opencode/` (ADR-062 C6).
- [ ] **T0-09 · Esquema del almacén y caso de uso de preparación** — SQL, adaptador, `aplicacion/casos-uso/preparar-almacen.ts` y unitarias de §6.1. *Criterio:* con almacén en una carpeta inexistente, la preparación explícita la crea; base vacía → `user_version = 1` y tres tablas; segunda aplicación sin cambios; versión incompatible → error de uso, sin migración silenciosa. Verificar todas las restricciones e índices de ADR-061, `foreign_keys` en cada conexión, WAL, `busy_timeout`, `secure_delete`, transacción e inmutabilidad tanto de `resolucion` como de `entrada_leida`. El caso de uso se prueba con puertos dobles en memoria, sin runtime ni E/S; el adaptador, con base temporal. No agregar escritura o retención de Resoluciones.
- [ ] **T0-10 · Configuración propia** — ampliar `aplicacion/errores.ts` con los códigos de D-1; `adaptadores/sistema/configuracion.ts` y su unitaria. **Desbloqueada: el autor confirmó ADR-066 aceptado (D-1/D-4).** *Criterio:* prelación entorno → `rige.env` → valores por defecto; leer explícitamente el archivo; solo admitir `RIGE_PUERTO` y `RIGE_ALMACEN`, rechazar otras variables (incluidas `OPENCODE_*`) y puerto inválido con `configuracion-invalida`, salida 1. Puerto por defecto 4747; `RIGE_ALMACEN` es un directorio, no el nombre de la base; vacío usa la ubicación de ADR-058 convención 5, comprobada con entorno inyectado para Ubuntu y Windows (ADR-062 C4). No leer configuración personal ni usar `.env`.
- [ ] **T0-11a · Estado, contrato completo de CLI y arranque** — archivos de §6.1; `consultar-estado` con unitaria y aceptación de CLI por subproceso. **Depende de T0-09 y T0-10; desbloqueada por ADR-066 confirmado.** *Criterio:* definir el objeto de respuesta compartido de aplicación; `consultar-estado` sin base o con versión distinta devuelve `almacen-sin-esquema` y mensaje `bun run esquema`, sin crear ni alterar el esquema. `bun run esquema` crea/verifica reproduciblemente. CLI: subcomando desconocido → stdout vacío, JSON de error en stderr y salida 2; errores de uso → stdout vacío, JSON en stderr y salida 1; respuesta válida → JSON en stdout, stderr vacío y salida 0; defecto interno → stdout vacío, JSON `interno` en stderr y salida 70, stack solo con `--depurar`, sin logs a disco. Leer argumentos con `node:util.parseArgs`. Comprobar el contrato aplicable al esqueleto; RF-05/código 3 y comandos de resolución permanecen fuera de alcance (§4.3). `arranque/rige.ts` ensambla los adaptadores, casos de uso y CLI de esta tarea, sin depender de módulos web todavía no implementados ni coordinar casos de uso; T0-11b extenderá el ensamblado para web.
- [ ] **T0-11b · Servidor, página de inicio y cliente HTTP de pruebas** — archivos de §6.1; inicio con unitaria, cliente de D-2 y aceptación del servidor por subproceso. **Depende de T0-11a; desbloqueada por ADR-066 confirmado.** *Criterio:* la página presenta el mismo objeto de respuesta que la CLI; ampliar `arranque/rige.ts` para ensamblar la web sin alterar la dirección de dependencias. `servir` sin base o con versión distinta da `almacen-sin-esquema`, salida 1 y mensaje `bun run esquema`, sin crear ni alterar el esquema; puerto ocupado da `puerto-ocupado`, salida 1 y mensaje `RIGE_PUERTO`; base compatible → 200 en `/` con ruta y versión de esquema. Crear el ayudante mínimo de escape y probarlo antes de usarlo en inicio. Agregar `pruebas/utilidades/cliente-http-local.ts`, único módulo cliente `node:http`, y su unitaria: basta comparar literalmente el destino con `127.0.0.1` antes de conectar y una prueba negativa para un destino distinto, sin ampliar los casos del cliente. La cabecera `Host` adversaria no cambia el destino TCP; `fetch` global continúa fallando.
- [ ] **T0-12 · Seguridad y plantillas web** — `interfaces/web/intermedios/origen.ts`, `interfaces/web/plantillas.ts`, su unitaria y `pruebas/aceptacion/RNF-09.test.ts`, con cliente de T0-11b y puerto libre. **Depende de T0-11b.** *Criterio:* permitir solo `Host: 127.0.0.1:<puerto>` o `localhost:<puerto>`; nombre ajeno, puerto distinto o Host ausente → rechazo sin datos (**RNF-09 CA-1**); método distinto de GET → rechazo (**CA-2**); ninguna cabecera `Access-Control-*` en respuestas válidas, rechazos, errores ni rutas inexistentes (**CA-3**). Rechazar `Sec-Fetch-Site: cross-site` y `same-site` en todas las rutas; permitir `same-origin`, `none` y ausente (ADR-062 C7). Validar que los controles envuelven al enrutador completo. Escape por defecto de valores con `<script>` y caracteres HTML, incluido el estado mostrado por inicio; sin JavaScript de cliente (ADR-062 C2).
- [ ] **T0-13 · README** — completar `src/README.md` **§3 a §8**, sin completar §2 (caso vertical futuro). *Criterio:* comandos de §9, preparación del lock para desarrollo, configuración por `rige.env.example` (corregir la mención actual a `.env.example`), significado de ambas variables, esquema explícito, dirección local y verificación del esqueleto; versiones Bun 1.3.14, TypeScript 7.0.2, `@types/bun` 1.3.14 y SQLite 3.53.0 integrado. §7 describe canal y registro de corridas sin afirmar un verde aún no observado; §8 declara herramientas, agentes, modelos, función y artefactos **por período**, según §11 y ejecución real. Correspondencia prevista `v1`/`0.1.0`, sin crear etiqueta. Documentar todo comando necesario para instalar, configurar, ejecutar o probar en Ubuntu y Windows, incluido `bun run rige -- <subcomando>` (ADR-062 C1–C5; ADR-065 regla 9; D-3).

La exigencia de subprocesos de `src/AGENTS.md` §6 se aplica a las pruebas que lanzan CLI o servidor, no a las guardas estáticas de RNF-03, que importan el módulo común. Cada subproceso de CLI/servidor recibe un entorno construido con `pruebas/utilidades/entorno-aislado.ts` y nunca hereda `process.env`, salvo `PATH` y `SystemRoot`. El puerto de las pruebas se obtiene libre en cada corrida; nunca se usa el 4747 (ADR-062 C6). Toda ejecución runtime del agente fija `RIGE_ALMACEN` en un temporal del sistema; al terminar se cierran procesos y conexiones y se eliminan los temporales (ADR-066).

### 6.1 Mapa reconciliado archivo → tarea

Todas las rutas se expresan desde `src/`. Las unitarias se escriben antes que el archivo que prueban; compartir archivo entre tareas no autoriza cambios ajenos a su criterio.

| Archivo o conjunto enumerado | Tarea responsable |
|---|---|
| `odd/tasks/inc0-esqueleto.md` | Commit inicial `d9e7dee`; evidencia documental actualizada por tarea |
| `package.json`, `bun.lock`, `bunfig.toml`, `tsconfig.base.json`, `tsconfig.json`, `rige.env.example`, `.gitignore`, `.gitattributes` | T0-04, con resultados previos T0-01–T0-03 |
| `paquetes/nucleo/package.json`, `paquetes/nucleo/tsconfig.json` | T0-04 |
| `paquetes/opencode/package.json`, `paquetes/opencode/tsconfig.json` | T0-04 |
| `paquetes/rige/package.json`, `paquetes/rige/tsconfig.json` | T0-04 |
| `pruebas/preparar-entorno.ts`, `pruebas/utilidades/entorno-aislado.ts`, `pruebas/arquitectura/entorno.test.ts`, `pruebas/escenarios/.gitkeep` | T0-04 |
| `paquetes/nucleo/resultado.ts`, `paquetes/opencode/descriptor.ts` | T0-05 |
| `paquetes/rige/aplicacion/puertos/configuracion.ts`, `paquetes/rige/aplicacion/puertos/almacen.ts` | T0-05; precisar contratos mínimos para T0-09/T0-11a |
| `pruebas/utilidades/analisis-arquitectura.ts` | T0-05: análisis de imports; T0-06: análisis de identificaciones; importado por arquitectura y aceptación |
| `pruebas/arquitectura/dependencias.test.ts` | T0-05; volver a ejecutar con capas completas |
| `pruebas/aceptacion/RNF-03.test.ts` | T0-05 (CA-1), T0-06 (CA-2); identificadores en `describe` |
| `pruebas/arquitectura/identificaciones.test.ts` | T0-06 |
| `pruebas/arquitectura/red.test.ts` | T0-07; también restringe el cliente de pruebas a su único módulo de D-2 |
| `pruebas/arquitectura/repositorio.test.ts` | T0-08 |
| `esquemas/almacen/001_inicial.sql` | T0-09 |
| `paquetes/rige/adaptadores/almacen-sqlite/esquema.ts`, `esquema.test.ts` en esa carpeta | T0-09 |
| `paquetes/rige/aplicacion/casos-uso/preparar-almacen.ts`, `preparar-almacen.test.ts` en esa carpeta | T0-09 |
| `paquetes/rige/aplicacion/errores.ts` | T0-05: `almacen-sin-esquema`; T0-10: códigos de D-1 respaldados por ADR-066 confirmado; T0-11a/T0-11b traducen sin redefinir |
| `paquetes/rige/adaptadores/sistema/configuracion.ts`, `configuracion.test.ts` en esa carpeta | T0-10 |
| `paquetes/rige/aplicacion/casos-uso/consultar-estado.ts`, `consultar-estado.test.ts` en esa carpeta | T0-11a |
| `paquetes/rige/aplicacion/respuestas/estado.ts` | T0-09 define respuesta de preparación; T0-11a completa estado compartido |
| `paquetes/rige/interfaces/cli/ejecutar.ts` | T0-11a |
| `paquetes/rige/arranque/rige.ts` | T0-11a ensambla CLI; T0-11b amplía ensamblado para web, sin dependencia inversa |
| `paquetes/rige/interfaces/web/servidor.ts`, `paquetes/rige/interfaces/web/intermedios/errores.ts` | T0-11b; T0-12 comprueba cobertura de todas las rutas |
| `paquetes/rige/interfaces/web/paginas/inicio.ts`, `inicio.test.ts` en esa carpeta | T0-11b; T0-12 verifica escape |
| `pruebas/utilidades/cliente-http-local.ts`, `cliente-http-local.test.ts` en esa carpeta | T0-11b (D-2); T0-12 reutiliza |
| `pruebas/aceptacion/arranque.test.ts` | T0-11a: contrato CLI; T0-11b: arranque y respuesta del servidor |
| `paquetes/rige/interfaces/web/intermedios/origen.ts` | T0-12 |
| `paquetes/rige/interfaces/web/plantillas.ts`, `plantillas.test.ts` en esa carpeta | T0-11b: escape mínimo probado para inicio; T0-12: verificación exhaustiva de C2 |
| `pruebas/aceptacion/RNF-09.test.ts` | T0-12; un caso con ID por CA |
| `README.md` (existente, §3–§8) | T0-13 |
| `AGENTS.md`, `CLAUDE.md` (existentes) | Ninguna modificación |

Dependencias: T0-09 y T0-10 → T0-11a → T0-11b → T0-12. T0-11a ensambla CLI sin importar web pendiente; T0-11b amplía ese mismo arranque para web y crea el ayudante mínimo con prueba de escape antes de usarlo en inicio; T0-12 amplía la comprobación de seguridad. No hay dependencia circular entre tareas ni capas. La respuesta mínima de preparación se define en T0-09 y `almacen-sin-esquema` en T0-05 para no depender de tareas posteriores. Las estructuras de dominio, contrato, resolución, hallazgos y explicación del núcleo; las del adaptador de herramienta; `esquemas/salida/v1/`, `referencia/` y `oraculo/` de ADR-058 no se crean vacías ni se atribuyen a este incremento: requieren los comportamientos expresamente excluidos en §4.3.

## 7. Alcance autorizado

**Delegación actual:** solo T0-04 en la rama existente, con TDD estricto y un commit por tarea. Únicamente sus archivos de §6.1, este documento y README §3–§8 para sus comandos. Temporales bajo `C:/Users/Joa/AppData/Local/Temp/opencode`, entorno aislado y limpieza; instalación autorizada de dependencias exactas. No se inicia T0-05 ni se crean stubs de producción. No se lee configuración personal, no se inicializa CodeGraph, no se actualiza Bun ni se realizan operaciones remotas, push, merge o etiquetas. Esta autorización reemplaza la delegación documental previa sin cambiar criterios aprobados.

**Implementación aprobada y expresamente autorizada por el autor, fuera de esta delegación:** crear `inc0-esqueleto` desde `main`; primer commit solo de este documento con `docs: documento ODD del incremento 0`; escribir los archivos reconciliados de §6.1; ejecutar las verificaciones T0-01–T0-03 y los comandos necesarios de §9 documentados en README; cerrar cada tarea de implementación con un commit en esa rama. Staging solo de rutas explícitas dentro de `src/`, nunca `git add -A` ni `git add .`. Los temporales del arnés y los archivos del almacén de prueba son datos de ejecución aislados, no nuevos artefactos versionados: van a temporales del sistema, se fija `RIGE_ALMACEN` temporal en toda ejecución runtime del agente y se limpian al terminar (§5, ADR-066; D-4 resuelta). `rige.env` es una copia local ignorada para configurar la ejecución, no un archivo versionado. Todo lo demás requiere acuerdo nuevo. El autor confirmó ADR-066 aceptado: T0-10 y T0-11a/T0-11b no mantienen bloqueos documentales.

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
bun run rige -- esquema
bun run esquema
bun run servir        # http://127.0.0.1:4747
```

El CI existente (`../.github/workflows/ci.yml`) ejecuta instalación congelada, verificación y pruebas en `ubuntu-latest` y `windows-latest`. Para producir por primera vez `bun.lock`, T0-04 usa `bun install` con Bun 1.3.14; no empezar con `--frozen-lockfile` sin lock. T0-13 documenta además la copia de `rige.env.example` a `rige.env` en las dos plataformas y los experimentos previos, sin tratarlos como pasos necesarios del usuario final. Antes de cada ejecución runtime del agente se fija `RIGE_ALMACEN` en un temporal del sistema y se limpia al terminar (ADR-066); la ubicación normal del almacén queda solo para ejecuciones del autor. La autocomprobación previa a la entrega (guía §7) la realiza un tercero con el README solo. Ninguno de estos comandos se ejecutó en la revisión documental.

## 10. Progreso

T0-01–T0-03 verificadas secuencialmente, dos veces cada una. T0-04 implementada: arnés y configuraciones verificados; construcción completa pendiente del arranque T0-11a. T0-05–T0-13 no iniciadas. Los experimentos previos no son ciclos TDD. No se afirma ejecución del CI.

## 11. Evidencia

**Declaración de herramientas por período** (atribución histórica y previsiones declaradas por el autor; la revisión de correcciones distingue la identidad informada por el runtime. No se leyó configuración personal):

| Período | Agentes | Modelo declarado | Función y artefacto | Estado |
|---|---|---|---|---|
| Autoría original, 29/09/2026 | `gentle-orchestrator` | `opencode-go/mimo-v2.6-pro` | Propuesta de este documento ODD | Antecedente atribuido por el autor |
| Revisión documental inicial, 30/09/2026 | `gentle-orchestrator` y `general` | `openai/gpt-6.1-sol` | Revisión y corrección documental independiente | Antecedente declarado; solo documento, sin implementación |
| Aplicación de correcciones aprobadas, 30/09/2026 | `gentle-orchestrator` / `general`; escritor delegado `general` | `openai/gpt-6.1-sol` | Actualizar este documento, releerlo completo, verificar diff y conservar copia en Engram | Orquestación declarada por el autor; rol general y modelo del escritor informados por el runtime; sin implementación |
| Verificación previa al código, 30/09/2026 | `general` delegado | `openai/gpt-6.1-sol` | Experimentos temporales T0-01–T0-03, verificación repetida, commits documentales y copia en Engram | Rol/modelo efectivos confirmados por runtime; sin agentes hijos ni implementación |
| Implementación T0-04, 30/09/2026 | `general` delegado | `openai/gpt-6.1-sol` | Workspace, arnés aislado, pruebas, README parcial y evidencia ODD | Identidad efectiva del runtime; preparación y escritura en el mismo agente; RDD desactivado |
| Implementación futura | `gentle-orchestrator` y `general` | `openai/gpt-6.1-sol` | Orquestación e implementación de tareas autorizadas | Previsto, no ejecutado |
| Exploración futura | `explore` | `openai/gpt-6-luna` | Exploración acotada para tareas autorizadas | Previsto, no ejecutado |

**Registro de ejecución** (evidencia real de tareas ejecutadas; demás filas previstas):

| Tarea | Ruta | Agente | Modelo | Rojo (prueba y salida) | Verde | Refactor | Commit |
|---|---|---|---|---|---|---|---|
| T0-01 | delegada | general | openai/gpt-6.1-sol | No aplica: experimento previo al código | Dos veces: `undefined\n`, stderr vacío, salida 0; §11.1 | No aplica | `f15bdc8e7a26815730762da1bcb732f1308434e3` |
| T0-02 | delegada | general | openai/gpt-6.1-sol | No aplica: experimento previo al código | Dos veces: import no declarado aislado sale 1; control hoisted sale 0; `hoist` ignorado; §11.2 | No aplica | `1c94bf6a3fd58a85df54c74b031aff9f459acb78` |
| T0-03 | delegada | general | openai/gpt-6.1-sol | No aplica: experimento previo al código | Dos veces: `env = false` raíz impide carga automática dotenv en eval/run/script/test; §11.3 | No aplica | `8a2b8db0487f4b2b52e67b861f62756868ae291a` |
| T0-04 | delegada: preparación + dos archivos no triviales | general | openai/gpt-6.1-sol | `bun test ./pruebas/arquitectura/entorno.test.ts`: 0 pasan, 6 fallan; HOME sin redirección y fetch habilitado; salida 1 | 6 pasan, 0 fallan, 56 aserciones; salida 0 | 11 pasan, 0 fallan, 88 aserciones; typecheck existente correcto; build pendiente, salida 1; §11.5 | Hash registrado después de crear el commit, sin commit autorreferencial |
| T0-05 | delegada | general | openai/gpt-6.1-sol | | | | |
| T0-06 | delegada | general | openai/gpt-6.1-sol | | | | |
| T0-07 | delegada | general | openai/gpt-6.1-sol | | | | |
| T0-08 | delegada | general | openai/gpt-6.1-sol | | | | |
| T0-09 | delegada | general | openai/gpt-6.1-sol | | | | |
| T0-10 | delegada | general | openai/gpt-6.1-sol | | | | |
| T0-11a | delegada | general | openai/gpt-6.1-sol | | | | |
| T0-11b | delegada | general | openai/gpt-6.1-sol | | | | |
| T0-12 | delegada | general | openai/gpt-6.1-sol | | | | |
| T0-13 | inline | gentle-orchestrator | openai/gpt-6.1-sol | — | | — | |

Las columnas de ejecución se completan al implementar; los valores de ruta, agente y modelo son la declaración prevista y se corrigen si la ejecución real difiere. Las tareas de código delegadas usan un solo escritor por tarea; las verificaciones y los comandos de §9 se ejecutan como acciones acotadas.

**Antecedente, no resultado de esta revisión:** ADR-062 y el plan de referencia atribuyen al sistema de agentes del TIF, sobre el equipo del autor el 29/09/2026, Bun 1.3.14 (ZIP y binario cotejados con `SHASUMS256.txt`), TypeScript 7.0.2 con `@types/bun` 1.3.14 y `"types": ["bun"]` sin `skipLibCheck`, SQLite 3.53.0 con `json_valid` e importación SQL como texto. Se conserva esa atribución; no se repitieron las mediciones ni se verificó aquí la compatibilidad de `hoist`.

**Cierre:** salida de `bun run verificar` y `bun test` en el equipo del autor, y enlace a la corrida del CI una vez que el autor suba la rama (el agente nunca sube).

### 11.1 Condiciones de experimentos temporales y punto de control T0-01

- Escritor efectivo: rol runtime `general`, modelo `openai/gpt-6.1-sol`; ruta delegada, sin agentes hijos, clon RDD desactivado.
- Se leyeron completos `src/AGENTS.md`, documento aprobado, ADR-058/062/066 y ambas skills solicitadas. `git status --short` inicial vacío; sin editar ni preparar archivos del autor.
- Parent comprobado con `Test-Path -LiteralPath "C:/Users/Joa/AppData/Local/Temp/opencode"` → `True`. PATH resolvió `C:/Users/Joa/.bun/bin/bun.exe`; `--version` aislado → `1.3.14`, salida 0. Sin descargar/instalar Bun; Glob no encontró `bun.exe` bajo el parent temporal autorizado.
- El arnés temporal `rige-inc0-experiments.py` construye cada entorno Bun desde cero: solo hereda `PATH`/`SystemRoot`; `HOME`, `USERPROFILE`, cuatro directorios `XDG_*`, `LOCALAPPDATA`, `APPDATA`, `RIGE_ALMACEN`, `TEMP` y `TMP` al directorio del experimento. `OPENCODE_*` y variables sonda ausentes. Sin leer configuración personal.
- Comando: `python "C:/Users/Joa/AppData/Local/Temp/opencode/rige-inc0-experiments.py" T001`. Cada fixture nueva contiene solo `rige.env` con `RIGE_PRUEBA=1`; comando Bun: `bun -e "console.log(process.env.RIGE_PRUEBA)"` con cwd de la fixture.
- Cwd corrida 1: `rige-T001-1-dci0qn8h`; corrida 2: `rige-T001-2-4zowm3vq`. Ambas stdout exacto `undefined\n`, stderr `""`, salida 0. Cada `--version`: `1.3.14\n`, stderr `""`, salida 0. Ambos directorios eliminados: `CLEANED=True`.
- Punto de control: T0-01 satisfecha; supuesto del nombre de archivo ADR-062 C4 confirmado. Fundamento: la carga explícita de RIGE sigue siendo necesaria. Reversión: solo evidencia T0-01 de este documento, sin comportamiento de aplicación. Se requiere `git diff --check` antes del commit documental.

### 11.2 Punto de control T0-02: linker reconocido, hoist ignorado

- Fuentes: Context7 `/oven-sh/bun` devolvió documentación actual de **main** para `linker`, `hoist` y `env`; no acredita compatibilidad 1.3.14. Fuentes del tag exacto: [parser](https://raw.githubusercontent.com/oven-sh/bun/bun-v1.3.14/src/cli/bunfig.zig), [instalación aislada](https://raw.githubusercontent.com/oven-sh/bun/bun-v1.3.14/docs/pm/isolated-installs.mdx). Commit del tag `0d9b296af33f2b851fcbf4df3e9ec89751734ba4` coincide con `0d9b296a` del runtime. El parser lee `install_obj.get("linker")`, pero no contiene `install_obj.get("hoist")`; reconoce por separado `hoistPattern` y `publicHoistPattern`. No son sustitutos autorizados por esta tarea.
- Comando: `python "C:/Users/Joa/AppData/Local/Temp/opencode/rige-inc0-experiments.py" T002`. Manifiesto raíz: workspace privado `packages/*`, sin dependencias raíz. `fixture-owner@1.0.0` declara `fixture-payload: "../../payload.tgz"`; `fixture-consumer@1.0.0` ninguna. Archivo generado localmente con `package/package.json` (`fixture-payload@1.0.0`, `type: module`, `exports: ./index.js`) e `index.js` que exporta `"LOCAL_PAYLOAD"`. Ambos scripts de workspace importan `fixture-payload`. Sin paquetes del registro ni dependencias del proyecto.
- Cada variante elimina módulos instalados y lock de la fixture antes de reinstalar. Comandos Bun: `install --ignore-scripts --registry=http://127.0.0.1:1`, luego `run ./packages/owner/index.js` y `run ./packages/consumer/index.js`. Destino del registro deliberadamente inutilizable y local; el mensaje genérico `Resolved, downloaded and extracted [1]` corresponde al archivo local, no a una dependencia descargada del registro.
- Corridas finales repetidas: cwd `rige-T002-1-pu7jwns2` y `rige-T002-2-zj8oruep`. Stdout exacto de instalación correcta: `bun install v1.3.14 (0d9b296a)\n\n<N> packages installed [<time>.00ms]\n`; stderr exacto `Resolving dependencies\nResolved, downloaded and extracted [1]\nSaved lockfile\n`, salida 0. Tiempos/N por variante:

| Variante bunfig | Corrida 1 N/tiempo | Corrida 2 N/tiempo | Owner / consumer no declarado |
|---|---|---|---|
| `linker = "isolated"`, `hoist = false` | 2/22 | 2/20 | 0 / 1 |
| Solo `linker = "isolated"` | 2/20 | 2/20 | 0 / 1 |
| isolated, `hoist = true` | 2/21 | 2/22 | 0 / 1 |
| isolated, `hoist = "not-a-boolean"` | 2/17 | 2/18 | 0 / 1 |
| `linker = "hoisted"`, `hoist = false` | 3/18 | 3/18 | 0 / 0 |

- Owner y consumer hoisted: stdout exacto `LOCAL_PAYLOAD\n`, stderr `""`, salida 0. Consumer aislado: stdout `""`, salida 1; stderr exacto `error: Cannot find package 'fixture-payload' from '<cwd>\packages\consumer\index.js'\n\nBun v1.3.14 (Windows x64)\n` (sustituir el cwd absoluto registrado). `import "fixture-owner"` adicional no declarado desde `packages/consumer/workspace.js` también sale 1, mismo formato de error con `fixture-owner` y `workspace.js`, en ambas corridas; no se infiere garantía de aislamiento más amplia.
- Control de linker inválido: `[install] linker = "invalid"`, stdout `""`, salida 1. Stderr exacto `2 | linker = "invalid"\n             ^\nerror: Expected one of "isolated" or "hoisted"\n    at <cwd>\bunfig.toml:2:10\n\nInvalid Bunfig: failed to load bunfig\n`. Demuestra que la configuración se carga y no se omite silenciosamente.
- En ambos casos aislados base: `ROOT_PAYLOAD_EXISTS=False`, `FALLBACK_EXISTS=True`. También refuta para 1.3.14 la eliminación del fallback atribuida a `hoist = false` en documentación actual. Ambas corridas finales completas terminaron; directorios temporales eliminados (`CLEANED=True`).
- Correcciones exploratorias del arnés, no rojo TDD: imports aislados de carpeta local `file:../../fixtures/payload` fallaron como se esperaba, pero también el control hoisted (aserción del arnés; limpiado). `file:../../payload.tgz` se interpretó como enlace y falló con `ENOENT: No such file or directory: failed to link package: fixture-payload@..\\..\\payload.tgz (link)` (salida 1; limpiado). Cambiar solo la especificación de fixture a `../../payload.tgz` produjo el control positivo hoisted significativo, repetido correctamente. Sin cambiar dependencia ni criterio del repositorio.
- Punto de control: T0-02 satisfecha. Aplicar **solo** `[install] linker = "isolated"` en T0-04 futura. La tarea aprobada condiciona explícitamente `hoist`; omitir una clave ignorada no relaja el aislamiento efectivo. No se confirma la atribución literal de comportamiento a `install.hoist` en ADR-058; sin editar ADR ni afirmar garantía más fuerte. Reversión: solo evidencia documental de esta tarea. No se escribieron fuentes/bunfig/lock en el repositorio.

### 11.3 Punto de control T0-03: env = false en la raíz

- El parser del tag exacto (§11.2) lee `json.get("env")` raíz y `loadEnvConfig` fija `disable_default_env_files = true` para false booleano. Context7 actual coincide, pero la compatibilidad se acredita por tag y runtime, no solo por documentación actual.
- Comando: `python "C:/Users/Joa/AppData/Local/Temp/opencode/rige-inc0-experiments.py" T003`. Cwds: `rige-T003-1-9ajdz5j6`, `rige-T003-2-216zd_zs`; entorno de §11.1. Fixture `.env`: `RIGE_PRUEBA_DOTENV=1`; `probe.js`: `console.log(process.env.RIGE_PRUEBA_DOTENV);`. Script `probe` del manifiesto: `bun ./probe.js`. Prueba temporal importa `test, expect` de `bun:test`, imprime la variable y comprueba cadena igual a `1` en control base o `undefined` con carga deshabilitada.
- En cada fixture nueva, primero `env = true`, luego `env = false` en bunfig raíz. Comandos `bun -e "console.log(process.env.RIGE_PRUEBA_DOTENV)"`, `bun run ./probe.js`, `bun run probe`, `bun test ./probe.test.ts`: todos salida 0 dos veces por condición. Stdout base `1\n`; deshabilitado `undefined\n`. Stderr eval/archivo `""`; stderr script exacto `$ bun ./probe.js\n`. Stdout test agrega prefijo exacto `bun test v1.3.14 (0d9b296a)\n` al valor impreso.
- Plantilla stderr test exacta: `\nprobe.test.ts:\n(pass) dotenv configuration [<case>ms]\n\n 1 pass\n 0 fail\n 1 expect() calls\nRan 1 test across 1 file. [<total>.00ms]\n`. Corrida 1: caso/total base `0.44/28`, deshabilitado `0.40/24`; corrida 2: base `0.39/28`, deshabilitado `0.39/24`. Estas pruebas de fixture son diagnósticos del experimento, no aceptación ni ciclo TDD del proyecto inventado.
- Control de archivo explícito con `env = false`: `bun --env-file=.env ./probe.js` sigue imprimiendo exactamente `1\n`, stderr `""`, salida 0 en ambas corridas. Defensa deshabilita archivos **automáticos**, no carga explícita ni entorno heredado; conservar aislamiento separado y lector explícito de `rige.env`.
- Aserción preliminar del arnés omitió incorrectamente el banner de versión stdout de `bun test`; la prueba base pasó (`1 pass`, `0 fail`), pero Python terminó con `AssertionError`. Se corrigió solo la expectativa de salida y luego se repitió el experimento completo dos veces. Fixtures preliminares y finales limpiadas por el contexto de directorio temporal.
- Punto de control: T0-03 satisfecha, `env = false` raíz configurado y observado en bunfig temporal; aplicar en bunfig del repositorio en T0-04, no ejecutada en aquel período. Fundamento: defensa en profundidad ADR-062 C4 sin depender de ella para semántica de `rige.env`. Reversión: solo evidencia documental de esta tarea. Ambas fixtures finales eliminadas (`CLEANED=True`).

### 11.4 Límite de entrega documental

- Commits de control: T0-01 `f15bdc8e7a26815730762da1bcb732f1308434e3`; T0-02 `1c94bf6a3fd58a85df54c74b031aff9f459acb78`; T0-03 `8a2b8db0487f4b2b52e67b861f62756868ae291a`. Documentación posterior registra el último hash sin amend ni hash autorreferencial; seguimiento `10f72e7`.
- Solo `src/odd/tasks/inc0-esqueleto.md` preparado en cada commit. Cambios concurrentes observados en `00-gestion/bitacora.md`, `estado.md`, `pendientes.md` e `informe/datos-autor.yaml` fuera de aquella delegación y preservados. Sin editar `AGENTS.md`, ADR-066 ni índice de decisiones.
- Cada punto de control pasó `git diff --check` (salida 0); Git emitió advertencias LF→CRLF existentes, no errores de espacios. Sin omitir hooks, amend, push, merge ni etiquetas.
- Todos los directorios de fixture eliminados por el arnés; el propio arnés temporal se eliminó tras los experimentos repetidos. README quedó sin cambios en ese período porque los experimentos no son pasos de instalación del usuario final. No quedaron fuentes de workspace, datos de ejecución ni módulos instalados de aquella delegación.

### 11.5 T0-04: workspace y arnés aislado

- Escritor efectivo: `general`, modelo `openai/gpt-6.1-sol`; ruta delegada por preparación y dos archivos no triviales, sin agentes hijos. Autoverificación media; RDD desactivado, sin iniciar revisión nativa. Skills leídas: `work-unit-commits` y `cognitive-doc-design`; registro de skills no disponible, no se exploró configuración.
- Lecturas: documento completo, `src/AGENTS.md`, ADR-058/061/062/066 y README. Raíz y rama comprobadas. Sin índice CodeGraph: fallback directo autorizado, sin inicialización. Cambios concurrentes ajenos fuera de `src/` preservados.
- Parent temporal comprobado con `Test-Path -LiteralPath "C:/Users/Joa/AppData/Local/Temp/opencode"` → `True`. Arnés temporal `rige-t004.py`: ejecuta exclusivamente `C:/Users/Joa/.bun/bin/bun.exe`; antes de cada comando, `--version` → `1.3.14`, salida 0. Entorno nuevo: solo PATH/SystemRoot heredadas, PATH antepone el binario fijado, HOME/USERPROFILE/cuatro XDG/APPDATA/LOCALAPPDATA/RIGE_ALMACEN/TEMP/TMP al temporal. No lee configuración personal. Cada ejecución informa `CLEANED True`.
- Comandos observados: `python "C:/Users/Joa/AppData/Local/Temp/opencode/rige-t004.py" <argumentos>`, con argumentos `test ./pruebas/arquitectura/entorno.test.ts`, `install`, `install --frozen-lockfile`, `test`, `run tsc --version` y `run verificar`. El script temporal se elimina al cerrar; README documenta los comandos Bun y el aislamiento reproducible sin depender de él.
- **Rojo:** prueba escrita antes del código. Primera ejecución útil: 0 pasan, 6 fallan, 2 aserciones, salida 1. Fallos de comportamiento: prefijo del HOME temporal ausente y `fetch(data:...)` resolvió cuando debía rechazar; también faltaban manifiestos/tsconfigs y ayudante. Una ejecución preliminar del arnés falló por SystemRoot omitida al comparar nombres con distinta capitalización; se corrigió únicamente el arnés, no se cuenta como rojo TDD.
- **Verde mínimo:** precarga, ayudante y andamiaje: 6 pasan, 0 fallan, 56 aserciones, salida 0 (104 ms). `bun install`: 12 paquetes instalados, dependencias exactas `typescript@7.0.2` y `@types/bun@1.3.14`, salida 0; lock generado. `bun run tsc --version`: `Version 7.0.2`, salida 0. Sin nuevas dependencias directas de ejecución.
- **Refactorización y controles:** lista de variables compartida; import estático del ayudante; controles de ruta absoluta y SystemRoot con capitalización Windows; rechazo de `fetch.preconnect`; subproceso con contaminación sintética que verifica precarga y limpieza. Fuentes temporales para cada tsconfig: error intencional detectado, fuente válida aceptada, núcleo rechaza process/Bun/fetch, sin JS ni tsbuildinfo emitidos. Resultado focal: 11 pasan, 0 fallan, 88 aserciones, salida 0 (3,55 s).
- **Verificación de fase final:** instalación congelada salida 0 (`Checked 12 installs across 29 packages (no changes)`, 14 ms); prueba focal 11 pasan/0 fallan/88 aserciones, salida 0 (5,28 s); `bun test` completo 11 pasan/0 fallan/88 aserciones, salida 0 (1,64 s). `bun run verificar` comprueba tipos del código existente y registra `Typecheck pendiente (sin fuentes)` para los tres paquetes; intenta realmente el build y sale 1 con `FileNotFound opening root directory "./paquetes/rige/arranque"`. Construcción completa pendiente de T0-11a, no PASS ni exclusión silenciosa. Los scripts de producción apuntan al arranque futuro; no se ejecutan ni se crean stubs. Las dependencias transitivas de desarrollo (incluidas bun-types, @types/node, undici-types y binarios opcionales de TypeScript) quedan fijadas por el lock; no son nuevas dependencias directas ni clientes de red del producto.
- La configuración inicial directa de referencias produjo TS6310 por noEmit; el script deriva configs temporales sin referencias de emisión y conserva las opciones de cada paquete. Se corrigieron un error de comillas del script y la resolución de typeRoots desde el temporal. Son defectos de implementación corregidos, no incompatibilidad de las versiones ni cambio de alcance. Sin skipLibCheck ni relajación de types/lib; las tres configuraciones tienen controles positivos y negativos observados.
- **Límite de reversión:** exclusivamente los archivos T0-04 de §6.1, README §3–§8 añadido y esta evidencia/estado T0-04. No borrar ni reinterpretar T0-01–T0-03 ni archivos ajenos. Runtime de producto no aplicable: CLI/servidor todavía inexistentes; sí se ejecutaron los subprocesos del arnés. T0-05 y siguientes quedan pendientes; CI y Ubuntu no ejecutados.
- Cierre del commit: staging de rutas exactas propias, `git status`, `git diff`, `git log --oneline -10` y `git diff --check`; hash y conteos finales se registran después de crearlo sin amend ni commit autorreferencial adicional.

## 12. Siguiente paso

1. Devolver al padre evidencia, commit y verificación parcial de T0-04. No continuar T0-05.
2. El padre repite pruebas y realiza revisión independiente si corresponde; no se inició revisión nativa ni RDD aquí.
3. Esperar autorización para T0-05. La construcción completa permanece pendiente de T0-11a; T0-10/T0-11a/T0-11b conservan dependencias aprobadas y respaldo de ADR-066.

## 13. Diferencias con el plan de referencia

Solo se listan los puntos en que este documento se aparta del plan (`../00-gestion/revisiones/20260929_inc0-base-contexto.md`).

1. **Nombres estables de errores.** El plan exige `configuracion-invalida` y `puerto-ocupado`, no definidos por ADR-058/061/062. ADR-066 aceptado los incorpora como errores de uso, salida 1; el autor confirmó su aceptación. D-1 queda resuelta y T0-10/T0-11a/T0-11b quedan desbloqueadas. *Fundamento:* D-1; ADR-066; ADR-058 M-2 y contrato; ADR-062 C4.
2. **T0-02, claves de instalación aislada.** El plan presenta `install.hoist = false` y `linker = "isolated"` como alternativas. Se fija `[install] linker = "isolated"` y `hoist = false` solo si Bun 1.3.14 lo admite. La atribución previa a documentación consultada no prueba compatibilidad en esta revisión: T0-02 debe comprobarla y T0-04 aplicar el resultado. *Fundamento:* ADR-058 P-2 y decisión explícita del autor.
3. **T0-04 absorbe el andamiaje del workspace.** El plan lista `package.json`, `bunfig.toml`, tsconfigs, `rige.env.example`, `.gitignore` y `.gitattributes` en su árbol (§5) pero no los asigna a ninguna tarea. Este documento los crea dentro de T0-04, porque ninguna prueba puede ejecutarse sin ellos. *Fundamento:* ADR-062 C1, C3 y C4; ADR-058 (tsconfig por paquete).
4. **T0-07, atribución del criterio.** El plan atribuye «sin clientes de red» a RNF-05. Las CA de RNF-05 son de comportamiento (monitor de red, interfaz deshabilitada) y su ficha lo prevé para la iteración 3. Lo que se verifica en T0-07 es la garantía estructural de ADR-058 (G-2 y tabla de reglas) y de `src/AGENTS.md` §2. *Fundamento:* `RNF-05.md` (CA-1, CA-2, iteración prevista 3); ADR-058 G-2.
5. **T0-05, alcance de RNF-03 CA-1.** CA-1 solo exige «cero dependencias del núcleo hacia el adaptador». Las demás reglas que el plan pone en ese criterio (interfaces/adaptadores, `node:fs`, `bun:sqlite`) provienen de la tabla de reglas de ADR-058, no de la ficha. *Fundamento:* `RNF-03.md` (CA-1); ADR-058 (tabla de reglas de dependencia).
6. **T0-12, `Sec-Fetch-Site`.** El plan solo prueba el rechazo de `cross-site`. ADR-062 C7 rechaza `cross-site` **o `same-site`** en todas las rutas y admite `same-origin`, `none` y la ausencia del encabezado. Se agrega el caso `same-site`. *Fundamento:* ADR-062 C7.
7. **T0-11a/T0-11b, `bun run esquema` y código de salida.** El plan solo menciona el comando dentro del mensaje de error de `servir`. La guía (paso 6) exige que la creación del esquema sea un comando reproducible y ADR-062 C1 lo declara como script; se agrega su comprobación en T0-11a. Además, el plan pide «código distinto de 0» para `servir` sin esquema; ADR-061 fija **código 1**, comprobado en T0-11b. *Fundamento:* guía, paso 6; ADR-062 C1; ADR-061 (contrato de salida).
8. **Atribución del `fetch` que falla.** El plan atribuye a ADR-062 C6 el reemplazo de `fetch` por una función que falla. C6 solo manda redirigir variables en la precarga; el reemplazo de `fetch` lo exigen ADR-058 (G-2) y `src/AGENTS.md` §2. La consecuencia para las pruebas de aceptación es D-2. *Fundamento:* ADR-062 C6; ADR-058 G-2.
9. **T0-13, README §3–§8.** El plan limita el README a §3–§6. El autor aprueba completar §3–§8, dejando §2 al caso vertical; §8 declara por período las herramientas efectivamente usadas, sin borrar autoría previa ni presentar previsiones como ejecución. El README existente aún menciona `.env.example`: sustituir por `rige.env.example`. *Fundamento:* ADR-065 regla 9; ADR-062 C4 y consecuencias; D-3. *Tarea:* T0-13.
10. **Casos de uso y respuestas ausentes.** El árbol del plan omite `aplicacion/casos-uso` y `respuestas`, aunque ADR-058 los exige y su convención 1 impide que las interfaces coordinen puertos. Se agregan preparación y consulta de estado, con respuesta única y dobles de puertos; `arranque` solo ensambla. *Fundamento:* ADR-058 A-2, árbol, matriz y convención 1; precisión del autor. *Tareas:* T0-05, T0-09, T0-11a/T0-11b.
11. **`interfaces/web/paginas/` no figura en el árbol de ADR-058.** Ya aparece en el plan; se conserva como ubicación de las plantillas de presentación del objeto de respuesta, no como una nueva capa ni ruta de datos. Se agrega ayudante de escape y pruebas. *Fundamento:* ADR-062 C2 completa ADR-058, no lo contradice. *Tareas:* T0-11b/T0-12.
12. **Inventario incompleto y autorización discordante.** El árbol anterior no enumera unitarias ni pruebas concretas, omite tsconfigs de dos paquetes y no incluye el README a modificar, mientras §7 autoriza solo ese árbol. El problema describe tres archivos aunque ya existe el documento ODD. §4.1/§6.1 enumeran cada archivo, distinguen existentes y futuros y asignan `.gitkeep` y lock. *Fundamento:* inspección de `src/`, ADR-058 P-2 y pruebas junto al código; ADR-062 C3. *Tareas:* T0-04–T0-13 según §6.1.
13. **Guarda arquitectónica parcial.** El plan solo prueba algunos imports; faltan aplicación, acceso directo de interfaces a puertos, límites del adaptador de herramienta y ensamblado. Se explicita la matriz completa, E/S por módulo y detección de rutas/aliases e infracciones reales; no se considera acreditada una capa vacía. *Fundamento:* ADR-058 matriz, M-2 y convenciones 1/3/6/8; ADR-061 precisión de `mkdirSync`. *Tareas:* T0-05, T0-09–T0-12.
14. **RNF-03 sin entrada de aceptación y CA-3 diferido.** El plan ubica CA-1/CA-2 solo en arquitectura, pese a la regla de una prueba por CA en aceptación. Arquitectura y `aceptacion/RNF-03.test.ts` importan directamente `pruebas/utilidades/analisis-arquitectura.ts`, que reúne análisis de imports e identificaciones; aceptación usa un `describe` por CA. No se lanzan subprocesos para guardas: la regla de §6 se refiere a CLI/servidor. La cobertura sigue siendo solo CA-1/CA-2, no CA-3. *Fundamento:* corrección aprobada por el autor; `src/AGENTS.md` §6; ADR-065 regla 1; ficha RNF-03. *Tareas:* T0-05/T0-06.
15. **Esquema y no migración incompletamente verificados.** El plan solo prueba `UPDATE` de `resolucion`, tres tablas y `foreign_keys`. Se exige también inmutabilidad de `entrada_leida`, restricciones, índices, demás pragmas, transacción y rechazo de base incompatible. Consultar estado/servir no crea una base ausente ni migra una incompatible. *Fundamento:* ADR-061 ciclo de vida, modelo, conexión, C-A y prueba 5. *Tareas:* T0-09/T0-11a/T0-11b.
16. **Configuración y versiones imprecisas.** Se precisan las dos únicas variables, directorio (no archivo), ubicaciones por plataforma y valor vacío del ejemplo; versión RIGE, `esquema: 1` de respuesta y `user_version` son contratos distintos. *Fundamento:* `src/AGENTS.md` §3; ADR-058 convención 5; ADR-062 C4/C5. *Tareas:* T0-04, T0-09, T0-10, T0-11a/T0-11b, T0-13.
17. **Pruebas de seguridad y escape insuficientes.** El plan prueba solo Host ajeno, POST y un origen; faltan puerto de Host, casos admitidos, controles en errores/rutas inexistentes y escape verificable de valores HTML. Se extienden los criterios sin agregar rutas funcionales. *Fundamento:* RNF-09 CA-1–CA-3; ADR-058 convención 6; ADR-062 C2/C7. *Tareas:* T0-11b/T0-12.
18. **Cliente de pruebas incompatible con `fetch` bloqueado.** D-2 queda aprobada: único cliente `node:http` bajo `pruebas/utilidades/`, destino exclusivamente `127.0.0.1`; basta una comparación literal previa y una unitaria negativa para otro destino, sin casos adicionales del cliente. No se habilita red en producto ni se restaura `fetch`. *Fundamento:* D-2 y corrección aprobada por el autor; ADR-058 G-2; ADR-062 C6. *Tareas:* T0-07/T0-11b/T0-12.
19. **Bootstrap, comandos y errores de CLI incompletos.** El lock inexistente exige primero `bun install`, no instalación congelada; faltan comandos de copia/configuración, invocación común `rige --` y comprobación de argumentos/canales/diagnóstico. Se documenta toda la secuencia y se prueba el contrato sin implementar RF-05. *Fundamento:* ADR-062 C1/C3/C4; ADR-058 convenciones 8/9 y contrato. *Tareas:* T0-04, T0-11a, T0-13.
20. **Git, evidencia y estado de revisión.** El plan no exige el primer commit documental ni staging acotado; la tabla anterior mezcla modelo histórico con futuro y refiere a configuración personal. Se incorporan las instrucciones explícitas del autor, declaración por período y antecedentes atribuidos; ninguna tarea está ejecutada ni se afirma CI verde. La matriz existente no acredita por sí sola una ejecución nativa Windows 11. *Fundamento:* ADR-065 reglas 3/5/9 y autorización actual. *Tareas:* primer commit futuro, evidencia de todas las tareas y T0-13.
21. **Guarda del repositorio y escrituras de ejecución.** La prohibición del plan de crear configuración en cualquier carpeta impide escenarios anidados posteriores; ADR-062 C6 prohíbe los ancestros de `escenarios/`, no sus fixtures descendientes. Se corrige sin crear escenarios ahora. D-4 queda resuelta por ADR-066 aceptado y confirmado: archivos del repositorio solo en `src/`; datos de ejecución del agente en temporales del sistema, con `RIGE_ALMACEN` temporal en toda ejecución runtime y limpieza al terminar. No se usa el almacén real del autor. *Fundamento:* ADR-066; ADR-062 C6; `src/AGENTS.md` §6/§7. *Tareas:* T0-01, T0-04, T0-08, T0-09, T0-10, T0-11a/T0-11b, T0-12.
22. **Orden de tareas y pronóstico no reconciliados.** El caso de preparación necesita error y respuesta antes de T0-10/T0-11a, y la página necesita escape antes de T0-12. Se asignan mínimos a T0-05/T0-09/T0-11a/T0-11b y ampliaciones posteriores, sin ciclos. El pronóstico de líneas original queda como antecedente, no como presupuesto actualizado. *Fundamento:* ADR-058 M-2/convención 1; ADR-062 C2; TDD estricto de `src/AGENTS.md` §7. *Tareas:* T0-05, T0-09, T0-10, T0-11a/T0-11b, T0-12.
23. **División de estado, CLI y web en dos unidades.** El autor aprobó dividir la tarea de interfaces: T0-11a implementa `consultar-estado`, contrato completo aplicable de CLI y su ensamblado; T0-11b implementa servidor, inicio y cliente HTTP de pruebas, ampliando el mismo arranque para web. Dependencias: T0-09/T0-10 → T0-11a → T0-11b → T0-12, sin imports web pendientes en T0-11a ni dependencia inversa. El mapa y la evidencia tienen una entrada por unidad; ambas siguen pendientes. *Fundamento:* corrección aprobada por el autor; ADR-058 matriz y ensamblado; ADR-065 TDD por tarea.

## 14. Decisiones del autor resueltas

**D-1 · Resuelta.** ADR-066 aceptado el 30/09/2026 formaliza `configuracion-invalida` y `puerto-ocupado` como códigos estables de error de uso, salida 1; el autor confirmó su aceptación. T0-10 y T0-11a/T0-11b están desbloqueadas y conservan únicamente sus dependencias de tareas. No se modifica ningún ADR en esta delegación.

**D-2 · Aprobada y precisada.** Cliente HTTP de pruebas sobre `node:http`, único módulo `pruebas/utilidades/cliente-http-local.ts`; comparar literalmente el destino con `127.0.0.1` antes de conectar, con una única prueba negativa para un destino distinto junto al módulo, asignada a T0-11b. No se amplían los casos del cliente. T0-07 controla que la excepción no se expanda; T0-12 reutiliza el cliente. `fetch` global sigue fallando.

**D-3 · Aprobada.** T0-13 completa README §3–§8; §2 queda para el caso vertical. §8 declara herramientas por período según §11 y evidencia real; no presenta modelos futuros como usados ni reemplaza la autoría original.

**D-4 · Resuelta.** ADR-066 aceptado y confirmado por el autor precisa que solo los archivos del repositorio deben escribirse dentro de `src/`. Los datos de ejecución aislados van a temporales del sistema y se eliminan al terminar; toda ejecución runtime del agente fija `RIGE_ALMACEN` en un temporal. El almacén normal de ADR-058/061 queda solo para ejecuciones del autor. T0-01 y el arnés T0-04/T0-09/T0-10/T0-11a/T0-11b/T0-12 no mantienen una duda ni bloqueo de ubicación; se preserva el cambio del autor en `src/AGENTS.md` §7.
