# ADR-066 — Precisiones para el incremento 0: códigos estables `configuracion-invalida` y `puerto-ocupado`, y alcance de la restricción «no se escribe fuera de `src/`»

- Estado: aceptado (30/09/2026)
- Fecha: 30/09/2026
- Capítulos afectados: ninguno del cuerpo del AE2 en forma directa. Afecta `src/AGENTS.md` (§7; lo edita el autor), el documento `src/odd/tasks/inc0-esqueleto.md` (T0-01, T0-04, T0-09 a T0-12) y el contrato de salida de la CLI
- Origen: revisión del documento ODD del incremento 0 (30/09/2026), dudas D-1 y D-4
- Relacionado: **completa** ADR-058 (contrato de salida, fila «error de uso») con dos códigos estables, como hizo ADR-062 con `via-no-soportada`; **precisa** la regla de `src/AGENTS.md` §7 sin cambiar ADR-061 (ubicación del almacén) ni ADR-062 C6 (temporales del arnés)

### Contexto

**D-1.** ADR-062 C4 exige que la configuración inválida sea un error de uso visible y que el puerto ocupado termine con un error que nombra `RIGE_PUERTO`, pero no les asigna código estable. Los únicos códigos estables vigentes son `almacen-sin-esquema` (ADR-061) y `via-no-soportada` (ADR-062). El plan de referencia del incremento 0 usó `configuracion-invalida` y `puerto-ocupado` sin respaldo; el documento ODD lo detectó.

**D-4.** `src/AGENTS.md` §7 dice «No se escribe fuera de `src/`». Los ADR, en cambio, ubican datos de ejecución fuera del repositorio: el almacén en el directorio de datos del usuario (ADR-058, convención 5; ADR-061) y los entornos de prueba en temporales del sistema (ADR-062 C6). T0-01 también crea un `rige.env` en un temporal.

### Alternativas evaluadas

**D-1:**
- **C-A:** dos códigos estables nuevos, de error de uso, código de salida 1.
- **C-B:** solo el comportamiento (mensaje que nombra la variable), sin código estable.

**D-4:**
- **E-A:** la regla rige para los artefactos del repositorio; los datos de ejecución aislados pueden ir donde los ADR los ubican, con las pruebas y las comprobaciones del agente siempre en temporales.
- **E-B:** interpretación literal: nada fuera de `src/`, con temporales dentro de `src/` (por ejemplo, `src/.tmp/`).

### Análisis (trade-offs)

- **C-A** da a los agentes que consumen la CLI un valor que pueden tratar sin interpretar texto, que es el propósito del contrato de ADR-058. Las dos situaciones las corrige el usuario cambiando una variable, lo que las ubica en «error de uso» (1) y no en «falla interna» (70). Costo: dos filas más en el contrato.
- **C-B** deja dos errores de uso sin código, en contradicción con la fila de ADR-058 («JSON de error con código estable»).
- **E-A** es coherente con ADR-061 y ADR-062 C6, que ya fijan esas ubicaciones. El riesgo es que una comprobación manual del agente escriba en el almacén real del autor; se cierra exigiendo `RIGE_ALMACEN` en un temporal en toda ejecución del agente.
- **E-B** contradice ADR-062 C6 (temporales del sistema) y ensucia el árbol de trabajo; además, un temporal dentro del repositorio queda entre `pruebas/escenarios/` y la raíz, que es justamente lo que la guarda de C6 vigila.

### Recomendación y fundamento

**C-A + E-A.**

1. `configuracion-invalida`: variable no admitida en `rige.env` (incluidas las `OPENCODE_*`) o valor inválido (por ejemplo, puerto no numérico). Error de uso, código 1, el mensaje nombra la variable.
2. `puerto-ocupado`: el puerto de `RIGE_PUERTO` no está disponible. Error de uso, código 1, el mensaje nombra `RIGE_PUERTO`.
3. «No se escribe fuera de `src/`» rige para los archivos del repositorio. Se admiten fuera de `src/` solo datos de ejecución aislados:
   - temporales del sistema para pruebas y verificaciones (ADR-062 C6), que la prueba elimina al terminar;
   - el almacén en la ubicación de ADR-058, convención 5, **solo en ejecuciones del autor**. Toda ejecución del agente (pruebas, `bun run esquema`, `bun run servir`) fija `RIGE_ALMACEN` en un temporal.

**Condición que invalidaría la recomendación:** que ADR-051 o el esquema de salida versionado fijen para la configuración y el puerto otra categoría de error distinta de «error de uso»; o que una prueba en Windows no pueda limpiar sus temporales del sistema (en ese caso, E-B con un directorio ignorado y fuera del recorrido de la guarda).

### Decisión del autor

Aceptado por el autor el 30/09/2026, con la recomendación completa (C-A + E-A).

### Consecuencias

- **Contrato de salida (ADR-058):** se suman `configuracion-invalida` y `puerto-ocupado` como códigos estables de error de uso (código 1), sin agregar filas.
- **Documento ODD del incremento 0:** T0-10 y T0-11 se desbloquean al aceptarse este registro; D-4 queda resuelta con el punto 3.
- **`src/AGENTS.md` §7 (lo edita el autor):** reemplazar «No se escribe fuera de `src/`.» por «No se escriben archivos del repositorio fuera de `src/`. Los datos de ejecución van a temporales del sistema; en toda ejecución del agente, `RIGE_ALMACEN` apunta a un temporal (ADR-066).»
- **Referente (PV-03):** no requiere aviso; no modifica requisitos validados.

### Evidencia

- ADR-058, contrato de salida de la CLI (fila «Error de uso … JSON de error con código estable», código 1) y convención 5.
- ADR-061, contrato de salida (`almacen-sin-esquema`, código 1).
- ADR-062, C4 (errores de configuración y puerto), C6 (temporales y guarda del repositorio) y consecuencias (`via-no-soportada`).
- `src/odd/tasks/inc0-esqueleto.md`, §14 (D-1 y D-4), revisión del 30/09/2026.
