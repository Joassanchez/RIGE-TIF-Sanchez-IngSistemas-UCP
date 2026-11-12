import type { Resultado } from "../respuestas/resultado";
import type { ErrorUso } from "../errores";
import type { PuertoResoluciones } from "../puertos/resoluciones";
import type { RespuestaProyectosRecientes } from "../respuestas/proyectos-recientes";
import { versionEsquemaSalida } from "../respuestas/valores";

export type ConsultarProyectosRecientes = () => Resultado<RespuestaProyectosRecientes, ErrorUso>;

export function consultarProyectosRecientes(resoluciones: PuertoResoluciones): ReturnType<ConsultarProyectosRecientes> {
  const lista = resoluciones.listarProyectosRecientes();
  return lista.exito ? { exito: true, valor: { esquema: versionEsquemaSalida, proyectos: lista.valor } } : lista;
}
