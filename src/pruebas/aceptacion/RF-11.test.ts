import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { copiarEscenario, type OpcionesEscenario } from "../utilidades/escenario";
import { entornoDeReferencia } from "../utilidades/entorno-referencia";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { consultarHallazgos } from "../../paquetes/rige/aplicacion/casos-uso/consultar-hallazgos";
import type { Manifiesto } from "../../herramientas/cobertura";
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
const manifiesto = JSON.parse(readFileSync(join(raizEscenarios, "MANIFIESTO.json"), "utf8")) as Manifiesto;
function conteosInventariados(nombre: string) {
  return Object.fromEntries(seisTipos.map(tipo => [tipo,
    manifiesto.defectosSembrados.filter(d => d.escenario === nombre && d.tipo === tipo).length])) as Record<TipoHallazgo, number>;
}
// Inventario manual de archivos/variables y elementos, contrastado con REFERENCIA.json:
// entradas: global, externa, proyecto, .opencode, dir-variable, contenido y permiso
// mas cinco Markdown (agents/revisor, modes/m, command/c, command/hola, commands/sub/x);
// siete nativos mas revisor/m de Markdown; comandos c, hola y sub/x (referencia.comandos).
// referencias: proyecto y agents/revisor.md, siete nativos mas revisor Markdown;
// inactivo tiene disable:true y no se cuenta;
// cuatro comandos ok/saludo/vacio/x, conservados en la referencia.
// sustituciones: global + proyecto + contenido; siete nativos mas revisor; ningun command.
// sin-efecto: un archivo de permisos, siete nativos y ningun command.
const elementosEsperados = {
  "v3-entradas": { entradas: 12, agentes: 9, comandos: 3 },
  "v3-referencias": { entradas: 2, agentes: 8, comandos: 4 },
  "v3-sustituciones": { entradas: 3, agentes: 8, comandos: 0 },
  "v3-sin-efecto": { entradas: 1, agentes: 7, comandos: 0 },
} as const;

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
    test(`V-5 ${nombre}: resumen coincide con el inventario independiente de elementos y defectos`, () => {
      const e = preparar(nombre);
      const deps = e.dependencias();

      const rHall = consultarHallazgos(deps, e.proyecto);
      expect(rHall.exito).toBe(true);
      if (!rHall.exito) throw new Error(rHall.error.mensaje);

      expect(rHall.valor.resumen).toBeDefined();
      const resumen = rHall.valor.resumen!;
      expect(resumen.elementos).not.toBeNull();

      expect(resumen.elementos).toEqual(elementosEsperados[nombre]);
      expect(Object.keys(resumen.hallazgos).sort()).toEqual([...seisTipos].sort());
      expect(resumen.hallazgos).toEqual(conteosInventariados(nombre));
    });
  }

  test("V-5 v3-entradas-ilegible: incompleta produce resumen.elementos null y cuenta hallazgos inventariados", () => {
    const e = preparar("v3-entradas-ilegible");
    const deps = e.dependencias();

    const rHall = consultarHallazgos(deps, e.proyecto);
    expect(rHall.exito).toBe(true);
    if (!rHall.exito) throw new Error(rHall.error.mensaje);

    expect(rHall.valor.incompleta).toBe(true);
    expect(rHall.valor.resumen).toBeDefined();
    const resumen = rHall.valor.resumen!;
    expect(resumen.elementos).toBeNull();

    expect(Object.keys(resumen.hallazgos).sort()).toEqual([...seisTipos].sort());
    expect(resumen.hallazgos).toEqual(conteosInventariados("v3-entradas-ilegible"));
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
