# ADR-076 — Medición con agentes sobre la suscripción ChatGPT Plus y modelos de OpenAI, consumo medido en tokens y valorizado a precio de lista como equivalente informativo; recursos financieros reestructurados sin tope de API

- Estado: aceptado (01/10/2026)
- Fecha: 01/10/2026
- Capítulos afectados: Cap. X (X.3 completo; X.4, X.1); Cap. I (valorización del consumo por tokens, Ventana del AE1); diseño de la medición (`01-relevamiento/linea-base/DISENO-medicion-agentes.md`); Instrumento 34; Anexo III (D-41, D-48, D-49)
- Origen: corrección del Cap. X del autor (01/10/2026: «descartar el planteo actual», «la métrica debe ser el consumo de tokens», «suscripción mensual de aprox. USD 20, orientada a la familia de Codex») y elección del autor en la sesión del 01/10/2026: ChatGPT Plus, con el dato del autor de que OpenCode acepta esa suscripción como proveedor
- Reemplaza: ADR-057, eje T (tope de API de USD 50, carga de USD 20, regla de recorte) y sus consecuencias en X.3. **Modifica** ADR-053 en los modelos (tres modelos de Anthropic por API) y en el control del gasto (clave exclusiva conciliada con la consola)
- Modificado por: ADR-077 (eje X, estructura de X.3, y la consecuencia «Claude Pro sin costo atribuible»), aceptado el 01/10/2026
- Relacionado: ADR-053 (diseño de la medición, criterio de 8 de 12 sobre el modelo principal), ADR-057 (ejes L y S, vigentes), ADR-067 (Codex sobre ChatGPT Plus como escritor)

### Contexto

- ADR-053 mide con tres modelos de Anthropic por API (Opus 5.5 como principal, Sonnet 5 y Haiku 4.5), con OpenCode 1.18.25 como ejecutor. ADR-057 fija un tope de USD 50, una estimación de unos USD 75 y una regla de recorte que suprime modelos secundarios.
- El autor observa que X.3 presenta montos que no corresponden al proyecto (USD 50 a 100), con un esquema de desembolso incremental y costo económico que no se adapta a su naturaleza, y pide medir el consumo en tokens y sostener la medición con una suscripción mensual de unos USD 20.
- El autor ya paga ChatGPT Plus para Codex (ADR-067; AR-14) e informa que OpenCode acepta esa suscripción como proveedor. Ese dato se verifica en la documentación antes del piloto (condición 1).
- La medición ya registra tokens por caso como indicador (ADR-053; Ventana del AE1, §1).

### Alternativas evaluadas

**Eje F · Fuente del consumo de modelos**
- **F-A:** API de Anthropic con clave exclusiva y tope de USD 50 (vigente, ADR-057).
- **F-B:** suscripción ChatGPT Plus, unos USD 20 mensuales, con modelos de OpenAI desde OpenCode.
- **F-C:** OpenCode Go (USD 10 o 40 según el plan), con modelos abiertos.
- **F-D:** Claude Pro (USD 20) desde OpenCode.

**Eje V · Valorización del consumo**
- **V-A:** gasto real por ejecución en dinero (tokens por precio, conciliado con la consola).
- **V-B:** tokens por caso como medida principal; valorización a precio de lista de la API como equivalente informativo, sin representar un desembolso.

**Eje X · Estructura de X.3**
- **X-A:** desembolso incremental y costo económico (vigente).
- **X-B:** las tres partidas de la plantilla: inversión inicial, costos recurrentes del período y punto de equilibrio (no corresponde), más el costo de oportunidad de las horas en una línea.

### Análisis (trade-offs)

**Eje F**
- **F-A:** mide con los modelos del diseño aprobado, pero su costo variable (estimado por encima del tope) obliga a la regla de recorte y lleva al capítulo montos que el autor considera ajenos al proyecto.
- **F-B:** convierte un costo variable e incierto en uno fijo y conocido, y usa una suscripción que el autor ya emplea en el proyecto (Codex). Costos: cambia la familia de modelos medida, y con ella el modelo principal del criterio de éxito; la suscripción no expone un costo por ejecución, de modo que el gasto deja de conciliarse por consola y el consumo se registra en tokens desde las sesiones de OpenCode; el proveedor coincide con el del escritor del código (Codex), riesgo que ya mitiga ADR-053, porque los casos y la hoja de respuestas se verifican contra OpenCode 1.18.25 y la hoja no entra al entorno de medición.
- **F-C:** el más barato, pero los modelos abiertos del servicio no son los que usa el segmento relevado y obliga a reescribir el diseño con modelos poco documentados.
- **F-D:** conservaría la familia del diseño, pero el uso de la suscripción desde herramientas de terceros no está acreditado (suposición del ingeniero, no verificada).

**Eje V**
- **V-A:** con una suscripción no existe un costo por ejecución que medir.
- **V-B:** el token es la unidad que el consumo realmente tiene y la que ya registra la medición. La valorización a precio de lista da un orden de magnitud comparable y alimenta la valorización del Cap. I, siempre como equivalente y no como gasto.

**Eje X**
- **X-A:** la distinción es correcta pero abstracta para un proyecto sin flujo de fondos, y obliga a explicar por qué casi todo no se suma.
- **X-B:** sigue literalmente la plantilla (inversión inicial, costos recurrentes y punto de equilibrio si hay explotación) y se lee en una tabla.

### Recomendación y fundamento

**F-B + V-B + X-B.** La suscripción hace el recurso financiero fijo, conocido y coherente con las herramientas que el proyecto ya usa. El consumo se informa en la unidad que la medición registra.

**Modelos** (búsqueda del 01/10/2026, documentación de OpenAI y de OpenCode):
- **Principal: `gpt-6.1-sol`.** Disponible con ChatGPT Plus en OpenCode 1.18.25 y empleado ya por el autor. Precio de lista: USD 2,00 de entrada, 0,10 en caché y 10,00 de salida por millón de tokens.
- **Secundario más capaz: `gpt-6-astra`** (USD 10,00, 1,00 y 50,00). Responde la objeción «¿un modelo más capaz lo resuelve?». El changelog de OpenCode registra en la 1.18.29 la corrección de que GPT-6 Astra no aparecía para usuarios de suscripción, de modo que en la 1.18.25 puede no estar disponible: se verifica en el piloto y, si falta, el análisis de sensibilidad se declara perdido sin tocar el criterio principal.
- **Secundario liviano: `gpt-6-luna`** (USD 0,10, 0,01 y 0,50).

El criterio de éxito de ADR-053 (8 de 12 casos de C-2 a C-4, sin aumento de la mediana de tokens) se reenuncia sobre `gpt-6.1-sol`, sin otro cambio. Los precios de lista son de contexto corto y sirven solo para el equivalente informativo.

**Costo de hora (X.1).** Se reemplaza el salario promedio del sector de OPSSI (todas las seniorities, $21.565 por hora) por la **mediana bruta mensual de seniority junior de la encuesta de sueldos SysArmy 2026.01** ($1.538.500, diciembre de 2025 a febrero de 2026; $8.876 por hora con 173,33 h), más cercana al perfil del autor (junior, confirmado por el autor el 01/10/2026). Se descartan los honorarios de colegios profesionales (Córdoba, $26.000 a $44.200 por hora para «Analista Junior»; Jujuy, $5.294 por hora equivalente), porque miden tarifas de servicios independientes y no salarios, y son de otras provincias; el colegio de Misiones (Ley I n.º 120) no publica tabla. No se promedian. **Condición:** el autor verifica la mediana directamente en el tablero de OpenQube, porque la búsqueda la obtuvo de una reproducción (Teclab).

**Precio verificado:** ChatGPT Plus, USD 20 mensuales (OpenAI, página de precios, consulta del 01/10/2026). OpenCode admite la suscripción desde la versión 1.1.11 (`/connect` → OpenAI → ChatGPT Plus/Pro).

**X.3 propuesto (tabla):**
| Partida | Valor | Origen |
|---|---|---|
| Inversión inicial | Nula | Equipo, conexión y herramientas preexistentes o gratuitas |
| Costo recurrente del período | Suscripción ChatGPT Plus, USD 20 mensuales, durante el período (octubre y noviembre de 2026) | Página de precios de OpenAI |
| Consumo de la medición | Tokens por caso y totales por modelo, registrados en las sesiones; equivalente a precio de lista solo informativo | Diseño de la medición; precios de lista de la API |
| Horas del autor | Costo de oportunidad, en una línea, con el costo de hora de X.1 | Apartado X.1 |
| Punto de equilibrio | No corresponde: sin explotación comercial | Apartado IV.1 |

**Condiciones que invalidarían la decisión:**
1. **OpenCode 1.18.25 no acepta la suscripción** como proveedor, en la documentación o en el piloto. Se vuelve a F-A o se evalúa F-C.
2. **El piloto muestra que el modelo principal no tiene problema** (condición 1 de ADR-053, sin cambios).
3. **Los límites de uso de la suscripción impiden completar la medición** en el plazo previsto. Se reduce k en los modelos secundarios antes que tocar el principal (regla de recorte de ADR-057, reexpresada en uso y no en dinero).

### Decisión del autor

**Aceptado por el autor el 01/10/2026:** F-B + V-B + X-B, con `gpt-6.1-sol` como principal y `gpt-6-astra` y `gpt-6-luna` como secundarios, y el costo de hora de SysArmy 2026.01 (junior), con la verificación directa de la cifra a cargo del autor.

### Precisión del 01/10/2026 · tarifas congeladas (decisión del autor)

Las tarifas de valorización se **congelan** al 01/10/2026 y se aplican a toda valorización posterior (línea de base, medición final, Cap. I y cualquier repetición por terceros), aunque el proveedor las cambie o retire un modelo. Verificadas por el ingeniero en la documentación oficial de OpenAI ese día.

| Modelo | Rol | Corto: entrada / caché / salida | Largo: entrada / caché / salida |
|---|---|---|---|
| `gpt-6.1-sol` | Principal | 2,00 / 0,10 / 10,00 | 4,00 / 0,20 / 15,00 |
| `gpt-6-astra` | Secundario, mayor capacidad | 10,00 / 1,00 / 50,00 | 20,00 / 2,00 / 75,00 |
| `gpt-6-luna` | Secundario, menor capacidad | 0,10 / 0,01 / 0,50 | 0,20 / 0,02 / 0,75 |

USD por millón de tokens, nivel Standard. Contexto largo: más de 272 000 tokens de entrada por solicitud. ChatGPT Plus: USD 20 mensuales.

- **Fuente única de datos:** `01-relevamiento/linea-base/tarifas-congeladas-20261001.json` (la usan el arnés de la medición y cualquier recálculo).
- **En el informe:** Anexo I, A.I.10; X.3 remite allí en lugar de repetir los precios.
- Un cambio de tarifas posterior **no** modifica este archivo: si alguna vez se decide revalorizar, se crea un archivo nuevo con su fecha y se informan ambos valores.

### Consecuencias

**Al aceptarse:**
- **X.3:** se reescribe con la tabla de X-B. Salen el tope de USD 50, la estimación de USD 75, la carga de USD 20, la regla de recorte en dinero y los precios de Anthropic. Claude Pro se declara solo en X.4, como herramienta auxiliar sin costo atribuible.
- **X.1:** costo de hora de SysArmy 2026.01 (junior); se recalculan los valores derivados (costo de oportunidad, monto de un patrocinio por hito).
- **X.4:** Codex sobre ChatGPT Plus como escritor y redactor (ADR-067) y como proveedor de los modelos medidos.
- **ADR-057:** el eje T pasa a «reemplazado por ADR-076»; los ejes L y S siguen vigentes.
- **ADR-053:** se precisan los modelos y el control del gasto.
- **Diseño de la medición:** modelos, autenticación por suscripción en el contenedor (sin exponer credenciales al agente evaluado ni a la hoja de respuestas) y registro de tokens desde las sesiones.
- **Cap. I (Ventana del AE1):** valorización del consumo por tokens como equivalente a precio de lista.
- **Instrumento 34:** fila «Financieros» con la suscripción.
- **Anexo III:** D-48 (tope) se reemplaza; D-41 y D-49 se precisan.

### Evidencia

- `documento_de_correcciones.md` (retirado; consta en el commit `dfaf300`) (corrección del Cap. X del autor).
- ADR-053 (modelos, criterio y tokens), ADR-057 (eje T), ADR-067 (Codex sobre ChatGPT Plus).
- `informe/cap-10/X.3-recursos-financieros.md` y `X.4-recursos-tecnologicos.md`.
- Búsqueda del 01/10/2026 (precio de ChatGPT Plus, conexión de OpenCode y modelos), pendiente de incorporar.
