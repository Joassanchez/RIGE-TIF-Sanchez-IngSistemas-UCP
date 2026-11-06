## VII.1 · Roles de interesado

No se identifica un usuario fuera del autor y EMSA queda fuera de la implantación (apartado IV.1). RIGE se encuentra sin uso externo documentado en la evidencia identificada. La construcción y las mediciones registradas acreditan capacidades del producto; su uso propio requiere el registro indicado en VII.3.

En este capítulo, producto es lo que se ofrece a cada rol, aunque no sea software. Experiencia es el recorrido por los puntos de contacto antes, durante y después del uso. Canal es la vía de contacto, de obtención o de uso. Intercambio es lo que cada parte da y recibe. Una métrica accionable indica qué decisión tomar. Estas definiciones son operativas del capítulo.

Se considera observado lo que consta en una constancia, una medición o el producto. Se denomina inferido lo que se deriva de lo observado, con la derivación explícita, y supuesto lo que carece de contraste.

Se incluye como interesado a quien intercambia algo con el proyecto y, mediante ese intercambio, condiciona la adopción, el contenido o la continuidad del producto. La Tabla VII.1 sintetiza la propuesta por rol y precisa la base de sus componentes.

| **Rol** | **Producto** | **Experiencia** | **Canal** | **Intercambio** |
|---|---|---|---|---|
| Desarrollador, decisor | Valor efectivo y procedencia (O); decisión con regla determinante y hallazgos (O) | Instalación local (S), RNF-06 sin acreditar; consultas por línea de comandos y web local (O); plantillas de explicación (O), suficiencia para el autoservicio (S) | Descubrimiento en espacios públicos de OpenCode y repositorio (S); distribución por repositorio (S); manual en elaboración (O) | Recibe resultados sin costo de uso (S); puede comunicar incidencias o donar voluntariamente (S) |
| Agente externo, consumidor delegado | Resultado estructurado y versionado (O) | Las pruebas de RF-03 invocan la línea de comandos y validan la salida contra el esquema, sin un agente externo (O); su consumo por un agente en el procedimiento real (S) | Lo introduce el desarrollador (S) | El contrato probado define lo que recibiría la invocación (O) |
| Referente de EMSA, validadora | Explicación de los cambios del catálogo, del dominio y de las reglas, hasta el 15/10/2026 (O); las constancias no registran uso del producto (O) | Validación del flujo de consulta de la maqueta el 26/09/2026 y constancias posteriores (O) | Sesiones y constancias (O) | Aporta confirmaciones firmadas sobre los cambios que el autor le explica (O); las constancias no registran su motivación (O) |
| Comunidad, aportante después de publicar | Código bajo MIT tras la aprobación (S) | Lectura y aportes posteriores (S) | Repositorio publicado (S) | MIT entrega el código sin condición de contraprestación (I); los aportes y su motivación son supuestos (S) |
| Patrocinador, financiador después de publicar | Propuesta de continuidad o de desarrollo acotado (S) | Relación con el mantenedor (S); no requiere usar el producto (S) | GitHub Sponsors y acuerdo por hito (S) | Donación recurrente o patrocinio de un desarrollo acordado (S) |

*Tabla VII.1. Producto, experiencia, canal e intercambio por rol. (O): observado; (I): inferido de evidencia identificada; (S): supuesto. Fuente: elaboración propia sobre las pruebas del canal y la referencia nativa de A.III.9, las mediciones registradas en A.I.11 y las constancias de A.II.1 y A.II.2.*

Las consultas e interfaces corresponden a las pruebas de aceptación del canal sobre `congelada`, con los trabajos de verificación y referencia nativa exitosos del 03/11/2026 (Anexo III, A.III.9). Las pruebas del esquema publicado de RF-03 acreditan el contrato estructurado y versionado. Las de explicación de RF-02 y completitud de plantillas de RF-07 acreditan su construcción, con el alcance del producto descrito en V.5. Las mediciones del 04/11/2026 comprueban consultas por línea de comandos sobre esa revisión en el contenedor Linux (apartado V.2). Los informes de RNF-05 y RNF-07 y el registro de estado se identifican en el registro de evidencia (Anexo I, A.I.11).

Las actas y constancias acreditan los componentes observados de la fila de la referente: documentan las confirmaciones sobre los requisitos y cambios que identifican (Anexo II, A.II.1). Su recorrido por la maqueta se acredita en A.II.2. La entrega del código sin contraprestación se infiere de la licencia MIT y del régimen de publicación aceptado (apartado IV.1). Las demás propuestas posteriores carecen de contraste y se rotulan como supuestas.

Se adoptan cinco roles porque limitarse a los segmentos de la Tabla 7 omite a quien valida y a quien financiaría (Anexo III, D-73). La cátedra evalúa el trabajo académico; su intercambio termina con la evaluación y, una vez aprobado el trabajo, deja de condicionar la adopción, el contenido o la continuidad. OpenCode condiciona el producto como proveedor y socio (Tabla 7), pero el proyecto no le dirige una propuesta; se analiza en IV.3.

El agente externo cumple el criterio como consumidor delegado porque exige un resultado estructurado y versionado; la decisión de adoptar y de donar corresponde al desarrollador. Este uso tiene pendiente la revalidación ante la referente, R-10 (apartado III.1, Tabla 1). La línea de comandos responde a la práctica relevada de consumo programático, E-01; se descarta la interfaz exclusivamente gráfica por ese motivo (Anexo III, D-17).
