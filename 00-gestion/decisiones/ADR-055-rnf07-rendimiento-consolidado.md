# ADR-055 — RNF-07: invocación completa por línea de comandos en menos de 2 s, sobre un proyecto sintético con el doble del mayor entre un proyecto público y el de la referente, en el contenedor de referencia, con medición por etapas también en Windows 11

- Estado: aceptado (28/09/2026)
- Fecha: 28/09/2026
- Capítulos afectados: Cap. III (III.5); Anexo I (ficha RNF-07); libro (RNF-07); Cap. V (V.4, estabilización de la iteración 4); Cap. X (X.2); `01-relevamiento/fuentes.md`; diseño del v1 (tiempos por etapa)
- Origen: consolidación del 28/09/2026 (pendiente LI-01). No es una decisión nueva: reúne lo vigente de ADR-044 (25/09/2026) y ADR-045 (28/09/2026), ambos aceptados.
- Reemplaza: ADR-044 y ADR-045. Sus archivos se eliminaron el 28/09/2026 (quedan en el historial de git).
- Relacionado: ADR-054 (el equipo de referencia es su contenedor), ADR-023 (condición de la caché por hash), ADR-051 (la CLI es la interfaz del agente; salida determinista).

### Contexto

RNF-07 es Should, de la categoría Rendimiento. Su motivo: un agente externo invoca a RIGE de manera repetida, y eso vuelve relevante el tiempo de respuesta (HA-3). Con la CLI, cada consulta es un proceso completo: arranque, lectura, resolución y salida.

En la sesión del 26/09/2026, la referente **no dispuso** de las cifras de su proyecto y **aceptó** el umbral de 2 s (acta, 3.2). Su equipo programa en Windows (L-11).

| Paso | ADR | Qué fijó | Qué cambió después |
|---|---|---|---|
| 1 | 044 | Doble del proyecto de la referente (P-B); equipo de referencia Ubuntu (Q-A); invocación completa en menos de 2 s, peor de diez corridas (T-A) | 045: la referente no tenía el dato |
| 2 | 045 | Doble del mayor entre un proyecto público y el de la referente (P-F); medición por etapas en ambas plataformas, con umbral solo en Ubuntu (W-C) | ADR-054 precisó el equipo de referencia (contenedor) |

### Alternativas evaluadas

**Eje P · Proyecto de referencia**
- **P-A:** El escenario más grande del entorno controlado.
- **P-B:** El doble del proyecto de la referente.
- **P-C:** Un tiempo máximo por entrada.
- **P-D:** Un proyecto público elegido con un criterio reproducible.
- **P-E:** Volver a consultar a la referente.
- **P-F:** El doble del mayor entre P-D y P-E; mientras P-E no llegue, rige P-D.

**Eje Q · Equipo de referencia**
- **Q-A:** El entorno Linux de las mediciones.
- **Q-B:** El ejecutor de la CI.
- **Q-C:** El equipo Windows 11.

**Eje T · Qué se mide**
- **T-A:** La invocación completa, en menos de 2 s, tomando el peor de diez corridas.
- **T-B:** No más lento que `opencode debug agent`.
- **T-C:** La resolución interna, en menos de 1 s.

**Eje W · Windows 11**
- **W-A:** No medir en Windows.
- **W-B:** Solo el tiempo total, como dato informativo.
- **W-C:** Tiempo por etapa en ambas plataformas, con umbral solo en Ubuntu.
- **W-D:** Umbral en Windows.

### Análisis (trade-offs)

**Eje P**
- **P-A:** el entorno controlado se diseña para verificar la corrección, no para representar volumen.
- **P-B y P-E:** dependen de un dato que la referente no tiene, y dejan el criterio con `[N]`. Un requisito sin criterio comprobable no se computa.
- **P-C:** no refleja lo que espera el agente.
- **P-D:** es verificable por terceros y está disponible ya. El recuento de entradas es un límite inferior, porque las entradas globales no se ven. Del repositorio se toman solo recuentos, sin redistribuir su contenido.
- **P-F:** da un criterio comprobable desde ya y conserva el ancla en el usuario real si llega el dato.

**Eje Q**
- **Q-B:** los ejecutores compartidos tienen un rendimiento variable y producirían fallos intermitentes.
- **Q-C:** es el equipo de desarrollo, expuesto a su propia carga.
- **Q-A:** es coherente con el oráculo y con las mediciones.

**Eje T**
- **T-A:** mide lo que paga el agente, arranque incluido. El umbral de 2 s se apoya en los límites de respuesta de uso difundido, que son conocimiento general de usabilidad (registrar la fuente si se cita).
- **T-B:** no es comparable, porque el comando nativo no evalúa permisos ni hallazgos.
- **T-C:** excluye el arranque.

**Eje W**
- **W-A:** deja sin medir la plataforma del único usuario real.
- **W-B:** no dice qué hacer si el tiempo supera los 2 s.
- **W-C:** funciona como diagnóstico.
  - La caché por hash acelera la lectura y la resolución, no el arranque, y el desglose indica cuál optimización corresponde.
  - Prueba RNF-06 a escala sin costo adicional.
  - Entra en la estabilización, sin horas nuevas.
- **W-D:** pierde la coherencia con el oráculo y queda expuesta a la carga del equipo.

### Recomendación y fundamento

**P-F + Q-A + T-A + W-C.** Es lo que el autor aceptó el 25/09 y el 28/09/2026; este registro no cambia ninguna decisión.

**Condiciones que invalidarían la decisión:**
1. **La búsqueda no encuentra un repositorio público que resuelva con OpenCode 1.18.25.** Se aplica P-A, con su limitación declarada.
2. **La referente informa un proyecto mucho mayor.** Rige el suyo, como prevé la regla.
3. **La referente declara que su agente necesita una respuesta más rápida.** Se ajusta el umbral.
4. **En Windows el tiempo supera los 2 s por una causa que no se absorbe en el período.** Se evalúa W-D en un ADR nuevo.

### Decisión del autor

**Aceptado por el autor el 28/09/2026** (consolidación). Las decisiones de fondo ya están aceptadas:
- ADR-044, P-B + Q-A + T-A, el 25/09/2026;
- ADR-045, P-F + W-C, el 28/09/2026.

La aceptación de este registro solo autoriza la consolidación.

### Consecuencias

**Criterio de aceptación de RNF-07** (ficha y Anexo I):

> Sobre un proyecto sintético con el doble de agentes, entradas y elementos que el mayor entre el proyecto público de referencia —[DATO PENDIENTE: repositorio, commit y recuentos, PV-02]— y el proyecto del equipo de la referente, si lo informa, en el contenedor Ubuntu 26.04 de referencia sobre Docker Desktop y WSL 2 —[DATO PENDIENTE: resumen de la imagen y recursos, PV-01]—, la invocación completa por línea de comandos de la consulta de valores de un agente finaliza en menos de 2 s, medida sobre diez corridas y tomando el peor caso.

- **Proyecto público (PV-02):**
  - Búsqueda de código de GitHub (`opencode.json`, `opencode.jsonc` o `.opencode/`), con la fecha registrada.
  - Se elige el repositorio con más agentes y, en caso de empate, el de más elementos. Debe resolver con OpenCode 1.18.25 sin entradas ilegibles.
  - Alta con `/fuente`, con la consulta, la fecha y el commit.
- **Referente (PV-03):** se le envía un procedimiento de conteo breve, que pide solo recuentos. Su respuesta no requiere una nueva sesión de validación.
- **Medición por etapas:**
  - diez corridas en el contenedor y en Windows 11, con el mismo proyecto y el antivirus en su configuración habitual;
  - se registran el tiempo total y el de cada etapa: arranque, descubrimiento y lectura, resolución, salida;
  - hay umbral solo en Ubuntu, y la parte de Windows consta en V.4, no en la ficha.
- **Regla sobre el resultado en Windows:**
  - si supera los 2 s y domina la lectura o la resolución, se aplica la condición de la caché (ADR-023);
  - si domina el arranque, se registra como limitación de la plataforma y se propone el remedio en un ADR, sin horas del período.
- **Tiempos por etapa:** salen por el canal de error y solo a pedido, para no romper el determinismo de la salida (RF-03). La forma de la opción se define en el diseño del v1.
- **Alcance del umbral:** vale solo en el equipo de referencia.
- **Acreditación:** una sola vez, en la estabilización de la iteración 4, sin horas propias. Es lo primero que cae si la estabilización se reduce (ADR-052).

**Anexo III:** sin cambios. D-28, D-29 y D-30 siguen siendo la deliberación del informe.

**Al aceptarse:**
- eliminar ADR-044 y 045;
- en `INDICE.md`, reemplazar sus filas por esta;
- en `pendientes.md` (PV-01, PV-02) y en `01-relevamiento/fuentes.md` (si los cita), cambiar las menciones por ADR-055.

### Evidencia

- `03-requisitos/libro/catalogo/RNF-07.md`
- `01-relevamiento/validacion/20260925_GuiaValidacion_Sanchez_v2.md` (3.2, L-11, sección 8)
- `informe/cap-05/V.4-cronograma.md` (líneas 16 y 49)
- `00-gestion/reglas-catedra.md` (sección 6)
- Anexo III, D-28 a D-30
- Historial de git: ADR-044 y 045
