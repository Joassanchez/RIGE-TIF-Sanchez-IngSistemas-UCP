# Línea base

| Archivo | Qué es | Estado |
|---|---|---|
| `DISENO-medicion-agentes.md` | **Diseño vigente** para construir y ejecutar la medición con agentes (ADR-040) | Listo para entregar |
| `respuestas.md` | Hoja de respuestas de los dieciséis casos. **Nunca entra a la VM** | Pendiente de cierre tras la verificación en la VM |
| `vm/` | Lo que se copia a la máquina virtual: escenarios de los dieciséis casos, `instalar.sh`, `caso.sh`, `verificar.sh`, hoja de referencia y documentación sin conexión. Es lo único que va a la VM | Se amplía según el diseño, sección 5 |
| `PROTOCOLO-relevamiento-delegacion.md` | Protocolo del relevamiento de la práctica de delegación (P1) y del error de los agentes (P2): fuentes F-1 a F-8, criterios y reglas fijadas antes de buscar | Propuesta del ingeniero, 09/10/2026; la fija el autor |
| `encuesta-practica-form.gs` | Script de Google Apps Script que crea la encuesta en Google Forms (español) | 09/10/2026 |
| `borrador-encuesta-practica.md` | Borrador de encuesta de práctica y pedido a la referente (ADR-040); respalda la representatividad del procedimiento delegado | Borrador del ingeniero, 25/09/2026; el pedido de la sección 2 ya fue enviado por el autor |
| `tarifas-congeladas-20261001.json` | Tarifas de referencia congeladas para valorizar el consumo de la línea de base, la medición final y el Cap. I (ADR-076; Anexo I, A.I.10) | Congeladas al 01/10/2026 |
| `herramientas/` | Lo que corre fuera de la máquina virtual: hoy `generar-docs-offline.py` (genera `vm/docs/` desde el tag v1.18.25); después, `corregir.py` y `analizar.py` (diseño, sección 5) | Se amplía |

El laboratorio pasó a `../opencode/` (`laboratorio-verificacion.md`).

Cambio aplicado el 25/09/2026: `vm/casos/C-1b/global/opencode.json` pasó de `webfetch: "allow"` a `"ask"`, como fija D-44 del diseño v0.3. Requiere reverificación.
