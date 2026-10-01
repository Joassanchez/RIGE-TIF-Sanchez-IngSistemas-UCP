import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { lanzar, lanzarServidor } from "../utilidades/subproceso";
import { solicitarLocal, type SolicitudLocal } from "../utilidades/cliente-http-local";
import { versionRige } from "../../paquetes/rige/aplicacion/respuestas/estado";

function prepararServidor(carpeta = "almacen") {
  let temporal: string;
  let servidor: Awaited<ReturnType<typeof lanzarServidor>> | undefined;
  let almacen: string;
  beforeAll(async () => {
    temporal = mkdtempSync(join(tmpdir(), "rige-rnf09-"));
    almacen = join(temporal, carpeta).replaceAll("\\", "/");
    try {
      const preparada = lanzar(temporal, ["esquema"], { RIGE_ALMACEN: almacen });
      expect(preparada.codigo).toBe(0);
      expect(preparada.error).toBe("");
      servidor = await lanzarServidor(temporal, { RIGE_ALMACEN: almacen });
    } catch (falla) {
      rmSync(temporal, { recursive: true, force: true });
      throw falla;
    }
  });
  afterAll(async () => {
    try { await servidor?.detener(); }
    finally { rmSync(temporal, { recursive: true, force: true }); }
  });
  return () => {
    if (!servidor) throw new Error("Servidor no preparado.");
    return { puerto: servidor.puerto, almacen };
  };
}

function solicitar(puerto: number, opciones: Omit<SolicitudLocal, "host" | "puerto">) {
  return solicitarLocal({ host: "127.0.0.1", puerto, ...opciones });
}

describe("RNF-09 CA-1", () => {
  const estado = prepararServidor();
  test("rechaza nombres y puertos ajenos sin devolver el estado y admite localhost", async () => {
    const { puerto, almacen } = estado();
    for (const Host of [`ajeno.example:${puerto}`, `127.0.0.1:${puerto === 65535 ? puerto - 1 : puerto + 1}`]) {
      const respuesta = await solicitar(puerto, { ruta: "/", cabeceras: { Host } });
      expect(respuesta.estado).toBe(403);
      expect(respuesta.cuerpo).toContain("Solicitud rechazada.");
      expect(respuesta.cuerpo).not.toContain(`RIGE ${versionRige}`);
      expect(respuesta.cuerpo).not.toContain(almacen);
    }
    expect((await solicitar(puerto, { ruta: "/", cabeceras: { Host: `localhost:${puerto}` } })).estado).toBe(200);
  });
});

describe("RNF-09 CA-2", () => {
  const estado = prepararServidor();
  test("solo GET se atiende, incluidos HEAD y OPTIONS reales", async () => {
    const { puerto } = estado();
    for (const metodo of ["POST", "PUT", "DELETE", "HEAD", "OPTIONS"]) {
      const respuesta = await solicitar(puerto, { ruta: "/", metodo });
      expect(respuesta.estado).toBe(405);
      expect(respuesta.cabeceras.allow).toBe("GET");
    }
    expect((await solicitar(puerto, { ruta: "/" })).estado).toBe(200);
  });
});

describe("RNF-09 CA-3", () => {
  const estado = prepararServidor();
  test("ninguna respuesta de inicio, rechazos o ruta inexistente habilita CORS", async () => {
    const { puerto } = estado();
    const solicitudes: Omit<SolicitudLocal, "host" | "puerto">[] = [
      { ruta: "/" }, { ruta: "/", cabeceras: { Host: `localhost:${puerto}` } },
      { ruta: "/", cabeceras: { Host: `ajeno.example:${puerto}` } },
      { ruta: "/", cabeceras: { Host: `127.0.0.1:${puerto === 65535 ? puerto - 1 : puerto + 1}` } },
      ...["POST", "PUT", "DELETE", "HEAD", "OPTIONS"].map((metodo) => ({ ruta: "/", metodo })),
      { ruta: "/otra" }, { ruta: "/", cabeceras: { "Sec-Fetch-Site": "cross-site" } },
    ];
    for (const solicitud of solicitudes) {
      const respuesta = await solicitar(puerto, solicitud);
      expect(Object.keys(respuesta.cabeceras).filter((nombre) => nombre.toLowerCase().startsWith("access-control-"))).toEqual([]);
    }
  });
});

describe("C7-1", () => {
  const estado = prepararServidor();
  test("rechaza cross-site y same-site en todas las rutas y admite los sitios locales", async () => {
    const { puerto } = estado();
    for (const ruta of ["/", "/otra"]) {
      for (const sitio of ["cross-site", "same-site"]) {
        expect((await solicitar(puerto, { ruta, cabeceras: { "Sec-Fetch-Site": sitio } })).estado).toBe(403);
      }
    }
    for (const sitio of ["same-origin", "none"]) {
      expect((await solicitar(puerto, { ruta: "/", cabeceras: { "Sec-Fetch-Site": sitio } })).estado).toBe(200);
    }
  });
});

describe("C2-1", () => {
  const estado = prepararServidor("a&b'c");
  test("escapa la ruta de un almacen real con ampersand y comilla", async () => {
    const { puerto } = estado();
    const respuesta = await solicitar(puerto, { ruta: "/" });
    expect(respuesta.estado).toBe(200);
    expect(respuesta.cuerpo).toContain("a&amp;b&#39;c");
    expect(respuesta.cuerpo).not.toContain("a&b'c");
  });
});
