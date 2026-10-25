import { describe, expect, test } from "bun:test";
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { RespuestaPermiso } from "../../paquetes/rige/aplicacion/respuestas/permiso";
import { prepararConsultas } from "../utilidades/consultas-cli";
import { lanzar, lanzarServidor } from "../utilidades/subproceso";
import { solicitarLocal, type SolicitudLocal } from "../utilidades/cliente-http-local";

function incrustada(cuerpo: string): unknown {
  const dato = /<script type="application\/json" id="respuesta">([^]*?)<\/script>/.exec(cuerpo);
  expect(dato).not.toBeNull();
  return JSON.parse(dato![1]!);
}
const escapar = (texto: string) => texto.replaceAll("&", "&amp;").replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");

async function conWeb(nombre: string, probar: (datos: {
  escenario: ReturnType<typeof prepararConsultas>;
  solicitar: (ruta: string, opciones?: Omit<SolicitudLocal, "host" | "puerto" | "ruta">) => ReturnType<typeof solicitarLocal>;
  id: string;
}) => Promise<void>, preparar?: (proyecto: string) => void, opciones: Parameters<typeof prepararConsultas>[1] = {}) {
  const escenario = prepararConsultas(nombre, opciones);
  let servidor: Awaited<ReturnType<typeof lanzarServidor>> | undefined;
  try {
    preparar?.(escenario.proyecto);
    expect(lanzar(escenario.raiz, ["esquema"], escenario.variables).codigo).toBe(0);
    servidor = await lanzarServidor(escenario.raiz, escenario.variables);
    const solicitar = (ruta: string, opciones = {}) => solicitarLocal({ host: "127.0.0.1", puerto: servidor!.puerto, ruta, ...opciones });
    const guardada = await solicitar(`/resolver?proyecto=${encodeURIComponent(escenario.proyecto)}&agente=build`);
    expect(guardada.estado).toBe(303);
    const id = /\/resoluciones\/(\d+)/.exec(String(guardada.cabeceras.location))![1]!;
    await probar({ escenario, solicitar, id });
  } finally { await servidor?.detener(); escenario.borrar(); }
}

const consultas = [
  ["v2-decision", { agente: "build", sujeto: "read", objetivo: ".env" }],
  ["v2-subagente", { agente: "vacio", sujeto: "task", objetivo: "general", lanzadoPor: "build" }],
  ["v2-bash", { agente: "build", herramienta: "bash", objetivo: "ls && rm x" }],
  ["v2-ruta-bloqueo", { agente: "build", herramienta: "read", objetivo: "src/productos.js" }],
] as const;

describe("RF-02 CA-6 / RF-03 CA-4", () => {
  test("X-3 permiso y agentes guardados conservan el contexto despues de borrar .git", async () => {
    await conWeb("v2-worktree-valido", async ({ escenario, solicitar, id }) => {
      const ruta = `/permiso?id=${id}&agente=build&herramienta=read&objetivo=src/a.js`;
      const antes = await solicitar(ruta);
      expect(antes.estado).toBe(200);
      expect(incrustada(antes.cuerpo)).toMatchObject({ decision: "deny" });
      const agentes = incrustada((await solicitar(`/agentes?id=${id}`)).cuerpo);
      // Solo se elimina el repositorio de la copia temporal del escenario.
      rmSync(join(escenario.proyecto, ".git"), { recursive: true });
      const despues = await solicitar(ruta);
      expect(despues.estado).toBe(200);
      expect(incrustada(despues.cuerpo)).toEqual(incrustada(antes.cuerpo));
      expect(incrustada((await solicitar(`/agentes?id=${id}`)).cuerpo)).toEqual(agentes);
    }, undefined, { git: "proyecto" });
  });
  test.each(consultas)("paridad completa de permiso en %s", async (nombre, consulta) => {
    await conWeb(nombre, async ({ escenario, solicitar, id }) => {
      const opciones = Object.entries(consulta).flatMap(([clave, valor]) => [`--${clave === "lanzadoPor" ? "lanzado-por" : clave}`, valor]);
      const cli = escenario.consultar("permiso", [...opciones, "--explicar"]);
      expect(cli.codigo).toBe(0);
      const pagina = await solicitar(`/permiso?${new URLSearchParams({ id, ...consulta })}`);
      expect(pagina.estado).toBe(200);
      expect(incrustada(pagina.cuerpo)).toEqual(JSON.parse(cli.salida));
      const respuesta = JSON.parse(cli.salida) as RespuestaPermiso;
      if (respuesta.determinante !== null) expect(pagina.cuerpo).toContain('<strong>Determinante</strong>');
      if (respuesta.nativaAnulada) expect(pagina.cuerpo).toContain("protección nativa");
      // La consulta debe seguir usando el documento guardado, sin releer la configuracion.
      writeFileSync(join(escenario.proyecto, "opencode.jsonc"), '{"permission":"deny"}');
      expect(incrustada((await solicitar(`/permiso?${new URLSearchParams({ id, ...consulta })}`)).cuerpo)).toEqual(respuesta);
    });
  });
});

describe("RF-02 CA-7", () => {
  test("X-4 tabla y advertencia RF-09 presentan posiciones desde uno", async () => {
    await conWeb("v2-decision", async ({ solicitar, id }) => {
      const pagina = await solicitar(`/permiso?id=${id}&agente=plan&sujeto=edit&objetivo=src/a.js`);
      expect(pagina.estado).toBe(200);
      const respuesta = incrustada(pagina.cuerpo) as RespuestaPermiso;
      for (const regla of respuesta.cadena) expect(pagina.cuerpo).toContain(`<tr><td>${regla.indice + 1}</td>`);
      expect(respuesta.nativaAnulada).not.toBeNull();
      expect(pagina.cuerpo).toContain(`(regla ${respuesta.nativaAnulada!.regla + 1}, por ${respuesta.nativaAnulada!.por + 1})`);
    }, proyecto => writeFileSync(join(proyecto, "opencode.jsonc"), '{"permission":{"edit":"allow"}}'));
  });
  test("presenta cada oracion de la explicacion y acceso desde la resolucion", async () => {
    await conWeb("v2-decision", async ({ escenario, solicitar, id }) => {
      const cli = escenario.consultar("permiso", ["--agente", "build", "--sujeto", "read", "--objetivo", ".env", "--explicar"]);
      expect(cli.codigo).toBe(0);
      const pagina = await solicitar(`/permiso?id=${id}&agente=build&sujeto=read&objetivo=.env`);
      expect(pagina.estado).toBe(200);
      const respuesta = JSON.parse(cli.salida) as RespuestaPermiso;
      expect(respuesta.explicacion!.length).toBeGreaterThan(0);
      for (const oracion of respuesta.explicacion!) expect(pagina.cuerpo).toContain(`<p>${escapar(oracion)}</p>`);
      const resolucion = await solicitar(`/resoluciones/${id}?agente=build`);
      expect(resolucion.cuerpo).toContain('action="/permiso"');
      expect(resolucion.cuerpo).toContain(`href="/agentes?id=${id}"`);
    }, proyecto => writeFileSync(join(proyecto, "opencode.json"), '{"agent":{"build":{"temperature":0.2}}}'));
  });
});

describe("RF-16 CA-3", () => {
  test("listado completo identico a CLI, con origen, modo y oculto", async () => {
    await conWeb("v2-agentes", async ({ escenario, solicitar, id }) => {
      const cli = escenario.consultar("agentes");
      expect(cli.codigo).toBe(0);
      const pagina = await solicitar(`/agentes?id=${id}`);
      expect(pagina.estado).toBe(200);
      expect(incrustada(pagina.cuerpo)).toEqual(JSON.parse(cli.salida));
      expect(pagina.cuerpo).toContain("<th>Origen</th><th>Modo</th><th>Oculto</th>");
      writeFileSync(join(escenario.proyecto, "opencode.jsonc"), '{"agent":{"nuevo":{}}}');
      expect(incrustada((await solicitar(`/agentes?id=${id}`)).cuerpo)).toEqual(JSON.parse(cli.salida));
    });
  });
});

describe("W-1 RNF-09", () => {
  test("protege ambas rutas antes de consultar, sin CORS y solo GET", async () => {
    await conWeb("v2-decision", async ({ solicitar, id }) => {
      for (const ruta of [`/permiso?id=${id}&agente=build&sujeto=read&objetivo=.env`, `/agentes?id=${id}`]) {
        expect((await solicitar(ruta)).estado).toBe(200);
        for (const opciones of [{ cabeceras: { Host: "ajeno.example" } },
          ...["cross-site", "same-site"].map(sitio => ({ cabeceras: { "Sec-Fetch-Site": sitio } }))]) {
          const rechazo = await solicitar(ruta, opciones);
          expect(rechazo.estado).toBe(403);
          expect(Object.keys(rechazo.cabeceras).filter(c => c.startsWith("access-control-"))).toEqual([]);
        }
        for (const metodo of ["POST", "PUT", "DELETE", "HEAD", "OPTIONS"]) expect((await solicitar(ruta, { metodo })).estado).toBe(405);
      }
      for (const ruta of ["/permiso?id=abc", "/agentes?id=0"]) expect((await solicitar(ruta)).estado).toBe(400);
      expect((await solicitar("/agentes?id=999")).estado).toBe(404);
    });
  });
});

describe("W-2", () => {
  test("escapa patrones HTML y evita cerrar el script de datos", async () => {
    const patron = '</script><script>alert("x")</script>';
    await conWeb("v2-decision", async ({ solicitar, id }) => {
      const pagina = await solicitar(`/permiso?${new URLSearchParams({ id, agente: "build", sujeto: "read", objetivo: patron })}`);
      expect(pagina.estado).toBe(200);
      expect(pagina.cuerpo).toContain(escapar(patron));
      expect(pagina.cuerpo).not.toContain(patron);
      expect(pagina.cuerpo.match(/<script/g)).toHaveLength(1);
      expect((incrustada(pagina.cuerpo) as RespuestaPermiso).cadena.some(r => r.patron === patron)).toBe(true);
    }, proyecto => writeFileSync(join(proyecto, "opencode.jsonc"), JSON.stringify({ permission: { read: { [patron]: "allow" } } })));
  });
});
