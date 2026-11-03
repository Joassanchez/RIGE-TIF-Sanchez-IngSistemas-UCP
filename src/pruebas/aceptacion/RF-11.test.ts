import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { copiarEscenario, type OpcionesEscenario } from "../utilidades/escenario";
import { entornoDeReferencia } from "../utilidades/entorno-referencia";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { consultarHallazgos } from "../../paquetes/rige/aplicacion/casos-uso/consultar-hallazgos";
import { consultarAgentes } from "../../paquetes/rige/aplicacion/casos-uso/consultar-agentes";
import type { TipoHallazgo } from "../../paquetes/nucleo/hallazgos/tipos";
import { lanzar, lanzarServidor } from "../utilidades/subproceso";
import { solicitarLocal } from "../utilidades/cliente-http-local";

const raizEscenarios = join(import.meta.dir, "../escenarios");
const temporales: ReturnType<typeof copiarEscenario>[] = [];
afterEach(() => { for (const t of temporales.splice(0)) t.borrar(); });

const seisTipos: readonly TipoHallazgo[] = [
  "entrada-ilegible",
  "entrada-descartada",
  "sustitucion-sin-valor",
  "referencia-no-resuelta",
  "regla-sin-efecto",
  "elemento-sin-uso",
];

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

describe("T3-10 R-3 RF-11 CA-1", () => {
  const escenariosCompletos = ["v3-entradas", "v3-referencias", "v3-sustituciones", "v3-sin-efecto"] as const;

  for (const nombre of escenariosCompletos) {
    test(`${nombre}: resumen.elementos coincide con entradas, agentes y comandos de referencia; resumen.hallazgos coincide por tipo`, () => {
      const e = preparar(nombre);
      const deps = e.dependencias();

      const rHall = consultarHallazgos(deps, e.proyecto);
      expect(rHall.exito).toBe(true);
      if (!rHall.exito) throw new Error(rHall.error.mensaje);

      expect(rHall.valor.resumen).toBeDefined();
      const resumen = rHall.valor.resumen!;
      expect(resumen.elementos).not.toBeNull();

      // Entradas: cantidad observadas o definidas
      const entradasValidas = rHall.valor.entradas.filter(
        ent => ent.condicion === "observada" || ent.condicion === "definida",
      );
      expect(resumen.elementos!.entradas).toBe(entradasValidas.length);

      // Agentes: cantidad de activos o no observados de listarAgentes
      const rAg = consultarAgentes(deps, e.proyecto);
      expect(rAg.exito).toBe(true);
      if (!rAg.exito) throw new Error(rAg.error.mensaje);
      const agentesActivos = rAg.valor.agentes.length;
      expect(resumen.elementos!.agentes).toBe(agentesActivos);

      // Comandos: cantidad que coincide con referencia.comandos?.length ?? 0
      const comandosEsperados = (e.referencia.comandos as string[] | undefined)?.length ?? 0;
      expect(resumen.elementos!.comandos).toBe(comandosEsperados);

      // Hallazgos: las seis claves presentes con el conteo correspondiente
      for (const tipo of seisTipos) {
        expect(resumen.hallazgos[tipo]).toBeDefined();
        const conteoEsperado = rHall.valor.hallazgos.filter(h => h.tipo === tipo).length;
        expect(resumen.hallazgos[tipo]).toBe(conteoEsperado);
      }
    });
  }

  test("v3-entradas-ilegible: incompleta produce resumen.elementos null y cuenta hallazgos por tipo", () => {
    const e = preparar("v3-entradas-ilegible");
    const deps = e.dependencias();

    const rHall = consultarHallazgos(deps, e.proyecto);
    expect(rHall.exito).toBe(true);
    if (!rHall.exito) throw new Error(rHall.error.mensaje);

    expect(rHall.valor.incompleta).toBe(true);
    expect(rHall.valor.resumen).toBeDefined();
    const resumen = rHall.valor.resumen!;
    expect(resumen.elementos).toBeNull();

    for (const tipo of seisTipos) {
      expect(resumen.hallazgos[tipo]).toBeDefined();
      const conteoEsperado = rHall.valor.hallazgos.filter(h => h.tipo === tipo).length;
      expect(resumen.hallazgos[tipo]).toBe(conteoEsperado);
    }
    expect(resumen.hallazgos["entrada-ilegible"]).toBe(1);
  });

  test("paridad CLI y web para resumen en hallazgos", async () => {
    const e = preparar("v3-sin-efecto");

    const cli = lanzar(e.raiz, ["hallazgos", "--proyecto", e.proyecto], e.env);
    expect(cli.codigo).toBe(0);
    const rCli = JSON.parse(cli.salida);
    expect(rCli.resumen).toBeDefined();
    expect(rCli.resumen.elementos).toBeDefined();
    expect(rCli.resumen.hallazgos).toBeDefined();

    const servidor = await lanzarServidor(e.raiz, e.env);
    try {
      const pag = await solicitarLocal({
        host: "127.0.0.1",
        puerto: servidor.puerto,
        ruta: `/hallazgos?proyecto=${encodeURIComponent(e.proyecto)}`,
      });
      expect(pag.estado).toBe(200);
      const rWeb = datosWeb(pag.cuerpo);
      expect(rWeb.resumen).toEqual(rCli.resumen);
    } finally {
      await servidor.detener();
    }
  }, 30000);
});
