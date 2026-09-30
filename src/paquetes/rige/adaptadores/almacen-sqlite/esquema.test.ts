import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { Database } from "bun:sqlite";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { AlmacenSqlite, abrirConexion } from "./esquema";

const temporales: string[] = [];
const conexiones: Database[] = [];
function escenario() {
  const temporal = mkdtempSync(join(tmpdir(), "rige-esquema-"));
  temporales.push(temporal);
  const directorio = join(temporal, "nuevo", "almacen");
  const ruta = join(directorio, "rige.db");
  return { temporal, directorio, ruta, almacen: new AlmacenSqlite(directorio, { existe: existsSync }) };
}
function abrir(ruta: string) {
  const base = abrirConexion(ruta);
  conexiones.push(base);
  return base;
}
function preparada() {
  const datos = escenario();
  expect(datos.almacen.preparar().exito).toBe(true);
  return { ...datos, base: abrir(datos.ruta) };
}
function inventario(base: Database) {
  return base.query("SELECT type, name, tbl_name, sql FROM sqlite_schema ORDER BY type, name").all();
}
function resolucion(base: Database, cambios: Record<string, string | number | null> = {}) {
  const valores = {
    id: 1, proyecto_id: 1, instante: "2026-09-30T00:00:00Z", resumen_entradas: "a".repeat(64),
    herramienta: "herramienta-ficticia", version_herramienta: "1", version_rige: "0.1.0",
    formato_documento: 1, documento: "{}", ...cambios,
  };
  const claves = Object.keys(valores);
  base.query(`INSERT INTO resolucion (${claves.join(",")}) VALUES (${claves.map(() => "?").join(",")})`)
    .run(...Object.values(valores));
}
function entrada(base: Database, cambios: Record<string, string | number | null> = {}) {
  const valores = {
    resolucion_id: 1, orden: 0, via: "via-ficticia", referencia: "/entrada", resumen: "b".repeat(64),
    condicion: "observada", ...cambios,
  };
  const claves = Object.keys(valores);
  base.query(`INSERT INTO entrada_leida (${claves.join(",")}) VALUES (${claves.map(() => "?").join(",")})`)
    .run(...Object.values(valores));
}
function conResolucion() {
  const datos = preparada();
  datos.base.run("INSERT INTO proyecto (id, ruta) VALUES (1, '/proyecto')");
  resolucion(datos.base);
  return datos;
}

afterEach(() => {
  for (const base of conexiones.splice(0)) base.close();
  for (const temporal of temporales.splice(0)) rmSync(temporal, { recursive: true, force: true });
});

describe("T0-09 preparacion explicita SQLite", () => {
  test("el constructor no hace E/S y preparar crea solo su directorio y base", () => {
    const { temporal, directorio, ruta, almacen } = escenario();
    expect(readdirSync(temporal)).toEqual([]);
    expect(almacen.preparar()).toEqual({
      exito: true, valor: { ruta: resolve(ruta).replaceAll("\\", "/"), versionEsquema: 1 },
    });
    expect(existsSync(directorio)).toBe(true);
    expect(readdirSync(directorio)).toEqual(["rige.db"]);
    expect(abrir(ruta).query("PRAGMA user_version").get()).toEqual({ user_version: 1 });
  });

  test("una base vacia se prepara; repetir conserva esquema, registros y bytes", () => {
    const { directorio, ruta, almacen } = escenario();
    mkdirSync(directorio, { recursive: true });
    new Database(ruta, { create: true }).close();
    expect(almacen.preparar().exito).toBe(true);
    const base = abrir(ruta);
    base.run("INSERT INTO proyecto (ruta) VALUES ('/conservado')");
    const antes = inventario(base);
    const version = base.query("PRAGMA schema_version").get();
    base.close();
    conexiones.pop();
    const bytes = readFileSync(ruta);
    expect(almacen.preparar().exito).toBe(true);
    expect(readFileSync(ruta)).toEqual(bytes);
    const despues = abrir(ruta);
    expect(inventario(despues)).toEqual(antes);
    expect(despues.query("PRAGMA schema_version").get()).toEqual(version);
    expect(despues.query("SELECT ruta FROM proyecto").all()).toEqual([{ ruta: "/conservado" }]);
  });

  test.each([0, 2, 99])("rechaza version %i con tabla ajena sin alterar bytes", (version) => {
    const { directorio, ruta, almacen } = escenario();
    mkdirSync(directorio, { recursive: true });
    const base = new Database(ruta, { create: true });
    base.exec(`CREATE TABLE ajena (dato TEXT); INSERT INTO ajena VALUES ('conservar'); PRAGMA user_version = ${version}`);
    base.close();
    const bytes = readFileSync(ruta);
    expect(almacen.preparar()).toEqual({ exito: false, error: {
      codigo: "almacen-sin-esquema", mensaje: "El almacen no tiene el esquema esperado. Ejecute bun run esquema.",
    } });
    expect(readFileSync(ruta)).toEqual(bytes);
  });

  test.each(["DROP TRIGGER resolucion_inmutable", "DROP INDEX resolucion_por_resumen",
    "CREATE TABLE adicional (id INTEGER)", "DROP TABLE entrada_leida"])(
    "rechaza estructura incompatible con user_version 1: %s", (sql) => {
      const { base, ruta, almacen } = preparada();
      base.exec(sql);
      const antes = inventario(base);
      const version = base.query("PRAGMA schema_version").get();
      expect(almacen.preparar().exito).toBe(false);
      expect(inventario(base)).toEqual(antes);
      expect(base.query("PRAGMA schema_version").get()).toEqual(version);
      expect(existsSync(ruta)).toBe(true);
    },
  );

  test("rollback real elimina todo el guion y user_version ante falla posterior al SQL", () => {
    const { ruta, almacen } = escenario();
    const original = Database.prototype.exec;
    const falla = new Error("Falla despues del guion");
    const sonda = spyOn(Database.prototype, "exec").mockImplementation(function (this: Database, sql, ...parametros) {
      const resultado = original.call(this, sql, ...parametros);
      if (this.filename === ruta && String(sql).includes("CREATE TABLE proyecto")) throw falla;
      return resultado;
    });
    try {
      expect(() => almacen.preparar()).toThrow(falla);
    } finally {
      sonda.mockRestore();
    }
    const base = abrir(ruta);
    expect(base.query("PRAGMA user_version").get()).toEqual({ user_version: 0 });
    expect(inventario(base)).toEqual([]);
    expect(almacen.preparar().exito).toBe(true);
  });

  test("la consulta ausente no crea carpetas ni base", () => {
    const { temporal, almacen } = escenario();
    expect(almacen.consultar().exito).toBe(false);
    expect(readdirSync(temporal)).toEqual([]);
  });

  test("consulta valida solo lee; consulta incompatible no migra", () => {
    const { base, almacen } = preparada();
    const antes = inventario(base);
    expect(almacen.consultar()).toEqual(almacen.preparar());
    base.exec("PRAGMA user_version = 7");
    expect(almacen.consultar().exito).toBe(false);
    expect(base.query("PRAGMA user_version").get()).toEqual({ user_version: 7 });
    expect(inventario(base)).toEqual(antes);
  });

  test("excepciones del lector de existencia y archivo corrupto se propagan", () => {
    const { directorio, ruta } = escenario();
    const falla = new Error("Lectura de prueba");
    const almacen = new AlmacenSqlite(directorio, { existe: () => { throw falla; } });
    expect(() => almacen.consultar()).toThrow(falla);
    mkdirSync(directorio, { recursive: true });
    writeFileSync(ruta, "no es SQLite");
    const corrupto = new AlmacenSqlite(directorio, { existe: existsSync });
    expect(() => corrupto.preparar()).toThrow();
    expect(() => corrupto.consultar()).toThrow();
    expect(readFileSync(ruta, "utf8")).toBe("no es SQLite");
  });

  test("todas las conexiones configuran FK, WAL, espera y borrado seguro", () => {
    const { ruta } = preparada();
    for (const soloLectura of [false, true, false]) {
      const base = abrirConexion(ruta, soloLectura);
      try {
        expect(base.query("PRAGMA foreign_keys").get()).toEqual({ foreign_keys: 1 });
        expect(base.query("PRAGMA journal_mode").get()).toEqual({ journal_mode: "wal" });
        expect(base.query("PRAGMA busy_timeout").get()).toEqual({ timeout: 5000 });
        expect(base.query("PRAGMA secure_delete").get()).toEqual({ secure_delete: 1 });
        expect(() => base.run("INSERT INTO resolucion (proyecto_id) VALUES (999)")).toThrow();
      } finally { base.close(); }
    }
  });
});

describe("T0-09 modelo y restricciones SQL genericas", () => {
  test("tres tablas con columnas, tipos, nulabilidad, claves y sin defaults implicitos", () => {
    const { base } = preparada();
    expect(base.query("SELECT name FROM sqlite_schema WHERE type = 'table' ORDER BY name").all())
      .toEqual([{ name: "entrada_leida" }, { name: "proyecto" }, { name: "resolucion" }]);
    const tablas = {
      proyecto: [["id", "INTEGER", 0, 1], ["ruta", "TEXT", 1, 0]],
      resolucion: [["id", "INTEGER", 0, 1], ["proyecto_id", "INTEGER", 1, 0], ["instante", "TEXT", 1, 0],
        ["resumen_entradas", "TEXT", 1, 0], ["herramienta", "TEXT", 1, 0], ["version_herramienta", "TEXT", 1, 0],
        ["version_rige", "TEXT", 1, 0], ["formato_documento", "INTEGER", 1, 0], ["documento", "TEXT", 1, 0]],
      entrada_leida: [["resolucion_id", "INTEGER", 1, 1], ["orden", "INTEGER", 1, 2], ["via", "TEXT", 1, 0],
        ["referencia", "TEXT", 1, 0], ["resumen", "TEXT", 0, 0], ["condicion", "TEXT", 1, 0]],
    };
    for (const [tabla, columnas] of Object.entries(tablas)) {
      const filas = base.query<{ name: string; type: string; notnull: number; pk: number; dflt_value: null }, []>(`PRAGMA table_info(${tabla})`).all();
      expect(filas.map(({ name, type, notnull, pk }) => [name, type, notnull, pk])).toEqual(columnas);
      expect(filas.every(({ dflt_value }) => dflt_value === null)).toBe(true);
    }
  });

  test("proyecto exige ruta unica y no nula", () => {
    const { base } = preparada();
    base.run("INSERT INTO proyecto (ruta) VALUES ('/unico')");
    expect(() => base.run("INSERT INTO proyecto (ruta) VALUES ('/unico')")).toThrow();
    expect(() => base.run("INSERT INTO proyecto (ruta) VALUES (NULL)")).toThrow();
  });

  test("indices de resolucion tienen las columnas y el orden requeridos", () => {
    const { base } = preparada();
    expect(base.query<{ name: string }, []>("PRAGMA index_info(resolucion_por_proyecto_instante)").all()
      .map(({ name }) => name)).toEqual(["proyecto_id", "instante"]);
    expect(base.query<{ name: string }, []>("PRAGMA index_info(resolucion_por_resumen)").all()
      .map(({ name }) => name)).toEqual(["resumen_entradas"]);
  });

  test.each(["proyecto_id", "instante", "resumen_entradas", "herramienta", "version_herramienta",
    "version_rige", "formato_documento", "documento"])("resolucion rechaza NULL en %s", (columna) => {
    const { base } = preparada();
    base.run("INSERT INTO proyecto (id, ruta) VALUES (1, '/proyecto')");
    expect(() => resolucion(base, { [columna]: null })).toThrow();
  });

  test.each(["a".repeat(63), "a".repeat(65), "g".repeat(64), "" , "a".repeat(63) + "\0"])(
    "resolucion rechaza resumen no hexadecimal de 64 caracteres: %j", (resumen) => {
      const { base } = preparada();
      base.run("INSERT INTO proyecto (id, ruta) VALUES (1, '/proyecto')");
      expect(() => resolucion(base, { resumen_entradas: resumen })).toThrow();
    },
  );

  test("JSON valido y hexadecimales mixtos se aceptan; JSON invalido no", () => {
    const { base } = preparada();
    base.run("INSERT INTO proyecto (id, ruta) VALUES (1, '/proyecto')");
    resolucion(base, { resumen_entradas: "aB01".repeat(16), documento: '{"valor":1}' });
    expect(() => resolucion(base, { id: 2, documento: "{" })).toThrow();
    expect(base.query("SELECT documento FROM resolucion").get()).toEqual({ documento: '{"valor":1}' });
  });

  test("FK rechaza huerfanos y cascada borra resolucion y entradas", () => {
    const { base } = conResolucion();
    expect(() => resolucion(base, { id: 2, proyecto_id: 999 })).toThrow();
    expect(() => entrada(base, { resolucion_id: 999 })).toThrow();
    entrada(base);
    base.run("DELETE FROM proyecto WHERE id = 1");
    expect(base.query("SELECT * FROM resolucion").all()).toEqual([]);
    expect(base.query("SELECT * FROM entrada_leida").all()).toEqual([]);
    expect(base.query("PRAGMA foreign_key_check").all()).toEqual([]);
  });

  test("PK compuesta no admite orden repetido en una resolucion", () => {
    const { base } = conResolucion();
    entrada(base);
    expect(() => entrada(base)).toThrow();
    entrada(base, { orden: 1 });
    resolucion(base, { id: 2 });
    entrada(base, { resolucion_id: 2 });
    expect(base.query("SELECT count(*) AS cantidad FROM entrada_leida").get()).toEqual({ cantidad: 3 });
  });

  test.each(["resolucion_id", "orden", "via", "referencia", "condicion"])(
    "entrada_leida rechaza NULL en %s", (columna) => {
      const { base } = conResolucion();
      expect(() => entrada(base, { [columna]: null })).toThrow();
    },
  );

  test("via vacia falla; cualquier via no vacia se acepta sin validar catalogo", () => {
    const { base } = conResolucion();
    expect(() => entrada(base, { via: "" })).toThrow();
    entrada(base, { via: "via-desconocida-de-otro-adaptador" });
    entrada(base, { orden: 1, via: " " });
    expect(base.query("SELECT count(*) AS cantidad FROM entrada_leida").get()).toEqual({ cantidad: 2 });
  });

  test.each(["observada", "no_observada", "definida", "no_definida"])(
    "condicion %s acepta resumen nulo", (condicion) => {
      const { base } = conResolucion();
      entrada(base, { condicion, resumen: null });
      expect(base.query("SELECT condicion, resumen FROM entrada_leida").get()).toEqual({ condicion, resumen: null });
    },
  );

  test("condicion desconocida falla", () => {
    const { base } = conResolucion();
    expect(() => entrada(base, { condicion: "otra" })).toThrow();
  });

  test.each(["no_observada", "definida", "no_definida"])(
    "condicion %s rechaza un resumen con contenido", (condicion) => {
      const { base } = conResolucion();
      expect(() => entrada(base, { condicion })).toThrow();
    },
  );

  test.each(["resolucion", "entrada_leida"])("todo UPDATE en %s falla y conserva datos", (tabla) => {
    const { base } = conResolucion();
    entrada(base);
    const antes = base.query(`SELECT * FROM ${tabla}`).all();
    const columna = tabla === "resolucion" ? "documento" : "referencia";
    expect(() => base.run(`UPDATE ${tabla} SET ${columna} = ${columna}`)).toThrow("inmutable");
    expect(() => base.run(`UPDATE ${tabla} SET ${columna} = 'otro'`)).toThrow("inmutable");
    expect(base.query(`SELECT * FROM ${tabla}`).all()).toEqual(antes);
  });
});
