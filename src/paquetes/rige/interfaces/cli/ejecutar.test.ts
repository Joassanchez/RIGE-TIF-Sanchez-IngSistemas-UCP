import { describe, expect, test } from "bun:test";
import { versionRige, type RespuestaEstado } from "../../aplicacion/respuestas/estado";
import { errorAlmacenSinEsquema, errorConfiguracionInvalida, errorPuertoOcupado } from "../../aplicacion/errores";
import { ejecutarCli, type CasosUsoCli } from "./ejecutar";
import { analizarFuente, tokenizar } from "../../../../pruebas/utilidades/analisis-arquitectura";
import { resolve } from "node:path";
import { consultarValores } from "../../aplicacion/casos-uso/consultar-valores";
import { adaptadorFicticio } from "../../../../pruebas/utilidades/adaptador-ficticio";
import { crearEntornoMemoria } from "../../../../pruebas/utilidades/entorno-memoria";

describe("T4-01 tiempos CLI", () => {
  test("rechaza --tiempos fuera de consultas sin ensamblar", () => {
    for (const comando of ["esquema", "servir"]) {
      const resultado = ejecutar([comando, "--tiempos"], () => { throw new Error("No ensamblar"); });
      expect(resultado.codigo).toBe(2);
      expect(JSON.parse(resultado.error).error.mensaje).toBe(`${comando} no admite --tiempos.`);
    }
  });
  test("instrumenta el caso de uso solo a pedido y emite tiempos despues de las advertencias", () => {
    const argumentos = ["valores", "--proyecto", "/p", "--agente", "a"];
    const deps = { adaptador: adaptadorFicticio,
      entorno: crearEntornoMemoria({ archivos: { "/p/capa-a.json": '{"dato":1}', "/p/capa-b.json": '{}' } }),
      rutas: { canonica: () => "/p" } };
    let salidaNormal = "";
    for (const medir of [false, true]) {
      const errores: string[] = [];
      let salida = "";
      const codigo = ejecutarCli([...argumentos, ...(medir ? ["--tiempos"] : [])], (medicion) => {
        expect(medicion !== undefined).toBe(medir);
        return { ...noWeb, prepararAlmacen: noWeb.consultarEstado,
          consultarValores: (proyecto, agente, clave) => {
            const resultado = consultarValores({ ...deps, medicion }, proyecto, agente, clave);
            if (!resultado.exito) return resultado;
            return { exito: true, valor: { ...resultado.valor, declaraciones: ["aviso"], reglas: { aviso: "Mensaje" } } };
          } };
      }, { escribirSalida: texto => { salida += texto; }, escribirError: texto => errores.push(texto) }, ["aviso"]);
      expect(codigo).toBe(0);
      expect(errores[0]).toBe(JSON.stringify({ esquema: 2, advertencia: { codigo: "aviso", mensaje: "Mensaje" } }) + "\n");
      expect(errores).toHaveLength(medir ? 2 : 1);
      if (medir) {
        expect(salida).toBe(salidaNormal);
        expect(JSON.parse(errores[1]!).tiempos.lecturaMs).toBeGreaterThan(0);
      } else salidaNormal = salida;
    }
  });
});

describe("T3-01 R-11 advertencias CLI", () => {
  test("solo consultas emiten las declaraciones seleccionadas en su orden, con lista opcional", () => {
    const deps = { adaptador: adaptadorFicticio,
      entorno: crearEntornoMemoria({ archivos: { "/p/capa-a.json": '{"dato":1}', "/p/capa-b.json": '{}' } }),
      rutas: { canonica: () => "/p" } };
    const consulta = consultarValores(deps, "/p", "a", undefined);
    if (!consulta.exito) throw new Error(consulta.error.mensaje);
    const valor = { ...consulta.valor, declaraciones: ["segunda", "otra", "primera"],
      reglas: { ...consulta.valor.reglas, primera: "Mensaje uno", segunda: "Mensaje dos" } };
    const casos = { ...noWeb, prepararAlmacen: () => ({ exito: true as const,
      valor: { ...respuesta, declaraciones: valor.declaraciones, reglas: valor.reglas } }),
      consultarValores: () => ({ exito: true as const, valor }),
      consultarEntradas: () => { throw new Error("No consultar entradas en este doble"); },
      consultarAgentes: () => ({ exito: true as const, valor: { esquema: 2 as const, proyecto: "/p", entradas: [], resumenEntradas: "",
        agentes: [], eliminados: [], incompleta: false, motivos: [], declaraciones: valor.declaraciones, reglas: valor.reglas } }) };
    for (const argumentos of [["valores", "--proyecto", "/p", "--agente", "a"], ["agentes", "--proyecto", "/p"], ["esquema"]]) {
      for (const advertidas of [undefined, ["primera", "segunda"]]) {
        const errores: string[] = [];
        expect(ejecutarCli(argumentos, () => casos,
          { escribirSalida() {}, escribirError: texto => errores.push(texto) }, advertidas)).toBe(0);
        expect(errores).toEqual(argumentos[0] === "esquema" || advertidas === undefined ? [] : [
          JSON.stringify({ esquema: 2, advertencia: { codigo: "segunda", mensaje: "Mensaje dos" } }) + "\n",
          JSON.stringify({ esquema: 2, advertencia: { codigo: "primera", mensaje: "Mensaje uno" } }) + "\n",
        ]);
      }
    }
  });

  test("inyecta limitesGenerales en la presentacion de texto para filtrar avisos generales", () => {
    const deps = { adaptador: adaptadorFicticio,
      entorno: crearEntornoMemoria({ archivos: { "/p/capa-a.json": '{"dato":1}', "/p/capa-b.json": '{}' } }),
      rutas: { canonica: () => "/p" } };
    const consulta = consultarValores(deps, "/p", "a", undefined);
    if (!consulta.exito) throw new Error(consulta.error.mensaje);
    const valor = { ...consulta.valor, declaraciones: ["limite-general", "otro-aviso"],
      reglas: { "limite-general": "Aviso limite", "otro-aviso": "Aviso otro" } };
    let salida = "";
    const codigo = ejecutarCli(["valores", "--proyecto", "/p", "--agente", "a", "--texto"], () => ({
      ...noWeb, prepararAlmacen: noWeb.consultarEstado, consultarValores: () => ({ exito: true, valor }),
    }), { escribirSalida: t => { salida += t; }, escribirError() {} }, [], ["limite-general"]);
    expect(codigo).toBe(0);
    expect(salida).toContain("Aviso: Aviso otro");
    expect(salida).not.toContain("Aviso: Aviso limite");
  });
});

describe("A2-3 S-4", () => {
  test("propaga un codigo de uso desconocido del adaptador hasta la CLI", () => {
    const error = { categoria: "uso" as const, codigo: "codigo-nuevo", mensaje: "Codigo del adaptador" };
    const deps = { adaptador: { ...adaptadorFicticio, ubicar: () => ({ exito: false as const, error }) },
      entorno: crearEntornoMemoria({ archivos: {} }), rutas: { canonica: () => "/proyecto" } };
    const resultado = ejecutar(["valores", "--proyecto", "/proyecto", "--agente", "a"], () => ({
      ...noWeb, prepararAlmacen: () => { throw new Error("No preparar"); },
      consultarValores: (proyecto, agente, clave) => consultarValores(deps, proyecto, agente, clave) }));
    expect(resultado.codigo).toBe(1);
    expect(resultado.salida).toBe("");
    expect(JSON.parse(resultado.error).error.codigo).toBe(error.codigo);
  });
});

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
    for (const archivo of ["./ejecutar.ts", "./subcomandos.ts", "./ayuda.ts"]) {
      const codigo = await Bun.file(new URL(archivo, import.meta.url)).text();
      const tokens = tokenizar(codigo);
      const imports = tokens.filter((token, indice) => token.cadena &&
        (tokens[indice - 1]?.valor === "from" || tokens[indice - 1]?.valor === "import"))
        .map((token) => token.valor);
      expect(imports.length).toBeGreaterThan(0);
      expect(imports.filter((destino) => !destino.startsWith("../../aplicacion/") && !destino.startsWith("./texto/") && !["node:util", "./ayuda", "./subcomandos", "./sugerencias"].includes(destino))).toEqual([]);
    }
    const resultado = await Bun.file(new URL("../../aplicacion/respuestas/resultado.ts", import.meta.url)).text();
    expect(analizarFuente("paquetes/rige/aplicacion/respuestas/resultado.ts", resultado, {
      dependencias: { "@rige/nucleo": "workspace:*" },
    })).toEqual([]);
  });
});

const respuesta: RespuestaEstado = {
  esquema: 2, versionRige, almacen: { ruta: "/temporal/rige.db", versionEsquema: 1 },
};
const noWeb = {
  compararResoluciones: () => { throw new Error("No comparar en este doble"); },
  consultarProyectosRecientes: () => { throw new Error("No listar recientes en este doble"); },
  consultarReglas: () => { throw new Error("No consultar reglas en este doble"); },
  consultarHallazgos: () => { throw new Error("No consultar hallazgos en este doble"); },
  consultarPermiso: () => { throw new Error("No consultar permiso"); },
  consultarEntradas: () => { throw new Error("No consultar entradas en este doble"); },
  consultarAgentes: () => { throw new Error("No consultar agentes"); },
  consultarValores: () => { throw new Error("No consultar valores"); },
  consultarEstado: () => { throw new Error("No debe consultar estado"); },
  describirAlmacen: () => { throw new Error("No debe describir almacen"); },
  iniciarServidor: () => { throw new Error("No debe iniciar servidor"); },
};
const exitoso = (): CasosUsoCli => ({
  ...noWeb, prepararAlmacen: () => ({ exito: true, valor: respuesta }),
});

function ejecutar(argumentos: readonly string[], ensamblar: () => CasosUsoCli = exitoso) {
  let salida = "";
  let error = "";
  const codigo = ejecutarCli(argumentos, ensamblar, {
    carpetaActual: "/p",
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
  test("presenta errores de uso del caso de uso en el canal de error", () => {
    for (const error of [errorConfiguracionInvalida("RIGE_PUERTO", "valor de prueba"), errorAlmacenSinEsquema]) {
      const ensamblar = (): CasosUsoCli => ({
        ...noWeb, prepararAlmacen: () => ({ exito: false, error }),
      });
      expect(ejecutar(["esquema"], ensamblar)).toEqual({
        codigo: 1, salida: "", error: JSON.stringify({ esquema: 2, error }) + "\n",
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
          esquema: 2, error: { codigo: "argumentos-invalidos", mensaje: `Argumentos inválidos: ${argumentos.join(" ")}.` },
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
      { argumentos: ["esquema", "--proyecto", "/p"], mencionado: "--proyecto" },
      { argumentos: ["servir", "--agente", "a"], mencionado: "--agente" },
      { argumentos: ["valores", "--proyecto", "/p"], mencionado: "--agente" },
      { argumentos: ["valores", "--agente", "a", "--proyecto", ""], mencionado: "--proyecto" },
      { argumentos: ["valores", "--proyecto", "/p", "--agente", "a", "--clave", ""], mencionado: "--clave" },
    ];
    for (const { argumentos, mencionado } of invalidos) {
      let llamadas = 0;
      const resultado = ejecutar(argumentos, () => { llamadas++; return exitoso(); });
      expect(resultado.codigo).toBe(2);
      expect(resultado.salida).toBe("");
      const error = JSON.parse(resultado.error);
      expect(error).toEqual({
        esquema: 2,
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
    const ensamblados: (() => CasosUsoCli)[] = [
      () => { throw falla; },
      () => ({ ...noWeb, prepararAlmacen: () => { throw falla; } }),
    ];
    for (const ensamblar of ensamblados) {
      expect(ejecutar(["esquema"], ensamblar)).toEqual({
        codigo: 70, salida: "",
        error: JSON.stringify({ esquema: 2, error: { codigo: "interno", mensaje: "Falla interna de RIGE." } }) + "\n",
      });
    }
  });
});

describe("CLI-5", () => {
  test("depurar agrega solo el stack interno y admite ambas posiciones", () => {
    const falla = new Error("Detalle privado de infraestructura");
    falla.stack = "Stack de prueba";
    const errorConfiguracion = errorConfiguracionInvalida("RIGE_PUERTO", "valor de prueba");
    const errorConfiguracionCaso = (): CasosUsoCli => ({
      ...noWeb, prepararAlmacen: () => ({ exito: false, error: errorConfiguracion }),
    });
    const errorCaso = (): CasosUsoCli => ({
      ...noWeb, prepararAlmacen: () => ({ exito: false, error: errorAlmacenSinEsquema }),
    });
    const casos = [
      { argumentos: ["esquema"], ensamblar: exitoso },
      { argumentos: ["esquema"], ensamblar: errorConfiguracionCaso },
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
            esquema: 2, error: { codigo: "argumentos-invalidos", mensaje: `Argumentos inválidos: ${depurados.join(" ")}.` },
          }) + "\n" }
          : normal;
        expect(ejecutar(depurados, ensamblar)).toEqual(esperado);
      }
    }
    const fallas: (() => CasosUsoCli)[] = [
      () => { throw falla; },
      () => ({ ...noWeb, prepararAlmacen: () => { throw falla; } }),
    ];
    for (const ensamblar of fallas) {
      for (const argumentos of [["--depurar", "esquema"], ["esquema", "--depurar"]]) {
        expect(ejecutar(argumentos, ensamblar)).toEqual({
          codigo: 70, salida: "",
          error: JSON.stringify({
            esquema: 2, error: { codigo: "interno", mensaje: "Falla interna de RIGE.", stack: falla.stack },
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
    const casos: CasosUsoCli = {
      ...noWeb,
      consultarValores: noWeb.consultarValores,
      prepararAlmacen: () => { throw new Error("No debe preparar almacen"); },
      consultarEstado: () => { orden.push("consultar"); return { exito: true, valor: respuesta }; },
      iniciarServidor: () => { orden.push("iniciar"); return { exito: true, valor: { direccion, detener() {} } }; },
    };
    expect(ejecutar(["servir"], () => { orden.push("ensamblar"); return casos; })).toEqual({
      codigo: 0, salida: JSON.stringify({ esquema: 2, direccion }) + "\n", error: "",
    });
    expect(orden).toEqual(["ensamblar", "consultar", "iniciar"]);
    for (const error of [errorAlmacenSinEsquema, errorPuertoOcupado(12345)]) {
      const consultarEstado = error.codigo === "almacen-sin-esquema"
        ? () => ({ exito: false as const, error }) : casos.consultarEstado;
      const iniciarServidor = error.codigo === "almacen-sin-esquema"
        ? noWeb.iniciarServidor : () => ({ exito: false as const, error });
      expect(ejecutar(["servir"], () => ({ ...casos, consultarEstado, iniciarServidor }))).toEqual({
        codigo: 1, salida: "", error: JSON.stringify({ esquema: 2, error }) + "\n",
      });
    }
    const falla = new Error("Detalle privado");
    const fallas: (() => CasosUsoCli)[] = [
      () => { throw falla; },
      () => ({ ...casos, consultarEstado: () => { throw falla; } }),
      () => ({ ...casos, iniciarServidor: () => { throw falla; } }),
    ];
    for (const ensamblar of fallas) {
      expect(ejecutar(["servir"], ensamblar)).toEqual({
        codigo: 70, salida: "",
        error: JSON.stringify({ esquema: 2, error: { codigo: "interno", mensaje: "Falla interna de RIGE." } }) + "\n",
      });
    }
    expect(ejecutar(["servir"], () => ({ ...casos, consultarEstado: () => ({ exito: false, error: errorAlmacenSinEsquema }) })).codigo).toBe(1);
    expect(ejecutar(["esquema"])).toEqual({ codigo: 0, salida: JSON.stringify(respuesta) + "\n", error: "" });
  });
});

describe("T5-33 reglas U-1 a U-5", () => {
  test("U-1 subcomando desconocido con candidato cercano en texto sugiere correccion", () => {
    const res = ejecutar(["valroes", "--texto"]);
    expect(res.codigo).toBe(2);
    expect(res.error).toBe("Error: Subcomando desconocido: valroes.\n¿Quisiste decir valores?\nUsá --help\n");
  });

  test("U-2 subcomando desconocido en JSON no emite sugerencia", () => {
    const res = ejecutar(["valroes", "--json"]);
    expect(res.codigo).toBe(2);
    expect(JSON.parse(res.error)).toEqual({
      esquema: 2,
      error: { codigo: "argumentos-invalidos", mensaje: "Subcomando desconocido: valroes." },
    });
  });

  test("U-3 opcion desconocida en texto sugiere opcion valida del subcomando", () => {
    const res = ejecutar(["valores", "--agente", "build", "--clav", "temperature", "--texto"]);
    expect(res.codigo).toBe(2);
    expect(res.error).toContain("¿Quisiste decir --clave?\nUsá --help\n");
  });

  test("U-4 subcomando sin candidato cercano en texto no emite linea de sugerencia", () => {
    const res = ejecutar(["xyz", "--texto"]);
    expect(res.codigo).toBe(2);
    expect(res.error).toBe("Error: Subcomando desconocido: xyz.\nUsá --help\n");
  });

  test("no confunde el valor de una opcion de cadena con el subcomando al sugerir", () => {
    const res = ejecutar(["--agente", "valores", "--clav", "x", "--texto"]);
    expect(res.codigo).toBe(2);
    expect(res.error).not.toContain("¿Quisiste decir");
  });

  test("U-5 rige --help incluye codigos de salida y rige valores --help no cambia", () => {
    const ayudaGeneral = ejecutar(["--help"]);
    expect(ayudaGeneral.codigo).toBe(0);
    expect(ayudaGeneral.salida).toContain("Códigos de salida:\n  0   respuesta válida, con o sin hallazgos\n  1   error de uso (proyecto o agente inexistente, almacén sin esquema, versión no soportada)\n  2   argumentos inválidos\n  70  falla interna\n");

    const ayudaValores = ejecutar(["valores", "--help"]);
    expect(ayudaValores.codigo).toBe(0);
    expect(ayudaValores.salida).not.toContain("Códigos de salida:");
  });
});
