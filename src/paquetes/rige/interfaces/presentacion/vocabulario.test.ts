import { expect, test } from "bun:test";
import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import type { RespuestaPermiso, RespuestaReglas, RespuestaAgentes } from "../../aplicacion/respuestas/contrato-generado";
import {
  renderizarPermiso,
  renderizarReglas,
  renderizarAgentes,
  renderizarValores,
  renderizarEntradas,
  renderizarHallazgos,
  renderizarComparacion,
  type ContextoPresentacion,
} from "../cli/texto";
import { paginaPermiso } from "../web/paginas/permiso";
import { paginaReglas } from "../web/paginas/reglas";
import { paginaResolucion } from "../web/paginas/resolucion";
import { paginaEntradas } from "../web/paginas/entradas";
import { paginaHallazgos } from "../web/paginas/hallazgos";
import { paginaComparacion } from "../web/paginas/comparacion";
import { agentesProyecto } from "../web/componentes-proyecto";
import { textoHtml } from "../../../../pruebas/utilidades/html";
import { seccionHtml } from "../../../../pruebas/utilidades/html";
import { prepararConsultas } from "../../../../pruebas/utilidades/consultas-cli";
import { AlmacenSqlite } from "../../adaptadores/almacen-sqlite/esquema";
import { RepositorioResolucionesSqlite } from "../../adaptadores/almacen-sqlite/resoluciones";
import { EntornoLecturaSistema } from "../../adaptadores/sistema/entorno-lectura";
import { adaptadorOpenCode } from "../../../opencode/adaptador";
import { versionRige } from "../../aplicacion/respuestas/estado";
import { resolverProyecto } from "../../aplicacion/casos-uso/resolver-proyecto";
import { consultarAgentes } from "../../aplicacion/casos-uso/consultar-agentes";
import { consultarResolucion } from "../../aplicacion/casos-uso/consultar-resolucion";
import { consultarEntradas } from "../../aplicacion/casos-uso/consultar-entradas";
import { consultarHallazgos } from "../../aplicacion/casos-uso/consultar-hallazgos";
import { consultarReglas } from "../../aplicacion/casos-uso/consultar-reglas";
import { consultarPermiso } from "../../aplicacion/casos-uso/consultar-permiso";
import { compararResoluciones } from "../../aplicacion/casos-uso/comparar-resoluciones";

const base = { esquema: 2 as const, proyecto: "/p", entradas: [], resumenEntradas: "", declaraciones: [], reglas: {} };
const contexto: ContextoPresentacion = { formato: "texto", ancho: 200, esConsola: false, colorHabilitado: false, todo: true, proyectoDesdeCarpetaActual: false, limitesGenerales: new Set() };

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
  expect(v.plural(1, "cambiada", "cambiadas")).toBe("cambiada");
  expect(v.plural(0, "cambiada", "cambiadas")).toBe("cambiadas");
  expect(v.plural(2, "cambiada", "cambiadas")).toBe("cambiadas");
  expect(v.origenImplicito()).toBe("OpenCode · valor de fábrica");
  expect(v.tipoHallazgo("regla-sin-efecto", 1)).toBe("Regla sin efecto");
  expect(v.tipoHallazgo("regla-sin-efecto", 2)).toBe("Reglas sin efecto");
  expect(v.causaHallazgo("tapada-por-posterior")).toBe("Tapada por regla posterior");
  expect(v.condicionEntrada("no_observada")).toBe("no observada");
  expect(v.legibilidadEntrada(null)).toBe("no observada");
  expect(v.consecuenciaError("descartada")).toBe("descartada");
  expect(v.nombreVia("variable-config")).toBe("archivo indicado por variable");
  expect(v.nombreVia("variable-config", true)).toBe("Archivo indicado por variable");
  expect(v.motivoNoResolucion("forma-v2-no-incorporada")).toBe("forma v2 de OpenCode no incorporada");
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
    for (const texto of [textoHtml((await paginaPermiso(sinDecision).text()).replace(/<script[^]*?<\/script>/g, "").replace(/<details id="ver-json">[^]*?<\/details>/g, "")), renderizarPermiso(sinDecision, { ...contexto, explicar: true })]) {
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

const codigosContratoProhibidos = [
  "entrada-ilegible", "entrada-descartada", "sustitucion-sin-valor", "referencia-no-resuelta",
  "regla-sin-efecto", "elemento-sin-uso", "sintaxis-invalida", "archivo-inexistente",
  "permiso-invalido", "variable-sin-valor", "agente-predeterminado-inexistente",
  "agente-comando-inexistente", "tapada-por-posterior", "ruta-absoluta",
  "ruta-absoluta-con-forma", "subagente-sin-uso", "no_observada", "no_soportada",
  "variable-config", "directorio-opencode", "variable-contenido", "variable-permiso",
  "hallazgos-parciales", "wellknown-no-observada", "path-inaccesible", "version-no-determinada",
  "ejecutable-no-encontrado", "paquete-no-encontrado", "paquete-ilegible",
  "valor-implicito-del-agente", "numeracion-sin-directorios-externos",
  "references-no-incorporado", "agente-deshabilitado", "eje-parcialmente-observado",
  "comando-compuesto", "salto-de-linea", "segundo-plano", "no-analizable",
  "git-no-encontrado", "deteccion-git-aproximada", "fuera-del-arbol", "denegacion-subagente",
  "reglas-agente-lanzador-excluidas", "reglas-sesion-lanzadora-excluidas",
  "agente-no-invocable-como-subagente", "primary-tools-no-incorporado",
  "proteccion-nativa-anulada", "aprobaciones-permanentes-excluidas",
  "sesion-no-interactiva-excluida", "nativa-general", "nativa-agente", "nativa-final",
  "sustitucion-no-incorporada", "tools-legado-no-incorporado", "orden-de-aplicacion",
  "fuera-del-v1", "markdown-no-observado", "forma-v2-no-incorporada",
  "elementos-sin-uso-no-evaluados", "clave-inexistente", "cadena-incompleta",
  "sin-regla", "no-observada", "no-resuelta",
];
const regexContrato = new RegExp(`\\b(?:${codigosContratoProhibidos.join("|")})\\b`);

const htmlVisible = (html: string) =>
  textoHtml(
    html
      .replace(/<script[^]*?<\/script>/g, "")
      .replace(/<details id="ver-json">[^]*?<\/details>/g, "")
      .replace(/<style[^]*?<\/style>/g, "")
  );

test("T6-07 L-1 ninguna salida de texto (CLI ni HTML visible) de los escenarios contiene códigos internos del contrato", async () => {
  const dirEscenarios = resolve(import.meta.dir, "../../../../pruebas/escenarios");
  const escenarios = readdirSync(dirEscenarios, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
  expect(escenarios.length).toBeGreaterThan(0);

  for (const nombreEscenario of escenarios) {
    const e = prepararConsultas(nombreEscenario);
    try {
      const almacen = e.variables.RIGE_ALMACEN!;
      new AlmacenSqlite(almacen, { existe: existsSync }).preparar();
      const entorno = new EntornoLecturaSistema({ entorno: e.variables, plataforma: process.platform });
      const resoluciones = new RepositorioResolucionesSqlite(almacen, { existe: existsSync }, versionRige);
      const deps = { adaptador: adaptadorOpenCode, entorno, rutas: entorno, resoluciones, reloj: { ahora: () => "2026-11-13T12:00:00Z" } };

      const salidas: { fuente: string; texto: string }[] = [];
      const entradas = consultarEntradas(deps, e.proyecto);
      if (entradas.exito) {
        salidas.push({ fuente: `${nombreEscenario}/cli/entradas`, texto: renderizarEntradas(entradas.valor, contexto) });
        salidas.push({ fuente: `${nombreEscenario}/web/entradas`, texto: htmlVisible(await paginaEntradas(entradas.valor).text()) });
      }
      const hallazgos = consultarHallazgos(deps, e.proyecto, { explicar: true });
      if (hallazgos.exito) {
        salidas.push({ fuente: `${nombreEscenario}/cli/hallazgos`, texto: renderizarHallazgos(hallazgos.valor, { ...contexto, explicar: true }) });
        salidas.push({ fuente: `${nombreEscenario}/web/hallazgos`, texto: htmlVisible(await paginaHallazgos(hallazgos.valor).text()) });
      }
      const res1 = resolverProyecto(deps, e.proyecto);
      if (res1.exito) {
        const id = res1.valor.id;
        const agentes = consultarAgentes(deps, e.proyecto);
        if (agentes.exito) {
          salidas.push({ fuente: `${nombreEscenario}/cli/agentes`, texto: renderizarAgentes(agentes.valor, contexto) });
        }
        const agenteObjetivo = agentes.exito && agentes.valor.agentes.length ? agentes.valor.agentes[0]!.nombre : "build";
        const valores = consultarResolucion(resoluciones, String(id), agenteObjetivo, "");
        if (valores.exito) {
          const sobre = { id, instante: "2026-11-13T12:00:00Z", anteriores: [] };
          salidas.push({ fuente: `${nombreEscenario}/cli/valores`, texto: renderizarValores(valores.valor.respuesta, contexto) });
          salidas.push({ fuente: `${nombreEscenario}/web/resolucion`, texto: htmlVisible(await paginaResolucion(valores.valor.respuesta, sobre).text()) });
        }
        const reglas = consultarReglas(deps, { proyecto: e.proyecto, agente: agenteObjetivo });
        if (reglas.exito) {
          salidas.push({ fuente: `${nombreEscenario}/cli/reglas`, texto: renderizarReglas(reglas.valor, contexto) });
          salidas.push({ fuente: `${nombreEscenario}/web/reglas`, texto: htmlVisible(await paginaReglas(reglas.valor, String(id)).text()) });
        }
        const permiso = consultarPermiso(deps, { proyecto: e.proyecto, agente: agenteObjetivo, sujeto: "read", objetivo: "a.ts", explicar: true });
        if (permiso.exito) {
          salidas.push({ fuente: `${nombreEscenario}/cli/permiso`, texto: renderizarPermiso(permiso.valor, { ...contexto, explicar: true }) });
          salidas.push({ fuente: `${nombreEscenario}/web/permiso`, texto: htmlVisible(await paginaPermiso(permiso.valor, String(id)).text()) });
        }
        const res2 = resolverProyecto(deps, e.proyecto);
        if (res2.exito) {
          const comp = compararResoluciones(deps, String(id), String(res2.valor.id));
          if (comp.exito) {
            salidas.push({ fuente: `${nombreEscenario}/cli/comparar`, texto: renderizarComparacion(comp.valor, contexto) });
            salidas.push({ fuente: `${nombreEscenario}/web/comparar`, texto: htmlVisible(await paginaComparacion(comp.valor).text()) });
          }
        }
      }

      for (const { fuente, texto } of salidas) {
        const limpio = texto.replaceAll(e.raiz, "<TEMP>").replaceAll(e.raiz.replaceAll("\\", "/"), "<TEMP>");
        const match = regexContrato.exec(limpio);
        expect(match, `Código interno encontrado en ${fuente}: ${match?.[0]}`).toBeNull();
      }
    } finally {
      e.borrar();
    }
  }
}, 30000);
