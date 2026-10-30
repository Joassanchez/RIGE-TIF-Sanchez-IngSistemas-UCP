import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, posix, win32 } from "node:path";

export function instalacionEnMemoria(directorio: string, version: string | null) {
  const { join } = /^[A-Za-z]:|\\/.test(directorio) ? win32 : posix;
  const archivos: Record<string, string> = {
    [join(directorio, "opencode")]: "Instalacion falsa: no ejecutar.\n",
    [join(directorio, "opencode.cmd")]: "Instalacion falsa: no ejecutar.\n",
  };
  if (version !== null) archivos[join(directorio, "node_modules/opencode-ai/package.json")] = JSON.stringify({ name: "opencode-ai", version });
  return { archivos, variables: { PATH: directorio } };
}

export function crearInstalacionOpenCode(directorio: string, version: string | null): void {
  for (const [ruta, texto] of Object.entries(instalacionEnMemoria(directorio, version).archivos)) {
    mkdirSync(dirname(ruta), { recursive: true });
    writeFileSync(ruta, texto);
  }
}
