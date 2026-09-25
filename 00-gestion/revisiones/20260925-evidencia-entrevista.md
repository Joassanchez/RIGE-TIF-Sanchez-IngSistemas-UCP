# Cambios aprobados · valor probatorio de las prácticas relatadas en la entrevista · 25/09/2026

**Decisión del autor (25/09/2026).** La referente mencionó en la entrevista tres prácticas propias:
- una representación manual de la arquitectura de agentes (pizarra);
- la consulta de la configuración mediante un agente con permisos elevados;
- un agente interno que crea y configura otros agentes.

Las tres son ciertas, pero no hay constancia de ellas más allá de la entrevista, y la pizarra no tiene foto. En consecuencia:
- se clasifican como **demanda declarada con relato de conducta** y no como demanda revelada (Guía AE1, §4.1);
- la pizarra no sostiene ninguna conclusión y sale del Anexo II;
- el dato permanece en II.3.3 como parte de lo relatado.

La constancia que respalda las tres prácticas es el registro de la propia entrevista: canal, fecha, duración y notas o grabación (pendiente A-06).

**Aplicación:** con `/corregir`, en la pasada por cada capítulo. Las secciones afectadas vuelven a borrador. Remisiones de anexos según ADR-033.

| # | Dónde | Cambio |
|---|---|---|
| P-01 | `informe/anexos/anexo-II-ae1-documentos-entorno-dominio.md`, A.II.1 (futuro A.VII.1) | Eliminar la fila «Representación manual de la arquitectura de agentes elaborada por el referente» de la Tabla A.II.1 y el párrafo siguiente («La representación manual… demanda revelada…»). |
| P-02 | `informe/anexos/anexo-I-ae1-datos-relevados.md`, A.I.5 (futuro A.VI.5) | En la síntesis, «tres soluciones construidas por el equipo» → «tres prácticas propias relatadas por la informante». En la Tabla A.I.5.2, columna P-2, «Condición probatoria: Demanda revelada» → «Demanda declarada: relato de un gasto incurrido, sin constancia ni cuantificación». |
| P-03 | `informe/cap-02/II.3-presentacion-datos-recabados.md`, «Esfuerzo de comprensión y soluciones propias» | Presentar las tres como prácticas relatadas, con la pizarra en último lugar y sin detalle. Eliminar «Los tres artefactos fueron construidos por el equipo sin intervención del autor». Agregar que no se dispone de constancia de estas prácticas más allá del relato de la informante. |
| P-04 | `informe/cap-02/II.2-instrumentos-dinamicas-aplicadas-alcance.md`, II.2.3, «Valor probatorio y su límite» | Eliminar «Una parte de lo relevado, sin embargo, no es declaración sino conducta…». Reemplazarlo por: las prácticas que la informante relata son declaraciones sobre su propia conducta, más específicas que una opinión pero sin constancia independiente, y se emplean con ese valor. |
| P-05 | `informe/cap-01/I.1-origen-proyecto.md`, I.1.2 | «Y documenta tres soluciones que el equipo construyó por su cuenta para suplir la carencia, que constituyen evidencia de conducta y no de declaración» → «Y relata las prácticas que el equipo adoptó para suplir la carencia, entre ellas la consulta programática de su configuración mediante un agente». |
| P-06 | `informe/00-resumen.md` | «Tres soluciones artesanales que su equipo construyó para suplir la carencia» → «las prácticas que su equipo adoptó para suplir la carencia». |
| P-07 | `informe/cap-02/II.5-analisis-informacion.md`, Tabla 17, F2 | Elemento: «cuyo equipo ya construyó tres soluciones artesanales» → «que relata prácticas propias de su equipo para suplir la carencia». Implicancia: eliminar «Aporta evidencia de conducta y no solo de declaración» y conservar la habilitación de la validación del prototipo v0. |
| P-08 | `informe/cap-02/II.6-conclusiones-relevamiento.md`, Hallazgo 3 | Título: «Un equipo identificado experimenta la dificultad y relata prácticas propias para suplirla». Eliminar la enumeración de «tres artefactos» y la oración «Los artefactos son el hallazgo de mayor peso probatorio de este instrumento…». Declarar que su valor es el de la entrevista. Conservar las dos decisiones que habilita: el segundo episodio incorpora los elementos nativos, y la consulta programática sostiene la CLI. La pizarra no se menciona. |
| P-09 | `informe/cap-02/II.6-conclusiones-relevamiento.md`, II.6.2 | Pasar las prácticas relatadas y el consumo de tokens de demanda revelada a demanda declarada. Eliminar «Esta última incorporación merece señalarse… no aporta solamente lo que dice, sino lo que hizo». La demanda revelada comprende el comportamiento verificado del producto, las 32 incidencias y las siete que enlaza la propuesta de Codex, y el alcance verificado de las soluciones existentes. |
| P-10 | `informe/cap-02/II.6-conclusiones-relevamiento.md`, Tabla 19 | «Dos episodios vividos y tres soluciones artesanales construidas por el equipo» → «Dos episodios vividos y prácticas propias relatadas por la informante». |
| P-11 | `03-requisitos/libro/trazabilidad.md` e `informe/anexos/anexo-I-cap3-catalogo-requisitos-matriz-trazabilidad.md`, fila HA-3 | «Un equipo identificado experimenta la dificultad y construyó tres soluciones propias, entre ellas la consulta programática…» → «… y relata prácticas propias, entre ellas la consulta programática de su propia configuración». |
| P-12 | `informe/cap-04/IV.3-analisis-rivalidad-amplificada.md`, párrafo posterior a la Tabla 11 | Eliminar la oración «En su forma artesanal, el procedimiento incluye representaciones manuales de la arquitectura de agentes… de modo que RIGE no sustituye esa práctica en esta etapa». |
