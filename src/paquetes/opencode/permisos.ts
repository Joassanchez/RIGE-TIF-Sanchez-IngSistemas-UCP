import type { Permisos, EvaluacionPermiso } from "@rige/nucleo/permisos/tipos";
import type { ReglaCadena } from "@rige/nucleo/resolucion/tipos";
import { evaluate, type PermissionV1 } from "./vendor/permiso";
import { match } from "./vendor/wildcard";
import { plantillasExplicacion } from "./reglas";

export function evaluar(reglas: readonly ReglaCadena[], sujeto: string, objetivo: string, plataforma: string): EvaluacionPermiso {
  const nativas: PermissionV1.Ruleset = reglas.map(r => {
    if (r.efecto !== "deny" && r.efecto !== "ask" && r.efecto !== "allow") throw new Error("Efecto de permiso no soportado.");
    return { permission: r.sujeto, pattern: r.patron, action: r.efecto };
  });
  const determinante = evaluate(sujeto, objetivo, plataforma, nativas);
  const posicion = nativas.indexOf(determinante);
  return { determinante: posicion < 0 ? null : reglas[posicion]!.indice,
    coincidentes: reglas.filter(r => match(sujeto, r.sujeto, plataforma) && match(objetivo, r.patron, plataforma)).map(r => r.indice) };
}

export const permisos: Permisos = {
  plantillas: plantillasExplicacion,
  evaluar, ordenEfectos: ["deny", "ask", "allow"], efectoPorDefecto: "ask",
  declaraciones: ["aprobaciones-permanentes-excluidas", "sesion-no-interactiva-excluida", "numeracion-sin-directorios-externos"],
};
