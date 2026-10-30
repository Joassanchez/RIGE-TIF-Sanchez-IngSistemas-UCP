import { afterEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { copiarEscenario } from "../utilidades/escenario";
import { entornoDeReferencia } from "../utilidades/entorno-referencia";
import { consultarCadenas } from "../utilidades/cadenas";
import { lanzar, lanzarServidor } from "../utilidades/subproceso";
import { solicitarLocal } from "../utilidades/cliente-http-local";
import { validarEsquema } from "../utilidades/validar-esquema";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";
import { resolver } from "../../paquetes/nucleo/resolucion/resolver";
import { crearResolucionGuardadaAnterior } from "../utilidades/resolucion-guardada";
import { crearInstalacionOpenCode } from "../utilidades/instalacion-opencode";

const limpiezas: (() => void)[] = [];
afterEach(() => { for (const limpiar of limpiezas.splice(0).reverse()) limpiar(); });
function preparar(nombre = "v3-entradas") {
  const referencia = JSON.parse(readFileSync(join(import.meta.dir, "../escenarios", nombre, "REFERENCIA.json"), "utf8"));
  const copia = copiarEscenario(nombre, { git: referencia.procedencia.git ?? "raiz" });
  limpiezas.push(copia.borrar);
  return { ...copia, referencia, env: entornoDeReferencia(referencia, copia) };
}
function cli(escenario: ReturnType<typeof preparar>, comando = "entradas", opciones: string[] = []) {
  return lanzar(escenario.raiz, [comando, "--proyecto", escenario.proyecto, ...opciones], escenario.env);
}
function analizar(escenario: ReturnType<typeof preparar>) {
  const entorno = new EntornoLecturaSistema({ plataforma: process.platform, entorno: escenario.env });
  const contexto = adaptadorOpenCode.contexto(escenario.proyecto, entorno);
  if (!contexto.exito) throw new Error(contexto.error.mensaje);
  const resultado = resolver(adaptadorOpenCode, escenario.proyecto, entorno, contexto.valor);
  if (!resultado.exito) throw new Error(resultado.error.mensaje);
  return resultado.valor;
}
function datos(cuerpo: string) {
  const bloque = cuerpo.match(/<script type="application\/json" id="respuesta">([^]*?)<\/script>/);
  expect(bloque).not.toBeNull();
  return JSON.parse(bloque![1]!);
}
async function validar(nombre: string, valor: unknown) {
  const esquema = await Bun.file(join(import.meta.dir, `../../esquemas/salida/${nombre}.json`)).json();
  expect(validarEsquema(esquema, valor)).toEqual([]);
}
function cadena(nombre: string) {
  const { cadenas, referencia, normalizar } = consultarCadenas(nombre);
  expect(normalizar(cadenas.build!.reglas.map(r => ({ permission: r.sujeto, pattern: r.patron, action: r.efecto }))))
    .toEqual(referencia.cadenas.build);
}

describe("T3-03 R-5", () => {
  test("CLI determinista, opciones, contexto, advertencias y sin crear almacen", async () => {
    const escenario = preparar();
    const primera = cli(escenario);
    expect(primera.codigo).toBe(0);
    expect(primera.error).toBe("");
    expect(cli(escenario)).toEqual(primera);
    await validar("entradas", JSON.parse(primera.salida));
    expect(existsSync(escenario.env.RIGE_ALMACEN!)).toBe(false);
    for (const opciones of [["--agente", "build"], ["--explicar"], ["--clave", "x"]]) expect(cli(escenario, "entradas", opciones).codigo).toBe(2);
    expect(lanzar(escenario.raiz, ["entradas"], escenario.env).codigo).toBe(2);
    escenario.env.OPENCODE_DISABLE_PROJECT_CONFIG = "true";
    expect(JSON.parse(cli(escenario).error).error.codigo).toBe("via-no-soportada");
    delete escenario.env.OPENCODE_DISABLE_PROJECT_CONFIG;
    const sinProyecto = lanzar(escenario.raiz, ["entradas", "--proyecto", join(escenario.raiz, "ausente")], escenario.env);
    expect(sinProyecto.codigo).toBe(1);
    expect(JSON.parse(sinProyecto.error).error.codigo).toBe("proyecto-inexistente");
    const instalacion = join(escenario.raiz, "version-no-soportada");
    crearInstalacionOpenCode(instalacion, "1.18.24");
    escenario.env.PATH = instalacion;
    const version = cli(escenario);
    expect(version.codigo).toBe(1);
    expect(JSON.parse(version.error).error.codigo).toBe("version-no-soportada");
    escenario.env.PATH = join(escenario.raiz, "sin-ejecutable");
    const advertida = cli(escenario);
    expect(advertida.codigo).toBe(0);
    expect(JSON.parse(advertida.salida).declaraciones).toContain("version-no-determinada");
    expect(advertida.error).toContain('"codigo":"version-no-determinada"');
    escenario.env.OPENCODE_CONFIG_CONTENT = '{"agent":{env:X}}';
    expect(JSON.parse(cli(escenario).error).error.codigo).toBe("contenido-no-soportado");
    escenario.env.OPENCODE_CONFIG_CONTENT = '{}';
    writeFileSync(join(escenario.raiz, "dir-variable/command/hola.md"), '---\nname: otro\n---\nHola');
    expect(JSON.parse(cli(escenario).error).error.codigo).toBe("via-no-soportada");
  });
});

describe("T3-03 R-6", () => {
  test("web presenta el mismo objeto y escapa las referencias con seguridad en la ruta", async () => {
    const escenario = preparar();
    expect(lanzar(escenario.raiz, ["esquema"], escenario.env).codigo).toBe(0);
    const rutaMaliciosa = join(escenario.raiz, "dir-variable/command/<script>.md");
    // Windows no admite < en nombres: el texto del error y las plantillas se verifican tambien en sus unitarias.
    if (process.platform !== "win32") writeFileSync(rutaMaliciosa, "Comando");
    const servidor = await lanzarServidor(escenario.raiz, escenario.env);
    try {
      const ruta = `/entradas?proyecto=${encodeURIComponent(escenario.proyecto)}`;
      const solicitar = (opciones: object = {}) => solicitarLocal({ host: "127.0.0.1", puerto: servidor.puerto, ruta, ...opciones });
      const pagina = await solicitar();
      expect(pagina.estado).toBe(200);
      expect(datos(pagina.cuerpo)).toEqual(JSON.parse(cli(escenario).salida));
      expect(pagina.cuerpo).not.toContain("<script>.md");
      for (const sitio of ["cross-site", "same-site"]) expect((await solicitar({ cabeceras: { "Sec-Fetch-Site": sitio } })).estado).toBe(403);
      expect((await solicitar({ metodo: "POST" })).estado).toBe(405);
      expect((await solicitar({ cabeceras: { Host: "ajeno.example" } })).estado).toBe(403);
    } finally { await servidor.detener(); }
  });
});

describe("RF-04 CA-1 T3-03 R-7", () => {
  test("siete tipos con precedencia, variables sin resumen individual y oraculos nativos", async () => {
    const escenario = preparar();
    const recibida = cli(escenario);
    expect(recibida.codigo).toBe(0);
    const respuesta = JSON.parse(recibida.salida);
    await validar("entradas", respuesta);
    expect(respuesta.entradas.map((e: any) => e.orden)).toEqual(respuesta.entradas.map((_: any, i: number) => i));
    const entradas = respuesta.entradas.filter((e: any) => e.condicion !== "no_observada");
    expect(entradas.map((e: any) => e.via)).toEqual(["global", "variable-config", "proyecto", "directorio-opencode", "markdown", "markdown", "markdown",
      "directorio-opencode", "markdown", "markdown", "variable-contenido", "variable-permiso"]);
    for (const entrada of entradas) {
      expect(entrada.legibilidad).toBe("legible");
      expect(entrada.condicion).toBe(entrada.via.startsWith("variable-") && entrada.via !== "variable-config" ? "definida" : "observada");
      if (entrada.condicion === "definida") expect(entrada.resumen).toBeNull();
      else expect(entrada.resumen).toMatch(/^[a-f0-9]{64}$/);
    }
    const resolucion = analizar(escenario);
    expect(resolucion.noResueltas.filter(r => r.ruta[0] === "command" && r.regla === "markdown-no-observado").map(r => r.ruta[1]).sort())
      .toEqual(escenario.referencia.comandos);
    expect(resolucion.valores.find(v => v.ruta.join("/") === "agent/build/description")?.valor).toBe("d-contenido");
    expect(resolucion.valores.find(v => v.ruta.join("/") === "agent/build/description")?.valor).toBe(escenario.referencia.valoresAgentes.build.description);
    cadena("v3-entradas");
  });
});

describe("RF-04 CA-2 T3-03 R-8", () => {
  test("solo el JSON sembrado es ilegible y el analisis falla en el archivo del binario", () => {
    const escenario = preparar("v3-entradas-ilegible");
    const recibida = cli(escenario);
    expect(recibida.codigo).toBe(0);
    const entradas = JSON.parse(recibida.salida).entradas;
    const ilegibles = entradas.filter((e: any) => e.legibilidad === "ilegible");
    expect(ilegibles).toHaveLength(1);
    expect(ilegibles[0].referencia).toBe(join(escenario.raiz, escenario.referencia.falla.archivo).replaceAll("\\", "/"));
    expect(ilegibles[0].error).toEqual({ linea: 7, columna: 3, consecuencia: "falla" });
    expect(entradas.filter((e: any) => e.condicion !== "no_observada" && e !== ilegibles[0]).every((e: any) => e.legibilidad === "legible")).toBe(true);
    const analisis = cli(escenario, "agentes");
    expect(analisis.codigo).toBe(1);
    expect(JSON.parse(analisis.error).error.codigo).toBe("entrada-ilegible");
    expect(analisis.error).toContain(ilegibles[0].referencia);
  });
});

describe("T3-03 R-9", () => {
  test("permiso invalido descartado por RIGE y el binario, visible tambien en analisis", () => {
    const escenario = preparar("v3-permiso-invalido");
    for (const comando of ["entradas", "agentes"]) {
      const recibida = cli(escenario, comando);
      expect(recibida.codigo).toBe(0);
      expect(JSON.parse(recibida.salida).entradas.at(-1)).toMatchObject({ via: "variable-permiso", legibilidad: "ilegible", error: { consecuencia: "descartada" } });
    }
    cadena("v3-permiso-invalido");
  });
});

describe("T3-03 R-10", () => {
  test("todas las salidas v2 conservan la formula anterior del resumen y validan los esquemas ampliados", async () => {
    const raiz = join(import.meta.dir, "../escenarios");
    for (const nombre of readdirSync(raiz).filter(n => n.startsWith("v2-") && existsSync(join(raiz, n, "REFERENCIA.json")))) {
      const escenario = preparar(nombre);
      const resolucion = analizar(escenario);
      const texto = JSON.stringify(resolucion.entradas.map(e => [e.via, e.referencia, e.condicion, e.resumen]));
      expect(resolucion.resumenEntradas).toBe(createHash("sha256").update(texto).digest("hex"));
      for (const [comando, opciones] of [["agentes", []], ["valores", ["--agente", "build"]], ["permiso", ["--agente", "build", "--sujeto", "bash", "--objetivo", "ls"]]] as const) {
        const respuesta = cli(escenario, comando, [...opciones]);
        expect(respuesta.codigo).toBe(0);
        await validar(comando, JSON.parse(respuesta.salida));
        expect(JSON.parse(respuesta.salida).resumenEntradas).toBe(resolucion.resumenEntradas);
      }
    }
  }, 30000);
  test("solo lectura, huella sensible a comentarios y sin texto crudo en salidas ni almacen", async () => {
    const escenario = preparar();
    const capturar = () => Object.fromEntries([...new Bun.Glob("**/*").scanSync({ cwd: escenario.raiz, dot: true, onlyFiles: true })]
      .sort().map(ruta => [ruta, createHash("sha256").update(readFileSync(join(escenario.raiz, ruta))).digest("hex")]));
    const antes = capturar();
    const primera = cli(escenario);
    expect(primera.codigo).toBe(0);
    expect(capturar()).toEqual(antes);
    const resumen = JSON.parse(primera.salida).resumenEntradas;
    const marca = "MARCA-T303-COMENTARIO-7f3c19a4";
    for (const [comando, opciones] of [["entradas", []], ["agentes", []], ["valores", ["--agente", "build"]], ["permiso", ["--agente", "build", "--sujeto", "bash", "--objetivo", "ls"]]] as const) {
      const resultado = cli(escenario, comando, [...opciones, "--depurar"]);
      expect(resultado.codigo).toBe(0);
      expect(resultado.salida + resultado.error).not.toContain(marca);
    }
    escenario.env.OPENCODE_CONFIG_CONTENT += "\n// otro comentario";
    expect(JSON.parse(cli(escenario).salida).resumenEntradas).not.toBe(resumen);
    expect(lanzar(escenario.raiz, ["esquema"], escenario.env).codigo).toBe(0);
    const servidor = await lanzarServidor(escenario.raiz, escenario.env);
    try {
      for (const ruta of [`/entradas?proyecto=${encodeURIComponent(escenario.proyecto)}`, `/resolver?proyecto=${encodeURIComponent(escenario.proyecto)}&agente=build`, "/resoluciones/1?agente=build"]) {
        const pagina = await solicitarLocal({ host: "127.0.0.1", puerto: servidor.puerto, ruta });
        expect(pagina.cuerpo).not.toContain(marca);
        expect([200, 303]).toContain(pagina.estado);
      }
    } finally { await servidor.detener(); }
    for (const ruta of new Bun.Glob("**/*").scanSync({ cwd: escenario.env.RIGE_ALMACEN!, onlyFiles: true }))
      expect(readFileSync(join(escenario.env.RIGE_ALMACEN!, ruta)).includes(Buffer.from(marca))).toBe(false);
    escenario.env.OPENCODE_CONFIG_CONTENT += '\n "invalido":';
    const error = cli(escenario, "agentes", ["--depurar"]);
    expect(error.codigo).toBe(1);
    expect(error.error + error.salida).not.toContain(marca);
  });
  test("documento v2 sin campos nuevos se recupera sin leer el entorno actual y conserva la huella", async () => {
    const escenario = preparar("v2-decision");
    const original = cli(escenario, "agentes");
    expect(original.codigo).toBe(0);
    const respuesta = JSON.parse(original.salida);
    expect(respuesta.entradas.every((e: object) => !('legibilidad' in e) && !('error' in e))).toBe(true);
    const texto = JSON.stringify(respuesta.entradas.map((e: any) => [e.via, e.referencia, e.condicion, e.resumen]));
    expect(respuesta.resumenEntradas).toBe(createHash("sha256").update(texto).digest("hex"));
    await validar("agentes", respuesta);
    expect(lanzar(escenario.raiz, ["esquema"], escenario.env).codigo).toBe(0);
    let servidor = await lanzarServidor(escenario.raiz, escenario.env);
    try {
      const alta = await solicitarLocal({ host: "127.0.0.1", puerto: servidor.puerto, ruta: `/resolver?proyecto=${encodeURIComponent(escenario.proyecto)}&agente=build` });
      expect(alta.estado).toBe(303);
    } finally { await servidor.detener(); }
    const id = crearResolucionGuardadaAnterior(escenario.env.RIGE_ALMACEN!, 1);
    escenario.env.OPENCODE_CONFIG_CONTENT = 'INVALIDO';
    servidor = await lanzarServidor(escenario.raiz, escenario.env);
    try {
      const pagina = await solicitarLocal({ host: "127.0.0.1", puerto: servidor.puerto, ruta: `/agentes?id=${id}` });
      expect(pagina.estado).toBe(200);
      expect(datos(pagina.cuerpo)).toEqual(respuesta);
    } finally { await servidor.detener(); }
  });
});
