import { expect, test } from "bun:test";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { copiarEscenario } from "./escenario";

test("T2-11b W-1 W-2 prepara marcadores invalidos anidados en un repositorio exterior", () => {
  for (const git of ["gitfile-roto", "dir-invalido-anidado"] as const) {
    const copia = copiarEscenario(`v2-worktree-${git}`, { git });
    try {
      expect(statSync(join(copia.raiz, ".git/objects")).isDirectory()).toBe(true);
      expect(statSync(join(copia.proyecto, ".git")).isFile()).toBe(git === "gitfile-roto");
      expect(readFileSync(join(copia.proyecto, ".git") + (git === "gitfile-roto" ? "" : "/HEAD"), "utf8"))
        .toBe(git === "gitfile-roto" ? "gitdir: ../inexistente\n" : "ref: refs/heads/main\n");
    } finally { copia.borrar(); }
  }
});

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
