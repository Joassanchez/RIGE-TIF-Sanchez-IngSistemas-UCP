import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join, parse, relative } from "node:path";
import type { Manifiesto } from "../../herramientas/cobertura";
import { normalizarRutaTemporal } from "../../herramientas/decisiones-nativas/registro";
import { compararConCapturaNativa } from "../utilidades/comparacion-nativa";
import { copiarEscenario, type OpcionesEscenario } from "../utilidades/escenario";
import { entornoDeReferencia } from "../utilidades/entorno-referencia";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";
import { consultarPermiso } from "../../paquetes/rige/aplicacion/casos-uso/consultar-permiso";
import { consultarHallazgos } from "../../paquetes/rige/aplicacion/casos-uso/consultar-hallazgos";

const escenarios = join(import.meta.dir, "../escenarios");
const manifiesto = JSON.parse(readFileSync(join(escenarios, "MANIFIESTO.json"), "utf8")) as Manifiesto;
const topologias = [
  { caso: "subdirectorio", prefijo: "subdirectorio", git: "raiz", herramientas: ["read"] },
  { caso: "subdirectorio", prefijo: "subdirectorio-edit", git: "raiz", herramientas: ["edit", "write", "apply_patch"] },
  { caso: "raiz", prefijo: "raiz", git: "proyecto", herramientas: ["read"] },
  { caso: "sin-git", prefijo: "sin-git", git: "ninguno", herramientas: ["read"] },
] as const;
function referencia(id: string) {
  return JSON.parse(readFileSync(join(escenarios, id, "REFERENCIA.json"), "utf8"));
}
function preparar(id: string, git: NonNullable<OpcionesEscenario["git"]>) {
  const copia = copiarEscenario(id, { git });
  const entorno = new EntornoLecturaSistema({ plataforma: process.platform,
    entorno: entornoDeReferencia(referencia(id), copia) });
  const dependencias = { adaptador: adaptadorOpenCode, entorno, rutas: { canonica: () => copia.proyecto } };
  const objetivo = join(copia.proyecto, "sub/a.txt");
  const permiso = (herramienta: string) => {
    const r = consultarPermiso(dependencias, { proyecto: copia.proyecto, agente: "build", herramienta, objetivo, explicar: false });
    if (!r.exito) throw new Error(r.error.mensaje);
    return r.valor;
  };
  const hallazgos = () => {
    const r = consultarHallazgos(dependencias, copia.proyecto);
    if (!r.exito) throw new Error(r.error.mensaje);
    return r.valor.hallazgos;
  };
  return { ...copia, objetivo, permiso, hallazgos };
}

describe("T5-06b A-b1 A-b2 patrones absolutos y formas relativas", () => {
  for (const { caso, prefijo, git, herramientas } of topologias) for (const herramienta of herramientas) {
    test(`${caso} / ${herramienta}: deny, forma exacta, allow y desaparicion del hallazgo`, () => {
      const absoluta = preparar(`v5-worktree-${prefijo}-absoluta`, git);
      const relativa = preparar(`v5-worktree-${prefijo}-relativa`, git);
      try {
        const sujeto = herramienta === "read" ? "read" : "edit";
        const base = git === "raiz" ? absoluta.raiz : git === "proyecto" ? absoluta.proyecto : parse(absoluta.proyecto).root;
        const forma = relative(base, absoluta.objetivo).replaceAll("\\", "/");
        const inicial = absoluta.permiso(herramienta);
        expect(inicial.decision).toBe("deny");
        expect(inicial.cadena.find(r => r.indice === inicial.determinante)).toMatchObject({ sujeto, patron: "*", efecto: "deny" });
        const hallazgo = absoluta.hallazgos().filter(h => h.causa === "ruta-absoluta-con-forma" && h.clave?.includes(sujeto));
        expect(hallazgo).toHaveLength(1);
        expect(hallazgo[0]!.parametros.formaRelativa).toBe(forma);
        const normalizar = (valor: string, raiz: string) => normalizarRutaTemporal(valor, raiz).replaceAll("\\", "/");
        const a = JSON.parse(readFileSync(join(absoluta.proyecto, "opencode.json"), "utf8"));
        const b = JSON.parse(readFileSync(join(relativa.proyecto, "opencode.json"), "utf8"));
        const reglasA = a.permission[sujeto], reglasB = b.permission[sujeto];
        expect(Object.values(reglasB)).toEqual(Object.values(reglasA));
        expect(Object.keys(reglasA)).toHaveLength(2);
        expect(Object.keys(reglasB)).toHaveLength(2);
        expect(Object.keys(reglasA)[0]).toBe("*");
        expect(Object.keys(reglasB)[0]).toBe("*");
        expect(normalizar(Object.keys(reglasB)[1]!, relativa.raiz)).toBe(normalizar(forma, absoluta.raiz));
        // La configuracion completa cambia solamente una clave, en el mismo lugar.
        const control = { ...a, permission: { ...a.permission, [sujeto]: { "*": "deny", [forma]: "allow" } } };
        expect(normalizar(JSON.stringify(b), relativa.raiz)).toBe(normalizar(JSON.stringify(control), absoluta.raiz));
        const final = relativa.permiso(herramienta);
        expect(final.decision).toBe("allow");
        expect(final.cadena.find(r => r.indice === final.determinante)).toMatchObject({ sujeto, efecto: "allow" });
        expect(final.determinante).toBe(inicial.determinante! + 1);
        expect(final.cadena.find(r => r.indice === final.determinante)!.declaracion!.origen)
          .toMatchObject({ tipo: "declarado", posicion: hallazgo[0]!.posicion });
        expect(relativa.hallazgos().filter(h => h.causa.startsWith("ruta-absoluta"))).toEqual([]);
      } finally { absoluta.borrar(); relativa.borrar(); }
    });
  }
});

describe("T5-06b A-b3 A-b4 A-b5 comparacion nativa sin fallback", () => {
  for (const { caso, prefijo, git, herramientas } of topologias) for (const variante of ["absoluta", "relativa"]) {
    const id = `v5-worktree-${prefijo}-${variante}`;
    const escenario = manifiesto.escenarios.find(e => e.id === id);
    if (!escenario) throw new Error(`Escenario ausente: ${id}`);
    for (const herramienta of herramientas) {
      const consulta = escenario.consultas.find(c => c.herramienta === herramienta);
      if (!consulta) throw new Error(`Consulta ausente: ${id}/${herramienta}`);
      for (const plataforma of ["win32-x64", "linux-x64"]) {
        compararConCapturaNativa({ caso, variante, consulta, referencia: referencia(id), plataforma,
          evaluado: caso === "raiz" ? "sub/a.txt" : caso === "subdirectorio" ? "proyecto/sub/a.txt" : "<RAIZ>/proyecto/sub/a.txt",
          ...(plataforma === `${process.platform}-${process.arch}` ? {} : {
            registrar: Object.assign((nombre: string) => test.todo(`${nombre}: ejecutar en su plataforma`, () => {}),
              { todo: (nombre: string) => test.todo(nombre, () => {}) }),
          }),
        }, nativa => {
          const copia = preparar(id, git);
          try {
            expect(nativa.decision).toBe(variante === "absoluta" ? "deny" : "allow");
            const respuesta = copia.permiso(herramienta);
            const regla = respuesta.cadena.find(r => r.indice === respuesta.determinante)!;
            expect({ decision: respuesta.decision, regla: { sujeto: regla.sujeto,
              patron: normalizarRutaTemporal(regla.patron, copia.raiz).replaceAll("\\", "/"), efecto: regla.efecto } }).toEqual(nativa);
            expect(normalizarRutaTemporal(respuesta.consulta.objetivoEvaluado!, copia.raiz).replaceAll("\\", "/"))
              .toBe(caso === "raiz" ? "sub/a.txt" : caso === "subdirectorio" ? "proyecto/sub/a.txt" : "<RAIZ>/proyecto/sub/a.txt");
          } finally { copia.borrar(); }
        });
      }
    }
  }
});
