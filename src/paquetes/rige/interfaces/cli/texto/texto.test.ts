import { expect, test } from "bun:test";
import { renderizarValores, renderizarPermiso, renderizarReglas, renderizarHallazgos, renderizarComparacion, type ContextoPresentacion } from "./index";
import type { RespuestaValores, RespuestaPermiso, RespuestaReglas, RespuestaHallazgos, RespuestaComparacion } from "../../../aplicacion/respuestas/contrato-generado";
import { versionRige } from "../../../aplicacion/respuestas/estado";
import { paginaComparacion } from "../../web/paginas/comparacion";
import * as textoCli from "./index";

const contexto: ContextoPresentacion = { formato: "texto", ancho: 100, esConsola: false, colorHabilitado: false, todo: false, proyectoDesdeCarpetaActual: true };
const base = { esquema: 2 as const, proyecto: "/temporal/mi proyecto", entradas: [], resumenEntradas: "", declaraciones: [], reglas: {} };

test("T5-26 U-12 las tablas partidas conservan marcas en cada bloque angosto", () => {
  const bloques = textoCli.tabla(["agente", "a", "b", "c", "d", "e"], [["aux", "1", "2", "3", "4", "5"]], { ...contexto, ancho: 40 }, false, ["oculto"]);
  const filas = bloques.filter(l => typeof l !== "string" && l.tabla.startsWith("aux"));
  expect(filas).toHaveLength(2);
  for (const fila of filas) expect(typeof fila === "string" ? fila : fila.tabla).toContain("oculto");
  expect(textoCli.renderizarAgentes({ ...base, agentes: [{ nombre: "aux", modo: "all", origen: "nativo", oculto: true }], eliminados: [], incompleta: false, motivos: [] }, { ...contexto, ancho: 40 })).toContain("oculto");
});

test("T5-26 U-13 entradas usa etiquetas y muestra revisados solo con todo", () => {
  const r = { ...base, vias: ["presente", "ausente", "no_observada", "no_soportada"].map(estado => ({ via: estado, estado, cantidad: 0, revisados: ["/temporal/lugar revisado"] })) };
  const breve = textoCli.renderizarEntradas(r as Parameters<typeof textoCli.renderizarEntradas>[0], contexto);
  for (const etiqueta of ["presente", "ausente", "no observada", "no soportada"]) expect(breve).toContain(`: ${etiqueta} (0)`);
  expect(breve).not.toContain("/temporal/lugar revisado");
  expect(textoCli.renderizarEntradas(r as Parameters<typeof textoCli.renderizarEntradas>[0], { ...contexto, todo: true })).toContain("/temporal/lugar revisado");
});
const declaracion = { origen: { tipo: "declarado" as const, orden: 1, posicion: { linea: 3, columna: 7 } },
  via: "proyecto", referencia: "/temporal/mi proyecto/opencode.jsonc", valor: 0.7, regla: "RD-02" };
const valores: RespuestaValores = { ...base, versionRige, herramienta: "prueba", versionHerramienta: "v", agente: "build", ruta: ["temperature"],
  valores: [{ clave: "temperature", rastro: { ruta: ["temperature"], indiceFusion: 0, valor: 0.7, determinante: declaracion,
    motivo: "RD-02", desplazadas: [{ ...declaracion, referencia: "/previa.json" }, { ...declaracion, referencia: "/ultima.json" }] } }],
  noResueltas: [], motivo: null };
test("T5-23 L-4 valores: respuesta filtrada, encabezado, origen y fabrica; X-11 antes y todo", () => {
  const t = renderizarValores(valores, contexto);
  for (const s of ["build", "Proyecto: mi proyecto (carpeta actual)", "CLAVE", "VALOR", "ANTES", "LO DETERMINA", "temperature", "0.7", "opencode.jsonc:3:7", "proyecto"]) expect(t).toContain(s);
  expect(t).not.toContain("previa.json"); expect(t).not.toContain("ultima.json"); expect(t).not.toContain("Modo:");
  for (const s of ["previa.json", "ultima.json"]) expect(renderizarValores(valores, { ...contexto, todo: true })).toContain(s);
  const nativos: RespuestaValores = { ...valores, ruta: null, valores: [{ ...valores.valores[0]!, rastro: { ...valores.valores[0]!.rastro,
    determinante: { ...declaracion, origen: { tipo: "nativo", regla: "fabrica" }, referencia: null, via: null }, desplazadas: [] } }] };
  expect(renderizarValores(nativos, contexto)).toContain("+ 1 valores de fábrica (--todo)");
  expect(renderizarValores(nativos, contexto)).not.toContain("temperature");
  expect(renderizarValores({ ...nativos, ruta: ["temperature"] }, contexto)).toContain("temperature");
  expect(renderizarValores(nativos, { ...contexto, todo: true })).toContain("OpenCode");
  const implicitos: RespuestaValores = { ...nativos, ruta: ["temperature"], valores: [{ ...nativos.valores[0]!, rastro: { ...nativos.valores[0]!.rastro,
    determinante: { ...declaracion, origen: { tipo: "implicito", regla: "implicita" }, via: null, referencia: null } } }] };
  expect(renderizarValores(implicitos, contexto)).toContain("implicito: implicita");
  const sinArchivo: RespuestaValores = { ...valores, valores: [{ ...valores.valores[0]!, rastro: { ...valores.valores[0]!.rastro,
    determinante: { ...declaracion, referencia: null } } }] };
  expect(renderizarValores(sinArchivo, contexto)).toContain("sin archivo:3:7");
  expect(renderizarValores({ ...valores, valores: [], motivo: "clave-inexistente", noResueltas: [{ ruta: ["prompt"], regla: "no-observada" }] }, contexto)).toContain("clave-inexistente");
  expect(renderizarValores({ ...valores, noResueltas: [{ ruta: ["prompt"], regla: "no-observada" }] }, contexto)).toContain("prompt: no-observada");
});
const permiso: RespuestaPermiso = { ...base, agente: "build", consulta: { sujeto: "read", objetivo: ".env", objetivoEvaluado: ".env", forma: "sujeto" },
  decision: "allow", motivoSinDecision: null, determinante: 2, desplazadas: [0, 1], nativaAnulada: { regla: 0, por: 2 },
  advertencias: ["proteccion-anulada"], cadena: [0, 1, 2].map(indice => ({ indice, sujeto: "read", patron: indice === 0 ? "*.env" : "*", efecto: indice === 2 ? "allow" : "deny", origen: declaracion.origen, declaracion })), explicacion: ["Explicación completa"], porDefecto: false };

test("T5-26 U-1 cadena completa numerada como el JSON desde 1", () => {
  const r: RespuestaReglas = { ...base, agente: "build", cadena: permiso.cadena.map(r => ({ ...r, indice: r.indice + 1, prevalece: [] })),
    ejesParciales: [], advertencias: [], matriz: { sujetos: [], filas: [], noObservados: [], motivos: [] } };
  const texto = renderizarReglas(r, { ...contexto, todo: true });
  expect(texto).toContain("Cadena completa:\n#1 ");
  expect([...texto.matchAll(/^#(\d+) /gm)].map(m => Number(m[1]))).toEqual(r.cadena.map(r => r.indice));
});

test("T5-24-c1 Y-1 procedencias y decisiones indivisibles en cada punto de ajuste", () => {
  for (const ancho of [40, 100]) {
    for (const [origen, etiqueta] of [["nativa-general", "OpenCode · general"], ["nativa-agente", "OpenCode · agente"], ["nativa-final", "OpenCode · final"]] as const) {
      for (let largo = 1; largo <= ancho; largo++) {
        const cadena = [{ ...permiso.cadena[2]!, patron: "x".repeat(largo), declaracion: null, origen: { tipo: "nativo" as const, regla: origen } }];
        const t = renderizarPermiso({ ...permiso, cadena, desplazadas: [] }, { ...contexto, ancho });
        expect(t).toContain(etiqueta);
        expect(t).toContain("→ permitida");
      }
    }
    for (let largo = 1; largo <= ancho; largo++) {
      const d = { ...declaracion, referencia: "/temporal/" + "x".repeat(largo) + ".jsonc" };
      const cadena = [{ ...permiso.cadena[2]!, declaracion: d, patron: "*" }];
      const t = renderizarPermiso({ ...permiso, cadena, desplazadas: [] }, { ...contexto, ancho });
      expect(t).toContain("x".repeat(largo) + ".jsonc:3:7 (proyecto)");
      expect(t).toContain("✓ PERMITIDO");
    }
  }
});

test("T5-24-c1 Y-2 ruta larga estilo Linux entera con ancho 100 y 40", () => {
  const patron = "/tmp/rige-escenario-XXXXXX/hogar/opencode/tool-output/*";
  const cadena = [{ ...permiso.cadena[2]!, indice: 16, sujeto: "external_directory", patron, efecto: "deny" as const, prevalece: [],
    declaracion: null, origen: { tipo: "nativo" as const, regla: "nativa-final" } }];
  for (const ancho of [100, 40]) {
    const t = renderizarReglas({ ...base, agente: "build", cadena, ejesParciales: [], advertencias: [],
      matriz: { sujetos: [], filas: [], noObservados: [], motivos: [] } }, { ...contexto, ancho, todo: true });
    expect(t).toContain("OpenCode · final");
    expect(t).toContain("→ denegada");
    expect(t.split("\n").filter(l => l.includes(patron))).toHaveLength(1);
  }
});
test("T5-23 L-4 permiso: decision, desplazada principal, nativa anulada, explicar y ausencia", () => {
  const t = renderizarPermiso(permiso, contexto);
  for (const s of ["✓ PERMITIDO", "Decide:", "Desplaza:", "#1", "Protección nativa anulada", "proteccion-anulada"]) expect(t).toContain(s);
  expect(t).not.toContain("Explicación completa");
  expect(renderizarPermiso(permiso, { ...contexto, explicar: true })).toContain("Explicación completa");
  expect(renderizarPermiso({ ...permiso, decision: null, determinante: null, motivoSinDecision: "comando-compuesto" }, contexto)).toContain("— SIN DECISIÓN: El comando contiene varias operaciones;");
  expect(renderizarPermiso({ ...permiso, desplazadas: [], cadena: permiso.cadena.map(r => ({ ...r, declaracion: null, origen: { tipo: "nativo", regla: "fabrica" } })) }, contexto)).toContain("Desplaza: ninguna");
  expect(renderizarPermiso({ ...permiso, decision: "deny" }, { ...contexto, esConsola: true, colorHabilitado: true })).toContain("\x1b[31m");
});
test("T5-23 L-4 matriz conserva parcialidad, ausencia, limites y cadena con --todo", () => {
  const r: RespuestaReglas = { ...base, agente: "build", cadena: [{ ...permiso.cadena[0]!, prevalece: [] }], ejesParciales: ["read"], advertencias: ["aviso"],
    matriz: { sujetos: ["read", "bash"], filas: [{ agente: "build", oculto: false, error: null, ejesParciales: ["read"], declaraciones: [], advertencias: [],
      celdas: [{ sujeto: "read", efecto: null, prevalece: null, motivo: "eje-parcialmente-observado" }, { sujeto: "bash", efecto: null, prevalece: null, motivo: "sin-regla" }] }], noObservados: [{ nombre: "auxiliar", motivo: "markdown" }], motivos: ["incompleta"] } };
  const t = renderizarReglas(r, contexto);
  for (const s of ["build", "read", "bash", "parcial, sin decisión", "sin regla", "auxiliar", "markdown", "incompleta", "aviso"]) expect(t).toContain(s);
  expect(renderizarReglas(r, { ...contexto, todo: true })).toContain("*.env");
  const extensa: RespuestaReglas = { ...r, matriz: { ...r.matriz, sujetos: Array.from({ length: 30 }, (_, i) => `sujeto${i}`) } };
  const estrecha = renderizarReglas(extensa, { ...contexto, ancho: 1 });
  for (const linea of estrecha.trimEnd().split("\n")) expect(Array.from(linea).length).toBeLessThanOrEqual(40);
});
test("T5-23 L-4 hallazgos vacios con analisis incompleto, ubicacion y causa", () => {
  const r: RespuestaHallazgos = { ...base, incompleta: true, motivos: ["markdown-no-observado"], hallazgos: [], resumen: { elementos: null,
    hallazgos: { "entrada-ilegible": 0, "entrada-descartada": 0, "sustitucion-sin-valor": 0, "referencia-no-resuelta": 0, "regla-sin-efecto": 0, "elemento-sin-uso": 0 } } };
  expect(renderizarHallazgos(r, contexto)).toContain("Análisis incompleto: markdown-no-observado");
  expect(renderizarHallazgos(r, contexto)).toContain("Sin hallazgos");
  const conHallazgo: RespuestaHallazgos = { ...r, hallazgos: [{ tipo: "referencia-no-resuelta", causa: "ruta-no-encontrada", entrada: { orden: 1, via: "proyecto", referencia: "/temporal/opencode.jsonc", condicion: "observada" }, posicion: { linea: 4, columna: 9 }, clave: ["prompt"], parametros: {}, localizacion: "archivo", explicacion: "Explicación del hallazgo" }] };
  const t = renderizarHallazgos(conHallazgo, { ...contexto, explicar: true });
  for (const s of ["referencia-no-resuelta", "opencode.jsonc:4:9", "ruta-no-encontrada", "Explicación del hallazgo"]) expect(t).toContain(s);
});
test("T5-23 L-4 comparar filtra presentacion y conserva limites de ambas fotos", () => {
  const foto = { id: 1, instante: "2020-01-02T11:14:00Z", entradas: [], resumenEntradas: "", noComparables: [{ ruta: ["prompt"], regla: "no-resuelta" }], motivosAgentes: ["markdown"], reglas: {} };
  const resumen = { cambiadas: 0, agregadas: 0, quitadas: 0, sinCambio: 1 };
  const r: RespuestaComparacion = { esquema: 2, proyecto: base.proyecto, desde: foto, hasta: { ...foto, id: 2 },
    agentes: { agregados: [], quitados: [], comunes: ["build", "plan"], inciertos: ["aux"] }, comparaciones: ["build", "plan"].map(agente => ({ agente, cambios: [], resumen })), resumen, parcial: true, sustituciones: "solo-representacion-protegida" };
  const t = renderizarComparacion(r, { ...contexto, agente: "build" });
  expect(t).toContain("build"); expect(t).not.toContain("plan"); expect(t).toContain("prompt: no-resuelta"); expect(t).toContain("markdown");
  expect(r.comparaciones).toHaveLength(2);
});

test("T5-26 U-3 comparar suma solo lo filtrado en CLI y web", async () => {
  const foto = { id: 1, instante: "2020-01-02T11:14:00Z", entradas: [], resumenEntradas: "", noComparables: [], motivosAgentes: [], reglas: {} };
  const resumen = { cambiadas: 2, agregadas: 3, quitadas: 4, sinCambio: 5 };
  const r: RespuestaComparacion = { esquema: 2, proyecto: base.proyecto, desde: foto, hasta: { ...foto, id: 2 },
    agentes: { agregados: [], quitados: [], comunes: ["build", "plan"], inciertos: [] }, comparaciones: ["build", "plan"].map(agente => ({ agente, cambios: [], resumen })),
    resumen: { cambiadas: 4, agregadas: 6, quitadas: 8, sinCambio: 10 }, parcial: false, sustituciones: "solo-representacion-protegida" };
  for (const agente of [undefined, "build", "inexistente"]) {
    const factor = agente === undefined ? 2 : agente === "build" ? 1 : 0;
    expect(renderizarComparacion(r, { ...contexto, agente })).toContain(`${2 * factor} cambiadas · ${3 * factor} agregadas · ${4 * factor} quitadas · ${5 * factor} sin cambio`);
    const web = await paginaComparacion(r, agente).text();
    for (const etiqueta of [`${2 * factor} cambios`, `${3 * factor} claves nuevas`, `${4 * factor} quitadas`, `${5 * factor} claves sin cambio`]) expect(web).toContain(etiqueta);
  }
});
