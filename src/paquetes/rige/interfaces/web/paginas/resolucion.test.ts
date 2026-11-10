import { describe, expect, test } from "bun:test";
import type { RespuestaValores, DeclaracionUbicada } from "../../../aplicacion/respuestas/valores";
import { versionRige } from "../../../aplicacion/respuestas/estado";
import { seccionHtml, textoHtml } from "../../../../../pruebas/utilidades/html";

function respuesta(): RespuestaValores {
  const declaracion = (valor: string | number, orden: number): DeclaracionUbicada => ({
    valor, origen: { tipo: "declarado", orden, posicion: { linea: 6, columna: 7 } },
    via: "proyecto", referencia: `/proyecto/<entrada${orden}>.jsonc`, regla: "orden-de-aplicacion",
    localizacion: `/proyecto/<entrada${orden}>.jsonc:6:7`,
  });
  return {
    esquema: 2, declaraciones: [], versionRige,
    proyecto: "/proyecto/<ejemplo>",
      herramienta: "opencode", versionHerramienta: "1.18.25", resumenEntradas: "a".repeat(64),
      entradas: [{ orden: 0, via: "remota-wellknown", referencia: "remota-wellknown", condicion: "no_observada", resumen: null },
        { orden: 1, via: "proyecto", referencia: "/proyecto/<entrada1>.jsonc", condicion: "observada", resumen: "b".repeat(64) }],
    agente: "a & b", ruta: null, motivo: null,
    valores: [{ clave: "description", rastro: { ruta: ["agent", "a & b", "description"], indiceFusion: 0, valor: "<script>alert(1)</script>",
      determinante: declaracion("<script>alert(1)</script>", 3), motivo: "entrada-posterior",
      desplazadas: [declaracion(0.1, 1), declaracion(0.2, 2)] } },
      { clave: "steps", rastro: { ruta: ["agent", "a & b", "steps"], indiceFusion: 1, valor: 12, determinante: declaracion(12, 1),
        motivo: "entrada-posterior", desplazadas: [] } }],
    reglas: { "orden-de-aplicacion": "Prevalece la ultima <declaracion> (RD-01).", "fuera-del-v1": "Sin resolver <permiso>." },
    noResueltas: [{ ruta: ["permission"], regla: "fuera-del-v1" }],

  };
}

const sobre = { id: 7, instante: "2026-10-05T12:00:00.000Z",
  anteriores: [{ id: 7, instante: "2026-10-05T12:00:00.000Z", resumenEntradas: "a".repeat(64) },
      { id: 6, instante: "2026-10-04T12:00:00.000Z", resumenEntradas: "c".repeat(64) }],
};

describe("W-13", () => {
  test("presenta las siete partes en orden, rastros y entradas sin ejecutar HTML", async () => {
    const { paginaResolucion: presentar } = await import("./resolucion");
    const paginaResolucion = (respuesta: RespuestaValores) => presentar(respuesta, sobre);
    const recibida = paginaResolucion(respuesta());
    expect(recibida.status).toBe(200);
    expect(recibida.headers.get("content-type")).toBe("text/html; charset=utf-8");
    const cuerpo = await recibida.text();
    const contenido = cuerpo.split('<main id="contenido" tabindex="-1">')[1]!;
    expect(contenido).toBeDefined();
    const partes = ["<h1>Resolución 7</h1>", "Página armada con la resolución leída del almacén de RIGE.",
      "Proyecto", "Valores efectivos", "Cómo se decide", "Claves no incorporadas por RIGE",
      "Entradas leídas", "Resoluciones de este proyecto"];
    let posicion = -1;
    for (const parte of partes) {
      const siguiente = contenido.indexOf(parte);
      expect(siguiente).toBeGreaterThan(-1);
      expect(siguiente).toBeGreaterThan(posicion);
      posicion = siguiente;
    }
    for (const dato of ["/proyecto/&lt;ejemplo&gt;", "Instante (UTC)", "2026-10-05T12:00:00.000Z",
      "Herramienta", "opencode 1.18.25", "Agente", "a &amp; b", "Clave", "todas",
      "Resumen de las entradas leídas", "a".repeat(64), "Clave", "Valor efectivo",
      "Declaración determinante", "Declaraciones desplazadas", '<td data-etiqueta="Clave">description</td>', '<td data-etiqueta="Clave">steps</td>',
      "&quot;&lt;script&gt;alert(1)&lt;/script&gt;&quot;", "ninguna",
      "Prevalece la ultima &lt;declaracion&gt; (RD-01).", "Sin resolver &lt;permiso&gt;.",
      "permission: Sin resolver &lt;permiso&gt;.", "Orden", "Vía", "Referencia", "Condición", "Resumen SHA-256",
      "remota-wellknown", "no_observada", "observada", "b".repeat(64), "—", "(esta)", "2026-10-04T12:00:00.000Z"]) {
      expect(cuerpo).toContain(dato);
    }
    expect(cuerpo).toMatch(/<ol>.*0\.1.*0\.2.*<\/ol>/s);
    const fila = seccionHtml(cuerpo, "valores").match(/<tr><td[^>]*>description<\/td>.*?<\/tr>/s)![0];
    const celdas = fila.match(/<td\b[^>]*>.*?<\/td>/gs)!;
    expect(celdas).toHaveLength(4);
    expect(celdas[1]).toContain("&quot;&lt;script&gt;alert(1)&lt;/script&gt;&quot;");
    expect(textoHtml(celdas[2]!)).toContain("proyecto /proyecto/&lt;entrada3&gt;.jsonc:6:7");
    const desplazadas = [...celdas[3]!.matchAll(/<li>(.*?)<\/li>/gs)].map(li => textoHtml(li[1]!));
    expect(desplazadas).toEqual(["0.1 proyecto /proyecto/&lt;entrada1&gt;.jsonc:6:7", "0.2 proyecto /proyecto/&lt;entrada2&gt;.jsonc:6:7"]);
    expect(cuerpo).toContain('href="/resoluciones/6?agente=a%20%26%20b"');
    expect(cuerpo).not.toContain("agent.a &amp; b.description");
    const bloques = [...cuerpo.matchAll(/<script type="application\/json" id="respuesta">([^]*?)<\/script>/g)];
    expect(bloques).toHaveLength(1);
    expect(JSON.parse(bloques[0]![1]!)).toEqual(respuesta());
    expect(cuerpo.replace(bloques[0]![0], "")).not.toMatch(/<script/i);
    expect(cuerpo).not.toContain("<entrada");
  });

  test("conserva agente y clave codificados en la historia y omite la lista vacia de no resueltas", async () => {
    const { paginaResolucion: presentar } = await import("./resolucion");
    const paginaResolucion = (respuesta: RespuestaValores) => presentar(respuesta, sobre);
    const cuerpo = await paginaResolucion({ ...respuesta(), ruta: ["c & d"], noResueltas: [] }).text();
    expect(cuerpo).toContain('href="/resoluciones/6?agente=a%20%26%20b&amp;clave=c%20%26%20d"');
    expect(cuerpo).toContain("c &amp; d");
    expect(cuerpo).not.toContain("Claves no incorporadas por RIGE");
  });
});

describe("T3-01 R-11 declaraciones en resolucion", () => {
  test("presenta las declaraciones escapadas junto al JSON de paridad", async () => {
    const { paginaResolucion } = await import("./resolucion");
    const dato = { ...respuesta(), declaraciones: ["version-no-determinada", "ejecutable-no-encontrado"],
      reglas: { ...respuesta().reglas, "version-no-determinada": "Version <no determinada>.", "ejecutable-no-encontrado": "No hay ejecutable & paquete." } };
    const cuerpo = await paginaResolucion(dato, sobre).text();
    const declaraciones = seccionHtml(cuerpo, "declaraciones");
    expect(declaraciones).toContain("<p>Version &lt;no determinada&gt;.</p>");
    expect(declaraciones).toContain("<p>No hay ejecutable &amp; paquete.</p>");
    seccionHtml(cuerpo, "valores");
    expect(cuerpo.indexOf('id="declaraciones"')).toBeLessThan(cuerpo.indexOf('id="valores"'));
    expect(JSON.parse(cuerpo.match(/id="respuesta">([^]*?)<\/script>/)![1]!)).toEqual(dato);
  });
});

describe("W-14", () => {
  test("presenta claves relativas y la regla opaca de cada determinante sin una regla fija", async () => {
    const { paginaResolucion: presentar } = await import("./resolucion");
    const paginaResolucion = (respuesta: RespuestaValores) => presentar(respuesta, sobre);
    const original = respuesta();
    const valores = original.valores.map(({ clave, rastro }, indice) => ({ clave,
      rastro: { ...rastro, ruta: ["perfiles", "grupo", original.agente, clave],
        determinante: { ...rastro.determinante, regla: indice === 0 ? "primera" : "ultima" } },
    }));
    const cuerpo = await paginaResolucion({ ...original, valores, reglas: {
      primera: "Conservar la primera <declaracion>.", ultima: "Conservar la ultima & su orden.",
      "fuera-del-v1": "No se resuelve <permiso>.",
    } }).text();
    const filas = [...seccionHtml(cuerpo, "valores").matchAll(/<tr><td[^>]*>(description|steps)<\/td>.*?<\/tr>/gs)].map((fila) => fila[0]);
    expect(filas).toHaveLength(2);
    const procedencias = filas.map(fila => fila.match(/<td\b[^>]*>.*?<\/td>/gs)![2]!);
    expect(procedencias[0]).toContain('<code>primera</code>');
    expect(procedencias[0]).toContain('<p>Conservar la primera &lt;declaracion&gt;.</p>');
    expect(procedencias[1]).toContain('<code>ultima</code>');
    expect(procedencias[1]).toContain('<p>Conservar la ultima &amp; su orden.</p>');
    expect(cuerpo).not.toContain('id="leyenda-reglas"');
    expect(cuerpo).toContain("permission: No se resuelve &lt;permiso&gt;.");
    expect(cuerpo).not.toContain("grupo.a &amp; b");
    expect(cuerpo.replace(/<script type="application\/json" id="respuesta">[^]*?<\/script>/, "")).not.toContain("orden-de-aplicacion");
  });
});

describe("W-15", () => {
  test("sin valores presenta una sola fila informativa y la lista de claves no resueltas", async () => {
    const { paginaResolucion: presentar } = await import("./resolucion");
    const paginaResolucion = (respuesta: RespuestaValores) => presentar(respuesta, sobre);
    const recibida = paginaResolucion({ ...respuesta(), valores: [], noResueltas: [
      { ruta: ["steps"], regla: "fuera-del-v1" },
      { ruta: ["maxSteps"], regla: "fuera-del-v1" },
    ] });
    expect(recibida.status).toBe(200);
    const cuerpo = await recibida.text();
    const tabla = seccionHtml(cuerpo, "valores").split("<tbody>")[1]!.split("</tbody>")[0]!;
    expect(tabla.match(/<tr>/g)).toHaveLength(1);
    expect(tabla).toContain('<td colspan="4">RIGE no incorpora claves resueltas para este agente.</td>');
    expect(cuerpo).toContain("Claves no incorporadas por RIGE");
    expect(cuerpo).toContain("<li>steps: Sin resolver &lt;permiso&gt;.</li>");
    expect(cuerpo).toContain("<li>maxSteps: Sin resolver &lt;permiso&gt;.</li>");
  });
});

describe("T5-08-c1 C3 C4 determinante y leyenda", () => {
  test("no repite el valor determinante y presenta plantillas comunes antes de la tabla", async () => {
    const { paginaResolucion } = await import("./resolucion");
    const original = respuesta();
    const implicito = { ...original.valores[1]!, clave: "native", rastro: { ...original.valores[1]!.rastro,
      valor: true, determinante: { valor: true, origen: { tipo: "implicito" as const, regla: "valor-implicito" },
        via: null, referencia: null, regla: "valor-implicito" } } };
    const dato = { ...original, valores: [...original.valores, implicito], reglas: {
      ...original.reglas, "valor-implicito": "Texto <implícito> completo (RD-04)." } };
    const cuerpo = await paginaResolucion(dato, sobre).text();
    const valores = seccionHtml(cuerpo, "valores");
    const filas = [...valores.matchAll(/<tr><td[^>]*>.*?<\/tr>/gs)].map(f => f[0]);
    expect(filas).toHaveLength(3);
    const celdas = filas[0]!.match(/<td\b[^>]*>.*?<\/td>/gs)!;
    expect(celdas[2]).not.toContain("alert(1)");
    expect(celdas[2]).toContain('class="insignia insignia--neutra">proyecto');
    expect(celdas[2]).toContain('title="/proyecto/&lt;entrada3&gt;.jsonc:6:7"');
    expect(filas[2]!.match(/<td\b[^>]*>.*?<\/td>/gs)![1]).toContain("implícito");
    expect(filas[2]!.match(/<td\b[^>]*>.*?<\/td>/gs)![2]).toContain("valor-implicito");
    const comunes = valores.split('<table')[0]!;
    expect(comunes.match(/Prevalece la ultima &lt;declaracion&gt; \(RD-01\)\./g)).toHaveLength(1);
    expect(comunes.match(/Texto &lt;implícito&gt; completo \(RD-04\)\./g)).toHaveLength(1);
    expect(valores).not.toContain('id="leyenda-reglas"');
    expect(JSON.parse(cuerpo.match(/id="respuesta">([^]*?)<\/script>/)![1]!)).toEqual(dato);
  });
  test("sin identificador legible conserva el texto completo en un details por fila", async () => {
    const { paginaResolucion } = await import("./resolucion");
    const original = respuesta();
    const dato = { ...original, valores: original.valores.map(v => ({ ...v,
      rastro: { ...v.rastro, determinante: { ...v.rastro.determinante, regla: "" } } })),
      reglas: { "": "Regla <sin código>." } };
    const tabla = seccionHtml(await paginaResolucion(dato, sobre).text(), "valores");
    expect(tabla.match(/<details class="regla-detalle">/g)).toHaveLength(2);
    expect(tabla.match(/<p>Regla &lt;sin código&gt;\.<\/p>/g)).toHaveLength(2);
    expect(tabla).not.toContain('id="leyenda-reglas"');
  });
});
