import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { copiarEscenario } from "./escenario";
import { entornoDeReferencia } from "./entorno-referencia";

describe("T3-03 entorno de referencia", () => {
  test("aplica rutas y textos de variables a una copia sin heredar configuracion real", async () => {
    const referencia = await Bun.file(join(import.meta.dir, "../escenarios/v3-entradas/REFERENCIA.json")).json();
    const copia = copiarEscenario("v3-entradas", { git: "proyecto" });
    try {
      const env = entornoDeReferencia(referencia, copia);
      expect(env.OPENCODE_CONFIG_DIR).toBe(join(copia.raiz, "dir-variable"));
      expect(env.OPENCODE_CONFIG).toBe(join(copia.raiz, "externa/config.json"));
      expect(env.OPENCODE_CONFIG_CONTENT).toContain("MARCA-T303-COMENTARIO-7f3c19a4");
      expect(JSON.parse(env.OPENCODE_PERMISSION!).bash).toEqual({ "t7-permiso *": "deny" });
      expect(env.HOME).toBe(join(copia.raiz, "hogar"));
      expect(env.XDG_CONFIG_HOME).toBe(join(copia.raiz, "hogar/.config"));
    } finally { copia.borrar(); }
  });
});
