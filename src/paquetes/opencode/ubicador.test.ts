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
describe("U-2", () => {
  test("variables no soportadas en orden, vacias ignoradas y config absoluta", async () => {
    const nombres = ["OPENCODE_CONFIG_CONTENT", "OPENCODE_PERMISSION", "OPENCODE_CONFIG_DIR",
      "OPENCODE_DISABLE_PROJECT_CONFIG", "OPENCODE_TEST_HOME", "OPENCODE_TEST_MANAGED_CONFIG_DIR"];
    for (const [indice, nombre] of nombres.entries()) {
      await error("/p", entorno({ variables: { HOME: "/h", ...Object.fromEntries(nombres.slice(indice).map(n => [n, "valor"])) } }),
        "via-no-soportada", nombre);
    }
    await error("/p", entorno({ variables: { HOME: "/h", OPENCODE_CONFIG: "relativa.json" } }), "via-no-soportada", "OPENCODE_CONFIG");
    const vacias = Object.fromEntries([...nombres, "OPENCODE_CONFIG"].map(n => [n, " \t "]));
    expect(await vias("/p", entorno({ variables: { HOME: "/h", ...vacias } }))).toEqual([
      noObservada("remota-wellknown"), noObservada("remota-organizacion"), noObservada("preferencias-macos"),
    ]);
    expect(await vias("/p", entorno({ variables: { HOME: "/h", OPENCODE_CONFIG: "" } }))).toHaveLength(3);
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
describe("U-7", () => {
  test("rechaza config heredada y observa Markdown sin interpretar su contenido", async () => {
    await error("/p", entorno({ archivos: { "/h/.config/opencode/config": "" } }), "via-no-soportada", "/h/.config/opencode/config");
    const archivos = { "/h/.config/opencode/agent/sub/a.md": "agente", "/h/.config/opencode/agents/b.md": "agente",
      "/p/.opencode/mode/c.md": "modo", "/p/.opencode/modes/x/d.md": "ignorado" };
    expect(entorno({ archivos }).listar("/h/.config/opencode")).toEqual(["agent", "agents"]);
    expect(entorno({ archivos }).listar("/inexistente")).toEqual([]);
    expect((await vias("/p", entorno({ archivos }))).filter(v => v.via === "markdown")).toEqual([
      noObservada("markdown", "/h/.config/opencode/agent/sub/a.md"), noObservada("markdown", "/h/.config/opencode/agents/b.md"),
      noObservada("markdown", "/p/.opencode/mode/c.md"),
    ]);
    const ruta = "/h/.config/opencode/agent/a.md";
    await error("/p", entorno({ archivos: { [ruta]: "---\nname: otro\n---\ncuerpo" } }), "via-no-soportada", ruta);
    expect((await vias("/p", entorno({ archivos: { [ruta]: "---\ndescription: ejemplo\n---\nname: otro" } })))
      .filter(v => v.via === "markdown")).toEqual([noObservada("markdown", ruta)]);
    const { adaptadorOpenCode } = await import("./adaptador");
    const resultado = resolver(adaptadorOpenCode, "/p", entorno({ archivos: {
      "/p/opencode.json": '{"agent":{"a":{"temperature":0.2},"otro":{"temperature":0.4}}}', [ruta]: "agente",
    } }));
    expect(resultado.exito).toBe(true);
    if (!resultado.exito) throw new Error(resultado.error.mensaje);
    expect(resultado.valor.noResueltas).toEqual([{ ruta: ["agent", "a"], regla: "markdown-no-observado" }]);
    expect(resultado.valor.valores.map(v => v.ruta)).toEqual([["agent", "otro", "temperature"]]);
    expect(resultado.valor.entradas.find(v => v.via === "markdown")?.resumen).toBeNull();
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
