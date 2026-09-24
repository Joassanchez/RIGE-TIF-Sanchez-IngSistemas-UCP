# ADR-030 — Presupuesto sobre horas reales: 190 h efectivas (136 técnicas y 54 de reserva documental), con cláusula de contingencia

- Estado: aceptado (retroactivo)
- Fecha: AE2 (septiembre de 2026)
- Capítulos afectados: Cap. V (V.4, Tablas 17 a 19; V.5); Cap. III (III.3, último párrafo); Cap. IV (IV.1, Tabla 10); Cap. X
- Origen: Cap. V, V.4 (Tablas 17 a 19); chat «Planificación estructurada del Capítulo V»
- Revisión: 24/09/2026, análisis ampliado, cálculo verificado e inconsistencias detectadas; la decisión no cambia

### Contexto
El proyecto es de autoría individual. Las horas semanales reales del autor constan en el Instrumento 24 (`03-requisitos/instrumento-34-recursos.md` y `03-requisitos/libro/iteraciones.md` lo citan) y determinan qué requisitos Must caben en el período de ocho semanas (21/09–14/11/2026).

### Alternativas evaluadas
- **Adoptada:** Presupuesto sobre 28 h semanales reales, en dos líneas —20 técnicas y 8 de reserva documental y de validación—, con una reducción del 15 % por exámenes y el feriado del 12/10, y una cláusula de contingencia ante la caída de un tercio de la capacidad técnica.
- **Descartada:** Presupuestar sobre la duración nominal del cuatrimestre.

### Análisis (trade-offs)
- **Duración nominal** da una cifra mayor y más fácil de justificar, pero no corresponde a la dedicación real y conduce a comprometer requisitos que no se pueden construir.
- **Horas reales en dos líneas** separa lo que financia requisitos (capacidad técnica) de lo que tiene fecha fija y no admite recorte (redacción, correcciones, mediciones). La reserva no opera como margen de contingencia (V.4).
- **Cálculo verificado en la revisión** (V.4, Tabla 17): 28 h × 8 semanas = 224 h (160 técnicas + 64 de reserva); reducción 15 % = 34 h (24 + 10); efectivo 190 h (136 + 54). La capacidad técnica por iteración (34 + 51 + 34 + 17) suma 136 h, y la reserva (14 + 20 + 13 + 7) suma 54 h. Los números son internamente consistentes.
- **Contingencia** (V.4, Tabla 19): una caída de un tercio reduce las 136 h a 91 h; las 45 h se absorben postergando, en orden, los Should sin horas, la regeneración automática del oráculo, RF-03, RF-10, RF-04 parcial, RF-07 y parte de la estabilización. Criterio único: se posterga primero lo que no interviene en la medición final ni en la mitigación del riesgo principal. No se sacrifican nunca la trazabilidad, la ejecutabilidad de cada etiqueta, RNF-01, RNF-02, RNF-04, RNF-05 ni CU-01 a CU-03.

### Recomendación y fundamento
Adoptar el presupuesto sobre horas reales: hace que los quince Must ocupen exactamente las 136 h técnicas y que la contingencia sea verificable, en lugar de declarativa.

### Decisión del autor
Construir el presupuesto sobre 28 h semanales reales (20 técnicas y 8 de reserva), con reducción del 15 %, y absorber una caída de un tercio de la capacidad técnica postergando, en orden, los Should sin horas, la regeneración automática del oráculo, RF-03, RF-10, RF-04 parcial y RF-07.

### Consecuencias
- Los Should no reciben horas y se ejecutan en la iteración 3 solo si las anteriores cierran por debajo de lo estimado.
- La fase de cierre (48 h estimadas en las semanas 15 y 16) se declara aparte, sujeta a las fechas de la AE4.
- **Inconsistencias detectadas en la revisión** (secciones con estado «aprobada (migración)»):
  - `informe/cap-03/III.3-alcance-sistema-alcance-proyecto.md`, último párrafo: declara 20 h semanales sobre **nueve** semanas, 180 h totales y **153 h** efectivas.
  - `informe/cap-04/IV.1-definicion-negocios.md`, Tabla 10, «Estructura de costos»: cita 153 h «(apartado V.4)».
  - V.4 y este ADR declaran **ocho** semanas y 190 h (136 técnicas). La cifra de 153 h corresponde a un cálculo anterior (solo horas técnicas, nueve semanas). Ver pendientes.
- **Observación sobre el título** (del ingeniero): la cifra que determina el alcance es 136 h técnicas, no 190 h; en la defensa conviene citar primero las 136 h.
- **Condición que invalidaría la decisión:** una caída de la capacidad técnica mayor a un tercio, que la Tabla 19 no absorbe y que obliga a modificar el MVP del V.5, con un ADR de reemplazo.

### Evidencia
`informe/cap-05/V.4-cronograma.md` (Tablas 17 a 19); `informe/cap-03/III.3-alcance-sistema-alcance-proyecto.md`; `informe/cap-04/IV.1-definicion-negocios.md` (Tabla 10); chat «Planificación estructurada del Capítulo V».
