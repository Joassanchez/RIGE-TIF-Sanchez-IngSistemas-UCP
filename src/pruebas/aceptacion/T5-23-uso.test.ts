import { expect, test } from "bun:test";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, writeFileSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve, delimiter } from "node:path";
import { Database } from "bun:sqlite";
import { prepararConsultas } from "../utilidades/consultas-cli";
import { lanzar } from "../utilidades/subproceso";
import { crearEntornoAislado } from "../utilidades/entorno-aislado";
import { borrarTemporal } from "../utilidades/borrar-temporal";
import { validarEsquema } from "../utilidades/validar-esquema";

const raiz = resolve(import.meta.dir, "../..");
function inventario(directorio: string): Record<string, string> {
  if (!existsSync(directorio)) return {};
  return Object.fromEntries(readdirSync(directorio, { recursive: true, withFileTypes: true }).filter(e => e.isFile() && !/-(?:wal|shm)$/.test(e.name))
    .map(e => [join(e.parentPath, e.name).slice(directorio.length), readFileSync(join(e.parentPath, e.name)).toString("base64")]));
}
test("T5-23 L-8 estado no crea directorio/base ni modifica esquema o datos; esquema publicado", async () => {
  const e = prepararConsultas();
  const almacen = join(realpathSync.native(e.raiz), "datos propios");
  const cli = (args: string[]) => lanzar(e.raiz, args, { ...e.variables, RIGE_ALMACEN: almacen });
  try {
    const antes = inventario(e.raiz);
    const falta = cli(["estado", "--texto"]);
    expect(falta.codigo).toBe(1); expect(falta.salida).toBe("");
    expect(falta.error).toContain("Probá: bun run rige -- esquema");
    expect(existsSync(almacen)).toBe(false); expect(inventario(e.raiz)).toEqual(antes);
    expect(cli(["esquema"]).codigo).toBe(0);
    const datos = inventario(almacen);
    const estado = cli(["estado", "--json"]);
    expect(estado.codigo).toBe(0); expect(estado.error).toBe("");
    const respuesta = JSON.parse(estado.salida);
    expect(respuesta).toEqual({ esquema: 2, almacen: { ruta: join(almacen, "rige.db").replaceAll("\\", "/"), existe: true, versionEsquema: 2 } });
    expect(inventario(almacen)).toEqual(datos);
    const esquema = await Bun.file(join(raiz, "esquemas/salida/estado.json")).json();
    expect(validarEsquema(esquema, respuesta)).toEqual([]);
    const base = new Database(join(almacen, "rige.db"));
    base.exec("PRAGMA user_version = 0"); base.close();
    const incompatible = inventario(almacen);
    const r = cli(["estado", "--json"]);
    expect(r.codigo).toBe(1); expect(r.salida).toBe(""); expect(JSON.parse(r.error).error.codigo).toBe("almacen-sin-esquema");
    expect(inventario(almacen)).toEqual(incompatible);
  } finally { e.borrar(); }
});
test("T5-23 L-4 L-5 L-9 texto real por pipe, NO_COLOR vacia, --todo JSON neutro y cwd temporal", () => {
  const e = prepararConsultas("v1-precedencia");
  try {
    const env = { ...e.variables, NO_COLOR: "" };
    for (const comando of ["valores", "reglas"]) {
      const args = [comando, "--agente", "build"];
      const json = lanzar(e.raiz, [...args, "--json"], env, e.proyecto);
      expect(json.codigo, json.error).toBe(0);
      expect(lanzar(e.raiz, [...args, "--todo", "--json"], env, e.proyecto)).toEqual(json);
      const texto = lanzar(e.raiz, [...args, "--texto"], env, e.proyecto);
      expect(texto.codigo).toBe(0); expect(texto.salida).not.toContain("\x1b");
      expect(texto.salida).toContain("Proyecto: proyecto (carpeta actual)");
      expect(texto.salida).toEndWith("Respuesta completa: --json\n");
    }
    const advertida = lanzar(e.raiz, ["valores", "--agente", "build", "--texto", "--clave", "temperature"],
      { ...env, PATH: join(e.raiz, "sin-opencode") }, e.proyecto);
    expect(advertida.codigo).toBe(0); expect(advertida.salida).toContain("temperature");
    expect(advertida.error).toStartWith("Advertencia:");
    const precarga = join(e.raiz, "consola.ts");
    writeFileSync(precarga, 'Object.defineProperty(process.stdout, "isTTY", { value: true }); Object.defineProperty(process.stdout, "columns", { value: 40 });');
    for (const variables of [{ NO_COLOR: "" }, {}]) {
      const p = Bun.spawnSync([process.execPath, "--preload", precarga, join(raiz, "paquetes/rige/arranque/rige.ts"), "valores", "--agente", "build", "--clave", "temperature"], {
        cwd: e.proyecto, env: { ...crearEntornoAislado(e.raiz, process.env), ...e.variables, ...variables }, stdout: "pipe", stderr: "pipe" });
      expect(p.exitCode).toBe(0);
      expect(p.stdout.toString().includes("\x1b[90m")).toBe(!Object.hasOwn(variables, "NO_COLOR"));
    }
  } finally { e.borrar(); }
});
test("T5-23 L-10 bin, shebang sin BOM y bun run rige conservado", () => {
  const manifiesto = JSON.parse(readFileSync(join(raiz, "package.json"), "utf8"));
  expect(manifiesto.bin).toEqual({ rige: "./paquetes/rige/arranque/rige.ts" });
  expect(readFileSync(join(raiz, manifiesto.bin.rige)).subarray(0, 19).toString()).toStartWith("#!/usr/bin/env bun\n");
  const e = prepararConsultas();
  try {
    const p = Bun.spawnSync([process.execPath, "run", "rige", "--", "--version"], { cwd: raiz,
      env: { ...crearEntornoAislado(e.raiz, process.env), ...e.variables }, stdout: "pipe", stderr: "pipe" });
    expect(p.exitCode).toBe(0); expect(p.stdout.toString()).toStartWith("RIGE ");
  } finally { e.borrar(); }
});
test.skipIf(process.platform !== "win32")("T5-23 L-10 bun link aislado: PowerShell y cmd, cwd con espacios y rige.env de instalacion", () => {
  const temporal = realpathSync.native(mkdtempSync(join(tmpdir(), "rige enlace con espacios ")));
  const instalacion = join(temporal, "instalacion rige");
  const proyecto = join(temporal, "mi proyecto");
  const bin = join(temporal, "bun propio/bin");
  const almacen = join(temporal, "almacen");
  mkdirSync(instalacion); mkdirSync(proyecto); mkdirSync(bin, { recursive: true });
  const env = { ...crearEntornoAislado(temporal, process.env), RIGE_ALMACEN: almacen,
    PATHEXT: ".COM;.EXE;.BAT;.CMD", BUN_INSTALL: join(temporal, "bun propio"), PATH: [bin, dirname(process.execPath), process.env.PATH].join(delimiter) };
  try {
    for (const archivo of ["package.json", "bun.lock"]) cpSync(join(raiz, archivo), join(instalacion, archivo));
    cpSync(join(raiz, "paquetes"), join(instalacion, "paquetes"), { recursive: true, filter: p => !p.includes("node_modules") });
    cpSync(join(raiz, "esquemas"), join(instalacion, "esquemas"), { recursive: true });
    const modulos = join(instalacion, "node_modules");
    mkdirSync(join(modulos, "@rige"), { recursive: true });
    cpSync(realpathSync.native(join(raiz, "paquetes/opencode/node_modules/jsonc-parser")), join(modulos, "jsonc-parser"), { recursive: true });
    for (const nombre of ["nucleo", "opencode", "rige"]) symlinkSync(join(instalacion, "paquetes", nombre), join(modulos, "@rige", nombre), "junction");
    writeFileSync(join(instalacion, "bunfig.toml"), `env = false\n[install]\nglobalDir = ${JSON.stringify(join(temporal, "global"))}\nglobalBinDir = ${JSON.stringify(bin)}\n`);
    writeFileSync(join(instalacion, "rige.env"), "RIGE_PUERTO=4848\n");
    writeFileSync(join(proyecto, "rige.env"), "OPENCODE_PROHIBIDA=valor\n");
    const enlazado = Bun.spawnSync([process.execPath, "link"], { cwd: instalacion, env, stdout: "pipe", stderr: "pipe" });
    expect(enlazado.exitCode, enlazado.stderr.toString()).toBe(0);
    expect(readdirSync(bin).some(n => n.startsWith("rige"))).toBe(true);
    const powershell = join(process.env.SystemRoot!, "System32/WindowsPowerShell/v1.0/powershell.exe");
    const cmd = join(process.env.SystemRoot!, "System32/cmd.exe");
    for (const shell of [powershell, cmd]) {
      const ejecutar = (args: string) => Bun.spawnSync(shell === cmd ? [cmd, "/d", "/s", "/c", `rige ${args}`]
        : [powershell, "-NoProfile", "-NonInteractive", "-Command", `& rige ${args}; exit $LASTEXITCODE`], { cwd: proyecto, env, stdout: "pipe", stderr: "pipe", timeout: 10000 });
      const r = ejecutar("valores --agente build --json");
      expect(r.exitCode, r.stderr.toString()).toBe(0);
      expect(r.stdout.toString(), JSON.stringify({ shell, archivos: readdirSync(bin), error: r.stderr.toString() })).toStartWith("{");
      expect(JSON.parse(r.stdout.toString()).proyecto).toBe(realpathSync.native(proyecto).replaceAll("\\", "/"));
      const texto = ejecutar("valores --agente build --texto");
      expect(texto.exitCode).toBe(0); expect(texto.stdout.toString()).toContain("Proyecto: mi proyecto (carpeta actual)");
      expect(ejecutar("desconocido").exitCode).toBe(2);
      const falta = ejecutar("estado --json");
      expect(falta.exitCode).toBe(1); expect(JSON.parse(falta.stderr.toString()).error.codigo).toBe("almacen-sin-esquema");
      writeFileSync(join(instalacion, "rige.env"), "RIGE_PUERTO=invalido\n");
      const config = ejecutar("estado --json");
      expect(config.exitCode).toBe(1); expect(JSON.parse(config.stderr.toString()).error.mensaje).toContain("RIGE_PUERTO");
      writeFileSync(join(instalacion, "rige.env"), "RIGE_PUERTO=4848\n");
      expect(existsSync(almacen)).toBe(false);
    }
  } finally { borrarTemporal(temporal); }
}, 30000);
test("T5-23 L-11 documentos explican salidas, uso instalado y opciones", () => {
  for (const archivo of ["README.md", "MANUAL.md"]) {
    const texto = readFileSync(join(raiz, archivo), "utf8");
    for (const termino of ["bun link", "--texto", "--json", "--todo", "--help", "--version", "rige estado", "NO_COLOR", "carpeta actual", "tubería"]) expect(texto).toContain(termino);
  }
});
