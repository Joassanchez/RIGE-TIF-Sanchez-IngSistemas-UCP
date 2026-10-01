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
    let llamadas = 0;
    const manejar = crearManejador(() => { llamadas++; return { exito: true, valor: respuesta }; });
    for (let indice = 0; indice < 2; indice++) {
      const inicio = manejar(new Request("http://127.0.0.1/"));
      expect(inicio.status).toBe(200);
      expect(await inicio.text()).toBe(await paginaInicio(respuesta).text());
    }
    expect(llamadas).toBe(2);
    const otra = manejar(new Request("http://127.0.0.1/otra"));
    expect(otra.status).toBe(404);
    expect(otra.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
    expect(await otra.text()).toContain("Página no encontrada.");
    expect(llamadas).toBe(2);
    const uso = crearManejador(() => ({ exito: false, error: errorAlmacenSinEsquema }));
    expect(uso(new Request("http://127.0.0.1/")).status).toBe(503);
    const falla = crearManejador(() => { throw new Error("Detalle privado"); });
    expect(falla(new Request("http://127.0.0.1/")).status).toBe(500);
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
