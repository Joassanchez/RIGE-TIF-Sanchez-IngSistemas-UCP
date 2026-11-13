import { describe, expect, test } from "bun:test";
import { dosSegmentos, rutaVisible } from "./rutas";

describe("rutaVisible", () => {
  test("formatea rutas dentro del proyecto como relativas", () => {
    const proyecto = "/srv/dev/mi-app";
    expect(rutaVisible("/srv/dev/mi-app/opencode.json", proyecto)).toBe("./opencode.json");
    expect(rutaVisible("/srv/dev/mi-app/opencode.jsonc", proyecto)).toBe("./opencode.jsonc");
    expect(rutaVisible("/srv/dev/mi-app/.opencode/opencode.json", proyecto)).toBe(".opencode/opencode.json");
    expect(rutaVisible("/srv/dev/mi-app/.opencode/agents/revisor.md", proyecto)).toBe(".opencode/agents/revisor.md");
    expect(rutaVisible("/srv/dev/mi-app", proyecto)).toBe(".");
  });

  test("formatea rutas en ancestros del proyecto dentro del repositorio con ..", () => {
    const proyecto = "/srv/dev/v1-precedencia/proyecto";
    expect(rutaVisible("/srv/dev/v1-precedencia/opencode.json", proyecto, "/home/joa")).toBe("../opencode.json");
    expect(rutaVisible("/srv/dev/opencode.json", proyecto, "/home/joa")).toBe("../../opencode.json");
  });

  test("prefiere relativa al proyecto sobre ~/ cuando el proyecto y el ancestro estan dentro de hogar", () => {
    const hogar = "/home/joa";
    const proyecto = "/home/joa/trabajo/v1-precedencia/proyecto";
    expect(rutaVisible("/home/joa/trabajo/v1-precedencia/opencode.json", proyecto, hogar)).toBe("../opencode.json");
    expect(rutaVisible("/home/joa/trabajo/opencode.json", proyecto, hogar)).toBe("../../opencode.json");
    expect(rutaVisible("/home/joa/.config/opencode/opencode.json", proyecto, hogar)).toBe("~/.config/opencode/opencode.json");
    expect(rutaVisible("/home/joa/opencode.json", proyecto, hogar)).toBe("~/opencode.json");
  });

  test("usa ~/ incluso cuando proyecto esta directamente bajo hogar y no en ancestro mas profundo", () => {
    expect(rutaVisible("/home/joa/.config/opencode/opencode.json", "/home/joa/app", "/home/joa")).toBe(
      "~/.config/opencode/opencode.json",
    );
  });

  test("soporta rutas Windows y normaliza separadores a /", () => {
    const hogar = "C:\\Users\\Joa";
    const proyecto = "C:\\Users\\Joa\\dev\\v1-precedencia\\proyecto";
    expect(rutaVisible("C:\\Users\\Joa\\dev\\v1-precedencia\\proyecto\\opencode.jsonc", proyecto, hogar)).toBe("./opencode.jsonc");
    expect(rutaVisible("C:\\Users\\Joa\\dev\\v1-precedencia\\opencode.json", proyecto, hogar)).toBe("../opencode.json");
    expect(rutaVisible("C:\\Users\\Joa\\.config\\opencode\\opencode.json", proyecto, hogar)).toBe("~/.config/opencode/opencode.json");
    expect(rutaVisible("D:\\externo\\opencode.json", proyecto, hogar)).toBe("D:/externo/opencode.json");
  });

  test("devuelve absoluta normalizada cuando no comparte cercania ni hogar", () => {
    expect(rutaVisible("/etc/opencode/opencode.json", "/srv/app", "/home/joa")).toBe("/etc/opencode/opencode.json");
    expect(rutaVisible("/srv/app/opencode.json", null, null)).toBe("/srv/app/opencode.json");
  });
});

describe("dosSegmentos", () => {
  test("conserva los dos ultimos segmentos con separador /", () => {
    expect(dosSegmentos("/tmp/a/v1-precedencia/proyecto")).toBe("v1-precedencia/proyecto");
    expect(dosSegmentos("C:\\Users\\Joa\\b\\proyecto")).toBe("b/proyecto");
    expect(dosSegmentos("/proyecto")).toBe("proyecto");
    expect(dosSegmentos("/")).toBe("/");
  });
});
