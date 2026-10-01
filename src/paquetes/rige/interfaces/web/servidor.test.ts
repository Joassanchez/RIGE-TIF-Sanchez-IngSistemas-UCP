import { describe, expect, spyOn, test } from "bun:test";
import { errorAlmacenSinEsquema } from "../../aplicacion/errores";
import type { RespuestaEstado } from "../../aplicacion/respuestas/estado";
import { paginaInicio } from "./paginas/inicio";
import { crearManejador, iniciarServidor } from "./servidor";

const respuesta: RespuestaEstado = {
  esquema: 1, versionRige: "0.1.0", almacen: { ruta: "/temporal/rige.db", versionEsquema: 1 },
};

describe("W-4", () => {
  test("consulta en cada inicio, presenta errores y omite la consulta en otras rutas", async () => {
    const puerto = 12345;
    const solicitar = (ruta = "/") => new Request(`http://127.0.0.1${ruta}`, { headers: { Host: `127.0.0.1:${puerto}` } });
    let llamadas = 0;
    const manejar = crearManejador(puerto, () => { llamadas++; return { exito: true, valor: respuesta }; });
    for (let indice = 0; indice < 2; indice++) {
      const inicio = manejar(solicitar());
      expect(inicio.status).toBe(200);
      expect(await inicio.text()).toBe(await paginaInicio(respuesta).text());
    }
    expect(llamadas).toBe(2);
    const otra = manejar(solicitar("/otra"));
    expect(otra.status).toBe(404);
    expect(otra.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
    expect(await otra.text()).toContain("Página no encontrada.");
    expect(llamadas).toBe(2);
    const uso = crearManejador(puerto, () => ({ exito: false, error: errorAlmacenSinEsquema }));
    expect(uso(solicitar()).status).toBe(503);
    const falla = crearManejador(puerto, () => { throw new Error("Detalle privado"); });
    expect(falla(solicitar()).status).toBe(500);
  });
});

describe("W-5", () => {
  test("traduce solo EADDRINUSE y detener libera el puerto local", () => {
    const escucha = Bun.listen({ hostname: "127.0.0.1", port: 0, socket: { data() {} } });
    const puerto = escucha.port;
    try {
      const ocupado = iniciarServidor(puerto, () => ({ exito: true, valor: respuesta }));
      if (ocupado.exito) ocupado.valor.detener();
      expect(ocupado).toEqual({
        exito: false, error: { codigo: "puerto-ocupado", mensaje: expect.stringContaining("RIGE_PUERTO") },
      });
      if (!ocupado.exito) {
        expect(ocupado.error.mensaje).toContain(String(puerto));
        expect(ocupado.error.mensaje).not.toMatch(/[áéíóúñ]/i);
      }
    } finally { escucha.stop(true); }
    const iniciado = iniciarServidor(puerto, () => ({ exito: true, valor: respuesta }));
    expect(iniciado.exito).toBe(true);
    if (!iniciado.exito) throw new Error("No inicio el servidor");
    try { expect(iniciado.valor.direccion).toBe(`http://127.0.0.1:${puerto}`); }
    finally { iniciado.valor.detener(); }
    const liberado = Bun.listen({ hostname: "127.0.0.1", port: puerto, socket: { data() {} } });
    liberado.stop(true);
    const falla = Object.assign(new Error("Falla de infraestructura"), { code: "EACCES" });
    const servir = spyOn(Bun, "serve").mockImplementation(() => { throw falla; });
    try { expect(() => iniciarServidor(puerto, () => ({ exito: true, valor: respuesta }))).toThrow(falla); }
    finally { servir.mockRestore(); }
  });
});

describe("O-4", () => {
  test("verifica cualquier ruta antes de consultar y nunca emite cabeceras CORS", async () => {
    const puerto = 12345;
    let llamadas = 0;
    const manejar = crearManejador(puerto, () => { llamadas++; return { exito: true, valor: respuesta }; });
    const casos = [
      ["/", "GET", { Host: `127.0.0.1:${puerto}` }, 200],
      ["/otra", "GET", { Host: `localhost:${puerto}` }, 404],
      ...["/", "/otra"].flatMap((ruta) => [
        [ruta, "GET", { Host: `ajeno.example:${puerto}` }, 403],
        [ruta, "GET", { Host: `127.0.0.1:${puerto}`, "Sec-Fetch-Site": "cross-site" }, 403],
        [ruta, "POST", { Host: `127.0.0.1:${puerto}` }, 405],
      ] as const),
    ] as const;
    const respuestas: Response[] = [];
    for (const [ruta, method, headers, estado] of casos) {
      const recibida = manejar(new Request(`http://127.0.0.1${ruta}`, { method, headers }));
      expect(recibida.status).toBe(estado);
      respuestas.push(recibida);
    }
    expect(llamadas).toBe(1);
    const solicitud = () => new Request("http://127.0.0.1/", { headers: { Host: `127.0.0.1:${puerto}` } });
    const uso = crearManejador(puerto, () => ({ exito: false, error: errorAlmacenSinEsquema }))(solicitud());
    const falla = crearManejador(puerto, () => { throw new Error("Detalle privado"); })(solicitud());
    expect(uso.status).toBe(503);
    expect(falla.status).toBe(500);
    expect(await falla.clone().text()).not.toContain("Detalle privado");
    for (const recibida of [...respuestas, uso, falla]) {
      expect([...recibida.headers.keys()].filter((nombre) => nombre.startsWith("access-control-"))).toEqual([]);
    }
  });
});
