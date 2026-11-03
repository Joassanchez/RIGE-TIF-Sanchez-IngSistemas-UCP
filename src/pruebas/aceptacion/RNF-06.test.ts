import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { comparar, normalizarRutas } from "../../herramientas/referencias-nativas/comparar";
import type { Resolucion } from "../../paquetes/nucleo/resolucion/tipos";
import { consultarAgente, rutaDesdeTexto } from "../../paquetes/nucleo/resolucion/proyectar";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { ConfiguracionSistema } from "../../paquetes/rige/adaptadores/sistema/configuracion";
import { borrarTemporal } from "../utilidades/borrar-temporal";
import { crearEntornoMemoria } from "../utilidades/entorno-memoria";
import { copiarEscenario } from "../utilidades/escenario";
import { instalacionEnMemoria } from "../utilidades/instalacion-opencode";
import { resolver } from "../utilidades/resolver";

const limpiezas: (() => void)[] = [];
afterEach(() => { for (const limpiar of limpiezas.splice(0).reverse()) limpiar(); });

type Plataforma = "linux" | "win32";
type Separadores = "nativos" | "directos" | "mixtos";
interface Referencia {
  readonly procedencia: { readonly version: string; readonly binario: string; readonly hogar: string;
    readonly directorio: string; readonly OPENCODE_CONFIG?: string };
  readonly agente: string;
  readonly valores: Record<string, unknown>;
  readonly valoresAgentes: Record<string, Record<string, unknown>>;
}
function leerReferencia(nombre: string): Referencia {
  return JSON.parse(readFileSync(join(import.meta.dir, "../escenarios", nombre, "REFERENCIA.json"), "utf8"));
}

function resolverEscenario(nombre: string, plataforma: Plataforma, separadores: Separadores = "nativos"):
  { resolucion: Resolucion; raiz: string; archivosConfiguracion: string[] } {
  const copia = copiarEscenario(nombre);
  limpiezas.push(copia.borrar);
  const base = crearEntornoMemoria({ archivos: {}, plataforma });
  const rutas = base.rutasPara(plataforma);
  const raiz = plataforma === "win32" ? "C:\\escenario" : "/escenario";
  const hogar = rutas.unir(raiz, "hogar"), bin = rutas.unir(raiz, "bin");
  const instalacion = instalacionEnMemoria(bin, "1.18.25");
  const archivos: Record<string, string> = { ...instalacion.archivos,
    [rutas.unir(bin, plataforma === "win32" ? "git.exe" : "git")]: "No ejecutar.\n" };
  const directorios = [raiz, hogar, bin];
  const archivosConfiguracion: string[] = [];
  function cargar(directorio: string, partes: readonly string[] = []): void {
    for (const entrada of readdirSync(directorio, { withFileTypes: true })) {
      const relativa = [...partes, entrada.name], destino = rutas.unir(raiz, ...relativa);
      if (entrada.isDirectory()) {
        directorios.push(destino);
        cargar(join(directorio, entrada.name), relativa);
      } else {
        archivos[destino] = readFileSync(join(directorio, entrada.name), "utf8");
        if (/\.(jsonc?|md)$/.test(entrada.name)) archivosConfiguracion.push(relativa.join("/"));
      }
    }
  }
  cargar(copia.raiz);
  function barras(ruta: string): string {
    if (separadores === "directos") return ruta.replaceAll("\\", "/");
    if (separadores === "mixtos") {
      let indice = 0;
      return ruta.replaceAll("\\", () => indice++ % 2 ? "/" : "\\");
    }
    return ruta;
  }
  const variables: Record<string, string> = {
    HOME: hogar, USERPROFILE: hogar, XDG_CONFIG_HOME: rutas.unir(hogar, ".config"),
    XDG_DATA_HOME: rutas.unir(hogar, "datos"), XDG_CACHE_HOME: rutas.unir(hogar, "cache"),
    XDG_STATE_HOME: rutas.unir(hogar, "estado"), LOCALAPPDATA: hogar, APPDATA: hogar,
    RIGE_ALMACEN: rutas.unir(hogar, "almacen"), ProgramData: hogar,
    TEMP: rutas.unir(hogar, "tmp"), TMP: rutas.unir(hogar, "tmp"), TMPDIR: rutas.unir(hogar, "tmp"),
    PATH: bin,
  };
  if (nombre === "v1-vias") variables.OPENCODE_CONFIG = barras(rutas.unir(raiz, leerReferencia(nombre).procedencia.OPENCODE_CONFIG!));
  const memoria = crearEntornoMemoria({ archivos, directorios, variables, plataforma,
    ...(plataforma === "win32" ? { rutas: "win32" as const } : {}) });
  const entorno = { ...memoria, ...memoria.rutasPara(plataforma) };
  const resultado = resolver(adaptadorOpenCode, barras(rutas.unir(raiz, "proyecto")), entorno);
  if (!resultado.exito) throw new Error(resultado.error.mensaje);
  return { resolucion: resultado.valor, raiz, archivosConfiguracion };
}

// Solo las rutas bajo la raiz se relativizan; los identificadores remotos se conservan.
function relativizar(valor: unknown, raiz: string): unknown {
  if (typeof valor === "string") {
    const ruta = valor.replaceAll("\\", "/"), base = raiz.replaceAll("\\", "/");
    return ruta === base ? "." : ruta.startsWith(`${base}/`) ? ruta.slice(base.length + 1) : ruta;
  }
  if (Array.isArray(valor)) return valor.map(v => relativizar(v, raiz));
  if (valor !== null && typeof valor === "object") {
    return Object.fromEntries(Object.entries(valor).map(([clave, contenido]) => [clave, relativizar(contenido, raiz)]));
  }
  return valor;
}

describe("RNF-06 CA-1", () => {
  test("coinciden todas las entradas y hojas efectivas en Linux y Windows, sin decisiones de permiso", () => {
    for (const [nombre, cantidad] of [["v1-precedencia", 3], ["v1-vias", 6], ["openchamber-doble", 32]] as const) {
      const linux = resolverEscenario(nombre, "linux"), windows = resolverEscenario(nombre, "win32");
      for (const caso of [linux, windows]) {
        const observadas = caso.resolucion.entradas.filter(e => e.condicion === "observada");
        expect(observadas).toHaveLength(cantidad);
        expect(observadas.every(e => e.error === undefined)).toBe(true);
        expect(observadas.map(e => relativizar(e.referencia, caso.raiz)).sort()).toEqual(caso.archivosConfiguracion.sort());
        expect(caso.resolucion.valores.length).toBeGreaterThan(0);
        expect(caso.resolucion.declaraciones).not.toContain("version-no-determinada");
        expect(caso.resolucion.declaraciones).not.toContain("git-no-encontrado");
      }
      expect(relativizar(windows.resolucion.entradas, windows.raiz)).toEqual(relativizar(linux.resolucion.entradas, linux.raiz));
      const valores = (caso: typeof linux) => relativizar(caso.resolucion.valores.map(v => ({ ruta: v.ruta, valor: v.valor })), caso.raiz);
      expect(valores(windows)).toEqual(valores(linux));
      expect(relativizar(windows.resolucion.noResueltas, windows.raiz)).toEqual(relativizar(linux.resolucion.noResueltas, linux.raiz));
    }
  });
});

describe("RNF-06 CA-2", () => {
  test("los valores resueltos capturados coinciden con OpenCode 1.18.25 Windows con ambas barras y combinaciones", () => {
    for (const nombre of ["v1-vias", "v1-precedencia"]) {
      const referencia = leerReferencia(nombre);
      expect(referencia.procedencia.version).toBe("1.18.25");
      expect(referencia.procedencia.binario).toMatch(/^opencode-windows-x64(?:-baseline)?@1\.18\.25$/);
      const esperados = structuredClone(referencia.valoresAgentes);
      Object.assign(esperados[referencia.agente]!, referencia.valores);
      for (const separadores of ["nativos", "directos", "mixtos"] as const) {
        const { resolucion, raiz } = resolverEscenario(nombre, "win32", separadores);
        const obtenidos: Record<string, Record<string, unknown>> = {};
        const comparables = structuredClone(esperados);
        // maxSteps sigue fuera del alcance del adaptador: no es un valor resuelto.
        if (nombre === "v1-vias") {
          expect(resolucion.noResueltas).toContainEqual({ ruta: ["agent", "build", "steps"], regla: "fuera-del-v1" });
          expect(resolucion.valores.some(v => v.ruta.join(".") === "agent.build.steps")).toBe(false);
          delete comparables.build!.steps;
        }
        for (const [agente, claves] of Object.entries(comparables)) {
          obtenidos[agente] = {};
          expect(Object.keys(claves).length).toBeGreaterThan(0);
          for (const clave of Object.keys(claves)) {
            const ruta = rutaDesdeTexto(clave);
            if (!ruta.exito) throw new Error(ruta.error.mensaje);
            const consulta = consultarAgente(resolucion, agente, ruta.valor);
            if (!consulta.exito) throw new Error(consulta.error.mensaje);
            expect(consulta.valor.valores).toHaveLength(1);
            obtenidos[agente]![clave] = consulta.valor.valores[0]!.rastro.valor;
          }
        }
        const normalizar = (valor: typeof obtenidos) => normalizarRutas(valor, { data: raiz, tmp: raiz, hogar: raiz });
        expect(comparar(normalizar(comparables), normalizar(obtenidos))).toEqual([]);
        expect(normalizar(obtenidos)).toEqual(normalizar(comparables));
      }
    }
  });
});

describe("RNF-06 CA-3", () => {
  test("scripts sin elevacion, almacen en espacio de usuario y README de instalacion local sin privilegios", () => {
    for (const archivo of ["package.json", "paquetes/nucleo/package.json", "paquetes/opencode/package.json", "paquetes/rige/package.json"]) {
      const paquete = JSON.parse(readFileSync(join(import.meta.dir, "../..", archivo), "utf8")) as { scripts?: Record<string, string> };
      for (const comando of Object.values(paquete.scripts ?? {})) {
        expect(comando).not.toMatch(/\b(sudo|doas|runas|gsudo)(?:\.exe)?\b/i);
        expect(comando).not.toMatch(/\/(etc|usr)\b|C:[\\/]+(?:Windows|Program Files)\b/i);
      }
    }
    const temporal = mkdtempSync(join(tmpdir(), "rige-rnf06-"));
    limpiezas.push(() => borrarTemporal(temporal));
    const rutaArchivo = join(temporal, "rige.env");
    const leer = (plataforma: Plataforma, entorno: Record<string, string>) => new ConfiguracionSistema({ plataforma, entorno, rutaArchivo }).leer();
    for (const [plataforma, entorno, esperado] of [
      ["win32", { LOCALAPPDATA: temporal }, resolve(temporal, "rige")],
      ["linux", { XDG_DATA_HOME: temporal }, resolve(temporal, "rige")],
      ["linux", { HOME: temporal }, resolve(temporal, ".local/share/rige")],
      ["linux", { XDG_DATA_HOME: temporal, HOME: join(temporal, "otro") }, resolve(temporal, "rige")],
    ] as const) {
      const resultado = leer(plataforma, entorno);
      expect(resultado).toEqual({ exito: true, valor: { puerto: 4747, directorioAlmacen: esperado } });
      expect(relative(temporal, esperado).split(/[\\/]/)).not.toContain("..");
    }
    for (const [plataforma, variable] of [["win32", "LOCALAPPDATA"], ["linux", "HOME"]] as const) {
      for (const entorno of [{}, { [variable]: " \t " }]) {
        const resultado = leer(plataforma, entorno);
        expect(resultado).toMatchObject({ exito: false, error: { codigo: "configuracion-invalida",
          mensaje: expect.stringContaining(variable) } });
      }
    }
    expect(readdirSync(temporal)).toEqual([]);
    const readme = readFileSync(join(import.meta.dir, "../../README.md"), "utf8");
    const seccion = readme.match(/## Verificación de RNF-06 \(T4-02\)\r?\n([\s\S]*?)(?=\r?\n## |$)/)?.[1];
    expect(seccion).toBeDefined();
    expect(seccion).toContain("bun install --frozen-lockfile");
    expect(seccion).toContain("sin privilegios administrativos");
  });
});
