# Muestra para la adjudicación manual del autor

Fijado por el ingeniero (Claude Code, Opus 5.5) el 05/11/2026, antes de elegir la muestra y antes de que el autor adjudique. Origen: dictamen DEV-AE2 14/2026, segunda revisión del 16/10/2026, apartado 7: «adjudicá a mano una muestra (por ejemplo, 20 de las 61) e informá la concordancia con la del agente».

## Universo

Las 61 revisiones manuales de la línea base de atribución (`verificacion/20261014-adjudicacion-autor/adjudicaciones-LB-principal-sol.csv`, 29 filas, y `adjudicaciones-LB-charles-sol.csv`, 32 filas).

## Criterio de selección

La selección lee **solo** la columna `id` de esos archivos: caso, ejecutor y repetición. No lee `resultado` ni `motivo`.

Son 20 filas en dos estratos, 10 de cada uno:

- **Estrato A, casos decisivos:** C-3b, C-3d y C-4e, 16 filas. Son los casos que deciden la rama según la lectura: el dictamen y ADR-087 nombran C-3b y C-3d por la enmienda del criterio, y ADR-084 dispuso readjudicar los tres.
- **Estrato B, resto:** 45 filas.

Dentro de cada estrato, las filas se barajan con `random.Random(20261105)`, se agrupan por caso y ejecutor, y se toma una fila por grupo, por turnos, hasta completar 10. Así la muestra no se concentra en un caso ni en un ejecutor. El guion es `elegir_muestra.py` y se puede repetir.

**Por qué no es una muestra uniforme.** Una muestra uniforme de 20 tendría pocas filas de los casos que deciden la rama, y la concordancia diría poco sobre lo que el tribunal va a preguntar. Por eso los estratos se informan **por separado**, además del total sin ponderar, que no estima las 61.

## A ciegas

El autor recibe `planilla-adjudicacion.xlsx`, con código opaco, pregunta, criterio de corrección y respuesta del agente. No ve la adjudicación previa ni el motivo, tampoco el ejecutor ni la repetición. El orden está barajado. La correspondencia entre código e identificador está en `clave-muestra.csv`, que no contiene resultados.

**Límite que se declara.** El autor no es independiente del resultado: conoce los agregados de la línea de base y aceptó el 14/10/2026 las preclasificaciones (ADR-087). La muestra evita que vea la decisión de cada fila, no que conozca el resultado general.

## Criterio de adjudicación

El vigente: el enmendado de ADR-087, el mismo con que se firmó la adjudicación. La fuente se exige en el nivel que pide la pregunta. En las preguntas de «qué regla», basta la regla determinante correcta, salvo que se la ubique en un lugar que la hoja rechaza. Una decisión escrita con otras palabras se acepta si su significado es inequívoco.

Valores: `correcta`, `parcial` o `incorrecta`, los mismos de los archivos previos.

## Quién adjudica

El autor, a mano. Ningún modelo participa en esa decisión.

## Cálculo y lectura, fijados antes de la adjudicación

`concordancia.py` compara la planilla completa con la adjudicación firmada e informa, en total y por estrato: acuerdo simple, kappa de Cohen, AC1 de Gwet, matriz de confusión y lista de discrepancias.

- **Por qué dos coeficientes.** De las 61 revisiones, la gran mayoría cae en una sola categoría. Con una categoría tan dominante, kappa puede dar bajo o quedar indefinido aunque el acuerdo sea alto. AC1 no tiene ese problema. Se informan los dos y se declara este límite.
- **Si hay discrepancias:** rige la adjudicación del autor en esas filas (ADR-087). `concordancia.py` indica si algún caso cambia de clasificación (error en al menos 2 de 3 repeticiones). Si cambia, se recalcula la rama de atribución y se declara.
- **Si el acuerdo total es menor al 85 %** (3 o más discrepancias de 20), el autor adjudica también las 41 filas restantes. El umbral es una decisión del ingeniero, sin norma externa que lo fije, y se conserva aunque el resultado resulte incómodo.
- **Si el acuerdo es de 85 % o más:** la adjudicación delegada queda acreditada para esa muestra, con los valores informados, sin extender el juicio a las 41 restantes.
