# Instrumento 35 · Ficha del prototipo v1


*Momento de aplicación: semana 8, antes de crear la etiqueta v1. Destino: /src del repositorio, junto al archivo de lectura, y apartado V.5 del informe. Plazo: jueves 1.º de octubre. Esta ficha es la que el equipo usa para autoverificar el artefacto antes de que lo haga la cátedra.*

**35.1 · Declaración del recorrido vertical**

| **Estación**                       | **Qué se implementó** | **Archivo o componente** | **Qué queda probado** |
|------------------------------------|-----------------------|--------------------------|-----------------------|
| Interfaz | Formulario de la página inicial que recibe el proyecto, el agente y la clave, y lo envía por GET a `/resolver`; solo atiende solicitudes locales (RNF-09) | `src/paquetes/rige/interfaces/web/paginas/inicio.ts`; `src/paquetes/rige/interfaces/web/servidor.ts` | El dato ingresa por la interfaz con la ruta que indica el archivo de lectura (`recorrido-v1.test.ts`, V-0 y V-1) |
| Lógica (regla de negocio validada) | El adaptador de OpenCode ubica y lee las entradas y declara su orden de aplicación; el núcleo genérico aplica RD-01 (prevalece la declaración de la última entrada que declara la clave) y registra la declaración determinante y las desplazadas | `src/paquetes/opencode/` (ubicador, lector, secuenciador); `src/paquetes/nucleo/resolucion/` | El valor coincide con OpenCode 1.18.25 en dos escenarios de referencia (`RF-01.test.ts`); el núcleo no depende del adaptador y un adaptador ficticio se resuelve sin modificarlo (`RNF-03.test.ts`, CA-1 a CA-3) |
| Persistencia | La resolución se guarda en el almacén SQLite propio como documento inmutable, con su fecha, el resumen de las entradas leídas y una fila por entrada; se conservan las últimas 20 por proyecto | `src/paquetes/rige/adaptadores/almacen-sqlite/resoluciones.ts`; `src/esquemas/almacen/001_inicial.sql` | RF-17 CA-1 a CA-3 (`resoluciones.test.ts`; `recorrido-v1.test.ts`, V-3 a V-5); las entradas analizadas no cambian (RNF-01, V-6) |
| Retorno a la interfaz | La página `/resoluciones/<id>` se arma con la resolución leída del almacén: valor efectivo, declaración determinante con archivo, línea y columna, declaraciones desplazadas, entradas leídas y resoluciones anteriores del proyecto | `src/paquetes/rige/interfaces/web/paginas/resolucion.ts`; `src/paquetes/rige/aplicacion/casos-uso/consultar-resolucion.ts` | Reiniciado el servidor, la misma dirección devuelve la misma página, leída del almacén (`recorrido-v1.test.ts`, V-3) |

| **Declaraciones del artefacto**                              |     |
|--------------------------------------------------------------|-----|
| Caso de uso vertical elegido                                 | CU-02 mínimo (consultar el valor efectivo de una clave de un agente, con su procedencia), precedido por CU-01 mínimo (analizar el proyecto y registrar la resolución), sobre el escenario `src/pruebas/escenarios/v1-precedencia/` con tres entradas de distinta precedencia |
| Requisito del catálogo que implementa (ID)                   | RF-01 (CA-1 y CA-2) y RF-17 (CA-1 a CA-3); además RNF-01, RNF-03 y RNF-09 |
| Regla de negocio que valida la capa de lógica (código)       | RD-01 |
| Decisión arquitectónica que este recorrido prueba            | Separación entre un núcleo genérico que ejecuta la combinación y un adaptador por herramienta que declara el orden de las entradas y la estrategia de cada aplicación (ADR-058, ADR-060; RNF-03), con la resolución persistida como documento inmutable (ADR-061) |
| Alternativa de arquitectura evaluada y criterio de descarte  | Descriptor declarativo con el que el núcleo resuelve solo (ADR-060, R-A): se descartó porque no expresa las derivaciones que OpenCode aplica después de fusionar sin convertirse en un lenguaje propio. Adaptador que resuelve y devuelve el resultado (R-B): se descartó porque vacía el núcleo y el adaptador ficticio de RNF-03 no ejercitaría nada de él |
| Etiqueta del repositorio                                     | v1  |
| Fecha de la última corrida exitosa del canal de construcción | [DATO PENDIENTE: fecha y número de la corrida del CI sobre el commit etiquetado como v1] |

**35.2 · Prueba de clonado en máquina limpia**

La realiza un integrante que no construyó el esqueleto, en una computadora distinta de la del autor, siguiendo únicamente el archivo de lectura y sin agregar pasos de memoria. Si hace falta agregar alguno, ese paso debe escribirse en el archivo y la prueba se repite.

| **\#** | **Paso**                                                    | **Resultado** | **Quién lo verificó y cuándo** |
|--------|-------------------------------------------------------------|---------------|--------------------------------|
| 1 | Clonado del repositorio en una carpeta nueva | [DATO PENDIENTE: resultado] | [DATO PENDIENTE: integrante, equipo y fecha] |
| 2 | Posicionamiento en la etiqueta v1 | [DATO PENDIENTE: resultado] | [DATO PENDIENTE: integrante, equipo y fecha] |
| 3 | Instalación de dependencias según el archivo de lectura | [DATO PENDIENTE: resultado] | [DATO PENDIENTE: integrante, equipo y fecha] |
| 4 | Configuración de variables a partir del archivo de ejemplo | [DATO PENDIENTE: resultado] | [DATO PENDIENTE: integrante, equipo y fecha] |
| 5 | Creación del esquema de la base de datos | [DATO PENDIENTE: resultado] | [DATO PENDIENTE: integrante, equipo y fecha] |
| 6 | Arranque de la aplicación | [DATO PENDIENTE: resultado] | [DATO PENDIENTE: integrante, equipo y fecha] |
| 7 | Ejecución del caso de uso vertical de punta a punta | [DATO PENDIENTE: resultado] | [DATO PENDIENTE: integrante, equipo y fecha] |
| 8 | Verificación de que el dato persiste y se recupera | [DATO PENDIENTE: resultado] | [DATO PENDIENTE: integrante, equipo y fecha] |
| 9 | Consulta del registro de corridas del canal de construcción | [DATO PENDIENTE: resultado] | [DATO PENDIENTE: integrante, equipo y fecha] |

+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **◆ CONDICIÓN MATERIAL DEL CÓMPUTO**                                                                                                                                                                                                                                                                                                                                                              |
|                                                                                                                                                                                                                                                                                                                                                                                                   |
| La cátedra clona el repositorio en la etiqueta v1, sigue las instrucciones del archivo de lectura y ejecuta. Un esqueleto que no arranca, no compila o carece de instrucciones no se computa como entregado, con independencia de la calidad del documento que lo acompañe. El detalle completo del procedimiento está en la Guía de comprobación del prototipo v1, publicada en el aula virtual. |
+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

