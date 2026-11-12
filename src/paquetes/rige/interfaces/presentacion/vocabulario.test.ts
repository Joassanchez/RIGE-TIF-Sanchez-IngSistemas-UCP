import { expect, test } from "bun:test";
import type { RespuestaPermiso, RespuestaReglas, RespuestaAgentes } from "../../aplicacion/respuestas/contrato-generado";
import { renderizarPermiso, renderizarReglas, renderizarAgentes, type ContextoPresentacion } from "../cli/texto";
import { paginaPermiso } from "../web/paginas/permiso";
import { paginaReglas } from "../web/paginas/reglas";
import { agentesProyecto } from "../web/componentes-proyecto";
import { textoHtml } from "../../../../pruebas/utilidades/html";
import { seccionHtml } from "../../../../pruebas/utilidades/html";

const base = { esquema: 2 as const, proyecto: "/p", entradas: [], resumenEntradas: "", declaraciones: [], reglas: {} };
const contexto: ContextoPresentacion = { formato: "texto", ancho: 200, esConsola: false, colorHabilitado: false, todo: true, proyectoDesdeCarpetaActual: false };

test("T5-26 U-3 solo son comunes los limites y ejes de todas las filas", async () => {
  const r: RespuestaReglas = { ...base, agente: "a", cadena: [], ejesParciales: [], advertencias: [], reglas: { comun: "Límite de todos", dos: "Límite de dos" },
    matriz: { sujetos: [], motivos: [], noObservados: [], filas: ["a", "b", "c"].map(agente => ({ agente, oculto: false, error: null, celdas: [],
      ejesParciales: agente === "c" ? ["read"] : ["read", "bash"], declaraciones: agente === "c" ? ["comun"] : ["comun", "dos"], advertencias: [] })) } };
  const web = await paginaReglas(r, "1").text(), cli = renderizarReglas(r, contexto);
  expect(seccionHtml(web, "limites-comunes")).toContain("Límite de todos");
  expect(seccionHtml(web, "limites-comunes")).not.toContain("Límite de dos");
  expect(seccionHtml(web, "limites-matriz")).toContain("Límite de dos");
  expect(cli).toContain("Todos los agentes: Límite de todos");
  expect(cli).not.toContain("Todos los agentes: Límite de todos; Límite de dos");
  expect(cli).toContain("a: Límite de dos"); expect(cli).toContain("b: Límite de dos");
  expect(cli).toContain("read: parcial en todos los agentes"); expect(cli).toContain("a/bash:");
});

test("T5-26 U-2 tabla completa del vocabulario", async () => {
  const v = await import("./vocabulario");
  for (const [codigo, decision, regla, simbolo] of [["allow", "Permitido", "permitida", "✓"], ["ask", "Pregunta antes", "pregunta", "?"], ["deny", "Denegado", "denegada", "✗"], [null, "Sin decisión", "sin decisión", "—"]] as const) {
    expect(v.efectoDecision(codigo)).toBe(decision);
    expect(v.efectoRegla(codigo)).toBe(regla);
    expect(v.decisionTexto(codigo)).toBe(`${simbolo} ${decision.toUpperCase()}`);
  }
  for (const [codigo, etiqueta] of [["primary", "Principal"], ["subagent", "Subagente"], ["all", "Principal y subagente"], ["otro", "otro"]] as const) expect(v.modoAgente(codigo)).toBe(etiqueta);
  for (const [codigo, etiqueta] of [["nativa-general", "OpenCode · general"], ["nativa-agente", "OpenCode · agente"], ["nativa-final", "OpenCode · final"], ["denegacion-subagente", "OpenCode · denegación de subagente"], ["otra", "OpenCode"]] as const) expect(v.origenNativo(codigo)).toBe(etiqueta);
  for (const [codigo, etiqueta] of [["presente", "presente"], ["ausente", "ausente"], ["no_observada", "no observada"], ["no_soportada", "no soportada"]] as const) expect(v.estadoVia(codigo)).toBe(etiqueta);
  for (const [codigo, frase] of [["comando-compuesto", "El comando contiene varias operaciones; consultá cada una por separado."], ["fuera-del-arbol", "El objetivo está fuera del árbol observado."], ["eje-parcialmente-observado", "Este sujeto de permiso solo se observa parcialmente."], ["otro", "Frase del adaptador"]] as const) expect(v.motivoSinDecision(codigo, { otro: "Frase del adaptador" })).toBe(frase);
  expect(v.motivoSinDecision(null, {})).toBe("No se pudo determinar el permiso para este objetivo.");
});

test("T5-26 U-2 paridad de etiquetas para permiso, reglas y agentes", async () => {
  for (const efecto of ["allow", "ask", "deny"] as const) {
    const r: RespuestaPermiso = { ...base, agente: "build", consulta: { sujeto: "read", objetivo: "*", objetivoEvaluado: "*", forma: "sujeto" }, decision: efecto, motivoSinDecision: null, determinante: 0, desplazadas: [], nativaAnulada: null, advertencias: [], porDefecto: false, explicacion: null,
      cadena: [{ indice: 0, sujeto: "read", patron: "*", efecto, origen: { tipo: "nativo", regla: "denegacion-subagente" }, declaracion: null }] };
    const web = textoHtml(await paginaPermiso(r).text()), cli = renderizarPermiso(r, contexto);
    const decision = efecto === "allow" ? "Permitido" : efecto === "ask" ? "Pregunta antes" : "Denegado";
    const regla = efecto === "allow" ? "permitida" : efecto === "ask" ? "pregunta" : "denegada";
    expect(web).toContain(decision); expect(cli).toContain(decision.toUpperCase());
    for (const etiqueta of [regla, "OpenCode · denegación de subagente"]) { expect(web).toContain(etiqueta); expect(cli).toContain(etiqueta); }
    const reglas: RespuestaReglas = { ...base, agente: "build", cadena: r.cadena.map(r => ({ ...r, indice: 1, prevalece: [] })), ejesParciales: [], advertencias: [], matriz: { sujetos: [], filas: [], motivos: [], noObservados: [] } };
    for (const etiqueta of [regla, "OpenCode · denegación de subagente"]) {
      expect(textoHtml(await paginaReglas(reglas, "1").text())).toContain(etiqueta);
      expect(renderizarReglas(reglas, contexto)).toContain(etiqueta);
    }
    const sinDecision = { ...r, decision: null, motivoSinDecision: "comando-compuesto", reglas: { "comando-compuesto": "Texto (RF-08)" }, explicacion: ["Texto (RF-08)", "Otra explicación conservada"] };
    for (const texto of [textoHtml((await paginaPermiso(sinDecision).text()).replace(/<script[^]*?<\/script>/g, "")), renderizarPermiso(sinDecision, { ...contexto, explicar: true })]) {
      expect(texto).toContain("El comando contiene varias operaciones; consultá cada una por separado.");
      expect(texto.split("Respuesta completa:")[0]).not.toContain("(RF-08)");
      expect(texto).toContain("Otra explicación conservada");
    }
  }
  const agentes: RespuestaAgentes = { ...base, agentes: ["primary", "subagent", "all"].map(modo => ({ nombre: modo, modo, origen: "nativo", oculto: false })), eliminados: [], incompleta: false, motivos: [] };
  for (const etiqueta of ["Principal", "Subagente", "Principal y subagente"]) {
    expect(textoHtml(agentesProyecto(agentes, "1", {}).texto)).toContain(etiqueta);
    expect(renderizarAgentes(agentes, contexto)).toContain(etiqueta);
  }
});
