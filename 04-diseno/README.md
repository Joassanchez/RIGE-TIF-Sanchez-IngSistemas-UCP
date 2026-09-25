# Diseño de RIGE

Esta carpeta reúne los tres elementos de diseño que fija la Guía de la AE2 (10.2): las decisiones de arquitectura con sus alternativas, el modelo de datos y la configuración del canal de integración continua.

Cada elemento se presenta por remisión a su fuente única (ADR-043). Los registros de decisión (ADR) se mantienen en [`00-gestion/decisiones/`](../00-gestion/decisiones/INDICE.md), junto con las decisiones de método y de gestión del proyecto. La configuración del canal reside en `.github/workflows/`, única ubicación que ejecuta el servicio de integración continua.

## 1. Decisiones de arquitectura

Cada registro contiene el contexto, las alternativas evaluadas con su criterio de descarte, la recomendación, la condición que la invalidaría y las consecuencias. La deliberación que corresponde al informe consta en su Anexo III.

| ADR | Decisión | Estado | Qué fija en el diseño |
|---|---|---|---|
| [ADR-002](../00-gestion/decisiones/ADR-002-verificar-oe-1-contra-resolucion.md) | Verificar el OE-1 contra la resolución por agente de la herramienta | aceptado | Referencia de verificación de la resolución: el valor efectivo por agente que informa OpenCode 1.18.25 |
| [ADR-006](../00-gestion/decisiones/ADR-006-incorporar-funciones-evaluacion-permisos-herramienta.md) | Incorporar las funciones de evaluación de permisos de la herramienta, bajo su licencia | aceptado | Las decisiones de permiso se calculan con el evaluador de OpenCode, no con una reimplementación |
| [ADR-008](../00-gestion/decisiones/ADR-008-adoptar-agente-como-eje-representacion.md) | Adoptar el agente como eje de la representación | aceptado | Organización del estado resuelto y de las consultas en torno al agente |
| [ADR-017](../00-gestion/decisiones/ADR-017-incorporar-interfaz-linea-comandos-solo.md) | Incorporar una interfaz de línea de comandos de solo lectura, con salida estructurada | aceptado | Existencia de la interfaz programática y su carácter de solo lectura |
| [ADR-019](../00-gestion/decisiones/ADR-019-modelo-dominio-mixto-agente-entidad.md) | Modelo del dominio mixto: Agente como entidad de primera clase y Elemento genérico con subtipos | aceptado | Estructura del modelo del dominio sobre la que se deriva el modelo de datos |
| [ADR-021](../00-gestion/decisiones/ADR-021-explicacion-lenguaje-natural-mediante-plantillas.md) | Explicación en lenguaje natural mediante plantillas deterministas, sin modelo de lenguaje | aceptado; reemplazado parcialmente por ADR-036 | Mecanismo de explicación de decisiones de permiso y hallazgos, determinista y sin conexión |
| [ADR-022](../00-gestion/decisiones/ADR-022-salida-linea-comandos-version-minima.md) | Salida por línea de comandos en versión mínima | aceptado; reemplazado parcialmente por ADR-041 | Consulta de valores efectivos con procedencia; salida estructurada y determinista |
| [ADR-023](../00-gestion/decisiones/ADR-023-persistencia-almacen-propio-cache-hash.md) | Persistencia: almacén propio, con la caché por hash diferida | aceptado (opción B) | Almacén propio de la resolución, sin caché en el período |
| [ADR-029](../00-gestion/decisiones/ADR-029-estrategia-oraculo-hibrida-resultados-referencia.md) | Estrategia de oráculo híbrida | aceptado | Resultados de referencia versionados y regeneración completa con OpenCode 1.18.25 al cierre de cada iteración |
| [ADR-032](../00-gestion/decisiones/ADR-032-stack-typescript-bun-interfaz-web-local.md) | Stack del prototipo | aceptado | TypeScript sobre Bun 1.3.14; interfaz web local en `127.0.0.1`; SQLite embebido; evaluador incorporado por copia atribuida; GitHub Actions |
| [ADR-036](../00-gestion/decisiones/ADR-036-esquema-salida-cli-rf03-compatibilidad-rnf08.md) | Esquema de la salida por línea de comandos | aceptado (C y E3) | Esquema publicado y versionado; explicación a pedido con `--explicar` |
| [ADR-037](../00-gestion/decisiones/ADR-037-plataformas-rnf06-papel-contenedor.md) | Plataformas de RNF-06 y papel del contenedor | aceptado (C, P1 a P3) | Ubuntu 26.04 de referencia y Windows 11 declarada; matriz de CI; rutas normalizadas en las pruebas; aislamiento del oráculo |
| [ADR-041](../00-gestion/decisiones/ADR-041-cli-consulta-permisos-medicion-agentes.md) | La línea de comandos incorpora la consulta de decisiones de permiso | aceptado | Consulta de decisiones de permiso por línea de comandos |
| [ADR-042](../00-gestion/decisiones/ADR-042-linea-comandos-iteracion-2.md) | Línea de comandos completa e interfaz web limitada | aceptado (B') | Papel de cada interfaz: línea de comandos completa; interfaz web limitada a formularios y vistas mínimas |

## 2. Modelo de datos

[DECISIÓN PENDIENTE: esquema del almacén SQLite (ADR-023 y ADR-032); se define con el diseño del prototipo v1.]

El modelo del dominio del que se deriva se encuentra en [`03-requisitos/libro/entidades.md`](../03-requisitos/libro/entidades.md).

## 3. Canal de integración continua

[DECISIÓN PENDIENTE: configuración del canal en `.github/workflows/ci.yml`; se define con el diseño del prototipo v1, con la matriz de plataformas de ADR-037.]
