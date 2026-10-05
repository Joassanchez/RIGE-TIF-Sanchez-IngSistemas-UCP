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
  const hojas = new Map<string, readonly string[]>();
  const objetos = new Set<string>();
  for (const { declaraciones } of lecturas) {
    for (const { ruta, valor } of declaraciones) {
      for (let longitud = 1; longitud < ruta.length; longitud++) objetos.add(JSON.stringify(ruta.slice(0, longitud)));
      const clave = JSON.stringify(ruta);
      if (esObjeto(valor)) objetos.add(clave);
      else hojas.set(clave, ruta);
    }
  }
  const conflictos = [...hojas].filter(([clave]) => objetos.has(clave)).map(([, ruta]) => ruta);
  for (const ruta of conflictos) excluir(ruta, "forma-en-conflicto");
  // Se conocen todos los agentes afectados antes de aplicar cualquier hoja JSON.
  for (const { via } of lecturas) {
    if (via.via !== "markdown") continue;
    if (via.elemento === undefined) throw new Error("Via Markdown sin nombre de elemento");
    excluir(["agent", via.elemento], "markdown-no-observado");
  }
  // Las exclusiones de cualquier archivo afectan todas las lecturas, incluso las anteriores.
  for (const { via, declaraciones } of lecturas) {
    for (const { ruta, valor, posicion } of declaraciones) {
      if (ruta[0] === "mode") {
        if (ruta.length === 1 && !esObjeto(valor)) return { exito: false, error: {
          codigo: "contenido-no-soportado",
          mensaje: `El prototipo v1 no incorpora mode (${via.referencia.replaceAll("\\", "/")}:${posicion.linea}:${posicion.columna}).`,
        } };
        if (ruta.length >= 2) {
          excluir(["agent", ruta[1]!], "fuera-del-v1");
          excluir(ruta.slice(0, 2), "fuera-del-v1");
        }
      }
      if (ruta[0] === "agent" && ruta[2] === "disable") excluir(ruta.slice(0, 2), "fuera-del-v1");
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
      const longitudPrefijo = ["permission", "tools", "instructions", "plugin"].includes(ruta[0]!) ? 1
        : ruta[0] === "agent" && ruta.length >= 3 && ["permission", "tools"].includes(ruta[2]!) ? 3 : 0;
      if (longitudPrefijo) excluir(ruta.slice(0, longitudPrefijo), "fuera-del-v1");
    }
  }
  for (const lectura of lecturas) {
    for (const declaracion of lectura.declaraciones) {
      const { ruta } = declaracion;
      if (esObjeto(declaracion.valor) || [...excluidas.values()].some(prefijo => bajo(ruta, prefijo))) continue;
      aplicaciones.push({ orden: lectura.orden, declaracion, estrategia: "reemplazo", regla: "orden-de-aplicacion" });
    }
  }
  return { exito: true, valor: { aplicaciones, noResueltas } };
}
