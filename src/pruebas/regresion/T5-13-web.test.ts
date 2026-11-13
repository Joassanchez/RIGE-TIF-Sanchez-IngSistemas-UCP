import { describe, expect, test } from "bun:test";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { prepararConsultas } from "../utilidades/consultas-cli";
import { lanzarServidor } from "../utilidades/subproceso";
import { solicitarLocal, type SolicitudLocal } from "../utilidades/cliente-http-local";
import type { RespuestaReglas } from "../../paquetes/rige/aplicacion/respuestas/contrato-generado";
import { entornoDeReferencia, type ReferenciaEntorno } from "../utilidades/entorno-referencia";

function datos(cuerpo: string): RespuestaReglas {
  const bloques = [...cuerpo.matchAll(/<script type="application\/json" id="respuesta">([^]*?)<\/script>/g)];
  expect(bloques).toHaveLength(1);
  return JSON.parse(bloques[0]![1]!);
}
const escapar = (t: string) => t.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");

async function conWeb(nombre: string, probar: (e: ReturnType<typeof prepararConsultas>,
  pedir: (ruta: string, opciones?: Omit<SolicitudLocal, "host" | "puerto" | "ruta">) => ReturnType<typeof solicitarLocal>, id: string) => Promise<void>, contenido?: object,
  variables: Record<string, string> = {}) {
  const e = prepararConsultas(nombre);
  const ref = JSON.parse(readFileSync(new URL(`../escenarios/${nombre}/REFERENCIA.json`, import.meta.url), "utf8")) as ReferenciaEntorno;
  Object.assign(e.variables, entornoDeReferencia(ref, e));
  Object.assign(e.variables, variables);
  if (contenido) e.variables.OPENCODE_CONFIG_CONTENT = JSON.stringify(contenido);
  let servidor: Awaited<ReturnType<typeof lanzarServidor>> | undefined;
  try {
    servidor = await lanzarServidor(e.raiz, e.variables);
    const pedir = (ruta: string, opciones = {}) => solicitarLocal({ host: "127.0.0.1", puerto: servidor!.puerto, ruta, ...opciones });
    const alta = await pedir(`/resolver?${new URLSearchParams({ proyecto: e.proyecto, agente: "build" })}`);
    expect(alta.estado).toBe(303);
    const id = /\/resoluciones\/(\d+)/.exec(String(alta.cabeceras.location))![1]!;
    await probar(e, pedir, id);
  } finally { await servidor?.detener(); e.borrar(); }
}

describe("T5-13 R-4", () => {
  test("sustitucion protegida excluida: sin contenido en cadena, diagnostico, depuracion o SQLite", async () => {
    const marca = "MARCA-T513-PROTEGIDA-67D1";
    await conWeb("v2-decision", async (e, pedir, id) => {
      for (const agente of ["build", "sustituido"]) {
        const cli = e.consultar("reglas", ["--agente", agente, "--depurar", "--tiempos"]);
        expect(cli.codigo).toBe(agente === "build" ? 0 : 1);
        expect(cli.salida + cli.error).not.toContain(marca);
        const web = await pedir(`/reglas?${new URLSearchParams({ id, agente })}`);
        expect(web.estado).toBe(agente === "build" ? 200 : 422);
        expect(web.cuerpo).not.toContain(marca);
        if (agente === "build") {
          const r = datos(web.cuerpo);
          expect(r.cadena.some(r => r.sujeto === marca)).toBe(false);
          expect(r.matriz.filas.find(f => f.agente === "sustituido")!.error?.codigo).toBe("cadena-incompleta");
        }
      }
      for (const ruta of new Bun.Glob("**/*").scanSync({ cwd: e.variables.RIGE_ALMACEN!, onlyFiles: true }))
        expect(readFileSync(join(e.variables.RIGE_ALMACEN!, ruta)).includes(Buffer.from(marca))).toBe(false);
    }, { agent: { sustituido: { permission: { "{env:RIGE_PRUEBA_SUJETO}": "deny" } } } }, { RIGE_PRUEBA_SUJETO: marca });
  });
  for (const [escenario, agente, lanzadoPor] of [["v2-decision", "build", undefined], ["v2-subagente", "vacio", "build"]] as const) {
    test(`paridad completa CLI/web, tablas, foto inmutable y contexto: ${escenario}`, async () => {
      await conWeb(escenario, async (e, pedir, id) => {
        const opciones = ["--agente", agente, ...(lanzadoPor ? ["--lanzado-por", lanzadoPor] : [])];
        const cli = e.consultar("reglas", opciones);
        expect(cli.codigo).toBe(0);
        const consulta = new URLSearchParams({ id, agente, ...(lanzadoPor ? { lanzadoPor } : {}) });
        const ruta = `/reglas?${consulta}`;
        const pagina = await pedir(ruta);
        expect(pagina.estado).toBe(200);
        expect(datos(pagina.cuerpo)).toEqual(JSON.parse(cli.salida));
        for (const texto of ["Cadena completa", "Matriz de permisos", "Efecto general por sujeto de permiso; las reglas por patrón pueden cambiarlo para objetivos concretos",
          '>parcial</span>', 'id="limites-matriz"', 'aria-current="page">Todas las reglas', "Foto guardada", "bun run rige -- reglas"]) expect(pagina.cuerpo).toContain(texto);
        expect(pagina.cuerpo.match(/class="tabla-contenedor"/g)).toHaveLength(2);
        const r = datos(pagina.cuerpo);
        if (escenario === "v2-decision") expect(r.cadena.some(r => r.origen.tipo === "declarado")).toBe(true);
        else expect(r.cadena.some(r => r.origen.tipo === "nativo" && r.origen.regla === "denegacion-subagente")).toBe(true);
        for (const fila of r.matriz.filas) {
          const enlace = `/reglas?${new URLSearchParams({ id, agente: fila.agente, ...(lanzadoPor ? { lanzadoPor } : {}) })}#cadena-completa`;
          expect(pagina.cuerpo).toContain(`href="${escapar(enlace)}"`);
          for (const celda of fila.celdas) {
            const formulario = `/resoluciones/${id}/permisos?${new URLSearchParams({ id, agente: fila.agente, ...(lanzadoPor ? { lanzadoPor } : {}) })}&sujeto=${encodeURIComponent(celda.sujeto)}`;
            expect(pagina.cuerpo).toContain(`href="${escapar(formulario)}"`);
          }
        }
        const permisos = await pedir(`/resoluciones/${id}/permisos?agente=${agente}`);
        expect(permisos.cuerpo).toContain(`/reglas?id=${id}&amp;agente=${agente}`);
        expect(permisos.cuerpo).toContain('id="consultar-permiso"');
        expect(permisos.cuerpo).toContain('id="consultas-rapidas"');
        const archivo = join(e.variables.RIGE_ALMACEN!, "rige.db");
        const antes = readFileSync(archivo);
        writeFileSync(join(e.proyecto, "opencode.json"), '{"permission":"deny"}');
        rmSync(join(e.raiz, ".git"), { recursive: true });
        expect(datos((await pedir(ruta)).cuerpo)).toEqual(r);
        expect(readFileSync(archivo)).toEqual(antes);
      });
    });
  }
  test("ruta protegida: origen y metodo antes de consultar, sin CORS ni datos privados", async () => {
    await conWeb("v2-decision", async (e, pedir, id) => {
      const ruta = `/reglas?id=${id}&agente=build`;
      const rechazos = [
        { cabeceras: { Host: "ajeno.example" } }, { cabeceras: { Host: "" } },
        ...["cross-site", "same-site", "desconocido"].map(s => ({ cabeceras: { "Sec-Fetch-Site": s } })),
      ];
      for (const opciones of rechazos) {
        const r = await pedir(ruta, opciones);
        expect(r.estado).toBe(403);
        expect(r.cuerpo).not.toContain(e.proyecto);
        expect(r.cuerpo).not.toContain("rige.db");
        expect(r.cabeceras["access-control-allow-origin"]).toBeUndefined();
      }
      for (const metodo of ["POST", "PUT", "DELETE", "HEAD", "OPTIONS"]) {
        const r = await pedir(ruta, { metodo });
        expect(r.estado).toBe(405);
        expect(r.cabeceras.allow).toBe("GET");
        expect(r.cabeceras["access-control-allow-origin"]).toBeUndefined();
      }
      const valida = await pedir(ruta);
      expect(valida.cabeceras["access-control-allow-origin"]).toBeUndefined();
    });
  });
  test("escapa datos hostiles y enlaces; JSON unico sin scripts ejecutables ni recursos externos", async () => {
    const agente = 'a & "#</script>', lanzadoPor = 'l & "#</script>', sujeto = 's & "#</script>', patron = 'p & "#</script>';
    await conWeb("v2-decision", async (e, pedir, id) => {
      const cli = e.consultar("reglas", ["--agente", agente, "--lanzado-por", lanzadoPor]);
      expect(cli.codigo).toBe(0);
      const r = await pedir(`/reglas?${new URLSearchParams({ id, agente, lanzadoPor })}`);
      expect(r.estado).toBe(200);
      expect(datos(r.cuerpo)).toEqual(JSON.parse(cli.salida));
      for (const texto of [agente, lanzadoPor, sujeto, patron]) {
        expect(r.cuerpo).toContain(escapar(texto));
        expect(r.cuerpo).not.toContain(texto);
      }
      expect(r.cuerpo).toContain("\\u003c/script>");
      expect(r.cuerpo.match(/<script\b/g)).toHaveLength(1);
      expect(r.cuerpo).not.toMatch(/style=|\son\w+=|(?:src|href)="https?:/i);
      const enlaces = [...r.cuerpo.matchAll(/href="([^\"]+)"/g)].map(m => m[1]!.replaceAll("&amp;", "&"));
      const cadenas = enlaces.filter(e => e.startsWith("/reglas?"));
      expect(cadenas.length).toBeGreaterThan(0);
      for (const enlace of cadenas) expect(new URL(enlace, "http://127.0.0.1").searchParams.get("lanzadoPor")).toBe(lanzadoPor);
    }, { agent: { [agente]: { permission: { [sujeto]: { "*": "ask", [patron]: "deny" } } }, [lanzadoPor]: {} } });
  });
});
