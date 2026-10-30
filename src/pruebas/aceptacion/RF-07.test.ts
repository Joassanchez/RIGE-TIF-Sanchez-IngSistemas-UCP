import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { copiarEscenario } from "../utilidades/escenario";
import { entornoDeReferencia } from "../utilidades/entorno-referencia";
import { crearEntornoMemoria } from "../utilidades/entorno-memoria";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { consultarEntradas } from "../../paquetes/rige/aplicacion/casos-uso/consultar-entradas";
import { consultarHallazgos } from "../../paquetes/rige/aplicacion/casos-uso/consultar-hallazgos";
import type { RespuestaHallazgos } from "../../paquetes/rige/aplicacion/respuestas/hallazgos";
import type { TipoHallazgo } from "../../paquetes/nucleo/hallazgos/tipos";
import { explicarHallazgo } from "../../paquetes/nucleo/hallazgos/explicar";
import { plantillasHallazgo } from "../../paquetes/opencode/reglas";

const raiz = join(import.meta.dir, "../escenarios");
describe("T3-05 R-9 completitud", () => {
  test("todas las causas de los cuatro detectores tienen plantilla completa", () => {
    const causas = ["sintaxis-invalida", "archivo-inexistente", "permiso-invalido", "variable-sin-valor", "agente-predeterminado-inexistente", "agente-comando-inexistente"];
    expect(Object.keys(plantillasHallazgo).sort()).toEqual([...causas].sort());
    for (const causa of causas) {
      const texto = explicarHallazgo({ tipo: "entrada-ilegible", causa, entrada: { orden: 0, via: "archivo", referencia: "/p/a.json", condicion: "observada" },
        posicion: { linea: 1, columna: 1 }, clave: ["agent", "a"], parametros: { archivo: "/p/falta", variable: "FALTA", agente: "fantasma" } }, plantillasHallazgo);
      expect(texto).toContain("OpenCode 1.18.25");
      expect(texto).not.toMatch(/\{[^}]+\}/);
    }
  });
});
const temporales: ReturnType<typeof copiarEscenario>[] = [];
afterEach(() => { for (const t of temporales.splice(0)) t.borrar(); });
function preparar(nombre: string) {
  const referencia = JSON.parse(readFileSync(join(raiz, nombre, "REFERENCIA.json"), "utf8"));
  const copia = copiarEscenario(nombre, { git: referencia.procedencia.git ?? "raiz" });
  temporales.push(copia);
  const env = entornoDeReferencia(referencia, copia);
  const proyecto = join(copia.raiz, referencia.procedencia.directorio);
  return { ...copia, proyecto, env, dependencias: () => ({ adaptador: adaptadorOpenCode,
    entorno: new EntornoLecturaSistema({ plataforma: process.platform, entorno: env }),
    rutas: { canonica: (ruta: string) => ruta === proyecto ? ruta : null } }) };
}
function obtener(d: Parameters<typeof consultarHallazgos>[0], proyecto: string): RespuestaHallazgos {
  const r = consultarHallazgos(d, proyecto);
  if (!r.exito) throw new Error(r.error.mensaje);
  return r.valor;
}
function memoria(archivos: Record<string, string>, variables: Record<string, string> = {}) {
  const entorno = crearEntornoMemoria({ archivos, directorios: ["/p", "/h", "/h/.config", "/h/.config/opencode"],
    variables: { HOME: "/h", ...variables } });
  return { adaptador: adaptadorOpenCode, entorno, rutas: { canonica: () => "/p" } };
}

describe("RF-07 CA-2 T3-05 R-1", () => {
  test("localiza la unica ilegible y devuelve hallazgos parciales", () => {
    const e = preparar("v3-entradas-ilegible");
    const d = e.dependencias();
    const r = obtener(d, e.proyecto);
    const entradas = consultarEntradas(d, e.proyecto);
    if (!entradas.exito) throw new Error(entradas.error.mensaje);
    const ilegible = entradas.valor.entradas.find(x => x.error?.consecuencia === "falla")!;
    expect(r.incompleta).toBe(true);
    expect(r.motivos).toEqual(["hallazgos-parciales"]);
    expect(r.hallazgos).toHaveLength(1);
    expect(r.hallazgos[0]).toMatchObject({ tipo: "entrada-ilegible", causa: "sintaxis-invalida",
      entrada: { referencia: ilegible.referencia }, posicion: { linea: ilegible.error!.linea, columna: ilegible.error!.columna } });
  });
});
describe("T3-05 R-2", () => {
  test("cada entrada se lee una vez y el resumen coincide con entradas", () => {
    const d = memoria({ "/p/opencode.json": '{"default_agent":"fantasma"}' });
    const leidas: string[] = [];
    const entorno = { ...d.entorno, leer: (ruta: string) => {
      expect(leidas).not.toContain(ruta);
      leidas.push(ruta);
      return d.entorno.leer(ruta);
    } };
    const r = obtener({ ...d, entorno }, "/p");
    const entradas = consultarEntradas(d, "/p");
    if (!entradas.exito) throw new Error(entradas.error.mensaje);
    expect(r.resumenEntradas).toBe(entradas.valor.resumenEntradas);
    expect(leidas).toContain("/p/opencode.json");
  });
  test("informa todas las ilegibles por precedencia y no intenta resolver referencias", () => {
    const d = memoria({ "/h/.config/opencode/opencode.json": "{", "/p/opencode.json": "{" },
      { OPENCODE_CONFIG_CONTENT: '{"default_agent":"fantasma"}' });
    const r = obtener(d, "/p");
    expect(r.hallazgos.map(h => h.entrada.referencia)).toEqual(["/h/.config/opencode/opencode.json", "/p/opencode.json"]);
    expect(r.hallazgos.every(h => h.tipo === "entrada-ilegible")).toBe(true);
  });
});
describe("RF-07 entradas-descartadas T3-05 R-3", () => {
  test("el permiso invalido se descarta sin impedir la resolucion", () => {
    const e = preparar("v3-permiso-invalido");
    const r = obtener(e.dependencias(), e.proyecto);
    expect(r.incompleta).toBe(false);
    expect(r.hallazgos).toHaveLength(1);
    expect(r.hallazgos[0]).toMatchObject({ tipo: "entrada-descartada", causa: "permiso-invalido",
      entrada: { referencia: "OPENCODE_PERMISSION", condicion: "definida" } });
  });
});
describe("RF-07 sustituciones-sin-valor T3-05 R-4", () => {
  test("solo tokens declarados sin valor, con posicion original y advertencia wellknown", () => {
    const e = preparar("v3-sustituciones");
    const r = obtener(e.dependencias(), e.proyecto);
    expect(r.hallazgos).toHaveLength(1);
    expect(r.hallazgos[0]).toMatchObject({ tipo: "sustitucion-sin-valor", clave: ["agent", "general", "description"],
      parametros: { variable: "RIGE_PRUEBA_SIN_DEFINIR" }, posicion: { linea: 10, columna: 24 } });
    expect(r.motivos).toEqual(["wellknown-no-observada"]);
    expect(r.reglas["wellknown-no-observada"]).toContain("auth.json");
    e.env.RIGE_PRUEBA_SIN_DEFINIR = "";
    expect(obtener(e.dependencias(), e.proyecto)).toEqual(r);
  });
  test("conserva sustituciones desplazadas y excluidas antes de secuenciar", () => {
    const r = obtener(memoria({ "/h/.config/opencode/opencode.json": '{"agent":{"general":{"description":"{env:FALTA}"}}}',
      "/p/opencode.json": '{"agent":{"general":{"description":"presente"}},"permission":{"read":"{env:FALTA}allow"}}' }), "/p");
    expect(r.hallazgos.map(h => [h.entrada.referencia, h.clave])).toEqual([
      ["/h/.config/opencode/opencode.json", ["agent", "general", "description"]],
      ["/p/opencode.json", ["permission", "read"]],
    ]);
  });
});
describe("RF-07 entradas-ilegibles T3-05 R-5", () => {
  for (const [token, archivo] of [["./no-existe.txt", "/p/no-existe.txt"], ["~/x.txt", "/h/x.txt"]]) {
    test(`archivo inexistente ${token}`, () => {
      const r = obtener(memoria({ "/p/opencode.json": `{"model":"{file:${token}}"}` }), "/p");
      expect(r.incompleta).toBe(true);
      expect(r.hallazgos).toHaveLength(1);
      expect(r.hallazgos[0]).toMatchObject({ tipo: "entrada-ilegible", causa: "archivo-inexistente",
        parametros: { archivo }, posicion: { linea: 1, columna: 11 } });
    });
  }
});
describe("RF-07 referencias-no-resueltas T3-05 R-6", () => {
  test("resuelve solo nombres determinantes literales, activos o no observados", () => {
    expect(JSON.parse(readFileSync(join(raiz, "v3-referencias/REFERENCIA.json"), "utf8")).comandos).toEqual(["ok", "saludo", "vacio", "x"]);
    const e = preparar("v3-referencias");
    const consultar = () => obtener(e.dependencias(), e.proyecto);
    expect(consultar().hallazgos.map(h => [h.causa, h.parametros.agente])).toEqual([
      ["agente-predeterminado-inexistente", "fantasma"], ["agente-comando-inexistente", "inactivo"],
    ]);
    delete e.env.RIGE_PRUEBA_AGENTE;
    expect(consultar().hallazgos.map(h => h.tipo)).toEqual(["referencia-no-resuelta", "referencia-no-resuelta", "sustitucion-sin-valor"]);
    const archivo = join(e.proyecto, "opencode.json");
    const config = JSON.parse(readFileSync(archivo, "utf8"));
    delete config.command.saludo;
    e.env.RIGE_PRUEBA_AGENTE = "plan";
    for (const nombre of ["revisor", ""]) {
      config.default_agent = nombre;
      writeFileSync(archivo, JSON.stringify(config));
      expect(consultar().hallazgos).toEqual([]);
    }
  });
  test("no examina una referencia bajo un prefijo no resuelto ni una desplazada", () => {
    const d = memoria({ "/h/.config/opencode/opencode.json": '{"default_agent":"fantasma"}',
      "/p/opencode.json": '{"default_agent":"plan","command":{"x":{"agent":"fantasma"}}}' });
    const secuenciar = d.adaptador.secuenciar;
    const adaptador = { ...d.adaptador, secuenciar: ((lecturas) => {
      const s = secuenciar(lecturas);
      return s.exito ? { exito: true as const, valor: { ...s.valor, noResueltas: [{ ruta: ["command"], regla: "fuera-del-v1" }] } } : s;
    }) as typeof secuenciar };
    expect(obtener({ ...d, adaptador }, "/p").hallazgos).toEqual([]);
  });
});
describe("RF-07 CA-2 T3-05 R-7", () => {
  test("respuesta determinista sin valores sustituidos", () => {
    const e = preparar("v3-sustituciones");
    const a = obtener(e.dependencias(), e.proyecto);
    expect(obtener(e.dependencias(), e.proyecto)).toEqual(a);
    const texto = JSON.stringify(a);
    expect(texto).not.toContain("MARCA-");
    for (const [nombre, valor] of Object.entries(e.env)) if (nombre.startsWith("RIGE_PRUEBA_")) expect(texto).not.toContain(valor);
  });
});
describe("RF-07 CA-1 T3-05 R-8", () => {
  for (const nombre of readdirSync(raiz).filter(n => {
    try { return !JSON.parse(readFileSync(join(raiz, n, "REFERENCIA.json"), "utf8")).procedencia.fallaEsperada; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT" || (error as NodeJS.ErrnoException).code === "ENOTDIR") return false; throw error; }
  })) {
    test(`${nombre}: solo defectos sembrados`, () => {
      const e = preparar(nombre);
      const r = obtener(e.dependencias(), e.proyecto);
      const esperados: Record<string, TipoHallazgo[]> = { "v3-permiso-invalido": ["entrada-descartada"],
        "v3-sustituciones": ["sustitucion-sin-valor"], "v3-referencias": ["referencia-no-resuelta", "referencia-no-resuelta"] };
      expect(r.incompleta).toBe(false);
      expect(r.hallazgos.map(h => h.tipo)).toEqual(esperados[nombre] ?? []);
    });
  }
});
