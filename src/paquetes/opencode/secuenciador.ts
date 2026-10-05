import type { Aplicacion, ClaveNoResuelta, ErrorAnalisis, LecturaEntrada, Secuencia } from "@rige/nucleo/contrato/adaptador";
import type { Resultado } from "@rige/nucleo/resultado";

export function secuenciar(lecturas: readonly LecturaEntrada[]): Resultado<Secuencia, ErrorAnalisis> {
  const aplicaciones: Aplicacion[] = [];
  const noResueltas: ClaveNoResuelta[] = [];
  const excluidas = new Set<string>();
  const agentesMarkdown = new Set<string>();
  // Se conocen todos los agentes afectados antes de aplicar cualquier hoja JSON.
  for (const { via } of lecturas) {
    if (via.via !== "markdown") continue;
    const referencia = via.referencia.replaceAll("\\", "/");
    let inicioNombre = -1;
    let ultimoSegmento = -1;
    for (const segmento of ["/agent/", "/agents/", "/mode/", "/modes/"]) {
      const indice = referencia.lastIndexOf(segmento);
      if (indice > ultimoSegmento) {
        ultimoSegmento = indice;
        inicioNombre = indice + segmento.length;
      }
    }
    if (inicioNombre < 0 || !referencia.endsWith(".md")) throw new Error("Referencia Markdown sin prefijo o extension validos");
    const nombre = referencia.slice(inicioNombre, -3);
    if (!agentesMarkdown.has(nombre)) {
      agentesMarkdown.add(nombre);
      noResueltas.push({ ruta: ["agent", nombre], regla: "markdown-no-observado" });
    }
  }
  for (const lectura of lecturas) {
    for (const declaracion of lectura.declaraciones) {
      const { ruta } = declaracion;
      const noSoportada = ruta[0] === "mode" ? "mode"
        : ruta[0] === "agent" && ruta.length >= 3 && ruta[2] === "disable" ? ruta.slice(0, 3).join(".") : undefined;
      if (noSoportada) {
        const { linea, columna } = declaracion.posicion;
        return { exito: false, error: {
          codigo: "contenido-no-soportado",
          mensaje: `El prototipo v1 no incorpora ${noSoportada} (${lectura.via.referencia.replaceAll("\\", "/")}:${linea}:${columna}).`,
        } };
      }
      if (ruta[0] === "agent" && agentesMarkdown.has(ruta[1]!)) continue;
      const longitudPrefijo = ["permission", "tools", "instructions", "plugin"].includes(ruta[0]!) ? 1
        : ruta[0] === "agent" && ruta.length >= 3 && ["permission", "tools"].includes(ruta[2]!) ? 3 : 0;
      if (longitudPrefijo) {
        const prefijo = ruta.slice(0, longitudPrefijo);
        const clave = JSON.stringify(prefijo);
        if (!excluidas.has(clave)) {
          excluidas.add(clave);
          noResueltas.push({ ruta: prefijo, regla: "fuera-del-v1" });
        }
      } else aplicaciones.push({ orden: lectura.orden, declaracion, estrategia: "reemplazo", regla: "orden-de-aplicacion" });
    }
  }
  return { exito: true, valor: { aplicaciones, noResueltas } };
}
