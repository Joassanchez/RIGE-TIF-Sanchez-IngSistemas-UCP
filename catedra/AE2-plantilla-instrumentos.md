**UNIVERSIDAD DE LA CUENCA DEL PLATA**

Facultad de Ingeniería, Tecnología y Arquitectura · Ingeniería en Sistemas de Información

━━━━━━━

**PROYECTO FINAL DE GRADO**

Plantillas e Instrumentos · Actividad de Evaluación N.º 2

*Modelo de negocio, rivalidad amplificada, recursos y prototipo v1*

**Instrumentos 32 a 35 — continuación de la numeración iniciada en la Clase 1**

Documentos de uso obligatorio. Complételos durante el trabajo de las semanas 6 a 8, publíquelos en el repositorio del equipo y consigne los enlaces en la bitácora. Los cuatro instrumentos de este cuadernillo producen el material de los Capítulos IV y X del informe y la ficha de comprobación del artefacto: el lienzo de modelo de negocio y la matriz de rivalidad amplificada, que la consigna de la AE2 exige como piezas del Portafolio; la planilla de dimensionamiento de recursos; y la ficha del prototipo v1, que el equipo completa antes de dar por terminado el esqueleto arquitectónico. El catálogo de requisitos (Instrumento 25) y la matriz de trazabilidad (Instrumento 26) se llevan en el Libro de trabajo de la AE2, en formato de planilla.

*Docente Titular: PosDr. Darío Ezequiel Díaz · Sede Posadas · Comisión A · Septiembre de 2026*

+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **DÓNDE VA CADA INSTRUMENTO**                                                                                                                                                                                                                                                                                                                                                                                           |
|                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Los cuatro se alojan en el repositorio y se copian en la subcarpeta AE2 del Portafolio Digital. Los Instrumentos 32 y 33 van a /02-analisis; el 34, a /03-requisitos, junto al Libro de trabajo que lo opera; el 35, a /src, al lado del archivo de lectura del prototipo. Plazos: jueves 24 de septiembre de 2026 para los Instrumentos 32 y 33; jueves 1.º de octubre para el 34; el 35 se cierra con la etiqueta v1. |
+=========================================================================================================================================================================================================================================================================================================================================================================================================================+
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**Instrumento 32 · Lienzo de modelo de negocio del Sistema de Información**

*Momento de aplicación: semanas 6 y 7, una vez cerrado el conjunto de requisitos «Must». Destino: Capítulo IV, apartado IV.1, y Portafolio de la Unidad Dos. Plazo: jueves 24 de septiembre.*

Complete los nueve bloques y, para cada uno, la implicancia sobre el alcance comprometido. La columna de implicancia es la que la corrección lee: un lienzo del que no se deriva ninguna decisión no fue usado, fue ilustrado. Si un bloque no produce implicancia alguna, consígnelo expresamente y explique por qué; esa declaración vale más que una frase de relleno.

| **Bloque**              | **Pregunta que responde**                                                           | **Contenido** | **Implicancia sobre el alcance** |
|-------------------------|-------------------------------------------------------------------------------------|---------------|----------------------------------|
| Segmentos de clientes   | ¿Para quién se crea valor y quién es el usuario efectivo?                           |               |                                  |
| Propuesta de valor      | ¿Qué problema resuelve y qué lo distingue del sustituto actual?                     |               |                                  |
| Canales                 | ¿Cómo llega la solución a quien la usa?                                             |               |                                  |
| Relaciones con clientes | ¿Qué tipo de vínculo exige la adopción: capacitación, soporte, autoservicio?        |               |                                  |
| Fuentes de ingreso      | ¿Cómo se sostiene económicamente? Si no hay ingreso, ¿qué lo financia?              |               |                                  |
| Recursos clave          | ¿Qué activos son imprescindibles: datos, infraestructura, conocimiento del dominio? |               |                                  |
| Actividades clave       | ¿Qué actividades no pueden tercerizarse?                                            |               |                                  |
| Socios clave            | ¿De quién depende la operación y con qué grado de criticidad?                       |               |                                  |
| Estructura de costos    | ¿Dónde se concentra el costo y qué lo hace variar?                                  |               |                                  |

+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **▶ EJEMPLO DE UNA FILA COMPLETADA (CASO «SANTA ANA»)**                                                                                                                                                                                                                                                                                                                                                                                                                     |
|                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Bloque: socios clave. Contenido: estudio contable externo que liquida sueldos y lleva la contabilidad de la cooperativa. Implicancia sobre el alcance: confirma la exclusión de contabilidad y nómina, que deja de ser una comodidad del equipo y pasa a ser coherencia con la estructura real del negocio; y obliga a definir un formato de exportación hacia el estudio, que se convierte en el requisito RF-09. Un bloque, una exclusión sostenida y un requisito nuevo. |
+=============================================================================================================================================================================================================================================================================================================================================================================================================================================================================+
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**Derivación obligatoria hacia el Capítulo IV**

| **Pregunta**                                             | **Respuesta del equipo** |
|----------------------------------------------------------|--------------------------|
| ¿Qué decisión de alcance cambió por causa del lienzo?    |                          |
| ¿Qué bloque resultó más determinante y por qué?          |                          |
| ¿Qué requisito nuevo se originó en el lienzo, si alguno? |                          |

**Instrumento 33 · Matriz de rivalidad amplificada y mapeo de competencia**

*Momento de aplicación: semana 7, en continuidad con el Instrumento 32. Destino: Capítulo IV, apartados IV.3 y IV.4, y Portafolio de la Unidad Dos. Plazo: jueves 24 de septiembre.*

La pregunta que ordena el análisis no es cuán intensa resulta cada fuerza, sino qué decisión del proyecto cambia por causa de ella. Se cuentan implicancias, no filas. El sustituto más frecuente y más subestimado es la solución artesanal que hoy funciona en la organización: la planilla de cálculo mantenida a mano, gratuita, conocida y capaz de resolver buena parte del problema.

| **Fuerza**                            | **Situación relevada** | **Evidencia (Cap. II, acta o fuente secundaria)** | **Intensidad** | **Implicancia decisoria** |
|---------------------------------------|------------------------|---------------------------------------------------|----------------|---------------------------|
| Rivalidad entre competidores actuales |                        |                                                   |                |                           |
| Competidores potenciales              |                        |                                                   |                |                           |
| Sustitutos                            |                        |                                                   |                |                           |
| Poder de negociación de proveedores   |                        |                                                   |                |                           |
| Poder de negociación de clientes      |                        |                                                   |                |                           |

**33.2 · Mapeo de competencia**

Declare primero los dos ejes y su justificación; recién después ubique las alternativas. Un mapa cuyos ejes se eligieron para que la solución propia quede arriba a la derecha no informa nada.

| **Definición de los ejes**                                                    |     |
|-------------------------------------------------------------------------------|-----|
| Eje horizontal                                                                |     |
| Justificación del eje horizontal (evidencia del relevamiento que lo sostiene) |     |
| Eje vertical                                                                  |     |
| Justificación del eje vertical                                                |     |

| **Alternativa relevada**           | **Qué resuelve hoy** | **Costo total para la organización** | **Posición en el eje horizontal** | **Posición en el eje vertical** |
|------------------------------------|----------------------|--------------------------------------|-----------------------------------|---------------------------------|
| Solución artesanal vigente         |                      |                                      |                                   |                                 |
|                                    |                      |                                      |                                   |                                 |
|                                    |                      |                                      |                                   |                                 |
| Solución propuesta por el proyecto |                      |                                      |                                   |                                 |

+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **✦ LA PREGUNTA QUE LA CÁTEDRA FORMULARÁ**                                                                                                                                                                                                                                                   |
|                                                                                                                                                                                                                                                                                              |
| «Tomo el sustituto que ya funciona en la organización. Es gratuito, la gente lo sabe usar y resuelve buena parte del problema. ¿Por qué su sistema es mejor que eso, medido con qué indicador y en qué plazo?» Si el instrumento no tiene esa respuesta, el apartado IV.3 no está terminado. |
+==============================================================================================================================================================================================================================================================================================+
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**Instrumento 34 · Planilla de dimensionamiento de recursos**

*Momento de aplicación: semana 8, con el catálogo y el plan de iteraciones ya cerrados. Destino: Capítulo X y Portafolio de la Unidad Dos. Plazo: jueves 1.º de octubre. La versión operativa de esta planilla, con sus totales calculados, está en la hoja «Recursos» del Libro de trabajo de la AE2, alojado en /03-requisitos.*

| **Clase**            | **Concepto** | **Cantidad** | **Unidad** | **Costo unitario** | **Fuente, período y justificación de la asignación** |
|----------------------|--------------|--------------|------------|--------------------|------------------------------------------------------|
| Humanos              |              |              |            |                    |                                                      |
| Humanos              |              |              |            |                    |                                                      |
| Físicos y materiales |              |              |            |                    |                                                      |
| Financieros          |              |              |            |                    |                                                      |
| Tecnológicos         |              |              |            |                    |                                                      |
| Tecnológicos         |              |              |            |                    |                                                      |
| Otros                |              |              |            |                    |                                                      |

**34.2 · Las tres preguntas aplicadas a cada cifra de costo**

| **Cifra empleada** | **¿Quién la produjo?** | **¿Con qué método y sobre qué universo?** | **¿Para qué período de referencia?** |
|--------------------|------------------------|-------------------------------------------|--------------------------------------|
|                    |                        |                                           |                                      |
|                    |                        |                                           |                                      |

+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **⚠ RECORDATORIO**                                                                                                                                                                                                                                                                                                                                                                     |
|                                                                                                                                                                                                                                                                                                                                                                                        |
| No se promedian cifras de universos distintos. Si dos relevamientos del sector miden poblaciones diferentes, se cita cada uno con su universo y se declara cuál se adopta y por qué; el promedio de ambos no mide nada. Si ninguna fuente supera las tres preguntas, la cifra no entra: se declara la imposibilidad, que es una respuesta metodológicamente correcta y así se pondera. |
+========================================================================================================================================================================================================================================================================================================================================================================================+
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**34.3 · Verificación de coherencia con el Capítulo V**

| **Verificación**                                                | **Valor** |
|-----------------------------------------------------------------|-----------|
| Horas humanas comprometidas en el Capítulo X                    |           |
| Presupuesto efectivo de horas del Capítulo V (Instrumento 24)   |           |
| ¿Coinciden? Si no, qué se ajusta y en cuál de los dos capítulos |           |

**Instrumento 35 · Ficha del prototipo v1**

*Momento de aplicación: semana 8, antes de crear la etiqueta v1. Destino: /src del repositorio, junto al archivo de lectura, y apartado V.5 del informe. Plazo: jueves 1.º de octubre. Esta ficha es la que el equipo usa para autoverificar el artefacto antes de que lo haga la cátedra.*

**35.1 · Declaración del recorrido vertical**

| **Estación**                       | **Qué se implementó** | **Archivo o componente** | **Qué queda probado** |
|------------------------------------|-----------------------|--------------------------|-----------------------|
| Interfaz                           |                       |                          |                       |
| Lógica (regla de negocio validada) |                       |                          |                       |
| Persistencia                       |                       |                          |                       |
| Retorno a la interfaz              |                       |                          |                       |

| **Declaraciones del artefacto**                              |     |
|--------------------------------------------------------------|-----|
| Caso de uso vertical elegido                                 |     |
| Requisito del catálogo que implementa (ID)                   |     |
| Regla de negocio que valida la capa de lógica (código)       |     |
| Decisión arquitectónica que este recorrido prueba            |     |
| Alternativa de arquitectura evaluada y criterio de descarte  |     |
| Etiqueta del repositorio                                     | v1  |
| Fecha de la última corrida exitosa del canal de construcción |     |

**35.2 · Prueba de clonado en máquina limpia**

La realiza un integrante que no construyó el esqueleto, en una computadora distinta de la del autor, siguiendo únicamente el archivo de lectura y sin agregar pasos de memoria. Si hace falta agregar alguno, ese paso debe escribirse en el archivo y la prueba se repite.

| **\#** | **Paso**                                                    | **Resultado** | **Quién lo verificó y cuándo** |
|--------|-------------------------------------------------------------|---------------|--------------------------------|
| 1      | Clonado del repositorio en una carpeta nueva                |               |                                |
| 2      | Posicionamiento en la etiqueta v1                           |               |                                |
| 3      | Instalación de dependencias según el archivo de lectura     |               |                                |
| 4      | Configuración de variables a partir del archivo de ejemplo  |               |                                |
| 5      | Creación del esquema de la base de datos                    |               |                                |
| 6      | Arranque de la aplicación                                   |               |                                |
| 7      | Ejecución del caso de uso vertical de punta a punta         |               |                                |
| 8      | Verificación de que el dato persiste y se recupera          |               |                                |
| 9      | Consulta del registro de corridas del canal de construcción |               |                                |

+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **◆ CONDICIÓN MATERIAL DEL CÓMPUTO**                                                                                                                                                                                                                                                                                                                                                              |
|                                                                                                                                                                                                                                                                                                                                                                                                   |
| La cátedra clona el repositorio en la etiqueta v1, sigue las instrucciones del archivo de lectura y ejecuta. Un esqueleto que no arranca, no compila o carece de instrucciones no se computa como entregado, con independencia de la calidad del documento que lo acompañe. El detalle completo del procedimiento está en la Guía de comprobación del prototipo v1, publicada en el aula virtual. |
+===================================================================================================================================================================================================================================================================================================================================================================================================+
+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **RECORDATORIO DE FORMATO — ARTS. 20.º Y 21.º DE LA RES. 97/23**                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Todo lo que se vuelque al informe observa desde ya: hoja A4, márgenes de 2,5 cm superior e inferior y 3 cm izquierdo y derecho, interlineado doble, Times New Roman 12 en el cuerpo y 10 en notas al pie, numeración correlativa, unidades SIMELA, bibliografía en normas APA y redacción impersonal con verbos en presente y afirmativo. Las planillas de este cuadernillo son instrumentos de trabajo y pueden conservar su formato propio dentro del Anexo I; lo que se redacta en el cuerpo de los capítulos, no. |
+=======================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================+
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
