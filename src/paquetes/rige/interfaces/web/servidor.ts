import type { ConsultarEstado } from "../../aplicacion/casos-uso/consultar-estado";
import type { ResolverProyecto, DependenciasResolver } from "../../aplicacion/casos-uso/resolver-proyecto";
import type { ConsultarResolucion } from "../../aplicacion/casos-uso/consultar-resolucion";
import type { CompararResoluciones } from "../../aplicacion/casos-uso/comparar-resoluciones";
import type { ConsultarProyectosRecientes } from "../../aplicacion/casos-uso/consultar-proyectos-recientes";
import type { ConsultarHallazgos } from "../../aplicacion/casos-uso/consultar-hallazgos";
import type { ConsultarEntradas } from "../../aplicacion/casos-uso/consultar-entradas";
import type { RespuestaAgentes, RespuestaPermiso, RespuestaReglas } from "../../aplicacion/respuestas/contrato-generado";
import type { Resultado } from "../../aplicacion/respuestas/resultado";
import { errorPuertoOcupado, type ErrorUso } from "../../aplicacion/errores";
import { conErrores } from "./intermedios/errores";
import { conVerificacionDeOrigen } from "./intermedios/origen";
import { crearEnrutador } from "./rutas-web";

export type SolicitudPermisoWeb = (
  | { readonly sujeto: string; readonly herramienta?: never }
  | { readonly herramienta: string; readonly sujeto?: never }
) & {
  readonly agente: string;
  readonly objetivo: string;
  readonly lanzadoPor?: string | undefined;
};

export interface SolicitudReglasWeb {
  readonly agente: string;
  readonly lanzadoPor?: string | undefined;
}

export interface CasosWeb {
  readonly compararResoluciones: CompararResoluciones;
  readonly consultarProyectosRecientes: ConsultarProyectosRecientes;
  readonly consultarReglas: (id: string, solicitud: SolicitudReglasWeb) => Resultado<RespuestaReglas, ErrorUso>;
  readonly consultarEntradas: ConsultarEntradas;
  readonly consultarHallazgos: ConsultarHallazgos;
  readonly consultarEstado: ConsultarEstado;
  readonly resolverProyecto: ResolverProyecto;
  readonly consultarResolucion: ConsultarResolucion;
  readonly consultarPermiso: (id: string, solicitud: SolicitudPermisoWeb) => Resultado<RespuestaPermiso, ErrorUso>;
  readonly consultarAgentes: (id: string) => Resultado<RespuestaAgentes, ErrorUso>;
}

export interface PresentacionWeb {
  readonly versionHerramienta: string;
  readonly reloj: DependenciasResolver["reloj"];
  readonly hogar?: string | undefined;
}

export function crearManejador(puerto: number, casos: CasosWeb, presentacion: PresentacionWeb): (solicitud: Request) => Response {
  const enrutar = crearEnrutador(casos, presentacion);
  return conErrores(conVerificacionDeOrigen(puerto, enrutar));
}

export interface ServidorIniciado {
  readonly direccion: string;
  detener(): void;
}

export function iniciarServidor(puerto: number, casos: CasosWeb, presentacion: PresentacionWeb): Resultado<ServidorIniciado, ErrorUso> {
  try {
    const servidor = Bun.serve({ hostname: "127.0.0.1", port: puerto, fetch: crearManejador(puerto, casos, presentacion) });
    return {
      exito: true,
      valor: { direccion: `http://127.0.0.1:${puerto}`, detener: () => { servidor.stop(true); } },
    };
  } catch (falla) {
    if (typeof falla === "object" && falla !== null && "code" in falla && falla.code === "EADDRINUSE") {
      return { exito: false, error: errorPuertoOcupado(puerto) };
    }
    throw falla;
  }
}
