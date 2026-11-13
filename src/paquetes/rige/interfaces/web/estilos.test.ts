import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import { estilos } from "./estilos";

// Regresion del CSS servido, sin simular medidas de un navegador.
function reglas(css: string, selector: string): string {
  return [...css.replace(/\/\*[^]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selectores]) => selectores!.split(",").some(s => s.trim() === selector))
    .map(([, , declaraciones]) => declaraciones).join("\n");
}

describe("T5-10 diseno responsive a 360 y 390 px", () => {
  const movil = estilos.split("@media (max-width: 760px) {")[1]?.split("@media (prefers-reduced-motion")[0] ?? "";

  test("C1 limita la pagina y permite contraer los contenedores y cortar rutas largas", () => {
    for (const selector of ["html", "body"]) {
      expect(reglas(estilos, selector)).toMatch(/overflow-x:\s*clip/);
      expect(reglas(estilos, selector)).toMatch(/max-width:\s*100%/);
    }
    expect(reglas(estilos, "body")).toMatch(/overflow-wrap:\s*anywhere/);
    for (const selector of ["main", ".cabecera__interior", ".contexto", ".selector-agente", ".pie"])
      expect(reglas(estilos, selector)).toMatch(/min-width:\s*0/);
    for (const selector of ["code", ".ruta", ".ruta__segmento", ".ruta__archivo"]) {
      expect(reglas(estilos, selector)).toMatch(/overflow-wrap:\s*anywhere/);
      expect(reglas(estilos, selector)).not.toMatch(/white-space:\s*nowrap/);
    }
  });

  test("C2 mantiene las tablas anchas dentro de un contenedor desplazable", () => {
    const contenedor = reglas(estilos, ".tabla-contenedor");
    expect(contenedor).toMatch(/overflow-x:\s*auto/);
    expect(contenedor).toMatch(/min-width:\s*0/);
    expect(contenedor).toMatch(/max-width:\s*100%/);
  });

  test("C3 apila el encabezado y da a la navegacion su propio desplazamiento", () => {
    expect(movil).not.toBe("");
    expect(reglas(movil, ".cabecera__interior")).toMatch(/flex-direction:\s*column/);
    expect(reglas(movil, "nav")).toMatch(/overflow-x:\s*auto/);
    expect(reglas(movil, "nav")).toMatch(/flex-wrap:\s*nowrap/);
    expect(reglas(movil, "nav a")).toMatch(/flex-shrink:\s*0/);
  });

  test("C4 envuelve la barra de contexto en 8 px y separa los grupos de entradas en 24 px", () => {
    expect(reglas(estilos, ".contexto")).toMatch(/flex-wrap:\s*wrap/);
    expect(reglas(estilos, ".contexto")).toMatch(/gap:[^;]*\.5rem/);
    expect(reglas(estilos, ".grupos-entradas")).toMatch(/gap:\s*1\.5rem/);
    expect(movil).toContain("flex-direction: column");
  });

  test("C5 extiende formularios y botones al ancho disponible en movil", () => {
    for (const selector of ["form", "button", ".boton", ".selector-agente select"])
      expect(reglas(movil, selector)).toMatch(/width:\s*100%/);
    for (const selector of [".selector-agente", ".acciones"])
      expect(reglas(movil, selector)).toMatch(/flex-direction:\s*column/);
  });

  test("C6 usa escala compacta incluso en paginas de error", () => {
    for (const selector of ["h1", ".cabecera-pagina h1", ".pagina-error h1"])
      expect(reglas(estilos, selector)).toMatch(/font-size:\s*1\.75rem/);
    expect(reglas(estilos, "h2")).toMatch(/font-size:\s*1\.25rem/);
    expect(reglas(estilos, "h3")).toMatch(/font-size:\s*1rem/);
  });
});

describe("Sistema visual y tokens (D-3, modificacion de ADR-113)", () => {
  function contraste(a: string, b: string): number {
    const lineal = (c: number) => {
      const ajustado = c + .055;
      return c <= .04045 ? c / 12.92 : (ajustado / 1.055) ** 2.4;
    };
    const luminancia = (hex: string) => [1, 3, 5].map(i => {
      const canal = parseInt(hex.slice(i, i + 2), 16);
      return lineal(canal / 255);
    }).reduce((s, c, i) => s + c * [.2126, .7152, .0722][i]!, 0);
    const l = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
    const clara = l[0]! + .05, oscura = l[1]! + .05;
    return clara / oscura;
  }

  test("G-1 / T6-21 A-1 paleta azul petroleo, tokens en los tres temas y contraste AA (segunda modificacion de ADR-113)", () => {
    expect(estilos).not.toMatch(/gradient\(|box-shadow:/);
    const clarosEsperados: Record<string, string> = {
      fondo: "#f2f7f9", superficie: "#ffffff", "superficie-suave": "#e6f0f3",
      texto: "#132229", secundario: "#4a5e67", borde: "#cfdee4", "borde-control": "#6f8790",
      marca: "#0b6e85", "marca-fuerte": "#075468", "marca-suave": "#dcf0f5",
      cabecera: "#0b6e85", "cabecera-texto": "#ffffff", acento: "#0b6e85",
    };
    const oscurosEsperados: Record<string, string> = {
      fondo: "#0c1a21", superficie: "#12252e", "superficie-suave": "#18323d",
      texto: "#e2eef2", secundario: "#9fb7c0", borde: "#284552", "borde-control": "#6f909b",
      marca: "#4cc3dc", "marca-fuerte": "#82d9eb", "marca-suave": "#123f4b",
      cabecera: "#0a2d38", "cabecera-texto": "#e2eef2", acento: "#4cc3dc",
    };
    const bloques: readonly [string, string | undefined, Record<string, string>][] = [
      ["sistema claro (:root)", estilos.match(/:root\s*\{([^}]+)\}/)?.[1], clarosEsperados],
      ["claro (:root[data-tema=\"claro\"])", estilos.match(/:root\[data-tema="claro"\]\s*\{([^}]+)\}/)?.[1], clarosEsperados],
      ["oscuro (:root[data-tema=\"oscuro\"])", estilos.match(/:root\[data-tema="oscuro"\]\s*\{([^}]+)\}/)?.[1], oscurosEsperados],
      ["sistema oscuro (@media prefers-color-scheme: dark)", estilos.match(/@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root:not\(\[data-tema\]\)\s*\{([^}]+)\}/)?.[1], oscurosEsperados],
    ];
    for (const [nombre, bloque, esperados] of bloques) {
      expect(bloque, nombre).toBeDefined();
      const tokens: Record<string, string> = Object.fromEntries([...bloque!.matchAll(/--([\w-]+):\s*(#[\da-f]{6})/g)].map(m => [m[1]!, m[2]!]));
      for (const [clave, valor] of Object.entries(esperados)) {
        expect(tokens[clave], `${nombre} --${clave}`).toBe(valor);
      }
      expect(tokens.acento, `${nombre} acento = marca`).toBe(tokens.marca);
      for (const fondo of ["fondo", "superficie", "superficie-suave"]) {
        for (const texto of ["texto", "secundario", "marca", "acento"]) {
          expect(contraste(tokens[texto]!, tokens[fondo]!), `${nombre} ${texto}/${fondo}`).toBeGreaterThanOrEqual(4.5);
        }
        expect(contraste(tokens["borde-control"]!, tokens[fondo]!), `${nombre} borde-control/${fondo}`).toBeGreaterThanOrEqual(3);
      }
      for (const texto of ["texto", "marca", "marca-fuerte", "acento"]) {
        expect(contraste(tokens[texto]!, tokens["marca-suave"]!), `${nombre} ${texto}/marca-suave`).toBeGreaterThanOrEqual(4.5);
      }
      expect(contraste(tokens["cabecera-texto"]!, tokens.cabecera!), `${nombre} cabecera`).toBeGreaterThanOrEqual(4.5);
      for (const fondo of ["marca", "marca-fuerte", "acento"]) {
        expect(contraste(tokens["boton-texto"]!, tokens[fondo]!), `${nombre} boton-texto/${fondo}`).toBeGreaterThanOrEqual(4.5);
      }
      expect(contraste(tokens.marca!, tokens.superficie!), `${nombre} marca/superficie`).toBeGreaterThanOrEqual(3);
      for (const tipo of ["exito", "peligro", "aviso", "neutro", "rige", "declarado", "desplazado", "parcial"]) {
        expect(contraste(tokens[tipo]!, tokens[`${tipo}-fondo`]!), `${nombre} ${tipo}/${tipo}-fondo`).toBeGreaterThanOrEqual(4.5);
        for (const fondo of ["fondo", "superficie", "superficie-suave"]) {
          expect(contraste(tokens[tipo]!, tokens[fondo]!), `${nombre} ${tipo}/${fondo}`).toBeGreaterThanOrEqual(4.5);
        }
      }
      expect(contraste(tokens.parcial!, tokens.superficie!)).toBeGreaterThanOrEqual(3);
      expect(contraste(tokens.neutro!, tokens.superficie!)).toBeGreaterThanOrEqual(3);
    }
    expect(reglas(estilos, ".cabecera")).toMatch(/background:\s*var\(--cabecera\)/);
    expect(reglas(estilos, ".marca")).toMatch(/color:\s*var\(--cabecera-texto\)/);
    expect(reglas(estilos, ".migas a")).toMatch(/color:\s*var\(--cabecera-texto\)/);
    expect(reglas(estilos, 'nav a[aria-current="page"]')).toMatch(/background:\s*var\(--marca\)/);
    expect(reglas(estilos, 'nav a[aria-current="page"]')).toMatch(/color:\s*var\(--boton-texto\)/);
    for (const selector of ["button", ".boton"]) {
      expect(reglas(estilos, selector)).toMatch(/background:\s*var\(--marca\)/);
      expect(reglas(estilos, selector)).toMatch(/color:\s*var\(--boton-texto\)/);
    }
    expect(reglas(estilos, ".boton--secundario")).toMatch(/color:\s*var\(--marca\)/);
    expect(reglas(estilos, ".boton--secundario")).toMatch(/border-color:\s*var\(--marca\)/);
    expect(reglas(estilos, "h2")).toMatch(/border-left:\s*3px solid var\(--marca\)/);
    expect(reglas(estilos, ".aviso--advertencia")).toMatch(/var\(--aviso/);
    expect(reglas(estilos, ".estadistica--aviso strong")).not.toMatch(/var\(--aviso/);
  });

  test("T6-10 W-1 y W-4 roles semanticos exclusivos y fila declarada", () => {
    expect(reglas(estilos, ".insignia--rige")).toMatch(/var\(--rige-fondo\)/);
    expect(reglas(estilos, ".insignia--rige")).toMatch(/var\(--rige\)/);
    expect(reglas(estilos, ".insignia--rige")).not.toMatch(/var\(--exito/);
    expect(reglas(estilos, ".insignia--declarado")).toMatch(/var\(--declarado-fondo\)/);
    expect(reglas(estilos, ".insignia--declarado")).toMatch(/var\(--declarado\)/);
    expect(reglas(estilos, ".insignia--desplazado")).toMatch(/var\(--desplazado-fondo\)/);
    expect(reglas(estilos, ".insignia--desplazado")).toMatch(/var\(--desplazado\)/);
    expect(reglas(estilos, ".insignia--parcial")).toMatch(/var\(--parcial-fondo\)/);
    expect(reglas(estilos, ".insignia--parcial")).toMatch(/dotted\s+var\(--parcial\)/);
    expect(reglas(estilos, ".fila--declarado")).toMatch(/border-left:[^;]*var\(--declarado\)/);
  });

  test("G-2 tipografia del sistema, escala de tres niveles y tablas sin mayusculas", () => {
    expect(estilos).toContain('font-family: "Segoe UI", system-ui, -apple-system, Roboto, sans-serif');
    expect(estilos).toContain("line-height: 1.5");
    for (const [selector, tamano] of [["h1", "1.75rem"], ["h2", "1.25rem"], ["h3", "1rem"]])
      expect(reglas(estilos, selector!)).toContain(`font-size: ${tamano}`);
    expect(estilos).not.toContain("text-transform: uppercase");
    expect(reglas(estilos, "th")).not.toMatch(/monospace/);
  });

  test("G-8 CSS permite contraer tarjetas y migas a 360px y conserva tablas moviles", () => {
    expect(reglas(estilos, ".migas")).toMatch(/flex-wrap:\s*wrap/);
    expect(reglas(estilos, ".reciente__foto")).toMatch(/min-width:\s*0/);
    expect(reglas(estilos, ".reciente__foto")).toMatch(/overflow-wrap:\s*anywhere/);
    expect(estilos).toContain("@media (max-width: 640px)");
    expect(reglas(estilos, ".tabla-tarjetas")).toMatch(/display:\s*block/);
    expect(reglas(estilos, ".tabla-contenedor")).toMatch(/overflow-x:\s*auto/);
  });

  test("T5-21 F-5 secundarios de cuerpo menores que el principal", () => {
    expect(estilos).toMatch(/\.boton--secundario\s*\{[^}]*min-height: 36px;[^}]*padding: \.4rem \.7rem;[^}]*font-size: \.875rem/);
    expect(estilos).toMatch(/button, \.boton\s*\{[^}]*min-height: 44px/);
  });

  test("T5-21 ajuste de procedencia: tamano legible y espaciado normal sin heredar el titulo", () => {
    const regla = estilos.match(/\.procedencia\s*\{([^}]+)\}/)![1]!;
    const tamano = Number(regla.match(/font-size:\s*([\d.]+)rem/)![1]);
    expect(tamano).toBeGreaterThanOrEqual(0.8);
    expect(regla).toMatch(/letter-spacing:\s*normal\s*;/);
  });

  test("T5-15 Z-4 insignias enteras", () => {
    expect(reglas(estilos, ".insignia")).toMatch(/white-space:\s*nowrap/);
    expect(reglas(estilos, ".insignia")).toMatch(/overflow-wrap:\s*normal/);
    expect(reglas(estilos, ".tabla-contenedor")).toMatch(/overflow-x:\s*auto/);
  });

  test("U-11 componentes nuevos usan superficies del tema claro y contraste AA", () => {
    for (const selector of [".sujetos-permiso > div", ".hallazgo-resumen"]) {
      expect(reglas(estilos, selector)).toContain("background: var(--superficie)");
      expect(reglas(estilos, selector)).not.toMatch(/#[\da-f]{3,8}/i);
    }
    const claro = estilos.match(/:root\s*\{([^}]+)\}/)![1]!;
    const tokens = Object.fromEntries([...claro.matchAll(/--([\w-]+):\s*(#[\da-f]{6})/g)].map(m => [m[1]!, m[2]!]));
    const luminancia = (hex: string) => [1, 3, 5].map(i => {
      const canal = parseInt(hex.slice(i, i + 2), 16);
      const c = canal / 255, ajustado = c + .055;
      return c <= .04045 ? c / 12.92 : (ajustado / 1.055) ** 2.4;
    }).reduce((s, c, i) => s + c * [.2126, .7152, .0722][i]!, 0);
    for (const [texto, fondo] of [["texto", "superficie"], ["secundario", "fondo"], ["acento", "superficie"], ...["neutro", "exito", "peligro", "aviso"].map(t => [t, `${t}-fondo`])]) {
      const a = luminancia(tokens[texto!]!), b = luminancia(tokens[fondo!]!);
      const clara = Math.max(a, b) + .05, oscura = Math.min(a, b) + .05;
      expect(clara / oscura).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("T6-23 I-4 contraste AA de texto, enlaces y roles sobre fondos de rol en los tres temas", () => {
    const base = estilos.match(/:root\s*\{([^}]+)\}/)![1]!;
    const extraerTokens = (bloque: string) =>
      Object.fromEntries([...bloque.matchAll(/--([\w-]+):\s*(#[\da-f]{6})/g)].map(m => [m[1]!, m[2]!]));
    const baseTokens = extraerTokens(base);
    const luminancia = (hex: string) => [1, 3, 5].map(i => {
      const canal = parseInt(hex.slice(i, i + 2), 16);
      const c = canal / 255, ajustado = c + .055;
      return c <= .04045 ? c / 12.92 : (ajustado / 1.055) ** 2.4;
    }).reduce((s, c, i) => s + c * [.2126, .7152, .0722][i]!, 0);
    const bloquesTema = [...estilos.matchAll(/\{([^{}]*--exito-fondo:[^{}]*)\}/g)].map(m => ({
      ...baseTokens,
      ...extraerTokens(m[1]!),
    }));
    expect(bloquesTema.length).toBeGreaterThanOrEqual(3);
    const pares = [
      ["texto", "exito-fondo"],
      ["texto", "aviso-fondo"],
      ["texto", "peligro-fondo"],
      ["texto", "neutro-fondo"],
      ["texto", "parcial-fondo"],
      ["texto", "marca-suave"],
      ["acento", "exito-fondo"],
      ["acento", "aviso-fondo"],
      ["acento", "peligro-fondo"],
      ["acento", "neutro-fondo"],
      ["acento", "parcial-fondo"],
      ["exito", "exito-fondo"],
      ["aviso", "aviso-fondo"],
      ["peligro", "peligro-fondo"],
      ["neutro", "neutro-fondo"],
      ["parcial", "parcial-fondo"],
      ["boton-texto", "marca"],
    ];
    for (const tokens of bloquesTema) {
      for (const [texto, fondo] of pares) {
        const a = luminancia(tokens[texto!]!), b = luminancia(tokens[fondo!]!);
        const clara = Math.max(a, b) + .05, oscura = Math.min(a, b) + .05;
        expect(clara / oscura, `${texto} sobre ${fondo}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  test("T6-23 I-1 I-2 I-3 hero, recientes, bandas, matriz visual y chips", () => {
    expect(reglas(estilos, ".hero")).toMatch(/background:\s*var\(--marca-suave\)/);
    expect(reglas(estilos, ".recientes li")).toMatch(/border-top:\s*3px solid var\(--marca\)/);
    expect(reglas(estilos, ".banda")).toMatch(/border-top:\s*3px solid var\(--marca\)/);
    expect(reglas(estilos, ".banda")).toMatch(/var\(--superficie-suave\)/);
    expect(reglas(estilos, ".tarjeta--marca")).toMatch(/border-left:\s*3px solid var\(--marca\)/);
    expect(reglas(estilos, ".fila--seleccionada")).toMatch(/var\(--marca-suave\)/);
    expect(reglas(estilos, ".fila--seleccionada")).toMatch(/var\(--marca\)/);
    for (const selector of [".rol--permitida", ".leyenda-chip", ".celda-matriz", ".lista-chips", ".chip"]) {
      expect(reglas(estilos, selector).length).toBeGreaterThan(0);
    }
  });

  test("T5-22 M-5 regresion de CSS vinculada al HTML de matriz, valores y recientes", () => {
    expect(reglas(estilos, ".tabla-matriz .insignia")).toMatch(/white-space:\s*nowrap/);
    expect(reglas(estilos, ".reciente__foto")).toMatch(/min-width:\s*0/);
    expect(reglas(estilos, ".tabla-valores td")).toMatch(/overflow-wrap:\s*anywhere/);
  });

  test("T6-15 WEB-05 WEB-13 matriz compacta, sticky y objetivos tactiles", () => {
    expect(reglas(estilos, ".tabla-matriz td")).toMatch(/min-width:\s*5\.5rem/);
    expect(reglas(estilos, '.tabla-matriz th[scope="row"]')).toMatch(/position:\s*sticky/);
    expect(reglas(estilos, '.tabla-matriz th[scope="row"]')).toMatch(/left:\s*0/);
    for (const selector of [".marca", ".reciente__reanalizar", ".migas a", "summary"])
      expect(reglas(estilos, selector)).toMatch(/min-height:\s*24px/);
    expect(reglas(estilos, ".saltar")).toMatch(/border:/);
    expect(reglas(estilos, ".saltar")).toMatch(/color:/);
  });

  test("T6-16 Y-3 clases emitidas en web coinciden con las definidas en estilos.ts", () => {
    const sinComentarios = estilos.replace(/\/\*[^]*?\*\//g, "");
    const definidas = new Set(
      [...sinComentarios.matchAll(/([^{}@]+)\{[^{}]*\}/g)]
        .flatMap(([, selectores]) => [...selectores!.matchAll(/\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g)].map(m => m[1]!)),
    );
    const directorioWeb = import.meta.dir;
    const archivos: string[] = [];
    for (const entrada of readdirSync(directorioWeb, { withFileTypes: true })) {
      if (entrada.isFile() && entrada.name.endsWith(".ts") && !entrada.name.endsWith(".test.ts")) {
        archivos.push(join(directorioWeb, entrada.name));
      } else if (entrada.isDirectory() && entrada.name === "paginas") {
        for (const sub of readdirSync(join(directorioWeb, "paginas"))) {
          if (sub.endsWith(".ts") && !sub.endsWith(".test.ts")) archivos.push(join(directorioWeb, "paginas", sub));
        }
      }
    }
    const extraerClasesHtml = (codigo: string): string[] => {
      const resultado: string[] = [];
      for (let i = 0; i < codigo.length; i++) {
        if (!codigo.startsWith('class="', i)) continue;
        i += 7;
        let profundidad = 0;
        let actual = "";
        for (; i < codigo.length; i++) {
          if (codigo[i] === "$" && codigo[i + 1] === "{") { profundidad++; i++; actual += " "; continue; }
          if (profundidad > 0) {
            if (codigo[i] === "{") profundidad++;
            else if (codigo[i] === "}") profundidad--;
            else if (codigo[i] === '"' || codigo[i] === "'") {
              const comilla = codigo[i];
              let contenido = "";
              for (i++; i < codigo.length && codigo[i] !== comilla; i++) contenido += codigo[i];
              actual += ` ${contenido} `;
            }
            continue;
          }
          if (codigo[i] === '"') break;
          actual += codigo[i];
        }
        resultado.push(...actual.split(/\s+/).filter(Boolean));
      }
      return resultado;
    };
    const emitidas = new Set<string>();
    const prefijosDinamicos: string[] = [];
    for (const ruta of archivos) {
      for (const token of extraerClasesHtml(readFileSync(ruta, "utf8"))) {
        if (/^(?:insignia--|rol--|fila--)$/.test(token)) prefijosDinamicos.push(token);
        else emitidas.add(token);
      }
    }
    expect(prefijosDinamicos.length).toBeGreaterThan(0);
    for (const clase of emitidas) {
      expect(definidas.has(clase)).toBe(true);
    }
    const modificadoresDinamicos = /^(?:insignia--|rol--|fila--)/;
    for (const clase of definidas) {
      if (modificadoresDinamicos.test(clase)) continue;
      expect(emitidas.has(clase), clase).toBe(true);
    }
  });
});
