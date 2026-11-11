import { expect, test } from "bun:test";
import type { RespuestaAgentes, RespuestaPermiso, RespuestaHallazgos, RespuestaValores, RespuestaReglas } from "../../aplicacion/respuestas/contrato-generado";
import { paginaPermiso } from "./paginas/permiso";
import { paginaConsultasPermiso } from "./paginas/consultas-permiso";
import { paginaEntradas } from "./paginas/entradas";
import { paginaHallazgos } from "./paginas/hallazgos";
import { paginaReglas } from "./paginas/reglas";
import { paginaResumenProyecto } from "./paginas/resumen-proyecto";
import { paginaResolucion } from "./paginas/resolucion";
import { estilos } from "./estilos";
import { versionRige } from "../../aplicacion/respuestas/estado";
const base = { esquema: 2 as const, proyecto: "/p", entradas: [], resumenEntradas: "a".repeat(64), declaraciones: [], reglas: {} };
const agentes: RespuestaAgentes = { ...base, agentes: [{ nombre: "build", modo: "primary", origen: "nativo", oculto: false }], eliminados: [], incompleta: false, motivos: [] };
const contexto = { idResolucion: "7", agente: "build", agentes: agentes.agentes };
const foto = { id: 7, instante: "2026-11-11T12:00:00Z", anteriores: [] };
const origen = { tipo: "declarado" as const, orden: 0, posicion: { linea: 3, columna: 15 } };
const permiso: RespuestaPermiso = { ...base, agente: "build", consulta: { sujeto: "read", objetivo: ".env", objetivoEvaluado: ".env", forma: "sujeto" }, decision: "allow", motivoSinDecision: null, determinante: 0, desplazadas: [], nativaAnulada: { regla: 1, por: 0 }, porDefecto: false,
  cadena: [{ indice: 0, sujeto: "read", patron: "*", efecto: "allow", origen, declaracion: { origen, referencia: "/p/opencode.json", via: "proyecto", valor: "allow", regla: "declarada" } }],
  explicacion: ["La regla declarada en /p/opencode.json:3:15 decide <aquí>."], advertencias: ["proteccion-nativa-anulada", "otra"], reglas: { "proteccion-nativa-anulada": "Advertencia equivalente nativa.", otra: "Otra advertencia visible." } };
const hallazgos: RespuestaHallazgos = { ...base, hallazgos: [], incompleta: false, motivos: [], resumen: { elementos: { agentes: 8, comandos: 0, entradas: 2 }, hallazgos: { "entrada-ilegible": 0, "entrada-descartada": 0, "referencia-no-resuelta": 0, "sustitucion-sin-valor": 0, "regla-sin-efecto": 2, "elemento-sin-uso": 0 } } };
const reglas: RespuestaReglas = { ...base, agente: "build", cadena: [], ejesParciales: [], advertencias: [], matriz: { sujetos: [], motivos: [], noObservados: [], filas: [] } };
const valores: RespuestaValores = { ...base, versionRige, herramienta: "opencode", versionHerramienta: "1.18.25", agente: "build", ruta: null, motivo: null, noResueltas: [], valores: [] };
const sinJson = (s: string) => s.replace(/<script[^]*?<\/script>/g, "");
test("T5-21 F-1 selector compacto junto al titulo en todas las vistas", async () => {
  for (const pagina of [paginaPermiso(permiso, "7", contexto), paginaConsultasPermiso(agentes, contexto), paginaEntradas(base, contexto), paginaHallazgos(hallazgos, contexto), paginaReglas(reglas, "7", contexto)]) {
    const s = await pagina.text();
    expect(s).toMatch(/class="barra-agente">\s*<h1>[^]*?<\/h1>\s*<form id="seleccionar-agente"[^]*?<\/form>\s*<\/div>/);
    for (const form of s.matchAll(/<form\b[^]*?<\/form>/g)) expect(form[0].match(/<form\b/g)).toHaveLength(1);
  }
});
test("T5-21 F-2 ubicacion corta, aviso unico y accion secundaria junto a coincidentes", async () => {
  for (const explicacion of [permiso.explicacion, null]) {
    const s = sinJson(await paginaPermiso({ ...permiso, explicacion }, "7", contexto).text());
    if (explicacion) {
      const frase = s.split('id="resultado-permiso"')[1]!.split("</section>")[0]!;
      expect(frase).toContain('title="Abrir en VS Code: /p/opencode.json">opencode.json:3:15</a>');
      expect(frase.replace(/(?:title|href)="[^"]*"/g, "")).not.toContain("/p/opencode.json");
      expect(frase).toContain("&lt;aquí&gt;");
    }
    const notas = s.match(/<details id="notas-analisis">[^]*?<\/details>/)![0];
    expect(notas).toContain("Advertencia equivalente nativa.");
    expect(s.replace(notas, "")).not.toContain("Advertencia equivalente nativa.");
    expect(s).toContain("Otra advertencia visible.");
    expect(s).toMatch(/class="acciones acciones--pie">\s*<details id="cadena-efectiva">[^]*?<\/details>\s*<a class="boton boton--secundario"[^>]*>Ver la cadena completa en Todas las reglas<\/a>/);
  }
  const sinNativa = sinJson(await paginaPermiso({ ...permiso, nativaAnulada: null }).text());
  expect(sinNativa.split('id="advertencias"')[1]).toContain("Advertencia equivalente nativa.");
});
test("T5-21 F-3 resumen sin tarjetas de cero y conteos en una linea", async () => {
  const s = sinJson(await paginaHallazgos(hallazgos).text()).split('id="resumen-hallazgos"')[1]!.split("</section>")[0]!;
  expect(s).toContain("8 agentes · 0 comandos · 2 entradas");
  expect(s).not.toContain("estadistica--mini"); expect(s).not.toContain("estadistica--cero");
  expect(s.match(/estadistica estadistica--aviso/g)).toHaveLength(1);
  expect(s.replace(/<[^>]+>/g, "")).toContain("Sin hallazgos de: entradas ilegibles, entradas descartadas");
  const desconocido = sinJson(await paginaHallazgos({ ...hallazgos, resumen: { ...hallazgos.resumen, elementos: null } }).text());
  expect(desconocido).toContain("sin dato");
});
test("T5-21 F-4 aviso de agentes solo con lista completa no vacia y nativa", async () => {
  for (const a of [agentes, { ...agentes, incompleta: true }, { ...agentes, agentes: [] }, { ...agentes, agentes: [{ ...agentes.agentes[0]!, origen: "declarado" as const }] }]) {
    const s = sinJson(await paginaResumenProyecto(a, { exito: true, valor: base }, { exito: true, valor: hallazgos }, "7", foto).text());
    expect(s.includes("Este proyecto no define agentes nuevos: usa los de OpenCode")).toBe(a === agentes);
    expect(s).not.toContain("agentes de fábrica");
  }
});
test("T5-21 F-5 secundarios de cuerpo menores que el principal", () => {
  expect(estilos).toMatch(/\.boton--secundario\s*\{[^}]*min-height: 36px;[^}]*padding: \.4rem \.7rem;[^}]*font-size: \.875rem/);
  expect(estilos).toMatch(/button, \.boton\s*\{[^}]*min-height: 44px/);
});
test("T5-21 F-6 entradas de la foto dentro de consola y sin accion repetida", async () => {
  const s = sinJson(await paginaResolucion(valores, foto).text());
  expect(s).not.toContain("Ver entradas actuales");
  expect(s.split('<details id="comando-cli">')[0]).not.toContain('id="entradas-leidas"');
  expect(s.split('<details id="comando-cli">')[1]).toContain('id="entradas-leidas"');
});
test("T5-21 F-7 documentos describen los ajustes finales", async () => {
  for (const archivo of ["README.md", "MANUAL.md"]) {
    const s = await Bun.file(archivo).text();
    for (const frase of ["Sin hallazgos de:", "Este proyecto no define agentes nuevos: usa los de OpenCode", "Notas del análisis", "selector compacto"]) expect(s).toContain(frase);
  }
});

test("T5-21 ajuste de procedencia: tamano legible y espaciado normal sin heredar el titulo", () => {
  const regla = estilos.match(/\.procedencia\s*\{([^}]+)\}/)![1]!;
  const tamano = Number(regla.match(/font-size:\s*([\d.]+)rem/)![1]);
  expect(tamano).toBeGreaterThanOrEqual(0.8);
  expect(regla).toMatch(/letter-spacing:\s*normal\s*;/);
});
