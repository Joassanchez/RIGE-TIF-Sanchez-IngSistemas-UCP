import { expect, test } from "bun:test";
import { generarTiposSalida } from "./tipos-salida";

test("RF-03 CA-2 los tipos de respuesta se generan desde el esquema publicado sin divergencia", async () => {
  const generado = await Bun.file(new URL("../paquetes/rige/aplicacion/respuestas/contrato-generado.ts", import.meta.url)).text();
  expect(generado).toBe(await generarTiposSalida());
});
