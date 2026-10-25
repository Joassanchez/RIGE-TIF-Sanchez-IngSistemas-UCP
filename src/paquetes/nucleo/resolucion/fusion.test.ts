import { describe, expect, test } from "bun:test";
import type { Adaptador, Aplicacion } from "../contrato/adaptador";
import { resolver } from "../../../pruebas/utilidades/resolver";
import { crearEntornoMemoria } from "../../../pruebas/utilidades/entorno-memoria";
import { adaptadorFicticio } from "../../../pruebas/utilidades/adaptador-ficticio";

const aplicar = (ruta: readonly string[], valor: Aplicacion["valor"], estrategia = "reemplazo"): Aplicacion => ({
  ruta, valor, estrategia, origen: { tipo: "declarado", orden: 0, posicion: { linea: 2, columna: 5 } }, regla: "orden",
});
function fusion(aplicaciones: readonly Aplicacion[]) {
  const adaptador: Adaptador = { ...adaptadorFicticio, reglas: { orden: "Ultima entrada." },
    ubicar: () => ({ exito: true, valor: [{ via: "capa", referencia: "/capa", condicion: "observada" }] }),
    leer: () => ({ exito: true, valor: [] }),
    secuenciar: () => ({ exito: true, valor: { aplicaciones, noResueltas: [] } }),
  };
  const resultado = resolver(adaptador, "/p", crearEntornoMemoria({ archivos: { "/capa": "{}" } }));
  if (!resultado.exito) throw new Error(resultado.error.mensaje);
  return resultado.valor;
}

describe("T2-04 F-1 RD-02", () => {
  test("hoja a subarbol conserva su lugar y desplaza la hoja en cada nuevo rastro", () => {
    const { valores } = fusion([aplicar(["permisos", "consola"], "ask"), aplicar(["permisos", "lectura"], "allow"),
      aplicar(["permisos", "consola", "*"], "deny", "reemplazoSubarbol"), aplicar(["permisos", "consola", "git *"], "allow")]);
    expect(valores.map(v => [v.ruta, v.valor, v.indiceFusion])).toEqual([
      [["permisos", "consola", "*"], "deny", 0], [["permisos", "consola", "git *"], "allow", 1], [["permisos", "lectura"], "allow", 2],
    ]);
    for (const rastro of valores.slice(0, 2)) expect(rastro.desplazadas.map(d => d.valor)).toEqual(["ask"]);
  });
});
describe("T2-04 F-2", () => {
  test("subarbol a hoja conserva procedencias e historia sin duplicar ante otra expansion", () => {
    const aplicaciones = [aplicar(["p", "consola", "*"], "deny"), aplicar(["p", "lectura"], "allow"),
      aplicar(["p", "consola", "git *"], "allow"), aplicar(["p", "consola"], "ask", "reemplazoSubarbol")];
    const { valores } = fusion(aplicaciones);
    expect(valores.map(v => [v.ruta, v.valor, v.indiceFusion])).toEqual([[["p", "consola"], "ask", 0], [["p", "lectura"], "allow", 1]]);
    expect(valores[0]!.desplazadas.map(d => d.valor)).toEqual(["deny", "allow"]);
    expect(fusion([...aplicaciones, aplicar(["p", "consola", "nuevo"], "deny", "reemplazoSubarbol")]).valores[0]!.desplazadas.map(d => d.valor))
      .toEqual(["deny", "allow", "ask"]);
  });
});
describe("T2-04 F-4", () => {
  test("enumera indices enteros como Object.entries en cada nivel y agrupa el preorden", () => {
    const claves = ["10", "a", "2", "01", "4294967295", "4294967294"];
    const { valores } = fusion([...claves.map(c => aplicar(["p", c], c)), aplicar(["otro"], 1), aplicar(["p", "z"], 2)]);
    expect(valores.map(v => v.ruta.at(-1))).toEqual(["2", "10", "4294967294", "a", "01", "4294967295", "z", "otro"]);
    expect(valores.map(v => v.indiceFusion)).toEqual(valores.map((_, i) => i));
  });
});
describe("T2-04 F-7", () => {
  test("eliminar la ultima hoja conserva la posicion de los antecesores", () => {
    const { valores } = fusion([aplicar(["grupo", "x"], 1), aplicar(["otro"], 2),
      aplicar(["grupo", "x"], null, "eliminacion"), aplicar(["grupo", "y"], 3)]);
    expect(valores.map(v => v.ruta)).toEqual([["grupo", "y"], ["otro"]]);
  });
  test("el ficticio elimina un subarbol, registra causa y procedencia y lo recrea al final", () => {
    const entorno = crearEntornoMemoria({ archivos: {
      "/p/capa-b.json": '{"grupo":{"x":1,"y":2},"otro":3}',
      "/p/capa-a.json": '{"retirar":"grupo","grupo":{"z":4}}',
    } });
    const resultado = resolver(adaptadorFicticio, "/p", entorno);
    if (!resultado.exito) throw new Error(resultado.error.mensaje);
    expect(resultado.valor.valores.filter(v => v.ruta[0] === "perfiles").map(v => v.ruta.slice(2))).toEqual([["otro"], ["grupo", "z"]]);
    expect(resultado.valor.eliminadas).toMatchObject([
      { ruta: ["perfiles", "a", "grupo", "x"], valor: 1, determinante: { via: "capa-b" } },
      { ruta: ["perfiles", "a", "grupo", "y"], valor: 2, determinante: { via: "capa-b" } },
    ]);
    expect(resultado.valor.eliminadas?.every(r => r.eliminacion.regla === "retirada-ficticia")).toBe(true);
  });
});
describe("A4-6", () => {
  test("copia el origen y la posicion de la aplicacion", () => {
    const origen = { tipo: "declarado" as const, orden: 0, posicion: { linea: 2, columna: 5 } };
    const valor = { lista: [1, 2] };
    const resolucion = fusion([{ ...aplicar(["a"], valor), origen }]);
    origen.orden = 9;
    origen.posicion.linea = 99;
    valor.lista.push(3);
    expect(resolucion.valores[0]!.valor).toEqual({ lista: [1, 2] });
    expect(resolucion.valores[0]!.determinante.origen).toEqual({ tipo: "declarado", orden: 0, posicion: { linea: 2, columna: 5 } });
  });
});

describe("A4-4", () => {
  test("eliminar y recrear no hereda la historia de una hoja retirada", () => {
    const resultado = fusion([aplicar(["grupo"], "antes"), aplicar(["grupo", "x"], 1),
      aplicar(["grupo", "x"], null, "eliminacion"), aplicar(["grupo", "nuevo"], 2)]);
    expect(resultado.valores[0]!.desplazadas).toEqual([]);
  });
});

describe("A4-1", () => {
  test("expandir un objeto vacio lo fusiona sin desplazarlo", () => {
    const resultado = fusion([aplicar(["bash"], {}), aplicar(["bash", "ls"], "allow")]);
    expect(resultado.valores[0]!.desplazadas).toEqual([]);
  });
});

describe("A4-5", () => {
  test("las eliminadas tienen orden de eliminacion y no posicion de fusion", () => {
    const resultado = fusion([aplicar(["x"], 1), aplicar(["x"], null, "eliminacion")]);
    expect(resultado.eliminadas).toMatchObject([{ ordenEliminacion: 0 }]);
    expect(resultado.eliminadas![0]).not.toHaveProperty("indiceFusion");
  });
});

describe("K-9", () => { test("eliminadas siempre esta presente aunque no haya eliminaciones", () => {
  expect(fusion([]).eliminadas).toEqual([]);
}); });
