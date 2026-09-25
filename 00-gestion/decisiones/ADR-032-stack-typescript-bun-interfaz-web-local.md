# ADR-032 — Stack del prototipo: TypeScript sobre Bun, interfaz web local, evaluador de permisos incorporado por copia atribuida y GitHub Actions

- Estado: aceptado (25/09/2026)
- Fecha: 25/09/2026
- Capítulos afectados: Cap. X (X.4, íntegro); Cap. V (V.4, Tabla 18; V.5, prototipo v1); Cap. I (I.5, I.6.2, I.6.4) y Cap. III (III.3, RF-03) por la denominación «aplicación de escritorio»; Cap. IV (IV.1, canales; IV.3, clientes); `src/README.md`
- Origen: análisis integral del 25/09/2026 (`00-gestion/revisiones/20260925-analisis-integral.md`, hallazgos T-05 y V-01); pendiente AD-06
- Relacionado: **concreta ADR-006** (cómo se incorpora el evaluador) y **fija la tecnología del almacén** que ADR-023 dejó pendiente. No reemplaza ningún ADR: la «aplicación de escritorio» figura en el informe sin ADR propio.

### Contexto

Cuatro decisiones técnicas están abiertas y bloquean el prototipo v1, cuya etiqueta vence el 01/10 (U-01, AD-06). Son el lenguaje y el runtime, la tecnología de la interfaz humana, la forma de incorporar el evaluador de permisos y la herramienta de integración continua. Se deciden juntas porque cada una condiciona a las otras.

Restricciones que salen del repositorio:

- **ADR-006 (aceptado):** RIGE incorpora las funciones de evaluación de permisos de OpenCode y no las reimplementa. I.3.5 presenta esa incorporación como la mitigación principal del riesgo, porque asegura «la coincidencia de las decisiones por construcción».
- **A.I.3, resultado 10:** el repositorio de OpenCode contiene dos motores de permisos, y en la versión 1.18.25 decide el segundo. Hay que incorporar el vigente.
- **I.6.4, Tabla 9:** RIGE no ejecuta OpenCode durante su funcionamiento.
- **RNF-05:** cero conexiones salientes durante el análisis.
- **Tabla 18 (V.4):** en la iteración 1 hay 8 h para repositorio y CI, 4 h para el almacén y 4 h para la interfaz. En todo el período, la interfaz suma 10 h.
- **Guía de comprobación del v1 (`catedra/AE2-guia-comprobacion-v1.md`):** en los pasos 3, 6 y 7, la cátedra instala con el comando declarado, crea el esquema con un guion o una migración, arranca la aplicación y verifica que «responde en la dirección declarada». Entre las causas de fallo que lista figura «el proceso arranca y la página no carga». El canal de CI se acredita con `.github/workflows/ci.yml`.
- **IV.1 y IV.3:** la ejecución por terceros se hace «mediante imagen de contenedor», y la adopción exige «instalación sin privilegios administrativos». Estas dos exigencias están en tensión (hallazgo IV-01).
- **`informe/datos-autor.yaml`:** el repositorio es de GitHub.

**Verificación sobre el tag `v1.18.25`** (25/09/2026, código descargado de `codeload.github.com/anomalyco/opencode`, lectura sin modificación):

- **Runtime.** `package.json` declara `"packageManager": "bun@1.3.14"` y el monorepo usa `bun.lock` y `bunfig.toml`. RIGE fija **Bun 1.3.14**, la misma versión.
- **Evaluador vigente.** `packages/core/src/permission.ts`, función `evaluate(action, resource, ...rulesets)`:
  - son 11 líneas y no dependen de ningún servicio;
  - toma la última regla coincidente (`findLast`) y, si ninguna coincide, el efecto es `ask`;
  - su única dependencia es `Wildcard.match`.
- **Resolución de una solicitud.** La función `denied` y la agregación de efectos (`deny` > `ask` > `allow` entre varios recursos), en `evaluateInput`, también son lógica pura, pero están dentro de un servicio de Effect que consulta la sesión y las aprobaciones guardadas. Se copia la lógica y no el servicio.
- **Comparador de patrones.** `packages/core/src/util/wildcard.ts`, 14 líneas, sin imports:
  - escapa el patrón, `*` → `.*`, `?` → `.`;
  - un patrón que termina en « *» vuelve opcional el argumento;
  - en Windows la comparación ignora mayúsculas (flag `i`).
- **Armado de reglas desde la configuración.** No pertenece al motor v2: lo hace `Permission.fromConfig` del paquete `packages/opencode` (`permission/index.ts`, líneas 178 a 198), junto con `expand` (expansión de `~` y `$HOME`).
  - Produce reglas con la forma v1 (`permission` / `pattern` / `action`), que se corresponden campo a campo con la forma v2 (`action` / `resource` / `effect`).
  - En el mismo archivo, `disabled` (líneas 204 a 214) calcula qué herramientas desaparecen del modelo, que es la base de RF-10.
  - `[DATO PENDIENTE: ubicación exacta de la conversión de forma v1 a v2 en el tag]`.
- **Reglas nativas.** Se arman en `packages/opencode/src/agent/agent.ts` (líneas 119 a 293) mediante llamadas a `fromConfig` con literales. Ese archivo depende de más de 30 módulos (proveedores, plugins, Effect y otros), así que las reglas nativas se **transcriben** como datos con atribución, no se importan.
- **Licencia.** MIT, «Copyright (c) 2025 opencode».
- **Conclusión para E-A.** La copia atribuida comprende cuatro funciones puras, de unas 60 líneas en total (`evaluate`, `match`, `fromConfig`, `expand`, más `disabled` para RF-10), y los literales de las reglas nativas. No arrastra Effect ni servicios de sesión. Queda descartada la condición que invalidaba la recomendación por el tamaño de la copia.

### Alternativas evaluadas

**Eje 1 · Lenguaje y runtime**

- **L-A:** TypeScript sobre Bun, el mismo runtime de la herramienta (suposición a verificar).
- **L-B:** TypeScript sobre Node.js LTS.
- **L-C:** Otro lenguaje (Python, Go o Rust).

**Eje 2 · Interfaz humana**

- **I-A:** Aplicación de escritorio (Electron o Tauri).
- **I-B:** Interfaz web local: servidor HTTP del propio proceso, escuchando solo en `127.0.0.1`, con HTML sin framework.
- **I-C:** Solo línea de comandos, también como interfaz humana.

**Eje 3 · Incorporación del evaluador de permisos**

- **E-A:** Copia atribuida (vendoring). Los archivos del evaluador vigente y sus dependencias internas se copian desde el tag de la versión 1.18.25 a una carpeta del adaptador, sin modificarlos, con la licencia MIT y una cabecera de procedencia (tag y ruta de origen).
- **E-B:** Dependencia del paquete publicado de OpenCode, fijado en 1.18.25, importando el módulo interno.
- **E-C:** Invocar el binario de OpenCode en tiempo de ejecución.

**Eje 4 · Integración continua**

- **C-A:** GitHub Actions.
- **C-B:** GitLab CI u otro servicio.

**Almacén** (tecnología que ADR-023 dejó pendiente; la opción A, B o C de ese ADR sigue siendo decisión del autor):

- SQLite embebido, con un guion de esquema SQL versionado.

### Análisis (trade-offs)

**Lenguaje y runtime.**
- **L-C** obliga a portar el evaluador. Eso contradice ADR-006, que está aceptado, y hace perder la coincidencia por construcción que sostiene la mitigación del riesgo principal (I.3.5). Queda descartada si no se abre un ADR de reemplazo de ADR-006, y no hay razón para abrirlo.
- **L-B** conserva el código reutilizable. Pero si el evaluador o sus dependencias usan APIs propias de Bun (suposición), hay que adaptarlo, y cada adaptación es una divergencia respecto del código de referencia. Para SQLite necesita un módulo nativo o una API reciente de Node.
- **L-A** ejecuta el código copiado en su runtime de origen, sin adaptación. Trae SQLite integrado (`bun:sqlite`), un ejecutor de pruebas integrado (`bun test`) y un servidor HTTP integrado. El resultado es un solo prerrequisito para la cátedra: una versión exacta de Bun.
- **Costo de L-A** (conocimiento general): el ecosistema de Bun es menos maduro que el de Node, y alguna herramienta de terceros puede no soportarlo.

**Interfaz.**
- **I-A** es la que peor encaja con la comprobación.
  - Las 10 h de la Tabla 18 no alcanzan para configurar el framework, empaquetar y probar en una máquina ajena (criterio).
  - Tauri agrega Rust a los requisitos previos.
  - Una GUI dentro de un contenedor necesita reenvío del servidor gráfico, lo que en una máquina limpia es una causa segura de fallo (conocimiento general).
  - La guía comprueba que el proceso «responde en la dirección declarada», y una ventana de escritorio no tiene dirección.
- **I-B** encaja con cada paso de la guía de comprobación:
  - arranca con un comando y responde en `http://127.0.0.1:<puerto>`;
  - el mismo proceso sirve la CLI de RF-03;
  - corre igual en nativo y en contenedor, publicando el puerto;
  - escuchar en loopback no es una conexión saliente, así que respeta RNF-05;
  - un formulario HTML y una vista de consulta entran en 4 h;
  - la explicación en prosa de ADR-021 se presenta en la página, igual que en la GUI prevista.

  Su costo: cambia la denominación «aplicación de escritorio», que el AE1 aprobó, en I.5, I.6.2, I.6.4, III.3, RF-03, V.4 y V.5. Hay que propagarlo, pero ninguna exclusión ni requisito cambia de fondo.
- **I-C** es la más barata. Pero la guía describe la estación de interfaz como «un formulario mínimo y una vista de consulta», y el protocolo de medición final (I.3.4) supone participantes que consultan con explicación en prosa, que ADR-021 reserva a la interfaz humana. Se descarta como interfaz humana y se conserva como la CLI de RF-03.

**Evaluador.**
- **E-C** contradice la Tabla 9 del AE1 («RIGE no lo ejecuta») y haría que el producto y el oráculo (ADR-029) fueran la misma ejecución, con lo que la verificación dejaría de ser independiente.
- **E-B** depende de que el paquete publicado exponga el módulo interno. Suposición: se distribuye como binario y no como biblioteca, así que es frágil o inviable.
- **E-A** fija el código exacto de la versión congelada y no depende del registro de paquetes. La atribución MIT queda visible, y el adaptador lo envuelve, así que el núcleo no lo ve (RNF-03).
- **Riesgo de E-A:** si el evaluador arrastra una parte grande del código interno (tipos de configuración, utilidades de patrones), la copia crece y cuesta más mantenerla. Se mide antes de aceptar este ADR (ver la condición que invalida la decisión). Hay que copiar el motor vigente y no el que presenta el comando de introspección (A.I.3, resultado 10).

**CI.**
- **C-A** es la opción que la guía y `00-gestion/reglas-catedra.md` §7 nombran (`.github/workflows/ci.yml`), y el repositorio es de GitHub. Existe una acción oficial para instalar una versión fija de Bun (conocimiento general).
- **C-B** no aporta nada y obliga a replicar el repositorio.

**Almacén.**
- SQLite embebido es un motor real, con esquema creado por guion (paso 6 de la guía). No requiere un servidor aparte, ni credenciales, ni un archivo de variables con secretos.
- Un motor cliente-servidor (PostgreSQL) agregaría un servicio, credenciales y un paso de instalación sin ningún requisito que lo justifique.

### Recomendación y fundamento

Recomendación del ingeniero:

| Eje | Recomendación |
|---|---|
| Lenguaje y runtime | **L-A**, TypeScript sobre Bun en versión exacta fijada |
| Interfaz humana | **I-B**, interfaz web local en loopback |
| Evaluador | **E-A**, copia atribuida del evaluador vigente del tag 1.18.25 |
| CI | **C-A**, GitHub Actions |
| Almacén | SQLite embebido (`bun:sqlite`) con guion de esquema versionado |

Fundamento: es la única combinación que, al mismo tiempo,

- respeta ADR-006 sin adaptar el código de la herramienta;
- deja la comprobación de la cátedra con un solo prerrequisito (Bun en una versión exacta) y una dirección a la que responder;
- cumple RNF-05 por construcción;
- entra en las horas de la iteración 1 de la Tabla 18 sin mover el alcance.

Canal mínimo propuesto (`.github/workflows/ci.yml`):

1. instalar la versión fijada de Bun;
2. `bun install --frozen-lockfile`;
3. verificación de tipos con `tsc --noEmit`;
4. `bun test`, con la prueba del criterio de aceptación de RF-01 sobre el escenario de tres entradas y la de RNF-01 por resúmenes SHA-256;
5. verificación de RNF-03: ningún módulo del núcleo importa del adaptador, comprobado con un analizador de dependencias o con una prueba que recorre los imports.

Sobre el contenedor (IV.1): se recomienda que el `README.md` ofrezca como **vía principal la ejecución nativa** (Bun, sin privilegios, lo que resuelve IV-01), y que el contenedor quede como vía para regenerar el oráculo con OpenCode 1.18.25 fijado, según la mitigación de ADR-029. La redacción de IV.1 se ajusta cuando se resuelva AD-02.

### Condición que invalidaría la recomendación

- Que la verificación sobre el tag muestre que OpenCode no se ejecuta sobre Bun. En ese caso se reevalúa L-A frente a L-B con el runtime real.
- Que el evaluador vigente, con sus dependencias internas, no pueda aislarse en una copia acotada: por ejemplo, que exija el cargador de configuración completo o que aislarlo lleve más de ~6 h. En ese caso se reevalúa E-A, y la alternativa sería copiar solo la función de evaluación con un ADR que declare la divergencia.
- ~~Que el autor no tenga experiencia operativa en TypeScript.~~ Descartada: el autor declara experiencia en TypeScript (25/09/2026).
- Que la cátedra exija expresamente una aplicación de escritorio.

### Decisión del autor

El autor acepta la recomendación en sus cinco ejes (25/09/2026): TypeScript sobre Bun 1.3.14, interfaz web local en `127.0.0.1`, copia atribuida de las funciones puras del evaluador vigente (`evaluate`, `match`, `fromConfig`, `expand`, `disabled`) y de las reglas nativas, GitHub Actions y SQLite embebido con guion de esquema versionado.

### Consecuencias

**Si se acepta:**

- **Verificaciones previas** (≤ 2 h, iteración 1): identificar en el tag 1.18.25 el runtime, el campo `packageManager` o la versión de Bun, y el grafo de imports del evaluador vigente. Los valores exactos van a `src/README.md` §3: `[DATO PENDIENTE: versión exacta de Bun]`.
- **`src/` queda con esta estructura:**
  - `nucleo/`, sin imports del adaptador (RNF-03);
  - `adaptador-opencode/`, con `vendor/` y su `LICENSE`;
  - `interfaz/web` y `interfaz/cli`;
  - `almacen/`, con el guion de esquema;
  - `pruebas/`, con los escenarios y los resultados de referencia (ADR-029).
- **Propagación al informe** con `/corregir`: «aplicación de escritorio» o «interfaz de escritorio» pasa a «interfaz web local» en I.5, I.6.2, I.6.4 (Tabla 9), III.3, RF-03 (criterio de aceptación), V.1 (Tabla 14), V.4 y V.5. Se agrega a la Ventana del AE1 junto con T-03.
- **Cap. X, X.4:** cada fila (runtime, lenguaje, interfaz, almacén, CI, evaluador incorporado) se redacta desde este ADR, con licencia, versión, alternativa y criterio de descarte.
- **ADR-023:** su tecnología queda resuelta (SQLite). La elección entre A, B y C sigue siendo del autor.
- **AD-06 queda cubierto; AD-02 sigue abierto:** falta decidir la plataforma de RNF-06 y el rol del contenedor.

### Evidencia

`catedra/AE2-guia-comprobacion-v1.md` (pasos 3, 6 y 7; causas de fallo; §5 CI); `00-gestion/reglas-catedra.md` §7; ADR-006; ADR-021; ADR-023; ADR-029; `informe/anexos/anexo-I-ae1-datos-relevados.md` (A.I.3, resultado 10); `informe/cap-01/I.6-descripcion-detallada-sistema-informacion.md` (Tabla 9); `informe/cap-04/IV.1-definicion-negocios.md`; `informe/cap-04/IV.3-analisis-rivalidad-amplificada.md`; `informe/cap-05/V.4-cronograma.md` (Tabla 18); `informe/datos-autor.yaml`; `00-gestion/revisiones/20260925-analisis-integral.md` (T-05, IV-01, V-01).
