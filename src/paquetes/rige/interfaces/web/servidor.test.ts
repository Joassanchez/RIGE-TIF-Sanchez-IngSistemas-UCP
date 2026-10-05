import { describe, expect, spyOn, test } from "bun:test";
import { errorAlmacenSinEsquema } from "../../aplicacion/errores";
import type { ConsultarEstado } from "../../aplicacion/casos-uso/consultar-estado";
import { versionRige, type RespuestaEstado } from "../../aplicacion/respuestas/estado";
import { paginaInicio } from "./paginas/inicio";
import { crearManejador, iniciarServidor, type CasosWeb } from "./servidor";

const respuesta: RespuestaEstado = {
  esquema: 1, versionRige, almacen: { ruta: "/temporal/rige.db", versionEsquema: 1 },
};

function casosEstado(consultarEstado: ConsultarEstado): CasosWeb {
  return { consultarEstado, resolverProyecto: () => { throw new Error("No resolver en pruebas de estado"); },
    consultarResolucion: () => { throw new Error("No consultar resoluciones en pruebas de estado"); } };
}
const manejarEstado = (puerto: number, consultar: ConsultarEstado) => crearManejador(puerto, casosEstado(consultar));
const iniciarEstado = (puerto: number, consultar: ConsultarEstado) => iniciarServidor(puerto, casosEstado(consultar));

describe("W-11", () => {
  test("valida agente antes de resolver, propaga errores escapados y codifica la Location", async () => {
    const solicitudes: string[][] = [];
    const casos = {
      consultarEstado: () => ({ exito: true as const, valor: respuesta }),
      resolverProyecto: (proyecto: string, agente: string, clave: string) => {
        solicitudes.push([proyecto, agente, clave]);
        return proyecto === "malo" ? { exito: false as const,
          error: { codigo: "contenido-no-soportado" as const, mensaje: 'Contenido <script> "privado"' } }
          : { exito: true as const, valor: { id: 7 } };
      },
      consultarResolucion: () => { throw new Error("No consultar durante la redireccion"); },
    };
    const manejar = crearManejador(12345, casos);
    const solicitar = (ruta: string) => manejar(new Request(`http://127.0.0.1${ruta}`, {
      headers: { Host: "127.0.0.1:12345" },
    }));
    for (const agente of ["", "&agente=", "&agente=%20%09"]) {
      expect(solicitar(`/resolver?proyecto=/proyecto${agente}`).status).toBe(400);
    }
    expect(solicitudes).toEqual([]);
    const fallo = solicitar("/resolver?proyecto=malo&agente=build");
    expect(fallo.status).toBe(422);
    expect(await fallo.text()).toContain("Contenido &lt;script&gt; &quot;privado&quot;");
    for (const clave of ["", "c & d"]) {
      const redireccion = solicitar(`/resolver?proyecto=%2Fproyecto&agente=a%20%26%20b&clave=${encodeURIComponent(clave)}`);
      expect(redireccion.status).toBe(303);
      expect(redireccion.headers.get("location")).toBe(`/resoluciones/7?agente=a%20%26%20b${clave ? "&clave=c%20%26%20d" : ""}`);
    }
    expect(solicitudes).toEqual([["malo", "build", ""], ["/proyecto", "a & b", ""], ["/proyecto", "a & b", "c & d"]]);
  });
});

describe("W-12", () => {
  test("acepta solo rutas con id decimal y presenta el error del almacen", async () => {
    const consultas: string[][] = [];
    const manejar = crearManejador(12345, { ...casosEstado(() => ({ exito: true, valor: respuesta })),
      consultarResolucion: (id, agente, clave) => {
        consultas.push([id, agente, clave]);
        return { exito: false, error: { codigo: "resolucion-inexistente", mensaje: "No existe la resolucion 7 en el almacen." } };
      },
    });
    const solicitar = (ruta: string) => manejar(new Request(`http://127.0.0.1${ruta}`, {
      headers: { Host: "127.0.0.1:12345" },
    }));
    for (const ruta of ["/resoluciones/abc", "/resoluciones/7/otra", "/resoluciones/-1", "/resoluciones/7a", "/otra"]) {
      const recibida = solicitar(ruta);
      expect(recibida.status).toBe(404);
      expect(await recibida.text()).toContain("Página no encontrada");
    }
    expect(consultas).toEqual([]);
    const inexistente = solicitar("/resoluciones/7?agente=a%20%26%20b&clave=c%20%26%20d");
    expect(inexistente.status).toBe(404);
    expect(await inexistente.text()).toContain("No existe la resolucion 7 en el almacen.");
    solicitar("/resoluciones/7");
    expect(consultas).toEqual([["7", "a & b", "c & d"], ["7", "", ""]]);
  });
});

describe("W-4", () => {
  test("consulta en cada inicio, presenta errores y omite la consulta en otras rutas", async () => {
    const puerto = 12345;
    const solicitar = (ruta = "/") => new Request(`http://127.0.0.1${ruta}`, { headers: { Host: `127.0.0.1:${puerto}` } });
    let llamadas = 0;
    const manejar = manejarEstado(puerto, () => { llamadas++; return { exito: true, valor: respuesta }; });
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
    const uso = manejarEstado(puerto, () => ({ exito: false, error: errorAlmacenSinEsquema }));
    expect(uso(solicitar()).status).toBe(503);
    const falla = manejarEstado(puerto, () => { throw new Error("Detalle privado"); });
    expect(falla(solicitar()).status).toBe(500);
  });
});

describe("W-5", () => {
  test("traduce solo EADDRINUSE y detener libera el puerto local", () => {
    const escucha = Bun.listen({ hostname: "127.0.0.1", port: 0, socket: { data() {} } });
    const puerto = escucha.port;
    try {
      const ocupado = iniciarEstado(puerto, () => ({ exito: true, valor: respuesta }));
      if (ocupado.exito) ocupado.valor.detener();
      expect(ocupado).toEqual({
        exito: false, error: { codigo: "puerto-ocupado", mensaje: expect.stringContaining("RIGE_PUERTO") },
      });
      if (!ocupado.exito) {
        expect(ocupado.error.mensaje).toContain(String(puerto));
        expect(ocupado.error.mensaje).not.toMatch(/[áéíóúñ]/i);
      }
    } finally { escucha.stop(true); }
    const iniciado = iniciarEstado(puerto, () => ({ exito: true, valor: respuesta }));
    expect(iniciado.exito).toBe(true);
    if (!iniciado.exito) throw new Error("No inicio el servidor");
    try { expect(iniciado.valor.direccion).toBe(`http://127.0.0.1:${puerto}`); }
    finally { iniciado.valor.detener(); }
    const liberado = Bun.listen({ hostname: "127.0.0.1", port: puerto, socket: { data() {} } });
    liberado.stop(true);
    const falla = Object.assign(new Error("Falla de infraestructura"), { code: "EACCES" });
    const servir = spyOn(Bun, "serve").mockImplementation(() => { throw falla; });
    try { expect(() => iniciarEstado(puerto, () => ({ exito: true, valor: respuesta }))).toThrow(falla); }
    finally { servir.mockRestore(); }
  });
});

describe("O-4", () => {
  test("verifica cualquier ruta antes de consultar y nunca emite cabeceras CORS", async () => {
    const puerto = 12345;
    let llamadas = 0;
    const manejar = manejarEstado(puerto, () => { llamadas++; return { exito: true, valor: respuesta }; });
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
    const uso = manejarEstado(puerto, () => ({ exito: false, error: errorAlmacenSinEsquema }))(solicitud());
    const falla = manejarEstado(puerto, () => { throw new Error("Detalle privado"); })(solicitud());
    expect(uso.status).toBe(503);
    expect(falla.status).toBe(500);
    expect(await falla.clone().text()).not.toContain("Detalle privado");
    for (const recibida of [...respuestas, uso, falla]) {
      expect([...recibida.headers.keys()].filter((nombre) => nombre.startsWith("access-control-"))).toEqual([]);
    }
  });
});
