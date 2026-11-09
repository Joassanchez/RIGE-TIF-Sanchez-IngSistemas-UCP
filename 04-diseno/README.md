# Diseño de RIGE

Esta carpeta reúne los tres elementos de diseño que fija la Guía de la AE2 (10.2): las decisiones de arquitectura con sus alternativas, el modelo de datos y la configuración del canal de integración continua.

Cada elemento se presenta por remisión a su fuente única (diseño del sistema, D-23). Los registros de decisión (ADR) se mantienen en [`00-gestion/decisiones/`](../00-gestion/decisiones/INDICE.md), junto con las decisiones de método y de gestión del proyecto. La configuración del canal reside en `.github/workflows/`, única ubicación que ejecuta el servicio de integración continua.

## 1. Decisiones de arquitectura

Cada registro contiene el contexto, las alternativas evaluadas con su criterio de descarte, la recomendación, la condición que la invalidaría y las consecuencias. La deliberación que corresponde al informe consta en su Anexo III.

| ADR | Decisión | Estado | Qué fija en el diseño |
|---|---|---|---|
| [D-02](../00-gestion/anexo-III.md) (antes ADR-002) | Verificar el OE-1 contra la resolución por agente de la herramienta | aceptado | Referencia de verificación de la resolución: el valor efectivo por agente que informa OpenCode 1.18.25 |
| [D-06](../00-gestion/anexo-III.md) (antes ADR-006) | Incorporar las funciones de evaluación de permisos de la herramienta, bajo su licencia | aceptado | Las decisiones de permiso se calculan con el evaluador de OpenCode, no con una reimplementación |
| [D-08](../00-gestion/anexo-III.md) (antes ADR-008) | Adoptar el agente como eje de la representación | aceptado | Organización del estado resuelto y de las consultas en torno al agente |
| [D-17](../00-gestion/anexo-III.md) (antes ADR-017) | Incorporar una interfaz de línea de comandos de solo lectura, con salida estructurada | aceptado | Existencia de la interfaz programática y su carácter de solo lectura |
| [ADR-019](../00-gestion/decisiones/ADR-019-modelo-dominio-mixto-agente-entidad.md) | Modelo del dominio mixto: Agente como entidad de primera clase y Elemento genérico con subtipos | aceptado | Estructura del modelo del dominio sobre la que se deriva el modelo de datos |
| [ADR-023](../00-gestion/decisiones/ADR-023-persistencia-almacen-propio-cache-hash.md) | Persistencia: almacén propio, con la caché por hash diferida | aceptado (opción B) | Almacén propio de la resolución, sin caché en el período |
| [ADR-029](../00-gestion/decisiones/ADR-029-estrategia-oraculo-hibrida-resultados-referencia.md) | Estrategia de oráculo híbrida | aceptado | Resultados de referencia versionados y regeneración completa con OpenCode 1.18.25 al cierre de cada iteración |
| [ADR-080](../00-gestion/decisiones/ADR-080-conjunto-escenarios-aceptacion-sin-retiro.md) | Conjunto de aceptación de RIGE con manifiesto y cobertura obligatoria | aceptado | Manifiesto versionado de escenarios y del entorno de RF-07; corte el 07/11/2026; retiro o modificación solo por causa enumerada, autorizada y registrada; un OE se alcanza con cero fallas y cobertura completa |
| [ADR-032](../00-gestion/decisiones/ADR-032-stack-typescript-bun-interfaz-web-local.md) | Stack del prototipo | aceptado | TypeScript sobre Bun 1.3.14; interfaz web local en `127.0.0.1`; SQLite embebido; evaluador incorporado por copia atribuida; GitHub Actions |
| [ADR-051](../00-gestion/decisiones/ADR-051-interfaces-salida-explicacion-consolidado.md) | Interfaces: línea de comandos completa y web local limitada | aceptado | CLI con valores, permisos y hallazgos; esquema de salida publicado y versionado; `--explicar` a pedido; web limitada a formularios y vistas; explicación por plantillas deterministas |
| [ADR-054](../00-gestion/decisiones/ADR-054-plataformas-entorno-referencia-consolidado.md) | Plataformas y entorno de referencia | aceptado | Ubuntu 26.04 de referencia y Windows 11 declarada; matriz de CI; rutas normalizadas en las pruebas; imagen de contenedor común para el oráculo y las mediciones |
| [ADR-058](../00-gestion/decisiones/ADR-058-arquitectura-puertos-adaptadores-estructura-src.md) | Arquitectura de puertos y adaptadores y estructura de `src/` | aceptado | Núcleo sin dependencias; paquetes `nucleo`, `opencode` y `rige` con instalación aislada; reglas de dependencia verificadas; política de OpenCode en el adaptador; RNF-01, RNF-04 y RNF-05 por construcción; errores por categorías; contrato de canales y códigos de la CLI |
| [ADR-059](../00-gestion/decisiones/ADR-059-revision-catalogo-casos-uso.md) | Revisión del catálogo y de los casos de uso | aceptado | Modelo de casos de uso que implementa la capa de aplicación (CU-01 como subfunción; CU-02 a CU-05, con CU-05 reasignado a explorar agentes); resolución genérica con proyección por agente; adaptador ficticio como prueba de RNF-03; seguridad de la web (RNF-09) |
| [ADR-060](../00-gestion/decisiones/ADR-060-contrato-adaptador-modelo-rastro.md) | Contrato entre el núcleo y el adaptador y modelo del rastro | aceptado | Descriptor de capacidades; secuencia de aplicaciones ejecutada por el núcleo con estrategias intercambiables; evaluador aportado por el adaptador; rastro de valor y rastro de decisión; orígenes declarado, implícito y nativo; resumen de entradas leídas; medición por etapas a pedido |
| [ADR-061](../00-gestion/decisiones/ADR-061-ciclo-vida-resolucion-modelo-datos.md) | Ciclo de vida de la Resolución y modelo de datos del almacén | aceptado | Proyecto identificado por su ruta canónica; Resolución inmutable persistida como documento con sus entradas leídas en tablas; retención de las últimas veinte por Proyecto; esquema creado por guion explícito con versión verificada al arrancar |
| [ADR-062](../00-gestion/decisiones/ADR-062-distribucion-web-dependencias-configuracion.md) | Distribución, web, dependencias, configuración propia, versionado y arnés de pruebas | aceptado | Ejecución con `bun run` sobre el código fuente; HTML generado en el servidor con escape por defecto; dependencias exactas, las de ejecución solo si la herramienta las usa en la misma versión; configuración propia en `rige.env`; versiones independientes de RIGE, del esquema de salida y de la base; pruebas aisladas por subproceso; rechazo de solicitudes de otro sitio; vías locales observadas por el adaptador del v1 |
| [ADR-070](../00-gestion/decisiones/ADR-070-guardas-arquitectura-analizador-propio.md) | Guardas de arquitectura con un analizador léxico propio | aceptado | Reglas de dependencia, identificaciones, red y globales verificadas como pruebas con un tokenizador único sobre el escáner de TypeScript 7.0.2, sin herramientas externas; base de la verificación de RNF-03 |
| [ADR-109](../00-gestion/decisiones/ADR-109-matriz-ponderada-arquitectura-runtime.md) | Matriz de decisión ponderada de la arquitectura y del runtime (formalización posterior de ADR-058 y ADR-032) | aceptado | Criterios, pesos, puntajes y sensibilidad que fundamentan el estilo, el empaquetado y el runtime adoptados |
| [ADR-101](../00-gestion/decisiones/ADR-101-worktree-criterio-git-sin-procesos.md) | Descubrimiento del worktree leyendo `.git` sin ejecutar procesos | aceptado | Criterio de descubrimiento de git sin subprocesos; `"/"` sin repositorio o sin `git` en `PATH` |
| [ADR-102](../00-gestion/decisiones/ADR-102-deteccion-version-opencode-sin-ejecutar.md) | Detección de la versión instalada de OpenCode sin ejecutarlo | aceptado | Lectura del `package.json` de `opencode-ai` desde el primer `opencode` del `PATH`; `version-no-soportada` (código 1) o `version-no-determinada` (advertencia) |
| [ADR-104](../00-gestion/decisiones/ADR-104-resumen-variables-que-constituyen-entrada.md) | Resumen de las variables que constituyen una entrada | aceptado | `OPENCODE_CONFIG_CONTENT` y `OPENCODE_PERMISSION` entran por el resumen de su contenido dentro del resumen del conjunto; las que ubican entradas siguen por nombre y condición |
| [ADR-105](../00-gestion/decisiones/ADR-105-modelo-hallazgos-alcance-tipos.md) | Modelo de hallazgos y alcance de cada tipo | aceptado | Hallazgo como dato puro en el núcleo con explicación por plantilla en el adaptador; alcance y limitaciones de los seis tipos de RF-07 |
| [ADR-106](../00-gestion/decisiones/ADR-106-precision-adr-102-gestores-windows-path-inaccesible.md) | Precisión de ADR-102 sobre gestores en Windows y `PATH` inaccesible | aceptado | pnpm y bun en Windows dan `version-no-determinada`; un directorio del `PATH` con `EACCES`/`EPERM` se saltea como `execvp` y advierte `path-inaccesible` |

## 2. Modelo de datos

El modelo de datos del almacén SQLite se fija en [ADR-061](../00-gestion/decisiones/ADR-061-ciclo-vida-resolucion-modelo-datos.md), sección «Recomendación y fundamento». Comprende:
- las tablas `proyecto`, `resolucion` y `entrada_leida`, con sus restricciones;
- el ciclo de vida de la Resolución;
- la retención;
- los pragmas de la conexión.

Los guiones versionados que crean el esquema residen en `src/esquemas/almacen/`, única fuente de la estructura de la base:
- `001_inicial.sql` crea las tres tablas, sus índices y los disparadores que impiden modificar una Resolución o sus entradas leídas (`PRAGMA user_version = 1`);
- `002_formato2.sql` deja la base en `PRAGMA user_version = 2` sin cambiar las tablas: el formato 2 cambia el contenido del documento JSON (precisión de ADR-061 del 30/10/2026; ADR-062).

`bun run esquema` aplica los guiones en orden y es idempotente.

El modelo del dominio del que se deriva se encuentra en [`03-requisitos/libro/entidades.md`](../03-requisitos/libro/entidades.md).

## 3. Canal de integración continua

El canal se configura en `.github/workflows/ci.yml` y corre en cada envío (`on: push`). Tiene dos trabajos, cada uno con la matriz de plataformas de ADR-054: `ubuntu-26.04` y `windows-latest`.

Trabajo `verificar` (ADR-032 y ADR-062):
1. instalación de Bun 1.3.14;
2. `bun install --frozen-lockfile`;
3. `bun run verificar`, que comprende la verificación de tipos con TypeScript 7.0.2 y una construcción de comprobación;
4. `bun test`;
5. `bun run prueba:lenta`.

Trabajo `referencia-nativa`: instala Node.js 22 y `opencode-ai@1.18.25`, corre `bun run referencias` contra la instalación real y comprueba que la consulta de agentes no emite advertencias con la versión instalada (ADR-102).

Las pruebas incluyen:
- las de arquitectura: RNF-03 CA-1 y CA-2, RNF-05, aislamiento del entorno y guarda del repositorio;
- las del almacén (ADR-061);
- las de aceptación, una por criterio, con el ID en el nombre.

El archivo reside en `.github/workflows/ci.yml`. El registro de corridas se consulta en la pestaña Actions del repositorio.

## 4. Componentes de terceros

Inventario del 08/11/2026 sobre `main` (`0efa74f`), fuente de IX.4. Se vuelve a verificar sobre la etiqueta entregada (plan de cierre, B4), porque el bloque B3 todavía puede cambiar `package.json`.

Rótulos de la licencia: **[archivo]**, leída del `package.json` o del `LICENSE` instalado o copiado; **[CG]**, conocimiento general, que se confirma con el repositorio del proyecto antes de redactar.

### 4.1 Incorporados al producto

| Componente | Versión | Licencia | Cómo se incorpora | Motivo | Decisión |
|---|---|---|---|---|---|
| Evaluador de permisos de OpenCode (`evaluate`, `expand`, `fromConfig`, `merge`, `disabled`, `match`) | Etiqueta `v1.18.25` | MIT [archivo: `src/paquetes/opencode/vendor/LICENSE`] | Copia atribuida en `src/paquetes/opencode/vendor/`, con cabecera, `AVISOS.md` y `PROCEDENCIA.md` (SHA-256 del tarball y de cada archivo de origen) | Fidelidad por construcción con la herramienta | D-06; ADR-032, eje 3; ADR-058, eje 7 |
| Reglas y agentes nativos de OpenCode | Etiqueta `v1.18.25` | MIT [archivo] | Transcriptos como datos (`agentes-nativos.ts`, `textos-agentes.ts`) | Reproducir los valores implícitos sin ejecutar la herramienta | ADR-032, precisiones del 28/09/2026; ADR-060 |
| `jsonc-parser` | 3.3.1 | MIT [archivo] | Dependencia de ejecución de `@rige/opencode` | Lee JSONC con el mismo analizador y versión que OpenCode | ADR-062 |
| Bun (runtime, `bun:sqlite`, `bun test`, servidor HTTP) | 1.3.14 | MIT [CG] | Prerrequisito único de ejecución | Runtime de origen del evaluador; SQLite, pruebas y servidor integrados | ADR-032, eje 1; ADR-109 |
| SQLite (embebido en Bun) | La de Bun 1.3.14 | Dominio público [CG] | A través de `bun:sqlite` | Almacén con esquema por guion en un motor real | ADR-023; ADR-032; ADR-061 |

### 4.2 De desarrollo y verificación (no se distribuyen con el producto)

| Componente | Versión | Licencia | Uso | Decisión |
|---|---|---|---|---|
| TypeScript | 7.0.2 | Apache-2.0 [archivo] | Verificación de tipos y escáner de las guardas de arquitectura | ADR-062; ADR-070 |
| `@types/bun` y `bun-types` | 1.3.14 | MIT [archivo] | Tipos del runtime | ADR-062 |
| `@types/node` y `undici-types` | 26.6.3 y 8.9.0 | MIT [archivo] | Transitivas de `bun-types` (`bun.lock`) | — |
| GitHub Actions: `actions/checkout`, `oven-sh/setup-bun`, `actions/setup-node` | `v5`, `v2`, `v5` | MIT [CG] | Canal de integración continua | ADR-032, eje 4 |
| Node.js y `opencode-ai` | 22 y 1.18.25 | MIT [CG] y MIT [archivo] | Solo en el trabajo `referencia-nativa` del CI: OpenCode real como referencia | ADR-029; ADR-102 |
| Imagen `ubuntu:26.04` | Fijada por resumen en `01-relevamiento/linea-base/vm/Dockerfile` | Licencias de la distribución [CG] | Contenedor de referencia del oráculo, la medición y RNF-07 | ADR-054 |
