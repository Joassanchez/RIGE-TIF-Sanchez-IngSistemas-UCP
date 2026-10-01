import { describe, expect, test } from "bun:test";
import { solicitarLocal } from "./cliente-http-local";

describe("H-1", () => {
  test("rechaza destinos distintos del literal local antes de conectar", async () => {
    let conexiones = 0;
    const escucha = Bun.listen({
      hostname: "127.0.0.1", port: 0,
      socket: { open(socket) { conexiones++; socket.end(); }, data() {} },
    });
    try {
      for (const host of ["localhost", "127.0.0.2"]) {
        await expect(solicitarLocal({ host, puerto: escucha.port, ruta: "/" })).rejects.toThrow();
      }
      await Bun.sleep(20);
      expect(conexiones).toBe(0);
    } finally { escucha.stop(true); }
  });
});

describe("H-2", () => {
  test("conecta al destino local y conserva Host, metodo, ruta y respuesta", async () => {
    const solicitudes: { host: string | null; metodo: string; ruta: string }[] = [];
    const servidor = Bun.serve({
      hostname: "127.0.0.1", port: 0,
      fetch(solicitud) {
        solicitudes.push({ host: solicitud.headers.get("Host"), metodo: solicitud.method, ruta: new URL(solicitud.url).pathname });
        return new Response("Respuesta de prueba: ñ", { status: 202, headers: { "X-Prueba": "local" } });
      },
    });
    try {
      const respuesta = await solicitarLocal({
        host: "127.0.0.1", puerto: servidor.port!, ruta: "/prueba", metodo: "POST", cabeceras: { Host: "ajeno.example" },
      });
      expect(solicitudes).toEqual([{ host: "ajeno.example", metodo: "POST", ruta: "/prueba" }]);
      expect(respuesta.estado).toBe(202);
      expect(respuesta.cabeceras["x-prueba"]).toBe("local");
      expect(respuesta.cuerpo).toBe("Respuesta de prueba: ñ");
      await solicitarLocal({ host: "127.0.0.1", puerto: servidor.port!, ruta: "/" });
      expect(solicitudes[1]?.metodo).toBe("GET");
    } finally { servidor.stop(true); }
  });
});
