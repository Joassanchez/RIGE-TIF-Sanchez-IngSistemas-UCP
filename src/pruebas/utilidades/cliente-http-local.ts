import { request } from "node:http";

export interface SolicitudLocal {
  readonly host: string;
  readonly puerto: number;
  readonly ruta: string;
  readonly metodo?: string;
  readonly cabeceras?: Readonly<Record<string, string>>;
}

export interface RespuestaLocal {
  readonly estado: number;
  readonly cabeceras: Readonly<Record<string, string | string[] | undefined>>;
  readonly cuerpo: string;
}

export async function solicitarLocal(solicitud: SolicitudLocal): Promise<RespuestaLocal> {
  if (solicitud.host !== "127.0.0.1") throw new Error("Solo se admite el destino literal 127.0.0.1.");
  return new Promise((resolver, rechazar) => {
    const peticion = request({
      hostname: solicitud.host, port: solicitud.puerto, path: solicitud.ruta,
      method: solicitud.metodo ?? "GET", headers: solicitud.cabeceras, agent: false,
    }, (respuesta) => {
      let cuerpo = "";
      respuesta.setEncoding("utf8");
      respuesta.on("data", (fragmento: string) => { cuerpo += fragmento; });
      respuesta.on("error", rechazar);
      respuesta.on("end", () => {
        if (respuesta.statusCode === undefined) {
          rechazar(new Error("Respuesta local sin estado HTTP."));
          return;
        }
        resolver({ estado: respuesta.statusCode, cabeceras: respuesta.headers, cuerpo });
      });
    });
    peticion.on("error", rechazar);
    peticion.end();
  });
}
