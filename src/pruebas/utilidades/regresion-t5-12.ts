import { existsSync, mkdirSync, mkdtempSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { crearEntornoAislado } from "./entorno-aislado";
import { crearInstalacionOpenCode } from "./instalacion-opencode";
import { borrarTemporal } from "./borrar-temporal";
import { lanzar } from "./subproceso";

// Solo variables: la huella no depende de rutas temporales de archivos.
export function capturarRegresionT512() {
  const raiz = realpathSync.native(mkdtempSync(join(tmpdir(), "rige-t512-")));
  const proyecto = join(raiz, "proyecto");
  mkdirSync(proyecto);
  const git = join(proyecto, ".git");
  mkdirSync(git);
  for (const nombre of ["objects", "refs"]) mkdirSync(join(git, nombre));
  writeFileSync(join(git, "HEAD"), "ref: refs/heads/main\n");
  const instalacion = join(raiz, "bin");
  crearInstalacionOpenCode(instalacion, "1.18.25");
  const env = { ...crearEntornoAislado(raiz, process.env), ProgramData: raiz, TEMP: raiz, TMP: raiz, TMPDIR: raiz,
    RIGE_ALMACEN: join(raiz, "almacen"), PATH: instalacion + (process.platform === "win32" ? ";" : ":") + (process.env.PATH ?? ""),
    OPENCODE_CONFIG_CONTENT: '{"agent":{"build":{"temperature":0.37}},"permission":{"read":{"*":"deny","src/*":"allow"}}}',
    OPENCODE_PERMISSION: '{"bash":"ask"}' };
  try {
    const casos = [
      ["entradas"], ["valores", "--agente", "build"], ["valores", "--agente", "build", "--explicar"],
      ["permiso", "--agente", "build", "--sujeto", "read", "--objetivo", "src/a.ts"],
      ["permiso", "--agente", "build", "--sujeto", "read", "--objetivo", "src/a.ts", "--explicar"],
    ].map(argumentos => {
      const resultado = lanzar(raiz, [...argumentos, "--proyecto", proyecto], env);
      // Única normalización: el prefijo temporal conocido, también en JSON escapado.
      const normalizar = (texto: string) => texto.replaceAll(JSON.stringify(raiz).slice(1, -1), "<RAIZ>")
        .replaceAll(raiz.replaceAll("\\", "/"), "<RAIZ>");
      return { argumentos, ...resultado, salida: normalizar(resultado.salida), error: normalizar(resultado.error) };
    });
    if (existsSync(env.RIGE_ALMACEN)) throw new Error("Las consultas crearon el almacen");
    return { casos };
  } finally { borrarTemporal(raiz); }
}
