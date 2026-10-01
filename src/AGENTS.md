# AGENTS.md — Reglas de programación de RIGE

Reglas para cualquier agente que trabaje en `src/` (OpenCode, Claude Code u otro). **Dentro de `src/` prevalecen sobre las instrucciones globales del agente.** No aplican las reglas de redacción del informe.

RIGE es una herramienta local de **solo lectura** que resuelve y explica la configuración efectiva de OpenCode 1.18.25 y su procedencia.

## 1. Fuentes de verdad

- **Requisitos:** `../03-requisitos/libro/catalogo/` (una ficha por RF/RNF con sus criterios de aceptación CA-n); reglas de negocio en `../03-requisitos/libro/reglas.md` (RD, RR, RE).
- **Arquitectura:** `../00-gestion/decisiones/`, en particular:
  - ADR-058: arquitectura, paquetes, errores y contrato de salida;
  - ADR-060: contrato del adaptador y rastro;
  - ADR-051: interfaces, esquema de salida y explicación por plantillas;
  - ADR-032: stack;
  - ADR-029: oráculo;
  - ADR-054: plataformas;
  - ADR-061: ciclo de vida de la Resolución y modelo de datos del almacén;
  - ADR-062: distribución, web, dependencias, configuración propia, versionado y arnés de pruebas.
- **Ficha de la tarea (ADR-067):** `../00-gestion/fichas/<incremento>/<tarea>.md`. Es la especificación de lo que hay que hacer: criterios, archivos, interfaces, pruebas, comandos y condiciones de detención. No se amplía ni se reinterpreta: si no alcanza o contradice un ADR, detenete. `odd/tasks/inc0-esqueleto.md` es un antecedente congelado del incremento 0 (ADR-065): consultalo solo si la ficha remite a él y no lo modifiques.
- Nada de esto se contradice sin un ADR nuevo aceptado por el autor. Si una tarea lo exige, **detenete y avisá**.

## 2. Restricciones no negociables

| Requisito | Regla | Cómo se verifica |
|---|---|---|
| RNF-01 | Nunca escribir sobre las entradas de configuración; solo se escribe en el almacén propio | Prueba de resúmenes SHA-256 antes y después |
| RNF-02 | Fidelidad a OpenCode 1.18.25; ante la duda, fallar de forma visible | Resultados de referencia (ADR-029) |
| RNF-03 | `nucleo` no depende de `opencode` ni contiene identificaciones de la herramienta (`opencode`, `OPENCODE_`, …) | `pruebas/arquitectura/` |
| RNF-04 | El contenido que una sustitución `{env:…}` o `{file:…}` incorpora solo existe como `ValorSustituido`; se emite su origen y su condición, nunca su contenido: ni en la salida, ni en el canal de error, ni con `--depurar`, ni en el almacén | Prueba de búsqueda textual del valor en todas las salidas y en el archivo SQLite |
| RNF-05 | Sin conexiones salientes; ningún cliente de red en el código | `pruebas/arquitectura/`; `fetch` reemplazado por una función que falla |

## 3. Estructura y dependencias (ADR-058)

Workspaces de Bun 1.3.14 con instalación aislada: `paquetes/nucleo`, `paquetes/opencode` y `paquetes/rige`. La clave exacta de `bunfig.toml` se verifica en el incremento 0.

| Módulo | Puede depender de |
|---|---|
| `nucleo` | nada externo; ningún módulo del runtime con E/S |
| `opencode` | `nucleo` y las bibliotecas que admita la política de dependencias (ADR-062) |
| `rige/aplicacion` | `nucleo` |
| `rige/adaptadores` | `rige/aplicacion` (puertos) y `nucleo`. Solo `adaptadores/sistema` importa `node:fs`, y solo para leer. Única excepción: `adaptadores/almacen-sqlite` usa `mkdirSync` para crear su propio directorio (ADR-061). Solo `adaptadores/almacen-sqlite` importa `bun:sqlite` |
| `rige/interfaces` | `rige/aplicacion`; nunca los adaptadores |
| `rige/arranque` | todo; es el único punto de ensamblado |

**Política de dependencias (ADR-062):**
- Versiones exactas, sin rangos. `bun.lock` versionado. Instalación con `bun install --frozen-lockfile`.
- **Ejecución:** solo bibliotecas que OpenCode 1.18.25 usa en la misma versión. Hoy, `jsonc-parser` 3.3.1, y solo en `paquetes/opencode`.
- **Desarrollo:** `typescript` 7.0.2 y `@types/bun` 1.3.14.
- **`tsconfig`:** `"types": ["bun"]` en los paquetes que usan el runtime; `"types": []` en `paquetes/nucleo`.
- **Runtime:** Bun 1.3.14, la versión que incorpora OpenCode 1.18.25. No se sube a la 1.4.
- Sin frameworks, sin ORM y sin bibliotecas de prueba distintas de `bun test`.
- Agregar cualquier otra dependencia requiere autorización del autor y su registro en un ADR.

**Invocación y configuración (ADR-062):**
- Scripts: `bun run esquema`, `bun run servir`, `bun run rige -- <subcomando>`, `bun run verificar` y `bun test`.
- Configuración propia en `rige.env`, copiada de `rige.env.example` y leída en forma explícita. Solo admite `RIGE_PUERTO` (4747 por defecto) y `RIGE_ALMACEN`. Una variable `OPENCODE_*` en ese archivo es un error visible.
- Nunca se usa un archivo `.env`, porque Bun lo carga solo en el entorno que RIGE analiza.

## 4. Contrato del adaptador y rastro (ADR-060)

- El adaptador declara; el núcleo ejecuta.
  - El adaptador entrega la **secuencia ordenada de aplicaciones** (declaración, ruta de clave, estrategia, código de regla).
  - El núcleo la ejecuta con estrategias intercambiables: reemplazo, fusión profunda que conserva la posición de la primera declaración (RD-02), acumulación con deduplicación, eliminación y derivación. Un adaptador puede aportar una estrategia propia sin tocar el núcleo.
- El **evaluador de permisos** lo aporta el adaptador, como función pura.
- **Orígenes de un valor:**
  - `declarado`, con su vía y su posición;
  - `implicito`, con su código de regla;
  - `nativo`.
- **Rastro de valor** (por agente y ruta de clave): valor efectivo, declaración determinante, motivo de prevalencia, declaraciones desplazadas y posición asignada por la fusión.
- **Rastro de decisión** (por agente y consulta): cadena efectiva con índice y procedencia de cada regla, regla determinante (RD-03), coincidentes desplazadas, heredadas (RD-05) y regla nativa anulada (RD-07).
- Los códigos de regla son **etiquetas opacas** para el núcleo. Sus plantillas de explicación están en el adaptador.
- Toda respuesta incluye el **resumen de entradas leídas** (acuerdo E-02):
  - vías con su resumen SHA-256;
  - vías no observadas (remotas);
  - resumen del conjunto;
  - las variables entran por nombre y condición, nunca por contenido.

## 5. Convenciones

- **Falla visible.** Ningún `catch` devuelve un valor del dominio. Ante un defecto interno se falla; nunca se completa con un valor por defecto.
- **Errores por categorías:**
  - un defecto de la configuración es un hallazgo;
  - un error de uso es un `Resultado<T, E>`;
  - una falla de infraestructura es una excepción que se captura una sola vez, en el borde de cada interfaz.
- **Determinismo (RF-03):**
  - salida idéntica ante entradas idénticas;
  - orden de claves estable;
  - rutas normalizadas;
  - sin fecha ni identificador en la respuesta de la CLI.
- **Posiciones:**
  - línea y columna con base 1;
  - columna en unidades UTF-16;
  - `\r\n` cuenta como un fin de línea;
  - se calculan sobre el texto **original**, nunca sobre el texto con las sustituciones aplicadas.
- **Contrato de salida de la CLI:**

  | Situación | Salida | Error | Código |
  |---|---|---|---|
  | Respuesta válida, con o sin hallazgos | JSON | — | 0 |
  | Comando compuesto (RF-08) | JSON con `decision: null` | — | 0 |
  | Proyecto, agente o clave inexistente | vacío | JSON de error | 1 |
  | Argumentos inválidos | vacío | JSON de error | 2 |
  | Versión distinta de 1.18.25 (RF-05) | vacío | advertencia | 3 |
  | Falla interna | vacío | JSON `interno` (stack solo con `--depurar`) | 70 |

  Códigos estables de error de uso (código 1) agregados por ADR-061 y ADR-062: `almacen-sin-esquema` (el mensaje nombra `bun run esquema`) y `via-no-soportada` (`OPENCODE_CONFIG_CONTENT` u `OPENCODE_PERMISSION` definidas; el mensaje nombra la variable).

- **Paridad:** la CLI y la web presentan el mismo objeto de respuesta del caso de uso; la web nunca calcula nada propio.
- **Web:**
  - solo `127.0.0.1`, solo GET, verificación de `Host` y sin CORS (RNF-09);
  - se rechazan las solicitudes con `Sec-Fetch-Site: cross-site` o `same-site`, en todas las rutas (ADR-062);
  - HTML generado en el servidor, sin JavaScript en el cliente;
  - **todo valor se escapa por defecto**, porque los valores de la configuración analizada pueden contener HTML. Insertar HTML sin escapar exige una función explícita, que solo usan las plantillas fijas.
- **Almacén (ADR-061):**
  - la Resolución es inmutable;
  - se conservan las últimas 20 por Proyecto;
  - el esquema se crea con `bun run esquema` desde `esquemas/almacen/`;
  - RIGE nunca migra en silencio: si `user_version` no coincide, falla con `almacen-sin-esquema`.
- **Vías del adaptador del v1 (ADR-062, C8):**
  - se observan todas las vías locales de archivo, y el worktree se detecta subiendo hasta un `.git`;
  - si `OPENCODE_CONFIG_CONTENT` u `OPENCODE_PERMISSION` están definidas, se falla con `via-no-soportada`;
  - las vías remotas figuran como no observadas.
- **Idioma:** los identificadores del dominio, las carpetas y los casos de uso van en español, sin tildes ni ñ.
- **Copia del evaluador de OpenCode:** extracción literal en `paquetes/opencode/vendor/`, con `LICENSE` MIT y `PROCEDENCIA.md` (hash del original y de la versión propia; cambios limitados a imports y envoltorio).

## 6. Pruebas

- **Una prueba por criterio de aceptación**, en `pruebas/aceptacion/`, con el ID en el nombre (`RF-01.test.ts`, `describe("RF-01 CA-2", …)`).
- **Las pruebas unitarias** van junto al código (`*.test.ts`).
- **Aislamiento obligatorio (ADR-062, C6):**
  - las pruebas unitarias reciben el entorno por el puerto, como objeto de prueba, y nunca modifican `process.env`;
  - las pruebas de aceptación lanzan la CLI o el servidor como **subproceso**, con un entorno construido desde cero:
    - `HOME`, `USERPROFILE`, `XDG_*`, `LOCALAPPDATA`, `APPDATA` y `RIGE_ALMACEN` apuntan a un directorio temporal;
    - las variables `OPENCODE_*` quedan vacías;
    - del entorno real se heredan solo `PATH` y `SystemRoot`;
  - la precarga de `bun test` (`pruebas/preparar-entorno.ts`) redirige esas variables y falla si alguna apunta al HOME real;
  - nunca se lee la configuración real del usuario (`~/.config/opencode`);
  - los escenarios viven en `pruebas/escenarios/` y se copian a un temporal antes de analizarse;
  - entre `pruebas/escenarios/` y la raíz del repositorio no puede haber ningún `opencode.json`, `opencode.jsonc` ni `.opencode/`. Nunca crees esos archivos en `src/`.
  - el puerto de las pruebas se obtiene libre en cada corrida; nunca se usa el 4747.
- **Las pruebas se escriben antes que el código**, a partir del criterio de aceptación.

## 7. Forma de trabajo

- **Una tarea por ejecución (ADR-067).** Hacé solo lo que pide la ficha, vos mismo, sin subagentes. Si la ficha no alcanza o algo contradice un ADR, no escribas código: detenete y dejá la pregunta, con su fundamento, en tu respuesta final.
- **TDD estricto**, ejecutor `bun test`. Por cada criterio: prueba primero y verla fallar, mínimo código para que pase, refactorización. Mientras trabajás corré solo las pruebas de los archivos que tocás; la suite completa y `bun run verificar`, una vez, antes del commit. Recortá las salidas largas (últimas líneas) para no llenar el contexto.
- **Evidencia en el mensaje del commit:** una línea por criterio con el comando de la prueba y su resultado en rojo y en verde, y el resultado final de la suite y de `verificar`.
- **Commits solo en la rama del incremento**, uno por tarea (salvo que la ficha pida otro), con Conventional Commits en español. Agregá solo rutas explícitas dentro de `src/`; nunca `git add -A` ni `git add .`. **Nunca** subir, unir con `main` ni crear etiquetas: eso lo hace el autor después de la revisión.
- **Todo comando** necesario para instalar, configurar, ejecutar o probar figura en `src/README.md`.
- **No se escriben archivos del repositorio fuera de `src/`.** Los datos de ejecución van a temporales del sistema; en toda ejecución del agente, `RIGE_ALMACEN` apunta a un temporal (ADR-066).

