import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { crearEntornoAislado } from "../utilidades/entorno-aislado";
import { solicitarLocal, type SolicitudLocal } from "../utilidades/cliente-http-local";

const raiz = resolve(import.meta.dir, "../..");
const temporales: string[] = [];
afterEach(() => {
  for (const temporal of temporales.splice(0)) rmSync(temporal, { recursive: true, force: true });
});

function puertoLibre(): number {
  const escucha = Bun.listen({ hostname: "127.0.0.1", port: 0, socket: { data() {} } });
  const puerto = escucha.port;
  escucha.stop(true);
  return puerto;
}

async function primeraLinea(salida: ReadableStream<Uint8Array>): Promise<string> {
  const lector = salida.getReader();
  const decodificador = new TextDecoder();
  const limite = setTimeout(() => { void lector.cancel(); }, 2000);
  try {
    let texto = "";
    while (true) {
      const fragmento = await lector.read();
      if (fragmento.done) throw new Error("El subproceso termino sin publicar direccion.");
      texto += decodificador.decode(fragmento.value, { stream: true });
      const fin = texto.indexOf("\n");
      if (fin !== -1) return texto.slice(0, fin);
    }
  } finally { clearTimeout(limite); lector.releaseLock(); }
}

async function conServidor(comprobar: (puerto: number, almacen: string) => Promise<void>, carpeta = "almacen") {
  const temporal = mkdtempSync(join(tmpdir(), "rige-rnf09-"));
  temporales.push(temporal);
  const almacen = join(temporal, carpeta);
  const puerto = puertoLibre();
  const env = { ...crearEntornoAislado(temporal, process.env), RIGE_ALMACEN: almacen, RIGE_PUERTO: String(puerto) };
  const preparada = Bun.spawnSync([process.execPath, "paquetes/rige/arranque/rige.ts", "esquema"], {
    cwd: raiz, env, stdout: "pipe", stderr: "pipe",
  });
  expect(preparada.exitCode).toBe(0);
  expect(preparada.stderr.toString()).toBe("");
  const proceso = Bun.spawn([process.execPath, "paquetes/rige/arranque/rige.ts", "servir"], {
    cwd: raiz, env, stdout: "pipe", stderr: "pipe",
  });
  const error = new Response(proceso.stderr).text();
  const limite = setTimeout(() => { proceso.kill(); }, 3000);
  try {
    expect(await primeraLinea(proceso.stdout)).toBe(JSON.stringify({ esquema: 1, direccion: `http://127.0.0.1:${puerto}` }));
    expect(proceso.exitCode).toBeNull();
    await comprobar(puerto, almacen.replaceAll("\\", "/"));
  } finally { clearTimeout(limite); proceso.kill(); await proceso.exited; }
  expect(await error).toBe("");
}

function solicitar(puerto: number, opciones: Omit<SolicitudLocal, "host" | "puerto">) {
  return solicitarLocal({ host: "127.0.0.1", puerto, ...opciones });
}

describe("RNF-09 CA-1", () => {
  test("rechaza nombres y puertos ajenos sin devolver el estado y admite localhost", async () => {
    await conServidor(async (puerto, almacen) => {
      for (const Host of [`ajeno.example:${puerto}`, `127.0.0.1:${puerto === 65535 ? puerto - 1 : puerto + 1}`]) {
        const respuesta = await solicitar(puerto, { ruta: "/", cabeceras: { Host } });
        expect(respuesta.estado).toBe(403);
        expect(respuesta.cuerpo).toContain("Solicitud rechazada.");
        expect(respuesta.cuerpo).not.toContain("RIGE 0.1.0");
        expect(respuesta.cuerpo).not.toContain(almacen);
      }
      expect((await solicitar(puerto, { ruta: "/", cabeceras: { Host: `localhost:${puerto}` } })).estado).toBe(200);
    });
  });
});

describe("RNF-09 CA-2", () => {
  test("solo GET se atiende, incluidos HEAD y OPTIONS reales", async () => {
    await conServidor(async (puerto) => {
      for (const metodo of ["POST", "PUT", "DELETE", "HEAD", "OPTIONS"]) {
        const respuesta = await solicitar(puerto, { ruta: "/", metodo });
        expect(respuesta.estado).toBe(405);
        expect(respuesta.cabeceras.allow).toBe("GET");
      }
      expect((await solicitar(puerto, { ruta: "/" })).estado).toBe(200);
    });
  });
});

describe("RNF-09 CA-3", () => {
  test("ninguna respuesta de inicio, rechazos o ruta inexistente habilita CORS", async () => {
    await conServidor(async (puerto) => {
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
});

describe("C7-1", () => {
  test("rechaza cross-site y same-site en todas las rutas y admite los sitios locales", async () => {
    await conServidor(async (puerto) => {
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
});

describe("C2-1", () => {
  test("escapa la ruta de un almacen real con ampersand y comilla", async () => {
    await conServidor(async (puerto) => {
      const respuesta = await solicitar(puerto, { ruta: "/" });
      expect(respuesta.estado).toBe(200);
      expect(respuesta.cuerpo).toContain("a&amp;b&#39;c");
      expect(respuesta.cuerpo).not.toContain("a&b'c");
    }, "a&b'c");
  });
});
