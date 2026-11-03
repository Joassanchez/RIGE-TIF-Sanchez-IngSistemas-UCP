import type { Adaptador } from "@rige/nucleo/contrato/adaptador";
import { versionSoportada } from "./descriptor";
import { leerEntrada } from "./lector";
import { reglas, reglasHallazgos, plantillasHallazgo } from "./reglas";
import { secuenciar } from "./secuenciador";
import { ubicar } from "./ubicador";
import { cadena } from "./cadena";
import { permisos } from "./permisos";
import { prepararConsulta } from "./objetivo";
import { listarAgentes } from "./agentes";
import { contextoOpenCode, type ContextoOpenCode } from "./contexto";
import { abarca, causaRutaRegla, elementosSinUso } from "./hallazgos";

export const adaptadorOpenCode: Adaptador<ContextoOpenCode> = {
  referencias: [
    { ruta: ["default_agent"], elemento: "agente", causa: "agente-predeterminado-inexistente" },
    { ruta: ["command", "*", "agent"], elemento: "agente", causa: "agente-comando-inexistente" },
  ],
  plantillasHallazgo,
  abarca,
  causaRutaRegla,
  elementosSinUso,
  contexto: contextoOpenCode,
  listarAgentes,
  permisos,
  prepararConsulta,
  identidad: { herramienta: "opencode", version: versionSoportada },
  prefijoAgente: ["agent"],
  reglas: { ...reglas, ...reglasHallazgos },
  estrategias: {},
  ubicar,
  leer(via, texto, entorno, contexto) {
    if (via.via !== "markdown") return leerEntrada(via, texto, entorno, contexto);
    if (texto.startsWith("---")) {
      const lineas = texto.split(/\r?\n/);
      const cierre = lineas.findIndex((linea, indice) => indice > 0 && linea.trim() === "---");
      if (cierre > 0 && lineas.slice(1, cierre).some(linea => /^\s*name\s*:/.test(linea))) return { exito: false, error: { categoria: "uso",
        codigo: "via-no-soportada", mensaje: `RIGE no incorpora ${via.referencia.replaceAll("\\", "/")}.`,
      } };
    }
    return { exito: true, valor: [] };
  },
  secuenciar,
  cadena,
};
