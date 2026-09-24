# ADR-022 — Salida por línea de comandos en versión mínima: un comando único de consulta de valores efectivos con procedencia

- Estado: aceptado (retroactivo)
- Fecha: AE2 (septiembre de 2026)
- Capítulos afectados: Cap. III (III.3, III.4 decisión L-06), RF-03, RNF-08; Cap. V (V.4, Tablas 18 y 19; V.5, CU-05 y Tabla 21)
- Origen: Cap. III, III.3 y III.4; chat «Capitulo III - AE1»
- Revisión: 24/09/2026, contenido ampliado a partir del informe; la decisión no cambia
- Relacionado: **acota ADR-017** (incorporación de la interfaz de línea de comandos); no lo reemplaza

### Contexto
ADR-017 incorporó una interfaz de línea de comandos de solo lectura, fundada en una práctica relevada: el equipo consultado interroga la configuración por vía programática mediante un agente, con consumo de tokens y sin garantía de exactitud. ADR-017 fijó el *qué*; faltaba fijar *cuánto* de esa interfaz se compromete en el período, dentro del presupuesto de ADR-030.

### Alternativas evaluadas
- **Adoptada:** Un comando único de consulta de valores efectivos con procedencia, con salida estructurada y determinista.
- **Descartada:** Exponer por línea de comandos todas las funciones de la interfaz de escritorio (consulta de permisos, listados, exportación y consulta inversa).

### Análisis (trade-offs)
- **Paridad completa** atendería todos los usos programáticos, pero duplica la superficie de verificación —cada función debe probarse por ambas interfaces (ADR-017, consecuencias)— y compromete horas que exceden el presupuesto efectivo (III.4, fila L-06).
- **Comando único** cubre la necesidad relevada con 6 h (V.4, Tabla 18, iteración 3). El consumidor es un agente que usa la salida sin juzgarla (IV.3, poder de negociación de clientes), por lo que el esquema debe ser estable y determinista (RF-03, RNF-08).
- **Tensión a declarar** (observación del ingeniero): RF-03 es el primer requisito Must que se posterga ante la contingencia (V.4, Tabla 19, orden 3). El tribunal puede preguntar por qué una necesidad relevada es lo primero que se abandona. La respuesta está en V.4: sin RF-03, el OE-1 pierde solo su verificación por esa interfaz, mientras que postergar RF-07 deja el OE-3 sin cumplir.

### Recomendación y fundamento
Adoptar la versión mínima: atiende al consumidor no humano relevado con el menor compromiso de diseño y mantiene acotada la verificación cruzada entre interfaces.

### Decisión del autor
Limitar la interfaz de línea de comandos del período a un comando único de consulta de valores efectivos con procedencia, con salida estructurada y determinista.

### Consecuencias
- Exclusión validada con el referente como decisión L-06 (III.4; acta del `[fecha]`, pendiente A-05).
- La consulta de decisiones de permiso por línea de comandos figura como caso de uso excluido del MVP (V.5, Tabla 21).
- El objetivo de la iteración 3 exige valores idénticos entre la línea de comandos y la interfaz de escritorio (V.1, Tabla 14).
- **Condición que invalidaría la decisión** (observación del ingeniero): que el referente o la medición muestren que el uso programático relevado consiste principalmente en consultar permisos y no valores; en ese caso, el comando único no atiende la necesidad que justificó ADR-017.

### Evidencia
`informe/cap-03/III.3-alcance-sistema-alcance-proyecto.md`; `informe/cap-03/III.4-limites-sistema.md` (Tabla 8, L-06); `informe/cap-04/IV.3-analisis-rivalidad-amplificada.md`; `informe/cap-05/V.4-cronograma.md` (Tablas 18 y 19); `informe/cap-05/V.5-descripcion-producto-minimo-viable.md` (Tablas 20 y 21).
