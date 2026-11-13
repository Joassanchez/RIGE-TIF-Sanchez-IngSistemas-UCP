import { borrarTemporal } from "../utilidades/borrar-temporal";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { copiarEscenario } from "../utilidades/escenario";
import { lanzar, lanzarServidor } from "../utilidades/subproceso";
import { solicitarPaginaLocal as solicitarLocal } from "./seguir-redireccion";
import { type SolicitudLocal } from "../utilidades/cliente-http-local";
import { seccionHtml, textoHtml } from "../utilidades/html";

const regla = "OpenCode 1.18.25 aplica las entradas en orden de precedencia; prevalece la declaración de la última entrada que declara la clave (RD-01).";

function prepararRecorrido() {
  let temporal: string;
  let escenario: ReturnType<typeof copiarEscenario> | undefined;
  let servidor: Awaited<ReturnType<typeof lanzarServidor>> | undefined;
  let variables: Record<string, string>;
  beforeAll(async () => {
    temporal = mkdtempSync(join(tmpdir(), "rige-rf17-"));
    variables = { RIGE_ALMACEN: join(temporal, "almacen"), ProgramData: join(temporal, "administrada-vacia") };
    mkdirSync(variables.ProgramData!);
    const esquema = lanzar(temporal, ["esquema"], variables);
    expect(esquema.codigo).toBe(0);
    expect(esquema.error).toBe("");
    servidor = await lanzarServidor(temporal, variables);
  });
  beforeEach(() => { escenario = copiarEscenario("v1-precedencia"); });
  afterEach(() => { escenario?.borrar(); escenario = undefined; });
  afterAll(async () => {
    try { await servidor?.detener(); }
    finally { borrarTemporal(temporal); }
  });
  return () => {
    if (!servidor || !escenario) throw new Error("Recorrido no preparado.");
    const raiz = realpathSync.native(escenario.raiz);
    const proyecto = escenario.proyecto;
    const solicitar = (ruta: string, opciones: Omit<SolicitudLocal, "host" | "puerto" | "ruta"> = {}) => {
      if (!servidor) throw new Error("Servidor detenido.");
      return solicitarLocal({ host: "127.0.0.1", puerto: servidor.puerto, ruta, ...opciones });
    };
    return {
      proyecto, raiz, solicitar,
      consultar: (...argumentos: string[]) => lanzar(temporal, argumentos, variables),
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
  expect(valores).toContain(`<td data-etiqueta="Clave">temperature</td><td data-etiqueta="Valor">${temperatura}</td>`);
  const fila = /<tr><td[^>]*>temperature<\/td>.*?<\/tr>/s.exec(valores);
  expect(fila).not.toBeNull();
  const celdas = fila![0].match(/<td\b[^>]*>.*?<\/td>/gs)!;
  expect(celdas).toHaveLength(4);
  expect(textoHtml(celdas[2]!)).toBe("Proyecto · opencode.jsonc:6:7");
  expect(celdas[2]).toContain(`title="Abrir en VS Code: ${ruta}/proyecto/opencode.jsonc"`);
  const desplazadas = [...celdas[3]!.matchAll(/<div class="declaracion-desplazada">(.*?)<\/div>/gs)].map(li => textoHtml(li[1]!));
  expect(desplazadas).toEqual(["0.1 · Proyecto · opencode.json:5:7", "0.2 · Proyecto · opencode.json:5:7"]);
  expect(cuerpo).toContain(regla);
  expect(cuerpo).toContain("Página armada con la resolución leída del almacén de RIGE.");
}

function resumen(cuerpo: string): string {
  const encontrado = /<dt>Resumen de las entradas leídas<\/dt><dd>([a-f0-9]{64})<\/dd>/.exec(seccionHtml(cuerpo, "entradas-leidas", "details"));
  if (!encontrado) throw new Error("La pagina no presenta el resumen de las entradas.");
  return encontrado[1]!;
}

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
      const resumenProyecto = await recorrido.solicitar(rutaSegunda.split("?")[0]!);
      for (const ruta of [rutaPrimera, rutaSegunda]) expect(resumenProyecto.cuerpo).toContain(`href="${ruta.split("?")[0]}"`);
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
      const ruta = (id: number) => `/resoluciones/${id}`;
      const ultima = await recorrido.solicitar(ruta(guardadas.at(-1)!));
      expect(ultima.estado).toBe(200);
      const historia = seccionHtml(ultima.cuerpo, "historia", "details");
      const ids = [...historia.matchAll(/href="\/resoluciones\/(\d+)"/g)].map(enlace => Number(enlace[1]));
      expect(ids).toEqual(guardadas.slice(1).reverse());
      expect(ids).toHaveLength(20);
      expect(ids).not.toContain(guardadas[0]!);
      expect(historia).toContain(`href="/resoluciones/${guardadas.at(-1)}" aria-current="page"`);
      expect(historia.match(/aria-current="page"/g)).toHaveLength(1);
      const comparaciones = [...historia.matchAll(/href="\/comparar\?desde=(\d+)&amp;hasta=(\d+)"/g)]
        .map(enlace => [Number(enlace[1]), Number(enlace[2])]);
      expect(comparaciones).toEqual(guardadas.slice(2).reverse().map(id => [id - 1, id]));
      const intermedia = await recorrido.solicitar(ruta(guardadas[10]!));
      const historialIntermedio = seccionHtml(intermedia.cuerpo, "historia", "details");
      expect(historialIntermedio).toContain(`href="/resoluciones/${guardadas[10]}" aria-current="page"`);
      expect(historialIntermedio).toContain("más reciente");
      expect([...historialIntermedio.matchAll(/href="\/resoluciones\/(\d+)"/g)].map(e => Number(e[1]))).toEqual(ids);
      const retirada = await recorrido.solicitar(ruta(guardadas[0]!));
      expect(retirada.estado).toBe(404);
      expect(retirada.cuerpo).toContain("No encontramos ese análisis en el almacén.");
      expect(retirada.cuerpo).toContain("resolucion-inexistente");
      expect((await recorrido.solicitar(ruta(guardadas[1]!))).estado).toBe(200);
    });
  });
});
