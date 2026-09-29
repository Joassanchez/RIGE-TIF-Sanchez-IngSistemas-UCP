# Pendientes

Solo tareas abiertas, con lo que falta. Los ítems cerrados se eliminan (el historial queda en git y en la bitácora). Se conservan los identificadores anteriores para no romper remisiones. Las correcciones del AE1 están detalladas en `00-gestion/ventana-ae1.md`.

Severidad: **B** bloqueante · **I** importante · **M** menor.

## 1. Entrega de la AE2

| # | Pendiente | Sev. |
|---|---|---|
| U-02 | **Cap. X.** Falta: `[DATO PENDIENTE]` de lugar de trabajo, fecha de carga del saldo de API y ejecutor de CI con Ubuntu 26.04; `[DECISIÓN PENDIENTE]` de versión de TypeScript y de verificación de RNF-03 (diseño del v1); aprobación del autor. | B |
| U-03 | **Instrumentos.** 32 (lienzo) y 33 (rivalidad): plantillas vacías. 34: completo, con tres marcas (lugar de trabajo, fecha de carga del saldo, versión de TypeScript); estado a asignar por el autor. 35: al cerrar la etiqueta `v1`, con la prueba de clonado hecha por un compañero en su equipo siguiendo solo el README (quién, en qué equipo y con qué resultado). | B |
| U-03b | **Libro de trabajo.** El exportador no carga la cláusula de contingencia de la hoja «Iteraciones» (B26 y B27): tomarla de la Tabla 19 de V.4. El libro se genera una sola vez, completo, en `03-requisitos/` (decisión del autor). | B |
| U-04 | **Constancia de validación.** Guardar en `01-relevamiento/validacion/` el acta firmada o el correo de conformidad de la referente. No se escribe «firmado» ni «conforme» hasta entonces. | B |
| U-05 | **Tablero y repositorio.** Enlace al tablero organizado por las iteraciones del Cap. V; completar `tablero` y `repositorio` en `informe/datos-autor.yaml`. | I |
| AD-28 | **Acceso al repositorio (acción del autor).** Pasar el repositorio de GitHub a privado y agregar la cuenta del docente como colaboradora (Guía AE2 §2.3). Se publica bajo MIT después de la aprobación. | B |
| G-01 | **Marcadores residuales** (`armar.py` bloquea la entrega). Quedan 5 en los Caps. III a V: `\[enlace\]`, `\[estado\]` y `\[fecha\]` en V.5 (dependen de U-01) y dos `[DATO PENDIENTE]` en RNF-07 del Anexo I (PV-01, PV-02). | B |
| PV-01 | **RNF-07 · equipo de referencia.** Construir la imagen de ADR-054 y registrar su resumen; precisar «máquina virtual» como «contenedor Ubuntu 26.04 sobre Docker Desktop y WSL 2» en la ficha de RNF-07 y el Anexo I. Datos del anfitrión ya relevados: Samsung Galaxy Book3 (750XFG), Intel Core i7-1355U (10 núcleos, 12 hilos), 16 GB, SSD NVMe 512 GB, Windows 11 Home 10.0.26200. | I |
| PV-02 | **RNF-07 · proyecto público.** Búsqueda con el criterio de ADR-055 (búsqueda de código de GitHub, fecha, repositorio con más agentes que resuelva con OpenCode 1.18.25), recuentos y alta con `/fuente`. | I |
| IV-05 | **IV.1, Tabla 10, fila «Canales»:** dice «Repositorio público con versiones publicadas», en contradicción con X.4 y el Instrumento 34 (repositorio privado con el docente como colaborador, publicado bajo MIT tras la aprobación; ADR-057). Corregir con `/corregir` sobre IV.1, precisando que la publicación es posterior a la aprobación del TIF. IV.1 vuelve a «borrador». | I |
| M-09 | Revisar la legibilidad de la Figura 3 en el `.docx`. | M |

## 2. Prototipo v1

| # | Pendiente | Sev. |
|---|---|---|
| U-01 | **Prototipo v1 ejecutable** (cierre de la iteración 1): caso de uso vertical, README de ocho secciones, CI con corrida exitosa y etiqueta `v1` publicada. `src/` solo tiene `README.md` y `AGENTS.md`. El diseño se discute antes de implementar. | B |
| R-08 | `04-diseno/README.md`: completar las secciones 2 (esquema SQLite) y 3 (canal de CI, `.github/workflows/ci.yml`, con la matriz de plataformas de ADR-054). | I |
| R-06 | Agregar `.gitattributes` (`* text=auto eol=lf`): lo exigen los escenarios de prueba (posición por línea, ADR-054). | I |
| R-07 | Nombre del repositorio «TIF» frente a «PIF» de la consigna; resolver antes de la etiqueta `v1`. | M |
| AR-00 | **ADR-058 (arquitectura) propuesto** el 29/09/2026: aceptarlo con `/aceptar ADR-058`; luego actualizar `src/AGENTS.md` (referencia, reglas de dependencia, falla visible, contrato de salida; lo edita el autor). | I |
| AR-07 | **ADR-059 y ADR-064 aceptados y propagados el 29/09/2026** (libro; informe III.2 a III.5, V.1, V.2, V.4, V.5, X.1, Anexo I; Instrumento 34; ADR-052; Ventana del AE1; `tools/figura_cronograma.py`; revisiones `20260929_propagacion-ADR-059*.md`, P-01 a P-36). **Falta:** (1) reemplazar `informe/figuras/cap-05/figura-cronograma-gantt.png` por la versión regenerada (el script no sobrescribe; la nueva se genera con `--destino`); (2) informar a la referente la revisión parcial de L-06 y RF-12, RF-14, RF-16, RNF-09 y RNF-10 (vía PV-03); (3) observaciones abiertas de los redactores: V.4, el exceso de la iteración 1 (7 h) se arrastra a la 2, que ya excede en 1 h (el argumento de compensación en cascada no está escrito); Tabla 19, orden 7 deja 1 h de estabilización en el peor caso (costo declarado en ADR-064, pregunta probable del tribunal); V.5, el párrafo del v1 no menciona RNF-09; III.4, «confirmadas sin observaciones» convive con la revisión posterior de L-06. | I |
| AR-08 | Verificar para ADR-059: V-1 (¿el criterio de RF-10 exige una sesión con modelo o existe oráculo local?); V-2 (¿RF-07 cubre la advertencia de I.6.4 por variable no definida en el proceso de RIGE?); dato pendiente de RF-16 (comando nativo que lista agentes en 1.18.25). RF-16 se trazó a H-18, cuya verificación propia (iteración 2) condiciona la identificación de los agentes nativos. | I |
| AR-09 | **CLAUDE.md, §5 (lo edita el autor):** agregar `03-requisitos/libro/` e `instrumentos/` a los lugares donde escribe el ingeniero o el redactor. El 29/09/2026 el autor autorizó de manera puntual escribir en el libro y en el Instrumento 34. | M |
| AR-01 | **ADR-060 · contrato del adaptador y modelo del rastro**, sobre el modelo revisado de ADR-059 (resolución genérica y proyección por agente; adaptador ficticio de RNF-03) y con los puntos de medición por etapas (ADR-055). Discutir antes de escribir código del núcleo. | I |
| AR-02 | **ADR-061 · ciclo de vida de la Resolución y modelo de datos SQLite** (identidad del Proyecto, retención). Cierra la sección 2 de R-08. | I |
| AR-03 | **ADR-062 · distribución, web y dependencias:** `bun run` o ejecutable único; web con HTML del servidor o JSON por ruta interna; política de dependencias; `.env.example`; versionado de RIGE, del esquema de salida y del de base. | I |
| AR-04 | **ADR-063 · pruebas metamórficas** de la procedencia contra el oráculo, como complemento de ADR-029. | I |
| AR-05 | **Verificar sobre el tag 1.18.25:** lector de JSONC que usa OpenCode (¿`jsonc-parser`?) y unidad de columna; variables de entorno que aportan configuración (`OPENCODE_CONFIG`, `OPENCODE_CONFIG_DIR`, `OPENCODE_CONFIG_CONTENT`). Suposiciones de ADR-058. | I |
| AR-06 | Decidir antes de la iteración 3: detección de la versión instalada sin ejecutar OpenCode (RF-05 frente a la Tabla 9 de I.6) y forma de informar un valor efectivo que proviene de una sustitución de entorno (RNF-04). | M |

## 3. Medición de la línea de base (ADR-053; ventana del 02/10 al 16/10)

| # | Pendiente | Sev. |
|---|---|---|
| AD-19 | Construir y ejecutar según `01-relevamiento/linea-base/DISENO-medicion-agentes.md` (fases 0 a 7; piloto → k, tiempo límite y costo). Registrar las horas reales en la bitácora. | B |
| AD-26 | Aplicar ADR-054 antes de la fase 1: `Dockerfile` con la base fijada por su resumen, OpenCode 1.18.25 verificado por SHA-256 y usuarios de la medición; reorganizar `vm/`; reescribir la regla 1 y las fases 1, 6 y 8 del diseño con `docker run`; verificar la condición de validez (sin rutas del anfitrión, sin socket, sin `--privileged`, ejecutor no root, scripts sin systemd); crear `.wslconfig` (`memory=8GB`, `processors=12`). | B |
| AD-25 | Incorporar al diseño de la medición el tope de API (USD 50, carga inicial de USD 20 para el piloto) y la regla de recorte de ADR-057, antes del piloto. Falta la fecha de carga. | I |
| AD-17 | Recibir el archivo del agente de la referente (confirmado en la sesión del 26/09; no recibido): consentimiento, limpieza y alta en `01-relevamiento/fuentes.md`. | I |
| AD-18 | Revisar la encuesta de práctica (`01-relevamiento/linea-base/borrador-encuesta-practica.md`), traducirla al inglés y difundirla antes del 02/10. | I |
| AD-20 | `01-relevamiento/linea-base/`: reemplazar `antecedente-diseno-personas-v0.3.md` por la v0.3 real; reescribir en forma impersonal la síntesis del laboratorio que vaya al Anexo I y subir sus evidencias; declarar la herramienta auxiliar. | I |

## 4. Sistema de trabajo y fuentes

| # | Pendiente | Sev. |
|---|---|---|
| LI-01 | **Consolidación de ADR: cerrada el 28/09/2026** (ADR-051 a ADR-057 aceptados; ADR-031 y 043 pasados a `diseno-sistema-agentes.md` §2). **Falta:** (1) borrar los archivos absorbidos (comando en la sesión del 28/09/2026); (2) el autor cambia las menciones a números viejos en `src/AGENTS.md` (ADR-006 → D-06, 021 y 022 → 051), `.claude/commands/aceptar.md` y `decidir.md` (ADR-043 → D-23 del diseño del sistema) y los comentarios de `tools/figura_cronograma.py` (046 y 047 → 052). Las menciones en otros ADR y en la bitácora se leen con la tabla de equivalencias de `INDICE.md`. | M |
| AD-24 | **Declaración de herramientas en la bitácora.** Resolver la tensión con el preámbulo, que declara fuera de la asistencia «el diseño de los instrumentos» y «las decisiones metodológicas y de diseño». Declarar con herramienta, función y artefacto: la redacción asistida del diseño de la medición, de los casos, de los ADR 036 a 050 y de la guía de validación; la maqueta del v0 (HTML con asistentes generativos; falta nombrarlos); la fuente Mermaid de la Figura 1; las correcciones del 28/09/2026. Incluye si se actualiza la frase «asistente conversacional». | I |
| AD-27 | **Encuadre grupal** (el autor lo lleva al grupo): descripción de RIGE (web local, solo lectura, sin IA), sin ponderar universos, un valor por fuente, costo horario con divisor declarado y retiro del parámetro «Sánchez, 2026» del 29/08. Las cifras de $2.290.000 y $3.790.000 no están en `opssi2026` y se retiran; el costo de referencia es $3.738.000 a marzo de 2026. | I |
| M-07 | Convertir las citas literales a `[@clave]` y cargar `informe/referencias.bib`, para que la bibliografía se genere sola. Elimina el paso manual de G-02 (el ingeniero agrega a la bibliografía las fuentes nuevas que informa el redactor). | I |
| M-08 | Completar las tres preguntas de las fuentes de `01-relevamiento/fuentes.md` que tienen `[DATO PENDIENTE]`; correr el verificador de fuentes. | I |
| M-11 | Numeración independiente de anexos («página X de Y») en `tools/armar.py`. | I |
| PV-07 | Bibliografía: la Ley N.º 27.506 figura dos veces, una con `[VERIFICAR fecha de publicación]` (unificar; cubre M-04); las entradas de Cockburn están en orden 2004 → 2001. | M |
| M-10 | Definir si el armado genera las tablas de los Anexos I y V desde `03-requisitos/libro/`, que hoy duplican. | M |
| M-14 | Confirmar el valor de «Equipo» para la nomenclatura de archivos (hoy «Sanchez»). | M |
| M-15 | Asteriscos escapados (`\*`) que deben ser cursiva: cinco títulos en II.1 (Tabla 12), sufijos *a* y *b* en A.I.1, *source* en el Anexo V y una ocurrencia en III.2. El del Anexo VI (incidencia 15664) es literal y se conserva. | M |
| R-02 | Subir el PDF completo de la guía de la AE2 (`AE2-guia.md` es «versión sin página 29»). Confirmar con el docente si la «Guía rápida N.º 1» es la propia consigna de la AE2, porque V.3 la invoca para la autoría individual. | I |
| A-07 | Pegar en `00-gestion/bitacora.md` las entradas completas de la bitácora del AE1 y de la AE2. | I |
| DEF-01 | Ficha de defensa: contenido, ubicación y comando. Base inicial en `00-gestion/preguntas-defensa.md`. | M |

## 5. Referente y AE3

| # | Pendiente | Sev. |
|---|---|---|
| PV-03 | Procedimiento de conteo para la referente (en `01-relevamiento/validacion/`), con aviso de las correcciones posteriores a la sesión del 26/09/2026: enunciado de RNF-07; tres correcciones del modelo del dominio (Elemento–Declaración 0..*, la entrada como destino de un hallazgo, Regla de permiso «declarada o nativa» y su definición en el glosario); iteración de RNF-02 (2 → 3). El envío lo hace el autor. | M |
| PV-05 | Cap. VI (AE3): E-01 y E-02 del acta no tienen criterio de aceptación (códigos de salida que distinguen error de ausencia de resultado; resumen del conjunto leído). Especificarlos en el Cap. VI o proponer un requisito. | M |
| PV-06 | El resultado 23 del AE1 (OpenCode escribe al arrancar) conserva dos `[DATO PENDIENTE]`; condiciona el aislamiento del oráculo y si su regeneración requiere red. Ver `ventana-ae1.md`, §5. | M |
| PV-08 | Cap. VI: coberturas parciales de la Tabla 5 del III.2. LSP (agrupación por lenguaje con servidores incorporados), plugins de `.opencode/plugin/*.js` sin clave y su estado de carga, comandos en el oráculo de RF-01; RF-04 habla de «siete tipos» de entrada que el repositorio no enumera. Acotar la tabla o ampliar los criterios. | M |
