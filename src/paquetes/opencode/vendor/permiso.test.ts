// Copyright (c) 2025 opencode. Licencia MIT: ver ./LICENSE.
// Pruebas de la copia; ver ./PROCEDENCIA.md.
import { describe, expect, test } from "bun:test";
import { disabled, evaluate, fromConfig, merge } from "./permiso";
import { match } from "./wildcard";

describe("V-1 evaluate", () => {
  test("ultima coincidencia, conjuntos ordenados y ask nativo", () => {
    const deny = { permission: "read", pattern: "*", action: "deny" } as const;
    const allow = { permission: "read", pattern: "src/a.js", action: "allow" } as const;
    expect(evaluate("read", "src/a.js", "linux", [deny], [allow])).toBe(allow);
    expect(evaluate("read", "src/a.js", "linux", [allow, deny])).toBe(deny);
    expect(evaluate("read", "src/a.js", "linux")).toEqual({ action: "ask", permission: "read", pattern: "*" });
    expect(evaluate("READ", "SRC/A.JS", "win32", [allow])).toBe(allow);
    expect(merge([deny], [allow])).toEqual([deny, allow]);
  });
});
describe("V-2 match", () => {
  test.each([
    ["ls", "ls *", "linux", true], ["ls -la", "ls *", "linux", true],
    [".env", "*.env", "linux", true], ["a/b.env", "*.env", "linux", true],
    ["a\\b.env", "a/*.env", "linux", true], ["a/b.env", "a\\*.env", "linux", true],
    ["SRC/A.JS", "src/a.js", "win32", true], ["SRC/A.JS", "src/a.js", "linux", false],
    ["a.js", "?.js", "linux", true], ["axb", "a.b", "linux", false],
  ] as const)("%s contra %s en %s", (entrada, patron, plataforma, esperado) => {
    expect(match(entrada, patron, plataforma)).toBe(esperado);
  });
});
describe("V-3 fromConfig", () => {
  test("expande hogar y conserva el orden de las reglas", () => {
    expect(fromConfig({ bash: { "*": "ask", "git *": "allow" }, webfetch: "allow" }, "/h")).toEqual([
      { permission: "bash", pattern: "*", action: "ask" },
      { permission: "bash", pattern: "git *", action: "allow" },
      { permission: "webfetch", pattern: "*", action: "allow" },
    ]);
    expect(fromConfig({ read: { "~/x": "deny", "$HOME/x": "deny", "~": "ask", "$HOME": "allow" } }, "/h")
      .map(regla => regla.pattern)).toEqual(["/h/x", "/h/x", "/h", "/h"]);
  });
});
describe("V-4 Object.entries", () => {
  test("JavaScript enumera primero las claves enteras, aun insertadas despues", () => {
    expect(fromConfig({ a: "allow", "10": "deny" }, "/h").map(regla => regla.permission)).toEqual(["10", "a"]);
  });
});
describe("V-5 disabled", () => {
  test("ultima regla, alias edit y propagacion de plataforma", () => {
    const deny = { permission: "bash", pattern: "*", action: "deny" } as const;
    expect(disabled(["bash", "write"], [deny], "linux")).toEqual(new Set(["bash"]));
    expect(disabled(["bash"], [deny, { permission: "bash", pattern: "git *", action: "allow" }], "linux")).toEqual(new Set());
    expect(disabled(["write"], [{ permission: "edit", pattern: "*", action: "deny" }], "linux")).toEqual(new Set(["write"]));
    expect(disabled(["BASH"], [deny], "win32")).toEqual(new Set(["BASH"]));
  });
});
