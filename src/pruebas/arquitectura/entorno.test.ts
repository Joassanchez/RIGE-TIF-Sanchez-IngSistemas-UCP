import { describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { crearEntornoAislado, variablesAisladas } from "../utilidades/entorno-aislado";

const variables = variablesAisladas;

describe("T0-04 aislamiento del arnes", () => {
  test("la precarga redirige todas las ubicaciones a un temporal propio", () => {
    const hogar = process.env.HOME!;
    expect(basename(hogar).startsWith("rige-pruebas-")).toBe(true);
    expect(dirname(hogar)).toBe(tmpdir());
    expect(existsSync(hogar)).toBe(true);
    for (const variable of variables) expect(process.env[variable]).toBe(hogar);
    expect(Object.entries(process.env).filter(([nombre]) =>
      nombre.toUpperCase().startsWith("OPENCODE_")).every(([, valor]) => !valor)).toBe(true);
  });

  test("fetch falla incluso para un destino que no usa red", async () => {
    await expect(fetch("data:text/plain,prueba")).rejects.toThrow("Red deshabilitada");
  });

  test("el entorno de subproceso hereda solo PATH y SystemRoot", async () => {
    const heredado = {
      PATH: "ruta", SystemRoot: "sistema", HOME: "hogar-ajeno",
      OPENCODE_CONFIG: "configuracion-ajena", TOKEN: "secreto", RIGE_PUERTO: "4747",
    };
    const entorno = crearEntornoAislado(process.env.HOME!, heredado);
    expect(Object.keys(entorno).sort()).toEqual([...variables, "PATH", "SystemRoot"].sort());
    for (const variable of variables) expect(entorno[variable]).toBe(process.env.HOME);
    expect(entorno.PATH).toBe("ruta");
    expect(entorno.SystemRoot).toBe("sistema");
    expect(heredado.HOME).toBe("hogar-ajeno");
    expect(crearEntornoAislado(process.env.HOME!, {})).not.toHaveProperty("PATH");
    expect(crearEntornoAislado(process.env.HOME!, { SYSTEMROOT: "sistema" }).SystemRoot).toBe("sistema");
    expect(() => crearEntornoAislado("relativo", heredado)).toThrow("ruta absoluta");
  });

  test("un subproceso observa el entorno aislado sin variables ajenas", async () => {
    const proceso = Bun.spawn([process.execPath, "--no-env-file", "-e",
      "console.log(JSON.stringify({hogar:process.env.HOME,config:process.env.OPENCODE_CONFIG,token:process.env.TOKEN,almacen:process.env.RIGE_ALMACEN}))"], {
      cwd: process.env.HOME!, env: crearEntornoAislado(process.env.HOME!, process.env),
      stdout: "pipe", stderr: "pipe",
    });
    const salida = await new Response(proceso.stdout).text();
    expect(await proceso.exited).toBe(0);
    expect(await new Response(proceso.stderr).text()).toBe("");
    expect(JSON.parse(salida)).toEqual({ hogar: process.env.HOME, almacen: process.env.HOME });
  });

  test("fetch.preconnect tambien falla antes de abrir una conexion", () => {
    expect(() => fetch.preconnect("http://127.0.0.1:1")).toThrow("Red deshabilitada");
  });

  test("la precarga elimina contaminacion sintetica y limpia su temporal", async () => {
    const temporal = mkdtempSync(join(tmpdir(), "rige-precarga-"));
    try {
      writeFileSync(join(temporal, "sonda.test.ts"), `
        import { test, expect } from "bun:test";
        test("precarga", async () => {
          expect(process.env.OPENCODE_CONFIG).toBeUndefined();
          expect(process.env.opencode_permission).toBeUndefined();
          await expect(fetch("data:text/plain,prueba")).rejects.toThrow("Red deshabilitada");
          console.log("TEMPORAL=" + process.env.HOME);
        });
      `);
      const proceso = Bun.spawnSync([process.execPath, "test", "--preload",
        resolve(import.meta.dir, "../preparar-entorno.ts"), "./sonda.test.ts"], {
        cwd: temporal,
        env: { ...crearEntornoAislado(temporal, process.env), TEMP: temporal, TMP: temporal,
          OPENCODE_CONFIG: join(temporal, "inexistente.json"), opencode_permission: "sintetica" },
        stdout: "pipe", stderr: "pipe",
      });
      expect(proceso.exitCode).toBe(0);
      const hogar = proceso.stdout.toString().split("TEMPORAL=")[1]?.trim();
      expect(hogar).toBeDefined();
      expect(dirname(hogar!)).toBe(temporal);
      expect(existsSync(hogar!)).toBe(false);
    } finally {
      rmSync(temporal, { recursive: true, force: true });
    }
  });
});

describe("T0-04 andamiaje", () => {
  const raiz = join(import.meta.dir, "../..");
  test("manifiestos exactos y dependencias locales declaradas", async () => {
    const manifiesto = await Bun.file(join(raiz, "package.json")).json();
    expect(manifiesto).toMatchObject({ name: "rige", version: "0.1.0", private: true,
      packageManager: "bun@1.3.14", workspaces: ["paquetes/*"],
      devDependencies: { typescript: "7.0.2", "@types/bun": "1.3.14" } });
    expect(Object.keys(manifiesto.scripts).sort()).toEqual(["esquema", "rige", "servir", "verificar"]);
    for (const nombre of ["nucleo", "opencode", "rige"]) {
      const paquete = await Bun.file(join(raiz, "paquetes", nombre, "package.json")).json();
      expect(paquete.name).toBe(`@rige/${nombre}`);
      expect(paquete.dependencies ?? {}).toEqual(nombre === "nucleo" ? {} : nombre === "opencode"
        ? { "@rige/nucleo": "workspace:*" }
        : { "@rige/nucleo": "workspace:*", "@rige/opencode": "workspace:*" });
      const config = await Bun.file(join(raiz, "paquetes", nombre, "tsconfig.json")).json();
      expect(config.compilerOptions.types).toEqual(nombre === "nucleo" ? [] : ["bun"]);
      expect(config.compilerOptions.lib).toEqual(["ESNext"]);
    }
  });

  test("configuracion estricta y defensas conectadas", async () => {
    const base = await Bun.file(join(raiz, "tsconfig.base.json")).json();
    expect(base.compilerOptions).toMatchObject({ strict: true, noUncheckedIndexedAccess: true,
      exactOptionalPropertyTypes: true, moduleResolution: "bundler", module: "Preserve" });
    expect(base.compilerOptions.skipLibCheck).not.toBe(true);
    const config = await Bun.file(join(raiz, "tsconfig.json")).json();
    expect(config.references.map((ref: { path: string }) => ref.path)).toEqual([
      "./paquetes/nucleo", "./paquetes/opencode", "./paquetes/rige",
    ]);
    const bunfig = Bun.TOML.parse(await Bun.file(join(raiz, "bunfig.toml")).text()) as {
      env: boolean; install: { linker: string }; test: { preload: string[] };
    };
    expect(bunfig.env).toBe(false);
    expect(bunfig.install.linker).toBe("isolated");
    expect(bunfig.test.preload).toEqual(["./pruebas/preparar-entorno.ts"]);
    expect(await Bun.file(join(raiz, ".gitignore")).text()).toContain("node_modules/");
    expect(await Bun.file(join(raiz, ".gitignore")).text()).toContain("rige.env");
    expect(await Bun.file(join(raiz, ".gitattributes")).text()).toBe("* text=auto eol=lf\n");
    expect(await Bun.file(join(raiz, "rige.env.example")).text()).toBe("RIGE_PUERTO=4747\nRIGE_ALMACEN=\n");
    expect(existsSync(join(raiz, "pruebas/escenarios/.gitkeep"))).toBe(true);
  });

  for (const nombre of ["nucleo", "opencode", "rige"]) {
    test(`el tsconfig de ${nombre} detecta errores sin emitir archivos`, async () => {
      const temporal = mkdtempSync(join(tmpdir(), "rige-tipos-"));
      try {
        const fuente = join(temporal, "prueba.ts");
        const config = join(temporal, "tsconfig.json");
        writeFileSync(config, JSON.stringify({
          extends: resolve(raiz, "paquetes", nombre, "tsconfig.json"),
          include: [], files: [fuente], references: [],
          compilerOptions: { composite: false, incremental: false, noEmit: true,
            typeRoots: [join(raiz, "node_modules/@types")] },
        }));
        const comprobar = () => Bun.spawnSync([
          process.execPath, "run", "tsc", "--noEmit", "-p", config,
        ], { cwd: raiz, env: crearEntornoAislado(temporal, process.env), stdout: "pipe", stderr: "pipe" });
        writeFileSync(fuente, 'const numero: number = "incorrecto"; export {};');
        expect(comprobar().exitCode).toBe(1);
        writeFileSync(fuente, nombre === "nucleo"
          ? "const numero: number = 1; export {};" : "const version: string = Bun.version; export {};");
        const correcto = comprobar();
        expect(correcto.exitCode).toBe(0);
        expect(correcto.stdout.toString()).toBe("");
        expect(correcto.stderr.toString()).toBe("");
        if (nombre === "nucleo") {
          writeFileSync(fuente, "process.env; Bun.version; fetch; export {};");
          const prohibido = comprobar();
          expect(prohibido.exitCode).toBe(1);
          const diagnostico = prohibido.stdout.toString() + prohibido.stderr.toString();
          for (const identificador of ["process", "Bun", "fetch"]) expect(diagnostico).toContain(identificador);
        }
        expect(existsSync(join(temporal, "prueba.js"))).toBe(false);
        expect(existsSync(join(temporal, "tsconfig.tsbuildinfo"))).toBe(false);
      } finally {
        rmSync(temporal, { recursive: true, force: true });
      }
      expect(existsSync(temporal)).toBe(false);
    });
  }
});
