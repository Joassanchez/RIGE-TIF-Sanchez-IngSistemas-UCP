import type { CausaRutaRegla, ReglaDeclarada, ResultadoElementosSinUso } from "@rige/nucleo/contrato/adaptador";
import type { Resolucion } from "@rige/nucleo/resolucion/tipos";
import type { ContextoOpenCode } from "./contexto";
import { baseRelativa, raizUnidad } from "./base-relativa";
import { prepararConsulta } from "./objetivo";
import { cadena } from "./cadena";
import { listarAgentes } from "./agentes";
import { permisos } from "./permisos";
import { decidir } from "@rige/nucleo/permisos/decidir";

// Cada rama conserva sus comodines literales: el sufijo opcional se expande
// una sola vez, como en vendor/wildcard, incluso si hay otros " *" anteriores.
function ramas(patron: string): string[] {
  return patron.endsWith(" *") ? [patron, patron.slice(0, -2)] : [patron];
}

function cubreRama(posterior: string, anterior: string): boolean {
  if (posterior === anterior || posterior === "*") return true;
  // Descartar prefijos incompatibles antes de reservar la tabla dinamica.
  // Un literal o ? de B no puede absorber un * de A.
  if (posterior[0] !== "*" && (anterior[0] === "*"
    || (posterior[0] !== "?" && posterior[0] !== anterior[0]))) return false;
  if (!posterior.includes("*") && anterior.includes("*")) return false;
  const ancho = anterior.length + 1;
  const memoria = new Uint8Array((posterior.length + 1) * ancho);
  function cubre(b: number, a: number): boolean {
    const indice = b * ancho + a;
    if (memoria[indice]) return memoria[indice] === 2;
    let resultado: boolean;
    if (b === posterior.length) resultado = a === anterior.length;
    else if (posterior[b] === "*") {
      // Este * puede absorber un token entero de A, incluido un * de A.
      resultado = cubre(b + 1, a) || (a < anterior.length && cubre(b, a + 1));
    } else resultado = a < anterior.length && anterior[a] !== "*"
      && (posterior[b] === "?" || posterior[b] === anterior[a]) && cubre(b + 1, a + 1);
    memoria[indice] = resultado ? 2 : 1;
    return resultado;
  }
  return cubre(0, 0);
}

export function abarca(posterior: string, anterior: string): boolean {
  const b = posterior.replaceAll("\\", "/");
  const a = anterior.replaceAll("\\", "/");
  if (b === "*" || b === a) return true;
  const posteriores = ramas(b);
  return ramas(a).every(rama => posteriores.some(p => cubreRama(p, rama)));
}

export function causaRutaRegla(
  resolucion: Resolucion,
  contexto: ContextoOpenCode,
  regla: ReglaDeclarada,
): CausaRutaRegla | null {
  if (regla.sujeto !== "read" && regla.sujeto !== "edit") return null;
  const { entorno } = contexto;
  const patron = regla.patron.replaceAll("\\", "/");
  if (!entorno.esAbsoluta(patron)) return null;
  // Una raiz sin unidad pertenece a la unidad del proyecto, incluso cuando
  // el proceso de RIGE se ejecuta desde otra unidad (ADR-101).
  const absoluto = entorno.plataforma === "win32" && /^\/(?!\/)/.test(patron)
    ? entorno.unir(raizUnidad(contexto), patron) : entorno.unir(patron);
  const ultimoSeparador = absoluto.replaceAll("\\", "/").lastIndexOf("/");
  if (/[*?]/.test(absoluto.slice(0, ultimoSeparador))) return null;
  const relativa = entorno.relativa(baseRelativa(contexto), absoluto);
  if (relativa === ".." || relativa.startsWith("../") || relativa.startsWith("..\\") || entorno.esAbsoluta(relativa)) return null;
  const diagnostico = { causa: "ruta-absoluta" };
  if (/[*?]/.test(patron)) return diagnostico;
  const consulta = prepararConsulta(contexto, { herramienta: regla.sujeto, objetivo: absoluto });
  if (!consulta.exito) throw new Error(consulta.error.mensaje);
  if (consulta.valor.motivoSinDecision !== null) return diagnostico;
  const formaRelativa = consulta.valor.objetivoEvaluado.replaceAll("\\", "/").replace(/\/+$/, "");
  const agentes = listarAgentes(resolucion, contexto).agentes.filter(a => a.estado === "activo"
    && (regla.agente === null || a.nombre === regla.agente));
  if (!agentes.length) return diagnostico;
  for (const agente of agentes) {
    const original = cadena(resolucion, agente.nombre, contexto);
    if (!original.exito) {
      if (original.error.codigo === "cadena-incompleta") return diagnostico;
      throw new Error(original.error.mensaje);
    }
    const rastro = resolucion.valores.find(v => v.ruta.length === regla.clave.length && v.ruta.every((s, i) => s === regla.clave[i]));
    if (!rastro) throw new Error("Regla sin rastro en la resolucion.");
    let reemplazos = 0;
    const reglas = original.valor.reglas.map(r => {
      // Identificar la declaracion, no el patron: otro bloque puede declarar
      // exactamente el mismo permiso y debe conservar su propia posicion.
      if (r.declaracion !== rastro.determinante) return r;
      reemplazos++;
      return { ...r, patron: formaRelativa };
    });
    if (reemplazos !== 1) return diagnostico;
    const consultaRelativa = { sujeto: regla.sujeto, objetivo: formaRelativa };
    const evaluacion = permisos.evaluar(reglas, regla.sujeto, formaRelativa, entorno.plataforma);
    const decision = decidir({ ...original.valor, reglas }, consultaRelativa, { ...permisos, ...evaluacion });
    if (decision.decision !== regla.efecto) return diagnostico;
  }
  return { causa: "ruta-absoluta-con-forma", parametros: { formaRelativa,
    decision: permisos.plantillas.efectos[regla.efecto]! } };
}

export function elementosSinUso(
  resolucion: Resolucion,
  contexto: ContextoOpenCode,
): ResultadoElementosSinUso {
  const viasUso = [["default_agent"], ["command", "*", "agent"], ["command", "*", "template"],
    ["agent", "*", "prompt"], ["permission", "task"], ["agent", "*", "permission", "task"]];
  const afectaUso = (ruta: readonly string[]) => viasUso.some(via => via.slice(0, Math.min(via.length, ruta.length))
    .every((s, i) => s === "*" || s === ruta[i]));
  const rastros = [...resolucion.valores, ...resolucion.eliminadas];
  const declaraciones = rastros.flatMap(r => [r.determinante, ...r.desplazadas].map(d => ({ ruta: r.ruta, declaracion: d })));
  const incierto = resolucion.noResueltas.some(n => afectaUso(n.ruta))
    || declaraciones.some(d => afectaUso(d.ruta) && d.declaracion.sustituciones?.length);
  if (incierto) return { hallazgos: [], motivos: ["elementos-sin-uso-no-evaluados"] };
  const nombrados = new Set<string>();
  for (const { ruta, declaracion } of declaraciones) {
    if (declaracion.origen.tipo !== "declarado") continue;
    const { valor } = declaracion;
    if ((ruta.length === 1 && ruta[0] === "default_agent")
      || (ruta.length === 3 && ruta[0] === "command" && ruta[2] === "agent")) {
      if (typeof valor === "string") nombrados.add(valor);
    }
    if (ruta.length === 3 && ((ruta[0] === "command" && ruta[2] === "template") || (ruta[0] === "agent" && ruta[2] === "prompt"))) {
      if (typeof valor === "string") for (const token of valor.matchAll(/@(\S+)/g)) {
        // Conservar el nombre completo admite puntos y otros signos internos.
        // Ante puntuacion de cierre, contar tambien la mencion sin ese cierre.
        nombrados.add(token[1]!);
        nombrados.add(token[1]!.replace(/[.,;:!?()\[\]{}<>"'`]+$/, ""));
      }
    }
    const inicio = ruta[0] === "agent" ? 2 : 0;
    if (ruta.length === inicio + 3 && ruta[inicio] === "permission" && ruta[inicio + 1] === "task") nombrados.add(ruta[inicio + 2]!);
  }
  const hallazgos = listarAgentes(resolucion, contexto).agentes.filter(a => a.origen === "declarado"
    && a.estado === "activo" && a.modo === "subagent" && !nombrados.has(a.nombre)).map(agente => {
    const primera = declaraciones.filter(d => d.ruta[0] === "agent" && d.ruta[1] === agente.nombre
      && d.declaracion.origen.tipo === "declarado").toSorted((a, b) => {
      const x = a.declaracion.origen;
      const y = b.declaracion.origen;
      if (x.tipo !== "declarado" || y.tipo !== "declarado") throw new Error("Origen no declarado.");
      return x.orden - y.orden || x.posicion.linea - y.posicion.linea || x.posicion.columna - y.posicion.columna;
    })[0];
    if (!primera || primera.declaracion.origen.tipo !== "declarado") throw new Error("Subagente declarado sin declaracion.");
    const origen = primera.declaracion.origen;
    const entrada = resolucion.entradas.find(e => e.orden === origen.orden);
    if (!entrada || entrada.condicion === "no_observada") throw new Error("Subagente sin entrada observada.");
    const { orden, via, referencia, condicion } = entrada;
    return { tipo: "elemento-sin-uso" as const, causa: "subagente-sin-uso", entrada: { orden, via, referencia, condicion },
      posicion: origen.posicion, clave: primera.ruta, parametros: { agente: agente.nombre } };
  });
  return { hallazgos, motivos: [] };
}
