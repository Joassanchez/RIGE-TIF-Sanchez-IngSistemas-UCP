import { expect, test } from "bun:test";
import { resolve } from "node:path";
import { crearEntornoAislado } from "../utilidades/entorno-aislado";

const titulos = ["Propósito y versión", "Requisitos previos", "Obtención del código", "Configuración", "Base de datos", "Ejecución", "Usuario de demostración", "Verificación", "Pruebas automatizadas", "Problemas frecuentes", "Terceros e inteligencia artificial"];
const must = ["RF-01", "RF-02", "RF-03", "RF-04", "RF-05", "RF-06", "RF-07", "RF-08", "RF-09", "RF-16", "RF-17", "RNF-01", "RNF-02", "RNF-03", "RNF-04", "RNF-05", "RNF-09", "RNF-10"];

test("T5-07 M-6 manual completo, variables, matriz de 18 Must y declaracion identica", async () => {
  const manual = await Bun.file("MANUAL.md").text();
  expect(Array.from(manual.match(/^## \d+\. .+$/gm) ?? [])).toEqual(titulos.map((t, i) => `## ${i + 1}. ${t}`));
  const ejemplo = await Bun.file("rige.env.example").text();
  const variables = [...ejemplo.matchAll(/^\s*(?:#\s*)?([A-Za-z_][A-Za-z_0-9]*)=/gm)].map(m => m[1]!);
  const tabla = manual.split("## 4. Configuración")[1]!.split("## 5.")[0]!;
  expect(variables.length).toBeGreaterThan(20);
  expect(ejemplo.match(/^[A-Z_]+=.*$/gm)).toEqual(["RIGE_PUERTO=4747", "RIGE_ALMACEN="]);
  expect(tabla).toContain("Solo `RIGE_PUERTO` y `RIGE_ALMACEN`");
  for (const variable of variables) expect(tabla).toContain(`| \`${variable}\` |`);
  expect(tabla).toContain("{env:NOMBRE}");
  const matriz = manual.split("## 8. Verificación")[1]!.split("## 9.")[0]!;
  expect([...matriz.matchAll(/^\| (R[N]?F-\d+) \|/gm)].map(m => m[1])).toEqual(must);
  for (const fila of matriz.split("\n").filter(f => /^\| R[N]?F-/.test(f))) {
    expect(fila.split(/(?<!\\)\|/)).toHaveLength(7);
    expect(fila).toContain(".test.ts");
  }
  const readme = await Bun.file("README.md").text();
  expect(manual.split("## 11. Terceros e inteligencia artificial")[1]).toContain(readme.split("## 8. Declaración de herramientas auxiliares")[1]!.trim());
  expect(readme.split("## 1.")[1]!.split("## 2.")[0]).toContain("MANUAL.md");
});

test("T5-07 M-6 humo documentado como subproceso aislado y con origen normalizado", () => {
  const proceso = Bun.spawnSync([process.execPath, "herramientas/demostracion.ts", "v1-precedencia", "--", "valores", "--agente", "build", "--clave", "temperature"], {
    cwd: resolve(import.meta.dir, "../.."), env: crearEntornoAislado(process.env.HOME!, process.env), stdout: "pipe", stderr: "pipe", timeout: 10000,
  });
  expect(proceso.exitCode).toBe(0);
  expect(proceso.stderr.toString()).toBe("");
  const respuesta = JSON.parse(proceso.stdout.toString());
  expect(respuesta.versionRige).toBe([1, 0, 0].join("."));
  expect(respuesta.esquema).toBe(2);
  expect(respuesta.valores).toHaveLength(1);
  const rastro = respuesta.valores[0].rastro;
  expect(rastro.valor).toBe(0.3);
  expect(rastro.determinante.via).toBe("proyecto");
  expect(rastro.determinante.origen.posicion).toEqual({ linea: 6, columna: 7 });
  const raiz = respuesta.proyecto.replaceAll("\\", "/").replace(/\/proyecto$/, "");
  const normalizar = (ruta: string) => ruta.replaceAll("\\", "/").replace(raiz, "<RAIZ>");
  expect(normalizar(rastro.determinante.referencia)).toBe("<RAIZ>/proyecto/opencode.jsonc");
  expect(rastro.desplazadas.map((d: { valor: number; referencia: string }) => [d.valor, normalizar(d.referencia)]))
    .toEqual([[0.1, "<RAIZ>/opencode.json"], [0.2, "<RAIZ>/proyecto/opencode.json"]]);
  expect(respuesta.entradas.filter((e: { condicion: string }) => e.condicion === "observada")).toHaveLength(3);
});
