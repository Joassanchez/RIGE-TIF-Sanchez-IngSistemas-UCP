import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, resolve } from "node:path";
import { prepararConsultas } from "../utilidades/consultas-cli";
import { crearInstalacionOpenCode } from "../utilidades/instalacion-opencode";
import { validarEsquema } from "../utilidades/validar-esquema";
import { crearEntornoAislado } from "../utilidades/entorno-aislado";
import { entornoDeReferencia, type ReferenciaEntorno } from "../utilidades/entorno-referencia";

const limpiezas: (() => void)[] = [];
afterEach(() => { for (const limpiar of limpiezas.splice(0).reverse()) limpiar(); });
function preparar(configurar = true) {
  const e = prepararConsultas("v2-decision");
  limpiezas.push(e.borrar);
  if (configurar) {
    const ref = JSON.parse(readFileSync(new URL("../escenarios/v2-decision/REFERENCIA.json", import.meta.url), "utf8")) as ReferenciaEntorno;
    Object.assign(e.variables, entornoDeReferencia(ref, e));
  }
  return e;
}

describe("T5-13 R-3", () => {
  test("infraestructura: codigo 70 solo por stderr, stack solo con --depurar", () => {
    const e = preparar();
    const precarga = join(e.raiz, "fallar.ts");
    // Como RF-03 CA-5: el modulo del runtime no depende del alias de unidad de src/.
    writeFileSync(precarga, `import { mock } from "bun:test";
      const fs = await import("node:fs");
      mock.module("node:fs", () => ({ ...fs, readFileSync: (...args) => {
        if (String(args[0]).endsWith("opencode.json")) throw new Error("FALLO-T513-INFRAESTRUCTURA");
        return fs.readFileSync(...args);
      } }));`);
    for (const depurar of [false, true]) {
      const proceso = Bun.spawnSync([process.execPath, "--preload", precarga, "paquetes/rige/arranque/rige.ts", "reglas", "--proyecto", e.proyecto,
        "--agente", "build", ...(depurar ? ["--depurar"] : [])], { cwd: resolve(import.meta.dir, "../.."),
        env: { ...crearEntornoAislado(e.raiz, process.env), ...e.variables }, stdout: "pipe", stderr: "pipe" });
      expect(proceso.exitCode).toBe(70);
      expect(proceso.stdout.toString()).toBe("");
      const error = JSON.parse(proceso.stderr.toString());
      expect(error).toMatchObject({ esquema: 2, error: { codigo: "interno" } });
      expect(error.error.stack !== undefined).toBe(depurar);
    }
  });
  test("CLI en memoria: codigo 0, almacén ausente, determinismo y medicion en canal separado", async () => {
    const e = preparar();
    const almacen = join(realpathSync.native(e.raiz), "almacen-no-creado");
    const variables = { RIGE_ALMACEN: almacen };
    const r = e.consultar("reglas", ["--agente", "build"], variables);
    expect(r.codigo).toBe(0);
    expect(r.error).toBe("");
    const valor = JSON.parse(r.salida);
    expect(valor.esquema).toBe(2);
    expect(valor.proyecto).toBe(realpathSync.native(e.proyecto).replaceAll("\\", "/"));
    expect(e.consultar("reglas", ["--agente", "build"], variables)).toEqual(r);
    const medido = e.consultar("reglas", ["--agente", "build", "--tiempos"], variables);
    expect(medido.codigo).toBe(0);
    expect(medido.salida).toBe(r.salida);
    const esquema = await Bun.file(new URL("../../esquemas/salida/tiempos.json", import.meta.url)).json();
    expect(validarEsquema(esquema, JSON.parse(medido.error))).toEqual([]);
    expect(existsSync(almacen)).toBe(false);
  });
  test("errores 1 y 2 solo por stderr, --explicar rechazado; version indeterminada advertida", () => {
    const e = preparar();
    for (const opciones of [["--agente", "build", "--explicar"], [], ["--agente", " "], ["--agente", "build", "--lanzado-por", " "]]) {
      const r = e.consultar("reglas", opciones);
      expect(r.codigo).toBe(2);
      expect(r.salida).toBe("");
      expect(JSON.parse(r.error)).toMatchObject({ esquema: 2, error: { codigo: "argumentos-invalidos" } });
    }
    for (const opciones of [["--agente", "ausente"], ["--agente", "build", "--lanzado-por", "ausente"]]) {
      const r = e.consultar("reglas", opciones);
      expect(r.codigo).toBe(1);
      expect(r.salida).toBe("");
      expect(JSON.parse(r.error).error.codigo).toBe("agente-inexistente");
    }
    const sinVersion = e.consultar("reglas", ["--agente", "build"], { PATH: join(e.raiz, "sin-ejecutable") });
    expect(sinVersion.codigo).toBe(0);
    expect(JSON.parse(sinVersion.salida).declaraciones).toContain("version-no-determinada");
    expect(sinVersion.error).toContain('"codigo":"version-no-determinada"');
    const instalacion = join(e.raiz, "version-distinta");
    crearInstalacionOpenCode(instalacion, "1.18.24");
    const distinta = e.consultar("reglas", ["--agente", "build"], { PATH: instalacion });
    expect(distinta.codigo).toBe(1);
    expect(distinta.salida).toBe("");
    expect(JSON.parse(distinta.error).error.codigo).toBe("version-no-soportada");
  });
});

describe("T5-13 R-5 regresion CLI", () => {
  test("valores y permiso identicos a 87c2eda, con y sin explicacion; tiempos fuera del dominio", async () => {
    // La captura previa de esta ficha usa defaults; RNF-08 conserva ademas los casos declarados congelados de T5-12.
    const e = preparar(false);
    const congeladas = JSON.parse(readFileSync(new URL("../datos/salidas-87c2eda-t5-13.json", import.meta.url), "utf8")) as {
      casos: { comando: string; argumentos: string[]; codigo: number; salida: string; error: string }[] };
    const raiz = realpathSync.native(e.raiz).replaceAll("\\", "/");
    for (const c of congeladas.casos) {
      const actual = e.consultar(c.comando, c.argumentos);
      expect(actual.codigo).toBe(c.codigo);
      expect(actual.error).toBe(c.error);
      const valor = JSON.parse(actual.salida);
      const resumen = createHash("sha256").update(JSON.stringify(valor.entradas.map((e: { via: string; referencia: string; condicion: string; resumen: string | null }) =>
        [e.via, e.referencia, e.condicion, e.resumen]))).digest("hex");
      expect(valor.resumenEntradas).toBe(resumen);
      expect(actual.salida.replaceAll(valor.resumenEntradas, "<RESUMEN>").replaceAll(raiz, "<RAIZ>")).toBe(c.salida);
      const medido = e.consultar(c.comando, [...c.argumentos, "--tiempos"]);
      expect(medido.codigo).toBe(c.codigo);
      expect(medido.salida).toBe(actual.salida);
      const esquema = await Bun.file(new URL("../../esquemas/salida/tiempos.json", import.meta.url)).json();
      expect(validarEsquema(esquema, JSON.parse(medido.error))).toEqual([]);
    }
  });
});

describe("T5-13 R-6", () => {
  test("ejecucion y matriz documentadas como capacidad adicional, fuera de los Must", () => {
    for (const archivo of ["README.md", "MANUAL.md"]) {
      const texto = readFileSync(new URL(`../../${archivo}`, import.meta.url), "utf8");
      expect(texto).toContain("reglas --proyecto");
      expect(texto).toMatch(/\| Capacidad adicional[^\n]*reglas/);
      expect(texto).toContain("parcial, sin decisión");
    }
  });
});
