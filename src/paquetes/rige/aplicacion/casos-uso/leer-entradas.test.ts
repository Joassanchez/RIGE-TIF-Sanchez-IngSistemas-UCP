import { describe, expect, it } from "bun:test";
import type { Adaptador, ContextoConsulta, Declaracion, ErrorAnalisis, ViaUbicada } from "@rige/nucleo/contrato/adaptador";
import { crearEntornoMemoria } from "../../../../pruebas/utilidades/entorno-memoria";
import { leerEntradas } from "./leer-entradas";

describe("leerEntradas", () => {
  it("lee vías observadas y no observadas, extrae declaraciones y sustituciones y llama a medición", () => {
    let medicionLlamada = false;
    const entorno = crearEntornoMemoria({
      archivos: {
        "/proy/archivo.json": '{"clave":"val"}',
      },
    });
    const declaracion: Declaracion = {
      ruta: ["clave"],
      valor: "val",
      posicion: { linea: 1, columna: 1 },
      sustituciones: [{ tipo: "variable", origen: "VAR", definido: true, posicion: { linea: 1, columna: 5 } }],
    };
    const adaptador = {
      reglas: {},
      plantillasHallazgo: {} as any,
      permisos: {} as any,
      identidad: { herramienta: "prueba", version: "0.0.0" },
      prefijoAgente: ["agent"],
      estrategias: {},
      referencias: [],
      contexto: () => ({ exito: true as const, valor: { proyecto: "/proy", parametros: {}, declaraciones: [], entorno } }),
      ubicar: () => ({ exito: true as const, valor: [] }),
      leer: (_via: any, _texto: any) => ({ exito: true as const, valor: [declaracion] }),
      secuenciar: () => ({ exito: true as const, valor: { aplicaciones: [], noResueltas: [] } }),
      cadena: () => ({ exito: true as const, valor: { reglas: [], declaraciones: [], advertencias: [] } }),
      prepararConsulta: () => ({ exito: true as const, valor: {} as any }),
      listarAgentes: () => ({ agentes: [], motivos: [] }),
      resumirPermisos: () => ({ sujetos: [], filas: [] } as any),
    } as unknown as Adaptador<ContextoConsulta>;

    const vias: readonly ViaUbicada[] = [
      { via: "config", referencia: "/proy/archivo.json", condicion: "observada", constituyeEntrada: true },
      { via: "remota", referencia: "/proy/remota.json", condicion: "no_observada" },
    ];

    const resultado = leerEntradas(adaptador, entorno, vias, { proyecto: "/proy", parametros: {}, declaraciones: [], entorno }, {
      finalizarLectura: () => { medicionLlamada = true; },
    });

    expect(resultado.exito).toBe(true);
    if (!resultado.exito) return;

    expect(medicionLlamada).toBe(true);
    expect(resultado.valor.entradas).toHaveLength(2);
    expect(resultado.valor.entradas[0]!.legibilidad).toBe("legible");
    expect(resultado.valor.entradas[1]!.legibilidad).toBeNull();
    expect(resultado.valor.huellas[0]).toBe(entorno.resumir('{"clave":"val"}'));
    expect(resultado.valor.huellas[1]).toBeNull();
    expect(resultado.valor.analizadas).toHaveLength(2);
    expect(resultado.valor.lecturas).toHaveLength(2);
    expect(resultado.valor.sustituciones).toEqual(declaracion.sustituciones!);
  });

  it("continúa ante una entrada ilegible registrando el error correspondiente", () => {
    const entorno = crearEntornoMemoria({
      archivos: {
        "/proy/archivo.json": '{"clave":',
      },
    });
    const errorIlegible: NonNullable<ErrorAnalisis["ilegible"]> = {
      posicion: { linea: 2, columna: 5 },
      consecuencia: "falla",
    };
    const adaptador = {
      reglas: {},
      plantillasHallazgo: {} as any,
      permisos: {} as any,
      identidad: { herramienta: "prueba", version: "0.0.0" },
      prefijoAgente: ["agent"],
      estrategias: {},
      referencias: [],
      contexto: () => ({ exito: true as const, valor: { proyecto: "/proy", parametros: {}, declaraciones: [], entorno } }),
      ubicar: () => ({ exito: true as const, valor: [] }),
      leer: () => ({
        exito: false as const,
        error: { categoria: "uso" as const, codigo: "entrada-invalida", mensaje: "sintaxis rota", ilegible: errorIlegible },
      }),
      secuenciar: () => ({ exito: true as const, valor: { aplicaciones: [], noResueltas: [] } }),
      cadena: () => ({ exito: true as const, valor: { reglas: [], declaraciones: [], advertencias: [] } }),
      prepararConsulta: () => ({ exito: true as const, valor: {} as any }),
      listarAgentes: () => ({ agentes: [], motivos: [] }),
      resumirPermisos: () => ({ sujetos: [], filas: [] } as any),
    } as unknown as Adaptador<ContextoConsulta>;

    const vias: readonly ViaUbicada[] = [
      { via: "config", referencia: "/proy/archivo.json", condicion: "observada", constituyeEntrada: true },
    ];

    const resultado = leerEntradas(adaptador, entorno, vias, { proyecto: "/proy", parametros: {}, declaraciones: [], entorno });
    expect(resultado.exito).toBe(true);
    if (!resultado.exito) return;

    expect(resultado.valor.entradas).toHaveLength(1);
    expect(resultado.valor.entradas[0]!.legibilidad).toBe("ilegible");
    expect(resultado.valor.entradas[0]!.error).toEqual({ linea: 2, columna: 5, consecuencia: "falla" });
    expect(resultado.valor.analizadas[0]!.ilegible).toEqual(errorIlegible);
    expect(resultado.valor.analizadas[0]!.declaraciones).toEqual([]);
    expect(resultado.valor.lecturas[0]!.declaraciones).toEqual([]);
  });

  it("falla de inmediato ante un error que no sea de entrada ilegible", () => {
    const entorno = crearEntornoMemoria({
      archivos: {
        "/proy/archivo.json": "{}",
      },
    });
    const adaptador = {
      reglas: {},
      plantillasHallazgo: {} as any,
      permisos: {} as any,
      identidad: { herramienta: "prueba", version: "0.0.0" },
      prefijoAgente: ["agent"],
      estrategias: {},
      referencias: [],
      contexto: () => ({ exito: true as const, valor: { proyecto: "/proy", parametros: {}, declaraciones: [], entorno } }),
      ubicar: () => ({ exito: true as const, valor: [] }),
      leer: () => ({
        exito: false as const,
        error: { categoria: "uso" as const, codigo: "error-fatal", mensaje: "falla no recuperable" },
      }),
      secuenciar: () => ({ exito: true as const, valor: { aplicaciones: [], noResueltas: [] } }),
      cadena: () => ({ exito: true as const, valor: { reglas: [], declaraciones: [], advertencias: [] } }),
      prepararConsulta: () => ({ exito: true as const, valor: {} as any }),
      listarAgentes: () => ({ agentes: [], motivos: [] }),
      resumirPermisos: () => ({ sujetos: [], filas: [] } as any),
    } as unknown as Adaptador<ContextoConsulta>;

    const vias: readonly ViaUbicada[] = [
      { via: "config", referencia: "/proy/archivo.json", condicion: "observada", constituyeEntrada: true },
    ];

    const resultado = leerEntradas(adaptador, entorno, vias, { proyecto: "/proy", parametros: {}, declaraciones: [], entorno });
    expect(resultado.exito).toBe(false);
    if (resultado.exito) return;
    expect(resultado.error.mensaje).toContain("falla no recuperable");
  });
});
