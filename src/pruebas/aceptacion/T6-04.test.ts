import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { borrarTemporal } from "../utilidades/borrar-temporal";
import { prepararConsultas } from "../utilidades/consultas-cli";
import { crearEntornoMemoria } from "../utilidades/entorno-memoria";
import { resolver } from "../utilidades/resolver";
import { lanzar } from "../utilidades/subproceso";

function crearProyectoTemporal(archivos: Record<string, string>) {
  const raiz = realpathSync.native(mkdtempSync(join(tmpdir(), "rige-t604-")));
  const hogar = join(raiz, "hogar");
  const proyecto = join(raiz, "proyecto");
  mkdirSync(hogar, { recursive: true });
  mkdirSync(join(proyecto, ".git"), { recursive: true });
  writeFileSync(join(proyecto, ".git", "HEAD"), "ref: refs/heads/main\n");
  for (const [relativa, contenido] of Object.entries(archivos)) {
    const destino = join(proyecto, relativa);
    mkdirSync(join(destino, ".."), { recursive: true });
    writeFileSync(destino, contenido);
  }
  const extra = { ProgramData: join(raiz, "administrada") };
  return {
    raiz,
    hogar,
    proyecto,
    consultar: (comando: string, opciones: readonly string[] = []) =>
      lanzar(hogar, [comando, "--proyecto", proyecto, "--json", ...opciones], extra),
    borrar: () => borrarTemporal(raiz),
  };
}

describe("T6-04 — deteccion y fallo visible de formas v2 no incorporadas", () => {
  test("V-1 y V-2: agents marca listado incompleto y falla consultas sobre agentes afectados", () => {
    const temp = crearProyectoTemporal({
      "opencode.json": JSON.stringify({
        agents: { rev: { mode: "primary" }, build: { disabled: true } },
      }),
    });
    try {
      const resAgentes = temp.consultar("agentes");
      expect(resAgentes.codigo).toBe(0);
      const agentesJson = JSON.parse(resAgentes.salida);
      expect(agentesJson.incompleta).toBe(true);
      expect(agentesJson.motivos).toContain("forma-v2-no-incorporada");
      expect(agentesJson.agentes.find((a: { nombre: string }) => a.nombre === "rev"))
        .toMatchObject({ nombre: "rev", origen: "declarado" });
      expect(agentesJson.agentes.find((a: { nombre: string }) => a.nombre === "build"))
        .toMatchObject({ nombre: "build", origen: "nativo" });
      expect(agentesJson.agentes.find((a: { nombre: string }) => a.nombre === "plan"))
        .toMatchObject({ nombre: "plan", origen: "nativo" });

      const resValores = temp.consultar("valores", ["--agente", "rev"]);
      const textoValores = resValores.salida || resValores.error;
      expect(textoValores).toContain("clave-no-resuelta");
      expect(textoValores).toContain("esquema v2");
      expect(textoValores).not.toContain("no existe");

      const resPermiso = temp.consultar("permiso", ["--agente", "rev", "--herramienta", "read", "--objetivo", "a.txt"]);
      expect(resPermiso.codigo).toBe(1);
      expect(JSON.parse(resPermiso.error)).toMatchObject({
        error: { codigo: "cadena-incompleta", mensaje: expect.stringContaining("forma-v2-no-incorporada") },
      });

      const resReglas = temp.consultar("reglas", ["--agente", "rev"]);
      expect(resReglas.codigo).toBe(1);
      expect(JSON.parse(resReglas.error)).toMatchObject({
        error: { codigo: "cadena-incompleta", mensaje: expect.stringContaining("forma-v2-no-incorporada") },
      });

      const resPlan = temp.consultar("permiso", ["--agente", "plan", "--herramienta", "read", "--objetivo", "a.txt"]);
      expect(resPlan.codigo).toBe(0);
    } finally {
      temp.borrar();
    }
  });

  test("commands excluye el conteo de comandos en hallazgos", () => {
    const temp = crearProyectoTemporal({
      "opencode.json": JSON.stringify({
        commands: { deploy: { template: "go" } },
      }),
      ".opencode/commands/uno.md": "# comando markdown",
    });
    try {
      const resHallazgos = temp.consultar("hallazgos");
      expect(resHallazgos.codigo).toBe(0);
      const hallazgosJson = JSON.parse(resHallazgos.salida);
      expect(hallazgosJson.resumen.elementos.comandos).toBe(0);
    } finally {
      temp.borrar();
    }
  });

  test("V-3 y V-4: model como objeto queda sin resolver y model como cadena no cambia", () => {
    const entornoObjeto = crearEntornoMemoria({
      archivos: {
        "/p/opencode.json": JSON.stringify({ model: { providerID: "a", model: "b" } }),
      },
      directorios: ["/p"],
      variables: { HOME: "/h" },
    });
    const resObjeto = resolver(adaptadorOpenCode, "/p", entornoObjeto);
    expect(resObjeto.exito).toBe(true);
    if (!resObjeto.exito) throw new Error(resObjeto.error.mensaje);
    expect(resObjeto.valor.noResueltas).toContainEqual({ ruta: ["model"], regla: "forma-v2-no-incorporada" });
    expect(resObjeto.valor.valores.some(v => v.ruta[0] === "model")).toBe(false);
    expect(resObjeto.valor.reglas["forma-v2-no-incorporada"]).toEqual(expect.any(String));

    const entornoCadena = crearEntornoMemoria({
      archivos: {
        "/p/opencode.json": JSON.stringify({ model: "a/b" }),
      },
      directorios: ["/p"],
      variables: { HOME: "/h" },
    });
    const resCadena = resolver(adaptadorOpenCode, "/p", entornoCadena);
    expect(resCadena.exito).toBe(true);
    if (!resCadena.exito) throw new Error(resCadena.error.mensaje);
    expect(resCadena.valor.noResueltas.some(n => n.ruta[0] === "model")).toBe(false);
    expect(resCadena.valor.valores.find(v => v.ruta.length === 1 && v.ruta[0] === "model")?.valor).toBe("a/b");
  });

  test("V-5: un escenario existente sin formas v2 no introduce forma-v2-no-incorporada", () => {
    const consulta = prepararConsultas("v2-cadena");
    try {
      for (const args of [["agentes", ["--json"]], ["hallazgos", ["--json"]], ["valores", ["--agente", "build", "--json"]]] as const) {
        const res = consulta.consultar(args[0], args[1]);
        expect(res.codigo).toBe(0);
        expect(res.salida).not.toContain("forma-v2-no-incorporada");
      }
    } finally {
      consulta.borrar();
    }
  });
});
