# Archivo de la evidencia de la admisión y de los ensayos (20/10/2026)

Evidencia de ADR-098 que queda fuera del repositorio por su tamaño. Archivada por el ingeniero (Claude Code, Opus 5.5) el 20/10/2026, por delegación del autor.

## Ubicación

- **Carpetas originales**, sin modificar: `C:/Users/Joa/<carpeta>`. La admisión `…20261020c` es la que el corrector recibe con `--evidencia-admision` (o `RIGE_EVIDENCIA_ADMISION`); no se mueve ni se renombra.
- **Archivo**: `C:/Users/Joa/archivo-linea-base/`, con una copia en `C:/Users/Joa/OneDrive/archivo-linea-base/` verificada con `sha256sum -c HASHES.txt`.
- Por cada carpeta hay un `.tar.gz` y un `.SHA256SUMS` con el hash de cada archivo, ordenado por ruta y relativo a la carpeta.

## Contenido y SHA-256

| Carpeta | Qué es | Archivos | `.tar.gz` | `.SHA256SUMS` |
|---|---|---|---|---|
| `evidencia-admision-completa-20261020c` | Admisión nativa vigente, 46/46, imagen `a691196f0e3e`, de 15:45 a 18:09 UTC | 43.837 (≈280 MB) | `cb8bc5649e9a4a6f6ada0047a8840fc26f99d36c3e58bc42212f2871a250e63b` | `f873f8c688adebbda5e8e782fa940670ca24a03a04b9286fe10d4d282db7db7b` |
| `evidencia-readmision-20261020` | Readmisión con la batería ampliada (ADR-098, Contexto 11) | 22.471 | `410b0b73608d74fa087bb9b692abc4018e0fee6802fbfb4240c9349d28b96107` | `34c7059edf155617635b76382ced4a12396b6c8f906fd3392edc8738fca51cc8` |
| `rige-ensayo-20261020c` | Ensayo citado en `vm/simulado/planes/MED-13-c4.md` (V-9) | 8.982 | `10408d0a1094a04d955608c2f2329c420379e07de6909e5d07f376cb024a5d45` | `f9a72bdf5eb418edb1df259eb5fd3b308843faec52a2f05bfd687cd948506903` |
| `rige-ensayo-20261020d` | Ensayo citado en ADR-098, Contexto 12 (N-21) | 5.403 | `267974b7524d3b3899f563b9bba9654a09482fbd60da6ea951173a6ca5166a67` | `ae0fddb42aff008eecc230f25e43c447b53e975abbbe5c827394c29dcda6d52c` |
| `rige-ensayo-final-20261020` | Ensayo final con la imagen `a691196f0e3e` | 13.669 | `1385ceaf641dcad063303b14d2cddf00cd83f0f67c0ce29346a2f09c151420b1` | `9d8116c7e7fdabe3a619317740f8d4c8b04c3873c708c09940adece8e1ab908d` |

## Intentos de admisión descartados (no se archivan)

| Carpeta | Período (UTC) | Motivo |
|---|---|---|
| `evidencia-admision-completa-20261020` | 05:08 a 07:23 | Inválida: N-12 y N-13 no admitidas porque la sonda `["build", "write", "src/productos.js"]` no reproducía el contraste en ninguna variante (defecto de la sonda, corregido antes del intento siguiente) |
| `evidencia-admision-completa-20261020b` | 07:25 a 13:12 | Válida, pero anterior a la raíz con escritura de grupo y *sticky bit* (ADR-098, punto 3). El cambio de preparación obligó a una readmisión completa con la imagen `a691196f0e3e` |

## Tanda real y ensayos del 20 y 21/10/2026 (archivados el 21/10/2026)

Mismo procedimiento. Están en `C:/Users/Joa/archivo-linea-base/`, con copia en OneDrive verificada con `HASHES-20261021.txt`.

| Carpeta | Qué es | Archivos | `.tar.gz` | `.SHA256SUMS` |
|---|---|---|---|---|
| `rige-LB-20261020` | Tanda real de ADR-098 (402 ejecuciones más continuaciones y repetición) | 210.768 | `4fc40c687c79a6e9ecbae0d6354d1e95928d10b47fb384044610673075baf12e` | `0e51174f59bb5c11b9e592d7c99bf6c6ea4f6532970cfd39396d28ab7cd1abf3` |
| `rige-ensayo-med14-20261020` | Ensayo final después de MED-14 | 23.161 | `79aea6df4fbdbdfbab105b67baac57e23f8ddc3d44a218448ff404875a08dcac` | `638a0b955d8a0ddb2dcdb0230087bb5aa33bad23aee94a6afe66a662f010b051` |
| `rige-ensayo-med16-20261021` | Ensayo final después de MED-16 | 23.161 | `9b1f3e4cc4d8feb14a67b59344c7a91c79679b657a840a96ab73ad345820b337` | `c3b03516a9b50c4aa0efde645d670cead840799fdd8b82524004418b1ba58973` |
| `rige-LB-20261020-descartada` | Primera tanda, detenida en la fase base, sin agentes (Contexto 13) | 8 | `f09feb95983808435db1bc425a959de6b85f3750b5b057343c0f2f65bb555de7` | `c0378df34645e3e556d5e1e158f655b79c6c7a9b815cc965b51b16df868fe77c` |

## Tandas crudas anteriores a ADR-098 (archivadas el 22/10/2026)

Datos crudos de las tandas de atribución, modificación y sondas del 13 y 14/10/2026. Salen de `verificacion/` para dejar en el repositorio solo la medición vigente. Siguen en el repositorio sus análisis (`20261014-analisis-LB/`, `20261014-analisis-LB-mod/`, `20261014-analisis-sondas-p3/` y `20261014-adjudicacion-autor/`), que el Anexo VI cita como antecedente, y `20261013-LB-principal-sol/registro.jsonl`, que cita ADR-098 en el Contexto 8. Mismo procedimiento. Están en `C:/Users/Joa/archivo-linea-base/`, con copia en OneDrive verificada con `HASHES-20261022.txt`. Cada `.tar.gz` se extrajo y se comprobó contra su `.SHA256SUMS` antes de borrar la carpeta: 0 diferencias. La carpeta también queda en el historial de git, hasta el commit `cafdb4b`.

| Carpeta | Qué es | Archivos | `.tar.gz` | `.SHA256SUMS` |
|---|---|---|---|---|
| `20261013-LB-charles-sol` | Atribución, Charles | 517 | `ff1fb9bc89fd57a403fb19949efead236b5ea3b72beb0a34bc18631e933842f4` | `77c5b95a0525e8cd2d93b94826e65653936ef257f359b2048f987d86337ae1d7` |
| `20261013-LB-principal-sol` | Atribución, `build` (incluye `registro.jsonl`, que se conserva en el repositorio) | 517 | `0ca4dab51b9637a09b678470351d6e7037a363c5ba167ebeab6f2789c044d47e` | `38a02bf4ac8079a65dcdc019c6cc1fbbc88beebb0f1b65a1fa87b3eaed6037d9` |
| `20261014-LB-mod-charles-b-sol` | Modificación, Charles, repetición de C-3b | 276 | `ae108374303acddd9e8507f70aa24b237cfba86e6df795286d158de04162f72b` | `418769ebf63bcf6642c6a7785c20a564f01052b4116a31f466f5f1ee19aa4ad4` |
| `20261014-LB-mod-charles-sol` | Modificación, Charles | 2.141 | `4f72a66988acfb52465e1c6b47e83e24e70b0c86c33048bd09994ce1a3c4acd8` | `a4293ad498c86cf8f1c9c57e9e183cddfe6bad30acdc87ab48061a56c8b70d5f` |
| `20261014-LB-mod-principal-sol` | Modificación, `build` | 2.312 | `58729a23a413b9cf28659fffa9964c8f6d824f57910df0c650ea00205149029b` | `8ff4c16e8aa7181fea956c2a3084a3473e77a6998328b6e8f7af6416006d3509` |
| `20261014-LB-p3-luna` | Atribución, P3 (`gpt-6-luna`) | 517 | `ed9f12bbcfa7903649d4d526d96902a972846de7a2ac95ef75b85706dbf20112` | `a4cea32c5e6de745293893690e85e24df23ba1671c6b0dce17bcd8d3cdcc9e35` |
| `20261014-sonda-E-charles` | Sonda E, Charles | 383 | `b47c5b96e90814d65a84c2d8f8d6dae13ff57f15b89b35098e8e4892bacaa4db` | `e943cfad64d52c73597f8c1bc1dc4741fe73aa39ca3c463a785d78a6adcdacfd` |
| `20261014-sonda-E-charles-b` | Sonda E, Charles, segunda tanda | 353 | `d184a22837a16b5034ab8475c7de5c77d06779ae5d5eeecc25e87f4ae6c86e29` | `f670550c6c801721e616175a6c177729440dd42f0f1ab0502148ab539a21649a` |
| `20261014-sonda-E-principal` | Sonda E, `build` | 383 | `1c62ec2742a7eee4591c8da8526186d2de633395c383398d2df3d62ad9a23856` | `3c9cb7183e3d8f5d1f19d4d43bb4bdb882aab0f63d8ac9cdd5f13ed097f57b57` |
| `20261014-sonda-E-principal-b` | Sonda E, `build`, segunda tanda | 260 | `7db8162f8c570d6798847b2c062b852de0ac54024f6b672f60622ad4961ac70c` | `2d4746c250170ae4ea4b36b7cc955614b4fdbb28dcced445ff5088d5c89c8ef0` |
| `20261014-sonda-R-charles` | Sonda R, Charles | 55 | `ca2af1128c468f65b89f2ed232dc3aafd2930799f9a0482b133853c022f0f3b9` | `61ff3b4258f6246a6a6c70b8753eabf4cd563523ec1d2e4126001fc626e22110` |
| `20261014-sonda-R-principal` | Sonda R, `build` | 55 | `97bce3efd9e75160482127c17d9932569a07ffcd2022530cca2f60f8b780f7f9` | `3dd1bbf99e4a5a8113eb3ca7cc4019535cf32e7bca4372f86c47401fcbf02879` |

## Salida de máquina de la adjudicación del 14/10/2026 (archivada el 22/10/2026)

Los dos `analisis.json` de `20261014-adjudicacion-autor/` (`analisis-LB/` y `analisis-p3/`, 19 MB) son la salida del análisis que genera los `informe.md` de esas carpetas. Los `informe.md` siguen en el repositorio; nada cita los JSON. Mismo procedimiento y ubicación, con copia en OneDrive verificada con `HASHES-20261022.txt`. Se extrajeron y se comprobaron contra su `.SHA256SUMS` antes de borrarlos: 0 diferencias.

| Archivo | Contenido | `.tar.gz` | `.SHA256SUMS` |
|---|---|---|---|
| `20261014-adjudicacion-autor-analisis-json` | `analisis-LB/analisis.json` (`db61e5b4…`) y `analisis-p3/analisis.json` (`f007873c…`) | `6ea8270f9ef43ac449944e2c80fe6ae909fc2ad72c8f0e75afb320c799fb2301` | `e71b0f96a5f2670486c44ac1b32baf6bb3c44ae401c3744a79b425ccfe1ca50a` |
