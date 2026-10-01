## X.4 · Recursos tecnológicos

La elección de recursos parte de una restricción: RIGE incorpora el evaluador de permisos de OpenCode en lugar de reimplementarlo. La Tabla 24 sintetiza las elecciones y sus alternativas; la deliberación se remite al Anexo III, D-42 a D-49 y D-56.

| **Componente** | **Elección** | **Licencia y versión** | **Alternativa evaluada** | **Criterio de descarte** |
|----------------|--------------|------------------------|--------------------------|--------------------------|
| **Construcción** | | | | |
| Lenguaje | TypeScript | Apache 2.0 (Microsoft, s. f.-b); 7.0.2, versión exacta | Otro lenguaje (Python, Go o Rust); TypeScript 5.8.2 | Otro lenguaje obliga a portar el evaluador; la versión elegida verifica tipos y es compatible con Bun 1.3.14 (Anexo III, D-42 y D-56) |
| Entorno de ejecución | Bun | MIT; 1.3.14, la misma versión que declara OpenCode 1.18.25 (Oven, s. f.; OpenCode, 2025) | Node.js LTS; Bun 1.4.2 | Cambian el motor respecto del oráculo; Node.js suma un prerrequisito (Anexo III, D-42 y D-56) |
| Motor de base de datos | SQLite embebido (`bun:sqlite`), con esquema creado por guion | Dominio público (Hipp, s. f.); integrado en Bun 1.3.14 | PostgreSQL; persistencia en archivos | PostgreSQL agrega servicio y credenciales; los archivos no cumplen la exigencia de un motor real con esquema creado por guion (Anexo III, D-45) |
| Evaluador de permisos | Copia literal atribuida de las funciones puras de OpenCode y de su lógica de agregación, con reglas nativas transcritas como datos | MIT, «Copyright (c) 2025 opencode»; 1.18.25 | Dependencia del paquete publicado; invocación del binario | El paquete no expone el módulo y la invocación confunde producto y oráculo (Anexo III, D-44) |
| **Verificación y medición** | | | | |
| Oráculo y herramienta de prueba y de medición | OpenCode; ejecuta los agentes con modelos de OpenAI sobre ChatGPT Plus (apartado X.3) | MIT; 1.18.25, versión congelada | No corresponde | Es la herramienta cuyo comportamiento RIGE reproduce y que ejecuta los agentes medidos |
| Entorno Linux de referencia | Contenedor Ubuntu 26.04, con Docker Desktop sobre WSL 2 (apartado X.2) | Docker Desktop 4.90.0, gratuito para uso personal y educativo (Docker, Inc., s. f.); WSL 2.7.10, componente de Windows (Microsoft, s. f.-c) | Distribución WSL dedicada; máquina virtual completa; arranque dual | Menor aislamiento o reproducibilidad, capa adicional de virtualización o reparticionado del único equipo (Anexo III, D-47) |
| **Gestión** | | | | |
| Repositorio e integración continua | GitHub y GitHub Actions; ejecutores `ubuntu-26.04` y `windows-latest` (GitHub, s. f.) | Plan gratuito; repositorio privado con el docente como colaborador, publicado bajo MIT tras la aprobación; cuota de 2.000 minutos mensuales en ejecutores estándar (GitHub, Inc., s. f.) | GitLab CI | Obliga a replicar el repositorio sin aportar capacidades requeridas (Anexo III, D-46) |
| Tablero de gestión | Trello, tablero exigido por la consigna | Servicio web de uso gratuito | — | — |
| **Herramientas auxiliares** | | | | |
| Apoyo al contraste, la coherencia y la redacción | Claude Code, plan Claude Pro; asiste en el contraste de alternativas, la verificación de coherencia y la redacción sobre contenido propio | Suscripción personal preexistente, sin costo atribuible | No corresponde (Anexo III, D-49) | No corresponde (Anexo III, D-49) |
| Apoyo a la escritura del código y la redacción | Codex, `gpt-6.1-sol`, sobre ChatGPT Plus; asiste en la escritura del código sobre fichas del autor, revisada por el autor, y en la redacción sobre contenido propio | Suscripción ChatGPT Plus (apartado X.3) | No corresponde (Anexo III, D-49) | No corresponde (Anexo III, D-49) |
| Generación de figuras | matplotlib | 3.11.0; licencia de matplotlib, basada en PSF | No corresponde | No corresponde |

*Tabla 24. Recursos tecnológicos del proyecto. Fuente: elaboración propia sobre el Instrumento 34.*

Las decisiones, los datos, la validación con la referente y la aceptación de las pruebas quedan a cargo del autor. La función de las herramientas auxiliares y los artefactos afectados se declaran en la bitácora y en el archivo de lectura del prototipo v1.
