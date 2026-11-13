import { describe, expect, test } from "bun:test";
import type { RespuestaAgentes, RespuestaEntradas, RespuestaHallazgos, RespuestaPermiso, RespuestaValores, RespuestaReglas, RespuestaComparacion } from "../../aplicacion/respuestas/contrato-generado";
import { versionRige } from "../../aplicacion/respuestas/estado";
import { crearManejador, type CasosWeb } from "./servidor";
import { estilos } from "./estilos";
import { paginaResolucion } from "./paginas/resolucion";
import { paginaPermiso } from "./paginas/permiso";
import { paginaConsultasPermiso } from "./paginas/consultas-permiso";
import { paginaEntradas } from "./paginas/entradas";
import { paginaHallazgos } from "./paginas/hallazgos";
import { paginaReglas } from "./paginas/reglas";
import { paginaComparacion } from "./paginas/comparacion";
import { paginaInicio } from "./paginas/inicio";
import { paginaErrorUso } from "./intermedios/errores";
import { diseno } from "./diseno";
import { html } from "./plantillas";
import { textoHtml } from "../../../../pruebas/utilidades/html";
import * as textos from "./textos";
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
  const respuesta = crearManejador(12345, { ...casos, ...cambios }, { versionHerramienta: "1.18.25", reloj: { ahora: () => "2026-11-11T12:00:00Z" } })(new Request(`http://127.0.0.1${ruta}`, { headers, method }));
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

describe("T5-15 Z-1 estado entre vistas", () => {
  test("cada vista con selector recibe y devuelve q y clave escapadas sin panel ni cambios en el dato", async () => {
    const q = 'TEMP & "<#', clave = "/options/a.b";
    const estado = `agente=build&clave=${encodeURIComponent(clave)}&q=${encodeURIComponent(q)}`;
    for (const ruta of [`/resoluciones/7?${estado}`, `/resoluciones/7/permisos?${estado}`,
      `/entradas?proyecto=%2Fproyecto&id=7&${estado}`, `/hallazgos?proyecto=%2Fproyecto&id=7&${estado}`]) {
      const cuerpo = await solicitar(ruta).text();
      expect(cuerpo).not.toContain('aria-label="Panel del proyecto"');
      const selector = cuerpo.match(/<form id="(?:seleccionar-agente|consultar-permiso)"[^]*?<\/form>/)![0];
      expect(selector).toContain('name="clave" value="/options/a.b"');
      expect(selector).toContain('name="q" value="TEMP &amp; &quot;&lt;#"');
      if (!ruta.includes("/permisos")) expect(dato(cuerpo)).toEqual(ruta.startsWith("/entradas") ? entradas : ruta.startsWith("/hallazgos") ? hallazgos : valores);
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

describe("T5-11 P-2 consulta del primero en orden en el resumen", () => {
  test("consulta el primero en orden para el sobre del resumen, tolera agentes sin declaraciones y es determinista", async () => {
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
  test("recorrido Analizar, resumen del proyecto, buscar clave, historial y RD-01 en manual y README", async () => {
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

describe("T5-11 P-3 migas de pan y contexto", () => {
  test("vistas sin panel con migas de pan, foto o estado actual y contexto separado del JSON", async () => {
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
  test("el enlace de hallazgo a entrada conserva contexto, clave y orden cero", async () => {
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

describe("Panel, diseño y coherencia visual", () => {
  const css = (selector: string) => [...estilos.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selectores]) => selectores!.split(",").some(s => s.trim() === selector)).map(m => m[2]).join("\n");
  const reglaCss = (selector: string) => css(selector);

  test("T5-21 F-1 selector compacto junto al titulo en todas las vistas", async () => {
    const contextoF1 = { idResolucion: "7", agente: "build", agentes: agentes.agentes };
    const reglasF1: RespuestaReglas = { ...base, agente: "build", cadena: [], ejesParciales: [], advertencias: [], matriz: { sujetos: [], motivos: [], noObservados: [], filas: [] } };
    for (const pagina of [paginaPermiso(permiso, "7", contextoF1), paginaConsultasPermiso(agentes, contextoF1), paginaEntradas(base, contextoF1), paginaHallazgos(hallazgos, contextoF1), paginaReglas(reglasF1, "7", contextoF1)]) {
      const s = await pagina.text();
      expect(s).toMatch(/class="barra-agente">\s*<h1>[^]*?<\/h1>\s*<form id="seleccionar-agente"[^]*?<\/form>\s*<\/div>/);
      for (const form of s.matchAll(/<form\b[^]*?<\/form>/g)) expect(form[0].match(/<form\b/g)).toHaveLength(1);
    }
  });

  test("T5-15 Z-7 coherencia de vistas", async () => {
    const contextoZ7 = { idResolucion: 7, agente: "build", agentes: [{ nombre: "build" }], clave: "temperature", q: "TEMP" };
    const conteosHallazgos = { "entrada-ilegible": 0, "entrada-descartada": 0, "sustitucion-sin-valor": 0, "referencia-no-resuelta": 0, "regla-sin-efecto": 0, "elemento-sin-uso": 0 };
    const reglasZ7: RespuestaReglas = { ...base, agente: "build", cadena: [], ejesParciales: ["external_directory"], declaraciones: [], advertencias: [],
      reglas: { limite: "Observación limitada <fila>" }, matriz: { sujetos: ["read"], motivos: [], noObservados: [], filas: [] } };
    const fotoZ7 = { id: 1, instante: sobre.instante, entradas: [], resumenEntradas: "", noComparables: [], motivosAgentes: [], reglas: {} };
    const comparacionZ7: RespuestaComparacion = { esquema: 2, proyecto: base.proyecto, desde: fotoZ7, hasta: { ...fotoZ7, id: 2 },
      agentes: { agregados: [], quitados: [], comunes: ["build"], inciertos: [] }, parcial: false, sustituciones: "solo-representacion-protegida",
      resumen: { cambiadas: 0, agregadas: 0, quitadas: 0, sinCambio: 12 }, comparaciones: [] };
    const estadoZ7 = { esquema: 2 as const, versionRige, almacen: { ruta: "/temporal/rige.db", versionEsquema: 2 } };

    const paginas = [paginaEntradas(base, contextoZ7),
      paginaHallazgos({ ...base, hallazgos: [], incompleta: false, motivos: [], resumen: { elementos: null, hallazgos: conteosHallazgos } }, contextoZ7),
      paginaConsultasPermiso(agentes, contextoZ7), paginaReglas(reglasZ7, "7", contextoZ7),
      paginaPermiso({ ...base, agente: "build", consulta: { sujeto: "read", objetivo: ".env", objetivoEvaluado: ".env", forma: "sujeto" }, decision: null,
        motivoSinDecision: "ninguna", determinante: null, desplazadas: [], nativaAnulada: null, advertencias: [], cadena: [], explicacion: [], porDefecto: true }, "7", contextoZ7)];
    for (const pagina of paginas) {
      const cuerpo = await pagina.text();
      const cabecera = cuerpo.match(/<(?:section|div)[^>]*class="cabecera-pagina"[^>]*>([^]*?<\/details>)<\/(?:section|div)>/);
      expect(cabecera).not.toBeNull();
      expect(cabecera![1]).toContain("<h1>");
      expect(cabecera![1]).toContain("proyecto");
      const selector = cuerpo.includes('id="seleccionar-agente"') ? 'id="seleccionar-agente"' : 'id="consultar-permiso"';
      expect(cabecera![1]).toContain(selector);
      expect(cuerpo).not.toMatch(/style=|<style\b|<script(?! type="application\/json")/);
    }
    for (const pagina of [paginaInicio(estadoZ7, undefined, new Date("2026-11-11T12:00:00Z")), paginaComparacion(comparacionZ7), paginaErrorUso({ codigo: "proyecto-inexistente", mensaje: "No existe" })]) {
      const cuerpo = await pagina.text();
      expect(cuerpo).toContain('href="/estilos.css"');
      expect(cuerpo.match(/<h1>/g)).toHaveLength(1);
    }
    expect(css(".cabecera-pagina")).toMatch(/margin-bottom:\s*2rem/);
    for (const selector of ["h1", ".cabecera-pagina h1", ".pagina-error h1"])
      expect(css(selector)).toMatch(/font-size:\s*1\.75rem/);
    expect(estilos).toContain("@media (max-width: 640px)");
    expect(css(".tabla-tarjetas td[data-etiqueta]::before")).toContain("attr(data-etiqueta)");
  });

  test("T5-15 Z-10 singular y plural en conteos sin modificar JSON", async () => {
    const valoresZ10: RespuestaValores = { ...base, versionRige, herramienta: "opencode", versionHerramienta: "1.18.25", agente: "build", ruta: null,
      motivo: null, noResueltas: [], valores: [{ clave: "temperature", rastro: { ruta: ["temperature"], indiceFusion: 0, valor: 0.3,
        determinante: { valor: 0.3, origen: { tipo: "nativo", regla: "nativa" }, via: null, referencia: null, regla: "nativa" }, desplazadas: [], motivo: "nativo" } }] };
    const fotoZ10 = { id: 1, instante: sobre.instante, entradas: [], resumenEntradas: "", noComparables: [], motivosAgentes: [], reglas: {} };
    const comparacionZ10: RespuestaComparacion = { esquema: 2, proyecto: base.proyecto, desde: fotoZ10, hasta: { ...fotoZ10, id: 2 },
      agentes: { agregados: [], quitados: [], comunes: ["build"], inciertos: [] }, parcial: false, sustituciones: "solo-representacion-protegida",
      resumen: { cambiadas: 1, agregadas: 0, quitadas: 0, sinCambio: 12 }, comparaciones: [
        { agente: "build", resumen: { cambiadas: 1, agregadas: 0, quitadas: 0, sinCambio: 0 }, cambios: [
          { ruta: ["a"], tipo: "cambiada", motivos: ["valor"], antes: { valor: 1, determinante: valoresZ10.valores[0]!.rastro.determinante },
            despues: { valor: 2, determinante: valoresZ10.valores[0]!.rastro.determinante } }] }] };
    const cuerpo = await paginaResolucion(valoresZ10, sobre, { q: "temperature" }).text();
    expect(textoHtml(cuerpo)).toContain("1 valor");
    expect(textoHtml(cuerpo)).not.toContain("1 valores");
    expect(textoHtml(cuerpo)).toContain("1 de 1 clave");
    const comparada = textoHtml(await paginaComparacion(comparacionZ10).text());
    expect(comparada).toContain("1 cambio"); expect(comparada).not.toContain("1 cambios");
    const nueva = { ...comparacionZ10, comparaciones: [{ ...comparacionZ10.comparaciones[0]!, resumen: { cambiadas: 1, agregadas: 1, quitadas: 1, sinCambio: 1 } }] };
    const texto = textoHtml(await paginaComparacion(nueva).text());
    for (const fragmento of ["1 cambio", "1 clave nueva", "1 quitada", "1 clave sin cambio"]) expect(texto).toContain(fragmento);
    for (const cantidad of [0, 1, 2]) {
      const inicio = textoHtml(await paginaInicio({ esquema: 2, versionRige, almacen: { ruta: "/t", versionEsquema: 2 } }, { esquema: 2, proyectos: [{ proyecto: "/p", id: 7, instante: sobre.instante, cantidad }] }, new Date("2026-11-11T12:00:00Z")).text());
      expect(inicio).toContain(`${cantidad} análisis`);
    }
  });

  test("G-4 marca, migas escapadas, ancho legible y pie de una linea", () => {
    const cuerpo = diseno("Valores", html`<h1>Valores</h1>`, { proyecto: '/p/<x>', agente: 'a & b', idResolucion: 7, activa: "Valores" }).texto;
    const cabecera = cuerpo.match(/<header[^]*?<\/header>/)![0];
    expect(cabecera).toContain('aria-label="Migas de pan"');
    expect(cabecera).toContain("&lt;x&gt;"); expect(cabecera).toContain("a &amp; b");
    expect(cabecera).not.toMatch(/Entradas|Hallazgos|Configuración efectiva|marca__simbolo/);
    const pie = cuerpo.match(/<footer[^]*?<\/footer>/)![0];
    expect(pie).toContain(`Local · solo lectura · sin red · RIGE ${versionRige}`);
    expect(pie).not.toContain("/privado"); expect(pie.match(/<p>/g)).toHaveLength(1);
    expect(reglaCss("main")).toContain("max-width: 1100px");
  });

  test("G-5 ayudantes puros: Windows, POSIX, raices y fechas locales entre dias y anos", () => {
    for (const [ruta, nombre] of [["C:\\uno\\dos\\", "dos"], ["/uno/dos/", "dos"], ["/", "/"], ["C:\\", "C:\\"], ["\\\\servidor\\recurso", "recurso"]])
      expect(textos.nombreProyecto(ruta!)).toBe(nombre!);
    const hoy = new Date(2026, 0, 1, 0, 5), ayer = new Date(2025, 11, 31, 18, 5);
    expect(textos.fechaLocal(hoy.toISOString())).toBe("01/01/2026 00:05");
    expect(textos.fechaRelativa(hoy.toISOString(), hoy)).toBe("hoy 00:05");
    expect(textos.fechaRelativa(ayer.toISOString(), hoy)).toBe("ayer 18:05");
    expect(textos.fechaRelativa(new Date(2025, 11, 30, 10, 42).toISOString(), hoy)).toBe("30/12/2025 10:42");
    expect(textos.fechaRelativa(new Date(2026, 0, 2, 10, 42).toISOString(), hoy)).toBe("02/01/2026 10:42");
    expect(() => textos.fechaLocal("invalida")).toThrow();
  });
});
