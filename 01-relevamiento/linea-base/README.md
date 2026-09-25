# Línea base

| Archivo | Qué es | Estado |
|---|---|---|
| `DISENO-medicion-agentes.md` | **Diseño vigente** para construir y ejecutar la medición con agentes (ADR-040) | Listo para entregar |
| `respuestas.md` | Hoja de respuestas de los dieciséis casos. **Nunca entra a la VM** | Pendiente de cierre tras la verificación en la VM |
| `vm/` | Lo que se copia a la máquina virtual: escenarios de los dieciséis casos, `instalar.sh`, `caso.sh`, `verificar.sh`, hoja de referencia y documentación sin conexión. Es lo único que va a la VM | Se amplía según el diseño, sección 5 |
| `herramientas/` | Lo que corre fuera de la máquina virtual: hoy `generar-docs-offline.py` (genera `vm/docs/` desde el tag v1.18.25); después, `corregir.py` y `analizar.py` (diseño, sección 5) | Se amplía |
| `antecedente-diseno-personas-v0.3.md` | Diseño anterior con personas. Antecedente, no fuente vigente | Copia anterior a la v0.3 (sin D-44): reemplazar por la v0.3 si se conserva |
| `laboratorio-verificacion.md` | Informe del laboratorio del 19/09/2026 (Windows 11) | Fuente interna. No va al anexo tal como está: redactado en primera persona por un asistente, con rutas personales y evidencias (`oc-lab/evidencia/`) que no están en el repositorio |

Cambio aplicado el 25/09/2026: `vm/casos/C-1b/global/opencode.json` pasó de `webfetch: "allow"` a `"ask"`, como fija D-44 del diseño v0.3. Requiere reverificación.
