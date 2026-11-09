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
import { exclusionValor } from "../utilidades/exclusiones-valores";
import { decisionNativa, evidenciaDecision } from "../utilidades/decision-nativa";
import { normalizarRutaTemporal } from "../../herramientas/decisiones-nativas/registro";
import { consultarPermiso } from "../../paquetes/rige/aplicacion/casos-uso/consultar-permiso";
import type { Manifiesto, ConsultaNativa } from "../../herramientas/cobertura";

describe("RNF-02 CA-1 T3-04 R-10 T5-04 W-3", () => {
  test("todos los valores por agente coinciden con las referencias nativas, sustituciones solo por resumen", () => {
    const raiz = join(import.meta.dir, "../escenarios");
    let comparados = 0;
    const excluidos: { escenario: string; agente: string; clave: string; motivo: string }[] = [];
    const descartados: { escenario: string; motivo: string }[] = [];
    for (const nombre of readdirSync(raiz, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name)) {
      if (!existsSync(join(raiz, nombre, "REFERENCIA.json"))) {
        descartados.push({ escenario: nombre, motivo: "sin referencia de valores" }); continue;
      }
      const texto = readFileSync(join(raiz, nombre, "REFERENCIA.json"), "utf8");
      const ref = JSON.parse(texto);
      if (ref.procedencia.fallaEsperada) { descartados.push({ escenario: nombre, motivo: "falla nativa esperada" }); continue; }
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
          const motivo = exclusionValor("RNF-02", nombre, agente, clave);
          if (motivo) { excluidos.push({ escenario: nombre, agente, clave, motivo }); continue; }
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
          comparados++;
        }
      } finally { copia.borrar(); }
    }
    console.info(`W-3 RNF-02 valores comparados=${comparados}, excluidos=${excluidos.length}; descartados=${JSON.stringify(descartados)}; exclusiones=${JSON.stringify(excluidos)}`);
    expect(comparados).toBeGreaterThan(0);
  });
});

describe("RNF-02 CA-2 T5-04 W-2", () => {
  test("publica denominadores por consulta y plataforma; compara decision y determinante, sin atribuir derivaciones al binario", () => {
    const raiz = join(import.meta.dir, "../escenarios");
    const manifiesto = JSON.parse(readFileSync(join(raiz, "MANIFIESTO.json"), "utf8")) as Manifiesto;
    const plataforma = `${process.platform}-${process.arch}`;
    let comparados = 0, coincidentes = 0, derivados = 0, pendientes = 0, noOfrecidas = 0;
    const detalle: { escenario: string; consulta: string; tipo: string; plataforma: string; captura: string | null; documento: string | null }[] = [];
    const subagente = JSON.parse(readFileSync(join(raiz, "v2-subagente/REFERENCIA.json"), "utf8"));
    type Derivada = { escenario?: string; agente: string; sujeto?: string; objetivo?: string; lanzadoPor?: string;
      herramientas?: string[]; objetivos?: string[]; procedencia?: string; oraculo?: { tipo: string; documento: string } };
    for (const escenario of manifiesto.escenarios.filter(e => e.consultas.length)) {
      const ref = escenario.referencia ? JSON.parse(readFileSync(join(raiz, escenario.id, "REFERENCIA.json"), "utf8")) : {};
      const documento = (consulta: ConsultaNativa) => {
        const decisiones: Derivada[] = escenario.id.startsWith("v2-subagente")
          ? subagente.decisiones.filter((d: Derivada) => (d.escenario ?? "v2-subagente") === escenario.id) : ref.decisiones ?? [];
        const derivada = decisiones.find(d => d.agente === consulta.agente && d.lanzadoPor === consulta.lanzadoPor
          && (d.objetivo === consulta.objetivo || d.objetivos?.includes(consulta.objetivo))
          && (d.sujeto === consulta.sujeto || d.herramientas?.includes(consulta.herramienta)));
        if (derivada?.oraculo?.tipo === "derivada") {
          expect(existsSync(join(raiz, derivada.oraculo.documento))).toBe(true);
          return derivada.oraculo.documento;
        }
        return derivada?.procedencia ? `${escenario.id}/REFERENCIA.json#decisiones` : undefined;
      };
      const consultas = escenario.consultas.map(consulta => {
        const evidencia = evidenciaDecision(ref, consulta, documento(consulta));
        detalle.push({ escenario: escenario.id, consulta: consulta.id, ...evidencia });
        return { consulta, evidencia };
      });
      // No se resuelven consultas sin captura utilizable para fabricar una acreditacion.
      const utilizables = consultas.filter(c => c.evidencia.tipo === "captura-nativa");
      derivados += consultas.filter(c => c.evidencia.tipo === "derivacion-documentada").length;
      pendientes += consultas.filter(c => c.evidencia.tipo === "sin-evidencia").length;
      noOfrecidas += consultas.filter(c => c.evidencia.tipo === "herramienta-no-ofrecida").length;
      if (!utilizables.length) continue;
      const copia = copiarEscenario(escenario.id, { git: ref.procedencia.git ?? "raiz" });
      try {
        const entorno = new EntornoLecturaSistema({ plataforma: process.platform, entorno: entornoDeReferencia(ref, copia) });
        const proyecto = join(copia.raiz, ref.procedencia.directorio);
        for (const { consulta } of utilizables) {
          const resultado = consultarPermiso({ adaptador: adaptadorOpenCode, entorno, rutas: { canonica: () => proyecto } }, {
            proyecto, agente: consulta.agente, herramienta: consulta.herramienta,
            objetivo: consulta.objetivo.replaceAll("<RAIZ>", copia.raiz), lanzadoPor: consulta.lanzadoPor, explicar: false,
          });
          if (!resultado.exito) throw new Error(resultado.error.mensaje);
          const respuesta = resultado.valor;
          const nativa = decisionNativa(ref, consulta, respuesta.consulta.objetivoEvaluado!, copia.raiz)!;
          const regla = respuesta.cadena.find(r => r.indice === respuesta.determinante)!;
          const obtenido = { decision: respuesta.decision, regla: { sujeto: regla?.sujeto,
            patron: regla && normalizarRutaTemporal(regla.patron, copia.raiz).replaceAll("\\", "/"), efecto: regla?.efecto } };
          comparados++;
          expect(obtenido, `${escenario.id}/${consulta.id} ${plataforma}`).toEqual(nativa);
          coincidentes++;
        }
      } finally { copia.borrar(); }
    }
    const total = manifiesto.escenarios.reduce((n, e) => n + e.consultas.length, 0);
    console.info(`W-2 ${plataforma}: consultas=${total}, comparados=${comparados}, coincidentes=${coincidentes}, derivados=${derivados}, pendientes=${pendientes}, herramientas no ofrecidas=${noOfrecidas}; ${comparados ? `coincidencia nativa=${coincidentes}/${comparados}` : "sin acreditación nativa en esta plataforma"}; detalle=${JSON.stringify(detalle)}`);
    expect(comparados + derivados + pendientes + noOfrecidas).toBe(total);
    expect(coincidentes).toBe(comparados);
  });
});
