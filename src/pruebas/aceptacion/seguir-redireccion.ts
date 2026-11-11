import { expect } from "bun:test";
import { solicitarLocal, type SolicitudLocal, type RespuestaLocal } from "../utilidades/cliente-http-local";

// Las altas conservan su 303 observable; las rutas migradas se siguen hasta su vista.
export async function solicitarPaginaLocal(solicitud: SolicitudLocal): Promise<RespuestaLocal> {
  let actual = solicitud;
  for (let paso = 0; paso < 4; paso++) {
    const respuesta = await solicitarLocal(actual);
    if (respuesta.estado !== 303 || actual.ruta.startsWith("/resolver?")) return respuesta;
    expect(respuesta.estado).toBe(303);
    expect(respuesta.cuerpo).not.toContain('id="respuesta"');
    expect(typeof respuesta.cabeceras.location).toBe("string");
    const destino = String(respuesta.cabeceras.location);
    expect(destino.startsWith("/resoluciones/")).toBe(true);
    actual = { ...actual, ruta: destino };
  }
  throw new Error("Ciclo de redirecciones en una ruta migrada");
}
