import type { Adaptador } from "@rige/nucleo/contrato/adaptador";
import { versionSoportada } from "./descriptor";
import { leerEntrada } from "./lector";
import { reglas } from "./reglas";
import { secuenciar } from "./secuenciador";
import { ubicar } from "./ubicador";
import { cadena } from "./cadena";
import { permisos } from "./permisos";
import { prepararConsulta } from "./objetivo";
import { listarAgentes } from "./agentes";
import { contextoOpenCode, type ContextoOpenCode } from "./contexto";

export const adaptadorOpenCode: Adaptador<ContextoOpenCode> = {
  contexto: contextoOpenCode,
  listarAgentes,
  permisos,
  prepararConsulta,
  identidad: { herramienta: "opencode", version: versionSoportada },
  prefijoAgente: ["agent"],
  reglas,
  estrategias: {},
  ubicar,
  leer(via, texto) {
    if (via.via !== "markdown") return leerEntrada(via, texto);
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
