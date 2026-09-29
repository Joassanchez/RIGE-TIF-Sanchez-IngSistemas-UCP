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
| [ADR-032](../00-gestion/decisiones/ADR-032-stack-typescript-bun-interfaz-web-local.md) | Stack del prototipo | aceptado | TypeScript sobre Bun 1.3.14; interfaz web local en `127.0.0.1`; SQLite embebido; evaluador incorporado por copia atribuida; GitHub Actions |
| [ADR-051](../00-gestion/decisiones/ADR-051-interfaces-salida-explicacion-consolidado.md) | Interfaces: línea de comandos completa y web local limitada | aceptado | CLI con valores, permisos y hallazgos; esquema de salida publicado y versionado; `--explicar` a pedido; web limitada a formularios y vistas; explicación por plantillas deterministas |
| [ADR-054](../00-gestion/decisiones/ADR-054-plataformas-entorno-referencia-consolidado.md) | Plataformas y entorno de referencia | aceptado | Ubuntu 26.04 de referencia y Windows 11 declarada; matriz de CI; rutas normalizadas en las pruebas; imagen de contenedor común para el oráculo y las mediciones |
| [ADR-058](../00-gestion/decisiones/ADR-058-arquitectura-puertos-adaptadores-estructura-src.md) | Arquitectura de puertos y adaptadores y estructura de `src/` | aceptado | Núcleo sin dependencias; paquetes `nucleo`, `opencode` y `rige` con instalación aislada; reglas de dependencia verificadas; política de OpenCode en el adaptador; RNF-01, RNF-04 y RNF-05 por construcción; errores por categorías; contrato de canales y códigos de la CLI |
| [ADR-059](../00-gestion/decisiones/ADR-059-revision-catalogo-casos-uso.md) | Revisión del catálogo y de los casos de uso | aceptado | Modelo de casos de uso que implementa la capa de aplicación (CU-01 como subfunción; CU-02 a CU-05, con CU-05 reasignado a explorar agentes); resolución genérica con proyección por agente; adaptador ficticio como prueba de RNF-03; seguridad de la web (RNF-09) |
| [ADR-060](../00-gestion/decisiones/ADR-060-contrato-adaptador-modelo-rastro.md) | Contrato entre el núcleo y el adaptador y modelo del rastro | aceptado | Descriptor de capacidades; secuencia de aplicaciones ejecutada por el núcleo con estrategias intercambiables; evaluador aportado por el adaptador; rastro de valor y rastro de decisión; orígenes declarado, implícito y nativo; resumen de entradas leídas; medición por etapas a pedido |
| [ADR-061](../00-gestion/decisiones/ADR-061-ciclo-vida-resolucion-modelo-datos.md) | Ciclo de vida de la Resolución y modelo de datos del almacén | aceptado | Proyecto identificado por su ruta canónica; Resolución inmutable persistida como documento con sus entradas leídas en tablas; retención de las últimas veinte por Proyecto; esquema creado por guion explícito con versión verificada al arrancar |
| [ADR-062](../00-gestion/decisiones/ADR-062-distribucion-web-dependencias-configuracion.md) | Distribución, web, dependencias, configuración propia, versionado y arnés de pruebas | aceptado | Ejecución con `bun run` sobre el código fuente; HTML generado en el servidor con escape por defecto; dependencias exactas, las de ejecución solo si la herramienta las usa en la misma versión; configuración propia en `rige.env`; versiones independientes de RIGE, del esquema de salida y de la base; pruebas aisladas por subproceso; rechazo de solicitudes de otro sitio; vías locales observadas por el adaptador del v1 |

## 2. Modelo de datos

El modelo de datos del almacén SQLite se fija en [ADR-061](../00-gestion/decisiones/ADR-061-ciclo-vida-resolucion-modelo-datos.md), sección «Recomendación y fundamento». Comprende:
- las tablas `proyecto`, `resolucion` y `entrada_leida`, con sus restricciones;
- el ciclo de vida de la Resolución;
- la retención;
- los pragmas de la conexión.

El guion versionado que crea el esquema reside en `src/esquemas/almacen/` (`001_inicial.sql`, `PRAGMA user_version = 1`), única fuente de la estructura de la base.

El modelo del dominio del que se deriva se encuentra en [`03-requisitos/libro/entidades.md`](../03-requisitos/libro/entidades.md).

## 3. Canal de integración continua

El canal se configura en `.github/workflows/ci.yml` y corre en cada envío y en cada solicitud de integración.

Matriz de plataformas (ADR-054): `ubuntu-latest` y `windows-latest`.

Pasos (ADR-032 y ADR-062):
1. instalación de Bun 1.3.14;
2. `bun install --frozen-lockfile`;
3. `bun run verificar`, que comprende la verificación de tipos con TypeScript 7.0.2 y una construcción de comprobación;
4. `bun test`.

Las pruebas incluyen:
- las de arquitectura: RNF-03 CA-1 y CA-2, RNF-05, aislamiento del entorno y guarda del repositorio;
- las del almacén (ADR-061);
- las de aceptación, una por criterio, con el ID en el nombre.

El archivo reside en `.github/workflows/ci.yml`; el incremento 0 (`src/odd/tasks/v1-inc0-esqueleto.md`) construye lo que el canal ejecuta. El registro de corridas se consulta en la pestaña Actions del repositorio.
