import { describe, expect, test } from "bun:test";
import { comprobarAislamiento, esFalloGitfile } from "./aislamiento";
import { resolve } from "node:path";

describe("T2-18 L-1 fallo del gitfile aislado", () => {
  test("admite los diagnosticos de Windows y Linux solo con salida fallida", () => {
    const directorio = resolve("proyecto");
    const gitfile = "gitdir: ../inexistente\n";
    const mensajes = [
      "fatal: gitfile does not point to a valid repository: .git\n",
      `fatal: not a git repository: ${directorio}/../inexistente\n`,
      "fatal: not a git repository: ../inexistente\n",
    ];
    for (const mensaje of mensajes) {
      expect(esFalloGitfile(128, mensaje, gitfile, directorio)).toBe(true);
      expect(esFalloGitfile(0, mensaje, gitfile, directorio)).toBe(false);
    }
  });

  test("rechaza causas ajenas, rutas distintas y coincidencias parciales", () => {
    const directorio = resolve("proyecto");
    for (const mensaje of [
      "fatal: permission denied\n",
      "fatal: not a git repository (or any of the parent directories): .git\n",
      `fatal: not a git repository: ${resolve(directorio, "../otro")}\n`,
      `fatal: not a git repository: ${resolve(directorio, "../inexistente-otro")}\n`,
      "fatal: not a git repository: \n",
    ]) {
      expect(esFalloGitfile(128, mensaje, "gitdir: ../inexistente\n", directorio)).toBe(false);
    }
  });
});

describe("T2-05 fuga de aislamiento", () => {
  test("detecta el hogar real en cualquier campo, con ambos separadores y mayusculas en Windows", () => {
    for (const campo of ["permission", "pattern", "action"]) {
      expect(() => comprobarAislamiento({ build: [{ [campo]: "C:\\USERS\\Real\\.claude\\skills\\x\\*" }] }, "C:/Users/Real", "win32")).toThrow("fuga de aislamiento");
    }
    expect(() => comprobarAislamiento({ build: [{ pattern: "/home/real/.agents/skills/x/*" }] }, "/home/real", "linux")).toThrow("fuga de aislamiento");
    expect(() => comprobarAislamiento({ build: [{ pattern: "<data>/tool-output/*" }, { pattern: "<hogar>/x" }, { pattern: "/home/realista/x" }] }, "/home/real", "linux")).not.toThrow();
  });
});
