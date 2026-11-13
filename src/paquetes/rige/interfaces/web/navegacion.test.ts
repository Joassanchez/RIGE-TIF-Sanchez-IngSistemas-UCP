import { describe, expect, test } from "bun:test";
import type { RespuestaAgentes, RespuestaEntradas, RespuestaHallazgos, RespuestaPermiso, RespuestaValores, RespuestaComparacion, RespuestaReglas } from "../../aplicacion/respuestas/contrato-generado";
import { versionRige } from "../../aplicacion/respuestas/estado";
import { paginaResumenProyecto } from "./paginas/resumen-proyecto";
import { paginaResolucion } from "./paginas/resolucion";
import { paginaPermiso } from "./paginas/permiso";
import { paginaHallazgos } from "./paginas/hallazgos";
import { paginaEntradas } from "./paginas/entradas";
import { paginaInicio } from "./paginas/inicio";
import { paginaErrorUso, conErrores } from "./intermedios/errores";
import { conVerificacionDeOrigen } from "./intermedios/origen";
import { crearManejador, type CasosWeb } from "./servidor";
import { estilos } from "./estilos";

const base = { esquema: 2 as const, proyecto: "/proyecto", entradas: [], resumenEntradas: "a".repeat(64), declaraciones: [], reglas: {} };
const agentes: RespuestaAgentes = { ...base, agentes: [
  { nombre: "build", origen: "nativo", modo: "primary", oculto: false },
  { nombre: "explore", origen: "nativo", modo: "subagent", oculto: true },
], eliminados: [{ nombre: "deshabilitado", declaracion: { valor: true,
  origen: { tipo: "declarado", orden: 1, posicion: { linea: 1, columna: 1 } },
  via: "proyecto", referencia: "/proyecto/config", regla: "eliminacion" } }], incompleta: false, motivos: [] };
const valores: RespuestaValores = { ...base, versionRige, herramienta: "opencode", versionHerramienta: "1.18.25",
  agente: "build", ruta: null, motivo: null, valores: [], noResueltas: [] };
const permiso: RespuestaPermiso = { ...base, agente: "build", consulta: { sujeto: "read", objetivo: ".env", objetivoEvaluado: ".env", forma: "herramienta", herramienta: "read" },
  decision: "ask", motivoSinDecision: null, determinante: null, desplazadas: [], nativaAnulada: null,
  advertencias: [], cadena: [], explicacion: [], porDefecto: true };
const sobre = { id: 7, instante: "2026-11-09T12:00:00Z", anteriores: [] };
const entrada = { orden: 0, via: "proyecto", referencia: "/proyecto/config", condicion: "observada" as const, resumen: null, legibilidad: "legible" as const };
const entradas: RespuestaEntradas = { ...base, entradas: [entrada] };
const hallazgos: RespuestaHallazgos = { ...base, entradas: [entrada], incompleta: false, motivos: [],
  hallazgos: [{ tipo: "regla-sin-efecto", causa: "regla", entrada, posicion: { linea: 2, columna: 3 }, clave: null, parametros: {}, localizacion: "/proyecto/config:2:3", explicacion: "Sin efecto" }],
  resumen: { elementos: { agentes: 2, entradas: 1, comandos: 0 }, hallazgos: { "entrada-ilegible": 0, "entrada-descartada": 0, "sustitucion-sin-valor": 0, "referencia-no-resuelta": 0, "regla-sin-efecto": 1, "elemento-sin-uso": 0 } } };
const noConsultar = () => { throw new Error("Consulta inesperada"); };
const casos: CasosWeb = { consultarEstado: noConsultar, consultarEntradas: () => ({ exito: true, valor: entradas }), consultarHallazgos: () => ({ exito: true, valor: hallazgos }),
  compararResoluciones: noConsultar, consultarProyectosRecientes: noConsultar,
  consultarReglas: () => ({ exito: false, error: { codigo: "cadena-incompleta", mensaje: "Cadena no disponible" } }),
  resolverProyecto: noConsultar, consultarPermiso: noConsultar, consultarResolucion: () => ({ exito: true, valor: { respuesta: valores, sobre } }),
  consultarAgentes: () => ({ exito: true, valor: agentes }) };
const solicitar = (casos: CasosWeb, ruta: string): Response => {
  const respuesta = crearManejador(12345, casos, { versionHerramienta: "1.18.25", reloj: { ahora: () => "2026-11-11T12:00:00Z" } })(new Request(`http://127.0.0.1${ruta}`, { headers: { Host: "localhost:12345" } }));
  if (respuesta.status !== 303 || ruta.startsWith("/resolver?")) return respuesta;
  expect(respuesta.status).toBe(303);
  return solicitar(casos, respuesta.headers.get("location")!);
};

describe("T5-09 N-1 agentes navegables", () => {
  test("enlaza activos, conserva clave y distingue eliminados", async () => {
    const cuerpo = await solicitar(casos, "/agentes?id=7&clave=temperature").text();
    for (const nombre of ["build", "explore"]) expect(cuerpo).toContain(`href="/resoluciones/7/agentes/${nombre}?clave=temperature"`);
    const eliminados = cuerpo.split('<div id="agentes-eliminados">')[1]!.split("</div>")[0]!;
    expect(eliminados).toContain('class="insignia insignia--aviso">eliminado / deshabilitado</span>');
    expect(eliminados).not.toContain('href="/resoluciones/');
    expect(eliminados).toContain("vscode://file/");
    expect(await solicitar(casos, "/agentes?id=7").text()).toContain('href="/resoluciones/7/agentes/build"');
  });
});

describe("T5-09 N-2 selector de agente", () => {
  test("consulta agentes guardados, conserva clave y seleccion actual; un error de uso omite solo el selector", async () => {
    const ids: string[] = [];
    const conAgentes: CasosWeb = { ...casos, consultarAgentes: id => { ids.push(id); return casos.consultarAgentes(id); } };
    const ruta = "/resoluciones/7?agente=build&clave=%2Ftemperature";
    const cuerpo = await solicitar(conAgentes, ruta).text();
    const formulario = cuerpo.match(/<form id="seleccionar-agente"[^]*?<\/form>/)?.[0];
    expect(formulario).toBeDefined();
    expect(formulario!).toContain('action="/resoluciones/7" method="get"');
    expect(formulario!).toContain('<select name="agente" id="agente-seleccionado">');
    expect(formulario!).toContain('<option value="build" selected>build</option>');
    expect(formulario!).toContain('<option value="explore">explore</option>');
    expect(formulario!).not.toContain("deshabilitado");
    expect(formulario!).toContain('<input type="hidden" name="clave" value="/temperature">');
    expect(cuerpo).toContain('href="/resoluciones/7"');
    expect(await solicitar(conAgentes, ruta).text()).toBe(cuerpo);
    expect(ids).toEqual(["7", "7"]);
    const sinClave = await solicitar(conAgentes, "/resoluciones/7?agente=build").text();
    expect(sinClave.match(/<form id="seleccionar-agente"[^]*?<\/form>/)![0]).not.toContain('name="clave"');
    const fallo = await solicitar({ ...casos, consultarAgentes: () => ({ exito: false,
      error: { codigo: "resolucion-inexistente", mensaje: "No existe" } }) }, ruta).text();
    expect(fallo).not.toContain('id="seleccionar-agente"');
    expect(fallo).toContain('<section id="valores">');
    expect(JSON.parse(fallo.match(/id="respuesta">([^]*?)<\/script>/)![1]!)).toEqual(valores);
  });
});

describe("T5-09-c1 C-1 selector compacto", () => {
  test("presenta etiqueta, selector acotado y boton que se apila en movil", async () => {
    const cuerpo = await solicitar(casos, "/resoluciones/7?agente=build").text();
    const formulario = cuerpo.match(/<form id="seleccionar-agente"[^]*?<\/form>/)![0];
    expect(formulario).toContain('class="selector-agente"');
    expect(formulario).toContain('<label for="agente-seleccionado">Agente</label>');
    expect(formulario).toMatch(/<\/label>\s*<select name="agente" id="agente-seleccionado">/);
    expect(formulario).toMatch(/<\/select>\s*<button class="boton--secundario">Ver agente<\/button>/);
    expect(estilos).toMatch(/\.selector-agente\s*\{[^}]*display: flex;[^}]*align-items: center;[^}]*gap: 1rem;[^}]*margin: 2rem 0;[^}]*background: var\(--superficie\);[^}]*border:/);
    expect(estilos).toMatch(/\.selector-agente label\s*\{[^}]*display: block;[^}]*margin: 0;/);
    expect(estilos).toMatch(/\.selector-agente select\s*\{[^}]*flex: 1;[^}]*width: auto;[^}]*max-width: 18rem;/);
    expect(estilos).toMatch(/@media \(max-width: 760px\)[^]*?\.selector-agente[^}]*flex-direction: column;[^}]*align-items: stretch;/);
    expect(estilos).toMatch(/@media \(max-width: 760px\)[^]*?\.selector-agente select\s*\{[^}]*width: 100%;[^}]*max-width: 100%;/);
    expect(JSON.parse(cuerpo.match(/id="respuesta">([^]*?)<\/script>/)![1]!)).toEqual(valores);
  });
});

describe("T5-09-c1 C-2 visibilidad en castellano", () => {
  test("marca ocultos por agente y mantiene los booleanos del JSON", async () => {
    const cuerpo = await paginaResumenProyecto(agentes, { exito: true, valor: { ...agentes, entradas: [] } }, { exito: false, error: { codigo: "prueba", mensaje: "No disponible" } }, "7").text();
    const tabla = cuerpo.match(/<section id="tabla-agentes">[^]*?<\/section>/)![0];
    const filas = [...tabla.matchAll(/<tbody>([^]*?)<\/tbody>/g)][0]![1]!.match(/<tr class="[^"]+">[^]*?<\/tr>/g)!;
    expect(filas).toHaveLength(2);
    expect(filas[0]).toContain('>build</a>');
    expect(filas[0]).not.toContain('>oculto</span>');
    expect(filas[1]).toContain('>explore</a>');
    expect(filas[1]).toContain('>oculto</span>');
    expect(tabla).not.toMatch(/>true<|>false</);
    const dato = JSON.parse(cuerpo.match(/id="respuesta">([^]*?)<\/script>/)![1]!);
    expect(dato).toEqual(agentes);
    expect(dato.agentes.map((agente: { oculto: boolean }) => agente.oculto)).toEqual([false, true]);
  });
});

describe("T5-09 N-3 permiso como subagente", () => {
  test("ofrece consultas separadas para omitir lanzadoPor vacio y presenta el dato solo si viene en la respuesta", async () => {
    const cuerpo = await solicitar(casos, "/resoluciones/7/permisos?agente=build").text();
    const normal = cuerpo.match(/<form id="consultar-permiso"[^]*?<\/form>/)![0];
    expect(normal).not.toContain('name="lanzadoPor"');
    const subagente = cuerpo.match(/<form id="consultar-permiso-subagente"[^]*?<\/form>/)?.[0];
    expect(subagente).toBeDefined();
    expect(subagente!).toContain('action="/permiso" method="get"');
    expect(subagente!).toContain('Lanzado por (subagente)');
    expect(subagente!).toMatch(/<input name="lanzadoPor"[^>]*required/);
    expect(subagente!).toContain('pattern=".*\\S.*"');
    expect(cuerpo).toContain("agente que lo lanza, para evaluar el permiso en contexto de subagente");
    const solicitudes: Parameters<CasosWeb["consultarPermiso"]>[1][] = [];
    const consultar = { ...casos, consultarPermiso: (_id: string, solicitud: Parameters<CasosWeb["consultarPermiso"]>[1]) => {
      solicitudes.push(solicitud); return { exito: true as const, valor: permiso };
    } };
    expect(solicitar(consultar, "/permiso?id=7&agente=build&herramienta=read&objetivo=.env").status).toBe(200);
    expect(solicitudes[0]).not.toHaveProperty("lanzadoPor");
    expect(solicitar(consultar, "/permiso?id=7&agente=build&herramienta=read&objetivo=.env&lanzadoPor=plan").status).toBe(200);
    expect(solicitudes[1]!.lanzadoPor).toBe("plan");
    const conLanzador = { ...permiso, lanzadoPor: "plan <principal>" };
    const pagina = await paginaPermiso(conLanzador).text();
    expect(pagina).toContain('Lanzado por: <code>plan &lt;principal&gt;</code>');
    expect(JSON.parse(pagina.match(/id="respuesta">([^]*?)<\/script>/)![1]!)).toEqual(conLanzador);
    expect(await paginaPermiso(permiso).text()).not.toContain("Lanzado por:");
  });
});

describe("T5-09 N-4 consultas rapidas", () => {
  test("enlaza las cuatro consultas con id y agente actuales y fichas de codigo", async () => {
    const cuerpo = await solicitar(casos, "/resoluciones/7/permisos?agente=build").text();
    const lista = cuerpo.match(/<section id="consultas-rapidas"[^]*?<\/section>/)?.[0];
    expect(lista).toBeDefined();
    expect(lista!).toContain("Consultas rápidas");
    const enlaces = [...lista!.matchAll(/<a href="([^"]+)" class="consulta-rapida">([^]*?)<\/a>/g)];
    expect(enlaces).toHaveLength(4);
    for (const [i, [herramienta, objetivo]] of [["read", ".env"], ["edit", "opencode.json"], ["bash", "git status"], ["bash", "rm -rf build"]].entries()) {
      const [url, texto] = [enlaces[i]![1]!, enlaces[i]![2]!];
      expect(url).toBe(`/permiso?id=7&amp;agente=build&amp;herramienta=${herramienta}&amp;objetivo=${encodeURIComponent(objetivo!)}`);
      expect(texto).toBe(`<span class="insignia insignia--neutra">${herramienta}</span> <code>${objetivo}</code>`);
    }
  });
});

describe("T5-09-c1 C-3 fichas de consultas rapidas", () => {
  test("agrupa las fichas sin vinetas en una fila ajustable y destaca hover sin estilos en linea", async () => {
    const cuerpo = await solicitar(casos, "/resoluciones/7/permisos?agente=build").text();
    const lista = cuerpo.match(/<section id="consultas-rapidas"[^]*?<\/section>/)![0];
    expect(lista).toContain('<ul class="consultas-rapidas">');
    expect(lista.match(/class="consulta-rapida"/g)).toHaveLength(4);
    expect(lista.match(/class="insignia insignia--neutra"/g)).toHaveLength(4);
    expect(lista.match(/<code>[^]*?<\/code>/g)).toHaveLength(4);
    expect(estilos).toMatch(/\.consultas-rapidas\s*\{[^}]*display: flex;[^}]*flex-wrap: wrap;[^}]*gap:[^}]*list-style: none;[^}]*padding: 0;/);
    expect(estilos).toMatch(/\.consultas-rapidas li\s*\{[^}]*margin: 0;/);
    expect(estilos).toMatch(/\.consulta-rapida\s*\{[^}]*display: inline-flex;[^}]*align-items: center;[^}]*gap:[^}]*border:/);
    expect(estilos).toMatch(/\.consulta-rapida:hover\s*\{[^}]*background: var\(--acento-suave\);[^}]*border-color: var\(--acento\);/);
    expect(cuerpo).not.toMatch(/\sstyle\s*=|<style\b/i);
    expect(cuerpo.replace(/<script type="application\/json" id="respuesta">[^]*?<\/script>/g, "")).not.toMatch(/<script\b/i);
    expect(cuerpo).not.toContain('id="respuesta"');
  });
});

describe("T5-09 N-5 del hallazgo a su entrada", () => {
  test("enlaza la localizacion incluso con orden cero y resalta filas con ids distintos", async () => {
    const cuerpo = await paginaHallazgos(hallazgos).text();
    expect(cuerpo).toContain('href="vscode://file/proyecto/config:2:3" title="Abrir en VS Code: /proyecto/config"');
    const sinArchivo = await paginaHallazgos({ ...hallazgos, hallazgos: hallazgos.hallazgos.map(h => ({ ...h, entrada: { ...h.entrada, referencia: "VARIABLE", via: "variable-contenido" } })) }).text();
    expect(sinArchivo).toContain('href="/entradas?proyecto=%2Fproyecto#entrada-0"');
    expect(await paginaEntradas(entradas).text()).toContain('<tr id="entrada-0"><td data-etiqueta="Orden">0</td>');
    const resolucion = await paginaResolucion({ ...valores, entradas: [entrada] }, sobre).text();
    expect(resolucion).toContain('<tr id="entrada-leida-0"><td data-etiqueta="Orden">0</td>');
    const ids = [...resolucion.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    expect(new Set(ids).size).toBe(ids.length);
    const css = await solicitar(casos, "/estilos.css").text();
    expect(css).toMatch(/tr:target\s*\{[^}]*background: var\(--acento-suave\)/);
    expect(css).toMatch(/tr:target\s*\{[^}]*outline:/);
  });
});

describe("T5-09 N-6 seguridad de navegacion", () => {
  test("codifica parametros hostiles, escapa texto y conserva JSON sin scripts ejecutables ni estilos en linea", async () => {
    const ataque = 'a & "<script># espacio';
    const escapado = 'a &amp; &quot;&lt;script&gt;# espacio';
    const codificado = encodeURIComponent(ataque);
    const proyecto = `/p/${ataque}`;
    const listado = { ...agentes, proyecto, agentes: [{ ...agentes.agentes[0]!, nombre: ataque }] };
    const conAtaque: CasosWeb = { ...casos, consultarAgentes: () => ({ exito: true, valor: listado }),
      consultarResolucion: () => ({ exito: true, valor: { sobre, respuesta: { ...valores, proyecto, agente: ataque } } }) };
    const paginaListado = await solicitar(conAtaque, `/agentes?id=7&clave=${codificado}`).text();
    expect(paginaListado).toContain('href="/resoluciones/7"');
    expect(paginaListado).toContain(`href="/resoluciones/7/agentes/${codificado}?clave=${codificado}"`);
    expect(paginaListado).toContain(`>${escapado}</a>`);
    const paginaValores = await solicitar(conAtaque, `/resoluciones/7?agente=${codificado}&clave=${codificado}`).text();
    expect(paginaValores).toContain(`<option value="${escapado}" selected>${escapado}</option>`);
    expect(paginaValores).toContain(`<input type="hidden" name="clave" value="${escapado}">`);
    const formularios = await solicitar(conAtaque, `/resoluciones/7/permisos?agente=${codificado}&clave=${codificado}`).text();
    expect(formularios).toContain(`href="/permiso?id=7&amp;agente=${codificado}&amp;herramienta=bash&amp;objetivo=rm%20-rf%20build&amp;clave=${codificado}"`);
    expect(formularios).not.toContain('id="respuesta"');
    expect(formularios).not.toMatch(/<script\b|\sstyle\s*=/i);
    const diagnostico = { ...hallazgos, proyecto, hallazgos: hallazgos.hallazgos.map(h => ({ ...h, localizacion: ataque, explicacion: ataque })) };
    const paginaDiagnostico = await paginaHallazgos(diagnostico).text();
    expect(paginaDiagnostico).toContain('href="vscode://file/proyecto/config:2:3"');
    expect(paginaDiagnostico).toContain('title="Abrir en VS Code: /proyecto/config"');
    const consulta = { ...permiso, proyecto, agente: ataque, lanzadoPor: ataque, consulta: { ...permiso.consulta, objetivo: ataque } };
    let recibida: Parameters<CasosWeb["consultarPermiso"]>[1] | undefined;
    const paginaConsulta = await solicitar({ ...casos, consultarPermiso: (_id, solicitud) => {
      recibida = solicitud; return { exito: true, valor: consulta };
    } }, `/permiso?id=7&agente=${codificado}&herramienta=read&objetivo=${codificado}&lanzadoPor=${codificado}`).text();
    expect(recibida).toEqual({ agente: ataque, herramienta: "read", objetivo: ataque, lanzadoPor: ataque });
    expect(paginaConsulta).toContain(`<code class="ficha-codigo">read: ${escapado}</code>`);
    expect(paginaConsulta).toContain(`Lanzado por: <code>${escapado}</code>`);
    const paginas: [string, unknown][] = [[paginaListado, listado], [paginaValores, { ...valores, proyecto, agente: ataque }],
      [paginaDiagnostico, diagnostico], [paginaConsulta, consulta], [await paginaEntradas({ ...entradas, proyecto }).text(), { ...entradas, proyecto }]];
    for (const [cuerpo, dato] of paginas) {
      const enlace = [...cuerpo.matchAll(/href="([^"]+)"/g)].map(m => m[1]!).find(url => url.startsWith(`/entradas?proyecto=${encodeURIComponent(proyecto)}`));
      if (cuerpo.includes('id="tabla-entradas"')) {
        expect(enlace).toBeUndefined(); // Ya no hay enlaces sueltos en la cabecera.
        expect(cuerpo).toContain(`title="/p/${escapado}"`);
      } else if (cuerpo === paginaListado) expect(enlace).toBeDefined();
      if (cuerpo === paginaListado) expect(enlace).toContain("&amp;id=7");
      if (cuerpo === paginaValores) {
        expect(enlace).toBeUndefined();
        expect(cuerpo).toContain(`title="/p/${escapado}"`);
        expect(cuerpo.split('<details id="comando-cli">')[1]).toContain('id="entradas-leidas"');
      }
      expect(cuerpo).not.toMatch(/\sstyle\s*=|<style\b/i);
      const bloques = [...cuerpo.matchAll(/<script type="application\/json" id="respuesta">([^]*?)<\/script>/g)];
      expect(bloques).toHaveLength(1);
      expect(JSON.parse(bloques[0]![1]!)).toEqual(dato);
      expect(cuerpo.replace(bloques[0]![0], "")).not.toMatch(/<script\b/i);
      for (const [, url] of cuerpo.matchAll(/(?:href|action)="([^"]+)"/g)) expect(url).not.toMatch(/[<>" ]/);
    }
  });
});

describe("Recorridos secundarios y gestión de errores", () => {
  test("P-8 recorrido secundario, compacto en Inicio, marcador tenue y errores con miga Error", async () => {
    const foto = { id: 7, instante: "2026-11-11T12:00:00Z", entradas: [], resumenEntradas: "x", noComparables: [], motivosAgentes: [], reglas: {} };
    const inicio = await paginaInicio({ esquema: 2, versionRige, almacen: { ruta: "/privado", versionEsquema: 2 } }, { esquema: 2, proyectos: Array.from({ length: 10 }, (_, id) => ({ proyecto: `/proyecto/${id}`, id, cantidad: 2, instante: foto.instante })) }, new Date("2026-11-11T12:00:00Z")).text();
    expect(inicio).toContain('placeholder="C:\\proyectos\\mi-app"');
    expect(inicio).toContain('<code title="/proyecto/0">/proyecto/0</code>');
    expect(estilos).toMatch(/\.reciente__foto\s*\{[^}]*grid-template-columns:/);
    expect(estilos).toContain("text-overflow: ellipsis");
    expect(estilos).toMatch(/input::placeholder\s*\{[^}]*font-weight: 400/);
    expect(estilos).toMatch(/#analizar-proyecto form\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\) auto/);
    expect(estilos).toMatch(/\.formulario-permiso\s*\{[^}]*grid-template-columns:/);
    expect(estilos).toMatch(/\.fila--desplazada\s*\{[^}]*color: var\(--secundario\)/);

    const declaracion = { origen: { tipo: "declarado" as const, orden: 0, posicion: { linea: 2, columna: 3 } }, via: "proyecto", referencia: "/p/proyecto/config.json", valor: "allow", regla: "declarada" };
    const comparacion: RespuestaComparacion = { esquema: 2, proyecto: "/p/proyecto", desde: foto, hasta: { ...foto, id: 8, instante: "2026-11-12T12:00:00Z" }, parcial: false, sustituciones: "solo-representacion-protegida",
      agentes: { agregados: [], quitados: [], comunes: ["build"], inciertos: [] }, resumen: { cambiadas: 1, agregadas: 0, quitadas: 0, sinCambio: 2 },
      comparaciones: [{ agente: "build", resumen: { cambiadas: 1, agregadas: 0, quitadas: 0, sinCambio: 0 }, cambios: [{ ruta: ["model"], tipo: "cambiada", motivos: ["valor"], antes: { valor: "antes", determinante: declaracion }, despues: { valor: "después", determinante: declaracion } }] }] };
    const reglas: RespuestaReglas = { ...base, proyecto: "/p/proyecto", agente: "build", cadena: [], ejesParciales: [], advertencias: [], declaraciones: [], reglas: {}, matriz: { sujetos: [], motivos: [], noObservados: [], filas: [] } };
    const servicios: CasosWeb = {
      ...casos,
      consultarReglas: () => ({ exito: true, valor: reglas }),
      compararResoluciones: () => ({ exito: true, valor: comparacion }),
      consultarPermiso: () => ({ exito: true, valor: permiso }),
    };

    const pedirRuta = (ruta: string) => crearManejador(12345, servicios, { versionHerramienta: "1.18.25", reloj: { ahora: () => "2026-11-11T12:00:00Z" } })(new Request(`http://127.0.0.1${ruta}`, { headers: { Host: "localhost:12345" } }));

    const error = await pedirRuta("/inexistente").text();
    expect(error).toContain('aria-current="page">Error</span>');
    for (const ruta of ["/resoluciones/7/permisos?agente=build", "/permiso?id=7&agente=build&herramienta=read&objetivo=.env", "/hallazgos?proyecto=%2Fproyecto&id=7", "/reglas?id=7&agente=build", "/comparar?desde=7&hasta=8", "/entradas?proyecto=%2Fproyecto&id=7"]) {
      const respuesta = pedirRuta(ruta); expect(respuesta.status).toBe(200);
      const cuerpo = await respuesta.text(); expect(cuerpo).toContain('class="migas"');
      expect(cuerpo).toContain("Local · solo lectura · sin red");
      expect(cuerpo).not.toMatch(/\sstyle=|<script(?! type="application\/json")/);
    }
  });

  test("G-7 errores humanos, rechazo previo sin contexto y 500 fijo", async () => {
    const uso = await paginaErrorUso({ codigo: "proyecto-inexistente", mensaje: "Proyecto inexistente: /p/<x>" }).text();
    expect(uso).toContain("No encontramos el proyecto"); expect(uso).toContain("/p/&lt;x&gt;");
    expect(uso).toContain("Revisá la ruta"); expect(uso).toContain("esta máquina");
    expect(uso).toContain('<small class="codigo-error">proyecto-inexistente</small>');
    let llamadas = 0;
    const manejar = conVerificacionDeOrigen(12345, () => { llamadas++; throw new Error("SECRETO"); });
    for (const [method, headers] of [["GET", { Host: "ajeno" }], ["POST", { Host: "localhost:12345" }]] as const) {
      const rechazo = await manejar(new Request("http://127.0.0.1/privado", { method, headers })).text();
      expect(rechazo).not.toMatch(/Migas de pan|\/privado/); expect(rechazo).not.toContain(versionRige);
    }
    expect(llamadas).toBe(0);
    const interno = await conErrores(() => { throw new Error("SECRETO"); })(new Request("http://127.0.0.1/")).text();
    expect(interno).toContain("Falla interna de RIGE."); expect(interno).toContain("interno"); expect(interno).not.toContain("SECRETO");
  });
});
