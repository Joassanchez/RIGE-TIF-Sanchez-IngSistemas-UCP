import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, posix, win32 } from "node:path";
import { copiarEscenario, type OpcionesEscenario } from "../utilidades/escenario";
import { entornoDeReferencia } from "../utilidades/entorno-referencia";
import { crearEntornoMemoria } from "../utilidades/entorno-memoria";
import { lanzar, lanzarServidor } from "../utilidades/subproceso";
import { solicitarLocal } from "../utilidades/cliente-http-local";
import { validarEsquema } from "../utilidades/validar-esquema";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { abarca } from "../../paquetes/opencode/hallazgos";
import { consultarEntradas } from "../../paquetes/rige/aplicacion/casos-uso/consultar-entradas";
import { consultarHallazgos } from "../../paquetes/rige/aplicacion/casos-uso/consultar-hallazgos";
import type { RespuestaHallazgos } from "../../paquetes/rige/aplicacion/respuestas/hallazgos";
import type { TipoHallazgo } from "../../paquetes/nucleo/hallazgos/tipos";
import { explicarHallazgo } from "../../paquetes/nucleo/hallazgos/explicar";
import { plantillasExplicacion, plantillasHallazgo } from "../../paquetes/opencode/reglas";
import type { DefectoSembrado, Manifiesto } from "../../herramientas/cobertura";

const raiz = join(import.meta.dir, "../escenarios");
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

describe("T3-05 R-9 completitud", () => {
  test("todas las causas de los detectores tienen plantilla completa derivadas del adaptador y ejecucion", () => {
    const manifiesto = JSON.parse(readFileSync(join(raiz, "MANIFIESTO.json"), "utf8")) as Manifiesto;
    const causasEmitidas = new Set<string>();

    for (const esc of manifiesto.escenarios) {
      try {
        const e = preparar(esc.id);
        const r = consultarHallazgos(e.dependencias(), e.proyecto);
        if (r.exito) {
          for (const h of r.valor.hallazgos) causasEmitidas.add(h.causa);
        }
      } catch {
        try {
          const eSin = prepararSinReferencia(esc.id);
          const r = consultarHallazgos(eSin.dependencias(), eSin.proyecto);
          if (r.exito) {
            for (const h of r.valor.hallazgos) causasEmitidas.add(h.causa);
          }
        } catch {
          // Escenario no disponible
        }
      }
    }

    const dInexistente = memoria({ "/p/opencode.json": '{"model":"{file:./no-existe.txt}"}' });
    const rInexistente = consultarHallazgos(dInexistente, "/p");
    if (rInexistente.exito) {
      for (const h of rInexistente.valor.hallazgos) causasEmitidas.add(h.causa);
    }

    const causas = new Set<string>([
      ...(adaptadorOpenCode.referencias ?? []).map((r: { causa: string }) => r.causa),
      ...causasEmitidas,
    ]);

    expect(Object.keys(plantillasHallazgo).sort()).toEqual([...causas].sort());

    for (const causa of causas) {
      const texto = explicarHallazgo({
        tipo: "entrada-ilegible",
        causa,
        entrada: { orden: 0, via: "archivo", referencia: "/p/a.json", condicion: "observada" },
        posicion: { linea: 1, columna: 1 },
        clave: ["agent", "a"],
        parametros: {
          archivo: "/p/falta",
          variable: "FALTA",
          agente: "fantasma",
          sujeto: "read",
          patron: "src/a.js",
          efecto: "permitida",
          patronPosterior: "*",
          efectoPosterior: "denegada",
          origenPosterior: "/p/opencode.json:5",
          formaRelativa: "src/a.js",
          decision: "permitida",
        },
      }, plantillasHallazgo);
      if (causa !== "subagente-sin-uso") {
        expect(texto).toContain("OpenCode 1.18.25");
      }
      expect(texto).not.toMatch(/\{[^}]+\}/);
    }

    expect(rInexistente.exito).toBe(true);
    const hInexistente = rInexistente.exito ? rInexistente.valor.hallazgos[0] : null;
    expect(hInexistente?.explicacion).toBe(
      "La entrada /p/opencode.json referencia en 1:11, mediante una sustitución de archivo, el archivo /p/no-existe.txt, que no existe o no se puede leer; OpenCode 1.18.25 termina con error al cargar la configuración."
    );

    const ePermiso = preparar("v3-permiso-invalido");
    const rPermiso = obtener(ePermiso.dependencias(), ePermiso.proyecto);
    expect(rPermiso.hallazgos[0]?.explicacion).toBe(
      "OPENCODE_PERMISSION no es JSON válido; OpenCode 1.18.25 la descarta sin error visible y solo lo registra en su archivo de registro."
    );
  });
});

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
describe("RF-07 CA-1 T3-08 R-1", () => {
  const seisTipos: readonly TipoHallazgo[] = [
    "entrada-ilegible",
    "entrada-descartada",
    "sustitucion-sin-valor",
    "referencia-no-resuelta",
    "regla-sin-efecto",
    "elemento-sin-uso",
  ];

  test("el inventario cubre los seis tipos y todas las causas de RF-07 con al menos un defecto con control no nulo", () => {
    const manifiesto = JSON.parse(readFileSync(join(raiz, "MANIFIESTO.json"), "utf8")) as Manifiesto;
    const inventario = (manifiesto.defectosSembrados ?? []) as unknown as DefectoSembrado[];

    for (const tipo of seisTipos) {
      expect(inventario.some(d => d.tipo === tipo && d.control !== null)).toBe(true);
    }

    const causasRF07 = [
      "sintaxis-invalida",
      "permiso-invalido",
      "variable-sin-valor",
      "agente-predeterminado-inexistente",
      "agente-comando-inexistente",
      "tapada-por-posterior",
      "subagente-sin-uso",
      "ruta-absoluta",
      "ruta-absoluta-con-forma",
    ];
    for (const causa of causasRF07) {
      expect(inventario.some(d => d.causa === causa && d.control !== null)).toBe(true);
    }
  });

  const manifiesto = JSON.parse(readFileSync(join(raiz, "MANIFIESTO.json"), "utf8")) as Manifiesto;
  const inventario = (manifiesto.defectosSembrados ?? []) as unknown as DefectoSembrado[];
  const nombresEscenarios = readdirSync(raiz).filter(nombre => {
    try {
      const ref = JSON.parse(readFileSync(join(raiz, nombre, "REFERENCIA.json"), "utf8"));
      const tieneFalla = Boolean(ref.procedencia?.fallaEsperada);
      const enInventario = inventario.some(d => d.escenario === nombre);
      return !tieneFalla || enInventario;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT" || (error as NodeJS.ErrnoException).code === "ENOTDIR") return false;
      throw error;
    }
  });

  function clavesCoinciden(claveReal: readonly string[] | null | undefined, claveEsperada: readonly string[] | null | undefined, raizEscenario: string): boolean {
    if (claveEsperada === undefined) return true;
    if (claveEsperada === null) return claveReal === null;
    if (!claveReal || claveReal.length !== claveEsperada.length) return false;
    const raizNorm = raizEscenario.replaceAll("\\", "/");
    return claveReal.every((segReal, i) => {
      const segEsp = claveEsperada[i]!;
      const segEspExpandido = segEsp.replaceAll("<RAIZ>", raizNorm).replaceAll("\\", "/");
      const realNorm = segReal.replaceAll("\\", "/");
      return realNorm === segEspExpandido || realNorm === segEsp.replaceAll("\\", "/");
    });
  }

  for (const nombre of nombresEscenarios) {
    test(`${nombre}: totalidad y cero falsos positivos segun el inventario de defectosSembrados`, () => {
      const e = preparar(nombre);
      const r = obtener(e.dependencias(), e.proyecto);
      const esperados = inventario.filter(d => d.escenario === nombre);

      expect(r.hallazgos.length).toBe(esperados.length);

      for (const d of esperados) {
        const coincidente = r.hallazgos.find(h => {
          if (h.tipo !== d.tipo) return false;
          if (d.causa && h.causa !== d.causa) return false;
          if (d.localizacion) {
            if ("archivo" in d.localizacion) {
              const normalizada = h.entrada.referencia.replaceAll("\\", "/");
              if (!normalizada.endsWith(d.localizacion.archivo) && !normalizada.includes(d.localizacion.archivo)) return false;
              if (h.posicion.linea !== d.localizacion.linea) return false;
            } else if ("variable" in d.localizacion) {
              if (h.entrada.referencia !== d.localizacion.variable) return false;
            }
          }
          if (d.clave !== undefined && !clavesCoinciden(h.clave, d.clave, e.raiz)) return false;
          return true;
        });

        expect(coincidente).toBeDefined();

        if (d.parametros && coincidente) {
          expect(coincidente.parametros).toMatchObject(d.parametros);
        }

        if (d.control !== null && d.control !== undefined) {
          const eCtrl = preparar(d.control.escenario);
          const rCtrl = obtener(eCtrl.dependencias(), eCtrl.proyecto);
          if (d.control.agente === null) {
            expect(rCtrl.hallazgos).toEqual([]);
          } else {
            const ctrlClave = d.control.clave;
            const hallazgosClave = rCtrl.hallazgos.filter(h =>
              (ctrlClave !== undefined && clavesCoinciden(h.clave, ctrlClave, eCtrl.raiz)) ||
              (d.control!.agente && h.clave?.[1] === d.control!.agente)
            );
            expect(hallazgosClave).toEqual([]);
          }
        }
      }
    });
  }
});

describe("T3-08 R-2", () => {
  test("diferencia minima y evidencia comprobada de cada par defecto-control", () => {
    const manifiesto = JSON.parse(readFileSync(join(raiz, "MANIFIESTO.json"), "utf8")) as Manifiesto;
    const inventario = (manifiesto.defectosSembrados ?? []) as unknown as DefectoSembrado[];
    const conControl = inventario.filter(d => d.control !== null && d.control !== undefined);

    expect(conControl.length).toBeGreaterThanOrEqual(6);

    for (const d of conControl) {
      const control = d.control!;
      expect(typeof control.evidencia).toBe("string");
      expect(control.evidencia.length).toBeGreaterThan(0);

      if (control.escenario !== d.escenario) {
        const escDef = manifiesto.escenarios.find(e => e.id === d.escenario);
        const escCtrl = manifiesto.escenarios.find(e => e.id === control.escenario);
        expect(escDef).toBeDefined();
        expect(escCtrl).toBeDefined();

        expect(control.cambios).not.toContain("REFERENCIA.json");

        const entradasDef = escDef!.entradas;
        const entradasCtrl = escCtrl!.entradas;

        const todosArchivos = new Set([...Object.keys(entradasDef), ...Object.keys(entradasCtrl)]);
        for (const f of todosArchivos) {
          if (!control.cambios.includes(f)) {
            expect(entradasCtrl[f]).toBe(entradasDef[f]);
          }
        }

        const refDef = JSON.parse(readFileSync(join(raiz, d.escenario, "REFERENCIA.json"), "utf8"));
        const refCtrl = JSON.parse(readFileSync(join(raiz, control.escenario, "REFERENCIA.json"), "utf8"));

        if (d.escenario === "v3-entradas-ilegible") {
          expect(refDef.procedencia.fallaEsperada).toBeDefined();
          expect(refCtrl.cadenas?.build).toBeDefined();
        } else if (d.escenario === "v3-permiso-invalido") {
          const t7Def = refDef.cadenas?.build?.some((r: { pattern?: string }) => r.pattern?.includes("t7"));
          const t7Ctrl = refCtrl.cadenas?.build?.some((r: { pattern?: string }) => r.pattern?.includes("t7"));
          expect(t7Def).toBe(false);
          expect(t7Ctrl).toBe(true);
        } else if (d.escenario === "v3-sustituciones") {
          const shaDef = (refDef.valoresAgentes?.general?.description as any)?.sha256 ?? refDef.valores?.["general.description"]?.sha256;
          const shaCtrl = (refCtrl.valoresAgentes?.general?.description as any)?.sha256 ?? refCtrl.valores?.["general.description"]?.sha256;
          expect(shaDef).toBeDefined();
          expect(shaCtrl).toBeDefined();
          expect(shaCtrl).not.toBe(shaDef);
        } else if (d.escenario === "v3-referencias") {
          expect(refCtrl.agentes).toBeDefined();
          const nombresDef = (refDef.agentes as Array<{ nombre: string }> | undefined)?.map(a => a.nombre) ?? [];
          expect(nombresDef).not.toContain("fantasma");
          expect(nombresDef).not.toContain("inactivo");
        } else if (d.escenario === "v3-sin-efecto") {
          const decDef = refDef.decisionesNativas?.find((x: { consulta?: string; agente?: string }) => x.agente === "build");
          const decCtrl = refCtrl.decisionesNativas?.find((x: { consulta?: string; agente?: string }) => x.agente === "build");
          expect(decDef?.herramientaNoOfrecida).not.toBe(true);
          expect(decCtrl?.herramientaNoOfrecida).not.toBe(true);
          expect(decDef?.evaluaciones.find((e: { sujeto: string }) => e.sujeto === "read")?.regla)
            .toEqual({ permission: "read", pattern: "*", action: "deny" });
          expect(decCtrl?.evaluaciones.find((e: { sujeto: string }) => e.sujeto === "read")?.regla)
            .toEqual({ permission: "read", pattern: "src/a.js", action: "allow" });
        } else if (d.escenario === "v3-sin-uso") {
          const agentesDef = (refDef.agentes as Array<{ nombre: string; modo: string }> | undefined) ?? [];
          const agentesCtrl = (refCtrl.agentes as Array<{ nombre: string; modo: string }> | undefined) ?? [];
          expect(agentesDef.find(a => a.nombre === "auditor")?.modo).toBe("subagent");
          expect(agentesCtrl.find(a => a.nombre === "auditor")?.modo).toBe("subagent");
          expect(refCtrl.comandos).toContain("revisar");
        }
      } else if (control.agente !== null) {
        const rutaConfig = existsSync(join(raiz, d.escenario, "proyecto/opencode.jsonc"))
          ? join(raiz, d.escenario, "proyecto/opencode.jsonc")
          : join(raiz, d.escenario, "proyecto/opencode.json");
        const texto = readFileSync(rutaConfig, "utf8");
        const parsed = JSON.parse(texto.replace(/\/\/.*$/gm, ""));
        const agenteDefecto = d.clave![1]!;
        const agenteControl = control.agente;
        const permDefecto = parsed.agent[agenteDefecto]?.permission ?? {};
        const permControl = parsed.agent[agenteControl]?.permission ?? {};

        for (const sujeto of Object.keys(permDefecto)) {
          const reglasDef = Object.entries(permDefecto[sujeto] as Record<string, string>);
          const reglasCtrl = Object.entries(permControl[sujeto] as Record<string, string>);
          expect(reglasCtrl.length).toBe(reglasDef.length);
          for (let i = 0; i < reglasDef.length; i++) {
            const [patronDef, efectoDef] = reglasDef[i]!;
            const [patronCtrl, efectoCtrl] = reglasCtrl[i]!;
            expect(efectoCtrl).toBe(efectoDef);
            if (patronDef === "*" || patronDef === patronCtrl) {
              expect(patronCtrl).toBe(patronDef);
            } else {
              expect(
                patronDef.includes("<RAIZ>") ||
                patronDef.startsWith("/") ||
                patronDef.includes(":\\") ||
                patronDef.startsWith("\\")
              ).toBe(true);
              expect(patronCtrl.startsWith("/")).toBe(false);
              expect(patronCtrl).not.toContain("<RAIZ>");
            }
          }
        }
      }
    }
  });
});

describe("T3-08 R-5", () => {
  test("v3-permiso-invalido registra { codigo: 0, diagnosticoVisible: false, avisoEnRegistro: true } en referencia.registro", () => {
    const referencia = JSON.parse(readFileSync(join(raiz, "v3-permiso-invalido/REFERENCIA.json"), "utf8"));
    expect(referencia.registro).toEqual({ codigo: 0, diagnosticoVisible: false, avisoEnRegistro: true });
  });
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
      localizacion: `${refArchivo}:4:7`,
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
      localizacion: "/p/opencode.json:6:11",
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
      localizacion: "/p/opencode.json:4:7",
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
        localizacion: `${envEscenario.proyecto.replaceAll("\\", "/")}/opencode.jsonc:6:11`,
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
      localizacion: "/p/opencode.json:1:24",
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
      localizacion: "/p/opencode.json:1:24",
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
  test("subagente declarado sin uso en v3-sin-uso, controles que lo nombran y conservador con Markdown o sustitucion", () => {
    const base = prepararSinReferencia("v3-sin-uso");
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
      const copia = prepararSinReferencia("v3-sin-uso");
      const rutaConfig = join(copia.proyecto, "opencode.json");
      const actual = JSON.parse(readFileSync(rutaConfig, "utf8"));
      writeFileSync(rutaConfig, JSON.stringify({ ...actual, ...extra }));
      const r = obtener(copia.dependencias(), copia.proyecto);
      expect(r.hallazgos.filter(h => h.tipo === "elemento-sin-uso")).toEqual([]);
      expect(r.motivos).not.toContain("elementos-sin-uso-no-evaluados");
    }

    const conMarkdown = prepararSinReferencia("v3-sin-uso");
    mkdirSync(join(conMarkdown.proyecto, ".opencode/agents"), { recursive: true });
    writeFileSync(join(conMarkdown.proyecto, ".opencode/agents/revisor.md"), "---\ndescription: Revisor\n---\nPrompt\n");
    const rMd = obtener(conMarkdown.dependencias(), conMarkdown.proyecto);
    expect(rMd.hallazgos.filter(h => h.tipo === "elemento-sin-uso")).toEqual([]);
    expect(rMd.motivos).toContain("elementos-sin-uso-no-evaluados");
    expect(rMd.reglas["elementos-sin-uso-no-evaluados"]).toBeDefined();

    const conSustitucion = prepararSinReferencia("v3-sin-uso");
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
  test("reemplazado por RF-07 CA-1 T3-08 R-1", () => {
    expect(true).toBe(true);
  });
});

function cliHallazgos(e: { raiz: string; proyecto: string; env: Record<string, string> }, opciones: readonly string[] = []) {
  return lanzar(e.raiz, ["hallazgos", "--proyecto", e.proyecto, ...opciones], e.env);
}
function datosWeb(cuerpo: string) {
  const bloque = /<script type="application\/json" id="respuesta">([^]*?)<\/script>/.exec(cuerpo);
  expect(bloque).not.toBeNull();
  return JSON.parse(bloque![1]!);
}
const escaparHtml = (texto: string) => texto.replaceAll("&", "&amp;").replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");

describe("T3-07 R-1", () => {
  test("CLI hallazgos: esquema, codigo 0 con y sin hallazgos, --explicar, errores de opciones y proyecto, determinismo y sin crear almacen", async () => {
    const rutaEsquema = join(import.meta.dir, "../../esquemas/salida/hallazgos.json");
    expect(existsSync(rutaEsquema)).toBe(true);
    const esquema = await Bun.file(rutaEsquema).json();

    const conHallazgos = preparar("v3-sustituciones");
    const sinExplicar1 = cliHallazgos(conHallazgos);
    expect(sinExplicar1.codigo).toBe(0);
    expect(sinExplicar1.error).toBe("");
    const sinExplicar2 = cliHallazgos(conHallazgos);
    expect(sinExplicar2).toEqual(sinExplicar1);
    expect(existsSync(conHallazgos.env.RIGE_ALMACEN!)).toBe(false);

    const jsonSinExplicar = JSON.parse(sinExplicar1.salida);
    expect(validarEsquema(esquema, jsonSinExplicar)).toEqual([]);
    expect(jsonSinExplicar.hallazgos.length).toBeGreaterThan(0);
    for (const h of jsonSinExplicar.hallazgos) {
      expect("explicacion" in h).toBe(false);
      expect(typeof h.localizacion).toBe("string");
    }

    const conExplicar1 = cliHallazgos(conHallazgos, ["--explicar"]);
    expect(conExplicar1.codigo).toBe(0);
    expect(conExplicar1.error).toBe("");
    expect(cliHallazgos(conHallazgos, ["--explicar"])).toEqual(conExplicar1);
    const jsonConExplicar = JSON.parse(conExplicar1.salida);
    expect(validarEsquema(esquema, jsonConExplicar)).toEqual([]);
    expect(jsonConExplicar.hallazgos.length).toBe(jsonSinExplicar.hallazgos.length);
    for (const h of jsonConExplicar.hallazgos) {
      expect(typeof h.explicacion).toBe("string");
      expect(h.explicacion.length).toBeGreaterThan(0);
    }

    const sinHallazgos = preparar("v2-decision");
    const rVacio = cliHallazgos(sinHallazgos);
    expect(rVacio.codigo).toBe(0);
    expect(rVacio.error).toBe("");
    const jsonVacio = JSON.parse(rVacio.salida);
    expect(validarEsquema(esquema, jsonVacio)).toEqual([]);
    expect(jsonVacio.hallazgos).toEqual([]);

    for (const invalidas of [["--agente", "build"], ["--clave", "x"], ["--desconocida"]]) {
      const inv = cliHallazgos(conHallazgos, invalidas);
      expect(inv.codigo).toBe(2);
      expect(inv.salida).toBe("");
      expect(JSON.parse(inv.error).error.codigo).toBe("argumentos-invalidos");
    }
    const sinProyectoArg = lanzar(conHallazgos.raiz, ["hallazgos"], conHallazgos.env);
    expect(sinProyectoArg.codigo).toBe(2);
    expect(JSON.parse(sinProyectoArg.error).error.codigo).toBe("argumentos-invalidos");

    const inexistente = lanzar(conHallazgos.raiz, ["hallazgos", "--proyecto", join(conHallazgos.raiz, "no-existe")], conHallazgos.env);
    expect(inexistente.codigo).toBe(1);
    expect(inexistente.salida).toBe("");
    expect(JSON.parse(inexistente.error).error.codigo).toBe("proyecto-inexistente");
  });
});

describe("RF-07 CA-3 T3-07 R-2", () => {
  test("el conjunto de hallazgos de la CLI sin explicacion es igual al de la web quitando explicacion en los cinco escenarios", async () => {
    const nombres = ["v3-entradas-ilegible", "v3-permiso-invalido", "v3-sustituciones", "v3-referencias", "v3-sin-efecto"] as const;
    for (const nombre of nombres) {
      const e = nombre === "v3-sin-efecto" ? prepararSinReferencia(nombre) : preparar(nombre);
      expect(lanzar(e.raiz, ["esquema"], e.env).codigo).toBe(0);
      const cli = cliHallazgos(e);
      expect(cli.codigo).toBe(0);
      const rCli = JSON.parse(cli.salida);
      expect(rCli.hallazgos.length).toBeGreaterThan(0);
      for (const h of rCli.hallazgos) expect("explicacion" in h).toBe(false);

      const servidor = await lanzarServidor(e.raiz, e.env);
      try {
        const pagina = await solicitarLocal({
          host: "127.0.0.1",
          puerto: servidor.puerto,
          ruta: `/hallazgos?proyecto=${encodeURIComponent(e.proyecto)}`,
        });
        expect(pagina.estado).toBe(200);
        const rWeb = datosWeb(pagina.cuerpo);
        const webSinExplicacion = {
          ...rWeb,
          hallazgos: rWeb.hallazgos.map(({ explicacion: _explicacion, ...resto }: Record<string, unknown>) => resto),
        };
        expect(rCli).toEqual(webSinExplicacion);
      } finally {
        await servidor.detener();
      }
    }
  }, 30000);
});

describe("RF-07 CA-4 T3-07 R-3", () => {
  test("con --explicar la explicacion de cada hallazgo de la CLI es identica a la de la web y al texto visible escapado en la tabla", async () => {
    const nombres = ["v3-entradas-ilegible", "v3-permiso-invalido", "v3-sustituciones", "v3-referencias", "v3-sin-efecto"] as const;
    for (const nombre of nombres) {
      const e = nombre === "v3-sin-efecto" ? prepararSinReferencia(nombre) : preparar(nombre);
      expect(lanzar(e.raiz, ["esquema"], e.env).codigo).toBe(0);
      const cli = cliHallazgos(e, ["--explicar"]);
      expect(cli.codigo).toBe(0);
      const rCli = JSON.parse(cli.salida);
      expect(rCli.hallazgos.length).toBeGreaterThan(0);

      const servidor = await lanzarServidor(e.raiz, e.env);
      try {
        const pagina = await solicitarLocal({
          host: "127.0.0.1",
          puerto: servidor.puerto,
          ruta: `/hallazgos?proyecto=${encodeURIComponent(e.proyecto)}`,
        });
        expect(pagina.estado).toBe(200);
        const rWeb = datosWeb(pagina.cuerpo);
        expect(rCli).toEqual(rWeb);
        for (const h of rCli.hallazgos) {
          expect(typeof h.explicacion).toBe("string");
          expect(h.explicacion.length).toBeGreaterThan(0);
          expect(pagina.cuerpo).toContain(`<td>${escaparHtml(h.tipo)}</td><td>${escaparHtml(h.localizacion)}</td><td>${escaparHtml(h.explicacion)}</td>`);
        }
      } finally {
        await servidor.detener();
      }
    }
  }, 30000);
});

describe("T3-07 R-4", () => {
  test("web /hallazgos aplica verificacion de metodo, Host y Sec-Fetch-Site igual que /entradas y escapa <script>", async () => {
    const e = prepararSinReferencia("v3-sin-efecto");
    const rutaConfig = join(e.proyecto, "opencode.json");
    const config = JSON.parse(readFileSync(rutaConfig, "utf8"));
    config.permission.read = {
      "<script>alert(1)</script>": "allow",
      "*": "deny",
    };
    writeFileSync(rutaConfig, JSON.stringify(config, null, 2));
    expect(lanzar(e.raiz, ["esquema"], e.env).codigo).toBe(0);

    const servidor = await lanzarServidor(e.raiz, e.env);
    try {
      const q = `?proyecto=${encodeURIComponent(e.proyecto)}`;
      const solicitarH = (opciones: object = {}) => solicitarLocal({ host: "127.0.0.1", puerto: servidor.puerto, ruta: `/hallazgos${q}`, ...opciones });
      const solicitarE = (opciones: object = {}) => solicitarLocal({ host: "127.0.0.1", puerto: servidor.puerto, ruta: `/entradas${q}`, ...opciones });

      const ok = await solicitarH();
      expect(ok.estado).toBe(200);
      expect(ok.cuerpo).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
      const bloques = [...ok.cuerpo.matchAll(/<script type="application\/json" id="respuesta">([^]*?)<\/script>/g)];
      expect(bloques).toHaveLength(1);
      expect(ok.cuerpo.replace(bloques[0]![0], "")).not.toMatch(/<script/i);

      for (const opciones of [
        { metodo: "POST" },
        { metodo: "PUT" },
        { cabeceras: { Host: "ajeno.example" } },
        { cabeceras: { "Sec-Fetch-Site": "cross-site" } },
        { cabeceras: { "Sec-Fetch-Site": "same-site" } },
      ]) {
        const rh = await solicitarH(opciones);
        const re = await solicitarE(opciones);
        expect(rh.estado).toBe(re.estado);
        expect(rh.cuerpo).toBe(re.cuerpo);
      }
    } finally {
      await servidor.detener();
    }
  });
});
