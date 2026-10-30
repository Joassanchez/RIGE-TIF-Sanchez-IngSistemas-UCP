# Salida de RIGE · esquema 2

Contratos JSON Schema draft 2020-12: `valores.json`, `permiso.json`,
`agentes.json`, `error.json` y `advertencia.json`. Cada objeto raiz exige `esquema: 2`.
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

`advertencia.json` describe cada linea del canal de error con codigo de salida
0 cuando la version instalada no es determinable (ADR-102). Contiene
`advertencia: { codigo, mensaje }`. Los codigos y sus textos tambien figuran
en `declaraciones` y `reglas` de la respuesta de valores, permiso o agentes;
esos contratos conservan su estructura y version.
