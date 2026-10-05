import { describe, expect, test } from "bun:test";
import type { Declaracion, LecturaEntrada, ValorJson } from "@rige/nucleo/contrato/adaptador";
import { secuenciar } from "./secuenciador";
import { reglas } from "./reglas";

describe("V1-03 S-4", () => {
  test("publica exactamente las tres plantillas del diseno", () => {
    expect(reglas).toEqual({
      "orden-de-aplicacion": "OpenCode 1.18.25 aplica las entradas en orden de precedencia; prevalece la declaración de la última entrada que declara la clave (RD-01).",
      "fuera-del-v1": "Clave que OpenCode combina o deriva con reglas que el prototipo v1 no incorpora; se resuelve en una iteración posterior.",
      "markdown-no-observado": "Agente declarado también en Markdown, que el prototipo v1 no incorpora; sus claves no se informan para no presentar un valor incompleto.",
    });
  });
});

function declaracion(ruta: readonly string[], valor: ValorJson = 1): Declaracion {
  return { ruta, valor, posicion: { linea: 6, columna: 7 } };
}

function lectura(orden: number, declaraciones: readonly Declaracion[]): LecturaEntrada {
  return { orden, via: { via: "proyecto", referencia: "C:\\p\\opencode.jsonc", condicion: "observada" }, declaraciones };
}

describe("V1-03 S-5", () => {
  test.each([
    "/h/.config/opencode/agent/revisor/seguridad.md",
    "/h/.config/opencode/agents/revisor/seguridad.md",
    "/h/.config/opencode/mode/revisor/seguridad.md",
    "/h/.config/opencode/modes/revisor/seguridad.md",
    "/h/agents/otro/mode/revisor/seguridad.md",
    "/h/agent/agents/revisor/seguridad.md",
    "C:\\h\\modes\\otro\\agents\\revisor\\seguridad.md",
  ])("bloquea solo el agente del ultimo segmento de %s aun con Markdown posterior", (referencia) => {
    const bloqueadas = [declaracion(["agent", "revisor/seguridad", "temperature"], 0.3),
      declaracion(["agent", "revisor/seguridad", "options", "steps"], 12)];
    const otras = [declaracion(["agent", "build", "steps"], 12),
      declaracion(["agent", "revisor/seguridad-extra", "temperature"], 0.1)];
    const markdown: LecturaEntrada = { orden: 1, via: { via: "markdown", referencia, condicion: "no_observada" }, declaraciones: [] };
    const json = lectura(0, [...bloqueadas, ...otras]);
    const jsonPosterior = lectura(2, bloqueadas);
    const esperado = { exito: true as const, valor: {
      aplicaciones: otras.map((declaracion) => ({ orden: 0, declaracion, estrategia: "reemplazo", regla: "orden-de-aplicacion" })),
      noResueltas: [{ ruta: ["agent", "revisor/seguridad"], regla: "markdown-no-observado" }],
    } };
    expect(secuenciar([json, markdown, jsonPosterior, { ...markdown, orden: 3 }])).toEqual(esperado);
    expect(secuenciar([markdown, json, jsonPosterior])).toEqual(esperado);
  });
  test("marca tambien los agentes que solo aparecen en Markdown", () => {
    expect(secuenciar([{ orden: 0, via: { via: "markdown", referencia: "/h/agents/revisor.md", condicion: "no_observada" }, declaraciones: [] }])).toEqual({
      exito: true, valor: { aplicaciones: [], noResueltas: [{ ruta: ["agent", "revisor"], regla: "markdown-no-observado" }] },
    });
  });
});

describe("V1-03 S-3", () => {
  test.each([
    ["mode"], ["mode", "build", "temperature"],
    ["agent", "build", "disable"], ["agent", "build", "disable", "x"],
  ].map((ruta) => [ruta] as const))("rechaza el prefijo %j con referencia y posicion de la declaracion", (ruta) => {
    expect(secuenciar([lectura(0, [declaracion(["steps"]), declaracion(ruta)])])).toEqual({
      exito: false, error: {
        codigo: "contenido-no-soportado",
        mensaje: `El prototipo v1 no incorpora ${ruta[0] === "mode" ? "mode" : "agent.build.disable"} (C:/p/opencode.jsonc:6:7).`,
      },
    });
  });
  test("no confunde segmentos parecidos ni disable fuera del prefijo", () => {
    const declaraciones = [["modes"], ["agent", "build", "disabled"], ["agent", "build", "options", "disable"]].map((ruta) => declaracion(ruta));
    const resultado = secuenciar([lectura(0, declaraciones)]);
    expect(resultado.exito).toBe(true);
    if (!resultado.exito) throw new Error("Las rutas son soportadas");
    expect(resultado.valor.aplicaciones.map(({ declaracion }) => declaracion)).toEqual(declaraciones);
  });
});

describe("V1-03 S-2", () => {
  test("excluye prefijos globales y de agentes sin repetirlos entre hojas o entradas", () => {
    const prefijos = [["permission"], ["tools"], ["instructions"], ["plugin"],
      ["agent", "build", "permission"], ["agent", "build", "tools"], ["agent", "review", "tools"]];
    const excluidas = prefijos.flatMap((ruta) => [declaracion(ruta), declaracion([...ruta, "bash"])]);
    const normal = declaracion(["agent", "build", "temperature"], 0.3);
    const nombresSimilares = [declaracion(["permissions"]), declaracion(["agent", "build", "toolset"]),
      declaracion(["agent", "build", "options", "tools"])];
    expect(secuenciar([lectura(0, [...excluidas, normal, ...nombresSimilares]), lectura(1, excluidas)])).toEqual({
      exito: true, valor: {
        aplicaciones: [normal, ...nombresSimilares].map((declaracion) => ({ orden: 0, declaracion, estrategia: "reemplazo", regla: "orden-de-aplicacion" })),
        noResueltas: prefijos.map((ruta) => ({ ruta, regla: "fuera-del-v1" })),
      },
    });
  });
});

describe("V1-03 S-1", () => {
  test("conserva el orden de entradas y declaraciones, y el indice de origen", () => {
    const primeras = [declaracion(["agent", "build", "temperature"], 0.3), declaracion(["agent", "build", "steps"], 12)] as const;
    const ultima = declaracion(["agent", "build", "temperature"], 0.7);
    expect(secuenciar([lectura(8, primeras), lectura(2, [ultima])])).toEqual({ exito: true, valor: {
      aplicaciones: [
        { orden: 8, declaracion: primeras[0], estrategia: "reemplazo", regla: "orden-de-aplicacion" },
        { orden: 8, declaracion: primeras[1], estrategia: "reemplazo", regla: "orden-de-aplicacion" },
        { orden: 2, declaracion: ultima, estrategia: "reemplazo", regla: "orden-de-aplicacion" },
      ], noResueltas: [],
    } });
    expect(secuenciar([])).toEqual({ exito: true, valor: { aplicaciones: [], noResueltas: [] } });
  });
});
