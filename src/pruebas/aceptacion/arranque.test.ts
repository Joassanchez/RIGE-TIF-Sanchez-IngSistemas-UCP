import { afterEach, describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { lanzar, lanzarServidor } from "../utilidades/subproceso";
import { solicitarLocal } from "../utilidades/cliente-http-local";
import { versionRige } from "../../paquetes/rige/aplicacion/respuestas/estado";

const temporales: string[] = [];
function escenario() {
  const temporal = mkdtempSync(join(tmpdir(), "rige-arranque-"));
  temporales.push(temporal);
  return temporal;
}
afterEach(() => {
  for (const temporal of temporales.splice(0)) rmSync(temporal, { recursive: true, force: true });
});

describe("A-1", () => {
  test("prepara una carpeta nueva y repite la respuesta byte a byte", () => {
    const temporal = escenario();
    const directorio = join(temporal, "nuevo", "almacen");
    expect(existsSync(directorio)).toBe(false);
    const primera = lanzar(temporal, ["esquema"], { RIGE_ALMACEN: directorio });
    expect(primera.codigo).toBe(0);
    expect(primera.error).toBe("");
    const respuesta = {
      esquema: 1, versionRige,
      almacen: { ruta: join(directorio, "rige.db").replaceAll("\\", "/"), versionEsquema: 1 },
    };
    expect(JSON.parse(primera.salida)).toEqual(respuesta);
    expect(primera.salida).toBe(JSON.stringify(respuesta) + "\n");
    const segunda = lanzar(temporal, ["esquema"], { RIGE_ALMACEN: directorio });
    expect(segunda).toEqual(primera);
  });
});

describe("A-5", () => {
  test("sirve el estado preparado con paridad y una pagina 404 por subproceso", async () => {
    const temporal = escenario();
    const preparada = lanzar(temporal, ["esquema"]);
    expect(preparada.codigo).toBe(0);
    const estado = JSON.parse(preparada.salida);
    const servidor = await lanzarServidor(temporal, {});
    const { puerto } = servidor;
    try {
      expect(servidor.direccion).toBe(`http://127.0.0.1:${puerto}`);
      const inicio = await solicitarLocal({ host: "127.0.0.1", puerto, ruta: "/" });
      expect(inicio.estado).toBe(200);
      expect(inicio.cuerpo).toContain(`RIGE ${estado.versionRige}`);
      expect(inicio.cuerpo).toContain(estado.almacen.ruta);
      expect(inicio.cuerpo).toContain(`Esquema del almacén: ${estado.almacen.versionEsquema}`);
      expect((await solicitarLocal({ host: "127.0.0.1", puerto, ruta: "/otra" })).estado).toBe(404);
    } finally { await servidor.detener(); }
  });
});

describe("A-6", () => {
  test("servir rechaza el almacen ausente o incompatible sin crearlo ni migrarlo", async () => {
    const temporal = escenario();
    const directorio = join(temporal, "inexistente", "almacen");
    const ausente = lanzar(temporal, ["servir"], { RIGE_ALMACEN: directorio });
    expect(ausente.codigo).toBe(1);
    expect(ausente.salida).toBe("");
    expect(JSON.parse(ausente.error)).toEqual({
      esquema: 1, error: { codigo: "almacen-sin-esquema", mensaje: expect.stringContaining("bun run esquema") },
    });
    expect(existsSync(directorio)).toBe(false);
    expect(existsSync(join(directorio, "rige.db"))).toBe(false);
    const ruta = join(temporal, "rige.db");
    const base = new Database(ruta, { create: true });
    try { base.exec("PRAGMA user_version = 2"); }
    finally { base.close(); }
    const incompatible = lanzar(temporal, ["servir"]);
    expect(incompatible.codigo).toBe(1);
    expect(incompatible.salida).toBe("");
    expect(JSON.parse(incompatible.error)).toEqual({
      esquema: 1, error: { codigo: "almacen-sin-esquema", mensaje: expect.stringContaining("bun run esquema") },
    });
    const lectura = new Database(ruta, { readonly: true });
    try { expect(lectura.query("PRAGMA user_version").get()).toEqual({ user_version: 2 }); }
    finally { lectura.close(); }
  });
});

describe("A-7", () => {
  test("servir informa el puerto ocupado con codigo 1 y salida vacia", async () => {
    const temporal = escenario();
    expect(lanzar(temporal, ["esquema"]).codigo).toBe(0);
    const escucha = Bun.listen({ hostname: "127.0.0.1", port: 0, socket: { data() {} } });
    try {
      const resultado = lanzar(temporal, ["servir"], { RIGE_PUERTO: String(escucha.port) });
      expect(resultado.codigo).toBe(1);
      expect(resultado.salida).toBe("");
      expect(JSON.parse(resultado.error)).toEqual({
        esquema: 1, error: { codigo: "puerto-ocupado", mensaje: expect.stringContaining("RIGE_PUERTO") },
      });
      expect(JSON.parse(resultado.error).error.mensaje).toContain(String(escucha.port));
    } finally { escucha.stop(true); }
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
  test("una base que no es SQLite provoca falla interna sin crear archivos fuera del almacen", () => {
    const temporal = escenario();
    const directorio = join(temporal, "almacen");
    mkdirSync(directorio);
    writeFileSync(join(directorio, "rige.db"), "no es sqlite");
    const antes = readdirSync(temporal, { recursive: true }).sort();
    const normal = lanzar(temporal, ["esquema"], { RIGE_ALMACEN: directorio });
    expect(normal).toEqual({
      codigo: 70, salida: "",
      error: JSON.stringify({ esquema: 1, error: { codigo: "interno", mensaje: "Falla interna de RIGE." } }) + "\n",
    });
    expect(readdirSync(temporal, { recursive: true }).sort()).toEqual(antes);
    const depurado = lanzar(temporal, ["esquema", "--depurar"], { RIGE_ALMACEN: directorio });
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

describe("A-5", () => {
  test("un archivo como almacen es error de uso y no cambia el arbol del temporal", () => {
    const temporal = escenario();
    const archivo = join(temporal, "almacen");
    writeFileSync(archivo, "archivo regular");
    const antes = readdirSync(temporal, { recursive: true }).sort();
    const resultado = lanzar(temporal, ["esquema"], { RIGE_ALMACEN: archivo });
    expect(resultado.codigo).toBe(1);
    expect(resultado.salida).toBe("");
    const error = JSON.parse(resultado.error);
    expect(error).toEqual({
      esquema: 1,
      error: { codigo: "configuracion-invalida", mensaje: expect.stringContaining("RIGE_ALMACEN") },
    });
    expect(resultado.error).toBe(JSON.stringify(error) + "\n");
    expect(readdirSync(temporal, { recursive: true }).sort()).toEqual(antes);
  });
});
