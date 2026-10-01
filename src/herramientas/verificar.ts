import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const temporal = mkdtempSync(join(tmpdir(), "rige-verificar-"));
let codigo = 0;
try {
  const raiz = await Bun.file("tsconfig.json").json() as { references: { path: string }[] };
  // Cada proyecto se comprueba sin emitir ni reutilizar resultados incrementales.
  // La configuracion derivada conserva las opciones e inclusiones del original.
  for (const ruta of [".", ...raiz.references.map((referencia) => referencia.path)]) {
    const original = resolve(ruta, "tsconfig.json");
    const fuentes = [...new Bun.Glob("**/*.ts").scanSync({
      cwd: resolve(ruta === "." ? "pruebas" : ruta), onlyFiles: true,
    })];
    if (!fuentes.length) {
      console.error(`Typecheck pendiente (sin fuentes): ${ruta}`);
      continue;
    }
    const config = join(temporal, "tsconfig.json");
    writeFileSync(config, JSON.stringify({
      extends: original, references: [],
      compilerOptions: {
        composite: false, incremental: false, noEmit: true,
        typeRoots: [resolve("node_modules/@types")],
      },
    }));
    codigo = Bun.spawnSync([process.execPath, "run", "tsc", "--noEmit", "-p", config], {
      stdout: "inherit", stderr: "inherit",
    }).exitCode ?? 1;
    if (codigo) break;
  }
  // El bundle comprueba el ensamblado, pero nunca se imprime ni queda en src/.
  if (!codigo) {
    codigo = Bun.spawnSync([
      process.execPath, "build", "./paquetes/rige/arranque/rige.ts", "--target=bun",
      "--outdir", join(temporal, "bundle"),
    ], { stdout: "inherit", stderr: "inherit" }).exitCode ?? 1;
  }
} finally {
  rmSync(temporal, { recursive: true, force: true });
}
process.exit(codigo);
