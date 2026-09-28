# Pasada posterior a la validación · Fase 4 · Cap. IV

- Fecha del informe: 28/09/2026
- Objeto: `informe/cap-04/IV.1-definicion-negocios.md` e `informe/cap-04/IV.3-analisis-rivalidad-amplificada.md`
- Base: ADR-030 (presupuesto), ADR-037 (plataformas, contenedor solo para el oráculo; IV-01, IV-03), P-12 (`00-gestion/revisiones/20260925-evidencia-entrevista.md`), acta del 26/09/2026 (L-11: el equipo de la referente programa en Windows)
- Aplicación: con `/corregir` (redactor), una sección por vez; cada una vuelve a «borrador».
- Estado: **aplicado el 28/09/2026**.

---

## 1. IV.1 · Definición de negocios

| # | Línea | Texto actual | Corrección | Sostén |
|---|---|---|---|---|
| F4-01 | 17 (Tabla 10, Canales, columna 2) | «…instalación local; imagen de contenedor para la ejecución por terceros; difusión…» | «…instalación local nativa y sin privilegios administrativos, que es también la vía de ejecución por terceros; difusión…» | ADR-037 (consecuencias, IV.1); cierra IV-01 |
| F4-02 | 17 (Tabla 10, Canales, columna 3) | «Fija la plataforma de acreditación de RNF-06 en Ubuntu 26.04, con ejecución por contenedor» | «Fija las plataformas de RNF-06: Ubuntu 26.04 de referencia y Windows 11, con instalación nativa; el contenedor solo reproduce el oráculo» | ADR-037 |
| F4-03 | 23 (Tabla 10, Estructura de costos) | «…con un presupuesto efectivo de 153 h (apartado V.4)…» | «…con un presupuesto efectivo de 190 h, de las cuales 136 son técnicas (apartado V.4)…» | AD-01; ADR-030; V.4, Tabla 17 |
| F4-04 | 29 | «La plataforma de acreditación de RNF-06 se fija en Ubuntu 26.04, que corresponde al entorno de desarrollo y al de la máquina virtual del instrumento de medición, y la ejecución por terceros, incluida la del prototipo v1 por la cátedra, se realiza mediante una imagen de contenedor construida sobre esa plataforma. Las restantes plataformas quedan sin acreditar en el período. El valor se incorpora a la ficha de RNF-06 del Anexo I.» | «La plataforma de referencia de RNF-06 es Ubuntu 26.04, en la que se realizan las mediciones y se regeneran los resultados de referencia, y Windows 11 constituye la segunda plataforma declarada, que es además la del equipo de la referente (acta del 26/09/2026); el desarrollo se realiza en ambas. La ejecución por terceros, incluida la comprobación del prototipo v1 por la cátedra, se realiza por instalación nativa y sin privilegios administrativos, y la imagen de contenedor queda como vía de reproducción del oráculo. macOS queda sin acreditar en el período. Los valores constan en la ficha de RNF-06 del Anexo I.» | ADR-037 (consecuencias: «Ubuntu 26.04 es la plataforma de referencia, no "el entorno de desarrollo"»); AD-12; IV-03; acta, L-11 |

Sin otros cambios en IV.1. Las demás filas de la Tabla 10 no mencionan interfaces, prioridades ni horas.

---

## 2. IV.3 · Rivalidad amplificada

| # | Línea | Texto actual | Corrección | Sostén |
|---|---|---|---|---|
| F4-05 | 31 | Última oración: «En su forma artesanal, el procedimiento incluye representaciones manuales de la arquitectura de agentes, como la registrada en la entrevista al referente (informe de la AE1, Anexo I, A.I.5); su reemplazo corresponde a la representación de relaciones (RF-13), diferida fuera del período, de modo que RIGE no sustituye esa práctica en esta etapa.» | Eliminarla. El párrafo termina en «…con un resultado verificado contra la propia herramienta.» | P-12 (aprobado el 25/09/2026) |

**Observación, sin corrección en esta pasada.** El mismo párrafo dice que el procedimiento manual «responde con la tasa de error que registre la línea de base». Con ADR-040, la línea de base se mide con agentes que ejecutan el procedimiento delegado. La frase sigue siendo verdadera, pero la línea de base ya no mide exactamente «el procedimiento manual» de una persona. No está en la lista de ADR-040 para IV.3. La dejo anotada para la pasada del grupo C, junto con I.3.

---

## 3. Qué cierra esta fase

- **Se cierran:** AD-01 (IV.1 era lo último), IV-01 e IV-03 (ADR-037) y AD-02 (ya decidido; queda aplicado).
- **Avanza:** AD-12 (falta X.2, en el Cap. X, y V.4).
- **P-12:** queda aplicado en IV.3 (AD-09).
- **Estado:** IV.1 e IV.3 vuelven a «borrador».

## 4. Elección del autor

El autor aprueba F4-01 a F4-05 (28/09/2026). Aplicadas por el redactor: IV.1 (F4-01 a F4-04) e IV.3 (F4-05). Las dos secciones quedan en «borrador». Al eliminar la oración de IV.3 se pierden las remisiones a RF-13 y a A.I.5 del AE1 en ese párrafo; no quedan huérfanas.
