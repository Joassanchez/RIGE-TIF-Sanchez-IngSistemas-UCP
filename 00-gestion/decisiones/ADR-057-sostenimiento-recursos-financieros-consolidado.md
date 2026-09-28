# ADR-057 — Sostenimiento y recursos financieros: código abierto bajo MIT sin explotación comercial, publicado tras la aprobación; gasto de API de la medición con tope de USD 50 y regla de recorte que preserva M1; asistente declarado sin costo atribuible

- Estado: aceptado (28/09/2026)
- Fecha: 28/09/2026
- Capítulos afectados: Cap. IV (IV.1, Tabla 10); Cap. X (X.3, X.4, X.5); Instrumento 34; diseño de la medición (piloto)
- Origen: consolidación del 28/09/2026 (pendiente LI-01). No es una decisión nueva: reúne ADR-025 (retroactivo) y ADR-048 (28/09/2026), ambos aceptados, con la precisión de acceso al repositorio de la revisión del Cap. X (R-02, AD-28).
- Reemplaza: ADR-025 y ADR-048. Sus archivos se eliminaron el 28/09/2026 (quedan en el historial de git).
- Relacionado: D-06 (evaluador de permisos de OpenCode bajo MIT), D-18 (sin valoración monetaria del problema), ADR-053 (medición con tres modelos), ADR-052 (horas).

### Contexto

**Del sostenimiento:**
- El proyecto es de autoría individual y no tiene una organización compradora.
- Reutiliza código MIT de OpenCode (D-06).
- Todas las alternativas del mercado son gratuitas y el costo de cambio es nulo (IV.3).

**De los recursos financieros:**
- La medición con agentes (ADR-053) introdujo un gasto real en USD, por el saldo de API.
- El autor usa Claude Code (Claude Pro, USD 20 mensuales) como asistente.
- La Guía AE2 (§7) pide declarar el origen y los supuestos de cada valor, y admite órdenes de magnitud declarados como tales.

**Del acceso al repositorio:** la Guía AE2 §2.3 exige un repositorio **privado**, con el docente como colaborador desde su creación. Por prelación, rige sobre la publicación inmediata bajo MIT.

| Paso | ADR | Qué fijó | Qué cambió después |
|---|---|---|---|
| 1 | 025 | MIT, sin costo de uso, sostenido con las horas del autor; recursos financieros nulos | 048: la medición tiene gasto real |
| 2 | 048 | Tope de API fijado antes del piloto, con regla de recorte; asistente declarado | Revisión del Cap. X: tope de USD 50, estimación a priori como complemento, asistente sin costo atribuible |
| 3 | R-02 del Cap. X | Repositorio privado; MIT después de la aprobación | — |

### Alternativas evaluadas

**Eje L · Modelo de sostenimiento**
- **L-A:** MIT, sin explotación comercial.
- **L-B:** Núcleo abierto con funciones pagas para equipos.
- **L-C:** Servicio alojado.
- **L-D:** Inversión de una empresa.

**Eje T · Gasto de API**
- **T-A:** Sin tope.
- **T-B:** Tope fijado antes del piloto, con una regla de recorte.
- **T-C:** Estimación a priori con los precios de lista.

**Eje S · Asistente de programación**
- **S-A:** No declararlo en el Cap. X.
- **S-B:** Declararlo en X.4 y tratar su costo en X.3.

### Análisis (trade-offs)

**Eje L**
- **L-B:** contradice la frontera de uso individual (L-04).
- **L-C:** contradice RNF-05 (sin conexiones salientes).
- **L-D:** exige un retorno que no hay.
- **L-A:** es coherente con un mercado gratuito y con la licencia del código reutilizado. Su costo: ningún ingreso está asegurado, y la readaptación ante cada versión de OpenCode es un costo recurrente sin financiamiento.
- **Efectos sobre el alcance:**
  - cada adaptador suma costo recurrente, lo que refuerza L-05;
  - excluye toda dependencia de costo variable, como un modelo de lenguaje;
  - hace de RNF-03 una condición del patrocinio por hito.
- **Ley N.º 27.506:** no alcanza al proyecto en el período.

**Eje T**
- **T-A:** recortaría la medición sobre la marcha, sin un criterio previo.
- **T-B:** acota el gasto y lo hace verificable, con una clave exclusiva conciliada con la consola del proveedor.
- **T-C, sola:** no reemplaza el tope, pero **lo complementa**. La Guía admite órdenes de magnitud con sus supuestos, y el argumento de D-18 no aplica a una estimación de costo declarada como tal.

**Eje S**
- **S-A:** deja al IV.1 en contradicción con la bitácora.
- **S-B:** es coherente con la declaración de herramientas. Claude Pro es una suscripción personal, anterior al TIF (paga desde julio de 2026), y la Tabla 18 no supone su uso. Por el criterio de costo incremental figura sin costo atribuible.

### Recomendación y fundamento

**L-A + T-B complementado con T-C + S-B**, con el repositorio privado hasta la aprobación. Es lo que el autor aceptó; este registro no cambia ninguna decisión.

**Condiciones que invalidarían la decisión:**
1. **Una organización ofrece financiar con condiciones sobre la licencia**, o el código reutilizado cambia a una licencia incompatible con MIT. Se reabre el eje L.
2. **La medición se financia con créditos de terceros.** El gasto de API pasa a ser un aporte de terceros y se declara como tal.
3. **Solo M1 supera el tope.** Se amplía el saldo o se reabre ADR-053. Nunca se mide con menos de lo que exige el criterio principal.

### Decisión del autor

**Aceptado por el autor el 28/09/2026** (consolidación). Las decisiones de fondo ya están aceptadas:
- ADR-025 (retroactivo);
- ADR-048, T-B + S-B, el 28/09/2026, con los ajustes de la revisión del Cap. X del mismo día;
- el paso a repositorio privado, acción del autor (AD-28).

La aceptación de este registro solo autoriza la consolidación.

### Consecuencias

**Sostenimiento:**
- RIGE es software de código abierto bajo MIT, sin costo de uso, sostenido en el período con las horas del autor.
- Después de la publicación, admite ingresos voluntarios (donaciones y patrocinio por hito).
- El repositorio es privado, con el docente como colaborador, y se publica bajo MIT después de la aprobación del TIF.
- Desde el v1, el repositorio contiene la licencia MIT y la atribución a OpenCode.
- En un repositorio privado, GitHub Actions consume minutos de la cuota del plan gratuito.

**Gasto de API (X.3):**
- **Tope total de USD 50** para la línea de base y la medición final, con una carga inicial de USD 20 para el piloto. `[DATO PENDIENTE: fecha de carga]`.
- **Estimación de orden de magnitud:**
  - Supuestos por ejecución: unos 50 mil tokens de entrada sin caché, 250 mil leídos de caché y 10 mil de salida.
  - Precios de lista del 28/09/2026: Opus 5.5 USD 4/20, Sonnet 5 2/10 y Haiku 4.5 1/5 por millón de tokens.
  - Resultado: unos USD 37 por medición con 16 casos y k = 3, y unos USD 75 entre las dos mediciones (rango de 40 a 150).
  - Lo esperable, entonces, es aplicar la regla de recorte. El piloto reemplaza la estimación por el costo medido.
- **Regla de recorte**, en orden, hasta entrar en el tope:
  1. reducir k en M2 y M3;
  2. reducir M3 y después M2 a los doce casos de C-2 a C-4;
  3. suprimir M2.

  M1 sobre los doce casos de C-2 a C-4, con el k del piloto, **no se recorta**. Se declara qué se pierde con cada recorte: sin M2 o M3 se pierde el análisis de sensibilidad («¿un modelo más capaz lo resuelve?»).
- **El gasto real:** se calcula por ejecución, con una clave exclusiva, y se concilia con la consola del proveedor. Piloto, línea de base y medición final se informan por separado.

**Asistente (X.4):** se declaran la herramienta, la función y los artefactos afectados. En X.3 figura sin costo atribuible. Después de la línea de base, el autor revisa el costo de la suscripción.

**X.3 en general:**
- dos columnas: desembolso incremental y costo económico;
- las horas (X.1), como costo de oportunidad y no como desembolso;
- no hay punto de equilibrio, porque no hay explotación comercial;
- cada cifra va en su moneda; nada se suma entre USD y pesos sin un tipo de cambio con fuente.

**IV.1, Tabla 10:** el gasto de API figura «con tope fijado antes del piloto (Capítulo X)». Se conserva «infraestructura de desarrollo sin costo».

**Instrumento 34:** una fila «Financieros» por cada costo, con las tres preguntas del precio de lista. El costo unitario va como «—» cuando no se suma.

**Anexo III:** sin cambios. D-31, D-48 y D-49 siguen siendo la deliberación del informe.

**Al aceptarse:**
- eliminar ADR-025 y 048;
- en `INDICE.md`, reemplazar sus filas por esta;
- en `pendientes.md` (AD-25), cambiar ADR-048 por ADR-057.

### Evidencia

- `informe/cap-04/IV.1-definicion-negocios.md` (Tabla 10)
- `informe/cap-04/IV.3-analisis-rivalidad-amplificada.md`
- `informe/cap-10/X.3-recursos-financieros.md` y `X.4-recursos-tecnologicos.md`
- `instrumentos/instrumento-34-recursos.md`
- `catedra/AE2-guia.md` (§2.3, §7 y §7.1)
- `00-gestion/bitacora.md` (declaración de herramientas)
- Anexo III, D-31, D-48 y D-49
- Historial de git: ADR-025 y 048
