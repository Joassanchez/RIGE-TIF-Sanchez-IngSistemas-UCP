# Ficha <ID> · <Título>

<!-- Plantilla de ficha (ADR-067). Una página. La escribe el ingeniero; el escritor la ejecuta sin ampliarla.
     Probada en T0-10: lo que faltó allí está marcado con «Lección». -->

- **Incremento / rama:** <n> · `<rama>`
- **Escritor:** `gpt-6.1-sol`, esfuerzo `medium` <!-- high si es compleja; gpt-6-luna si es mecánica -->
- **Riesgo:** bajo | medio | alto <!-- alto: /programar suma revisor-codigo -->
- **Fuentes (leé solo estas secciones):**
  - <ADR-NNN, «sección»>;
  - <ficha del catálogo, CA-n>;
  - `AGENTS.md` §<n>.

## 0. Antes de empezar (opcional)

<!-- Commits previos que la tarea arrastra (por ejemplo, cambios de AGENTS.md). Si no hay, borrar esta sección. -->

## 1. Qué hay que hacer

<Dos o tres oraciones: el comportamiento que queda andando y lo que explícitamente no se hace (va en tal tarea).>

## 2. Archivos

| Archivo | Acción |
|---|---|
| `<ruta desde src/>` | Crear / Ampliar / No tocar |

No toques ningún otro archivo. <Exclusiones explícitas, si las hay.>

## 3. Interfaces

<Firmas exactas que se crean o se usan (bloque ts). Tipos existentes que se reutilizan sin cambiar su firma.>

## 4. Patrones existentes a imitar

<!-- Lección de T0-10: la ficha omitió que los adaptadores importan errores solo a través del puerto (`aplicacion/puertos/almacen.ts` reexporta `errorAlmacenSinEsquema`), y el escritor tuvo que detenerse. Citá aquí el archivo y el patrón concreto para cada capa que la tarea toca. -->

- <Capa o problema>: imitá `<archivo>` (<qué patrón: reexportación, inyección del entorno, forma de las pruebas…>).

## 5. Reglas de comportamiento (una prueba por regla, con el ID en el `describe`)

| ID | Regla |
|---|---|
| <X-1> | <Condición → resultado, con valores> |

## 6. Pruebas

<Dónde van, cómo se aíslan (entorno inyectado, temporales que se borran, nunca `process.env`) y qué casos son obligatorios (plataformas, bordes).>

## 7. Comandos

Desde `src/`, con `RIGE_ALMACEN` en un temporal en todo comando:

```bash
bun test <archivos de la tarea>   # durante el trabajo
bun test                          # una vez, al final
bun run verificar                 # una vez, al final
```

## 8. Resultado esperado y detención

- **Pruebas:** `bun test` completo en verde. **`verificar`:** <resultado esperado>.
- **Commit:** mensaje `<tipo>: <descripción> (<ID>)`, con una línea rojo → verde por regla y el resultado final de `bun test` y `verificar`. Agregá solo los archivos de §2.
- **Respuesta final:** el JSON del esquema `../00-gestion/fichas/esquema-salida-escritor.json` (lo exige `/programar`).
- **Detenete sin commitear** (estado `detenida`, con la pregunta y la opción que proponés) si:
  - una regla contradice un ADR;
  - hace falta tocar otro archivo o agregar una dependencia;
  - una prueba de arquitectura falla y la solución exige relajarla.
