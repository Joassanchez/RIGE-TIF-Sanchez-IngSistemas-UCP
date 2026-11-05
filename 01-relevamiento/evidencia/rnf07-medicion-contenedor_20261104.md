# RNF-07 · Medición de RIGE en el contenedor de referencia · 04/11/2026

Medición del ingeniero bajo las condiciones de RNF-07 CA-1. Reemplaza como evidencia de acreditación a la corrida de Windows del 03/11/2026, que se conserva como diagnóstico.

| Campo | Valor |
|---|---|
| Fecha | 04/11/2026, iniciada a las 16:51 (UTC-3) |
| Revisión medida | Etiqueta `congelada`, commit `0df6cb7a8a3a740b76d987c60d06cc9e334cbc48`, extraída con `git archive` |
| Base | `ubuntu@sha256:da6fc2be547864451aa253836dd926da33623312df4a9a243e35dc877c378a78`, Ubuntu 26.04.1 LTS (resumen que fija el CA-1) |
| Imagen de medición | `rige-medicion:congelada`, `sha256:0088bbb1962b…`. Bun 1.3.14, Node v22.22.1, `opencode-ai@1.18.25` y `bun install --frozen-lockfile` |
| Equipo | Docker Desktop 29.9.2 sobre WSL 2; 12 procesadores lógicos y 8.160.690.176 bytes (`docker info`) |
| Red | Desactivada (`--network none`) durante la medición |
| Escenario | `openchamber-doble`: 32 archivos de configuración |
| Comando | `bun run --silent medir:rnf07 --estricto`, que falla con código 1 si un peor caso alcanza 2000 ms |
| Protocolo | Diez corridas consecutivas por consulta, cada una un subproceso completo, lanzador de Bun incluido |
| Preparación | La verificación de TLS permaneció activa. El autor pausó el escudo web de Avast para descargar las dependencias. No influye en la medición, que corre sin red |

## Salida del arnés

```text
RNF-07 · linux · 10 corridas consecutivas por consulta · estricto (< 2000 ms)
Consulta  Etapa          Minimo (ms)  Mediana (ms)  Peor (ms)
valores   invocacionMs        62.076        72.426    147.820
valores   arranqueMs           0.182         0.291      1.025
valores   lecturaMs            8.846        10.013     23.825
valores   resolucionMs         5.726         6.161     15.157
valores   salidaMs             1.145         1.400      3.050
valores   totalMs             16.957        17.728     43.080
permiso   invocacionMs        64.070        70.142     74.410
permiso   arranqueMs           0.184         0.261      0.424
permiso   lecturaMs            8.693         9.937     10.956
permiso   resolucionMs         7.061         8.228      9.618
permiso   salidaMs             1.180         1.424      1.856
permiso   totalMs             18.042        19.974     22.063
invocacionMs: pared del subproceso completo; totalMs: desde ejecutarCli hasta antes de emitir tiempos.
Medicion finalizada; el umbral solo se acredita en el contenedor de referencia (ADR-054/055).
codigo de salida: 0
```

**Resultado:** el peor caso es de 147,820 ms en `valores` y de 74,410 ms en `permiso`, frente al límite de 2000 ms. Se cumple la condición de CA-1 en esta corrida.

**Límites:**
- Son diez corridas por consulta en una sesión: delimitan lo observado y no garantizan cualquier carga. No se controló la carga del anfitrión.
- El arnés mide `valores` y `permiso`, las dos consultas del CA-1. El enunciado dice «una consulta»; `hallazgos` y `--explicar` no se miden (PIL-20).
- El almacén arranca vacío en cada serie.
- El umbral de 2 s sigue en revisión: el comando nativo superó ese valor en una de sus corridas (`rnf07-comando-nativo-referencia_20261104.md`).
- La referencia completa de `openchamber-doble` sigue pendiente; OpenCode resuelve el escenario y lista sus 12 agentes.
