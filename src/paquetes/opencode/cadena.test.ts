import { describe, expect, test } from "bun:test";
import { posix, win32 } from "node:path";
import { resolver } from "@rige/nucleo/resolucion/resolver";
import { crearEntornoMemoria } from "../../pruebas/utilidades/entorno-memoria";
import { adaptadorFicticio } from "../../pruebas/utilidades/adaptador-ficticio";
import { adaptadorOpenCode } from "./adaptador";

function preparar(textos: readonly string[] = [], plataforma = "linux", variables = {}) {
  const rutas = plataforma === "win32" ? win32 : posix;
  const entorno = { ...crearEntornoMemoria({ archivos: Object.fromEntries(textos.map((t, i) => [`/capa-${i}`, t])),
    plataforma, variables: { HOME: "/hogar", USERPROFILE: "C:\\hogar", XDG_DATA_HOME: plataforma === "win32" ? "C:\\datos" : "/datos",
      TEMP: "C:\\temporal", TMPDIR: "/temporal", ...variables } }), unir: rutas.join, padre: rutas.dirname, relativa: rutas.relative };
  const resultado = resolver({ ...adaptadorOpenCode, ubicar: () => ({ exito: true, valor: textos.map((_, i) => ({
    via: i ? "proyecto" : "global", referencia: `/capa-${i}`, condicion: "observada" as const,
  })) }) }, plataforma === "win32" ? "C:\\proyecto" : "/proyecto", entorno);
  if (!resultado.exito) throw new Error(resultado.error.mensaje);
  const cadena = (agente = "build") => adaptadorOpenCode.cadena(resultado.valor, agente, entorno);
  return { cadena, resolucion: resultado.valor, entorno };
}
function obtener(textos: readonly string[] = [], agente = "build") {
  const resultado = preparar(textos).cadena(agente);
  if (!resultado.exito) throw new Error(resultado.error.mensaje);
  return resultado.valor;
}

describe("T2-05 K-1 RD-07", () => {
  test("defaults, extras, raiz y agente conservan su orden y la declaracion determinante", () => {
    const cadena = obtener(['{"permission":{"edit":"allow","bash":{"*":"ask","git *":"allow"}},"agent":{"build":{"permission":{"edit":"deny"}}}}']);
    expect(cadena.reglas.slice(14, -1).map(r => [r.sujeto, r.patron, r.efecto])).toEqual([
      ["edit", "*", "allow"], ["bash", "*", "ask"], ["bash", "git *", "allow"], ["edit", "*", "deny"],
    ]);
    expect(cadena.reglas.map(r => r.indice)).toEqual(cadena.reglas.map((_, i) => i));
    expect(cadena.ejesParciales).toEqual(["external_directory"]);
    expect(cadena.reglas[14]!.declaracion).toMatchObject({ referencia: "/capa-0", origen: { tipo: "declarado" } });
    expect(cadena.reglas.slice(0, 14).every(r => r.origen.tipo === "nativo" && r.declaracion === null)).toBe(true);
  });
  test("build tiene 15 reglas sin declaraciones y el deny exacto evita solo el agregado final", () => {
    expect(obtener().reglas).toHaveLength(15);
    expect(obtener().reglas.at(-1)).toMatchObject({ sujeto: "external_directory", patron: "/datos/opencode/tool-output/*", origen: { regla: "nativa-final" } });
    for (const [patron, finales] of [["/datos/opencode/tool-output/*", 0], ["*", 1]] as const) {
      const reglas = obtener([JSON.stringify({ permission: { external_directory: { [patron]: "deny" } } })]).reglas;
      expect(reglas.filter(r => r.origen.tipo === "nativo" && r.origen.regla === "nativa-final")).toHaveLength(finales);
    }
  });
  test("fusion, patrones directos, objetos vacios y expansion del hogar", () => {
    const cadena = obtener(['{"permission":{"bash":{"*":"ask","git *":"allow"}}}',
      '{"permission":{"bash":{"*":"deny","~/x":"ask","$HOMEx":"allow"},"webfetch":"deny","read":{}}}']);
    expect(cadena.reglas.slice(14, -1).map(r => [r.sujeto, r.patron, r.efecto])).toEqual([
      ["bash", "*", "deny"], ["bash", "git *", "allow"], ["bash", "/hogar/x", "ask"], ["bash", "/hogarx", "allow"], ["webfetch", "*", "deny"],
    ]);
    expect(cadena.reglas[14]!.declaracion!.referencia).toBe("/capa-1");
  });
  test("rutas nativas de plan y tmp de Windows y Linux entran por el puerto", () => {
    for (const plataforma of ["win32", "linux"]) {
      const resultado = preparar([], plataforma).cadena("plan");
      if (!resultado.exito) throw new Error(resultado.error.mensaje);
      const path = plataforma === "win32" ? win32 : posix;
      expect(resultado.valor.reglas).toContainEqual(expect.objectContaining({ sujeto: "external_directory", patron: path.join(plataforma === "win32" ? "C:\\temporal" : "/temporal", "opencode", "*"), efecto: "allow" }));
      expect(resultado.valor.reglas).toContainEqual(expect.objectContaining({ sujeto: "edit", patron: path.join(".opencode", "plans", "*.md"), efecto: "allow" }));
    }
    const fallback = preparar([], "linux", { XDG_DATA_HOME: "", TMPDIR: "" }).cadena();
    expect(fallback.exito && fallback.valor.reglas.at(-1)!.patron).toBe("/hogar/.local/share/opencode/tool-output/*");
  });
});

describe("T2-05 K-2", () => {
  test("agente inexistente y ambitos incompletos fallan visiblemente", () => {
    expect(preparar().cadena("ausente")).toMatchObject({ exito: false, error: { categoria: "uso", codigo: "agente-inexistente" } });
    for (const texto of ['{"tools":{"bash":false}}', '{"agent":{"build":{"tools":{"bash":false}}}}',
      '{"agent":{"build":{"permission":{"bash":"{env:SECRETO}"}}}}']) {
      expect(preparar([texto]).cadena()).toMatchObject({ exito: false, error: { categoria: "uso", codigo: "cadena-incompleta" } });
    }
    expect(preparar(['{"tools":{"bash":false}}']).cadena()).toMatchObject({ error: { mensaje: expect.stringContaining("tools-legado-no-incorporado") } });
    expect(preparar(['{"agent":{"otro":{"tools":{"bash":false}}}}']).cadena().exito).toBe(true);
  });
  test("agente declarado usa defaults y no extras de build; no confunde campos desconocidos con permisos", () => {
    const reglas = obtener(['{"permission":"ask","agent":{"revisor":{"description":"Revision","permission":{"edit":"deny"}}}}'], "revisor").reglas;
    expect(reglas).toHaveLength(15);
    expect(reglas.filter(r => r.origen.tipo === "nativo" && r.origen.regla === "nativa-agente")).toEqual([]);
    expect(reglas[12]).toMatchObject({ sujeto: "*", patron: "*", efecto: "ask" });
    expect(preparar(['{"agent":{"build":{"maxSteps":4}}}']).cadena().exito).toBe(true);
  });
});

describe("T2-05 K-3 RNF-03", () => {
  test("el contrato representa otro vocabulario", () => {
    const { resolucion, entorno } = preparar();
    const resultado = adaptadorFicticio.cadena(resolucion, "a", entorno);
    expect(resultado).toMatchObject({ exito: true, valor: { agente: "a", reglas: [{ sujeto: "documento", patron: "todos", efecto: "conceder" }], ejesParciales: [] } });
  });
});
