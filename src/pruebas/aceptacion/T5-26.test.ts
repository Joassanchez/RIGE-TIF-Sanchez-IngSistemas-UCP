import { expect, test } from "bun:test";
import { join, resolve } from "node:path";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { Database } from "bun:sqlite";
import { prepararConsultas } from "../utilidades/consultas-cli";
import { lanzar } from "../utilidades/subproceso";
import { validarEsquema } from "../utilidades/validar-esquema";

test("T5-26 U-14 estado inexistente, sin esquema y correcto, sin crear ni modificar la base", async () => {
  const e = prepararConsultas();
  const almacen = join(e.raiz, "almacen de prueba"), ruta = join(almacen, "rige.db").replaceAll("\\", "/");
  const cli = (opcion: string) => lanzar(e.raiz, ["estado", opcion], { ...e.variables, RIGE_ALMACEN: almacen });
  const esquema = await Bun.file(resolve("esquemas/salida/estado.json")).json();
  try {
    for (const estado of ["inexistente", "sin esquema", "correcto"] as const) {
      if (estado === "sin esquema") { mkdirSync(almacen); new Database(ruta).close(); }
      if (estado === "correcto") expect(lanzar(e.raiz, ["esquema"], { ...e.variables, RIGE_ALMACEN: almacen }).codigo).toBe(0);
      const antes = existsSync(ruta) ? readFileSync(ruta) : null;
      const json = cli("--json"), texto = cli("--texto");
      for (const r of [json, texto]) { expect(r.codigo).toBe(0); expect(r.error).toBe(""); }
      const respuesta = JSON.parse(json.salida);
      expect(respuesta).toEqual({ esquema: 2, almacen: { ruta, existe: estado !== "inexistente", versionEsquema: estado === "correcto" ? 2 : null } });
      expect(validarEsquema(esquema, respuesta)).toEqual([]);
      expect(texto.salida).toContain(ruta); expect(texto.salida).toContain(`Existe: ${estado === "inexistente" ? "no" : "sí"}`);
      expect(texto.salida.includes("bun run rige -- esquema")).toBe(estado !== "correcto");
      expect(existsSync(almacen)).toBe(estado !== "inexistente");
      expect(existsSync(ruta) ? readFileSync(ruta) : null).toEqual(antes);
    }
  } finally { e.borrar(); }
});

test("T5-26 U-13 entradas --todo por proceso, revisados solo en texto ampliado y JSON intacto", () => {
  const e = prepararConsultas();
  try {
    const breve = e.consultar("entradas", ["--texto"]), todo = e.consultar("entradas", ["--texto", "--todo"]);
    expect(todo.codigo).toBe(0); expect(todo.salida).toContain("Revisado:"); expect(breve.salida).not.toContain("Revisado:");
    expect(e.consultar("entradas", ["--todo", "--json"])).toEqual(e.consultar("entradas", ["--json"]));
  } finally { e.borrar(); }
});
