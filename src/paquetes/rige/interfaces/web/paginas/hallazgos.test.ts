import { describe, expect, test } from "bun:test";
import type { RespuestaHallazgos } from "../../../aplicacion/respuestas/contrato-generado";
import { paginaHallazgos } from "./hallazgos";
import { seccionHtml } from "../../../../../pruebas/utilidades/html";

const base = { esquema: 2 as const, proyecto: "/p/proyecto", entradas: [], resumenEntradas: "a".repeat(64), declaraciones: [], reglas: {} };
const origen = { tipo: "declarado" as const, orden: 0, posicion: { linea: 2, columna: 3 } };
const declaracion = { origen, via: "proyecto", referencia: "/p/proyecto/config & #.json", valor: "allow", regla: "declarada" };
const contexto = { idResolucion: "7", agente: "a/b", agentes: [{ nombre: "a/b", origen: "declarado" as const, modo: "all", oculto: false }], instante: "2026-11-11T12:00:00Z" };

const hallazgo = { tipo: "regla-sin-efecto" as const, causa: "regla", entrada: { orden: 0, via: "proyecto", referencia: declaracion.referencia, condicion: "observada" as const }, posicion: origen.posicion, clave: ["agent", "a/b", "permission"], parametros: {}, localizacion: "no parsear:2:3", explicacion: "No tiene efecto <aquí>." };
const hallazgos: RespuestaHallazgos = { ...base, incompleta: true, motivos: ["parcial"], reglas: { parcial: "Faltan entradas por observar", regla: "Regla relacionada" },
  resumen: { elementos: null, hallazgos: { "entrada-ilegible": 0, "entrada-descartada": 0, "sustitucion-sin-valor": 1, "referencia-no-resuelta": 0, "regla-sin-efecto": 2, "elemento-sin-uso": 0 } },
  hallazgos: [hallazgo, { ...hallazgo, tipo: "sustitucion-sin-valor", causa: "variable", entrada: { ...hallazgo.entrada, via: "variable-contenido", referencia: "VARIABLE" }, clave: null }, { ...hallazgo, clave: null }] };

const sinJson = (s: string) => s.replace(/<script[^]*?<\/script>/g, "");
const json = (cuerpo: string) => JSON.parse(cuerpo.match(/id="respuesta">([^]*?)<\/script>/)![1]!);

describe("Página hallazgos", () => {
  test("T5-21 F-3 resumen sin tarjetas de cero y conteos en una linea", async () => {
    const hallazgosF3: RespuestaHallazgos = { ...base, hallazgos: [], incompleta: false, motivos: [], resumen: { elementos: { agentes: 8, comandos: 0, entradas: 2 }, hallazgos: { "entrada-ilegible": 0, "entrada-descartada": 0, "referencia-no-resuelta": 0, "sustitucion-sin-valor": 0, "regla-sin-efecto": 2, "elemento-sin-uso": 0 } } };
    const s = sinJson(await paginaHallazgos(hallazgosF3).text()).split('id="resumen-hallazgos"')[1]!.split("</section>")[0]!;
    expect(s).toContain("8 agentes · 0 comandos · 2 entradas");
    expect(s).not.toContain("estadistica--mini"); expect(s).not.toContain("estadistica--cero");
    expect(s.match(/estadistica estadistica--aviso/g)).toHaveLength(1);
    expect(s.replace(/<[^>]+>/g, "")).toContain("Sin hallazgos de: entradas ilegibles, entradas descartadas");
    const desconocido = sinJson(await paginaHallazgos({ ...hallazgosF3, resumen: { ...hallazgosF3.resumen, elementos: null } }).text());
    expect(desconocido).toContain("sin dato");
  });

  test("P-4 tarjetas agrupadas, anclas originales, causa, ubicación, parcialidad y acciones justificadas", async () => {
    const cuerpo = await paginaHallazgos(hallazgos, contexto).text();
    expect(cuerpo).toContain("Estado actual de los archivos");
    expect(cuerpo).toMatch(/<article id="h-0"[^]*?Causa[^]*?No tiene efecto &lt;aquí&gt;/);
    expect(cuerpo.indexOf('id="h-2"')).toBeLessThan(cuerpo.indexOf('id="h-1"'));
    expect(cuerpo).toContain("agent › a/b › permission");
    expect(cuerpo).toContain("Regla relacionada");
    expect(cuerpo).toContain("vscode://file/p/proyecto/config%20%26%20%23.json:2:3");
    expect(cuerpo).toContain("#entrada-0"); expect(cuerpo).toContain("Faltan entradas por observar");
    expect(cuerpo).toContain("Qué hacer"); expect(seccionHtml(cuerpo, "limites-analisis")).toContain("Análisis parcial: no se evaluaron todos los hallazgos.");
    expect(json(cuerpo)).toEqual(hallazgos);
    const vacio = await paginaHallazgos({ ...hallazgos, hallazgos: [] }).text();
    expect(vacio).toContain("Sin hallazgos observados; análisis parcial"); expect(vacio).not.toContain("insignia--permitida");
  });

  test("T5-15 Z-10 estadisticas concuerdan con cero, uno y varios, incluidos los seis tipos", async () => {
    for (const cantidad of [0, 1, 2]) {
      const respuesta = { ...base, hallazgos: [], incompleta: false, motivos: [], resumen: { elementos: { agentes: cantidad, comandos: cantidad, entradas: cantidad },
        hallazgos: { "entrada-ilegible": cantidad, "entrada-descartada": cantidad, "sustitucion-sin-valor": cantidad,
          "referencia-no-resuelta": cantidad, "regla-sin-efecto": cantidad, "elemento-sin-uso": cantidad } } };
      const cuerpo = await paginaHallazgos(respuesta).text();
      const resumen = seccionHtml(cuerpo, "resumen-hallazgos");
      const nombres = cantidad === 1 ? ["Entrada ilegible", "Entrada descartada", "Sustitución sin valor", "Referencia no resuelta", "Regla sin efecto", "Elemento sin uso"]
        : ["Entradas ilegibles", "Entradas descartadas", "Sustituciones sin valor", "Referencias no resueltas", "Reglas sin efecto", "Elementos sin uso"];
      for (const nombre of nombres) {
        if (cantidad === 0) expect(resumen).toContain(`>${nombre.toLowerCase()}</span>`);
        else expect(resumen).toContain(`>${nombre}</span><strong>${cantidad}</strong>`);
      }
      for (const nombre of cantidad === 1 ? ["Agente", "Comando", "Entrada"] : ["Agentes", "Comandos", "Entradas"])
        expect(resumen).toContain(`${cantidad} ${nombre.toLowerCase()}`);
      expect(json(cuerpo)).toEqual(respuesta);
    }
  });
});
