import { afterEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { ConfiguracionSistema } from "./configuracion";

const temporales: string[] = [];
function escenario(contenido?: string) {
  const temporal = mkdtempSync(join(tmpdir(), "rige-configuracion-"));
  temporales.push(temporal);
  const rutaArchivo = join(temporal, "rige.env");
  if (contenido !== undefined) writeFileSync(rutaArchivo, contenido);
  return { temporal, rutaArchivo };
}
function comprobarError(resultado: ReturnType<ConfiguracionSistema["leer"]>, variable: string) {
  expect(resultado.exito).toBe(false);
  if (resultado.exito) throw new Error("Se esperaba error de uso");
  expect(resultado.error.codigo).toBe("configuracion-invalida");
  expect(resultado.error.mensaje).toContain(variable);
}
afterEach(() => {
  for (const temporal of temporales.splice(0)) rmSync(temporal, { recursive: true, force: true });
});

describe("C4-1", () => {
  test("prelacion por variable y vacios recortados como no definidos", () => {
    const { temporal, rutaArchivo } = escenario("RIGE_PUERTO=5000\nRIGE_ALMACEN=archivo");
    expect(new ConfiguracionSistema({ rutaArchivo, plataforma: "linux", entorno: {
      RIGE_PUERTO: " 6000 ", RIGE_ALMACEN: " \t ",
    } }).leer()).toEqual({ exito: true, valor: { puerto: 6000, directorioAlmacen: resolve("archivo") } });
    expect(new ConfiguracionSistema({ rutaArchivo, plataforma: "linux", entorno: {
      RIGE_PUERTO: " ", RIGE_ALMACEN: temporal,
    } }).leer()).toEqual({ exito: true, valor: { puerto: 5000, directorioAlmacen: resolve(temporal) } });
    writeFileSync(rutaArchivo, "RIGE_PUERTO= \nRIGE_ALMACEN= \t");
    expect(new ConfiguracionSistema({ rutaArchivo, plataforma: "linux", entorno: { HOME: temporal } }).leer())
      .toEqual({ exito: true, valor: { puerto: 4747, directorioAlmacen: resolve(temporal, ".local/share/rige") } });
  });
});

describe("C4-2", () => {
  test("lee el archivo explicitamente y admite su ausencia sin ocultar errores de E/S", () => {
    const { temporal, rutaArchivo } = escenario();
    expect(new ConfiguracionSistema({ rutaArchivo, plataforma: "linux", entorno: { RIGE_ALMACEN: temporal } }).leer())
      .toEqual({ exito: true, valor: { puerto: 4747, directorioAlmacen: resolve(temporal) } });
    writeFileSync(rutaArchivo, `RIGE_PUERTO=5200\nRIGE_ALMACEN=${temporal}`);
    expect(new ConfiguracionSistema({ rutaArchivo, plataforma: "linux", entorno: {} }).leer())
      .toEqual({ exito: true, valor: { puerto: 5200, directorioAlmacen: resolve(temporal) } });
    expect(() => new ConfiguracionSistema({ rutaArchivo: temporal, plataforma: "linux", entorno: {} }).leer()).toThrow();
  });
});

describe("C4-3", () => {
  test("formato literal, comentarios, espacios y error con numero de linea", () => {
    const { rutaArchivo } = escenario(" \r\n  # comentario\r\n RIGE_PUERTO = 5100 \r\n RIGE_ALMACEN = ${HOME}=datos ");
    expect(new ConfiguracionSistema({ rutaArchivo, plataforma: "linux", entorno: {} }).leer())
      .toEqual({ exito: true, valor: { puerto: 5100, directorioAlmacen: resolve("${HOME}=datos") } });
    writeFileSync(rutaArchivo, "# comentario\n\nsin separador");
    comprobarError(new ConfiguracionSistema({ rutaArchivo, plataforma: "linux", entorno: {} }).leer(), "3");
    writeFileSync(rutaArchivo, 'RIGE_PUERTO="5100"');
    comprobarError(new ConfiguracionSistema({ rutaArchivo, plataforma: "linux", entorno: {} }).leer(), "RIGE_PUERTO");
  });
});

describe("C4-4", () => {
  test("rechaza toda clave ajena, incluso vacia o desplazada por el entorno", () => {
    const { temporal, rutaArchivo } = escenario();
    for (const clave of ["OPENCODE_CONFIG", "HOME", "RIGE_OTRA", ""]) {
      writeFileSync(rutaArchivo, `${clave}=`);
      const resultado = new ConfiguracionSistema({ rutaArchivo, plataforma: "linux", entorno: {
        RIGE_ALMACEN: temporal, RIGE_PUERTO: "6000",
      } }).leer();
      comprobarError(resultado, clave);
    }
  });
});

describe("C4-5", () => {
  test("ignora variables ajenas del entorno sin acceder a ellas", () => {
    const { temporal, rutaArchivo } = escenario();
    expect(new ConfiguracionSistema({ rutaArchivo, plataforma: "linux", entorno: {
      RIGE_ALMACEN: temporal, RIGE_PUERTO: "5001",
      get OPENCODE_CONFIG(): string { throw new Error("No leer variable ajena"); },
      get RIGE_OTRA(): string { throw new Error("No leer variable ajena"); },
    } }).leer()).toEqual({ exito: true, valor: { puerto: 5001, directorioAlmacen: resolve(temporal) } });
  });
});

describe("C4-6", () => {
  test("puerto decimal de 1 a 65535 y defecto 4747", () => {
    const { temporal, rutaArchivo } = escenario();
    for (const puerto of ["0", "65536", "-1", "+1", "1.5", "1e3", "0x10", "12x", "1 2", "９", "9".repeat(400)]) {
      comprobarError(new ConfiguracionSistema({ rutaArchivo, plataforma: "linux", entorno: {
        RIGE_ALMACEN: temporal, RIGE_PUERTO: puerto,
      } }).leer(), "RIGE_PUERTO");
    }
    for (const [texto, puerto] of [["1", 1], ["65535", 65535], ["004747", 4747], ["", 4747]] as const) {
      expect(new ConfiguracionSistema({ rutaArchivo, plataforma: "linux", entorno: {
        RIGE_ALMACEN: temporal, RIGE_PUERTO: texto,
      } }).leer()).toEqual({ exito: true, valor: { puerto, directorioAlmacen: resolve(temporal) } });
    }
  });
});

describe("C4-7", () => {
  test("directorio absoluto y valores por defecto de win32 y linux con bases inyectadas", () => {
    const { temporal, rutaArchivo } = escenario();
    const casos = [
      { plataforma: "win32", entorno: { LOCALAPPDATA: temporal }, esperado: resolve(temporal, "rige") },
      { plataforma: "linux", entorno: { XDG_DATA_HOME: temporal }, esperado: resolve(temporal, "rige") },
      { plataforma: "linux", entorno: { HOME: temporal, XDG_DATA_HOME: " " }, esperado: resolve(temporal, ".local/share/rige") },
      { plataforma: "win32", entorno: { RIGE_ALMACEN: "datos/../almacen" }, esperado: resolve("almacen") },
      { plataforma: "linux", entorno: { RIGE_ALMACEN: "datos/../almacen" }, esperado: resolve("almacen") },
    ];
    for (const { plataforma, entorno, esperado } of casos) {
      expect(new ConfiguracionSistema({ rutaArchivo, plataforma, entorno }).leer())
        .toEqual({ exito: true, valor: { puerto: 4747, directorioAlmacen: esperado } });
    }
    comprobarError(new ConfiguracionSistema({ rutaArchivo, plataforma: "win32", entorno: { LOCALAPPDATA: " " } }).leer(), "LOCALAPPDATA");
    comprobarError(new ConfiguracionSistema({ rutaArchivo, plataforma: "linux", entorno: { HOME: " " } }).leer(), "HOME");
  });
});

describe("C4-8", () => {
  test("conserva SHA-256 y entradas; no crea el almacen ni el archivo ausente", () => {
    const { temporal, rutaArchivo } = escenario("RIGE_PUERTO=5000");
    const directorioAlmacen = join(temporal, "no-creado");
    const resumen = () => createHash("sha256").update(readFileSync(rutaArchivo)).digest("hex");
    const antes = resumen();
    const lector = new ConfiguracionSistema({ rutaArchivo, plataforma: "linux", entorno: { RIGE_ALMACEN: directorioAlmacen } });
    expect(lector.leer().exito).toBe(true);
    expect(lector.leer().exito).toBe(true);
    expect(resumen()).toBe(antes);
    expect(readdirSync(temporal)).toEqual(["rige.env"]);
    expect(existsSync(directorioAlmacen)).toBe(false);
    rmSync(rutaArchivo);
    expect(lector.leer().exito).toBe(true);
    expect(readdirSync(temporal)).toEqual([]);
  });
});

describe("C4-9", () => {
  test("rechaza comillas simples y dobles en los valores del archivo y nombra la clave", () => {
    const { temporal, rutaArchivo } = escenario();
    for (const [clave, valor] of [["RIGE_ALMACEN", '"C:\\x"'], ["RIGE_ALMACEN", "'x'"], ["RIGE_PUERTO", '"4747"']] as const) {
      writeFileSync(rutaArchivo, `${clave}=${valor}`);
      for (const entorno of [{ HOME: temporal }, { RIGE_ALMACEN: temporal, RIGE_PUERTO: "6000" }]) {
        const resultado = new ConfiguracionSistema({ rutaArchivo, plataforma: "linux", entorno }).leer();
        comprobarError(resultado, clave);
        if (resultado.exito) throw new Error("Se esperaba error de comillas");
        expect(resultado.error.mensaje).toContain("comillas");
      }
    }
  });
});
