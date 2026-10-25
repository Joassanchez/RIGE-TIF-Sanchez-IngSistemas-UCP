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
archivos propios; los tres .ts de produccion son las copias.

| Archivo | SHA-256 |
|---|---|
| AVISOS.md | 3d4866594b236204c8e1c092894eee1ff55b9edcd597adf846c08d466aade4f1 |
| LICENSE | 625f0f619133f89bbbb2abe37369613dfa1885eba1e50d02170deb62bb42cb6b |
| permiso.test.ts | 4d12d95b272d4c0d3560efab0feb226a556f6b7e896dc60e0497403c0dbaffd3 |
| permiso.ts | c3a2f07e41afb5b245670224087ab11412331a15c83e3a61c3901c4edcf09228 |
| wildcard.ts | 3633c01b2fc79d356999cb61a06f00a2b628d8519dd865ccda8bfa935cca70c7 |

## T2-05: objetos de agentes nativos

Origen: packages/opencode/src/agent/agent.ts:108-261 del mismo tag.
SHA-256 del archivo completo: `e781c571d584fa996200e320f14c2735e32968256b8db194391e7c06aed7433e`.
Se extraen literalmente whitelistedDirs y readonlyExternalDirectory (108-117),
el objeto defaults (119-136) y los objetos pasados a Permission.fromConfig
para build (147-150), plan (162-176), general (187-189), explore (200-210),
compaction (227-229), title (243-245) y summary (258-260).
Se conservan mode, native y hidden; se omiten descripciones, prompts y opciones
que no participan en la cadena. Los objetos de permisos no se modifican.
El envoltorio recibe data, tmp, worktree, skillDirs, referenceDirs y las
operaciones puras join/relative de path; construye Global.Path y ctx locales.
Truncate.GLOB se expresa como path.join(data, "tool-output", "*") a partir de
truncation-dir.ts:4 y de la regla final de agent.ts:294-310.
SHA-256 de truncation-dir.ts: `790159a022386c68212056a39571f53c9874d11079b0572d57c207f1cd1d9155`.
Global.Path se calcula en el adaptador segun core/src/global.ts:10-15;
SHA-256 de ese original: `37c9aae045e01cd246cd4d8c489e84ea4849b6297d3a6f9ff9b1bca57f85c013`.
El puerto proporciona las variables de hogar y temporales; no se lee el entorno
real desde vendor. Skills y references se reciben vacios en esta iteracion y
external_directory se declara parcialmente observado.
En permiso.ts solo se agrega la reexportacion de expand al envoltorio;
no cambia el cuerpo de ninguna funcion copiada.

| Archivo | SHA-256 |
|---|---|
| agentes-nativos.ts | fb040edb2f18bcc9359e190bcdcd2138c97a7aac02610a4ed990bad2a22cd9fb |

## T2-13: valores implicitos y resumenes de prompts

Los metadatos de agent.ts:140-264 se registran en ../valores-implicitos.ts.
No cambia el cuerpo de las extracciones de vendor. Se conservan solo las
propiedades presentes en el tag; hidden y description ausentes no se inventan.
Los prompts se resumen sobre los bytes UTF-8 completos (sin normalizar saltos
de linea ni recortar espacios), iguales al texto importado por Bun. Su contenido
no se distribuye.

| Archivo del tag | SHA-256 del texto |
|---|---|
| packages/opencode/src/agent/prompt/explore.txt | 97c4780dea390f347fed0879fb30aaa08c0fc65c8cad0f6c1aec02ca6fd91e13 |
| packages/opencode/src/agent/prompt/compaction.txt | 552db0de0af1873a8acd4a631e2548345d4c43192de1d9be69c8feab4b41f80c |
| packages/opencode/src/agent/prompt/title.txt | e7a6848eba328f28c7e870874cf0591e4edbaf90d7602ad8fdfe90601c6e656f |
| packages/opencode/src/agent/prompt/summary.txt | 307314eb41cc38a90881ae9f26e0402ceeed04e71046014486a9908ad4520233 |
