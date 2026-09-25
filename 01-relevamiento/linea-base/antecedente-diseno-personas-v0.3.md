# Diseño de la medición de línea base

**Proyecto Integrador Final · Ingeniería en Sistemas de Información · UCP**
**RIGE — Plataforma de auditoría y resolución de la configuración efectiva de agentes de IA**
**Herramienta bajo estudio: OpenCode 1.18.25**

| Campo | Valor |
|---|---|
| Documento | Diseño del instrumento de medición de la línea base |
| Versión | 0.3 — incorpora el laboratorio de verificación con agente real y la corrección sobre el motor de permisos v2 |
| Estado | En definición. Las decisiones marcadas `[CONFIRMAR]` esperan tu aval antes de construir |
| Autor | Joaquín Sebastián Sánchez |
| Última actualización | 21/09/2026 |
| Apartados del informe que alimenta | I.2.3, I.3, II.2, II.3, II.4 y Anexos |

> **Convenciones.**
> `[ ]` pendiente de definir · `[CONFIRMAR]` decisión propuesta en esta versión que espera tu aval ·
> `[VERIFICADO]` comprobado ejecutando OpenCode 1.18.25 o leyendo el código fuente del tag, con la evidencia indicada ·
> `[EJECUCIÓN]` confirmado además con un agente real corriendo, en el laboratorio de verificación (Windows 11, 19/09/2026, `INFORME.md`) ·
> `[REVERIFICAR EN VM]` comprobado fuera de la máquina virtual; hay que repetirlo en la VM definitiva y capturar la salida para el anexo.

---

## Índice

1. [Propósito del documento](#1-propósito-del-documento)
2. [Relación con el informe del PIF](#2-relación-con-el-informe-del-pif)
3. [Antecedentes: qué se conserva, qué se descarta y qué cambió en la v0.2 y la v0.3](#3-antecedentes-qué-se-conserva-qué-se-descarta-y-qué-cambió-en-la-v02-y-la-v03)
4. [Preguntas y tipo de estudio](#4-preguntas-y-tipo-de-estudio)
5. [Participantes](#5-participantes)
6. [Modalidad y entorno](#6-modalidad-y-entorno)
7. [Recursos disponibles durante la sesión](#7-recursos-disponibles-durante-la-sesión)
8. [Condiciones y casos](#8-condiciones-y-casos)
9. [Forma única y control del aprendizaje](#9-forma-única-y-control-del-aprendizaje)
10. [Orden de presentación de los casos](#10-orden-de-presentación-de-los-casos)
11. [Procedimiento de la sesión](#11-procedimiento-de-la-sesión)
12. [Protocolo de cronometraje y respuesta](#12-protocolo-de-cronometraje-y-respuesta)
13. [Criterios de corrección](#13-criterios-de-corrección)
14. [Variables y registro de datos](#14-variables-y-registro-de-datos)
15. [Plan de análisis](#15-plan-de-análisis)
16. [Criterio de éxito derivado](#16-criterio-de-éxito-derivado)
17. [Frecuencia, consecuencia y valoración económica](#17-frecuencia-consecuencia-y-valoración-económica)
18. [Prueba piloto](#18-prueba-piloto)
19. [Medición final de noviembre](#19-medición-final-de-noviembre)
20. [Aspectos éticos y protección de datos](#20-aspectos-éticos-y-protección-de-datos)
21. [Amenazas a la validez](#21-amenazas-a-la-validez)
22. [Ubicación de cada elemento en el informe](#22-ubicación-de-cada-elemento-en-el-informe)
23. [Estructura de carpetas y artefactos a construir](#23-estructura-de-carpetas-y-artefactos-a-construir)
24. [Registro de decisiones](#24-registro-de-decisiones)
25. [Pendientes](#25-pendientes)
26. [Referencias](#26-referencias)

---

## 1. Propósito del documento

Este documento define cómo se mide la línea base del problema que aborda el proyecto: el costo, en tiempo y en respuestas erróneas, de determinar **qué configuración rige efectivamente sobre un agente de OpenCode y de qué fuente proviene**.

Cumple tres funciones:

- **Definir y discutir** el instrumento antes de construir cualquier archivo, carpeta o caso.
- **Registrar las decisiones** tomadas, con la alternativa descartada y su motivo, para trasladarlas a la bitácora y al informe.
- **Servir como documento independiente** que puede mostrarse por separado al docente o al tribunal.

Todo cambio posterior se registra en la sección 24 y en la bitácora individual.

---

## 2. Relación con el informe del PIF

| Apartado | Qué toma de este diseño |
|---|---|
| **I.1.3 a)** | La disfunción operativa se cuantifica con esta medición |
| **I.2.3** | Objetivo general: reducir la tasa de respuestas erróneas y el tiempo de resolución, con prevalencia del error |
| **I.2.4, OE-4** | La validación del resultado conjunto usa este mismo instrumento en noviembre |
| **I.3** | Enunciado del problema, línea de base, criterio de éxito y valoración de la consecuencia |
| **II.2** | Diseño completo del instrumento |
| **II.3 y II.4** | Datos en bruto y gráficos por condición |
| **Anexos** | Casos, hoja de referencia, consentimiento, cuestionario, registro del piloto y planilla |

La cadena lógica que este diseño debe sostener:

```
I.1 · Disfunción dominante
   └─ I.3 · Problema medido con tiempo y error  ←  este instrumento (línea base)
         └─ I.2.3 · Metas derivadas de la línea base
               └─ OE-4 · Mismo instrumento con la plataforma (noviembre)
```

---

## 3. Antecedentes: qué se conserva, qué se descarta y qué cambió en la v0.2 y la v0.3

### 3.1 La línea base anterior no existe

En la versión anterior del proyecto la línea base **no llegó a medirse**. Por lo tanto:

- **Ningún valor de la versión anterior se utiliza** en el informe, los anexos, la bitácora, el repositorio, el tablero ni el Portafolio (109 s, 45,1 %, 26 s, tres archivos por consulta, rangos de costo). Deben eliminarse de todo documento donde aparezcan.
- Esta es la **primera medición real**, lo que vuelve obligatoria la prueba piloto (sección 18).

### 3.2 Decisiones de método que se conservan

| Decisión | Motivo |
|---|---|
| Medición experimental con respuesta conocida por construcción | Aporta evidencia de conducta y no de opinión; la respuesta correcta es verificable |
| Entorno ajeno al participante | Evita que responda de memoria sobre su propia configuración |
| Límite de tiempo por caso con uso de la mediana | La mediana admite observaciones censuradas mientras no superen la mitad |
| No prometer una tasa de error del 0 % | Con muestras pequeñas no puede acreditarse una tasa poblacional nula |
| Cuatro condiciones con dos casos cada una | Distingue caso de condición sin alargar la sesión |

### 3.3 Elementos de la versión anterior que se descartan

| Elemento | Motivo |
|---|---|
| Diagnóstico con la pirámide de Kendall y Kendall | Sus niveles son organizacionales; la plataforma es de uso individual y EMSA no es el ámbito |
| Requisitos de latencia dentro del I.3 | Corresponden al capítulo de requisitos |
| Riesgos dentro del I.3 | Corresponden al capítulo de planificación |
| Coincidencia con comandos nativos como criterio de éxito del I.3 | Es corrección del producto; ya vive en OE-1 y OE-2 |
| Previsualización de edición | La edición ya no forma parte de la propuesta |

### 3.4 Qué cambió en la v0.2 y por qué

El relevamiento del código fuente del tag `v1.18.25` (Anexo I, A.I.3, ampliado) obligó a revisar tres supuestos del diseño anterior. Los hallazgos completos están en la guía técnica que acompaña a este documento; acá va sólo lo que cambia el instrumento.

**a) Existen comandos nativos de introspección más potentes de lo que suponía el diseño.**
Además de `opencode debug config`, la herramienta expone `opencode debug agent <nombre>`, que imprime el **ruleset compilado** de un agente, incluidas las reglas nativas que no están declaradas en ningún archivo. `[VERIFICADO]`
Consecuencia: los casos redactados en la v0.1 se respondían ejecutando un comando, y la línea base habría medido "quién conoce el comando" en lugar del fenómeno.

**b) Ningún comando nativo informa la procedencia.**
Ni `debug config` ni `debug agent` indican de qué archivo, variable de entorno o regla nativa proviene cada valor o cada regla. El JSON resuelto y la lista de reglas se presentan sin etiquetas de origen. `[VERIFICADO]`
Consecuencia: la decisión de la v0.1 de exigir **valor + fuente** (o decisión + regla) como respuesta correcta queda confirmada empíricamente y pasa a ser el eje del instrumento. Es también el argumento que responde la pregunta previsible del tribunal: *"¿esto no lo resuelve un comando nativo?"* — resuelve el *qué*, nunca el *de dónde*.

**c) Los mecanismos reales son más y más finos que los supuestos.**
La configuración efectiva se arma fusionando hasta doce entradas distintas, la precedencia de los directorios `.opencode/` está invertida respecto de la de los archivos `opencode.json`, hay valores que provienen de variables de entorno y no de archivos, y la decisión de un permiso depende del **orden de escritura de las claves**, no de su especificidad.
Consecuencia: los ocho casos se rehicieron sobre mecanismos verificados y con respaldo externo (issues reales del repositorio), en lugar de sobre ejemplos genéricos.

### 3.5 Qué cambió en la v0.3 y por qué

Se ejecutó un laboratorio de verificación con un agente real sobre OpenCode 1.18.25: diecisiete experimentos más dos de cierre, cada uno con doble testigo (estado de la herramienta y archivo centinela en disco). Tres resultados tocan el instrumento.

**a) Los casos C-3b, C-4a y C-4b quedan confirmados extremo a extremo.** Ya no sólo en el ruleset compilado: un agente corriendo ejecutó `git status` en el escenario de C-4a y lo tuvo denegado en el de C-4b, con exactamente las mismas reglas escritas en distinto orden. Y rechazó la lectura de `.env` sin ninguna regla declarada.

**b) La herramienta trae un manual de configuración embebido.** `opencode debug skill` expone una skill interna, `customize-opencode`, que documenta de forma explícita que el orden de inserción importa y que gana la última regla que coincide. Obliga a incluirlo en los recursos disponibles (sección 7). Al revisar la documentación para la versión offline apareció además que la regla de última coincidencia **también está en las páginas web** (`permissions.mdx`): la v0.2 afirmaba lo contrario, y era un error. C-4a queda como documentado. C-4b sigue sin documentar: ninguna de las dos fuentes explica qué le ocurre a la posición de una clave al fusionar dos archivos.

**d) La documentación contradice el comportamiento en C-3b.** La web afirma que los `.env` se deniegan por defecto; la herramienta pregunta. Se mantiene el caso con respuesta `ask` y se agrega la clasificación "documentada de forma incorrecta", que permite analizar cuántos participantes siguen la documentación y yerran.

**c) El tag contiene dos motores de permisos, y en la 1.18.25 se ejecuta el v2.** La v0.2 citaba como evidencia de la regla de última coincidencia el código de `packages/opencode/src/permission/index.ts`, que es el motor v1. El que decide es `packages/core/src/permission.ts`. Ambos usan la misma regla (`findLast`), así que **ningún caso cambia**; sólo la referencia. Pero dos conclusiones de la guía técnica que dependían del v1 resultaron falsas en ejecución, lo que refuerza el criterio 8.2-2: la verificación se hace ejecutando, no leyendo el código.

---

## 4. Preguntas y tipo de estudio

### Preguntas

- **P1.** ¿Cuánto tiempo demora y con qué tasa de error un desarrollador determina qué valor rige sobre un agente, o qué decisión de permiso corresponde a una acción, **y de qué fuente o regla proviene**?
- **P2.** ¿La dificultad crece según el tipo de consulta? (evidencia directa de la disfunción del I.1)
- **P3.** ¿Qué valores sirven de línea base para el criterio de éxito del I.2.3?

### Tipo de estudio

**Estudio exploratorio con tareas controladas.** Se describen los resultados mediante medianas, tasas e intervalos de confianza, sin contraste de hipótesis. El tamaño de la muestra alcanzable no permite inferencia estadística, y así se declara.

---

## 5. Participantes

### Población

Desarrolladores con experiencia práctica en al menos una herramienta de programación basada en agentes (OpenCode, Claude Code, OpenAI Codex, Cursor, GitHub Copilot u otra).

### Criterios de inclusión

- Uso de alguna herramienta de programación basada en agentes en los últimos tres meses.
- Lectura fluida de archivos JSON.
- Lectura de documentación técnica en inglés.
- Disponibilidad para una segunda sesión en noviembre de 2026.

### Criterios de exclusión

- Haber participado en la prueba piloto.
- Haber visto los casos del instrumento.
- Haber visto el diseño o el prototipo de la plataforma antes de la sesión de línea base.

### Tamaño

| Momento | Objetivo |
|---|---|
| Reclutamiento | 13 personas `[CONFIRMAR]` |
| Línea base | 10 participantes |
| Medición final (noviembre) | Al menos 8 de los mismos participantes |

El margen de tres personas sobre el objetivo de diez cubre bajas entre el compromiso y la sesión. La deserción entre ambas mediciones se trata en la sección 19. El tamaño se declara como limitación.

### Reclutamiento

- Comunidades y foros de desarrollo.
- Colegas del trabajo freelance.
- Compañeros de carrera con experiencia en herramientas agénticas.
- Equipo de Sistemas de EMSA, a través del referente `[ ] confirmar si puede facilitar participantes`.

### Participación del referente (Valeria Areco)

- Participa en la línea base **antes de ver el prototipo v0**.
- En noviembre su resultado se informa **por separado** y se excluye del análisis pareado principal, porque conoce la plataforma desde antes que el resto.

### Cuestionario previo (≈ 2 minutos)

| Pregunta | Tipo de respuesta |
|---|---|
| Años de experiencia en desarrollo | Número |
| Herramientas de programación basadas en agentes utilizadas | Selección múltiple |
| Frecuencia de uso | Diaria / semanal / mensual / ocasional |
| ¿Usó OpenCode alguna vez? | Sí / No |
| ¿Configuró permisos de un agente alguna vez? | Sí / No |
| ¿Conocía los comandos `opencode debug config`, `opencode debug agent` u `opencode debug skill`? | Sí / No |

> La última pregunta se agrega en la v0.2. Conocer esos comandos es la principal fuente de ventaja inicial entre participantes; registrarlo permite analizarla en lugar de sufrirla (sección 15).

---

## 6. Modalidad y entorno

### Modalidad

- **Sesión remota supervisada** por videollamada, con pantalla compartida.
- **Grabación** de pantalla y audio, con consentimiento.
- La **prueba piloto** puede realizarse de forma presencial.

### Entorno técnico

| Elemento | Definición |
|---|---|
| Sistema | Máquina virtual con Ubuntu `[ ] definir versión` |
| Herramienta | OpenCode 1.18.25, instalada y congelada |
| Usuario | `participante`, sin permisos de administrador y sin configuración previa de OpenCode. El supervisor usa su propia cuenta para cambiar de caso |
| Casos | Cada caso con su propio directorio de proyecto, su configuración global y, cuando corresponde, sus variables de entorno |
| Restauración | Instantánea de la máquina virtual restaurada antes de cada participante |
| Acceso del participante | Control remoto de la máquina virtual durante la videollamada `[ ] definir herramienta` |
| Red | La VM no alcanza internet: sólo el canal de control remoto `[CONFIRMAR mecanismo]` |

> **Nunca se usa la máquina personal del autor.** Su configuración global de OpenCode se sumaría a la del escenario y la respuesta dejaría de ser conocida por construcción.

### 6.1 Aislamiento de red y control remoto

Los dos requisitos —VM sin internet y participante operando la VM a distancia— conviven si el aislamiento se aplica al **tráfico saliente** de la VM y no a su conectividad completa. Dos alternativas:

| Alternativa | Cómo se logra el aislamiento | Costo |
|---|---|---|
| **A. VM con escritorio remoto y firewall saliente** | La VM acepta la conexión del escritorio remoto y bloquea todo el resto del tráfico saliente | Hay que configurar y verificar reglas de firewall |
| **B. Control remoto de la pantalla compartida del anfitrión** | La VM corre sin interfaz de red; el participante controla el escritorio del anfitrión mediante la función de control remoto de la videollamada | No requiere configurar red, pero depende de la herramienta de videollamada |

`[CONFIRMAR]` La alternativa **B** es la más simple y la más fácil de verificar ante un tribunal: la VM no tiene red, punto. Se recomienda B, con A como respaldo si la herramienta de videollamada no ofrece control remoto estable.

**Verificación previa a cada sesión:** se ejecuta una prueba de conectividad dentro de la VM y se registra su resultado en el guion de la sesión.

### 6.2 Latencia del control remoto

Operar la VM a distancia agrega demora entre la acción del participante y lo que ve en pantalla. Esa demora:

- **No afecta la comparación** línea base–noviembre ni la comparación entre condiciones, porque está presente en todas las mediciones por igual.
- **Sí infla los tiempos absolutos**, que son los que se informan en el I.3 y los que alimentan la valoración económica de la sección 17.

Tratamiento: se declara como limitación; en la prueba piloto se cronometra una tarea trivial de referencia (abrir un archivo conocido y leer una línea) de forma local y de forma remota, y la diferencia se informa como cota del sesgo. `[CONFIRMAR]`

---

## 7. Recursos disponibles durante la sesión

### Permitidos

- Explorador de archivos.
- Editor de texto.
- Terminal, **con todos los comandos nativos de OpenCode**, incluidos `opencode --help`, `opencode debug config`, `opencode debug agent <nombre>`, `opencode debug skill` y el resto de los subcomandos de `debug`.
- **El manual embebido de la herramienta** (skill `customize-opencode`), accesible con `opencode debug skill` (ver 7.3).
- **Hoja única de referencia** (ver 7.1).
- **Documentación oficial de OpenCode 1.18.25 en HTML, en inglés, sin conexión** (ver 7.2).

### No permitidos

- Búsqueda en internet.
- Consultas a cualquier asistente de inteligencia artificial, incluido el propio agente de OpenCode.

**Motivos para excluir internet:** los buscadores integran respuestas generadas por IA; la documentación en línea no corresponde a la versión 1.18.25; la eficacia de búsqueda introduce variabilidad ajena a la tarea; y el contenido de internet cambia entre la línea base y noviembre.

### 7.1 Hoja única de referencia

Documento de una sola página, disponible durante toda la sesión e idéntico en ambas mediciones.

**Regla de contenido (revisada en la v0.2):** la hoja contiene únicamente **información que la propia herramienta expone**, sea en su documentación oficial de la 1.18.25 o en la salida de sus comandos de ayuda (`--help`). Se presenta como referencia, no como explicación.

| Incluye | No incluye |
|---|---|
| Ubicación de las fuentes de configuración y el orden de precedencia **tal como lo documenta** la 1.18.25 | El orden real de fusión que no figura en la documentación |
| Lista de comandos de introspección y qué muestra cada uno, **incluida la existencia del manual embebido y cómo abrirlo** | Qué **no** muestra cada comando |
| Dónde se declaran agentes, permisos, comandos y skills | Cómo se combinan en la práctica reglas de fuentes distintas |
| Valores posibles de un permiso: `allow`, `ask`, `deny` | El efecto del orden de las claves |
| — | Reglas nativas que no figuren en la documentación |
| — | Ejemplos parecidos a los casos del instrumento |

**Por qué se relajó la regla anterior.** La v0.1 limitaba la hoja a lo documentado. El problema es que `opencode debug agent` **no está documentado** en el tag 1.18.25 —`cli.mdx` describe `debug` como "debugging and troubleshooting tools" sin listar subcomandos, y `debug config` sólo aparece de pasada en la sección de configuración administrada por MDM `[VERIFICADO]`—, pero cualquiera lo descubre escribiendo `opencode debug --help`. Mantener la regla original habría dejado la ventaja en manos del azar: quien tipeara `--help` resolvía varios casos en segundos y quien no, no. Igualar el acceso a los comandos elimina esa varianza y traslada la dificultad a donde el instrumento quiere medirla: la procedencia.

Hoja redactada en `vm/hoja-referencia.md`: cada línea proviene de `config.mdx`, `agents.mdx`, `permissions.mdx` o de la salida de `--help`.

### 7.2 Documentación sin conexión

| Aspecto | Definición |
|---|---|
| Origen | Tag `v1.18.25` del repositorio `anomalyco/opencode`, carpeta `packages/web/src/content/docs` |
| Contenido | Las **36 páginas** `.mdx` en inglés, sin selección, para evitar que el recorte influya en los resultados `[VERIFICADO]` |
| Formato | HTML estático con índice, enlaces entre páginas y búsqueda con Ctrl+F |
| Idioma | Inglés. La traducción al español del tag está incompleta (34 páginas) y puede estar desactualizada `[VERIFICADO]` |
| Uso | Se abre en el navegador de la máquina virtual, sin conexión |

> **Corrección respecto de la v0.1:** el documento anterior consignaba 53 páginas en inglés. El conteo real sobre el tag es de 36 archivos `.mdx` en el nivel raíz de esa carpeta. El número corregido es el que va al anexo.

**Procedimiento de generación** — implementado en `herramientas/generar-docs-offline.py`, que se incluye en el Anexo para que sea reproducible:

1. Descargar el tag `v1.18.25`.
2. Tomar los archivos `.mdx` en inglés de `packages/web/src/content/docs`.
3. Convertirlos a HTML, eliminando los componentes MDX sin alterar el texto.
4. Reescribir los enlaces internos para que apunten a los archivos locales.
5. Generar una página índice.
6. Registrar la fecha de generación y el hash del commit del tag.

Paquete generado en `vm/docs/` (36 páginas, commit `cb7d8b2f5e44`); `instalar.sh` lo copia al home del participante.

### 7.3 Manual embebido

| Aspecto | Definición |
|---|---|
| Qué es | Skill interna `customize-opencode`, que forma parte de la instalación de la 1.18.25 |
| Cómo se accede | `opencode debug skill` |
| Contenido relevante | Modelo de fusión entre fuentes, orden de inserción, criterio de última coincidencia, rechazo de claves desconocidas |
| Tratamiento | Se permite, se nombra en la hoja de referencia y se trata como parte de la documentación oficial disponible |

**Por qué se permite y se nombra.** Es documentación de la propia herramienta, exacta para la versión instalada y disponible sin conexión: quitarla sería alterar la herramienta. Y por el mismo argumento de D-12', no nombrarla en la hoja dejaría la ventaja librada a quién la descubra. Se prefiere que todos sepan que existe, y medir si aun así la procedencia sigue siendo difícil de determinar (sección 15).

---

## 8. Condiciones y casos

### 8.1 Condiciones

| Condición | Qué se consulta | Mecanismo de la 1.18.25 sobre el que se construye |
|---|---|---|
| **C-1 · Control** | Valor o decisión declarados en una sola fuente, sin conflicto | Lectura directa |
| **C-2 · Fusión entre fuentes** | Valor que resulta de combinar más de una fuente | Fusión profunda y orden de precedencia entre fuentes |
| **C-3 · Implícito** | Valor o decisión que no está escrito en ningún archivo de configuración | Sustitución de variables y reglas nativas de agente |
| **C-4 · Permisos combinados** | Decisión de permiso con reglas del usuario en fuentes distintas | Concatenación de reglas, última coincidencia y orden de claves |

**Ocho casos: dos por condición** (C-1a, C-1b, C-2a, …, C-4b).

Las cuatro condiciones se mantienen respecto de la v0.1. Lo que cambió es el mecanismo concreto sobre el que se construye cada una, ahora verificado.

### 8.2 Criterios de construcción

1. **Derivación:** cada caso se construye sobre un mecanismo documentado en el relevamiento técnico (Anexo I), no sobre lo que la plataforma resuelve bien. Controla el sesgo del diseñador.
2. **Verificación obligatoria en ejecución:** la respuesta de cada caso se comprueba ejecutando OpenCode 1.18.25 en la máquina virtual. Ningún caso entra al instrumento sin esa verificación registrada, con comando, salida y fecha. **Leer el código no alcanza:** el tag contiene dos motores de permisos y sólo uno se ejecuta (3.5-c).
3. **Ningún comando nativo da la respuesta completa.** Criterio nuevo en la v0.2: para cada caso debe dejarse asentado en la ficha qué muestra `debug config`, qué muestra `debug agent`, qué dice el manual embebido y qué parte de la respuesta sigue faltando después de consultarlos. Si un comando resuelve valor **y** fuente, el caso se descarta.
4. **Distractores:** cada caso incluye al menos un elemento plausible que no determina la respuesta (una fuente que no aplica, una declaración similar en otro agente, un archivo con nombre parecido).
5. **Comandos simples:** los casos de permisos sobre terminal usan comandos sin tuberías ni encadenamientos.
6. **Equivalencia dentro de cada condición:** los dos casos de una misma condición tienen la misma cantidad de fuentes involucradas y de distractores.
7. **Documentado, no documentado o documentado de forma incorrecta:** cada caso registra si su respuesta puede encontrarse leyendo la documentación —páginas web **o** manual embebido—, si sólo surge del comportamiento de la herramienta, o si la documentación dice otra cosa que el comportamiento. Permite analizar si la documentación alcanza, y si induce a error.
8. **Respaldo externo cuando exista:** se prefieren los mecanismos que además aparecen reportados por usuarios reales en el repositorio (Anexo I, A.I.6). Un caso con issue asociado es evidencia de que el problema ocurre fuera del laboratorio.
9. **Nada se repite entre casos:** ningún valor de respuesta, valor de distractor, comando ni texto de pregunta aparece en más de un caso. Repetir el agente consultado (`build`) está permitido, porque no es parte de la respuesta. Lo único que puede transferirse de un caso a otro es el razonamiento, nunca la respuesta. Excepciones inevitables y declaradas: los efectos de permiso (`allow`, `ask`, `deny`), que son un conjunto cerrado, y las reglas de C-4a y C-4b, cuya identidad es deliberada (8.3).

### 8.3 Los ocho casos

Todos los escenarios de esta sección fueron ejecutados sobre OpenCode 1.18.25 real y las respuestas indicadas son la salida observada. C-3b, C-4a y C-4b están confirmados además en ejecución con un agente real `[EJECUCIÓN]`. Todos deben reverificarse en la VM de Ubuntu para el anexo. `[REVERIFICAR EN VM]`

---

#### C-1a · Control — valor declarado en una sola fuente

| | |
|---|---|
| **Pregunta** | "¿Con qué modelo corre el agente `build` en este proyecto, y qué archivo lo determina?" |
| **Global** `~/.config/opencode/opencode.json` | `{ "model": "anthropic/claude-sonnet-4-5" }` |
| **Proyecto** `opencode.json` | `{ "agent": { "build": { "model": "openai/gpt-5-mini" } } }` |
| **Respuesta correcta** | `openai/gpt-5-mini` · `opencode.json` del proyecto |
| **Distractor** | El `model` de nivel superior del global, que es el modelo por defecto pero no el del agente |
| **Qué da `debug config`** | El valor, dentro de `agent.build.model`. No la fuente |
| **Documentada** | Sí |

---

#### C-1b · Control — decisión de permiso declarada en una sola fuente

| | |
|---|---|
| **Pregunta** | "Si el agente `build` usa la herramienta `webfetch`, ¿qué ocurre, y qué archivo lo determina?" |
| **Global** `~/.config/opencode/opencode.json` | `{ "permission": { "webfetch": "allow" } }` |
| **Proyecto** `opencode.json` | `{ "agent": { "plan": { "permission": { "webfetch": "deny" } } } }` |
| **Respuesta correcta** | `allow` · configuración global |
| **Distractor** | La regla `deny`, declarada para **otro** agente |
| **Qué da `debug agent build`** | La regla efectiva. No de dónde viene ni que la del proyecto es de otro agente |
| **Documentada** | Sí |

> C-1a y C-1b son el ancla del instrumento: uno de valor y uno de permiso, ambos de lectura directa. Su mediana es la referencia del criterio de éxito secundario (sección 16).

---

#### C-2a · Fusión — el objeto efectivo no existe en ningún archivo

| | |
|---|---|
| **Pregunta** | "¿Con qué modelo y con qué temperatura corre el agente `build`, y de qué archivo sale cada uno de los dos valores?" |
| **Global** | `{ "agent": { "build": { "model": "anthropic/claude-opus-4-1", "temperature": 0.1 } } }` |
| **Proyecto** `opencode.json` | `{ "model": "openai/gpt-5", "agent": { "build": { "temperature": 0.7 } } }` |
| **Respuesta correcta** | modelo `anthropic/claude-opus-4-1` · **global** · y temperatura `0.7` · **proyecto** |
| **Distractor** | El `model` de nivel superior del proyecto (`openai/gpt-5`), que no aplica al agente |
| **Qué da `debug config`** | El objeto `agent.build` ya combinado, que no figura así en ningún archivo. No dice qué mitad viene de dónde |
| **Documentada** | Parcialmente: la documentación menciona que la configuración se fusiona, no el resultado por clave |
| **Evidencia** | Ejecutado: `agent.build` resultante = `{ model: "anthropic/claude-opus-4-1", temperature: 0.7 }` |

---

#### C-2b · Fusión — precedencia invertida entre `opencode.json` y `.opencode/`

| | |
|---|---|
| **Pregunta** | "Trabajando desde `sub/`, ¿con qué modelo corre el agente `docs`, y qué archivo lo determina?" |
| **Archivos** | `.opencode/opencode.json` (raíz): `{"agent":{"docs":{"model":"deepseek/deepseek-chat"}}}` · `sub/.opencode/opencode.json`: `{"agent":{"docs":{"model":"mistral/mistral-large-latest"}}}` · sin configuración global |
| **Distractor estructural** | En paralelo, `opencode.json` (raíz: `xai/grok-3`) y `sub/opencode.json` (`groq/llama-3.3-70b-versatile`) declaran el agente `notas`, donde **sí** gana el más cercano |
| **Respuesta correcta** | `deepseek/deepseek-chat` · `.opencode/opencode.json` de la **raíz** del proyecto |
| **Qué da `debug config`** | El valor. Nada que explique por qué ganó el archivo más lejano |
| **Documentada** | **No.** La documentación no describe esta inversión |
| **Respaldo externo** | Issues #21307 y #45266 del repositorio (Anexo I, A.I.6): dos usuarios distintos reportaron exactamente este comportamiento |
| **Evidencia** | Ejecutado desde `sub/`, con el escenario armado por `caso.sh` (repositorio con commit): `agent.docs.model = "deepseek/deepseek-chat"` (ganó el lejano) y `agent.notas.model = "groq/llama-3.3-70b-versatile"` (ganó el cercano) |

---

#### C-3a · Implícito — el valor viene de una variable de entorno

| | |
|---|---|
| **Pregunta** | "¿Qué modelo usa el agente `plan`, y de dónde sale ese valor?" |
| **Global** | `{ "agent": { "plan": { "model": "{env:OC_MODELO}" } } }` |
| **Entorno de la VM** | `OC_MODELO=google/gemini-2.5-pro`, exportada en el perfil del usuario |
| **Proyecto** `opencode.json` | `{ "model": "anthropic/claude-haiku-4-5" }` (distractor) |
| **Respuesta correcta** | `google/gemini-2.5-pro` · la variable de entorno `OC_MODELO`, referenciada desde el global |
| **Qué da `debug config`** | El valor ya sustituido. El archivo muestra la referencia pero no el valor; el comando muestra el valor pero no la referencia. **Ninguna fuente muestra las dos cosas** |
| **Documentada** | Sí, la sustitución `{env:...}` está documentada |

---

#### C-3b · Implícito — la decisión viene de una regla nativa no declarada

| | |
|---|---|
| **Pregunta** | "Si el agente `build` intenta leer el archivo `.env` del proyecto, ¿qué ocurre, y qué regla lo determina?" |
| **Global** | `{ "permission": { "read": { "src/*": "allow" } } }` (distractor: no alcanza a `.env`) |
| **Proyecto** `opencode.json` | Sin reglas de `read` |
| **Respuesta correcta** | `ask` · una regla nativa del agente, que no está declarada en ningún archivo de configuración |
| **Qué da `debug agent build`** | La regla `read` / `*.env` → `ask` aparece en la lista, pero **sin indicar que es nativa**: el participante no puede distinguirla de una regla escrita por alguien |
| **Documentada** | **Sí, pero de forma incorrecta.** `permissions.mdx` afirma que los `.env` se **deniegan** por defecto (`"*.env": "deny"`). El comportamiento real es `ask`: así lo definen el código fuente (`packages/opencode/src/agent/agent.ts:132`) y el ruleset compilado. Un participante que confíe en la documentación responde `deny` y yerra el valor |
| **Evidencia** | Ruleset compilado de `build`: `read *.env → ask` y `read *.env.example → allow` sin ninguna declaración del usuario. En ejecución `[EJECUCIÓN]`: `.env` y `.env.local` rechazados, `.env.example` y `notes.txt` permitidos (E-04) |

---

#### C-4a · Permisos combinados — gana la última coincidencia

| | |
|---|---|
| **Pregunta** | "Si el agente `build` ejecuta `git status`, ¿qué ocurre, y qué regla lo decide?" |
| **Global** | `{ "permission": { "bash": { "*": "ask", "git *": "allow" } } }` |
| **Proyecto** `opencode.json` | `{ "permission": { "bash": { "*": "deny" } } }` |
| **Respuesta correcta** | `allow` · la regla `git *` de la configuración **global** |
| **Distractor** | El `"*": "deny"` del proyecto, que parece bloquear todo |
| **Qué da `debug config`** | El objeto fusionado `{"*":"deny","git *":"allow"}`, que no está en ningún archivo. No dice cuál de las dos reglas decide |
| **Documentada** | **Sí**, en las páginas web (`permissions.mdx`: gana la última regla que coincide, y conviene poner la `*` primero) y en el manual embebido |
| **Evidencia** | Ruleset `[bash * → deny, bash git * → allow]`; el motor v2 toma la **última** coincidencia (`findLast` en `packages/core/src/permission.ts`) → `allow`. En ejecución `[EJECUCIÓN]`: `git status` se ejecutó (E-01) |

---

#### C-4b · Permisos combinados — mismo contenido, orden de claves invertido

| | |
|---|---|
| **Pregunta** | "Si el agente `build` ejecuta `git diff`, ¿qué ocurre, y qué regla lo decide?" — misma estructura que C-4a, con otro comando para que no pueda reconocerse la pregunta |
| **Global** | `{ "permission": { "bash": { "git *": "allow", "*": "ask" } } }` ← **mismas dos reglas que C-4a, escritas al revés** |
| **Proyecto** `opencode.json` | `{ "permission": { "bash": { "*": "deny" } } }` |
| **Respuesta correcta** | `deny` · la regla `*` del **proyecto** |
| **Distractor** | La regla `git *` → `allow`, que en C-4a sí decidía |
| **Documentada** | **No.** El manual embebido explica el orden dentro de un objeto, pero no que al fusionar dos archivos la posición de la clave la fija el primero |
| **Evidencia** | Objeto fusionado `{"git *":"allow","*":"deny"}`, ruleset `[bash git * → allow, bash * → deny]` → última coincidencia `deny`. En ejecución `[EJECUCIÓN]`: `bash` no se le ofreció al modelo y el comando no corrió (E-02, ejecutado con `git status`). Como la última regla que coincide con `bash` es `*` → `deny`, la herramienta queda oculta y la respuesta es la misma para `git diff` o cualquier otro comando `[REVERIFICAR EN VM con git diff]` |

> **Por qué este par funciona como *a* y *b*.** Los dos casos tienen exactamente las mismas fuentes, las mismas dos claves y el mismo distractor: cumplen el criterio de equivalencia estructural (8.2-6). La diferencia que importa es el orden en que las claves están escritas en el archivo global, y el resultado es opuesto. El comando consultado cambia (`git status` en C-4a, `git diff` en C-4b) sólo para que la pregunta no pueda reconocerse de un caso al otro (8.2-9); los dos caen en las mismas reglas. Es la demostración más limpia de que la decisión no depende de la especificidad de la regla sino de su posición, y es justamente lo que la plataforma debe explicar. La posición de una clave en el objeto fusionado la fija **el primer archivo que la declara**; el valor lo fija **el último**. `[VERIFICADO]`

---

### 8.4 Caso de práctica

Mecanismo que no aparece en ningún caso del instrumento: lectura directa de una clave de nivel superior declarada sólo en el global (por ejemplo `small_model`). Su resultado no se registra. Sirve para que el participante ejercite el formato de respuesta "valor + fuente" y el protocolo de "listo".

### 8.5 Ficha de cada caso

```markdown
## Caso C-Xy

- Condición: C-X · [nombre]
- Mecanismo del Anexo I: [referencia al apartado del relevamiento técnico]
- Pregunta (texto exacto que se lee y se muestra): "…"
- Tipo de respuesta: valor + fuente | decisión + regla
- Archivos y entorno del escenario: [ruta y contenido íntegro de cada archivo; variables de entorno]
- Distractores: [lista y por qué no aplican]
- Respuesta correcta: [valor/decisión] · [fuente/regla]
- Variantes aceptables: [formas equivalentes de nombrar la fuente]
- Qué muestra `opencode debug config`: […]
- Qué muestra `opencode debug agent <nombre>`: […]
- Qué dice el manual embebido (`opencode debug skill`): […]
- Qué falta después de ejecutarlos: […]          ← criterio 8.2-3
- Respuesta documentada: sí | no · [página web o sección del manual embebido, si corresponde]
- Respaldo externo: [issue del repositorio, si corresponde]
- Verificación en OpenCode 1.18.25: [comando ejecutado, salida capturada, fecha, entorno]
- Observaciones del piloto: […]
```

---

## 9. Forma única y control del aprendizaje

### Decisión

Se utiliza **una única forma (A)**, con los mismos ocho casos en la línea base y en la medición final.

**Motivos:**

- Entre ambas mediciones transcurren aproximadamente dos meses.
- En noviembre el participante utiliza la plataforma, lo que modifica la forma de resolver.
- Con los mismos casos, la única diferencia entre mediciones es la plataforma; se elimina el riesgo de que dos formas no sean equivalentes.

**Alternativa descartada:** dos formas paralelas (A y B). Evita el recuerdo de casos, pero introduce el riesgo de diferencias de dificultad entre formas, crítico con muestras pequeñas.

### Riesgo residual

No es el recuerdo de respuestas, sino el **aprendizaje**: recordar qué tipo de dificultad había, o haber aprendido sobre OpenCode entre sesiones.

### Mitigaciones

| Medida | Momento |
|---|---|
| No se informan las respuestas correctas ni los aciertos al finalizar | Línea base |
| Se pide a los participantes no comentar los casos con otras personas | Línea base |
| Pregunta de control antes de cada caso: "¿Recordás este caso o su respuesta?" | Noviembre |
| Mismos recursos en ambas mediciones, más la plataforma en noviembre | Ambas |

---

## 10. Orden de presentación de los casos

El orden se contrabalancea para que el aprendizaje o la fatiga no se confundan con la dificultad de la condición.

**Corrección respecto de la v0.1.** Las cuatro secuencias anteriores rotaban las condiciones pero dejaban siempre los casos *a* en las posiciones 1 a 4 y los *b* en las posiciones 5 a 8. Con ese esquema, la comparación *a* frente a *b* prevista en el plan de análisis quedaba confundida con la mitad de la sesión: si *b* salía más rápido no era posible saber si era más fácil o si el participante ya había aprendido. Se pasa a **ocho secuencias**: las cuatro originales y sus espejos con el bloque *b* primero.

| Secuencia | Orden de los casos |
|---|---|
| **S1** | C-1a · C-2a · C-3a · C-4a · C-1b · C-2b · C-3b · C-4b |
| **S2** | C-2a · C-3a · C-4a · C-1a · C-2b · C-3b · C-4b · C-1b |
| **S3** | C-3a · C-4a · C-1a · C-2a · C-3b · C-4b · C-1b · C-2b |
| **S4** | C-4a · C-1a · C-2a · C-3a · C-4b · C-1b · C-2b · C-3b |
| **S5** | C-1b · C-2b · C-3b · C-4b · C-1a · C-2a · C-3a · C-4a |
| **S6** | C-2b · C-3b · C-4b · C-1b · C-2a · C-3a · C-4a · C-1a |
| **S7** | C-3b · C-4b · C-1b · C-2b · C-3a · C-4a · C-1a · C-2a |
| **S8** | C-4b · C-1b · C-2b · C-3b · C-4a · C-1a · C-2a · C-3a |

Asignación en rotación: P01 → S1, P02 → S2, … , P08 → S8, P09 → S1, P10 → S2.

Propiedades: cada condición aparece una vez en cada posición dentro de su bloque; los dos casos de una misma condición nunca son consecutivos; y con diez participantes cada variante *a*/*b* ocupa el primer bloque en aproximadamente la mitad de las sesiones.

En noviembre, cada participante recibe **la misma secuencia** que en la línea base.

---

## 11. Procedimiento de la sesión

| Paso | Actividad | Duración aprox. |
|---|---|---|
| 1 | Bienvenida, explicación del propósito y consentimiento informado | 3 min |
| 2 | Cuestionario previo | 2 min |
| 3 | Lectura de la hoja de referencia y caso de práctica | 5 min |
| 4 | Ocho casos en la secuencia asignada (máximo 180 s cada uno) | 8–24 min |
| 5 | Cierre y agradecimiento | 2 min |
| | **Total** | **20–36 min** |

### Detalles

- **Mensaje inicial obligatorio:** se mide la dificultad de la tarea, no la habilidad del participante.
- **Antes del caso de práctica** el supervisor verifica, con una prueba de conectividad registrada, que la VM no alcanza internet.
- **Caso de práctica:** usa un mecanismo que no aparece en los casos del instrumento; su resultado no se registra.
- **Entre casos** el supervisor restaura el escenario correspondiente al caso siguiente; ese tiempo no se cronometra.
- **Durante los casos**, el supervisor no ayuda. Sólo resuelve problemas técnicos de acceso, y cada intervención se registra.
- **Pausas:** no se permiten entre casos, salvo interrupción técnica, que se registra.
- Se sigue un **guion escrito** idéntico en todas las sesiones. `[ ] Redactar guion.`

---

## 12. Protocolo de cronometraje y respuesta

| Momento | Regla |
|---|---|
| **Presentación** | El supervisor lee la pregunta en voz alta. La pregunta queda escrita en pantalla durante todo el caso |
| **Inicio del tiempo** | Al terminar de leer la pregunta |
| **Fin del tiempo** | Cuando el participante dice **"listo"**, o al llegar a **180 segundos** |
| **Después de "listo"** | El participante suelta mouse y teclado, no vuelve a los archivos y da su respuesta |
| **Contenido de la respuesta** | Valor y fuente, o decisión y regla, según el caso |
| **Autocorrección** | Cuenta la primera respuesta completa |
| **Tiempo agotado** | Se cierra el caso, se registra como error con tiempo censurado en 180 s y no se solicita respuesta |
| **Instrumento de medición** | Cronómetro manual del supervisor |
| **Respaldo** | La grabación permite revisar tiempos y respuestas dudosas |

**Imprecisión declarada:** el cronometraje manual introduce un error inferior a un segundo, despreciable frente a los tiempos esperados. Se revisan en las grabaciones **el 20 % de las respuestas, seleccionadas al azar, y la totalidad de las clasificadas como dudosas** `[CONFIRMAR]`, para confirmar la consistencia entre el tiempo anotado y el observado.

**Sobre el límite de 180 s.** Se mantiene el valor de la v0.1. La prueba piloto es la única instancia en la que puede modificarse: si más de la mitad de los casos de una condición llega al límite, se eleva a 300 s. Una vez iniciada la primera sesión de la línea base el límite queda congelado, y noviembre usa el mismo.

---

## 13. Criterios de corrección

### Hoja de respuestas

- Se redacta y verifica **antes de la primera sesión**.
- Contiene, para cada caso, la respuesta correcta verificada en OpenCode y las variantes aceptables.
- No se modifica después de iniciada la medición. Si un caso resulta ambiguo, se registra y se analiza por separado, sin reinterpretar respuestas.

### Definiciones

| Resultado | Condición |
|---|---|
| **Correcta** | El valor o la decisión coinciden **y** la fuente o la regla coinciden |
| **Acierto parcial** | Valor o decisión correctos con fuente o regla incorrectas. **Cuenta como error** y se registra aparte |
| **Incorrecta** | Valor o decisión incorrectos |
| **Tiempo agotado** | No responde en 180 s. **Cuenta como error** |

Se anota siempre la **respuesta textual** del participante, además de la clasificación.

### Variantes aceptables de la fuente

La hoja de respuestas define, para cada caso, qué formas de nombrar la fuente se aceptan. Criterio general: se acepta cualquier expresión que **identifique unívocamente** el archivo, la variable o el carácter nativo de la regla.

| Caso | Se acepta | No se acepta |
|---|---|---|
| C-2b | "el `.opencode` de la raíz", "el de arriba", la ruta completa | "el `.opencode`" a secas — hay dos |
| C-3a | "la variable de entorno", "`OC_MODELO`" | "el global" — ahí está la referencia, no el valor |
| C-3b | "es una regla nativa", "viene de OpenCode", "no está declarada" | "el global" |
| C-4a / C-4b | Identificar la regla **y** el archivo donde está escrita | Sólo "por el orden" |

---

## 14. Variables y registro de datos

### Planilla de respuestas

Una fila por respuesta, en Excel `[ ] crear plantilla`.

| Columna | Descripción |
|---|---|
| `participante` | Código (P01, P02, …) |
| `medicion` | `LB` (línea base) o `FIN` (noviembre) |
| `secuencia` | S1 a S8 |
| `orden` | Posición del caso en la sesión (1 a 8) |
| `caso` | C-1a a C-4b |
| `condicion` | C-1 a C-4 |
| `variante` | `a` o `b` |
| `bloque` | 1 si el caso cayó en las posiciones 1–4; 2 si cayó en 5–8 |
| `tiempo_s` | Segundos cronometrados |
| `censurado` | 1 si llegó a 180 s; 0 en otro caso |
| `respuesta_textual` | Lo que dijo el participante |
| `valor_ok` | 1 / 0 |
| `fuente_ok` | 1 / 0 |
| `correcta` | 1 / 0 |
| `parcial` | 1 si valor o decisión correctos con fuente o regla incorrectas |
| `comandos_usados` | Lista: `debug config`, `debug agent`, `debug skill`, `--help`, `otros`, `ninguno` (surge de la grabación) |
| `uso_documentacion` | 1 / 0 |
| `uso_hoja` | 1 / 0 |
| `archivos_abiertos` | Cantidad de archivos distintos (surge de la grabación) |
| `recuerda_caso` | Sólo en `FIN`: 1 / 0 |
| `intervencion` | Descripción de cualquier intervención técnica |
| `observaciones` | Notas libres |

> `comandos_usados` reemplaza al `uso_debug_config` de la v0.1. Con los comandos de introspección permitidos, saber **cuál** usó cada participante es necesario para interpretar el tiempo: no es lo mismo tardar 90 s explorando archivos que tardar 90 s después de haber resuelto el valor en 10 s con un comando.

### Planilla de participantes (separada)

`participante · experiencia_anios · herramientas · frecuencia · uso_opencode · configuro_permisos · conocia_comandos · secuencia · fecha_LB · fecha_FIN · es_referente`

Los datos identificatorios (nombre, contacto, consentimiento firmado) se guardan **en un archivo separado**, fuera de las planillas de análisis.

---

## 15. Plan de análisis

### Unidad de análisis

La **respuesta**, declarando que las respuestas de un mismo participante no son independientes. Como control se informa también la tasa de error por participante.

### Por condición

| Medida | Método |
|---|---|
| Tiempo | Mediana y rango intercuartílico. Válida si las observaciones censuradas no superan la mitad de la condición; en caso contrario se informa "mediana superior a 180 s" |
| Tasa de error | Proporción de respuestas no correctas, con intervalo de confianza del 95 % (Clopper-Pearson) |
| Aciertos parciales | Proporción sobre el total de respuestas, y desagregada: valor correcto con fuente incorrecta frente a lo inverso |
| Recursos utilizados | Proporción de uso de cada comando, de la documentación y de la hoja; mediana de archivos abiertos |

### Comparaciones descriptivas

- C-1 frente a C-2, C-3 y C-4.
- Casos con respuesta documentada frente a no documentada.
- Participantes con y sin experiencia previa en OpenCode.
- Participantes que declararon conocer los comandos de introspección frente a los que no.
- **C-4a frente a C-4b.** Son estructuralmente idénticos, pero C-4a está documentado en el manual embebido y C-4b no. La diferencia entre ambos, y si los participantes que abrieron el manual resuelven C-4a y aun así fallan C-4b, mide directamente cuánto alcanza la documentación de la herramienta.
- Caso *a* frente a caso *b* dentro de cada condición, **informando el bloque en que cayó cada uno** (control de equivalencia, ahora interpretable gracias a las ocho secuencias).

### Análisis específico del aporte de la fuente

Se informa por separado la proporción de respuestas con **valor correcto y fuente incorrecta**. Es la medida directa de la brecha que los comandos nativos no cubren y que la plataforma promete cerrar; sostiene el argumento del I.3 mejor que la tasa de error agregada.

**Lectura prevista.** Si con los comandos de introspección y el manual embebido disponibles los participantes aciertan el valor pero fallan la fuente, el argumento de la plataforma queda más fuerte, no más débil: la herramienta ofrece todo lo que tiene y aun así la procedencia no se resuelve.

### Presentación

- Tabla de resultados por condición.
- Diagrama de caja del tiempo por condición.
- Gráfico de barras de la tasa de error por condición con intervalos.
- Barra apilada de tipo de acierto por condición (correcta / valor sin fuente / incorrecta / tiempo agotado).

---

## 16. Criterio de éxito derivado

**Revisión respecto de la v0.1.** El criterio anterior —"la mediana de C-2 a C-4 con la plataforma no supera la mediana de C-1 de la línea base"— tiene dos problemas. Es un blanco fijo derivado de un estadístico de veinte observaciones: si la mediana de C-1 sale muy baja, el criterio se vuelve inalcanzable por una propiedad del instrumento y no del producto. Y no aprovecha el diseño pareado, que es la mayor fortaleza del estudio. Se propone un criterio principal pareado y el ancla en C-1 como meta secundaria.

### Criterio principal (pareado) `[CONFIRMAR]`

Sobre los participantes con ambas mediciones, considerando en conjunto las condiciones C-2, C-3 y C-4:

| Indicador | Meta con la plataforma |
|---|---|
| **Error** | En al menos dos tercios de los participantes pareados, la cantidad de respuestas correctas en C-2 a C-4 aumenta respecto de su propia línea base, y en ninguno disminuye |
| **Tiempo** | La mediana pareada de las diferencias de tiempo en C-2 a C-4 es negativa (la plataforma no es más lenta) |

Cada participante se compara consigo mismo, con la misma secuencia y los mismos casos, de modo que la única diferencia es la disponibilidad de la plataforma.

### Criterio secundario (ancla en la condición de control)

| Indicador | Meta con la plataforma |
|---|---|
| **Tiempo** | La mediana de C-2 a C-4 no supera la mediana de C-1 de la línea base |
| **Error** | La tasa de error de C-2 a C-4 no supera la tasa de error de C-1 de la línea base |

Expresa la meta de fondo: que averiguar un valor que depende de varias fuentes cueste lo mismo que leer uno declarado en una sola. Se informa siempre, se alcance o no.

### Regla de prevalencia (declarada en el I.2.3)

Si ambos indicadores divergen, **prevalece la tasa de error**, siempre que el tiempo no empeore respecto de la línea base.

### Justificación de los indicadores

- La **tasa de error** captura la consecuencia de seguridad: una respuesta errónea sobre permisos implica un agente operando con permisos que el desarrollador desconoce. El caso C-4b del instrumento y el issue #37155 del Anexo I muestran que esto no es hipotético.
- El **tiempo** captura el costo operativo.
- Cada uno mide lo que el otro no: se puede responder rápido y mal, o bien y lento.

**Criterio adicional:** no se promete una tasa de error nula, porque con la muestra alcanzable no puede acreditarse.

---

## 17. Frecuencia, consecuencia y valoración económica

El experimento mide cuánto cuesta una consulta, pero no cada cuánto ocurre. Se complementa con:

| Componente | Fuente | Tipo de evidencia | Estado |
|---|---|---|---|
| Frecuencia declarada | Estimación del referente para su equipo, con período y método | Declarada | `[ ]` |
| Frecuencia revelada | Repositorios públicos con `opencode.json`: modificaciones de archivos de configuración por mes, vía API de GitHub | Revelada | `[ ]` |
| Consecuencia revelada | Issues del repositorio sobre permisos o configuración con comportamiento inesperado: **32 casos entre noviembre de 2025 y septiembre de 2026** | Revelada | Anexo I, A.I.6 |
| Costo horario | Referente de EMSA, con período y origen del dato | Declarada | `[ ]` |

### Valoración económica

```
Costo estimado = tiempo por consulta (línea base) × frecuencia × costo horario de referencia
```

- Cada factor lleva las tres preguntas: quién lo produjo, con qué método y para qué período.
- **El resultado se presenta como rango de sensibilidad, no como cifra única** `[CONFIRMAR]`. La frecuencia es el factor más débil de los tres: la declaración del referente proviene de una sola persona, y el conteo de modificaciones en repositorios públicos mide con qué frecuencia se *edita* la configuración, no con qué frecuencia alguien necesita *resolver* cuál rige. Se informan tres escenarios (frecuencia baja, declarada y alta) y se explicita que el factor limitante de la estimación es este.
- El tiempo que se usa en la fórmula es el de la línea base, con la salvedad de la latencia del control remoto (6.2).
- El costo horario del referente **no se confunde** con el costo de hora del Informe Grupal, que fundamenta la factibilidad de la solución.

---

## 18. Prueba piloto

| Aspecto | Definición |
|---|---|
| Participantes | 1 o 2 personas que no integran la muestra |
| Modalidad | Presencial o remota supervisada |
| Qué se evalúa | Claridad de preguntas y hoja; casos demasiado fáciles o que agotan el tiempo; equivalencia entre casos *a* y *b*; funcionamiento del acceso remoto, la grabación y el registro; duración real de la sesión; cota de la latencia del control remoto (6.2) |
| Decisión que habilita | Única instancia en que puede modificarse el límite de 180 s (sección 12) |
| Resultado | Ajustes al instrumento, registrados en la sección 24 y en la bitácora |
| Uso de los datos | No se incorporan a la línea base |

---

## 19. Medición final de noviembre

| Aspecto | Definición |
|---|---|
| Participantes | La mayoría de los participantes de la línea base; mínimo 8 |
| Casos | Los mismos ocho casos, en la misma secuencia de cada participante |
| Recursos | Los mismos de la línea base **más** la plataforma (versión funcional congelada) |
| Control de recuerdo | Pregunta antes de cada caso, registrada en `recuerda_caso` |
| Protocolo | Idéntico (cronometraje, respuesta, corrección) |
| Análisis principal | **Pareado**: sólo participantes con ambas mediciones, cada uno contra sí mismo |
| Análisis complementario | Línea base completa informada aparte |
| Referente | Resultado informado por separado, fuera del análisis pareado |
| Casos recordados | Analizados por separado |
| Si se pierden más de dos participantes | Se informa el análisis pareado con los que queden y se declara explícitamente el tamaño reducido; no se reemplazan por participantes nuevos, porque romperían el apareamiento `[CONFIRMAR]` |

---

## 20. Aspectos éticos y protección de datos

- **Consentimiento informado** con: propósito, duración, grabación, uso de los datos, anonimato, derecho a retirarse sin consecuencias y compromiso de una segunda sesión. `[ ] Redactar.`
- **Ley N.º 25.326:** datos mínimos; identificación por código; datos identificatorios separados de los de análisis.
- **Eliminación de las grabaciones:** dentro de los **30 días** posteriores a la verificación de los datos de cada medición `[CONFIRMAR]`. El plazo figura en el consentimiento.
- **Sin evaluación personal:** se comunica que se mide la dificultad de la tarea.
- **Sin devolución de resultados individuales** hasta finalizar la medición de noviembre, para no alterar la segunda medición. Al finalizar el estudio se ofrece compartir los resultados agregados.

---

## 21. Amenazas a la validez

| Amenaza | Tratamiento |
|---|---|
| Muestra pequeña y autoseleccionada | Estudio exploratorio declarado; descripción de la muestra |
| Participantes sin experiencia en OpenCode | Hoja de referencia y caso de práctica; análisis por experiencia |
| Conocimiento desigual de los comandos de introspección y del manual embebido | Comandos y manual nombrados en la hoja de referencia; se registra cuáles usó cada uno y se pregunta por su conocimiento previo |
| Escenario artificial | Casos sobre mecanismos verificados en la herramienta, tres de ellos confirmados con un agente real; cuatro de los ocho tienen issues reales asociados; distractores; recursos equivalentes a los reales |
| Sesgo del diseñador | Casos derivados del relevamiento del código fuente y del repositorio, no de lo que la plataforma resuelve bien |
| Aprendizaje o fatiga entre casos | Ocho secuencias contrabalanceadas, con rotación del bloque *a*/*b* |
| Aprendizaje entre mediciones (forma única) | Sin devolución de respuestas; pregunta de control de recuerdo |
| Uso de ayuda externa | Sesión supervisada; VM sin acceso a internet, verificado al inicio de cada sesión |
| **Latencia del control remoto** | Presente en ambas mediciones; se estima su cota en el piloto y se declara como limitación de los tiempos absolutos |
| Cronometraje manual | Reglas escritas de inicio y fin; revisión del 20 % de las respuestas en grabaciones |
| Un único investigador lee, cronometra y corrige | Hoja de respuestas cerrada antes de medir; respuesta textual registrada; grabaciones |
| Abandono en noviembre | Reclutamiento de 13 para 10; análisis pareado; regla explícita si se pierden más de dos |
| Referente con conocimiento previo de la plataforma | Línea base antes del v0; resultado de noviembre informado por separado |
| Restricción de IA respecto del uso real | Declarada como limitación |
| **Casos atados a una versión** | Todo el instrumento está congelado en 1.18.25; se declara que los mecanismos pueden cambiar en versiones posteriores, lo cual no afecta la comparación interna |

---

## 22. Ubicación de cada elemento en el informe

| Elemento | Ubicación |
|---|---|
| Síntesis del instrumento | I.3 (medición de la línea base) |
| Valores de línea base | I.3 (línea base) |
| Criterio de éxito | I.3 (criterio de éxito) y I.2.3 |
| Valoración económica | I.3 (consecuencia) |
| Diseño completo | II.2 |
| Datos en bruto | II.3 |
| Gráficos por condición | II.4 |
| Casos con respuesta verificada | Anexo `[ ]` |
| Hoja de referencia y documentación offline | Anexo `[ ]` |
| Consentimiento, cuestionario y guion | Anexo `[ ]` |
| Registro del piloto | Anexo `[ ]` |
| Relevamiento técnico de la herramienta | Anexo I, A.I.3 (ampliado con la guía técnica) |
| Issues del repositorio | Anexo I, A.I.6 |
| Registro de decisiones | Anexo III y bitácora |

---

## 23. Estructura de carpetas y artefactos a construir

La estructura se ordena por **dónde vive** cada cosa, no por tipo. La regla que la gobierna: **a la VM va sólo lo que el participante puede ver.** Ningún archivo con respuestas entra nunca a la máquina virtual.

```
linea-base/
├── diseno/                      ← este documento, la guía técnica y el informe del laboratorio
│
├── vm/                          ← lo único que se copia a Ubuntu. Sin respuestas.
│   ├── LEEME.md                 ← procedimiento de preparación, paso a paso
│   ├── instalar.sh              ← OpenCode 1.18.25 fijado + documentación + plantillas en /opt
│   ├── caso.sh                  ← activa un caso para el participante
│   ├── verificar.sh             ← captura la evidencia de los nueve casos
│   ├── casos/                   ← 8 escenarios + práctica + proyecto común
│   ├── docs/                    ← 36 páginas HTML (commit cb7d8b2f5e44)
│   └── hoja-referencia.md
│
├── sesion/                      ← lo que usa el supervisor. Nunca entra a la VM.
│   ├── casos-y-respuestas.md    ← las nueve fichas con respuesta y variantes aceptables
│   ├── guion.md                 ← incluye secuencias S1–S8 y cuestionario previo
│   ├── consentimiento.md
│   └── planilla.xlsx            ← respuestas y participantes en dos hojas
│
├── herramientas/
│   └── generar-docs-offline.py  ← genera vm/docs/ desde el tag, de forma reproducible
│
└── resultados/                  ← se llena después: verificaciones, piloto, datos, análisis
```

### Cómo se preserva el aislamiento dentro de la VM

| Riesgo | Tratamiento |
|---|---|
| El participante lee las plantillas de otros casos | `instalar.sh` las copia a `/opt/linea-base`, legible sólo por root; el participante no tiene sudo |
| Queda en la VM la carpeta desde la que se instaló | `instalar.sh` avisa que hay que borrarla; `verificar.sh` busca copias de plantillas en todo el disco y lo informa |
| La ruta o el nombre del proyecto delatan el caso | El proyecto es siempre `~/proyecto`, con el mismo contenido común |
| El historial de la terminal delata el caso | El supervisor antepone un espacio al comando; Ubuntu no lo guarda (`HISTCONTROL=ignoreboth` por defecto) |
| Restos del caso anterior | `caso.sh` borra configuración global, proyecto, datos de OpenCode y variables de entorno antes de armar el nuevo |
| OpenCode se actualiza solo | Binario instalado directamente y `OPENCODE_DISABLE_AUTOUPDATE=1` en `/etc/environment`, sin tocar ninguna configuración de caso |

### Repositorio público

`vm/casos/` y `sesion/` **no se suben al repositorio público hasta después de la medición de noviembre.** Un participante que encuentre el repositorio encontraría el instrumento y, en el caso de `sesion/`, las respuestas. Los datos identificatorios y los consentimientos firmados no se suben nunca.

---

## 24. Registro de decisiones

### Decisiones de la v0.1 que se mantienen

| # | Decisión | Alternativa descartada | Motivo |
|---|---|---|---|
| D-01 | Medición experimental con tareas controladas | Encuestas en comunidades | Mide conducta y no opinión; respuesta verificable |
| D-02 | Estudio exploratorio | Contraste de hipótesis | Tamaño de muestra alcanzable |
| D-03 | Población: usuarios de cualquier herramienta agéntica | Sólo usuarios de OpenCode | Escasez de usuarios de OpenCode; la dificultad trasciende a la herramienta |
| D-04 | Sesión remota supervisada | Remota no supervisada | Control sobre ayuda externa, interrupciones y experiencia declarada |
| D-05 | Sin videojuego | Instrumento gamificado | Cambiaría lo medido y rompería la comparación con noviembre |
| D-06 | Máquina virtual con instantánea | Máquina personal del autor | La configuración personal contaminaría la respuesta conocida |
| D-07 | Cuatro condiciones, dos casos cada una | Uno por condición; tres por condición | Uno confunde caso con condición; tres alarga la sesión |
| D-08 | Límite de 180 s por caso | 300 s | Sesión de duración razonable para voluntarios |
| D-09 | Forma única A | Formas paralelas A y B | Dos meses entre mediciones; evita diferencias de dificultad entre formas |
| D-10 | Sin consultas a IA | Permitir el agente de OpenCode | Se mediría al modelo y no al desarrollador |
| D-11 | Sin internet en la VM | Acceso libre a internet | IA en buscadores, documentación de otra versión, variabilidad entre mediciones |
| D-13 | Documentación oficial 1.18.25 en HTML, en inglés, completa | Sin documentación; traducción al español; selección de páginas | Realismo; versión congelada; traducción incompleta; evitar sesgo de recorte |
| D-14 | Cronometraje manual por el autor, con reglas escritas | Registro automático con script | Decisión del autor; imprecisión despreciable y declarada |
| D-15 | Fin del tiempo con "listo" | "Seguro" | Evita introducir la dimensión de confianza |
| D-16 | Respuesta correcta: valor y fuente (decisión y regla en C-4) | Sólo valor o decisión | Es lo que el desarrollador necesita para actuar y lo que la plataforma informa |
| D-17 | Registrar aciertos parciales (cuentan como error) | No distinguirlos | Sin costo para el participante; informativo para noviembre |
| D-18 | Sin medición de confianza | Confianza autoinformada de 1 a 5 | Simplicidad del registro |
| D-19 | Medición final con la mayoría de los participantes y análisis pareado | Grupos distintos | Cada participante se compara consigo mismo |
| D-20 | Referente participa en la línea base antes del v0 y se informa aparte en noviembre | Excluirla | Aprovecha su participación sin contaminar la comparación |
| D-21 | Prueba piloto obligatoria | Medir directamente | Primera medición real; detecta errores de diseño |

### Decisiones nuevas o revisadas en la v0.2

| # | Decisión | Alternativa descartada | Motivo |
|---|---|---|---|
| **D-12'** | Hoja de referencia con información que la herramienta expone, incluidos todos los comandos de introspección | Limitarla a lo documentado (D-12 original) | `debug agent` no está documentado pero se descubre con `--help`; restringirla dejaba la ventaja librada al azar |
| **D-22** | Todos los comandos nativos permitidos, incluido `debug agent` | Prohibir los comandos de introspección | Prohibir un comando propio de la herramienta vuelve el escenario artificial e indefendible; en cambio los casos se construyen de modo que ningún comando dé la respuesta completa |
| **D-23** | Los ocho casos se rehacen sobre mecanismos verificados en el código y en ejecución, priorizando los que tienen issues reales asociados | Mantener los ejemplos genéricos de la v0.1 | Los casos anteriores se respondían con un comando; además, un caso con respaldo externo es evidencia de que el problema ocurre fuera del laboratorio |
| **D-24** | Criterio 8.2-3: ningún caso entra si un comando nativo da valor **y** fuente | Confiar en el criterio de derivación | Es la salvaguarda concreta contra el problema detectado en la v0.1 |
| **D-25** | Ocho secuencias con rotación del bloque *a*/*b* | Cuatro secuencias (v0.1) | Con cuatro, la variante *a*/*b* quedaba confundida con la mitad de la sesión y el control de equivalencia no era interpretable |
| **D-26** | Criterio de éxito principal pareado; ancla en C-1 como criterio secundario | Ancla en C-1 como criterio único (v0.1) | El ancla es un blanco fijo derivado de veinte observaciones; el diseño pareado es la fortaleza del estudio y no se estaba usando |
| **D-27** | Registrar qué comandos usó cada participante, y preguntar en el cuestionario si los conocía | Un único campo `uso_debug_config` | Con los comandos permitidos, cuál se usó es necesario para interpretar el tiempo |
| **D-28** | Informar por separado la proporción de "valor correcto con fuente incorrecta" | Sólo la tasa de error agregada | Es la medida directa de la brecha que ningún comando nativo cubre |
| **D-29** | VM sin interfaz de red, con control remoto sobre el anfitrión | VM con red y firewall saliente | Más simple de implementar y de acreditar: la VM no tiene red |
| **D-30** | Estimar la latencia del control remoto en el piloto y declararla | Ignorarla | Infla los tiempos absolutos que alimentan la valoración económica |
| **D-31** | Reclutar 13 para una línea base de 10 | "Reclutar con margen" sin número | Un margen no cuantificado no es un plan |
| **D-32** | Valoración económica como rango de sensibilidad con tres escenarios de frecuencia | Cifra única | La frecuencia es el factor más débil y descansa en una sola declaración |
| **D-33** | Límite de 180 s modificable sólo tras el piloto, luego congelado | Ajustable durante la medición | Cambiarlo después de empezar rompe la comparación |

### Decisiones nuevas en la v0.3

| # | Decisión | Alternativa descartada | Motivo |
|---|---|---|---|
| **D-34** | El manual embebido (`opencode debug skill`) se permite y se nombra en la hoja de referencia | Quitarlo del entorno; permitirlo sin nombrarlo | Quitarlo altera la herramienta; no nombrarlo deja la ventaja librada al azar. Permite además medir si la documentación alcanza (C-4a frente a C-4b) |
| **D-35** | C-4a reclasificado como documentado; C-4b se mantiene no documentado; C-3b clasificado como documentado de forma incorrecta | Mantener las clasificaciones de la v0.2 | La web y el manual documentan la última coincidencia, pero no la herencia de posición al fusionar archivos; y la web afirma `deny` para los `.env` cuando el comportamiento es `ask` |
| **D-36** | La verificación de cada caso se hace en ejecución, no por lectura del código | Aceptar evidencia de lectura del fuente | El tag contiene dos motores de permisos; la lectura del motor v1 llevó a dos conclusiones falsas que sólo la ejecución detectó |
| **D-37** | Las referencias de código del instrumento apuntan al motor v2 (`packages/core/src/permission.ts`) | Mantener las referencias al v1 | Es el motor que efectivamente decide en la 1.18.25 |
| **D-38** | Ningún valor, nombre, comando ni pregunta se repite entre casos (criterio 8.2-9); C-3a cambia su valor, su distractor y el agente consultado (`plan`), C-4b cambia su comando | Permitir repeticiones de superficie | Con repeticiones, un participante puede responder un caso de memoria a partir de otro: se mediría el recuerdo, no la dificultad del mecanismo |
| **D-39** | Estructura de artefactos ordenada por dónde vive cada cosa; a la VM sólo va lo que el participante puede ver | Estructura por tipo de artefacto (v0.2) | En la estructura anterior la ficha de cada caso, con su respuesta, quedaba junto a los archivos del escenario |
| **D-40** | Los escenarios se arman con un script (`caso.sh`) y la evidencia se captura con otro (`verificar.sh`) | Armar y verificar cada escenario a mano | Reproducible, idéntico en cada sesión y documentable en el anexo |
| **D-41** | En C-2b, valores de modelo realistas en lugar de los del laboratorio | Mantener `prov/RAIZ` y `prov/SUB` | El valor de la respuesta nombraba su propia fuente |
| **D-42** | Cada proyecto tiene un repositorio git con un commit inicial | Repositorio sin commits, como en el laboratorio | Es la situación realista; C-4 pregunta por comandos de git, y C-2b se verificó también con commit |

---

## 25. Pendientes

### Diseño

- [ ] Confirmar las decisiones marcadas `[CONFIRMAR]` en este documento.
- [ ] Definir la versión de Ubuntu y la herramienta de control remoto.
- [x] Clasificación documental de C-3b: la documentación web afirma `deny`; el comportamiento real es `ask`.
- [ ] Confirmar en la VM que la lectura de `.env` **pregunta** y no deniega, distinguiendo los dos casos por el texto del error o por la aparición del evento `permission.v2.asked` (en `opencode run` un `ask` se autorrechaza y se confunde con un `deny`).
- [ ] Leer el manual embebido completo y registrar, para cada caso, qué dice sobre su mecanismo (criterio 8.2-3).
- [ ] Reejecutar en la VM de Ubuntu los experimentos que respaldan casos (E-01, E-02, E-03, E-04, E-07 del laboratorio), con captura para el anexo.
- [x] Construir los ocho casos, el caso de práctica y los scripts de armado y verificación (`vm/`). Probados en Ubuntu 24.04: los doce valores esperados coinciden.
- [ ] Instalar en la VM definitiva, correr `verificar.sh` sin red y guardar la evidencia en `resultados/`.
- [x] Redactar la hoja de referencia y verificarla contra la documentación y contra `--help`.
- [ ] Redactar la hoja de respuestas con las variantes aceptables de la sección 13.

### Materiales

- [x] Generar la documentación offline en HTML (36 páginas).
- [ ] Redactar el guion de la sesión, con la prueba de conectividad incluida.
- [ ] Redactar el consentimiento informado, con el plazo de eliminación de grabaciones.
- [ ] Armar el cuestionario previo.
- [ ] Crear las plantillas de Excel con las columnas de la sección 14.
- [ ] Escribir `secuencias.md` con S1 a S8 y la asignación.

### Participantes y evidencia complementaria

- [ ] Confirmar si el referente puede facilitar participantes de su equipo.
- [ ] Obtener frecuencia declarada y costo horario del referente, con período.
- [ ] Obtener frecuencia revelada desde repositorios públicos.
- [x] Relevar issues de OpenCode sobre comportamiento inesperado de permisos o configuración → Anexo I, A.I.6 (32 casos).
- [x] Laboratorio de verificación con agente real → `INFORME.md` (19 experimentos, Windows 11).

### Ejecución

- [ ] Realizar la prueba piloto y ajustar.
- [ ] Reclutar participantes (objetivo: 13 para 10).
- [ ] Ejecutar la línea base. `[ ] fijar fecha objetivo`
- [ ] Procesar los datos y redactar el I.3.

---

## 26. Referencias

Galster, M., Mohsenimofidi, S., Böhme, L., Lulla, J. L., Abubakar, M. A., Treude, C., & Baltes, S. (2026). A dataset of agentic AI coding tool configurations. En *Proceedings of the 3rd ACM International Conference on AI-Powered Software (AIware '26)* (pp. 314–322). ACM. https://doi.org/10.1145/3805760.3814922

Ko, A. J., LaToza, T. D., & Burnett, M. M. (2015). A practical guide to controlled experiments of software engineering tools with human participants. *Empirical Software Engineering, 20*(1), 110–141. `[VERIFICAR datos bibliográficos]`

OpenCode. (2026). *OpenCode* (Versión 1.18.25) [Software]. GitHub. https://github.com/anomalyco/opencode/tree/v1.18.25

Sayagh, M., Kerzazi, N., Adams, B., & Petrillo, F. (2020). Software configuration engineering in practice: Interviews, survey, and systematic literature review. *IEEE Transactions on Software Engineering, 46*(6), 646–673. https://doi.org/10.1109/TSE.2018.2867847
