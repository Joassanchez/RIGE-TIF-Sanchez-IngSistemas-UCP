# ADR-064 — Horas de los requisitos incorporados por ADR-059: RNF-10 dentro de la incorporación del evaluador, RNF-09 con una hora en la iteración 1, RF-16 con tres horas en la iteración 2, financiadas con la estabilización

- Estado: aceptado (29/09/2026)
- Fecha: 29/09/2026
- Capítulos afectados: Cap. V (V.1, orden de construcción; V.4, párrafo de capacidad, Tablas 18 y 19 y Figura 3); Cap. III (III.3, último párrafo); Cap. X (X.1); Instrumento 34; libro (`iteraciones.md`); `tools/figura_cronograma.py`
- Origen: sesión de diseño del 29/09/2026. ADR-059 incorporó tres requisitos Must (RF-16, RNF-09, RNF-10) y dejó sus horas a decisión del autor (AR-07)
- Relacionado: **modifica** ADR-052 en la distribución de horas por tarea y en la fila 7 de la Tabla 19. Se mantienen el presupuesto (190 h: 136 técnicas y 54 de reserva), la capacidad por días y la contingencia de un tercio. Sigue el precedente de D-38 (Anexo III)

### Contexto

El plan de ADR-052 cierra con dos restricciones exactas:
- **Las 136 h técnicas se asignan completas** en la Tabla 18 (34, 57, 30 y 15 h). La reserva de 54 h no es margen de contingencia: está comprometida con entregables de fecha fija y con la línea de base (ADR-052, P-B y C-D).
- **La cláusula de contingencia absorbe 45 h** (un tercio), en siete órdenes de postergación. El último reduce la estabilización de 15 h a 5 h y libera 10 h.

ADR-059 agregó tres requisitos Must sin horas. La Tabla 18 ya contiene, en la iteración 2, la tarea «Incorporación del evaluador de permisos de OpenCode, con atribución» (10 h).

### Alternativas evaluadas

**Estimación** (juicio del ingeniero, que el autor acepta):
- **RNF-10:** 0 h adicionales. Se incorpora a la tarea del evaluador, que ya incluye la atribución.
- **RNF-09:** +1 h sobre la tarea «Interfaz mínima de selección del proyecto y consulta» de la iteración 1 (4 h → 5 h).
- **RF-16:** +3 h, en una tarea nueva de la iteración 2.
- *Alternativa descartada:* absorber las tres sin horas.

**Financiamiento de las 4 h**
- **F-A:** tomarlas de la estabilización de la iteración 4 (15 h → 11 h) y reescribir la fila 7 de la Tabla 19 como «Estabilización, reducida de 11 h a 1 h», que libera las mismas 10 h.
- **F-B:** tomarlas de la estabilización y agregar a la Tabla 19 la postergación de la vista web del listado de agentes.
- **F-C:** tomarlas de la reserva documental.
- **F-D:** elevar el total técnico a 140 h.

### Análisis (trade-offs)

**Estimación.**
- Absorber RNF-09 y RF-16 sin horas ajusta la estimación para que la cuenta cierre. Es el criterio que el proyecto ya descartó en D-38.
- RNF-10 sí está contenido en una tarea existente, cuyo enunciado nombra la atribución.
- RNF-09 son dos funciones que envuelven al servidor y tres pruebas (ADR-058, convención 6).
- RF-16 se apoya en la Resolución, que ya contiene los agentes. El trabajo es el subcomando, la vista web, la identificación de los nativos (condicionada a H-18) y las pruebas.

**Financiamiento.**
- **F-A** conserva el tope de 136 h y el tercio exacto de la contingencia. Sigue el precedente de D-38 (la iteración 2 tomó 2 h del margen de estabilización).
  - Costo: la estabilización baja a 11 h en el plan y, en el peor escenario de contingencia, a 1 h en lugar de 5 h.
  - Se sostiene porque la cuarta iteración no incorpora funcionalidad, y las acreditaciones de RNF-06 y RNF-07, que son Should, ya son lo primero que cae (Tabla 19, orden 1).
- **F-B** reduce menos la estabilización en el peor caso, pero agrega una postergación que deja un Must sin parte de su criterio (CA-3 de RF-16, coincidencia entre interfaces) y complica la cláusula.
- **F-C** contradice ADR-052, que separa la reserva de la contingencia.
- **F-D** declara horas que no existen.

**Capacidad por días** (V.4): con 35, 60, 30 y 11 h sobre capacidades de 28, 59, 33 y 16 h:
- la iteración 1 excede en 7 h (antes 6) y la 2 en 1 h;
- la holgura de la 3 y la 4 (3 y 5 h) compensa esas 8 h;
- el total sigue en 136 h, y el argumento de V.4 (el exceso de la primera pasa a la segunda por el criterio de corte) se mantiene.

### Recomendación y fundamento

Estimación 0 + 1 + 3 y financiamiento **F-A**. Es la única combinación que no infla ni recorta estimaciones, conserva el presupuesto y la contingencia de un tercio sin tocar la reserva, y sigue un precedente ya aceptado.

**Condición que invalidaría la decisión:**
- Que la iteración 1 cierre con un desvío mayor que el declarado, de modo que la holgura de las iteraciones 3 y 4 no alcance.
- Que la verificación de H-18 resulte negativa y RF-16 se reduzca a los agentes declarados. En ese caso sobran horas y vuelven a la estabilización.

### Decisión del autor

Aceptado por el autor el 29/09/2026, en la sesión de diseño, al confirmar la estimación (0 + 1 + 3 h) y la opción F-A.

### Consecuencias

- **Tabla 18** (libro e informe):
  - iteración 1: «Interfaz mínima…» pasa a RF-01 y RNF-09, con 5 h; subtotal 35;
  - iteración 2: la tarea del evaluador cita RF-02 y RNF-10; se agrega «Listado de los agentes declarados y nativos, por ambas interfaces» con RF-16 y 3 h; subtotal 60;
  - iteración 4: 11 h;
  - total: 136.
- **Tabla 19:**
  - orden 1 agrega RF-12 a los Should sin horas;
  - orden 7: «Estabilización, reducida de 11 h a 1 h», 10 h, acumulado 45.
- **V.4:** el párrafo de capacidad pasa a 35, 60, 30 y 11 h, con exceso de 7 y 1 h y holgura de 3 y 5 h. El párrafo de Should dice seis e incluye RF-12. La Figura 3 se regenera.
- **V.1, orden de construcción:**
  - RNF-09 se construye con la interfaz del v1;
  - RNF-10, con la incorporación del evaluador;
  - RF-16, después de la verificación de H-18.
- **III.3:** se retira el marcador de horas pendientes.
- **X.1 e Instrumento 34:** «catorce» pasa a «diecisiete» requisitos Must. Las 136 h y el costo no cambian.
- **ADR-052:** nota de modificación.
- **Anexo III:** fila D-55.
- **`tools/figura_cronograma.py`:** datos de las tareas actualizados.

### Evidencia

- ADR-052 (presupuesto, P-B, C-D, Tabla 19)
- ADR-059 (requisitos nuevos)
- ADR-058, convención 6
- Anexo III, D-38
- `03-requisitos/libro/iteraciones.md` (Tablas 18 y 19)
- `informe/cap-05/V.4-cronograma.md` (párrafo de capacidad por días)
- Sesión de diseño del 29/09/2026
