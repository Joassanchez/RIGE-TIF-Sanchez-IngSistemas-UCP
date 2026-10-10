/**
 * Crea en Google Forms la encuesta de práctica (versión en español).
 * Fuente del texto: borrador-encuesta-practica.md, sección 1 (segunda revisión del 09/10/2026).
 * Los títulos no llevan número: con los saltos condicionales aparecerían discontinuos.
 * El borrador conserva la numeración como identificador del análisis (se indica en cada comentario).
 *
 * Uso: script.google.com → Proyecto nuevo → pegar este archivo → ejecutar crearEncuesta
 * → autorizar → los enlaces de edición y de respuesta quedan en el registro de ejecución.
 * El tema visual (color, imagen de cabecera, tipografía) se elige después desde el editor
 * del formulario (ícono de paleta): Apps Script no permite fijarlo.
 */
var CONTACTO = 'joassanchez03@gmail.com';

function crearEncuesta() {
  var form = FormApp.create('Cómo configurás tu herramienta de programación con agentes');
  form.setDescription([
    'QUIÉN LA HACE Y PARA QUÉ. Soy Joaquín Sebastián Sánchez, estudiante de Ingeniería en Sistemas de ' +
      'Información en la Universidad de la Cuenca del Plata (Posadas, Argentina). Esta encuesta forma parte ' +
      'de mi Proyecto Final de carrera y busca entender cómo descubrís y modificás la configuración de las ' +
      'herramientas de programación con agentes que usás (por ejemplo, OpenCode, Claude Code o Cursor).',
    'QUÉ TE PIDO. Responder hasta 17 preguntas, casi todas cerradas, sobre tu experiencia de los últimos ' +
      'tres meses. Lleva unos 5 minutos. La única pregunta de texto libre es opcional.',
    'PARTICIPACIÓN VOLUNTARIA. Podés dejar la encuesta en cualquier momento antes de enviarla, sin ninguna ' +
      'consecuencia. Como las respuestas son anónimas, una vez enviadas no es posible identificarlas para retirarlas.',
    'ANONIMATO Y DATOS. La encuesta no pide tu nombre, tu correo ni datos de tu organización. Te pido que no ' +
      'los incluyas en la respuesta de texto libre. Los datos se tratan conforme a la Ley N.º 25.326 de ' +
      'Protección de los Datos Personales.',
    'USO DE LOS RESULTADOS. Las respuestas se analizan y se publican solo en forma agregada, en el informe ' +
      'del Proyecto Final. Las respuestas individuales se eliminan al aprobarse el proyecto.',
    'RIESGOS Y BENEFICIOS. Responder no implica riesgos previsibles ni beneficios directos para vos; ' +
      'contribuye a un trabajo académico.',
    'CONSULTAS. ' + CONTACTO
  ].join('\n\n'));
  // Anonimato: sin correos y sin límite de una respuesta (el límite exige iniciar sesión con Google).
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false);
  form.setAllowResponseEdits(false);
  form.setProgressBar(true);
  form.setConfirmationMessage(
    '¡Gracias por responder! Los resultados agregados se publican en el informe del Proyecto Final. ' +
    'Si querés conocerlos, escribime a ' + CONTACTO + '.');

  // C · Consentimiento (el texto está en la descripción del formulario)
  var consentimiento = form.addMultipleChoiceItem()
    .setTitle('¿Aceptás participar?')
    .setRequired(true);

  form.addPageBreakItem().setTitle('Uso de herramientas');

  // 1
  var usa = form.addMultipleChoiceItem()
    .setTitle('¿Usaste alguna herramienta de programación con agentes en los últimos tres meses?')
    .setHelpText('Herramientas que ejecutan tareas de varios pasos por su cuenta, como editar archivos o ' +
                 'correr comandos. Por ejemplo: OpenCode, Claude Code, Cursor en modo agente, GitHub Copilot ' +
                 'en modo agente o Codex CLI. El autocompletado de código solo no cuenta.')
    .setRequired(true);

  form.addPageBreakItem().setTitle('Tu uso');

  // 2
  form.addCheckboxItem()
    .setTitle('¿Cuáles?')
    .setChoiceValues(['OpenCode', 'Claude Code', 'Cursor (modo agente)',
                      'GitHub Copilot (modo agente o Copilot CLI)', 'Codex CLI', 'Gemini CLI',
                      'Windsurf', 'Cline o Roo Code', 'Aider'])
    .showOtherOption(true)
    .setRequired(true);

  // 3
  form.addMultipleChoiceItem()
    .setTitle('¿Con qué frecuencia las usás?')
    .setChoiceValues(['A diario', 'Varias veces por semana', 'Una vez por semana', 'Con menor frecuencia'])
    .setRequired(true);

  // 4
  form.addCheckboxItem()
    .setTitle('¿En qué contexto las usás?')
    .setChoiceValues(['En mi trabajo', 'En proyectos personales', 'En el estudio'])
    .setRequired(true);

  // 5
  form.addMultipleChoiceItem()
    .setTitle('¿Cuántos años de experiencia tenés programando?')
    .setChoiceValues(['Menos de 2', 'De 2 a 5', 'De 6 a 10', 'Más de 10'])
    .setRequired(true);

  // 6
  form.addMultipleChoiceItem()
    .setTitle('Tu configuración, ¿está repartida en más de un archivo o nivel?')
    .setHelpText('Por ejemplo, un archivo global en tu usuario y otro dentro del proyecto, archivos de ' +
                 'agentes o una variable de entorno que cambia el modelo.')
    .setChoiceValues(['Sí', 'No', 'No sé'])
    .setRequired(true);

  // 7
  var ultimaVez = form.addMultipleChoiceItem()
    .setTitle('Pensá en la última vez que necesitaste saber qué configuración regía realmente: por ejemplo, ' +
              'qué modelo usaba un agente, si tenía permiso para ejecutar un comando o por qué un cambio no ' +
              'tuvo efecto. ¿Cuándo fue, aproximadamente?')
    .setRequired(true);

  form.addPageBreakItem().setTitle('La última consulta');

  // 8 · a–f no delegadas; g–i delegadas; j salta. Sin showOtherOption: Forms no la admite junto
  // con saltos por respuesta; «Otra» es una opción común y el detalle va en la pregunta siguiente.
  var metodo = form.addMultipleChoiceItem()
    .setTitle('En esa última vez, ¿cuál fue el método principal con el que lo averiguaste?')
    .setRequired(true);

  // 8 bis
  form.addTextItem()
    .setTitle('Si elegiste «Otra», ¿cuál?')
    .setRequired(false);

  // 8 ter · aproximación al costo humano (ADR-078, K-A)
  form.addMultipleChoiceItem()
    .setTitle('¿Cuánto tiempo te llevó averiguarlo, aproximadamente?')
    .setChoiceValues(['Menos de 5 minutos', 'De 5 a 15 minutos', 'De 15 a 60 minutos', 'Más de una hora'])
    .setRequired(true);

  // 9
  form.addMultipleChoiceItem()
    .setTitle('¿Comprobaste de alguna forma que la respuesta fuera correcta?')
    .setChoiceValues(['Sí, probando el comportamiento', 'Sí, de otra forma', 'No', 'No sé'])
    .setRequired(true);

  // 10
  form.addMultipleChoiceItem()
    .setTitle('¿La respuesta resultó correcta?')
    .setChoiceValues(['Sí', 'No (me di cuenta al comprobarla o más tarde)', 'No sé'])
    .setRequired(true);

  var secCambios = form.addPageBreakItem().setTitle('Cambios en la configuración');

  // 11
  var cambio = form.addMultipleChoiceItem()
    .setTitle('En los últimos tres meses, ¿cambiaste la configuración de tu herramienta?')
    .setRequired(true);

  form.addPageBreakItem().setTitle('El último cambio');

  // 12 · a apariencia (no cuenta para P1)
  form.addCheckboxItem()
    .setTitle('Pensá en el último cambio. ¿Qué cambiaste?')
    .setChoiceValues([
      'Apariencia: tema, colores, atajos de teclado o interfaz',
      'Modelos o proveedores',
      'Permisos: qué puede ejecutar, leer o editar el agente',
      'Agentes o subagentes',
      'Comandos o skills',
      'Servidores MCP o plugins',
      'Instrucciones o reglas (por ejemplo, AGENTS.md)'
    ])
    .showOtherOption(true)
    .setRequired(true);

  // 13 · a manual; b–d delegadas
  form.addMultipleChoiceItem()
    .setTitle('¿Cómo hiciste principalmente ese cambio?')
    .setChoiceValues([
      'Edité los archivos a mano',
      'Le pedí al agente de la herramienta que hiciera el cambio',
      'Le pedí el texto a un chat de IA y lo pegué yo',
      'Usé un comando o asistente de la propia herramienta (por ejemplo, para crear un agente)'
    ])
    .showOtherOption(true)
    .setRequired(true);

  var secFrecuencia = form.addPageBreakItem().setTitle('Frecuencia y comportamiento');

  // 14
  form.addMultipleChoiceItem()
    .setTitle('En el último mes, ¿cuántas veces le pediste a un agente o a un chat de IA que revisara, ' +
              'explicara o cambiara tu configuración?')
    .setChoiceValues(['Ninguna', '1 o 2', '3 a 5', '6 a 10', 'Más de 10'])
    .setRequired(true);

  // 15
  var comportamiento = form.addMultipleChoiceItem()
    .setTitle('En los últimos tres meses, ¿algún agente se comportó de forma distinta de la que esperabas ' +
              'según tu configuración? Por ejemplo, ejecutó algo que creías restringido o usó otro modelo.')
    .setRequired(true);

  form.addPageBreakItem().setTitle('El episodio');

  // 16
  form.addParagraphTextItem()
    .setTitle('(Opcional) Si querés, contanos brevemente qué pasó.')
    .setHelpText('No incluyas nombres, correos ni datos de tu organización.')
    .setRequired(false);

  // Saltos condicionales: se fijan al final, cuando ya existen las secciones de destino.
  var SEGUIR = FormApp.PageNavigationType.CONTINUE;
  var FIN = FormApp.PageNavigationType.SUBMIT;

  consentimiento.setChoices([
    consentimiento.createChoice('Sí: tengo 18 años o más, leí la información anterior y acepto participar', SEGUIR),
    consentimiento.createChoice('No acepto', FIN)
  ]);
  usa.setChoices([usa.createChoice('Sí', SEGUIR), usa.createChoice('No', FIN)]);
  ultimaVez.setChoices([
    ultimaVez.createChoice('En la última semana', SEGUIR),
    ultimaVez.createChoice('En el último mes', SEGUIR),
    ultimaVez.createChoice('Hace más de un mes', SEGUIR),
    ultimaVez.createChoice('Nunca me pasó', secCambios)
  ]);
  metodo.setChoices([
    metodo.createChoice('Abrí y leí los archivos de configuración', SEGUIR),
    metodo.createChoice('Consulté la documentación oficial', SEGUIR),
    metodo.createChoice('Usé un comando de la propia herramienta (por ejemplo, uno de depuración o de listado)', SEGUIR),
    metodo.createChoice('Busqué en foros, issues de GitHub o Stack Overflow', SEGUIR),
    metodo.createChoice('Le pregunté a un colega', SEGUIR),
    metodo.createChoice('Prueba y error hasta que funcionó', SEGUIR),
    metodo.createChoice('Le pregunté a un chat de IA (ChatGPT, Claude, etc.)', SEGUIR),
    metodo.createChoice('Le pedí al propio agente de la herramienta que revisara la configuración', SEGUIR),
    metodo.createChoice('Usé un agente, comando o guion que armé yo o mi equipo para eso', SEGUIR),
    metodo.createChoice('Otra', SEGUIR),
    metodo.createChoice('No lo pude averiguar', secCambios)
  ]);
  cambio.setChoices([cambio.createChoice('Sí', SEGUIR), cambio.createChoice('No', secFrecuencia)]);
  comportamiento.setChoices([
    comportamiento.createChoice('Sí, una vez', SEGUIR),
    comportamiento.createChoice('Sí, más de una vez', SEGUIR),
    comportamiento.createChoice('No', FIN),
    comportamiento.createChoice('No sé', FIN)
  ]);

  Logger.log('Edición: ' + form.getEditUrl());
  Logger.log('Respuesta: ' + form.getPublishedUrl());
}
