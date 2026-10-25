import { describe, expect, test } from "bun:test";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { prepararConsultas } from "../utilidades/consultas-cli";
import { consultarCadenas } from "../utilidades/cadenas";

for (const [id, clave, valor] of [["B-1", "mode", "foo"], ["B-2", "hidden", "si"], ["B-2 disable", "disable", "si"]] as const) {
  describe(`T2-11b ${id}`, () => {
    test("las tres consultas rechazan metadatos invalidos como error de uso ubicado", () => {
      const copia = prepararConsultas();
      try {
        writeFileSync(join(copia.proyecto, "opencode.json"), JSON.stringify({ agent: { x: { [clave]: valor } } }, null, 2));
        for (const [comando, opciones] of [["agentes", []], ["valores", ["--agente", "x"]],
          ["permiso", ["--agente", "x", "--sujeto", "read", "--objetivo", "a"]]] as const) {
          const salida = copia.consultar(comando, opciones);
          expect(salida.codigo).toBe(1);
          expect(salida.salida).toBe("");
          expect(JSON.parse(salida.error)).toMatchObject({ error: { codigo: "configuracion-invalida",
            mensaje: expect.stringContaining(`agent.x.${clave}`) } });
          expect(JSON.parse(salida.error).error.mensaje).toContain("opencode.json:4:");
        }
      } finally { copia.borrar(); }
    });
  });
}

for (const [id, escenario] of [["W-1", "v2-worktree-gitfile-roto"], ["W-2", "v2-worktree-dir-invalido-anidado"]]) {
  test(`T2-11b ${id} cadena de plan coincide con el binario en ${escenario}`, () => {
    const { cadenas, referencia, normalizar } = consultarCadenas(escenario!);
    expect(normalizar(cadenas.plan!.reglas.map(r => ({ permission: r.sujeto, pattern: r.patron, action: r.efecto }))))
      .toEqual(referencia.cadenas.plan);
  });
}

test("T2-11b N-1 numeracion declarada siempre; references/reference advierten", () => {
  const copia = prepararConsultas();
  try {
    for (const clave of [undefined, "references", "reference"]) {
      writeFileSync(join(copia.proyecto, "opencode.json"), JSON.stringify(clave ? { [clave]: [] } : {}));
      const salida = copia.consultar("permiso", ["--agente", "build", "--sujeto", "read", "--objetivo", "a"]);
      expect(salida.codigo).toBe(0);
      const respuesta = JSON.parse(salida.salida);
      expect(respuesta.declaraciones).toContain("numeracion-sin-directorios-externos");
      expect(respuesta.reglas["numeracion-sin-directorios-externos"])
        .toBe("Los índices no cuentan las reglas external_directory que OpenCode agrega por cada skill o referencia instalada.");
      expect(respuesta.advertencias.includes("references-no-incorporado")).toBe(clave !== undefined);
    }
  } finally { copia.borrar(); }
});
