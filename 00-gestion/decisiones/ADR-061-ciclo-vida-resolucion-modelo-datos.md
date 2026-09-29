# ADR-061 — Ciclo de vida de la Resolución y modelo de datos del almacén: Proyecto identificado por su ruta canónica, Resolución inmutable persistida como documento con sus entradas leídas en tablas, retención de las últimas veinte por proyecto y esquema creado por guion explícito

- Estado: aceptado (29/09/2026)
- Fecha: 29/09/2026
- Capítulos afectados: ninguno del cuerpo del AE2. Alimenta el capítulo de diseño de una entrega posterior (no se adelanta). Afecta `04-diseno/README.md` (sección 2, cierra esa parte de R-08), `src/esquemas/almacen/`, `src/paquetes/rige/adaptadores/almacen-sqlite/`, `src/README.md` (§4 y §6, paso de creación del esquema) y la prueba de RNF-04. Es coherente con V.5 («la persistencia escribe la resolución con sus valores y su procedencia en el almacén propio […] y la recupera») y no lo modifica
- Origen: sesión de diseño del 29/09/2026 (pendientes AR-02 y AR-12). Discusión de seis puntos (B1 a B6) después de fijar el alcance del caso vertical del v1; el autor manifestó conformidad con las seis recomendaciones y con N = 20
- Relacionado: **aplica** ADR-023 (almacén propio sin caché, opción B), ADR-032 (SQLite embebido, `bun:sqlite`, guion versionado), ADR-058 (convención 4, determinismo; convención 5, ubicación, WAL y prueba de ida y vuelta; eje 8, `ValorSustituido`) y ADR-060 (rastro de valor y de decisión; resumen de entradas leídas E-02). **Deja a ADR-062** el nombre del comando de creación del esquema, la variable que ubica el almacén y el versionado del formato de salida

### Contexto

ADR-023 decidió que RIGE persiste la Resolución en un almacén propio, sin caché. ADR-032 fijó SQLite embebido con un guion de esquema versionado. ADR-058 ubicó el almacén fuera del proyecto analizado, con WAL y tiempo de espera ante bloqueos. Ninguno definió qué se persiste, cómo se identifica un Proyecto entre resoluciones ni cuánto se conserva (ADR-058, «Decisiones que este registro no toma»; ADR-060, ídem).

Restricciones que salen del repositorio:

- **Guía de comprobación del v1** (`catedra/AE2-guia-comprobacion-v1.md`):
  - paso 6: «el esquema se crea de manera reproducible. Una base creada a mano, cuya estructura no está en el repositorio, no satisface este paso»;
  - paso 8: «el dato ingresa, la regla de negocio se aplica, el dato persiste, se recupera y se muestra»;
  - regla que gobierna la comprobación: la cátedra no suple comandos que el archivo de lectura no menciona.
- **Dominio** (`informe/cap-03/III.2-dominio-sistema-informacion.md`, III.2.1): la Resolución es una entidad fechada del dominio.
- **RR-01** (`03-requisitos/libro/reglas.md`): RIGE escribe únicamente en su propio almacén.
- **RNF-04, CA-1** (`03-requisitos/libro/catalogo/RNF-04.md`): el valor incorporado por una sustitución no aparece en ninguna salida, **almacén propio incluido**, verificado por búsqueda textual.
- **RF-03** y ADR-058, convención 4: la fecha y el identificador de la Resolución se guardan en el almacén, pero no integran la respuesta de la CLI.
- **Acuerdo E-02** (acta del 26/09/2026; ADR-060): toda respuesta declara sobre qué estado de las entradas se obtuvo. Las variables entran por nombre y condición, nunca por contenido.
- **Caso vertical del v1** (sesión del 29/09/2026): la interfaz resuelve y guarda (`GET /resolver`), y después presenta la Resolución **leída del almacén** (`GET /resoluciones/:id`), con la lista de resoluciones anteriores del Proyecto. Así, reiniciar el proceso y volver a abrir la dirección acredita que el dato persiste y se recupera.
- **Tabla 18 (V.4; `03-requisitos/libro/iteraciones.md`):** 4 h en la iteración 1 para «almacén propio: esquema, escritura y lectura de la resolución».
- **Exposición de la web** (sesión del 29/09/2026, tensión T1): RNF-09 exige solo GET. Una página ajena puede disparar un GET hacia `127.0.0.1` que RIGE atiende sin devolverle datos. El control de `Sec-Fetch-Site` se decide en ADR-062. La retención acota el efecto sobre el almacén.

### Alternativas evaluadas

**B1 · Identidad del Proyecto entre resoluciones**
- **I-A:** Ruta canónica del directorio analizado, normalizada como la normaliza OpenCode en Windows (resolución de la ruta real y de mayúsculas).
- **I-B:** Ruta canónica más el worktree detectado.
- **I-C:** Resumen del contenido de las entradas.

**B2 · Qué se persiste**
- **P-A:** La respuesta serializada de cada consulta.
- **P-B:** Modelo relacional completo: declaraciones, valores, rastros y declaraciones desplazadas en tablas.
- **P-C:** Híbrido. Tablas relacionales para lo que se consulta y se restringe (Proyecto, Resolución, entradas leídas) y la Resolución completa del núcleo como documento JSON con formato versionado.

**B3 · Papel del resumen E-02**
- **E-A:** Solo dentro del documento.
- **E-B:** Una fila por vía en una tabla y el resumen del conjunto como columna indexada de la Resolución, con uso informativo.
- **E-C:** Como en E-B, además usado como clave de caché.

**B4 · Retención**
- **R-A:** Ilimitada.
- **R-B:** Las últimas N resoluciones por Proyecto, depuradas en la misma transacción del alta.
- **R-C:** Por antigüedad.

**B5 · Prueba de RNF-04 sobre el almacén**
- **S-A:** Búsqueda textual en el archivo principal de la base.
- **S-B:** Búsqueda en el archivo principal, el registro WAL y la memoria compartida (`rige.db`, `rige.db-wal`, `rige.db-shm`), con `PRAGMA secure_delete = ON`.

**B6 · Creación del esquema**
- **C-A:** Comando explícito e idempotente, que aplica guiones numerados y fija `PRAGMA user_version`. Al arrancar, RIGE verifica la versión y, si no coincide, falla con un error que indica el comando.
- **C-B:** Creación o migración automática al arrancar, desde los mismos guiones.

### Análisis (trade-offs)

**B1.**
- **I-C** crea un Proyecto nuevo con cada cambio de un archivo, y pierde la historia que el caso vertical muestra.
- **I-B** agrega un dato que la ruta ya determina en el caso normal.
- **I-A** es estable y comprensible. El entorno (HOME, variables de entorno, vías globales) queda fuera de la identidad, porque es contexto de cada Resolución y E-02 ya lo registra.
- Costo de I-A: un proyecto movido de carpeta es otro Proyecto.

**B2.**
- **P-A** guarda una fila por consulta. No representa la «resolución fechada» del dominio, y otra clave del mismo agente obliga a resolver de nuevo.
- **P-B** duplica en SQL un modelo que ya vive en el núcleo (ADR-060). Cada cambio del rastro es una migración, y no entra en las 4 h.
- **P-C:**
  - la consulta del usuario se **deriva** de la Resolución leída, así que `/resoluciones/:id` responde cualquier clave sin volver a resolver, y la web presenta lo que leyó (ADR-058, convención 5);
  - las tablas sostienen las restricciones que importan: integridad referencial, unicidad del Proyecto, forma del resumen y validez del JSON;
  - el serializador del documento es el mismo que protege la salida, así que un `ValorSustituido` solo se emite con su origen y su condición (ADR-058, eje 8).
  - Costo: un formato más, con versión propia.

**B3.**
- **E-A** impide consultar sin abrir el documento.
- **E-C** contradice ADR-023 (opción B, sin caché) y hereda su riesgo de fidelidad: las variables entran al resumen por nombre y condición, así que un cambio en su contenido no altera el resumen (ADR-060, M-B).
- **E-B** permite informar «sin cambios respecto de la resolución N» sin afirmar que se reutilizó nada.

**B4.**
- **R-A** deja crecer el almacén sin límite, también ante solicitudes disparadas desde otra página (T1).
- **R-C** depende del reloj y no acota el volumen.
- **R-B** acota el volumen por Proyecto y es comprobable con una prueba.
  - N = 20 cubre la comparación con resoluciones recientes (criterio del autor).

**B5.**
- Con WAL, una escritura reciente puede residir en `rige.db-wal` y no en `rige.db` hasta el siguiente punto de control (conocimiento general sobre SQLite), así que **S-A** puede dar un falso negativo.
- `secure_delete` sobrescribe con ceros el contenido que borra la retención (conocimiento general).
- En el v1 la prueba es trivial, porque el escenario no tiene sustituciones. El mecanismo queda armado para la iteración 3.

**B6.**
- **C-B** también es reproducible. Pero deja el paso 6 de la guía sin un comando que la cátedra ejecute y compruebe, y una migración silenciosa contradice el principio de falla visible (ADR-058, convención 3).
- **C-A** vuelve el paso 6 un comando del README y hace visible cualquier desfase entre el código y la base.

### Recomendación y fundamento

**I-A + P-C + E-B + R-B (N = 20) + S-B + C-A.**

**Ciclo de vida de la Resolución:**

- Se **crea** con el caso de uso que resuelve (CU-01, subfunción). Lo invocan la web (`/resolver`) y, desde la iteración 2, la CLI, con el mismo caso de uso (paridad, ADR-058).
- Es **inmutable**: nunca se actualiza. Un disparador rechaza cualquier `UPDATE` sobre `resolucion` y `entrada_leida`.
- Se **consulta** por su identificador. La respuesta de cada consulta se deriva del documento leído.
- Se **elimina** solo por la retención: al dar de alta la vigésima primera de un Proyecto, se borra la más antigua en la misma transacción (`BEGIN IMMEDIATE`).

**Modelo de datos** (guion `src/esquemas/almacen/001_inicial.sql`, `PRAGMA user_version = 1`):

| Tabla | Columnas | Restricciones |
|---|---|---|
| `proyecto` | `id` INTEGER PK; `ruta` TEXT | `ruta` NOT NULL UNIQUE (ruta canónica, I-A) |
| `resolucion` | `id` INTEGER PK; `proyecto_id`; `instante` TEXT (ISO 8601, UTC); `resumen_entradas` TEXT; `herramienta` TEXT; `version_herramienta` TEXT; `version_rige` TEXT; `formato_documento` INTEGER; `documento` TEXT | FK a `proyecto` con `ON DELETE CASCADE`; `resumen_entradas` de 64 caracteres hexadecimales; `documento` con `json_valid`; índices por (`proyecto_id`, `instante`) y por `resumen_entradas` |
| `entrada_leida` | `resolucion_id`; `orden` INTEGER; `via` TEXT; `referencia` TEXT; `resumen` TEXT NULL; `condicion` TEXT | PK (`resolucion_id`, `orden`); FK con `ON DELETE CASCADE`; `via` del catálogo de vías del adaptador; `condicion` en {`observada`, `no_observada`, `definida`, `no_definida`}; `resumen` nulo para las variables y las vías no observadas |

- `referencia` es la ruta en el caso de un archivo, el nombre en el caso de una variable y el identificador de la vía en el caso de una vía remota. **Nunca** es un contenido.
- `herramienta` y `version_herramienta` son la identidad que declara el adaptador (ADR-060). El núcleo no las interpreta.
- Los nombres de columna de la tabla son una propuesta de diseño. Pueden ajustarse al implementar sin un ADR nuevo, siempre que se conserven las restricciones.

**Directorio del almacén** (precisión incorporada el 29/09/2026 al redactar el plan del incremento 0):
- En una máquina limpia, el directorio por defecto (`$XDG_DATA_HOME/rige`, `~/.local/share/rige` o `%LOCALAPPDATA%\rige`; ADR-058, convención 5) no existe, y SQLite no crea carpetas (conocimiento general).
- `adaptadores/almacen-sqlite` puede importar `node:fs` **solo** para crear su propio directorio (`mkdirSync` con `recursive`). Es coherente con RR-01, que permite escribir en el almacén propio.
- `adaptadores/sistema` conserva su condición de solo lectura, que es la garantía de RNF-01.
- Alternativas descartadas:
  - que el directorio lo cree `adaptadores/sistema`, porque rompe su solo lectura;
  - exigir que el directorio exista, porque agrega un paso manual a la comprobación.
- La prueba de arquitectura admite en ese módulo únicamente esa función de `node:fs`.
- Condición que invalidaría la precisión: que el almacén necesite escribir algo distinto de su directorio y de sus archivos de base.

**Conexión:**
- `PRAGMA foreign_keys = ON`, en cada conexión;
- `journal_mode = WAL`, `busy_timeout` y `secure_delete = ON`.

**Pruebas que este registro exige:**
1. **Ida y vuelta:** guardar y leer una Resolución devuelve un documento idéntico (ADR-058, convención 5).
2. **Retención:** con 21 altas del mismo Proyecto quedan 20, y la eliminada es la más antigua.
3. **Inmutabilidad:** un `UPDATE` sobre `resolucion` falla.
4. **RNF-04 sobre el almacén (S-B):** los valores conocidos no aparecen en ninguno de los tres archivos de la base.
5. **Esquema:**
   - sobre una base vacía, el comando la deja en `user_version = 1`;
   - repetido, no cambia nada;
   - con la versión distinta, RIGE no atiende y el error nombra el comando.

**Fundamento.**
- Es la combinación que sostiene la Resolución fechada del dominio.
- Hace que el paso 8 de la guía se compruebe sin interpretación, porque lo que se muestra se leyó del almacén.
- Protege RNF-04 con el mismo serializador de la salida.
- Entra en las 4 h de la Tabla 18, porque el modelo del rastro no se replica en SQL.

**Condición que invalidaría la recomendación:**
- Que el formato del documento cambie con una frecuencia que vuelva costoso leer resoluciones anteriores. En ese caso, las resoluciones de un formato viejo se declaran ilegibles y se descartan, o se pasa a P-B para las partes estables.
- Que `json_valid` no esté disponible en el SQLite de Bun 1.3.14 (suposición: JSON1 forma parte del SQLite integrado). En ese caso, la restricción se reemplaza por la validación en el adaptador.
- Que se necesite seguir un Proyecto movido de carpeta (I-A).
- Que el docente exija otro tipo de persistencia (condición heredada de ADR-023).

### Decisión del autor

Aceptado por el autor el 29/09/2026 (`/aceptar ADR-061`). En la sesión del 29/09/2026 el autor manifestó conformidad con B1 a B6, con N = 20 y con la precisión del directorio del almacén.

### Consecuencias

**Si se acepta:**

- **`04-diseno/README.md`, sección 2:** se completa con el modelo de este registro. R-08 queda abierto solo por la sección 3 (CI).
- **`src/`:**
  - los guiones van en `src/esquemas/almacen/` (`001_inicial.sql`), según el árbol de ADR-058; `paquetes/rige/adaptadores/almacen-sqlite/` contiene el repositorio de resoluciones, la aplicación de los guiones y sus pruebas;
  - el puerto correspondiente vive en `rige/aplicacion` (ADR-058).
- **ADR-058, tabla de reglas de dependencia:** la fila `rige/adaptadores` se lee con la precisión del directorio del almacén: `adaptadores/almacen-sqlite` importa `bun:sqlite` y, de `node:fs`, solo la creación de su directorio. Se refleja en `src/AGENTS.md` §3 (lo edita el autor).
- **Contrato de salida (ADR-058):** el almacén sin esquema o con versión distinta es un **error de uso**. En la CLI sale con el código 1 y el código estable `almacen-sin-esquema`. En la web se presenta como página de error. No se agrega ninguna fila al contrato.
- **`src/README.md`:** §4 incluye el comando de creación del esquema, y §6, la verificación de que la Resolución se recupera después de reiniciar.
- **Queda para ADR-062:**
  - nombre del comando (`bun run esquema` o subcomando `rige esquema`);
  - variable que ubica el almacén y su presencia en `.env.example`;
  - relación entre `formato_documento` y la versión del esquema de salida;
  - control de `Sec-Fetch-Site` sobre `/resolver`.
- **Pendientes:** AR-02 se cierra al aceptarse.

### Evidencia

- `catedra/AE2-guia-comprobacion-v1.md` (pasos 6 y 8; regla que gobierna la comprobación)
- `00-gestion/reglas-catedra.md`, §7
- `informe/cap-03/III.2-dominio-sistema-informacion.md` (III.2.1); `informe/cap-05/V.5-descripcion-producto-minimo-viable.md` (último párrafo)
- `03-requisitos/libro/reglas.md` (RR-01, RR-02); `03-requisitos/libro/catalogo/RNF-04.md`, `RNF-09.md`, `RF-03.md`; `03-requisitos/libro/iteraciones.md` (iteración 1); `03-requisitos/libro/trazabilidad.md` (E-02)
- ADR-023, ADR-032, ADR-058, ADR-060
- Sesión de diseño del 29/09/2026
