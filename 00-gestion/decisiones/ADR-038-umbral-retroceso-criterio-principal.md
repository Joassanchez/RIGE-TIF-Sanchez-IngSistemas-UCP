# ADR-038 — Umbral de retroceso del criterio principal: ningún participante pierde más de una respuesta correcta, con regla de techo

- Estado: reemplazado parcialmente por ADR-040 (25/09/2026): el umbral por participante pasa a un umbral por caso
- Fecha: 25/09/2026
- Capítulos afectados: Cap. I (I.3.4, criterio principal); Anexo III
- Origen: análisis integral del 25/09/2026, hallazgo I-04 (`00-gestion/revisiones/20260925-analisis-integral.md`); traspaso de sesión, grupo B, decisión 6
- Relacionado: complementa ADR-005 (criterio anclado en el valor observado y comparación pareada)

### Contexto

El criterio principal de I.3.4 declara alcanzado el éxito cuando la cantidad de respuestas correctas de cada participante «aumenta respecto de su propia línea de base en una mayoría de los participantes pareados, sin retrocesos que superen \[umbral\]» (`informe/cap-01/I.3-necesidad-problema-responde-proyecto.md`, línea 71). El umbral está vacío y debe fijarse antes de la primera sesión de la línea de base, con el mismo criterio que la Tabla 13 del IV.3.

Datos del repositorio:
- El instrumento tiene ocho casos, dos por condición (`informe/cap-02/II.2-instrumentos-dinamicas-aplicadas-alcance.md`, línea 11). Cada participante responde seis casos en C-2 a C-4: su puntaje va de 0 a 6.
- El estudio es exploratorio, sin contraste de hipótesis (II.2, línea 7): el umbral no admite derivación estadística y constituye una decisión de criterio.
- El tamaño de la muestra no se conoce aún (`[N]` en I.3.2, línea 37).

La redacción actual presenta dos defectos:
- **Ambigüedad:** «retroceso» admite dos lecturas, la magnitud de la pérdida de un participante o la cantidad de participantes que empeoran.
- **Efecto techo:** un participante con seis respuestas correctas en la línea de base no puede aumentar y cuenta en contra de la mayoría.

### Alternativas evaluadas

- **A:** Cero retrocesos: ningún participante empeora.
- **B:** Magnitud por participante: ningún participante pierde más de una respuesta correcta respecto de su línea de base.
- **C:** Cantidad de participantes: como máximo uno retrocede.
- **D:** Eliminar la cláusula y conservar solo la mayoría y la mediana.

### Análisis (trade-offs)

- **A:**
  - A favor: máxima exigencia, coherente con la prevalencia de IB-1 por su consecuencia de seguridad.
  - En contra: con seis ítems binarios, la pérdida de un caso entre sesiones es compatible con la variabilidad del propio participante sin efecto alguno de la plataforma (conocimiento general). El criterio puede fallar por azar.
- **B:**
  - A favor: una respuesta de seis equivale a un caso aislado; una pérdida de dos o más puede abarcar una condición completa, lo que apunta a una respuesta inducida por la plataforma, que es el riesgo principal (I.3.5). Lectura inequívoca.
  - En contra: el valor 1 es un juicio y no un cálculo; se declara como tal.
- **C:**
  - En contra: su exigencia depende del tamaño de la muestra, todavía desconocido (con cuatro participantes, uno es el 25 %; con doce, el 8 %). Reproduce el problema que ADR-005 evitó con los intervalos.
- **D:**
  - En contra: pierde la protección ante un resultado en el que la plataforma ayuda a la mayoría pero induce a error grave a algún participante.

### Recomendación y fundamento

Recomendación del ingeniero: **B**, con dos agregados:

1. **Informe de todo retroceso**, aun sin superar el umbral, con el caso afectado y su causa (descuido o respuesta inducida por RIGE). Vincula el criterio con el riesgo principal sin endurecer el umbral.
2. **Regla de techo:** el participante que obtiene el máximo en la línea de base y lo conserva cuenta como participante que cumple.

Redacción propuesta para el redactor (orientativa): «…aumenta respecto de su propia línea de base, o se mantiene en el máximo, en una mayoría de los participantes pareados, sin que ningún participante pierda más de una respuesta correcta…». Todo retroceso se informa con el caso afectado y su causa.

**Condición que invalidaría la decisión:** que cambie la estructura del instrumento (por ejemplo, más casos por condición), en cuyo caso el umbral se expresa en proporción; o que la decisión no quede registrada antes de la primera sesión de la línea de base, con lo que pierde su carácter de criterio fijado de antemano. La fecha de este ADR constituye la evidencia de ese registro.

### Decisión del autor

El autor acepta la alternativa **B** con ambos agregados (25/09/2026). Pendiente el cambio de estado por el autor (`/aceptar`).

### Consecuencias

- **I.3.4, criterio principal:** reemplazar «\[umbral\]» conforme a la redacción propuesta; incorporar la regla de techo y el informe de todo retroceso. Se aplica con `/corregir` en la pasada por el Cap. I.
- **Protocolo de medición final (OE-4):** registrar, por participante, los casos perdidos respecto de la línea de base y su causa.
- **Anexo III:** fila de la decisión cuando se complete AD-04.

### Evidencia

`informe/cap-01/I.3-necesidad-problema-responde-proyecto.md` (I.3.2, línea 37; I.3.4, línea 71; I.3.5); `informe/cap-02/II.2-instrumentos-dinamicas-aplicadas-alcance.md` (líneas 7 y 11); `informe/cap-04/IV.3-analisis-rivalidad-amplificada.md` (Tabla 13); ADR-005.
