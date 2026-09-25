# ADR-039 — Ejecución de la línea de base como deuda del AE1: ventana del 02/10 al 16/10, con cargo a la reserva de la Ventana, y corrección de la premisa de ADR-011

- Estado: reemplazado parcialmente por ADR-040 (25/09/2026): se conserva la ventana del 02/10 al 16/10; cambian la estimación de horas y la consecuencia R-B
- Fecha: 25/09/2026
- Capítulos afectados: Cap. V (V.1, línea 16; V.4, distribución de la reserva); Cap. I (I.3.2); Cap. II (II.2.1, premisa de la forma única; II.2.4 o II.6.3, amenaza de práctica); Anexo III (D-11)
- Origen: análisis integral del 25/09/2026, hallazgo T-06 (`00-gestion/revisiones/20260925-analisis-integral.md`); traspaso de sesión, grupo B, decisión 7
- Relacionado: complementa ADR-011 (forma única del instrumento; se corrige su premisa, no la decisión); ADR-027 y Tabla 13 del IV.3 (criterio fijado antes de medir); ADR-030 (presupuesto); ADR-038 (umbral del criterio principal)

### Contexto

Tres defectos encadenados (datos del repositorio):

1. **Fecha:** V.1 declara el resultado de la línea de base «disponible antes» del inicio de la iteración 2 (02/10) (`informe/cap-05/V.1-definicion-iteraciones-sprints.md`, línea 16). La medición no está hecha: I.3.2 conserva `[N]` y `[fecha]` (`informe/cap-01/I.3-necesidad-problema-responde-proyecto.md`, línea 37).
2. **Horas:** la reserva de 54 h está íntegramente asignada (14 h cierre de la AE2, 20 h Ventana y correcciones del AE1, 13 h Caps. VI y IX, 7 h preparación de la medición final) y ninguna línea cubre la ejecución de la línea de base (`informe/cap-05/V.4-cronograma.md`, línea 16).
3. **Premisa de ADR-011:** II.2.1 descarta las formas paralelas frente al riesgo de recuerdo «entre mediciones separadas por varios meses» (`informe/cap-02/II.2-instrumentos-dinamicas-aplicadas-alcance.md`, línea 11). La separación real es de semanas.

Datos aportados por el autor (25/09/2026): el instrumento está construido; el reclutamiento está iniciado; no se realizó ninguna sesión; la sesión dura como máximo 30 minutos; la cantidad mínima de participantes es 5. El autor considera la línea de base una deuda del AE1 y no un trabajo de la AE2.

Otros datos:
- La iteración 2 comienza por la incorporación del evaluador de permisos en cualquiera de los dos órdenes posibles; la Tabla 13 decide solo lo que sigue (RF-02 o RF-06) (`informe/cap-05/V.4-cronograma.md`, línea 51; `informe/cap-05/V.1-definicion-iteraciones-sprints.md`, línea 16).
- La Ventana de Mejora y Cumplimiento de la AE2 va del 9 al 16 de octubre de 2026 (`catedra/AE2-guia.md`, línea 207).
- La guía de la AE2 controla que «el flujo de valor automatizable se justifica con la evidencia de la línea de base» (`catedra/AE2-guia.md`, línea 1106).

### Alternativas evaluadas

Fecha:
- **F-A:** Medir antes del 02/10, a la par de la entrega de la AE2.
- **F-B:** Medir entre el 02/10 y el 16/10, con cierre antes de concluir la incorporación del evaluador.
- **F-C:** Medir en la iteración 3.

Horas:
- **H-A:** Descontarlas de la capacidad técnica de la iteración 2.
- **H-B:** Imputarlas, como deuda del AE1, a las 20 h de reserva de la Ventana y de las correcciones del AE1.
- **H-C (planteada por el autor):** no computarlas ni mencionar la medición.

Premisa de ADR-011:
- **R-A:** Reabrir la forma única y construir formas paralelas.
- **R-B:** Conservar la forma única, corregir la premisa y declarar el efecto de práctica como amenaza.

### Análisis (trade-offs)

- **F-A:** no realista con la entrega del 01/10 y sin sesiones agendadas.
- **F-B:** la Tabla 13 conserva su función porque el orden de la iteración 2 se decide después del evaluador; el período se superpone con la Ventana de la AE2.
- **F-C:** la Tabla 13 pierde su función y la separación con la medición final se reduce a unas tres semanas, lo que agrava el recuerdo.
- **H-A:** trata como trabajo técnico de la AE2 una deuda del AE1 y desplaza requisitos de la iteración 2.
- **H-B:** respeta la naturaleza de la tarea (corrección del AE1), no altera la capacidad técnica y deja el plan coherente con lo que registrará la bitácora. Tensión: las 20 h deben cubrir también las demás correcciones del AE1.
- **H-C:** la Tabla 13 del IV.3 y V.1 dependen del resultado, de modo que omitir la medición deja una contradicción; las horas se gastan igual y la bitácora muestra un desvío no planificado respecto de V.2. Se descarta.
- **R-A:** con muestras pequeñas, el riesgo de formas no equivalentes sigue siendo mayor que el de recuerdo (argumento de ADR-011 que se mantiene).
- **R-B:** mantiene la decisión con una premisa verdadera. Amenaza que se declara (conocimiento general de metodología): el diseño es pareado y sin grupo de control, de modo que el recuerdo de los casos puede mejorar la medición final con independencia de RIGE y el criterio principal lo atribuiría a la plataforma. Mitigación existente: el criterio secundario compara contra C-1, condición de control expuesta al mismo recuerdo.

**Estimación de horas** (estimación del ingeniero; a confirmar por el autor en la bitácora de la primera sesión):

| Concepto | Cálculo | Horas |
|---|---|---|
| Sesiones | 5 participantes × 30 min | 2,5 |
| Preparación y restauración de la máquina virtual | 5 × 10 min *(suposición)* | ~0,8 |
| Corrección y revisión de la grabación | 5 × 20 min *(suposición)* | ~1,7 |
| Análisis y carga de I.3.2 (Tabla 4), II.3 (Tabla 14) y Anexo I, A.I.8 | *(suposición)* | ~4 |
| **Total** | | **~9 h** |

Quedan unas 11 h de la reserva para las demás correcciones del AE1. Cada participante adicional agrega alrededor de 1 h.

### Recomendación y fundamento

Recomendación del ingeniero: **F-B + H-B + R-B**. Ejecuta la medición en el único período en que conserva su función decisoria, la imputa como lo que es sin alterar la capacidad técnica y corrige la premisa sin reabrir una decisión cuyo argumento central sigue en pie.

**Condición que invalidaría la decisión:** que la incorporación del evaluador termine antes de que concluya la medición (el orden de la iteración 2 se decide entonces sin la Tabla 13 y debe declararse en V.1); o que las correcciones del AE1 no quepan en las horas restantes de la reserva, en cuyo caso se prioriza la medición y se registra qué corrección se posterga.

### Decisión del autor

El autor acepta F-B, H-B y R-B (25/09/2026). Pendiente el cambio de estado por el autor (`/aceptar`).

### Consecuencias

- **V.1, línea 16:** una oración: la línea de base se ejecuta entre el 02/10 y el 16/10 como corrección del informe de la AE1, con cargo a la reserva de la Ventana, y su resultado está disponible antes de fijar el orden de la iteración 2, una vez incorporado el evaluador.
- **V.4, línea 16:** la reserva de 20 h de la Ventana y las correcciones del AE1 comprende la ejecución de la línea de base. Sin cambio de totales.
- **II.2.1:** «separadas por varios meses» → la separación real (entre cinco y ocho semanas: línea de base del 02/10 al 16/10; medición final en la fase de cierre, semanas 15 y 16).
- **II.2.4 o II.6.3:** declarar el efecto de práctica entre mediciones como amenaza, con la mitigación del criterio secundario.
- **Anexo III, D-11:** ajustar la deliberación con la separación real.
- **I.3.2 e II.3:** se completan con los resultados de la medición (`[N]`, `[fecha]`, Tablas 4 y 14, Anexo I, A.I.8).
- **Prerrequisito:** ADR-038 aceptado antes de la primera sesión.
- II.2.1, II.2.4, II.6.3 e I.3.2 son secciones del AE1: se corrigen en la Ventana. V.1 y V.4 se corrigen con `/corregir` en la pasada por el Cap. V.

### Evidencia

`informe/cap-05/V.1-definicion-iteraciones-sprints.md` (línea 16, Tabla 14); `informe/cap-05/V.4-cronograma.md` (líneas 16 y 51); `informe/cap-01/I.3-necesidad-problema-responde-proyecto.md` (línea 37); `informe/cap-02/II.2-instrumentos-dinamicas-aplicadas-alcance.md` (línea 11); `informe/cap-04/IV.3-analisis-rivalidad-amplificada.md` (Tabla 13); `catedra/AE2-guia.md` (líneas 207 y 1106); ADR-011, ADR-027, ADR-030, ADR-038.
