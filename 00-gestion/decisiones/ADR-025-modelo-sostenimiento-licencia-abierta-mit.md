# ADR-025 — Modelo de sostenimiento por licencia abierta (MIT), sin explotación comercial

- Estado: aceptado (retroactivo)
- Fecha: AE2 (septiembre de 2026)
- Capítulos afectados: Cap. IV (IV.1, Tabla 10); Cap. X
- Origen: Cap. IV, IV.1
- Revisión: 24/09/2026, alternativas alineadas con el texto del IV.1 y análisis ampliado; la decisión no cambia

### Contexto
El proyecto es de autoría individual, no tiene una organización compradora ni un cliente que pague, y reutiliza las funciones de evaluación de permisos de OpenCode, distribuidas bajo licencia MIT (ADR-006; informe de la AE1, Anexo II, A.II.3). Todas las alternativas del mercado son gratuitas y el costo de cambio es nulo (IV.3).

### Alternativas evaluadas
- **Adoptada:** Código abierto bajo licencia MIT, sin costo de uso, sostenido durante el período con las horas del autor; después de la publicación, ingresos voluntarios por donaciones recurrentes y patrocinio por hito.
- **Descartada A:** Núcleo abierto con funciones pagas para equipos.
- **Descartada B:** Servicio alojado en servidor.
- **Descartada C:** Inversión de una empresa.

*Nota de la revisión:* la versión reconstruida en la migración enumeraba como descartados «convenio, licencia comercial o servicio»; se reemplazan por los tres modelos que el IV.1 efectivamente evalúa.

### Análisis (trade-offs)
- **A** contradice la frontera de uso individual validada con el referente (III.4, decisión L-04).
- **B** contradice la ejecución local sin conexiones salientes (RNF-05).
- **C** exige un retorno que un modelo sin ingresos no ofrece.
- **La adoptada** es coherente con un mercado de alternativas gratuitas y preserva la atribución que exige la licencia de OpenCode. Su costo es que ningún ingreso está asegurado y que la readaptación ante cada versión de la herramienta es un costo recurrente sin financiamiento (IV.1, Tabla 10, «Estructura de costos»).
- **Efecto sobre el alcance:** el lienzo convierte la exclusión de otras herramientas (L-05) en coherencia económica, porque cada adaptador suma costo recurrente; excluye toda dependencia de costo variable, como un modelo de lenguaje (ADR-021); y hace de RNF-03 una condición del sostenimiento, ya que el patrocinio por hito exige un adaptador separable.
- **Marco normativo:** la Ley N.º 27.506 no alcanza al proyecto en el período, porque se dirige a personas jurídicas con ingresos por actividades promovidas (IV.1).

### Recomendación y fundamento
Adoptar la licencia MIT sin explotación comercial: es el único modelo compatible con las fronteras validadas (L-04, RNF-05) y con la licencia del código reutilizado.

### Decisión del autor
Publicar RIGE como software de código abierto bajo licencia MIT, sin costo de uso, sostenido durante el período con las horas del autor.

### Consecuencias
- El repositorio publica el archivo de licencia MIT y la atribución a OpenCode desde el v1.
- El Capítulo X declara los recursos financieros como nulos durante el período y las horas del autor como recurso principal (ADR-030).
- **Inconsistencia detectada en la revisión:** la Tabla 10 del IV.1 («Estructura de costos») cita un presupuesto efectivo de 153 h, mientras V.4 y ADR-030 declaran 190 h (136 técnicas). Ver pendientes.
- **Condición que invalidaría la decisión** (observación del ingeniero): que surja una organización dispuesta a financiar el desarrollo con condiciones sobre la licencia, o que el código reutilizado cambie a una licencia incompatible con MIT.

### Evidencia
`informe/cap-04/IV.1-definicion-negocios.md` (IV.1 y Tabla 10); `informe/cap-04/IV.3-analisis-rivalidad-amplificada.md`; informe de la AE1, Anexo II, A.II.3.
