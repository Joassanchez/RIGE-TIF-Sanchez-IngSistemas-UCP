import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { limitesGenerales } from "../../paquetes/opencode/reglas";
import type { DependenciasAnalisis } from "../../paquetes/rige/aplicacion/casos-uso/analizar-proyecto";
import { consultarAgentes } from "../../paquetes/rige/aplicacion/casos-uso/consultar-agentes";
import { consultarEntradas } from "../../paquetes/rige/aplicacion/casos-uso/consultar-entradas";
import { consultarHallazgos } from "../../paquetes/rige/aplicacion/casos-uso/consultar-hallazgos";
import { consultarPermiso } from "../../paquetes/rige/aplicacion/casos-uso/consultar-permiso";
import { consultarReglas } from "../../paquetes/rige/aplicacion/casos-uso/consultar-reglas";
import { consultarValores } from "../../paquetes/rige/aplicacion/casos-uso/consultar-valores";
import {
  versionEsquemaSalida,
  type RespuestaComparacion,
  type RespuestaProyectosRecientes,
} from "../../paquetes/rige/aplicacion/respuestas/contrato-generado";
import { versionRige, type RespuestaEstado, type RespuestaEstadoCli } from "../../paquetes/rige/aplicacion/respuestas/estado";
import { subcomandos } from "../../paquetes/rige/interfaces/cli/subcomandos";
import type { ContextoPresentacion } from "../../paquetes/rige/interfaces/cli/texto/formato";
import { crearEntornoOpenCode } from "./entorno-opencode";

type ContextoGuardado = Omit<ContextoPresentacion, "limitesGenerales">;

export interface CasoTextoCongelado {
  readonly id: string;
  readonly comando: string;
  readonly respuesta: unknown;
  readonly contexto: ContextoGuardado;
  readonly esperado: string;
}

const raizEscenarios = resolve(import.meta.dir, "../escenarios");
const conjuntoLimites = new Set(limitesGenerales);

function leerEscenario(escenario: string, relativa: string): string {
  return readFileSync(resolve(raizEscenarios, escenario, relativa), "utf8");
}

function dependenciasNeutras(
  archivos: Readonly<Record<string, string>>,
  directorios: readonly string[],
): DependenciasAnalisis {
  const entorno = crearEntornoOpenCode({
    archivos,
    directorios,
    variables: { HOME: "/home/usuario" },
    plataforma: "linux",
  });
  return {
    adaptador: adaptadorOpenCode,
    entorno,
    rutas: { canonica: (ruta) => ruta },
  };
}

function renderizar(comando: string, respuesta: unknown, contexto: ContextoPresentacion): string {
  const sub = subcomandos.find((s) => s.nombre === comando);
  if (!sub) throw new Error(`Subcomando desconocido: ${comando}`);
  return (sub.renderizar as (r: unknown, c: ContextoPresentacion) => string)(respuesta, contexto);
}

function exigir<T>(resultado: { readonly exito: true; readonly valor: T } | { readonly exito: false; readonly error: { readonly mensaje: string } }): T {
  if (!resultado.exito) throw new Error(`Error al generar caso: ${resultado.error.mensaje}`);
  return resultado.valor;
}

function variantes(
  baseId: string,
  comando: string,
  construirRespuesta: (opciones: { readonly todo: boolean; readonly explicar: boolean }) => unknown,
  opciones: {
    readonly todos?: readonly boolean[];
    readonly explicaciones?: readonly boolean[];
    readonly agente?: string;
  } = {},
): CasoTextoCongelado[] {
  const todos = opciones.todos ?? [false];
  const explicaciones = opciones.explicaciones ?? [false];
  const salida: CasoTextoCongelado[] = [];
  for (const todo of todos) {
    for (const explicar of explicaciones) {
      const respuesta = construirRespuesta({ todo, explicar });
      const sufijoOpciones = `${todo ? "-todo" : ""}${explicar ? "-explicar" : ""}`;
      for (const ancho of [60, 100]) {
        for (const color of [false, true]) {
          const contextoBase: ContextoGuardado = {
            formato: "texto",
            ancho,
            esConsola: color,
            colorHabilitado: color,
            todo,
            proyectoDesdeCarpetaActual: false,
            explicar,
            ...(opciones.agente !== undefined ? { agente: opciones.agente } : {}),
          };
          const contexto: ContextoPresentacion = { ...contextoBase, limitesGenerales: conjuntoLimites };
          salida.push({
            id: `${baseId}${sufijoOpciones}-ancho${ancho}-${color ? "concolor" : "sincolor"}`,
            comando,
            respuesta,
            contexto: contextoBase,
            esperado: renderizar(comando, respuesta, contexto),
          });
        }
      }
    }
  }
  return salida;
}

export function generarTextoCongelado(): {
  readonly _procedencia: {
    readonly tarea: string;
    readonly descripcion: string;
    readonly cantidadCasos: number;
    readonly escenarios: readonly string[];
    readonly raizNeutra: string;
  };
  readonly casos: readonly CasoTextoCongelado[];
} {
  const proyectoV1 = "/escenarios/v1-precedencia/proyecto";
  const depsV1 = dependenciasNeutras(
    {
      "/escenarios/v1-precedencia/opencode.json": leerEscenario("v1-precedencia", "opencode.json"),
      "/escenarios/v1-precedencia/proyecto/opencode.json": leerEscenario("v1-precedencia", "proyecto/opencode.json"),
      "/escenarios/v1-precedencia/proyecto/opencode.jsonc": leerEscenario("v1-precedencia", "proyecto/opencode.jsonc"),
    },
    ["/escenarios", "/escenarios/v1-precedencia", proyectoV1],
  );

  const raizV2 = "/escenarios/v2-ruta-exposicion";
  const proyectoV2 = `${raizV2}/proyecto`;
  const depsV2 = dependenciasNeutras(
    {
      [`${proyectoV2}/opencode.jsonc`]: leerEscenario("v2-ruta-exposicion", "proyecto/opencode.jsonc").replaceAll("<RAIZ>", raizV2),
      [`${proyectoV2}/config/credenciales.json`]: leerEscenario("v2-ruta-exposicion", "proyecto/config/credenciales.json"),
      [`${proyectoV2}/privado/LEEME.txt`]: leerEscenario("v2-ruta-exposicion", "proyecto/privado/LEEME.txt"),
    },
    ["/escenarios", raizV2, proyectoV2, `${proyectoV2}/config`, `${proyectoV2}/privado`],
  );

  const estadoSinEsquema: RespuestaEstadoCli = {
    esquema: versionEsquemaSalida,
    almacen: { ruta: "/temporal/almacen/rige.db", versionEsquema: null, existe: true },
  };
  const estadoConEsquema: RespuestaEstadoCli = {
    esquema: versionEsquemaSalida,
    almacen: { ruta: "/temporal/almacen/rige.db", versionEsquema: 2, existe: true },
  };
  const esquemaPreparado: RespuestaEstado = {
    esquema: versionEsquemaSalida,
    versionRige,
    almacen: { ruta: "/temporal/almacen/rige.db", versionEsquema: 2 },
  };
  const recientesVacio: RespuestaProyectosRecientes = {
    esquema: versionEsquemaSalida,
    proyectos: [],
  };
  const recientesConProyectos: RespuestaProyectosRecientes = {
    esquema: versionEsquemaSalida,
    proyectos: [
      { id: 1, proyecto: "/proyectos/mi-proyecto", instante: "2026-11-01T12:00:00.000Z", cantidad: 3 },
      { id: 2, proyecto: "/proyectos/otro-proyecto", instante: "2026-11-02T15:30:00.000Z", cantidad: 1 },
    ],
  };

  const determinanteSintetico = {
    origen: { tipo: "declarado" as const, orden: 1, posicion: { linea: 3, columna: 7 } },
    via: "proyecto",
    referencia: "/temporal/proyecto/opencode.jsonc",
    valor: 0.7,
    regla: "RD-02",
  };
  const comparacionBase: RespuestaComparacion = {
    esquema: versionEsquemaSalida,
    proyecto: "/temporal/proyecto",
    desde: {
      id: 1,
      instante: "2026-11-01T10:00:00Z",
      entradas: [],
      resumenEntradas: "",
      noComparables: [],
      motivosAgentes: [],
      reglas: {},
    },
    hasta: {
      id: 2,
      instante: "2026-11-02T10:00:00Z",
      entradas: [],
      resumenEntradas: "",
      noComparables: [],
      motivosAgentes: [],
      reglas: {},
    },
    agentes: { agregados: ["nuevo"], quitados: [], comunes: ["g", "build"], inciertos: [] },
    comparaciones: [
      {
        agente: "g",
        resumen: { cambiadas: 1, agregadas: 1, quitadas: 0, sinCambio: 2 },
        cambios: [
          {
            ruta: ["temperature"],
            tipo: "cambiada",
            motivos: ["valor"],
            antes: { valor: 0.3, determinante: determinanteSintetico },
            despues: { valor: 0.7, determinante: determinanteSintetico },
          },
          {
            ruta: ["steps"],
            tipo: "agregada",
            motivos: ["valor"],
            antes: null,
            despues: { valor: 20, determinante: determinanteSintetico },
          },
        ],
      },
      {
        agente: "build",
        resumen: { cambiadas: 0, agregadas: 0, quitadas: 0, sinCambio: 5 },
        cambios: [],
      },
    ],
    resumen: { cambiadas: 1, agregadas: 1, quitadas: 0, sinCambio: 7 },
    parcial: false,
    sustituciones: "solo-representacion-protegida",
  };

  const casos: CasoTextoCongelado[] = [
    ...variantes("v1-valores-build", "valores", () => exigir(consultarValores(depsV1, proyectoV1, "build", undefined)), {
      todos: [false, true],
    }),
    ...variantes("v1-valores-temp", "valores", () => exigir(consultarValores(depsV1, proyectoV1, "build", "temperature"))),
    ...variantes(
      "v1-permiso",
      "permiso",
      ({ explicar }) => exigir(consultarPermiso(depsV1, { proyecto: proyectoV1, agente: "build", sujeto: "read", objetivo: "opencode.jsonc", explicar })),
      { explicaciones: [false, true] },
    ),
    ...variantes("v1-reglas", "reglas", () => exigir(consultarReglas(depsV1, { proyecto: proyectoV1, agente: "build" })), {
      todos: [false, true],
      explicaciones: [false, true],
    }),
    ...variantes("v1-agentes", "agentes", () => exigir(consultarAgentes(depsV1, proyectoV1)), { explicaciones: [false, true] }),
    ...variantes("v1-entradas", "entradas", () => exigir(consultarEntradas(depsV1, proyectoV1)), { todos: [false, true] }),
    ...variantes("v1-hallazgos", "hallazgos", ({ explicar }) => exigir(consultarHallazgos(depsV1, proyectoV1, { explicar })), {
      explicaciones: [false, true],
    }),

    ...variantes("v2-valores-g", "valores", () => exigir(consultarValores(depsV2, proyectoV2, "g", undefined)), {
      todos: [false, true],
    }),
    ...variantes(
      "v2-permiso-cred",
      "permiso",
      ({ explicar }) => exigir(consultarPermiso(depsV2, { proyecto: proyectoV2, agente: "g", sujeto: "read", objetivo: "config/credenciales.json", explicar })),
      { explicaciones: [false, true] },
    ),
    ...variantes(
      "v2-permiso-leeme",
      "permiso",
      ({ explicar }) => exigir(consultarPermiso(depsV2, { proyecto: proyectoV2, agente: "g", sujeto: "read", objetivo: "privado/LEEME.txt", explicar })),
      { explicaciones: [false, true] },
    ),
    ...variantes("v2-reglas", "reglas", () => exigir(consultarReglas(depsV2, { proyecto: proyectoV2, agente: "g" })), {
      todos: [false, true],
      explicaciones: [false, true],
    }),
    ...variantes("v2-agentes", "agentes", () => exigir(consultarAgentes(depsV2, proyectoV2)), { explicaciones: [false, true] }),
    ...variantes("v2-entradas", "entradas", () => exigir(consultarEntradas(depsV2, proyectoV2)), { todos: [false, true] }),
    ...variantes("v2-hallazgos", "hallazgos", ({ explicar }) => exigir(consultarHallazgos(depsV2, proyectoV2, { explicar })), {
      explicaciones: [false, true],
    }),

    ...variantes("estado-sin-esquema", "estado", () => estadoSinEsquema),
    ...variantes("estado-con-esquema", "estado", () => estadoConEsquema),
    ...variantes("esquema-preparado", "esquema", () => esquemaPreparado),
    ...variantes("recientes-vacio", "recientes", () => recientesVacio),
    ...variantes("recientes-con-proyectos", "recientes", () => recientesConProyectos),
    ...variantes("comparar-global", "comparar", () => comparacionBase),
    ...variantes("comparar-agente-g", "comparar", () => comparacionBase, { agente: "g" }),
  ];

  return {
    _procedencia: {
      tarea: "T5-37",
      descripcion:
        "Salidas exactas generadas con crearEntornoOpenCode y rutas neutras para validar texto-congelado.test.ts.",
      cantidadCasos: casos.length,
      escenarios: ["v1-precedencia", "v2-ruta-exposicion"],
      raizNeutra: "/escenarios",
    },
    casos,
  };
}

if (import.meta.main) {
  console.log(JSON.stringify(generarTextoCongelado(), null, 2));
}
