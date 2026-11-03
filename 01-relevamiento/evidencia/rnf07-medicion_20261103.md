# RNF-07 · Medición formal del rendimiento y tiempos por etapa · 03/11/2026

Medición formal del rendimiento de RIGE para la acreditación de **RNF-07 CA-1** (ADR-055, ADR-071, ADR-096) ejecutada con el arnés automatizado `src/herramientas/medir-rnf07.ts`.

| Campo | Valor |
|---|---|
| Fecha | 03/11/2026 19:36 ART |
| Plataforma de ejecución | Windows 11 Home 10.0.26200 (Samsung Galaxy Book3 750XFG, Intel Core i7-1355U, 12 hilos lógicos, 16 GB RAM, SSD NVMe 512 GB) |
| Entorno de referencia | Contenedor Ubuntu 26.04 de referencia (ADR-054/055) / Verificado en Windows 11 (ADR-055 W-C) |
| Escenario de prueba | `src/pruebas/escenarios/openchamber-doble/` (proyecto sintético con el doble de componentes que `openchamber` `fc012ae`: 12 agentes, 20 comandos y 14 servidores LSP en 32 archivos de configuración) |
| Aislamiento | Entorno aislado temporal vía `crearEntornoAislado` (`tmp-medir-rnf07`), `RIGE_ALMACEN` en temporal propio, red interceptada |
| Herramienta | RIGE v2/v4 CLI (`bun run rige`) |
| Consultas medidas | 1. `valores --proyecto <escenario> --agente agent-1 --tiempos`<br>2. `permiso --proyecto <escenario> --agente agent-1 --herramienta bash --objetivo "git status" --tiempos` |
| Protocolo | Diez (10) corridas consecutivas de procesos completos independientes para cada consulta |
| Umbral de aceptación | Peor caso < 2000 ms en invocación completa |

---

## 1. Resultados cuantitativos de las 10 corridas

### 1.1. Consulta de valores (`agent-1`)

| Etapa | Mínimo (ms) | Mediana (ms) | Peor caso (ms) |
|---|---|---|---|
| Invocación completa (`invocacionMs`) | 142,314 | 157,881 | **178,529** |
| Arranque CLI (`arranqueMs`) | 0,179 | 0,212 | 0,252 |
| Lectura y descubrimiento (`lecturaMs`) | 17,089 | 18,652 | 22,543 |
| Resolución en núcleo (`resolucionMs`) | 3,547 | 4,223 | 5,862 |
| Serialización y salida (`salidaMs`) | 1,082 | 1,197 | 1,311 |
| Total de ciclo interno (`totalMs`) | 22,138 | 24,103 | 29,911 |

### 1.2. Consulta de decisión de permiso (`agent-1`, `bash`, `git status`)

| Etapa | Mínimo (ms) | Mediana (ms) | Peor caso (ms) |
|---|---|---|---|
| Invocación completa (`invocacionMs`) | 140,909 | 149,211 | **182,090** |
| Arranque CLI (`arranqueMs`) | 0,173 | 0,210 | 0,506 |
| Lectura y descubrimiento (`lecturaMs`) | 16,318 | 18,043 | 18,855 |
| Resolución en núcleo (`resolucionMs`) | 6,252 | 6,696 | 8,690 |
| Serialización y salida (`salidaMs`) | 0,985 | 1,128 | 1,326 |
| Total de ciclo interno (`totalMs`) | 24,360 | 26,194 | 28,850 |

---

## 2. Evaluación de cumplimiento y conclusiones

1. **Cumplimiento del umbral:**
   - Peor caso global observado: **182,090 ms** (0,18 s).
   - Umbral contractual RNF-07: **2000 ms** (2,00 s).
   - Margen de seguridad: El peor caso representa apenas el **9,1 %** del límite admitido (más de 10 veces más rápido que el umbral máximo tolerado).
2. **Desglose de latencias:**
   - La fase dominante es el arranque y carga del runtime Bun (~120–130 ms).
   - El procesamiento interno puro de RIGE (descubrimiento de 32 archivos, lectura sintáctica, secuenciación de reglas de permiso y resolución) insume menos de **30 ms** en el peor caso.
   - El determinismo de salida en `stdout` se verificó idéntico byte a byte frente a ejecuciones sin telemetría (RF-03).
3. **Estado:** **Acreditado con éxito**.
