import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { copiarEscenario } from "../utilidades/escenario";
import { lanzar, lanzarServidor } from "../utilidades/subproceso";
import { solicitarLocal, type SolicitudLocal } from "../utilidades/cliente-http-local";

const regla = "OpenCode 1.18.25 aplica las entradas en orden de precedencia; prevalece la declaración de la última entrada que declara la clave (RD-01).";
const paginaPrimera = "/resoluciones/1?agente=build&clave=temperature";

function prepararRecorrido() {
  let temporal: string;
  let escenario: ReturnType<typeof copiarEscenario> | undefined;
  let servidor: Awaited<ReturnType<typeof lanzarServidor>> | undefined;
  let variables: Record<string, string>;
  beforeAll(async () => {
    temporal = mkdtempSync(join(tmpdir(), "rige-recorrido-v1-"));
    escenario = copiarEscenario("v1-precedencia");
    variables = { RIGE_ALMACEN: join(temporal, "almacen"), ProgramData: join(temporal, "administrada-vacia") };
    mkdirSync(variables.ProgramData!);
    const esquema = lanzar(temporal, ["esquema"], variables);
    expect(esquema.codigo).toBe(0);
    expect(esquema.error).toBe("");
    servidor = await lanzarServidor(temporal, variables);
  });
  afterAll(async () => {
    try { await servidor?.detener(); }
    finally {
      try { escenario?.borrar(); }
      finally { rmSync(temporal, { recursive: true, force: true }); }
    }
  });
  return () => {
    if (!escenario || !servidor) throw new Error("Recorrido no preparado.");
    const { proyecto, raiz } = escenario;
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

test.skipIf(!existsSync(resolve(import.meta.dir, "../../..", ".git")))(
  "V-0 RF-01 CA-1; ruta relativa del README sin copiar el escenario (se omite sin .git)", async () => {
    const temporal = mkdtempSync(join(tmpdir(), "rige-recorrido-readme-"));
    let servidor: Awaited<ReturnType<typeof lanzarServidor>> | undefined;
    const raiz = realpathSync.native(resolve(import.meta.dir, "../escenarios/v1-precedencia"));
    const archivos = ["opencode.json", "proyecto/opencode.json", "proyecto/opencode.jsonc"];
    const resumenes = () => archivos.map((archivo) => createHash("sha256").update(readFileSync(join(raiz, archivo))).digest("hex"));
    const antes = resumenes();
    try {
      const variables = { RIGE_ALMACEN: join(temporal, "almacen"), ProgramData: join(temporal, "administrada-vacia") };
      mkdirSync(variables.ProgramData);
      const esquema = lanzar(temporal, ["esquema"], variables);
      expect(esquema.codigo).toBe(0);
      expect(esquema.error).toBe("");
      servidor = await lanzarServidor(temporal, variables);
      const solicitar = (ruta: string) => solicitarLocal({ host: "127.0.0.1", puerto: servidor!.puerto, ruta });
      const redireccion = await solicitar("/resolver?proyecto=pruebas/escenarios/v1-precedencia/proyecto&agente=build&clave=temperature");
      expect(redireccion.estado).toBe(303);
      expect(redireccion.cabeceras.location).toBe(paginaPrimera);
      const pagina = await solicitar(paginaPrimera);
      expect(pagina.estado).toBe(200);
      comprobarTemperatura(pagina.cuerpo, raiz);
      expect(resumenes()).toEqual(antes);
    } finally {
      try { await servidor?.detener(); }
      finally { rmSync(temporal, { recursive: true, force: true }); }
    }
  },
);

describe("V-1 RF-01 CA-1; guia paso 8", () => {
  const preparar = prepararRecorrido();
  test("lee, aplica RD-01, guarda, recupera y presenta la procedencia completa", async () => {
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

describe("V-2 RF-01 CA-2", () => {
  const preparar = prepararRecorrido();
  test("sin clave presenta todas las claves con valores del oraculo y el mismo rastro", async () => {
    const recorrido = preparar();
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
  });
});

describe("V-3 RF-17 CA-1", () => {
  const preparar = prepararRecorrido();
  test("recupera el mismo cuerpo despues de detener y relanzar el servidor", async () => {
    const recorrido = preparar();
    expect((await recorrido.resolver()).estado).toBe(303);
    const antes = await recorrido.solicitar(paginaPrimera);
    expect(antes.estado).toBe(200);
    await recorrido.reiniciar();
    const despues = await recorrido.solicitar(paginaPrimera);
    expect(despues.estado).toBe(200);
    expect(despues.cuerpo).toBe(antes.cuerpo);
  });
});

describe("V-4 RF-17 CA-2", () => {
  const preparar = prepararRecorrido();
  test("una entrada modificada produce otra resolucion y otro resumen sin alterar la anterior", async () => {
    const recorrido = preparar();
    expect((await recorrido.resolver()).estado).toBe(303);
    const primera = await recorrido.solicitar(paginaPrimera);
    expect(primera.estado).toBe(200);
    const entrada = join(recorrido.proyecto, "opencode.jsonc");
    const original = readFileSync(entrada, "utf8");
    expect(original).toContain('"temperature": 0.3');
    writeFileSync(entrada, original.replace('"temperature": 0.3', '"temperature": 0.4'));
    const redireccion = await recorrido.resolver();
    expect(redireccion.estado).toBe(303);
    expect(redireccion.cabeceras.location).toBe("/resoluciones/2?agente=build&clave=temperature");
    const segunda = await recorrido.solicitar("/resoluciones/2?agente=build&clave=temperature");
    expect(segunda.estado).toBe(200);
    comprobarTemperatura(segunda.cuerpo, recorrido.raiz, 0.4);
    expect(resumen(segunda.cuerpo)).not.toBe(resumen(primera.cuerpo));
    const recuperada = await recorrido.solicitar(paginaPrimera);
    expect(recuperada.estado).toBe(200);
    comprobarTemperatura(recuperada.cuerpo, recorrido.raiz);
    expect(resumen(recuperada.cuerpo)).toBe(resumen(primera.cuerpo));
    for (const pagina of [segunda, recuperada]) {
      for (const id of [1, 2]) expect(pagina.cuerpo).toContain(`href="/resoluciones/${id}?agente=build&amp;clave=temperature"`);
    }
  });
});

describe("V-5 RF-17 CA-3", () => {
  const preparar = prepararRecorrido();
  test("retiene las ultimas veinte y deja de recuperar la primera", async () => {
    const recorrido = preparar();
    for (let id = 1; id <= 21; id++) {
      const redireccion = await recorrido.resolver();
      expect(redireccion.estado).toBe(303);
      expect(redireccion.cabeceras.location).toBe(`/resoluciones/${id}?agente=build&clave=temperature`);
    }
    const ultima = await recorrido.solicitar("/resoluciones/21?agente=build&clave=temperature");
    expect(ultima.estado).toBe(200);
    const ids = [...ultima.cuerpo.matchAll(/href="\/resoluciones\/(\d+)\?agente=build/g)].map(enlace => Number(enlace[1]));
    expect(ids).toEqual(Array.from({ length: 20 }, (_, indice) => 21 - indice));
    const retirada = await recorrido.solicitar(paginaPrimera);
    expect(retirada.estado).toBe(404);
    expect(retirada.cuerpo).toContain("No existe la resolucion 1 en el almacen.");
    expect((await recorrido.solicitar("/resoluciones/2?agente=build&clave=temperature")).estado).toBe(200);
  });
});

function arbol(raiz: string, relativo = ""): string[] {
  return readdirSync(join(raiz, relativo), { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
    .flatMap(entrada => {
      const ruta = relativo ? `${relativo}/${entrada.name}` : entrada.name;
      return entrada.isDirectory() ? [ruta + "/", ...arbol(raiz, ruta)] : [ruta];
    });
}

describe("V-6 RNF-01 CA-1 CA-2", () => {
  const preparar = prepararRecorrido();
  test("no modifica resúmenes SHA-256, tiempos de modificacion ni el arbol de entradas", async () => {
    const recorrido = preparar();
    const archivos = ["opencode.json", "proyecto/opencode.json", "proyecto/opencode.jsonc"];
    const resumir = () => archivos.map(archivo => {
      const ruta = join(recorrido.raiz, archivo);
      return { archivo, sha256: createHash("sha256").update(readFileSync(ruta)).digest("hex"), mtime: statSync(ruta).mtimeMs };
    });
    const antes = resumir();
    const listado = arbol(recorrido.raiz);
    expect((await recorrido.resolver()).estado).toBe(303);
    const pagina = await recorrido.solicitar(paginaPrimera);
    expect(pagina.estado).toBe(200);
    comprobarTemperatura(pagina.cuerpo, recorrido.raiz);
    expect(resumir()).toEqual(antes);
    expect(arbol(recorrido.raiz)).toEqual(listado);
  });
});

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

describe("V-8", () => {
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

describe("V-9", () => {
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

describe("V-10 Q-1 Q-2", () => {
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
