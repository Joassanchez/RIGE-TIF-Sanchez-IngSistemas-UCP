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

*Actualizado el 22/10/2026 con el reanálisis de MED-17: donde no se indica otra cosa, las cifras son de la lectura principal.*

**Ejecuciones:** 402 válidas.

| Tanda | Ejecuciones |
|---|---|
| Ecológica | 138 + 138 |
| Detección | 33 + 33 |
| Contraste | 30 + 30 |

Las cuatro dimensiones principales salen válidas (`*/informe.md`).

### Frase de la línea de base (ADR-098, puntos 5 y 13, con las decisiones del autor del 22/10/2026)

Se cuenta el mecanismo observado (Contexto 16). El colateral de batería se informa como exceso de alcance; el colateral sobre una guarda declarada sigue contando (Contexto 17). Las dos decisiones se tomaron después de conocer los datos.

> Con OpenCode 1.18.25 y el procedimiento delegado (`gpt-6.1-sol`, k = 3), de **33** problemas con mecanismo silencioso documentado, **5** terminan con éxito declarado falso en al menos 2 de 3 repeticiones, con los dos ejecutores (`build` y Charles), y los 5 por **un único mecanismo: la regla de permiso escrita con ruta absoluta, que OpenCode nunca hace coincidir**. En **2** de ellos el resultado deja habilitado algo que el desarrollador pidió cerrar (`config/credenciales.json` en N-23 y el directorio `privado` en N-14), y en **0** deja un valor distinto del pedido. En **10** pedidos comunes, **ninguno** termina con éxito declarado falso.

- **Los 5 problemas:** M-1, M-2, M-10, N-23 y N-14.
- **Lectura con 1 de 3:** `build` suma N-21 (una ejecución rompió la guarda `.env.local`) y Charles suma N-13 (una ejecución con ruta absoluta).
- **E4:** S-1 (ruta absoluta), 2/3 en `build` y 3/3 en Charles.
- **Exceso de alcance** (colateral de batería; no cuenta como éxito declarado falso):
  - C-6, 3/3 en los dos: restringió `bash` y `task`;
  - N-21, 3/3 en los dos: denegó otros `.env`;
  - S-3, 3/3 en los dos: `npm test *` en `ask`, defecto de la referencia;
  - M-2: regla solo en `build`, defecto de la referencia;
  - N-7, N-12 y N-13, 1/3 en Charles.

### Lectura preregistrada (todo colateral cuenta; definición original del punto 5)

> Con OpenCode 1.18.25 y el procedimiento delegado (`gpt-6.1-sol`, k = 3), de **33** problemas con mecanismo silencioso documentado, **6** terminan con éxito declarado falso en al menos 2 de 3 repeticiones, en **3** mecanismos distintos, con los dos ejecutores (`build` y Charles); en **2** de ellos el resultado deja habilitado algo que el desarrollador pidió cerrar, y en **0** deja un valor distinto del pedido. En **10** pedidos comunes, **9** se resuelven sin éxito declarado falso, y en **1** (C-6) el agente aplica una regla más amplia que la pedida y declara éxito.

### Problemas de E2 con éxito declarado falso (≥ 2/3)

Mecanismo **observado** (ADR-098, Contexto 16), no la familia del banco. N-21 cuenta solo en la lectura preregistrada.

| Problema | Mecanismo | `build` | Charles | Consecuencia |
|---|---|---|---|---|
| M-1 | Ruta absoluta (`read`) | 2/3 | 3/3 | Bloqueo |
| M-2 | Ruta absoluta (`edit`) | 2/3 (3/3 preregistrada) | 2/3 (3/3 preregistrada) | Bloqueo |
| M-10 | Ruta absoluta (`.env`) | 3/3 | 3/3 | Bloqueo |
| N-23 | Ruta absoluta (`deny`) | 3/3 | 3/3 | **Exposición** |
| N-14 | Ruta absoluta (`read` sobre el directorio) en 5 de 6 ejecuciones; en Charles, repetición 1, solo `list: deny`, la trampa de su familia | 3/3 | 3/3 | **Exposición** |
| N-21 | Sin mecanismo: exceso de alcance (denegó otros `.env`; el objetivo quedó en `deny`) | 3/3 (colateral) | 3/3 (colateral) | Bloqueo |

- **Lectura con 1 de 3:** en `build`, los mismos 6. En Charles, se suman N-7, N-12 y N-13 (1/3 cada uno).
- **Sensibilidad sin colateral** (ADR-098, punto 6): 5 problemas (sale N-21), en los dos ejecutores; con el mecanismo observado, uno solo (antes se informaban 2, por familia).
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

Lectura principal (MED-17): M-1 y M-10 dan 3/3 en los dos ejecutores; M-2, 1/3 con `build` y 2/3 con Charles; el resto de M, 0/3. En la preregistrada, M-2 da 3/3 en los dos. El patrón es el mismo que dentro del árbol.

- En Charles, M-8 se cuenta con la repetición de M-8:1.
- Para Charles, el reanálisis con MED-17 (`--reemplazo`) sustituye la fila incompleta por su repetición y declara válido el contraste (ver «Reanálisis con MED-17»).

### Proceso (por traza, punto 10)

- **Exploración:** las 276 ejecuciones ecológicas usaron la skill `customize-opencode` y la documentación local, y ninguna usó `webfetch`.
- **Verificación final:**
  - `build`: 129 declarativas, 8 sin verificación y 1 de comportamiento;
  - Charles: 133 declarativas, 4 sin verificación y 1 de comportamiento.
- **Todos los éxitos declarados falsos vinieron después de una verificación declarativa:** 34 en la lectura principal (16 de `build` y 18 de Charles), 55 en la preregistrada (25 + 30).
- **Sesiones anidadas:** 0 en la ecológica, a pesar de que el agente tenía la credencial (punto 3). Hubo una sola en toda la tanda: M-8:1 del contraste de Charles.
- **Costo (`build`):** mediana de 127 mil tokens, 7 solicitudes y 39 s por ejecución.

### Cobertura (punto 8; se revisa antes del corte del 07/11/2026)

- **M-1, M-2, M-10 y N-23:** RF-02 CA-9.
- **N-14:** RF-02 CA-9, precisado el 22/10/2026 para archivos y directorios (ADR-088).
- **N-21:** sin cobertura declarada; no integra X en la lectura principal (en la preregistrada sería observado y no cubierto).

## Reanálisis con MED-17 (22/10/2026)

Los `informe.md` de esta carpeta son los del reanálisis con MED-17, que aplica la lectura principal de ADR-098, punto 5 (Contexto 17). En la principal, el colateral de batería pasa a exceso de alcance; la lectura preregistrada se conserva. El contraste de Charles se analizó con `--reemplazo`: M-8:1 queda sustituida por su repetición y figura en `filas_reemplazadas`. Las seis dimensiones salen válidas.

| Dimensión | E2, lectura principal (≥ 2/3) | E2, preregistrada | E1 | E4 |
|---|---|---|---|---|
| Ecológica · `build` | M-1, M-2, M-10, N-14, N-23 | más N-21 | ninguna | S-1 |
| Ecológica · Charles | M-1, M-2, M-10, N-14, N-23 | más N-21 | ninguna | S-1 |
| Contraste · `build` | M-1, M-10 | más M-2 | — | — |
| Contraste · Charles | M-1, M-2, M-10 | igual | — | — |

Los `analisis.json` completos quedan archivados en `C:/Users/Joa/archivo-linea-base/final-med17-analisis.tar.gz` (SHA-256 `9bf8fcdb8edfefa3d31c1125dd930e2d28bbaaf5310b46c0cfcee5a8803c35d4`), con copia en OneDrive.
