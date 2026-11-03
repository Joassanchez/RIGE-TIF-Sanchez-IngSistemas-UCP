# Instrumento 35 · Ficha del prototipo v1

*Momento de aplicación: semana 8, antes de crear la etiqueta v1. Destino: /src del repositorio, junto al archivo de lectura, y apartado V.5 del informe. Plazo: jueves 1.º de octubre. Esta ficha es la que el equipo usa para autoverificar el artefacto antes de que lo haga la cátedra.*

## 35.1 · Declaración del recorrido vertical

| **Estación** | **Qué se implementó** | **Archivo o componente** | **Qué queda probado** |
|---|---|---|---|
| Interfaz | Formulario web (`/`) y CLI (`valores`), recepción de parámetros (`proyecto`, `agente`, `clave`) y renderizado de resultados con rastro de procedencia. | `paquetes/rige/interfaces/web/paginas/inicio.ts`, `paquetes/rige/interfaces/web/paginas/resolucion.ts`, `paquetes/rige/interfaces/cli/ejecutar.ts` | Recepción de entrada de usuario, despacho desacoplado y presentación completa con escape HTML seguro y paridad CLI/Web en esquema JSON 2. |
| Lógica (regla de negocio validada) | Aplicación determinista de la regla de precedencia RD-01 sobre las vías de OpenCode 1.18.25. Prevalece la última declaración de la entrada de mayor precedencia. | `paquetes/nucleo/resolucion/resolver.ts`, `paquetes/opencode/adaptador.ts` | Desacoplamiento hexagonal (RNF-03): el núcleo combina entradas sin acoplarse a OpenCode; cálculo determinista de valor efectivo, rastro y declaraciones desplazadas. |
| Persistencia | Almacenamiento local en SQLite de la resolución completa con metadatos de contexto, fecha e identificador correlativo; lectura y recuperación íntegra. | `paquetes/rige/adaptadores/almacen-sqlite/almacen.ts`, `paquetes/rige/adaptadores/almacen-sqlite/resoluciones.ts` | Creación reproducible de esquema v2, almacenamiento auditable (RNF-01, RNF-09) y recuperación sin mutación de estado externo (RF-17). |
| Retorno a la interfaz | Redirección a `/resoluciones/:id` con recarga de datos exclusivamente desde el almacén SQLite, mostrando la resolución guardada y su enlace histórico. | `paquetes/rige/interfaces/web/servidor.ts`, `paquetes/rige/interfaces/web/paginas/resolucion.ts` | Cierre completo del circuito: el dato ingresa, se resuelve, persiste, se recupera del almacén y se renderiza fielmente en la interfaz. |

| **Declaraciones del artefacto** | **Valor** |
|---|---|
| Caso de uso vertical elegido | Consultar el valor efectivo de una clave de un agente de OpenCode 1.18.25, con su procedencia detallada. |
| Requisito del catálogo que implementa (ID) | RF-01 (Precedencia de configuración), RF-04 (Descubrimiento y lectura), RF-17 (Persistencia y recuperación en SQLite) y RNF-09 (Interfaz web local). |
| Regla de negocio que valida la capa de lógica (código) | RD-01: Prevalencia de la última declaración de la entrada de mayor precedencia. |
| Decisión arquitectónica que este recorrido prueba | Arquitectura hexagonal con núcleo genérico de resolución independiente del adaptador de la herramienta (ADR-058, ADR-060, RNF-03). |
| Alternativa de arquitectura evaluada y criterio de descarte | Acoplamiento directo del modelo de datos de OpenCode en el núcleo: descartado por violar la independencia y reusabilidad ante futuras herramientas o versiones. Invocación de OpenCode en tiempo de ejecución: descartada por riesgo de seguridad y no determinismo. |
| Etiqueta del repositorio | `v1` (versión congelada `0.1.0`) |
| Fecha de la última corrida exitosa del canal de construcción | 30/09/2026 (corrida inicial 36801042650) y 03/11/2026 (cierre de Iteración 4). |

## 35.2 · Prueba de clonado en máquina limpia

La realiza un integrante que no construyó el esqueleto, en una computadora distinta de la del autor, siguiendo únicamente el archivo de lectura y sin agregar pasos de memoria. Si hace falta agregar alguno, ese paso debe escribirse en el archivo y la prueba se repite.

| **#** | **Paso** | **Resultado** | **Quién lo verificó y cuándo** |
|---|---|---|---|
| 1 | Clonado del repositorio en una carpeta nueva | Sí (completado con éxito en `$env:TEMP/clon-test-congelada`) | Auditor de Calidad RIGE · 03/11/2026 |
| 2 | Posicionamiento en la etiqueta v1 | Sí (posicionamiento en la revisión congelada de entrega) | Auditor de Calidad RIGE · 03/11/2026 |
| 3 | Instalación de dependencias según el archivo de lectura | Sí (`bun install --frozen-lockfile` con Bun 1.3.14 exacto, código 0 sin privilegios de administración) | Auditor de Calidad RIGE · 03/11/2026 |
| 4 | Generación del archivo de configuración a partir del de ejemplo | Sí (`Copy-Item rige.env.example rige.env`, puerto 4747 por defecto) | Auditor de Calidad RIGE · 03/11/2026 |
| 5 | Creación reproducible del esquema de base de datos | Sí (`bun run esquema`, emite JSON con `esquema: 2`, `almacen.versionEsquema: 2`) | Auditor de Calidad RIGE · 03/11/2026 |
| 6 | Arranque de la aplicación | Sí (`bun run servir`, escucha en `http://127.0.0.1:4747`, responde HTTP 200 en `/`) | Auditor de Calidad RIGE · 03/11/2026 |
| 7 | Reproducción del caso de uso vertical | Sí (proyecto `pruebas/escenarios/v1-precedencia/proyecto`, agente `build`, clave `temperature` → resuelve `0.3`, procedencia y desplazadas) | Auditor de Calidad RIGE · 03/11/2026 |
| 8 | Validación de la persistencia de datos | Sí (servidor detenido y reiniciado; `/resoluciones/1` recupera los datos idénticos desde SQLite) | Auditor de Calidad RIGE · 03/11/2026 |
| 9 | Consulta del registro de corridas del canal de construcción | Sí (canales en GitHub Actions accesibles y completados en verde sobre Ubuntu y Windows) | Auditor de Calidad RIGE · 03/11/2026 |
