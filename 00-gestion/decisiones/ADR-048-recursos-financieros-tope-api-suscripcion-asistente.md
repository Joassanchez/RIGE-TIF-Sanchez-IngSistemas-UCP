# ADR-048 — Recursos financieros del período: gasto de API de la medición con tope fijado antes del piloto y regla de recorte, y suscripción del asistente de programación declarada como costo recurrente

- Estado: aceptado (28/09/2026), T-B + S-B
- Fecha: 28/09/2026
- Capítulos afectados: Cap. X (X.3; X.4 para el asistente); Cap. IV (IV.1, Tabla 10, «Estructura de costos»); Instrumento 34; `01-relevamiento/linea-base/DISENO-medicion-agentes.md` (piloto)
- Origen: diseño del Cap. X (sesión del 28/09/2026); pendiente U-02
- Relacionado: reemplaza la consecuencia de ADR-025 «el Capítulo X declara los recursos financieros como nulos durante el período» (la decisión de licencia MIT sin explotación comercial no cambia); concreta la consecuencia «Cap. X: costo de API como recurso financiero» y el «saldo cargado» de ADR-040; coherente con la declaración de herramientas auxiliares de la bitácora (AD-24)

### Contexto

- ADR-025 (aceptado) prevé que el Cap. X declare los recursos financieros **nulos** durante el período.
- ADR-040 (aceptado, 25/09/2026) introdujo un gasto real en USD: el autor carga saldo en la API para ejecutar la línea de base y la medición final con tres modelos (3 modelos × casos × k × 2 condiciones). El monto es `[DATO PENDIENTE]` hasta el piloto, y el saldo cargado también.
- IV.1, Tabla 10, ya lo reconoce, pero lo declara «sin tope fijado» y afirma una «infraestructura de desarrollo sin costo».
- El autor usa Claude Code (Anthropic) como asistente de programación y de redacción (bitácora, declaración de herramientas auxiliares). El plan es Claude Pro, a USD 20 mensuales (dato del autor, 28/09/2026). El autor indica que el valor se revisa al terminar la línea de base.
- La Guía AE2 (§7) pide, para los recursos financieros, «de dónde provienen los valores y con qué supuestos; los órdenes de magnitud se declaran como tales». Toda cifra de costo responde las tres preguntas (§7.1).

Con esto, «recursos financieros nulos» es falso, y «sin tope» deja abierto un gasto justo en el capítulo que dimensiona los recursos.

### Alternativas evaluadas

**Eje T · Tope del gasto de API**

- **T-A:** Sin tope, con registro del gasto al ejecutarse (texto actual de IV.1).
- **T-B:** Tope igual al saldo cargado en la clave exclusiva de la medición, fijado **antes** del piloto. El piloto estima el costo total. Si la estimación supera el tope, se aplica una regla de recorte fijada de antemano.
- **T-C:** Estimar el costo a priori con los precios de lista y una suposición de tokens por caso, sin piloto, y presupuestar esa cifra.

**Eje S · Suscripción del asistente**

- **S-A:** No declararla en el Cap. X; la declaración de herramientas auxiliares queda solo en la bitácora y en el `README.md` del v1.
- **S-B:** Declararla en X.4 (herramienta, función y artefactos afectados) y su costo en X.3 como costo recurrente, a precio de lista.

### Análisis (trade-offs)

**Eje T.**
- **T-A** no dimensiona nada. Si el piloto resulta caro, la medición se recorta sobre la marcha y sin criterio previo. Esa es la forma de decisión que ADR-040 evita al fijar el criterio antes de medir.
- **T-C** da una cifra antes del 01/10, pero se apoya en tokens por caso supuestos. Presentada como presupuesto, tendría la forma de una medición sin serlo (el mismo argumento de ADR-018).
- **T-B** convierte el gasto en un recurso acotado y verificable: la consola del proveedor aísla el gasto de la clave (ADR-040), y el total calculado se concilia con ella. Su costo es escribir la regla de recorte ahora.
- **Regla de recorte propuesta**, en orden, hasta entrar en el tope: (1) reducir k en M2 y M3; (2) reducir M3 y luego M2 a los doce casos de C-2 a C-4; (3) suprimir M2. **No se recorta** M1 sobre los doce casos de C-2 a C-4 con el k fijado por el piloto, porque sobre él descansa el criterio principal (8 de 12, ADR-040). Si M1 solo supera el tope, se amplía el saldo o se reabre ADR-040; no se mide con menos de lo que el criterio exige.

**Eje S.**
- **S-A** deja al IV.1 afirmando «infraestructura sin costo» mientras la bitácora declara un asistente de pago. El tribunal puede cruzarlos.
- **S-B** es coherente con la bitácora y con la Guía (declaración de herramientas auxiliares). Precio de lista con fuente y fecha de consulta; los impuestos locales sobre servicios digitales del exterior se excluyen del precio de lista y se declaran aparte si el autor informa el monto debitado (suposición: el débito difiere del precio de lista).

**Moneda.** Los gastos en USD no se suman a la valorización de horas en pesos sin un tipo de cambio con fuente y fecha. Cada cifra se presenta en su moneda.

### Recomendación y fundamento

**T-B + S-B.**

1. X.3 declara dos costos monetarios del período, ambos a cargo del autor:
   - gasto de API de la medición, con tope `[DATO PENDIENTE: saldo en USD y fecha de carga]`, método de cálculo de ADR-040 y regla de recorte;
   - suscripción Claude Pro, USD 20 mensuales, a precio de lista, por las mensualidades del período `[DATO PENDIENTE: cantidad de mensualidades, según la fecha de facturación]`.
2. X.3 declara además la valorización de las horas (X.1) como costo de oportunidad, no como desembolso, y la ausencia de punto de equilibrio por falta de explotación (ADR-025).
3. X.4 incorpora el asistente con su función y los artefactos afectados, en los mismos términos que la bitácora.
4. IV.1, Tabla 10: «sin tope fijado» pasa a «con tope fijado antes del piloto (Capítulo X)», y «infraestructura de desarrollo sin costo» se corrige para incluir la suscripción.

**Condición que invalidaría la recomendación:** que el autor decida no ejecutar la medición con saldo propio (por ejemplo, con créditos otorgados por el proveedor o por la institución). En ese caso, el gasto de API pasa a ser un aporte de terceros y se declara como tal.

### Decisión del autor

**Aceptado por el autor el 28/09/2026: T-B + S-B**, con dos datos del autor del mismo día:

- ~~**Tope de API: USD 20**~~ **Ajustado el 28/09/2026 tras la revisión del Cap. X (R-04):** USD 20 es la **carga para el piloto**. El **tope total es USD 50** y cubre la línea de base y la medición final `[DATO PENDIENTE: fecha de carga]`.
- **Eje T revisado (R-04, revisión `00-gestion/revisiones/20260928-cap-X.md`):** la estimación a priori (T-C) deja de descartarse y **complementa** a T-B. La Guía AE2 §7 admite órdenes de magnitud declarados como tales, y el argumento de ADR-018 («forma de medición sin serlo») no aplica a una estimación de costo con sus supuestos explícitos. El Cap. X presenta por separado el tope (límite) y la estimación (orden de magnitud, con sus supuestos). El piloto reemplaza la estimación por el costo medido.
- **Estimación del ingeniero (supuestos, 28/09/2026):** por ejecución, unos 50 mil tokens de entrada sin caché, 250 mil leídos de caché y 10 mil de salida. Da unos USD 0,45 en Opus 5.5, 0,22 en Sonnet 5 y 0,11 en Haiku 4.5. Con 16 casos y k = 3 son unos USD 37 por medición y unos USD 75 entre las dos, en un rango de 40 a 150 según los supuestos. **Con un tope de USD 50, lo esperable es aplicar la regla de recorte.** Se declara qué se pierde con cada recorte: suprimir Sonnet 5 o Haiku 4.5 elimina el análisis de sensibilidad de ADR-040, que responde a «un modelo más capaz resuelve el problema».
- **Claude Pro es una suscripción personal, anterior e independiente del TIF** (pagada desde julio de 2026, dato del autor). La estimación de horas de la Tabla 18 **no** supone su uso (dato del autor, 28/09/2026): el asistente es un margen de productividad no computado. Se ajusta S-B: el asistente se declara como recurso en X.4 (herramienta, función y artefactos afectados), pero en X.3 figura **sin costo atribuible al proyecto**, por ser un costo que el autor afronta con o sin el proyecto (criterio de costo incremental). En consecuencia, la frase de IV.1 «infraestructura de desarrollo sin costo» se conserva; en IV.1 solo se corrige «sin tope fijado».

**Advertencia del ingeniero (28/09/2026), a verificar en el piloto:** con los precios de lista vigentes (Opus 5.5: USD 4 / 20 por millón de tokens de entrada y salida; Sonnet 5: 2 / 10; Haiku 4.5: 1 / 5; fuente: referencia de modelos de Anthropic, consultada el 28/09/2026) y un consumo supuesto de un agente por ejecución, USD 20 probablemente no cubre la línea de base completa con k = 3. Solo M1 sobre los dieciséis casos puede acercarse al tope. Si el piloto lo confirma, rige la última cláusula de la regla de recorte: se amplía el saldo o se reabre ADR-040. Tampoco está definido si el tope cubre la medición final (noviembre) o solo la línea de base.

### Consecuencias

**Si se acepta:**
- La consecuencia financiera de ADR-025 queda reemplazada; se anota en ese ADR con la referencia a este.
- El diseño de la medición incorpora el tope y la regla de recorte antes del piloto.
- El IV.1 vuelve a borrador para la corrección de la Tabla 10 (con `/corregir`).
- El Instrumento 34 lleva una fila «Financieros» por cada costo, con las tres preguntas del precio de lista (Anthropic; tarifa publicada; fecha de consulta).
- Tras la línea de base, el autor revisa el costo de la suscripción (dato del autor) y el gasto real conciliado reemplaza la estimación.

### Evidencia

`00-gestion/decisiones/ADR-025-modelo-sostenimiento-licencia-abierta-mit.md` (Consecuencias); `00-gestion/decisiones/ADR-040-linea-base-agentes-ejecutores-procedimiento-delegado.md` (Registro de modelos y del costo; criterio principal); `informe/cap-04/IV.1-definicion-negocios.md` (Tabla 10, línea 23); `00-gestion/bitacora.md` (declaración de herramientas auxiliares); `catedra/AE2-guia.md` (§7 y §7.1).
