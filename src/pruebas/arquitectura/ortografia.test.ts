import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { tokenizar } from "../utilidades/analisis-arquitectura";

test("T2-17 Z-1 mensajes y plantillas conservan tildes", () => {
  const raiz = resolve(import.meta.dir, "../..");
  const faltas: string[] = [];
  const sinTilde = /(?<![\p{L}\w-])(?:esta vacio|invalida|Configuracion|decision|arbol|sesion)(?![\p{L}\w-])/u;
  for (const archivo of new Bun.Glob("paquetes/**/*.ts").scanSync({ cwd: raiz })) {
    if (archivo.endsWith(".test.ts") || /[\\/](?:vendor|node_modules)[\\/]/.test(archivo)) continue;
    for (const token of tokenizar(readFileSync(resolve(raiz, archivo), "utf8"))) {
      // Incluye segmentos de plantillas, sin confundir identificadores o códigos con prosa.
      if ((token.cadena || /^[`}]|\$\{$/.test(token.valor)) && /\s/.test(token.valor) && sinTilde.test(token.valor)) {
        faltas.push(`${archivo}: ${token.valor}`);
      }
    }
  }
  expect(faltas).toEqual([]);
});
