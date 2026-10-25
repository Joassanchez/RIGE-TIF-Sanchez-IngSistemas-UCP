import { afterEach, describe, expect, test } from "bun:test";
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { copiarEscenario } from "../utilidades/escenario";
import { crearEntornoAislado } from "../utilidades/entorno-aislado";
import { consultarValores } from "../../paquetes/rige/aplicacion/casos-uso/consultar-valores";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";
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
  const variables = { ...crearEntornoAislado(hogar, process.env), XDG_CONFIG_HOME: join(hogar, ".config"),
    RIGE_ALMACEN: join(escenario.raiz, "almacen"), ProgramData: join(escenario.raiz, "administrada") };
  const entorno = new EntornoLecturaSistema({ plataforma: process.platform, entorno: variables });
  const consultar = (clave?: string) => consultarValores({ adaptador: adaptadorOpenCode, entorno, rutas: entorno }, escenario.proyecto, "build", clave);
  return { ...escenario, consultar, global, proyectoJson: join(escenario.proyecto, "opencode.json") };
}

describe("K-5", () => { describe("T2-04 F-1 F-3 F-4 F-5 RF-01 CA-1 CA-2", () => {
  test("valores en memoria conserva fusion, orden, procedencia y entradas", () => {
    const escenario = preparar();
    const resumenes = () => [escenario.global, escenario.proyectoJson].map(r => createHash("sha256").update(readFileSync(r)).digest("hex"));
    const antes = resumenes();
    const resultado = escenario.consultar();
    expect(resultado.exito).toBe(true);
    if (!resultado.exito) throw new Error(resultado.error.mensaje);
    const respuesta: RespuestaValores = resultado.valor;
    const declarados = respuesta.valores.filter(v => v.rastro.determinante.origen.tipo === "declarado");
    expect(respuesta.valores.filter(v => v.rastro.determinante.origen.tipo === "implicito").map(v => v.clave).sort())
      .toEqual(["description", "mode", "name", "native", "options"]);
    expect(respuesta.noResueltas).toEqual([]);
    expect(declarados.map(v => [v.rastro.ruta.slice(2), v.rastro.valor])).toEqual([
      [["permission", "bash", "*"], "deny"], [["permission", "bash", "git *"], "allow"],
      [["permission", "read", "2"], "ask"], [["permission", "read", "10"], "deny"],
      [["permission", "read", "*.env"], "ask"], [["permission", "read", "a"], "allow"], [["permission", "edit"], "deny"],
    ]);
    const indices = declarados.map(v => v.rastro.indiceFusion);
    expect(indices).toEqual(indices.map((_, i) => indices[0]! + i));
    for (const { rastro } of declarados) {
      expect(rastro.determinante).toMatchObject({ via: "proyecto", referencia: escenario.proyectoJson.replaceAll("\\", "/") });
      const origen = rastro.determinante.origen;
      if (origen.tipo !== "declarado") throw new Error("Se esperaba origen declarado");
      expect(readFileSync(escenario.proyectoJson, "utf8").split(/\r?\n/)[origen.posicion.linea - 1]!.slice(origen.posicion.columna - 1))
        .toStartWith(JSON.stringify(rastro.ruta.at(-1)));
    }
    for (const { rastro } of declarados.slice(0, 2)) expect(rastro.desplazadas).toMatchObject([
      { valor: "ask", via: "global", referencia: escenario.global.replaceAll("\\", "/"), origen: { posicion: { linea: 9, columna: 9 } } },
    ]);
    const puntual = escenario.consultar("/permission/read/*.env");
    expect(puntual.exito).toBe(true);
    if (!puntual.exito) throw new Error(puntual.error.mensaje);
    expect(puntual.valor.valores).toEqual([declarados[4]!]);
    expect(escenario.consultar()).toEqual(resultado);
    expect(respuesta.entradas.filter(e => e.condicion === "observada").map(e => e.resumen)).toEqual(antes);
    expect(resumenes()).toEqual(antes);
  });
}); });
