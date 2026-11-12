import { expect, test } from "bun:test";
import { clavesOriginales, coordenadasOriginales } from "./claves-originales";

test("V-6 oraculo distingue ruta, ocurrencia, comentarios, CRLF y columnas UTF-16", () => {
  const texto = '// "x": falso\r\n{"😀":0,"a":{"x":1,"x":2},"b":{"x":"{env:X}"}}';
  const claves = clavesOriginales(texto);
  expect(claves.map(c => [c.ruta, c.ocurrencia, coordenadasOriginales(texto, c.indice)])).toEqual([
    [["😀"], 0, { linea: 2, columna: 2 }],
    [["a"], 0, { linea: 2, columna: 9 }],
    [["a", "x"], 0, { linea: 2, columna: 14 }],
    [["a", "x"], 1, { linea: 2, columna: 20 }],
    [["b"], 0, { linea: 2, columna: 27 }],
    [["b", "x"], 0, { linea: 2, columna: 32 }],
  ]);
});
