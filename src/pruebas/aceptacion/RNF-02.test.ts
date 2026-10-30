import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { copiarEscenario } from "../utilidades/escenario";
import { entornoDeReferencia } from "../utilidades/entorno-referencia";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { resumenesExpandidos } from "../../paquetes/opencode/sustituciones-oraculo";
import { resolver } from "../../paquetes/nucleo/resolucion/resolver";
import { consultarAgente } from "../../paquetes/nucleo/resolucion/proyectar";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";

describe("RNF-02 CA-1 T3-04 R-10", () => {
  test("todos los valores por agente coinciden con las referencias nativas, sustituciones solo por resumen", () => {
    const raiz = join(import.meta.dir, "../escenarios");
    for (const nombre of readdirSync(raiz).filter(n => existsSync(join(raiz, n, "REFERENCIA.json")))) {
      const texto = readFileSync(join(raiz, nombre, "REFERENCIA.json"), "utf8");
      const ref = JSON.parse(texto);
      if (ref.procedencia.fallaEsperada) continue;
      if (ref.procedencia.entorno) expect(texto.includes("MARCA-")).toBe(false);
      const copia = copiarEscenario(nombre, { git: ref.procedencia.git ?? "raiz" });
      try {
        const entorno = new EntornoLecturaSistema({ plataforma: process.platform, entorno: entornoDeReferencia(ref, copia) });
        const proyecto = join(copia.raiz, ref.procedencia.directorio);
        const contexto = adaptadorOpenCode.contexto(proyecto, entorno);
        if (!contexto.exito) throw new Error(contexto.error.mensaje);
        const r = resolver(adaptadorOpenCode, proyecto, entorno, contexto.valor);
        if (!r.exito) throw new Error(r.error.mensaje);
        for (const [agente, claves] of Object.entries(ref.valoresAgentes)) for (const [clave, valor] of Object.entries(claves as Record<string, unknown>)) {
          if (clave === "name" && !(claves as { native: boolean }).native) continue;
          const consulta = consultarAgente(r.valor, agente, [clave]);
          if (!consulta.exito) throw new Error(consulta.error.mensaje);
          const rastro = consulta.valor.valores[0]?.rastro;
          if (valor !== null && typeof valor === "object" && "tipo" in valor && valor.tipo === "sustituido") {
            expect(rastro?.determinante.sustituciones?.length).toBeGreaterThan(0);
            const entrada = r.valor.entradas.find(e => e.referencia === rastro!.determinante.referencia)!;
            const texto = entrada.condicion === "definida" ? entorno.variable(entrada.referencia)! : entorno.leer(entrada.referencia).texto;
            const resumen = resumenesExpandidos(entrada, texto, entorno, contexto.valor);
            if (!resumen.exito) throw new Error(resumen.error.mensaje);
            expect<unknown>({ tipo: "sustituido", sha256: resumen.valor[JSON.stringify(rastro!.ruta)] }).toEqual(valor);
          } else expect<unknown>(rastro?.valor).toEqual(valor);
        }
      } finally { copia.borrar(); }
    }
  });
});
