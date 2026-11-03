import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, posix, win32 } from "node:path";
import { copiarEscenario, type OpcionesEscenario } from "../utilidades/escenario";
import { entornoDeReferencia } from "../utilidades/entorno-referencia";
import { crearEntornoMemoria } from "../utilidades/entorno-memoria";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { abarca } from "../../paquetes/opencode/hallazgos";
import { consultarEntradas } from "../../paquetes/rige/aplicacion/casos-uso/consultar-entradas";
import { consultarHallazgos } from "../../paquetes/rige/aplicacion/casos-uso/consultar-hallazgos";
import type { RespuestaHallazgos } from "../../paquetes/rige/aplicacion/respuestas/hallazgos";
import type { TipoHallazgo } from "../../paquetes/nucleo/hallazgos/tipos";
import { explicarHallazgo } from "../../paquetes/nucleo/hallazgos/explicar";
import { plantillasExplicacion, plantillasHallazgo } from "../../paquetes/opencode/reglas";

const raiz = join(import.meta.dir, "../escenarios");
describe("T3-05 R-9 completitud", () => {
  test("todas las causas de los cuatro detectores tienen plantilla completa", () => {
    const causas = ["sintaxis-invalida", "archivo-inexistente", "permiso-invalido", "variable-sin-valor", "agente-predeterminado-inexistente", "agente-comando-inexistente"];
    expect(Object.keys(plantillasHallazgo)).toEqual(expect.arrayContaining(causas));
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
function preparar(nombre: string, opciones: OpcionesEscenario = {}) {
  const referencia = JSON.parse(readFileSync(join(raiz, nombre, "REFERENCIA.json"), "utf8"));
  const copia = copiarEscenario(nombre, { git: referencia.procedencia.git ?? "raiz", ...opciones });
  temporales.push(copia);
  const env = entornoDeReferencia(referencia, copia);
  const proyecto = join(copia.raiz, referencia.procedencia.directorio);
  return { ...copia, referencia, proyecto, env, dependencias: () => ({ adaptador: adaptadorOpenCode,
    entorno: new EntornoLecturaSistema({ plataforma: process.platform, entorno: env }),
    rutas: { canonica: (ruta: string) => ruta === proyecto ? ruta : null } }) };
}
function prepararSinReferencia(nombre: string, opciones: OpcionesEscenario = { git: "proyecto" }) {
  const copia = copiarEscenario(nombre, opciones);
  temporales.push(copia);
  const env = entornoDeReferencia({ procedencia: { hogar: "hogar" } }, copia);
  return { ...copia, env, dependencias: () => ({ adaptador: adaptadorOpenCode,
    entorno: new EntornoLecturaSistema({ plataforma: process.platform, entorno: env }),
    rutas: { canonica: (ruta: string) => ruta === copia.proyecto ? ruta : null } }) };
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
    expect(r.motivos).toEqual(["wellknown-no-observada", "elementos-sin-uso-no-evaluados"]);
    expect(r.reglas["wellknown-no-observada"]).toContain("auth.json");
    expect(r.reglas["elementos-sin-uso-no-evaluados"]).toBeDefined();
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
  const tiposT305 = new Set<TipoHallazgo>(["entrada-ilegible", "entrada-descartada", "sustitucion-sin-valor", "referencia-no-resuelta"]);
  for (const nombre of readdirSync(raiz).filter(n => {
    try { return !JSON.parse(readFileSync(join(raiz, n, "REFERENCIA.json"), "utf8")).procedencia.fallaEsperada; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT" || (error as NodeJS.ErrnoException).code === "ENOTDIR") return false; throw error; }
  })) {
    test(`${nombre}: cero hallazgos de los cuatro tipos de T3-05 salvo los sembrados`, () => {
      const e = preparar(nombre);
      const r = obtener(e.dependencias(), e.proyecto);
      const esperados: Record<string, TipoHallazgo[]> = { "v3-permiso-invalido": ["entrada-descartada"],
        "v3-sustituciones": ["sustitucion-sin-valor"], "v3-referencias": ["referencia-no-resuelta", "referencia-no-resuelta"] };
      expect(r.incompleta).toBe(false);
      expect(r.hallazgos.filter(h => tiposT305.has(h.tipo)).map(h => h.tipo)).toEqual(esperados[nombre] ?? []);
    });
  }
});

describe("T3-06 R-1", () => {
  test("inclusion conservadora de patrones y no falsos positivos entre git * y git?*", () => {
    expect(abarca("*", "*")).toBe(true);
    expect(abarca("*", "src/a.js")).toBe(true);
    expect(abarca("*", "git *")).toBe(true);
    expect(abarca("src/a.js", "src/a.js")).toBe(true);
    expect(abarca("src/*", "src/a.js")).toBe(true);
    expect(abarca("src/*", "src/*.js")).toBe(true);
    expect(abarca("src/*.js", "src/*")).toBe(false);
    expect(abarca("privado/*", "privado/")).toBe(true);
    expect(abarca("privado/*", "privado")).toBe(false);
    expect(abarca("git?*", "git *")).toBe(false);
    expect(abarca("git *", "git?*")).toBe(false);
    expect(abarca("src/*", "src\\a.js")).toBe(true);
    expect(abarca("src\\*", "src/a.js")).toBe(true);
    expect(abarca("SRC/*", "src/a.js")).toBe(false);
    expect(abarca("src/*", "SRC/a.js")).toBe(false);

    expect(obtener(memoria({
      "/p/opencode.json": '{"permission":{"bash":{"git *":"allow","git?*":"deny"}}}',
    }), "/p").hallazgos).toEqual([]);
    expect(obtener(memoria({
      "/p/opencode.json": '{"permission":{"bash":{"git?*":"allow","git *":"deny"}}}',
    }), "/p").hallazgos).toEqual([]);
  });
});

describe("T3-06 R-2", () => {
  test("regla tapada por posterior en el mismo bloque, orden inverso, sujetos distintos, comodin y bloques", () => {
    const e = prepararSinReferencia("v3-sin-efecto");
    const r = obtener(e.dependencias(), e.proyecto);
    const tapadas = r.hallazgos.filter(h => h.tipo === "regla-sin-efecto");
    const refArchivo = `${e.proyecto.replaceAll("\\", "/")}/opencode.json`;
    expect(tapadas).toEqual([{
      tipo: "regla-sin-efecto",
      causa: "tapada-por-posterior",
      entrada: { orden: expect.any(Number), via: "proyecto", referencia: refArchivo, condicion: "observada" },
      posicion: { linea: 4, columna: 7 },
      clave: ["permission", "read", "src/a.js"],
      parametros: {
        sujeto: "read",
        patron: "src/a.js",
        efecto: "permitida",
        patronPosterior: "*",
        efectoPosterior: "denegada",
        origenPosterior: `${refArchivo}:5`,
      },
      explicacion: expect.stringContaining(`${refArchivo}:5`),
    }]);

    expect(obtener(memoria({
      "/p/opencode.json": '{"permission":{"read":{"*":"deny","src/a.js":"allow"}}}',
    }), "/p").hallazgos).toEqual([]);

    expect(obtener(memoria({
      "/p/opencode.json": '{"permission":{"read":{"src/a.js":"allow"},"edit":{"*":"deny"}}}',
    }), "/p").hallazgos).toEqual([]);

    expect(obtener(memoria({
      "/p/opencode.json": '{"permission":{"*":{"src/a.js":"allow","*":"deny"}}}',
    }), "/p").hallazgos).toEqual([]);

    expect(obtener(memoria({
      "/p/opencode.json": '{"permission":{"read":{"src/a.js":"allow"},"*":{"*":"deny"}}}',
    }), "/p").hallazgos).toEqual([]);

    expect(obtener(memoria({
      "/p/opencode.json": '{"permission":{"read":{"src/a.js":"allow"}},"agent":{"build":{"permission":{"read":{"*":"deny"}}}}}',
    }), "/p").hallazgos).toEqual([]);

    const enAgente = obtener(memoria({
      "/p/opencode.json": '{\n  "agent": {\n    "build": {\n      "permission": {\n        "read": {\n          "src/a.js": "allow",\n          "*": "deny"\n        }\n      }\n    }\n  }\n}',
    }), "/p");
    expect(enAgente.hallazgos).toEqual([{
      tipo: "regla-sin-efecto",
      causa: "tapada-por-posterior",
      entrada: { orden: expect.any(Number), via: "proyecto", referencia: "/p/opencode.json", condicion: "observada" },
      posicion: { linea: 6, columna: 11 },
      clave: ["agent", "build", "permission", "read", "src/a.js"],
      parametros: {
        sujeto: "read",
        patron: "src/a.js",
        efecto: "permitida",
        patronPosterior: "*",
        efectoPosterior: "denegada",
        origenPosterior: "/p/opencode.json:7",
      },
      explicacion: expect.stringContaining("/p/opencode.json:7"),
    }]);
  });
});

describe("T3-06 R-3", () => {
  test("bloque con regla intermedia excluida por sustitucion informa igual y omite A con sustituciones", () => {
    const conIntermediaExcluida = obtener(memoria({
      "/p/opencode.json": '{\n  "permission": {\n    "read": {\n      "src/a.js": "allow",\n      "src/b.js": "{env:RIGE_ACCION}",\n      "*": "deny"\n    }\n  }\n}',
    }, { RIGE_ACCION: "deny" }), "/p");
    expect(conIntermediaExcluida.hallazgos.filter(h => h.tipo === "regla-sin-efecto")).toEqual([{
      tipo: "regla-sin-efecto",
      causa: "tapada-por-posterior",
      entrada: { orden: expect.any(Number), via: "proyecto", referencia: "/p/opencode.json", condicion: "observada" },
      posicion: { linea: 4, columna: 7 },
      clave: ["permission", "read", "src/a.js"],
      parametros: {
        sujeto: "read",
        patron: "src/a.js",
        efecto: "permitida",
        patronPosterior: "*",
        efectoPosterior: "denegada",
        origenPosterior: "/p/opencode.json:6",
      },
      explicacion: expect.stringContaining("/p/opencode.json:6"),
    }]);

    const conASustituida = obtener(memoria({
      "/p/opencode.json": '{"permission":{"read":{"{env:RIGE_PATRON}":"allow","*":"deny"}}}',
    }, { RIGE_PATRON: "src/a.js" }), "/p");
    expect(conASustituida.hallazgos.filter(h => h.tipo === "regla-sin-efecto")).toEqual([]);
  });
});

describe("T3-06 R-4", () => {
  test("variantes con referencia del binario en v2-ruta-bloqueo, v2-ruta-env y v2-ruta-exposicion (RF-07 CA-1 y CA-5)", () => {
    for (const rutasNativas of process.platform === "win32" ? [false, true] : [false]) {
      const bloqueo = preparar("v2-ruta-bloqueo", { rutasNativas });
      const rBloqueo = obtener(bloqueo.dependencias(), bloqueo.proyecto);
      const controlesBloqueo = [
        { agente: "a", control: "b", linea: 7, sujeto: "read", forma: "src/productos.js", efecto: "allow" },
        { agente: "c", control: "d", linea: 23, sujeto: "edit", forma: "src/index.js", efecto: "allow" },
        { agente: "e", control: "control_e", linea: 39, sujeto: "read", forma: "src/productos.js", efecto: "allow" },
      ] as const;
      expect(rBloqueo.hallazgos).toHaveLength(3);
      for (const [idx, esperado] of controlesBloqueo.entries()) {
        const decisionControl = bloqueo.referencia.decisiones.find((d: { agente: string }) => d.agente === esperado.control);
        expect(decisionControl.decision).toBe(esperado.efecto);
        const textoDecision = plantillasExplicacion.efectos[decisionControl.decision]!;
        expect(rBloqueo.hallazgos[idx]).toMatchObject({
          tipo: "regla-sin-efecto",
          causa: "ruta-absoluta-con-forma",
          entrada: { referencia: `${bloqueo.proyecto.replaceAll("\\", "/")}/opencode.jsonc` },
          posicion: { linea: esperado.linea, columna: 11 },
          clave: ["agent", esperado.agente, "permission", esperado.sujeto, expect.any(String)],
          parametros: {
            sujeto: esperado.sujeto,
            efecto: textoDecision,
            formaRelativa: esperado.forma,
            decision: textoDecision,
          },
        });
      }

      const envEscenario = preparar("v2-ruta-env", { rutasNativas });
      const rEnv = obtener(envEscenario.dependencias(), envEscenario.proyecto);
      const decisionControlF = envEscenario.referencia.decisiones.find((d: { agente: string }) => d.agente === "control_f");
      expect(decisionControlF.decision).toBe("allow");
      expect(rEnv.hallazgos).toEqual([{
        tipo: "regla-sin-efecto",
        causa: "ruta-absoluta-con-forma",
        entrada: { orden: expect.any(Number), via: "proyecto", referencia: `${envEscenario.proyecto.replaceAll("\\", "/")}/opencode.jsonc`, condicion: "observada" },
        posicion: { linea: 6, columna: 11 },
        clave: ["agent", "f", "permission", "read", expect.any(String)],
        parametros: {
          sujeto: "read",
          patron: expect.any(String),
          efecto: "permitida",
          formaRelativa: ".env",
          decision: plantillasExplicacion.efectos[decisionControlF.decision]!,
        },
        explicacion: expect.stringContaining("Con la forma relativa .env, en la misma posición, la decisión es permitida."),
      }]);

      const exposicion = preparar("v2-ruta-exposicion", { rutasNativas });
      const rExposicion = obtener(exposicion.dependencias(), exposicion.proyecto);
      const hallazgosG = rExposicion.hallazgos.filter(h => h.clave?.[1] === "g");
      expect(hallazgosG).toHaveLength(3);
      for (const [idx, objetivo] of (["config/credenciales.json", "privado"] as const).entries()) {
        const decisionH = exposicion.referencia.decisiones.find((d: { agente: string; objetivos: string[] }) => d.agente === "h" && d.objetivos.includes(objetivo));
        expect(decisionH.decision).toBe("deny");
        expect(hallazgosG[idx]).toMatchObject({
          tipo: "regla-sin-efecto",
          causa: "ruta-absoluta-con-forma",
          posicion: { linea: idx === 0 ? 6 : 7, columna: 11 },
          parametros: {
            sujeto: "read",
            efecto: "denegada",
            formaRelativa: objetivo,
            decision: plantillasExplicacion.efectos[decisionH.decision]!,
          },
        });
      }
      expect(hallazgosG[2]).toMatchObject({
        tipo: "regla-sin-efecto",
        causa: "ruta-absoluta",
        posicion: { linea: 8, columna: 11 },
        parametros: { sujeto: "read", efecto: "denegada" },
      });
      expect(hallazgosG[2]!.parametros.formaRelativa).toBeUndefined();
      expect(hallazgosG[2]!.parametros.decision).toBeUndefined();
    }
  });

  test("directorio con barra final da la forma sin barra y regla absoluta tapada da solo ruta-absoluta", () => {
    const entornoGit = crearEntornoMemoria({
      archivos: {
        "/p/opencode.json": '{"permission":{"read":{"/p/privado/":"deny"}}}',
        "/p/.git/HEAD": "ref: refs/heads/main\n",
        "/bin/git": "",
      },
      directorios: ["/p", "/p/.git", "/p/.git/objects", "/p/.git/refs", "/bin", "/h", "/h/.config", "/h/.config/opencode"],
      variables: { HOME: "/h", PATH: "/bin" },
    });
    const rBarra = obtener({ adaptador: adaptadorOpenCode, entorno: entornoGit, rutas: { canonica: () => "/p" } }, "/p");
    expect(rBarra.hallazgos).toEqual([{
      tipo: "regla-sin-efecto",
      causa: "ruta-absoluta-con-forma",
      entrada: { orden: expect.any(Number), via: "proyecto", referencia: "/p/opencode.json", condicion: "observada" },
      posicion: { linea: 1, columna: 24 },
      clave: ["permission", "read", "/p/privado/"],
      parametros: { sujeto: "read", patron: "/p/privado/", efecto: "denegada", formaRelativa: "privado", decision: "denegada" },
      explicacion: expect.stringContaining("Con la forma relativa privado, en la misma posición, la decisión es denegada."),
    }]);

    const entornoTapada = crearEntornoMemoria({
      archivos: {
        "/p/opencode.json": '{"permission":{"read":{"/p/src/productos.js":"allow","*":"deny"}}}',
        "/p/.git/HEAD": "ref: refs/heads/main\n",
        "/bin/git": "",
      },
      directorios: ["/p", "/p/.git", "/p/.git/objects", "/p/.git/refs", "/bin", "/h", "/h/.config", "/h/.config/opencode"],
      variables: { HOME: "/h", PATH: "/bin" },
    });
    const rTapada = obtener({ adaptador: adaptadorOpenCode, entorno: entornoTapada, rutas: { canonica: () => "/p" } }, "/p");
    expect(rTapada.hallazgos).toEqual([{
      tipo: "regla-sin-efecto",
      causa: "ruta-absoluta",
      entrada: { orden: expect.any(Number), via: "proyecto", referencia: "/p/opencode.json", condicion: "observada" },
      posicion: { linea: 1, columna: 24 },
      clave: ["permission", "read", "/p/src/productos.js"],
      parametros: { sujeto: "read", patron: "/p/src/productos.js", efecto: "permitida" },
      explicacion: expect.not.stringContaining("Con la forma relativa"),
    }]);
  });
});

describe("T3-06 R-5", () => {
  test("las reglas de los agentes de control no producen ningun hallazgo de ruta absoluta", () => {
    const esperadosSinControl: Readonly<Record<string, readonly string[]>> = {
      "v2-ruta-bloqueo": ["a", "c", "e"],
      "v2-ruta-env": ["f"],
      "v2-ruta-exposicion": ["g", "g", "g"],
    };
    for (const [nombre, agentesConRutaAbsoluta] of Object.entries(esperadosSinControl)) {
      const e = preparar(nombre);
      const r = obtener(e.dependencias(), e.proyecto);
      const deRutaAbsoluta = r.hallazgos.filter(h => h.causa === "ruta-absoluta" || h.causa === "ruta-absoluta-con-forma");
      expect(deRutaAbsoluta.map(h => h.clave?.[1])).toEqual([...agentesConRutaAbsoluta]);
      expect(deRutaAbsoluta.filter(h => ["b", "d", "control_e", "control_f", "h"].includes(h.clave?.[1] ?? ""))).toEqual([]);
      expect(r.hallazgos.filter(h => ["b", "d", "control_e", "control_f"].includes(h.clave?.[1] ?? ""))).toEqual([]);
    }
  });
});

describe("T3-06 R-6", () => {
  test("ruta fuera de la base, arbol / en POSIX, otra unidad o sin unidad en win32 y sujeto bash o comodin", () => {
    function consultarMemoriaPosix(archivos: Record<string, string>, conGit: boolean) {
      const entorno = crearEntornoMemoria({
        archivos: {
          ...archivos,
          ...(conGit ? { "/proyecto/.git/HEAD": "ref: refs/heads/main\n", "/bin/git": "" } : {}),
        },
        directorios: [
          "/proyecto", "/hogar", "/hogar/.config", "/hogar/.config/opencode",
          ...(conGit ? ["/proyecto/.git", "/proyecto/.git/objects", "/proyecto/.git/refs", "/bin"] : []),
        ],
        variables: { HOME: "/hogar", ...(conGit ? { PATH: "/bin" } : {}) },
        plataforma: "linux",
      });
      return obtener({ adaptador: adaptadorOpenCode, entorno, rutas: { canonica: () => "/proyecto" } }, "/proyecto");
    }

    expect(consultarMemoriaPosix({
      "/proyecto/opencode.json": '{"permission":{"read":{"/otro/x":"allow","/*/src/a.js":"allow"}}}',
    }, true).hallazgos).toEqual([]);

    const sinGitPosix = consultarMemoriaPosix({
      "/proyecto/opencode.json": '{"permission":{"read":{"/proyecto/src/a.js":"deny","/otro/x":"deny"}}}',
    }, false);
    expect(sinGitPosix.hallazgos.map(h => ({ causa: h.causa, patron: h.parametros.patron, forma: h.parametros.formaRelativa }))).toEqual([
      { causa: "ruta-absoluta-con-forma", patron: "/proyecto/src/a.js", forma: "proyecto/src/a.js" },
      { causa: "ruta-absoluta", patron: "/otro/x", forma: undefined },
    ]);

    expect(consultarMemoriaPosix({
      "/proyecto/opencode.json": '{"permission":{"bash":{"/proyecto/src/a.js":"allow"},"*":{"/proyecto/src/a.js":"allow"},"read*":{"/proyecto/src/a.js":"allow"}}}',
    }, true).hallazgos).toEqual([]);

    function consultarMemoriaWin32(config: string, conGit: boolean) {
      const base = crearEntornoMemoria({
        archivos: {
          "D:\\proyecto\\opencode.json": config,
          ...(conGit ? { "D:\\proyecto\\.git\\HEAD": "ref: refs/heads/main\n", "C:\\bin\\git.exe": "" } : {}),
        },
        directorios: [
          "D:\\proyecto", "C:\\hogar", "C:\\hogar\\.config", "C:\\hogar\\.config\\opencode",
          ...(conGit ? ["D:\\proyecto\\.git", "D:\\proyecto\\.git\\objects", "D:\\proyecto\\.git\\refs", "C:\\bin"] : []),
        ],
        variables: { USERPROFILE: "C:\\hogar", HOME: "C:\\hogar", ...(conGit ? { PATH: "C:\\bin" } : {}) },
        plataforma: "win32",
        rutas: "win32",
      });
      const entorno = {
        ...base,
        unir: win32.join,
        padre: win32.dirname,
        relativa: (d: string, h: string) => win32.relative(win32.resolve("C:\\", d), win32.resolve("C:\\", h)),
      };
      return obtener({ adaptador: adaptadorOpenCode, entorno, rutas: { canonica: () => "D:\\proyecto" } }, "D:\\proyecto");
    }

    expect(consultarMemoriaWin32('{"permission":{"read":{"E:/otro/a.txt":"deny","E:\\\\otro\\\\b.txt":"deny"}}}', false).hallazgos).toEqual([]);
    const sinUnidad = consultarMemoriaWin32('{"permission":{"read":{"\\\\proyecto\\\\src\\\\a.js":"deny","\\\\otro\\\\a.js":"deny"}}}', true);
    expect(sinUnidad.hallazgos).toHaveLength(1);
    expect(sinUnidad.hallazgos[0]).toMatchObject({
      tipo: "regla-sin-efecto",
      causa: "ruta-absoluta-con-forma",
      parametros: { sujeto: "read", patron: "\\proyecto\\src\\a.js", efecto: "denegada", formaRelativa: "src/a.js", decision: "denegada" },
    });
    void posix;
  });
});

describe("T3-06 R-7", () => {
  test("subagente declarado sin uso en v3-sin-efecto, controles que lo nombran y conservador con Markdown o sustitucion", () => {
    const base = prepararSinReferencia("v3-sin-efecto");
    const rBase = obtener(base.dependencias(), base.proyecto);
    const sinUso = rBase.hallazgos.filter(h => h.tipo === "elemento-sin-uso");
    expect(sinUso).toHaveLength(1);
    expect(sinUso[0]).toMatchObject({
      tipo: "elemento-sin-uso",
      causa: "subagente-sin-uso",
      entrada: { referencia: `${base.proyecto.replaceAll("\\", "/")}/opencode.json` },
      posicion: { linea: 9, columna: expect.any(Number) },
      parametros: { agente: "auditor" },
    });
    expect(sinUso[0]!.clave?.slice(0, 2)).toEqual(["agent", "auditor"]);

    const variantesUso: Record<string, unknown>[] = [
      { command: { revisar: { template: "Revisa", agent: "auditor" } } },
      { default_agent: "auditor" },
      { command: { revisar: { template: "Usa @auditor sobre el cambio" } } },
      { agent: { auditor: { mode: "subagent", description: "Subagente" }, principal: { mode: "primary", prompt: "Consulta a @auditor" } } },
      { permission: { task: { auditor: "deny" } } },
      { agent: { auditor: { mode: "subagent", description: "Subagente" }, principal: { mode: "primary", permission: { task: { auditor: "allow" } } } } },
    ];
    for (const extra of variantesUso) {
      const copia = prepararSinReferencia("v3-sin-efecto");
      const rutaConfig = join(copia.proyecto, "opencode.json");
      const actual = JSON.parse(readFileSync(rutaConfig, "utf8"));
      writeFileSync(rutaConfig, JSON.stringify({ ...actual, ...extra }));
      const r = obtener(copia.dependencias(), copia.proyecto);
      expect(r.hallazgos.filter(h => h.tipo === "elemento-sin-uso")).toEqual([]);
      expect(r.motivos).not.toContain("elementos-sin-uso-no-evaluados");
    }

    const conMarkdown = prepararSinReferencia("v3-sin-efecto");
    mkdirSync(join(conMarkdown.proyecto, ".opencode/agents"), { recursive: true });
    writeFileSync(join(conMarkdown.proyecto, ".opencode/agents/revisor.md"), "---\ndescription: Revisor\n---\nPrompt\n");
    const rMd = obtener(conMarkdown.dependencias(), conMarkdown.proyecto);
    expect(rMd.hallazgos.filter(h => h.tipo === "elemento-sin-uso")).toEqual([]);
    expect(rMd.motivos).toContain("elementos-sin-uso-no-evaluados");
    expect(rMd.reglas["elementos-sin-uso-no-evaluados"]).toBeDefined();

    const conSustitucion = prepararSinReferencia("v3-sin-efecto");
    conSustitucion.env.RIGE_PLANTILLA = "Sin mencion";
    const rutaSust = join(conSustitucion.proyecto, "opencode.json");
    const configSust = JSON.parse(readFileSync(rutaSust, "utf8"));
    writeFileSync(rutaSust, JSON.stringify({ ...configSust, command: { revisar: { template: "{env:RIGE_PLANTILLA}" } } }));
    const rSust = obtener(conSustitucion.dependencias(), conSustitucion.proyecto);
    expect(rSust.hallazgos.filter(h => h.tipo === "elemento-sin-uso")).toEqual([]);
    expect(rSust.motivos).toContain("elementos-sin-uso-no-evaluados");
  });
});

describe("T3-06 R-8", () => {
  test("plantillas exactas de las cuatro causas nuevas y subagente-sin-uso sin afirmar inaccesibilidad", () => {
    const todas = [
      "sintaxis-invalida", "archivo-inexistente", "permiso-invalido", "variable-sin-valor",
      "agente-predeterminado-inexistente", "agente-comando-inexistente",
      "tapada-por-posterior", "ruta-absoluta", "ruta-absoluta-con-forma", "subagente-sin-uso",
    ];
    expect(Object.keys(plantillasHallazgo).sort()).toEqual([...todas].sort());

    const entrada = { orden: 0, via: "proyecto", referencia: "/p/opencode.json", condicion: "observada" as const };
    const posicion = { linea: 4, columna: 7 };

    expect(explicarHallazgo({
      tipo: "regla-sin-efecto",
      causa: "tapada-por-posterior",
      entrada,
      posicion,
      clave: ["permission", "read", "src/a.js"],
      parametros: {
        sujeto: "read",
        patron: "src/a.js",
        efecto: "permitida",
        patronPosterior: "*",
        efectoPosterior: "denegada",
        origenPosterior: "/p/opencode.json:5",
      },
    }, plantillasHallazgo)).toBe(
      'La regla read src/a.js → permitida (permission.read["src/a.js"]) queda sin efecto: la regla posterior read * → denegada, declarada en /p/opencode.json:5, abarca todos sus casos y OpenCode 1.18.25 aplica la última coincidencia.',
    );

    expect(explicarHallazgo({
      tipo: "regla-sin-efecto",
      causa: "ruta-absoluta",
      entrada,
      posicion,
      clave: ["agent", "g", "permission", "read", "/p/privado/*"],
      parametros: { sujeto: "read", patron: "/p/privado/*", efecto: "denegada" },
    }, plantillasHallazgo)).toBe(
      "La regla read /p/privado/* → denegada declara una ruta absoluta del árbol de trabajo y no coincide con ninguna acción: OpenCode 1.18.25 evalúa la ruta relativa al árbol de trabajo.",
    );

    expect(explicarHallazgo({
      tipo: "regla-sin-efecto",
      causa: "ruta-absoluta-con-forma",
      entrada,
      posicion,
      clave: ["agent", "a", "permission", "read", "/p/src/productos.js"],
      parametros: {
        sujeto: "read",
        patron: "/p/src/productos.js",
        efecto: "permitida",
        formaRelativa: "src/productos.js",
        decision: "permitida",
      },
    }, plantillasHallazgo)).toBe(
      "La regla read /p/src/productos.js → permitida declara una ruta absoluta del árbol de trabajo y no coincide con ninguna acción: OpenCode 1.18.25 evalúa la ruta relativa al árbol de trabajo. Con la forma relativa src/productos.js, en la misma posición, la decisión es permitida.",
    );

    const textoSubagente = explicarHallazgo({
      tipo: "elemento-sin-uso",
      causa: "subagente-sin-uso",
      entrada,
      posicion,
      clave: ["agent", "auditor", "mode"],
      parametros: { agente: "auditor" },
    }, plantillasHallazgo);
    expect(textoSubagente).toBe(
      "Ningún agente ni comando nombra al subagente auditor; solo queda disponible para la herramienta task, a criterio del modelo, o por mención directa del usuario.",
    );
    expect(textoSubagente.toLowerCase()).not.toContain("no puede");
    expect(textoSubagente.toLowerCase()).not.toContain("inaccesible");
  });
});

describe("T3-06 R-9", () => {
  const tiposT306 = new Set<TipoHallazgo>(["regla-sin-efecto", "elemento-sin-uso"]);
  const esperadosPorEscenario: Readonly<Record<string, readonly {
    readonly tipo: TipoHallazgo;
    readonly causa: string;
    readonly linea: number;
    readonly sujeto?: string;
    readonly formaRelativa?: string;
    readonly patron?: string;
    readonly patronPosterior?: string;
    readonly agente?: string;
  }[]>> = {
    // RE-03: subagente declarado zeta (mode: subagent) sin ninguna declaracion de agente ni comando que lo nombre.
    "v2-agentes": [
      { tipo: "elemento-sin-uso", causa: "subagente-sin-uso", linea: 4, agente: "zeta" },
    ],
    // RE-03: subagente declarado vacio (mode: subagent) sin ninguna declaracion de agente ni comando que lo nombre.
    "v2-subagente": [
      { tipo: "elemento-sin-uso", causa: "subagente-sin-uso", linea: 4, agente: "vacio" },
    ],
    // RE-02 y RF-07 CA-5: tres reglas read/edit con ruta absoluta del arbol en agentes a, c y e (controles b, d, control_e).
    "v2-ruta-bloqueo": [
      { tipo: "regla-sin-efecto", causa: "ruta-absoluta-con-forma", linea: 7, sujeto: "read", formaRelativa: "src/productos.js" },
      { tipo: "regla-sin-efecto", causa: "ruta-absoluta-con-forma", linea: 23, sujeto: "edit", formaRelativa: "src/index.js" },
      { tipo: "regla-sin-efecto", causa: "ruta-absoluta-con-forma", linea: 39, sujeto: "read", formaRelativa: "src/productos.js" },
    ],
    // RE-02 y RF-07 CA-5: regla read .env con ruta absoluta del arbol en agente f (control control_f).
    "v2-ruta-env": [
      { tipo: "regla-sin-efecto", causa: "ruta-absoluta-con-forma", linea: 6, sujeto: "read", formaRelativa: ".env" },
    ],
    // RE-02 y RF-07 CA-5: tres reglas read con ruta absoluta en g (la tercera con comodin, sin forma)
    // y en h la regla privado/ tapada por privado/* posterior del mismo bloque (* admite vacio).
    "v2-ruta-exposicion": [
      { tipo: "regla-sin-efecto", causa: "ruta-absoluta-con-forma", linea: 6, sujeto: "read", formaRelativa: "config/credenciales.json" },
      { tipo: "regla-sin-efecto", causa: "ruta-absoluta-con-forma", linea: 7, sujeto: "read", formaRelativa: "privado" },
      { tipo: "regla-sin-efecto", causa: "ruta-absoluta", linea: 8, sujeto: "read" },
      { tipo: "regla-sin-efecto", causa: "tapada-por-posterior", linea: 18, sujeto: "read", patron: "privado/", patronPosterior: "privado/*" },
    ],
  };

  for (const nombre of readdirSync(raiz).filter(n => {
    try { return !JSON.parse(readFileSync(join(raiz, n, "REFERENCIA.json"), "utf8")).procedencia.fallaEsperada; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT" || (error as NodeJS.ErrnoException).code === "ENOTDIR") return false; throw error; }
  })) {
    test(`${nombre}: conjunto exacto de hallazgos de los dos tipos nuevos sin falsos positivos`, () => {
      const e = preparar(nombre);
      const r = obtener(e.dependencias(), e.proyecto);
      const obtenidos = r.hallazgos.filter(h => tiposT306.has(h.tipo)).map(h => ({
        tipo: h.tipo,
        causa: h.causa,
        linea: h.posicion.linea,
        ...(h.parametros.sujeto ? { sujeto: h.parametros.sujeto } : {}),
        ...(h.parametros.formaRelativa ? { formaRelativa: h.parametros.formaRelativa } : {}),
        ...(h.causa === "tapada-por-posterior" ? { patron: h.parametros.patron, patronPosterior: h.parametros.patronPosterior } : {}),
        ...(h.parametros.agente ? { agente: h.parametros.agente } : {}),
      }));
      expect(obtenidos).toEqual([...(esperadosPorEscenario[nombre] ?? [])]);
    });
  }
});
