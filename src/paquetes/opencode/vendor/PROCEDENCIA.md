# Procedencia de la copia

Proyecto: OpenCode, tag `v1.18.25`, repositorio `anomalyco/opencode`.
Licencia MIT; Copyright (c) 2025 opencode. Ver LICENSE y AVISOS.md.
Pila v1 usada por `opencode run`, TUI y app.

El tarball de origen fue verificado con SHA-256
`44e9530d7be172005c7d60aef317440eecb85d557d94cce7fa35c5a7b9d9da0b`.
Los resumenes siguientes se calcularon sobre los bytes del tag, una sola vez;
ninguna prueba requiere ese checkout.

## Archivos originales completos

| Archivo del tag | SHA-256 |
|---|---|
| packages/opencode/src/permission/index.ts | 5b9e4aa65290a39363722b9fae4c68080188d8ed76896afa0d96cd9dbfd2821d |
| packages/core/src/util/wildcard.ts | 58803dad815e7086ad3e71746bb39fd63d48ab3041644cbd5f9a546c5617157c |
| LICENSE | 625f0f619133f89bbbb2abe37369613dfa1885eba1e50d02170deb62bb42cb6b |

## Extracciones

| Funcion | Archivo del tag | Lineas (base 1) | Destino |
|---|---|---|---|
| evaluate | packages/opencode/src/permission/index.ts | 28-38 | permiso.ts |
| expand | packages/opencode/src/permission/index.ts | 178-184 | permiso.ts |
| fromConfig | packages/opencode/src/permission/index.ts | 186-198 | permiso.ts |
| merge | packages/opencode/src/permission/index.ts | 200-202 | permiso.ts |
| disabled | packages/opencode/src/permission/index.ts | 204-214 | permiso.ts |
| match | packages/core/src/util/wildcard.ts | 3-16 | wildcard.ts |

## Lista exacta de cambios

1. Se agregan las dos lineas de cabecera indicadas por T2-03 en permiso.ts y
   wildcard.ts. Se extraen exclusivamente las seis funciones listadas, sin
   servicios, efectos, visibleTools ni reexportaciones del original.
2. En permiso.ts, los imports originales se sustituyen por
   `import * as Wildcard from "./wildcard"` y los espacios de nombres locales
   de tipos `PermissionV1` y `ConfigPermissionV1`. Rule conserva los campos
   permission, pattern y action (allow | deny | ask); Ruleset es Rule[];
   Info es Record<string, string | Record<string, string>>.
3. expand recibe `hogar: string` tras pattern; cada `os.homedir()` pasa a
   `hogar`. fromConfig recibe `hogar: string` tras permission y lo pasa como
   segundo argumento de expand.
4. match recibe `plataforma: string` tras pattern y reemplaza process.platform
   por plataforma. evaluate recibe plataforma tras pattern y antes del rest
   rulesets; disabled la recibe tras ruleset. Ambas propagan plataforma como
   tercer argumento de cada Wildcard.match.
5. En fromConfig se anotan las dos acciones procedentes de Info mediante
   `as PermissionV1.Rule["action"]` (value y action), porque el tipo local Info
   exigido por la ficha usa string. Son aserciones de tipo sin efecto en ejecucion.
6. Los archivos propios usan UTF-8 sin BOM y LF. LICENSE conserva exactamente
   los bytes originales. No se cambia ningun otro caracter del cuerpo de las
   funciones. permiso.test.ts es una prueba propia, no una extraccion; conserva
   la cabecera de copyright exigida a todo .ts de vendor y una segunda linea
   que la identifica como prueba.

## Archivos distribuidos

Se registran todos los archivos de esta carpeta excepto este manifiesto,
que no puede incluir su propio resumen. permiso.test.ts y AVISOS.md son
archivos propios; los dos .ts de produccion son las copias.

| Archivo | SHA-256 |
|---|---|
| AVISOS.md | 3d4866594b236204c8e1c092894eee1ff55b9edcd597adf846c08d466aade4f1 |
| LICENSE | 625f0f619133f89bbbb2abe37369613dfa1885eba1e50d02170deb62bb42cb6b |
| permiso.test.ts | 4d12d95b272d4c0d3560efab0feb226a556f6b7e896dc60e0497403c0dbaffd3 |
| permiso.ts | c2477cc72174d4304b05c28a38573339d2d386071a547fe26f30b049817fd75f |
| wildcard.ts | 3633c01b2fc79d356999cb61a06f00a2b628d8519dd865ccda8bfa935cca70c7 |
