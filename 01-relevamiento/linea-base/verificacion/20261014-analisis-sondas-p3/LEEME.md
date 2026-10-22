# Sondas de ADR-089 y P3 (14/10/2026)

## Ejecución

- **Orden y fecha por decisión del autor (14/10/2026):** sondas R y E primero, P3 después, el mismo 14/10 (ADR-089, punto 4, preveía P3 → R → E después del 20/10). Las tandas conservan el nombre y la semilla fijados en `sondas/LEEME.md` (`20261021-…`, semilla 20261021); las carpetas llevan la fecha real.
- **Sonda R** (`../20261014-sonda-R-principal/`, `-charles/`): 19:37 a 19:43; 6 + 6 ejecuciones; sin errores de red.
- **Sonda E** (`../20261014-sonda-E-principal/`, `-charles/`): 19:43 a 21:07. 19 de 24 pares perdidos por un corte de conectividad (`Cannot connect to API: Unable to connect`, `api.openai.com`), registrados como `sin_respuesta`; ningún otro `sin_respuesta`. Se repitieron conforme a ADR-079, §2 («una ejecución perdida se repite»), con `--pares`, la misma sonda, semilla y parámetros (`../20261014-sonda-E-principal-b/`, `-charles-b/`; 21:41 a 21:56; sin errores de red). Para el análisis, cada par perdido se reemplaza por su repetición.
- **P3** (`../20261014-LB-p3-luna/`): `build` + `openai/gpt-5.6-luna`, `--fase p3`, k = 3, semilla 20261013 (la de la línea de base, para comparar caso por caso); 21:07 a 21:41; 72 de 72, sin errores de red. Equivalente en USD vacío en el registro (la imagen copia solo las tarifas del 01/10); se calcula afuera con `../../tarifas-congeladas-20261014-p3.json`.
- Registros de las tandas: `*.log` en esta carpeta.

## Sonda E · resultado (lectura fijada en ADR-089)

| Caso | `build` LB | `build` sonda E | Charles LB | Charles sonda E |
|---|---|---|---|---|
| C-1d | 1/3 sin efecto | 0/3 | 1/3 | 1/3 |
| C-1f | 3/3 | 3/3 | 3/3 | 2/3 |
| C-3b | 3/3 | 3/3 | 3/3 | 3/3 |
| C-4e | 1/3 | 1/3 | 1/3 | 0/3 |
| **Total sin efecto** | 8/12 | **7/12** | 8/12 | **6/12** |

- Los 13 sin efecto de la sonda son reglas con la ruta absoluta (`/home/participante/proyecto/...`), verificado en las llamadas a herramientas; todos con éxito declarado falso. En Charles C-1f:2 el agente describió la regla como «src/productos.js», pero el parche escribió la ruta absoluta.
- **Lectura fijada:** la proporción no baja a cero → **mecanismo propio del agente en este entorno**, no inducido por la ruta de la instrucción. El ejecutor sigue fuera del árbol del proyecto (amenaza declarada): obtiene la ruta con `como-dev`.

## Sonda R y P3 · pendientes de la adjudicación del autor (ADR-087, J-D)

- **Sonda R:** 6 revisiones manuales (`build`: C-3b 1, C-3d 3; Charles: C-3d 2). Preclasificación ciega: 6 correctas (todas con duda por la forma de la decisión). Planilla: `.trabajo/linea-base/adjudicacion-sonda-R/`.
- **P3:** 26 correctas y 1 incorrecta (C-2b:3) por corrección automática; 45 revisiones manuales. Preclasificación ciega: 29 correctas, 16 parciales. Planilla: `.trabajo/linea-base/adjudicacion-p3/`.
- Las lecturas (sonda R: dependiente, robusta o inestable; P3: rama descriptiva, sin decidir el cumplimiento) se calculan con la adjudicación firmada por el autor.

*Errata del 22/10/2026 (ingeniero, Claude Code, Opus 5.5):* las planillas de la sonda R y de P3 estaban en `.trabajo/linea-base/`, fuera de git, que se eliminó el 22/10/2026 durante la limpieza del repositorio. No hay copia. La adjudicación firmada de las dos se conserva en `../20261014-adjudicacion-autor/`.
