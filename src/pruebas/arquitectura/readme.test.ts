import { expect, test } from "bun:test";

test("D-1 el archivo de lectura tiene las ocho secciones completas y un escenario existente", async () => {
  const raiz = new URL("../../", import.meta.url);
  const readme = await Bun.file(new URL("README.md", raiz)).text();
  expect(readme.match(/^## \d\. .+$/gm)).toEqual([
    "## 1. Identificación",
    "## 2. Qué hace este prototipo",
    "## 3. Requisitos previos",
    "## 4. Instalación",
    "## 5. Configuración",
    "## 6. Ejecución y verificación",
    "## 7. Estado del canal de construcción",
    "## 8. Declaración de herramientas auxiliares",
  ]);
  expect(readme).not.toContain("[DATO PENDIENTE");
  const ejecucion = readme.split("## 6. Ejecución y verificación")[1]!.split("## 7.")[0]!;
  const escenario = /`(pruebas\/escenarios\/[^`]+\/proyecto)`/.exec(ejecucion);
  expect(escenario).not.toBeNull();
  expect(await Bun.file(new URL(`${escenario![1]}/opencode.jsonc`, raiz)).exists()).toBe(true);
  const instalacion = readme.split("## 4. Instalación")[1]!.split("## 5.")[0]!;
  const manifiesto = await Bun.file(new URL("package.json", raiz)).json() as { scripts: Record<string, string> };
  const comandos = [...`${instalacion}\n${ejecucion}`.matchAll(/^\s*bun\s+(.+)$/gm)].map(coincidencia => coincidencia[1]!);
  const scripts = comandos.flatMap(comando => {
    const invocacion = /^(?:--silent\s+)?run\s+(\S+)/.exec(comando);
    if (invocacion) {
      expect(manifiesto.scripts).toHaveProperty(invocacion[1]!);
      return [invocacion[1]!];
    }
    // install y test son comandos del ejecutor, no scripts del proyecto.
    expect(["install --frozen-lockfile", "test"]).toContain(comando.trim());
    return [];
  });
  expect([...new Set(scripts)].sort()).toEqual(Object.keys(manifiesto.scripts).sort());
});
