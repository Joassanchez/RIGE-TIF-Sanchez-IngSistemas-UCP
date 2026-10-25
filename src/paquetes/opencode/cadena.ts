import type { ErrorAnalisis } from "@rige/nucleo/contrato/adaptador";
import type { EntornoLectura } from "@rige/nucleo/contrato/entorno";
import type { Resultado } from "@rige/nucleo/resultado";
import type { Cadena, ReglaCadena, Resolucion } from "@rige/nucleo/resolucion/tipos";
import { agentesNativos } from "./vendor/agentes-nativos";
import { expand, fromConfig } from "./vendor/permiso";

export function cadena(resolucion: Resolucion, agente: string, entorno: EntornoLectura): Resultado<Cadena, ErrorAnalisis> {
  const path = { join: (...partes: string[]) => entorno.unir(...partes),
    relative: (desde: string, hasta: string) => entorno.relativa(desde, hasta),
    dirname: (ruta: string) => entorno.padre(ruta) };
  const hogar = entorno.variable(entorno.plataforma === "win32" ? "USERPROFILE" : "HOME") || entorno.variable("HOME");
  if (!hogar) throw new Error("El puerto de entorno debe proporcionar el hogar.");
  const data = path.join(entorno.variable("XDG_DATA_HOME") || path.join(hogar, ".local", "share"), "opencode");
  const temporal = entorno.plataforma === "win32"
    ? entorno.variable("TEMP") || entorno.variable("TMP") || path.join(entorno.variable("SystemRoot") || "C:\\Windows", "temp")
    : entorno.variable("TMPDIR") || entorno.variable("TMP") || entorno.variable("TEMP") || "/tmp";
  let worktree = resolucion.proyecto;
  while (entorno.tipo(path.join(worktree, ".git")) === "inexistente") {
    const padre = path.dirname(worktree);
    if (padre === worktree) { worktree = resolucion.proyecto; break; }
    worktree = padre;
  }
  const nativos = agentesNativos({ data, tmp: path.join(temporal, "opencode"), worktree, skillDirs: [], referenceDirs: [] }, path);
  const ambito = ["agent", agente];
  const bajo = (ruta: readonly string[], prefijo: readonly string[]) => prefijo.every((s, i) => ruta[i] === s);
  const afecta = resolucion.noResueltas.find(({ ruta }) => bajo(ruta, ["permission"]) || bajo(ruta, [...ambito, "permission"])
    || (ruta.length <= ambito.length && bajo(ambito, ruta)));
  if (afecta) return { exito: false, error: { categoria: "uso", codigo: "cadena-incompleta",
    mensaje: `La cadena de ${agente} no se puede completar: ${afecta.regla}.` } };
  if (!Object.hasOwn(nativos.agentes, agente) && !resolucion.valores.some(v => bajo(v.ruta, ambito))) {
    return { exito: false, error: { categoria: "uso", codigo: "agente-inexistente", mensaje: `El agente ${agente} no existe.` } };
  }
  const reglas: ReglaCadena[] = [];
  function agregarNativas(config: Parameters<typeof fromConfig>[0], regla: string): void {
    for (const r of fromConfig(config, hogar!)) reglas.push({ indice: reglas.length, sujeto: r.permission,
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
  return { exito: true, valor: { agente, reglas, ejesParciales: ["external_directory"] } };
}
