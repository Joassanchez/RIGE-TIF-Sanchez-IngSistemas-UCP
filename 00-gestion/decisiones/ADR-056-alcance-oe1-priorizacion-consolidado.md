# ADR-056 — Alcance del OE-1 y priorización: OE-1 por agente y clave, sin las relaciones entre elementos (capacidad diferida, RF-13); RF-10 pasa a Should y el conjunto Must queda en catorce

- Estado: aceptado (28/09/2026)
- Fecha: 28/09/2026
- Capítulos afectados: Cap. I (I.2.2, I.2.4 Tabla 1, I.6.2 Tabla 7); Cap. III (III.3, III.5 Tabla 9); Cap. IV (IV.3); Cap. V (V.2, V.4 Tablas 18 y 19, V.5 Tabla 20); Anexo I; libro (RF-10, RF-13, `iteraciones.md`)
- Origen: consolidación del 28/09/2026 (pendiente LI-01). No es una decisión nueva: reúne ADR-034 y ADR-035, ambos aceptados el 25/09/2026. Se unen porque las dos decisiones reescriben el mismo objetivo (OE-1) y la segunda nació como cuestión abierta de la primera.
- Reemplaza: ADR-034 y ADR-035. Sus archivos se eliminaron el 28/09/2026 (quedan en el historial de git).
- Relacionado: D-08 (el agente como eje), ADR-020 («entrada» en lugar de «fuente»), ADR-052 (contingencia), ADR-051 (RF-03 sigue siendo Must).

### Contexto

Hay dos defectos en el OE-1 del AE1 (I.2.4, Tabla 1):

1. **Incluía las relaciones entre elementos**, y su indicador exigía que «las relaciones coinciden con las definidas en cada escenario». Pero la función F3 quedó diferida (III.3, Tabla 7) y RF-13 es Could, sin iteración, así que el objetivo no podía declararse cumplido. La única evidencia para subir las relaciones al período era la pizarra que relató la referente, sin constancia más allá de la entrevista (cambios P-01 a P-12 sobre el valor probatorio de la entrevista).
2. **Decía «para cada elemento del ecosistema»**, mientras RF-01 resuelve por agente y clave, y ningún Must resuelve MCP, LSP o skills como elementos propios.

A eso se suma la priorización: había 15 Must sobre 23 (65 %). La Guía AE2 (§4.3) lee esa proporción como indicador de madurez, y la Tabla 19 postergaba RF-10 entre los primeros, así que se comportaba como Should.

### Alternativas evaluadas

**Eje R · Relaciones**
- **R-A:** OE-1 sin las relaciones, que pasan a capacidad diferida (RF-13, Could).
- **R-B:** Subir al período la relación de invocación entre agentes.
- **R-C:** Mantener OE-1 y declarar de antemano que se cumple solo en parte.

**Eje M · Priorización**
- **M-A:** Mantener los 15 Must.
- **M-B:** RF-10 a Should (14 de 23).
- **M-C:** Dejar como Must solo lo que protege la contingencia (11 de 23).

### Análisis (trade-offs)

**Eje R**
- **R-A:** es coherente con III.3 y con el presupuesto, sin mover horas. La postergación se defiende con el motivo de prioridad de RF-13: ninguna de las cuatro consultas que originan el problema depende de las relaciones.
- **R-B:** toca el catálogo, el MVP y la Tabla 18, que ya estaba completa.
- **R-C:** un objetivo que se sabe incumplible es una aspiración (Guía AE1, §3.2).

**Eje M**
- **M-A:** deja la contradicción con la Tabla 19.
- **M-B:** es coherente con la contingencia. RF-10 es una extensión de CU-03, no su núcleo.
- **M-C:** deja OE-3 apoyado en un Should y la CLI como opcional.

### Recomendación y fundamento

**R-A + M-B**, con OE-1 reformulado por agente y clave. Es lo que el autor aceptó el 25/09/2026; este registro no cambia ninguna decisión.

**Condiciones que invalidarían la decisión:**
1. **La referente declara que la representación de las relaciones es su necesidad principal**, por encima del valor efectivo y su procedencia. No ocurrió en la sesión del 26/09/2026.
2. **La validación muestra que saber si la herramienta queda visible para el modelo (RF-10) es una necesidad central.** Tampoco ocurrió en esa sesión.

### Decisión del autor

**Aceptado por el autor el 28/09/2026** (consolidación). Las decisiones de fondo ya están aceptadas: ADR-034 y ADR-035, ambos el 25/09/2026. La aceptación de este registro solo autoriza la consolidación.

### Consecuencias

**OE-1 (I.2.4, redacción aplicada el 25/09/2026):**

> «Determinar, sobre las entradas ejercitables, el valor efectivo de cada clave de configuración de cada agente, declarado por el usuario o incorporado por la herramienta, con su procedencia, las declaraciones desplazadas o la indicación de valor implícito, y la localización de la declaración determinante en su archivo de origen.»

Su indicador no incluye las relaciones.

**Relaciones:**
- F3 deja de verificar OE-1 (I.6.2, Tabla 7: «— (capacidad diferida, apartado III.3)»).
- F6 pasa a «Exploración y exportación», sin objetivo.
- La visión (I.2.2) menciona las relaciones como capacidad diferida, sin nombrar herramientas.
- RF-13 no cambia.

**Priorización:**
- **RF-10:** Should, fuera del MVP, sin horas e iteración «Sin asignar».
- **Must:** catorce de veintitrés (61 %).
- **Contingencia (Tabla 19):** RF-10 va en la fila 1, junto con los demás Should sin horas.
- **RF-03 sigue siendo Must.** Con ADR-051 dejó de figurar en la contingencia.

**Estado de aplicación:** aplicado en I.2, I.6.2, III.3, III.5, V, el Anexo I y el libro.

**Anexo III:** sin cambios. D-24 y D-25 siguen siendo la deliberación del informe.

**Al aceptarse:**
- eliminar ADR-034 y 035;
- en `INDICE.md`, reemplazar sus filas por esta.

### Evidencia

- `informe/cap-01/I.2-mision-vision-objetivos-proyecto.md` (Tabla 1)
- `informe/cap-01/I.6-descripcion-detallada-sistema-informacion.md` (Tabla 7)
- `informe/cap-03/III.3-alcance-sistema-alcance-proyecto.md`
- `informe/cap-03/III.5-catalogo-requisitos.md` (Tabla 9)
- `informe/cap-05/V.4-cronograma.md` (Tabla 19)
- `03-requisitos/libro/catalogo/RF-10.md` y `RF-13.md`
- Anexo III, D-24 y D-25
- Historial de git: ADR-034 y 035
