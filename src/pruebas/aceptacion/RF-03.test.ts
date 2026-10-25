import { afterAll, afterEach, beforeAll, describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join } from "node:path";
import { copiarEscenario } from "../utilidades/escenario";
import { crearEntornoAislado } from "../utilidades/entorno-aislado";
import { lanzar, lanzarServidor } from "../utilidades/subproceso";
import { solicitarLocal } from "../utilidades/cliente-http-local";
import type { RespuestaValores } from "../../paquetes/rige/aplicacion/respuestas/valores";
import { prepararConsultas } from "../utilidades/consultas-cli";
import { validarEsquema } from "../utilidades/validar-esquema";

const limpiezas: (() => void)[] = [];
afterEach(() => { for (const limpiar of limpiezas.splice(0).reverse()) limpiar(); });

const consultas = [
  ["valores", ["--agente", "revisor"]],
  ["agentes", []], ["agentes", ["--explicar"]],
  ...["ls", "ls && rm x"].flatMap(objetivo => [[], ["--explicar"]].map(opciones =>
    ["permiso", ["--agente", "build", "--herramienta", "bash", "--objetivo", objetivo, ...opciones]])),
] as [string, string[]][];
function prepararCli() {
  const escenario = prepararConsultas();
  limpiezas.push(escenario.borrar);
  return escenario;
}

const capturadas = new Map<string, ReturnType<ReturnType<typeof prepararConsultas>["consultar"]>[]>();
const claveCaptura = (comando: string, opciones: readonly string[]) => JSON.stringify([comando, opciones]);
beforeAll(() => {
  const escenario = prepararConsultas();
  afterAll(escenario.borrar);
  for (const [comando, opciones] of [...consultas, ["permiso", []]] as [string, string[]][]) {
    capturadas.set(claveCaptura(comando, opciones), [escenario.consultar(comando, opciones), escenario.consultar(comando, opciones)]);
  }
});
const captura = (comando: string, opciones: readonly string[] = [], indice = 0) => capturadas.get(claveCaptura(comando, opciones))![indice]!;

async function validarRespuesta(nombre: string, valor: unknown) {
  const esquema = await Bun.file(new URL(`../../esquemas/salida/${nombre}.json`, import.meta.url)).json();
  expect(validarEsquema(esquema, valor)).toEqual([]);
}

describe("RF-03 CA-2", () => {
  test.each(consultas)("%s %j valida contra el esquema publicado", async (comando, opciones) => {
    const resultado = captura(comando, opciones);
    expect(resultado.codigo).toBe(0);
    const respuesta = JSON.parse(resultado.salida);
    expect(respuesta.esquema).toBe(2);
    await validarRespuesta(comando, respuesta);
  });
  test("errores de uso y argumentos validan contra error.json", async () => {
    const escenario = prepararCli();
    for (const resultado of [lanzar(escenario.raiz, ["agentes", "--proyecto", join(escenario.raiz, "ausente")], escenario.variables),
      escenario.consultar("permiso", []), escenario.consultar("valores", [])]) {
      expect(resultado.salida).toBe("");
      await validarRespuesta("error", JSON.parse(resultado.error));
    }
  });
  for (const mutacion of ["extra", "ausente", "tipo", "version"] as const) {
    test(`sensibilidad: rechaza campo ${mutacion}`, async () => {
      for (const [comando, opciones] of [...consultas.slice(0, 2), consultas[3]!, ["error", []]] as [string, string[]][]) {
        const valor = structuredClone(JSON.parse(comando === "error" ? captura("permiso").error : captura(comando, opciones).salida));
        const esquema = await Bun.file(new URL(`../../esquemas/salida/${comando}.json`, import.meta.url)).json();
        expect(validarEsquema(esquema, valor)).toEqual([]);
        if (mutacion === "extra") valor.extra = true;
        if (mutacion === "ausente") delete valor[comando === "error" ? "error" : "proyecto"];
        if (mutacion === "tipo") valor[comando === "error" ? "error" : "entradas"] = "incorrecto";
        if (mutacion === "version") valor.esquema = 1;
        expect(validarEsquema(esquema, valor).length).toBeGreaterThan(0);
      }
    });
  }
});

describe("K-6 RF-03 CA-1 (CLI v2)", () => {
  test.each(consultas)("%s %j es identica byte a byte", (comando, opciones) => {
    const primera = captura(comando, opciones);
    expect(primera.codigo).toBe(0);
    expect(primera.error).toBe("");
    expect(captura(comando, opciones, 1)).toEqual(primera);
    const respuesta = JSON.parse(primera.salida);
    expect(respuesta).not.toHaveProperty("instante");
    expect(respuesta).not.toHaveProperty("id");
    if (comando === "permiso") expect(respuesta.explicacion === null).toBe(!opciones.includes("--explicar"));
  });
});

describe("RF-03 CA-3 (permiso CLI)", () => {
  test.each(["edit", "question"])("%s ubica la regla determinante declarada o nativa", sujeto => {
    const escenario = prepararCli();
    const resultado = escenario.consultar("permiso", ["--agente", "build", "--sujeto", sujeto, "--objetivo", "a"]);
    expect(resultado.codigo).toBe(0);
    const respuesta = JSON.parse(resultado.salida);
    const regla = respuesta.cadena.find((r: { indice: number }) => r.indice === respuesta.determinante);
    if (sujeto === "edit") {
      expect(isAbsolute(regla.declaracion.referencia)).toBe(true);
      expect(regla.origen.posicion.linea).toBe(5);
    } else expect(regla.origen.tipo).toBe("nativo");
  });
});

describe("RF-03 CA-5 (CLI v2)", () => {
  for (const [comando, opciones] of consultas.filter(([, opciones]) => !opciones.includes("--explicar")).slice(0, 3)) {
    test(`${comando} codigo 0`, () => {
      const escenario = prepararCli();
      expect(escenario.consultar(comando, opciones).codigo).toBe(0);
    });
    test(`${comando} codigo 1: proyecto`, () => {
      const escenario = prepararCli();
      for (const resultado of [lanzar(escenario.raiz, [comando, "--proyecto", join(escenario.raiz, "ausente"), ...opciones], escenario.variables)]) {
        expect(resultado.codigo).toBe(1);
        expect(resultado.salida).toBe("");
        expect(JSON.parse(resultado.error).esquema).toBe(2);
      }
    });
    test(`${comando} codigo 2: argumentos`, () => {
      const escenario = prepararCli();
      const resultado = escenario.consultar(comando, [...opciones, "--desconocido"]);
      expect(resultado.codigo).toBe(2);
      expect(resultado.salida).toBe("");
      expect(JSON.parse(resultado.error).error.codigo).toBe("argumentos-invalidos");
    });
    test(`${comando} codigo 70: falla interna`, async () => {
      const escenario = prepararCli();
      const precarga = join(escenario.raiz, "falla.ts");
      writeFileSync(precarga, `import { mock } from "bun:test";
        const fs = await import("node:fs");
        mock.module("node:fs", () => ({ ...fs, readFileSync: (...args) => {
          if (String(args[0]).endsWith("opencode.json")) throw new Error("Falla de lectura simulada");
          return fs.readFileSync(...args);
        } }));`);
      const proceso = Bun.spawnSync([process.execPath, "--preload", precarga, "paquetes/rige/arranque/rige.ts",
        comando, "--proyecto", escenario.proyecto, ...opciones], { env: { ...crearEntornoAislado(escenario.raiz, process.env),
          ...escenario.variables }, stdout: "pipe", stderr: "pipe" });
      expect(proceso.exitCode).toBe(70);
      expect(proceso.stdout.toString()).toBe("");
      expect(JSON.parse(proceso.stderr.toString())).toMatchObject({ esquema: 2, error: { codigo: "interno" } });
      await validarRespuesta("error", JSON.parse(proceso.stderr.toString()));
    });
  }
  test("rechaza explicar en valores y exige herramienta o sujeto excluyentes", () => {
    const escenario = prepararCli();
    for (const [comando, opciones] of [["valores", ["--agente", "revisor", "--explicar"]],
      ["permiso", ["--agente", "build", "--objetivo", "a"]],
      ["permiso", ["--agente", "build", "--objetivo", "a", "--sujeto", "read", "--herramienta", "read"]]] as [string, string[]][]) {
      expect(escenario.consultar(comando, opciones).codigo).toBe(2);
    }
  });
  test("permiso informa fuera-del-arbol y agente inexistente", () => {
    const escenario = prepararCli();
    const opciones = ["--agente", "build", "--herramienta", "read", "--objetivo", join(escenario.raiz, "../fuera.txt")];
    const respuesta = escenario.consultar("permiso", opciones);
    expect(respuesta.codigo).toBe(0);
    expect(JSON.parse(respuesta.salida)).toMatchObject({ decision: null, motivoSinDecision: "fuera-del-arbol" });
    const ausente = escenario.consultar("permiso", ["--agente", "ausente", "--sujeto", "read", "--objetivo", "a"]);
    expect(ausente.codigo).toBe(1);
    expect(JSON.parse(ausente.error).error.codigo).toBe("agente-inexistente");
  });
});

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
        if (declaracion.origen.tipo === "implicito") {
          expect(declaracion.via).toBeNull();
          expect(declaracion.referencia).toBeNull();
          continue;
        }
        expect(isAbsolute(declaracion.referencia!)).toBe(true);
        expect(declaracion.origen.tipo).toBe("declarado");
        if (declaracion.origen.tipo !== "declarado") throw new Error("Se esperaba una declaracion local");
        const { linea, columna } = declaracion.origen.posicion;
        expect(linea).toBeGreaterThan(0);
        expect(columna).toBeGreaterThan(0);
        const original = readFileSync(declaracion.referencia!, "utf8").split(/\r?\n/)[linea - 1]!;
        // Limite conocido (A4-2 omitido): el rastro conserva la posicion, pero no
        // la ruta original de cada desplazada. "b" acredita solo este escenario.
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
  describe("A2-2 A2-8", () => { test.each(["v1-precedencia", "v1-vias"])("la respuesta consultada por la web de %s es igual a la CLI", async (nombre) => {
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
      for (const clave of ["", "temperature", "inexistente"]) {
      const puntual = await solicitar(`/resoluciones/1?agente=build${clave ? `&clave=${clave}` : ""}`);
      expect(puntual.estado).toBe(200);
      const codigo = `
        import { consultarResolucion } from ${JSON.stringify(new URL("../../paquetes/rige/aplicacion/casos-uso/consultar-resolucion.ts", import.meta.url).href)};
        import { RepositorioResolucionesSqlite } from ${JSON.stringify(new URL("../../paquetes/rige/adaptadores/almacen-sqlite/resoluciones.ts", import.meta.url).href)};
        import { versionRige } from ${JSON.stringify(new URL("../../paquetes/rige/aplicacion/respuestas/estado.ts", import.meta.url).href)};
        import { existsSync } from "node:fs";
        const repositorio = new RepositorioResolucionesSqlite(process.env.RIGE_ALMACEN, { existe: existsSync }, versionRige);
        console.log(JSON.stringify(consultarResolucion(repositorio, "1", "build", ${JSON.stringify(clave)})));
      `;
      const proceso = Bun.spawnSync([process.execPath, "-e", codigo], {
        env: { ...crearEntornoAislado(escenario.temporal, process.env), ...escenario.variables }, stdout: "pipe", stderr: "pipe",
      });
      expect(proceso.exitCode).toBe(0);
      expect(proceso.stderr.toString()).toBe("");
      const web = JSON.parse(proceso.stdout.toString());
      expect(web.exito).toBe(true);
      expect(web.valor.respuesta).toEqual(JSON.parse(escenario.consultar(...(clave ? ["--clave", clave] : [])).salida));
      if (clave === "temperature") expect(puntual.cuerpo).toContain(`<td>${web.valor.respuesta.valores[0].rastro.valor}</td>`);
      if (clave === "inexistente") expect(puntual.cuerpo).toContain("clave-inexistente");
      expect(web.valor.sobre).toMatchObject({ id: 1, instante: expect.any(String), anteriores: [expect.objectContaining({ id: 1 })] });
      }
    } finally { await servidor.detener(); }
  }); });
});

describe("A2-6", () => {
  test("agente inexistente en resolver no guarda ninguna fila", async () => {
    const escenario = preparar();
    expect(lanzar(escenario.temporal, ["esquema"], escenario.variables).codigo).toBe(0);
    const servidor = await lanzarServidor(escenario.temporal, escenario.variables);
    try {
      const url = new URL(servidor.direccion);
      const resultado = await solicitarLocal({ host: "127.0.0.1", puerto: Number(url.port),
        ruta: `/resolver?proyecto=${encodeURIComponent(escenario.proyecto)}&agente=ausente` });
      expect(resultado.estado).toBe(404);
      const base = new Database(escenario.base, { readonly: true });
      try { expect(base.query("SELECT count(*) AS n FROM resolucion").get()).toEqual({ n: 0 }); }
      finally { base.close(); }
    } finally { await servidor.detener(); }
  });
});

describe("A2-5", () => {
  test.each(["valores", "permiso", "agentes"])("%s ignora configuracion propia que no utiliza", comando => {
    const escenario = prepararCli();
    const opciones = comando === "valores" ? ["--agente", "build"] : comando === "permiso"
      ? ["--agente", "build", "--sujeto", "read", "--objetivo", "a"] : [];
    expect(escenario.consultar(comando, opciones, { RIGE_PUERTO: "abc", RIGE_ALMACEN: import.meta.path }).codigo).toBe(0);
  });
});
