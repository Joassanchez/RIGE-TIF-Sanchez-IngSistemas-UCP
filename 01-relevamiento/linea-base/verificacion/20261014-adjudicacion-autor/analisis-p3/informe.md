# Análisis de la medición

Cumplimiento del proyecto: None. Reevaluar objeto: False.

Equivalente USD: 0.5493220000000003. Equivalente informativo a tarifas congeladas; no es desembolso ni inferencia estadística.

## principal|openai/gpt-5.6-luna

válida; rama: N; IV.3: {'resultado': 'Confirma', 'pendiente': ''}

Exclusiones de todos los brazos: {}

Censuradas (también las excluidas): 0

| Brazo | Caso | n | Error | Correctas | Parciales | Incorrectas | Sin respuesta | Mediana tokens | Censuradas |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| LB | C-1a | 3 | 0.0000 | 3 | 0 | 0 | 0 | 45295 | 0 |
| LB | C-1b | 3 | 0.0000 | 3 | 0 | 0 | 0 | 82408 | 0 |
| LB | C-1c | 3 | 0.0000 | 3 | 0 | 0 | 0 | 47294 | 0 |
| LB | C-1d | 3 | 0.0000 | 3 | 0 | 0 | 0 | 56768 | 0 |
| LB | C-1e | 3 | 0.0000 | 3 | 0 | 0 | 0 | 44188 | 0 |
| LB | C-1f | 3 | 0.0000 | 3 | 0 | 0 | 0 | 107514 | 0 |
| LB | C-2a | 3 | 0.0000 | 3 | 0 | 0 | 0 | 124082 | 0 |
| LB | C-2b | 3 | 0.3333 | 2 | 0 | 1 | 0 | 248701 | 0 |
| LB | C-2c | 3 | 0.0000 | 3 | 0 | 0 | 0 | 144477 | 0 |
| LB | C-2d | 3 | 0.0000 | 3 | 0 | 0 | 0 | 75352 | 0 |
| LB | C-2e | 3 | 0.0000 | 3 | 0 | 0 | 0 | 102547 | 0 |
| LB | C-2f | 3 | 0.0000 | 3 | 0 | 0 | 0 | 62748 | 0 |
| LB | C-3a | 3 | 0.0000 | 3 | 0 | 0 | 0 | 135794 | 0 |
| LB | C-3b | 3 | 0.0000 | 3 | 0 | 0 | 0 | 44848 | 0 |
| LB | C-3c | 3 | 0.0000 | 3 | 0 | 0 | 0 | 74045 | 0 |
| LB | C-3d | 3 | 0.0000 | 3 | 0 | 0 | 0 | 56193 | 0 |
| LB | C-3e | 3 | 0.0000 | 3 | 0 | 0 | 0 | 112117 | 0 |
| LB | C-3f | 3 | 0.0000 | 3 | 0 | 0 | 0 | 71787 | 0 |
| LB | C-4a | 3 | 0.0000 | 3 | 0 | 0 | 0 | 115171 | 0 |
| LB | C-4b | 3 | 0.0000 | 3 | 0 | 0 | 0 | 95925 | 0 |
| LB | C-4c | 3 | 0.0000 | 3 | 0 | 0 | 0 | 84220 | 0 |
| LB | C-4d | 3 | 0.0000 | 3 | 0 | 0 | 0 | 103682 | 0 |
| LB | C-4e | 3 | 0.3333 | 2 | 1 | 0 | 0 | 84183 | 0 |
| LB | C-4f | 3 | 0.0000 | 3 | 0 | 0 | 0 | 92462 | 0 |

Lectura: Sin criterio de cumplimiento o brazos pendientes

### Indicadores LB

| Conjunto | IB-1 agregado | Promedio tasas | Casos con problema | Nivel tokens | IB-3 | Censura |
|---|---:|---:|---:|---:|---:|---:|
| C-1 | 0.0 | 0.0 | 0 | 52031.0 | 0.0 | 0.0 |
| C-2 | 0.05555555555555555 | 0.05555555555555555 | 0 | 113314.5 | 0.0 | 0.0 |
| C-3 | 0.0 | 0.0 | 0 | 72916.0 | 0.0 | 0.0 |
| C-4 | 0.05555555555555555 | 0.05555555555555555 | 0 | 94193.5 | 0.05555555555555555 | 0.0 |
| C-2_a_C-4 | 0.037037037037037035 | 0.037037037037037035 | 0 | 94193.5 | 0.018518518518518517 | 0.0 |

### Comparaciones descriptivas

```json
{
  "LB": {
    "por_tipo": {
      "valor": {
        "n": 36,
        "ib1": 0.027777777777777776,
        "tokens": {
          "mediana": 84941.0,
          "ric": 71824.25,
          "minimo": 26953,
          "maximo": 252110
        },
        "ib2_duracion_s": {
          "mediana": 25.10652520199983,
          "ric": 9.05317150575047,
          "minimo": 12.512842682000155,
          "maximo": 51.91348926499995
        },
        "ib4_archivos": {
          "mediana": 3.0,
          "ric": 3.0,
          "minimo": 1,
          "maximo": 12
        },
        "ib4_herramientas": {
          "mediana": 16.0,
          "ric": 6.25,
          "minimo": 8,
          "maximo": 35
        },
        "costo_usd": 0.2840240400000001
      },
      "permiso": {
        "n": 36,
        "ib1": 0.027777777777777776,
        "tokens": {
          "mediana": 83678.5,
          "ric": 52706.75,
          "minimo": 35663,
          "maximo": 214094
        },
        "ib2_duracion_s": {
          "mediana": 24.853897456999675,
          "ric": 7.3261292357499315,
          "minimo": 11.498829809000199,
          "maximo": 43.43979139200019
        },
        "ib4_archivos": {
          "mediana": 4.0,
          "ric": 2.0,
          "minimo": 1,
          "maximo": 6
        },
        "ib4_herramientas": {
          "mediana": 14.5,
          "ric": 5.25,
          "minimo": 7,
          "maximo": 26
        },
        "costo_usd": 0.26529796
      }
    },
    "pares": {
      "C-3d/C-4c": {
        "C-3d": {
          "n": 3,
          "ib1": 0.0,
          "tokens": {
            "mediana": 56193,
            "ric": 10459.5,
            "minimo": 35663,
            "maximo": 56582
          },
          "ib2_duracion_s": {
            "mediana": 14.362464396999712,
            "ric": 3.7736428900002466,
            "minimo": 11.498829809000199,
            "maximo": 19.046115589000692
          },
          "ib4_archivos": {
            "mediana": 4,
            "ric": 0.0,
            "minimo": 4,
            "maximo": 4
          },
          "ib4_herramientas": {
            "mediana": 9,
            "ric": 3.5,
            "minimo": 8,
            "maximo": 15
          },
          "costo_usd": 0.01805556
        },
        "C-4c": {
          "n": 3,
          "ib1": 0.0,
          "tokens": {
            "mediana": 84220,
            "ric": 40035.5,
            "minimo": 38256,
            "maximo": 118327
          },
          "ib2_duracion_s": {
            "mediana": 24.772816731999228,
            "ric": 4.249019310000222,
            "minimo": 18.41073739100011,
            "maximo": 26.908776011000555
          },
          "ib4_archivos": {
            "mediana": 3,
            "ric": 1.5,
            "minimo": 2,
            "maximo": 5
          },
          "ib4_herramientas": {
            "mediana": 18,
            "ric": 4.0,
            "minimo": 11,
            "maximo": 19
          },
          "costo_usd": 0.018928920000000002
        }
      },
      "C-4a/C-4b": {
        "C-4a": {
          "n": 3,
          "ib1": 0.0,
          "tokens": {
            "mediana": 115171,
            "ric": 54418.5,
            "minimo": 36753,
            "maximo": 145590
          },
          "ib2_duracion_s": {
            "mediana": 32.23250961999929,
            "ric": 11.464154007999696,
            "minimo": 15.921030583000174,
            "maximo": 38.849338598999566
          },
          "ib4_archivos": {
            "mediana": 3,
            "ric": 1.0,
            "minimo": 3,
            "maximo": 5
          },
          "ib4_herramientas": {
            "mediana": 21,
            "ric": 8.5,
            "minimo": 7,
            "maximo": 24
          },
          "costo_usd": 0.022661520000000004
        },
        "C-4b": {
          "n": 3,
          "ib1": 0.0,
          "tokens": {
            "mediana": 95925,
            "ric": 38274.0,
            "minimo": 61801,
            "maximo": 138349
          },
          "ib2_duracion_s": {
            "mediana": 23.629562472000543,
            "ric": 3.5656603064999217,
            "minimo": 22.445225876999757,
            "maximo": 29.5765464899996
          },
          "ib4_archivos": {
            "mediana": 4,
            "ric": 0.0,
            "minimo": 4,
            "maximo": 4
          },
          "ib4_herramientas": {
            "mediana": 14,
            "ric": 2.0,
            "minimo": 14,
            "maximo": 18
          },
          "costo_usd": 0.022748360000000002
        }
      }
    },
    "introspeccion_vs_acierto": {
      "True": {
        "n": 72,
        "ib1": 0.027777777777777776,
        "tokens": {
          "mediana": 83678.5,
          "ric": 61062.5,
          "minimo": 26953,
          "maximo": 252110
        },
        "ib2_duracion_s": {
          "mediana": 24.968639427499966,
          "ric": 8.404846145000192,
          "minimo": 11.498829809000199,
          "maximo": 51.91348926499995
        },
        "ib4_archivos": {
          "mediana": 4.0,
          "ric": 2.0,
          "minimo": 1,
          "maximo": 12
        },
        "ib4_herramientas": {
          "mediana": 15.0,
          "ric": 6.0,
          "minimo": 7,
          "maximo": 35
        },
        "costo_usd": 0.5493220000000003
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
        "ib1": 0.027777777777777776,
        "tokens": {
          "mediana": 83678.5,
          "ric": 61062.5,
          "minimo": 26953,
          "maximo": 252110
        },
        "ib2_duracion_s": {
          "mediana": 24.968639427499966,
          "ric": 8.404846145000192,
          "minimo": 11.498829809000199,
          "maximo": 51.91348926499995
        },
        "ib4_archivos": {
          "mediana": 4.0,
          "ric": 2.0,
          "minimo": 1,
          "maximo": 12
        },
        "ib4_herramientas": {
          "mediana": 15.0,
          "ric": 6.0,
          "minimo": 7,
          "maximo": 35
        },
        "costo_usd": 0.5493220000000003
      },
      "documentacion": {
        "n": 67,
        "ib1": 0.029850746268656716,
        "tokens": {
          "mediana": 84220,
          "ric": 60084.0,
          "minimo": 35663,
          "maximo": 252110
        },
        "ib2_duracion_s": {
          "mediana": 25.00230067299981,
          "ric": 8.082420837999962,
          "minimo": 11.498829809000199,
          "maximo": 51.91348926499995
        },
        "ib4_archivos": {
          "mediana": 4,
          "ric": 2.0,
          "minimo": 1,
          "maximo": 12
        },
        "ib4_herramientas": {
          "mediana": 15,
          "ric": 5.0,
          "minimo": 7,
          "maximo": 35
        },
        "costo_usd": 0.5262711200000002
      },
      "ejecucion": {
        "n": 64,
        "ib1": 0.03125,
        "tokens": {
          "mediana": 86055.5,
          "ric": 63629.75,
          "minimo": 26953,
          "maximo": 252110
        },
        "ib2_duracion_s": {
          "mediana": 25.499500990000342,
          "ric": 7.468499178749653,
          "minimo": 12.512842682000155,
          "maximo": 51.91348926499995
        },
        "ib4_archivos": {
          "mediana": 4.0,
          "ric": 2.0,
          "minimo": 1,
          "maximo": 12
        },
        "ib4_herramientas": {
          "mediana": 16.0,
          "ric": 5.25,
          "minimo": 8,
          "maximo": 35
        },
        "costo_usd": 0.5016177200000002
      }
    },
    "documentacion": {
      "De forma incorrecta": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 44848,
          "ric": 85773.0,
          "minimo": 42548,
          "maximo": 214094
        },
        "ib2_duracion_s": {
          "mediana": 23.212633504999758,
          "ric": 5.437743688999944,
          "minimo": 16.36036920100014,
          "maximo": 27.23585657900003
        },
        "ib4_archivos": {
          "mediana": 4,
          "ric": 1.0,
          "minimo": 3,
          "maximo": 5
        },
        "ib4_herramientas": {
          "mediana": 13,
          "ric": 2.0,
          "minimo": 10,
          "maximo": 14
        },
        "costo_usd": 0.0246834
      },
      "No": {
        "n": 6,
        "ib1": 0.16666666666666666,
        "tokens": {
          "mediana": 117137.0,
          "ric": 150781.0,
          "minimo": 48690,
          "maximo": 252110
        },
        "ib2_duracion_s": {
          "mediana": 25.357503737500338,
          "ric": 6.21246109249978,
          "minimo": 17.01342445299997,
          "maximo": 51.91348926499995
        },
        "ib4_archivos": {
          "mediana": 4.0,
          "ric": 3.0,
          "minimo": 2,
          "maximo": 12
        },
        "ib4_herramientas": {
          "mediana": 16.0,
          "ric": 7.75,
          "minimo": 11,
          "maximo": 35
        },
        "costo_usd": 0.05624952
      },
      "Parcialmente": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 124082,
          "ric": 35328.5,
          "minimo": 87891,
          "maximo": 158548
        },
        "ib2_duracion_s": {
          "mediana": 28.462586368000302,
          "ric": 3.261257058999945,
          "minimo": 26.301486661000126,
          "maximo": 32.824000779000016
        },
        "ib4_archivos": {
          "mediana": 5,
          "ric": 1.5,
          "minimo": 3,
          "maximo": 6
        },
        "ib4_herramientas": {
          "mediana": 16,
          "ric": 3.5,
          "minimo": 15,
          "maximo": 22
        },
        "costo_usd": 0.028310920000000003
      },
      "Sí": {
        "n": 21,
        "ib1": 0.0,
        "tokens": {
          "mediana": 62609,
          "ric": 48577.0,
          "minimo": 36753,
          "maximo": 221607
        },
        "ib2_duracion_s": {
          "mediana": 25.77619601400056,
          "ric": 11.929660361998685,
          "minimo": 12.512842682000155,
          "maximo": 38.849338598999566
        },
        "ib4_archivos": {
          "mediana": 3,
          "ric": 2.0,
          "minimo": 1,
          "maximo": 6
        },
        "ib4_herramientas": {
          "mediana": 16,
          "ric": 6.0,
          "minimo": 7,
          "maximo": 25
        },
        "costo_usd": 0.13540908000000001
      },
      "Sí (`vm/docs/config.html`, «Env vars»: una variable no definida se sustituye por cadena vacía)": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 112117,
          "ric": 16947.5,
          "minimo": 101108,
          "maximo": 135003
        },
        "ib2_duracion_s": {
          "mediana": 27.710298779999903,
          "ric": 5.920182765999925,
          "minimo": 25.222805966000124,
          "maximo": 37.063171497999974
        },
        "ib4_archivos": {
          "mediana": 5,
          "ric": 0.0,
          "minimo": 5,
          "maximo": 5
        },
        "ib4_herramientas": {
          "mediana": 17,
          "ric": 8.5,
          "minimo": 11,
          "maximo": 28
        },
        "costo_usd": 0.028402680000000003
      },
      "Sí (`vm/docs/config.html`, «Precedence order»: configuración en línea después del proyecto)": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 102547,
          "ric": 38717.5,
          "minimo": 51487,
          "maximo": 128922
        },
        "ib2_duracion_s": {
          "mediana": 24.598910630999853,
          "ric": 5.59946724349993,
          "minimo": 13.687453442999868,
          "maximo": 24.886387929999728
        },
        "ib4_archivos": {
          "mediana": 3,
          "ric": 1.0,
          "minimo": 2,
          "maximo": 4
        },
        "ib4_herramientas": {
          "mediana": 14,
          "ric": 3.5,
          "minimo": 10,
          "maximo": 17
        },
        "costo_usd": 0.022502519999999998
      },
      "Sí (`vm/docs/config.html`, «Precedence order»: global → archivo indicado por variable → proyecto)": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 62748,
          "ric": 60767.5,
          "minimo": 62097,
          "maximo": 183632
        },
        "ib2_duracion_s": {
          "mediana": 22.248054474000128,
          "ric": 2.2533537250001245,
          "minimo": 20.7040422809996,
          "maximo": 25.21074973099985
        },
        "ib4_archivos": {
          "mediana": 4,
          "ric": 2.5,
          "minimo": 3,
          "maximo": 8
        },
        "ib4_herramientas": {
          "mediana": 16,
          "ric": 2.5,
          "minimo": 14,
          "maximo": 19
        },
        "costo_usd": 0.025103439999999998
      },
      "[VERIFICAR contra `vm/docs/` y el manual embebido en la fase 2]": {
        "n": 15,
        "ib1": 0.0,
        "tokens": {
          "mediana": 84220,
          "ric": 59051.0,
          "minimo": 35663,
          "maximo": 191375
        },
        "ib2_duracion_s": {
          "mediana": 22.039856411000073,
          "ric": 6.472694219999994,
          "minimo": 11.498829809000199,
          "maximo": 36.5732009860003
        },
        "ib4_archivos": {
          "mediana": 4,
          "ric": 1.5,
          "minimo": 2,
          "maximo": 6
        },
        "ib4_herramientas": {
          "mediana": 15,
          "ric": 4.5,
          "minimo": 8,
          "maximo": 26
        },
        "costo_usd": 0.11655463999999999
      },
      "[VERIFICAR el descarte de `OPENCODE_PERMISSION` inválida contra `vm/docs/` y el manual embebido en la fase 2]": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 92462,
          "ric": 12489.0,
          "minimo": 71741,
          "maximo": 96719
        },
        "ib2_duracion_s": {
          "mediana": 23.950779626999974,
          "ric": 3.908300669000255,
          "minimo": 22.01737141600006,
          "maximo": 29.83397275400057
        },
        "ib4_archivos": {
          "mediana": 4,
          "ric": 1.0,
          "minimo": 3,
          "maximo": 5
        },
        "ib4_herramientas": {
          "mediana": 14,
          "ric": 3.5,
          "minimo": 14,
          "maximo": 21
        },
        "costo_usd": 0.02396532
      },
      "[VERIFICAR el nombre global `config.json` contra `vm/docs/` y el manual embebido en la fase 2; la regla de lectura está documentada]": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 107514,
          "ric": 20359.5,
          "minimo": 76053,
          "maximo": 116772
        },
        "ib2_duracion_s": {
          "mediana": 33.10536679100005,
          "ric": 7.59362707199989,
          "minimo": 22.375598827999966,
          "maximo": 37.562852971999746
        },
        "ib4_archivos": {
          "mediana": 3,
          "ric": 2.0,
          "minimo": 1,
          "maximo": 5
        },
        "ib4_herramientas": {
          "mediana": 21,
          "ric": 4.5,
          "minimo": 16,
          "maximo": 25
        },
        "costo_usd": 0.02537756
      },
      "[VERIFICAR la carga de `.opencode/opencode.json` contra `vm/docs/` y el manual embebido en la fase 2]": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 44188,
          "ric": 33841.5,
          "minimo": 26953,
          "maximo": 94636
        },
        "ib2_duracion_s": {
          "mediana": 14.935479515000225,
          "ric": 8.650546621500325,
          "minimo": 14.86875469000006,
          "maximo": 32.16984793300071
        },
        "ib4_archivos": {
          "mediana": 2,
          "ric": 2.5,
          "minimo": 2,
          "maximo": 7
        },
        "ib4_herramientas": {
          "mediana": 9,
          "ric": 6.0,
          "minimo": 8,
          "maximo": 20
        },
        "costo_usd": 0.016937600000000004
      },
      "[VERIFICAR la herencia de denegaciones del padre contra `vm/docs/` y el manual embebido en la fase 2]": {
        "n": 3,
        "ib1": 0.0,
        "tokens": {
          "mediana": 71787,
          "ric": 17843.0,
          "minimo": 70383,
          "maximo": 106069
        },
        "ib2_duracion_s": {
          "mediana": 24.934978182000123,
          "ric": 5.160605967500032,
          "minimo": 19.286802662999435,
          "maximo": 29.6080145979995
        },
        "ib4_archivos": {
          "mediana": 3,
          "ric": 0.5,
          "minimo": 3,
          "maximo": 4
        },
        "ib4_herramientas": {
          "mediana": 12,
          "ric": 1.5,
          "minimo": 11,
          "maximo": 14
        },
        "costo_usd": 0.0190962
      },
      "[VERIFICAR la posición intermedia de `OPENCODE_PERMISSION` contra `vm/docs/` y el manual embebido en la fase 2]": {
        "n": 3,
        "ib1": 0.3333333333333333,
        "tokens": {
          "mediana": 84183,
          "ric": 33819.5,
          "minimo": 83174,
          "maximo": 150813
        },
        "ib2_duracion_s": {
          "mediana": 32.02641162200052,
          "ric": 7.796641323000131,
          "minimo": 27.846508745999927,
          "maximo": 43.43979139200019
        },
        "ib4_archivos": {
          "mediana": 4,
          "ric": 0.5,
          "minimo": 4,
          "maximo": 5
        },
        "ib4_herramientas": {
          "mediana": 15,
          "ric": 7.0,
          "minimo": 12,
          "maximo": 26
        },
        "costo_usd": 0.026729120000000002
      }
    },
    "cobertura_disponible": "[DATO PENDIENTE: completar etiquetas con evidencia antes del piloto; no inferir desde fuente observada]",
    "totales": {
      "n": 72,
      "ib1": 0.027777777777777776,
      "tokens": {
        "mediana": 83678.5,
        "ric": 61062.5,
        "minimo": 26953,
        "maximo": 252110
      },
      "ib2_duracion_s": {
        "mediana": 24.968639427499966,
        "ric": 8.404846145000192,
        "minimo": 11.498829809000199,
        "maximo": 51.91348926499995
      },
      "ib4_archivos": {
        "mediana": 4.0,
        "ric": 2.0,
        "minimo": 1,
        "maximo": 12
      },
      "ib4_herramientas": {
        "mediana": 15.0,
        "ric": 6.0,
        "minimo": 7,
        "maximo": 35
      },
      "costo_usd": 0.5493220000000003
    }
  }
}
```

