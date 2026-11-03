import { describe, expect, test } from "bun:test";
import { detectarReglasSinEfecto, ordenarHallazgos } from "./detectar";
import type { Hallazgo } from "./tipos";
import type { Adaptador, ClaveNoResuelta, ContextoConsulta, ValorSustituido } from "../contrato/adaptador";
import type { RastroValor, Resolucion } from "../resolucion/tipos";
import { adaptadorFicticio } from "../../../pruebas/utilidades/adaptador-ficticio";
import { crearEntornoMemoria } from "../../../pruebas/utilidades/entorno-memoria";

describe("T3-05 orden determinista", () => {
  test("desempata por posicion, tipo, causa y clave sin mutar la entrada", () => {
    const base: Hallazgo = { tipo: "referencia-no-resuelta", causa: "a", entrada: { orden: 0, via: "archivo", referencia: "/p/a", condicion: "observada" },
      posicion: { linea: 1, columna: 1 }, clave: ["a"], parametros: {} };
    const ordenados: Hallazgo[] = [base, { ...base, clave: ["b"] }, { ...base, causa: "b" },
      { ...base, tipo: "sustitucion-sin-valor" }, { ...base, posicion: { linea: 1, columna: 2 } },
      { ...base, posicion: { linea: 2, columna: 1 } }, { ...base, entrada: { ...base.entrada, orden: 1 } }];
    const invertidos = [...ordenados].reverse();
    expect(ordenarHallazgos(invertidos)).toEqual(ordenados);
    expect(invertidos).toEqual([...ordenados].reverse());
  });
});

function construirResolucion(
  reglas: readonly { ruta: readonly string[]; valor: string; linea: number; orden?: number; sustituciones?: readonly ValorSustituido[] }[],
  noResueltas: readonly ClaveNoResuelta[] = [],
): { adaptador: Adaptador; resolucion: Resolucion; contexto: ContextoConsulta } {
  const entorno = crearEntornoMemoria({ archivos: {}, directorios: ["/p"] });
  const contexto: ContextoConsulta = { proyecto: "/p", entorno, parametros: {}, declaraciones: [] };
  const valores: RastroValor[] = reglas.map((r, indiceFusion) => {
    const orden = r.orden ?? 0;
    const referencia = orden === 0 ? "/p/config.json" : "/h/global.json";
    return {
      ruta: r.ruta,
      indiceFusion,
      valor: r.valor,
      determinante: {
        origen: { tipo: "declarado", orden, posicion: { linea: r.linea, columna: 5 } },
        via: "archivo",
        referencia,
        valor: r.valor,
        regla: "primera-declaracion",
        ...(r.sustituciones ? { sustituciones: r.sustituciones } : {}),
      },
      motivo: "primera-declaracion",
      desplazadas: [],
    };
  });
  const adaptador: Adaptador = {
    ...adaptadorFicticio,
    prefijoAgente: ["agent"],
    permisos: {
      ...adaptadorFicticio.permisos,
      ordenEfectos: ["deny", "ask", "allow"],
      plantillas: {
        ...adaptadorFicticio.permisos.plantillas,
        efectos: { allow: "permitida", deny: "denegada", ask: "sujeta a confirmación" },
      },
    },
    abarca: (posterior, anterior) => posterior === "*" || posterior === anterior,
    causaRutaRegla: (_, __, regla) => regla.patron.startsWith("/") ? { causa: "ruta-absoluta" } : null,
  };
  const resolucion: Resolucion = {
    formato: 2,
    identidad: adaptador.identidad,
    proyecto: "/p",
    prefijoAgente: ["agent"],
    reglas: {},
    declaraciones: [],
    contexto: { proyecto: "/p", plataforma: "linux", parametros: {}, declaraciones: [] },
    entradas: [
      { orden: 0, via: "archivo", referencia: "/p/config.json", condicion: "observada", resumen: "h0" },
      { orden: 1, via: "archivo", referencia: "/h/global.json", condicion: "observada", resumen: "h1" },
    ],
    resumenEntradas: "resumen",
    valores,
    eliminadas: [],
    noResueltas,
  };
  return { adaptador, resolucion, contexto };
}

describe("T3-06 R-2 unidad detectarReglasSinEfecto", () => {
  test("detecta regla tapada en el mismo bloque y omite orden inverso, sujetos distintos, comodines y bloques distintos", () => {
    const tapadaRaiz = construirResolucion([
      { ruta: ["permission", "read", "src/a.js"], valor: "allow", linea: 4 },
      { ruta: ["permission", "read", "*"], valor: "deny", linea: 5 },
    ]);
    expect(detectarReglasSinEfecto(tapadaRaiz.adaptador, tapadaRaiz.resolucion, tapadaRaiz.contexto)).toEqual([{
      tipo: "regla-sin-efecto",
      causa: "tapada-por-posterior",
      entrada: { orden: 0, via: "archivo", referencia: "/p/config.json", condicion: "observada" },
      posicion: { linea: 4, columna: 5 },
      clave: ["permission", "read", "src/a.js"],
      parametros: {
        sujeto: "read",
        patron: "src/a.js",
        efecto: "permitida",
        patronPosterior: "*",
        efectoPosterior: "denegada",
        origenPosterior: "/p/config.json:5",
      },
    }]);

    const ordenInverso = construirResolucion([
      { ruta: ["permission", "read", "*"], valor: "deny", linea: 4 },
      { ruta: ["permission", "read", "src/a.js"], valor: "allow", linea: 5 },
    ]);
    expect(detectarReglasSinEfecto(ordenInverso.adaptador, ordenInverso.resolucion, ordenInverso.contexto)).toEqual([]);

    const sujetosDistintos = construirResolucion([
      { ruta: ["permission", "read", "src/a.js"], valor: "allow", linea: 4 },
      { ruta: ["permission", "edit", "*"], valor: "deny", linea: 5 },
    ]);
    expect(detectarReglasSinEfecto(sujetosDistintos.adaptador, sujetosDistintos.resolucion, sujetosDistintos.contexto)).toEqual([]);

    const sujetoComodin = construirResolucion([
      { ruta: ["permission", "*", "src/a.js"], valor: "allow", linea: 4 },
      { ruta: ["permission", "*", "*"], valor: "deny", linea: 5 },
    ]);
    expect(detectarReglasSinEfecto(sujetoComodin.adaptador, sujetoComodin.resolucion, sujetoComodin.contexto)).toEqual([]);

    const bloquesDistintos = construirResolucion([
      { ruta: ["permission", "read", "src/a.js"], valor: "allow", linea: 4 },
      { ruta: ["agent", "build", "permission", "read", "*"], valor: "deny", linea: 8 },
    ]);
    expect(detectarReglasSinEfecto(bloquesDistintos.adaptador, bloquesDistintos.resolucion, bloquesDistintos.contexto)).toEqual([]);

    const mismoAgente = construirResolucion([
      { ruta: ["agent", "build", "permission", "read", "src/a.js"], valor: "allow", linea: 7 },
      { ruta: ["agent", "build", "permission", "read", "*"], valor: "deny", linea: 8 },
    ]);
    expect(detectarReglasSinEfecto(mismoAgente.adaptador, mismoAgente.resolucion, mismoAgente.contexto)).toEqual([{
      tipo: "regla-sin-efecto",
      causa: "tapada-por-posterior",
      entrada: { orden: 0, via: "archivo", referencia: "/p/config.json", condicion: "observada" },
      posicion: { linea: 7, columna: 5 },
      clave: ["agent", "build", "permission", "read", "src/a.js"],
      parametros: {
        sujeto: "read",
        patron: "src/a.js",
        efecto: "permitida",
        patronPosterior: "*",
        efectoPosterior: "denegada",
        origenPosterior: "/p/config.json:8",
      },
    }]);
  });
});

describe("T3-06 R-3 unidad bloque y exclusiones", () => {
  test("conserva el hallazgo con regla excluida intermedia y omite A con sustituciones o ya marcada por ruta absoluta", () => {
    const conExcluida = construirResolucion([
      { ruta: ["permission", "read", "src/a.js"], valor: "allow", linea: 3 },
      { ruta: ["permission", "read", "*"], valor: "deny", linea: 5 },
    ], [{ ruta: ["permission", "read", "src/b.js"], regla: "primera-declaracion" }]);
    expect(detectarReglasSinEfecto(conExcluida.adaptador, conExcluida.resolucion, conExcluida.contexto)).toHaveLength(1);

    const conSustitucion = construirResolucion([
      { ruta: ["permission", "read", "src/a.js"], valor: "allow", linea: 3,
        sustituciones: [{ tipo: "variable", origen: "VAR", definido: true, posicion: { linea: 3, columna: 10 } }] },
      { ruta: ["permission", "read", "*"], valor: "deny", linea: 5 },
    ]);
    expect(detectarReglasSinEfecto(conSustitucion.adaptador, conSustitucion.resolucion, conSustitucion.contexto)).toEqual([]);

    const absolutaYTapada = construirResolucion([
      { ruta: ["permission", "read", "/p/src/a.js"], valor: "allow", linea: 3 },
      { ruta: ["permission", "read", "*"], valor: "deny", linea: 5 },
    ]);
    expect(detectarReglasSinEfecto(absolutaYTapada.adaptador, absolutaYTapada.resolucion, absolutaYTapada.contexto)).toEqual([{
      tipo: "regla-sin-efecto",
      causa: "ruta-absoluta",
      entrada: { orden: 0, via: "archivo", referencia: "/p/config.json", condicion: "observada" },
      posicion: { linea: 3, columna: 5 },
      clave: ["permission", "read", "/p/src/a.js"],
      parametros: { sujeto: "read", patron: "/p/src/a.js", efecto: "permitida" },
    }]);
  });
});
