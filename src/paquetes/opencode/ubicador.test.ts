import { describe, expect, test } from "bun:test";
import { posix } from "node:path";
import type { EntornoLectura } from "@rige/nucleo/contrato/entorno";
import type { ViaUbicada } from "@rige/nucleo/contrato/adaptador";
import { resolver } from "@rige/nucleo/resolucion/resolver";
import { crearEntornoMemoria } from "../../pruebas/utilidades/entorno-memoria";

function entorno(opciones: {
  archivos?: Record<string, string>; directorios?: string[];
  variables?: Record<string, string>; plataforma?: string;
} = {}): EntornoLectura {
  const archivos = opciones.archivos ?? {};
  const directorios = new Set(["/p", "/h", ...(opciones.directorios ?? [])]);
  for (const ruta of [...Object.keys(archivos), ...directorios]) {
    let actual = posix.dirname(ruta);
    while (!directorios.has(actual)) {
      directorios.add(actual);
      if (actual === posix.dirname(actual)) break;
      actual = posix.dirname(actual);
    }
  }
  return crearEntornoMemoria({ archivos, directorios: [...directorios],
    variables: opciones.variables ?? { HOME: "/h" }, plataforma: opciones.plataforma ?? "linux" });
}
async function ubicar(proyecto: string, lectura: EntornoLectura) {
  return (await import("./ubicador")).ubicar(proyecto, lectura);
}
async function vias(proyecto: string, lectura: EntornoLectura): Promise<readonly ViaUbicada[]> {
  const resultado = await ubicar(proyecto, lectura);
  if (!resultado.exito) throw new Error(resultado.error.mensaje);
  return resultado.valor;
}
async function error(proyecto: string, lectura: EntornoLectura, codigo: string, nombre: string) {
  const resultado = await ubicar(proyecto, lectura);
  expect(resultado.exito).toBe(false);
  if (resultado.exito) throw new Error("Se esperaba error de analisis");
  expect(resultado.error.codigo).toBe(codigo);
  expect(resultado.error.mensaje).toContain(nombre);
}
const observada = (via: string, referencia: string): ViaUbicada => ({ via, referencia, condicion: "observada" });
const noObservada = (via: string, referencia = via): ViaUbicada => ({ via, referencia, condicion: "no_observada" });

describe("U-1", () => {
  test("rechaza proyecto relativo, inexistente o archivo", async () => {
    for (const proyecto of ["p", "/inexistente", "/archivo"]) {
      await error(proyecto, entorno({ archivos: { "/archivo": "" } }), "proyecto-inexistente", proyecto);
    }
  });
});
describe("U-2 V1-08 F-2", () => {
  test("variables no soportadas en orden y config absoluta", async () => {
    const nombres = ["OPENCODE_CONFIG_CONTENT", "OPENCODE_PERMISSION", "OPENCODE_CONFIG_DIR",
      "OPENCODE_DISABLE_PROJECT_CONFIG", "OPENCODE_TEST_HOME", "OPENCODE_TEST_MANAGED_CONFIG_DIR"];
    for (const [indice, nombre] of nombres.entries()) {
      await error("/p", entorno({ variables: { HOME: "/h", ...Object.fromEntries(nombres.slice(indice).map(n => [n, n === "OPENCODE_DISABLE_PROJECT_CONFIG" ? "true" : "valor"])) } }),
        "via-no-soportada", nombre);
    }
    await error("/p", entorno({ variables: { HOME: "/h", OPENCODE_CONFIG: "relativa.json" } }), "via-no-soportada", "OPENCODE_CONFIG");
  });
  test("distingue variables presentes de variables no vacias sin recortarlas", async () => {
    for (const nombre of ["OPENCODE_CONFIG_CONTENT", "OPENCODE_PERMISSION", "OPENCODE_CONFIG",
      "OPENCODE_TEST_MANAGED_CONFIG_DIR", "OPENCODE_CONFIG_DIR", "OPENCODE_TEST_HOME"]) {
      for (const valor of [undefined, "", "  "]) {
        const variables = { HOME: "/h", ...(valor === undefined ? {} : { [nombre]: valor }) };
        const lectura = entorno({ variables });
        expect(lectura.variable(nombre)).toBe(valor);
        if (valor !== undefined && (valor !== "" || ["OPENCODE_CONFIG_DIR", "OPENCODE_TEST_HOME"].includes(nombre))) {
          await error("/p", lectura, "via-no-soportada", nombre);
        } else expect(await vias("/p", lectura)).toHaveLength(3);
      }
    }
  });
  test("DISABLE_PROJECT_CONFIG solo activa con true o 1 sin recortar", async () => {
    for (const valor of [undefined, "", "  ", "0", "TRUE", "1", " true ", "false"]) {
      const lectura = entorno({ variables: { HOME: "/h", ...(valor === undefined ? {} : { OPENCODE_DISABLE_PROJECT_CONFIG: valor }) } });
      if (valor === "TRUE" || valor === "1") await error("/p", lectura, "via-no-soportada", "OPENCODE_DISABLE_PROJECT_CONFIG");
      else expect(await vias("/p", lectura)).toHaveLength(3);
    }
  });
  test("HOME y USERPROFILE requieren valor no vacio pero aceptan espacios", async () => {
    for (const [plataforma, nombre] of [["linux", "HOME"], ["win32", "USERPROFILE"]] as const) {
      for (const valor of [undefined, "", "  "]) {
        const lectura = entorno({ plataforma, variables: valor === undefined ? {} : { [nombre]: valor } });
        if (valor === undefined || valor === "") await error("/p", lectura, "entorno-incompleto", nombre);
        else expect(await vias("/p", lectura)).toHaveLength(3);
      }
    }
  });
  test("XDG_CONFIG_HOME y ProgramData usan defecto solo si ausentes o vacias", async () => {
    for (const valor of [undefined, "", "  "]) {
      const global = posix.join(valor || "/h/.config", "opencode/opencode.json");
      const administrada = posix.join(valor || "C:\\ProgramData", "opencode/opencode.json");
      const lectura = entorno({ plataforma: "win32", variables: { USERPROFILE: "/h",
        ...(valor === undefined ? {} : { XDG_CONFIG_HOME: valor, ProgramData: valor }) },
        archivos: { [global]: "{}", [administrada]: "{}" } });
      expect((await vias("/p", lectura)).filter(v => v.condicion === "observada")).toEqual([
        observada("global", global), observada("administrada", administrada.replaceAll("\\", "/")),
      ]);
    }
  });
});
describe("U-3", () => {
  test("requiere HOME en linux y USERPROFILE en win32", async () => {
    await error("/p", entorno({ variables: {} }), "entorno-incompleto", "HOME");
    await error("/p", entorno({ variables: { HOME: "/h" }, plataforma: "win32" }), "entorno-incompleto", "USERPROFILE");
  });
});
describe("U-4", () => {
  test("ordena todas las vias y XDG_CONFIG_HOME reemplaza HOME/.config", async () => {
    const archivos = Object.fromEntries([
      "/x/opencode/config.json", "/x/opencode/opencode.json", "/x/opencode/opencode.jsonc", "/extra.json",
      "/w/opencode.json", "/w/p/opencode.jsonc", "/w/p/.opencode/opencode.json",
      "/h/.opencode/opencode.jsonc", "/etc/opencode/opencode.json", "/h/.config/opencode/opencode.json",
    ].map(r => [r, "{}"]));
    archivos["/w/.git/HEAD"] = "ref: refs/heads/main\n";
    expect(await vias("/w/p", entorno({ archivos, variables: { HOME: "/h", XDG_CONFIG_HOME: "/x", OPENCODE_CONFIG: "/extra/../extra.json" } })))
      .toEqual([
        noObservada("remota-wellknown"), observada("global", "/x/opencode/config.json"),
        observada("global", "/x/opencode/opencode.json"), observada("global", "/x/opencode/opencode.jsonc"),
        observada("variable-config", "/extra.json"), observada("proyecto", "/w/opencode.json"),
        observada("proyecto", "/w/p/opencode.jsonc"), observada("directorio-opencode", "/w/p/.opencode/opencode.json"),
        observada("directorio-opencode", "/h/.opencode/opencode.jsonc"), noObservada("remota-organizacion"),
        observada("administrada", "/etc/opencode/opencode.json"), noObservada("preferencias-macos"),
      ]);
    const lectura = entorno({ archivos: { "/h/.config/opencode/config.json": "{}" } });
    const nativa = { ...lectura, unir: (...partes: readonly string[]) => lectura.unir(...partes).replaceAll("/", "\\"),
      tipo: (ruta: string) => lectura.tipo(ruta.replaceAll("\\", "/")),
      padre: (ruta: string) => lectura.padre(ruta.replaceAll("\\", "/")).replaceAll("/", "\\") };
    expect((await vias("/p", nativa))[1]).toEqual(observada("global", "/h/.config/opencode/config.json"));
  });
});
describe("U-5", () => {
  test("nivel superior primero y json antes de jsonc en cada nivel", async () => {
    const archivos = Object.fromEntries(["/w/opencode.json", "/w/opencode.jsonc", "/w/p/opencode.json", "/w/p/opencode.jsonc"].map(r => [r, "{}"]));
    archivos["/w/.git/HEAD"] = "ref: refs/heads/main\n";
    expect((await vias("/w/p", entorno({ archivos }))).filter(v => v.via === "proyecto").map(v => v.referencia))
      .toEqual(["/w/opencode.json", "/w/opencode.jsonc", "/w/p/opencode.json", "/w/p/opencode.jsonc"]);
  });
});
describe("U-6", () => {
  test("worktree valida HEAD y gitdir y sin git valido llega a la raiz", async () => {
    const archivos = { "/opencode.json": "{}", "/w/opencode.json": "{}", "/w/p/opencode.json": "{}" };
    const proyectos = async (extra: Record<string, string>, directorios: string[] = []) =>
      (await vias("/w/p", entorno({ archivos: { ...archivos, ...extra }, directorios }))).filter(v => v.via === "proyecto").map(v => v.referencia);
    expect(await proyectos({ "/w/.git/HEAD": "ref: refs/heads/main\n" }, ["/w/p/.git"]))
      .toEqual(["/w/opencode.json", "/w/p/opencode.json"]);
    expect(await proyectos({ "/w/.git/HEAD": "ref: refs/heads/main\n", "/w/p/.git/HEAD": "ref: refs/heads/main\n" }))
      .toEqual(["/w/p/opencode.json"]);
    expect(await proyectos({ "/w/p/.git": "gitdir: /otro/worktree\n" })).toEqual(["/w/p/opencode.json"]);
    expect(await proyectos({ "/w/p/.git": "invalido" }, ["/w/.git"]))
      .toEqual(["/opencode.json", "/w/opencode.json", "/w/p/opencode.json"]);
  });
});
describe("U-7 V1-08 F-7", () => {
  test("rechaza config heredada y observa Markdown sin interpretar su contenido", async () => {
    await error("/p", entorno({ archivos: { "/h/.config/opencode/config": "" } }), "via-no-soportada", "/h/.config/opencode/config");
    const archivos = { "/h/.config/opencode/agent/sub/a.md": "agente", "/h/.config/opencode/agents/b.md": "agente",
      "/h/.config/opencode/agents/sub/agent/x.md": "agente anidado",
      "/p/.opencode/mode/c.md": "modo", "/p/.opencode/modes/x/d.md": "ignorado" };
    expect(entorno({ archivos }).listar("/h/.config/opencode")).toEqual(["agent", "agents"]);
    expect(entorno({ archivos }).listar("/inexistente")).toEqual([]);
    const sinLeer = { ...entorno({ archivos }), leer: () => { throw new Error("El ubicador no debe leer Markdown"); } };
    expect((await vias("/p", sinLeer)).filter(v => v.via === "markdown")).toEqual([
      { ...observada("markdown", "/h/.config/opencode/agent/sub/a.md"), elemento: "sub/a" },
      { ...observada("markdown", "/h/.config/opencode/agents/b.md"), elemento: "b" },
      { ...observada("markdown", "/h/.config/opencode/agents/sub/agent/x.md"), elemento: "sub/agent/x" },
      { ...observada("markdown", "/p/.opencode/mode/c.md"), elemento: "c" },
    ]);
    const ruta = "/h/.config/opencode/agent/a.md";
    const { adaptadorOpenCode } = await import("./adaptador");
    const markdown = { ...observada("markdown", ruta), elemento: "a" };
    expect(adaptadorOpenCode.leer(markdown, "---\nname: otro\n---\ncuerpo")).toEqual({ exito: false, error: {
      codigo: "via-no-soportada", mensaje: `El prototipo v1 no incorpora ${ruta}.`,
    } });
    expect((await vias("/p", entorno({ archivos: { [ruta]: "---\ndescription: ejemplo\n---\nname: otro" } })))
      .filter(v => v.via === "markdown")).toEqual([markdown]);
    const resolverTexto = (texto: string) => resolver(adaptadorOpenCode, "/p", entorno({ archivos: {
      "/p/opencode.json": '{"agent":{"a":{"temperature":0.2},"otro":{"temperature":0.4}}}', [ruta]: texto,
    } }));
    const resultado = resolverTexto("agente");
    expect(resultado.exito).toBe(true);
    if (!resultado.exito) throw new Error(resultado.error.mensaje);
    expect(resultado.valor.noResueltas).toEqual([{ ruta: ["agent", "a"], regla: "markdown-no-observado" }]);
    expect(resultado.valor.valores.map(v => v.ruta)).toEqual([["agent", "otro", "temperature"]]);
    const entrada = resultado.valor.entradas.find(v => v.via === "markdown");
    expect(entrada?.condicion).toBe("observada");
    expect(entrada?.resumen).toBe(entorno().resumir("agente"));
    const cambiada = resolverTexto("agente modificado");
    expect(cambiada.exito).toBe(true);
    if (!cambiada.exito) throw new Error(cambiada.error.mensaje);
    expect(cambiada.valor.resumenEntradas).not.toBe(resultado.valor.resumenEntradas);
    const invalida = resolverTexto("---\r\n name : otro\r\n---\r\ncuerpo");
    expect(invalida.exito).toBe(false);
    if (invalida.exito) throw new Error("Se esperaba Markdown no soportado");
    expect(invalida.error.codigo).toBe("via-no-soportada");
  });
});
describe("U-8", () => {
  test("administrada usa ProgramData o el defecto Windows y etc en linux", async () => {
    for (const programData of ["/datos", undefined]) {
      const base = programData ?? "C:\\ProgramData";
      const referencia = posix.join(base, "opencode/opencode.json");
      const variables: Record<string, string> = { USERPROFILE: "/h" };
      if (programData) variables.ProgramData = programData;
      expect((await vias("/p", entorno({ plataforma: "win32", variables, archivos: { [referencia]: "{}" } })))
        .filter(v => v.via === "administrada")).toEqual([observada("administrada", referencia.replaceAll("\\", "/"))]);
    }
    expect((await vias("/p", entorno({ archivos: { "/etc/opencode/opencode.json": "{}", "/etc/opencode/opencode.jsonc": "{}" } })))
      .filter(v => v.via === "administrada")).toEqual([
        observada("administrada", "/etc/opencode/opencode.json"), observada("administrada", "/etc/opencode/opencode.jsonc"),
      ]);
  });
});
