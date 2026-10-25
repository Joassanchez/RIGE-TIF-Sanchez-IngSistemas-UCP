import { describe, expect, test } from "bun:test";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { crearEntornoAislado } from "../utilidades/entorno-aislado";
import { crearProveedor } from "../../herramientas/decisiones-nativas/proveedor";

const raiz = resolve(import.meta.dir, "../..");
const hash = "ef06e41a35795066e95acde276a42fbbf85d7a683c2787f6a19ed20bcde9b6ff";
function ejecutar(opciones: { version?: string; hash?: string; sinEvaluacion?: boolean; evaluacionAjena?: boolean; regenerar?: boolean; distinta?: boolean; falla?: boolean; fallaGit?: boolean; cacheInterno?: boolean } = {}) {
  const temporal = mkdtempSync(join(tmpdir(), "rige-decisiones-test-"));
  try {
    const fuente = join(temporal, "repositorio/src");
    mkdirSync(join(fuente, "herramientas"), { recursive: true });
    mkdirSync(join(fuente, "pruebas/utilidades"), { recursive: true });
    cpSync(join(raiz, "herramientas/decisiones-nativas.ts"), join(fuente, "herramientas/decisiones-nativas.ts"));
    cpSync(join(raiz, "herramientas/decisiones-nativas"), join(fuente, "herramientas/decisiones-nativas"), { recursive: true });
    cpSync(join(raiz, "herramientas/cobertura.ts"), join(fuente, "herramientas/cobertura.ts"));
    cpSync(join(raiz, "pruebas/utilidades/escenario.ts"), join(fuente, "pruebas/utilidades/escenario.ts"));
    const escenario = join(fuente, "pruebas/escenarios/doble");
    mkdirSync(join(escenario, "proyecto"), { recursive: true });
    writeFileSync(join(escenario, "proyecto/opencode.json"), '{"permission":{"read":"ask"}}');
    const evaluaciones = [{ sujeto: "read", patronEvaluado: "src/a b.js", regla: { permission: "read", pattern: "*", action: "ask" } },
      { sujeto: "read", patronEvaluado: "otro.js", regla: { permission: "*", pattern: "*", action: "allow" } }];
    const referencia = { procedencia: { version: "1.18.25", hogar: "hogar", directorio: "proyecto", git: "proyecto" },
      decisionesNativas: [{ consulta: "lectura", agente: "build", sujeto: "read", objetivo: "src/a b.js", herramienta: "read", evaluaciones: opciones.distinta ? [] : evaluaciones }] };
    writeFileSync(join(escenario, "REFERENCIA.json"), JSON.stringify(referencia));
    writeFileSync(join(fuente, "pruebas/escenarios/MANIFIESTO.json"), JSON.stringify({ escenarios: [{ id: "doble", consultas: [{
      id: "lectura", agente: "build", sujeto: "read", objetivo: "src/a b.js", herramienta: "read", argumentos: { filePath: "<PROYECTO>/src/a b.js" }, nativa: true,
    }, { id: "omitida", nativa: false }] }] }));
    mkdirSync(join(temporal, "opencode-ai/bin"), { recursive: true });
    writeFileSync(join(temporal, "opencode-ai/bin/opencode.exe"), "doble");
    const registro = join(temporal, "registro.json");
    const precarga = join(temporal, "precarga.ts");
    writeFileSync(precarga, `
      import { Hash } from "node:crypto";
      import { readFileSync,writeFileSync,existsSync } from "node:fs";
      import { join,dirname } from "node:path";
      Object.defineProperty(process,"platform",{value:"win32"});
      Object.defineProperty(process,"arch",{value:"x64"});
      Hash.prototype.digest=()=>${JSON.stringify(opciones.hash ?? hash)};
      const llamadas=[];
      const guardar=()=>writeFileSync(${JSON.stringify(registro)},JSON.stringify(llamadas));
      Bun.spawnSync=(argumentos,opciones)=>{
        llamadas.push({argumentos,...opciones}); guardar();
        if(argumentos[1]==="init" && ${Boolean(opciones.fallaGit)}) return {exitCode:128,stdout:Buffer.from(""),stderr:Buffer.from("fatal: bloqueo de prueba")};
        return {exitCode:0,stdout:Buffer.from(argumentos[1]==="--version"?${JSON.stringify(opciones.version ?? "1.18.25")}:argumentos.includes("--show-toplevel")?opciones.cwd:""),stderr:Buffer.from("")};
      };
      Bun.spawn=(argumentos,opciones)=>{
        const config=JSON.parse(readFileSync(opciones.env.OPENCODE_CONFIG,"utf8"));
        const copia=dirname(opciones.cwd);
        if(existsSync(join(copia,"REFERENCIA.json"))) throw Error("Referencia copiada");
        llamadas.push({argumentos,...opciones,config,copia,entrada:readFileSync(join(opciones.cwd,"opencode.json"),"utf8")});guardar();
        return {exited:Promise.resolve(${opciones.falla ? 1 : 0}),stdout:new Response("resultado").body,stderr:new Response(${JSON.stringify(opciones.evaluacionAjena ? "message=evaluated permission=external_directory pattern=* action.permission=external_directory action.pattern=* action.action=deny" : opciones.sinEvaluacion ? "level=INFO message=sin-herramienta" : 'level=INFO message=inicio\nlevel=INFO message=evaluated permission=read pattern="src/a b.js" action.permission=read action.pattern=* action.action=ask\nlevel=INFO message=otro\nlevel=INFO message=evaluated permission=read pattern=otro.js action.permission=* action.action=allow action.pattern=*\n')}).body};
      };
    `);
    const resultado = Bun.spawnSync([process.execPath, "--preload", precarga, join(fuente, "herramientas/decisiones-nativas.ts"),
      "--raiz", temporal, "--cache", opciones.cacheInterno ? fuente : join(temporal, "cache"), ...(opciones.regenerar ? ["--regenerar"] : [])], {
      cwd: raiz, env: { ...crearEntornoAislado(temporal, process.env), CONSERVAR: "no", OPENCODE_OTRA: "no", XDG_OTRA: "no" },
      stdout: "pipe", stderr: "pipe", timeout: 15000,
    });
    const llamadas = existsSync(registro) ? JSON.parse(readFileSync(registro, "utf8")) : [];
    return { codigo: resultado.exitCode, error: resultado.stderr.toString(), salida: resultado.stdout.toString(), llamadas,
      referencia: JSON.parse(readFileSync(join(escenario, "REFERENCIA.json"), "utf8")),
      conservada: readFileSync(join(escenario, "proyecto/opencode.json"), "utf8"),
      borradas: llamadas.every((l: { copia?: string }) => !l.copia || !existsSync(l.copia)), temporal };
  } finally { rmSync(temporal, { recursive: true, force: true }); }
}

describe("T2-14 O-1", () => {
  test("T2-14b informa escenario, estado y diagnostico de git sin escribir referencias", () => {
    const r = ejecutar({ fallaGit: true, regenerar: true });
    expect(r.codigo).toBe(1);
    expect(r.error).toContain("doble/lectura");
    expect(r.error).toContain("128");
    expect(r.error).toContain("fatal: bloqueo de prueba");
    expect(r.llamadas.find((l: { argumentos: string[] }) => l.argumentos[1] === "init").timeout).toBe(30000);
    expect(r.referencia.decisionesNativas[0]).not.toHaveProperty("procedencia");
    expect(r.borradas).toBe(true);
  });
  test("extrae varias evaluated mezcladas, conserva escenario, procedencia y compara sin escribir", () => {
    const r = ejecutar({ regenerar: true });
    expect(r.codigo).toBe(0);
    const d = r.referencia.decisionesNativas[0];
    expect(d.evaluaciones).toHaveLength(2);
    expect(d.evaluaciones[0]).toMatchObject({ sujeto: "read", patronEvaluado: "src/a b.js", regla: { action: "ask" } });
    expect(d.procedencia).toMatchObject({ sha256Binario: hash, version: "1.18.25", plataforma: "win32-x64", comando: expect.arrayContaining(["--print-logs", "run", "--agent", "build"]) });
    expect(d.procedencia.fecha).toMatch(/^\d{4}-\d{2}-\d{2}/);
    expect(r.conservada).toBe('{"permission":{"read":"ask"}}');
    const llamada = r.llamadas.find((l: { config?: unknown }) => l.config);
    expect(llamada.config).not.toHaveProperty("permission");
    expect(llamada.config.provider.simulado.options.baseURL).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/v1$/);
    expect(llamada.timeout).toBe(120000);
    expect(llamada.env.HOME).toBe(llamada.env.USERPROFILE);
    expect(llamada.env.XDG_CONFIG_HOME).toBe(join(llamada.env.HOME, ".config"));
    expect(llamada.env.XDG_CACHE_HOME).toBe(join(r.temporal, "cache"));
    expect(llamada.env).not.toHaveProperty("CONSERVAR");
    expect(llamada.env).not.toHaveProperty("OPENCODE_OTRA");
    expect(llamada.env).not.toHaveProperty("XDG_OTRA");
    expect(r.borradas).toBe(true);
    expect(ejecutar().codigo).toBe(0);
    const distinta = ejecutar({ distinta: true });
    expect(distinta.codigo).toBe(1);
    expect(distinta.referencia.decisionesNativas[0].evaluaciones).toEqual([]);
    const fallida = ejecutar({ falla: true, regenerar: true });
    expect(fallida.codigo).toBe(1);
    expect(fallida.borradas).toBe(true);
    expect(fallida.referencia.decisionesNativas[0]).not.toHaveProperty("procedencia");
    expect(ejecutar({ cacheInterno: true }).codigo).toBe(1);
  });
});
describe("T2-14 O-2", () => {
  test("SHA-256 y version no verificados abortan antes de ejecutar o escribir", () => {
    for (const opciones of [{ hash: "desconocido" }, { version: "1.18.24" }]) {
      const r = ejecutar({ ...opciones, regenerar: true });
      expect(r.codigo).toBe(1);
      expect(r.error).toContain(opciones.hash ? "SHA-256" : "Version");
      expect(r.llamadas.every((l: { argumentos: string[] }) => l.argumentos[1] === "--version")).toBe(true);
      expect(r.referencia.decisionesNativas[0]).not.toHaveProperty("procedencia");
    }
  });
});
describe("T2-14 O-3", () => {
  test("sin evaluated registra herramientaNoOfrecida y ninguna decision inventada", () => {
    const r = ejecutar({ sinEvaluacion: true, regenerar: true });
    expect(r.codigo).toBe(0);
    expect(r.referencia.decisionesNativas[0]).toMatchObject({ herramientaNoOfrecida: true, evaluaciones: [] });
    expect(r.referencia.decisionesNativas[0]).not.toHaveProperty("decision");
    const ajena = ejecutar({ evaluacionAjena: true, regenerar: true });
    expect(ajena.referencia.decisionesNativas[0]).toMatchObject({ herramientaNoOfrecida: true });
  });
});
describe("T2-14 O-4 RNF-05", () => {
  test("proveedor local SSE: titulo fijo, una herramienta, texto final y rechazo de otras rutas", async () => {
    const proveedor = crearProveedor("read", { filePath: "a.js" });
    try {
      expect(proveedor.servidor.hostname).toBe("127.0.0.1");
      expect(proveedor.servidor.port).toBeGreaterThan(0);
      const pedir = (cuerpo: unknown) => proveedor.responder(new Request("http://127.0.0.1/v1/chat/completions", { method: "POST", body: JSON.stringify(cuerpo) }));
      const titulo = await pedir({ messages: [{ role: "system", content: "You are a title generator." }] });
      expect(await titulo.text()).toContain("Consulta de permisos");
      const principal = await pedir({ tools: [{ function: { name: "read" } }], messages: [] });
      expect(principal.headers.get("content-type")).toContain("text/event-stream");
      const sse = await principal.text();
      expect(sse).toContain('"name":"read"');
      expect(sse).toContain("[DONE]");
      expect(await (await pedir({ tools: [], messages: [{ role: "tool", content: "resultado" }] })).text()).toContain("Consulta finalizada");
      expect((await proveedor.responder(new Request("http://127.0.0.1/otra"))).status).toBe(404);
    } finally { proveedor.servidor.stop(true); }
  });
});
