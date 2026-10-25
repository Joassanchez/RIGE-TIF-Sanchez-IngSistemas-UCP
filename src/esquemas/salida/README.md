# Salida de RIGE · esquema 2

Contratos JSON Schema draft 2020-12: `valores.json`, `permiso.json`,
`agentes.json` y `error.json`. Cada objeto raiz exige `esquema: 2`.
Los objetos de estructura fija rechazan campos extra; los diccionarios de
reglas y valores JSON admiten nombres libres con contenido tipado.

Estos esquemas son la fuente de verdad de los tipos publicos. El comando
`bun herramientas/tipos-salida.ts` genera
`paquetes/rige/aplicacion/respuestas/contrato-generado.ts`; una prueba exige
que el archivo versionado coincida con la generacion. No se edita a mano.

`pruebas/utilidades/validar-esquema.ts` valida el subconjunto utilizado sin
dependencias y lanza ante keywords desconocidas. `$ref` solo admite punteros
locales al mismo documento. `explicacion` en permisos es `null` sin
`--explicar` y una lista de textos al solicitarla. El listado de agentes
declara sus eliminaciones y si es incompleto por vias no observadas.
