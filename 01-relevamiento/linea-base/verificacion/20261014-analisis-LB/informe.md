# Análisis de la medición

Cumplimiento del proyecto: None. Reevaluar objeto: False.

Equivalente USD: 7.859052799999998. Equivalente informativo a tarifas congeladas; no es desembolso ni inferencia estadística.

## charles|openai/gpt-6.1-sol

válida; rama: P; IV.3: {'resultado': 'Reordena', 'pendiente': ''}

Exclusiones de todos los brazos: {}

Censuradas (también las excluidas): 0

| Brazo | Caso | n | Error | Correctas | Parciales | Incorrectas | Sin respuesta | Mediana tokens | Censuradas |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| LB | C-1a | 3 | 0.0000 | 3 | 0 | 0 | 0 | 52414 | 0 |
| LB | C-1b | 3 | 0.0000 | 3 | 0 | 0 | 0 | 54984 | 0 |
| LB | C-1c | 3 | 0.0000 | 3 | 0 | 0 | 0 | 63189 | 0 |
| LB | C-1d | 3 | 0.0000 | 3 | 0 | 0 | 0 | 68617 | 0 |
| LB | C-1e | 3 | 0.0000 | 3 | 0 | 0 | 0 | 71219 | 0 |
| LB | C-1f | 3 | 0.0000 | 3 | 0 | 0 | 0 | 77985 | 0 |
| LB | C-2a | 3 | 0.0000 | 3 | 0 | 0 | 0 | 57889 | 0 |
| LB | C-2b | 3 | 0.0000 | 3 | 0 | 0 | 0 | 88143 | 0 |
| LB | C-2c | 3 | 0.0000 | 3 | 0 | 0 | 0 | 94884 | 0 |
| LB | C-2d | 3 | 0.0000 | 3 | 0 | 0 | 0 | 93751 | 0 |
| LB | C-2e | 3 | 0.0000 | 3 | 0 | 0 | 0 | 97684 | 0 |
| LB | C-2f | 3 | 0.0000 | 3 | 0 | 0 | 0 | 68280 | 0 |
| LB | C-3a | 3 | 0.0000 | 3 | 0 | 0 | 0 | 109057 | 0 |
| LB | C-3b | 3 | 1.0000 | 0 | 3 | 0 | 0 | 62212 | 0 |
| LB | C-3c | 3 | 0.0000 | 3 | 0 | 0 | 0 | 119467 | 0 |
| LB | C-3d | 3 | 1.0000 | 0 | 3 | 0 | 0 | 54479 | 0 |
| LB | C-3e | 3 | 0.0000 | 3 | 0 | 0 | 0 | 96694 | 0 |
| LB | C-3f | 3 | 0.0000 | 3 | 0 | 0 | 0 | 80325 | 0 |
| LB | C-4a | 3 | 0.3333 | 2 | 1 | 0 | 0 | 60418 | 0 |
| LB | C-4b | 3 | 0.3333 | 2 | 1 | 0 | 0 | 40330 | 0 |
| LB | C-4c | 3 | 0.0000 | 3 | 0 | 0 | 0 | 98621 | 0 |
| LB | C-4d | 3 | 0.0000 | 3 | 0 | 0 | 0 | 61784 | 0 |
| LB | C-4e | 3 | 0.6667 | 1 | 2 | 0 | 0 | 208830 | 0 |
| LB | C-4f | 3 | 0.0000 | 3 | 0 | 0 | 0 | 65536 | 0 |

Lectura: Sin criterio de cumplimiento o brazos pendientes

### Indicadores LB

| Conjunto | IB-1 agregado | Promedio tasas | Casos con problema | Nivel tokens | IB-3 | Censura |
|---|---:|---:|---:|---:|---:|---:|
| C-1 | 0.0 | 0.0 | 0 | 65903.0 | 0.0 | 0.0 |
| C-2 | 0.0 | 0.0 | 0 | 90947.0 | 0.0 | 0.0 |
| C-3 | 0.3333333333333333 | 0.3333333333333333 | 2 | 88509.5 | 0.3333333333333333 | 0.0 |
| C-4 | 0.2222222222222222 | 0.2222222222222222 | 1 | 63660.0 | 0.2222222222222222 | 0.0 |
| C-2_a_C-4 | 0.18518518518518517 | 0.1851851851851852 | 3 | 84234.0 | 0.18518518518518517 | 0.0 |

### Comparaciones descriptivas

```json
{
  "LB": {
    "por_tipo": {
      "valor": {
        "n": 36,
        "ib1": 0.0,
        "tokens": {
          "mediana": 81383.5,
          "ric": 35618.25,
          "minimo": 51679,
          "maximo": 149456
        },
        "ib2_duracion_s": {
          "mediana": 42.67690464750012,
          "ric": 17.074262923749302,
          "minimo": 29.707609299999604,
          "maximo": 157.2966008520002
        },
        "ib4_archivos": {
          "mediana": 7.5,
          "ric": 4.0,
          "minimo": 3,
          "maximo": 11
        },
        "ib4_herramientas": {
          "mediana": 10.0,
          "ric": 3.0,
          "minimo": 6,
          "maximo": 17
        },
        "costo_usd": 2.0988867999999994
      },
      "permiso": {
        "n": 36,
        "ib1": 0.2777777777777778,
        "tokens": {
          "mediana": 62696.5,
          "ric": 26304.5,
          "minimo": 29696,
          "maximo": 265860
        },
        "ib2_duracion_s": {
          "mediana": 38.50632704700001,
          "ric": 13.992992643750085,
          "minimo": 24.923597579999296,
          "maximo": 103.19333591299983
        },
        "ib4_archivos": {
          "mediana": 5.0,
          "ric": 3.0,
          "minimo": 2,
          "maximo": 11
        },
        "ib4_herramientas": {
          "mediana": 9.0,
          "ric": 3.0,
          "minimo": 4,
          "maximo": 18
        },
        "costo_usd": 1.9157636000000002
      }
    },
    "pares": {
      "C-3d/C-4c": {
        "C-3d": {
          "n": 3,
          "ib1": 1.0,
          "tokens": {
            "mediana": 54479,
            "ric": 7182.5,
            "minimo": 47431,
            "maximo": 61796
          },
          "ib2_duracion_s": {
            "mediana": 32.75069250700017,
            "ric": 10.435228678500152,
            "minimo": 27.99274301999958,
            "maximo": 48.863200376999885
          },
          "ib4_archivos": {
            "mediana": 3,
            "ric": 0.5,
            "minimo": 2,
            "maximo": 3
          },
          "ib4_herramientas": {
            "mediana": 5,
            "ric": 0.5,
            "minimo": 5,
            "maximo": 6
          },
          "costo_usd": 0.13246639999999998
        },
        "C-4c": {
          "n": 3,
          "ib1": 0.0,
          "tokens": {
            "mediana": 98621,
            "ric": 36134.5,
            "minimo": 46287,
            "maximo": 118556
          },
          "ib2_duracion_s": {
            "mediana": 46.739951995999945,
            "ric": 7.570703190000131,
            "minimo": 33.807474410000395,
            "maximo": 48.94888079000066
          },
          "ib4_archivos": {
            "mediana": 5,
            "ric": 1.0,
            "minimo": 5,
            "maximo": 7
          },
          "ib4_herramientas": {
            "mediana": 9,
            "ric": 0.5,
            "minimo": 9,
            "maximo": 10
          },
          "costo_usd": 0.1488304
        }
      },
      "C-4a/C-4b": {
        "C-4a": {
          "n": 3,
          "ib1": 0.3333333333333333,
          "tokens": {
            "mediana": 60418,
            "ric": 25297.5,
            "minimo": 29696,
            "maximo": 80291
          },
          "ib2_duracion_s": {
            "mediana": 30.749897544000305,
            "ric": 6.150149478499998,
            "minimo": 27.342138558999977,
            "maximo": 39.64243751599997
          },
          "ib4_archivos": {
            "mediana": 5,
            "ric": 1.0,
            "minimo": 3,
            "maximo": 5
          },
          "ib4_herramientas": {
            "mediana": 7,
            "ric": 2.0,
            "minimo": 4,
            "maximo": 8
          },
          "costo_usd": 0.168426
        },
        "C-4b": {
          "n": 3,
          "ib1": 0.3333333333333333,
          "tokens": {
            "mediana": 40330,
            "ric": 4610.5,
            "minimo": 35389,
            "maximo": 44610
          },
          "ib2_duracion_s": {
            "mediana": 31.199953908999305,
            "ric": 6.2479031065004165,
            "minimo": 24.923597579999296,
            "maximo": 37.41940379300013
          },
          "ib4_archivos": {
            "mediana": 5,
            "ric": 1.0,
            "minimo": 3,
            "maximo": 5
          },
          "ib4_herramientas": {
            "mediana": 8,
            "ric": 2.0,
            "minimo": 5,
            "maximo": 9
          },
          "costo_usd": 0.1190516
        }
      }
    },
    "introspeccion_vs_acierto": {
      "True": {
        "n": 72,
        "ib1": 0.1388888888888889,
        "tokens": {
          "mediana": 68765.5,
          "ric": 38937.75,
          "minimo": 29696,
          "maximo": 265860
        },
        "ib2_duracion_s": {
          "mediana": 41.11719426050013,
          "ric": 15.245920545500326,
          "minimo": 24.923597579999296,
          "maximo": 157.2966008520002
        },
        "ib4_archivos": {
          "mediana": 6.0,
          "ric": 3.0,
          "minimo": 2,
          "maximo": 11
        },
        "ib4_herramientas": {
          "mediana": 9.0,
          "ric": 4.0,
          "minimo": 4,
          "maximo": 18
        },
        "costo_usd": 4.0146504
      },
      "False": {
        "n": 0,
        "ib1": null,
        "tokens": {
          "mediana": null,
          "ric": null,
          "minimo": null,
          "maximo": null
        },
        "ib2_duracion_s": {
          "mediana": null,
          "ric": null,
          "minimo": null,
          "maximo": null
        },
        "ib4_archivos": {
          "mediana": null,
          "ric": null,
          "minimo": null,
          "maximo": null
        },
        "ib4_herramientas": {
          "mediana": null,
          "ric": null,
          "minimo": null,
          "maximo": null
        },
        "costo_usd": 0
      }
    },
    "fuente_observada": {
      "comando_nativo": {
        "n": 72,
        "ib1": 0.1388888888888889,
        "tokens": {
          "mediana": 68765.5,
          "ric": 38937.75,
          "minimo": 29696,
          "maximo": 265860
        },
        "ib2_duracion_s": {
          "mediana": 41.11719426050013,
          "ric": 15.245920545500326,
          "minimo": 24.923597579999296,
          "maximo": 157.2966008520002
        },
        "ib4_archivos": {
          "mediana": 6.0,
          "ric": 3.0,
          "minimo": 2,
          "maximo": 11
        },
        "ib4_herramientas": {
          "mediana": 9.0,
          "ric": 4.0,
          "minimo": 4,
          "maximo": 18
        },
        "costo_usd": 4.0146504
      },
      "documentacion": {
        "n": 72,
        "ib1": 0.1388888888888889,
        "tokens": {
          "mediana": 68765.5,
          "ric": 38937.75,
          "minimo": 29696,
          "maximo": 265860
        },
        "ib2_duracion_s": {
          "mediana": 41.11719426050013,
          "ric": 15.245920545500326,
          "minimo": 24.923597579999296,
          "maximo": 157.2966008520002
        },
        "ib4_archivos": {
          "mediana": 6.0,
          "ric": 3.0,
          "minimo": 2,
          "maximo": 11
        },
        "ib4_herramientas": {
          "mediana": 9.0,
          "ric": 4.0,
          "minimo": 4,
          "maximo": 18
        },
        "costo_usd": 4.0146504
      },
      "ejecucion": {
        "n": 21,
        "ib1": 0.0,
        "tokens": {
          "mediana": 90368,
          "ric": 35534.0,
          "minimo": 35389,
          "maximo": 208830
        },
        "ib2_duracion_s": {
          "mediana": 48.19627840599969,
          "ric": 13.126094549999834,
          "minimo": 24.923597579999296,
          "maximo": 85.15341367499968
        },
        "ib4_archivos": {
          "mediana": 5,
          "ric": 3.0,
          "minimo": 3,
          "maximo": 11
        },
        "ib4_herramientas": {
          "mediana": 9,
          "ric": 4.0,
          "minimo": 6,
          "maximo": 18
        },
        "costo_usd": 1.2024788000000002
      }
    },
    "documentacion": {
      "De forma incorrecta": {
        "n": 3,
        "ib1": 1.0,
        "tokens": {
          "mediana": 62212,
          "ric": 15769.5,
          "minimo": 33672,
          "maximo": 65211
        },
        "ib2_duracion_s": {
          "mediana": 45.612602399000025,
          "ric": 21.125552408500425,
          "minimo": 33.00290109099933,
          "maximo": 75.25400590800018
        },
        "ib4_archivos": {
          "mediana": 3,
          "ric": 0.5,
          "minimo": 3,
          "maximo": 4
        },
        "ib4_herramientas": {
          "mediana": 6,
          "ric": 1.5,
          "minimo": 4,
          "maximo": 7
        },
        "costo_usd": 0.103814
      },
      "No": {
        "n": 6,
        "ib1": 0.16666666666666666,
        "tokens": {
          "mediana": 52556.5,
          "ric": 39833.0,
          "minimo": 35389,
          "maximo": 99154
        },
        "ib2_duracion_s": {
          "mediana": 35.980326913,
          "ric": 8.380093539500535,
          "minimo": 24.923597579999296,
          "maximo": 42.903218641999956
        },
        "ib4_archivos": {
          "mediana": 6.0,
          "ric": 2.75,
          "minimo": 3,
          "maximo": 9
        },
        "ib4_herramientas": {
          "mediana": 9.5,
          "ric": 3.25,
          "minimo": 5,
          "maximo": 12
        },
        "costo_usd": 0.26566439999999997
      },
      "Parcialmente": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 57889,
          "ric": 8291.0,
          "minimo": 57149,
          "maximo": 73731
        },
        "ib2_duracion_s": {
          "mediana": 41.70510998700047,
          "ric": 14.492341389000103,
          "minimo": 36.57041392200017,
          "maximo": 65.55509670000038
        },
        "ib4_archivos": {
          "mediana": 7,
          "ric": 2.5,
          "minimo": 3,
          "maximo": 8
        },
        "ib4_herramientas": {
          "mediana": 9,
          "ric": 2.0,
          "minimo": 6,
          "maximo": 10
        },
        "costo_usd": 0.1590228
      },
      "Sí": {
        "n": 21,
        "ib1": 0.047619047619047616,
        "tokens": {
          "mediana": 63189,
          "ric": 35861.0,
          "minimo": 29696,
          "maximo": 149456
        },
        "ib2_duracion_s": {
          "mediana": 39.64243751599997,
          "ric": 20.25278270300032,
          "minimo": 26.066637940999954,
          "maximo": 157.2966008520002
        },
        "ib4_archivos": {
          "mediana": 5,
          "ric": 2.0,
          "minimo": 3,
          "maximo": 10
        },
        "ib4_herramientas": {
          "mediana": 9,
          "ric": 2.0,
          "minimo": 4,
          "maximo": 17
        },
        "costo_usd": 1.1902188000000002
      },
      "Sí (`vm/docs/config.html`, «Env vars»: una variable no definida se sustituye por cadena vacía)": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 96694,
          "ric": 10735.0,
          "minimo": 90368,
          "maximo": 111838
        },
        "ib2_duracion_s": {
          "mediana": 49.04933151400019,
          "ric": 5.643265377500256,
          "minimo": 42.281819831999655,
          "maximo": 53.56835058700017
        },
        "ib4_archivos": {
          "mediana": 8,
          "ric": 1.5,
          "minimo": 6,
          "maximo": 9
        },
        "ib4_herramientas": {
          "mediana": 12,
          "ric": 1.5,
          "minimo": 10,
          "maximo": 13
        },
        "costo_usd": 0.17833919999999998
      },
      "Sí (`vm/docs/config.html`, «Precedence order»: configuración en línea después del proyecto)": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 97684,
          "ric": 17794.5,
          "minimo": 63134,
          "maximo": 98723
        },
        "ib2_duracion_s": {
          "mediana": 48.19627840599969,
          "ric": 10.730561384499879,
          "minimo": 38.72516911799994,
          "maximo": 60.1862918869997
        },
        "ib4_archivos": {
          "mediana": 4,
          "ric": 0.5,
          "minimo": 3,
          "maximo": 4
        },
        "ib4_herramientas": {
          "mediana": 8,
          "ric": 1.0,
          "minimo": 7,
          "maximo": 9
        },
        "costo_usd": 0.21010440000000002
      },
      "Sí (`vm/docs/config.html`, «Precedence order»: global → archivo indicado por variable → proyecto)": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 68280,
          "ric": 28407.5,
          "minimo": 65120,
          "maximo": 121935
        },
        "ib2_duracion_s": {
          "mediana": 33.97044248899965,
          "ric": 2.802040273500097,
          "minimo": 33.58740931199918,
          "maximo": 39.191489858999375
        },
        "ib4_archivos": {
          "mediana": 8,
          "ric": 1.0,
          "minimo": 8,
          "maximo": 10
        },
        "ib4_herramientas": {
          "mediana": 10,
          "ric": 1.5,
          "minimo": 9,
          "maximo": 12
        },
        "costo_usd": 0.1738764
      },
      "[VERIFICAR contra `vm/docs/` y el manual embebido en la fase 2]": {
        "n": 15,
        "ib1": 0.2,
        "tokens": {
          "mediana": 71514,
          "ric": 38929.0,
          "minimo": 46287,
          "maximo": 118556
        },
        "ib2_duracion_s": {
          "mediana": 42.45059065300029,
          "ric": 13.459430418999546,
          "minimo": 27.99274301999958,
          "maximo": 67.15509038399978
        },
        "ib4_archivos": {
          "mediana": 5,
          "ric": 2.0,
          "minimo": 2,
          "maximo": 11
        },
        "ib4_herramientas": {
          "mediana": 9,
          "ric": 2.5,
          "minimo": 5,
          "maximo": 15
        },
        "costo_usd": 0.7693836
      },
      "[VERIFICAR el descarte de `OPENCODE_PERMISSION` inválida contra `vm/docs/` y el manual embebido en la fase 2]": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 65536,
          "ric": 2456.5,
          "minimo": 64001,
          "maximo": 68914
        },
        "ib2_duracion_s": {
          "mediana": 35.40779481399977,
          "ric": 5.90764319300024,
          "minimo": 34.8616938199998,
          "maximo": 46.67698020600028
        },
        "ib4_archivos": {
          "mediana": 7,
          "ric": 0.5,
          "minimo": 6,
          "maximo": 7
        },
        "ib4_herramientas": {
          "mediana": 9,
          "ric": 0.5,
          "minimo": 9,
          "maximo": 10
        },
        "costo_usd": 0.1928924
      },
      "[VERIFICAR el nombre global `config.json` contra `vm/docs/` y el manual embebido en la fase 2; la regla de lectura está documentada]": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 77985,
          "ric": 15919.5,
          "minimo": 48701,
          "maximo": 80540
        },
        "ib2_duracion_s": {
          "mediana": 44.07553976899999,
          "ric": 12.127959937000014,
          "minimo": 30.28420205099974,
          "maximo": 54.54012192499977
        },
        "ib4_archivos": {
          "mediana": 9,
          "ric": 2.5,
          "minimo": 5,
          "maximo": 10
        },
        "ib4_herramientas": {
          "mediana": 12,
          "ric": 3.0,
          "minimo": 7,
          "maximo": 13
        },
        "costo_usd": 0.1559864
      },
      "[VERIFICAR la carga de `.opencode/opencode.json` contra `vm/docs/` y el manual embebido en la fase 2]": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 71219,
          "ric": 4823.0,
          "minimo": 64978,
          "maximo": 74624
        },
        "ib2_duracion_s": {
          "mediana": 34.83157727700018,
          "ric": 2.5580419450006957,
          "minimo": 34.09144341799947,
          "maximo": 39.20752730800086
        },
        "ib4_archivos": {
          "mediana": 9,
          "ric": 0.0,
          "minimo": 9,
          "maximo": 9
        },
        "ib4_herramientas": {
          "mediana": 12,
          "ric": 1.5,
          "minimo": 10,
          "maximo": 13
        },
        "costo_usd": 0.1548596
      },
      "[VERIFICAR la herencia de denegaciones del padre contra `vm/docs/` y el manual embebido en la fase 2]": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 80325,
          "ric": 105081.0,
          "minimo": 55698,
          "maximo": 265860
        },
        "ib2_duracion_s": {
          "mediana": 43.47794712900031,
          "ric": 22.372905021500173,
          "minimo": 35.026306179999665,
          "maximo": 79.77211622300001
        },
        "ib4_archivos": {
          "mediana": 6,
          "ric": 2.5,
          "minimo": 3,
          "maximo": 8
        },
        "ib4_herramientas": {
          "mediana": 10,
          "ric": 4.0,
          "minimo": 6,
          "maximo": 14
        },
        "costo_usd": 0.21890520000000002
      },
      "[VERIFICAR la posición intermedia de `OPENCODE_PERMISSION` contra `vm/docs/` y el manual embebido en la fase 2]": {
        "n": 3,
        "ib1": 0.6666666666666666,
        "tokens": {
          "mediana": 208830,
          "ric": 60546.0,
          "minimo": 106908,
          "maximo": 228000
        },
        "ib2_duracion_s": {
          "mediana": 85.15341367499968,
          "ric": 25.22016602949998,
          "minimo": 52.75300385399987,
          "maximo": 103.19333591299983
        },
        "ib4_archivos": {
          "mediana": 10,
          "ric": 0.5,
          "minimo": 10,
          "maximo": 11
        },
        "ib4_herramientas": {
          "mediana": 17,
          "ric": 2.5,
          "minimo": 13,
          "maximo": 18
        },
        "costo_usd": 0.2415832
      }
    },
    "cobertura_disponible": "[DATO PENDIENTE: completar etiquetas con evidencia antes del piloto; no inferir desde fuente observada]",
    "totales": {
      "n": 72,
      "ib1": 0.1388888888888889,
      "tokens": {
        "mediana": 68765.5,
        "ric": 38937.75,
        "minimo": 29696,
        "maximo": 265860
      },
      "ib2_duracion_s": {
        "mediana": 41.11719426050013,
        "ric": 15.245920545500326,
        "minimo": 24.923597579999296,
        "maximo": 157.2966008520002
      },
      "ib4_archivos": {
        "mediana": 6.0,
        "ric": 3.0,
        "minimo": 2,
        "maximo": 11
      },
      "ib4_herramientas": {
        "mediana": 9.0,
        "ric": 4.0,
        "minimo": 4,
        "maximo": 18
      },
      "costo_usd": 4.0146504
    }
  }
}
```

## principal|openai/gpt-6.1-sol

válida; rama: P; IV.3: {'resultado': 'Reordena', 'pendiente': ''}

Exclusiones de todos los brazos: {}

Censuradas (también las excluidas): 0

| Brazo | Caso | n | Error | Correctas | Parciales | Incorrectas | Sin respuesta | Mediana tokens | Censuradas |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| LB | C-1a | 3 | 0.0000 | 3 | 0 | 0 | 0 | 61871 | 0 |
| LB | C-1b | 3 | 0.0000 | 3 | 0 | 0 | 0 | 68687 | 0 |
| LB | C-1c | 3 | 0.0000 | 3 | 0 | 0 | 0 | 64670 | 0 |
| LB | C-1d | 3 | 0.0000 | 3 | 0 | 0 | 0 | 50316 | 0 |
| LB | C-1e | 3 | 0.0000 | 3 | 0 | 0 | 0 | 53448 | 0 |
| LB | C-1f | 3 | 0.0000 | 3 | 0 | 0 | 0 | 61438 | 0 |
| LB | C-2a | 3 | 0.0000 | 3 | 0 | 0 | 0 | 59451 | 0 |
| LB | C-2b | 3 | 0.0000 | 3 | 0 | 0 | 0 | 52599 | 0 |
| LB | C-2c | 3 | 0.0000 | 3 | 0 | 0 | 0 | 86769 | 0 |
| LB | C-2d | 3 | 0.0000 | 3 | 0 | 0 | 0 | 72541 | 0 |
| LB | C-2e | 3 | 0.0000 | 3 | 0 | 0 | 0 | 42307 | 0 |
| LB | C-2f | 3 | 0.0000 | 3 | 0 | 0 | 0 | 68415 | 0 |
| LB | C-3a | 3 | 0.0000 | 3 | 0 | 0 | 0 | 75186 | 0 |
| LB | C-3b | 3 | 1.0000 | 0 | 3 | 0 | 0 | 42865 | 0 |
| LB | C-3c | 3 | 0.0000 | 3 | 0 | 0 | 0 | 65669 | 0 |
| LB | C-3d | 3 | 0.3333 | 2 | 1 | 0 | 0 | 43950 | 0 |
| LB | C-3e | 3 | 0.0000 | 3 | 0 | 0 | 0 | 66224 | 0 |
| LB | C-3f | 3 | 0.0000 | 3 | 0 | 0 | 0 | 63023 | 0 |
| LB | C-4a | 3 | 0.0000 | 3 | 0 | 0 | 0 | 61741 | 0 |
| LB | C-4b | 3 | 0.0000 | 3 | 0 | 0 | 0 | 70459 | 0 |
| LB | C-4c | 3 | 0.0000 | 3 | 0 | 0 | 0 | 72571 | 0 |
| LB | C-4d | 3 | 0.0000 | 3 | 0 | 0 | 0 | 60988 | 0 |
| LB | C-4e | 3 | 0.0000 | 3 | 0 | 0 | 0 | 79169 | 0 |
| LB | C-4f | 3 | 0.0000 | 3 | 0 | 0 | 0 | 46015 | 0 |

Lectura: Sin criterio de cumplimiento o brazos pendientes

### Indicadores LB

| Conjunto | IB-1 agregado | Promedio tasas | Casos con problema | Nivel tokens | IB-3 | Censura |
|---|---:|---:|---:|---:|---:|---:|
| C-1 | 0.0 | 0.0 | 0 | 61654.5 | 0.0 | 0.0 |
| C-2 | 0.0 | 0.0 | 0 | 63933.0 | 0.0 | 0.0 |
| C-3 | 0.2222222222222222 | 0.2222222222222222 | 1 | 64346.0 | 0.2222222222222222 | 0.0 |
| C-4 | 0.0 | 0.0 | 0 | 66100.0 | 0.0 | 0.0 |
| C-2_a_C-4 | 0.07407407407407407 | 0.07407407407407407 | 1 | 64346.0 | 0.07407407407407407 | 0.0 |

### Comparaciones descriptivas

```json
{
  "LB": {
    "por_tipo": {
      "valor": {
        "n": 36,
        "ib1": 0.0,
        "tokens": {
          "mediana": 63714.0,
          "ric": 20077.75,
          "minimo": 36230,
          "maximo": 162994
        },
        "ib2_duracion_s": {
          "mediana": 33.20347677050006,
          "ric": 9.138667882500044,
          "minimo": 23.896661238999968,
          "maximo": 53.85492670299982
        },
        "ib4_archivos": {
          "mediana": 5.5,
          "ric": 4.0,
          "minimo": 1,
          "maximo": 13
        },
        "ib4_herramientas": {
          "mediana": 11.5,
          "ric": 4.25,
          "minimo": 5,
          "maximo": 17
        },
        "costo_usd": 1.8668796
      },
      "permiso": {
        "n": 36,
        "ib1": 0.1111111111111111,
        "tokens": {
          "mediana": 62382.0,
          "ric": 22723.75,
          "minimo": 31605,
          "maximo": 101506
        },
        "ib2_duracion_s": {
          "mediana": 33.72530862050007,
          "ric": 11.106550456749915,
          "minimo": 21.264662029999954,
          "maximo": 58.14182977099995
        },
        "ib4_archivos": {
          "mediana": 3.0,
          "ric": 3.0,
          "minimo": 1,
          "maximo": 7
        },
        "ib4_herramientas": {
          "mediana": 9.0,
          "ric": 4.0,
          "minimo": 5,
          "maximo": 14
        },
        "costo_usd": 1.9775228
      }
    },
    "pares": {
      "C-3d/C-4c": {
        "C-3d": {
          "n": 3,
          "ib1": 0.3333333333333333,
          "tokens": {
            "mediana": 43950,
            "ric": 16035.5,
            "minimo": 31605,
            "maximo": 63676
          },
          "ib2_duracion_s": {
            "mediana": 28.93051668299995,
            "ric": 4.273507650499937,
            "minimo": 24.01054625000006,
            "maximo": 32.557561550999935
          },
          "ib4_archivos": {
            "mediana": 2,
            "ric": 2.5,
            "minimo": 1,
            "maximo": 6
          },
          "ib4_herramientas": {
            "mediana": 8,
            "ric": 3.0,
            "minimo": 6,
            "maximo": 12
          },
          "costo_usd": 0.1584796
        },
        "C-4c": {
          "n": 3,
          "ib1": 0.0,
          "tokens": {
            "mediana": 72571,
            "ric": 6903.5,
            "minimo": 61648,
            "maximo": 75455
          },
          "ib2_duracion_s": {
            "mediana": 33.49343331,
            "ric": 6.316789324000013,
            "minimo": 31.044440370999837,
            "maximo": 43.67801901899986
          },
          "ib4_archivos": {
            "mediana": 4,
            "ric": 1.0,
            "minimo": 2,
            "maximo": 4
          },
          "ib4_herramientas": {
            "mediana": 11,
            "ric": 1.0,
            "minimo": 9,
            "maximo": 11
          },
          "costo_usd": 0.18904720000000003
        }
      },
      "C-4a/C-4b": {
        "C-4a": {
          "n": 3,
          "ib1": 0.0,
          "tokens": {
            "mediana": 61741,
            "ric": 16013.5,
            "minimo": 38721,
            "maximo": 70748
          },
          "ib2_duracion_s": {
            "mediana": 35.46090518799997,
            "ric": 3.6240519855000457,
            "minimo": 30.728331111999978,
            "maximo": 37.97643508300007
          },
          "ib4_archivos": {
            "mediana": 3,
            "ric": 2.0,
            "minimo": 1,
            "maximo": 5
          },
          "ib4_herramientas": {
            "mediana": 8,
            "ric": 2.5,
            "minimo": 7,
            "maximo": 12
          },
          "costo_usd": 0.1100296
        },
        "C-4b": {
          "n": 3,
          "ib1": 0.0,
          "tokens": {
            "mediana": 70459,
            "ric": 5192.0,
            "minimo": 60379,
            "maximo": 70763
          },
          "ib2_duracion_s": {
            "mediana": 43.36430782100024,
            "ric": 7.6771026809998375,
            "minimo": 34.82374546200003,
            "maximo": 50.17795082399971
          },
          "ib4_archivos": {
            "mediana": 4,
            "ric": 1.0,
            "minimo": 4,
            "maximo": 6
          },
          "ib4_herramientas": {
            "mediana": 12,
            "ric": 1.0,
            "minimo": 10,
            "maximo": 12
          },
          "costo_usd": 0.2161444
        }
      }
    },
    "introspeccion_vs_acierto": {
      "True": {
        "n": 63,
        "ib1": 0.06349206349206349,
        "tokens": {
          "mediana": 62758,
          "ric": 19627.5,
          "minimo": 31605,
          "maximo": 162994
        },
        "ib2_duracion_s": {
          "mediana": 33.80936547100009,
          "ric": 9.13201988600008,
          "minimo": 24.01054625000006,
          "maximo": 58.14182977099995
        },
        "ib4_archivos": {
          "mediana": 4,
          "ric": 4.0,
          "minimo": 1,
          "maximo": 13
        },
        "ib4_herramientas": {
          "mediana": 11,
          "ric": 4.0,
          "minimo": 5,
          "maximo": 17
        },
        "costo_usd": 3.3705716
      },
      "False": {
        "n": 9,
        "ib1": 0.0,
        "tokens": {
          "mediana": 64670,
          "ric": 24130.0,
          "minimo": 42425,
          "maximo": 96541
        },
        "ib2_duracion_s": {
          "mediana": 26.98549839899988,
          "ric": 11.258480082000005,
          "minimo": 21.264662029999954,
          "maximo": 39.78781515699984
        },
        "ib4_archivos": {
          "mediana": 5,
          "ric": 4.0,
          "minimo": 2,
          "maximo": 10
        },
        "ib4_herramientas": {
          "mediana": 7,
          "ric": 5.0,
          "minimo": 6,
          "maximo": 15
        },
        "costo_usd": 0.4738308
      }
    },
    "fuente_observada": {
      "comando_nativo": {
        "n": 63,
        "ib1": 0.06349206349206349,
        "tokens": {
          "mediana": 62758,
          "ric": 19627.5,
          "minimo": 31605,
          "maximo": 162994
        },
        "ib2_duracion_s": {
          "mediana": 33.80936547100009,
          "ric": 9.13201988600008,
          "minimo": 24.01054625000006,
          "maximo": 58.14182977099995
        },
        "ib4_archivos": {
          "mediana": 4,
          "ric": 4.0,
          "minimo": 1,
          "maximo": 13
        },
        "ib4_herramientas": {
          "mediana": 11,
          "ric": 4.0,
          "minimo": 5,
          "maximo": 17
        },
        "costo_usd": 3.3705716
      },
      "documentacion": {
        "n": 67,
        "ib1": 0.05970149253731343,
        "tokens": {
          "mediana": 63753,
          "ric": 19762.0,
          "minimo": 31605,
          "maximo": 162994
        },
        "ib2_duracion_s": {
          "mediana": 33.80936547100009,
          "ric": 9.146861462000174,
          "minimo": 21.264662029999954,
          "maximo": 58.14182977099995
        },
        "ib4_archivos": {
          "mediana": 4,
          "ric": 4.0,
          "minimo": 1,
          "maximo": 13
        },
        "ib4_herramientas": {
          "mediana": 11,
          "ric": 4.0,
          "minimo": 5,
          "maximo": 17
        },
        "costo_usd": 3.6404259999999997
      },
      "ejecucion": {
        "n": 63,
        "ib1": 0.015873015873015872,
        "tokens": {
          "mediana": 62758,
          "ric": 19739.0,
          "minimo": 31605,
          "maximo": 162994
        },
        "ib2_duracion_s": {
          "mediana": 33.12117768799999,
          "ric": 9.315937430499844,
          "minimo": 21.264662029999954,
          "maximo": 58.14182977099995
        },
        "ib4_archivos": {
          "mediana": 5,
          "ric": 5.0,
          "minimo": 1,
          "maximo": 13
        },
        "ib4_herramientas": {
          "mediana": 11,
          "ric": 4.0,
          "minimo": 5,
          "maximo": 17
        },
        "costo_usd": 3.3439956
      },
      "skill_fabricante": {
        "n": 55,
        "ib1": 0.01818181818181818,
        "tokens": {
          "mediana": 64670,
          "ric": 16946.5,
          "minimo": 31605,
          "maximo": 162994
        },
        "ib2_duracion_s": {
          "mediana": 33.49343331,
          "ric": 9.582546911000122,
          "minimo": 21.264662029999954,
          "maximo": 53.85492670299982
        },
        "ib4_archivos": {
          "mediana": 4,
          "ric": 4.5,
          "minimo": 1,
          "maximo": 13
        },
        "ib4_herramientas": {
          "mediana": 11,
          "ric": 4.0,
          "minimo": 6,
          "maximo": 17
        },
        "costo_usd": 3.0562736000000004
      }
    },
    "documentacion": {
      "De forma incorrecta": {
        "n": 3,
        "ib1": 1.0,
        "tokens": {
          "mediana": 42865,
          "ric": 21898.0,
          "minimo": 39980,
          "maximo": 83776
        },
        "ib2_duracion_s": {
          "mediana": 34.273081162999915,
          "ric": 16.48706633949996,
          "minimo": 25.167697092000026,
          "maximo": 58.14182977099995
        },
        "ib4_archivos": {
          "mediana": 2,
          "ric": 1.5,
          "minimo": 2,
          "maximo": 5
        },
        "ib4_herramientas": {
          "mediana": 6,
          "ric": 2.0,
          "minimo": 5,
          "maximo": 9
        },
        "costo_usd": 0.1548708
      },
      "No": {
        "n": 6,
        "ib1": 0.0,
        "tokens": {
          "mediana": 65419.0,
          "ric": 16143.0,
          "minimo": 42922,
          "maximo": 162994
        },
        "ib2_duracion_s": {
          "mediana": 41.3581593345001,
          "ric": 12.301098250000038,
          "minimo": 29.14789428799986,
          "maximo": 50.17795082399971
        },
        "ib4_archivos": {
          "mediana": 7.0,
          "ric": 5.75,
          "minimo": 4,
          "maximo": 13
        },
        "ib4_herramientas": {
          "mediana": 12.0,
          "ric": 3.0,
          "minimo": 10,
          "maximo": 17
        },
        "costo_usd": 0.4348592
      },
      "Parcialmente": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 59451,
          "ric": 3286.5,
          "minimo": 56185,
          "maximo": 62758
        },
        "ib2_duracion_s": {
          "mediana": 32.76184024100007,
          "ric": 5.664507876500011,
          "minimo": 30.425159403999942,
          "maximo": 41.75417515699996
        },
        "ib4_archivos": {
          "mediana": 4,
          "ric": 3.0,
          "minimo": 1,
          "maximo": 7
        },
        "ib4_herramientas": {
          "mediana": 10,
          "ric": 2.0,
          "minimo": 8,
          "maximo": 12
        },
        "costo_usd": 0.1296472
      },
      "Sí": {
        "n": 21,
        "ib1": 0.0,
        "tokens": {
          "mediana": 64670,
          "ric": 18293.0,
          "minimo": 38721,
          "maximo": 96541
        },
        "ib2_duracion_s": {
          "mediana": 33.80936547100009,
          "ric": 6.910921396000049,
          "minimo": 21.264662029999954,
          "maximo": 43.26158828400003
        },
        "ib4_archivos": {
          "mediana": 4,
          "ric": 2.0,
          "minimo": 1,
          "maximo": 10
        },
        "ib4_herramientas": {
          "mediana": 10,
          "ric": 4.0,
          "minimo": 6,
          "maximo": 15
        },
        "costo_usd": 0.9942
      },
      "Sí (`vm/docs/config.html`, «Env vars»: una variable no definida se sustituye por cadena vacía)": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 66224,
          "ric": 12970.0,
          "minimo": 58958,
          "maximo": 84898
        },
        "ib2_duracion_s": {
          "mediana": 36.55297306300008,
          "ric": 4.309696212000006,
          "minimo": 31.959688303999997,
          "maximo": 40.57908072800001
        },
        "ib4_archivos": {
          "mediana": 6,
          "ric": 1.5,
          "minimo": 4,
          "maximo": 7
        },
        "ib4_herramientas": {
          "mediana": 11,
          "ric": 0.5,
          "minimo": 11,
          "maximo": 12
        },
        "costo_usd": 0.1492016
      },
      "Sí (`vm/docs/config.html`, «Precedence order»: configuración en línea después del proyecto)": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 42307,
          "ric": 8794.5,
          "minimo": 36230,
          "maximo": 53819
        },
        "ib2_duracion_s": {
          "mediana": 26.16896875700013,
          "ric": 1.5374977149998017,
          "minimo": 24.59298784400005,
          "maximo": 27.667983273999653
        },
        "ib4_archivos": {
          "mediana": 2,
          "ric": 1.0,
          "minimo": 2,
          "maximo": 4
        },
        "ib4_herramientas": {
          "mediana": 7,
          "ric": 2.5,
          "minimo": 5,
          "maximo": 10
        },
        "costo_usd": 0.10159839999999999
      },
      "Sí (`vm/docs/config.html`, «Precedence order»: global → archivo indicado por variable → proyecto)": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 68415,
          "ric": 9914.0,
          "minimo": 60147,
          "maximo": 79975
        },
        "ib2_duracion_s": {
          "mediana": 34.303748361999624,
          "ric": 1.7665432559999772,
          "minimo": 33.28577585300013,
          "maximo": 36.818862365000086
        },
        "ib4_archivos": {
          "mediana": 8,
          "ric": 0.5,
          "minimo": 7,
          "maximo": 8
        },
        "ib4_herramientas": {
          "mediana": 12,
          "ric": 1.0,
          "minimo": 11,
          "maximo": 13
        },
        "costo_usd": 0.1793668
      },
      "[VERIFICAR contra `vm/docs/` y el manual embebido en la fase 2]": {
        "n": 15,
        "ib1": 0.06666666666666667,
        "tokens": {
          "mediana": 63753,
          "ric": 12695.0,
          "minimo": 31605,
          "maximo": 127692
        },
        "ib2_duracion_s": {
          "mediana": 32.957772221999676,
          "ric": 7.817920083000104,
          "minimo": 24.01054625000006,
          "maximo": 53.85492670299982
        },
        "ib4_archivos": {
          "mediana": 5,
          "ric": 3.0,
          "minimo": 1,
          "maximo": 11
        },
        "ib4_herramientas": {
          "mediana": 11,
          "ric": 4.5,
          "minimo": 6,
          "maximo": 17
        },
        "costo_usd": 0.8274964
      },
      "[VERIFICAR el descarte de `OPENCODE_PERMISSION` inválida contra `vm/docs/` y el manual embebido en la fase 2]": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 46015,
          "ric": 13394.5,
          "minimo": 45169,
          "maximo": 71958
        },
        "ib2_duracion_s": {
          "mediana": 30.609531333000007,
          "ric": 3.131595720500002,
          "minimo": 30.437149611999985,
          "maximo": 36.70034105299999
        },
        "ib4_archivos": {
          "mediana": 2,
          "ric": 1.0,
          "minimo": 2,
          "maximo": 4
        },
        "ib4_herramientas": {
          "mediana": 9,
          "ric": 1.0,
          "minimo": 7,
          "maximo": 9
        },
        "costo_usd": 0.1501752
      },
      "[VERIFICAR el nombre global `config.json` contra `vm/docs/` y el manual embebido en la fase 2; la regla de lectura está documentada]": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 61438,
          "ric": 23252.0,
          "minimo": 55002,
          "maximo": 101506
        },
        "ib2_duracion_s": {
          "mediana": 26.669705148000048,
          "ric": 6.446404551499882,
          "minimo": 26.48795247099997,
          "maximo": 39.380761573999735
        },
        "ib4_archivos": {
          "mediana": 2,
          "ric": 1.5,
          "minimo": 2,
          "maximo": 5
        },
        "ib4_herramientas": {
          "mediana": 8,
          "ric": 2.0,
          "minimo": 7,
          "maximo": 11
        },
        "costo_usd": 0.16270479999999998
      },
      "[VERIFICAR la carga de `.opencode/opencode.json` contra `vm/docs/` y el manual embebido en la fase 2]": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 53448,
          "ric": 16530.0,
          "minimo": 42425,
          "maximo": 75485
        },
        "ib2_duracion_s": {
          "mediana": 26.38077242600002,
          "ric": 1.2452176870001495,
          "minimo": 23.896661238999968,
          "maximo": 26.387096613000267
        },
        "ib4_archivos": {
          "mediana": 4,
          "ric": 2.5,
          "minimo": 2,
          "maximo": 7
        },
        "ib4_herramientas": {
          "mediana": 8,
          "ric": 2.0,
          "minimo": 6,
          "maximo": 10
        },
        "costo_usd": 0.20526
      },
      "[VERIFICAR la herencia de denegaciones del padre contra `vm/docs/` y el manual embebido en la fase 2]": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 63023,
          "ric": 8440.0,
          "minimo": 58412,
          "maximo": 75292
        },
        "ib2_duracion_s": {
          "mediana": 33.957183931000145,
          "ric": 9.155058948500027,
          "minimo": 28.003046240999993,
          "maximo": 46.31316413800005
        },
        "ib4_archivos": {
          "mediana": 3,
          "ric": 1.0,
          "minimo": 3,
          "maximo": 5
        },
        "ib4_herramientas": {
          "mediana": 11,
          "ric": 2.0,
          "minimo": 8,
          "maximo": 12
        },
        "costo_usd": 0.1672044
      },
      "[VERIFICAR la posición intermedia de `OPENCODE_PERMISSION` contra `vm/docs/` y el manual embebido en la fase 2]": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 79169,
          "ric": 3456.5,
          "minimo": 78779,
          "maximo": 85692
        },
        "ib2_duracion_s": {
          "mediana": 45.988225015000125,
          "ric": 5.064229566499762,
          "minimo": 41.0785133950003,
          "maximo": 51.206972527999824
        },
        "ib4_archivos": {
          "mediana": 7,
          "ric": 2.5,
          "minimo": 2,
          "maximo": 7
        },
        "ib4_herramientas": {
          "mediana": 12,
          "ric": 3.0,
          "minimo": 8,
          "maximo": 14
        },
        "costo_usd": 0.18781760000000003
      }
    },
    "cobertura_disponible": "[DATO PENDIENTE: completar etiquetas con evidencia antes del piloto; no inferir desde fuente observada]",
    "totales": {
      "n": 72,
      "ib1": 0.05555555555555555,
      "tokens": {
        "mediana": 62890.5,
        "ric": 20506.25,
        "minimo": 31605,
        "maximo": 162994
      },
      "ib2_duracion_s": {
        "mediana": 33.389604581500066,
        "ric": 9.729377079999836,
        "minimo": 21.264662029999954,
        "maximo": 58.14182977099995
      },
      "ib4_archivos": {
        "mediana": 4.0,
        "ric": 4.25,
        "minimo": 1,
        "maximo": 13
      },
      "ib4_herramientas": {
        "mediana": 10.5,
        "ric": 4.0,
        "minimo": 5,
        "maximo": 17
      },
      "costo_usd": 3.8444024
    }
  }
}
```

