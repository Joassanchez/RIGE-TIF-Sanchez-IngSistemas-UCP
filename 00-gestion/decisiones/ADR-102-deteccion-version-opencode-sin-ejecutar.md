# ADR-102 — Detección de la versión instalada de OpenCode sin ejecutarlo (RF-05)

- Estado: aceptado (30/10/2026)
- Fecha: 30/10/2026
- Capítulos afectados: ninguno del cuerpo en forma directa (la Tabla 9 de I.6 ya fija que RIGE no ejecuta OpenCode); limitación de la variable `PATH` del proceso de RIGE, junto a la de las variables de entorno de I.6.5. Afecta `src/` (adaptador: descriptor y vía de versión; aplicación: advertencia y declaración; esquemas de salida) y `src/AGENTS.md` §5 (lo edita el autor).
- Origen: pendiente AR-06 («decidir antes de la iteración 3»); sesión del 30/10/2026. Lo propuso el ingeniero y el autor lo aceptó en la misma sesión.

### Contexto

1. **[D] RF-05:** RIGE advierte cuando la versión instalada difiere de la 1.18.25 y en ese caso no presenta resultados como válidos. CA-1 pide la versión esperada y la detectada, con cero resultados. CA-2 pide la salida estándar vacía, la advertencia por el canal de error y el código 1.
2. **[D] Tabla 9 de I.6:** OpenCode queda fuera de la frontera; «RIGE no lo ejecuta ni lo modifica durante su funcionamiento». ADR-101 aplicó el mismo criterio a git: comprobar por archivo que el ejecutable está en `PATH`, sin lanzar procesos.
3. **[D] La versión se compila dentro del binario.** El tag define `OPENCODE_VERSION` en la construcción (`packages/opencode/script/build.ts:194`; `packages/core/src/installation/version.ts:6`). En el binario minificado aparece como `var n="1.18.25",t="latest"`, comprobado sobre `opencode.exe` el 30/10/2026: es un nombre de variable de la minificación, no un formato estable.
4. **[D] La instalación por gestor de paquetes deja la versión en un `package.json`.** En la máquina del autor, el `opencode` del `PATH` es el envoltorio de npm `AppData/Roaming/npm/opencode`. Junto a él, `node_modules/opencode-ai/package.json` declara `"version": "1.18.25"`, y el paquete de la plataforma (`opencode-windows-x64/package.json`) declara la misma. El binario tiene el SHA-256 `ef06e41a…`, el verificado en T2-14b. Con bun y pnpm globales el ejecutable es un enlace hacia `…/node_modules/opencode-ai/bin/opencode` (conocimiento general: es la forma en que esos gestores instalan los `bin` de un paquete).
5. **[S] Otras formas de instalación:** el guion `curl` deja solo el binario en `~/.opencode/bin` (`packages/opencode/src/cli/cmd/uninstall.ts:98-99` lo trata aparte), y brew y scoop guardan la versión en la ruta de instalación. No se relevó cuál usa el equipo de la referente.

### Alternativas evaluadas

- **V-A:** ejecutar `opencode --version`.
- **V-B:** leer el `package.json` del paquete `opencode-ai` al que pertenece el primer `opencode` del `PATH`, sin ejecutar procesos.
- **V-C:** buscar el literal de la versión dentro del binario.
- **V-D:** que el usuario declare la versión en `rige.env`.

### Análisis (trade-offs)

- **V-A** es la más general, pero contradice la Tabla 9 y ADR-101. Al arrancar, OpenCode escribe en la configuración global (`config/config.ts:264-270`, `$schema`) y puede instalar dependencias (AR-10), así que ejecutarlo rompe la solo lectura sobre el entorno del usuario.
- **V-B** es lectura de archivos, la misma vía que ya usa el adaptador de sistema. Cubre npm, pnpm y bun, que son las formas de instalación del entorno del proyecto y del CI (`npm install -g opencode-ai@1.18.25`). No cubre `curl`, brew ni scoop.
- **V-C** cubre cualquier instalación, pero depende de la minificación: un cambio del empaquetador cambia el patrón sin cambiar la versión. Leer 180 MB por consulta también compromete RNF-07.
- **V-D** no detecta nada: si el usuario declara mal, RIGE da por válida una versión distinta, que es justo lo que RF-05 previene.

**Sin versión determinable** (instalación por `curl`, OpenCode ausente del `PATH`, paquete ilegible), hay dos opciones:
- **N-1:** tratarlo como error de código 1, igual que una versión distinta.
- **N-2:** presentar los resultados con una advertencia por el canal de error y la declaración `version-no-determinada`.

N-1 bloquea a quien instaló con `curl`, el método que la documentación muestra primero (`packages/console/app/src/routes/index.tsx:91-98`), y también al CI que no instala OpenCode. RF-05 pide bloquear solo cuando la versión **difiere**. Con una versión indeterminada, la conducta conforme a RNF-02 es la falla visible sin silencio: declararlo, no callarlo.

### Recomendación y fundamento

**V-B con N-2.**

1. **Ejecutable.** RIGE toma el primer `opencode` del `PATH` de su proceso: en Windows, con las extensiones de `PATHEXT`. Usa el mismo recorrido de `PATH` que la detección de git de ADR-101.
2. **Paquete.** Desde la ruta real del ejecutable (resueltos los enlaces), RIGE sube por los directorios hasta un `package.json` con `"name": "opencode-ai"`. Si no lo encuentra, prueba `<directorio del ejecutable>/node_modules/opencode-ai/package.json`, que es la forma del envoltorio de npm en Windows. Lee `version`.
3. **Resultado.**
   - Versión igual a la del descriptor (`versionSoportada`): sin advertencia.
   - Versión distinta: advertencia con la esperada y la detectada, cero resultados, salida estándar vacía y código 1, con el código de error de uso `version-no-soportada` (RF-05, CA-1 y CA-2). La web muestra la misma advertencia sin resultados.
   - Sin versión determinable: los resultados se presentan; la respuesta declara `version-no-determinada` con el motivo (`ejecutable-no-encontrado`, `paquete-no-encontrado`, `paquete-ilegible`), y la CLI escribe la advertencia por el canal de error con código 0.
4. **Esquema de salida.** La declaración es un campo opcional nuevo. El esquema sigue en la versión 2 y las referencias del v2 siguen validando (RNF-08, CA-1).
5. **Pruebas.** El `PATH` de las pruebas de aceptación apunta a un directorio del escenario con un paquete `opencode-ai` falso. Se cubren versión igual, distinta y ausente, sin depender del OpenCode de la máquina ni del CI.

**Condición que la invalidaría:** que el equipo de la referente, o el entorno de la medición final, instale OpenCode por `curl`, brew o scoop. En ese caso RIGE informaría siempre `version-no-determinada` y RF-05 no protegería a ese usuario. Se reevalúa V-C, limitada a la forma de instalación detectada, con un ADR de reemplazo.

### Decisión del autor

Aceptado por el autor el 30/10/2026, en la sesión del día, junto con las demás recomendaciones de la iteración 3 («te acepto todo»).

### Consecuencias

- **`src/` (iteración 3):** vía de versión en el adaptador de OpenCode (lectura por archivo, sin procesos), comparación con `versionSoportada`, código de uso `version-no-soportada`, declaración `version-no-determinada` en las respuestas y escenarios con paquete falso.
- **`src/AGENTS.md` §5 (lo edita el autor):** el código `version-no-soportada` en la tabla de errores de uso; `PATH` como entrada leída para ubicar OpenCode.
- **Limitación declarada (I.6.5, en la propagación del Cap. VI):** RIGE lee el `PATH` de su propio proceso, que puede no ser el de la terminal donde corre OpenCode, igual que las variables de entorno.
- **Pregunta probable del tribunal:** «¿por qué no ejecutan `opencode --version`?». La respuesta es la Tabla 9 y este ADR: ejecutarlo escribe en la configuración global.

### Evidencia

- Código del tag `v1.18.25` (tarball verificado, SHA-256 `44e9530d…`): `packages/opencode/script/build.ts:194`, `packages/core/src/installation/version.ts:6`, `packages/opencode/src/config/config.ts:264-270`, `packages/opencode/src/cli/cmd/uninstall.ts:98-99`.
- Instalación del autor (30/10/2026): `npm/node_modules/opencode-ai/package.json` y `opencode-windows-x64/package.json` con `"version": "1.18.25"`; SHA-256 del binario `ef06e41a35795066e95acde276a42fbbf85d7a683c2787f6a19ed20bcde9b6ff`, el mismo de `src/herramientas/decisiones-nativas.ts`.
