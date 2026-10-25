import { describe, expect, test } from "bun:test";
import { resolver } from "@rige/nucleo/resolucion/resolver";
import { consultarAgente } from "@rige/nucleo/resolucion/proyectar";
import { crearEntornoMemoria } from "../../pruebas/utilidades/entorno-memoria";
import { adaptadorOpenCode } from "./adaptador";

function resolverTextos(...textos: string[]) {
  const resultado = resolver({ ...adaptadorOpenCode,
    ubicar: () => ({ exito: true, valor: textos.map((_, i) => ({ via: i ? "proyecto" : "global", referencia: `/capa-${i}`, condicion: "observada" as const })) }),
  }, "/p", crearEntornoMemoria({ archivos: Object.fromEntries(textos.map((texto, i) => [`/capa-${i}`, texto])) }));
  if (!resultado.exito) throw new Error(resultado.error.mensaje);
  return resultado.valor;
}

describe("T2-04 F-1 F-2", () => {
  test("declara cambios de forma y aplica la fusion profunda con posiciones originales", () => {
    const global = '{"permission":{"bash":"ask","read":"allow"}}';
    const proyecto = '{\n  "permission": {\n    "bash": {"*":"deny","git *":"allow"}\n  }\n}';
    const { valores, noResueltas } = resolverTextos(global, proyecto);
    expect(noResueltas).toEqual([]);
    expect(valores.map(v => [v.ruta, v.valor, v.indiceFusion])).toEqual([
      [["permission", "bash", "*"], "deny", 0], [["permission", "bash", "git *"], "allow", 1], [["permission", "read"], "allow", 2],
    ]);
    expect(valores[0]!.determinante).toMatchObject({ via: "proyecto", referencia: "/capa-1", origen: { posicion: { linea: 3, columna: 14 } } });
    expect(valores[1]!.determinante.origen).toMatchObject({ posicion: { linea: 3, columna: 25 } });
    for (const v of valores.slice(0, 2)) expect(v.desplazadas).toMatchObject([{ valor: "ask", via: "global" }]);
    expect(valores[2]!.determinante).toMatchObject({ via: "global", referencia: "/capa-0", origen: { posicion: { linea: 1, columna: 29 } } });
    const inversa = resolverTextos(proyecto, global);
    expect(inversa.valores.map(v => v.ruta)).toEqual([["permission", "bash"], ["permission", "read"]]);
    expect(inversa.valores[0]!.desplazadas.map(d => d.valor)).toEqual(["deny", "allow"]);
  });
  test("el objeto vacio es hoja valida y no borra un objeto ya fusionado", () => {
    expect(resolverTextos('{"permission":{"bash":{}}}').valores).toMatchObject([{ ruta: ["permission", "bash"], valor: {} }]);
    const global = '{"permission":{"bash":{"*":"deny"}}}';
    expect(resolverTextos(global, '{"permission":{"bash":{}}}').valores).toEqual(resolverTextos(global).valores);
    expect(resolverTextos('{"permission":{"bash":"ask"}}', '{"permission":{"bash":{}}}').valores).toMatchObject([
      { ruta: ["permission", "bash"], valor: {}, desplazadas: [{ valor: "ask" }] },
    ]);
  });
});
describe("T2-04 F-3", () => {
  test("consulta permission.edit del agente con procedencia de proyecto", () => {
    const resuelta = resolverTextos('{}', '{\n  "agent":{"build":{"permission":{"edit":"deny"}}}\n}');
    expect(consultarAgente(resuelta, "build", ["permission", "edit"])).toMatchObject({ exito: true,
      valor: { valores: [{ rastro: { ruta: ["agent", "build", "permission", "edit"], valor: "deny",
        determinante: { via: "proyecto", referencia: "/capa-1", origen: { posicion: { linea: 2, columna: 35 } } } } }] } });
  });
});
describe("T2-04 F-5", () => {
  test("conserva el punto como parte del segmento", () => {
    const resuelta = resolverTextos('{"agent":{"build":{"permission":{"read":{"*.env":"ask"}}}}}');
    expect(consultarAgente(resuelta, "build", ["permission", "read", "*.env"])).toMatchObject({ exito: true,
      valor: { valores: [{ rastro: { ruta: ["agent", "build", "permission", "read", "*.env"], valor: "ask" } }] } });
  });
});
describe("T2-04 F-6", () => {
  test.each([false, true])("tools bloquea solo permission del mismo ambito en todas las capas (invertido=%j)", invertido => {
    const textos = ['{"permission":{"read":"ask"},"agent":{"build":{"permission":{"edit":"deny"}},"otro":{"permission":{"read":"allow"}}},"model":"x"}',
      '{"tools":{},"agent":{"build":{"tools":{"edit":false}}}}'];
    const resuelta = resolverTextos(...(invertido ? textos.toReversed() : textos));
    expect(resuelta.noResueltas).toEqual([
      { ruta: ["tools"], regla: "tools-legado-no-incorporado" }, { ruta: ["permission"], regla: "tools-legado-no-incorporado" },
      { ruta: ["agent", "build", "tools"], regla: "tools-legado-no-incorporado" }, { ruta: ["agent", "build", "permission"], regla: "tools-legado-no-incorporado" },
    ]);
    expect(resuelta.valores.map(v => [v.ruta, v.valor])).toEqual([[["agent", "otro", "permission", "read"], "allow"], [["model"], "x"]]);
    expect(resuelta.reglas["tools-legado-no-incorporado"]).toContain("tools");
  });
});
describe("T2-04 menor 4", () => {
  test("lector JSONC, secuenciador y resolver conservan z antes de a", () => {
    expect(resolverTextos('{"z":1,"a":2}').valores.map(v => [v.ruta, v.valor])).toEqual([[["z"], 1], [["a"], 2]]);
  });
});
