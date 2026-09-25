# ADR-037 — Plataformas de RNF-06: Ubuntu 26.04 de referencia, Windows 11 declarada y macOS diferida; el contenedor solo regenera el oráculo

- Estado: aceptado (25/09/2026), alternativa C con las precisiones 1 a 3
- Fecha: 25/09/2026 (precisiones 1 a 3 agregadas el mismo día)
- Capítulos afectados: Cap. III (III.5, segunda precisión); Cap. IV (IV.1, fila «Canales» de la Tabla 10 y párrafo de la segunda decisión modificada por el lienzo); Cap. X (X.2, recursos físicos); Anexo I (ficha RNF-06); `03-requisitos/libro/catalogo/RNF-06.md`; `.gitattributes`; `.github/workflows/ci.yml` (al construir el v1)
- Origen: pendiente AD-02 y A-04 (`00-gestion/pendientes.md`); análisis integral del 25/09/2026, hallazgos III-07, IV-01 e IV-03 (`00-gestion/revisiones/20260925-analisis-integral.md`); traspaso de sesión, grupo B, decisión 5
- Relacionado: ADR-029 (oráculo), ADR-032 (stack; recomendación sobre el contenedor), ADR-035 (recuento de Must, sin cambios), ADR-036 (salida de RF-03), ADR-042 (horas de la iteración 4)

### Contexto

IV.1 fija Ubuntu 26.04 como única plataforma de acreditación de RNF-06 y dispone que la ejecución por terceros, incluido el v1 de la cátedra, se realice «mediante una imagen de contenedor» (`informe/cap-04/IV.1-definicion-negocios.md`, Tabla 10 y línea 29). La decisión no tiene ADR (IV-03) y la ficha de RNF-06 conserva `[plataformas]` (`03-requisitos/libro/catalogo/RNF-06.md`). Con una sola plataforma, el criterio «equivalentes en cada plataforma declarada» queda vacío (III-07).

IV.3 exige «instalación sin privilegios administrativos» (`informe/cap-04/IV.3-analisis-rivalidad-amplificada.md`). Instalar un motor de contenedores suele requerirlos (conocimiento general), lo que genera la tensión IV-01. La guía de comprobación del v1 prevé que la cátedra clone en una máquina limpia e instale con el comando del README; no menciona contenedores (`catedra/AE2-guia-comprobacion-v1.md`, pasos 1 a 4).

Evidencia del repositorio:
- El relevamiento se ejecutó en parte sobre Windows 11 (`01-relevamiento/opencode-como-funciona.md`, marcas `[WINDOWS]`, líneas 19, 85 y 347) y en parte sobre Ubuntu (hallazgo H-19).
- La configuración global se busca en `~/.config/opencode` en ambas plataformas (misma fuente, §3, entrada 2). Las entradas dependientes del sistema operativo (configuración administrada y MDM, entradas 9 y 10) están excluidas por III.4.
- Dentro de la frontera individual, las diferencias entre plataformas son: directorio personal, separadores de ruta, comparación de patrones sin distinción de mayúsculas en Windows (ADR-032), `bash` que ejecuta PowerShell en Windows (línea 355) y el directorio `state` que no se redirige con `HOME` en Windows (línea 85).

Datos del autor (25/09/2026): no dispone del sistema operativo de los participantes ni del equipo relevado; desarrolla en Windows 11 y en una máquina virtual Ubuntu 26.04; las mediciones de la línea de base se realizan en la máquina virtual Ubuntu.

### Alternativas evaluadas

- **A:** Solo Ubuntu 26.04; contenedor como vía de ejecución de la cátedra (lo que dice IV.1).
- **B:** Solo Ubuntu 26.04, con RNF-06 reformulado («resuelve las rutas de Linux y advierte ante una plataforma no acreditada»); contenedor como vía secundaria.
- **C:** Ubuntu 26.04 como plataforma de referencia y Windows 11 como segunda plataforma declarada; macOS diferida; ejecución nativa como vía principal y contenedor Linux solo para regenerar el oráculo.
- **D (planteada por el autor):** pruebas en contenedores Docker con imágenes de Linux y de Windows, y más adelante de macOS.

### Análisis (trade-offs)

- **A:** el criterio de RNF-06 queda vacío, persiste IV-01 y la comprobación del v1 depende de que la máquina de la cátedra tenga un motor de contenedores.
- **B:** honesta y barata, pero desaprovecha la evidencia relevada en Windows y declararía no acreditada la plataforma en la que se desarrolla.
- **C:** da contenido al criterio de RNF-06, se apoya en evidencia existente y resuelve IV-01 (instalación nativa como vía de uso; contenedor como vía de reproducción). Costos: los ejecutores Windows de GitHub son Windows Server, por lo que Windows 11 se acredita en forma manual; el oráculo completo es Linux, lo que obliga a un contraste reducido en Windows.
- **D** (conocimiento general de ingeniería): los contenedores comparten el núcleo del anfitrión. Un contenedor Windows requiere un anfitrión Windows con Hyper-V en modo de contenedores Windows (Windows 11 Pro o Enterprise); el equipo del autor es Windows 11 Home, donde Docker Desktop ejecuta solo contenedores Linux. Las imágenes Windows son Windows Server Core o Nano Server, no Windows 11. No existen imágenes de macOS utilizables. Se descarta como medio; su objetivo (probar en ambos sistemas) se cubre con C.

**Prioridad de RNF-06.** Se mantiene Should: el relevamiento no registra el sistema operativo de la población, y la naturaleza del producto (lectura de archivos) justifica la existencia del requisito, no su obligatoriedad. La verificación en cada push lo cumple en la práctica sin alterar el recuento de ADR-035.

**Punto débil corregido.** Comparar RIGE en Windows contra un oráculo generado en Linux supone, sin verificarlo, que OpenCode resuelve los mismos valores en ambas plataformas. Esa suposición toca el riesgo principal del proyecto (I.3: que RIGE difiera de OpenCode). Se corrige con un oráculo reducido en Windows.

### Recomendación y fundamento

Recomendación del ingeniero: **C**, con la estrategia de verificación siguiente:

1. **Matriz de CI** en GitHub Actions con `ubuntu-latest` y `windows-latest`: mismas pruebas, mismos escenarios y mismos resultados esperados en cada push.
2. **Aislamiento:** cada prueba opera sobre una copia temporal del escenario, con `HOME`, `USERPROFILE` y `XDG_CONFIG_HOME` apuntando a ella.
3. **Rutas normalizadas:** se comparan relativas a la raíz del escenario y con `/` como separador.
4. **Fines de línea:** `eol=lf` en `.gitattributes` para los escenarios, dado que RIGE informa la línea de cada declaración (R-06).
5. **Corrida manual** al cierre de cada iteración en Windows 11 (equipo del autor) y en la máquina virtual Ubuntu 26.04, registrada en la bitácora.
6. **Oráculo reducido en Windows:** al cierre de cada iteración, los escenarios que ejercitan rutas (directorio personal, ascenso de directorios, `OPENCODE_CONFIG_DIR`, configuración global) se contrastan con OpenCode 1.18.25 ejecutado en Windows, siempre sobre copias (AD-08).
7. **Decisiones de permiso** fuera de la comparación entre plataformas: OpenCode difiere en forma deliberada (mayúsculas, PowerShell).

El detalle de los escenarios, de las pruebas y del archivo de CI corresponde al diseño del v1 y se discute al final, conforme a la regla del autor.

**Precisiones agregadas al aceptar (25/09/2026).**

- **P1 · Rutas: lo que se muestra frente a lo que se compara.**
  - RIGE muestra la ruta absoluta, en el formato del sistema operativo, y la línea de cada declaración. Es lo que el desarrollador o el agente necesitan para abrir el archivo, y la configuración global (`~/.config/opencode`) está fuera del proyecto.
  - Las pruebas, los resultados de referencia versionados (ADR-029) y el criterio de RNF-06 comparan rutas normalizadas a la raíz del escenario, con `/` como separador.
  - El criterio de RF-03 («ruta absoluta y línea») no cambia y no contradice este ADR.
- **P2 · Aislamiento del oráculo (AD-08).**
  - Al arrancar, OpenCode escribe: crea el archivo global, agrega `.gitignore` e instala `@opencode-ai/plugin` (`01-relevamiento/opencode-como-funciona.md`, §3). Por eso cada ejecución del oráculo usa una copia descartable del escenario, y RIGE se ejecuta siempre sobre otra copia limpia, nunca sobre una que OpenCode haya tocado.
  - En Windows, el directorio `state` no se redirige con `HOME` y sigue apuntando a `%APPDATA%\ai.opencode.desktop\opencode` (misma fuente, línea 85). Windows Sandbox no está disponible en Windows 11 Home (conocimiento general). Por eso el oráculo en Windows se ejecuta con una **cuenta local de Windows dedicada**, verificada con `opencode debug paths` antes de cada corrida.
- **P3 · Horas: RNF-06 sigue siendo Should.** Los Should no reciben horas (V.4, línea 49), así que la estrategia se reparte así:
  - **Matriz de CI** con Ubuntu y Windows (puntos 1 a 4): desde la iteración 1, en cada push. Cuesta casi nada y protege la comprobación del v1 si la cátedra la hace en Windows (suposición: escenario probable).
  - **Corrida manual y oráculo reducido en Windows** (puntos 5 y 6): una sola vez, en la iteración 4, con cargo a las 17 h de estabilización, y no al cierre de cada iteración. Si la contingencia recorta la estabilización (ADR-042), se cae la acreditación de Windows y no un Must.

**Condición que invalidaría la decisión:** que el oráculo reducido en Windows muestre diferencias que el presupuesto no absorba, o que la CI en Windows falle de manera sostenida por diferencias de plataforma que no se resuelvan dentro de las horas de la tarea afectada. En ambos casos se pasa a B y Windows se declara no acreditado, con su fundamento. También la invalida que la cátedra compruebe el v1 en Windows y falle: en ese caso Windows pasa a condición de la entrega y RNF-06 sube a Must con horas asignadas.

### Decisión del autor

**Aceptado por el autor el 25/09/2026: alternativa C, con la estrategia de verificación recomendada y las precisiones P1 a P3.**

### Consecuencias

Se aplican con `/corregir` en la pasada por cada capítulo (grupo C):

- **RNF-06** (`03-requisitos/libro/catalogo/RNF-06.md` y Anexo I):
  - Enunciado: acotarlo a las entradas de la frontera individual y a las plataformas declaradas.
  - Criterio: sobre el mismo escenario ejecutado en Ubuntu 26.04 y en Windows 11, el conjunto de entradas descubiertas y los valores efectivos coinciden, con las rutas comparadas en forma relativa a la raíz del escenario; los valores de los escenarios de rutas coinciden además con los de OpenCode 1.18.25 ejecutado en Windows 11. Las decisiones de permiso quedan fuera de esta comparación.
  - **Instalación sin privilegios** (agregado por el autor el 25/09/2026, pendiente V-03): el enunciado incorpora que RIGE se instala sin privilegios administrativos. El criterio agrega que la instalación, siguiendo el `README.md`, se completa con una cuenta sin privilegios administrativos en ambas plataformas. Así queda expresada como requisito la condición de adopción de IV.3, sin agregar un requisito nuevo.
  - Prioridad Should, iteración y MVP sin cambios. Cierra la parte de RNF-06 de A-04.
- **IV.1:** fila «Canales» de la Tabla 10 y párrafo de la línea 29. La ejecución por terceros, incluida la comprobación del v1, se realiza por instalación nativa sin privilegios; la imagen de contenedor queda como vía de reproducción del oráculo. Ubuntu 26.04 es la plataforma de referencia (mediciones y oráculo), no «el entorno de desarrollo»: el desarrollo se realiza en Windows 11 y en Ubuntu 26.04. Windows 11 es la segunda plataforma declarada y macOS queda sin acreditar en el período. Cierra IV-01 e IV-03.
- **III.5, segunda precisión:** registrar las plataformas fijadas.
- **X.2, recursos físicos:** equipo Windows 11 del autor y máquina virtual Ubuntu 26.04, con sus especificaciones.
- **`.gitattributes`:** `eol=lf` (R-06), necesario para los escenarios.
- **Anexo III:** fila de la decisión cuando se complete AD-04.
- **Diseño del v1** (grupo D): matriz de CI desde la iteración 1 y aislamiento de escenarios (P2).
- **V.4, Tabla 18:** la tarea de estabilización de la iteración 4 incorpora la corrida manual y el oráculo reducido en Windows (P3). Se aplica en `/corregir` de V.4, junto con ADR-042.
- **RF-03:** sin cambio por este ADR (P1).

### Evidencia

`informe/cap-04/IV.1-definicion-negocios.md` (Tabla 10, línea 29); `informe/cap-04/IV.3-analisis-rivalidad-amplificada.md`; `informe/cap-03/III.4-limites-sistema.md`; `informe/cap-03/III.5-catalogo-requisitos.md`; `03-requisitos/libro/catalogo/RNF-06.md`; `01-relevamiento/opencode-como-funciona.md` (§3; líneas 19, 85, 347 y 355); `catedra/AE2-guia-comprobacion-v1.md`; `informe/cap-05/V.4-cronograma.md` (línea 49, Tabla 18); ADR-029, ADR-032, ADR-035, ADR-036 y ADR-042; pendiente AD-08.
