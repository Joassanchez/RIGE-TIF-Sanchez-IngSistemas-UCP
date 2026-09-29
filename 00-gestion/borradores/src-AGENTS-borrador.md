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
  - ADR-054: plataformas.
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

Workspaces de Bun 1.3.14 con instalación aislada (`install.hoist = false`): `paquetes/nucleo`, `paquetes/opencode` y `paquetes/rige`.

| Módulo | Puede depender de |
|---|---|
| `nucleo` | nada externo; ningún módulo del runtime con E/S |
| `opencode` | `nucleo` y las bibliotecas que admita la política de dependencias (ADR-062) |
| `rige/aplicacion` | `nucleo` |
| `rige/adaptadores` | `rige/aplicacion` (puertos) y `nucleo`. Solo `adaptadores/sistema` importa `node:fs`, y solo para leer; solo `adaptadores/almacen-sqlite` importa `bun:sqlite` |
| `rige/interfaces` | `rige/aplicacion`; nunca los adaptadores |
| `rige/arranque` | todo; es el único punto de ensamblado |

Agregar una dependencia externa requiere autorización del autor.

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

- **Paridad:** la CLI y la web presentan el mismo objeto de respuesta del caso de uso; la web nunca calcula nada propio.
- **Web:** solo `127.0.0.1`, solo GET, verificación de `Host`, sin CORS (RNF-09).
- **Idioma:** los identificadores del dominio, las carpetas y los casos de uso van en español, sin tildes ni ñ.
- **Copia del evaluador de OpenCode:** extracción literal en `paquetes/opencode/vendor/`, con `LICENSE` MIT y `PROCEDENCIA.md` (hash del original y de la versión propia; cambios limitados a imports y envoltorio).

## 6. Pruebas

- **Una prueba por criterio de aceptación**, en `pruebas/aceptacion/`, con el ID en el nombre (`RF-01.test.ts`, `describe("RF-01 CA-2", …)`).
- **Las pruebas unitarias** van junto al código (`*.test.ts`).
- **Aislamiento obligatorio:**
  - toda prueba corre con `HOME`, `USERPROFILE` y `XDG_*` apuntando a un directorio temporal, y con las variables `OPENCODE_*` vacías;
  - nunca se lee la configuración real del usuario (`~/.config/opencode`);
  - los escenarios viven en `pruebas/escenarios/`.
- **Las pruebas se escriben antes que el código**, a partir del criterio de aceptación.

## 7. Forma de trabajo

- **Se implementa solo un incremento con plan aprobado por el autor.** Si el plan no alcanza o algo contradice un ADR, detenete y preguntá.
- **Sin commits ni etiquetas.** Los hace el autor después de revisar el diff.
- **Todo comando** necesario para instalar, configurar, ejecutar o probar figura en `src/README.md`.
- **No se escribe fuera de `src/`.**
