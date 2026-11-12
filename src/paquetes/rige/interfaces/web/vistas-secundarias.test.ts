import { describe, expect, test } from "bun:test";
import type { RespuestaAgentes, RespuestaComparacion, RespuestaEntradas, RespuestaHallazgos, RespuestaPermiso, RespuestaReglas } from "../../aplicacion/respuestas/contrato-generado";
import { paginaConsultasPermiso } from "./paginas/consultas-permiso";
import { paginaPermiso } from "./paginas/permiso";
import { paginaHallazgos } from "./paginas/hallazgos";
import { paginaReglas } from "./paginas/reglas";
import { paginaComparacion } from "./paginas/comparacion";
import { paginaEntradas } from "./paginas/entradas";
import { paginaInicio } from "./paginas/inicio";
import { crearManejador, type CasosWeb } from "./servidor";
import { versionRige } from "../../aplicacion/respuestas/estado";
import { fechaLocal } from "./textos";
import { estilos } from "./estilos";

const base = { esquema: 2 as const, proyecto: "/p/proyecto", entradas: [], resumenEntradas: "a".repeat(64), declaraciones: [], reglas: {} };
const agentes: RespuestaAgentes = { ...base, agentes: [{ nombre: "a/b", origen: "declarado", modo: "all", oculto: false }], eliminados: [], incompleta: false, motivos: [] };
const contexto = { idResolucion: "7", agente: "a/b", agentes: agentes.agentes, instante: "2026-11-11T12:00:00Z" };
const origen = { tipo: "declarado" as const, orden: 0, posicion: { linea: 2, columna: 3 } };
const declaracion = { origen, via: "proyecto", referencia: "/p/proyecto/config & #.json", valor: "allow", regla: "declarada" };
const permiso: RespuestaPermiso = { ...base, agente: "a/b", consulta: { sujeto: "read", objetivo: ".env", objetivoEvaluado: ".env", forma: "herramienta", herramienta: "read" },
  decision: "allow", motivoSinDecision: null, determinante: 1, desplazadas: [0], nativaAnulada: { regla: 0, por: 1 },
  cadena: [{ indice: 0, sujeto: "read", patron: ".env*", efecto: "ask", origen: { tipo: "nativo", regla: "nativa-general" }, declaracion: null },
    { indice: 1, sujeto: "read", patron: "*", efecto: "allow", origen, declaracion }],
  advertencias: ["aviso"], reglas: { aviso: "Advertencia conservada", declarada: "Permiso declarado" },
  explicacion: ["Primera oración.", "Segunda oración <completa>."], porDefecto: false, herramienta: { nombre: "read", ofrecida: false } };
const entradas: RespuestaEntradas = { ...base, entradas: [
  { orden: 2, via: "proyecto", referencia: "/p/proyecto/config.json", condicion: "observada", resumen: "x" },
  { orden: 0, via: "global", referencia: "/global/config.json", condicion: "observada", resumen: "y" },
], vias: [{ via: "proyecto", estado: "presente", cantidad: 1, revisados: ["/p/proyecto/config.json"] },
  { via: "ausente", estado: "ausente", cantidad: 0, revisados: ["/ausente"] }, { via: "remota", estado: "no_observada", cantidad: 0, revisados: [] }] };
const hallazgo = { tipo: "regla-sin-efecto" as const, causa: "regla", entrada: { orden: 0, via: "proyecto", referencia: declaracion.referencia, condicion: "observada" as const }, posicion: origen.posicion, clave: ["agent", "a/b", "permission"], parametros: {}, localizacion: "no parsear:2:3", explicacion: "No tiene efecto <aquí>." };
const hallazgos: RespuestaHallazgos = { ...base, incompleta: true, motivos: ["parcial"], reglas: { parcial: "Faltan entradas por observar", regla: "Regla relacionada" },
  resumen: { elementos: null, hallazgos: { "entrada-ilegible": 0, "entrada-descartada": 0, "sustitucion-sin-valor": 1, "referencia-no-resuelta": 0, "regla-sin-efecto": 2, "elemento-sin-uso": 0 } },
  hallazgos: [hallazgo, { ...hallazgo, tipo: "sustitucion-sin-valor", causa: "variable", entrada: { ...hallazgo.entrada, via: "variable-contenido", referencia: "VARIABLE" }, clave: null }, { ...hallazgo, clave: null }] };
const reglas: RespuestaReglas = { ...base, agente: "a/b", cadena: [], ejesParciales: [], advertencias: ["comun"], declaraciones: ["comun"],
  reglas: { comun: "Límite común irrepetible", propio: "Límite propio", "eje-parcialmente-observado": "Observación parcial del eje" },
  matriz: { sujetos: ["personalizado", "external_directory"], motivos: ["comun"], noObservados: [], filas: [
    { agente: "a/b", oculto: false, error: null, ejesParciales: ["external_directory"], declaraciones: ["comun", "propio"], advertencias: ["comun"],
      celdas: [{ sujeto: "personalizado", efecto: "ask", prevalece: 1, motivo: null }, { sujeto: "external_directory", efecto: null, prevalece: null, motivo: "eje-parcialmente-observado" }] },
    { agente: "otro", oculto: false, error: { codigo: "cadena-incompleta", mensaje: "No observable" }, ejesParciales: [], declaraciones: ["comun"], advertencias: [], celdas: [] },
  ] } };
const foto = { id: 7, instante: contexto.instante, entradas: [], resumenEntradas: "x", noComparables: [], motivosAgentes: [], reglas: {} };
const comparacion: RespuestaComparacion = { esquema: 2, proyecto: base.proyecto, desde: foto, hasta: { ...foto, id: 8, instante: "2026-11-12T12:00:00Z" }, parcial: false, sustituciones: "solo-representacion-protegida",
  agentes: { agregados: [], quitados: [], comunes: ["a/b", "otro"], inciertos: [] }, resumen: { cambiadas: 1, agregadas: 0, quitadas: 0, sinCambio: 2 },
  comparaciones: [{ agente: "a/b", resumen: { cambiadas: 1, agregadas: 0, quitadas: 0, sinCambio: 0 }, cambios: [{ ruta: ["model"], tipo: "cambiada", motivos: ["valor"], antes: { valor: "antes", determinante: declaracion }, despues: { valor: "después", determinante: declaracion } }] },
    { agente: "otro", resumen: { cambiadas: 0, agregadas: 0, quitadas: 0, sinCambio: 2 }, cambios: [] }] };
const json = (cuerpo: string) => JSON.parse(cuerpo.match(/id="respuesta">([^]*?)<\/script>/)![1]!);
const noConsultar = () => { throw new Error("Consulta inesperada"); };
const casos: CasosWeb = { consultarEstado: noConsultar, consultarProyectosRecientes: noConsultar, resolverProyecto: noConsultar,
  consultarResolucion: () => ({ exito: false, error: { codigo: "clave-no-resuelta", mensaje: "Sin valores" } }),
  consultarAgentes: () => ({ exito: true, valor: agentes }), consultarPermiso: () => ({ exito: true, valor: permiso }),
  consultarReglas: () => ({ exito: true, valor: reglas }), consultarHallazgos: () => ({ exito: true, valor: hallazgos }),
  consultarEntradas: () => ({ exito: true, valor: entradas }), compararResoluciones: () => ({ exito: true, valor: comparacion }) };
const pedir = (ruta: string, servicios = casos) => crearManejador(12345, servicios, { versionHerramienta: "1.18.25", reloj: { ahora: () => "2026-11-11T12:00:00Z" } })(new Request(`http://127.0.0.1${ruta}`, { headers: { Host: "localhost:12345" } }));

describe("T5-19", () => {
  test("P-1 formularios independientes, selector, sugerencias no exhaustivas y discriminantes GET", async () => {
    const cuerpo = await paginaConsultasPermiso(agentes, { ...contexto, sujeto: "personalizado", lanzadoPor: "plan" }).text();
    expect(cuerpo).toContain('<summary>Opciones avanzadas</summary>');
    expect(cuerpo).toContain('<datalist id="sugerencias-herramienta">');
    expect(cuerpo).toContain("Sugerencias no exhaustivas");
    expect(cuerpo).toContain("Acción u objetivo");
    const formularios = [...cuerpo.matchAll(/<form\b[^]*?<\/form>/g)].filter(m => m[0].includes('action="/permiso"'));
    expect(formularios).toHaveLength(3);
    const enviadas: Parameters<CasosWeb["consultarPermiso"]>[1][] = [];
    for (const [i, [formulario]] of formularios.entries()) {
      expect(formulario.match(/<form\b/g)).toHaveLength(1);
      expect(formulario).toContain('<select name="agente"');
      const nombres = [...formulario.matchAll(/name="([^"]+)"/g)].map(m => m[1]!);
      expect(nombres.filter(n => ["sujeto", "herramienta"].includes(n))).toHaveLength(1);
      expect(nombres.includes("lanzadoPor")).toBe(i === 1);
      const parametros = new URLSearchParams();
      for (const nombre of nombres) parametros.set(nombre, ({ id: "7", agente: "a/b", herramienta: "read", sujeto: "personalizado", objetivo: ".env", lanzadoPor: "plan" } as Record<string, string>)[nombre] ?? "");
      expect(pedir(`/permiso?${parametros}`, { ...casos, consultarPermiso: (_id, s) => { enviadas.push(s); return { exito: true, valor: permiso }; } }).status).toBe(200);
    }
    expect(enviadas).toEqual([{ agente: "a/b", herramienta: "read", objetivo: ".env" }, { agente: "a/b", herramienta: "read", objetivo: ".env", lanzadoPor: "plan" }, { agente: "a/b", sujeto: "personalizado", objetivo: ".env" }]);
    expect(cuerpo).not.toContain('id="respuesta"');
    expect(cuerpo).toContain("consultas-rapidas");
    const redireccion = pedir("/resoluciones/7?agente=a%2Fb");
    expect(redireccion.status).toBe(303); expect(redireccion.headers.get("location")).toBe("/resoluciones/7/agentes/a%2Fb");
    for (const nombre of ["%ZZ", "%E0%A4"]) expect(pedir(`/resoluciones/7/agentes/${nombre}`).status).toBe(400);
  });

  test("P-2 decisión grande, explicación destacada y motivo cuando no hay decisión", async () => {
    for (const [decision, texto] of [["allow", "Permitido"], ["ask", "Pregunta antes"], ["deny", "Denegado"]]) {
      const cuerpo = await paginaPermiso({ ...permiso, decision: decision! }, "7", contexto).text();
      expect(cuerpo).toContain(`>${texto}</span>`);
      expect(cuerpo).toMatch(/id="resultado-permiso"[^]*?Primera oración\./);
    }
    const sin = await paginaPermiso({ ...permiso, decision: null, determinante: null, cadena: [], motivoSinDecision: "comando-compuesto" }, "7").text();
    const resultado = sin.match(/id="resultado-permiso"[^]*?<\/section>/)![0];
    expect(resultado).toContain("El comando contiene varias operaciones");
    expect(resultado).toContain('>Sin decisión</span>');
    expect(pedir("/permiso?id=7&agente=a%2Fb&herramienta=read&objetivo=.env", { ...casos, consultarPermiso: () => ({ exito: false, error: { codigo: "cadena-incompleta", mensaje: "No observable" } }) }).status).toBe(422);
  });

  test("P-3 determinante cero o null, carácter, protección anulada e índices desde uno", async () => {
    const cuerpo = await paginaPermiso(permiso, "7", contexto).text();
    expect(cuerpo).toContain("Regla que decide");
    expect(cuerpo).toContain("Esta declaración anula una protección nativa de OpenCode");
    expect(cuerpo).toContain("regla 1, por 2");
    expect(cuerpo).toContain('<details id="cadena-efectiva"><summary>Ver reglas coincidentes (2)</summary>');
    expect(cuerpo).toContain('class="fila--desplazada"');
    expect(cuerpo).toContain("vscode://file/p/proyecto/config%20%26%20%23.json:2:3");
    expect(cuerpo).toContain('href="/reglas?id=7&amp;agente=a%2Fb"');
    expect(cuerpo).toMatch(/<details[^>]*><summary>Explicación completa<\/summary>[^]*?Segunda oración &lt;completa&gt;\./);
    expect(cuerpo).toContain("read, retirada"); expect(cuerpo).toContain("Advertencia conservada");
    expect(json(cuerpo)).toEqual(permiso);
    for (const [regla, caracter] of [["nativa-general", "OpenCode · general"], ["nativa-agente", "OpenCode · agente"], ["denegacion-subagente", "OpenCode · denegación de subagente"]]) {
      const cero = await paginaPermiso({ ...permiso, determinante: 0, cadena: [{ ...permiso.cadena[0]!, origen: { tipo: "nativo", regla: regla! } }] }).text();
      expect(cero.match(/id="regla-determinante"[^]*?<\/section>/)![0]).toContain(caracter!);
    }
    const defecto = await paginaPermiso({ ...permiso, determinante: null, cadena: [], porDefecto: true }).text();
    expect(defecto).toContain("No hay una regla determinante");
  });

  test("P-4 tarjetas agrupadas, anclas originales, causa, ubicación, parcialidad y acciones justificadas", async () => {
    const cuerpo = await paginaHallazgos(hallazgos, contexto).text();
    expect(cuerpo).toContain("Estado actual de los archivos");
    expect(cuerpo).toMatch(/<article id="h-0"[^]*?Causa[^]*?No tiene efecto &lt;aquí&gt;/);
    expect(cuerpo.indexOf('id="h-2"')).toBeLessThan(cuerpo.indexOf('id="h-1"'));
    expect(cuerpo).toContain("agent › a/b › permission");
    expect(cuerpo).toContain("Regla relacionada");
    expect(cuerpo).toContain("vscode://file/p/proyecto/config%20%26%20%23.json:2:3");
    expect(cuerpo).toContain("#entrada-0"); expect(cuerpo).toContain("Faltan entradas por observar");
    expect(cuerpo).toContain("Qué hacer"); expect(cuerpo).toContain("análisis parcial");
    expect(json(cuerpo)).toEqual(hallazgos);
    const vacio = await paginaHallazgos({ ...hallazgos, hallazgos: [] }).text();
    expect(vacio).toContain("Sin hallazgos observados; análisis parcial"); expect(vacio).not.toContain("insignia--permitida");
  });

  test("P-5 matriz primero, sujetos propios y límites comunes una sola vez", async () => {
    const cuerpo = await paginaReglas(reglas, "7", contexto).text();
    expect(cuerpo.indexOf('id="matriz-permisos"')).toBeLessThan(cuerpo.indexOf('id="cadena-completa"'));
    expect(cuerpo).toContain('aria-current="page">Todas las reglas</span>');
    expect(cuerpo.match(/Límite común irrepetible/g)).toHaveLength(2); // HTML una vez y JSON íntegro una vez.
    expect(cuerpo).toContain("Límite propio"); expect(cuerpo).toContain("cadena-incompleta: No observable");
    expect(cuerpo).toContain("sujeto=personalizado"); expect(cuerpo).toContain("sujeto=external_directory");
    expect(cuerpo).toContain("parcial"); expect(cuerpo).toContain("sin decisión");
    expect(json(cuerpo)).toEqual(reglas);
  });

  test("P-6 fechas locales, migas, tres columnas y procedencias enlazadas", async () => {
    const cuerpo = await paginaComparacion(comparacion).text();
    expect(cuerpo).toContain(`<h1>Cambios entre ${fechaLocal(foto.instante)} y ${fechaLocal(comparacion.hasta.instante)}</h1>`);
    expect(cuerpo).toContain('aria-current="page">Comparar</span>');
    expect(cuerpo).toContain('<th>Clave</th><th>Antes</th><th>Después</th>');
    expect(cuerpo).toContain("Sin cambios: otro (2)");
    expect(cuerpo).toContain("vscode://file/"); expect(json(cuerpo)).toEqual(comparacion);
  });

  test("P-7 archivos por precedencia, mapa agrupado y lugares plegados", async () => {
    const cuerpo = await paginaEntradas(entradas, contexto).text();
    expect(cuerpo).toContain("la de abajo prevalece");
    expect(cuerpo.indexOf('id="entrada-0"')).toBeLessThan(cuerpo.indexOf('id="entrada-2"'));
    for (const grupo of ["Presentes", "Ausentes", "No observadas"]) expect(cuerpo).toContain(grupo);
    expect(cuerpo).toContain("<details><summary>Lugares revisados</summary>");
    expect(cuerpo).not.toMatch(/<details[^>]* open/); expect(json(cuerpo)).toEqual(entradas);
  });

  test("P-8 recorrido secundario, compacto en Inicio, marcador tenue y errores con miga Error", async () => {
    const inicio = await paginaInicio({ esquema: 2, versionRige, almacen: { ruta: "/privado", versionEsquema: 2 } }, { esquema: 2, proyectos: Array.from({ length: 10 }, (_, id) => ({ proyecto: `/proyecto/${id}`, id, cantidad: 2, instante: foto.instante })) }, new Date("2026-11-11T12:00:00Z")).text();
    expect(inicio).toContain('placeholder="C:\\proyectos\\mi-app"');
    expect(inicio).toContain('<code title="/proyecto/0">/proyecto/0</code>');
    expect(estilos).toMatch(/\.reciente__foto\s*\{[^}]*grid-template-columns:/);
    expect(estilos).toContain("text-overflow: ellipsis");
    expect(estilos).toMatch(/input::placeholder\s*\{[^}]*font-weight: 400/);
    expect(estilos).toMatch(/#analizar-proyecto form\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\) auto/);
    expect(estilos).toMatch(/\.formulario-permiso\s*\{[^}]*grid-template-columns:/);
    expect(estilos).toMatch(/\.fila--desplazada\s*\{[^}]*color: var\(--secundario\)/);
    const error = await pedir("/inexistente").text();
    expect(error).toContain('aria-current="page">Error</span>');
    for (const ruta of ["/resoluciones/7/permisos?agente=a%2Fb", "/permiso?id=7&agente=a%2Fb&herramienta=read&objetivo=.env", "/hallazgos?proyecto=%2Fp%2Fproyecto&id=7", "/reglas?id=7&agente=a%2Fb", "/comparar?desde=7&hasta=8", "/entradas?proyecto=%2Fp%2Fproyecto&id=7"]) {
      const respuesta = pedir(ruta); expect(respuesta.status).toBe(200);
      const cuerpo = await respuesta.text(); expect(cuerpo).toContain('class="migas"');
      expect(cuerpo).toContain("Local · solo lectura · sin red");
      expect(cuerpo).not.toMatch(/\sstyle=|<script(?! type="application\/json")/);
    }
  });

  test("P-9 manual y README describen recorrido y vistas secundarias", async () => {
    for (const archivo of ["README.md", "MANUAL.md"]) {
      const texto = await Bun.file(new URL(`../../../../${archivo}`, import.meta.url)).text();
      for (const frase of ["Inicio → resumen → agente → permiso / hallazgos", "Opciones avanzadas", "Ver reglas coincidentes", "Regla que decide", "Estado actual de los archivos"])
        expect(texto).toContain(frase);
    }
  });
});
