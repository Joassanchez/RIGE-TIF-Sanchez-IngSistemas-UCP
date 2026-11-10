import { describe, expect, test } from "bun:test";
import type { RespuestaReglas } from "../../../aplicacion/respuestas/reglas";
import { paginaReglas } from "./reglas";

describe("T5-13 R-4 rutas y limitaciones", () => {
  test("rutas hostiles escapadas, indices sin reinterpretar y errores de fila visibles sin efecto inventado", async () => {
    const ruta = '/proyecto & "#</script>/opencode.json';
    const origen = { tipo: "declarado" as const, orden: 0, posicion: { linea: 2, columna: 3 } };
    const respuesta: RespuestaReglas = { esquema: 2, proyecto: ruta, entradas: [], resumenEntradas: "a".repeat(64), agente: "build",
      cadena: [{ indice: 1, sujeto: "read", patron: "*", efecto: "ask", origen, prevalece: ["read"],
        declaracion: { origen, via: "proyecto", referencia: ruta, localizacion: `${ruta}:2:3`, valor: "ask", regla: "declarada" } }],
      ejesParciales: [], declaraciones: [], advertencias: [], reglas: { declarada: "Regla declarada" },
      matriz: { sujetos: ["read"], motivos: [], noObservados: [], filas: [
        { agente: "build", oculto: false, error: null, ejesParciales: [], declaraciones: [], advertencias: [],
          celdas: [{ sujeto: "read", efecto: "ask", prevalece: 1, motivo: null }] },
        { agente: "incompleto", oculto: true, error: { codigo: "cadena-incompleta", mensaje: "No observable" },
          ejesParciales: [], declaraciones: [], advertencias: [], celdas: [{ sujeto: "read", efecto: null, prevalece: null, motivo: "cadena-incompleta" }] },
      ] } };
    const pagina = await paginaReglas(respuesta, "7").text();
    expect(pagina).toContain('/proyecto &amp; &quot;#&lt;/script&gt;/opencode.json:2:3');
    expect(pagina).not.toContain(ruta);
    expect(pagina).toContain('data-etiqueta="Índice">1</td>');
    expect(pagina).toContain("cadena-incompleta: No observable");
    const filaIncompleta = pagina.slice(pagina.indexOf('>incompleto</a>'));
    expect(filaIncompleta).toContain("sin decisión");
    expect(filaIncompleta).not.toContain("Regla 1");
    expect(pagina.match(/<script\b/g)).toHaveLength(1);
    expect(JSON.parse(pagina.match(/id="respuesta">([^]*?)<\/script>/)![1]!)).toEqual(respuesta);
    expect(pagina).not.toMatch(/style=|(?:src|href)="https?:/);
  });
});
