import { describe, expect, test } from "bun:test";
import type { RespuestaComparacion } from "../../../aplicacion/respuestas/contrato-generado";
import { paginaComparacion } from "./comparacion";
import { paginaInicio } from "./inicio";
import { versionRige } from "../../../aplicacion/respuestas/estado";
import { seccionHtml, textoHtml } from "../../../../../pruebas/utilidades/html";
import { fechaLocal } from "../textos";

describe("T5-14 K-5 plantillas", () => {
  test("referencias, rutas y enlaces hostiles, todas las insignias, filtro y JSON integro", async () => {
    const ataque = ' & "# espacio </script><script>', nombre = "agente" + ataque;
    const lado = (referencia: string) => ({ valor: ataque, determinante: { origen: { tipo: "declarado" as const, orden: 0, posicion: { linea: 2, columna: 3 } },
      via: ataque, referencia, localizacion: referencia + ":2:3", valor: ataque, regla: "regla" } });
    const foto = { id: 1, instante: "2026-11-01T12:00:00Z", entradas: [], resumenEntradas: "", noComparables: [], motivosAgentes: [], reglas: {} };
    const r: RespuestaComparacion = { esquema: 2, proyecto: "/proyecto" + ataque, desde: foto, hasta: { ...foto, id: 2 },
      agentes: { agregados: [], quitados: [], comunes: [nombre, "otro"], inciertos: [] }, parcial: false, sustituciones: "solo-representacion-protegida",
      resumen: { cambiadas: 1, agregadas: 1, quitadas: 1, sinCambio: 0 }, comparaciones: [{ agente: nombre,
        resumen: { cambiadas: 1, agregadas: 1, quitadas: 1, sinCambio: 0 }, cambios: [
          { ruta: [ataque, "a.b", "a/b"], tipo: "cambiada", motivos: ["valor", "procedencia"], antes: lado("/anterior/" + ataque), despues: lado("/nueva/" + ataque) },
          { ruta: ["alta"], tipo: "agregada", motivos: [], antes: null, despues: lado("/alta/" + ataque) },
          { ruta: ["baja"], tipo: "quitada", motivos: [], antes: lado("/baja/" + ataque), despues: null },
        ] }, { agente: "otro", resumen: { cambiadas: 0, agregadas: 0, quitadas: 0, sinCambio: 2 }, cambios: [] }] };
    const pagina = await paginaComparacion(r, nombre).text();
    const texto = textoHtml(pagina);
    expect(pagina).toContain("¿Qué cambió entre estos análisis?");
    expect(pagina).not.toContain('class="ceja"');
    const escapar = (s: string) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
    for (const referencia of ["/anterior/", "/nueva/", "/alta/", "/baja/"]) expect(pagina).toContain(`title="Abrir en VS Code: ${escapar(referencia + ataque)}"`);
    expect(pagina).not.toContain("</script><script>");
    expect(pagina.match(/<script\b/g)).toHaveLength(1);
    const json = pagina.match(/id="respuesta">([^]*?)<\/script>/)![1]!;
    expect(JSON.parse(json)).toEqual(r);
    expect(json).not.toContain("<");
    expect(pagina).toContain(`/comparar?desde=1&amp;hasta=2&amp;agente=${encodeURIComponent(nombre)}`);
    expect(pagina).toContain("insignia--neutra");
    expect(pagina).not.toMatch(/insignia--(?:permitida|denegada|pregunta)/);
    for (const conteo of ["1 cambio", "1 clave nueva", "1 quitada"]) expect(pagina).toContain(`>${conteo}</span>`);
    expect(pagina).not.toContain("<h2>Agente otro</h2>");
    const inicio = await paginaInicio({ esquema: 2, versionRige, almacen: { ruta: "/privado", versionEsquema: 2 } },
      { esquema: 2, proyectos: [{ proyecto: r.proyecto, id: 2, instante: "2026-11-01T12:00:00Z", cantidad: 2 }] }, new Date("2026-11-11T12:00:00Z")).text();
    expect(inicio).toContain(`/resolver?proyecto=${encodeURIComponent(r.proyecto)}`);
    expect(textoHtml(inicio)).toContain(escapar(r.proyecto));
    expect(inicio).not.toContain("<script");
  });
});

describe("Comparación de resoluciones", () => {
  const json = (cuerpo: string) => JSON.parse(cuerpo.match(/id="respuesta">([^]*?)<\/script>/)![1]!);
  const foto = { id: 1, instante: "2026-11-10T12:00:00Z", entradas: [], resumenEntradas: "", noComparables: [], motivosAgentes: [], reglas: {} };
  const declaracion = { valor: 0.3, via: "proyecto", referencia: "/proyecto/opencode.jsonc", localizacion: "NO PARSEAR",
    regla: "ultima", origen: { tipo: "declarado" as const, orden: 1, posicion: { linea: 5, columna: 7 } } };
  const comparacion: RespuestaComparacion = { esquema: 2, proyecto: "/proyecto", desde: foto, hasta: { ...foto, id: 2 },
    agentes: { agregados: [], quitados: [], comunes: ["build", "compaction", "explore"], inciertos: [] }, parcial: false, sustituciones: "solo-representacion-protegida",
    resumen: { cambiadas: 1, agregadas: 0, quitadas: 0, sinCambio: 12 }, comparaciones: [
      { agente: "build", resumen: { cambiadas: 1, agregadas: 0, quitadas: 0, sinCambio: 0 }, cambios: [
        { ruta: ["a", "b"], tipo: "cambiada", motivos: ["valor"], antes: { valor: 1, determinante: declaracion },
          despues: { valor: 2, determinante: declaracion } }] },
      ...["compaction", "explore"].map(agente => ({ agente, resumen: { cambiadas: 0, agregadas: 0, quitadas: 0, sinCambio: 6 }, cambios: [] })) ] };

  test("T5-15 Z-9 compacta sin cambios y ofrece columnas, ruta legible, resumen y tiempos legibles", async () => {
    const cuerpo = await paginaComparacion(comparacion).text();
    expect(textoHtml(cuerpo)).toContain("Sin cambios: compaction (6), explore (6)");
    for (const nombre of ["compaction", "explore"]) expect(cuerpo).not.toContain(`<h2>Agente ${nombre}</h2>`);
    expect(cuerpo).toContain('<nav class="pestanas" aria-label="Filtrar comparación">');
    expect(cuerpo).toContain('<th>Clave</th><th>Antes</th><th>Después</th>');
    expect(cuerpo).toContain('data-etiqueta="Antes"');
    expect(cuerpo).toContain('data-etiqueta="Después"');
    expect(cuerpo).toContain('title="[&quot;a&quot;,&quot;b&quot;]">a › b</code>');
    const resumen = seccionHtml(cuerpo, "resumen-comparacion");
    expect(resumen.match(/class="insignia /g)?.length).toBeGreaterThanOrEqual(3);
    expect(resumen).toContain("Antes"); expect(resumen).toContain("Después");
    expect(resumen).toContain(fechaLocal(foto.instante));
    expect(json(cuerpo)).toEqual(comparacion);
  });

  test("P-6 fechas locales, migas, tres columnas y procedencias enlazadas", async () => {
    const fotoP6 = { id: 7, instante: "2026-11-11T12:00:00Z", entradas: [], resumenEntradas: "x", noComparables: [], motivosAgentes: [], reglas: {} };
    const comparacionP6: RespuestaComparacion = { esquema: 2, proyecto: "/p/proyecto", desde: fotoP6, hasta: { ...fotoP6, id: 8, instante: "2026-11-12T12:00:00Z" }, parcial: false, sustituciones: "solo-representacion-protegida",
      agentes: { agregados: [], quitados: [], comunes: ["a/b", "otro"], inciertos: [] }, resumen: { cambiadas: 1, agregadas: 0, quitadas: 0, sinCambio: 2 },
      comparaciones: [{ agente: "a/b", resumen: { cambiadas: 1, agregadas: 0, quitadas: 0, sinCambio: 0 }, cambios: [{ ruta: ["model"], tipo: "cambiada", motivos: ["valor"], antes: { valor: "antes", determinante: declaracion }, despues: { valor: "después", determinante: declaracion } }] },
        { agente: "otro", resumen: { cambiadas: 0, agregadas: 0, quitadas: 0, sinCambio: 2 }, cambios: [] }] };
    const cuerpo = await paginaComparacion(comparacionP6).text();
    expect(cuerpo).toContain(`<h1>Cambios entre ${fechaLocal(fotoP6.instante)} y ${fechaLocal(comparacionP6.hasta.instante)}</h1>`);
    expect(cuerpo).toContain('aria-current="page">Comparar</span>');
    expect(cuerpo).toContain('<th>Clave</th><th>Antes</th><th>Después</th>');
    expect(cuerpo).toContain("Sin cambios: otro (2)");
    expect(cuerpo).toContain("vscode://file/"); expect(json(cuerpo)).toEqual(comparacionP6);
  });
});
