import { afterEach, describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join } from "node:path";
import { copiarEscenario } from "../utilidades/escenario";
import { crearEntornoAislado } from "../utilidades/entorno-aislado";
import { lanzar, lanzarServidor } from "../utilidades/subproceso";
import { solicitarLocal } from "../utilidades/cliente-http-local";
import type { RespuestaValores } from "../../paquetes/rige/aplicacion/respuestas/valores";

const limpiezas: (() => void)[] = [];
afterEach(() => { for (const limpiar of limpiezas.splice(0).reverse()) limpiar(); });

function preparar(nombre = "v1-precedencia") {
  const escenario = copiarEscenario(nombre);
  limpiezas.push(escenario.borrar);
  const temporal = mkdtempSync(join(tmpdir(), "rige-rf03-"));
  limpiezas.push(() => rmSync(temporal, { recursive: true, force: true }));
  const hogar = nombre === "v1-vias" ? join(escenario.raiz, "hogar") : join(temporal, "hogar");
  const variables = {
    ...crearEntornoAislado(hogar, {}), RIGE_ALMACEN: join(temporal, "almacen"),
    XDG_CONFIG_HOME: join(hogar, ".config"), ProgramData: join(temporal, "administrada"),
    ...(nombre === "v1-vias" ? { OPENCODE_CONFIG: join(escenario.raiz, "externa/config.json") } : {}),
  };
  const consultar = (...opciones: string[]) => lanzar(temporal,
    ["valores", "--proyecto", escenario.proyecto, "--agente", "build", ...opciones], variables);
  return { ...escenario, temporal, variables, consultar, base: join(variables.RIGE_ALMACEN, "rige.db") };
}

describe("RF-03 CA-1 (valores)", () => {
  test.each(["v1-precedencia", "v1-vias"])("%s produce JSON identico byte a byte sin datos del almacen", (nombre) => {
    const escenario = preparar(nombre);
    for (const opciones of [[], ["--clave", "temperature"]]) {
      const primera = escenario.consultar(...opciones);
      expect(primera.codigo).toBe(0);
      expect(primera.error).toBe("");
      expect(escenario.consultar(...opciones)).toEqual(primera);
      const respuesta = JSON.parse(primera.salida);
      expect(respuesta.esquema).toBe(2);
      expect(respuesta.proyecto).toBe(escenario.proyecto.replaceAll("\\", "/"));
      for (const campo of ["id", "instante", "anteriores", "sobre", "resolucion"]) expect(respuesta).not.toHaveProperty(campo);
    }
  });
});

describe("RF-03 CA-3 (valores)", () => {
  test.each(["v1-precedencia", "v1-vias"])("cada valor de %s conserva ruta absoluta y linea original", (nombre) => {
    const escenario = preparar(nombre);
    const resultado = escenario.consultar();
    expect(resultado.codigo).toBe(0);
    const respuesta = JSON.parse(resultado.salida) as RespuestaValores;
    expect(respuesta.valores.length).toBeGreaterThan(0);
    for (const { rastro } of respuesta.valores) {
      for (const declaracion of [rastro.determinante, ...rastro.desplazadas]) {
        expect(isAbsolute(declaracion.referencia!)).toBe(true);
        expect(declaracion.origen.tipo).toBe("declarado");
        if (declaracion.origen.tipo !== "declarado") throw new Error("Se esperaba una declaracion local");
        const { linea, columna } = declaracion.origen.posicion;
        expect(linea).toBeGreaterThan(0);
        expect(columna).toBeGreaterThan(0);
        const original = readFileSync(declaracion.referencia!, "utf8").split(/\r?\n/)[linea - 1]!;
        // options.a reemplaza el subarbol global options.a.b: su desplazada sigue ubicada en b.
        const claveOriginal = nombre === "v1-vias" && rastro.ruta.slice(2).join(".") === "options.a"
          && declaracion !== rastro.determinante ? "b" : rastro.ruta.at(-1);
        expect(original.slice(columna - 1)).toStartWith(JSON.stringify(claveOriginal));
      }
    }
  });
});

describe("RF-03 CA-5", () => {
  test("clave ausente es exito; agente, proyecto y argumentos invalidos conservan sus codigos", () => {
    const escenario = preparar();
    const ausente = escenario.consultar("--clave", "inexistente");
    expect(ausente.codigo).toBe(0);
    expect(ausente.error).toBe("");
    expect(JSON.parse(ausente.salida)).toMatchObject({ valores: [], motivo: "clave-inexistente", ruta: ["inexistente"] });
    for (const [argumentos, codigo, error] of [
      [["--proyecto", escenario.proyecto, "--agente", "ausente"], 1, "agente-sin-declaraciones"],
      [["--proyecto", join(escenario.raiz, "ausente"), "--agente", "build"], 1, "proyecto-inexistente"],
      [["--proyecto", escenario.proyecto], 2, "argumentos-invalidos"],
    ] as const) {
      const resultado = lanzar(escenario.temporal, ["valores", ...argumentos], escenario.variables);
      expect(resultado.codigo).toBe(codigo);
      expect(resultado.salida).toBe("");
      expect(JSON.parse(resultado.error)).toMatchObject({ esquema: 2, error: { codigo: error } });
    }
  });
});

describe("S-5", () => {
  test("valores no crea el almacen y tampoco modifica uno existente", () => {
    const escenario = preparar();
    expect(existsSync(escenario.variables.RIGE_ALMACEN)).toBe(false);
    expect(escenario.consultar().codigo).toBe(0);
    expect(existsSync(escenario.variables.RIGE_ALMACEN)).toBe(false);
    expect(lanzar(escenario.temporal, ["esquema"], escenario.variables).codigo).toBe(0);
    const bytes = readFileSync(escenario.base);
    expect(escenario.consultar().codigo).toBe(0);
    expect(readFileSync(escenario.base)).toEqual(bytes);
  });
});

describe("S-2 ADR-061", () => {
  test("servir rechaza user_version 1 con codigo 1 sin modificar el archivo", () => {
    const escenario = preparar();
    mkdirSync(escenario.variables.RIGE_ALMACEN);
    const base = new Database(escenario.base, { create: true });
    base.exec(readFileSync(new URL("../../esquemas/almacen/001_inicial.sql", import.meta.url), "utf8"));
    base.close();
    const bytes = readFileSync(escenario.base);
    const resultado = lanzar(escenario.temporal, ["servir"], escenario.variables);
    expect(resultado.codigo).toBe(1);
    expect(resultado.salida).toBe("");
    expect(JSON.parse(resultado.error).error.codigo).toBe("almacen-sin-esquema");
    expect(readFileSync(escenario.base)).toEqual(bytes);
  });
});

describe("S-1", () => {
  test.each(["v1-precedencia", "v1-vias"])("la respuesta consultada por la web de %s es igual a la CLI", async (nombre) => {
    const escenario = preparar(nombre);
    expect(lanzar(escenario.temporal, ["esquema"], escenario.variables).codigo).toBe(0);
    const servidor = await lanzarServidor(escenario.temporal, escenario.variables);
    try {
      const url = new URL(servidor.direccion);
      const solicitar = (ruta: string) => solicitarLocal({ host: "127.0.0.1", puerto: Number(url.port), ruta });
      const guardada = await solicitar(`/resolver?proyecto=${encodeURIComponent(escenario.proyecto)}&agente=build`);
      expect(guardada.estado).toBe(303);
      const pagina = await solicitar(String(guardada.cabeceras.location));
      expect(pagina.estado).toBe(200);
      const codigo = `
        import { consultarResolucion } from ${JSON.stringify(new URL("../../paquetes/rige/aplicacion/casos-uso/consultar-resolucion.ts", import.meta.url).href)};
        import { RepositorioResolucionesSqlite } from ${JSON.stringify(new URL("../../paquetes/rige/adaptadores/almacen-sqlite/resoluciones.ts", import.meta.url).href)};
        import { versionRige } from ${JSON.stringify(new URL("../../paquetes/rige/aplicacion/respuestas/estado.ts", import.meta.url).href)};
        import { existsSync } from "node:fs";
        const repositorio = new RepositorioResolucionesSqlite(process.env.RIGE_ALMACEN, { existe: existsSync }, versionRige);
        console.log(JSON.stringify(consultarResolucion(repositorio, "1", "build", "")));
      `;
      const proceso = Bun.spawnSync([process.execPath, "-e", codigo], {
        env: { ...crearEntornoAislado(escenario.temporal, process.env), ...escenario.variables }, stdout: "pipe", stderr: "pipe",
      });
      expect(proceso.exitCode).toBe(0);
      expect(proceso.stderr.toString()).toBe("");
      const web = JSON.parse(proceso.stdout.toString());
      expect(web.exito).toBe(true);
      expect(web.valor.respuesta).toEqual(JSON.parse(escenario.consultar().salida));
      expect(web.valor.sobre).toMatchObject({ id: 1, instante: expect.any(String), anteriores: [expect.objectContaining({ id: 1 })] });
    } finally { await servidor.detener(); }
  });
});
