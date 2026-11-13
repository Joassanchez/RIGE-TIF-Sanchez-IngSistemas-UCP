import { describe, expect, test } from "bun:test";
import { ejecutarCli, type CasosUsoCli, type CanalesCli } from "./ejecutar";
import { subcomandos } from "./subcomandos";
import { versionRige } from "../../aplicacion/respuestas/estado";

const no = (): never => { throw new Error("No consultar"); };
const casos: CasosUsoCli = { compararResoluciones: no, consultarProyectosRecientes: no, consultarReglas: no,
  consultarValores: no, consultarPermiso: no, consultarAgentes: no, consultarEntradas: no, consultarHallazgos: no,
  prepararAlmacen: () => ({ exito: true, valor: { esquema: 2, versionRige, almacen: { ruta: "/datos/rige.db", versionEsquema: 2 } } }),
  consultarEstado: no, describirAlmacen: () => ({ exito: true, valor: { esquema: 2, versionRige, almacen: { ruta: "/datos/rige.db", existe: true, versionEsquema: 2 } } }), iniciarServidor: no };

test("T5-26 U-9 reglas JSON ignora explicar igual que todo", () => {
  const solicitudes: unknown[] = [];
  const dobles: CasosUsoCli = { ...casos, consultarReglas: solicitud => { solicitudes.push(solicitud); return { exito: true, valor: {
    esquema: 2, proyecto: "/p", agente: "build", entradas: [], resumenEntradas: "", declaraciones: [], reglas: {}, cadena: [], ejesParciales: [], advertencias: [],
    matriz: { sujetos: [], filas: [], noObservados: [], motivos: [] },
  } }; } };
  const args = ["reglas", "--agente", "build", "--json"];
  const sin = ejecutar(args, {}, dobles);
  for (const opciones of [["--explicar"], ["--todo"], ["--explicar", "--todo"]]) expect(ejecutar([...args, ...opciones], {}, dobles)).toEqual(sin);
  expect(sin.codigo).toBe(0); expect(solicitudes).toHaveLength(4);
  for (const solicitud of solicitudes) expect(solicitud).toEqual({ proyecto: "/carpeta actual/proyecto", agente: "build", lanzadoPor: undefined });
});
function ejecutar(args: string[], presentacion: Partial<CanalesCli> = {}, dobles = casos) {
  let salida = "", error = "", llamadas = 0;
  const codigo = ejecutarCli(args, () => { llamadas++; return dobles; }, {
    versionHerramienta: "1.18.25", esConsola: false, carpetaActual: "/carpeta actual/proyecto", ...presentacion,
    escribirSalida: t => { salida += t; }, escribirError: t => { error += t; },
  });
  return { salida, error, codigo, llamadas };
}
describe("T5-23 L-1 L-5 formato inyectado", () => {
  test("consola estricta, opciones explicitas, pipe sin ANSI y minimo de ancho", () => {
    expect(ejecutar(["esquema"]).salida).toStartWith('{"esquema":2');
    expect(ejecutar(["esquema"], { esConsola: true }).salida).toContain("Respuesta completa: --json");
    expect(ejecutar(["estado"], { esConsola: true }).salida).not.toContain("Respuesta completa: --json");
    expect(ejecutar(["esquema", "--json"], { esConsola: true }).salida).toBe(ejecutar(["esquema"]).salida);
    for (const ancho of [undefined, 1, 40, 70]) {
      const texto = ejecutar(["esquema", "--texto"], { ancho }).salida;
      expect(texto).toContain("rige.db"); expect(texto).not.toContain("\x1b");
      for (const linea of texto.trimEnd().split("\n")) expect(Array.from(linea).length).toBeLessThanOrEqual(Math.max(40, ancho ?? 100));
    }
    expect(ejecutar(["esquema", "--texto"], { colorHabilitado: true }).salida).toContain("\x1b[90m");
    expect(ejecutar(["esquema"], { esConsola: true, colorHabilitado: false }).salida).not.toContain("\x1b");
    expect(ejecutar(["esquema"], { esConsola: true, colorHabilitado: true }).salida).toContain("\x1b[90m");
  });
});
describe("T5-23 L-6 L-7 precedencia", () => {
  const tabla = [
    { args: [], consola: false, canal: "error", texto: false, codigo: 2 },
    { args: [], consola: true, canal: "error", texto: true, codigo: 2 },
    { args: ["--help", "--invalida"], canal: "salida", texto: true, codigo: 0 },
    { args: ["valores", "--help", "--invalida"], canal: "salida", texto: true, codigo: 0 },
    { args: ["--texto", "--desconocida"], canal: "error", texto: true, codigo: 2 },
    { args: ["--json", "--texto"], canal: "error", texto: false, codigo: 2 },
    { args: ["otro"], canal: "error", texto: false, codigo: 2 },
    { args: ["--version"], canal: "salida", texto: true, codigo: 0 },
  ] as const;
  for (const fila of tabla) test(JSON.stringify(fila.args) + ("consola" in fila ? String(fila.consola) : ""), () => {
    const r = ejecutar([...fila.args], { esConsola: "consola" in fila && fila.consola });
    expect(r.codigo).toBe(fila.codigo); expect(r.llamadas).toBe(0);
    expect(r[fila.canal]).not.toBe("");
    expect(r[fila.canal === "error" ? "salida" : "error"]).toBe("");
    if (fila.texto) expect(r[fila.canal]).not.toStartWith("{");
    else expect(JSON.parse(r[fila.canal]).esquema).toBe(2);
  });
  test("ayuda general y dos ejemplos por comando, version reutilizada sin ensamblar", () => {
    for (const comando of ["valores", "permiso", "reglas", "agentes", "entradas", "hallazgos", "recientes", "comparar", "estado", "esquema", "servir"]) {
      const r = ejecutar([comando, "--help"]);
      expect(r.codigo).toBe(0); expect(r.llamadas).toBe(0);
      for (const seccion of ["Uso:", "Opciones generales:", "Ejemplos:"]) expect(r.salida).toContain(seccion);
      expect(r.salida.match(/\n  rige /g)).toHaveLength(2);
    }
    expect(ejecutar(["-h"]).salida).toContain("Uso:");
    expect(ejecutar(["--version"]).salida).toBe(`RIGE ${versionRige} · OpenCode 1.18.25\n`);
    expect(ejecutar(["--version", "--json"]).salida).toBe(JSON.stringify({ esquema: 2, versionRige, versionHerramienta: "1.18.25" }) + "\n");
  });
  test("texto conserva codigo, sugerencia y stack solo con depurar", () => {
    const almacen = { ...casos, describirAlmacen: () => ({ exito: false as const,
      error: { categoria: "uso" as const, codigo: "almacen-sin-esquema", mensaje: "Falta el almacén." } }) };
    const r = ejecutar(["estado", "--texto"], {}, almacen);
    expect(r.codigo).toBe(1); expect(r.error).toContain("Error: Falta el almacén.");
    expect(r.error).toContain("Probá: bun run rige -- esquema");
    for (const depurar of [[], ["--depurar"]]) {
      const fallo = ejecutar(["estado", "--texto", ...depurar], {}, { ...casos, describirAlmacen: no });
      expect(fallo.codigo).toBe(70); expect(fallo.error.includes("No consultar")).toBe(depurar.length > 0);
    }
  });
});
test("T5-23 L-9 carpeta actual inyectada; --proyecto vacio sigue siendo invalido", () => {
  const proyectos: string[] = [];
  const dobles = { ...casos, consultarValores: (proyecto: string) => { proyectos.push(proyecto); return { exito: false as const,
    error: { categoria: "uso" as const, codigo: "prueba", mensaje: "Registrado" } }; } };
  expect(ejecutar(["valores", "--agente", "build"], {}, dobles).codigo).toBe(1);
  expect(proyectos).toEqual(["/carpeta actual/proyecto"]);
  expect(ejecutar(["valores", "--agente", "build", "--proyecto", ""], {}, dobles).codigo).toBe(2);
});

describe("T6-11 ayuda descubrible y termino analisis", () => {
  test("A-1: todo subcomando tiene resumen y aparece en un grupo en --help", () => {
    const general = ejecutar(["--help"]).salida;
    expect(general).toContain("Qué configuración rige en OpenCode 1.18.25 y de dónde viene.");
    expect(general).toContain("Empezá por: rige agentes");
    for (const grupo of ["Consultar:", "Historial:", "Almacén y servidor:"]) {
      expect(general).toContain(grupo);
    }
    for (const sub of subcomandos) {
      expect(sub.resumen.trim().length).toBeGreaterThan(0);
      expect(general).toContain(sub.nombre);
      expect(general).toContain(sub.resumen);
    }
  });

  test("A-2: valores --help muestra opciones propias primero, generales despues y --agente obligatoria", () => {
    const salida = ejecutar(["valores", "--help"]).salida;
    const posPropias = salida.indexOf("Opciones de valores:");
    const posGenerales = salida.indexOf("Opciones generales:");
    expect(posPropias).toBeGreaterThan(-1);
    expect(posGenerales).toBeGreaterThan(posPropias);
    expect(salida).toContain("--agente <nombre>");
    expect(salida).toContain("(obligatoria)");
    expect(salida).not.toContain("filtra solo el texto");
    expect(salida).toContain("stderr");
  });

  test("A-3 y A-4: comparar --help explica ids, y error de resolucion traduce en texto sin tocar JSON", () => {
    const ayudaComparar = ejecutar(["comparar", "--help"]).salida;
    expect(ayudaComparar).toContain("rige recientes");
    expect(ayudaComparar).toContain("filtra solo el texto");

    const errorResolucion = { ...casos, compararResoluciones: () => ({
      exito: false as const,
      error: { categoria: "uso" as const, codigo: "resolucion-inexistente", mensaje: "No existe la resolución 99 en el almacén." },
    }) };
    const enTexto = ejecutar(["comparar", "--desde", "1", "--hasta", "99", "--texto"], {}, errorResolucion);
    expect(enTexto.codigo).toBe(1);
    expect(enTexto.error).toContain("No existe el análisis 99 en el almacén.");
    expect(enTexto.error).not.toContain("resolución");

    const enJson = ejecutar(["comparar", "--desde", "1", "--hasta", "99", "--json"], {}, errorResolucion);
    expect(enJson.codigo).toBe(1);
    expect(JSON.parse(enJson.error)).toEqual({
      esquema: 2,
      error: { codigo: "resolucion-inexistente", mensaje: "No existe la resolución 99 en el almacén." },
    });
  });
});

describe("T6-12 errores accionables en texto y preservacion JSON", () => {
  test("E-1 y E-2: parseArgs nombra opcion desconocida o faltante de valor en texto, sin tocar JSON", () => {
    const desconocida = ejecutar(["valores", "--agent", "build", "--texto"]);
    expect(desconocida.codigo).toBe(2);
    expect(desconocida.error).toContain("Opción desconocida: --agent.");
    expect(desconocida.error).toContain("¿Quisiste decir --agente?");
    expect(desconocida.error).toContain("Probá: rige valores --help");

    const desconocidaJson = ejecutar(["valores", "--agent", "build", "--json"]);
    expect(desconocidaJson.codigo).toBe(2);
    expect(JSON.parse(desconocidaJson.error).error.mensaje).toBe("Argumentos inválidos: valores --agent build --json.");

    const faltaValor = ejecutar(["valores", "--agente", "--texto"]);
    expect(faltaValor.codigo).toBe(2);
    expect(faltaValor.error).toContain("Falta el valor de --agente.");
    expect(faltaValor.error).toContain("Probá: rige valores --help");
  });

  test("E-3: interpretar devuelve la primera causa concreta en texto, sin tocar JSON", () => {
    const faltaObjetivo = ejecutar(["permiso", "--sujeto", "read", "--texto"]);
    expect(faltaObjetivo.codigo).toBe(2);
    expect(faltaObjetivo.error).toContain("Falta --objetivo.");
    expect(faltaObjetivo.error).toContain("Probá: rige permiso --help");

    const excluyentes = ejecutar(["permiso", "--agente", "build", "--sujeto", "read", "--herramienta", "bash", "--objetivo", "a.ts", "--texto"]);
    expect(excluyentes.codigo).toBe(2);
    expect(excluyentes.error).toContain("--sujeto y --herramienta son excluyentes.");
    expect(excluyentes.error).toContain("Probá: rige permiso --help");

    const excluyentesJson = ejecutar(["permiso", "--agente", "build", "--sujeto", "read", "--herramienta", "bash", "--objetivo", "a.ts", "--json"]);
    expect(excluyentesJson.codigo).toBe(2);
    expect(JSON.parse(excluyentesJson.error).error.mensaje).toContain("permiso requiere --agente, --objetivo");
  });

  test("E-4 y clave inexistente: mensajes accionables en texto sin sugerencias de agentes/claves", () => {
    const sinAgente = { ...casos, consultarValores: () => ({
      exito: false as const,
      error: { categoria: "uso" as const, codigo: "agente-sin-declaraciones", mensaje: "El agente nadie no tiene declaraciones." },
    }) };
    const rTexto = ejecutar(["valores", "--agente", "nadie", "--texto"], {}, sinAgente);
    expect(rTexto.codigo).toBe(1);
    expect(rTexto.error).toContain('No existe el agente "nadie".');
    expect(rTexto.error).toContain("Probá: rige agentes");

    const rJson = ejecutar(["valores", "--agente", "nadie", "--json"], {}, sinAgente);
    expect(rJson.codigo).toBe(1);
    expect(JSON.parse(rJson.error).error).toEqual({ codigo: "agente-sin-declaraciones", mensaje: "El agente nadie no tiene declaraciones." });

    const sinClave = { ...casos, consultarValores: () => ({
      exito: true as const,
      valor: {
        esquema: 2 as const, versionRige, proyecto: "/p", herramienta: "opencode", versionHerramienta: "1.18.25",
        resumenEntradas: "abc", entradas: [], agente: "build", ruta: ["noexiste"], valores: [], reglas: {},
        declaraciones: [], noResueltas: [], motivo: "clave-inexistente" as const,
      },
    }) };
    const rClave = ejecutar(["valores", "--agente", "build", "--clave", "noexiste", "--texto"], {}, sinClave);
    expect(rClave.codigo).toBe(0);
    expect(rClave.salida).toContain('build no tiene la clave "noexiste". Probá: rige valores --agente build');
    expect(rClave.salida).not.toContain("CLAVE");
  });

  test("comparar --agente inexistente avisa en texto", () => {
    const resumen = { cambiadas: 0, agregadas: 0, quitadas: 0, sinCambio: 1 };
    const comparar: CasosUsoCli = { ...casos, compararResoluciones: () => ({
      exito: true,
      valor: {
        esquema: 2, proyecto: "/p", parcial: false,
        sustituciones: "solo-representacion-protegida",
        desde: { id: 1, instante: "2026-11-01T00:00:00.000Z", entradas: [], resumenEntradas: "", noComparables: [], motivosAgentes: [], reglas: {} },
        hasta: { id: 2, instante: "2026-11-01T00:00:01.000Z", entradas: [], resumenEntradas: "", noComparables: [], motivosAgentes: [], reglas: {} },
        agentes: { agregados: [], quitados: [], comunes: ["build"], inciertos: [] },
        comparaciones: [{ agente: "build", cambios: [], resumen }],
        resumen,
      },
    }) };
    const r = ejecutar(["comparar", "--desde", "1", "--hasta", "2", "--agente", "nadie", "--texto"], {}, comparar);
    expect(r.codigo).toBe(0);
    expect(r.salida).toContain('el agente "nadie" no aparece en esta comparación.');
    expect(r.salida).toContain("Agentes: build.");
  });

  test("E-5, E-6, E-7 y navegacion: pistas unicas, estado en ayuda, help/-v/-V, valroes --help y entrada-ilegible", () => {
    const almacen = { ...casos, describirAlmacen: () => ({
      exito: false as const,
      error: { categoria: "uso" as const, codigo: "almacen-sin-esquema", mensaje: "El almacén no tiene el esquema esperado. Ejecute bun run esquema." },
    }) };
    const rAlmacen = ejecutar(["estado", "--texto"], {}, almacen);
    expect(rAlmacen.codigo).toBe(1);
    expect(rAlmacen.error).not.toContain("Ejecute bun run esquema.");
    expect(rAlmacen.error).toContain("Probá: bun run rige -- esquema");

    const sinSub = ejecutar(["--texto"]);
    expect(sinSub.codigo).toBe(2);
    expect(sinSub.error).toContain("estado");

    const valroesHelp = ejecutar(["valroes", "--help", "--texto"]);
    expect(valroesHelp.codigo).toBe(2);
    expect(valroesHelp.error).toContain("Subcomando desconocido: valroes.");
    expect(valroesHelp.error).toContain("¿Quisiste decir valores?");
    const valroesHelpJson = ejecutar(["valroes", "--help"]);
    expect(valroesHelpJson.codigo).toBe(2);
    expect(JSON.parse(valroesHelpJson.error).error.mensaje).toBe("Subcomando desconocido: valroes.");

    expect(ejecutar(["help"]).salida).toBe(ejecutar(["--help"]).salida);
    expect(ejecutar(["help", "valores"]).salida).toBe(ejecutar(["valores", "--help"]).salida);
    expect(ejecutar(["-v"]).salida).toBe(ejecutar(["--version"]).salida);
    expect(ejecutar(["-V"]).salida).toBe(ejecutar(["--version"]).salida);

    const ilegible = { ...casos, consultarValores: () => ({
      exito: false as const,
      error: { categoria: "uso" as const, codigo: "entrada-ilegible", mensaje: "La entrada opencode.jsonc no se puede leer (1:1)." },
    }) };
    const rIlegible = ejecutar(["valores", "--agente", "build", "--texto"], {}, ilegible);
    expect(rIlegible.codigo).toBe(1);
    expect(rIlegible.error).toContain("Probá: rige hallazgos");
  });
});
