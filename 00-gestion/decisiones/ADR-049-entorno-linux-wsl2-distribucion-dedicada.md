# ADR-049 — Entorno Linux de referencia y de medición: Ubuntu 26.04 sobre WSL 2, en una distribución dedicada sin montaje automático de Windows ni interoperabilidad, con recursos fijados

- Estado: aceptado (28/09/2026), alternativa B; **reemplazado parcialmente por ADR-050** (28/09/2026): la medición con agentes y RNF-07 pasan a una imagen de contenedor común; se conservan el `.wslconfig` y la precisión terminológica
- Fecha: 28/09/2026
- Capítulos afectados: Cap. X (X.2, X.4); Cap. III (III.5, RNF-07); Anexo I (ficha RNF-07; A.I.7, entorno de la medición); libro (RNF-07); diseño de la medición (`01-relevamiento/linea-base/DISENO-medicion-agentes.md`, §2 y fases 1 y 8; `vm/instalar.sh`); oráculo (ADR-029, ADR-037 P2)
- Origen: pasada de especificaciones PV-01 (28/09/2026). El ingeniero midió el equipo y encontró que la «máquina virtual Ubuntu 26.04» de los ADR es una distribución de WSL 2.
- Relacionado: precisa ADR-037, ADR-044 y ADR-045 (el término «máquina virtual» pasa a «Ubuntu 26.04 LTS sobre WSL 2»; sus decisiones no cambian); protege la regla 1 del diseño de la medición aceptado con ADR-040

### Contexto

Datos medidos el 28/09/2026 con consultas del sistema sobre el equipo del autor (PV-01):

- El anfitrión es Windows 11 Home Single Language 10.0.26200, con un Intel Core i7-1355U (10 núcleos, 12 hilos) y 16 GB de memoria.
- El entorno Linux es la distribución `Ubuntu` de **WSL 2** (WSL 2.7.10.0), con espacio de usuario Ubuntu 26.04 LTS y **núcleo de Microsoft** 6.18.33.2-microsoft-standard-WSL2.
- No existe `.wslconfig`, así que rigen los valores por defecto: 12 procesadores lógicos y 7,6 GiB de memoria, la mitad de la física.
- Existe también la distribución `docker-desktop`, de modo que Docker Desktop está instalado.
- Windows 11 Home no dispone de Hyper-V como gestor de máquinas virtuales completas. WSL 2 usa la «Plataforma de máquina virtual», que sí está disponible (conocimiento general).

Conocimiento general sobre el comportamiento de WSL 2 por defecto:

- **Montaje automático.** Las unidades de Windows se montan en `/mnt/c`, legibles para cualquier usuario de la distribución según los permisos de Windows del usuario anfitrión.
- **Interoperabilidad.** Desde Linux pueden ejecutarse programas de Windows (`powershell.exe`, `cmd.exe`).
- **Memoria y procesadores.** Se asignan de forma dinámica hasta el límite por defecto, que puede cambiar con una actualización de WSL.
- **Rendimiento de archivos.** El acceso a archivos en `/mnt/c` es mucho más lento que en el sistema de archivos propio de la distribución.

Consecuencias sobre decisiones aceptadas:

- **Regla 1 del diseño de la medición (ADR-040):** «La hoja de respuestas nunca entra a la VM». La hoja vive en el repositorio, bajo `C:\Users\Joa\Documents\...`. Con el montaje automático, el ejecutor puede leerla en `/mnt/c/.../respuestas.md`. La regla hoy **no se cumple por construcción**, sino solo porque el agente no busca ahí. Además, la interoperabilidad abre una salida hacia Windows que el `deny` de `webfetch` y `websearch` no cubre.
- **RNF-07 (ADR-044 y ADR-045):** el equipo de referencia tiene recursos que dependen de valores por defecto. Si el proyecto sintético se ubica en `/mnt/c`, la medición mide el puente de archivos entre sistemas y no a RIGE.
- **Oráculo (ADR-037, P2):** OpenCode escribe al arrancar (AD-08). Dentro de la distribución lo hace en el directorio del usuario Linux, pero con el montaje activo la ejecución también ve la configuración de OpenCode del usuario de Windows, si existe.

### Alternativas evaluadas

- **A:** Usar la distribución actual tal como está, con los valores por defecto, y corregir solo la terminología.
- **B:** Mantener WSL 2, pero con una **distribución dedicada** a la medición y al oráculo, importada desde una imagen limpia de Ubuntu 26.04 (`wsl --import`). Su `/etc/wsl.conf` desactiva el montaje automático (`[automount] enabled=false`) y la interoperabilidad (`[interop] enabled=false`, `appendWindowsPath=false`). Un `.wslconfig` fija la memoria y los procesadores. Los escenarios y el proyecto sintético residen en el sistema de archivos de la distribución. La distribución de desarrollo actual queda como está.
- **C:** Una máquina virtual completa (VirtualBox u otra) con Ubuntu 26.04.

### Análisis (trade-offs)

- **A** deja la regla 1 del diseño aceptado sin garantía. Un agente capaz, con `bash` habilitado en varios casos, puede recorrer el disco; si lee la hoja, la ejecución no mide nada y no hay forma de detectarlo salvo por la traza. Además, el equipo de referencia de RNF-07 no es reproducible. Se descarta.
- **B** restituye la regla 1 por construcción: sin montaje, la hoja no existe dentro de la distribución. La interoperabilidad deshabilitada cierra la vía hacia Windows. Otras ventajas:
  - `wsl --export` e `--import` dan una copia descartable por tanda, que sirve también a las «copias descartables» del oráculo (ADR-037, P2);
  - conserva la comparabilidad con Windows 11 que ADR-045 buscaba, porque el hardware es el mismo;
  - no requiere instalar nada nuevo.

  Costos: la corrección, que vive fuera, recibe las salidas por `wsl --export` o por una carpeta de intercambio de un solo sentido, copiadas desde Windows con `\\wsl$\`; hay que adaptar `instalar.sh` y la guía; y el núcleo sigue siendo el de Microsoft, lo que se declara.
- **C** (analizada por corrección técnica y no por horas, a pedido del autor, 28/09/2026). Tiene dos ventajas reales:
  - **Aislamiento por defecto:** la frontera con el anfitrión existe aunque nadie la configure, e incluso root dentro de la VM no llega al disco de Windows si no hay carpetas compartidas. En B, el aislamiento es por configuración, y root dentro de la distribución podría volver a montar la unidad (`mount -t drvfs`).
  - **Núcleo propio de Ubuntu 26.04.**

  Y tiene dos desventajas que no se resuelven con más horas, porque vienen de la plataforma:
  - **Medición distorsionada.** En este equipo, WSL 2 y Docker Desktop mantienen activo el hipervisor de Windows, y Windows 11 Home no ofrece Hyper-V para máquinas completas. Una VM de VirtualBox o VMware corre entonces sobre la API del hipervisor de Windows, con una capa adicional que penaliza sobre todo la E/S (conocimiento general; magnitud no medida). RNF-07 mide tiempos de lectura de archivos. Esa capa entra en el resultado de Ubuntu y no en el de Windows, y sesga la comparación por etapas de ADR-045, que se eligió precisamente porque ambas plataformas compartían hardware en condiciones equivalentes. WSL 2 corre directamente sobre el hipervisor, como partición hermana de Windows.
  - **Incompatibilidad con el oráculo.** Evitar esa capa exige desactivar la plataforma de virtualización de Windows, y eso deshabilita WSL 2 y, con él, Docker Desktop, que en Windows 11 Home depende de WSL 2 y es el motor del contenedor del oráculo (ADR-037). La VM y el oráculo no pueden coexistir en condiciones óptimas.

  **Ponderación.** La ventaja de C en aislamiento se neutraliza en B con una condición verificable: el ejecutor no obtiene privilegios de root. El diseño de la medición ya lo cumple, porque la regla `sudoers` del evaluador solo permite `participante`. En cambio, la desventaja de C en la medición no se neutraliza sin romper el oráculo. La diferencia de núcleo no afecta lo que RIGE hace (leer archivos y resolver reglas en espacio de usuario) y se declara.

### Recomendación y fundamento

**B.** Es la única alternativa que hace cumplir por construcción la regla 1 de la medición, sin cambiar de hardware ni de herramienta. Los valores propuestos para `.wslconfig` son `memory=8GB` y `processors=12`: los mismos de hoy, pero declarados y estables.

La terminología se corrige en todos los textos: «Ubuntu 26.04 LTS sobre WSL 2 (núcleo de Microsoft)» en lugar de «máquina virtual Ubuntu 26.04».

**Condición de validez que se verifica en la fase 1:** dentro de la distribución dedicada, `/mnt/c` no existe, `powershell.exe` no se ejecuta, no hay enlaces al perfil de Windows (como los `~/.aws` y `~/.azure` que dejó la integración de Docker en la distribución de desarrollo) y ni `evaluador` ni `participante` obtienen root. La distribución dedicada no se integra con Docker Desktop.

**Condición que invalidaría la recomendación:** que el diseño de la medición deba dar root al ejecutor; que alguna verificación de la fase 2 del diseño de la medición dependa de una característica del núcleo de Ubuntu que el núcleo de WSL no reproduce, o que la cátedra exija el núcleo de la distribución. En ese caso se reevalúa C.

### Decisión del autor

**Aceptado por el autor el 28/09/2026: alternativa B**, después de revisar el análisis de C por corrección técnica y no por horas. Valores de `.wslconfig`: `memory=8GB`, `processors=12`. La distribución de desarrollo `Ubuntu` no cambia.

### Consecuencias

**Si se acepta:**
- `vm/instalar.sh` y la guía de la fase 1 incorporan la creación de la distribución dedicada, `wsl.conf` y la verificación de que `/mnt/c` no existe y de que `powershell.exe` no se ejecuta. Esa verificación se agrega al criterio de salida de la fase 1.
- Ficha de RNF-07, Anexo I, ADR-044 y ADR-045: el equipo de referencia pasa a ser la distribución dedicada, con el `.wslconfig` declarado. La medición se hace sobre archivos del sistema de archivos de la distribución.
- X.2 declara el anfitrión, WSL 2 con su versión, la configuración de recursos y la sobrecarga de la virtualización. X.4 incorpora WSL 2 y Docker Desktop, este último si se confirma como motor del contenedor del oráculo.
- El entorno de desarrollo (la distribución `Ubuntu` actual) no cambia.

### Evidencia

Mediciones del 28/09/2026 (`00-gestion/pendientes.md`, PV-01); `01-relevamiento/linea-base/DISENO-medicion-agentes.md` (§2, regla 1; fases 1 y 8); ADR-037 (P2); ADR-040; ADR-044; ADR-045; `00-gestion/pendientes.md` (AD-08).
