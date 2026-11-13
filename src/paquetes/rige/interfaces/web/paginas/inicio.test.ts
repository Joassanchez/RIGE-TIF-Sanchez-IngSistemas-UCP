import { describe, expect, test } from "bun:test";
import { paginaInicio } from "./inicio";
import { versionRige } from "../../../aplicacion/respuestas/estado";
import { fechaRelativa } from "../textos";
import { estilos } from "../estilos";
import { seccionHtml } from "../../../../../pruebas/utilidades/html";

function css(selector: string, texto = estilos): string {
  return [...texto.replace(/\/\*[^]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selectores]) => selectores!.split(",").some(s => s.trim() === selector))
    .map(([, , declaraciones]) => declaraciones).join("\n");
}

describe("W-2", () => {
  test("presenta version en el pie sin exponer la ruta privada ni scripts", async () => {
    const respuesta = paginaInicio({
      esquema: 2, versionRige,
      almacen: { ruta: "/temporal/<script>rige.db", versionEsquema: 7 },
    }, undefined, new Date("2026-11-11T12:00:00Z"));
    expect(respuesta.status).toBe(200);
    expect(respuesta.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
    const cuerpo = await respuesta.text();
    expect(cuerpo).toContain('<html lang="es">');
    expect(cuerpo).toContain(`Local · solo lectura · sin red · RIGE ${versionRige}`);
    expect(cuerpo).not.toContain("/temporal/");
    expect(cuerpo).not.toContain("Esquema del almacén");
    expect(cuerpo).not.toContain("<script");
  });
});

describe("W-10", () => {
  test("ofrece el formulario GET y conserva version sin ruta privada", async () => {
    const cuerpo = await paginaInicio({ esquema: 2, versionRige,
      almacen: { ruta: "/temporal/rige.db", versionEsquema: 1 } }, undefined, new Date("2026-11-11T12:00:00Z")).text();
    expect(cuerpo).toContain('<form method="get" action="/resolver">');
    expect(cuerpo).toMatch(/<input[^>]*name="proyecto"[^>]*required/);
    expect(cuerpo.match(/<form\b/g)).toHaveLength(1);
    expect(cuerpo).not.toMatch(/name="(?:agente|clave)"/);
    expect(cuerpo).toContain('>Analizar</button>');
    expect(cuerpo).toContain(`RIGE ${versionRige}`);
    expect(cuerpo).not.toContain("/temporal/rige.db");
    expect(cuerpo).not.toContain("<script");
  });
});

describe("Inicio: ayuda, recientes y contratos visuales", () => {
  const estado = { esquema: 2 as const, versionRige, almacen: { ruta: "/temporal/rige.db", versionEsquema: 2 } };
  const sobre = { id: 7, instante: "2026-11-10T12:00:00Z" };

  test("T5-15 Z-11 ayuda separada y recientes con instante legible, accion principal y tarjeta movil", async () => {
    const cuerpo = await paginaInicio(estado, { esquema: 2, proyectos: [{ proyecto: '/p & "<x>', id: 7, instante: sobre.instante, cantidad: 1 }] }, new Date("2026-11-11T12:00:00Z")).text();
    expect(cuerpo).toContain('id="ayuda-analizar"');
    expect(css("#ayuda-analizar")).toMatch(/margin-top:\s*1rem/);
    const recientes = seccionHtml(cuerpo, "proyectos-recientes");
    expect(recientes).toContain(fechaRelativa(sobre.instante, new Date("2026-11-11T12:00:00Z")));
    expect(recientes).toContain(`datetime="${sobre.instante}"`);
    expect(recientes).toContain('class="reciente__foto" href="/resoluciones/7"');
    expect(recientes).toContain('class="reciente__reanalizar"');
    expect(recientes).toContain("/p &amp; &quot;&lt;x&gt;");
    expect(css(".recientes li")).toMatch(/flex-direction:\s*column/);
    expect(css(".recientes li")).toMatch(/align-items:\s*stretch/);
    expect(cuerpo).not.toContain("<script");
  });

  test("T5-22 B-3 recientes reservan espacio para reanalizar y truncan solo la ruta", async () => {
    const s = await paginaInicio({ esquema: 2, versionRige, almacen: { ruta: "/almacen-privado", versionEsquema: 2 } },
      { esquema: 2, proyectos: [{ proyecto: '/proyecto largo & "prueba"', id: 7, instante: "2026-11-11T12:00:00Z", cantidad: 2 }] }, new Date("2026-11-11T12:00:00Z")).text();
    expect(s).toContain('class="reciente__foto"'); expect(s).toContain('class="reciente__reanalizar"');
    expect(css(".reciente__foto")).toMatch(/min-width:\s*0/);
    expect(css(".reciente__foto")).toMatch(/flex:\s*1 1 0/);
    expect(css(".reciente__reanalizar")).toMatch(/flex-shrink:\s*0/);
    expect(css(".reciente__foto code")).toMatch(/text-overflow:\s*ellipsis/);
  });

  test("G-3 inicio conciso y explicacion larga en detalle cerrado", async () => {
    const cuerpo = await paginaInicio(estado, undefined, new Date("2026-11-11T12:00:00Z")).text();
    expect(cuerpo).not.toContain("De la configuración a la certeza");
    expect(cuerpo).toMatch(/<details[^>]*><summary>¿Qué significa\?<\/summary>/);
    expect(cuerpo).not.toMatch(/<details[^>]*\bopen\b/);
  });

  test("G-6 inicio con carpeta, tarjetas enlazadas y estado sin proyectos", async () => {
    const vacio = await paginaInicio(estado, undefined, new Date("2026-11-11T12:00:00Z")).text();
    expect(vacio).toContain("¿Qué configuración rige en este proyecto?");
    expect(vacio).toContain("Carpeta del proyecto");
    expect(vacio).toContain("Ingresá la carpeta de un proyecto y pulsá Analizar");
    const ahora = new Date(2026, 10, 11, 10, 42);
    const cuerpo = await paginaInicio(estado, { esquema: 2, proyectos: [{ proyecto: '/p/<x>', id: 729, instante: ahora.toISOString(), cantidad: 3 }] }, ahora).text();
    expect(cuerpo).toMatch(/<a class="reciente__foto" href="\/resoluciones\/729">[^]*?<strong>&lt;x&gt;<\/strong>[^]*?<\/a>/);
    expect(cuerpo).toContain("hoy 10:42");
    expect(cuerpo).toContain("3 análisis");
    expect(cuerpo).toContain("Analizar de nuevo");
    expect(cuerpo).not.toMatch(/Resolución 729|<script/);
  });
});
