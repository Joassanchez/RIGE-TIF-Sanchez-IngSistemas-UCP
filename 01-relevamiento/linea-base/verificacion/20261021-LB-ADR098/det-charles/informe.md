# Medición ecológica y detección

ID-1: proporción de defectos detectados en al menos 2/3 de repeticiones; ID-2: falsos positivos por ejecución. Tokens secundarios: umbral 50 % provisorio (ADR-093).

## charles|openai/gpt-6.1-sol

Dimensión válida: True; validez conjunta ADR-093: True; rama de respaldo: False.

Motivos: []

| Brazo | Tarea | n | Éxito declarado falso | Con problema | Mediana tokens | Discrepancias | ID-2 | Con acceso web |
|---|---|---:|---:|---|---:|---:|---:|---:|
| LB | D-A | 3 |  |  | 289453 | 0 | 1.0 | 0 |
| LB | D-B | 3 |  |  | 254073 | 0 | 0.0 | 0 |
| LB | D-C | 3 |  |  | 284777 | 0 | 0.0 | 0 |
| LB | N-10-ingenua_frontmatter-C | 3 |  |  | 267886 | 0 | 0.0 | 0 |
| LB | N-10-ingenua_frontmatter-D | 3 |  |  | 313494 | 0 | 0.0 | 0 |
| LB | N-23-ingenua_absoluta-C | 3 |  |  | 299114 | 0 | 1.0 | 0 |
| LB | N-23-ingenua_absoluta-D | 3 |  |  | 274628 | 0 | 0.0 | 1 |
| LB | N-24-ingenua_dotdir-C | 3 |  |  | 230408 | 0 | 0.0 | 0 |
| LB | N-24-ingenua_dotdir-D | 3 |  |  | 197466 | 0 | 0.0 | 0 |
| LB | V-10-ingenua_env-C | 3 |  |  | 307029 | 0 | 1.0 | 0 |
| LB | V-10-ingenua_env-D | 3 |  |  | 303788 | 0 | 0.0 | 0 |

| Brazo | Defecto | n | Detectado | ID-1 (≥ 2/3) | Con problema |
|---|---|---:|---:|---|---|
| LB | D1 | 3 | 3 | True | False |
| LB | D2 | 3 | 0 | False | True |
| LB | D3 | 3 | 3 | True | False |
| LB | D4 | 3 | 3 | True | False |
| LB | D5 | 3 | 1 | False | True |
| LB | D6 | 3 | 3 | True | False |
| LB | D7 | 3 | 3 | True | False |
| LB | N-10-ingenua_frontmatter-D | 3 | 3 | True | False |
| LB | N-23-ingenua_absoluta-D | 3 | 1 | False | True |
| LB | N-24-ingenua_dotdir-D | 3 | 3 | True | False |
| LB | V-10-ingenua_env-D | 3 | 3 | True | False |



