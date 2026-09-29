# Propagación de ADR-059 al informe · 29/09/2026

Informe de hallazgos para `/corregir`. No proviene de una revisión: traslada al informe la decisión aceptada en ADR-059 (revisión del catálogo y de los casos de uso). La fuente de verdad es el Libro de trabajo, ya actualizado (`03-requisitos/libro/catalogo/`, `trazabilidad.md`, `iteraciones.md`).

**Reglas para el redactor:**
- Aplicar solo los hallazgos de esta lista y no tocar el resto de la sección.
- Los textos de fichas, criterios y matriz se copian literalmente del Libro.
- Registro académico, impersonal, presente, afirmativo.
- Las secciones conservan su estado en `estado.md`.

**Cifras verificadas** (recuento sobre las 26 fichas del Libro el 29/09/2026; el mismo método reproduce las cifras anteriores de III.5):

| Concepto | Cifra |
|---|---|
| Requisitos | 26: dieciséis funcionales y diez no funcionales |
| Prioridad | diecisiete Must, seis Should (RF-10, RF-11, RF-12, RNF-06, RNF-07, RNF-08), dos Could (RF-13, RF-14), un Won't (RF-15) |
| Categorías no funcionales | seguridad (4), fiabilidad (1), mantenibilidad (2), portabilidad (1), rendimiento (1), cumplimiento normativo (1) |
| Origen de la trazabilidad | doce a resultados del relevamiento técnico (H-xx), siete a hallazgos del análisis (HA-x), doce a acuerdos del acta de validación, diez a funciones o apartados del informe de la AE1, uno a una decisión del Anexo III |
| Estado de validación | veintiuno validados en la sesión del 26/09/2026; cinco pendientes: RF-12 y RF-14 (reformulados) y RF-16, RNF-09 y RNF-10 (incorporados después de la sesión) |

## Capítulo III

| # | Sección | Ubicación | Corrección |
|---|---|---|---|
| P-01 | III.2 | Párrafo que sigue a la Tabla 5 | Agregar al final del párrafo: RF-01 compromete la resolución de los demás tipos de elemento en la medida en que integran el estado efectivo de un agente, y su consulta independiente corresponde a RF-14. No modificar la tabla. |
| P-02 | III.3 | Párrafo 2 | «a los catorce requisitos» → «a los diecisiete requisitos». «que informa valores efectivos y decisiones de permiso desde la segunda iteración y hallazgos desde la tercera» → «que informa valores efectivos, decisiones de permiso y el listado de los agentes desde la segunda iteración, y hallazgos desde la tercera». |
| P-03 | III.3 | Tabla 7, fila «F6 · Exploración y exportación \| Diferida» | Reemplazar por tres filas: «F6 · Listado de los agentes del proyecto (RF-16) \| Comprometida»; «F6 · Localización en formato ruta:línea:columna (RF-12, Should) \| Condicionada a las horas»; «F6 · Estado resuelto completo por línea de comandos (RF-14) \| Diferida». |
| P-04 | III.3 | Último párrafo | «Los catorce requisitos Must» → «Los diecisiete requisitos Must», con el marcador `[DATO PENDIENTE: horas de RF-16, RNF-09 y RNF-10 en la Tabla 18 del apartado V.4]` al final de esa oración. «Los cinco requisitos Should» → «Los seis requisitos Should». «los tres Could y el único Won't» → «los dos Could y el único Won't». |
| P-05 | III.4 | Tabla, fila de L-06 | Columna «Qué queda fuera»: «Listados de elementos, exportación del ecosistema completo y consulta inversa por esa vía» → «Listados de elementos distintos de los agentes y consulta inversa por esa vía». Columna de motivo: agregar al final «; el listado de los agentes se incorpora porque toda consulta parte de un agente determinado». Columna de validación: agregar «; revisada en parte después de la sesión (listado de agentes y estado completo), pendiente de convalidación». |
| P-06 | III.5 | Párrafo 1 | Reemplazar las cifras por las de la tabla de cifras verificadas: veintiséis requisitos, dieciséis funcionales y diez no funcionales; agregar «cumplimiento normativo» a las categorías; diecisiete Must, seis Should, dos Could y uno Won't. Oración de validación: «Veintiuno de los veintiséis requisitos se validaron con la referente en la sesión del 26/09/2026; los cinco restantes —RF-12 y RF-14, reformulados, y RF-16, RNF-09 y RNF-10, incorporados con posterioridad— se informan a la referente y figuran como pendientes de validación». Conservar la excepción de RNF-07 con su redacción actual. |
| P-07 | III.5 | Párrafo 2 | Recuento de orígenes según la tabla de cifras verificadas (doce, siete, doce, diez y uno a una decisión del Anexo III). Agregar a la última oración que los criterios de aceptación se presentan numerados. |
| P-08 | III.5 | Tabla 9 | Enunciados sintéticos: RF-01 → «Valor efectivo de cada clave de un agente, o de la solicitada, con su procedencia y las declaraciones desplazadas»; RF-12 → «Localización de cada declaración en el formato ruta:línea:columna», prioridad **Should**; RF-14 → «Estado resuelto completo por línea de comandos». Filas nuevas, en orden de código: RF-16 «Listado de los agentes del proyecto, declarados e incorporados por la herramienta» · Funcional · Must (después de RF-15); RNF-09 «Atención exclusiva de solicitudes dirigidas a la dirección local por la interfaz web» · Seguridad · Must; RNF-10 «Conservación del aviso y la licencia del código incorporado» · Cumplimiento normativo · Must (después de RNF-08). |

## Capítulo V

| # | Sección | Ubicación | Corrección |
|---|---|---|---|
| P-09 | V.1 | Párrafo introductorio | «la segunda incorpora la decisión de permisos con su explicación, su vista web y la línea de comandos de valores y de permisos» → agregar «y el listado de los agentes». |
| P-10 | V.1 | Tabla 14, columna de requisitos | Iteración 1: «RF-01, RNF-01, RNF-03, RNF-09; fijación de los valores de RNF-07». Iteración 2: «RF-02, RF-03, RF-06, RF-08, RF-09, RF-16, RNF-10; verificación de H-18. Condicionado: RF-12». Iteración 4, objetivo: «catorce» → «diecisiete». No modificar los objetivos verificables de las iteraciones 1 y 2 (decisión pendiente del autor). |
| P-11 | V.2 | Fila de la iteración 4 | «los catorce requisitos Must» → «los diecisiete requisitos Must». |
| P-12 | V.4 | Párrafo de lo que la contingencia no sacrifica (línea 69) | «y los casos de uso sobre los que se ejecuta la medición final:» → «y los casos de uso y el requisito de interfaz sobre los que se ejecuta la medición final:». «y CU-05, la consulta de valores y de permisos por línea de comandos, que es la vía del agente en la medición final» → «y RF-03, la consulta de valores y de permisos por línea de comandos, que es la vía del agente en la medición final». No tocar la Tabla 18 (las horas las fija el autor). |
| P-13 | V.5 | Párrafo 1 | «comprende los cinco casos de uso de la Tabla 20, que satisfacen los catorce requisitos Must» → «comprende los casos de uso de la Tabla 20 —cuatro objetivos del usuario y una subfunción—, que junto con los requisitos transversales satisfacen los diecisiete requisitos Must». |
| P-14 | V.5 | Tabla 20 | Reemplazar las filas por: **CU-01** · Analizar un proyecto, subfunción incluida por CU-02 a CU-05: descubrir sus entradas, verificar la versión instalada de OpenCode y registrar la resolución \| RF-04, RF-05. **CU-02** · Consultar el estado efectivo de un agente: el valor de cada clave o de la solicitada, con su procedencia, las declaraciones desplazadas o su condición de implícito (desarrollador y agente externo) \| RF-01, RF-06. **CU-03** · Consultar si un agente puede realizar una acción, con la cadena de reglas, la regla determinante y su explicación (desarrollador y agente externo) \| RF-02, RF-06, RF-08, RF-09. **CU-04** · Revisar los hallazgos del ecosistema, con su localización y su causa (desarrollador y agente externo) \| RF-07. **CU-05** · Explorar los agentes del proyecto, declarados e incorporados por la herramienta (desarrollador y agente externo) \| RF-16. Fila transversal: «Requisitos transversales a los casos: salida por línea de comandos estructurada, determinista y versionada; solo lectura; fidelidad respecto de la herramienta; independencia del núcleo; no exposición de variables de entorno; ausencia de conexiones salientes; seguridad de la interfaz web local; conservación de la licencia del código incorporado» \| RF-03, RNF-01, RNF-02, RNF-03, RNF-04, RNF-05, RNF-09, RNF-10. |
| P-15 | V.5 | Párrafo que sigue a la Tabla 20 | Agregar después de la primera oración: «RF-03 tampoco constituye un caso de uso: es el canal por el cual el agente externo persigue los mismos objetivos que el desarrollador, y se consigna como requisito transversal». |
| P-16 | V.5 | Tabla 21 | RF-12: «Informar la localización de cada declaración en el formato ruta:línea:columna (RF-12, Should) \| Segunda iteración, si las horas lo permiten». RF-14: «Consultar por línea de comandos el estado resuelto completo (RF-14, Could) \| Fuera del período». Fila de L-06: «Listar por línea de comandos los elementos distintos de los agentes (decisión L-06, revisada en parte) \| Fuera del período». |
| P-17 | V.5 | Párrafo de las dos hipótesis | «con RIGE disponible por línea de comandos (CU-05), que expone la lógica de CU-01 a CU-03» → «con RIGE disponible por línea de comandos (RF-03), que expone la lógica de CU-01 a CU-03». |

## Anexo I (`informe/anexos/anexo-I-cap3-catalogo-requisitos-matriz-trazabilidad.md`)

| # | Ubicación | Corrección |
|---|---|---|
| P-18 | A.I.1, todas las fichas | Reemplazar el «Criterio de aceptación» de cada ficha por el del Libro, con la numeración CA-n. RF-15 queda sin numerar. Conservar el escape `\-\-explicar` que usa el anexo. |
| P-19 | A.I.1, fichas RF-01, RF-12, RF-14 | Enunciado y «Prioridad y criterio» según el Libro: RF-12 pasa a Should con su nuevo motivo; RF-14 conserva Could con su nuevo motivo. |
| P-20 | A.I.1, fichas nuevas | Agregar RF-16 (después de RF-15), RNF-09 y RNF-10 (después de RNF-08) con el formato de seis campos del anexo, tomados de las fichas del Libro. El marcador `[DATO PENDIENTE: …]` del criterio de RF-16 se conserva. |
| P-21 | A.I.2, Tabla A.I.1 | Copiar del Libro las filas H-18, E-01, L-04 y L-06, y agregar la fila D-06 después de L-13. |
| P-22 | A.I.2, Tabla A.I.2 | Copiar del Libro las filas modificadas (RF-01, RF-04, RF-06, RF-16; RF-03, RF-14, RNF-08; RF-12; RF-13, RF-15; RNF-03) y las nuevas (RNF-09; RNF-10). |

## Fuera del alcance de esta lista

- **AE1 (OE-3 en I.2 y Tabla 8 en I.6.3):** alinear con los seis tipos de hallazgo. Va por la Ventana del AE1 (`00-gestion/ventana-ae1.md`).
- **Tabla 18 de V.4 y objetivos verificables de las iteraciones 1 y 2:** los decide el autor (AR-07).
- **ADR-052:** su mención al CU-05 anterior la corrige el ingeniero en `00-gestion/`.
