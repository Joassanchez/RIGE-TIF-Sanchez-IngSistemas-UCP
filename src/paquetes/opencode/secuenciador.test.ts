import { describe, expect, test } from "bun:test";
import type { Aplicacion, Declaracion, LecturaEntrada, ValorJson } from "@rige/nucleo/contrato/adaptador";
import { secuenciar } from "./secuenciador";
import { reglas } from "./reglas";

describe("V1-03 S-4", () => {
  test("publica exactamente las plantillas del diseno y la ficha", () => {
    expect(reglas).toEqual({
      "numeracion-sin-directorios-externos": "Los índices no cuentan las reglas external_directory que OpenCode agrega por cada skill o referencia instalada.",
      "references-no-incorporado": "La configuración declara references o reference; RIGE no incorpora los directorios externos que aportan a los permisos.",
      "agente-deshabilitado": "disable: true elimina el agente, incluso si es nativo, despues de fusionar la configuracion.",
      "eje-parcialmente-observado": "El eje consultado está parcialmente observado; no se informa una decisión de permiso.",
      "comando-compuesto": "El comando es compuesto o no analizable; no se informa una decision de permiso (RF-08).",
      "tuberia": "Comando compuesto: tuberia (| o |&).",
      "encadenamiento": "Comando compuesto: encadenamiento (&&, || o ;).",
      "redireccion": "Comando compuesto: redireccion de entrada o salida.",
      "subshell": "Comando compuesto: subshell (parentesis).",
      "sustitucion": "Comando compuesto: sustitucion de comando.",
      "segundo-plano": "Comando compuesto: segundo-plano (&).",
      "salto-de-linea": "Comando compuesto: salto-de-linea.",
      "no-analizable": "Comando no-analizable: comilla, sustitucion sin cerrar o escape final.",
      "git-no-encontrado": "No se encontro un archivo ejecutable git en PATH. Se usa / como arbol de trabajo, como OpenCode sin Git.",
      "deteccion-git-aproximada": "Se detecto core.worktree, bare=true o safe.directory. La deteccion de Git mediante lectura no modela estas variantes (ADR-101 propuesto).",
      "fuera-del-arbol": "El archivo queda fuera del arbol de trabajo: OpenCode pide antes external_directory, un eje parcialmente observado; no se informa una decision.",
      "denegacion-subagente": "OpenCode agrega al final de la sesion hija una denegacion cuando la cadena propia no contiene el sujeto exacto (RD-05).",
      "reglas-agente-lanzador-excluidas": "Las reglas del agente que lanza mediante task no se aplican al subagente (RD-05, ADR-081).",
      "reglas-sesion-lanzadora-excluidas": "Las reglas de la sesion que lanza el subagente no integran el analisis estatico.",
      "agente-no-invocable-como-subagente": "El agente tiene mode primary y no es invocable como subagente; se evalua igualmente su cadena propia.",
      "primary-tools-no-incorporado": "Las denegaciones de sesion de experimental.primary_tools no integran el analisis.",
      "proteccion-nativa-anulada": "La declaracion determinante desactiva una proteccion nativa coincidente anterior (RD-07). El rastro identifica la regla nativa y la declaracion con su archivo y linea.",
      "aprobaciones-permanentes-excluidas": 'Las aprobaciones permanentes ("permitir siempre") no integran el análisis.',
      "sesion-no-interactiva-excluida": "En opencode run no interactivo, la sesión agrega al final question, plan_enter y plan_exit con efecto deny; RIGE evalúa la configuración del agente.",
      "nativa-general": "Regla de permiso incorporada en los defaults de OpenCode 1.18.25.",
      "nativa-agente": "Regla de permiso incorporada para el agente nativo de OpenCode 1.18.25.",
      "nativa-final": "OpenCode agrega al final el acceso al directorio de salidas, salvo deny explicito para ese patron exacto.",
      "orden-de-aplicacion": "OpenCode 1.18.25 aplica las entradas en orden de precedencia; prevalece la declaración de la última entrada que declara la clave (RD-01).",
      "fuera-del-v1": "Clave que OpenCode combina o deriva con reglas que el prototipo v1 no incorpora; se resuelve en una iteración posterior.",
      "markdown-no-observado": "Agente declarado también en Markdown, que el prototipo v1 no incorpora; sus claves no se informan para no presentar un valor incompleto.",
      "tools-legado-no-incorporado": "El alias legado tools aporta reglas a permission; RIGE no incorpora esa derivación y no informa los permisos de ese ámbito para evitar un resultado incompleto.",
      "sustitucion-no-incorporada": "Clave cuyo valor contiene una sustitución {env:…} o {file:…}; el prototipo v1 no incorpora sustituciones y no informa su valor (RNF-04).",
    });
  });
});

function declaracion(ruta: readonly string[], valor: ValorJson = 1): Declaracion {
  return { ruta, valor, posicion: { linea: 6, columna: 7 } };
}

function lectura(orden: number, declaraciones: readonly Declaracion[]): LecturaEntrada {
  return { orden, via: { via: "proyecto", referencia: "C:\\p\\opencode.jsonc", condicion: "observada" }, declaraciones };
}

describe("T2-04 F-1 F-2 secuencia", () => {
  test.each([
    [1, ["agent", "build", "options", "a", "b"], 2],
    [2, ["agent", "build", "options", "a"], 1],
    [1, ["agent", "build", "options", "a"], {}],
    [null, ["agent", "build", "options", "a", "b"], 2],
    [[1], ["agent", "build", "options", "a", "b"], 2],
  ] as const)("declara reemplazo de subarbol entre %j y %j", (valor, rutaPosterior, posterior) => {
    const ruta = ["agent", "build", "options", "a"];
    const primera = typeof valor === "number" && valor === 2 ? [...ruta, "b"] : ruta;
    const otra = declaracion(["agent", "build", "temperature"], 0.4);
    const similar = declaracion(["agent", "build", "options", "a.b"], 3);
    const resultado = secuenciar([lectura(0, [declaracion(primera, valor), otra]),
      lectura(1, [declaracion(rutaPosterior, posterior), similar])]);
    expect(resultado).toEqual({ exito: true, valor: {
      aplicaciones: [
        { origen: { tipo: "declarado", orden: 0, posicion: { linea: 6, columna: 7 } }, ruta: primera, valor, estrategia: "reemplazo", regla: "orden-de-aplicacion" },
        { origen: { tipo: "declarado", orden: 0, posicion: otra.posicion }, ruta: otra.ruta, valor: otra.valor, estrategia: "reemplazo", regla: "orden-de-aplicacion" },
        { origen: { tipo: "declarado", orden: 1, posicion: { linea: 6, columna: 7 } }, ruta: rutaPosterior, valor: posterior, estrategia: "reemplazoSubarbol", regla: "orden-de-aplicacion" },
        { origen: { tipo: "declarado", orden: 1, posicion: similar.posicion }, ruta: similar.ruta, valor: similar.valor, estrategia: "reemplazo", regla: "orden-de-aplicacion" },
      ], noResueltas: [],
    } });
  });
  test("un objeto vacio sin conflicto se aplica como hoja", () => {
    expect(secuenciar([lectura(0, [declaracion(["agent", "build", "options"], {})])])).toEqual({
      exito: true, valor: { aplicaciones: [{ origen: { tipo: "declarado", orden: 0, posicion: { linea: 6, columna: 7 } },
        ruta: ["agent", "build", "options"], valor: {}, estrategia: "reemplazo", regla: "orden-de-aplicacion" }], noResueltas: [] },
    });
  });
});

describe("V1-08 F-4", () => {
  test.each([false, true])("maxSteps excluye steps en todas las lecturas (invertidas=%j)", (invertidas) => {
    const normal = declaracion(["agent", "otro", "steps"], 8);
    const lecturas = [lectura(0, [declaracion(["agent", "build", "steps"], 12), normal]),
      lectura(1, [declaracion(["agent", "build", "maxSteps"], 7)])];
    const resultado = secuenciar(invertidas ? lecturas.toReversed() : lecturas);
    expect(resultado).toEqual({ exito: true, valor: {
      aplicaciones: [{ origen: { tipo: "declarado", orden: 0, posicion: normal.posicion }, ruta: normal.ruta, valor: normal.valor, estrategia: "reemplazo", regla: "orden-de-aplicacion" }],
      noResueltas: [
        { ruta: ["agent", "build", "steps"], regla: "fuera-del-v1" },
        { ruta: ["agent", "build", "maxSteps"], regla: "fuera-del-v1" },
      ],
    } });
  });
  test.each(["desconocida", "disabled", "toolset", "__proto__"])("%s bloquea su prefijo y options en todas las lecturas", (nombre) => {
    const otra = declaracion(["agent", "otro", "options", "propia"], 3);
    for (const desconocida of [declaracion(["agent", "build", nombre, "hija"]), declaracion(["agent", "build", nombre], {})]) {
      for (const invertidas of [false, true]) {
        const lecturas = [lectura(0, [declaracion(["agent", "build", "options", "propia"], 2), otra]), lectura(1, [desconocida])];
        expect(secuenciar(invertidas ? lecturas.toReversed() : lecturas)).toEqual({ exito: true, valor: {
          aplicaciones: [{ origen: { tipo: "declarado", orden: 0, posicion: otra.posicion }, ruta: otra.ruta, valor: otra.valor, estrategia: "reemplazo", regla: "orden-de-aplicacion" }],
          noResueltas: [
            { ruta: ["agent", "build", nombre], regla: "fuera-del-v1" },
            { ruta: ["agent", "build", "options"], regla: "fuera-del-v1" },
          ],
        } });
      }
    }
  });
});

describe("V1-08 F-5", () => {
  test.each(([
    "{env:CLAVE}", "antes {file:./x} despues", [1, "{env:CLAVE}"],
    [false, { anidada: [[{ cadena: "{file:./x}" }]] }],
  ] as const).map(valor => [valor] as const))("sustitucion en %j bloquea la ruta en todas las lecturas", (valor) => {
    const ruta = ["agent", "build", "prompt"];
    const otra = declaracion(["agent", "build", "steps"], 12);
    const resultado = secuenciar([lectura(0, [declaracion(ruta, "anterior"), otra]), lectura(1, [declaracion(ruta, valor)])]);
    expect(resultado).toEqual({ exito: true, valor: {
      aplicaciones: [{ origen: { tipo: "declarado", orden: 0, posicion: otra.posicion }, ruta: otra.ruta, valor: otra.valor, estrategia: "reemplazo", regla: "orden-de-aplicacion" }],
      noResueltas: [{ ruta, regla: "sustitucion-no-incorporada" }],
    } });
  });
  test("bloquea desde el primer segmento con sustitucion, incluidas otras hojas y objetos vacios", () => {
    for (const ruta of [["agent", "{env:AGENTE}", "prompt"], ["{env:RAIZ}", "{file:./x}"], ["agent", "build", "options", "{env:CLAVE}"]]) {
      const indice = ruta.findIndex(s => /\{(env|file):[^}]*\}/.test(s));
      const prefijo = ruta.slice(0, indice + 1);
      const otra = declaracion(["agent", "otro", "steps"], 12);
      const resultado = secuenciar([lectura(0, [declaracion([...prefijo, "description"]), otra]),
        lectura(1, [declaracion(ruta, {})])]);
      expect(resultado).toEqual({ exito: true, valor: {
        aplicaciones: [{ origen: { tipo: "declarado", orden: 0, posicion: otra.posicion }, ruta: otra.ruta, valor: otra.valor, estrategia: "reemplazo", regla: "orden-de-aplicacion" }],
        noResueltas: [{ ruta: prefijo, regla: "sustitucion-no-incorporada" }],
      } });
    }
  });
});

describe("V1-03 S-5 V1-08 F-7", () => {
  test.each([
    "/h/.config/opencode/agent/revisor/seguridad.md",
    "/h/.config/opencode/agents/revisor/seguridad.md",
    "/h/.config/opencode/mode/revisor/seguridad.md",
    "/h/.config/opencode/modes/revisor/seguridad.md",
    "/h/agents/otro/mode/revisor/seguridad.md",
    "/h/agent/agents/revisor/seguridad.md",
    "C:\\h\\modes\\otro\\agents\\revisor\\seguridad.md",
  ])("bloquea solo el agente indicado por elemento aun con Markdown posterior: %s", (referencia) => {
    const bloqueadas = [declaracion(["agent", "revisor/seguridad", "temperature"], 0.3),
      declaracion(["agent", "revisor/seguridad", "options", "steps"], 12)];
    const otras = [declaracion(["agent", "build", "steps"], 12),
      declaracion(["agent", "revisor/seguridad-extra", "temperature"], 0.1)];
    const markdown: LecturaEntrada = { orden: 1, via: { via: "markdown", referencia, condicion: "observada", elemento: "revisor/seguridad" }, declaraciones: [] };
    const json = lectura(0, [...bloqueadas, ...otras]);
    const jsonPosterior = lectura(2, bloqueadas);
    const esperado = { exito: true as const, valor: {
      aplicaciones: otras.map<Aplicacion>((declaracion) => ({ origen: { tipo: "declarado", orden: 0, posicion: declaracion.posicion }, ruta: declaracion.ruta, valor: declaracion.valor, estrategia: "reemplazo", regla: "orden-de-aplicacion" })),
      noResueltas: [{ ruta: ["agent", "revisor/seguridad"], regla: "markdown-no-observado" }],
    } };
    expect(secuenciar([json, markdown, jsonPosterior, { ...markdown, orden: 3 }])).toEqual(esperado);
    expect(secuenciar([markdown, json, jsonPosterior])).toEqual(esperado);
  });
  test("marca tambien los agentes que solo aparecen en Markdown", () => {
    expect(secuenciar([{ orden: 0, via: { via: "markdown", referencia: "/h/agents/revisor.md", condicion: "observada", elemento: "revisor" }, declaraciones: [] }])).toEqual({
      exito: true, valor: { aplicaciones: [], noResueltas: [{ ruta: ["agent", "revisor"], regla: "markdown-no-observado" }] },
    });
  });
  test("no deriva el nombre de segmentos internos de la referencia", () => {
    expect(secuenciar([{ orden: 0, via: { via: "markdown", referencia: "/h/agents/sub/agent/x.md", condicion: "observada", elemento: "sub/agent/x" }, declaraciones: [] }])).toEqual({
      exito: true, valor: { aplicaciones: [], noResueltas: [{ ruta: ["agent", "sub/agent/x"], regla: "markdown-no-observado" }] },
    });
  });
});

describe("V1-03 S-3 V1-08 F-6", () => {
  test.each([null, 1, "modo", []].map(valor => [valor] as const))("rechaza mode no objeto %j con referencia y posicion", (valor) => {
    expect(secuenciar([lectura(0, [declaracion(["steps"]), declaracion(["mode"], valor)])])).toEqual({
      exito: false, error: { categoria: "uso",
        codigo: "contenido-no-soportado",
        mensaje: "El prototipo v1 no incorpora mode (C:/p/opencode.jsonc:6:7).",
      },
    });
  });
  test.each([
    ["mode", "build", "temperature"], ["mode", "build"],
  ].map(ruta => [ruta] as const))("%j marca no resueltas sin abortar ni aplicar el agente en otras lecturas", (ruta) => {
    const otra = declaracion(["agent", "otro", "temperature"], 0.4);
    for (const valor of [true, {}]) {
      const lecturas = [lectura(0, [declaracion(["agent", "build", "steps"], 12), otra]),
        lectura(1, [declaracion(ruta, valor)])];
      for (const invertidas of [false, true]) {
        expect(secuenciar(invertidas ? lecturas.toReversed() : lecturas)).toEqual({ exito: true, valor: {
          aplicaciones: [{ origen: { tipo: "declarado", orden: 0, posicion: otra.posicion }, ruta: otra.ruta, valor: otra.valor, estrategia: "reemplazo", regla: "orden-de-aplicacion" }],
          noResueltas: [
            { ruta: ["agent", "build"], regla: "fuera-del-v1" },
            ...(ruta[0] === "mode" ? [{ ruta: ["mode", "build"], regla: "fuera-del-v1" }] : []),
          ],
        } });
      }
    }
  });
  test("T2-11b B-2 disable anidado invalido es un error de uso ubicado", () => {
    expect(secuenciar([lectura(0, [declaracion(["agent", "build", "disable", "x"], true)])]))
      .toMatchObject({ exito: false, error: { codigo: "configuracion-invalida",
        mensaje: "Configuracion invalida en agent.build.disable (C:/p/opencode.jsonc:6:7)." } });
  });
  test("no confunde segmentos parecidos ni disable dentro de options", () => {
    const declaraciones = [["modes"], ["disable"], ["agent", "build", "options", "disable"]].map((ruta) => declaracion(ruta));
    const resultado = secuenciar([lectura(0, declaraciones)]);
    expect(resultado.exito).toBe(true);
    if (!resultado.exito) throw new Error("Las rutas son soportadas");
    expect(resultado.valor.aplicaciones.map(({ ruta, valor, origen }) => ({ ruta, valor, posicion: origen.tipo === "declarado" ? origen.posicion : undefined }))).toEqual(declaraciones);
    expect(secuenciar([lectura(0, [declaracion(["mode"], {})])])).toEqual({ exito: true, valor: {
      aplicaciones: [], noResueltas: [],
    } });
  });
});

describe("V1-03 S-2", () => {
  test("excluye prefijos globales y de agentes sin repetirlos entre hojas o entradas", () => {
    const prefijos = [["permission"], ["tools"], ["instructions"], ["plugin"],
      ["agent", "build", "permission"], ["agent", "build", "tools"], ["agent", "review", "tools"]];
    const excluidas = prefijos.flatMap((ruta) => [declaracion(ruta, {}), declaracion([...ruta, "bash"])]);
    const normal = declaracion(["agent", "build", "temperature"], 0.3);
    const nombresSimilares = [declaracion(["permissions"]),
      declaracion(["agent", "build", "options", "tools"])];
    expect(secuenciar([lectura(0, [...excluidas, normal, ...nombresSimilares]), lectura(1, excluidas)])).toEqual({
      exito: true, valor: {
        aplicaciones: [normal, ...nombresSimilares].map((declaracion) => ({ origen: { tipo: "declarado", orden: 0, posicion: declaracion.posicion }, ruta: declaracion.ruta, valor: declaracion.valor, estrategia: "reemplazo", regla: "orden-de-aplicacion" })),
        noResueltas: [
          ...[["tools"], ["permission"], ["agent", "build", "tools"], ["agent", "build", "permission"],
            ["agent", "review", "tools"], ["agent", "review", "permission"]].map(ruta => ({ ruta, regla: "tools-legado-no-incorporado" })),
          ...[["instructions"], ["plugin"]].map(ruta => ({ ruta, regla: "fuera-del-v1" })),
        ],
      },
    });
  });
});

describe("V1-03 S-1", () => {
  test("conserva el orden de entradas y declaraciones, y el indice de origen", () => {
    const primeras = [declaracion(["agent", "build", "temperature"], 0.3), declaracion(["agent", "build", "steps"], 12)] as const;
    const ultima = declaracion(["agent", "build", "temperature"], 0.7);
    expect(secuenciar([lectura(8, primeras), lectura(2, [ultima])])).toEqual({ exito: true, valor: {
      aplicaciones: [
        { origen: { tipo: "declarado", orden: 8, posicion: primeras[0].posicion }, ruta: primeras[0].ruta, valor: primeras[0].valor, estrategia: "reemplazo", regla: "orden-de-aplicacion" },
        { origen: { tipo: "declarado", orden: 8, posicion: primeras[1].posicion }, ruta: primeras[1].ruta, valor: primeras[1].valor, estrategia: "reemplazo", regla: "orden-de-aplicacion" },
        { origen: { tipo: "declarado", orden: 2, posicion: ultima.posicion }, ruta: ultima.ruta, valor: ultima.valor, estrategia: "reemplazo", regla: "orden-de-aplicacion" },
      ], noResueltas: [],
    } });
    expect(secuenciar([])).toEqual({ exito: true, valor: { aplicaciones: [], noResueltas: [] } });
  });
});
