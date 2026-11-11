import { expect, test } from "bun:test";
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { prepararConsultas } from "../utilidades/consultas-cli";
import { lanzar } from "../utilidades/subproceso";
import { crearEntornoAislado } from "../utilidades/entorno-aislado";
import { AlmacenSqlite } from "../../paquetes/rige/adaptadores/almacen-sqlite/esquema";
import { RepositorioResolucionesSqlite } from "../../paquetes/rige/adaptadores/almacen-sqlite/resoluciones";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";
import { resolverProyecto } from "../../paquetes/rige/aplicacion/casos-uso/resolver-proyecto";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { versionRige } from "../../paquetes/rige/aplicacion/respuestas/estado";
import type { RespuestaPermiso, RespuestaValores } from "../../paquetes/rige/aplicacion/respuestas/contrato-generado";

type Escenario = ReturnType<typeof prepararConsultas>;
function escenario(probar: (e: Escenario) => void, nombre = "v2-cadena") {
  const e = prepararConsultas(nombre);
  try { probar(e); } finally { e.borrar(); }
}
function texto(e: Escenario, comando: string, args: string[] = []) {
  const r = e.consultar(comando, [...args, "--texto"]);
  expect(r.codigo, r.error).toBe(0);
  expect(r.salida).not.toContain("\x1b");
  return r.salida;
}
const consulta = ["--agente", "build", "--sujeto", "read", "--objetivo", ".env", "--explicar"];
function sembrar(e: Escenario) {
  e.variables.TZ = "America/Argentina/Buenos_Aires";
  const almacen = e.variables.RIGE_ALMACEN!;
  expect(new AlmacenSqlite(almacen, { existe: existsSync }).preparar().exito).toBe(true);
  const entorno = new EntornoLecturaSistema({ entorno: { ...crearEntornoAislado(e.raiz, process.env), ...e.variables }, plataforma: process.platform });
  const resoluciones = new RepositorioResolucionesSqlite(almacen, { existe: existsSync }, versionRige);
  const fechas = ["2020-01-02T14:14:00.000Z", "2020-01-03T21:05:00.000Z"];
  for (const [i, temperature] of [0.3, 0.7].entries()) {
    writeFileSync(join(e.proyecto, "opencode.json"), JSON.stringify({ agent: { build: { temperature } } }));
    expect(resolverProyecto({ adaptador: adaptadorOpenCode, entorno, rutas: entorno, resoluciones,
      reloj: { ahora: () => fechas[i]! } }, e.proyecto)).toEqual({ exito: true, valor: { id: i + 1 } });
  }
}

test("T5-24 X-1 referencias desde 1 coherentes con la explicacion", () => escenario(e => {
  writeFileSync(join(e.proyecto, "opencode.json"), '{"permission":{"read":"allow"}}');
  const json = JSON.parse(e.consultar("permiso", consulta).salida) as RespuestaPermiso;
  const t = texto(e, "permiso", consulta);
  const numero = json.determinante! + 1;
  expect(json.explicacion!.join(" ")).toContain(`regla ${numero}`);
  expect(t).toContain(`Decide: #${numero} `);
  expect(json.nativaAnulada).not.toBeNull();
  expect(t).toContain(`Protección nativa anulada: #${json.nativaAnulada!.regla + 1} por #${json.nativaAnulada!.por + 1}`);
}));

test("T5-24 X-2 avisos generales solo con explicar y advertencias propias siempre", () => escenario(e => {
  for (const [comando, args] of [["permiso", consulta.slice(0, -1)], ["reglas", ["--agente", "build"]]] as const) {
    const breve = texto(e, comando, [...args]);
    const completo = texto(e, comando, [...args, "--explicar"]);
    for (const limite of ["aprobaciones permanentes", "opencode run no interactivo", "Los índices no cuentan"]) {
      expect(breve).not.toContain(limite); expect(completo).toContain(limite);
    }
  }
  expect(texto(e, "permiso", ["--agente", "build", "--herramienta", "bash", "--objetivo", "ls | cat"])).toContain("Comando compuesto");
  writeFileSync(join(e.proyecto, "opencode.json"), '{"permission":{"read":"allow"}}');
  expect(texto(e, "permiso", consulta.slice(0, -1))).toContain("Protección nativa anulada");
}));

test("T5-24 X-3 rutas y palabras largas permanecen enteras en parrafos", () => escenario(e => {
  const raiz = realpathSync.native(e.raiz);
  const ruta = join(raiz, "almacen-" + "largo".repeat(Math.max(1, Math.ceil((110 - raiz.length) / 5))));
  const env = { ...e.variables, RIGE_ALMACEN: ruta };
  expect(lanzar(e.raiz, ["esquema"], env).codigo).toBe(0);
  const estado = lanzar(e.raiz, ["estado", "--texto"], env);
  expect(estado.salida).toContain(join(ruta, "rige.db").replaceAll("\\", "/") + "\n");
  const palabra = "objetivo".repeat(20);
  expect(texto(e, "permiso", ["--agente", "build", "--sujeto", "read", "--objetivo", palabra, "--explicar"])).toContain(palabra);
  const proyecto = join(e.proyecto, "con espacios" + "x".repeat(Math.max(0, 110 - e.proyecto.length)));
  mkdirSync(proyecto);
  const archivo = join(proyecto, "opencode.json");
  writeFileSync(archivo, '{"permission":{"read":"allow"}}');
  const explicacion = lanzar(e.raiz, ["permiso", "--proyecto", proyecto, ...consulta, "--texto"], e.variables);
  expect(explicacion.codigo, explicacion.error).toBe(0);
  expect(explicacion.salida).toContain(realpathSync.native(archivo).replaceAll("\\", "/"));
}));

test("T5-24 X-4 tablas alineadas con espacios, guiones y nombres completos", () => escenario(e => {
  const nombre = "agente_" + "nombre".repeat(18);
  writeFileSync(join(e.proyecto, "opencode.json"), JSON.stringify({ agent: { [nombre]: { description: "Descripción" } } }));
  const t = texto(e, "agentes");
  const lineas = t.split("\n");
  const cabecera = lineas.findIndex(l => l.startsWith("AGENTE"));
  expect(lineas[cabecera]).toMatch(/^AGENTE\s{2,}ORIGEN\s{2,}MODO/);
  expect(lineas[cabecera + 1]).toMatch(/^-+\s{2,}-+\s{2,}-+/);
  expect(lineas.find(l => l.startsWith(nombre))).toBeDefined();
  expect(t).not.toContain(" · ");
}));

test("T5-24 X-5 modos en español y oculto como marca de fila", () => escenario(e => {
  writeFileSync(join(e.proyecto, "opencode.json"), JSON.stringify({ agent: {
    principal: { mode: "primary" }, auxiliar: { mode: "subagent", hidden: true }, ambos: { mode: "all" } } }));
  const t = texto(e, "agentes");
  for (const modo of ["Principal", "Subagente", "Ambos", "oculto"]) expect(t).toContain(modo);
  expect(t).not.toMatch(/OCULTO|primary|subagent|\s+sí\s*/);
}));

test("T5-24 X-6 fechas locales legibles en recientes y comparar", () => escenario(e => {
  sembrar(e);
  const recientes = lanzar(e.raiz, ["recientes", "--texto"], e.variables);
  expect(recientes.codigo).toBe(0); expect(recientes.salida).toContain("03/01/2020 18:05");
  const comparacion = lanzar(e.raiz, ["comparar", "--desde", "1", "--hasta", "2", "--texto"], e.variables);
  expect(comparacion.codigo).toBe(0); expect(comparacion.salida).toContain("02/01/2020 11:14");
  expect(comparacion.salida).not.toContain("2020-01-");
}));

test("T5-24 X-7 comparacion compacta con resumen y procedencia", () => escenario(e => {
  sembrar(e);
  const r = lanzar(e.raiz, ["comparar", "--desde", "1", "--hasta", "2", "--texto"], e.variables);
  expect(r.codigo, r.error).toBe(0);
  expect(r.salida).toContain("Proyecto: proyecto\n"); expect(r.salida).not.toContain("carpeta actual");
  expect(r.salida).toContain("Cambios entre 02/01/2020 11:14 y 03/01/2020 18:05");
  expect(r.salida).toMatch(/1 cambiadas.*0 agregadas.*0 quitadas.*\d+ sin cambio/);
  expect(r.salida).toMatch(/Sin cambios en: .*, /);
  expect(r.salida).toMatch(/CLAVE\s+ANTES\s+DESPUÉS\s+LO DETERMINA/);
  expect(r.salida).toContain("opencode.json:");
}));

test("T5-24 X-8 ejes comunes agrupados en lenguaje llano", () => escenario(e => {
  const t = texto(e, "reglas", ["--agente", "build"]);
  expect(t.match(/external_directory: parcial en todos los agentes; no hay decisión sin un objetivo concreto/g)).toHaveLength(1);
  expect(t).not.toContain("eje-parcialmente-observado");
  expect(t).not.toMatch(/\w+\/external_directory:/);
}));

test("T5-24 X-9 procedencia breve nativa y declarada", () => escenario(e => {
  // Y-3: fuerza el ajuste de la procedencia final incluso con un TEMP corto.
  e.variables.XDG_DATA_HOME = join(e.raiz, "datos-" + "largos".repeat(12));
  const t = texto(e, "reglas", ["--agente", "build", "--todo"]);
  for (const origen of ["general", "final"]) expect(t).toContain(`OpenCode · ${origen}`);
  expect(texto(e, "reglas", ["--agente", "plan", "--todo"])).toContain("OpenCode · agente");
  expect(t).toMatch(/opencode.json:\d+:\d+ \(proyecto\)/);
  expect(t).not.toMatch(/nativo: nativa-|\[proyecto\]/);
}));

test("T5-24 X-10 ayuda describe cada opcion propia y conserva comunes y ejemplos", () => escenario(e => {
  for (const [comando, opciones] of Object.entries({ valores: ["agente", "proyecto", "clave", "todo"],
    permiso: ["agente", "proyecto", "sujeto", "herramienta", "objetivo", "lanzado-por", "explicar"],
    reglas: ["agente", "proyecto", "lanzado-por", "todo", "explicar"], agentes: ["proyecto", "explicar"],
    entradas: ["proyecto"], hallazgos: ["proyecto", "explicar"], comparar: ["desde", "hasta", "agente"],
    recientes: [], estado: [], esquema: [], servir: [] })) {
    const r = lanzar(e.raiz, [comando, "--help"], e.variables);
    expect(r.codigo).toBe(0);
    for (const opcion of opciones) expect(r.salida).toMatch(new RegExp(`\\n  --${opcion}(?: <[^>]+>)?  +[^\\n]+`));
    expect(r.salida).not.toContain("Las opciones específicas figuran en Uso");
    expect(r.salida).toContain("--json, --texto"); expect(r.salida.match(/\n  rige /g)).toHaveLength(2);
  }
}));

test("T5-24 X-11 valores separa determinante y anterior; todo expande desplazadas", () => escenario(e => {
  const args = ["--agente", "build", "--clave", "temperature"];
  const json = JSON.parse(e.consultar("valores", args).salida) as RespuestaValores;
  const t = texto(e, "valores", args);
  expect(t).toMatch(/CLAVE\s+VALOR\s+ANTES\s+LO DETERMINA/);
  expect(t).not.toContain("(desplaza:");
  const desplazadas = json.valores[0]!.rastro.desplazadas;
  expect(desplazadas.length).toBeGreaterThan(1);
  expect(t.split("\n").find(l => l.startsWith("temperature"))).toContain(String(desplazadas.at(-1)!.valor));
  const todo = texto(e, "valores", [...args, "--todo"]);
  expect(todo).toContain("Desplazadas de temperature:");
  expect(todo).toContain(String(desplazadas[0]!.valor));
}, "v1-precedencia"));

test("T5-24 X-12 documentacion con ejemplos de salida actualizados", () => {
  for (const archivo of ["README.md", "MANUAL.md"]) {
    const t = readFileSync(resolve(import.meta.dir, "../..", archivo), "utf8");
    expect(/CLAVE  +VALOR/.test(t)).toBe(true);
    for (const ejemplo of ["ANTES", "LO DETERMINA", "Decide: #", "OpenCode · general", "Sin cambios en:", "external_directory: parcial en todos los agentes", "reglas --agente build --explicar"]) expect(t.includes(ejemplo), `${archivo}: ${ejemplo}`).toBe(true);
  }
});
