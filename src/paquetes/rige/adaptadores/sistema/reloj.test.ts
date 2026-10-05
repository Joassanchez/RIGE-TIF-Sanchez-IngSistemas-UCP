import { describe, expect, test } from "bun:test";

describe("RelojSistema", () => {
  test("RelojSistema entrega ISO 8601 UTC del instante actual", async () => {
    const { RelojSistema } = await import("./reloj");
    const antes = Date.now();
    const ahora = new RelojSistema().ahora();
    expect(ahora).toBe(new Date(ahora).toISOString());
    expect(Date.parse(ahora)).toBeGreaterThanOrEqual(antes);
    expect(Date.parse(ahora)).toBeLessThanOrEqual(Date.now());
  });
});
