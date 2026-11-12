import { expect, test } from "bun:test";
import { estilos } from "./estilos";

test("T5-26 U-8 elimina la pagina sin ruta y los restos sin consumidores", async () => {
  expect(await Bun.file(new URL("./paginas/agentes.ts", import.meta.url)).exists()).toBe(false);
  expect(await Bun.file(new URL("./textos.ts", import.meta.url)).text()).not.toContain("presentarInstante");
  expect(await Bun.file(new URL("./diseno.ts", import.meta.url)).text()).not.toContain("readonly almacen?");
  expect(await Bun.file(new URL("./panel.ts", import.meta.url)).text()).not.toContain('"Agentes"');
  expect(await Bun.file(new URL("../cli/texto/index.ts", import.meta.url)).text()).not.toContain('"parcial"');
  for (const selector of ["rejilla", "grupo-campos", "filtros", "paso", "ayuda", "comparacion-flecha", "estadistica--cero", "estadistica--mini", "estadisticas--elementos", "motivo-origen", "leyenda-reglas", "insignia--implicita"]) expect(estilos).not.toMatch(new RegExp(`\\.${selector}(?![\\w-])`));
});
