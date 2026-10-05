import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { copiarEscenario } from "../utilidades/escenario";
import { lanzar, lanzarServidor } from "../utilidades/subproceso";
import { solicitarLocal, type SolicitudLocal } from "../utilidades/cliente-http-local";

const regla = "OpenCode 1.18.25 aplica las entradas en orden de precedencia; prevalece la declaración de la última entrada que declara la clave (RD-01).";
const paginaPrimera = "/resoluciones/1?agente=build&clave=temperature";

const rutaReadme = "pruebas/escenarios/v1-precedencia/proyecto";
const tieneGit = existsSync(resolve(import.meta.dir, "../../..", ".git"));

function prepararRecorrido(usarReadme = false) {
  let temporal: string;
  let escenario: ReturnType<typeof copiarEscenario> | undefined;
  let servidor: Awaited<ReturnType<typeof lanzarServidor>> | undefined;
  let variables: Record<string, string>;
  beforeAll(async () => {
    temporal = mkdtempSync(join(tmpdir(), "rige-recorrido-v1-"));
    variables = { RIGE_ALMACEN: join(temporal, "almacen"), ProgramData: join(temporal, "administrada-vacia") };
    mkdirSync(variables.ProgramData!);
    const esquema = lanzar(temporal, ["esquema"], variables);
    expect(esquema.codigo).toBe(0);
    expect(esquema.error).toBe("");
    servidor = await lanzarServidor(temporal, variables);
  });
  beforeEach(() => { if (!usarReadme) escenario = copiarEscenario("v1-precedencia"); });
  afterEach(() => { escenario?.borrar(); escenario = undefined; });
  afterAll(async () => {
    try { await servidor?.detener(); }
    finally { rmSync(temporal, { recursive: true, force: true }); }
  });
  return () => {
    if (!servidor || (!usarReadme && !escenario)) throw new Error("Recorrido no preparado.");
    const raiz = usarReadme ? realpathSync.native(resolve(import.meta.dir, "../escenarios/v1-precedencia")) : escenario!.raiz;
    const proyecto = usarReadme ? rutaReadme : escenario!.proyecto;
    const solicitar = (ruta: string, opciones: Omit<SolicitudLocal, "host" | "puerto" | "ruta"> = {}) => {
      if (!servidor) throw new Error("Servidor detenido.");
      return solicitarLocal({ host: "127.0.0.1", puerto: servidor.puerto, ruta, ...opciones });
    };
    return {
      proyecto, raiz, solicitar,
      resolver: (clave = "temperature") => solicitar(
        `/resolver?proyecto=${encodeURIComponent(proyecto)}&agente=build&clave=${encodeURIComponent(clave)}`),
      async reiniciar() {
        if (!servidor) throw new Error("Servidor no preparado.");
        const puerto = servidor.puerto;
        await servidor.detener();
        servidor = undefined;
        servidor = await lanzarServidor(temporal, { ...variables, RIGE_PUERTO: String(puerto) });
      },
    };
  };
}

function ubicacion(respuesta: Awaited<ReturnType<typeof solicitarLocal>>): string {
  const ruta = respuesta.cabeceras.location;
  if (typeof ruta !== "string") throw new Error("Se esperaba una unica cabecera Location.");
  return ruta;
}

function comprobarTemperatura(cuerpo: string, raiz: string, temperatura = 0.3) {
  const ruta = raiz.replaceAll("\\", "/");
  expect(cuerpo).toContain(`<td>temperature</td><td>${temperatura}</td>`);
  expect(cuerpo).toContain(`${temperatura} en ${ruta}/proyecto/opencode.jsonc:6:7 (proyecto)`);
  const primera = cuerpo.indexOf(`0.1 en ${ruta}/opencode.json:5:7 (proyecto)`);
  const segunda = cuerpo.indexOf(`0.2 en ${ruta}/proyecto/opencode.json:5:7 (proyecto)`);
  expect(primera).toBeGreaterThan(-1);
  expect(segunda).toBeGreaterThan(primera);
  expect(cuerpo).toContain(regla);
  expect(cuerpo).toContain("Página armada con la resolución leída del almacén de RIGE.");
}

function resumen(cuerpo: string): string {
  const encontrado = /<dt>Resumen de las entradas leídas<\/dt><dd>([a-f0-9]{64})<\/dd>/.exec(cuerpo);
  if (!encontrado) throw new Error("La pagina no presenta el resumen de las entradas.");
  return encontrado[1]!;
}

describe("RF-01 CA-1 · recorrido del README (guía, paso 8)", () => {
  const preparar = prepararRecorrido(true);
  test.skipIf(!tieneGit)("lee la ruta relativa sin copiar, guarda y presenta la procedencia completa", async () => {
    const recorrido = preparar();
    const redireccion = await recorrido.resolver();
    expect(redireccion.estado).toBe(303);
    expect(redireccion.cabeceras.location).toBe(paginaPrimera);
    const pagina = await recorrido.solicitar(paginaPrimera);
    expect(pagina.estado).toBe(200);
    comprobarTemperatura(pagina.cuerpo, recorrido.raiz);
    expect(pagina.cuerpo).toMatch(/Instante \(UTC\)<\/dt><dd>\d{4}-\d{2}-\d{2}T[^<]+Z<\/dd>/);
    resumen(pagina.cuerpo);
  });
});

describe("RF-01 CA-2; RNF-01 CA-1 CA-2", () => {
  const preparar = prepararRecorrido(true);
  test.skipIf(!tieneGit)("sin clave presenta todas las claves con valores del oraculo y el mismo rastro", async () => {
    const recorrido = preparar();
    const archivos = ["opencode.json", "proyecto/opencode.json", "proyecto/opencode.jsonc"];
    const resumir = () => archivos.map(archivo => {
      const ruta = join(recorrido.raiz, archivo);
      return { archivo, sha256: createHash("sha256").update(readFileSync(ruta)).digest("hex"), mtime: statSync(ruta).mtimeMs };
    });
    const antes = resumir();
    const listado = arbol(recorrido.raiz);
    // Clave ausente en la URL del formulario.
    const redireccion = await recorrido.solicitar(`/resolver?proyecto=${encodeURIComponent(recorrido.proyecto)}&agente=build`);
    expect(redireccion.estado).toBe(303);
    expect(redireccion.cabeceras.location).toBe("/resoluciones/1?agente=build");
    const pagina = await recorrido.solicitar("/resoluciones/1?agente=build");
    expect(pagina.estado).toBe(200);
    const referencia = await Bun.file(new URL("../escenarios/v1-precedencia/REFERENCIA.json", import.meta.url)).json() as {
      valores: Record<string, string | number>;
    };
    const tabla = pagina.cuerpo.split("<tbody>")[1]!.split("</tbody>")[0]!;
    const claves = [...tabla.matchAll(/<tr><td>([^<]+)<\/td>/g)].map(coincidencia => coincidencia[1]);
    expect(claves).toEqual(["description", "steps", "temperature"]);
    for (const [clave, valor] of Object.entries(referencia.valores)) {
      expect(tabla).toContain(`<td>${clave}</td><td>${JSON.stringify(valor).replaceAll('"', "&quot;")}</td>`);
    }
    comprobarTemperatura(pagina.cuerpo, recorrido.raiz);
    const puntual = await recorrido.solicitar(paginaPrimera);
    expect(puntual.estado).toBe(200);
    const fila = (cuerpo: string) => /<tr><td>temperature<\/td>.*?<\/tr>/s.exec(cuerpo)?.[0];
    expect(fila(pagina.cuerpo)).toBe(fila(puntual.cuerpo));
    expect(resumir()).toEqual(antes);
    expect(arbol(recorrido.raiz)).toEqual(listado);
  });
});

describe("RF-17", () => {
  const preparar = prepararRecorrido();
  describe("RF-17 CA-1", () => {
    test("recupera el mismo cuerpo despues de detener y relanzar el servidor", async () => {
      const recorrido = preparar();
      const guardada = await recorrido.resolver();
      expect(guardada.estado).toBe(303);
      const ruta = ubicacion(guardada);
      const antes = await recorrido.solicitar(ruta);
      expect(antes.estado).toBe(200);
      await recorrido.reiniciar();
      const despues = await recorrido.solicitar(ruta);
      expect(despues.estado).toBe(200);
      expect(despues.cuerpo).toBe(antes.cuerpo);
    });
  });

  describe("RF-17 CA-2", () => {
    test("una entrada modificada produce otra resolucion y otro resumen sin alterar la anterior", async () => {
      const recorrido = preparar();
      const guardada = await recorrido.resolver();
      expect(guardada.estado).toBe(303);
      const rutaPrimera = ubicacion(guardada);
      const primera = await recorrido.solicitar(rutaPrimera);
      expect(primera.estado).toBe(200);
      const entrada = join(recorrido.proyecto, "opencode.jsonc");
      const original = readFileSync(entrada, "utf8");
      expect(original).toContain('"temperature": 0.3');
      writeFileSync(entrada, original.replace('"temperature": 0.3', '"temperature": 0.4'));
      const redireccion = await recorrido.resolver();
      expect(redireccion.estado).toBe(303);
      const rutaSegunda = ubicacion(redireccion);
      expect(rutaSegunda).toMatch(/^\/resoluciones\/\d+\?agente=build&clave=temperature$/);
      expect(rutaSegunda).not.toBe(rutaPrimera);
      const segunda = await recorrido.solicitar(rutaSegunda);
      expect(segunda.estado).toBe(200);
      comprobarTemperatura(segunda.cuerpo, recorrido.raiz, 0.4);
      expect(resumen(segunda.cuerpo)).not.toBe(resumen(primera.cuerpo));
      const recuperada = await recorrido.solicitar(rutaPrimera);
      expect(recuperada.estado).toBe(200);
      comprobarTemperatura(recuperada.cuerpo, recorrido.raiz);
      expect(resumen(recuperada.cuerpo)).toBe(resumen(primera.cuerpo));
      for (const pagina of [segunda, recuperada]) {
        for (const ruta of [rutaPrimera, rutaSegunda]) expect(pagina.cuerpo).toContain(`href="${ruta.replaceAll("&", "&amp;")}"`);
      }
    });
  });

  describe("RF-17 CA-3", () => {
    test("retiene las ultimas veinte y deja de recuperar la primera", async () => {
      const recorrido = preparar();
      const guardadas: number[] = [];
      for (let indice = 0; indice < 21; indice++) {
        const redireccion = await recorrido.resolver();
        expect(redireccion.estado).toBe(303);
        const ruta = ubicacion(redireccion);
        expect(ruta).toMatch(/^\/resoluciones\/\d+\?agente=build&clave=temperature$/);
        guardadas.push(Number(/^\/resoluciones\/(\d+)/.exec(ruta)![1]));
      }
      const ruta = (id: number) => `/resoluciones/${id}?agente=build&clave=temperature`;
      const ultima = await recorrido.solicitar(ruta(guardadas.at(-1)!));
      expect(ultima.estado).toBe(200);
      const ids = [...ultima.cuerpo.matchAll(/href="\/resoluciones\/(\d+)\?agente=build/g)].map(enlace => Number(enlace[1]));
      expect(ids).toEqual(guardadas.slice(1).reverse());
      const retirada = await recorrido.solicitar(ruta(guardadas[0]!));
      expect(retirada.estado).toBe(404);
      expect(retirada.cuerpo).toContain(`No existe la resolucion ${guardadas[0]} en el almacen.`);
      expect((await recorrido.solicitar(ruta(guardadas[1]!))).estado).toBe(200);
    });
  });
});

function arbol(raiz: string, relativo = ""): string[] {
  return readdirSync(join(raiz, relativo), { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
    .flatMap(entrada => {
      const ruta = relativo ? `${relativo}/${entrada.name}` : entrada.name;
      return entrada.isDirectory() ? [ruta + "/", ...arbol(raiz, ruta)] : [ruta];
    });
}

describe("V-7 RNF-09 ADR-062 C7", () => {
  const preparar = prepararRecorrido();
  test("rechaza origen ajeno antes de guardar y conserva las defensas en las rutas nuevas", async () => {
    const recorrido = preparar();
    const ruta = `/resolver?proyecto=${encodeURIComponent(recorrido.proyecto)}&agente=build&clave=temperature`;
    for (const destino of [ruta, paginaPrimera]) {
      for (const sitio of ["cross-site", "same-site"]) {
        const rechazo = await recorrido.solicitar(destino, { cabeceras: { "Sec-Fetch-Site": sitio } });
        expect(rechazo.estado).toBe(403);
        expect(rechazo.cuerpo).not.toContain(recorrido.proyecto.replaceAll("\\", "/"));
        expect(Object.keys(rechazo.cabeceras).filter(nombre => nombre.startsWith("access-control-"))).toEqual([]);
      }
      expect((await recorrido.solicitar(destino, { cabeceras: { Host: "ajeno.example" } })).estado).toBe(403);
      expect((await recorrido.solicitar(destino, { metodo: "POST" })).estado).toBe(405);
    }
    const redireccion = await recorrido.resolver();
    expect(redireccion.estado).toBe(303);
    expect(redireccion.cabeceras.location).toBe(paginaPrimera);
    const pagina = await recorrido.solicitar(paginaPrimera);
    expect(pagina.estado).toBe(200);
    for (const respuesta of [redireccion, pagina]) {
      expect(respuesta.cabeceras["content-security-policy"]).toBe("default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
      expect(respuesta.cabeceras["x-content-type-options"]).toBe("nosniff");
      expect(Object.keys(respuesta.cabeceras).filter(nombre => nombre.startsWith("access-control-"))).toEqual([]);
    }
  });
});

describe("Errores de uso por la web", () => {
  describe("Proyecto inexistente y contenido no soportado", () => {
    const preparar = prepararRecorrido();
    test("informa proyecto inexistente y contenido no soportado sin guardar", async () => {
      const recorrido = preparar();
      const inexistente = await recorrido.solicitar(`/resolver?proyecto=${encodeURIComponent(join(recorrido.raiz, "ausente"))}&agente=build`);
      expect(inexistente.estado).toBe(404);
      expect(inexistente.cuerpo).toContain("no existe");
      const entrada = join(recorrido.proyecto, "opencode.jsonc");
      const original = readFileSync(entrada, "utf8");
      writeFileSync(entrada, original.replace('"temperature": 0.3', '"temperature": {env:X}'));
      const noSoportado = await recorrido.resolver();
      expect(noSoportado.estado).toBe(422);
      expect(noSoportado.cuerpo).toContain("El prototipo v1 no incorpora {env:X}");
      expect(noSoportado.cabeceras.location).toBeUndefined();
      expect((await recorrido.solicitar(paginaPrimera)).estado).toBe(404);
      writeFileSync(entrada, original);
      const valida = await recorrido.resolver();
      expect(valida.estado).toBe(303);
      expect(valida.cabeceras.location).toBe(paginaPrimera);
    });
  });

  describe("Clave o agente inexistentes", () => {
    const preparar = prepararRecorrido();
    test("clave o agente inexistentes dan 404 y la siguiente resolucion valida sigue siendo la 1", async () => {
      const recorrido = preparar();
      const clave = await recorrido.resolver("temperaturre");
      expect(clave.estado).toBe(404);
      expect(clave.cuerpo).toContain("La clave temperaturre no existe para el agente build.");
      expect(clave.cabeceras.location).toBeUndefined();
      const agente = await recorrido.solicitar(`/resolver?proyecto=${encodeURIComponent(recorrido.proyecto)}&agente=ausente`);
      expect(agente.estado).toBe(404);
      expect(agente.cuerpo).toContain("El agente ausente no tiene declaraciones.");
      expect(agente.cabeceras.location).toBeUndefined();
      expect((await recorrido.solicitar(paginaPrimera)).estado).toBe(404);
      const valida = await recorrido.resolver();
      expect(valida.estado).toBe(303);
      expect(valida.cabeceras.location).toBe(paginaPrimera);
      const pagina = await recorrido.solicitar(paginaPrimera);
      expect(pagina.estado).toBe(200);
      comprobarTemperatura(pagina.cuerpo, recorrido.raiz);
    });
  });

  describe("Claves no resueltas", () => {
    const preparar = prepararRecorrido();
    test("no guarda la clave no resuelta y sin clave muestra solo las pendientes del agente consultado", async () => {
      const recorrido = preparar();
      const entrada = join(recorrido.proyecto, "opencode.jsonc");
      const original = readFileSync(entrada, "utf8");
      // La copia temporal conserva la linea y columna de temperature.
      writeFileSync(entrada, original.replace('"temperature": 0.3', '"temperature": 0.3, "permission": {"edit":"deny"}')
        .replace('"build": {', '"otro": {"permission":{"bash":"deny"}}, "build": {'));
      const rechazo = await recorrido.resolver("permission.edit");
      expect(rechazo.estado).toBe(422);
      expect(rechazo.cuerpo).toContain("permission.edit");
      expect(rechazo.cabeceras.location).toBeUndefined();
      const valida = await recorrido.resolver("");
      expect(valida.estado).toBe(303);
      expect(valida.cabeceras.location).toBe("/resoluciones/1?agente=build");
      const pagina = await recorrido.solicitar("/resoluciones/1?agente=build");
      expect(pagina.estado).toBe(200);
      expect(pagina.cuerpo).toContain("<td>temperature</td><td>0.3</td>");
      expect(pagina.cuerpo).toContain("Claves no resueltas en el prototipo v1");
      expect(pagina.cuerpo).toContain("<li>permission:");
      const pendientes = /<h2>Claves no resueltas en el prototipo v1<\/h2>\s*<ul>(.*?)<\/ul>/s.exec(pagina.cuerpo)?.[1];
      expect(pendientes).toBeDefined();
      expect(pendientes?.match(/<li>/g)).toHaveLength(1);
      expect(pagina.cuerpo).not.toContain("otro.permission");
      const recuperada = await recorrido.solicitar("/resoluciones/1?agente=build&clave=permission");
      expect(recuperada.estado).toBe(422);
      expect(recuperada.cuerpo).toContain("permission");
    });
  });
});
