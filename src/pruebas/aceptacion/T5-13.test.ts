import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, readFileSync, writeFileSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { copiarEscenario } from "../utilidades/escenario";
import { entornoDeReferencia } from "../utilidades/entorno-referencia";
import type { ReferenciaCadenas } from "../utilidades/cadenas";
import { normalizarRutas, marcadorRelativoRaiz } from "../../herramientas/referencias-nativas/comparar";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";
import { prepararAnalisis } from "../../paquetes/rige/aplicacion/casos-uso/analizar-proyecto";
import { consultarReglas } from "../../paquetes/rige/aplicacion/casos-uso/consultar-reglas";
import { consultarPermiso } from "../../paquetes/rige/aplicacion/casos-uso/consultar-permiso";
import { localizarDeclaracion } from "../../paquetes/rige/aplicacion/respuestas/localizacion";
import { validarEsquema } from "../utilidades/validar-esquema";
import { consultarReglasGuardadas } from "../../paquetes/rige/aplicacion/casos-uso/consultar-guardada";
import type { Adaptador } from "../../paquetes/nucleo/contrato/adaptador";

const adaptadorGenerico: Adaptador = adaptadorOpenCode;

const limpiezas: (() => void)[] = [];
afterEach(() => { for (const limpiar of limpiezas.splice(0).reverse()) limpiar(); });
function preparar(nombre = "v2-decision") {
  const referencia = JSON.parse(readFileSync(new URL(`../escenarios/${nombre}/REFERENCIA.json`, import.meta.url), "utf8")) as ReferenciaCadenas;
  const e = copiarEscenario(nombre, { git: referencia.procedencia.git ?? "raiz" });
  limpiezas.push(e.borrar);
  const env = entornoDeReferencia(referencia, e);
  const entorno = new EntornoLecturaSistema({ entorno: env, plataforma: process.platform });
  const deps = { adaptador: adaptadorOpenCode, entorno, rutas: entorno };
  return { ...e, referencia, deps, env };
}

describe("T5-13 R-1", () => {
  test("foto guardada sin releer entorno, rutas o vias; rechaza id invalido", () => {
    const e = preparar();
    const a = prepararAnalisis(e.deps, e.proyecto);
    if (!a.exito) throw new Error(a.error.mensaje);
    const noLeer = (): never => { throw new Error("No releer entradas ni vias"); };
    let lecturas = 0;
    const deps = { ...e.deps, adaptador: { ...adaptadorOpenCode, contexto: noLeer, ubicar: noLeer },
      entorno: { ...e.deps.entorno, plataforma: process.platform, variable: noLeer, tipo: noLeer, examinar: noLeer, leer: noLeer,
        listar: noLeer, real: noLeer, resumir: (t: string) => e.deps.entorno.resumir(t),
        rutasPara: (p: string) => e.deps.entorno.rutasPara(p), ...e.deps.entorno.rutasPara(process.platform) }, rutas: { canonica: noLeer },
      resoluciones: { guardar: noLeer, listar: noLeer,
        leer: () => { lecturas++; return { exito: true as const, valor: { resolucion: a.valor.resolucion, id: 1, instante: "2026-11-10" } }; } } };
    const r = consultarReglasGuardadas(deps, "1", { agente: "build" });
    expect(lecturas).toBe(1);
    expect(r).toEqual(consultarReglas({ ...e.deps, resolucion: a.valor.resolucion }, { proyecto: e.proyecto, agente: "build" }));
    expect(consultarReglasGuardadas(deps, "no", { agente: "build" })).toMatchObject({ exito: false, error: { codigo: "solicitud-invalida" } });
    expect(lecturas).toBe(1);
  });
  test("resumen del adaptador: ask por defecto, comodin posterior y no evaluar patrones especificos", () => {
    const e = preparar();
    const a = prepararAnalisis(e.deps, e.proyecto);
    if (!a.exito) throw new Error(a.error.mensaje);
    const reglas = [{ indice: 0, sujeto: "read", patron: "*", efecto: "allow", origen: { tipo: "nativo" as const, regla: "nativa-general" }, declaracion: null },
      { indice: 1, sujeto: "*", patron: "*", efecto: "deny", origen: { tipo: "nativo" as const, regla: "nativa-agente" }, declaracion: null },
      { indice: 2, sujeto: "edit", patron: "**", efecto: "allow", origen: { tipo: "nativo" as const, regla: "nativa-general" }, declaracion: null }];
    const base = { agente: "a", reglas, ejesParciales: [], declaraciones: [], advertencias: [] };
    const r = adaptadorGenerico.resumirPermisos([base], a.valor.contexto);
    expect(r.filas[0]!.celdas).toEqual([{ sujeto: "read", efecto: "deny", prevalece: 1, motivo: null }, { sujeto: "edit", efecto: "deny", prevalece: 1, motivo: null }]);
    const defecto = adaptadorGenerico.resumirPermisos([{ ...base, reglas: [reglas[2]!] }], a.valor.contexto);
    expect(defecto.filas[0]!.celdas).toEqual([{ sujeto: "edit", efecto: "ask", prevalece: null, motivo: null }]);
  });
  test("proyecta la cadena compartida sin cambiar indices internos ni evaluar objetivos; una sola lectura", () => {
    const e = preparar();
    let lecturas = 0;
    const deps = { ...e.deps, medicion: { finalizarLectura() { lecturas++; } }, adaptador: { ...adaptadorOpenCode,
      prepararConsulta: (): never => { throw new Error("No evaluar objetivos"); } } };
    const r = consultarReglas(deps, { proyecto: e.proyecto, agente: "build" });
    if (!r.exito) throw new Error(r.error.mensaje);
    expect(lecturas).toBe(1);
    const a = prepararAnalisis(e.deps, e.proyecto);
    if (!a.exito) throw new Error(a.error.mensaje);
    const c = adaptadorGenerico.cadena(a.valor.resolucion, "build", a.valor.contexto);
    if (!c.exito) throw new Error(c.error.mensaje);
    expect(r.valor.cadena.map(({ prevalece: _, ...regla }) => regla)).toEqual(c.valor.reglas.map(regla => ({ ...regla,
      indice: regla.indice + 1, declaracion: regla.declaracion === null ? null : localizarDeclaracion(regla.declaracion) })));
    expect(c.valor.reglas[0]!.indice).toBe(0);
    expect(r.valor.ejesParciales).toEqual(["external_directory"]);
    expect(r.valor.advertencias).not.toContain("proteccion-nativa-anulada");
    expect(r.valor.declaraciones).toEqual([...adaptadorOpenCode.permisos.declaraciones, ...c.valor.declaraciones]);
    expect(r.valor.proyecto).toBe(realpathSync.native(e.proyecto).replaceAll("\\", "/"));
    expect(r.valor.entradas).toEqual(a.valor.resolucion.entradas);
    expect(r.valor.resumenEntradas).toBe(a.valor.resolucion.resumenEntradas);
    for (const codigo of [...r.valor.declaraciones, ...r.valor.advertencias]) expect(r.valor.reglas[codigo]).toBeString();
    const p = consultarPermiso({ ...e.deps, resolucion: a.valor.resolucion }, { proyecto: e.proyecto, agente: "build", sujeto: "read", objetivo: ".env" });
    if (!p.exito) throw new Error(p.error.mensaje);
    for (const regla of p.valor.cadena) expect(r.valor.cadena[regla.indice]).toMatchObject({ ...regla, indice: regla.indice + 1 });
  });
  test("matriz: comodin de sujeto posterior, patrones especificos excluidos, ejes parciales y agentes ocultos", () => {
    const e = preparar();
    writeFileSync(join(e.proyecto, "opencode.json"), JSON.stringify({ permission: { read: { "*": "allow", "**": "deny" }, "re*": "ask" },
      agent: { oculto: { hidden: true, prompt: "{env:RIGE_PRUEBA_CONTENIDO}" }, roto: { permission: { bash: "{env:RIGE_PRUEBA_SECRETO}" } }, apagado: { disable: true } } }));
    e.env.RIGE_PRUEBA_SECRETO = "allow";
    e.env.RIGE_PRUEBA_CONTENIDO = "MARCA-T513-SECRETA";
    const entorno = new EntornoLecturaSistema({ entorno: e.env, plataforma: process.platform });
    const r = consultarReglas({ ...e.deps, entorno, rutas: entorno }, { proyecto: e.proyecto, agente: "build" });
    if (!r.exito) throw new Error(r.error.mensaje);
    expect(r.valor.matriz.sujetos).not.toContain("*");
    expect(r.valor.matriz.sujetos).not.toContain("re*");
    const fila = r.valor.matriz.filas.find(f => f.agente === "build")!;
    const read = fila.celdas.find(c => c.sujeto === "read")!;
    expect(read.efecto).toBe("ask");
    expect(r.valor.cadena[read.prevalece! - 1]).toMatchObject({ sujeto: "re*", patron: "*", prevalece: expect.arrayContaining(["read"]) });
    expect(fila.celdas.find(c => c.sujeto === "external_directory")).toMatchObject({ efecto: null, prevalece: null, motivo: "eje-parcialmente-observado" });
    expect(r.valor.matriz.filas.find(f => f.agente === "compaction")!.celdas.find(c => c.sujeto === "read")!.efecto).toBe("ask");
    expect(r.valor.matriz.filas.find(f => f.agente === "oculto")!.oculto).toBe(true);
    const roto = r.valor.matriz.filas.find(f => f.agente === "roto")!;
    expect(roto.error?.codigo).toBe("cadena-incompleta");
    expect(roto.celdas.every(c => c.efecto === null && c.prevalece === null)).toBe(true);
    expect(r.valor.matriz.filas.some(f => f.agente === "apagado")).toBe(false);
    expect(JSON.stringify(r)).not.toContain("MARCA-T513-SECRETA");
    expect(consultarReglas(e.deps, { proyecto: e.proyecto, agente: "roto" })).toMatchObject({ exito: false, error: { codigo: "cadena-incompleta" } });
    expect(consultarReglas(e.deps, { proyecto: e.proyecto, agente: "build", lanzadoPor: "ausente" })).toMatchObject({ exito: false, error: { codigo: "agente-inexistente" } });
  });
  test("declara Markdown no observado y listado incompleto; sin agentes activos falla visiblemente", () => {
    const e = preparar("v1-vias");
    mkdirSync(join(e.proyecto, ".opencode/agents"), { recursive: true });
    writeFileSync(join(e.proyecto, ".opencode/agents/no-observado.md"), "# Agente Markdown");
    const r = consultarReglas(e.deps, { proyecto: e.proyecto, agente: "build" });
    if (!r.exito) throw new Error(r.error.mensaje);
    expect(r.valor.matriz.noObservados.length).toBeGreaterThan(0);
    expect(r.valor.matriz.motivos).toContain("markdown-no-observado");
    const a = prepararAnalisis(e.deps, e.proyecto);
    if (!a.exito) throw new Error(a.error.mensaje);
    const nombres = adaptadorGenerico.listarAgentes(a.valor.resolucion, a.valor.contexto).agentes.map(a => a.nombre);
    writeFileSync(join(e.proyecto, "opencode.json"), JSON.stringify({ agent: Object.fromEntries(nombres.map(n => [n, { disable: true }])) }));
    expect(consultarReglas(e.deps, { proyecto: e.proyecto, agente: "build" })).toMatchObject({ exito: false, error: { codigo: "agente-inexistente" } });
  });
});

describe("T5-13 R-5", () => {
  for (const nombre of ["v1-precedencia", "v1-vias", "v2-fusion-permisos", "v2-cadena", "v2-decision", "v2-subagente"]) {
    test(`cadena completa contra referencia nativa y sensibilidad: ${nombre}`, () => {
      const e = preparar(nombre);
      const hogar = join(realpathSync.native(e.raiz), e.referencia.procedencia.hogar);
      const normalizar = (valor: unknown) => normalizarRutas(valor, { hogar, data: join(hogar, "opencode"), tmp: join(hogar, "tmp/opencode"),
        "hogar-relativo-raiz": marcadorRelativoRaiz(e.proyecto, hogar) });
      for (const [agente, esperada] of Object.entries(e.referencia.cadenas)) {
        const r = consultarReglas(e.deps, { proyecto: e.proyecto, agente });
        if (!r.exito) throw new Error(r.error.mensaje);
        const reglas = r.valor.cadena.map(r => ({ permission: r.sujeto, pattern: r.patron, action: r.efecto }));
        expect(normalizar(reglas)).toEqual(esperada);
        expect(r.valor.cadena.map(r => r.indice)).toEqual(reglas.map((_, i) => i + 1));
        const mutada = structuredClone(reglas);
        [mutada[0], mutada[1]] = [mutada[1]!, mutada[0]!];
        expect(normalizar(mutada)).not.toEqual(esperada);
      }
    });
  }
});

describe("T5-13 R-2", () => {
  test("esquema 2 completo, indices desde uno y rechazo de campos o efectos invalidos", async () => {
    const e = preparar();
    const r = consultarReglas(e.deps, { proyecto: e.proyecto, agente: "build", lanzadoPor: "general" });
    if (!r.exito) throw new Error(r.error.mensaje);
    const esquema = await Bun.file(new URL("../../esquemas/salida/reglas.json", import.meta.url)).json();
    expect(validarEsquema(esquema, r.valor)).toEqual([]);
    expect(validarEsquema(esquema, { ...r.valor, esquema: 3 }).length).toBeGreaterThan(0);
    expect(validarEsquema(esquema, { ...r.valor, inesperado: true }).length).toBeGreaterThan(0);
    const invalida = structuredClone(r.valor);
    Object.assign(invalida.cadena[0]!, { indice: 0 });
    expect(validarEsquema(esquema, invalida).length).toBeGreaterThan(0);
    Object.assign(invalida.cadena[0]!, { indice: 1, efecto: 7 });
    expect(validarEsquema(esquema, invalida).length).toBeGreaterThan(0);
  });
});
