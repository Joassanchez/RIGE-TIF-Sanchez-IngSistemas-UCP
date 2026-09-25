# Guía de consignas · AE2

> Texto extraído por página de la guía oficial (versión sin página 29). Ante divergencia, prevalece el original.

<!-- página 1 -->
UNIVERSIDAD DE LA CUENCA DEL PLATA
Facultad de Ingeniería, Tecnología y Arquitectura · Ingeniería en Sistemas de Información
PROYECTO FINAL DE GRADO
Actividad de Evaluación N.º 2
Unidad Dos — Formulación de Proyectos de Sistemas de Información
Guía de consignas para el estudiante · Capítulos III, IV, V y X del informe del Proyecto Integrador Final, catálogo de requisitos y
prototipo v1
Este documento desarrolla la consigna oficial de la Actividad de Evaluación N.º 2 y la convierte en material de
trabajo. No la reemplaza ni la modifica: la explica. Donde la consigna enuncia una exigencia en una línea, aquí se
aclara qué se busca con ella, cómo se satisface y qué la distingue de una respuesta insuficiente. Léase completo
antes de escribir el primer párrafo del Capítulo III y vuélvase a consultar antes de subir los archivos al aula virtual,
con la lista de autoverificación del apartado 16 a la vista.
Docente Titular: PosDr. Darío Ezequiel Díaz · Comisión A · Sede Posadas
Entrega: jueves 1.º de octubre de 2026, hasta las 23:59 h · Modalidad presencial
Sprint 2 · Semanas 5 a 8 · del 7 de septiembre al 3 de octubre de 2026
ISI-PFG-2026C2-AE2-v02 · 2.º cuatrimestre 2026
<!-- página 2 -->
Cómo usar este documento
La guía se organiza en diecisiete apartados que siguen el orden natural del trabajo: primero qué es la actividad y qué
la separa de la anterior; después, capítulo por capítulo, qué debe contener el informe; a continuación el catálogo de
requisitos y el artefacto de software, que son las dos piezas nuevas de esta unidad; luego las nueve exigencias que la
corrección verifica una por una, los aspectos formales, los componentes de cierre y la rúbrica; y al final los errores
que la cátedra sanciona con mayor frecuencia y la lista de verificación previa a la entrega.
Se conservan los cinco tipos de recuadro de la guía anterior. Cada uno cumple una función distinta y ninguno es
decorativo.
◆ CONCEPTO CLAVE
Define una noción que se usará durante todo el cuatrimestre y que la defensa final volverá a pedir. Si un concepto
aparece en un recuadro de este tipo, se presume conocido en todas las entregas posteriores.
▶ EJEMPLO — CÓMO SE APLICA
Muestra la exigencia resuelta sobre un caso concreto, casi siempre la Cooperativa Yerbatera «Santa Ana»,
organización ficticia que la cátedra emplea como caso conductor desde la Clase 1. Nunca es un modelo para copiar:
es una demostración del nivel de precisión esperado.
⚠ ERROR FRECUENTE
Describe una falla observada en cohortes anteriores o en la corrección de la AE1 de esta misma comisión, con la
corrección correspondiente. Los errores consignados en estos recuadros no admiten indulgencia: están advertidos
por escrito y con antelación.
✦ ¿POR QUÉ DECIDISTE ESTO?
Contiene la pregunta textual que la cátedra formulará sobre ese punto, en el aula o en la Instancia Oral de Validación
y Fundamentación. Anticipar la respuesta es parte del trabajo, no un ejercicio opcional.
≡ EN SÍNTESIS
Comprime el apartado en tres o cuatro líneas verificables. Sirve para repasar antes de la entrega, jamás para sustituir
la lectura del desarrollo.
ADVERTENCIA SOBRE LA RELACIÓN ENTRE ESTE DOCUMENTO Y LA CONSIGNA OFICIAL
Ante cualquier divergencia entre esta guía y la Consigna de Actividad de Evaluación ISI-PFG-2026C2-AE2-v02,
prevalece la consigna oficial. Ante cualquier divergencia entre la consigna y la Resolución Rectoral UCP N.º 97/23,
prevalece la Resolución. Esta guía no crea obligaciones nuevas: interpreta las existentes.
Una corrección respecto de la guía de la AE1
La guía de consignas de la AE1 publicó, en su apartado 1, una tabla de correspondencia entre instancias evaluativas y
capítulos que asignaba a la AE2 los Capítulos III y IV con fecha 18 de septiembre, y difería los Capítulos V, VI, IX y X a
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 2
<!-- página 3 -->
un tercer trabajo práctico del 8 de octubre. Esa distribución quedó modificada. La consigna v02 y la planilla de
Sprints v2, ambas publicadas en el aula virtual, fijan la correspondencia vigente: la AE2 comprende los Capítulos III,
IV, V y X y se entrega el 1.º de octubre, mientras los Capítulos VI y IX se construyen durante el Sprint 3 y se
consolidan en la entrega integral del Sprint 4.
La modificación no es un cambio de humor administrativo. Responde a una razón de método: la planificación del
proyecto (Capítulo V) y el dimensionamiento de sus recursos (Capítulo X) carecen de sustento mientras no exista un
catálogo de requisitos con criterios de aceptación, porque planificar sin especificación produce cronogramas de
deseos. Una vez que el catálogo existe, en cambio, planificar y costear se vuelve una operación derivada y casi
mecánica. De allí que los cuatro capítulos viajen juntos.
Instancia Capítulos comprometidos Artefacto de software
AE1 · Sprint 1 — Clase 7 ·
03/09
Resumen · Capítulos I y II Prototipo v0 — maqueta navegable de
baja fidelidad
AE2 · Sprint 2 — Clase 15 ·
01/10
Capítulos III, IV, V y X · catálogo de requisitos Prototipo v1 — esqueleto arquitectónico
ejecutable
AE3 · Sprint 3 — Clase 23 ·
29/10
Capítulos VI y IX en versión de trabajo (la AE3 no
produce entregable documental del PIF)
Prototipo v2 — primer incremento
funcional con pruebas
AE4 · Sprint 4 — Clases 29 y 30 Capítulos VII, VIII, XI, XII y XIII; Conclusiones,
Bibliografía y Anexos, más VI y IX consolidados
Prototipo v3 y versión funcional
congelada, demostrada en vivo
Correspondencia vigente entre instancias evaluativas, capítulos del informe (Art. 22.4, R.R. 97/23) y cadencia de artefactos.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 3
<!-- página 4 -->
1 · Qué es la AE2 y qué la separa de la anterior
La AE1 acreditó que el problema existe. La AE2 debe acreditar que el proyecto es formulable, y lo hace mediante un
procedimiento distinto: ya no se releva, se especifica.
Conviene medir con precisión el desplazamiento, porque el equipo que no lo advierte suele producir un Capítulo III
que es una segunda versión del Capítulo II, con más páginas y ninguna decisión nueva. En la primera entrega el
trabajo consistió en salir a la organización, mirar, preguntar, registrar y ordenar lo registrado hasta que el malestar
difuso adquirió la forma de un problema con línea de base. La operación era descriptiva y su virtud, la fidelidad:
cuanto más se pareciera el informe a lo que efectivamente ocurre en la organización, mejor.
En esta entrega la operación es constructiva y su virtud es otra. Aquí se decide qué parte de ese mundo entra en el
sistema y qué parte queda afuera; qué entidades lo pueblan y con qué reglas; qué debe hacer el software y bajo qué
condición se dará por cumplido cada compromiso; en qué orden se construirá; y con qué recursos. Nada de eso se
releva. Todo eso se decide, y cada decisión debe poder rastrearse hasta una evidencia y explicarse frente a quien
pregunte por qué no se decidió de otro modo.
◆ CONCEPTO CLAVE — DE LA DESCRIPCIÓN A LA ESPECIFICACIÓN
Un relevamiento es verdadero o falso respecto de la organización. Una especificación no: una especificación es
satisfecha o incumplida respecto de un sistema que todavía no existe. Por eso el criterio de calidad cambia. En el
Capítulo II se pedía evidencia; en el Capítulo III se pide, además de evidencia, una condición de verificación. La
pregunta que gobierna toda la unidad es una sola: ¿cómo se comprobará que fue satisfecho?
1.1 · Régimen formativo, y la condición material que esta actividad agrega
La AE2 es grupal y formativa, con el mismo equipo constituido para la AE1. No produce calificación numérica. Se
cierra con uno de dos estados: Entrega Completa o Entrega Incompleta — requiere reelaboración. La rúbrica y el
descuento por ortografía y redacción operan como instrumentos de devolución y no se traducen en nota.
La incidencia académica es la misma que se explicó en la AE1 y conviene tenerla presente, porque el efecto se
acumula.
Estado de las actividades formativas Efecto sobre la Nota de Cursado
AE1 y AE2 completas Se conserva íntegro el promedio de la AE3 y la AE4.
Sólo una de las dos completa Se resta un (1) punto a ese promedio.
Ninguna completa La Nota de Cursado se fija en 5 y el estudiante queda en condición
de Libre.
Hasta aquí, lo conocido. La novedad de esta actividad es de otro orden, y está enunciada en la propia consigna con
una fórmula que conviene leer despacio: en esta actividad se agrega una condición material: un prototipo v1 que no
se ejecute impide declarar completo el Producto principal.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 4
<!-- página 5 -->
⚠ QUÉ SIGNIFICA EXACTAMENTE «CONDICIÓN MATERIAL»
Significa que hay un hecho del mundo, verificable por un tercero en una computadora que no es la de ustedes, del
cual depende el estado de la actividad. No se trata de una dimensión de la rúbrica que pueda compensarse con otras.
La cátedra clona el repositorio en la etiqueta v1 , sigue las instrucciones del archivo de lectura y ejecuta. Si el
proyecto no arranca, no compila o carece de instrucciones, el artefacto no se computa como entregado, con
independencia de la calidad del documento que lo acompañe. Un documento excelente con un esqueleto que no
corre da Entrega Incompleta.
1.2 · Por qué la especificación precede a la construcción
La objeción previsible es que cuatro semanas dedicadas a delimitar, especificar y planificar retrasan el desarrollo del
sistema que hay que demostrar en noviembre. La objeción tiene respuesta empírica. Boehm (1981) documentó que
el costo de corregir un defecto crece de manera aproximadamente geométrica con la fase en que se lo detecta; un
error de requisitos descubierto en producción cuesta órdenes de magnitud más que el mismo error advertido
durante el análisis. Wiegers y Beatty (2013) refinan el argumento con una observación que interesa a esta actividad
en particular: la mayor parte del retrabajo no proviene de requisitos equivocados sino de requisitos ambiguos, es
decir, de enunciados que el equipo y el referente entendieron distinto sin advertirlo, y que sólo se revelan
divergentes cuando el software ya está escrito. La norma ISO/IEC/IEEE 29148:2018 traduce esa experiencia en un
criterio operativo: un requisito bien formado es, entre otras propiedades, verificable, y verificable significa que existe
un procedimiento finito capaz de determinar si el sistema lo satisface.
De ahí que esta actividad no premie el adelanto de código. El prototipo v1 que se pide no es un fragmento del
sistema terminado: es la prueba de que la arquitectura decidida atraviesa efectivamente todas sus capas. Escribir
funcionalidad antes de haber cerrado el catálogo no acelera el proyecto; produce código que en octubre habrá que
descartar, porque fue escrito contra una especificación que todavía no existía.
≡ EN SÍNTESIS
La AE1 describía; la AE2 decide. Toda decisión exige evidencia de origen y criterio de verificación.
El estado se cierra como Completa o Incompleta, y arrastra un punto de la Nota de Cursado.
La condición material es nueva y no se compensa: si el v1 no se ejecuta, el Producto principal no se computa.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 5
<!-- página 6 -->
2 · Qué se entrega, dónde y en qué fechas
Cuatro objetos en la tarea del aula virtual y tres componentes cuya verificación determina el estado. La ausencia de
cualquiera de los tres componentes impide declarar completa la actividad.
# Objeto Qué debe contener y cómo se verifica
1 Documento único en PDF Capítulos III, IV, V y X, con el catálogo de requisitos como apartado del Capítulo
III. Formato conforme a los Arts. 20.º y 21.º. Extensión orientativa de dieciocho a
veintiocho páginas, excluidos anexos y catálogo. Un solo archivo: no se aceptan
capítulos en archivos separados.
2 Enlace al repositorio con la
etiqueta v1
La etiqueta debe existir y apuntar a la revisión que la cátedra ejecutará. El
historial debe permitir observar la distribución real del trabajo entre integrantes
durante las cuatro semanas, no durante los tres días previos.
3 Enlace al tablero de gestión
actualizado
Tarjetas con responsable, estado y fecha, organizadas por la iteración que el
Capítulo V declara. El tablero documenta la planificación efectiva; si su actividad
se concentra en el día de la entrega, documenta lo contrario.
4 Constancia de validación de
requisitos
Acta o registro de la sesión de validación con el referente de la organización, con
fecha, participantes, observaciones recibidas y constancia de conformidad. El
correo de conformidad del referente se admite como constancia.
Objetos que se cargan en la tarea «AE2 · Producto principal» del aula virtual.
◆ LOS TRES COMPONENTES CUYA VERIFICACIÓN DETERMINA EL ESTADO
1 · Producto principal — documento en PDF con los cuatro capítulos y el catálogo, más los tres enlaces y la
constancia, y el prototipo v1 en condiciones de ejecución.
2 · Portafolio Digital — subcarpeta AE2 con los instrumentos, la matriz de trazabilidad, el acta de validación, las
versiones sucesivas, la evidencia de integración continua y la constancia de las correcciones de la AE1.
3 · Bitácora Individual — una por integrante, sin excepción, con entradas fechadas y los seis elementos.
La ausencia de cualquiera de los tres determina Entrega Incompleta, con independencia de la calidad de los
restantes.
2.1 · Calendario del ciclo completo
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 6
<!-- página 7 -->
Momento Fecha Qué ocurre
Elaboración Semanas 5 a 8 · del 7 de septiembre
al 3 de octubre
Sprint 2. Seis a ocho horas semanales de
trabajo autónomo por integrante, además
del horario de clase.
Sesión de validación con el referente Antes del viernes 25 de septiembre Instancia obligatoria del proceso. Su acta es
objeto de entrega y componente del
Portafolio.
Entrega Jueves 1.º de octubre de 2026,
hasta las 23:59 h
Clase 15 · 19:40 a 22:50 h · Aula 28. Carga
asincrónica en el aula virtual.
Devolución docente Jueves 8 de octubre de 2026 Devolución escrita sobre las seis
dimensiones de la rúbrica, con dictamen
expreso de Entrega Completa o Entrega
Incompleta.
Ventana de Mejora y Cumplimiento Viernes 9 al viernes 16 de octubre
de 2026, inclusive
Ocho días corridos. Rigen las tres
situaciones que se detallan abajo.
2.2 · Las tres situaciones dentro de la Ventana
La Ventana de Mejora y Cumplimiento no es una segunda fecha de entrega equivalente a la primera. Dentro de ella
conviven tres situaciones que conviene no confundir.
1. El equipo cuya entrega fue declarada completa puede mejorarla de manera voluntaria. La cátedra no queda
obligada a emitir una segunda devolución escrita.
2. El equipo cuya entrega fue declarada incompleta debe volver a presentarla y recibe una segunda revisión.
3. El equipo que no entregó en el primer llamado puede realizar allí su primera presentación, con una advertencia
expresa: esa presentación es definitiva y, si queda incompleta, no existe instancia posterior para esta actividad.
⚠ ERROR FRECUENTE — «EL V1 LO TERMINAMOS EN LA VENTANA»
El cálculo es tentador y sale mal por una razón aritmética. La Ventana dura ocho días corridos y se superpone con el
arranque del Sprint 3, que exige el Capítulo VI, el Capítulo IX y el prototipo v2 para la semana 11. Quien difiere el
esqueleto arquitectónico a octubre no gana una semana: pierde el punto de partida del incremento funcional
siguiente, porque el v2 se construye sobre el v1 y no en lugar de él.
2.3 · Lo que la verificación de enlaces de la AE1 dejó aprendido
La corrección de la AE1 incluyó una verificación de más de cincuenta enlaces desde sesiones ajenas a las de los
estudiantes. El resultado modificó niveles de la dimensión 6 en ambos sentidos y produjo tres estados incompletos.
Como el mismo procedimiento se aplicará ahora, y esta vez incluirá clonar y ejecutar, conviene explicitar las reglas
que de allí se desprenden.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 7
<!-- página 8 -->
Regla Qué significa en la práctica
Regla de la sesión ajena Todo enlace se prueba desde una ventana de incógnito o desde una sesión distinta
de la propia antes de entregarlo. Un objeto que sólo abre con la sesión del autor,
para la corrección, no existe.
Despliegues protegidos Las vistas previas de las plataformas de despliegue suelen estar protegidas por
autenticación del proveedor y redirigen al inicio de sesión. Publíquese la dirección
de producción o desactívese la protección.
Identidad en los registros Los registros del repositorio deben estar atribuidos a la cuenta de cada integrante.
Un historial firmado con un nombre genérico no acredita contribución individual y
deja la dimensión 6 sin base de evaluación.
Correspondencia entre lo declarado y lo
alojado
Si el archivo de lectura del repositorio anuncia instrumentos, actas o prototipos,
esos objetos deben estar. Un archivo de lectura que describe evidencia inexistente
perjudica más que su ausencia.
Repositorio privado con acceso
concedido
Privado, conforme a la Guía rápida N.º 1, y con la cuenta del docente agregada como
colaboradora desde el momento de la creación, no la víspera de la entrega.
Reglas de acceso derivadas de la verificación del 6 de septiembre de 2026.
✦ ¿POR QUÉ DECIDISTE ESTO?
«Abro el enlace que entregaron desde una sesión que no es la de ustedes. Si no abre, la pregunta no es qué contiene:
es por qué lo entregaron sin haberlo probado en esas condiciones.»
≡ EN SÍNTESIS
Cuatro objetos en la tarea; tres componentes determinan el estado; la condición material los atraviesa.
Entrega el 1.º de octubre, devolución el 8, Ventana del 9 al 16 de octubre.
Todo enlace se prueba desde una sesión ajena antes de entregarlo.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 8
<!-- página 9 -->
3 · Capítulo III — Entorno y Dominio del Sistema de
Información
Cinco apartados. El capítulo responde una sola pregunta, formulada de cinco maneras: ¿qué parte del mundo entra
en el sistema?
§ Apartado Pregunta que responde
III.1 Entorno del SI ¿Qué queda fuera del sistema pero condiciona sus decisiones de
diseño?
III.2 Dominio del SI ¿Qué entidades, relaciones y reglas de negocio pueblan el recorte del
mundo que el sistema representa?
III.3 Alcance del sistema y alcance del
proyecto
¿Qué hará el software y qué compromete efectivamente este equipo
en el cuatrimestre?
III.4 Límites ¿Qué queda fuera, por qué motivo y quién validó esa frontera?
III.5 Catálogo de requisitos ¿Qué debe hacer el sistema y cómo se comprobará que fue satisfecho?
(apartado 4 de esta guía)
3.1 · El entorno: cuatro categorías, y cada elemento con su implicancia
La noción de entorno proviene de la teoría general de sistemas (Bertalanffy, 1968) y designa aquello que el sistema
no controla pero que lo afecta. La cátedra pide organizarlo en cuatro categorías, no por afán taxonómico sino porque
cada una produce un tipo distinto de restricción sobre el diseño.
Categoría Qué comprende Qué tipo de restricción produce
Actores externos Personas y organizaciones que interactúan con
el sistema sin pertenecer a él: clientes,
proveedores, organismos, auditores.
Interfaces de entrada y salida, y expectativas de
servicio que el sistema debe honrar.
Normas Legislación, regulación sectorial,
reglamentación interna y estándares
obligatorios.
Restricciones no negociables: plazos, formatos de
declaración, conservación y tratamiento de
datos.
Sistemas vecinos Software preexistente con el cual hay
intercambio: facturación, contabilidad,
mensajería, planillas de cálculo en uso.
Formatos de intercambio, frecuencia de
sincronización y decisiones sobre qué dato es
autoritativo.
Infraestructura Conectividad, energía, dispositivos disponibles,
condiciones físicas del lugar de operación.
Arquitectura de despliegue y modo de operación,
con frecuencia la restricción más determinante.
Rige aquí, agravada, la regla de implicancia decisoria que la AE1 introdujo: si el elemento se suprime de la ficha y
ninguna decisión del proyecto cambia, ese elemento no pertenece al entorno del sistema; pertenece al paisaje. Se
cuentan implicancias, no filas.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 9
<!-- página 10 -->
▶ EJEMPLO — UN ELEMENTO DE ENTORNO CON SU IMPLICANCIA DECLARADA
Categoría: infraestructura. Elemento: los tres puestos de balanza de la Cooperativa «Santa Ana» operan con
conectividad intermitente, verificada por observación directa en la visita del 19 de agosto. Fuente: Capítulo II,
apartado II.3.
Implicancia de diseño: la captura de pesada debe funcionar sin conexión y sincronizar en diferido. Esto excluye una
arquitectura íntegramente web, obliga a generar identificadores en el cliente y exige una política explícita de
resolución de conflictos en la consolidación. De esa implicancia deriva el requisito RNF-01 y, con él, la decisión
arquitectónica central del proyecto.
3.2 · La prueba de la frontera: ¿controla o padece?
La distinción entre entorno y dominio se resuelve con una prueba de una sola pregunta, que conviene aplicar
elemento por elemento en lugar de discutirla en abstracto: ¿el sistema controla el estado de esa cosa, o lo padece?
Lo que el sistema crea, modifica y da por válido pertenece al dominio. Lo que el sistema recibe ya formado, y frente
a lo cual sólo puede adaptarse, pertenece al entorno.
◆ CONCEPTO CLAVE — EL CASO BIFRONTE
Algunos elementos aparecen a ambos lados de la frontera y son los que mejor educan el criterio. En «Santa Ana», el
precio vigente de la yerba lo fija un organismo externo: el sistema lo padece, es entorno. Pero el sistema necesita
conservar qué precio regía en cada momento para poder reconstruir una liquidación, y esa fotografía fechada sí es
suya: es dominio. La respuesta correcta no consiste en elegir un lado sino en declarar el desdoblamiento: el precio
como dato externo, y su registro histórico como entidad propia. Sobre esa distinción se apoya, además, una pregunta
que el equipo debe resolver con el referente: qué ocurre cuando el precio cambia a mitad de quincena.
3.3 · El dominio: entidades, relaciones y reglas
El modelado del dominio (Larman, 2004; Evans, 2003) consiste en identificar las cosas del negocio que el sistema
debe representar, las relaciones que las vinculan y las reglas que gobiernan su comportamiento. El procedimiento
que la cátedra exige tiene tres momentos y quedó instalado en el taller de la Clase 8.
Primero, el método de los sustantivos. Se recolectan los sustantivos que la organización efectivamente usa,
tomados de las entrevistas, de las hojas de la planilla de cálculo que hoy sostiene el proceso y de los documentos
que circulan. La fuente es la organización, no el equipo: si el referente dice «romaneo» y el equipo escribe «pesada»,
eso es una entrada del glosario, no una corrección.
Segundo, el filtro de las tres preguntas. Cada candidata se somete a tres pruebas, y sólo la que responde
afirmativamente a las tres ingresa como entidad: ¿tiene identidad propia, es decir, puede distinguirse una instancia
de otra en el lenguaje del negocio? ¿Tiene datos y reglas propios, o es un atributo de otra cosa? ¿Está dentro del
recorte que el proyecto delimitó? Las candidatas descartadas no se borran: se reclasifican como atributo, como rol,
como producto del sistema o como elemento del entorno, y quedan registradas con su veredicto, porque el descarte
documentado es lo que permite defender la delimitación.
Tercero, las reglas de negocio. Se registran clasificadas en tres tipos, con enunciado verificable, fuente y estado de
validación.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 10
<!-- página 11 -->
Tipo Qué establece Ejemplo en el caso «Santa Ana»
Restricción Prohíbe un estado o una transición. R-01: una quincena cerrada no admite nuevas pesadas ni
modificación de las existentes; la reapertura requiere
autorización registrada del administrador.
Derivación Define cómo se calcula un dato a partir
de otros.
El importe de la liquidación resulta de los kilos
consolidados de la quincena, ajustados por humedad,
valorizados al precio vigente registrado al cierre.
Existencia Condiciona la creación de una instancia. Sólo se admite una pesada si el productor está vigente y
la balanza habilitada al momento de la operación.
⚠ ERROR FRECUENTE — EL DOMINIO DEDUCIDO DE LA INTUICIÓN
Un modelo con veinte entidades prolijas, cardinalidades correctas y ninguna fuente citada es un ejercicio de
modelado, no un dominio. La exigencia (iv) de la consigna es explícita: cada entidad y cada regla remite a una
evidencia del relevamiento o a una validación posterior documentada. Siete entidades trazadas valen más que veinte
inventadas, y son además las que el equipo podrá defender en noviembre.
▶ EJEMPLO — EL DOMINIO MÍNIMO DE «SANTA ANA»
Siete entidades, cada una con su origen: Productor y Balanza (padrón y hojas de la planilla del 19/08), Pesada (hoja
«pesadas por quincena», sustantivo del referente), Quincena (práctica del cierre, entrevista del 19/08), Liquidación
(documento que la cooperativa entrega al productor), Reclamo (registro de las diferencias de peso, 6,4 % de las
pesadas) y Presentación (declaración jurada ante el regulador, origen de las dos multas del ejercicio). Las relaciones
se leen como frases del negocio y así se validan: «una quincena agrupa muchas pesadas»; «una liquidación
corresponde a un productor y a una quincena»; «un reclamo se origina en una pesada». Si la frase suena falsa dicha
en voz alta ante el referente, la cardinalidad está mal.
3.4 · Alcance del sistema, alcance del proyecto y límites
Son tres cosas distintas y su confusión es la causa más frecuente de proyectos que no cierran en noviembre.
Alcance del sistema: qué hará el software concebido como producto, incluida su evolución previsible más allá
del cuatrimestre.
Alcance del proyecto: qué compromete efectivamente este equipo, con estos integrantes y este presupuesto de
horas, entre septiembre y noviembre. Debe ser coherente con el presupuesto declarado en el Instrumento 24:
un alcance que exige el doble de las horas disponibles no es ambicioso, es falso.
Límites: qué queda fuera, por qué motivo y quién validó esa frontera.
La exigencia (iii) de la consigna pide que los límites se declaren por escrito y con su validación. La razón es de
método y la formuló bien el taller de la Clase 8: una exclusión decidida en soledad es una hipótesis; validada con el
referente y asentada en acta, es una frontera. La diferencia importa en noviembre, cuando el tribunal pregunte por
qué el sistema no hace algo que la organización esperaba: una exclusión validada es una decisión de ingeniería, una
exclusión tácita es una omisión.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 11
<!-- página 12 -->
Qué queda fuera Por qué motivo Quién lo valida Estado
Contabilidad y nómina Las resuelve un estudio contable externo;
duplicarlas introduce dos fuentes de
verdad sobre el mismo dato.
Referente y estudio
contable
Validado (acta del
19/08)
Liquidación definitiva con
retenciones impositivas
Exige régimen de retenciones fuera del
alcance formativo; el sistema produce la
liquidación provisoria del día del cierre.
Referente Validado
Presentación automática ante el
regulador
El organismo no publica interfaz de
recepción; el sistema genera el archivo y
la presentación sigue siendo manual.
Administración Validado
Estructura completa de la declaración de límites. Toda fila con estado «pendiente» pasa a la guía de la sesión de validación.
✦ ¿POR QUÉ DECIDISTE ESTO?
«Su alcance del proyecto declara cinco módulos y su presupuesto de horas dice ciento sesenta horas-persona para
todo el Sprint. Tomemos el módulo tres: ¿cuántas de esas horas consume, y de dónde las sacaron? Si la respuesta es
que no lo calcularon, entonces lo que escribieron no es un alcance: es una lista de deseos.»
3.5 · El glosario del dominio
El glosario no es un anexo cortés. Es el vocabulario normativo del informe completo y, más adelante, el de las tablas
del sistema. Cada entrada registra el término tal como lo usa la organización, su definición operativa en una o dos
oraciones, los sinónimos y falsos amigos detectados, la fuente y si está en disputa.
◆ LA ENTRADA MÁS VALIOSA DEL GLOSARIO
Es la del término en disputa, aquel que dos personas de la organización usan con sentidos distintos sin haberlo
advertido. Ese desacuerdo latente se convierte, sin excepción, en un defecto del sistema: el software implementará
un único significado, y conviene que sea uno acordado y no uno heredado por accidente. Márquese, llévese a la
sesión de validación y ciérrese con una definición firmada.
≡ EN SÍNTESIS
Entorno en cuatro categorías, cada elemento con su implicancia de diseño declarada.
La frontera se resuelve preguntando si el sistema controla o padece; los casos bifrontes se desdoblan.
Cada entidad y cada regla remiten a una evidencia; el descarte también se registra.
Alcance del sistema, alcance del proyecto y límites son tres declaraciones distintas, y los límites se validan.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 12
<!-- página 13 -->
4 · El catálogo de requisitos
La pieza central de la unidad. Un requisito sin criterio de aceptación comprobable no se computa, por bien redactado
que esté.
El catálogo se incorpora como apartado del Capítulo III y se mantiene, además, como tabla viva versionada en el
repositorio. Cada fila lleva seis campos, y los seis se verifican.
# Campo Qué consigna y con qué criterio se verifica
1 Identificador Código estable del tipo RF-01, RNF-01. Estable significa que no se renumera: si un
requisito se elimina, su código queda vacante. Los identificadores se citan en el cuerpo
del informe, en el tablero y en los mensajes del repositorio.
2 Enunciado Una sola capacidad o una sola restricción por fila, en presente y en afirmativo. Un
enunciado con la conjunción «y» suele esconder dos requisitos con criterios de
aceptación distintos.
3 Tipo Funcional o no funcional, y en este último caso la categoría: rendimiento, fiabilidad,
seguridad, usabilidad, mantenibilidad, portabilidad, cumplimiento normativo.
4 Prioridad y criterio Escala MoSCoW con el motivo de la asignación. La prioridad sin motivo es una
preferencia; con motivo, es una decisión de alcance.
5 Criterio de aceptación Procedimiento finito que un tercero puede ejecutar para determinar si el sistema lo
satisface. Incluye condición inicial, acción y resultado observable, con valores.
6 Trazabilidad Código del hallazgo de la AE1 que lo origina, o del acuerdo del acta de validación. Sin
origen, el requisito no ingresa al catálogo.
4.1 · La distinción entre requisito funcional y no funcional
La consigna exige que la distinción sea rigurosa y ofrece el contraejemplo canónico: «el sistema debe ser rápido» no
constituye un requisito no funcional. Conviene entender por qué, porque el error se repite con formulaciones más
sofisticadas.
Un requisito funcional describe qué hace el sistema: una capacidad, una transformación de entradas en salidas. Un
requisito no funcional describe cómo debe comportarse el sistema al hacerlo, y sólo se vuelve un requisito cuando
ese «cómo» se expresa con una magnitud, una unidad y una condición de medición. «Rápido» carece de las tres. «El
listado de operaciones devuelve resultados en menos de dos segundos sobre un volumen de diez mil registros»
tiene las tres y, por eso mismo, puede fallar: alguien puede medirlo y encontrar que no se cumple. Esa posibilidad de
fallar es la marca de un requisito bien formado.
◆ CONCEPTO CLAVE — POR QUÉ LOS NO FUNCIONALES DECIDEN LA ARQUITECTURA
Los requisitos funcionales suelen implementarse de muchas maneras y rara vez condicionan la estructura del
sistema. Los no funcionales, en cambio, la determinan: la operación sin conexión, un tiempo de respuesta exigente,
la trazabilidad de auditoría o el resguardo de datos personales se deciden en la arquitectura y son costosísimos de
agregar después. De ahí que el prototipo v1 sea un esqueleto arquitectónico: lo que se prueba tempranamente no es
una función, es la decisión estructural que los requisitos no funcionales impusieron.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 13
<!-- página 14 -->
4.2 · El criterio de aceptación: la prueba del compañero
Un criterio de aceptación se escribe como un procedimiento y no como una expectativa. La forma que la cátedra
pide tiene tres partes: condición inicial, acción y resultado observable con valores. Antes de dar por cerrada una fila,
aplíquese la prueba instalada en la Clase 7: otro integrante debe poder decir, en diez segundos y sin consultar,
cómo verificaría ese requisito. Si necesita pedir aclaraciones, el criterio no está terminado.
Campo RNF-01 RF-02
Enunciado La captura de pesadas opera sin conectividad y
sincroniza en diferido al restablecerse el enlace, sin
pérdida ni duplicación de registros.
El sistema emite la liquidación provisoria de cada
productor el mismo día del cierre de quincena, con
el detalle de las pesadas que la componen.
Tipo No funcional — fiabilidad y modo de operación. Funcional.
Prioridad Must. Condiciona la arquitectura completa: excluye
una solución íntegramente web.
Must. Es el requisito del cual depende el criterio de
éxito declarado en el Capítulo I.
Criterio de
aceptación
Jornada de prueba con un puesto desconectado
durante la operación; al reconectar, los registros
aparecen completos y únicos en la consolidación, y
el conteo coincide con el papel del puesto.
Cerrada una quincena con pesadas de tres balanzas,
el sistema produce la liquidación de cada productor
dentro de la misma jornada, y su importe coincide
con el recálculo manual sobre la misma base.
Trazabilidad H-02 · observación de campo del 19/08:
conectividad intermitente en los tres puestos (Cap.
II, ap. II.3).
H-04 · demora promedio de once días entre cierre y
acreditación, medida sobre veinticuatro quincenas.
Dos filas del catálogo del caso «Santa Ana», completas en sus seis campos.
4.3 · Prioridad: para qué sirve realmente MoSCoW
La escala Must, Should, Could, Won't (Clegg y Barker, 1994) no ordena preferencias: define qué se entrega si el
tiempo alcanza sólo para una parte. De allí una regla operativa que conviene adoptar: el conjunto de los Must debe
ser exactamente el producto mínimo viable del Capítulo V. Si no coinciden, uno de los dos apartados está mal
escrito, y la incoherencia es de las que la dimensión 4 detecta de inmediato.
⚠ ERROR FRECUENTE — EL CATÁLOGO CON TODO EN «MUST»
Un catálogo de treinta requisitos donde veintiocho son imprescindibles no comunica urgencia: comunica que el
equipo no priorizó. Priorizar duele porque obliga a nombrar lo que no se hará, y ese es precisamente el trabajo. La
cátedra lee la columna de prioridad como un indicador de madurez de la delimitación.
4.4 · La trazabilidad en doble vía
La matriz de trazabilidad (Instrumento 26) se verifica en dos direcciones, y ninguna es prescindible. Hacia atrás: todo
requisito llega a un hallazgo del relevamiento o a un acuerdo del acta. Hacia adelante: todo hallazgo llega a un
requisito o a una justificación expresa de por qué no derivó ninguno. El silencio no es una decisión.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 14
<!-- página 15 -->
▶ EJEMPLO — UN HALLAZGO QUE NO DERIVA REQUISITO, Y CÓMO SE DECLARA
H-05: «dos multas del organismo regulador por presentación tardía de la declaración jurada». No origina requisito
propio en el producto mínimo viable, porque la presentación automática ante el regulador quedó excluida del
alcance por ausencia de interfaz publicada. La reducción del riesgo de multa se atiende de manera indirecta
mediante RF-02, que adelanta la consolidación al día del cierre. La justificación consta en el acta de validación con el
referente. Eso es una fila cerrada; dejar H-05 sin fila es un hueco que la corrección detecta.
≡ EN SÍNTESIS
Seis campos por requisito; sin criterio de aceptación comprobable, la fila no se computa.
Un no funcional sin magnitud, unidad y condición de medición es un deseo.
El conjunto de los Must coincide con el producto mínimo viable.
La matriz se verifica en doble vía; el hallazgo sin requisito exige justificación escrita.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 15
<!-- página 16 -->
5 · Capítulo IV — Modelo de Negocios del Proyecto
El capítulo responde por qué el proyecto es sostenible y frente a qué alternativas compite. No es un trámite de
marketing: de él se derivan decisiones de alcance.
§ Apartado Qué debe contener
IV.1 Definición de negocios Qué valor entrega el sistema, a quién, y cómo se sostiene
económicamente esa entrega.
IV.2 Definiciones estratégicas: visión y
misión
Las del proyecto de sistema de información, retomadas del Capítulo
I y ahora expresadas en clave de negocio.
IV.3 Análisis de rivalidad amplificada Competencia actual, competidores potenciales y sustitutos,
proveedores y clientes, con implicancia declarada por fuerza.
IV.4 Mapeo de competencia Posicionamiento sobre dos ejes construidos con criterios que el
propio relevamiento justifica.
5.1 · El lienzo de modelo de negocio no es decorativo
El lienzo de Osterwalder y Pigneur (2019) organiza nueve bloques: segmentos de clientes, propuesta de valor,
canales, relaciones, fuentes de ingreso, recursos clave, actividades clave, socios clave y estructura de costos.
Completarlo es sencillo; el requisito de la cátedra es más exigente y está en la exigencia (v) de la consigna: del lienzo
se deriva el análisis de rivalidad amplificada, y se declara expresamente qué implicancia tiene sobre el alcance
comprometido.
Dicho de otro modo: el lienzo debe cambiar algo del proyecto. Si el equipo lo completa y el alcance del Capítulo III
sigue exactamente igual, el lienzo no se usó, se ilustró.
▶ EJEMPLO — DEL BLOQUE DEL LIENZO A LA DECISIÓN DE ALCANCE
En «Santa Ana», el bloque de socios clave registra al estudio contable externo que liquida sueldos y lleva la
contabilidad. Ese solo bloque produce dos consecuencias sobre el alcance: primero, confirma la exclusión de
contabilidad y nómina, que deja de ser una comodidad del equipo y pasa a ser coherencia con la estructura real del
negocio; segundo, obliga a definir un formato de exportación hacia el estudio, que se convierte en el requisito RF-09.
Un bloque, una exclusión sostenida y un requisito nuevo: eso es un lienzo usado.
5.2 · Rivalidad amplificada: dónde se ubica definitivamente
El modelo de las cinco fuerzas competitivas (Porter, 1980/2018) se estudió en la Clase 3 y se empleó en el Capítulo II
como herramienta de lectura del sector. Su ubicación definitiva en el informe, conforme al artículo 22.4, es este
capítulo, bajo la denominación reglamentaria de análisis de rivalidad amplificada. En el Capítulo II se usó; en el
Capítulo IV se consolida, y la diferencia no es de lugar sino de propósito: allí servía para caracterizar el sector donde
vive el problema; aquí sirve para establecer con qué compite la solución.
Cada fuerza declara su implicancia. La pregunta que ordena el análisis no es cuán intensa es la fuerza sino qué
decisión del proyecto cambia por causa de ella.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 16
<!-- página 17 -->
Fuerza Pregunta que debe responder el apartado
Rivalidad entre competidores
actuales
¿Qué soluciones resuelven hoy este problema en esta organización o en organizaciones
equivalentes, y con qué costo total?
Competidores potenciales ¿Qué barreras de entrada protegen a la solución, si es que alguna? El conocimiento del
dominio suele ser la única.
Sustitutos ¿Qué hace hoy la organización sin el sistema? La planilla de cálculo mantenida a mano es
el sustituto más frecuente y el más subestimado.
Poder de negociación de
proveedores
¿De qué servicios de terceros depende la operación y qué ocurre si cambian sus
condiciones?
Poder de negociación de clientes ¿Quién decide la adopción y quién la padece? La asimetría entre ambos es una fuente
conocida de fracaso en la implantación.
⚠ ERROR FRECUENTE — IGNORAR EL SUSTITUTO QUE YA FUNCIONA
La planilla de cálculo hecha a mano, con fórmulas propias y una copia semanal enviada por mensajería, es el
competidor más serio del proyecto: es gratuita, la organización ya sabe usarla y resuelve el ochenta por ciento del
problema. Un análisis que no la incluye entre los sustitutos no es un análisis optimista, es uno incompleto, y deja al
equipo sin la respuesta a la pregunta que el referente hará en la implantación: por qué esto es mejor que lo que ya
tengo.
5.3 · El flujo de valor automatizable y su criterio de selección
La exigencia (vi) es específica: el flujo de valor seleccionado para automatización se justifica con la evidencia que
demuestra que allí se concentra el problema relevado, y no con la comodidad técnica del equipo. La formulación
anticipa el error: elegir el módulo que resulta más entretenido de programar y construir después una razón que lo
justifique.
La justificación defendible tiene tres componentes: dónde se concentra el costo actual del problema, medido con la
línea de base del Capítulo I; qué proporción de ese costo puede razonablemente absorber la automatización; y qué
queda sin resolver aun así, declarado expresamente.
✦ ¿POR QUÉ DECIDISTE ESTO?
«Eligieron automatizar el flujo X. Muéstrenme el dato del Capítulo II que sostiene que el problema está ahí y no en el
flujo Y. Y ahora díganme cuánto del problema queda en pie después de automatizar X, porque si es la mitad, la
elección merece una explicación adicional.»
≡ EN SÍNTESIS
El lienzo debe cambiar una decisión de alcance; si no, no se usó.
Las cinco fuerzas se consolidan aquí, cada una con su implicancia decisoria.
El sustituto artesanal que hoy funciona es el competidor principal y se analiza como tal.
El flujo automatizable se elige con evidencia de concentración del problema, no por conveniencia técnica.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 17
<!-- página 18 -->
6 · Capítulo V — Planificación del Proyecto
Planificar es comprometerse con un orden y con una definición de terminado. Un cronograma sin criterio de cierre
por iteración es un calendario de intenciones.
§ Apartado Qué debe contener
V.1 Definición de iteraciones o sprints Duración, fechas, objetivo verificable de cada una y definición de
terminado común.
V.2 Entregables de cada etapa Qué artefacto concreto cierra cada iteración, con su condición de
aceptación.
V.3 Organización del equipo Roles, responsabilidades y regla de resolución de desacuerdos,
conforme al acta de constitución.
V.4 Cronograma Distribución temporal con presupuesto de horas-persona y
dependencias entre tareas.
V.5 Producto mínimo viable Casos de uso que incluye y, de manera expresa, los que deja
fuera.
6.1 · La definición de terminado
La práctica ágil aporta aquí un instrumento que la cátedra considera obligatorio: la definición de terminado, un
conjunto de condiciones que todo incremento debe satisfacer para declararse concluido. Sin ella, «terminado»
significa cosas distintas para cada integrante y el avance se vuelve incomparable entre iteraciones.
◆ CONCEPTO CLAVE — UNA DEFINICIÓN DE TERMINADO MÍNIMA Y VERIFICABLE
Para este proyecto, un incremento está terminado cuando: (a) el código está integrado en la rama principal y el canal
de construcción corrió con resultado exitoso; (b) el criterio de aceptación del requisito asociado fue ejecutado y su
resultado registrado; (c) el catálogo, el modelo del dominio y el archivo de lectura quedaron actualizados si la
decisión los afectó; y (d) la bitácora del responsable registra la decisión y su fundamento. Cuatro condiciones, todas
verificables por un tercero, ninguna sujeta a interpretación.
6.2 · El cronograma y el presupuesto de horas
La planificación se construye sobre el presupuesto de horas-persona declarado en el Instrumento 24 y no sobre la
duración nominal del cuatrimestre. Declaradas las horas semanales reales de cada integrante, y descontada la
reducción prevista para las semanas de exámenes, queda un presupuesto efectivo. Ese número, y no el entusiasmo,
es el que determina cuántos requisitos Must caben en el proyecto.
El cronograma se alinea, además, con la cadencia de artefactos que la cátedra fijó y que no admite desplazamiento:
v1 en la semana 8, v2 en la semana 11, v3 en la semana 13 y versión funcional congelada en la semana 14.
6.3 · El producto mínimo viable se describe por lo que hace
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 18
<!-- página 19 -->
La exigencia (viii) lo enuncia con precisión: el producto mínimo viable se describe por lo que hace, no por lo que
promete. La descripción correcta enumera los casos de uso que incluye y, de manera expresa, los que deja fuera. La
noción se difundió con Ries (2011/2017), y conviene recordar su sentido original, que el uso indiscriminado ha
desdibujado: el producto mínimo viable es la versión más pequeña capaz de producir aprendizaje validado sobre si
la solución resuelve el problema. No es una versión recortada por falta de tiempo; es una versión deliberadamente
acotada para poder ser contrastada con la realidad antes de invertir más.
⚠ ERROR FRECUENTE — EL PRODUCTO MÍNIMO VIABLE ENUNCIADO CON ADJETIVOS
«Una versión inicial completa y funcional que permitirá gestionar de manera integral los procesos principales de la
organización.» Ninguna de esas palabras identifica un caso de uso, y ninguna permite declarar el producto terminado
o inconcluso. Reformulado: «El producto mínimo viable comprende registrar una pesada, consultarla, cerrar una
quincena y emitir la liquidación provisoria. No comprende la gestión de reclamos, la exportación al estudio contable
ni el panel de indicadores, que quedan para el incremento de la semana 11.»
6.4 · La planificación resiste la pérdida de un integrante
La exigencia (vii) pide algo que rara vez se escribe y que ocurre con frecuencia: declarar qué sucede si el equipo
pierde un integrante. No se trata de un ejercicio de pesimismo. En un cuatrimestre de dieciséis semanas, una
enfermedad, un examen desplazado o una obligación laboral sobreviniente son eventos de probabilidad alta, y la
diferencia entre un equipo que los absorbe y uno que se detiene está enteramente en haberlo previsto por escrito.
La cláusula de contingencia declara tres cosas: qué se posterga si el presupuesto de horas cae un tercio; con qué
criterio se redistribuye el trabajo, conforme a la regla acordada en el acta de constitución; y qué no se sacrifica en
ningún caso. Sobre esto último la cátedra ya fijó posición en el Instrumento 24: no se sacrifican la trazabilidad del
catálogo ni la ejecutabilidad del v1, porque son las dos condiciones de cómputo.
≡ EN SÍNTESIS
Cada iteración tiene objetivo verificable, entregable y definición de terminado común.
El cronograma se construye sobre el presupuesto efectivo de horas, no sobre el calendario.
El producto mínimo viable se enuncia por casos de uso incluidos y excluidos.
La cláusula de contingencia se escribe antes de necesitarla, no después.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 19
<!-- página 20 -->
7 · Capítulo X — Recursos del Proyecto
Cinco clases de recursos, cada asignación con su justificación. El capítulo se juzga por la coherencia con la
planificación, no por la precisión de los precios.
Clase de recurso Qué comprende Qué debe justificar
Humanos Perfiles, dedicación y costo de hora de
referencia del sector.
Por qué esa composición de perfiles y no otra,
con la relación entre horas asignadas y
requisitos comprometidos.
Físicos y materiales Equipamiento, dispositivos de captura, espacio
de trabajo.
Qué exige el modo de operación decidido: un
puesto de balanza que opera sin conexión
impone requisitos de dispositivo.
Financieros Inversión inicial, costos recurrentes y punto de
equilibrio si el proyecto contempla
explotación.
De dónde provienen los valores y con qué
supuestos; los órdenes de magnitud se
declaran como tales.
Tecnológicos Lenguajes, marcos de trabajo, base de datos,
servicios de despliegue e integración continua.
Licencia, versión y motivo de la elección, con la
alternativa evaluada y el criterio de descarte.
Otros Capacitación, soporte, migración de datos,
licencias de terceros.
La migración desde la planilla existente casi
siempre se subestima y es el rubro que más
proyectos demora.
7.1 · La regla de las tres preguntas se aplica también a los costos
Toda cifra de costo que ingrese al capítulo pasa por la regla instalada en la AE1: quién la produjo, con qué método y
sobre qué universo, y para qué período de referencia. La advertencia vale en particular para los valores de costo de
hora del sector de Software y Servicios Informáticos, donde conviven relevamientos con universos y metodologías
distintas cuyo promedio carece de sentido. La corrección de la AE1 registró como criterio distinguido el de un grupo
que se negó expresamente a promediar cifras de universos distintos; ese criterio se mantiene.
⚠ ERROR FRECUENTE — EL CAPÍTULO DE RECURSOS DESCONECTADO DEL CAPÍTULO DE PLANIFICACIÓN
Un Capítulo X que asigna cuatrocientas horas de desarrollo mientras el Capítulo V declara un presupuesto efectivo de
ciento sesenta horas-persona no tiene un problema de costeo: tiene un problema de coherencia interna, y la
dimensión 4 de la rúbrica lo penaliza como tal. Antes de cerrar el capítulo, verifíquese que las horas del Capítulo X y
las del Capítulo V son el mismo número.
≡ EN SÍNTESIS
Cinco clases de recursos, cada asignación con su motivo, no con su monto solamente.
Toda cifra de costo responde las tres preguntas; los promedios entre universos distintos no se admiten.
Las horas del Capítulo X y las del Capítulo V deben coincidir.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 20
<!-- página 21 -->
8 · El prototipo v1
Un esqueleto arquitectónico que recorre de extremo a extremo un caso de uso vertical completo, con integración
continua activa. La cátedra clona el repositorio y lo ejecuta.
8.1 · Qué es un esqueleto arquitectónico ejecutable
Cockburn (2004) denominó walking skeleton a una implementación mínima del sistema que ejecuta una función de
punta a punta atravesando todas las capas de la arquitectura, por trivial que sea esa función. La idea es anterior en
espíritu a su nombre: Hunt y Thomas (1999) la describieron como «bala trazadora», un disparo que permite ver la
trayectoria completa antes de comprometer munición. En ambos casos el propósito es el mismo y no es el que suele
suponerse: no se busca adelantar funcionalidad, se busca descubrir temprano los problemas de integración, que
son los que aparecen entre las capas y no dentro de ellas.
De ahí la exigencia de que el recorrido sea vertical y no horizontal. Un equipo que construye tres pantallas hermosas
sin persistencia no probó nada: probó que sabe maquetar. Un equipo que construye una sola pantalla fea, que envía
un dato a la lógica, lo persiste, lo recupera y lo devuelve a la vista, probó que su arquitectura funciona. La segunda
situación es la que la consigna pide.
Estación Qué debe existir Qué queda probado
Interfaz Un formulario mínimo y una vista de consulta. Sin
decisiones estéticas.
Que la vista sabe enviar y recibir del resto del
sistema.
Lógica La validación de al menos una regla de negocio
del registro de reglas.
Que existe un lugar donde las reglas viven, y
no dispersas en la interfaz.
Persistencia Esquema creado, escritura efectiva y lectura
posterior en un motor real.
Que el modelo del dominio se corresponde
con un esquema que existe.
Retorno El dato persistido vuelve a la interfaz y se
muestra.
Que el circuito completo cierra, que es lo único
que el v1 tiene que demostrar.
Las cuatro estaciones del recorrido vertical y qué queda probado en cada una.
▶ EJEMPLO — EL CASO DE USO VERTICAL DE «SANTA ANA»
Registrar una pesada y consultarla. Un formulario admite productor, balanza y kilos; la lógica rechaza el registro si la
quincena está cerrada, aplicando la regla R-01; el dato se persiste con un identificador generado en el cliente,
conforme a lo que exige RNF-01; y una vista de consulta lo recupera y lo muestra con su fecha. Nada más. No hay
liquidación, no hay reclamos, no hay panel de indicadores. Ese recorrido de cuatro estaciones prueba que la
arquitectura decidida para operar sin conexión efectivamente funciona, y esa es la única pregunta que el v1
responde.
8.2 · Integración continua activa
La integración continua (Fowler, 2006; Duvall, Matyas y Glover, 2007) consiste en que cada incorporación de código
dispare de manera automática la construcción del proyecto y la ejecución de sus verificaciones, de modo que una
integración defectuosa se detecte en minutos y no en semanas. Humble y Farley (2010) subrayan la consecuencia
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 21
<!-- página 22 -->
que importa a este proyecto: el canal de construcción es la única evidencia objetiva de que el sistema está en
condiciones de ejecutarse en una computadora distinta de la del autor.
«Activa» significa tres cosas verificables: que existe un archivo de configuración del canal en el repositorio; que ese
canal se ejecutó de manera efectiva en la fecha de la entrega; y que su registro de corridas es accesible para la
cátedra. Un archivo de configuración que nunca corrió no acredita integración continua: acredita una intención.
◆ CONCEPTO CLAVE — EL MÍNIMO ACEPTABLE DEL CANAL DE CONSTRUCCIÓN
El canal no necesita ser sofisticado. Tres pasos alcanzan para satisfacer la exigencia: instalar dependencias, construir
el proyecto y ejecutar al menos una prueba automatizada que verifique el criterio de aceptación del requisito
implementado en el recorrido vertical. Ese único caso de prueba tiene, además, un efecto que se agradece en
octubre: obliga a que el criterio de aceptación esté escrito con la precisión suficiente para poder programarse.
8.3 · «La cátedra clona y corre»: el procedimiento exacto
Conviene que el equipo conozca el procedimiento porque puede replicarlo antes de entregar, y porque su
reproducción es la mejor prueba previa disponible. La guía de comprobación completa se publica como pieza
separada en el aula virtual; su secuencia es la siguiente.
1. Se clona el repositorio en una máquina limpia, sin las herramientas ni las variables de entorno del equipo.
2. Se posiciona en la etiqueta v1 . Si la etiqueta no existe, la comprobación se detiene aquí.
3. Se abre el archivo de lectura y se siguen sus instrucciones de ejecución al pie de la letra, sin interpretar ni suplir
pasos faltantes.
4. Se ejecuta el caso de uso vertical declarado y se verifica que el dato persiste y se recupera.
5. Se consulta el registro de corridas del canal de construcción y se coteja la fecha y el resultado de la última.
⚠ ERROR FRECUENTE — «EN MI MÁQUINA FUNCIONA»
Es la falla más previsible y la más evitable. Se origina casi siempre en tres causas: dependencias instaladas
globalmente en la máquina del autor y no declaradas en el proyecto; credenciales o variables de entorno presentes
en el equipo y ausentes del archivo de ejemplo; y una base de datos creada a mano cuya estructura no está en el
repositorio. La verificación previa es sencilla: clonar el propio repositorio en otra carpeta, o en la computadora de
otro integrante, y ejecutar siguiendo únicamente el archivo de lectura. Si hace falta agregar un paso de memoria, ese
paso debe estar escrito.
8.4 · Qué no es el prototipo v1
No es el producto mínimo viable. El producto mínimo viable comprende un conjunto de casos de uso; el v1
comprende uno solo, elegido por su valor arquitectónico y no por su valor de negocio.
No es una interfaz de alta fidelidad. La estética no se evalúa en esta instancia y el tiempo invertido en ella no
computa.
No es una demostración grabada. Un video no sustituye la ejecución. La condición material exige que el código
corra, no que se lo vea correr.
No es el prototipo v0 mejorado. La maqueta navegable de la AE1 no tenía código; el v1 lo tiene y atraviesa la
persistencia. Son artefactos de naturaleza distinta.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 22
<!-- página 23 -->
✦ ¿POR QUÉ DECIDISTE ESTO?
«Eligieron este caso de uso para el recorrido vertical. ¿Qué decisión arquitectónica queda probada con él que no
quedaría probada con otro? Y si eligieron el más sencillo de programar, ¿qué parte de la arquitectura sigue sin
probarse a esta altura del proyecto?»
≡ EN SÍNTESIS
El recorrido es vertical: interfaz, lógica, persistencia y retorno. Una función trivial que atraviesa todo vale más
que tres pantallas sin fondo.
La integración continua es activa cuando su canal corrió efectivamente y su registro es accesible.
La comprobación se hace en una máquina limpia y siguiendo sólo el archivo de lectura.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 23
<!-- página 24 -->
9 · Las nueve exigencias que la corrección verifica
La consigna enumera nueve exigencias que se verifican de manera específica, una por una, sobre lo entregado. Se
reproducen con su criterio de verificación.
# Exigencia Cómo se verifica
i Todo requisito responde a la pregunta:
¿cómo se comprobará que fue
satisfecho?
Se recorre el catálogo buscando la columna de criterio de aceptación. La
fila sin procedimiento ejecutable no se computa, aunque el enunciado esté
bien redactado.
ii La distinción entre requisito funcional y
no funcional es rigurosa.
Se toma cada no funcional y se buscan magnitud, unidad y condición de
medición. Los adjetivos sin métrica se devuelven como no computados.
iii Los límites se declaran por escrito, con
motivo y con validación.
Se verifica la tabla de límites y se busca, para cada fila, quién validó la
exclusión y en qué acta consta.
iv El dominio es trazable. Se elige una entidad y una regla al azar y se pide su evidencia de origen. Si
el dominio se dedujo de la intuición del equipo, el procedimiento lo revela
de inmediato.
v El lienzo de modelo de negocio no es
decorativo.
Se busca la derivación explícita hacia el análisis de rivalidad amplificada y la
declaración de implicancia sobre el alcance comprometido.
vi El flujo de valor automatizable se justifica
con evidencia.
Se coteja la elección con la línea de base del Capítulo I. La justificación por
comodidad técnica se observa expresamente.
vii La planificación resiste la pérdida de un
integrante.
Se busca la cláusula de contingencia: qué se posterga, con qué criterio se
redistribuye y qué no se sacrifica.
viii El producto mínimo viable se describe
por lo que hace.
Se cuentan los casos de uso incluidos y los excluidos. Un producto mínimo
viable enunciado con adjetivos no se computa como descripción.
ix El prototipo v1 se ejecuta. Se clona, se posiciona en la etiqueta, se siguen las instrucciones y se corre.
Es condición material del cómputo del Producto principal.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 24
<!-- página 25 -->
10 · Aspectos formales, y las observaciones de la AE1 que
no deben reaparecer
Los aspectos formales rigen con idéntico alcance que en la AE1, porque lo entregado es un capítulo del mismo
documento que se defenderá en noviembre.
Aspecto Exigencia reglamentaria (Arts. 20.º y 21.º, R.R. 97/23)
Hoja Tamaño A4.
Márgenes Superior 2,5 cm · inferior 2,5 cm · izquierdo 3 cm · derecho 3 cm.
Espaciado Dos líneas (interlineado doble).
Tipografía Times New Roman. Cuerpo: 12. Notas y citas al pie: 10. Títulos, subtítulos, encabezado y pie:
libre elección.
Carátulas de capítulo Cada capítulo comienza en hoja aparte, con numeral romano y título en mayúsculas,
centrados. El texto comienza en la hoja siguiente sin repetir el título.
Numeración Correlativa en todas las páginas, salvo los anexos, que se numeran de manera independiente
indicando «página X de Y».
Láminas y tablas Se insertan dentro del capítulo correspondiente y se numeran como una página. Se
confeccionan y pliegan según normas IRAM.
Unidades Sistema Métrico Legal Argentino (SIMELA, Ley N.º 19.511) y recomendaciones de escritura del
Sistema Internacional.
Bibliografía Normas APA, con todas las fuentes efectivamente citadas.
Redacción Impersonal, con verbos en presente y en afirmativo.
⚠ LA REITERACIÓN DE UNA OBSERVACIÓN FORMAL SE PONDERA NEGATIVAMENTE
La consigna es explícita: las observaciones formales señaladas en la devolución de la AE1 no deben reaparecer; su
reiteración se pondera negativamente en la dimensión 6. La corrección de la AE1 dejó un registro concreto de cuáles
fueron, y conviene revisarlas antes de escribir: documento en hoja tipo carta en lugar de A4; capítulos sin la
estructura de apartados de la plantilla; marcadores residuales de asistentes generativos dispersos en el cuerpo;
identificación del grupo con campos sin completar; números de documento de identidad con dos valores distintos
entre el informe individual y el grupal; y archivos entregados con denominaciones ajenas a la nomenclatura de la
cátedra.
10.1 · La restricción de contenido del Art. 21.º en esta unidad
El artículo 21.º dispone que no se expongan desarrollos teóricos ni discusiones ajenas al desarrollo específico del
proyecto. En esta unidad la norma tiene un efecto preciso: las alternativas de arquitectura evaluadas y descartadas
sí pertenecen al proyecto, y la dimensión 5 las exige en su nivel superior. Lo que la norma ordena es una
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 25
<!-- página 26 -->
distribución. El cuerpo del capítulo consigna la decisión, su fundamento y la alternativa descartada en dos o tres
oraciones; la deliberación completa va a la bitácora y al Anexo.
▶ EJEMPLO — UNA DECISIÓN DE ARQUITECTURA EN EL CUERPO DEL CAPÍTULO
«La captura de pesada opera sin conexión con sincronización diferida, con identificadores generados en el cliente. Se
evalúa una alternativa de captura íntegramente web y se descarta por la conectividad intermitente verificada en los
tres puestos de balanza durante la visita del 19 de agosto (RNF-01). El análisis completo de las tres opciones
consideradas, con su comparación de costos de implementación, consta en el Anexo III.»
Tres oraciones: decisión, fundamento con evidencia fechada y trazada al requisito, alternativa descartada con criterio
y remisión al anexo. Eso es lo que el artículo 21.º admite y lo que la rúbrica premia.
10.2 · Nomenclatura de archivos y estructura del repositorio
Se mantiene sin cambios lo establecido en la Guía rápida N.º 1: siete carpetas normalizadas y nomenclatura
AAAAMMDD_TipoDocumento_Equipo_vN.ext , con la fecha del contenido y no la de la carga. Para esta entrega, el
material de la unidad se aloja de la siguiente manera.
Carpeta Qué recibe en esta actividad
/00-gestion Bitácoras individuales, actas de reunión, plan de las cuatro semanas y presupuesto de horas
(Instrumento 24).
/01-relevamiento Guía y acta de la sesión de validación con el referente (Instrumento 31), con la constancia de
conformidad.
/02-analisis Lienzo de modelo de negocio, matriz de rivalidad amplificada y mapeo de competencia.
/03-requisitos Catálogo de requisitos versionado, modelo del dominio, registro de reglas, glosario y matriz de
trazabilidad.
/04-diseno Decisiones de arquitectura con sus alternativas, modelo de datos y configuración del canal de
integración continua.
/05-entregas El PDF definitivo tal como se carga en el aula virtual, con su fecha en el nombre.
/src Código del prototipo v1 y su archivo de lectura con las instrucciones de ejecución.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 26
<!-- página 27 -->
11 · Portafolio Digital y Bitácora Individual
Ninguno de los dos es material accesorio. Ambos son componentes de cierre: su ausencia o su insuficiencia
determina Entrega Incompleta aunque el documento principal resulte satisfactorio.
11.1 · Qué contiene la subcarpeta AE2 del Portafolio
# Contenido exigido
a Los instrumentos de la Unidad Dos completados: ficha de delimitación de entorno y dominio (27), lienzo de modelo de
negocio (32), matriz de rivalidad amplificada y mapeo de competencia (33) y planilla de dimensionamiento de recursos
(34).
b La matriz de trazabilidad que vincula cada hallazgo del relevamiento de la AE1 con el requisito que originó y con el
componente que lo satisfará (26).
c El acta o registro de la sesión de validación de requisitos con el referente, con fecha, participantes y observaciones
recibidas (31).
d Las versiones sucesivas del documento y del catálogo de requisitos, de modo que resulte visible la evolución de la
especificación.
e La evidencia de integración continua: registro de las corridas del canal de construcción, con resultado y fecha.
f La devolución docente recibida sobre la AE1 y la constancia de las correcciones incorporadas.
Los seis contenidos de la tabla son los que la consigna exige. A ellos conviene sumar, sin que constituyan exigencia,
el material de la Clase 8 con su numeración: lista filtrada de entidades (28), registro de reglas de negocio (29) y
glosario del dominio (30). Los instrumentos 23 a 26 provienen de la Clase 7 y los instrumentos 32 a 35 se publican
junto con esta guía.
11.2 · La Bitácora Individual en esta unidad
La bitácora conserva los seis elementos ya conocidos, con una agudización propia de la Unidad Dos que la consigna
señala en su elemento 2: toda delimitación excluye algo, y lo excluido debe quedar consignado. En la AE1 la
bitácora registraba hallazgos; aquí registra recortes, que son decisiones más difíciles de defender y, por eso mismo,
las que el tribunal interroga.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 27
<!-- página 28 -->
# Elemento Qué consigna en esta actividad
1 Qué se decidió Delimitación adoptada, requisito especificado, elección de iteración o asignación
de recurso.
2 Alternativas y criterio de descarte Qué quedó excluido por esa decisión y con qué criterio. La exclusión sin registro
es el hueco más frecuente.
3 Evidencia que la sostiene Hallazgo del relevamiento, validación del referente, fuente citada o principio de
ingeniería invocado.
4 Aporte personal Con remisión al registro del repositorio, a la tarjeta del tablero o al apartado del
documento que lo acredita.
5 Desacuerdo y resolución Conforme a la regla acordada en el acta de constitución del equipo.
6 Herramienta auxiliar Con el alcance empleado. Si se trata de inteligencia artificial, la declaración se
rige por el Protocolo de Uso Autorizado y sólo puede referirse a los usos allí
admitidos.
◆ CONCEPTO CLAVE — LA BITÁCORA ALOJA LO QUE EL ART. 21.º EXCLUYE DEL CUERPO
La relación entre bitácora e informe es de complementariedad estricta. El cuerpo consigna la decisión, su
fundamento y la alternativa descartada de manera sintética; la bitácora conserva el razonamiento completo. Schön
(1983) describe esta práctica como la reflexión sobre la acción que distingue al profesional del ejecutor: no basta con
decidir bien, hay que poder reconstruir cómo se decidió. La bitácora de esta unidad tiene además un destino
inmediato: es el insumo de estudio de la Actividad de Evaluación N.º 3, que es individual, sincrónica y calificada.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 28
<!-- página 29 -->
13 · La rúbrica: seis dimensiones
La rúbrica no produce calificación en esta actividad. Fundamenta la devolución y determina con precisión qué debe
corregirse durante la Ventana.
Se aplican seis dimensiones con cuatro niveles de dominio. La escala asigna 3 puntos al nivel 1, 6 al nivel 2, 8 al nivel
3 y 10 al nivel 4. Las cuatro primeras son específicas de la Unidad Dos; las dos últimas rigen de modo permanente.
Entre paréntesis se indica el criterio del artículo 18.1 de la Resolución 97/23 que cada dimensión instrumenta,
porque el equipo se entrena contra el mismo conjunto de criterios con el que el tribunal juzgará la defensa final. No
hay dos varas.
# Dimensión Qué se evalúa
1 Trazabilidad entre evidencia y
especificación (18.1.7)
Cada entidad, cada regla y cada requisito remiten a un hallazgo de la AE1 o a
una validación posterior documentada con el referente.
2 Visión sistémica e integración
curricular (18.1.4)
Conexión explícita con Gestión de Proyectos, Gestión de Bases de Datos y
Planificación de Sistemas de Información Inteligentes: la planificación y el
modelo del dominio exhiben la procedencia de sus decisiones.
3 Comprensión y manejo de los
conceptos teóricos (18.1.5)
Distinción precisa entre entorno y dominio, entre alcance y límite, y entre
requisito funcional y no funcional.
4 Formulación, coherencia interna y
calidad técnica del artefacto (18.1.1,
18.1.2, 18.1.6)
Coherencia entre el problema de la AE1, el dominio delimitado, los requisitos
especificados y la planificación comprometida. Ejecutabilidad efectiva del
prototipo v1.
5 Calidad de la argumentación: «¿por
qué decidiste esto?» (18.1.3)
Cada decisión exhibe su fundamento. El nivel superior exige además las
alternativas evaluadas y el criterio de descarte.
6 Contribución verificable, gestión
documental y presentación (18.1.8,
18.1.9)
Evidencia de trabajo distribuido en el repositorio y en el tablero; observancia de
los aspectos formales; ortografía y redacción.
◆ CÓMO SE DETERMINA EL ESTADO DE LA ACTIVIDAD
El estado no surge de la rúbrica sino de la verificación de los componentes. La AE2 se cierra como Entrega Completa
cuando los tres componentes exigidos —Producto principal, Portafolio Digital y Bitácora Individual de cada integrante
— se encuentran presentes, alcanzan el mínimo requerido y ninguna dimensión de la rúbrica queda situada en el
nivel 1. La ausencia de cualquiera de esos componentes, o la presencia de una dimensión en nivel 1, determina
Entrega Incompleta — requiere reelaboración. A ello se agrega la condición material: un prototipo v1 que no se
ejecute impide declarar completo el Producto principal.
Completo significa presentado y suficiente. No significa perfecto ni equivale a una nota.
La rúbrica desagregada en sus cuatro niveles se publica como pieza separada en el aula virtual, junto con esta guía.
Conviene leerla antes de escribir y no después de la devolución: los descriptores del nivel 4 son, leídos al derecho, la
lista de lo que hay que hacer.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 31
<!-- página 30 -->
14 · Trabajo autónomo y secuencia de las cuatro semanas
Trabajo fuera del horario de clase, estimado en seis a ocho horas semanales por estudiante durante las semanas 5 a
8.
# Actividad Contenido
a Lectura obligatoria Sommerville (2011), capítulos 4 y 5 · Pressman (2011), capítulos 5 a 7 · Osterwalder y
Pigneur (2019), primera y segunda parte · Kendall y Kendall (2005), capítulos 4 a 8.
b Sesión de validación Del modelo del dominio y del catálogo de requisitos con el referente, preparada con
guía escrita y registrada por acta.
c Construcción del esqueleto Configuración del repositorio, del canal de integración continua y del entorno de
ejecución, e implementación del caso de uso vertical seleccionado.
d Redacción incremental Capítulos III, IV, V y X, con aplicación de los aspectos formales desde el primer
borrador y corrección de las observaciones formales de la AE1.
e Bitácora Preparación individual, que constituye además el insumo de estudio para la Actividad
de Evaluación N.º 3.
▶ SECUENCIA SUGERIDA SOBRE LAS CUATRO SEMANAS
Semana 5 (7 al 12/09). Ficha de delimitación de entorno y dominio con tres exclusiones motivadas. Lista filtrada de
entidades con sus fuentes. Tres reglas de negocio enunciadas de modo verificable. Primeras ocho filas del catálogo,
trazadas. Repositorio con la estructura de la unidad y canal de construcción configurado, aunque todavía sin código.
Semana 6 (14 al 19/09). Semana con reducción prevista por exámenes. Catálogo hasta el conjunto completo de
Must. Guía de la sesión de validación redactada y fecha acordada con el referente. Esqueleto: proyecto creado, capas
vacías conectadas, primera corrida verde del canal.
Semana 7 (21 al 26/09). Sesión de validación realizada y acta redactada, antes del 25/09. Incorporación de las
observaciones al catálogo y al modelo. Lienzo, rivalidad amplificada y mapeo de competencia. Caso de uso vertical
implementado de punta a punta.
Semana 8 (28/09 al 01/10). Capítulos V y X. Prueba de clonado en máquina limpia por un integrante que no
construyó el esqueleto. Etiqueta v1 . Revisión formal contra los Arts. 20.º y 21.º. Consolidación del Portafolio, cierre
de bitácoras y lista de autoverificación la noche anterior.
⚠ EL ORDEN IMPORTA MÁS QUE EL ESFUERZO
La secuencia inversa —escribir los capítulos primero y validar al final— es la que produce la mayor cantidad de
retrabajo, porque toda observación del referente obliga a reescribir lo ya redactado. Validar en la semana 7 y no en la
8 no es una recomendación de prolijidad: es lo que permite que las observaciones lleguen a tiempo de ser
incorporadas.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 32
<!-- página 31 -->
15 · Los diez errores más sancionados de esta unidad
Cada uno se observó en cohortes anteriores o en la corrección de la AE1 de esta comisión. Estar advertidos por
escrito modifica la escala de exigencia, no la reduce.
# Error Corrección
1 Requisitos sin criterio de aceptación
comprobable
Escribir condición inicial, acción y resultado observable con valores.
Aplicar la prueba del compañero antes de cerrar la fila.
2 No funcionales enunciados con adjetivos Magnitud, unidad y condición de medición. «Rápido» no es un
requisito; «menos de dos segundos sobre diez mil registros» sí.
3 Dominio deducido de la intuición del equipo Cada entidad y cada regla con su evidencia de origen. El descarte
también se registra, con su veredicto.
4 Alcance sin exclusiones validadas Tabla de límites con motivo, validador y estado. La exclusión no
validada es una hipótesis, no una frontera.
5 Lienzo de modelo de negocio ilustrativo Derivar de él el análisis de rivalidad amplificada y declarar qué
implicancia tiene sobre el alcance.
6 Catálogo con todos los requisitos en «Must» Priorizar es nombrar lo que no se hará. El conjunto de los Must
coincide con el producto mínimo viable.
7 Producto mínimo viable descrito con promesas Enumerar los casos de uso incluidos y los excluidos, sin adjetivos.
8 Prototipo horizontal: pantallas sin persistencia Un solo caso de uso que atraviesa interfaz, lógica, persistencia y
retorno vale más que tres pantallas sin fondo.
9 Repositorio que no ejecuta en máquina limpia Declarar dependencias, incluir el archivo de variables de ejemplo y el
guion de creación del esquema. Probar el clonado antes de entregar.
10 Historial concentrado en la víspera y registros
no atribuidos
Versionar a medida que se trabaja y configurar la identidad de cada
integrante. Sin eso, la dimensión 6 carece de base de evaluación.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 33
<!-- página 32 -->
16 · Lista de autoverificación antes de subir los archivos
Recórrase completa la noche anterior a la entrega, no el mismo día. Cada casilla sin marcar es una observación
previsible en la devolución.
Documento principal
☐ Un único archivo PDF con los Capítulos III, IV, V y X, más el catálogo como apartado del Capítulo III.
☐ Cada capítulo comienza en hoja aparte, con numeral romano y título en mayúsculas centrados.
☐ Los apartados de cada capítulo siguen la numeración y los títulos reglamentarios.
☐ El entorno declara sus cuatro categorías y cada elemento su implicancia de diseño.
☐ Cada entidad del dominio remite a una fuente identificada.
☐ Las reglas de negocio están clasificadas por tipo y con estado de validación.
☐ Alcance del sistema y alcance del proyecto están diferenciados y son coherentes con el presupuesto de horas.
☐ La tabla de límites declara motivo, validador y estado para cada exclusión.
☐ El lienzo deriva expresamente en el análisis de rivalidad amplificada.
☐ Cada fuerza competitiva declara su implicancia decisoria.
☐ El flujo de valor automatizable se justifica con la evidencia de la línea de base.
☐ Las iteraciones tienen objetivo verificable, entregable y definición de terminado.
☐ El producto mínimo viable enumera casos de uso incluidos y excluidos.
☐ La cláusula de contingencia por pérdida de un integrante está escrita.
☐ Las horas del Capítulo X coinciden con las del Capítulo V.
Catálogo de requisitos
☐ Todas las filas tienen los seis campos completos.
☐ Todo criterio de aceptación es un procedimiento ejecutable por un tercero.
☐ Los no funcionales declaran magnitud, unidad y condición de medición.
☐ Todo requisito trazado a un hallazgo de la AE1 o a un acuerdo del acta.
☐ Todo hallazgo llega a un requisito o a su justificación expresa.
☐ El conjunto de los Must coincide con el producto mínimo viable.
Prototipo v1
☐ La etiqueta v1 existe y apunta a la revisión que se entrega.
☐ El archivo de lectura contiene requisitos previos, instalación, configuración, ejecución y verificación.
☐ El proyecto fue clonado y ejecutado en una máquina distinta de la del autor, siguiendo sólo ese archivo.
☐ El caso de uso vertical atraviesa interfaz, lógica, persistencia y retorno.
☐ Al menos una regla de negocio se valida en la capa de lógica.
☐ El canal de integración continua corrió con resultado exitoso y su registro es accesible.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 34
<!-- página 33 -->
☐ No hay credenciales en el repositorio; los datos de personas están anonimizados o cuentan con
consentimiento documentado, y no se incorporan datos sensibles. Existe el archivo de variables de ejemplo.
Enlaces y componentes de cierre
☐ Los tres enlaces abren desde una sesión ajena, probados en ventana de incógnito.
☐ El tablero refleja la planificación de las cuatro semanas, con responsable, estado y fecha.
☐ Los registros del repositorio están atribuidos a la identidad de cada integrante.
☐ Constancia de la sesión de validación con fecha, participantes y observaciones.
☐ Portafolio con los seis contenidos exigidos en la subcarpeta AE2.
☐ Bitácora Individual de cada integrante, con entradas fechadas y los seis elementos.
☐ Declaración de uso de herramientas auxiliares; si no hubo uso, conviene consignarlo de manera expresa.
☐ Las observaciones formales de la devolución de la AE1 están efectivamente corregidas.
✦ LA ÚLTIMA VERIFICACIÓN, Y LA MÁS ÚTIL
Elíjase al azar un requisito del catálogo y recórrase hacia atrás hasta el hallazgo del Capítulo II que lo origina, y desde
ese hallazgo hasta el instrumento que lo produjo. Después recórrase hacia adelante: hasta la iteración del Capítulo V
que lo implementa y, si es un Must, hasta el producto mínimo viable. Si la cadena se corta en algún eslabón, ese es
exactamente el punto por el que la cátedra va a preguntar. Yin (2018) llama a esto cadena de evidencia, y es el
criterio que separa una especificación verificable de una lista de intenciones.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 35
<!-- página 34 -->
17 · Bibliografía de referencia
Las obras señaladas con asterisco integran la lectura obligatoria del trabajo autónomo de las semanas 5 a 8.
Normativa
Universidad de la Cuenca del Plata. (2023). Resolución Rectoral N.º 97/23. Reglamento General del Proyecto
Integrador Final. Normativa de consulta permanente.
Universidad de la Cuenca del Plata. (2026). Guía Docente del Sistema de Evaluación Multimodal, Partes I y II.
República Argentina. (1972). Ley N.º 19.511. Sistema Métrico Legal Argentino.
República Argentina. (2000). Ley N.º 25.326. Protección de los Datos Personales.
República Argentina. (2019). Ley N.º 27.506. Régimen de Promoción de la Economía del Conocimiento.
Ingeniería de requisitos y modelado del dominio
Sommerville, I. (2011). Ingeniería del software (9.ª ed.). Pearson Educación. *
Pressman, R. S. (2011). Ingeniería del software. Un enfoque práctico (7.ª ed.). McGraw-Hill. *
Wiegers, K. y Beatty, J. (2013). Software Requirements (3.ª ed.). Microsoft Press.
ISO/IEC/IEEE. (2018). ISO/IEC/IEEE 29148:2018. Systems and software engineering — Life cycle processes —
Requirements engineering.
Larman, C. (2004). Applying UML and Patterns (3.ª ed.). Prentice Hall.
Evans, E. (2003). Domain-Driven Design: Tackling Complexity in the Heart of Software. Addison-Wesley.
Kendall, K. E. y Kendall, J. E. (2005). Análisis y diseño de sistemas (6.ª ed.). Pearson Educación. *
Cockburn, A. (2001). Writing Effective Use Cases. Addison-Wesley.
Arquitectura, construcción e integración continua
Cockburn, A. (2004). Crystal Clear: A Human-Powered Methodology for Small Teams. Addison-Wesley.
Hunt, A. y Thomas, D. (1999). The Pragmatic Programmer. Addison-Wesley.
Humble, J. y Farley, D. (2010). Continuous Delivery. Addison-Wesley.
Duvall, P., Matyas, S. y Glover, A. (2007). Continuous Integration: Improving Software Quality and Reducing Risk.
Addison-Wesley.
Fowler, M. (2006). Continuous integration. martinfowler.com.
Bass, L., Clements, P. y Kazman, R. (2012). Software Architecture in Practice (3.ª ed.). Addison-Wesley.
Boehm, B. W. (1981). Software Engineering Economics. Prentice Hall.
Brooks, F. P. (1987). No silver bullet: essence and accidents of software engineering. Computer, 20(4), 10–19.
Modelo de negocio, estrategia y planificación
Osterwalder, A. y Pigneur, Y. (2019). Generación de modelos de negocio. Deusto. (Obra original publicada en
2010.) *
Porter, M. E. (2018). Estrategia competitiva. Grupo Editorial Patria. (Obra original publicada en 1980.)
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 36
<!-- página 35 -->
Ries, E. (2017). El método Lean Startup. Deusto. (Obra original publicada en 2011.)
Clegg, D. y Barker, R. (1994). Case Method Fast-Track: A RAD Approach. Addison-Wesley.
Cohn, M. (2005). Agile Estimating and Planning. Prentice Hall.
Schwaber, K. y Sutherland, J. (2020). La Guía de Scrum.
Project Management Institute. (2013). Guía de los fundamentos para la dirección de proyectos (5.ª ed.).
Sistemas, método y reflexión profesional
Bertalanffy, L. von. (1968). General System Theory: Foundations, Development, Applications. George Braziller.
Checkland, P. (1981). Systems Thinking, Systems Practice. John Wiley and Sons.
Schön, D. A. (1983). The Reflective Practitioner: How Professionals Think in Action. Basic Books.
Yin, R. K. (2018). Case Study Research and Applications (6.ª ed.). SAGE.
American Psychological Association. (2020). Publication Manual of the American Psychological Association (7.ª
ed.).
CIERRE
Cuatro semanas separan esta consigna de la entrega, y la diferencia entre un equipo que llega y uno que no suele
decidirse en la segunda, cuando se acuerda la fecha de la sesión de validación. Quien valida en la semana 7 incorpora
las observaciones del referente y entrega un documento coherente; quien valida en la semana 8, si es que valida,
entrega un documento y un acta que se contradicen.
Sobre el esqueleto arquitectónico conviene una última advertencia, porque es la pieza que más equipos subestiman:
no se construye en dos días, no porque exija mucho código, sino porque exige que las decisiones ya estén tomadas.
Empezar por él en la semana 8 es descubrir en la semana 8 que la arquitectura no estaba decidida.
La cátedra está disponible en el canal de comunicación y en el horario de Docencia en Aula Digital. Preguntar a
tiempo forma parte del método.
Actividad de Evaluación N.º 2 · Proyecto Final de Grado 2026
Guía de consignas AE2 · UCP · Ingeniería en Sistemas de Información · Pág. 37
