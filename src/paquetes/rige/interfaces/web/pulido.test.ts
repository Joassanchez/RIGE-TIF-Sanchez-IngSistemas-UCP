import { fechaLocal, fechaRelativa, nombreAnalisis } from "./textos";
import { describe, expect, test } from "bun:test";
import type { RespuestaComparacion, RespuestaReglas, RespuestaValores } from "../../aplicacion/respuestas/contrato-generado";
import { versionRige } from "../../aplicacion/respuestas/estado";
import { estilos } from "./estilos";
import { paginaResolucion } from "./paginas/resolucion";
import { paginaEntradas } from "./paginas/entradas";
import { paginaAgentes } from "./paginas/agentes";
import { paginaHallazgos } from "./paginas/hallazgos";
import { paginaPermiso } from "./paginas/permiso";
import { paginaConsultasPermiso } from "./paginas/consultas-permiso";
import { paginaReglas } from "./paginas/reglas";
import { paginaComparacion } from "./paginas/comparacion";
import { paginaInicio } from "./paginas/inicio";
import { paginaErrorUso } from "./intermedios/errores";
import { seccionHtml, textoHtml } from "../../../../pruebas/utilidades/html";

const base = { esquema: 2 as const, proyecto: "/proyecto", entradas: [], resumenEntradas: "a".repeat(64), declaraciones: [], reglas: {} };
const valores: RespuestaValores = { ...base, versionRige, herramienta: "opencode", versionHerramienta: "1.18.25", agente: "build", ruta: null,
  motivo: null, noResueltas: [], valores: [{ clave: "temperature", rastro: { ruta: ["temperature"], indiceFusion: 0, valor: 0.3,
    determinante: { valor: 0.3, origen: { tipo: "nativo", regla: "nativa" }, via: null, referencia: null, regla: "nativa" }, desplazadas: [], motivo: "nativo" } }] };
const sobre = { id: 7, instante: "2026-11-10T12:00:00Z", anteriores: [] };
const contexto = { idResolucion: 7, agente: "build", agentes: [{ nombre: "build" }], clave: "temperature", q: "TEMP" };
const agentes = { ...base, agentes: [{ nombre: "build", origen: "nativo" as const, modo: "primary", oculto: false }], eliminados: [], incompleta: false, motivos: [] };
const estado = { esquema: 2 as const, versionRige, almacen: { ruta: "/temporal/rige.db", versionEsquema: 2 } };
const conteosHallazgos = { "entrada-ilegible": 0, "entrada-descartada": 0, "sustitucion-sin-valor": 0,
  "referencia-no-resuelta": 0, "regla-sin-efecto": 0, "elemento-sin-uso": 0 };
const reglas: RespuestaReglas = { ...base, agente: "build", cadena: [], ejesParciales: ["external_directory"], declaraciones: [], advertencias: [],
  reglas: { limite: "Observación limitada <fila>", "eje-parcialmente-observado": "El eje externo no se observa por completo." },
  matriz: { sujetos: ["read", "external_directory"], motivos: [], noObservados: [], filas: ["build", "explore", "incompleto", "completo"].map(agente => ({
    agente, oculto: false, error: agente === "incompleto" ? { codigo: "cadena-incompleta", mensaje: "Sin cadena <completa>" } : null,
    ejesParciales: agente === "completo" ? [] : ["external_directory"], declaraciones: agente === "build" ? ["limite"] : [], advertencias: [],
    celdas: [{ sujeto: "read", efecto: agente === "incompleto" ? null : "allow", prevalece: agente === "incompleto" ? null : 1, motivo: agente === "incompleto" ? "cadena-incompleta" : null },
      { sujeto: "external_directory", efecto: null, prevalece: null, motivo: agente === "incompleto" ? "cadena-incompleta" : "eje-parcialmente-observado" }] })) } };
const foto = { id: 1, instante: sobre.instante, entradas: [], resumenEntradas: "", noComparables: [], motivosAgentes: [], reglas: {} };
const comparacion: RespuestaComparacion = { esquema: 2, proyecto: base.proyecto, desde: foto, hasta: { ...foto, id: 2 },
  agentes: { agregados: [], quitados: [], comunes: ["build", "compaction", "explore"], inciertos: [] }, parcial: false, sustituciones: "solo-representacion-protegida",
  resumen: { cambiadas: 1, agregadas: 0, quitadas: 0, sinCambio: 12 }, comparaciones: [
    { agente: "build", resumen: { cambiadas: 1, agregadas: 0, quitadas: 0, sinCambio: 0 }, cambios: [
      { ruta: ["a", "b"], tipo: "cambiada", motivos: ["valor"], antes: { valor: 1, determinante: valores.valores[0]!.rastro.determinante },
        despues: { valor: 2, determinante: valores.valores[0]!.rastro.determinante } }] },
    ...["compaction", "explore"].map(agente => ({ agente, resumen: { cambiadas: 0, agregadas: 0, quitadas: 0, sinCambio: 6 }, cambios: [] })) ] };
const json = (cuerpo: string) => JSON.parse(cuerpo.match(/id="respuesta">([^]*?)<\/script>/)![1]!);
const css = (selector: string) => [...estilos.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .filter(([, selectores]) => selectores!.split(",").some(s => s.trim() === selector)).map(m => m[2]).join("\n");

describe("T5-15 Z-1 un campo visible y estado", () => {
  test("buscar queda visible; la consulta exacta cerrada conserva ayuda y ambos estados", async () => {
    const cuerpo = await paginaResolucion(valores, sobre, contexto).text();
    expect(cuerpo).not.toContain("Consulta exacta (avanzada)");
    expect(cuerpo).not.toContain('id="consultar-clave"');
    expect(cuerpo).toContain('name="q" value="TEMP"');
    expect(cuerpo).toContain('type="hidden" name="clave" value="temperature"');
    expect(cuerpo).not.toMatch(/<input(?![^>]*type="hidden")[^>]*name="clave"/);
    expect(cuerpo).not.toContain('aria-label="Panel del proyecto"');
    expect(json(cuerpo)).toEqual(valores);
  });
});

describe("T5-15 Z-2 orden del panel", () => {
  test("pestanas, titulo y metadatos, agente, filtros y valores", async () => {
    const cuerpo = await paginaResolucion({ ...valores, declaraciones: ["nota"], reglas: { nota: "Nota del análisis" } }, sobre, contexto).text();
    const posiciones = ['id="resumen-resolucion"', 'id="seleccionar-agente"', 'id="declaraciones"', 'id="valores"', 'id="filtrar-claves"'].map(s => cuerpo.indexOf(s));
    expect(posiciones.every(p => p >= 0)).toBe(true);
    expect(posiciones).toEqual([...posiciones].sort((a, b) => a - b));
  });
});

describe("T5-15 Z-3 instante unico", () => {
  test("no repite instante en metadatos", async () => {
    const resumen = seccionHtml(await paginaResolucion(valores, sobre).text(), "resumen-resolucion");
    expect(resumen).toContain(nombreAnalisis(base.proyecto, sobre.instante));
    expect(resumen.split(fechaLocal(sobre.instante))).toHaveLength(2);
    expect(resumen).not.toMatch(/<dt>Instante/);
  });
});

describe("T5-15 Z-4 insignias enteras", () => {
  test("insignias sin salto dentro del contenedor de tabla desplazable", () => {
    expect(css(".insignia")).toMatch(/white-space:\s*nowrap/);
    expect(css(".insignia")).toMatch(/overflow-wrap:\s*normal/);
    expect(css(".tabla-contenedor")).toMatch(/overflow-x:\s*auto/);
  });
});

describe("T5-15 Z-5 limites de matriz", () => {
  test("insignias por fila y celda; limites y leyenda una vez, sin perder datos", async () => {
    const cuerpo = await paginaReglas(reglas, "7", contexto).text();
    const matriz = seccionHtml(cuerpo, "matriz-permisos");
    expect(matriz).not.toContain("Límites de la fila");
    expect(matriz).not.toContain("<details>");
    const filas = [...matriz.matchAll(/<tr>(<th scope="row">[^]*?)<\/tr>/g)].map(m => m[1]!);
    expect(filas).toHaveLength(4);
    for (const fila of filas.slice(0, 2)) expect(fila.split("</th>")[0]).toContain('>parcial</span>');
    expect(filas[2]!.split("</th>")[0]).toContain('>incompleta</span>');
    expect(filas[3]!.split("</th>")[0]).not.toMatch(/>parcial<|>incompleta</);
    for (const [indice, fila] of filas.entries()) {
      expect(fila.split("</th>")[1]).toContain(indice === 2 ? '>sin decisión</span>' : '>parcial</span>');
    }
    expect(matriz.split("El eje externo no se observa por completo.")).toHaveLength(2);
    const limites = seccionHtml(cuerpo, "limites-matriz");
    expect(cuerpo.indexOf('id="limites-matriz"')).toBeGreaterThan(cuerpo.indexOf('aria-label="Matriz de permisos"'));
    expect(limites).toContain("Observación limitada &lt;fila&gt;");
    expect(limites).toContain("cadena-incompleta: Sin cadena &lt;completa&gt;");
    expect(limites).toContain("external_directory");
    expect(json(cuerpo)).toEqual(reglas);
  });
});

describe("T5-15 Z-6 mapa agrupado", () => {
  test("presentes, ausentes, no observadas; mantiene orden interno y JSON original", async () => {
    const respuesta = { ...base, vias: [
      { via: "remota", estado: "no_observada" as const, cantidad: 0, revisados: [] },
      { via: "vacia", estado: "ausente" as const, cantidad: 0, revisados: [] },
      ...["segunda", "primera"].map(via => ({ via, estado: "presente" as const, cantidad: 1, revisados: [] })) ] };
    const cuerpo = await paginaEntradas(respuesta).text();
    const mapa = seccionHtml(cuerpo, "mapa-vias");
    const posiciones = ["Presentes", ">segunda</td>", ">primera</td>", "Ausentes", ">vacia</td>", "No observadas", ">remota</td>"].map(s => mapa.indexOf(s));
    expect(posiciones.every(p => p >= 0)).toBe(true);
    expect(posiciones).toEqual([...posiciones].sort((a, b) => a - b));
    expect(json(cuerpo)).toEqual(respuesta);
  });
});

describe("T5-15 Z-7 coherencia de vistas", () => {
  test("cabeceras y selector despues de metadatos en cada vista del panel; CSS comun y tarjetas", async () => {
    const paginas = [paginaAgentes(agentes, "7", contexto.clave, contexto), paginaEntradas(base, contexto),
      paginaHallazgos({ ...base, hallazgos: [], incompleta: false, motivos: [], resumen: { elementos: null, hallazgos: conteosHallazgos } }, contexto),
      paginaConsultasPermiso(agentes, contexto), paginaReglas(reglas, "7", contexto),
      paginaPermiso({ ...base, agente: "build", consulta: { sujeto: "read", objetivo: ".env", objetivoEvaluado: ".env", forma: "sujeto" }, decision: null,
        motivoSinDecision: "ninguna", determinante: null, desplazadas: [], nativaAnulada: null, advertencias: [], cadena: [], explicacion: [], porDefecto: true }, "7", contexto)];
    for (const pagina of paginas) {
      const cuerpo = await pagina.text();
      const cabecera = cuerpo.match(/<(?:section|div)[^>]*class="cabecera-pagina"[^>]*>([^]*?)<\/(?:section|div)>/);
      expect(cabecera).not.toBeNull();
      expect(cabecera![1]).toContain("<h1>");
      expect(cabecera![1]).toContain("proyecto");
      const selector = cuerpo.includes('id="seleccionar-agente"') ? 'id="seleccionar-agente"' : 'id="consultar-permiso"';
      expect(cuerpo.indexOf(selector)).toBeGreaterThan(cuerpo.indexOf(cabecera![0]) + cabecera![0].length - 1);
      expect(cuerpo).not.toMatch(/style=|<style\b|<script(?! type="application\/json")/);
    }
    for (const pagina of [paginaInicio(estado), paginaComparacion(comparacion), paginaErrorUso({ codigo: "proyecto-inexistente", mensaje: "No existe" })]) {
      const cuerpo = await pagina.text();
      expect(cuerpo).toContain('href="/estilos.css"');
      expect(cuerpo.match(/<h1>/g)).toHaveLength(1);
    }
    expect(css(".filtros")).toMatch(/grid-template-columns:\s*minmax\(0,\s*1fr\)/);
    expect(css(".filtros > *")).toMatch(/width:\s*100%/);
    expect(css(".cabecera-pagina")).toMatch(/margin-bottom:\s*2rem/);
    for (const selector of ["h1", ".cabecera-pagina h1", ".pagina-error h1"])
      expect(css(selector)).toMatch(/font-size:\s*1\.75rem/);
    expect(estilos).toContain("@media (max-width: 640px)");
    expect(css(".tabla-tarjetas td[data-etiqueta]::before")).toContain("attr(data-etiqueta)");
  });
});

describe("T5-15 Z-8 documentacion", () => {
  test("nombres finales en ejecucion y verificacion", async () => {
    for (const archivo of ["README.md", "MANUAL.md"]) {
      const documento = await Bun.file(archivo).text();
      const ejecucion = documento.split("## 6.")[1]!.split("## 7.")[0]!;
      for (const texto of ["Buscar clave", "Resumen del proyecto", "Historial", "Presentes", "Ausentes", "No observadas", "tarjeta abre", "Sin cambios:"]) expect(ejecucion).toContain(texto);
    }
    const verificacion = (await Bun.file("MANUAL.md").text()).split("## 8.")[1]!;
    expect(verificacion).toContain("Resumen del proyecto → build");
  });
});

describe("T5-15 Z-9 comparar", () => {
  test("compacta sin cambios y ofrece columnas, ruta legible, resumen y tiempos legibles", async () => {
    const cuerpo = await paginaComparacion(comparacion).text();
    expect(textoHtml(cuerpo)).toContain("Sin cambios: compaction (6), explore (6)");
    for (const nombre of ["compaction", "explore"]) expect(cuerpo).not.toContain(`<h2>Agente ${nombre}</h2>`);
    expect(cuerpo).toContain('<nav class="pestanas" aria-label="Filtrar comparación">');
    expect(cuerpo).toContain('<th>Clave</th><th>Antes</th><th>Después</th>');
    expect(cuerpo).toContain('data-etiqueta="Antes"');
    expect(cuerpo).toContain('data-etiqueta="Después"');
    expect(cuerpo).toContain('title="[&quot;a&quot;,&quot;b&quot;]">a › b</code>');
    const resumen = seccionHtml(cuerpo, "resumen-comparacion");
    expect(resumen.match(/class="insignia /g)?.length).toBeGreaterThanOrEqual(3);
    expect(resumen).toContain("Antes"); expect(resumen).toContain("Después");
    expect(resumen).toContain(fechaLocal(sobre.instante));
    expect(json(cuerpo)).toEqual(comparacion);
    expect(css(".tabla-tarjetas .comparacion-flecha")).toMatch(/display:\s*none/);
  });
});

describe("T5-15 Z-10 plurales", () => {
  test("estadisticas concuerdan con cero, uno y varios, incluidos los seis tipos", async () => {
    for (const cantidad of [0, 1, 2]) {
      const respuesta = { ...base, hallazgos: [], incompleta: false, motivos: [], resumen: { elementos: { agentes: cantidad, comandos: cantidad, entradas: cantidad },
        hallazgos: { "entrada-ilegible": cantidad, "entrada-descartada": cantidad, "sustitucion-sin-valor": cantidad,
          "referencia-no-resuelta": cantidad, "regla-sin-efecto": cantidad, "elemento-sin-uso": cantidad } } };
      const cuerpo = await paginaHallazgos(respuesta).text();
      const resumen = seccionHtml(cuerpo, "resumen-hallazgos");
      const nombres = cantidad === 1 ? ["Entrada ilegible", "Entrada descartada", "Sustitución sin valor", "Referencia no resuelta", "Regla sin efecto", "Elemento sin uso"]
        : ["Entradas ilegibles", "Entradas descartadas", "Sustituciones sin valor", "Referencias no resueltas", "Reglas sin efecto", "Elementos sin uso"];
      for (const nombre of nombres) expect(resumen).toContain(`>${nombre}</span><strong>${cantidad}</strong>`);
      for (const nombre of cantidad === 1 ? ["Agente", "Comando", "Entrada"] : ["Agentes", "Comandos", "Entradas"])
        expect(resumen).toContain(`<strong>${cantidad}</strong><span>${nombre}</span>`);
      expect(json(cuerpo)).toEqual(respuesta);
    }
  });
  test("singular y plural en conteos sin modificar JSON", async () => {
    const cuerpo = await paginaResolucion(valores, sobre, { q: "temperature" }).text();
    expect(textoHtml(cuerpo)).toContain("1 valor");
    expect(textoHtml(cuerpo)).not.toContain("1 valores");
    expect(textoHtml(cuerpo)).toContain("1 de 1 clave");
    const comparada = textoHtml(await paginaComparacion(comparacion).text());
    expect(comparada).toContain("1 cambio"); expect(comparada).not.toContain("1 cambios");
    const nueva = { ...comparacion, comparaciones: [{ ...comparacion.comparaciones[0]!, resumen: { cambiadas: 1, agregadas: 1, quitadas: 1, sinCambio: 1 } }] };
    const texto = textoHtml(await paginaComparacion(nueva).text());
    for (const fragmento of ["1 cambio", "1 clave nueva", "1 quitada", "1 clave sin cambio"]) expect(texto).toContain(fragmento);
    for (const cantidad of [0, 1, 2]) {
      const inicio = textoHtml(await paginaInicio(estado, { esquema: 2, proyectos: [{ proyecto: "/p", id: 7, instante: sobre.instante, cantidad }] }).text());
      expect(inicio).toContain(`${cantidad} análisis`);
    }
  });
});

describe("T5-15 Z-11 inicio", () => {
  test("ayuda separada y recientes con instante legible, accion principal y tarjeta movil", async () => {
    const cuerpo = await paginaInicio(estado, { esquema: 2, proyectos: [{ proyecto: '/p & "<x>', id: 7, instante: sobre.instante, cantidad: 1 }] }).text();
    expect(cuerpo).toContain('id="ayuda-analizar"');
    expect(css("#ayuda-analizar")).toMatch(/margin-top:\s*1rem/);
    const recientes = seccionHtml(cuerpo, "proyectos-recientes");
    expect(recientes).toContain(fechaRelativa(sobre.instante, new Date()));
    expect(recientes).toContain(`datetime="${sobre.instante}"`);
    expect(recientes).toContain('class="reciente__foto" href="/resoluciones/7"');
    expect(recientes).toContain('class="reciente__reanalizar"');
    expect(recientes).toContain("/p &amp; &quot;&lt;x&gt;");
    expect(css(".recientes li")).toMatch(/flex-direction:\s*column/);
    expect(css(".recientes li")).toMatch(/align-items:\s*stretch/);
    expect(cuerpo).not.toContain("<script");
  });
});
