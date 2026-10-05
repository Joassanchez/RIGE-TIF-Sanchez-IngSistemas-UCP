import type { Adaptador } from "@rige/nucleo/contrato/adaptador";
import { versionSoportada } from "./descriptor";
import { leerEntrada } from "./lector";
import { reglas } from "./reglas";
import { secuenciar } from "./secuenciador";
import { ubicar } from "./ubicador";

export const adaptadorOpenCode: Adaptador = {
  identidad: { herramienta: "opencode", version: versionSoportada },
  prefijoAgente: ["agent"],
  reglas,
  estrategias: {},
  ubicar,
  leer: leerEntrada,
  secuenciar,
};
