import { afterEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { resolver } from "../../paquetes/nucleo/resolucion/resolver";
import { consultarAgente } from "../../paquetes/nucleo/resolucion/proyectar";
import type { RastroValor, Resolucion } from "../../paquetes/nucleo/resolucion/tipos";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";
import { crearEntornoAislado } from "../utilidades/entorno-aislado";

const limpiezas: (() => void)[] = [];
afterEach(() => { for (const borrar of limpiezas.splice(0).reverse()) borrar(); });

describe("V1-08 F-1", () => {
  test("copiarEscenario devuelve rutas canonicas con un enlace en el temporal", () => {
    const temporal = mkdtempSync(join(tmpdir(), "rige-canonica-"));
    limpiezas.push(() => rmSync(temporal, { recursive: true, force: true }));
    const destino = join(temporal, "destino");
    const enlace = join(temporal, "enlace");
    mkdirSync(destino);
    symlinkSync(destino, enlace, process.platform === "win32" ? "junction" : "dir");
    const codigo = `
      import { realpathSync } from "node:fs";
      const { copiarEscenario } = await import(${JSON.stringify(new URL("../utilidades/escenario.ts", import.meta.url).href)});
      const escenario = copiarEscenario("v1-precedencia");
      try {
        console.log(JSON.stringify([escenario.raiz, realpathSync.native(escenario.raiz),
          escenario.proyecto, realpathSync.native(escenario.proyecto)]));
      } finally { escenario.borrar(); }
    `;
    const proceso = Bun.spawnSync([process.execPath, "-e", codigo], {
      env: { ...crearEntornoAislado(temporal, process.env), TEMP: enlace, TMP: enlace, TMPDIR: enlace },
    });
    expect(proceso.exitCode).toBe(0);
    expect(proceso.stderr.toString()).toBe("");
    const [raiz, canonica, proyecto, proyectoCanonico] = JSON.parse(proceso.stdout.toString());
    expect(raiz).toBe(canonica);
    expect(proyecto).toBe(proyectoCanonico);
  });
});

async function preparar() {
  const { copiarEscenario } = await import("../utilidades/escenario");
  const escenario = copiarEscenario("v1-precedencia");
  limpiezas.push(() => escenario.borrar());
  const hogar = mkdtempSync(join(tmpdir(), "rige-hogar-"));
  limpiezas.push(() => rmSync(hogar, { recursive: true, force: true }));
  const entorno = new EntornoLecturaSistema({ plataforma: process.platform, entorno: {
    HOME: hogar, USERPROFILE: hogar, XDG_CONFIG_HOME: hogar, XDG_DATA_HOME: hogar, XDG_STATE_HOME: hogar,
    XDG_CACHE_HOME: hogar, LOCALAPPDATA: hogar, APPDATA: hogar, ProgramData: hogar, RIGE_ALMACEN: hogar,
  } });
  const referencia = await Bun.file(new URL("../escenarios/v1-precedencia/REFERENCIA.json", import.meta.url)).json() as {
    agente: string; valores: { description: string; steps: number; temperature: number };
  };
  return { escenario, entorno, referencia };
}
function resolverEscenario(proyecto: string, entorno: EntornoLecturaSistema): Resolucion {
  const resultado = resolver(adaptadorOpenCode, proyecto, entorno);
  if (!resultado.exito) throw new Error(resultado.error.mensaje);
  return resultado.valor;
}
function consultar(resolucion: Resolucion, clave: string | undefined): readonly RastroValor[] {
  const resultado = consultarAgente(resolucion, "build", clave);
  if (!resultado.exito) throw new Error(resultado.error.mensaje);
  return resultado.valor;
}
function comprobarTemperatura(rastro: RastroValor, raiz: string, valor: number): void {
  expect(rastro.ruta).toEqual(["agent", "build", "temperature"]);
  expect(rastro.valor).toBe(valor);
  expect(rastro.determinante).toEqual({ orden: 3, via: "proyecto", referencia: join(raiz, "proyecto/opencode.jsonc").replaceAll("\\", "/"),
    posicion: { linea: 6, columna: 7 }, valor: 0.3, regla: "orden-de-aplicacion" });
  expect(rastro.desplazadas).toEqual([
    { orden: 1, via: "proyecto", referencia: join(raiz, "opencode.json").replaceAll("\\", "/"),
      posicion: { linea: 5, columna: 7 }, valor: 0.1, regla: "orden-de-aplicacion" },
    { orden: 2, via: "proyecto", referencia: join(raiz, "proyecto/opencode.json").replaceAll("\\", "/"),
      posicion: { linea: 5, columna: 7 }, valor: 0.2, regla: "orden-de-aplicacion" },
  ]);
}

describe("RF-01 CA-1", () => {
  test("la clave coincide con OpenCode 1.18.25 y explica las tres declaraciones", async () => {
    const { escenario, entorno, referencia } = await preparar();
    const resolucion = resolverEscenario(escenario.proyecto, entorno);
    const rastros = consultar(resolucion, "temperature");
    expect(rastros).toHaveLength(1);
    comprobarTemperatura(rastros[0]!, escenario.raiz, referencia.valores.temperature);
    expect(resolucion.identidad).toEqual({ herramienta: "opencode", version: "1.18.25" });
    expect(resolucion.entradas.filter(e => e.condicion === "observada")).toHaveLength(3);
  });
});
describe("RF-01 CA-2", () => {
  test("sin clave coincide con toda la referencia y mantiene los rastros por clave", async () => {
    const { escenario, entorno, referencia } = await preparar();
    const resolucion = resolverEscenario(escenario.proyecto, entorno);
    const rastros = consultar(resolucion, undefined);
    expect(rastros.map(r => r.ruta.slice(2).join("."))).toEqual(["description", "steps", "temperature"]);
    expect(Object.fromEntries(rastros.map(r => [r.ruta.slice(2).join("."), r.valor]))).toEqual(referencia.valores);
    for (const rastro of rastros) expect(consultar(resolucion, rastro.ruta.slice(2).join("."))).toEqual([rastro]);
    comprobarTemperatura(rastros.find(r => r.ruta[2] === "temperature")!, escenario.raiz, referencia.valores.temperature);
    expect(rastros[0]!.determinante.referencia).toBe(join(escenario.proyecto, "opencode.json").replaceAll("\\", "/"));
    expect(rastros[1]!.determinante.referencia).toBe(join(escenario.raiz, "opencode.json").replaceAll("\\", "/"));
  });
});

describe("RF-01 CA-1 v1-vias", () => {
  test("V1-08 F-8 coincide con la referencia en lo que resuelve y excluye las derivaciones y conflictos", async () => {
    const { copiarEscenario } = await import("../utilidades/escenario");
    const escenario = copiarEscenario("v1-vias");
    limpiezas.push(() => escenario.borrar());
    const administrada = mkdtempSync(join(tmpdir(), "rige-administrada-"));
    limpiezas.push(() => rmSync(administrada, { recursive: true, force: true }));
    const hogar = join(escenario.raiz, "hogar");
    const entorno = new EntornoLecturaSistema({ plataforma: process.platform, entorno: {
      ...crearEntornoAislado(hogar, {}), XDG_CONFIG_HOME: join(hogar, ".config"),
      OPENCODE_CONFIG: join(escenario.raiz, "externa/config.json"), ProgramData: administrada,
    } });
    const referencia = await Bun.file(new URL("../escenarios/v1-vias/REFERENCIA.json", import.meta.url)).json() as {
      agente: string; valores: Record<string, string | number | boolean>;
    };
    const rutas = [".opencode/opencode.json", "externa/config.json", "hogar/.config/opencode/opencode.json",
      "hogar/.opencode/opencode.json", "proyecto/.opencode/opencode.json", "proyecto/opencode.json"];
    const resumenes = () => rutas.map(r => createHash("sha256").update(readFileSync(join(escenario.raiz, r))).digest("hex"));
    const antes = resumenes();
    expect(antes.map(r => r.slice(0, 16))).toEqual([
      "2543b85ac839a46b", "a90dbcc392cc65ca", "0bc298d0fadc032d", "263533c3770b359c", "e29d6c83b92c92d6", "170b2ecc3af34bd0",
    ]);
    const resolucion = resolverEscenario(escenario.proyecto, entorno);
    const rastros = consultar(resolucion, undefined);
    expect(referencia.agente).toBe("build");
    expect(rastros.map(r => r.ruta.slice(2).join("."))).toEqual(["description", "temperature", "top_p"]);
    for (const rastro of rastros) expect(rastro.valor).toBe(referencia.valores[rastro.ruta.slice(2).join(".")]!);
    const ruta = (relativa: string) => join(escenario.raiz, relativa).replaceAll("\\", "/");
    const temperatura = rastros.find(r => r.ruta[2] === "temperature")!;
    expect(temperatura.determinante).toMatchObject({ valor: 0.4, via: "directorio-opencode", referencia: ruta(".opencode/opencode.json") });
    expect(temperatura.desplazadas.map(d => [d.valor, d.via, d.referencia])).toEqual([
      [0.1, "global", ruta("hogar/.config/opencode/opencode.json")],
      [0.2, "variable-config", ruta("externa/config.json")],
      [0.3, "proyecto", ruta("proyecto/opencode.json")],
      [0.5, "directorio-opencode", ruta("proyecto/.opencode/opencode.json")],
    ]);
    const topP = rastros.find(r => r.ruta[2] === "top_p")!;
    expect(topP.determinante).toMatchObject({ valor: 0.9, via: "directorio-opencode", referencia: ruta("hogar/.opencode/opencode.json") });
    expect(topP.desplazadas.map(d => d.valor)).toEqual([0.5]);
    expect(rastros[0]!.determinante.referencia).toBe(ruta("proyecto/.opencode/opencode.json"));
    expect(resolucion.noResueltas).toEqual([
      { ruta: ["agent", "build", "maxSteps"], regla: "fuera-del-v1" },
      { ruta: ["agent", "build", "options", "a"], regla: "forma-en-conflicto" },
      { ruta: ["agent", "build", "steps"], regla: "fuera-del-v1" },
    ]);
    expect(referencia.valores.steps).toBe(7);
    expect(referencia.valores["options.a"]).toBe(false);
    expect(resolucion.valores.some(v => v.ruta[0] === "agent" && v.ruta[1] === "build"
      && ["steps", "maxSteps", "options"].includes(v.ruta[2]!))).toBe(false);
    expect(resolucion.entradas.filter(e => e.condicion === "observada")).toHaveLength(6);
    expect(resumenes()).toEqual(antes);
  });
});
describe("RNF-01", () => {
  test("resolver conserva SHA-256 de los tres archivos y el arbol de la copia", async () => {
    const { escenario, entorno } = await preparar();
    const rutas = ["opencode.json", "proyecto/opencode.json", "proyecto/opencode.jsonc"];
    const resumenes = () => rutas.map(r => createHash("sha256").update(readFileSync(join(escenario.raiz, r))).digest("hex"));
    const arbol = () => readdirSync(escenario.raiz, { recursive: true }).sort();
    const antes = resumenes();
    const arbolAntes = arbol();
    expect(existsSync(join(escenario.raiz, "REFERENCIA.json"))).toBe(false);
    expect(readFileSync(join(escenario.raiz, ".git/HEAD"), "utf8")).toBe("ref: refs/heads/main\n");
    resolverEscenario(escenario.proyecto, entorno);
    expect(resumenes()).toEqual(antes);
    expect(arbol()).toEqual(arbolAntes);
  });
});
