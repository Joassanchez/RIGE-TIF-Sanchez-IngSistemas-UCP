import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { prepararConsultas } from "../utilidades/consultas-cli";
import { lanzar, lanzarServidor } from "../utilidades/subproceso";
import { solicitarPaginaLocal as solicitarLocal } from "../aceptacion/seguir-redireccion";
import { type SolicitudLocal } from "../utilidades/cliente-http-local";
import { validarEsquema } from "../utilidades/validar-esquema";
import { crearEntornoAislado } from "../utilidades/entorno-aislado";
import { capturarRegresionT512 } from "../utilidades/regresion-t5-12";
import type { RespuestaComparacion } from "../../paquetes/rige/aplicacion/respuestas/contrato-generado";
import { RepositorioResolucionesSqlite } from "../../paquetes/rige/adaptadores/almacen-sqlite/resoluciones";
import { versionRige } from "../../paquetes/rige/aplicacion/respuestas/estado";
import { compararResoluciones } from "../../paquetes/rige/aplicacion/casos-uso/comparar-resoluciones";
import { consultarProyectosRecientes } from "../../paquetes/rige/aplicacion/casos-uso/consultar-proyectos-recientes";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { crearEntornoMemoria } from "../utilidades/entorno-memoria";

const limpiezas: (() => void)[] = [];
afterEach(() => { for (const limpiar of limpiezas.splice(0).reverse()) limpiar(); });
const escapar = (s: string) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
function datos(cuerpo: string): RespuestaComparacion {
  const bloques = [...cuerpo.matchAll(/<script type="application\/json" id="respuesta">([^]*?)<\/script>/g)];
  expect(bloques).toHaveLength(1);
  return JSON.parse(bloques[0]![1]!);
}
function preparar() {
  const e = prepararConsultas("v1-precedencia");
  limpiezas.push(e.borrar);
  return { ...e, cli: (argumentos: string[], variables: Record<string, string> = {}) => lanzar(e.raiz, argumentos, { ...e.variables, ...variables }) };
}
type Escenario = ReturnType<typeof preparar>;
async function conWeb(probar: (e: Escenario, pedir: (ruta: string, opciones?: Omit<SolicitudLocal, "host" | "puerto" | "ruta">) => ReturnType<typeof solicitarLocal>,
  guardar: (proyecto?: string) => Promise<string>) => Promise<void>, variables: Record<string, string> = {}) {
  const e = preparar();
  Object.assign(e.variables, variables);
  const servidor = await lanzarServidor(e.raiz, e.variables);
  const pedir = (ruta: string, opciones = {}) => solicitarLocal({ host: "127.0.0.1", puerto: servidor.puerto, ruta, ...opciones });
  const guardar = async (proyecto = e.proyecto) => {
    const r = await pedir(`/resolver?proyecto=${encodeURIComponent(proyecto)}`);
    expect(r.estado).toBe(303);
    return /\/resoluciones\/(\d+)/.exec(String(r.cabeceras.location))![1]!;
  };
  try { await probar(e, pedir, guardar); } finally { await servidor.detener(); }
}

describe("T5-14 K-1", () => {
  test("listado real de cada foto: nativos comunes, disable confirmado y Markdown no observado", async () => {
    await conWeb(async (e, pedir, guardar) => {
      const archivo = join(e.proyecto, "opencode.jsonc");
      writeFileSync(archivo, '{"agent":{"auxiliar":{"description":"Auxiliar"}}}');
      const desde = await guardar();
      writeFileSync(archivo, '{"agent":{"auxiliar":{"disable":true},"nuevo":{"mode":"primary"}}}');
      const agentes = join(e.proyecto, ".opencode", "agents");
      mkdirSync(agentes, { recursive: true });
      writeFileSync(join(agentes, "incierto.md"), "---\ndescription: No observado\n---\nInstrucciones\n");
      const hasta = await guardar();
      const pagina = await pedir(`/comparar?desde=${desde}&hasta=${hasta}`);
      expect(pagina.estado).toBe(200);
      const r = datos(pagina.cuerpo);
      expect(r.agentes.comunes).toContain("build");
      expect(r.agentes.quitados).toEqual(["auxiliar"]);
      expect(r.agentes.agregados).toEqual(["nuevo"]);
      expect(r.agentes.inciertos).toEqual(["incierto"]);
      expect(r.parcial).toBe(true);
      expect(r.hasta.noComparables).toContainEqual({ ruta: ["agent", "incierto"], regla: "markdown-no-observado" });
      expect(r.hasta.motivosAgentes).toContain("markdown-no-observado");
    });
  });
});

describe("T5-14 K-2", () => {
  test("dos fotos reales: temperature, agente nuevo, enlaces, direccion, filtro y paridad integra CLI/web", async () => {
    await conWeb(async (e, pedir, guardar) => {
      const desde = await guardar();
      const archivo = join(e.proyecto, "opencode.jsonc");
      writeFileSync(archivo, readFileSync(archivo, "utf8").replace('"temperature": 0.3', '"temperature": 0.7'));
      writeFileSync(join(e.proyecto, "opencode.json"), '{"agent":{"nuevo":{"description":"Nuevo"}}}');
      const hasta = await guardar();
      const ruta = `/comparar?desde=${desde}&hasta=${hasta}`;
      const cli = e.cli(["comparar", "--desde", desde, "--hasta", hasta]);
      expect(cli.codigo).toBe(0); expect(cli.error).toBe("");
      const pagina = await pedir(ruta);
      expect(pagina.estado).toBe(200);
      const r = datos(pagina.cuerpo);
      expect(r).toEqual(JSON.parse(cli.salida));
      expect(r.proyecto).toBe(realpathSync.native(e.proyecto).replaceAll("\\", "/"));
      expect(r.agentes.agregados).toEqual(["nuevo"]);
      expect(r.comparaciones.find(a => a.agente === "build")!.cambios).toContainEqual(expect.objectContaining({
        ruta: ["temperature"], tipo: "cambiada", motivos: ["valor"], antes: expect.objectContaining({ valor: 0.3 }), despues: expect.objectContaining({ valor: 0.7 }),
      }));
      for (const texto of ["Agentes agregados", "nuevo", "Antes", "Después", "temperature", "insignia--pregunta"]) expect(pagina.cuerpo).toContain(texto);
      const filtrada = await pedir(ruta + "&agente=build");
      expect(datos(filtrada.cuerpo)).toEqual(r);
      const cliFiltro = e.cli(["comparar", "--desde", desde, "--hasta", hasta, "--agente", "build"]);
      expect(cliFiltro).toEqual(cli);
      const a = r.comparaciones.find(a => a.agente === "build")!;
      for (const [cantidad, singular, plural] of [
        [a.resumen.cambiadas, "cambio", "cambios"], [a.resumen.agregadas, "clave nueva", "claves nuevas"], [a.resumen.quitadas, "quitada", "quitadas"],
      ] as const) expect(filtrada.cuerpo).toContain(`>${cantidad} ${cantidad === 1 ? singular : plural}</span>`);
      for (const id of [hasta, desde]) {
        const resumen = await pedir(`/resoluciones/${id}`);
        expect(resumen.estado).toBe(200);
        expect(resumen.cuerpo).toContain(`href="${escapar(`/comparar?desde=${desde}&hasta=${hasta}`)}">Comparar con el anterior`);
        expect(resumen.cuerpo).toContain(`href="/resoluciones/${id}" aria-current="page"`);
      }
      const igual = await pedir(`/comparar?desde=${desde}&hasta=${desde}`);
      expect(igual.cuerpo).toContain("Sin cambios entre las dos fotos");
      expect(datos(igual.cuerpo).resumen.cambiadas).toBe(0);
      const inversa = datos((await pedir(`/comparar?desde=${hasta}&hasta=${desde}`)).cuerpo);
      expect(inversa.agentes.quitados).toEqual(["nuevo"]);
      const esquema = await Bun.file(new URL("../../esquemas/salida/comparacion.json", import.meta.url)).json();
      expect(validarEsquema(esquema, r)).toEqual([]);
    });
  });
});

describe("T5-14 K-3", () => {
  test("inicio vacio sin lista ni scripts, recientes con ultima foto y analizar sin agente", async () => {
    await conWeb(async (e, pedir, guardar) => {
      const vacio = await pedir("/");
      expect(vacio.estado).toBe(200);
      expect(vacio.cuerpo).toContain("Ingresá la carpeta de un proyecto y pulsá Analizar");
      expect(vacio.cuerpo).not.toContain('<ul class="recientes">');
      expect(e.cli(["recientes"])).toMatchObject({ codigo: 0, error: "", salida: '{"esquema":2,"proyectos":[]}\n' });
      await guardar();
      const archivo = join(e.proyecto, "opencode.jsonc");
      writeFileSync(archivo, readFileSync(archivo, "utf8").replace('"temperature": 0.3', '"temperature": 0.4'));
      const id = await guardar();
      const pagina = await pedir("/");
      expect(pagina.cuerpo).toContain("Proyectos recientes");
      expect(pagina.cuerpo).not.toContain("<script");
      expect(pagina.cuerpo).toContain(`href="/resoluciones/${id}"`);
      expect(pagina.cuerpo).toContain("Analizar de nuevo");
      expect(pagina.cuerpo).toContain(escapar(`/resolver?proyecto=${encodeURIComponent(realpathSync.native(e.proyecto).replaceAll("\\", "/"))}`));
      const cli = e.cli(["recientes"]);
      expect(cli.codigo).toBe(0);
      const recientes = JSON.parse(cli.salida);
      expect(recientes.proyectos).toEqual([{ proyecto: realpathSync.native(e.proyecto).replaceAll("\\", "/"), id: Number(id), instante: expect.any(String), cantidad: 2 }]);
      const esquema = await Bun.file(new URL("../../esquemas/salida/proyectos-recientes.json", import.meta.url)).json();
      expect(validarEsquema(esquema, recientes)).toEqual([]);
    });
  });
});

describe("T5-14 K-4", () => {
  test("consultas con guardar y entorno que fallan, entradas actuales invalidadas, SQLite y documentos identicos; reinicio", async () => {
    let primerCuerpo = "", ultimoId = "";
    const e = preparar();
    let servidor = await lanzarServidor(e.raiz, e.variables);
    try {
      const alta = async () => {
        const r = await solicitarLocal({ host: "127.0.0.1", puerto: servidor.puerto, ruta: `/resolver?proyecto=${encodeURIComponent(e.proyecto)}` });
        expect(r.estado).toBe(303);
        return /\/resoluciones\/(\d+)/.exec(String(r.cabeceras.location))![1]!;
      };
      const desde = await alta();
      const archivo = join(e.proyecto, "opencode.jsonc");
      writeFileSync(archivo, readFileSync(archivo, "utf8").replace('"temperature": 0.3', '"temperature": 0.4'));
      ultimoId = await alta();
      const pagina = () => solicitarLocal({ host: "127.0.0.1", puerto: servidor.puerto, ruta: `/resoluciones/${ultimoId}?agente=build` });
      primerCuerpo = (await pagina()).cuerpo;
      const base = join(e.variables.RIGE_ALMACEN!, "rige.db"), antes = readFileSync(base);
      writeFileSync(join(e.proyecto, "opencode.jsonc"), "INVALIDADO");
      const entradaAntes = readFileSync(join(e.proyecto, "opencode.jsonc"));
      const no = (): never => { throw new Error("No guardar ni leer las entradas actuales"); };
      const repo = new RepositorioResolucionesSqlite(e.variables.RIGE_ALMACEN!, { existe: existsSync }, versionRige);
      const puerto = { guardar: no, leer: repo.leer.bind(repo), listar: no, listarProyectosRecientes: repo.listarProyectosRecientes.bind(repo) };
      const memoria = crearEntornoMemoria({ archivos: {} });
      const r = compararResoluciones({ resoluciones: puerto, adaptador: adaptadorOpenCode, rutas: { canonica: no },
        entorno: { ...memoria, leer: no, variable: no, tipo: no, real: no, examinar: no, listar: no } }, desde, ultimoId);
      expect(r.exito).toBe(true);
      expect(consultarProyectosRecientes(puerto).exito).toBe(true);
      expect(e.cli(["comparar", "--desde", desde, "--hasta", ultimoId]).codigo).toBe(0);
      expect(e.cli(["recientes"]).codigo).toBe(0);
      expect(readFileSync(base)).toEqual(antes);
      expect(readFileSync(join(e.proyecto, "opencode.jsonc"))).toEqual(entradaAntes);
      expect((await pagina()).cuerpo).toBe(primerCuerpo);
      await servidor.detener();
      servidor = await lanzarServidor(e.raiz, e.variables);
      expect((await pagina()).cuerpo).toBe(primerCuerpo);
    } finally { await servidor.detener(); }
  });
  test("valores y permiso identicos a d814418 sin dependencia del almacen", () => {
    const congelado = JSON.parse(readFileSync(new URL("../datos/salidas-d814418-t5-14.json", import.meta.url), "utf8"));
    // El mapa de vias de entradas depende de los ancestros del temporal; T5-14
    // congela los comandos valores y permiso completos, sin normalizaciones adicionales.
    const casos = capturarRegresionT512().casos.filter(c => c.argumentos[0] !== "entradas");
    expect(casos).toEqual(congelado.casos);
  });
});

describe("T5-14 K-5", () => {
  test("ids invalidos e inexistentes, proyectos distintos, almacen ausente, CLI 0/1/2 y error web", async () => {
    const ausente = preparar();
    for (const args of [["recientes"], ["recientes", "--proyecto", ausente.proyecto], ["comparar"], ["comparar", "--desde", "1", "--hasta", "2"]]) {
      const r = ausente.cli(args);
      expect(r.codigo).toBe(1); expect(r.salida).toBe("");
      expect(JSON.parse(r.error)).toMatchObject({ esquema: 2, error: { codigo: "almacen-sin-esquema" } });
      expect(existsSync(ausente.variables.RIGE_ALMACEN!)).toBe(false);
    }
    const proyAusente = ausente.cli(["recientes", "--proyecto", join(ausente.raiz, "inexistente")]);
    expect(proyAusente.codigo).toBe(1); expect(proyAusente.salida).toBe("");
    expect(JSON.parse(proyAusente.error)).toMatchObject({ esquema: 2, error: { codigo: "proyecto-inexistente" } });
    for (const args of [["comparar", "--desde", "1"], ["comparar", "--hasta", "2"], ["comparar", "--desde", "x", "--hasta", "1"], ["comparar", "--desde", "1", "--hasta", "2", "--agente", " "], ["recientes", "--proyecto", ""], ["recientes", "--tiempos"]]) {
      const r = ausente.cli(args);
      expect(r.codigo).toBe(2); expect(r.salida).toBe("");
    }
    await conWeb(async (e, pedir, guardar) => {
      const id = await guardar();
      const otro = preparar(); const ajeno = await guardar(otro.proyecto);
      for (const [ruta, estado, codigo] of [[`/comparar?desde=${id}&hasta=${ajeno}`, 422, "resoluciones-de-otro-proyecto"],
        [`/comparar?desde=${id}&hasta=999`, 404, "resolucion-inexistente"], ["/comparar?desde=-1&hasta=1", 400, "solicitud-invalida"],
        ["/comparar?desde=1&hasta=9007199254740992", 400, "solicitud-invalida"], ["/comparar?desde=1&hasta=1&agente=", 400, "solicitud-invalida"]] as const) {
        const r = await pedir(ruta); expect(r.estado).toBe(estado); expect(r.cuerpo).toContain(codigo);
      }
      for (const hasta of [ajeno, "999"]) {
        const cli = e.cli(["comparar", "--desde", id, "--hasta", hasta]);
        expect(cli.codigo).toBe(1); expect(cli.salida).toBe("");
      }
    });
  });
  test("falla interna de lectura: CLI 70, stack solo con depurar, precarga independiente de unidad", () => {
    const e = preparar();
    const precarga = join(e.raiz, "falla.ts");
    writeFileSync(precarga, `import { mock } from "bun:test";
      const fs = await import("node:fs");
      mock.module("node:fs", () => ({ ...fs, existsSync: () => { throw new Error("FALLO-T514"); } }));`);
    for (const argumentos of [["recientes"], ["comparar", "--desde", "1", "--hasta", "2"]]) for (const depurar of [false, true]) {
      const p = Bun.spawnSync([process.execPath, "--preload", precarga, "paquetes/rige/arranque/rige.ts", ...argumentos, ...(depurar ? ["--depurar"] : [])],
        { cwd: resolve(import.meta.dir, "../.."), env: { ...crearEntornoAislado(e.raiz, process.env), ...e.variables }, stdout: "pipe", stderr: "pipe" });
      expect(p.exitCode).toBe(70); expect(p.stdout.toString()).toBe("");
      const error = JSON.parse(p.stderr.toString());
      expect(error).toMatchObject({ esquema: 2, error: { codigo: "interno" } });
      expect(error.error.stack !== undefined).toBe(depurar);
    }
  });
  test("origen y metodo protegen comparar e inicio, CSP, Allow y sin CORS", async () => {
    await conWeb(async (_e, pedir) => {
      for (const ruta of ["/comparar?desde=1&hasta=2", "/"]) {
        for (const cabeceras of [{ Host: "ajeno" }, ...["cross-site", "same-site"].map(s => ({ "Sec-Fetch-Site": s }))]) {
          const r = await pedir(ruta, { cabeceras });
          expect(r.estado).toBe(403); expect(r.cuerpo).not.toContain("rige.db");
          expect(r.cabeceras["access-control-allow-origin"]).toBeUndefined();
        }
        for (const metodo of ["POST", "PUT", "DELETE", "HEAD", "OPTIONS"]) {
          const r = await pedir(ruta, { metodo }); expect(r.estado).toBe(405); expect(r.cabeceras.allow).toBe("GET");
        }
      }
      expect((await pedir("/")).cabeceras["content-security-policy"]).toBe("default-src 'none'; style-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    });
  });
  test("escape de ambos valores, claves, agentes y referencias; sustituciones protegidas y parcial", async () => {
    const marca = "SECRETO-T514-NO-PERSISTIR-8B33";
    await conWeb(async (e, pedir, guardar) => {
      const hostil = ' & "# espacio </script><script>', agente = "a" + hostil, clave = "k" + hostil;
      const config = (v: string) => JSON.stringify({ agent: { [agente]: { options: { [clave]: v }, prompt: "{env:RIGE_SECRETO}" } } });
      const archivo = join(e.proyecto, "opencode.jsonc");
      writeFileSync(archivo, config("antes" + hostil)); const desde = await guardar();
      writeFileSync(archivo, config("despues" + hostil)); const hasta = await guardar();
      const pagina = await pedir(`/comparar?desde=${desde}&hasta=${hasta}&agente=${encodeURIComponent(agente)}`);
      expect(pagina.estado).toBe(200);
      const r = datos(pagina.cuerpo);
      expect(pagina.cuerpo).toContain(escapar(agente));
      for (const t of [clave, "antes" + hostil, "despues" + hostil]) expect(pagina.cuerpo).toContain(escapar(JSON.stringify(t)));
      expect(pagina.cuerpo.match(/<script\b/g)).toHaveLength(1);
      expect(pagina.cuerpo).toContain("\\u003c/script>");
      expect(pagina.cuerpo).not.toMatch(/style=|\son\w+=|(?:src|href)="https?:/i);
      expect(r.sustituciones).toBe("solo-representacion-protegida");
      expect(pagina.cuerpo).toContain("representación protegida");
      const cli = e.cli(["comparar", "--desde", desde, "--hasta", hasta, "--depurar"]);
      expect(cli.codigo).toBe(0); expect(JSON.parse(cli.salida)).toEqual(r);
      expect(cli.salida + cli.error + pagina.cuerpo).not.toContain(marca);
      writeFileSync(archivo, '{"agent":{"build":{"permission":{"{env:RIGE_SUJETO}":"deny"}}}}');
      const parcial = await guardar();
      const igual = await pedir(`/comparar?desde=${parcial}&hasta=${parcial}`);
      expect(datos(igual.cuerpo).parcial).toBe(true);
      expect(igual.cuerpo).toContain("Sin cambios en las claves comparables; comparación parcial");
      for (const ruta of new Bun.Glob("**/*").scanSync({ cwd: e.variables.RIGE_ALMACEN!, onlyFiles: true }))
        expect(readFileSync(join(e.variables.RIGE_ALMACEN!, ruta)).includes(Buffer.from(marca))).toBe(false);
    }, { RIGE_SECRETO: marca, RIGE_SUJETO: marca });
  });
});

describe("T5-14 K-6", () => {
  test("manual y comandos documentados como capacidades adicionales en ejecucion y verificacion", () => {
    for (const archivo of ["README.md", "MANUAL.md"]) {
      const texto = readFileSync(new URL(`../../${archivo}`, import.meta.url), "utf8");
      expect(texto).toContain("comparar --desde"); expect(texto).toContain("rige -- recientes");
      expect(texto).toContain("Proyectos recientes");
      expect(texto).toMatch(/\| Capacidad adicional[^\n]*comparar/);
    }
    const manual = readFileSync(new URL("../../MANUAL.md", import.meta.url), "utf8");
    for (const n of [6, 8]) expect(manual.split(`## ${n}.`)[1]!.split(`## ${n + 1}.`)[0]).toContain("comparar");
  });
});

describe("T6-19 CLI-16 y CLI-08", () => {
  test("H-1 H-2 H-5: hallazgos --estricto sale con 3 solo cuando hay hallazgos y --help documenta el codigo 3", () => {
    const e = preparar();
    const ayuda = e.cli(["--help"]);
    expect(ayuda.codigo).toBe(0);
    expect(ayuda.salida).toContain("3   hallazgos detectados con --estricto");

    const limpio = join(e.raiz, "limpio");
    mkdirSync(limpio, { recursive: true });
    writeFileSync(join(limpio, "opencode.jsonc"), '{"agent":{"build":{"model":"m"}}}');
    const normalLimpio = e.cli(["hallazgos", "--proyecto", limpio]);
    const estrictoLimpio = e.cli(["hallazgos", "--proyecto", limpio, "--estricto"]);
    expect(normalLimpio.codigo).toBe(0);
    expect(estrictoLimpio).toEqual(normalLimpio);

    const archivo = join(e.proyecto, "opencode.jsonc");
    writeFileSync(archivo, '{"agent":{"build":{"prompt":"{env:VARIABLE_INEXISTENTE_T619}"}}}');
    const normalCon = e.cli(["hallazgos", "--proyecto", e.proyecto]);
    const estrictoCon = e.cli(["hallazgos", "--proyecto", e.proyecto, "--estricto"]);
    expect(normalCon.codigo).toBe(0);
    expect(JSON.parse(normalCon.salida).hallazgos.length).toBeGreaterThan(0);
    expect(estrictoCon.codigo).toBe(3);
    expect(estrictoCon.salida).toBe(normalCon.salida);
    expect(estrictoCon.error).toBe("");

    const estrictoTexto = e.cli(["hallazgos", "--proyecto", e.proyecto, "--estricto", "--texto"]);
    expect(estrictoTexto.codigo).toBe(3);
    expect(estrictoTexto.salida).toBe(e.cli(["hallazgos", "--proyecto", e.proyecto, "--texto"]).salida);
  });

  test("H-3 H-4 H-5: recientes --proyecto lista todos del mas reciente al mas antiguo y comparar sin ids toma los dos ultimos", async () => {
    const esquemaHistorial = await Bun.file(new URL("../../esquemas/salida/historial-proyecto.json", import.meta.url)).json();
    await conWeb(async (e, _pedir, guardar) => {
      const compararCero = lanzar(e.raiz, ["comparar"], e.variables, e.proyecto);
      expect(compararCero.codigo).toBe(1);
      expect(JSON.parse(compararCero.error).error.codigo).toBe("analisis-insuficientes");

      const vacio = join(e.raiz, "otro-vacio");
      mkdirSync(vacio, { recursive: true });
      const historialVacio = e.cli(["recientes", "--proyecto", vacio]);
      expect(historialVacio.codigo).toBe(0);
      const parsedVacio = JSON.parse(historialVacio.salida);
      expect(validarEsquema(esquemaHistorial, parsedVacio)).toEqual([]);
      expect(parsedVacio.analisis).toEqual([]);
      expect(e.cli(["recientes", "--proyecto", vacio, "--texto"]).salida).toContain("Sin análisis guardados");

      const archivo = join(e.proyecto, "opencode.jsonc");
      writeFileSync(archivo, '{"agent":{"build":{"temperature":0.1}}}');
      const id1 = await guardar();

      const compararUno = lanzar(e.raiz, ["comparar"], e.variables, e.proyecto);
      expect(compararUno.codigo).toBe(1);
      expect(JSON.parse(compararUno.error).error.codigo).toBe("analisis-insuficientes");

      writeFileSync(archivo, '{"agent":{"build":{"temperature":0.2}}}');
      const id2 = await guardar();
      const compararDos = lanzar(e.raiz, ["comparar"], e.variables, e.proyecto);
      expect(compararDos.codigo).toBe(0);
      expect(compararDos.salida).toBe(e.cli(["comparar", "--desde", id1, "--hasta", id2]).salida);

      writeFileSync(archivo, '{"agent":{"build":{"temperature":0.3}}}');
      const id3 = await guardar();
      const compararTres = lanzar(e.raiz, ["comparar"], e.variables, e.proyecto);
      expect(compararTres.codigo).toBe(0);
      expect(compararTres.salida).toBe(e.cli(["comparar", "--desde", id2, "--hasta", id3]).salida);

      const historial = e.cli(["recientes", "--proyecto", e.proyecto]);
      expect(historial.codigo).toBe(0);
      const parsed = JSON.parse(historial.salida);
      expect(validarEsquema(esquemaHistorial, parsed)).toEqual([]);
      expect(parsed.proyecto).toBe(realpathSync.native(e.proyecto).replaceAll("\\", "/"));
      expect(parsed.analisis.map((a: { id: number }) => a.id)).toEqual([Number(id3), Number(id2), Number(id1)]);

      const historialTexto = e.cli(["recientes", "--proyecto", e.proyecto, "--texto"]);
      expect(historialTexto.codigo).toBe(0);
      expect(historialTexto.salida).toContain("ANÁLISIS");
      expect(historialTexto.salida).toContain(id3);

      const general = e.cli(["recientes"]);
      expect(general.codigo).toBe(0);
      expect(Object.hasOwn(JSON.parse(general.salida), "proyectos")).toBe(true);
    });
  });
});
