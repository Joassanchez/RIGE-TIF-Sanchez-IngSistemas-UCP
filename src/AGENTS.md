# AGENTS.md — Reglas de programación de RIGE

Reglas para los agentes que trabajan sobre `src/` (OpenCode, Claude Code u otros). No aplican las reglas de redacción del informe.

- **Fuente de verdad de los requisitos:** `03-requisitos/libro/catalogo/`. Cada funcionalidad se traza a un RF o RNF; cada prueba automatizada, a un criterio de aceptación.
- **Decisiones de arquitectura:** `00-gestion/decisiones/` (en particular ADR-006, ADR-019, ADR-021, ADR-022, ADR-029). No se contradicen sin un ADR nuevo aceptado por el autor.
- **Restricciones no negociables:** solo lectura sobre las entradas de configuración (RNF-01); fidelidad respecto de OpenCode 1.18.25 (RNF-02); núcleo independiente del adaptador (RNF-03); sin exponer variables de entorno (RNF-04); sin conexiones salientes durante el análisis (RNF-05).
- **Explicaciones:** plantillas deterministas, sin modelo de lenguaje (ADR-021).
- **Reutilización del evaluador de permisos de OpenCode:** con la atribución que exige su licencia MIT (ADR-006).
- **Sin commits ni etiquetas por parte del agente.** Los hace el autor.
- **Archivo de lectura:** todo comando necesario para instalar, configurar o ejecutar debe figurar en `src/README.md`.
