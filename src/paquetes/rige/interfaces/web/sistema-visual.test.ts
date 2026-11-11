import { describe, expect, test } from "bun:test";
import { estilos } from "./estilos";
import { diseno } from "./diseno";
import { html } from "./plantillas";
import * as textos from "./textos";
import { paginaInicio } from "./paginas/inicio";
import { paginaErrorUso, conErrores } from "./intermedios/errores";
import { conVerificacionDeOrigen } from "./intermedios/origen";
import { versionRige } from "../../aplicacion/respuestas/estado";

const estado = { esquema: 2 as const, versionRige, almacen: { ruta: "/privado/rige.db", versionEsquema: 2 } };
const reglaCss = (selector: string) => [...estilos.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .filter(([, s]) => s!.split(",").some(v => v.trim() === selector)).map(m => m[2]).join("\n");
function contraste(a: string, b: string): number {
  const lineal = (c: number) => {
    const ajustado = c + .055;
    return c <= .04045 ? c / 12.92 : (ajustado / 1.055) ** 2.4;
  };
  const luminancia = (hex: string) => [1, 3, 5].map(i => {
    const canal = parseInt(hex.slice(i, i + 2), 16);
    return lineal(canal / 255);
  })
    .reduce((s, c, i) => s + c * [.2126, .7152, .0722][i]!, 0);
  const l = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  const clara = l[0]! + .05, oscura = l[1]! + .05;
  return clara / oscura;
}

describe("T5-17", () => {
  test("G-1 tokens neutros, sin brillos y contraste AA en ambos temas", () => {
    expect(estilos).not.toMatch(/gradient\(|box-shadow:/);
    const temas = [...estilos.matchAll(/:root\s*\{([^}]+)\}/g)];
    expect(temas).toHaveLength(2);
    for (const [, tema] of temas) {
      const tokens: Record<string, string> = Object.fromEntries([...tema!.matchAll(/--([\w-]+):\s*(#[\da-f]{6})/g)].map(m => [m[1], m[2]]));
      for (const fondo of ["fondo", "superficie", "superficie-suave"]) {
        const rgb = tokens[fondo]!.slice(1).match(/../g)!.map(v => parseInt(v, 16));
        expect(Math.max(...rgb) - Math.min(...rgb)).toBeLessThanOrEqual(2);
        for (const texto of ["texto", "secundario", "acento"]) expect(contraste(tokens[texto]!, tokens[fondo]!)).toBeGreaterThanOrEqual(4.5);
        expect(contraste(tokens["borde-control"]!, tokens[fondo]!)).toBeGreaterThanOrEqual(3);
      }
      for (const tipo of ["exito", "peligro", "aviso", "neutro"])
        expect(contraste(tokens[tipo]!, tokens[`${tipo}-fondo`]!)).toBeGreaterThanOrEqual(4.5);
      expect(contraste(tokens["boton-texto"]!, tokens.acento!)).toBeGreaterThanOrEqual(4.5);
    }
    expect(reglaCss(".aviso--advertencia")).not.toMatch(/var\(--aviso/);
    expect(reglaCss(".estadistica--aviso strong")).not.toMatch(/var\(--aviso/);
  });

  test("G-2 tipografia del sistema, escala de tres niveles y tablas sin mayusculas", () => {
    expect(estilos).toContain('font-family: "Segoe UI", system-ui, -apple-system, Roboto, sans-serif');
    expect(estilos).toContain("line-height: 1.5");
    for (const [selector, tamano] of [["h1", "1.75rem"], ["h2", "1.25rem"], ["h3", "1rem"]])
      expect(reglaCss(selector!)).toContain(`font-size: ${tamano}`);
    expect(estilos).not.toContain("text-transform: uppercase");
    expect(reglaCss("th")).not.toMatch(/monospace/);
  });

  test("G-3 inicio conciso y explicacion larga en detalle cerrado", async () => {
    const cuerpo = await paginaInicio(estado).text();
    expect(cuerpo).not.toContain("De la configuración a la certeza");
    expect(cuerpo).toMatch(/<details[^>]*><summary>¿Qué significa\?<\/summary>/);
    expect(cuerpo).not.toMatch(/<details[^>]*\bopen\b/);
  });

  test("G-4 marca, migas escapadas, ancho legible y pie de una linea", () => {
    const cuerpo = diseno("Valores", html`<h1>Valores</h1>`, { proyecto: '/p/<x>', agente: 'a & b', idResolucion: 7, activa: "Valores", almacen: estado.almacen }).texto;
    const cabecera = cuerpo.match(/<header[^]*?<\/header>/)![0];
    expect(cabecera).toContain('aria-label="Migas de pan"');
    expect(cabecera).toContain("&lt;x&gt;"); expect(cabecera).toContain("a &amp; b");
    expect(cabecera).not.toMatch(/Entradas|Hallazgos|Configuración efectiva|marca__simbolo/);
    const pie = cuerpo.match(/<footer[^]*?<\/footer>/)![0];
    expect(pie).toContain(`Local · solo lectura · sin red · RIGE ${versionRige}`);
    expect(pie).not.toContain("/privado"); expect(pie.match(/<p>/g)).toHaveLength(1);
    expect(reglaCss("main")).toContain("max-width: 1100px");
  });

  test("G-5 ayudantes puros: Windows, POSIX, raices y fechas locales entre dias y anos", () => {
    for (const [ruta, nombre] of [["C:\\uno\\dos\\", "dos"], ["/uno/dos/", "dos"], ["/", "/"], ["C:\\", "C:\\"], ["\\\\servidor\\recurso", "recurso"]])
      expect(textos.nombreProyecto(ruta!)).toBe(nombre!);
    const hoy = new Date(2026, 0, 1, 0, 5), ayer = new Date(2025, 11, 31, 18, 5);
    expect(textos.fechaLocal(hoy.toISOString())).toBe("01/01/2026 00:05");
    expect(textos.fechaRelativa(hoy.toISOString(), hoy)).toBe("hoy 00:05");
    expect(textos.fechaRelativa(ayer.toISOString(), hoy)).toBe("ayer 18:05");
    expect(textos.fechaRelativa(new Date(2025, 11, 30, 10, 42).toISOString(), hoy)).toBe("30/12/2025 10:42");
    expect(textos.fechaRelativa(new Date(2026, 0, 2, 10, 42).toISOString(), hoy)).toBe("02/01/2026 10:42");
    expect(() => textos.fechaLocal("invalida")).toThrow();
  });

  test("G-6 inicio con carpeta, tarjetas enlazadas y estado sin proyectos", async () => {
    const vacio = await paginaInicio(estado).text();
    expect(vacio).toContain("¿Qué configuración rige en este proyecto?");
    expect(vacio).toContain("Carpeta del proyecto");
    expect(vacio).toContain("Ingresá la carpeta de un proyecto y pulsá Analizar");
    const ahora = new Date(); ahora.setHours(10, 42, 0, 0);
    const cuerpo = await paginaInicio(estado, { esquema: 2, proyectos: [{ proyecto: '/p/<x>', id: 729, instante: ahora.toISOString(), cantidad: 3 }] }).text();
    expect(cuerpo).toMatch(/<a class="reciente__foto" href="\/resoluciones\/729">[^]*?<strong>&lt;x&gt;<\/strong>[^]*?<\/a>/);
    expect(cuerpo).toContain("Último análisis:"); expect(cuerpo).toContain("hoy 10:42");
    expect(cuerpo).toContain("3 análisis guardados");
    expect(cuerpo).toContain("Analizar de nuevo");
    expect(cuerpo).not.toMatch(/Resolución 729|<script/);
  });

  test("G-7 errores humanos, rechazo previo sin contexto y 500 fijo", async () => {
    const uso = await paginaErrorUso({ codigo: "proyecto-inexistente", mensaje: "Proyecto inexistente: /p/<x>" }).text();
    expect(uso).toContain("No encontramos el proyecto"); expect(uso).toContain("/p/&lt;x&gt;");
    expect(uso).toContain("Revisá la ruta"); expect(uso).toContain("esta máquina");
    expect(uso).toContain('<small class="codigo-error">proyecto-inexistente</small>');
    let llamadas = 0;
    const manejar = conVerificacionDeOrigen(12345, () => { llamadas++; throw new Error("SECRETO"); });
    for (const [method, headers] of [["GET", { Host: "ajeno" }], ["POST", { Host: "localhost:12345" }]] as const) {
      const rechazo = await manejar(new Request("http://127.0.0.1/privado", { method, headers })).text();
      expect(rechazo).not.toMatch(/Migas de pan|\/privado/); expect(rechazo).not.toContain(versionRige);
    }
    expect(llamadas).toBe(0);
    const interno = await conErrores(() => { throw new Error("SECRETO"); })(new Request("http://127.0.0.1/")).text();
    expect(interno).toContain("Falla interna de RIGE."); expect(interno).toContain("interno"); expect(interno).not.toContain("SECRETO");
  });

  test("G-8 CSS permite contraer tarjetas y migas a 360px y conserva tablas moviles", () => {
    expect(reglaCss(".migas")).toMatch(/flex-wrap:\s*wrap/);
    expect(reglaCss(".reciente__foto")).toMatch(/min-width:\s*0/);
    expect(reglaCss(".reciente__foto")).toMatch(/overflow-wrap:\s*anywhere/);
    expect(estilos).toContain("@media (max-width: 640px)");
    expect(reglaCss(".tabla-tarjetas")).toMatch(/display:\s*block/);
    expect(reglaCss(".tabla-contenedor")).toMatch(/overflow-x:\s*auto/);
  });

  test("G-9 documenta inicio, fechas, migas y comandos de verificacion", async () => {
    for (const archivo of ["README.md", "MANUAL.md"]) {
      const documento = await Bun.file(new URL(`../../../../${archivo}`, import.meta.url)).text();
      for (const texto of ["Carpeta del proyecto", "hoy", "dd/mm/aaaa hh:mm", "migas de pan", "Local · solo lectura · sin red"])
        expect(documento).toContain(texto);
    }
  });
});
