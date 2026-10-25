import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { copiarEscenario } from "./escenario";

test("T2-08 reemplaza RAIZ al copiar: JSON valido, ruta nativa completa y fuente intacta", () => {
  const fuente = join(import.meta.dir, "../escenarios/v2-ruta-bloqueo/proyecto/opencode.jsonc");
  const antes = readFileSync(fuente, "utf8");
  for (const rutasNativas of [false, true]) {
    const copia = copiarEscenario("v2-ruta-bloqueo", { git: "proyecto", rutasNativas });
    try {
      const texto = readFileSync(join(copia.proyecto, "opencode.jsonc"), "utf8");
      const datos = JSON.parse(texto);
      const prefijo = rutasNativas ? join(copia.proyecto, "src/productos.js") : `${copia.raiz.replaceAll("\\", "/")}/proyecto/src/productos.js`;
      expect(datos.agent.a.permission.read[prefijo]).toBe("allow");
      expect(texto).not.toContain("<RAIZ>");
    } finally { copia.borrar(); }
  }
  expect(readFileSync(fuente, "utf8")).toBe(antes);
});
