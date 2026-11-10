import { describe, expect, test } from "bun:test";
import type { RespuestaComparacion } from "../../../aplicacion/respuestas/comparacion";
import { paginaComparacion } from "./comparacion";
import { paginaInicio } from "./inicio";
import { versionRige } from "../../../aplicacion/respuestas/estado";
import { textoHtml } from "../../../../../pruebas/utilidades/html";

describe("T5-14 K-5 plantillas", () => {
  test("referencias, rutas y enlaces hostiles, todas las insignias, filtro y JSON integro", async () => {
    const ataque = ' & "# espacio </script><script>', nombre = "agente" + ataque;
    const lado = (referencia: string) => ({ valor: ataque, determinante: { origen: { tipo: "declarado" as const, orden: 0, posicion: { linea: 2, columna: 3 } },
      via: ataque, referencia, localizacion: referencia + ":2:3", valor: ataque, regla: "regla" } });
    const foto = { id: 1, instante: "antes", entradas: [], resumenEntradas: "", noComparables: [], motivosAgentes: [], reglas: {} };
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
    const escapar = (s: string) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
    for (const referencia of ["/anterior/", "/nueva/", "/alta/", "/baja/"]) expect(texto).toContain(escapar(referencia + ataque + ":2:3"));
    expect(pagina).not.toContain("</script><script>");
    expect(pagina.match(/<script\b/g)).toHaveLength(1);
    const json = pagina.match(/id="respuesta">([^]*?)<\/script>/)![1]!;
    expect(JSON.parse(json)).toEqual(r);
    expect(json).not.toContain("<");
    expect(pagina).toContain(`/comparar?desde=1&amp;hasta=2&amp;agente=${encodeURIComponent(nombre)}`);
    for (const clase of ["permitida", "denegada", "pregunta"]) expect(pagina).toContain(`insignia--${clase}`);
    expect(pagina).toContain("1 cambios, 1 claves nuevas, 1 quitadas");
    expect(pagina).not.toContain("<h2>Agente otro</h2>");
    const inicio = await paginaInicio({ esquema: 2, versionRige, almacen: { ruta: "/privado", versionEsquema: 2 } },
      { esquema: 2, proyectos: [{ proyecto: r.proyecto, id: 2, instante: "foto", cantidad: 2 }] }).text();
    expect(inicio).toContain(`/resolver?proyecto=${encodeURIComponent(r.proyecto)}`);
    expect(textoHtml(inicio)).toContain(escapar(r.proyecto));
    expect(inicio).not.toContain("<script");
  });
});
