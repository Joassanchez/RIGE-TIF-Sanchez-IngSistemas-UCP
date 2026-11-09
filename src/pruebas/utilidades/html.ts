import { expect } from "bun:test";

// Comprueba la existencia antes de que una posición -1 pueda validar un orden falso.
export function seccionHtml(cuerpo: string, id: string, etiqueta = "section"): string {
  const bloque = new RegExp(`<${etiqueta}[^>]*id="${id}"[^>]*>(.*?)</${etiqueta}>`, "s").exec(cuerpo);
  expect(bloque).not.toBeNull();
  return bloque![1]!;
}
