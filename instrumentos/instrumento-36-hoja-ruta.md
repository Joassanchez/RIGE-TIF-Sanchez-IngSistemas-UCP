# Instrumento 36 · Hoja de ruta del producto

*Momento de aplicación: Clase 27, jueves 12 de noviembre. Destino: Capítulo XI, apartado de evolución y oportunidades; Capítulo XIII, versiones. Portafolio AE4, punto (a).*

**Proyecto:** RIGE. **Base de cada afirmación:** [D] dato del repositorio, con su ruta; [G] conocimiento general de ingeniería; [S] suposición. Los experimentos E-01 a E-05 son los del Instrumento 39.

## 36.1 · Punto de partida: la versión entregada

| Campo | Contenido |
|---|---|
| Etiqueta de versión | `[DATO PENDIENTE: etiqueta; la propuesta es v1.0.0]`. Hasta su publicación, la referencia es `congelada`, commit `0df6cb7` (`00-gestion/estado.md`). Esa etiqueta carece del manual de despliegue (`pendientes.md`, AE4-03 y AE4-04) |
| Fecha de la etiqueta | `[DATO PENDIENTE: fecha de la etiqueta]` |
| Alcance entregado (requisitos «Must» cubiertos) | Los 18 Must del producto mínimo viable: RF-01 a RF-09, RF-16, RF-17, RNF-01 a RNF-05, RNF-09 y RNF-10 (`03-requisitos/libro/catalogo/`; `informe/cap-05/V.5-descripcion-producto-minimo-viable.md`, Tabla 18). Implementados en `congelada`; sus verificaciones pendientes sobre la versión final constan en `pendientes.md`, VER-02, VER-04, VER-06 y VER-07. Además, el cierre de la iteración 3 incluye los Should RF-10, RF-11, RF-12 y RNF-08 (V.1). Medido el 04/11/2026 en el contenedor, sobre `congelada`: RNF-05 y RNF-07 (`01-relevamiento/evidencia/rnf05-sin-red_20261104.md`; `rnf07-medicion-contenedor_20261104.md`) |
| Alcance comprometido no entregado y motivo | **RNF-06 (Should), sin acreditar:** las pruebas simuladas carecen de la evidencia de ejecución real en Ubuntu 26.04 y Windows 11 y de la instalación con cuenta común (V.5; `estado.md`; VER-05). **RNF-07, umbral en revisión:** la medición cumple, y la revisión de los 2 s con la referente sigue abierta (R-15; VER-03). **Medición final y OE-4:** `[DATO PENDIENTE: resultado de la medición final, en espera]`. Fuera del período por decisión previa (no comprometidos): RF-13, RF-14 y RF-15 (V.5, Tabla 19) |

## 36.2 · Los tres horizontes

Los horizontes son rangos desde la etiqueta entregada, sin fechas comprometidas.

| Horizonte | Evolución | Necesidad que resuelve y evidencia | Perfil de interesado | Condición de activación o dependencia | Métrica de éxito |
|---|---|---|---|---|---|
| **Ahora** · v1.x · 0 a 3 meses | Acreditar RNF-06: ejecución real en Ubuntu 26.04 y Windows 11 e instalación con cuenta común | El equipo de la referente programa en Windows (L-11) y el diagnóstico en esa plataforma carece de acreditación. Evidencia: RNF-06; `estado.md`, iteración 4; VER-05 | Desarrollador en Windows; cátedra que comprueba | Se activa con la etiqueta entregada. Corrección de un compromiso; si cambia el comportamiento, sigue 36.4 | RNF-06: 100 % de coincidencia en CA-1 y CA-2, e instalación sin privilegios en ambas plataformas (CA-3) |
| **Ahora** · v1.x · 0 a 3 meses | Completar la escala: flujo web con el almacén en su límite, escala en Windows 11 y cantidad de reglas por agente en proyectos reales | E-01 acredita el tamaño por diez en el contenedor, y deja `hallazgos` cruzando 2000 ms entre 2500 y 3000 reglas. Evidencia: `01-relevamiento/evidencia/e01-escala-contenedor_20261105.md` | Agente externo; desarrollador | E-02 y la búsqueda de S-03 y S-04. Si un proyecto real supera 1000 reglas en un agente, se perfila e indexa la búsqueda de reglas | E-02: cero errores y menos de 2000 ms. Búsqueda: mayor cantidad de reglas por agente observada |
| **Próximo** · v2.0 · 3 a 9 meses | Readaptar a una versión posterior de OpenCode, con intervenciones agrupadas por trimestre | RF-05 limita el valor a quien fija 1.18.25 (IV.1) y OpenCode publica 227 versiones estables en nueve meses (`00-gestion/anexo-III.md`, A.III.3). La incidencia n.º 46873 informa un comportamiento en 1.18.26 con introducción incierta (IV.3) | Desarrollador que actualiza OpenCode | E-04 dentro de la cota de 22 h, y patrocinio o decisión del autor que financie la intervención (E-05) | `referencia-nativa` en verde sobre la versión nueva y horas registradas hasta 22 por intervención |
| **Próximo** · v2.0 · 3 a 9 meses | Integrar RIGE con el agente, mediante una skill o un servidor MCP local, para que lo consulte sin una instrucción externa | La instrucción de consultar RIGE es una condición del brazo medido, separada de la adopción real (I.3.4; IV.1). El mecanismo de adopción requiere definición (Tabla 7, Canales) | Agente externo; desarrollador que lo configura | Veredicto «Criterio cumplido» en la medición final (I.3.4), y E-03 bajo el umbral. Conserva RNF-05 y queda como iniciativa del desarrollador | Reducción del éxito declarado falso sin instrucción, frente al brazo con instrucción, con el protocolo de I.3.4 |
| **Después** · 9 a 18 meses | Adaptador de otra herramienta, financiado por hito | La independencia del núcleo (RNF-03) sostiene otro adaptador si los competidores incorporan OpenCode o cambia el proveedor (IV.3). Patrocinio por hito previsto en IV.1 | Desarrollador de otra herramienta; patrocinador | Patrocinio por hito efectivo. Cada herramienta agrega mantenimiento recurrente (Tabla 7) | Oráculo del adaptador sin diferencias y cero cambios en el núcleo |
| **Después** · 9 a 18 meses | Comparación entre dos resoluciones guardadas | RF-17 ya conserva resoluciones fechadas con su resumen de entradas. La comparación es una capacidad posible del sistema (III.4, L-09). Falta evidencia de demanda | Desarrollador que audita cambios | E-03 muestra uso repetido, y al menos un usuario del piloto pide comparar estados | Proporción de consultas repetidas que usan la comparación: `[DATO PENDIENTE: umbral a fijar con los datos de E-03]` |

**Dependencia común.** La medición final (I.3.4; V.5) sigue en espera. Su veredicto condiciona la integración con el agente y la reevaluación de RF-15.

**Capacidad y orden.** La hoja se ejecuta con una sola persona, y sus horizontes son condicionales, sin capacidad acreditada: `[AUTOR: horas disponibles por horizonte]`. Lo propio se ejecuta primero: RNF-06, la medición de escala y la intervención de E-04. Dependen de terceros: los participantes de E-03, el segundo codificador y el patrocinio. Sin ellos, las evoluciones que los requieren quedan postergadas y RIGE permanece en 1.18.25. Si E-04 supera las 22 h, se aplica el orden de decisión del Instrumento 39, apartado 39.3.

## 36.3 · Lo que queda fuera

| Evolución descartada o postergada | Motivo | Condición que la reabriría |
|---|---|---|
| RF-15 · Matriz de agentes y consulta inversa (Won't) | Exige resolver la cadena de todos los agentes y un diseño propio; ninguna consulta relevada la requiere (ficha RF-15) | Reevaluación después de la medición final, con una consulta relevada que la requiera |
| RF-13 · Vínculos entre elementos (Could) | Ninguna de las cuatro consultas que originan el problema depende de ella; excede las horas del período (ficha RF-13; L-12) | Una consulta de un usuario depende de los vínculos, o un hallazgo nuevo los exige |
| RF-14 · Estado resuelto completo por línea de comandos (Could) | Fuera del período (V.5, Tabla 19; III.4) | Un agente externo necesita el estado completo y las consultas actuales le exigen varias invocaciones, con carga medida en E-01 |
| macOS | El proyecto dispone de Ubuntu y Windows para verificar y carece de un equipo con macOS (L-11; ADR-054) | Disponibilidad de un equipo y un usuario real en esa plataforma; la acreditación sigue el criterio de RNF-06 |
| Seguir cada versión de OpenCode con cambio declarado | Cuesta por año de 1,07 a 9,02 veces el proyecto del período, con la ventana de enero a septiembre (X.3; A.III.3) | Ingreso recurrente que cubra ese costo, o conteo de cambios menor que el observado |
| Pruebas metamórficas de la procedencia (ADR-063, no redactado) | El oráculo contra el binario ya cubre RNF-02; descartadas para el período por el autor el 30/10/2026 (`INDICE.md`, números retirados) | Una versión o plataforma donde el oráculo contra el binario deja de estar disponible |
| Explicación generada por un modelo de lenguaje (Instrumento 37, Hipótesis 1) | Ornamento: sin necesidad acreditada; contradice RF-03, RNF-05 y L-13 | Una sesión registrada documenta que las plantillas impiden corregir una regla, y el modelo opera en forma local, con el resultado determinado por el núcleo |
| Clasificación asistida de versiones e incidencias (Instrumento 37, Hipótesis 2) | Índice 3,40: postergar | Las tres partes de 37.3: E-04 registra que la lectura y la clasificación pesan en el exceso de horas; la técnica ahorra tiempo frente a la lectura manual sin omitir cambios relevantes; un segundo codificador alcanza concordancia. `[DATO PENDIENTE: umbrales, a fijar antes de medir]` |
| Caché por resumen de entradas | E-01 la descarta por ahora: margen de 18,52 con el tamaño por diez. No resuelve el crecimiento por reglas, porque la primera lectura paga igual; riesgo para RNF-02 (ADR-023) | Una medición muestra que el tamaño de proyectos reales acerca las consultas a 2000 ms y dominan la lectura o la resolución (ADR-055) |
| Comandos compuestos | Reproducir el análisis sintáctico de la herramienta excede el alcance; RIGE advierte la limitación (L-02; RF-08) | Una medición muestra que la advertencia impide resolver consultas frecuentes del agente |

## 36.4 · Criterio de versionado

Se adopta el versionado semántico, MAYOR.MENOR.CORRECCIÓN, a partir de la etiqueta entregada. El criterio se declara en el Capítulo XIII y se respeta en las etiquetas del repositorio.

| Tipo de cambio | Número que aumenta | Ejemplo |
|---|---|---|
| Corrección de un defecto sin cambiar funciones | CORRECCIÓN | v1.0.0 → v1.0.1 |
| Función nueva compatible con lo existente | MENOR | v1.0.1 → v1.1.0 |
| Cambio que rompe la compatibilidad (datos, interfaz, integración) | MAYOR | v1.1.0 → v2.0.0 |

**Aplicación a RIGE.**

- **Hitos anteriores.** `v1`, `v2`, `v3` y `congelada` son hitos de iteración previos a este criterio (V.2) y quedan publicados sin mover. El orden semántico rige desde la versión entregada.
- **Paquete.** `src/package.json` declara `0.1.0`. La versión entregada debe alinearlo con su etiqueta, como tarea del escritor (`pendientes.md`, AE4-04).
- **Esquema de salida.** Es independiente (ADR-062). Todo cambio incompatible de su esquema incrementa su versión mayor (RNF-08) y, como rompe una integración, también la versión MAYOR de RIGE.
- **Versión de OpenCode admitida.** Cambiarla modifica los resultados que el usuario obtiene: es un cambio de versión MAYOR, de allí v2.0 en el horizonte «Próximo». `[S]` Corresponde a una interpretación del criterio de la plantilla.
