import { describe, expect, test } from "bun:test";
import { consultarPermisos, referenciaDecisiones } from "../utilidades/permisos";

const lectura = { agente: "build", sujeto: "read", objetivo: ".env", explicar: true };

describe("RF-02 CA-4 explicacion", () => {
  test("identifica determinante, posicion, origen y causa; es determinista y a pedido", () => {
    const { respuestas: [primera, segunda, sinPedido, denegada, confirmacion] } = consultarPermisos([
      lectura, lectura, { ...lectura, explicar: false },
      { ...lectura, sujeto: "bash", objetivo: "git status" }, { ...lectura, objetivo: ".env.local" },
    ]);
    const texto = primera!.explicacion?.join(" ");
    const determinante = primera!.cadena.find(r => r.indice === primera!.determinante)!;
    const total = referenciaDecisiones().cadenas.build!.length;
    expect(texto).toContain(`regla ${determinante.indice + 1} de ${total}`);
    expect(texto).toContain("read");
    expect(texto).toContain("*.env");
    expect(texto).toContain("permitida");
    expect(texto).toContain(`declarada en ${determinante.declaracion!.referencia}:${determinante.origen.tipo === "declarado" ? determinante.origen.posicion.linea : 0}`);
    expect(texto).toContain("es la última regla coincidente; OpenCode 1.18.25 aplica la última coincidencia");
    expect(texto).toContain("3 reglas coincidentes desplazadas");
    expect(segunda!.explicacion).toEqual(primera!.explicacion);
    expect(sinPedido!.explicacion).toBeNull();
    expect(texto).not.toMatch(/\{[^{}]*\}/);
    expect(denegada!.explicacion?.join(" ")).toContain("denegada");
    expect(confirmacion!.explicacion?.[0]).toContain("sujeta a confirmación, nativa");
    expect(confirmacion!.explicacion?.[0]).not.toContain("declarada en");
  });
});

describe("RF-02 CA-5 explicacion", () => {
  test("cierra siempre con las aprobaciones permanentes, tambien sin decision", () => {
    const { respuestas } = consultarPermisos([lectura, { ...lectura, sujeto: "external_directory" }]);
    for (const respuesta of respuestas) {
      expect(respuesta.explicacion?.at(-1)).toBe('Las aprobaciones permanentes ("permitir siempre") no integran el análisis.');
      expect(respuesta.explicacion?.join(" ")).toContain("question");
    }
  });
});

describe("T2-10 E-4", () => {
  test("RF-09 explica la proteccion nativa anulada por la declaracion", () => {
    const { respuestas: [r] } = consultarPermisos([lectura]);
    expect(r!.nativaAnulada).not.toBeNull();
    expect(r!.explicacion?.join(" ")).toContain("protección nativa");
    expect(r!.explicacion?.join(" ")).toContain("anulada");
  });
  test("explica comando compuesto", () => {
    const { respuestas: [r] } = consultarPermisos([{ ...lectura, sujeto: "bash", objetivo: "echo a | cat" }]);
    expect(r!.decision).toBeNull();
    expect(r!.explicacion?.join(" ")).toContain("compuesto");
    expect(r!.explicacion?.join(" ")).toContain("tuberia");
  });
  test("explica archivo fuera del arbol", () => {
    const { respuestas: [r] } = consultarPermisos([{ agente: "build", herramienta: "read", objetivo: "<RAIZ>/../externo.txt", explicar: true }]);
    expect(r!.decision).toBeNull();
    expect(r!.explicacion?.join(" ")).toContain("fuera del arbol");
  });
  test("explica eje parcialmente observado", () => {
    const { respuestas: [r] } = consultarPermisos([{ ...lectura, sujeto: "external_directory" }]);
    expect(r!.decision).toBeNull();
    expect(r!.explicacion?.join(" ")).toContain("parcialmente observado");
  });
});
