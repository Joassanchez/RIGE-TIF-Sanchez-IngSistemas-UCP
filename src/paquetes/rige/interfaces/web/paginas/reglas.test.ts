import { describe, expect, test } from "bun:test";
import type { RespuestaReglas } from "../../../aplicacion/respuestas/contrato-generado";
import { paginaReglas } from "./reglas";
import { seccionHtml } from "../../../../../pruebas/utilidades/html";
import { estilos } from "../estilos";

const sinJson = (s: string) => s.replace(/<script[^]*?<\/script>/g, "").replace(/<details id="ver-json">[^]*?<\/details>/g, "");
const visible = (s: string) => sinJson(s).replace(/<[^>]+>/g, "");
const json = (cuerpo: string) => JSON.parse(cuerpo.match(/id="respuesta">([^]*?)<\/script>/)![1]!);

function css(selector: string, texto = estilos): string {
  return [...texto.replace(/\/\*[^]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selectores]) => selectores!.split(",").some(s => s.trim() === selector))
    .map(([, , declaraciones]) => declaraciones).join("\n");
}

describe("T5-13 R-4 rutas y limitaciones", () => {
  test("rutas hostiles escapadas, indices sin reinterpretar y errores de fila visibles sin efecto inventado", async () => {
    const ruta = '/proyecto & "#</script>/opencode.json';
    const origen = { tipo: "declarado" as const, orden: 0, posicion: { linea: 2, columna: 3 } };
    const respuesta: RespuestaReglas = { esquema: 2, proyecto: ruta, entradas: [], resumenEntradas: "a".repeat(64), agente: "build",
      cadena: [{ indice: 1, sujeto: "read", patron: "*", efecto: "ask", origen, prevalece: ["read"],
        declaracion: { origen, via: "proyecto", referencia: ruta, localizacion: `${ruta}:2:3`, valor: "ask", regla: "declarada" } }],
      ejesParciales: [], declaraciones: [], advertencias: [], reglas: { declarada: "Regla declarada" },
      matriz: { sujetos: ["read"], motivos: [], noObservados: [], filas: [
        { agente: "build", oculto: false, error: null, ejesParciales: [], declaraciones: [], advertencias: [],
          celdas: [{ sujeto: "read", efecto: "ask", prevalece: 1, motivo: null }] },
        { agente: "incompleto", oculto: true, error: { codigo: "cadena-incompleta", mensaje: "No observable" },
          ejesParciales: [], declaraciones: [], advertencias: [], celdas: [{ sujeto: "read", efecto: null, prevalece: null, motivo: "cadena-incompleta" }] },
      ] } };
    const pagina = await paginaReglas(respuesta, "7").text();
    expect(pagina).toContain('title="Abrir en VS Code: /proyecto &amp; &quot;#&lt;/script&gt;/opencode.json"');
    expect(pagina).toContain('>.:2:3</a>');
    expect(pagina).not.toContain(ruta);
    expect(pagina).toContain('data-etiqueta="Índice">1</td>');
    expect(pagina).toContain("No observable");
    expect(sinJson(pagina)).not.toContain("cadena-incompleta");
    const filaIncompleta = pagina.slice(pagina.indexOf('>incompleto</a>'));
    expect(filaIncompleta).toContain("sin decisión");
    expect(filaIncompleta).not.toContain("Regla 1");
    expect(pagina.match(/<script\b/g)).toHaveLength(1);
    expect(JSON.parse(pagina.match(/id="respuesta">([^]*?)<\/script>/)![1]!)).toEqual(respuesta);
    expect(pagina).not.toMatch(/style=|(?:src|href)="https?:/);
  });
});

describe("Matriz de permisos y todas las reglas", () => {
  const base = { esquema: 2 as const, proyecto: "/proyecto", entradas: [], resumenEntradas: "a".repeat(64), declaraciones: [], reglas: {} };
  const contexto = { idResolucion: "7", agente: "build", agentes: [{ nombre: "build" }] };
  const reglasZ5: RespuestaReglas = { ...base, agente: "build", cadena: [], ejesParciales: ["external_directory"], declaraciones: [], advertencias: [],
    reglas: { limite: "Observación limitada <fila>", "eje-parcialmente-observado": "El eje externo no se observa por completo." },
    matriz: { sujetos: ["read", "external_directory"], motivos: [], noObservados: [], filas: ["build", "explore", "incompleto", "completo"].map(agente => ({
      agente, oculto: false, error: agente === "incompleto" ? { codigo: "cadena-incompleta", mensaje: "Sin cadena <completa>" } : null,
      ejesParciales: agente === "completo" ? [] : ["external_directory"], declaraciones: agente === "build" ? ["limite"] : [], advertencias: [],
      celdas: [{ sujeto: "read", efecto: agente === "incompleto" ? null : "allow", prevalece: agente === "incompleto" ? null : 1, motivo: agente === "incompleto" ? "cadena-incompleta" : null },
        { sujeto: "external_directory", efecto: null, prevalece: null, motivo: agente === "incompleto" ? "cadena-incompleta" : "eje-parcialmente-observado" }] })) } };

  const sujetosB = ["read", "external_directory", "personalizado"];
  const reglasB: RespuestaReglas = { ...base, agente: "build", ejesParciales: ["external_directory"], advertencias: [],
    reglas: { "nativa-general": 'Regla de permiso incorporada en los defaults <general> & "segura".', "nativa-agente": "Regla nativa del agente.", "denegacion-subagente": "Denegación final del subagente.", parcial: "Límite común.", propio: "Aviso propio." },
    cadena: ["nativa-general", "nativa-agente", "denegacion-subagente"].map((regla, i) => ({ indice: i + 1, sujeto: "external_directory", patron: "/ruta/" + "larga".repeat(100), efecto: "ask", origen: { tipo: "nativo", regla }, declaracion: null, prevalece: [] })),
    matriz: { sujetos: sujetosB, motivos: [], noObservados: [], filas: ["build", "agente-largo-".repeat(8)].map((agente, i) => ({ agente, oculto: i === 1, error: null,
      ejesParciales: ["external_directory"], declaraciones: ["parcial"], advertencias: [],
      celdas: sujetosB.map((sujeto, n) => ({ sujeto, efecto: n === 1 ? null : "ask", prevalece: n === 1 ? null : n + 1, motivo: n === 1 ? "eje-parcialmente-observado" : null })),
    })) } };

  const reglasP5: RespuestaReglas = { ...base, agente: "a/b", cadena: [], ejesParciales: [], advertencias: ["comun"], declaraciones: ["comun"],
    reglas: { comun: "Límite común irrepetible", propio: "Límite propio", "eje-parcialmente-observado": "Observación parcial del eje" },
    matriz: { sujetos: ["personalizado", "external_directory"], motivos: ["comun"], noObservados: [], filas: [
      { agente: "a/b", oculto: false, error: null, ejesParciales: ["external_directory"], declaraciones: ["comun", "propio"], advertencias: ["comun"],
        celdas: [{ sujeto: "personalizado", efecto: "ask", prevalece: 1, motivo: null }, { sujeto: "external_directory", efecto: null, prevalece: null, motivo: "eje-parcialmente-observado" }] },
      { agente: "otro", oculto: false, error: { codigo: "cadena-incompleta", mensaje: "No observable" }, ejesParciales: [], declaraciones: ["comun"], advertencias: [], celdas: [] },
    ] } };

  test("T5-15 Z-5 limites de matriz", async () => {
    const cuerpo = await paginaReglas(reglasZ5, "7", contexto).text();
    const matriz = seccionHtml(cuerpo, "matriz-permisos");
    expect(matriz).not.toContain("Límites de la fila");
    expect(matriz).not.toContain("<details>");
    const filas = [...matriz.matchAll(/<tr[^>]*>(<th scope="row">[^]*?)<\/tr>/g)].map(m => m[1]!);
    expect(filas).toHaveLength(4);
    for (const fila of filas.slice(0, 2)) expect(fila.split("</th>")[0]).not.toContain('>parcial</span>');
    expect(filas[2]!.split("</th>")[0]).toContain('>incompleta</span>');
    expect(filas[3]!.split("</th>")[0]).not.toMatch(/>parcial<|>incompleta</);
    for (const [indice, fila] of filas.entries()) {
      expect(fila.split("</th>")[1]).toContain(indice === 2 ? '>sin decisión</span>' : '>parcial</span>');
    }
    expect(matriz.split("El eje externo no se observa por completo.")).toHaveLength(2);
    const limites = seccionHtml(cuerpo, "limites-analisis");
    expect(cuerpo.indexOf('id="limites-analisis"')).toBeGreaterThan(cuerpo.indexOf('aria-label="Matriz de permisos"'));
    expect(limites).toContain("Qué no cubre este análisis");
    expect(limites).toContain("Observación limitada &lt;fila&gt;");
    expect(limites).toContain("Sin cadena &lt;completa&gt;");
    expect(limites).not.toContain("cadena-incompleta");
    expect(limites).toContain("external_directory");
    expect(json(cuerpo)).toEqual(reglasZ5);
  });

  test("T5-22 B-1 matriz con tarjetas por agente bajo 700 y columnas desplazables arriba", async () => {
    const s = await paginaReglas(reglasB, "7").text();
    expect(s).toContain('<table class="tabla-matriz" role="table">');
    for (const sujeto of sujetosB) expect(s).toContain(`data-etiqueta="${sujeto}"`);
    const movil = estilos.split("@media (max-width: 699px) {")[1] ?? "";
    for (const selector of [".tabla-matriz", ".tabla-matriz tbody", ".tabla-matriz td", ".tabla-matriz th[scope=\"row\"]"])
      expect(css(selector, movil)).toMatch(/display:\s*block/);
    expect(css(".tabla-matriz tr", movil)).toMatch(/display:\s*grid/);
    expect(css(".tabla-matriz td")).toMatch(/min-width:\s*5\.5rem/);
    expect(css('.tabla-matriz th[scope="row"]')).toMatch(/min-width:\s*12rem/);
    expect(css(".matriz__efectos")).toMatch(/display:\s*inline-flex/);
    expect(css(".matriz__efectos")).toMatch(/gap:/);
    expect(css(".insignia")).toMatch(/white-space:\s*nowrap/);
    expect(JSON.parse(s.match(/id="respuesta">([^]*?)<\/script>/)![1]!)).toEqual(reglasB);
  });

  test("T5-22 B-5 cadena reserva el sujeto completo y permite cortar patrones largos", async () => {
    const s = await paginaReglas(reglasB, "7").text();
    expect(s).toContain('class="tabla-tarjetas tabla-cadena"');
    expect(css('.tabla-cadena td[data-etiqueta="Sujeto"]')).toMatch(/min-width:\s*12rem/);
    expect(css('.tabla-cadena td[data-etiqueta="Sujeto"] code')).toMatch(/overflow-wrap:\s*normal/);
    expect(css('.tabla-cadena td[data-etiqueta="Patrón"] code')).toMatch(/overflow-wrap:\s*anywhere/);
  });

  test("T5-22 M-1 procedencia breve sin details en celda y notas unicas bajo la cadena", async () => {
    const origen = { tipo: "declarado" as const, orden: 0, posicion: { linea: 2, columna: 3 } };
    const declarada = { ...reglasB.cadena[0]!, origen, declaracion: { origen, via: "proyecto", referencia: "/p/opencode.json", valor: "allow", regla: "declarada" } };
    const s = sinJson(await paginaReglas({ ...reglasB, cadena: [...reglasB.cadena, declarada] }, "7").text());
    const cadena = seccionHtml(s, "cadena-completa");
    for (const tipo of ["general", "agente", "denegación de subagente"]) expect(visible(cadena)).toContain(`OpenCode · ${tipo}`);
    expect(cadena).toContain('class="procedencia-chip procedencia-chip--nativo"');
    expect(cadena).toContain('class="procedencia-chip procedencia-chip--declarado"');
    expect(cadena).not.toContain("<details");
    expect(cadena).not.toContain('title="nativa-');
    expect(cadena).toContain('<ul class="notas-reglas">');
    expect(visible(cadena).split("incorporada en los defaults").length - 1).toBe(1);
    expect(cadena).toContain('href="vscode://file/p/opencode.json:2:3"');
  });

  test("T5-22 M-2 ejes comunes una vez y solo diferencias o errores por agente", async () => {
    const limites = async (r: RespuestaReglas) => seccionHtml(sinJson(await paginaReglas(r, "7").text()), "limites-analisis");
    const iguales = await limites(reglasB);
    expect(visible(iguales)).toContain("Todos los agentes: Acceso a carpetas fuera del proyecto (external_directory)");
    expect(iguales.match(/external_directory/g)).toHaveLength(1);
    expect(iguales).not.toContain("<strong>build</strong>");
    const distintas = { ...reglasB, matriz: { ...reglasB.matriz, filas: reglasB.matriz.filas.map((f, i) => i ? { ...f, ejesParciales: [...f.ejesParciales, "otro_eje"], advertencias: ["propio"], error: { codigo: "cadena-incompleta", mensaje: "No observable" } } : f) } };
    const diferentes = await limites(distintas);
    expect(diferentes.match(/external_directory/g)).toHaveLength(1);
    expect(diferentes).toContain("otro_eje"); expect(diferentes).toContain("Aviso propio."); expect(diferentes).toContain("No observable"); expect(diferentes).not.toContain("cadena-incompleta");
    const sinComun = await limites({ ...reglasB, matriz: { ...reglasB.matriz, filas: reglasB.matriz.filas.map((f, i) => ({ ...f, ejesParciales: i ? ["otro_eje"] : f.ejesParciales })) } });
    expect(sinComun).not.toContain("Todos los agentes:"); expect(sinComun).toContain("<strong>build</strong>");
    expect(sinJson(await paginaReglas({ ...reglasB, matriz: { ...reglasB.matriz, filas: [] } }, "7").text())).not.toContain("Todos los agentes:");
  });

  test("T5-22 M-3 celda de matriz usa rol de color, glifo y texto oculto sin Regla N", async () => {
    const s = sinJson(await paginaReglas(reglasB, "7").text()).split('id="matriz-permisos"')[1]!.split("</section>")[0]!;
    expect(s).toContain('class="celda-matriz rol--pregunta"');
    expect(s).toContain('<span>?</span><span class="visualmente-oculto">pregunta</span>');
    expect(s).toContain('href="/resoluciones/7/permisos?agente=build&amp;sujeto=');
    expect(s).not.toContain('href="/resoluciones/7/permisos?id=7');
    expect(s).not.toContain("Regla 1");
    expect(s).not.toContain("Regla null");
  });

  test("T6-23 I-1 leyenda de matriz, chips de prevalencia con rotulo y vacio como raya", async () => {
    const s = sinJson(await paginaReglas({
      ...reglasB,
      cadena: [{ ...reglasB.cadena[0]!, prevalece: ["read", "edit"] }, ...reglasB.cadena.slice(1)],
    }, "7").text());
    const matriz = seccionHtml(s, "matriz-permisos");
    expect(matriz).toContain('class="leyenda-matriz"');
    expect(matriz).toContain('class="leyenda-chip rol--parcial">◐ parcial: RIGE no puede decidirlo sin conocer el objetivo concreto</li>');
    const cadena = seccionHtml(s, "cadena-completa");
    expect(cadena).toContain('class="lista-chips__rotulo">Sujetos donde prevalece</span>');
    expect(cadena).toContain('class="chip"');
    expect(cadena).not.toContain("ninguna");
    const sinPrevalece = sinJson(await paginaReglas({
      ...reglasB,
      cadena: [{ ...reglasB.cadena[0]!, prevalece: [] }],
    }, "7").text());
    expect(seccionHtml(sinPrevalece, "cadena-completa")).toContain('data-etiqueta="Prevalece para *"><span class="atenuado">—</span></td>');
  });

  test("T6-15 X-2 fila del agente seleccionado primera con aria-current", async () => {
    const cuerpo = await paginaReglas({ ...reglasZ5, agente: "explore" }, "7", { ...contexto, agente: "explore" }).text();
    const matriz = seccionHtml(cuerpo, "matriz-permisos");
    expect(matriz).toContain("<h2>Permisos por agente</h2>");
    expect(cuerpo).toContain("<h2>Cadena de explore</h2>");
    expect(matriz).toMatch(/<tbody>\s*<tr[^>]*aria-current="true"[^>]*><th scope="row"><a[^>]*>explore<\/a>/);
  });

  test("P-5 matriz primero, sujetos propios y límites comunes una sola vez", async () => {
    const cuerpo = await paginaReglas(reglasP5, "7", contexto).text();
    expect(cuerpo.indexOf('id="matriz-permisos"')).toBeLessThan(cuerpo.indexOf('id="cadena-completa"'));
    expect(cuerpo).toContain('aria-current="page">Todas las reglas</span>');
    expect(cuerpo.match(/Límite común irrepetible/g)).toHaveLength(3); // HTML una vez, script JSON una vez y Ver JSON una vez.
    expect(cuerpo).toContain("Límite propio"); expect(cuerpo).toContain("No observable"); expect(sinJson(cuerpo)).not.toContain("cadena-incompleta");
    expect(cuerpo).toContain("sujeto=personalizado"); expect(cuerpo).toContain("sujeto=external_directory");
    expect(cuerpo).toContain("parcial"); expect(cuerpo).toContain('<span>?</span><span class="visualmente-oculto">pregunta</span>'); expect(cuerpo).toContain('<span>◐</span><span class="visualmente-oculto">parcial</span>');
    expect(json(cuerpo)).toEqual(reglasP5);
  });
});
