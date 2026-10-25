import type { Resultado } from "../respuestas/resultado";
import type { ErrorUso } from "../errores";
import type { RespuestaAgentes } from "../respuestas/agentes";
import { versionEsquemaSalida } from "../respuestas/valores";
import { analizarProyecto, type DependenciasAnalisis } from "./analizar-proyecto";

export type ConsultarAgentes = (proyecto: string) => Resultado<RespuestaAgentes, ErrorUso>;

export function consultarAgentes(dependencias: DependenciasAnalisis, proyecto: string): Resultado<RespuestaAgentes, ErrorUso> {
  const analisis = analizarProyecto(dependencias, proyecto);
  if (!analisis.exito) return analisis;
  const listar = dependencias.adaptador.listarAgentes;
  if (!listar) throw new Error("El adaptador no aporta un listado de agentes.");
  const resolucion = analisis.valor;
  const motivos = [...new Set(resolucion.noResueltas.filter(r => r.ruta[0] === resolucion.prefijoAgente[0]
    && r.ruta.length <= resolucion.prefijoAgente.length + 1).map(r => r.regla))].sort();
  const eliminados = new Map<string, RespuestaAgentes["eliminados"][number]>();
  for (const rastro of resolucion.eliminadas ?? []) {
    const nombre = rastro.ruta[resolucion.prefijoAgente.length];
    if (nombre !== undefined && rastro.ruta.slice(0, resolucion.prefijoAgente.length).every((s, i) => s === resolucion.prefijoAgente[i])) {
      eliminados.set(nombre, { nombre, declaracion: rastro.eliminacion });
    }
  }
  return { exito: true, valor: { esquema: versionEsquemaSalida, proyecto: resolucion.proyecto,
    entradas: resolucion.entradas, resumenEntradas: resolucion.resumenEntradas, agentes: listar(resolucion),
    eliminados: [...eliminados.values()], incompleta: motivos.length > 0, motivos, reglas: resolucion.reglas } };
}
