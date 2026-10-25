# K-10: decisiones derivadas a mano

Se leen las cadenas capturadas por `opencode debug agent <agente>` del binario
1.18.25 verificado, sin ejecutar vendor ni el evaluador de RIGE.
Los indices tienen base cero. El lanzador no aporta sus reglas.

| Variante | Coincidentes (indice: sujeto, efecto; patron *) | Determinante |
|---|---|---|
| a | 0: *, allow | 0 |
| b | 0: *, allow; 14: task, deny | 14 |
| c | 0: *, allow; 13: *, allow; 15: task, deny | 15 |
| d | 0: *, allow; 13: task, ask | 13 |

En b y c, todowrite ya existe y task se agrega como deny al final.
En d, task explicita impide agregar la denegacion; su efecto es ask.
Se transcriben los coincidentes y determinantes en REFERENCIA.json; las
pruebas no vuelven a decidir a partir de la cadena.
