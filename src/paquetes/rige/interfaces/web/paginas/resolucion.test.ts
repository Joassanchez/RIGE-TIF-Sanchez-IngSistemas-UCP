import { describe, expect, test } from "bun:test";
import type { RespuestaConsulta, DeclaracionUbicada } from "../../../aplicacion/respuestas/consulta";
import { versionRige } from "../../../aplicacion/respuestas/estado";

function respuesta(): RespuestaConsulta {
  const declaracion = (valor: string | number, orden: number): DeclaracionUbicada => ({
    valor, orden, via: "proyecto", referencia: `/proyecto/<entrada${orden}>.jsonc`,
    posicion: { linea: 6, columna: 7 }, regla: "orden-de-aplicacion",
  });
  return {
    esquema: 1, versionRige,
    resolucion: { id: 7, instante: "2026-10-05T12:00:00.000Z", proyecto: "/proyecto/<ejemplo>",
      herramienta: "opencode", versionHerramienta: "1.18.25", resumenEntradas: "a".repeat(64),
      entradas: [{ orden: 0, via: "remota-wellknown", referencia: "remota-wellknown", condicion: "no_observada", resumen: null },
        { orden: 1, via: "proyecto", referencia: "/proyecto/<entrada1>.jsonc", condicion: "observada", resumen: "b".repeat(64) }],
    },
    agente: "a & b", clave: null,
    valores: [{ ruta: ["agent", "a & b", "description"], valor: "<script>alert(1)</script>",
      determinante: declaracion("<script>alert(1)</script>", 3), motivo: "entrada-posterior",
      desplazadas: [declaracion(0.1, 1), declaracion(0.2, 2)] },
      { ruta: ["agent", "a & b", "steps"], valor: 12, determinante: declaracion(12, 1),
        motivo: "entrada-posterior", desplazadas: [] }],
    reglas: { "orden-de-aplicacion": "Prevalece la ultima <declaracion> (RD-01).", "fuera-del-v1": "Sin resolver <permiso>." },
    noResueltas: [{ ruta: ["agent", "a & b", "permission"], regla: "fuera-del-v1" }],
    anteriores: [{ id: 7, instante: "2026-10-05T12:00:00.000Z", resumenEntradas: "a".repeat(64) },
      { id: 6, instante: "2026-10-04T12:00:00.000Z", resumenEntradas: "c".repeat(64) }],
  };
}

describe("W-13", () => {
  test("presenta las siete partes en orden, rastros y entradas sin ejecutar HTML", async () => {
    const { paginaResolucion } = await import("./resolucion");
    const recibida = paginaResolucion(respuesta());
    expect(recibida.status).toBe(200);
    expect(recibida.headers.get("content-type")).toBe("text/html; charset=utf-8");
    const cuerpo = await recibida.text();
    const partes = ["<h1>Resolución 7</h1>", "Página armada con la resolución leída del almacén de RIGE.",
      "Proyecto", "Valores efectivos", "Regla aplicada", "Claves no resueltas en el prototipo v1",
      "Entradas leídas", "Resoluciones de este proyecto"];
    let posicion = -1;
    for (const parte of partes) {
      const siguiente = cuerpo.indexOf(parte);
      expect(siguiente).toBeGreaterThan(posicion);
      posicion = siguiente;
    }
    for (const dato of ["/proyecto/&lt;ejemplo&gt;", "Instante (UTC)", "2026-10-05T12:00:00.000Z",
      "Herramienta", "opencode 1.18.25", "Agente", "a &amp; b", "Clave", "todas",
      "Resumen de las entradas leídas", "a".repeat(64), "Clave", "Valor efectivo",
      "Declaración determinante", "Declaraciones desplazadas", "<td>description</td>", "<td>steps</td>",
      "&quot;&lt;script&gt;alert(1)&lt;/script&gt;&quot;", "0.1 en /proyecto/&lt;entrada1&gt;.jsonc:6:7 (proyecto)",
      "0.2 en /proyecto/&lt;entrada2&gt;.jsonc:6:7 (proyecto)", "ninguna",
      "Prevalece la ultima &lt;declaracion&gt; (RD-01).", "Sin resolver &lt;permiso&gt;.",
      "agent.a &amp; b.permission", "Orden", "Vía", "Referencia", "Condición", "Resumen SHA-256",
      "remota-wellknown", "no_observada", "observada", "b".repeat(64), "—", "(esta)", "2026-10-04T12:00:00.000Z"]) {
      expect(cuerpo).toContain(dato);
    }
    expect(cuerpo).toMatch(/<ol>.*0\.1.*0\.2.*<\/ol>/s);
    expect(cuerpo).toContain('href="/resoluciones/6?agente=a%20%26%20b"');
    expect(cuerpo).not.toContain("agent.a &amp; b.description");
    expect(cuerpo).not.toContain("<script");
    expect(cuerpo).not.toContain("<entrada");
  });

  test("conserva agente y clave codificados en la historia y omite la lista vacia de no resueltas", async () => {
    const { paginaResolucion } = await import("./resolucion");
    const cuerpo = await paginaResolucion({ ...respuesta(), clave: "c & d", noResueltas: [] }).text();
    expect(cuerpo).toContain('href="/resoluciones/6?agente=a%20%26%20b&amp;clave=c%20%26%20d"');
    expect(cuerpo).toContain("c &amp; d");
    expect(cuerpo).not.toContain("Claves no resueltas en el prototipo v1");
  });
});
