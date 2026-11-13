import { expect, test } from "bun:test";
import { posix, win32 } from "node:path";
import { adaptadorOpenCode } from "../../../opencode/adaptador";
import { crearEntornoMemoria } from "../../../../pruebas/utilidades/entorno-memoria";
import { resolver } from "../../../../pruebas/utilidades/resolver";
import { prepararAnalisis } from "./analizar-proyecto";
import { consultarPermiso } from "./consultar-permiso";
import { consultarAgentes } from "./consultar-agentes";
import { consultarReglas } from "./consultar-reglas";
import { EntornoLecturaSistema } from "../../adaptadores/sistema/entorno-lectura";

test("T2-17 Z-3 consulta win32 guardada conserva rutas y decision en linux", () => {
  const entorno = crearEntornoMemoria({ archivos: {}, directorios: ["/p"], variables: { HOME: "/h" } });
  const original = resolver(adaptadorOpenCode, "/p", entorno);
  if (!original.exito) throw new Error(original.error.mensaje);
  const proyecto = "C:/p";
  const resolucion = { ...original.valor, proyecto, contexto: { ...original.valor.contexto, proyecto,
    plataforma: "win32", parametros: { hogar: "C:/h", config: "C:/config", data: "C:/data", tmp: "C:/tmp", worktree: proyecto } } };
  const rutas = { canonica: () => { throw new Error("Sin E/S"); } };
  // Simula tambien las operaciones actuales de Linux cuando el test corre en Windows.
  const actual = Object.assign(new EntornoLecturaSistema({ plataforma: "linux", entorno: {} }), {
    unir: posix.join, relativa: posix.relative, padre: posix.dirname, esAbsoluta: posix.isAbsolute,
  });
  const deps = { adaptador: adaptadorOpenCode, entorno: actual, rutas, resolucion };
  const preparada = prepararAnalisis(deps, proyecto);
  if (!preparada.exito) throw new Error(preparada.error.mensaje);
  const guardado = preparada.valor.contexto.entorno;
  expect(guardado.unir(proyecto, "a", "..", "b")).toBe(win32.join(proyecto, "a", "..", "b"));
  expect(guardado.relativa(proyecto, "C:/p/src/a.js")).toBe("src\\a.js");
  expect(guardado.padre("C:/p/src/a.js")).toBe("C:/p/src");
  expect(guardado.esAbsoluta("C:/p")).toBe(true);
  const solicitud = { proyecto, agente: "plan", herramienta: "edit", objetivo: ".opencode/plans/x.md" } as const;
  const windows = { ...entorno, plataforma: "win32", unir: win32.join, relativa: win32.relative,
    padre: win32.dirname, esAbsoluta: win32.isAbsolute };
  const esperada = consultarPermiso({ ...deps, entorno: windows }, solicitud);
  expect(esperada).toMatchObject({ exito: true, valor: { decision: "allow" } });
  expect(consultarPermiso(deps, solicitud)).toEqual(esperada);
});

test("T6-18 Q-1 resolucion guardada con parametros.hogar ausente o contexto invalido falla visiblemente", () => {
  const entorno = crearEntornoMemoria({ archivos: {}, directorios: ["/p"], variables: { HOME: "/h" } });
  const original = resolver(adaptadorOpenCode, "/p", entorno);
  if (!original.exito) throw new Error(original.error.mensaje);
  const rutas = { canonica: () => { throw new Error("Sin E/S"); } };
  const { hogar: _, ...sinHogar } = original.valor.contexto.parametros;
  const sinHogarResolucion = {
    ...original.valor,
    contexto: { ...original.valor.contexto, parametros: sinHogar },
  };
  const sinPlataformaResolucion = {
    ...original.valor,
    contexto: { ...original.valor.contexto, plataforma: "" },
  };
  for (const resolucion of [sinHogarResolucion, sinPlataformaResolucion]) {
    const deps = { adaptador: adaptadorOpenCode, entorno, rutas, resolucion };
    expect(prepararAnalisis(deps, "/p")).toMatchObject({ exito: false, error: { codigo: "almacen-sin-esquema" } });
    expect(consultarPermiso(deps, { proyecto: "/p", agente: "build", sujeto: "read", objetivo: "a" }))
      .toMatchObject({ exito: false, error: { codigo: "almacen-sin-esquema" } });
    expect(consultarAgentes(deps, "/p")).toMatchObject({ exito: false, error: { codigo: "almacen-sin-esquema" } });
    expect(consultarReglas(deps, { proyecto: "/p", agente: "build" }))
      .toMatchObject({ exito: false, error: { codigo: "almacen-sin-esquema" } });
  }
});
