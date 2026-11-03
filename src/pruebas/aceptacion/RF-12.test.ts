import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { copiarEscenario, type OpcionesEscenario } from "../utilidades/escenario";
import { entornoDeReferencia } from "../utilidades/entorno-referencia";
import { lanzar, lanzarServidor } from "../utilidades/subproceso";
import { solicitarLocal } from "../utilidades/cliente-http-local";
import { validarEsquema } from "../utilidades/validar-esquema";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";
import { crearEntornoMemoria } from "../utilidades/entorno-memoria";
import { consultarValores } from "../../paquetes/rige/aplicacion/casos-uso/consultar-valores";
import { respuestaValores } from "../../paquetes/rige/aplicacion/casos-uso/proyectar-valores";
import { consultarPermiso } from "../../paquetes/rige/aplicacion/casos-uso/consultar-permiso";
import { consultarAgentes } from "../../paquetes/rige/aplicacion/casos-uso/consultar-agentes";
import { consultarEntradas } from "../../paquetes/rige/aplicacion/casos-uso/consultar-entradas";
import { consultarHallazgos } from "../../paquetes/rige/aplicacion/casos-uso/consultar-hallazgos";
import type { DeclaracionUbicada, Resolucion } from "../../paquetes/nucleo/resolucion/tipos";
import { localizacion } from "../../paquetes/nucleo/permisos/explicar";

const raizEscenarios = join(import.meta.dir, "../escenarios");
const temporales: ReturnType<typeof copiarEscenario>[] = [];
afterEach(() => { for (const t of temporales.splice(0)) t.borrar(); });

function preparar(nombre: string, opciones: OpcionesEscenario = {}) {
  const rutaRef = join(raizEscenarios, nombre, "REFERENCIA.json");
  const referencia = existsSync(rutaRef) ? JSON.parse(readFileSync(rutaRef, "utf8")) : { procedencia: { directorio: "proyecto", hogar: "hogar", git: "proyecto" } };
  const copia = copiarEscenario(nombre, { git: referencia.procedencia?.git ?? "raiz", ...opciones });
  temporales.push(copia);
  const env = entornoDeReferencia(referencia, copia);
  const proyecto = join(copia.raiz, referencia.procedencia?.directorio ?? "proyecto");
  return {
    ...copia, referencia, proyecto, env,
    dependencias: () => ({
      adaptador: adaptadorOpenCode,
      entorno: new EntornoLecturaSistema({ plataforma: process.platform, entorno: env }),
      rutas: { canonica: (ruta: string) => ruta === proyecto ? ruta : null },
    }),
  };
}

function datosWeb(cuerpo: string) {
  const bloque = /<script type="application\/json" id="respuesta">([^]*?)<\/script>/.exec(cuerpo);
  expect(bloque).not.toBeNull();
  return JSON.parse(bloque![1]!);
}

const regexArchivo = /^(?:[A-Za-z]:)?\/.+:\d+:\d+$/;
const regexVariable = /^OPENCODE_[A-Z_]+:\d+:\d+$/;

function verificarDeclaracionUbicada(
  d: DeclaracionUbicada,
  condicionEntrada: (ref: string) => "observada" | "no_observada" | "definida" | undefined,
  muestrasArchivo: { referencia: string; linea: number; columna: number }[],
) {
  if (d.origen.tipo === "declarado" && d.referencia !== null) {
    expect(typeof d.localizacion).toBe("string");
    expect(d.localizacion).toBe(`${d.referencia}:${d.origen.posicion.linea}:${d.origen.posicion.columna}`);
    expect(d.localizacion).toBe(localizacion(d.referencia, d.origen.posicion));
    const cond = condicionEntrada(d.referencia);
    if (cond === "definida") {
      expect(d.localizacion).toMatch(regexVariable);
    } else {
      expect(d.localizacion).toMatch(regexArchivo);
      muestrasArchivo.push({ referencia: d.referencia, linea: d.origen.posicion.linea, columna: d.origen.posicion.columna });
    }
  } else {
    expect(d.localizacion).toBeUndefined();
  }
}

describe("RF-12 CA-1 T3-07 R-5", () => {
  const escenariosValidos = readdirSync(raizEscenarios).filter(n => {
    if (!/^(?:v1|v2|v3)-/.test(n)) return false;
    const rutaRef = join(raizEscenarios, n, "REFERENCIA.json");
    if (!existsSync(rutaRef)) return true;
    return !JSON.parse(readFileSync(rutaRef, "utf8")).procedencia?.fallaEsperada;
  });

  test("en todos los escenarios v1-*, v2-* y v3-* sin fallaEsperada toda localizacion cumple el formato y coincide con la posicion real en el archivo", () => {
    expect(escenariosValidos.length).toBeGreaterThan(0);
    const muestrasArchivo: { referencia: string; linea: number; columna: number }[] = [];
    let totalDeclaracionesDeclaradas = 0;
    let totalVariablesDeclaradas = 0;

    for (const nombre of escenariosValidos) {
      const e = preparar(nombre);
      const deps = e.dependencias();

      const rValores = consultarValores(deps, e.proyecto, "build", undefined);
      expect(rValores.exito).toBe(true);
      if (!rValores.exito) throw new Error(rValores.error.mensaje);
      const condPorRef = (ref: string) => rValores.valor.entradas.find(en => en.referencia === ref)?.condicion;

      for (const { rastro } of rValores.valor.valores) {
        for (const decl of [rastro.determinante, ...rastro.desplazadas]) {
          if (decl.origen.tipo === "declarado" && decl.referencia !== null) {
            totalDeclaracionesDeclaradas++;
            if (condPorRef(decl.referencia) === "definida") totalVariablesDeclaradas++;
          }
          verificarDeclaracionUbicada(decl, condPorRef, muestrasArchivo);
        }
      }

      const rPermiso = consultarPermiso(deps, { proyecto: e.proyecto, agente: "build", sujeto: "read", objetivo: "src/a.js" });
      expect(rPermiso.exito).toBe(true);
      if (!rPermiso.exito) throw new Error(rPermiso.error.mensaje);
      for (const regla of rPermiso.valor.cadena) {
        if (regla.declaracion) {
          if (regla.declaracion.origen.tipo === "declarado" && regla.declaracion.referencia !== null) totalDeclaracionesDeclaradas++;
          verificarDeclaracionUbicada(regla.declaracion, condPorRef, muestrasArchivo);
        }
      }

      const rAgentes = consultarAgentes(deps, e.proyecto);
      expect(rAgentes.exito).toBe(true);
      if (!rAgentes.exito) throw new Error(rAgentes.error.mensaje);
      for (const elim of rAgentes.valor.eliminados) {
        if (elim.declaracion.origen.tipo === "declarado" && elim.declaracion.referencia !== null) totalDeclaracionesDeclaradas++;
        verificarDeclaracionUbicada(elim.declaracion, condPorRef, muestrasArchivo);
      }

      const rHallazgos = consultarHallazgos(deps, e.proyecto);
      expect(rHallazgos.exito).toBe(true);
      if (!rHallazgos.exito) throw new Error(rHallazgos.error.mensaje);
      for (const h of rHallazgos.valor.hallazgos) {
        expect(typeof h.localizacion).toBe("string");
        expect(h.localizacion).toBe(`${h.entrada.referencia}:${h.posicion.linea}:${h.posicion.columna}`);
        if (h.entrada.condicion === "definida") {
          totalVariablesDeclaradas++;
          expect(h.localizacion).toMatch(regexVariable);
        } else {
          expect(h.localizacion).toMatch(regexArchivo);
          muestrasArchivo.push({ referencia: h.entrada.referencia, linea: h.posicion.linea, columna: h.posicion.columna });
        }
      }
    }

    expect(totalDeclaracionesDeclaradas).toBeGreaterThan(0);
    expect(totalVariablesDeclaradas).toBeGreaterThan(0);
    expect(muestrasArchivo.length).toBeGreaterThan(0);

    for (const muestra of muestrasArchivo.slice(0, 15)) {
      const texto = readFileSync(muestra.referencia, "utf8");
      const lineas = texto.split(/\r?\n/);
      expect(muestra.linea).toBeGreaterThanOrEqual(1);
      expect(muestra.linea).toBeLessThanOrEqual(lineas.length);
      const lineaTexto = lineas[muestra.linea - 1]!;
      expect(muestra.columna).toBeGreaterThanOrEqual(1);
      expect(muestra.columna).toBeLessThanOrEqual(lineaTexto.length + 1);
      const caracterEnPosicion = lineaTexto[muestra.columna - 1] ?? "";
      expect(['"', "{", "[", "t", "f", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-"]).toContain(caracterEnPosicion);
    }
  }, 30000);
});

describe("RF-12 CA-2 T3-07 R-6", () => {
  test("la misma declaracion tiene la misma localizacion en la CLI y en la web, y las paginas no arman .posicion.linea por su cuenta", async () => {
    const dirPaginas = join(import.meta.dir, "../../paquetes/rige/interfaces/web/paginas");
    for (const archivo of readdirSync(dirPaginas).filter(f => f.endsWith(".ts") && !f.endsWith(".test.ts"))) {
      const codigo = readFileSync(join(dirPaginas, archivo), "utf8");
      expect(codigo).not.toContain(".posicion.linea");
    }

    const decision = preparar("v2-decision");
    writeFileSync(join(decision.proyecto, "opencode.json"), '{\n  "agent": {\n    "build": {\n      "temperature": 0.2\n    }\n  }\n}');
    expect(lanzar(decision.raiz, ["esquema"], decision.env).codigo).toBe(0);

    const cliValores = lanzar(decision.raiz, ["valores", "--proyecto", decision.proyecto, "--agente", "build"], decision.env);
    expect(cliValores.codigo).toBe(0);
    const rCliValores = JSON.parse(cliValores.salida);

    const cliPermiso = lanzar(decision.raiz, ["permiso", "--proyecto", decision.proyecto, "--agente", "build", "--sujeto", "read", "--objetivo", ".env", "--explicar"], decision.env);
    expect(cliPermiso.codigo).toBe(0);
    const rCliPermiso = JSON.parse(cliPermiso.salida);

    const servidorDecision = await lanzarServidor(decision.raiz, decision.env);
    try {
      const alta = await solicitarLocal({
        host: "127.0.0.1",
        puerto: servidorDecision.puerto,
        ruta: `/resolver?proyecto=${encodeURIComponent(decision.proyecto)}&agente=build`,
      });
      expect(alta.estado).toBe(303);
      const id = /\/resoluciones\/(\d+)/.exec(String(alta.cabeceras.location))![1]!;

      const pagValores = await solicitarLocal({ host: "127.0.0.1", puerto: servidorDecision.puerto, ruta: `/resoluciones/${id}?agente=build` });
      expect(pagValores.estado).toBe(200);
      const rWebValores = datosWeb(pagValores.cuerpo);
      expect(rWebValores).toEqual(rCliValores);
      const tempDet = rCliValores.valores.find((v: { clave: string }) => v.clave === "temperature").rastro.determinante;
      expect(typeof tempDet.localizacion).toBe("string");
      expect(pagValores.cuerpo).toContain(tempDet.localizacion);

      const pagPermiso = await solicitarLocal({ host: "127.0.0.1", puerto: servidorDecision.puerto, ruta: `/permiso?id=${id}&agente=build&sujeto=read&objetivo=.env` });
      expect(pagPermiso.estado).toBe(200);
      const rWebPermiso = datosWeb(pagPermiso.cuerpo);
      expect(rWebPermiso).toEqual(rCliPermiso);
      const reglaDecl = rCliPermiso.cadena.find((r: { origen: { tipo: string } }) => r.origen.tipo === "declarado");
      expect(typeof reglaDecl.declaracion.localizacion).toBe("string");
      expect(pagPermiso.cuerpo).toContain(reglaDecl.declaracion.localizacion);
    } finally {
      await servidorDecision.detener();
    }

    const sinEfecto = preparar("v3-sin-efecto");
    expect(lanzar(sinEfecto.raiz, ["esquema"], sinEfecto.env).codigo).toBe(0);
    const cliHall = lanzar(sinEfecto.raiz, ["hallazgos", "--proyecto", sinEfecto.proyecto, "--explicar"], sinEfecto.env);
    expect(cliHall.codigo).toBe(0);
    const rCliHall = JSON.parse(cliHall.salida);
    expect(rCliHall.hallazgos.length).toBeGreaterThan(0);

    const servidorHall = await lanzarServidor(sinEfecto.raiz, sinEfecto.env);
    try {
      const pagHall = await solicitarLocal({
        host: "127.0.0.1",
        puerto: servidorHall.puerto,
        ruta: `/hallazgos?proyecto=${encodeURIComponent(sinEfecto.proyecto)}`,
      });
      expect(pagHall.estado).toBe(200);
      const rWebHall = datosWeb(pagHall.cuerpo);
      expect(rWebHall).toEqual(rCliHall);
      for (const h of rCliHall.hallazgos) {
        expect(typeof h.localizacion).toBe("string");
        expect(pagHall.cuerpo).toContain(h.localizacion);
      }
    } finally {
      await servidorHall.detener();
    }
  }, 30000);
});

function quitarLocalizacionDeclaraciones(valor: unknown): unknown {
  if (Array.isArray(valor)) return valor.map(quitarLocalizacionDeclaraciones);
  if (valor !== null && typeof valor === "object") {
    const obj = valor as Record<string, unknown>;
    const esDeclaracion = "origen" in obj && "via" in obj && "referencia" in obj && "regla" in obj;
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([k]) => !(esDeclaracion && k === "localizacion"))
        .map(([k, v]) => [k, quitarLocalizacionDeclaraciones(v)]),
    );
  }
  return valor;
}

describe("T3-07 R-7", () => {
  test("esquema aditivo en valores, permiso, agentes, entradas y hallazgos; rechazo de esquema 1; localizacion calculada sobre resolucion-t3-03.json", async () => {
    const esquemas: Record<string, unknown> = {};
    for (const nombre of ["valores", "permiso", "agentes", "entradas", "hallazgos"]) {
      const ruta = join(import.meta.dir, `../../esquemas/salida/${nombre}.json`);
      expect(existsSync(ruta)).toBe(true);
      esquemas[nombre] = await Bun.file(ruta).json();
    }

    const e = preparar("v2-agentes");
    const deps = e.dependencias();
    const rVal = consultarValores(deps, e.proyecto, "build", undefined);
    const rPerm = consultarPermiso(deps, { proyecto: e.proyecto, agente: "build", sujeto: "read", objetivo: "a", explicar: true });
    const rAg = consultarAgentes(deps, e.proyecto);
    const rEnt = consultarEntradas(deps, e.proyecto);
    const rHallCon = consultarHallazgos(deps, e.proyecto, { explicar: true });
    const rHallSin = consultarHallazgos(deps, e.proyecto, { explicar: false });

    for (const [nombre, res] of [
      ["valores", rVal],
      ["permiso", rPerm],
      ["agentes", rAg],
      ["entradas", rEnt],
      ["hallazgos", rHallCon],
      ["hallazgos", rHallSin],
    ] as const) {
      expect(res.exito).toBe(true);
      if (!res.exito) throw new Error(res.error.mensaje);
      expect(validarEsquema(esquemas[nombre], res.valor)).toEqual([]);
      if (nombre === "valores" || nombre === "permiso" || nombre === "agentes") {
        const sinLoc = quitarLocalizacionDeclaraciones(res.valor);
        expect(validarEsquema(esquemas[nombre], sinLoc)).toEqual([]);
      }
      expect(validarEsquema(esquemas[nombre], { ...res.valor, esquema: 1 }).length).toBeGreaterThan(0);
    }

    if (!rHallSin.exito) throw new Error(rHallSin.error.mensaje);
    for (const h of rHallSin.valor.hallazgos) {
      expect("explicacion" in h).toBe(false);
      expect(typeof h.localizacion).toBe("string");
    }

    const guardada = JSON.parse(readFileSync(join(import.meta.dir, "../datos/resolucion-t3-03.json"), "utf8")) as Resolucion;
    const entornoGuardada = crearEntornoMemoria({
      archivos: {},
      directorios: ["/p", "/h", "/h/.config", "/h/.config/opencode"],
      variables: { HOME: "/h" },
    });
    const depsGuardada = { adaptador: adaptadorOpenCode, entorno: entornoGuardada, rutas: { canonica: () => "/p" }, resolucion: guardada };

    const valGuardada = respuestaValores(guardada, "build", undefined);
    expect(valGuardada.exito).toBe(true);
    if (!valGuardada.exito) throw new Error(valGuardada.error.mensaje);
    const descRastro = valGuardada.valor.valores.find(v => v.clave === "description")!.rastro;
    expect((descRastro.determinante as DeclaracionUbicada).localizacion).toBe("/p/opencode.json:1:20");
    expect((descRastro.desplazadas[0] as DeclaracionUbicada).localizacion).toBeUndefined();

    const guardadaConPermiso: Resolucion = {
      ...guardada,
      valores: [
        ...guardada.valores,
        {
          ruta: ["agent", "build", "permission", "bash", "git status"],
          valor: "allow",
          determinante: {
            origen: { tipo: "declarado", orden: 1, posicion: { linea: 1, columna: 35 } },
            via: "proyecto",
            referencia: "/p/opencode.json",
            valor: "allow",
            regla: "orden-de-aplicacion",
          },
          motivo: "entrada-posterior",
          desplazadas: [],
          indiceFusion: guardada.valores.length,
        },
      ],
    };
    const permGuardada = consultarPermiso({ ...depsGuardada, resolucion: guardadaConPermiso }, { proyecto: "/p", agente: "build", sujeto: "bash", objetivo: "git status", explicar: true });
    expect(permGuardada.exito).toBe(true);
    if (!permGuardada.exito) throw new Error(permGuardada.error.mensaje);
    const declaradasPerm = permGuardada.valor.cadena.filter(r => r.origen.tipo === "declarado");
    expect(declaradasPerm.length).toBeGreaterThan(0);
    for (const r of declaradasPerm) {
      if (r.origen.tipo !== "declarado") continue;
      expect((r.declaracion as DeclaracionUbicada | null)?.localizacion).toBe(`${r.declaracion?.referencia}:${r.origen.posicion.linea}:${r.origen.posicion.columna}`);
    }

    const guardadaConEliminado: Resolucion = {
      ...guardada,
      eliminadas: [{
        ruta: ["agent", "explore"],
        valor: { disable: true },
        determinante: descRastro.determinante,
        motivo: "entrada-posterior",
        desplazadas: [],
        ordenEliminacion: 0,
        eliminacion: {
          origen: { tipo: "declarado", orden: 1, posicion: { linea: 1, columna: 45 } },
          via: "proyecto",
          referencia: "/p/opencode.json",
          valor: true,
          regla: "agente-deshabilitado",
        },
      }],
    };
    const agGuardada = consultarAgentes({ ...depsGuardada, resolucion: guardadaConEliminado }, "/p");
    expect(agGuardada.exito).toBe(true);
    if (!agGuardada.exito) throw new Error(agGuardada.error.mensaje);
    expect(agGuardada.valor.eliminados).toHaveLength(1);
    expect((agGuardada.valor.eliminados[0]!.declaracion as DeclaracionUbicada).localizacion).toBe("/p/opencode.json:1:45");
  });
});

describe("T3-07 R-8", () => {
  test("la explicacion de permisos incluye ruta:linea:columna en el origen declarado", () => {
    const e = preparar("v2-decision");
    const r = consultarPermiso(e.dependencias(), { proyecto: e.proyecto, agente: "build", sujeto: "read", objetivo: ".env", explicar: true });
    expect(r.exito).toBe(true);
    if (!r.exito) throw new Error(r.error.mensaje);
    const det = r.valor.cadena.find(regla => regla.indice === r.valor.determinante)!;
    expect(det.origen.tipo).toBe("declarado");
    if (det.origen.tipo !== "declarado") throw new Error("Se esperaba origen declarado");
    const locEsperada = `${det.declaracion!.referencia}:${det.origen.posicion.linea}:${det.origen.posicion.columna}`;
    expect(r.valor.explicacion?.join(" ")).toContain(`declarada en ${locEsperada}`);
  });
});
