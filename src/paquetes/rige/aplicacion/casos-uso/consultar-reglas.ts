import type { Cadena } from "@rige/nucleo/resolucion/tipos";
import type { Resultado } from "@rige/nucleo/resultado";
import { errorDesdeAnalisis, errorSolicitudInvalida, type ErrorUso } from "../errores";
import type { RespuestaReglas } from "../respuestas/contrato-generado";
import { versionEsquemaSalida } from "../respuestas/valores";
import { localizarDeclaracion } from "../respuestas/localizacion";
import { prepararAnalisis, type DependenciasAnalisis } from "./analizar-proyecto";
import { plantillasDe } from "./plantillas";

export interface SolicitudReglas { readonly proyecto: string; readonly agente: string; readonly lanzadoPor?: string | undefined }

export function consultarReglas(dependencias: DependenciasAnalisis, solicitud: SolicitudReglas): Resultado<RespuestaReglas, ErrorUso> {
  const { agente, lanzadoPor } = solicitud;
  if (!agente.trim() || (lanzadoPor !== undefined && !lanzadoPor.trim())) return { exito: false,
    error: errorSolicitudInvalida("el agente o lanzador está vacío") };
  const analisis = prepararAnalisis(dependencias, solicitud.proyecto);
  if (!analisis.exito) return analisis;
  const { resolucion, contexto } = analisis.valor;
  const { adaptador } = dependencias;
  const seleccionada = adaptador.cadena(resolucion, agente, contexto, lanzadoPor);
  if (!seleccionada.exito) return { exito: false, error: errorDesdeAnalisis(seleccionada.error) };
  const listado = adaptador.listarAgentes(resolucion, contexto);
  const activas = listado.agentes.filter(a => a.estado === "activo").map(a => ({ agente: a.nombre, oculto: a.oculto,
    resultado: a.nombre === agente ? seleccionada : adaptador.cadena(resolucion, a.nombre, contexto, lanzadoPor) }));
  const cadenas: Cadena[] = activas.flatMap(f => f.resultado.exito ? [f.resultado.valor] : []);
  const resumen = adaptador.resumirPermisos(cadenas, contexto);
  const filas = activas.map(f => {
    if (!f.resultado.exito) {
      const error = errorDesdeAnalisis(f.resultado.error);
      return { agente: f.agente, oculto: f.oculto, error, ejesParciales: [], declaraciones: [], advertencias: [],
        celdas: resumen.sujetos.map(sujeto => ({ sujeto, efecto: null, prevalece: null, motivo: error.codigo })) };
    }
    const fila = resumen.filas.find(r => r.agente === f.agente);
    if (!fila) throw new Error("Falta una fila del resumen de permisos.");
    return { agente: f.agente, oculto: f.oculto, error: null, ejesParciales: f.resultado.valor.ejesParciales,
      declaraciones: [...adaptador.permisos.declaraciones, ...f.resultado.valor.declaraciones], advertencias: f.resultado.valor.advertencias,
      celdas: fila.celdas.map(c => ({ ...c, prevalece: c.prevalece === null ? null : c.prevalece + 1 })) };
  });
  const propia = filas.find(f => f.agente === agente);
  if (!propia) throw new Error("El agente seleccionado falta en el listado activo.");
  const codigos = new Set([...Object.keys(resolucion.reglas), ...listado.motivos]);
  for (const c of cadenas) {
    for (const codigo of [...adaptador.permisos.declaraciones, ...c.declaraciones, ...c.advertencias]) codigos.add(codigo);
    for (const r of c.reglas) {
      if (r.origen.tipo !== "declarado") codigos.add(r.origen.regla);
      if (r.declaracion) codigos.add(r.declaracion.regla);
    }
  }
  for (const f of filas) if (f.error === null) for (const c of f.celdas) if (c.motivo !== null) codigos.add(c.motivo);
  const reglas = plantillasDe(adaptador, codigos);
  return { exito: true, valor: { esquema: versionEsquemaSalida, proyecto: resolucion.proyecto,
    entradas: resolucion.entradas, resumenEntradas: resolucion.resumenEntradas, agente,
    ...(lanzadoPor === undefined ? {} : { lanzadoPor }), ejesParciales: seleccionada.valor.ejesParciales,
    declaraciones: propia.declaraciones, advertencias: propia.advertencias, reglas,
    cadena: seleccionada.valor.reglas.map(r => ({ ...r, indice: r.indice + 1,
      declaracion: r.declaracion === null ? null : localizarDeclaracion(r.declaracion),
      prevalece: propia.celdas.filter(c => c.prevalece === r.indice + 1).map(c => c.sujeto) })),
    matriz: { sujetos: resumen.sujetos, filas, motivos: listado.motivos,
      noObservados: listado.agentes.filter(a => a.estado === "no-observado").map(a => ({ nombre: a.nombre, motivo: a.motivo })) },
  } };
}
