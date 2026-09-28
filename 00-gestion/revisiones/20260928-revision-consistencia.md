# Revisión de consistencia · piezas corregidas después de la validación (28/09/2026)

- Fecha: 28/09/2026
- Agente: `verificador-consistencia` (solo lectura)
- Objeto:
  - Anexo I contra el Libro y Anexo V contra el Libro;
  - enunciados contra el acta y recuento 14/5/3/1;
  - horas en V.4, `iteraciones.md`, ADR-046, III.3, IV.1 y `tools/figura_cronograma.py`;
  - iteraciones, interfaces, fechas y fórmula de conformidad;
  - Figura 1 contra las Tablas 2 y 4.
- Resultado: 0 hallazgos bloqueantes, 2 importantes y 3 menores.
- Estado: **sin aplicar**.

## Verificado sin hallazgos

- **Anexos contra el Libro:**
  - El Anexo I (fichas, A.I.1 y A.I.2) coincide carácter por carácter con `03-requisitos/libro/`.
  - El Anexo V (A.V.1, A.V.2 y A.V.3) también coincide carácter por carácter.
- **Enunciados:** la única diferencia entre el acta y el Libro es la de RNF-07, que es la prevista por ADR-045. RF-03, RF-07, RF-10, RNF-06 y RNF-08 son idénticos.
- **Recuentos:** 14/5/3/1 en III.3, III.5, V.1, V.4 y V.5. RF-10 es Should y queda fuera del MVP en todas las piezas.
- **Horas:** 34 + 53 + 34 + 15 = 136 y contingencia de 45. Son iguales en V.4, `iteraciones.md`, ADR-046 y el script de la Figura 3.
- **Fechas y conformidad:**
  - La fecha 26/09/2026 aparece de forma consistente y no quedan menciones del 22/09.
  - No se afirma una constancia firmada.
  - No aparece «escritorio» aplicado a RIGE.
- **Conteos:** las cifras 11/7/11/8 de III.5 y las 13 filas y 12 decisiones de III.4 son exactas.

## Importantes

| # | Dónde | Problema | Propuesta |
|---|---|---|---|
| C-1 | `RNF-02.md` l.14; V.1 l.10–11 (Tabla 14); V.2 l.17 (Tabla 15); V.4 l.35 y l.41 (Tabla 18) | Las fuentes no coinciden sobre RNF-02:<br>• la ficha lo ubica en la iteración 2;<br>• la Tabla 14 lo compromete en la 3;<br>• la Tabla 15 cierra su criterio en la 3;<br>• la Tabla 18 le asigna horas en la 2 y en la 3.<br>Con RF-02 pasa lo inverso: la ficha dice 2, pero la vista web se paga en la 3 y la Tabla 14 no la lista en esa iteración. | La ficha de RNF-02 debe decir 3, que es donde se satisface el criterio. En la Tabla 14, aclarar que la vista web de RF-02 se completa en la 3. |
| C-2 | IV.3 l.53 | Anuncia «ocho corresponden a exclusiones…» y enumera siete. Además, la lista mezcla exclusiones validadas por la referente (credenciales es L-03; validación de esquema es L-09) con las «ocho restantes» de ingeniería de III.4 l.33. | Recontar contra la Tabla 8 de III.4 y corregir el número o la lista. |

## Menores

| # | Dónde | Problema | Propuesta |
|---|---|---|---|
| C-3 | I.6 l.121 | `\[fecha\]` de la entrevista: el formato no sigue la convención `[DATO PENDIENTE: …]` (A-06). | Completar la fecha o usar el marcador convencional. |
| C-4 | `03-requisitos/modelo-dominio.mmd` l.2–3 | El comentario dice «11 relaciones», pero el diagrama traza 12 aristas, porque el xor del Hallazgo se desdobla en dos. | Aclarar el desdoblamiento en el comentario. |
| C-5 | III.3 l.20 | Atribuye la exclusión de los Could y del Won't a la cláusula de contingencia de V.4, cuando se debe a su prioridad MoSCoW (III.5). | Remitir a III.5. |
