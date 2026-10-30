import { borrarTemporal } from "./borrar-temporal";
import { describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { crearEntornoAislado } from "./entorno-aislado";

function codigoComprobacion(): string {
  const flujo = readFileSync(resolve(import.meta.dir, "../../../.github/workflows/ci.yml"), "utf8");
  const paso = flujo.match(/- name: Comprobar version instalada sin advertencias\r?\n\s+run: \|\r?\n\s+bun -e '\r?\n([^]*?)\r?\n\s+'(?:\r?\n|$)/);
  expect(paso).not.toBeNull();
  expect(flujo.indexOf("bun run referencias")).toBeLessThan(flujo.indexOf("- name: Comprobar version instalada"));
  return paso![1]!;
}

describe("T3-01-c1 P-1 comprobacion CI", () => {
  test("el paso usa el PATH heredado y rechaza codigos no cero y advertencias JSON entre lineas de Bun", () => {
    const codigo = codigoComprobacion();
    const temporal = mkdtempSync(join(tmpdir(), "rige-sonda-ci-"));
    try {
      const sonda = join(temporal, "sonda.ts");
      writeFileSync(sonda, `
        import { existsSync, readdirSync } from "node:fs";
        Bun.spawnSync = (args, opciones) => {
          if (JSON.stringify(args.slice(1, -1)) !== JSON.stringify(["run", "rige", "agentes", "--proyecto"])) throw Error("Comando incorrecto");
          if (args[0] !== process.execPath || readdirSync(args.at(-1)).length) throw Error("Proyecto no vacio");
          if (opciones.env.PATH !== process.env.PATH) throw Error("PATH alterado");
          if (!opciones.env.RIGE_ALMACEN || existsSync(opciones.env.RIGE_ALMACEN)) throw Error("Almacen no temporal");
          return { exitCode: JSON.parse(process.env.CODIGO_PRUEBA), stdout: Buffer.from("{}\\n"), stderr: Buffer.from(process.env.ERROR_PRUEBA) };
        };
      `);
      for (const caso of [
        { codigo: 0, error: "", pasa: true },
        { codigo: 0, error: '$ bun ./arranque.ts\n{"esquema":2}\n', pasa: true },
        { codigo: 1, error: "", pasa: false },
        { codigo: null, error: "", pasa: false },
        { codigo: 0, error: '$ bun ./arranque.ts\n{"advertencia":{"codigo":"version-no-determinada"}}\n', pasa: false },
      ]) {
        const resultado = Bun.spawnSync([process.execPath, "--preload", sonda, "-e", codigo], {
          cwd: resolve(import.meta.dir, "../.."), env: { ...crearEntornoAislado(temporal, process.env),
            CODIGO_PRUEBA: JSON.stringify(caso.codigo), ERROR_PRUEBA: caso.error }, stdout: "pipe", stderr: "pipe" });
        expect({ caso, pasa: resultado.exitCode === 0 }).toEqual({ caso, pasa: caso.pasa });
      }
    } finally { borrarTemporal(temporal); }
  });
  test("el paso bash corre con la CLI real y el PATH aislado heredado", () => {
    const codigo = codigoComprobacion();
    const temporal = mkdtempSync(join(tmpdir(), "rige-ci-real-"));
    try {
      const git = Bun.which("git");
      const bashGit = git === null ? undefined : ["../bin/bash.exe", "../usr/bin/bash.exe", "../../usr/bin/bash.exe"]
        .map(ruta => resolve(dirname(git), ruta)).find(existsSync);
      const bash = process.platform === "win32" ? bashGit : Bun.which("bash");
      if (!bash) throw new Error("La comprobacion CI requiere Bash (Git Bash en Windows).");
      const resultado = Bun.spawnSync([bash, "-e", "-o", "pipefail", "-c", `bun -e '${codigo}'`], { cwd: resolve(import.meta.dir, "../.."),
        env: crearEntornoAislado(temporal, process.env), stdout: "pipe", stderr: "pipe" });
      expect(resultado.exitCode).toBe(0);
      expect(JSON.parse(resultado.stdout.toString())).toMatchObject({ esquema: 2, declaraciones: expect.not.arrayContaining(["version-no-determinada"]) });
    } finally { borrarTemporal(temporal); }
  });
});
