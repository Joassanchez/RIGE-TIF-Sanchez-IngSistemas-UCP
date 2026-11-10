import { borrarTemporal } from "../utilidades/borrar-temporal";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { copiarEscenario } from "../utilidades/escenario";
import { lanzar, lanzarServidor } from "../utilidades/subproceso";
import { solicitarLocal, type SolicitudLocal } from "../utilidades/cliente-http-local";
import { seccionHtml, textoHtml } from "../utilidades/html";

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
    finally { borrarTemporal(temporal); }
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
  const valores = seccionHtml(cuerpo, "valores");
  const ruta = raiz.replaceAll("\\", "/");
  expect(valores).toContain(`<td data-etiqueta="Clave">temperature</td><td data-etiqueta="Valor efectivo">${temperatura}</td>`);
  const fila = /<tr><td[^>]*>temperature<\/td>.*?<\/tr>/s.exec(valores);
  expect(fila).not.toBeNull();
  const celdas = fila![0].match(/<td\b[^>]*>.*?<\/td>/gs)!;
  expect(celdas).toHaveLength(4);
  expect(textoHtml(celdas[2]!)).toBe(`proyecto ${ruta}/proyecto/opencode.jsonc:6:7`);
  expect(celdas[2]).toContain(`title="${ruta}/proyecto/opencode.jsonc:6:7"`);
  const desplazadas = [...celdas[3]!.matchAll(/<li>(.*?)<\/li>/gs)].map(li => textoHtml(li[1]!));
  expect(desplazadas).toEqual([`0.1 proyecto ${ruta}/opencode.json:5:7`, `0.2 proyecto ${ruta}/proyecto/opencode.json:5:7`]);
  expect(cuerpo).toContain(regla);
  expect(cuerpo).toContain("Página armada con la resolución leída del almacén de RIGE.");
}

function resumen(cuerpo: string): string {
  const encontrado = /<dt>Resumen de las entradas leídas<\/dt><dd>([a-f0-9]{64})<\/dd>/.exec(seccionHtml(cuerpo, "entradas-leidas", "details"));
  if (!encontrado) throw new Error("La pagina no presenta el resumen de las entradas.");
  return encontrado[1]!;
}

describe("T5-11 P-1 P-3 panel con foto y entradas actuales", () => {
  const preparar = prepararRecorrido();
  test("Analizar sin agente guarda la foto; editar entradas solo cambia las vistas actuales", async () => {
    const recorrido = preparar();
    const redireccion = await recorrido.solicitar(`/resolver?proyecto=${encodeURIComponent(recorrido.proyecto)}`);
    expect(redireccion.estado).toBe(303);
    const ruta = ubicacion(redireccion);
    expect(ruta).toBe("/resoluciones/1");
    const foto = await recorrido.solicitar(ruta);
    expect(foto.estado).toBe(200);
    const extraer = (cuerpo: string) => JSON.parse(cuerpo.match(/id="respuesta">([^]*?)<\/script>/)![1]!);
    expect(extraer(foto.cuerpo).agente).toBe("build");
    comprobarTemperatura(foto.cuerpo, recorrido.raiz);
    const contexto = `proyecto=${encodeURIComponent(recorrido.proyecto)}&id=1&agente=build&clave=temperature`;
    const entradasAntes = await recorrido.solicitar(`/entradas?${contexto}`);
    const hallazgosAntes = await recorrido.solicitar(`/hallazgos?${contexto}`);
    for (const actual of [entradasAntes, hallazgosAntes]) expect(actual.estado).toBe(200);
    writeFileSync(join(recorrido.proyecto, "opencode.jsonc"), "{ archivo roto");
    const recuperada = await recorrido.solicitar(ruta);
    expect(recuperada.estado).toBe(200);
    expect(recuperada.cuerpo).toBe(foto.cuerpo);
    for (const [vista, antes] of [["entradas", entradasAntes], ["hallazgos", hallazgosAntes]] as const) {
      const actual = await recorrido.solicitar(`/${vista}?${contexto}`);
      expect(actual.estado).toBe(200);
      expect(extraer(actual.cuerpo)).not.toEqual(extraer(antes.cuerpo));
      expect(actual.cuerpo).toContain("Estado actual de las entradas de configuración (no es la foto guardada)");
      expect(actual.cuerpo).toContain('aria-label="Panel del proyecto"');
    }
    await recorrido.reiniciar();
    expect((await recorrido.solicitar(ruta)).cuerpo).toBe(foto.cuerpo);
  });
});

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
    expect(seccionHtml(pagina.cuerpo, "resumen-resolucion")).toMatch(/Instante \(UTC\)<\/dt><dd>\d{4}-\d{2}-\d{2}T[^<]+Z<\/dd>/);
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
    const tabla = seccionHtml(pagina.cuerpo, "valores").split("<tbody>")[1]!.split("</tbody>")[0]!;
    const claves = [...tabla.matchAll(/<tr><td[^>]*>([^<]+)<\/td>/g)].map(coincidencia => coincidencia[1]);
    expect(claves.filter(clave => Object.hasOwn(referencia.valores, clave!)).sort()).toEqual(["description", "steps", "temperature"]);
    expect(claves.filter(clave => !Object.hasOwn(referencia.valores, clave!)).sort()).toEqual(["mode", "name", "native", "options"]);
    for (const [clave, valor] of Object.entries(referencia.valores)) {
      expect(tabla).toContain(`<td data-etiqueta="Clave">${clave}</td><td data-etiqueta="Valor efectivo">${JSON.stringify(valor).replaceAll('"', "&quot;")}</td>`);
    }
    comprobarTemperatura(pagina.cuerpo, recorrido.raiz);
    const puntual = await recorrido.solicitar(paginaPrimera);
    expect(puntual.estado).toBe(200);
    const fila = (cuerpo: string) => {
      const encontrada = /<tr><td[^>]*>temperature<\/td>.*?<\/tr>/s.exec(seccionHtml(cuerpo, "valores"));
      expect(encontrada).not.toBeNull();
      return encontrada![0];
    };
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
      const historia = seccionHtml(ultima.cuerpo, "historia");
      const ids = [...historia.matchAll(/href="\/resoluciones\/(\d+)\?agente=build/g)].map(enlace => Number(enlace[1]));
      expect(ids).toEqual(guardadas.slice(1).reverse());
      expect(ids).toHaveLength(20);
      expect(ids).not.toContain(guardadas[0]!);
      expect(historia).toContain(`href="/resoluciones/${guardadas.at(-1)}?agente=build&amp;clave=temperature" aria-current="page"`);
      expect(historia.match(/aria-current="page"/g)).toHaveLength(1);
      const retirada = await recorrido.solicitar(ruta(guardadas[0]!));
      expect(retirada.estado).toBe(404);
      expect(retirada.cuerpo).toContain(`No existe la resolución ${guardadas[0]} en el almacén.`);
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
      expect(respuesta.cabeceras["content-security-policy"]).toBe("default-src 'none'; style-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
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
      expect(noSoportado.cuerpo).toContain("RIGE no incorpora {env:X}");
      expect(noSoportado.cabeceras.location).toBeUndefined();
      expect((await recorrido.solicitar(paginaPrimera)).estado).toBe(404);
      writeFileSync(entrada, original);
      const valida = await recorrido.resolver();
      expect(valida.estado).toBe(303);
      expect(valida.cabeceras.location).toBe(paginaPrimera);
    });
  });

  describe("A2-6 Clave o agente inexistentes", () => {
    const preparar = prepararRecorrido();
    test("guarda el proyecto y consulta una clave ausente con exito o un agente ausente con error", async () => {
      const recorrido = preparar();
      const clave = await recorrido.resolver("temperaturre");
      expect(clave.estado).toBe(303);
      const sinClave = await recorrido.solicitar(ubicacion(clave));
      expect(sinClave.estado).toBe(200);
      expect(sinClave.cuerpo).toContain("clave-inexistente");
      const agente = await recorrido.solicitar(`/resolver?proyecto=${encodeURIComponent(recorrido.proyecto)}&agente=ausente`);
      expect(agente.estado).toBe(404);
      expect(agente.cabeceras.location).toBeUndefined();
      expect(agente.cuerpo).toContain("El agente ausente no tiene declaraciones.");
      const valida = await recorrido.resolver();
      expect(valida.estado).toBe(303);
      expect(valida.cabeceras.location).toBe("/resoluciones/2?agente=build&clave=temperature");
      const pagina = await recorrido.solicitar(ubicacion(valida));
      expect(pagina.estado).toBe(200);
      comprobarTemperatura(pagina.cuerpo, recorrido.raiz);
    });
  });

  describe("Claves no resueltas", () => {
    const preparar = prepararRecorrido();
    test("guarda sin consultar claves y presenta el error de la clave no resuelta al recuperar", async () => {
      const recorrido = preparar();
      const entrada = join(recorrido.proyecto, "opencode.jsonc");
      const original = readFileSync(entrada, "utf8");
      // La copia temporal conserva la linea y columna de temperature.
      writeFileSync(entrada, original.replace('"temperature": 0.3', '"temperature": 0.3, "tools": {}, "permission": {"edit":"deny"}')
        .replace('"build": {', '"otro": {"permission":{"bash":"deny"}}, "build": {'));
      const guardada = await recorrido.resolver("permission.edit");
      expect(guardada.estado).toBe(303);
      const rechazo = await recorrido.solicitar(ubicacion(guardada));
      expect(rechazo.estado).toBe(422);
      expect(rechazo.cuerpo).toContain("permission.edit");
      expect(rechazo.cuerpo).toContain("tools");
      const valida = await recorrido.resolver("");
      expect(valida.estado).toBe(303);
      expect(valida.cabeceras.location).toBe("/resoluciones/2?agente=build");
      const pagina = await recorrido.solicitar("/resoluciones/2?agente=build");
      expect(pagina.estado).toBe(200);
      expect(pagina.cuerpo).toContain('<td data-etiqueta="Clave">temperature</td><td data-etiqueta="Valor efectivo">0.3</td>');
      expect(pagina.cuerpo).toContain("Claves no incorporadas por RIGE");
      expect(pagina.cuerpo).toContain("<li>permission:");
      const pendientes = /<ul>(.*?)<\/ul>/s.exec(seccionHtml(pagina.cuerpo, "claves-no-incorporadas", "details"))?.[1];
      expect(pendientes).toBeDefined();
      expect(pendientes?.match(/<li>/g)).toHaveLength(2);
      expect(pendientes).toContain("<li>tools:");
      expect(pagina.cuerpo).not.toContain("otro.permission");
      const recuperada = await recorrido.solicitar("/resoluciones/2?agente=build&clave=permission");
      expect(recuperada.estado).toBe(422);
      expect(recuperada.cuerpo).toContain("permission");
    });
  });
});
