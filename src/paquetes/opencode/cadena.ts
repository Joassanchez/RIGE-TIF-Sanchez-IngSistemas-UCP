import type { ErrorAnalisis } from "@rige/nucleo/contrato/adaptador";
import type { Resultado } from "@rige/nucleo/resultado";
import type { Cadena, ReglaCadena, Resolucion } from "@rige/nucleo/resolucion/tipos";
import { agentesNativos } from "./vendor/agentes-nativos";
import { expand, fromConfig } from "./vendor/permiso";
import type { ContextoOpenCode } from "./contexto";
import { agentesEfectivos } from "./agentes";

export function cadena(resolucion: Resolucion, agente: string, contexto: ContextoOpenCode, lanzadoPor?: string): Resultado<Cadena, ErrorAnalisis> {
  const { entorno, hogar, data, tmp, worktree } = contexto;
  const efectivos = agentesEfectivos(resolucion, contexto).agentes;
  for (const nombre of [agente, ...(lanzadoPor === undefined ? [] : [lanzadoPor])]) {
    const efectivo = efectivos.find(a => a.nombre === nombre);
    if (efectivo?.estado === "no-observado") return { exito: false, error: { categoria: "uso", codigo: "cadena-incompleta",
      mensaje: `La cadena de ${nombre} no se puede completar: ${efectivo.motivo}.` } };
    if (!efectivo || efectivo.estado === "deshabilitado") return { exito: false, error: { categoria: "uso", codigo: "agente-inexistente",
      mensaje: `El agente ${nombre} ${efectivo ? "esta deshabilitado" : "no existe"}.` } };
  }
  const path = { join: (...partes: string[]) => entorno.unir(...partes),
    relative: (desde: string, hasta: string) => entorno.relativa(desde, hasta),
    dirname: (ruta: string) => entorno.padre(ruta) };
  const nativos = agentesNativos({ data, tmp, worktree, skillDirs: [], referenceDirs: [] }, path);
  const ambito = ["agent", agente];
  const bajo = (ruta: readonly string[], prefijo: readonly string[]) => prefijo.every((s, i) => ruta[i] === s);
  const afecta = resolucion.noResueltas.find(({ ruta }) => bajo(ruta, ["permission"]) || bajo(ruta, [...ambito, "permission"])
    || (ruta.length <= ambito.length && bajo(ambito, ruta)));
  if (afecta) return { exito: false, error: { categoria: "uso", codigo: "cadena-incompleta",
    mensaje: `La cadena de ${agente} no se puede completar: ${afecta.regla}.` } };
  const reglas: ReglaCadena[] = [];
  function agregarNativas(config: Parameters<typeof fromConfig>[0], regla: string): void {
    for (const r of fromConfig(config, hogar)) reglas.push({ indice: reglas.length, sujeto: r.permission,
      patron: r.pattern, efecto: r.action, origen: { tipo: "nativo", regla }, declaracion: null });
  }
  agregarNativas(nativos.defaults, "nativa-general");
  if (Object.hasOwn(nativos.agentes, agente)) agregarNativas(nativos.agentes[agente]!.permission, "nativa-agente");
  for (const prefijo of [["permission"], [...ambito, "permission"]]) {
    for (const rastro of resolucion.valores.filter(v => bajo(v.ruta, prefijo)).toSorted((a, b) => a.indiceFusion - b.indiceFusion)) {
      const ruta = rastro.ruta.slice(prefijo.length);
      if (rastro.valor !== null && typeof rastro.valor === "object" && !Array.isArray(rastro.valor) && !Object.keys(rastro.valor).length) continue;
      if (typeof rastro.valor !== "string" || !["allow", "deny", "ask"].includes(rastro.valor) || ruta.length > 2) {
        return { exito: false, error: { categoria: "uso", codigo: "cadena-incompleta", mensaje: `La cadena de ${agente} contiene una declaracion de permiso no soportada.` } };
      }
      reglas.push({ indice: reglas.length, sujeto: ruta[0] ?? "*", patron: ruta.length === 2 ? expand(ruta[1]!, hogar) : "*",
        efecto: rastro.valor, origen: rastro.determinante.origen, declaracion: rastro.determinante });
    }
  }
  if (!reglas.some(r => r.sujeto === "external_directory" && r.efecto === "deny" && r.patron === nativos.truncamiento)) {
    agregarNativas({ external_directory: { [nativos.truncamiento]: "allow" } }, "nativa-final");
  }
  const declaraciones: string[] = [...contexto.declaraciones];
  if (lanzadoPor !== undefined) {
    declaraciones.push("reglas-agente-lanzador-excluidas", "reglas-sesion-lanzadora-excluidas");
    const modo = efectivos.find(a => a.nombre === agente)!.modo;
    if (modo === "primary") declaraciones.push("agente-no-invocable-como-subagente");
    for (const sujeto of ["todowrite", "task"]) {
      if (!reglas.some(r => r.sujeto === sujeto)) agregarNativas({ [sujeto]: "deny" }, "denegacion-subagente");
    }
  }
  const tienePrimaryTools = [...resolucion.valores, ...resolucion.noResueltas]
    .some(v => bajo(v.ruta, ["experimental", "primary_tools"]));
  const tieneReferences = [...resolucion.valores, ...resolucion.noResueltas]
    .some(v => ["references", "reference"].includes(v.ruta[0] ?? ""));
  return { exito: true, valor: { agente, reglas, ejesParciales: ["external_directory"],
    declaraciones, advertencias: [...(tienePrimaryTools ? ["primary-tools-no-incorporado"] : []),
      ...(tieneReferences ? ["references-no-incorporado"] : [])] } };
}
