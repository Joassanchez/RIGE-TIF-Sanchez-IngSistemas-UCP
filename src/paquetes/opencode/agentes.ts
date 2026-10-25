import type { AgenteListado } from "@rige/nucleo/contrato/adaptador";
import type { Resolucion } from "@rige/nucleo/resolucion/tipos";
import { agentesNativos } from "./vendor/agentes-nativos";

// Solo se usan los metadatos; las rutas ficticias no salen de esta funcion pura.
const nativos = agentesNativos({ data: "", tmp: "", worktree: "", skillDirs: [], referenceDirs: [] },
  { join: (...partes) => partes.join("/"), relative: (_desde, hasta) => hasta }).agentes;

export function agenteEliminado(resolucion: Resolucion, nombre: string): boolean {
  return (resolucion.eliminadas ?? []).some(r => r.ruta[0] === "agent" && r.ruta[1] === nombre
    && r.eliminacion.regla === "agente-deshabilitado");
}

// Locale explicito, independiente del locale del proceso. Para ASCII conserva
// la colacion de localeCompare del tag; el desempate total usa unidades UTF-16.
const colacion = new Intl.Collator("en");
export function compararNombres(a: string, b: string): number {
  return colacion.compare(a, b) || (a === b ? 0 : a < b ? -1 : 1);
}

export function listarAgentes(resolucion: Resolucion): readonly AgenteListado[] {
  const nombres = new Set([...Object.keys(nativos), ...resolucion.valores
    .filter(r => r.ruta[0] === "agent" && r.ruta.length >= 2).map(r => r.ruta[1]!)]);
  return [...nombres].filter(nombre => !agenteEliminado(resolucion, nombre)
    && !resolucion.noResueltas.some(r => r.ruta[0] === "agent" && r.ruta[1] === nombre && r.ruta.length === 2))
    .map(nombre => {
      const nativo = Object.hasOwn(nativos, nombre) ? nativos[nombre] : undefined;
      const propiedad = (clave: string) => resolucion.valores.find(r => r.ruta.length === 3
        && r.ruta[0] === "agent" && r.ruta[1] === nombre && r.ruta[2] === clave)?.valor;
      const modo = propiedad("mode") ?? nativo?.mode ?? "all";
      const oculto = propiedad("hidden") ?? nativo?.hidden ?? false;
      if (typeof modo !== "string" || !["primary", "subagent", "all"].includes(modo) || typeof oculto !== "boolean") {
        throw new Error(`Metadatos de agente invalidos: ${nombre}`);
      }
      return { nombre, origen: nativo ? "nativo" as const : "declarado" as const, modo, oculto };
    }).sort((a, b) => Number(b.origen === "nativo") - Number(a.origen === "nativo") || compararNombres(a.nombre, b.nombre));
}
