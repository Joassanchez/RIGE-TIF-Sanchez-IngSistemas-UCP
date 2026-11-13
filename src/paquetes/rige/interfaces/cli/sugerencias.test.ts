import { describe, expect, test } from "bun:test";
import { levenshtein, sugerir } from "./sugerencias";

describe("T5-33 Levenshtein", () => {
  test("cadenas identicas tienen distancia 0", () => {
    expect(levenshtein("", "")).toBe(0);
    expect(levenshtein("valores", "valores")).toBe(0);
  });

  test("cadenas vacias contra no vacias", () => {
    expect(levenshtein("", "abc")).toBe(3);
    expect(levenshtein("abc", "")).toBe(3);
  });

  test("insercion, eliminacion y sustitucion", () => {
    expect(levenshtein("clav", "clave")).toBe(1);
    expect(levenshtein("claves", "clave")).toBe(1);
    expect(levenshtein("clabe", "clave")).toBe(1);
    expect(levenshtein("valroes", "valores")).toBe(2);
  });
});

describe("T5-33 sugerir", () => {
  const subcomandos = [
    "valores", "permiso", "reglas", "agentes", "entradas",
    "hallazgos", "recientes", "comparar", "estado", "esquema", "servir",
  ];

  test("nunca devuelve la propia entrada", () => {
    expect(sugerir("valores", subcomandos)).toBeUndefined();
    expect(sugerir("clave", ["clave", "agente"])).toBeUndefined();
  });

  test("distancia <= 2 sugiere el candidato mas cercano", () => {
    expect(sugerir("valroes", subcomandos)).toBe("valores");
    expect(sugerir("permio", subcomandos)).toBe("permiso");
    expect(sugerir("esquma", subcomandos)).toBe("esquema");
  });

  test("distancia > 2 sin prefijo devuelve undefined", () => {
    expect(sugerir("xyz", subcomandos)).toBeUndefined();
    expect(sugerir("valrrroes", subcomandos)).toBeUndefined();
  });

  test("prefijo de al menos 3 caracteres sugiere el candidato aunque distancia > 2", () => {
    expect(sugerir("val", subcomandos)).toBe("valores");
    expect(sugerir("entr", subcomandos)).toBe("entradas");
    expect(sugerir("clav", ["proyecto", "agente", "clave"])).toBe("clave");
  });

  test("prefijo de menos de 3 caracteres no califica si distancia > 2", () => {
    expect(sugerir("va", subcomandos)).toBeUndefined();
    expect(sugerir("en", subcomandos)).toBeUndefined();
  });

  test("ante empate en cercania elige el primero en el orden de candidatos", () => {
    expect(sugerir("abe", ["abd", "abf"])).toBe("abd");
    expect(sugerir("abe", ["abf", "abd"])).toBe("abf");
  });

  test("lista de candidatos vacia devuelve undefined", () => {
    expect(sugerir("valores", [])).toBeUndefined();
  });
});
