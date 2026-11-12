import { describe, expect, test } from "bun:test";
import type { RespuestaAgentes, RespuestaEntradas, RespuestaHallazgos, RespuestaReglas, RespuestaValores } from "../../aplicacion/respuestas/contrato-generado";
import { versionRige } from "../../aplicacion/respuestas/estado";
import { paginaResumenProyecto } from "./paginas/resumen-proyecto";
import { paginaResolucion } from "./paginas/resolucion";
import { paginaHallazgos } from "./paginas/hallazgos";
import { estilos } from "./estilos";
import { fechaLocal } from "./textos";

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

describe("T5-20", () => {
  test("U-1 encabezados compactos con ruta, fecha, versión y una identidad de agente", async () => {
    const cabecera = (await resumen()).match(/<section class="cabecera-pagina">([^]*?)<\/section>/)![1]!;
    expect(cabecera).toContain(`<p class="atenuado metadatos-proyecto"><span class="monoespaciado">/mi-proyecto</span> · Análisis del ${fechaLocal(sobre.instante)} · OpenCode 1.18.25</p>`);
    expect(cabecera).not.toContain('class="ruta"');
    const identidad = (await agente()).match(/class="identidad-agente">([^]*?)<\/div>/)![1]!;
    for (const texto of ["<h1>build</h1>", ">nativo</span>", "Principal", "2 claves declaradas"]) expect(identidad).toContain(texto);
  });
  test("U-2 cifras breves y un solo rótulo sobre las dos cifras actuales", async () => {
    const cifras = bloque(await resumen(), "cifras");
    for (const etiqueta of ["agentes", "archivos leídos", "hallazgos", "análisis"]) expect(cifras).toContain(`<span>${etiqueta}</span>`);
    expect(cifras).toContain("0 ilegibles");
    expect(cifras.match(/Estado actual/g)).toHaveLength(1);
    expect(cifras).toMatch(/class="cifras-actuales">[^]*?Estado actual[^]*?archivos leídos[^]*?hallazgos[^]*?<\/div><\/div>/);
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
  test("U-6 selector junto a identidad y buscador lineal sin tarjeta ni ayuda visible", async () => {
    const cuerpo = await agente();
    expect(cuerpo).toMatch(/class="barra-agente">[^]*?class="identidad-agente"[^]*?id="seleccionar-agente"[^]*?<\/form>\s*<\/div>/);
    expect(cuerpo).toMatch(/<form id="filtrar-claves" class="barra-busqueda"[^]*?title="Filtra solo las filas visibles; no cambia la consulta ni su JSON\."/);
    expect(cuerpo).not.toContain('id="ayuda-filtro"');
    expect(css(".barra-agente .selector-agente")).toContain("border: 0");
    expect(css(".barra-busqueda")).toContain("display: flex");
    expect(css(".barra-agente")).toContain("flex-direction: column");
  });
  test("U-7 declaradas ordenadas primero; fábrica cerrada, una insignia y una explicación común", async () => {
    const cuerpo = await agente();
    const visibles = bloque(sinJson(cuerpo), "valores");
    const fabrica = visibles.split('<details id="valores-fabrica"><summary>Valores de fábrica (2)</summary>');
    expect(fabrica).toHaveLength(2);
    expect(fabrica[0]!.indexOf('data-etiqueta="Clave">alfa')).toBeLessThan(fabrica[0]!.indexOf('data-etiqueta="Clave">zeta'));
    expect(fabrica[0]).not.toContain('data-etiqueta="Clave">beta');
    expect(fabrica[1]!.indexOf('data-etiqueta="Clave">beta')).toBeLessThan(fabrica[1]!.indexOf('data-etiqueta="Clave">delta'));
    const fila = fabrica[1]!.match(/<tr>[^]*?data-etiqueta="Clave">delta[^]*?<\/tr>/)![0]!;
    expect(fila.match(/>implícito<\/span>/g)).toHaveLength(1);
    expect(fila).toContain('title="valor-implicito-del-agente"');
    expect(fila).not.toContain("Valor implícito");
    expect(cuerpo.match(/<summary>¿Qué significa\?<\/summary>/g)).toHaveLength(1);
    expect(cuerpo).not.toContain("<summary>Cómo se decide</summary>");
    expect(cuerpo).toContain("Explicación implícita.");
    const filtrado = await agente("DELTA");
    expect(filtrado).toContain("Valores de fábrica (1)");
    expect(JSON.parse(filtrado.match(/id="respuesta">([^]*?)<\/script>/)![1]!)).toEqual(valores);
    const sinPlantillas = sinJson(await paginaResolucion({ ...valores, reglas: {}, valores: [valor("delta", "implicito")] }, sobre).text());
    expect(sinPlantillas.replace(/title="[^"]*"/g, "")).not.toContain("ultima");
  });
  test("U-8 desplazadas en líneas sin numeración con valor y ubicación juntos", async () => {
    const desplazadas = (await agente()).match(/data-etiqueta="Desplazadas">([^]*?)<\/td>/)![1]!;
    expect(desplazadas).not.toMatch(/<ol|<li/);
    expect(desplazadas).toContain('<del class="valor-desplazado">0.2</del> · Proyecto ·');
    expect(css(".valor-desplazado")).not.toContain("display: block");
  });
  test("U-9 sujetos en cuadrícula, índice en title, leyenda parcial y límites unificados", async () => {
    const permisos = bloque(await agente(), "permisos-agente");
    const celdas = permisos.split('class="sujetos-permiso"')[1]!.split("</dl>")[0]!;
    expect(celdas).toContain('title="Regla 1"');
    expect(celdas).not.toContain("<p");
    expect(celdas).toContain(">parcial</span>");
    expect(permisos).toContain('class="leyenda-parcial"');
    expect(permisos).toContain('<details><summary>Límites del análisis</summary>');
    for (const texto of ["Aprobaciones permanentes", "Índices desde 1", "opencode run"]) expect(permisos.split("Límites del análisis")[1]).toContain(texto);
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
  test("U-11 componentes nuevos usan superficies del tema claro y contraste AA", () => {
    for (const selector of [".sujetos-permiso > div", ".hallazgo-resumen"]) {
      expect(css(selector)).toContain("background: var(--superficie)");
      expect(css(selector)).not.toMatch(/#[\da-f]{3,8}/i);
    }
    const claro = estilos.match(/:root\s*\{([^}]+)\}/)![1]!;
    const tokens = Object.fromEntries([...claro.matchAll(/--([\w-]+):\s*(#[\da-f]{6})/g)].map(m => [m[1]!, m[2]!]));
    const luminancia = (hex: string) => [1, 3, 5].map(i => {
      const canal = parseInt(hex.slice(i, i + 2), 16);
      const c = canal / 255, ajustado = c + .055;
      return c <= .04045 ? c / 12.92 : (ajustado / 1.055) ** 2.4;
    }).reduce((s, c, i) => s + c * [.2126, .7152, .0722][i]!, 0);
    for (const [texto, fondo] of [["texto", "superficie"], ["secundario", "fondo"], ["acento", "superficie"], ...["neutro", "exito", "peligro", "aviso"].map(t => [t, `${t}-fondo`])]) {
      const a = luminancia(tokens[texto!]!), b = luminancia(tokens[fondo!]!);
      const clara = Math.max(a, b) + .05, oscura = Math.min(a, b) + .05;
      expect(clara / oscura).toBeGreaterThanOrEqual(4.5);
    }
  });
  test("U-12 documentos con los controles finales", async () => {
    for (const archivo of ["README.md", "MANUAL.md"]) {
      const documento = await Bun.file(archivo).text();
      for (const texto of ["Valores de fábrica (n)", "¿Qué significa?", "Límites del análisis", "Ver entradas actuales"]) expect(documento).toContain(texto);
      expect(documento).not.toContain("**Cómo se decide**");
    }
  });
});
