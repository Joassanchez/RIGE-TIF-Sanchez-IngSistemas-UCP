22 de 33 problemas de E2 cubiertos.

| Problema | Mecanismo | Éxito falso en la línea de base | Cobertura | Requisito | Detalle | Hallazgos en alguna forma |
|---|---|---|---|---|---|---|
| M-1 | permiso read por archivo | Sí | Cubierto | RF-02 CA-9; RF-07 CA-1 y CA-5 | 9/9 sondas | ruta-absoluta-con-forma |
| M-2 | permiso edit por archivo | Sí | Cubierto | RF-02 CA-9; RF-07 CA-1 y CA-5 | 9/9 sondas | ruta-absoluta-con-forma |
| M-3 | patrón de bash | No | Cubierto | RF-02 CA-2 | 9/9 sondas | — |
| M-4 | excepción de denegación con argumentos | No | Cubierto | RF-02 CA-2 | 9/9 sondas | — |
| M-5 | external_directory | No | Fuera | — | 3/9 sondas; rechazo: Herramienta no soportada: external_directory. | — |
| M-6 | agente en markdown y en JSON | No | Fuera | — | 0/9 sondas; rechazo: La cadena de revisor no se puede completar: markdown-no-observado. | — |
| M-7 | orden de reglas con comodín | No | Cubierto | RF-02 CA-2; RF-07 CA-1 | 9/9 sondas | tapada-por-posterior |
| M-8 | subagente | No | Cubierto | RF-02 CA-3 | 9/9 sondas | — |
| M-9 | variable OPENCODE_PERMISSION | No | Cubierto | RF-02 CA-2; RF-04 CA-1 | 9/9 sondas | — |
| M-10 | regla nativa | Sí | Cubierto | RF-02 CA-9; RF-07 CA-1 y CA-5 | 9/9 sondas | ruta-absoluta-con-forma |
| N-1 | posición heredada al fusionar capas | No | Cubierto | RF-02 CA-2; RF-07 CA-1 | 12/12 sondas | tapada-por-posterior |
| N-2 | precedencia de .opencode anidados | No | Cubierto | RF-02 CA-2 | 9/9 sondas | — |
| N-3 | misma clave bash en agente JSON y markdown | No | Fuera | — | 0/16 sondas; rechazo: La cadena de auditor no se puede completar: markdown-no-observado. | — |
| N-4 | OPENCODE_PERMISSION inválido descartado | No | Cubierto | RF-02 CA-2; RF-07 CA-1 | 9/9 sondas | permiso-invalido |
| N-5 | allow raíz debilita plan | No | Cubierto | RF-02 CA-2; RF-09 CA-1 y CA-2 | 15/15 sondas | — |
| N-6 | claves PascalCase importadas de Claude Code | No | Cubierto | RF-02 CA-2 | 12/12 sondas | — |
| N-7 | secreto accesible por grep y terminal pese a read deny | No | Cubierto | RF-02 CA-2 | 24/24 sondas | — |
| N-9 | tools heredado frente a permission en el mismo agente | No | Fuera | — | 0/16 sondas; rechazo: La cadena de build no se puede completar: tools-legado-no-incorporado. | — |
| N-10 | permission.skill en supuesto frontmatter markdown | No | Fuera | — | 3/15 sondas; rechazo: La cadena de habilidades no se puede completar: markdown-no-observado. | — |
| N-11 | global symlink: carga y conservación de la vinculación | No | Cubierto | RF-02 CA-2 | 12/12 sondas | — |
| N-12 | allowlist parcial conserva defaults nativos | No | Cubierto | RF-02 CA-2; RF-06 CA-2 | 18/18 sondas | — |
| N-13 | herramienta write consulta edit | No | Cubierto | RF-02 CA-2 | 12/12 sondas | — |
| N-14 | read de directorio no consulta list | Sí | Cubierto | RF-02 CA-9; RF-07 CA-1 y CA-5 | 12/12 sondas | tapada-por-posterior |
| N-15 | YAML inválido descarta endurecimiento markdown | No | Fuera | — | 0/9 sondas; rechazo: La cadena de build no se puede completar: markdown-no-observado. | — |
| V-5 | OPENCODE_CONFIG frente a markdown global | No | Fuera | — | clave no resuelta: agente en Markdown | — |
| V-6 | sustitución env ausente produce cadena vacía | No | Cubierto | RF-01 CA-2; RF-07 CA-1 y CA-2 | informa la plantilla y el hallazgo de sustitución sin valor | variable-sin-valor |
| V-7 | prompt del frontmatter reemplazado por cuerpo vacío | No | Fuera | — | clave no resuelta: agente en Markdown | — |
| V-8 | instructions de agente no carga archivos al prompt | No | Fuera | — | informa el prompt sin expandir; no resuelve `instructions` | — |
| N-21 | deny frente a ask nativo | No | Cubierto | RF-02 CA-2; RF-06 CA-2 | 9/9 sondas | — |
| N-23 | deny con ruta absoluta | Sí | Cubierto | RF-02 CA-9; RF-07 CA-1 y CA-5 | 9/9 sondas | ruta-absoluta-con-forma |
| V-9 | ubicación de AGENTS.md | No | Fuera | — | sin consulta: `AGENTS.md` no es una clave de agente | — |
| V-10 | environment de MCP | No | Fuera | — | sin consulta: `mcp` no es una clave de agente | — |
| N-24 | OPENCODE_CONFIG_CONTENT frente a .opencode (#11628) | No | Cubierto | RF-02 CA-2 | 9/9 sondas | — |
