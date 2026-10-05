import { expect, test } from "bun:test";

test("D-1 el archivo de lectura tiene las ocho secciones completas y un escenario existente", async () => {
  const raiz = new URL("../../", import.meta.url);
  const readme = await Bun.file(new URL("README.md", raiz)).text();
  expect(readme.match(/^## \d\. .+$/gm)).toEqual([
    "## 1. Identificación",
    "## 2. Qué hace este prototipo",
    "## 3. Requisitos previos",
    "## 4. Instalación",
    "## 5. Configuración",
    "## 6. Ejecución y verificación",
    "## 7. Estado del canal de construcción",
    "## 8. Declaración de herramientas auxiliares",
  ]);
  expect(readme).not.toContain("[DATO PENDIENTE");
  const ejecucion = readme.split("## 6. Ejecución y verificación")[1]!.split("## 7.")[0]!;
  const escenario = /`(pruebas\/escenarios\/[^`]+\/proyecto)`/.exec(ejecucion);
  expect(escenario).not.toBeNull();
  expect(await Bun.file(new URL(`${escenario![1]}/opencode.jsonc`, raiz)).exists()).toBe(true);
  const pasoSeis = /^6\. .+$/m.exec(ejecucion)?.[0];
  for (const texto of ["sustituciones", "Markdown", "`mode`", "`disable`", "claves derivadas", "no resueltas en el prototipo v1",
    "las claves afectadas", "la clave o el agente consultado", "la página de error", "`clave-no-resuelta`", "HTTP 422",
    "no se crea la resolución", "Una sustitución fuera de una cadena", "un `mode` que no es objeto",
    "detienen el análisis con `contenido-no-soportado`"]) {
    expect(pasoSeis).toContain(texto);
  }
  expect(pasoSeis).not.toContain("el resto del recorrido no cambia");
  expect(ejecucion).toMatch(/\| 1 \| Error de uso de la CLI \|/);
  const erroresWeb = /La web presenta[^\n]+/.exec(ejecucion)?.[0];
  for (const texto of ["400", "`solicitud-invalida`", "404", "`proyecto-inexistente`", "`resolucion-inexistente`",
    "`agente-sin-declaraciones`", "`clave-inexistente`", "422", "`via-no-soportada`", "`contenido-no-soportado`", "`entrada-ilegible`", "`clave-no-resuelta`"]) {
    expect(erroresWeb).toContain(texto);
  }
  const canal = readme.split("## 7. Estado del canal de construcción")[1]!.split("## 8.")[0]!;
  expect(canal).toMatch(/RF-01\.test\.ts[^\n]+v1-vias/);
  expect(canal).toMatch(/recorrido-v1\.test\.ts[^\n]+V-0/);
  const herramientas = readme.split("## 8. Declaración de herramientas auxiliares")[1]!;
  const fila = /^\| 05\/10\/2026 \(prototipo v1, V1-01 a V1-09\).+$/m.exec(herramientas)?.[0];
  for (const texto of ["gpt-6.1-sol", "claude-opus-5-5", "gpt-6-luna", "critico-codigo", "Opus 5.5",
    "opencode-windows-x64@1.18.25", "ejecutado una vez por el ingeniero", "Escritura, revisión y generación de referencias",
    "1b684d5", "pruebas/escenarios/*/REFERENCIA.json"]) {
    expect(fila).toContain(texto);
  }
});
