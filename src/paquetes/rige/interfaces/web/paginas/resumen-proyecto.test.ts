import { describe, expect, test } from "bun:test";
import type { RespuestaAgentes, RespuestaEntradas, RespuestaHallazgos, RespuestaReglas, RespuestaValores } from "../../../aplicacion/respuestas/contrato-generado";
import { paginaResumenProyecto } from "./resumen-proyecto";
import { paginaResolucion } from "./resolucion";
import { paginaHallazgos } from "./hallazgos";
import { seccionHtml } from "../../../../../pruebas/utilidades/html";
import { fechaLocal } from "../textos";
import { estilos } from "../estilos";
import { versionRige } from "../../../aplicacion/respuestas/estado";

const base = { esquema: 2 as const, proyecto: "/mi-proyecto", entradas: [], resumenEntradas: "a".repeat(64), declaraciones: [], reglas: {} };
const agentes: RespuestaAgentes = { ...base, agentes: [
  { nombre: "build", modo: "primary", origen: "nativo", oculto: false },
  { nombre: "oculto", modo: "subagent", origen: "declarado", oculto: true },
], eliminados: [], incompleta: false, motivos: [] };
const determinante = { valor: 0.3, referencia: "/mi-proyecto/opencode.json", via: "proyecto", regla: "ultima",
  origen: { tipo: "declarado" as const, orden: 1, posicion: { linea: 5, columna: 7 } } };
const valor = (clave: string, tipo: "declarado" | "implicito" | "nativo") => ({ clave, rastro: {
  ruta: [clave], indiceFusion: 0, valor: 0.3, motivo: "ultima", desplazadas: tipo === "declarado" ? [{ ...determinante, valor: 0.2 }] : [],
  determinante: tipo === "declarado" ? determinante : { ...determinante, referencia: null, via: null,
    origen: { tipo, regla: tipo === "implicito" ? "valor-implicito-del-agente" : "nativa" } },
} });
const valores: RespuestaValores = { ...base, versionRige, herramienta: "opencode", versionHerramienta: "1.18.25", agente: "build",
  ruta: null, motivo: null, noResueltas: [], valores: [valor("zeta", "declarado"), valor("beta", "nativo"), valor("alfa", "declarado"), valor("delta", "implicito")],
  reglas: { "orden-de-aplicacion": "La última declaración prevalece.", "valor-implicito-del-agente": "Explicación implícita.", ultima: "Regla última." } };
const entrada = { orden: 1, via: "proyecto", referencia: "/mi-proyecto/opencode.json", condicion: "observada" as const, resumen: null, legibilidad: "legible" as const };
const entradas: RespuestaEntradas = { ...base, entradas: [entrada] };
const hallazgos: RespuestaHallazgos = { ...base, incompleta: false, motivos: [], hallazgos: [0, 1].map(() => ({
  tipo: "regla-sin-efecto", causa: "ultima", entrada, posicion: { linea: 5, columna: 7 }, clave: null, parametros: {},
  localizacion: "/mi-proyecto/opencode.json:5:7", explicacion: "Regla desplazada.",
})), resumen: { elementos: null, hallazgos: { "entrada-ilegible": 0, "entrada-descartada": 0, "sustitucion-sin-valor": 0, "referencia-no-resuelta": 0, "regla-sin-efecto": 2, "elemento-sin-uso": 0 } } };
const reglas: RespuestaReglas = { ...base, agente: "build", cadena: [], ejesParciales: [], advertencias: [],
  reglas: { parcial: "Aprobaciones permanentes no observadas.", indices: "Índices desde 1.", ejecucion: "No reproduce opencode run.", "eje-parcialmente-observado": "El objetivo concreto requiere consulta." },
  matriz: { sujetos: ["read", "external_directory"], motivos: ["indices"], noObservados: [], filas: [{ agente: "build", oculto: false, error: null,
    ejesParciales: ["external_directory"], declaraciones: ["parcial"], advertencias: ["ejecucion"], celdas: [
      { sujeto: "read", efecto: "allow", prevalece: 1, motivo: null },
      { sujeto: "external_directory", efecto: null, prevalece: null, motivo: "eje-parcialmente-observado" },
    ] }] } };
const sobre = { id: 7, instante: "2026-11-11T12:00:00Z", anteriores: [{ id: 7, instante: "2026-11-11T12:00:00Z", resumenEntradas: base.resumenEntradas }] };
const contexto = { agentes: agentes.agentes, agente: "build", q: "", lanzadoPor: "plan" };
const resumen = () => paginaResumenProyecto(agentes, { exito: true, valor: entradas }, { exito: true, valor: hallazgos }, "7", sobre, { versionHerramienta: "1.18.25" }).text();
const agente = (q = "") => paginaResolucion(valores, sobre, { ...contexto, q }, { agente: agentes.agentes[0]!, reglas }).text();
const bloque = (cuerpo: string, id: string) => cuerpo.split(`id="${id}"`)[1]!.split("</section>")[0]!;
const sinJson = (cuerpo: string) => cuerpo.replace(/<script[^]*?<\/script>/g, "");
const css = (selector: string) => [...estilos.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([, s]) => s!.split(",").some(s => s.trim() === selector)).map(m => m[2]).join("\n");

describe("T3-01 R-11 declaraciones en resumen del proyecto", () => {
  test("presenta las plantillas escapadas y conserva el objeto embebido", async () => {
    const respuesta: RespuestaAgentes = { esquema: 2, proyecto: "/p", entradas: [], resumenEntradas: "a".repeat(64),
      agentes: [], eliminados: [], incompleta: false, motivos: [],
      declaraciones: ["version-no-determinada", "ejecutable-no-encontrado"],
      reglas: { "version-no-determinada": "Version <no determinada>.", "ejecutable-no-encontrado": "No hay ejecutable & paquete." } };
    const cuerpo = await paginaResumenProyecto(respuesta, { exito: true, valor: { ...respuesta, entradas: [] } }, { exito: false, error: { codigo: "prueba", mensaje: "No disponible" } }, "7").text();
    const declaraciones = seccionHtml(cuerpo, "declaraciones");
    expect(declaraciones).toContain("<p>Version &lt;no determinada&gt;.</p>");
    expect(declaraciones).toContain("<p>No hay ejecutable &amp; paquete.</p>");
    seccionHtml(cuerpo, "tabla-agentes");
    expect(JSON.parse(cuerpo.match(/id="respuesta">([^]*?)<\/script>/)![1]!)).toEqual(respuesta);
    expect(cuerpo.replace(/<script type="application\/json" id="respuesta">[^]*?<\/script>/, "")).not.toMatch(/<script/i);
  });
});

describe("Resumen del proyecto: bloques, cifras y acciones", () => {
  test("T5-21 F-4 aviso de agentes solo con lista completa no vacia y nativa", async () => {
    const agentesF4: RespuestaAgentes = { ...base, agentes: [{ nombre: "build", modo: "primary", origen: "nativo", oculto: false }], eliminados: [], incompleta: false, motivos: [] };
    const fotoF4 = { id: 7, instante: "2026-11-11T12:00:00Z", anteriores: [] };
    for (const a of [agentesF4, { ...agentesF4, incompleta: true }, { ...agentesF4, agentes: [] }, { ...agentesF4, agentes: [{ ...agentesF4.agentes[0]!, origen: "declarado" as const }] }]) {
      const s = sinJson(await paginaResumenProyecto(a, { exito: true, valor: base }, { exito: true, valor: hallazgos }, "7", fotoF4).text());
      expect(s.includes("Este proyecto no define agentes nuevos: usa los de OpenCode")).toBe(a === agentesF4);
      expect(s).not.toContain("agentes de fábrica");
    }
  });

  test("U-1 encabezados compactos con ruta, fecha, versión y una identidad de agente", async () => {
    const cabecera = (await resumen()).match(/<section class="cabecera-pagina">([^]*?)<\/section>/)![1]!;
    expect(cabecera).toContain(`<p class="atenuado metadatos-proyecto"><span class="monoespaciado">/mi-proyecto</span> · Análisis del ${fechaLocal(sobre.instante)} · n.º 7 · OpenCode 1.18.25</p>`);
    expect(cabecera).not.toContain('class="ruta"');
    const identidad = (await agente()).match(/class="identidad-agente">([^]*?)<\/div>/)![1]!;
    for (const texto of ["<h1>build</h1>", ">nativo</span>", "Principal", "2 claves declaradas"]) expect(identidad).toContain(texto);
  });

  test("U-2 cifras breves separadas en dos bandas: este análisis y ahora en disco", async () => {
    const cifras = bloque(await resumen(), "cifras");
    for (const etiqueta of ["agentes", "archivos leídos", "hallazgos", "análisis"]) expect(cifras).toContain(`<span>${etiqueta}</span>`);
    expect(cifras).toContain("0 ilegibles");
    expect(cifras).not.toContain("Estado actual");
    expect(cifras).toMatch(/Este análisis \(\d{2}\/\d{2} \d{2}:\d{2}\)[^]*?agentes[^]*?análisis[^]*?Ahora en disco[^]*?archivos leídos[^]*?hallazgos/);
  });

  test("U-3 procedencia como etiqueta junto al título de cada bloque", async () => {
    const cuerpo = await resumen();
    expect(cuerpo).toContain('<h2>Agentes <small class="procedencia">Foto guardada</small></h2>');
    expect(cuerpo).toContain('<h2>Hallazgos <small class="procedencia">Estado actual de los archivos</small></h2>');
    expect(cuerpo).toContain('<h2>Archivos y cambios <small class="procedencia">Estado actual de los archivos</small></h2>');
    expect(cuerpo).not.toMatch(/<p[^>]*>(Foto guardada|Estado actual de los archivos)<\/p>/);
    expect(await paginaHallazgos(hallazgos).text()).toContain('<h1>Hallazgos <small class="procedencia">Estado actual de los archivos</small></h1>');
  });

  test("U-4 fila de agente enlazada con nombre del cuerpo y modo atenuado", async () => {
    const tabla = bloque(await resumen(), "tabla-agentes");
    expect(tabla).toContain('class="agente-enlace" href="/resoluciones/7/agentes/build">build</a>');
    expect(tabla).not.toContain("<code>build</code>");
    expect(tabla).toContain('class="atenuado" data-etiqueta="Modo"');
    expect(css(".agente-enlace::after")).toMatch(/inset:\s*0/);
    expect(css(".fila-agente")).toContain("position: relative");
    expect(css(".agente-enlace:hover")).toContain("text-decoration: underline");
  });

  test("U-5 una fila por tipo con cantidad, editor y Ver al ancla, sin viñetas", async () => {
    const bloqueHallazgos = bloque(await resumen(), "hallazgos-actuales");
    expect(bloqueHallazgos).not.toContain("<ul>");
    expect(bloqueHallazgos.match(/class="hallazgo-resumen"/g)).toHaveLength(1);
    expect(bloqueHallazgos).toMatch(/Regla sin efecto[^]*?insignia[^>]*>2<\/span>[^]*?vscode:\/\/file[^]*?#h-0">Ver<\/a>/);
  });

  test("U-10 acciones secundarias reunidas al pie del bloque", async () => {
    for (const cuerpo of [await resumen(), await agente()]) {
      for (const enlace of cuerpo.matchAll(/<a\b[^>]*>(Ver todas las reglas[^<]*|Consultar permiso|Ver entradas actuales|Ver hallazgos)<\/a>/g)) {
        expect(enlace[0]).toContain('class="boton boton--secundario"');
        const antes = cuerpo.slice(0, enlace.index);
        expect(antes.lastIndexOf('class="acciones acciones--pie"')).toBeGreaterThan(antes.lastIndexOf("</section>"));
      }
    }
    expect(bloque(await agente(), "permisos-agente")).toMatch(/Ver todas las reglas[^]*?Consultar permiso/);
  });

  test("T5-22 M-4 reanalizar en cabecera junto a metadatos con ruta codificada", async () => {
    const fotoM4 = { id: 7, instante: "2026-11-11T12:00:00Z", anteriores: [] };
    const entradasM4 = { ...base, vias: [{ via: "proyecto", estado: "presente" as const, cantidad: 1, revisados: ["/p/opencode.json"] }] };
    const s = await paginaResumenProyecto(agentes, { exito: true, valor: entradasM4 }, { exito: true, valor: hallazgos }, "7", fotoM4).text();
    const cabecera = s.split('class="cabecera-pagina"')[1]!.split("</section>")[0]!;
    expect(cabecera).toContain('class="acciones metadatos-acciones"');
    expect(cabecera).toContain(`class="boton boton--secundario" href="/resolver?proyecto=${encodeURIComponent(base.proyecto)}">Analizar de nuevo</a>`);
    expect(JSON.parse(s.match(/id="respuesta">([^]*?)<\/script>/)![1]!)).toEqual(agentes);
  });
});
