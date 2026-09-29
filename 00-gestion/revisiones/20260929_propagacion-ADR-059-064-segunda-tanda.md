# Propagación de ADR-059 y ADR-064 al informe · segunda tanda · 29/09/2026

Continúa `20260929_propagacion-ADR-059.md` (P-01 a P-22, aplicados). Reúne:
- las inconsistencias que detectaron los redactores en la primera tanda;
- la decisión de horas de ADR-064 (aceptado el 29/09/2026).

**Reglas para el redactor:**
- La fuente de verdad es el Libro (`03-requisitos/libro/iteraciones.md`, Tablas 18 y 19, ya actualizadas).
- Aplicar solo estos hallazgos y no tocar el resto.
- Registro académico, impersonal, presente, afirmativo.
- Las secciones conservan su estado.

**Cifras de ADR-064** (verificadas: la Tabla 18 del Libro suma 136):
- **Tabla 18:** iteración 1 = 35 h, iteración 2 = 60 h, iteración 3 = 30 h, iteración 4 = 11 h.
- **Capacidad por días** (sin cambios): 28, 59, 33 y 16 h.
- **Exceso:** 7 h en la iteración 1 y 1 h en la 2. **Holgura:** 3 h en la 3 y 5 h en la 4.
- **Tabla 19:** los órdenes 1 a 6 no cambian sus horas; el orden 7 libera 10 h y el acumulado sigue en 45.

| # | Archivo | Ubicación | Corrección |
|---|---|---|---|
| P-23 | `informe/cap-03/III.3-alcance-sistema-alcance-proyecto.md` | Último párrafo | Eliminar el marcador `[DATO PENDIENTE: horas de RF-16, RNF-09 y RNF-10 en la Tabla 18 del apartado V.4]`; la oración queda como afirmación. |
| P-24 | `informe/cap-03/III.4-limites-sistema.md` | Párrafo final | «Ninguna exclusión permanece en estado pendiente.» → «Ninguna exclusión permanece en estado pendiente, salvo la revisión parcial de L-06 posterior a la sesión, que se informa a la referente para su convalidación.» El resto del párrafo no cambia. |
| P-25 | `informe/anexos/anexo-I-cap3-catalogo-requisitos-matriz-trazabilidad.md` | Párrafo introductorio de A.I.1 | Agregar a la enumeración de códigos: «los códigos E-nn, a los acuerdos del acta sobre el entorno, y los códigos D-nn, a las decisiones del Anexo III». Reemplazar la última oración por: «Veintiuno de los veintiséis requisitos se validaron con la referente en la sesión del 26/09/2026; RF-12 y RF-14, reformulados, y RF-16, RNF-09 y RNF-10, incorporados con posterioridad, figuran como pendientes de validación». |
| P-26 | `informe/cap-10/X.1-recursos-humanos.md` | Tabla (fila del autor) y párrafo «La relación entre horas y requisitos…» | «catorce requisitos Must» → «diecisiete requisitos Must» (dos apariciones); «los cinco requisitos Should» → «los seis requisitos Should». Las 136 h y el costo no cambian. |
| P-27 | `instrumentos/instrumento-34-recursos.md` | Fila «Humanos · Autor…» | «las tareas de los catorce requisitos Must» → «las tareas de los diecisiete requisitos Must». |
| P-28 | `informe/cap-05/V.1-definicion-iteraciones-sprints.md` | Párrafo del orden de construcción (después de la Tabla 14) | Antes de «La línea de base se ejecuta entre el 02/10 y el 16/10…», agregar: «La restricción de la interfaz web a solicitudes locales (RNF-09) se construye junto con la interfaz del esqueleto de la primera iteración; en la segunda, la conservación de la licencia del código incorporado (RNF-10) se satisface con la incorporación del evaluador.» En la oración «Si la verificación resulta negativa, los agentes nativos salen del alcance de RF-06 y se revisa RD-03, sin mover horas.», reemplazar por: «Si la verificación resulta negativa, los agentes nativos salen del alcance de RF-06 y de RF-16, que se limita a los agentes declarados, y se revisa RD-03, sin mover horas.» Agregar después de la oración que ubica H-18: «El listado de los agentes (RF-16) sigue a esa verificación, de la cual depende la identificación de los agentes nativos.» |
| P-29 | `informe/cap-05/V.2-entregables-cada-etapa.md` | Tabla grid, condición de aceptación de las iteraciones 1 y 2 | Iteración 1: «pasan las pruebas de los criterios de RF-01 y RNF-01» → «pasan las pruebas de los criterios de RF-01, RNF-01 y RNF-09». Iteración 2: «Pasan los criterios de RF-02, RF-03, RF-06, RF-08 y RF-09» → «Pasan los criterios de RF-02, RF-03, RF-06, RF-08, RF-09, RF-16 y RNF-10». Conservar la alineación de la tabla grid (compensar con espacios o continuar en la línea siguiente de la misma celda). |
| P-30 | `informe/cap-05/V.4-cronograma.md` | Párrafo de capacidad por días | «El plan asigna 34, 57, 30 y 15 h, respectivamente. La primera iteración excede su capacidad en 6 h; el exceso se declara y se compensa con la holgura de las tres siguientes, de 2, 3 y 1 h,» → «El plan asigna 35, 60, 30 y 11 h, respectivamente. La primera iteración excede su capacidad en 7 h y la segunda en 1 h; el exceso se declara y se compensa con la holgura de la tercera y la cuarta, de 3 y 5 h,». El resto del párrafo no cambia. |
| P-31 | `informe/cap-05/V.4-cronograma.md` | Tabla 18 | Copiar del Libro: fila «Interfaz mínima…» (RF-01, RNF-09; 5); subtotal 1 = **35**; fila del evaluador (RF-02, RNF-10; 10); fila nueva «Listado de los agentes declarados y nativos, por ambas interfaces» (RF-16; 3), después de la fila de H-18; subtotal 2 = **60**; fila de la iteración 4 = 11. Total **136**, sin cambios. |
| P-32 | `informe/cap-05/V.4-cronograma.md` | Párrafo después de la Tabla 18 | «Los cinco requisitos Should no reciben horas. RF-10, RF-11 y RNF-08 se incorporan en la tercera iteración si las anteriores cierran por debajo de lo estimado;» → «Los seis requisitos Should no reciben horas. RF-12 se incorpora en la segunda iteración y RF-10, RF-11 y RNF-08 en la tercera, si las anteriores cierran por debajo de lo estimado;». |
| P-33 | `informe/cap-05/V.4-cronograma.md` | Párrafo que describe la Figura 3 | «la verificación de H-18 completa ese tramo» → «la verificación de H-18 y el listado de los agentes (RF-16), que depende de ella, completan ese tramo». |
| P-34 | `informe/cap-05/V.4-cronograma.md` | Tabla 19, órdenes 1 y 7 | Copiar del Libro: orden 1 con «RF-10, RF-11, RF-12, RNF-06, RNF-07 y RNF-08»; orden 7 «Estabilización, reducida de 11 h a 1 h», 10, 45. |
| P-35 | `informe/cap-05/V.4-cronograma.md` | Párrafo de lo que la contingencia no sacrifica | «La pérdida de estos casos de uso suprimiría» → «La pérdida de estos casos de uso y de RF-03 suprimiría». |
| P-36 | `informe/cap-05/V.5-descripcion-producto-minimo-viable.md` | Párrafo 1 | «Los casos se enuncian al nivel del objetivo del usuario (Cockburn, 2001)» → «Los casos se enuncian al nivel del objetivo del usuario (Cockburn, 2001), salvo CU-01, que constituye una subfunción incluida por los demás,». Ajustar la continuación de la oración para que concuerde. |

**Fuera de esta lista:**
- **Figura 3:** la regenera el ingeniero con `tools/figura_cronograma.py`, cuyos datos ya se actualizaron. La figura existente no se sobrescribe: el autor decide su reemplazo.
- **Objetivos verificables de la Tabla 14:** no cambian.
