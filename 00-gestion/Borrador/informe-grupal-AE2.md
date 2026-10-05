**UNIVERSIDAD DE LA CUENCA DEL PLATA**

Facultad de Ingeniería, Tecnología y Arquitectura

Ingeniería en Sistemas de Información

**INFORME GRUPAL DE ENCUADRE COMÚN**

Actividad de Evaluación N.º 2

Integrantes y proyectos:

Sánchez, Joaquín Sebastián — DNI 45.452.416 — «RIGE: plataforma local para la resolución y explicación de la configuración efectiva y su procedencia en herramientas de programación basadas en agentes»

Nuñez, Santiago Agustín — DNI 44.952.958 — «CODI (Cognitive Operations & Decision Intelligence)»

Docente Titular: PosDr. Darío Ezequiel Díaz · Comisión A

Posadas, Misiones — Octubre de 2026

<!--
NOTAS DEL INGENIERO (no van al Word; se retiran al generar):
- Las filas de CODI se tomaron de AE2_CODI_Informe_v1.docx por indicación del autor (02/10/2026). Nuñez debe revisarlas.
- VERIFICAR CON NUÑEZ: el AE1 grupal atribuía $3.790.000 y $2.290.000 a OPSSI; su AE2 los atribuye a Sysarmy 2026.01. Confirmar contra la publicación de Sysarmy antes de firmar.
- El valor de CODI bajo la regla común (3.790.000 / 173,33 = $21.866) difiere de su X.1 v1 ($23.688, divisor 160): Nuñez tiene que actualizar su X.1.
- Cifras de Sánchez: informe/cap-10/X.1, X.3; Anexo II (A.II.1); Anexo III (D-60, D-62).
- Cifras de Nuñez citadas aquí: AE2_CODI_Informe_v1.docx (X.1, V.3, V.4, III.5).
-->

# 1 · Identificación del grupo

| **Campo** | **Contenido** |
|---|---|
| Integrantes y proyectos | Sánchez, Joaquín Sebastián — DNI 45.452.416 — RIGE. Organización consultada: Electricidad de Misiones S. A. (EMSA), equipo de Sistemas; referente técnica: Valeria Areco. |
| | Nuñez, Santiago Agustín — DNI 44.952.958 — CODI. Organización consultada: Centro Tecnológico Aeroespacial de la Universidad Nacional de La Plata (CTA-UNLP); referente técnica: Ing. Sonia Botta. |
| Responsable de la carga | Sánchez, Joaquín Sebastián |
| Documento nativo del grupo | <https://docs.google.com/document/d/1kHsT39xOqFymUPXvnPtGVdAHT0FagJd0_ll5lmnC2cE/edit?usp=sharing> |
| Reuniones de trabajo | Reunión de trabajo — 02/10/2026 |

# 2 · La dificultad metodológica común

En la AE1, ambos proyectos enfrentaron la misma dificultad diagnóstica: la organización consultada participa como informante y no como cliente que reporta una falla propia. En la AE2 esa condición se traslada de la acreditación del problema a la especificación de la solución. El catálogo de requisitos de cada proyecto se valida con una referente técnica cuya organización no adopta el sistema, no lo financia ni lo opera durante el período del proyecto.

La dificultad tiene dos caras. La primera es de autoridad: en un desarrollo por encargo, la conformidad del cliente cierra la discusión sobre qué debe hacer el sistema; aquí la conformidad de la referente acredita que los requisitos describen una práctica real, pero no obliga a nadie a usarlos ni dirime por sí sola un desacuerdo técnico. La segunda es de verificación: la pregunta que gobierna la AE2 —cómo se comprobará que cada requisito fue satisfecho— no puede responderse con la aceptación de un usuario que no recibirá el sistema. Cada proyecto debe construir, en consecuencia, un criterio de verificación que no dependa de la organización consultada y una regla que establezca qué prevalece cuando la referente y el comportamiento verificable divergen.

# 3 · Cuadro comparativo: cómo resuelve cada proyecto la misma dificultad

| **Proyecto** | **Cómo se manifiesta la dificultad** | **Solución adoptada** | **Fundamento** |
|---|---|---|---|
| Sánchez (RIGE) | La referente de EMSA conoce la práctica de configurar agentes de programación, pero la organización no adopta RIGE ni define su comportamiento esperado. La documentación de OpenCode describe un modelo incompleto, por lo que tampoco puede servir de referencia de aceptación. | Sesión de validación separada del relevamiento, el 26/09/2026, presencial y de 35 minutos, con guía previa (Instrumento 31). El acta registra trece decisiones de límite (L-01 a L-13) y dos del entorno (E-01 y E-02), con la constancia de conformidad firmada. Los criterios de aceptación se verifican por ejecución contra OpenCode 1.18.25 como oráculo, y ante un desacuerdo técnico con la referente prevalece el comportamiento verificado por ejecución. | La referente valida qué entra en el sistema y qué queda afuera; la comprobación de que cada requisito se cumple no depende de ella, sino de un oráculo ejecutable y reproducible por un tercero. La regla de prevalencia está escrita antes de que surja el desacuerdo. |
| Nuñez (CODI) | El CTA-UNLP aporta el conocimiento del dominio y la práctica de diseño de misiones CubeSat, pero no adopta CODI ni fija su comportamiento esperado. La rotación de 10 a 60 integrantes por ciclo de vida impide, además, tomar a un usuario estable como fuente de aceptación. | Validación de los requisitos en la sesión de relevamiento del 14/09/2026 con la Ing. Sonia Botta, registrada en acta de reunión técnica. Protocolo de decisión en cuatro niveles: primacía de las normas ECSS-E-ST-20C Rev. 1, ECSS-E-ST-10C y CubeSat Design Specification REV 14.1; evidencia empírica acordada con el CTA-UNLP en actas fechadas; priorización MoSCoW sobre el presupuesto de horas; registro en la bitácora y en el DecisionLog. | Las reglas de negocio del dominio (profundidad de descarga, margen de fin de vida, envolventes Cal Poly) se verifican contra normas publicadas y citables, que ninguna preferencia del desarrollador ni de la referente puede relajar. La referente decide solo donde la norma admite rangos. |

*Tabla 1. Soluciones adoptadas por cada proyecto ante la dificultad metodológica común. Fuente: elaboración propia sobre Sánchez (2026) y Nuñez (2026).*

**Solución más sólida a juicio del grupo y fundamento de la preferencia.**

El grupo considera más sólida la solución que separa la validación del alcance de la verificación del cumplimiento. El criterio de comparación es la independencia de la verificación respecto de la organización consultada: cuando un requisito se comprueba contra un oráculo ejecutable o una norma publicada, la comprobación sobrevive a que la referente cambie de opinión o deje de estar disponible; cuando se comprueba contra la conformidad de la referente, la validez del requisito queda atada a una organización que no adopta el sistema. Ambos proyectos disponen de un oráculo externo —la ejecución de OpenCode 1.18.25 en RIGE y los estándares ECSS y Cal Poly en CODI—, y ambos declaran por escrito qué prevalece ante un desacuerdo. La diferencia se ubica en la validación del alcance: RIGE la realiza en una sesión propia, posterior al relevamiento y con un acta que registra cada decisión de límite y la conformidad firmada; CODI la apoya en la misma sesión de relevamiento en que se obtuvieron los datos del dominio. Una validación separada permite que la referente se pronuncie sobre los requisitos ya formulados y no sobre la información que les dio origen. Por ese criterio, el grupo considera más sólida la solución de RIGE. Reconoce, a la vez, una fortaleza propia de CODI que RIGE no tiene: sus reglas de negocio se verifican contra normas internacionales publicadas, que cualquier evaluador puede consultar sin ejecutar el sistema.

# 4 · Encuadre del sector de los recursos de la solución

El presente apartado delimita el sector del cual provienen los recursos con los que se construyen ambos sistemas y fija las reglas comunes con que cada informe individual los valoriza en el Capítulo X. No corresponde confundirlo con el sector donde vive el problema de cada proyecto —la configuración de herramientas de programación basadas en agentes en RIGE y la ingeniería de misiones satelitales en CODI—, que cada integrante trata en su informe individual.

## 4.1 · Delimitación del sector

Se mantiene la delimitación adoptada en la AE1: el sector de Software y Servicios Informáticos (SSI) argentino comprende las actividades de desarrollo, implementación, mantenimiento y soporte de software y los servicios informáticos asociados, medidos en términos de facturación, exportaciones y empleo. En el Nordeste comprende el desarrollo de software a medida y de productos propios y los servicios informáticos asociados, y excluye la fabricación de equipamiento, la provisión de telecomunicaciones y la comercialización de hardware.

En la AE2 la delimitación adquiere una consecuencia nueva: el Capítulo X de cada proyecto valoriza las horas de su autor con datos de este sector. Dos informes que valorizan la misma hora con divisores, universos o tipos de cambio distintos producen cifras no comparables y, en el caso del grupo, valores distintos para un mismo dato entre documentos. El apartado 4.3 fija por eso una regla única.

## 4.2 · Fuentes empleadas y regla de las tres preguntas

| **Fuente** | **Quién la produjo** | **Método y universo** | **Período de referencia** | **Uso en el grupo** |
|---|---|---|---|---|
| Encuesta de sueldos 2026.01 | Sysarmy, con análisis de OpenQube | Participación voluntaria en línea de la comunidad tecnológica argentina; 4939 respuestas analizadas; sesgo de autoselección; sin recorte regional | Diciembre de 2025 a febrero de 2026 | Fuente única del costo de hora de referencia de ambos proyectos (apartado 4.3) |
| Cotización del dólar, billete vendedor | Banco de la Nación Argentina | Cotización publicada por el banco para operaciones minoristas de billete | 01/10/2026 | Factor único de conversión entre pesos y dólares en ambos Capítulos X |

*Tabla 2. Fuentes sectoriales sometidas a la regla de las tres preguntas.*

## 4.3 · Disponibilidad de perfiles y costo de hora de referencia

Ninguno de los dos proyectos contrata personal: cada autor cubre como perfil único la totalidad de los roles técnicos y documentales de su proyecto, con un presupuesto efectivo de 190 horas-persona en ambos casos. La disponibilidad regional de perfiles no condiciona, por lo tanto, la ejecución académica, y se emplea para valorizar el trabajo del autor y para dimensionar una eventual explotación posterior.

El grupo adopta una regla única de valorización, con tres componentes comunes y uno diferencial:

1. **Fuente única.** La mediana bruta mensual por seniority de la encuesta Sysarmy 2026.01. Las fuentes no se promedian ni se ponderan entre sí, porque miden universos distintos.
2. **Divisor único.** 173,33 horas mensuales, derivadas de una jornada supuesta de 40 horas semanales (40 × 52 / 12).
3. **Tratamiento único.** Salario bruto del período de la encuesta, sin contribuciones patronales ni actualización al período del proyecto, como supuesto declarado; conversión a dólares al billete vendedor del Banco de la Nación Argentina del 01/10/2026, $1.545 por USD.
4. **Seniority propia de cada proyecto.** Cada autor elige la seniority que corresponde al perfil que su proyecto exige y la justifica en su informe individual.

| **Proyecto** | **Seniority adoptada** | **Mediana bruta mensual** | **Costo de hora** | **Justificación** |
|---|---|---|---|---|
| Sánchez (RIGE) | Junior | $1.538.500 | $8.876 (USD 5,74) | Perfil del autor; se descartan el promedio del sector y los honorarios de colegios profesionales |
| Nuñez (CODI) | Senior, perfil de arquitectura de software y especialista en datos e inteligencia artificial | $3.790.000 | $21.866 (USD 14,15) | El sistema articula recuperación aumentada sobre normativas aeroespaciales, modelos orbitales deterministas y persistencia inmutable; valorizarlo como desarrollo generalista subestimaría la responsabilidad técnica exigida |

*Tabla 3. Costo de hora de referencia por proyecto bajo la regla común. Fuente: elaboración propia sobre Sysarmy (2026).*

## 4.4 · Recursos tecnológicos del sector empleados en común

| **Recurso** | **Uso común** | **Uso diferencial** |
|---|---|---|
| GitHub y GitHub Actions | Repositorio con historial bajo identidad propia y canal de integración continua en `.github/workflows/ci.yml`, exigido por la condición material del prototipo v1 | — |
| Asistentes de programación basados en modelos de lenguaje | Ambos proyectos los declaran como herramientas auxiliares en la bitácora y en el archivo de lectura del prototipo | En RIGE son herramientas de trabajo del autor y objeto del dominio, no componentes del producto. En CODI integran además la arquitectura del producto: una capa de inferencia híbrida con APIs comerciales bajo el esquema de clave propia del cliente (BYOK) y modelos abiertos locales (Ollama o vLLM) |

*Tabla 4. Recursos tecnológicos compartidos. Fuente: elaboración propia.*

## 4.5 · Marco promocional aplicable

La Ley N.º 27.506 de Promoción de la Economía del Conocimiento alcanza al desarrollo de software y a los servicios informáticos. No incide sobre la ejecución académica de ninguno de los dos proyectos, que se desarrollan sin estructura empresarial, y constituye el encuadre de una eventual explotación posterior.

## 4.6 · Instituciones de articulación regional

La Cámara de la Industria Argentina del Software (CESSI), los polos tecnológicos del Nordeste —entre ellos los de Corrientes y Chaco— y la Universidad de la Cuenca del Plata integran el sistema regional del cual provienen los perfiles. Su papel en la AE2 se limita al encuadre de la explotación posterior; ninguno de los dos proyectos depende de ellas para su ejecución.

## 4.7 · Implicancias decisorias

Un elemento cuya supresión no modifica ninguna decisión de ninguno de los dos proyectos no integra el cuadro.

| **Elemento del encuadre** | **Implicancia común** | **Implicancias diferenciales** |
|---|---|---|
| Regla única de costo de hora | Las horas de ambos autores se valorizan con la misma fuente, el mismo divisor y el mismo tipo de cambio, de modo que las cifras del Capítulo X son comparables entre informes y no presentan valores distintos para un mismo dato. | Sánchez valoriza 190 horas a $8.876 (136 técnicas como CAPEX y 54 de reserva como OPEX). Nuñez valoriza 190 horas a $21.866: 184 de demanda técnica del MVP y 6 de holgura de contingencia. |
| Perfil único, cubierto por el autor | El alcance del MVP de cada proyecto se dimensiona sobre 190 horas-persona de una sola persona; todo aumento del alcance retira horas de otra tarea. | Sánchez concentra el riesgo técnico en incorporar el evaluador de permisos de OpenCode en lugar de reimplementarlo. Nuñez requiere conocimiento del dominio aeroespacial que el perfil no posee y que obtiene de la referente del CTA-UNLP y de las normas del sector; restringe el alcance al subsistema de potencia eléctrica (EPS). |
| Referente que no es cliente | Ambos proyectos verifican el cumplimiento de los requisitos contra una referencia independiente de la organización consultada. | Sánchez emplea un oráculo ejecutable (OpenCode 1.18.25). Nuñez emplea las normas ECSS y la CubeSat Design Specification como referencia de verificación de las reglas de negocio. |
| Ley N.º 27.506 | Encuadra la explotación posterior y no la ejecución académica. | RIGE se ubica de lleno entre las actividades comprendidas. Para CODI, el encuadre requiere verificación específica por dirigirse a un sector con regímenes propios. |

*Tabla 5. Elementos del encuadre con implicancia decisoria declarada. Fuente: elaboración propia.*

# 5 · Coordinación del trabajo

| **Integrante** | **Responsabilidad asumida en este documento** | **Apartados en que intervino** |
|---|---|---|
| Sánchez, Joaquín Sebastián | Responsable de la carga. Propuso la dificultad común de la AE2 y la regla única de costo de hora; redactó la fila de RIGE y la parte común del encuadre. | 1, 2, 3 (fila Sánchez), 4.1 a 4.7 (parte común y filas de RIGE), 5, 6, 7 |
| Nuñez, Santiago Agustín | Responsable de la información de CODI: las filas de su proyecto se toman de su informe individual de la AE2, versión 1. Revisa y firma el documento. | 3 (fila Nuñez), 4.3, 4.4 y 4.7 (filas de CODI), 6 |

*Tabla 6. Reparto de responsabilidades en la producción del documento. Fuente: elaboración propia.*

**Criterio de resolución de desacuerdos.** En la parte común prevalece el dato cuya fuente tiene completas las tres preguntas. Si el desacuerdo persiste, cada proyecto conserva su posición, la diferencia se declara como implicancia diferencial en el apartado 4.7 y la discusión se registra en el apartado 6 con atribución nominal. Ningún dato común se publica con dos valores.

# 6 · Registro de decisiones del grupo

| **Fecha** | **Decisión adoptada** | **Alternativas evaluadas y quién las sostuvo** | **Criterio de descarte** |
|---|---|---|---|
| 02/10/2026 | Identificar como dificultad común de la AE2 la validación de requisitos con una referente cuya organización no adopta el sistema. | A (Sánchez): la validación con una referente que no es cliente. B: la planificación de un MVP con un único integrante y 190 horas-persona. | B describe una condición de los recursos y no un obstáculo metodológico; se trata en el apartado 4.3. |
| 02/10/2026 | Adoptar una regla única de costo de hora: Sysarmy 2026.01, divisor 173,33 h, salario bruto sin cargas, seniority propia de cada proyecto. | A (Sánchez, X.1): mediana junior / 173,33 h. B (Nuñez, X.1 de la versión 1): mediana semi-senior / 160 h, con la tarifa senior como valor rector y contraste con OPSSI/CESSI. | Dos divisores para la misma fuente producen valores no comparables entre informes. La seniority, en cambio, depende del perfil que exige cada proyecto y se deja a cada autor. El contraste con OPSSI/CESSI se retira por no consignar fuente, método y período del valor por hora. |
| 02/10/2026 | Convertir a dólares con el billete vendedor del Banco de la Nación Argentina del 01/10/2026 ($1.545 por USD). | A (Sánchez, X.3): billete vendedor BNA. B (Nuñez, Resumen de la versión 1): tipo de cambio minorista vendedor BCRA ($1.543,96). | Se adopta un único factor para que los importes en dólares sean comparables entre informes; la diferencia entre ambas cotizaciones es inferior al 0,1 % y se elige la del BNA por ser la cotización de operación de billete del día de cierre de los presupuestos. |
| 02/10/2026 | Designar a Sánchez como responsable de la carga del documento del AE2. | El documento del AE1 consignó responsables distintos en sus apartados 1 y 5. | Se unifica para que el responsable figure con un solo valor en todos los documentos. |

*Tabla 7. Decisiones adoptadas en común, con atribución nominal. Fuente: elaboración propia.*

# 7 · Declaración de producción común y reutilización

Los abajo firmantes declaran que el presente documento constituye producción común del grupo, elaborada de manera conjunta durante la Actividad de Evaluación N.º 2, y que cada integrante incorpora su encuadre al Capítulo X de su informe individual, con declaración de coautoría en el Anexo III.

| **Integrante** | **DNI** | **Firma** |
|---|---|---|
| Sánchez, Joaquín Sebastián | 45.452.416 | |
| Nuñez, Santiago Agustín | 44.952.958 | |

## Bibliografía

Banco de la Nación Argentina. (s. f.). *Personas*. Recuperado el 1 de octubre de 2026, de https://www.bna.com.ar/Personas

California Polytechnic State University. (2024). *CubeSat design specification (1U–12U)* (REV 14.1 CP-CDS-R14.1). Cal Poly San Luis Obispo. https://www.cubesat.org/cubesatinfo

European Cooperation for Space Standardization. (2009). *Space engineering: System engineering general requirements* (ECSS-E-ST-10C). ESA-ESTEC.

European Cooperation for Space Standardization. (2020). *Space engineering: Electrical and electronic* (ECSS-E-ST-20C Rev. 1). ESA-ESTEC.

Ley N.º 27.506. Régimen de Promoción de la Economía del Conocimiento. (2019, 10 de junio). *Boletín Oficial de la República Argentina*.

Nuñez, S. A. (2026). *CODI*. Proyecto Integrador Final, Actividad de Evaluación N.º 2 [Informe individual no publicado]. Universidad de la Cuenca del Plata.

Sánchez, J. S. (2026). *RIGE: plataforma local para la resolución y explicación de la configuración efectiva y su procedencia en herramientas de programación basadas en agentes*. Proyecto Integrador Final, Actividad de Evaluación N.º 2 [Informe individual no publicado]. Universidad de la Cuenca del Plata.

Sysarmy. (2026, 6 de marzo). *Resultados de la encuesta de sueldos 2026.1*. https://sysarmy.com/blog/posts/resultados-de-la-encuesta-de-sueldos-2026-1/
