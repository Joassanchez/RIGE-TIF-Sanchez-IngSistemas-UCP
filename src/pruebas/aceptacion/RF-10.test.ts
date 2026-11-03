import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { copiarEscenario, type OpcionesEscenario } from "../utilidades/escenario";
import { entornoDeReferencia } from "../utilidades/entorno-referencia";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { consultarPermiso } from "../../paquetes/rige/aplicacion/casos-uso/consultar-permiso";
import { lanzar, lanzarServidor } from "../utilidades/subproceso";
import { solicitarLocal } from "../utilidades/cliente-http-local";

const raizEscenarios = join(import.meta.dir, "../escenarios");
const temporales: ReturnType<typeof copiarEscenario>[] = [];
afterEach(() => { for (const t of temporales.splice(0)) t.borrar(); });

function preparar(nombre: string, opciones: OpcionesEscenario = {}) {
  const rutaRef = join(raizEscenarios, nombre, "REFERENCIA.json");
  const referencia = JSON.parse(readFileSync(rutaRef, "utf8"));
  const copia = copiarEscenario(nombre, { git: referencia.procedencia?.git ?? "raiz", ...opciones });
  temporales.push(copia);
  const env = entornoDeReferencia(referencia, copia);
  const proyecto = join(copia.raiz, referencia.procedencia?.directorio ?? "proyecto");
  return {
    ...copia,
    referencia,
    proyecto,
    env,
    dependencias: () => ({
      adaptador: adaptadorOpenCode,
      entorno: new EntornoLecturaSistema({ plataforma: process.platform, entorno: env }),
      rutas: { canonica: (ruta: string) => (ruta === proyecto ? ruta : null) },
    }),
  };
}

function datosWeb(cuerpo: string) {
  const bloque = /<script type="application\/json" id="respuesta">([^]*?)<\/script>/.exec(cuerpo);
  expect(bloque).not.toBeNull();
  return JSON.parse(bloque![1]!);
}

describe("T3-10 R-1 RF-10 CA-1 CA-2", () => {
  test("agente a (edit deny *) retira edit; agente b (edit deny * + allow src/*) ofrece edit; agente c (bash deny *) retira bash", () => {
    const e = preparar("v3-herramientas");
    const deps = e.dependencias();

    // Agente a: edit deny * -> edit retirada
    const resA = consultarPermiso(deps, {
      proyecto: e.proyecto,
      agente: "a",
      herramienta: "edit",
      objetivo: "src/a.js",
    });
    expect(resA.exito).toBe(true);
    if (!resA.exito) throw new Error(resA.error.mensaje);
    expect(resA.valor.herramienta).toEqual({ nombre: "edit", ofrecida: false });

    // Consulta con sujeto edit en vez de herramienta edit para agente a
    const resASujeto = consultarPermiso(deps, {
      proyecto: e.proyecto,
      agente: "a",
      sujeto: "edit",
      objetivo: "src/a.js",
    });
    expect(resASujeto.exito).toBe(true);
    if (!resASujeto.exito) throw new Error(resASujeto.error.mensaje);
    expect(resASujeto.valor.herramienta).toEqual({ nombre: "edit", ofrecida: false });

    // Agente b: edit deny * + src/* allow -> ofrecida
    const resB = consultarPermiso(deps, {
      proyecto: e.proyecto,
      agente: "b",
      herramienta: "edit",
      objetivo: "src/a.js",
    });
    expect(resB.exito).toBe(true);
    if (!resB.exito) throw new Error(resB.error.mensaje);
    expect(resB.valor.herramienta).toEqual({ nombre: "edit", ofrecida: true });

    const resBSujeto = consultarPermiso(deps, {
      proyecto: e.proyecto,
      agente: "b",
      sujeto: "edit",
      objetivo: "src/a.js",
    });
    expect(resBSujeto.exito).toBe(true);
    if (!resBSujeto.exito) throw new Error(resBSujeto.error.mensaje);
    expect(resBSujeto.valor.herramienta).toEqual({ nombre: "edit", ofrecida: true });

    // Agente c: bash deny * -> bash retirada
    const resC = consultarPermiso(deps, {
      proyecto: e.proyecto,
      agente: "c",
      herramienta: "bash",
      objetivo: "echo",
    });
    expect(resC.exito).toBe(true);
    if (!resC.exito) throw new Error(resC.error.mensaje);
    expect(resC.valor.herramienta).toEqual({ nombre: "bash", ofrecida: false });

    const resCSujeto = consultarPermiso(deps, {
      proyecto: e.proyecto,
      agente: "c",
      sujeto: "bash",
      objetivo: "echo",
    });
    expect(resCSujeto.exito).toBe(true);
    if (!resCSujeto.exito) throw new Error(resCSujeto.error.mensaje);
    expect(resCSujeto.valor.herramienta).toEqual({ nombre: "bash", ofrecida: false });

    // Sujeto no perteneciente a las 11 herramientas de accion -> herramienta undefined
    const resOtro = consultarPermiso(deps, {
      proyecto: e.proyecto,
      agente: "a",
      sujeto: "otra_cosa",
      objetivo: "src/a.js",
    });
    expect(resOtro.exito).toBe(true);
    if (!resOtro.exito) throw new Error(resOtro.error.mensaje);
    expect(resOtro.valor.herramienta).toBeUndefined();
  });

  test("paridad CLI y web para herramienta ofrecida/retirada", async () => {
    const e = preparar("v3-herramientas");

    // CLI con --herramienta edit
    const cliA = lanzar(
      e.raiz,
      ["permiso", "--proyecto", e.proyecto, "--agente", "a", "--herramienta", "edit", "--objetivo", "src/a.js"],
      e.env,
    );
    expect(cliA.codigo).toBe(0);
    const rCliA = JSON.parse(cliA.salida);
    expect(rCliA.herramienta).toEqual({ nombre: "edit", ofrecida: false });

    // Servidor Web
    const servidor = await lanzarServidor(e.raiz, e.env);
    try {
      const alta = await solicitarLocal({
        host: "127.0.0.1",
        puerto: servidor.puerto,
        ruta: `/resolver?proyecto=${encodeURIComponent(e.proyecto)}&agente=a`,
      });
      expect(alta.estado).toBe(303);
      const id = /\/resoluciones\/(\d+)/.exec(String(alta.cabeceras.location))![1]!;

      const pagPermiso = await solicitarLocal({
        host: "127.0.0.1",
        puerto: servidor.puerto,
        ruta: `/permiso?id=${id}&agente=a&herramienta=edit&objetivo=src%2Fa.js`,
      });
      expect(pagPermiso.estado).toBe(200);
      const rWebPermiso = datosWeb(pagPermiso.cuerpo);
      expect(rWebPermiso.herramienta).toEqual({ nombre: "edit", ofrecida: false });
    } finally {
      await servidor.detener();
    }
  }, 30000);
});

describe("T3-10 R-2 RF-10 CA-3", () => {
  test("ofrecida de RIGE coincide con referencia.herramientas[agente][h] === true para cada agente y herramienta", () => {
    const e = preparar("v3-herramientas");
    const deps = e.dependencias();
    const referencia = e.referencia;

    expect(referencia.herramientas).toBeDefined();

    for (const agente of ["a", "b", "c"]) {
      const herramientasAgente = referencia.herramientas[agente];
      expect(herramientasAgente).toBeDefined();

      for (const [herramienta, ofrecidaEsperada] of Object.entries(herramientasAgente as Record<string, boolean>)) {
        const r = consultarPermiso(deps, {
          proyecto: e.proyecto,
          agente,
          herramienta,
          objetivo: "src/a.js",
        });
        expect(r.exito).toBe(true);
        if (!r.exito) throw new Error(r.error.mensaje);
        expect(r.valor.herramienta).toBeDefined();
        expect(r.valor.herramienta?.nombre).toBe(herramienta);
        expect(r.valor.herramienta?.ofrecida).toBe(ofrecidaEsperada === true);
      }
    }
  });
});
