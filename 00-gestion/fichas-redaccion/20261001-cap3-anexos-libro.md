# Ficha de redacción 20261001-cap3-anexos-libro · Correcciones de la revisión del Cap. III (Anexos I y V y libro)

- Modo: corrección
- Rutas relativas a la raíz del repositorio (`..` desde `informe/`)
- Archivos que podés modificar:
  - `informe/anexos/anexo-I-cap3-catalogo-requisitos-matriz-trazabilidad.md`;
  - `informe/anexos/anexo-V-cap3-glosario-dominio-reglas-negocio.md`;
  - en `03-requisitos/libro/`: `catalogo/*.md`, `trazabilidad.md`, `reglas.md`, `glosario.md` y `entidades.md`.
- Origen: `00-gestion/revisiones/20261001-cap-III.md` (todo aceptado por el autor), ADR-073 y ADR-074
- Modelo y esfuerzo: gpt-6.1-sol · medium

## Principio
**El libro y el Anexo I dicen lo mismo:** cada cambio de ficha se aplica en los dos lugares, y el texto de las fichas del Anexo I es copia del libro. Lo mismo vale para el Anexo V y `reglas.md`, `glosario.md` y `entidades.md`.

## Qué leer
- `00-gestion/revisiones/20261001-cap-III.md` y `00-gestion/decisiones/ADR-074-precisiones-modelo-dominio-rf07-instrucciones.md`, con los textos exactos de RE-01, RE-03, el glosario y RF-07.
- `informe/anexos/anexo-I-ae1-datos-relevados.md`: A.I.3, resultados 1 a 23, y A.I.6.
- `informe/cap-02/II.6-conclusiones-relevamiento.md` (II.6.3).
- `03-requisitos/libro/iteraciones.md`.
- `informe/cap-03/III.2-dominio-sistema-informacion.md`, Tabla 2, para las definiciones operativas de las entidades.

## Correcciones (todas y nada más)

| # | Corrección | Dónde |
|---|---|---|
| A-1 | **Fórmula de validación.** «Los veintisiete requisitos constan validados con la referente en el acta de validación; el campo de trazabilidad de cada ficha remite al punto del acta que lo respalda» pasa a «Los veintisiete requisitos constan validados con la referente en el acta de validación». | Anexo I, primer párrafo |
| A-2 | **RR-02.** Estado «Validada». En la fuente se agrega «acta de validación, extensión». | Anexo V (Tabla A.V.2) y `reglas.md` |
| A-3 | **RE-01 y RE-03**, con el texto exacto de ADR-074. En la fuente se agrega «acta de validación, extensión». | Anexo V y `reglas.md` |
| A-4 | **Glosario.**<br>· «Elemento sin uso» y «Referencia no resuelta», con las definiciones de ADR-074.<br>· Agregar «Instrucción» y «Elemento nativo» (ADR-074).<br>· Agregar «Elemento», «Agente», «Subagente», «Hallazgo» y «Resolución» con su definición operativa de la Tabla 2 de III.2. Subagente: agente que otro agente invoca y que hereda sus reglas de denegación (RD-05).<br>· Respetá las columnas existentes del glosario. | Anexo V y `glosario.md` |
| A-5 | **Atributos (A.V.3).** «Valor efectivo» figura como atributo derivado del elemento, que resulta de cada resolución. Las relaciones de `entidades.md` se ajustan a ADR-074: Regla de permiso rige sobre uno o muchos agentes; Entrada contiene ninguna o muchas declaraciones; Resolución comprende muchos elementos. | Anexo V y `entidades.md` |
| A-6 | **RF-07, CA-1.** Agregar al final: «La detección de referencias no resueltas y de elementos sin uso opera por nombre sobre los elementos de la resolución, sin la representación de vínculos de RF-13». En la trazabilidad se agrega «ADR-074». | Anexo I y `catalogo/RF-07.md` |
| A-7 | **Justificación de H-16 en la matriz.** Que no prometa una advertencia: las instrucciones de subdirectorios quedan fuera del alcance (III.4) y no derivan requisito. | Anexo I (matriz) y `trazabilidad.md` |
| A-8 | **Matriz en doble vía.**<br>· Agregá a la trazabilidad de las fichas los orígenes que la matriz ya les asigna: RF-05 («acta del 26/09/2026, E-01 y decisión L-05»), RF-08 (E-01), RNF-08 (E-01), RF-02, RF-07 y RF-14 («decisión L-06»).<br>· En la matriz, D-06 → RNF-10 incorpora D-44.<br>· Agregá las filas H-22 y H-23 tomando su enunciado de A.I.3. H-22 deriva en RF-04. H-23 no deriva requisito, con la justificación «RIGE no ejecuta la herramienta; condiciona la generación del oráculo (ADR-060)».<br>· En la clave de códigos del Anexo I agregá: «ADR-nnn: registros de decisión del repositorio, cuya deliberación se resume en el Anexo III». | Anexo I, fichas y matriz; libro, fichas y `trazabilidad.md` |
| A-9 | **Magnitud y unidad en RNF-03, RNF-04, RNF-06, RNF-08, RNF-09 y RNF-10.** Reformulá el criterio para que declare magnitud, unidad y condición de medición **sin cambiar lo que se verifica**. Ejemplos:<br>· RNF-04: «cero apariciones del valor…»;<br>· RNF-06: «coincidencia en el 100 % de las entradas y los valores…»;<br>· RNF-03: «cero importaciones del núcleo hacia el adaptador…»;<br>· RNF-09 y RNF-10, con su conteo.<br>Si una magnitud no se puede derivar del criterio actual, dejá el criterio como está y avisá. | Anexo I y libro |
| A-10 | **RF-15.** El criterio dice además: «… y no se computa en los controles del catálogo». En el libro, completá el campo «Motivo de la prioridad», hoy truncado, copiándolo del Anexo I. | Anexo I y `catalogo/RF-15.md` |
| A-11 | **RF-05.**<br>· CA-2: «el código de salida es 1 (error de uso o de configuración, RF-03, CA-6)» en lugar de «distinto de 0».<br>· Quitá del motivo de la prioridad «La herramienta publica versiones en intervalos breves», porque no tiene fuente. | Anexo I y `catalogo/RF-05.md` |
| A-12 | **RF-03.** Fusioná el CA-5 en el CA-6: el proyecto inexistente es un error de uso, con código 1. Quitá `puerto-ocupado` del CA-6, porque es un error del servidor web y no de la consulta. Renumerá si hace falta. | Anexo I y `catalogo/RF-03.md` |
| A-13 | **Remisiones.**<br>· RF-12: «AE1, Tabla 6» pasa a «AE1, I.6.2, función F6 (Tabla 7)».<br>· RD-04 y el glosario «Valor implícito» remiten a H-09, que no lo dice: buscá en A.I.3 el resultado que lo acredite y, si no existe, usá «AE1, I.6.3».<br>· RE-02 y el glosario «sin efecto»: «adaptado de Al-Shaer y Hamed (2004)». | Anexos I y V; libro |
| A-14 | **Fuentes.**<br>· HA-2 (32 incidencias): agregar «piso de ocurrencia; relevamiento propio sobre incidencias públicas de OpenCode, 32 incluidas de 46 candidatas, sin segundo codificador (II.6.3; A.I.6)».<br>· RF-03 (motivo) y RNF-06 (motivo): las prácticas del equipo y el uso de Windows se presentan «según declara la referente».<br>· RNF-06: H-19 se cita con su estado «pendiente de reproducción en Ubuntu». | Anexo I y libro |
| A-15 | **Iteración prevista**, según `iteraciones.md`:<br>· RF-10, RF-11 y RNF-08: «3 (condicionado a las horas)»;<br>· RF-12: la iteración que indique el plan, con «(condicionado a las horas)»;<br>· RNF-06 y RNF-07: «4 (acreditación en la estabilización)».<br>Solo en el libro, salvo que el Anexo I muestre el campo. | libro (y Anexo I si corresponde) |
| A-16 | **Terminología.** «cadena de permisos» pasa a «cadena de reglas de permiso» (RF-06, CA-2; RF-15). | Anexo I y libro |
| A-17 | **Fórmulas de L-06 y E-02:** las del libro (`trazabilidad.md`) se copian en la matriz del Anexo I. | Anexo I |
| A-18 | **«Dato y valor» en la matriz** para H-02, H-10, H-17, H-19 y H-20, tomado de A.I.3. Si el resultado no tiene valor numérico, se consigna el dato verificado. | Anexo I y `trazabilidad.md` |

## Reglas específicas
- Las 27 fichas quedan en «Validado».
- No cambies enunciados de requisitos, salvo lo que piden estas correcciones.
- Mantené los recuentos: 27 requisitos, 18 Must, 13 reglas y 13 relaciones.
