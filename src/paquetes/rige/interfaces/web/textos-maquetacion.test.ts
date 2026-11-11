import { expect, test } from "bun:test";
import type { RespuestaAgentes, RespuestaEntradas, RespuestaHallazgos, RespuestaReglas, RespuestaValores } from "../../aplicacion/respuestas/contrato-generado";
import { versionRige } from "../../aplicacion/respuestas/estado";
import { paginaReglas } from "./paginas/reglas";
import { paginaResolucion } from "./paginas/resolucion";
import { paginaInicio } from "./paginas/inicio";
import { paginaEntradas } from "./paginas/entradas";
import { paginaConsultasPermiso } from "./paginas/consultas-permiso";
import { paginaResumenProyecto } from "./paginas/resumen-proyecto";
import { estilos } from "./estilos";

const base = { esquema: 2 as const, proyecto: '/proyecto largo & "prueba"', entradas: [], resumenEntradas: "a".repeat(64), declaraciones: [], reglas: {} };
const sujetos = ["read", "external_directory", "personalizado"];
const reglas: RespuestaReglas = { ...base, agente: "build", ejesParciales: ["external_directory"], advertencias: [],
  reglas: { "nativa-general": 'Regla de permiso incorporada en los defaults <general> & "segura".', "nativa-agente": "Regla nativa del agente.", "denegacion-subagente": "Denegación final del subagente.", parcial: "Límite común.", propio: "Aviso propio." },
  cadena: ["nativa-general", "nativa-agente", "denegacion-subagente"].map((regla, i) => ({ indice: i + 1, sujeto: "external_directory", patron: "/ruta/" + "larga".repeat(100), efecto: "ask", origen: { tipo: "nativo", regla }, declaracion: null, prevalece: [] })),
  matriz: { sujetos, motivos: [], noObservados: [], filas: ["build", "agente-largo-".repeat(8)].map((agente, i) => ({ agente, oculto: i === 1, error: null,
    ejesParciales: ["external_directory"], declaraciones: ["parcial"], advertencias: [],
    celdas: sujetos.map((sujeto, n) => ({ sujeto, efecto: n === 1 ? null : "ask", prevalece: n === 1 ? null : n + 1, motivo: n === 1 ? "eje-parcialmente-observado" : null })),
  })) } };
const agentes: RespuestaAgentes = { ...base, agentes: [{ nombre: "build", modo: "primary", origen: "nativo", oculto: false }], eliminados: [], incompleta: false, motivos: [] };
const origen = { tipo: "declarado" as const, orden: 0, posicion: { linea: 2, columna: 3 } };
const valores: RespuestaValores = { ...base, versionRige, herramienta: "opencode", versionHerramienta: "1.18.25", agente: "build", ruta: null, motivo: null, noResueltas: [],
  valores: [{ clave: "description", rastro: { ruta: ["description"], indiceFusion: 0, valor: "texto".repeat(150), motivo: "ultima", desplazadas: [],
    determinante: { valor: "texto".repeat(150), referencia: "/p/opencode.json", via: "proyecto", regla: "ultima", origen } } }] };
const foto = { id: 7, instante: "2026-11-11T12:00:00Z", anteriores: [] };
const contexto = { idResolucion: "7", agente: "build", agentes: agentes.agentes };
const entradas: RespuestaEntradas = { ...base, vias: [{ via: "proyecto", estado: "presente", cantidad: 1, revisados: ["/p/opencode.json"] }] };
const hallazgos: RespuestaHallazgos = { ...base, hallazgos: [], incompleta: false, motivos: [], resumen: { elementos: null,
  hallazgos: { "entrada-ilegible": 0, "entrada-descartada": 0, "sustitucion-sin-valor": 0, "referencia-no-resuelta": 0, "regla-sin-efecto": 0, "elemento-sin-uso": 0 } } };
const sinJson = (s: string) => s.replace(/<script[^]*?<\/script>/g, "");
const visible = (s: string) => sinJson(s).replace(/<[^>]+>/g, "");
function css(selector: string, texto = estilos): string {
  return [...texto.replace(/\/\*[^]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selectores]) => selectores!.split(",").some(s => s.trim() === selector))
    .map(([, , declaraciones]) => declaraciones).join("\n");
}
async function inicio(): Promise<string> {
  return paginaInicio({ esquema: 2, versionRige, almacen: { ruta: "/almacen-privado", versionEsquema: 2 } },
    { esquema: 2, proyectos: [{ proyecto: base.proyecto, id: 7, instante: foto.instante, cantidad: 2 }] }).text();
}

test("T5-22 B-1 matriz con tarjetas por agente bajo 700 y columnas desplazables arriba", async () => {
  const s = await paginaReglas(reglas, "7").text();
  expect(s).toContain('<table class="tabla-matriz">');
  for (const sujeto of sujetos) expect(s).toContain(`data-etiqueta="${sujeto}"`);
  const movil = estilos.split("@media (max-width: 699px) {")[1] ?? "";
  for (const selector of [".tabla-matriz", ".tabla-matriz tbody", ".tabla-matriz tr", ".tabla-matriz td", ".tabla-matriz th[scope=\"row\"]"])
    expect(css(selector, movil)).toMatch(/display:\s*block/);
  expect(css(".tabla-matriz td")).toMatch(/min-width:\s*16rem/);
  expect(css('.tabla-matriz th[scope="row"]')).toMatch(/min-width:\s*12rem/);
  expect(css(".matriz__efectos")).toMatch(/display:\s*inline-flex/);
  expect(css(".matriz__efectos")).toMatch(/gap:/);
  expect(css(".insignia")).toMatch(/white-space:\s*nowrap/);
  expect(JSON.parse(s.match(/id="respuesta">([^]*?)<\/script>/)![1]!)).toEqual(reglas);
});

test("T5-22 B-2 valores largos contenidos en su celda sin perder contenido", async () => {
  const s = await paginaResolucion(valores, foto).text();
  expect(s).toContain('class="tabla-tarjetas tabla-valores"');
  expect(s).toContain("texto".repeat(150));
  expect(css(".tabla-valores")).toMatch(/table-layout:\s*fixed/);
  expect(css(".tabla-valores td")).toMatch(/overflow-wrap:\s*anywhere/);
  for (const selector of ["code", ".ruta", ".ruta__segmento"]) expect(css(selector)).toMatch(/overflow-wrap:\s*anywhere/);
});

test("T5-22 B-3 recientes reservan espacio para reanalizar y truncan solo la ruta", async () => {
  const s = await inicio();
  expect(s).toContain('class="reciente__foto"'); expect(s).toContain('class="reciente__reanalizar"');
  expect(css(".reciente__foto")).toMatch(/min-width:\s*0/);
  expect(css(".reciente__foto")).toMatch(/flex:\s*1 1 0/);
  expect(css(".reciente__reanalizar")).toMatch(/flex-shrink:\s*0/);
  expect(css(".reciente__foto code")).toMatch(/text-overflow:\s*ellipsis/);
});

test("T5-22 B-4 mapa en tarjetas sin encabezados de columna sticky sobre el grupo", async () => {
  const s = await paginaEntradas(entradas).text();
  expect(s).toContain('class="grupo-vias"><th colspan="4" scope="rowgroup">Presentes');
  const movil = estilos.split("@media (max-width: 640px) {").slice(1).join("\n");
  expect(css(".tabla-tarjetas thead th", movil)).toMatch(/position:\s*static/);
  expect(css(".grupo-vias th", movil)).toMatch(/display:\s*block/);
});

test("T5-22 B-5 cadena reserva el sujeto completo y permite cortar patrones largos", async () => {
  const s = await paginaReglas(reglas, "7").text();
  expect(s).toContain('class="tabla-tarjetas tabla-cadena"');
  expect(css('.tabla-cadena td[data-etiqueta="Sujeto"]')).toMatch(/min-width:\s*12rem/);
  expect(css('.tabla-cadena td[data-etiqueta="Sujeto"] code')).toMatch(/overflow-wrap:\s*normal/);
  expect(css('.tabla-cadena td[data-etiqueta="Patrón"] code')).toMatch(/overflow-wrap:\s*anywhere/);
});

test("T5-22 B-6 herramienta sobre el campo con ancho suficiente aun en avanzadas", async () => {
  const s = await paginaConsultasPermiso(agentes, contexto).text();
  expect(s.match(/<label>Herramienta <input/g)).toHaveLength(2);
  expect(css(".formulario-permiso label")).toMatch(/flex-direction:\s*column/);
  expect(css(".formulario-permiso")).toMatch(/repeat\(auto-fit, minmax\(min\(100%, 11rem\), 1fr\)\)/);
});

test("T5-22 M-1 procedencia nativa breve y explicacion integra escapada en title", async () => {
  const declarada = { ...reglas.cadena[0]!, origen, declaracion: { origen, via: "proyecto", referencia: "/p/opencode.json", valor: "allow", regla: "declarada" } };
  const s = sinJson(await paginaReglas({ ...reglas, cadena: [...reglas.cadena, declarada] }, "7").text());
  for (const tipo of ["general", "agente", "final"]) expect(visible(s)).toContain(`OpenCode · ${tipo}`);
  expect(s).toContain('title="nativo · nativa-general: Regla de permiso incorporada en los defaults &lt;general&gt; &amp; &quot;segura&quot;."');
  expect(visible(s)).not.toContain("incorporada en los defaults");
  expect(s).toContain('href="vscode://file/p/opencode.json:2:3"');
});

test("T5-22 M-2 ejes comunes una vez y solo diferencias o errores por agente", async () => {
  const limites = async (r: RespuestaReglas) => sinJson(await paginaReglas(r, "7").text()).split('id="limites-matriz"')[1]!.split("</section>")[0]!;
  const iguales = await limites(reglas);
  expect(visible(iguales)).toContain("Todos los agentes: external_directory");
  expect(iguales.match(/external_directory/g)).toHaveLength(1);
  expect(iguales).not.toContain("<strong>build</strong>");
  const distintas = { ...reglas, matriz: { ...reglas.matriz, filas: reglas.matriz.filas.map((f, i) => i ? { ...f, ejesParciales: [...f.ejesParciales, "otro_eje"], advertencias: ["propio"], error: { codigo: "cadena-incompleta", mensaje: "No observable" } } : f) } };
  const diferentes = await limites(distintas);
  expect(diferentes.match(/external_directory/g)).toHaveLength(1);
  expect(diferentes).toContain("otro_eje"); expect(diferentes).toContain("Aviso propio."); expect(diferentes).toContain("cadena-incompleta: No observable");
  const sinComun = await limites({ ...reglas, matriz: { ...reglas.matriz, filas: reglas.matriz.filas.map((f, i) => ({ ...f, ejesParciales: i ? ["otro_eje"] : f.ejesParciales })) } });
  expect(sinComun).not.toContain("Todos los agentes:"); expect(sinComun).toContain("<strong>build</strong>");
  expect(sinJson(await paginaReglas({ ...reglas, matriz: { ...reglas.matriz, filas: [] } }, "7").text())).not.toContain("Todos los agentes:");
});

test("T5-22 M-3 indice de matriz en title de insignia sin texto visible repetido", async () => {
  const s = sinJson(await paginaReglas(reglas, "7").text()).split('id="matriz-permisos"')[1]!.split("</section>")[0]!;
  expect(s).toMatch(/class="insignia insignia--pregunta" title="Regla 1"/);
  expect(visible(s)).not.toContain("Regla 1");
  expect(s).not.toContain("Regla null");
});

test("T5-22 M-4 reanalizar en cabecera junto a metadatos con ruta codificada", async () => {
  const s = await paginaResumenProyecto(agentes, { exito: true, valor: entradas }, { exito: true, valor: hallazgos }, "7", foto).text();
  const cabecera = s.split('class="cabecera-pagina"')[1]!.split("</section>")[0]!;
  expect(cabecera).toContain('class="acciones metadatos-acciones"');
  expect(cabecera).toContain(`class="boton boton--secundario" href="/resolver?proyecto=${encodeURIComponent(base.proyecto)}">Analizar de nuevo</a>`);
  expect(JSON.parse(s.match(/id="respuesta">([^]*?)<\/script>/)![1]!)).toEqual(agentes);
});

test("T5-22 M-5 regresion de CSS vinculada al HTML de matriz, valores y recientes", async () => {
  for (const s of [await paginaReglas(reglas, "7").text(), await paginaResolucion(valores, foto).text(), await inicio()]) {
    expect(s).toContain('href="/estilos.css"');
    expect(s).not.toMatch(/style=|<script(?! type="application\/json")/);
  }
  expect(css(".tabla-matriz .insignia")).toMatch(/white-space:\s*nowrap/);
  expect(css(".reciente__foto")).toMatch(/min-width:\s*0/);
  expect(css(".tabla-valores td")).toMatch(/overflow-wrap:\s*anywhere/);
});

test("T5-22 M-6 documentos explican tarjetas, procedencia y reanalisis del resumen", async () => {
  for (const archivo of ["README.md", "MANUAL.md"]) {
    const s = await Bun.file(archivo).text();
    for (const frase of ["700 px", "una tarjeta por agente", "OpenCode · general", "Todos los agentes:", "Analizar de nuevo** junto", "texto largo"]) expect(s).toContain(frase);
  }
});
