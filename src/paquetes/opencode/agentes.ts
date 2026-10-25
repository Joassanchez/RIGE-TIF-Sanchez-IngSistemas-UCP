import type { AgenteEfectivo, ListadoAgentes } from "@rige/nucleo/contrato/adaptador";
import type { Resolucion } from "@rige/nucleo/resolucion/tipos";
import type { ContextoOpenCode } from "./contexto";
import { agentesNativos } from "./vendor/agentes-nativos";

// Solo se usan los metadatos; las rutas ficticias no salen de esta funcion pura.
const nativos = agentesNativos({ data: "", tmp: "", worktree: "", skillDirs: [], referenceDirs: [] },
  { join: (...partes) => partes.join("/"), relative: (_desde, hasta) => hasta }).agentes;

// Locale explicito, independiente del locale del proceso. Para ASCII conserva
// la colacion de localeCompare del tag; el desempate total usa unidades UTF-16.
const colacion = new Intl.Collator("en");
export function compararNombres(a: string, b: string): number {
  return colacion.compare(a, b) || (a === b ? 0 : a < b ? -1 : 1);
}

export function agentesEfectivos(resolucion: Resolucion, _contexto: ContextoOpenCode): ListadoAgentes {
  const nombres = new Set([...Object.keys(nativos), ...resolucion.noResueltas.filter(r => r.ruta[0] === "agent" && r.ruta.length === 2).map(r => r.ruta[1]!), ...[...resolucion.valores, ...resolucion.eliminadas]
    .filter(r => r.ruta[0] === "agent" && r.ruta.length >= 2).map(r => r.ruta[1]!)]);
  const agentes: AgenteEfectivo[] = [...nombres].map(nombre => {
      const noObservado = resolucion.noResueltas.find(r => r.ruta[0] === "agent" && r.ruta[1] === nombre && r.ruta.length === 2);
      const nativo = Object.hasOwn(nativos, nombre) ? nativos[nombre] : undefined;
      const propiedad = (clave: string) => [...resolucion.valores, ...resolucion.eliminadas].find(r => r.ruta.length === 3
        && r.ruta[0] === "agent" && r.ruta[1] === nombre && r.ruta[2] === clave)?.valor;
      const modo = propiedad("mode") ?? nativo?.mode ?? "all";
      const oculto = propiedad("hidden") ?? nativo?.hidden ?? false;
      const eliminacion = resolucion.eliminadas.find(r => r.ruta[0] === "agent" && r.ruta[1] === nombre
        && r.eliminacion.regla === "agente-deshabilitado")?.eliminacion;
      return { nombre, origen: nativo ? "nativo" as const : "declarado" as const, modo: modo as string, oculto: oculto as boolean,
        estado: noObservado ? "no-observado" as const : eliminacion ? "deshabilitado" as const : "activo" as const,
        motivo: noObservado?.regla ?? eliminacion?.regla ?? null,
        ...(eliminacion ? { eliminacion } : {}) };
    }).sort((a, b) => Number(b.origen === "nativo") - Number(a.origen === "nativo") || compararNombres(a.nombre, b.nombre));
  const motivos = [...new Set(resolucion.noResueltas.filter(r => r.ruta[0] === "agent" && r.ruta.length <= 2).map(r => r.regla))].sort();
  return { agentes, motivos };
}

export const listarAgentes = agentesEfectivos;
