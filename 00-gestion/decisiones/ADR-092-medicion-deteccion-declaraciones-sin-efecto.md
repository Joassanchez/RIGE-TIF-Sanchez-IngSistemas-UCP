# ADR-092 — Medición de detección: el agente busca declaraciones sin efecto en un entorno con defectos sembrados verificados con OpenCode

- Estado: aceptado (14/10/2026)
- Fecha: 14/10/2026
- **Se decide después de conocer los resultados previos y antes de medir esta dimensión.**
- Capítulos afectados: Cap. I (I.3.2); Cap. II (II.2, II.3); Anexo VI (A.VI.7, A.VI.8); diseño de la medición
- Relacionado: ADR-080 (manifiesto de aceptación), ADR-088, ADR-090, ADR-091, ADR-093; RF-07, OE-3

### Contexto

1. **[D]** OE-3 exige a RIGE detectar la totalidad de los defectos sembrados de seis tipos con cero falsos positivos (I.2.4; RF-07, con el defecto de ruta absoluta de ADR-088).
2. Medir al agente con la misma vara permite comparar agente solo, RIGE solo y agente con RIGE.

### Recomendación y fundamento

1. **Corpus:** tres o cuatro escenarios con defectos sembrados de los seis tipos de RF-07, la regla con ruta absoluta y los mecanismos de las incidencias de A.VI.6 que se reproduzcan en 1.18.25, más declaraciones correctas de control. **Cada defecto se verifica por ejecución de OpenCode** (la declaración no produce efecto) y cada control también (sí lo produce), antes de medir.
2. **Pregunta al agente:** «¿Hay declaraciones de configuración que no producen efecto? Indicá cada una con su archivo y su clave o regla, y por qué». Salida estructurada: lista de `{archivo, clave, motivo}`.
3. **Corrección mecánica:** coincidencia por archivo y clave contra la lista verificada. Detectado: aparece; falso positivo: señala una declaración de control. El motivo se registra, no se juzga.
4. **Indicadores:** ID-1, sensibilidad por defecto (detectado en al menos 2 de 3 ejecuciones); ID-2, falsos positivos por ejecución; tokens.
5. **Repeticiones:** k = 3, `build` y Charles.
6. **Medición final:** con RIGE disponible e indicado.

**Condición que invalidaría la decisión:** que la coincidencia por archivo y clave no se pueda hacer en forma mecánica para algún tipo de defecto; ese tipo se informa aparte y no entra al criterio.

### Decisión del autor

**Aceptado por el autor el 14/10/2026**, tal como está redactado.

### Consecuencias

Construcción y verificación del corpus (ficha del escritor, MED-10); el mismo corpus alimenta el manifiesto de aceptación de RIGE (LB-04), con lo que la comparación es directa.

### Evidencia

- `informe/cap-01/I.2-mision-vision-objetivos-proyecto.md` (OE-3); `03-requisitos/libro/catalogo/RF-07.md`; Anexo VI, A.VI.6
