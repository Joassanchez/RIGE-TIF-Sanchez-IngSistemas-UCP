import { describe, expect, test } from "bun:test";
import { crearEntornoOpenCode } from "./entorno-opencode";
import { contextoOpenCode } from "../../paquetes/opencode/contexto";

describe("T3-01-c1 P-6 entorno soportado por defecto", () => {
  test("incluye 1.18.25, conserva entradas y git del PATH, y admite las rutas de cada prueba", () => {
    for (const caso of [{ plataforma: "linux", proyecto: "/p", bin: "/bin" },
      { plataforma: "win32", proyecto: "C:/p", bin: "/bin" },
      { plataforma: "win32", rutas: "win32" as const, proyecto: "C:\\p", bin: "C:\\bin" }]) {
      const entorno = crearEntornoOpenCode({ archivos: { [`${caso.bin}/git.exe`]: "", [`${caso.bin}/git`]: "" },
        plataforma: caso.plataforma, ...("rutas" in caso ? { rutas: caso.rutas } : {}),
        variables: { HOME: "/hogar", USERPROFILE: "C:/hogar", Path: caso.bin, SECRETO: "conservar" } });
      const contexto = contextoOpenCode(caso.proyecto, entorno);
      expect(contexto).toMatchObject({ exito: true, valor: { declaraciones: [] } });
      expect(entorno.variable("SECRETO")).toBe("conservar");
      expect(entorno.tipo(`${caso.bin}/git.exe`)).toBe("archivo");
    }
  });
});
