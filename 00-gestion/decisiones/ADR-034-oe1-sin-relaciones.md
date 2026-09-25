# ADR-034 — OE-1 sin las relaciones entre elementos: las relaciones pasan a capacidad diferida

- Estado: aceptado (25/09/2026)
- Fecha: 25/09/2026
- Capítulos afectados: Cap. I (I.2.4, Tabla 1; I.6.2, Tabla 7); Cap. III (III.3, coherente); Cap. IV (IV.3, párrafo final)
- Origen: análisis integral del 25/09/2026, hallazgo T-04 (`00-gestion/revisiones/20260925-analisis-integral.md`)

### Contexto

OE-1 (I.2.4, Tabla 1) incluye «sus relaciones con los demás elementos», y su indicador exige que «las relaciones coinciden con las definidas en cada escenario». La función F3 (relaciones) quedó diferida en III.3 (Tabla 7), y RF-13 tiene prioridad Could y ninguna iteración asignada. Tal como está, el objetivo no puede declararse cumplido con el alcance del proyecto.

La evidencia que podía justificar subir las relaciones al período era la representación manual de la arquitectura de agentes (la pizarra) relatada por la referente. El autor confirma que es un dato cierto, pero sin constancia más allá de la entrevista, y resuelve quitarle peso probatorio (`00-gestion/revisiones/20260925-evidencia-entrevista.md`, cambios P-01 a P-12).

### Alternativas evaluadas

- **A:** Reformular OE-1 sin las relaciones y tratarlas como capacidad diferida (RF-13, Could).
- **B:** Subir al período la relación de invocación entre agentes (ya se calcula para la herencia de denegaciones de RF-02) y reformular OE-1 en esos términos.
- **C:** Mantener OE-1 y declarar de antemano su cumplimiento parcial.

### Análisis (trade-offs)

- **A:**
  - A favor: coherencia inmediata con III.3 y con el presupuesto de ADR-030, sin mover horas.
  - Costo: defender la postergación. El argumento disponible es el motivo de prioridad de RF-13: ninguna de las cuatro consultas que originan el problema depende de las relaciones.
- **B:**
  - A favor: atiende en parte la necesidad a bajo costo.
  - En contra: agrega un requisito o cambia una prioridad, lo que toca el catálogo, el MVP y la Tabla 18, que ya tiene las 136 h asignadas.
- **C:** un objetivo que se sabe incumplible al escribirlo es una aspiración (Guía AE1, §3.2). Se descarta.

### Recomendación y fundamento

Recomendación del ingeniero: **A.** Sin la pizarra como evidencia fuerte, desaparece el argumento para subir las relaciones, y la reformulación deja un objetivo verificable con el alcance comprometido.

**Condición que invalidaría la decisión:** que en la sesión de validación la referente declare que la representación de relaciones es su necesidad principal, por encima de la consulta del valor efectivo y su procedencia.

### Decisión del autor

Alternativa **A** (25/09/2026).

### Consecuencias

Los cambios se aplican con `/corregir` en la pasada por el Capítulo I. Estas son las redacciones que se proponen al redactor:

- **I.2.4, Tabla 1, OE-1 · enunciado:** se elimina «y sus relaciones con los demás elementos».
- **I.2.4, Tabla 1, OE-1 · indicador:** se elimina «y las relaciones coinciden con las definidas en cada escenario».
- **I.6.2, Tabla 7:**
  - la fila F3 deja de verificar OE-1: su columna «Objetivo» pasa a «— (capacidad diferida, apartado III.3)»;
  - la fila F6 deja de citar «OE-1 a OE-4», porque F6 también está diferida: se revisa en la misma pasada.
- **I.2.2 (visión):** se evalúa mencionar la representación de relaciones entre las capacidades diferidas, sin nombrar herramientas (ADR-026).
- **IV.3, párrafo final:** se elimina la oración sobre las representaciones manuales (cambio P-12).
- **RF-13:** sin cambios. Su motivo de prioridad ya sostiene la postergación.

Queda fuera de esta decisión, para la discusión de la priorización (decisión 3): el enunciado de OE-1 dice «para cada elemento del ecosistema», mientras que el MVP resuelve valores por agente y clave (RF-01).

### Evidencia

`informe/cap-01/I.2-mision-vision-objetivos-proyecto.md` (Tabla 1); `informe/cap-01/I.6-descripcion-detallada-sistema-informacion.md` (Tabla 7); `informe/cap-03/III.3-alcance-sistema-alcance-proyecto.md` (Tabla 7); `03-requisitos/libro/catalogo/RF-13.md`; `informe/cap-04/IV.3-analisis-rivalidad-amplificada.md`.
