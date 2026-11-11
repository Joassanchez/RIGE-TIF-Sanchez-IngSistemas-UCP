import { describe, expect, test } from "bun:test";
import type { RespuestaAgentes, RespuestaEntradas, RespuestaHallazgos, RespuestaPermiso, RespuestaValores } from "../../aplicacion/respuestas/contrato-generado";
import { versionRige } from "../../aplicacion/respuestas/estado";
import { crearManejador, type CasosWeb } from "./servidor";
import { estilos } from "./estilos";
import { paginaResolucion } from "./paginas/resolucion";
import { paginaPermiso } from "./paginas/permiso";
import { textoHtml } from "../../../../pruebas/utilidades/html";
import { nombreAnalisis } from "./textos";

const base = { esquema: 2 as const, proyecto: "/proyecto", entradas: [], resumenEntradas: "a".repeat(64), declaraciones: [], reglas: {} };
const agentes: RespuestaAgentes = { ...base, agentes: ["explore", "build"].map(nombre => ({ nombre, origen: "nativo" as const, modo: "primary", oculto: false })), eliminados: [], incompleta: false, motivos: [] };
const valores: RespuestaValores = { ...base, versionRige, herramienta: "opencode", versionHerramienta: "1.18.25", agente: "build", ruta: null, motivo: null, noResueltas: [],
  valores: ["temperature", "options.model", "steps"].map((clave, indice) => ({ clave, rastro: { ruta: [clave], indiceFusion: indice, valor: indice,
    determinante: { valor: indice, origen: { tipo: "nativo", regla: "nativa" }, via: null, referencia: null, regla: "nativa" }, desplazadas: [], motivo: "nativo" } })) };
const entradas: RespuestaEntradas = { ...base };
const hallazgos: RespuestaHallazgos = { ...base, hallazgos: [], incompleta: false, motivos: [], resumen: { elementos: { agentes: 2, comandos: 0, entradas: 0 }, hallazgos: { "entrada-ilegible": 0, "entrada-descartada": 0, "sustitucion-sin-valor": 0, "referencia-no-resuelta": 0, "regla-sin-efecto": 0, "elemento-sin-uso": 0 } } };
const permiso: RespuestaPermiso = { ...base, agente: "build", consulta: { sujeto: "read", herramienta: "read", objetivo: ".env", objetivoEvaluado: ".env", forma: "herramienta" }, decision: "ask", motivoSinDecision: null, determinante: null, desplazadas: [], nativaAnulada: null, advertencias: [], cadena: [], explicacion: [], porDefecto: true };
const sobre = { id: 7, instante: "2026-11-10T12:00:00Z", anteriores: [] };
const casos: CasosWeb = { consultarEstado: () => ({ exito: true, valor: { esquema: 2, versionRige, almacen: { ruta: "/temporal/rige.db", versionEsquema: 2 } } }),
  compararResoluciones: () => { throw new Error("No comparar en este doble"); },
  consultarProyectosRecientes: () => ({ exito: true, valor: { esquema: 2, proyectos: [] } }),
  consultarReglas: () => ({ exito: false, error: { codigo: "cadena-incompleta", mensaje: "Cadena no disponible" } }),
  resolverProyecto: () => ({ exito: true, valor: { id: 7 } }), consultarAgentes: () => ({ exito: true, valor: agentes }),
  consultarResolucion: (_id, agente) => ({ exito: true, valor: { respuesta: { ...valores, agente }, sobre } }),
  consultarEntradas: () => ({ exito: true, valor: entradas }), consultarHallazgos: () => ({ exito: true, valor: hallazgos }), consultarPermiso: () => ({ exito: true, valor: permiso }) };
const solicitar = (ruta: string, cambios: Partial<CasosWeb> = {}, headers: Record<string, string> = { Host: "localhost:12345" }, method = "GET"): Response => {
  const respuesta = crearManejador(12345, { ...casos, ...cambios })(new Request(`http://127.0.0.1${ruta}`, { headers, method }));
  if (respuesta.status !== 303 || ruta.startsWith("/resolver?")) return respuesta;
  expect(respuesta.status).toBe(303);
  return solicitar(respuesta.headers.get("location")!, cambios, headers, method);
};
const dato = (cuerpo: string) => JSON.parse(cuerpo.match(/id="respuesta">([^]*?)<\/script>/)![1]!);

describe("T5-17 G-5 nombres de las fotos guardadas", () => {
  test("todas las vistas guardadas usan proyecto y fecha absoluta, sin ids visibles", async () => {
    for (const ruta of ["/resoluciones/7?agente=build", "/resoluciones/7/permisos?agente=build", "/agentes?id=7&agente=build",
      "/permiso?id=7&agente=build&herramienta=read&objetivo=.env"]) {
      const cuerpo = await solicitar(ruta).text();
      expect(textoHtml(cuerpo)).toContain(ruta.startsWith("/agentes") ? "Análisis del " + nombreAnalisis(base.proyecto, sobre.instante).split(" · ")[1] : nombreAnalisis(base.proyecto, sobre.instante));
      expect(cuerpo.replace(/<script[^]*?<\/script>/g, "")).not.toMatch(/(?:Resolución|resolución|Foto) 7/);
      expect(cuerpo).not.toMatch(/hoy \d|ayer \d/);
    }
  });
  test("la fecha no condiciona consultas disponibles con valores sin resolver", async () => {
    const recibida = solicitar("/agentes?id=7", { consultarResolucion: () => ({ exito: false,
      error: { codigo: "clave-no-resuelta", mensaje: "Valores no disponibles" } }) });
    expect(recibida.status).toBe(200);
    const cuerpo = await recibida.text();
    expect(dato(cuerpo)).toEqual(agentes);
    expect(cuerpo).toContain("Fecha no disponible");
    expect(cuerpo).not.toMatch(/Resolución 7|hoy \d|ayer \d/);
  });
});

describe("T5-15 Z-1 estado entre pestanas", () => {
  test("cada ruta recibe y devuelve q y clave escapadas en pestanas y selector sin tocar el dato", async () => {
    const q = 'TEMP & "<#', clave = "/options/a.b";
    const estado = `agente=build&clave=${encodeURIComponent(clave)}&q=${encodeURIComponent(q)}`;
    for (const ruta of [`/resoluciones/7?${estado}`, `/resoluciones/7/permisos?${estado}`, `/agentes?id=7&${estado}`,
      `/entradas?proyecto=%2Fproyecto&id=7&${estado}`, `/hallazgos?proyecto=%2Fproyecto&id=7&${estado}`]) {
      const cuerpo = await solicitar(ruta).text();
      expect(cuerpo).not.toContain('aria-label="Panel del proyecto"');
      if (!ruta.startsWith("/agentes")) {
        const selector = cuerpo.match(/<form id="(?:seleccionar-agente|consultar-permiso)"[^]*?<\/form>/)![0];
        expect(selector).toContain('name="clave" value="/options/a.b"');
        expect(selector).toContain('name="q" value="TEMP &amp; &quot;&lt;#"');
      }
      if (!ruta.includes("/permisos")) expect(dato(cuerpo)).toEqual(ruta.startsWith("/agentes") ? agentes
        : ruta.startsWith("/entradas") ? entradas : ruta.startsWith("/hallazgos") ? hallazgos : valores);
    }
  });
});

describe("T5-11 P-1 inicio", () => {
  test("solo pide proyecto y Analizar; omite el argumento agente al guardar", async () => {
    const cuerpo = await solicitar("/").text();
    expect(cuerpo.match(/<form\b/g)).toHaveLength(1);
    expect(cuerpo).toContain('action="/resolver"');
    expect(cuerpo).toContain('name="proyecto"');
    expect(cuerpo).toContain('>Analizar</button>');
    expect(cuerpo).not.toMatch(/name="(?:agente|clave)"/);
    for (const vista of ["Valores", "Permisos", "Agentes", "Entradas", "Hallazgos"]) expect(cuerpo).toContain(vista);
    const llamadas: unknown[][] = [];
    const respuesta = solicitar("/resolver?proyecto=%2Fproyecto", { resolverProyecto: (...args) => { llamadas.push(args); return { exito: true, valor: { id: 7 } }; } });
    expect(respuesta.status).toBe(303);
    expect(respuesta.headers.get("location")).toBe("/resoluciones/7");
    expect(llamadas).toEqual([["/proyecto"]]);
  });
});

describe("T5-11 P-2 agente predeterminado", () => {
  test("elige build o el primero en orden; no reintenta y es determinista", async () => {
    for (const nombres of [["explore", "build"], ["z", "a"]]) {
      const consultas: string[][] = [];
      const cambios: Partial<CasosWeb> = { consultarAgentes: () => ({ exito: true, valor: { ...agentes, agentes: nombres.map(nombre => ({ ...agentes.agentes[0]!, nombre })) } }),
        consultarResolucion: (id, agente, clave) => { consultas.push([id, agente, clave]); return { exito: true, valor: { respuesta: { ...valores, agente }, sobre } }; } };
      const cuerpo = await solicitar("/resoluciones/7?clave=temperature", cambios).text();
      expect(dato(cuerpo).agentes.map((a: { nombre: string }) => a.nombre)).toEqual(nombres);
      expect(await solicitar("/resoluciones/7?clave=temperature", cambios).text()).toBe(cuerpo);
      expect(consultas).toEqual(Array(2).fill(["7", nombres[0], ""]));
    }
    let consultas = 0;
    const noValores = () => { consultas++; throw new Error("No consultar valores"); };
    const vacia = solicitar("/resoluciones/7", { consultarAgentes: () => ({ exito: true, valor: { ...agentes, agentes: [] } }), consultarResolucion: noValores });
    expect(vacia.status).toBe(200);
    expect(await vacia.text()).toContain("Sin agentes activos");
    expect(solicitar("/resoluciones/7", { consultarAgentes: () => ({ exito: false, error: { codigo: "resolucion-inexistente", mensaje: "No existe" } }), consultarResolucion: noValores }).status).toBe(404);
    expect(consultas).toBe(0);
    let intentos = 0;
    expect(solicitar("/resoluciones/7", { consultarResolucion: () => { intentos++; return { exito: false, error: { codigo: "agente-sin-declaraciones", mensaje: "Sin declaraciones" } }; } }).status).toBe(200);
    expect(intentos).toBe(2);
  });
  test("agente explicito blanco es invalido y no guarda; conserva compatibilidad y clave", () => {
    let guardadas = 0;
    for (const agente of ["", " ", "\t"]) expect(solicitar(`/resolver?agente=${encodeURIComponent(agente)}`, { resolverProyecto: () => { guardadas++; throw new Error("No guardar"); } }).status).toBe(400);
    expect(guardadas).toBe(0);
    expect(solicitar("/resolver?proyecto=p&agente=build&clave=%2Foptions%2Fa.b").headers.get("location")).toBe("/resoluciones/7?agente=build&clave=%2Foptions%2Fa.b");
    expect(solicitar("/resolver?proyecto=p&clave=x").headers.get("location")).toBe("/resoluciones/7?clave=x");
  });
});

describe("T5-11 P-4 filtro visual y consulta por clave", () => {
  test("q solo filtra claves sin distinguir mayusculas; conserva JSON, orden y formularios", async () => {
    for (const [q, cantidad] of [["TEMP", 1], ["e", 3], ["", 3], ['<script>"&', 0]] as const) {
      const consultas: unknown[][] = [];
      const cuerpo = await solicitar(`/resoluciones/7?agente=build&q=${encodeURIComponent(q)}`, { consultarResolucion: (...args) => { consultas.push(args); return { exito: true, valor: { respuesta: valores, sobre } }; } }).text();
      expect(consultas).toEqual([["7", "build", ""]]);
      expect(dato(cuerpo)).toEqual(valores);
      const tabla = cuerpo.match(/<section id="valores">[^]*?<\/section>/)![0];
      expect(tabla.match(/<td[^>]*data-etiqueta="Clave"/g) ?? []).toHaveLength(cantidad);
      expect([...tabla.matchAll(/<td data-etiqueta="Clave">([^<]*)<\/td>/g)].map(m => m[1])).toEqual(
        valores.valores.filter(v => !q || v.clave.toLowerCase().includes(q.toLowerCase())).map(v => v.clave).sort());
      if (q) expect(textoHtml(cuerpo)).toContain(`Filtrado por "${q === '<script>"&' ? '&lt;script&gt;&quot;&amp;' : q}" · ${cantidad} de 3 claves`);
      if (cantidad === 0) expect(tabla).toContain("Ninguna clave coincide con el filtro");
      if (q) expect(cuerpo).toContain(`name="q" value="${q === '<script>"&' ? '&lt;script&gt;&quot;&amp;' : q}"`);
      expect(cuerpo).not.toContain('id="consultar-clave"');
      expect(cuerpo).toContain('id="filtrar-claves"');
      expect(cuerpo.replace(/<script type="application\/json" id="respuesta">[^]*?<\/script>/g, "")).not.toContain('<script>');
    }
  });
  test("q cuenta despues de clave, distingue ausencia y quitarlo conserva la consulta", async () => {
    const puntual = { ...valores, ruta: ["options", "model"], valores: [valores.valores[1]!] };
    const cuerpo = await solicitar("/resoluciones/7?agente=build&clave=%2Foptions%2Fmodel&q=TEMP", { consultarResolucion: () => ({ exito: true, valor: { respuesta: puntual, sobre } }) }).text();
    expect(cuerpo).toContain("0 de 1 clave");
    expect(dato(cuerpo)).toEqual(puntual);
    expect(cuerpo).toContain('href="/resoluciones/7?agente=build&amp;clave=%2Foptions%2Fmodel">Quitar filtro</a>');
    expect(cuerpo.match(/<form id="seleccionar-agente"[^]*?<\/form>/)![0]).toContain('name="q" value="TEMP"');
    expect(cuerpo.match(/<form id="filtrar-claves"[^]*?<\/form>/)![0]).toContain('name="clave" value="/options/model"');
    const ausente = { ...valores, valores: [], motivo: "clave-inexistente" };
    const sinClave = await paginaResolucion(ausente, sobre).text();
    expect(sinClave).toContain("La clave consultada no existe para el agente.");
    expect(sinClave).not.toContain("Ninguna clave coincide");
    const sinValores = await paginaResolucion({ ...valores, valores: [] }, sobre, { q: "TEMP" }).text();
    expect(sinValores).toContain("Ninguna clave coincide con el filtro");
  });
});

describe("T5-11 P-5 reglas fuera de la tabla", () => {
  test("usa plantillas exactas, conserva reglas opacas por fila y cuatro columnas", async () => {
    const primero = valores.valores[0]!;
    const original = { ...primero, rastro: { ...primero.rastro, determinante: { ...primero.rastro.determinante,
      origen: { tipo: "declarado" as const, orden: 1, posicion: { linea: 1, columna: 1 } } } } };
    const datoValores = { ...valores, reglas: { "orden-de-aplicacion": "Precedencia <RD-01> completa.", implicita: "Valor & implícito RD-04.", "": "Regla sin código.", otra: "Otra <regla>." }, valores: [
      { ...original, rastro: { ...original.rastro, determinante: { ...original.rastro.determinante, regla: "orden-de-aplicacion" } } },
      { ...original, clave: "native", rastro: { ...original.rastro, determinante: { ...original.rastro.determinante, regla: "implicita", origen: { tipo: "implicito" as const, regla: "implicita" } } } },
      ...["", "otra"].map(regla => ({ ...original, clave: regla, rastro: { ...original.rastro, determinante: { ...original.rastro.determinante, regla } } })),
    ] };
    const cuerpo = await paginaResolucion(datoValores, sobre).text();
    const tabla = cuerpo.match(/<section id="valores">[^]*?<\/section>/)![0];
    expect(tabla).not.toContain("<th>Regla aplicada</th>");
    expect(tabla.match(/<th>/g)).toHaveLength(8); // Declaradas y fábrica conservan las cuatro columnas.
    const ayuda = cuerpo.match(/<details><summary>¿Qué significa\?<\/summary>[^]*?<\/details>/)![0];
    expect(ayuda).toContain("Precedencia &lt;RD-01&gt; completa.");
    expect(ayuda).toContain("Valor &amp; implícito RD-04.");
    expect(cuerpo.indexOf(ayuda)).toBeLessThan(cuerpo.indexOf("<table"));
    expect(tabla.match(/<details class="regla-detalle">/g)).toHaveLength(2);
    expect(tabla).toContain("Regla sin código.");
    expect(tabla).toContain("Otra &lt;regla&gt;.");
    expect(dato(cuerpo)).toEqual(datoValores);
    const sinPlantilla = await paginaResolucion(valores, sobre).text();
    expect(sinPlantilla).not.toContain("Cómo se decide:");
  });
});

describe("T5-11 P-6 comandos actuales citados por shell", () => {
  test("cada resultado tiene comando plegable y aclaracion; no incluye q", async () => {
    for (const [ruta, comando, opciones] of [
      ["/resoluciones/7?agente=build&clave=temperature&q=ignorar", "valores", ["--agente", "--clave"]],
      ["/agentes?id=7", "agentes", []], ["/entradas?proyecto=p", "entradas", []], ["/hallazgos?proyecto=p", "hallazgos", ["--explicar"]],
      ["/permiso?id=7&agente=build&herramienta=read&objetivo=.env", "permiso", ["--agente", "--herramienta", "--objetivo", "--explicar"]],
    ] as const) {
      const cuerpo = await solicitar(ruta).text();
      const detalle = cuerpo.match(/<details id="comando-cli"[^]*?<\/details>/)?.[0];
      expect(detalle).toBeDefined();
      expect(detalle).toContain("Consultar por CLI con las entradas actuales");
      expect(detalle).toContain("No recupera esta foto; coincide si las entradas y el contexto no cambiaron");
      expect(detalle).toContain(`bun run rige -- ${comando} --proyecto`);
      for (const opcion of opciones) expect(detalle).toContain(opcion);
      expect(detalle).not.toContain("--q");
      expect(detalle).toContain("Bash");
      expect(detalle).toContain("PowerShell");
      expect(detalle).toContain("PowerShell 7.3+");
      expect(detalle).toContain("$PSNativeCommandArgumentPassing");
      expect(detalle!.match(/<pre><code>/g)).toHaveLength(2);
    }
  });
  test("cita espacios, comillas, $, backticks, &, <, # y guion; permiso usa objetivo original y lanzadoPor", async () => {
    const ataque = '-a espacio \' " $ ` & < #';
    const consulta = { ...permiso, proyecto: ataque, agente: ataque, lanzadoPor: ataque, consulta: { sujeto: ataque, objetivo: ataque, objetivoEvaluado: "NO-ORIGINAL", forma: "sujeto" as const } };
    const cuerpo = await paginaPermiso(consulta, "7").text();
    const detalle = cuerpo.match(/<details id="comando-cli"[^]*?<\/details>/)?.[0];
    expect(detalle).toBeDefined();
    const codigos = [...detalle!.matchAll(/<pre><code>([^]*?)<\/code><\/pre>/g)].map(m => m[1]!.replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", '"').replaceAll("&#39;", "'").replaceAll("&amp;", "&"));
    expect(codigos[0]).toContain("'" + ataque.replaceAll("'", "'\"'\"'") + "'");
    expect(codigos[1]).toContain("'" + ataque.replaceAll("'", "''") + "'");
    for (const codigo of codigos) {
      for (const opcion of ["--proyecto", "--agente", "--sujeto", "--objetivo", "--lanzado-por", "--explicar"]) expect(codigo).toContain(opcion);
      for (const opcion of ["proyecto", "agente", "sujeto", "objetivo", "lanzado-por"]) expect(codigo).toContain(`--${opcion}=`);
      expect(codigo).not.toContain("--herramienta");
      expect(codigo).not.toContain("NO-ORIGINAL");
    }
    expect(detalle).toContain("&lt;");
    expect(cuerpo).not.toMatch(/\sstyle\s*=|<style\b/);
  });
});

describe("T5-11 P-7 D-5 responsive", () => {
  test("tarjetas conservan etiquetas y contenido en valores, hallazgos, permisos y entradas", async () => {
    const movil = estilos.split("@media (max-width: 640px)")[1];
    expect(movil).toBeDefined();
    expect(movil).toContain(".tabla-tarjetas");
    expect(movil).toContain("content: attr(data-etiqueta)");
    expect(movil).toContain("display: block");
    expect(movil).toContain("white-space: normal");
    expect(estilos).toMatch(/\.pestanas\s*\{[^}]*overflow-x: auto/);
    expect(estilos).toMatch(/#comando-cli pre\s*\{[^}]*overflow-x: auto/);
    const entrada = { orden: 0, via: "variable-contenido", referencia: "VARIABLE", condicion: "observada" as const, resumen: null };
    const paginas = [
      await solicitar("/resoluciones/7?agente=build").text(),
      await solicitar("/entradas?proyecto=p", { consultarEntradas: () => ({ exito: true, valor: { ...entradas, entradas: [entrada] } }) }).text(),
      await solicitar("/hallazgos?proyecto=p", { consultarHallazgos: () => ({ exito: true, valor: { ...hallazgos, hallazgos: [{ tipo: "entrada-ilegible", causa: "x", entrada, posicion: { linea: 1, columna: 1 }, clave: null, parametros: {}, localizacion: "/p:1:1", explicacion: "detalle" }] } }) }).text(),
      await paginaPermiso({ ...permiso, cadena: [{ indice: 0, sujeto: "read", patron: "*", efecto: "ask", origen: { tipo: "nativo", regla: "nativa" }, declaracion: null }] }).text(),
    ];
    for (const cuerpo of paginas) {
      if (cuerpo.includes('id="tabla-hallazgos"')) {
        const tarjeta = cuerpo.match(/<article id="h-0"[^]*?<\/article>/)![0];
        for (const texto of ["Entrada ilegible", "Ubicación:", "Causa:", "detalle", "#entrada-0"]) expect(tarjeta).toContain(texto);
        continue;
      }
      const tabla = cuerpo.match(/<table class="tabla-tarjetas(?: [^"]*)?">[^]*?<\/table>/)?.[0];
      expect(tabla).toBeDefined();
      const titulos = [...tabla!.matchAll(/<th>(.*?)<\/th>/g)].map(m => m[1]);
      const etiquetas = [...tabla!.matchAll(/<td data-etiqueta="([^"]+)"/g)].map(m => m[1]);
      expect(etiquetas.length).toBeGreaterThan(0);
      etiquetas.forEach((etiqueta, indice) => expect(etiqueta).toBe(titulos[indice % titulos.length]));
    }
  });
});

describe("T5-11 P-8 documentacion", () => {
  test("recorrido Analizar, clave diferenciada, pestanas y RD-01 en manual y README", async () => {
    for (const archivo of ["MANUAL.md", "README.md"]) {
      const documento = await Bun.file(archivo).text();
      const seccion = documento.split("## 6.")[1]!.split("## 7.")[0]!;
      for (const texto of ["Analizar", "Resumen del proyecto", "Buscar clave", "Lo determina", "Historial", "Filtrar", "RD-01"]) expect(seccion).toContain(texto);
      expect(seccion).not.toContain("Resolver y guardar");
    }
    const matriz = (await Bun.file("MANUAL.md").text()).split("## 8.")[1]!;
    expect(matriz).toContain("Analizar");
    expect(matriz).toContain("Filtrar");
  });
});

describe("T5-11 P-3 panel y contexto", () => {
  test("cinco pestanas activas, foto o estado actual, contexto separado del JSON", async () => {
    const rutas = [
      ["/resoluciones/7?agente=build&clave=temperature", "Valores", valores],
      ["/resoluciones/7/permisos?agente=build&clave=temperature", "Permisos", null],
      ["/agentes?id=7&agente=build&clave=temperature", "Agentes", agentes],
      ["/entradas?proyecto=p&id=7&agente=build&clave=temperature", "Entradas", entradas],
      ["/hallazgos?proyecto=p&id=7&agente=build&clave=temperature", "Hallazgos", hallazgos],
      ["/permiso?id=7&agente=build&herramienta=read&objetivo=.env&clave=temperature", "Permisos", permiso],
    ] as const;
    for (const [ruta, activa, respuesta] of rutas) {
      const recibida = solicitar(ruta, respuesta === null ? {
        consultarResolucion: (id, agente, clave) => {
          expect([id, agente, clave]).toEqual(["7", "build", ""]);
          return { exito: true, valor: { respuesta: valores, sobre } };
        },
        consultarPermiso: () => { throw new Error("El formulario no ejecuta permisos"); },
      } : {});
      expect(recibida.status).toBe(200);
      const cuerpo = await recibida.text();
      expect(cuerpo).not.toContain('aria-label="Panel del proyecto"');
      expect(cuerpo).toContain('aria-label="Migas de pan"');
      if (activa === "Valores") expect(cuerpo).toContain(nombreAnalisis(base.proyecto, sobre.instante));
      else if (["Entradas", "Hallazgos"].includes(activa)) expect(cuerpo).toContain("Estado actual de las entradas de configuración (no es la foto guardada)");
      else if (activa === "Agentes") expect(cuerpo).toContain("Análisis del");
      else expect(cuerpo).toContain(`Foto guardada · ${nombreAnalisis(base.proyecto, sobre.instante)}`);
      if (respuesta === null) {
        expect(cuerpo).not.toContain('<script');
        expect(cuerpo).toContain('id="consultar-permiso"');
        expect(cuerpo).toContain('id="consultas-rapidas"');
        expect(cuerpo).not.toContain("Consultar por CLI");
      } else expect(dato(cuerpo)).toEqual(respuesta);
      const selector = cuerpo.match(/<form id="seleccionar-agente"[^]*?<\/form>/)?.[0];
      expect(selector === undefined).toBe(activa === "Agentes");
      if (respuesta === null) {
        const formulario = cuerpo.match(/<form id="consultar-permiso"[^]*?<\/form>/)![0];
        expect(formulario).toContain('<select name="agente" required>');
        expect(formulario).not.toContain('name="lanzadoPor"');
      } else if (activa === "Permisos") {
        expect(selector).toContain('action="/resoluciones/7/permisos"');
        expect(selector).not.toMatch(/name="(?:herramienta|objetivo|lanzadoPor)"/);
      }
    }
  });
  test("rechaza ids invalidos, inexistentes y de otro proyecto; sin id es independiente", async () => {
    for (const ruta of ["/entradas", "/hallazgos"]) {
      expect(solicitar(`${ruta}?proyecto=p&id=abc`, { consultarAgentes: () => ({ exito: false, error: { codigo: "solicitud-invalida", mensaje: "id inválido" } }) }).status).toBe(400);
      expect(solicitar(`${ruta}?proyecto=p&id=99`, { consultarAgentes: () => ({ exito: false, error: { codigo: "resolucion-inexistente", mensaje: "No existe" } }) }).status).toBe(404);
      expect(solicitar(`${ruta}?proyecto=p&id=7`, { consultarAgentes: () => ({ exito: true, valor: { ...agentes, proyecto: "/otro" } }) }).status).toBe(400);
      const cuerpo = await solicitar(`${ruta}?proyecto=p`, { consultarAgentes: () => { throw new Error("No consultar foto"); } }).text();
      expect(cuerpo).not.toContain('aria-label="Panel del proyecto"');
      expect(cuerpo).not.toContain('id="seleccionar-agente"');
      expect(cuerpo).not.toContain('/resoluciones/');
    }
  });
  test("el enlace de hallazgo a entrada conserva panel, clave y orden cero", async () => {
    const entrada = { orden: 0, via: "variable-contenido", referencia: "VARIABLE", condicion: "observada" as const };
    const cuerpo = await solicitar("/hallazgos?proyecto=p&id=7&agente=build&clave=temperature", { consultarHallazgos: () => ({ exito: true, valor: { ...hallazgos, hallazgos: [{ tipo: "entrada-ilegible", causa: "x", entrada, posicion: { linea: 1, columna: 1 }, clave: null, parametros: {}, localizacion: "/p:1:1", explicacion: "x" }] } }) }).text();
    expect(cuerpo).toContain('href="/entradas?proyecto=%2Fproyecto&amp;id=7&amp;agente=build&amp;clave=temperature#entrada-0"');
  });
  test("ruta de formularios protegida antes de consultar y sin informacion en rechazos", async () => {
    let consultas = 0;
    const noConsultar = () => { consultas++; throw new Error("No consultar"); };
    const rechazos: readonly (readonly [Record<string, string>, string, number])[] = [
      [{}, "GET", 403], [{ Host: "ajeno" }, "GET", 403],
      ...["cross-site", "same-site", "desconocido"].map(sitio => [{ Host: "localhost:12345", "Sec-Fetch-Site": sitio }, "GET", 403] as const),
      ...["POST", "HEAD", "PUT", "DELETE", "OPTIONS"].map(metodo => [{ Host: "localhost:12345" }, metodo, 405] as const),
    ];
    for (const [headers, method, estado] of rechazos) {
      const respuesta = solicitar("/resoluciones/7/permisos?agente=build", { consultarAgentes: noConsultar, consultarResolucion: noConsultar }, headers, method);
      expect(respuesta.status).toBe(estado);
      if (estado === 405) expect(respuesta.headers.get("allow")).toBe("GET");
      expect([...respuesta.headers.keys()].some(n => n.startsWith("access-control-"))).toBe(false);
      expect(respuesta.headers.get("content-security-policy")).toContain("default-src 'none'");
      const cuerpo = await respuesta.text();
      expect(cuerpo).not.toContain(base.proyecto);
      expect(cuerpo).not.toContain(versionRige);
    }
    expect(consultas).toBe(0);
    for (const sitio of [undefined, "same-origin", "none"]) expect(solicitar("/resoluciones/7/permisos", {}, { Host: "localhost:12345", ...(sitio ? { "Sec-Fetch-Site": sitio } : {}) }).status).toBe(200);
  });
});
