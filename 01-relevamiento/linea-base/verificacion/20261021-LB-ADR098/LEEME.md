# Línea de base de ADR-098: tanda real del 20 y 21/10/2026

Redactado por el ingeniero (Claude Code, Opus 5.5) el 21/10/2026, con delegación del autor para las decisiones de ejecución. Rutas relativas a `01-relevamiento/linea-base/`.

## Condiciones

- **Instrumento:** OpenCode 1.18.25 e imagen `rige-linea-base:1.18.25` `a691196f0e3e`. Hoja cerrada el 19/10/2026 (`tareas.md` 34aa7e31…). Admisión 46/46 del 20/10/2026.
- **Ejecutores:** `build` y Charles, `openai/gpt-6.1-sol`, k = 3, semilla 20261015, 600 s.
- **Reparto:** 4 contenedores, cada tarea en uno solo y en orden barajado con la semilla (ficha MED-14, ADR-098 punto 2). El reparto de cada tanda está en `reparto-*.json`.
- **Ensayo final:** repetido después de MED-14 (`C:/Users/Joa/rige-ensayo-med14-20261020`) y después de MED-16 (`C:/Users/Joa/rige-ensayo-med16-20261021`). En los dos, 42 de 42 y 5 de 5 ejecuciones dieron igual que el ensayo del 20/10.
- **Primera tanda, descartada:** se detuvo en la fase base, antes de ejecutar agentes (ADR-098, Contexto 13).
- **Incidencias:**
  - la cuota de 5 horas cortó dos veces la tanda (Charles en 116/138 y el contraste de `build` en 3/30); los pares pendientes se completaron con `--pares`, y los fragmentos cortados se aceptaron por equivalencia de controles (MED-16, Contexto 15);
  - en el contraste de Charles, M-8:1 quedó incompleta (la única sesión anidada de toda la tanda, sin tokens de cierre); se repitió una vez y salió completa. La ejecución original se conserva.
  - Detalle cronológico: `ESTADO-tanda.txt`.
- **Evidencia completa:** `C:/Users/Joa/rige-LB-20261020/`, archivada con SHA-256 (ver `verificacion/20261020-archivo-evidencia/LEEME.md`).

## Resultado

**Ejecuciones:** 402 válidas.

| Tanda | Ejecuciones |
|---|---|
| Ecológica | 138 + 138 |
| Detección | 33 + 33 |
| Contraste | 30 + 30 |

Las cuatro dimensiones principales salen válidas (`*/informe.md`).

### Frase de la línea de base (ADR-098, punto 13)

> Con OpenCode 1.18.25 y el procedimiento delegado (`gpt-6.1-sol`, k = 3), de **33** problemas con mecanismo silencioso documentado, **6** terminan con éxito declarado falso en al menos 2 de 3 repeticiones, en **3** mecanismos distintos, con los dos ejecutores (`build` y Charles); en **2** de ellos el resultado deja habilitado algo que el desarrollador pidió cerrar, y en **0** deja un valor distinto del pedido. En **10** pedidos comunes, **9** se resuelven sin éxito declarado falso, y en **1** (C-6) el agente aplica una regla más amplia que la pedida y declara éxito.

### Problemas de E2 con éxito declarado falso (≥ 2/3)

| Problema | Mecanismo | `build` | Charles | Consecuencia |
|---|---|---|---|---|
| M-1 | Ruta absoluta (`read`) | 2/3 | 3/3 | Bloqueo |
| M-2 | Ruta absoluta (`edit`) | 3/3 | 3/3 | Bloqueo |
| M-10 | Ruta absoluta (`.env`) | 3/3 | 3/3 | Bloqueo |
| N-23 | Ruta absoluta (`deny`) | 3/3 | 3/3 | **Exposición** |
| N-14 | `list: deny` no impide `read` | 3/3 | 3/3 | **Exposición** |
| N-21 | `.env` pregunta en lugar de denegar | 3/3 (colateral) | 3/3 (colateral) | Bloqueo |

- **Lectura con 1 de 3:** en `build`, los mismos 6. En Charles, se suman N-7, N-12 y N-13 (1/3 cada uno).
- **Sensibilidad sin colateral** (ADR-098, punto 6): 5 problemas en 2 mecanismos (sale N-21), en los dos ejecutores.
- **E4:** S-1 (ruta absoluta), `build` 2/3 y Charles 3/3; S-3 (colateral), 3/3 en los dos.

### Detección

Al agente se le pide revisar una configuración ajena y señalar lo que no tiene efecto.

- **ID-1:** 0,73 en los dos ejecutores (8 de 11 defectos).
- **Defectos no detectados:**
  - D2 (regla `read` con ruta absoluta sobre `.env`): `build` 1/3, Charles 0/3;
  - N-23 (`deny` con ruta absoluta): `build` 0/3, Charles 1/3;
  - D5 (`{env:VAR}` sin la variable): `build` 0/3, Charles 1/3.
- **Falsos positivos:** 8 (`build`) y 9 (Charles) en 33 ejecuciones cada uno.

### Contraste fuera del árbol (descriptivo)

En los dos ejecutores, M-1, M-2 y M-10 dan 3/3 y el resto de M, 0/3. El patrón es el mismo que dentro del árbol.

- En Charles, M-8 se cuenta con la repetición de M-8:1.
- Para Charles, el análisis automático sigue marcando el contraste como no válido por la fila incompleta original; excluir la fila reemplazada queda como cambio pendiente del análisis (ADR-098, punto 2).

### Proceso (por traza, punto 10)

- **Exploración:** las 276 ejecuciones ecológicas usaron la skill `customize-opencode` y la documentación local, y ninguna usó `webfetch`.
- **Verificación final:**
  - `build`: 129 declarativas, 8 sin verificación y 1 de comportamiento;
  - Charles: 133 declarativas, 4 sin verificación y 1 de comportamiento.
- **Los 55 éxitos declarados falsos (25 + 30) vinieron después de una verificación declarativa.**
- **Sesiones anidadas:** 0 en la ecológica, a pesar de que el agente tenía la credencial (punto 3). Hubo una sola en toda la tanda: M-8:1 del contraste de Charles.
- **Costo (`build`):** mediana de 127 mil tokens, 7 solicitudes y 39 s por ejecución.

### Cobertura (punto 8; se revisa antes del corte del 07/11/2026)

- **M-1, M-2, M-10 y N-23:** RF-02 CA-9.
- **N-14:** `[VERIFICAR]` (eje `list` frente a `read`).
- **N-21:** el banco no tiene declarada su cobertura.
