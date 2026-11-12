import { expect, test } from "bun:test";

test("T5-26 U-10 instrucciones reflejan ADR-114 y la presentacion web", async () => {
  const agentes = await Bun.file("AGENTS.md").text();
  expect(agentes).toContain("Consola interactiva");
  expect(agentes).toContain("Error: …");
  expect(agentes).toContain("JSON por tubería o con `--json`");
  expect(agentes).toContain("la web no crea datos: solo presenta, filtra, cuenta o agrega lo que traen las respuestas de los casos de uso");
});

test("T5-26 U-11 documentacion con ejemplos y criterios corregidos", async () => {
  for (const archivo of ["MANUAL.md", "README.md"]) {
    const texto = await Bun.file(archivo).text();
    for (const fragmento of ["Cadena completa:\n#1 ", "Principal y subagente", "? PREGUNTA ANTES", "→ pregunta", "Existe: no", "versionEsquema: null", "entradas --todo", "en todas las filas", "resumen de lo filtrado"]) expect(texto).toContain(fragmento);
    expect(texto).not.toContain("Si falta, termina con código 1");
    expect(texto).not.toContain("`--explicar` se rechaza con código 2");
    expect(texto).not.toContain("No admite `--explicar` (código 2)");
  }
});
