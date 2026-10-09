import { describe, expect, test } from "bun:test";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { crearEntornoAislado } from "../utilidades/entorno-aislado";
import { normalizar, comparar } from "../../herramientas/referencias-nativas/comparar";

describe("RN-1 normalizacion de la salida nativa", () => {
  test("mapea las claves nativas y aplana objetos conservando hojas", () => {
    expect(normalizar({ topP: 0.9, maxSteps: 7, temperature: 0.4,
      options: { a: false, interior: { b: null } }, lista: [1, 2] })).toEqual({
      top_p: 0.9, steps: 7, temperature: 0.4, "options.a": false,
      "options.interior.b": null, lista: [1, 2],
    });
    expect(() => normalizar(null)).toThrow();
    expect(() => normalizar([])).toThrow();
  });
});

const raiz = resolve(import.meta.dir, "../..");
const hashWindows = "ef06e41a35795066e95acde276a42fbbf85d7a683c2787f6a19ed20bcde9b6ff";
const hashLinux = "d91e0d33676d0839f7cde87924cd4127ea88c9d6784eea9f009a7d08bdc60eeb";
type Llamada = { argumentos: string[]; cwd?: string; env: Record<string, string>; timeout: number; copia?: string };

// El doble del binario y del hash vive solo en el subproceso; bun test nunca ejecuta OpenCode.
function ejecutar(opciones: { argumentos?: string[]; version?: string; hash?: string; plataforma?: string;
  diferente?: boolean; falla?: boolean; desconocido?: boolean } = {}) {
  const temporal = mkdtempSync(join(tmpdir(), "rige-nativas-test-"));
  try {
    mkdirSync(join(temporal, "opencode-ai/bin"), { recursive: true });
    writeFileSync(join(temporal, "opencode-ai/bin/opencode.exe"), "binario sintetico");
    const registro = join(temporal, "llamadas.json");
    const precarga = join(temporal, "precarga.ts");
    let entrada = join(raiz, "herramientas/referencias-nativas.ts");
    if (opciones.desconocido) {
      const fuente = join(temporal, "fuente");
      mkdirSync(join(fuente, "herramientas"), { recursive: true });
      mkdirSync(join(fuente, "pruebas/utilidades"), { recursive: true });
      mkdirSync(join(fuente, "pruebas/escenarios/desconocido"), { recursive: true });
      entrada = join(fuente, "herramientas/referencias-nativas.ts");
      cpSync(join(raiz, "herramientas/referencias-nativas.ts"), entrada);
      cpSync(join(raiz, "herramientas/referencias-nativas"), join(fuente, "herramientas/referencias-nativas"), { recursive: true });
      cpSync(join(raiz, "pruebas/utilidades/escenario.ts"), join(fuente, "pruebas/utilidades/escenario.ts"));
      cpSync(join(raiz, "pruebas/escenarios/v1-precedencia/REFERENCIA.json"), join(fuente, "pruebas/escenarios/desconocido/REFERENCIA.json"));
    }
    const referencias = Object.fromEntries(["v1-precedencia", "v1-vias"].map(nombre => [nombre,
      JSON.parse(readFileSync(join(raiz, "pruebas/escenarios", nombre, "REFERENCIA.json"), "utf8")).valores]));
    writeFileSync(precarga, `
      import { Hash } from "node:crypto";
      import { existsSync, readFileSync, writeFileSync } from "node:fs";
      import { dirname, join } from "node:path";
      Object.defineProperty(process, "platform", { value: ${JSON.stringify(opciones.plataforma ?? "win32")} });
      Object.defineProperty(process, "arch", { value: "x64" });
      Hash.prototype.digest = () => ${JSON.stringify(opciones.hash ?? hashWindows)};
      const llamadas = [];
      Bun.spawnSync = (argumentos, opciones) => {
        const llamada = { argumentos, ...opciones };
        llamadas.push(llamada);
        if (argumentos[1] === "--version") {
          writeFileSync(${JSON.stringify(registro)}, JSON.stringify(llamadas));
          return { exitCode: 0, stdout: Buffer.from(${JSON.stringify(opciones.version ?? "1.18.25")}), stderr: Buffer.from("") };
        }
        const copia = dirname(opciones.cwd);
        llamada.copia = copia;
        if (existsSync(join(copia, "REFERENCIA.json"))) throw new Error("Referencia copiada");
        if (!readFileSync(join(copia, ".git/HEAD"), "utf8").includes("refs/heads/main")) throw new Error("Sin git");
        writeFileSync(join(copia, ".gitignore"), "generado por el doble nativo");
        const referencias = ${JSON.stringify(referencias)};
        const nombre = opciones.env.OPENCODE_CONFIG ? "v1-vias" : "v1-precedencia";
        const valores = referencias[nombre];
        const salida = {};
        for (const [clave, valor] of Object.entries(valores)) {
          if (clave === "steps") salida.maxSteps = valor;
          else if (clave === "top_p") salida.topP = valor;
          else if (clave === "options.a") salida.options = { a: valor };
          else salida[clave] = valor;
        }
        if (${Boolean(opciones.diferente)} && nombre === "v1-precedencia") salida.temperature = 0.2;
        writeFileSync(${JSON.stringify(registro)}, JSON.stringify(llamadas));
        return { exitCode: ${opciones.falla ? "1" : "0"}, stdout: Buffer.from(JSON.stringify(salida)), stderr: Buffer.from("fallo sintetico") };
      };
    `);
    const resultado = Bun.spawnSync([process.execPath, "--preload", precarga,
      entrada, ...(opciones.argumentos ?? ["--raiz", temporal])], {
      cwd: raiz, env: { ...crearEntornoAislado(temporal, process.env), TEMP: temporal, TMP: temporal,
        OPENCODE_CONFIG: "no-heredar", OPENCODE_OTRA: "no-heredar", XDG_OTRA: "no-heredar",
        ProgramData: "no-heredar", CONSERVAR: "heredada" }, stdout: "pipe", stderr: "pipe", timeout: 15000,
    });
    const llamadas: Llamada[] = existsSync(registro) ? JSON.parse(readFileSync(registro, "utf8")) : [];
    return { codigo: resultado.exitCode, salida: resultado.stdout.toString(), error: resultado.stderr.toString(),
      llamadas, temporal, restos: readdirSync(temporal), copiasBorradas: llamadas.every(llamada => !llamada.copia || !existsSync(llamada.copia)) };
  } finally { rmSync(temporal, { recursive: true, force: true }); }
}

describe("RN-4 binario directo, version y SHA-256 verificados", () => {
  test("rechaza argumentos, version, hash y plataforma antes de comparar; admite ambos hashes", () => {
    const sinRaiz = ejecutar({ argumentos: [] });
    expect(sinRaiz.codigo).toBe(1);
    expect(sinRaiz.error).toContain("--raiz");
    expect(sinRaiz.llamadas).toEqual([]);
    for (const opciones of [{ version: "1.18.24" }, { hash: "hash-invalido" }, { plataforma: "darwin" }]) {
      const resultado = ejecutar(opciones);
      expect(resultado.codigo).toBe(1);
      expect(resultado.error).toContain(opciones.hash ?? hashWindows);
      expect(resultado.llamadas.every(llamada => llamada.argumentos[1] === "--version")).toBe(true);
    }
    for (const opciones of [{}, { plataforma: "linux", hash: hashLinux }]) {
      const resultado = ejecutar(opciones);
      expect(resultado.codigo).toBe(0);
      expect(resultado.llamadas[0]?.argumentos).toEqual([join(resultado.temporal, "opencode-ai/bin/opencode.exe"), "--version"]);
    }
  });
});

describe("RN-5 copia, aislamiento y limite del comando nativo", () => {
  test("aisla las dos vias y borra los temporales incluso ante fallo", () => {
    const resultado = ejecutar();
    expect(resultado.codigo).toBe(0);
    const llamadas = resultado.llamadas.filter(llamada => llamada.copia);
    expect(llamadas).toHaveLength(2);
    for (const llamada of llamadas) {
      expect(llamada.argumentos.slice(1)).toEqual(["debug", "agent", "build"]);
      expect(llamada.cwd).toBe(join(llamada.copia!, "proyecto"));
      expect(llamada.timeout).toBe(120000);
      expect(llamada.env.CONSERVAR).toBe("heredada");
      for (const nombre of ["OPENCODE_OTRA", "XDG_OTRA"]) expect(llamada.env).not.toHaveProperty(nombre);
      expect(llamada.env.USERPROFILE).toBe(llamada.env.HOME);
      if (llamada.env.OPENCODE_CONFIG) {
        const hogar = join(llamada.copia!, "hogar");
        expect(llamada.env.HOME).toBe(hogar);
        expect(llamada.env.OPENCODE_CONFIG).toBe(join(llamada.copia!, "externa/config.json"));
        expect(llamada.env.XDG_CONFIG_HOME).toBe(join(hogar, ".config"));
        for (const nombre of ["XDG_DATA_HOME", "XDG_STATE_HOME", "XDG_CACHE_HOME", "APPDATA", "LOCALAPPDATA", "ProgramData"]) {
          expect(llamada.env[nombre]).toBe(hogar);
        }
      } else {
        expect(llamada.env.HOME).not.toBe(join(llamada.copia!, "hogar"));
        for (const nombre of ["XDG_CONFIG_HOME", "XDG_DATA_HOME", "XDG_STATE_HOME", "XDG_CACHE_HOME"]) {
          expect(llamada.env[nombre]).toBe(llamada.env.HOME);
        }
        for (const nombre of ["APPDATA", "LOCALAPPDATA", "ProgramData"]) expect(llamada.env).not.toHaveProperty(nombre);
      }
    }
    expect(resultado.copiasBorradas).toBe(true);
    expect(resultado.restos.sort()).toEqual(["llamadas.json", "opencode-ai", "precarga.ts"]);
    const fallido = ejecutar({ falla: true });
    expect(fallido.codigo).toBe(1);
    expect(fallido.copiasBorradas).toBe(true);
    expect(fallido.restos.sort()).toEqual(["llamadas.json", "opencode-ai", "precarga.ts"]);
  });
});

describe("RN-6 informa coincidencias y diferencias sin modificar escenarios", () => {
  test("solo termina con cero cuando todos coinciden y conserva cada archivo", () => {
    const capturar = () => Object.fromEntries([...new Bun.Glob("**/*").scanSync({ cwd: join(raiz, "pruebas/escenarios"), onlyFiles: true, dot: true })]
      .sort().map(ruta => [ruta, readFileSync(join(raiz, "pruebas/escenarios", ruta)).toString("hex")]));
    const antes = capturar();
    const correcto = ejecutar();
    expect(correcto.codigo).toBe(0);
    expect(correcto.salida.trim().split(/\r?\n/)).toEqual(["v1-precedencia: ok", "v1-vias: ok"]);
    const distinto = ejecutar({ diferente: true });
    expect(distinto.codigo).toBe(1);
    const lineas = distinto.salida.trim().split(/\r?\n/);
    expect(lineas).toHaveLength(2);
    expect(lineas[0]).toContain(JSON.stringify([{ clave: "temperature", esperado: 0.3, obtenido: 0.2 }]));
    expect(lineas[1]).toBe("v1-vias: ok");
    const desconocido = ejecutar({ desconocido: true });
    expect(desconocido.codigo).toBe(1);
    expect(desconocido.error).toContain("Escenario sin aislamiento conocido: desconocido");
    expect(desconocido.llamadas).toEqual([]);
    expect(capturar()).toEqual(antes);
  });
});

describe("RN-2 comparacion estricta de las claves esperadas", () => {
  test("ignora extras y distingue valores diferentes y claves ausentes", () => {
    expect(comparar({ numero: 7, booleano: false }, { numero: 7, booleano: false, extra: 1 })).toEqual([]);
    expect(comparar({ numero: 7, ausente: undefined }, { numero: "7", extra: 1 })).toEqual([
      { clave: "numero", esperado: 7, obtenido: "7" },
      { clave: "ausente", esperado: undefined, obtenido: undefined },
    ]);
  });
});

describe("RN-3 la referencia real puede fallar", () => {
  test("detecta exactamente la temperatura adulterada", async () => {
    const referencia = await Bun.file(new URL("../escenarios/v1-precedencia/REFERENCIA.json", import.meta.url)).json();
    expect(comparar(referencia.valores, normalizar({
      description: referencia.valores.description, maxSteps: 12, temperature: 0.2,
    }))).toEqual([{ clave: "temperature", esperado: 0.3, obtenido: 0.2 }]);
  });
});
