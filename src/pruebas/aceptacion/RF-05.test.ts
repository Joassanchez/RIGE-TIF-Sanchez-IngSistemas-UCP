import { borrarTemporal } from "../utilidades/borrar-temporal";
import { seccionHtml } from "../utilidades/html";
import { afterEach, describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { copiarEscenario } from "../utilidades/escenario";
import { crearInstalacionOpenCode } from "../utilidades/instalacion-opencode";
import { lanzar, lanzarServidor } from "../utilidades/subproceso";
import { solicitarPaginaLocal as solicitarLocal } from "./seguir-redireccion";
import { validarEsquema } from "../utilidades/validar-esquema";
import { crearResolucionGuardadaAnterior } from "../utilidades/resolucion-guardada";

const limpiezas: (() => void)[] = [];
afterEach(() => { for (const limpiar of limpiezas.splice(0).reverse()) limpiar(); });
function preparar(version: string | null) {
  const escenario = copiarEscenario("v1-precedencia", { git: "ninguno" });
  limpiezas.push(escenario.borrar);
  const temporal = mkdtempSync(join(tmpdir(), "rige-version-"));
  limpiezas.push(() => borrarTemporal(temporal));
  const instalacion = join(temporal, "instalacion-falsa");
  crearInstalacionOpenCode(instalacion, version);
  const variables = { PATH: version === null ? join(temporal, "sin-ejecutable") : instalacion, RIGE_ALMACEN: join(temporal, "almacen") };
  return { ...escenario, temporal, instalacion, variables };
}
const consultas = [
  ["valores", ["--agente", "build"]],
  ["permiso", ["--agente", "build", "--sujeto", "bash", "--objetivo", "ls"]],
  ["agentes", []], ["hallazgos", []],
] as const;
async function validar(nombre: string, valor: unknown) {
  const esquema = await Bun.file(new URL(`../../esquemas/salida/${nombre}.json`, import.meta.url)).json();
  expect(validarEsquema(esquema, valor)).toEqual([]);
}
function datos(cuerpo: string) {
  const bloque = cuerpo.match(/<script type="application\/json" id="respuesta">([^]*?)<\/script>/);
  expect(bloque).not.toBeNull();
  return JSON.parse(bloque![1]!);
}
function contar(base: string): number {
  const db = new Database(base, { readonly: true });
  try { return db.query<{ n: number }, []>("SELECT count(*) AS n FROM resolucion").get()!.n; }
  finally { db.close(); }
}

describe("C-3 RF-05 CA-1 T3-01 R-9", () => {
  test("las cuatro consultas muestran la esperada y la detectada sin resultados", () => {
    const escenario = preparar("1.18.24");
    for (const [comando, opciones] of consultas) {
      const recibida = lanzar(escenario.temporal, [comando, "--proyecto", escenario.proyecto, ...opciones], escenario.variables);
      expect(recibida.salida).toBe("");
      const error = JSON.parse(recibida.error).error;
      expect(error.codigo).toBe("version-no-soportada");
      expect(error.mensaje).toContain("1.18.25");
      expect(error.mensaje).toContain("1.18.24");
      expect(error.mensaje).toContain(join(escenario.instalacion, "node_modules/opencode-ai/package.json").replaceAll("\\", "/"));
    }
  });
});
describe("C-3 RF-05 CA-2 T3-01 R-9", () => {
  test("CLI devuelve codigo 1 y una linea del esquema error sin salida estandar", async () => {
    const escenario = preparar("1.18.24");
    for (const [comando, opciones] of consultas) {
      const recibida = lanzar(escenario.temporal, [comando, "--proyecto", escenario.proyecto, ...opciones], escenario.variables);
      expect(recibida.codigo).toBe(1);
      expect(recibida.salida).toBe("");
      expect(recibida.error.trim().split(/\r?\n/)).toHaveLength(1);
      await validar("error", JSON.parse(recibida.error));
    }
  });
});
describe("T3-01 R-10", () => {
  test("web rechaza la version distinta con 422 sin guardar", async () => {
    const escenario = preparar("1.18.24");
    const esquema = lanzar(escenario.temporal, ["esquema"], escenario.variables);
    expect(esquema.codigo).toBe(0);
    const base = JSON.parse(esquema.salida).almacen.ruta;
    const antes = contar(base);
    const servidor = await lanzarServidor(escenario.temporal, escenario.variables);
    try {
      const respuesta = await solicitarLocal({ host: "127.0.0.1", puerto: servidor.puerto,
        ruta: `/resolver?proyecto=${encodeURIComponent(escenario.proyecto)}&agente=build` });
      expect(respuesta.estado).toBe(422);
      expect(respuesta.cuerpo).toContain("1.18.24");
      expect(respuesta.cuerpo).toContain("1.18.25");
      expect(respuesta.cuerpo).not.toContain("Valores efectivos");
      expect(respuesta.cuerpo).not.toContain('id="respuesta"');
      expect(contar(base)).toBe(antes);
    } finally { await servidor.detener(); }
  });
});
describe("C-3 T3-01 R-11", () => {
  test("version ausente conserva resultados, advierte en CLI y presenta declaraciones y paridad web", async () => {
    const escenario = preparar(null);
    let valores: unknown;
    for (const [comando, opciones] of consultas) {
      const recibida = lanzar(escenario.temporal, [comando, "--proyecto", escenario.proyecto, ...opciones], escenario.variables);
      expect(recibida.codigo).toBe(0);
      const respuesta = JSON.parse(recibida.salida);
      await validar(comando, respuesta);
      const codigos = respuesta.declaraciones.filter((codigo: string) => ["version-no-determinada", "ejecutable-no-encontrado"].includes(codigo));
      expect(codigos).toEqual(["version-no-determinada", "ejecutable-no-encontrado"]);
      expect(respuesta.declaraciones[respuesta.declaraciones.indexOf("version-no-determinada") + 1]).toBe("ejecutable-no-encontrado");
      const lineas = recibida.error.trim().split(/\r?\n/).map(linea => JSON.parse(linea));
      expect(lineas).toHaveLength(2);
      for (let i = 0; i < lineas.length; i++) {
        await validar("advertencia", lineas[i]);
        expect(lineas[i]).toEqual({ esquema: 2, advertencia: { codigo: codigos[i], mensaje: respuesta.reglas[codigos[i]] } });
      }
      if (comando === "valores") valores = respuesta;
    }
    expect(lanzar(escenario.temporal, ["esquema"], escenario.variables).codigo).toBe(0);
    const servidor = await lanzarServidor(escenario.temporal, escenario.variables);
    try {
      const solicitar = (ruta: string) => solicitarLocal({ host: "127.0.0.1", puerto: servidor.puerto, ruta });
      const alta = await solicitar(`/resolver?proyecto=${encodeURIComponent(escenario.proyecto)}&agente=build`);
      expect(alta.estado).toBe(303);
      for (const ruta of [String(alta.cabeceras.location), "/agentes?id=1"]) {
        const pagina = await solicitar(ruta);
        expect(pagina.estado).toBe(200);
        const respuesta = datos(pagina.cuerpo);
        const resultados = ruta === "/agentes?id=1" ? "tabla-agentes" : "valores";
        seccionHtml(pagina.cuerpo, resultados);
        const limites = seccionHtml(pagina.cuerpo, "limites-analisis");
        if (resultados === "valores") expect(pagina.cuerpo.indexOf(`id="${resultados}"`)).toBeLessThan(pagina.cuerpo.indexOf('id="limites-analisis"'));
        else expect(pagina.cuerpo).toContain("Estado actual de los archivos");
        for (const texto of ["Versión instalada de OpenCode no determinada", "Ejecutable de OpenCode no encontrado en PATH"]) {
          expect(limites).toContain(texto);
        }
        if (ruta !== "/agentes?id=1") expect(respuesta).toEqual(valores);
      }
    } finally { await servidor.detener(); }
  });
});
describe("C-3 T3-01 R-12", () => {
  test("el PATH heredado soportado no agrega declaraciones de version ni advertencias", () => {
    const escenario = preparar(null);
    const { PATH: _, ...variables } = escenario.variables;
    for (const [comando, opciones] of consultas) {
      const respuesta = lanzar(escenario.temporal, [comando, "--proyecto", escenario.proyecto, ...opciones], variables);
      expect(respuesta.codigo).toBe(0);
      expect(respuesta.error).toBe("");
      expect(JSON.parse(respuesta.salida).declaraciones).not.toContain("version-no-determinada");
    }
  });
});
describe("T3-01 R-13", () => {
  test("reiniciar con otra version conserva resoluciones previas y no redetecta al consultarlas", async () => {
    const escenario = preparar("1.18.25");
    const esquema = lanzar(escenario.temporal, ["esquema"], escenario.variables);
    expect(esquema.codigo).toBe(0);
    let servidor = await lanzarServidor(escenario.temporal, escenario.variables);
    const solicitar = (ruta: string) => solicitarLocal({ host: "127.0.0.1", puerto: servidor.puerto, ruta });
    const anteriores: unknown[] = [];
    try {
      expect((await solicitar(`/resolver?proyecto=${encodeURIComponent(escenario.proyecto)}&agente=build`)).estado).toBe(303);
    } finally { await servidor.detener(); }
    expect(crearResolucionGuardadaAnterior(escenario.variables.RIGE_ALMACEN, 1)).toBe(2);
    servidor = await lanzarServidor(escenario.temporal, { ...escenario.variables, PATH: join(escenario.temporal, "sin-ejecutable") });
    try {
      expect((await solicitar(`/resolver?proyecto=${encodeURIComponent(escenario.proyecto)}&agente=build`)).estado).toBe(303);
      for (const id of [2, 3]) for (const ruta of [`/resoluciones/${id}?agente=build`, `/agentes?id=${id}`,
        `/permiso?id=${id}&agente=build&sujeto=bash&objetivo=ls`]) {
        const pagina = await solicitar(ruta);
        expect(pagina.estado).toBe(200);
        const respuesta = datos(pagina.cuerpo);
        expect(respuesta.declaraciones.includes("version-no-determinada")).toBe(id === 3);
        expect(Object.hasOwn(respuesta.reglas, "version-no-determinada")).toBe(id === 3);
        anteriores.push(respuesta);
      }
    } finally { await servidor.detener(); }
    crearInstalacionOpenCode(escenario.instalacion, "1.18.24");
    servidor = await lanzarServidor(escenario.temporal, escenario.variables);
    try {
      let indice = 0;
      for (const id of [2, 3]) for (const ruta of [`/resoluciones/${id}?agente=build`, `/agentes?id=${id}`,
        `/permiso?id=${id}&agente=build&sujeto=bash&objetivo=ls`]) {
        const pagina = await solicitar(ruta);
        expect(pagina.estado).toBe(200);
        expect(datos(pagina.cuerpo)).toEqual(anteriores[indice++]);
      }
    } finally { await servidor.detener(); }
  });
});
