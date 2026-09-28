# ADR-050 — Entorno Linux de referencia: una imagen de contenedor común para el oráculo, la medición con agentes y la medición de RNF-07, ejecutada con Docker Desktop sobre WSL 2

- Estado: aceptado (28/09/2026)
- Fecha: 28/09/2026
- Capítulos afectados: Cap. X (X.2, X.4, X.5); Cap. III (III.5, RNF-07); Anexo I (ficha RNF-07; A.I.7, entorno de la medición); libro (RNF-07); diseño de la medición (`01-relevamiento/linea-base/DISENO-medicion-agentes.md`, §2, §3 y fases 1, 6 y 8; `vm/`); oráculo (ADR-029); canal de integración continua (`04-diseno/README.md`, §3)
- Origen: al responder la pregunta del autor sobre si Docker era la mejor opción para el oráculo (28/09/2026), el ingeniero advirtió que ADR-049 no había evaluado un contenedor para la medición
- Relacionado: **reemplaza parcialmente a ADR-049** (la distribución WSL dedicada deja de ser el entorno de la medición y de RNF-07; se conservan el `.wslconfig` y la precisión terminológica); **amplía ADR-037** (el contenedor, que era «solo para regenerar el oráculo», pasa a alojar también las mediciones; la ejecución nativa sigue siendo la vía de uso y de comprobación del v1, y RNF-06 no cambia); concreta la mitigación de ADR-029 (versión fijada dentro de la imagen); sirve a ADR-040 (medición repetible ante el tribunal)

### Contexto

- ADR-049 (aceptado el 28/09/2026) resolvió el aislamiento de la medición con una distribución WSL dedicada, sin montaje de Windows ni interoperabilidad. Su validez depende de una condición: ni el ejecutor ni `participante` obtienen root, porque root dentro de WSL puede volver a montar la unidad de Windows.
- ADR-049 evaluó WSL tal cual, WSL dedicada y VM completa. **No evaluó un contenedor.**
- ADR-040 prevé que la medición final pueda repetirse ante el tribunal. Una distribución WSL exportada solo se reproduce en Windows.
- ADR-029 y ADR-037 ya prevén un contenedor Linux con OpenCode 1.18.25 fijado para regenerar el oráculo.
- En el equipo del autor está instalado Docker Desktop 4.90.0 (medido el 28/09/2026). En Windows 11 Home, sus contenedores corren en la máquina virtual de WSL 2 de Docker, al mismo nivel del hipervisor que las distribuciones WSL. Los recursos de esa máquina virtual se rigen por el `.wslconfig` global (conocimiento general).

### Alternativas evaluadas

- **B (ADR-049):** distribución WSL dedicada para la medición y RNF-07; contenedor solo para el oráculo.
- **D:** una imagen de contenedor común (Ubuntu 26.04 con OpenCode 1.18.25 fijado) para el oráculo, la medición con agentes y la medición de RNF-07. Cada uso es un `docker run` con opciones propias.
- **D':** contenedor para el oráculo y la medición con agentes, y RNF-07 en la distribución WSL dedicada.

### Análisis (trade-offs)

**Aislamiento de la medición (regla 1 del diseño: la hoja de respuestas no entra al entorno).**
- En **B**, el aislamiento se obtiene por configuración y exige que nadie sea root.
- En **D**, el contenedor no ve el sistema de archivos del anfitrión salvo lo que se monte de forma explícita. Aun siendo root dentro del contenedor, no se llega al disco de Windows si no se usa `--privileged`, no se monta el socket de Docker y no se monta ninguna carpeta del anfitrión (conocimiento general). La regla 1 se cumple por construcción y con menos supuestos que en B.

**Reproducibilidad.**
- En **B**, el entorno es un archivo exportado de WSL: binario, opaco y solo reproducible en Windows.
- En **D**, el `Dockerfile` versionado declara cada paso: la imagen base se fija por su resumen (*digest*) y OpenCode se descarga por URL y se verifica con su resumen SHA-256. La misma imagen corre en el equipo del autor, en los ejecutores Linux de GitHub Actions y en cualquier equipo con un motor de contenedores. Así se cumple la promesa de ADR-040 sobre la repetición ante el tribunal.

**Oráculo.** Es igual en D y en D'. Se ejecuta con `--network none` y `--rm`: sin red, cada regeneración es limpia y las escrituras de OpenCode al arrancar (AD-08) desaparecen con el contenedor.

**Medición con agentes.** El ejecutor necesita salida a la API del proveedor, así que no se corta la red. La detección de accesos web por `bash` en la traza (diseño, §3) se conserva. La credencial se pasa como variable de entorno al ejecutar y nunca se incluye en la imagen. La evidencia sale por una única carpeta de salida montada y vacía, o por `docker cp` al terminar. **Nunca se monta el repositorio.**

**RNF-07 (D frente a D').**
- En los dos casos, el entorno Linux corre sobre el mismo hipervisor y el mismo hardware que Windows, así que la comparación por etapas de ADR-045 se mantiene.
- **D** exige que el proyecto sintético resida dentro del contenedor (capa de la imagen o volumen de Docker) y no en una carpeta montada desde Windows, que medirían el puente de archivos.
- **D'** mantiene una segunda distribución solo para esta medición. No aporta fidelidad: ninguna de las dos es un Ubuntu nativo, y ambas corren el núcleo de Microsoft.
- **D** deja un único entorno Linux declarado, en lugar de dos. Se elige D.

**Costos y riesgos.**
- **Suposición a verificar:** que los scripts de `vm/` (usuarios, regla `sudoers`, `sudo -u participante -i`) funcionen sin systemd dentro del contenedor. Ninguno de sus pasos conocidos requiere systemd.
- Docker Desktop requiere privilegios administrativos para instalarse, pero ya está instalado. Solo lo necesita quien reproduzca el oráculo o las mediciones, no quien usa RIGE ni la cátedra al comprobar el v1, que usa la instalación nativa (ADR-037).
- Licencia de Docker Desktop: gratuita para uso personal, educativo y de empresas pequeñas (conocimiento general, a verificar con la fuente). En Linux, Docker Engine es de código abierto.

### Recomendación y fundamento

**D.** Es la única alternativa que cumple la regla 1 de la medición por construcción, sin depender de privilegios, y que hace reproducibles en cualquier sistema el oráculo, la medición con agentes y RNF-07, con una sola definición versionada del entorno.

**Condición de validez, verificada en la fase 1 de la medición:**
- los scripts de `vm/` corren en la imagen;
- dentro del contenedor no hay rutas del anfitrión, ni socket de Docker, ni `--privileged`;
- la hoja de respuestas no es alcanzable;
- el ejecutor y `participante` no son root.

**Condición que invalidaría la decisión:**
- que OpenCode como ejecutor no pueda operar dentro del contenedor (por ejemplo, porque requiera una terminal interactiva que `docker run -t` no resuelve), o
- que los scripts de `vm/` dependan de systemd o de PAM de un modo que el contenedor no reproduce.

En ese caso, la medición con agentes vuelve a la distribución WSL dedicada de ADR-049, y el oráculo queda en el contenedor.

### Decisión del autor

**Aceptado por el autor el 28/09/2026: alternativa D**, sobre la recomendación del ingeniero.

### Consecuencias

- **ADR-049:** reemplazado parcialmente. Se conservan el `.wslconfig` (`memory=8GB`, `processors=12`), que ahora rige la máquina virtual de Docker, y la precisión terminológica. Queda sin efecto la distribución WSL dedicada. La distribución `Ubuntu` de desarrollo no cambia.
- **ADR-037:** el papel del contenedor se amplía del oráculo a las mediciones. La ejecución nativa sigue siendo la vía de uso y de comprobación.
- **`vm/`:** se reorganiza en un `Dockerfile` (instala la base fijada, OpenCode 1.18.25 verificado y los usuarios de la medición) más los scripts de ejecución. Las rutas `/opt/linea-base` se conservan dentro de la imagen.
- **Diseño de la medición:** la regla 1 pasa a decir «nunca entra a la imagen ni al contenedor». Las fases 1, 6 y 8 se reescriben con `docker run`, y el criterio de salida de la fase 1 incorpora la condición de validez.
- **RNF-07:** el equipo de referencia es el contenedor Ubuntu 26.04, sobre Docker Desktop y WSL 2 en el equipo del autor, con el `.wslconfig` declarado y el proyecto sintético dentro del contenedor. Se precisa en la ficha, el Anexo I, ADR-044 y ADR-045.
- **Cap. X:** X.2 declara el anfitrión, WSL 2, Docker Desktop y los recursos. X.4 incorpora Docker Desktop (licencia y versión) y la imagen base. X.5 incorpora la licencia de Docker Desktop entre las licencias de terceros.
- **CI:** la regeneración del oráculo puede ejecutarse en GitHub Actions con la misma imagen. Se define con el diseño del v1 (`04-diseno/README.md`, §3).

### Evidencia

ADR-029; ADR-037; ADR-040; ADR-044; ADR-045; ADR-049; `01-relevamiento/linea-base/DISENO-medicion-agentes.md` (§2, §3; `como-dev` y regla `sudoers`); mediciones del equipo del 28/09/2026 (`00-gestion/pendientes.md`, PV-01).

### Precisiones (28/09/2026, revisión del Cap. X, R-14, aceptadas por el autor)

- **Arranque dual con Ubuntu nativo: descartado.** La instalación nativa en Ubuntu (RNF-06) no se acredita en el equipo del autor, sino en el ejecutor Linux de GitHub Actions, que instala en limpio en cada corrida. `[DATO PENDIENTE: verificar que GitHub ofrezca un ejecutor con Ubuntu 26.04; si no lo ofrece, se declara la versión disponible]`. El arranque dual no agrega esa acreditación y exige reparticionar el disco del único equipo.
- **Diferencia con la VM completa**, a transcribir en el informe: WSL 2 y los contenedores de Docker Desktop corren como partición hermana de Windows sobre el hipervisor. VirtualBox o VMware corren sobre la interfaz del hipervisor de Windows, con una capa adicional.
- **Alcance de «reproducible»:** se reproduce el entorno, no el resultado. Los modelos del proveedor no son deterministas y pueden retirarse.
- **La condición de validez sigue pendiente** hasta la fase 1 de la medición y se declara así en el informe.

Anexo III: D-47.
