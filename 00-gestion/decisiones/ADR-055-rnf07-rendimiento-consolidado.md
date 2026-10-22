# ADR-055 — RNF-07: invocación completa por línea de comandos en menos de 2 s, sobre un proyecto sintético con el doble del mayor entre un proyecto público y el de la referente, en el contenedor de referencia, con medición por etapas también en Windows 11

- Estado: aceptado (28/09/2026); consolidado el 22/10/2026 con ADR-071, 096 (absorbidos al final, con su texto completo). **Pendiente:** aceptación del autor de la consolidación
- Fecha: 28/09/2026
- Capítulos afectados: Cap. III (III.5); Anexo I (ficha RNF-07); libro (RNF-07); Cap. V (V.4, estabilización de la iteración 4); Cap. X (X.2); `01-relevamiento/fuentes.md`; diseño del v1 (tiempos por etapa)
- Origen: consolidación del 28/09/2026 (pendiente LI-01). No es una decisión nueva: reúne lo vigente de ADR-044 (25/09/2026) y ADR-045 (28/09/2026), ambos aceptados.
- Reemplaza: ADR-044 y ADR-045. Sus archivos se eliminaron el 28/09/2026 (quedan en el historial de git).
- Fundamento del umbral (eje T) precisado por ADR-096 (15/10/2026): medición del comando nativo de OpenCode en el equipo de referencia, en lugar de límites de tolerancia humana
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

### Absorbido el 22/10/2026: ADR-071 — RNF-07: búsqueda del proyecto público de referencia, criterio de selección y resultado (openchamber)

Texto completo del ADR absorbido, sin cambios salvo el nivel de los títulos. Su archivo se eliminó (queda en el historial de git).

- Estado: aceptado (01/10/2026)
- Fecha: 01/10/2026
- Capítulos afectados: Cap. III (III.5, Anexo I, ficha de RNF-07); libro (`03-requisitos/libro/catalogo/RNF-07.md`); `01-relevamiento/fuentes.md`. Precisa ADR-055 sin cambiar su decisión
- Origen: sesión del 01/10/2026 (discusión del documento de correcciones del autor, `documento_de_correcciones.md` (retirado; consta en el commit `dfaf300`), Cap. III, III.5)

#### Contexto

ADR-055 fija el tamaño del proyecto de RNF-07 como el doble del mayor entre un proyecto público (P-D) y el de la referente (P-E). Mientras el dato de la referente no llegue, rige el proyecto público (P-F). La búsqueda del proyecto público estaba pendiente (PV-02), y por eso el criterio de aceptación de RNF-07 contiene un `[DATO PENDIENTE]` que bloquea el armado (G-01).

En la sesión del 01/10/2026 se discutieron tres alternativas al proyecto público: dejar el tamaño pendiente hasta consultar a la referente, el escenario más grande del entorno controlado y un tamaño absoluto propio. El autor eligió mantener ADR-055 con el proyecto público y consultar a la referente como complemento.

ADR-055 define el criterio de selección («el repositorio con más agentes; en caso de empate, el de más elementos»), pero no dice qué cuenta como proyecto. La búsqueda del 01/10/2026 mostró que, aplicado al pie de la letra, gana un paquete de distribución de agentes que nadie usa como configuración de un proyecto.

#### Alternativas evaluadas

**Eje B · Método de búsqueda**
- **B-1:** Búsqueda de código de GitHub (`opencode.json`, `opencode.jsonc` o `.opencode/`), como prevé ADR-055. Requiere una cuenta autenticada.
- **B-2:** Búsqueda de repositorios de la API pública de GitHub con varias consultas, seguida de la lectura del árbol de archivos de cada resultado.

**Eje N · Qué cuenta como proyecto**
- **N-1:** Todo repositorio, al pie de la letra de ADR-055.
- **N-2:** Solo configuración de proyecto en uso: `.opencode/` u `opencode.json(c)` en la raíz. Se excluyen los paquetes de distribución, los catálogos y la configuración global (dotfiles).
- **N-3:** Composición del proyecto más grande con la configuración global más grande.

#### Análisis (trade-offs)

**Eje B**
- **B-1:** encuentra más repositorios, pero depende de un token personal y no lo puede repetir un tercero sin cuenta.
- **B-2:** lo repite cualquiera y no requiere credenciales. Su cobertura es menor: solo encuentra repositorios cuyo nombre, descripción o README mencionan OpenCode. Es un límite declarable.

**Eje N**
- **N-1:** elige Spielewoy/autoprompt-skill (34 agentes en `agents/opencode/agents/`), que es un paquete para instalar y no la configuración de un proyecto en uso. El requisito habla de «proyecto».
- **N-2:** es coherente con el enunciado validado por la referente («el doble del tamaño que el del equipo de la referente», acta del 26/09/2026, 3.2), que se refiere a un proyecto. Deja fuera la configuración global, que ADR-055 ya declara como límite inferior.
- **N-3:** representa mejor todo lo que OpenCode lee, pero combina dos repositorios de autores distintos. Es una construcción propia que habría que justificar.

#### Recomendación y fundamento

**B-2 + N-2.** Es reproducible sin credenciales, el criterio de proyecto sigue al enunciado validado y el resultado es un proyecto real con uso verificable.

**Resultado de la búsqueda (01/10/2026, 17:36 UTC):**
- Consultas: `opencode agents`, `opencode config`, `opencode subagents` y `opencode dotfiles`, ordenadas por estrellas, con 30 resultados por consulta.
- Resultado: 117 repositorios distintos. Se leyó el árbol de archivos de 100, con un clon parcial sin contenido; los otros 17 no respondieron.
- Recuento: rutas bajo `.opencode/`, `opencode/` u `opencode.json(c)`, con agentes (`agent(s)/*.md`), comandos, skills y plugins.

| Repositorio | Naturaleza | Agentes | Comandos | Otros | Con N-2 |
|---|---|---|---|---|---|
| Spielewoy/autoprompt-skill | Paquete de distribución | 34 | 0 | — | Excluido |
| hamr0/liteagents | Paquete de distribución | 10 | 13 | — | Excluido |
| timmo001/dotfiles | Configuración global | 8 | 6 | 14 plugins, 1 skill | Excluido |
| **openchamber/openchamber** | **Proyecto en uso** (`.opencode/` en la raíz) | **6** | **9** | **7 servidores LSP** | **Elegido** |
| stickyburn/hyprland-config | Configuración global | 4 | 1 | 7 skills | Excluido |
| anomalyco/opencode | Repositorio de la propia herramienta | 2 | 8 | 2 plugins, 2 skills, 2 tools | Excluido: no es un usuario |

**Proyecto elegido:** openchamber/openchamber, commit `fc012ae0029fa2ac8d1d52b4af37040fc536258e` (01/10/2026). Contiene `.opencode/opencode.json` con 7 servidores LSP, 6 agentes en `.opencode/agent/` y 9 comandos en `.opencode/commands/`: 16 archivos de configuración. El tamaño del proyecto sintético es el doble: 12 agentes, 18 comandos y 14 servidores LSP.

**Condiciones que invalidarían la decisión:**
1. **openchamber no resuelve con OpenCode 1.18.25 sin entradas ilegibles** (condición de ADR-055; su configuración es del 01/10/2026 y puede usar campos posteriores). Rige el siguiente repositorio que cumpla N-2.
2. **La referente informa un proyecto mayor.** Rige el doble del suyo (ADR-055, condición 2).
3. **Una búsqueda B-1 encuentra un proyecto en uso con más agentes.** Se reemplaza el elegido y se registra la nueva consulta.

#### Decisión del autor

**Aceptado por el autor el 01/10/2026** (`/aceptar ADR-071`): B-2 + N-2, con openchamber (`fc012ae`) como proyecto público de referencia. Se mantiene ADR-055 y la consulta a la referente queda como complemento.

#### Consecuencias

**Criterio de aceptación de RNF-07** (ficha del libro y Anexo I). Se reemplaza el `[DATO PENDIENTE]` del proyecto público por:

> Sobre un proyecto sintético con el doble de agentes, entradas y elementos que el mayor entre el proyecto público de referencia (openchamber, commit `fc012ae`: 6 agentes, 9 comandos y 7 servidores LSP en 16 archivos de configuración) y el proyecto del equipo de la referente, si lo informa, […]

El resto del criterio queda como lo fija ADR-055. El `[DATO PENDIENTE]` del equipo de referencia sigue en PV-01, que además cambia «máquina virtual» por «contenedor».

**Al aceptarse:**
- alta de openchamber en `01-relevamiento/fuentes.md` con `/fuente`, con la consulta, la fecha y el commit;
- en `pendientes.md`, PV-02 pasa a «verificación con OpenCode 1.18.25», que se hace junto con el contenedor (PV-01, AD-26);
- en III.5 se conserva la mención al proyecto público. Esto revierte la corrección del documento del autor sobre III.5 («eliminar cualquier referencia a un proyecto público»), por decisión del autor del 01/10/2026;
- se prepara para la referente el procedimiento de conteo (PV-03), que pide solo recuentos.

#### Evidencia

- ADR-055, eje P y condiciones 1 y 2.
- Acta del 26/09/2026, 3.2: `01-relevamiento/validacion/20260925_GuiaValidacion_Sanchez_v2.md`, líneas 317 y 454.
- Repositorio: <https://github.com/openchamber/openchamber/tree/fc012ae0029fa2ac8d1d52b4af37040fc536258e/.opencode>.
- Casos de la línea de base: el más grande, C-2b, tiene 6 archivos y ningún agente en archivo (`01-relevamiento/linea-base/vm/casos/`). Por eso se descarta el escenario más grande del entorno controlado como referencia de volumen.


### Absorbido el 22/10/2026: ADR-096 — RNF-07: el umbral de 2 s se funda en el tiempo del comando nativo de OpenCode y no en límites de tolerancia humana

Texto completo del ADR absorbido, sin cambios salvo el nivel de los títulos. Su archivo se eliminó (queda en el historial de git).

- Estado: aceptado (15/10/2026)
- Fecha: 15/10/2026
- Capítulos afectados: Cap. III (III.5, ficha RNF-07); Anexo I (ficha RNF-07); Anexo III (D-28); libro (RNF-07, motivo y trazabilidad); bibliografía; `01-relevamiento/fuentes.md`
- Origen: dictamen DEV-AE2 N.º 14/2026, Bloque A, pregunta 4; sesión del 15/10/2026 con el autor
- Modifica: ADR-055 (solo el fundamento del umbral, eje T). El valor, el equipo de referencia, el proyecto de referencia y el criterio de aceptación no cambian

#### Contexto

1. **[D]** La AE1 (A.III.1.7) fijó 1 s para la consulta y la previsualización en una aplicación de escritorio, sobre una estructura cargada en memoria, y descartó el umbral cercano a 2 s de Shneiderman (1984) por criterio conservador.
2. **[D]** RNF-07 fija hoy menos de 2 s para la invocación completa por línea de comandos (ADR-055). ADR-055 apoyaba el valor en «los límites de respuesta de uso difundido», sin fuente registrada. El dictamen pregunta por qué 2 s y cuál es la fuente (Bloque A, pregunta 4).
3. **[D]** El verificador de fuentes (15/10/2026) confirmó que Shneiderman (1984, p. 273) presenta los 2 s como conjetura, con un estudio de ocho personas, y que mide hasta el **inicio** de la respuesta (p. 266). RNF-07 mide hasta el **fin** de la invocación y su consumidor es un agente.
4. **[D]** Desde la entrevista del 24/09/2026, el consumidor principal de la CLI es un agente. Su alternativa actual para conocer la configuración efectiva es el comando nativo `opencode debug agent build` (o leer los archivos).
5. **[D]** Medición del 15/10/2026 en el contenedor de referencia: el comando nativo tarda una mediana de 1176,5 ms y un peor caso de 1265 ms en diez corridas, sobre un escenario mínimo (`01-relevamiento/evidencia/rnf07-comando-nativo_20261015.md`).

#### Alternativas evaluadas

- **A:** Mantener el fundamento en límites de tolerancia humana, citando a Shneiderman (1984) con sus salvedades.
- **B:** Fundar el umbral en el tiempo de la alternativa que hoy usa el agente: el comando nativo de OpenCode medido en el equipo de referencia, y conservar 2 s.
- **C:** Reemplazar el umbral absoluto por uno relativo («no más de k veces el comando nativo»).

#### Análisis (trade-offs)

- **A:** la fuente trata la paciencia de una persona; el consumidor es un agente. Requiere tres salvedades (conjetura, inicio y no fin, personas y no agentes) y deja el valor sin un fundamento propio. Es lo que objeta el dictamen.
- **B:** el fundamento es un dato propio, medido en el mismo equipo que fija RNF-07, sobre la alternativa real del consumidor. Explica además por qué no se conserva el 1 s de la AE1: ni el nativo lo cumple. Conserva el valor validado por la referente el 26/09, sin volver a validarlo. Límite: el escenario medido es mínimo; el nativo sobre el proyecto de referencia puede acercarse a 2 s o superarlo.
- **C:** se adapta solo al tamaño del proyecto, pero cambia el criterio de aceptación validado, obliga a ejecutar OpenCode en cada acreditación y acopla el requisito al rendimiento de otra herramienta.

#### Recomendación y fundamento

**B.** El umbral de 2 s exige que RIGE responda en un tiempo del mismo orden que la alternativa que hoy usa el agente: el comando nativo tarda unos 1,2 s en el equipo de referencia, y 2 s le dejan a RIGE un margen de unos 0,7 s. Shneiderman (1984) deja de citarse como fundamento y pasa a la §3 de `fuentes.md`. Se responde así la pregunta 4 del Bloque A: el cambio respecto de la AE1 obedece al objeto medido (invocación completa por un agente, no previsualización para una persona); la fuente es la medición propia; la referente solo aceptó el valor el 26/09.

**Condición que invalidaría la decisión:** que el comando nativo, medido sobre el proyecto de referencia de RNF-07 CA-1 (doble de openchamber `fc012ae`), supere los 2 s. En ese caso el umbral queda por debajo de la alternativa y se reabre el valor (alternativa C o un umbral nuevo, con validación de la referente).

#### Decisión del autor

**Aceptado por el autor el 15/10/2026**, tal como está redactado.

#### Consecuencias

- **Libro y Anexo I:** RNF-07 conserva enunciado y criterio; la trazabilidad suma la medición del 15/10/2026.
- **Anexo III, D-28:** suma el fundamento del valor (comando nativo) y la alternativa descartada (tolerancia humana).
- **ADR-055, eje T:** se reemplaza «límites de respuesta de uso difundido» por esta medición.
- **`fuentes.md`:** `shneiderman1984` pasa a la §3 (retiradas). La medición del 15/10 entra en la §2 (evidencia propia) cuando se cite.
- **Pendiente:** medir el comando nativo sobre el proyecto de referencia al construir el proyecto sintético de RNF-07 (PV-02), y registrar el resultado aquí.

#### Evidencia

- `01-relevamiento/evidencia/rnf07-comando-nativo_20261015.md`
- Dictamen DEV-AE2 N.º 14/2026, Bloque A, pregunta 4
- ADR-055; informe de la AE1, A.III.1.7
- Shneiderman, B. (1984), ACM Computing Surveys, 16(3), pp. 266 y 273 (verificador de fuentes, 15/10/2026)

