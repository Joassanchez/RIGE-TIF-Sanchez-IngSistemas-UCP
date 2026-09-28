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

## 2. Modelo de datos

[DECISIÓN PENDIENTE: esquema del almacén SQLite (ADR-023 y ADR-032); se define con el diseño del prototipo v1.]

El modelo del dominio del que se deriva se encuentra en [`03-requisitos/libro/entidades.md`](../03-requisitos/libro/entidades.md).

## 3. Canal de integración continua

[DECISIÓN PENDIENTE: configuración del canal en `.github/workflows/ci.yml`; se define con el diseño del prototipo v1, con la matriz de plataformas de ADR-054.]
