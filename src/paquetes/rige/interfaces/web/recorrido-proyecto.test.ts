import { describe, expect, test } from "bun:test";
import type { RespuestaAgentes, RespuestaEntradas, RespuestaHallazgos, RespuestaReglas, RespuestaValores } from "../../aplicacion/respuestas/contrato-generado";
import { versionRige } from "../../aplicacion/respuestas/estado";
import { crearManejador, type CasosWeb } from "./servidor";
import * as rutas from "./rutas";
import { fechaLocal } from "./textos";

const base = { esquema: 2 as const, proyecto: "/proyecto", entradas: [], resumenEntradas: "a".repeat(64), declaraciones: [], reglas: {} };
const agentes: RespuestaAgentes = { ...base, agentes: [
  { nombre: "oculto", modo: "subagent", origen: "nativo", oculto: true },
  { nombre: "build", modo: "all", origen: "nativo", oculto: false },
  { nombre: "propio", modo: "primary", origen: "declarado", oculto: false },
], eliminados: [], incompleta: false, motivos: [] };
const declaracion = { valor: 0.3, via: "proyecto", referencia: "/proyecto/opencode.jsonc", localizacion: "NO PARSEAR",
  regla: "ultima", origen: { tipo: "declarado" as const, orden: 1, posicion: { linea: 5, columna: 7 } } };
const valores: RespuestaValores = { ...base, versionRige, herramienta: "opencode", versionHerramienta: "1.18.25", agente: "build", ruta: null, motivo: null, noResueltas: [],
  valores: [{ clave: "temperature", rastro: { ruta: ["temperature"], indiceFusion: 0, valor: 0.3, determinante: declaracion, motivo: "ultima",
    desplazadas: [{ ...declaracion, valor: 0.1 }] } }, { clave: "steps", rastro: { ruta: ["steps"], indiceFusion: 1, valor: 2,
    determinante: { valor: 2, via: null, referencia: null, regla: "nativa", origen: { tipo: "nativo", regla: "nativa" } }, desplazadas: [], motivo: "nativo" } }],
  reglas: { ultima: "Prevalece la última declaración.", nativa: "Valor de fábrica." } };
const archivo = { orden: 3, via: "proyecto", referencia: "/proyecto/config.json", condicion: "observada" as const, resumen: null };
const entradas: RespuestaEntradas = { ...base, entradas: [archivo,
  { ...archivo, orden: 1, referencia: "/global/config.json", legibilidad: "ilegible" },
  { ...archivo, orden: 4, referencia: "VARIABLE", condicion: "definida" },
  { ...archivo, orden: 5, referencia: "https://remota", condicion: "no_observada" }],
  vias: [{ via: "proyecto", estado: "presente", cantidad: 1, revisados: ["/proyecto"] }] };
const hallazgos: RespuestaHallazgos = { ...base, incompleta: false, motivos: [], hallazgos: [
  { tipo: "regla-sin-efecto", causa: "ultima", entrada: archivo, posicion: { linea: 5, columna: 7 }, clave: null, parametros: {}, localizacion: "/proyecto/config.json:5:7", explicacion: "Una regla desplazada." },
], resumen: { elementos: null, hallazgos: { "entrada-ilegible": 0, "entrada-descartada": 0, "sustitucion-sin-valor": 0, "referencia-no-resuelta": 0, "regla-sin-efecto": 1, "elemento-sin-uso": 0 } } };
const reglas: RespuestaReglas = { ...base, agente: "build", cadena: [], ejesParciales: [], advertencias: [],
  reglas: { limite: "Límite de la fila.", parcial: "Observación parcial." }, matriz: { sujetos: ["personalizado", "external_directory"], motivos: [], noObservados: [], filas: [{ agente: "build", oculto: false,
    error: { codigo: "cadena-incompleta", mensaje: "Cadena incompleta." }, ejesParciales: ["external_directory"], declaraciones: ["limite"], advertencias: ["parcial"],
    celdas: [{ sujeto: "personalizado", efecto: "ask", prevalece: 1, motivo: null }, { sujeto: "external_directory", efecto: null, prevalece: null, motivo: "eje-parcialmente-observado" }] }] } };
const sobre = { id: 7, instante: "2026-11-11T12:00:00Z", anteriores: Array.from({ length: 20 }, (_, i) => ({ id: 20 - i, instante: "2026-11-11T12:00:00Z", resumenEntradas: base.resumenEntradas })) };
const no = (): never => { throw new Error("Consulta inesperada"); };
const casos: CasosWeb = { consultarEstado: no, consultarProyectosRecientes: no, compararResoluciones: no, resolverProyecto: no, consultarPermiso: no,
  consultarAgentes: () => ({ exito: true, valor: agentes }), consultarResolucion: () => ({ exito: true, valor: { respuesta: valores, sobre } }),
  consultarEntradas: () => ({ exito: true, valor: entradas }), consultarHallazgos: () => ({ exito: true, valor: hallazgos }), consultarReglas: () => ({ exito: true, valor: reglas }) };
function pedir(ruta: string, cambios: Partial<CasosWeb> = {}) {
  return crearManejador(12345, { ...casos, ...cambios }, { versionHerramienta: "1.18.25", reloj: { ahora: () => "2026-11-11T12:00:00Z" } })(new Request(`http://localhost${ruta}`, { headers: { Host: "localhost:12345" } }));
}
const dato = (cuerpo: string) => JSON.parse(cuerpo.match(/id="respuesta">([^]*?)<\/script>/)![1]!);

// Matriz ruta antigua → destino → JSON principal esperado (nunca combinaciones).
const migracion = [
  ["/agentes?id=7", "/resoluciones/7", agentes],
  ["/agentes?id=7&agente=build&clave=temperature&q=TEMP&lanzadoPor=plan", "/resoluciones/7?clave=temperature&q=TEMP&lanzadoPor=plan", agentes],
  ["/resoluciones/7?agente=build&clave=temperature&q=TEMP&lanzadoPor=plan", "/resoluciones/7/agentes/build?clave=temperature&q=TEMP&lanzadoPor=plan", valores],
] as const;

describe("T5-18 R-10 migración y JSON", () => {
  test("cada 303 llega a 200 con la consulta principal íntegra y sin JSON en la redirección", async () => {
    for (const [antes, destino, esperado] of migracion) {
      const respuesta = pedir(antes);
      expect(respuesta.status).toBe(303);
      expect(respuesta.headers.get("location")).toBe(destino);
      expect(await respuesta.text()).not.toContain('id="respuesta"');
      const llegada = pedir(destino);
      expect(llegada.status).toBe(200);
      const cuerpo = await llegada.text();
      expect(dato(cuerpo)).toEqual(esperado);
      expect(cuerpo).not.toContain('aria-label="Panel del proyecto"');
      expect(cuerpo).toContain("comando equivalente");
    }
    const nombre = 'a/b & "<script>';
    const redireccion = pedir(`/resoluciones/7?agente=${encodeURIComponent(nombre)}`);
    expect(redireccion.headers.get("location")).toBe(`/resoluciones/7/agentes/${encodeURIComponent(nombre)}`);
    const recibidos: string[] = [];
    const llegada = pedir(redireccion.headers.get("location")!, { consultarResolucion: (_id, agente) => { recibidos.push(agente); return { exito: true, valor: { respuesta: { ...valores, agente }, sobre } }; } });
    expect(llegada.status).toBe(200);
    expect(recibidos).toContain(nombre);
    expect(pedir("/resoluciones/7/agentes/%ZZ").status).toBe(400);
  });
});

describe("T5-18 R-1 resumen", () => {
  test("abre con proyecto, ruta, fecha y versión; cuatro bloques en orden", async () => {
    const cuerpo = await pedir("/resoluciones/7").text();
    expect(cuerpo).toContain("<h1>proyecto</h1>");
    expect(cuerpo).toContain(`n.º ${sobre.id}, ${fechaLocal(sobre.instante)}`);
    expect(cuerpo).toContain("OpenCode 1.18.25");
    expect(dato(cuerpo)).toEqual(agentes);
    const posiciones = ["cifras", "tabla-agentes", "hallazgos-actuales", "archivos-cambios", "historia"].map(id => cuerpo.indexOf(`id="${id}"`));
    expect(posiciones.every(i => i >= 0)).toBe(true);
    expect(posiciones).toEqual([...posiciones].sort((a, b) => a - b));
  });
});
describe("T5-18 R-2 cifras", () => {
  test("cuenta agentes de foto, archivos observados y hallazgos actuales; legibilidad desconocida no es cero", async () => {
    const cuerpo = await pedir("/resoluciones/7").text();
    expect(cuerpo).toContain("3</strong><span>agentes");
    expect(cuerpo).toContain("1 declarado");
    expect(cuerpo).toContain("2</strong><span>archivos leídos");
    expect(cuerpo).toContain("ilegibles: sin dato");
    expect(cuerpo).toContain("1</strong><span>hallazgos");
    expect(cuerpo).toContain("20</strong><span>análisis");
  });
});
describe("T5-18 R-3 agentes", () => {
  test("origen del contrato, modo all, ocultos al final, ausencias y parcialidad sin afirmar agentes de fábrica", async () => {
    const cuerpo = await pedir("/resoluciones/7").text();
    expect(cuerpo.indexOf('href="/resoluciones/7/agentes/build')).toBeLessThan(cuerpo.indexOf('href="/resoluciones/7/agentes/oculto'));
    expect(cuerpo).toContain("Principal y subagente");
    expect(cuerpo).toContain('class="atenuado"');
    expect(cuerpo).toContain(">oculto</span>");
    expect(cuerpo).not.toContain("nativo + cambios");
    for (const incompleta of [false, true]) {
      const soloNativos = { ...agentes, agentes: agentes.agentes.filter(a => a.origen === "nativo"), incompleta, motivos: incompleta ? ["limite"] : [], reglas: { limite: "Listado parcial." } };
      const html = await pedir("/resoluciones/7", { consultarAgentes: () => ({ exito: true, valor: soloNativos }) }).text();
      expect(html.includes("Este proyecto no define agentes nuevos: usa los de OpenCode")).toBe(!incompleta);
      if (incompleta) expect(html).toContain("Listado parcial.");
    }
    const vacia = await pedir("/resoluciones/7", { consultarAgentes: () => ({ exito: true, valor: { ...agentes, agentes: [], eliminados: [{ nombre: "quitado", declaracion }] } }), consultarResolucion: no }).text();
    for (const texto of ["Sin agentes activos", "quitado", "eliminado / deshabilitado", "fecha no disponible", "Historial no disponible para este análisis", "sin dato"]) expect(vacia).toContain(texto);
    expect(vacia).not.toContain("agentes de fábrica");
    expect(vacia).not.toContain("/comparar?");
    expect(vacia).not.toContain('id="historia"');
  });
});
describe("T5-18 R-4 hallazgos actuales", () => {
  test("un error de uso actual no impide abrir la foto ni se presenta como cero hallazgos", async () => {
    const respuesta = pedir("/resoluciones/7", {
      consultarEntradas: () => ({ exito: false, error: { codigo: "proyecto-inexistente", mensaje: "La carpeta actual no existe." } }),
      consultarHallazgos: () => ({ exito: false, error: { codigo: "version-no-soportada", mensaje: "Versión actual no soportada." } }),
    });
    expect(respuesta.status).toBe(200);
    const cuerpo = await respuesta.text();
    expect(dato(cuerpo)).toEqual(agentes);
    expect(cuerpo).toContain("La carpeta actual no existe.");
    expect(cuerpo).toContain("Versión actual no soportada.");
    expect(cuerpo).toContain("sin dato");
    expect(cuerpo).not.toContain('insignia--neutra">Sin hallazgos');
  });
  test("enlaza tipos al primer índice original; distingue análisis parcial y completo", async () => {
    const cuerpo = await pedir("/resoluciones/7").text();
    expect(cuerpo).toContain("Estado actual de los archivos");
    expect(cuerpo).toContain("Regla sin efecto");
    expect(cuerpo).toContain("#h-0");
    const detalle = await pedir("/hallazgos?proyecto=/proyecto&id=7").text();
    expect(detalle).toContain('id="h-0"');
    for (const incompleta of [true, false]) {
      const vacios = { ...hallazgos, hallazgos: [], incompleta, motivos: incompleta ? ["limite"] : [], reglas: { limite: "Análisis limitado." } };
      const html = await pedir("/resoluciones/7", { consultarHallazgos: () => ({ exito: true, valor: vacios }) }).text();
      expect(html.includes('insignia--neutra">Sin hallazgos')).toBe(!incompleta);
      if (incompleta) { expect(html).toContain("Análisis limitado."); expect(html).toContain("análisis parcial"); }
    }
  });
});
describe("T5-18 R-5 archivos e historial", () => {
  test("archivos ordenados, mapa y veinte fotos con marca consultada, reciente y comparaciones consecutivas", async () => {
    const cuerpo = await pedir("/resoluciones/7").text();
    expect(cuerpo).toContain('<details id="archivos-leidos"><summary>Archivos leídos (2)</summary>');
    expect(cuerpo).toContain("la de abajo prevalece");
    expect(cuerpo).toContain('id="mapa-vias"');
    const archivos = cuerpo.split('id="archivos-leidos"')[1]!.split('id="historia"')[0]!;
    expect(archivos.indexOf("/global/config.json")).toBeLessThan(archivos.indexOf("/proyecto/config.json"));
    expect(cuerpo).toContain('<section id="historia"><h2>Historial (20)</h2>');
    expect(cuerpo).toContain('<form class="formulario-comparar" method="get" action="/comparar">');
    expect(cuerpo).toContain('<select name="desde">');
    expect(cuerpo).toContain('<select name="hasta">');
    expect(cuerpo).not.toMatch(/<details[^>]*\bopen\b/);
    for (let id = 20; id >= 1; id--) expect(cuerpo).toContain(`href="/resoluciones/${id}"`);
    for (let id = 20; id > 1; id--) expect(cuerpo).toContain(`/comparar?desde=${id - 1}&amp;hasta=${id}`);
    expect(cuerpo).toContain('href="/resoluciones/7" aria-current="page"');
    expect(cuerpo).toContain("más reciente");
    const sinSobre = await pedir("/resoluciones/7", { consultarResolucion: () => ({ exito: false, error: { codigo: "clave-no-resuelta", mensaje: "No consultable" } }) }).text();
    expect(sinSobre).toContain("Historial no disponible para este análisis");
    expect(sinSobre).not.toContain("/comparar?");
  });
});
describe("T5-18 R-6 página del agente", () => {
  test("nombre, modo, origen y claves declaradas de toda la foto; selector conserva contexto", async () => {
    const cuerpo = await pedir("/resoluciones/7/agentes/build?q=TEMP&lanzadoPor=plan").text();
    expect(cuerpo).toContain("<h1>build</h1>");
    expect(cuerpo).toContain("Principal y subagente");
    expect(cuerpo).toContain("1 clave declarada");
    expect(cuerpo).toContain('name="q" value="TEMP"');
    expect(cuerpo).toContain('name="lanzadoPor" value="plan"');
    expect(cuerpo.match(/<form id="filtrar-claves"[^]*?<\/form>/)![0]).toContain('name="lanzadoPor" value="plan"');
    expect(cuerpo).toContain('lanzadoPor=plan">Quitar filtro');
    expect(cuerpo).toContain('aria-label="Migas de pan"');
    expect(dato(cuerpo)).toEqual(valores);
  });
});
describe("T5-18 R-7 valores", () => {
  test("solo buscador, cuatro columnas, procedencia estructurada y desplazadas tachadas; JSON íntegro", async () => {
    const cuerpo = await pedir("/resoluciones/7/agentes/build?q=TEMP").text();
    expect(cuerpo).not.toContain("Consulta exacta");
    expect(cuerpo).not.toContain('id="consultar-clave"');
    expect(cuerpo).toContain('<th scope="col">Clave</th><th scope="col">Valor</th><th scope="col">Lo determina</th><th scope="col">Desplazadas</th>');
    expect(cuerpo).toContain("Proyecto ·");
    expect(cuerpo).toContain("./opencode.jsonc:5:7</a>");
    expect(cuerpo).not.toContain("<del");
    expect(cuerpo).toContain("desplazado");
    expect(cuerpo).toContain("0.1");
    expect(cuerpo).not.toContain('data-etiqueta="Clave">steps');
    expect(dato(cuerpo)).toEqual(valores);
  });
});
describe("T5-18 R-8 enlace al editor", () => {
  test("el resumen muestra ubicación local con editor y conserva enlace al hallazgo", async () => {
    const cuerpo = await pedir("/resoluciones/7").text();
    expect(cuerpo).toContain('href="vscode://file/proyecto/config.json:5:7"');
    expect(cuerpo).toContain("#h-0");
  });
  test("Windows y POSIX codificados por segmento, un title y referencias ajenas solo texto", () => {
    expect(rutas).toHaveProperty("presentarUbicacion");
    const presentar = rutas.presentarUbicacion;
    for (const [referencia, esperado, textoEsperado] of [
      ['C:\\a b\\%#?&"\'\\config.json', "vscode://file/C:/a%20b/%25%23%3F%26%22%27/config.json:5:7", '>C:/a b/%#?&amp;&quot;&#39;/config.json:5:7</a>'],
      ["/a b/%#?&\"'/config.json", "vscode://file/a%20b/%25%23%3F%26%22%27/config.json:5:7", '>/a b/%#?&amp;&quot;&#39;/config.json:5:7</a>'],
    ]) {
      const html = presentar(referencia!, { linea: 5, columna: 7 }, "proyecto").texto;
      expect(html).toContain(`href="${esperado}"`);
      expect(html.match(/title=/g)).toHaveLength(1);
      expect(html).toContain("Abrir en VS Code:");
      expect(html).toContain(textoEsperado!);
    }
    for (const referencia of ["CONFIG", "relativa/config", "https://ejemplo/config", "file:///tmp/config"]) expect(presentar(referencia, { linea: 1, columna: 1 }, "proyecto").texto).not.toContain("<a ");
    expect(presentar("/parece/archivo", { linea: 1, columna: 1 }, "variable-contenido").texto).not.toContain("<a ");
  });
});
describe("T5-18 R-9 sujetos de permiso", () => {
  test("efectos y límites de fila sin consultas; sujeto precargado y objetivo vacío", async () => {
    const cuerpo = await pedir("/resoluciones/7/agentes/build").text();
    for (const texto of ["Sujetos de permiso", "personalizado", "pregunta", "parcial", "Cadena incompleta.", "Límite de la fila.", "Observación parcial.", "Ver todas las reglas de build"]) expect(cuerpo).toContain(texto);
    const enlace = cuerpo.match(/href="([^"]+sujeto=personalizado[^"]*)"/)![1]!.replaceAll("&amp;", "&");
    expect(enlace).toBe("/resoluciones/7/permisos?agente=build&sujeto=personalizado");
    const formulario = pedir(enlace);
    expect(formulario.status).toBe(200);
    const html = await formulario.text();
    expect(html).toContain('name="sujeto" value="personalizado"');
    expect(html).toContain('<details open><summary>Opciones avanzadas</summary>');
    expect(html).toMatch(/name="objetivo" value=""/);
    expect(html).not.toContain('id="respuesta"');
  });
});
describe("T5-18 R-11 documentación", () => {
  test("manual y README describen resumen, agente, buscador y editor", async () => {
    for (const nombre of ["MANUAL.md", "README.md"]) {
      const documento = await Bun.file(nombre).text();
      const seccion = documento.split("## 6.")[1]!.split("## 7.")[0]!;
      for (const texto of ["Resumen del proyecto", "Buscar clave", "Lo determina", "VS Code", "Historial"]) expect(seccion).toContain(texto);
      expect(seccion).not.toContain("Consultar clave");
    }
  });
});
