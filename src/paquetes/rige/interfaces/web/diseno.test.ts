import { describe, expect, test } from "bun:test";
import { crearManejador, type CasosWeb } from "./servidor";
import { versionRige } from "../../aplicacion/respuestas/estado";
import type { RespuestaValores, RespuestaPermiso, RespuestaHallazgos, RespuestaEntradas, RespuestaAgentes } from "../../aplicacion/respuestas/contrato-generado";
import { paginaInicio } from "./paginas/inicio";
import { paginaResolucion } from "./paginas/resolucion";
import { paginaPermiso } from "./paginas/permiso";
import { paginaHallazgos } from "./paginas/hallazgos";
import { paginaEntradas } from "./paginas/entradas";
import { paginaAgentes } from "./paginas/agentes";
import { paginaErrorUso, conErrores } from "./intermedios/errores";
import { redirigir } from "./respuesta";
import { textoHtml } from "../../../../pruebas/utilidades/html";

const ataque = '<script>"&';
const base = { esquema: 2 as const, proyecto: `/p/${ataque}`, entradas: [], resumenEntradas: "a".repeat(64),
  declaraciones: ["aviso"], reglas: { aviso: ataque } };
const estado = { esquema: 2 as const, versionRige, almacen: { ruta: "/privado/rige.db", versionEsquema: 2 } };
const valores: RespuestaValores = { ...base, versionRige, herramienta: "opencode", versionHerramienta: "1.18.25",
  agente: "build", ruta: null, valores: [], noResueltas: [{ ruta: ["tools"], regla: "aviso" }], motivo: null };
const permiso: RespuestaPermiso = { ...base, agente: "build", consulta: { sujeto: "read", objetivo: ataque,
  objetivoEvaluado: ataque, forma: "sujeto" }, decision: "allow", motivoSinDecision: null, determinante: 0,
  desplazadas: [1], nativaAnulada: null, advertencias: ["aviso"], porDefecto: false, explicacion: [ataque],
  cadena: [0, 1].map(indice => ({ indice, sujeto: "read", patron: ataque, efecto: indice ? "ask" : "allow",
    origen: { tipo: "nativo" as const, regla: "aviso" }, declaracion: null })) };
const agentes: RespuestaAgentes = { ...base, agentes: [{ nombre: ataque, origen: "declarado", modo: "primary", oculto: true }],
  eliminados: [], incompleta: true, motivos: ["aviso"] };
const entradas: RespuestaEntradas = { ...base, entradas: [{ orden: 1, via: "proyecto", referencia: ataque,
  condicion: "observada", resumen: null, legibilidad: "ilegible", error: { linea: 3, columna: 5, consecuencia: "falla" } }] };
const hallazgos: RespuestaHallazgos = { ...base, hallazgos: [], incompleta: false, motivos: [], resumen: {
  elementos: { agentes: 2, comandos: 3, entradas: 4 }, hallazgos: { "entrada-ilegible": 0, "entrada-descartada": 0,
    "sustitucion-sin-valor": 0, "referencia-no-resuelta": 0, "regla-sin-efecto": 0, "elemento-sin-uso": 0 } } };
const sobre = { id: 7, instante: "2026-11-09T12:00:00Z", anteriores: [{ id: 7, instante: "2026-11-09T12:00:00Z", resumenEntradas: base.resumenEntradas }] };
const casos: CasosWeb = { consultarEstado: () => ({ exito: true, valor: estado }),
  compararResoluciones: () => { throw new Error("No comparar en este doble"); },
  consultarProyectosRecientes: () => ({ exito: true, valor: { esquema: 2, proyectos: [] } }),
  consultarReglas: () => { throw new Error("No consultar reglas en este doble"); },
  consultarResolucion: () => ({ exito: true, valor: { respuesta: valores, sobre } }),
  consultarEntradas: () => ({ exito: true, valor: entradas }), consultarHallazgos: () => ({ exito: true, valor: hallazgos }),
  consultarAgentes: () => ({ exito: true, valor: agentes }), consultarPermiso: () => ({ exito: true, valor: permiso }),
  resolverProyecto: () => ({ exito: true, valor: { id: 7 } }) };
const manejar = crearManejador(12345, casos);
const solicitar = (ruta: string, headers: Record<string, string> = { Host: "localhost:12345" }, method = "GET") =>
  manejar(new Request(`http://127.0.0.1${ruta}`, { headers, method }));

describe("T5-17 G-3 cabeceras concisas", () => {
  test("cada vista formula una pregunta y pliega su explicacion sin perder metadatos", async () => {
    for (const pagina of [paginaResolucion(valores, sobre), paginaPermiso(permiso), paginaAgentes(agentes), paginaEntradas(entradas), paginaHallazgos(hallazgos)]) {
      const cuerpo = await pagina.text();
      const cabecera = cuerpo.includes('id="resumen-resolucion"') ? seccion(cuerpo, "resumen-resolucion")
        : cuerpo.match(/<div class="cabecera-pagina">([^]*?)<\/div>/)![1]!;
      const sinDetalles = cabecera.replace(/<details[^]*?<\/details>/g, "");
      expect(sinDetalles).not.toContain('class="ceja"');
      expect(sinDetalles.match(/<p>/g)).toHaveLength(1);
      expect(sinDetalles).toMatch(/<p>¿[^<]+\?<\/p>/);
      expect(cabecera).toContain("¿Qué significa?");
      expect(cabecera).not.toMatch(/<details[^>]*\bopen\b/);
      expect(cabecera).toContain('class="ruta"');
    }
  });
});

function seccion(cuerpo: string, id: string): string {
  const hallada = new RegExp(`<section[^>]*id="${id}"[^>]*>(.*?)</section>`, "s").exec(cuerpo);
  expect(hallada).not.toBeNull();
  return hallada![1]!;
}

describe("T5-08 U-1 U-11 P-4 estilos y seguridad", () => {
  test("sirve CSS sin consultar casos y con las defensas compartidas", async () => {
    let llamadas = 0;
    const noConsultar = () => { llamadas++; throw new Error("No consultar"); };
    const cssManejar = crearManejador(12345, { consultarEstado: noConsultar, consultarResolucion: noConsultar,
      compararResoluciones: noConsultar, consultarProyectosRecientes: noConsultar,
      consultarEntradas: noConsultar, consultarHallazgos: noConsultar, consultarAgentes: noConsultar,
      consultarPermiso: noConsultar, consultarReglas: noConsultar, resolverProyecto: noConsultar });
    for (const sitio of [undefined, "same-origin", "none"]) {
      const respuesta = cssManejar(new Request("http://127.0.0.1/estilos.css", {
        headers: { Host: "localhost:12345", ...(sitio ? { "Sec-Fetch-Site": sitio } : {}) },
      }));
      expect(respuesta.status).toBe(200);
      expect(respuesta.headers.get("content-type")).toBe("text/css; charset=utf-8");
      expect(respuesta.headers.get("cache-control")).toBe("public, max-age=300");
      expect(respuesta.headers.get("content-security-policy")).toBe("default-src 'none'; style-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
      expect(respuesta.headers.get("x-content-type-options")).toBe("nosniff");
      expect(respuesta.headers.get("referrer-policy")).toBe("no-referrer");
      expect([...respuesta.headers.keys()].some(n => n.startsWith("access-control-"))).toBe(false);
      expect((await respuesta.text()).length).toBeGreaterThan(1000);
    }
    expect(llamadas).toBe(0);
  });
  test("protege la hoja con toda la matriz de origen y metodo", async () => {
    for (const headers of [{}, { Host: "ajeno.example" }, ...["cross-site", "same-site", "desconocido"].map(sitio =>
      ({ Host: "localhost:12345", "Sec-Fetch-Site": sitio }))]) {
      const respuesta = solicitar("/estilos.css", headers);
      expect(respuesta.status).toBe(403);
      const cuerpo = await respuesta.text();
      expect(cuerpo).toContain('href="/estilos.css"');
      expect(cuerpo).not.toContain(versionRige);
      expect(cuerpo).not.toContain(estado.almacen.ruta);
      expect(cuerpo).not.toContain(base.proyecto);
    }
    for (const metodo of ["POST", "HEAD", "PUT", "DELETE", "PATCH", "OPTIONS"]) {
      const respuesta = solicitar("/estilos.css", { Host: "localhost:12345" }, metodo);
      expect(respuesta.status).toBe(405);
      expect(respuesta.headers.get("allow")).toBe("GET");
    }
  });
});

describe("T5-08 U-2 U-10 U-11 P-1 P-2 P-3 P-6", () => {
  test("todas las paginas comparten diseno, escape y recursos locales; JSON solo en consultas", async () => {
    const paginas: [Response, unknown | null][] = [[paginaInicio(estado), null], [paginaResolucion(valores, sobre), valores],
      [paginaPermiso(permiso), permiso], [paginaAgentes(agentes), agentes], [paginaEntradas(entradas), entradas],
      [paginaHallazgos(hallazgos), hallazgos], [paginaErrorUso({ codigo: "desconocido", mensaje: ataque }), null],
      [conErrores(() => { throw new Error(ataque); })(new Request("http://127.0.0.1/")), null],
      [solicitar("/ausente"), null], [solicitar("/", {}), null], [solicitar("/", { Host: "localhost:12345" }, "POST"), null],
      [redirigir("/resoluciones/7?agente=build"), null]];
    for (const [respuesta, dato] of paginas) {
      const cuerpo = await respuesta.text();
      for (const fragmento of ['<!doctype html>', '<html lang="es">', '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">', '<meta name="color-scheme" content="light dark">',
        '<link rel="stylesheet" href="/estilos.css">', 'Saltar al contenido', '<header', '<main id="contenido"',
        '<footer', 'Local · solo lectura · sin red']) expect(cuerpo).toContain(fragmento);
      expect(cuerpo).not.toMatch(/\sstyle\s*=|<style\b|(?:href|src)=["'](?:https?:|\/\/)/i);
      const bloques = [...cuerpo.matchAll(/<script type="application\/json" id="respuesta">([^]*?)<\/script>/g)];
      expect(bloques).toHaveLength(dato === null ? 0 : 1);
      if (dato !== null) expect(JSON.parse(bloques[0]![1]!)).toEqual(dato);
      expect(cuerpo.replace(/<script type="application\/json" id="respuesta">[^]*?<\/script>/g, "")).not.toMatch(/<script/i);
      expect(respuesta.headers.get("cache-control")).toBe("no-store");
    }
  });
  test("codifica navegacion y marca la pagina activa sin agregar contexto al JSON", async () => {
    for (const [ruta, activo] of [["/entradas?proyecto=p", "Entradas"], ["/hallazgos?proyecto=p", "Hallazgos"], ["/agentes?id=7", "Agentes"]]) {
      const cuerpo = await solicitar(ruta!).text();
      if (activo === "Agentes") expect(cuerpo).toContain(`href="/entradas?proyecto=${encodeURIComponent(base.proyecto)}&amp;id=7&amp;agente=${encodeURIComponent(ataque)}"`);
      else expect(cuerpo).not.toContain('aria-label="Panel del proyecto"');
      if (activo === "Agentes") expect(cuerpo).toContain(`href="/hallazgos?proyecto=${encodeURIComponent(base.proyecto)}&amp;id=7&amp;agente=${encodeURIComponent(ataque)}"`);
      expect(cuerpo).toMatch(new RegExp(`aria-current="page">${activo}</(?:a|span)>`));
      expect(cuerpo.includes('href="/agentes?id=7&amp;agente=')).toBe(activo === "Agentes");
      expect(cuerpo).not.toContain(estado.almacen.ruta);
    }
    const invalida = await solicitar("/agentes?id=%22%3E%3Cscript%3E").text();
    expect(invalida).not.toContain('href="/agentes?id=');
  });
});

describe("T5-08 U-3 U-4 tema y componentes", () => {
  test("incluye temas, foco, movimiento reducido, tablas contenidas y componentes", async () => {
    const css = await solicitar("/estilos.css").text();
    for (const texto of [":root", "--fondo:", "--acento:", "prefers-color-scheme: dark", "prefers-reduced-motion: reduce",
      ":focus-visible", "system-ui", "ui-monospace", "overflow-x: auto", ".tarjeta", ".insignia--permitida",
      ".insignia--denegada", ".insignia--pregunta", ".insignia--neutra", ".insignia--aviso", ".aviso",
      ".ficha-codigo", ".estadistica", ".estado-vacio", "nth-child(even)", ".boton--secundario"])
      expect(css).toContain(texto);
    expect(css).not.toMatch(/@import|url\(/i);
  });
});

describe("T5-08 U-5 U-6", () => {
  test("inicio ofrece analizar; resolucion pone resumen primero y pliega detalles", async () => {
    const inicio = await paginaInicio(estado).text();
    expect(inicio).toContain("¿Qué configuración rige en este proyecto?");
    expect(inicio).toContain('>Analizar</button>');
    expect(inicio.match(/<form\b/g)).toHaveLength(1);
    const cuerpo = await paginaResolucion(valores, sobre).text();
    expect(seccion(cuerpo, "resumen-resolucion")).toContain("0 valores");
    expect(cuerpo.indexOf('id="resumen-resolucion"')).toBeLessThan(cuerpo.indexOf('id="valores"'));
    expect(cuerpo).toContain('<details id="entradas-leidas"');
    expect(cuerpo).toContain('<details id="claves-no-incorporadas"');
    expect(seccion(cuerpo, "historia")).toContain('aria-current="page"');
  });
});

describe("T5-08 U-7 P-5", () => {
  test.each([["allow", "permitida", "permitida"], ["deny", "denegada", "denegada"], ["ask", "pregunta", "sujeta a confirmación"],
    [null, "neutra", "sin decisión"], [ataque, "neutra", "&lt;script&gt;&quot;&amp;"]])("decision %s solo cambia su presentacion", async (decision, clase, texto) => {
    const dato = { ...permiso, decision, motivoSinDecision: decision === null ? "comando-compuesto" : null };
    const cuerpo = await paginaPermiso(dato).text();
    const principal = seccion(cuerpo, "resultado-permiso");
    expect(principal).toContain(`insignia--${clase}`);
    expect(principal).toContain(texto!);
    if (decision === null) expect(principal).toContain("comando-compuesto");
    const cadena = seccion(cuerpo, "cadena-efectiva");
    expect(cadena).toContain("Cadena efectiva");
    expect(cadena.match(/<tr[ >]/g)).toHaveLength(3);
    expect(cadena).toContain('<tr class="fila--determinante"><td data-etiqueta="Índice">1</td>');
    expect(cadena.indexOf('<td data-etiqueta="Índice">1</td>')).toBeLessThan(cadena.indexOf('<td data-etiqueta="Índice">2</td>'));
    const sinDeterminante = await paginaPermiso({ ...dato, determinante: null }).text();
    expect(seccion(sinDeterminante, "cadena-efectiva")).not.toContain('class="fila--determinante"');
  });
});

describe("T5-08 U-8 P-9", () => {
  test.each([false, true])("vacio incompleto=%s conserva los seis conteos y motivos", async incompleta => {
    const dato = { ...hallazgos, incompleta, motivos: incompleta ? ["aviso"] : [], resumen: {
      ...hallazgos.resumen, elementos: incompleta ? null : hallazgos.resumen.elementos } };
    const cuerpo = await paginaHallazgos(dato).text();
    expect(cuerpo).toContain(incompleta ? "Sin hallazgos observados; análisis parcial" : "Sin hallazgos en este proyecto");
    const resumen = seccion(cuerpo, "resumen-hallazgos");
    expect(resumen.match(/class="estadistica estadistica--cero"/g)).toHaveLength(6);
    for (const tipo of Object.keys(hallazgos.resumen.hallazgos)) expect(resumen).toContain(tipo);
    if (incompleta) {
      expect(cuerpo).toContain("Conteos de elementos no disponibles: resolución incompleta");
      expect(resumen).not.toContain("Agentes: 0");
      expect(cuerpo).toContain("&lt;script&gt;&quot;&amp;");
    } else {
      expect(resumen).toContain('<strong>2</strong><span>Agentes</span>');
      expect(resumen).toContain('<strong>3</strong><span>Comandos</span>');
      expect(resumen).toContain('<strong>4</strong><span>Entradas</span>');
    }
  });
  test("completo presenta el tipo, la localizacion y la explicacion asociados", async () => {
    const cuerpo = await paginaHallazgos({ ...hallazgos, hallazgos: [{ tipo: "entrada-ilegible", causa: "aviso",
      entrada: { orden: 1, via: "proyecto", referencia: "/p" , condicion: "observada" }, posicion: { linea: 3, columna: 5 },
      clave: null, parametros: {}, localizacion: "/p:3:5", explicacion: ataque }] }).text();
    const tabla = seccion(cuerpo, "tabla-hallazgos");
    expect(tabla).toContain("insignia--entrada-ilegible");
    expect(tabla).toContain('<code class="ruta" title="/p:3:5">');
    expect(textoHtml(tabla)).toContain("/p:3:5");
    expect(tabla).toContain("&lt;script&gt;&quot;&amp;");
    expect(cuerpo).not.toContain("Sin hallazgos en este proyecto");
  });
});

describe("T5-08 U-9", () => {
  test("entradas y agentes distinguen estados y avisos", async () => {
    const cuerpo = await paginaEntradas(entradas).text();
    expect(cuerpo).toContain('class="insignia insignia--entrada-ilegible">ilegible');
    expect(cuerpo).toContain('class="aviso aviso--advertencia">3:5 (falla)');
    const listado = await paginaAgentes(agentes).text();
    expect(listado).toContain('class="insignia insignia--neutra">primary');
    expect(listado).toContain('class="insignia insignia--aviso">sí');
    expect(listado).toContain("Listado incompleto");
  });
});

describe("T5-08-c1 C1 C2 C5 C6 C7 C8 lectura", () => {
  test("protege claves, cortes de rutas, alineacion y separacion de details", async () => {
    const css = await solicitar("/estilos.css").text();
    expect(css).toMatch(/#valores td:nth-child\(1\)\s*\{[^}]*white-space: nowrap;[^}]*min-width:/);
    expect(css).toMatch(/\.ruta__segmento[^}]*white-space: normal;[^}]*overflow-wrap: anywhere/);
    expect(css).toMatch(/\.ruta\s*\{[^}]*max-width: 100%;[^}]*overflow-wrap: anywhere/);
    expect(css).toMatch(/\.rejilla\s*\{[^}]*align-items: start/);
    expect(css).toMatch(/\.rejilla > \.tarjeta\s*\{[^}]*margin-top: 0/);
    expect(css).toMatch(/details \+ section[^}]*margin-top: 2rem/);
    for (const [pagina, id] of [[paginaResolucion(valores, sobre), "resumen-resolucion"], [paginaPermiso(permiso), null],
      [paginaAgentes(agentes), null], [paginaEntradas(entradas), null], [paginaHallazgos(hallazgos), null]] as const) {
      const cuerpo = await pagina.text();
      const cabecera = id ? seccion(cuerpo, id) : cuerpo.split('<section')[0]!;
      expect(cabecera).toContain('class="ruta"');
      expect(cabecera).toContain('title="/p/&lt;script&gt;&quot;&amp;"');
    }
  });
  test("pliega las declaraciones solo cuando existe explicacion, sin perder sus textos", async () => {
    const cuerpo = await paginaPermiso(permiso).text();
    const notas = /<details id="notas-analisis">(.*?)<\/details>/s.exec(cuerpo);
    expect(notas).not.toBeNull();
    expect(notas![1]).toContain("Notas del análisis (1)");
    expect(notas![1]).toContain("&lt;script&gt;&quot;&amp;");
    expect(cuerpo).not.toContain('<details id="notas-analisis" open');
    expect(await paginaPermiso({ ...permiso, explicacion: [] }).text()).toContain('id="declaraciones"');
    expect(await paginaPermiso({ ...permiso, explicacion: null }).text()).toContain('id="declaraciones"');
  });
  test("hallazgos ofrece nombres legibles, conteos de elementos separados y color por tipo", async () => {
    const cantidades = { "entrada-ilegible": 1, "entrada-descartada": 2, "sustitucion-sin-valor": 3,
      "referencia-no-resuelta": 4, "regla-sin-efecto": 5, "elemento-sin-uso": 6 };
    const dato = { ...hallazgos, resumen: { ...hallazgos.resumen, hallazgos: cantidades } };
    const cuerpo = await paginaHallazgos(dato).text();
    const resumen = seccion(cuerpo, "resumen-hallazgos");
    for (const nombre of ["Entrada ilegible", "Entradas descartadas", "Sustituciones sin valor", "Referencias no resueltas", "Reglas sin efecto", "Elementos sin uso"])
      expect(resumen).toContain(nombre);
    expect(resumen.match(/class="estadistica estadistica--aviso"/g)).toHaveLength(6);
    expect(resumen).toContain('<strong>2</strong><span>Agentes</span>');
    expect(resumen).toContain('<strong>3</strong><span>Comandos</span>');
    expect(resumen).toContain('<strong>4</strong><span>Entradas</span>');
    for (const [tipo, cantidad] of Object.entries(cantidades)) {
      expect(resumen).toContain(`<strong>${cantidad}</strong>`);
      expect(resumen).toContain(`<small>${tipo}</small>`);
    }
    const css = await solicitar("/estilos.css").text();
    expect(css).toMatch(/\.estadistica--aviso\s*\{[^}]*border-color: var\(--borde\)/);
    expect(css).toMatch(/\.estadistica--aviso strong\s*\{[^}]*color: var\(--texto\)/);
    expect(css).toMatch(/\.insignia--referencia-no-resuelta[^}]*color: var\(--peligro\)/);
    expect(css).toMatch(/\.insignia--regla-sin-efecto[^}]*color: var\(--aviso\)/);
    expect(css).toMatch(/\.insignia--entrada-descartada[^}]*color: var\(--neutro\)/);
  });
});
