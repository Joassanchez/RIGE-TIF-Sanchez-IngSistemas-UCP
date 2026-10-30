import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { copiarEscenario } from "../utilidades/escenario";
import { entornoDeReferencia } from "../utilidades/entorno-referencia";
import { lanzar, lanzarServidor } from "../utilidades/subproceso";
import { solicitarLocal } from "../utilidades/cliente-http-local";
import { validarEsquema } from "../utilidades/validar-esquema";
import { consultarCadenas } from "../utilidades/cadenas";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { resumenesExpandidos } from "../../paquetes/opencode/sustituciones-oraculo";
import { resolver } from "../../paquetes/nucleo/resolucion/resolver";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";
import { RepositorioResolucionesSqlite } from "../../paquetes/rige/adaptadores/almacen-sqlite/resoluciones";
import { versionRige } from "../../paquetes/rige/aplicacion/respuestas/estado";
import type { Resolucion } from "../../paquetes/nucleo/resolucion/tipos";
import { respuestaValores } from "../../paquetes/rige/aplicacion/casos-uso/proyectar-valores";

const limpiezas: (() => void)[] = [];
afterEach(() => { for (const limpiar of limpiezas.splice(0).reverse()) limpiar(); });
function preparar() {
  const referencia = JSON.parse(readFileSync(join(import.meta.dir, "../escenarios/v3-sustituciones/REFERENCIA.json"), "utf8"));
  const copia = copiarEscenario("v3-sustituciones", { git: "proyecto" });
  limpiezas.push(copia.borrar);
  const env = entornoDeReferencia(referencia, copia);
  const marcas = [...Object.keys(referencia.procedencia.entorno).map(n => env[n]!),
    readFileSync(join(copia.proyecto, "prompts/revisor.txt"), "utf8").trim()].filter(m => m.startsWith("MARCA-"));
  return { ...copia, env, referencia, marcas };
}
function sinContenido(texto: string | Buffer, marcas: readonly string[]) {
  // El fallo tampoco imprime el contenido de una salida que lo filtre.
  expect(marcas.some(m => typeof texto === "string" ? texto.includes(m) : texto.includes(Buffer.from(m)))).toBe(false);
}
function datos(cuerpo: string) {
  const bloque = cuerpo.match(/<script type="application\/json" id="respuesta">([^]*?)<\/script>/);
  expect(bloque).not.toBeNull();
  return JSON.parse(bloque![1]!);
}
const consultas = [
  ["valores", ["--agente", "revisor"]], ["agentes", []],
  ["permiso", ["--agente", "build", "--sujeto", "bash", "--objetivo", "t1 x"]], ["entradas", []],
] as const;

describe("RNF-04 CA-1 y CA-2 T3-04 R-8", () => {
  test("cero marcadores en CLI, diagnostico, todas las paginas y archivos del almacen", async () => {
    const e = preparar();
    for (const depurar of [[], ["--depurar"]]) for (const [comando, opciones] of consultas) {
      const r = lanzar(e.raiz, [comando, "--proyecto", e.proyecto, ...opciones, ...depurar], e.env);
      expect(r.codigo).toBe(0);
      sinContenido(r.salida + r.error, e.marcas);
      const esquema = await Bun.file(join(import.meta.dir, `../../esquemas/salida/${comando}.json`)).json();
      expect(validarEsquema(esquema, JSON.parse(r.salida))).toEqual([]);
    }
    expect(lanzar(e.raiz, ["esquema"], e.env).codigo).toBe(0);
    const servidor = await lanzarServidor(e.raiz, e.env);
    try {
      const rutas = [`/resolver?proyecto=${encodeURIComponent(e.proyecto)}&agente=revisor`,
        "/resoluciones/1?agente=revisor", "/agentes?id=1", "/permiso?id=1&agente=build&sujeto=bash&objetivo=t1%20x",
        `/entradas?proyecto=${encodeURIComponent(e.proyecto)}`];
      for (const ruta of rutas) {
        const r = await solicitarLocal({ host: "127.0.0.1", puerto: servidor.puerto, ruta });
        expect([200, 303]).toContain(r.estado);
        sinContenido(r.cuerpo, e.marcas);
      }
      for (const ruta of new Bun.Glob("**/*").scanSync({ cwd: e.env.RIGE_ALMACEN!, onlyFiles: true, dot: true }))
        sinContenido(readFileSync(join(e.env.RIGE_ALMACEN!, ruta)), e.marcas);
    } finally { await servidor.detener(); }
    for (const ruta of new Bun.Glob("**/*").scanSync({ cwd: e.env.RIGE_ALMACEN!, onlyFiles: true, dot: true }))
      sinContenido(readFileSync(join(e.env.RIGE_ALMACEN!, ruta)), e.marcas);
  });
  test("errores de expansion no filtran ni con --depurar, tampoco en paginas ni almacen", async () => {
    const e = preparar();
    expect(lanzar(e.raiz, ["esquema"], e.env).codigo).toBe(0);
    const entrada = join(e.proyecto, "opencode.json");
    const config = (plantilla: string) => JSON.stringify({ agent: { revisor: { description: plantilla } } });
    writeFileSync(join(e.proyecto, "MARCA-RUTA-EXISTENTE-22"), "contenido sin publicar");
    mkdirSync(join(e.proyecto, "MARCA-DIRECTORIO-EXISTENTE-23"));
    writeFileSync(join(e.proyecto, "MARCA-DIRECTORIO-EXISTENTE-23/a"), "contenido sin publicar");
    for (const [texto, valor] of [
      [config("{file:{env:RIGE_PRUEBA_CLAVE}}"), "MARCA-RUTA-EXISTENTE-22"],
      [config("{file:{env:RIGE_PRUEBA_CLAVE}}"), "MARCA-RUTA-AUSENTE-24"],
      [config("{file:./{env:RIGE_PRUEBA_CLAVE}/a}"), "MARCA-DIRECTORIO-EXISTENTE-23"],
      [config("{file:./{env:RIGE_PRUEBA_CLAVE}/a}"), "MARCA-DIRECTORIO-AUSENTE-25"],
      [config("{env:RIGE_PRUEBA_CLAVE}"), "{file:MARCA-TOKEN-26}"],
      [config("{env:RIGE_PRUEBA_CLAVE}"), 'a","k":"MARCA-INYECCION-921'],
      ['// {env:RIGE_PRUEBA_CLAVE}\n{}', "\n} MARCA-LINEA-27"],
      ['/* {env:RIGE_PRUEBA_CLAVE} */ {}', "*/ } MARCA-BLOQUE-28"],
      [config("{env:RIGE_PRUEBA_CLAVE}"), '"'],
    ] as const) {
      writeFileSync(entrada, texto);
      e.env.RIGE_PRUEBA_CLAVE = valor;
      const marcas = [...e.marcas, ...valor.matchAll(/MARCA-[\w-]+/g)].map(m => typeof m === "string" ? m : m[0]);
      for (const depurar of [[], ["--depurar"]]) for (const [comando, opciones] of consultas) {
        const r = lanzar(e.raiz, [comando, "--proyecto", e.proyecto, ...opciones, ...depurar], e.env);
        expect(r.codigo === 0 || r.codigo === 1).toBe(true);
        sinContenido(r.salida + r.error, marcas);
      }
      const servidor = await lanzarServidor(e.raiz, e.env);
      try {
        for (const ruta of [`/resolver?proyecto=${encodeURIComponent(e.proyecto)}&agente=revisor`, `/entradas?proyecto=${encodeURIComponent(e.proyecto)}`]) {
          const r = await solicitarLocal({ host: "127.0.0.1", puerto: servidor.puerto, ruta });
          expect([200, 422]).toContain(r.estado);
          sinContenido(r.cuerpo, marcas);
        }
      } finally { await servidor.detener(); }
      for (const ruta of new Bun.Glob("**/*").scanSync({ cwd: e.env.RIGE_ALMACEN!, onlyFiles: true, dot: true }))
        sinContenido(readFileSync(join(e.env.RIGE_ALMACEN!, ruta)), marcas);
    }
  }, 20000);
});

describe("RNF-04 CA-3 T3-04 R-10", () => {
  test("cada determinante coincide por resumen con el binario y las desplazadas conservan su origen", () => {
    const e = preparar();
    const entorno = new EntornoLecturaSistema({ plataforma: process.platform, entorno: e.env });
    const contexto = adaptadorOpenCode.contexto(e.proyecto, entorno);
    if (!contexto.exito) throw new Error(contexto.error.mensaje);
    const r = resolver(adaptadorOpenCode, e.proyecto, entorno, contexto.valor);
    expect(r.exito).toBe(true);
    if (!r.exito) throw new Error(r.error.mensaje);
    const sustituidas = r.valor.valores.filter(v => v.determinante.sustituciones?.length);
    expect(sustituidas).toHaveLength(4);
    for (const v of sustituidas) {
      const d = v.determinante;
      for (const s of d.sustituciones!) expect(Object.keys(s).sort()).toEqual(["definido", "origen", "posicion", "tipo"]);
      const via = r.valor.entradas.find(a => a.referencia === d.referencia)!;
      const texto = via.condicion === "definida" ? entorno.variable(via.referencia)! : entorno.leer(via.referencia).texto;
      const resumen = resumenesExpandidos(via, texto, entorno, contexto.valor);
      if (!resumen.exito) throw new Error(resumen.error.mensaje);
      expect(e.referencia.valoresAgentes[v.ruta[1]!][v.ruta[2]!]).toEqual({ tipo: "sustituido", sha256: resumen.valor[JSON.stringify(v.ruta)] });
    }
    const revisor = sustituidas.find(v => v.ruta.join("/") === "agent/revisor/description")!;
    expect(revisor.determinante.via).toBe("proyecto");
    expect(revisor.desplazadas).toContainEqual(expect.objectContaining({ via: "global", valor: "Global {env:RIGE_PRUEBA_GLOBAL}",
      sustituciones: [expect.objectContaining({ origen: "RIGE_PRUEBA_GLOBAL", definido: true })] }));
    expect(sustituidas.find(v => v.ruta[1] === "general")?.determinante.sustituciones![0]?.definido).toBe(false);
    sinContenido(JSON.stringify(r), e.marcas);
    const { cadenas, referencia, normalizar } = consultarCadenas("v3-sustituciones");
    expect(normalizar(cadenas.build!.reglas.map(r => ({ permission: r.sujeto, pattern: r.patron, action: r.efecto })))).toEqual(referencia.cadenas.build);
  });
});

describe("T3-04 R-12", () => {
  test("documento de HEAD anterior se recupera igual; ida y vuelta nueva sin releer el entorno", async () => {
    const e = preparar();
    expect(lanzar(e.raiz, ["esquema"], e.env).codigo).toBe(0);
    const repositorio = new RepositorioResolucionesSqlite(e.env.RIGE_ALMACEN!, { existe: existsSync }, versionRige);
    const anterior = JSON.parse(readFileSync(join(import.meta.dir, "../datos/resolucion-t3-03.json"), "utf8")) as Resolucion;
    expect(JSON.stringify(anterior)).not.toContain('"sustituciones"');
    const alta = repositorio.guardar(anterior, "2026-10-01T00:00:00.000Z");
    if (!alta.exito) throw new Error(alta.error.mensaje);
    expect(repositorio.leer(alta.valor)).toMatchObject({ exito: true, valor: { resolucion: anterior } });
    const servidor = await lanzarServidor(e.raiz, e.env);
    let original: unknown;
    try {
      expect((await solicitarLocal({ host: "127.0.0.1", puerto: servidor.puerto, ruta: `/resolver?proyecto=${encodeURIComponent(e.proyecto)}&agente=revisor` })).estado).toBe(303);
      const pagina = await solicitarLocal({ host: "127.0.0.1", puerto: servidor.puerto, ruta: "/resoluciones/2?agente=revisor" });
      original = datos(pagina.cuerpo);
      expect((original as any).valores.some((v: any) => v.rastro.determinante.sustituciones?.length)).toBe(true);
    } finally { await servidor.detener(); }
    writeFileSync(join(e.proyecto, "opencode.json"), "INVALIDO");
    e.env.RIGE_PRUEBA_CLAVE = '"';
    e.env.OPENCODE_CONFIG_CONTENT = "INVALIDO";
    const segundo = await lanzarServidor(e.raiz, e.env);
    try {
      const pagina = await solicitarLocal({ host: "127.0.0.1", puerto: segundo.puerto, ruta: "/resoluciones/2?agente=revisor" });
      expect(pagina.estado).toBe(200);
      expect(datos(pagina.cuerpo)).toEqual(original);
      for (const ruta of ["/resoluciones/1?agente=build", "/agentes?id=1"]) {
        const pagina = await solicitarLocal({ host: "127.0.0.1", puerto: segundo.puerto, ruta });
        expect(pagina.estado).toBe(200);
        if (ruta.startsWith("/resoluciones/")) {
          const esperada = respuestaValores(anterior, "build", undefined);
          if (!esperada.exito) throw new Error(esperada.error.mensaje);
          expect(datos(pagina.cuerpo)).toEqual(esperada.valor);
        }
      }
    } finally { await segundo.detener(); }
  });
});

describe("T3-04 R-6 almacen", () => {
  test("conserva las dos sustituciones de una exclusion despues de guardar y consultar", async () => {
    const e = preparar();
    const global = join(e.raiz, "hogar/.config/opencode/opencode.json");
    writeFileSync(global, '{"permission":{"read":"{env:RIGE_PRUEBA_GLOBAL}"}}');
    const archivo = join(e.proyecto, "opencode.json");
    const contenido = readFileSync(archivo, "utf8");
    writeFileSync(archivo, contenido.replace('"permission": {', '"permission": { "read": "{env:RIGE_PRUEBA_CLAVE}",'));
    expect(lanzar(e.raiz, ["esquema"], e.env).codigo).toBe(0);
    const servidor = await lanzarServidor(e.raiz, e.env);
    try {
      expect((await solicitarLocal({ host: "127.0.0.1", puerto: servidor.puerto,
        ruta: `/resolver?proyecto=${encodeURIComponent(e.proyecto)}&agente=revisor` })).estado).toBe(303);
      const repositorio = new RepositorioResolucionesSqlite(e.env.RIGE_ALMACEN!, { existe: existsSync }, versionRige);
      const guardada = repositorio.leer(1);
      if (!guardada.exito) throw new Error(guardada.error.mensaje);
      expect(guardada.valor.resolucion.noResueltas[0]!.sustituciones?.map(s => [s.origen, s.orden, s.referencia])).toEqual([
        ["RIGE_PRUEBA_GLOBAL", 1, global.replaceAll("\\", "/")], ["RIGE_PRUEBA_CLAVE", 2, archivo.replaceAll("\\", "/")],
      ]);
      for (const ruta of ["/resoluciones/1?agente=revisor", "/permiso?id=1&agente=build&sujeto=read&objetivo=a"]) {
        const pagina = await solicitarLocal({ host: "127.0.0.1", puerto: servidor.puerto, ruta });
        expect(pagina.estado).toBe(ruta.startsWith("/permiso") ? 422 : 200);
        if (ruta.startsWith("/permiso")) expect(pagina.cuerpo).toContain("sustitucion-no-incorporada");
        sinContenido(pagina.cuerpo, e.marcas);
      }
      expect(repositorio.leer(1)).toEqual(guardada);
    } finally { await servidor.detener(); }
  });
});
