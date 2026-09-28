# Revisión del crítico · Caps. III, IV y V e I.6.6 (corregidos el 28/09/2026)

- Fecha: 28/09/2026
- Agente: `critico` (solo lectura)
- Objeto: III.1 a III.5, IV.1, IV.3, V.1, V.2, V.4, V.5, I.6.6; contrastados con las Figuras 1 y 3, el Anexo I, `03-requisitos/libro/`, el acta (`01-relevamiento/validacion/20260925_GuiaValidacion_Sanchez_v2.md`) y `informe/bibliografia.md`
- Estado: **sin aplicar**. Pendiente de verificación por el ingeniero y de la elección del autor.

**Conclusión del revisor.** Las cifras cierran: horas 224/190/136, la distribución 34/53/34/15, los 45 h de contingencia, el MoSCoW 14/5/3/1, los orígenes de la trazabilidad 11/7/11/8, las incidencias 23 de 32 (72 %) y las 13 y 8 filas de límites. Los problemas graves son otros:
- el cronograma que declara el texto no coincide con la Figura 3 ni con los criterios de aceptación;
- se afirman validaciones y constancias que no existen o que no corresponden al texto actual;
- el uso del lienzo es débil frente a lo que exige la guía.

## Severidad alta

| # | Dónde | Problema | Propuesta |
|---|---|---|---|
| A-1 | V.2 l.12; V.4 l.40 (Tabla 18); Figura 3 | Los criterios de RF-02 y RF-03 exigen paridad con la web, pero la vista web de permisos se construye en la iteración 3. Al 24/10 esos criterios no pueden pasar, aunque V.1 l.10 y V.2 l.12 dicen que pasan. | Una de tres: mover la vista web a la iteración 2; cerrar RF-02 y RF-03 en la iteración 3; o separar la paridad web en el criterio y asignarla a la iteración 3. |
| A-2 | V.1 l.16; IV.3 l.60 (Tabla 13) | La línea de base termina el 16/10, pero en la Figura 3 las tareas que debería reordenar empiezan alrededor del 06/10 y del 11/10. La fila «Reordena» no tiene consecuencia operativa. | Limitar el reordenamiento a lo que resta después del 16/10 y ajustar la figura, o darle a «Reordena» una consecuencia sobre la iteración 3 o sobre la contingencia. |
| A-3 | III.4 l.7–33; I.6 l.123 | La columna «Estado y constancia» afirma una constancia que no existe. El acta y las capturas no están en ningún Anexo II de la AE2. El acta aparece ubicada en dos lugares: el Portafolio en I.6.6 y el Anexo II en III.4. | Una fórmula que distinga la confirmación en sesión de la constancia pendiente; incorporar el acta y las capturas al Anexo II o quitar la remisión; fijar un único lugar para el acta. |
| A-4 | III.5 l.35 | Da a RNF-07 por completo («magnitud, unidad y condición de medición») cuando su ficha tiene dos `[DATO PENDIENTE]`. Además, V.2 l.8 exige esos valores para el v1 (01/10). | Completar los datos o reformular: la condición de medición se fija en la iteración 1. |
| A-5 | III.5 l.3 y l.35 | RNF-07 figura como validado con un enunciado distinto del que se validó: el acta dice «del doble del equipo de la referente» y ADR-045 lo cambió a «del mayor entre…». | Declarar que el umbral está validado y la condición se revisó después de la sesión (ya previsto en PV-03), o volver a someterlo. |
| A-6 | III.2 l.11; III.5 l.3 | Larman (2004), Evans (2003) y Clegg y Barker (1994) se citan pero no están en la bibliografía. | Dar de alta las fuentes y agregar las entradas. |
| A-7 | III.3 l.20 | Dice que las dos mediciones están dentro de las 190 h, pero V.4 ubica la medición final en la fase de cierre (48 h). Habla de «tres artefactos» cuando V.1 tiene cuatro hitos. | Corregir el alcance de las 190 h y el número de artefactos. |

## Severidad media

| # | Dónde | Problema | Propuesta |
|---|---|---|---|
| M-1 | V.4 l.16; V.1 l.9–12 | Las semanas declaradas (2, 3, 2 y 1) no coinciden con las fechas. La iteración 1 queda en unas 21 h por semana, frente a 17 h efectivas. | Recalcular la proporción por días o declarar la sobrecarga. |
| M-2 | III.3 l.5; V.1 l.5 | Llama «completa» a la línea de comandos desde la iteración 2, pero los hallazgos por esa vía llegan en la iteración 3 y L-06 excluye varias funciones. Además choca con I.6.5 l.113. | Reemplazar «completa» por una enumeración cerrada. |
| M-3 | III.1 l.12, 17, 25 | Ningún requisito verifica E-02 (estado de las entradas o resumen). E-01 exige distinguir el error de la ausencia de resultado, y el criterio de RF-03 no lo prueba. | Llevar E-01 y E-02 a la matriz y derivar criterios. |
| M-4 | III.2 Tabla 4 (l.55, 60); Figura 1 | El valor implícito tiene 0 declaraciones, y el modelo dice 1..*. El xor del hallazgo no admite la entrada ilegible. No hay relación Sustitución–Hallazgo. La regla de permiso «nativa» no es una Declaración. | Pasar a 0..* con a lo sumo una determinante; xor sobre {elemento, declaración, entrada}; redefinir la regla de permiso. |
| M-5 | III.2 l.70–79 (Tabla 5) | Hay resoluciones que ningún requisito cubre: LSP por lenguaje, skill, instrucciones y comando. | Acotar la columna al alcance o indicar el requisito de cada fila. |
| M-6 | IV.1 l.27–29 | El lienzo no cambia decisiones: refuerza L-05 y repite L-11. La guía (l.606) dice que si no cambia una decisión de alcance, no se usó. | Identificar una decisión que sí cambió, con fecha previa al acta, o decirlo con honestidad. |
| M-7 | IV.1 l.23 | Dice «infraestructura sin costo», pero las mediciones con agentes consumen tokens. | Declarar ese costo o dejarlo como `[DATO PENDIENTE]`. |
| M-8 | IV.1 l.7 | Descarta modelos de negocio con argumentos circulares, por decisiones de alcance y por una tautología. | Fundamentar con costo o segmento, o presentarlo como elección deliberada. |
| M-9 | IV.1 l.20; IV.3 l.12 | Llama barrera de entrada a un conocimiento que se publica bajo MIT. | Reconocer que no hay barrera; el proyecto se sostiene por utilidad. |
| M-10 | V.4 l.61–67 (Tabla 19) | La contingencia posterga RF-07, de modo que el OE-3 no se cumple, y no lo dice. «Un tercio» no tiene justificación. | Declarar qué objetivos quedan en pie y de dónde sale el tercio. |
| M-11 | V.1 l.20–22 | Llama al oráculo «condición de cada incremento», pero solo se regenera al cierre de la iteración. OpenCode escribe en la configuración e instala un paquete (resultado 23 del AE1). | «Condición de cada iteración» y declarar cómo se aísla el oráculo. |
| M-12 | V.1 l.11; V.5 l.21; `RNF-02.md` l.14 | La iteración prevista de RNF-02 y RF-11 difiere entre el informe y el Libro, y RF-10 y RF-11 no se tratan igual. | Unificar. |
| M-13 | III.2 l.85 | Dice que las siete reglas de derivación se verificaron por ejecución, pero RD-01 (H-01, lectura del cargador) y RD-04 (H-09) no lo sostienen. | «Cinco de ellas», o corregir la fuente. |
| M-14 | III.4 l.3; I.6 l.123 | Fueron 82 puntos en 35 minutos sin observaciones. I.6.6 no dice que RF-11 y RF-13 no llegan a la versión comprometida. | Una línea sobre qué parte de cada pantalla llega; preparar la respuesta oral. |
| M-15 | IV.1 l.29; V.4 l.57; RNF-06 | Windows es la plataforma de la organización y es lo primero que cae. La prioridad se justifica por el costo. No se sabe si la CI corre en Windows. | Aclarar la CI y el sistema operativo de la comprobación del v1. |

## Severidad baja

- B-1. IV.3 l.49 dice «relatado por el referente»; corresponde «la referente».
- B-2. V.4 l.18 dice que «los Must ocupan la totalidad de las 136 h», pero las 15 h incluyen la acreditación de RNF-06 y RNF-07 (Should).
- B-3. V.4 l.58: los 2 h de regeneración no tienen tarea propia (están en «H-18 y oráculo»).
- B-4. V.1 l.3: «semana 8 / 14» sin aclarar que son semanas del cuatrimestre.
- B-5. III.1 l.15: la fuente «A.I.3, resultado 4» no trata las rutas por sistema operativo; citar H-19 o I.6.4.
- B-6. III.3 l.12: la redacción de F5 es ambigua («resumen»: RF-11 no está comprometido).
- B-7. IV.3 l.59–60 (Tabla 13): las filas no son excluyentes y no se fija un margen.
- B-8. III.5 l.5 y Anexo I l.5 hablan de «los seis campos», pero el Libro tiene once. Aclarar que el Anexo sintetiza.
- B-9. V.1 l.16: falta la consecuencia si H-18 da negativo.

## Preguntas probables del tribunal

1. ¿Cómo reordena la línea de base (16/10) tareas que empiezan el 06/10 y el 11/10? (A-2)
2. ¿Dónde están la constancia firmada, el acta en el Anexo II y las capturas? (A-3)
3. ¿Cómo pasa RF-02 al 24/10 si la vista web de permisos es de la iteración 3? (A-1)
4. ¿La medición final está dentro de las 190 h? (A-7)
5. ¿Sobre qué proyecto y en qué hardware se miden los 2 s? (A-4, A-5)
6. ¿Qué decisión cambió el lienzo? (M-6)
7. ¿Cuánto del problema queda en pie? Responde bien. Falta decir si alguna incidencia de C-4 es un comando compuesto.
8. ¿Qué decisión arquitectónica prueba el v1? Responde. Pregunta de seguimiento: ¿por qué no empezó por lo más riesgoso?
9. La referente prefiere la línea de comandos: ¿por qué el v1 acredita la web? Falta una oración en V.5.
10. ¿Qué requisito implementa E-02? (M-3)
11. ¿De cuántas declaraciones se compone un valor implícito? (M-4)
12. Si EMSA no es el ámbito de implantación, ¿para quién es el sistema y por qué valida su referente?
13. ¿Cómo se sabe que el núcleo es independiente con un solo adaptador?
14. ¿Cuál es la barrera de entrada si todo es MIT? (M-9)
15. 82 puntos en 35 minutos: ¿se validó o se firmó? (M-14)
16. Si cae un tercio de la capacidad, ¿qué objetivo no se cumple? (M-10)
17. ¿El oráculo es reproducible sin red? (M-11)

## Marcadores no listados

- `informe/bibliografia.md` l.27 y l.29: la Ley N.º 27.506 está duplicada, y una de las entradas tiene `[VERIFICAR fecha de publicación]`.
- `informe/anexos/anexo-I-ae1-datos-relevados.md` l.71: el resultado 23 tiene dos `[DATO PENDIENTE]` (condiciona M-11).
