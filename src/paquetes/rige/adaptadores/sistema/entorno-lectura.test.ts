import { afterEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const temporales: string[] = [];
afterEach(() => {
  for (const temporal of temporales.splice(0)) rmSync(temporal, { recursive: true, force: true });
});

describe("E-1", () => {
  test("lectura real, rutas, nombres ordenados y resumen de los bytes sin escribir entradas", async () => {
    const temporal = mkdtempSync(join(tmpdir(), "rige-lectura-"));
    temporales.push(temporal);
    mkdirSync(join(temporal, "directorio"));
    const ruta = join(temporal, "a.txt");
    const bytes = Buffer.from([0xef, 0xbb, 0xbf, 0x61, 0xc3, 0xb1, 0xff, 0x0a]);
    writeFileSync(ruta, bytes);
    writeFileSync(join(temporal, "z.txt"), "ultimo");
    const { EntornoLecturaSistema } = await import("./entorno-lectura");
    const entorno = new EntornoLecturaSistema({ plataforma: "win32", entorno: { HOME: temporal, VACIA: "", ESPACIOS: " \t ", VALOR: "literal" } });
    expect(entorno.plataforma).toBe("win32");
    expect(entorno.variable("HOME")).toBe(temporal);
    expect(entorno.variable("VACIA")).toBeUndefined();
    expect(entorno.variable("ESPACIOS")).toBeUndefined();
    expect(entorno.variable("AUSENTE")).toBeUndefined();
    expect(entorno.variable("toString")).toBeUndefined();
    expect(entorno.variable("VALOR")).toBe("literal");
    expect(entorno.listar(temporal)).toEqual(["a.txt", "directorio", "z.txt"]);
    expect(entorno.listar(join(temporal, "no-existe"))).toEqual([]);
    expect(entorno.tipo(temporal)).toBe("directorio");
    expect(entorno.tipo(ruta.replaceAll("\\", "/"))).toBe("archivo");
    expect(entorno.tipo(join(ruta, "componente"))).toBe("inexistente");
    expect(entorno.tipo(join(temporal, "no-existe"))).toBe("inexistente");
    expect(entorno.leer(ruta.replaceAll("\\", "/"))).toEqual({
      texto: bytes.toString("utf8"), resumen: createHash("sha256").update(bytes).digest("hex"),
    });
    expect(entorno.resumir("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(entorno.unir(temporal, "directorio", "..", "a.txt")).toBe(ruta);
    expect(entorno.padre(ruta)).toBe(temporal);
    let raiz = resolve(temporal);
    while (dirname(raiz) !== raiz) raiz = dirname(raiz);
    expect(entorno.padre(raiz)).toBe(raiz);
    expect(entorno.esAbsoluta(ruta)).toBe(true);
    expect(entorno.esAbsoluta("a.txt")).toBe(false);
    expect(entorno.canonica(temporal)).toBe(realpathSync.native(temporal).replaceAll("\\", "/"));
    expect(entorno.canonica(join(temporal, "no-existe"))).toBeNull();
    expect(entorno.canonica(join(ruta, "componente"))).toBeNull();
    expect(() => entorno.leer(join(temporal, "no-existe"))).toThrow();
    expect(() => entorno.leer(temporal)).toThrow();
    expect(entorno.listar(temporal)).toEqual(["a.txt", "directorio", "z.txt"]);
  });
});
