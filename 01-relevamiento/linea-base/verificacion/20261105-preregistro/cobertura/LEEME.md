# Contraste de cobertura sin agente (05/11/2026)

Ejecutado por el ingeniero (Claude Code, Opus 5.5). Sin red, sin agentes y sin cuota de medición. Compara la decisión de RIGE con la decisión nativa capturada en la admisión.

| Campo | Valor |
|---|---|
| Revisión | `congelada`, `0df6cb7a8a3a740b76d987c60d06cc9e334cbc48`, extraída con `git archive` |
| Imagen | `rige-medicion:congelada` (Bun 1.3.14, OpenCode 1.18.25) |
| Referencia nativa | `C:/Users/Joa/evidencia-admision-completa-20261020c` (imagen `a691196f0e3e`) |
| Plan | 140 formas de 46 problemas, más la forma absoluta observada de N-14, armada a mano en el plan como `observada_absoluta`, sin referencia nativa |
| Salida | `salida-congelada.json`, SHA-256 `5884feac3269657092e5ce68b90274ac07cff798e19ea74e706aeac536f4ca54` |
| Tabla | `RESULTADO-tabla.md`, generada con `resumir.py` |

**Reproducir:** `generar_plan.py` escribe el plan en el anfitrión; `ejecutar.mjs` corre dentro de un contenedor sin red, con la revisión en `/cob/src` y las dependencias de `/trabajo` enlazadas.

**Cubierto** significa que la decisión de RIGE coincide con la nativa en todas las sondas de todas las formas, por ruta relativa y absoluta. No mide lo que hace un agente con esa respuesta.

**Valores.** V-5 a V-10 no tienen decisión nativa comparable en este contraste: su clasificación sale de la salida de `valores` y de los hallazgos, y está explicada en la columna «Detalle».

**Criterios que el contraste de decisiones no acredita.** `comprobar_criterios.mjs` corre sobre la misma revisión y la salida queda en `criterios-congelada.json`:

- N-5, forma con `allow` en la raíz: decisión `allow` igual a la nativa y advertencia `proteccion-nativa-anulada` (RF-09 CA-1). Forma correcta: sin advertencia (RF-09 CA-2).
- N-12 y N-21, forma base: decisión `ask` igual a la nativa, con regla determinante de origen `nativo` (RF-06 CA-2).
- N-21, forma correcta: decisión `deny` con regla determinante de origen `declarado`.
- V-6: la plantilla y su condición en `valores` (RF-01 CA-2) y el hallazgo `variable-sin-valor` con su causa (RF-07 CA-1 y CA-2), en `salida-congelada.json`.

Los criterios CA-1 y CA-5 de RF-07 citados para la ruta absoluta se apoyan en la causa `ruta-absoluta-con-forma` de ese archivo; el contenido de la forma informada se comprueba con el diagnóstico de la sección 11 del preregistro, sobre la versión medida.
