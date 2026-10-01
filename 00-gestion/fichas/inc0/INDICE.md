# Incremento 0 · Índice de fichas (ADR-067)

Rama: `inc0-esqueleto`. T0-01 a T0-09 se hicieron con el método anterior (ADR-065); su registro es `src/odd/tasks/inc0-esqueleto.md`, congelado. Desde T0-10, cada tarea tiene su ficha aquí y su evidencia en el mensaje del commit.

| Tarea | Ficha | Riesgo | Estado | Commit | Medición (reloj · tokens · cuota) |
|---|---|---|---|---|---|
| T0-10 · Configuración propia | [T0-10.md](T0-10.md) | bajo | **hecha**; 1 ampliación de alcance (reexportar el error desde el puerto: omisión de la ficha) | `acb61fd` (AGENTS.md), `5ca3431` | ≈ 6 min en 3 ejecuciones (23 s, fallida por el sandbox; 253 s, detenida con consulta; 79 s, reanudada) · ≈ 0,73 M de entrada (≈ 0,67 M en caché) y 8,5 k de salida · cuota: +1 punto semanal (25 → 26 %), +2 puntos en la ventana de 5 h |
| T0-11a · Estado, contrato de CLI y arranque | [T0-11a.md](T0-11a.md) | alto | **hecha**; 0 correcciones; `revisor-codigo`: conforme con 4 observaciones menores (2 pasan a la ficha de T0-11b: mensaje propio en español para los errores de `parseArgs` y los códigos `argumentos-invalidos`/`interno` fuera de `ErrorUso`). Decisiones del autor sin ADR (30/09): JSON de error `{"esquema":1,"error":{…}}`, código `argumentos-invalidos`, `stack` dentro del JSON con `--depurar` | `f173541` | ≈ 13 min en 1 ejecución (789 s; un lanzamiento previo falló al instante por la ruta del esquema de salida, sin consumo) · ≈ 1,46 M de entrada (≈ 1,37 M en caché) y 22,5 k de salida (5,9 k de razonamiento) · cuota: +1 punto semanal (26 → 27 %), +6 puntos en la ventana de 5 h (66 → 72 %) |
| T0-11b · Servidor, página de inicio y cliente HTTP de pruebas | por escribir | medio | pendiente | | |
| T0-12 · Seguridad web y plantillas | por escribir | alto | pendiente | | |
| T0-13 · README §3 a §8 | por escribir | bajo | pendiente | | |

**Línea de base (T0-01 a T0-09, ADR-065):** ≈ 1 h de reloj y ≈ 8 M de tokens por tarea. **Meta (ADR-067):** ≤ 15 min y ≤ 1/5 de los tokens.

**Estado de la rama al congelar el método anterior (30/09/2026, `a613de6`):** `bun test` da 225 pasan y 0 fallan. `bun run verificar` falla porque todavía no existe `paquetes/rige/arranque/rige.ts`, que se crea en T0-11a.

**Estado tras T0-11a (30/09/2026, `f173541`):** `bun test` 247 pasan, 0 fallan; `bun run verificar` PASS (salida 0), comprobado por el ingeniero y por `revisor-codigo`. La rama ya puede subirse para la primera corrida del CI. **Para T0-13:** `bun run` antepone la línea `$ bun …` en el canal de error (comprobado el 30/09); el README documenta `bun --silent run rige -- <subcomando>` para quien consuma el contrato de la CLI.
