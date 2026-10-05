import { cpSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

export function copiarEscenario(nombre: string): { readonly raiz: string; readonly proyecto: string; borrar(): void } {
  const origen = join(import.meta.dir, "../escenarios", nombre);
  const raiz = realpathSync.native(mkdtempSync(join(tmpdir(), "rige-escenario-")));
  cpSync(origen, raiz, { recursive: true, filter: ruta => basename(ruta) !== "REFERENCIA.json" });
  mkdirSync(join(raiz, ".git"));
  writeFileSync(join(raiz, ".git/HEAD"), "ref: refs/heads/main\n");
  return { raiz, proyecto: realpathSync.native(join(raiz, "proyecto")), borrar: () => rmSync(raiz, { recursive: true, force: true }) };
}
