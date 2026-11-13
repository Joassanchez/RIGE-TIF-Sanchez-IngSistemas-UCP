import { fechaLocal } from "../textos";
import { html } from "../plantillas";
import { describe, expect, test } from "bun:test";
import { estilos } from "../estilos";
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
    const partes = [html`<h1>${respuesta().agente}</h1>`.texto, "Proyecto", "¿Qué significa?",
      "Página armada con la resolución leída del almacén de RIGE.",
      "Valores efectivos", "Qué no cubre este análisis",
      "Huellas de las entradas"];
    let posicion = -1;
    for (const parte of partes) {
      const siguiente = contenido.indexOf(parte);
      expect(siguiente).toBeGreaterThan(-1);
      expect(siguiente).toBeGreaterThan(posicion);
      posicion = siguiente;
    }
    for (const dato of ["/proyecto/&lt;ejemplo&gt;", fechaLocal("2026-10-05T12:00:00.000Z"),
      "Herramienta", "opencode 1.18.25", "Agente", "a &amp; b", "Clave", "todas",
      "Resumen de las entradas leídas", "a".repeat(64), "Clave", "Valor",
      "Lo determina", "Desplazadas", '<td data-etiqueta="Clave">description</td>', '<td data-etiqueta="Clave">steps</td>',
      "&quot;&lt;script&gt;alert(1)&lt;/script&gt;&quot;", "Prevalece la ultima &lt;declaracion&gt; (RD-01).", "Qué no cubre este análisis",
      "Clave no incorporada (", "permission", "Orden", "Vía", "Referencia", "Condición", "Resumen SHA-256",
      "remota-wellknown", "no_observada", "observada", "b".repeat(64), "—"]) {
      expect(cuerpo).toContain(dato);
    }
    expect(cuerpo.replace(/<script type="application\/json" id="respuesta">[^]*?<\/script>/, "")).not.toContain("ninguna");
    expect(cuerpo).toMatch(/class="declaracion-desplazada".*0\.2.*class="declaracion-desplazada".*0\.1/s);
    const fila = seccionHtml(cuerpo, "valores").match(/<tr\b[^>]*><td[^>]*>description<\/td>.*?<\/tr>/s)![0];
    expect(fila).toContain('class="fila--declarado"');
    const celdas = fila.match(/<td\b[^>]*>.*?<\/td>/gs)!;
    expect(celdas).toHaveLength(4);
    expect(celdas[1]).toContain("&quot;&lt;script&gt;alert(1)&lt;/script&gt;&quot;");
    expect(celdas[2]).toContain("procedencia-chip--declarado");
    expect(celdas[2]).not.toContain("<details");
    expect(textoHtml(celdas[2]!)).toContain("Proyecto · carpeta superior · ../&lt;entrada3&gt;.jsonc:6:7");
    expect(celdas[3]).toContain('<ol class="cadena-desplazadas">');
    expect(celdas[3]).not.toContain("<del");
    expect(celdas[3]).not.toContain("rige");
    expect(celdas[3]).not.toContain("alert(1)");
    const desplazadas = [...celdas[3]!.matchAll(/<li class="declaracion-desplazada">(.*?)<\/li>/gs)].map(li => textoHtml(li[1]!));
    expect(desplazadas).toEqual([
      "0.2 Proyecto · carpeta superior · ../&lt;entrada2&gt;.jsonc:6:7",
      "0.1 Proyecto · carpeta superior · ../&lt;entrada1&gt;.jsonc:6:7",
    ]);
    const filaSteps = seccionHtml(cuerpo, "valores").match(/<tr\b[^>]*><td[^>]*>steps<\/td>.*?<\/tr>/s)![0];
    expect(filaSteps.match(/<td\b[^>]*>.*?<\/td>/gs)![3]).toContain(">—<");
    expect(seccionHtml(cuerpo, "valores").split("Prevalece la ultima &lt;declaracion&gt; (RD-01).").length - 1).toBe(1);
    expect(cuerpo).toContain('href="/resoluciones/7"');
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
    expect(cuerpo).toContain('name="clave" value="c &amp; d"');
    expect(cuerpo).toContain("c &amp; d");
    expect(cuerpo).not.toContain("Claves no incorporadas por RIGE");
  });
});

describe("T3-01 R-11 declaraciones en resolucion", () => {
  test("presenta las declaraciones escapadas junto al JSON de paridad", async () => {
    const { paginaResolucion } = await import("./resolucion");
    const dato = { ...respuesta(), declaraciones: ["version-no-determinada", "ejecutable-no-encontrado", "declaracion-opaca"],
      reglas: { ...respuesta().reglas, "version-no-determinada": "Version <no determinada>.", "ejecutable-no-encontrado": "No hay ejecutable & paquete.",
        "declaracion-opaca": "Aviso <opaco> & escapado." } };
    const cuerpo = await paginaResolucion(dato, sobre).text();
    const limites = seccionHtml(cuerpo, "limites-analisis");
    expect(limites).toContain("Qué no cubre este análisis");
    expect(limites).toContain("Versión instalada de OpenCode no determinada");
    expect(limites).toContain("Ejecutable de OpenCode no encontrado en PATH");
    expect(limites).toContain("<li>Aviso &lt;opaco&gt; &amp; escapado.</li>");
    seccionHtml(cuerpo, "valores");
    expect(cuerpo.indexOf('id="valores"')).toBeLessThan(cuerpo.indexOf('id="limites-analisis"'));
    expect(cuerpo.indexOf('id="limites-analisis"')).toBeLessThan(cuerpo.indexOf('class="pie-desarrolladores"'));
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
    const seccionValores = seccionHtml(cuerpo, "valores");
    const filas = [...seccionValores.matchAll(/<tr\b[^>]*><td[^>]*>(description|steps)<\/td>.*?<\/tr>/gs)].map((fila) => fila[0]);
    expect(filas).toHaveLength(2);
    const procedencias = filas.map(fila => fila.match(/<td\b[^>]*>.*?<\/td>/gs)![2]!);
    expect(procedencias[0]).not.toContain("<details");
    expect(procedencias[1]).not.toContain("<details");
    expect(seccionValores).toContain('<ul class="notas-reglas">');
    expect(seccionValores).toContain('<li>Conservar la primera &lt;declaracion&gt;.</li>');
    expect(seccionValores).toContain('<li>Conservar la ultima &amp; su orden.</li>');
    expect(cuerpo).not.toContain('id="leyenda-reglas"');
    expect(seccionHtml(cuerpo, "limites-analisis")).toContain("Clave no incorporada (<code>permission</code>): Claves combinadas o derivadas fuera del alcance actual: RIGE todavía no las resuelve");
    expect(cuerpo).not.toContain("grupo.a &amp; b");
    expect(cuerpo.replace(/<script type="application\/json" id="respuesta">[^]*?<\/script>/, "")
      .replace(/<details id="ver-json">[^]*?<\/details>/, "")).not.toContain("orden-de-aplicacion");
  });
});

describe("W-15", () => {
  test("sin valores presenta un estado informativo y la lista de claves no resueltas", async () => {
    const { paginaResolucion: presentar } = await import("./resolucion");
    const paginaResolucion = (respuesta: RespuestaValores) => presentar(respuesta, sobre);
    const recibida = paginaResolucion({ ...respuesta(), valores: [], noResueltas: [
      { ruta: ["steps"], regla: "fuera-del-v1" },
      { ruta: ["maxSteps"], regla: "fuera-del-v1" },
    ] });
    expect(recibida.status).toBe(200);
    const cuerpo = await recibida.text();
    const tabla = seccionHtml(cuerpo, "valores");
    expect(tabla).not.toContain("<tbody>");
    expect(tabla).toContain('<p class="estado-vacio">RIGE no incorpora claves resueltas para este agente.</p>');
    const limites = seccionHtml(cuerpo, "limites-analisis");
    expect(limites).toContain("Qué no cubre este análisis");
    expect(limites).toContain("<li>Clave no incorporada (<code>steps</code>): Claves combinadas o derivadas fuera del alcance actual: RIGE todavía no las resuelve</li>");
    expect(limites).toContain("<li>Clave no incorporada (<code>maxSteps</code>): Claves combinadas o derivadas fuera del alcance actual: RIGE todavía no las resuelve</li>");
  });
});

describe("T5-08-c1 C3 C4 determinante y plantillas de reglas", () => {
  test("no repite el valor determinante y presenta cada regla usada una sola vez al pie de su tabla", async () => {
    const { paginaResolucion } = await import("./resolucion");
    const original = respuesta();
    const implicito = { ...original.valores[1]!, clave: "native", rastro: { ...original.valores[1]!.rastro,
      valor: true, determinante: { valor: true, origen: { tipo: "implicito" as const, regla: "valor-implicito" },
        via: null, referencia: null, regla: "valor-implicito" } } };
    const dato = { ...original, valores: [...original.valores, implicito], reglas: {
      ...original.reglas, "valor-implicito": "Texto <implícito> completo (RD-04)." } };
    const cuerpo = await paginaResolucion(dato, sobre).text();
    const valores = seccionHtml(cuerpo, "valores");
    const filas = [...valores.matchAll(/<tr\b[^>]*><td[^>]*>.*?<\/tr>/gs)].map(f => f[0]);
    expect(filas).toHaveLength(3);
    const celdas = filas[0]!.match(/<td\b[^>]*>.*?<\/td>/gs)!;
    expect(celdas[2]).not.toContain("alert(1)");
    expect(celdas[2]).not.toContain("<details");
    expect(celdas[2]).toContain("Proyecto · carpeta superior ·");
    expect(celdas[2]).toContain('title="Abrir en VS Code: /proyecto/&lt;entrada3&gt;.jsonc"');
    const fabrica = valores.split('<details id="valores-fabrica">')[1]!;
    expect(fabrica).toContain("Estos valores los fija OpenCode 1.18.25 cuando nadie los declara");
    expect(filas[2]).toContain('class="fila--nativo"');
    expect(filas[2]!.match(/<td\b[^>]*>.*?<\/td>/gs)).toHaveLength(2);
    expect(valores).not.toContain("valor implicito");
    expect(valores.match(/Prevalece la ultima &lt;declaracion&gt; \(RD-01\)\./g)).toHaveLength(1);
    expect(valores.match(/Texto &lt;implícito&gt; completo \(RD-04\)\./g)).toHaveLength(1);
    const comunes = cuerpo.match(/<details><summary>¿Qué significa\?<\/summary>[^]*?<\/details>/)![0];
    expect(comunes).not.toContain("Prevalece la ultima &lt;declaracion&gt; (RD-01).");
    expect(comunes).not.toContain("Texto &lt;implícito&gt; completo (RD-04).");
    expect(valores).not.toContain('id="leyenda-reglas"');
    expect(JSON.parse(cuerpo.match(/id="respuesta">([^]*?)<\/script>/)![1]!)).toEqual(dato);
  });
  test("regla con clave vacía se lista una sola vez al pie de la tabla y nunca dentro de celdas", async () => {
    const { paginaResolucion } = await import("./resolucion");
    const original = respuesta();
    const dato = { ...original, valores: original.valores.map(v => ({ ...v,
      rastro: { ...v.rastro, determinante: { ...v.rastro.determinante, regla: "" } } })),
      reglas: { "": "Regla <sin código>." } };
    const tabla = seccionHtml(await paginaResolucion(dato, sobre).text(), "valores");
    expect(tabla).not.toContain("<details");
    expect(tabla.match(/<ul class="notas-reglas">/g)).toHaveLength(1);
    expect(tabla.match(/<li>Regla &lt;sin código&gt;\.<\/li>/g)).toHaveLength(1);
    expect(tabla).not.toContain('id="leyenda-reglas"');
  });
});

describe("Resolución del agente: pulido visual, orden y controles", () => {
  const sinJson = (s: string) => s.replace(/<script[^]*?<\/script>/g, "").replace(/<details id="ver-json">[^]*?<\/details>/g, "");
  const json = (cuerpo: string) => JSON.parse(cuerpo.match(/id="respuesta">([^]*?)<\/script>/)![1]!);
  const bloque = (cuerpo: string, id: string) => cuerpo.split(`id="${id}"`)[1]!.split("</section>")[0]!;
  const css = (selector: string) => [...estilos.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selectores]) => selectores!.split(",").some(s => s.trim() === selector)).map(m => m[2]).join("\n");

  test("T5-21 F-6 entradas de la foto dentro de consola y sin accion repetida", async () => {
    const { paginaResolucion } = await import("./resolucion");
    const valoresF6: RespuestaValores = { ...respuesta(), valores: [] };
    const fotoF6 = { id: 7, instante: "2026-11-11T12:00:00Z", anteriores: [] };
    const s = sinJson(await paginaResolucion(valoresF6, fotoF6).text());
    expect(s).not.toContain("Ver entradas actuales");
    expect(s.split('<details id="comando-cli">')[0]).not.toContain('id="entradas-leidas"');
    expect(s.split('<details id="comando-cli">')[1]).toContain('id="entradas-leidas"');
  });

  test("T5-15 Z-1 un campo visible y estado", async () => {
    const { paginaResolucion } = await import("./resolucion");
    const valoresZ1: RespuestaValores = { ...respuesta(), agente: "build", ruta: null, motivo: null, noResueltas: [],
      valores: [{ clave: "temperature", rastro: { ruta: ["temperature"], indiceFusion: 0, valor: 0.3,
        determinante: { valor: 0.3, origen: { tipo: "nativo", regla: "nativa" }, via: null, referencia: null, regla: "nativa" }, desplazadas: [], motivo: "nativo" } }] };
    const sobreZ1 = { id: 7, instante: "2026-11-10T12:00:00Z", anteriores: [] };
    const contextoZ1 = { idResolucion: 7, agente: "build", agentes: [{ nombre: "build" }], clave: "temperature", q: "TEMP" };
    const cuerpo = await paginaResolucion(valoresZ1, sobreZ1, contextoZ1).text();
    expect(cuerpo).not.toContain("Consulta exacta (avanzada)");
    expect(cuerpo).not.toContain('id="consultar-clave"');
    expect(cuerpo).toContain('name="q" value="TEMP"');
    expect(cuerpo).toContain('type="hidden" name="clave" value="temperature"');
    expect(cuerpo).not.toMatch(/<input(?![^>]*type="hidden")[^>]*name="clave"/);
    expect(cuerpo).not.toContain('aria-label="Panel del proyecto"');
    expect(json(cuerpo)).toEqual(valoresZ1);
  });

  test("T5-15 Z-2 orden de la pagina del agente", async () => {
    const { paginaResolucion } = await import("./resolucion");
    const valoresZ2: RespuestaValores = { ...respuesta(), agente: "build", declaraciones: ["nota"], reglas: { nota: "Nota del análisis" } };
    const sobreZ2 = { id: 7, instante: "2026-11-10T12:00:00Z", anteriores: [] };
    const contextoZ2 = { idResolucion: 7, agente: "build", agentes: [{ nombre: "build" }], clave: "temperature", q: "TEMP" };
    const cuerpo = await paginaResolucion(valoresZ2, sobreZ2, contextoZ2).text();
    const posiciones = ['id="resumen-resolucion"', 'id="seleccionar-agente"', 'id="valores"', 'id="filtrar-claves"', 'id="limites-analisis"', 'class="pie-desarrolladores"'].map(s => cuerpo.indexOf(s));
    expect(posiciones.every(p => p >= 0)).toBe(true);
    expect(posiciones).toEqual([...posiciones].sort((a, b) => a - b));
    expect(seccionHtml(cuerpo, "limites-analisis")).toContain("Nota del análisis");
  });

  test("T5-15 Z-3 instante unico", async () => {
    const { paginaResolucion } = await import("./resolucion");
    const valoresZ3 = { ...respuesta(), proyecto: "/proyecto" };
    const sobreZ3 = { id: 7, instante: "2026-11-10T12:00:00Z", anteriores: [] };
    const resumen = seccionHtml(await paginaResolucion(valoresZ3, sobreZ3).text(), "resumen-resolucion");
    expect(resumen).toContain('<dt>Proyecto</dt><dd><code title="/proyecto">proyecto</code></dd>');
    expect(resumen).toContain(`n.º ${sobreZ3.id}, ${fechaLocal(sobreZ3.instante)}`);
    expect(resumen.split(fechaLocal(sobreZ3.instante))).toHaveLength(2);
    expect(resumen).not.toMatch(/<dt>Instante/);
  });

  test("T5-22 B-2 valores largos contenidos en su celda sin perder contenido", async () => {
    const { paginaResolucion } = await import("./resolucion");
    const origenB2 = { tipo: "declarado" as const, orden: 0, posicion: { linea: 2, columna: 3 } };
    const valoresB2: RespuestaValores = { ...respuesta(), agente: "build", ruta: null, motivo: null, noResueltas: [],
      valores: [{ clave: "description", rastro: { ruta: ["description"], indiceFusion: 0, valor: "texto".repeat(150), motivo: "ultima", desplazadas: [],
        determinante: { valor: "texto".repeat(150), referencia: "/p/opencode.json", via: "proyecto", regla: "ultima", origen: origenB2 } } }] };
    const fotoB2 = { id: 7, instante: "2026-11-11T12:00:00Z", anteriores: [] };
    const s = await paginaResolucion(valoresB2, fotoB2).text();
    expect(s).toContain('class="tabla-tarjetas tabla-valores"');
    expect(s).toContain("texto".repeat(150));
    expect(css(".tabla-valores")).toMatch(/table-layout:\s*fixed/);
    expect(css(".tabla-valores td")).toMatch(/overflow-wrap:\s*anywhere/);
    for (const selector of ["code", ".ruta", ".ruta__segmento"]) expect(css(selector)).toMatch(/overflow-wrap:\s*anywhere/);
  });

  describe("U-6 a U-9", () => {
    const determinanteU = { valor: 0.3, referencia: "/repo/mi-proyecto/opencode.json", via: "proyecto", regla: "ultima",
      origen: { tipo: "declarado" as const, orden: 1, posicion: { linea: 5, columna: 7 } } };
    const valorU = (clave: string, tipo: "declarado" | "implicito" | "nativo") => ({ clave, rastro: {
      ruta: [clave], indiceFusion: 0, valor: 0.3, motivo: "ultima", desplazadas: tipo === "declarado" ? [{ ...determinanteU, valor: 0.1, referencia: "/repo/opencode.json" }, { ...determinanteU, valor: 0.2 }] : [],
      determinante: tipo === "declarado" ? determinanteU : { ...determinanteU, referencia: null, via: null,
        origen: { tipo, regla: tipo === "implicito" ? "valor-implicito-del-agente" : "nativa" } },
    } });
    const valoresU: RespuestaValores = { ...respuesta(), proyecto: "/repo/mi-proyecto", agente: "build", ruta: null, motivo: null, noResueltas: [],
      valores: [valorU("zeta", "declarado"), valorU("beta", "nativo"), valorU("alfa", "declarado"), valorU("delta", "implicito")],
      reglas: { "orden-de-aplicacion": "La última declaración prevalece.", "valor-implicito-del-agente": "Explicación implícita.", ultima: "Regla última." } };
    const sobreU = { id: 7, instante: "2026-11-11T12:00:00Z", anteriores: [{ id: 7, instante: "2026-11-11T12:00:00Z", resumenEntradas: "a".repeat(64) }] };
    const agentesU = [{ nombre: "build", modo: "primary", origen: "nativo" as const, oculto: false }];
    const reglasU = { ...respuesta(), agente: "build", cadena: [], ejesParciales: [], advertencias: [],
      reglas: { parcial: "Aprobaciones permanentes no observadas.", indices: "Índices desde 1.", ejecucion: "No reproduce opencode run.", "eje-parcialmente-observado": "El objetivo concreto requiere consulta." },
      matriz: { sujetos: ["read", "external_directory"], motivos: ["indices"], noObservados: [], filas: [{ agente: "build", oculto: false, error: null,
        ejesParciales: ["external_directory"], declaraciones: ["parcial"], advertencias: ["ejecucion"], celdas: [
          { sujeto: "read", efecto: "allow", prevalece: 1, motivo: null },
          { sujeto: "external_directory", efecto: null, prevalece: null, motivo: "eje-parcialmente-observado" },
        ] }] } };
    const agenteFn = async (q = "") => {
      const { paginaResolucion } = await import("./resolucion");
      return paginaResolucion(valoresU, sobreU, { agentes: agentesU, agente: "build", q, lanzadoPor: "plan" }, { agente: agentesU[0]!, reglas: reglasU }).text();
    };

    test("U-6 selector junto a identidad y buscador lineal sin tarjeta ni ayuda visible", async () => {
      const cuerpo = await agenteFn();
      expect(cuerpo).toMatch(/class="barra-agente">[^]*?class="identidad-agente"[^]*?id="seleccionar-agente"[^]*?<\/form>\s*<\/div>/);
      expect(cuerpo).toMatch(/<form id="filtrar-claves" class="barra-busqueda"[^]*?title="Filtra solo las filas visibles; no cambia la consulta ni su JSON\."/);
      expect(cuerpo).not.toContain('id="ayuda-filtro"');
      expect(css(".barra-agente .selector-agente")).toContain("border: 0");
      expect(css(".barra-busqueda")).toContain("display: flex");
      expect(css(".barra-agente")).toContain("flex-direction: column");
    });

    test("U-7 declaradas ordenadas primero; fábrica cerrada en dos columnas y regla única al pie", async () => {
      const { paginaResolucion } = await import("./resolucion");
      const cuerpo = await agenteFn();
      const visibles = bloque(sinJson(cuerpo), "valores");
      const fabrica = visibles.split('<details id="valores-fabrica"><summary>Valores de fábrica (2)</summary>');
      expect(fabrica).toHaveLength(2);
      expect(fabrica[0]!.indexOf('data-etiqueta="Clave">alfa')).toBeLessThan(fabrica[0]!.indexOf('data-etiqueta="Clave">zeta'));
      expect(fabrica[0]).not.toContain('data-etiqueta="Clave">beta');
      expect(fabrica[0]).toContain('class="fila--declarado"');
      expect(fabrica[1]).toContain("Estos valores los fija OpenCode 1.18.25 cuando nadie los declara");
      expect(fabrica[1]!.indexOf('data-etiqueta="Clave">beta')).toBeLessThan(fabrica[1]!.indexOf('data-etiqueta="Clave">delta'));

      const fila = fabrica[1]!.match(/<tr\b[^>]*><td data-etiqueta="Clave">delta<\/td>.*?<\/tr>/s)![0]!;
      expect(fila).toContain('class="fila--nativo"');
      expect(fila.match(/<td\b[^>]*>.*?<\/td>/gs)).toHaveLength(2);
      expect(fabrica[1]).not.toContain("OpenCode · valor de fábrica");
      expect(visibles).not.toContain("valor implicito del agente");
      expect(visibles.match(/Explicación implícita\./g)).toHaveLength(1);
      expect(visibles.match(/Regla última\./g)).toHaveLength(1);
      expect(cuerpo.match(/<summary>¿Qué significa\?<\/summary>/g)).toHaveLength(1);
      expect(cuerpo).not.toContain("<summary>Cómo se decide</summary>");
      const filtrado = await agenteFn("DELTA");
      expect(filtrado).toContain("Valores de fábrica (1)");
      expect(JSON.parse(filtrado.match(/id="respuesta">([^]*?)<\/script>/)![1]!)).toEqual(valoresU);
      const sinPlantillas = sinJson(await paginaResolucion({ ...valoresU, reglas: {}, valores: [valorU("delta", "implicito")] }, sobreU).text());
      expect(sinPlantillas).not.toContain("ultima");
      expect(sinPlantillas).not.toContain("valor implicito del agente");
    });

    test("U-8 cadena de desplazadas ordenada por precedencia sin tachado, rige ni flechas", async () => {
      const desplazadas = (await agenteFn()).match(/data-etiqueta="Desplazadas">([^]*?)<\/td>/)![1]!;
      expect(desplazadas).toContain('<ol class="cadena-desplazadas">');
      expect(desplazadas).not.toContain("<del");
      expect(desplazadas).not.toContain("insignia--rige");
      expect(desplazadas).not.toContain("insignia--desplazado");
      expect(desplazadas).not.toContain("←");
      expect(textoHtml(desplazadas)).toMatch(/0\.2 Proyecto · esta carpeta · \.\/opencode\.json:5:7.*0\.1 Proyecto · carpeta superior · \.\.\/opencode\.json:5:7/);
      expect(css(".valor-desplazado")).not.toContain("display: block");
    });

    test("U-9 sujetos en cuadrícula, índice en title, leyenda parcial y límites unificados", async () => {
      const cuerpo = await agenteFn();
      const permisos = bloque(cuerpo, "permisos-agente");
      const celdas = permisos.split('class="sujetos-permiso"')[1]!.split("</dl>")[0]!;
      expect(celdas).toContain('title="Regla 1"');
      expect(celdas).not.toContain("<p");
      expect(celdas).toContain(">parcial</span>");
      expect(permisos).toContain('class="leyenda-parcial"');
      expect(permisos).not.toContain("<details");
      const limites = bloque(cuerpo, "limites-analisis");
      expect(limites).toContain("Qué no cubre este análisis");
      for (const texto of ["opencode run", "external_directory"]) expect(limites).toContain(texto);
    });

    test("T6-22 estilos, procedencia en chip y criterios de diseño sin códigos internos ni 'ninguna'", async () => {
      const { paginaResolucion } = await import("./resolucion");
      expect(css('#valores td[data-etiqueta="Valor"]')).toContain("color: var(--rige)");
      expect(css('#valores td[data-etiqueta="Valor"]')).toContain("font-weight: 700");
      expect(css(".procedencia-chip--declarado")).toContain("border-left-color: var(--declarado)");
      expect(css(".procedencia-chip--nativo")).toContain("border-left-color: var(--neutro)");
      expect(css(".fila--declarado td:first-child")).toContain("border-left: 3px solid var(--declarado)");
      expect(css(".fila--nativo td:first-child")).toContain("border-left: 3px solid var(--neutro)");
      expect(css("details")).toContain("border: 0");
      expect(estilos).not.toMatch(/border-radius:(?!\s*\.5rem\s*[;\}])/);

      const sinReglaLegible: RespuestaValores = {
        ...valoresU,
        reglas: {},
        valores: [valorU("alfa", "declarado"), valorU("delta", "implicito")],
      };
      const visible = sinJson(await paginaResolucion(sinReglaLegible, sobreU, { agentes: agentesU, agente: "build" }).text());
      expect(visible).not.toContain("ninguna");
      expect(visible).not.toContain("valor implicito del agente");
      expect(bloque(visible, "valores")).not.toContain("<details class");
    });

    test("T6-24 X-1, X-2, X-8 y X-9 barra de contexto, límites antes del pie, huellas y comparación anterior", async () => {
      const { paginaResolucion } = await import("./resolucion");
      const baseContexto = { id: 10, instante: sobreU.instante, resumenEntradas: "b".repeat(64) };
      const igual = await paginaResolucion(
        { ...valoresU, resumenEntradas: "b".repeat(64), declaraciones: ["fuera-del-v1", "regla-propia"], reglas: { ...valoresU.reglas, "regla-propia": "Aviso <propio>." } },
        { id: 10, instante: sobreU.instante, anteriores: [baseContexto, { id: 9, instante: sobreU.instante, resumenEntradas: "b".repeat(64) }] },
        { agentes: agentesU, agente: "build" },
      ).text();
      const cabecera = bloque(igual, "resumen-resolucion");
      expect(cabecera).toContain('<dl class="contexto">');
      expect(cabecera).not.toContain(" · n.º");
      expect(cabecera).toContain("Configuración sin cambios desde el análisis n.º 9");
      expect(igual.split('class="pie-desarrolladores"')[0]).not.toMatch(/\b[0-9a-f]{64}\b/);
      const pie = igual.split('class="pie-desarrolladores"')[1]!;
      for (const fragmento of ['id="comando-cli"', "comando equivalente", 'id="ver-json"', "JSON", 'id="entradas-leidas"', "Huellas de las entradas"]) {
        expect(pie).toContain(fragmento);
      }
      expect(igual.indexOf('id="limites-analisis"')).toBeLessThan(igual.indexOf('class="pie-desarrolladores"'));
      expect(bloque(igual, "limites-analisis")).toContain("Aviso &lt;propio&gt;.");

      const cambiado = await paginaResolucion(
        { ...valoresU, resumenEntradas: "c".repeat(64) },
        { id: 10, instante: sobreU.instante, anteriores: [{ ...baseContexto, resumenEntradas: "c".repeat(64) }, { id: 8, instante: sobreU.instante, resumenEntradas: "b".repeat(64) }] },
        { agentes: agentesU, agente: "build" },
      ).text();
      expect(cambiado).toContain("La configuración cambió desde el análisis n.º 8");
      expect(cambiado).toContain('href="/comparar?desde=8&amp;hasta=10"');

      const unico = await paginaResolucion(valoresU, sobreU, { agentes: agentesU, agente: "build" }).text();
      expect(unico).not.toContain("<dt>Cambios</dt>");
    });
  });
});
