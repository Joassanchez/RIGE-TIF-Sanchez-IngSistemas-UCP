import { borrarTemporal } from "../utilidades/borrar-temporal";
import { afterEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { consultarAgente } from "../../paquetes/nucleo/resolucion/proyectar";
import type { RastroValor, Resolucion } from "../../paquetes/nucleo/resolucion/tipos";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";
import { crearEntornoAislado } from "../utilidades/entorno-aislado";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { resolver } from "../../paquetes/nucleo/resolucion/resolver";
import { copiarEscenario } from "../utilidades/escenario";
import { entornoDeReferencia } from "../utilidades/entorno-referencia";
import { consultarValores } from "../../paquetes/rige/aplicacion/casos-uso/consultar-valores";

const limpiezas: (() => void)[] = [];
afterEach(() => { for (const borrar of limpiezas.splice(0).reverse()) borrar(); });

describe("V1-08 F-1", () => {
  test("copiarEscenario devuelve rutas canonicas con un enlace en el temporal", () => {
    const temporal = mkdtempSync(join(tmpdir(), "rige-canonica-"));
    limpiezas.push(() => borrarTemporal(temporal));
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
  limpiezas.push(() => borrarTemporal(hogar));
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
  const variables = crearEntornoAislado(entorno.variable("HOME")!, process.env);
  for (const nombre of ["HOME", "USERPROFILE", "XDG_CONFIG_HOME", "XDG_DATA_HOME", "XDG_STATE_HOME", "XDG_CACHE_HOME",
    "LOCALAPPDATA", "APPDATA", "ProgramData", "OPENCODE_CONFIG", "RIGE_ALMACEN"]) {
    const valor = entorno.variable(nombre);
    if (valor !== undefined) variables[nombre] = valor;
  }
  const lectura = new EntornoLecturaSistema({ plataforma: process.platform, entorno: variables });
  const contexto = adaptadorOpenCode.contexto(proyecto, lectura);
  if (!contexto.exito) throw new Error(contexto.error.mensaje);
  const resultado = resolver(adaptadorOpenCode, proyecto, lectura, contexto.valor);
  if (!resultado.exito) throw new Error(resultado.error.mensaje);
  return resultado.valor;
}
function consultar(resolucion: Resolucion, clave: string | undefined): readonly RastroValor[] {
  const resultado = consultarAgente(resolucion, "build", clave?.split("."));
  if (!resultado.exito) throw new Error(resultado.error.mensaje);
  return resultado.valor.valores.map(({ rastro }) => rastro);
}
function comprobarTemperatura(rastro: RastroValor, raiz: string, valor: number): void {
  expect(rastro.ruta).toEqual(["agent", "build", "temperature"]);
  expect(rastro.valor).toBe(valor);
  expect(rastro.determinante).toEqual({ origen: { tipo: "declarado", orden: 3, posicion: { linea: 6, columna: 7 } }, via: "proyecto", referencia: join(raiz, "proyecto/opencode.jsonc").replaceAll("\\", "/"), valor: 0.3, regla: "orden-de-aplicacion" });
  expect(rastro.desplazadas).toEqual([
    { origen: { tipo: "declarado", orden: 1, posicion: { linea: 5, columna: 7 } }, via: "proyecto", referencia: join(raiz, "opencode.json").replaceAll("\\", "/"), valor: 0.1, regla: "orden-de-aplicacion" },
    { origen: { tipo: "declarado", orden: 2, posicion: { linea: 5, columna: 7 } }, via: "proyecto", referencia: join(raiz, "proyecto/opencode.json").replaceAll("\\", "/"), valor: 0.2, regla: "orden-de-aplicacion" },
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
  test("V-4 las cuatro claves sustituidas conservan plantilla, procedencia y desplazadas en ambas consultas", () => {
    const referencia = JSON.parse(readFileSync(join(import.meta.dir, "../escenarios/v3-sustituciones/REFERENCIA.json"), "utf8"));
    const e = copiarEscenario("v3-sustituciones", { git: "proyecto" });
    limpiezas.push(e.borrar);
    const env = entornoDeReferencia(referencia, e);
    const entorno = new EntornoLecturaSistema({ plataforma: process.platform, entorno: env });
    const deps = { adaptador: adaptadorOpenCode, entorno, rutas: { canonica: () => e.proyecto } };
    const casos = [
      { agente: "revisor", clave: "description", plantilla: "Clave {env:RIGE_PRUEBA_CLAVE}",
        tipo: "variable", origen: "RIGE_PRUEBA_CLAVE", definido: true, posicion: { linea: 6, columna: 29 }, referencia: join(e.proyecto, "opencode.json") },
      { agente: "revisor", clave: "prompt", plantilla: "{file:./prompts/revisor.txt}",
        tipo: "archivo", origen: join(e.proyecto, "prompts/revisor.txt").replaceAll("\\", "/"), definido: true, posicion: { linea: 7, columna: 18 }, referencia: join(e.proyecto, "opencode.json") },
      { agente: "plan", clave: "description", plantilla: "{env:RIGE_PRUEBA_CONTENIDO}",
        tipo: "variable", origen: "RIGE_PRUEBA_CONTENIDO", definido: true, posicion: { linea: 4, columna: 23 }, referencia: "OPENCODE_CONFIG_CONTENT" },
      { agente: "general", clave: "description", plantilla: "x{env:RIGE_PRUEBA_SIN_DEFINIR}y",
        tipo: "variable", origen: "RIGE_PRUEBA_SIN_DEFINIR", definido: false, posicion: { linea: 10, columna: 24 }, referencia: join(e.proyecto, "opencode.json") },
    ] as const;
    for (const { agente, clave, plantilla, tipo, origen, definido, posicion, referencia: ref } of casos) {
      const todas = consultarValores(deps, e.proyecto, agente, undefined);
      const una = consultarValores(deps, e.proyecto, agente, clave);
      expect(todas.exito).toBe(true);
      expect(una.exito).toBe(true);
      if (!todas.exito || !una.exito) throw new Error("Consulta de sustitucion fallida");
      const seleccionada = todas.valor.valores.filter(v => v.clave === clave);
      expect(seleccionada).toHaveLength(1);
      expect(una.valor.valores).toEqual(seleccionada);
      const rastro = seleccionada[0]!.rastro;
      const texto = ref === "OPENCODE_CONFIG_CONTENT" ? env[ref]! : readFileSync(ref, "utf8");
      expect(texto).toContain(JSON.stringify(plantilla));
      expect(rastro.valor).toBe(plantilla);
      expect(rastro.determinante.valor).toBe(plantilla);
      expect(rastro.determinante.referencia).toBe(ref.replaceAll("\\", "/"));
      expect(rastro.determinante.sustituciones).toEqual([{ tipo, origen, definido, posicion }]);
      if (tipo === "variable") expect(Boolean(env[origen])).toBe(definido);
      else expect(existsSync(origen)).toBe(true);
      if (agente === "revisor" && clave === "description") {
        const global = join(e.raiz, "hogar/.config/opencode/opencode.json");
        expect(readFileSync(global, "utf8")).toContain('"Global {env:RIGE_PRUEBA_GLOBAL}"');
        expect(rastro.desplazadas).toEqual([expect.objectContaining({ referencia: global.replaceAll("\\", "/"),
          valor: "Global {env:RIGE_PRUEBA_GLOBAL}", sustituciones: [{ tipo: "variable", origen: "RIGE_PRUEBA_GLOBAL", definido: true,
            posicion: { linea: 4, columna: 30 } }] })]);
      }
    }
    // La igualdad nativa del contenido expandido se verifica por hash en RNF-04 T3-04 R-10.
  });
  test("sin clave coincide con toda la referencia y mantiene los rastros por clave", async () => {
    const { escenario, entorno, referencia } = await preparar();
    const resolucion = resolverEscenario(escenario.proyecto, entorno);
    const rastros = consultar(resolucion, undefined);
    const declarados = rastros.filter(r => r.determinante.origen.tipo === "declarado");
    expect(declarados.map(r => r.ruta.slice(2).join(".")).sort()).toEqual(["description", "steps", "temperature"]);
    expect(Object.fromEntries(declarados.map(r => [r.ruta.slice(2).join("."), r.valor]))).toEqual(referencia.valores);
    expect(rastros.filter(r => r.determinante.origen.tipo === "implicito").map(r => r.ruta[2]).sort())
      .toEqual(["mode", "name", "native", "options"]);
    for (const rastro of rastros) expect(consultar(resolucion, rastro.ruta.slice(2).join("."))).toEqual([rastro]);
    comprobarTemperatura(rastros.find(r => r.ruta[2] === "temperature")!, escenario.raiz, referencia.valores.temperature);
    expect(rastros.find(r => r.ruta[2] === "description")!.determinante.referencia).toBe(join(escenario.proyecto, "opencode.json").replaceAll("\\", "/"));
    expect(rastros.find(r => r.ruta[2] === "steps")!.determinante.referencia).toBe(join(escenario.raiz, "opencode.json").replaceAll("\\", "/"));
  });
});

describe("RF-01 CA-1 v1-vias", () => {
  test("T2-04 F-8 coincide con la referencia, resuelve el cambio de forma y excluye las derivaciones", async () => {
    const { copiarEscenario } = await import("../utilidades/escenario");
    const escenario = copiarEscenario("v1-vias");
    limpiezas.push(() => escenario.borrar());
    const administrada = mkdtempSync(join(tmpdir(), "rige-administrada-"));
    limpiezas.push(() => borrarTemporal(administrada));
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
    const declarados = rastros.filter(r => r.determinante.origen.tipo === "declarado");
    expect(declarados.map(r => r.ruta.slice(2).join(".")).sort()).toEqual(["description", "options.a", "temperature", "top_p"]);
    for (const rastro of declarados) expect(rastro.valor).toBe(referencia.valores[rastro.ruta.slice(2).join(".")]!);
    expect(rastros.filter(r => r.determinante.origen.tipo === "implicito").map(r => r.ruta[2]).sort())
      .toEqual(["mode", "name", "native"]);
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
    expect(rastros.find(r => r.ruta[2] === "description")!.determinante.referencia).toBe(ruta("proyecto/.opencode/opencode.json"));
    expect(resolucion.noResueltas).toEqual([
      { ruta: ["agent", "build", "steps"], regla: "fuera-del-v1" },
      { ruta: ["agent", "build", "maxSteps"], regla: "fuera-del-v1" },
    ]);
    expect(referencia.valores.steps).toBe(7);
    expect(referencia.valores["options.a"]).toBe(false);
    expect(rastros.find(r => r.ruta[2] === "options")).toMatchObject({
      ruta: ["agent", "build", "options", "a"], valor: false,
      determinante: { via: "proyecto", referencia: ruta("proyecto/opencode.json"), origen: { posicion: { linea: 8, columna: 9 } } },
      desplazadas: [{ valor: 1, via: "global", referencia: ruta("hogar/.config/opencode/opencode.json"), origen: { posicion: { linea: 9, columna: 11 } } }],
    });
    expect(resolucion.valores.some(v => v.ruta[0] === "agent" && v.ruta[1] === "build"
      && ["steps", "maxSteps"].includes(v.ruta[2]!))).toBe(false);
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
