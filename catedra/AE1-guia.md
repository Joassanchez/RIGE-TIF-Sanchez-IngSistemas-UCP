# Guía de consignas · AE1

> Texto extraído de la guía oficial (páginas 1 a 21). Ante divergencia, prevalece el original.

```text
          UNIVERSIDAD DE LA CUENCA DEL PLATA
             Facultad de Ingeniería, Tecnología y Arquitectura · Ingeniería en Sistemas de Información




PROYECTO FINAL DE GRADO
                           Actividad de Evaluación N.º 1

        Unidad Uno — Análisis Estratégico y Concepción de un Sistema de Información

   Guía de consignas para el estudiante · Resumen y Capítulos I y II del informe del Proyecto Integrador Final




Este documento desarrolla la consigna oficial de la Actividad de Evaluación N.º 1 y la convierte en material de
trabajo. No la reemplaza ni la modifica: la explica. Donde la consigna enuncia una exigencia en una línea, aquí se
aclara qué se busca con ella, cómo se satisface y qué la distingue de una respuesta insuficiente. Léase completo
antes de escribir el primer párrafo del informe y vuélvase a consultar antes de subir el archivo al aula virtual,
con la lista de autoverificación del apartado 15 a la vista.




                        Docente Titular: PosDr. Darío Ezequiel Díaz · Comisión A · Sede Posadas
                  Entrega: jueves 3 de septiembre de 2026, hasta las 23:59 h · Modalidad presencial

                                     ISI-PFG-2026C2-AE1-v02 · 2.º cuatrimestre 2026


---

                                                                                        Actividad de Evaluación N.º 1 · Proyecto Final de Grado 2026




Cómo usar este documento
La guía se organiza en dieciséis apartados que siguen el orden natural del trabajo: primero qué es la actividad y qué
lugar ocupa dentro del cuatrimestre; después, capítulo por capítulo, qué debe contener el informe; a continuación
las seis exigencias que la corrección verifica de manera puntual; luego los aspectos formales, los componentes de
cierre y la rúbrica; y al final los errores que la cátedra sanciona con mayor frecuencia y la lista de verificación previa a
la entrega.

A lo largo del texto aparecen cinco tipos de recuadro. Conviene reconocerlos, porque cada uno cumple una función
distinta y ninguno es decorativo.


    ◆ CONCEPTO CLAVE

    Define una noción que se usará durante todo el cuatrimestre y que la defensa final volverá a pedir. Si un concepto
    aparece en un recuadro de este tipo, se presume conocido en todas las entregas posteriores.



    ▶ EJEMPLO — CÓMO SE APLICA

    Muestra la exigencia resuelta sobre un caso concreto, casi siempre la Cooperativa Yerbatera «Santa Ana»,
    organización ficticia que la cátedra emplea como caso conductor. Nunca es un modelo para copiar: es una
    demostración del nivel de precisión esperado.



    ⚠ ERROR FRECUENTE

    Describe una falla observada en cohortes anteriores, con la corrección correspondiente. Los errores consignados en
    estos recuadros no admiten indulgencia: están advertidos por escrito y con antelación.



    ✦ ¿POR QUÉ DECIDISTE ESTO?

    Contiene la pregunta textual que la cátedra formulará sobre ese punto, en el aula o en la Instancia Oral de Validación
    y Fundamentación. Anticipar la respuesta es parte del trabajo, no un ejercicio opcional.



    ≡ EN SÍNTESIS

    Comprime el apartado en tres o cuatro líneas verificables. Sirve para repasar antes de la entrega, jamás para sustituir
    la lectura del desarrollo.



    ADVERTENCIA SOBRE LA RELACIÓN ENTRE ESTE DOCUMENTO Y LA CONSIGNA OFICIAL

    Ante cualquier divergencia entre esta guía y la Consigna de Actividad de Evaluación ISI-PFG-2026C2-AE1-v02, preva‐
    lece la consigna oficial. Ante cualquier divergencia entre la consigna y la Resolución Rectoral UCP N.º 97/23, prevale‐
    ce la Resolución. Esta guía no crea obligaciones nuevas: interpreta las existentes.




                                 Guía de consignas AE1 · UCP · Ingeniería en Sistemas de Información · Pág. 2


---

                                                                                                Actividad de Evaluación N.º 1 · Proyecto Final de Grado 2026




1 · Qué es la AE1 y qué lugar ocupa
La primera entrega del cuatrimestre no es un trabajo práctico sobre el proyecto: es el proyecto, en su primer
tramo escrito.

Conviene desarmar de entrada un malentendido que reaparece cada año. Numerosas asignaturas organizan la
cursada mediante trabajos prácticos que ejercitan un contenido, se corrigen, se califican y se archivan; el examen
final llega después y se prepara aparte. Proyecto Final de Grado no funciona así. Aquí no existe un documento de
cursada y otro de defensa. Existe un solo informe, el del Proyecto Integrador Final, cuya estructura fija el artículo
22.4 de la Resolución Rectoral UCP N.º 97/23 en trece capítulos obligatorios, y las entregas del cuatrimestre son sus
capítulos sucesivos, redactados con la numeración y los títulos definitivos.

De allí se sigue una consecuencia práctica que gobierna todo lo demás: lo que se entrega el 3 de septiembre no se
corrige y se guarda. Se corrige, se mejora y se sigue usando. En noviembre, ante el tribunal, esas mismas páginas —
depuradas, ampliadas, coherentes con lo que vino después— serán las primeras que el jurado lea. Escribirlas con
desgano en agosto equivale a hipotecar la defensa de noviembre.


      ◆ CONCEPTO CLAVE — CORRESPONDENCIA ENTRE ENTREGAS Y CAPÍTULOS

      La AE1 comprende el Resumen y los Capítulos I y II del informe reglamentario. Ni más ni menos. Adelantar contenido
      del Capítulo III o del IV no suma; resta, porque compromete decisiones que todavía no cuentan con la información
      que las sostendría.



 Instancia                               Capítulos comprometidos                                               Artefacto de software

 AE1 · TP1 — Clase 7 · 03/09             Resumen · Capítulos I y II                                            Prototipo v0 — maqueta navegable
                                                                                                               de baja fidelidad

 AE2 · TP2 — Clase 12 · 18/09            Capítulos III y IV                                                    —

 TP3 — Clase 17 · 08/10                  Capítulos V, VI, IX y X                                               Prototipo v1 — esqueleto arquitec‐
                                                                                                               tónico ejecutable

 AE3 — instancia individual es‐          —                                                                     —
 crita

 AE4 · TP4 y defensa — Clases            Capítulos VII, VIII, XI, XII y XIII; Conclusiones,                    Versión     funcional     congelada      y
 29 y 30                                 Bibliografía y Anexos                                                 demostrada en vivo

Correspondencia entre instancias evaluativas y capítulos del informe (Art. 22.4, R.R. 97/23).



1.1 · Régimen formativo: qué significa que no lleve nota
La AE1 es formativa. No produce calificación numérica. Se cierra con uno de dos estados: Entrega Completa o En‐
trega Incompleta — requiere reelaboración. La rúbrica y el descuento por ortografía y redacción operan como
instrumentos de devolución, no como instrumentos de nota.

En cuanto a su carácter grupal, la actividad presenta una estructura doble que conviene entender de entrada,
porque no es la habitual. El producto principal —Resumen y Capítulos I y II— conserva la autoría del proyecto:
individual cuando el Proyecto Integrador Final lo es, colectiva cuando el proyecto tiene dos autores. A ese producto




                                       Guía de consignas AE1 · UCP · Ingeniería en Sistemas de Información · Pág. 3


---

                                                                                        Actividad de Evaluación N.º 1 · Proyecto Final de Grado 2026




se suma un componente de autoría colectiva, el Informe Grupal de Encuadre Común, que se desarrolla en el apar‐
tado 2.3 y que satisface el requisito de grupalidad que el apartado 4 de la Guía Docente fija para esta actividad.

Esa ausencia de nota se lee mal con frecuencia. No significa que la actividad sea menor: significa que el instrumento
de medición es binario y que el momento de la medición se corre hacia adelante. La incidencia académica es la
siguiente, conforme al apartado 5.2 de la Guía Docente – Parte II: la Nota de Cursado se construye sobre el
promedio de la AE3 y la AE4, y el estado de las actividades formativas lo modifica.

 Estado de las actividades formativas                          Efecto sobre la Nota de Cursado

 AE1 y AE2 completas                                           Se conserva íntegro el promedio de AE3 y AE4.

 Sólo una de las dos completa                                  Se resta un (1) punto a ese promedio.

 Ninguna completa                                              La Nota de Cursado se fija en 5 y el estudiante queda en condición de
                                                               Libre.



    ⚠ ADVERTENCIA PROPIA DE ESTA ASIGNATURA

    El efecto sobre la Nota de Cursado no agota las consecuencias de una AE1 incompleta. El Resumen y los Capítulos I y
    II son partes constitutivas del informe que se evalúa como Producto Final de la AE4. Si faltan, el Producto Final no
    puede declararse completo y, por lo tanto, la AE4 no cierra. Dicho de otro modo: una AE1 abandonada no cuesta un
    punto, cuesta la asignatura.



1.2 · Por qué el cuatrimestre empieza por el diagnóstico
Podría objetarse que empezar por un diagnóstico de tres semanas retrasa el desarrollo. La objeción tiene respuesta,
y es empírica antes que doctrinaria. Boehm (1981) documentó que el costo de corregir un defecto crece de manera
aproximadamente geométrica con la fase en que se lo detecta: un error de requisitos descubierto en producción
cuesta órdenes de magnitud más que el mismo error advertido durante el análisis. Glass (2002) lo formula con
mayor crudeza al señalar que los defectos de requisitos constituyen la fuente más costosa de retrabajo en los
proyectos de software. Y Brooks (1987), en No Silver Bullet, sostiene que la parte difícil de construir software no es la
codificación sino la especificación, el diseño y la validación de la construcción conceptual: lo accidental se abarata
con herramientas, lo esencial no.

Escribir código antes de haber enunciado el problema con precisión no acelera el proyecto. Lo que hace es trasladar
el trabajo de análisis al futuro, cuando ya existe código escrito que lo condiciona y encarece. Por eso esta actividad
se cierra con un prototipo sin una sola línea de código, y por eso la consigna aclara que escribirlo antes de que
existan requisitos especificados no se valora positivamente.


    ≡ EN SÍNTESIS

       • La AE1 es el Resumen y los Capítulos I y II del informe de tribunal, no un trabajo paralelo.
       • No lleva nota, pero su ausencia impide cerrar la AE4 y puede dejar al estudiante en condición de Libre.
       • El diagnóstico precede al código porque el costo del error de requisitos crece con la fase.




                                 Guía de consignas AE1 · UCP · Ingeniería en Sistemas de Información · Pág. 4


---

                                                                                              Actividad de Evaluación N.º 1 · Proyecto Final de Grado 2026




2 · Qué se entrega y en qué fechas
La entrega consta de cuatro objetos, cargados en la tarea habilitada del aula virtual. La ausencia de cualquiera de
ellos impide declarar completa la actividad.

 #            Objeto                                  Qué debe contener y cómo se verifica

     1        Documento único en PDF                  Resumen (máx. 600 palabras) · Capítulo I · Capítulo II. Formato conforme a los Arts.
                                                      20.º y 21.º. Extensión orientativa de doce a veinte páginas, excluidos anexos. Un
                                                      solo archivo: no se aceptan capítulos en archivos separados.

     2        Enlace al repositorio versiona‐         Historial que permita observar la distribución real del trabajo entre integrantes. Un
              do                                      repositorio con un único commit del día anterior a la entrega es, en sí mismo, un
                                                      dato de proceso.

     3        Enlace al tablero de gestión            Tarjetas con responsable, estado y fecha. Documenta la planificación efectiva de las
                                                      tres semanas de relevamiento.

     4        Enlace al prototipo v0                  Maqueta navegable de baja fidelidad, no funcional, más la constancia de validación
                                                      con el referente de la organización.


A esos cuatro objetos, que se cargan en la tarea individual, se suman tres componentes más: el Informe Grupal de
Encuadre Común, que el grupo carga una sola vez en una tarea propia; el Portafolio Digital; y la Bitácora Individual
de cada integrante.


         LOS CUATRO COMPONENTES CUYA VERIFICACIÓN DETERMINA EL ESTADO

         1 · Producto principal — Resumen y Capítulos I y II, en PDF, con los tres enlaces.
         2 · Informe Grupal de Encuadre Común — documento colectivo, uno por grupo.
         3 · Portafolio Digital — instrumentos y evidencias de proceso.
         4 · Bitácora Individual — una por integrante, sin excepción.

         La ausencia de cualquiera de los cuatro determina Entrega Incompleta, con independencia de la calidad de los res‐
         tantes.



2.1 · Calendario del ciclo completo

 Momento                                       Fecha                                 Qué ocurre

 Entrega                                       Jueves 3 de septiembre de             Clase 7 · 19:40 a 22:50 h · Aula 28. Carga asincrónica en el
                                               2026, hasta las 23:59 h               aula virtual.

 Devolución docente                            Jueves 10 de septiembre de            Devolución escrita sobre las seis dimensiones de la
                                               2026                                  rúbrica, con dictamen expreso de Entrega Completa o
                                                                                     Entrega Incompleta.

 Ventana de Mejora y Cumplimiento              Viernes 11 al viernes 18 de           Ocho días corridos. Rigen tres situaciones distintas,
                                               septiembre de 2026, inclusi‐          detalladas más abajo.
                                               ve




                                       Guía de consignas AE1 · UCP · Ingeniería en Sistemas de Información · Pág. 5


---

                                                                                        Actividad de Evaluación N.º 1 · Proyecto Final de Grado 2026




2.2 · Las tres situaciones dentro de la Ventana
La Ventana de Mejora y Cumplimiento no es una segunda fecha de entrega equivalente a la primera. Dentro de ella
conviven tres situaciones que conviene no confundir.

  1. El equipo cuya entrega fue declarada completa puede mejorarla de manera voluntaria. La cátedra no queda
      obligada a emitir una segunda devolución escrita.
  2. El equipo cuya entrega fue declarada incompleta debe volver a presentarla y recibe una segunda revisión.
  3. El equipo que no entregó en el primer llamado puede realizar allí su primera presentación, con una advertencia
      expresa: esa presentación es definitiva y, si queda incompleta, no existe instancia posterior para esta actividad.


      ⚠ ERROR FRECUENTE — «ENTREGO DIRECTAMENTE EN LA VENTANA»

      Entregar en el primer llamado no equivale a entregar en la Ventana. Sólo la primera fecha habilita el ciclo completo
      de producción, retroalimentación y reelaboración. Quien difiere su primera presentación renuncia a la devolución: se
      juega la actividad en un único intento, sin corrección previa. El cálculo, además, suele ser erróneo: quien no llegó con
      tres semanas rara vez llega con ocho días adicionales y una entrega más encima.



2.3 · El componente grupal: el Informe de Encuadre Común
El régimen institucional establece que esta actividad es grupal, en la subcategoría de Pareja o de Trío. En la mayoría
de las asignaturas el requisito se satisface sin dificultad, porque el producto de cursada admite autoría colectiva.
Aquí no: las cuatro actividades operan sobre el informe del Proyecto Integrador Final de cada estudiante, y fusionar
proyectos ya definidos para cumplir un requisito de forma produciría dos trabajos mutilados en lugar de uno colecti‐
vo.

La cátedra resuelve la tensión disociando el producto de la instancia. Cada estudiante entrega, por separado, el
Resumen y los Capítulos I y II de su propio proyecto. Y cada grupo entrega, una sola vez, un documento de autoría
genuinamente colectiva: el Informe Grupal de Encuadre Común.

Qué contiene, y por qué no es un artificio
Repare en un hecho que viene de la Clase 4. Los proyectos de un grupo tienen sectores de problema distintos —uno
interviene sobre un centro de estética, otro sobre una pericia forense, otro sobre un mercado de oficios—. Pero el
sector del cual provienen los recursos de la solución es el mismo para todos: el de Software y Servicios Informáti‐
cos argentino y del Nordeste. Costo de hora, disponibilidad de perfiles en Posadas, Ley N.º 27.506 de Economía del
Conocimiento, CESSI, Polo IT Corrientes y Polo IT Chaco.

Ese encuadre puede producirse una sola vez, en común, y es legítimamente de autoría colectiva. Los tres integran‐
tes lo necesitan, es idéntico para los tres, y acordarlo exige discutir qué fuentes emplear y someterlas a la regla de
las tres preguntas con criterio único.


      ◆ EL EFECTO QUE VUELVE VALIOSO ESTE DISPOSITIVO

      Al separar los dos sectores en dos documentos distintos —el sector del problema en cada informe individual, el
      sector de los recursos en el informe grupal— la distinción exigida por el apartado iii deja de ser una advertencia que
      hay que recordar y pasa a ser la estructura de los archivos. El error más sancionado del Capítulo II se vuelve difícil de
      cometer.




                                 Guía de consignas AE1 · UCP · Ingeniería en Sistemas de Información · Pág. 6


---

                                                                                              Actividad de Evaluación N.º 1 · Proyecto Final de Grado 2026




 §            Apartado                                          Qué contiene

     1        Identificación del grupo                          Integrantes, proyectos, responsable de carga y enlace al documento nativo.

     2        La dificultad diagnóstica común                   Qué obstáculo metodológico enfrentan los tres proyectos. No qué
                                                                comparten como rubro.

     3        Cuadro comparativo                                Cómo resuelve cada proyecto la misma dificultad, con declaración de cuál
                                                                solución resultó la más sólida.

     4        Encuadre del sector de los recursos               Delimitación, fuentes con las tres preguntas, perfiles y costos, marco
                                                                promocional, instituciones e implicancias decisorias.

     5        Coordinación del trabajo                          Reparto de responsabilidades y criterio de resolución de desacuerdos.

     6        Registro de decisiones                            Qué se decidió, qué alternativas se evaluaron y quién sostuvo cada posi‐
                                                                ción.

     7        Declaración de producción común                   Coautoría declarada, para incorporar el encuadre al apartado II.5 de cada
                                                                informe individual.

Los siete apartados del Informe Grupal. La plantilla completa se publica por separado.


Cuándo se escribe
En la semana 3, no en la primera. Antes de disponer de relevamiento propio, el grupo no sabe todavía qué
comparte, y un encuadre redactado el 25 de agosto resulta genérico. La secuencia que funciona es la inversa: cada
integrante releva, y recién cuando los tres disponen de diagnóstico se reúnen a escribir qué tienen en común.


         ▶ UNA REGLA TÉCNICA QUE DECIDE SI LA EVIDENCIA EXISTE

         El informe grupal se redacta como un único Documento de Google nativo, alojado en el Portafolio del responsable
         de carga, con permiso de edición para los demás. Cada integrante conserva en su propio Portafolio el enlace, no una
         copia. Si el archivo se duplica, el historial de versiones se fragmenta y desaparece la evidencia que permite
         reconstruir quién escribió qué en la parte colectiva. Sólo el PDF definitivo se sube como archivo.



         ⚠ ESTAR DENTRO DEL DOCUMENTO DEL GRUPO NO ACREDITA CONTRIBUCIÓN

         La contribución individual se prueba en cuatro lugares, y ninguno es el documento entregado: el historial del
         repositorio bajo identidad propia; el elemento 4 de la Bitácora; el historial del documento nativo del grupo; y, si
         hiciera falta, la Instancia Oral de Validación. Por eso la dimensión 6 de la rúbrica se evalúa de manera individual
         aunque el producto sea grupal: un grupo puede entregar un documento excelente y tener un integrante observado
         en esa dimensión.




                                       Guía de consignas AE1 · UCP · Ingeniería en Sistemas de Información · Pág. 7


---

                                                                                          Actividad de Evaluación N.º 1 · Proyecto Final de Grado 2026




3 · Capítulo I — Definición del Proyecto
Seis apartados. Cada uno responde una pregunta distinta y ninguno admite ser resuelto con los materiales de
otro.

 §          Apartado                                 Pregunta que responde

     I.1    Origen del proyecto                      ¿Por qué este proyecto existe? ¿Qué lo desencadena y con qué evidencia?

     I.2    Misión, visión y objetivos               ¿Qué se propone el proyecto —no la organización— y hacia dónde apunta?

     I.3    Necesidad o problema                     ¿Cuál es exactamente el problema, medido con qué indicador y sobre qué línea
                                                     de base?

     I.4    ODS asociados y diferenciales            ¿A qué Objetivo de Desarrollo Sostenible contribuye y de qué manera verificable?

     I.5    Descripción breve del SI                 ¿Qué es el sistema, para quien dispone de dos minutos?

     I.6    Descripción detallada del SI             ¿Qué queda dentro de la frontera, qué queda fuera y por qué motivo?



3.1 · I.1 — Origen del proyecto: los desencadenantes y la subordinación
causal
Todo proyecto de sistema de información nace de algo. La cátedra reconoce cinco desencadenantes posibles: dis‐
función operativa, oportunidad de negocio, exigencia normativa, obsolescencia tecnológica y presión competitiva.
Una organización real casi nunca exhibe uno solo. Lo habitual es que exhiba tres o cuatro simultáneamente, y ahí
empieza el trabajo intelectual.

El apartado no se satisface enumerando los desencadenantes presentes. Se satisface jerarquizándolos: declarar cuál
es el dominante, acreditar cada uno con evidencia y explicar por qué los restantes le quedan subordinados. Esa su‐
bordinación no es retórica: es causal. Un desencadenante queda subordinado a otro cuando resolver el dominante
lo desactiva, lo atenúa o lo convierte en secundario.


       ▶ EJEMPLO — JERARQUIZACIÓN EN EL CASO «SANTA ANA»

       La Cooperativa Yerbatera «Santa Ana» exhibe simultáneamente: disfunción operativa —cuatro jornadas administrati‐
       vas de conciliación por quincena entre tres balanzas cuyas planillas no cierran—; exigencia normativa —dos multas
       del regulador en el último ejercicio por presentación tardía de la declaración jurada—; y presión competitiva latente,
       en la medida en que los once días de demora en la acreditación deterioran la relación con los productores frente a
       compradores que pagan antes.

       La jerarquización defendible sitúa como dominante a la disfunción operativa, con este argumento: las multas no se
       originan en desconocimiento de la norma sino en la imposibilidad material de consolidar los datos a tiempo, y la
       demora de once días es el mismo fenómeno visto desde el productor. Resolver la conciliación desactiva los tres. La
       relación inversa no se verifica: pagar las multas no reduce las cuatro jornadas de conciliación. Eso es subordinación
       causal, y así se redacta.




                                   Guía de consignas AE1 · UCP · Ingeniería en Sistemas de Información · Pág. 8


---

                                                                                             Actividad de Evaluación N.º 1 · Proyecto Final de Grado 2026




         ✦ ¿POR QUÉ DECIDISTE ESTO?

         «Ustedes declararon dominante al desencadenante X. Supongamos que lo resuelven por completo. ¿Qué pasa con
         los otros dos? Si siguen exactamente igual de intensos, entonces X no era el dominante: era uno más.»



3.2 · I.2 — Misión, visión y objetivos del proyecto
Punto donde se pierde tiempo con regularidad. Los que se piden son la misión, la visión y los objetivos del proyecto,
no los de la organización relevada. La cooperativa, la clínica o la distribuidora ya tienen los suyos, con frecuencia
publicados en su sitio; transcribirlos no constituye trabajo. Lo que se pide es la formulación de qué se propone el
proyecto de sistema de información en sí mismo, con qué horizonte y bajo qué objetivos.

Los objetivos admiten una regla de escritura sencilla y verificable: la formulación SMART de Doran (1981) —
específico, medible, alcanzable, relevante y acotado en el tiempo—. Un objetivo que no puede declararse cumplido
o incumplido mediante una observación no es un objetivo: es una aspiración.


         ⚠ ERROR FRECUENTE

         «Optimizar los procesos de la organización mejorando la eficiencia y brindando una mejor experiencia a los
         usuarios.» Cuatro sustantivos abstractos y ningún criterio de verificación. Reformulado: «Reducir de once a tres días
         el plazo entre el cierre de quincena y la acreditación al productor, medido sobre las liquidaciones del primer trimestre
         posterior a la puesta en marcha.»



3.3 · I.3 — El problema: cinco componentes y línea de base
Éste es el corazón del capítulo y, con alta probabilidad, del cuatrimestre entero. La cátedra exige que el problema se
enuncie con cinco componentes y con línea de base numérica, no con adjetivos.

 #            Componente                           Qué consigna

     1        Sujeto afectado                      Quién padece el problema. Un rol identificado dentro de la organización o de su
                                                   entorno, no «la empresa» ni «los usuarios».

     2        Manifestación observable             Qué ocurre, descrito de manera que un tercero pueda constatarlo sin interpretar.

     3        Magnitud e indicador                 Cuánto ocurre y con qué unidad se mide. Aquí vive la línea de base.

     4        Contexto y frecuencia                Dónde y cada cuánto se verifica. Un problema mensual y uno permanente exigen
                                                   soluciones distintas.

     5        Consecuencia acreditada              Qué produce ese estado de cosas: costo, multa, pérdida de cliente, riesgo asumido.
                                                   Con evidencia.




                                      Guía de consignas AE1 · UCP · Ingeniería en Sistemas de Información · Pág. 9


---

                                                                                        Actividad de Evaluación N.º 1 · Proyecto Final de Grado 2026




    ◆ CONCEPTO CLAVE — LÍNEA DE BASE

    La línea de base es el valor actual del indicador, medido antes de intervenir. Cumple tres funciones simultáneas y
    ninguna es prescindible: (a) convierte el problema en algo falsable; (b) permite derivar el criterio de éxito del proyec‐
    to, que es el valor objetivo del mismo indicador; y (c) habilita, en noviembre, la demostración ante el tribunal de que
    el sistema hizo algo verificable. Sin línea de base no hay criterio de éxito, y sin criterio de éxito la defensa se reduce a
    mostrar pantallas.

    DeMarco (1982) resumió el principio con una frase que esta cátedra hace propia: no se controla aquello que no se
    mide. Kaplan y Norton (1992) agregan la contracara: aquello que se mide es lo que efectivamente se gestiona, de
    modo que la elección del indicador no es un detalle metodológico sino una decisión de diseño.



    ▶ EJEMPLO — EL MISMO PROBLEMA, MAL Y BIEN ENUNCIADO

    Insuficiente: «La cooperativa tiene un proceso de liquidación ineficiente y desactualizado que genera malestar entre
    los productores.»

    Suficiente: «Los productores asociados a la Cooperativa «Santa Ana» (1 · sujeto) reciben la acreditación de su
    liquidación quincenal con una demora promedio de once días desde el cierre de quincena (2 y 3 · manifestación e
    indicador), situación que se verifica en la totalidad de las veinticuatro quincenas del ejercicio (4 · contexto y
    frecuencia) y que en el último ejercicio derivó en dos multas del organismo regulador por presentación tardía de la
    declaración jurada, además de 6,4 % de pesadas con reclamo por diferencia de peso (5 · consecuencia acreditada).»

    Criterio de éxito derivado: reducir la demora de once a tres días y las pesadas con reclamo de 6,4 % a menos de 2 %,
    medidos sobre el primer trimestre de operación.



    ✦ ¿POR QUÉ DECIDISTE ESTO?

    «El indicador que eligieron es la demora en días. ¿Por qué ése y no el porcentaje de reclamos? ¿Qué mide cada uno
    que el otro no mide? Y si el sistema mejora uno y empeora el otro, ¿cómo lo declaran?»



3.4 · I.4 — ODS asociados y diferenciales
La Agenda 2030 para el Desarrollo Sostenible, adoptada por la Asamblea General de las Naciones Unidas mediante
la Resolución A/RES/70/1 (2015), fija diecisiete objetivos con ciento sesenta y nueve metas y un sistema de
indicadores asociado. El apartado pide uno o dos objetivos, con la contribución específica enunciada y, en lo posible,
el indicador que la haría verificable.

Repárese en la palabra «diferenciales» del enunciado reglamentario: no se trata de listar los objetivos con los que el
proyecto guarda alguna afinidad semántica, sino de identificar aquellos sobre los que el sistema produce una
diferencia atribuible. La prueba es sencilla: si el objetivo invocado seguiría siendo igual de pertinente para cualquier
otro proyecto de la comisión, no es diferencial.


    ⚠ ERROR FRECUENTE — LA LISTA ORNAMENTAL

    Consignar seis objetivos «asociados» sin una sola línea de contribución. Vale más un objetivo con la meta específica
    citada y el mecanismo de contribución explicado en tres oraciones, que seis con enunciados genéricos. Un objetivo
    bien argumentado es un apartado aprobado; seis mal argumentados son un apartado observado.




                                Guía de consignas AE1 · UCP · Ingeniería en Sistemas de Información · Pág. 10


---

                                                                                        Actividad de Evaluación N.º 1 · Proyecto Final de Grado 2026




3.5 · I.5 y I.6 — Descripción breve y descripción detallada
La descripción breve ocupa alrededor de media página. Es la que leería quien dispone de dos minutos: un director,
un evaluador, un potencial financiador. Debe permitir responder qué hace el sistema, para quién y qué cambia, sin
recurrir a jerga innecesaria.

La descripción detallada establece el alcance, la frontera y las exclusiones declaradas con su motivo. La noción de
frontera proviene de la teoría general de sistemas —Bertalanffy (1968)— y no es un tecnicismo prescindible: definir
un sistema es, ante todo, decidir qué queda adentro, qué queda afuera y qué atraviesa el límite en forma de entrada
o de salida. La regla operativa de la cátedra: por cada elemento incorporado al alcance, uno excluido con su moti‐
vo. Un alcance sin exclusiones no es amplio: es indefinido, y un alcance indefinido es la causa más frecuente de
proyectos que no cierran en noviembre.




                                Guía de consignas AE1 · UCP · Ingeniería en Sistemas de Información · Pág. 11


---

                                                                                           Actividad de Evaluación N.º 1 · Proyecto Final de Grado 2026




4 · Capítulo II — Relevamiento e Investigación de
Mercado
Si el Capítulo I enuncia, el Capítulo II acredita. Todo lo afirmado en el primero debe poder rastrearse hasta un
dato del segundo.

 §          Apartado                                    Qué debe contener

     II.1   Fuentes de datos utilizadas                 Primarias y secundarias, con identificación de interlocutores y documentos.

     II.2   Instrumentos, dinámicas y alcance           Qué instrumento se aplicó, a quién, cuándo, con qué cobertura y qué quedó
                                                        fuera.

     II.3   Presentación de los datos recabados         Los datos en bruto, ordenados. Sin interpretación todavía.

     II.4   Gráficos y variables de análisis            Representación de los datos y declaración de qué variable mide cada eje.

     II.5   Análisis de la información                  Entorno —PESTEL, cadena de valor, FODA— y encuadre sectorial.

     II.6   Conclusiones del relevamiento               Qué se sabe ahora que no se sabía antes, y qué decisión habilita.



       PRECISIÓN SOBRE LAS CINCO FUERZAS DE PORTER

       El modelo de las cinco fuerzas competitivas (Porter, 1980) se estudia en la Clase 3 y se emplea en esta entrega como
       herramienta de lectura del sector. Su ubicación definitiva en el informe, sin embargo, es el Capítulo IV, «Modelo de
       Negocios», bajo la denominación reglamentaria de análisis de rivalidad amplificada. En el Capítulo II se usa; en el
       Capítulo IV se consolida. Consúltese el Instrumento 10 antes de decidir dónde ubicar cada pieza de análisis.



4.1 · La escalera de la demanda: imaginada, declarada y revelada
El relevamiento persigue un objetivo que no es obvio: distinguir tres estados de la demanda que se confunden con
facilidad y cuyo valor probatorio es radicalmente distinto.

 Estado                               Qué es                                               Valor probatorio

 Demanda imaginada                    Lo que el equipo supone que la organiza‐             Nulo. Es una hipótesis del equipo, no un dato.
                                      ción necesita.                                       Puede abrir el trabajo; jamás sostenerlo.

 Demanda declarada                    Lo que el referente dice que necesita                Medio. Informativa, pero sujeta a deseabilidad
                                      cuando se le pregunta.                               social, a racionalización posterior y al límite del
                                                                                           conocimiento tácito.

 Demanda revelada                     Lo que la conducta observada muestra:                Alto. Es evidencia de comportamiento, no de in‐
                                      qué se hace hoy, con qué esfuerzo, qué               tención.
                                      solución artesanal ya existe, qué se paga.


La distinción tiene pedigrí teórico. Samuelson (1938) fundó sobre la preferencia revelada la idea de que la elección
efectiva informa mejor que la declaración de preferencia. Polanyi (1966) explica el otro extremo del problema:
buena parte del conocimiento operativo es tácito —«sabemos más de lo que podemos decir»—, de modo que un




                                   Guía de consignas AE1 · UCP · Ingeniería en Sistemas de Información · Pág. 12


---

                                                                                            Actividad de Evaluación N.º 1 · Proyecto Final de Grado 2026




informante competente puede ser incapaz de enunciar cómo hace lo que hace. De ahí que la entrevista, por sí sola,
resulte insuficiente y que la observación directa del proceso sea irremplazable.


         ▶ EJEMPLO — EL INDICIO MÁS VALIOSO DEL RELEVAMIENTO

         Si en la administración de la cooperativa existe una planilla de cálculo hecha a mano, mantenida por una persona
         concreta, con fórmulas propias y una copia semanal enviada por mensajería instantánea, eso es demanda revelada
         en estado puro: alguien ya está pagando el costo de resolver el problema con los medios que tiene. Fotografiar esa
         planilla, entender por qué la construyó y qué columnas agregó con el tiempo vale más que diez respuestas
         afirmativas a la pregunta «¿le serviría un sistema?».



4.2 · La regla de las tres preguntas
Ningún dato estadístico entra en el informe sin que estas tres preguntas estén contestadas junto al dato, en el
mismo párrafo o en la nota al pie.

 #            Pregunta                                  Por qué importa

     1        ¿Quién lo produjo?                        Institución, propósito de la publicación e interés declarado. Una cámara
                                                        empresaria, un organismo público y una consultora privada no tienen los
                                                        mismos incentivos al informar sobre el mismo fenómeno. Esto no los invalida:
                                                        obliga a leerlos sabiendo desde dónde hablan.

     2        ¿Con qué método y sobre qué uni‐          Encuesta o registro; muestra o censo; qué actividades incluye y cuáles excluye.
              verso?                                    Es la pregunta que explica la mayoría de las discrepancias entre fuentes que
                                                        aparentan medir lo mismo.

     3        ¿Para qué período de referencia?          Período de referencia, no fecha de publicación. Una cifra de hace tres años
                                                        puede ser perfectamente válida si se la presenta como lo que es; presentada
                                                        como actual, compromete el capítulo entero.



         ◆ CONCEPTO CLAVE — LA REGLA SE APLICA TAMBIÉN A LAS FUENTES PRESTIGIOSAS

         El caso más instructivo es el informe CHAOS del Standish Group, citado durante décadas para afirmar que una
         mayoría abrumadora de proyectos de software fracasa. Jørgensen y Moløkken-Østvold (2006) sometieron esas cifras
         a las tres preguntas y encontraron problemas serios de definición de «fracaso», de composición de la muestra y de
         método de recolección. La lección no es que el dato sea falso: es que una cifra sin metodología declarada no es un
         dato, es una opinión con apariencia de número, por prestigiosa que resulte la fuente.



4.3 · Regla de encuadre sectorial
Distinción sencilla de enunciar y frecuentemente mal resuelta: el sector donde vive el problema no es el sector del
cual provienen los recursos de la solución. Confundirlos constituye el error más sancionado de este capítulo.




                                    Guía de consignas AE1 · UCP · Ingeniería en Sistemas de Información · Pág. 13


---

                                                                                        Actividad de Evaluación N.º 1 · Proyecto Final de Grado 2026




    ▶ EJEMPLO — DOS SECTORES, DOS LUGARES DEL INFORME

    En el caso «Santa Ana», el sector donde vive el problema es el yerbatero: su estructura productiva, su regulación, su
    estacionalidad, sus precios de referencia, sus actores. El sector del cual provienen los recursos es el de Software y
    Servicios Informáticos: quién desarrolla, con qué costo de hora, con qué disponibilidad de perfiles en Posadas, bajo
    qué régimen promocional —Ley N.º 27.506 de Economía del Conocimiento—, con qué instituciones de articulación
    —CESSI, Polo IT Corrientes, Polo IT Chaco—.

    Ambos van en el informe, en lugares distintos y con propósitos distintos. El primero fundamenta el problema; el
    segundo fundamenta la factibilidad de la solución y, más adelante, el Capítulo X de recursos.



4.4 · Implicancia decisoria: se cuentan implicancias, no filas
Cada elemento del análisis del entorno —cada factor del PESTEL, cada actividad de la cadena de valor, cada celda del
FODA— debe declarar su implicancia decisoria: qué decisión del proyecto cambia por causa de ese elemento.

La consigna es explícita en el criterio de cómputo: una matriz de seis factores con consecuencias explícitas vale más
que una de treinta sin ellas. Una matriz sin implicancias es un ejercicio de llenado; con implicancias, es un
instrumento de diseño.


    ▶ EJEMPLO — FACTOR CON Y SIN IMPLICANCIA DECLARADA

    Sin implicancia: «Factor tecnológico: creciente adopción de dispositivos móviles en el sector agropecuario.»

    Con implicancia: «Factor tecnológico: los tres puestos de balanza operan con conectividad intermitente, verificada en
    la visita del 19 de agosto. Implicancia decisoria: la captura de pesada debe funcionar sin conexión y sincronizar en
    diferido; esto excluye una arquitectura íntegramente web y condiciona el modelo de datos, que requiere
    identificadores generados en el cliente y resolución de conflictos en la consolidación.»



    ✦ ¿POR QUÉ DECIDISTE ESTO?

    «Tomo un factor cualquiera de su PESTEL. Si lo borro de la matriz, ¿qué decisión del proyecto cambia? Si la respuesta
    es "ninguna", entonces ese factor no pertenece al análisis: pertenece al relleno.»



4.5 · Documentación del contacto con la organización
Todo contacto se documenta con tres elementos: persona identificada, canal concreto y motivo declarado. La con‐
signa lo formula con una frase que conviene retener: la organización no debe ser solamente existente, debe ser ac‐
cesible.

La distinción es operativa. Una organización que existe pero no responde correos, no concede entrevistas y no valida
el prototipo no sirve como sustrato de un Proyecto Integrador Final, por interesante que resulte su problema. La
accesibilidad se acredita ahora, en agosto, cuando todavía queda margen para cambiar de organización, y no en
octubre, cuando ya no lo hay.




                                Guía de consignas AE1 · UCP · Ingeniería en Sistemas de Información · Pág. 14


---

                                                                                  Actividad de Evaluación N.º 1 · Proyecto Final de Grado 2026




≡ EN SÍNTESIS

  • Todo dato pasa por las tres preguntas; la respuesta se consigna junto al dato.
  • La demanda revelada supera a la declarada, y la declarada a la imaginada.
  • Sector del problema y sector de los recursos van en el informe, en lugares distintos.
  • Se cuentan implicancias decisorias declaradas, no filas completadas.
  • El contacto se documenta con persona, canal y motivo.




                          Guía de consignas AE1 · UCP · Ingeniería en Sistemas de Información · Pág. 15


---

                                                                                        Actividad de Evaluación N.º 1 · Proyecto Final de Grado 2026




5 · El Resumen y el prototipo v0

5.1 · El Resumen
Máximo de 600 palabras, conforme al Art. 22.2. Es un máximo reglamentario, no una sugerencia orientativa. Se re‐
dacta último —cuando ya existe algo que resumir— y se actualiza en cada entrega posterior, de modo que en
noviembre refleje el informe completo y no el estado de agosto.

Un resumen del PIF cumple cinco funciones en ese orden: sitúa la organización y su problema; enuncia la línea de
base; declara qué sistema se propone; indica cómo se lo desarrolla; y anticipa el criterio de éxito. Lo que no hace es
prometer, adjetivar ni anunciar.


     ⚠ ERROR FRECUENTE

     Un resumen que empieza con «En el mundo actual, la tecnología avanza a pasos agigantados…». Ese párrafo no
     informa nada sobre el proyecto y consume el diez por ciento del cupo. El resumen empieza por la organización y el
     problema, en la primera oración.



5.2 · El prototipo v0
Maqueta navegable, de baja fidelidad, no funcional, construida sobre el flujo efectivamente relevado y validada
con el referente de la organización. Se entrega el enlace al prototipo y la constancia de esa validación.

Tres adjetivos y una condición, y cada uno importa. Navegable: las pantallas se conectan entre sí; se puede recorrer
el flujo de principio a fin. Baja fidelidad: sin decisiones estéticas, sin paleta definitiva, sin tipografías elegidas; trazos,
cajas y etiquetas. No funcional: no calcula, no persiste, no valida. Y la condición: el flujo debe reproducir lo que la
organización hace hoy o lo que declaró necesitar, no lo que al equipo le parece razonable.


     ◆ CONCEPTO CLAVE — POR QUÉ BAJA FIDELIDAD Y NO ALTA

     La investigación en ingeniería de usabilidad es consistente al respecto: los prototipos de baja fidelidad obtienen
     crítica más franca y más temprana que los de alta fidelidad. Nielsen (1993) y Snyder (2003) documentan el fenómeno
     con claridad: ante una maqueta que parece terminada, el interlocutor supone que cambiarla es costoso y modera sus
     objeciones; ante trazos evidentemente provisorios, señala sin reservas lo que está mal. La baja fidelidad no es una
     limitación del equipo: es una decisión metodológica que maximiza el rendimiento de la validación.

     Pressman (2011) ubica esta pieza en el modelo de prototipado con la misma advertencia: el prototipo existe para
     reducir incertidumbre sobre requisitos, y su valor decrece a medida que se lo confunde con un adelanto del produc‐
     to.



     ⚠ ERROR FRECUENTE — «ADELANTAMOS CÓDIGO PARA GANAR TIEMPO»

     No se exige, ni se valora positivamente, una sola línea de código escrita antes de que existan requisitos especificados.
     Un equipo que presenta un módulo funcionando en la AE1 no demuestra adelanto: demuestra que decidió la
     arquitectura antes de conocer el problema. Ese código, casi siempre, se descarta en octubre.




                                Guía de consignas AE1 · UCP · Ingeniería en Sistemas de Información · Pág. 16


---

                                                                                           Actividad de Evaluación N.º 1 · Proyecto Final de Grado 2026




6 · Las seis exigencias que la corrección verifica
La consigna enumera seis exigencias que se verifican de manera específica, una por una, sobre el documento
entregado. Se reproducen aquí con su criterio de verificación.

 #         Exigencia                                   Cómo se verifica

     i     Problema con cinco componentes y            Se buscan los cinco componentes en el enunciado y se busca un número con
           línea de base numérica                      unidad. Si el problema se enuncia con adjetivos, la dimensión 4 de la rúbrica no
                                                       supera el nivel 1. De la línea de base debe derivarse el criterio de éxito, explíci‐
                                                       tamente.

     ii    Desencadenantes jerarquizados y             Se verifica que exista una declaración de cuál es el dominante y un argumento
           acreditados                                 de subordinación causal para los restantes, cada uno con su evidencia.

     iii   Distinción entre sector del proble‐         Se verifica que ambos estén presentes, separados y con propósito distinto.
           ma y sector de los recursos                 Confundirlos es el error más sancionado del Capítulo II.

     iv    Regla de las tres preguntas sobre           Se toma cualquier cifra del documento y se buscan las tres respuestas junto a
           todo dato estadístico                       ella. Una sola cifra sin las tres respuestas basta para observar la dimensión 1.

     v     Implicancia decisoria declarada por         Se cuentan implicancias, no filas. Se toma un elemento al azar y se pregunta qué
           elemento                                    decisión cambia si se lo suprime.

     vi    Contacto documentado con perso‐             Se verifica en el Portafolio Digital: correos, actas, guías de entrevista y registro
           na, canal y motivo                          de respuestas. La organización debe ser accesible, no solamente existente.




                                   Guía de consignas AE1 · UCP · Ingeniería en Sistemas de Información · Pág. 17


---

                                                                                       Actividad de Evaluación N.º 1 · Proyecto Final de Grado 2026




7 · Aspectos formales (Arts. 20.º y 21.º)
Rigen desde esta primera entrega y no desde el cierre del cuatrimestre, porque lo entregado es un capítulo del
mismo documento final.

 Aspecto                          Exigencia reglamentaria

 Hoja                             Tamaño A4.

 Márgenes                         Superior 2,5 cm · inferior 2,5 cm · izquierdo 3 cm · derecho 3 cm.

 Espaciado                        Dos líneas (interlineado doble).

 Tipografía                       Times New Roman. Cuerpo: 12. Notas y citas al pie: 10. Títulos, subtítulos, encabezado y pie:
                                  libre elección.

 Carátulas de capítulo            Cada capítulo comienza en hoja aparte, con numeral romano y título en mayúsculas,
                                  centrados. El texto comienza en la hoja siguiente sin repetir el título.

 Numeración                       Todas las páginas en forma correlativa, salvo los anexos, que se numeran de manera
                                  independiente indicando «página X de Y».

 Láminas                          Se insertan dentro del capítulo correspondiente y se numeran como una página. Se
                                  confeccionan y pliegan según normas IRAM.

 Unidades                         Sistema Métrico Legal Argentino (SIMELA, Ley N.º 19.511) y recomendaciones de escritura del
                                  Sistema Internacional.

 Bibliografía                     Normas APA.

 Redacción                        Impersonal, con verbos en presente y en afirmativo.




7.1 · La restricción de contenido del Art. 21.º y qué no significa
El artículo 21.º dispone que no deben exponerse desarrollos teóricos ni discusiones ajenas al desarrollo específico
del proyecto. El adjetivo es decisivo y suele leerse mal.

La norma no prohíbe discutir alternativas. Las alternativas sobre las decisiones propias del equipo no son ajenas:
constituyen el núcleo del trabajo de ingeniería y la dimensión 5 de la rúbrica las exige de manera expresa en el nivel
superior. Lo que la norma ordena es una distribución: la deliberación completa va a la bitácora y al Anexo III; el
cuerpo del capítulo consigna la decisión adoptada, su fundamento y la alternativa descartada, de manera sintética,
en dos o tres oraciones.


    ▶ EJEMPLO — CÓMO SE VE UNA ALTERNATIVA DESCARTADA EN EL CUERPO

    «La captura de pesada opera sin conexión con sincronización diferida. Se evalúa una alternativa de captura
    íntegramente web y se descarta por la conectividad intermitente verificada en los tres puestos de balanza durante la
    visita del 19 de agosto. El razonamiento completo consta en el Anexo III.»

    Tres oraciones: decisión, fundamento con evidencia fechada, alternativa descartada con criterio de descarte y
    remisión al anexo. Eso es lo que el artículo 21.º admite y lo que la rúbrica premia.



                               Guía de consignas AE1 · UCP · Ingeniería en Sistemas de Información · Pág. 18


---

                                                                                      Actividad de Evaluación N.º 1 · Proyecto Final de Grado 2026




7.2 · Ortografía y redacción
Conforme al criterio institucional, ortografía y redacción descuentan hasta un punto sobre diez: ortografía, 0,50 a
partir del sexto error; redacción, 0,50 a partir del cuarto error. Se computa como error de redacción la infracción a la
exigencia del artículo 21.º —redacción impersonal, verbos en presente y en afirmativo, criterio uniforme de formato
—.

En esta actividad formativa el descuento se informa en la devolución y no se traduce en nota. Conviene, de todos
modos, tomarlo en serio ahora: el mismo criterio se aplicará en las instancias que sí califican, y un documento de
ciento veinte páginas escrito por tres personas con tres criterios distintos no se unifica en la semana previa a la de‐
fensa.




                              Guía de consignas AE1 · UCP · Ingeniería en Sistemas de Información · Pág. 19


---

                                                                                         Actividad de Evaluación N.º 1 · Proyecto Final de Grado 2026




8 · Portafolio Digital y Bitácora Individual
Ninguno de los dos es material accesorio. Ambos son componentes de cierre: su ausencia o su insuficiencia
determina Entrega Incompleta aunque el documento principal resulte satisfactorio.


8.1 · Portafolio Digital
La cátedra publica en el aula virtual el enlace a la carpeta madre Portafolios digitales — Proyecto Final de Grado ·
Comisión A. Dentro de ella, cada estudiante crea su carpeta personal con nombre y apellido y, en su interior, las
subcarpetas AE1, AE2, AE3, AE4 y Trabajo Autónomo. Al cierre de la AE1, la subcarpeta correspondiente contiene:

 #        Contenido exigido

     a    Los instrumentos 1 a 22 completados: ficha individual de intereses y vínculos, acta de constitución del equipo firmada,
          fichas de precalificación de las organizaciones candidatas, plantillas de PESTEL, cinco fuerzas, cadena de valor y FODA, y
          registro de fuentes.

     b    La evidencia de contacto con la organización: correos, actas de reunión, guías de entrevista utilizadas y registro de las
          respuestas.

     c    Las versiones sucesivas del documento, de modo que resulte visible la evolución del diagnóstico.

     d    El enlace al repositorio versionado y al tablero de gestión, con historial que permita observar la distribución real del tra‐
          bajo.

     e    La devolución docente recibida y, si correspondiera, la versión mejorada con las correcciones señaladas.



8.2 · Bitácora Individual de Proceso y Decisiones
Por tratarse de una actividad grupal, la bitácora resulta obligatoria para cada integrante y se entrega junto con el
producto colectivo. Es individual, no compartida, y constituye la evidencia primaria del desempeño personal dentro
del equipo. Si la bitácora de un integrante falta o resulta insuficiente, la AE1 no puede cerrarse como completa res‐
pecto de ese estudiante, cualquiera sea la calidad del trabajo colectivo.

Cada entrada se fecha y consigna seis elementos:

 #        Elemento

     1    Qué se decidió en esa jornada de trabajo.

     2    Qué alternativas se evaluaron y con qué criterio se descartaron.

     3    Qué evidencia sostiene la decisión: dato relevado, fuente citada o principio de ingeniería invocado.

     4    Qué aportó personalmente el autor, con remisión al artefacto correspondiente del repositorio.

     5    Qué desacuerdo se produjo, si lo hubo, y cómo se resolvió conforme a la regla del acta de constitución.

     6    Qué herramienta auxiliar se utilizó y con qué alcance, conforme al Protocolo de Uso Autorizado.




                                 Guía de consignas AE1 · UCP · Ingeniería en Sistemas de Información · Pág. 20


---

                                                                                   Actividad de Evaluación N.º 1 · Proyecto Final de Grado 2026




◆ CONCEPTO CLAVE — LA BITÁCORA ALOJA LO QUE EL ART. 21.º EXCLUYE DEL CUERPO

La relación entre bitácora e informe es de complementariedad estricta. El cuerpo consigna la decisión, su
fundamento y la alternativa descartada de manera sintética; la bitácora conserva el razonamiento completo. Schön
(1983) describe esta práctica como la reflexión sobre la acción que distingue al profesional del ejecutor: no basta con
decidir bien, hay que poder reconstruir cómo se decidió. El tribunal, en noviembre, va a preguntar exactamente eso.




                           Guía de consignas AE1 · UCP · Ingeniería en Sistemas de Información · Pág. 21


---

```
