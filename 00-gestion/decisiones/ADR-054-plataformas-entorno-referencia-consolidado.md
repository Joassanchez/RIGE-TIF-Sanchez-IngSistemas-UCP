# ADR-054 — Plataformas y entorno de referencia: Ubuntu 26.04 de referencia, Windows 11 declarada y macOS diferida; instalación nativa para uso y comprobación; una imagen de contenedor común para el oráculo y las mediciones

- Estado: aceptado (28/09/2026)
- Fecha: 28/09/2026
- Capítulos afectados: Cap. III (III.5, RNF-06 y RNF-07); Cap. IV (IV.1, Tabla 10 «Canales» y línea 29); Cap. X (X.2, X.4, X.5); Anexo I (fichas RNF-06 y RNF-07; A.I.7); libro (RNF-06, RNF-07); diseño de la medición y `vm/`; `.gitattributes`; `04-diseno/README.md` §3 (CI)
- Origen: consolidación del 28/09/2026 (pendiente LI-01). No es una decisión nueva: reúne lo vigente de ADR-037 (25/09/2026), ADR-049 y ADR-050 (28/09/2026), todos aceptados.
- Reemplaza: ADR-037, ADR-049 y ADR-050. Sus archivos se eliminaron el 28/09/2026 (quedan en el historial de git).
- Relacionado: ADR-029 (oráculo), ADR-032 (stack), ADR-053 (medición con agentes), ADR-055 (RNF-07 usa este entorno como equipo de referencia).

### Contexto

**Equipo del autor**, medido el 28/09/2026:
- Anfitrión: Windows 11 Home Single Language 10.0.26200, con un Intel Core i7-1355U (10 núcleos, 12 hilos) y 16 GB de memoria.
- Entorno Linux: Ubuntu 26.04 LTS sobre **WSL 2** (2.7.10.0, núcleo de Microsoft 6.18.33.2), no una «máquina virtual».
- Docker Desktop 4.90.0 instalado, cuyos contenedores corren en la máquina virtual de WSL 2 de Docker.
- Windows 11 Home no ofrece Hyper-V para máquinas completas.

**Otros datos que condicionan la decisión:**
- **Plataformas relevadas.** El relevamiento se hizo en Windows 11 y en Ubuntu. La referente programa en Windows (acta del 26/09/2026, L-11).
- **Diferencias entre plataformas** dentro de la frontera individual:
  - directorio personal y separadores de ruta;
  - patrones sin distinción de mayúsculas en Windows;
  - `bash`, que en Windows ejecuta PowerShell;
  - el directorio `state`, que en Windows no se redirige con `HOME`.
- **Comprobación del v1.** La cátedra clona en una máquina limpia e instala con el comando del README; la guía no menciona contenedores. IV.3 exige instalación sin privilegios administrativos.
- **Escrituras de OpenCode.** Al arrancar, OpenCode escribe: crea el archivo global, agrega `.gitignore` e instala `@opencode-ai/plugin` (AD-08).
- **Aislamiento de la medición.** La regla 1 del diseño de la medición exige que la hoja de respuestas no entre al entorno del ejecutor.

**Cómo se llegó:**

| Paso | ADR | Qué fijó | Qué cambió después |
|---|---|---|---|
| 1 | 037 | Ubuntu de referencia, Windows declarada, macOS diferida; nativa para uso y comprobación; contenedor solo para el oráculo | 050 amplió el contenedor a las mediciones |
| 2 | 049 | «Máquina virtual» = WSL 2; distribución WSL dedicada sin montaje ni interoperabilidad; `.wslconfig` | 050 reemplazó la distribución dedicada por el contenedor; quedan el `.wslconfig` y la terminología |
| 3 | 050 | Imagen de contenedor común para el oráculo, la medición con agentes y RNF-07 | — |

### Alternativas evaluadas

**Eje 1 · Plataformas de RNF-06**
- **A:** Solo Ubuntu, con el contenedor como vía de la cátedra.
- **B:** Solo Ubuntu, con RNF-06 reformulado.
- **C:** Ubuntu de referencia, Windows 11 declarada y macOS diferida; instalación nativa.
- **D:** Contenedores de Linux, Windows y macOS.

**Eje 2 · Entorno Linux de las mediciones**
- **E-A:** La distribución WSL actual, con los valores por defecto.
- **E-B:** Una distribución WSL dedicada, sin montaje ni interoperabilidad.
- **E-C:** Una máquina virtual completa (VirtualBox u otra).
- **E-D:** Una imagen de contenedor común para el oráculo, la medición con agentes y RNF-07.
- **E-D':** Contenedor para el oráculo y la medición con agentes, y distribución WSL para RNF-07.

### Análisis (trade-offs)

- **A:** deja vacío el criterio de RNF-06 y hace depender la comprobación del v1 de que la cátedra tenga un motor de contenedores.
- **B:** desaprovecha la evidencia relevada en Windows.
- **C:** da contenido al criterio y se apoya en evidencia existente. Sus costos:
  - Windows 11 se acredita a mano, porque los ejecutores de GitHub son Windows Server;
  - el oráculo completo es Linux, así que en Windows solo hay un oráculo reducido.
- **D:** descartada por el medio (conocimiento general). Los contenedores Windows requieren Windows Pro o Enterprise con Hyper-V, sus imágenes son de Windows Server y no existen imágenes de macOS utilizables.
- **E-A:** con el montaje automático, la hoja de respuestas es legible en `/mnt/c`, y la interoperabilidad abre una salida hacia Windows. La regla 1 no se cumple por construcción.
- **E-B:** el aislamiento depende de la configuración y de que nadie sea root. Además solo se reproduce en Windows.
- **E-C:** en este equipo corre sobre la interfaz del hipervisor de Windows, con una capa que penaliza la E/S y sesga RNF-07 frente a Windows. Evitarla obliga a desactivar la plataforma de virtualización, lo que rompe WSL 2 y Docker Desktop.
- **E-D:**
  - Sin `--privileged`, sin el socket de Docker y sin carpetas montadas del anfitrión, la hoja no es alcanzable aun siendo root.
  - El `Dockerfile` es versionado y declara todo: base fijada por su resumen y OpenCode verificado por SHA-256.
  - La misma imagen corre en el equipo del autor, en GitHub Actions y en cualquier motor de contenedores, así que la medición se puede repetir ante el tribunal.
- **E-D':** mantiene dos entornos Linux sin ganar fidelidad, porque ambos corren el núcleo de Microsoft.

### Recomendación y fundamento

**C + E-D**, con el `.wslconfig` de ADR-049. Es lo que el autor aceptó entre el 25/09 y el 28/09/2026; este registro no cambia ninguna decisión.

**Condiciones de validez**, que se verifican en la fase 1 de la medición y se declaran como pendientes hasta entonces:
- los scripts de `vm/` corren en la imagen sin systemd;
- dentro del contenedor no hay rutas del anfitrión, ni socket de Docker, ni `--privileged`;
- la hoja de respuestas no es alcanzable;
- el ejecutor y `participante` no son root.

**Condiciones que invalidarían la decisión:**
1. **OpenCode no puede operar como ejecutor dentro del contenedor**, o los scripts dependen de systemd o PAM de un modo que el contenedor no reproduce. La medición con agentes vuelve a la distribución WSL dedicada (E-B) y el oráculo sigue en el contenedor.
2. **Windows no se sostiene dentro de las horas.** El oráculo reducido en Windows muestra diferencias que el presupuesto no absorbe, o la CI en Windows falla de forma sostenida. Se pasa a B y Windows se declara no acreditado.
3. **La cátedra comprueba el v1 en Windows y falla.** Windows pasa a condición de entrega y RNF-06 sube a Must, con horas.

### Decisión del autor

**Aceptado por el autor el 28/09/2026** (consolidación). Las decisiones de fondo ya están aceptadas:
- ADR-037, alternativa C con P1 a P3, el 25/09/2026;
- ADR-049, alternativa B, el 28/09/2026;
- ADR-050, alternativa D, el 28/09/2026.

La aceptación de este registro solo autoriza la consolidación.

### Consecuencias

**Papel de cada entorno:**

| Uso | Entorno |
|---|---|
| Uso de RIGE y comprobación del v1 por la cátedra | Instalación nativa, sin privilegios administrativos (Ubuntu o Windows 11) |
| Acreditación de la instalación nativa en Ubuntu | Ejecutor Linux de GitHub Actions, en limpio en cada corrida. `[DATO PENDIENTE: que GitHub ofrezca Ubuntu 26.04; si no, se declara la versión disponible]` |
| Oráculo (ADR-029) | Contenedor: `docker run --network none --rm`, sobre una copia descartable del escenario |
| Medición con agentes (ADR-053) | Contenedor, con salida a la API. La credencial se pasa como variable de entorno y nunca va en la imagen. La evidencia sale por una carpeta vacía montada o por `docker cp`. Nunca se monta el repositorio |
| RNF-07 (ADR-055) | Contenedor, con el proyecto sintético dentro de la imagen o de un volumen, nunca en una carpeta de Windows |
| Desarrollo | Windows 11 y la distribución `Ubuntu` de WSL, sin cambios |

**Recursos:** `.wslconfig` con `memory=8GB` y `processors=12`. Rige la máquina virtual de Docker. Windows compite por los recursos durante la medición, y se declara.

**Verificación de RNF-06 (P1 a P3 de ADR-037):**
1. **Matriz de CI** con `ubuntu-latest` y `windows-latest` en cada push, desde la iteración 1.
2. **Aislamiento de las pruebas:** cada una opera sobre una copia del escenario, con `HOME`, `USERPROFILE` y `XDG_CONFIG_HOME` apuntando a ella.
3. **Rutas:** RIGE muestra la ruta absoluta en el formato del sistema operativo. Las pruebas, los resultados de referencia y el criterio comparan rutas relativas a la raíz del escenario, con `/`.
4. **Fines de línea:** `.gitattributes` con `eol=lf` para los escenarios (R-06).
5. **Iteración 4:** una corrida manual y un oráculo reducido en Windows, para los escenarios de rutas. Se hace una sola vez, con cargo a la estabilización. En Windows el oráculo se ejecuta con una cuenta local dedicada, verificada con `opencode debug paths`.
6. **Permisos:** las decisiones de permiso quedan fuera de la comparación entre plataformas, porque OpenCode difiere en forma deliberada.

**RNF-06 (Should):**
- Sobre el mismo escenario en Ubuntu 26.04 y en Windows 11, las entradas descubiertas y los valores efectivos coinciden, con las rutas relativas.
- Los escenarios de rutas coinciden además con OpenCode 1.18.25 en Windows.
- La instalación, siguiendo el README, se completa sin privilegios administrativos en ambas plataformas.

**`vm/` y diseño de la medición (AD-26):**
- `Dockerfile` con la base fijada por su resumen, OpenCode verificado y los usuarios de la medición.
- La regla 1 pasa a decir «nunca entra a la imagen ni al contenedor».
- Las fases 1, 6 y 8 se reescriben con `docker run`.

**Terminología:** «Ubuntu 26.04 LTS sobre WSL 2» o «contenedor Ubuntu 26.04», nunca «máquina virtual».

**Informe:**
- X.2 declara el anfitrión, WSL 2, Docker Desktop y los recursos.
- X.4 incorpora Docker Desktop y la imagen base.
- X.5 incorpora la licencia de Docker Desktop (`docker2026ssa`).
- Hay que transcribir la diferencia con la VM completa: WSL 2 y Docker corren como partición hermana de Windows sobre el hipervisor.
- «Reproducible» se refiere al entorno, no al resultado, porque los modelos no son deterministas.

**Anexo III:** sin cambios. D-27 y D-47 siguen siendo la deliberación del informe.

**Al aceptarse:**
- eliminar ADR-037, 049 y 050;
- en `INDICE.md` y `04-diseno/README.md`, reemplazar las filas de 037 por esta;
- en `pendientes.md` (AD-26, R-08), cambiar las menciones por ADR-054.

### Evidencia

- Mediciones del equipo del 28/09/2026 (PV-01)
- `01-relevamiento/opencode/como-funciona.md` (§3; líneas 19, 85, 347 y 355)
- `01-relevamiento/linea-base/DISENO-medicion-agentes.md` (§2, regla 1; fases 1, 6 y 8)
- `catedra/AE2-guia-comprobacion-v1.md`
- `informe/cap-04/IV.1-definicion-negocios.md` y `IV.3-analisis-rivalidad-amplificada.md`
- `03-requisitos/libro/catalogo/RNF-06.md`
- Anexo III, D-27 y D-47
- Historial de git: ADR-037, 049 y 050
