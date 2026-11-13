import { describe, expect, test } from "bun:test";
import type { RespuestaAgentes, RespuestaPermiso } from "../../../aplicacion/respuestas/contrato-generado";
import { paginaPermiso } from "./permiso";
import { paginaConsultasPermiso } from "./consultas-permiso";
import { crearManejador, type CasosWeb } from "../servidor";
import { estilos } from "../estilos";

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

const sinJson = (s: string) => s.replace(/<script[^]*?<\/script>/g, "");
const json = (cuerpo: string) => JSON.parse(cuerpo.match(/id="respuesta">([^]*?)<\/script>/)![1]!);
const noConsultar = () => { throw new Error("Consulta inesperada"); };
const casos: CasosWeb = {
  consultarEstado: noConsultar, consultarProyectosRecientes: noConsultar, resolverProyecto: noConsultar,
  consultarResolucion: () => ({ exito: false, error: { codigo: "clave-no-resuelta", mensaje: "Sin valores" } }),
  consultarAgentes: () => ({ exito: true, valor: agentes }), consultarPermiso: () => ({ exito: true, valor: permiso }),
  consultarReglas: () => ({ exito: false, error: { codigo: "sin-reglas", mensaje: "Sin reglas" } }),
  consultarHallazgos: () => ({ exito: false, error: { codigo: "sin-hallazgos", mensaje: "Sin hallazgos" } }),
  consultarEntradas: () => ({ exito: false, error: { codigo: "sin-entradas", mensaje: "Sin entradas" } }),
  compararResoluciones: noConsultar,
};
const pedir = (ruta: string, servicios = casos) => crearManejador(12345, servicios, { versionHerramienta: "1.18.25", reloj: { ahora: () => "2026-11-11T12:00:00Z" } })(new Request(`http://127.0.0.1${ruta}`, { headers: { Host: "localhost:12345" } }));

function css(selector: string): string {
  return [...estilos.replace(/\/\*[^]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selectores]) => selectores!.split(",").some(s => s.trim() === selector))
    .map(([, , declaraciones]) => declaraciones).join("\n");
}

describe("Página permiso y consultas", () => {
  test("T5-21 F-2 ubicacion corta, aviso unico y accion secundaria junto a coincidentes", async () => {
    const origenF2 = { tipo: "declarado" as const, orden: 0, posicion: { linea: 3, columna: 15 } };
    const permisoF2: RespuestaPermiso = { ...base, agente: "build", consulta: { sujeto: "read", objetivo: ".env", objetivoEvaluado: ".env", forma: "sujeto" }, decision: "allow", motivoSinDecision: null, determinante: 0, desplazadas: [], nativaAnulada: { regla: 1, por: 0 }, porDefecto: false,
      cadena: [{ indice: 0, sujeto: "read", patron: "*", efecto: "allow", origen: origenF2, declaracion: { origen: origenF2, referencia: "/p/opencode.json", via: "proyecto", valor: "allow", regla: "declarada" } }],
      explicacion: ["La regla declarada en /p/opencode.json:3:15 decide <aquí>."], advertencias: ["proteccion-nativa-anulada", "otra"], reglas: { "proteccion-nativa-anulada": "Advertencia equivalente nativa.", otra: "Otra advertencia visible." } };
    const contextoF2 = { idResolucion: "7", agente: "build", agentes: [{ nombre: "build", modo: "primary", origen: "nativo" as const, oculto: false }] };

    for (const explicacion of [permisoF2.explicacion, null]) {
      const s = sinJson(await paginaPermiso({ ...permisoF2, explicacion }, "7", contextoF2).text());
      if (explicacion) {
        const frase = s.split('id="resultado-permiso"')[1]!.split("</section>")[0]!;
        expect(frase).toContain('title="Abrir en VS Code: /p/opencode.json">opencode.json:3:15</a>');
        expect(frase.replace(/(?:title|href)="[^"]*"/g, "")).not.toContain("/p/opencode.json");
        expect(frase).toContain("&lt;aquí&gt;");
      }
      const notas = s.match(/<details id="notas-analisis">[^]*?<\/details>/)![0];
      expect(notas).toContain("Advertencia equivalente nativa.");
      expect(s.replace(notas, "")).not.toContain("Advertencia equivalente nativa.");
      expect(s).toContain("Otra advertencia visible.");
      expect(s).toMatch(/class="acciones acciones--pie">\s*<details id="cadena-efectiva">[^]*?<\/details>\s*<a class="boton boton--secundario"[^>]*>Ver la cadena completa en Todas las reglas<\/a>/);
    }
    const sinNativa = sinJson(await paginaPermiso({ ...permisoF2, nativaAnulada: null }).text());
    expect(sinNativa.split('id="advertencias"')[1]).toContain("Advertencia equivalente nativa.");
  });

  test("T5-22 B-6 herramienta sobre el campo con ancho suficiente aun en avanzadas", async () => {
    const s = await paginaConsultasPermiso(agentes, contexto).text();
    expect(s.match(/<label>Herramienta <input/g)).toHaveLength(2);
    expect(css(".formulario-permiso label")).toMatch(/flex-direction:\s*column/);
    expect(css(".formulario-permiso")).toMatch(/repeat\(auto-fit, minmax\(min\(100%, 11rem\), 1fr\)\)/);
  });

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
});
