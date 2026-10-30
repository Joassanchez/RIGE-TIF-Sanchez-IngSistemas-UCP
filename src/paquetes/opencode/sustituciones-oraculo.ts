import { getNodeValue, type Node } from "jsonc-parser";
import type { ContextoConsulta, ErrorAnalisis, ViaUbicada } from "@rige/nucleo/contrato/adaptador";
import type { EntornoLectura } from "@rige/nucleo/contrato/entorno";
import type { Resultado } from "@rige/nucleo/resultado";
import { expandir } from "./sustituciones";

/** Uso exclusivo de pruebas y herramientas; nunca devuelve contenido expandido. */
export function resumenesExpandidos(via: ViaUbicada, texto: string, entorno: EntornoLectura,
  contexto: Pick<ContextoConsulta, "proyecto" | "parametros">): Resultado<Readonly<Record<string, string>>, ErrorAnalisis> {
  const expansion = expandir(via, texto, entorno, contexto);
  if (!expansion.exito) return expansion;
  const resumenes: Record<string, string> = {};
  function recorrer(nodo: Node, ruta: readonly string[]): void {
    for (const propiedad of nodo.children ?? []) {
      const [clave, valor] = propiedad.children!;
      const hoja = [...ruta, getNodeValue(clave!) as string];
      if (valor!.type === "object" && valor!.children?.length) recorrer(valor!, hoja);
      else resumenes[JSON.stringify(hoja)] = entorno.resumir(JSON.stringify(getNodeValue(valor!)));
    }
  }
  recorrer(expansion.valor.expandido, via.via === "variable-permiso" ? ["permission"] : []);
  return { exito: true, valor: resumenes };
}
