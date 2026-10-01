import { describe, expect, test } from "bun:test";
import { conVerificacionDeOrigen } from "./origen";

const puerto = 12345;
const host = `127.0.0.1:${puerto}`;

function doble() {
  let llamadas = 0;
  const respuesta = new Response("estado privado");
  const manejar = conVerificacionDeOrigen(puerto, () => { llamadas++; return respuesta; });
  return { manejar, respuesta, llamadas: () => llamadas };
}

async function rechazo(respuesta: Response, estado: number) {
  expect(respuesta.status).toBe(estado);
  expect(respuesta.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
  const texto = await respuesta.text();
  expect(texto).toContain("Solicitud rechazada.");
  expect(texto).not.toContain("estado privado");
  return texto;
}

describe("O-1", () => {
  test("admite solo los nombres locales con el puerto propio y rechaza Host ausente", async () => {
    const interno = doble();
    for (const Host of [host, `localhost:${puerto}`, `LocalHost:${puerto}`]) {
      expect(interno.manejar(new Request("http://127.0.0.1/", { headers: { Host } }))).toBe(interno.respuesta);
    }
    expect(interno.llamadas()).toBe(3);
    let pagina: string | undefined;
    for (const Host of [`127.0.0.1:${puerto + 1}`, `ajeno.example:${puerto}`, "127.0.0.1",
      `localhost.:${puerto}`, `[::1]:${puerto}`, undefined]) {
      const solicitud = new Request("http://127.0.0.1/", { headers: Host === undefined ? {} : { Host } });
      if (Host === undefined) expect(solicitud.headers.get("host")).toBeNull();
      const texto = await rechazo(interno.manejar(solicitud), 403);
      pagina ??= texto;
      expect(texto).toBe(pagina);
    }
    expect(interno.llamadas()).toBe(3);
  });
});

describe("O-2", () => {
  test("rechaza sitios ajenos y desconocidos en cualquier ruta, y admite la lista local", async () => {
    const interno = doble();
    for (const ruta of ["/", "/otra"]) {
      for (const sitio of ["cross-site", "same-site", "desconocido"]) {
        await rechazo(interno.manejar(new Request(`http://127.0.0.1${ruta}`, {
          headers: { Host: host, "Sec-Fetch-Site": sitio },
        })), 403);
      }
    }
    expect(interno.llamadas()).toBe(0);
    for (const sitio of [undefined, "same-origin", "none"]) {
      expect(interno.manejar(new Request("http://127.0.0.1/", {
        headers: sitio === undefined ? { Host: host } : { Host: host, "Sec-Fetch-Site": sitio },
      }))).toBe(interno.respuesta);
    }
    expect(interno.llamadas()).toBe(3);
  });
});

describe("O-3", () => {
  test("solo GET llega al manejador; Host y sitio se verifican antes del metodo", async () => {
    const interno = doble();
    const pagina = await rechazo(interno.manejar(new Request("http://127.0.0.1/", {
      method: "POST", headers: { Host: "ajeno.example", "Sec-Fetch-Site": "cross-site" },
    })), 403);
    for (const method of ["HEAD", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]) {
      const respuesta = interno.manejar(new Request("http://127.0.0.1/", { method, headers: { Host: host } }));
      expect(await rechazo(respuesta, 405)).toBe(pagina);
      expect(respuesta.headers.get("Allow")).toBe("GET");
    }
    await rechazo(interno.manejar(new Request("http://127.0.0.1/", {
      method: "POST", headers: { Host: host, "Sec-Fetch-Site": "cross-site" },
    })), 403);
    expect(interno.llamadas()).toBe(0);
    expect(interno.manejar(new Request("http://127.0.0.1/", { headers: { Host: host } }))).toBe(interno.respuesta);
    expect(interno.llamadas()).toBe(1);
  });
});
