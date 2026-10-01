import { afterEach, describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { crearEntornoAislado } from "../utilidades/entorno-aislado";

const raiz = resolve(import.meta.dir, "../..");
const temporales: string[] = [];
function escenario() {
  const temporal = mkdtempSync(join(tmpdir(), "rige-arranque-"));
  temporales.push(temporal);
  return temporal;
}
afterEach(() => {
  for (const temporal of temporales.splice(0)) rmSync(temporal, { recursive: true, force: true });
});

function lanzar(temporal: string, argumentos: string[], variables: Record<string, string> = {}) {
  const escucha = Bun.listen({ hostname: "127.0.0.1", port: 0, socket: { data() {} } });
  const puerto = escucha.port;
  escucha.stop(true);
  const env = { ...crearEntornoAislado(temporal, process.env), RIGE_PUERTO: String(puerto), ...variables };
  const proceso = Bun.spawnSync([process.execPath, "paquetes/rige/arranque/rige.ts", ...argumentos], {
    cwd: raiz, env, stdout: "pipe", stderr: "pipe",
  });
  return { codigo: proceso.exitCode, salida: proceso.stdout.toString(), error: proceso.stderr.toString() };
}

describe("A-1", () => {
  test("prepara una carpeta nueva y repite la respuesta byte a byte", () => {
    const temporal = escenario();
    const directorio = join(temporal, "nuevo", "almacen");
    expect(existsSync(directorio)).toBe(false);
    const primera = lanzar(temporal, ["esquema"], { RIGE_ALMACEN: directorio });
    expect(primera.codigo).toBe(0);
    expect(primera.error).toBe("");
    const respuesta = {
      esquema: 1, versionRige: "0.1.0",
      almacen: { ruta: join(directorio, "rige.db").replaceAll("\\", "/"), versionEsquema: 1 },
    };
    expect(JSON.parse(primera.salida)).toEqual(respuesta);
    expect(primera.salida).toBe(JSON.stringify(respuesta) + "\n");
    const segunda = lanzar(temporal, ["esquema"], { RIGE_ALMACEN: directorio });
    expect(segunda).toEqual(primera);
  });
});

describe("A-2", () => {
  test("rechaza el puerto invalido y conserva la version de una base incompatible", () => {
    const temporal = escenario();
    const puertoInvalido = lanzar(temporal, ["esquema"], { RIGE_PUERTO: "abc" });
    expect(puertoInvalido.codigo).toBe(1);
    expect(puertoInvalido.salida).toBe("");
    const errorPuerto = JSON.parse(puertoInvalido.error);
    expect(errorPuerto).toEqual({
      esquema: 1,
      error: { codigo: "configuracion-invalida", mensaje: expect.stringContaining("RIGE_PUERTO") },
    });
    expect(puertoInvalido.error).toBe(JSON.stringify(errorPuerto) + "\n");
    const ruta = join(temporal, "rige.db");
    const base = new Database(ruta, { create: true });
    try { base.exec("PRAGMA user_version = 2"); }
    finally { base.close(); }
    const incompatible = lanzar(temporal, ["esquema"]);
    expect(incompatible.codigo).toBe(1);
    expect(incompatible.salida).toBe("");
    const errorAlmacen = JSON.parse(incompatible.error);
    expect(errorAlmacen).toEqual({
      esquema: 1,
      error: { codigo: "almacen-sin-esquema", mensaje: expect.stringContaining("bun run esquema") },
    });
    expect(incompatible.error).toBe(JSON.stringify(errorAlmacen) + "\n");
    const lectura = new Database(ruta, { readonly: true });
    try { expect(lectura.query("PRAGMA user_version").get()).toEqual({ user_version: 2 }); }
    finally { lectura.close(); }
  });
});

describe("A-3", () => {
  test("rechaza el subcomando desconocido por el canal de error", () => {
    const temporal = escenario();
    const resultado = lanzar(temporal, ["otro"]);
    expect(resultado.codigo).toBe(2);
    expect(resultado.salida).toBe("");
    const error = JSON.parse(resultado.error);
    expect(error).toEqual({
      esquema: 1,
      error: { codigo: "argumentos-invalidos", mensaje: expect.stringContaining("otro") },
    });
    expect(resultado.error).toBe(JSON.stringify(error) + "\n");
  });
});

describe("A-4", () => {
  test("un archivo como directorio provoca falla interna sin crear logs", () => {
    const temporal = escenario();
    const archivo = join(temporal, "almacen");
    writeFileSync(archivo, "archivo regular");
    const antes = readdirSync(temporal, { recursive: true }).sort();
    const normal = lanzar(temporal, ["esquema"], { RIGE_ALMACEN: archivo });
    expect(normal).toEqual({
      codigo: 70, salida: "",
      error: JSON.stringify({ esquema: 1, error: { codigo: "interno", mensaje: "Falla interna de RIGE." } }) + "\n",
    });
    expect(readdirSync(temporal, { recursive: true }).sort()).toEqual(antes);
    const depurado = lanzar(temporal, ["esquema", "--depurar"], { RIGE_ALMACEN: archivo });
    expect(depurado.codigo).toBe(70);
    expect(depurado.salida).toBe("");
    const error = JSON.parse(depurado.error);
    expect(error).toEqual({
      esquema: 1,
      error: { codigo: "interno", mensaje: "Falla interna de RIGE.", stack: expect.any(String) },
    });
    expect(error.error.stack.length).toBeGreaterThan(0);
    expect(depurado.error).toBe(JSON.stringify(error) + "\n");
    expect(readdirSync(temporal, { recursive: true }).sort()).toEqual(antes);
  });
});
