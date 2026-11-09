# ADR-109 — Matriz de decisión ponderada de la arquitectura y del runtime (formalización posterior de ADR-058 y ADR-032)

- Estado: aceptado (08/11/2026)
- Fecha: 08/11/2026
- Capítulos afectados: Cap. IX (IX.1); `04-diseno/README.md` §1; Anexo III (deliberación)
- Origen: sesión del 08/11/2026. El autor acepta la propuesta de dos matrices, seis criterios con sus pesos, declaración como formalización posterior y análisis de sensibilidad. Revisado el mismo día en dos pasadas
- Relacionado: **formaliza** ADR-058 (eje 1 · estilo y eje 2 · empaquetado) y ADR-032 (eje 1 · lenguaje y runtime). No los reemplaza ni reabre: si la matriz contradijera una de esas decisiones, se abriría un ADR de reemplazo aparte

### Contexto

La Consigna AE4 (apartado 5.e) exige para el Capítulo IX la «arquitectura adoptada con su matriz de decisión ponderada». La rúbrica, en la dimensión E, la nombra como evidencia del nivel 3 («matriz ponderada en el Capítulo IX»). Para el nivel 4 exige además distinguir lo que la evidencia impone de lo que el equipo eligió.

Las decisiones que la matriz formaliza ya están tomadas y aceptadas con un análisis cualitativo:
- ADR-032 (stack), del 25/09/2026;
- ADR-058 (arquitectura), del 29/09/2026.

La matriz es, por lo tanto, **posterior a la decisión**. El riesgo es el que la cátedra señala como «error frecuente dos» del Instrumento 37: ajustar los pesos después de puntuar hasta que gane la opción preferida (`catedra/AE4/03_Plantillas_Instrumentos_AE4.pdf`, Instrumento 37, apartado 37.2). Este ADR lo controla con cuatro medidas:
1. los criterios y los pesos se fijan y se registran **antes** de asignar los puntajes (paso 1 de este ADR);
2. cada puntaje cita el pasaje del ADR del que se deriva; lo que no figura en el ADR se marca como conocimiento general;
3. un análisis de sensibilidad de los pesos, de a uno y de a pares, muestra cuánto tienen que cambiar para que cambie la opción ganadora;
4. un análisis de sensibilidad de los puntajes muestra cuántos puntos le faltan a cada alternativa perdedora para igualar a la ganadora.

**Límites que se declaran.** Ninguna medida borra el hecho de que el ganador se conocía al fijar los pesos. El orden de los pasos 1 y 2 **no es verificable por terceros**: ambos se registraron el mismo día, en el mismo archivo y sin un commit intermedio. Los puntajes citan análisis escritos para fundamentar la decisión, por lo que pueden heredar su sesgo; la sensibilidad de puntajes acota ese riesgo, no lo elimina. Las tres cosas se declaran en el cuerpo del capítulo.

### Alternativas evaluadas

**Sobre qué decisiones llevan matriz.**
- **M-A:** una matriz por cada eje de ADR-032 y ADR-058 (doce ejes).
- **M-B:** dos matrices, para los ejes donde las alternativas compiten de verdad: estilo de arquitectura con empaquetado (ADR-058, ejes 1 y 2) y lenguaje y runtime (ADR-032, eje 1). Los demás ejes van en una tabla corta con la alternativa descartada y su criterio de descarte.

**Sobre los pesos.**
- **W-A:** los pesos de la cátedra del Instrumento 37 (valor, datos, infraestructura, competencias, costo, riesgos éticos).
- **W-B:** criterios propios derivados de los requisitos y objetivos de RIGE.

### Análisis (trade-offs)

- **M-A** pondera ejes con una alternativa que se descarta sola (por ejemplo, invocar el binario de OpenCode contradice la Tabla 9 del AE1 y anula la independencia del oráculo). Una matriz así no informa nada y diluye las dos que sí deciden.
- **M-B** concentra la matriz donde la elección fue disputada. Es la que permite responder la pregunta de la grilla del coloquio (eje 2: «¿Por qué esta arquitectura y no la alternativa de la matriz?»).
- **W-A** está pensada para incorporar una tecnología emergente: «disponibilidad y calidad de datos» y «riesgos éticos, de sesgo y de privacidad» no distinguen entre estilos de arquitectura. Se toma de ella la **forma**: escala de 1 a 5 en sentido favorable, pesos que suman 100, índice = Σ(peso × puntaje) ÷ 100, y pesos fijados antes de puntuar.
- **W-B** deriva cada criterio de un requisito u objetivo aceptado, por lo que el peso se discute contra el catálogo y no contra la preferencia.

### Recomendación y fundamento

M-B con W-B, en la forma de la matriz de la cátedra.

#### Paso 1 · Criterios y pesos (fijados el 08/11/2026, antes de puntuar)

Escala de 1 a 5, siempre en el sentido favorable: 5 es lo mejor para RIGE en ese criterio.

| N.º | Criterio | Peso (%) | Qué se evalúa | Origen |
|---|---|---|---|---|
| C1 | Fidelidad a OpenCode 1.18.25 | 30 | Que el resultado coincida con el de la herramienta sin reimplementar su semántica: el evaluador se usa sin portarlo ni adaptarlo | OE-1; D-06; riesgo principal (I.3.5) |
| C2 | Aislamiento del núcleo | 20 | Que el núcleo no pueda depender del adaptador de la herramienta ni de la infraestructura, y que la violación se detecte sin depender de la disciplina | RNF-03 |
| C3 | Ejecutabilidad en una máquina ajena | 20 | Cantidad y fragilidad de los prerrequisitos para instalar, construir y ejecutar en una máquina limpia | Guía de comprobación del v1; Guía 07 de la AE4 |
| C4 | Solo lectura y sin red por construcción | 15 | Que la lectura sin escritura, la protección del contenido sustituido y la ausencia de conexiones salientes se garanticen por la forma del código y pruebas, no por convención | RNF-01, RNF-04, RNF-05 |
| C5 | Costo en horas | 10 | Horas de construcción y de mantenimiento dentro del presupuesto | ADR-052; Tabla 18 |
| C6 | Madurez del ecosistema | 5 | Riesgo de que una herramienta o comportamiento del entorno falle o esté mal documentado | Conocimiento general; costo reconocido en ADR-032 |
| | **Total** | **100** | | |

**Regla de decisión.** Gana el índice mayor. Por analogía con la regla del Instrumento 37 (apartado 37.3), un puntaje 1 en cualquier criterio descarta la alternativa aunque su índice sea alto.

**Fundamento de los pesos.** C1 lleva el mayor peso porque la fidelidad es el objetivo que justifica el producto: un resultado que no coincide con la herramienta agrava el problema (motivo de la prioridad de RNF-02). C2 y C3 siguen con el mismo peso: RNF-03 es la decisión que el catálogo presenta como la que habilita otras herramientas, y la ejecutabilidad es condición de aprobación de la cátedra. C4 tiene peso menor que C2 porque RNF-01, RNF-04 y RNF-05 se verifican además con pruebas en cualquier alternativa. C5 y C6 desempatan.

#### Modificaciones del paso 1 posteriores a los puntajes (08/11/2026)

La revisión del 08/11/2026 observó el paso 1. Los **pesos, las definiciones de los criterios y la regla «gana el índice mayor» no se cambian**, porque cambiarlos después de puntuar es el error que este ADR quiere evitar. Se cambia una regla y se declaran dos alcances:
- **Veto solo por C1.** El veto por un puntaje 1 se limita a la fidelidad. La regla original lo aplicaba a cualquier criterio, por analogía con el Instrumento 37, que la cátedra asigna a la tecnología emergente (Cap. XI). Aplicado a C5 o a C6, el veto convertía un criterio de desempate en eliminatorio. El cambio no altera ningún resultado: la única alternativa con un puntaje 1 (L-C) lo tiene en C1.
- **C2 va más allá de RNF-03 en dos puntos.** El enunciado de RNF-03 exige que el núcleo no dependa del adaptador de OpenCode, y su criterio CA-1 se cumple con el análisis estático de dependencias. C2 agrega dos cosas que el requisito no exige: que el núcleo tampoco dependa de la infraestructura, y que la violación se detecte «sin depender de la disciplina». Las dos son preferencias del equipo, y se declaran así.
- **Alcance de «sin portarlo ni adaptarlo».** La copia del evaluador ya tiene adaptaciones declaradas, comunes a todas las alternativas: imports, tipos locales, firmas que reciben `hogar` y `plataforma` en lugar de `os.homedir()` y `process.platform`, y aserciones de tipo sin efecto en ejecución (`src/paquetes/opencode/vendor/PROCEDENCIA.md`, «Lista exacta de cambios», puntos 1 a 5). En C1, «sin adaptarlo» significa que el runtime no exige **otras** adaptaciones además de esas, y que la lógica de decisión se conserva sin cambios.

Un margen de indiferencia de 0,25, adoptado en una versión intermedia de este ADR, **se retiró** el mismo día: su fundamento («un punto en un criterio de peso 25») era erróneo, porque ningún criterio pesa 25, y se había fijado conociendo ya las diferencias. En su lugar, cada matriz informa su diferencia y el cambio mínimo que la invierte.

**Criterios considerados y no ponderados:**

| Criterio | Motivo |
|---|---|
| Portabilidad (RNF-06: Ubuntu 26.04 y Windows 11, sin privilegios) | Se supone que no distingue: Bun 1.3.14 y Node.js 24 se publican para las dos plataformas [CG], y el CI de RIGE ejecuta la matriz en las dos (`.github/workflows/ci.yml`). No se probó RIGE sobre Node.js. Las limitaciones de Windows de ADR-106 son de la detección de OpenCode instalado con un gestor, no del runtime de RIGE |
| Rendimiento (RNF-07) | Se supone que no distingue: el peor caso medido de RIGE es de 147,82 ms frente al umbral de 2 s (`03-requisitos/libro/catalogo/RNF-07.md`). No se midieron las otras alternativas |
| Competencias del equipo (Instrumento 37) | El autor declara experiencia en TypeScript (ADR-032, condición descartada), común a L-A y L-B. Otro lenguaje ya queda vetado por C1 |
| Paridad entre la CLI y la web (OE-1, OE-2, ADR-051) | No es un criterio propio: la matriz la recoge solo como costo de mantener dos copias (C5). Es la consideración que inclina el estilo (ver «Sensibilidad») |

**Característica de calidad (ISO/IEC 25010:2023, la edición registrada en `01-relevamiento/fuentes.md`, clave `iso250102023`) de cada criterio:** C1, adecuación funcional (corrección funcional); C2, mantenibilidad (modularidad y modificabilidad); C3, flexibilidad (instalabilidad); C4, seguridad (confidencialidad e integridad); C5, costo, sin característica propia; C6, fiabilidad (ausencia de defectos), con la salvedad de que el criterio mide la madurez del ecosistema de terceros y no la del producto. *Corrección del 08/11/2026:* la primera versión usaba los nombres de la edición 2011 (portabilidad; madurez), que la edición 2023 reemplaza. **Lo que se cede:** madurez del ecosistema en el runtime (C6 de L-A) y costo y madurez en el empaquetado (C5 y C6 de P-2).

#### Paso 2 · Puntajes

Asignados el 08/11/2026, después de registrar el paso 1, y corregidos el mismo día en dos pasadas de revisión. Las correcciones se registran en la tabla «Puntajes corregidos». Los índices y la sensibilidad salen de `tools/sensibilidad_matriz.py` (reproducible: `python tools/sensibilidad_matriz.py`).

**Momento de la información.** Cada matriz se puntúa con la información disponible a la fecha de su decisión, registrada o no en el ADR: ADR-032, del 25/09/2026, con sus precisiones de fundamento del 28/09/2026, y ADR-058, del 29/09/2026. Las precisiones del 28/09 se incluyen porque corrigen una suposición del 25/09 sin cambiar la decisión, y son anteriores a ADR-058. La información que no figura en el ADR se rotula [Doc] o [CG]. Lo aprendido después, durante la construcción, **no modifica los puntajes**: va a la sección de verificación posterior.

**Rótulos de la fuente de cada puntaje:**
- **[ADR-NNN]:** pasaje del ADR citado;
- **[Doc]:** documentación oficial del componente, para la versión vigente a la fecha de la decisión;
- **[CG]:** conocimiento general que el ADR no analizó;
- **[NoD]:** el criterio no distingue entre las alternativas de la matriz.

**C5 sin horas.** Ninguna alternativa descartada se estimó en horas en su momento. C5 es una comparación ordinal de esfuerzo relativo, no un cálculo sobre ADR-052 ni sobre la Tabla 18.

**Orden de las matrices.** Primero el runtime y después la arquitectura: el empaquetado P-2 se apoya en los workspaces de Bun con instalación aislada, así que la matriz 2 supone el resultado de la 1.

##### Matriz 1 · Lenguaje y runtime (ADR-032, eje 1)

Alternativas: **L-A**, TypeScript sobre Bun 1.3.14; **L-B**, TypeScript sobre Node.js 24 (24.21.0, la LTS activa al 25/09/2026).

**L-C** (otro lenguaje: Python, Go o Rust) se **veta** sin ponderar, por C1 = 1: «obliga a portar el evaluador», contradice D-06 y pierde «la coincidencia por construcción» (ADR-032, Lenguaje y runtime). **Deno** no se evaluó en su momento y no se pondera: ejecuta TypeScript con el motor V8, el mismo de Node.js, por lo que comparte la debilidad de L-B en C1 [CG].

| Criterio (peso) | L-A | L-B | Fuente del puntaje |
|---|---|---|---|
| C1 Fidelidad (30) | 5 | 4 | [ADR-032, precisiones del 28/09/2026] El evaluador son funciones puras, así que corre en Node.js sin adaptar su cuerpo. Queda una fuente de divergencia: `match` traduce comodines a expresiones regulares, y OpenCode, que es el oráculo, se compila con Bun 1.3.14 (ADR-032, «Verificación sobre el tag `v1.18.25`»; ADR-062, verificación, punto 6), cuyo motor difiere del de Node.js. **Es un riesgo no demostrado [CG]**: el repositorio no registra un caso concreto de divergencia |
| C2 Aislamiento del núcleo (20) | 5 | 5 | [NoD] El aislamiento lo da la arquitectura (matriz 2), no el runtime |
| C3 Ejecutabilidad (20) | 5 | 5 | [NoD] L-A: [ADR-032] «un solo prerrequisito para la cátedra: una versión exacta de Bun», con SQLite, pruebas y servidor integrados. L-B: [Doc] Node.js 24.21.0 también es un solo prerrequisito e integra `node:sqlite` sin bandera, `node:test` y la ejecución de TypeScript por eliminación de tipos, que admite los `namespace` de solo tipos de la copia. Los imports relativos llevarían extensión, dentro del cambio de imports que la copia ya declara |
| C4 Solo lectura y sin red (15) | 4 | 4 | [NoD] La garantía depende de la forma de los puertos y de las pruebas (ADR-058, eje 4), no del runtime |
| C5 Costo en horas (10) | 5 | 5 | [NoD] Con las capacidades integradas de las dos, ninguna suma trabajo propio, y ninguna necesita adaptar el cuerpo del evaluador |
| C6 Madurez (5) | 2 | 4 | L-A: [ADR-032, Costo de L-A] «El ecosistema de Bun es menos maduro que el de Node, y alguna herramienta de terceros puede no soportarlo». L-B: [Doc] maduro, pero `node:sqlite`, el componente que RIGE necesita, estaba en estado de versión candidata, no estable |
| **Índice** | **4,70** | **4,50** | Diferencia 0,20 |

##### Matriz 2 · Estilo y empaquetado (ADR-058, ejes 1 y 2)

Alternativas:
- **A-1:** capas con un paquete (la lista de carpetas de ADR-032), con una prueba de arquitectura;
- **A-2 + P-1:** puertos y adaptadores en un paquete, con los límites controlados por una prueba de arquitectura;
- **A-2 + P-2′:** puertos y adaptadores en dos paquetes aislados, `nucleo` y el resto. ADR-058 no la evaluó; se agrega en la revisión del 08/11/2026;
- **A-2 + P-2:** puertos y adaptadores en tres paquetes aislados: `nucleo`, `opencode` y `rige`.

No se ponderan:
- **P-3** (un paquete por capa): ADR-058 lo descarta porque «multiplica esa configuración sin proteger ningún requisito adicional».
- **Un paquete con referencias de proyecto de TypeScript por carpeta, sin workspaces**: no se evaluó en su momento. Daría el bloqueo por compilación sin depender de la instalación aislada de Bun [CG]. El bloqueo de las importaciones relativas entre paquetes de RIGE lo dan, de hecho, los `tsconfig` compuestos de cada paquete (`"composite": true`).

| Criterio (peso) | A-1 | A-2 + P-1 | A-2 + P-2′ | A-2 + P-2 | Fuente del puntaje |
|---|---|---|---|---|---|
| C1 Fidelidad (30) | 5 | 5 | 5 | 5 | [NoD] El evaluador se usa igual en las cuatro. La duplicación del recorrido de A-1 afecta la paridad entre interfaces (ADR-051), no la coincidencia con OpenCode, y se cuenta en C5 |
| C2 Aislamiento del núcleo (20) | 3 | 3 | 5 | 5 | [ADR-058, Empaquetado] A-1 y P-1, con un paquete: el aislamiento del núcleo depende de una prueba de arquitectura, que cumple RNF-03 CA-1. P-2′ y P-2: además, «la dependencia prohibida no compile y falle al ejecutar» entre los paquetes. La parte de C2 que se refiere a los módulos del runtime depende de la prueba en las cuatro, porque «los workspaces no controlan los módulos del runtime» |
| C3 Ejecutabilidad (20) | 5 | 5 | 5 | 5 | [NoD] [ADR-058, Empaquetado] «El comando de instalación de la cátedra no cambia (`bun install`)» |
| C4 Solo lectura y sin red (15) | 4 | 4 | 4 | 4 | [NoD] La garantía de RNF-01, RNF-04 y RNF-05 es el eje 4 de ADR-058 (G-1 o G-2), independiente del estilo: A-1 también podría adoptar G-2 |
| C5 Costo en horas (10) | 3 | 5 | 4 | 4 | [ADR-058; CG] A-1 escribe el recorrido una vez por interfaz y mantiene dos copias que deben coincidir: «la coincidencia que exige ADR-051 queda librada a mantener dos copias iguales». A-2: «dos carpetas más […] y un nivel de indirección», compensados por escribir cada caso de uso una sola vez. P-2′ y P-2: un `package.json` y un `tsconfig` por paquete; la diferencia de un paquete no alcanza un punto |
| C6 Madurez (5) | 5 | 5 | 3 | 3 | [ADR-058, Contexto; CG] P-2′ y P-2 dependen de los workspaces de Bun con instalación aislada, vigente por defecto desde la versión 1.3.2: una función reciente frente a la mayoría de las herramientas de terceros |
| **Índice** | **4,25** | **4,45** | **4,65** | **4,65** | |

##### Puntajes corregidos

Todos los cambios entre la primera versión del paso 2 y esta, del 08/11/2026: seis aumentos, una disminución y un veto. **Los seis aumentos favorecieron a una alternativa perdedora**; la disminución, la baja de C6 de L-B, favoreció a la ganadora en 0,05; el veto de L-C no favorece a ninguna. *Corrección del 08/11/2026:* una versión anterior de este párrafo decía «siete de las ocho» por contar el veto como favorable a la perdedora. El efecto neto achicó todas las diferencias.

| Matriz | Alternativa | Criterio | Anterior | Actual | Motivo |
|---|---|---|---|---|---|
| Runtime | L-B | C1 | 3 | 4 | La suposición de APIs propias de Bun en el evaluador fue refutada (ADR-032, precisiones del 28/09/2026); queda solo el riesgo del motor |
| Runtime | L-B | C3 | 3 | 5 | Node.js 24.21.0 integra SQLite, pruebas y ejecución de TypeScript, y admite los `namespace` de solo tipos [Doc]; el argumento de los imports sin extensión era débil, porque la copia ya reescribe sus imports |
| Runtime | L-B | C5 | 3 | 5 | No hay que adaptar el evaluador ni sumar un módulo de SQLite o un ejecutor de pruebas [Doc] |
| Runtime | L-B | C6 | 5 | 4 | `node:sqlite` estaba en estado de versión candidata [Doc]. Es la única corrección que baja un puntaje de la perdedora |
| Runtime | L-C | todos | puntuada | vetada | Veto por C1 sin ponderar el resto; el puntaje 4 en C3 era un «caso intermedio» entre lenguajes distintos |
| Estilo | A-1 | C1 | 4 | 5 | La paridad entre interfaces no es fidelidad a OpenCode; se cuenta en C5 |
| Estilo | A-1 | C2 | 2 | 3 | El pasaje citado de ADR-058 habla de las interfaces, no del núcleo; con un paquete y una prueba, A-1 aísla el núcleo como P-1 |
| Estilo | A-1 | C4 | 2 | 4 | La garantía de RNF-01, RNF-04 y RNF-05 es un eje independiente del estilo (ADR-058, eje 4) |

Con los puntajes de la primera versión, los índices eran 4,70 frente a 3,65 en el runtime, y 3,45, 4,45 y 4,65 en la arquitectura. Las correcciones achicaron las diferencias y no cambiaron ningún ganador.

##### Sensibilidad

Resultados de `tools/sensibilidad_matriz.py`. Regla: gana el índice mayor.

**Matriz 1 · runtime.** L-A gana por 0,20.
- **Puntajes:** si L-B sube un punto en C1 (de 4 a 5), gana L-B, por 0,10. Ese puntaje es el riesgo del motor, que no está demostrado.
- **Pesos de a uno:** solo C6 cambia el ganador: con la madurez en 14, gana L-B.
- **Pesos de a pares:** pasar 10 puntos de C1 a C6 da ganador a L-B; pasar 10 puntos de C2, C3, C4 o C5 a C6 da empate.

Lectura: **el runtime no lo impone la matriz**. L-A gana por un margen estrecho, que se apoya en un riesgo no demostrado (C1) y en el peso mínimo de la madurez (C6). Lo que sí impone la evidencia es un hecho: OpenCode se compila con Bun 1.3.14, de modo que ejecutar la copia del evaluador en el mismo motor elimina una fuente de divergencia que en Node.js existe, aunque no esté cuantificada. **El equipo eligió priorizar esa coincidencia con el oráculo sobre la madurez del ecosistema.**

**Matriz 2 · estilo.** A-2 + P-1 **domina** a A-1: no es peor en ningún criterio y es mejor en C5, el costo de mantener dos copias que deben coincidir. Ningún juego de pesos con C5 positivo puede invertirlo. La ventaja mínima del mejor A-2 sobre A-1 en todas las variaciones ensayadas es de 0,10. Lectura: **el estilo lo impone la evidencia**, y lo decide la paridad entre interfaces, que la matriz solo recoge como costo. La matriz subestima la ventaja de A-2, porque la paridad es un requisito de corrección (OE-1, OE-2), no solo de horas.

**Matriz 2 · empaquetado.** P-2 y P-2′ empatan (4,65); P-1 queda a 0,20.
- **Puntajes:** si P-1 sube de 3 a 4 en C2, empata.
- **Pesos de a uno:** con C2 en 11 o C6 en 14, gana P-1.
- **Pesos de a pares:** pasar 10 puntos de C2 a C5 o a C6 da ganador a P-1. Hay empate entre los tres empaquetados al pasar 10 puntos de C2 a C1, C3 o C4, 5 de C2 a C6, o 10 de C1, C3 o C4 a C6.

Lectura: el empaquetado es una **elección del equipo** con margen estrecho.
- **P-2 o P-2′ frente a P-1:** lo que inclina la diferencia (C2: 5 frente a 3) es exigir que la violación del aislamiento no compile. Esa exigencia **ya está ponderada** en C2 y va más allá de RNF-03 (ver «Modificaciones del paso 1»).
- **P-2 frente a P-2′:** empatan en la matriz. Se prefiere P-2 porque el adaptador de OpenCode, en su propio paquete, compila solo contra el contrato del núcleo y no puede usar la aplicación ni la infraestructura. Es lo que pide RNF-03 CA-3 para el adaptador de prueba: estar «escrito únicamente contra el contrato del núcleo». Esta preferencia **no está ponderada**: funciona como desempate externo y así se declara.

##### Verificación posterior (no modifica los puntajes)

Condiciones que invalidaban cada decisión, contrastadas con lo construido entre el v1 y el 08/11/2026:

| Decisión | Condición que la invalidaba | Resultado |
|---|---|---|
| ADR-032, L-A | Que OpenCode no se ejecute sobre Bun | No se cumplió: el tag declara `"packageManager": "bun@1.3.14"` (ADR-032, «Verificación sobre el tag `v1.18.25`») y el binario distribuido se compila con esa versión (ADR-062, verificación, punto 6) |
| ADR-032, E-A | Que el evaluador no pueda aislarse en una copia acotada | No se cumplió: se copiaron seis funciones puras, con SHA-256 del origen (`src/paquetes/opencode/vendor/PROCEDENCIA.md`) |
| ADR-058, P-2 | Que la instalación aislada de Bun 1.3.14 genere fricción real con `tsc`, `bun test` o el CI | No se registró fricción: TypeScript 7.0.2 con `@types/bun` 1.3.14 verifica sin errores (ADR-062), y el CI corre en Ubuntu y Windows con `bun install --frozen-lockfile`. Su historial de corridas no se revisó para este ADR |
| ADR-058, P-2 | Que el adaptador ficticio de RNF-03 muestre que los tres paquetes no corresponden a la frontera real | No se cumplió: `src/pruebas/aceptacion/RNF-03.test.ts`, con `src/pruebas/utilidades/adaptador-ficticio.ts`, pasa 3 de 3 (corrida local del 08/11/2026 sobre `5e744de`). La prueba no distingue P-2 de P-2′: mide que el núcleo no cambie |

##### Ejes de ADR-032 y ADR-058 que no llevan matriz

Van a una tabla corta en IX.1, con la alternativa descartada y su criterio de descarte tomado del ADR:

| Eje | Adoptada | Descartadas y criterio de descarte |
|---|---|---|
| Interfaz (ADR-032, eje 2) | Web local en `127.0.0.1`, más la CLI | Aplicación de escritorio: la Guía de comprobación del v1 exige un proceso que «responde en la dirección declarada», y una ventana de escritorio no tiene dirección; se declara el cambio respecto de la aplicación de escritorio aprobada en el AE1. Solo CLI: el protocolo de medición supone consultas con explicación en prosa |
| Incorporación del evaluador (ADR-032, eje 3) | Copia atribuida (E-A) | Invocar el binario (E-C): contradice la Tabla 9 del AE1 y haría que el producto y el oráculo fueran la misma ejecución. Paquete publicado (E-B): el paquete se distribuye como binario y no expone el módulo interno |
| Integración continua (ADR-032, eje 4) | GitHub Actions | Otro servicio: el repositorio es de GitHub (`informe/datos-autor.yaml`) |
| Almacén (ADR-032, ADR-023 y ADR-061) | SQLite embebido con esquema por guion | Persistencia en archivos: la Guía de comprobación exige un esquema creado por guion en un motor real (ADR-032, precisiones del 28/09/2026) |
| Ejes 3 a 8 de ADR-058 | U-2, G-2, M-2, I-1, V-2, E-B | Según el análisis de cada eje en ADR-058 |

### Decisión del autor

Aceptado por el autor el 08/11/2026, sin comentarios, en la versión revisada en tres pasadas: veto solo por C1, sin margen de indiferencia, puntajes corregidos registrados y lectura final (runtime y empaquetado, elecciones del equipo con márgenes estrechos; estilo, impuesto por la evidencia).

### Consecuencias

- IX.1 presenta las dos matrices, la sensibilidad con su lectura (qué impone la evidencia y qué eligió el equipo), la verificación posterior y la tabla corta de los demás ejes. La deliberación completa va al Anexo III.
- El cuerpo del capítulo declara que la matriz es una formalización posterior a ADR-032 y ADR-058, y los límites de sus medidas de control.
- Si IX.1 cita las capacidades de Node.js 24, sus páginas oficiales se registran en `01-relevamiento/fuentes.md` antes de redactar.
- IX.1 no nombra roles ni herramientas de revisión: las modificaciones posteriores se presentan como «revisión del 08/11/2026». El uso de asistentes se declara en la bitácora y en el README.

### Evidencia

- `00-gestion/decisiones/ADR-032-stack-typescript-bun-interfaz-web-local.md`, «Alternativas evaluadas» y «Análisis (trade-offs)».
- `00-gestion/decisiones/ADR-058-arquitectura-puertos-adaptadores-estructura-src.md`, ejes 1 y 2.
- `catedra/AE4/03_Plantillas_Instrumentos_AE4.pdf`, Instrumento 37, apartados 37.2 y 37.3.
- `catedra/AE4/06_Rubrica_AE4_Seis_Dimensiones.pdf`, dimensión E.
- `tools/sensibilidad_matriz.py`, salida del 08/11/2026.
- Documentación oficial de Node.js 24.21.0 (`node:sqlite`, `node:test`, ejecución de TypeScript), consultada el 08/11/2026.
- `03-requisitos/libro/catalogo/RNF-03.md`, `RNF-06.md` y `RNF-07.md`; `src/pruebas/aceptacion/RNF-03.test.ts`.
- Revisión del 08/11/2026, en dos pasadas, con sus hallazgos aplicados (detalle de herramientas en la bitácora).
