import { describe, expect, test } from "bun:test";
import { consultarCadenas } from "../utilidades/cadenas";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { copiarEscenario } from "../utilidades/escenario";
import { crearEntornoAislado } from "../utilidades/entorno-aislado";
import { consultarAgente } from "../../paquetes/nucleo/resolucion/proyectar";
import type { Resolucion } from "../../paquetes/nucleo/resolucion/tipos";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { resolver } from "../../paquetes/nucleo/resolucion/resolver";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";

function valores(nombre: string) {
  const referencia = JSON.parse(readFileSync(join(import.meta.dir, "../escenarios", nombre, "REFERENCIA.json"), "utf8"));
  const copia = copiarEscenario(nombre, { git: referencia.procedencia.git ?? "raiz" });
  try {
    const hogar = join(copia.raiz, referencia.procedencia.hogar);
    const env = crearEntornoAislado(hogar, process.env);
    env.XDG_CONFIG_HOME = join(hogar, ".config");
    if (referencia.procedencia.OPENCODE_CONFIG) env.OPENCODE_CONFIG = join(copia.raiz, referencia.procedencia.OPENCODE_CONFIG);
    const entorno = new EntornoLecturaSistema({ plataforma: process.platform, entorno: env });
    const proyecto = join(copia.raiz, referencia.procedencia.directorio);
    const contexto = adaptadorOpenCode.contexto(proyecto, entorno);
    if (!contexto.exito) throw new Error(contexto.error.mensaje);
    const resultado = resolver(adaptadorOpenCode, proyecto, entorno, contexto.valor);
    if (!resultado.exito) throw new Error(resultado.error.mensaje);
    const resolucion: Resolucion = resultado.valor;
    return { referencia, resolucion, consultar(agente: string, clave: string) {
      const resultado = consultarAgente(resolucion, agente, [clave]);
      if (!resultado.exito) throw new Error(resultado.error.mensaje);
      return resultado.valor.valores[0]?.rastro;
    } };
  } finally { copia.borrar(); }
}

describe("RF-06 CA-1", () => {
  test("informa mode y description implicitos sin atribuir entradas", () => {
    const escenario = valores("v1-precedencia");
    for (const [agente, clave, valor] of [["build", "mode", "primary"], ["plan", "description", "Plan mode. Disallows all edit tools."]]) {
      expect(escenario.consultar(agente!, clave!)).toMatchObject({ valor, desplazadas: [], determinante: {
        origen: { tipo: "implicito", regla: "valor-implicito-del-agente" }, via: null, referencia: null,
      } });
    }
  });
  test("I-1 RD-04 la descripcion declarada desplaza la implicita", () => {
    const rastro = valores("v1-precedencia").consultar("build", "description");
    expect(rastro?.determinante.origen.tipo).toBe("declarado");
    expect(rastro?.desplazadas).toEqual([expect.objectContaining({
      valor: "The default agent. Executes tools based on configured permissions.",
      origen: { tipo: "implicito", regla: "valor-implicito-del-agente" }, via: null, referencia: null,
    })]);
  });
  test("I-2 coincide con los valores de debug agent de todos los escenarios con cadenas", () => {
    const raiz = join(import.meta.dir, "../escenarios");
    for (const nombre of readdirSync(raiz).filter(nombre => existsSync(join(raiz, nombre, "REFERENCIA.json")))) {
      const escenario = valores(nombre);
      expect(escenario.referencia.valoresAgentes).toBeDefined();
      for (const [agente, claves] of Object.entries(escenario.referencia.valoresAgentes ?? {})) {
        for (const [clave, valor] of Object.entries(claves as object)) {
          // El nombre implicito de agentes declarados queda fuera de T2-13.
          if (clave === "name" && !(claves as { native: boolean }).native) continue;
          expect(escenario.consultar(agente, clave)?.valor).toEqual(valor);
        }
      }
    }
  });
  test("I-3 los prompts nativos se informan exclusivamente por resumen", () => {
    const escenario = valores("v1-precedencia");
    for (const agente of ["explore", "compaction", "title", "summary"]) {
      const rastro = escenario.consultar(agente, "prompt");
      expect(rastro?.valor).toEqual({ tipo: "texto-nativo", sha256: expect.stringMatching(/^[a-f0-9]{64}$/) });
      expect(rastro?.valor).toEqual(escenario.referencia.valoresAgentes?.[agente]?.prompt);
    }
    expect(escenario.consultar("title", "temperature")?.valor).toBe(0.5);
  });
});

describe("A5-4 RF-06 CA-2", () => {
  test("el origen de cada regla coincide con los bloques nativos y declarados del escenario", () => {
    const { cadenas, referencia } = consultarCadenas("v2-cadena");
    // debug agent informa reglas sin su origen. Los limites de los bloques
    // proceden de agent.ts del tag verificado, documentado en vendor/PROCEDENCIA.md.
    const extras: Record<string, number> = { build: 2, plan: 7, general: 1, explore: 11, revisor: 0 };
    const propias: Record<string, number> = { build: 1, plan: 2, general: 0, explore: 0, revisor: 1 };
    for (const [agente, cadena] of Object.entries(cadenas)) {
      expect(cadena.reglas).toHaveLength(referencia.cadenas[agente]!.length);
      const inicio = 12 + extras[agente]!;
      const fin = inicio + 5 + propias[agente]!;
      expect(cadena.reglas.map(r => r.origen.tipo)).toEqual(cadena.reglas.map((_, i) => i >= inicio && i < fin ? "declarado" : "nativo"));
      for (const regla of cadena.reglas) expect(regla.declaracion === null).toBe(regla.origen.tipo === "nativo");
    }
  });
});
