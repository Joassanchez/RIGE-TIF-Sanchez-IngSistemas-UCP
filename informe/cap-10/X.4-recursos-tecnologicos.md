## X.4 · Recursos tecnológicos

La incorporación del evaluador de permisos de OpenCode guía la elección de recursos; el descarte de reimplementarlo se fundamenta en I.3.5. La Tabla 25 presenta las elecciones y sus alternativas. La deliberación consta en el Anexo III, D-42 a D-49 y D-56.

| **Componente** | **Elección** | **Licencia y versión** | **Alternativa evaluada** | **Criterio de descarte** |
|----------------|--------------|------------------------|--------------------------|--------------------------|
| **Construcción** | | | | |
| Lenguaje | TypeScript | Apache 2.0 (Microsoft, s. f.-b); 7.0.2 | Python, Go o Rust; TypeScript 5.8.2 | Python, Go y Rust obligan a portar el evaluador; la 5.8.2 se descarta frente a la línea 7 estable con la que OpenCode verifica sus tipos (Anexo III, D-42 y D-56) |
| Entorno de ejecución | Bun | MIT; 1.3.14, la misma versión que declara OpenCode 1.18.25 (Oven, s. f.; OpenCode, 2026) | Node.js LTS; Bun 1.4.2 | Cambian el motor respecto del oráculo; Node.js suma un prerrequisito (Anexo III, D-42 y D-56) |
| Motor de base de datos | SQLite embebido (`bun:sqlite`), con esquema creado por guion | Dominio público (Hipp, s. f.); integrado en Bun 1.3.14 | PostgreSQL; persistencia en archivos | PostgreSQL agrega servicio y credenciales; los archivos no cumplen la exigencia de un motor real con esquema creado por guion (Anexo III, D-45) |
| Evaluador de permisos | Copia literal atribuida de las funciones puras de OpenCode y su lógica de agregación, con reglas nativas transcritas como datos | MIT, «Copyright (c) 2025 opencode»; 1.18.25 | Dependencia del paquete publicado; invocación del binario | El paquete no expone el módulo y la invocación confunde producto y oráculo (Anexo III, D-44) |
| **Verificación y medición** | | | | |
| Oráculo y herramienta de prueba y de medición | OpenCode, para verificar RIGE y ejecutar los agentes con modelos de OpenAI sobre ChatGPT Plus (apartado X.3) | MIT; 1.18.25, versión congelada | Resultados de referencia escritos a partir de la documentación | La documentación describe un modelo incompleto y carece de ejecución (apartado III.1) |
| Entorno Linux de referencia | Contenedor Ubuntu 26.04, con Docker Desktop sobre WSL 2 (apartado X.2) | Docker Desktop 4.90.0, gratuito para uso personal y educativo (Docker, Inc., s. f.); WSL 2.7.10, componente de Windows (Microsoft, s. f.-c) | Distribución WSL dedicada; máquina virtual completa; arranque dual | Menor aislamiento o reproducibilidad, capa adicional de virtualización o reparticionado del único equipo (Anexo III, D-47) |
| **Gestión** | | | | |
| Repositorio e integración continua | GitHub y GitHub Actions; ejecutores `ubuntu-26.04` y `windows-latest` (GitHub, s. f.-b) | Plan gratuito; repositorio privado con el docente como colaborador, publicado bajo MIT tras la aprobación. El presupuesto supone uso dentro de la cuota gratuita de 2.000 minutos mensuales en ejecutores estándar; Windows tiene una tarifa por minuto mayor (GitHub, s. f.-d). El consumo medido queda sin declarar | GitLab CI | Obliga a replicar el repositorio sin aportar capacidades requeridas (Anexo III, D-46) |
| Tablero de gestión | Trello | Servicio web, plan gratuito (Atlassian, s. f.) | GitHub Projects | Se conserva el tablero ya publicado porque ambas alternativas cumplen la consigna (datos de identificación del informe) |
| **Herramientas auxiliares** | | | | |
| Apoyo a la revisión crítica, la verificación de fuentes y la redacción | Claude Code, plan Claude Pro, como herramienta de apoyo sobre el código, los apartados del informe y los borradores de la bitácora | Suscripción Claude Pro (apartado X.3) | Un único asistente para escribir y revisar | El asistente único pierde la revisión cruzada con otro modelo; la función y los artefactos afectados constan en el Anexo III, D-49, y en la bitácora |
| Apoyo a la escritura del código, la búsqueda web y la redacción | Codex, `gpt-6.1-sol`, sobre ChatGPT Plus, como herramienta de apoyo sobre fichas de código y apartados del informe, con revisión del autor | Suscripción ChatGPT Plus (apartado X.3) | OpenCode con un orquestador de agentes | Mayor tiempo y consumo de tokens para el mismo resultado en las pruebas del proyecto; la función y los artefactos afectados constan en el Anexo III, D-49, y en la bitácora |
| Generación de figuras | matplotlib, para reproducir las figuras mediante un guion versionado | 3.11.0; licencia de matplotlib, basada en PSF (Matplotlib Development Team, s. f.) | Gráficos de la planilla de cálculo o diagramas Mermaid | La planilla y Mermaid se descartan frente a la reproducción desde los guiones de armado en Python, sin navegador |

*Tabla 25. Recursos tecnológicos del proyecto. Fuente: elaboración propia sobre el Instrumento 34.*

Las decisiones, los datos, la validación con la referente y la aceptación de las pruebas quedan a cargo del autor. El archivo de lectura del prototipo v1 reúne la declaración de herramientas auxiliares.
