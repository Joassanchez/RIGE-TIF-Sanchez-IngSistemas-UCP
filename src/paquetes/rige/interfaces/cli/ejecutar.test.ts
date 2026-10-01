import { describe, expect, test } from "bun:test";
import { versionRige, type RespuestaEstado } from "../../aplicacion/respuestas/estado";
import { errorAlmacenSinEsquema, errorConfiguracionInvalida, errorPuertoOcupado } from "../../aplicacion/errores";
import { ejecutarCli, type Ensamblado } from "./ejecutar";
import { analizarFuente, tokenizar } from "../../../../pruebas/utilidades/analisis-arquitectura";
import { resolve } from "node:path";

describe("V-1", () => {
  test("la version coincide con el manifiesto y solo se declara en estado.ts", async () => {
    const raiz = resolve(import.meta.dir, "../../../..");
    const manifiesto = await Bun.file(resolve(raiz, "package.json")).json();
    expect(versionRige).toBe(manifiesto.version);
    const duplicados: string[] = [];
    for (const carpeta of ["paquetes", "pruebas"]) {
      for (const ruta of new Bun.Glob("**/*.ts").scanSync({ cwd: resolve(raiz, carpeta) })) {
        const relativa = `${carpeta}/${ruta.replaceAll("\\", "/")}`;
        if (relativa === "paquetes/rige/aplicacion/respuestas/estado.ts") continue;
        if ((await Bun.file(resolve(raiz, relativa)).text()).includes(manifiesto.version)) duplicados.push(relativa);
      }
    }
    expect(duplicados.sort()).toEqual([]);
  });
});

describe("CLI-7", () => {
  test("todos los imports, incluidos los de tipos, proceden de aplicacion o del runtime", async () => {
    const codigo = await Bun.file(new URL("./ejecutar.ts", import.meta.url)).text();
    const tokens = tokenizar(codigo);
    const imports = tokens.filter((token, indice) => token.cadena &&
      (tokens[indice - 1]?.valor === "from" || tokens[indice - 1]?.valor === "import"))
      .map((token) => token.valor);
    expect(imports.length).toBeGreaterThan(0);
    expect(imports.filter((destino) => !destino.startsWith("../../aplicacion/") && destino !== "node:util")).toEqual([]);
    const resultado = await Bun.file(new URL("../../aplicacion/respuestas/resultado.ts", import.meta.url)).text();
    expect(analizarFuente("paquetes/rige/aplicacion/respuestas/resultado.ts", resultado, {
      dependencias: { "@rige/nucleo": "workspace:*" },
    })).toEqual([]);
  });
});

const respuesta: RespuestaEstado = {
  esquema: 1, versionRige, almacen: { ruta: "/temporal/rige.db", versionEsquema: 1 },
};
const noWeb = {
  consultarEstado: () => { throw new Error("No debe consultar estado"); },
  iniciarServidor: () => { throw new Error("No debe iniciar servidor"); },
};
const exitoso = (): Ensamblado => ({
  exito: true, valor: { ...noWeb, prepararAlmacen: () => ({ exito: true, valor: respuesta }) },
});

function ejecutar(argumentos: readonly string[], ensamblar: () => Ensamblado = exitoso) {
  let salida = "";
  let error = "";
  const codigo = ejecutarCli(argumentos, ensamblar, {
    escribirSalida: (texto) => { salida += texto; },
    escribirError: (texto) => { error += texto; },
  });
  return { codigo, salida, error };
}

describe("CLI-1", () => {
  test("serializa la respuesta valida en una sola linea del canal de salida", () => {
    expect(ejecutar(["esquema"])).toEqual({
      codigo: 0, salida: JSON.stringify(respuesta) + "\n", error: "",
    });
  });
});

describe("CLI-2", () => {
  test("presenta errores de uso del ensamblado y del caso de uso en el canal de error", () => {
    for (const origen of ["ensamblado", "caso de uso"]) {
      const error = origen === "ensamblado"
        ? errorConfiguracionInvalida("RIGE_PUERTO", "valor de prueba")
        : errorAlmacenSinEsquema;
      const ensamblar = (): Ensamblado => origen === "ensamblado"
        ? { exito: false, error }
        : { exito: true, valor: { ...noWeb, prepararAlmacen: () => ({ exito: false, error }) } };
      expect(ejecutar(["esquema"], ensamblar)).toEqual({
        codigo: 1, salida: "", error: JSON.stringify({ esquema: 1, error }) + "\n",
      });
    }
  });
});

describe("CLI-3", () => {
  test("da un mensaje propio en espanol con todos los argumentos recibidos", () => {
    for (const argumentos of [["--x", "esquema"], ["esquema", "--depurar=si"]]) {
      expect(ejecutar(argumentos, () => { throw new Error("No debe ensamblar"); })).toEqual({
        codigo: 2, salida: "",
        error: JSON.stringify({
          esquema: 1, error: { codigo: "argumentos-invalidos", mensaje: `Argumentos invalidos: ${argumentos.join(" ")}.` },
        }) + "\n",
      });
    }
  });
  test("rechaza argumentos invalidos sin ensamblar, incluidos errores de parseArgs", () => {
    const invalidos = [
      { argumentos: [], mencionado: "subcomando" },
      { argumentos: ["otro"], mencionado: "otro" },
      { argumentos: ["esquema", "extra"], mencionado: "extra" },
      { argumentos: ["esquema", "--x"], mencionado: "--x" },
      { argumentos: ["esquema", "--depurar=si"], mencionado: "--depurar" },
    ];
    for (const { argumentos, mencionado } of invalidos) {
      let llamadas = 0;
      const resultado = ejecutar(argumentos, () => { llamadas++; return exitoso(); });
      expect(resultado.codigo).toBe(2);
      expect(resultado.salida).toBe("");
      const error = JSON.parse(resultado.error);
      expect(error).toEqual({
        esquema: 1,
        error: { codigo: "argumentos-invalidos", mensaje: expect.stringContaining(mencionado) },
      });
      expect(resultado.error).toBe(JSON.stringify(error) + "\n");
      expect(llamadas).toBe(0);
    }
  });
});

describe("CLI-4", () => {
  test("captura fallas del ensamblado y del caso de uso sin publicar su detalle", () => {
    const falla = new Error("Detalle privado de infraestructura");
    falla.stack = "Stack privado de infraestructura";
    const ensamblados: (() => Ensamblado)[] = [
      () => { throw falla; },
      () => ({ exito: true, valor: { ...noWeb, prepararAlmacen: () => { throw falla; } } }),
    ];
    for (const ensamblar of ensamblados) {
      expect(ejecutar(["esquema"], ensamblar)).toEqual({
        codigo: 70, salida: "",
        error: JSON.stringify({ esquema: 1, error: { codigo: "interno", mensaje: "Falla interna de RIGE." } }) + "\n",
      });
    }
  });
});

describe("CLI-5", () => {
  test("depurar agrega solo el stack interno y admite ambas posiciones", () => {
    const falla = new Error("Detalle privado de infraestructura");
    falla.stack = "Stack de prueba";
    const errorConfiguracion = errorConfiguracionInvalida("RIGE_PUERTO", "valor de prueba");
    const errorEnsamblado = (): Ensamblado => ({ exito: false, error: errorConfiguracion });
    const errorCaso = (): Ensamblado => ({
      exito: true, valor: { ...noWeb, prepararAlmacen: () => ({ exito: false, error: errorAlmacenSinEsquema }) },
    });
    const casos = [
      { argumentos: ["esquema"], ensamblar: exitoso },
      { argumentos: ["esquema"], ensamblar: errorEnsamblado },
      { argumentos: ["esquema"], ensamblar: errorCaso },
      { argumentos: [], ensamblar: exitoso },
      { argumentos: ["otro"], ensamblar: exitoso },
      { argumentos: ["esquema", "extra"], ensamblar: exitoso },
      { argumentos: ["esquema", "--x"], ensamblar: exitoso },
      { argumentos: ["esquema", "--depurar=si"], ensamblar: exitoso },
    ];
    for (const { argumentos, ensamblar } of casos) {
      const normal = ejecutar(argumentos, ensamblar);
      for (const depurados of [["--depurar", ...argumentos], [...argumentos, "--depurar"]]) {
        const esperado = argumentos.some((argumento) => argumento === "--x" || argumento === "--depurar=si")
          ? { ...normal, error: JSON.stringify({
            esquema: 1, error: { codigo: "argumentos-invalidos", mensaje: `Argumentos invalidos: ${depurados.join(" ")}.` },
          }) + "\n" }
          : normal;
        expect(ejecutar(depurados, ensamblar)).toEqual(esperado);
      }
    }
    const fallas: (() => Ensamblado)[] = [
      () => { throw falla; },
      () => ({ exito: true, valor: { ...noWeb, prepararAlmacen: () => { throw falla; } } }),
    ];
    for (const ensamblar of fallas) {
      for (const argumentos of [["--depurar", "esquema"], ["esquema", "--depurar"]]) {
        expect(ejecutar(argumentos, ensamblar)).toEqual({
          codigo: 70, salida: "",
          error: JSON.stringify({
            esquema: 1, error: { codigo: "interno", mensaje: "Falla interna de RIGE.", stack: falla.stack },
          }) + "\n",
        });
      }
    }
  });
});

describe("CLI-6", () => {
  test("consulta antes de iniciar, serializa direccion y conserva errores y aislamiento de esquema", () => {
    const direccion = "http://127.0.0.1:12345";
    const orden: string[] = [];
    const ensamblado: Ensamblado = {
      exito: true, valor: {
        prepararAlmacen: () => { throw new Error("No debe preparar almacen"); },
        consultarEstado: () => { orden.push("consultar"); return { exito: true, valor: respuesta }; },
        iniciarServidor: () => { orden.push("iniciar"); return { exito: true, valor: { direccion, detener() {} } }; },
      },
    };
    expect(ejecutar(["servir"], () => { orden.push("ensamblar"); return ensamblado; })).toEqual({
      codigo: 0, salida: JSON.stringify({ esquema: 1, direccion }) + "\n", error: "",
    });
    expect(orden).toEqual(["ensamblar", "consultar", "iniciar"]);
    if (!ensamblado.exito) throw new Error("Doble invalido");
    const casos = ensamblado.valor;
    for (const error of [errorAlmacenSinEsquema, errorPuertoOcupado(12345)]) {
      const consultarEstado = error.codigo === "almacen-sin-esquema"
        ? () => ({ exito: false as const, error }) : casos.consultarEstado;
      const iniciarServidor = error.codigo === "almacen-sin-esquema"
        ? noWeb.iniciarServidor : () => ({ exito: false as const, error });
      expect(ejecutar(["servir"], () => ({ exito: true, valor: { ...casos, consultarEstado, iniciarServidor } }))).toEqual({
        codigo: 1, salida: "", error: JSON.stringify({ esquema: 1, error }) + "\n",
      });
    }
    const falla = new Error("Detalle privado");
    const fallas: (() => Ensamblado)[] = [
      () => { throw falla; },
      () => ({ exito: true, valor: { ...casos, consultarEstado: () => { throw falla; } } }),
      () => ({ exito: true, valor: { ...casos, iniciarServidor: () => { throw falla; } } }),
    ];
    for (const ensamblar of fallas) {
      expect(ejecutar(["servir"], ensamblar)).toEqual({
        codigo: 70, salida: "",
        error: JSON.stringify({ esquema: 1, error: { codigo: "interno", mensaje: "Falla interna de RIGE." } }) + "\n",
      });
    }
    expect(ejecutar(["servir"], () => ({ exito: false, error: errorAlmacenSinEsquema })).codigo).toBe(1);
    expect(ejecutar(["esquema"])).toEqual({ codigo: 0, salida: JSON.stringify(respuesta) + "\n", error: "" });
  });
});
