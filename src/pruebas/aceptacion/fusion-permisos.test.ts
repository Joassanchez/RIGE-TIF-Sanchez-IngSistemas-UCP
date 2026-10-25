import { afterEach, describe, expect, test } from "bun:test";
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { copiarEscenario } from "../utilidades/escenario";
import { crearEntornoAislado } from "../utilidades/entorno-aislado";
import { lanzar } from "../utilidades/subproceso";
import type { RespuestaValores } from "../../paquetes/rige/aplicacion/respuestas/valores";

const limpiezas: (() => void)[] = [];
afterEach(() => { for (const borrar of limpiezas.splice(0)) borrar(); });
function preparar() {
  const escenario = copiarEscenario("v2-fusion-permisos");
  limpiezas.push(escenario.borrar);
  const hogar = join(escenario.raiz, "hogar");
  const global = join(hogar, ".config/opencode/opencode.json");
  mkdirSync(join(hogar, ".config/opencode"), { recursive: true });
  copyFileSync(join(escenario.raiz, "global.json"), global);
  const variables = { ...crearEntornoAislado(hogar, {}), XDG_CONFIG_HOME: join(hogar, ".config"),
    RIGE_ALMACEN: join(escenario.raiz, "almacen"), ProgramData: join(escenario.raiz, "administrada") };
  const consultar = (...opciones: string[]) => lanzar(hogar, ["valores", "--proyecto", escenario.proyecto, "--agente", "build", ...opciones], variables);
  return { ...escenario, consultar, global, proyectoJson: join(escenario.proyecto, "opencode.json") };
}

describe("T2-04 F-1 F-3 F-4 F-5 RF-01 CA-1 CA-2", () => {
  test("valores por subproceso conserva fusion, orden, procedencia y entradas", () => {
    const escenario = preparar();
    const resumenes = () => [escenario.global, escenario.proyectoJson].map(r => createHash("sha256").update(readFileSync(r)).digest("hex"));
    const antes = resumenes();
    const resultado = escenario.consultar();
    expect(resultado.codigo).toBe(0);
    expect(resultado.error).toBe("");
    const respuesta = JSON.parse(resultado.salida) as RespuestaValores;
    expect(respuesta.noResueltas).toEqual([]);
    expect(respuesta.valores.map(v => [v.rastro.ruta.slice(2), v.rastro.valor])).toEqual([
      [["permission", "bash", "*"], "deny"], [["permission", "bash", "git *"], "allow"],
      [["permission", "read", "2"], "ask"], [["permission", "read", "10"], "deny"],
      [["permission", "read", "*.env"], "ask"], [["permission", "read", "a"], "allow"], [["permission", "edit"], "deny"],
    ]);
    const indices = respuesta.valores.map(v => v.rastro.indiceFusion);
    expect(indices).toEqual(indices.map((_, i) => indices[0]! + i));
    for (const { rastro } of respuesta.valores) {
      expect(rastro.determinante).toMatchObject({ via: "proyecto", referencia: escenario.proyectoJson.replaceAll("\\", "/") });
      const origen = rastro.determinante.origen;
      if (origen.tipo !== "declarado") throw new Error("Se esperaba origen declarado");
      expect(readFileSync(escenario.proyectoJson, "utf8").split(/\r?\n/)[origen.posicion.linea - 1]!.slice(origen.posicion.columna - 1))
        .toStartWith(JSON.stringify(rastro.ruta.at(-1)));
    }
    for (const { rastro } of respuesta.valores.slice(0, 2)) expect(rastro.desplazadas).toMatchObject([
      { valor: "ask", via: "global", referencia: escenario.global.replaceAll("\\", "/"), origen: { posicion: { linea: 9, columna: 9 } } },
    ]);
    const puntual = escenario.consultar("--clave", "/permission/read/*.env");
    expect(puntual.codigo).toBe(0);
    expect(JSON.parse(puntual.salida).valores).toEqual([respuesta.valores[4]]);
    expect(escenario.consultar()).toEqual(resultado);
    expect(respuesta.entradas.filter(e => e.condicion === "observada").map(e => e.resumen)).toEqual(antes);
    expect(resumenes()).toEqual(antes);
  });
});
