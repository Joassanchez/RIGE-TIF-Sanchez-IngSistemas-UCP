# ADR-108 — Marketing del proyecto: cinco roles de interesado con criterio común, adopción por autoservicio tras la publicación y canales sin eficacia acreditada

- Estado: aceptado (06/11/2026); modificación del 06/11/2026 aceptada por el autor el mismo día (sección al final, que rige sobre «Reglas de lectura de los experimentos»)
- Fecha: 06/11/2026
- Capítulos afectados: VII (se redacta con esta decisión); IV.1 y IV.3, por remisión; XI, por los experimentos que cita; Instrumentos 36 y 39
- Origen: sesión del 06/11/2026, bloque B2 de `00-gestion/plan-cierre-ae4.md`; pre-crítica de Codex del mismo día

### Contexto

**Dato del repositorio.** La Consigna AE4, Producto Final, punto c, pide «producto, experiencia, canales y dinámicas de intercambio por perfil de interesado» (`catedra/AE4/00_Consigna_Oficial_AE4_v02.pdf`). La exigencia iii pide que cada capítulo nuevo remita a evidencia. La rúbrica, dimensión A, nivel 4, pide distinguir lo observado, lo inferido y lo supuesto; la dimensión C, nivel 4, pide resolver los casos límite. No se encontró en `catedra/` una plantilla de apartados para el Cap. VII ni el texto de la R.R. 97/23.

**Dato del repositorio.** IV.1 declara que no se identifica un usuario fuera del autor, que EMSA queda fuera de la implantación y que la continuidad posterior se desconoce. La Tabla 7, fila «Canales», y IV.3 dicen que el mecanismo de adopción en uso real requiere definición. Según ADR-057, el repositorio es privado durante el período y se publica bajo MIT tras la aprobación del TIF. S-09 y E-03 (Instrumento 39) tratan la adopción sin instrucción externa como supuesto sin contrastar.

**Dato del repositorio.** IV.3 declara las condiciones de abandono: una instrucción de rutas relativas o un verificador léxico que iguale el diagnóstico con costo igual o menor; una corrección o un aviso nativo de OpenCode. La superioridad de RIGE frente a la regla léxica requiere demostración.

**Dato del repositorio.** El Instrumento 36 lista perfiles que no coinciden con la Tabla 7: incluye «cátedra que comprueba». IV.1 se contradice sobre los ingresos: la cobertura de la readaptación «se desconoce» en un párrafo y los ingresos «no cubren» la readaptación en su cierre.

**Dato del repositorio.** Kotler y Armstrong (2012), capítulos 1 y 2, es lectura obligatoria de la consigna, y no figura en `01-relevamiento/fuentes.md` ni en `informe/bibliografia.md`.

**Consecuencia.** El capítulo describe un mercado sin uso externo documentado. Sin una decisión previa, el redactor tendría que elegir perfiles y canales, o presentar como hecho lo que es intención.

### Alternativas evaluadas

**Eje P · Interesados.** Criterio común: es interesado quien intercambia algo con el proyecto y, con ese intercambio, condiciona la adopción, el contenido o la continuidad del producto.

- **P-A.** Cinco roles: desarrollador que configura su entorno (decisor); agente externo (consumidor técnico delegado); referente de EMSA (validadora); comunidad de desarrolladores (aportante, después de publicar); patrocinador (financiador, después de publicar).
- **P-B.** Solo los segmentos de la Tabla 7: desarrollador y agente externo.
- **P-C.** P-A más la cátedra y el proyecto OpenCode.
- **P-D.** P-A con comunidad y patrocinadores en una sola fila.

**Eje A · Adopción**

- **A-A.** Autoservicio con el manual y publicación tras la aprobación. La integración con el agente (skill o servidor MCP local) queda como evolución condicionada, según el Instrumento 36.
- **A-B.** Comprometer ahora la integración con el agente como mecanismo de adopción.
- **A-C.** Adopción acompañada a través del equipo de la referente.

**Eje C · Canales después de la publicación.** Se separan descubrimiento (cómo se llega al primer contacto), distribución (cómo se obtiene el producto) y uso.

- **C-A.** Descubrimiento: espacios públicos del proyecto OpenCode y el repositorio publicado, con eficacia supuesta. Distribución: repositorio bajo MIT. Uso: instalación local y manual. E-03 registra el origen del contacto, de manera descriptiva.
- **C-B.** Nómina amplia de comunidades y redes.

**Eje F · Marco conceptual.** Se separan la lectura exigida y la decisión de citar.

- **F-A.** Citar Kotler y Armstrong (2012) con correspondencia exacta solo si se accede a la obra. Sin acceso, el capítulo prescinde de esa cita y usa Osterwalder y Pigneur (2019), ya registrada, sin presentarla como equivalente. La lectura queda como pendiente del autor.
- **F-B.** Citar Kotler y Armstrong (2012) de manera general, sin consultar la obra.

### Análisis (trade-offs)

**P.** La referente cumple el criterio: su validación condiciona el contenido del producto y OE-4 exige su conformidad. La cátedra evalúa el trabajo académico y su intercambio termina con la evaluación, sin efecto sobre la adopción ni la continuidad del producto. OpenCode es proveedor y socio (Tabla 7; IV.3): condiciona el producto, pero RIGE no le dirige una propuesta ni intercambia con él durante el período. P-B omite a quien valida y a quien financiaría. P-D oculta que aportar un adaptador y financiar son circuitos con contraprestación distinta.

El agente es el caso límite: cumple el criterio solo como consumidor delegado, porque condiciona la forma del producto (III.1: resultado estructurado y versionado). No decide ni paga: la adopción sigue en el desarrollador. Su función como consumidor conserva la revalidación pendiente R-10.

**A.** A-B compromete una capacidad sin construir y sin medir. A-C contradice «EMSA queda fuera de la implantación» (IV.1) y haría depender el capítulo de un tercero. A-A es sostenible hoy, a costa de que la adopción quede sin acreditar.

**C.** C-B inflaría el capítulo con canales sin intención real ni evidencia. E-03 mide adopción: el retorno de participantes elegibles. Un resultado favorable en ese piloto deja sin acreditar que un canal atraiga interesados. Por eso la eficacia de cada canal sigue como supuesto propio, y el origen del contacto se registra solo como descripción.

**F.** F-B expone a atribuir a una fuente lo que no contiene, conducta no admitida por la consigna. La consigna exige la lectura, y no necesariamente la cita en el Cap. VII.

### Recomendación y fundamento

**P-A, A-A, C-A y F-A.** Conservan la coherencia con IV.1, ADR-057, III.1 y el Instrumento 39, y no prometen más de lo que el repositorio sostiene.

Cada celda de la tabla por rol lleva su base: **observado** (consta en una constancia, una medición o el producto), **inferido** (se deriva de lo observado) o **supuesto** (sin contraste). Lo construido se separa de la ventaja sin demostrar y de la evolución condicionada. Los experimentos se desarrollan en el Cap. XI, sin duplicarlos.

**Reglas de lectura de los experimentos.**

- **E-03:** el umbral es de 3 retornos de 5. Un resultado de 2 o 3 queda a un participante de cambiar la decisión, por lo que se repite con otros cinco antes de decidir. Sin participantes dentro del plazo se informa como no ejecutado y la decisión queda abierta. Ningún resultado autoriza un pivote automático.
- **Integración con el agente:** se activa solo con veredicto «Criterio cumplido» y E-03 por debajo del umbral.
- **E-05:** contrasta solo la cobertura recurrente. El patrocinio por hito es una hipótesis aparte, condicionada a patrocinio efectivo, alcance acordado y mantenimiento, sin contraste en el período.
- **Cobertura de la readaptación:** sin financiamiento asegurado y con cobertura desconocida, condicionada a E-05.

**Condiciones que invalidarían la decisión:**

1. Un usuario identificado fuera del autor: se reabre P y se actualiza la base de las filas.
2. Las ramas de E-03 o el veredicto de la medición final, según las reglas anteriores: se reabre A.
3. Una instrucción de rutas relativas o un verificador léxico iguala el diagnóstico con costo igual o menor, o OpenCode corrige el mecanismo (IV.3): se reformula la propuesta por rol para ese mecanismo; los demás tipos de RF-07 y la decisión de RF-02 requieren línea de base propia.
4. El equipo de la referente decide adoptar RIGE: se reabre A-C y el límite de implantación de IV.1.
5. El autor accede a Kotler y Armstrong (2012): se aplica la primera rama de F-A.
6. La R.R. 97/23 u otra pieza de la cátedra fija apartados para el Cap. VII: se ajusta la estructura.

### Decisión del autor

Aceptado por el autor el 06/11/2026, con P-A (cinco roles, después de que la pre-crítica separara comunidad y patrocinador), A-A y C-A. El autor sin precisar todavía si accede a Kotler y Armstrong (2012), rige la rama sin acceso de F-A.

### Consecuencias

- El Cap. VII se redacta con los apartados VII.1 a VII.5, sin declarar adopción, usuarios ni resultados de la medición final. La ausencia se expresa como «sin uso externo documentado en la evidencia identificada».
- El Instrumento 36 retira «cátedra que comprueba» de los perfiles, con el motivo de esta decisión: la comprobación de RNF-06 queda como motivo de la evolución.
- El Instrumento 39, E-03, agrega el registro descriptivo del origen del contacto.
- IV.1 corrige su cierre sobre la cobertura de los ingresos.
- La lectura de Kotler y Armstrong (2012) queda como pendiente del autor.
- Se agregan a `00-gestion/preguntas-defensa.md` las preguntas sobre interesados, adopción y métricas.
- D-73 en `00-gestion/anexo-III.md` recibe la deliberación, antes de lanzar el redactor.

### Evidencia

`informe/cap-04/IV.1-definicion-negocios.md`, Tabla 7; `informe/cap-04/IV.3-analisis-rivalidad-amplificada.md`; `informe/cap-03/III.1-entorno-sistema-informacion.md`, Tabla 1; `03-requisitos/libro/glosario.md`; `01-relevamiento/validacion/registro-cambios-referente.md`, R-10; ADR-057; `instrumentos/instrumento-36-hoja-ruta.md`; `instrumentos/instrumento-39-escalabilidad.md`, S-09, S-10, E-03 y E-05.

### Modificación del 06/11/2026 (aceptada por el autor el mismo día, después de la revisión del Cap. VII)

**Origen:** revisión consolidada del Cap. VII del 06/11/2026, hallazgos 1, 4 a 8 y 15, y pre-crítica de Codex del mismo día. Ningún dato de E-03 existe: el cambio se decide antes de medir. El autor pidió aplicar las recomendaciones del ingeniero y aceptó este texto el 06/11/2026.

**Dato del repositorio.** La regla anterior deja a 3 de 5 cumpliendo el umbral y obligado a repetir a la vez, y no dice qué ocurre tras repetir. E-03 corre de 3 a 9 meses después de publicar, con OpenCode 1.18.25, mientras OpenCode publica 227 versiones estables en nueve meses (A.III.3). Ante otra versión, RIGE advierte y no presenta resultados (RF-05; V.5). RNF-05 prohíbe conexiones salientes, por lo que RIGE no puede registrar el retorno.

**M-1 · Regla cerrada de E-03.** Se cuentan participantes con ventana completa de 14 días. La última primera consulta admitida es 14 días antes de los 9 meses desde la publicación.

| Resultado | Decisión |
|---|---|
| 4 o 5 de 5 | Se persevera |
| 2 o 3 de 5 | Un participante cambia la decisión: se repite con otros cinco y se decide sobre los diez |
| 6 o más de 10 | Se persevera |
| Menos de 6 de 10, o 0 o 1 de 5 | Desfavorable: se aplica M-2 |
| Repetición incompleta a los 9 meses | No concluyente: salida conservadora de M-2 |

Alternativas: conservar 3 de 5 con repetición, que no decide; 3 de 5 sin repetición, que decide con un participante de margen. Los cortes son juicio, sin dato de partida, y se declara.

**M-2 · Causa de un resultado desfavorable.** Se aplica solo después de un resultado desfavorable. La etapa donde se detiene el participante orienta la hipótesis y no prueba la causa. Por eso se registran por participante la oportunidad de uso (si hubo un cambio de configuración en la ventana), el motivo de abandono y la fricción. Quien no tuvo oportunidad de uso se reemplaza dentro del plazo y no cuenta como fracaso.

| Causa acreditada por esos registros | Acción |
|---|---|
| Manual, plataforma o versión | Corregir el manual, acreditar RNF-06 o readaptar (E-04) |
| Falta de necesidad o de utilidad | Revisar la propuesta de valor; sustitutos de IV.3 |
| Interpretación del resultado | Revisar las explicaciones |
| Olvido de consultar o falta de incorporación al procedimiento | Integración con el agente, solo con «Criterio cumplido» en la medición final |
| Causa desconocida, integración descartada o resultado no concluyente | **Salida conservadora:** no se amplía el producto y RIGE queda fijo en la última versión soportada |

**Condición única de la integración con el agente:** resultado desfavorable de E-03, causa acreditada en la incorporación al procedimiento y veredicto «Criterio cumplido». Reemplaza la condición «E-03 bajo el umbral» de la decisión original.

**M-3 · Evento de valor.** Cuenta como retorno, dentro de los 14 días desde la primera consulta y en el proyecto propio, una consulta ante un cambio de configuración o la corrección de una declaración. Se descarta contar solo la vuelta a consultar, porque quien corrigió y no volvió a tocar permisos es un éxito. Se registra aparte si consulta la persona o su agente. La fuente es el autoinforme, con evidencia aportada voluntariamente; es un límite que se declara, porque RNF-05 impide registrarlo en el producto.

**M-4 · S-09 se separa.** S-09a: un desarrollador ajeno al proyecto adopta RIGE sin una instrucción externa, contrastado con E-03. S-09b: un agente consulta RIGE sin que se le ordene; se mide de manera directa, con las consultas sin orden sobre oportunidades definidas, y su umbral se fija antes de construir la integración. La reducción del éxito declarado falso se mide aparte, como efecto de la integración. Sin integración, S-09b queda sin contraste.

**M-5 · Orden entre E-04 y E-03 y segmento efectivo.** E-04 precede a E-03, y los elegibles usan la versión soportada por esa intervención. Si E-04 no se ejecuta, E-03 corre con quienes fijen 1.18.25 a propósito, y se declara el límite. Alternativas: E-03 primero, que puede quedarse sin elegibles; E-03 solo con 1.18.25, igual. El segmento efectivo es quien fija la versión soportada y delega la configuración en un agente; su tamaño se desconoce. **Costo:** E-03 queda atado a una readaptación sin financiar, y E-05 pide financiar una continuidad sin adopción acreditada. La dependencia circular entre adopción, financiamiento y readaptación se declara.

**M-6 · Falta de participantes.** Sin cinco elegibles con ventana completa a los 9 meses, E-03 cierra como **sin adopción acreditada** y rige la salida conservadora. Se descarta «no ejecutado, decisión abierta», que deja sin consecuencia un resultado probable. La lectura sobre el canal requiere registros de invitaciones, alcance, rechazos y causas de inelegibilidad; sin ellos, la causa se declara indeterminada.

**M-7 · Reclutamiento y secuencia de canales.** El autor invita a los cinco, en espacios públicos del proyecto OpenCode y por contacto directo. La invitación establece el contacto y el uso sigue por autoservicio con el manual, sin otra indicación del autor (precisión del 06/11/2026, confirmada por el autor ese día). El piloto mide adopción una vez establecido el contacto, y deja sin medir el descubrimiento y el efecto de la invitación, sesgo que se declara. La difusión amplia sigue a perseverar. Los espacios se declaran sin identificar: no se verificó cuáles existen ni si admiten difusión de terceros.

**M-8 · Oferta por veredicto de la medición final.** RIGE se publica con cualquier veredicto, porque ADR-057 ata la publicación a la aprobación del TIF. La oferta se limita a las capacidades verificadas en la versión entregada: si la contingencia de V.4 posterga RF-07, el diagnóstico sale de la oferta. Cambia lo que se afirma:

| Veredicto (I.3.4) | Qué se ofrece, con lo verificado | Qué se deja de afirmar |
|---|---|---|
| Criterio cumplido | Verificación del cambio y diagnóstico, con el alcance de `build` | Atribución a la herramienta aislada |
| Meta alcanzada sin atribución suficiente | Consulta y diagnóstico | Que RIGE produzca la reducción |
| Meta alcanzada con costo excedido | Consulta y diagnóstico, con el costo a la vista | Mejora neta del procedimiento |
| Criterio no cumplido | Consulta y diagnóstico, con el hallazgo negativo a la vista | Reducción del éxito declarado falso |
| Meta sin evaluar por falta de ejecución; Criterio sin evaluar por registros incompletos | Consulta y diagnóstico | Toda reducción: queda como experimento pendiente, con su causa |
| Rama de respaldo por cobertura insuficiente | Producto verificado, con hallazgo negativo o con cobertura y detección, según I.3.4 | La meta, que queda sin evaluar |

La integración con el agente queda descartada sin «Criterio cumplido».

**Uso propio del autor.** El autor declara el 06/11/2026 que todavía no usó RIGE en un proyecto propio y que lo va a hacer. El capítulo lo trata como dato pendiente, sin presentarlo como uso.

**Condiciones que la invalidarían:** las de la decisión original, más una evidencia de que una ventana de 14 días no refleja el ciclo real de cambios de configuración, para lo cual se reajusta el plazo antes de ejecutar E-03.
