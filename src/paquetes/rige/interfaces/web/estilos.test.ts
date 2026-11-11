import { describe, expect, test } from "bun:test";
import { estilos } from "./estilos";

// Regresion del CSS servido, sin simular medidas de un navegador.
function reglas(css: string, selector: string): string {
  return [...css.replace(/\/\*[^]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selectores]) => selectores!.split(",").some(s => s.trim() === selector))
    .map(([, , declaraciones]) => declaraciones).join("\n");
}

describe("T5-10 diseno responsive a 360 y 390 px", () => {
  const movil = estilos.split("@media (max-width: 760px) {")[1]?.split("@media (prefers-reduced-motion")[0] ?? "";

  test("C1 limita la pagina y permite contraer los contenedores y cortar rutas largas", () => {
    for (const selector of ["html", "body"]) {
      expect(reglas(estilos, selector)).toMatch(/overflow-x:\s*clip/);
      expect(reglas(estilos, selector)).toMatch(/max-width:\s*100%/);
    }
    expect(reglas(estilos, "body")).toMatch(/overflow-wrap:\s*anywhere/);
    for (const selector of ["main", ".cabecera__interior", ".rejilla", ".grupo-campos", ".resumen", ".selector-agente", ".pie"])
      expect(reglas(estilos, selector)).toMatch(/min-width:\s*0/);
    for (const selector of ["code", ".ruta", ".ruta__segmento", ".ruta__archivo"]) {
      expect(reglas(estilos, selector)).toMatch(/overflow-wrap:\s*anywhere/);
      expect(reglas(estilos, selector)).not.toMatch(/white-space:\s*nowrap/);
    }
  });

  test("C2 mantiene las tablas anchas dentro de un contenedor desplazable", () => {
    const contenedor = reglas(estilos, ".tabla-contenedor");
    expect(contenedor).toMatch(/overflow-x:\s*auto/);
    expect(contenedor).toMatch(/min-width:\s*0/);
    expect(contenedor).toMatch(/max-width:\s*100%/);
  });

  test("C3 apila el encabezado y da a la navegacion su propio desplazamiento", () => {
    expect(movil).not.toBe("");
    expect(reglas(movil, ".cabecera__interior")).toMatch(/flex-direction:\s*column/);
    expect(reglas(movil, "nav")).toMatch(/overflow-x:\s*auto/);
    expect(reglas(movil, "nav")).toMatch(/flex-wrap:\s*nowrap/);
    expect(reglas(movil, "nav a")).toMatch(/flex-shrink:\s*0/);
  });

  test("C4 presenta todos los metadatos en una columna en movil", () => {
    expect(reglas(movil, ".resumen")).toMatch(/grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  });

  test("C5 extiende formularios y botones al ancho disponible en movil", () => {
    for (const selector of ["form", "button", ".boton", ".selector-agente select"])
      expect(reglas(movil, selector)).toMatch(/width:\s*100%/);
    for (const selector of [".selector-agente", ".acciones"])
      expect(reglas(movil, selector)).toMatch(/flex-direction:\s*column/);
    expect(reglas(movil, ".grupo-campos")).toMatch(/grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  });

  test("C6 usa escala compacta incluso en paginas de error", () => {
    for (const selector of ["h1", ".cabecera-pagina h1", ".pagina-error h1"])
      expect(reglas(estilos, selector)).toMatch(/font-size:\s*1\.75rem/);
    expect(reglas(estilos, "h2")).toMatch(/font-size:\s*1\.25rem/);
    expect(reglas(estilos, "h3")).toMatch(/font-size:\s*1rem/);
  });
});
