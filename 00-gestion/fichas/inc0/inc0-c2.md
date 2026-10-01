# Ficha inc0-c2 · Web: escape cerrado por tipos, respuesta HTML única y cabeceras de defensa

- **Incremento / rama:** 0 · `inc0-esqueleto` (mejoras de la revisión del incremento: C3 y C4). Va **después** de inc0-c4.
- **Escritor:** `gpt-6.1-sol`, esfuerzo `high`
- **Riesgo:** medio
- **Fuentes (leé solo estas secciones):**
  - ADR-062, «C2 · Web» (escape por defecto; «insertar HTML sin escapar exige una función explícita») (`../00-gestion/decisiones/ADR-062-distribucion-web-dependencias-configuracion.md`);
  - ADR-058, convención 6;
  - `AGENTS.md` §5 («Web»), §6 y §7.

## 1. Qué hay que hacer

- **C3.** Hoy `HtmlSeguro` se exporta con constructor público, así que `new HtmlSeguro(x)` se saltea el escape. Cambios:
  - la clase deja de exportarse como valor: solo se exporta su **tipo**;
  - `sinEscapar` se elimina, porque no tiene ningún uso;
  - se elimina la guarda P-2, que deja de ser necesaria: la garantía pasa al sistema de tipos, porque solo `html` produce `HtmlSeguro`.
- **C4.** Las cinco construcciones de `new Response(…, { "Content-Type" })` se unifican en una función `responderHtml`, que además agrega cabeceras de defensa en profundidad. `paginaErrorUso` decide el estado HTTP con un mapa **exhaustivo** por código.

No cambia ningún contenido de página ni ningún estado HTTP vigente.

## 2. Archivos

| Archivo | Acción |
|---|---|
| `paquetes/rige/interfaces/web/plantillas.ts` | Ampliar |
| `paquetes/rige/interfaces/web/plantillas.test.ts` | Ampliar: quitar P-2 y su escáner; agregar W-6 |
| `paquetes/rige/interfaces/web/respuesta.ts` | Crear |
| `paquetes/rige/interfaces/web/respuesta.test.ts` | Crear |
| `paquetes/rige/interfaces/web/paginas/inicio.ts` | Ampliar: usar `responderHtml` |
| `paquetes/rige/interfaces/web/intermedios/errores.ts` | Ampliar: `responderHtml` y mapa de estados |
| `paquetes/rige/interfaces/web/intermedios/errores.test.ts` | Ampliar |
| `paquetes/rige/interfaces/web/intermedios/origen.ts` | Ampliar: usar `responderHtml` |
| `paquetes/rige/interfaces/web/servidor.ts` | Ampliar: usar `responderHtml` en el 404 |

No toques ningún otro archivo. Las pruebas existentes de inicio, origen, servidor y RNF-09 deben pasar **sin cambios**.

## 3. Interfaces

```ts
// plantillas.ts
class HtmlSeguro { constructor(readonly texto: string) {} }  // NO exportada como valor
export type { HtmlSeguro };
export function html(partes: TemplateStringsArray, ...valores: readonly unknown[]): HtmlSeguro; // sin cambios de comportamiento
// sinEscapar: eliminada

// respuesta.ts
export function responderHtml(estado: number, pagina: HtmlSeguro, cabeceras?: Readonly<Record<string, string>>): Response;
// Siempre: Content-Type: text/html; charset=utf-8
//          Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'
//          X-Content-Type-Options: nosniff
//          Cache-Control: no-store
//          Referrer-Policy: no-referrer
// `cabeceras` se suma (p. ej., Allow: GET en el 405). Nunca Access-Control-*.

// intermedios/errores.ts
const estadoPorCodigo: Record<ErrorUso["codigo"], number> =
  { "almacen-sin-esquema": 503, "configuracion-invalida": 500, "puerto-ocupado": 500 };
// Record exhaustivo: un código nuevo en ErrorUso hace fallar la verificación de tipos hasta decidir su estado.
```

**Decisión del ingeniero:** `form-action 'self'` en lugar de `'none'`, porque ADR-062 C2 prevé el formulario GET de selección en `/`.

## 4. Patrones existentes a imitar

- **Respuesta y página fija:** tomá el esqueleto HTML de `intermedios/origen.ts` (`rechazar`) y de `servidor.ts` (404); `responderHtml` reemplaza exactamente su `new Response`.
- **Pruebas:** `Request` y `Response` en memoria, como `servidor.test.ts` (W-4) y `origen.test.ts` (O-4). Las cabeceras se leen en minúsculas con `Headers.keys()`.
- **Imports de interfaces:** solo `aplicacion/{casos-uso,respuestas,errores}` y la propia capa.

## 5. Reglas de comportamiento (una prueba por regla, con el ID en el `describe`)

| ID | Regla |
|---|---|
| W-6 | El módulo `plantillas.ts` no exporta en tiempo de ejecución ni `HtmlSeguro` ni `sinEscapar` (`Object.keys(await import("./plantillas"))` es `["html"]`); un valor con `<script>` interpolado en `html` sale escapado (W-1 sigue igual) |
| W-7 | `responderHtml` pone las cinco cabeceras de §3 con esos valores exactos, conserva las adicionales y no agrega ninguna `access-control-*` |
| W-8 | Toda respuesta de `crearManejador` (200, 404, 403 de Host, 403 de Sec-Fetch-Site, 405, 503 y 500) lleva `Content-Security-Policy` y `X-Content-Type-Options: nosniff` |
| W-9 | `paginaErrorUso` responde 503 para `almacen-sin-esquema` y 500 para `configuracion-invalida` y `puerto-ocupado` |

## 6. Pruebas

Unitarias puras, junto al código. RNF-09 y la aceptación de `servir` se ejecutan sin cambios como regresión.

## 7. Comandos

Desde `src/`, con `RIGE_ALMACEN` en un temporal en todo comando:

```bash
bun test paquetes/rige/interfaces/web pruebas/aceptacion   # durante el trabajo
bun test                                                   # una vez, al final
bun run verificar                                          # una vez, al final
```

## 8. Resultado esperado y detención

- **Pruebas:** `bun test` completo en verde. **`verificar`:** PASS.
- **Commit:** `refactor: escape cerrado, respuesta HTML unica y cabeceras de defensa (inc0-c2)`, con rojo → verde por regla (W-6 a W-9) y los resultados finales. Agregá solo los archivos de §2.
- **Respuesta final:** el JSON del esquema `../00-gestion/fichas/esquema-salida-escritor.json`.
- **Temporales:** si el sandbox no te deja borrar un temporal tuyo, nombralo en `notas` y commiteá igual.
- **Detenete sin commitear** si:
  - una prueba existente de inicio, origen, servidor o RNF-09 tiene que cambiar su expectativa;
  - hace falta tocar otro archivo;
  - una guarda de arquitectura falla.
