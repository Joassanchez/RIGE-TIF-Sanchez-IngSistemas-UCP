import { describe, expect, test } from "bun:test";
import { comprobarDependencias, comprobarIdentificaciones } from "../utilidades/analisis-arquitectura";
import { crearEntornoMemoria } from "../utilidades/entorno-memoria";

describe("RNF-03 CA-1", () => {
  test("el analisis estatico registra cero dependencias del nucleo hacia el adaptador", async () => {
    expect((await comprobarDependencias()).filter((hallazgo) => hallazgo.archivo.startsWith("paquetes/nucleo/"))).toEqual([]);
  });
});

describe("RNF-03 CA-2", () => {
  test("ninguna identificacion de la herramienta aparece en el codigo original del nucleo", async () => {
    expect(await comprobarIdentificaciones()).toEqual([]);
  });
});

describe("RNF-03 CA-3", () => {
  test("un adaptador ficticio cambia capas, estrategia y prefijo solo con el contrato", async () => {
    const { adaptadorFicticio } = await import("../utilidades/adaptador-ficticio");
    const { resolver } = await import("../../paquetes/nucleo/resolucion/resolver");
    const { consultarAgente } = await import("../../paquetes/nucleo/resolucion/proyectar");
    const entorno = crearEntornoMemoria({
      archivos: { "/proyecto/capa-a.json": '{"temperatura":0.1}', "/proyecto/capa-b.json": '{"temperatura":0.2}' },
      directorios: ["/proyecto"],
    });
    const resultado = resolver(adaptadorFicticio, "/proyecto", entorno);
    expect(resultado.exito).toBe(true);
    if (!resultado.exito) throw new Error(resultado.error.mensaje);
    expect(resultado.valor.entradas.map((entrada) => entrada.via)).toEqual(["capa-b", "capa-a"]);
    expect(resultado.valor.prefijoAgente).toEqual(["perfiles"]);
    const consulta = consultarAgente(resultado.valor, "a", "temperatura");
    if (!consulta.exito) throw new Error(consulta.error.mensaje);
    expect(consulta.valor).toEqual([{
      ruta: ["perfiles", "a", "temperatura"], valor: 0.2,
      determinante: { orden: 0, via: "capa-b", referencia: "/proyecto/capa-b.json", posicion: { linea: 1, columna: 2 }, valor: 0.2, regla: "primera-declaracion" },
      motivo: "primera-declaracion",
      desplazadas: [{ orden: 1, via: "capa-a", referencia: "/proyecto/capa-a.json", posicion: { linea: 1, columna: 2 }, valor: 0.1, regla: "primera-declaracion" }],
    }]);
    const conReemplazo = resolver({ ...adaptadorFicticio, secuenciar(lecturas) {
      const secuencia = adaptadorFicticio.secuenciar(lecturas);
      if (!secuencia.exito) return secuencia;
      return { exito: true, valor: { ...secuencia.valor, aplicaciones: secuencia.valor.aplicaciones.map((aplicacion) => ({ ...aplicacion, estrategia: "reemplazo" })) } };
    } }, "/proyecto", entorno);
    if (!conReemplazo.exito) throw new Error(conReemplazo.error.mensaje);
    expect(conReemplazo.valor.valores[0]?.valor).toBe(0.1);
    expect(conReemplazo.valor.valores[0]?.valor).not.toBe(consulta.valor[0]?.valor);
  });
});
