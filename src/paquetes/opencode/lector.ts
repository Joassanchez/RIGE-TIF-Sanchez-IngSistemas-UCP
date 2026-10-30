import { getNodeValue, type Node } from "jsonc-parser";
import type { ContextoConsulta, Declaracion, ErrorAnalisis, ViaUbicada } from "@rige/nucleo/contrato/adaptador";
import type { EntornoLectura } from "@rige/nucleo/contrato/entorno";
import type { Resultado } from "@rige/nucleo/resultado";
import { expandir, posicion } from "./sustituciones";
export { posicion } from "./sustituciones";

export function leerEntrada(via: ViaUbicada, texto: string, entorno: EntornoLectura,
  contexto: Pick<ContextoConsulta, "proyecto" | "parametros">): Resultado<readonly Declaracion[], ErrorAnalisis> {
  const expansion = expandir(via, texto, entorno, contexto);
  if (!expansion.exito) return expansion;
  const { original, expandido, sustituciones } = expansion.valor;
  const declaraciones: Declaracion[] = [];
  const dentro = (n: Node) => sustituciones.filter(s => n.offset <= s.inicio && s.fin <= n.offset + n.length);
  const enPermiso = (ruta: readonly string[]) => ruta[0] === "permission" || (ruta[0] === "agent" && ruta[2] === "permission");
  function accionInvalida(nodo: Node, efectivo: Node): boolean {
    if (nodo.type === "object") return (nodo.children ?? []).some((p, i) =>
      accionInvalida(p.children![1]!, efectivo.children![i]!.children![1]!));
    if (nodo.type === "array") return (nodo.children ?? []).some((n, i) => accionInvalida(n, efectivo.children![i]!));
    return dentro(nodo).length > 0 && !["allow", "ask", "deny"].includes(getNodeValue(efectivo));
  }
  function error(codigo: string, nodo: Node): ErrorAnalisis {
    const p = posicion(texto, nodo.offset);
    return { categoria: "uso", codigo,
      mensaje: `Configuración no incorporada en ${via.referencia.replaceAll("\\", "/")} (${p.linea}:${p.columna}).` };
  }
  function validarClaves(nodo: Node, ruta: readonly string[]): ErrorAnalisis | undefined {
    if (nodo.type === "array") {
      for (const hijo of nodo.children ?? []) {
        const fallo = validarClaves(hijo, ruta);
        if (fallo) return fallo;
      }
    } else if (nodo.type === "object") {
      for (const propiedad of nodo.children ?? []) {
        const [clave, valor] = propiedad.children!;
        if (dentro(clave!).length && !enPermiso(ruta)) return error("contenido-no-soportado", clave!);
        const fallo = validarClaves(valor!, [...ruta, getNodeValue(clave!) as string]);
        if (fallo) return fallo;
      }
    }
    return undefined;
  }
  function recorrer(nodo: Node, efectivo: Node, ruta: readonly string[]): ErrorAnalisis | undefined {
    for (const [i, propiedad] of (nodo.children ?? []).entries()) {
      const [clave, valor] = propiedad.children!;
      const valorE = efectivo.children![i]!.children![1]!;
      const rutaHoja = [...ruta, getNodeValue(clave!) as string];
      const enClave = dentro(clave!);
      const propias = [...enClave, ...dentro(valor!)].sort((a, b) => a.inicio - b.inicio);
      if (propias.length && rutaHoja[0] === "agent" && rutaHoja.length === 3) {
        const propiedadAgente = rutaHoja[2];
        if (["hidden", "disable"].includes(propiedadAgente!) || (propiedadAgente === "mode"
          && !["primary", "subagent", "all"].includes(getNodeValue(valorE)))) return error("configuracion-invalida", clave!);
      }
      // Una clave sustituida bajo permission es un unico subarbol excluido.
      if (!enClave.length && valor!.type === "object" && valor!.children?.length) {
        const fallo = recorrer(valor!, valorE, rutaHoja);
        if (fallo) return fallo;
      } else {
        if (enPermiso(rutaHoja) && accionInvalida(valor!, valorE))
          return error("configuracion-invalida", clave!);
        declaraciones.push({ ruta: rutaHoja, valor: getNodeValue(valor!), posicion: posicion(texto, clave!.offset),
          ...(propias.length ? { sustituciones: propias.map(s => s.valor) } : {}) });
      }
    }
    return undefined;
  }
  const prefijo = via.via === "variable-permiso" ? ["permission"] : [];
  const fallo = validarClaves(original, prefijo) ?? recorrer(original, expandido, prefijo);
  return fallo ? { exito: false, error: fallo } : { exito: true, valor: declaraciones };
}
