import { describe, expect, test } from "bun:test";
import { adaptadorFicticio } from "../../../pruebas/utilidades/adaptador-ficticio";
import { decidir } from "./decidir";
import type { ReglaCadena } from "../resolucion/tipos";

const regla: ReglaCadena = { indice: 0, sujeto: "documento", patron: "todos", efecto: "conceder",
  origen: { tipo: "nativo", regla: "base-ficticia" }, declaracion: null };
const rastro = () => decidir({ agente: "a", reglas: [regla], ejesParciales: [] },
  { sujeto: "documento", objetivo: "todos" }, { ...adaptadorFicticio.permisos, coincidentes: [0], determinante: 0 });
const plantillas = () => ({ ...adaptadorFicticio.permisos.plantillas, reglas: adaptadorFicticio.reglas });

describe("T2-10 E-1", () => {
  test("un marcador desconocido falla visiblemente", async () => {
    const { explicar } = await import("./explicar");
    expect(() => explicar(rastro(), { ...plantillas(), determinante: "{desconocido}" }, 1)).toThrow("Marcador desconocido");
  });
  test("un marcador conocido sin valor falla visiblemente", async () => {
    const { explicar } = await import("./explicar");
    expect(() => explicar(rastro(), { ...plantillas(), determinante: "{archivo}" }, 1)).toThrow("Marcador sin valor");
  });
  test("una regla sin plantilla falla visiblemente", async () => {
    const { explicar } = await import("./explicar");
    expect(() => explicar(rastro(), { ...plantillas(), reglas: {} }, 1)).toThrow("Regla sin plantilla");
  });
  test("una regla desplazada sin plantilla tambien falla", async () => {
    const { explicar } = await import("./explicar");
    const desplazada = { ...regla, indice: 1, origen: { tipo: "nativo" as const, regla: "ausente" } };
    expect(() => explicar({ ...rastro(), coincidentes: [desplazada, regla], desplazadas: [1] }, plantillas(), 2))
      .toThrow("Regla sin plantilla");
  });
});

describe("T2-10 E-2 RNF-03", () => {
  test("el ficticio aporta otro vocabulario al motor puro", async () => {
    const { explicar } = await import("./explicar");
    expect(explicar(rastro(), plantillas(), 1)).toEqual([
      "Ficha 1/1: documento todos, concedida, de fabrica. Ultimo acierto del perfil.",
      "Solo se analiza el perfil configurado.",
    ]);
  });
});

describe("T2-10 E-3 RNF-04", () => {
  test("no accede al contenido sustituido en la declaracion", async () => {
    const { explicar } = await import("./explicar");
    const secreto = "contenido-sustituido-privado-719";
    const declarada: ReglaCadena = { ...regla, origen: { tipo: "declarado", orden: 0, posicion: { linea: 3, columna: 1 } },
      declaracion: { origen: { tipo: "declarado", orden: 0, posicion: { linea: 3, columna: 1 } },
        referencia: "/capa.json", via: "capa", regla: "primera-declaracion",
        get valor(): never { throw new Error(secreto); } } };
    const decision = { ...rastro(), coincidentes: [declarada] };
    const texto = explicar(decision, plantillas(), 1).join(" ");
    expect(texto).toContain("/capa.json:3");
    expect(texto).not.toContain(secreto);
  });
});

test("T2-10 efecto por defecto sin coincidencias", async () => {
  const { explicar } = await import("./explicar");
  expect(explicar({ ...rastro(), decision: "consultar", determinante: null, coincidentes: [], motivoSinDecision: "sin-coincidencia" }, plantillas(), 1)[0])
    .toBe("Sin aciertos: consultada por defecto.");
});
