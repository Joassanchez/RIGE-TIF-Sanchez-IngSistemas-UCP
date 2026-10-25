import { describe, expect, test } from "bun:test";
import type { Adaptador, Declaracion, ViaUbicada } from "../contrato/adaptador";
import type { EntornoLectura } from "../contrato/entorno";
import type { DeclaracionUbicada, Resolucion } from "./tipos";
import { crearEntornoMemoria } from "../../../pruebas/utilidades/entorno-memoria";
import { adaptadorFicticio } from "../../../pruebas/utilidades/adaptador-ficticio";

const hoja = (ruta: readonly string[], valor: Declaracion["valor"], linea = 1): Declaracion => ({
  ruta, valor, posicion: { linea, columna: 3 },
});
const ruta = ["agente", "a", "temperatura"];

function escenario(capas: readonly (readonly Declaracion[])[], adicionales: readonly ViaUbicada[] = []) {
  const vias: ViaUbicada[] = capas.map((_, orden) => ({
    via: `capa-${orden}`, referencia: `/proyecto/capa-${orden}.json`, condicion: "observada",
  }));
  const entorno = crearEntornoMemoria({
    archivos: Object.fromEntries(vias.map((via, orden) => [via.referencia, JSON.stringify(capas[orden])])),
    directorios: ["/proyecto"],
  });
  const adaptador: Adaptador = {
    contexto: adaptadorFicticio.contexto,
    prepararConsulta: adaptadorFicticio.prepararConsulta,
    listarAgentes: adaptadorFicticio.listarAgentes,
    permisos: adaptadorFicticio.permisos,
    identidad: { herramienta: "ficticia", version: "1" }, prefijoAgente: ["agente"],
    reglas: { orden: "Prevalece la entrada posterior.", sinUso: "No utilizada." }, estrategias: {},
    cadena: (_, agente) => ({ exito: true, valor: { agente, reglas: [], ejesParciales: [], declaraciones: [], advertencias: [] } }),
    ubicar: () => ({ exito: true, valor: [...vias, ...adicionales] }),
    leer: (_, texto) => ({ exito: true, valor: JSON.parse(texto) as Declaracion[] }),
    secuenciar: (lecturas) => ({ exito: true, valor: {
      aplicaciones: lecturas.flatMap((lectura) => lectura.declaraciones.map((declaracion) => ({
        origen: { tipo: "declarado", orden: lectura.orden, posicion: declaracion.posicion },
        ruta: declaracion.ruta, valor: declaracion.valor, estrategia: "reemplazo", regla: "orden",
      }))), noResueltas: [],
    } }),
  };
  return { adaptador, entorno };
}

async function resolver(adaptador: Adaptador, proyecto: string, entorno: EntornoLectura) {
  return (await import("../../../pruebas/utilidades/resolver")).resolver(adaptador, proyecto, entorno);
}

async function obtener(adaptador: Adaptador, entorno: EntornoLectura): Promise<Resolucion> {
  const resultado = await resolver(adaptador, "/proyecto", entorno);
  if (!resultado.exito) throw new Error(resultado.error.mensaje);
  return resultado.valor;
}

describe("N-1 RD-01", () => {
  test("reemplaza tres declaraciones y conserva toda su procedencia en orden", async () => {
    const { adaptador, entorno } = escenario([0.1, 0.2, 0.3].map((valor, indice) => [hoja(ruta, valor, indice + 2)]));
    const resolucion = await obtener(adaptador, entorno);
    const declaraciones = [0.1, 0.2, 0.3].map<DeclaracionUbicada>((valor, orden) => ({
      origen: { tipo: "declarado", orden, posicion: { linea: orden + 2, columna: 3 } },
      via: `capa-${orden}`, referencia: `/proyecto/capa-${orden}.json`, valor, regla: "orden",
    }));
    expect(resolucion.valores).toEqual([{
      ruta, indiceFusion: 0, valor: 0.3, determinante: declaraciones[2]!, motivo: "entrada-posterior", desplazadas: declaraciones.slice(0, 2),
    }]);
  });
});

describe("N-2", () => {
  test("una declaracion no tiene desplazadas y las hojas son independientes", async () => {
    const otra = ["agente", "a", "pasos"];
    const { adaptador, entorno } = escenario([[hoja(ruta, 0.1), hoja(otra, 12)], [hoja(ruta, 0.2)]]);
    const { valores } = await obtener(adaptador, entorno);
    expect(valores.find((valor) => valor.ruta.at(-1) === "pasos")).toEqual({
      ruta: otra, indiceFusion: 1, valor: 12,
      determinante: { origen: { tipo: "declarado", orden: 0, posicion: { linea: 1, columna: 3 } }, via: "capa-0", referencia: "/proyecto/capa-0.json", valor: 12, regla: "orden" },
      motivo: "entrada-posterior", desplazadas: [],
    });
    expect(valores.find((valor) => valor.ruta.at(-1) === "temperatura")?.valor).toBe(0.2);
  });
});

describe("N-3", () => {
  test("incluye las vias no observadas sin leerlas y las entrega al secuenciador", async () => {
    const remota: ViaUbicada = { via: "remota", referencia: "remota", condicion: "no_observada" };
    const { adaptador, entorno } = escenario([[hoja(ruta, true)]], [remota]);
    const leidas: string[] = [];
    const secuenciar = adaptador.secuenciar;
    const resolucion = await obtener({ ...adaptador, secuenciar(lecturas) {
      expect(lecturas[1]).toEqual({ orden: 1, via: remota, declaraciones: [] });
      return secuenciar(lecturas);
    } }, { ...entorno, leer(referencia) { leidas.push(referencia); return entorno.leer(referencia); } });
    expect(leidas).toEqual(["/proyecto/capa-0.json"]);
    expect(resolucion.entradas[1]).toEqual({ orden: 1, via: "remota", referencia: "remota", condicion: "no_observada", resumen: null });
  });
});

describe("N-4", () => {
  test("resume texto y conjunto con SHA-256 y produce objetos y JSON identicos", async () => {
    const { adaptador, entorno } = escenario([[hoja(ruta, "ñ😀")]]);
    expect(entorno.resumir("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    const primera = await obtener(adaptador, entorno);
    const segunda = await obtener(adaptador, entorno);
    expect(segunda).toEqual(primera);
    expect(JSON.stringify(segunda)).toBe(JSON.stringify(primera));
    expect(primera.entradas[0]?.resumen).toBe(entorno.leer("/proyecto/capa-0.json").resumen);
    expect(primera.resumenEntradas).toBe(entorno.resumir(JSON.stringify(primera.entradas.map((entrada) => [
      entrada.via, entrada.referencia, entrada.condicion, entrada.resumen,
    ]))));
    const modificada = await obtener(adaptador, { ...entorno, leer(referencia) {
      const texto = `${entorno.leer(referencia).texto}\n`;
      return { texto, resumen: entorno.resumir(texto) };
    } });
    expect(modificada.valores).toEqual(primera.valores);
    expect(modificada.entradas[0]?.resumen).not.toBe(primera.entradas[0]?.resumen);
    expect(modificada.resumenEntradas).not.toBe(primera.resumenEntradas);
    expect(Object.keys(primera)).toEqual(["formato", "identidad", "proyecto", "prefijoAgente", "declaraciones", "contexto", "reglas", "entradas", "resumenEntradas", "valores", "eliminadas", "noResueltas"]);
  });

  test("normaliza las rutas mostradas y conserva la letra de unidad", async () => {
    const { adaptador, entorno } = escenario([[hoja(ruta, null)]]);
    const via: ViaUbicada = { via: "capa-a", referencia: "C:\\proyecto\\entrada.json", condicion: "observada" };
    const resultado = await resolver({ ...adaptador, ubicar: () => ({ exito: true, valor: [via] }) }, "C:\\proyecto", {
      ...entorno, leer: () => entorno.leer("/proyecto/capa-0.json"),
    });
    if (!resultado.exito) throw new Error(resultado.error.mensaje);
    expect(resultado.valor.proyecto).toBe("C:/proyecto");
    expect(resultado.valor.entradas[0]?.referencia).toBe("C:/proyecto/entrada.json");
    expect(resultado.valor.valores[0]?.determinante.referencia).toBe("C:/proyecto/entrada.json");
  });
});

describe("N-5", () => {
  test("conserva el orden de fusion, deduplica no resueltas e incluye solo reglas usadas", async () => {
    const claves = ["á", "z", "A", "a"];
    const { adaptador, entorno } = escenario([claves.map((nombre) => hoja(["agente", "a", nombre], nombre))]);
    const secuenciar = adaptador.secuenciar;
    const resolucion = await obtener({ ...adaptador, reglas: { ...adaptador.reglas, excluida: "No resuelta." }, secuenciar(lecturas) {
      const resultado = secuenciar(lecturas);
      if (!resultado.exito) return resultado;
      return { exito: true, valor: { ...resultado.valor, noResueltas: ["á", "z", "A", "z"].map((nombre) => ({ ruta: [nombre], regla: "excluida" })) } };
    } }, entorno);
    expect(resolucion.valores.map((valor) => valor.ruta.at(-1))).toEqual(["á", "z", "A", "a"]);
    expect(resolucion.noResueltas).toEqual(["á", "z", "A"].map((nombre) => ({ ruta: [nombre], regla: "excluida" })));
    expect(resolucion.reglas).toEqual({ excluida: "No resuelta.", orden: "Prevalece la entrada posterior." });
  });
});

describe("N-6", () => {
  test.each(["ubicar", "leer", "secuenciar"] as const)("devuelve el mismo fallo de %s y no avanza", async (etapa) => {
    const { adaptador, entorno } = escenario([[hoja(ruta, 1)]]);
    const fallo = { exito: false as const, error: { categoria: "uso" as const, codigo: "fallo-doble", mensaje: "Fallo del adaptador." } };
    const llamadas: string[] = [];
    const doble: Adaptador = { ...adaptador,
      ubicar(proyecto, entorno, contexto) { llamadas.push("ubicar"); return etapa === "ubicar" ? fallo : adaptador.ubicar(proyecto, entorno, contexto); },
      leer(via, texto) { llamadas.push("leer"); return etapa === "leer" ? fallo : adaptador.leer(via, texto); },
      secuenciar(lecturas) { llamadas.push("secuenciar"); return etapa === "secuenciar" ? fallo : adaptador.secuenciar(lecturas); },
    };
    expect(await resolver(doble, "/proyecto", entorno)).toBe(fallo);
    expect(llamadas).toEqual(["ubicar", "leer", "secuenciar"].slice(0, ["ubicar", "leer", "secuenciar"].indexOf(etapa) + 1));
  });

  test("propaga la excepcion de infraestructura sin convertirla en resultado", async () => {
    const { adaptador, entorno } = escenario([[hoja(ruta, 1)]]);
    const fallo = new Error("Lectura fallida.");
    await expect(resolver(adaptador, "/proyecto", { ...entorno, leer() { throw fallo; } })).rejects.toBe(fallo);
  });
});

describe("N-7", () => {
  test.each(["inexistente", "constructor", "__proto__"])("una estrategia desconocida %s falla de forma visible", async (estrategia) => {
    const { adaptador, entorno } = escenario([[hoja(ruta, 1)]]);
    await expect(resolver({ ...adaptador, secuenciar: () => ({ exito: true, valor: {
      aplicaciones: [{ origen: { tipo: "declarado", orden: 0, posicion: hoja(ruta, 1).posicion }, ruta, valor: 1, estrategia, regla: "orden" }], noResueltas: [],
    } }) }, "/proyecto", entorno)).rejects.toThrow("Estrategia desconocida");
  });

  test.each(["inexistente", "constructor", "__proto__"])("una regla sin plantilla %s falla de forma visible", async (regla) => {
    const { adaptador, entorno } = escenario([[hoja(ruta, 1)]]);
    await expect(resolver({ ...adaptador, secuenciar: () => ({ exito: true, valor: {
      aplicaciones: [{ origen: { tipo: "declarado", orden: 0, posicion: hoja(ruta, 1).posicion }, ruta, valor: 1, estrategia: "reemplazo", regla }], noResueltas: [],
    } }) }, "/proyecto", entorno)).rejects.toThrow("Regla sin plantilla");
  });

  test("una clave no resuelta tambien requiere plantilla", async () => {
    const { adaptador, entorno } = escenario([]);
    await expect(resolver({ ...adaptador, secuenciar: () => ({ exito: true, valor: {
      aplicaciones: [], noResueltas: [{ ruta, regla: "ausente" }],
    } }) }, "/proyecto", entorno)).rejects.toThrow("Regla sin plantilla");
  });
});
