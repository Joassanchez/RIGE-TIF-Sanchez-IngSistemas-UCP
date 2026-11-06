# Instrumento 37 · Evaluación de factibilidad tecnológica con criterios ponderados

*Momento de aplicación: Clase 27, jueves 12 de noviembre. Destino: Capítulo XI, tecnologías emergentes evaluadas; Capítulo IX si la tecnología se incorpora. Portafolio AE4, punto (a).*

**Proyecto:** RIGE. **Base de cada afirmación:** [D] dato del repositorio, con su ruta; [G] conocimiento general de ingeniería; [S] suposición.

## 37.1 · Prueba de necesidad

| Pregunta | Hipótesis 1 | Hipótesis 2 |
|---|---|---|
| Tecnología y evolución propuesta | Sistemas inteligentes: un modelo de lenguaje genera la explicación de las decisiones de permiso y de los hallazgos, en lugar de las plantillas deterministas | Sistemas inteligentes, fuera del producto: un modelo de lenguaje clasifica cada nota de versión de OpenCode por tipo de cambio (configuración, permisos, agentes u otro) y devuelve una lista de versiones candidatas. El autor confirma cada clasificación antes de decidir |
| ¿Qué necesidad del dominio resuelve? | Ninguna verificable. La explicación por plantillas responde el motivo del resultado (I.6) y la referente la valida (`informe/cap-03/III.4-limites-sistema.md`, L-13) | Decidir qué versión amerita una intervención de readaptación. La clasificación manual cubre 227 versiones estables en nueve meses, con 43 cambios declarados y 23 posibles (`00-gestion/anexo-III.md`, A.III.3) |
| ¿Qué evidencia la acredita? (hallazgo, dato, validación) | **No.** El repositorio carece de un hallazgo, una medición o una validación que muestre que las plantillas impiden comprender o corregir una regla | **Sí.** Cadencia y conteo: A.III.3. Clasificación de 31 incidencias con un único codificador, declarada como límite: `informe/anexos/anexo-I-datos-relevados.md`, A.I.6. Costo de 4 a 22 h por intervención (estimado): `informe/cap-10/X.5-otros-recursos.md`. Poder del proveedor: `informe/cap-04/IV.3-analisis-rivalidad-amplificada.md`. Acredita la necesidad de decidir; el ahorro de la técnica frente a la lectura manual sigue como hipótesis, porque el costo de clasificar a mano carece de medición |
| ¿Qué decisión del dominio usaría el resultado? | Ninguna: la decisión de permiso y el hallazgo los determina el núcleo; el modelo solo reescribiría su presentación | Si la intervención del trimestre se ejecuta o se posterga, y en qué orden se revisan las versiones candidatas (E-04 del Instrumento 39) |
| ¿Supera la prueba de necesidad? | **No: ornamento. No se pondera** | **Sí** |

**Hipótesis 1, fundamento del descarte.**

- **Razón suficiente.** Falta un beneficio acreditado: alcanza para descartarla hoy en cualquiera de sus variantes.
- **Modelo remoto.** Además, RNF-05 descarta la conexión a un modelo remoto (`03-requisitos/libro/catalogo/RNF-05.md`).
- **Modelo que decide o reinterpreta.** Además, un agente externo puede consumir esa salida sin revisión humana (I.3.5), y la línea de base mide agentes que declaran un éxito falso en 5 de 33 problemas de E2 (ADR-098; I.3.2).
- **Modelo local que solo redacta sobre el rastro ya resuelto.** RNF-05 y la línea de base dejan de aplicar. Queda en pie su costo: agrega variabilidad ante entradas idénticas, frente a RF-03 y L-13, sin beneficio que la compense. Es la variante que la condición de reapertura admite.
- **Se declara postergada.** Instrumento 36, apartado 36.3. Condición que la reabre: una sesión registrada con usuarios documenta que la explicación por plantillas impide corregir una regla, y además el modelo opera en forma local, sin afectar RNF-05, y el núcleo sigue determinando el resultado.

**Otras tecnologías de la consigna.** Geoposicionamiento, gamificación, realidad aumentada e Internet de las cosas se descartan sin formular hipótesis: RIGE es una herramienta local que lee archivos de configuración y el relevamiento carece de una necesidad asociada. Una integración con el agente mediante una skill o un servidor MCP queda como evolución de la hoja de ruta (Instrumento 36), porque su necesidad depende del veredicto de la medición final.

## 37.2 · Matriz ponderada

Pesos de la cátedra, sin ajuste. Los puntajes son juicio: se proponen junto con su índice y el autor los adopta sin cambios el 05/11/2026; desde entonces, no se ajustan. Competencias y Costo se cierran ese mismo día por delegación del autor, con la sensibilidad ya a la vista, y cada uno conserva el valor que no cambia la franja de decisión: se declara porque un punto más en cualquiera de los dos lleva a incorporar. La Hipótesis 1 queda sin puntuar por la regla de 37.1.

| Criterio | Peso (%) | Qué se evalúa | H1 (1-5) | H1 × peso | H2 (1-5) | H2 × peso |
|---|---:|---|---:|---:|---:|---:|
| 1 · Valor para el dominio | 25 | Magnitud del problema que resuelve y beneficio medible | — | — | 3 | 75 |
| 2 · Disponibilidad y calidad de datos | 20 | Existencia de los datos que la técnica necesita, en cantidad y calidad | — | — | 3 | 60 |
| 3 · Requisitos de infraestructura | 15 | Cómputo, almacenamiento, conectividad y compatibilidad con la arquitectura actual | — | — | 4 | 60 |
| 4 · Competencias del equipo | 15 | Dominio actual de la técnica por parte del equipo | — | — | 3 | 45 |
| 5 · Costo total a 24 meses | 10 | Licencias, servicios y horas de trabajo | — | — | 4 | 40 |
| 6 · Riesgos éticos, de sesgo y de privacidad | 15 | Ley 25.326, sesgo de los datos, explicabilidad de la decisión | — | — | 4 | 60 |
| **Total** | **100** | Índice = suma de (peso × puntaje) ÷ 100 | — | **Sin índice** | | **340 ÷ 100 = 3,40** |

**Cuenta de H2.** 75 + 60 + 60 + 45 + 40 + 60 = 340; 340 ÷ 100 = 3,40.

**Fundamento de cada puntaje.**

| Criterio | Puntaje | Fundamento | Base |
|---|---:|---|---|
| Valor | 3 | Apunta a reducir la parte de lectura y clasificación de una actividad recurrente con costo anual de USD 530,88 a 531,06, y deja intacto el problema central del proyecto. Se mide en horas de clasificación frente a la lectura manual | [D] X.3; [S] magnitud de la reducción, sin medir |
| Datos | 3 | Las notas y las incidencias son públicas y existen: 227 versiones clasificadas y 46 incidencias candidatas. Tienen etiquetas de un único codificador, sin concordancia medida | [D] A.III.3; A.I.6 |
| Infraestructura | 4 | Corre fuera del producto y deja intacta la arquitectura local (RNF-05). Requiere conexión solo en esa tarea de desarrollo | [D] RNF-05; [S] sin medir el cómputo |
| Competencias | 3 | El autor usa modelos de lenguaje con revisión en este proyecto, declarados en su Bitácora Individual, y el proyecto carece de práctica registrada en lo que la técnica exige: evaluación de clasificadores y concordancia entre codificadores. Un 4 requeriría esa práctica | [D] Bitácora Individual, declaración de uso; [S] nivel |
| Costo | 4 | Sin licencia nueva. Una suscripción de USD 20 por mes agrega USD 240 por año, fuera de la base del punto de equilibrio (X.3). Las horas de armado y revisión carecen de estimación, y esa incógnita impide puntuar 5 | [D] X.3; [S] puntaje |
| Riesgos | 4 | Datos públicos, sin datos del relevamiento con la referente. El autor confirma cada clasificación antes de decidir, y esa confirmación cubre la explicabilidad. Riesgo residual: sesgo de un único codificador y nombres de usuario de las incidencias | [D] A.I.6; [G] |

## 37.3 · Regla de decisión

| Índice | Decisión |
|---|---|
| 3,50 o más, y ningún criterio en 1 | Incorporar: al sistema, si el alcance lo permite, o al horizonte «Próximo» de la hoja de ruta |
| De 2,50 a 3,49 | Postergar con condición de activación explícita (Instrumento 36, apartado 36.3) |
| Menos de 2,50, o algún criterio en 1 | Descartar, con el motivo escrito |

**Resultado.**

- **Hipótesis 1:** ornamento, sin ponderar. Postergada en 36.3.
- **Hipótesis 2:** índice 3,40, entre 2,50 y 3,49, sin criterios en 1: **postergar**. Condición de activación, con las tres partes: (1) E-04 (Instrumento 39) registra que la lectura y la clasificación de notas pesan en el exceso de horas; (2) sobre casos separados de los usados para diseñarla, la clasificación asistida reduce el tiempo total frente a la lectura manual y conserva los cambios relevantes; (3) un segundo codificador alcanza concordancia con las etiquetas de referencia. `[DATO PENDIENTE: ahorro mínimo, cambios omitidos admitidos y concordancia exigida, a fijar antes de medir]`.

**Robustez de la decisión.**

| Criterio | Puntaje + 1 | Índice | Puntaje − 1 | Índice |
|---|---:|---:|---:|---:|
| Valor | 4 | 3,65 | 2 | 3,15 |
| Datos | 4 | 3,60 | 2 | 3,20 |
| Infraestructura | 5 | 3,55 | 3 | 3,25 |
| Competencias | 4 | 3,55 | 2 | 3,25 |
| Costo | 5 | 3,50 | 3 | 3,30 |
| Riesgos | 5 | 3,55 | 3 | 3,25 |

Subir cualquier criterio un punto lleva el índice a 3,50 o más; bajar cualquiera lo mantiene en la franja de postergar. El índice excluye descartar y deja sin separar con solidez postergar de incorporar. La decisión de postergar se sostiene en la falta de medición del ahorro, más que en el valor 3,40. Los datos que resuelven la duda son los de la condición de activación.

**Lo que enseña el criterio más débil.** La condición ataca el Valor y los Datos: mide el ahorro en horas y mejora las etiquetas. La evolución arranca, si se activa, como apoyo a la lectura de notas con confirmación del autor, sin modelo entrenado.

## 37.4 · Requisitos que la tecnología impone

Corresponde a la Hipótesis 2, la única que supera la prueba de necesidad.

| Dimensión | Qué exige | Cómo se satisface o qué falta |
|---|---|---|
| Datos | Notas de versión e incidencias de OpenCode, con etiquetas confiables por tipo de cambio | Existen el conteo de 227 versiones y las 46 candidatas (A.III.3; A.I.6). Falta un segundo codificador, una muestra con concordancia y casos separados para comparar con la lectura manual |
| Infraestructura | Acceso a un modelo o a un entorno de cómputo durante la tarea, fuera de la distribución de RIGE | Una suscripción a USD 20 por mes, que agrega USD 240 por año a la base del sostenimiento (X.3). RIGE conserva RNF-05 porque la tarea queda fuera del producto |
| Competencias del equipo | Diseño de la evaluación, métricas de clasificación y concordancia entre codificadores | Articulación con Sistemas Inteligentes. Falta práctica registrada en concordancia y evaluación de clasificadores (37.2, Competencias) |
| Consideraciones éticas, de sesgo y de privacidad | Datos públicos; sin datos personales del relevamiento (Ley 25.326); declaración del uso de la herramienta; revisión humana de cada decisión | Se satisface manteniendo la tarea sobre fuentes públicas. Falta tratar los nombres de usuario en los conjuntos que se conserven y medir el sesgo del codificador único |
