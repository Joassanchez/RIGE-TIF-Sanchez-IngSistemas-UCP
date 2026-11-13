import { afterEach, describe, expect, test } from "bun:test";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { borrarTemporal } from "../utilidades/borrar-temporal";
import { copiarEscenario } from "../utilidades/escenario";
import { crearEntornoAislado } from "../utilidades/entorno-aislado";
import { consultarPermiso } from "../../paquetes/rige/aplicacion/casos-uso/consultar-permiso";
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

describe("K-5 RF-01", () => { describe("T2-04 F-1 F-3 F-4 F-5 RF-01 CA-1 CA-2", () => {
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

function prepararArchivos(capas: { global?: string; proyecto?: string }) {
  const raiz = realpathSync.native(mkdtempSync(join(tmpdir(), "rige-t602-")));
  limpiezas.push(() => borrarTemporal(raiz));
  const hogar = join(raiz, "hogar");
  const proyecto = join(raiz, "proyecto");
  const globalJson = join(hogar, ".config/opencode/opencode.json");
  const proyectoJson = join(proyecto, "opencode.json");
  mkdirSync(join(hogar, ".config/opencode"), { recursive: true });
  mkdirSync(join(proyecto, ".git/objects"), { recursive: true });
  mkdirSync(join(proyecto, ".git/refs"), { recursive: true });
  writeFileSync(join(proyecto, ".git/HEAD"), "ref: refs/heads/main\n", "utf8");
  if (capas.global !== undefined) writeFileSync(globalJson, capas.global, "utf8");
  if (capas.proyecto !== undefined) writeFileSync(proyectoJson, capas.proyecto, "utf8");
  const variables = {
    ...crearEntornoAislado(hogar, process.env),
    XDG_CONFIG_HOME: join(hogar, ".config"),
    RIGE_ALMACEN: join(raiz, "almacen"),
    ProgramData: join(raiz, "administrada"),
  };
  const entorno = new EntornoLecturaSistema({ plataforma: process.platform, entorno: variables });
  const dependencias = { adaptador: adaptadorOpenCode, entorno, rutas: entorno };
  return {
    globalJson,
    proyectoJson,
    globalRef: globalJson.replaceAll("\\", "/"),
    proyectoRef: proyectoJson.replaceAll("\\", "/"),
    permiso: (solicitud: { agente: string; sujeto: string; objetivo: string }) =>
      consultarPermiso(dependencias, { proyecto, ...solicitud }),
    valores: (agente: string, clave?: string) => consultarValores(dependencias, proyecto, agente, clave),
  };
}

function sha256(rutas: readonly string[]) {
  return rutas.map(ruta => createHash("sha256").update(readFileSync(ruta)).digest("hex"));
}

describe("T6-02 fusion entre archivos de permission como accion (P-1..P-4, P-6)", () => {
  test("P-1: proyecto con permission string reemplaza * y conserva bash de global", () => {
    const escenario = prepararArchivos({
      global: '{"permission":{"*":"ask","bash":"deny"}}',
      proyecto: '{"permission":"allow"}',
    });
    const antes = sha256([escenario.globalJson, escenario.proyectoJson]);

    const resBash = escenario.permiso({ agente: "build", sujeto: "bash", objetivo: "ls" });
    expect(resBash.exito).toBe(true);
    if (!resBash.exito) throw new Error(resBash.error.mensaje);
    expect(resBash.valor.decision).toBe("deny");
    expect(resBash.valor.cadena.find(r => r.indice === resBash.valor.determinante)).toMatchObject({
      sujeto: "bash",
      patron: "*",
      efecto: "deny",
      declaracion: { via: "global", referencia: escenario.globalRef },
    });

    const resEdit = escenario.permiso({ agente: "build", sujeto: "edit", objetivo: "a.ts" });
    expect(resEdit.exito).toBe(true);
    if (!resEdit.exito) throw new Error(resEdit.error.mensaje);
    expect(resEdit.valor.decision).toBe("allow");
    expect(resEdit.valor.cadena.find(r => r.indice === resEdit.valor.determinante)).toMatchObject({
      sujeto: "*",
      patron: "*",
      efecto: "allow",
      declaracion: { via: "proyecto", referencia: escenario.proyectoRef },
    });
    expect(sha256([escenario.globalJson, escenario.proyectoJson])).toEqual(antes);
  });

  test("P-2: permission string en global anula la proteccion nativa de explore", () => {
    const escenario = prepararArchivos({
      global: '{"permission":"allow"}',
      proyecto: '{"permission":{"bash":"deny"}}',
    });
    const resEdit = escenario.permiso({ agente: "explore", sujeto: "edit", objetivo: "a.ts" });
    expect(resEdit.exito).toBe(true);
    if (!resEdit.exito) throw new Error(resEdit.error.mensaje);
    expect(resEdit.valor.decision).toBe("allow");
    expect(resEdit.valor.advertencias).toContain("proteccion-nativa-anulada");
    const determinante = resEdit.valor.determinante;
    expect(determinante).not.toBeNull();
    if (determinante === null) throw new Error("Se esperaba determinante");
    expect(resEdit.valor.nativaAnulada).not.toBeNull();
    expect(resEdit.valor.nativaAnulada!.por).toBe(determinante);
    expect(resEdit.valor.cadena.find(r => r.indice === determinante)).toMatchObject({
      sujeto: "*",
      patron: "*",
      efecto: "allow",
      declaracion: { via: "global", referencia: escenario.globalRef },
    });
    expect(resEdit.valor.cadena.find(r => r.indice === resEdit.valor.nativaAnulada!.regla)).toMatchObject({
      sujeto: "*",
      patron: "*",
      efecto: "deny",
      origen: { tipo: "nativo" },
    });

    const resBash = escenario.permiso({ agente: "explore", sujeto: "bash", objetivo: "ls" });
    expect(resBash.exito).toBe(true);
    if (!resBash.exito) throw new Error(resBash.error.mensaje);
    expect(resBash.valor.decision).toBe("deny");
    expect(resBash.valor.cadena.find(r => r.indice === resBash.valor.determinante)).toMatchObject({
      sujeto: "bash",
      declaracion: { via: "proyecto", referencia: escenario.proyectoRef },
    });
  });

  test("P-3: un solo archivo con permission string decide y localiza la clave", () => {
    const escenario = prepararArchivos({
      proyecto: '{\n  "permission": "ask"\n}',
    });
    const res = escenario.permiso({ agente: "build", sujeto: "edit", objetivo: "a.ts" });
    expect(res.exito).toBe(true);
    if (!res.exito) throw new Error(res.error.mensaje);
    expect(res.valor.decision).toBe("ask");
    expect(res.valor.cadena.find(r => r.indice === res.valor.determinante)).toMatchObject({
      sujeto: "*",
      patron: "*",
      efecto: "ask",
      origen: { tipo: "declarado", posicion: { linea: 2, columna: 3 } },
      declaracion: {
        via: "proyecto",
        referencia: escenario.proyectoRef,
        localizacion: `${escenario.proyectoRef}:2:3`,
      },
    });
  });

  test("P-4: fusiona permission string y objeto de agente entre archivos en orden de fusion", () => {
    const escenario = prepararArchivos({
      global: '{"agent":{"build":{"permission":"deny"}}}',
      proyecto: '{"agent":{"build":{"permission":{"read":"allow"}}}}',
    });
    const resBash = escenario.permiso({ agente: "build", sujeto: "bash", objetivo: "ls" });
    expect(resBash.exito).toBe(true);
    if (!resBash.exito) throw new Error(resBash.error.mensaje);
    expect(resBash.valor.decision).toBe("deny");
    expect(resBash.valor.cadena.find(r => r.indice === resBash.valor.determinante)).toMatchObject({
      sujeto: "*",
      patron: "*",
      efecto: "deny",
      declaracion: { via: "global", referencia: escenario.globalRef },
    });

    const resRead = escenario.permiso({ agente: "build", sujeto: "read", objetivo: "a.ts" });
    expect(resRead.exito).toBe(true);
    if (!resRead.exito) throw new Error(resRead.error.mensaje);
    expect(resRead.valor.decision).toBe("allow");
    expect(resRead.valor.cadena.filter(r => r.origen.tipo === "declarado")).toMatchObject([
      { sujeto: "*", patron: "*", efecto: "deny", declaracion: { via: "global", referencia: escenario.globalRef } },
      { sujeto: "read", patron: "*", efecto: "allow", declaracion: { via: "proyecto", referencia: escenario.proyectoRef } },
    ]);
  });

  test("P-6: consulta de valores proyecta permission.* y desplaza la posicion de global", () => {
    const escenario = prepararArchivos({
      global: '{"agent":{"build":{"permission":"ask"}}}',
      proyecto: '{\n  "agent": {\n    "build": {\n      "permission": "deny"\n    }\n  }\n}',
    });
    const antes = sha256([escenario.globalJson, escenario.proyectoJson]);
    const todos = escenario.valores("build");
    expect(todos.exito).toBe(true);
    if (!todos.exito) throw new Error(todos.error.mensaje);
    const permiso = todos.valor.valores.find(v => v.clave === "permission.*");
    expect(permiso).toMatchObject({
      clave: "permission.*",
      rastro: {
        ruta: ["agent", "build", "permission", "*"],
        valor: "deny",
        determinante: {
          via: "proyecto",
          referencia: escenario.proyectoRef,
          localizacion: `${escenario.proyectoRef}:4:7`,
          origen: { tipo: "declarado", posicion: { linea: 4, columna: 7 } },
          valor: "deny",
        },
        desplazadas: [{
          via: "global",
          referencia: escenario.globalRef,
          localizacion: `${escenario.globalRef}:1:20`,
          origen: { tipo: "declarado", posicion: { linea: 1, columna: 20 } },
          valor: "ask",
        }],
      },
    });

    const puntual = escenario.valores("build", "permission.*");
    expect(puntual.exito).toBe(true);
    if (!puntual.exito) throw new Error(puntual.error.mensaje);
    expect(puntual.valor.valores).toEqual([permiso!]);
    expect(sha256([escenario.globalJson, escenario.proyectoJson])).toEqual(antes);
  });
});
