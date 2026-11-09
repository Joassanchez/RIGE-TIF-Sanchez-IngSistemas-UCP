import { describe, expect, test } from "bun:test";
import { politicaStrace } from "./politica-strace";

describe("T5-05 N-3 politica de strace con entradas inyectadas", () => {
  for (const ci of [undefined, "true", "false", "TRUE", "1", ""]) {
    for (const tieneStrace of [true, false]) {
      for (const plataforma of ["linux", "win32"]) {
        test(`${plataforma}, strace=${tieneStrace}, CI=${String(ci)}`, () => {
          const politica = politicaStrace({ plataforma, tieneStrace, ci });
          const accion = plataforma !== "linux" ? "omitir" : tieneStrace ? "ejecutar" : ci === "true" ? "fallar" : "omitir";
          expect(politica.accion).toBe(accion);
          expect(politica.motivo.trim()).not.toBe("");
          if (accion === "fallar") expect(politica.motivo).toMatch(/Linux.*strace.*CI=true/);
          if (accion === "omitir") expect(politica.motivo).toMatch(plataforma === "linux" ? /sin strace/ : /win32/);
        });
      }
    }
  }
});
