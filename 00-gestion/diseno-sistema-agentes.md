# Diseño del sistema de agentes para la documentación del TIF

> **Proyecto:** Proyecto Integrador Final — Ingeniería en Sistemas de Información (UCP, Sede Posadas)
> **Autor:** Joaquín Sebastián Sánchez
> **Vigente al:** 24/09/2026
> **Propósito:** fijar en un único lugar cómo se organiza, redacta, revisa y entrega la documentación del TIF con asistencia de agentes. Lo que todavía no está decidido figura en la sección 14.

---

## 1. Principios

1. **Fuente de verdad única.** Lo que no está en el repositorio no existe para los agentes. Lo que se decide en una conversación se registra en un ADR.
2. **El autor decide.** Los agentes proponen, redactan y revisan; las decisiones, las aprobaciones y los commits son del autor.
3. **Nada se inventa.** Datos, cifras, fechas, interlocutores y resultados provienen de archivos del repositorio. Si falta un dato se marca `[DATO PENDIENTE: …]`; si falta una decisión, `[DECISIÓN PENDIENTE: …]`.
4. **Los revisores no escriben.** Producen informes, no cambios.
5. **La consigna manda.** Orden de prelación: aclaraciones del docente (11.4) en el punto aclarado → Resolución Rectoral UCP N.º 97/23 → consigna oficial de la AE → guía de consignas y plantillas.
6. **Tareas acotadas.** Una sección por vez, una revisión por vez: cuida el cupo y reduce errores.
7. **Markdown como fuente; artefactos a pedido.** Todo se trabaja en Markdown; `.docx`, PDF y `.xlsx` se generan por script solo cuando el autor lo pide.

---

## 2. Decisiones vigentes

| # | Decisión | Detalle |
|---|----------|---------|
| D-01 | La documentación se gestiona desde un repositorio con agentes. | 4 |
| D-02 | Herramienta principal: **Claude Code dentro de VS Code**. Auxiliares: **Gemini** (auditoría global) y **OpenCode Go** (programación de `src/`). | 3 |
| D-03 | Código, prototipos y documentación en **un único repositorio**. | 4 |
| D-04 | **Todo en Markdown**: informe, Libro de trabajo e instrumentos. Los artefactos (`.docx`, PDF, `.xlsx`) se generan por script **a pedido del autor**. | 9 |
| D-05 | **Los agentes no hacen commits ni etiquetas.** Los hace el autor. | 12 |
| D-06 | El uso de IA **no se menciona en los commits**; se declara en la bitácora (declaración general ya entregada) y en la sección 8 del README del v1. | 10, 11.7 |
| D-07 | El **ingeniero** propone decisiones y redacta sus fundamentos; el **redactor** escribe los capítulos completos. | 5 |
| D-08 | El ingeniero opera en modo **muy exigente**: discute propuestas débiles y reabre decisiones aceptadas ante evidencia nueva. | 5.1 |
| D-09 | Los comandos que **cambian un estado** (ADR o sección) los ejecuta **solo el autor**. Un ADR solo se acepta con `/aceptar`. | 6, 8 |
| D-10 | Estados de sección: **borrador → revisada → aprobada**. Solo se arman entregas con secciones aprobadas. | 6.3 |
| D-11 | Revisores de **solo lectura por configuración** (sin herramientas de escritura). | 5.2 |
| D-12 | **Verificador de fuentes** con acceso web y **registro de fuentes**; el redactor solo cita fuentes registradas. | 5.6 |
| D-13 | Glosario único: la **hoja Glosario del Libro de trabajo (Instrumento 30)**. | 4 |
| D-14 | `CLAUDE.md` corto; reglas de la cátedra en `00-gestion/reglas-catedra.md` (importado); consigna de cada AE solo al trabajar esa entrega. | 5.1 |
| D-15 | Modelos: **Opus 5.5** (esfuerzo medio) para ingeniero, redactor y crítico; **Sonnet 5** para los tres revisores de reglas. Plan Pro; el autor ajusta según consumo. | 3.2 |
| D-16 | Pipeline: Markdown → **pandoc** (`reference.docx`, filtros, citas APA) → `.docx` → **LibreOffice** → PDF. | 9.1 |
| D-17 | **Extensión libre** por aclaración expresa del docente; no se controla ni se objeta. | 11.4 |
| D-18 | Corchetes, marcadores y restos de texto de asistente **los controla el autor manualmente**; el pipeline no los detecta ni los elimina. | 9.1 |
| D-19 | Bitácora en **un único archivo** `00-gestion/bitacora.md`, entrada más reciente arriba. | 10 |
| D-20 | La **migración inicial** la realiza Claude al armar el repositorio, en forma fiel (**migrar no es corregir**), con ADR retroactivos confirmados por el autor. | 13 |
| D-21 | Todo el texto del documento generado en **color negro**, en lugar del gris azulado de la plantilla. | 9.1 |

---

## 3. Herramientas y modelos

### 3.1 Herramientas

| Herramienta | Uso |
|-------------|-----|
| Claude Code (en VS Code) | Sesión principal (ingeniero) y subagentes. |
| VS Code | Edición, vista previa de Markdown y revisión de diffs antes de cada commit. |
| Gemini | Auditoría global ocasional antes de cada entrega (contexto largo). |
| OpenCode Go | Programación de `src/`. |

### 3.2 Modelos por rol

Cada agente fija su modelo con ID completo (no `inherit`, que haría que todos usaran el modelo de la sesión principal).

| Rol | Modelo | Esfuerzo | Motivo |
|-----|--------|----------|--------|
| Ingeniero (sesión principal) | `claude-opus-5-5` | medio | Discusión y decisiones. |
| Redactor | `claude-opus-5-5` | medio | Produce el texto que se entrega. |
| Crítico | `claude-opus-5-5` | medio | Evaluar argumentos es juicio. |
| Revisor de consigna | `claude-sonnet-5` | — | Contraste contra una lista concreta. |
| Verificador de consistencia | `claude-sonnet-5` | — | Comparación contra glosario, libro y ADR. |
| Verificador de fuentes | `claude-sonnet-5` | — | Muchas búsquedas y lecturas web. |

### 3.3 Cuidado del cupo (plan Pro)

- `/revisar` solo con la sección completa; admite filtro para un único revisor (`/revisar III.2 fuentes`).
- Misiones acotadas: cada subagente recibe rutas exactas y no lee el informe entero.
- Una sección por sesión; `/clear` al cambiar de sección.
- Auditoría global (Gemini) y `src/` (OpenCode Go) no consumen la suscripción de Claude.
- Primer ajuste si el consumo es excesivo: ingeniero en Sonnet para el trabajo diario y Opus solo en `/decidir`.

---

## 4. Estructura del repositorio

```
CLAUDE.md                        ← rol y reglas del ingeniero
.claude/
  settings.json                  ← permisos (sección 12)
  agents/                        ← subagentes
  commands/                      ← comandos (sección 8)
.github/workflows/ci.yml         ← integración continua (debe estar en la raíz)
00-gestion/
  estado.md                      ← estado de cada sección del informe
  pendientes.md                  ← correcciones arrastradas y tareas abiertas
  bitacora.md                    ← bitácora individual, entrada más reciente arriba
  anexo-III.md                   ← deliberación completa (Anexo III del informe)
  reglas-catedra.md              ← reglas de la sección 11
  decisiones/
    INDICE.md                    ← lista de ADR con estado y capítulos afectados
    ADR-NNN-titulo.md
  revisiones/                    ← informes consolidados de los revisores
01-relevamiento/                 ← instrumentos, evidencia de contacto, datos en bruto
  fuentes.md                     ← registro de fuentes con las tres preguntas
02-analisis/                     ← PESTEL, cadena de valor, FODA, rivalidad; .docx de los Instrumentos 32 y 33
03-requisitos/
  libro/                         ← Libro de trabajo en Markdown (fuente del .xlsx)
    catalogo/                    ← una ficha por requisito (RF-01.md, RNF-01.md…)
    trazabilidad.md
    entidades.md                 ← Instrumento 28
    reglas.md                    ← Instrumento 29
    glosario.md                  ← Instrumento 30 (glosario único del TIF)
    iteraciones.md
04-diseno/
catedra/                         ← consignas y plantillas en Markdown (lo que leen los agentes)
  devolucion-AEn.md              ← devoluciones docentes, una por AE
  originales/                    ← PDF, DOCX y XLSX tal como los emite la cátedra (prevalecen)
instrumentos/                    ← fuente única en Markdown de los instrumentos (32 a 35…)
informe/
  00-resumen.md
  cap-01/ … cap-13/              ← un archivo por apartado (p. ej. cap-03/III.2-dominio.md)
  anexos/
  figuras/
  bibliografia.md                ← bibliografía consolidada de la migración (hasta pasar a [@clave])
  referencias.bib                ← datos bibliográficos; la bibliografía se genera sola
  datos-autor.yaml               ← fuente única de nombre, DNI, carrera, comisión, repositorio
05-entregas/                     ← artefactos generados, versionados, nunca se modifican
src/                             ← código de RIGE (prototipo v1 en adelante)
  AGENTS.md / CLAUDE.md          ← reglas de programación, separadas de las de redacción
  README.md                      ← archivo de lectura del v1 (ocho secciones)
tools/                           ← armar.py, exportar_libro.py, construir_reference.py, informe.lua, apa.csl, reference.docx
```

**Reglas de ubicación:**
- `informe/` es el documento vivo; `05-entregas/` solo guarda artefactos generados. Cada generación crea un archivo nuevo con su `vN`; nunca se sobrescribe uno existente.
- Instrumentos: la fuente vive en `instrumentos/`. Los scripts no fijan destinos: el agente elige la carpeta según la tabla de ubicación de artefactos (`reglas-catedra.md`, sección 8), que deriva de la consigna (32 y 33 en `02-analisis/`, 34 en `03-requisitos/`, 35 en `src/`). Se copian además al Portafolio.
- `00-gestion/anexo-III.md` conserva su ruta porque la cita la bitácora ya entregada; el armado lo incorpora como Anexo III.
- Nomenclatura de artefactos: `AAAAMMDD_InformeAEn_Equipo_vN`, `AAAAMMDD_CatalogoRequisitos_Equipo_vN.xlsx`.
- Si RIGE se publica como proyecto abierto, `src/` se extrae con su historial (`git subtree split`).

### 4.1 Correspondencia entre entregas y capítulos

| Instancia | Capítulos |
|-----------|-----------|
| AE1 · TP1 | Resumen · Capítulos I y II |
| AE2 · TP2 | Capítulos III (con el catálogo de requisitos como III.5), IV, V y X |
| Sprint 3 | Capítulos VI y IX |
| AE4 · TP4 y defensa | Capítulos VII, VIII, XI, XII y XIII · Conclusiones · Bibliografía · Anexos |

No se adelanta contenido de capítulos posteriores a la entrega en curso.

---

## 5. Agentes

### 5.1 Ingeniero — sesión principal

Es la sesión principal de Claude Code. Es el único rol que conversa con el autor.

- **Postura (muy exigente):** ingeniero de sistemas senior. Propone, recomienda con firmeza y discute; no da la razón por cortesía. Reabre por iniciativa propia decisiones aceptadas cuando aparece evidencia nueva y propone un ADR de reemplazo.
- **Comportamientos:** dice explícitamente cuando no está de acuerdo y argumenta; distingue **dato del repositorio**, **conocimiento general de ingeniería** y **suposición**; señala las ambigüedades de la consigna en lugar de elegir en silencio.
- **Método de decisión:** alternativas → trade-offs → recomendación justificada → condición que la invalidaría → ADR propuesto.
- **Marco de referencia:** IEEE 29148 (requisitos), ISO/IEC 25010 (calidad), trazabilidad problema → requisitos → diseño → validación.
- **Responsabilidades:** abrir y cerrar sesiones, redactar ADR propuestos, coordinar a los subagentes, guardar sus informes, proponer mensajes de commit y armar el borrador de bitácora.
- **Escribe en:** `00-gestion/` (ADR, índice, estado, pendientes, revisiones, borrador de bitácora). No escribe en `informe/`.
- **Lee al abrir:** consigna de la AE en curso, `estado.md`, `pendientes.md`, `decisiones/INDICE.md` y devoluciones sin procesar. Los ADR completos se leen solo cuando el tema los requiere.

**Configuración:**

| Archivo | Contenido | Cuándo se carga |
|---------|-----------|-----------------|
| `CLAUDE.md` | Rol y postura · método · reglas de oro · protocolo de sesión · mapa del repo · idioma y registro | Siempre |
| `00-gestion/reglas-catedra.md` | Sección 11 de este documento | Siempre (importado con `@00-gestion/reglas-catedra.md`) |
| `catedra/<AE>-guia.md` | Exigencias de la entrega en curso | Solo al trabajar esa entrega |

**Reglas de oro del `CLAUDE.md`:** no inventar datos · no adelantar capítulos · el redactor solo usa ADR aceptados · ningún commit ni etiqueta · orden de prelación del principio 5.

**Idioma y registro:** con el autor, español directo y conversacional; en el informe, registro académico impersonal.

### 5.2 Funcionamiento común de los subagentes

- Cada subagente es un archivo en `.claude/agents/` con descripción, herramientas permitidas, modelo e instrucciones.
- Arranca **sin el contexto de la conversación**: cada delegación es una **misión autocontenida** con rutas concretas (sección, consigna, ADR aplicables).
- Los revisores no reescriben: sugieren correcciones.

| Subagente | Leer / buscar | Escribir | Web |
|-----------|:---:|:---:|:---:|
| Redactor | ✓ | ✓ | — |
| Revisor de consigna | ✓ | — | — |
| Verificador de consistencia | ✓ | — | — |
| Verificador de fuentes | ✓ | — | ✓ |
| Crítico | ✓ | — | — |

**Formato común de hallazgo:**

| Campo | Contenido |
|-------|-----------|
| Severidad | bloqueante · importante · menor |
| Ubicación | archivo y apartado |
| Exigencia o regla | cita de la consigna, del ADR o de `reglas-catedra.md` |
| Hallazgo | qué se observa |
| Corrección sugerida | propuesta, sin reescribir |

### 5.3 Redactor

- Escribe **una sección completa por vez**, clara y en registro académico. Es el único rol que escribe en `informe/`.
- **Recibe:** ID de la sección, consigna, ADR aceptados aplicables y esquema aprobado.
- **Aplica:** `reglas-catedra.md`, el glosario, citas solo del registro de fuentes, identificadores tal como están definidos.
- **Art. 21.º:** en el cuerpo, decisión, fundamento con evidencia y alternativa descartada en dos o tres oraciones, con remisión al Anexo III.
- No crea decisiones: si falta una, la marca como pendiente y continúa.
- **Devuelve:** la sección escrita y una nota con marcas de pendiente y suposiciones realizadas.

### 5.4 Revisor de consigna

- Arma su checklist desde la consigna de la AE: apartados obligatorios, exigencias de verificación puntual y errores frecuentes advertidos.
- **Devuelve** una tabla: exigencia · cita de la consigna · estado (**cumple / parcial / falta**) · ubicación · corrección sugerida.

### 5.5 Verificador de consistencia

Controla el informe **contra sí mismo, contra los ADR y contra el Libro de trabajo**.

- Terminología respecto del glosario; identificadores (RF, RNF, H-xx, R-xx); contradicciones de alcance; referencias cruzadas.
- Replica los controles del Libro de trabajo:
  - cada requisito tiene todos sus campos y un criterio de aceptación comprobable;
  - los valores de los campos son solo los permitidos (11.6);
  - la trazabilidad cierra en doble vía (hallazgo H-xx ↔ requisito);
  - los requisitos **Must** coinciden con el producto mínimo viable del apartado V.5.
- **Devuelve** los hallazgos en el formato común.

### 5.6 Verificador de fuentes

Controla el informe **contra la evidencia**.

- **Fuentes externas:** que existan y digan lo que se les atribuye; las tres preguntas (quién la produjo, con qué método y universo, para qué período); cita y referencia en APA; fuentes con interés declarado.
- **Relevamiento propio:** cada cifra se rastrea a `01-relevamiento/`; cada contacto tiene persona, canal y motivo; la demanda está bien clasificada (imaginada, declarada o revelada).
- **Registro de fuentes:** valida `01-relevamiento/fuentes.md` (una fila por fuente, con las tres preguntas y la clave de `referencias.bib`).
- **Devuelve** por ítem: **verificada / discrepancia / no verificable**.
- **Límites:** no verifica la veracidad de datos propios (solo su existencia y coincidencia); las fuentes inaccesibles quedan como no verificables para el autor.

### 5.7 Crítico

- Lee como el tribunal, con los recuadros «¿Por qué decidiste esto?» de las guías como insumo.
- Marca afirmaciones sin sustento, argumentos débiles y preguntas que el texto no permite responder. No comenta estilo ni formato.
- Está separado del ingeniero: quien propone no evalúa su propia propuesta.
- **Devuelve** las debilidades ordenadas por gravedad y las preguntas probables del tribunal.

---

## 6. Estados

### 6.1 Estados de un ADR

`propuesto` → `aceptado` | `rechazado` · más adelante, `reemplazado por ADR-NNN`. Los ADR de la migración entran como `aceptado (retroactivo)`.

Solo el autor cambia un ADR a `aceptado` o `rechazado` (`/aceptar`, `/rechazar`).

### 6.2 Formato de un ADR

```markdown
# ADR-NNN — Título

- Estado: propuesto | aceptado | aceptado (retroactivo) | rechazado | reemplazado por ADR-NNN
- Fecha:
- Capítulos afectados:
- Origen: sesión / documento / chat del que se reconstruyó

### Contexto
### Alternativas evaluadas
### Análisis (trade-offs)
### Recomendación y fundamento
### Decisión del autor
### Consecuencias
### Evidencia
```

| Destino | Qué recibe del ADR |
|---------|--------------------|
| Cuerpo del capítulo | Decisión, fundamento y alternativa descartada en dos o tres oraciones (Art. 21.º). |
| `00-gestion/anexo-III.md` | Deliberación completa. |
| Bitácora | Elementos 1 a 3 de la entrada del día. |

### 6.3 Estados de una sección

| Estado | Se alcanza con | Lo ejecuta |
|--------|----------------|-----------|
| borrador | `/redactar` | ingeniero |
| revisada | `/revisar` | ingeniero |
| aprobada | `/aprobar` | **autor** |

Después de `/corregir`, la sección sigue en **revisada**; el autor decide si la aprueba o pide otra revisión. Cualquier cambio posterior a la aprobación la devuelve a **borrador**. El estado de cada sección se lleva en `00-gestion/estado.md`.

---

## 7. Flujos de trabajo

### 7.1 Sesión de trabajo

1. **Apertura** (`/abrir`): estado, pendientes, devoluciones y qué sigue.
2. **Discusión** y ADR propuestos.
3. **Ejecución:** ciclo de sección (7.2).
4. **Cierre** (`/cerrar`): archivos modificados, mensaje de commit propuesto, borrador de bitácora, `estado.md` y `pendientes.md` actualizados.
5. **Commit:** lo hace el autor tras revisar el diff.

### 7.2 Ciclo de una sección

```
Planificar (ingeniero + autor) → ADR propuestos → /aceptar (autor)
Redactar (redactor)                          → borrador
Revisar (cuatro revisores en paralelo)       → revisada
Elegir correcciones (autor) → /corregir
Aprobar (autor)                              → aprobada
Commit (autor)
```

### 7.3 Ciclo de una entrega

1. Todas las secciones de la entrega en **aprobada**.
2. Auditoría global con Gemini contra los ADR y la consigna.
3. Actualización del Resumen (600 palabras como máximo).
4. `/armar` y, si corresponde, `/exportar`.
5. Etiqueta de git según exija la cátedra (p. ej. `v1` en el AE2), creada y publicada por el autor.
6. Carga en el aula virtual y en el Portafolio Digital (autor).

### 7.4 Después de la devolución

1. La devolución se guarda como `catedra/devolucion-AEn.md`.
2. `/devolucion` la convierte en ítems de `pendientes.md` con la sección afectada.
3. Las correcciones siguen el ciclo 7.2 dentro de la Ventana de Mejora.

---

## 8. Comandos

Archivos en `.claude/commands/`. Los marcados con ★ cambian un estado y los ejecuta **solo el autor**.

**De sesión**

| Comando | Qué hace |
|---------|----------|
| `/abrir [AE]` | Carga la consigna de la AE; lee estado, pendientes, índice de ADR y devoluciones; resume dónde está el trabajo y qué sigue; avisa si hay evidencia nueva que pone en duda un ADR aceptado. |
| `/cerrar` | Lista archivos modificados, propone mensaje de commit, agrega arriba de `bitacora.md` el borrador de la entrada del día y actualiza `estado.md` y `pendientes.md`. |

**De decisión**

| Comando | Qué hace |
|---------|----------|
| `/decidir <tema>` | Aplica el método de decisión y deja un ADR **propuesto**. |
| ★ `/aceptar ADR-NNN` | Pasa el ADR a **aceptado**. |
| ★ `/rechazar ADR-NNN [motivo]` | Pasa el ADR a **rechazado**. |

**De sección**

| Comando | Qué hace |
|---------|----------|
| `/redactar <sección>` | Verifica que existan el esquema aprobado y los ADR necesarios; si falta algo, se detiene. Si está completo, delega al redactor. → **borrador** |
| `/revisar <sección> [revisor]` | Lanza los cuatro revisores (o uno) y consolida sus informes, ordenados por severidad, en `00-gestion/revisiones/`. → **revisada** |
| `/corregir <sección> <hallazgos>` | El redactor aplica solo los hallazgos indicados (p. ej. `/corregir III.2 1,3,4`). |
| ★ `/aprobar <sección>` | → **aprobada** |

**De artefactos y apoyo**

| Comando | Qué hace |
|---------|----------|
| `/armar <AE> <docx\|pdf>` | Controles previos (9.1) y generación del informe en la carpeta que fija la consigna (`05-entregas/`). |
| `/exportar <libro\|instrumento N>` | Genera el `.xlsx` del Libro de trabajo o el `.docx` de un instrumento, con la nomenclatura de la cátedra. |
| `/comprobar-v1` | Clona el repositorio en una carpeta limpia con `git clone --branch v1`, sigue el README al pie de la letra sin suplir pasos y completa la grilla de la Guía de comprobación. No reemplaza la autocomprobación exigida (otra persona, otra máquina). |
| `/devolucion <archivo>` | Convierte una devolución en ítems de `pendientes.md`. |
| `/fuente <url o referencia>` | Da de alta una fuente en el registro y en `referencias.bib`, con las tres preguntas para revisión del autor. |

**Uso típico**

```
/abrir AE2
/decidir alcance de III.2   → ADR-015 propuesto
/aceptar ADR-015
/redactar III.2             → borrador
/revisar III.2              → revisada
/corregir III.2 1,2,5
/aprobar III.2              → aprobada
/cerrar                     → el autor hace el commit
```

---

## 9. Generación de artefactos

Todo lo ejecutan scripts de `tools/`, **solo a pedido del autor**. Ningún agente arma documentos a mano.

### 9.1 Informe (`/armar`)

```
informe/*.md ──pandoc──► .docx ──LibreOffice──► .pdf
               (reference.docx + filtros + citas APA)
```

**`reference.docx`** (`tools/`, generado por `construir_reference.py`): reproduce el formato de la plantilla oficial (`catedra/originales/02_Plantilla_Modelo_Informe_AE2.docx`). La plantilla trae A4, márgenes correctos y el estilo Normal en Times New Roman 12, doble y justificado; el resto de su formato (tablas en Calibri 9,5, carátulas) está aplicado en forma directa, por lo que el `reference.docx` define esos estilos para que pandoc los aplique. Todos los estilos usan texto **negro** (la plantilla trae el cuerpo en gris azulado `#1C2430`).

| Necesidad | Solución |
|-----------|----------|
| Carátula de capítulo | Filtro: hoja aparte con numeral romano y título en mayúsculas, centrados; el texto empieza en la hoja siguiente. |
| Anexos «página X de Y» | Posprocesamiento del `.docx`. |
| Tablas y figuras | Numeración automática con el formato de la plantilla («Figura N. … Fuente: …»). |
| Citas APA | `[@clave]` → cita APA; la bibliografía incluye solo las fuentes citadas. |
| Índice | Automático. |
| Anexo III | Se toma de `00-gestion/anexo-III.md`. |

**Controles previos** (si alguno falla, no genera):
- secciones de la AE en **aprobada**;
- Resumen de 600 palabras o menos;
- nomenclatura del archivo;
- datos de identificación tomados solo de `datos-autor.yaml`.

**No controla:** extensión (D-17); corchetes, marcadores ni restos de texto de asistente (D-18).

### 9.2 Libro de trabajo (`/exportar libro`)

Un script copia el libro oficial y carga las filas desde `03-requisitos/libro/`, solo en las celdas blancas y grises, sin tocar las columnas de fórmulas. El autor usa la hoja **Panel** como control final. Conviene exportarlo en hitos intermedios para dejar versiones sucesivas en `03-requisitos/`.

### 9.3 Instrumentos (`/exportar instrumento N`)

Instrumentos 32 a 35 a `.docx` con el mismo pipeline.

---

## 10. Bitácora individual

- Un único archivo, `00-gestion/bitacora.md`, con la entrada más reciente arriba, escrita el mismo día.
- Encabezado de identificación de la plantilla oficial (apellido y nombre, DNI, proyecto, equipo, repositorio, período), tomado de `datos-autor.yaml`.
- Mantiene el preámbulo y el criterio ya entregados en el AE1: primera persona, seis elementos por entrada, elemento 5 en una línea salvo desacuerdo real, elemento 6 con la fórmula «conforme al criterio general declarado» o indicando que no se empleó herramienta.
- En el AE2 el elemento 2 registra sobre todo **recortes**: qué quedó excluido y con qué criterio.
- `/cerrar` deja el borrador de la entrada; el autor lo revisa y lo aprueba.

---

## 11. Reglas de la cátedra

Esta sección es el contenido de `00-gestion/reglas-catedra.md`.

### 11.1 Redacción

- Impersonal, verbos en presente y en afirmativo (Art. 21.º).
- Sin desarrollos teóricos ni discusiones ajenas al proyecto; las alternativas propias se consignan en forma sintética, con la deliberación en el Anexo III.
- Ortografía y redacción descuentan hasta un punto sobre diez (0,50 desde el sexto error de ortografía; 0,50 desde el cuarto de redacción).
- Criterio de formato uniforme.

### 11.2 Contenido transversal

- Problema con **cinco componentes** y **línea de base numérica**; criterio de éxito derivado de ella.
- **Tres preguntas** junto a todo dato estadístico.
- **Implicancia decisoria** en cada elemento de análisis.
- Separación entre **sector del problema** y **sector de los recursos**.
- Contactos con **persona, canal y motivo**.
- Cifras solo si existen en el repositorio; citas solo de fuentes registradas.

### 11.3 Formato (Arts. 20.º y 21.º)

| Aspecto | Exigencia |
|---------|-----------|
| Hoja | A4 |
| Márgenes | Superior e inferior 2,5 cm · izquierdo y derecho 3 cm |
| Interlineado | Doble |
| Tipografía | Times New Roman: cuerpo 12, justificado; notas y citas al pie 10; títulos, encabezado y pie a elección; texto en negro |
| Tablas e instrumentos | Calibri 9,5, interlineado simple (formato de la plantilla) |
| Carátulas | Cada capítulo en hoja aparte, numeral romano y título en mayúsculas, centrados; el texto empieza en la hoja siguiente sin repetir el título |
| Numeración | Correlativa; los anexos aparte, «página X de Y» |
| Láminas | Dentro del capítulo, numeradas como una página; normas IRAM |
| Unidades | SIMELA (Ley N.º 19.511) y recomendaciones del SI |
| Bibliografía | APA, con todas las fuentes citadas |
| Resumen | Máximo 600 palabras (Art. 22.2) |
| Nombre de archivo | `AAAAMMDD_InformeAEn_Equipo_vN` |

### 11.4 Aclaraciones del docente

Prevalecen sobre guías y plantillas en el punto aclarado. Los agentes las aplican sin volver a discutirlas.

| Tema | Aclaración |
|------|-----------|
| Extensión | La cantidad de páginas es libre, a criterio del autor. La extensión orientativa de guías y plantillas no se controla ni se objeta. |

### 11.5 Observaciones del AE1 que no deben reaparecer

Su reiteración se pondera negativamente en la dimensión 6:
- hoja carta en lugar de A4;
- capítulos sin la estructura de apartados de la plantilla;
- marcadores residuales de asistentes generativos (control manual del autor);
- campos de identificación sin completar;
- datos de identidad con valores distintos entre documentos (se previene con `datos-autor.yaml`);
- nombres de archivo ajenos a la nomenclatura.

### 11.6 Valores permitidos del Libro de trabajo

| Campo | Valores |
|-------|---------|
| Catálogo · Tipo | Funcional · No funcional |
| Catálogo · Categoría (no funcional) | Rendimiento · Fiabilidad · Seguridad · Usabilidad · Mantenibilidad · Portabilidad · Cumplimiento normativo |
| Catálogo · Prioridad | Must · Should · Could · Won't |
| Catálogo · Estado de validación | Validado · Pendiente · Rechazado por el referente |
| Catálogo · ¿Integra el MVP? | Sí · No |
| Entidades · Reclasificación | Entidad · Atributo de otra entidad · Rol de una entidad · Producto del sistema · Elemento del entorno |
| Reglas · Tipo | Restricción · Derivación · Existencia |
| Reglas · Estado | Validada · Pendiente · En disputa |
| Recursos · Tipo | Humanos · Físicos y materiales · Financieros · Tecnológicos · Otros |

Campos de cada ficha del catálogo: ID · Enunciado · Tipo · Categoría · Prioridad · Motivo de la prioridad · Criterio de aceptación (condición, acción, resultado con valores) · Trazabilidad (H-xx o acta) · Estado de validación · Iteración prevista · ¿Integra el MVP?

Un requisito sin criterio de aceptación comprobable no se computa.

### 11.7 Prototipo v1 (Guía de comprobación)

- `README.md` con ocho secciones: identificación · qué hace el prototipo · requisitos previos con versiones exactas · instalación · configuración · ejecución y verificación · estado del canal de construcción · declaración de herramientas auxiliares (herramienta, función y artefacto afectado).
- Archivo de variables de ejemplo sin credenciales reales; esquema de base reproducible por guion o migración.
- Caso de uso vertical de interfaz a persistencia y retorno, con una regla de negocio validada.
- CI en `.github/workflows/ci.yml`: instala, construye y ejecuta al menos una prueba ligada a un criterio de aceptación; al menos una corrida exitosa con fecha anterior o igual a la entrega.
- Etiqueta `v1` anotada y publicada; correcciones posteriores como `v1.1`, sin mover la publicada.

---

## 12. Permisos y límites operativos

Configurados en `.claude/settings.json`, para que no dependan de que el agente respete una instrucción:

| Tipo | Alcance |
|------|---------|
| Git denegado | `commit`, `push`, `tag`, `add`, `reset`, `checkout`, `switch`, `restore`, `rebase`, `merge`, `stash`, `clean` |
| Git permitido | `status`, `diff`, `log`, `show`, y `clone` (solo para `/comprobar-v1`, en carpeta temporal) |
| Edición denegada | `05-entregas/` (lo escriben solo los scripts, creando archivos nuevos), `catedra/` (salvo las devoluciones, que carga el autor) |

**Límite técnico:** Claude Code no permite restringir por carpeta la escritura de un subagente particular. Que solo el redactor escriba en `informe/` y solo el ingeniero en `00-gestion/` queda como instrucción; el control efectivo es la revisión del diff por parte del autor antes de cada commit.

---

## 13. Migración inicial (una sola vez, al armar el repo)

**Regla:** migrar no es corregir. El contenido se pasa tal cual está en la versión entregada o aceptada; las correcciones se hacen después, en commits separados.

**Material de partida** (provisto por el autor el 24/09/2026):

| Documento | Palabras aprox. | Nota |
|-----------|----------------:|------|
| AE1 (Resumen, Capítulos I y II, anexos) | 26 900 | Títulos con formato directo: corte por numeración. |
| Capítulo III | 10 700 | Títulos con formato directo; muchas tablas. |
| Capítulo IV | 4 600 | Títulos con estilo. Sirve como prueba de fidelidad. |
| Capítulo V | 4 700 | Títulos con formato directo; dos figuras. |

**Orden:**
1. Inventario del repositorio existente, para fusionar sin pisar nada.
2. Capítulo IV y prueba de fidelidad del pipeline.
3. Capítulos III y V.
4. AE1: Resumen y Capítulos I y II.
5. Bitácora del AE1 y `anexo-III.md`.
6. Libro de trabajo: catálogo desde III.5, trazabilidad desde los H-xx del Capítulo II, glosario, entidades, reglas, iteraciones y recursos.
7. `referencias.bib` y `fuentes.md` desde las bibliografías existentes.
8. ADR retroactivos.
9. Configuración: `CLAUDE.md`, subagentes, comandos, `settings.json`, `reglas-catedra.md`, `reference.docx` y scripts.

**Método:**
- Conversión por script (pandoc): Markdown, figuras extraídas, un archivo por apartado.
- Limpieza sin alterar contenido: tablas, notas al pie, estructura de apartados de la plantilla, citas `[@clave]`.
- Control: apartados, palabras por apartado, tablas y figuras contra el original; con el Capítulo IV, regeneración del `.docx` y comparación lado a lado.

**ADR retroactivos:**
- Fuentes: documentos migrados, bitácora del AE1, `anexo-III.md` y chats del Proyecto.
- Estado `aceptado (retroactivo)` con la fecha original; cada ADR indica su origen.
- Lo que no tenga respaldo documental queda **propuesto** para que el autor lo confirme o lo descarte.
- Prioridad: los que condicionan los capítulos pendientes del AE2.

**Resultado:** todos los cambios quedan sin confirmar; el autor los revisa y hace los commits (se recomienda uno por paso).

**Convenciones adoptadas en la migración:**
- Las secciones migradas figuran en `estado.md` como `aprobada (migración)`: son las versiones entregadas o aceptadas.
- ADR-001 a ADR-018 corresponden a los códigos D-01 a D-18 del Anexo III; la numeración continúa sin reiniciarse.
- Mientras las citas no pasen al formato `[@clave]`, el armado usa `informe/bibliografia.md`.
- Lo detectado durante la migración quedó en `00-gestion/pendientes.md` (serie M-xx), sin corregir.

---

## 14. Temas abiertos

| # | Tema |
|---|------|
| A-01 | **Ficha de defensa:** contenido, ubicación y comando. Se define más adelante. |
| A-02 | **Declaración de herramientas** en la bitácora del AE2: si se actualiza la frase «asistente conversacional» para describir el uso de agentes (a criterio del autor). |
