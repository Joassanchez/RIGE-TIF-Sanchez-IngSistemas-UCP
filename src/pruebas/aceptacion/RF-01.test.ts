import { afterEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { resolver } from "../../paquetes/nucleo/resolucion/resolver";
import { consultarAgente } from "../../paquetes/nucleo/resolucion/proyectar";
import type { RastroValor, Resolucion } from "../../paquetes/nucleo/resolucion/tipos";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";

const limpiezas: (() => void)[] = [];
afterEach(() => { for (const borrar of limpiezas.splice(0).reverse()) borrar(); });

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
