import { describe, expect, test } from "bun:test";
import { posix, resolve } from "node:path";
import { analizarFuente, tokenizar, type HallazgoDependencia } from "../utilidades/analisis-arquitectura";

const raiz = resolve(import.meta.dir, "../..");
const clienteReservado = "pruebas/utilidades/cliente-http-local.ts";
const moduloCliente = /^(?:node:)?(?:http|https|http2|net|tls|dgram)(?:\/|$)|^undici(?:\/|$)/;

describe("M-5 tokenizador compartido", () => {
  test("la guarda de red importa tokenizar sin mantener otro scanner", async () => {
    const codigo = await Bun.file(import.meta.path).text();
    expect(/import\s*\{[^}]*\btokenizar\b[^}]*\}\s*from\s*"\.\.\/utilidades\/analisis-arquitectura"/.test(codigo)).toBe(true);
    expect(/^import.*typescript\/unstable\/ast/m.test(codigo)).toBe(false);
  });
});

function analizarRed(archivo: string, codigo: string): HallazgoDependencia[] {
  archivo = posix.normalize(archivo.replaceAll("\\", "/"));
  // La matriz compartida ya recupera imports de tipos y rechaza cargadores no analizables.
  const hallazgos = analizarFuente(archivo.replace(/\.test(?=\.)/, ""), codigo).filter((hallazgo) => {
    const destino = hallazgo.motivo.split(" -> ").at(-1)!;
    return moduloCliente.test(destino)
      && !(archivo === clienteReservado && destino === "node:http");
  }).map((hallazgo) => ({ ...hallazgo, archivo }));
  if (!archivo.startsWith("paquetes/") && archivo !== clienteReservado) return hallazgos;

  const transpilado = new Bun.Transpiler({ loader: /\.[jt]sx$/.test(archivo) ? "tsx" : "ts" }).transformSync(codigo);
  const lista = tokenizar(transpilado);
  for (let indice = 0; indice < lista.length; indice++) {
    const token = lista[indice]!;
    const directa = !token.cadena;
    const calculadaLiteral = token.cadena && lista[indice - 1]?.valor === "["
      && lista[indice + 1]?.valor === "]" && lista[indice + 2]?.valor === "(";
    if ((directa || calculadaLiteral) && (token.valor === "WebSocket"
      || (token.valor === "fetch" && (calculadaLiteral || lista[indice + 1]?.valor !== ":")))) {
      hallazgos.push({ archivo, motivo: `Cliente global no permitido: ${token.valor}` });
    }
  }
  return hallazgos;
}

async function comprobarRed(): Promise<HallazgoDependencia[]> {
  const hallazgos: HallazgoDependencia[] = [];
  for (const carpeta of ["paquetes", "pruebas"]) {
    for (const ruta of new Bun.Glob("**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs}").scanSync({ cwd: resolve(raiz, carpeta) })) {
      const relativa = ruta.replaceAll("\\", "/");
      if (relativa.split("/").includes("node_modules")) continue;
      const archivo = `${carpeta}/${relativa}`;
      hallazgos.push(...analizarRed(archivo, await Bun.file(resolve(raiz, archivo)).text()));
    }
  }
  return hallazgos.sort((a, b) => a.archivo.localeCompare(b.archivo) || a.motivo.localeCompare(b.motivo));
}

describe("T0-07 sin clientes de red", () => {
  for (const modulo of ["node:http", "node:https", "node:net", "node:tls", "node:dgram", "undici"]) {
    for (const codigo of [`import "${modulo}";`, `import type { Cliente } from "${modulo}";`,
      `export type { Cliente } from "${modulo}";`, `type T = import("${modulo}").Cliente;`,
      `const cargar = () => import("${modulo}");`, `const cliente = require("${modulo}");`]) {
      test(`rechaza ${codigo}`, () => {
        expect(analizarRed("paquetes/rige/interfaces/cli/sonda.ts", codigo).length).toBeGreaterThan(0);
      });
    }
  }
  for (const codigo of ['fetch("http://127.0.0.1:1");', 'globalThis.fetch("http://127.0.0.1:1");',
    'new WebSocket("ws://127.0.0.1:1");', 'globalThis["fetch"]("http://127.0.0.1:1");',
    'fetch.preconnect("http://127.0.0.1:1");', 'const solicitud = fetch; solicitud("http://127.0.0.1:1");']) {
    test(`rechaza cliente global: ${codigo}`, () => {
      expect(analizarRed("paquetes/rige/interfaces/web/sonda.ts", codigo).length).toBeGreaterThan(0);
    });
  }
  test("permite servidor local y texto inerte sin interpretar comentarios o regex", () => {
    for (const codigo of ['const ejemplo = \'fetch("url"); WebSocket\';', '// fetch("url"); WebSocket',
      'const patron = () => /fetch("external") WebSocket/;',
      'Bun.serve({hostname: "127.0.0.1", fetch: () => new Response("fija")});']) {
      expect(analizarRed("paquetes/rige/interfaces/web/servidor.ts", codigo)).toEqual([]);
    }
  });
  test("solo la ruta exacta reservada puede importar node:http", () => {
    expect(analizarRed(clienteReservado, 'import { request } from "node:http";')).toEqual([]);
    for (const archivo of ["pruebas/utilidades/otro.ts", "pruebas/utilidades/cliente-http-local.test.ts",
      "paquetes/rige/cliente-http-local.ts", "pruebas/arquitectura/sonda.test.ts"]) {
      expect(analizarRed(archivo, 'import { request } from "node:http";').length).toBeGreaterThan(0);
    }
    expect(analizarRed(clienteReservado, 'import "node:https";').length).toBeGreaterThan(0);
    expect(analizarRed(clienteReservado, 'fetch("url");').length).toBeGreaterThan(0);
  });
  test("no deja pasar imports calculados ni módulos sin prefijo node", () => {
    expect(() => analizarRed("paquetes/nucleo/sonda.ts", 'import(destino);')).toThrow("no analizable");
    expect(analizarRed("paquetes/rige/interfaces/sonda.ts", 'import "https";').length).toBeGreaterThan(0);
  });
  test("producto y arnes real no importan clientes fuera de la ruta reservada", async () => {
    expect(await comprobarRed()).toEqual([]);
  });
});
