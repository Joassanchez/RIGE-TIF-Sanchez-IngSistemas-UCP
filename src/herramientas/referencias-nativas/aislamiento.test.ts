import { describe, expect, test } from "bun:test";
import { comprobarAislamiento } from "./aislamiento";

describe("T2-05 fuga de aislamiento", () => {
  test("detecta el hogar real en cualquier campo, con ambos separadores y mayusculas en Windows", () => {
    for (const campo of ["permission", "pattern", "action"]) {
      expect(() => comprobarAislamiento({ build: [{ [campo]: "C:\\USERS\\Real\\.claude\\skills\\x\\*" }] }, "C:/Users/Real", "win32")).toThrow("fuga de aislamiento");
    }
    expect(() => comprobarAislamiento({ build: [{ pattern: "/home/real/.agents/skills/x/*" }] }, "/home/real", "linux")).toThrow("fuga de aislamiento");
    expect(() => comprobarAislamiento({ build: [{ pattern: "<data>/tool-output/*" }, { pattern: "<hogar>/x" }, { pattern: "/home/realista/x" }] }, "/home/real", "linux")).not.toThrow();
  });
});
