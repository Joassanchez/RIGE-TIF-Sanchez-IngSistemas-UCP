import { describe, expect, test } from "bun:test";
import type {
  RespuestaAgentes,
  RespuestaComparacion,
  RespuestaEntradas,
  RespuestaHallazgos,
  RespuestaPermiso,
  RespuestaProyectosRecientes,
  RespuestaReglas,
  RespuestaValores,
} from "../../../aplicacion/respuestas/contrato-generado";
import { versionRige } from "../../../aplicacion/respuestas/estado";
import {
  codigosAnsi,
  pintar,
  quitarAnsi,
  renderizarAgentes,
  renderizarComparacion,
  renderizarEntradas,
  renderizarHallazgos,
  renderizarPermiso,
  renderizarReglas,
  renderizarValores,
  type ContextoPresentacion,
} from "./index";
import { renderizarRecientes } from "./recientes";
import { renderizarEstado } from "./estado";
import { renderizarServidor } from "./servidor";

const baseCtx: ContextoPresentacion = {
  formato: "texto",
  ancho: 100,
  esConsola: true,
  colorHabilitado: false,
  todo: true,
  proyectoDesdeCarpetaActual: false,
  explicar: true,
  proyecto: "/p",
  hogar: "/h",
  limitesGenerales: new Set(),
};

const base = {
  esquema: 2 as const,
  proyecto: "/p",
  entradas: [],
  resumenEntradas: "a".repeat(64),
  declaraciones: [],
  reglas: { limite: "Límite de prueba", motivo: "Motivo de prueba", parcial: "Parcial" },
};

const decl = (referencia: string | null, linea = 3, via: "proyecto" | null = "proyecto") => ({
  origen: { tipo: "declarado" as const, orden: linea, posicion: { linea, columna: 5 } },
  via,
  referencia,
  valor: 0.5,
  regla: "RD-02",
});

describe("T6-09 paleta y reglas C-1, C-2, C-3, C-6", () => {
  test("paleta usa solo SGR básicos y nunca azul 34", () => {
    const permitidos = new Set([1, 2, 31, 32, 33, 35, 36, 90]);
    for (const codigo of Object.values(codigosAnsi)) {
      expect(permitidos.has(codigo)).toBe(true);
      expect(codigo).not.toBe(34);
    }
    expect(codigosAnsi.parcial).toBe(35);
    expect(pintar("parcial", "parcial", { colorHabilitado: true })).toBe("\x1b[35mparcial\x1b[0m");
  });

  test("C-1 y C-2: leyenda y celdas de reglas con su código, sin verde global, y parcial en 35", () => {
    const r: RespuestaReglas = {
      ...base,
      agente: "build",
      cadena: [
        {
          indice: 1,
          sujeto: "read",
          patron: "*",
          efecto: "allow",
          origen: decl("/p/opencode.json").origen,
          declaracion: decl("/p/opencode.json"),
          prevalece: [],
        },
      ],
      ejesParciales: ["bash"],
      advertencias: [],
      matriz: {
        sujetos: ["read", "edit", "bash", "write"],
        filas: [
          {
            agente: "build",
            oculto: false,
            ejesParciales: ["bash"],
            declaraciones: [],
            advertencias: [],
            error: null,
            celdas: [
              { sujeto: "read", efecto: "allow", prevalece: null, motivo: null },
              { sujeto: "edit", efecto: "ask", prevalece: null, motivo: null },
              { sujeto: "bash", efecto: "deny", prevalece: null, motivo: null },
            ],
          },
        ],
        noObservados: [],
        motivos: [],
      },
    };

    const salida = renderizarReglas(r, { ...baseCtx, colorHabilitado: true });
    expect(salida).toContain("\x1b[32m✓\x1b[0m permitida · \x1b[33m?\x1b[0m pregunta · \x1b[31m✗\x1b[0m denegada");
    expect(salida).not.toContain("\x1b[32m✓ permitida · ? pregunta · ✗ denegada\x1b[0m");
    expect(salida).toContain("\x1b[35m◐\x1b[0m \x1b[35mparcial\x1b[0m");
    expect(salida).toContain("\x1b[1m▸ build\x1b[0m");
    expect(salida).toContain("\x1b[32m✓\x1b[0m");
    expect(salida).toContain("\x1b[33m?\x1b[0m");
    expect(salida).toContain("\x1b[35m◐\x1b[0m");
    expect(salida).toContain("\x1b[90m—\x1b[0m");
  });

  test("C-3: quitarAnsi(salidaConColor) === salidaSinColor en todos los renderizadores y anchos", () => {
    const valores: RespuestaValores = {
      ...base,
      versionRige,
      herramienta: "opencode",
      versionHerramienta: "1.18.25",
      agente: "build",
      ruta: null,
      valores: [
        {
          clave: "temperature",
          rastro: {
            ruta: ["temperature"],
            indiceFusion: 0,
            valor: 0.7,
            determinante: decl("/p/opencode.jsonc", 6),
            motivo: "RD-02",
            desplazadas: [decl("/p/opencode.json", 2)],
          },
        },
        {
          clave: "model",
          rastro: {
            ruta: ["model"],
            indiceFusion: 1,
            valor: "gpt-5",
            determinante: { ...decl(null, 1, null), origen: { tipo: "nativo", regla: "fabrica" } },
            motivo: "RD-01",
            desplazadas: [],
          },
        },
      ],
      noResueltas: [],
      motivo: null,
    };

    const permiso: RespuestaPermiso = {
      ...base,
      agente: "build",
      consulta: { sujeto: "read", objetivo: ".env", objetivoEvaluado: ".env", forma: "sujeto" },
      decision: "deny",
      motivoSinDecision: null,
      determinante: 1,
      desplazadas: [0],
      nativaAnulada: { regla: 0, por: 1 },
      advertencias: ["limite"],
      cadena: [
        { indice: 0, sujeto: "read", patron: "*", efecto: "allow", origen: decl("/p/a.json").origen, declaracion: decl("/p/a.json") },
        { indice: 1, sujeto: "read", patron: ".env", efecto: "deny", origen: decl("/p/b.json").origen, declaracion: decl("/p/b.json") },
      ],
      explicacion: ["Regla .env prevalece"],
      porDefecto: false,
    };

    const reglas: RespuestaReglas = {
      ...base,
      agente: "build",
      cadena: [{ ...permiso.cadena[0]!, indice: 1, prevalece: [] }],
      ejesParciales: ["bash"],
      advertencias: [],
      matriz: {
        sujetos: ["read", "bash"],
        filas: [
          {
            agente: "build",
            oculto: false,
            ejesParciales: ["bash"],
            declaraciones: [],
            advertencias: [],
            error: null,
            celdas: [{ sujeto: "read", efecto: "allow", prevalece: null, motivo: null }],
          },
        ],
        noObservados: [],
        motivos: [],
      },
    };

    const agentes: RespuestaAgentes = {
      ...base,
      agentes: [
        { nombre: "build", modo: "primary", origen: "nativo", oculto: false },
        { nombre: "aux", modo: "subagent", origen: "declarado", oculto: true },
      ],
      eliminados: [{ nombre: "viejo", declaracion: decl("/p/opencode.json") }],
      incompleta: true,
      motivos: ["limite"],
    };

    const entradas: RespuestaEntradas = {
      ...base,
      entradas: [
        { orden: 1, via: "proyecto", referencia: "/p/opencode.json", condicion: "observada", resumen: "b".repeat(64), legibilidad: "legible" },
        { orden: 2, via: "proyecto", referencia: "/p/roto.json", condicion: "observada", resumen: null, legibilidad: "ilegible" },
      ],
      vias: [{ via: "proyecto", estado: "presente", cantidad: 2, revisados: ["/p/opencode.json"] }],
    };

    const hallazgos: RespuestaHallazgos = {
      ...base,
      incompleta: true,
      motivos: ["limite"],
      hallazgos: [
        {
          tipo: "entrada-ilegible",
          causa: "limite",
          explicacion: "JSON inválido",
          entrada: { orden: 2, via: "proyecto", referencia: "/p/roto.json", condicion: "observada" },
          posicion: { linea: 2, columna: 4 },
          clave: null,
          parametros: {},
          localizacion: "proyecto:/p/roto.json:2:4",
        },
      ],
      resumen: {
        elementos: { agentes: 1, comandos: 0, entradas: 1 },
        hallazgos: {
          "entrada-ilegible": 1,
          "entrada-descartada": 0,
          "sustitucion-sin-valor": 0,
          "referencia-no-resuelta": 0,
          "regla-sin-efecto": 0,
          "elemento-sin-uso": 0,
        },
      },
    };

    const comparacion: RespuestaComparacion = {
      ...base,
      desde: { id: 1, instante: "2026-01-01T00:00:00.000Z", entradas: [], resumenEntradas: "a".repeat(64), noComparables: [], motivosAgentes: [], reglas: {} },
      hasta: { id: 2, instante: "2026-01-02T00:00:00.000Z", entradas: [], resumenEntradas: "b".repeat(64), noComparables: [], motivosAgentes: [], reglas: {} },
      parcial: true,
      sustituciones: "solo-representacion-protegida",
      resumen: { cambiadas: 2, agregadas: 1, quitadas: 1, sinCambio: 0 },
      agentes: { agregados: [], quitados: [], comunes: [], inciertos: [] },
      comparaciones: [
        {
          agente: "build",
          resumen: { cambiadas: 2, agregadas: 1, quitadas: 1, sinCambio: 0 },
          cambios: [
            {
              ruta: ["temperature"],
              tipo: "cambiada",
              motivos: ["valor", "procedencia"],
              antes: { valor: 0.1, determinante: decl("/p/a.json", 1) },
              despues: { valor: 0.8, determinante: decl("/p/b.json", 2) },
            },
            {
              ruta: ["model"],
              tipo: "cambiada",
              motivos: ["procedencia"],
              antes: { valor: "gpt", determinante: decl("/p/a.json", 3) },
              despues: { valor: "gpt", determinante: decl("/p/b.json", 4) },
            },
            {
              ruta: ["nuevo"],
              tipo: "agregada",
              motivos: ["valor"],
              antes: null,
              despues: { valor: true, determinante: decl("/p/b.json", 5) },
            },
            {
              ruta: ["viejo"],
              tipo: "quitada",
              motivos: ["valor"],
              antes: { valor: false, determinante: decl("/p/a.json", 6) },
              despues: null,
            },
          ],
        },
      ],
    };

    const recientes: RespuestaProyectosRecientes = {
      esquema: 2,
      proyectos: [{ proyecto: "/p", id: 1, instante: "2026-01-01T00:00:00.000Z", cantidad: 1 }],
    };

    const casos: readonly [string, (c: ContextoPresentacion) => string][] = [
      ["valores", c => renderizarValores(valores, c)],
      ["permiso", c => renderizarPermiso(permiso, c)],
      ["reglas", c => renderizarReglas(reglas, c)],
      ["agentes", c => renderizarAgentes(agentes, c)],
      ["entradas", c => renderizarEntradas(entradas, c)],
      ["hallazgos", c => renderizarHallazgos(hallazgos, c)],
      ["comparacion", c => renderizarComparacion(comparacion, c)],
      ["recientes", c => renderizarRecientes(recientes, c)],
      ["estado", c => renderizarEstado({ esquema: 2, versionRige, almacen: { ruta: "/tmp/rige.db", versionEsquema: null, existe: false } }, c)],
      ["servidor", c => renderizarServidor({ direccion: "http://127.0.0.1:4747" }, c)],
    ];

    for (const ancho of [100, 40]) {
      for (const [nombre, fn] of casos) {
        const sinColor = fn({ ...baseCtx, ancho, colorHabilitado: false });
        const conColor = fn({ ...baseCtx, ancho, colorHabilitado: true });
        expect(quitarAnsi(conColor), `${nombre} ancho=${ancho}`).toBe(sinColor);
        if (nombre !== "servidor") {
          expect(conColor, `${nombre} ancho=${ancho} debe emitir ANSI`).toContain("\x1b[");
        }
      }
    }
  });

  test("C-6: seguro() escapa secuencias ANSI de los datos incluso con color habilitado", () => {
    const malicioso = "\x1b[31mINYECCION\x1b[0m";
    const r: RespuestaValores = {
      ...base,
      versionRige,
      herramienta: "opencode",
      versionHerramienta: "1.18.25",
      agente: "build",
      ruta: ["clave"],
      valores: [
        {
          clave: malicioso,
          rastro: {
            ruta: [malicioso],
            indiceFusion: 0,
            valor: malicioso,
            determinante: decl(`/p/${malicioso}.json`),
            motivo: "RD-02",
            desplazadas: [],
          },
        },
      ],
      noResueltas: [],
      motivo: null,
    };
    const salida = renderizarValores(r, { ...baseCtx, colorHabilitado: true });
    expect(salida).not.toContain("INYECCION\x1b[0m");
    expect(salida).toContain("\\u001b[31mINYECCION\\u001b[0m");
  });
});
