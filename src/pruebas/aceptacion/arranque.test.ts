import { afterEach, describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { crearEntornoAislado } from "../utilidades/entorno-aislado";
import { solicitarLocal } from "../utilidades/cliente-http-local";

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

function puertoLibre() {
  const escucha = Bun.listen({ hostname: "127.0.0.1", port: 0, socket: { data() {} } });
  const puerto = escucha.port;
  escucha.stop(true);
  return puerto;
}

function lanzar(temporal: string, argumentos: string[], variables: Record<string, string> = {}) {
  const env = { ...crearEntornoAislado(temporal, process.env), RIGE_PUERTO: String(puertoLibre()), ...variables };
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

async function primeraLinea(salida: ReadableStream<Uint8Array>): Promise<string> {
  const lector = salida.getReader();
  const decodificador = new TextDecoder();
  const limite = setTimeout(() => { void lector.cancel(); }, 2000);
  try {
    let texto = "";
    while (true) {
      const fragmento = await lector.read();
      if (fragmento.done) throw new Error("El subproceso termino sin publicar direccion.");
      texto += decodificador.decode(fragmento.value, { stream: true });
      const fin = texto.indexOf("\n");
      if (fin !== -1) return texto.slice(0, fin);
    }
  } finally { clearTimeout(limite); lector.releaseLock(); }
}

async function servirHastaSalir(temporal: string, variables: Record<string, string> = {}) {
  const proceso = Bun.spawn([process.execPath, "paquetes/rige/arranque/rige.ts", "servir"], {
    cwd: raiz,
    env: { ...crearEntornoAislado(temporal, process.env), RIGE_PUERTO: String(puertoLibre()), ...variables },
    stdout: "pipe", stderr: "pipe",
  });
  const limite = setTimeout(() => { proceso.kill(); }, 2000);
  try {
    const [codigo, salida, error] = await Promise.all([
      proceso.exited, new Response(proceso.stdout).text(), new Response(proceso.stderr).text(),
    ]);
    return { codigo, salida, error };
  } finally { clearTimeout(limite); proceso.kill(); await proceso.exited; }
}

describe("A-5", () => {
  test("sirve el estado preparado con paridad y una pagina 404 por subproceso", async () => {
    const temporal = escenario();
    const preparada = lanzar(temporal, ["esquema"]);
    expect(preparada.codigo).toBe(0);
    const estado = JSON.parse(preparada.salida);
    const puerto = puertoLibre();
    const proceso = Bun.spawn([process.execPath, "paquetes/rige/arranque/rige.ts", "servir"], {
      cwd: raiz, env: { ...crearEntornoAislado(temporal, process.env), RIGE_PUERTO: String(puerto) },
      stdout: "pipe", stderr: "pipe",
    });
    const error = new Response(proceso.stderr).text();
    const limite = setTimeout(() => { proceso.kill(); }, 3000);
    try {
      const linea = await primeraLinea(proceso.stdout);
      expect(linea).toBe(JSON.stringify({ esquema: 1, direccion: `http://127.0.0.1:${puerto}` }));
      expect(proceso.exitCode).toBeNull();
      const inicio = await solicitarLocal({ host: "127.0.0.1", puerto, ruta: "/" });
      expect(inicio.estado).toBe(200);
      expect(inicio.cuerpo).toContain(`RIGE ${estado.versionRige}`);
      expect(inicio.cuerpo).toContain(estado.almacen.ruta);
      expect(inicio.cuerpo).toContain(`Esquema del almacén: ${estado.almacen.versionEsquema}`);
      expect((await solicitarLocal({ host: "127.0.0.1", puerto, ruta: "/otra" })).estado).toBe(404);
    } finally { clearTimeout(limite); proceso.kill(); await proceso.exited; }
    expect(await error).toBe("");
  });
});

describe("A-6", () => {
  test("servir rechaza el almacen ausente o incompatible sin crearlo ni migrarlo", async () => {
    const temporal = escenario();
    const directorio = join(temporal, "inexistente", "almacen");
    const ausente = await servirHastaSalir(temporal, { RIGE_ALMACEN: directorio });
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
    const incompatible = await servirHastaSalir(temporal);
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
      const resultado = await servirHastaSalir(temporal, { RIGE_PUERTO: String(escucha.port) });
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
