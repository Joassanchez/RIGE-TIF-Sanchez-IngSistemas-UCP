import type { Aplicacion, ClaveNoResuelta, ErrorAnalisis, LecturaEntrada, Secuencia, ValorJson } from "@rige/nucleo/contrato/adaptador";
import type { Resultado } from "@rige/nucleo/resultado";

const esObjeto = (valor: ValorJson) => valor !== null && typeof valor === "object" && !Array.isArray(valor);
const bajo = (ruta: readonly string[], prefijo: readonly string[]) =>
  prefijo.length <= ruta.length && prefijo.every((segmento, indice) => segmento === ruta[indice]);
const clavesAgente = new Set(["name", "model", "variant", "prompt", "description", "temperature", "top_p",
  "mode", "hidden", "color", "steps", "maxSteps", "options", "permission", "disable", "tools"]);
const sustitucion = /\{(env|file):[^}]*\}/;
function contieneSustitucion(valor: ValorJson): boolean {
  if (typeof valor === "string") return sustitucion.test(valor);
  if (Array.isArray(valor)) return valor.some(contieneSustitucion);
  if (valor !== null && typeof valor === "object") {
    return Object.entries(valor).some(([clave, contenido]) => sustitucion.test(clave) || contieneSustitucion(contenido));
  }
  return false;
}

export function secuenciar(lecturas: readonly LecturaEntrada[]): Resultado<Secuencia, ErrorAnalisis> {
  const aplicaciones: Aplicacion[] = [];
  const noResueltas: ClaveNoResuelta[] = [];
  const excluidas = new Map<string, readonly string[]>();
  function excluir(ruta: readonly string[], regla: string): void {
    const clave = JSON.stringify(ruta);
    if (excluidas.has(clave)) return;
    excluidas.set(clave, ruta);
    noResueltas.push({ ruta, regla });
  }
  // Se conocen todos los agentes afectados antes de aplicar cualquier hoja JSON.
  for (const { via } of lecturas) {
    if (via.via !== "markdown") continue;
    if (via.elemento === undefined) throw new Error("Via Markdown sin nombre de elemento");
    excluir(["agent", via.elemento], "markdown-no-observado");
  }
  for (const { declaraciones } of lecturas) {
    for (const { ruta } of declaraciones) {
      const ambito = ruta[0] === "tools" ? []
        : ruta[0] === "agent" && ruta[2] === "tools" ? ruta.slice(0, 2) : undefined;
      if (ambito) {
        excluir([...ambito, "tools"], "tools-legado-no-incorporado");
        excluir([...ambito, "permission"], "tools-legado-no-incorporado");
      }
    }
  }
  // Las exclusiones de cualquier archivo afectan todas las lecturas, incluso las anteriores.
  for (const { via, declaraciones } of lecturas) {
    for (const { ruta, valor, posicion } of declaraciones) {
      if (ruta[0] === "mode") {
        if (ruta.length === 1 && !esObjeto(valor)) return { exito: false, error: { categoria: "uso",
          codigo: "contenido-no-soportado",
          mensaje: `El prototipo v1 no incorpora mode (${via.referencia.replaceAll("\\", "/")}:${posicion.linea}:${posicion.columna}).`,
        } };
        if (ruta.length >= 2) {
          excluir(["agent", ruta[1]!], "fuera-del-v1");
          excluir(ruta.slice(0, 2), "fuera-del-v1");
        }
      }
      if (ruta[0] === "agent" && ruta[2] === "disable" && (ruta.length !== 3 || typeof valor !== "boolean")) {
        excluir(ruta.slice(0, 2), "fuera-del-v1");
      }
      const indiceSustitucion = ruta.findIndex(segmento => sustitucion.test(segmento));
      if (indiceSustitucion >= 0) excluir(ruta.slice(0, indiceSustitucion + 1), "sustitucion-no-incorporada");
      else if (contieneSustitucion(valor)) excluir(ruta, "sustitucion-no-incorporada");
      if (ruta[0] === "agent" && ruta.length >= 3) {
        if (ruta[2] === "maxSteps") {
          excluir([...ruta.slice(0, 2), "steps"], "fuera-del-v1");
          excluir(ruta.slice(0, 3), "fuera-del-v1");
        }
        if (!clavesAgente.has(ruta[2]!)) {
          excluir(ruta.slice(0, 3), "fuera-del-v1");
          excluir([...ruta.slice(0, 2), "options"], "fuera-del-v1");
        }
      }
      const longitudPrefijo = ["instructions", "plugin"].includes(ruta[0]!) ? 1 : 0;
      if (longitudPrefijo) excluir(ruta.slice(0, longitudPrefijo), "fuera-del-v1");
    }
  }
  const hojas = new Map<string, { readonly ruta: readonly string[]; readonly valor: ValorJson }>();
  for (const lectura of lecturas) {
    for (const declaracion of lectura.declaraciones) {
      const { ruta } = declaracion;
      if ([...excluidas.values()].some(prefijo => bajo(ruta, prefijo))) continue;
      if (ruta[0] === "mode" && ruta.length === 1 && esObjeto(declaracion.valor)) continue;
      const anteriores = [...hojas.values()];
      const descendientes = anteriores.filter(hoja => hoja.ruta.length > ruta.length && bajo(hoja.ruta, ruta));
      // Un objeto vacio se fusiona sin borrar las propiedades de un objeto anterior.
      if (esObjeto(declaracion.valor) && descendientes.length) continue;
      const ancestro = anteriores.find(hoja => hoja.ruta.length < ruta.length && bajo(ruta, hoja.ruta));
      const anterior = hojas.get(JSON.stringify(ruta));
      const cambiaForma = (ancestro !== undefined && !esObjeto(ancestro.valor))
        || (descendientes.length > 0 && !esObjeto(declaracion.valor))
        || (anterior !== undefined && esObjeto(anterior.valor) !== esObjeto(declaracion.valor));
      for (const hoja of anteriores) {
        if (bajo(hoja.ruta, ruta) || bajo(ruta, hoja.ruta)) hojas.delete(JSON.stringify(hoja.ruta));
      }
      hojas.set(JSON.stringify(ruta), { ruta, valor: declaracion.valor });
      aplicaciones.push({ origen: { tipo: "declarado", orden: lectura.orden, posicion: declaracion.posicion },
        ruta, valor: declaracion.valor, estrategia: cambiaForma ? "reemplazoSubarbol" : "reemplazo", regla: "orden-de-aplicacion" });
    }
  }
  // disable se evalua tras fusionar las entradas, como en Agent.list del tag.
  // La propia hoja disable garantiza un rastro aun para un agente sin otras hojas.
  for (const { ruta, valor } of hojas.values()) {
    if (ruta.length !== 3 || ruta[0] !== "agent" || ruta[2] !== "disable" || valor !== true) continue;
    const declaracion = aplicaciones.findLast(a => a.ruta.length === 3 && a.ruta.every((s, i) => s === ruta[i]))!;
    aplicaciones.push({ ...declaracion, ruta: ruta.slice(0, 2), estrategia: "eliminacion", regla: "agente-deshabilitado" });
  }
  return { exito: true, valor: { aplicaciones, noResueltas } };
}
