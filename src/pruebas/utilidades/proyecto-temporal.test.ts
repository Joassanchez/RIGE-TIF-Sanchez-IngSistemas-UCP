import { describe, expect, test } from "bun:test";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { copiarProyectoTemporal } from "./proyecto-temporal";

describe("A7-1 K-6", () => {
  test("la sonda modifica solamente una copia y conserva el resumen real", () => {
    const raiz = resolve(import.meta.dir, "../..");
    const relativa = "paquetes/rige/aplicacion/puertos/almacen.ts";
    const resumen = () => new Bun.CryptoHasher("sha256").update(readFileSync(resolve(raiz, relativa))).digest("hex");
    const antes = resumen();
    const copia = copiarProyectoTemporal(raiz);
    try {
      writeFileSync(resolve(copia.raiz, relativa), 'const sonda: number = "incorrecto";');
      expect(resumen()).toBe(antes);
      expect(readFileSync(resolve(copia.raiz, relativa))).not.toEqual(readFileSync(resolve(raiz, relativa)));
    } finally { copia.borrar(); }
    expect(resumen()).toBe(antes);
  });
});
