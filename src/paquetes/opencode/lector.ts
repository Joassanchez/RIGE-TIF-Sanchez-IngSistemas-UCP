import { getNodeValue, type Node } from "jsonc-parser";
import type { ContextoConsulta, Declaracion, ErrorAnalisis, ViaUbicada } from "@rige/nucleo/contrato/adaptador";
import type { EntornoLectura } from "@rige/nucleo/contrato/entorno";
import type { Resultado } from "@rige/nucleo/resultado";
import { expandir, posicion } from "./sustituciones";
export { posicion } from "./sustituciones";

function propiedadesVigentes(nodo: Node): { indice: number; nombre: string; clave: Node; valor: Node }[] {
  const ultimas = new Map<string, number>();
  const hijos = nodo.children ?? [];
  for (const [i, propiedad] of hijos.entries()) {
    ultimas.set(getNodeValue(propiedad.children![0]!) as string, i);
  }
  const vigentes: { indice: number; nombre: string; clave: Node; valor: Node }[] = [];
  for (const [indice, propiedad] of hijos.entries()) {
    const [clave, valor] = propiedad.children!;
    const nombre = getNodeValue(clave!) as string;
    if (ultimas.get(nombre) === indice) vigentes.push({ indice, nombre, clave: clave!, valor: valor! });
  }
  return vigentes;
}

const ACCIONES_PERMISO: readonly unknown[] = ["allow", "ask", "deny"];
const PERMISOS_SOLO_ACCION = new Set(["todowrite", "question", "webfetch", "websearch", "doom_loop"]);

function propiedadAgenteValida(propiedad: string, valor: unknown): boolean {
  switch (propiedad) {
    case "temperature":
    case "top_p":
      return typeof valor === "number" && Number.isFinite(valor);
    case "steps":
      return typeof valor === "number" && Number.isInteger(valor) && valor > 0;
    case "prompt":
    case "description":
    case "model":
    case "color":
      return typeof valor === "string";
    default:
      return true;
  }
}

export function leerEntrada(via: ViaUbicada, textoOriginal: string, entorno: EntornoLectura,
  contexto: Pick<ContextoConsulta, "proyecto" | "parametros">): Resultado<readonly Declaracion[], ErrorAnalisis> {
  const texto = textoOriginal.replace(/^\uFEFF/, "");
  const expansion = expandir(via, texto, entorno, contexto);
  if (!expansion.exito) return expansion;
  const { original, expandido, sustituciones } = expansion.valor;
  const declaraciones: Declaracion[] = [];
  const dentro = (n: Node) => sustituciones.filter(s => n.offset <= s.inicio && s.fin <= n.offset + n.length);
  const enPermiso = (ruta: readonly string[]) => ruta[0] === "permission" || (ruta[0] === "agent" && ruta[2] === "permission");
  const esPermisoRaiz = (ruta: readonly string[]) =>
    (ruta.length === 1 && ruta[0] === "permission") || (ruta.length === 3 && ruta[0] === "agent" && ruta[2] === "permission");
  function accionInvalida(nodo: Node, efectivo: Node): boolean {
    if (nodo.type === "object") return propiedadesVigentes(nodo).some(({ indice, valor }) =>
      accionInvalida(valor, efectivo.children![indice]!.children![1]!));
    if (nodo.type === "array") return true;
    return !ACCIONES_PERMISO.includes(getNodeValue(efectivo));
  }
  function error(codigo: string, nodo: Node): ErrorAnalisis {
    const p = posicion(texto, nodo.offset);
    return { categoria: "uso", codigo,
      mensaje: `Configuración no incorporada en ${via.referencia.replaceAll("\\", "/")} (${p.linea}:${p.columna}).` };
  }
  function errorConfiguracion(ruta: readonly string[], nodo: Node): ErrorAnalisis {
    const p = posicion(texto, nodo.offset);
    return { categoria: "uso", codigo: "configuracion-invalida",
      mensaje: `Configuración inválida en ${ruta.join(".")} (${via.referencia.replaceAll("\\", "/")}:${p.linea}:${p.columna}).` };
  }
  function validarClaves(nodo: Node, ruta: readonly string[]): ErrorAnalisis | undefined {
    if (nodo.type === "array") {
      for (const hijo of nodo.children ?? []) {
        const fallo = validarClaves(hijo, ruta);
        if (fallo) return fallo;
      }
    } else if (nodo.type === "object") {
      for (const { nombre, clave, valor } of propiedadesVigentes(nodo)) {
        if (dentro(clave).length && !enPermiso(ruta)) return error("contenido-no-soportado", clave);
        const fallo = validarClaves(valor, [...ruta, nombre]);
        if (fallo) return fallo;
      }
    }
    return undefined;
  }
  function recorrer(nodo: Node, efectivo: Node, ruta: readonly string[]): ErrorAnalisis | undefined {
    for (const { indice, nombre, clave, valor } of propiedadesVigentes(nodo)) {
      const valorE = efectivo.children![indice]!.children![1]!;
      const rutaHoja = [...ruta, nombre];
      const enClave = dentro(clave);
      const propias = [...enClave, ...dentro(valor)].sort((a, b) => a.inicio - b.inicio);
      if ((rutaHoja.length === 1 && nombre === "permissions")
        || (rutaHoja.length === 3 && rutaHoja[0] === "agent" && nombre === "permissions")) {
        return errorConfiguracion(rutaHoja, clave);
      }
      if (via.via !== "variable-permiso" && esPermisoRaiz(ruta) && PERMISOS_SOLO_ACCION.has(nombre)) {
        const valorAccion = getNodeValue(valorE);
        if (typeof valorAccion !== "string" || !ACCIONES_PERMISO.includes(valorAccion)) {
          return dentro(valor).length && valor.type !== "object" && valor.type !== "array"
            ? error("configuracion-invalida", clave)
            : errorConfiguracion(rutaHoja, clave);
        }
      }
      if (rutaHoja[0] === "agent" && rutaHoja.length === 3) {
        const propiedadAgente = rutaHoja[2]!;
        if (propias.length && (["hidden", "disable"].includes(propiedadAgente) || (propiedadAgente === "mode"
          && !["primary", "subagent", "all"].includes(getNodeValue(valorE))))) return error("configuracion-invalida", clave);
        if (!propiedadAgenteValida(propiedadAgente, getNodeValue(valorE))) return errorConfiguracion(rutaHoja, clave);
      }
      // Una clave sustituida bajo permission es un unico subarbol excluido.
      if (!enClave.length && valor.type === "object" && valor.children?.length) {
        const fallo = recorrer(valor, valorE, rutaHoja);
        if (fallo) return fallo;
      } else {
        if (via.via !== "variable-permiso" && enPermiso(rutaHoja) && accionInvalida(valor, valorE))
          return dentro(valor).length ? error("configuracion-invalida", clave) : errorConfiguracion(rutaHoja, clave);
        const rutaDeclarada = esPermisoRaiz(rutaHoja) && valor.type === "string" ? [...rutaHoja, "*"] : rutaHoja;
        declaraciones.push({ ruta: rutaDeclarada, valor: getNodeValue(valor), posicion: posicion(texto, clave.offset),
          ...(propias.length ? { sustituciones: propias.map(s => s.valor) } : {}) });
      }
    }
    return undefined;
  }
  const prefijo = via.via === "variable-permiso" ? ["permission"] : [];
  const fallo = validarClaves(original, prefijo) ?? recorrer(original, expandido, prefijo);
  return fallo ? { exito: false, error: fallo } : { exito: true, valor: declaraciones };
}
