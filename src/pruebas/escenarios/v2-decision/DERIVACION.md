# Decisiones derivadas de las cadenas nativas

`REFERENCIA.json` conserva las cadenas capturadas con `opencode debug agent`
1.18.25, binario oficial con SHA-256 verificado. `decisiones` se escribio a mano
despues de leer esas cadenas; no se uso el evaluador copiado para obtenerlo.
Los indices tienen base cero. Se toma la ultima regla coincidente.

| Agente | Consulta | Coincidentes | Determinante | Decision |
|---|---|---|---|---|
| build | read .env | 0, 8, 9, 14 | 14 | allow |
| plan | edit src/a.js | 0, 16, 20 | 20 | allow |
| build | bash git status | 0, 16 | 16 | deny |
| build | read .env.local | 0, 8, 10 | 10 | ask |
| build | read .env.example | 0, 8, 10, 11 | 11 | allow |
| general | task a | 0 | 0 | allow |
| plan | edit .opencode/plans/x.md | 0, 16, 17, 20 | 20 | allow |
| build | question a | 0, 5, 12 | 12 | allow |

La regla 0 es `* * allow`. Para `build`, 8 es `read * allow`, 9 es
`read *.env ask`, 10 es `read *.env.* ask` y 11 es `read *.env.example allow`.
Las declaraciones globales agregan 14 (`read *.env allow`), 15 (`edit * allow`)
y 16 (`bash * deny`). `plan` tiene `edit * deny` en 16 y las declaraciones
globales en 19, 20 y 21. La consulta `question` evalua el agente: las reglas
adicionales de la sesion no interactiva se declaran como limite del analisis.

La variante `global-sin-edit.json` reemplaza la entrada global **en la copia
temporal, antes de consultar**, para RF-09 CA-2: `build` permite `edit src/a.js`
por la nativa 0 y deniega `bash git status` por la declarada 15; ninguna anula
una proteccion nativa. No cambia las cadenas de la referencia principal.
