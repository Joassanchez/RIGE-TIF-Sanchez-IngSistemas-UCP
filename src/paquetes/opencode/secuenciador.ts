import { acumularSustituciones } from "@rige/nucleo/resolucion/sustituciones";
import type { Aplicacion, ClaveNoResuelta, ErrorAnalisis, LecturaEntrada, Secuencia, ValorJson, ValorSustituidoUbicado } from "@rige/nucleo/contrato/adaptador";
import type { Resultado } from "@rige/nucleo/resultado";
import { valoresNativos } from "./valores-implicitos";

const esObjeto = (valor: ValorJson) => valor !== null && typeof valor === "object" && !Array.isArray(valor);
const bajo = (ruta: readonly string[], prefijo: readonly string[]) =>
  prefijo.length <= ruta.length && prefijo.every((segmento, indice) => segmento === ruta[indice]);
const clavesAgente = new Set(["name", "model", "variant", "prompt", "description", "temperature", "top_p",
  "mode", "hidden", "color", "steps", "maxSteps", "options", "permission", "disable", "tools"]);

export function secuenciar(lecturas: readonly LecturaEntrada[]): Resultado<Secuencia, ErrorAnalisis> {
  const aplicaciones: Aplicacion[] = [];
  const noResueltas: ClaveNoResuelta[] = [];
  const indicesExcluidos = new Map<string, number>();
  const excluidas = new Map<string, readonly string[]>();
  function excluir(ruta: readonly string[], regla: string, sustituciones?: readonly ValorSustituidoUbicado[]): void {
    const clave = JSON.stringify(ruta);
    const indice = indicesExcluidos.get(clave);
    if (indice !== undefined) {
      const anterior = noResueltas[indice]!;
      if (sustituciones?.length) noResueltas[indice] = { ...anterior,
        sustituciones: acumularSustituciones(anterior.sustituciones, sustituciones) };
      return;
    }
    indicesExcluidos.set(clave, noResueltas.length);
    excluidas.set(clave, ruta);
    noResueltas.push({ ruta, regla, ...(sustituciones?.length ? { sustituciones } : {}) });
  }
  // Se conocen todos los agentes afectados antes de aplicar cualquier hoja JSON.
  for (const { via } of lecturas) {
    if (via.via !== "markdown") continue;
    if (via.elemento === undefined) throw new Error("Vía Markdown sin nombre de elemento");
    excluir(via.elemento, "markdown-no-observado");
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
  for (const { via, declaraciones, orden } of lecturas) {
    for (const { ruta, valor, posicion, sustituciones } of declaraciones) {
      if (ruta[0] === "mode") {
        if (ruta.length === 1 && !esObjeto(valor)) return { exito: false, error: { categoria: "uso",
          codigo: "contenido-no-soportado",
          mensaje: `RIGE no incorpora mode (${via.referencia.replaceAll("\\", "/")}:${posicion.linea}:${posicion.columna}).`,
        } };
        if (ruta.length >= 2) {
          excluir(["agent", ruta[1]!], "fuera-del-v1");
          excluir(ruta.slice(0, 2), "fuera-del-v1");
        }
      }
      if (ruta[0] === "agent" && ["mode", "hidden", "disable"].includes(ruta[2] ?? "")
        && !sustituciones?.length) {
        const valido = ruta.length === 3 && (ruta[2] === "mode"
          ? typeof valor === "string" && ["primary", "subagent", "all"].includes(valor) : typeof valor === "boolean");
        if (!valido) return { exito: false, error: { categoria: "uso", codigo: "configuracion-invalida",
          mensaje: `Configuración inválida en ${ruta.slice(0, 3).join(".")} (${via.referencia.replaceAll("\\", "/")}:${posicion.linea}:${posicion.columna}).` } };
      }
      if (sustituciones?.length) {
        const permiso = ruta[0] === "permission" || (ruta[0] === "agent" && ruta[2] === "permission");
        const modo = ruta[0] === "agent" && ruta[2] === "mode";
        if (permiso || modo) excluir(modo ? ruta.slice(0, 2) : ruta, "sustitucion-no-incorporada",
          sustituciones.map(s => ({ ...s, orden, referencia: via.referencia.replaceAll("\\", "/") })));
      }
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
      if (ruta[0] === "agents") {
        excluir(["agents"], "forma-v2-no-incorporada");
        if (ruta.length >= 2) excluir(["agent", ruta[1]!], "forma-v2-no-incorporada");
      }
      if (ruta[0] === "commands") {
        excluir(["commands"], "forma-v2-no-incorporada");
        excluir(["command"], "forma-v2-no-incorporada");
      }
      if (ruta[0] === "model" && (ruta.length >= 2 || esObjeto(valor))) {
        excluir(["model"], "forma-v2-no-incorporada");
      }
    }
  }
  const hojas = new Map<string, { readonly ruta: readonly string[]; readonly valor: ValorJson }>();
  const nombres = new Set([...Object.keys(valoresNativos), ...lecturas.flatMap(l => l.declaraciones
    .filter(d => d.ruta[0] === "agent" && d.ruta.length >= 2).map(d => d.ruta[1]!))]);
  for (const nombre of nombres) {
    const valores = Object.hasOwn(valoresNativos, nombre) ? valoresNativos[nombre]! : { mode: "all", native: false };
    for (const [clave, valor] of Object.entries(valores)) {
      const ruta = ["agent", nombre, clave];
      if ([...excluidas.values()].some(prefijo => bajo(ruta, prefijo))) continue;
      aplicaciones.push({ origen: { tipo: "implicito", regla: "valor-implicito-del-agente" },
        ruta, valor, estrategia: "reemplazo", regla: "valor-implicito-del-agente" });
      hojas.set(JSON.stringify(ruta), { ruta, valor });
    }
  }
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
        ruta, valor: declaracion.valor, estrategia: cambiaForma ? "reemplazoSubarbol" : "reemplazo", regla: "orden-de-aplicacion",
        ...(declaracion.sustituciones?.length ? { sustituciones: declaracion.sustituciones } : {}) });
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
