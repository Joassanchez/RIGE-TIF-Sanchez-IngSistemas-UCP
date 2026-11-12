import { expect, test } from "bun:test";

test("T5-26 U-7 clave legible y puntero JSON junto al analizador", async () => {
  const { textoDesdeRuta, rutaDesdeTexto } = await import("./claves");
  for (const ruta of [["options", "model"], ["a.b", "c/d", "~1"], ["/", "~"]]) {
    expect(rutaDesdeTexto(textoDesdeRuta(ruta))).toEqual({ exito: true, valor: ruta });
  }
  expect(textoDesdeRuta(["options", "model"])).toBe("options.model");
  expect(textoDesdeRuta(["a.b", "c/d", "~1"])).toBe("/a.b/c~1d/~01");
});
